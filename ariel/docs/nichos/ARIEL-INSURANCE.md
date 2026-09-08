# 🧜‍♀️ ARIEL Insurance — Corretora de Seguros

**Tagline:** *"Corretora que cota, fecha e renova sozinha."*

---

## 🎯 O Nicho

### Mercado BR
- 120k+ corretores de seguros ativos (SUSEP)
- 40k+ corretoras (PJ)
- Mercado de R$ 400 bilhões/ano em prêmios
- Crescimento: 15% a.a.
- Comissão média: 15-25% do prêmio

### Dor Principal
```
Corretor gasta 70% do tempo em:
- Cotação manual (3 seguradoras, 15 min cada)
- Follow-up (cliente sumiu depois de cotar)
- Renovação (esquece, perde cliente)
- Documentação (proposta, apólice, sinistro)
- Perguntas repetitivas (cobertura, prazo, valor)

Sobrando 30% pra vender de verdade.
```

### Opportunity
- Corretor que vende R$ 50k/mês em prêmio → comissão R$ 10k
- Se automatizar 70% do operacional → vende 3x mais → R$ 30k/mês
- **ARIEL se paga em 3 dias de operação**

---

## 👥 Personas

### Persona 1: Corretor Solo (alta escala)

```
Nome: Carlos, 42 anos
Perfil: Corretor PJ, 8 anos de experiência
Carteira: 300 apólices ativas
Receita: R$ 15-25k/mês (comissão)
Problema: "Perco renovação porque não acompanho. 
          Perco lead porque não respondo rápido."
Dor: tempo (sozinho faz tudo) + churn (esquece renovação)
Budget: R$ 500-1.000/mês
Decisão: Ele mesmo (rápido se ver ROI)
```

### Persona 2: Corretora Pequena (5-15 pessoas)

```
Nome: Patricia, 38 anos
Perfil: Sócia de corretora com 10 corretores
Carteira: 2.000+ apólices ativas
Receita: R$ 80-150k/mês
Problema: "Minha equipe não faz follow-up. 
          Renovação é um caos. Cotação demora demais."
Dor: RH (equipe ineficiente) + revenue (perde renovação)
Budget: R$ 1.500-3.000/mês
Decisão: Ela + sócio. Quer número claro.
```

### Persona 3: Corretora Média/Grande (20-100 pessoas)

```
Nome: Roberto, 55 anos
Perfil: Diretor de corretora regional
Carteira: 10.000+ apólices
Receita: R$ 500k-2M/mês
Problema: "Escala é o problema. Cada corretor novo custa R$ 5k.
          Quero crescer sem proporcionalmente contratar."
Dor: custo operacional + escala + padronização
Budget: R$ 3.000-8.000/mês
Decisão: Diretoria. Ciclo mais longo (30-60 dias).
```

---

## 📦 Soluções ARIEL Insurance

### Solução 1: **Cotador Automático**

**O que faz:**
- Cliente manda "quero seguro auto"
- IA coleta: marca, modelo, ano, CEP, perfil, cobertura desejada
- Consulta tabelas das seguradoras (via API ou tabela interna)
- Monta cotação comparativa (3-5 opções)
- Envia proposta formatada no WhatsApp
- Cliente aceita → gera proposta formal

**Fluxo:**
```
Cliente: "Quero seguro pro meu carro"

ARIEL:
"Opa! Vou montar uma cotação pra você. Me passa:

1. Qual carro? (marca, modelo, ano)
2. Qual CEP de pernoite?
3. Já teve seguro antes?
4. Usa pra trabalho ou lazer?"

Cliente: "Civic 2022, CEP 01310-100, já tive, lazer"

ARIEL:
"Pronto! Aqui suas opções:

📋 COTAÇÃO — Honda Civic 2022

1️⃣ Porto Seguro — R$ 2.850/ano (R$ 237/mês)
   ✅ Cobertura completa + Guincho + Carro reserva 15 dias
   
2️⃣ Tokio Marine — R$ 2.650/ano (R$ 220/mês)
   ✅ Cobertura completa + Guincho + Carro reserva 7 dias
   
3️⃣ HDI — R$ 2.400/ano (R$ 200/mês)
   ⚠️ Cobertura básica + Guincho (sem carro reserva)

Qual te interessa? Posso detalhar qualquer uma!"
```

**Agentes:** 1 (qualifica) + 2 (proposta) + custom (cotação)

---

### Solução 2: **Renovação Automática**

**O que faz:**
- Monitora todas as apólices ativas (data de vencimento)
- 60 dias antes: avisa corretor internamente
- 45 dias antes: manda msg pro cliente (WhatsApp)
- 30 dias antes: proposta de renovação com reajuste
- 15 dias antes: urgência ("vence em 15 dias!")
- D-0: última chance
- D+1: alerta de "sem cobertura"

**Fluxo:**
```
[D-45]
"Oi Carlos! 👋

Seu seguro do Civic vence em 45 dias (05/10).

Boas notícias: fiz uma pesquisa e consegui 
um valor melhor pra renovação!

Antes: R$ 2.850/ano
Agora: R$ 2.650/ano (economiza R$ 200!)

Quer renovar com esse valor? [SIM] [VER OPÇÕES]"

[D-15]
"⚠️ Carlos, seu seguro vence em 15 DIAS!

Se não renovar até 05/10, você fica SEM cobertura.
(Imagina bater o carro sem seguro? 😰)

Valor: R$ 2.650/ano (parcelamos em 4x!)

[RENOVAR AGORA] [FALAR COM CORRETOR]"
```

