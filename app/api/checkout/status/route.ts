import { refreshPayment } from "@/lib/checkout/abacatepay"
import {
  CheckoutError,
  credentials,
  errorResponse,
  getOrder,
  jsonBody,
} from "@/lib/checkout/server"

import { checkoutResponse } from "@/lib/orders/server"

export async function POST(request: Request) {
  try {
    const { id, access } = credentials(await jsonBody(request))
    const order = await getOrder(id, access)
    if (!order) throw new CheckoutError("Pedido não encontrado.", 404)
    if (order.status === "pending") {
      await refreshPayment(order).catch(() => null)
      return checkoutResponse((await getOrder(id, access)) ?? order)
    }
    return checkoutResponse(order)
  } catch (error) {
    return errorResponse(error)
  }
}
