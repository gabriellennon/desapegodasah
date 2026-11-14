import {
  AbacatePayError,
  abacate,
  matchesCharge,
  paymentStatus,
  updatePayment,
  type Charge,
} from "@/lib/checkout/abacatepay"
import {
  CheckoutError,
  credentials,
  database,
  env,
  errorResponse,
  getOrder,
  hashAccess,
  jsonBody,
  parseAddress,
  parseContact,
  verifyQuote,
} from "@/lib/checkout/server"
import { checkoutResponse } from "@/lib/orders/server"
import { maxInstallments } from "@/lib/checkout/types"

export async function POST(request: Request) {
  try {
    const data = await jsonBody(request)
    const { id, access } = credentials(data)
    const existing = await getOrder(id, access)
    if (existing) return checkoutResponse(existing)

    env("ABACATE_API_KEY")
    env("ABACATE_WEBHOOK_SECRET")
    env("CHECKOUT_CRON_SECRET")
    const method = data.method
    if (method !== "PIX" && method !== "CARD")
      throw new CheckoutError("Escolha como pagar.")
    if (
      method === "CARD" &&
      !process.env.ABACATE_CHECKOUT_KEY?.trim().startsWith("pk_")
    ) {
      throw new CheckoutError("Pagamento com cartão indisponível.", 503)
    }
    const contact = parseContact(data.contact)
    const address = parseAddress(data.address)
    const { quote, shipping } = verifyQuote(
      data.quoteToken,
      address.zipCode,
      data.shippingId
    )
    const amount = quote.subtotal + shipping.price
    if (amount < 100) throw new CheckoutError("O total mínimo é R$ 1,00.")
    const installments = method === "PIX" ? 1 : Number(data.installments)
    const limit = Number(process.env.CHECKOUT_MAX_INSTALLMENTS ?? 12)
    const token = data.cardToken
    if (
      method === "CARD" &&
      (typeof token !== "string" ||
        !/^ctok_[A-Za-z0-9_-]{1,240}$/.test(token) ||
        !Number.isInteger(installments) ||
        installments < 1 ||
        installments >
          maxInstallments(amount, Number.isInteger(limit) ? limit : 12))
    )
      throw new CheckoutError("Confira os dados do cartão e as parcelas.")

    const reserved = await database<boolean>("rpc/reserve_checkout", {
      method: "POST",
      body: JSON.stringify({
        p_id: id,
        p_access_hash: hashAccess(access),
        p_products: quote.items,
        // Only the payment provider needs the full CPF/CNPJ.
        p_contact: {
          name: contact.name,
          email: contact.email,
          cellphone: contact.cellphone,
        },
        p_address: address,
        p_shipping: shipping,
        p_method: method,
        p_installments: installments,
      }),
    })
    const order = await getOrder(id, access)
    if (!order) throw new CheckoutError("Referência de pedido inválida.", 409)
    if (!reserved) return checkoutResponse(order)

    try {
      const charge = await abacate<Charge>("create", {
        method,
        data: {
          amount,
          customer: contact,
          metadata: { pedidoId: id },
          ...(method === "PIX"
            ? { expiresIn: 900, externalId: id, description: "Desapego da Sah" }
            : { token, installmentCount: installments }),
        },
      })
      if (!matchesCharge(order, charge) || typeof charge.status !== "string") {
        await updatePayment(id, "review")
      } else {
        await updatePayment(id, paymentStatus(method, charge.status), charge)
      }
    } catch (error) {
      if (error instanceof AbacatePayError && error.rejected) {
        await updatePayment(id, "failed")
      }
      // An uncertain result stays reserved. The webhook can still confirm it.
    }

    const updated = await getOrder(id, access)
    if (!updated) throw new CheckoutError("Pedido não encontrado.", 404)
    return checkoutResponse(updated)
  } catch (error) {
    return errorResponse(error)
  }
}
