import type { Metadata } from "next"
import Link from "next/link"
import { OrderAccessForm } from "@/components/orders/order-access-form"
import { StoreFooter, StoreHeader } from "@/components/store/store-chrome"
import { formatPrice } from "@/lib/catalog"
import { getRememberedOrder } from "@/lib/orders/server"

export const metadata: Metadata = { title: "Meus pedidos | Desapego da Sah" }

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ acesso?: string }>
}) {
  const [{ acesso }, order] = await Promise.all([
    searchParams,
    getRememberedOrder().catch(() => undefined),
  ])

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
                <p className="mt-1 text-muted-foreground">
                  {order.status === "refunded"
                    ? "Pagamento reembolsado"
                    : order.tracking_code
                      ? "Pedido enviado"
                      : "Pagamento confirmado · Preparando para envio"}
                </p>
              </div>
              {order.status === "paid" && order.tracking_code && (
                <dl className="grid gap-1 rounded-sm bg-surface p-4">
                  <dt className="font-medium">Código de rastreio</dt>
                  <dd className="break-all">{order.tracking_code}</dd>
                  {order.tracking_carrier && (
                    <>
                      <dt className="mt-2 font-medium">Transportadora</dt>
                      <dd>{order.tracking_carrier}</dd>
                    </>
                  )}
                </dl>
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
