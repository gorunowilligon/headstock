// Gateway de pagamento em modo sandbox (RF09 + seção 2.4): aprova toda transação
// e gera um "Pix copia e cola" fictício. Nenhum dado de cartão é recebido ou armazenado.

import crypto from 'node:crypto'

export function processarPagamento({ metodo, valor }) {
  const idTransacao = `sandbox_${crypto.randomUUID()}`
  const resultado = { idTransacao, metodo, valor, status: 'aprovado', simulado: true }

  if (metodo === 'pix') {
    resultado.pixCopiaECola = `00020126580014BR.GOV.BCB.PIX0136${idTransacao}5204000053039865406${valor.toFixed(2)}5802BR5909HEADSTOCK6009SAO PAULO`
  }
  return resultado
}
