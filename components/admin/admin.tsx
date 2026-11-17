'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { AlertTriangle, Ban, Check, ExternalLink, FileWarning, FolderKanban, Plus, RefreshCw, Scale, Search, ShieldAlert, Trash2, Wrench } from 'lucide-react'
import { api, mensagemDeErro } from '@/lib/api'
import { categoriasDoFiltro } from '@/lib/filtros'
import { formatarDataHora, formatarMoeda } from '@/lib/formatar'
import type { DenunciaAdmin, Instrumento, Pedido, StatusDenuncia, UsuarioSessao } from '@/lib/models'

type AbaAdmin = 'denuncias' | 'disputas' | 'catalogo'
type FiltroStatusDenuncia = 'todas' | StatusDenuncia
type AcaoDisputa = 'manter_venda' | 'autorizar_devolucao' | 'estornar' | 'cancelar_venda'

const rotuloStatusDenuncia: Record<StatusDenuncia, string> = {
  aberta: 'ABERTA',
  em_analise: 'EM ANÁLISE',
  resolvida: 'RESOLVIDA',
  descartada: 'DESCARTADA',
}

const estiloStatusDenuncia: Record<StatusDenuncia, string> = {
  aberta: 'border-red-700 bg-red-100 text-red-900',
  em_analise: 'border-amber-700 bg-amber-100 text-amber-900',
  resolvida: 'border-emerald-700 bg-emerald-100 text-emerald-900',
  descartada: 'border-slate-500 bg-slate-200 text-slate-700',
}

const inputAdmin = 'w-full rounded-none border border-slate-400 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
const btnSecundario = 'inline-flex items-center gap-1.5 rounded-none border border-slate-400 bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-200 disabled:opacity-50'
const btnPrimario = 'inline-flex items-center gap-1.5 rounded-none border border-slate-900 bg-slate-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-950 disabled:opacity-50'
const btnPerigo = 'inline-flex items-center gap-1.5 rounded-none border border-red-900 bg-red-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-800 disabled:opacity-50'

