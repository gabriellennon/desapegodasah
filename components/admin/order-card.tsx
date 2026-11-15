import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/catalog"
import {
  type AdminOrder,
  formatOrderDate,
  orderStatus,
} from "@/lib/admin/orders"

export function OrderStatus({ order }: { order: AdminOrder }) {
  return (
    <span
      className={`inline-flex rounded-sm px-2.5 py-1 text-xs font-medium ${order.status === "paid" && !order.delivered_at && !order.tracking_code ? "bg-secondary" : "bg-surface"}`}
    >
      {orderStatus(order)}
    </span>
  )
}

export function OrderItems({ order }: { order: AdminOrder }) {
  if (!order.checkout_order_items.length) return null
  return (
    <ul className="divide-y divide-border">
      {order.checkout_order_items.map((item) => (
        <li
          key={item.product_id}
          className="flex justify-between gap-3 py-2.5 text-sm"
        >
          <span className="min-w-0 wrap-anywhere">
            {item.name}
            {item.size && (
              <span className="ml-2 text-xs text-muted-foreground">
                Tam. {item.size}
              </span>
            )}
          </span>
          <span className="shrink-0">
            {formatPrice(item.price_cents / 100)}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function OrderCard({
  order,
  returnTo,
}: {
  order: AdminOrder
  returnTo: string
}) {
  const search = new URLSearchParams({ voltar: returnTo })
  return (
    <article className="rounded-sm border border-border bg-background px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold">
            Pedido {order.order_number}
          </h3>
          <p className="mt-1 text-sm wrap-anywhere text-muted-foreground">
            {[order.name, formatOrderDate(order.created_at)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">
            {formatPrice(order.total_cents / 100)}
          </span>
          <OrderStatus order={order} />
        </div>
      </div>
      {order.tracking_code && (
        <p className="mt-3 text-xs wrap-anywhere text-muted-foreground">
          Rastreio {order.tracking_code}
          {order.tracking_carrier && ` · ${order.tracking_carrier}`}
        </p>
      )}
      {order.delivered_at && (
        <p className="mt-1 text-xs text-muted-foreground">
          Entregue em {formatOrderDate(order.delivered_at)}
        </p>
      )}
      <div className="mt-3 border-y border-border">
        <OrderItems order={order} />
      </div>
      <Button asChild variant="outline" className="mt-3 h-9 rounded-sm px-3">
        <Link
          href={`/admin/pedidos/${order.id}?${search}`}
          aria-label={`Ver detalhes do pedido ${order.order_number}`}
        >
          Ver detalhes <ArrowUpRight aria-hidden="true" />
        </Link>
      </Button>
    </article>
  )
}
