"use client"

import Image from "next/image"
import { useRef, useState, useSyncExternalStore } from "react"
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Share2,
  ShoppingBag,
  X,
} from "lucide-react"
import { Dialog } from "radix-ui"
import { Button } from "@/components/ui/button"
import { formatPrice, type Product } from "@/lib/catalog"

const cartKey = "desapego-da-sah:cart"
const cartEvent = "desapego-da-sah:cart-change"
const emptyCart = "[]"
let cartFallback = emptyCart

function readCart() {
  try {
    return localStorage.getItem(cartKey) ?? emptyCart
  } catch {
    return cartFallback
  }
}

function subscribeCart(update: () => void) {
  window.addEventListener("storage", update)
  window.addEventListener(cartEvent, update)
  return () => {
    window.removeEventListener("storage", update)
    window.removeEventListener(cartEvent, update)
  }
}

function parseCart(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed)
      ? [
          ...new Set(
            parsed.filter((id): id is string => typeof id === "string")
          ),
        ]
      : []
  } catch {
    return []
  }
}

function saveCart(ids: string[]) {
  cartFallback = JSON.stringify(ids)
  try {
    localStorage.setItem(cartKey, cartFallback)
  } catch {
    // Keep the preview usable in browsers that block storage.
  }
  window.dispatchEvent(new Event(cartEvent))
}

