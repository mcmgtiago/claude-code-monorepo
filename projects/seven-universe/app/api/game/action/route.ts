import Anthropic from '@anthropic-ai/sdk';
import type { GameState, RollResult } from '@/src/engine/state';
import { rollD20, formatRoll, computeHpMax, computeEnergyMax, xpForLevel } from '@/src/engine/rules';
import { applyChanges, handleLearnSkill } from '@/src/engine/apply';
import { appendTurn, compactMemory, needsCompaction, formatRecentTurns } from '@/src/engine/memory';
import { buildGameTools } from '@/src/engine/tools';
import { saveGame, loadGame } from '@/src/engine/persistence';
import { generateNsfw, formatNsfwPrompt, NSFW_SYSTEM_PROMPT } from '@/src/ai/HordeAdapter';
import { getUniverse } from '@/src/universes';
import { addFact, formatDeepMemory, createDeepMemory } from '@/src/engine/memory-deep';
import { shouldTick, applyWorldEvents, buildWorldTickPrompt } from '@/src/engine/world-tick';
import { processBody, formatBody, createBody } from '@/src/engine/body';
import { formatNarrative } from '@/src/engine/narrative';
import { selectCanonNpcs, formatCanonNpcs, populateLocationIfEmpty } from '@/src/engine/npc-select';
import { NextRequest } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN,
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
  defaultHeaders: { 'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN}` },
});

const sessions = new Map<string, GameState>();

function getOrCreateSession(sid: string, universeId: string): GameState {
  if (sessions.has(sid)) return sessions.get(sid)!;
  const loaded = loadGame(sid); if (loaded) { if (!loaded.deepMemory) loaded.deepMemory = createDeepMemory(); sessions.set(sid, loaded); return loaded; }
  const s = createEmptyState(universeId); s.id = sid; sessions.set(sid, s); return s;
}

function createEmptyState(universeId: string): GameState {
  const uni = getUniverse(universeId);
  const attrs: Record<string, number> = {};
  uni?.attributes.forEach(a => { attrs[a.key] = 10; });
  return {
    id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    universeId,
    tone: { mature: true, nsfw: true, fadeToBlack: false },
    character: {
      name: '', age: null, sex: 'masculino', universeId, powerType: '', tier: 'novato',
      background: '', appearance: '', personality: '',
      attributes: attrs, level: 1, xp: 0, xpToNext: 100, unspentPoints: 0,
      hpMax: 26, hp: 26, energyMax: 15, energy: 15, stress: 0, morality: 0,
      powerStage: 'base', power: null, skills: [], techniques: [], inventory: [],
      rank: 'forasteiro', transformations: [], powerHistory: [],
      kills: 0, nearDeaths: 0, alliances: [], enemies: [], fastGrowth: false,
    },
    world: { location: 'Desconhecido', region: '', day: 1, timeOfDay: 'noite', weather: '', flags: {}, reputation: {} },
    combat: null, quests: [], relationships: [], pendingCrossroad: null, chronicle: '', recentTurns: [], turnCount: 0, currentSceneNpcId: null, deepMemory: createDeepMemory(),
  };
}

