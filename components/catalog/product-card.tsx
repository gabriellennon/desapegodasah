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
    <article className={`product-card ${product.sold ? "is-sold" : ""}`}>
      <Link
        className="product-link"
        href={`/pecas/${product.id}`}
        aria-label={`Ver detalhes de ${product.name}${product.sold ? ", esgotado" : ""}`}
      >
        <div className="product-image">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
            loading={eager ? "eager" : "lazy"}
          />
          <span className={`product-tag ${product.sold ? "tag-sold" : ""}`}>
            {product.sold
              ? "Já encontrou um lar"
              : product.condition.includes("leves")
                ? "Com história"
                : "Bem conservada"}
          </span>
          <span className="product-peek">
            Ver de pertinho <ArrowUpRight size={16} />
          </span>
        </div>
        <div className="product-caption">
          <span>{product.category}</span>
          <span className="size-tag">
            {product.size === "Único" ? "Tam. único" : `Tam. ${product.size}`}
          </span>
        </div>
        <h3>{product.name}</h3>
        <p className="product-price">{formatPrice(product.price)}</p>
      </Link>
    </article>
  )
}
