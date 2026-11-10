# Desapego da Sah — direção visual 01

Referência navegável: `/design-system`. Catálogo: `/`.

## Identidade

Paleta definida pelo usuário: espresso `#3E2723`, peony `#F4C9D6`, off-white `#F9F5EA`. Espresso para conteúdo e ações; off-white para fundo; peony para superfícies e detalhes. Tokens em `app/globals.css` controlam a identidade. Tons auxiliares de borda e texto secundário derivam dessa base. Não usar rosa claro como texto sobre creme.

Cormorant Garamond nos títulos; DM Sans na interface. Arquivos locais em `public/fonts`, acompanhados das licenças OFL. Escala de espaçamento base: 4, 8, 12, 16, 24, 32, 48, 64 pixels. Botões principais com altura mínima de 46px. Cards sem caixas decorativas, imagens 3:4 e informações fora da foto. Vitrine com 4 colunas no desktop, 3 no tablet e 2 no celular.

## Referências de linguagem

Editorial de moda: títulos serifados, hierarquia clara, espaço em branco e fotografias verticais. Álbum pessoal: sobreposição de imagens, assinatura e proximidade. Não reproduz uma marca ou presume a identidade visual dos perfis sociais da Samara.

## Componentes e estados

Cabeçalho, hero compacto, faixa de marca, navegação por categoria, busca, tamanho, disponibilidade, ordenação, card de produto, estado vazio, página de detalhes e painel de carrinho, bloco sobre e rodapé. Categorias/tamanhos usam `aria-pressed`; painel Radix controla foco, Escape e bloqueio de fundo. Links externos identificados visualmente. Movimento respeita a preferência de redução de animação.

## Dados e limites desta entrega

Os oito produtos em `lib/catalog.ts` são exemplos sem relação com inventário real. Fotos do Unsplash são ilustrativas e ficam identificadas como demonstração. Cada peça tem página em `/pecas/[id]`. A galeria aceita fotos adicionais e oferece uma ampliação quando há só uma imagem. O carrinho demonstrativo fica no navegador e a ação Comprar agora abre um resumo. Checkout, pagamentos e integração com Supabase ficam para outra etapa. O metadado `robots` bloqueia indexação desta prévia; revisar antes do lançamento.

Fotos baixadas de `https://images.unsplash.com/`:
- trousers.jpg: photo-1594633312681-425c7b97ccd1
- jacket.jpg: photo-1591047139829-d91aecb6caea
- bag.jpg: photo-1548036328-c9fa89d128fa
- dress.jpg: photo-1539008835657-9e8e9680c956
- knit.jpg: photo-1576566588028-4147f3842f27
- shoes.jpg: photo-1543163521-1bf539c55dd2
- blouse.jpg: photo-1551803091-e20673f15770
- sunglasses.jpg: photo-1511499767150-a48a237f0083

Antes de publicar: substituir fixtures e fotos, confirmar identidade, inserir informações reais das peças, revisar metadados/indexação e integrar os fluxos comerciais acordados.
