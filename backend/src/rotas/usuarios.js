import { z } from 'zod'
import { prisma } from '../db.js'
import { naoEncontrado } from '../http/erros.js'
import { criarRouter } from '../http/rota.js'
import { anuncioInclude, serializarAnuncio, serializarAvaliacao, serializarUsuarioPrivado, serializarUsuarioPublico } from '../http/serializar.js'

const rotas = criarRouter('/usuarios', 'Usuários')

rotas.get('/me', {
  resumo: 'Dados do usuário logado',
  auth: 'usuario',
  handler: ({ usuario }) => serializarUsuarioPrivado(usuario),
})

rotas.patch('/me', {
  resumo: 'Atualizar dados do usuário logado',
  auth: 'usuario',
  body: z.object({
    nome: z.string().trim().min(2).max(120).optional(),
    chavePix: z.string().trim().max(140).optional(),
    enderecoCompleto: z.string().trim().max(300).optional(),
  }),
  handler: async ({ usuario, body }) => {
    const atualizado = await prisma.usuario.update({ where: { idUsuario: usuario.idUsuario }, data: body })
    return serializarUsuarioPrivado(atualizado)
  },
})

rotas.get('/:id', {
  resumo: 'Perfil público de um usuário, com seus anúncios ativos',
  handler: async ({ params }) => {
    const usuario = await prisma.usuario.findUnique({ where: { idUsuario: params.id } })
    if (!usuario || usuario.banido) throw naoEncontrado('Usuário')
    const anuncios = await prisma.anuncio.findMany({
      where: { idVendedor: usuario.idUsuario, status: 'ativo' },
      include: anuncioInclude,
      orderBy: { dataCriacao: 'desc' },
    })
    return { ...serializarUsuarioPublico(usuario), anuncios: anuncios.map(serializarAnuncio) }
  },
})

rotas.get('/:id/avaliacoes', {
  resumo: 'Avaliações recebidas por um vendedor (RF11)',
  handler: async ({ params }) => {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { pedido: { anuncio: { idVendedor: params.id } } },
      include: { pedido: { select: { comprador: { select: { idUsuario: true, nome: true } }, anuncio: { select: { idAnuncio: true, titulo: true } } } } },
      orderBy: { dataCriacao: 'desc' },
    })
    return avaliacoes.map((a) => ({ ...serializarAvaliacao(a), comprador: a.pedido.comprador, anuncio: a.pedido.anuncio }))
  },
})

export default rotas
