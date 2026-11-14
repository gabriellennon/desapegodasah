import { refreshPayment } from "@/lib/checkout/abacatepay"
import {
  database,
  env,
  errorResponse,
  getOrder,
  safeEqual,
} from "@/lib/checkout/server"

import {
  cleanExpiredLookups,
  sendOrderConfirmations,
} from "@/lib/orders/server"

export async function GET(request: Request) {
  try {
    if (
      !safeEqual(
        request.headers.get("authorization") ?? "",
        "Bearer " + env("CHECKOUT_CRON_SECRET")
      )
    ) {
      return new Response(null, { status: 401 })
    }
    const overdue = await database<{ id: string }[]>(
      "checkout_orders?" +
        new URLSearchParams({
          select: "id",
          method: "eq.PIX",
          status: "eq.pending",
          expires_at: "lte." + new Date().toISOString(),
          order: "checked_at.asc.nullsfirst,expires_at.asc",
          limit: "30",
        })
    )
    const results = await Promise.allSettled(
      overdue.map(async ({ id }) => {
        const order = await getOrder(id)
        if (order) await refreshPayment(order)
      })
    )
    const [confirmation, cleanup] = await Promise.allSettled([
      sendOrderConfirmations(),
      cleanExpiredLookups(),
    ])
    return Response.json({
      confirmationFailed: confirmation.status === "rejected",
      lookupCleanupFailed: cleanup.status === "rejected",
      checked: overdue.length,
      failed: results.filter((result) => result.status === "rejected").length,
    })
  } catch (error) {
    return errorResponse(error)
  }
}
