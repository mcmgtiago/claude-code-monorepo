# 06 — Mensalidade de Gestão

> **O que você faz todo mês pelo cliente.** Este é o documento que justifica a recorrência. Se o cliente perguntar "por que pago todo mês?", a resposta está aqui.

---

## 6.1 O princípio: operação contínua, não entrega estática

"Um site sem tráfego é um outdoor no deserto."
"Um CRM sem otimização de IA é uma planilha cara."
"Ads sem ajuste semanal é dinheiro jogado fora."

A mensalidade paga por **operação viva** — não por "estar ligado". A diferença é:

| Modo | O que acontece |
|---|---|
| **Sem gestão** (site+CRM entregue e abandonado) | IA fica desatualizada, ads queimam budget, site fica estagnado, cliente cancela em 90 dias |
| **Com gestão mensal** (nosso modelo) | IA melhora todo mês, ads otimizam semanalmente, site evolui, cliente fica 24+ meses |

---

## 6.2 O que a mensalidade cobre — por pacote

### Todas as mensalidades incluem

| Atividade | Frequência | Esforço |
|---|---|---|
| **Monitoramento de uptime** (VPS, CRM, WAHA, site) | Contínuo | Passivo (alertas) |
| **Updates de segurança** (patches OS, dependências) | Mensal ou urgente | 30 min/mês |
| **Backup verificado** (snapshot VPS + Supabase backup) | Semanal | Automático |
| **Otimização de Ads** (ajustar copy, públicos, lances) | 2×/semana (Scale+) | 1–2h/semana |
| **Relatório mensal** (CPL, leads, qualificados, ROI) | 1×/mês | 1h |
| **Suporte WhatsApp** | Horário comercial | Responsivo |
| **Atualizar base de IA** (novos PDFs, FAQ, preços) | Quando cliente pede | 30 min por update |
| **Ajuste de automações** (trigger novo, fluxo diferente) | Quando necessário | 1h cada |

### Start (R$ 697/mês) — escopo

- 1 reunião/mês (30 min)
- Até 1 alteração de página/mês (texto/imagem)
- Gestão de 1 canal de Ads (Meta ou Google)
- 1 campanha ativa otimizada
- Até 3 tickets de suporte/mês (acima: R$ 100/ticket extra)

### Scale (R$ 1.297/mês) — escopo

- 2 reuniões/mês (30 min cada)
- Até 3 alterações de página/mês
- Gestão de 2 canais de Ads (Meta + Google)
- Até 2 campanhas/mês por canal
- Suporte ilimitado em horário comercial
- 1 teste A/B mensal em LP
- 1 post de blog/mês (SEO)
- Otimização de IA mensal (review de handoffs, ajuste de prompt)

### Domina (R$ 2.497/mês) — escopo

- Reunião quinzenal (60 min) + QBR trimestral
- Alterações ilimitadas de página
- Gestão de 3 canais de Ads (Meta + Google + TikTok)
- Até 4 campanhas/mês por canal
- Suporte prioritário SLA 2h úteis
- Testes A/B contínuos
- 4 posts de blog/mês (SEO)
- Otimização semanal de IA (ajuste de prompt, avaliação de handoffs, treinamento com novas conversas)
- Operador dedicado (1–2h/dia de auditoria ativa do funil)
- Dashboard executivo semanal

---

## 6.3 Calendário mensal tipo (cliente Scale)

