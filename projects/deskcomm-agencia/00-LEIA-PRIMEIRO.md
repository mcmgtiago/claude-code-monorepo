# Deskcomm Agência — Oferta Completa

> **Site que vende + CRM que fecha + Ads que enchem o funil.**
> Documento de referência único da oferta de agência integradora que entrega site institucional, landing pages de captação, CRM Deskcomm (WhatsApp + agentes IA) e gestão de anúncios pagos como **produto único**, com **mensalidade de gestão** recorrente.

---

## 📁 Índice da pasta

| # | Arquivo | Para que serve |
|---|---|---|
| 00 | **[00-LEIA-PRIMEIRO.md](00-LEIA-PRIMEIRO.md)** | Este arquivo. Visão geral e como navegar. |
| 01 | [01-posicionamento-e-mercado.md](01-posicionamento-e-mercado.md) | Por que essa combinação. ICP. Tamanho de mercado. Concorrência. |
| 02 | [02-arquitetura-da-solucao.md](02-arquitetura-da-solucao.md) | Como as 4 camadas se conectam tecnicamente (diagrama + fluxo de lead). |
| 03 | [03-pacotes-e-precos.md](03-pacotes-e-precos.md) | **Start**, **Scale**, **Domina**. Preços sugeridos, o que entra, o que não entra. |
| 04 | [04-unidade-economica.md](04-unidade-economica.md) | Custos reais (VPS, IA, WhatsApp, Ads), markup, margens, LTV, CAC alvo. |
| 05 | [05-onboarding-7-dias.md](05-onboarding-7-dias.md) | Cronograma D+0 a D+7 do contrato assinado até o sistema operando com lead real. |
| 06 | [06-mensalidade-de-gestao.md](06-mensalidade-de-gestao.md) | O que a mensalidade cobre, SLA, escopo, processo, tickets, reportes mensais. |
| 07 | [07-playbook-de-vendas.md](07-playbook-de-vendas.md) | Prospecção outbound, script de discovery, objeções, fechamento. |
| 08 | [08-proposta-comercial-modelo.md](08-proposta-comercial-modelo.md) | Proposta padrão em markdown, pronta pra virar PDF. |
| 09 | [09-material-de-venda.md](09-material-de-venda.md) | One-pager, pitch deck (roteiro), e-mail frio, posts de LinkedIn/Instagram. |
| 10 | [10-riscos-lgpd-e-contratos.md](10-riscos-lgpd-e-contratos.md) | O que pode dar errado, cláusulas obrigatórias, LGPD, limites de responsabilidade. |

---

## 🎯 O produto em uma frase

> **A gente entrega o site, o WhatsApp, os agentes de IA que atendem, qualifica e fecham, e ainda roda os anúncios que enchem o funil — você só assiste o CRM vender.**

## 🧩 As 4 camadas

```
┌─────────────────────────────────────────────────────────────────┐
│  1. SITE INSTITUCIONAL                                          │
│     Next.js + shadcn/ui, SEO, rápido, seu domínio, sua marca.   │
├─────────────────────────────────────────────────────────────────┤
│  2. LANDING PAGES DE CAPTAÇÃO                                   │
│     Uma por campanha de Ads. Formulário → webhook → CRM         │
│     direto no funil/etapa certa. Sem Zapier, sem código.        │
├─────────────────────────────────────────────────────────────────┤
│  3. CRM DESKCOMM (self-hosted)                                  │
│     WhatsApp via WAHA + agentes IA com RAG + kanban             │
│     multi-nicho + automações QUANDO/SE/ENTÃO.                   │
├─────────────────────────────────────────────────────────────────┤
│  4. GESTÃO DE ANÚNCIOS                                          │
│     Google Ads + Meta Ads + TikTok Ads (opcional).              │
│     Conta do cliente, pixel instalado, otimização mensal.       │
└─────────────────────────────────────────────────────────────────┘
                ─── mensalidade de gestão ───
```

