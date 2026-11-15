import type { Metadata } from "next"
import Link from "next/link"
import { Check, Circle, Package, PackageCheck, Truck } from "lucide-react"
import { OrderAccessForm } from "@/components/orders/order-access-form"
import { TrackingCode } from "@/components/orders/tracking-code"
import { StoreFooter, StoreHeader } from "@/components/store/store-chrome"
import { formatPrice } from "@/lib/catalog"
import { getRememberedOrder } from "@/lib/orders/server"

export const metadata: Metadata = { title: "Meus pedidos | Desapego da Sah" }

function ShippingProgress({
  currentStep,
}: {
  currentStep: "preparing" | "shipped" | "delivered"
}) {
  const steps = [
    { id: "paid", label: "Pagamento confirmado", icon: Check },
    { id: "preparing", label: "Em preparação", icon: Package },
    { id: "shipped", label: "Pedido enviado", icon: Truck },
    { id: "delivered", label: "Pedido entregue", icon: PackageCheck },
  ]
  const currentIndex = steps.findIndex(({ id }) => id === currentStep)

  return (
    <section className="rounded-sm border border-border bg-surface/50 p-4 sm:p-5">
      <h3 id="shipping-progress" className="mb-4 text-sm font-semibold">
        Acompanhamento do envio
      </h3>
      <ol aria-labelledby="shipping-progress" className="list-none">
        {steps.map(({ id, label, icon }, index) => {
          const complete = index < currentIndex
          const current = index === currentIndex
          const Icon = complete ? Check : current ? icon : Circle

          return (
            <li
              key={id}
              aria-current={current ? "step" : undefined}
              className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 not-last:pb-4"
            >
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute top-8 bottom-0 left-[15px] w-px ${complete ? "bg-primary/40" : "bg-border"}`}
                />
              )}
              <span
                aria-hidden="true"
                className={`flex size-8 items-center justify-center rounded-full border ${current ? "border-primary bg-primary text-primary-foreground" : complete ? "border-primary/20 bg-secondary text-primary" : "border-border bg-background text-muted-foreground"}`}
              >
                <Icon
                  className={index > currentIndex ? "size-2.5" : "size-4"}
                />
              </span>
              <div className="min-w-0 pt-1.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    className={
                      index > currentIndex
                        ? "text-muted-foreground"
                        : "font-medium"
                    }
                  >
                    {label}
                  </span>
                  {complete && <span className="sr-only">, concluído</span>}
                  {index > currentIndex && (
                    <span className="sr-only">, pendente</span>
                  )}
                  {current && (
                    <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] font-semibold">
                      Etapa atual
                    </span>
                  )}
                </div>
                {current && id === "preparing" && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Estamos preparando seu pedido para envio.
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ acesso?: string }>
}) {
  const [{ acesso }, order] = await Promise.all([
    searchParams,
    getRememberedOrder().catch(() => undefined),
  ])
  const trackingCode = order?.tracking_code?.trim()

  return (
    <>
      <StoreHeader />
      <main className="storefront-container py-14 sm:py-20">
        <div className="mx-auto max-w-lg">
          <h1 className="text-4xl leading-none sm:text-5xl">Meus pedidos</h1>
          {acesso === "invalido" && (
            <p role="status" className="mt-4 text-muted-foreground">
              Este link expirou ou está inválido. Consulte pelo número do pedido
              e pelo e-mail usado na compra.
            </p>
          )}
          {(acesso === "indisponivel" || order === undefined) && (
            <p role="status" className="mt-4 text-muted-foreground">
              Não foi possível consultar seu pedido agora. Tente novamente em
              instantes.
            </p>
          )}
          {order && (
            <section
              className="my-7 space-y-5 border-y border-border py-5"
              aria-labelledby="order-number"
            >
              <div>
                <h2 id="order-number" className="text-3xl">
                  {order.order_number}
                </h2>
                {trackingCode && (
                  <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1 text-xs leading-relaxed">
                    <dt className="pt-1.5 text-muted-foreground">
                      Código de rastreio
                    </dt>
                    <dd>
                      <TrackingCode key={trackingCode} code={trackingCode} />
                    </dd>
                    {order.tracking_carrier && (
                      <>
                        <dt className="text-muted-foreground">
                          Transportadora
                        </dt>
                        <dd className="break-words">
                          {order.tracking_carrier}
                        </dd>
                      </>
                    )}
                  </dl>
                )}
              </div>
              {order.status === "refunded" ? (
                <p className="rounded-sm border border-border bg-surface/50 px-4 py-3 font-medium">
                  Pagamento reembolsado
                </p>
              ) : (
                <ShippingProgress
                  currentStep={
                    order.delivered_at
                      ? "delivered"
                      : trackingCode
                        ? "shipped"
                        : "preparing"
                  }
                />
              )}
              {order.checkout_order_items &&
                typeof order.total_cents === "number" && (
                  <>
                    <ul className="divide-y divide-border">
                      {order.checkout_order_items.map((item) => (
                        <li
                          key={item.product_id}
                          className="flex justify-between gap-4 py-2.5"
                        >
                          <span>
                            {item.name}
                            <span className="block text-xs text-muted-foreground">
                              Tam. {item.size}
                            </span>
                          </span>
                          <span className="shrink-0">
                            {formatPrice(item.price_cents / 100)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="flex justify-between border-t border-border pt-4 font-medium">
                      <span>Total com frete</span>
                      <span>{formatPrice(order.total_cents / 100)}</span>
                    </p>
                  </>
                )}
            </section>
          )}
          {order ? (
            <details>
              <summary className="mb-4 cursor-pointer font-medium">
                Acompanhar outro pedido
              </summary>
              <OrderAccessForm />
            </details>
          ) : (
            <div className="my-7 space-y-4">
              <p className="text-muted-foreground">
                Informe o número do pedido que você recebeu na confirmação e o
                e-mail usado na compra.
              </p>
              <OrderAccessForm />
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-x-5">
            <Link href="/#pecas" className="storefront-link">
              Voltar ao catálogo
            </Link>
            <a
              href="https://wa.me/5547920034583"
              target="_blank"
              rel="noreferrer"
              className="storefront-link"
            >
              Preciso de ajuda
            </a>
          </div>
        </div>
      </main>
      <StoreFooter />
    </>
  )
}
