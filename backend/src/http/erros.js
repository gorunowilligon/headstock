import multer from 'multer'
import prismaPkg from '@prisma/client'
import { LIMITE_FOTO_MB } from '../regras.js'

const { Prisma } = prismaPkg

export class HttpError extends Error {
  constructor(status, mensagem, detalhes) {
    super(mensagem)
    this.status = status
    this.detalhes = detalhes
  }
}

export const naoEncontrado = (recurso = 'Recurso') => new HttpError(404, `${recurso} não encontrado`)

const mensagensMulter = {
  LIMIT_FILE_SIZE: `Cada imagem deve ter no máximo ${LIMITE_FOTO_MB} MB (RNF08)`,
  LIMIT_FILE_COUNT: 'Envie no máximo 10 imagens por vez',
  LIMIT_UNEXPECTED_FILE: 'Não foi possível enviar as imagens. Tente novamente.',
}

// Middleware de erro do Express (precisa dos 4 parâmetros).
// eslint-disable-next-line no-unused-vars
export function tratarErros(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ erro: err.message, detalhes: err.detalhes })
  }
  if (err instanceof multer.MulterError) {
    return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ erro: mensagensMulter[err.code] ?? err.message })
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ erro: 'Este item já existe' })
    if (err.code === 'P2025') return res.status(404).json({ erro: 'Registro não encontrado' })
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'Não foi possível ler os dados enviados' })
  }
  console.error(err)
  res.status(500).json({ erro: 'Erro interno do servidor' })
}
