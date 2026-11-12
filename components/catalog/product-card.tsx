import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { formatPrice, type Product } from "@/lib/catalog"

export function ProductCard({
  product,
  eager = false,
}: {
  product: Product
  eager?: boolean
}) {
  return (
    <article>
      <Link
        className="group block w-full text-left"
        href={`/pecas/${product.id}`}
        aria-label={`Ver detalhes de ${product.name}${product.sold ? ", esgotado" : ""}`}
      >
        <div className="relative aspect-3/4 overflow-hidden bg-surface">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover motion-safe:transition-transform motion-safe:duration-550 motion-safe:group-hover:scale-[1.04] ${product.sold ? "opacity-65 saturate-30" : ""}`}
            sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
            loading={eager ? "eager" : "lazy"}
          />
          <span
            className={`absolute top-2 left-2 px-1.5 py-[5px] text-[8px] store-tablet:top-3 store-tablet:left-3 store-tablet:px-2 store-tablet:py-1.5 store-tablet:text-[9px] ${product.sold ? "bg-primary text-primary-foreground" : "bg-background"}`}
          >
            {product.sold
              ? "Já encontrou um lar"
              : product.condition.includes("leves")
                ? "Com história"
                : "Bem conservada"}
          </span>
          <span className="absolute inset-x-3 bottom-3 flex translate-y-[7px] items-center justify-between bg-background p-3 text-[11px] opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 pointer-coarse:left-auto pointer-coarse:translate-y-0 pointer-coarse:p-2 pointer-coarse:text-[0px] pointer-coarse:opacity-100">
            Ver de pertinho <ArrowUpRight size={16} />
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-2 text-[9px] text-muted-foreground store-tablet:mt-3.5 store-tablet:text-[10px]">
          <span>{product.category}</span>
          <span className="size-tag">
            {product.size === "Único" ? "Tam. único" : `Tam. ${product.size}`}
          </span>
        </div>
        <h3 className="mt-1.5 text-xs font-medium store-tablet:text-[13px]">
          {product.name}
        </h3>
        <p className="mt-1.5 text-[11px] store-tablet:text-xs">
          {formatPrice(product.price)}
        </p>
      </Link>
    </article>
  )
}
