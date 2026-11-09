import type { FotoAnuncio } from '@/lib/models'
import { redimensionarImagem } from '@/lib/resize-image'

export const MIN_FOTOS = 3
export const LIMITE_FOTO_MB = 5

const BYTES_POR_MB = 1024 * 1024

export async function processarFotos(files: File[]): Promise<{ fotos: FotoAnuncio[], erros: string[] }> {
  const erros: string[] = []
  const validos: File[] = []

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      erros.push(`"${file.name}" não é uma imagem.`)
    } else if (file.size > LIMITE_FOTO_MB * BYTES_POR_MB) {
      erros.push(`"${file.name}" tem ${(file.size / BYTES_POR_MB).toFixed(1)} MB e excede o limite de ${LIMITE_FOTO_MB} MB.`)
    } else {
      validos.push(file)
    }
  }

  const resultados = await Promise.allSettled(validos.map((file) => redimensionarImagem(file)))
  const fotos: FotoAnuncio[] = []
  resultados.forEach((resultado, i) => {
    if (resultado.status === 'fulfilled') {
      fotos.push({ idFoto: crypto.randomUUID(), url: resultado.value, tamanhoMB: Number((validos[i].size / BYTES_POR_MB).toFixed(2)) })
    } else {
      erros.push(`Não foi possível ler "${validos[i].name}".`)
    }
  })

  return { fotos, erros }
}

export function mensagemFotosInsuficientes(quantidade: number) {
  const faltam = MIN_FOTOS - quantidade
  return `Adicione pelo menos ${MIN_FOTOS} fotos do item (faltam ${faltam}).`
}
