import "server-only"

import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import type {
  Address,
  CheckoutItem,
  Contact,
  PaymentMethod,
  PaymentStatus,
  PaymentView,
  Quote,
  ShippingOption,
} from "./types"
import { digits, validTaxId } from "./types"

export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message)
  }
}

export function env(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new CheckoutError("Checkout indisponível no momento.", 503)
  return value
}

export function safeEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

export const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const accessPattern = /^[a-f0-9]{64}$/
export const hashAccess = (value: string) =>
  createHash("sha256").update(value).digest("hex")

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CheckoutError("Dados inválidos.")
  }
  return value as Record<string, unknown>
}

export async function jsonBody(request: Request) {
  if (
    request.headers.get("origin") !== new URL(request.url).origin ||
    !request.headers.get("content-type")?.startsWith("application/json")
  ) {
    throw new CheckoutError("Requisição inválida.", 403)
  }
  const body = await request.text()
  if (body.length > 24000)
    throw new CheckoutError("Requisição muito grande.", 413)
  try {
    return record(JSON.parse(body))
  } catch {
    throw new CheckoutError("Dados inválidos.")
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof CheckoutError) {
    return Response.json({ error: error.message }, { status: error.status })
  }
  return Response.json(
    { error: "Não foi possível concluir a operação. Tente novamente." },
    { status: 502 }
  )
}

function field(
  data: Record<string, unknown>,
  name: string,
  max: number,
  optional = false
) {
  const value = data[name]
  if (
    typeof value !== "string" ||
    value.length > max ||
    (!optional && !value.trim())
  ) {
    throw new CheckoutError("Confira os dados preenchidos.")
  }
  return value.trim()
}

export function parseContact(value: unknown): Contact {
  const data = record(value)
  const name = field(data, "name", 120)
  const email = field(data, "email", 254)
  const taxId = digits(field(data, "taxId", 22))
  const cellphone = digits(field(data, "cellphone", 20))
  if (
    !validTaxId(taxId) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !/^\d{10,11}$/.test(cellphone)
  ) {
    throw new CheckoutError("Confira CPF/CNPJ, e-mail e telefone.")
  }
  return { name, email, taxId, cellphone }
}

export function parseAddress(value: unknown): Address {
  const data = record(value)
  const zipCode = digits(field(data, "zipCode", 10))
  const state = field(data, "state", 2).toUpperCase()
  if (
    zipCode.length !== 8 ||
    !/^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/.test(
      state
    )
  ) {
    throw new CheckoutError("Confira o CEP e a UF.")
  }
  return {
    zipCode,
    state,
    street: field(data, "street", 160),
    number: field(data, "number", 20),
    neighborhood: field(data, "neighborhood", 120),
    city: field(data, "city", 120),
    complement: field(data, "complement", 120, true),
  }
}

export async function database<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const key = env("SUPABASE_SERVICE_ROLE_KEY")
  const response = await fetch(
    new URL("/rest/v1/" + path, env("SUPABASE_URL")),
    {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
      headers: {
        apikey: key,
        ...(key.startsWith("eyJ") ? { Authorization: "Bearer " + key } : {}),
        "Content-Type": "application/json",
        ...init.headers,
      },
    }
  )
  if (!response.ok) {
    const result = await response.json().catch(() => null)
    if (result?.message === "ITEM_CHANGED") {
      throw new CheckoutError(
        "Uma peça mudou de preço ou ficou indisponível. Atualize o frete.",
        409
      )
    }
    throw new CheckoutError(
      "Não foi possível acessar os pedidos. Tente novamente.",
      503
    )
  }
  const result = await response.text()
  return (result ? JSON.parse(result) : undefined) as T
}

export type OrderRow = {
  id: string
  order_number: string
  access_hash: string
  method: PaymentMethod
  status: PaymentStatus
  total_cents: number
  provider_id: string | null
  pix_code: string | null
  pix_image: string | null
  expires_at: string | null
  checked_at: string | null
}

