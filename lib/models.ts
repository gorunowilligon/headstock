import { api } from '@/lib/api'
import { paraQuery, type Filtros } from '@/lib/filtros'

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
  aceitaPropostas: boolean // não consta no diagrama (RF07)
  vendedor?: UsuarioPublico // preenchido pela API
}

/**
 * Classe Anuncio do diagrama de classes. Os campos vêm da interface Anuncio acima
 * (o TypeScript junta interface e classe com o mesmo nome).
 */
const cacheBusca = new Map<string, Anuncio[]>()

export class Anuncio {
  static chaveDeBusca(texto: string, filtros: Filtros): string {
    return JSON.stringify({ q: texto.trim(), ...paraQuery(filtros) })
  }

  static lerCache(texto: string, filtros: Filtros): Anuncio[] | undefined {
    return cacheBusca.get(Anuncio.chaveDeBusca(texto, filtros))
  }

  static invalidarCache() {
    cacheBusca.clear()
  }

  /**
   * anuncios = buscar(texto, filtros) : Anuncio[0..*] (RF05).
   * Devolve null quando os filtros são inválidos; senão, só anúncios ativos que atendem
   * aos filtros (GET /anuncios só devolve anúncios com status "ativo").
   */
  static async buscar(texto: string, filtros: Filtros): Promise<Anuncio[] | null> {
    const validos = filtros.validar()
    if (!validos) return null
    const chave = Anuncio.chaveDeBusca(texto, filtros)
    const resposta = await api<{ itens: Anuncio[] }>('/anuncios', { query: { q: texto, porPagina: 100, ...paraQuery(filtros) } })
    cacheBusca.set(chave, resposta.itens)
    return resposta.itens
  }
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

/** Proposta de preço (RF07). Não consta no diagrama. */
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
