import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

function StoreLogo({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      className={cn(
        "block flex-none",
        footer ? "w-[104px]" : "w-24 store-tablet:w-[132px]"
      )}
      href="/"
      aria-label="Desapego da Sah, início"
    >
      <Image
        src="https://emanubucketimages.uk/desapegodasah/desapego_logo_sah.png"
        alt="Logo Desapego da Samara"
        width={487}
        height={365}
        className="h-auto w-full"
        sizes={footer ? "104px" : "(max-width: 650px) 96px, 132px"}
      />
    </Link>
  )
}

export function StoreHeader({
  catalog = false,
  demo = false,
}: {
  catalog?: boolean
  demo?: boolean
}) {
  return (
    <>
      {demo && (
        <div className="bg-primary px-4 py-[7px] text-center text-[9px] tracking-[0.05em] text-primary-foreground store-tablet:py-2 store-tablet:text-[10px]">
          Prévia do catálogo · Fotos, peças e valores demonstrativos
        </div>
      )}
      <header className="storefront-container flex min-h-[88px] items-center justify-between border-b border-border store-tablet:min-h-[110px]">
        <StoreLogo />
        <nav
          aria-label="Navegação principal"
          className="flex gap-[18px] text-[11px] store-tablet:ml-[45px] store-tablet:gap-9 store-tablet:text-xs"
        >
          <Link
            className="relative py-3 aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-0 aria-[current=page]:after:bottom-[3px] aria-[current=page]:after:h-0.5 aria-[current=page]:after:bg-primary"
            aria-current={catalog ? "page" : undefined}
            href="/#pecas"
          >
            As peças
          </Link>
          <Link className="py-3" href="/#sobre">
            O desapego
          </Link>
        </nav>
        <a
          aria-label="Samara Viau no Instagram"
          className="inline-flex items-center gap-[9px] text-[11px]"
          href="https://www.instagram.com/samaraviau/"
          target="_blank"
          rel="noreferrer"
        >
          <Image src="/images/instagram.png" alt="" width={18} height={18} />
          <span className="hidden store-tablet:inline">@samaraviau</span>
          <ArrowUpRight
            size={14}
            className="hidden store-tablet:block"
            aria-hidden="true"
          />
        </a>
      </header>
    </>
  )
}

export function StoreFooter() {
  return (
    <footer className="storefront-container flex flex-wrap items-center justify-between gap-[23px] py-7 store-tablet:flex-nowrap store-tablet:gap-[25px] store-tablet:py-9">
      <StoreLogo footer />
      <p className="font-heading text-[17px] italic store-tablet:text-xl">
        Peças que seguem. Histórias que ficam.
      </p>
      <span className="w-full border-t border-border pt-4 text-[9px] text-muted-foreground store-tablet:w-auto store-tablet:border-0 store-tablet:pt-0">
        © {new Date().getFullYear()} Desapego da Sah
      </span>
    </footer>
  )
}
