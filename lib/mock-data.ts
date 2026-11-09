import type { Anuncio, FotoAnuncio, Instrumento, UsuarioComum } from '@/lib/models'

const usuario = (idUsuario: string, nome: string, reputacaoMedia: number, enderecoCompleto: string): UsuarioComum => ({
  idUsuario, nome, reputacaoMedia, enderecoCompleto,
  email: '', senhaHash: '', chavePix: '', dataCadastro: '2026-01-01T00:00:00.000Z', suspenso: false,
})

export const usuarios: UsuarioComum[] = [
  usuario('u1', 'Marcos Cavalcanti', 4.9, 'Av. Paulista, 1500, São Paulo, SP'),
  usuario('u2', 'Lucas Ferreira', 4.7, 'Curitiba, PR'),
  usuario('u3', 'Ana Beatriz Lima', 5, 'Belo Horizonte, MG'),
  usuario('u4', 'Renato Azevedo', 4.8, 'Porto Alegre, RS'),
]

export const usuarioLogado = usuarios[0]

export const buscarUsuario = (idUsuario: string) => usuarios.find((u) => u.idUsuario === idUsuario)

export const catalogoMestre: Instrumento[] = [
  { idInstrumento: 'i1', marca: 'Fender', modelo: 'Stratocaster Player Plus', categoria: 'Guitarras', tipoCaptacao: 'SSS', numeroCordas: 6, orientacao: 'Destro' },
  { idInstrumento: 'i2', marca: 'Gibson', modelo: 'Les Paul Studio 2019', categoria: 'Guitarras', tipoCaptacao: 'HH', numeroCordas: 6, orientacao: 'Destro' },
  { idInstrumento: 'i3', marca: 'Ibanez', modelo: 'RG550 Genesis Collection', categoria: 'Guitarras', tipoCaptacao: 'HSH', numeroCordas: 6, orientacao: 'Destro' },
  { idInstrumento: 'i4', marca: 'Boss', modelo: 'DS-1 Distortion', categoria: 'Pedais/Efeitos', tipoCaptacao: '', numeroCordas: 0, orientacao: '' },
  { idInstrumento: 'i5', marca: 'Martin', modelo: 'D-28 Authentic', categoria: 'Violões', tipoCaptacao: 'Acústico puro', numeroCordas: 6, orientacao: 'Destro' },
  { idInstrumento: 'i6', marca: 'Fender', modelo: 'Player Jazz Bass', categoria: 'Baixos', tipoCaptacao: 'JJ', numeroCordas: 4, orientacao: 'Destro' },
]

const foto = (idFoto: string, url: string): FotoAnuncio => ({ idFoto, url, tamanhoMB: 0 })
const img = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=85`

const anuncio = (idAnuncio: string, idInstrumento: string, idVendedor: string, preco: number, condicao: string, localizacao: string, fotos: FotoAnuncio[], descricao?: string): Anuncio => {
  const instrumento = catalogoMestre.find((i) => i.idInstrumento === idInstrumento)!
  return {
    idAnuncio, idVendedor, preco, condicao, localizacao, fotos, descricao, instrumento,
    titulo: `${instrumento.marca} ${instrumento.modelo}`,
    status: 'ativo',
    dataCriacao: '2026-10-01T00:00:00.000Z',
  }
}

export const anuncios: Anuncio[] = [
  anuncio('a1', 'i1', 'u1', 6890, 'Usado · Excelente', 'São Paulo, SP',
    [foto('f1', img('1564186763535-ebb21ef5277f')), foto('f2', img('1526924143875-1e1d8d4f9f8f', 1000)), foto('f3', img('1556449895-a33c9dba33dd', 1000))],
    'Guitarra impecável, regulada e pronta para tocar. Estou vendendo porque migrei para uma configuração diferente. Acompanha bag acolchoada e ponteira original. Sem marcas relevantes, trastes com mais de 80% de vida útil.'),
  anuncio('a2', 'i2', 'u2', 8500, 'Usado · Muito bom', 'Curitiba, PR', [foto('f4', img('1550291652-6ea9114a47b1'))]),
  anuncio('a3', 'i3', 'u3', 5290, 'Seminovo', 'Belo Horizonte, MG', [foto('f5', img('1525201548942-d8732f6617a0'))]),
  anuncio('a4', 'i4', 'u1', 590, 'Usado · Excelente', 'Rio de Janeiro, RJ', [foto('f6', img('1558098329-a11cff621064'))]),
  anuncio('a5', 'i5', 'u4', 14900, 'Usado · Excelente', 'Porto Alegre, RS', [foto('f7', img('1516924962500-2b4b3b99ea02'))]),
  anuncio('a6', 'i6', 'u1', 7200, 'Seminovo', 'Campinas, SP', [foto('f8', img('1498038432885-c6f3f1b912ee'))]),
]

export const capaDoAnuncio = (a: Anuncio) => a.fotos[0]?.url ?? '/placeholder.jpg'
