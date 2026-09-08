import Anthropic from '@anthropic-ai/sdk';
import type { GameState, RollResult, Attribute } from '@/src/engine/state';
import { ATTRIBUTE_LABELS } from '@/src/engine/state';
import { rollD20, formatRoll, computeHpMax, computeReiryokuMax, xpForLevel, startingLevelForTier } from '@/src/engine/rules';
import { applyChanges, handleLearnSkill } from '@/src/engine/apply';
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
  const loaded = loadGame(sid); if (loaded) { sessions.set(sid, loaded); return loaded; }
  const s = createEmptyState(); s.id = sid; sessions.set(sid, s); return s;
}

function createEmptyState(): GameState {
  return {
    id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tone: { mature: true, nsfw: true, fadeToBlack: false },
    character: {
      name: '', age: null, race: 'humano_puro', hybridRaces: [], tier: 'novato',
      background: '', appearance: '', personality: '',
      attributes: { reiatsu: 10, zanjutsu: 10, hakuda: 10, hoho: 10, kido: 10, percepcao: 10, vontade: 10, presenca: 10 },
      level: 1, xp: 0, xpToNext: 100, unspentPoints: 0,
      hpMax: 26, hp: 26, reiryokuMax: 15, reiryoku: 15, stress: 0, morality: 0,
      powerStage: 'base', zanpakuto: null, hollowMask: null, resurreccion: null, soulItem: null, signatureAbility: null,
      skills: [], techniques: [], inventory: [], rank: '', transformations: [],
      kills: 0, nearDeaths: 0, alliances: [], enemies: [],
    },
    world: { location: 'Desconhecido', region: 'Mundo Humano', day: 1, timeOfDay: 'noite', flags: {}, reputation: {} },
    combat: null, quests: [], relationships: [], nemeses: [], pendingCrossroad: null, chronicle: '', recentTurns: [], turnCount: 0, currentSceneNpcId: null,
  };
}

function getSystemPrompt(): string {
  return `Você é o **Mestre** de um RPG de mesa em texto ambientado no universo de **Bleach**, jogado em português do Brasil. Conduza uma aventura de ação sobrenatural, batalhas espirituais, evolução de poder e relações intensas.

## Sua função
- Narre em 2ª pessoa, prosa vívida e cinematográfica, no tom de shounen sombrio de Bleach.
- Interprete NPCs (shinigami, hollows, quincy, humanos) com voz e personalidade próprias.
- SANDBOX total. O jogador pode ser herói, vilão, mercenário, estudante. Ele lidera, você reage.

## DESCRIÇÃO — OBRIGATÓRIA
NPC novo: rosto, cabelo, corpo, roupas (shihakushō preto shinigami, branco arrancar, etc), zanpakutō, máscara, aura de reiatsu. LOCAL novo: arquitetura, atmosfera espiritual, densidade de reiatsu no ar.

## Regras — use as ferramentas (você NÃO inventa números)
- **roll_check**: ação incerta. CALIBRE DC pelo nível: capitão forte → DC 5-10 comum; novato → DC 10-15.
- **apply_changes**: registre TUDO (HP, reiryoku, XP, local, reputação). SEMPRE registre NPCs novos em relationships (nome, facção, afinidade).
- **manage_combat**: batalhas com inimigos rastreados.
- **manage_quest**: objetivos.
- **offer_crossroad**: dilemas. Após oferecer, ENCERRE.
- **create_character**: quando tiver dados.
- **reveal_zanpakuto**: revela nome/shikai (marco após comunhão com espírito).
- **advance_power_stage**: Shikai→Bankai, Adjuchas→Vasto Lorde, etc. Marco raro, conquistado.
- **transform_character**: muda raça (humano→shinigami, etc). ADITIVO, preserva poderes. Raro.
- **learn_skill**: técnicas (zanjutsu, kido, hoho, hakuda, hollow, quincy, social).
Conceda XP por batalhas, treino, marcos (20-60 normal, 100+ épico). Evoluções de poder são CONQUISTADAS.

## MUNDO — BLEACH

### Locais
- **Karakura** — cidade humana, epicentro de eventos espirituais
- **Soul Society** — mundo dos mortos. Seireitei (nobres, Gotei 13), Rukongai (distritos pobres)
- **Hueco Mundo** — deserto branco eterno, lar dos Hollows, Las Noches (palácio de Aizen)
- **Mundo Humano** — escolas, ruas, onde plus (almas) vagam

### Facções
- **Gotei 13** — 13 divisões de shinigami, cada uma com capitão e tenente
- **Espada** — 10 arrancar mais fortes, servos de Aizen
- **Visored** — ex-shinigami com poderes hollow, exilados
- **Quincy (Wandenreich)** — arqueiros espirituais, inimigos dos shinigami
- **Xcution** — grupo de Fullbringers

### Raças e Evolução
- **Shinigami:** Asauchi → Shikai (libera zanpakutō) → Bankai. Usam Kidō, Shunpo, Zanjutsu.
- **Hollow/Arrancar:** Gillian → Adjuchas → Vasto Lorde → Arrancar → Resurrección. Cero, Hierro, Sonido.
- **Quincy:** base → Vollständig. Heilig Pfeil, Blut, Hirenkyaku.
- **Humano/Fullbringer:** base → Fullbring completo. Poderes ligados a um objeto.
- **Visored:** shinigami + máscara hollow. Zanpakutō normal + boost hollow temporário (risco de perder controle).
- **Humano Comum:** SEM poderes de luta. Só vê espíritos. Arco de DESPERTAR (estilo Ichigo) — vira outra coisa via história.

### Zanpakutō
Cada shinigami tem uma zanpakutō com espírito próprio, elemento (gelo, fogo, sombra, etc), comando de liberação ("Ruja, Zangetsu!"), e habilidade de shikai/bankai. Revele o nome só após o jogador comungar com o espírito.

### Kidō (feitiços)
- **Hadō** (ataque): Hadō #31 Shakkahō (bola de fogo), #90 Kurohitsugi (caixão negro)
- **Bakudō** (defesa/prisão): Bakudō #61 Rikujōkōrō (seis barras de luz)

## Tom e conteúdo
- Adulto COMPLETO: violência gráfica (cortes, sangue, mortes), sexo explícito, trauma. Bleach é sombrio.
- Sexo e poder se misturam. Arrancars sedutores, shinigamis intensos.
- Batalhas são brutais. Personagens morrem. Ninguém tem plot armor.
- NUNCA quebre personagem. NUNCA diga que é IA.

## Formato — MÁXIMO 1-2 parágrafos
- NUNCA mais que 2 parágrafos. NUNCA tome ações pelo jogador.
- Narre o resultado e PARE. Espere o jogador decidir.
- NPCs falam 1-2 frases. Sandbox: jogador lidera.`;
}

