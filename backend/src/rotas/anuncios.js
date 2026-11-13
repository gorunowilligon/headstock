import { z } from 'zod'
import { prisma } from '../db.js'
import { HttpError, naoEncontrado } from '../http/erros.js'
import { criarRouter } from '../http/rota.js'
import { idNumerico } from '../http/ids.js'
import { anuncioInclude, serializarAnuncio } from '../http/serializar.js'
import { MAX_FOTOS, MIN_FOTOS } from '../regras.js'
import { instrumentoBase } from './instrumentos.js'

const rotas = criarRouter('/anuncios', 'Anúncios')

const listaDeFotos = z.array(idNumerico)
  .min(MIN_FOTOS, `Envie no mínimo ${MIN_FOTOS} fotos do item (RF02)`)
  .max(MAX_FOTOS, `Envie no máximo ${MAX_FOTOS} fotos`)
  .refine((ids) => new Set(ids).size === ids.length, 'A lista de fotos tem itens repetidos')
  .describe('IDs das fotos enviadas em POST /fotos, na ordem de exibição (a primeira é a capa)')

const camposAnuncio = {
  condicao: z.string().trim().min(1).max(40),
  preco: z.number().positive().max(10_000_000),
  localizacao: z.string().trim().min(2).max(120),
  descricao: z.string().trim().max(5000).optional(),
  aceitaPropostas: z.boolean().optional().describe('RF08: se o anúncio aceita propostas de preço (padrão: true)'),
}

const lista = (valor) => (valor ?? '').split(',').map((item) => item.trim()).filter(Boolean)
const contem = (valor) => ({ contains: valor, mode: 'insensitive' })
const igual = (valor) => ({ equals: valor, mode: 'insensitive' })

const podeVer = (anuncio, usuario) =>
  ['ativo', 'vendido'].includes(anuncio.status)
  || anuncio.idVendedor === usuario?.idUsuario
  || usuario?.tipo === 'administrador'

const buscarCompleto = (idAnuncio, db = prisma) =>
  db.anuncio.findUniqueOrThrow({ where: { idAnuncio }, include: anuncioInclude })

async function anuncioDoVendedor(idAnuncio, usuario) {
  const anuncio = await prisma.anuncio.findUnique({ where: { idAnuncio }, include: { instrumento: true } })
  if (!anuncio || anuncio.status === 'removido') throw naoEncontrado('Anúncio')
  if (anuncio.idVendedor !== usuario.idUsuario) throw new HttpError(403, 'Apenas o vendedor pode alterar este anúncio')
  return anuncio
}

/** Vincula as fotos (na ordem dada) ao anúncio e apaga as que saíram da lista. */
async function definirFotos(tx, idAnuncio, idDono, ids) {
  const fotos = await tx.fotoAnuncio.findMany({
    where: { idFoto: { in: ids }, idDono },
    select: { idFoto: true, idAnuncio: true },
  })
  const disponiveis = new Set(fotos.filter((f) => f.idAnuncio === null || f.idAnuncio === idAnuncio).map((f) => f.idFoto))
  const invalidas = ids.filter((id) => !disponiveis.has(id))
  if (invalidas.length) {
    throw new HttpError(400, 'Algumas fotos não existem, não são suas ou já pertencem a outro anúncio', invalidas)
  }

  await tx.fotoAnuncio.deleteMany({ where: { idAnuncio, idFoto: { notIn: ids } } })
  for (const [ordem, idFoto] of ids.entries()) {
    await tx.fotoAnuncio.update({ where: { idFoto }, data: { idAnuncio, ordem } })
  }
}

