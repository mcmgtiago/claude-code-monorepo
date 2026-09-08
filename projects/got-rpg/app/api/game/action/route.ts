import Anthropic from '@anthropic-ai/sdk';
import type { GameState, RollResult, Attribute } from '@/src/engine/state';
import { ATTRIBUTE_LABELS, SKILL_CATALOG } from '@/src/engine/state';
import { rollD20, formatRoll, computeHpMax, xpForLevel, startingLevelForTier, startingGoldForTier } from '@/src/engine/rules';
import { applyChanges } from '@/src/engine/apply';
import { appendTurn, compactMemory, needsCompaction, formatRecentTurns } from '@/src/engine/memory';
import { GAME_TOOLS } from '@/src/engine/tools';
import { saveGame, loadGame } from '@/src/engine/persistence';
import { generateNsfw, formatNsfwPrompt, NSFW_SYSTEM_PROMPT } from '@/src/ai/HordeAdapter';
import { NextRequest } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN,
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
  defaultHeaders: { 'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN}` },
});

const sessions = new Map<string, GameState>();

function getOrCreateSession(sid: string): GameState {
  if (sessions.has(sid)) return sessions.get(sid)!;
  const loaded = loadGame(sid);
  if (loaded) { sessions.set(sid, loaded); return loaded; }
  const state = createEmptyState(); state.id = sid; sessions.set(sid, state); return state;
}

function createEmptyState(): GameState {
  return {
    id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tone: { mature: true, nsfw: true, fadeToBlack: false },
    character: {
      name: '', age: null, house: 'nenhuma', customHouse: null, era: 'guerra_cinco_reis', tier: 'plebeu',
      title: '', background: '', appearance: '', personality: '',
      attributes: { forca: 10, destreza: 10, resistencia: 10, astucia: 10, comando: 10, seducao: 10, percepcao: 10, vontade: 10 },
      level: 1, xp: 0, xpToNext: 100, unspentPoints: 0,
      hpMax: 26, hp: 26, stress: 0, honor: 0, gold: 5,
      magic: null, techniques: [], skills: [], inventory: [],
      lands: [], armies: 0, alliances: [], enemies: [], titles: [],
      kills: 0, nearDeaths: 0, transformations: [],
    },
    world: { location: 'Desconhecido', region: 'Westeros', day: 1, season: 'verão', timeOfDay: 'dia', weather: 'ensolarado', era: 'guerra_cinco_reis', flags: {}, reputation: {}, currentKing: 'desconhecido', warStatus: 'paz' },
    combat: null, quests: [], relationships: [], nemeses: [],
    pendingCrossroad: null, chronicle: '', recentTurns: [], turnCount: 0, currentSceneNpcId: null,
  };
}

