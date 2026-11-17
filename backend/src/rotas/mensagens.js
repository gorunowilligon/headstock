import { z } from 'zod'
import { prisma } from '../db.js'
import { HttpError, naoEncontrado } from '../http/erros.js'
import { criarRouter } from '../http/rota.js'
import { idNumerico } from '../http/ids.js'
import { serializarMensagem } from '../http/serializar.js'

const rotas = criarRouter('/mensagens', 'Chat')

const participante = { select: { idUsuario: true, nome: true } }

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
    const mensagens = await prisma.mensagem.findMany({
      where: { OR: [{ idRemetente: eu }, { idDestinatario: eu }] },
      distinct: ['idRemetente', 'idDestinatario', 'idAnuncio'],
      include: { remetente: participante, destinatario: participante, anuncio: { select: { idAnuncio: true, titulo: true } } },
      orderBy: [{ dataEnvio: 'desc' }, { idMensagem: 'desc' }],
    })

    const conversas = new Map()
    for (const m of mensagens) {
      const outro = m.idRemetente === eu ? m.destinatario : m.remetente
      const chave = `${outro.idUsuario}:${m.idAnuncio ?? ''}`
      if (!conversas.has(chave)) {
        conversas.set(chave, { com: outro, anuncio: m.anuncio, ultimaMensagem: serializarMensagem(m) })
      }
    }
    return [...conversas.values()]
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
