import { ArrowDown } from "lucide-react"
import { ClosetCarousel } from "@/components/catalog/closet-carousel"
import type { Product } from "@/lib/catalog"

const carrouselPhotos = [
  "/images/trousers.jpg",
  "/images/jacket.jpg",
  "/images/bag.jpg",
  "/images/dress.jpg",
  "/images/blouse.jpg",
  "/images/shoes.jpg",
]

export function CatalogHero({ products }: { products: Product[] }) {
  const available = products.filter((product) => !product.sold)
  const photos = [
    ...new Set([
      ...available.map((product) => product.image),
      ...available.flatMap(
        (product) => product.photos?.map(({ src }) => src) ?? []
      ),
    ]),
  ].slice(0, 6)

  return (
    <section aria-labelledby="hero-title">
      <div className="hero container">
        <p className="eyebrow">Do meu closet para o seu</p>
        <h1 id="hero-title">
          Peças com história.
          <br />
          Um novo <em>começo.</em>
        </h1>
        <p className="hero-description">
          Roupas e acessórios do closet da Samara Viau, prontos para fazer parte
          da sua história.
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="#pecas">
            Encontre sua próxima peça <ArrowDown size={17} aria-hidden="true" />
          </a>
          <span className="hero-signature">com carinho, Sah</span>
        </div>
      </div>
      <ClosetCarousel photos={carrouselPhotos} />
    </section>
  )
}
