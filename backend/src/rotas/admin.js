import { z } from 'zod'
import { prisma } from '../db.js'
import { HttpError, naoEncontrado } from '../http/erros.js'
import { criarRouter } from '../http/rota.js'
import { pedidoInclude, serializarDenuncia, serializarPedido, serializarUsuarioPrivado } from '../http/serializar.js'

// O gerenciamento do catálogo mestre (RF14) fica em /instrumentos.
const rotas = criarRouter('/admin', 'Administração')

// ---------------------------------------------------------------- Denúncias

rotas.get('/denuncias', {
  resumo: 'Fila de denúncias para moderação',
  auth: 'admin',
  query: z.object({ status: z.enum(['aberta', 'em_analise', 'resolvida', 'descartada']).optional() }),
  handler: async ({ query }) => {
    const denuncias = await prisma.denuncia.findMany({
      where: query.status ? { status: query.status } : {},
      include: {
        autor: { select: { idUsuario: true, nome: true } },
        anuncio: { select: { idAnuncio: true, titulo: true, status: true } },
        usuarioDenunciado: { select: { idUsuario: true, nome: true, banido: true } },
        mensagem: { select: { idMensagem: true, conteudo: true, idRemetente: true } },
      },
      orderBy: { dataCriacao: 'asc' },
    })
    return denuncias.map((d) => ({
      ...serializarDenuncia(d),
      autor: d.autor,
      anuncio: d.anuncio,
      usuarioDenunciado: d.usuarioDenunciado,
      mensagem: d.mensagem,
    }))
  },
})

rotas.patch('/denuncias/:id', {
  resumo: 'Analisar denúncia (status e resolução)',
  auth: 'admin',
  body: z.object({
    status: z.enum(['em_analise', 'resolvida', 'descartada']),
    resolucao: z.string().trim().max(2000).optional(),
  }),
  handler: async ({ usuario, params, body }) => {
    const existe = await prisma.denuncia.findUnique({ where: { idDenuncia: params.id } })
    if (!existe) throw naoEncontrado('Denúncia')
    const denuncia = await prisma.denuncia.update({
      where: { idDenuncia: params.id },
      data: { ...body, idAdministrador: usuario.idUsuario },
    })
    return serializarDenuncia(denuncia)
  },
})

// ---------------------------------------------------------------- Moderação (RF15)

rotas.post('/anuncios/:id/remover', {
  resumo: 'Remover anúncio irregular (RF15)',
  auth: 'admin',
  handler: async ({ params }) => {
    const anuncio = await prisma.anuncio.findUnique({ where: { idAnuncio: params.id } })
    if (!anuncio) throw naoEncontrado('Anúncio')
    await prisma.anuncio.update({ where: { idAnuncio: anuncio.idAnuncio }, data: { status: 'removido' } })
  },
})

rotas.post('/usuarios/:id/banimento', {
  resumo: 'Banir ou desbanir usuário (RF15)',
  descricao: 'Ao banir, os anúncios ativos do usuário são pausados e ele perde o acesso à conta.',
  auth: 'admin',
  body: z.object({ banido: z.boolean() }),
  handler: async ({ params, body }) => {
    const alvo = await prisma.usuario.findUnique({ where: { idUsuario: params.id } })
    if (!alvo) throw naoEncontrado('Usuário')
    if (alvo.tipo === 'administrador') throw new HttpError(400, 'Administradores não podem ser banidos')

    const [usuario] = await prisma.$transaction([
      prisma.usuario.update({ where: { idUsuario: alvo.idUsuario }, data: { banido: body.banido } }),
      ...(body.banido
        ? [prisma.anuncio.updateMany({ where: { idVendedor: alvo.idUsuario, status: 'ativo' }, data: { status: 'pausado' } })]
        : []),
    ])
    return serializarUsuarioPrivado(usuario)
  },
})

// ---------------------------------------------------------------- Disputas (RF16)

rotas.get('/disputas', {
  resumo: 'Pedidos em disputa aguardando resolução (RF16)',
  auth: 'admin',
  handler: async () => {
    const pedidos = await prisma.pedido.findMany({
      where: { statusPedido: { in: ['em_disputa', 'devolucao_autorizada'] } },
      include: pedidoInclude,
      orderBy: { dataCriacao: 'asc' },
    })
    return pedidos.map(serializarPedido)
  },
})

const ACOES = {
  cancelar_venda: { de: ['pago', 'enviado', 'em_disputa'], para: 'cancelado' },
  autorizar_devolucao: { de: ['em_disputa'], para: 'devolucao_autorizada' },
  estornar: { de: ['em_disputa', 'devolucao_autorizada'], para: 'reembolsado' },
  manter_venda: { de: ['em_disputa'], para: 'concluido' },
}

rotas.post('/pedidos/:id/resolucao', {
  resumo: 'Resolver disputa: cancelar venda, autorizar devolução, estornar ou manter a venda (RF16)',
  descricao: 'Estornos são simulados (sandbox). Ao cancelar uma venda ainda não enviada, o anúncio volta a ficar ativo.',
  auth: 'admin',
  body: z.object({
    acao: z.enum(Object.keys(ACOES)),
    observacao: z.string().trim().max(2000).optional(),
  }),
  handler: async ({ params, body }) => {
    const pedido = await prisma.pedido.findUnique({ where: { idPedido: params.id } })
    if (!pedido) throw naoEncontrado('Pedido')
    const { de, para } = ACOES[body.acao]
    if (!de.includes(pedido.statusPedido)) {
      throw new HttpError(409, `A ação "${body.acao}" não se aplica a pedidos "${pedido.statusPedido}"`)
    }

    const reativarAnuncio = body.acao === 'cancelar_venda' && pedido.statusPedido === 'pago'
    const resultados = await prisma.$transaction([
      ...(reativarAnuncio
        ? [prisma.anuncio.update({ where: { idAnuncio: pedido.idAnuncio }, data: { status: 'ativo' } })]
        : []),
      prisma.pedido.update({
        where: { idPedido: pedido.idPedido },
        data: {
          statusPedido: para,
          resolucaoDisputa: body.observacao ?? body.acao,
          ...(para === 'concluido' && { dataConclusao: new Date() }),
        },
        include: pedidoInclude,
      }),
    ])
    return serializarPedido(resultados.at(-1))
  },
})

export default rotas
