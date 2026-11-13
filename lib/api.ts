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

// ---- Mensagens para o usuário -------------------------------------------------
// O usuário nunca vê status HTTP, códigos de requisito (RF07...), mensagens técnicas
// ou textos da validação do servidor. O detalhe técnico vai para o console.

const MENSAGEM_SEM_CONEXAO = 'Não foi possível conectar. Verifique sua internet e tente novamente.'
const MENSAGEM_FALHA_SERVIDOR = 'Algo deu errado do nosso lado. Tente novamente em instantes.'
const MENSAGEM_INESPERADA = 'Não foi possível concluir a ação. Tente novamente.'

/** Nome amigável dos campos validados pelo servidor. */
const rotulosDosCampos: Record<string, string> = {
  nome: 'Nome',
  email: 'E-mail',
  senha: 'Senha',
  novaSenha: 'Nova senha',
  token: 'Código de recuperação',
  chavePix: 'Chave Pix',
  enderecoCompleto: 'Endereço',
  condicao: 'Condição do item',
  preco: 'Valor do anúncio',
  localizacao: 'Localização',
  descricao: 'Descrição',
  fotos: 'Fotos',
  idInstrumentoCatalogo: 'Instrumento',
  marca: 'Marca',
  modelo: 'Modelo',
  categoria: 'Categoria',
  tipoCaptacao: 'Captação',
  numeroCordas: 'Número de cordas',
  orientacao: 'Orientação',
  especificacoes: 'Especificações',
  motivo: 'Motivo',
  descricaoTextual: 'Descrição',
  conteudo: 'Mensagem',
  valor: 'Valor',
  cepDestino: 'CEP',
  codigoRastreio: 'Código de rastreio',
  notaEstrelas: 'Nota',
  textoJustificativo: 'Justificativa',
}

/** Remove referências internas, como "(RF07)" ou "(RNF08)". */
const limparCodigos = (texto: string) => texto.replace(/\s*\((?:RF|RNF|RN)\d+[^)]*\)/g, '').trim()

function mensagemDeValidacao(detalhes: unknown) {
  const campos = Array.isArray(detalhes)
    ? detalhes.map((d) => (typeof d === 'object' && d && 'campo' in d ? String(d.campo) : ''))
    : []
  const rotulos = [...new Set(campos.map((campo) => rotulosDosCampos[campo.split('.').at(-1) ?? ''] ?? rotulosDosCampos[campo.split('.')[0]]).filter(Boolean))]
  if (!rotulos.length) return 'Alguns dados estão inválidos. Revise o formulário e tente novamente.'
  return `Revise ${rotulos.length === 1 ? 'o campo' : 'os campos'}: ${juntar(rotulos)}.`
}

/** "a", "a e b", "a, b e c". */
export const juntar = (itens: string[]) => itens.length <= 1 ? itens.join('') : `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`

function montarMensagem(corpo: { erro?: string, detalhes?: unknown } | null, status: number, comToken: boolean) {
  const doServidor = corpo?.erro ? limparCodigos(corpo.erro) : ''
  if (status >= 500) return MENSAGEM_FALHA_SERVIDOR
  if (status === 429) return 'Muitas tentativas seguidas. Aguarde um minuto e tente novamente.'
  if (status === 401 && comToken) return 'Sua sessão expirou. Entre novamente para continuar.'
  if (status === 413) return doServidor || 'O arquivo enviado é grande demais.'
  if (status === 400 && corpo?.erro === 'Dados inválidos') return mensagemDeValidacao(corpo.detalhes)
  if (status === 404) return doServidor && !/^(Recurso|Registro|Rota)/.test(doServidor) ? `${doServidor}. Ele pode ter sido removido.` : 'Não encontramos o que você procurava. Ele pode ter sido removido.'
  // Demais respostas (400, 401, 403, 409...) trazem mensagens de regra de negócio escritas para o usuário.
  return doServidor || MENSAGEM_INESPERADA
}

export async function api<T = void>(caminho: string, { method = 'GET', body, formData, query }: Opcoes = {}): Promise<T> {
  const url = new URL(BASE_URL + caminho)
  for (const [chave, valor] of Object.entries(query ?? {})) {
    if (valor !== undefined && valor !== '') url.searchParams.set(chave, String(valor))
  }

  // Login, cadastro e recuperação de senha não usam sessão: um token antigo guardado
  // faria uma senha errada parecer "sessão expirada".
  const token = caminho.startsWith('/auth/') ? null : tokenStorage.ler()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let resposta: Response
  try {
    resposta = await fetch(url, { method, headers, body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined) })
  } catch (erro) {
    console.error(`[api] ${method} ${caminho}: sem resposta (API fora do ar, CORS ou rede)`, erro)
    throw new ApiError(0, MENSAGEM_SEM_CONEXAO)
  }

  if (resposta.status === 204) return undefined as T
  const corpo = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    // 401 com token enviado = sessão inválida. Sem token (ex.: senha errada no login) não derruba a sessão.
    if (resposta.status === 401 && token) {
      tokenStorage.limpar()
      aoExpirarSessao?.()
    }
    console.error(`[api] ${method} ${caminho}: HTTP ${resposta.status}`, corpo)
    throw new ApiError(resposta.status, montarMensagem(corpo, resposta.status, Boolean(token)), corpo?.detalhes)
  }
  return corpo as T
}

/** Erro com texto já escrito para o usuário (ex.: validação feita no navegador). */
export class ErroAmigavel extends Error {}

/** Texto seguro para mostrar ao usuário. Erros de programação (TypeError etc.) viram uma mensagem genérica. */
export function mensagemDeErro(erro: unknown) {
  if (erro instanceof ApiError || erro instanceof ErroAmigavel) return erro.message
  console.error(erro)
  return MENSAGEM_INESPERADA
}
