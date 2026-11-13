'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { CircleDollarSign, MessageCircle, RefreshCcw, Search, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckoutDialog, type ItemCheckout } from '@/components/checkout/checkout-dialog'
import { OfferDialog } from '@/components/checkout/offer-dialog'
import type { AlvoConversa } from '@/components/detail/detail'
import { api, mensagemDeErro } from '@/lib/api'
import { formatarData, formatarHora, formatarMoeda, iniciais, rotuloStatusOferta, tempoRestante } from '@/lib/formatar'
import type { Conversa, Mensagem, Oferta, Pedido } from '@/lib/models'

// RF10 (chat) e RF08 (propostas). A tela consulta a API a cada 5 segundos para mostrar novidades.
const INTERVALO_ATUALIZACAO = 5000

const chaveDe = (c: AlvoConversa) => `${c.com.idUsuario}:${c.anuncio?.idAnuncio ?? ''}`

type Janela =
  | { tipo: 'contraproposta', oferta: Oferta }
  | { tipo: 'nova-proposta', oferta: Oferta }
  | { tipo: 'compra', oferta: Oferta, item: ItemCheckout }

export function Chat({ idUsuario, alvoInicial, onComprado }: { idUsuario: string, alvoInicial: AlvoConversa | null, onComprado: (pedido: Pedido) => void }) {
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [selecionada, setSelecionada] = useState<AlvoConversa | null>(alvoInicial)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [texto, setTexto] = useState('')
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState('')
  const [janela, setJanela] = useState<Janela | null>(null)
  const fimDaConversa = useRef<HTMLDivElement>(null)

  const carregarConversas = useCallback(async () => {
    const lista = await api<Conversa[]>('/mensagens/conversas')
    setConversas(lista)
    // Sem conversa aberta: abre a mais recente.
    setSelecionada((atual) => atual ?? (lista[0] ? { com: lista[0].com, anuncio: lista[0].anuncio } : null))
  }, [])

  // Chave da conversa aberta, para descartar respostas atrasadas de uma conversa anterior.
  const chaveAberta = useRef(alvoInicial ? chaveDe(alvoInicial) : '')

  const carregarConversa = useCallback(async (alvo: AlvoConversa) => {
    const anuncio = alvo.anuncio?.idAnuncio
    const [msgs, ofs] = await Promise.all([
      api<Mensagem[]>('/mensagens', { query: { com: alvo.com.idUsuario, anuncio } }),
      anuncio ? api<Oferta[]>('/ofertas', { query: { com: alvo.com.idUsuario, anuncio } }) : Promise.resolve([]),
    ])
    if (chaveAberta.current !== chaveDe(alvo)) return
    setMensagens(msgs)
    setOfertas(ofs)
  }, [])

  const atualizar = useCallback(async () => {
    try {
      await carregarConversas()
      if (selecionada) await carregarConversa(selecionada)
      setErro('')
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }, [carregarConversas, carregarConversa, selecionada])

  useEffect(() => {
    atualizar()
    const timer = setInterval(atualizar, INTERVALO_ATUALIZACAO)
    return () => clearInterval(timer)
  }, [atualizar])

  const linhaDoTempo = useMemo(() => [
    ...mensagens.map((m) => ({ tipo: 'mensagem' as const, data: m.dataEnvio, id: m.idMensagem, mensagem: m })),
    ...ofertas.map((o) => ({ tipo: 'oferta' as const, data: o.dataCriacao, id: o.idOferta, oferta: o })),
  ].sort((a, b) => a.data.localeCompare(b.data)), [mensagens, ofertas])

  useEffect(() => {
    fimDaConversa.current?.scrollIntoView({ block: 'end' })
  }, [linhaDoTempo.length])

  // A conversa aberta a partir de um anúncio aparece na lista mesmo antes da primeira mensagem.
  const lista = useMemo(() => {
    const todas: AlvoConversa[] = conversas.map((c) => ({ com: c.com, anuncio: c.anuncio }))
    if (selecionada && !todas.some((c) => chaveDe(c) === chaveDe(selecionada))) todas.unshift(selecionada)
    const termo = busca.trim().toLowerCase()
    return todas.filter((c) => !termo || c.com.nome.toLowerCase().includes(termo) || c.anuncio?.titulo.toLowerCase().includes(termo))
  }, [conversas, selecionada, busca])

  const ultimaMensagem = (alvo: AlvoConversa) => conversas.find((c) => chaveDe(c) === chaveDe(alvo))?.ultimaMensagem

  useEffect(() => {
    chaveAberta.current = selecionada ? chaveDe(selecionada) : ''
  }, [selecionada])

  const abrir = (alvo: AlvoConversa) => {
    chaveAberta.current = chaveDe(alvo)
    setSelecionada(alvo)
    setMensagens([])
    setOfertas([])
    setErro('')
  }

  const executar = async (acao: () => Promise<unknown>) => {
    setErro('')
    try {
      await acao()
      await atualizar()
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }

  const enviarMensagem = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selecionada || !texto.trim()) return
    const conteudo = texto.trim()
    setTexto('')
    executar(() => api('/mensagens', { method: 'POST', body: { idDestinatario: selecionada.com.idUsuario, idAnuncio: selecionada.anuncio?.idAnuncio, conteudo } }))
  }

  const responder = (oferta: Oferta, acao: 'aceitar' | 'recusar') => executar(() => api(`/ofertas/${oferta.idOferta}/${acao}`, { method: 'POST' }))

  const contrapropor = async (valor: number) => {
    if (janela?.tipo !== 'contraproposta') return
    await api(`/ofertas/${janela.oferta.idOferta}/contraproposta`, { method: 'POST', body: { valor } })
    setJanela(null)
    await atualizar()
  }

  const novaProposta = async (valor: number) => {
    if (janela?.tipo !== 'nova-proposta') return
    await api('/ofertas', { method: 'POST', body: { idAnuncio: janela.oferta.idAnuncio, valor } })
    setJanela(null)
    await atualizar()
  }

  const comprar = (oferta: Oferta) => setJanela({
    tipo: 'compra',
    oferta,
    item: { idAnuncio: oferta.idAnuncio, titulo: oferta.anuncio?.titulo ?? '', preco: oferta.anuncio?.preco ?? oferta.valor },
  })

  // O comprador pode propor de novo quando a última proposta não está mais em aberto.
  const ultimaOferta = ofertas.at(-1)
  const podeProporDeNovo = ultimaOferta && ultimaOferta.idComprador === idUsuario && ultimaOferta.anuncio?.status === 'ativo'
    && ['recusada', 'expirada', 'cancelada'].includes(ultimaOferta.status)

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 lg:px-10">
      <div className="mb-7">
        <p className="text-sm font-semibold text-red-600">Conecte-se com músicos</p>
        <h1 className="mt-1 text-3xl font-extrabold">Negociações</h1>
      </div>
      <div className="grid min-h-[620px] overflow-hidden rounded-2xl border bg-white md:grid-cols-[300px_1fr]">
        <aside className="border-b bg-gray-50 md:border-b-0 md:border-r">
          <div className="border-b p-4">
            <h2 className="font-bold">Conversas</h2>
            <div className="mt-3 flex items-center rounded-lg border bg-white px-3 py-2">
              <Search className="size-4 text-gray-400" />
              <input value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full bg-transparent px-2 text-sm outline-none" placeholder="Buscar conversa" aria-label="Buscar conversa" />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto md:max-h-[540px]">
            {lista.map((alvo) => {
              const ativa = selecionada && chaveDe(alvo) === chaveDe(selecionada)
              const ultima = ultimaMensagem(alvo)
              return (
                <button key={chaveDe(alvo)} onClick={() => abrir(alvo)} className={`flex w-full gap-3 border-b p-4 text-left ${ativa ? 'bg-white' : 'hover:bg-white/60'}`}>
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-red-100 font-bold text-red-600">{iniciais(alvo.com.nome)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{alvo.com.nome}</p>
                    {alvo.anuncio && <p className="truncate text-xs font-semibold text-red-600">{alvo.anuncio.titulo}</p>}
                    <p className="truncate text-xs text-gray-500">{ultima?.conteudo ?? 'Nova conversa'}</p>
                  </div>
                  {ultima && <span className="ml-auto shrink-0 text-[10px] text-gray-400">{formatarHora(ultima.dataEnvio)}</span>}
                </button>
              )
            })}
            {lista.length === 0 && <p className="p-6 text-center text-sm text-gray-500">Nenhuma conversa ainda. Abra um anúncio e fale com o vendedor.</p>}
          </div>
        </aside>

        {selecionada ? (
          <section className="flex min-h-[540px] flex-col">
            <div className="flex items-center gap-3 border-b p-4">
              <div className="grid size-10 place-items-center rounded-full bg-red-100 font-bold text-red-600">{iniciais(selecionada.com.nome)}</div>
              <div className="min-w-0">
                <p className="font-semibold">{selecionada.com.nome}</p>
                {selecionada.anuncio && <p className="truncate text-xs text-gray-500">Sobre: {selecionada.anuncio.titulo}</p>}
              </div>
              {podeProporDeNovo && ultimaOferta && (
                <Button size="sm" variant="outline" onClick={() => setJanela({ tipo: 'nova-proposta', oferta: ultimaOferta })} className="ml-auto gap-1 border-red-600 text-red-600"><CircleDollarSign className="size-4" /> Nova proposta</Button>
              )}
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
              {linhaDoTempo.length === 0 && <p className="text-center text-sm text-gray-400">Envie a primeira mensagem para o vendedor.</p>}
              {linhaDoTempo.map((item, i) => {
                const novaData = i === 0 || formatarData(item.data) !== formatarData(linhaDoTempo[i - 1].data)
                return (
                  <div key={item.id}>
                    {novaData && <p className="mb-4 text-center text-xs text-gray-400">{formatarData(item.data)}</p>}
                    {item.tipo === 'mensagem'
                      ? <Balao mensagem={item.mensagem} minha={item.mensagem.idRemetente === idUsuario} />
                      : <CartaoOferta oferta={item.oferta} idUsuario={idUsuario} onResponder={responder} onContrapropor={(o) => setJanela({ tipo: 'contraproposta', oferta: o })} onComprar={comprar} />}
                  </div>
                )
              })}
              <div ref={fimDaConversa} />
            </div>
            {erro && <p role="alert" className="px-5 text-sm font-semibold text-red-600">{erro}</p>}
            <form onSubmit={enviarMensagem} className="m-4 flex items-center rounded-xl border bg-gray-50 px-4 py-2">
              <input value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={2000} className="flex-1 bg-transparent text-sm outline-none" placeholder="Escreva uma mensagem..." aria-label="Mensagem" />
              <Button type="submit" size="icon" disabled={!texto.trim()} className="bg-red-600 hover:bg-red-700" aria-label="Enviar mensagem"><Send /></Button>
            </form>
          </section>
        ) : (
          <section className="grid place-items-center p-10 text-center text-gray-500">
            <div>
              <MessageCircle className="mx-auto size-10 text-gray-300" />
              <p className="mt-3 text-sm">Selecione uma conversa.</p>
              {erro && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{erro}</p>}
            </div>
          </section>
        )}
      </div>

      {janela?.tipo === 'contraproposta' && (
        <OfferDialog titulo="Fazer contraproposta" precoAnuncio={janela.oferta.anuncio?.preco ?? Infinity} valorAtual={janela.oferta.valor} onEnviar={contrapropor} onClose={() => setJanela(null)} />
      )}
      {janela?.tipo === 'nova-proposta' && (
        <OfferDialog titulo="Nova proposta" precoAnuncio={janela.oferta.anuncio?.preco ?? Infinity} onEnviar={novaProposta} onClose={() => setJanela(null)} />
      )}
      {janela?.tipo === 'compra' && (
        <CheckoutDialog
          item={janela.item}
          oferta={{ idOferta: janela.oferta.idOferta, valor: janela.oferta.valor }}
          onClose={() => setJanela(null)}
          onConcluido={onComprado}
        />
      )}
    </main>
  )
}

