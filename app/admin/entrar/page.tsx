import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { AdminLoginForm } from "@/components/admin/login-form"
import { getAdmin } from "@/lib/admin/auth"

export const metadata: Metadata = { title: "Entrar na administração" }

export default async function AdminLoginPage() {
  if (await getAdmin().catch(() => null)) redirect("/admin")

  return (
    <main className="storefront-container py-12 sm:py-20">
      <div className="mx-auto max-w-md overflow-hidden rounded-sm border border-border">
        <div className="border-b border-border bg-secondary px-6 py-8 sm:px-8">
          <h1 className="text-4xl leading-none sm:text-5xl">
            Acesso administrativo
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Entre para gerenciar os pedidos da loja.
          </p>
        </div>
        <div className="px-6 py-7 sm:px-8">
          <AdminLoginForm />
          <Link href="/" className="storefront-link">
            Voltar à loja
          </Link>
        </div>
      </div>
    </main>
  )
}
