import { prisma } from '../db.js'
import { naoEncontrado } from '../http/erros.js'
import { criarRouter } from '../http/rota.js'
import { anuncioInclude, serializarAnuncio } from '../http/serializar.js'

const rotas = criarRouter('/favoritos', 'Favoritos')

rotas.get('/', {
  resumo: 'Listar anúncios favoritos (RF12)',
  auth: 'usuario',
  handler: async ({ usuario }) => {
    const favoritos = await prisma.favorito.findMany({
      where: { idUsuario: usuario.idUsuario, anuncio: { status: { in: ['ativo', 'vendido'] } } },
      include: { anuncio: { include: anuncioInclude } },
      orderBy: { dataCriacao: 'desc' },
    })
    return favoritos.map((f) => serializarAnuncio(f.anuncio))
  },
})

rotas.put('/:idAnuncio', {
  resumo: 'Favoritar anúncio (RF12)',
  auth: 'usuario',
  handler: async ({ usuario, params }) => {
    const anuncio = await prisma.anuncio.findUnique({ where: { idAnuncio: params.idAnuncio } })
    if (!anuncio || anuncio.status !== 'ativo') throw naoEncontrado('Anúncio')
    await prisma.favorito.upsert({
      where: { idUsuario_idAnuncio: { idUsuario: usuario.idUsuario, idAnuncio: anuncio.idAnuncio } },
      create: { idUsuario: usuario.idUsuario, idAnuncio: anuncio.idAnuncio },
      update: {},
    })
  },
})

rotas.delete('/:idAnuncio', {
  resumo: 'Remover anúncio dos favoritos (RF12)',
  auth: 'usuario',
  handler: async ({ usuario, params }) => {
    await prisma.favorito.deleteMany({ where: { idUsuario: usuario.idUsuario, idAnuncio: params.idAnuncio } })
  },
})

export default rotas
