import "server-only"

import { createHmac } from "node:crypto"
import { cookies } from "next/headers"
import { after, NextResponse } from "next/server"
import { Resend } from "resend"
import {
  database,
  env,
  paymentView,
  safeEqual,
  uuid,
  type OrderRow,
} from "@/lib/checkout/server"

const cookieName = "desapego-order"
const sessionSeconds = 60 * 60 * 24 * 30
const linkSeconds = 60 * 60 * 24 * 60
type TokenPurpose = "link" | "cookie" | "lookup"
export const orderNumberPattern = /^DS-[A-HJ-KM-NP-Z2-9]{4}$/

function sign(value: string, purpose: TokenPurpose) {
  return createHmac("sha256", env("CHECKOUT_SIGNING_SECRET"))
    .update(`orders:${purpose}:${value}`)
    .digest("base64url")
}

function makeToken(id: string, expires: number, purpose: TokenPurpose) {
  const payload = `${id}.${expires}`
  return `${payload}.${sign(payload, purpose)}`
}

export function readOrderToken(token: string, purpose: TokenPurpose) {
  const [id, expires, signature, extra] = token.split(".")
  if (
    !id ||
    !uuid.test(id) ||
    !expires ||
    !/^\d{10}$/.test(expires) ||
    Number(expires) <= Math.floor(Date.now() / 1000) ||
    !signature ||
    extra !== undefined ||
    !safeEqual(signature, sign(`${id}.${expires}`, purpose))
  )
    return null
  return id
}

function orderCookie(id: string, purpose: "cookie" | "lookup") {
  return {
    name: cookieName,
    value: makeToken(
      id,
      Math.floor(Date.now() / 1000) + sessionSeconds,
      purpose
    ),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/pedidos",
    maxAge: sessionSeconds,
  }
}

export function rememberOrder(response: NextResponse, id: string) {
  response.cookies.set(orderCookie(id, "cookie"))
}

export async function lookUpOrder(
  number: string,
  email: string,
  clientIp: string
) {
  const clientHash = createHmac("sha256", env("CHECKOUT_SIGNING_SECRET"))
    .update("order-lookup:" + clientIp)
    .digest("hex")
  const id = await database<string | null>("rpc/lookup_checkout_order", {
    method: "POST",
    body: JSON.stringify({
      p_number: number,
      p_email: email,
      p_client_hash: clientHash,
    }),
  })
  if (!id || !uuid.test(id)) return false

  const store = await cookies()
  // Preserve full access if this browser already unlocked this order.
  const current = store.get(cookieName)?.value
  if (!current || readOrderToken(current, "cookie") !== id)
    store.set(orderCookie(id, "lookup"))
  return true
}

export async function cleanExpiredLookups() {
  await database(
    "order_lookup_limits?" +
      new URLSearchParams({
        expires_at: "lt." + new Date().toISOString(),
      }),
    { method: "DELETE" }
  )
}

export function checkoutResponse(order: OrderRow) {
  const response = NextResponse.json(paymentView(order), {
    headers: { "Cache-Control": "no-store" },
  })
  if (order.status === "paid" || order.status === "refunded")
    rememberOrder(response, order.id)
  if (order.status === "paid") scheduleOrderConfirmation(order.id)
  return response
}

type OrderTracking = {
  order_number: string
  status: "paid" | "refunded"
  tracking_carrier: string | null
  tracking_code: string | null
}

type OrderDetails = {
  total_cents: number
  checkout_order_items: {
    product_id: string
    name: string
    size: string
    price_cents: number
  }[]
}

export async function getRememberedOrder() {
  const token = (await cookies()).get(cookieName)?.value
  if (!token) return null
  const fullAccessId = readOrderToken(token, "cookie")
  const id = fullAccessId ?? readOrderToken(token, "lookup")
  if (!id) return null
  const select = "order_number,status,tracking_carrier,tracking_code"
  const [order] = await database<(OrderTracking & Partial<OrderDetails>)[]>(
    "checkout_orders?" +
      new URLSearchParams({
        id: "eq." + id,
        status: "in.(paid,refunded)",
        select: fullAccessId
          ? select +
            ",total_cents,checkout_order_items(product_id,name,size,price_cents)"
          : select,
      })
  )
  return order ?? null
}

export function emailConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
    process.env.ORDERS_EMAIL_FROM?.trim() &&
    process.env.ORDERS_PUBLIC_URL?.trim() &&
    process.env.ORDERS_CONFIRMATION_TEMPLATE_ID?.trim()
  )
}

async function sendOrderConfirmation(
  order: { id: string; number: string; email: string },
  expires: number
) {
  const url = new URL("/pedidos/acesso", env("ORDERS_PUBLIC_URL"))
  url.searchParams.set("token", makeToken(order.id, expires, "link"))
  const resend = new Resend(env("RESEND_API_KEY"))
  const { data, error } = await resend.emails.send(
    {
      from: env("ORDERS_EMAIL_FROM"),
      to: [order.email],
      subject: `Compra confirmada · ${order.number}`,
      template: {
        id: env("ORDERS_CONFIRMATION_TEMPLATE_ID"),
        variables: { ORDER_NUMBER: order.number, ORDER_URL: url.href },
      },
    },
    {
      idempotencyKey: `order-confirmation/${order.id}`,
      signal: AbortSignal.timeout(7000),
    }
  )
  if (error || !data?.id) {
    throw new Error(
      `Falha no envio do e-mail de pedido (${error?.name ?? "missing_id"}).`
    )
  }
  console.info("E-mail de pedido aceito pelo Resend", data.id)
}

export async function sendOrderConfirmations(id?: string) {
  if (!emailConfigured()) return
  const orders = await database<
    {
      id: string
      order_number: string
      contact: { email: string }
      paid_at: string
    }[]
  >(
    "checkout_orders?" +
      new URLSearchParams({
        ...(id ? { id: "eq." + id } : {}),
        status: "eq.paid",
        confirmation_sent_at: "is.null",
        paid_at:
          "gte." + new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        select: "id,order_number,contact,paid_at",
        order: "paid_at.asc",
        limit: "10",
      })
  )
  const results = await Promise.allSettled(
    orders.map(async (order) => {
      await sendOrderConfirmation(
        {
          id: order.id,
          number: order.order_number,
          email: order.contact.email,
        },
        Math.floor(Date.parse(order.paid_at) / 1000) + linkSeconds
      )
      await database("checkout_orders?id=eq." + order.id, {
        method: "PATCH",
        body: JSON.stringify({
          confirmation_sent_at: new Date().toISOString(),
        }),
      })
    })
  )
  if (results.some((result) => result.status === "rejected"))
    throw new Error("Falha ao enviar confirmações de pedido.")
}

export function scheduleOrderConfirmation(id: string) {
  if (!emailConfigured()) return
  after(() =>
    sendOrderConfirmations(id).catch(() => {
      console.error("Não foi possível enviar a confirmação do pedido.")
    })
  )
}
