# Planejamento Mega — Melhorias Visual Novel + UX + Gameplay

**Data:** 2026-08-25  
**Projetos:** X-Men, GoT, Bleach (todos)  
**Objetivo:** Transformar de "chat com IA" em "Visual Novel RPG imersiva"

---

## 🎯 GRANDE VISÃO

Sair disso:
```
[bolha cinza com texto]
[bolha branca com texto]
```

Pra isso:
```
┌─────────────────────────────────────┐
│  [RETRATO NPC]  │  Fala do NPC aqui │
│   Wolverine     │  com nome, humor, │
│                 │  e expressão       │
├─────────────────────────────────────┤
│  Narração do ambiente em itálico    │
├─────────────────────────────────────┤
│  [RETRATO PLAYER] │ Opções/input    │
└─────────────────────────────────────┘
```

---

## 1. VISUAL NOVEL UI — Retratos ao Lado das Falas

### Conceito
Quando NPC fala, mostra retrato dele ao lado da fala (estilo VN). Quando narra, sem retrato. Quando player fala, retrato do player (se tiver).

### Implementação

**Banco de imagens canônicas (CDN gratuito):**
- X-Men: usar imagens do Marvel Wiki, Pinterest boards de fan art, ou gerar via Pollinations UMA VEZ e cachear
- Bleach: arte oficial do anime/mangá (fan wikis)
- GoT: screenshots da série HBO / arte oficial

**Estrutura:**
```typescript
// src/data/npc-portraits.ts
export const NPC_PORTRAITS: Record<string, string> = {
  // X-Men
  'wolverine': 'https://image.pollinations.ai/prompt/Wolverine%20X-Men%20portrait%20comic%20style...',
  'rogue': '...',
  'emma frost': '...',
  // Bleach
  'ichigo': '...',
  'rukia': '...',
  // GoT
  'cersei': '...',
  'tyrion': '...',
};
```

**Na UI:**
```tsx
// Quando NPC fala (detectado pelo currentSceneNpcId no state)
<div className="flex gap-3 items-start">
  <img src={npcPortrait} className="w-16 h-16 rounded-full border" />
  <div>
    <span className="text-purple-300 text-xs font-bold">Wolverine</span>
    <p className="text-gray-200">"Fala do NPC aqui"</p>
  </div>
</div>
```

### Prioridade: ALTA
### Esforço: 3-4h (banco de imagens + UI + detectar quem fala)

---

## 2. BANCO DE RETRATOS PRÉ-GERADOS

### Conceito
Em vez de gerar imagem toda vez (lento, custa), ter um banco local de retratos dos personagens mais comuns. Gerar via Pollinations uma vez, salvar como URL cacheada.

### Para cada universo, 20-30 NPCs principais com retrato:

**X-Men (30 retratos):**
Wolverine, Rogue, Emma Frost, Cyclops, Jean Grey, Storm, Magneto, Mystique, Professor X, Gambit, Nightcrawler, Colossus, Kitty Pryde, Bishop, Cable, Psylocke, Deadpool, Sabretooth, Sebastian Shaw, Apocalypse, Mr. Sinister, Jubilee, Beast, Angel, Iceman, X-23, Domino, Forge, Polaris, Havok

**Bleach (30 retratos):**
Ichigo, Rukia, Byakuya, Renji, Aizen, Urahara, Yoruichi, Grimmjow, Ulquiorra, Orihime, Chad, Ishida, Kenpachi, Toshiro, Rangiku, Gin, Soi Fon, Unohana, Mayuri, Nell, Harribel, Starrk, Szayel, Nnoitra, Shinji, Hiyori, Kisuke, Isshin, Yamamoto, Shunsui

**GoT (30 retratos):**
Cersei, Tyrion, Jaime, Daenerys, Jon Snow, Arya, Sansa, Ned Stark, Robb, Theon, Joffrey, Margaery, Olenna, Littlefinger, Varys, The Hound, The Mountain, Brienne, Oberyn, Melisandre, Stannis, Ramsay, Bronn, Samwell, Tormund, Ygritte, Missandei, Grey Worm, Tywin, Robert

### Geração batch:
```bash
# Script que gera todos de uma vez via Pollinations
for npc in wolverine rogue emma_frost cyclops ...; do
  curl "https://image.pollinations.ai/prompt/Portrait%20of%20${npc}%20..." -o portraits/${npc}.jpg
done
```

