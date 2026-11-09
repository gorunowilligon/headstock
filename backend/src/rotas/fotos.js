import crypto from 'node:crypto'
import multer from 'multer'
import sharp from 'sharp'
import { prisma } from '../db.js'
import { HttpError, naoEncontrado } from '../http/erros.js'
import { criarRouter } from '../http/rota.js'
import { serializarFoto } from '../http/serializar.js'
import { LIMITE_FOTO_MB, arredondar } from '../regras.js'

const BYTES_POR_MB = 1024 * 1024
const LADO_MAXIMO_PX = 1200

// RNF08: 5 MB por imagem, validados antes do processamento.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITE_FOTO_MB * BYTES_POR_MB, files: 10 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true)
    cb(new HttpError(415, `"${file.originalname}" não é uma imagem`))
  },
})

// RNF08: redimensionamento no servidor para economizar banda.
async function redimensionar(file) {
  try {
    return await sharp(file.buffer)
      .rotate()
      .resize({ width: LADO_MAXIMO_PX, height: LADO_MAXIMO_PX, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer()
  } catch {
    throw new HttpError(400, `Não foi possível processar a imagem "${file.originalname}"`)
  }
}

const rotas = criarRouter('/fotos', 'Fotos')

rotas.post('/', {
  resumo: `Enviar fotos de anúncio (RNF08: até ${LIMITE_FOTO_MB} MB cada, redimensionadas no servidor)`,
  descricao: 'Envie multipart/form-data com uma ou mais imagens no campo "fotos". '
    + 'Use os idFoto retornados ao criar ou editar um anúncio. '
    + 'Na Vercel, cada requisição aceita no máximo 4,5 MB no total; envie uma foto por vez se necessário.',
  auth: 'usuario',
  status: 201,
  multipart: true,
  antes: [upload.array('fotos', 10)],
  handler: async ({ req, usuario }) => {
    const arquivos = req.files ?? []
    if (!arquivos.length) throw new HttpError(400, 'Envie ao menos uma imagem no campo "fotos"')

    const processadas = await Promise.all(arquivos.map(redimensionar))
    const fotos = await prisma.$transaction(processadas.map((dados) => {
      const idFoto = crypto.randomUUID()
      return prisma.fotoAnuncio.create({
        data: {
          idFoto,
          url: `/fotos/${idFoto}`,
          mimeType: 'image/jpeg',
          dados,
          tamanhoMB: arredondar(dados.length / BYTES_POR_MB),
          idDono: usuario.idUsuario,
        },
        select: { idFoto: true, url: true, tamanhoMB: true },
      })
    }))
    return fotos.map(serializarFoto)
  },
})

rotas.get('/:id', {
  resumo: 'Obter a imagem de uma foto',
  handler: async ({ params, res }) => {
    const foto = await prisma.fotoAnuncio.findUnique({ where: { idFoto: params.id }, select: { url: true, dados: true, mimeType: true } })
    if (!foto) throw naoEncontrado('Foto')
    if (!foto.dados) return res.redirect(foto.url)
    res.set('Cache-Control', 'public, max-age=31536000, immutable')
    res.type(foto.mimeType ?? 'image/jpeg').send(Buffer.from(foto.dados))
  },
})

rotas.delete('/:id', {
  resumo: 'Descartar uma foto enviada que ainda não foi vinculada a um anúncio',
  descricao: 'Para remover fotos de um anúncio, edite a lista "fotos" em PATCH /anuncios/{id}.',
  auth: 'usuario',
  handler: async ({ params, usuario }) => {
    const { count } = await prisma.fotoAnuncio.deleteMany({
      where: { idFoto: params.id, idDono: usuario.idUsuario, idAnuncio: null },
    })
    if (!count) throw naoEncontrado('Foto avulsa')
  },
})

export default rotas
