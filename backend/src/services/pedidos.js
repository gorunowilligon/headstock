import { prisma } from '../db.js'
import { HORAS_LIBERACAO_PAGAMENTO } from '../regras.js'
import { HttpError, naoEncontrado } from '../http/erros.js'
import { pedidoInclude } from '../http/serializar.js'

/**
 * RN02: libera o pagamento (pedido "concluido") 48h após a entrega, se não houver disputa.
 * Só vai ao banco atualizar quando realmente existe algum pedido entregue com prazo vencido.
 */
export async function liberarPagamentosVencidos(pedidos) {
  const limite = new Date(Date.now() - HORAS_LIBERACAO_PAGAMENTO * 3_600_000)
  if (Array.isArray(pedidos)) {
    const vencidos = pedidos.filter((p) => p.statusPedido === 'entregue' && p.dataEntrega && p.dataEntrega <= limite)
    if (!vencidos.length) return
    const agora = new Date()
    await prisma.pedido.updateMany({
      where: { idPedido: { in: vencidos.map((p) => p.idPedido) }, statusPedido: 'entregue' },
      data: { statusPedido: 'concluido', dataConclusao: agora },
    })
    for (const p of vencidos) {
      p.statusPedido = 'concluido'
      p.dataConclusao = agora
    }
    return
  }
  await prisma.pedido.updateMany({
    where: { statusPedido: 'entregue', dataEntrega: { lte: limite } },
    data: { statusPedido: 'concluido', dataConclusao: new Date() },
  })
}

/**
 * Busca um pedido verificando o papel do usuário.
 * papel: "comprador" | "vendedor" | "participante" (comprador, vendedor ou admin).
 */
export async function buscarPedido(idPedido, usuario, papel = 'participante') {
  const pedido = await prisma.pedido.findUnique({ where: { idPedido }, include: pedidoInclude })
  if (!pedido) throw naoEncontrado('Pedido')
  await liberarPagamentosVencidos([pedido])

  const ehComprador = pedido.idComprador === usuario.idUsuario
  const ehVendedor = pedido.anuncio.idVendedor === usuario.idUsuario
  const ehAdmin = usuario.tipo === 'administrador'

  const permitido = papel === 'comprador' ? ehComprador
    : papel === 'vendedor' ? ehVendedor
      : ehComprador || ehVendedor || ehAdmin
  if (!permitido) throw new HttpError(403, `Apenas o ${papel === 'participante' ? 'comprador ou vendedor' : papel} pode realizar esta ação`)
  return pedido
}

export function exigirStatus(pedido, ...permitidos) {
  if (!permitidos.includes(pedido.statusPedido)) {
    throw new HttpError(409, 'Esta ação não está disponível na etapa atual do pedido. Atualize a página para ver a situação mais recente.')
  }
}
