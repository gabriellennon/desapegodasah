import type { Metadata } from "next"
import { Checkout } from "@/components/checkout/checkout"
import { getCatalog } from "@/lib/catalog-source"
import { digits } from "@/lib/checkout/types"

export const metadata: Metadata = {
  title: "Finalizar compra | Desapego da Sah",
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ peca?: string | string[] }>
}) {
  const [{ products, demo }, { peca }] = await Promise.all([
    getCatalog(),
    searchParams,
  ])
  const publicKey = process.env.ABACATE_CHECKOUT_KEY?.trim()
  const installmentLimit = Number(process.env.CHECKOUT_MAX_INSTALLMENTS ?? 12)
  const configured =
    !demo &&
    Boolean(
      process.env.ABACATE_API_KEY &&
      process.env.ABACATE_WEBHOOK_SECRET &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.CHECKOUT_SIGNING_SECRET &&
      process.env.CHECKOUT_CRON_SECRET &&
      process.env.MELHOR_ENVIO_TOKEN &&
      process.env.MELHOR_ENVIO_USER_AGENT &&
      digits(process.env.MELHOR_ENVIO_ORIGIN_CEP ?? "").length === 8
    )

  return (
    <Checkout
      products={products}
      singleId={typeof peca === "string" ? peca : undefined}
      configured={configured}
      publicKey={publicKey?.startsWith("pk_") ? publicKey : undefined}
      installmentLimit={
        Number.isInteger(installmentLimit) ? installmentLimit : 12
      }
    />
  )
}
