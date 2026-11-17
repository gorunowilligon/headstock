'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Home } from '@/components/home/home'
import { Detail } from '@/components/detail/detail'
import { Sell } from '@/components/sell/sell'
import { EditListing } from '@/components/sell/edit-listing'
import { Chat, conversaNaoLida } from '@/components/chat/chat'
import { Profile } from '@/components/profile/profile'
import { Favorites } from '@/components/favorites/favorites'
import { AuthForm } from '@/components/auth/auth-form'
import { useSessao } from '@/hooks/use-session'
import { api, mensagemDeErro } from '@/lib/api'
import { Filtros, filtrosVazios, type DadosFiltros } from '@/lib/filtros'
import type { AlvoConversa } from '@/components/detail/detail'
import { Anuncio } from '@/lib/models'
import type { Conversa, EdicaoAnuncio, Instrumento, NovaDenuncia, NovoAnuncio, UsuarioSessao } from '@/lib/models'

// RF06: estas telas exigem login (ou cadastro).
const telasComLogin = ['sell', 'edit', 'chat', 'profile', 'favorites']
const INTERVALO_CONVERSAS = 10000

const caminhoParaTela: Record<string, string> = {
  '/': 'home',
  '/vender': 'sell',
  '/chat': 'chat',
  '/perfil': 'profile',
  '/favoritos': 'favorites',
  '/entrar': 'login',
}

const telaParaCaminho: Record<string, string> = {
  home: '/',
  sell: '/vender',
  chat: '/chat',
  profile: '/perfil',
  favorites: '/favoritos',
  login: '/entrar',
}

function lerRotaDaUrl(pathname: string): { view: string, idAnuncio: number | null } {
  const limpo = pathname.replace(/\/+$/, '') || '/'
  if (caminhoParaTela[limpo]) return { view: caminhoParaTela[limpo], idAnuncio: null }
  const detalhe = limpo.match(/^\/anuncio\/(\d+)$/)
  if (detalhe) return { view: 'detail', idAnuncio: Number(detalhe[1]) }
  const edicao = limpo.match(/^\/editar\/(\d+)$/)
  if (edicao) return { view: 'edit', idAnuncio: Number(edicao[1]) }
  return { view: 'home', idAnuncio: null }
}

function caminhoDaTela(view: string, idAnuncio: number | null): string {
  if (view === 'detail' && idAnuncio) return `/anuncio/${idAnuncio}`
  if (view === 'edit' && idAnuncio) return `/editar/${idAnuncio}`
  return telaParaCaminho[view] ?? '/'
}

const chaveLidas = (idUsuario: number) => `headstock:lidas:${idUsuario}`

function lerMensagensLidas(idUsuario: number): Record<string, number> {
  try {
    const salvo = localStorage.getItem(chaveLidas(idUsuario))
    return salvo ? JSON.parse(salvo) : {}
  } catch {
    return {}
  }
}

type Aviso = { tipo: 'erro' | 'sucesso', texto: string }

