import { Guitar, Heart, Menu, MessageCircle, Plus, Search, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center gap-5 px-5 lg:px-10">
        <button onClick={() => onNavigate('home')} className="flex shrink-0 items-center gap-2" aria-label="Ir para início">
          <span className="grid size-9 place-items-center rounded-xl bg-red-600 text-white"><Guitar /></span>
          <span className="text-2xl font-extrabold tracking-tight text-red-600">headstock</span>
        </button>
        <div className="hidden flex-1 md:block">
          <div className="mx-auto flex max-w-2xl items-center rounded-xl border bg-gray-50 px-4 py-2.5">
            <Search className="mr-3 text-gray-400" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="O que você está procurando?" aria-label="Buscar anúncios" />
          </div>
        </div>
        <nav className="ml-auto flex items-center gap-1" aria-label="Navegação principal">
          <Button variant="ghost" size="icon" onClick={() => onNavigate('favorites')} aria-label="Favoritos"><Heart /></Button>
          <Button variant="ghost" size="icon" onClick={() => onNavigate('chat')} aria-label="Mensagens"><MessageCircle /></Button>
          <Button onClick={() => onNavigate('sell')} className="hidden gap-2 bg-red-600 hover:bg-red-700 sm:flex"><Plus /> Criar anúncio</Button>
          <Button variant="ghost" size="icon" onClick={() => onNavigate('profile')} aria-label="Perfil"><UserRound /></Button>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu"><Menu /></Button>
        </nav>
      </div>
    </header>
  )
}
