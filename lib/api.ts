// Cliente HTTP da API do Headstock (backend/). Toda comunicação passa por aqui (RNF05).

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333').replace(/\/$/, '')
const TOKEN_KEY = 'headstock:token'

export class ApiError extends Error {
  status: number
  detalhes?: unknown

  constructor(status: number, mensagem: string, detalhes?: unknown) {
    super(mensagem)
    this.status = status
    this.detalhes = detalhes
  }
}

export const tokenStorage = {
  ler(): string | null {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  },
  salvar(token: string) {
    try { localStorage.setItem(TOKEN_KEY, token) } catch {}
  },
  limpar() {
    try { localStorage.removeItem(TOKEN_KEY) } catch {}
  },
}

let aoExpirarSessao: (() => void) | null = null
/** Registra o que fazer quando a API recusar o token (expirado, usuário banido...). */
export const definirAoExpirarSessao = (fn: (() => void) | null) => { aoExpirarSessao = fn }

interface Opcoes {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  formData?: FormData
  query?: Record<string, string | number | undefined>
}

function montarMensagem(corpo: { erro?: string, detalhes?: unknown } | null, status: number) {
  const base = corpo?.erro ?? `Erro ${status} ao falar com o servidor`
  const lista: unknown = corpo?.detalhes
  const detalhes = Array.isArray(lista)
    ? lista.map((d) => (typeof d === 'object' && d && 'mensagem' in d ? String(d.mensagem) : null)).filter(Boolean)
    : []
  return detalhes.length ? `${base}: ${detalhes.join('; ')}` : base
}

export async function api<T = void>(caminho: string, { method = 'GET', body, formData, query }: Opcoes = {}): Promise<T> {
  const url = new URL(BASE_URL + caminho)
  for (const [chave, valor] of Object.entries(query ?? {})) {
    if (valor !== undefined && valor !== '') url.searchParams.set(chave, String(valor))
  }

  const token = tokenStorage.ler()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let resposta: Response
  try {
    resposta = await fetch(url, { method, headers, body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined) })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique se a API está no ar.')
  }

  if (resposta.status === 204) return undefined as T
  const corpo = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    // 401 com token enviado = sessão inválida. Sem token (ex.: senha errada no login) não derruba a sessão.
    if (resposta.status === 401 && token) {
      tokenStorage.limpar()
      aoExpirarSessao?.()
    }
    throw new ApiError(resposta.status, montarMensagem(corpo, resposta.status), corpo?.detalhes)
  }
  return corpo as T
}

export const mensagemDeErro = (erro: unknown) => erro instanceof Error ? erro.message : 'Ocorreu um erro inesperado'
