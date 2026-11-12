"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { useState } from "react"
import { formatPrice, type Product } from "@/lib/catalog"
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

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <article className={`product-card ${product.sold ? "is-sold" : ""}`}>
      <Link
        className="product-link"
        href={`/pecas/${product.id}`}
        aria-label={`Ver detalhes de ${product.name}${product.sold ? ", esgotado" : ""}`}
      >
        <div className="product-image">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
            loading={index < 4 ? "eager" : "lazy"}
          />
          <span className={`product-tag ${product.sold ? "tag-sold" : ""}`}>
            {product.sold
              ? "Já encontrou um lar"
              : product.condition.includes("leves")
                ? "Com história"
                : "Bem conservada"}
          </span>
          <span className="product-peek">
            Ver de pertinho <ArrowUpRight size={16} />
          </span>
        </div>
        <div className="product-caption">
          <span>{product.category}</span>
          <span className="size-tag">
            {product.size === "Único" ? "Tam. único" : `Tam. ${product.size}`}
          </span>
        </div>
        <h3>{product.name}</h3>
        <p className="product-price">{formatPrice(product.price)}</p>
      </Link>
    </article>
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
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              DO MEU CLOSET PARA O SEU
            </p>
            <h1 id="hero-title">
              Peças com história.
              <br />
              Um novo <em>começo.</em>
            </h1>
            <p className="hero-description">
              Roupas e acessórios do closet da Samara Viau,
              <br className="desktop-break" /> prontos para fazer parte da sua
              história.
            </p>
            <a className="primary-button" href="#pecas">
              Encontre sua próxima peça <ArrowDown size={17} />
            </a>
            <span className="hero-signature">com carinho, Sah</span>
          </div>
          <div className="hero-collage" aria-hidden="true">
            <div className="collage-frame collage-back">
              <Image src="/images/bag.jpg" alt="" fill sizes="240px" />
            </div>
            <div className="collage-frame collage-front">
              <Image
                src="/images/trousers.jpg"
                alt=""
                fill
                sizes="280px"
                preload
              />
            </div>
          </div>
        </section>

        <div className="brand-ribbon">
          <span>MENOS ACÚMULO</span>
          <AsteriskMark />
          <span>MAIS HISTÓRIAS</span>
          <AsteriskMark />
          <span>UM NOVO OLHAR PARA O QUE JÁ EXISTE</span>
          <AsteriskMark />
          <span>MAIS HISTÓRIAS</span>
        </div>

        <section
          className="catalog-section container"
          id="pecas"
          aria-labelledby="catalog-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">O CLOSET ESTÁ ABERTO</p>
              <h2 id="catalog-title">
                Seu próximo <em>achado.</em>
              </h2>
            </div>
            <span className="section-note">
              Escolha com calma. Apaixone-se à vontade.
            </span>
          </div>
          <div className="catalog-toolbar">
            <div className="category-tabs" aria-label="Categorias">
              {categories.map((item) => (
                <button
                  key={item}
                  aria-pressed={category === item}
                  className={category === item ? "active" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <button
              className="filter-toggle"
              aria-expanded={filtersOpen}
              aria-controls="catalog-filters"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal size={16} /> Filtros
              {size !== "Todos" || availableOnly ? " · ativos" : ""}
            </button>
          </div>
          <div className="catalog-controls">
            <label className="search-field">
              <Search size={17} />
              <span className="sr-only">Buscar peças</span>
              <input
                type="search"
                placeholder="Qual vai ser o seu achado?"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <div className="result-sort">
              <p aria-live="polite">
                {filtered.length} {filtered.length === 1 ? "peça" : "peças"}
              </p>
              <label className="sort-field">
                <span className="sr-only">Ordenar peças</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="selection">Seleção da Sah</option>
                  <option value="price-asc">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                </select>
                <ChevronDown size={14} aria-hidden="true" />
              </label>
            </div>
          </div>
          <div
            className="filter-panel"
            id="catalog-filters"
            hidden={!filtersOpen}
          >
            <fieldset>
              <legend>Tamanho</legend>
              <div className="size-options">
                {["Todos", ...sizes].map((item) => (
                  <button
                    key={item}
                    aria-pressed={size === item}
                    className={size === item ? "selected" : ""}
                    onClick={() => setSize(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(event) => setAvailableOnly(event.target.checked)}
              />{" "}
              Somente disponíveis
            </label>
            <button className="text-button" onClick={resetFilters}>
              Limpar filtros
            </button>
          </div>
          {hasFilters && (
            <div className="active-filters">
              <span>Seleção filtrada</span>
              <button onClick={resetFilters}>
                Limpar seleção <X size={13} />
              </button>
            </div>
          )}
          {products.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhuma peça publicada por enquanto.</h3>
              <p>Volte em breve para conferir os próximos desapegos.</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="product-grid">
              {filtered.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={28} strokeWidth={1} />
              <h3>Ainda não encontramos esse achado.</h3>
              <p>Experimente outro termo, categoria ou tamanho.</p>
              <button className="primary-button" onClick={resetFilters}>
                Ver todas as peças <ArrowRight size={16} />
              </button>
            </div>
          )}
          <div className="catalog-end">
            <p>Todo fim de ciclo pode ser um lindo começo.</p>
          </div>
        </section>

        <section className="about-section" id="sobre">
          <div className="about-inner container">
            <div className="about-portrait hidden md:block">
              <Image
                src="https://emanubucketimages.uk/desapegodasah/catalogo/samara_profile.jpg"
                alt="Retrato de Samara Viau sorrindo"
                width={1060}
                height={1060}
                sizes="(max-width: 650px) 232px, 312px"
              />
            </div>
            <div>
              <p className="eyebrow">DESAPEGAR TAMBÉM É CUIDAR</p>
              <h2>
                O que foi especial por aqui
                <br />
                pode ser especial <em>por aí.</em>
              </h2>
              <p>
                Um espaço para dar continuidade às histórias das peças do closet
                da Samara. Roupas e acessórios que seguem em frente, abrindo
                espaço para o novo.
              </p>
              <a
                className="text-link"
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
