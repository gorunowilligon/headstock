export interface EstadoBrasil {
  sigla: string
  nome: string
}

export const ESTADOS_BRASIL: EstadoBrasil[] = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
]

const SIGLAS_UF = new Set(ESTADOS_BRASIL.map((e) => e.sigla))

const CIDADES_FALLBACK: Record<string, string[]> = {
  AC: ['Cruzeiro do Sul', 'Rio Branco'],
  AL: ['Arapiraca', 'Maceió'],
  AP: ['Macapá', 'Santana'],
  AM: ['Manaus', 'Parintins'],
  BA: ['Feira de Santana', 'Ilhéus', 'Salvador', 'Vitória da Conquista'],
  CE: ['Caucaia', 'Fortaleza', 'Juazeiro do Norte', 'Sobral'],
  DF: ['Brasília'],
  ES: ['Cachoeiro de Itapemirim', 'Serra', 'Vila Velha', 'Vitória'],
  GO: ['Anápolis', 'Aparecida de Goiânia', 'Goiânia', 'Rio Verde'],
  MA: ['Imperatriz', 'São Luís'],
  MT: ['Cuiabá', 'Rondonópolis', 'Sinop', 'Várzea Grande'],
  MS: ['Campo Grande', 'Corumbá', 'Dourados', 'Três Lagoas'],
  MG: ['Belo Horizonte', 'Contagem', 'Juiz de Fora', 'Montes Claros', 'Uberaba', 'Uberlândia'],
  PA: ['Ananindeua', 'Belém', 'Marabá', 'Santarém'],
  PB: ['Campina Grande', 'João Pessoa'],
  PR: ['Cascavel', 'Curitiba', 'Foz do Iguaçu', 'Londrina', 'Maringá', 'Ponta Grossa'],
  PE: ['Caruaru', 'Jaboatão dos Guararapes', 'Olinda', 'Petrolina', 'Recife'],
  PI: ['Parnaíba', 'Teresina'],
  RJ: ['Campos dos Goytacazes', 'Duque de Caxias', 'Niterói', 'Petrópolis', 'Rio de Janeiro', 'Volta Redonda'],
  RN: ['Mossoró', 'Natal', 'Parnamirim'],
  RS: ['Canoas', 'Caxias do Sul', 'Passo Fundo', 'Pelotas', 'Porto Alegre', 'Santa Maria'],
  RO: ['Ji-Paraná', 'Porto Velho'],
  RR: ['Boa Vista'],
  SC: ['Blumenau', 'Chapecó', 'Criciúma', 'Florianópolis', 'Itajaí', 'Joinville', 'São José'],
  SP: ['Bauru', 'Campinas', 'Guarulhos', 'Jundiaí', 'Osasco', 'Piracicaba', 'Ribeirão Preto', 'Santo André', 'Santos', 'São Bernardo do Campo', 'São José do Rio Preto', 'São José dos Campos', 'São Paulo', 'Sorocaba'],
  SE: ['Aracaju', 'Nossa Senhora do Socorro'],
  TO: ['Araguaína', 'Palmas'],
}

const cacheMunicipios = new Map<string, string[]>()

/** Busca todos os municípios oficiais da UF na API do IBGE (com cache em memória e fallback offline). */
export async function buscarCidadesPorUf(uf: string): Promise<string[]> {
  const sigla = uf.toUpperCase()
  if (!SIGLAS_UF.has(sigla)) return []
  const emCache = cacheMunicipios.get(sigla)
  if (emCache) return emCache

  try {
    const resposta = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${sigla}/municipios?orderBy=nome`)
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`)
    const dados: { nome: string }[] = await resposta.json()
    const nomes = [...new Set(dados.map((m) => m.nome))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
    if (nomes.length > 0) {
      cacheMunicipios.set(sigla, nomes)
      return nomes
    }
  } catch {}

  return CIDADES_FALLBACK[sigla] ?? []
}

/**
 * Extrai { uf, cidade } de textos como "São Paulo, SP", "Av. Paulista, 1500, São Paulo, SP" ou "Curitiba - PR".
 */
export function extrairCidadeUf(localizacao?: string): { uf: string, cidade: string } {
  if (!localizacao) return { uf: '', cidade: '' }
  const limpo = localizacao.trim()
  const match = limpo.match(/([^,-]+?)\s*[,/-]\s*([A-Za-z]{2})$/)
  if (!match) return { uf: '', cidade: '' }
  const uf = match[2].toUpperCase()
  if (!SIGLAS_UF.has(uf)) return { uf: '', cidade: '' }
  const partes = match[1].split(',').map((p) => p.trim()).filter(Boolean)
  const cidade = partes.at(-1) ?? ''
  return { uf, cidade }
}
