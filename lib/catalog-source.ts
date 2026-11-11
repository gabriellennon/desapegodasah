import { cache } from "react"
import { products as demoProducts, type Product } from "@/lib/catalog"

type ProductRow = {
  id: string
  name: string
  category: Product["category"]
  brand: string | null
  size: string
  price_cents: number
  image_url: string
  photo_urls: string[]
  condition: string
  description: string
  sold: boolean
}

export const getCatalog = cache(async () => {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_PUBLISHABLE_KEY
  if (!url && !key) return { products: demoProducts, demo: true }
  if (!url || !key)
    throw new Error("Configuração do catálogo Supabase incompleta.")

  const endpoint = new URL("/rest/v1/products", url)
  endpoint.searchParams.set(
    "select",
    "id,name,category,brand,size,price_cents,image_url,photo_urls,condition,description,sold"
  )
  endpoint.searchParams.set("order", "created_at.desc,id.asc")

  const pageSize = 200
  const products: Product[] = []
  for (let offset = 0; ; offset += pageSize) {
    endpoint.searchParams.set("limit", String(pageSize))
    endpoint.searchParams.set("offset", String(offset))
    const response = await fetch(endpoint, {
      headers: { apikey: key },
      cache: "no-store",
    })
    if (!response.ok) {
      throw new Error(
        `Falha ao consultar o catálogo Supabase (HTTP ${response.status}).`
      )
    }

    const rows: ProductRow[] = await response.json()
    for (const row of rows) {
      products.push({
        id: row.id,
        name: row.name,
        category: row.category,
        brand: row.brand ?? "",
        size: row.size,
        price: row.price_cents / 100,
        image: row.image_url,
        photos: row.photo_urls.map((src, index) => ({
          src,
          label: `Foto ${index + 2}`,
        })),
        condition: row.condition,
        description: row.description,
        sold: row.sold,
      })
    }
    if (rows.length < pageSize) break
  }

  return { products, demo: false }
})
