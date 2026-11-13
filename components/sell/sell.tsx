'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { CategoryFields } from '@/components/sell/category-fields'
import { GlobalSpecFields } from '@/components/sell/global-spec-fields'
import { PhotoUploader } from '@/components/sell/photo-uploader'
import { mensagemDeErro } from '@/lib/api'
import { categorias, type Categoria } from '@/lib/categories'
import { lerEspecificacoes } from '@/lib/especificacoes'
import type { FotoAnuncio, Instrumento, NovoAnuncio } from '@/lib/models'
import { MIN_FOTOS, mensagemFotosInsuficientes } from '@/lib/photos'

export function Sell({ catalogoMestre, localizacaoPadrao, onPublish }: { catalogoMestre: Instrumento[], localizacaoPadrao: string, onPublish: (anuncio: NovoAnuncio) => Promise<void> }) {
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')
  const [price, setPrice] = useState('')
  const [preencherManual, setPreencherManual] = useState(false)
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria | ''>('')
  const [fotos, setFotos] = useState<FotoAnuncio[]>([])
  const [erroFotos, setErroFotos] = useState('')
  const value = Number(price) || 0

  const atualizarFotos = (novas: FotoAnuncio[]) => {
    setFotos(novas)
    if (novas.length >= MIN_FOTOS) setErroFotos('')
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (fotos.length < MIN_FOTOS) {
      setErroFotos(mensagemFotosInsuficientes(fotos.length))
      document.getElementById('secao-fotos')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const data = new FormData(e.currentTarget)
    const campo = (nome: string) => String(data.get(nome) ?? '').trim()

    const dadosBase = {
      condicao: campo('condicao'),
      preco: value,
      localizacao: campo('localizacao'),
      descricao: campo('descricao') || undefined,
      aceitaPropostas: data.get('aceitaPropostas') === 'on',
      fotos: fotos.map((foto) => foto.idFoto),
    }
    const anuncio: NovoAnuncio = preencherManual
      ? {
          ...dadosBase,
          instrumento: {
            marca: campo('marca'),
            modelo: campo('modelo'),
            categoria: categorias.find((categoria) => categoria.value === categoriaSelecionada)?.tipo ?? 'Outros',
            tipoCaptacao: campo('tipoCaptacao'),
            numeroCordas: Number(campo('numeroCordas')) || 0,
            orientacao: campo('orientacao'),
            especificacoes: lerEspecificacoes(data, categoriaSelecionada),
          },
        }
      : { ...dadosBase, idInstrumentoCatalogo: campo('catalogo') }

    setEnviando(true)
    setErroEnvio('')
    try {
      await onPublish(anuncio)
    } catch (erro) {
      setErroEnvio(mensagemDeErro(erro))
    } finally {
      setEnviando(false)
    }
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
            <section id="secao-fotos" className="rounded-2xl border bg-white p-6">
              <h2 className="mb-1 text-lg font-bold">1. Fotos do instrumento</h2>
              <PhotoUploader fotos={fotos} onChange={atualizarFotos} erro={erroFotos} />
            </section>
            <section className="rounded-2xl border bg-white p-6">
              <h2 className="mb-5 text-lg font-bold">2. O que você está vendendo?</h2>
              <label className="mb-4 block text-sm font-semibold">
                Instrumento do catálogo mestre
                <select name="catalogo" defaultValue="" required={!preencherManual} disabled={preencherManual} className="mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal disabled:bg-gray-100 disabled:text-gray-400">
                  <option value="">Selecione um instrumento</option>
                  {catalogoMestre.map((i) => <option key={i.idInstrumento} value={i.idInstrumento}>{i.marca} {i.modelo}</option>)}
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
              <label className="mt-5 block text-sm font-semibold">
                Localização do item
                <input name="localizacao" defaultValue={localizacaoPadrao} required minLength={2} placeholder="Ex.: São Paulo, SP" className="mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal" />
              </label>
              <label className="mt-5 block text-sm font-semibold">
                Descrição
                <textarea name="descricao" rows={4} maxLength={5000} placeholder="Estado de conservação, regulagem, acessórios que acompanham..." className="mt-2 w-full resize-none rounded-lg border bg-white px-3 py-3 font-normal" />
              </label>
              <label className="mt-5 flex items-center justify-between border-t pt-5 text-sm font-semibold">
                Aceitar propostas de preço
                <input type="checkbox" name="aceitaPropostas" defaultChecked />
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
            {erroEnvio && <p role="alert" className="mt-5 text-sm font-semibold text-red-600">{erroEnvio}</p>}
            <Button type="submit" disabled={enviando} className="mt-7 w-full bg-red-600 hover:bg-red-700">{enviando ? 'Publicando...' : 'Publicar anúncio'}</Button>
          </aside>
        </form>
      </div>
    </main>
  )
}
