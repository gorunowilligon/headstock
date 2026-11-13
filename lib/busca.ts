import type { Anuncio } from '@/lib/models'

// RF05: busca de anúncios com filtros de marca, categoria, tipo de captação, condição, preço e localização.

export type Ordenacao = 'relevancia' | 'recentes' | 'menor-preco' | 'maior-preco'

export interface FiltrosBusca {
  termo: string
  categorias: string[]
  marcas: string[]
  tiposCaptacao: string[]
  condicoes: string[]
  localizacoes: string[]
  precoMinimo: string
  precoMaximo: string
  ordenacao: Ordenacao
}

export const filtrosVazios: FiltrosBusca = {
  termo: '',
  categorias: [],
  marcas: [],
  tiposCaptacao: [],
  condicoes: [],
  localizacoes: [],
  precoMinimo: '',
  precoMaximo: '',
  ordenacao: 'relevancia',
}

export interface ResultadoBusca {
  anuncios: Anuncio[]
  erroPreco: string
}

// Remove acentos e diferenças de maiúsculas, para "violao" encontrar "Violão".
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

// "Usado · Excelente" e "Usado · Bom" entram no mesmo filtro "Usado".
export const grupoDaCondicao = (condicao: string) => condicao.split('·')[0].trim()

// "Campinas, SP" → "SP"
export const estadoDaLocalizacao = (localizacao: string) => localizacao.split(',').pop()?.trim() ?? ''

// As categorias estão no plural; estes termos permitem buscar no singular ("violão" encontra "Violões").
const termosDaCategoria: Record<string, string> = {
  'Guitarras': 'guitarra',
  'Baixos': 'baixo contrabaixo',
  'Violões': 'violão',
  'Pedais/Efeitos': 'pedal efeito',
  'Amplificadores': 'amplificador',
  'Acessórios': 'acessório',
}

const textoPesquisavel = (anuncio: Anuncio) => normalizar([
  anuncio.titulo,
  anuncio.instrumento.marca,
  anuncio.instrumento.modelo,
  anuncio.instrumento.categoria,
  termosDaCategoria[anuncio.instrumento.categoria] ?? '',
  anuncio.instrumento.tipoCaptacao,
  anuncio.condicao,
  anuncio.localizacao,
  anuncio.descricao ?? '',
].join(' '))

// Cada palavra digitada precisa aparecer em algum campo do anúncio.
export const correspondeAoTermo = (anuncio: Anuncio, termo: string) => {
  const palavras = normalizar(termo).split(/\s+/).filter(Boolean)
  if (palavras.length === 0) return true
  const texto = textoPesquisavel(anuncio)
  return palavras.every((palavra) => texto.includes(palavra))
}

// Um grupo de filtros sem nenhuma opção marcada não restringe nada.
const passaNoGrupo = (valor: string, selecionados: string[]) => selecionados.length === 0 || selecionados.includes(valor)

const lerPreco = (valor: string) => (valor.trim() === '' ? undefined : Number(valor))

export function validarFaixaDePreco(precoMinimo: string, precoMaximo: string) {
  const minimo = lerPreco(precoMinimo)
  const maximo = lerPreco(precoMaximo)
  if ((minimo !== undefined && (Number.isNaN(minimo) || minimo < 0)) || (maximo !== undefined && (Number.isNaN(maximo) || maximo < 0))) {
    return { minimo: undefined, maximo: undefined, erro: 'Informe valores de preço positivos.' }
  }
  if (minimo !== undefined && maximo !== undefined && minimo > maximo) {
    return { minimo: undefined, maximo: undefined, erro: 'O preço mínimo não pode ser maior que o preço máximo.' }
  }
  return { minimo, maximo, erro: '' }
}

const ordenar = (anuncios: Anuncio[], ordenacao: Ordenacao) => {
  const copia = [...anuncios]
  if (ordenacao === 'recentes') copia.sort((a, b) => b.dataCriacao.localeCompare(a.dataCriacao))
  if (ordenacao === 'menor-preco') copia.sort((a, b) => a.preco - b.preco)
  if (ordenacao === 'maior-preco') copia.sort((a, b) => b.preco - a.preco)
  return copia
}

// Aplica o termo, os filtros e a ordenação. Se a faixa de preço for inválida, ela é ignorada e o erro é devolvido.
export function buscarAnuncios(anuncios: Anuncio[], filtros: FiltrosBusca): ResultadoBusca {
  const { minimo, maximo, erro } = validarFaixaDePreco(filtros.precoMinimo, filtros.precoMaximo)

  const filtrados = anuncios.filter((anuncio) =>
    correspondeAoTermo(anuncio, filtros.termo)
    && passaNoGrupo(anuncio.instrumento.categoria, filtros.categorias)
    && passaNoGrupo(anuncio.instrumento.marca, filtros.marcas)
    && passaNoGrupo(anuncio.instrumento.tipoCaptacao, filtros.tiposCaptacao)
    && passaNoGrupo(grupoDaCondicao(anuncio.condicao), filtros.condicoes)
    && passaNoGrupo(estadoDaLocalizacao(anuncio.localizacao), filtros.localizacoes)
    && (minimo === undefined || anuncio.preco >= minimo)
    && (maximo === undefined || anuncio.preco <= maximo))

  return { anuncios: ordenar(filtrados, filtros.ordenacao), erroPreco: erro }
}

export interface OpcaoFiltro {
  valor: string
  quantidade: number
}

// Lista as opções de um filtro a partir dos anúncios, com a quantidade de anúncios de cada uma.
export function opcoesDoFiltro(anuncios: Anuncio[], valorDe: (anuncio: Anuncio) => string): OpcaoFiltro[] {
  const contagem = new Map<string, number>()
  for (const anuncio of anuncios) {
    const valor = valorDe(anuncio)
    if (valor) contagem.set(valor, (contagem.get(valor) ?? 0) + 1)
  }
  return [...contagem].map(([valor, quantidade]) => ({ valor, quantidade })).sort((a, b) => a.valor.localeCompare(b.valor, 'pt-BR'))
}

export const quantidadeDeFiltrosAtivos = (filtros: FiltrosBusca) =>
  filtros.categorias.length + filtros.marcas.length + filtros.tiposCaptacao.length + filtros.condicoes.length + filtros.localizacoes.length
  + (filtros.precoMinimo.trim() ? 1 : 0) + (filtros.precoMaximo.trim() ? 1 : 0)
