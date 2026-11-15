import "server-only"

import { database } from "@/lib/checkout/server"
import type {
  Address,
  Contact,
  PaymentMethod,
  PaymentStatus,
  ShippingOption,
} from "@/lib/checkout/types"

export const historyFilters = {
  enviados: "Enviados",
  entregues: "Entregues",
  pagamento: "Pendências de pagamento",
  reembolsados: "Reembolsados",
} as const

export type HistoryFilter = keyof typeof historyFilters
type OrderFilter = HistoryFilter | "preparacao"

export const paymentLabels: Record<PaymentStatus, string> = {
  creating: "Aguardando cobrança",
  pending: "Pagamento pendente",
  review: "Pagamento em análise",
  paid: "Pagamento confirmado",
  refunded: "Pagamento reembolsado",
  expired: "Pagamento expirado",
  failed: "Pagamento recusado",
}

const orderFields =
  "id,order_number,status,created_at,contact->>name,tracking_carrier,tracking_code,delivered_at,total_cents,checkout_order_items(product_id,name,size,price_cents)"

type OrderItem = {
  product_id: string
  name: string
  size: string
  price_cents: number
}

export type AdminOrder = {
  id: string
  order_number: string
  status: PaymentStatus
  created_at: string
  name: string | null
  tracking_carrier: string | null
  tracking_code: string | null
  delivered_at: string | null
  total_cents: number
  checkout_order_items: OrderItem[]
}

type OrderDetail = AdminOrder & {
  method: PaymentMethod
  paid_at: string | null
  contact: Omit<Contact, "taxId"> | null
  address: Address | null
  shipping: ShippingOption | null
}

export function orderStatus(order: AdminOrder) {
  if (order.status !== "paid") return paymentLabels[order.status]
  if (order.delivered_at) return "Entregue"
  return order.tracking_code?.trim() ? "Enviado" : "Pendente de envio"
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
})

export function formatOrderDate(value: string) {
  return dateFormatter.format(new Date(value))
}

const pageSize = 10

export async function listOrders(
  filter: OrderFilter,
  page: number,
  search: string
) {
  const query = new URLSearchParams({
    select: orderFields,
    order: "created_at.desc,id.desc",
    offset: String((page - 1) * pageSize),
    limit: String(pageSize + 1),
  })
  if (search) query.set("order_number", "ilike." + search + "*")

  if (filter === "pagamento") {
    query.set("status", "in.(creating,pending,review)")
  } else if (filter === "reembolsados") {
    query.set("status", "eq.refunded")
  } else {
    query.set("status", "eq.paid")
    query.set(
      "delivered_at",
      filter === "entregues" ? "not.is.null" : "is.null"
    )
    if (filter === "preparacao")
      query.set("or", "(tracking_code.is.null,tracking_code.eq.)")
    if (filter === "enviados") {
      query.append("tracking_code", "not.is.null")
      query.append("tracking_code", "neq.")
    }
  }

  const orders = await database<AdminOrder[]>("checkout_orders?" + query)
  return {
    orders: orders.slice(0, pageSize),
    hasNext: orders.length > pageSize,
  }
}

export async function getAdminOrder(id: string) {
  const query = new URLSearchParams({
    id: "eq." + id,
    select: orderFields + ",method,paid_at,contact,address,shipping",
  })
  const [order] = await database<OrderDetail[]>("checkout_orders?" + query)
  return order
}

export async function updateTracking(
  id: string,
  carrier: string,
  code: string
) {
  return updatePaidOrder(id, { tracking_carrier: carrier, tracking_code: code })
}

export async function markDelivered(id: string) {
  return updatePaidOrder(id, { delivered_at: new Date().toISOString() }, true)
}

async function updatePaidOrder(
  id: string,
  values:
    | { tracking_carrier: string; tracking_code: string }
    | { delivered_at: string },
  delivery = false
) {
  const query = new URLSearchParams({
    id: "eq." + id,
    status: "eq.paid",
    select: "id",
  })
  if (delivery) {
    query.set("delivered_at", "is.null")
    query.append("tracking_code", "not.is.null")
    query.append("tracking_code", "neq.")
  }
  const rows = await database<{ id: string }[]>("checkout_orders?" + query, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(values),
  })
  return rows.length > 0
}
