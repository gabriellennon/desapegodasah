import { Catalog } from "@/components/catalog/catalog"
import { getCatalog } from "@/lib/catalog-source"

export default async function Page() {
  const { products, demo } = await getCatalog()
  return <Catalog products={products} demo={demo} />
}
