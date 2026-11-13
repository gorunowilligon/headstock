export interface Usuario {
  idUsuario: number
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
  idUsuario: number
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
  idInstrumento: number
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
  idInstrumentoCatalogo?: number
  instrumento?: Omit<Instrumento, 'idInstrumento'>
  condicao: string
  preco: number
  localizacao: string
  descricao?: string
  aceitaPropostas: boolean
  fotos: number[]
}

/** Corpo de PATCH /anuncios/:id (todos os campos são opcionais na API). */
export interface EdicaoAnuncio {
  condicao: string
  preco: number
  localizacao: string
  descricao: string
  aceitaPropostas: boolean
  instrumento: Omit<Instrumento, 'idInstrumento'>
  fotos: number[]
}

export interface NovaDenuncia {
  idAnuncio: number
  motivo: string
  descricaoTextual: string
}

export interface FotoAnuncio {
  idFoto: number
  url: string
  tamanhoMB: number
}

export type StatusAnuncio = 'ativo' | 'pausado' | 'vendido' | 'removido'

export interface Anuncio {
  idAnuncio: number
  titulo: string
  preco: number
  condicao: string
  status: StatusAnuncio
  dataCriacao: string
  idVendedor: number
  instrumento: Instrumento
  fotos: FotoAnuncio[]
  localizacao: string // não consta no diagrama
  descricao?: string // não consta no diagrama
  aceitaPropostas: boolean // não consta no diagrama (RF08)
  vendedor?: UsuarioPublico // preenchido pela API
}

export interface Denuncia {
  idDenuncia: number
  motivo: string
  descricaoTextual: string
  status: 'aberta' | 'em análise' | 'resolvida'
  idAutor: number
  idAnuncio: number // não consta no diagrama
}

export type StatusPedido = 'pago' | 'enviado' | 'entregue' | 'concluido' | 'em_disputa' | 'devolucao_autorizada' | 'reembolsado' | 'cancelado'

export interface Pedido {
  idPedido: number
  valorTotal: number
  valorProduto: number
  taxaPlataforma: number
  valorFrete: number
  valorRepasseVendedor: number
  metodoPagamento: 'cartao' | 'pix'
  cepDestino: string
  codigoRastreio: string | null
  statusPedido: StatusPedido
  dataCriacao: string
  prazoRastreio: string | null
  rastreioAtrasado: boolean
  dataEntrega: string | null
  prazoDisputaAte: string | null
  liberacaoPagamentoEm: string | null
  motivoDisputa: string | null
  resolucaoDisputa: string | null
  idComprador: number
  idAnuncio: number
  idOferta: number | null
  anuncio?: Anuncio
  comprador?: UsuarioPublico
  avaliacoes?: Avaliacao[]
}

export interface Frete {
  valor: number
  prazoDias: number
  servico: string
  simulado: boolean
}

export interface Recibo {
  numero: string
  emitidoEm: string
  anuncio: { idAnuncio: number, titulo: string }
  valorProduto: number
  percentualTaxa: number
  taxaPlataforma: number
  valorRepasseVendedor: number
}

export interface Mensagem {
  idMensagem: number
  conteudo: string
  dataEnvio: string
  idRemetente: number
  idDestinatario: number
  idAnuncio: number | null
}

/** Item de GET /mensagens/conversas. */
export interface Conversa {
  com: { idUsuario: number, nome: string }
  anuncio: { idAnuncio: number, titulo: string } | null
  ultimaMensagem?: Mensagem
}

export type StatusOferta = 'pendente' | 'aceita' | 'recusada' | 'substituida' | 'cancelada' | 'expirada' | 'utilizada'

/** Proposta de preço (RF08). Não consta no diagrama. */
export interface Oferta {
  idOferta: number
  valor: number
  status: StatusOferta
  dataCriacao: string
  expiraEm: string
  dataResposta: string | null
  idAnuncio: number
  idComprador: number
  idAutor: number
  idVendedor: number
  anuncio?: { idAnuncio: number, titulo: string, preco: number, status: StatusAnuncio }
}

export interface Avaliacao {
  idAvaliacao: number
  notaEstrelas: number
  textoJustificativo: string
  tipoAvaliacao: 'vendedor' | 'produto'
  idPedido: number
}
