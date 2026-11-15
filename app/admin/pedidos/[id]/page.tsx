import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Package,
  Truck,
  UserRound,
} from "lucide-react"
import { FulfillmentForm } from "@/components/admin/fulfillment-form"
import { OrderItems, OrderStatus } from "@/components/admin/order-card"
import { requireAdmin } from "@/lib/admin/auth"
import {
  formatOrderDate,
  getAdminOrder,
  paymentLabels,
} from "@/lib/admin/orders"
import { formatPrice } from "@/lib/catalog"
import { uuid } from "@/lib/checkout/server"

export const metadata: Metadata = { title: "Detalhes do pedido" }

const dataGrid = "grid gap-x-6 gap-y-4 sm:grid-cols-2"

function Datum({
  label,
  children,
}: {
  label: string
  children?: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium wrap-anywhere">
        {children || "—"}
      </dd>
    </div>
  )
}

function DetailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof Package
  children: React.ReactNode
}) {
  return (
    <section className="rounded-sm border border-border p-4 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2.5 text-3xl">
        <Icon className="size-5 shrink-0" aria-hidden="true" /> {title}
      </h2>
      {children}
    </section>
  )
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ voltar?: string | string[] }>
}) {
  await requireAdmin()
  const [{ id }, { voltar }] = await Promise.all([params, searchParams])
  if (!uuid.test(id)) notFound()
  const order = await getAdminOrder(id)
  if (!order) notFound()

  const { address, contact, shipping } = order
  const trackingCode = order.tracking_code?.trim() ?? ""
  const back =
    typeof voltar === "string" && voltar.startsWith("/admin?")
      ? voltar
      : "/admin"

  return (
    <main className="storefront-container py-7 sm:py-10">
      <Link href={back} className="storefront-link mt-0">
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Voltar aos pedidos
      </Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-5xl leading-none">Pedido {order.order_number}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatOrderDate(order.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold">
            {formatPrice(order.total_cents / 100)}
          </span>
          <OrderStatus order={order} />
        </div>
      </div>

      <div className="mt-6 grid items-start gap-4 store-desktop:grid-cols-2">
        <DetailSection title="Pagamento" icon={CreditCard}>
          <dl className={dataGrid}>
            <Datum label="Status">{paymentLabels[order.status]}</Datum>
            <Datum label="Forma de pagamento">
              {order.method === "PIX" ? "Pix" : "Cartão de crédito"}
            </Datum>
            <Datum label="Total com frete">
              {formatPrice(order.total_cents / 100)}
            </Datum>
            <Datum label="Pagamento confirmado em">
              {order.paid_at && formatOrderDate(order.paid_at)}
            </Datum>
          </dl>
        </DetailSection>
        <DetailSection title="Dados da cliente" icon={UserRound}>
          <dl className={dataGrid}>
            <Datum label="Nome">{contact?.name}</Datum>
            <Datum label="E-mail">{contact?.email}</Datum>
            <Datum label="Telefone">{contact?.cellphone}</Datum>
          </dl>
        </DetailSection>
        <DetailSection title="Endereço de entrega" icon={MapPin}>
          <dl className={dataGrid}>
            <Datum label="Rua e número">
              {address &&
                [address.street, address.number].filter(Boolean).join(", ")}
            </Datum>
            <Datum label="Complemento">{address?.complement}</Datum>
            <Datum label="Bairro">{address?.neighborhood}</Datum>
            <Datum label="Cidade e UF">
              {address &&
                [address.city, address.state].filter(Boolean).join(" · ")}
            </Datum>
            <Datum label="CEP">{address?.zipCode}</Datum>
          </dl>
        </DetailSection>
        <DetailSection title="Itens do pedido" icon={Package}>
          {order.checkout_order_items.length ? (
            <OrderItems order={order} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum item registrado.
            </p>
          )}
        </DetailSection>
        <div className="store-desktop:col-span-2">
          <DetailSection title="Envio e entrega" icon={Truck}>
            <dl className={`${dataGrid} mb-4`}>
              <Datum label="Frete escolhido">
                {shipping &&
                  [shipping.carrier, shipping.name].filter(Boolean).join(" · ")}
              </Datum>
              <Datum label="Valor do frete">
                {typeof shipping?.price === "number"
                  ? formatPrice(shipping.price / 100)
                  : null}
              </Datum>
              {order.delivered_at && (
                <Datum label="Entregue em">
                  {formatOrderDate(order.delivered_at)}
                </Datum>
              )}
            </dl>
            {order.status === "paid" ? (
              <div className="border-t border-border pt-4">
                <FulfillmentForm
                  id={order.id}
                  carrier={order.tracking_carrier ?? shipping?.carrier ?? ""}
                  trackingCode={trackingCode}
                  canConfirmDelivery={Boolean(
                    trackingCode && !order.delivered_at
                  )}
                />
              </div>
            ) : (
              <dl className={dataGrid}>
                <Datum label="Transportadora do envio">
                  {order.tracking_carrier}
                </Datum>
                <Datum label="Código de rastreio">{trackingCode}</Datum>
              </dl>
            )}
          </DetailSection>
        </div>
      </div>
    </main>
  )
}
