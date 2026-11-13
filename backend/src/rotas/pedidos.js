import { z } from 'zod'
import { prisma } from '../db.js'
import { HttpError, naoEncontrado } from '../http/erros.js'
import { criarRouter } from '../http/rota.js'
import { pedidoInclude, serializarAvaliacao, serializarPedido } from '../http/serializar.js'
import { DIAS_UTEIS_PARA_RASTREIO, HORAS_PARA_DISPUTA, TAXA_PLATAFORMA, arredondar, somarDiasUteis, somarHoras } from '../regras.js'
import { cotarFrete } from '../services/frete.js'
import { processarPagamento } from '../services/pagamento.js'
import { buscarPedido, exigirStatus, liberarPagamentosVencidos } from '../services/pedidos.js'
import { recalcularReputacao } from '../services/reputacao.js'

const cep = z.string().trim().regex(/^\d{5}-?\d{3}$/, 'CEP inválido (formato 00000-000)')

async function anuncioAVenda(idAnuncio) {
  const anuncio = await prisma.anuncio.findUnique({ where: { idAnuncio }, include: { instrumento: true } })
  if (!anuncio || anuncio.status !== 'ativo') throw naoEncontrado('Anúncio disponível')
  return anuncio
}

// ---------------------------------------------------------------- Frete

export const rotasFrete = criarRouter('/frete', 'Pedidos')

rotasFrete.post('/cotacao', {
  resumo: 'Cotar frete de um anúncio (RNF07, sandbox)',
  body: z.object({ idAnuncio: z.string().min(1), cepDestino: cep }),
  handler: async ({ body }) => {
    const anuncio = await anuncioAVenda(body.idAnuncio)
    return cotarFrete({ cepDestino: body.cepDestino, categoria: anuncio.instrumento.categoria })
  },
})

// ---------------------------------------------------------------- Pedidos

const rotas = criarRouter('/pedidos', 'Pedidos')

rotas.post('/', {
  resumo: 'Comprar anúncio: checkout com pagamento e frete (RF09, RN01)',
  descricao: 'Pagamento em sandbox: a transação é aprovada na hora e nenhum dado de cartão é enviado. '
    + 'A taxa da plataforma (7%) incide sobre o valor do produto.',
  auth: 'usuario',
  status: 201,
  body: z.object({
    idAnuncio: z.string().min(1),
    metodoPagamento: z.enum(['cartao', 'pix']),
    cepDestino: cep,
  }),
  handler: async ({ usuario, body }) => {
    const anuncio = await anuncioAVenda(body.idAnuncio)
    if (anuncio.idVendedor === usuario.idUsuario) throw new HttpError(400, 'Você não pode comprar o próprio anúncio')

    const frete = cotarFrete({ cepDestino: body.cepDestino, categoria: anuncio.instrumento.categoria })
    const valorProduto = Number(anuncio.preco)
    const valorTotal = arredondar(valorProduto + frete.valor)
    const pagamento = processarPagamento({ metodo: body.metodoPagamento, valor: valorTotal })
    const agora = new Date()

    const pedido = await prisma.$transaction(async (tx) => {
      // Marca como vendido só se ainda estiver ativo: evita duas compras simultâneas.
      const { count } = await tx.anuncio.updateMany({
        where: { idAnuncio: anuncio.idAnuncio, status: 'ativo' },
        data: { status: 'vendido' },
      })
      if (!count) throw new HttpError(409, 'Este anúncio acabou de ser vendido')

      return tx.pedido.create({
        data: {
          valorTotal,
          valorFrete: frete.valor,
          taxaPlataforma: arredondar(valorProduto * TAXA_PLATAFORMA),
          statusPedido: 'pago',
          metodoPagamento: body.metodoPagamento,
          idTransacao: pagamento.idTransacao,
          cepDestino: body.cepDestino,
          dataPagamento: agora,
          prazoRastreio: somarDiasUteis(agora, DIAS_UTEIS_PARA_RASTREIO),
          idComprador: usuario.idUsuario,
          idAnuncio: anuncio.idAnuncio,
        },
        include: pedidoInclude,
      })
    })
    return { pedido: serializarPedido(pedido), pagamento, frete }
  },
})

rotas.get('/', {
  resumo: 'Listar meus pedidos como comprador ou vendedor',
  auth: 'usuario',
  query: z.object({ papel: z.enum(['comprador', 'vendedor']).default('comprador') }),
  handler: async ({ usuario, query }) => {
    await liberarPagamentosVencidos()
    const where = query.papel === 'comprador'
      ? { idComprador: usuario.idUsuario }
      : { anuncio: { idVendedor: usuario.idUsuario } }
    const pedidos = await prisma.pedido.findMany({ where, include: pedidoInclude, orderBy: { dataCriacao: 'desc' } })
    return pedidos.map(serializarPedido)
  },
})

