// RNF07 em modo sandbox (seção 2.4 do documento): simula a cotação dos Correios/Melhor Envio
// de forma determinística, sem chamar serviços pagos. Para integrar de verdade, substitua
// cotarFrete por uma chamada à API do Melhor Envio mantendo o mesmo formato de retorno.

import { arredondar } from '../regras.js'

const PESO_KG_POR_CATEGORIA = {
  Guitarras: 4,
  Baixos: 5,
  'Violões': 4.5,
  'Pedais/Efeitos': 0.6,
  Amplificadores: 12,
  'Acessórios': 0.5,
}

// Origem fixa na região de CEP 0 (São Paulo) enquanto o endereço do vendedor não é estruturado.
const REGIAO_ORIGEM = 0

export function cotarFrete({ cepDestino, categoria }) {
  const regiaoDestino = Number(cepDestino.replace(/\D/g, '')[0])
  const distancia = Math.abs(regiaoDestino - REGIAO_ORIGEM)
  const peso = PESO_KG_POR_CATEGORIA[categoria] ?? 2

  return {
    valor: arredondar(19.9 + peso * 6.5 + distancia * 4.2),
    prazoDias: 3 + distancia,
    servico: 'Correios PAC',
    simulado: true,
  }
}