function describeState(state: GameState): string {
  const c = state.character; const w = state.world;
  if (!c.name) return '## ESTADO: Criação em andamento.';
  const attrs = Object.entries(c.attributes).map(([k, v]) => `${ATTRIBUTE_LABELS[k as Attribute]} ${v}`).join(', ');
  const rels = state.relationships.length === 0 ? 'nenhum' : state.relationships.map(r => `${r.name} (${r.bondStage}, ${r.affinity})`).join('; ');
  const combat = state.combat?.active ? `⚔️ COMBATE (rodada ${state.combat.round}): ${state.combat.enemies.filter(e => !e.defeated).map(e => `${e.name} HP:${e.hp}/${e.hpMax}`).join(', ')}` : '';
  const zan = c.zanpakuto ? (c.zanpakuto.name ? `${c.zanpakuto.name} (${c.zanpakuto.element}; ${c.zanpakuto.shikaiAbility ?? 'shikai não revelado'})` : `selada (elemento oculto: ${c.zanpakuto.element})`) : '—';
  return `## ESTADO ATUAL
Personagem: **${c.name}**${c.age ? ` (${c.age})` : ''} — ${RACE(c)}, ${c.rank || 'sem rank'}, estágio ${c.powerStage}
Atributos: ${attrs}
HP: ${c.hp}/${c.hpMax} | Reiryoku: ${c.reiryoku}/${c.reiryokuMax} | Stress: ${c.stress}/100 | Moralidade: ${c.morality}
${c.zanpakuto ? `Zanpakutō: ${zan}` : ''}${c.hollowMask ? `\nMáscara Hollow: ${c.hollowMask}` : ''}${c.resurreccion ? `\nResurrección: ${c.resurreccion.zanpakutoName ?? 'não liberada'}` : ''}
Mundo: ${w.region} — ${w.location} | Dia ${w.day}, ${w.timeOfDay}
Relacionamentos: ${rels}
${combat}
Tom: adulto, +18.`;
}

