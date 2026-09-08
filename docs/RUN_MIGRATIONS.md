# Rodando as Migrations

Como não temos acesso direto ao CLI do Supabase sem `SUPABASE_ACCESS_TOKEN`, vamos usar o **SQL Editor** do browser.

## Opção 1: SQL Editor (Recomendado — 2 minutos)

1. Abra: https://app.supabase.com/project/dxvamljoffvbpruljiqa/sql/new
2. Faça login se necessário
3. **Abra o arquivo** `docs/MIGRATIONS_CONSOLIDATED.sql`
4. **Copie todo o conteúdo** SQL
5. No SQL Editor, **Ctrl+A** → **Delete** → **Ctrl+V** (colar o SQL)
6. Clique **"Run"** (ícone de play ou Ctrl+Enter)
7. **Aguarde** ~10-15s por "Execution completed successfully"
8. ✅ Pronto! Schema criado.

### Verificar se funcionou

Após rodar, vá em: **Table Editor** (menu esquerdo) → deve aparecer todas as tabelas:

- `app_config`
- `user_roles`
- `company`
- `company_user`
- `professional`
- `service`
- `customer`
- `appointment`
- `product`, `sale`, `sale_item`
- `club_plan`, `club_member`
- `financial_entry`
- etc.

Se ver tudo isso, **migrations rodaram com sucesso**!

---

## Opção 2: psql (Se tiver PostgreSQL instalado)

```bash
# Salvar a connection string (troque YOUR-PASSWORD pela senha real)
export DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@db.dxvamljoffvbpruljiqa.supabase.co:5432/postgres"

# Rodar o arquivo SQL
psql $DATABASE_URL < docs/MIGRATIONS_CONSOLIDATED.sql
```

Esperar "CREATE TABLE", "CREATE INDEX", "CREATE POLICY" lines. Sem erros = sucesso.

---

## Opção 3: DBeaver ou outro cliente SQL

1. Conexão PostgreSQL:
   - Host: `db.dxvamljoffvbpruljiqa.supabase.co`
   - Port: `5432`
   - User: `postgres`
   - Password: [sua senha]
   - Database: `postgres`

2. Abrir `docs/MIGRATIONS_CONSOLIDATED.sql`
3. **Execute all** (ou Ctrl+Enter por bloco)
4. Check results

---

## Depois: Testar Conexão no App

Uma vez migrations rodadas, teste ambos os apps:

### Barbearia

```bash
cd barbearia
bun run dev
# Acesse http://localhost:8080/entrar
# Se carregar sem erro de Supabase, deu certo!
```

### Beleza

```bash
cd beleza
bun run dev
# Acesse http://localhost:5173/entrar (ou porta exibida)
# Se carregar, sucesso!
```

Ambos devem carregar `/entrar` com a interface de login. Se vir erro no console do tipo:

```
[Supabase] Missing Supabase environment variable(s)
```

→ Confira `.env` se tem `SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.

---

## ⚠️ Troubleshooting

### "Permission denied" ao rodar SQL

**Causa**: User `postgres` não tem permissão (improvável em Supabase).

**Fix**: Use o **SQL Editor do browser** (tem permissão total).

### "Table already exists"

**Causa**: Migrations já rodaram antes (schema já existe).

**Fix**: 
- Se quer limpar tudo: No SQL Editor → `DROP SCHEMA public CASCADE;` → OK
- Depois roda as migrations novamente

### "RLS policy already exists"

**Causa**: Mesmo problema. Policies já criadas.

**Fix**: Mesmo que acima — dropar schema ou ignorar o erro (won't impacta).

---

## Confirmação Final

Quando tudo rodar:

```bash
# Terminal 1: Barbearia
cd barbearia && bun run dev

# Terminal 2: Beleza  
cd beleza && bun run dev

# Terminal 3: Teste
curl http://localhost:8080  # Must 200 OK (HTML)
curl http://localhost:5173  # Must 200 OK (HTML)
```

Ambas as URLs devem carregar a página sem erro de Supabase.

✅ **Setup concluído!**

