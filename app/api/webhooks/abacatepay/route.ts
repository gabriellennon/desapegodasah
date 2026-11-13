import { createHmac } from "node:crypto"
import {
  matchesCharge,
  paymentStatus,
  updatePayment,
  type Charge,
} from "@/lib/checkout/abacatepay"
import {
  env,
  errorResponse,
  getOrder,
  getOrderByCharge,
  safeEqual,
  uuid,
} from "@/lib/checkout/server"

// Public HMAC verification key documented by AbacatePay. The private webhook
// secret is checked separately to authenticate the sender.
const signatureKey =
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9"

export async function POST(request: Request) {
  try {
    const secret =
      request.headers.get("x-webhook-secret") ??
      new URL(request.url).searchParams.get("webhookSecret") ??
      ""
    if (!safeEqual(secret, env("ABACATE_WEBHOOK_SECRET")))
      return new Response(null, { status: 401 })
    const body = await request.text()
    const expected = createHmac("sha256", signatureKey)
      .update(body)
      .digest("base64")
    if (
      !safeEqual(request.headers.get("x-webhook-signature") ?? "", expected)
    ) {
      return new Response(null, { status: 401 })
    }
    const event = JSON.parse(body) as {
      event: string
      apiVersion: number
      data?: { transparent?: Charge }
    }
    if (
      event.apiVersion !== 2 ||
      !["transparent.completed", "transparent.refunded"].includes(event.event)
    ) {
      return new Response(null, { status: 204 })
    }
    const charge = event.data?.transparent
    if (
      !charge ||
      typeof charge.id !== "string" ||
      !/^(pix_char_|card_)[A-Za-z0-9_-]+$/.test(charge.id)
    ) {
      return new Response(null, { status: 204 })
    }
    const id = charge?.metadata?.pedidoId ?? charge?.externalId
    const order =
      id && uuid.test(id)
        ? await getOrder(id)
        : await getOrderByCharge(charge.id)
    if (!order) return new Response(null, { status: 204 })
    if (!matchesCharge(order, charge))
      return new Response(null, { status: 409 })
    const status = paymentStatus(order.method, charge.status)
    if (event.event === "transparent.completed" && status === "paid") {
      await updatePayment(order.id, status, charge)
    } else if (
      event.event === "transparent.refunded" &&
      status === "refunded"
    ) {
      await updatePayment(order.id, status, charge)
    }
    return new Response(null, { status: 204 })
  } catch (error) {
    return errorResponse(error)
  }
}