function Balao({ mensagem, minha }: { mensagem: Mensagem, minha: boolean }) {
  return (
    <div className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl p-3 text-sm ${minha ? 'ml-auto rounded-tr-sm bg-red-600 text-white' : 'rounded-tl-sm bg-gray-100'}`}>
      {mensagem.conteudo}
      <span className={`mt-1 block text-right text-[10px] ${minha ? 'text-red-100' : 'text-gray-400'}`}>{formatarHora(mensagem.dataEnvio)}</span>
    </div>
  )
}

function CartaoOferta({ oferta, idUsuario, onResponder, onContrapropor, onComprar }: {
  oferta: Oferta
  idUsuario: string
  onResponder: (oferta: Oferta, acao: 'aceitar' | 'recusar') => void
  onContrapropor: (oferta: Oferta) => void
  onComprar: (oferta: Oferta) => void
}) {
  const fizEu = oferta.idAutor === idUsuario
  const souComprador = oferta.idComprador === idUsuario
  const contraproposta = oferta.idAutor !== oferta.idComprador
  const emAberto = oferta.status === 'pendente' || oferta.status === 'aceita'

  return (
    <div className={`mx-auto max-w-sm rounded-2xl border-2 p-4 ${emAberto ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-gray-50 opacity-80'}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-bold text-red-700">
          <CircleDollarSign className="size-5" /> {contraproposta ? 'Contraproposta' : 'Proposta'} {fizEu ? 'enviada' : 'recebida'}
        </p>
        <span className="text-xs font-semibold text-red-600">{emAberto ? `Expira ${tempoRestante(oferta.expiraEm)}` : rotuloStatusOferta[oferta.status]}</span>
      </div>
      <p className="mt-4 text-3xl font-extrabold">{formatarMoeda(oferta.valor)}</p>
      {oferta.anuncio && <p className="mt-1 text-xs text-gray-500">para {oferta.anuncio.titulo} (anunciado por {formatarMoeda(oferta.anuncio.preco)})</p>}

      {oferta.status === 'pendente' && !fizEu && (
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={() => onResponder(oferta, 'aceitar')} className="flex-1 bg-red-600 hover:bg-red-700">Aceitar</Button>
          <Button size="sm" variant="outline" onClick={() => onResponder(oferta, 'recusar')} className="flex-1">Recusar</Button>
          <Button size="icon" variant="outline" onClick={() => onContrapropor(oferta)} aria-label="Fazer contraproposta" title="Fazer contraproposta"><RefreshCcw /></Button>
        </div>
      )}
      {oferta.status === 'pendente' && fizEu && <p className="mt-4 text-xs font-semibold text-gray-500">Aguardando resposta.</p>}
      {oferta.status === 'aceita' && souComprador && (
        <Button size="sm" onClick={() => onComprar(oferta)} className="mt-4 w-full bg-red-600 hover:bg-red-700">Comprar por {formatarMoeda(oferta.valor)}</Button>
      )}
      {oferta.status === 'aceita' && !souComprador && <p className="mt-4 text-xs font-semibold text-gray-500">Proposta aceita. Aguardando o comprador concluir a compra.</p>}
    </div>
  )
}
