export const formatarPreco = (valor: number) => `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: Number.isInteger(valor) ? 0 : 2, maximumFractionDigits: 2 })}`

export const lerPreco = (preco: string) => Number(preco.replace(/[^\d,]/g, '').replace(',', '.'))
