import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { useId, useState } from "react"
import { formatPrice, type Product } from "@/lib/catalog"
import type { CheckoutItem } from "@/lib/checkout/types"

export function OrderSummary({
  products,
  items,
}: {
  products: Product[]
  items: CheckoutItem[]
}) {
  const [expanded, setExpanded] = useState(false)
  const itemsId = useId()

  return (
    <div className="rounded-sm border border-border bg-background">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={itemsId}
        className="group flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left font-medium focus-visible:outline-offset-[-3px]"
        onClick={() => setExpanded(!expanded)}
      >
        Resumo da compra
        <ChevronDown
          aria-hidden="true"
          className="size-4 transition-transform duration-300 group-aria-expanded:rotate-180"
        />
      </button>
      <div
        id={itemsId}
        inert={!expanded}
        data-expanded={expanded}
        className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-300 ease-out data-[expanded=true]:grid-rows-[1fr] data-[expanded=true]:opacity-100"
      >
        <div className="min-h-0 overflow-hidden px-4">
          <ul className="divide-y divide-border border-t border-border">
            {products.map((product) => {
              const item = items.find(({ id }) => id === product.id)
              return (
                <li key={product.id} className="flex items-center gap-4 py-4">
                  <div className="relative h-20 w-15 shrink-0 overflow-hidden bg-surface">
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      sizes="60px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading text-2xl leading-tight wrap-break-word">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tam. {product.size}
                    </p>
                    <p className="mt-1 text-sm">
                      {formatPrice(item ? item.price / 100 : product.price)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
