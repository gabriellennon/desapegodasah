import Image from "next/image"
import { ChevronDown, Truck, X } from "lucide-react"
import { Dialog } from "radix-ui"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/catalog"
import type { ShippingQuote } from "@/lib/checkout/types"

type Option = ShippingQuote["options"][number]

function ShippingDetails({ option }: { option: Option }) {
  return (
    <>
      <span className="relative flex size-10 shrink-0 items-center justify-center rounded-sm bg-background text-muted-foreground">
        {option.carrierLogo ? (
          <Image
            src={option.carrierLogo}
            alt=""
            fill
            sizes="40px"
            className="object-contain p-1"
          />
        ) : (
          <Truck className="size-4" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block font-medium">
          {option.carrier === option.name
            ? option.carrier
            : `${option.carrier} · ${option.name}`}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {option.days === 0
            ? "Entrega no mesmo dia"
            : `Até ${option.days} ${option.days === 1 ? "dia útil" : "dias úteis"}`}
        </span>
      </span>
      <span className="shrink-0 font-semibold tabular-nums">
        {formatPrice(option.price / 100)}
      </span>
    </>
  )
}

export function ShippingPicker({
  options,
  selected,
  disabled,
  onChange,
}: {
  options: ShippingQuote["options"]
  selected: Option
  disabled: boolean
  onChange: (id: string) => void
}) {
  const [draft, setDraft] = useState(selected.id)

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (open) setDraft(selected.id)
      }}
    >
      <p className="mb-2 font-medium">Entrega</p>
      <Dialog.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label="Alterar opção de entrega"
          disabled={disabled}
          className="h-auto w-full justify-start gap-2.5 rounded-sm p-3 text-sm whitespace-normal"
        >
          <ShippingDetails option={selected} />
          <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-primary/45 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto grid max-h-[85dvh] max-w-[640px] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-t-lg border border-border bg-background px-4 pt-5 pb-[max(20px,env(safe-area-inset-bottom))] duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Dialog.Title className="font-heading text-3xl leading-none">
              Opções de entrega
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9"
                aria-label="Fechar opções de entrega"
              >
                <X aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Selecione uma opção e confirme para atualizar o frete.
          </Dialog.Description>
          <div className="min-h-0 overflow-y-auto overscroll-contain p-1">
            <fieldset className="min-w-0 space-y-2">
              <legend className="sr-only">Serviços de entrega</legend>
              {options.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-sm border border-border p-3 text-sm transition-colors has-checked:border-primary has-checked:bg-secondary/50 has-focus-visible:ring-2 has-focus-visible:ring-primary sm:gap-3"
                >
                  <input
                    type="radio"
                    name="delivery-option"
                    checked={draft === option.id}
                    onChange={() => setDraft(option.id)}
                    className="size-4 shrink-0 accent-primary"
                  />
                  <ShippingDetails option={option} />
                </label>
              ))}
            </fieldset>
          </div>
          <Dialog.Close asChild>
            <Button
              type="button"
              className="mt-4 h-11 w-full rounded-sm text-sm"
              onClick={() => onChange(draft)}
            >
              Confirmar entrega
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
