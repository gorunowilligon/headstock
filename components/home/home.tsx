'use client'

import { useState } from 'react'
import { SearchX, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Filters } from '@/components/home/filters'
import { ProductCard } from '@/components/home/product-card'
import { buscarAnuncios, correspondeAoTermo, quantidadeDeFiltrosAtivos, type FiltrosBusca, type Ordenacao } from '@/lib/busca'
import type { Anuncio } from '@/lib/models'

const opcoesDeOrdenacao: { valor: Ordenacao, rotulo: string }[] = [
  { valor: 'relevancia', rotulo: 'Mais relevantes' },
  { valor: 'recentes', rotulo: 'Mais recentes' },
  { valor: 'menor-preco', rotulo: 'Menor preço' },
  { valor: 'maior-preco', rotulo: 'Maior preço' },
]

export function Home({ catalogo, filtros, onFiltrosChange, onLimparFiltros, onOpen, favoritos, onToggleFavorite }: { catalogo: Anuncio[], filtros: FiltrosBusca, onFiltrosChange: (filtros: FiltrosBusca) => void, onLimparFiltros: () => void, onOpen: (id: string) => void, favoritos: string[], onToggleFavorite: (id: string) => void }) {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const { anuncios: resultados, erroPreco } = buscarAnuncios(catalogo, filtros)
  const anunciosDoTermo = catalogo.filter((anuncio) => correspondeAoTermo(anuncio, filtros.termo))
  const filtrosAtivos = quantidadeDeFiltrosAtivos(filtros)
  const termo = filtros.termo.trim()

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-red-600">Mercado de instrumentos</p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{termo ? `Resultados para "${termo}"` : 'Encontre seu próximo som'}</h1>
          <p className="mt-2 text-gray-500">{catalogo.length} {catalogo.length === 1 ? 'instrumento anunciado' : 'instrumentos anunciados'} por músicos como você.</p>
        </div>
        <Button variant="outline" className="w-fit gap-2 lg:hidden" onClick={() => setFiltrosAbertos((v) => !v)} aria-expanded={filtrosAbertos}>
          <SlidersHorizontal /> Filtros {filtrosAtivos > 0 && <Badge variant="secondary">{filtrosAtivos}</Badge>}
        </Button>
      </div>
      <div className="flex flex-col gap-10 lg:flex-row">
        <Filters anuncios={anunciosDoTermo} filtros={filtros} onChange={onFiltrosChange} onLimpar={onLimparFiltros} erroPreco={erroPreco} aberto={filtrosAbertos} />
        <section className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between gap-3 border-b pb-4 text-sm">
            <span className="font-medium" role="status">{resultados.length} {resultados.length === 1 ? 'anúncio encontrado' : 'anúncios encontrados'}</span>
            <select
              value={filtros.ordenacao}
              onChange={(e) => onFiltrosChange({ ...filtros, ordenacao: e.target.value as Ordenacao })}
              className="rounded-lg border bg-white px-3 py-2 text-sm"
              aria-label="Ordenar anúncios"
            >
              {opcoesDeOrdenacao.map((opcao) => <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>)}
            </select>
          </div>
          {resultados.length === 0 ? (
            <div className="grid min-h-72 place-items-center rounded-2xl border-2 border-dashed p-6 text-center">
              <div>
                <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-red-100 text-red-600"><SearchX /></div>
                <p className="font-semibold">Nenhum anúncio encontrado</p>
                <p className="mt-1 text-sm text-gray-500">Tente outros termos ou remova alguns filtros.</p>
                <Button onClick={onLimparFiltros} className="mt-5 bg-red-600 hover:bg-red-700">Limpar busca e filtros</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
              {resultados.map((product) => (
                <ProductCard
                  key={product.idAnuncio}
                  product={product}
                  onOpen={() => onOpen(product.idAnuncio)}
                  isFavorite={favoritos.includes(product.idAnuncio)}
                  onToggleFavorite={() => onToggleFavorite(product.idAnuncio)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
