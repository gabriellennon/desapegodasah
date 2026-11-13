import type { Metadata } from "next"
import Link from "next/link"
import { StoreFooter, StoreHeader } from "@/components/store/store-chrome"

export const metadata: Metadata = { title: "Meus pedidos | Desapego da Sah" }

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string | string[] }>
}) {
  const { pedido } = await searchParams
  const orderNumber =
    typeof pedido === "string" && /^DS-[A-HJ-KM-NP-Z2-9]{4}$/.test(pedido)
      ? pedido
      : null

  return (
    <>
      <StoreHeader />
      <main className="storefront-container py-16 text-center sm:py-24">
        <h1 className="text-4xl leading-none sm:text-5xl">Meus pedidos</h1>
        {orderNumber && (
          <p className="mt-4 text-sm font-medium tracking-wider">
            {orderNumber}
          </p>
        )}
        <p className="mt-4 text-muted-foreground">
          O acompanhamento de pedidos estará disponível em breve.
        </p>
        <Link href="/#pecas" className="storefront-link">
          Voltar ao catálogo
        </Link>
      </main>
      <StoreFooter />
    </>
  )
}