export function ProductGallery({
  product,
  demo,
}: {
  product: Product
  demo: boolean
}) {
  const [active, setActive] = useState(0)
  const photos = [
    { src: product.image, label: "Vista geral", zoom: false },
    ...(product.photos?.length
      ? product.photos.map((photo) => ({ ...photo, zoom: false }))
      : [{ src: product.image, label: "Ampliação da foto", zoom: true }]),
  ]
  const current = photos[active]
  function move(step: number) {
    setActive((index) => (index + step + photos.length) % photos.length)
  }

  return (
    <section aria-label="Galeria do produto" className="min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface)] sm:max-h-[70vh]">
        <Image
          src={current.src}
          alt={`${product.name} · ${current.label}`}
          fill
          sizes="(max-width: 767px) 95vw, 54vw"
          className={`object-cover motion-safe:transition-transform motion-safe:duration-300 ${current.zoom ? "scale-150" : ""}`}
        />
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 rounded-full bg-background"
            onClick={() => move(-1)}
            aria-label="Imagem anterior"
          >
            <ChevronLeft />
          </Button>
          <span
            className="bg-background px-3 py-1.5 text-xs tabular-nums"
            aria-live="polite"
          >
            {active + 1} / {photos.length}{" "}
            <span className="sr-only">{current.label}</span>
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 rounded-full bg-background"
            onClick={() => move(1)}
            aria-label="Próxima imagem"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {photos.map((photo, index) => (
          <Button
            key={index}
            type="button"
            variant="outline"
            aria-pressed={index === active}
            aria-label={photo.label}
            onClick={() => setActive(index)}
            className="relative h-[74px] w-[62px] overflow-hidden rounded-none border-border p-0 aria-pressed:border-primary aria-pressed:ring-1 aria-pressed:ring-primary"
          >
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="62px"
              className={`object-cover ${photo.zoom ? "scale-150" : ""}`}
            />
          </Button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {current.label}
        {demo && " · Fotografia demonstrativa"}
      </p>
    </section>
  )
}

export function ProductActions({
  product,
  products,
}: {
  product: Product
  products: Product[]
}) {
  return <StoreActions product={product} products={products} />
}

export function CatalogCart({ products }: { products: Product[] }) {
  return <StoreActions products={products} />
}

function StoreActions({
  product,
  products,
}: {
  product?: Product
  products: Product[]
}) {
  const snapshot = useSyncExternalStore(
    subscribeCart,
    readCart,
    () => emptyCart
  )
  const cart = parseCart(snapshot)
  const cartProducts = products.filter(
    (item) => cart.includes(item.id) && !item.sold
  )
  const [panel, setPanel] = useState<
    "cart" | "checkout" | "buy" | "share" | null
  >(null)
  const [shareUrl, setShareUrl] = useState("")
  const [feedback, setFeedback] = useState("")
  const returnFocus = useRef<HTMLElement | null>(null)
  const items = panel === "buy" && product ? [product] : cartProducts

  function openPanel(next: NonNullable<typeof panel>) {
    returnFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    setPanel(next)
  }

  function addToCart(id: string) {
    saveCart([...new Set([...parseCart(readCart()), id])])
    openPanel("cart")
  }

  async function share(title: string) {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setFeedback("Link copiado.")
    } catch {
      setShareUrl(url)
      openPanel("share")
    }
  }

  return (
    <>
      {product ? (
        <>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-none border-primary px-3 text-xs hover:bg-secondary"
              onClick={() => addToCart(product.id)}
              disabled={product.sold}
            >
              <ShoppingBag /> Adicionar ao carrinho
            </Button>
            <Button
              type="button"
              className="h-12 rounded-none px-3 text-xs hover:bg-secondary hover:text-foreground"
              onClick={() => openPanel("buy")}
              disabled={product.sold}
            >
              Comprar agora <ArrowRight />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              className="h-11 px-2"
              onClick={() => openPanel("cart")}
              aria-haspopup="dialog"
            >
              <ShoppingBag /> Carrinho ({cartProducts.length})
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 px-2"
              onClick={() => share(product.name)}
            >
              <Share2 /> Compartilhar
            </Button>
          </div>
          <p aria-live="polite" className="text-xs text-muted-foreground">
            {feedback}
          </p>
        </>
      ) : cartProducts.length > 0 ? (
        <Button
          type="button"
          className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 h-12 gap-2 rounded-full px-4 text-sm shadow-lg sm:right-6"
          onClick={() => openPanel("cart")}
          aria-haspopup="dialog"
        >
          <ShoppingBag aria-hidden="true" />
          Carrinho ({cartProducts.length})
        </Button>
      ) : null}
      <Dialog.Root
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) setPanel(null)
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-[#281914]/55 backdrop-blur-[2px]" />
          <Dialog.Content
            onCloseAutoFocus={(event) => {
              if (returnFocus.current?.isConnected) {
                event.preventDefault()
                returnFocus.current.focus()
              }
            }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto bg-background p-6 shadow-xl sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:max-h-none sm:w-full sm:max-w-md sm:p-8"
          >
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute top-5 right-5 size-10 rounded-full"
                aria-label="Fechar"
              >
                <X />
              </Button>
            </Dialog.Close>
            <p className="eyebrow">Desapego da Sah</p>
            <Dialog.Title className="mt-3 pr-12 font-heading text-4xl leading-none">
              {panel === "share"
                ? "Compartilhar peça"
                : panel === "buy" || panel === "checkout"
                  ? "Resumo da compra"
                  : "Seu carrinho"}
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-sm leading-6 text-muted-foreground">
              {panel === "share"
                ? "Selecione e copie o link da peça."
                : "Prévia do catálogo. Os pagamentos serão disponibilizados depois."}
            </Dialog.Description>
            {panel === "share" ? (
              <input
                aria-label="Link da peça"
                className="mt-5 w-full border border-border bg-background p-3 text-sm"
                value={shareUrl}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
              />
            ) : (
              <>
                {items.length ? (
                  <ul className="mt-5 divide-y divide-border border-y border-border">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 py-4"
                      >
                        <div className="relative h-16 w-12 shrink-0 overflow-hidden">
                          <Image
                            src={item.image}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Tam. {item.size}
                          </p>
                          <p className="mt-1 text-sm">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        {panel === "cart" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-10"
                            aria-label={`Remover ${item.name}`}
                            onClick={() =>
                              saveCart(
                                parseCart(readCart()).filter(
                                  (id) => id !== item.id
                                )
                              )
                            }
                          >
                            <X />
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="my-6 text-sm">Seu carrinho está vazio.</p>
                )}
                {items.length > 0 && (
                  <p className="mt-5 flex justify-between gap-3 text-sm font-medium">
                    <span>Subtotal</span>
                    <span>
                      {formatPrice(
                        items.reduce((sum, item) => sum + item.price, 0)
                      )}
                    </span>
                  </p>
                )}
                <div className="mt-6 grid gap-2.5">
                  {(panel === "cart" || panel === "checkout") && (
                    <Button
                      type="button"
                      className="h-11 w-full rounded-none"
                      disabled={panel === "cart" && items.length === 0}
                      onClick={() =>
                        setPanel(panel === "cart" ? "checkout" : "cart")
                      }
                    >
                      {panel === "cart"
                        ? "Finalizar compra"
                        : "Voltar ao carrinho"}
                    </Button>
                  )}
                  <Dialog.Close asChild>
                    <Button
                      type="button"
                      variant={panel === "buy" ? "default" : "outline"}
                      className="h-11 w-full rounded-none"
                    >
                      Continuar explorando
                    </Button>
                  </Dialog.Close>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
