'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Home } from '@/components/home/home'
import { Detail } from '@/components/detail/detail'
import { Sell } from '@/components/sell/sell'
import { Chat } from '@/components/chat/chat'
import { Profile } from '@/components/profile/profile'
import { Favorites } from '@/components/favorites/favorites'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { filtrosVazios, type FiltrosBusca } from '@/lib/busca'
import { anuncios, usuarioLogado } from '@/lib/mock-data'
import type { Anuncio, Denuncia } from '@/lib/models'

export default function Page() {
  const [currentView, setCurrentView] = useState('home')
  const [previousView, setPreviousView] = useState('home')
  const [anuncioSelecionadoId, setAnuncioSelecionadoId] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosBusca>(filtrosVazios)
  const [catalogo, setCatalogo] = usePersistentState<Anuncio[]>('headstock:v2:catalogo', anuncios)
  const [favoritos, setFavoritos] = usePersistentState<string[]>('headstock:v2:favoritos', [])
  const [, setDenuncias] = usePersistentState<Denuncia[]>('headstock:v2:denuncias', [])

  const catalogoAtivo = catalogo.filter((anuncio) => anuncio.status === 'ativo')
  const meusAnuncios = catalogo.filter((anuncio) => anuncio.idVendedor === usuarioLogado.idUsuario)
  const anuncioSelecionado = catalogo.find((anuncio) => anuncio.idAnuncio === anuncioSelecionadoId)

  // Ao digitar na busca do cabeçalho, mostra os resultados na tela inicial.
  const alterarTermo = (termo: string) => {
    setFiltros((prev) => ({ ...prev, termo }))
    setCurrentView('home')
  }

  const toggleFavorite = (id: string) => {
    setFavoritos((prev) => prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id])
  }

  const togglePause = (id: string) => {
    setCatalogo((prev) => prev.map((anuncio) => anuncio.idAnuncio === id
      ? { ...anuncio, status: anuncio.status === 'ativo' ? 'pausado' : 'ativo' }
      : anuncio))
  }

  const publishListing = (anuncio: Anuncio) => {
    setCatalogo((prev) => [anuncio, ...prev])
    setCurrentView('home')
  }

  const deleteListing = (id: string) => {
    setCatalogo((prev) => prev.filter((anuncio) => anuncio.idAnuncio !== id))
    setFavoritos((prev) => prev.filter((favId) => favId !== id))
  }

  const submitReport = (denuncia: Denuncia) => {
    setDenuncias((prev) => [...prev, denuncia])
  }

  const openDetail = (id: string) => {
    setAnuncioSelecionadoId(id)
    setPreviousView(currentView)
    setCurrentView('detail')
  }

  const renderView = () => {
    if (currentView === 'detail' && anuncioSelecionado) return <Detail key={anuncioSelecionado.idAnuncio} anuncio={anuncioSelecionado} onBack={() => setCurrentView(previousView)} onReport={submitReport} />
    if (currentView === 'sell') return <Sell onPublish={publishListing} />
    if (currentView === 'chat') return <Chat />
    if (currentView === 'profile') return <Profile meusAnuncios={meusAnuncios} onTogglePause={togglePause} onDeleteListing={deleteListing} />
    if (currentView === 'favorites') return <Favorites catalogo={catalogoAtivo} onOpen={openDetail} onBrowse={() => setCurrentView('home')} favoritos={favoritos} onToggleFavorite={toggleFavorite} />
    return <Home catalogo={catalogoAtivo} filtros={filtros} onFiltrosChange={setFiltros} onLimparFiltros={() => setFiltros(filtrosVazios)} onOpen={openDetail} favoritos={favoritos} onToggleFavorite={toggleFavorite} />
  }

  return (
    <div className="min-h-screen bg-white text-gray-950">
      <Header onNavigate={setCurrentView} termo={filtros.termo} onTermoChange={alterarTermo} />
      {renderView()}
      <Footer />
    </div>
  )
}
