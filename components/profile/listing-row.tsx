import { Pause, Play, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { capaDoAnuncio } from '@/lib/mock-data'
import type { Anuncio } from '@/lib/models'
import { formatarPreco } from '@/lib/price'

export function ListingRow({ listing, onTogglePause, onDelete }: { listing: Anuncio, onTogglePause: () => void, onDelete: () => void }) {
  const isPaused = listing.status === 'pausado'

  return (
    <article className="flex items-center gap-4 rounded-xl border p-3">
      <img src={capaDoAnuncio(listing)} alt={listing.titulo} className={`size-20 shrink-0 rounded-lg object-cover ${isPaused ? 'opacity-50 grayscale' : ''}`} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold">{listing.titulo}</h3>
        <p className="text-xs text-gray-500">{listing.condicao}</p>
        <p className="mt-1 font-extrabold text-red-600">{formatarPreco(listing.preco)}</p>
        {isPaused && <Badge variant="secondary" className="mt-1">Pausado</Badge>}
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        <Button variant="outline" size="sm" onClick={onTogglePause} className="text-gray-600" aria-label={`${isPaused ? 'Reativar' : 'Pausar'} anúncio ${listing.titulo}`}>{isPaused ? <Play /> : <Pause />} {isPaused ? 'Reativar' : 'Pausar'}</Button>
        <Button variant="outline" size="sm" onClick={onDelete} className="text-gray-600 hover:border-red-600 hover:bg-red-50 hover:text-red-600" aria-label={`Excluir anúncio ${listing.titulo}`}><Trash2 /> Excluir</Button>
      </div>
    </article>
  )
}
