export interface Usuario {
  idUsuario: string
  nome: string
  email: string
  senhaHash: string
  dataCadastro: string
  reputacaoMedia: number
  suspenso: boolean
}

export interface UsuarioComum extends Usuario {
  chavePix: string
  enderecoCompleto: string
}

export interface Administrador extends Usuario {
  nivelAcesso: number
}

export interface Instrumento {
  idInstrumento: string
  marca: string
  modelo: string
  categoria: string
  tipoCaptacao: string
  numeroCordas: number
  orientacao: string
}

export interface FotoAnuncio {
  idFoto: string
  url: string
  tamanhoMB: number
}

export type StatusAnuncio = 'ativo' | 'pausado'

export interface Anuncio {
  idAnuncio: string
  titulo: string
  preco: number
  condicao: string
  status: StatusAnuncio
  dataCriacao: string
  idVendedor: string
  instrumento: Instrumento
  fotos: FotoAnuncio[]
  localizacao: string // não consta no diagrama
  descricao?: string // não consta no diagrama
}

export interface Denuncia {
  idDenuncia: string
  motivo: string
  descricaoTextual: string
  status: 'aberta' | 'em análise' | 'resolvida'
  idAutor: string
  idAnuncio: string // não consta no diagrama
  dataCriacao?: string // não consta no diagrama; preenchido pelo servidor
}

export interface Pedido {
  idPedido: string
  valorTotal: number
  taxaPlataforma: number
  valorFrete: number
  codigoRastreio: string
  statusPedido: string
  dataCriacao: string
  idComprador: string
  idAnuncio: string
}

export interface Mensagem {
  idMensagem: string
  conteudo: string
  dataEnvio: string
  idRemetente: string
}

export interface Avaliacao {
  idAvaliacao: string
  notaEstrelas: number
  textoJustificativo: string
  tipoAvaliacao: 'vendedor' | 'produto'
  idPedido: string
}
