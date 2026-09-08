# BeautyFlow AI — Documentação de Features

## Visão Geral

SaaS multi-tenant para salões de beleza e estúdios de estética. Stack: TanStack Start + Supabase + shadcn/ui + Bun.  
Porta local: **:5173**

---

## ✅ Features Implementadas

### 1. Agendamento Online (`/app/agendamentos` + `/agendar/$slug`)
- **Status**: ✅ Completo (208 + 261 linhas)
- Lista de agendamentos com filtro por data
- Criação com: cliente, profissional, serviço, data, hora, observações
- Link público de booking (`/agendar/$slug`)
- Seleção de serviço por profissional disponível
- Forma de pagamento selecionável no ato

### 2. Gestão Financeira (`/app/financeiro`)
- **Status**: ✅ Básico (132 linhas)
- Lançamentos com tipo (receita/despesa)
- Filtro por período
- Resumo de saldo
- Menos robusto que barbearia (sem categorias detalhadas)

### 3. Profissionais (`/app/profissionais`)
- **Status**: ✅ Completo (161 linhas)
- CRUD com nome, email, telefone, especialidade
- Horário de atendimento (hora_inicio, hora_fim)
- Dias de atendimento (JSON configurável)
- Ativar/desativar

### 4. Pacotes de Serviços (`/app/pacotes` + `/app/pacotes-clientes`)
- **Status**: ✅ Completo (125 + 138 linhas)
- Criação de pacotes: nome, descrição, total de sessões, validade em dias, valor
- Serviços incluídos no pacote (array)
- Venda de pacote para cliente (`pacote_cliente`)
- Tracking: sessões usadas vs. total
- Status: ativo / expirado / consumido / cancelado
- Link público para vender pacote (`/pacotes/$slug`)

### 5. Clientes (`/app/clientes`)
- **Status**: ✅ Básico (141 linhas)
- CRUD com nome, telefone, email, data de nascimento, observações
- Status ativo/inativo
- **Tem campo `data_nascimento`** (diferente de barbearia)

### 6. Relatórios (`/app/relatorios`)
- **Status**: ⚠️ Parcial (70 linhas — pouco código)
- Estrutura básica de relatório
- Menos robusto que barbearia

### 7. Equipe (`/app/equipe`)
- **Status**: ✅ Básico (112 linhas)
- CRUD de membros da equipe
- Roles: owner, admin, staff

### 8. Site do Estabelecimento (`/agendar/$slug`)
- **Status**: ✅ Completo (261 linhas)
- Link público por salão
- Seleção de serviço → profissional → data/hora
- Branding por empresa (cor primária)

### 9. AI Growth Engine (`/app/ai-growth`)
- **Status**: ⚠️ Demo (155 linhas)
- Usa dados mock (`demoAIInsights`)
- Chat simulado (não conecta a IA real)
- Interface bonita mas não funcional

### 10. Configurações (`/app/configuracoes`)
- **Status**: ✅ Básico (168 linhas)
- Dados da empresa
- Personalização (cor, logo)
- Horários de funcionamento

### 11. Onboarding (`/app/onboarding`)
- **Status**: ✅ Completo (197 linhas)
- Wizard de configuração inicial
- Dados da empresa → profissionais → serviços → pronto

---

## ❌ Features Ausentes (Comparação com Mercado)

| Feature | Status | Comentário |
|---|---|---|
| Lembretes de Horários | ❌ | Não implementado (existe em barbearia) |
| Programa de Fidelidade | ❌ | Não implementado (existe em barbearia) |
| Envio de Notícias e Promoções | ❌ | Não implementado |
| Pagamento Online | ❌ | Sem checkout ou gateway |
| Gestão de Estoque | ❌ | Sem tabela `product` |
| Comandas e Controle de Consumo | ❌ | Sem tabela `sale` |
| Aniversariantes | ⚠️ | Campo `data_nascimento` existe no `cliente`, mas sem tela/alerta |
| Lista de Espera | ❌ | Não implementado |
| Mensagens de Retorno Automáticas | ❌ | Não implementado |
| Pesquisa de Satisfação / NPS | ❌ | Não implementado |
| Clube de Clientes | ❌ | Não existe (existe em barbearia como `club_plan`) |
| Comissões | ⚠️ | Mencionado em demo de relatórios, mas sem cálculo real |
| Vales de Profissionais | ❌ | Não implementado |

---

## 📊 Resumo por Arquivo

| Rota | Linhas | Complexidade |
|---|---|---|
| `agendar.$slug.tsx` | 261 | Média (booking público) |
| `app.agendamentos.tsx` | 208 | Média |
| `app.onboarding.tsx` | 197 | Média |
| `app.dashboard.tsx` | 180 | Baixa-Média |
| `app.configuracoes.tsx` | 168 | Baixa |
| `app.profissionais.tsx` | 161 | Baixa |
| `app.ai-growth.tsx` | 155 | Baixa (demo) |
| `app.servicos.tsx` | 143 | Baixa |
| `app.clientes.tsx` | 141 | Baixa |
| `app.pacotes-clientes.tsx` | 138 | Baixa |
| `app.financeiro.tsx` | 132 | Baixa |
| `app.pacotes.tsx` | 125 | Baixa |
| `app.equipe.tsx` | 112 | Baixa |
| `app.relatorios.tsx` | 70 | Mínima |

**Total de código de negócio**: ~2.191 linhas (rotas) + componentes + lib

---

## 🏗️ Arquitetura

- **Auth**: Supabase Auth + `is_super_admin()` + `claim_super_admin_if_empty()`
- **Tenancy**: `company_id` em tudo + `has_salao_access()` RLS (via views)
- **Roles**: super_admin (global), owner/admin/staff (por tenant)
- **Plans**: Starter/Pro/Business (sem gate implementado no FE)
- **Deploy**: Cloudflare Workers via `wrangler.jsonc`

---

## 🔑 Diferencial vs. Barbearia

| Aspecto | Beleza tem | Barbearia não tem |
|---|---|---|
| Pacotes de sessões | ✅ (com validade e tracking) | ❌ |
| Data de nascimento do cliente | ✅ | ❌ |
| Dias de atendimento por profissional | ✅ (JSON) | ❌ |
| Horário individual por profissional | ✅ (hora_inicio/fim) | ❌ |
| Venda pública de pacotes | ✅ (`/pacotes/$slug`) | ❌ |

