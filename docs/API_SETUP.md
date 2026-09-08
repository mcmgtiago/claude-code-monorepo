# Setup Compartilhado: Barbearia + Beleza

Guia prático para rodar ambos os sistemas localmente com um Supabase compartilhado.

## 📦 Supabase Compartilhado

**Project ID**: `dxvamljoffvbpruljiqa`  
**URL**: https://dxvamljoffvbpruljiqa.supabase.co  
**Publishable Key**: `sb_publishable_kgv2lh6ekHz0Bx9Sgy_H_w_ZKKrsffz`

### Credenciais (Salve com cuidado)

```bash
SUPABASE_URL=https://dxvamljoffvbpruljiqa.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_kgv2lh6ekHz0Bx9Sgy_H_w_ZKKrsffz
SUPABASE_SERVICE_ROLE_KEY=[PREENCHIDO NO DASHBOARD]
```

Acesse: https://app.supabase.com/project/dxvamljoffvbpruljiqa/settings/api

---

## 🚀 Rodar Localmente

### Pré-requisitos

- `bun` (runtime)
- Supabase CLI (opcional, pra gerenciar migrations)
- Node.js 18+ (se não tiver bun)

### 1️⃣ Setup Barbearia

```bash
cd barbearia
bun install

# .env já vem pré-configurado com o Supabase compartilhado
cat .env

# Verificar conexão
bun run dev
# Ctrl+C para parar
```

**Espera por**: `Vite v7.x ready in xxxms` e local URL `http://localhost:8080`

### 2️⃣ Setup Beleza

```bash
cd beleza
bun install

# .env já vem pré-configurado com o Supabase compartilhado
cat .env

# Verificar conexão (use porta diferente se barbearia ainda está rodando)
bun run dev
# Espera a mesma mensagem do Vite
```

### ✅ Verificar se funcionam

- **Barbearia**: http://localhost:8080 → deve chamar `/entrar` e carregar
- **Beleza**: http://localhost:5173 (ou outra porta, confira `bun run dev`)

Se ambos carregarem sem erro no console, a conexão com Supabase está OK.

---

## 🗄️ Schema Compartilhado

Ambos os sistemas usam o **mesmo schema PostgreSQL** (tabelas em `public`).

### Nomes de Tabelas (Glossário)

| Conceito | Barbearia (en) | Beleza (pt) | Schema |
|---|---|---|---|
| Tenant/Salão | `company` | `salao` (alias) | `company` |
| Usuário-Tenant | `company_user` | `salao_user` (alias) | `company_user` |
| Profissional | `professional` | `profissional` (alias) | `professional` |
| Serviço | `service` | `servico` (alias) | `service` |
| Cliente | `customer` | `cliente` (alias) | `customer` |
| Agendamento | `appointment` | `agendamento` (alias) | `appointment` |
| Financeiro | `financial_entry` | `lancamento` (alias) | `financial_entry` |

**Observação**: O schema físico usa nomes em English (barbearia). O Beleza adapta internamente via aliases/views (TBD) ou renomeia nas queries client-side.

### Tabelas Compartilhadas

```
app_config              → config global (nome app, super admins)
user_roles              → roles globais (super_admin)
plan                    → planos comerciais (starter/pro/business)
subscription            → assinatura por company
billing_event_log       → webhooks de cobrança
```

### Tabelas por Tenant

Todas isoladas via `company_id` e RLS:

```
company
company_user
professional
service
professional_service
customer
appointment
product
sale
sale_item
club_plan
club_member
financial_entry
invoice_simulated
```

---

## 🔐 Permissões de Linha (RLS)

Toda tabela de tenant usa:

```sql
CREATE POLICY "by_company" ON table_name
  FOR ALL TO authenticated
  USING (
    public.has_company_access(company_id)
  );
```

Função auxiliar (criada automaticamente nas migrations):

```sql
CREATE FUNCTION has_company_access(company_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_user
    WHERE company_user.company_id = $1
      AND company_user.user_id = auth.uid()
      AND company_user.ativo = true
  );
$$ LANGUAGE SQL SECURITY DEFINER;
```

**Resultado**: Usuários veem apenas dados de `company_id` onde `company_user.user_id = auth.uid()`.

---

## 📋 Enums (Tipos)

```sql
-- Roles
app_role          → 'super_admin'
tenant_role       → 'owner', 'admin', 'staff'

-- Planos
plano_type        → 'starter', 'pro', 'business', 'trial'
ciclo_type        → 'mensal', 'semestral', 'anual'
status_cobranca   → 'ativo', 'suspenso', 'cancelado', 'atrasado'

-- Agendamento
appointment_status  → 'agendado', 'confirmado', 'realizado', 'cancelado', 'no_show'
appointment_source  → 'internal', 'booking_link', 'whatsapp'

-- Cliente
customer_status   → 'ativo', 'inativo', 'bloqueado'

-- Financeiro
financial_type    → 'receita', 'despesa', 'comissao'
financial_status  → 'pendente', 'realizado', 'cancelado'

-- Pagamento (Beleza)
forma_pagamento   → 'cartao', 'dinheiro', 'transferencia', 'pix'

-- Pacotes (Beleza)
pacote_status     → 'ativo', 'expirado', 'consumido', 'cancelado'
```

---

