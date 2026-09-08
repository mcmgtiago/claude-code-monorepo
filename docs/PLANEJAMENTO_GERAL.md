# 📋 Planejamento Geral — Ari.IA Barber

> Última atualização: 2026-08-27  
> Status: 21 commits, 27 rotas de app, CRM/WhatsApp implementado, deploy no Coolify.

---

## 🔴 PENDÊNCIAS CRÍTICAS (impedem venda / uso real)

### 1. QR Code WhatsApp (em andamento)
- **Status**: fix pushado (commit `88ac1f1`), aguardando redeploy + teste
- **Problema resolvido**: endpoint correto `/api/{session}/auth/qr` + await faltando
- **Ação**: Redeploy → testar → escanear QR → confirmar conexão
- **Env var necessária**: `APP_URL=http://URL_DO_ARII` (pra webhook callback)

### 2. Webhook do WhatsApp (validar ponta a ponta)
- **Status**: código implementado, não testado com msg real
- **Depende de**: QR Code funcionar → conexão ativa → mandar msg pro número
- **Fluxo**: msg chega → IA responde → move card CRM → agenda se confirmado
- **Testar**: mandar "quero cortar amanhã" pro número conectado

### 3. Tela de Conversas (funciona mas precisa testar com dados reais)
- **Status**: HTML carrega, mas nunca teve mensagens reais passando
- **Testar após**: WhatsApp conectado + mensagem recebida

### 4. CRM Kanban (testar drag & drop em produção)
- **Status**: drag & drop com HTML nativo (funciona em dev, testar em prod)
- **Melhoria futura**: @dnd-kit pra touch no mobile

### 5. Preços centavos inconsistência residual
- **Verificar**: booking público (`/agendar/$slug`), comandas, financeiro
- Sempre que ver "R$ 4.500,00" em vez de "R$ 45,00", é centavos mostrando errado

---

## 🟡 OTIMIZAÇÕES NECESSÁRIAS (polimento pra profissionalizar)

### 6. Remover rotas /demo/* (10 arquivos)
- São demos mock do Lovable original, sem uso no produto
- **Ação**: deletar `src/routes/demo.*.tsx` + `src/routes/demo.tsx`
- Reduz bundle e confusão no routeTree

### 7. Service Worker cauteloso (SW cacheando demais → "page didn't load")
- **Status**: já corrigido (v3, só cacheia media)
- **Futuro**: considerar remover SW totalmente se PWA não for prioridade neste momento

### 8. Mobile responsividade (testar todas as telas)
- Sidebar: ✅ drawer no mobile
- Dashboard: KPIs 2x2 ✅
- Agenda: scroll horizontal pode ficar apertado no mobile
- CRM Kanban: scroll horizontal necessário (verificar touch)
- **Ação**: testar com iPhone/Android real (DevTools não é suficiente)

### 9. Loading states e error boundaries
- Algumas telas mostram "Carregando…" genérico
- **Melhorar**: skeleton loading (shimmer) em vez de texto
- Error boundaries: "This page didn't load" é genérico — mostrar msg útil

### 10. Formulário de serviço: input de preço em reais
- **Status**: editado mas exibição pode ter casos edge (novo serviço salva centavos correto?)
- **Testar**: criar serviço, editar, verificar que salva/exibe correto

---

## 🟢 MELHORIAS FUTURAS (roadmap pós-lançamento)

### Fase 1: Profissionalizar (1-2 semanas)

| # | Feature | Esforço | Impacto |
|---|---|---|---|
| 11 | **UI/UX da agenda** (inspirado Cal.com/Fresha) | 3-5 dias | Alto — é a tela principal |
| 12 | **Onboarding melhorado** (auto-detect servicos populares, preset de barbearia) | 2 dias | Médio |
| 13 | **Email transacional** (confirmação, reset senha) via Resend/SMTP | 1 dia | Médio — sem email é limitado |
| 14 | **Domínio próprio** (ariia.app ou barber.ariia.app) em vez de sslip.io | 1h | Alto — credibilidade |
| 15 | **Logo ícone PWA** (gerar tamanhos 192/512 corretos, splash screen) | 2h | Baixo |
| 16 | **Termos de uso + Privacidade** (páginas placeholder) | 1h | Legal/compliance |

### Fase 2: Monetização (2-4 semanas)

| # | Feature | Esforço | Impacto |
|---|---|---|---|
| 17 | **Stripe Checkout** (pagamento de plano) | 3-5 dias | Crítico pra monetizar |
| 18 | **Trial automático** (7/14 dias grátis → bloqueia sem pagamento) | 2 dias | Alto |
| 19 | **Portal do cliente** (auto-serviço: trocar plano, cancelar, faturas) | 3 dias | Médio |
| 20 | **Multi-barbearia via master** (escala: vender pra redes) | 2 dias | Alto |

### Fase 3: WhatsApp Avançado (3-6 semanas)

