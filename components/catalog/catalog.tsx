"use client"

import Image from "next/image"
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { useState } from "react"
import type { Product } from "@/lib/catalog"
import { CatalogHero } from "@/components/catalog/catalog-hero"
import { ProductCard } from "@/components/catalog/product-card"
import { CatalogCart } from "@/components/store/product-interactions"

import { StoreFooter, StoreHeader } from "@/components/store/store-chrome"

const categories = [
  "Todas as peças",
  "Roupas",
  "Bolsas",
  "Calçados",
  "Acessórios",
]
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

function AsteriskMark() {
  return (
    <Image
      src="/images/asterisk-espresso.png"
      alt=""
      width={14}
      height={14}
      className="shrink-0"
      unoptimized
    />
  )
}

export function Catalog({
  products,
  demo,
}: {
  products: Product[]
  demo: boolean
}) {
  const sizes = [...new Set(products.map((product) => product.size))]
  const [category, setCategory] = useState("Todas as peças")
  const [search, setSearch] = useState("")
  const [size, setSize] = useState("Todos")
  const [sort, setSort] = useState("selection")
  const [availableOnly, setAvailableOnly] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  function resetFilters() {
    setCategory("Todas as peças")
    setSearch("")
    setSize("Todos")
    setAvailableOnly(false)
    setSort("selection")
  }

  const filtered = products
    .filter(
      (product) =>
        (category === "Todas as peças" || product.category === category) &&
        (size === "Todos" || product.size === size) &&
        (!availableOnly || !product.sold) &&
        normalize(
          `${product.name} ${product.category} ${product.brand}`
        ).includes(normalize(search.trim()))
    )
    .sort((a, b) =>
      sort === "price-asc"
        ? a.price - b.price
        : sort === "price-desc"
          ? b.price - a.price
          : 0
    )
  const hasFilters =
    category !== "Todas as peças" ||
    search !== "" ||
    size !== "Todos" ||
    availableOnly

  return (
    <>
      <a className="skip-link" href="#pecas">
        Ir para o catálogo
      </a>
      <StoreHeader catalog demo={demo} />

      <main>
        <CatalogHero />

        <div className="flex items-center gap-[25px] overflow-hidden bg-secondary px-5 py-3 text-[8px] font-medium tracking-[0.15em] whitespace-nowrap store-tablet:justify-center store-tablet:gap-[55px] store-tablet:py-[15px] store-tablet:text-[10px]">
          <span>MENOS ACÚMULO</span>
          <AsteriskMark />
          <span>MAIS HISTÓRIAS</span>
          <AsteriskMark />
          <span>UM NOVO OLHAR PARA O QUE JÁ EXISTE</span>
          <AsteriskMark />
          <span>MAIS HISTÓRIAS</span>
        </div>

        <section
          className="storefront-container pt-[34px] store-tablet:pt-[53px]"
          id="pecas"
          aria-labelledby="catalog-title"
        >
          <div className="mb-[17px] store-tablet:mb-[30px] store-tablet:flex store-tablet:items-end store-tablet:justify-between store-tablet:gap-6">
            <div>
              <p className="eyebrow">O CLOSET ESTÁ ABERTO</p>
              <h2
                id="catalog-title"
                className="mt-[9px] text-[39px] leading-[1.05] tracking-[-0.035em] store-tablet:text-[clamp(36px,3.6vw,49px)]"
              >
                Seu próximo <em>achado.</em>
              </h2>
            </div>
            <span className="hidden pb-[3px] font-heading text-[17px] italic store-tablet:inline store-desktop:text-xl">
              Escolha com calma. Apaixone-se à vontade.
            </span>
          </div>
          <div className="flex items-end justify-between gap-[15px] border-b border-border store-tablet:items-center store-tablet:gap-6">
            <div
              className="flex [scrollbar-width:none] gap-[19px] overflow-x-auto store-tablet:gap-[25px]"
              aria-label="Categorias"
            >
              {categories.map((item) => (
                <button
                  key={item}
                  aria-pressed={category === item}
                  className="relative shrink-0 py-3.5 text-[11px] text-muted-foreground aria-pressed:font-semibold aria-pressed:text-foreground aria-pressed:after:absolute aria-pressed:after:inset-x-0 aria-pressed:after:bottom-0 aria-pressed:after:h-0.5 aria-pressed:after:bg-primary store-tablet:pt-[15px] store-tablet:pb-[19px] store-tablet:text-xs"
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <button
              className="mb-1.5 flex min-h-9 shrink-0 items-center border border-border p-[9px] text-[0px] whitespace-nowrap aria-expanded:border-secondary aria-expanded:bg-secondary store-tablet:mb-2 store-tablet:gap-[9px] store-tablet:px-3.5 store-tablet:py-2.5 store-tablet:text-[11px]"
              aria-label="Filtros"
              aria-expanded={filtersOpen}
              aria-controls="catalog-filters"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal size={16} /> Filtros
              {size !== "Todos" || availableOnly ? " · ativos" : ""}
            </button>
          </div>
          <div className="flex items-start justify-between gap-2.5 pt-3.5 pb-[19px] store-tablet:items-center store-tablet:gap-5 store-tablet:pt-5 store-tablet:pb-6">
            <label className="flex flex-1 items-center gap-[7px] text-muted-foreground store-tablet:w-[min(340px,45%)] store-tablet:flex-none store-tablet:gap-2.5">
              <Search size={17} />
              <span className="sr-only">Buscar peças</span>
              <input
                className="w-full min-w-0 py-2 text-[11px] text-foreground placeholder:text-muted-foreground"
                type="search"
                placeholder="Qual vai ser o seu achado?"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <div className="flex flex-col-reverse items-end text-[10px] store-tablet:flex-row store-tablet:items-center store-tablet:gap-7 store-tablet:text-[11px]">
              <p
                className="mt-1 text-[9px] text-muted-foreground store-tablet:mt-0 store-tablet:text-[11px]"
                aria-live="polite"
              >
                {filtered.length} {filtered.length === 1 ? "peça" : "peças"}
              </p>
              <label className="relative flex items-center">
                <span className="sr-only">Ordenar peças</span>
                <select
                  className="cursor-pointer appearance-none bg-transparent py-[9px] pr-[22px] text-foreground store-tablet:pl-2"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="selection">Seleção da Sah</option>
                  <option value="price-asc">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-0"
                  aria-hidden="true"
                />
              </label>
            </div>
          </div>
          <div
            className="mb-[25px] flex flex-wrap items-center gap-5 bg-surface p-[15px] store-tablet:gap-[30px] store-tablet:p-5 [&[hidden]]:hidden"
            id="catalog-filters"
            hidden={!filtersOpen}
          >
            <fieldset>
              <legend className="mb-2.5 text-[11px]">Tamanho</legend>
              <div className="flex flex-wrap gap-[5px]">
                {["Todos", ...sizes].map((item) => (
                  <button
                    key={item}
                    aria-pressed={size === item}
                    className="min-h-[38px] border border-border bg-background px-3 py-2 text-[11px] aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                    onClick={() => setSize(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="flex items-center gap-2 text-xs">
              <input
                className="size-[17px] accent-primary"
                type="checkbox"
                checked={availableOnly}
                onChange={(event) => setAvailableOnly(event.target.checked)}
              />{" "}
              Somente disponíveis
            </label>
            <button
              className="py-2.5 text-[11px] underline underline-offset-4"
              onClick={resetFilters}
            >
              Limpar filtros
            </button>
          </div>
          {hasFilters && (
            <div className="flex justify-between pb-5 text-[11px] text-muted-foreground">
              <span>Seleção filtrada</span>
              <button
                className="flex items-center gap-1.5"
                onClick={resetFilters}
              >
                Limpar seleção <X size={13} />
              </button>
            </div>
          )}
          {products.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-[15px] text-center">
              <h3 className="font-heading text-3xl font-medium">
                Nenhuma peça publicada por enquanto.
              </h3>
              <p className="text-xs text-muted-foreground">
                Volte em breve para conferir os próximos desapegos.
              </p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-[27px] store-tablet:grid-cols-3 store-tablet:gap-x-[22px] store-tablet:gap-y-[37px] store-desktop:grid-cols-4">
              {filtered.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  eager={index < 4}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-[15px] text-center">
              <Search size={28} strokeWidth={1} />
              <h3 className="font-heading text-3xl font-medium">
                Ainda não encontramos esse achado.
              </h3>
              <p className="text-xs text-muted-foreground">
                Experimente outro termo, categoria ou tamanho.
              </p>
              <button className="storefront-action" onClick={resetFilters}>
                Ver todas as peças <ArrowRight size={16} />
              </button>
            </div>
          )}
          <div className="flex items-center justify-center gap-3 py-[30px] store-tablet:gap-5 store-tablet:pt-[45px] store-tablet:pb-[49px]">
            <p className="text-[9px] text-muted-foreground store-tablet:text-[11px]">
              Todo fim de ciclo pode ser um lindo começo.
            </p>
          </div>
        </section>

        <section
          className="bg-secondary py-[35px] store-tablet:py-[53px]"
          id="sobre"
        >
          <div className="storefront-container grid max-w-[1000px] items-center gap-5 store-tablet:grid-cols-[0.75fr_1fr] store-tablet:gap-[30px] store-desktop:gap-[70px]">
            <div>
              <p className="eyebrow">DESAPEGAR TAMBÉM É CUIDAR</p>
              <h2 className="mt-3 mb-[17px] text-[34px] leading-[1.05] tracking-[-0.035em] store-tablet:text-[38px]">
                O que foi especial por aqui
                <br />
                pode ser especial <em>por aí.</em>
              </h2>
              <p className="max-w-[440px] text-xs leading-[1.9]">
                Um espaço para dar continuidade às histórias das peças do closet
                da Samara. Roupas e acessórios que seguem em frente, abrindo
                espaço para o novo.
              </p>
              <a
                className="storefront-link"
                href="https://www.instagram.com/samaraviau/"
                target="_blank"
                rel="noreferrer"
              >
                Acompanhe a Samara <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <StoreFooter />
      <CatalogCart products={products} />
    </>
  )
}
