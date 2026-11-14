"use server"

import { isIP } from "node:net"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { lookUpOrder, orderNumberPattern } from "@/lib/orders/server"

export async function requestOrderAccess(_previous: string, form: FormData) {
  const input = form.get("order-number")
  const number = typeof input === "string" ? input.trim().toUpperCase() : ""
  if (!orderNumberPattern.test(number))
    return "Informe o número no formato DS-8K49."

  const inputEmail = form.get("email")
  const email = typeof inputEmail === "string" ? inputEmail.trim() : ""
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Informe o e-mail que você usou na compra."

  const requestHeaders = await headers()
  const ip = requestHeaders.get("x-vercel-forwarded-for")?.trim()
  const clientIp = process.env.VERCEL && ip && isIP(ip) ? ip : "unknown"

  try {
    if (!(await lookUpOrder(number, email, clientIp)))
      return "Não foi possível abrir o pedido. Confira o número e o e-mail. Se já tentou algumas vezes, aguarde 15 minutos."
  } catch {
    return "A consulta está indisponível no momento. Tente novamente mais tarde."
  }

  redirect("/pedidos")
}
