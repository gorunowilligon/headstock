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

/** Dados públicos de um usuário, como a API devolve dentro de um anúncio. */
export interface UsuarioPublico {
  idUsuario: string
  nome: string
  reputacaoMedia: number
  dataCadastro: string
  suspenso: boolean
}

/** Usuário logado, como devolvido por /auth e /usuarios/me (nunca inclui a senha). */
export interface UsuarioSessao extends UsuarioPublico {
  tipo: 'comum' | 'administrador'
  email: string
  chavePix: string
  enderecoCompleto: string
  banido: boolean
}

export interface Instrumento {
  idInstrumento: string
  marca: string
  modelo: string
  categoria: string
  tipoCaptacao: string
  numeroCordas: number
  orientacao: string
  especificacoes?: Record<string, string | number | boolean>
}

/** Corpo de POST /anuncios. As fotos são IDs devolvidos por POST /fotos. */
export interface NovoAnuncio {
  idInstrumentoCatalogo?: string
  instrumento?: Omit<Instrumento, 'idInstrumento'>
  condicao: string
  preco: number
  localizacao: string
  descricao?: string
  fotos: string[]
}

/** Corpo de PATCH /anuncios/:id (todos os campos são opcionais na API). */
export interface EdicaoAnuncio {
  condicao: string
  preco: number
  localizacao: string
  descricao: string
  instrumento: Pick<Instrumento, 'marca' | 'modelo' | 'tipoCaptacao' | 'numeroCordas' | 'orientacao'>
  fotos: string[]
}

export interface NovaDenuncia {
  idAnuncio: string
  motivo: string
  descricaoTextual: string
}

export interface FotoAnuncio {
  idFoto: string
  url: string
  tamanhoMB: number
}

export type StatusAnuncio = 'ativo' | 'pausado' | 'vendido' | 'removido'

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
  vendedor?: UsuarioPublico // preenchido pela API
}

export interface Denuncia {
  idDenuncia: string
  motivo: string
  descricaoTextual: string
  status: 'aberta' | 'em análise' | 'resolvida'
  idAutor: string
  idAnuncio: string // não consta no diagrama
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
