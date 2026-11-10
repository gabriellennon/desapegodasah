import Link from "next/link"
import { ArrowUpRight, Camera } from "lucide-react"

export function StoreHeader({ catalog = false }: { catalog?: boolean }) {
  return (
    <>
      <div className="preview-notice">
        Prévia do catálogo · Fotos, peças e valores demonstrativos
      </div>
      <header className="site-header container">
        <Link
          className="wordmark"
          href="/"
          aria-label="Desapego da Sah, início"
        >
          desapego
          <span>
            da sah<span className="wordmark-dot">.</span>
          </span>
        </Link>
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
          <Camera size={18} />
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
      <Link className="wordmark" href="/">
        desapego<span>da sah.</span>
      </Link>
      <p>Peças que seguem. Histórias que ficam.</p>
      <span>© {new Date().getFullYear()} Desapego da Sah</span>
    </footer>
  )
}
