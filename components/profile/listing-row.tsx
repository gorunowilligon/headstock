import { Pause, Play, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/products'

export function ListingRow({ listing, isPaused, onTogglePause, onDelete }: { listing: Product, isPaused: boolean, onTogglePause: () => void, onDelete: () => void }) {
  return (
    <article className="flex items-center gap-4 rounded-xl border p-3">
      <img src={listing.image} alt={listing.title} className={`size-20 shrink-0 rounded-lg object-cover ${isPaused ? 'opacity-50 grayscale' : ''}`} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold">{listing.title}</h3>
        <p className="text-xs text-gray-500">{listing.condition}</p>
        <p className="mt-1 font-extrabold text-red-600">{listing.price}</p>
        {isPaused && <Badge variant="secondary" className="mt-1">Pausado</Badge>}
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        <Button variant="outline" size="sm" onClick={onTogglePause} className="text-gray-600" aria-label={`${isPaused ? 'Reativar' : 'Pausar'} anúncio ${listing.title}`}>{isPaused ? <Play /> : <Pause />} {isPaused ? 'Reativar' : 'Pausar'}</Button>
        <Button variant="outline" size="sm" onClick={onDelete} className="text-gray-600 hover:border-red-600 hover:bg-red-50 hover:text-red-600" aria-label={`Excluir anúncio ${listing.title}`}><Trash2 /> Excluir</Button>
      </div>
    </article>
  )
}
