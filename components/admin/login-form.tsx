"use client"

import { useActionState } from "react"
import { ArrowRight } from "lucide-react"
import { login } from "@/app/admin/actions"
import { Field } from "@/components/checkout/fields"
import { Button } from "@/components/ui/button"

export function AdminLoginForm() {
  const [message, action, pending] = useActionState(login, "")

  return (
    <form action={action} className="space-y-4">
      <Field
        label="E-mail"
        name="email"
        type="email"
        autoComplete="username"
        maxLength={254}
        required
      />
      <Field
        label="Senha"
        name="password"
        type="password"
        autoComplete="current-password"
        maxLength={72}
        required
      />
      <p role="status" className="text-sm text-destructive empty:sr-only">
        {message}
      </p>
      <Button
        type="submit"
        className="h-11 w-full justify-between rounded-sm px-4 text-sm"
        disabled={pending}
      >
        {pending ? "Entrando…" : "Entrar"}
        <ArrowRight aria-hidden="true" />
      </Button>
    </form>
  )
}
