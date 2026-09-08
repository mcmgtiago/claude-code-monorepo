# MID — Copy Completa (versão definitiva)

> Tom: direto, provocativo, consultivo. Frases curtas. Sem adjetivo vazio.
> Link CTA único: **wa.me/message/Y43UGM4C6LEZA1**
> Identidade: fundo escuro (preto/off-white), tipografia bold editorial, display grande.
> Data: 2026-08-07

---

## 0. METADADOS & PADRÕES DE UI

### 0.1 CTAs principais (padronizados)

| Botão              | Quando aparece                          | Link                              |
|--------------------|-----------------------------------------|-----------------------------------|
| Falar no WhatsApp  | Header, qualquer ponto de navegação     | `wa.me/message/Y43UGM4C6LEZA1`   |
| Posicionar minha marca | Hero, seções de dor, MEC, Cases    | `wa.me/message/Y43UGM4C6LEZA1`   |
| Quero o MEC aplicado | Bloco MEC                            | `wa.me/message/Y43UGM4C6LEZA1`   |
| Quero resultado assim | Cases                              | `wa.me/message/Y43UGM4C6LEZA1`   |
| Quero conversar    | Seções de dor, manifesto                | `wa.me/message/Y43UGM4C6LEZA1`   |
| Diagnosticar minha marca | CTA intermediário                | `wa.me/message/Y43UGM4C6LEZA1`   |

### 0.2 Links sociais

- Instagram: `https://www.instagram.com/mid.influencia` — texto âncora: `@mid.influencia`
- E-mail: `contato@mid.com.br`
- WhatsApp: `https://wa.me/message/Y43UGM4C6LEZA1`

### 0.3 Aria-labels e microcopy

| Elemento               | Texto                                              |
|------------------------|----------------------------------------------------|
| Botão WhatsApp header  | "Falar com a MID no WhatsApp"                      |
| Botão WhatsApp flutuante | "Abrir conversa no WhatsApp"                    |
| Logo no header         | "MID — voltar ao início"                           |
| Menu mobile            | "Abrir menu" / "Fechar menu"                       |
| Embed Instagram        | "Acompanhe a MID no Instagram"                     |
| Acordeão FAQ           | "Expandir pergunta" / "Recolher pergunta"          |
| Skip link              | "Pular para o conteúdo"                            |

---

## 1. HEADER

### 1.1 Desktop

```
[LOGO MID]   Início   Método   Serviços   Cases   Sobre   Contato   [Falar no WhatsApp]
```

### 1.2 Mobile (menu hambúrguer)

```
[LOGO MID]                                       [☰]
```

Ao abrir:

```
[LOGO MID]                                       [×]
─────────────────────────────────
Início
Método
Serviços
Cases
Sobre
Contato
─────────────────────────────────
[Falar no WhatsApp →]
```

### 1.3 Comportamento

- Header fixo no topo (sticky).
- Fundo preto translúcido com `backdrop-filter: blur(12px)` ao rolar.
- Borda inferior off-white 1px aparece após 80px de scroll.
- Logotipo MID à esquerda.
- Menu à direita (desktop). Hambúrguer no mobile.
- Botão WhatsApp verde sempre visível.

### 1.4 Microcopy do header

- Tooltip do botão WhatsApp (desktop): "Resposta em até 2h úteis"
- Tooltip do logo: "MID — Início"

---

## 2. HERO

### 2.1 Headline principal

```
Seu negócio é grande.
Mas o digital ainda não mostra isso.
```

### 2.2 Headline alternativa (caso queira testar)

```
Seu negócio é grande.
O digital ainda não conta isso.
```

### 2.3 Subhead

```
Espelhamos a inteligência da sua operação numa presença
digital do tamanho que ela merece.
```

### 2.4 CTAs

```
[ Posicionar minha marca ]   [ Conhecer o método MEC → ]
```

