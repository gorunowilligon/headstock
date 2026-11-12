import { Pool } from 'pg'

// Conexão com o banco PostgreSQL (RNF02).
// A URL vem da variável de ambiente DATABASE_URL, por exemplo:
//   postgres://usuario:senha@host:5432/headstock?sslmode=require

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS denuncia (
    id_denuncia       UUID PRIMARY KEY,
    motivo            VARCHAR(100) NOT NULL,
    descricao_textual TEXT NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'aberta'
                      CHECK (status IN ('aberta', 'em análise', 'resolvida')),
    id_autor          VARCHAR(64) NOT NULL,
    id_anuncio        VARCHAR(64) NOT NULL,
    data_criacao      TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`

// Em desenvolvimento o Next.js recarrega os módulos; guardar o pool em globalThis evita abrir conexões repetidas.
const cache = globalThis

function obterPool() {
  if (!cache.__headstockPool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('A variável de ambiente DATABASE_URL não está definida.')
    }
    cache.__headstockPool = new Pool({ connectionString: process.env.DATABASE_URL })
  }
  return cache.__headstockPool
}

// Cria as tabelas na primeira consulta, caso ainda não existam.
function garantirSchema() {
  if (!cache.__headstockSchema) {
    cache.__headstockSchema = obterPool().query(SCHEMA).catch((erro) => {
      cache.__headstockSchema = undefined
      throw erro
    })
  }
  return cache.__headstockSchema
}

export async function query(texto, parametros) {
  await garantirSchema()
  return obterPool().query(texto, parametros)
}
