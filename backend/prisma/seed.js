// Popula o banco com dados de exemplo. Os ids são numéricos (auto-incremento).
// ATENÇÃO: apaga todos os dados existentes. Uso apenas em desenvolvimento.

import bcrypt from 'bcryptjs'
import prismaPkg from '@prisma/client'

const { PrismaClient } = prismaPkg
const prisma = new PrismaClient()

const SENHA_PADRAO = 'headstock123'

const usuarios = [
  { idUsuario: 1, tipo: 'administrador', nome: 'Moderação Headstock', email: 'admin@headstock.dev', reputacaoMedia: 0, nivelAcesso: 1 },
  { idUsuario: 2, nome: 'Marcos Cavalcanti', email: 'marcos@email.com', reputacaoMedia: 4.9, enderecoCompleto: 'Av. Paulista, 1500, São Paulo, SP', chavePix: 'marcos@email.com' },
  { idUsuario: 3, nome: 'Lucas Ferreira', email: 'lucas@email.com', reputacaoMedia: 4.7, enderecoCompleto: 'Curitiba, PR' },
  { idUsuario: 4, nome: 'Ana Beatriz Lima', email: 'ana@email.com', reputacaoMedia: 5, enderecoCompleto: 'Belo Horizonte, MG' },
  { idUsuario: 5, nome: 'Renato Azevedo', email: 'renato@email.com', reputacaoMedia: 4.8, enderecoCompleto: 'Porto Alegre, RS' },
]

const catalogo = [
  { idInstrumento: 1, marca: 'Fender', modelo: 'Stratocaster Player Plus', categoria: 'Guitarras', tipoCaptacao: 'SSS', numeroCordas: 6, orientacao: 'Destro' },
  { idInstrumento: 2, marca: 'Gibson', modelo: 'Les Paul Studio 2019', categoria: 'Guitarras', tipoCaptacao: 'HH', numeroCordas: 6, orientacao: 'Destro' },
  { idInstrumento: 3, marca: 'Ibanez', modelo: 'RG550 Genesis Collection', categoria: 'Guitarras', tipoCaptacao: 'HSH', numeroCordas: 6, orientacao: 'Destro' },
  { idInstrumento: 4, marca: 'Boss', modelo: 'DS-1 Distortion', categoria: 'Pedais/Efeitos', tipoCaptacao: '', numeroCordas: 0, orientacao: '' },
  { idInstrumento: 5, marca: 'Martin', modelo: 'D-28 Authentic', categoria: 'Violões', tipoCaptacao: 'Acústico puro', numeroCordas: 6, orientacao: 'Destro' },
  { idInstrumento: 6, marca: 'Fender', modelo: 'Player Jazz Bass', categoria: 'Baixos', tipoCaptacao: 'JJ', numeroCordas: 4, orientacao: 'Destro' },
]

const img = (id, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=85`

const anuncios = [
  {
    idAnuncio: 1, idInstrumento: 1, idVendedor: 2, preco: 6890, condicao: 'Usado · Excelente', localizacao: 'São Paulo, SP',
    fotos: [[1, img('1564186763535-ebb21ef5277f')], [2, img('1526924143875-1e1d8d4f9f8f', 1000)], [3, img('1556449895-a33c9dba33dd', 1000)]],
    descricao: 'Guitarra impecável, regulada e pronta para tocar. Estou vendendo porque migrei para uma configuração diferente. Acompanha bag acolchoada e ponteira original. Sem marcas relevantes, trastes com mais de 80% de vida útil.',
  },
  { idAnuncio: 2, idInstrumento: 2, idVendedor: 3, preco: 8500, condicao: 'Usado · Muito bom', localizacao: 'Curitiba, PR', fotos: [[4, img('1550291652-6ea9114a47b1')]] },
  { idAnuncio: 3, idInstrumento: 3, idVendedor: 4, preco: 5290, condicao: 'Seminovo', localizacao: 'Belo Horizonte, MG', fotos: [[5, img('1525201548942-d8732f6617a0')]] },
  { idAnuncio: 4, idInstrumento: 4, idVendedor: 2, preco: 590, condicao: 'Usado · Excelente', localizacao: 'Rio de Janeiro, RJ', fotos: [[6, img('1558098329-a11cff621064')]] },
  { idAnuncio: 5, idInstrumento: 5, idVendedor: 5, preco: 14900, condicao: 'Usado · Excelente', localizacao: 'Porto Alegre, RS', fotos: [[7, img('1516924962500-2b4b3b99ea02')]] },
  { idAnuncio: 6, idInstrumento: 6, idVendedor: 2, preco: 7200, condicao: 'Seminovo', localizacao: 'Campinas, SP', fotos: [[8, img('1498038432885-c6f3f1b912ee')]] },
]

async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('O seed apaga todos os dados e não roda em produção.')

  // TRUNCATE ... RESTART IDENTITY apaga tudo e volta os ids a 1 (só para desenvolvimento).
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Avaliacao", "Denuncia", "Mensagem", "Pedido", "Oferta", "Favorito", "FotoAnuncio", "Anuncio", "Instrumento", "Usuario" RESTART IDENTITY CASCADE')

  const senhaHash = await bcrypt.hash(SENHA_PADRAO, 10)
  await prisma.usuario.createMany({ data: usuarios.map((u) => ({ ...u, senhaHash })) })
  await prisma.instrumento.createMany({ data: catalogo.map((i) => ({ ...i, noCatalogo: true })) })
  // Inserir com ids explícitos não avança o contador do banco: sem isto, a cópia do instrumento de cada anúncio tentaria usar o id 1.
  for (const [tabela, coluna] of [['Usuario', 'idUsuario'], ['Instrumento', 'idInstrumento']]) {
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${tabela}"', '${coluna}'), (SELECT MAX("${coluna}") FROM "${tabela}"))`)
  }

  for (const a of anuncios) {
    const { idInstrumento, ...modelo } = catalogo.find((i) => i.idInstrumento === a.idInstrumento)
    await prisma.anuncio.create({
      data: {
        titulo: `${modelo.marca} ${modelo.modelo}`,
        preco: a.preco,
        condicao: a.condicao,
        localizacao: a.localizacao,
        descricao: a.descricao,
        dataCriacao: new Date('2026-10-01T00:00:00.000Z'),
        vendedor: { connect: { idUsuario: a.idVendedor } },
        instrumento: { create: modelo },
        fotos: {
          create: a.fotos.map(([, url], ordem) => ({ url, ordem, dono: { connect: { idUsuario: a.idVendedor } } })),
        },
      },
    })
  }

  console.log(`Seed concluído: ${usuarios.length} usuários, ${catalogo.length} instrumentos no catálogo, ${anuncios.length} anúncios.`)
  console.log(`Senha de todos os usuários: ${SENHA_PADRAO} (admin: admin@headstock.dev)`)
}

main()
  .catch((erro) => {
    console.error(erro)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
