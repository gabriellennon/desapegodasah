import type { Metadata } from "next"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  LogOut,
  Package,
  Search,
} from "lucide-react"
import { logout } from "@/app/admin/actions"
import { OrderCard } from "@/components/admin/order-card"
import { fieldClass } from "@/components/checkout/fields"
import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/admin/auth"
import {
  historyFilters,
  type HistoryFilter,
  listOrders,
} from "@/lib/admin/orders"

export const metadata: Metadata = { title: "Gestão de pedidos" }

function pageNumber(value: string | string[] | undefined) {
  return typeof value === "string" && /^[1-9]\d{0,5}$/.test(value)
    ? Number(value)
    : 1
}

function Pagination({
  page,
  previous,
  next,
  label,
}: {
  page: number
  previous?: string
  next?: string
  label: string
}) {
  if (!previous && !next) return null
  return (
    <nav
      aria-label={label}
      className="mt-4 flex flex-wrap items-center gap-3 text-xs"
    >
      {previous && (
        <Button variant="outline" asChild>
          <Link href={previous}>
            <ChevronLeft aria-hidden="true" /> Anterior
          </Link>
        </Button>
      )}
      <span>Página {page}</span>
      {next && (
        <Button variant="outline" asChild>
          <Link href={next}>
            Próxima <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
      )}
    </nav>
  )
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const admin = await requireAdmin()
  const params = await searchParams
  const filter: HistoryFilter =
    typeof params.status === "string" &&
    Object.hasOwn(historyFilters, params.status)
      ? (params.status as HistoryFilter)
      : "enviados"
  const search =
    typeof params.q === "string" && /^[A-Z0-9-]{1,16}$/i.test(params.q.trim())
      ? params.q.trim().toUpperCase()
      : ""
  const queuePage = pageNumber(params.fila)
  const historyPage = pageNumber(params.pagina)

  function href(
    status: HistoryFilter = filter,
    queue = queuePage,
    page = historyPage
  ) {
    const query = new URLSearchParams({ status })
    if (search) query.set("q", search)
    if (queue > 1) query.set("fila", String(queue))
    if (page > 1) query.set("pagina", String(page))
    return "/admin?" + query
  }

  const result = await Promise.all([
    listOrders("preparacao", queuePage, search),
    listOrders(filter, historyPage, search),
  ]).catch(() => null)
  const currentHref = href()

  return (
    <main className="storefront-container py-8 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Olá, {admin.name}</p>
          <h1 className="mt-1 text-5xl leading-none sm:text-6xl">
            Gestão de pedidos
          </h1>
        </div>
        <form action={logout}>
          <Button
            type="submit"
            variant="outline"
            className="h-9 rounded-sm px-3"
          >
            <LogOut aria-hidden="true" /> Sair
          </Button>
        </form>
      </div>

      <form
        className="mt-6 flex max-w-lg flex-wrap items-end gap-2.5"
        action="/admin"
      >
        <input type="hidden" name="status" value={filter} />
        <label className="min-w-44 flex-1 text-sm">
          Número do pedido
          <input
            name="q"
            defaultValue={search}
            placeholder="DS-8K49"
            maxLength={16}
            pattern="[A-Za-z0-9\-]+"
            className={fieldClass}
          />
        </label>
        <Button type="submit" className="h-12 rounded-sm px-4 text-sm">
          <Search aria-hidden="true" /> Buscar
        </Button>
        {search && (
          <Link
            href={`/admin?status=${filter}`}
            className="storefront-link mb-1"
          >
            Limpar
          </Link>
        )}
      </form>

      {result ? (
        <div className="mt-8 space-y-6">
          <section
            aria-labelledby="shipping-queue"
            className="rounded-sm border border-border bg-surface/40 p-4 sm:p-6"
          >
            <h2
              id="shipping-queue"
              className="flex items-center gap-2.5 text-3xl"
            >
              <Clock3 className="size-5 shrink-0" aria-hidden="true" />{" "}
              Pendentes de envio
            </h2>
            <div className="mt-4 space-y-3">
              {result[0].orders.length ? (
                result[0].orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    returnTo={currentHref}
                  />
                ))
              ) : (
                <p className="border-t border-border py-6 text-center text-sm text-muted-foreground">
                  Nenhum pedido pendente de envio nesta página.
                </p>
              )}
            </div>
            <Pagination
              page={queuePage}
              label="Páginas de pedidos pendentes de envio"
              previous={queuePage > 1 ? href(filter, queuePage - 1) : undefined}
              next={result[0].hasNext ? href(filter, queuePage + 1) : undefined}
            />
          </section>
          <section
            aria-labelledby="order-history"
            className="rounded-sm border border-border p-4 sm:p-6"
          >
            <h2
              id="order-history"
              className="flex items-center gap-2.5 text-3xl"
            >
              <Package className="size-5 shrink-0" aria-hidden="true" />{" "}
              Acompanhamento de pedidos
            </h2>
            <nav
              aria-label="Filtrar pedidos"
              className="mt-4 flex flex-wrap gap-1 rounded-sm bg-surface p-1.5"
            >
              {(
                Object.entries(historyFilters) as [HistoryFilter, string][]
              ).map(([value, label]) => (
                <Link
                  key={value}
                  href={href(value, queuePage, 1)}
                  aria-current={value === filter ? "page" : undefined}
                  className="rounded-sm px-3 py-2 text-xs font-medium hover:bg-background aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 space-y-3">
              {result[1].orders.length ? (
                result[1].orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    returnTo={currentHref}
                  />
                ))
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum pedido neste filtro.
                </p>
              )}
            </div>
            <Pagination
              page={historyPage}
              label="Páginas do acompanhamento de pedidos"
              previous={
                historyPage > 1
                  ? href(filter, queuePage, historyPage - 1)
                  : undefined
              }
              next={
                result[1].hasNext
                  ? href(filter, queuePage, historyPage + 1)
                  : undefined
              }
            />
          </section>
        </div>
      ) : (
        <p
          role="status"
          className="mt-8 rounded-sm border border-border bg-surface p-4"
        >
          Não foi possível carregar os pedidos. Tente novamente em instantes.
        </p>
      )}
    </main>
  )
}
