# Cadastro de produtos

Abra **Table Editor → products → Insert row** no projeto do Supabase. Preencha os dados da peça e deixe `is_published` como `false` enquanto revisa o cadastro.

## Exemplo 1 · Jaqueta bomber (rascunho cadastrado)

| Campo | Valor |
| --- | --- |
| `name` | [EXEMPLO] Jaqueta bomber terracota |
| `category` | Roupas |
| `brand` | Em branco se a marca não for conhecida |
| `size` | M |
| `price_cents` | `18900` (R$ 189,00) |
| `image_url` | `/images/jacket.jpg` |
| `photo_urls` | Lista vazia |
| `condition` | Muito bem conservada |
| `description` | Cadastro demonstrativo. Jaqueta bomber terracota com zíper frontal e bolsos. |
| `stock` | `1` |
| `is_published` | `false` |

A foto deste rascunho já está no projeto. Para uma peça real, troque o nome, a foto e os dados antes de publicar.

## Exemplo 2 · Bolsa com fotos do Storage

| Campo | Valor |
| --- | --- |
| `name` | Bolsa de ombro marrom |
| `category` | Bolsas |
| `size` | Único |
| `price_cents` | `15990` (R$ 159,90) |
| `condition` | Com sinais leves de uso |
| `description` | Bolsa com alça de ombro e fechamento por zíper. Pequena marca na base, visível na última foto. |
| `stock` | `1` |
| `is_published` | `false` enquanto revisa, `true` para publicar |

Envie as fotos em WebP para um bucket público de produtos no Storage. O catálogo também aceita fotos em `https://emanubucketimages.uk/desapegodasah/catalogo/`. Copie a URL pública de cada arquivo e substitua as URLs ilustrativas abaixo pelos endereços reais depois do upload.

- `image_url` recebe a foto principal, por exemplo `https://uoykmyhvfkrajsrfsjtr.supabase.co/storage/v1/object/public/produtos/bolsa-marrom/frente.webp`.
- `photo_urls` recebe uma lista com uma URL por foto extra, na ordem da galeria. Exemplo de lista no formato do PostgreSQL:

  ```text
  {"https://uoykmyhvfkrajsrfsjtr.supabase.co/storage/v1/object/public/produtos/bolsa-marrom/costas.webp","https://uoykmyhvfkrajsrfsjtr.supabase.co/storage/v1/object/public/produtos/bolsa-marrom/base.webp"}
  ```

## Regras rápidas

- Categorias aceitas: `Roupas`, `Bolsas`, `Calçados` e `Acessórios`.
- Preço sempre em centavos e sem vírgula. R$ 59,90 vira `5990`.
- Deixe `id`, `created_at` e `sold` para o banco preencher automaticamente.
- Use `stock = 1` para uma peça única. Se houver mais unidades, informe a quantidade real. Com `stock = 0`, uma peça publicada aparece como esgotada.
- Para retirar uma peça da vitrine, volte `is_published` para `false`.
- Antes de publicar, confira se as URLs das fotos abrem e se a descrição mostra medidas, conservação e avarias relevantes.