**Agentes:** 9 (compliance/prazos) + 13 (contratos) + 10 (comunicação)

---

### Solução 3: **Sinistro Assistido**

**O que faz:**
- Cliente abre sinistro via WhatsApp (mandando fotos + relato)
- IA guia: "Manda foto do carro", "Onde aconteceu?", "Boletim de ocorrência?"
- Coleta todos os dados necessários
- Monta dossiê (PDF) para envio à seguradora
- Acompanha status + avisa cliente

**Fluxo:**
```
Cliente: "Bati o carro 😩"

ARIEL:
"Calma! Vou te ajudar com o sinistro. 
Primeiro: você está bem? Alguém se machucou?

Se tá tudo ok, vou precisar de:
1. 📸 Fotos do veículo (4 ângulos)
2. 📍 Local do acidente
3. 📋 Boletim de ocorrência (se tiver)
4. 📝 Relato do que aconteceu

Pode ir mandando, eu organizo tudo!"

[Cliente manda fotos + info]

ARIEL:
"Perfeito! Montei o dossiê do sinistro:
📄 Sinistro #2024-0847
📅 Data: 22/08/2024
🚗 Veículo: Honda Civic 2022
📍 Local: Av. Paulista, 1000

Vou enviar pra seguradora agora.
Prazo de resposta: 5-7 dias úteis.

Te aviso quando tiver novidade! 🤝"
```

**Agentes:** 4 (support) + 7 (documentos) + 6 (task manager)

---

### Solução 4: **Cross-sell Inteligente**

**O que faz:**
- Analisa carteira do cliente (o que ele JÁ tem)
- Identifica oportunidades (o que FALTA)
- Manda oferta personalizada na hora certa
- Ex: Tem auto → oferece residencial. Tem vida → oferece previdência.

**Fluxo:**
```
[Cliente tem seguro auto há 2 anos, nunca comprou residencial]

ARIEL:
"Oi Carlos! Tudo bem?

Vi que seu seguro auto tá em dia (parabéns! 🎉).

Pergunta rápida: sua casa tem seguro?

Sabia que por R$ 35/mês você protege contra:
• Incêndio
• Roubo
• Danos elétricos
• Responsabilidade civil

E como você já é nosso cliente, tem 10% de desconto!

Quer uma cotação? [SIM] [DEPOIS]"
```

**Agentes:** 8 (insights/relatórios) + 10 (comunicação) + 2 (proposta)

---

### Solução 5: **Gestão de Carteira**

**O que faz:**
- Dashboard com TODA a carteira (apólices, vencimentos, comissões)
- Alertas de vencimento (ninguém esquece)
- Ranking de clientes por valor (quem priorizar)
- Métricas: taxa de renovação, cross-sell rate, LTV

**Visual (dashboard):**
```
📊 CARTEIRA — Corretora ABC

Total apólices: 2.340
Receita mensal (comissão): R$ 87.500
Taxa de renovação: 82% (meta: 90%)

⚠️ VENCENDO ESTE MÊS: 47 apólices (R$ 12.300 em comissão)
   └─ 23 já renovadas ✅
   └─ 14 aguardando resposta
   └─ 10 sem contato ainda 🚨

💰 TOP OPORTUNIDADES CROSS-SELL:
   • 120 clientes auto SEM residencial
   • 85 clientes PF SEM vida
   • 45 empresas SEM seguro de frota
```

**Agentes:** 8 (relatórios) + 9 (compliance) + 6 (tasks)

---

## 💰 Pricing — ARIEL Insurance

| Plano | Preço | Inclui |
|-------|-------|--------|
| **Solo** | R$ 499/mês | Cotador + Renovação + Support (até 500 apólices) |
| **Equipe** | R$ 1.299/mês | Tudo + Cross-sell + Sinistro (até 2.000 apólices) |
| **Corretora** | R$ 2.999/mês | Ilimitado + Dashboard + Multi-corretor |
| Setup | R$ 1.500-3.500 | Importação de carteira + configuração |

---

## 📊 ROI Esperado

```
Corretor com 300 apólices:

ANTES (sem ARIEL):
- Taxa de renovação: 75% (perde 75 por ano)
- Cross-sell: 5% (15 vendas novas/ano)
- Tempo operacional: 40h/semana

COM ARIEL:
- Taxa de renovação: 90% (+45 renovações = +R$ 13.500/ano em comissão)
- Cross-sell: 15% (+30 vendas novas = +R$ 9.000/ano)
- Tempo operacional: 15h/semana (25h livres pra vender!)

Ganho anual: R$ 22.500 + tempo livre
Custo ARIEL: R$ 5.988/ano
ROI: 3.7x
```

---

## ✅ Checklist de Implementação

- [ ] Tabela de seguradoras (produtos, preços, coberturas)
- [ ] Sistema de cotação (API ou tabela interna)
- [ ] Monitor de vencimentos (scheduler diário)
- [ ] Régua de renovação (D-60, D-45, D-30, D-15, D-0)
- [ ] Cross-sell engine (analisa carteira → sugere)
- [ ] Sinistro flow (coleta docs → monta dossiê)
- [ ] Dashboard de carteira
- [ ] Importador de apólices (CSV/Excel)

---

## 🎯 Go-To-Market

- **Onde encontrar:** LinkedIn (corretores), SINCOR (sindicato), eventos de seguros
- **Pitch:** "Quanto você perde por ano em renovação não feita?"
- **Demo:** Mostra renovação automática + cotação em 2 min
- **Trial:** 14 dias grátis (importa 50 apólices)
