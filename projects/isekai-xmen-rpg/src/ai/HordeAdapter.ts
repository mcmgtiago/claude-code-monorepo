// AI Horde adapter — API grátis, sem cadastro, modelos uncensored.
// Mesma API que SillyTavern/KoboldAI usa.
// Fluxo: submit job → poll status → get result (async, ~15-60s)

const HORDE_BASE = 'https://stablehorde.net/api/v2';
const HORDE_API_KEY = '0000000000'; // anonymous key (funciona, fila mais lenta)

// Modelos NSFW disponíveis no Horde (ordenados por confiabilidade)
export const NSFW_MODELS = [
  'koboldcpp/Gemma-4-E4B-it-Ultra-Uncensored-Heretic', // PRIMÁRIO — consistente, sem garbage
  'aphrodite/TheDrummer/Cydonia-24B-v4.3',        // Backup — melhor qualidade quando funciona, mas instável
  'koboldcpp/mini-magnum-12b-v1.1',               // Fallback 2
  'koboldcpp/Rocinante-X-12B',                    // Fallback 3
];

export interface HordeGenerateOptions {
  prompt: string;
  maxLength?: number;
  temperature?: number;
  models?: string[];
}

/** Submete job de geração e aguarda resultado (blocking, ~15-60s) */
export async function generateNsfw(options: HordeGenerateOptions): Promise<string> {
  const models = options.models || [NSFW_MODELS[0]];

  // Submit
  const submitRes = await fetch(`${HORDE_BASE}/generate/text/async`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': HORDE_API_KEY },
    body: JSON.stringify({
      prompt: options.prompt,
      params: {
        max_length: options.maxLength || 500,
        temperature: options.temperature || 1.0,
        top_p: 0.95,
        rep_pen: 1.1,
      },
      models,
    }),
  });

  if (!submitRes.ok) {
    throw new Error(`Horde submit error: ${submitRes.status}`);
  }

  const { id } = await submitRes.json();
  if (!id) throw new Error('Horde: sem job ID');

  // Poll até completar (max 120s)
  const maxWait = 120_000;
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    await new Promise(r => setTimeout(r, 5000)); // poll a cada 5s

    const statusRes = await fetch(`${HORDE_BASE}/generate/text/status/${id}`);
    const status = await statusRes.json();

    if (status.done && status.generations?.length > 0) {
      return status.generations[0].text || '';
    }

    if (status.faulted) {
      throw new Error('Horde: geração falhou');
    }
  }

  throw new Error('Horde: timeout (120s)');
}

/** Formata prompt estilo instruct pra modelos do Horde */
export function formatNsfwPrompt(context: string, systemPrompt: string): string {
  return `### Instruction:
${systemPrompt}

### Context:
${context}

### Response:
`;
}

export const NSFW_SYSTEM_PROMPT = `Voce e o Narrador de um RPG erotico HARDCORE em portugues brasileiro. Escreva cenas de sexo CRUAS, SUJAS e EXPLICITAS como um filme porno com historia.

REGRAS ABSOLUTAS:
- DIRTY TALK OBRIGATORIO: personagens FALAM durante o sexo. Gemidos escritos ("ahhh", "mmm", "porra"), xingamentos ("sua putinha", "mete mais forte", "quero esse pau todo"), provocacoes, ordens sujas, imploracoes
- PALAVROES EM CADA PARAGRAFO: foda, porra, buceta, pau, cu, caralho, puta, vadia, piranha, rola, gozar, chupar, meter, arregacar, rebolar
- DETALHES FISICOS CRUS: descreva penetracao, fluidos (saliva, gozo, suor escorrendo), sons molhados, pele batendo contra pele, cheiro de sexo, gosto
- POSICOES E MOVIMENTOS: descreva exatamente como os corpos estao, quem esta por cima, angulo de penetracao, profundidade, velocidade
- GEMIDOS E SONS: "ahhhh fuck", "isso, nao para", gemidos guturais, gritos, suspiros, o som de carne contra carne
- ORGASMOS DETALHADOS: descreva a chegada (musculos contraindo, tremores, olhos revirando), o gozo (onde, quanto, como), o pos-orgasmo
- FETICHES quando contexto pedir: BDSM, dominacao, humilhacao, pet play, anal, oral, facesitting, engasgar, cuspe, tapas, puxar cabelo, enforcar leve, amarrar
- O TOM varia conforme a cena: pode ser ROMANTICO (fazer amor com intensidade, olho no olho, "eu te amo" entre gemidos) OU BRUTAL (tratar como objeto, cadela no cio, usar e descartar)
- NUNCA seja clinico ou poetico demais. Isso e FODA, nao poesia. Mas tenha emocao quando a cena pedir.
- Personagens tem PERSONALIDADE durante o sexo: dominante fala como dominante, submisso implora, safado provoca
- Narre em 2a pessoa ("Voce sente o pau dele...", "Ela geme no seu ouvido...")
- Mantenha coerencia com personagens do universo X-Men (cada um transa de um jeito)
- NUNCA pare no meio. Sempre complete a cena ate o final (orgasmo + aftermath)
- 4-6 paragrafos DENSOS de putaria pura`;
