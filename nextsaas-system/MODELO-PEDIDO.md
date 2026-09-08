# Modelo de Pedido — Para Montar um Site

Copie, customize e envie para a IA montar seu site.

---

## Formato Básico

```
Quero montar um site para SaaS de [seu nicho].

## Seções desejadas:
- Hero [tipo: gradiente|vídeo|parallax]
- [Outra seção]
- [Outra seção]
- Footer

## Visual:
- Cor primária: [hex]
- Cor secundária: [hex] (opcional)
- Fonte: [nome] (opcional, default Inter)
- Estilo: [clean|corporate|gradient|modern] (opcional)

## Copy principal:
- Headline: [seu headline]
- Subheadline: [sua subheadline]
- CTA principal: [seu botão]

## Recursos:
- Nome do projeto: [nome]
- Logo: [sim/não, descrever]
- Imagens: [onde copiá-las / usar placeholders]

## Do NOT:
- Não quero: [ex: "blog", "newsletter signup", "team page"]
```

---

## Exemplo Pronto: SaaS de Gestão de Projetos

```
Quero montar um site para SaaS de gestão de projetos chamado ProjectX.

## Seções desejadas:
- Hero com vídeo de fundo
- Social proof com logos de clientes
- Features grid 3 colunas (com ícones)
- Pricing com toggle mensal/anual (3 tiers)
- Testimonials em carousel
- FAQ accordion
- CTA newsletter
- Footer multi-coluna

## Visual:
- Cor primária: #7c3aed (roxo Tailwind)
- Cor secundária: #1f2937 (cinza escuro)
- Font: Inter Tight
- Estilo: modern clean

## Copy principal:
- Headline: "Organize. Collaborate. Deliver."
- Subheadline: "A melhor ferramenta para gestão de projetos em time"
- CTA principal: "Começar Grátis"

## Recursos:
- Nome do projeto: projectx
- Logo: usar placeholder por agora
- Imagens: copiadas de unsplash, tamanho 1200x800
- Sem blog, sem marketplace, sem admin

## Do NOT:
- Não quero: blog, blog post pages, team bios, case studies
```

---

## Exemplo Pronto: Plataforma de Pagamentos

```
Quero montar um site para fintech de pagamentos (payment gateway).

## Seções desejadas:
- Hero com mockup de card + CTA duplo
- Trust badges com ratings (4.7 stars)
- Features grid 3x2 com ícones
- Why choose us (split layout)
- Pricing comparison table
- Integrations marquee (50+ logos)
- Testimonials 3-col grid
- CTA trial 14 dias
- Footer com links legais

## Visual:
- Cor primária: #0066ff (azul)
- Cor secundária: #1a202c (dark)
- Font: Inter
- Estilo: professional corporate

## Copy principal:
- Headline: "Payments Made Simple"
- Subheadline: "Process more, earn more. Secure payments for everyone"
- CTA principal: "Start Free Trial"

## Recursos:
- Nome do projeto: payssimple
- Logo: placeholder
- Imagens: payment mockups, integrations logos
- Sem onboarding tutorial, sem migration guide

## Do NOT:
- Não quero: pricing calculator, docs, API reference, support page
```

---

## Exemplo Pronto: Agência de Marketing

```
Quero montar um site para agência de marketing de IA.

## Seções desejadas:
- Hero com gradiente animado
- Clientes (marquee com 12 logos)
- Serviços tabs (4 abas)
- Case study 2x2 grid com hover
- Why choose us com icones
- Tech stack (logos orbitando)
- Testimonials flip cards
- Partnership cards com glow
- Blog featured + 2 artigos
- CTA contato
- Footer

## Visual:
- Cor primária: #8d59ff (roxo opai)
- Cor secundária: #0d1017 (muito escuro)
- Font: Sora (titles), Inter Tight (body)
- Estilo: gradient glassmorphism

## Copy principal:
- Headline: "AI-Powered Marketing for Scale"
- Subheadline: "Transforme sua estratégia de marketing com inteligência artificial"
- CTA principal: "Agende uma Demo"

## Recursos:
- Nome do projeto: aiagency
- Logo: usar do template
- Imagens: case studies, team photos
- Blog pode ser placeholder (sem posts reais)

## Do NOT:
- Não quero: pricing page, onboarding, detailed services pages, team member bios
```

---

## Dicas para Melhores Resultados

### ✅ Faça
- **Seja específico** nas seções (ex: "Hero com vídeo" não "hero bonito")
- **Liste cores em hex** (não "azul tipo Spotify")
- **Descreva o copy real** (não genérico)
- **Mencione restrições** (ex: "sem blog", "só landing")
- **Dê um nome** pro projeto (facilita identificação)

### ❌ Evite
- Pedir "um site atraente" sem especificar seções
- Misturar 10+ seções diferentes (fica pesado)
- Cores que não combinam (deixe pro designer depois)
- Copy muito longo (a IA vai condensar pro lugar)
- "Combine tudo dos 47 templates" (não faz sentido)

---

## Templates Recomendados Por Nicho

### AI/SaaS
- ✅ ai-saas-software (base genérica)
- ✅ ai-solutions (features ricas)
- ✅ ai-marketing-agency (design agressivo)

### Fintech
- ✅ payment-solution (pagamentos)
- ✅ investment-management (investimentos)
- ✅ online-banking (banking)

### Agências
- ✅ digital-agency (design simple)
- ✅ ai-marketing-agency (moderno)
- ✅ app-development (tech)

### Automação
- ✅ automation-saas (workflows)
- ✅ cloud-software (cloud gen)

### Varejo/Commerce
- ✅ pos-system (pagamento)
- ✅ social-media-management (ecommerce marketing)

### Seguros
- ✅ insurance (excelente base)

---

## Passo-a-Passo da Montagem

Quando você mandar:

1. **IA lê seu pedido**
2. **Busca no catálogo** (`templates-doc/`) os templates com melhor match pro nicho
3. **Seleciona variantes** (hero-video, pricing-toggle, etc)
4. **Extrai HTML** das seções escolhidas
5. **Aplica seu tokens.css** com cores pedidas
6. **Substitui copy** (placeholder → seu copy real)
7. **Gera em** `sites/seu-projeto/index.html`
8. **Retorna o link** pro arquivo pronto

**Tempo total:** 5-15 minutos dependendo da complexidade

---

## Customizações Depois

Se o site ficar pronto mas precisar ajustes:

### Mudar cores
- Edite `sites/seu-projeto/tokens.css`
- Mude `--color-primary`, `--color-secondary`
- Pronto!

### Mudar fontes
- Edite `sites/seu-projeto/tokens.css`
- Mude `--font-display`, `--font-body`
- Importe Google Fonts se precisar

### Adicionar/remover seções
- Abra `sites/seu-projeto/index.html`
- Copie outra seção de outro template doc
- Adapt pro seu style
- Salve

### Trocar imagens
- Crie pasta `sites/seu-projeto/assets/`
- Copie suas imagens
- Atualize `src=` das `<img>` tags

---

*Mande seu pedido pronto e deixa a IA montar! 🚀*