function RACE(c: any): string {
  const races = (c.hybridRaces && c.hybridRaces.length) ? c.hybridRaces : [c.race];
  const labels: Record<string, string> = { shinigami: 'Shinigami', hollow: 'Hollow/Arrancar', quincy: 'Quincy', humano: 'Humano/Fullbringer', visored: 'Visored', humano_puro: 'Humano Comum' };
  return races.map((r: string) => labels[r] || r).join(' + ');
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
      const response = await client.messages.create({ model: 'claude-opus-4-8-20250612', max_tokens: 600, system: getSystemPrompt(), messages: msgs, tools: GAME_TOOLS as any, temperature: 0.85 });
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
          case 'create_character': { result = handleCreateCharacter(state, tool.input); changeLog.push('⚔️ Personagem criado!'); break; }
          case 'reveal_zanpakuto': { const c = state.character; c.zanpakuto = { name: tool.input.name, spiritPersonality: tool.input.spirit_personality || '', releaseCommand: tool.input.release_command || null, element: c.zanpakuto?.element || 'desconhecido', shikaiAbility: tool.input.shikai_ability || null, bankaiName: null, bankaiAbility: null }; result = `Zanpakutō revelada: ${tool.input.name}`; changeLog.push(`⚔️ ${tool.input.name} despertou!`); break; }
          case 'advance_power_stage': { const c = state.character; c.powerStage = tool.input.new_stage as any; if (tool.input.bankai_name && c.zanpakuto) { c.zanpakuto.bankaiName = tool.input.bankai_name; c.zanpakuto.bankaiAbility = tool.input.bankai_ability; } c.hpMax += 15; c.hp = c.hpMax; c.reiryokuMax += 20; c.reiryoku = c.reiryokuMax; c.transformations.push(`${tool.input.new_stage}: ${tool.input.reason}`); result = `Evolução: ${tool.input.new_stage}`; changeLog.push(`🔥 ${tool.input.new_stage}!`); break; }
          case 'transform_character': { const c = state.character; if (!c.hybridRaces.includes(c.race)) c.hybridRaces.push(c.race); if (!c.hybridRaces.includes(tool.input.to_race)) c.hybridRaces.push(tool.input.to_race); c.race = tool.input.to_race; if (tool.input.power_stage) c.powerStage = tool.input.power_stage; c.transformations.push(`Virou ${tool.input.to_race}: ${tool.input.reason}`); result = `Transformação: ${tool.input.to_race}`; changeLog.push(`✨ Despertou como ${tool.input.to_race}!`); break; }
          case 'learn_skill': { result = handleLearnSkill(state, tool.input); changeLog.push(`📚 ${result}`); break; }
          case 'record_kill': { state.character.kills++; if (tool.input.morality_impact) state.character.morality = Math.max(-100, Math.min(100, state.character.morality + tool.input.morality_impact)); result = `Morte: ${tool.input.victim}`; changeLog.push(`💀 ${tool.input.victim}`); break; }
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

    let clean = narration;
    const rep1 = clean.match(/(.{3,30})\1{3,}/); if (rep1) clean = clean.slice(0, rep1.index! + rep1[1].length);
    const paras = clean.split('\n\n'); const seen = new Set<string>(); const uniq: string[] = [];
    for (const p of paras) { const k = p.trim().slice(0, 80); if (!seen.has(k) && p.trim()) { seen.add(k); uniq.push(p); } }
    clean = uniq.join('\n\n');

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
  } catch (err) { return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Erro' }), { status: 500 }); }
}