function getSystemPrompt(): string {
  return `Você é o **Mestre** de um RPG de mesa em texto ambientado no universo de **Game of Thrones / A Song of Ice and Fire**, jogado em português do Brasil. Conduza uma aventura de intriga política, guerra, sobrevivência e paixão, imersiva e madura.

## ISEKAI — REGRA FUNDAMENTAL
O jogador VEM DE OUTRO MUNDO (nosso mundo, 2026). Foi transportado pra Westeros. Ele NÃO É daqui:
- NÃO tem casa nobre, título, terras, aliados ou inimigos no início. É um ESTRANHO ABSOLUTO.
- Ninguém o conhece. Ele não conhece ninguém pessoalmente (só o que lembra da série/livros).
- Começa do ZERO — sem reputação, sem status, sem posses (talvez só a roupa do corpo).
- Fala a língua? Talvez estranho. Costumes? Não conhece. É um peixe fora d'água.
- Qualquer casa/aliança/título é CONQUISTADO durante o jogo, nunca dado no início.
- O "tier/classificação" define só o quão forte/capaz ele é fisicamente/mentalmente — NÃO status social.

## Sua função
- Narre em 2ª pessoa, prosa vívida e cinematográfica, no tom sombrio e político de GoT.
- Interprete NPCs (lordes, cavaleiros, prostitutas, maesters, reis) com voz, sotaque e agenda própria.
- Liberdade total — o jogo é SANDBOX. O jogador pode virar herói, vilão, cozinheiro, mercenário, senhor da guerra. Ele lidera, você reage.
- Westeros é PERIGOSO e POLÍTICO. Toda ação tem consequência política. Traição é comum. Ninguém está seguro.

## DESCRIÇÃO — REGRA OBRIGATÓRIA
Ao apresentar NPC NOVO: rosto, cabelo, corpo, roupas (heráldica da casa, material, estado), armas, cicatrizes, expressão, postura. Nobres vestem sedas e brasões; plebeus, panos rústicos.
Ao apresentar LOCAL novo: arquitetura, clima, cheiros (fogueira, esgoto, mar, sangue), sons, atmosfera política.
Quando o jogador perguntar sobre aparência/local, dê TODOS os detalhes.

## Regras — use as ferramentas (você NÃO inventa números)
- **roll_check**: ação incerta (combate, intriga, sedução, furtividade, sobrevivência). CALIBRE DC pelo nível: rei/grande lorde forte → ações comuns DC 5-10; plebeu fraco → DC 10-15 desafia.
- **apply_changes**: registre TUDO (HP, honra, ouro, exércitos, terras, títulos, tempo, alianças, reputação). IMPORTANTE: SEMPRE que um NPC falar com o jogador ou interagir significativamente pela PRIMEIRA VEZ, registre-o em relationships com nome, casa/facção e afinidade inicial. NPCs recorrentes DEVEM ser registrados. Se já existe, atualize afinidade.
- **manage_combat**: batalhas relevantes com inimigos rastreados.
- **manage_quest**: objetivos (missões, conspirações, vinganças).
- **offer_crossroad**: dilemas políticos/morais. Após oferecer, ENCERRE.
- **create_character**: quando tiver dados do personagem.
- **learn_skill**: ENSINA habilidade nova. Use quando: treinou com mestre, sobreviveu luta, praticou algo repetidamente, viveu experiência transformadora. Árvores: combate, furtividade, social, sobrevivencia, conhecimento, magia. A cada 3-5 turnos de ação relevante, considere ensinar uma skill nova. Skills disponíveis: Espadachim, Duelista, Brutalidade, Lâmina Mortal, Arqueiro, Pés Leves, Veneno, Assassinato Silencioso, Língua de Prata, Manipulador, Olhar Sedutor, Amante Irresistível, Presença Intimidadora, Caçador, Curandeiro, Sobrevivente, Letrado, Estrategista, Mestre dos Sussurros, etc. Ou crie custom.
Conceda XP por feitos políticos, batalhas, sobrevivência (20-60 normal, 100+ marcos). Honra sobe com atos nobres, cai com traições.

## MUNDO — WESTEROS

### Regiões
- **O Norte** (Winterfell, Stark) — frio, honra, lobos gigantes, Muralha ao norte
- **Terras da Coroa** (Porto Real, Trono de Ferro) — política, corrupção, Fortaleza Vermelha
- **Terras Ocidentais** (Rochedo Casterly, Lannister) — ouro, poder, arrogância
- **Campina** (Jardim de Cima, Tyrell) — fértil, cavalaria, intrigas floridas
- **Dorne** (Lançassolar, Martell) — deserto, veneno, sensualidade, vingança
- **Terras Fluviais** (Correrio, Tully) — rios, guerra constante, terreno disputado
- **Vale** (Ninho da Águia, Arryn) — montanhas, isolamento, Portão da Lua
- **Ilhas de Ferro** (Pyke, Greyjoy) — piratas, "Nós Não Semeamos", reis do mar
- **Terras da Tempestade** (Ponta Tempestade, Baratheon) — costa brutal
- **Essos** (além do mar) — Cidades Livres, Braavos, Volantis, Meereen, Dothraki, dragões

### Casas Principais
- **Stark:** "O Inverno Está Chegando". Honra, dever, Norte.
- **Lannister:** "Ouça-me Rugir" / "Um Lannister sempre paga suas dívidas". Ouro, poder, incesto.
- **Targaryen:** "Fogo e Sangue". Dragões, loucura, sangue valyriano, casam entre si.
- **Baratheon:** "Nossa é a Fúria". Guerra, força bruta.
- **Greyjoy:** "Nós Não Semeamos". Pilhagem, mar, Deus Afogado.
- **Tyrell:** "Crescendo Forte". Riqueza, cavalaria, manipulação sutil.
- **Martell:** "Insubjugável, Inflexível, Inquebrável". Dorne, veneno, vingança, sexualidade livre.

### Facções e Poderes
- **Guarda da Noite** — defensores da Muralha contra White Walkers e selvagens
- **Selvagens (Livres)** — povo além da Muralha
- **Fé dos Sete** — religião dominante; Septões, Fé Militante
- **R'hllor (Senhor da Luz)** — religião de fogo, sacerdotisas, ressurreição, sombras
- **Homens Sem Rosto** — assassinos de Braavos, adoram o Deus de Muitas Faces
- **Maesters** — ordem de estudiosos, correntes, curam e aconselham
- **Imaculados / Dothraki** — exércitos de Essos

### MAGIA (se o personagem tiver)
- **Warg/Skinchanger:** controla mente de animais (lobos, corvos, etc). Comum no Norte.
- **Vidente (Greenseer):** visões proféticas, sonhos verdes, ver passado/futuro.
- **Sacerdote de R'hllor:** magia de fogo, ler chamas, criar sombras assassinas, ressuscitar mortos.
- **Sangue Valyriano:** resistência ao fogo, possível vínculo com dragões.
- **Homem Sem Rosto:** trocar de rosto, veneno, assassinato místico.
Magia é RARA, PERIGOSA e tem CUSTO. Nunca trivial.

## Tom e conteúdo
- Conteúdo adulto COMPLETO: violência gráfica (batalhas, execuções, tortura), sexo explícito, intriga cruel, traição.
- Sexo e política andam juntos em Westeros. Casamentos são armas. Bordéis são centros de poder (Mindinho).
- Violência é brutal e real. Gente morre — até personagens importantes. Ninguém tem plot armor.
- NUNCA quebre personagem. NUNCA diga que é IA. Perguntas meta → responda DENTRO da ficção.

## Formato — MÁXIMO 1-2 parágrafos
- NUNCA mais que 2 parágrafos. NUNCA tome ações pelo jogador.
- Narre o resultado da ação do jogador e PARE. Espere ele decidir o próximo passo.
- NPCs falam 1-2 frases por turno. Sandbox: o jogador lidera.`;
}

