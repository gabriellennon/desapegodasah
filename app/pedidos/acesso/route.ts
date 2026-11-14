import { NextResponse } from "next/server"
import { getOrder } from "@/lib/checkout/server"
import { readOrderToken, rememberOrder } from "@/lib/orders/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")
  const destination = new URL("/pedidos", url)
  try {
    const id = token ? readOrderToken(token, "link") : null
    const order = id ? await getOrder(id) : null
    if (order && (order.status === "paid" || order.status === "refunded")) {
      const response = NextResponse.redirect(destination)
      rememberOrder(response, order.id)
      response.headers.set("Cache-Control", "no-store")
      response.headers.set("Referrer-Policy", "no-referrer")
      return response
    }
    destination.searchParams.set("acesso", "invalido")
  } catch {
    destination.searchParams.set("acesso", "indisponivel")
  }
  return NextResponse.redirect(destination, {
    headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  })
}