function getSystemPrompt(state: GameState): string {
  const uni = getUniverse(state.universeId);
  if (!uni) return 'Você é um Mestre de RPG.';
  const attrList = uni.attributes.map(a => a.label).join(', ');
  const isRealWorld = ['reallife', 'fightnight', 'wrestling', 'basquete', 'beisebol'].includes(uni.id);
  return `Você é o **Mestre** de um RPG de texto ${isRealWorld ? '' : 'ISEKAI '}ambientado no universo de **${uni.name}**, em português do Brasil. Aventura imersiva, madura, sandbox.

## ${isRealWorld ? 'PREMISSA — FUNDAMENTAL' : 'ISEKAI — FUNDAMENTAL'}
${uni.isekaiIntro}
${isRealWorld ? 'O jogador VIVE neste mundo real. Pode começar já estabelecido ou subindo na carreira. Status, fama e conquistas são ganhos e perdidos ao longo do jogo.' : 'O jogador NÃO é deste mundo. Começa do ZERO: sem aliados, sem inimigos, sem status, sem posses. Tudo é conquistado no jogo.'}

## Sua função
- Narre em 2ª pessoa, prosa vívida e cinematográfica.
- Interprete NPCs com voz e personalidade próprias.
- SANDBOX: o jogador lidera, você reage. Nunca force caminhos.

## DESCRIÇÃO OBRIGATÓRIA — REGRA VISUAL ABSOLUTA
Quando um NPC NOVO aparece, descreva com RIQUEZA TOTAL (TODOS os itens):
- **Rosto:** formato, cor dos olhos, lábios (cheios/finos), nariz, pele (tom, textura, sardas, marcas)
- **Cabelo:** cor exata, comprimento, estilo (solto, preso, trança, moicano, ondulado, liso)
- **Corpo:** altura, compleição (magra, musculosa, curvilínea, atlética), postura
- **Maquiagem:** se tiver — batom (cor), delineador, sombra, blush, unhas pintadas
- **Roupas:** DETALHADAS — material (couro, seda, jeans, algodão), cor, estilo, estado, marca/referência se relevante
- **Acessórios:** colares, anéis, brincos, óculos, relógio, cintos, bolsas, armas visíveis
- **Calçado:** tipo (salto, bota, tênis, sandália), cor, estado
- **Perfume/Cheiro:** se relevante ao contexto
- **Expressão/Aura:** o que o rosto/corpo está comunicando (desejo, poder, tédio, ameaça)
Para LOCAIS novos: visual completo (cores, iluminação, estado), sons, cheiros, temperatura, atmosfera.
Quando o jogador PERGUNTAR sobre aparência de alguém ou de um local, dê ABSOLUTAMENTE TODOS os detalhes acima.

## Regras — use as ferramentas (você NÃO inventa números)
- **roll_check**: ação incerta. Atributos: ${attrList}. CALIBRE DC pelo nível (forte = DC baixa pra ações comuns).
- **apply_changes**: registre TUDO. SEMPRE registre NPCs novos em relationships.
- **manage_combat**: batalhas com inimigos rastreados.
- **manage_quest**: objetivos.
- **offer_crossroad**: dilemas. Após oferecer, ENCERRE.
- **create_character**: quando tiver dados.
- **learn_skill**: ensina habilidade após treino/batalha/marco.
Conceda XP por feitos (20-60 normal, 100+ marcos).

## MUNDO
${uni.systemPromptLore}
${formatCanonNpcs(selectCanonNpcs(uni.npcs, state))}

## NPCs TÊM VONTADE PRÓPRIA — DIFICULDADE REAL
NPCs NÃO são fáceis. Eles têm orgulho, medo, agenda e resistência.
- NUNCA faça um NPC ceder (confiar, se apaixonar, ir pra cama, obedecer, revelar segredo) só porque o jogador pediu ou tentou uma vez.
- Sedução, persuasão, intimidação e amizade EXIGEM esforço, contexto, tempo e às vezes roll_check. Um NPC poderoso/orgulhoso resiste mais.
- NPCs reagem à reputação, status e histórico do jogador. Um forasteiro sem nome não impressiona um duque/capitão/rei.
- NPCs podem recusar, zombar, se ofender, trair, blefar, jogar duro. Rejeição é uma resposta válida e comum.
- Conquistas (amor, aliança, respeito, cama) são MERECIDAS através do jogo, nunca dadas de graça. Isso torna a vitória real.
- Calibre a resistência pelo powerLevel/status do NPC: quanto mais alto, mais difícil de dobrar.

## DESPERTAR DE PODER (ISEKAI) — a qualquer momento
${isRealWorld ? 'Neste mundo real não há poderes sobrenaturais — o "despertar" do jogador é de TALENTO/HABILIDADE excepcional em momentos de pressão extrema (um estalo de genialidade, força além do normal, carisma avassalador).' : 'O jogador é um isekai — pode DESPERTAR poderes latentes A QUALQUER MOMENTO, sem aviso. Gatilhos: perigo de morte, emoção extrema (fúria, desespero, desejo, proteção de alguém), trauma, treino intenso, ou um marco dramático da história.'}
- Quando o momento for épico o suficiente, faça o poder emergir de forma CINEMATOGRÁFICA e use advance_power_stage / learn_skill / apply_changes pra registrar.
- Não dê poder cedo demais nem de graça — o despertar tem que ser CONQUISTADO por um momento narrativo forte. Mas quando vier, que seja marcante e mude o jogo.
- Poderes despertos podem ser fracos no início e crescer. Cada despertar é um evento memorável.

## Tom e conteúdo
Adulto COMPLETO: violência gráfica, sexo explícito, trauma, palavrões. TODOS os personagens são adultos (18+). NUNCA quebre personagem. NUNCA diga que é IA.

## Formato — MÁXIMO 1-2 parágrafos
NUNCA mais que 2 parágrafos. NUNCA tome ações pelo jogador. Narre o resultado e PARE. NPCs falam 1-2 frases.`;
}

