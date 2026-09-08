# VeloHUB — Instruções para Claude Code

## Stack
- TanStack Start (SSR) + TanStack Router (file-based routing)
- Supabase (PostgreSQL + Auth + Realtime + RLS) — project ref: `dxvamljoffvbpruljiqa`
- Bun como package manager (porta dev: 8081)
- shadcn/ui + Tailwind CSS 4
- Velo brand green: `#0efa71` (primary), `#00b858` (dark), `#050f07` (fg on green)

## Padrão para tabelas sem tipo gerado
Tabelas criadas após geração do `database.types.ts` não têm tipagem.
Usar sempre: `(supabase as any).from("nome_tabela")` — nunca cast parcial inline.

## Deploy
- Coolify app UUID: `t12772180nitefpmiohq5cu5`
- Domínio produção: `hub.velocitycompany.com.br`
- Coolify API base: `http://77.37.68.89:8000/api/v1`

## Regras de negócio
- Planos são configurados manualmente via Supabase SQL (creator only). Não expor UI de planos para usuários finais.
- Rodapé sempre com "Desenvolvido por Velo" e link hub.velocitycompany.com.br
