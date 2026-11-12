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
import { anuncios, usuarioLogado } from '@/lib/mock-data'
import type { Anuncio } from '@/lib/models'

export default function Page() {
  const [currentView, setCurrentView] = useState('home')
  const [previousView, setPreviousView] = useState('home')
  const [anuncioSelecionadoId, setAnuncioSelecionadoId] = useState<string | null>(null)
  const [anuncioEmEdicaoId, setAnuncioEmEdicaoId] = useState<string | null>(null)
  const [abaPerfil, setAbaPerfil] = useState('dados')
  const [catalogo, setCatalogo] = usePersistentState<Anuncio[]>('headstock:v2:catalogo', anuncios)
  const [favoritos, setFavoritos] = usePersistentState<string[]>('headstock:v2:favoritos', [])

  const catalogoAtivo = catalogo.filter((anuncio) => anuncio.status === 'ativo')
  const meusAnuncios = catalogo.filter((anuncio) => anuncio.idVendedor === usuarioLogado.idUsuario)
  const anuncioSelecionado = catalogo.find((anuncio) => anuncio.idAnuncio === anuncioSelecionadoId)
  const anuncioEmEdicao = meusAnuncios.find((anuncio) => anuncio.idAnuncio === anuncioEmEdicaoId)

  const navigate = (view: string) => {
    if (view === 'profile') setAbaPerfil('dados')
    setCurrentView(view)
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

  const editListing = (id: string) => {
    setAnuncioEmEdicaoId(id)
    setCurrentView('edit')
  }

  const voltarParaMeusAnuncios = () => {
    setAnuncioEmEdicaoId(null)
    setAbaPerfil('anuncios')
    setCurrentView('profile')
  }

  const saveListing = (anuncioEditado: Anuncio) => {
    setCatalogo((prev) => prev.map((anuncio) => anuncio.idAnuncio === anuncioEditado.idAnuncio ? anuncioEditado : anuncio))
    voltarParaMeusAnuncios()
  }

  const deleteListing = (id: string) => {
    setCatalogo((prev) => prev.filter((anuncio) => anuncio.idAnuncio !== id))
    setFavoritos((prev) => prev.filter((favId) => favId !== id))
  }

  const openDetail = (id: string) => {
    setAnuncioSelecionadoId(id)
    setPreviousView(currentView)
    setCurrentView('detail')
  }

  const renderView = () => {
    if (currentView === 'detail' && anuncioSelecionado) return <Detail key={anuncioSelecionado.idAnuncio} anuncio={anuncioSelecionado} onBack={() => setCurrentView(previousView)} />
    if (currentView === 'edit' && anuncioEmEdicao) return <Sell key={anuncioEmEdicao.idAnuncio} anuncio={anuncioEmEdicao} onPublish={saveListing} onCancel={voltarParaMeusAnuncios} />
    if (currentView === 'sell') return <Sell key="novo" onPublish={publishListing} />
    if (currentView === 'chat') return <Chat />
    if (currentView === 'profile') return <Profile key={abaPerfil} meusAnuncios={meusAnuncios} abaInicial={abaPerfil} onEditListing={editListing} onTogglePause={togglePause} onDeleteListing={deleteListing} />
    if (currentView === 'favorites') return <Favorites catalogo={catalogoAtivo} onOpen={openDetail} onBrowse={() => setCurrentView('home')} favoritos={favoritos} onToggleFavorite={toggleFavorite} />
    return <Home catalogo={catalogoAtivo} onOpen={openDetail} favoritos={favoritos} onToggleFavorite={toggleFavorite} />
  }

  return (
    <div className="min-h-screen bg-white text-gray-950">
      <Header onNavigate={navigate} />
      {renderView()}
      <Footer />
    </div>
  )
}