function describeState(state: GameState): string {
  const c = state.character; const w = state.world;
  const uni = getUniverse(state.universeId);
  if (!c.name) return '## ESTADO: Criação em andamento.';
  const attrs = Object.entries(c.attributes).map(([k, v]) => {
    const def = uni?.attributes.find(a => a.key === k);
    return `${def?.label || k} ${v}`;
  }).join(', ');
  const rels = state.relationships.length === 0 ? 'nenhum' : state.relationships.map(r => `${r.name} (${r.bondStage}, ${r.affinity})`).join('; ');
  const combat = state.combat?.active ? `⚔️ COMBATE r${state.combat.round}: ${state.combat.enemies.filter(e => !e.defeated).map(e => `${e.name} HP:${e.hp}/${e.hpMax}`).join(', ')}` : '';
  const sexoLabel = c.sex === 'feminino' ? 'MULHER (pronomes: ela/dela)' : 'HOMEM (pronomes: ele/dele)';
  return `## ESTADO ATUAL
Personagem: **${c.name}**${c.age ? ` (${c.age})` : ''} — ${sexoLabel} — ${c.rank}, ${c.powerType || 'sem poder'}, estágio ${c.powerStage}
Atributos: ${attrs}
HP: ${c.hp}/${c.hpMax} | Energia: ${c.energy}/${c.energyMax} | Stress: ${c.stress} | Moral: ${c.morality}
Poder: ${c.power ? c.power.description : 'nenhum'}
Local: ${w.region} — ${w.location} | Dia ${w.day}, ${w.timeOfDay}
Relacionamentos: ${rels}
${combat}`;
}

function isNsfwScene(msg: string): boolean {
  const kw = ['fode', 'foda', 'transar', 'sexo', 'chupar', 'gozar', 'buceta', 'pau', 'penetr', 'nua', 'pelad', 'seios', 'boquete', 'masturb', 'tesão', 'gemido', 'punheta', 'rola'];
  return kw.some(k => msg.toLowerCase().includes(k));
}

