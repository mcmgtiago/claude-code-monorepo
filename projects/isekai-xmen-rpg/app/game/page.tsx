'use client';

import { useState, useRef, useEffect } from 'react';
import CharacterSheet from './components/CharacterSheet';
import { getRandomScenarios, type Scenario } from '@/src/engine/scenarios';

interface Message {
  role: 'player' | 'narrator' | 'system';
  content: string;
}

interface Crossroad { prompt: string; options: string[]; }
interface SaveEntry { id: string; name: string; level: number; power: string; location: string; turnCount: number; updatedAt: string; }
interface Achievement { id: string; title: string; when: string; }

export default function GamePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [gameState, setGameState] = useState<any>(null);
  const [sessionId, setSessionId] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [screen, setScreen] = useState<'menu' | 'config' | 'game' | 'saves' | 'sheet' | 'diary' | 'npcs' | 'map'>('menu');
  const [crossroad, setCrossroad] = useState<Crossroad | null>(null);
  const [saves, setSaves] = useState<SaveEntry[]>([]);
  const [portrait, setPortrait] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingInterval = useRef<any>(null);

  // Config state
  const [cfgStep, setCfgStep] = useState(1); // wizard step 1-7
  const [cfgTier, setCfgTier] = useState<'novato' | 'veterano' | 'elite' | 'omega'>('novato');
  const [cfgPower, setCfgPower] = useState<'mutante' | 'humano'>('mutante');
  const [cfgPowerType, setCfgPowerType] = useState(''); // poder final escolhido
  const [cfgPowerStyle, setCfgPowerStyle] = useState(''); // input do player descrevendo estilo
  const [cfgPowerOptions, setCfgPowerOptions] = useState<string[]>([]); // 4 opções geradas pela IA
  const [cfgGeneratingPowers, setCfgGeneratingPowers] = useState(false);
  const [cfgName, setCfgName] = useState('');
  const [cfgAge, setCfgAge] = useState('');
  const [cfgPersonality, setCfgPersonality] = useState('');
  const [cfgAppearance, setCfgAppearance] = useState('');
  const [cfgPhotos, setCfgPhotos] = useState<string[]>([]);
  const [cfgSelectedPhoto, setCfgSelectedPhoto] = useState<number>(-1);
  const [cfgGeneratingPhotos, setCfgGeneratingPhotos] = useState(false);
  const [cfgAttrs, setCfgAttrs] = useState({ forca: 10, velocidade: 10, resistencia: 10, poder: 10, controle: 10, percepcao: 10, vontade: 10, presenca: 10 });

  const TIER_BUDGETS: Record<string, number> = { novato: 22, veterano: 34, elite: 48, omega: 80 };
  const ATTR_FLOOR = 8, ATTR_CAP = 18;
  const totalSpent = Object.values(cfgAttrs).reduce((sum, v) => sum + (v - ATTR_FLOOR), 0);
  const budget = TIER_BUDGETS[cfgTier];
  const remaining = budget - totalSpent;
  const ATTR_LABELS: Record<string, string> = { forca: 'FOR', velocidade: 'VEL', resistencia: 'RES', poder: 'POD', controle: 'CTR', percepcao: 'PER', vontade: 'VON', presenca: 'PRE' };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (cfgTier === 'omega') setCfgAttrs({ forca: 18, velocidade: 18, resistencia: 18, poder: 18, controle: 18, percepcao: 18, vontade: 18, presenca: 18 }); else setCfgAttrs({ forca: 10, velocidade: 10, resistencia: 10, poder: 10, controle: 10, percepcao: 10, vontade: 10, presenca: 10 }); }, [cfgTier]);

  // Loading timer
  useEffect(() => {
    if (isLoading) {
      setLoadingTime(0);
      loadingInterval.current = setInterval(() => setLoadingTime(t => t + 1), 1000);
    } else {
      if (loadingInterval.current) clearInterval(loadingInterval.current);
    }
    return () => { if (loadingInterval.current) clearInterval(loadingInterval.current); };
  }, [isLoading]);

  // Notifications
  const showNotif = (text: string) => { setNotification(text); setTimeout(() => setNotification(null), 3000); };

  // Check achievements
  const checkAchievements = (state: any) => {
    if (!state?.character?.name) return;
    const c = state.character;
    const newAchs: Achievement[] = [];
    if (c.kills >= 1 && !achievements.find(a => a.id === 'first_kill')) newAchs.push({ id: 'first_kill', title: '💀 Primeiro Kill', when: `Dia ${state.world?.day}` });
    if (c.powerStage === 'despertar' && !achievements.find(a => a.id === 'awakening')) newAchs.push({ id: 'awakening', title: '⚡ Despertar', when: `Dia ${state.world?.day}` });
    if (c.powerStage === 'avancado' && !achievements.find(a => a.id === 'advanced')) newAchs.push({ id: 'advanced', title: '🔥 Poder Avançado', when: `Dia ${state.world?.day}` });
    if (state.relationships?.some((r: any) => r.romantic) && !achievements.find(a => a.id === 'romance')) newAchs.push({ id: 'romance', title: '❤️ Primeiro Romance', when: `Dia ${state.world?.day}` });
    if (c.level >= 10 && !achievements.find(a => a.id === 'lv10')) newAchs.push({ id: 'lv10', title: '⭐ Nível 10', when: `Dia ${state.world?.day}` });
    if (newAchs.length > 0) { setAchievements(a => [...a, ...newAchs]); newAchs.forEach(a => showNotif(a.title)); }
  };

  const adjustAttr = (attr: string, delta: number) => {
    setCfgAttrs(prev => {
      const newVal = prev[attr as keyof typeof prev] + delta;
      if (newVal < ATTR_FLOOR || newVal > ATTR_CAP) return prev;
      if (totalSpent + delta > budget) return prev;
      return { ...prev, [attr]: newVal };
    });
  };

  const expandAppearance = async () => {
    if (!cfgAppearance || cfgAppearance.length < 5) return;
    try {
      const res = await fetch('/api/game/action', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Expanda esta descrição de aparência em detalhes ricos (rosto, corpo, roupas, acessórios, cores, cicatrizes, estilo): "${cfgAppearance}". Responda APENAS com a descrição expandida, sem nada mais. 3-4 frases.`, sessionId: 'expand-temp' }),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      let text = '';
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n').filter(l => l.startsWith('data: '))) {
          try { const d = JSON.parse(line.slice(6)); if (d.type === 'text') text += d.text; } catch {}
        }
      }
      if (text.trim()) setCfgAppearance(text.trim());
    } catch {}
  };

  const loadSaves = async () => { try { setSaves(await (await fetch('/api/game/save')).json()); } catch {} };

  const startGame = () => {
    const sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    setSessionId(sid); setMessages([]); setGameState(null); setCrossroad(null); setScreen('game');
    const attrsObj = JSON.stringify(cfgAttrs);
    const tierLabel = cfgTier === 'omega' ? 'OMEGA' : cfgTier === 'elite' ? 'ALPHA' : cfgTier === 'veterano' ? 'BETA' : 'EPSILON';
    const powerStr = cfgPower === 'humano' ? 'HUMANO PURO (sem poderes)' : cfgPowerType;

    const scenarioInstr = selectedScenario
      ? `CENÁRIO DE INÍCIO ESCOLHIDO: "${selectedScenario.title}" — ${selectedScenario.setup}`
      : 'Escolha um local ALEATÓRIO e CRIATIVO para o início. Nunca repita.';

    const modeInstr = gameMode === 'adult'
      ? `MODO +18 ATIVO. Mundo sexualizado. NPCs atraentes e provocantes. Tensão sexual. ${scenarioInstr}. Descreva com TENSÃO SEXUAL, corpo do NPC, provocação. PARE antes de ação explícita.`
      : `MODO AVENTURA. ${scenarioInstr}. Foco em história e lore. +18 permitido se jogador iniciar.`;

    const growthInstr = (cfgTier === 'omega' || cfgTier === 'elite')
      ? 'PODER: Personagem já começa FORTE/OVERPOWERED. Domina os poderes. Enfrenta ameaças de alto nível.'
      : 'PODER: Personagem começa FRACO mas tem EVOLUÇÃO INSANAMENTE RÁPIDA. Conceda XP GENEROSO (2-3x o normal: 60-150 por feito, 300+ por marcos). Ensine skills frequentemente. Faça o personagem evoluir rápido de nível e poder a cada luta/desafio superado. Ascensão meteórica.';

    const instruction = `INICIAR NOVO JOGO.
${modeInstr}
${growthInstr}
Personagem: "${cfgName}"${cfgAge ? `, ${cfgAge} anos` : ''}, classificação ${tierLabel}, poder: ${powerStr}${cfgPersonality ? `, personalidade: ${cfgPersonality}` : ''}${cfgAppearance ? `, aparência: ${cfgAppearance}` : ''}
Chame create_character com: name="${cfgName}", race="${cfgPower === 'humano' ? 'humano_puro' : 'mutante'}", tier="${cfgTier}", power_class="${cfgPower === 'humano' ? 'nenhum' : cfgPowerType}", background="Transportado de outro universo"${cfgAge ? `, age=${cfgAge}` : ''}, personality="${cfgPersonality || ''}", attributes=${attrsObj}${cfgAppearance ? `, appearance="${cfgAppearance}"` : ''}.

DEPOIS de criar, narre:
${gameMode === 'adult' ? `1. Transporte BREVE (1 frase). Dor, flash, escuridão.
2. ${cfgName} ACORDA numa situação erótica/sexual conforme as instruções do MODO +18 acima. Descreva o corpo do NPC, o toque, a tensão. O NPC FALA algo provocante.
3. PARE esperando o jogador reagir (aceitar, resistir, fugir, participar).
4. MÁXIMO 2 parágrafos. NÃO tome ações pelo jogador.` : `1. Transporte dimensional — BREVE (1 parágrafo). Dor, luz, queda.
2. ${cfgName} ACORDA SOZINHO. Descreva APENAS ambiente: o que vê, ouve, cheira. NINGUÉM por perto.
3. NÃO apresente NPCs. NÃO force encontros. Player decide pra onde ir.
4. Termine com 2-3 direções/caminhos possíveis.
5. MÁXIMO 2 parágrafos. NÃO tome ações pelo jogador.`}`;

    sendMessage(instruction, sid);
    if (cfgSelectedPhoto >= 0 && cfgPhotos[cfgSelectedPhoto]) setPortrait(cfgPhotos[cfgSelectedPhoto]);
  };

  const generatePortrait = async (appearance: string, name: string) => {
    try {
      const res = await fetch('/api/game/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'character', data: { name: name || 'mutant', appearance } }) });
      const data = await res.json();
      if (data.url) { setPortrait(data.url); showNotif('📷 Retrato gerado!'); }
    } catch {}
  };

  const loadSave = async (id: string) => {
    try {
      const state = await (await fetch('/api/game/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'load', saveId: id }) })).json();
      if (state.error) return;
      setSessionId(state.id); setGameState(state);
      setMessages(state.recentTurns?.map((t: any) => ({ role: t.role === 'player' ? 'player' : 'narrator', content: t.text })) || []);
      setScreen('game');
    } catch {}
  };

  const manualSave = async () => {
    if (!gameState) return;
    await fetch('/api/game/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'save', state: gameState }) });
    showNotif('💾 Salvo!');
  };

  const sendMessage = async (text: string, sid?: string) => {
    if (!text.trim() || isLoading) return;
    const currentSid = sid || sessionId;
    if (!sid) setMessages(m => [...m, { role: 'player', content: text }]);
    setIsLoading(true); setCrossroad(null);
    try {
      const response = await fetch('/api/game/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, sessionId: currentSid }) });
      if (!response.ok) throw new Error(await response.text());
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Sem resposta');
      const decoder = new TextDecoder();
      let narratorText = '', addedNarrator = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n').filter(l => l.startsWith('data: '))) {
          try {
            const data = JSON.parse(line.slice(6));
            switch (data.type) {
              case 'text':
                narratorText += data.text;
                if (!addedNarrator) { setMessages(m => [...m, { role: 'narrator', content: narratorText }]); addedNarrator = true; }
                else setMessages(m => { const u = [...m]; u[u.length - 1] = { role: 'narrator', content: narratorText }; return u; });
                break;
              case 'rolls':
                for (const r of data.rolls) {
                  const e = r.critical === 'hit' ? '🎯' : r.critical === 'fail' ? '💀' : r.success ? '✅' : '❌';
                  setMessages(m => [...m, { role: 'system', content: `${e} ${r.reason} [${r.attributeLabel}] ${r.d20}+${r.modifier}=${r.total} vs DC${r.dc}` }]);
                }
                break;
              case 'changes': if (data.changeLog?.length) { setMessages(m => [...m, { role: 'system', content: data.changeLog.join(' • ') }]); data.changeLog.forEach((c: string) => { if (c.includes('XP')) showNotif('✨ ' + c); }); } break;
              case 'crossroad': setCrossroad(data.crossroad); break;
              case 'state': setGameState(data.state); checkAchievements(data.state); break;
              case 'done': setSessionId(data.sessionId); break;
            }
          } catch {}
        }
      }
    } catch (err) { setMessages(m => [...m, { role: 'narrator', content: `⚠️ ${err instanceof Error ? err.message : 'Erro'}` }]); }
    finally { setIsLoading(false); playNotifSound(); }
  };

  const playNotifSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  };

  const handleSend = () => { if (!input.trim() || isLoading) return; sendMessage(input); setInput(''); };
  // Random character config
  const [rndSex, setRndSex] = useState<'masculino' | 'feminino'>('masculino');
  const [rndMutant, setRndMutant] = useState<'mutante' | 'humano'>('mutante');
  const [rndTier, setRndTier] = useState<'novato' | 'veterano' | 'elite' | 'omega'>('veterano');
  const [rndGenerated, setRndGenerated] = useState<any>(null);
  const [rndGenerating, setRndGenerating] = useState(false);
  const [rndPhotos, setRndPhotos] = useState<string[]>([]);
  const [rndSelectedPhoto, setRndSelectedPhoto] = useState(-1);
  const [rndGenPhotos, setRndGenPhotos] = useState(false);
  const [rndPhase, setRndPhase] = useState<'config' | 'preview' | 'photos'>('config');
  const [gameMode, setGameMode] = useState<'adventure' | 'adult'>('adventure');
  const [scenarioOptions, setScenarioOptions] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showImageGen, setShowImageGen] = useState(false);
  const [imageGenPrompt, setImageGenPrompt] = useState('');
  const [imageGenLoading, setImageGenLoading] = useState(false);
  const [chatImages, setChatImages] = useState<string[]>([]);

  const quickAction = (action: string) => { if (!isLoading) sendMessage(action); };

  // === MENU ===
  if (screen === 'menu') return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-black p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">ISEKAI X-MEN</h1>
        <p className="text-sm text-gray-600">RPG Narrativo • Universo Mutante</p>
      </div>

      {/* Mode selector */}
      <div className="w-full max-w-xs mb-6">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setGameMode('adventure')}
            className={`py-3 border rounded-lg text-sm active:scale-95 transition-all ${gameMode === 'adventure' ? 'border-white text-white bg-white/5' : 'border-gray-800 text-gray-500'}`}>
            ⚔️ Aventura
          </button>
          <button onClick={() => setGameMode('adult')}
            className={`py-3 border rounded-lg text-sm active:scale-95 transition-all ${gameMode === 'adult' ? 'border-red-500 text-red-300 bg-red-500/5' : 'border-gray-800 text-gray-500'}`}>
            🔞 +18
          </button>
        </div>
        <p className="text-[10px] text-gray-700 text-center mt-1.5">
          {gameMode === 'adventure' ? 'Foco em combate, exploração e história' : 'Foco em romance, cenas sexuais e fetiches'}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={() => setScreen('config')} className="py-4 bg-white text-black rounded-lg font-semibold active:scale-95 hover:bg-gray-200">Criar Personagem</button>
        <button onClick={() => setScreen('random')} className="py-3 border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-white active:scale-95">🎲 Personagem Aleatório</button>
        <button onClick={() => { loadSaves(); setScreen('saves'); }} className="py-3 border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-white active:scale-95">Carregar Save</button>
      </div>
    </div>
  );

  // === RANDOM CHARACTER ===
  if (screen === 'random') {
    const generateRandomChar = async () => {
      setRndGenerating(true); setRndGenerated(null);
      try {
        const res = await fetch('/api/game/generate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'character', sex: rndSex, mutant: rndMutant }),
        });
        const data = await res.json();
        if (data.name) { setRndGenerated(data); setRndPhase('preview'); }
      } catch {} finally { setRndGenerating(false); }
    };

    const generateRndPhotos = async () => {
      if (!rndGenerated?.appearance) return;
      setRndGenPhotos(true); setRndPhotos([]);
      try {
        const results = await Promise.all([1,2,3,4].map(async (i) => {
          const variation = ['front portrait', '3/4 angle moody', 'side profile dramatic', 'close-up intense'][i-1];
          const res = await fetch('/api/game/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'character', data: { name: rndGenerated.name, appearance: `${rndGenerated.appearance}. ${variation}` } }) });
          const data = await res.json();
          return data.url || null;
        }));
        setRndPhotos(results.filter(Boolean));
        setRndPhase('photos');
      } catch {} finally { setRndGenPhotos(false); }
    };

    const startWithRandom = () => {
      const sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      setSessionId(sid); setMessages([]); setGameState(null); setCrossroad(null); setScreen('game');
      const budgets: Record<string, number> = { novato: 22, veterano: 34, elite: 48, omega: 80 };
      const b = budgets[rndTier];
      const attrs = { forca: 8, velocidade: 8, resistencia: 8, poder: 8, controle: 8, percepcao: 8, vontade: 8, presenca: 8 };
      let pts = b;
      const keys = Object.keys(attrs) as Array<keyof typeof attrs>;
      while (pts > 0) { const k = keys[Math.floor(Math.random() * keys.length)]; if (attrs[k] < 18) { attrs[k]++; pts--; } }
      const attrsObj = JSON.stringify(attrs);
      const g = rndGenerated;
      const tierLabel = rndTier === 'omega' ? 'OMEGA' : rndTier === 'elite' ? 'ALPHA' : rndTier === 'veterano' ? 'BETA' : 'EPSILON';

      const modeInstr = gameMode === 'adult'
        ? `MODO +18 — INÍCIO ERÓTICO. O transporte coloca o personagem numa situação sexual imediata (acorda nu com alguém, cai num clube BDSM, materializa num bordel, alguém te toca enquanto dorme, etc — escolha aleatoriamente). Descreva com tensão sexual, corpo do NPC, provocação. PARE antes de ação explícita — jogador decide.`
        : `MODO AVENTURA. Foco combate, exploração, facções.`;

      const instruction = `INICIAR NOVO JOGO.
${modeInstr}
Personagem: "${g.name}", ${g.age} anos, ${tierLabel}. Poder: ${g.power}. Personalidade: ${g.personality}. Aparência: ${g.appearance}. Background: ${g.background}.
Chame create_character com: name="${g.name}", age=${g.age}, race="${rndMutant === 'humano' ? 'humano_puro' : 'mutante'}", tier="${rndTier}", power_class="${rndMutant === 'humano' ? 'nenhum' : g.power}", personality="${g.personality}", appearance="${g.appearance}", background="${g.background}", attributes=${attrsObj}.
DEPOIS: transporte breve (1 parágrafo) + acorda SOZINHO + 2-3 direções. MÁXIMO 2 parágrafos. NÃO tome ações.`;

      sendMessage(instruction, sid);
      if (rndSelectedPhoto >= 0 && rndPhotos[rndSelectedPhoto]) setPortrait(rndPhotos[rndSelectedPhoto]);
    };

    return (
      <div className="min-h-[100dvh] bg-black p-4 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <button onClick={() => rndPhase === 'config' ? setScreen('menu') : setRndPhase('config')} className="mb-4 text-xs text-gray-600 hover:text-white">← {rndPhase === 'config' ? 'Menu' : 'Voltar'}</button>

          {/* Phase 1: Config */}
          {rndPhase === 'config' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">🎲 Personagem Aleatório</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-gray-600 uppercase mb-2">Sexo</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setRndSex('masculino')} className={`py-3 border rounded-lg text-sm active:scale-95 ${rndSex === 'masculino' ? 'border-white text-white bg-white/5' : 'border-gray-800 text-gray-500'}`}>♂ Masculino</button>
                    <button onClick={() => setRndSex('feminino')} className={`py-3 border rounded-lg text-sm active:scale-95 ${rndSex === 'feminino' ? 'border-white text-white bg-white/5' : 'border-gray-800 text-gray-500'}`}>♀ Feminino</button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 uppercase mb-2">Tipo</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setRndMutant('mutante')} className={`py-3 border rounded-lg text-sm active:scale-95 ${rndMutant === 'mutante' ? 'border-purple-500 text-white bg-white/5' : 'border-gray-800 text-gray-500'}`}>⚡ Mutante</button>
                    <button onClick={() => setRndMutant('humano')} className={`py-3 border rounded-lg text-sm active:scale-95 ${rndMutant === 'humano' ? 'border-gray-400 text-white bg-white/5' : 'border-gray-800 text-gray-500'}`}>🧑 Humano</button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 uppercase mb-2">Classificação</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['novato', 'veterano', 'elite', 'omega'] as const).map(t => (
                      <button key={t} onClick={() => setRndTier(t)} className={`py-2 border rounded-lg text-xs active:scale-95 ${rndTier === t ? 'border-white text-white bg-white/5' : 'border-gray-800 text-gray-600'}`}>
                        {t === 'omega' ? 'Omega' : t === 'elite' ? 'Alpha' : t === 'veterano' ? 'Beta' : 'Epsilon'}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={generateRandomChar} disabled={rndGenerating} className="w-full py-4 bg-white text-black font-bold rounded-lg active:scale-95 disabled:bg-gray-900 disabled:text-gray-600">
                  {rndGenerating ? '⏳ Gerando...' : '🎲 Gerar Personagem'}
                </button>
              </div>
            </div>
          )}

          {/* Phase 2: Preview (editável) */}
          {rndPhase === 'preview' && rndGenerated && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Personagem Gerado</h2>
              <p className="text-[10px] text-gray-600 mb-4">Edite o que quiser antes de continuar</p>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-[10px] text-gray-600 uppercase">Nome</label>
                  <input type="text" value={rndGenerated.name} onChange={e => setRndGenerated({...rndGenerated, name: e.target.value})}
                    className="w-full px-3 py-2 bg-black border border-gray-800 rounded-lg text-white text-sm focus:border-white" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-600 uppercase">Idade</label>
                  <input type="number" value={rndGenerated.age} onChange={e => setRndGenerated({...rndGenerated, age: parseInt(e.target.value) || 18})}
                    className="w-full px-3 py-2 bg-black border border-gray-800 rounded-lg text-white text-sm focus:border-white" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-600 uppercase">Personalidade</label>
                  <textarea value={rndGenerated.personality} onChange={e => setRndGenerated({...rndGenerated, personality: e.target.value})}
                    className="w-full px-3 py-2 bg-black border border-gray-800 rounded-lg text-white text-sm h-16 resize-none focus:border-white" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-600 uppercase">Aparência</label>
                  <textarea value={rndGenerated.appearance} onChange={e => setRndGenerated({...rndGenerated, appearance: e.target.value})}
                    className="w-full px-3 py-2 bg-black border border-gray-800 rounded-lg text-white text-sm h-20 resize-none focus:border-white" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-600 uppercase">Poder</label>
                  <input type="text" value={rndGenerated.power} onChange={e => setRndGenerated({...rndGenerated, power: e.target.value})}
                    className="w-full px-3 py-2 bg-black border border-gray-800 rounded-lg text-purple-300 text-sm focus:border-white" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-600 uppercase">Background</label>
                  <input type="text" value={rndGenerated.background} onChange={e => setRndGenerated({...rndGenerated, background: e.target.value})}
                    className="w-full px-3 py-2 bg-black border border-gray-800 rounded-lg text-white text-sm focus:border-white" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={generateRandomChar} disabled={rndGenerating} className="flex-1 py-3 border border-gray-800 rounded-lg text-sm text-gray-400 active:scale-95 disabled:opacity-50">
                  {rndGenerating ? '⏳...' : '🔄 Gerar outro'}
                </button>
                <button onClick={generateRndPhotos} disabled={rndGenPhotos} className="flex-1 py-3 bg-white text-black font-semibold rounded-lg active:scale-95 disabled:bg-gray-800 disabled:text-gray-500">
                  {rndGenPhotos ? '⏳ Gerando...' : '📷 Gerar Retratos'}
                </button>
              </div>
            </div>
          )}

          {/* Phase 3: Photos */}
          {rndPhase === 'photos' && rndGenerated && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">{rndGenerated.name}</h2>
              <p className="text-xs text-gray-600 mb-4">Escolha um retrato</p>
              {rndPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {rndPhotos.map((url, i) => (
                    <button key={i} onClick={() => { setRndSelectedPhoto(i); setPortrait(url); }}
                      className={`rounded-lg overflow-hidden border-2 active:scale-95 ${rndSelectedPhoto === i ? 'border-white' : 'border-gray-800'}`}>
                      <img src={url} alt={`Opção ${i+1}`} className="w-full aspect-square object-cover" />
                    </button>
                  ))}
                  <button onClick={generateRndPhotos} disabled={rndGenPhotos} className="col-span-2 py-2 text-[10px] text-gray-600 hover:text-white">🔄 Gerar outras fotos</button>
                </div>
              ) : (
                <p className="text-gray-600 text-sm mb-4">⏳ Gerando retratos...</p>
              )}
              <button onClick={startWithRandom} className="w-full py-4 bg-white text-black font-bold rounded-lg active:scale-95">
                🎮 Iniciar Aventura
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === CONFIG (wizard por etapas) ===
  if (screen === 'config') {
    const TIERS = { novato: { label: 'Epsilon/Delta', desc: 'Fraco', color: 'border-gray-600' }, veterano: { label: 'Beta/Gamma', desc: 'Competente', color: 'border-blue-500' }, elite: { label: 'Alpha', desc: 'Forte', color: 'border-purple-500' }, omega: { label: 'Omega', desc: 'Sem limite', color: 'border-amber-400' } };

    const generatePowerOptions = async () => {
      if (!cfgPowerStyle.trim()) return;
      setCfgGeneratingPowers(true); setCfgPowerOptions([]);
      try {
        const res = await fetch('/api/game/generate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'powers', style: cfgPowerStyle }),
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setCfgPowerOptions(data.map((p: any) => `${p.name}: ${p.description}`));
        }
      } catch {} finally { setCfgGeneratingPowers(false); }
    };

    const generatePhotos = async () => {
      setCfgGeneratingPhotos(true); setCfgPhotos([]);
      const desc = cfgAppearance || `${cfgName}, ${cfgAge ? cfgAge + ' anos, ' : ''}${cfgPersonality ? cfgPersonality + ', ' : ''}${cfgPower === 'mutante' ? 'mutante com poder de ' + cfgPowerType : 'humano'}`;
      try {
        const results = await Promise.all([1,2,3,4].map(async (i) => {
          const variation = [`front view portrait, dramatic lighting`, `3/4 angle, moody atmosphere`, `side profile, neon background`, `close-up, intense expression`][i-1];
          const res = await fetch('/api/game/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'character', data: { name: cfgName || 'character', appearance: `${desc}. ${variation}` } }) });
          const data = await res.json();
          return data.url || null;
        }));
        setCfgPhotos(results.filter(Boolean));
      } catch {} finally { setCfgGeneratingPhotos(false); }
    };

    return (
      <div className="min-h-[100dvh] bg-black p-4 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <button onClick={() => cfgStep > 1 ? setCfgStep(cfgStep - 1) : setScreen('menu')} className="mb-4 text-xs text-gray-600 hover:text-white">← {cfgStep > 1 ? 'Voltar' : 'Menu'}</button>

          {/* Progress */}
          <div className="flex gap-1 mb-6">
            {[1,2,3,4,5,6,7].map(s => <div key={s} className={`flex-1 h-0.5 rounded-full ${s <= cfgStep ? 'bg-white' : 'bg-gray-800'}`} />)}
          </div>

          {/* Step 1: Nome */}
          {cfgStep === 1 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Qual é o seu nome?</h2>
              <p className="text-xs text-gray-600 mb-6">O nome do seu personagem</p>
              <input type="text" value={cfgName} onChange={e => setCfgName(e.target.value)} placeholder="Ex: Kira, Shadow, Nova..."
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-700 focus:border-white text-lg mb-6" autoFocus />
              <button onClick={() => setCfgStep(2)} disabled={!cfgName.trim()} className="w-full py-3 bg-white text-black font-semibold rounded-lg active:scale-95 disabled:bg-gray-900 disabled:text-gray-600">Próximo →</button>
            </div>
          )}

          {/* Step 2: Idade + Personalidade */}
          {cfgStep === 2 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Quem é {cfgName}?</h2>
              <p className="text-xs text-gray-600 mb-4">Idade e personalidade</p>
              <div className="mb-4">
                <label className="text-[10px] text-gray-600 uppercase block mb-1">Idade</label>
                <input type="text" value={cfgAge} onChange={e => setCfgAge(e.target.value)} placeholder="Ex: 22, 30, aparenta 25..."
                  className="w-full px-3 py-2.5 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-700 focus:border-white text-sm" />
              </div>
              <div className="mb-6">
                <label className="text-[10px] text-gray-600 uppercase block mb-1">Personalidade / Temperamento</label>
                <textarea value={cfgPersonality} onChange={e => setCfgPersonality(e.target.value)} placeholder="Ex: Frio e calculista, mas leal. Sarcástico. Protetor com quem ama."
                  className="w-full px-3 py-2.5 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-700 focus:border-white text-sm h-20 resize-none" />
              </div>
              <button onClick={() => setCfgStep(3)} className="w-full py-3 bg-white text-black font-semibold rounded-lg active:scale-95">Próximo →</button>
            </div>
          )}

          {/* Step 3: Mutante ou Humano */}
          {cfgStep === 3 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{cfgName} é mutante?</h2>
              <p className="text-xs text-gray-600 mb-6">Define se começa com poderes</p>
              <div className="space-y-3">
                <button onClick={() => { setCfgPower('mutante'); setCfgStep(4); }}
                  className="w-full p-4 border border-gray-800 hover:border-purple-500 rounded-lg text-left active:scale-95">
                  <p className="text-white font-semibold">⚡ Mutante</p>
                  <p className="text-xs text-gray-500 mt-1">X-Gene ativo. Vai escolher ou gerar poder.</p>
                </button>
                <button onClick={() => { setCfgPower('humano'); setCfgPowerType('nenhum'); setCfgStep(5); }}
                  className="w-full p-4 border border-gray-800 hover:border-gray-400 rounded-lg text-left active:scale-95">
                  <p className="text-white font-semibold">🧑 Humano Puro</p>
                  <p className="text-xs text-gray-500 mt-1">Sem poderes. Pode despertar na história.</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Gerador de Poderes */}
          {cfgStep === 4 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Qual seu poder?</h2>
              <p className="text-xs text-gray-600 mb-4">Descreva seu estilo e a IA gera opções — ou escreva direto</p>

              {/* Style description */}
              <div className="mb-3">
                <label className="text-[10px] text-gray-600 uppercase block mb-1">Descreva seu estilo de luta / poder ideal</label>
                <textarea value={cfgPowerStyle} onChange={e => setCfgPowerStyle(e.target.value)}
                  placeholder="Ex: Quero controlar sombras, ser furtivo, criar armas do nada. Ou: Quero ser um tank que absorve dano. Ou: Algo ligado a sangue e regeneração..."
                  className="w-full px-3 py-2.5 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-700 focus:border-white text-sm h-20 resize-none" />
              </div>

              <button onClick={generatePowerOptions} disabled={cfgGeneratingPowers || !cfgPowerStyle.trim()}
                className="w-full py-2.5 border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white active:scale-95 disabled:opacity-50 mb-4">
                {cfgGeneratingPowers ? '⏳ Gerando poderes...' : '🎲 Gerar 4 opções de poder'}
              </button>

              {/* Generated options */}
              {cfgPowerOptions.length > 0 && (
                <div className="space-y-2 mb-4">
                  {cfgPowerOptions.map((opt, i) => (
                    <button key={i} onClick={() => setCfgPowerType(opt)}
                      className={`w-full p-3 border rounded-lg text-left text-xs active:scale-95 transition-all ${cfgPowerType === opt ? 'border-purple-500 bg-white/5 text-white' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}>
                      {opt}
                    </button>
                  ))}
                  <button onClick={generatePowerOptions} disabled={cfgGeneratingPowers}
                    className="w-full py-2 text-[10px] text-gray-600 hover:text-white">🔄 Gerar outras opções</button>
                </div>
              )}

              {/* Or type directly */}
              <div className="border-t border-gray-900 pt-3 mb-4">
                <label className="text-[10px] text-gray-600 block mb-1">Ou escreva o poder diretamente:</label>
                <input type="text" value={cfgPowerOptions.includes(cfgPowerType) ? '' : cfgPowerType}
                  onChange={e => setCfgPowerType(e.target.value)} placeholder="Ex: Telecinese, Manipulação de sombras..."
                  className="w-full px-3 py-2 bg-black border border-gray-800 rounded text-sm text-white placeholder-gray-700 focus:border-white" />
              </div>

              <button onClick={() => setCfgStep(5)} disabled={!cfgPowerType.trim()}
                className="w-full py-3 bg-white text-black font-semibold rounded-lg active:scale-95 disabled:bg-gray-900 disabled:text-gray-600">Próximo →</button>
            </div>
          )}

          {/* Step 5: Classificação + Atributos */}
          {cfgStep === 5 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Classificação e Atributos</h2>
              <p className="text-xs text-gray-600 mb-4">Nível de poder define o orçamento</p>

              <div className="grid grid-cols-2 gap-2 mb-5">
                {(['novato', 'veterano', 'elite', 'omega'] as const).map(t => (
                  <button key={t} onClick={() => setCfgTier(t)} className={`p-3 rounded-lg text-left border active:scale-95 ${cfgTier === t ? `${TIERS[t].color} bg-white/5` : 'border-gray-800'}`}>
                    <p className={`text-xs font-semibold ${cfgTier === t ? 'text-white' : 'text-gray-500'}`}>{TIERS[t].label}</p>
                    <p className="text-[10px] text-gray-600">{TIER_BUDGETS[t]}pts</p>
                  </button>
                ))}
              </div>

              <div className="flex justify-between mb-2">
                <p className="text-[10px] text-gray-600 uppercase">Atributos</p>
                <p className={`text-xs font-mono ${remaining === 0 ? 'text-green-400' : 'text-gray-500'}`}>{remaining} pts</p>
              </div>
              <div className="space-y-1.5 mb-6">
                {Object.entries(cfgAttrs).map(([attr, val]) => (
                  <div key={attr} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600 w-7 font-mono">{ATTR_LABELS[attr]}</span>
                    <button onClick={() => adjustAttr(attr, -1)} className="w-6 h-6 border border-gray-800 rounded text-gray-500 text-xs hover:text-white active:scale-90">−</button>
                    <span className="text-white font-mono text-sm w-5 text-center">{val}</span>
                    <button onClick={() => adjustAttr(attr, 1)} className="w-6 h-6 border border-gray-800 rounded text-gray-500 text-xs hover:text-white active:scale-90">+</button>
                    <div className="flex-1 h-1 bg-gray-900 rounded-full"><div className="h-full bg-white rounded-full transition-all" style={{ width: `${((val - ATTR_FLOOR) / (ATTR_CAP - ATTR_FLOOR)) * 100}%` }} /></div>
                  </div>
                ))}
              </div>

              <button onClick={() => setCfgStep(6)} className="w-full py-3 bg-white text-black font-semibold rounded-lg active:scale-95">Próximo →</button>
            </div>
          )}

          {/* Step 6: Aparência */}
          {cfgStep === 6 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Como {cfgName} se parece?</h2>
              <p className="text-xs text-gray-600 mb-4">Descreva rosto, corpo, roupas. Você pode adicionar foto depois no jogo.</p>

              <textarea value={cfgAppearance} onChange={e => setCfgAppearance(e.target.value)}
                placeholder={`Ex: ${cfgAge ? cfgAge + ' anos, ' : ''}cabelos brancos curtos, olhos verdes, cicatriz no queixo, alto e magro, jaqueta de couro preta, botas militares...`}
                className="w-full px-3 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-700 focus:border-white text-sm h-28 resize-none mb-4" />

              <button onClick={() => { setScenarioOptions(getRandomScenarios(gameMode, 5)); setSelectedScenario(null); setCfgStep(7); }} disabled={remaining < 0}
                className="w-full py-4 bg-white text-black font-bold rounded-lg active:scale-95 disabled:bg-gray-900 disabled:text-gray-600">Escolher Cenário →</button>
            </div>
          )}

          {/* Step 7: Escolher Cenário de Início */}
          {cfgStep === 7 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Como sua história começa?</h2>
              <p className="text-xs text-gray-600 mb-4">Escolha um cenário de início — ou deixe aleatório</p>

              <div className="space-y-2 mb-4">
                {scenarioOptions.map(sc => (
                  <button key={sc.id} onClick={() => setSelectedScenario(sc)}
                    className={`w-full text-left p-3 border rounded-lg active:scale-95 transition-all ${selectedScenario?.id === sc.id ? 'border-purple-500 bg-white/5' : 'border-gray-800 hover:border-gray-600'}`}>
                    <p className="text-white text-sm font-semibold">{sc.emoji} {sc.title}</p>
                    <p className="text-gray-500 text-[11px] mt-0.5">{sc.setup.slice(0, 90)}...</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mb-3">
                <button onClick={() => setScenarioOptions(getRandomScenarios(gameMode, 5))}
                  className="flex-1 py-2 border border-gray-800 rounded-lg text-xs text-gray-400 hover:text-white active:scale-95">🔄 Outros cenários</button>
                <button onClick={() => setSelectedScenario(null)}
                  className={`flex-1 py-2 border rounded-lg text-xs active:scale-95 ${!selectedScenario ? 'border-white text-white' : 'border-gray-800 text-gray-500'}`}>🎲 Surpresa (aleatório)</button>
              </div>

              <button onClick={startGame} disabled={remaining < 0}
                className="w-full py-4 bg-white text-black font-bold rounded-lg active:scale-95 disabled:bg-gray-900 disabled:text-gray-600">🎮 Iniciar Aventura</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === SAVES ===
  if (screen === 'saves') {
    const deleteSave = async (id: string, e: React.MouseEvent) => { e.stopPropagation(); if (!confirm('Excluir?')) return; await fetch('/api/game/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', saveId: id }) }); setSaves(s => s.filter(x => x.id !== id)); };
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-black p-6">
        <h2 className="text-xl font-bold text-white mb-4">Saves</h2>
        {saves.length === 0 ? <p className="text-gray-600 mb-4">Nenhum save.</p> : (
          <div className="w-full max-w-sm space-y-2 mb-4">
            {saves.map(s => (
              <div key={s.id} className="flex gap-2">
                <button onClick={() => loadSave(s.id)} className="flex-1 text-left p-3 border border-gray-800 rounded-lg active:scale-95 hover:border-gray-600">
                  <p className="text-white text-sm">{s.name || '?'}</p>
                  <p className="text-[10px] text-gray-600">Nv{s.level} • {s.power} • {s.turnCount}t</p>
                </button>
                <button onClick={e => deleteSave(s.id, e)} className="px-3 border border-red-900/50 rounded-lg text-red-400 text-xs active:scale-95">✕</button>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setScreen('menu')} className="text-xs text-gray-600 hover:text-white">← Voltar</button>
      </div>
    );
  }

  // === SHEET (mobile) ===
  if (screen === 'sheet') {
    const ch = gameState?.character?.name ? gameState.character : null;
    return (
      <div className="min-h-[100dvh] bg-black p-4 overflow-y-auto">
        <button onClick={() => setScreen('game')} className="mb-3 text-xs text-gray-600 hover:text-white">← Chat</button>
        {ch ? <CharacterSheet character={ch} gameState={gameState} portrait={portrait} onRegeneratePortrait={() => generatePortrait(ch.appearance || cfgAppearance || ch.name, ch.name)} onCustomPortrait={(prompt) => generatePortrait(prompt, ch.name)} /> : <p className="text-gray-600 text-sm">Crie personagem primeiro.</p>}
        {achievements.length > 0 && (
          <div className="mt-4 border-t border-gray-900 pt-3">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Conquistas</p>
            {achievements.map(a => <p key={a.id} className="text-xs text-gray-400">{a.title} <span className="text-gray-700">— {a.when}</span></p>)}
          </div>
        )}
      </div>
    );
  }

  // === DIARY ===
  if (screen === 'diary') return (
    <div className="min-h-[100dvh] bg-black p-4 overflow-y-auto">
      <button onClick={() => setScreen('game')} className="mb-3 text-xs text-gray-600 hover:text-white">← Chat</button>
      <h2 className="text-lg font-bold text-white mb-3">📜 Diário</h2>
      {gameState?.chronicle ? <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{gameState.chronicle}</p> : <p className="text-gray-600 text-sm">Nenhum evento registrado ainda.</p>}
      {achievements.length > 0 && (
        <div className="mt-6 border-t border-gray-900 pt-3">
          <p className="text-xs text-gray-500 mb-2">Marcos</p>
          {achievements.map(a => <p key={a.id} className="text-xs text-gray-400 mb-1">{a.title} — {a.when}</p>)}
        </div>
      )}
    </div>
  );

  // === GAME ===
  const character = gameState?.character?.name ? gameState.character : null;
  const combat = gameState?.combat?.active ? gameState.combat : null;
  const world = gameState?.world;

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row bg-black">
      <div className="flex-1 flex flex-col min-w-0">

        {/* Status bar */}
        <div className="flex-none flex items-center justify-between px-3 py-1.5 border-b border-gray-900 text-[10px]">
          <button onClick={() => setScreen('menu')} className="text-gray-600 active:text-white px-1">←</button>
          {world?.location && <span className="text-gray-500 truncate max-w-[50%]">📍 {world.location} • {world.timeOfDay}</span>}
          <div className="flex gap-1">
            {character && <button onClick={() => setShowInventory(true)} className="text-gray-600 active:text-white px-1">⚡</button>}
            <button onClick={() => setShowImageGen(true)} className="text-gray-600 active:text-white px-1">🖼️</button>
            {character && <button onClick={() => setScreen('diary')} className="text-gray-600 active:text-white px-1">📜</button>}
            {character && <button onClick={() => setScreen('sheet')} className="text-gray-600 active:text-white px-1 md:hidden">📋</button>}
            <button onClick={manualSave} disabled={!gameState} className="text-gray-600 active:text-white disabled:text-gray-800 px-1">💾</button>
          </div>
        </div>

        {/* Combat bar */}
        {combat && (
          <div className="flex-none px-3 py-1 border-b border-red-900/30 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] text-red-400 font-bold">⚔️ R{combat.round}</span>
            {combat.enemies.filter((e: any) => !e.defeated).map((e: any) => (
              <div key={e.id} className="flex items-center gap-1">
                <span className="text-[10px] text-red-300">{e.name}</span>
                <div className="w-12 h-1 bg-gray-800 rounded-full"><div className="h-full bg-red-500 rounded-full" style={{ width: `${(e.hp / e.hpMax) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className="flex-none px-3 py-1 bg-white/5 text-center">
            <span className="text-xs text-white">{notification}</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-scroll overscroll-y-contain p-3 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'} group`}>
              <div className="relative">
                <div className={`max-w-[90%] px-3 py-2 rounded-2xl whitespace-pre-wrap text-[13px] leading-relaxed ${
                  msg.role === 'player' ? 'bg-white text-black rounded-br-none'
                  : msg.role === 'system' ? 'border border-gray-800 text-gray-500 text-[10px] font-mono rounded-lg'
                  : 'bg-gray-900 text-gray-200 rounded-bl-none'
                }`}>
                  {msg.content}
                  {/* Inline image for 🖼️ messages */}
                  {msg.role === 'system' && msg.content.startsWith('🖼️') && chatImages.length > 0 && (
                    <img src={chatImages[chatImages.length - 1]} className="mt-2 w-full rounded-lg" />
                  )}
                </div>
                {/* Action buttons on narrator messages */}
                {msg.role === 'narrator' && i === messages.length - 1 && !isLoading && (
                  <div className="flex gap-1 mt-1">
                    <button onClick={() => { setMessages(m => m.slice(0, -1)); sendMessage('Regenere a última resposta. Escreva algo DIFERENTE do anterior.'); }}
                      className="text-[9px] text-gray-600 hover:text-white px-1.5 py-0.5 border border-gray-800 rounded active:scale-95">🔄 Regenerar</button>
                    <button onClick={() => setMessages(m => m.slice(0, -1))}
                      className="text-[9px] text-gray-600 hover:text-red-400 px-1.5 py-0.5 border border-gray-800 rounded active:scale-95">🗑️ Excluir</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="border border-gray-800 px-3 py-2 rounded-2xl text-[10px] text-gray-600 flex items-center gap-2">
                <span className="inline-flex gap-0.5">
                  <span className="w-1 h-1 bg-white rounded-full animate-bounce" />
                  <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span>{loadingTime}s</span>
              </div>
            </div>
          )}
          {crossroad && (
            <div className="border border-gray-800 rounded-xl p-3 space-y-2">
              <p className="text-white text-xs font-semibold">{crossroad.prompt}</p>
              <div className="flex flex-col gap-1">
                {crossroad.options.map((opt, i) => (
                  <button key={i} onClick={() => { setCrossroad(null); sendMessage(opt); }} disabled={isLoading}
                    className="text-left px-3 py-2 border border-gray-800 hover:border-white rounded-lg text-xs text-gray-300 active:scale-95 disabled:opacity-50">{opt}</button>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick actions */}
        {character && !isLoading && !crossroad && (
          <div className="flex-none px-3 py-1 border-t border-gray-900 flex gap-1.5 overflow-x-auto">
            {['Explorar', 'Observar', 'Falar', 'Atacar', 'Fugir', 'Descansar'].map(a => (
              <button key={a} onClick={() => quickAction(a.toLowerCase())} className="px-2.5 py-1 border border-gray-800 rounded text-[10px] text-gray-500 hover:text-white hover:border-gray-600 whitespace-nowrap active:scale-95">{a}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex-none border-t border-gray-900 p-2">
          <div className="flex gap-2 items-end">
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="O que você faz?" disabled={isLoading} rows={3}
              className="flex-1 px-3 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-700 focus:outline-none focus:border-white disabled:opacity-50 text-sm resize-none overflow-y-auto" />
            <button onClick={handleSend} disabled={isLoading || !input.trim()}
              className="px-4 h-10 bg-white text-black active:bg-gray-300 disabled:bg-gray-900 disabled:text-gray-700 rounded-lg font-bold disabled:opacity-50">→</button>
          </div>
        </div>
      </div>

      {/* Image Generation Popup */}
      {showImageGen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setShowImageGen(false)}>
          <div className="bg-black border border-gray-800 rounded-xl w-full max-w-md p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-bold text-sm">🖼️ Gerar Imagem</h3>
              <button onClick={() => setShowImageGen(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <p className="text-[10px] text-gray-600 mb-2">Descreva o que quer visualizar (NPC, cena, local, seu personagem numa situação...)</p>
            <input
              type="text"
              value={imageGenPrompt}
              onChange={e => setImageGenPrompt(e.target.value)}
              onKeyDown={async e => {
                if (e.key === 'Enter' && imageGenPrompt.trim() && !imageGenLoading) {
                  setImageGenLoading(true);
                  try {
                    const res = await fetch('/api/game/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'scene', data: { prompt: imageGenPrompt + '. Dark cyberpunk X-Men universe, cinematic, detailed, atmospheric. No text.' } }) });
                    const data = await res.json();
                    if (data.url) {
                      setChatImages(prev => [...prev, data.url]);
                      setMessages(m => [...m, { role: 'system', content: `🖼️ [Imagem gerada: ${imageGenPrompt}]` }]);
                    }
                  } catch {} finally { setImageGenLoading(false); setImageGenPrompt(''); setShowImageGen(false); }
                }
              }}
              placeholder="Ex: Rogue de vestido vermelho, Emma Frost no trono, beco de Madripoor à noite..."
              className="w-full px-3 py-2.5 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-700 focus:border-white text-sm mb-3"
              autoFocus
            />
            {imageGenLoading ? (
              <p className="text-center text-gray-500 text-xs py-2">⏳ Gerando imagem...</p>
            ) : (
              <button onClick={async () => {
                if (!imageGenPrompt.trim()) return;
                setImageGenLoading(true);
                try {
                  const res = await fetch('/api/game/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'scene', data: { prompt: imageGenPrompt + '. Dark cyberpunk X-Men universe, cinematic, detailed, atmospheric. No text.' } }) });
                  const data = await res.json();
                  if (data.url) {
                    setChatImages(prev => [...prev, data.url]);
                    setMessages(m => [...m, { role: 'system', content: `🖼️ [Imagem gerada: ${imageGenPrompt}]` }]);
                  }
                } catch {} finally { setImageGenLoading(false); setImageGenPrompt(''); setShowImageGen(false); }
              }} disabled={!imageGenPrompt.trim()} className="w-full py-2.5 bg-white text-black font-semibold rounded-lg active:scale-95 disabled:bg-gray-900 disabled:text-gray-600 text-sm">
                Gerar
              </button>
            )}

            {/* Recent images */}
            {chatImages.length > 0 && (
              <div className="mt-3 border-t border-gray-800 pt-3">
                <p className="text-[9px] text-gray-600 mb-1.5">Últimas geradas:</p>
                <div className="grid grid-cols-3 gap-1">
                  {chatImages.slice(-6).map((url, i) => (
                    <img key={i} src={url} className="w-full aspect-square object-cover rounded" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inventory/Powers Popup */}
      {showInventory && character && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setShowInventory(false)}>
          <div className="bg-black border border-gray-800 rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">⚡ Poderes & Inventário</h3>
              <button onClick={() => setShowInventory(false)} className="text-gray-500 hover:text-white text-lg">✕</button>
            </div>

            {/* X-Gene / Mutation */}
            {character.xGene && (
              <div className="mb-4">
                <h4 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Mutação</h4>
                <div className="border border-purple-900/30 rounded-lg p-3 space-y-2">
                  <p className="text-purple-300 font-semibold text-sm">{character.xGene.class}</p>
                  <p className="text-gray-300 text-xs">{character.xGene.description}</p>
                  {character.xGene.element && <p className="text-gray-500 text-xs">Elemento: {character.xGene.element}</p>}
                  {character.xGene.primaryAbility && <p className="text-blue-300 text-xs">✦ {character.xGene.primaryAbility}</p>}
                  {character.xGene.evolvedAbility && <p className="text-yellow-300 text-xs">★ {character.xGene.evolvedAbility}</p>}
                  {character.xGene.weakness && <p className="text-red-400/70 text-xs italic">⚠ Fraqueza: {character.xGene.weakness}</p>}
                </div>
              </div>
            )}

            {/* Power Stage */}
            <div className="mb-4">
              <h4 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Estágio de Poder</h4>
              <div className="flex gap-1">
                {['dormente', 'despertar', 'base', 'avancado', 'omega'].map(s => (
                  <div key={s} className={`flex-1 py-1 text-center text-[9px] rounded ${character.powerStage === s ? 'bg-white text-black font-bold' : 'bg-gray-900 text-gray-600'}`}>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Techniques */}
            {character.techniques?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Técnicas ({character.techniques.length})</h4>
                <div className="space-y-2">
                  {character.techniques.map((t: any) => (
                    <div key={t.id} className="border border-gray-800 rounded-lg p-2">
                      <div className="flex justify-between">
                        <span className="text-blue-300 text-xs font-semibold">{t.name}</span>
                        <span className="text-gray-600 text-[10px]">{t.energyCost}E</span>
                      </div>
                      <p className="text-gray-400 text-[10px] mt-0.5">{t.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inventory */}
            {character.inventory?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Inventário ({character.inventory.length})</h4>
                <div className="space-y-1">
                  {character.inventory.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center border border-gray-800 rounded px-2 py-1.5">
                      <div>
                        <span className="text-white text-xs">{item.name}</span>
                        {item.quantity > 1 && <span className="text-gray-600 text-[10px] ml-1">×{item.quantity}</span>}
                        {item.description && <p className="text-gray-500 text-[10px]">{item.description}</p>}
                      </div>
                      {item.rarity && <span className={`text-[9px] px-1.5 py-0.5 rounded ${item.rarity === 'lendário' ? 'text-amber-300 bg-amber-900/20' : item.rarity === 'épico' ? 'text-purple-300 bg-purple-900/20' : item.rarity === 'raro' ? 'text-blue-300 bg-blue-900/20' : 'text-gray-500 bg-gray-800'}`}>{item.rarity}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Power History */}
            {character.powerHistory?.length > 0 && (
              <div>
                <h4 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Histórico de Evolução</h4>
                <div className="space-y-1">
                  {character.powerHistory.map((h: string, i: number) => (
                    <p key={i} className="text-[10px] text-gray-400">⚡ {h}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!character.xGene && !character.techniques?.length && !character.inventory?.length && (
              <p className="text-gray-600 text-sm text-center py-8">Nenhum poder ou item ainda.</p>
            )}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block w-72 border-l border-gray-900 overflow-y-auto flex-none">
        <CharacterSheet character={character} gameState={gameState} portrait={portrait} onRegeneratePortrait={() => generatePortrait(character?.appearance || cfgAppearance || character?.name || '', character?.name || '')} onCustomPortrait={(prompt) => generatePortrait(prompt, character?.name || '')} />
      </div>
    </div>
  );
}
