import { z } from 'zod'
import { prisma } from '../db.js'
import { HttpError, naoEncontrado } from '../http/erros.js'
import { criarRouter } from '../http/rota.js'
import { idNumerico } from '../http/ids.js'
import { serializarOferta } from '../http/serializar.js'
import { HORAS_VALIDADE_OFERTA, somarHoras } from '../regras.js'

// Propostas de preço (RF08). Fluxo:
//   comprador propõe -> vendedor aceita, recusa ou faz contraproposta -> o comprador responde à contraproposta...
//   Uma proposta aceita vale por 24h e é usada no checkout (POST /pedidos com idOferta).

const rotas = criarRouter('/ofertas', 'Propostas de preço')

const valor = z.number().positive().max(10_000_000)
const ofertaInclude = { anuncio: { select: { idAnuncio: true, titulo: true, preco: true, status: true, idVendedor: true } } }
const formatar = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** Marca como expiradas as propostas vencidas. Executado antes de cada leitura, como em liberarPagamentosVencidos. */
export async function expirarOfertasVencidas(db = prisma) {
  await db.oferta.updateMany({
    where: { status: { in: ['pendente', 'aceita'] }, expiraEm: { lt: new Date() } },
    data: { status: 'expirada' },
  })
}

/** Registra a ação no chat para que a conversa apareça para as duas partes (RF10). */
const avisarNoChat = (tx, { de, para, idAnuncio, conteudo }) =>
  tx.mensagem.create({ data: { idRemetente: de, idDestinatario: para, idAnuncio, conteudo } })

/** Busca uma proposta pendente que o usuário logado pode responder (sempre a parte que não a fez). */
async function ofertaParaResponder(idOferta, usuario) {
  await expirarOfertasVencidas()
  const oferta = await prisma.oferta.findUnique({ where: { idOferta }, include: ofertaInclude })
  if (!oferta) throw naoEncontrado('Proposta')

  const ehParticipante = [oferta.idComprador, oferta.anuncio.idVendedor].includes(usuario.idUsuario)
  if (!ehParticipante) throw naoEncontrado('Proposta')
  if (oferta.idAutor === usuario.idUsuario) throw new HttpError(403, 'Quem responde à proposta é a outra parte da negociação')
  if (oferta.status !== 'pendente') throw new HttpError(409, 'Esta proposta já foi respondida ou expirou.')
  if (oferta.anuncio.status !== 'ativo') throw new HttpError(409, 'O anúncio não está mais disponível')
  return oferta
}

const outraParte = (oferta, usuario) =>
  usuario.idUsuario === oferta.idComprador ? oferta.anuncio.idVendedor : oferta.idComprador

rotas.post('/', {
  resumo: 'Fazer uma proposta de preço em um anúncio (RF08)',
  descricao: 'Substitui a proposta anterior do mesmo comprador neste anúncio. Vale por 24h.',
  auth: 'usuario',
  status: 201,
  body: z.object({ idAnuncio: idNumerico, valor }),
  handler: async ({ usuario, body }) => {
    const anuncio = await prisma.anuncio.findUnique({ where: { idAnuncio: body.idAnuncio } })
    if (!anuncio || anuncio.status !== 'ativo') throw naoEncontrado('Anúncio disponível')
    if (anuncio.idVendedor === usuario.idUsuario) throw new HttpError(400, 'Você não pode fazer proposta no próprio anúncio')
    if (!anuncio.aceitaPropostas) throw new HttpError(409, 'O vendedor não aceita propostas neste anúncio')
    if (body.valor >= Number(anuncio.preco)) throw new HttpError(400, 'A proposta deve ser menor que o preço do anúncio')

    const oferta = await prisma.$transaction(async (tx) => {
      await expirarOfertasVencidas(tx)
      await tx.oferta.updateMany({
        where: { idAnuncio: anuncio.idAnuncio, idComprador: usuario.idUsuario, status: { in: ['pendente', 'aceita'] } },
        data: { status: 'substituida' },
      })
      const criada = await tx.oferta.create({
        data: {
          valor: body.valor,
          expiraEm: somarHoras(new Date(), HORAS_VALIDADE_OFERTA),
          idAnuncio: anuncio.idAnuncio,
          idComprador: usuario.idUsuario,
          idAutor: usuario.idUsuario,
        },
        include: ofertaInclude,
      })
      await avisarNoChat(tx, { de: usuario.idUsuario, para: anuncio.idVendedor, idAnuncio: anuncio.idAnuncio, conteudo: `Fiz uma proposta de ${formatar(body.valor)}.` })
      return criada
    })
    return serializarOferta(oferta)
  },
})

