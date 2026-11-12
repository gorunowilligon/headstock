import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { query } from '@/lib/server/db'
import { LIMITE_DESCRICAO_DENUNCIA, MOTIVOS_DENUNCIA } from '@/lib/motivos-denuncia'

export const runtime = 'nodejs'

const textoPreenchido = (valor) => typeof valor === 'string' && valor.trim().length > 0

function validar(corpo) {
  const erros = []
  if (!corpo || typeof corpo !== 'object') return ['O corpo da requisição deve ser um objeto JSON.']
  if (!MOTIVOS_DENUNCIA.includes(corpo.motivo)) erros.push('motivo: informe um dos motivos aceitos.')
  if (!textoPreenchido(corpo.descricaoTextual)) erros.push('descricaoTextual: campo obrigatório.')
  else if (corpo.descricaoTextual.trim().length > LIMITE_DESCRICAO_DENUNCIA) erros.push(`descricaoTextual: no máximo ${LIMITE_DESCRICAO_DENUNCIA} caracteres.`)
  if (!textoPreenchido(corpo.idAutor)) erros.push('idAutor: campo obrigatório.')
  if (!textoPreenchido(corpo.idAnuncio)) erros.push('idAnuncio: campo obrigatório.')
  return erros
}

const paraJson = (linha) => ({
  idDenuncia: linha.id_denuncia,
  motivo: linha.motivo,
  descricaoTextual: linha.descricao_textual,
  status: linha.status,
  idAutor: linha.id_autor,
  idAnuncio: linha.id_anuncio,
  dataCriacao: linha.data_criacao,
})

// POST /api/denuncias — registra uma denúncia de anúncio (RF12).
// Corpo: { motivo, descricaoTextual, idAutor, idAnuncio }
// Respostas: 201 com a denúncia criada; 400 com a lista de erros de validação; 500 se o banco falhar.
export async function POST(request) {
  let corpo
  try {
    corpo = await request.json()
  } catch {
    return NextResponse.json({ erros: ['O corpo da requisição não é um JSON válido.'] }, { status: 400 })
  }

  const erros = validar(corpo)
  if (erros.length > 0) return NextResponse.json({ erros }, { status: 400 })

  try {
    const { rows } = await query(
      `INSERT INTO denuncia (id_denuncia, motivo, descricao_textual, status, id_autor, id_anuncio)
       VALUES ($1, $2, $3, 'aberta', $4, $5)
       RETURNING id_denuncia, motivo, descricao_textual, status, id_autor, id_anuncio, data_criacao`,
      [randomUUID(), corpo.motivo, corpo.descricaoTextual.trim(), corpo.idAutor.trim(), corpo.idAnuncio.trim()],
    )
    return NextResponse.json(paraJson(rows[0]), { status: 201 })
  } catch (erro) {
    console.error('Erro ao registrar denúncia:', erro)
    return NextResponse.json({ erros: ['Não foi possível registrar a denúncia. Tente novamente.'] }, { status: 500 })
  }
}
