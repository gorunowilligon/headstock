import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/home/product-card'
import type { Product } from '@/lib/products'

export function Favorites({ catalogo, onOpen, onBrowse, favoritos, onToggleFavorite }: { catalogo: Product[], onOpen: () => void, onBrowse: () => void, favoritos: number[], onToggleFavorite: (id: number) => void }) {
  const favoriteProducts = catalogo.filter((product) => favoritos.includes(product.id))

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-red-600">Sua lista</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Favoritos</h1>
        <p className="mt-2 text-gray-500">{favoriteProducts.length} {favoriteProducts.length === 1 ? 'instrumento salvo' : 'instrumentos salvos'}</p>
      </div>
      {favoriteProducts.length === 0 ? (
        <div className="grid min-h-80 place-items-center rounded-2xl border-2 border-dashed p-6 text-center">
          <div>
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-red-100 text-red-600"><Heart /></div>
            <p className="font-semibold">Nenhum favorito ainda</p>
            <p className="mt-1 text-sm text-gray-500">Toque no coração de um anúncio para salvá-lo aqui.</p>
            <Button onClick={onBrowse} className="mt-5 bg-red-600 hover:bg-red-700">Explorar anúncios</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoriteProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpen={onOpen}
              isFavorite
              onToggleFavorite={() => onToggleFavorite(product.id)}
            />
          ))}
        </div>
      )}
    </main>
  )
}
