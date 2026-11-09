import { Router } from 'express'
import { autenticar } from './auth.js'
import { HttpError } from './erros.js'

/** Toda rota registrada aqui alimenta também a documentação OpenAPI (RNF11). */
export const rotasDocumentadas = []

function validar(schema, dados) {
  const resultado = schema.safeParse(dados)
  if (!resultado.success) {
    throw new HttpError(400, 'Dados inválidos', resultado.error.issues.map((issue) => ({
      campo: issue.path.join('.'),
      mensagem: issue.message,
    })))
  }
  return resultado.data
}

/**
 * Cria um router cujas rotas declaram: autenticação, schemas Zod de body/query,
 * status de sucesso e um handler que recebe { req, res, usuario, params, body, query }.
 * O valor retornado pelo handler vira o JSON da resposta (undefined => 204).
 */
export function criarRouter(prefixo, tag) {
  const router = Router()

  const definir = (metodo, caminho, def) => {
    const { resumo, descricao, auth = 'publica', body, query, status = 200, antes = [], multipart, handler } = def
    rotasDocumentadas.push({ metodo, caminho: prefixo + caminho, tag, resumo, descricao, auth, body, query, status, multipart })

    const middlewares = auth === 'publica' ? [] : [autenticar(auth)]
    router[metodo](caminho, ...middlewares, ...antes, async (req, res) => {
      const resultado = await handler({
        req,
        res,
        usuario: req.usuario ?? null,
        params: req.params,
        body: body ? validar(body, req.body ?? {}) : req.body,
        query: query ? validar(query, req.query) : req.query,
      })
      if (res.headersSent) return
      if (resultado === undefined) return res.status(204).end()
      res.status(status).json(resultado)
    })
  }

  return {
    prefixo,
    router,
    get: (caminho, def) => definir('get', caminho, def),
    post: (caminho, def) => definir('post', caminho, def),
    put: (caminho, def) => definir('put', caminho, def),
    patch: (caminho, def) => definir('patch', caminho, def),
    delete: (caminho, def) => definir('delete', caminho, def),
  }
}
