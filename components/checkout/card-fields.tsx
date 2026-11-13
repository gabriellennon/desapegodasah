"use client"

import Script from "next/script"
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react"
import { Skeleton } from "@/components/ui/skeleton"
import type { Contact } from "@/lib/checkout/types"

export type CardCheckout = {
  mount: (target: HTMLElement) => Promise<void>
  destroy: () => void
  tokenize: (contact: Contact) => Promise<{ token: string }>
}

type CardSDK = {
  create: (options: {
    publicKey: string
    amount: number
    locale: "pt"
    icons: boolean
    theme: {
      fonts: string[]
      styles: Record<string, CSSProperties>
    }
    onCardChange: (state: { canTokenize: boolean }) => void
  }) => CardCheckout
}

declare global {
  interface Window {
    AbacatePay?: CardSDK
  }
}

export function CardFields({
  amount,
  publicKey,
  checkoutRef,
  setValid,
}: {
  amount: number
  publicKey: string
  checkoutRef: RefObject<CardCheckout | null>
  setValid: (valid: boolean) => void
}) {
  const host = useRef<HTMLDivElement>(null)
  const [scriptReady, setScriptReady] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState(false)

  const loading = !mounted && !error

  useEffect(() => {
    if (!scriptReady || !host.current || !window.AbacatePay) return
    let active = true
    let ready = false
    let canSubmit = false
    let instance: CardCheckout | undefined
    // A separate target keeps an old asynchronous mount away from a new one.
    const target = document.createElement("div")
    host.current.append(target)
    try {
      const tokens = getComputedStyle(document.documentElement)
      const color = tokens.getPropertyValue("--foreground").trim()
      const backgroundColor = tokens.getPropertyValue("--background").trim()
      const borderColor = tokens.getPropertyValue("--border").trim()
      const fontFamily = '"DM Sans", sans-serif'
      instance = window.AbacatePay.create({
        publicKey,
        amount,
        locale: "pt",
        icons: true,
        theme: {
          fonts: [
            "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap",
          ],
          styles: {
            label: { color, fontFamily, fontSize: "14px" },
            input: {
              color,
              fontFamily,
              fontSize: "16px",
              backgroundColor,
              borderColor,
              borderRadius: "4px",
              minHeight: "48px",
            },
            "input:focus": { borderColor: color, outlineColor: color },
            "input::placeholder": {
              color: tokens.getPropertyValue("--muted-foreground").trim(),
            },
          },
        },
        onCardChange: ({ canTokenize }) => {
          canSubmit = canTokenize
          if (active && ready) setValid(canSubmit)
        },
      })
      checkoutRef.current = instance
      const current = instance
      void current
        .mount(target)
        .then(() => {
          if (!active) return
          ready = true
          setMounted(true)
          setValid(canSubmit)
        })
        .catch(() => {
          if (active) setError(true)
        })
    } catch {
      // React state changes are deferred to avoid an extra synchronous render.
      queueMicrotask(() => {
        if (active) setError(true)
      })
    }
    return () => {
      active = false
      checkoutRef.current = null
      setValid(false)
      instance?.destroy()
      target.remove()
    }
  }, [amount, checkoutRef, publicKey, scriptReady, setValid])

  return (
    <div>
      <Script
        src="https://abacatepay.com/abacatepay.js"
        onReady={() => {
          if (window.AbacatePay) setScriptReady(true)
          else setError(true)
        }}
        onError={() => setError(true)}
      />
      <span role="status" className="sr-only">
        {loading ? "Carregando formulário de cartão…" : ""}
      </span>
      <div aria-busy={loading}>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            O formulário de cartão está indisponível. Selecione Pix ou
            recarregue a página.
          </p>
        )}
        <div className="relative">
          {loading && (
            <div className="space-y-4" aria-hidden="true">
              <Skeleton className="h-12 rounded-sm bg-surface" />
              <Skeleton className="h-12 rounded-sm bg-surface" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-12 rounded-sm bg-surface" />
                <Skeleton className="h-12 rounded-sm bg-surface" />
              </div>
            </div>
          )}
          <div
            ref={host}
            inert={!mounted || error}
            className={
              !mounted || error
                ? "invisible absolute inset-x-0 top-0"
                : undefined
            }
          />
        </div>
      </div>
    </div>
  )
}