export function Admin({
  usuario,
  catalogoMestre,
  onCatalogoMestreChange,
  onAbrirAnuncio,
  onAnuncioModerado,
}: {
  usuario: UsuarioSessao
  catalogoMestre: Instrumento[]
  onCatalogoMestreChange: (instrumentos: Instrumento[]) => void
  onAbrirAnuncio: (idAnuncio: number) => void
  onAnuncioModerado: () => void
}) {
  const [aba, setAba] = useState<AbaAdmin>('denuncias')
  const [denuncias, setDenuncias] = useState<DenunciaAdmin[]>([])
  const [disputas, setDisputas] = useState<Pedido[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  const [filtroDenuncia, setFiltroDenuncia] = useState<FiltroStatusDenuncia>('todas')
  const [resolucoesDenuncia, setResolucoesDenuncia] = useState<Record<number, string>>({})
  const [observacoesDisputa, setObservacoesDisputa] = useState<Record<number, string>>({})
  const [ocupadoId, setOcupadoId] = useState<string | null>(null)

  // Catálogo mestre (RF13)
  const [buscaCatalogo, setBuscaCatalogo] = useState('')
  const [categoriaCatalogo, setCategoriaCatalogo] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [categoria, setCategoria] = useState(categoriasDoFiltro[0])
  const [tipoCaptacao, setTipoCaptacao] = useState('')
  const [numeroCordas, setNumeroCordas] = useState('6')
  const [orientacao, setOrientacao] = useState('Destro')

  const carregarPainel = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      const [listaDenuncias, listaDisputas, listaCatalogo] = await Promise.all([
        api<DenunciaAdmin[]>('/admin/denuncias'),
        api<Pedido[]>('/admin/disputas'),
        api<Instrumento[]>('/instrumentos'),
      ])
      setDenuncias(listaDenuncias)
      setDisputas(listaDisputas)
      onCatalogoMestreChange(listaCatalogo)
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setCarregando(false)
    }
  }, [onCatalogoMestreChange])

  useEffect(() => {
    carregarPainel()
  }, [carregarPainel])

  const notificar = (texto: string) => {
    setAviso(texto)
    setErro('')
  }

  const executarAcao = async (chave: string, acao: () => Promise<void>) => {
    setOcupadoId(chave)
    setErro('')
    setAviso('')
    try {
      await acao()
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setOcupadoId(null)
    }
  }

  // ---- Ações de Denúncias e Moderação (RF12, RF14) --------------------------

  const atualizarStatusDenuncia = (d: DenunciaAdmin, status: 'em_analise' | 'resolvida' | 'descartada') =>
    executarAcao(`den-${d.idDenuncia}`, async () => {
      const resolucao = (resolucoesDenuncia[d.idDenuncia] ?? d.resolucao ?? '').trim() || undefined
      const atualizada = await api<DenunciaAdmin>(`/admin/denuncias/${d.idDenuncia}`, {
        method: 'PATCH',
        body: { status, resolucao },
      })
      setDenuncias((atuais) => atuais.map((item) => (item.idDenuncia === d.idDenuncia ? atualizada : item)))
      notificar(`Denúncia #DEN-${String(d.idDenuncia).padStart(4, '0')} marcada como ${rotuloStatusDenuncia[status]}.`)
    })

  const removerAnuncioIrregular = (idAnuncio: number, idDenuncia?: number) =>
    executarAcao(`rem-anuncio-${idAnuncio}`, async () => {
      await api(`/admin/anuncios/${idAnuncio}/remover`, { method: 'POST' })
      setDenuncias((atuais) => atuais.map((d) => (
        d.anuncio?.idAnuncio === idAnuncio
          ? { ...d, anuncio: { ...d.anuncio, status: 'removido' } }
          : d
      )))
      onAnuncioModerado()
      notificar(`Anúncio #${idAnuncio} removido da vitrine (RF14).${idDenuncia ? ` Considere marcar a denúncia #DEN-${String(idDenuncia).padStart(4, '0')} como RESOLVIDA.` : ''}`)
    })

  const alternarBanimento = (idUsuarioAlvo: number, nomeAlvo: string, banir: boolean) =>
    executarAcao(`ban-usr-${idUsuarioAlvo}`, async () => {
      await api(`/admin/usuarios/${idUsuarioAlvo}/banimento`, {
        method: 'POST',
        body: { banido: banir },
      })
      setDenuncias((atuais) => atuais.map((d) => ({
        ...d,
        usuarioDenunciado: d.usuarioDenunciado?.idUsuario === idUsuarioAlvo ? { ...d.usuarioDenunciado, banido: banir } : d.usuarioDenunciado,
        anuncio: d.anuncio?.vendedor?.idUsuario === idUsuarioAlvo
          ? { ...d.anuncio, status: banir && d.anuncio.status === 'ativo' ? 'pausado' : d.anuncio.status, vendedor: { ...d.anuncio.vendedor, banido: banir } }
          : d.anuncio,
        mensagem: d.mensagem?.remetente?.idUsuario === idUsuarioAlvo
          ? { ...d.mensagem, remetente: { ...d.mensagem.remetente, banido: banir } }
          : d.mensagem,
      })))
      onAnuncioModerado()
      notificar(banir ? `Usuário "${nomeAlvo}" (#${idUsuarioAlvo}) banido e anúncios ativos pausados (RF14).` : `Banimento do usuário "${nomeAlvo}" (#${idUsuarioAlvo}) revogado.`)
    })

  // ---- Ações de Disputas (RF15) ---------------------------------------------

  const resolverDisputa = (pedido: Pedido, acao: AcaoDisputa) =>
    executarAcao(`disp-${pedido.idPedido}`, async () => {
      const observacao = (observacoesDisputa[pedido.idPedido] ?? '').trim() || undefined
      const atualizado = await api<Pedido>(`/admin/pedidos/${pedido.idPedido}/resolucao`, {
        method: 'POST',
        body: { acao, observacao },
      })
      if (atualizado.statusPedido === 'devolucao_autorizada') {
        setDisputas((atuais) => atuais.map((p) => (p.idPedido === pedido.idPedido ? atualizado : p)))
      } else {
        setDisputas((atuais) => atuais.filter((p) => p.idPedido !== pedido.idPedido))
      }
      onAnuncioModerado()
      notificar(`Pedido #PED-${String(pedido.idPedido).padStart(4, '0')}: ação "${acao}" registrada (novo status: ${atualizado.statusPedido}).`)
    })

  // ---- Ações do Catálogo Mestre (RF13) --------------------------------------

  const limparFormularioCatalogo = () => {
    setEditandoId(null)
    setMarca('')
    setModelo('')
    setCategoria(categoriasDoFiltro[0])
    setTipoCaptacao('')
    setNumeroCordas('6')
    setOrientacao('Destro')
  }

  const iniciarEdicaoCatalogo = (inst: Instrumento) => {
    setEditandoId(inst.idInstrumento)
    setMarca(inst.marca)
    setModelo(inst.modelo)
    setCategoria(inst.categoria)
    setTipoCaptacao(inst.tipoCaptacao ?? '')
    setNumeroCordas(String(inst.numeroCordas ?? 0))
    setOrientacao(inst.orientacao ?? '')
  }

  const salvarInstrumentoCatalogo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!marca.trim() || !modelo.trim() || !categoria.trim()) {
      setErro('Preencha marca, modelo e categoria do instrumento.')
      return
    }
    const corpo = {
      marca: marca.trim(),
      modelo: modelo.trim(),
      categoria: categoria.trim(),
      tipoCaptacao: tipoCaptacao.trim(),
      numeroCordas: Math.max(0, Number(numeroCordas) || 0),
      orientacao: orientacao.trim(),
    }
    executarAcao('salvar-cat', async () => {
      if (editandoId !== null) {
        const atualizado = await api<Instrumento>(`/instrumentos/${editandoId}`, { method: 'PATCH', body: corpo })
        onCatalogoMestreChange(catalogoMestre.map((i) => (i.idInstrumento === editandoId ? atualizado : i)))
        notificar(`Modelo #CAT-${String(editandoId).padStart(4, '0')} (${atualizado.marca} ${atualizado.modelo}) atualizado.`)
      } else {
        const criado = await api<Instrumento>('/instrumentos', { method: 'POST', body: corpo })
        onCatalogoMestreChange([...catalogoMestre, criado].sort((a, b) => `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`, 'pt-BR')))
        notificar(`Modelo "${criado.marca} ${criado.modelo}" (#CAT-${String(criado.idInstrumento).padStart(4, '0')}) adicionado ao catálogo mestre.`)
      }
      limparFormularioCatalogo()
    })
  }

  const excluirInstrumentoCatalogo = (inst: Instrumento) =>
    executarAcao(`del-cat-${inst.idInstrumento}`, async () => {
      await api(`/instrumentos/${inst.idInstrumento}`, { method: 'DELETE' })
      onCatalogoMestreChange(catalogoMestre.filter((i) => i.idInstrumento !== inst.idInstrumento))
      if (editandoId === inst.idInstrumento) limparFormularioCatalogo()
      notificar(`Modelo "${inst.marca} ${inst.modelo}" removido do catálogo mestre.`)
    })

  // ---- Listas filtradas e contadores ----------------------------------------

  const denunciasPendentes = denuncias.filter((d) => d.status === 'aberta' || d.status === 'em_analise').length
  const denunciasFiltradas = useMemo(
    () => (filtroDenuncia === 'todas' ? denuncias : denuncias.filter((d) => d.status === filtroDenuncia)),
    [denuncias, filtroDenuncia],
  )

  const catalogoFiltrado = useMemo(() => {
    const termo = buscaCatalogo.trim().toLowerCase()
    return catalogoMestre.filter((i) => {
      if (categoriaCatalogo && i.categoria !== categoriaCatalogo) return false
      if (!termo) return true
      return i.marca.toLowerCase().includes(termo) || i.modelo.toLowerCase().includes(termo) || i.categoria.toLowerCase().includes(termo)
    })
  }, [catalogoMestre, buscaCatalogo, categoriaCatalogo])

  return (
    <main className="min-h-screen bg-slate-200 pb-14 text-slate-900">
      {/* Faixa superior administrativa / legada */}
      <div className="border-b-2 border-slate-700 bg-slate-900 text-slate-100">
        <div className="mx-auto flex w-full flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center border border-slate-600 bg-slate-800 text-amber-400">
              <ShieldAlert className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-slate-400">
                <span>SYS-MOD // HEADSTOCK BACKOFFICE</span>
                <span>·</span>
                <span>NÍVEL {usuario.nivelAcesso ?? 1}</span>
              </div>
              <h1 className="text-xl font-extrabold uppercase tracking-wide text-white">Painel de Controle e Moderação</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <span className="border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-300">
              OPERADOR: <strong className="text-white">{usuario.nome}</strong> (#ADM-{usuario.idUsuario})
            </span>
            <button type="button" onClick={carregarPainel} disabled={carregando} className="inline-flex items-center gap-1.5 border border-slate-500 bg-slate-800 px-3 py-1.5 font-sans text-xs font-bold uppercase tracking-wider text-slate-100 hover:bg-slate-700 disabled:opacity-50">
              <RefreshCw className={`size-3.5 ${carregando ? 'animate-spin' : ''}`} /> Atualizar dados
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full px-5 pt-6 lg:px-10">
        {/* Indicadores rápidos em estilo grade administrativa */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="border-2 border-slate-400 bg-white p-3.5 shadow-[2px_2px_0px_#94a3b8]">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">01 // Denúncias pendentes (RF12/RF14)</p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-mono text-2xl font-extrabold text-slate-900">{denunciasPendentes}</span>
              <span className="font-mono text-xs text-slate-500">Total registradas: {denuncias.length}</span>
            </div>
          </div>
          <div className="border-2 border-slate-400 bg-white p-3.5 shadow-[2px_2px_0px_#94a3b8]">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">02 // Disputas aguardando decisão (RF15)</p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-mono text-2xl font-extrabold text-slate-900">{disputas.length}</span>
              <span className="font-mono text-xs text-slate-500">Pagamentos retidos em custódia</span>
            </div>
          </div>
          <div className="border-2 border-slate-400 bg-white p-3.5 shadow-[2px_2px_0px_#94a3b8]">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">03 // Catálogo mestre (RF13)</p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-mono text-2xl font-extrabold text-slate-900">{catalogoMestre.length}</span>
              <span className="font-mono text-xs text-slate-500">Modelos oficiais cadastrados</span>
            </div>
          </div>
        </div>

        {erro && (
          <div role="alert" className="mb-4 flex items-center gap-2 border-2 border-red-800 bg-red-100 px-4 py-2.5 text-xs font-bold text-red-900">
            <AlertTriangle className="size-4 shrink-0" /> {erro}
          </div>
        )}
        {aviso && (
          <div role="status" className="mb-4 flex items-center gap-2 border-2 border-emerald-800 bg-emerald-100 px-4 py-2.5 text-xs font-bold text-emerald-900">
            <Check className="size-4 shrink-0" /> {aviso}
          </div>
        )}

        {/* Abas quadradas estilo sistema administrativo */}
        <div role="tablist" aria-label="Módulos administrativos" className="flex flex-wrap border-b-2 border-slate-400">
          {[
            { id: 'denuncias' as const, rotulo: `Fila de Denúncias (${denunciasPendentes})`, icone: <FileWarning className="size-4" /> },
            { id: 'disputas' as const, rotulo: `Disputas de Pedidos (${disputas.length})`, icone: <Scale className="size-4" /> },
            { id: 'catalogo' as const, rotulo: `Catálogo Mestre (${catalogoMestre.length})`, icone: <FolderKanban className="size-4" /> },
          ].map((item) => {
            const ativa = aba === item.id
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={ativa}
                onClick={() => { setAba(item.id); setErro(''); setAviso('') }}
                className={`-mb-0.5 mr-1 inline-flex items-center gap-2 border-2 border-slate-400 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider ${
                  ativa ? 'border-b-white bg-white text-slate-900' : 'bg-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item.icone} {item.rotulo}
              </button>
            )
          })}
        </div>

        {/* Conteúdo do módulo ativo */}
        <div className="border-2 border-t-0 border-slate-400 bg-white p-4 shadow-[3px_3px_0px_#94a3b8] sm:p-6">
          {aba === 'denuncias' && (
            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 pb-3">
                <div>
                  <h2 className="text-base font-extrabold uppercase tracking-wide">Módulo de Denúncias e Moderação (RF12 / RF14)</h2>
                  <p className="text-xs text-slate-600">Analise denúncias, remova anúncios irregulares e aplique banimento a usuários infratores.</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {([
                    ['todas', `Todas (${denuncias.length})`],
                    ['aberta', `Abertas (${denuncias.filter((d) => d.status === 'aberta').length})`],
                    ['em_analise', `Em análise (${denuncias.filter((d) => d.status === 'em_analise').length})`],
                    ['resolvida', `Resolvidas (${denuncias.filter((d) => d.status === 'resolvida').length})`],
                    ['descartada', `Descartadas (${denuncias.filter((d) => d.status === 'descartada').length})`],
                  ] as [FiltroStatusDenuncia, string][]).map(([valor, rotulo]) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setFiltroDenuncia(valor)}
                      className={`border px-2.5 py-1 font-mono text-xs font-bold uppercase ${
                        filtroDenuncia === valor ? 'border-slate-900 bg-slate-800 text-white' : 'border-slate-400 bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {rotulo}
                    </button>
                  ))}
                </div>
              </div>

              {denunciasFiltradas.length === 0 ? (
                <p className="border border-dashed border-slate-400 bg-slate-50 p-8 text-center font-mono text-xs text-slate-600">
                  NENHUMA DENÚNCIA ENCONTRADA PARA O FILTRO SELECIONADO.
                </p>
              ) : (
                <div className="divide-y-2 divide-slate-300 border border-slate-400">
                  {denunciasFiltradas.map((d) => {
                    const alvoTipo = d.idAnuncio ? 'ANÚNCIO' : d.idUsuarioDenunciado ? 'USUÁRIO' : 'MENSAGEM'
                    const usuarioInfrator = d.usuarioDenunciado ?? d.anuncio?.vendedor ?? d.mensagem?.remetente ?? null
                    const ocupado = ocupadoId === `den-${d.idDenuncia}`
                    return (
                      <article key={d.idDenuncia} className="bg-white p-4 hover:bg-slate-50/70">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="border border-slate-400 bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold">
                              #DEN-{String(d.idDenuncia).padStart(4, '0')}
                            </span>
                            <span className="border border-slate-400 bg-slate-800 px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                              ALVO: {alvoTipo}
                            </span>
                            <span className={`border px-2 py-0.5 font-mono text-[11px] font-bold ${estiloStatusDenuncia[d.status]}`}>
                              {rotuloStatusDenuncia[d.status]}
                            </span>
                            <span className="font-mono text-xs text-slate-500">
                              Registrada em {formatarDataHora(d.dataCriacao)} por <strong>{d.autor?.nome ?? `Usuário #${d.idAutor}`}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                          <div className="space-y-2 text-sm">
                            <p className="font-bold text-slate-900">Motivo: <span className="font-normal">{d.motivo}</span></p>
                            <div className="border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-800">
                              <span className="block font-mono text-[10px] font-bold uppercase text-slate-500">Relato do denunciante:</span>
                              {d.descricaoTextual}
                            </div>

                            {d.anuncio && (
                              <div className="flex flex-wrap items-center justify-between gap-2 border border-slate-300 bg-slate-100 px-3 py-2 text-xs">
                                <div>
                                  <span className="font-mono font-bold">ANÚNCIO #{d.anuncio.idAnuncio}:</span> {d.anuncio.titulo}{' '}
                                  <span className="font-mono uppercase text-slate-600">[status: {d.anuncio.status}]</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button type="button" onClick={() => onAbrirAnuncio(d.anuncio!.idAnuncio)} className={btnSecundario}>
                                    <ExternalLink className="size-3.5" /> Inspecionar
                                  </button>
                                  {d.anuncio.status !== 'removido' && (
                                    <button
                                      type="button"
                                      disabled={ocupadoId === `rem-anuncio-${d.anuncio.idAnuncio}`}
                                      onClick={() => removerAnuncioIrregular(d.anuncio!.idAnuncio, d.idDenuncia)}
                                      className={btnPerigo}
                                    >
                                      <Trash2 className="size-3.5" /> Remover anúncio
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {d.mensagem && (
                              <div className="border border-slate-300 bg-slate-100 px-3 py-2 text-xs">
                                <span className="block font-mono text-[10px] font-bold uppercase text-slate-500">
                                  Mensagem denunciada (#MSG-{d.mensagem.idMensagem}):
                                </span>
                                <p className="mt-0.5 font-mono text-slate-900">“{d.mensagem.conteudo}”</p>
                              </div>
                            )}

                            {usuarioInfrator && (
                              <div className="flex flex-wrap items-center justify-between gap-2 border border-slate-300 bg-slate-100 px-3 py-2 text-xs">
                                <div>
                                  <span className="font-mono font-bold">CONTA ENVOLVIDA (#USR-{usuarioInfrator.idUsuario}):</span>{' '}
                                  {usuarioInfrator.nome}{' '}
                                  <span className={`ml-1 border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${usuarioInfrator.banido ? 'border-red-800 bg-red-200 text-red-900' : 'border-emerald-800 bg-emerald-100 text-emerald-900'}`}>
                                    {usuarioInfrator.banido ? 'BANIDO' : 'ATIVO'}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  disabled={ocupadoId === `ban-usr-${usuarioInfrator.idUsuario}`}
                                  onClick={() => alternarBanimento(usuarioInfrator.idUsuario, usuarioInfrator.nome, !usuarioInfrator.banido)}
                                  className={usuarioInfrator.banido ? btnSecundario : btnPerigo}
                                >
                                  <Ban className="size-3.5" /> {usuarioInfrator.banido ? 'Revogar banimento' : 'Banir usuário'}
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col justify-between gap-2 border border-slate-300 bg-slate-50 p-3">
                            <div>
                              <label className="block font-mono text-[11px] font-bold uppercase text-slate-700">
                                Parecer / Resolução da moderação
                                <textarea
                                  rows={2}
                                  value={resolucoesDenuncia[d.idDenuncia] ?? d.resolucao ?? ''}
                                  onChange={(e) => setResolucoesDenuncia((prev) => ({ ...prev, [d.idDenuncia]: e.target.value }))}
                                  placeholder="Registre a decisão ou providência tomada..."
                                  className={`${inputAdmin} mt-1 resize-none`}
                                />
                              </label>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {d.status !== 'em_analise' && (
                                <button type="button" disabled={ocupado} onClick={() => atualizarStatusDenuncia(d, 'em_analise')} className={btnSecundario}>
                                  Em análise
                                </button>
                              )}
                              <button type="button" disabled={ocupado} onClick={() => atualizarStatusDenuncia(d, 'resolvida')} className={btnPrimario}>
                                <Check className="size-3.5" /> Marcar resolvida
                              </button>
                              <button type="button" disabled={ocupado} onClick={() => atualizarStatusDenuncia(d, 'descartada')} className={btnSecundario}>
                                Descartar
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {aba === 'disputas' && (
            <section>
              <div className="mb-4 border-b border-slate-300 pb-3">
                <h2 className="text-base font-extrabold uppercase tracking-wide">Módulo de Mediação e Disputas (RF15)</h2>
                <p className="text-xs text-slate-600">
                  Pedidos com pagamento retido por abertura de disputa. Decida entre manter a venda, autorizar devolução, estornar ou cancelar.
                </p>
              </div>

              {disputas.length === 0 ? (
                <p className="border border-dashed border-slate-400 bg-slate-50 p-8 text-center font-mono text-xs text-slate-600">
                  NENHUM PEDIDO EM DISPUTA AGUARDANDO RESOLUÇÃO NO MOMENTO.
                </p>
              ) : (
                <div className="divide-y-2 divide-slate-300 border border-slate-400">
                  {disputas.map((p) => {
                    const ocupado = ocupadoId === `disp-${p.idPedido}`
                    const somenteEstorno = p.statusPedido === 'devolucao_autorizada'
                    return (
                      <article key={p.idPedido} className="bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="border border-slate-400 bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold">
                              #PED-{String(p.idPedido).padStart(4, '0')}
                            </span>
                            <span className={`border px-2 py-0.5 font-mono text-[11px] font-bold uppercase ${
                              p.statusPedido === 'em_disputa' ? 'border-red-800 bg-red-100 text-red-900' : 'border-amber-800 bg-amber-100 text-amber-900'
                            }`}>
                              {p.statusPedido === 'em_disputa' ? 'EM DISPUTA' : 'DEVOLUÇÃO AUTORIZADA'}
                            </span>
                            <span className="font-mono text-xs text-slate-600">
                              Criado em {formatarDataHora(p.dataCriacao)}
                            </span>
                          </div>
                          <span className="font-mono text-sm font-extrabold text-slate-900">
                            TOTAL: {formatarMoeda(p.valorTotal)} (Repasse: {formatarMoeda(p.valorRepasseVendedor)} | Taxa: {formatarMoeda(p.taxaPlataforma)})
                          </span>
                        </div>

                        <div className="mt-3 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                          <div className="space-y-2 text-xs">
                            <div className="grid gap-2 border border-slate-300 bg-slate-100 p-2.5 sm:grid-cols-3">
                              <div>
                                <span className="block font-mono text-[10px] font-bold uppercase text-slate-500">Anúncio</span>
                                <strong>{p.anuncio?.titulo ?? `#${p.idAnuncio}`}</strong>
                              </div>
                              <div>
                                <span className="block font-mono text-[10px] font-bold uppercase text-slate-500">Comprador</span>
                                <strong>{p.comprador?.nome ?? `#${p.idComprador}`}</strong>
                              </div>
                              <div>
                                <span className="block font-mono text-[10px] font-bold uppercase text-slate-500">Vendedor / Rastreio</span>
                                <strong>{p.anuncio?.vendedor?.nome ?? '—'}</strong> ({p.codigoRastreio ?? 'sem rastreio'})
                              </div>
                            </div>

                            <div className="border border-red-300 bg-red-50 p-2.5 text-slate-900">
                              <span className="block font-mono text-[10px] font-bold uppercase text-red-800">Motivo alegado pelo comprador:</span>
                              <p className="mt-0.5 text-sm font-medium">{p.motivoDisputa ?? 'Sem motivo detalhado.'}</p>
                            </div>
                          </div>

                          <div className="flex flex-col justify-between gap-2 border border-slate-300 bg-slate-50 p-3">
                            <label className="block font-mono text-[11px] font-bold uppercase text-slate-700">
                              Despacho / Observação da resolução
                              <textarea
                                rows={2}
                                value={observacoesDisputa[p.idPedido] ?? p.resolucaoDisputa ?? ''}
                                onChange={(e) => setObservacoesDisputa((prev) => ({ ...prev, [p.idPedido]: e.target.value }))}
                                placeholder="Fundamentação da decisão administrativa..."
                                className={`${inputAdmin} mt-1 resize-none`}
                              />
                            </label>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {!somenteEstorno && (
                                <>
                                  <button type="button" disabled={ocupado} onClick={() => resolverDisputa(p, 'manter_venda')} className={btnPrimario}>
                                    Manter venda (liberar vendedor)
                                  </button>
                                  <button type="button" disabled={ocupado} onClick={() => resolverDisputa(p, 'autorizar_devolucao')} className={btnSecundario}>
                                    Autorizar devolução
                                  </button>
                                  <button type="button" disabled={ocupado} onClick={() => resolverDisputa(p, 'cancelar_venda')} className={btnSecundario}>
                                    Cancelar venda
                                  </button>
                                </>
                              )}
                              <button type="button" disabled={ocupado} onClick={() => resolverDisputa(p, 'estornar')} className={btnPerigo}>
                                Estornar comprador
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {aba === 'catalogo' && (
            <section>
              <div className="mb-4 border-b border-slate-300 pb-3">
                <h2 className="text-base font-extrabold uppercase tracking-wide">Módulo do Catálogo Mestre de Instrumentos (RF13)</h2>
                <p className="text-xs text-slate-600">
                  Cadastre, edite ou remova modelos padronizados utilizados para preenchimento automático de anúncios.
                </p>
              </div>

              <form onSubmit={salvarInstrumentoCatalogo} className="mb-6 border-2 border-slate-400 bg-slate-100 p-4">
                <div className="mb-3 flex items-center justify-between border-b border-slate-300 pb-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-extrabold uppercase text-slate-800">
                    <Wrench className="size-3.5" />
                    {editandoId !== null ? `Editando modelo #CAT-${String(editandoId).padStart(4, '0')}` : 'Cadastrar novo modelo no catálogo mestre'}
                  </span>
                  {editandoId !== null && (
                    <button type="button" onClick={limparFormularioCatalogo} className={btnSecundario}>
                      Cancelar edição
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                  <label className="font-mono text-[11px] font-bold uppercase text-slate-700">
                    Marca *
                    <input value={marca} onChange={(e) => setMarca(e.target.value)} required maxLength={80} placeholder="Ex.: Fender" className={`${inputAdmin} mt-1 font-sans`} />
                  </label>
                  <label className="font-mono text-[11px] font-bold uppercase text-slate-700 lg:col-span-2">
                    Modelo *
                    <input value={modelo} onChange={(e) => setModelo(e.target.value)} required maxLength={120} placeholder="Ex.: Stratocaster American Standard" className={`${inputAdmin} mt-1 font-sans`} />
                  </label>
                  <label className="font-mono text-[11px] font-bold uppercase text-slate-700">
                    Categoria *
                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={`${inputAdmin} mt-1 font-sans`}>
                      {categoriasDoFiltro.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="font-mono text-[11px] font-bold uppercase text-slate-700">
                    Captação
                    <input value={tipoCaptacao} onChange={(e) => setTipoCaptacao(e.target.value)} maxLength={60} placeholder="Ex.: SSS, HH, Ativa" className={`${inputAdmin} mt-1 font-sans`} />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="font-mono text-[11px] font-bold uppercase text-slate-700">
                      Cordas
                      <input type="number" min={0} max={18} value={numeroCordas} onChange={(e) => setNumeroCordas(e.target.value)} className={`${inputAdmin} mt-1 font-sans`} />
                    </label>
                    <label className="font-mono text-[11px] font-bold uppercase text-slate-700">
                      Orientação
                      <select value={orientacao} onChange={(e) => setOrientacao(e.target.value)} className={`${inputAdmin} mt-1 font-sans`}>
                        <option value="">N/A</option>
                        <option value="Destro">Destro</option>
                        <option value="Canhoto">Canhoto</option>
                        <option value="Ambidestro">Ambidestro</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="submit" disabled={ocupadoId === 'salvar-cat'} className={btnPrimario}>
                    <Plus className="size-3.5" /> {editandoId !== null ? 'Salvar alterações no modelo' : 'Inserir no catálogo mestre'}
                  </button>
                </div>
              </form>

              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-1 items-center gap-2 sm:max-w-md">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-slate-400" />
                    <input
                      value={buscaCatalogo}
                      onChange={(e) => setBuscaCatalogo(e.target.value)}
                      placeholder="Filtrar por marca ou modelo..."
                      className={`${inputAdmin} pl-8`}
                    />
                  </div>
                  <select value={categoriaCatalogo} onChange={(e) => setCategoriaCatalogo(e.target.value)} className={`${inputAdmin} w-44`} aria-label="Filtrar categoria">
                    <option value="">Todas as categorias</option>
                    {categoriasDoFiltro.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <span className="font-mono text-xs font-bold text-slate-600">
                  EXIBINDO {catalogoFiltrado.length} DE {catalogoMestre.length} REGISTROS
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-400">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-400 bg-slate-200 font-mono text-[11px] uppercase tracking-wider text-slate-800">
                      <th className="border-r border-slate-300 px-3 py-2">ID</th>
                      <th className="border-r border-slate-300 px-3 py-2">Marca</th>
                      <th className="border-r border-slate-300 px-3 py-2">Modelo</th>
                      <th className="border-r border-slate-300 px-3 py-2">Categoria</th>
                      <th className="border-r border-slate-300 px-3 py-2">Captação</th>
                      <th className="border-r border-slate-300 px-3 py-2">Cordas / Orient.</th>
                      <th className="px-3 py-2 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {catalogoFiltrado.map((inst) => (
                      <tr key={inst.idInstrumento} className="hover:bg-slate-50">
                        <td className="border-r border-slate-200 px-3 py-2 font-mono font-bold text-slate-600">
                          #CAT-{String(inst.idInstrumento).padStart(4, '0')}
                        </td>
                        <td className="border-r border-slate-200 px-3 py-2 font-semibold">{inst.marca}</td>
                        <td className="border-r border-slate-200 px-3 py-2">{inst.modelo}</td>
                        <td className="border-r border-slate-200 px-3 py-2 font-mono">{inst.categoria}</td>
                        <td className="border-r border-slate-200 px-3 py-2">{inst.tipoCaptacao || '—'}</td>
                        <td className="border-r border-slate-200 px-3 py-2 font-mono">
                          {inst.numeroCordas > 0 ? `${inst.numeroCordas}c` : '—'} {inst.orientacao ? `· ${inst.orientacao}` : ''}
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          <div className="inline-flex gap-1">
                            <button type="button" onClick={() => iniciarEdicaoCatalogo(inst)} className={btnSecundario}>
                              Editar
                            </button>
                            <button
                              type="button"
                              disabled={ocupadoId === `del-cat-${inst.idInstrumento}`}
                              onClick={() => excluirInstrumentoCatalogo(inst)}
                              className={btnPerigo}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
