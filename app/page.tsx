'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Home } from '@/components/home/home'
import { Detail } from '@/components/detail/detail'
import { Sell } from '@/components/sell/sell'
import { EditListing } from '@/components/sell/edit-listing'
import { Chat } from '@/components/chat/chat'
import { Profile } from '@/components/profile/profile'
import { Favorites } from '@/components/favorites/favorites'
import { AuthForm } from '@/components/auth/auth-form'
import { useSessao } from '@/hooks/use-session'
import { api, mensagemDeErro } from '@/lib/api'
import { filtrosVazios, paraQuery, type Filtros } from '@/lib/filtros'
import type { AlvoConversa } from '@/components/detail/detail'
import type { Anuncio, EdicaoAnuncio, Instrumento, NovaDenuncia, NovoAnuncio, UsuarioSessao } from '@/lib/models'

// RF07: estas telas exigem login (ou cadastro).
const telasComLogin = ['sell', 'edit', 'chat', 'profile', 'favorites']

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
  const [filtros, setFiltros] = useState<Filtros>(filtrosVazios)
  const ultimaBusca = useRef(0)
  const [aviso, setAviso] = useState<Aviso | null>(null)

  const [catalogo, setCatalogo] = useState<Anuncio[]>([])
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(true)
  const [erroCatalogo, setErroCatalogo] = useState('')
  const [catalogoMestre, setCatalogoMestre] = useState<Instrumento[]>([])
  const [meusAnuncios, setMeusAnuncios] = useState<Anuncio[]>([])
  const [favoritosAnuncios, setFavoritosAnuncios] = useState<Anuncio[]>([])

  const favoritos = favoritosAnuncios.map((anuncio) => anuncio.idAnuncio)
  const anuncioSelecionado = [...catalogo, ...meusAnuncios, ...favoritosAnuncios].find((anuncio) => anuncio.idAnuncio === anuncioSelecionadoId)

  const avisar = (tipo: Aviso['tipo'], texto: string) => setAviso({ tipo, texto })
  /** `contexto` diz o que falhou, ex.: "Não foi possível excluir o anúncio." */
  const avisarErro = (erro: unknown, contexto?: string) => avisar('erro', contexto ? `${contexto} ${mensagemDeErro(erro)}` : mensagemDeErro(erro))

  useEffect(() => {
    if (!aviso) return
    const timer = setTimeout(() => setAviso(null), 5000)
    return () => clearTimeout(timer)
  }, [aviso])

  // ---- Carregamento de dados ----------------------------------------------

  const carregarCatalogo = useCallback(async () => {
    const numero = ++ultimaBusca.current
    try {
      const resposta = await api<{ itens: Anuncio[] }>('/anuncios', { query: { q: busca, porPagina: 100, ...paraQuery(filtros) } })
      if (numero !== ultimaBusca.current) return // uma busca mais nova já foi disparada
      setCatalogo(resposta.itens)
      setErroCatalogo('')
    } catch (erro) {
      if (numero === ultimaBusca.current) setErroCatalogo(mensagemDeErro(erro))
    } finally {
      if (numero === ultimaBusca.current) setCarregandoCatalogo(false)
    }
  }, [busca, filtros])

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
  useEffect(() => {
    if (!idUsuario) {
      setMeusAnuncios([])
      setFavoritosAnuncios([])
      return
    }
    carregarMeusDados().catch((erro) => avisarErro(erro, 'Não foi possível carregar seus anúncios e favoritos.'))
  }, [idUsuario, carregarMeusDados])

  const recarregarTudo = () => Promise.all([carregarCatalogo(), carregarMeusDados()])

  // ---- Navegação e login ----------------------------------------------------

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

  const buscar = (texto: string) => {
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
    setFavoritosAnuncios((prev) => jaFavorito ? prev.filter((a) => a.idAnuncio !== id) : anuncio ? [anuncio, ...prev] : prev)
    try {
      await api(`/favoritos/${id}`, { method: jaFavorito ? 'DELETE' : 'PUT' })
    } catch (erro) {
      avisarErro(erro, jaFavorito ? 'Não foi possível remover dos favoritos.' : 'Não foi possível salvar nos favoritos.')
      carregarMeusDados().catch(() => {})
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
    await api(`/anuncios/${id}`, { method: 'PATCH', body: dados })
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
    if (currentView === 'detail' && anuncioSelecionado) return <Detail key={anuncioSelecionado.idAnuncio} anuncio={anuncioSelecionado} idUsuarioLogado={usuario?.idUsuario ?? null} onBack={() => setCurrentView(previousView)} onReport={submitReport} onRequireLogin={() => pedirLogin('detail')} onComprado={aposComprar} onConversar={abrirConversa} />
    if (!usuario) {
      if (currentView === 'home' || currentView === 'detail') return renderHome()
      return null // aguardando o redirecionamento para o login
    }
    if (currentView === 'sell') return <Sell catalogoMestre={catalogoMestre} localizacaoPadrao={usuario.enderecoCompleto} onPublish={publishListing} />
    if (currentView === 'edit' && anuncioSelecionado) return <EditListing key={anuncioSelecionado.idAnuncio} anuncio={anuncioSelecionado} onSave={updateListing} onCancel={() => irParaPerfil('anuncios')} />
    if (currentView === 'chat') return <Chat key={alvoChat ? `${alvoChat.com.idUsuario}:${alvoChat.anuncio?.idAnuncio}` : 'chat'} idUsuario={usuario.idUsuario} alvoInicial={alvoChat} onComprado={aposComprar} />
    if (currentView === 'profile') return <Profile key={abaPerfil} abaInicial={abaPerfil} usuario={usuario} meusAnuncios={meusAnuncios.filter((anuncio) => anuncio.status !== 'removido')} onSalvarPerfil={salvarPerfil} onSair={sair} onEditListing={editListing} onTogglePause={togglePause} onDeleteListing={deleteListing} />
    if (currentView === 'favorites') return <Favorites catalogo={favoritosAnuncios} onOpen={openDetail} onBrowse={() => setCurrentView('home')} favoritos={favoritos} onToggleFavorite={toggleFavorite} />
    return renderHome()
  }

  const renderHome = () => (
    <Home catalogo={catalogo} carregando={carregandoCatalogo} erro={erroCatalogo} onTentarNovamente={carregarCatalogo} busca={busca} filtros={filtros} onFiltrosChange={setFiltros} instrumentos={catalogoMestre} onOpen={openDetail} favoritos={favoritos} onToggleFavorite={toggleFavorite} />
  )

  return (
    // Coluna flex: o conteúdo ocupa a altura que sobra e o rodapé fica sempre no fim da tela,
    // mesmo em páginas curtas (favoritos vazios, abas pequenas do perfil).
    <div className="flex min-h-screen flex-col bg-white text-gray-950">
      <Header onNavigate={navegar} onSearch={buscar} logado={Boolean(usuario)} />
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
