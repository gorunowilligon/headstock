'use client'

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { AlertTriangle, Package, Receipt, Star } from 'lucide-react'
import { Modal } from '@/components/common/modal'
import { Button } from '@/components/ui/button'
import { capaDoAnuncio } from '@/lib/anuncio'
import { api, mensagemDeErro } from '@/lib/api'
import { formatarData, formatarDataHora, formatarMoeda, rotuloStatusPedido } from '@/lib/formatar'
import type { Avaliacao, Pedido, Recibo } from '@/lib/models'
import { validarFormulario } from '@/lib/validacao'

type Papel = 'comprador' | 'vendedor'

type Janela =
  | { tipo: 'disputa', pedido: Pedido }
  | { tipo: 'avaliacao', pedido: Pedido, alvo: Avaliacao['tipoAvaliacao'] }
  | { tipo: 'recibo', recibo: Recibo }

const corDoStatus: Record<string, string> = {
  pago: 'bg-amber-50 text-amber-700',
  enviado: 'bg-blue-50 text-blue-700',
  entregue: 'bg-green-50 text-green-700',
  concluido: 'bg-green-50 text-green-700',
  em_disputa: 'bg-red-50 text-red-700',
}

/** Compras ou vendas do usuário, com as ações de cada etapa do pedido (RF09, RF11, RN02–RN04, RN09). */
export function Pedidos({ papel }: { papel: Papel }) {
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null)
  const [erro, setErro] = useState('')
  const [janela, setJanela] = useState<Janela | null>(null)

  const carregar = useCallback(async () => {
    try {
      setPedidos(await api<Pedido[]>('/pedidos', { query: { papel } }))
      setErro('')
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }, [papel])

  useEffect(() => { carregar() }, [carregar])

  const executar = async (acao: () => Promise<unknown>) => {
    setErro('')
    try {
      await acao()
      setJanela(null)
      await carregar()
    } catch (e) {
      setErro(mensagemDeErro(e))
      throw e
    }
  }

  const verRecibo = async (pedido: Pedido) => {
    try {
      setJanela({ tipo: 'recibo', recibo: await api<Recibo>(`/pedidos/${pedido.idPedido}/recibo`) })
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }

  if (!pedidos) {
    if (!erro) return <p className="mt-6 text-sm text-gray-500">Carregando...</p>
    return (
      <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm">
        <p role="alert" className="font-semibold text-red-700">Não foi possível carregar seus pedidos. {erro}</p>
        <Button size="sm" variant="outline" onClick={() => { setErro(''); carregar() }} className="mt-3">Tentar novamente</Button>
      </div>
    )
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {erro && <p role="alert" className="text-sm font-semibold text-red-600">{erro}</p>}
      {pedidos.length === 0 && (
        <p className="rounded-xl border-2 border-dashed p-6 text-center text-sm text-gray-500">
          {papel === 'comprador' ? 'Você ainda não comprou nada.' : 'Você ainda não vendeu nada.'}
        </p>
      )}
      {pedidos.map((pedido) => (
        <article key={pedido.idPedido} className="rounded-xl border p-4">
          <div className="flex gap-4">
            {pedido.anuncio && <img src={capaDoAnuncio(pedido.anuncio)} alt="" className="size-16 shrink-0 rounded-lg object-cover" />}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="truncate font-semibold">{pedido.anuncio?.titulo ?? 'Anúncio'}</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${corDoStatus[pedido.statusPedido] ?? 'bg-gray-100 text-gray-700'}`}>{rotuloStatusPedido[pedido.statusPedido]}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Pedido de {formatarData(pedido.dataCriacao)} · {pedido.metodoPagamento === 'pix' ? 'Pix' : 'Cartão'}
                {papel === 'vendedor' && pedido.comprador && <> · Comprador: {pedido.comprador.nome}</>}
                {pedido.idOferta && <> · Proposta aceita</>}
              </p>
              <p className="mt-1 text-sm">
                {papel === 'comprador'
                  ? <>Total pago: <strong>{formatarMoeda(pedido.valorTotal)}</strong> (frete {formatarMoeda(pedido.valorFrete)})</>
                  : <>Você recebe: <strong>{formatarMoeda(pedido.valorRepasseVendedor)}</strong> (taxa {formatarMoeda(pedido.taxaPlataforma)})</>}
              </p>
              {pedido.codigoRastreio && <p className="mt-1 text-xs text-gray-600">Rastreio: <strong>{pedido.codigoRastreio}</strong></p>}
            </div>
          </div>
          <AcoesDoPedido pedido={pedido} papel={papel} executar={executar} abrir={setJanela} verRecibo={verRecibo} />
        </article>
      ))}

      {janela?.tipo === 'disputa' && (
        <FormularioTexto
          titulo="Abrir disputa"
          icone={<AlertTriangle className="size-5" />}
          explicacao="Descreva o problema com o instrumento. O pagamento fica retido até a análise da moderação."
          minimo={10}
          rotuloBotao="Abrir disputa"
          onClose={() => setJanela(null)}
          onEnviar={(motivo) => executar(() => api(`/pedidos/${janela.pedido.idPedido}/disputa`, { method: 'POST', body: { motivo } }))}
        />
      )}
      {janela?.tipo === 'avaliacao' && (
        <FormularioAvaliacao
          alvo={janela.alvo}
          onClose={() => setJanela(null)}
          onEnviar={(notaEstrelas, textoJustificativo) => executar(() => api(`/pedidos/${janela.pedido.idPedido}/avaliacoes`, {
            method: 'POST',
            body: { tipoAvaliacao: janela.alvo, notaEstrelas, textoJustificativo },
          }))}
        />
      )}
      {janela?.tipo === 'recibo' && (
        <Modal titulo={`Recibo ${janela.recibo.numero}`} icone={<Receipt className="size-5" />} onClose={() => setJanela(null)}>
          <dl className="mt-5 flex flex-col gap-2 text-sm">
            <div className="flex justify-between"><dt>Anúncio</dt><dd className="font-semibold">{janela.recibo.anuncio.titulo}</dd></div>
            <div className="flex justify-between"><dt>Emitido em</dt><dd>{formatarDataHora(janela.recibo.emitidoEm)}</dd></div>
            <div className="flex justify-between"><dt>Valor do produto</dt><dd>{formatarMoeda(janela.recibo.valorProduto)}</dd></div>
            <div className="flex justify-between"><dt>Taxa da plataforma ({janela.recibo.percentualTaxa}%)</dt><dd>- {formatarMoeda(janela.recibo.taxaPlataforma)}</dd></div>
            <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Repasse ao vendedor</dt><dd>{formatarMoeda(janela.recibo.valorRepasseVendedor)}</dd></div>
          </dl>
          <Button onClick={() => window.print()} variant="outline" className="mt-6 w-full">Imprimir</Button>
        </Modal>
      )}
    </div>
  )
}

function AcoesDoPedido({ pedido, papel, executar, abrir, verRecibo }: {
  pedido: Pedido
  papel: Papel
  executar: (acao: () => Promise<unknown>) => Promise<void>
  abrir: (janela: Janela) => void
  verRecibo: (pedido: Pedido) => void
}) {
  const [codigo, setCodigo] = useState('')
  const avaliou = (tipo: Avaliacao['tipoAvaliacao']) => pedido.avaliacoes?.some((a) => a.tipoAvaliacao === tipo)
  const dentroDoPrazoDeDisputa = pedido.prazoDisputaAte && new Date(pedido.prazoDisputaAte) > new Date()

  const [erroRastreio, setErroRastreio] = useState('')
  const informarRastreio = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const problema = validarFormulario(e.currentTarget)
    setErroRastreio(problema ?? '')
    if (problema) return
    executar(() => api(`/pedidos/${pedido.idPedido}/rastreio`, { method: 'POST', body: { codigoRastreio: codigo.trim() } })).catch(() => {})
  }

  if (papel === 'vendedor') {
    if (pedido.statusPedido === 'pago') {
      return (
        <form onSubmit={informarRastreio} noValidate className="mt-4 border-t pt-4">
          <p className={`text-xs font-semibold ${pedido.rastreioAtrasado ? 'text-red-600' : 'text-gray-500'}`}>
            {pedido.rastreioAtrasado ? 'Prazo de envio vencido! ' : ''}Informe o código de rastreio até {pedido.prazoRastreio ? formatarData(pedido.prazoRastreio) : '3 dias úteis após o pagamento'}.
          </p>
          <div className="mt-2 flex gap-2">
            <input value={codigo} onChange={(e) => setCodigo(e.target.value)} minLength={5} maxLength={40} required placeholder="Ex.: BR123456789BR" className="w-full rounded-lg border px-3 py-2 text-sm" aria-label="Código de rastreio" />
            <Button type="submit" size="sm" className="gap-1 bg-red-600 hover:bg-red-700"><Package className="size-4" /> Enviar</Button>
          </div>
          {erroRastreio && <p role="alert" className="mt-2 text-xs font-semibold text-red-600">{erroRastreio}</p>}
        </form>
      )
    }
    if (pedido.statusPedido === 'entregue' && pedido.liberacaoPagamentoEm) {
      return <p className="mt-4 border-t pt-4 text-xs text-gray-500">O pagamento será liberado em {formatarDataHora(pedido.liberacaoPagamentoEm)}, se não houver disputa.</p>
    }
    if (pedido.statusPedido === 'concluido') {
      return <div className="mt-4 border-t pt-4"><Button size="sm" variant="outline" onClick={() => verRecibo(pedido)} className="gap-1"><Receipt className="size-4" /> Ver recibo</Button></div>
    }
    if (pedido.statusPedido === 'em_disputa') {
      return <p className="mt-4 border-t pt-4 text-xs text-gray-600">Disputa aberta pelo comprador: “{pedido.motivoDisputa}”. Aguardando a moderação.</p>
    }
    return null
  }

  const botoes = []
  if (pedido.statusPedido === 'pago') {
    botoes.push(<p key="aguardando" className="text-xs text-gray-500">O vendedor tem até {pedido.prazoRastreio ? formatarData(pedido.prazoRastreio) : '3 dias úteis'} para enviar o código de rastreio.</p>)
  }
  if (pedido.statusPedido === 'enviado') {
    botoes.push(<Button key="entrega" size="sm" onClick={() => executar(() => api(`/pedidos/${pedido.idPedido}/confirmar-entrega`, { method: 'POST' })).catch(() => {})} className="bg-red-600 hover:bg-red-700">Confirmar recebimento</Button>)
  }
  if (pedido.statusPedido === 'entregue' && dentroDoPrazoDeDisputa) {
    botoes.push(<Button key="disputa" size="sm" variant="outline" onClick={() => abrir({ tipo: 'disputa', pedido })} className="gap-1"><AlertTriangle className="size-4" /> Abrir disputa (até {formatarDataHora(pedido.prazoDisputaAte!)})</Button>)
  }
  if (pedido.statusPedido === 'entregue' || pedido.statusPedido === 'concluido') {
    for (const alvo of ['vendedor', 'produto'] as const) {
      if (!avaliou(alvo)) botoes.push(<Button key={alvo} size="sm" variant="outline" onClick={() => abrir({ tipo: 'avaliacao', pedido, alvo })} className="gap-1"><Star className="size-4" /> Avaliar {alvo}</Button>)
    }
  }
  if (pedido.statusPedido === 'em_disputa') {
    botoes.push(<p key="disputa" className="text-xs text-gray-600">Disputa em análise pela moderação.</p>)
  }
  if (pedido.resolucaoDisputa) {
    botoes.push(<p key="resolucao" className="text-xs text-gray-600">Resolução: {pedido.resolucaoDisputa}</p>)
  }
  return botoes.length ? <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">{botoes}</div> : null
}

function FormularioTexto({ titulo, icone, explicacao, minimo, rotuloBotao, onEnviar, onClose }: {
  titulo: string
  icone: ReactNode
  explicacao: string
  minimo: number
  rotuloBotao: string
  onEnviar: (texto: string) => Promise<void>
  onClose: () => void
}) {
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const problema = validarFormulario(e.currentTarget)
    if (problema) return setErro(problema)
    setErro('')
    setEnviando(true)
    try {
      await onEnviar(texto.trim())
    } catch (er) {
      setErro(mensagemDeErro(er))
      setEnviando(false)
    }
  }

  return (
    <Modal titulo={titulo} icone={icone} onClose={onClose}>
      <form onSubmit={enviar} noValidate>
        <p className="mt-4 text-sm text-gray-600">{explicacao}</p>
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} required minLength={minimo} maxLength={2000} rows={4} autoFocus aria-label="Descrição do problema" className="mt-3 w-full resize-none rounded-lg border px-3 py-3 text-sm" />
        <p className="mt-1 text-xs text-gray-500">Mínimo de {minimo} caracteres.</p>
        {erro && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{erro}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={enviando} className="bg-red-600 hover:bg-red-700">{enviando ? 'Enviando...' : rotuloBotao}</Button>
        </div>
      </form>
    </Modal>
  )
}

function FormularioAvaliacao({ alvo, onEnviar, onClose }: { alvo: Avaliacao['tipoAvaliacao'], onEnviar: (nota: number, texto: string) => Promise<void>, onClose: () => void }) {
  const [nota, setNota] = useState(0)
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const problema = validarFormulario(e.currentTarget, nota ? [] : ['Escolha uma nota de 1 a 5 estrelas.'])
    if (problema) return setErro(problema)
    setErro('')
    setEnviando(true)
    try {
      await onEnviar(nota, texto.trim())
    } catch (er) {
      setErro(mensagemDeErro(er))
      setEnviando(false)
    }
  }

  return (
    <Modal titulo={`Avaliar ${alvo}`} icone={<Star className="size-5" />} onClose={onClose}>
      <form onSubmit={enviar} noValidate>
        <div className="mt-5 flex gap-1" role="radiogroup" aria-label="Nota">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" role="radio" aria-checked={nota === i} aria-label={`${i} estrela${i > 1 ? 's' : ''}`} onClick={() => { setNota(i); setErro('') }}>
              <Star className={`size-8 ${i <= nota ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
        <label className="mt-4 block text-sm font-semibold">
          Justificativa
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} required minLength={3} maxLength={2000} rows={4} className="mt-2 w-full resize-none rounded-lg border px-3 py-3 font-normal" />
        </label>
        {erro && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{erro}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={enviando} className="bg-red-600 hover:bg-red-700">{enviando ? 'Enviando...' : 'Enviar avaliação'}</Button>
        </div>
      </form>
    </Modal>
  )
}
