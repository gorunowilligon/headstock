import { prisma } from '../db.js'
import { REPUTACAO_MINIMA, arredondar } from '../regras.js'

/** Recalcula a média do vendedor e aplica a suspensão automática da RN07. */
export async function recalcularReputacao(idVendedor, db = prisma) {
  const { _avg, _count } = await db.avaliacao.aggregate({
    where: { tipoAvaliacao: 'vendedor', pedido: { anuncio: { idVendedor } } },
    _avg: { notaEstrelas: true },
    _count: { _all: true },
  })
  const media = _avg.notaEstrelas ?? 0
  const quantidade = _count._all

  await db.usuario.update({
    where: { idUsuario: idVendedor },
    data: {
      reputacaoMedia: arredondar(media),
      suspenso: quantidade > 0 && media < REPUTACAO_MINIMA,
    },
  })
}
