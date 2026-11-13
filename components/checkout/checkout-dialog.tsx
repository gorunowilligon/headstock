'use client'

import { useState, type FormEvent } from 'react'
import { CheckCircle2, CreditCard, QrCode, ShoppingBag } from 'lucide-react'
import { Modal } from '@/components/common/modal'
import { Button } from '@/components/ui/button'
import { api, mensagemDeErro } from '@/lib/api'
import { formatarMoeda } from '@/lib/formatar'
import type { Frete, Pedido } from '@/lib/models'

interface RespostaCompra {
  pedido: Pedido
  pagamento: { idTransacao: string, status: string, pixCopiaECola?: string }
  frete: Frete
}

export interface ItemCheckout {
  idAnuncio: string
  titulo: string
  preco: number
  capa?: string
}

/** Checkout (RF09): cotação de frete pelo CEP, escolha do pagamento e criação do pedido. */
export function CheckoutDialog({ item, oferta, onClose, onConcluido }: {
  item: ItemCheckout
  /** Proposta aceita (RF08): o produto sai pelo valor dela. */
  oferta?: { idOferta: string, valor: number }
  onClose: () => void
  onConcluido: (pedido: Pedido) => void
}) {
  const [cep, setCep] = useState('')
  const [frete, setFrete] = useState<Frete | null>(null)
  const [metodo, setMetodo] = useState<'pix' | 'cartao'>('pix')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [compra, setCompra] = useState<RespostaCompra | null>(null)

  const valorProduto = oferta?.valor ?? item.preco
  const cepValido = /^\d{5}-?\d{3}$/.test(cep.trim())

  const executar = async (acao: () => Promise<void>) => {
    setCarregando(true)
    setErro('')
    try {
      await acao()
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setCarregando(false)
    }
  }

  const cotar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    return executar(async () => {
      setFrete(await api<Frete>('/frete/cotacao', { method: 'POST', body: { idAnuncio: item.idAnuncio, cepDestino: cep.trim() } }))
    })
  }

  const pagar = () => executar(async () => {
    setCompra(await api<RespostaCompra>('/pedidos', {
      method: 'POST',
      body: { idAnuncio: item.idAnuncio, metodoPagamento: metodo, cepDestino: cep.trim(), idOferta: oferta?.idOferta },
    }))
  })

  if (compra) {
    return (
      <Modal titulo="Compra confirmada" icone={<CheckCircle2 className="size-5" />} onClose={() => onConcluido(compra.pedido)}>
        <p className="mt-4 text-sm text-gray-600">
          Pagamento de <strong>{formatarMoeda(compra.pedido.valorTotal)}</strong> aprovado. O vendedor tem 3 dias úteis para informar o código de rastreio.
        </p>
        {compra.pagamento.pixCopiaECola && (
          <label className="mt-4 block text-xs font-semibold text-gray-500">
            Pix copia e cola
            <textarea readOnly value={compra.pagamento.pixCopiaECola} rows={3} className="mt-1 w-full resize-none rounded-lg border bg-gray-50 p-2 font-mono text-[11px]" />
          </label>
        )}
        <p className="mt-3 text-xs text-gray-400">Ambiente de testes (sandbox): nenhuma cobrança real foi feita. Transação {compra.pagamento.idTransacao}.</p>
        <Button onClick={() => onConcluido(compra.pedido)} className="mt-6 w-full bg-red-600 hover:bg-red-700">Acompanhar pedido</Button>
      </Modal>
    )
  }

  return (
    <Modal titulo="Finalizar compra" icone={<ShoppingBag className="size-5" />} onClose={onClose}>
      <div className="mt-5 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
        {item.capa && <img src={item.capa} alt="" className="size-14 rounded-lg object-cover" />}
        <div className="min-w-0">
          <p className="truncate font-semibold">{item.titulo}</p>
          <p className="text-sm text-gray-500">
            {oferta ? <>Proposta aceita: <strong className="text-red-600">{formatarMoeda(oferta.valor)}</strong> <s className="text-gray-400">{formatarMoeda(item.preco)}</s></> : formatarMoeda(item.preco)}
          </p>
        </div>
      </div>

      <form onSubmit={cotar} className="mt-5">
        <label className="block text-sm font-semibold" htmlFor="cep">CEP de entrega</label>
        <div className="mt-2 flex gap-2">
          <input id="cep" value={cep} onChange={(e) => { setCep(e.target.value); setFrete(null) }} inputMode="numeric" maxLength={9} placeholder="00000-000" required className="w-full rounded-lg border px-3 py-2.5" />
          <Button type="submit" variant="outline" disabled={!cepValido || carregando}>Calcular frete</Button>
        </div>
      </form>

      {frete && (
        <>
          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">Pagamento</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {([['pix', 'Pix', QrCode], ['cartao', 'Cartão', CreditCard]] as const).map(([valor, rotulo, Icone]) => (
                <label key={valor} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-semibold ${metodo === valor ? 'border-red-600 bg-red-50 text-red-700' : ''}`}>
                  <input type="radio" name="metodo" value={valor} checked={metodo === valor} onChange={() => setMetodo(valor)} className="sr-only" />
                  <Icone className="size-4" /> {rotulo}
                </label>
              ))}
            </div>
          </fieldset>
          <dl className="mt-5 flex flex-col gap-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt>Produto</dt><dd>{formatarMoeda(valorProduto)}</dd></div>
            <div className="flex justify-between"><dt>Frete ({frete.servico}, {frete.prazoDias} dias)</dt><dd>{formatarMoeda(frete.valor)}</dd></div>
            <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatarMoeda(valorProduto + frete.valor)}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-gray-500">O pagamento fica retido e só é liberado ao vendedor 48h após você confirmar a entrega.</p>
        </>
      )}

      {erro && <p role="alert" className="mt-4 text-sm font-semibold text-red-600">{erro}</p>}
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="button" onClick={pagar} disabled={!frete || carregando} className="bg-red-600 hover:bg-red-700">
          {carregando && frete ? 'Processando...' : frete ? `Pagar ${formatarMoeda(valorProduto + frete.valor)}` : 'Pagar'}
        </Button>
      </div>
    </Modal>
  )
}