## 💡 Por que essa combinação mata a concorrência

- **Kommo / Octadesk / Intercom**: cobram **R$ 150–400/usuário/mês** por CRM fechado, com **IA capenga**. Você cobra mensalidade fixa e entrega IA nativa + site + ads.
- **Agências de tráfego**: entregam leads frios no WhatsApp do cliente. Você entrega **leads já no CRM, com agente IA qualificando 24/7**.
- **Agências de site**: entregam site e somem. Você fica **operando** o sistema todo mês.
- **Diferencial técnico**: o `hostgator-setup-kit` do DeskcommCRM instala CRM + WAHA + banco com **1 comando na VPS HostGator**. A mesma VPS roda o site institucional. **Custo de infra absurdamente baixo** = margem saudável.

## 👤 ICP (Perfil de Cliente Ideal)

**Tamanho**: empresas brasileiras com **10 a 100 colaboradores** que já vendem (ou querem vender) pelo WhatsApp.

**Nichos prioritários** (nessa ordem, baseado nos adopters reais do DeskcommCRM):
1. **Clínicas** (estética, odontologia, veterinária)
2. **Imobiliárias** e corretoras autônomas
3. **Infoprodutores** e mentores
4. **E-commerce pequeno/médio** (D2C, marcas regionais)
5. **Agências e prestadores de serviço** (advocacia, contabilidade, arquitetura)
6. **Lojas físicas** com captação online

**Sinais de que é lead quente**:
- Já anuncia (Google/Meta) e os leads caem em planilha/WhatsApp pessoal
- Equipe de atendimento sobrecarregada / perdendo lead fora do horário
- Usa planilha, Excel, Notion ou CRM pago caro (Kommo/HubSpot/RD)
- Tem pelo menos **um** número WhatsApp Business ativo

**Sinais de que NÃO é lead (descartar rápido)**:
- Quer "só o site" sem CRM (não é nosso público)
- Quer vender pra fora do Brasil sem WhatsApp (fora do nosso canal-âncora)
- Orçamento < R$ 2.500/mês de gestão (não fecha a conta)

## 💰 Resumo financeiro (para preview rápido)

| Cenário | Setup (one-shot) | Mensalidade | Cliente ideal |
|---|---|---|---|
| **Start** | R$ 3.500 | R$ 697 | 1 número, 1 site, Meta Ads básico |
| **Scale** | R$ 6.500 | R$ 1.297 | até 3 números, multi-página, Meta+Google |
| **Domina** | R$ 12.000 | R$ 2.497 | multi-nicho, multi-pipeline, TikTok + Google + Meta |

**Custo de infra típico (você paga, cliente não vê diretamente)**:
- VPS HostGator SP-1: ~R$ 130/mês
- Supabase Pro: ~R$ 110/mês
- WAHA Plus licence: ~US$ 50/mês (≈ R$ 260)
- AI tokens (Anthropic): R$ 50–300/mês dependendo do volume
- **Total de infra**: ~R$ 550–800/mês para o **pacote Scale**

👉 Detalhamento completo em [04-unidade-economica.md](04-unidade-economica.md).

## 🚦 Status atual

Este documento é o **MVP da oferta**. Antes de vender:
- [ ] Definir nome da agência e CNPJ (MEI → ME em <R$ 360k/ano)
- [ ] Adaptar preços para sua realidade local (custo de vida, concorrência regional)
- [ ] Produzir 2 cases de estudo (mesmo que projetos próprios/brindes)
- [ ] Setup do seu próprio site institucional usando exatamente esse stack (dogfooding)
- [ ] Instalar seu próprio DeskcommCRM para usar no seu funil de vendas

## Próximo passo sugerido

Ler **[01-posicionamento-e-mercado.md](01-posicionamento-e-mercado.md)** para entender a fundo por que essa oferta ganha no preço e no resultado.