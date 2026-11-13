function obrigatoria(nome) {
  const valor = process.env[nome]
  if (!valor) throw new Error(`Variável de ambiente ${nome} não definida (veja .env.example)`)
  return valor
}

export const config = {
  porta: Number(process.env.PORT) || 3333,
  producao: process.env.NODE_ENV === 'production',
  jwtSecret: obrigatoria('JWT_SECRET'),
  jwtExpiraEm: process.env.JWT_EXPIRES_IN || '7d',
  urlPublica: (process.env.PUBLIC_URL || '').replace(/\/$/, ''),
  origensCors: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origem) => origem.trim()).filter(Boolean)
    : true,
}
