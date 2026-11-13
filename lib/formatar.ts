import type { StatusOferta, StatusPedido } from '@/lib/models'

export const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatarDataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export const formatarHora = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

export const formatarData = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')

/** "em 23h", "em 15 min" ou "expirada". */
export function tempoRestante(iso: string) {
  const minutos = Math.round((new Date(iso).getTime() - Date.now()) / 60_000)
  if (minutos <= 0) return 'expirada'
  return minutos >= 60 ? `em ${Math.floor(minutos / 60)}h` : `em ${minutos} min`
}

export const iniciais = (nome: string) => nome.split(' ').filter(Boolean).map((parte) => parte[0]).slice(0, 2).join('').toUpperCase()

export const rotuloStatusPedido: Record<StatusPedido, string> = {
  pago: 'Pago · aguardando envio',
  enviado: 'Enviado',
  entregue: 'Entregue',
  concluido: 'Concluído',
  em_disputa: 'Em disputa',
  devolucao_autorizada: 'Devolução autorizada',
  reembolsado: 'Reembolsado',
  cancelado: 'Cancelado',
}

export const rotuloStatusOferta: Record<StatusOferta, string> = {
  pendente: 'Aguardando resposta',
  aceita: 'Aceita',
  recusada: 'Recusada',
  substituida: 'Substituída por outra proposta',
  cancelada: 'Cancelada',
  expirada: 'Expirada',
  utilizada: 'Usada na compra',
}
