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
import { meusAnunciosIdsMock, products, type Product } from '@/lib/products'

export default function Page() {
  const [currentView, setCurrentView] = useState('home')
  const [previousView, setPreviousView] = useState('home')
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<number | null>(null)
  const [catalogo, setCatalogo] = usePersistentState('headstock:v1:catalogo', products)
  const [meusAnunciosIds, setMeusAnunciosIds] = usePersistentState('headstock:v1:meus-anuncios', meusAnunciosIdsMock)
  const [pausados, setPausados] = usePersistentState<number[]>('headstock:v1:pausados', [])
  const [favoritos, setFavoritos] = usePersistentState<number[]>('headstock:v1:favoritos', [])

  const catalogoAtivo = catalogo.filter((product) => !pausados.includes(product.id))
  const meusAnuncios = catalogo.filter((product) => meusAnunciosIds.includes(product.id))
  const produtoSelecionado = catalogo.find((product) => product.id === produtoSelecionadoId)

  const toggleFavorite = (id: number) => {
    setFavoritos((prev) => prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id])
  }

  const togglePause = (id: number) => {
    setPausados((prev) => prev.includes(id) ? prev.filter((pausedId) => pausedId !== id) : [...prev, id])
  }

  const publishListing = (anuncio: Product) => {
    setCatalogo((prev) => [anuncio, ...prev])
    setMeusAnunciosIds((prev) => [...prev, anuncio.id])
    setCurrentView('home')
  }

  const deleteListing = (id: number) => {
    setCatalogo((prev) => prev.filter((product) => product.id !== id))
    setMeusAnunciosIds((prev) => prev.filter((myId) => myId !== id))
    setPausados((prev) => prev.filter((pausedId) => pausedId !== id))
    setFavoritos((prev) => prev.filter((favId) => favId !== id))
  }

  const openDetail = (id: number) => {
    setProdutoSelecionadoId(id)
    setPreviousView(currentView)
    setCurrentView('detail')
  }

  const renderView = () => {
    if (currentView === 'detail' && produtoSelecionado) return <Detail key={produtoSelecionado.id} produto={produtoSelecionado} onBack={() => setCurrentView(previousView)} />
    if (currentView === 'sell') return <Sell onPublish={publishListing} />
    if (currentView === 'chat') return <Chat />
    if (currentView === 'profile') return <Profile meusAnuncios={meusAnuncios} pausados={pausados} onTogglePause={togglePause} onDeleteListing={deleteListing} />
    if (currentView === 'favorites') return <Favorites catalogo={catalogoAtivo} onOpen={openDetail} onBrowse={() => setCurrentView('home')} favoritos={favoritos} onToggleFavorite={toggleFavorite} />
    return <Home catalogo={catalogoAtivo} onOpen={openDetail} favoritos={favoritos} onToggleFavorite={toggleFavorite} />
  }

  return (
    <div className="min-h-screen bg-white text-gray-950">
      <Header onNavigate={setCurrentView} />
      {renderView()}
      <Footer />
    </div>
  )
}
