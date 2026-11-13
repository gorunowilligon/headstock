import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { gerarOpenApi, paginaSwagger } from './docs/openapi.js'
import { tratarErros } from './http/erros.js'
import { routers } from './rotas/index.js'

const app = express()

app.set('trust proxy', 1)
app.disable('x-powered-by')

// RNF06: em produção, só aceita HTTPS (a Vercel já termina o TLS e informa via X-Forwarded-Proto).
app.use((req, res, next) => {
  if (config.producao && !req.secure) return res.redirect(308, `https://${req.get('host')}${req.originalUrl}`)
  next()
})

app.use(cors({ origin: config.origensCors }))
app.use(express.json({ limit: '1mb' }))

app.get('/', (req, res) => res.json({ nome: 'Headstock API', documentacao: '/docs' }))
app.get('/saude', (req, res) => res.json({ ok: true }))

// RNF05: toda a comunicação com o frontend acontece por estas rotas REST/JSON.
for (const { prefixo, router } of routers) app.use(prefixo, router)

app.get('/openapi.json', (req, res) => res.json(gerarOpenApi()))
app.get('/docs', (req, res) => res.type('html').send(paginaSwagger))

app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada' }))
app.use(tratarErros)

export default app