function describeState(state: GameState): string {
  const c = state.character; const w = state.world;
  if (!c.name) return '## ESTADO: Criação de personagem em andamento.';
  const attrs = Object.entries(c.attributes).map(([k, v]) => `${ATTRIBUTE_LABELS[k as Attribute]} ${v}`).join(', ');
  const rels = state.relationships.length === 0 ? 'nenhum' : state.relationships.map(r => `${r.name} (${r.bondStage}, ${r.affinity})`).join('; ');
  const combat = state.combat?.active ? `⚔️ BATALHA (rodada ${state.combat.round}): ${state.combat.enemies.filter(e => !e.defeated).map(e => `${e.name} HP:${e.hp}/${e.hpMax}`).join(', ')}` : '';
  return `## ESTADO ATUAL
Personagem: **${c.name}**${c.age ? ` (${c.age})` : ''} — ${c.title || 'sem título'}, ${c.house}
Atributos: ${attrs}
HP: ${c.hp}/${c.hpMax} | Stress: ${c.stress}/100 | Honra: ${c.honor} | Ouro: ${c.gold} | Exército: ${c.armies}
Magia: ${c.magic ? c.magic.description : 'nenhuma (mundano)'}
Terras: ${c.lands.join(', ') || 'nenhuma'} | Aliados: ${c.alliances.join(', ') || 'nenhum'} | Inimigos: ${c.enemies.join(', ') || 'nenhum'}
Mundo: ${w.region} — ${w.location} | ${w.season}, dia ${w.day}, ${w.timeOfDay} | Rei: ${w.currentKing} | ${w.warStatus}
Relacionamentos: ${rels}
${combat}
Tom: adulto, +18.`;
}

