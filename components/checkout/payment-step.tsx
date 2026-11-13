import { CreditCard, QrCode } from "lucide-react"
import type { RefObject } from "react"
import { formatPrice, type Product } from "@/lib/catalog"
import {
  maxInstallments,
  type PaymentMethod,
  type ShippingQuote,
} from "@/lib/checkout/types"
import { CardFields, type CardCheckout } from "./card-fields"
import { fieldClass, StepTitle } from "./fields"
import { OrderSummary } from "./order-summary"
import { ShippingPicker } from "./shipping-picker"

export function PaymentStep({
  quote,
  shipping,
  total,
  products,
  method,
  installments,
  installmentLimit,
  busy,
  publicKey,
  cardRef,
  onShippingChange,
  onMethodChange,
  onInstallmentsChange,
  onCardValidityChange,
}: {
  quote: ShippingQuote
  shipping: ShippingQuote["options"][number]
  total: number
  products: Product[]
  method: PaymentMethod
  installments: number
  installmentLimit: number
  busy: boolean
  publicKey?: string
  cardRef: RefObject<CardCheckout | null>
  onShippingChange: (id: string) => void
  onMethodChange: (method: PaymentMethod) => void
  onInstallmentsChange: (count: number) => void
  onCardValidityChange: (valid: boolean) => void
}) {
  const maximum = maxInstallments(total, installmentLimit)

  return (
    <section className="space-y-6">
      <StepTitle>Pagamento</StepTitle>
      <ShippingPicker
        options={quote.options}
        selected={shipping}
        disabled={busy}
        onChange={onShippingChange}
      />
      <fieldset className="grid grid-cols-2 gap-3" disabled={busy}>
        <legend className="mb-2 font-medium">Como você quer pagar?</legend>
        {(["PIX", "CARD"] as const).map((value) => (
          <label
            key={value}
            className="flex min-h-12 cursor-pointer flex-wrap items-center gap-2 rounded-sm border border-transparent bg-secondary p-3 text-sm transition-colors hover:border-primary/50 has-checked:border-primary has-disabled:cursor-default has-disabled:opacity-50"
          >
            <input
              type="radio"
              name="method"
              value={value}
              checked={method === value}
              disabled={value === "CARD" && !publicKey}
              onChange={() => {
                onMethodChange(value)
              }}
              className="accent-primary"
            />
            {value === "PIX" ? (
              <QrCode className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <CreditCard className="size-4 shrink-0" aria-hidden="true" />
            )}
            {value === "PIX" ? "Pix" : "Cartão de crédito"}
          </label>
        ))}
      </fieldset>
      {method === "CARD" && publicKey && (
        <div className="space-y-4">
          <CardFields
            key={total}
            amount={total}
            publicKey={publicKey}
            checkoutRef={cardRef}
            setValid={onCardValidityChange}
          />
          <label className="block">
            Parcelas
            <select
              className={fieldClass}
              value={installments}
              disabled={busy}
              onChange={(event) =>
                onInstallmentsChange(Number(event.target.value))
              }
            >
              {Array.from({ length: maximum }, (_, index) => index + 1).map(
                (count) => (
                  <option key={count} value={count}>
                    {count === 1
                      ? "À vista"
                      : `${count}x de aproximadamente ${formatPrice(total / count / 100)}`}
                  </option>
                )
              )}
            </select>
          </label>
        </div>
      )}
      <OrderSummary products={products} items={quote.items} />
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatPrice(quote.subtotal / 100)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Frete</dt>
          <dd>{formatPrice(shipping.price / 100)}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
          <dt>Total</dt>
          <dd>{formatPrice(total / 100)}</dd>
        </div>
      </dl>
    </section>
  )
}