```
Semana 1 (dia 1–7)
├ Seg: Revisar métricas da semana anterior (ads, leads, IA accuracy)
├ Ter: Otimizar campanhas Meta/Google (ajustar públicos, copies, lances)
├ Qua: Verificar automações (alguma falhou? evento_log empilhado?)
├ Qui: Atualizar base de IA se cliente enviou material novo
└ Sex: Testar fluxo ponta a ponta (fazer lead de teste)

Semana 2 (dia 8–14)
├ Seg: Reunião quinzenal com cliente (no Scale, 1 de 2)
├ Ter: Implementar feedback da reunião (ajustar copy LP, mudar estágio)
├ Qua: A/B test: trocar headline da LP principal
├ Qui: Publicar 1 post de blog (se Scale ou Domina)
└ Sex: Review de handoffs IA→humano (quais a IA errou? ajustar prompt)

Semana 3 (dia 15–21)
├ Seg: Criar remarketing audience (lista de visitantes últimos 14d)
├ Ter: Otimizar campanhas (matar criativos < CTR 1%, adicionar novos)
├ Qua: Suporte acumulado (tickets, dúvidas do atendente do cliente)
├ Qui: Testar novo canal se aplicável (TikTok teste, LinkedIn)
└ Sex: Snapshot backup + update de segurança na VPS

Semana 4 (dia 22–28)
├ Seg: 2ª reunião mensal com cliente
├ Ter: Compilar relatório mensal (CPL, taxa de qualificação, ROI)
├ Qua: Enviar relatório + insights + recomendações pro próximo mês
├ Qui: Planejar próximo mês (novas campanhas? LP nova? IA ajuste?)
└ Sex: Checklist de saúde: tudo rodando, nada quebrado?
```

**Tempo total: ~12–16h/mês para cliente Scale.** Cabe tranquilo com 8–10 clientes.

---

## 6.4 SLA (Service Level Agreement)

| Severidade | Definição | Tempo de resposta | Tempo de resolução |
|---|---|---|---|
| **Crítica** | CRM fora do ar, WhatsApp parou, dados perdidos | 2h útil | 8h útil |
| **Alta** | Agente IA não responde, campanha parada, LP fora | 4h útil | 24h útil |
| **Média** | Bug visual, automação com erro, relatório atrasado | 24h útil | 48h útil |
| **Baixa** | Pedido de feature, ajuste cosmético, pergunta | 48h útil | Próximo sprint |

### Definição de horário útil

**Start**: seg–sex 9h–18h (horário Brasília)
**Scale**: seg–sex 8h–17h (horário Brasília)
**Domina**: seg–sex 8h–20h (horário Brasília) + plantão sáb 9h–12h

> Fora do horário: suporte **emergencial apenas** (CRM/WhatsApp fora do ar). Cobrar R$ 200/chamado urgente fora do horário se quiser.

---

## 6.5 Relatório mensal — o que contém

O relatório é o **artefato mais importante da mensalidade**. É ele que justifica a renovação.

### Estrutura do relatório

```
📊 RELATÓRIO MENSAL — [Nome do Cliente]
Período: [Data início] – [Data fim]

═══ RESUMO EXECUTIVO ═══
• Leads totais no período: XXX
• Leads qualificados pela IA: XXX (XX%)
• Conversões (won): XXX
• ROI estimado: R$ XXX investido → R$ XXX retorno

═══ SITE + LANDING PAGES ═══
• Visitantes únicos: XXX
• Taxa de conversão LP: X.X%
• Bounce rate: XX%
• Páginas mais visitadas: [...]

═══ ANÚNCIOS ═══
• Investimento total (Meta+Google): R$ XXX
• CPL (custo por lead): R$ XX
• CPA (custo por conversão): R$ XX
• CTR médio: X.X%
• Campanhas ativas: X (top performer: [nome])
• Recomendação: [aumentar verba em X / pausar Y / testar Z]

═══ CRM + IA ═══
• Mensagens processadas: XXX
• Tempo médio resposta IA: Xs
• Handoffs IA→humano: XXX (XX% do total)
• Motivos de handoff: [...]
• Sentimento médio: positivo/neutro/negativo
• Base de IA: X documentos, última atualização [data]

═══ RECOMENDAÇÕES PARA PRÓXIMO MÊS ═══
1. [Ação 1 — justificativa]
2. [Ação 2 — justificativa]
3. [Ação 3 — justificativa]

═══ PRÓXIMOS PASSOS ═══
• Reunião: [data]
• Entregas planejadas: [...]
```

### Formato de entrega

- PDF enviado por e-mail + WhatsApp
- Até dia 27 de cada mês
- Discutido na reunião mensal (cliente Scale/Domina)
- Se **Start**: enviado sem reunião (reunião é 1/mês, geralmente focada em outra coisa)

