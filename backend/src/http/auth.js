import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { prisma } from '../db.js'
import { HttpError } from './erros.js'

export function gerarToken(usuario) {
  return jwt.sign({ tipo: usuario.tipo }, config.jwtSecret, { subject: usuario.idUsuario, expiresIn: config.jwtExpiraEm })
}

async function carregarUsuario(req) {
  const [esquema, token] = (req.get('authorization') ?? '').split(' ')
  if (esquema !== 'Bearer' || !token) return null

  let payload
  try {
    payload = jwt.verify(token, config.jwtSecret)
  } catch {
    throw new HttpError(401, 'Sessão inválida ou expirada. Faça login novamente.')
  }

  const usuario = await prisma.usuario.findUnique({ where: { idUsuario: payload.sub } })
  if (!usuario) throw new HttpError(401, 'Usuário não encontrado')
  if (usuario.banido) throw new HttpError(403, 'Esta conta foi banida pela moderação')
  return usuario
}

/**
 * modo "opcional": identifica o usuário se houver token, mas não exige.
 * modo "usuario": exige login (RF07).
 * modo "admin": exige login de Administrador.
 */
export const autenticar = (modo) => async (req, res, next) => {
  if (modo === 'opcional') {
    req.usuario = await carregarUsuario(req).catch(() => null)
    return next()
  }
  const usuario = await carregarUsuario(req)
  if (!usuario) throw new HttpError(401, 'Faça login ou cadastre-se para continuar (RF07)')
  if (modo === 'admin' && usuario.tipo !== 'administrador') throw new HttpError(403, 'Acesso restrito a administradores')
  req.usuario = usuario
  next()
}
