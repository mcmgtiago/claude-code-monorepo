# 04 — Unidade Econômica

> **O que você realmente gasta, o que você recebe e por quanto tempo até a operação valer a pena.** Números reais, pessimistas, com margem de segurança.

---

## 4.1 Custos para entregar (por cliente)

Suponha que você assinou **1 cliente Scale** hoje. Quanto custa pra você?:

### Custos fixos mensais (infra)

| Item | Origem | Custo/mês |
|---|---|---|
| VPS HostGator SP-1 (1 vCPU, 2GB RAM, SSD 30GB, com snapshot) | [HostGator parceria](https://www.hostgator.com.br/52708-141-3-52.html) | R$ 130 |
| Supabase Pro (5GB DB, backup automático, 500 edge function invocations/mês) | [Supabase](https://supabase.com/pricing) | R$ 110 |
| WAHA Plus licence (multi-webhook, S3 upload, S3 buckets) | [WAHA Plus](https://waha.devlikeapro.com/) | US$ 50 ≈ R$ 260 |
| **Subtotal (infra pura)** | | **R$ 500** |

> **Ponto importante**: essa infra **roda todos os seus clientes**. Se você tiver 10 clientes Scale na mesma VPS, o custo não sobe linearmente — é **R$ 500/mês pra 1 cliente ou pra 10** (até certo limite de load).

### Custos variáveis (IA + tokens)

| Item | Cálculo | Custo/mês (por cliente) |
|---|---|---|
| **Anthropic Claude** (GPT equivalente) | Preço público: ~US$ 0.003/1K input + US$ 0.015/1K output; cliente Scale usa ~100k tokens médios | R$ 30–150 (varia muito com volume) |
| **Google Ads** (você não paga; cliente paga direto à Google) | Repassado 1:1 | R$ 0 (seu custo: comissão de gestão e criativo) |
| **Meta Ads** (idem) | Repassado 1:1 | R$ 0 (seu custo: comissão de gestão e criativo) |
| **Resend** (e-mails transacionais) | Free tier (~100 e-mails/dia) ou Pro (R$ 50/mês) | R$ 0–50 |
| **Upstash Redis** (rate limit, cache) | Free tier suficiente no MVP | R$ 0 |

**Subtotal IA + transacional**: **R$ 30–200/mês por cliente** (depende de volume de conversa).

### Custos de time (horas do seu trabalho)

| Atividade | Frequência | Horas/mês | Custo (R$ 50/h) |
|---|---|---|---|
| Setup inicial (já está no one-shot) | 1 vez | — | — |
| Resposta a suporte (tickets WhatsApp) | Contínuo | 4–6h | R$ 200–300 |
| Otimização de campanhas (Meta + Google) | 2x/semana | 4–6h | R$ 200–300 |
| Atualização de landing page (texto/imagem) | 1–2x/mês | 2–3h | R$ 100–150 |
| Relatório + reunião mensal | 1x/mês | 2h | R$ 100 |
| Troubleshooting IA / automações | Ad-hoc | 1–2h | R$ 50–100 |
| **Subtotal time (seu trabalho)** | | **~12–20h** | **R$ 650–850** |

> **Suposição**: você começa **solo** operando **5–10 clientes Scale**. Se passar de 15, você precisa de 1 assistente (copywriter + ads junior, R$ 3.500/mês ou R$ 20/h freelancer).

---

## 4.2 Custo total por cliente (consolidado)

### Cenário: 1 cliente Scale operado por você (solo)

| Linha | Custo |
|---|---|
| Infra (VPS, Supabase, WAHA) — fração do R$ 500 total | R$ 50 (assumindo 10 clientes repartindo a VPS) |
| IA tokens (Claude) | R$ 80 (médio) |
| Resend / transacional | R$ 20 |
| Seu trabalho (14h médio × R$ 50/h) | R$ 700 |
| **CUSTO TOTAL/mês** | **R$ 850** |

**Margem de segurança**: assuma **R$ 1.000/mês** (15% acima pra imprevisto).

---

## 4.3 Receita por cliente

### Cenário: cliente Scale

| Linha | Valor |
|---|---|
| Mensalidade | R$ 1.297 |
| Aditivos mensal (imagem, post blog, etc.) | R$ 100–200 (médio) |
| **RECEITA/mês** | **R$ 1.400** |

---

## 4.4 Margem bruta por cliente (Scale)

| | Valor |
|---|---|
| Receita/mês | R$ 1.400 |
| Custo/mês | R$ 1.000 |
| **Margem bruta/mês** | **R$ 400** |
| **Margem %** | **29%** |

⚠️ **Isso é baixo para SaaS.** Mas lembra que **a infra é compartilhada**. Com 10 clientes na mesma VPS:

| Linha | Valor |
|---|---|
| Infra total (R$ 500) repartida por 10 | R$ 50 × 10 = R$ 500 |
| IA (média) × 10 | R$ 800 |
| Seu tempo (14h × R$ 50) × 10 clientes | R$ 7.000 |
| **Custo operacional total** | **R$ 8.300/mês** |
| **Receita total** (1.400 × 10) | **R$ 14.000/mês** |
| **Margem bruta mensal** | **R$ 5.700** |
| **Margem %** | **41%** |

👉 **Esse é o número realista: com 10 clientes Scale, você ganha R$ 5.7k/mês com 70h de trabalho (R$ 81/h). Contratar assistente em 3–6 meses quando bater 15 clientes.**

---

## 4.5 LTV (Lifetime Value) e CAC (Customer Acquisition Cost)

### LTV (cliente Scale que fica 24 meses)

| Linha | Cálculo |
|---|---|
| Mensalidade | R$ 1.297 × 24 = R$ 31.128 |
| Aditivos (médio R$ 150/mês) | R$ 150 × 24 = R$ 3.600 |
| Upsell (metade dos clientes vira Domina em ano 2) | — (conservador: não contar) |
| **LTV bruto** | **R$ 34.728** |
| **LTV líquido** (após custo de operação, 29% de margem) | **R$ 10.071** |

### CAC (Customer Acquisition Cost)

Suponha modelo de vendas:

| Linha | Valor |
|---|---|
| Tempo de prospecção + discovery + proposta (10h × R$ 50/h) | R$ 500 |
| Email frio + landing page de captura (amostra) | R$ 200 |
| Ferramentas (HubSpot free, Loom, etc.) | R$ 50 |
| **CAC** | **R$ 750** |

### Ratio LTV/CAC

**LTV líquido / CAC = 10.071 / 750 = 13.4x**

> Qualquer SaaS com ratio acima de 3x é considerado rentável. **13.4x é excelente.**

---

## 4.6 Período de payback (quanto tempo até virar lucrativo)

### Cenário pessimista: cliente paga por 12 meses e sai

| Ponto | Valor |
|---|---|
| Setup recebido (50% entrada) | R$ 3.250 |
| Setup custo (15h × R$ 50/h setup especial) | R$ 750 |
| Setup margem bruta | **R$ 2.500** |
| Mês 1 margem bruta | R$ 400 |
| Mês 1 total acumulado | R$ 2.900 |
| Custo acumulado até mês 6 | R$ 6.000 |
| Receita acumulada até mês 6 | R$ 8.400 + 2.500 setup = R$ 10.900 |
| **Lucro a partir do**: | **Mês 1** (se setup der certo) |
| **Payback completo (recover CAC)**: | **Mês 2** (750 / 400 = 1.9 meses) |

> Com esse modelo, você **lucra desde mês 1**. Excelente.

---

## 4.7 Escalabilidade (quanto mais, melhor)

O modelo é **ótimo pra escalar** porque:

1. **A infra não sobe linearmente**: 10 clientes Scale custam infra praticamente igual a 1 cliente. ✅
2. **Seu tempo ≠ seu limite**: conforme ganha experiência, você fica mais rápido. Repete templates. ✅
3. **Suporte se profissionaliza**: em 6–9 meses, você contrata 1 assistente (R$ 20/h) que cobre 80% do suporte repetitivo. ✅
4. **Upsell automático**: clientes Scale viram Domina naturalmente em 6–12 meses (+R$ 1.200/mês de receita diferencial). ✅

### Cenário futuro: 30 clientes (mix: 10 Start, 12 Scale, 8 Domina)

| Linha | Cálculo |
|---|---|
| **Receita mensal** | (10 × R$ 697) + (12 × R$ 1.297) + (8 × R$ 2.497) = **R$ 40.960** |
| **Custo infra** | VPS + Supabase + WAHA (compartilhado) | R$ 500 |
| **Custo IA** (volume cresce) | ~R$ 400/mês | R$ 400 |
| **Custo time** (você + 1 assistente) | 20h você (R$ 50/h) + 60h assistente (R$ 20/h) = R$ 2.200 | R$ 2.200 |
| **Custo outras ferramentas** | CRM, ads manager tools, Slack, etc. | R$ 300 |
| **Custo total** | | **R$ 3.400** |
| **Lucro mensal** | R$ 40.960 - R$ 3.400 | **R$ 37.560** |
| **Margem %** | 91% ✅ | |

---

## 4.8 Receitas complementares (bonus)

| Fonte | Quando | Quanto |
|---|---|---|
| **Comissão de afiliado HostGator** | Todo cliente que assina VPS pelo seu link | ~R$ 100–150 por assina (lifetime) |
| **Integração customizada** (Hotmart, Shopify, ERP) | Quando cliente pede | R$ 150/h (ou R$ 1.500 one-shot fixo) |
| **Treinamento presencial** | Quando cliente pede bootcamp | R$ 1.500 por turma (~10 pessoas) |
| **Suporte premium 24/7** | Upsell pra cliente paranóico | R$ 500/mês aditivo |
| **White-label** (revenda pra outra agência) | Co-venda B2B | 30% do setup + 10% da mensalidade |

---

## 4.9 Quando contratar (hiring roadmap)

| Marco | Quando | O que contratar |
|---|---|---|
| **Fase 1** | 0–5 clientes | Você solo |
| **Fase 1.5** | 5–8 clientes | Freelancer copywriter 10h/mês (R$ 800) — ajuda com LP e ads |
| **Fase 2** | 8–15 clientes | Junior ads manager/operador meio-período (20h/semana, R$ 2.000/mês) |
| **Fase 3** | 15–30 clientes | Operador time + Copywriter full-time |
| **Fase 4** | 30+ clientes | Direcionar pra parceria HostGator ou SaaS próprio. (Negócio fica operacional, você gerencia.) |

---

## 4.10 Simulador de fluxo de caixa (seu primeiro ano)

```
Mês 1:  Bate 1 cliente Start
        Receita: 3.500 (setup) + 697 (1ª mensalidade) = R$ 4.197
        Custo: R$ 1.200 (setup + operação)
        Lucro: R$ 2.997
        ─────────────────

Mês 3:  Bate 3 clientes (mix: 1 Start + 2 Scale)
        Receita: 6.500 + 1.297 + 697 (setup+mês) + 2 × 1.297 (Scale mensais) = R$ 11.588
        Custo: R$ 3.500 (3 clientes operando)
        Lucro: R$ 8.088
        ─────────────────

Mês 6:  Bate 8 clientes (4 Start, 3 Scale, 1 Domina)
        Receita: ~R$ 18.000
        Custo: R$ 6.000 (aumenta porque tempo seu tá cheio + precisa assistente)
        Lucro: R$ 12.000
        → Contrata 1 freelancer ads junior (R$ 2.000/mês) → lucro real: R$ 10.000
        ─────────────────

Mês 12: Bate 18 clientes (6 Start, 9 Scale, 3 Domina) — plateau esperado
        Receita: ~R$ 35.000
        Custo: R$ 8.000 (você + junior + infra)
        Lucro: **R$ 27.000/mês**
        Margin: 77%
```

---

## 4.11 Checklist de lucratividade

Before você começar a vender, valida:

- [ ] Seu custo de vida local (aluguel, internet, etc.) permite viver com R$ 3k/mês nos primeiros 2–3 meses?
- [ ] Você consegue fazer 1 setup completo em 40h? (Se não, estime 60–80h e inclua no CAC.)
- [ ] Você teria paciência de operar a mesma stack 10 vezes? (Ou vai odiar repetição?)
- [ ] Seu time é confiável pra fazer copy, ads, design? (Se não, terceiriza no início.)
- [ ] Você tem 1 case de sucesso (mesmo que seu próprio negócio) pra vender os primeiros 5?

Se respondeu "sim" a 4 de 5: **o modelo é viável pra você**.

---

Próximo: [05-onboarding-7-dias.md](05-onboarding-7-dias.md) — cronograma do setup.