export function paymentView(order: OrderRow): PaymentView {
  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    method: order.method,
    total: order.total_cents,
    pixCode: order.status === "pending" ? order.pix_code : null,
    pixImage: order.status === "pending" ? order.pix_image : null,
    expiresAt: order.expires_at,
  }
}

const orderFields =
  "id,order_number,access_hash,method,status,total_cents,provider_id,pix_code,pix_image,expires_at,checked_at"

export async function getOrder(id: string, access?: string) {
  const [order] = await database<OrderRow[]>(
    "checkout_orders?" +
      new URLSearchParams({
        id: "eq." + id,
        select: orderFields,
      })
  )
  if (
    !order ||
    (access !== undefined && !safeEqual(order.access_hash, hashAccess(access)))
  )
    return null
  return order
}

export async function getOrderByCharge(providerId: string) {
  const [order] = await database<OrderRow[]>(
    "checkout_orders?" +
      new URLSearchParams({
        provider_id: "eq." + providerId,
        select: orderFields,
      })
  )
  return order
}

export function credentials(data: Record<string, unknown>) {
  const { id, access } = data
  if (
    typeof id !== "string" ||
    !uuid.test(id) ||
    typeof access !== "string" ||
    !accessPattern.test(access)
  ) {
    throw new CheckoutError("Referência de pedido inválida.")
  }
  return { id, access }
}

type ShippingProduct = {
  id: string
  price_cents: number
  shipping_weight_kg: number | null
  shipping_width_cm: number | null
  shipping_height_cm: number | null
  shipping_length_cm: number | null
}

const supportedCarriers = new Set(["loggi", "jadlog", "correios"])
const excludedServices = new Set([
  "loggi express",
  "jadlog package centralizado",
])

function isSupportedShipping(carrier: string, name: string) {
  const company = carrier.trim().toLowerCase()
  const service = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
  const fullName = service.startsWith(company + " ")
    ? service
    : company + " " + service
  return supportedCarriers.has(company) && !excludedServices.has(fullName)
}

type MelhorEnvioRate = {
  id: number
  name: string
  company: { name: string; picture?: string }
  error?: string
  custom_price?: string | number
  price?: string | number
  custom_delivery_time?: number
  delivery_time?: number
}

function carrierLogo(picture?: string) {
  if (!picture || !URL.canParse(picture)) return undefined
  const url = new URL(picture)
  if (
    url.protocol === "https:" &&
    [
      "melhorenvio.com.br",
      "www.melhorenvio.com.br",
      "sandbox.melhorenvio.com.br",
    ].includes(url.hostname) &&
    !url.port &&
    !url.username &&
    !url.password &&
    url.pathname.startsWith("/images/shipping-companies/") &&
    !url.search &&
    !url.hash
  )
    return url.href
}

