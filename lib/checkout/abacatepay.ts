import "server-only"

import { database, env, type OrderRow } from "./server"
import type { PaymentMethod, PaymentStatus } from "./types"

export type Charge = {
  id: string
  status: string
  amount?: number
  devMode?: boolean
  brCode?: string
  brCodeBase64?: string
  expiresAt?: string
  externalId?: string | null
  metadata?: { pedidoId?: string }
}

export class AbacatePayError extends Error {
  constructor(
    readonly status: number,
    readonly rejected: boolean
  ) {
    super("Falha na AbacatePay")
  }
}

export async function abacate<T>(path: string, data?: object): Promise<T> {
  const response = await fetch(
    "https://api.abacatepay.com/v2/transparents/" + path,
    {
      method: data ? "POST" : "GET",
      headers: {
        Authorization: "Bearer " + env("ABACATE_API_KEY"),
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(14000),
    }
  )
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.success || !result.data) {
    // A timeout, a malformed response, or a server error may have created a charge.
    throw new AbacatePayError(
      response.status,
      [400, 401, 403, 422].includes(response.status) && !result?.data
    )
  }
  return result.data as T
}

export function paymentStatus(
  method: PaymentMethod,
  status: string
): PaymentStatus {
  if (status === "PAID" || (method === "CARD" && status === "APPROVED"))
    return "paid"
  if (status === "EXPIRED") return "expired"
  if (["FAILED", "DECLINED", "REFUSED", "CANCELLED"].includes(status))
    return "failed"
  if (status === "REFUNDED") return "refunded"
  return "pending"
}

export function updatePayment(
  id: string,
  status: PaymentStatus,
  charge?: Charge
) {
  return database("rpc/update_checkout_payment", {
    method: "POST",
    body: JSON.stringify({
      p_id: id,
      p_status: status,
      p_provider_id: charge?.id ?? null,
      p_pix_code: charge?.brCode ?? null,
      p_pix_image: charge?.brCodeBase64?.startsWith("data:image/png;base64,")
        ? charge.brCodeBase64
        : null,
      p_expires_at: charge?.expiresAt ?? null,
    }),
  })
}

export function matchesCharge(order: OrderRow, charge: Charge) {
  const prefix = order.method === "PIX" ? "pix_char_" : "card_"
  return (
    typeof charge.id === "string" &&
    charge.id.startsWith(prefix) &&
    (!order.provider_id || order.provider_id === charge.id) &&
    charge.amount === order.total_cents
  )
}

export async function refreshPayment(order: OrderRow) {
  if (order.status !== "pending" || !order.provider_id) return
  if (order.checked_at && Date.now() - Date.parse(order.checked_at) < 7500)
    return
  const guard = order.checked_at ? "eq." + order.checked_at : "is.null"
  const [claimed] = await database<{ id: string }[]>(
    "checkout_orders?" +
      new URLSearchParams({
        id: "eq." + order.id,
        checked_at: guard,
        status: "eq.pending",
        select: "id",
      }),
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ checked_at: new Date().toISOString() }),
    }
  )
  if (!claimed) return

  const query = new URLSearchParams({ id: order.provider_id })
  if (order.method === "PIX") {
    const status = await abacate<{ id: string; status: string }>(
      "check?" + query
    )
    if (status.id !== order.provider_id || typeof status.status !== "string")
      return
    await updatePayment(order.id, paymentStatus(order.method, status.status))
  } else {
    const charge = await abacate<Charge>("get?" + query)
    if (matchesCharge(order, charge)) {
      await updatePayment(
        order.id,
        paymentStatus(order.method, charge.status),
        charge
      )
    }
  }
}