rotas.get('/', {
  resumo: 'Buscar anúncios ativos com filtros do nicho musical (RF06)',
  query: z.object({
    q: z.string().trim().optional().describe('Texto livre: título, descrição, marca ou modelo'),
    marca: z.string().trim().optional().describe('Uma ou mais marcas separadas por vírgula'),
    categoria: z.string().trim().optional().describe('Uma ou mais categorias separadas por vírgula'),
    tipoCaptacao: z.string().trim().optional().describe('Um ou mais tipos de captação separados por vírgula'),
    condicao: z.string().trim().optional().describe('Uma ou mais condições separadas por vírgula (ex.: "Novo,Usado" casa também com "Usado · Excelente")'),
    localizacao: z.string().trim().optional(),
    precoMin: z.coerce.number().min(0).optional(),
    precoMax: z.coerce.number().min(0).optional(),
    ordenar: z.enum(['recentes', 'menor_preco', 'maior_preco']).default('recentes'),
    pagina: z.coerce.number().int().min(1).default(1),
    porPagina: z.coerce.number().int().min(1).max(100).default(24),
  }),
  handler: async ({ query }) => {
    const filtros = [{ status: 'ativo' }]
    if (query.q) {
      filtros.push({ OR: [
        { titulo: contem(query.q) },
        { descricao: contem(query.q) },
        { instrumento: { is: { marca: contem(query.q) } } },
        { instrumento: { is: { modelo: contem(query.q) } } },
      ] })
    }
    // Cada filtro de lista casa com qualquer um dos valores (OR); filtros diferentes se combinam (AND).
    const doInstrumento = (campo, valores, operador) => {
      if (valores.length) filtros.push({ instrumento: { is: { OR: valores.map((v) => ({ [campo]: operador(v) })) } } })
    }
    doInstrumento('marca', lista(query.marca), igual)
    doInstrumento('categoria', lista(query.categoria), igual)
    doInstrumento('tipoCaptacao', lista(query.tipoCaptacao), igual)
    const condicoes = lista(query.condicao)
    if (condicoes.length) filtros.push({ OR: condicoes.map((c) => ({ condicao: contem(c) })) })
    if (query.localizacao) filtros.push({ localizacao: contem(query.localizacao) })
    if (query.precoMin !== undefined) filtros.push({ preco: { gte: query.precoMin } })
    if (query.precoMax !== undefined) filtros.push({ preco: { lte: query.precoMax } })

    const where = { AND: filtros }
    const orderBy = {
      recentes: { dataCriacao: 'desc' },
      menor_preco: { preco: 'asc' },
      maior_preco: { preco: 'desc' },
    }[query.ordenar]

    const [total, itens] = await prisma.$transaction([
      prisma.anuncio.count({ where }),
      prisma.anuncio.findMany({
        where,
        include: anuncioInclude,
        orderBy,
        skip: (query.pagina - 1) * query.porPagina,
        take: query.porPagina,
      }),
    ])
    return { itens: itens.map(serializarAnuncio), total, pagina: query.pagina, porPagina: query.porPagina }
  },
})

rotas.get('/meus', {
  resumo: 'Anúncios do usuário logado (ativos, pausados e vendidos)',
  auth: 'usuario',
  handler: async ({ usuario }) => {
    const anuncios = await prisma.anuncio.findMany({
      where: { idVendedor: usuario.idUsuario, status: { not: 'removido' } },
      include: anuncioInclude,
      orderBy: { dataCriacao: 'desc' },
    })
    return anuncios.map(serializarAnuncio)
  },
})

rotas.get('/:id', {
  resumo: 'Detalhar um anúncio',
  descricao: 'Anúncios pausados só são visíveis para o próprio vendedor e administradores.',
  auth: 'opcional',
  handler: async ({ params, usuario }) => {
    const anuncio = await prisma.anuncio.findUnique({ where: { idAnuncio: params.id }, include: anuncioInclude })
    if (!anuncio || !podeVer(anuncio, usuario)) throw naoEncontrado('Anúncio')
    return serializarAnuncio(anuncio)
  },
})

rotas.post('/', {
  resumo: 'Publicar anúncio (RF02, RF04)',
  descricao: 'Informe idInstrumentoCatalogo (modelo do catálogo mestre) OU instrumento (preenchimento manual, RF04). '
    + 'Exige no mínimo 3 fotos já enviadas em POST /fotos. Usuários suspensos (RN07) não podem publicar.',
  auth: 'usuario',
  status: 201,
  body: z.object({
    idInstrumentoCatalogo: idNumerico.optional(),
    instrumento: instrumentoBase.optional(),
    ...camposAnuncio,
    fotos: listaDeFotos,
  }).refine((d) => Boolean(d.idInstrumentoCatalogo) !== Boolean(d.instrumento), {
    message: 'Informe idInstrumentoCatalogo ou instrumento (apenas um dos dois)',
    path: ['instrumento'],
  }),
  handler: async ({ usuario, body }) => {
    if (usuario.suspenso) {
      throw new HttpError(403, 'Sua conta está suspensa de criar anúncios por ter avaliação média inferior a 2 estrelas (RN07)')
    }

    let dadosInstrumento = body.instrumento
    if (body.idInstrumentoCatalogo) {
      const modelo = await prisma.instrumento.findFirst({ where: { idInstrumento: body.idInstrumentoCatalogo, noCatalogo: true } })
      if (!modelo) throw naoEncontrado('Instrumento do catálogo')
      const { marca, modelo: nomeModelo, categoria, tipoCaptacao, numeroCordas, orientacao, especificacoes } = modelo
      dadosInstrumento = { marca, modelo: nomeModelo, categoria, tipoCaptacao, numeroCordas, orientacao, especificacoes }
    }

    const anuncio = await prisma.$transaction(async (tx) => {
      const criado = await tx.anuncio.create({
        data: {
          titulo: `${dadosInstrumento.marca} ${dadosInstrumento.modelo}`,
          preco: body.preco,
          condicao: body.condicao,
          localizacao: body.localizacao,
          descricao: body.descricao,
          aceitaPropostas: body.aceitaPropostas,
          vendedor: { connect: { idUsuario: usuario.idUsuario } },
          instrumento: { create: dadosInstrumento },
        },
      })
      await definirFotos(tx, criado.idAnuncio, usuario.idUsuario, body.fotos)
      return buscarCompleto(criado.idAnuncio, tx)
    })
    return serializarAnuncio(anuncio)
  },
})

