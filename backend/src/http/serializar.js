// Converte registros do banco no formato JSON da API.
// Os nomes seguem lib/models.ts do frontend para facilitar a integração.

import { config } from '../config.js'
import { HORAS_LIBERACAO_PAGAMENTO, HORAS_PARA_DISPUTA, arredondar, somarHoras } from '../regras.js'

const urlAbsoluta = (url) => (url.startsWith('/') ? `${config.urlPublica}${url}` : url)

// Nunca selecionar a coluna "dados" (bytes da imagem) em listagens.
export const fotoSelect = { idFoto: true, url: true, tamanhoMB: true }

export const usuarioPublicoSelect = { idUsuario: true, nome: true, reputacaoMedia: true, dataCadastro: true, suspenso: true }

export const anuncioInclude = {
  instrumento: true,
  fotos: { select: fotoSelect, orderBy: { ordem: 'asc' } },
  vendedor: { select: usuarioPublicoSelect },
}

export const pedidoInclude = {
  anuncio: { include: anuncioInclude },
  comprador: { select: usuarioPublicoSelect },
  avaliacoes: true,
}

export const serializarUsuarioPublico = (u) => ({
  idUsuario: u.idUsuario,
  nome: u.nome,
  reputacaoMedia: u.reputacaoMedia,
  dataCadastro: u.dataCadastro,
  suspenso: u.suspenso,
})

export const serializarUsuarioPrivado = (u) => ({
  ...serializarUsuarioPublico(u),
  tipo: u.tipo,
  email: u.email,
  chavePix: u.chavePix ?? '',
  enderecoCompleto: u.enderecoCompleto ?? '',
  nivelAcesso: u.nivelAcesso ?? undefined,
  banido: u.banido,
})

export const serializarFoto = (f) => ({ idFoto: f.idFoto, url: urlAbsoluta(f.url), tamanhoMB: f.tamanhoMB })

export const serializarInstrumento = (i) => ({
  idInstrumento: i.idInstrumento,
  marca: i.marca,
  modelo: i.modelo,
  categoria: i.categoria,
  tipoCaptacao: i.tipoCaptacao,
  numeroCordas: i.numeroCordas,
  orientacao: i.orientacao,
  especificacoes: i.especificacoes ?? {},
})

export const serializarAnuncio = (a) => ({
  idAnuncio: a.idAnuncio,
  titulo: a.titulo,
  preco: Number(a.preco),
  condicao: a.condicao,
  status: a.status,
  dataCriacao: a.dataCriacao,
  idVendedor: a.idVendedor,
  localizacao: a.localizacao,
  descricao: a.descricao || undefined,
  instrumento: serializarInstrumento(a.instrumento),
  fotos: a.fotos.map(serializarFoto),
  vendedor: a.vendedor ? serializarUsuarioPublico(a.vendedor) : undefined,
})

export const serializarAvaliacao = (a) => ({
  idAvaliacao: a.idAvaliacao,
  notaEstrelas: a.notaEstrelas,
  textoJustificativo: a.textoJustificativo,
  tipoAvaliacao: a.tipoAvaliacao,
  dataCriacao: a.dataCriacao,
  idPedido: a.idPedido,
})

export function serializarPedido(p) {
  const valorTotal = Number(p.valorTotal)
  const valorFrete = Number(p.valorFrete)
  const taxaPlataforma = Number(p.taxaPlataforma)
  const valorProduto = arredondar(valorTotal - valorFrete)

  return {
    idPedido: p.idPedido,
    statusPedido: p.statusPedido,
    valorTotal,
    valorProduto,
    valorFrete,
    taxaPlataforma,
    valorRepasseVendedor: arredondar(valorProduto - taxaPlataforma),
    metodoPagamento: p.metodoPagamento,
    cepDestino: p.cepDestino,
    codigoRastreio: p.codigoRastreio,
    dataCriacao: p.dataCriacao,
    dataPagamento: p.dataPagamento,
    prazoRastreio: p.prazoRastreio,
    rastreioAtrasado: p.statusPedido === 'pago' && Boolean(p.prazoRastreio) && p.prazoRastreio < new Date(),
    dataEnvio: p.dataEnvio,
    dataEntrega: p.dataEntrega,
    prazoDisputaAte: p.dataEntrega ? somarHoras(p.dataEntrega, HORAS_PARA_DISPUTA) : null,
    liberacaoPagamentoEm: p.dataEntrega ? somarHoras(p.dataEntrega, HORAS_LIBERACAO_PAGAMENTO) : null,
    dataConclusao: p.dataConclusao,
    motivoDisputa: p.motivoDisputa,
    resolucaoDisputa: p.resolucaoDisputa,
    idComprador: p.idComprador,
    idAnuncio: p.idAnuncio,
    anuncio: p.anuncio ? serializarAnuncio(p.anuncio) : undefined,
    comprador: p.comprador ? serializarUsuarioPublico(p.comprador) : undefined,
    avaliacoes: p.avaliacoes ? p.avaliacoes.map(serializarAvaliacao) : undefined,
  }
}

export const serializarMensagem = (m) => ({
  idMensagem: m.idMensagem,
  conteudo: m.conteudo,
  dataEnvio: m.dataEnvio,
  idRemetente: m.idRemetente,
  idDestinatario: m.idDestinatario,
  idAnuncio: m.idAnuncio,
})

export const serializarDenuncia = (d) => ({
  idDenuncia: d.idDenuncia,
  motivo: d.motivo,
  descricaoTextual: d.descricaoTextual,
  status: d.status,
  dataCriacao: d.dataCriacao,
  resolucao: d.resolucao,
  idAutor: d.idAutor,
  idAdministrador: d.idAdministrador,
  idAnuncio: d.idAnuncio,
  idUsuarioDenunciado: d.idUsuarioDenunciado,
  idMensagem: d.idMensagem,
})
