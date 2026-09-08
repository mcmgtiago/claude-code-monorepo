'use client';

const ATTR_LABELS: Record<string, string> = { reiatsu: 'REI', zanjutsu: 'ZAN', hakuda: 'HAK', hoho: 'HOH', kido: 'KID', percepcao: 'PER', vontade: 'VON', presenca: 'PRE' };
const RACE_LABELS: Record<string, string> = { shinigami: 'Shinigami', hollow: 'Hollow/Arrancar', quincy: 'Quincy', humano: 'Humano/Fullbringer', visored: 'Visored', humano_puro: 'Humano Comum' };

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (<div className="mb-1.5"><div className="flex justify-between text-xs text-gray-400"><span>{label}</span><span>{value}/{max}</span></div><div className="w-full h-1.5 bg-gray-800 rounded-full"><div className={`h-full ${color} rounded-full`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} /></div></div>);
}

export default function CharacterSheet({ character, gameState, portrait }: any) {
  if (!character?.name) return <div className="p-4 text-center"><p className="text-gray-600 text-xs mt-8">Ficha aparecerá após criação.</p></div>;
  const races = (character.hybridRaces?.length ? character.hybridRaces : [character.race]).map((r: string) => RACE_LABELS[r] || r).join(' + ');
  const quests = gameState?.quests?.filter((q: any) => q.status === 'active') || [];

  return (
    <div className="p-3 space-y-3 text-xs">
      {portrait && <img src={portrait} className="w-full rounded-lg border border-gray-800" />}
      <div className="text-center border-b border-gray-800 pb-2">
        <h2 className="text-base font-bold text-white">{character.name}</h2>
        <p className="text-gray-400">{races} • Nv{character.level}</p>
        <p className="text-gray-600">{character.rank || 'sem rank'} • {character.powerStage}</p>
      </div>
      <div>
        <Bar label="HP" value={character.hp} max={character.hpMax} color="bg-red-500" />
        <Bar label="Reiryoku" value={character.reiryoku} max={character.reiryokuMax} color="bg-blue-500" />
        <Bar label="Stress" value={character.stress} max={100} color="bg-yellow-500" />
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
      {character.zanpakuto && (
        <div><h3 className="text-[9px] text-gray-500 uppercase mb-1">Zanpakutō</h3>
          <div className="border border-blue-900/30 rounded p-2">
            <p className="text-blue-300 text-xs font-semibold">{character.zanpakuto.name || 'Selada'}</p>
            <p className="text-gray-400 text-[10px]">{character.zanpakuto.element}</p>
            {character.zanpakuto.shikaiAbility && <p className="text-gray-300 text-[10px]">Shikai: {character.zanpakuto.shikaiAbility}</p>}
            {character.zanpakuto.bankaiName && <p className="text-purple-300 text-[10px]">Bankai: {character.zanpakuto.bankaiName}</p>}
          </div>
        </div>
      )}
      {character.skills?.length > 0 && (
        <div><h3 className="text-[9px] text-gray-500 uppercase mb-1">Skills</h3>
          {character.skills.map((s: any) => (<div key={s.id} className="flex justify-between bg-gray-900 rounded px-2 py-0.5 mb-0.5"><span className="text-white text-[11px]">{s.name}</span><span className="text-gray-600 text-[9px]">{s.tree}</span></div>))}
        </div>
      )}
      {character.transformations?.length > 0 && (
        <div><h3 className="text-[9px] text-gray-500 uppercase mb-1">Evoluções</h3>
          {character.transformations.map((t: string, i: number) => <p key={i} className="text-purple-300/70 text-[10px]">⚡ {t}</p>)}
        </div>
      )}
      {quests.length > 0 && (<div>{quests.map((q: any) => <p key={q.id} className="text-yellow-200 text-xs">• {q.title}</p>)}</div>)}
      <div className="border-t border-gray-800 pt-2 text-gray-500">📍 {gameState?.world?.location} • Dia {gameState?.world?.day}</div>
    </div>
  );
}
