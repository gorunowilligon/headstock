function obrigatoria(nome) {
  const valor = process.env[nome]
  if (!valor) throw new Error(`Variável de ambiente ${nome} não definida (veja .env.example)`)
  return valor
}

const porta = Number(process.env.PORT) || 3333
const producao = process.env.NODE_ENV === 'production'
const urlPadrao = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : producao ? '' : `http://localhost:${porta}`

export const config = {
  porta,
  producao,
  jwtSecret: obrigatoria('JWT_SECRET'),
  jwtExpiraEm: process.env.JWT_EXPIRES_IN || '7d',
  urlPublica: (process.env.PUBLIC_URL || urlPadrao).replace(/\/$/, ''),
  origensCors: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origem) => origem.trim()).filter(Boolean)
    : true,
}
