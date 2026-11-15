"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { requireAdmin, signInAdmin, signOutAdmin } from "@/lib/admin/auth"
import { markDelivered, updateTracking } from "@/lib/admin/orders"
import { uuid } from "@/lib/checkout/server"

export async function login(_state: string, form: FormData) {
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase()
  const password = String(form.get("password") ?? "")
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !password ||
    Buffer.byteLength(password) > 72
  )
    return "Confira o e-mail e a senha."

  try {
    if (!(await signInAdmin(email, password))) {
      return "E-mail ou senha inválidos. Se já tentou várias vezes, aguarde 15 minutos."
    }
  } catch {
    return "O acesso está indisponível. Tente novamente em instantes."
  }
  redirect("/admin")
}

export async function logout() {
  await signOutAdmin()
  redirect("/admin/entrar")
}

export async function saveFulfillment(
  id: string,
  _state: { message: string; error: boolean },
  form: FormData
) {
  await requireAdmin()
  if (!uuid.test(id)) return { message: "Pedido inválido.", error: true }

  const operation = form.get("operation")
  let updated: boolean
  try {
    if (operation === "tracking") {
      const carrier = String(form.get("carrier") ?? "").trim()
      const code = String(form.get("tracking-code") ?? "").trim()
      if (!carrier || carrier.length > 120 || !code || code.length > 120)
        return {
          message: "Preencha a transportadora e o código de rastreio.",
          error: true,
        }
      updated = await updateTracking(id, carrier, code)
    } else if (operation === "delivery") {
      updated = await markDelivered(id)
    } else {
      return { message: "Operação inválida.", error: true }
    }
  } catch {
    return { message: "Não foi possível salvar. Tente novamente.", error: true }
  }
  if (!updated)
    return {
      message: "O status do pedido mudou. Atualize a página para conferir.",
      error: true,
    }

  revalidatePath("/admin")
  revalidatePath("/admin/pedidos/" + id)
  revalidatePath("/pedidos")
  return {
    message:
      operation === "delivery" ? "Entrega registrada." : "Rastreio salvo.",
    error: false,
  }
}
