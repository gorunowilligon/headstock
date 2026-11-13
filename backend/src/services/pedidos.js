import { prisma } from '../db.js'
import { HORAS_LIBERACAO_PAGAMENTO } from '../regras.js'
import { HttpError, naoEncontrado } from '../http/erros.js'
import { pedidoInclude } from '../http/serializar.js'

/**
 * RN02: libera o pagamento (pedido "concluido") 48h após a entrega, se não houver disputa.
 * Executado de forma preguiçosa antes de cada leitura de pedidos, dispensando um job agendado.
 */
export async function liberarPagamentosVencidos() {
  const limite = new Date(Date.now() - HORAS_LIBERACAO_PAGAMENTO * 3_600_000)
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
  await liberarPagamentosVencidos()
  const pedido = await prisma.pedido.findUnique({ where: { idPedido }, include: pedidoInclude })
  if (!pedido) throw naoEncontrado('Pedido')

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
    throw new HttpError(409, `Ação indisponível para pedidos com status "${pedido.statusPedido}"`)
  }
}
