// Especificações técnicas que não são colunas de Instrumento (ano, madeiras, ponte, potência...).
// Vão para Instrumento.especificacoes (JSON) no backend. Os campos do formulário usam o nome "esp.<chave>".

import { categorias, type Categoria } from '@/lib/categories'
import type { Instrumento } from '@/lib/models'

export type ValorEspecificacao = string | number | boolean
export type Especificacoes = Record<string, ValorEspecificacao>

export const PREFIXO = 'esp.'
export const nomeDoCampo = (chave: string) => PREFIXO + chave

/** Rótulo de cada chave, na ordem em que aparecem na tela de detalhes. */
export const rotulosEspecificacoes: Record<string, string> = {
  anoFabricacao: 'Ano de fabricação',
  corAcabamento: 'Cor / acabamento',
  paisOrigem: 'País de origem',
  // Guitarra e baixo
  tipoCorpo: 'Tipo de corpo',
  madeiraCorpo: 'Madeira do corpo',
  madeiraBraco: 'Madeira do braço',
  madeiraEscala: 'Madeira da escala',
  tipoPonte: 'Tipo de ponte',
  // Violão
  formatoCorpo: 'Formato do corpo',
  madeiraTampo: 'Madeira do tampo',
  fundoLaterais: 'Fundo e laterais',
  tipoCorda: 'Tipo de corda',
  // Amplificador
  tipoCircuito: 'Tipo de circuito',
  formatoAmplificador: 'Formato',
  potenciaWatts: 'Potência (W)',
  configuracaoFalantes: 'Configuração de falantes',
  // Pedal
  tipoEfeito: 'Tipo de efeito',
  sinal: 'Sinal',
  bypass: 'Bypass',
  // Acessório
  tipoAcessorio: 'Tipo de acessório',
}

const camposNumericos = new Set(['anoFabricacao', 'potenciaWatts'])

/** Lê do formulário os campos "esp.*" preenchidos. A subcategoria guarda a escolha exata (ex.: amp de baixo). */
export function lerEspecificacoes(dados: FormData, subcategoria: Categoria | ''): Especificacoes {
  const especificacoes: Especificacoes = {}
  for (const [nome, valor] of dados.entries()) {
    if (!nome.startsWith(PREFIXO) || typeof valor !== 'string' || !valor.trim()) continue
    const chave = nome.slice(PREFIXO.length)
    especificacoes[chave] = camposNumericos.has(chave) ? Number(valor) : valor.trim()
  }
  if (subcategoria) especificacoes.subcategoria = subcategoria
  return especificacoes
}

/** Linhas exibidas na tela de detalhes, na ordem dos rótulos. */
export function linhasEspecificacoes(especificacoes: Especificacoes | undefined) {
  if (!especificacoes) return []
  return Object.entries(rotulosEspecificacoes)
    .filter(([chave]) => especificacoes[chave] !== undefined && especificacoes[chave] !== '')
    .map(([chave, rotulo]) => ({ chave, rotulo, valor: String(especificacoes[chave]) }))
}

/** Descobre a categoria do formulário a partir de um instrumento salvo. */
export function categoriaDoInstrumento(instrumento: Instrumento): Categoria | '' {
  const salva = instrumento.especificacoes?.subcategoria
  if (typeof salva === 'string' && categorias.some((c) => c.value === salva)) return salva as Categoria
  return categorias.find((c) => c.tipo === instrumento.categoria)?.value ?? ''
}

/** Valores iniciais dos campos (instrumento + especificações), usados na edição do anúncio. */
export type ValoresIniciais = Record<string, string | number | undefined>

export function valoresIniciais(instrumento?: Instrumento): ValoresIniciais {
  if (!instrumento) return {}
  const valores: ValoresIniciais = {
    marca: instrumento.marca,
    modelo: instrumento.modelo,
    tipoCaptacao: instrumento.tipoCaptacao,
    numeroCordas: instrumento.numeroCordas || undefined,
    orientacao: instrumento.orientacao,
  }
  for (const [chave, valor] of Object.entries(instrumento.especificacoes ?? {})) {
    if (typeof valor !== 'boolean') valores[nomeDoCampo(chave)] = valor
  }
  return valores
}