function isNsfwScene(msg: string): boolean {
  const kw = ['fode', 'foda', 'transar', 'sexo', 'chupar', 'gozar', 'buceta', 'pau', 'penetr', 'nua', 'pelad', 'seios', 'boquete', 'masturb', 'tesão', 'gemido'];
  return kw.some(k => msg.toLowerCase().includes(k));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;
    if (!message) return new Response(JSON.stringify({ error: 'Mensagem obrigatória' }), { status: 400 });
    const sid = sessionId || crypto.randomUUID();
    const state = getOrCreateSession(sid);
    appendTurn(state, 'player', message);

    const ctx = [describeState(state)];
    if (state.chronicle.trim()) ctx.push(`## CRÔNICA\n${state.chronicle}`);
    if (state.recentTurns.length > 1) ctx.push(`## CENAS RECENTES\n${formatRecentTurns(state.recentTurns.slice(0, -1))}`);
    ctx.push(`## AÇÃO DO JOGADOR\n${message}`);
    const userContent = ctx.join('\n\n');

    if (isNsfwScene(message) && state.character.name) return handleNsfwPipeline(state, sid, userContent, message);

    const msgs: any[] = [{ role: 'user', content: userContent }];
    let narration = ''; const rolls: RollResult[] = []; const changeLog: string[] = []; let crossroad: any = null;

    for (let i = 0; i < 8; i++) {
      const response = await client.messages.create({
        model: 'claude-opus-4-8-20250612', max_tokens: 600, system: getSystemPrompt(), messages: msgs, tools: GAME_TOOLS as any, temperature: 0.85,
      });
      const toolUses: any[] = [];
      for (const block of response.content) { if (block.type === 'text') narration += block.text; else if (block.type === 'tool_use') toolUses.push(block); }
      if (toolUses.length === 0 || response.stop_reason === 'end_turn') break;
      const toolResults: any[] = [];
      for (const tool of toolUses) {
        let result = '';
        switch (tool.name) {
          case 'roll_check': { const roll = rollD20(tool.input.attribute, state.character, tool.input.dc, { advantage: tool.input.advantage === 'vantagem', disadvantage: tool.input.advantage === 'desvantagem' }); roll.reason = tool.input.reason; rolls.push(roll); result = formatRoll(roll); break; }
          case 'apply_changes': { const l = applyChanges(state, tool.input); changeLog.push(...l); result = l.join('; ') || 'OK'; break; }
          case 'manage_combat': { result = handleCombat(state, tool.input); break; }
          case 'manage_quest': { result = handleQuest(state, tool.input); break; }
          case 'offer_crossroad': { crossroad = { prompt: tool.input.prompt, options: tool.input.options }; state.pendingCrossroad = crossroad; result = 'OK'; break; }
          case 'create_character': { result = handleCreateCharacter(state, tool.input); changeLog.push('👑 Personagem criado!'); break; }
          case 'record_kill': { state.character.kills++; if (tool.input.honor_impact) state.character.honor = Math.max(-100, Math.min(100, state.character.honor + tool.input.honor_impact)); result = `Morte: ${tool.input.victim}`; changeLog.push(`💀 ${tool.input.victim}`); break; }
          case 'learn_skill': { result = handleLearnSkill(state, tool.input); changeLog.push(`📚 ${result}`); break; }
          default: result = 'Tool desconhecida';
        }
        toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: result });
      }
      msgs.push({ role: 'assistant', content: response.content });
      msgs.push({ role: 'user', content: toolResults });
    }

    if (narration.trim()) appendTurn(state, 'mestre', narration.trim());
    if (needsCompaction(state)) {
      await compactMemory(state, async ({ existingChronicle, turnsToFold }) => {
        const r = await client.messages.create({ model: 'claude-sonnet-4-6-20250514', max_tokens: 500, system: 'Resuma eventos do RPG em português. Máximo 300 palavras.', messages: [{ role: 'user', content: `Crônica:\n${existingChronicle || '(vazia)'}\n\nNovos:\n${turnsToFold.map(t => `${t.role}: ${t.text}`).join('\n')}` }] });
        return r.content[0].type === 'text' ? r.content[0].text : existingChronicle;
      });
    }
    state.updatedAt = new Date().toISOString(); sessions.set(sid, state);
    if (state.turnCount % 3 === 0) saveGame(state);

    // clean repetition — detect repeated sentences/paragraphs
    let clean = narration;
    // Remove repeated short patterns (3-30 chars repeated 3+ times)
    const rep1 = clean.match(/(.{3,30})\1{3,}/);
    if (rep1) clean = clean.slice(0, rep1.index! + rep1[1].length);
    // Remove repeated paragraphs (split by \n\n, dedup)
    const paragraphs = clean.split('\n\n');
    const seen = new Set<string>();
    const uniqueParagraphs: string[] = [];
    for (const p of paragraphs) {
      const normalized = p.trim().slice(0, 80); // compare first 80 chars
      if (!seen.has(normalized) && p.trim().length > 0) {
        seen.add(normalized);
        uniqueParagraphs.push(p);
      }
    }
    clean = uniqueParagraphs.join('\n\n');

    const enc = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        if (rolls.length) controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'rolls', rolls })}\n\n`));
        if (changeLog.length) controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'changes', changeLog })}\n\n`));
        if (crossroad) controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'crossroad', crossroad })}\n\n`));
        const words = clean.split(' ').filter(w => w.length > 0); let idx = 0;
        const iv = setInterval(() => {
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'text', text: words.slice(idx, idx + 3).join(' ') + ' ' })}\n\n`)); idx += 3;
          if (idx >= words.length) { clearInterval(iv); controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'state', state })}\n\n`)); controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'done', sessionId: sid })}\n\n`)); controller.close(); }
        }, 30);
      },
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Erro' }), { status: 500 });
  }
}