rotas.get('/:id', {
  resumo: 'Detalhar pedido (comprador, vendedor ou administrador)',
  auth: 'usuario',
  handler: async ({ usuario, params }) => serializarPedido(await buscarPedido(params.id, usuario)),
})

const atualizar = async (idPedido, data) =>
  serializarPedido(await prisma.pedido.update({ where: { idPedido }, data, include: pedidoInclude }))

rotas.post('/:id/rastreio', {
  resumo: 'Informar código de rastreio (RN03: até 3 dias úteis após o pagamento)',
  auth: 'usuario',
  body: z.object({ codigoRastreio: z.string().trim().min(5).max(40) }),
  handler: async ({ usuario, params, body }) => {
    const pedido = await buscarPedido(params.id, usuario, 'vendedor')
    exigirStatus(pedido, 'pago')
    return atualizar(pedido.idPedido, { codigoRastreio: body.codigoRastreio, statusPedido: 'enviado', dataEnvio: new Date() })
  },
})

rotas.post('/:id/confirmar-entrega', {
  resumo: 'Confirmar recebimento do item (inicia os prazos da RN02 e RN04)',
  auth: 'usuario',
  handler: async ({ usuario, params }) => {
    const pedido = await buscarPedido(params.id, usuario, 'comprador')
    exigirStatus(pedido, 'enviado')
    return atualizar(pedido.idPedido, { statusPedido: 'entregue', dataEntrega: new Date() })
  },
})

rotas.post('/:id/disputa', {
  resumo: 'Abrir disputa sobre o estado do instrumento (RN04: até 48h após a entrega)',
  auth: 'usuario',
  body: z.object({ motivo: z.string().trim().min(10, 'Descreva o problema com pelo menos 10 caracteres').max(2000) }),
  handler: async ({ usuario, params, body }) => {
    const pedido = await buscarPedido(params.id, usuario, 'comprador')
    exigirStatus(pedido, 'entregue')
    if (new Date() > somarHoras(pedido.dataEntrega, HORAS_PARA_DISPUTA)) {
      throw new HttpError(409, 'O prazo de 48h para abrir disputa terminou (RN04)')
    }
    return atualizar(pedido.idPedido, { statusPedido: 'em_disputa', motivoDisputa: body.motivo })
  },
})

rotas.post('/:id/avaliacoes', {
  resumo: 'Avaliar o vendedor ou o produto, 1 a 5 estrelas (RF11)',
  descricao: 'Disponível ao comprador depois da entrega. Cada pedido aceita uma avaliação de cada tipo. '
    + 'A avaliação do vendedor atualiza a reputação dele e pode suspendê-lo (RN07).',
  auth: 'usuario',
  status: 201,
  body: z.object({
    tipoAvaliacao: z.enum(['vendedor', 'produto']),
    notaEstrelas: z.number().int().min(1).max(5),
    textoJustificativo: z.string().trim().min(3, 'Escreva uma justificativa').max(2000),
  }),
  handler: async ({ usuario, params, body }) => {
    const pedido = await buscarPedido(params.id, usuario, 'comprador')
    exigirStatus(pedido, 'entregue', 'concluido')
    if (pedido.avaliacoes.some((a) => a.tipoAvaliacao === body.tipoAvaliacao)) {
      throw new HttpError(409, `Você já avaliou o ${body.tipoAvaliacao} deste pedido`)
    }

    const avaliacao = await prisma.$transaction(async (tx) => {
      const criada = await tx.avaliacao.create({ data: { ...body, idPedido: pedido.idPedido } })
      if (body.tipoAvaliacao === 'vendedor') await recalcularReputacao(pedido.anuncio.idVendedor, tx)
      return criada
    })
    return serializarAvaliacao(avaliacao)
  },
})

rotas.get('/:id/recibo', {
  resumo: 'Recibo da taxa da plataforma para o vendedor (RN09)',
  descricao: 'Disponível após a conclusão da venda. O envio por e-mail é simulado.',
  auth: 'usuario',
  handler: async ({ usuario, params }) => {
    const pedido = await buscarPedido(params.id, usuario, 'vendedor')
    exigirStatus(pedido, 'concluido')
    const p = serializarPedido(pedido)
    return {
      numero: `HS-${pedido.idPedido.slice(0, 8).toUpperCase()}`,
      emitidoEm: pedido.dataConclusao,
      vendedor: { idUsuario: usuario.idUsuario, nome: usuario.nome, email: usuario.email },
      anuncio: { idAnuncio: pedido.anuncio.idAnuncio, titulo: pedido.anuncio.titulo },
      valorProduto: p.valorProduto,
      percentualTaxa: TAXA_PLATAFORMA * 100,
      taxaPlataforma: p.taxaPlataforma,
      valorRepasseVendedor: p.valorRepasseVendedor,
    }
  },
})

export default rotas
