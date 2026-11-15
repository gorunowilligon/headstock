'use client'

import { useState, type FormEvent } from 'react'
import { CircleDollarSign } from 'lucide-react'
import { Modal } from '@/components/common/modal'
import { Button } from '@/components/ui/button'
import { mensagemDeErro } from '@/lib/api'
import { marcarInvalido } from '@/lib/validacao'
import { formatarMoeda } from '@/lib/formatar'

/** Formulário de valor usado para propostas e contrapropostas (RF07). */
export function OfferDialog({ titulo, precoAnuncio, valorAtual, onEnviar, onClose }: {
  titulo: string
  precoAnuncio: number
  /** Valor da proposta que está sendo respondida (contraproposta). */
  valorAtual?: number
  onEnviar: (valor: number) => Promise<void>
  onClose: () => void
}) {
  const [valor, setValor] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const numero = Number(valor)

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const campo = e.currentTarget.valor
    if (!valor.trim()) { marcarInvalido(campo); return setErro('Informe o valor da sua proposta.') }
    if (!(numero > 0)) { marcarInvalido(campo); return setErro('Informe um valor maior que zero.') }
    if (numero >= precoAnuncio) { marcarInvalido(campo); return setErro(`A proposta deve ser menor que o preço do anúncio (${formatarMoeda(precoAnuncio)}).`) }
    setEnviando(true)
    setErro('')
    try {
      await onEnviar(numero)
    } catch (e) {
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <Modal titulo={titulo} icone={<CircleDollarSign className="size-5" />} onClose={onClose}>
      <form onSubmit={enviar} noValidate>
        <p className="mt-4 text-sm text-gray-600">
          Preço anunciado: <strong>{formatarMoeda(precoAnuncio)}</strong>
          {valorAtual !== undefined && <> · Proposta atual: <strong>{formatarMoeda(valorAtual)}</strong></>}
        </p>
        {Number.isFinite(precoAnuncio) && precoAnuncio > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[0.95, 0.9, 0.85].map((fator) => {
              const sugerido = Math.round(precoAnuncio * fator)
              return (
                <button
                  key={fator}
                  type="button"
                  onClick={() => { setValor(String(sugerido)); setErro('') }}
                  className="rounded-lg border bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:border-red-600 hover:text-red-600"
                >
                  {formatarMoeda(sugerido)} (-{Math.round((1 - fator) * 100)}%)
                </button>
              )
            })}
          </div>
        )}
        <label className="mt-4 block text-sm font-semibold">
          Seu valor
          <div className="mt-2 flex items-center rounded-lg border px-3">
            <span className="text-gray-400">R$</span>
            <input name="valor" value={valor} onChange={(e) => { setValor(e.target.value); setErro('') }} type="number" min={1} step={0.01} required autoFocus className="w-full px-2 py-3 outline-none" />
          </div>
        </label>
        <p className="mt-2 text-xs text-gray-500">A outra parte tem 24h para aceitar, recusar ou responder com outro valor.</p>
        {erro && <p role="alert" className="mt-3 text-sm font-semibold text-red-600">{erro}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={enviando} className="bg-red-600 hover:bg-red-700">{enviando ? 'Enviando...' : 'Enviar proposta'}</Button>
        </div>
      </form>
    </Modal>
  )
}