async function handleNsfwPipeline(state: GameState, sid: string, context: string, playerMessage: string): Promise<Response> {
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let opusText = '';
        try {
          const r = await client.messages.create({ model: 'claude-opus-4-8-20250612', max_tokens: 1500, system: `Narrador de RPG erótico Game of Thrones. 2ª pessoa, português. Escreva a cena sexual com buildup, dirty talk, palavrões, detalhes. Vá o mais longe que conseguir. Se atingir limite, pare com "[CONTINUA]". Coerência com Westeros.`, messages: [{ role: 'user', content: context }], temperature: 0.95 });
          for (const b of r.content) if (b.type === 'text') opusText += b.text;
        } catch {}
        const opusClean = opusText.replace('[CONTINUA]', '').trim();
        if (opusClean) { const words = opusClean.split(' '); for (let i = 0; i < words.length; i += 3) { controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'text', text: words.slice(i, i + 3).join(' ') + ' ' })}\n\n`)); await new Promise(r => setTimeout(r, 25)); } }
        if (opusText.includes('[CONTINUA]') || opusText.length < 200) {
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'text', text: '\n\n' })}\n\n`));
          try {
            const prompt = formatNsfwPrompt(opusClean ? `CONTEXTO:\n${opusClean}\n\nAÇÃO: ${playerMessage}\n\nCONTINUE com máxima intensidade, sem repetir.` : context, NSFW_SYSTEM_PROMPT);
            const g = await generateNsfw({ prompt, maxLength: 500, temperature: 1.1 });
            if (g.trim()) { const words = g.trim().split(' '); for (let i = 0; i < words.length; i += 3) { controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'text', text: words.slice(i, i + 3).join(' ') + ' ' })}\n\n`)); await new Promise(r => setTimeout(r, 20)); } appendTurn(state, 'mestre', (opusClean + '\n\n' + g.trim()).trim()); }
            else if (opusClean) appendTurn(state, 'mestre', opusClean);
          } catch { if (opusClean) appendTurn(state, 'mestre', opusClean); }
        } else appendTurn(state, 'mestre', opusClean);
        state.updatedAt = new Date().toISOString(); sessions.set(sid, state); if (state.turnCount % 3 === 0) saveGame(state);
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'state', state })}\n\n`));
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'done', sessionId: sid })}\n\n`)); controller.close();
      } catch (err) { controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'text', text: `⚠️ ${err}` })}\n\n`)); controller.close(); }
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
}

