import { SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Filters } from '@/components/home/filters'
import { ProductCard } from '@/components/home/product-card'
import type { Product } from '@/lib/products'

export function Home({ catalogo, onOpen, favoritos, onToggleFavorite }: { catalogo: Product[], onOpen: (id: number) => void, favoritos: number[], onToggleFavorite: (id: number) => void }) {
  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-red-600">Mercado de instrumentos</p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Encontre seu próximo som</h1>
          <p className="mt-2 text-gray-500">1.248 instrumentos anunciados por músicos como você.</p>
        </div>
        <Button variant="outline" className="w-fit gap-2"><SlidersHorizontal /> Filtros <Badge variant="secondary">3</Badge></Button>
      </div>
      <div className="flex gap-10">
        <Filters />
        <section className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between border-b pb-4 text-sm">
            <span className="font-medium">Destaques para você</span>
            <select className="rounded-lg border bg-white px-3 py-2 text-sm" aria-label="Ordenar anúncios">
              <option>Mais relevantes</option>
              <option>Mais recentes</option>
              <option>Menor preço</option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
            {catalogo.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpen={() => onOpen(product.id)}
                isFavorite={favoritos.includes(product.id)}
                onToggleFavorite={() => onToggleFavorite(product.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
