'use client'

import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { urlFoto } from '@/lib/api'
import type { FotoAnuncio } from '@/lib/models'
import { LIMITE_FOTO_MB, MIN_FOTOS, processarFotos } from '@/lib/photos'

export type AtualizadorFotos = FotoAnuncio[] | ((atuais: FotoAnuncio[]) => FotoAnuncio[])

export function PhotoUploader({
  fotos,
  onChange,
  onEnviandoChange,
  erro,
}: {
  fotos: FotoAnuncio[]
  onChange: (fotos: AtualizadorFotos) => void
  onEnviandoChange?: (enviando: boolean) => void
  erro?: string
}) {
  const [errosUpload, setErrosUpload] = useState<string[]>([])
  const [enviando, setEnviando] = useState(false)
  const uploadsAtivos = useRef(0)

  const adicionarFotos = async (arquivos: File[]) => {
    if (!arquivos.length) return
    uploadsAtivos.current += 1
    setEnviando(true)
    onEnviandoChange?.(true)
    try {
      const { erros } = await processarFotos(arquivos, (nova) => {
        onChange((atuais) => [...atuais, nova])
      })
      setErrosUpload(erros)
    } finally {
      uploadsAtivos.current -= 1
      if (uploadsAtivos.current === 0) {
        setEnviando(false)
        onEnviandoChange?.(false)
      }
    }
  }

  const removerFoto = (id: number) => onChange((atuais) => atuais.filter((foto) => foto.idFoto !== id))

  return (
    <div>
      <p className="mb-5 text-sm text-gray-500">Envie no mínimo {MIN_FOTOS} fotos do item. Limite de {LIMITE_FOTO_MB} MB por imagem (serão redimensionadas no servidor).</p>
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); adicionarFotos(Array.from(e.dataTransfer.files)) }}
        className="grid min-h-52 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-red-200 bg-red-50/40 p-6 text-center"
      >
        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { const arquivos = e.target.files ? Array.from(e.target.files) : []; e.target.value = ''; adicionarFotos(arquivos) }} />
        <div>
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-red-100 text-red-600"><Upload /></div>
          <p className="font-semibold">Arraste suas fotos aqui</p>
          <p className="mt-1 text-sm text-gray-500">ou <span className="font-semibold text-red-600">selecione os arquivos</span></p>
        </div>
      </label>
      <p className={`mt-3 text-xs font-semibold ${fotos.length >= MIN_FOTOS ? 'text-green-600' : 'text-gray-500'}`}>
        {fotos.length} de {MIN_FOTOS} fotos mínimas{enviando && ' · enviando fotos...'}
      </p>
      {errosUpload.length > 0 && (
        <ul role="alert" className="mt-2 list-disc pl-5 text-xs font-semibold text-red-600">
          {errosUpload.map((mensagem) => <li key={mensagem}>{mensagem}</li>)}
        </ul>
      )}
      {erro && <p role="alert" className="mt-2 text-xs font-semibold text-red-600">{erro}</p>}
      {fotos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {fotos.map((foto, i) => (
            <div key={foto.idFoto} className="relative overflow-hidden rounded-lg border">
              <img src={urlFoto(foto.url)} alt={`Foto ${i + 1}`} className="aspect-square w-full object-cover" />
              {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Capa</span>}
              <button type="button" onClick={() => removerFoto(foto.idFoto)} aria-label={`Remover foto ${i + 1}`} className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-black/60 text-white hover:bg-red-600"><X className="size-3" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
