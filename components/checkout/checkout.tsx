"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight, ChevronRight, LockKeyhole } from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react"
import { StoreLogo } from "@/components/store/store-chrome"
import { Button } from "@/components/ui/button"
import {
  emptyCart,
  parseCart,
  readCart,
  saveCart,
  subscribeCart,
} from "@/lib/cart"
import type { Product } from "@/lib/catalog"
import { digits, validTaxId } from "@/lib/checkout/types"
import type {
  Address,
  Contact,
  PaymentMethod,
  PaymentSession,
  PaymentView,
  ShippingQuote,
} from "@/lib/checkout/types"
import type { CardCheckout } from "./card-fields"
import { AddressStep } from "./address-step"
import { ContactStep } from "./contact-step"
import { PaymentStep } from "./payment-step"
import { StepTitle } from "./fields"
import { PaymentResult } from "./payment-result"

const steps = ["Dados", "Endereço", "Pagamento"]
const initialContact: Contact = {
  name: "",
  taxId: "",
  email: "",
  cellphone: "",
}
const initialAddress: Address = {
  zipCode: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
  complement: "",
}
const sessionKey = "desapego-da-sah:checkout"

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
  }
}

async function post<T>(path: string, body: object): Promise<T> {
  const response = await fetch("/api/checkout/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await response.json()
  if (!response.ok)
    throw new ApiError(
      data.error ?? "Não foi possível continuar.",
      response.status
    )
  return data
}

function savedSession(): PaymentSession | null {
  try {
    const data: PaymentSession = JSON.parse(
      sessionStorage.getItem(sessionKey) ?? "null"
    )
    if (
      data &&
      typeof data.id === "string" &&
      typeof data.access === "string" &&
      Array.isArray(data.productIds) &&
      typeof data.fromCart === "boolean"
    )
      return data
  } catch {
    // The current tab can still continue without persistence.
  }
  return null
}

function persistSession(value: PaymentSession | null) {
  try {
    if (value) sessionStorage.setItem(sessionKey, JSON.stringify(value))
    else sessionStorage.removeItem(sessionKey)
  } catch {
    // The in-memory session remains available until navigation.
  }
}

function makeSession(productIds: string[], fromCart: boolean): PaymentSession {
  const access = Array.from(
    crypto.getRandomValues(new Uint8Array(32)),
    (byte) => byte.toString(16).padStart(2, "0")
  ).join("")
  return { id: crypto.randomUUID(), access, productIds, fromCart }
}

export function Checkout({
  products,
  singleId,
  configured,
  publicKey,
  installmentLimit,
}: {
  products: Product[]
  singleId?: string
  configured: boolean
  publicKey?: string
  installmentLimit: number
}) {
  const snapshot = useSyncExternalStore(
    subscribeCart,
    readCart,
    () => emptyCart
  )
  const ready = useSyncExternalStore(
    subscribeCart,
    () => true,
    () => false
  )
  const ids = singleId ? [singleId] : parseCart(snapshot)
  const selected = products.filter(
    (product) => ids.includes(product.id) && !product.sold
  )
  const canBuy = ids.length > 0 && selected.length === ids.length
  const [step, setStep] = useState(0)
  const [contact, setContact] = useState(initialContact)
  const [address, setAddress] = useState(initialAddress)
  const [cepStatus, setCepStatus] = useState<
    "idle" | "loading" | "manual" | "not-found"
  >("idle")
  const [quote, setQuote] = useState<ShippingQuote | null>(null)
  const [shippingId, setShippingId] = useState("")
  const [method, setMethod] = useState<PaymentMethod>("PIX")
  const [installments, setInstallments] = useState(1)
  const [cardValid, setCardValid] = useState(false)
  const [payment, setPayment] = useState<PaymentView | null>(null)
  const [session, setSession] = useState<PaymentSession | null>(null)
  const [restored, setRestored] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const card = useRef<CardCheckout | null>(null)
  const submitting = useRef(false)
  const cepRequest = useRef<AbortController | null>(null)

  const shipping = quote?.options.find((option) => option.id === shippingId)
  const total = (quote?.subtotal ?? 0) + (shipping?.price ?? 0)

  useEffect(() => {
    let active = true
    const previous = savedSession()
    if (!previous) {
      queueMicrotask(() => {
        if (active) setRestored(true)
      })
      return () => {
        active = false
      }
    }
    void post<PaymentView>("status", previous)
      .then((result) => {
        if (!active) return
        setSession(previous)
        setPayment(result)
        setRestored(true)
      })
      .catch((failure: unknown) => {
        if (!active) return
        if (failure instanceof ApiError && failure.status === 404)
          persistSession(null)
        else {
          setSession(previous)
          setError(
            "Não foi possível consultar seu pedido. Verifique o pagamento antes de tentar de novo."
          )
        }
        setRestored(true)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (
      !session ||
      (payment?.status !== "creating" && payment?.status !== "pending")
    )
      return
    let active = true
    let timer: ReturnType<typeof setTimeout>
    async function poll() {
      try {
        const result = await post<PaymentView>("status", session!)
        if (active) setPayment(result)
      } catch {
        // Manual verification remains available.
      }
      if (active) timer = setTimeout(poll, 9000)
    }
    timer = setTimeout(poll, 9000)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [session, payment?.status])

  useEffect(() => {
    if (payment?.status === "paid" && session?.fromCart) {
      saveCart(
        parseCart(readCart()).filter((id) => !session.productIds.includes(id))
      )
    }
  }, [payment?.status, session])

  useEffect(() => {
    return () => {
      cepRequest.current?.abort()
      cepRequest.current = null
    }
  }, [])

  function move(next: number) {
    setStep(next)
    setError("")
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  function updateAddress(name: keyof Address, value: string) {
    if (name !== "zipCode") {
      setAddress((current) => ({ ...current, [name]: value }))
      return
    }

    const isCep = /^\d{5}-?\d{3}$/.test(value)
    const cep = digits(value)
    if (
      isCep &&
      /^\d{5}-?\d{3}$/.test(address.zipCode) &&
      cep === digits(address.zipCode)
    ) {
      setAddress((current) => ({ ...current, zipCode: value }))
      return
    }

    cepRequest.current?.abort()
    cepRequest.current = null
    setCepStatus("idle")
    setQuote(null)
    setShippingId("")
    setError("")
    setAddress({ ...initialAddress, zipCode: value })
    if (isCep) void fillAddress(cep)
  }

  async function fillAddress(cep: string) {
    const controller = new AbortController()
    cepRequest.current = controller
    setCepStatus("loading")

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]),
      })
      const data = await response.json()
      if (cepRequest.current !== controller) return
      if (response.ok && (data.erro === true || data.erro === "true")) {
        setCepStatus("not-found")
        return
      }
      if (
        !response.ok ||
        typeof data.cep !== "string" ||
        digits(data.cep) !== cep ||
        !data.uf ||
        !data.localidade
      ) {
        setCepStatus("manual")
        return
      }

      setAddress((current) => ({
        ...current,
        street: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
      }))
      setCepStatus("idle")
    } catch {
      if (cepRequest.current === controller) setCepStatus("manual")
    } finally {
      if (cepRequest.current === controller) cepRequest.current = null
    }
  }

  async function checkPayment() {
    if (!session || busy) return
    setBusy(true)
    setError("")
    try {
      setPayment(await post<PaymentView>("status", session))
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 404) {
        persistSession(null)
        setSession(null)
      }
      setError(
        "Não foi possível consultar o pedido. Confira antes de tentar outro pagamento."
      )
    } finally {
      setBusy(false)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current || !canBuy || session) return
    if (step === 1 && (cepRequest.current || cepStatus === "not-found")) return
    setError("")
    if (step === 0) {
      if (
        !validTaxId(contact.taxId) ||
        ![10, 11].includes(digits(contact.cellphone).length)
      ) {
        setError("Confira o CPF/CNPJ e o telefone com DDD.")
        return
      }
      move(1)
      return
    }

    if (!configured) return
    submitting.current = true
    setBusy(true)
    let attempt: PaymentSession | null = null
    try {
      if (step === 1) {
        const result = await post<ShippingQuote>("shipping", {
          productIds: ids,
          zipCode: address.zipCode,
        })
        setQuote(result)
        setShippingId(result.options[0].id)
        setInstallments(1)
        move(2)
        return
      }
      if (!shipping || !quote) return
      let cardToken: string | undefined
      if (method === "CARD") {
        if (!card.current || !cardValid) return
        try {
          cardToken = (await card.current.tokenize(contact)).token
        } catch {
          throw new Error(
            "Não foi possível validar o cartão. Confira os dados e a confirmação do banco."
          )
        }
      }
      attempt = makeSession(ids, !singleId)
      setSession(attempt)
      persistSession(attempt)
      const result = await post<PaymentView>("payment", {
        ...attempt,
        contact,
        address,
        quoteToken: quote.token,
        shippingId,
        method,
        installments,
        cardToken,
      })
      setPayment(result)
      window.scrollTo({ top: 0, behavior: "instant" })
    } catch (failure) {
      if (
        attempt &&
        failure instanceof ApiError &&
        [400, 403, 409, 413].includes(failure.status)
      ) {
        persistSession(null)
        setSession(null)
        if (failure.status === 409) move(1)
      }
      setError(
        failure instanceof Error
          ? failure.message
          : "Não foi possível continuar. Tente novamente."
      )
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  function retry() {
    persistSession(null)
    setSession(null)
    setPayment(null)
    setQuote(null)
    setShippingId("")
    setCopied(false)
    move(contact.name ? 1 : 0)
  }

  async function copyPix() {
    if (!payment?.pixCode) return
    try {
      await navigator.clipboard.writeText(payment.pixCode)
      setCopied(true)
    } catch {
      setError("Selecione o código Pix para copiá-lo.")
    }
  }

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-[640px] flex-col">
        <header className="mx-5 flex min-h-[76px] items-center gap-4 border-b border-border sm:mx-10 sm:min-h-[88px] sm:gap-5">
          <StoreLogo />
          <span className="h-6 w-px bg-border" aria-hidden="true" />
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <LockKeyhole className="size-4 shrink-0" aria-hidden="true" />
            Compra segura
          </span>
        </header>

        <form className="flex flex-1 flex-col" onSubmit={submit}>
          <div className="flex-1 px-5 pt-6 pb-10 sm:px-10 sm:pt-9 sm:pb-12">
            {!restored || !ready ? (
              <p role="status">Carregando checkout…</p>
            ) : payment ? (
              <PaymentResult
                payment={payment}
                retry={retry}
                check={checkPayment}
                copy={copyPix}
                copied={copied}
                busy={busy}
                clear={() => persistSession(null)}
              />
            ) : session && !busy ? (
              <div className="space-y-4 py-8">
                <StepTitle>Verifique seu pagamento</StepTitle>
                <Button
                  type="button"
                  className="h-11 px-5"
                  onClick={checkPayment}
                >
                  Consultar pedido
                </Button>
              </div>
            ) : !canBuy && !busy ? (
              <div className="space-y-4 py-8">
                <StepTitle>
                  {ids.length ? "Revise suas peças" : "Seu carrinho está vazio"}
                </StepTitle>
                {ids.length > 0 && (
                  <p>
                    Uma peça ficou indisponível. Volte ao catálogo para revisar
                    o carrinho.
                  </p>
                )}
                <Button asChild className="h-11 px-5">
                  <Link href="/#pecas">Voltar ao catálogo</Link>
                </Button>
              </div>
            ) : (
              <>
                <nav aria-label="Etapas do checkout" className="mb-8 sm:mb-9">
                  <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:gap-3 sm:text-sm">
                    {steps.map((label, index) => (
                      <li
                        key={label}
                        className="flex items-center gap-2 sm:gap-4"
                      >
                        {index > 0 && (
                          <ChevronRight className="size-4" aria-hidden="true" />
                        )}
                        {index < step ? (
                          <button
                            type="button"
                            disabled={busy}
                            className="hover:underline"
                            onClick={() => move(index)}
                          >
                            {label}
                          </button>
                        ) : (
                          <span
                            aria-current={index === step ? "step" : undefined}
                            className={
                              index === step
                                ? "font-semibold text-foreground"
                                : undefined
                            }
                          >
                            {label}
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
                {!configured && (
                  <p
                    role="status"
                    className="mb-6 rounded-lg bg-surface p-3 text-sm text-foreground"
                  >
                    Checkout indisponível no momento.
                  </p>
                )}
                {step === 0 && (
                  <ContactStep contact={contact} onChange={setContact} />
                )}
                {step === 1 && (
                  <AddressStep
                    address={address}
                    onChange={updateAddress}
                    cepStatus={cepStatus}
                    quoting={busy}
                  />
                )}
                {step === 2 && quote && shipping && (
                  <PaymentStep
                    quote={quote}
                    shipping={shipping}
                    total={total}
                    products={selected}
                    method={method}
                    installments={installments}
                    installmentLimit={installmentLimit}
                    busy={busy}
                    publicKey={publicKey}
                    cardRef={card}
                    onShippingChange={(id) => {
                      if (id === shippingId) return
                      const next = quote.options.find(
                        (option) => option.id === id
                      )
                      if (next?.price !== shipping.price) setCardValid(false)
                      setShippingId(id)
                      setInstallments(1)
                    }}
                    onMethodChange={(value) => {
                      setMethod(value)
                      setCardValid(false)
                    }}
                    onInstallmentsChange={setInstallments}
                    onCardValidityChange={setCardValid}
                  />
                )}
              </>
            )}
            {error && (
              <p role="alert" className="mt-5 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          {restored && ready && canBuy && !payment && (!session || busy) && (
            <footer className="sticky bottom-0 z-10 border-t border-border bg-background px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-10">
              <Button
                type="submit"
                disabled={
                  busy ||
                  (step > 0 && !configured) ||
                  (step === 1 &&
                    (cepStatus === "not-found" || cepStatus === "loading")) ||
                  (step === 2 && method === "CARD" && !cardValid)
                }
                variant={
                  step === 2 && method === "PIX" ? "secondary" : "default"
                }
                className="h-12 w-full gap-3 rounded-sm text-sm"
              >
                {busy
                  ? "Aguarde…"
                  : step < 2
                    ? "Continuar"
                    : method === "PIX"
                      ? "Gerar Pix"
                      : "Pagar com cartão"}{" "}
                <ArrowRight aria-hidden="true" />
              </Button>
              {step > 0 && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => move(step - 1)}
                  className="mx-auto mt-2 flex min-h-8 items-center gap-2 text-sm text-muted-foreground"
                >
                  <ArrowLeft size={14} aria-hidden="true" /> Voltar
                </button>
              )}
            </footer>
          )}
        </form>
      </div>
    </main>
  )
}