---

## 6.6 Processo de suporte (tickets)

### Canal

- **WhatsApp do suporte da agência** (não seu pessoal — cria número separado da agência)
- **E-mail de suporte**: suporte@suaagencia.com.br
- Opcionalmente: **Trello/Notion shared** com cliente pro Domina (kanban de tickets)

### Fluxo

1. Cliente abre ticket (WhatsApp ou e-mail)
2. Você categoriza (Crítica / Alta / Média / Baixa)
3. Responde com "recebi, prazo estimado: X"
4. Resolve
5. Avisa o cliente
6. Fecha ticket

### Escopo vs fora de escopo

| Dentro da mensalidade | Fora (cobrar extra) |
|---|---|
| Bug no CRM/site/IA | Redesign completo do site |
| Campanha não converte (ajustar) | Nova LP do zero (R$ 350) |
| Automação quebrou | Integração com sistema que não estava no contrato |
| Atualizar PDF na base de IA | Treinamento de equipe nova (R$ 1.500/sessão) |
| Trocar texto/imagem da LP | Produção audiovisual (vídeo, foto product) |

---

## 6.7 O que **mata a mensalidade** (anti-padrões a evitar)

Se você fizer qualquer uma dessas coisas, o cliente cancela em 90 dias:

1. ❌ **Relatório genérico** (copiar e colar mês a mês sem mudar número)
2. ❌ **Demorar 3 dias pra responder** ticket simples
3. ❌ **Não atualizar base de IA** quando cliente muda catálogo/preço
4. ❌ **Ads sem otimização** (set-and-forget → queima verba → cliente percebe)
5. ❌ **Nunca ligar** (sumir por semanas, sem check-in proativo)
6. ❌ **Não mostrar resultado** (se o cliente não vê número melhorando, ele sai)

### O que **sustenta a mensalidade** (boas práticas)

1. ✅ **Relatório com insight acionável** ("pausa campanha X, mete mais em Y")
2. ✅ **Check-in proativo** ("vi que a IA não tá pegando um assunto, vou ajustar")
3. ✅ **Mostrar ganho** ("mês passado CPL era R$ 28; este mês baixou pra R$ 19")
4. ✅ **Surpreender** ("fiz um vídeo-tutorial de como usar o kanban — tá no grupo")
5. ✅ **Antecipar problema** ("seu WAHA tá quase batendo rate limit, vou ajustar a janela")

---

## 6.8 Quando o cliente quer cancelar

Não é "se" — é "quando". Prepare-se:

### Objeções comuns de churn e como tratar

| Objeção | Resposta |
|---|---|
| "Não tô vendo resultado" | "Vamos olhar os números juntos. [Abre relatório.] CPL caiu de X pra Y. Se não tá vendo venda, o problema pode ser na equipe de atendimento, não no funil." |
| "Tá caro" | "Vamos ver quanto você pagaria separado: Kommo R$ 300/user × 5 = R$ 1.500 SÓ do CRM. Mais a agência de site R$ 800/mês. Mais tráfego R$ 1.500/mês. São R$ 3.800 vs nossos R$ 1.297." |
| "Vou internalizar" | "O CRM é seu (self-hosted, MIT license). Se precisar de ajuda com transição, te dou 30 dias pra migrar. Mas lembra que a IA precisa ser treinada e os ads otimizados semanalmente — se der conta sozinho, sucesso." |
| "Não preciso mais" | "Ok, sem multa. Quando precisar de volta, tá aqui. Vou deixar tudo rodando por 30 dias como cortesia." |

### Política de cancelamento

- 30 dias de aviso prévio (contrato)
- Sem multa (se já passou dos 12 meses de carência)
- Dados são do cliente (exporta tudo + base de IA + conversas)
- Servidor continua rodando por 30 dias após cancelamento
- Após 30 dias sem pagamento: desliga VPS, backup entregue ao cliente

---

Próximo: [07-playbook-de-vendas.md](07-playbook-de-vendas.md) — como prospectar e fechar.