export async function getQuote(ids: string[], destination: string) {
  if (
    !Array.isArray(ids) ||
    ids.length < 1 ||
    ids.length > 20 ||
    ids.some((id) => typeof id !== "string" || !uuid.test(id)) ||
    new Set(ids).size !== ids.length
  ) {
    throw new CheckoutError("Selecione de 1 a 20 peças válidas.")
  }
  const zipCode = typeof destination === "string" ? digits(destination) : ""
  if (zipCode.length !== 8) throw new CheckoutError("Informe um CEP válido.")
  const origin = digits(env("MELHOR_ENVIO_ORIGIN_CEP"))
  if (origin.length !== 8)
    throw new CheckoutError("Frete indisponível no momento.", 503)
  const token = env("MELHOR_ENVIO_TOKEN")
  const rows = await database<ShippingProduct[]>(
    "products?" +
      new URLSearchParams({
        id: `in.(${ids.join(",")})`,
        is_published: "eq.true",
        stock: "gt.0",
        select:
          "id,price_cents,shipping_weight_kg,shipping_width_cm,shipping_height_cm,shipping_length_cm",
      })
  )
  if (rows.length !== ids.length)
    throw new CheckoutError(
      "Uma peça ficou indisponível. Revise o carrinho.",
      409
    )
  const products = rows.map((item) => {
    const {
      shipping_weight_kg: weight,
      shipping_width_cm: width,
      shipping_height_cm: height,
      shipping_length_cm: length,
    } = item
    if (!weight || !width || !height || !length) {
      throw new CheckoutError(
        "Uma das peças ainda não tem frete disponível.",
        409
      )
    }
    return {
      id: item.id,
      weight,
      width,
      height,
      length,
      insurance_value: item.price_cents / 100,
      quantity: 1,
    }
  })
  const base =
    process.env.MELHOR_ENVIO_SANDBOX === "true"
      ? "https://sandbox.melhorenvio.com.br"
      : "https://www.melhorenvio.com.br"
  const response = await fetch(base + "/api/v2/me/shipment/calculate", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": env("MELHOR_ENVIO_USER_AGENT"),
    },
    body: JSON.stringify({
      from: { postal_code: origin },
      to: { postal_code: zipCode },
      products,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok)
    throw new CheckoutError("Não foi possível consultar o frete agora.", 502)
  const rates = (await response.json()) as MelhorEnvioRate[]
  if (!Array.isArray(rates))
    throw new CheckoutError("Não foi possível consultar o frete agora.", 502)
  const options: ShippingOption[] = rates
    .flatMap((rate) => {
      const carrier = rate.company?.name?.trim()
      if (
        rate.error ||
        !carrier ||
        !rate.name ||
        !isSupportedShipping(carrier, rate.name) ||
        !Number.isInteger(rate.id)
      )
        return []
      const rawPrice = rate.custom_price ?? rate.price
      const price =
        rawPrice == null || String(rawPrice).trim() === ""
          ? NaN
          : Math.round(Number(rawPrice) * 100)
      const days = Number(rate.custom_delivery_time ?? rate.delivery_time)
      if (
        !Number.isSafeInteger(price) ||
        price < 0 ||
        !Number.isInteger(days) ||
        days < 0
      )
        return []
      return [
        {
          id: String(rate.id),
          name: rate.name,
          carrier,
          carrierLogo: carrierLogo(rate.company?.picture),
          days,
          price: Math.min(price, 5000),
          originalPrice: price,
        },
      ]
    })
    .sort((a, b) => a.price - b.price || a.days - b.days)
  if (!options.length)
    throw new CheckoutError(
      "Não encontramos opções de entrega para este CEP. Confira o número informado.",
      422
    )

  const items: CheckoutItem[] = rows.map(({ id, price_cents }) => ({
    id,
    price: price_cents,
  }))
  const quote: Quote = {
    items,
    zipCode,
    options,
    subtotal: items.reduce((total, item) => total + item.price, 0),
    expires: Date.now() + 15 * 60 * 1000,
  }
  const payload = Buffer.from(JSON.stringify(quote)).toString("base64url")
  const signature = signQuote(payload)
  return {
    token: payload + "." + signature,
    items,
    subtotal: quote.subtotal,
    options: options.map(({ id, name, carrier, carrierLogo, days, price }) => ({
      id,
      name,
      carrier,
      carrierLogo,
      days,
      price,
    })),
  }
}

function signQuote(payload: string) {
  return createHmac("sha256", env("CHECKOUT_SIGNING_SECRET"))
    .update(payload)
    .digest("base64url")
}

export function verifyQuote(value: unknown, zipCode: string, option: unknown) {
  if (typeof value !== "string")
    throw new CheckoutError("Atualize a cotação de frete.")
  const [payload, signature, extra] = value.split(".")
  if (
    !payload ||
    !signature ||
    extra !== undefined ||
    !safeEqual(signQuote(payload), signature)
  ) {
    throw new CheckoutError("Atualize a cotação de frete.")
  }
  const quote: Quote = JSON.parse(
    Buffer.from(payload, "base64url").toString("utf8")
  )
  const shipping = quote.options.find((item) => item.id === option)
  if (
    !shipping ||
    !isSupportedShipping(shipping.carrier, shipping.name) ||
    quote.zipCode !== zipCode ||
    quote.expires <= Date.now()
  ) {
    throw new CheckoutError(
      "Esta cotação de frete não está mais disponível. Atualize o frete.",
      409
    )
  }
  return { quote, shipping }
}
