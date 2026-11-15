"use client"

import { useActionState, useState } from "react"
import { PackageCheck, Truck } from "lucide-react"
import { saveFulfillment } from "@/app/admin/actions"
import { Field } from "@/components/checkout/fields"
import { Button } from "@/components/ui/button"

export function FulfillmentForm({
  id,
  carrier,
  trackingCode,
  canConfirmDelivery,
}: {
  id: string
  carrier: string
  trackingCode: string
  canConfirmDelivery: boolean
}) {
  const [carrierInput, setCarrierInput] = useState(carrier)
  const [codeInput, setCodeInput] = useState(trackingCode)
  const [state, action, pending] = useActionState(
    saveFulfillment.bind(null, id),
    {
      message: "",
      error: false,
    }
  )

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        <input type="hidden" name="operation" value="tracking" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Transportadora"
            name="carrier"
            value={carrierInput}
            onChange={(event) => setCarrierInput(event.target.value)}
            maxLength={120}
            required
          />
          <Field
            label="Código de rastreio"
            name="tracking-code"
            value={codeInput}
            onChange={(event) => setCodeInput(event.target.value)}
            maxLength={120}
            required
          />
        </div>
        <Button
          type="submit"
          className="h-10 rounded-sm px-4"
          disabled={pending}
        >
          <Truck aria-hidden="true" />
          {pending
            ? "Salvando…"
            : trackingCode
              ? "Salvar rastreio"
              : "Registrar envio"}
        </Button>
      </form>
      {canConfirmDelivery && (
        <form action={action} className="border-t border-border pt-4">
          <input type="hidden" name="operation" value="delivery" />
          <Button
            type="submit"
            variant="outline"
            className="h-10 rounded-sm px-4"
            disabled={pending}
          >
            <PackageCheck aria-hidden="true" /> Marcar como entregue
          </Button>
        </form>
      )}
      <p
        role="status"
        className={`text-sm empty:sr-only ${state.error ? "text-destructive" : "text-muted-foreground"}`}
      >
        {state.message}
      </p>
    </div>
  )
}
