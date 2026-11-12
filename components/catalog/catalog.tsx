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
        <CatalogHero products={products} />

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
                <ProductCard
                  key={product.id}
                  product={product}
                  eager={index < 4}
                />
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