rotas.get('/', {
  resumo: 'Listar propostas em que o usuário é comprador ou vendedor (RF08)',
  auth: 'usuario',
  query: z.object({
    anuncio: idNumerico.optional().describe('Apenas as propostas deste anúncio'),
    com: idNumerico.optional().describe('idUsuario da outra parte da negociação'),
  }),
  handler: async ({ usuario, query }) => {
    await expirarOfertasVencidas()
    const eu = usuario.idUsuario
    const participacao = query.com
      ? [{ idComprador: eu, anuncio: { idVendedor: query.com } }, { idComprador: query.com, anuncio: { idVendedor: eu } }]
      : [{ idComprador: eu }, { anuncio: { idVendedor: eu } }]
    const ofertas = await prisma.oferta.findMany({
      where: { OR: participacao, ...(query.anuncio && { idAnuncio: query.anuncio }) },
      include: ofertaInclude,
      orderBy: { dataCriacao: 'asc' },
    })
    return ofertas.map(serializarOferta)
  },
})

rotas.post('/:id/aceitar', {
  resumo: 'Aceitar uma proposta (RF08)',
  descricao: 'O comprador tem 24h para concluir a compra pelo valor aceito (POST /pedidos com idOferta).',
  auth: 'usuario',
  handler: async ({ usuario, params }) => {
    const oferta = await ofertaParaResponder(params.id, usuario)
    const atualizada = await prisma.$transaction(async (tx) => {
      const resultado = await tx.oferta.update({
        where: { idOferta: oferta.idOferta },
        data: { status: 'aceita', dataResposta: new Date(), expiraEm: somarHoras(new Date(), HORAS_VALIDADE_OFERTA) },
        include: ofertaInclude,
      })
      await avisarNoChat(tx, { de: usuario.idUsuario, para: outraParte(oferta, usuario), idAnuncio: oferta.idAnuncio, conteudo: `Aceitei a proposta de ${formatar(oferta.valor)}.` })
      return resultado
    })
    return serializarOferta(atualizada)
  },
})

rotas.post('/:id/recusar', {
  resumo: 'Recusar uma proposta (RF08)',
  auth: 'usuario',
  handler: async ({ usuario, params }) => {
    const oferta = await ofertaParaResponder(params.id, usuario)
    const atualizada = await prisma.$transaction(async (tx) => {
      const resultado = await tx.oferta.update({
        where: { idOferta: oferta.idOferta },
        data: { status: 'recusada', dataResposta: new Date() },
        include: ofertaInclude,
      })
      await avisarNoChat(tx, { de: usuario.idUsuario, para: outraParte(oferta, usuario), idAnuncio: oferta.idAnuncio, conteudo: `Recusei a proposta de ${formatar(oferta.valor)}.` })
      return resultado
    })
    return serializarOferta(atualizada)
  },
})

rotas.post('/:id/contraproposta', {
  resumo: 'Responder a uma proposta com outro valor (RF08)',
  auth: 'usuario',
  status: 201,
  body: z.object({ valor }),
  handler: async ({ usuario, params, body }) => {
    const oferta = await ofertaParaResponder(params.id, usuario)
    const nova = await prisma.$transaction(async (tx) => {
      await tx.oferta.update({ where: { idOferta: oferta.idOferta }, data: { status: 'substituida', dataResposta: new Date() } })
      const criada = await tx.oferta.create({
        data: {
          valor: body.valor,
          expiraEm: somarHoras(new Date(), HORAS_VALIDADE_OFERTA),
          idAnuncio: oferta.idAnuncio,
          idComprador: oferta.idComprador,
          idAutor: usuario.idUsuario,
        },
        include: ofertaInclude,
      })
      await avisarNoChat(tx, { de: usuario.idUsuario, para: outraParte(oferta, usuario), idAnuncio: oferta.idAnuncio, conteudo: `Fiz uma contraproposta de ${formatar(body.valor)}.` })
      return criada
    })
    return serializarOferta(nova)
  },
})

export default rotas
