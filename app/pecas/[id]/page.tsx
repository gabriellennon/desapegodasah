import type { Metadata } from "next"
import localFont from "next/font/local"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Check, ChevronRight } from "lucide-react"
import { ProductSuggestions } from "@/components/catalog/product-suggestions"
import { StoreFooter, StoreHeader } from "@/components/store/store-chrome"
import {
  ProductActions,
  ProductGallery,
} from "@/components/store/product-interactions"
import { formatPrice } from "@/lib/catalog"
import { getCatalog } from "@/lib/catalog-source"

const productTitleFont = localFont({
  src: "../../../public/fonts/castoro.ttf",
  weight: "400",
  display: "swap",
})

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { products } = await getCatalog()
  const product = products.find((item) => item.id === id)
  if (!product) return {}
  return {
    title: `${product.name} | Desapego da Sah`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const { products, demo } = await getCatalog()
  const product = products.find((item) => item.id === id)
  if (!product) notFound()

  const suggestions = products.filter(
    (item) => item.id !== product.id && !item.sold
  )

  return (
    <>
      <a className="skip-link" href="#produto">
        Ir para os detalhes
      </a>
      <StoreHeader demo={demo} />
      <main id="produto" className="storefront-container pb-16 sm:pb-24">
        <nav
          aria-label="Caminho da página"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 py-5 text-xs text-muted-foreground sm:py-7"
        >
          <Link href="/#pecas" className="hover:underline">
            Catálogo
          </Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span>{product.category}</span>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page" className="text-foreground">
            {product.name}
          </span>
        </nav>
        <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1.14fr)_minmax(0,1fr)] md:gap-12 lg:gap-[clamp(48px,7vw,104px)]">
          <ProductGallery product={product} demo={demo} />
          <section aria-labelledby="product-title" className="min-w-0 md:pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">{product.category}</p>
              <span
                className={`px-2.5 py-1.5 text-[11px] ${product.sold ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
              >
                {product.sold ? "Esgotado" : "Disponível"}
              </span>
            </div>
            <h1
              id="product-title"
              className={`${productTitleFont.className} mt-4 mb-3 text-[35px] leading-[0.98] tracking-[-0.045em]`}
            >
              {product.name}
            </h1>
            <p className="text-xl font-medium tabular-nums">
              {formatPrice(product.price)}
            </p>
            <div className="my-6 flex items-center gap-3 border-y border-border py-4">
              <span className="eyebrow">Tamanho</span>
              <span className="min-w-10 border border-border px-3 py-1.5 text-center text-sm">
                {product.size}
              </span>
            </div>
            <p className="mb-6 max-w-prose text-sm leading-7 text-muted-foreground">
              {product.description}
            </p>
            <ProductActions product={product} products={products} />
            <section
              aria-labelledby="piece-details"
              className="mt-8 border-t border-border pt-6"
            >
              <p className="eyebrow">De pertinho</p>
              <h2
                id="piece-details"
                className="mt-2 mb-4 text-3xl leading-[1.05] tracking-[-0.035em]"
              >
                Detalhes da peça
              </h2>
              <dl className="divide-y divide-border text-sm">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-muted-foreground">Categoria</dt>
                  <dd className="text-right">{product.category}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-muted-foreground">Tamanho</dt>
                  <dd className="text-right">{product.size}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-muted-foreground">Conservação</dt>
                  <dd className="flex items-center gap-1.5 text-right">
                    <Check size={14} className="shrink-0" aria-hidden="true" />
                    {product.condition}
                  </dd>
                </div>
              </dl>
            </section>
          </section>
        </div>
        <Link href="/#pecas" className="storefront-link">
          <ArrowLeft size={16} aria-hidden="true" /> Voltar ao catálogo
        </Link>
        {suggestions.length > 0 && (
          <ProductSuggestions key={product.id} products={suggestions} />
        )}
      </main>
      <StoreFooter />
    </>
  )
}
