# 🎯 Ari.IA — Foco: Beleza & Estética

> Nicho único: negócios de beleza e estética que trabalham com agendamento.
> Segmentos: studios, cabelo, unhas, maquiagem, barbearia, cílios, depilação.
> Última atualização: 2026-08-27

---

## Decisão estratégica

**Foco total no nicho de beleza & estética.** Nada de fitness, pet, saúde. Isso é uma vantagem — todos esses segmentos são o **MESMO negócio**: profissional agenda cliente, executa serviço, cobra, fideliza. O core do Ari.IA já resolve isso 100%.

Não são "verticais diferentes" — são **presets** do mesmo produto. O sistema é um só, muda só o preset de serviços e a cara.

---

## Segmentos-alvo (todos beleza & estética)

| Segmento | Profissional | Serviços típicos |
|---|---|---|
| **Barbearia** ✅ | Barbeiro | Corte, barba, pigmentação, combos |
| **Salão de cabelo** | Cabeleireira | Corte, coloração, mechas, escova, hidratação, progressiva |
| **Studio de unhas** | Manicure/Nail designer | Alongamento, gel, esmaltação, spa dos pés, nail art |
| **Studio de cílios** | Lash designer | Extensão de cílios, lash lifting, brow lamination |
| **Maquiagem** | Maquiador(a) | Maquiagem social, noiva, dia a dia, curso |
| **Depilação** | Depiladora | Cera, laser, linha, egípcia (por região do corpo) |
| **Estética facial/corporal** | Esteticista | Limpeza de pele, drenagem, massagem, peeling, tratamentos |
| **Studio multi-serviço** | Vários | Combina tudo acima (o mais comum hoje) |

**Realidade do mercado:** a maioria dos studios modernos faz **vários desses ao mesmo tempo** (ex: studio que faz cabelo + unha + cílios + design de sobrancelha). O sistema precisa suportar múltiplos tipos de serviço no mesmo negócio — o que já faz (categorias de serviço).

---

## O que o core JÁ resolve (100% reutilizável)

| Módulo | Serve pra todos os segmentos? |
|---|---|
| Agenda + agendamento manual | ✅ |
| Booking público online | ✅ |
| Clientes (fidelidade, aniversário, histórico) | ✅ |
| Serviços + categorias + preços | ✅ |
| Profissionais + comissões + filiais | ✅ |
| Comandas (POS) + financeiro + relatórios | ✅ |
| Clube de assinatura (recorrência) | ✅ |
| CRM/WhatsApp + Agente IA | ✅ |
| NPS, reativação, lista de espera, avaliações Google | ✅ |
| Aniversariantes | ✅ |
| 3 PWAs (admin, profissional, cliente) | ✅ |

**Conclusão:** o produto já está pronto pra TODO o nicho. O que falta é **adaptação de apresentação** + **2-3 features específicas de beleza/estética**.

---

## Features específicas do nicho (a construir)

Essas features fazem diferença em beleza/estética e ainda não existem:

### 1. Pacotes de sessões (PRIORIDADE ALTA)
- Estética/cílios/depilação vendem "pacote de 10 sessões"
- Cliente compra, sistema debita 1 a cada atendimento
- Mostra saldo ("faltam 4 sessões")
- **Já existe base** (club_plan) — precisa adaptar pra sessões contáveis
- **Esforço:** 3-4 dias

### 2. Fotos antes/depois (PRIORIDADE ALTA)
- Cabelo, unha, cílios, maquiagem, estética — todos vivem de "antes e depois"
- Galeria por cliente (evolução) + portfólio do profissional (marketing)
- Supabase Storage + upload
- **Esforço:** 3-4 dias

### 3. Ficha de anamnese / ficha técnica (PRIORIDADE MÉDIA)
- Estética e coloração precisam: tipo de pele, alergias, química anterior, contraindicações
- Formulário customizável por tipo de serviço
- **Esforço:** 3 dias

### 4. Duração variável / blocos longos (PRIORIDADE MÉDIA)
- Coloração = 3h, extensão de cílios = 2h, limpeza de pele = 1h
- Agenda precisa mostrar o bloco real ocupado (não só 30min fixo)
- **Já tem** `duracao_minutos` no serviço — precisa a agenda respeitar visualmente
- **Esforço:** 2 dias

### 5. Agendamento multi-serviço (PRIORIDADE MÉDIA)
- Cliente marca "corte + escova + manicure" no mesmo horário
- Pode ser com profissionais diferentes
- **Esforço:** 3-4 dias

