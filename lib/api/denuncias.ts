import type { Denuncia } from '@/lib/models'

export type NovaDenuncia = Pick<Denuncia, 'motivo' | 'descricaoTextual' | 'idAutor' | 'idAnuncio'>

// Envia a denúncia ao backend (RNF05: comunicação via API REST com JSON).
// Lança um Error com a mensagem do servidor quando a denúncia não é registrada.
export async function registrarDenuncia(dados: NovaDenuncia): Promise<Denuncia> {
  let resposta: Response
  try {
    resposta = await fetch('/api/denuncias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    })
  } catch {
    throw new Error('Sem conexão com o servidor. Verifique sua internet e tente novamente.')
  }

  const corpo = await resposta.json().catch(() => null)
  if (!resposta.ok) {
    const erros: string[] = Array.isArray(corpo?.erros) ? corpo.erros : []
    throw new Error(erros.join(' ') || `O servidor respondeu com o erro ${resposta.status}.`)
  }
  return corpo as Denuncia
}
