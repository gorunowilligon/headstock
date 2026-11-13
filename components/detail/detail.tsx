'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, CreditCard, Flag, MessageCircle, PackageCheck, ShieldCheck, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckoutDialog } from '@/components/checkout/checkout-dialog'
import { OfferDialog } from '@/components/checkout/offer-dialog'
import { ReportDialog } from '@/components/detail/report-dialog'
import { Spec } from '@/components/detail/spec'
import { capaDoAnuncio } from '@/lib/anuncio'
import { api, mensagemDeErro } from '@/lib/api'
import { linhasEspecificacoes } from '@/lib/especificacoes'
import type { Anuncio, NovaDenuncia, Pedido } from '@/lib/models'
import { formatarPreco } from '@/lib/price'
import { validarFormulario } from '@/lib/validacao'

/** Conversa a abrir no chat: a outra pessoa e o anúncio negociado. */
export interface AlvoConversa {
  com: { idUsuario: number, nome: string }
  anuncio: { idAnuncio: number, titulo: string } | null
}

export function Detail({ anuncio, idUsuarioLogado, onBack, onReport, onRequireLogin, onComprado, onConversar }: {
  anuncio: Anuncio
  idUsuarioLogado: number | null
  onBack: () => void
  onReport: (denuncia: NovaDenuncia) => Promise<void>
  onRequireLogin: () => void
  onComprado: (pedido: Pedido) => void
  onConversar: (alvo: AlvoConversa) => void
}) {
  const logado = Boolean(idUsuarioLogado)
  const [photo, setPhoto] = useState(0)
  const vendedor = anuncio.vendedor ?? { idUsuario: anuncio.idVendedor, nome: 'Vendedor', reputacaoMedia: 0 }
  const iniciaisVendedor = vendedor.nome.split(' ').map((parte) => parte[0]).slice(0, 2).join('')
  const ehMeuAnuncio = idUsuarioLogado === anuncio.idVendedor
  const disponivel = anuncio.status === 'ativo'
  const [janela, setJanela] = useState<'compra' | 'oferta' | null>(null)
  const alvoConversa: AlvoConversa = { com: { idUsuario: anuncio.idVendedor, nome: vendedor.nome }, anuncio: { idAnuncio: anuncio.idAnuncio, titulo: anuncio.titulo } }
  const especificacoes = linhasEspecificacoes(anuncio.instrumento.especificacoes)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [erroDenuncia, setErroDenuncia] = useState('')
  const [motivo, setMotivo] = useState('')
  const [descricaoTextual, setDescricaoTextual] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const [enviandoDenuncia, setEnviandoDenuncia] = useState(false)
  const photos = anuncio.fotos.length ? anuncio.fotos.map((foto) => foto.url) : ['/placeholder.jpg']
  const parcela = anuncio.preco / 10

  useEffect(() => {
    if (!reportSent) return
    const timer = setTimeout(() => setReportSent(false), 4000)
    return () => clearTimeout(timer)
  }, [reportSent])

  const handleReportSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const problema = validarFormulario(e.currentTarget)
    if (problema) return setErroDenuncia(problema)
    setErroDenuncia('')
    setEnviandoDenuncia(true)
    try {
      await onReport({ idAnuncio: anuncio.idAnuncio, motivo, descricaoTextual: descricaoTextual.trim() })
    } catch (erro) {
      setErroDenuncia(mensagemDeErro(erro))
      return
    } finally {
      setEnviandoDenuncia(false)
    }
    setIsReportOpen(false)
    setMotivo('')
    setDescricaoTextual('')
    setReportSent(true)
  }

  const abrirDenuncia = () => {
    if (!logado) return onRequireLogin()
    setErroDenuncia('')
    setIsReportOpen(true)
  }

  // RF07: comprar, propor e conversar exigem login.
  const comLogin = (acao: () => void) => () => (logado ? acao() : onRequireLogin())

  const enviarOferta = async (valor: number) => {
    await api('/ofertas', { method: 'POST', body: { idAnuncio: anuncio.idAnuncio, valor } })
    setJanela(null)
    onConversar(alvoConversa)
  }

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-8 lg:px-10">
      <button onClick={onBack} className="mb-7 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-600"><ArrowLeft /> Voltar para anúncios</button>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <section>
          <div className="overflow-hidden rounded-2xl bg-gray-100">
            <img src={photos[photo]} alt={anuncio.titulo} className="aspect-[4/3] w-full object-cover" />
          </div>
          {photos.length > 1 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {photos.map((src, i) => (
                <button key={i} onClick={() => setPhoto(i)} className={`overflow-hidden rounded-xl border-2 ${photo === i ? 'border-red-600' : 'border-transparent'}`}>
                  <img src={src} alt={`Foto ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="mt-10">
            <h2 className="mb-4 text-xl font-bold">Especificações técnicas</h2>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-gray-200 text-sm">
              <Spec name="Marca / modelo" value={`${anuncio.instrumento.marca} ${anuncio.instrumento.modelo}`} />
              <Spec name="Categoria" value={anuncio.instrumento.categoria} />
              {anuncio.instrumento.tipoCaptacao && <Spec name="Captação" value={anuncio.instrumento.tipoCaptacao} />}
              {anuncio.instrumento.numeroCordas > 0 && <Spec name="Número de cordas" value={String(anuncio.instrumento.numeroCordas)} />}
              {anuncio.instrumento.orientacao && <Spec name="Orientação" value={anuncio.instrumento.orientacao} />}
              {especificacoes.map((linha) => <Spec key={linha.chave} name={linha.rotulo} value={linha.valor} />)}
            </div>
          </div>
          {anuncio.descricao && (
            <div className="mt-10">
              <h2 className="mb-3 text-xl font-bold">Sobre este anúncio</h2>
              <p className="leading-7 text-gray-600">{anuncio.descricao}</p>
            </div>
          )}
        </section>
        <aside>
          <div className="sticky top-28 flex flex-col gap-5 rounded-2xl border bg-white p-6 shadow-sm">
            <Badge className="w-fit bg-red-50 text-red-700 hover:bg-red-50">Destaque</Badge>
            <div>
              <h1 className="text-2xl font-extrabold leading-tight">{anuncio.titulo}</h1>
              <p className="mt-2 text-sm text-gray-500">{anuncio.condicao} · {anuncio.localizacao}</p>
            </div>
            <div className="border-y py-5">
              <p className="text-3xl font-extrabold text-red-600">{formatarPreco(anuncio.preco)}</p>
              <p className="mt-1 text-sm text-gray-500">ou 10x de R$ {parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sem juros</p>
            </div>
            {ehMeuAnuncio ? (
              <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">Este é o seu anúncio. Edite, pause ou exclua em <strong>Meu perfil → Meus anúncios</strong>.</p>
            ) : !disponivel ? (
              <p className="rounded-xl bg-gray-50 p-4 text-sm font-semibold text-gray-600">{anuncio.status === 'vendido' ? 'Este instrumento já foi vendido.' : 'Este anúncio não está disponível no momento.'}</p>
            ) : (
              <div className="flex flex-col gap-3">
                <Button onClick={comLogin(() => setJanela('compra'))} className="h-12 bg-red-600 text-base hover:bg-red-700">Comprar agora</Button>
                {anuncio.aceitaPropostas && (
                  <Button variant="outline" onClick={comLogin(() => setJanela('oferta'))} className="h-12 border-red-600 text-base text-red-600 hover:bg-red-50">Fazer oferta</Button>
                )}
                <Button variant="ghost" onClick={comLogin(() => onConversar(alvoConversa))} className="gap-2 text-gray-600"><MessageCircle className="size-4" /> Conversar com o vendedor</Button>
              </div>
            )}
            <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 text-xs leading-5 text-gray-600">
              <p className="flex gap-2"><CreditCard className="mt-0.5 size-4 shrink-0 text-red-600" /> O pagamento só será liberado ao vendedor 48h após a confirmação da sua entrega.</p>
              <p className="flex gap-2"><PackageCheck className="mt-0.5 size-4 shrink-0 text-red-600" /> O vendedor terá 3 dias úteis para enviar o código de rastreio.</p>
              <p className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-red-600" /> Você tem 48h após a entrega para contestar o estado do instrumento.</p>
            </div>
            <div className="flex items-center gap-3 border-t pt-4">
              <div className="grid size-10 place-items-center rounded-full bg-red-100 font-bold text-red-600">{iniciaisVendedor}</div>
              <div>
                <p className="text-sm font-semibold">{vendedor.nome}</p>
                <p className="flex items-center gap-1 text-xs text-gray-500"><Star className="size-3 fill-amber-400 text-amber-400" /> {vendedor.reputacaoMedia > 0 ? vendedor.reputacaoMedia.toFixed(1) : 'Sem avaliações'}</p>
              </div>
            </div>
            <div>
              <button onClick={abrirDenuncia} className="flex w-fit items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-600"><Flag className="size-3.5" /> Denunciar</button>
              {reportSent && <p role="status" className="mt-2 text-xs font-semibold text-green-600">Denúncia enviada para a moderação.</p>}
            </div>
          </div>
        </aside>
      </div>
      {janela === 'compra' && (
        <CheckoutDialog
          item={{ idAnuncio: anuncio.idAnuncio, titulo: anuncio.titulo, preco: anuncio.preco, capa: capaDoAnuncio(anuncio) }}
          onClose={() => setJanela(null)}
          onConcluido={onComprado}
        />
      )}
      {janela === 'oferta' && (
        <OfferDialog titulo="Fazer oferta" precoAnuncio={anuncio.preco} onEnviar={enviarOferta} onClose={() => setJanela(null)} />
      )}
      <ReportDialog open={isReportOpen} motivo={motivo} onMotivoChange={setMotivo} descricaoTextual={descricaoTextual} onDescricaoTextualChange={setDescricaoTextual} erro={erroDenuncia} enviando={enviandoDenuncia} onClose={() => setIsReportOpen(false)} onSubmit={handleReportSubmit} />
    </main>
  )
}
