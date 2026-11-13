'use client'

import { useState, type FormEvent } from 'react'
import { Guitar, Heart, LogIn, Menu, MessageCircle, Plus, Search, UserRound, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header({ onNavigate, onSearch, logado }: { onNavigate: (view: string) => void, onSearch: (texto: string) => void, logado: boolean }) {
  const [texto, setTexto] = useState('')
  const [menuAberto, setMenuAberto] = useState(false)

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMenuAberto(false)
    onSearch(texto.trim())
  }

  const ir = (view: string) => {
    setMenuAberto(false)
    onNavigate(view)
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center gap-3 px-4 sm:gap-5 sm:px-5 lg:px-10">
        <button onClick={() => onNavigate('home')} className="flex shrink-0 items-center gap-2" aria-label="Ir para início">
          <span className="grid size-9 place-items-center rounded-xl bg-red-600 text-white"><Guitar /></span>
          <span className="text-2xl font-extrabold tracking-tight text-red-600">headstock</span>
        </button>
        <form onSubmit={handleSearch} role="search" className="hidden flex-1 md:block">
          <div className="mx-auto flex max-w-2xl items-center rounded-xl border bg-gray-50 px-4 py-2.5">
            <Search className="mr-3 text-gray-400" />
            <input value={texto} onChange={(e) => setTexto(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="O que você está procurando?" aria-label="Buscar anúncios" />
          </div>
        </form>
        <nav className="ml-auto flex items-center gap-1" aria-label="Navegação principal">
          <Button variant="ghost" size="icon" onClick={() => onNavigate('favorites')} aria-label="Favoritos"><Heart /></Button>
          <Button variant="ghost" size="icon" onClick={() => onNavigate('chat')} aria-label="Mensagens"><MessageCircle /></Button>
          <Button onClick={() => onNavigate('sell')} className="hidden gap-2 bg-red-600 hover:bg-red-700 sm:flex"><Plus /> Criar anúncio</Button>
          {logado
            ? <Button variant="ghost" size="icon" onClick={() => onNavigate('profile')} aria-label="Perfil"><UserRound /></Button>
            // No celular só o ícone (o texto "Entrar" fazia o cabeçalho passar da largura da tela).
            : <Button variant="outline" onClick={() => onNavigate('login')} className="gap-2 px-2.5 sm:px-3" aria-label="Entrar"><LogIn /> <span className="hidden sm:inline">Entrar</span></Button>}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuAberto((aberto) => !aberto)} aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuAberto} aria-controls="menu-movel">{menuAberto ? <X /> : <Menu />}</Button>
        </nav>
      </div>
      {menuAberto && (
        <div id="menu-movel" className="flex flex-col gap-3 border-t px-5 py-4 md:hidden">
          <form onSubmit={handleSearch} role="search" className="flex items-center rounded-xl border bg-gray-50 px-4 py-2.5">
            <Search className="mr-3 text-gray-400" />
            <input value={texto} onChange={(e) => setTexto(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="O que você está procurando?" aria-label="Buscar anúncios" />
          </form>
          <Button onClick={() => ir('sell')} className="gap-2 bg-red-600 hover:bg-red-700"><Plus /> Criar anúncio</Button>
        </div>
      )}
    </header>
  )
}
