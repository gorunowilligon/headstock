export type Ordenacao = 'recentes' | 'menor_preco' | 'maior_preco'

export interface Filtros {
  categorias: string[]
  marcas: string[]
  condicoes: string[]
  tiposCaptacao: string[]
  precoMin: string
  precoMax: string
  localizacao: string
  ordenar: Ordenacao
}

export const filtrosVazios: Filtros = {
  categorias: [],
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

// Categorias do escopo inicial (seção 2.4 dos requisitos) e condições aceitas pelo formulário de venda.
export const categoriasDoFiltro = ['Guitarras', 'Baixos', 'Violões', 'Amplificadores', 'Pedais/Efeitos', 'Acessórios']
export const condicoesDoFiltro = ['Novo', 'Seminovo', 'Usado']

/** Quantidade de filtros ativos. Ordenação e seção (categoria) não contam: a seção é uma aba, não um filtro. */
export function contarFiltros(f: Filtros) {
  return f.marcas.length + f.condicoes.length + f.tiposCaptacao.length
    + (f.precoMin || f.precoMax ? 1 : 0) + (f.localizacao.trim() ? 1 : 0)
}

/** Limpa os filtros, mantendo a seção aberta e a ordenação. */
export const limparFiltros = (f: Filtros): Filtros => ({ ...filtrosVazios, categorias: f.categorias, ordenar: f.ordenar })

/** Converte os filtros nos parâmetros de GET /anuncios (valores vazios são ignorados pelo cliente). */
export function paraQuery(f: Filtros): Record<string, string | undefined> {
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
