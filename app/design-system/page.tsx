import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"

const sectionClass = "border-t border-border py-[35px]"
const headingClass =
  "mt-[15px] mb-7 text-[clamp(36px,3.6vw,49px)] leading-[1.05] tracking-[-0.035em]"
const noteClass =
  "mt-[22px] max-w-[700px] text-xs leading-[1.8] text-muted-foreground"
const typeGridClass =
  "mt-[22px] grid gap-5 store-tablet:grid-cols-2 store-tablet:gap-[50px]"

export default function DesignSystem() {
  return (
    <main className="storefront-container max-w-[1100px] pb-[70px]">
      <Link href="/" className="storefront-link">
        <ArrowLeft size={16} /> Voltar ao catálogo
      </Link>
      <div className="py-10 store-tablet:py-[60px]">
        <p className="eyebrow">DESAPEGO DA SAH · DIREÇÃO VISUAL 01</p>
        <h1 className="mt-[13px] mb-[18px] text-[clamp(43px,10vw,62px)] leading-[0.98] tracking-[-0.045em] store-tablet:mt-[15px] store-tablet:text-[clamp(42px,4.7vw,68px)]">
          Uma identidade
          <br />
          com <em>afeto e presença.</em>
        </h1>
        <p className="mt-[25px] max-w-[560px] leading-[1.9] text-muted-foreground">
          Uma base editorial para destacar as peças: espresso dá contraste,
          peony traz personalidade e off-white deixa a fotografia respirar.
        </p>
      </div>
      <section className={sectionClass}>
        <p className="eyebrow">01 / PALETA</p>
        <h2 className={headingClass}>Três cores. Uma assinatura.</h2>
        <div className="grid gap-5 store-tablet:grid-cols-3 store-tablet:gap-[15px]">
          {[
            {
              name: "Espresso",
              hex: "#3E2723",
              use: "Texto, ícones e ações principais",
              light: true,
            },
            {
              name: "Peony",
              hex: "#f9ddda",
              use: "Destaques, selos e superfícies",
              light: false,
            },
            {
              name: "Off-white",
              hex: "#F9F5EA",
              use: "Fundo principal e respiro",
              light: false,
            },
          ].map((color) => (
            <div
              key={color.name}
              className="flex min-h-40 flex-col justify-end border border-border p-[25px] store-tablet:min-h-[200px]"
              style={{
                background: color.hex,
                color: color.light ? "#F9F5EA" : "#3E2723",
              }}
            >
              <span className="font-heading text-[34px]">{color.name}</span>
              <strong className="mt-[5px] mb-[18px] text-xs font-normal">
                {color.hex}
              </strong>
              <p className="text-[11px]">{color.use}</p>
            </div>
          ))}
        </div>
        <p className={noteClass}>
          Textos em espresso sobre peony ou off-white. Peony sobre off-white
          fica reservado para decoração, nunca para texto ou indicação de estado
          sem outro sinal.
        </p>
      </section>
      <section className={sectionClass}>
        <p className="eyebrow">02 / TIPOGRAFIA</p>
        <div className={typeGridClass}>
          <div>
            <h2 className={headingClass}>
              Histórias que
              <br />
              <em>continuam.</em>
            </h2>
            <p className={noteClass}>
              Cormorant Garamond · títulos e assinatura editorial
            </p>
          </div>
          <div>
            <h3 className="mb-[15px] font-medium">
              Uma leitura leve, uma escolha simples.
            </h3>
            <p className="leading-[1.9]">
              DM Sans para navegação, descrição, filtros e preços. A hierarquia
              prioriza o nome da peça, o tamanho e o valor.
            </p>
            <p className="mt-[25px] leading-[1.9]">
              R$ 129,00 <span className="size-tag">Tam. P</span>
            </p>
            <p className={noteClass}>DM Sans · interface e conteúdo</p>
          </div>
        </div>
      </section>
      <section className={sectionClass}>
        <p className="eyebrow">03 / COMPONENTES</p>
        <h2 className={headingClass}>Clareza em cada detalhe.</h2>
        <div className="flex flex-wrap items-center gap-[25px]">
          <Link href="/#pecas" className="storefront-action">
            Explorar as peças <ArrowUpRight size={16} />
          </Link>
          <button className="storefront-action" disabled>
            Indisponível
          </button>
          <span className="size-tag">Tam. M</span>
          <span className="bg-secondary p-2.5 text-[11px]">Bem conservada</span>
        </div>
        <p className={noteClass}>
          Ações espresso, cantos discretos, bordas finas e ícones lineares. Foco
          de teclado visível e estados selecionados com texto e contraste.
        </p>
      </section>
      <section className={sectionClass}>
        <p className="eyebrow">04 / REFERÊNCIAS VISUAIS</p>
        <h2 className={headingClass}>Um closet com olhar editorial.</h2>
        <div className={typeGridClass}>
          <div>
            <h3 className="mb-[15px] font-medium">Editorial de moda</h3>
            <p className="leading-[1.9]">
              Serifa expressiva, composição com respiro e imagens verticais.
              Referência de linguagem, sem copiar uma marca específica.
            </p>
          </div>
          <div>
            <h3 className="mb-[15px] font-medium">Álbum pessoal</h3>
            <p className="leading-[1.9]">
              Fotos sobrepostas, assinatura discreta e rosa suave. Proximidade
              sem excesso de enfeites, mantendo o catálogo como protagonista.
            </p>
          </div>
        </div>
        <p className={noteClass}>
          Fotos atuais: referências demonstrativas do Unsplash. Não são produtos
          nem retratos da Samara. A direção será refinada com as imagens reais.
        </p>
      </section>
    </main>
  )
}
