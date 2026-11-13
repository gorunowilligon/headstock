import { Heart, MapPin } from 'lucide-react'
import { capaDoAnuncio } from '@/lib/anuncio'
import type { Anuncio } from '@/lib/models'
import { formatarPreco } from '@/lib/price'

export function ProductCard({ product, onOpen, isFavorite, onToggleFavorite }: { product: Anuncio, onOpen: () => void, isFavorite: boolean, onToggleFavorite: () => void }) {
  return (
    <article className="group cursor-pointer" onClick={onOpen}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
        <img src={capaDoAnuncio(product)} alt={product.titulo} className="size-full object-cover transition duration-500 group-hover:scale-105" />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-gray-700 shadow-sm"
          aria-label="Favoritar"
          aria-pressed={isFavorite}
        >
          <Heart className={`size-4 ${isFavorite ? 'fill-red-600 text-red-600' : ''}`} />
        </button>
      </div>
      <div className="flex flex-col gap-1.5 pt-3">
        <p className="text-xs text-gray-500">{product.condicao}</p>
        <h3 className="truncate font-semibold">{product.titulo}</h3>
        <p className="text-lg font-extrabold text-red-600">{formatarPreco(product.preco)}</p>
        <p className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="size-3.5" /> {product.localizacao}</p>
      </div>
    </article>
  )
}
