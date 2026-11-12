'use client'

import { useState, type FormEvent } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryFields } from '@/components/sell/category-fields'
import { GlobalSpecFields } from '@/components/sell/global-spec-fields'
import { SpecValuesProvider } from '@/components/sell/spec-values'
import { categorias, type Categoria } from '@/lib/categories'
import { catalogoMestre, usuarioLogado } from '@/lib/mock-data'
import type { Anuncio, FotoAnuncio, Instrumento } from '@/lib/models'
import { redimensionarImagem } from '@/lib/resize-image'

const localizacaoDoUsuario = 'São Paulo, SP'

// RF02: mínimo de 3 fotos por anúncio. RN08: no máximo 5 MB por imagem.
export const MINIMO_FOTOS = 3
export const LIMITE_FOTO_MB = 5
const BYTES_POR_MB = 1024 * 1024

const estaNoCatalogo = (instrumento: Instrumento) => catalogoMestre.some((i) => i.idInstrumento === instrumento.idInstrumento)

// Instrumento.categoria guarda o tipo ("Guitarras", "Amplificadores"...); o formulário usa o valor da categoria.
const categoriaDoInstrumento = (instrumento: Instrumento): Categoria | '' =>
  categorias.find((categoria) => categoria.tipo === instrumento.categoria)?.value ?? ''

const valoresDoInstrumento = (instrumento: Instrumento): Record<string, string> => ({
  marca: instrumento.marca,
  modelo: instrumento.modelo,
  tipoCaptacao: instrumento.tipoCaptacao,
  numeroCordas: instrumento.numeroCordas ? String(instrumento.numeroCordas) : '',
  orientacao: instrumento.orientacao,
})

