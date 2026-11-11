# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```

## Catálogo no Supabase

1. Aplique a migração em `supabase/migrations` ao projeto do Supabase.
2. Configure `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` no ambiente da aplicação. Use `.env.example` como referência. A chave publicável está em **Settings → API Keys** no Supabase.
3. Cadastre as peças em **Table Editor → products**. Digite o preço em centavos (R$ 129,90 = `12990`), a quantidade em `stock` e a URL da foto principal em `image_url`. Use fotos de um bucket público do Storage do projeto ou caminhos locais como `/images/foto.jpg`. Fotos extras vão em `photo_urls`.
4. Marque `is_published` para exibir a peça. O estoque começa em 1 e, ao chegar a 0, o produto publicado aparece como esgotado.

Catálogo, detalhes e carrinho consultam a seleção publicada. A Data API só permite leitura dessas linhas e o estoque numérico fica restrito ao banco. Com as duas variáveis ausentes, o site exibe a prévia demonstrativa.