async function handleNsfwPipeline(state: GameState, sid: string, context: string, playerMessage: string): Promise<Response> {
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let opusText = '';
        try { const r = await client.messages.create({ model: 'claude-opus-4-8-20250612', max_tokens: 1500, system: `Narrador de RPG erótico Bleach. 2ª pessoa, português. Cena sexual com buildup, dirty talk, palavrões, detalhes. Vá o mais longe que conseguir. Se atingir limite, pare com "[CONTINUA]".`, messages: [{ role: 'user', content: context }], temperature: 0.95 }); for (const b of r.content) if (b.type === 'text') opusText += b.text; } catch {}
        const opusClean = opusText.replace('[CONTINUA]', '').trim();
        if (opusClean) { const words = opusClean.split(' '); for (let i = 0; i < words.length; i += 3) { controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'text', text: words.slice(i, i + 3).join(' ') + ' ' })}\n\n`)); await new Promise(r => setTimeout(r, 25)); } }
        if (opusText.includes('[CONTINUA]') || opusText.length < 200) {
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'text', text: '\n\n' })}\n\n`));
          try { const prompt = formatNsfwPrompt(opusClean ? `CONTEXTO:\n${opusClean}\n\nAÇÃO: ${playerMessage}\n\nCONTINUE sem repetir.` : context, NSFW_SYSTEM_PROMPT); const g = await generateNsfw({ prompt, maxLength: 500, temperature: 1.1 }); if (g.trim()) { const words = g.trim().split(' '); for (let i = 0; i < words.length; i += 3) { controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'text', text: words.slice(i, i + 3).join(' ') + ' ' })}\n\n`)); await new Promise(r => setTimeout(r, 20)); } appendTurn(state, 'mestre', (opusClean + '\n\n' + g.trim()).trim()); } else if (opusClean) appendTurn(state, 'mestre', opusClean); } catch { if (opusClean) appendTurn(state, 'mestre', opusClean); }
        } else appendTurn(state, 'mestre', opusClean);
        state.updatedAt = new Date().toISOString(); sessions.set(sid, state); if (state.turnCount % 3 === 0) saveGame(state);
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'state', state })}\n\n`)); controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'done', sessionId: sid })}\n\n`)); controller.close();
      } catch (err) { controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'text', text: `⚠️ ${err}` })}\n\n`)); controller.close(); }
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
}

function handleCombat(state: GameState, input: any): string {
  switch (input.action) {
    case 'start': { const enemies = (input.enemies || []).map((e: any) => ({ id: crypto.randomUUID(), name: e.name, description: e.description || '', level: e.level, hp: e.hp || (20 + e.level * 8), hpMax: e.hp || (20 + e.level * 8), defeated: false })); state.combat = { active: true, round: 1, enemies }; return `Combate! ${enemies.map((e: any) => `${e.name} HP:${e.hp}`).join(', ')}`; }
    case 'damage': { if (!state.combat) return 'Sem combate.'; const e = state.combat.enemies.find(x => x.id === input.enemy_id || x.name.toLowerCase().includes((input.enemy_id || '').toLowerCase())); if (!e) return 'Não encontrado.'; e.hp = Math.max(0, e.hp - (input.amount || 0)); if (e.hp <= 0) e.defeated = true; return `${e.name}: -${input.amount} → ${e.hp}/${e.hpMax}${e.defeated ? ' [DERROTADO]' : ''}`; }
    case 'advance_round': { if (state.combat) state.combat.round++; return `Rodada ${state.combat?.round}`; }
    case 'end': { state.combat = null; return 'Combate encerrado.'; }
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
  c.name = input.name; c.age = input.age || null; c.race = input.race || 'humano_puro'; c.hybridRaces = [input.race || 'humano_puro'];
  c.tier = input.tier || 'novato'; c.background = input.background || ''; c.appearance = input.appearance || ''; c.personality = input.personality || '';
  if (input.attributes) c.attributes = { reiatsu: input.attributes.reiatsu ?? 10, zanjutsu: input.attributes.zanjutsu ?? 10, hakuda: input.attributes.hakuda ?? 10, hoho: input.attributes.hoho ?? 10, kido: input.attributes.kido ?? 10, percepcao: input.attributes.percepcao ?? 10, vontade: input.attributes.vontade ?? 10, presenca: input.attributes.presenca ?? 10 };
  c.level = startingLevelForTier(c.tier); c.xpToNext = xpForLevel(c.level);
  c.hpMax = computeHpMax(c); c.hp = c.hpMax; c.reiryokuMax = computeReiryokuMax(c); c.reiryoku = c.reiryokuMax;
  if (input.power_stage) c.powerStage = input.power_stage;
  // Zanpakuto for shinigami/visored
  if ((input.race === 'shinigami' || input.race === 'visored') && (input.zanpakuto_element || input.zanpakuto_name)) {
    c.zanpakuto = { name: input.zanpakuto_name || null, spiritPersonality: input.zanpakuto_spirit || '', releaseCommand: input.zanpakuto_release || null, element: input.zanpakuto_element || 'desconhecido', shikaiAbility: input.zanpakuto_shikai || null, bankaiName: null, bankaiAbility: null };
  }
  if (input.hollow_mask) c.hollowMask = input.hollow_mask;
  if (input.resurreccion_name) c.resurreccion = { zanpakutoName: input.resurreccion_name, releasePhrase: null, form: null, ability: null };
  if (input.soul_item) c.soulItem = input.soul_item;
  if (input.signature_ability) c.signatureAbility = input.signature_ability;
  return `Personagem: ${c.name}, ${c.race}`;
}
