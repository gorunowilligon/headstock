'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Filters } from '@/components/home/filters'
import { ProductCard } from '@/components/home/product-card'
import { contarFiltros, opcoesOrdenacao, type Filtros, type Ordenacao } from '@/lib/filtros'
import type { Anuncio, Instrumento } from '@/lib/models'

export function Home({ catalogo, carregando, erro, busca, filtros, onFiltrosChange, instrumentos, onOpen, favoritos, onToggleFavorite }: {
  catalogo: Anuncio[]
  carregando: boolean
  erro: string
  busca: string
  filtros: Filtros
  onFiltrosChange: (filtros: Filtros) => void
  instrumentos: Instrumento[]
  onOpen: (id: number) => void
  favoritos: number[]
  onToggleFavorite: (id: number) => void
}) {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const ativos = contarFiltros(filtros)

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-red-600">Mercado de instrumentos</p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Encontre seu próximo som</h1>
          <p className="mt-2 text-gray-500">
            {carregando ? 'Carregando anúncios...' : busca || ativos > 0 ? `${catalogo.length} ${catalogo.length === 1 ? 'resultado' : 'resultados'}${busca ? ` para "${busca}"` : ''}.` : `${catalogo.length} ${catalogo.length === 1 ? 'instrumento anunciado' : 'instrumentos anunciados'} por músicos como você.`}
          </p>
        </div>
        <Button variant="outline" onClick={() => setFiltrosAbertos((aberto) => !aberto)} aria-expanded={filtrosAbertos} className="w-fit gap-2 lg:hidden"><SlidersHorizontal /> Filtros {ativos > 0 && <Badge variant="secondary">{ativos}</Badge>}</Button>
      </div>
      <div className="flex flex-col gap-10 lg:flex-row">
        <Filters filtros={filtros} onChange={onFiltrosChange} instrumentos={instrumentos} aberto={filtrosAbertos} />
        <section className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between border-b pb-4 text-sm">
            <span className="font-medium">{busca || ativos > 0 ? 'Resultados' : 'Anúncios recentes'}</span>
            <select value={filtros.ordenar} onChange={(e) => onFiltrosChange({ ...filtros, ordenar: e.target.value as Ordenacao })} className="rounded-lg border bg-white px-3 py-2 text-sm" aria-label="Ordenar anúncios">
              {opcoesOrdenacao.map((opcao) => <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>)}
            </select>
          </div>
          {erro && <p role="alert" className="mb-5 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">{erro}</p>}
          {!carregando && !erro && catalogo.length === 0 && (
            <p className="rounded-2xl border-2 border-dashed p-10 text-center text-sm text-gray-500">Nenhum anúncio encontrado.</p>
          )}
          <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
            {catalogo.map((product) => (
              <ProductCard
                key={product.idAnuncio}
                product={product}
                onOpen={() => onOpen(product.idAnuncio)}
                isFavorite={favoritos.includes(product.idAnuncio)}
                onToggleFavorite={() => onToggleFavorite(product.idAnuncio)}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