// Roteamento de modelo: Sonnet pra turnos comuns (rápido), Opus pra épicos
function pickModel(state: GameState, message: string): { model: string; maxTokens: number } {
  const isEpic =
    state.combat?.active ||
    message.toLowerCase().includes('evolui') || message.toLowerCase().includes('transforma') ||
    message.toLowerCase().includes('mato') || message.toLowerCase().includes('morro') ||
    state.character.hp < state.character.hpMax * 0.3 ||
    state.turnCount <= 2; // primeiros turnos (criação)
  return isEpic
    ? { model: 'claude-opus-4-8-20250612', maxTokens: 600 }
    : { model: 'claude-sonnet-4-6-20250514', maxTokens: 500 };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, universeId } = body;
    if (!message) return new Response(JSON.stringify({ error: 'Mensagem obrigatória' }), { status: 400 });
    const sid = sessionId || crypto.randomUUID();
    const state = getOrCreateSession(sid, universeId || 'xmen');
    const uni = getUniverse(state.universeId)!;
    appendTurn(state, 'player', message);

    const ctx = [describeState(state)];
    // Gera NPCs procedurais se local está vazio de personagens
    populateLocationIfEmpty(uni, state, state.deepMemory);
    // Deep memory: fatos + NPCs relevantes
    const currentNpcs = state.relationships.map(r => r.name);
    const deepMem = formatDeepMemory(state.deepMemory, currentNpcs, state.world.location);
    if (deepMem.trim()) ctx.push(deepMem);
    const bodyStr = formatBody(state); if (bodyStr.trim()) ctx.push(bodyStr);
    if (state.character.name) ctx.push(formatNarrative(state));
    if (state.chronicle.trim()) ctx.push(`## CRÔNICA\n${state.chronicle}`);
    if (state.recentTurns.length > 1) ctx.push(`## CENAS RECENTES\n${formatRecentTurns(state.recentTurns.slice(0, -1))}`);
    ctx.push(`## AÇÃO DO JOGADOR\n${message}`);
    const userContent = ctx.join('\n\n');

    if (isNsfwScene(message) && state.character.name) return handleNsfwPipeline(state, sid, userContent, message);

    const tools = buildGameTools(uni);
    const msgs: any[] = [{ role: 'user', content: userContent }];
    let narration = ''; const rolls: RollResult[] = []; const changeLog: string[] = []; let crossroad: any = null;

    for (let i = 0; i < 8; i++) {
      const { model, maxTokens } = pickModel(state, message);
      const response = await client.messages.create({ model, max_tokens: maxTokens, system: getSystemPrompt(state), messages: msgs, tools: tools as any, temperature: 0.85 });
      const toolUses: any[] = [];
      for (const block of response.content) { if (block.type === 'text') narration += block.text; else if (block.type === 'tool_use') toolUses.push(block); }
      if (toolUses.length === 0 || response.stop_reason === 'end_turn') break;
      const toolResults: any[] = [];
      for (const tool of toolUses) {
        let result = '';
        switch (tool.name) {
          case 'roll_check': { const def = uni.attributes.find(a => a.key === tool.input.attribute); const roll = rollD20(tool.input.attribute, def?.label || tool.input.attribute, state.character, tool.input.dc, { advantage: tool.input.advantage === 'vantagem', disadvantage: tool.input.advantage === 'desvantagem' }); roll.reason = tool.input.reason; rolls.push(roll); result = formatRoll(roll); break; }
          case 'apply_changes': { const l = applyChanges(state, tool.input); changeLog.push(...l); result = l.join('; ') || 'OK'; break; }
          case 'manage_combat': { result = handleCombat(state, tool.input); break; }
          case 'manage_quest': { result = handleQuest(state, tool.input); break; }
          case 'offer_crossroad': { crossroad = { prompt: tool.input.prompt, options: tool.input.options }; state.pendingCrossroad = crossroad; result = 'OK'; break; }
          case 'create_character': { result = handleCreateCharacter(state, tool.input); changeLog.push('🎭 Personagem criado!'); break; }
          case 'learn_skill': { result = handleLearnSkill(state, tool.input, uni.skills); changeLog.push(`📚 ${result}`); break; }
          case 'record_kill': { state.character.kills++; if (tool.input.morality_impact) state.character.morality = Math.max(-100, Math.min(100, state.character.morality + tool.input.morality_impact)); result = `Morte: ${tool.input.victim}`; changeLog.push(`💀 ${tool.input.victim}`); break; }
          default: result = 'Tool desconhecida';
        }
        toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: result });
      }
      msgs.push({ role: 'assistant', content: response.content });
      msgs.push({ role: 'user', content: toolResults });
    }

    if (narration.trim()) appendTurn(state, 'mestre', narration.trim());

    // EXTRAÇÃO DE FATOS (deep memory) — call barato pós-turno
    if (narration.trim() && narration.length > 80) {
      try {
        const factResp = await client.messages.create({
          model: 'claude-sonnet-4-6-20250514', max_tokens: 400, temperature: 0.3,
          system: 'Extraia FATOS importantes da cena de RPG que devem ser lembrados. Responda APENAS JSON array. Categorias: npc, event, secret, promise, threat, relationship. Só o que é NOVO e IMPORTANTE (promessas, ameaças, segredos revelados, decisões, mortes, NPCs importantes). Máximo 3 fatos.',
          messages: [{ role: 'user', content: `Ação: ${message}\n\nCena: ${narration}\n\nJSON: [{"category":"...","subject":"...","content":"fato conciso","importance":1-10}]` }],
        });
        const ft = factResp.content[0].type === 'text' ? factResp.content[0].text : '';
        const m = ft.match(/\[[\s\S]*\]/);
        if (m) { const facts = JSON.parse(m[0]); for (const f of facts) addFact(state.deepMemory, { category: f.category || 'event', subject: f.subject || '', content: f.content, turn: state.turnCount, importance: f.importance || 5, relatedNpcs: state.relationships.map(r => r.name) }); }
      } catch {}
    }

    // WORLD TICK — mundo se move a cada 5 turnos
    if (shouldTick(state)) {
      try {
        const tickResp = await client.messages.create({
          model: 'claude-sonnet-4-6-20250514', max_tokens: 400, temperature: 0.9,
          system: 'Você simula o mundo de um RPG se movendo em segundo plano. Responda APENAS JSON array.',
          messages: [{ role: 'user', content: buildWorldTickPrompt(state, state.deepMemory) }],
        });
        const tt = tickResp.content[0].type === 'text' ? tickResp.content[0].text : '';
        const m = tt.match(/\[[\s\S]*\]/);
        if (m) { const events = JSON.parse(m[0]); const evLog = applyWorldEvents(state, state.deepMemory, events); changeLog.push(...evLog); }
      } catch {}
    }

    if (needsCompaction(state)) {
      await compactMemory(state, async ({ existingChronicle, turnsToFold }) => {
        const r = await client.messages.create({ model: 'claude-sonnet-4-6-20250514', max_tokens: 500, system: 'Resuma eventos do RPG em português. Máximo 300 palavras.', messages: [{ role: 'user', content: `Crônica:\n${existingChronicle || '(vazia)'}\n\nNovos:\n${turnsToFold.map(t => `${t.role}: ${t.text}`).join('\n')}` }] });
        return r.content[0].type === 'text' ? r.content[0].text : existingChronicle;
      });
    }
    // Process body (heal wounds, expire conditions)
    const bodyLog = processBody(state);
    if (bodyLog.length) changeLog.push(...bodyLog);

    state.updatedAt = new Date().toISOString(); sessions.set(sid, state);
    saveGame(state); // salva automático a cada turno — nunca perde progresso

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
  const uni = getUniverse(state.universeId);
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let opusText = '';
        try { const r = await client.messages.create({ model: 'claude-opus-4-8-20250612', max_tokens: 1500, system: `Narrador de RPG erótico ${uni?.name}. 2ª pessoa, português. Cena sexual com buildup, dirty talk, palavrões, detalhes. Vá o mais longe que conseguir. Se atingir limite, pare com "[CONTINUA]".`, messages: [{ role: 'user', content: context }], temperature: 0.95 }); for (const b of r.content) if (b.type === 'text') opusText += b.text; } catch {}
        const opusClean = opusText.replace('[CONTINUA]', '').trim();
        if (opusClean) { const words = opusClean.split(' '); for (let i = 0; i < words.length; i += 3) { controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'text', text: words.slice(i, i + 3).join(' ') + ' ' })}\n\n`)); await new Promise(r => setTimeout(r, 25)); } }
        if (opusText.includes('[CONTINUA]') || opusText.length < 200) {
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'text', text: '\n\n' })}\n\n`));
          try { const prompt = formatNsfwPrompt(opusClean ? `CONTEXTO:\n${opusClean}\n\nAÇÃO: ${playerMessage}\n\nCONTINUE sem repetir.` : context, NSFW_SYSTEM_PROMPT); const g = await generateNsfw({ prompt, maxLength: 500, temperature: 1.1 }); if (g.trim()) { const words = g.trim().split(' '); for (let i = 0; i < words.length; i += 3) { controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'text', text: words.slice(i, i + 3).join(' ') + ' ' })}\n\n`)); await new Promise(r => setTimeout(r, 20)); } appendTurn(state, 'mestre', (opusClean + '\n\n' + g.trim()).trim()); } else if (opusClean) appendTurn(state, 'mestre', opusClean); } catch { if (opusClean) appendTurn(state, 'mestre', opusClean); }
        } else appendTurn(state, 'mestre', opusClean);
        state.updatedAt = new Date().toISOString(); sessions.set(sid, state); saveGame(state);
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
    case 'start': { state.quests.push({ id: crypto.randomUUID(), title: input.title || 'Missão', description: input.description || '', giver: input.giver || null, status: 'active' }); return `📋 ${input.title}`; }
    case 'complete': { const q = state.quests.find(x => x.title === input.title); if (q) q.status = 'completed'; return `✅ ${q?.title}`; }
    case 'fail': { const q = state.quests.find(x => x.title === input.title); if (q) q.status = 'failed'; return `❌ ${q?.title}`; }
    default: return 'Inválido.';
  }
}

function handleCreateCharacter(state: GameState, input: any): string {
  const c = state.character;
  const uni = getUniverse(state.universeId);
  c.name = input.name; c.age = input.age || null;
  if (input.sex === 'masculino' || input.sex === 'feminino') c.sex = input.sex;
  c.background = input.background || 'Transportado de outro mundo.';
  c.appearance = input.appearance || ''; c.personality = input.personality || '';
  c.powerType = input.power_type || ''; c.tier = input.tier || 'novato';
  c.rank = input.rank || 'forasteiro';
  if (input.attributes) { for (const [k, v] of Object.entries(input.attributes)) { if (k in c.attributes) c.attributes[k] = v as number; } }
  const tierDef = uni?.tiers.find(t => t.key === c.tier);
  c.level = tierDef?.startLevel || 1; c.xpToNext = xpForLevel(c.level);
  c.hpMax = computeHpMax(c); c.hp = c.hpMax; c.energyMax = computeEnergyMax(c); c.energy = c.energyMax;
  if (input.power_type && input.power_description) c.power = { type: input.power_type, description: input.power_description, element: '', primaryAbility: null, evolvedAbility: null, weakness: '' };
  return `Personagem: ${c.name}`;
}
