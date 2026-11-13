import { useState } from "react"
import type { Address } from "@/lib/checkout/types"
import { Button } from "@/components/ui/button"
import { Field, StepTitle } from "./fields"

export function AddressStep({
  address,
  onChange,
  cepStatus,
  quoting,
}: {
  address: Address
  onChange: (name: keyof Address, value: string) => void
  cepStatus: "idle" | "loading" | "manual" | "not-found"
  quoting: boolean
}) {
  const [cepBlurred, setCepBlurred] = useState(false)
  const invalidFormat =
    cepBlurred &&
    address.zipCode !== "" &&
    !/^\d{5}-?\d{3}$/.test(address.zipCode)
  const notFound = cepStatus === "not-found"
  const lookingUp = cepStatus === "loading"

  return (
    <section>
      <StepTitle>Endereço de entrega</StepTitle>
      <fieldset disabled={quoting} className="min-w-0 space-y-5">
        <legend className="sr-only">Endereço no Brasil</legend>
        <Field
          label="CEP"
          name="postal-code"
          inputMode="numeric"
          autoComplete="shipping postal-code"
          maxLength={20}
          pattern="[0-9]{5}-?[0-9]{3}"
          required
          value={address.zipCode}
          aria-invalid={invalidFormat || notFound || undefined}
          aria-describedby={invalidFormat || notFound ? "cep-help" : undefined}
          onBlur={() => setCepBlurred(true)}
          onChange={(event) => {
            setCepBlurred(false)
            onChange("zipCode", event.target.value.trim())
          }}
        />
        <p
          role="status"
          className="text-xs text-muted-foreground empty:sr-only"
        >
          {lookingUp
            ? "Buscando endereço pelo CEP…"
            : cepStatus === "manual"
              ? "Não encontramos o endereço automaticamente. Você pode preencher os campos abaixo."
              : ""}
        </p>
        {(notFound || invalidFormat) && (
          <div className="space-y-3 rounded-sm border border-border bg-surface p-4">
            <p id="cep-help" role="status">
              {notFound
                ? "CEP não encontrado. Confira o número informado."
                : "Informe um CEP brasileiro de oito dígitos."}{" "}
              Por enquanto, entregamos somente no Brasil. Ficou com alguma
              dúvida? Fale com a gente.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="min-h-10 px-3">
                <a
                  href="https://www.instagram.com/samaraviau/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
              </Button>
              <Button asChild variant="secondary" className="min-h-10 px-3">
                <a
                  href="https://wa.me/5547920034583"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        )}
        <fieldset
          disabled={lookingUp || notFound}
          aria-busy={lookingUp}
          className="min-w-0 space-y-5 disabled:opacity-70"
        >
          <legend className="sr-only">Dados do endereço</legend>
          <Field
            label="Rua"
            loading={lookingUp}
            name="street"
            autoComplete="shipping address-line1"
            maxLength={160}
            required
            value={address.street}
            onChange={(event) => onChange("street", event.target.value)}
          />
          <div className="grid grid-cols-[1fr_2fr] gap-4">
            <Field
              label="Número"
              name="number"
              maxLength={20}
              required
              value={address.number}
              onChange={(event) => onChange("number", event.target.value)}
            />
            <Field
              label="Complemento (opcional)"
              name="complement"
              autoComplete="shipping address-line2"
              maxLength={120}
              value={address.complement}
              onChange={(event) => onChange("complement", event.target.value)}
            />
          </div>
          <Field
            label="Bairro"
            loading={lookingUp}
            name="neighborhood"
            autoComplete="shipping address-level3"
            maxLength={120}
            required
            value={address.neighborhood}
            onChange={(event) => onChange("neighborhood", event.target.value)}
          />
          <div className="grid grid-cols-[1fr_72px] gap-4">
            <Field
              label="Cidade"
              loading={lookingUp}
              name="city"
              autoComplete="shipping address-level2"
              maxLength={120}
              required
              value={address.city}
              onChange={(event) => onChange("city", event.target.value)}
            />
            <Field
              label="UF"
              loading={lookingUp}
              name="state"
              autoComplete="shipping address-level1"
              maxLength={2}
              pattern="[A-Za-z]{2}"
              required
              value={address.state}
              onChange={(event) =>
                onChange("state", event.target.value.toUpperCase())
              }
            />
          </div>
        </fieldset>
      </fieldset>
    </section>
  )
}
