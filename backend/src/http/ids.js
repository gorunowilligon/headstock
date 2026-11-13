import { z } from 'zod'
import { HttpError } from './erros.js'

/**
 * Id numérico (chaves primárias são inteiros auto-incrementados).
 * "coerce" aceita "12" vindo de query string e 12 vindo de JSON.
 */
export const idNumerico = z.coerce.number().int('O id deve ser um número inteiro').positive('O id deve ser positivo')

/**
 * Converte os parâmetros de rota cujo nome começa com "id" (ex.: /:id, /:idAnuncio) para número.
 * Um valor que não seja inteiro positivo nunca existe no banco, então responde 404.
 */
export function converterParametros(params) {
  const convertidos = {}
  for (const [nome, valor] of Object.entries(params)) {
    if (nome !== 'id' && !nome.startsWith('id')) {
      convertidos[nome] = valor
      continue
    }
    if (!/^\d+$/.test(valor) || !Number.isSafeInteger(Number(valor)) || Number(valor) < 1) {
      throw new HttpError(404, 'Recurso não encontrado')
    }
    convertidos[nome] = Number(valor)
  }
  return convertidos
}
