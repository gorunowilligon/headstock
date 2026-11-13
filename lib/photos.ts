import { api, mensagemDeErro } from '@/lib/api'
import type { FotoAnuncio } from '@/lib/models'
import { redimensionarImagem } from '@/lib/resize-image'

export const MIN_FOTOS = 3
export const LIMITE_FOTO_MB = 5

const BYTES_POR_MB = 1024 * 1024

/**
 * Valida cada arquivo (imagem de até 5 MB), reduz no navegador e envia ao servidor, uma foto por vez
 * (a Vercel limita cada requisição a 4,5 MB). Devolve as fotos já salvas e as mensagens de erro.
 */
export async function processarFotos(files: File[]): Promise<{ fotos: FotoAnuncio[], erros: string[] }> {
  const erros: string[] = []
  const fotos: FotoAnuncio[] = []

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      erros.push(`"${file.name}" não é uma imagem.`)
      continue
    }
    if (file.size > LIMITE_FOTO_MB * BYTES_POR_MB) {
      erros.push(`"${file.name}" tem ${(file.size / BYTES_POR_MB).toFixed(1)} MB e excede o limite de ${LIMITE_FOTO_MB} MB.`)
      continue
    }

    try {
      const reduzida = await redimensionarImagem(file)
      const formData = new FormData()
      formData.append('fotos', reduzida, `${file.name.replace(/\.[^.]+$/, '')}.jpg`)
      const [foto] = await api<FotoAnuncio[]>('/fotos', { method: 'POST', formData })
      fotos.push(foto)
    } catch (erro) {
      erros.push(`"${file.name}": ${mensagemDeErro(erro)}`)
    }
  }

  return { fotos, erros }
}

export function mensagemFotosInsuficientes(quantidade: number) {
  const faltam = MIN_FOTOS - quantidade
  return `Adicione pelo menos ${MIN_FOTOS} fotos do item (faltam ${faltam}).`
}
