import { ArrowDown } from "lucide-react"
import { ClosetCarousel } from "@/components/catalog/closet-carousel"
const carouselPhotos = [
  "/images/trousers.jpg",
  "/images/jacket.jpg",
  "/images/bag.jpg",
  "/images/dress.jpg",
  "/images/blouse.jpg",
  "/images/shoes.jpg",
]

export function CatalogHero() {
  return (
    <section aria-labelledby="hero-title">
      <div className="storefront-container pt-[clamp(28px,6vw,64px)] pb-[clamp(24px,5vw,44px)]">
        <p className="eyebrow uppercase">Do meu closet para o seu</p>
        <h1
          id="hero-title"
          className="mt-[13px] mb-[18px] text-[clamp(38px,9vw,62px)] leading-[0.98] tracking-[-0.045em] store-tablet:mt-[15px] store-tablet:text-[clamp(42px,4.7vw,68px)]"
        >
          Peças com história.
          <br />
          Um novo <em>começo.</em>
        </h1>
        <p className="max-w-[38ch] text-[clamp(13px,2.9vw,18px)] leading-[1.65] text-muted-foreground">
          Roupas e acessórios do closet da Samara Viau, prontos para fazer parte
          da sua história.
        </p>
        <div className="mt-[clamp(20px,5vw,34px)] flex flex-wrap items-center gap-x-[clamp(14px,4vw,28px)] gap-y-3">
          <a
            className="storefront-action gap-[13px] px-3.5 text-[clamp(11px,2.5vw,15px)] store-tablet:gap-6 store-tablet:px-[21px]"
            href="#pecas"
          >
            Encontre sua próxima peça <ArrowDown size={17} aria-hidden="true" />
          </a>
          <span className="font-heading text-[clamp(20px,5vw,32px)] whitespace-nowrap italic">
            com carinho, Sah
          </span>
        </div>
      </div>
      <ClosetCarousel photos={carouselPhotos} />
    </section>
  )
}
