import { z } from 'zod'
import { prisma } from '../db.js'
import { HttpError, naoEncontrado } from '../http/erros.js'
import { criarRouter } from '../http/rota.js'
import { serializarDenuncia } from '../http/serializar.js'

const rotas = criarRouter('/denuncias', 'Denúncias')

rotas.post('/', {
  resumo: 'Denunciar anúncio, perfil ou mensagem do chat (RF13)',
  descricao: 'Informe exatamente um alvo: idAnuncio, idUsuarioDenunciado ou idMensagem.',
  auth: 'usuario',
  status: 201,
  body: z.object({
    motivo: z.string().trim().min(3).max(100),
    descricaoTextual: z.string().trim().min(5, 'Descreva o problema').max(2000),
    idAnuncio: z.string().min(1).optional(),
    idUsuarioDenunciado: z.string().min(1).optional(),
    idMensagem: z.string().min(1).optional(),
  }).refine(
    (d) => [d.idAnuncio, d.idUsuarioDenunciado, d.idMensagem].filter(Boolean).length === 1,
    { message: 'Informe exatamente um alvo: idAnuncio, idUsuarioDenunciado ou idMensagem', path: ['idAnuncio'] },
  ),
  handler: async ({ usuario, body }) => {
    if (body.idAnuncio && !(await prisma.anuncio.findUnique({ where: { idAnuncio: body.idAnuncio } }))) {
      throw naoEncontrado('Anúncio')
    }
    if (body.idUsuarioDenunciado) {
      if (body.idUsuarioDenunciado === usuario.idUsuario) throw new HttpError(400, 'Você não pode denunciar a si mesmo')
      if (!(await prisma.usuario.findUnique({ where: { idUsuario: body.idUsuarioDenunciado } }))) throw naoEncontrado('Usuário')
    }
    if (body.idMensagem) {
      const mensagem = await prisma.mensagem.findUnique({ where: { idMensagem: body.idMensagem } })
      if (!mensagem || ![mensagem.idRemetente, mensagem.idDestinatario].includes(usuario.idUsuario)) {
        throw naoEncontrado('Mensagem')
      }
    }

    const denuncia = await prisma.denuncia.create({ data: { ...body, idAutor: usuario.idUsuario } })
    return serializarDenuncia(denuncia)
  },
})

rotas.get('/minhas', {
  resumo: 'Denúncias feitas pelo usuário logado',
  auth: 'usuario',
  handler: async ({ usuario }) => {
    const denuncias = await prisma.denuncia.findMany({ where: { idAutor: usuario.idUsuario }, orderBy: { dataCriacao: 'desc' } })
    return denuncias.map(serializarDenuncia)
  },
})

export default rotas
