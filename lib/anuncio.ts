import { urlFoto } from '@/lib/api'
import type { Anuncio } from '@/lib/models'

export const capaDoAnuncio = (a: Anuncio) => a.fotos[0]?.url ? urlFoto(a.fotos[0].url) : '/placeholder.jpg'
