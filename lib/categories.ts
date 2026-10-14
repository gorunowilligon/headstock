export const categorias = [
  { value: 'guitarra', label: 'Guitarra elétrica', tipo: 'Guitarras' },
  { value: 'contrabaixo', label: 'Contrabaixo', tipo: 'Baixos' },
  { value: 'violao', label: 'Violão', tipo: 'Violões' },
  { value: 'amp-guitarra', label: 'Amplificador de guitarra elétrica', tipo: 'Amplificadores' },
  { value: 'amp-contrabaixo', label: 'Amplificador de contrabaixo', tipo: 'Amplificadores' },
  { value: 'amp-violao', label: 'Amplificador de violão', tipo: 'Amplificadores' },
  { value: 'pedais', label: 'Pedais/Efeitos', tipo: 'Pedais/Efeitos' },
  { value: 'acessorios', label: 'Acessórios de cordas', tipo: 'Acessórios' },
] as const

export type Categoria = typeof categorias[number]['value']
