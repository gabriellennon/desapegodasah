import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"

export default function DesignSystem() {
  return (
    <main className="ds-page container">
      <Link href="/" className="text-link">
        <ArrowLeft size={16} /> Voltar ao catálogo
      </Link>
      <div className="ds-intro">
        <p className="eyebrow">DESAPEGO DA SAH · DIREÇÃO VISUAL 01</p>
        <h1>
          Uma identidade
          <br />
          com <em>afeto e presença.</em>
        </h1>
        <p>
          Uma base editorial para destacar as peças: espresso dá contraste,
          peony traz personalidade e off-white deixa a fotografia respirar.
        </p>
      </div>
      <section className="ds-section">
        <p className="eyebrow">01 / PALETA</p>
        <h2>Três cores. Uma assinatura.</h2>
        <div className="ds-swatches">
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
              className="ds-swatch"
              style={{
                background: color.hex,
                color: color.light ? "#F9F5EA" : "#3E2723",
              }}
            >
              <span>{color.name}</span>
              <strong>{color.hex}</strong>
              <p>{color.use}</p>
            </div>
          ))}
        </div>
        <p className="ds-note">
          Textos em espresso sobre peony ou off-white. Peony sobre off-white
          fica reservado para decoração, nunca para texto ou indicação de estado
          sem outro sinal.
        </p>
      </section>
      <section className="ds-section">
        <p className="eyebrow">02 / TIPOGRAFIA</p>
        <div className="ds-type-grid">
          <div>
            <h2>
              Histórias que
              <br />
              <em>continuam.</em>
            </h2>
            <p className="ds-note">
              Cormorant Garamond · títulos e assinatura editorial
            </p>
          </div>
          <div>
            <h3>Uma leitura leve, uma escolha simples.</h3>
            <p>
              DM Sans para navegação, descrição, filtros e preços. A hierarquia
              prioriza o nome da peça, o tamanho e o valor.
            </p>
            <p className="ds-price">
              R$ 129,00 <span className="size-tag">Tam. P</span>
            </p>
            <p className="ds-note">DM Sans · interface e conteúdo</p>
          </div>
        </div>
      </section>
      <section className="ds-section">
        <p className="eyebrow">03 / COMPONENTES</p>
        <h2>Clareza em cada detalhe.</h2>
        <div className="ds-component-row">
          <Link href="/#pecas" className="primary-button">
            Explorar as peças <ArrowUpRight size={16} />
          </Link>
          <button className="primary-button" disabled>
            Indisponível
          </button>
          <span className="size-tag">Tam. M</span>
          <span className="ds-badge">Bem conservada</span>
        </div>
        <p className="ds-note">
          Ações espresso, cantos discretos, bordas finas e ícones lineares. Foco
          de teclado visível e estados selecionados com texto e contraste.
        </p>
      </section>
      <section className="ds-section">
        <p className="eyebrow">04 / REFERÊNCIAS VISUAIS</p>
        <h2>Um closet com olhar editorial.</h2>
        <div className="ds-type-grid">
          <div>
            <h3>Editorial de moda</h3>
            <p>
              Serifa expressiva, composição com respiro e imagens verticais.
              Referência de linguagem, sem copiar uma marca específica.
            </p>
          </div>
          <div>
            <h3>Álbum pessoal</h3>
            <p>
              Fotos sobrepostas, assinatura discreta e rosa suave. Proximidade
              sem excesso de enfeites, mantendo o catálogo como protagonista.
            </p>
          </div>
        </div>
        <p className="ds-note">
          Fotos atuais: referências demonstrativas do Unsplash. Não são produtos
          nem retratos da Samara. A direção será refinada com as imagens reais.
        </p>
      </section>
    </main>
  )
}