export function Sell({ anuncio, onPublish, onCancel }: { anuncio?: Anuncio, onPublish: (anuncio: Anuncio) => void, onCancel?: () => void }) {
  const emEdicao = anuncio !== undefined
  const manualInicial = emEdicao && !estaNoCatalogo(anuncio.instrumento)

  const [price, setPrice] = useState(emEdicao ? String(anuncio.preco) : '')
  const [preencherManual, setPreencherManual] = useState(manualInicial)
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria | ''>(manualInicial ? categoriaDoInstrumento(anuncio.instrumento) : '')
  const [fotos, setFotos] = useState<FotoAnuncio[]>(anuncio?.fotos ?? [])
  const [arquivosRecusados, setArquivosRecusados] = useState<string[]>([])
  const [erroFotos, setErroFotos] = useState('')
  const value = Number(price) || 0
  const valoresIniciais = manualInicial ? valoresDoInstrumento(anuncio.instrumento) : {}

  const adicionarFotos = async (files: FileList | null) => {
    if (!files) return
    const recusados: string[] = []
    const aceitos: File[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) recusados.push(`${file.name}: o arquivo não é uma imagem.`)
      else if (file.size > LIMITE_FOTO_MB * BYTES_POR_MB) recusados.push(`${file.name}: tem ${(file.size / BYTES_POR_MB).toFixed(1)} MB; o limite é ${LIMITE_FOTO_MB} MB.`)
      else aceitos.push(file)
    }

    const resultados = await Promise.allSettled(aceitos.map((file) => redimensionarImagem(file)))
    const novasFotos: FotoAnuncio[] = []
    resultados.forEach((resultado, i) => {
      if (resultado.status === 'fulfilled') {
        novasFotos.push({ idFoto: crypto.randomUUID(), url: resultado.value, tamanhoMB: Number((aceitos[i].size / BYTES_POR_MB).toFixed(2)) })
      } else {
        recusados.push(`${aceitos[i].name}: não foi possível ler a imagem.`)
      }
    })

    setArquivosRecusados(recusados)
    setFotos((prev) => [...prev, ...novasFotos])
    setErroFotos('')
  }

  const removerFoto = (idFoto: string) => {
    setFotos((prev) => prev.filter((foto) => foto.idFoto !== idFoto))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (fotos.length < MINIMO_FOTOS) {
      const faltam = MINIMO_FOTOS - fotos.length
      setErroFotos(`Envie no mínimo ${MINIMO_FOTOS} fotos. ${faltam === 1 ? 'Falta 1 foto' : `Faltam ${faltam} fotos`}.`)
      document.getElementById('secao-fotos')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const data = new FormData(e.currentTarget)
    const campo = (nome: string) => String(data.get(nome) ?? '').trim()

    const instrumento: Instrumento | undefined = preencherManual
      ? {
          idInstrumento: manualInicial ? anuncio.instrumento.idInstrumento : crypto.randomUUID(),
          marca: campo('marca'),
          modelo: campo('modelo'),
          categoria: categorias.find((categoria) => categoria.value === categoriaSelecionada)?.tipo ?? 'Outros',
          tipoCaptacao: campo('tipoCaptacao'),
          numeroCordas: Number(campo('numeroCordas')) || 0,
          orientacao: campo('orientacao'),
        }
      : catalogoMestre.find((i) => i.idInstrumento === campo('catalogo'))
    if (!instrumento) return

    onPublish({
      // Na edição, mantém identificador, status, data de criação, vendedor e localização do anúncio original.
      idAnuncio: anuncio?.idAnuncio ?? crypto.randomUUID(),
      titulo: `${instrumento.marca} ${instrumento.modelo}`,
      preco: value,
      condicao: campo('condicao'),
      status: anuncio?.status ?? 'ativo',
      dataCriacao: anuncio?.dataCriacao ?? new Date().toISOString(),
      idVendedor: anuncio?.idVendedor ?? usuarioLogado.idUsuario,
      instrumento,
      fotos,
      localizacao: anuncio?.localizacao ?? localizacaoDoUsuario,
      descricao: anuncio?.descricao,
    })
  }

  return (
    <main className="bg-gray-50">
      <div className="mx-auto max-w-5xl px-5 py-8 lg:px-10">
        <div className="mb-8">
          <p className="text-sm font-semibold text-red-600">{emEdicao ? 'Meus anúncios' : 'Venda para a comunidade'}</p>
          <h1 className="mt-1 text-3xl font-extrabold">{emEdicao ? 'Editar anúncio' : 'Criar anúncio'}</h1>
          <p className="mt-2 text-gray-500">{emEdicao ? 'Altere os dados e salve para atualizar o anúncio.' : 'Conte a história do seu instrumento e encontre o próximo dono.'}</p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            <section id="secao-fotos" className="rounded-2xl border bg-white p-6">
              <h2 className="mb-1 text-lg font-bold">1. Fotos do instrumento</h2>
              <p className="mb-5 text-sm text-gray-500">Envie no mínimo {MINIMO_FOTOS} fotos do item. Limite de {LIMITE_FOTO_MB} MB por imagem.</p>
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); adicionarFotos(e.dataTransfer.files) }}
                className={`grid min-h-52 cursor-pointer place-items-center rounded-xl border-2 border-dashed p-6 text-center ${erroFotos ? 'border-red-500 bg-red-50' : 'border-red-200 bg-red-50/40'}`}
              >
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { adicionarFotos(e.target.files); e.target.value = '' }} />
                <div>
                  <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-red-100 text-red-600"><Upload /></div>
                  <p className="font-semibold">Arraste suas fotos aqui</p>
                  <p className="mt-1 text-sm text-gray-500">ou <span className="font-semibold text-red-600">selecione os arquivos</span></p>
                </div>
              </label>
              <p className={`mt-3 text-sm font-semibold ${fotos.length >= MINIMO_FOTOS ? 'text-green-600' : 'text-gray-500'}`}>
                {fotos.length} de no mínimo {MINIMO_FOTOS} fotos
              </p>
              {erroFotos && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{erroFotos}</p>}
              {arquivosRecusados.length > 0 && (
                <div role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <p className="font-semibold">{arquivosRecusados.length === 1 ? 'Um arquivo não foi adicionado:' : `${arquivosRecusados.length} arquivos não foram adicionados:`}</p>
                  <ul className="mt-1 list-disc pl-5">
                    {arquivosRecusados.map((motivo) => <li key={motivo}>{motivo}</li>)}
                  </ul>
                </div>
              )}
              {fotos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {fotos.map((foto, i) => (
                    <div key={foto.idFoto} className="relative overflow-hidden rounded-lg border">
                      <img src={foto.url} alt={`Foto ${i + 1}`} className="aspect-square w-full object-cover" />
                      {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Capa</span>}
                      <button
                        type="button"
                        onClick={() => removerFoto(foto.idFoto)}
                        className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-white/90 text-gray-700 shadow-sm hover:text-red-600"
                        aria-label={`Remover foto ${i + 1}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="rounded-2xl border bg-white p-6">
              <h2 className="mb-5 text-lg font-bold">2. O que você está vendendo?</h2>
              <label className="mb-4 block text-sm font-semibold">
                Instrumento do catálogo mestre
                <select name="catalogo" defaultValue={emEdicao && !manualInicial ? anuncio.instrumento.idInstrumento : ''} required={!preencherManual} disabled={preencherManual} className="mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal disabled:bg-gray-100 disabled:text-gray-400">
                  <option value="">Selecione um instrumento</option>
                  {catalogoMestre.map((i) => <option key={i.idInstrumento} value={i.idInstrumento}>{i.marca} {i.modelo}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={preencherManual} onChange={(e) => setPreencherManual(e.target.checked)} /> Modelo não consta no catálogo? Preencha as especificações manualmente</label>
              {preencherManual && (
                <SpecValuesProvider value={valoresIniciais}>
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
                </SpecValuesProvider>
              )}
            </section>
            <section className="rounded-2xl border bg-white p-6">
              <h2 className="mb-5 text-lg font-bold">3. Condição e preço</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Condição do item
                  <select name="condicao" defaultValue={anuncio?.condicao ?? ''} required className="mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal">
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
            {erroFotos && <p className="mt-5 text-sm font-semibold text-red-600">{erroFotos}</p>}
            <Button type="submit" className="mt-7 w-full bg-red-600 hover:bg-red-700">{emEdicao ? 'Salvar alterações' : 'Publicar anúncio'}</Button>
            {onCancel && <Button type="button" variant="outline" onClick={onCancel} className="mt-3 w-full">Cancelar</Button>}
          </aside>
        </form>
      </div>
    </main>
  )
}
