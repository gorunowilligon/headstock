export type Ordenacao = 'recentes' | 'menor_preco' | 'maior_preco'

/** Valores dos filtros guardados no estado da tela (dados, sem métodos). */
export interface DadosFiltros {
  categorias: string[]
  marcas: string[]
  condicoes: string[]
  tiposCaptacao: string[]
  precoMin: string
  precoMax: string
  localizacao: string
  ordenar: Ordenacao
}

// Categorias do escopo inicial (seção 2.4 dos requisitos) e condições aceitas pelo formulário de venda.
export const categoriasDoFiltro = ['Guitarras', 'Baixos', 'Violões', 'Amplificadores', 'Pedais/Efeitos', 'Acessórios']
export const condicoesDoFiltro = ['Novo', 'Seminovo', 'Usado']

export const filtrosVazios: DadosFiltros = {
  categorias: [categoriasDoFiltro[0]],
  marcas: [],
  condicoes: [],
  tiposCaptacao: [],
  precoMin: '',
  precoMax: '',
  localizacao: '',
  ordenar: 'recentes',
}

export const opcoesOrdenacao: { valor: Ordenacao, rotulo: string }[] = [
  { valor: 'recentes', rotulo: 'Mais recentes' },
  { valor: 'menor_preco', rotulo: 'Menor preço' },
  { valor: 'maior_preco', rotulo: 'Maior preço' },
]

/** Quantidade de filtros ativos. Ordenação e seção (categoria) não contam: a seção é uma aba, não um filtro. */
export function contarFiltros(f: DadosFiltros) {
  return f.marcas.length + f.condicoes.length + f.tiposCaptacao.length
    + (f.precoMin || f.precoMax ? 1 : 0) + (f.localizacao.trim() ? 1 : 0)
}

/** Limpa os filtros, mantendo a seção aberta e a ordenação. */
export const limparFiltros = (f: DadosFiltros): DadosFiltros => ({ ...filtrosVazios, categorias: f.categorias, ordenar: f.ordenar })

/**
 * Classe Filtros do diagrama de classes (RF05).
 * É criada a partir dos dados da tela no momento da busca (new Filtros(dados)),
 * porque o estado do React é copiado com {...filtros} e a cópia perderia os métodos.
 */
export class Filtros implements DadosFiltros {
  categorias: string[]
  marcas: string[]
  condicoes: string[]
  tiposCaptacao: string[]
  precoMin: string
  precoMax: string
  localizacao: string
  ordenar: Ordenacao

  constructor(dados: DadosFiltros) {
    this.categorias = dados.categorias
    this.marcas = dados.marcas
    this.condicoes = dados.condicoes
    this.tiposCaptacao = dados.tiposCaptacao
    this.precoMin = dados.precoMin
    this.precoMax = dados.precoMax
    this.localizacao = dados.localizacao
    this.ordenar = dados.ordenar
  }

  /** validos = validar() : boolean — preços vazios ou maiores ou iguais a zero, e mínimo menor ou igual ao máximo. */
  validar(): boolean {
    const min = this.precoMin.trim() === '' ? undefined : Number(this.precoMin)
    const max = this.precoMax.trim() === '' ? undefined : Number(this.precoMax)
    if (min !== undefined && (Number.isNaN(min) || min < 0)) return false
    if (max !== undefined && (Number.isNaN(max) || max < 0)) return false
    if (min !== undefined && max !== undefined && min > max) return false
    return true
  }
}

/** Converte os filtros nos parâmetros de GET /anuncios (valores vazios são ignorados pelo cliente). */
export function paraQuery(f: DadosFiltros): Record<string, string | undefined> {
  return {
    categoria: f.categorias.join(','),
    marca: f.marcas.join(','),
    condicao: f.condicoes.join(','),
    tipoCaptacao: f.tiposCaptacao.join(','),
    precoMin: f.precoMin.trim(),
    precoMax: f.precoMax.trim(),
    localizacao: f.localizacao.trim(),
    ordenar: f.ordenar,
  }
}
