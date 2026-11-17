import { z } from 'zod'
import { prisma } from '../db.js'
import { HttpError, naoEncontrado } from '../http/erros.js'
import { criarRouter } from '../http/rota.js'
import { idNumerico } from '../http/ids.js'
import { serializarMensagem } from '../http/serializar.js'

const rotas = criarRouter('/mensagens', 'Chat')

rotas.post('/', {
  resumo: 'Enviar mensagem no chat (RF09)',
  auth: 'usuario',
  status: 201,
  body: z.object({
    idDestinatario: idNumerico,
    idAnuncio: idNumerico.optional().describe('Anúncio sobre o qual a conversa acontece'),
    conteudo: z.string().trim().min(1).max(2000),
  }),
  handler: async ({ usuario, body }) => {
    if (body.idDestinatario === usuario.idUsuario) throw new HttpError(400, 'Você não pode enviar mensagens para si mesmo')
    const [destinatario, anuncio] = await Promise.all([
      prisma.usuario.findUnique({ where: { idUsuario: body.idDestinatario }, select: { idUsuario: true, banido: true } }),
      body.idAnuncio
        ? prisma.anuncio.findUnique({ where: { idAnuncio: body.idAnuncio }, select: { idAnuncio: true } })
        : Promise.resolve(true),
    ])
    if (!destinatario || destinatario.banido) throw naoEncontrado('Destinatário')
    if (!anuncio) throw naoEncontrado('Anúncio')

    const mensagem = await prisma.mensagem.create({
      data: {
        conteudo: body.conteudo,
        idRemetente: usuario.idUsuario,
        idDestinatario: body.idDestinatario,
        idAnuncio: body.idAnuncio,
      },
    })
    return serializarMensagem(mensagem)
  },
})

rotas.get('/conversas', {
  resumo: 'Listar conversas do usuário com a última mensagem de cada uma (RF09)',
  auth: 'usuario',
  handler: async ({ usuario }) => {
    const eu = usuario.idUsuario
    const linhas = await prisma.$queryRaw`
      SELECT
        m."idMensagem",
        m."conteudo",
        m."dataEnvio",
        m."idRemetente",
        m."idDestinatario",
        m."idAnuncio",
        u."idUsuario" AS "outroId",
        u."nome" AS "outroNome",
        a."titulo" AS "anuncioTitulo"
      FROM (
        SELECT DISTINCT ON (
          CASE WHEN "idRemetente" = ${eu} THEN "idDestinatario" ELSE "idRemetente" END,
          COALESCE("idAnuncio", 0)
        )
          "idMensagem", "conteudo", "dataEnvio", "idRemetente", "idDestinatario", "idAnuncio"
        FROM "Mensagem"
        WHERE "idRemetente" = ${eu} OR "idDestinatario" = ${eu}
        ORDER BY
          CASE WHEN "idRemetente" = ${eu} THEN "idDestinatario" ELSE "idRemetente" END,
          COALESCE("idAnuncio", 0),
          "dataEnvio" DESC,
          "idMensagem" DESC
      ) m
      JOIN "Usuario" u ON u."idUsuario" = CASE WHEN m."idRemetente" = ${eu} THEN m."idDestinatario" ELSE m."idRemetente" END
      LEFT JOIN "Anuncio" a ON a."idAnuncio" = m."idAnuncio"
      ORDER BY m."dataEnvio" DESC, m."idMensagem" DESC
    `

    return linhas.map((l) => ({
      com: { idUsuario: l.outroId, nome: l.outroNome },
      anuncio: l.idAnuncio && l.anuncioTitulo ? { idAnuncio: l.idAnuncio, titulo: l.anuncioTitulo } : null,
      ultimaMensagem: serializarMensagem(l),
    }))
  },
})

rotas.get('/', {
  resumo: 'Histórico de mensagens com outro usuário (RF09)',
  auth: 'usuario',
  query: z.object({
    com: idNumerico.describe('idUsuario da outra pessoa'),
    anuncio: idNumerico.optional().describe('Filtra pela conversa sobre um anúncio'),
  }),
  handler: async ({ usuario, query }) => {
    const eu = usuario.idUsuario
    const mensagens = await prisma.mensagem.findMany({
      where: {
        OR: [
          { idRemetente: eu, idDestinatario: query.com },
          { idRemetente: query.com, idDestinatario: eu },
        ],
        ...(query.anuncio && { idAnuncio: query.anuncio }),
      },
      orderBy: { dataEnvio: 'asc' },
    })
    return mensagens.map(serializarMensagem)
  },
})

export default rotas
