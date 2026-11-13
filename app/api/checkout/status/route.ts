import { refreshPayment } from "@/lib/checkout/abacatepay"
import {
  CheckoutError,
  credentials,
  errorResponse,
  getOrder,
  jsonBody,
  paymentView,
} from "@/lib/checkout/server"

export async function POST(request: Request) {
  try {
    const { id, access } = credentials(await jsonBody(request))
    const order = await getOrder(id, access)
    if (!order) throw new CheckoutError("Pedido não encontrado.", 404)
    if (order.status === "pending") {
      await refreshPayment(order).catch(() => null)
      return Response.json(paymentView((await getOrder(id, access)) ?? order), {
        headers: { "Cache-Control": "no-store" },
      })
    }
    return Response.json(paymentView(order), {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