export default function Page() {
  const sessao = useSessao()
  const { usuario } = sessao

  const [currentView, setCurrentView] = useState('home')
  const [previousView, setPreviousView] = useState('home')
  const [destinoLogin, setDestinoLogin] = useState('home')
  // Aba do perfil a abrir na próxima visita (ex.: "anuncios" ao sair da edição, "compras" após comprar).
  const [abaPerfil, setAbaPerfil] = useState('dados')
  // Conversa a abrir no chat quando o usuário vem de um anúncio.
  const [alvoChat, setAlvoChat] = useState<AlvoConversa | null>(null)
  const [anuncioSelecionadoId, setAnuncioSelecionadoId] = useState<number | null>(null)
  const [busca, setBusca] = useState('')
  const [filtros, setFiltros] = useState<DadosFiltros>(filtrosVazios)
  const ultimaBusca = useRef(0)
  const [aviso, setAviso] = useState<Aviso | null>(null)

  const [catalogo, setCatalogo] = useState<Anuncio[]>([])
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(true)
  const [erroCatalogo, setErroCatalogo] = useState('')
  const [avisoCatalogo, setAvisoCatalogo] = useState('')
  const [catalogoMestre, setCatalogoMestre] = useState<Instrumento[]>([])
  const [meusAnuncios, setMeusAnuncios] = useState<Anuncio[]>([])
  const [favoritosAnuncios, setFavoritosAnuncios] = useState<Anuncio[]>([])
  const [anuncioAvulso, setAnuncioAvulso] = useState<Anuncio | null>(null)
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [mensagensLidas, setMensagensLidas] = useState<Record<string, number>>({})
  const rotaPronta = useRef(false)

  const favoritos = favoritosAnuncios.map((anuncio) => anuncio.idAnuncio)
  const anuncioSelecionado = [...catalogo, ...meusAnuncios, ...favoritosAnuncios, ...(anuncioAvulso ? [anuncioAvulso] : [])].find((anuncio) => anuncio.idAnuncio === anuncioSelecionadoId)
  const temNotificacaoChat = Boolean(usuario && conversas.some((c) => conversaNaoLida(c, usuario.idUsuario, mensagensLidas)))

  const avisar = (tipo: Aviso['tipo'], texto: string) => setAviso({ tipo, texto })
  /** `contexto` diz o que falhou, ex.: "Não foi possível excluir o anúncio." */
  const avisarErro = (erro: unknown, contexto?: string) => avisar('erro', contexto ? `${contexto} ${mensagemDeErro(erro)}` : mensagemDeErro(erro))

  useEffect(() => {
    if (!aviso) return
    const timer = setTimeout(() => setAviso(null), 5000)
    return () => clearTimeout(timer)
  }, [aviso])

  // ---- Carregamento de dados ----------------------------------------------

  // ---- TelaInicial (RF05): operações do diagrama de sequência ---------------

  const notificar = useCallback((mensagem: string) => {
    setErroCatalogo(mensagem)
    setAvisoCatalogo('')
    setCatalogo([])
  }, [])

  const exibirAviso = useCallback((mensagem: string) => {
    setErroCatalogo('')
    setAvisoCatalogo(mensagem)
    setCatalogo([])
  }, [])

  const exibirCards = useCallback((anuncios: Anuncio[]) => {
    setErroCatalogo('')
    setAvisoCatalogo('')
    setCatalogo(anuncios)
  }, [])

  /** buscar(texto, filtros): chama Anuncio.buscar e segue o fragmento alt do diagrama de sequência. */
  const buscar = useCallback(async (texto: string, dados: DadosFiltros) => {
    // O número é tirado antes de qualquer retorno, para que uma resposta antiga nunca sobrescreva a busca atual.
    const numero = ++ultimaBusca.current
    try {
      const anuncios = await Anuncio.buscar(texto, new Filtros(dados))
      if (numero !== ultimaBusca.current) return // uma busca mais nova já foi disparada
      if (anuncios === null) notificar('Não foi possível carregar os anúncios.')
      else if (anuncios.length === 0) exibirAviso('Nenhum anúncio encontrado.')
      else exibirCards(anuncios)
    } catch (erro) {
      // Falha de conexão ou do servidor (fora do diagrama): mesma notificação, com o motivo.
      if (numero === ultimaBusca.current) notificar(`Não foi possível carregar os anúncios. ${mensagemDeErro(erro)}`)
    } finally {
      if (numero === ultimaBusca.current) setCarregandoCatalogo(false)
    }
  }, [notificar, exibirAviso, exibirCards])

  const carregarCatalogo = useCallback(() => buscar(busca, filtros), [buscar, busca, filtros])

  const carregarMeusDados = useCallback(async () => {
    const [meus, favs] = await Promise.all([api<Anuncio[]>('/anuncios/meus'), api<Anuncio[]>('/favoritos')])
    setMeusAnuncios(meus)
    setFavoritosAnuncios(favs)
  }, [])

  // Pequeno atraso para não consultar a API a cada tecla digitada em preço e localização.
  useEffect(() => {
    const timer = setTimeout(carregarCatalogo, 300)
    return () => clearTimeout(timer)
  }, [carregarCatalogo])

  useEffect(() => {
    api<Instrumento[]>('/instrumentos').then(setCatalogoMestre).catch(() => {})
  }, [])

  const idUsuario = usuario?.idUsuario

  const marcarMensagemLida = useCallback((chave: string, idMensagem: number) => {
    if (!idUsuario) return
    setMensagensLidas((atuais) => {
      if ((atuais[chave] ?? 0) >= idMensagem) return atuais
      const atualizado = { ...atuais, [chave]: idMensagem }
      try { localStorage.setItem(chaveLidas(idUsuario), JSON.stringify(atualizado)) } catch {}
      return atualizado
    })
  }, [idUsuario])

  useEffect(() => {
    if (!idUsuario) {
      setMeusAnuncios([])
      setFavoritosAnuncios([])
      setConversas([])
      setMensagensLidas({})
      return
    }
    setMensagensLidas(lerMensagensLidas(idUsuario))
    carregarMeusDados().catch((erro) => avisarErro(erro, 'Não foi possível carregar seus anúncios e favoritos.'))
    const carregarNotificacoes = () => api<Conversa[]>('/mensagens/conversas').then(setConversas).catch(() => {})
    carregarNotificacoes()
    const timer = setInterval(carregarNotificacoes, INTERVALO_CONVERSAS)
    return () => clearInterval(timer)
  }, [idUsuario, carregarMeusDados])

  const recarregarTudo = () => Promise.all([carregarCatalogo(), carregarMeusDados()])

  // ---- Navegação e login ----------------------------------------------------

  useEffect(() => {
    const sincronizarDaUrl = () => {
      const { view, idAnuncio } = lerRotaDaUrl(window.location.pathname)
      setCurrentView(view)
      if (idAnuncio !== null) setAnuncioSelecionadoId(idAnuncio)
    }
    sincronizarDaUrl()
    window.addEventListener('popstate', sincronizarDaUrl)
    return () => window.removeEventListener('popstate', sincronizarDaUrl)
  }, [])

  useEffect(() => {
    if (!rotaPronta.current) {
      rotaPronta.current = true
      return
    }
    const destino = caminhoDaTela(currentView, anuncioSelecionadoId)
    if (window.location.pathname !== destino) window.history.pushState(null, '', destino)
  }, [currentView, anuncioSelecionadoId])

  useEffect(() => {
    if (!anuncioSelecionadoId || anuncioSelecionado) return
    api<Anuncio>(`/anuncios/${anuncioSelecionadoId}`)
      .then(setAnuncioAvulso)
      .catch(() => setCurrentView('home'))
  }, [anuncioSelecionadoId, anuncioSelecionado])

  const pedirLogin = (destino: string) => {
    setDestinoLogin(destino)
    setCurrentView('login')
  }

  const navegar = (view: string) => {
    setAbaPerfil('dados')
    setAlvoChat(null)
    if (telasComLogin.includes(view) && !usuario) return pedirLogin(view)
    setCurrentView(view)
  }

  const irParaPerfil = (aba: string) => {
    setAbaPerfil(aba)
    setCurrentView('profile')
  }

  const abrirConversa = (alvo: AlvoConversa) => {
    setAlvoChat(alvo)
    setCurrentView('chat')
  }

  // Depois do checkout: o anúncio sai do catálogo e o pedido aparece em "Minhas compras".
  const aposComprar = () => {
    recarregarTudo().catch(() => {}) // a compra já foi feita; a lista se atualiza na próxima visita
    setAlvoChat(null)
    irParaPerfil('compras')
    avisar('sucesso', 'Compra realizada. Acompanhe o pedido em Minhas compras.')
  }

  // Sessão expirada ou encerrada em uma tela que exige login: volta para o login.
  useEffect(() => {
    if (!sessao.carregando && !usuario && telasComLogin.includes(currentView)) pedirLogin(currentView)
  }, [sessao.carregando, usuario, currentView])

  const sair = () => {
    sessao.sair()
    setCurrentView('home')
  }

  const pesquisarTexto = (texto: string) => {
    setBusca(texto)
    setCurrentView('home')
  }

  const openDetail = (id: number) => {
    setAnuncioSelecionadoId(id)
    setPreviousView(currentView)
    setCurrentView('detail')
  }

  // ---- Ações -------------------------------------------------------------------

  const toggleFavorite = async (id: number) => {
    if (!usuario) return pedirLogin(currentView)
    const jaFavorito = favoritos.includes(id)
    const anuncio = [...catalogo, ...meusAnuncios].find((a) => a.idAnuncio === id)
    if (jaFavorito) {
      setFavoritosAnuncios((prev) => prev.filter((a) => a.idAnuncio !== id))
      try {
        await api(`/favoritos/${id}`, { method: 'DELETE' })
      } catch (erro) {
        avisarErro(erro, 'Não foi possível remover dos favoritos.')
        carregarMeusDados().catch(() => {})
      }
      return
    }
    if (anuncio) setFavoritosAnuncios((prev) => [anuncio, ...prev])
    try {
      await api(`/favoritos/${id}`, { method: 'PUT' })
    } catch {
      avisar('erro', 'Não foi possível salvar nos favoritos.')
      setFavoritosAnuncios((prev) => prev.filter((a) => a.idAnuncio !== id))
    }
  }

  const togglePause = async (id: number) => {
    const anuncio = meusAnuncios.find((a) => a.idAnuncio === id)
    if (!anuncio) return
    try {
      await api(`/anuncios/${id}/${anuncio.status === 'ativo' ? 'pausar' : 'reativar'}`, { method: 'POST' })
      await recarregarTudo()
    } catch (erro) {
      avisarErro(erro, anuncio.status === 'ativo' ? 'Não foi possível pausar o anúncio.' : 'Não foi possível reativar o anúncio.')
    }
  }

  // Erros destas três funções sobem para o formulário, que os exibe junto aos campos.
  const publishListing = async (novo: NovoAnuncio) => {
    await api('/anuncios', { method: 'POST', body: novo })
    await recarregarTudo()
    setCurrentView('home')
    avisar('sucesso', 'Anúncio publicado.')
  }

  const updateListing = async (id: number, dados: EdicaoAnuncio) => {
    const atualizado = await api<Anuncio>(`/anuncios/${id}`, { method: 'PATCH', body: dados })
    if (anuncioAvulso?.idAnuncio === id) setAnuncioAvulso(atualizado)
    await recarregarTudo()
    irParaPerfil('anuncios')
    avisar('sucesso', 'Anúncio atualizado.')
  }

  const submitReport = async (denuncia: NovaDenuncia) => {
    await api('/denuncias', { method: 'POST', body: denuncia })
  }

  const editListing = (id: number) => {
    setAnuncioSelecionadoId(id)
    setCurrentView('edit')
  }

  const deleteListing = async (id: number) => {
    try {
      await api(`/anuncios/${id}`, { method: 'DELETE' })
      setMeusAnuncios((prev) => prev.filter((anuncio) => anuncio.idAnuncio !== id))
      await recarregarTudo()
    } catch (erro) {
      avisarErro(erro, 'Não foi possível excluir o anúncio.')
    }
  }

  const salvarPerfil = async (campos: Partial<Pick<UsuarioSessao, 'nome' | 'enderecoCompleto' | 'chavePix'>>) => {
    sessao.atualizar(await api<UsuarioSessao>('/usuarios/me', { method: 'PATCH', body: campos }))
  }

  // ---- Renderização -------------------------------------------------------------

  const renderView = () => {
    if (currentView === 'login') return <AuthForm entrar={sessao.entrar} cadastrar={sessao.cadastrar} onSucesso={() => setCurrentView(destinoLogin === 'login' ? 'home' : destinoLogin)} motivo={destinoLogin !== 'home' ? 'Entre ou crie uma conta para continuar.' : undefined} />
    if (currentView === 'detail') {
      if (!anuncioSelecionado) return <main className="mx-auto max-w-[1240px] px-5 py-8 text-sm text-gray-500 lg:px-10">Carregando anúncio...</main>
      return <Detail key={anuncioSelecionado.idAnuncio} anuncio={anuncioSelecionado} idUsuarioLogado={usuario?.idUsuario ?? null} onBack={() => setCurrentView(previousView)} onReport={submitReport} onRequireLogin={() => pedirLogin('detail')} onComprado={aposComprar} onConversar={abrirConversa} />
    }
    if (!usuario) {
      if (currentView === 'home') return renderHome()
      return null // aguardando o redirecionamento para o login
    }
    if (currentView === 'sell') return <Sell catalogoMestre={catalogoMestre} localizacaoPadrao={usuario.enderecoCompleto} onPublish={publishListing} />
    if (currentView === 'edit') {
      if (!anuncioSelecionado) return <main className="mx-auto max-w-5xl px-5 py-8 text-sm text-gray-500 lg:px-10">Carregando anúncio...</main>
      return <EditListing key={anuncioSelecionado.idAnuncio} anuncio={anuncioSelecionado} onSave={updateListing} onCancel={() => irParaPerfil('anuncios')} />
    }
    if (currentView === 'chat') return <Chat key={alvoChat ? `${alvoChat.com.idUsuario}:${alvoChat.anuncio?.idAnuncio}` : 'chat'} idUsuario={usuario.idUsuario} alvoInicial={alvoChat} onComprado={aposComprar} lidas={mensagensLidas} onMarcarLida={marcarMensagemLida} onConversasChange={setConversas} />
    if (currentView === 'profile') return <Profile key={abaPerfil} abaInicial={abaPerfil} usuario={usuario} meusAnuncios={meusAnuncios.filter((anuncio) => anuncio.status !== 'removido')} onSalvarPerfil={salvarPerfil} onSair={sair} onEditListing={editListing} onTogglePause={togglePause} onDeleteListing={deleteListing} />
    if (currentView === 'favorites') return <Favorites catalogo={favoritosAnuncios} onOpen={openDetail} onBrowse={() => setCurrentView('home')} favoritos={favoritos} onToggleFavorite={toggleFavorite} />
    return renderHome()
  }

  const renderHome = () => (
    <Home catalogo={catalogo} carregando={carregandoCatalogo} erro={erroCatalogo} aviso={avisoCatalogo} onTentarNovamente={carregarCatalogo} busca={busca} filtros={filtros} onFiltrosChange={setFiltros} instrumentos={catalogoMestre} onOpen={openDetail} favoritos={favoritos} onToggleFavorite={toggleFavorite} />
  )

  return (
    // Coluna flex: o conteúdo ocupa a altura que sobra e o rodapé fica sempre no fim da tela,
    // mesmo em páginas curtas (favoritos vazios, abas pequenas do perfil).
    <div className="flex min-h-screen flex-col bg-white text-gray-950">
      <Header onNavigate={navegar} onSearch={pesquisarTexto} logado={Boolean(usuario)} temNotificacaoChat={temNotificacaoChat} />
      {aviso && (
        <div role={aviso.tipo === 'erro' ? 'alert' : 'status'} className={`px-5 py-3 text-center text-sm font-semibold ${aviso.tipo === 'erro' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {aviso.texto}
        </div>
      )}
      {/* [&>main]:flex-1 faz o <main> de cada tela crescer até o rodapé (inclusive o fundo cinza de "Vender").
          [&>main]:w-full evita que o mx-auto das telas encolha o <main> ao tamanho do conteúdo numa coluna flex;
          o max-w de cada tela continua limitando e centralizando a largura. */}
      <div className="flex flex-1 flex-col [&>main]:w-full [&>main]:flex-1">
        {renderView()}
      </div>
      <Footer />
    </div>
  )
}