| # | Feature | Esforço | Impacto |
|---|---|---|---|
| 21 | **Lembretes automáticos** (cron: D-1 e D0 via WAHA) | 3 dias | Alto — reduz no-show |
| 22 | **Reativação automática** (cron: clientes >30d → msg automática) | 2 dias | Alto — recupera receita |
| 23 | **Campanha broadcast** (enviar pra lista com intervalo anti-ban) | 5 dias | Alto — marketing |
| 24 | **NPS automático** (após fechar comanda → link NPS via WhatsApp) | 1 dia | Médio |
| 25 | **IA com RAG** (knowledge base: perguntas sobre a barbearia) | 1 sem | Diferencial |
| 26 | **Pedir avaliação Google automático** (pós-atendimento) | 1 dia | Médio |

### Fase 4: Escala e Multi-Vertical (ongoing)

| # | Feature | Esforço | Impacto |
|---|---|---|---|
| 27 | **Ari.IA Salon** (beleza — já tem código base) | 2 sem | Novo mercado |
| 28 | **Ari.IA Estética** (medspa) | 2 sem | Novo mercado |
| 29 | **App React Native** (se PWA não basta) | 4-8 sem | Experiência mobile |
| 30 | **API pública** (webhooks + REST pra integrações) | 2 sem | Enterprise |
| 31 | **Multi-idioma** (pt/en/es) | 3 dias | Expansão LATAM |
| 32 | **White-label** (cada rede com sua marca) | 1 sem | Enterprise |

---

## 🧹 ORGANIZAÇÃO DO CÓDIGO (housekeeping)

### Limpeza
- [ ] Deletar 10 rotas `/demo/*` (mock não usado)
- [ ] Remover `_lp-backup.tsx.txt` (LP vai ser projeto separado)
- [ ] Limpar `console.log` / `console.warn` desnecessários
- [ ] Remover imports não usados (Scissors, etc que foram trocados pelo logo)
- [ ] Unificar formatação de preço (usar `formatCents` sempre pra BD, `formatBRL` pra valores já em reais)

### Estrutura de pastas (futuro)
```
src/
├── routes/
│   ├── app/           # Admin routes (mover de app.*.tsx → app/*.tsx)
│   ├── barbeiro/      # PWA Barbeiro
│   ├── cliente/       # PWA Cliente
│   └── api/           # Webhooks
├── modules/
│   ├── crm/           # Tudo de WhatsApp/CRM junto
│   ├── agenda/        # Tudo de agendamento
│   └── financeiro/    # Comandas + caixa
├── components/
│   ├── ui/            # shadcn
│   └── business/      # Componentes de domínio
└── lib/
    ├── server/        # *.server.ts (WAHA, AI, billing)
    └── shared/        # utils, format, plan-features
```
*Nota: mover pro flat routes (pasta) é breaking change no TanStack — fazer por sprint, não tudo de uma vez.*

### Testes (fase futura)
- [ ] E2E com Playwright (fluxo: signup → onboarding → agendar → comanda → fechar)
- [ ] Unit tests: `formatCents`, `parseAiOutput`, `buildSystemPrompt`
- [ ] Integration test: webhook → IA responde → card move

### CI/CD
- [ ] GitHub Actions: build + typecheck a cada push
- [ ] Auto-deploy no Coolify via webhook (configurar 1x)
- [ ] Branch protection: só merge com build passando

---

## 📊 MÉTRICAS DO PROJETO

| Métrica | Valor |
|---|---|
| Commits | 21 |
| Rotas admin | 27 |
| Rotas demo (pra deletar) | 10 |
| PWAs | 3 (admin, barbeiro, cliente) |
| Tabelas no banco | 21+ |
| Features implementadas | ~35 |
| Features do mercado (Trinks ref) | 14/16 |
| Linhas de código (negócio) | ~8.000+ |
| Deploy | Coolify (Docker, node-server) |
| WhatsApp | WAHA (engine WEBJS) |
| IA | Claude Opus 4.8 via gateway |

---

## 🗓️ PRIORIDADE AMANHÃ

1. ✅ Verificar QR Code (redeploy + teste)
2. Configurar `APP_URL` no Coolify (pra webhook funcionar)
3. Conectar WhatsApp via QR → testar fluxo msg → IA → CRM → agenda
4. Deletar rotas demo (limpeza rápida)
5. Testar responsividade no celular real
6. Começar **documentação completa** do sistema

---

## 📝 DOCUMENTAÇÃO PENDENTE (a fazer)

1. **MANUAL.md** — como operar o sistema (tipo o MANUAL.md que o atendezap tinha)
2. **DEPLOY.md** — como fazer deploy fresh (Coolify + WAHA + Supabase + envs)
3. **ARCHITECTURE.md** — visão geral da stack, módulos, fluxos
4. **API.md** — endpoints do webhook, RPC functions, como integrar
5. **CHANGELOG.md** — o que mudou em cada versão

---

Boa noite. Amanhã testa o QR e me diz. Se não funcionar, o Console do browser vai dizer o que preciso arrumar. 🤝
