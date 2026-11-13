'use client'

import { useState, type FormEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PhotoUploader } from '@/components/sell/photo-uploader'
import type { Anuncio, FotoAnuncio } from '@/lib/models'
import { MIN_FOTOS, mensagemFotosInsuficientes } from '@/lib/photos'

const condicoes = ['Novo', 'Seminovo', 'Usado · Excelente', 'Usado · Muito bom', 'Usado · Bom', 'Usado · Regular']
const inputClass = 'mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal'

export function EditListing({ anuncio, onSave, onCancel }: { anuncio: Anuncio, onSave: (anuncio: Anuncio) => void, onCancel: () => void }) {
  const [fotos, setFotos] = useState<FotoAnuncio[]>(anuncio.fotos)
  const [erroFotos, setErroFotos] = useState('')
  const [price, setPrice] = useState(String(anuncio.preco))
  const value = Number(price) || 0

  const atualizarFotos = (novas: FotoAnuncio[]) => {
    setFotos(novas)
    if (novas.length >= MIN_FOTOS) setErroFotos('')
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (fotos.length < MIN_FOTOS) {
      setErroFotos(mensagemFotosInsuficientes(fotos.length))
      document.getElementById('secao-fotos')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const data = new FormData(e.currentTarget)
    const campo = (nome: string) => String(data.get(nome) ?? '').trim()
    const instrumento = {
      ...anuncio.instrumento,
      marca: campo('marca'),
      modelo: campo('modelo'),
      tipoCaptacao: campo('tipoCaptacao'),
      numeroCordas: Number(campo('numeroCordas')) || 0,
      orientacao: campo('orientacao'),
    }
    onSave({
      ...anuncio,
      titulo: `${instrumento.marca} ${instrumento.modelo}`,
      preco: value,
      condicao: campo('condicao'),
      descricao: campo('descricao') || undefined,
      instrumento,
      fotos,
    })
  }

  return (
    <main className="bg-gray-50">
      <div className="mx-auto max-w-5xl px-5 py-8 lg:px-10">
        <button onClick={onCancel} className="mb-7 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-600"><ArrowLeft /> Voltar para meus anúncios</button>
        <div className="mb-8">
          <p className="text-sm font-semibold text-red-600">Meus anúncios</p>
          <h1 className="mt-1 text-3xl font-extrabold">Editar anúncio</h1>
          <p className="mt-2 text-gray-500">Atualize fotos, especificações, condição ou preço do seu instrumento.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <section id="secao-fotos" className="rounded-2xl border bg-white p-6">
            <h2 className="mb-1 text-lg font-bold">1. Fotos do instrumento</h2>
            <PhotoUploader fotos={fotos} onChange={atualizarFotos} erro={erroFotos} />
          </section>
          <section className="rounded-2xl border bg-white p-6">
            <h2 className="mb-5 text-lg font-bold">2. Especificações</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold">Marca<input name="marca" defaultValue={anuncio.instrumento.marca} required className={inputClass} /></label>
              <label className="block text-sm font-semibold">Modelo<input name="modelo" defaultValue={anuncio.instrumento.modelo} required className={inputClass} /></label>
              <label className="block text-sm font-semibold">Tipo de captação<input name="tipoCaptacao" defaultValue={anuncio.instrumento.tipoCaptacao} className={inputClass} /></label>
              <label className="block text-sm font-semibold">Número de cordas<input name="numeroCordas" type="number" min={0} defaultValue={anuncio.instrumento.numeroCordas || ''} className={inputClass} /></label>
              <label className="block text-sm font-semibold">Orientação<input name="orientacao" defaultValue={anuncio.instrumento.orientacao} className={inputClass} /></label>
            </div>
            <label className="mt-5 block text-sm font-semibold">Descrição<textarea name="descricao" defaultValue={anuncio.descricao ?? ''} rows={4} className={`${inputClass} resize-none`} /></label>
          </section>
          <section className="rounded-2xl border bg-white p-6">
            <h2 className="mb-5 text-lg font-bold">3. Condição e preço</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Condição do item
                <select name="condicao" defaultValue={anuncio.condicao} required className={inputClass}>
                  {!condicoes.includes(anuncio.condicao) && <option>{anuncio.condicao}</option>}
                  {condicoes.map((condicao) => <option key={condicao}>{condicao}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Valor do anúncio
                <div className="mt-2 flex items-center rounded-lg border px-3">
                  <span className="text-gray-400">R$</span>
                  <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min={0.01} step={0.01} required className="w-full px-2 py-3 outline-none" />
                </div>
              </label>
            </div>
            <p className="mt-4 text-sm text-gray-500">Você receberá <strong className="text-red-600">R$ {(value * .93).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> após a taxa de 7%.</p>
          </section>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">Salvar alterações</Button>
          </div>
        </form>
      </div>
    </main>
  )
}
