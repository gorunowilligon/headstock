'use client'

import { useState, type FormEvent } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryFields } from '@/components/sell/category-fields'
import { GlobalSpecFields } from '@/components/sell/global-spec-fields'
import { categorias, type Categoria } from '@/lib/categories'
import { formatarPreco } from '@/lib/price'
import { catalogoMestre, vendedorAtual, type Product } from '@/lib/products'
import { redimensionarImagem } from '@/lib/resize-image'

const localizacaoDoUsuario = 'São Paulo, SP'

export function Sell({ onPublish }: { onPublish: (anuncio: Product) => void }) {
  const [price, setPrice] = useState('')
  const [preencherManual, setPreencherManual] = useState(false)
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria | ''>('')
  const [fotos, setFotos] = useState<string[]>([])
  const value = Number(price) || 0

  const adicionarFotos = async (files: FileList | null) => {
    if (!files) return
    const imagens = Array.from(files).filter((file) => file.type.startsWith('image/'))
    const resultados = await Promise.allSettled(imagens.map((file) => redimensionarImagem(file)))
    const novasFotos = resultados.flatMap((resultado) => resultado.status === 'fulfilled' ? [resultado.value] : [])
    setFotos((prev) => [...prev, ...novasFotos])
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const campo = (nome: string) => String(data.get(nome) ?? '').trim()

    const item = preencherManual
      ? { title: `${campo('marca')} ${campo('modelo')}`, brand: campo('marca'), type: categorias.find((categoria) => categoria.value === categoriaSelecionada)?.tipo ?? 'Outros' }
      : catalogoMestre.find((instrumento) => instrumento.title === campo('catalogo'))
    if (!item) return

    onPublish({
      id: Date.now(),
      ...item,
      condition: campo('condicao'),
      price: formatarPreco(value),
      location: localizacaoDoUsuario,
      image: fotos[0] ?? '/placeholder.jpg',
      fotos: fotos.length > 0 ? fotos : undefined,
      vendedor: vendedorAtual,
    })
  }

  return (
    <main className="bg-gray-50">
      <div className="mx-auto max-w-5xl px-5 py-8 lg:px-10">
        <div className="mb-8">
          <p className="text-sm font-semibold text-red-600">Venda para a comunidade</p>
          <h1 className="mt-1 text-3xl font-extrabold">Criar anúncio</h1>
          <p className="mt-2 text-gray-500">Conte a história do seu instrumento e encontre o próximo dono.</p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            <section className="rounded-2xl border bg-white p-6">
              <h2 className="mb-1 text-lg font-bold">1. Fotos do instrumento</h2>
              <p className="mb-5 text-sm text-gray-500">Envie no mínimo 3 fotos do item. Limite de 5 MB por imagem (serão redimensionadas no servidor).</p>
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); adicionarFotos(e.dataTransfer.files) }}
                className="grid min-h-52 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-red-200 bg-red-50/40 p-6 text-center"
              >
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { adicionarFotos(e.target.files); e.target.value = '' }} />
                <div>
                  <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-red-100 text-red-600"><Upload /></div>
                  <p className="font-semibold">Arraste suas fotos aqui</p>
                  <p className="mt-1 text-sm text-gray-500">ou <span className="font-semibold text-red-600">selecione os arquivos</span></p>
                </div>
              </label>
              {fotos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {fotos.map((foto, i) => (
                    <div key={i} className="relative overflow-hidden rounded-lg border">
                      <img src={foto} alt={`Foto ${i + 1}`} className="aspect-square w-full object-cover" />
                      {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Capa</span>}
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="rounded-2xl border bg-white p-6">
              <h2 className="mb-5 text-lg font-bold">2. O que você está vendendo?</h2>
              <label className="mb-4 block text-sm font-semibold">
                Instrumento do catálogo mestre
                <select name="catalogo" defaultValue="" required={!preencherManual} disabled={preencherManual} className="mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal disabled:bg-gray-100 disabled:text-gray-400">
                  <option value="">Selecione um instrumento</option>
                  {catalogoMestre.map((instrumento) => <option key={instrumento.title}>{instrumento.title}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={preencherManual} onChange={(e) => setPreencherManual(e.target.checked)} /> Modelo não consta no catálogo? Preencha as especificações manualmente</label>
              {preencherManual && (
                <div className="mt-6 flex flex-col gap-5 border-t pt-6">
                  <div>
                    <label className="block text-sm font-semibold">
                      Categoria
                      <select value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value as Categoria | '')} required className="mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal">
                        <option value="">Selecione a categoria</option>
                        {categorias.map((categoria) => <option key={categoria.value} value={categoria.value}>{categoria.label}</option>)}
                      </select>
                    </label>
                    <p className="mt-2 text-xs text-gray-500">Todos os campos técnicos são opcionais, mas anúncios com especificações completas vendem mais rápido.</p>
                  </div>
                  <GlobalSpecFields />
                  <CategoryFields categoria={categoriaSelecionada} />
                </div>
              )}
            </section>
            <section className="rounded-2xl border bg-white p-6">
              <h2 className="mb-5 text-lg font-bold">3. Condição e preço</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Condição do item
                  <select name="condicao" defaultValue="" required className="mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal">
                    <option value="">Selecione</option>
                    {['Novo', 'Seminovo', 'Usado · Excelente', 'Usado · Muito bom', 'Usado · Bom', 'Usado · Regular'].map((condicao) => <option key={condicao}>{condicao}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-semibold">
                  Valor do anúncio
                  <div className="mt-2 flex items-center rounded-lg border px-3">
                    <span className="text-gray-400">R$</span>
                    <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min={0.01} step={0.01} required className="w-full px-2 py-3 outline-none" placeholder="0,00" />
                  </div>
                </label>
              </div>
              <label className="mt-5 flex items-center justify-between border-t pt-5 text-sm font-semibold">
                Aceitar propostas de preço
                <input type="checkbox" defaultChecked />
              </label>
            </section>
          </div>
          <aside className="h-fit rounded-2xl border bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <h2 className="font-bold">Resumo financeiro</h2>
            <p className="mt-1 text-sm text-gray-500">Você recebe após a venda.</p>
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span>Valor do anúncio</span>
                <strong>R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Taxa Headstock (7%)</span>
                <span>- R$ {(value * .07).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-4 text-base">
                <strong>Você receberá</strong>
                <strong className="text-xl text-red-600">R$ {(value * .93).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>
            <Button type="submit" className="mt-7 w-full bg-red-600 hover:bg-red-700">Publicar anúncio</Button>
          </aside>
        </form>
      </div>
    </main>
  )
}
