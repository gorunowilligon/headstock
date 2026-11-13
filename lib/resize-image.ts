import { ErroAmigavel } from '@/lib/api'

// Reduz a imagem no navegador antes do envio (a Vercel limita cada requisição a 4,5 MB).
// O servidor ainda a redimensiona de novo (RNF08).
export function redimensionarImagem(file: File, maxLado = 1200, qualidade = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const escala = Math.min(1, maxLado / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * escala)
      canvas.height = Math.round(img.height * escala)
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new ErroAmigavel('não foi possível processar esta imagem. Tente outra foto.')),
        'image/jpeg',
        qualidade,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new ErroAmigavel('não foi possível abrir esta imagem. Tente outra foto.'))
    }
    img.src = url
  })
}
