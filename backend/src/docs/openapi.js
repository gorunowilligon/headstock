// RNF11: a especificação OpenAPI é gerada automaticamente a partir das rotas registradas
// e dos mesmos schemas Zod usados na validação, então nunca fica desatualizada.

import { z } from 'zod'
import { config } from '../config.js'
import { rotasDocumentadas } from '../http/rota.js'

function paraJsonSchema(schema) {
  try {
    const json = z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' })
    delete json.$schema
    return json
  } catch {
    return { type: 'object' }
  }
}

const respostasDeErro = {
  usuario: { 401: { description: 'Login necessário (RF07)' } },
  admin: { 401: { description: 'Login necessário' }, 403: { description: 'Restrito a administradores' } },
}

export function gerarOpenApi() {
  const paths = {}

  for (const rota of rotasDocumentadas) {
    const parametros = [...rota.caminho.matchAll(/:(\w+)/g)].map(([, nome]) => ({
      name: nome, in: 'path', required: true, schema: { type: nome.startsWith('id') ? 'integer' : 'string' },
    }))
    if (rota.query) {
      const schema = paraJsonSchema(rota.query)
      for (const [nome, propriedade] of Object.entries(schema.properties ?? {})) {
        parametros.push({
          name: nome,
          in: 'query',
          required: (schema.required ?? []).includes(nome) && propriedade.default === undefined,
          description: propriedade.description,
          schema: propriedade,
        })
      }
    }

    const operacao = {
      tags: [rota.tag],
      summary: rota.resumo,
      description: rota.descricao,
      parameters: parametros,
      responses: {
        [rota.status]: { description: 'Sucesso' },
        ...(rota.body && { 400: { description: 'Dados inválidos' } }),
        ...respostasDeErro[rota.auth],
      },
    }
    if (rota.body) {
      operacao.requestBody = { required: true, content: { 'application/json': { schema: paraJsonSchema(rota.body) } } }
    }
    if (rota.multipart) {
      operacao.requestBody = {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: { fotos: { type: 'array', items: { type: 'string', format: 'binary' } } },
              required: ['fotos'],
            },
          },
        },
      }
    }
    if (rota.auth === 'usuario' || rota.auth === 'admin') operacao.security = [{ bearerAuth: [] }]
    if (rota.auth === 'opcional') operacao.security = [{}, { bearerAuth: [] }]

    const caminho = rota.caminho.replace(/:(\w+)/g, '{$1}')
    paths[caminho] ??= {}
    paths[caminho][rota.metodo] = operacao
  }

  return {
    openapi: '3.1.0',
    info: {
      title: 'Headstock API',
      version: '0.1.0',
      description: 'API REST do Headstock, marketplace C2C de instrumentos de cordas. '
        + 'Faça login em POST /auth/login e use o token no botão "Authorize". '
        + 'Pagamentos e frete funcionam em modo sandbox (seção 2.4 dos requisitos).',
    },
    servers: [{ url: config.urlPublica || '/' }],
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    },
    paths,
  }
}

const SWAGGER_UI = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14'

export const paginaSwagger = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Headstock API · Documentação</title>
  <link rel="stylesheet" href="${SWAGGER_UI}/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${SWAGGER_UI}/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({ url: 'openapi.json', dom_id: '#swagger-ui', persistAuthorization: true })
  </script>
</body>
</html>`
