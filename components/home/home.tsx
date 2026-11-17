'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Filters } from '@/components/home/filters'
import { ProductCard } from '@/components/home/product-card'
import { categoriasDoFiltro, contarFiltros, limparFiltros, opcoesOrdenacao, type DadosFiltros, type Ordenacao } from '@/lib/filtros'
import type { Anuncio, Instrumento } from '@/lib/models'

export function Home({ catalogo, carregando, erro, aviso, onTentarNovamente, busca, filtros, onFiltrosChange, instrumentos, onOpen, favoritos, onToggleFavorite }: {
  catalogo: Anuncio[]
  carregando: boolean
  erro: string
  aviso: string
  onTentarNovamente: () => void
  busca: string
  filtros: DadosFiltros
  onFiltrosChange: (filtros: DadosFiltros) => void
  instrumentos: Instrumento[]
  onOpen: (id: number) => void
  favoritos: number[]
  onToggleFavorite: (id: number) => void
}) {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const ativos = contarFiltros(filtros)
  const secao = filtros.categorias[0] ?? categoriasDoFiltro[0]

  // Trocar de seção descarta marca e captação, que podem não existir na nova seção.
  const abrirSecao = (categoria: string) => onFiltrosChange({ ...filtros, categorias: [categoria], marcas: [], tiposCaptacao: [] })

  return (
    <main className="mx-auto w-full px-5 py-8 lg:px-10">
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
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b">
            <div role="tablist" aria-label="Seções de instrumentos" className="flex flex-wrap gap-1">
              {categoriasDoFiltro.map((categoria) => (
                <button
                  key={categoria}
                  role="tab"
                  aria-selected={secao === categoria}
                  onClick={() => abrirSecao(categoria)}
                  className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${secao === categoria ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                >{categoria}</button>
              ))}
            </div>
            <select value={filtros.ordenar} onChange={(e) => onFiltrosChange({ ...filtros, ordenar: e.target.value as Ordenacao })} className="mb-1.5 rounded-lg border bg-white px-3 py-2 text-sm" aria-label="Ordenar anúncios">
              {opcoesOrdenacao.map((opcao) => <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>)}
            </select>
          </div>
          {erro && (
            <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">
              <span>{erro}</span>
              <Button size="sm" variant="outline" onClick={onTentarNovamente}>Tentar novamente</Button>
            </div>
          )}
          {!carregando && aviso && (
            <div className="rounded-2xl border-2 border-dashed p-10 text-center text-sm text-gray-500">
              <p className="font-semibold text-gray-700">{aviso}</p>
              {ativos > 0
                ? <><p className="mt-1">Tente remover alguns filtros.</p><Button size="sm" variant="outline" onClick={() => onFiltrosChange(limparFiltros(filtros))} className="mt-4">Limpar filtros</Button></>
                : busca ? <p className="mt-1">Confira a ortografia ou tente termos mais gerais, como a marca ou o tipo de instrumento.</p> : <p className="mt-1">Ainda não há instrumentos anunciados. Volte mais tarde!</p>}
            </div>
          )}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-x-5 gap-y-9">
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
