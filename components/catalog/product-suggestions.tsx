"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/catalog/product-card"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/catalog"

export function ProductSuggestions({ products }: { products: Product[] }) {
  const track = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ previous: false, next: false })

  useEffect(() => {
    const list = track.current
    if (!list) return

    const update = () => {
      const previous = list.scrollLeft > 1
      const next = list.scrollLeft + list.clientWidth < list.scrollWidth - 1
      setEdges((current) =>
        current.previous === previous && current.next === next
          ? current
          : { previous, next }
      )
    }

    const observer = new ResizeObserver(update)
    observer.observe(list)
    list.addEventListener("scroll", update, { passive: true })
    return () => {
      observer.disconnect()
      list.removeEventListener("scroll", update)
    }
  }, [products.length])

  function scroll(direction: -1 | 1) {
    const list = track.current
    if (!list || list.children.length < 2) return
    const [first, second] = Array.from(list.children)
    const distance =
      second.getBoundingClientRect().left - first.getBoundingClientRect().left
    list.scrollBy({
      left: distance * direction,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    })
  }

  return (
    <section
      aria-labelledby="product-suggestions-title"
      className="mt-12 border-t border-border pt-8 sm:mt-16 sm:pt-10"
    >
      <div className="mb-5 flex items-center justify-between gap-3 sm:mb-7">
        <h2
          id="product-suggestions-title"
          className="text-[clamp(1.75rem,4vw,2.65rem)]!"
        >
          Você também pode gostar
        </h2>
        {(edges.previous || edges.next) && (
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 rounded-full"
              aria-label="Peças anteriores"
              aria-controls="product-suggestions-list"
              disabled={!edges.previous}
              onClick={() => scroll(-1)}
            >
              <ArrowLeft aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 rounded-full"
              aria-label="Próximas peças"
              aria-controls="product-suggestions-list"
              disabled={!edges.next}
              onClick={() => scroll(1)}
            >
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
      <ul
        ref={track}
        id="product-suggestions-list"
        className="grid snap-x snap-mandatory [scrollbar-width:none] auto-cols-[calc((100%_-_0.75rem)/2)] grid-flow-col gap-3 overflow-x-auto p-1 min-[651px]:auto-cols-[calc((100%_-_2rem)/3)] min-[651px]:gap-4 min-[1001px]:auto-cols-[calc((100%_-_3.75rem)/4)] min-[1001px]:gap-5"
      >
        {products.map((product) => (
          <li key={product.id} className="min-w-0 snap-start">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}
