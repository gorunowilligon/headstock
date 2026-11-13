'use client'

import { useState, type FormEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryFields } from '@/components/sell/category-fields'
import { GlobalSpecFields } from '@/components/sell/global-spec-fields'
import { PhotoUploader } from '@/components/sell/photo-uploader'
import { mensagemDeErro } from '@/lib/api'
import { categorias, type Categoria } from '@/lib/categories'
import { categoriaDoInstrumento, lerEspecificacoes, valoresIniciais } from '@/lib/especificacoes'
import type { Anuncio, EdicaoAnuncio, FotoAnuncio } from '@/lib/models'
import { MIN_FOTOS, mensagemFotosInsuficientes } from '@/lib/photos'
import { validarFormulario } from '@/lib/validacao'

const condicoes = ['Novo', 'Seminovo', 'Usado · Excelente', 'Usado · Muito bom', 'Usado · Bom', 'Usado · Regular']
const inputClass = 'mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal'

export function EditListing({ anuncio, onSave, onCancel }: { anuncio: Anuncio, onSave: (idAnuncio: number, dados: EdicaoAnuncio) => Promise<void>, onCancel: () => void }) {
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')
  const [fotos, setFotos] = useState<FotoAnuncio[]>(anuncio.fotos)
  const [erroFotos, setErroFotos] = useState('')
  const [price, setPrice] = useState(String(anuncio.preco))
  const [categoria, setCategoria] = useState<Categoria | ''>(() => categoriaDoInstrumento(anuncio.instrumento))
  const valores = valoresIniciais(anuncio.instrumento)
  const value = Number(price) || 0

  const atualizarFotos = (novas: FotoAnuncio[]) => {
    setFotos(novas)
    if (novas.length >= MIN_FOTOS) setErroFotos('')
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const faltamFotos = fotos.length < MIN_FOTOS
    setErroFotos(faltamFotos ? mensagemFotosInsuficientes(fotos.length) : '')
    const problema = validarFormulario(e.currentTarget, faltamFotos ? [mensagemFotosInsuficientes(fotos.length)] : [])
    if (problema) {
      setErroEnvio(problema)
      if (faltamFotos) document.getElementById('secao-fotos')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const data = new FormData(e.currentTarget)
    const campo = (nome: string) => String(data.get(nome) ?? '').trim()
    setEnviando(true)
    setErroEnvio('')
    try {
      await onSave(anuncio.idAnuncio, {
        preco: value,
        condicao: campo('condicao'),
        localizacao: campo('localizacao'),
        descricao: campo('descricao'),
        aceitaPropostas: data.get('aceitaPropostas') === 'on',
        instrumento: {
          marca: campo('marca'),
          modelo: campo('modelo'),
          categoria: categorias.find((c) => c.value === categoria)?.tipo ?? anuncio.instrumento.categoria,
          tipoCaptacao: campo('tipoCaptacao'),
          numeroCordas: Number(campo('numeroCordas')) || 0,
          orientacao: campo('orientacao'),
          especificacoes: lerEspecificacoes(data, categoria),
        },
        fotos: fotos.map((foto) => foto.idFoto),
      })
    } catch (erro) {
      setErroEnvio(mensagemDeErro(erro))
    } finally {
      setEnviando(false)
    }
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
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <section id="secao-fotos" className="rounded-2xl border bg-white p-6">
            <h2 className="mb-1 text-lg font-bold">1. Fotos do instrumento</h2>
            <PhotoUploader fotos={fotos} onChange={atualizarFotos} erro={erroFotos} />
          </section>
          <section className="flex flex-col gap-5 rounded-2xl border bg-white p-6">
            <h2 className="text-lg font-bold">2. Especificações</h2>
            <label className="block text-sm font-semibold">
              Categoria
              <select value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria | '')} className={inputClass}>
                <option value="">Selecione a categoria</option>
                {categorias.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </label>
            <GlobalSpecFields valores={valores} />
            {/* key: ao trocar de categoria, os campos da nova categoria começam com os valores salvos. */}
            <CategoryFields key={categoria} categoria={categoria} valores={valores} />
            <label className="block text-sm font-semibold">Descrição<textarea name="descricao" defaultValue={anuncio.descricao ?? ''} rows={4} maxLength={5000} className={`${inputClass} resize-none`} /></label>
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
                  <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min={0.01} max={10000000} step={0.01} required className="w-full px-2 py-3 outline-none" />
                </div>
              </label>
            </div>
            <label className="mt-5 block text-sm font-semibold">Localização do item<input name="localizacao" defaultValue={anuncio.localizacao} required minLength={2} className={inputClass} /></label>
            <label className="mt-5 flex items-center justify-between border-t pt-5 text-sm font-semibold">
              Aceitar propostas de preço
              <input type="checkbox" name="aceitaPropostas" defaultChecked={anuncio.aceitaPropostas} />
            </label>
            <p className="mt-4 text-sm text-gray-500">Você receberá <strong className="text-red-600">R$ {(value * .93).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> após a taxa de 7%. Mudar o preço cancela as propostas em aberto.</p>
          </section>
          {erroEnvio && <p role="alert" className="text-sm font-semibold text-red-600">{erroEnvio}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={enviando} className="bg-red-600 hover:bg-red-700">{enviando ? 'Salvando...' : 'Salvar alterações'}</Button>
          </div>
        </form>
      </div>
    </main>
  )
}
