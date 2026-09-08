# Praga Zero Dedetização — Template premium multi-modelo

Template local para criar landing pages de dedetização/controle de pragas com **Next.js 14**, **cores dinâmicas**, **logo por cliente**, **mídias Pexels** e painel de criação de páginas.

## Stack

- Next.js 14.2 App Router
- TypeScript strict
- Tailwind CSS 3.4 com CSS variables dinâmicas
- Framer Motion
- Radix UI/shadcn básico
- lucide-react
- Geolocalização por IP com fallback Vercel/Cloudflare/ipapi.co
- Mídias remotas do Pexels via URLs curadas

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra:

```txt
http://localhost:3000
```

No preview desta sessão, o projeto também roda em:

```txt
http://localhost:3007
```

## Rotas principais

- `/` — landing padrão (`praga-zero`)
- `/praga-zero` — modelo padrão premium urbano
- `/controle-total` — modelo residencial/familiar
- `/blindagem-24h` — modelo emergência 24h
- `/higieniza-pragas` — modelo comercial/industrial
- `/porto-pragas` — modelo clean saúde
- `/admin` — painel local de modelos
- `/admin/new` — criar nova página local

## Como criar uma nova página pelo painel

1. Rode o projeto localmente.
2. Acesse `/admin`.
3. Clique em **Criar nova página**.
4. Preencha:
   - nome da empresa
   - slug da página
   - WhatsApp
   - e-mail
   - cidade padrão
   - logo
   - paleta
   - conjunto Pexels
5. Clique em **Criar página**.
6. O sistema grava:
   - `config/tenants/<slug>.json`
   - `public/tenants/<slug>/logo.*`
7. A página fica disponível em `/<slug>`.

> Importante: este painel é para uso **local no seu PC**. Na Vercel, escrita de arquivos não é persistente sem banco/storage externo.

## Personalização por arquivo

Cada página/modelo fica em:

```txt
config/tenants/<slug>.json
```

Ali você troca:

- nome da empresa
- telefone/WhatsApp
- e-mail
- logo
- cidade e bairros
- paleta de cores
- conjunto de mídia

A copy principal continua em:

```txt
config/siteConfig.ts
```

## Como as cores funcionam

1. O tenant salva cores em HEX.
2. `lib/theme.ts` converte HEX para HSL.
3. `components/theme-provider.tsx` injeta CSS variables.
4. As classes Tailwind já existentes (`bg-primary`, `text-primary`, `bg-surface`, etc.) atualizam automaticamente.

Arquivos importantes:

- `lib/theme.ts`
- `components/theme-provider.tsx`
- `app/globals.css`
- `config/tenants/*.json`

## Mídias Pexels

Os conjuntos de mídia ficam em:

```txt
config/pexels-curated.ts
```

Cada conjunto tem:

- hero em vídeo ou imagem
- poster
- galeria com 4 fotos
- imagem OG
- crédito Pexels

Para trocar o visual de um modelo, altere o `setId` em `config/tenants/<slug>.json`.

## Gerar os modelos iniciais novamente

```bash
node scripts/seed-tenants.mjs
```

Isso recria os modelos:

- `controle-total`
- `blindagem-24h`
- `higieniza-pragas`
- `porto-pragas`

## Variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Variáveis:

```env
IPAPI_KEY=
NEXT_PUBLIC_WHATSAPP=51999999999
NEXT_PUBLIC_SITE_URL=https://seusite.com.br
```

A chave `IPAPI_KEY` é opcional. Sem ela, o template usa headers da Vercel/Cloudflare ou fallback para Porto Alegre/RS.

## Build

```bash
npm run build
```

## Deploy na Vercel

1. Crie os modelos localmente.
2. Faça commit dos JSONs e logos gerados.
3. Suba para GitHub.
4. Importe na Vercel.
5. Configure `NEXT_PUBLIC_SITE_URL` e `IPAPI_KEY` se quiser.
6. Deploy.

## SEO local

Cada tenant gera:

- title com cidade detectada
- meta description com cidade/estado
- Open Graph com mídia do tenant
- JSON-LD `LocalBusiness`
- JSON-LD `FAQPage`
- JSON-LD `Service`
- `robots.txt`
- `sitemap.xml`

## Observações comerciais

- A copy é reutilizável para acelerar venda.
- O cliente percebe valor trocando logo, cor, cidade e mídia.
- Você pode cobrar mais pelo visual premium com vídeo e galeria realista.
- CNAE sugerido para controle de pragas urbanas: `8122-2/00`.
