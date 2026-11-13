import type { Contact } from "@/lib/checkout/types"
import { Field, StepTitle } from "./fields"

export function ContactStep({
  contact,
  onChange,
}: {
  contact: Contact
  onChange: (value: Contact) => void
}) {
  return (
    <section>
      <StepTitle>Dados Pessoais</StepTitle>
      <div className="space-y-5 sm:space-y-6">
        <Field
          label="Nome Completo"
          name="name"
          autoComplete="name"
          maxLength={120}
          required
          value={contact.name}
          onChange={(event) =>
            onChange({ ...contact, name: event.target.value })
          }
        />
        <Field
          label="CPF / CNPJ"
          name="taxId"
          inputMode="numeric"
          maxLength={18}
          required
          value={contact.taxId}
          onChange={(event) =>
            onChange({ ...contact, taxId: event.target.value })
          }
        />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
          value={contact.email}
          onChange={(event) =>
            onChange({ ...contact, email: event.target.value })
          }
        />
        <Field
          label="Telefone"
          name="cellphone"
          type="tel"
          autoComplete="tel-national"
          maxLength={16}
          required
          value={contact.cellphone}
          onChange={(event) =>
            onChange({
              ...contact,
              cellphone: event.target.value,
            })
          }
        />
      </div>
    </section>
  )
}
