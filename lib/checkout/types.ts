export type Contact = {
  name: string
  taxId: string
  email: string
  cellphone: string
}
export type Address = {
  zipCode: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  complement: string
}
export type CheckoutItem = { id: string; price: number }
export type ShippingOption = {
  id: string
  name: string
  carrier: string
  carrierLogo?: string
  days: number
  price: number
  originalPrice: number
}
export type ShippingQuote = {
  token: string
  items: CheckoutItem[]
  subtotal: number
  options: Omit<ShippingOption, "originalPrice">[]
}
export type Quote = {
  items: CheckoutItem[]
  zipCode: string
  options: ShippingOption[]
  subtotal: number
  expires: number
}
export type PaymentMethod = "PIX" | "CARD"
export type PaymentStatus =
  "creating" | "pending" | "paid" | "failed" | "expired" | "refunded" | "review"
export type PaymentSession = {
  id: string
  access: string
  productIds: string[]
  fromCart: boolean
}
export type PaymentView = {
  id: string
  orderNumber: string
  method: PaymentMethod
  status: PaymentStatus
  total: number
  pixCode: string | null
  pixImage: string | null
  expiresAt: string | null
}

export const digits = (value: string) => value.replace(/\D/g, "")

export function maxInstallments(total: number, limit: number) {
  return Math.max(1, Math.min(12, limit, Math.floor(total / 1000)))
}

export function validTaxId(value: string) {
  const id = digits(value)
  if (![11, 14].includes(id.length) || /^(\d)\1+$/.test(id)) return false
  const base = id.slice(0, -2)
  const weights =
    id.length === 11
      ? [10, 9, 8, 7, 6, 5, 4, 3, 2]
      : [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  function checkDigit(input: string, multipliers: number[]) {
    const sum = multipliers.reduce(
      (total, weight, index) => total + Number(input[index]) * weight,
      0
    )
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }
  const first = checkDigit(base, weights)
  const second = checkDigit(base + first, [weights[0] + 1, ...weights])
  return id === base + first + second
}
