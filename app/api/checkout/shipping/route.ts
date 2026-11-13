import { errorResponse, getQuote, jsonBody } from "@/lib/checkout/server"

export async function POST(request: Request) {
  try {
    const { productIds, zipCode } = (await jsonBody(request)) as {
      productIds: string[]
      zipCode: string
    }
    return Response.json(await getQuote(productIds, zipCode))
  } catch (error) {
    return errorResponse(error)
  }
}