### Prioridade: ALTA
### Esforço: 2h (script + organizar)

---

## 3. SEPARAR FALA DE NPC vs NARRAÇÃO

### Conceito
Hoje tudo vem numa bolha só. Precisa separar:
- **Narração** = texto em itálico, sem retrato, cor cinza
- **Fala de NPC** = com retrato, nome em destaque, aspas
- **Sistema** = rolls, changes (já funciona)
- **Player** = bolha branca à direita

### Como detectar quem fala:
A IA já usa `scene_npc` no `apply_changes` pra indicar quem está em cena. Vou usar isso + detectar padrões de diálogo (aspas, travessão) pra separar visualmente.

### Parser de mensagem:
```typescript
function parseNarration(text: string): Array<{type: 'narration' | 'dialogue', speaker?: string, content: string}> {
  // Detecta padrões:
  // — "Fala aqui" → dialogue
  // *texto em itálico* → narração
  // **Nome:** "fala" → dialogue com speaker
  // Resto → narração
}
```

### Prioridade: ALTA
### Esforço: 3h

---

## 4. EFEITOS SONOROS CONTEXTUAIS

### Conceito
Sons diferentes por tipo de evento:
- Mensagem do narrador chega: blip suave (já tem)
- Rolagem de dado: som de dado rolando
- Crítico (nat 20): som épico
- Falha crítica: som sombrio
- Level up: fanfarra
- Combate inicia: som de espada/impacto
- NPC fala: som leve de "pop"

### Implementação:
Web Audio API (sem arquivos). Cada tipo de som é uma sequência de tons programada.

### Prioridade: MÉDIA
### Esforço: 1h

---

## 5. ANIMAÇÕES E TRANSIÇÕES

### Conceito
- Mensagens entram com slide-up suave (já parcial)
- Retratos de NPC entram com fade-in
- Barras de HP animam quando mudam
- Tela de combate pulsa vermelho
- Level up: flash dourado na tela
- Morte: tela escurece brevemente

### CSS:
```css
@keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse-red { 0%, 100% { border-color: transparent; } 50% { border-color: rgba(239, 68, 68, 0.3); } }
```

### Prioridade: MÉDIA
### Esforço: 1.5h

---

## 6. SISTEMA DE CAPÍTULOS / SESSÕES

### Conceito
Dividir a história em "capítulos" com título. A cada 10-15 turnos (ou evento major), a IA nomeia o capítulo. Mostra no topo como navegação.

```
Capítulo 1: O Despertar em Madripoor
Capítulo 2: A Fuga pelos Esgotos
Capítulo 3: O Encontro com Wolverine  ← atual
```

Player pode clicar num capítulo pra ver o resumo (chronicle daquele período).

### Prioridade: BAIXA
### Esforço: 2h

---

## 7. NPC GALLERY / CODEX

### Conceito
Tela separada (acessível por botão) com todos os NPCs que já encontrou:
- Retrato
- Nome, facção
- Afinidade (barra visual)
- Status: aliado/neutro/inimigo/romance
- Último encontro (turno)
- Notas do player (editável)

### Prioridade: MÉDIA
### Esforço: 2h

---

## 8. MAPA INTERATIVO

### Conceito
Mapa simples (pode ser ASCII ou SVG) mostrando localizações conhecidas. Clicável pra "ir pra lá" (envia comando de viagem).

**X-Men:**
```
[Xavier's] --- [NY] --- [Madripoor]
                |
            [Genosha]
```

**GoT:**
```
[Winterfell] --- [Twins] --- [King's Landing]
      |                            |
[The Wall]                    [Highgarden]
```

**Bleach:**
```
[Karakura] --- [Soul Society] --- [Hueco Mundo]
```

### Prioridade: BAIXA
### Esforço: 3h

---

## 9. SISTEMA DE REPUTAÇÃO VISUAL

### Conceito
Barra visual no topo ou sidebar mostrando reputação com as facções principais:
- X-Men: Xavier's ██████░░░░ Brotherhood
- GoT: Stark ████░░░░░░ Lannister
- Bleach: Gotei 13 ████████░░ Hollows