- Primário (verde WhatsApp): "Posicionar minha marca"
- Secundário (outline off-white): "Conhecer o método MEC" (âncora #metodo)

### 2.5 Linha de prova (logo abaixo dos CTAs)

```
+30 marcas reposicionadas · Atendimento consultivo · Método próprio
```

### 2.6 Eyebrow acima da headline (opcional)

```
PARA DONOS DE NEGÓCIO QUE JÁ CRESCERAM FORA DO DIGITAL
```

---

## 3. PROBLEMA (DOR)

### 3.1 Eyebrow

```
O DIAGNÓSTICO
```

### 3.2 Título

```
O que trava o digital do seu negócio
```

### 3.3 Subhead

```
Você reconhece alguma dessas?
```

### 3.4 Cards (4 bullets numerados)

```
01
Sabe que tem um produto melhor que a concorrência —
mas o Instagram não diz isso.

02
Quando o cliente abre seu perfil, sente menos
confiança do que na visita ao seu escritório.

03
Você está trocando a peça errada: post bonito
não é estratégia.

04
Sua comunicação serve pra todo mundo — e por isso
não fala com ninguém.
```

### 3.5 CTA da seção

```
[ Reconheceu? Vamos conversar → ]
```

Texto complementar (acima do botão):

```
Se você marcou pelo menos uma, o problema não é o que
você posta. É o que está faltando antes do post.
```

---

## 4. MÉTODO MEC

### 4.1 Eyebrow

```
NOSSO PROCESSO
```

### 4.2 Título

```
O Método MEC
```

### 4.3 Subhead

```
Três passos. Um posicionamento inegável.
```

### 4.4 Bloco 1 — M · MAPEAR

```
M

MAPEAR

Olhamos para o seu negócio como se fosse o nosso.
Mapeamos operação, cliente, mercado e o que realmente
diferencia você. Sem achismo. Sem "achômetro".

Entregáveis: diagnóstico estratégico, mapa de
posicionamento, radar de concorrência.
```

### 4.5 Bloco 2 — E · ESPELHAR

```
E

ESPELHAR

Traduzimos a inteligência que já existe dentro da
sua empresa numa linguagem digital que tem o seu
tamanho. Conteúdo, identidade e discurso — coerentes
entre si, do perfil ao direct.

Entregáveis: identidade verbal, identidade visual,
arquétipo de marca, manual de tom de voz.
```

### 4.6 Bloco 3 — C · CONECTAR

```
C

CONECTAR

Posicionamos sua marca no digital para ser encontrada
pelas pessoas certas, no momento certo. Não é volume.
É direção. Cada peça cumpre um papel.

Entregáveis: calendário editorial, funil de conteúdo,
rotina de canais, critérios de mensuração.
```

### 4.7 Conector visual (entre os 3 blocos)

```
M  →  E  →  C
```

Linha horizontal ou setas indicando fluxo.

### 4.8 CTA da seção

```
[ Quero o MEC aplicado à minha marca ]
```

---

## 5. SERVIÇOS

### 5.1 Eyebrow

```
O QUE ENTREGAMOS
```

### 5.2 Título

```
Serviços que nascem do diagnóstico
```

### 5.3 Subhead

```
Nada aqui é pacote de prateleira. Cada entrega começa
com o MEC aplicado ao seu cenário.
```

### 5.4 Cards (6)

#### 5.4.1 Posicionamento estratégico

```
[ícone: bússola]

POSICIONAMENTO ESTRATÉGICO

Definimos a essência da marca — o que ela é,
para quem é e por que importa. A base de tudo
que vem depois.
```

#### 5.4.2 Construção de presença digital

```
[ícone: moldura]

CONSTRUÇÃO DE PRESENÇA DIGITAL

Perfil, bio, destaques, feed, link na bio, pauta
de Direct. Tudo alinhado com o posicionamento
aprovado.
```

#### 5.4.3 Conteúdo com método

```
[ícone: documento]

CONTEÚDO COM MÉTODO

Carrosséis, reels, textos, fotos. Cada peça tem
função estratégica. Nada é "pra postar".
```

#### 5.4.4 Direção criativa

```
[ícone: paleta]

DIREÇÃO CRIATIVA

Identidade visual, paleta, tipografia, fotografia,
vídeo. Coerência do começo ao fim — dentro e fora
da tela.
```

#### 5.4.5 Gestão de canal

```
[ícone: gráfico]

GESTÃO DE CANAL

Operação mensal: planejamento, produção, publicação,
análise e ajuste. Seu perfil nasce, respira e evolui.
```

#### 5.4.6 Treinamento de equipe interna

```
[ícone: pessoas]

TREINAMENTO DE EQUIPE INTERNA

Seu time aprende a falar a língua da marca. Pra
continuar produzindo sem depender 100% de fora.
```

### 5.5 CTA da seção

```
[ Quero montar o escopo da minha marca ]
```

---

## 6. CASES

### 6.1 Eyebrow

```
PROVA
```

### 6.2 Título

```
Resultados que viraram referência
```

### 6.3 Subhead

```
Cases com números, sem maquiagem. Cada resultado
aqui passou pelo MEC antes de virar post.
```

### 6.4 Case 1 — INDÚSTRIA

```
INDÚSTRIA  ·  Cliente anônimo (segmento industrial B2B)

PROBLEMA
Marca forte no presencial, invisível no digital.
Concorrentes menores tomando atenção que deveria
ser dela.

MEC APLICADO
Mapeamento da operação e do cliente ideal.
Reposicionamento completo da comunicação. 90 dias
de conteúdo com método.

RESULTADO
+340% de engajamento no perfil. 3 novas contas-cliente
fechadas por mês via direct. Tempo de resposta do
comercial caiu pela metade.
```

### 6.5 Case 2 — SERVIÇO B2B

```
SERVIÇO B2B  ·  Consultoria de gestão

PROBLEMA
Comunicação genérica, leads desqualificados, equipe
gastando tempo com gente que não fechava.

MEC APLICADO
Refil completo de discurso. Novo funil de conteúdo
por estágio de jornada. Pauta de captação orgânica.

RESULTADO
Leads qualificados cresceram 4× em 60 dias.
Taxa de comparecimento em reunião subiu de 38% para 71%.
```

### 6.6 Case 3 — VAREJO LOCAL

```
VAREJO LOCAL  ·  Rede de cafeterias

PROBLEMA
Dono travado quando perguntavam "o que vocês têm
de melhor". O melhor não aparecia no digital.

MEC APLICADO
Mapeamento da experiência real dentro da loja.
Espelho da operação em 5 vídeos curtos e 1 carrossel
de posicionamento.

RESULTADO
Posicionamento viralizou no nicho da cidade.
Cliente voltou a fechar e voltou a se orgulhar do
próprio negócio.
```

### 6.7 CTA da seção

```
[ Quero resultado assim na minha marca ]
```

---

## 7. FEED INSTAGRAM (EMBED)

### 7.1 Eyebrow

```
AO VIVO
```

### 7.2 Título

```
Acompanhe no Instagram
```

### 7.3 Subhead

```
Refletindo o digital que faz diferença.
Siga [@mid.influencia](https://www.instagram.com/mid.influencia)
e veja o método em movimento.
```

### 7.4 Bloco do embed

```
┌──────────────────────────────────────────┐
│                                          │
│   [ EMBED OFICIAL @mid.influencia ]      │
│                                          │
│   grid com últimos 6–9 posts             │
│                                          │
└──────────────────────────────────────────┘
```

### 7.5 CTA abaixo do embed

```
[ Seguir @mid.influencia no Instagram ]
```

### 7.6 Implementação técnica (nota para o dev)

```html
<!-- Opção 1: Embed oficial -->
<script src="https://www.instagram.com/embed.js" async></script>
<blockquote class="instagram-media"
  data-instgrm-permalink="https://www.instagram.com/mid.influencia/"
  data-instgrm-version="14">
</blockquote>

<!-- Opção 2: Grid manual com prints -->
<div class="ig-grid">
  <!-- 9 imagens com link para o post original -->
</div>
```

Recomendação: começar com embed oficial (carrega mais devagar mas
é aprovado pelo Instagram). Se performance pesar, trocar pelo grid
manual com prints otimizados.

---

## 8. SOBRE / MANIFESTO

### 8.1 Eyebrow

```
QUEM ESTÁ ATRÁS
```

### 8.2 Título

```
A MID
```

### 8.3 Texto do manifesto

```
Não somos uma agência que posta por postar.
Não vendemos "alcance". Não vendemos "likes".

Vendemos posicionamento. O tipo que faz seu cliente
abrir o Instagram e pensar: "é essa".
```

```
Acreditamos que toda empresa tem uma inteligência
única — um motivo real pra ser escolhida. Nosso
trabalho é fazer isso aparecer.
```

```
Se você quer uma comunicação que serve pra todo
mundo, qualquer um resolve.

Se quer uma que fala com quem importa, a gente
conversa.
```

### 8.4 Assinatura (opcional)

```
— MID · Método Espelho de Comunicação
```

### 8.5 CTA da seção

```
[ Quero conversar com a MID ]
```

---

## 9. CTA INTERMEDIÁRIO

### 9.1 Layout: banner horizontal em destaque

```
╔══════════════════════════════════════════════════╗
║                                                  ║
║        Posicione sua marca no digital.           ║
║                                                  ║
║   Diagnóstico gratuito de 15 min no WhatsApp.    ║
║              Sem compromisso.                    ║
║                                                  ║
║      [ Diagnosticar minha marca → ]              ║
║                                                  ║
╚══════════════════════════════════════════════════╝
```

### 9.2 Variação de headline (para teste A/B)

```
A: Posicione sua marca no digital.
B: Sua marca tem o tamanho que você quer mostrar.
C: O próximo passo cabe numa conversa de 15 minutos.
```

### 9.3 Microcopy abaixo do botão

```
Resposta em até 2h úteis. Conversa com gente que entende
do seu mercado — não com SDR.
```

---

## 10. FAQ

### 10.1 Título

```
Perguntas que recebemos toda semana
```

### 10.2 Perguntas e respostas

#### 1. Vocês atendem meu segmento?

```
Atendemos marcas que já têm operação real — entregam,
vendem, faturam — e querem o digital no mesmo nível.

Se você vende, entrega e quer crescer, sim.
Se você está começando do zero, indicamos parceiros
mais adequados.
```

#### 2. Quanto custa?

```
Depende do diagnóstico. Cada marca tem um escopo
diferente — e a gente não aplica tabela fixa.

A primeira conversa é gratuita. Nela mapeamos o tamanho
do desafio e apresentamos o investimento sem surpresa.
```

#### 3. Como funciona o método MEC?

```
M — Mapeamos sua operação, cliente e diferencial.
E — Espelhamos a inteligência da marca no digital.
C — Conectamos a marca com quem precisa dela.

É processo, não fórmula. E é exatamente por isso
que funciona.
```

#### 4. Em quanto tempo vejo resultado?

```
Primeiros ajustes de percepção: 30 dias.
Resultados consistentes: 60 a 90 dias.
Posicionamento consolidado: a partir de 6 meses.

Quem promete resultado em 15 dias geralmente está
vendendo vaidade.
```

#### 5. Já trabalho com outra agência, faz sentido trocar?

```
Se sua agência atual só entrega post sem perguntar
o "porquê", sim — faz sentido conversar.

Se ela já faz diagnóstico estratégico com você,
talvez ela já esteja aplicando algo parecido com o MEC.
```

#### 6. Vocês também fazem tráfego pago?

```
Sim — mas só depois do posicionamento.

Impulsionar mensagem errada só queima dinheiro mais
rápido. A gente prefere construir a mensagem certa
primeiro e ligar o tráfego depois.
```

#### 7. Atendem fora da minha cidade / estado?

```
Atendemos clientes em todo o Brasil. A operação é
100% remota, com reuniões marcadas, cronograma claro
e entregáveis semanais.
```

#### 8. Como é o processo de início?

```
1. Você manda mensagem no WhatsApp.
2. Marcamos uma conversa de 15 min (diagnóstico).
3. Em 5 dias úteis, entregamos a proposta.
4. Se fizer sentido, começamos com a fase de
   Mapeamento do MEC.
```

### 10.3 CTA final do FAQ

```
Ainda tem dúvida? Manda direto no WhatsApp.
[ Falar agora → ]
```

---

## 11. FOOTER

### 11.1 Layout 3 colunas (desktop)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   [LOGO MID]                                             │
│                                                          │
│   Espelhamos a inteligência                              │
│   da sua operação no digital.                            │
│                                                          │
│   ────────────         ────────────         ────────────  │
│   NAVEGAÇÃO             CONTATO             REDES         │
│   Início                WhatsApp            Instagram     │
│   Método                contato@…           @mid.influen… │
│   Serviços              …                                   │
│   Cases                                                     │
│   Sobre                                                     │
│   Contato                                                   │
│   ────────────         ────────────         ────────────  │
│                                                          │
│   © 2026 MID · Todos os direitos reservados              │
│   Feito com método.                                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 11.2 Coluna 1 — Logotipo + tagline

```
[LOGO MID]

Espelhamos a inteligência da sua operação
no digital.
```

### 11.3 Coluna 2 — Navegação

```
NAVEGAÇÃO
- Início
- Método
- Serviços
- Cases
- Sobre
- Contato
```

### 11.4 Coluna 3 — Contato

```
CONTATO
- WhatsApp: +55 (XX) XXXXX-XXXX
- E-mail: contato@mid.com.br
```

### 11.5 Coluna 4 — Redes

```
REDES
- Instagram: @mid.influencia
- (YouTube / LinkedIn, se houver)
```

### 11.6 Rodapé

```
© 2026 MID · Todos os direitos reservados
Feito com método.
```

---

## 12. WHATSAPP FLUTUANTE (todas as seções)

### 12.1 Visual

```
                                                    ┌────┐
                                                    │ WA │ ← pulsa
                                                    └────┘
```

### 12.2 Especificações

- Posição: canto inferior direito (`fixed; bottom: 16px; right: 16px`).
- Mobile: `bottom: 12px; right: 12px`.
- Tamanho: 56×56 px (mobile) / 64×64 px (desktop).
- Cor de fundo: `#25D366` (verde WhatsApp oficial).
- Ícone: logo WhatsApp branco, centralizado.
- Sombra: `0 8px 24px rgba(0,0,0,0.35)`.
- Animação: pulsar sutil a cada 2,5s (scale 1 → 1.05 → 1).
- Tooltip (desktop): "Fale com a MID" — aparece à esquerda do botão no hover.
- Z-index: 9999 (acima de tudo, exceto modais).

### 12.3 Comportamento

- Aparece após o usuário rolar 200px (some no topo, se preferir).
- Pode ser ocultado quando o usuário chega ao footer (opcional).
- Link: `https://wa.me/message/Y43UGM4C6LEZA1`
- Atributo: `target="_blank" rel="noopener"`
- aria-label: "Abrir conversa no WhatsApp"

---

## 13. ESTADOS E MICROCOPY AVANÇADOS

### 13.1 Estados do botão WhatsApp

| Estado    | Visual                                                         |
|-----------|----------------------------------------------------------------|
| Normal    | Verde #25D366, ícone branco                                    |
| Hover     | Verde #1EBE57 (escurece 5%), sombra aumenta                   |
| Active    | Verde #1AAA52                                                  |
| Focus     | Anel off-white 2px em volta (`outline-offset: 4px`)           |
| Disabled  | Verde #B7DCC4 (não usado no site, mas previsto)              |

### 13.2 Estados do menu mobile

```
Fechado: [☰]
Aberto:  [×]

Aberto mostra:
- Logo
- Links de navegação
- Botão WhatsApp full-width no rodapé do menu
```

### 13.3 Estados do acordeão FAQ

```
Fechado: ▸ Pergunta
Aberto:  ▾ Pergunta
         Resposta em texto descritivo.
```

### 13.4 Estados do embed Instagram

```
Carregando: skeleton com 6 retângulos escuros pulsando
Erro: "Não foi possível carregar o feed.
       Siga @mid.influencia no Instagram."
Sucesso: grid com últimos 6–9 posts + botão "Seguir"
```

---

## 14. SEO E META

### 14.1 Title

```
MID — Posicionamento digital para marcas que já cresceram
```

### 14.2 Meta description

```
Espelhamos a inteligência da sua operação numa presença
digital do tamanho que ela merece. Método MEC próprio,
atendimento consultivo.
```

### 14.3 Open Graph

```
og:title: MID — Posicionamento digital para marcas que cresceram
og:description: Seu negócio é grande. O digital ainda não mostra isso?
og:type: website
og:image: /assets/og-mid.png  (a criar com o logo)
og:url: https://mid.com.br
```

### 14.4 Schema.org (Organization)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "MID",
  "description": "Agência de posicionamento digital",
  "url": "https://mid.com.br",
  "sameAs": [
    "https://www.instagram.com/mid.influencia"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+55-XX-XXXXX-XXXX",
    "contactType": "customer support",
    "areaServed": "BR",
    "availableLanguage": "Portuguese"
  }
}
```

---

## 15. TEXTOS DE TRANSIÇÃO ENTRE SEÇÕES

Cada seção termina com uma microfrase de ligação para a próxima:

| De → Para              | Frase de transição                                            |
|------------------------|---------------------------------------------------------------|
| Hero → Problema        | "E se você já percebeu isso, o próximo bloco é pra você."     |
| Problema → MEC         | "A saída tem nome. Se chama Método MEC."                      |
| MEC → Serviços         | "Do método nascem os serviços. Cada um cobre uma parte do seu digital." |
| Serviços → Cases       | "Teoria comprovada na prática. Olha o que aconteceu com esses clientes." |
| Cases → Instagram      | "O método em movimento. Acompanhe no Instagram."              |
| Instagram → Sobre      | "Antes de continuar, deixa a gente se apresentar."            |
| Sobre → CTA            | "Se isso fez sentido, a próxima etapa é simples."             |
| CTA → FAQ              | "Antes de conversar, talvez uma dessas responda logo."        |
| FAQ → Footer           | "Se sobrou dúvida, o WhatsApp tá ali em cima."                |

---

## 16. MENSAGENS PADRÃO PARA WHATSAPP (PRÉ-PREENCHIDAS)

Para diferentes pontos de entrada, o link pode trazer mensagens pré-preenchidas:

| Origem                    | Mensagem pré-preenchida                                               |
|---------------------------|-----------------------------------------------------------------------|
| Botão do header           | "Vim pelo site e quero posicionar minha marca."                      |
| CTA do Hero               | "Quero posicionar minha marca. Vim pelo hero do site."                |
| CTA da seção Problema     | "Me reconheci em pelo menos uma das dores. Quero conversar."         |
| CTA do MEC                | "Quero entender como o MEC se aplica ao meu negócio."                |
| CTA de Cases              | "Vi os cases e quero resultado assim."                                |
| CTA intermediário         | "Quero o diagnóstico gratuito de 15 min."                             |
| CTA do FAQ                | "Tenho uma dúvida específica: [COLOCAR AQUI]"                         |
| Botão flutuante           | "Olá, MID. Vim pelo site."                                            |

URL de exemplo (com texto pré-preenchido):

```
https://wa.me/message/Y43UGM4C6LEZA1?text=Olá%2C%20vim%20pelo%20site
```

---

## 17. NOTAS DE IMPLEMENTAÇÃO

### 17.1 Stack recomendado (sugestão)

- HTML5 semântico
- CSS moderno (custom properties para o sistema de cores)
- JS mínimo (apenas para menu mobile, acordeão FAQ, scroll do header)
- Sem dependência de framework — site institucional leve
- Deploy: Vercel / Netlify / hospedagem tradicional

### 17.2 Variáveis CSS sugeridas

```css
:root {
  --color-bg: #0A0A0A;
  --color-bg-soft: #141414;
  --color-text: #F4F1EA;
  --color-text-dim: #A8A39A;
  --color-accent: #XXXXXX;      /* a definir com o logo */
  --color-whatsapp: #25D366;
  --color-whatsapp-hover: #1EBE57;
  --font-display: "NomeDaFonte", serif;
  --font-body: "NomeDaFonte2", sans-serif;
  --max-width: 1200px;
}
```

### 17.3 Pontos de atenção

- Botão WhatsApp flutuante: garantir que não cobre conteúdo importante (calcular padding-bottom do body no mobile).
- Embed Instagram: carregar de forma assíncrona pra não travar render.
- Acessibilidade: contraste mínimo AA (4.5:1) em todos os textos.
- Mobile: testar embed Instagram — alguns navegadores móveis têm problemas com iframe.

---

## 18. CHECKLIST DE ENTREGA

- [x] Copy de todas as seções (12)
- [x] Variações A/B de headlines principais
- [x] Microcopy de UI (botões, aria-labels, tooltips)
- [x] Estados de componentes (botões, acordeão, menu mobile)
- [x] Mensagens pré-preenchidas do WhatsApp por origem
- [x] Textos de transição entre seções
- [x] SEO e meta tags
- [x] Schema.org
- [x] Notas de implementação
- [ ] Cor de acento (depende do logo)
- [ ] Número de WhatsApp visível (a confirmar)
- [ ] Casos reais (a confirmar)
- [ ] Imagens OG e assets visuais

---

## Próximos passos

1. Definir **cor de acento** (preciso analisar o logo).
2. Confirmar **número de WhatsApp** visível no footer.
3. Validar **cases reais** ou manter genéricos.
4. Implementar HTML/CSS baseado nesta copy.
5. Refinar por seção conforme feedback.