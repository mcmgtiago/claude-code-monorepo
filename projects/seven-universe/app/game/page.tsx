'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getUniverse } from '@/src/universes';
import CharacterSheet from './components/CharacterSheet';

function GameInner() {
  const params = useSearchParams();
  const router = useRouter();
  const loadId = params.get('load');
  const [loadedUniverseId, setLoadedUniverseId] = useState<string | null>(null);
  const universeId = loadedUniverseId || params.get('u') || 'xmen';
  const uni = getUniverse(universeId);

  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [gameState, setGameState] = useState<any>(null);
  const [sessionId, setSessionId] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [screen, setScreen] = useState<'config' | 'game'>('config');
  const [crossroad, setCrossroad] = useState<any>(null);
  const [portrait, setPortrait] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<'adventure' | 'adult'>('adventure');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [cName, setCName] = useState('');
  const [cAge, setCAge] = useState('');
  const [cPersonality, setCPersonality] = useState('');
  const [cAppearance, setCAppearance] = useState('');
  const [cBackground, setCBackground] = useState('');
  const [cPowerType, setCPowerType] = useState(uni?.powerTypes[0]?.key || '');
  const [cPowerDesc, setCPowerDesc] = useState('');
  const [cTier, setCTier] = useState(uni?.tiers[0]?.key || 'novato');
  const [cFastGrowth, setCFastGrowth] = useState(false);
  const [cAttrs, setCAttrs] = useState<Record<string, number>>(() => {
    const a: Record<string, number> = {}; uni?.attributes.forEach(at => { a[at.key] = 10; }); return a;
  });
  const [scenario, setScenario] = useState<any>(null);
  const [scenarioOpts, setScenarioOpts] = useState<any[]>([]);
  const [powerOpts, setPowerOpts] = useState<string[]>([]);
  const [genLoading, setGenLoading] = useState(false);
  const [genFieldLoading, setGenFieldLoading] = useState<string>('');
  const [cSex, setCSex] = useState<'masculino' | 'feminino'>('masculino');
  const [customStart, setCustomStart] = useState('');
  const [cKinks, setCKinks] = useState<string[]>([]);
  const [cKinkCustom, setCKinkCustom] = useState('');

  // Gerador aleatório por campo
  const genField = async (field: string, setter: (v: string) => void, extraContext?: string) => {
    setGenFieldLoading(field);
    // Monta contexto com TODOS os campos já preenchidos, pra manter coerência entre eles.
    const parts: string[] = [];
    if (cName) parts.push(`Nome: ${cName}`);
    if (cAge) parts.push(`Idade: ${cAge}`);
    if (field !== 'personality' && cPersonality) parts.push(`Personalidade: ${cPersonality}`);
    if (field !== 'appearance' && cAppearance) parts.push(`Aparência: ${cAppearance}`);
    if (field !== 'background' && cBackground) parts.push(`Background: ${cBackground}`);
    if (cPowerDesc) parts.push(`Poder/estilo: ${cPowerDesc}`);
    const context = [extraContext, parts.length ? `PERSONAGEM JÁ DEFINIDO (mantenha TOTAL coerência com estes dados) — ${parts.join(' | ')}` : ''].filter(Boolean).join('. ');
    try {
      const r = await fetch('/api/game/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'field', field, sex: cSex, universeId, context }) });
      const d = await r.json();
      if (d.value) setter(d.value);
    } catch {} finally { setGenFieldLoading(''); }
  };

  const FLOOR = 8, CAP = 18;
  const budget = uni?.tiers.find(t => t.key === cTier)?.budget || 22;
  const spent = Object.values(cAttrs).reduce((s, v) => s + (v - FLOOR), 0);
  const remaining = budget - spent;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    if (cTier === uni?.tiers[uni.tiers.length - 1]?.key) { const a: Record<string, number> = {}; uni?.attributes.forEach(at => { a[at.key] = 18; }); setCAttrs(a); }
    else { const a: Record<string, number> = {}; uni?.attributes.forEach(at => { a[at.key] = 10; }); setCAttrs(a); }
  }, [cTier]);

  // Carregar save existente (?load=id)
  useEffect(() => {
    if (!loadId) return;
    (async () => {
      try {
        const r = await fetch('/api/game/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'load', saveId: loadId }) });
        if (!r.ok) { alert('Save não encontrado.'); router.push('/'); return; }
        const st = await r.json();
        setLoadedUniverseId(st.universeId || null);
        setSessionId(st.id);
        setGameState(st);
        // Reconstrói as mensagens a partir das cenas recentes salvas
        const turns = (st.recentTurns || []).map((t: any) => ({ role: t.role === 'player' ? 'player' : 'narrator', content: t.text }));
        setMessages(turns.length ? turns : [{ role: 'narrator', content: `Jogo carregado. Você continua como ${st.character?.name || 'seu personagem'} em ${st.world?.location || 'sua jornada'}.` }]);
        setScreen('game');
      } catch { alert('Erro ao carregar o save.'); router.push('/'); }
    })();
  }, [loadId]);

  if (!uni) return <div className="p-8 text-center">Universo não encontrado. <button onClick={() => router.push('/')} className="underline">Voltar</button></div>;

  const adjust = (k: string, d: number) => setCAttrs(p => { const nv = p[k] + d; if (nv < FLOOR || nv > CAP || spent + d > budget) return p; return { ...p, [k]: nv }; });

  const playSound = () => { try { const c = new (window.AudioContext || (window as any).webkitAudioContext)(); const o = c.createOscillator(); const g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.setValueAtTime(800, c.currentTime); o.frequency.setValueAtTime(600, c.currentTime + 0.1); g.gain.setValueAtTime(0.06, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2); o.start(); o.stop(c.currentTime + 0.2); } catch {} };

  const genPowers = async () => {
    if (!cPowerDesc.trim()) return;
    setGenLoading(true); setPowerOpts([]);
    try {
      const r = await fetch('/api/game/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'powers', style: cPowerDesc, universeId }) });
      const d = await r.json();
      if (Array.isArray(d)) setPowerOpts(d.map((p: any) => `${p.name}: ${p.description}`));
    } catch {} finally { setGenLoading(false); }
  };

  const getScenarios = () => {
    const pool = uni.scenarios.filter(s => s.mode === gameMode || s.mode === 'any');
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
  };

  const startGame = () => {
    const sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    setSessionId(sid); setMessages([]); setGameState(null); setCrossroad(null); setScreen('game');

    const attrsObj = JSON.stringify(cAttrs);
    const powerTypeDef = uni.powerTypes.find(p => p.key === cPowerType);
    const generoNota = `O personagem é ${cSex === 'feminino' ? 'MULHER' : 'HOMEM'}. ADAPTE o cenário e os NPCs pra fazer sentido com esse gênero — se o cenário sugere um par romântico/sedutor, ajuste o gênero e a dinâmica dele conforme o contexto e a preferência natural da cena (não force par heterossexual nem homossexual; use o que for coerente e interessante).`;
    const scenarioInstr = customStart.trim()
      ? `CENÁRIO CUSTOMIZADO (escrito pelo jogador — SIGA fielmente): "${customStart.trim()}". ${generoNota}`
      : scenario
        ? `CENÁRIO: "${scenario.title}" — ${scenario.setup}. ${generoNota}`
        : `Cenário ALEATÓRIO. ${generoNota}`;
    const kinksList = [...cKinks, cKinkCustom.trim()].filter(Boolean).join(', ');
    const kinksInstr = kinksList ? ` FETICHES/FANTASIAS do jogador (incorpore naturalmente nas cenas +18, sem forçar): ${kinksList}.` : '';
    const modeInstr = gameMode === 'adult'
      ? `MODO +18. ${scenarioInstr} Tensão sexual, NPCs sedutores, dirty talk. TODOS os personagens são adultos (18+).${kinksInstr} PARE antes do explícito, deixe o jogador decidir.`
      : `MODO AVENTURA. ${scenarioInstr} Foco história/lore/combate. Conteúdo +18 permitido se o jogador iniciar.`;
    const growthInstr = cFastGrowth ? 'ASCENSÃO RÁPIDA: conceda XP generoso (2-3x), ensine skills frequentemente.' : '';

    const isRealWorld = ['reallife', 'fightnight', 'wrestling', 'basquete', 'beisebol'].includes(universeId);
    const instruction = `INICIAR NOVO JOGO — ${uni.name}.
${modeInstr} ${growthInstr}
Personagem: "${cName}"${cAge ? `, ${cAge} anos` : ''}, **SEXO: ${cSex === 'feminino' ? 'FEMININO (mulher, use pronomes femininos: ela, sua, dela)' : 'MASCULINO (homem, use pronomes masculinos: ele, seu, dele)'}**, tier ${cTier}, tipo: ${powerTypeDef?.label}${cPowerType.includes('humano') || cPowerType.includes('mundano') || cPowerType.includes('natural') ? ' (sem poderes iniciais)' : `, poder: ${cPowerDesc || cPowerType}`}. Personalidade: ${cPersonality}. Aparência: ${cAppearance}.
Chame create_character com: name="${cName}", age=${cAge || 20}, sex="${cSex}", power_type="${cPowerType}", power_description="${cPowerDesc}", tier="${cTier}", personality="${cPersonality}", appearance="${cAppearance}", background="${cBackground || (isRealWorld ? 'Personagem nativo deste mundo' : 'Transportado do nosso mundo')}", attributes=${attrsObj}.
DEPOIS narre conforme o cenário/modo. ${isRealWorld ? 'Personagem VIVE neste mundo real.' : 'Personagem é FORASTEIRO de outro mundo, começa do ZERO.'} Respeite SEMPRE o sexo do personagem nos pronomes e na narração. MÁXIMO 2 parágrafos. NÃO tome ações pelo jogador.`;

    // set fastGrowth flag via state after creation (handled by not modifying — pass in first msg)
    sendMessage(instruction, sid, cFastGrowth);
  };

  const sendMessage = async (text: string, sid?: string, fastGrowth?: boolean) => {
    if (!text.trim() || isLoading) return;
    const currentSid = sid || sessionId;
    if (!sid) setMessages(m => [...m, { role: 'player', content: text }]);
    setIsLoading(true); setCrossroad(null);
    try {
      const r = await fetch('/api/game/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, sessionId: currentSid, universeId }) });
      if (!r.ok) throw new Error(await r.text());
      const reader = r.body?.getReader(); if (!reader) throw new Error('Sem resposta');
      const dec = new TextDecoder(); let nar = ''; let added = false;
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        for (const line of dec.decode(value).split('\n').filter(l => l.startsWith('data: '))) {
          try {
            const d = JSON.parse(line.slice(6));
            if (d.type === 'text') { nar += d.text; if (!added) { setMessages(m => [...m, { role: 'narrator', content: nar }]); added = true; } else setMessages(m => { const u = [...m]; u[u.length - 1] = { role: 'narrator', content: nar }; return u; }); }
            else if (d.type === 'rolls') for (const roll of d.rolls) setMessages(m => [...m, { role: 'system', content: `${roll.critical === 'hit' ? '🎯' : roll.critical === 'fail' ? '💀' : roll.success ? '✅' : '❌'} ${roll.reason} [${roll.attributeLabel}] ${roll.d20}+${roll.modifier}=${roll.total} vs DC${roll.dc}` }]);
            else if (d.type === 'changes' && d.changeLog?.length) setMessages(m => [...m, { role: 'system', content: d.changeLog.join(' • ') }]);
            else if (d.type === 'crossroad') setCrossroad(d.crossroad);
            else if (d.type === 'state') { if (fastGrowth && d.state?.character) d.state.character.fastGrowth = true; setGameState(d.state); }
            else if (d.type === 'done') setSessionId(d.sessionId);
          } catch {}
        }
      }
    } catch (err) { setMessages(m => [...m, { role: 'narrator', content: `⚠️ ${err instanceof Error ? err.message : 'Erro'}` }]); }
    finally { setIsLoading(false); playSound(); }
  };

  const handleSend = () => { if (!input.trim() || isLoading) return; sendMessage(input); setInput(''); };
  const character = gameState?.character?.name ? gameState.character : null;
  const accent = uni.theme.accentHex;

  // === CONFIG WIZARD ===
  if (screen === 'config') {
    const isPowerless = cPowerType.includes('humano') || cPowerType.includes('mundano') || cPowerType.includes('natural') || cPowerType.includes('ronin') && false;
    return (
      <div className="min-h-[100dvh] bg-black p-4 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <button onClick={() => step > 1 ? setStep(step - 1) : router.push('/')} className="mb-4 text-xs text-gray-600 hover:text-white">← {step > 1 ? 'Voltar' : 'Universos'}</button>
          <div className="flex items-center gap-2 mb-1"><span className="text-2xl">{uni.emoji}</span><h1 className="text-xl font-bold text-white">{uni.name}</h1></div>
          <div className="flex gap-1 mb-6 mt-3">{[1,2,3,4,5].map(s => <div key={s} className="flex-1 h-0.5 rounded-full" style={{ background: s <= step ? accent : '#1f2937' }} />)}</div>

          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Seu nome?</h2>
              <p className="text-xs text-gray-600 mb-4">Sexo, modo de jogo e nome</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button onClick={() => setCSex('masculino')} className={`py-2.5 border rounded-lg text-sm ${cSex === 'masculino' ? 'text-white bg-white/5' : 'border-gray-800 text-gray-500'}`} style={{ borderColor: cSex === 'masculino' ? accent : undefined }}>♂ Masculino</button>
                <button onClick={() => setCSex('feminino')} className={`py-2.5 border rounded-lg text-sm ${cSex === 'feminino' ? 'text-white bg-white/5' : 'border-gray-800 text-gray-500'}`} style={{ borderColor: cSex === 'feminino' ? accent : undefined }}>♀ Feminino</button>
              </div>
              <div className="flex gap-2 mb-3">
                <input value={cName} onChange={e => setCName(e.target.value)} placeholder="Nome do personagem" className="flex-1 px-4 py-3 bg-black border border-gray-800 rounded-lg text-white text-lg focus:outline-none" style={{ borderColor: cName ? accent : undefined }} autoFocus />
                <button onClick={() => genField('name', setCName)} disabled={genFieldLoading === 'name'} className="px-3 border border-gray-800 rounded-lg text-lg active:scale-95 disabled:opacity-50">{genFieldLoading === 'name' ? '⏳' : '🎲'}</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={() => setGameMode('adventure')} className={`py-3 border rounded-lg text-sm ${gameMode === 'adventure' ? 'text-white bg-white/5' : 'border-gray-800 text-gray-500'}`} style={{ borderColor: gameMode === 'adventure' ? accent : undefined }}>⚔️ Aventura</button>
                <button onClick={() => setGameMode('adult')} className={`py-3 border rounded-lg text-sm ${gameMode === 'adult' ? 'text-white bg-white/5' : 'border-gray-800 text-gray-500'}`} style={{ borderColor: gameMode === 'adult' ? '#dc2626' : undefined }}>🔞 +18</button>
              </div>
              {gameMode === 'adult' && (
                <div className="border border-gray-900 rounded-lg p-3 mb-4">
                  <label className="text-[10px] text-gray-500 uppercase block mb-2">🔥 Fetiches & Fantasias (opcional — a IA incorpora nas cenas)</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {['Dominação', 'Submissão', 'Voyeurismo', 'Exibicionismo', 'Sexo em público', 'Proibido/tabu', 'Romance lento', 'Ménage', 'Poder/status', 'Primeira vez', 'Rivais', 'Sedução'].map(k => (
                      <button key={k} onClick={() => setCKinks(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k])} className={`px-2.5 py-1 rounded-full text-[11px] border ${cKinks.includes(k) ? 'text-white' : 'border-gray-800 text-gray-500'}`} style={{ borderColor: cKinks.includes(k) ? '#dc2626' : undefined, background: cKinks.includes(k) ? 'rgba(220,38,38,0.15)' : undefined }}>{k}</button>
                    ))}
                  </div>
                  <textarea value={cKinkCustom} onChange={e => setCKinkCustom(e.target.value)} placeholder="Escreva outros desejos, fantasias ou preferências específicas..." className="w-full px-3 py-2 bg-black border border-gray-800 rounded-lg text-white text-xs h-16 resize-none focus:outline-none focus:border-gray-600" />
                </div>
              )}
              <button onClick={() => setStep(2)} disabled={!cName.trim()} className="w-full py-3 text-black font-semibold rounded-lg disabled:bg-gray-900 disabled:text-gray-600" style={{ background: cName.trim() ? '#fff' : undefined }}>Próximo →</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Quem é {cName}?</h2>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-gray-600 uppercase">Idade</label>
                <button onClick={() => genField('age', setCAge)} disabled={genFieldLoading === 'age'} className="text-[10px] text-gray-500 hover:text-white">{genFieldLoading === 'age' ? '⏳' : '🎲 aleatório'}</button>
              </div>
              <input value={cAge} onChange={e => setCAge(e.target.value)} placeholder="Ex: 25" className="w-full px-3 py-2 bg-black border border-gray-800 rounded-lg text-white text-sm mb-3 focus:outline-none focus:border-white" />
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-gray-600 uppercase">Personalidade</label>
                <button onClick={() => genField('personality', setCPersonality)} disabled={genFieldLoading === 'personality'} className="text-[10px] text-gray-500 hover:text-white">{genFieldLoading === 'personality' ? '⏳ gerando...' : '🎲 aleatório'}</button>
              </div>
              <textarea value={cPersonality} onChange={e => setCPersonality(e.target.value)} placeholder="Temperamento, jeito de ser..." className="w-full px-3 py-2 bg-black border border-gray-800 rounded-lg text-white text-sm h-24 resize-none mb-3 focus:outline-none focus:border-white" />
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-gray-600 uppercase">Background (vida anterior)</label>
                <button onClick={() => genField('background', setCBackground)} disabled={genFieldLoading === 'background'} className="text-[10px] text-gray-500 hover:text-white">{genFieldLoading === 'background' ? '⏳ gerando...' : '🎲 aleatório'}</button>
              </div>
              <textarea value={cBackground} onChange={e => setCBackground(e.target.value)} placeholder="Quem era antes de ser transportado..." className="w-full px-3 py-2 bg-black border border-gray-800 rounded-lg text-white text-sm h-24 resize-none mb-3 focus:outline-none focus:border-white" />
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-gray-600 uppercase">Aparência física</label>
                <button onClick={() => genField('appearance', setCAppearance)} disabled={genFieldLoading === 'appearance'} className="text-[10px] text-gray-500 hover:text-white">{genFieldLoading === 'appearance' ? '⏳ gerando...' : '🎲 aleatório'}</button>
              </div>
              <textarea value={cAppearance} onChange={e => setCAppearance(e.target.value)} placeholder="Rosto, cabelo, corpo, roupas, marcas..." className="w-full px-3 py-2 bg-black border border-gray-800 rounded-lg text-white text-sm h-24 resize-none mb-4 focus:outline-none focus:border-white" />
              <button onClick={() => setStep(3)} className="w-full py-3 bg-white text-black font-semibold rounded-lg">Próximo →</button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">{uni.powerLabel}</h2>
              <p className="text-xs text-gray-600 mb-4">Escolha seu tipo</p>
              <div className="space-y-2 mb-4">
                {uni.powerTypes.map(pt => (
                  <button key={pt.key} onClick={() => setCPowerType(pt.key)} className={`w-full text-left p-3 border rounded-lg ${cPowerType === pt.key ? 'text-white bg-white/5' : 'border-gray-800 text-gray-400'}`} style={{ borderColor: cPowerType === pt.key ? accent : undefined }}>
                    <p className="font-semibold text-sm">{pt.label}</p>
                    <p className="text-[11px] text-gray-500">{pt.desc}</p>
                  </button>
                ))}
              </div>
              {uni.hasPowerGenerator && !isPowerless && (
                <div className="border-t border-gray-900 pt-3 mb-4">
                  <label className="text-[10px] text-gray-600 uppercase block mb-1">Descreva seu poder ideal (IA gera opções)</label>
                  <textarea value={cPowerDesc} onChange={e => setCPowerDesc(e.target.value)} placeholder="Ex: controlar sombras, ser furtivo..." className="w-full px-3 py-2 bg-black border border-gray-800 rounded-lg text-white text-sm h-16 resize-none mb-2 focus:outline-none focus:border-white" />
                  <button onClick={genPowers} disabled={genLoading || !cPowerDesc.trim()} className="w-full py-2 border border-gray-800 rounded text-xs text-gray-400 hover:text-white disabled:opacity-50">{genLoading ? '⏳ Gerando...' : '🎲 Gerar 4 opções'}</button>
                  {powerOpts.length > 0 && <div className="space-y-1 mt-2">{powerOpts.map((o, i) => <button key={i} onClick={() => setCPowerDesc(o)} className={`w-full text-left p-2 border rounded text-[11px] ${cPowerDesc === o ? 'text-white bg-white/5' : 'border-gray-800 text-gray-400'}`} style={{ borderColor: cPowerDesc === o ? accent : undefined }}>{o}</button>)}</div>}
                </div>
              )}
              <button onClick={() => setStep(4)} className="w-full py-3 bg-white text-black font-semibold rounded-lg">Próximo →</button>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Poder & Atributos</h2>
              <div className="grid grid-cols-2 gap-2 my-3">
                {uni.tiers.map(t => (
                  <button key={t.key} onClick={() => setCTier(t.key)} className={`p-2 border rounded-lg text-left ${cTier === t.key ? 'text-white bg-white/5' : 'border-gray-800 text-gray-500'}`} style={{ borderColor: cTier === t.key ? accent : undefined }}>
                    <p className="text-xs font-semibold">{t.label}</p><p className="text-[10px] text-gray-600">{t.budget}pts • {t.desc}</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setCFastGrowth(!cFastGrowth)} className={`w-full py-2 border rounded-lg text-xs mb-3 ${cFastGrowth ? 'text-white bg-white/5' : 'border-gray-800 text-gray-500'}`} style={{ borderColor: cFastGrowth ? accent : undefined }}>
                {cFastGrowth ? '⚡ Ascensão Rápida LIGADA (XP 3x)' : '🐢 Evolução Normal'}
              </button>
              <div className="flex justify-between mb-2"><span className="text-[10px] text-gray-600 uppercase">Atributos</span><span className={`text-xs font-mono ${remaining === 0 ? 'text-green-400' : 'text-gray-500'}`}>{remaining} pts</span></div>
              <div className="space-y-1.5 mb-4">
                {uni.attributes.map(at => (
                  <div key={at.key} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600 w-8 font-mono">{at.short}</span>
                    <button onClick={() => adjust(at.key, -1)} className="w-6 h-6 border border-gray-800 rounded text-gray-500 text-xs hover:text-white">−</button>
                    <span className="text-white font-mono text-sm w-5 text-center">{cAttrs[at.key]}</span>
                    <button onClick={() => adjust(at.key, 1)} className="w-6 h-6 border border-gray-800 rounded text-gray-500 text-xs hover:text-white">+</button>
                    <div className="flex-1 h-1 bg-gray-900 rounded-full"><div className="h-full rounded-full" style={{ width: `${((cAttrs[at.key] - FLOOR) / (CAP - FLOOR)) * 100}%`, background: accent }} /></div>
                  </div>
                ))}
              </div>
              <button onClick={() => { setScenarioOpts(getScenarios()); setScenario(null); setStep(5); }} className="w-full py-3 bg-white text-black font-semibold rounded-lg">Escolher Cenário →</button>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Como começa?</h2>
              <p className="text-xs text-gray-600 mb-4">Escolha o cenário de início</p>
              <div className="space-y-2 mb-3">
                {scenarioOpts.map(sc => (
                  <button key={sc.id} onClick={() => setScenario(sc)} className={`w-full text-left p-3 border rounded-lg ${scenario?.id === sc.id ? 'text-white bg-white/5' : 'border-gray-800'}`} style={{ borderColor: scenario?.id === sc.id ? accent : undefined }}>
                    <p className="text-white text-sm font-semibold">{sc.emoji} {sc.title}</p>
                    <p className="text-gray-500 text-[11px] mt-0.5">{sc.setup.slice(0, 85)}...</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mb-3">
                <button onClick={() => { setScenarioOpts(getScenarios()); }} className="flex-1 py-2 border border-gray-800 rounded-lg text-xs text-gray-400">🔄 Outros</button>
                <button onClick={() => { setScenario(null); setCustomStart(''); }} className={`flex-1 py-2 border rounded-lg text-xs ${!scenario && !customStart ? 'text-white' : 'border-gray-800 text-gray-500'}`} style={{ borderColor: !scenario && !customStart ? accent : undefined }}>🎲 Surpresa</button>
              </div>
              <div className="border-t border-gray-900 pt-3 mb-3">
                <label className="text-[10px] text-gray-600 uppercase block mb-1">✍️ Ou escreva seu próprio início</label>
                <textarea value={customStart} onChange={e => { setCustomStart(e.target.value); if (e.target.value.trim()) setScenario(null); }} placeholder="Descreva a cena de abertura como quiser: onde você acorda, o que acontece, quem está lá..." className="w-full px-3 py-2 bg-black border rounded-lg text-white text-sm h-24 resize-none focus:outline-none" style={{ borderColor: customStart.trim() ? accent : '#1f2937' }} />
              </div>
              <button onClick={startGame} className="w-full py-4 bg-white text-black font-bold rounded-lg">🎮 Iniciar</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === GAME ===
  return (
    <div className="h-[100dvh] flex flex-col md:flex-row bg-black">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-none flex items-center justify-between px-3 py-2 border-b border-gray-900 text-[10px]">
          <button onClick={() => router.push('/')} className="text-gray-600 hover:text-white px-1">← Universos</button>
          <span className="text-gray-500 truncate max-w-[40%]">{uni.emoji} {character ? `${character.name} Nv${character.level}` : 'Criando...'}</span>
          <span className="text-gray-700 px-1">{gameState?.world?.location?.slice(0, 20) || ''}</span>
        </div>
        <div className="flex-1 overflow-y-scroll overscroll-y-contain p-3 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] px-3 py-2 rounded-2xl whitespace-pre-wrap text-[13px] leading-relaxed ${msg.role === 'player' ? 'bg-white text-black rounded-br-none' : msg.role === 'system' ? 'border border-gray-800 text-gray-500 text-[10px] font-mono rounded-lg' : 'bg-gray-900 text-gray-200 rounded-bl-none'}`}>{msg.content}</div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== 'narrator' && <div className="flex justify-start"><div className="bg-gray-900 px-3 py-2 rounded-2xl flex gap-1"><span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: accent }} /><span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: accent, animationDelay: '150ms' }} /><span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: accent, animationDelay: '300ms' }} /></div></div>}
          {crossroad && <div className="border border-gray-800 rounded-xl p-3 space-y-2"><p className="text-white text-xs font-semibold">{crossroad.prompt}</p><div className="flex flex-col gap-1.5">{crossroad.options.map((o: string, i: number) => <button key={i} onClick={() => { setCrossroad(null); sendMessage(o); }} className="w-full text-left px-3 py-2 border border-gray-800 rounded-lg text-xs hover:bg-white/5">{o}</button>)}</div></div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex-none border-t border-gray-900 p-2">
          <div className="flex gap-2 items-end">
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="O que você faz?" disabled={isLoading} rows={3} className="flex-1 px-3 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-700 focus:outline-none focus:border-white text-sm resize-none" />
            <button onClick={handleSend} disabled={isLoading || !input.trim()} className="px-4 h-10 bg-white text-black rounded-lg font-bold disabled:bg-gray-900 disabled:text-gray-700">→</button>
          </div>
        </div>
      </div>
      {character && <div className="hidden md:block w-72 border-l border-gray-900 overflow-y-auto"><CharacterSheet character={character} gameState={gameState} universe={uni} portrait={portrait} /></div>}
    </div>
  );
}

export default function GamePage() {
  return <Suspense fallback={<div className="p-8 text-white">Carregando...</div>}><GameInner /></Suspense>;
}
