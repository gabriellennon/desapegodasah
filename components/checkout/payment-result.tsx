import Image from "next/image"
import Link from "next/link"
import { CheckCircle2, Clock3, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PaymentView } from "@/lib/checkout/types"
import { formatPrice } from "@/lib/catalog"
import { ConfirmationHearts } from "./confirmation-hearts"

export function PaymentResult({
  payment,
  retry,
  check,
  copied,
  copy,
  busy,
  clear,
}: {
  payment: PaymentView
  retry: () => void
  check: () => void
  copied: boolean
  copy: () => void
  busy: boolean
  clear: () => void
}) {
  if (payment.status === "paid") {
    return (
      <section
        className="relative isolate space-y-5 py-10 text-center"
        aria-labelledby="payment-result"
      >
        <ConfirmationHearts />
        <CheckCircle2
          className="mx-auto size-10 text-primary"
          aria-hidden="true"
        />
        <h1
          id="payment-result"
          className="font-heading text-4xl leading-none sm:text-5xl"
        >
          Compra confirmada
        </h1>
        <p>
          Pagamento de <strong>{formatPrice(payment.total / 100)}</strong>{" "}
          aprovado.
        </p>
        <p className="text-sm text-muted-foreground">
          Pedido{" "}
          <span className="font-medium tracking-wider text-foreground">
            {payment.orderNumber}
          </span>
        </p>
        <div className="relative mx-auto grid w-full max-w-xs gap-2.5">
          <Button asChild className="h-11 rounded-sm px-6 text-sm">
            <a href="/pedidos" onClick={clear}>
              Acompanhar meu pedido
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-sm px-6 text-sm"
          >
            <Link href="/#pecas" onNavigate={clear}>
              Voltar ao catálogo
            </Link>
          </Button>
        </div>
      </section>
    )
  }

  const retryable = payment.status === "failed" || payment.status === "expired"
  const needsReview =
    payment.status === "review" || payment.status === "refunded"
  if (retryable || needsReview) {
    const title = {
      failed: "Pagamento não concluído",
      expired: "Pix expirado",
      review: "Pagamento em análise",
      refunded: "Pagamento reembolsado",
    }[payment.status as "failed" | "expired" | "review" | "refunded"]
    return (
      <section className="space-y-5 py-10 text-center">
        <h1 className="font-heading text-4xl leading-none sm:text-5xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {retryable
            ? "Confira a disponibilidade das peças e tente outra vez."
            : `Referência do pedido: ${payment.orderNumber}`}
        </p>
        {retryable && (
          <Button type="button" className="h-11 px-6" onClick={retry}>
            Tentar novamente
          </Button>
        )}
      </section>
    )
  }

  return (
    <section className="space-y-5 text-center" aria-labelledby="payment-result">
      <Clock3 className="mx-auto size-9 text-primary" aria-hidden="true" />
      <h1
        id="payment-result"
        className="font-heading text-4xl leading-none sm:text-5xl"
      >
        {payment.pixCode ? "Pague com Pix" : "Confirmando pagamento"}
      </h1>
      <p className="text-sm text-muted-foreground" role="status">
        {payment.pixCode
          ? "Escaneie o QR Code ou use o código no app do seu banco."
          : "Estamos aguardando a confirmação. Consulte novamente antes de tentar outra compra."}
      </p>
      {payment.pixCode && (
        <>
          <p className="text-xl font-semibold">
            {formatPrice(payment.total / 100)}
          </p>
          {payment.pixImage && (
            <Image
              src={payment.pixImage}
              alt="QR Code do Pix"
              width={224}
              height={224}
              unoptimized
              className="mx-auto"
            />
          )}
          <textarea
            aria-label="Código Pix copia e cola"
            className="h-20 w-full resize-none rounded-lg border border-border p-3 text-sm"
            value={payment.pixCode}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
          />
          <Button
            type="button"
            className="h-11 px-5"
            variant="outline"
            onClick={copy}
          >
            <Copy /> {copied ? "Código copiado" : "Copiar código Pix"}
          </Button>
          {payment.expiresAt && (
            <p className="text-xs text-muted-foreground">
              Válido até{" "}
              {new Date(payment.expiresAt).toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              })}{" "}
              (Brasília)
            </p>
          )}
        </>
      )}
      <div>
        <Button
          type="button"
          className="h-11 px-5"
          disabled={busy}
          onClick={check}
        >
          {busy ? "Consultando…" : "Verificar pagamento"}
        </Button>
      </div>
    </section>
  )
}
