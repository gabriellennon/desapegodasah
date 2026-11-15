import "server-only"

import { createHmac } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { database, env, safeEqual, uuid } from "@/lib/checkout/server"

const cookieName = "desapego-admin"
const sessionSeconds = 8 * 60 * 60
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/admin",
}

type Credentials = { id: string; password_hash: string }

function signature(payload: string, passwordHash: string) {
  return createHmac("sha256", env("CHECKOUT_SIGNING_SECRET"))
    .update(`admin-session:${payload}:${passwordHash}`)
    .digest("base64url")
}

export async function signInAdmin(email: string, password: string) {
  const admin = await database<Credentials | null>(
    "rpc/authenticate_order_admin",
    {
      method: "POST",
      body: JSON.stringify({ p_email: email, p_password: password }),
    }
  )
  if (!admin) return false

  const expires = Math.floor(Date.now() / 1000) + sessionSeconds
  const payload = `${admin.id}.${expires}`
  const store = await cookies()
  store.set(
    cookieName,
    `${payload}.${signature(payload, admin.password_hash)}`,
    {
      ...cookieOptions,
      maxAge: sessionSeconds,
    }
  )
  return true
}

export async function signOutAdmin() {
  const store = await cookies()
  store.set(cookieName, "", { ...cookieOptions, maxAge: 0 })
}

export async function getAdmin() {
  const token = (await cookies()).get(cookieName)?.value
  if (!token) return null
  const [id, expires, tokenSignature, extra] = token.split(".")
  if (
    !uuid.test(id) ||
    !/^\d{10}$/.test(expires ?? "") ||
    Number(expires) <= Math.floor(Date.now() / 1000) ||
    !/^[\w-]{43}$/.test(tokenSignature ?? "") ||
    extra !== undefined
  )
    return null

  const [admin] = await database<(Credentials & { name: string })[]>(
    "admin_users?" +
      new URLSearchParams({ id: "eq." + id, select: "id,name,password_hash" })
  )
  if (
    !admin ||
    !safeEqual(
      tokenSignature,
      signature(`${id}.${expires}`, admin.password_hash)
    )
  )
    return null
  return { id: admin.id, name: admin.name }
}

export async function requireAdmin() {
  const admin = await getAdmin()
  if (!admin) redirect("/admin/entrar")
  return admin
}
