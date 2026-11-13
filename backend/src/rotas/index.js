import admin from './admin.js'
import anuncios from './anuncios.js'
import auth from './auth.js'
import denuncias from './denuncias.js'
import favoritos from './favoritos.js'
import fotos from './fotos.js'
import instrumentos from './instrumentos.js'
import mensagens from './mensagens.js'
import ofertas from './ofertas.js'
import pedidos, { rotasFrete } from './pedidos.js'
import usuarios from './usuarios.js'

export const routers = [auth, usuarios, instrumentos, anuncios, fotos, favoritos, ofertas, rotasFrete, pedidos, mensagens, denuncias, admin]