rotas.patch('/:id', {
  resumo: 'Editar anúncio (RF03, RF05)',
  descricao: 'Todos os campos são opcionais. "fotos" substitui a lista inteira (mínimo 3). '
    + '"instrumento" altera as especificações do item anunciado, não do catálogo mestre.',
  auth: 'usuario',
  body: z.object({
    condicao: camposAnuncio.condicao.optional(),
    preco: camposAnuncio.preco.optional(),
    localizacao: camposAnuncio.localizacao.optional(),
    descricao: camposAnuncio.descricao,
    aceitaPropostas: camposAnuncio.aceitaPropostas,
    instrumento: instrumentoBase.partial().optional(),
    fotos: listaDeFotos.optional(),
  }),
  handler: async ({ usuario, params, body }) => {
    const atual = await anuncioDoVendedor(params.id, usuario)
    if (atual.status === 'vendido') throw new HttpError(409, 'Anúncios vendidos não podem ser editados')

    const marca = body.instrumento?.marca ?? atual.instrumento.marca
    const modelo = body.instrumento?.modelo ?? atual.instrumento.modelo

    const anuncio = await prisma.$transaction(async (tx) => {
      if (body.instrumento) {
        await tx.instrumento.update({ where: { idInstrumento: atual.idInstrumento }, data: body.instrumento })
      }
      await tx.anuncio.update({
        where: { idAnuncio: atual.idAnuncio },
        data: {
          titulo: `${marca} ${modelo}`,
          condicao: body.condicao,
          preco: body.preco,
          localizacao: body.localizacao,
          descricao: body.descricao,
          aceitaPropostas: body.aceitaPropostas,
        },
      })
      // Propostas antigas deixam de valer quando o preço muda ou o vendedor desativa as propostas.
      if (body.aceitaPropostas === false || (body.preco !== undefined && body.preco !== Number(atual.preco))) {
        await tx.oferta.updateMany({ where: { idAnuncio: atual.idAnuncio, status: { in: ['pendente', 'aceita'] } }, data: { status: 'cancelada' } })
      }
      if (body.fotos) await definirFotos(tx, atual.idAnuncio, usuario.idUsuario, body.fotos)
      return buscarCompleto(atual.idAnuncio, tx)
    })
    return serializarAnuncio(anuncio)
  },
})

const mudarStatus = (de, para, resumo) => ({
  resumo,
  auth: 'usuario',
  handler: async ({ usuario, params }) => {
    const anuncio = await anuncioDoVendedor(params.id, usuario)
    if (anuncio.status !== de) {
      throw new HttpError(409, anuncio.status === 'vendido' ? 'Este anúncio já foi vendido.' : 'O anúncio mudou de situação. Atualize a página e tente novamente.')
    }
    await prisma.anuncio.update({ where: { idAnuncio: anuncio.idAnuncio }, data: { status: para } })
    return serializarAnuncio(await buscarCompleto(anuncio.idAnuncio))
  },
})

rotas.post('/:id/pausar', mudarStatus('ativo', 'pausado', 'Pausar anúncio (RF05)'))
rotas.post('/:id/reativar', mudarStatus('pausado', 'ativo', 'Reativar anúncio pausado (RF05)'))

rotas.delete('/:id', {
  resumo: 'Excluir anúncio (RF05)',
  descricao: 'Anúncios com pedidos ficam com status "removido" para preservar o histórico; os demais são apagados.',
  auth: 'usuario',
  handler: async ({ usuario, params }) => {
    const anuncio = await anuncioDoVendedor(params.id, usuario)
    const pedidos = await prisma.pedido.count({ where: { idAnuncio: anuncio.idAnuncio } })
    if (pedidos > 0) {
      await prisma.anuncio.update({ where: { idAnuncio: anuncio.idAnuncio }, data: { status: 'removido' } })
      return
    }
    await prisma.$transaction([
      prisma.anuncio.delete({ where: { idAnuncio: anuncio.idAnuncio } }),
      prisma.instrumento.delete({ where: { idInstrumento: anuncio.idInstrumento } }),
    ])
  },
})

export default rotas
