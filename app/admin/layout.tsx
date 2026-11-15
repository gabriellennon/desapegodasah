import type { Metadata } from "next"
import { StoreLogo } from "@/components/store/store-chrome"

export const metadata: Metadata = {
  title: {
    default: "Administração | Desapego da Sah",
    template: "%s | Desapego da Sah",
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header className="border-b border-border bg-background">
        <div className="storefront-container flex min-h-[76px] items-center justify-between gap-4">
          <StoreLogo />
          <span className="eyebrow text-muted-foreground uppercase">
            Administração
          </span>
        </div>
      </header>
      {children}
    </>
  )
}
