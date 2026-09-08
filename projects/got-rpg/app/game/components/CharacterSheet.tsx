'use client';

const ATTR_LABELS: Record<string, string> = {
  forca: 'FOR', destreza: 'DES', resistencia: 'RES', astucia: 'AST',
  comando: 'CMD', seducao: 'SED', percepcao: 'PER', vontade: 'VON',
};

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-1.5">
      <div className="flex justify-between text-xs text-gray-400"><span>{label}</span><span>{value}/{max}</span></div>
      <div className="w-full h-1.5 bg-gray-800 rounded-full"><div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default function CharacterSheet({ character, gameState, portrait, onRegeneratePortrait, onCustomPortrait }: any) {
  if (!character?.name) return <div className="p-4 text-center"><p className="text-gray-600 text-xs mt-8">Ficha aparecerá após criação.</p></div>;

  const mod = (v: number) => { const m = Math.floor((v - 10) / 2); return m >= 0 ? `+${m}` : `${m}`; };
  const honorLabel = (v: number) => v <= -50 ? ['Desonrado', 'text-red-400'] : v <= -10 ? ['Questionável', 'text-orange-400'] : v <= 30 ? ['Neutro', 'text-gray-300'] : v <= 70 ? ['Honorável', 'text-blue-300'] : ['Imaculado', 'text-yellow-300'];
  const [hLabel, hColor] = honorLabel(character.honor);
  const quests = gameState?.quests?.filter((q: any) => q.status === 'active') || [];

  return (
    <div className="p-3 space-y-3 text-xs">
      {portrait && <img src={portrait} className="w-full rounded-lg border border-gray-800" />}

      <div className="text-center border-b border-gray-800 pb-2">
        <h2 className="text-base font-bold text-white">{character.name}</h2>
        <p className="text-gray-400">{character.title || character.house} • Nv{character.level}</p>
        <p className="text-gray-600">{character.era}</p>
      </div>

      <div>
        <Bar label="HP" value={character.hp} max={character.hpMax} color="bg-red-500" />
        <Bar label="Stress" value={character.stress} max={100} color="bg-yellow-500" />
        <div className="flex justify-between text-xs"><span className="text-gray-500">Honra</span><span className={hColor as string}>{hLabel} ({character.honor})</span></div>
        <div className="flex justify-between text-xs mt-1"><span className="text-gray-500">Ouro</span><span className="text-yellow-400">{character.gold} dragões</span></div>
        {character.armies > 0 && <div className="flex justify-between text-xs mt-1"><span className="text-gray-500">Exército</span><span className="text-white">{character.armies} homens</span></div>}
      </div>

      <div>
        <h3 className="text-[9px] text-gray-500 uppercase mb-1">Atributos</h3>
        <div className="grid grid-cols-4 gap-1">
          {Object.entries(character.attributes || {}).map(([k, v]) => (
            <div key={k} className="text-center bg-gray-900 rounded py-0.5">
              <span className="text-gray-600 block" style={{ fontSize: '8px' }}>{ATTR_LABELS[k]}</span>
              <span className="text-white font-bold">{v as number}</span>
            </div>
          ))}
        </div>
      </div>

      {character.magic && (
        <div>
          <h3 className="text-[9px] text-gray-500 uppercase mb-1">Magia</h3>
          <div className="border border-purple-900/30 rounded p-2">
            <p className="text-purple-300 text-xs">{character.magic.description}</p>
          </div>
        </div>
      )}

      {/* Skills */}
      {character.skills?.length > 0 && (
        <div>
          <h3 className="text-[9px] text-gray-500 uppercase mb-1">Habilidades ({character.skills.length})</h3>
          <div className="space-y-1">
            {character.skills.map((s: any) => (
              <div key={s.id} className="flex justify-between items-center bg-gray-900 rounded px-2 py-1">
                <div>
                  <span className="text-white text-[11px]">{s.name}</span>
                  <span className="text-gray-600 text-[9px] ml-1">({s.tree})</span>
                </div>
                <span className="text-[9px] text-gray-600">{'★'.repeat(s.tier)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {character.lands?.length > 0 && <div><span className="text-gray-600 text-[9px]">Terras:</span><p className="text-white text-xs">{character.lands.join(', ')}</p></div>}
      {character.alliances?.length > 0 && <div><span className="text-gray-600 text-[9px]">Aliados:</span><p className="text-green-300 text-xs">{character.alliances.join(', ')}</p></div>}

      {quests.length > 0 && (
        <div>
          <h3 className="text-[9px] text-gray-500 uppercase mb-1">Missões</h3>
          {quests.map((q: any) => <p key={q.id} className="text-yellow-200 text-xs">• {q.title}</p>)}
        </div>
      )}

      <div className="border-t border-gray-800 pt-2 text-gray-500">
        📍 {gameState?.world?.location} • {gameState?.world?.season}, Dia {gameState?.world?.day}
      </div>
    </div>
  );
}