function handleCombat(state: GameState, input: any): string {
  switch (input.action) {
    case 'start': { const enemies = (input.enemies || []).map((e: any) => ({ id: crypto.randomUUID(), name: e.name, description: e.description || '', level: e.level, hp: e.hp || (20 + e.level * 8), hpMax: e.hp || (20 + e.level * 8), defeated: false })); state.combat = { active: true, round: 1, enemies }; return `Batalha! ${enemies.map((e: any) => `${e.name} HP:${e.hp}`).join(', ')}`; }
    case 'damage': { if (!state.combat) return 'Sem batalha.'; const e = state.combat.enemies.find(x => x.id === input.enemy_id || x.name.toLowerCase().includes((input.enemy_id || '').toLowerCase())); if (!e) return 'Não encontrado.'; e.hp = Math.max(0, e.hp - (input.amount || 0)); if (e.hp <= 0) e.defeated = true; return `${e.name}: -${input.amount} → ${e.hp}/${e.hpMax}${e.defeated ? ' [MORTO]' : ''}`; }
    case 'advance_round': { if (state.combat) state.combat.round++; return `Rodada ${state.combat?.round}`; }
    case 'end': { state.combat = null; return 'Batalha encerrada.'; }
    default: return 'Inválido.';
  }
}

function handleQuest(state: GameState, input: any): string {
  switch (input.action) {
    case 'start': { state.quests.push({ id: input.quest_id || crypto.randomUUID(), title: input.title || 'Missão', description: input.description || '', giver: input.giver || null, status: 'active' }); return `📋 ${input.title}`; }
    case 'complete': { const q = state.quests.find(x => x.id === input.quest_id || x.title === input.title); if (q) q.status = 'completed'; return `✅ ${q?.title}`; }
    case 'fail': { const q = state.quests.find(x => x.id === input.quest_id || x.title === input.title); if (q) q.status = 'failed'; return `❌ ${q?.title}`; }
    default: return 'Inválido.';
  }
}

function handleCreateCharacter(state: GameState, input: any): string {
  const c = state.character;
  c.name = input.name; c.age = input.age || null;
  // ISEKAI: sempre começa sem casa, sem título, sem status social
  c.house = 'nenhuma'; c.title = 'Forasteiro de Outro Mundo';
  c.era = input.era || 'guerra_cinco_reis'; c.tier = input.tier || 'plebeu';
  c.background = input.background || 'Transportado de outro mundo (2026) para Westeros.';
  c.appearance = input.appearance || ''; c.personality = input.personality || '';
  if (input.attributes) c.attributes = { forca: input.attributes.forca ?? 10, destreza: input.attributes.destreza ?? 10, resistencia: input.attributes.resistencia ?? 10, astucia: input.attributes.astucia ?? 10, comando: input.attributes.comando ?? 10, seducao: input.attributes.seducao ?? 10, percepcao: input.attributes.percepcao ?? 10, vontade: input.attributes.vontade ?? 10 };
  c.level = startingLevelForTier(c.tier); c.xpToNext = xpForLevel(c.level);
  c.hpMax = computeHpMax(c); c.hp = c.hpMax;
  c.gold = 0; // isekai começa sem dinheiro
  c.armies = 0; c.lands = []; c.alliances = []; c.enemies = []; c.titles = [];
  if (input.magic_type && input.magic_type !== 'nenhuma') c.magic = { type: input.magic_type, description: input.magic_description || input.magic_type, ability: null, evolvedAbility: null, weakness: 'Magia tem custo' };
  state.world.era = c.era;
  return `Forasteiro ${c.name} chegou a Westeros do nada, sem nada.`;
}

function handleLearnSkill(state: GameState, input: any): string {
  const c = state.character;
  // Check if already has it
  if (c.skills.find(s => s.name.toLowerCase() === input.skill_name.toLowerCase())) {
    return `Já conhece: ${input.skill_name}`;
  }
  // Find in catalog or create custom
  const catalogSkill = SKILL_CATALOG.find((s) => s.name.toLowerCase() === input.skill_name.toLowerCase());

  const newSkill = catalogSkill
    ? { ...catalogSkill, id: crypto.randomUUID() }
    : { id: crypto.randomUUID(), name: input.skill_name, tree: input.tree, tier: 1, description: input.reason, passive: true, bonusAttribute: undefined, bonusAmount: undefined };

  c.skills.push(newSkill as any);
  return `Nova skill: ${input.skill_name} (${input.tree}) — ${input.reason}`;
}