## 🔑 Primeiros Passos

### 1. Criar Super Admin

O **primeiro usuário** que se cadastra em `/entrar` vira `super_admin` automaticamente (RPC `claim_super_admin_if_empty`).

1. Abra http://localhost:8080/entrar (barbearia) ou http://localhost:5173/entrar (beleza)
2. **Criar conta** com seu e-mail (ex: `seu@email.com`)
3. Confirme no inbox (check spam)
4. Faça login → acesse `/master/painel` → você é Super Admin ✅

### 2. Criar Planos

Vá em `/master/planos` (ambos os sistemas):

- **Starter**: R$ 0/mês (trial 7 dias), features básicas
- **Pro**: R$ 99/mês, multiprofissional + comissões
- **Business**: R$ 299/mês, todas as features + clube

### 3. Criar Primeira Empresa

Vá em `/master/novaBarbearia` (barbearia) ou `/master/novo` (beleza):

- Nome: "Barbearia XYZ" ou "Salão de Beleza ABC"
- E-mail do owner
- Plano: "Pro"
- Sistema gera senha provisória (show na tela, nenhum e-mail)

### 4. Teste o Tenant

Owner faz login com e-mail + senha provisória.  
Vai direto para `/app/onboarding` (ou `/app/dashboard`).

---

## 🛠️ Arquitetura de Features

### Gating por Plano

Ambos usam `plan-features.ts`:

```typescript
export const PLAN_FEATURES = {
  starter: {
    multiprofissional: false,
    comissoes: false,
    fidelidade: false,
    clubeAssinatura: false,
    relatoriosAvancados: false,
  },
  pro: {
    multiprofissional: true,
    comissoes: true,
    fidelidade: true,
    clubeAssinatura: false,
    relatoriosAvancados: true,
  },
  business: {
    multiprofissional: true,
    comissoes: true,
    fidelidade: true,
    clubeAssinatura: true,
    relatoriosAvancados: true,
  },
};

// Uso no código
featureEnabled(company.selected_plan_slug, 'multiprofissional')  // → true/false
```

Telas e rota ocultas via:

```typescript
if (!featureEnabled(plan, 'clubeAssinatura')) {
  return <Redirect to="/app/dashboard" />;
}
```

---

## 📊 Diferenças entre Verticais

### Barbearia (`BarbeiroPro AI`)

- **Foco**: Agendamento + comissões por profissional + fidelidade
- **Rotas principais**: `/app/agenda`, `/app/comandas`, `/app/profissionais`, `/app/lembretes`, `/app/clube`
- **Especificidades**: Comissões, clube de assinatura, reminder via WhatsApp 1-clique
- **Schema**: `professional`, `appointment`, `sale`, `commission` (via RPC ou FE calc)

### Beleza (`BeautyFlow AI`)

- **Foco**: Agendamento + pacotes de sessões + estética
- **Rotas principais**: `/app/agendamentos`, `/app/pacotes`, `/app/pacote-cliente`, `/app/profissionais`
- **Especificidades**: Pacotes (N sessões com validade), tracking de consumo, dias de atendimento
- **Schema**: `professional`, `appointment`, `club_plan` (reuso como pacote), `club_member` (reuso como pacote_cliente)

### Compartilhado

- Auth (sign up, sign in, reset)
- Master admin (painel, planos, empresas)
- Billing webhooks (Kiwify, Cakto, etc.)
- RLS + tenancy
- Planos e features

---

## 🐛 Troubleshooting

### ❌ "Missing Supabase environment variable"

**Causa**: `.env` não foi carregado ou SUPABASE_URL está vazio.

**Fix**:
```bash
# Verificar .env
cat .env

# Deve ter:
SUPABASE_URL=https://dxvamljoffvbpruljiqa.supabase.co
VITE_SUPABASE_URL=https://dxvamljoffvbpruljiqa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Se vazio, copia do bloco acima desta seção.

### ❌ "Unauthorized: you do not have permission to access"

**Causa**: Usuário não está em `company_user` com `ativo=true`.

**Fix**: Super admin cria no `/master/novaBarbearia` ou edita em `/master/equipe`.

### ❌ "RLS denied" ou erro ao deletar

**Causa**: RLS está bloqueando. Verificar `has_company_access()`.

**Debug**:
```bash
# No Supabase dashboard → SQL Editor
SELECT * FROM public.company_user
WHERE user_id = auth.uid();
```

Deve retornar pelo menos 1 linha com `ativo = true`.

### ❌ Port 8080 já está em uso

**Fix**:
```bash
# Barbearia em 8080, Beleza em porta diferente
cd beleza
bun run dev -- --host 127.0.0.1 --port 5173
```

---

## 📝 Próximos Passos

1. **Unificar banco**: Use este schema único pra ambos
2. **Adicionar WhatsApp**: Evolution API (já presente no atendezap, TBD aqui)
3. **Billing real**: Conectar Kiwify/Cakto/PerfectPay webhooks
4. **Mobile**: React Native ou web PWA
5. **Documentação API**: OpenAPI/Swagger para integrations

---

## 📞 Contato / Suporte

Qualquer dúvida:
- Verifique `.env` primeiro
- Confira RLS no Supabase dashboard → SQL Editor
- Teste queries manualmente
- Check console logs em dev (`bun run dev`)

