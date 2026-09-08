# 🔐 Credenciais e APIs — Ari.IA (NÃO COMMITAR EM REPO PÚBLICO)

> Arquivo central de credenciais. Mantenha seguro. Última atualização: 2026-08-27

---

## Supabase (compartilhado: barbearia + beleza)

| Campo | Valor |
|---|---|
| Project ID | `dxvamljoffvbpruljiqa` |
| URL | `https://dxvamljoffvbpruljiqa.supabase.co` |
| Publishable (anon) | `sb_publishable_kgv2lh6ekHz0Bx9Sgy_H_w_ZKKrsffz` |
| Service Role (secret) | `sb_secret_UhERg8ArZxl6Cx1_vvBW0Q_IExxK65s` |
| Dashboard | https://app.supabase.com/project/dxvamljoffvbpruljiqa |

---

## WAHA (WhatsApp HTTP API)

| Campo | Valor |
|---|---|
| URL | `http://coolify.velocitycompany.com.br:3001` |
| API Key | `sua-senha-forte-aqui` |
| Header de auth | `X-Api-Key: sua-senha-forte-aqui` |
| Dashboard | http://coolify.velocitycompany.com.br:3001/dashboard |
| Dashboard user | `admin` |
| Dashboard pass | `e01a906543f04c5b8337f0a8c7d97873` |
| Swagger | http://coolify.velocitycompany.com.br:3001/swagger |

⚠️ **TROCAR a API key `sua-senha-forte-aqui`** por uma segura antes de produção real.
Rodava no Coolify como serviço `waha`. Env var: `WAHA_API_KEY` (ou WHATSAPP_API_KEY).

---

## IA — Claude Opus 4.8 (via gateway)

| Campo | Valor |
|---|---|
| Base URL | `https://avellogateway.online` (env global no Windows) |
| Auth Token | `ANTHROPIC_AUTH_TOKEN` (env global no Windows — não expor) |
| Modelo | `claude-opus-4-8` |

Configurado como variável de ambiente global no Windows. O código lê `process.env.ANTHROPIC_AUTH_TOKEN`.

---

## GitHub

| Repo | URL |
|---|---|
| Ari.IA Barber | https://github.com/mcmgtiago/ari-barber (privado) |

---

## Coolify (deploy)

| Campo | Valor |
|---|---|
| Painel | https://coolify.velocitycompany.com.br |
| App Ari.IA URL | http://w138tw8llogdnmz2st3esf5w.77.37.68.89.sslip.io (deploy atual) |

### Env Vars necessárias no Ari.IA (Coolify):
```
SUPABASE_URL=https://dxvamljoffvbpruljiqa.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_kgv2lh6ekHz0Bx9Sgy_H_w_ZKKrsffz
SUPABASE_SERVICE_ROLE_KEY=sb_secret_UhERg8ArZxl6Cx1_vvBW0Q_IExxK65s
WAHA_API_URL=http://coolify.velocitycompany.com.br:3001
WAHA_API_KEY=sua-senha-forte-aqui
```
### Build Args (Coolify):
```
VITE_SUPABASE_URL=https://dxvamljoffvbpruljiqa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_kgv2lh6ekHz0Bx9Sgy_H_w_ZKKrsffz
```

---

## Atendezap (referência — não em produção)

| Campo | Valor |
|---|---|
| Payments token (test) | `test_e8bbc66a31101bc101b29b90e83` (Paddle) |
| Payments token (live) | `live_02780bf01f9e541916a75e81406` (Paddle) |
| Supabase original | project ref `dxvamljoffvbpruljiqa` (mesmo do Ari.IA) |

---

## Contas de teste (Ari.IA)

| Empresa | Login | Senha |
|---|---|---|
| Junior Barber (real) | `mcmgtiagoonline@gmail.com` | `Barber2026!` |
| Junior Barber (demo) | `demojunior@ariia.app` | `demojunior` |

Company IDs:
- Junior Barber real: `ecdd67c5-2972-40f4-a5d9-4598a5bdf69d`
- Junior Barber demo: `3bc3516c-628c-4fdc-8065-8ee4d717fb3c`

---

## SQL Migrations aplicadas (Supabase)

Todas em `docs/`:
- `DEFINITIVE_SCHEMA.sql` — schema base
- `012_PRODUCTION_RLS.sql` — RLS multi-tenant
- `013_BRANCHES_TABLE.sql` — filiais
- `014_CUSTOMER_BIRTHDAY.sql` — aniversário
- `015_WAITLIST_NPS.sql` — lista de espera + NPS
- `016_GOOGLE_REVIEW.sql` — link Google review
- `017_CRM_WHATSAPP.sql` — CRM/WhatsApp
- `018_REALTIME_APPOINTMENTS.sql` — realtime agendamentos
