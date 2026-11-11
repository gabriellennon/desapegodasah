import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

function StoreLogo() {
  return (
    <Link className="wordmark" href="/" aria-label="Desapego da Sah, início">
      <Image
        src="https://emanubucketimages.uk/desapegodasah/desapego_logo_sah.png"
        alt="Logo Desapego da Samara"
        width={487}
        height={365}
        sizes="(max-width: 650px) 96px, 132px"
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
        <div className="preview-notice">
          Prévia do catálogo · Fotos, peças e valores demonstrativos
        </div>
      )}
      <header className="site-header container">
        <StoreLogo />
        <nav aria-label="Navegação principal">
          <Link className={catalog ? "nav-active" : undefined} href="/#pecas">
            As peças
          </Link>
          <Link href="/#sobre">O desapego</Link>
        </nav>
        <a
          aria-label="Samara Viau no Instagram"
          className="social-link"
          href="https://www.instagram.com/samaraviau/"
          target="_blank"
          rel="noreferrer"
        >
          <Image src="/images/instagram.png" alt="" width={18} height={18} />
          <span>@samaraviau</span>
          <ArrowUpRight size={14} />
        </a>
      </header>
    </>
  )
}

export function StoreFooter() {
  return (
    <footer className="site-footer container">
      <StoreLogo />
      <p>Peças que seguem. Histórias que ficam.</p>
      <span>© {new Date().getFullYear()} Desapego da Sah</span>
    </footer>
  )
}
