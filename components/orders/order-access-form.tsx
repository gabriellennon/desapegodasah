"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/checkout/fields"
import { requestOrderAccess } from "@/app/pedidos/actions"

export function OrderAccessForm() {
  const [message, action, pending] = useActionState(requestOrderAccess, "")
  return (
    <form action={action} className="space-y-4">
      <Field
        label="Número do pedido"
        name="order-number"
        autoCapitalize="characters"
        autoComplete="off"
        placeholder="DS-8K49"
        maxLength={7}
        required
      />
      <Field
        label="E-mail usado na compra"
        name="email"
        type="email"
        autoComplete="email"
        maxLength={254}
        required
      />
      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-sm text-sm"
      >
        {pending ? "Consultando…" : "Acompanhar pedido"}
      </Button>
      <p role="status" className="text-sm text-muted-foreground empty:sr-only">
        {message}
      </p>
    </form>
  )
}
