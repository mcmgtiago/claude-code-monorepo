# Como Obter a Service Role Key

A `SUPABASE_SERVICE_ROLE_KEY` é necessária para operações server-side (migrations, admin operations).

## Passo 1: Acessar o Dashboard

1. Abra: https://app.supabase.com/project/dxvamljoffvbpruljiqa/settings/api
2. Faça login com sua conta Supabase (mesma que criou o projeto)

## Passo 2: Copiar a Chave

Na seção **"Project API keys"**, você vai ver:

```
Project URL:
https://dxvamljoffvbpruljiqa.supabase.co

Publishable key (anon):
sb_publishable_kgv2lh6ekHz0Bx9Sgy_H_w_ZKKrsffz

Secret key (service_role):
[COPIE ESTE VALOR]
```

**⚠️ ATENÇÃO**: A `secret key` é sensível. Nunca commite `.env` com ela em git.

## Passo 3: Preencher no .env

```bash
# .env (ambos os projetos)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Verificação

```bash
# Conectar ao projeto
supabase link --project-ref dxvamljoffvbpruljiqa

# Deve retornar:
# ✓ Linked to project: dxvamljoffvbpruljiqa
```

---

## Se perdeu a secret key

Se a chave foi exposta ou perdida:

1. Vá para: https://app.supabase.com/project/dxvamljoffvbpruljiqa/settings/api
2. Botão **"Regenerate"** perto da secret key
3. Confirme (vai revogar a chave antiga)
4. Copie a nova chave
5. Atualize no `.env`

---

## Usar via CLI

Após preencher `SUPABASE_SERVICE_ROLE_KEY`, você pode:

```bash
# Rodar migrations localmente
supabase db pull  # Puxa schema do cloud pro local

supabase migration up  # Roda migrations locais

supabase db push  # Empurra schema local pro cloud (cuidado!)
```

