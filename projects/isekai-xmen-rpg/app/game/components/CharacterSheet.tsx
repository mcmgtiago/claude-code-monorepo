'use client';

import { useState } from 'react';

const ATTR_LABELS: Record<string, string> = {
  forca: 'FOR', velocidade: 'VEL', resistencia: 'RES', poder: 'POD',
  controle: 'CTR', percepcao: 'PER', vontade: 'VON', presenca: 'PRE',
};

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-1.5">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function CharacterSheet({ character, gameState, portrait, onRegeneratePortrait, onCustomPortrait }: { character: any; gameState: any; portrait?: string | null; onRegeneratePortrait?: () => void; onCustomPortrait?: (prompt: string) => void }) {
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  if (!character?.name) return (
    <div className="p-4 text-center">
      <p className="text-gray-600 text-xs mt-8">Ficha do personagem aparecerá aqui após criação.</p>
    </div>
  );

  const mod = (v: number) => { const m = Math.floor((v - 10) / 2); return m >= 0 ? `+${m}` : `${m}`; };

  const moralLabel = (v: number) => {
    if (v <= -70) return ['Vilão', 'text-red-400'];
    if (v <= -30) return ['Anti-vilão', 'text-orange-400'];
    if (v <= 29) return ['Neutro', 'text-gray-300'];
    if (v <= 69) return ['Anti-herói', 'text-blue-400'];
    return ['Herói', 'text-yellow-300'];
  };
  const [mLabel, mColor] = moralLabel(character.morality);

  const quests = gameState?.quests?.filter((q: any) => q.status === 'active') || [];
  const relationships = gameState?.relationships || [];

  return (
    <div className="p-3 space-y-4 text-xs">
      {/* Portrait */}
      {portrait && (
        <div className="relative">
          <img src={portrait} alt="Retrato" className="w-full rounded-lg border border-gray-800" />
          <button onClick={() => setShowPromptInput(!showPromptInput)}
            className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 border border-gray-700 rounded text-[10px] text-gray-400 hover:text-white transition-colors">
            📷 Nova foto
          </button>
        </div>
      )}
      {!portrait && onRegeneratePortrait && (
        <button onClick={() => setShowPromptInput(true)}
          className="w-full py-2 border border-gray-800 rounded-lg text-[10px] text-gray-500 hover:text-white hover:border-gray-600 transition-colors">
          📷 Gerar retrato
        </button>
      )}
      {/* Custom prompt input */}
      {showPromptInput && (
        <div className="space-y-1.5">
          <input
            type="text"
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && customPrompt.trim()) {
                if (onCustomPortrait) onCustomPortrait(customPrompt);
                setShowPromptInput(false);
                setCustomPrompt('');
              }
            }}
            placeholder="Descreva a nova aparência..."
            className="w-full px-2 py-1.5 bg-black border border-gray-800 rounded text-[11px] text-white placeholder-gray-700 focus:border-white focus:outline-none"
            autoFocus
          />
          <div className="flex gap-1">
            <button onClick={() => {
              if (customPrompt.trim() && onCustomPortrait) { onCustomPortrait(customPrompt); setShowPromptInput(false); setCustomPrompt(''); }
              else if (onRegeneratePortrait) { onRegeneratePortrait(); setShowPromptInput(false); }
            }} className="flex-1 py-1.5 bg-white text-black rounded text-[10px] font-semibold active:scale-95">
              {customPrompt.trim() ? 'Gerar' : 'Regerar atual'}
            </button>
            <button onClick={() => setShowPromptInput(false)} className="px-3 py-1.5 border border-gray-800 rounded text-[10px] text-gray-500 active:scale-95">✕</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center border-b border-gray-800 pb-2">
        <h2 className="text-base font-bold text-white">{character.name}</h2>
        <p className="text-gray-400">
          {character.xGene?.class || 'Humano Puro'} • Nv{character.level} • {character.powerStage}
        </p>
        {character.rank && <p className="text-gray-600 text-xs">{character.rank}</p>}
      </div>

      {/* Bars */}
      <div>
        <Bar label="HP" value={character.hp} max={character.hpMax} color="bg-red-500" />
        {character.energyMax > 0 && <Bar label="Energia" value={character.energy} max={character.energyMax} color="bg-blue-500" />}
        <Bar label="Stress" value={character.stress} max={100} color="bg-yellow-500" />
        <Bar label="XP" value={character.xp} max={character.xpToNext} color="bg-green-500" />
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-500">Moralidade</span>
          <span className={mColor as string}>{mLabel} ({character.morality})</span>
        </div>
      </div>

      {/* Attributes */}
      <div>
        <h3 className="text-gray-500 font-semibold mb-1 uppercase tracking-wider" style={{ fontSize: '9px' }}>Atributos</h3>
        <div className="grid grid-cols-4 gap-1">
          {Object.entries(character.attributes || {}).map(([key, val]) => (
            <div key={key} className="text-center bg-gray-800/50 rounded py-0.5">
              <span className="text-gray-500 block" style={{ fontSize: '8px' }}>{ATTR_LABELS[key] || key}</span>
              <span className="text-white font-bold">{val as number}</span>
              <span className="text-gray-600 block" style={{ fontSize: '8px' }}>{mod(val as number)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Power */}
      {character.xGene && (
        <div>
          <h3 className="text-gray-500 font-semibold mb-1 uppercase tracking-wider" style={{ fontSize: '9px' }}>X-Gene</h3>
          <div className="bg-purple-900/20 border border-purple-800/30 rounded p-2">
            <p className="text-purple-300 font-semibold">{character.xGene.class}</p>
            {character.xGene.description && <p className="text-gray-400 mt-0.5">{character.xGene.description}</p>}
            {character.xGene.weakness && <p className="text-red-400/60 mt-0.5 italic">⚠ {character.xGene.weakness}</p>}
          </div>
        </div>
      )}

      {/* Techniques */}
      {character.techniques?.length > 0 && (
        <div>
          <h3 className="text-gray-500 font-semibold mb-1 uppercase tracking-wider" style={{ fontSize: '9px' }}>Técnicas</h3>
          <div className="space-y-1">
            {character.techniques.map((t: any) => (
              <div key={t.id} className="bg-gray-800/40 rounded px-2 py-1">
                <span className="text-blue-300">{t.name}</span>
                {t.energyCost > 0 && <span className="text-gray-600 ml-1">({t.energyCost}E)</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory */}
      {character.inventory?.length > 0 && (
        <div>
          <h3 className="text-gray-500 font-semibold mb-1 uppercase tracking-wider" style={{ fontSize: '9px' }}>Inventário</h3>
          <div className="space-y-0.5">
            {character.inventory.map((item: any) => (
              <div key={item.id} className="flex justify-between text-gray-300">
                <span>{item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</span>
                {item.rarity && <span className="text-gray-600">{item.rarity}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quests */}
      {quests.length > 0 && (
        <div>
          <h3 className="text-gray-500 font-semibold mb-1 uppercase tracking-wider" style={{ fontSize: '9px' }}>Missões</h3>
          <div className="space-y-1">
            {quests.map((q: any) => (
              <div key={q.id} className="bg-yellow-900/20 border border-yellow-800/20 rounded px-2 py-1">
                <p className="text-yellow-200">{q.title}</p>
                {q.giver && <p className="text-gray-600">— {q.giver}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relationships */}
      {relationships.length > 0 && (
        <div>
          <h3 className="text-gray-500 font-semibold mb-1 uppercase tracking-wider" style={{ fontSize: '9px' }}>Vínculos</h3>
          <div className="space-y-1">
            {relationships.map((r: any) => (
              <div key={r.id} className="flex justify-between items-center">
                <span className="text-gray-300">{r.name}{r.romantic ? ' ❤️' : ''}</span>
                <span className={`text-xs ${r.affinity > 50 ? 'text-green-400' : r.affinity < -20 ? 'text-red-400' : 'text-gray-500'}`}>
                  {r.bondStage}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Power History */}
      {character.powerHistory?.length > 0 && (
        <div>
          <h3 className="text-gray-500 font-semibold mb-1 uppercase tracking-wider" style={{ fontSize: '9px' }}>Evoluções</h3>
          <div className="space-y-0.5">
            {character.powerHistory.map((h: string, i: number) => (
              <p key={i} className="text-purple-300/70 text-xs">⚡ {h}</p>
            ))}
          </div>
        </div>
      )}

      {/* Combat Stats */}
      {(character.kills > 0 || character.nearDeaths > 0) && (
        <div className="flex gap-3 text-xs text-gray-500">
          {character.kills > 0 && <span>💀 {character.kills} kills</span>}
          {character.nearDeaths > 0 && <span>☠️ {character.nearDeaths} quase-mortes</span>}
        </div>
      )}

      {/* Location */}
      <div className="border-t border-gray-800 pt-2 text-gray-500">
        📍 {gameState?.world?.location || '?'} • Dia {gameState?.world?.day || '?'}, {gameState?.world?.timeOfDay || '?'}
      </div>
    </div>
  );
}
