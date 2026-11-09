import { z } from 'zod'
import { prisma } from '../db.js'
import { naoEncontrado } from '../http/erros.js'
import { criarRouter } from '../http/rota.js'
import { serializarInstrumento } from '../http/serializar.js'

// Campos reaproveitados pelo cadastro manual de anúncios (RF04).
export const instrumentoBase = z.object({
  marca: z.string().trim().min(1).max(80),
  modelo: z.string().trim().min(1).max(120),
  categoria: z.string().trim().min(1).max(60),
  tipoCaptacao: z.string().trim().max(60).optional(),
  numeroCordas: z.number().int().min(0).max(18).optional(),
  orientacao: z.string().trim().max(30).optional(),
  especificacoes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional()
    .describe('Especificações livres (RF03): madeiraCorpo, madeiraBraco, ponte, escala, calibreCordas...'),
})

const rotas = criarRouter('/instrumentos', 'Catálogo mestre')

const buscarDoCatalogo = async (idInstrumento) => {
  const instrumento = await prisma.instrumento.findFirst({ where: { idInstrumento, noCatalogo: true } })
  if (!instrumento) throw naoEncontrado('Instrumento do catálogo')
  return instrumento
}

rotas.get('/', {
  resumo: 'Listar o catálogo mestre de instrumentos',
  query: z.object({
    q: z.string().trim().optional(),
    categoria: z.string().trim().optional(),
  }),
  handler: async ({ query }) => {
    const contem = (valor) => ({ contains: valor, mode: 'insensitive' })
    const instrumentos = await prisma.instrumento.findMany({
      where: {
        noCatalogo: true,
        ...(query.categoria && { categoria: { equals: query.categoria, mode: 'insensitive' } }),
        ...(query.q && { OR: [{ marca: contem(query.q) }, { modelo: contem(query.q) }] }),
      },
      orderBy: [{ marca: 'asc' }, { modelo: 'asc' }],
    })
    return instrumentos.map(serializarInstrumento)
  },
})

rotas.get('/:id', {
  resumo: 'Detalhar um instrumento do catálogo mestre',
  handler: async ({ params }) => serializarInstrumento(await buscarDoCatalogo(params.id)),
})

rotas.post('/', {
  resumo: 'Cadastrar instrumento no catálogo mestre (RF14)',
  auth: 'admin',
  status: 201,
  body: instrumentoBase,
  handler: async ({ body }) => serializarInstrumento(await prisma.instrumento.create({ data: { ...body, noCatalogo: true } })),
})

rotas.patch('/:id', {
  resumo: 'Editar instrumento do catálogo mestre (RF14)',
  descricao: 'Anúncios já publicados mantêm sua própria cópia das especificações e não são alterados.',
  auth: 'admin',
  body: instrumentoBase.partial(),
  handler: async ({ params, body }) => {
    await buscarDoCatalogo(params.id)
    return serializarInstrumento(await prisma.instrumento.update({ where: { idInstrumento: params.id }, data: body }))
  },
})

rotas.delete('/:id', {
  resumo: 'Remover instrumento do catálogo mestre (RF14)',
  auth: 'admin',
  handler: async ({ params }) => {
    await buscarDoCatalogo(params.id)
    await prisma.instrumento.delete({ where: { idInstrumento: params.id } })
  },
})

export default rotas