### 6. Termo de consentimento (PRIORIDADE BAIXA)
- Procedimentos estéticos/químicos pedem assinatura
- **Esforço:** 2 dias

---

## Terminologia adaptável

Em vez de "Barbearia" fixo, o sistema usa termos neutros de beleza:

```
Padrão (neutro):     "Estabelecimento" / "Profissional" / "Cliente" / "Serviço"
Ou configurável no onboarding:
  Barbearia:   Barbeiro / Barbearia
  Cabelo:      Cabeleireira / Salão
  Unhas:       Manicure / Studio de Unhas
  Cílios:      Lash Designer / Studio de Cílios
  Estética:    Esteticista / Clínica de Estética
  Multi:       Profissional / Studio de Beleza
```

O dono escolhe o tipo no onboarding e o sistema ajusta os textos + carrega serviços-preset.

---

## Presets de serviços por segmento (carrega no onboarding)

```
BARBEARIA:      Corte, Barba, Pigmentação, Combo Corte+Barba, Sobrancelha
CABELO:         Corte, Escova, Coloração, Mechas/Luzes, Hidratação, Progressiva
UNHAS:          Alongamento, Esmaltação Gel, Manutenção, Spa dos Pés, Nail Art
CÍLIOS:         Extensão Fio a Fio, Volume Russo, Lash Lifting, Manutenção
MAQUIAGEM:      Social, Noiva, Madrinha, Dia a Dia, Curso
DEPILAÇÃO:      Cera (por região), Egípcia, Laser, Linha
ESTÉTICA:       Limpeza de Pele, Drenagem, Peeling, Massagem, Microagulhamento
STUDIO MULTI:   deixa vazio, dono cadastra o que faz
```

---

## Roadmap de execução

```
AGORA (validar):
  ✅ Barbearia — já em produção (Junior Barber)

FASE 1 (2-3 semanas) — abrir o nicho:
  → Campo "tipo de estabelecimento" no onboarding (barbearia/cabelo/unhas/cílios/estética/multi)
  → Presets de serviços por tipo
  → Terminologia adaptável
  → Agenda respeitando duração real (blocos longos)

FASE 2 (3-4 semanas) — features que vendem:
  → Pacotes de sessões (adapta clube)
  → Fotos antes/depois (portfólio + evolução do cliente)

FASE 3 (2-3 semanas) — profissionalizar:
  → Ficha de anamnese/técnica
  → Agendamento multi-serviço
  → Termo de consentimento
```

---

## Posicionamento de mercado

**"O sistema de gestão + IA no WhatsApp para estúdios de beleza e estética."**

Público: barbearias, salões, studios de unhas/cílios/maquiagem, clínicas de estética, depilação. Do profissional solo ao studio com várias cadeiras/salas.

**Diferencial:**
- WhatsApp-first (onde o cliente de beleza agenda)
- IA que agenda sozinha 24/7
- Fotos antes/depois (essencial no nicho)
- Clube de assinatura (receita recorrente)
- Preço de PME (não enterprise)

**Concorrentes diretos BR:** Trinks, Avec, Belasis, Salão VIP. Diferencial do Ari.IA = IA no WhatsApp + preço + simplicidade.

---

## Pricing

| Plano | Preço | Público |
|---|---|---|
| Starter | R$ 49/mês | Profissional solo (1 cadeira) |
| Pro | R$ 129/mês | Studio pequeno (multi-profissional) |
| Business | R$ 249/mês | + IA WhatsApp + clube + fotos |
| Enterprise | R$ 499+/mês | Rede multi-unidade |

Add-on WhatsApp IA: +R$ 49-99/mês

---

## Arquitetura multi-segmento (1 codebase)

- Campo `tipo` na `company` (barbearia | cabelo | unhas | cilios | maquiagem | depilacao | estetica | multi)
- Dicionário de terminologia por tipo
- Presets de serviços no onboarding
- Features de fotos/anamnese disponíveis pra todos (não gateadas por tipo — todos de beleza usam)

**Não precisa fork.** É o mesmo produto com preset diferente. Barbearia é só um dos tipos.

---

## Próximos passos (quando decidir expandir do barbearia)

1. Migration: `ALTER TABLE company ADD COLUMN tipo text DEFAULT 'barbearia'`
2. Onboarding: passo 1 pergunta "que tipo de estabelecimento?"
3. Presets de serviços por tipo (seed automático)
4. Terminologia dinâmica (dicionário)
5. Agenda com blocos de duração real
6. Depois: pacotes de sessão + fotos antes/depois
7. Landing pages por segmento (SEO: "sistema para salão", "software para studio de cílios", etc)