Muda conforme ações. Cores mudam (verde=aliado, vermelho=inimigo).

### Prioridade: BAIXA
### Esforço: 1h

---

## 10. MODO ESPECTADOR / REPLAY

### Conceito
Poder reler a história toda como se fosse uma light novel. Sem input — só narrativa formatada bonita, com retratos, divisão de cenas.

"📖 Ler História" → abre view-only da campanha inteira formatada.

### Prioridade: BAIXA
### Esforço: 2h

---

## 11. QUICK ACTIONS CONTEXTUAIS

### Conceito
Botões de ação rápida que mudam conforme o contexto:
- Em exploração: [Explorar] [Descansar] [Inventário]
- Em diálogo: [Ameaçar] [Seduzir] [Mentir] [Sair]
- Em combate: [Atacar] [Defender] [Fugir] [Habilidade]
- Em cena +18: [Continuar] [Intensificar] [Parar]

### Prioridade: MÉDIA
### Esforço: 1.5h

---

## 12. NOTIFICAÇÕES TOAST

### Conceito
Notificações bonitas que aparecem e somem:
- "+50 XP" (dourado)
- "Nova skill: Espadachim" (azul)
- "Afinidade com Rogue +10" (rosa)
- "HP -15" (vermelho, pulsa)
- "Novo capítulo" (branco)

### Prioridade: MÉDIA  
### Esforço: 1h (parcialmente feito)

---

## 13. TEMA POR UNIVERSO

### Conceito
Cada RPG tem visual levemente diferente:
- **X-Men:** Preto + roxo neon + cyan
- **GoT:** Preto + dourado + vermelho sangue
- **Bleach:** Preto + azul espiritual + branco

Muda cores de destaque, bordas, botões.

### Prioridade: BAIXA
### Esforço: 1h

---

## 14. PWA (Progressive Web App)

### Conceito
Instalar no celular como app nativo. Ícone na home, fullscreen, offline fallback.

### Implementação:
- `manifest.json` com ícones
- Service worker básico
- `<meta name="apple-mobile-web-app-capable" content="yes">`

### Prioridade: MÉDIA
### Esforço: 1h

---

## 15. EXPORT / SHARE

### Conceito
- Exportar save como arquivo JSON (backup)
- Compartilhar screenshot de um momento épico
- Exportar história completa como .txt ou .md

### Prioridade: BAIXA
### Esforço: 1h

---

## ORDEM DE EXECUÇÃO (Recomendada)

### Sprint 1 — Visual Novel Core (Alto Impacto)
1. Banco de retratos pré-gerados (2h)
2. UI Visual Novel — retrato ao lado da fala (3h)
3. Parser de narração vs diálogo (2h)
4. Quick actions contextuais (1.5h)

### Sprint 2 — Polish & Feel
5. Animações e transições (1.5h)
6. Sons contextuais expandidos (1h)
7. Notificações toast melhoradas (1h)
8. Tema por universo (1h)

### Sprint 3 — Profundidade
9. NPC Gallery / Codex (2h)
10. Sistema de capítulos (2h)
11. Mapa interativo simples (3h)
12. Reputação visual (1h)

### Sprint 4 — Extra
13. PWA (1h)
14. Modo replay/leitura (2h)
15. Export/share (1h)

**Total estimado: ~25h de dev**

---

## SOBRE O VISUAL NOVEL STYLE

A mudança mais impactante é **separar diálogo de narração** e mostrar **retratos dos NPCs** quando falam.

Isso transforma a experiência de "lendo wall of text" pra "jogando uma visual novel interativa" — que é exatamente o feeling de games como:
- Persona 5 (diálogos com retrato)
- Fire Emblem (conversas com expressões)
- Disco Elysium (falas identificadas)
- Ace Attorney (personagem presente visual)

**Banco de imagens:** Pollinations gera grátis e instantâneo. Gero os 30 NPCs de cada universo uma vez, salvo as URLs, e a UI carrega direto. Zero custo, zero delay.

---

## PRIORIDADE MÁXIMA (fazer primeiro amanhã)

1. **Retratos de NPCs ao lado das falas** — o que mais muda a experiência
2. **Separar narração de diálogo** — UI mais limpa
3. **Quick actions** — menos digitação, mais imersão

Boa noite! Amanhã ataco isso. 🌙
