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
import { meusAnunciosIds, products } from '@/lib/products'

export default function Page() {
  const [currentView, setCurrentView] = useState('home')
  const [previousView, setPreviousView] = useState('home')
  const [catalogo, setCatalogo] = useState(products)
  const [pausados, setPausados] = useState<number[]>([])
  const [favoritos, setFavoritos] = useState<number[]>([])

  const catalogoAtivo = catalogo.filter((product) => !pausados.includes(product.id))
  const meusAnuncios = catalogo.filter((product) => meusAnunciosIds.includes(product.id))

  const toggleFavorite = (id: number) => {
    setFavoritos((prev) => prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id])
  }

  const togglePause = (id: number) => {
    setPausados((prev) => prev.includes(id) ? prev.filter((pausedId) => pausedId !== id) : [...prev, id])
  }

  const deleteListing = (id: number) => {
    setCatalogo((prev) => prev.filter((product) => product.id !== id))
    setPausados((prev) => prev.filter((pausedId) => pausedId !== id))
    setFavoritos((prev) => prev.filter((favId) => favId !== id))
  }

  const openDetail = () => {
    setPreviousView(currentView)
    setCurrentView('detail')
  }

  const renderView = () => {
    if (currentView === 'detail') return <Detail onBack={() => setCurrentView(previousView)} />
    if (currentView === 'sell') return <Sell />
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
