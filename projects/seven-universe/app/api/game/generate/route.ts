import Anthropic from '@anthropic-ai/sdk';
import { getUniverse } from '@/src/universes';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN,
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
  defaultHeaders: { 'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN}` },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, sex, powerType, tier, universeId, style } = body;
    const uni = getUniverse(universeId || 'xmen');

    if (type === 'character') {
      const generoC = sex === 'feminino' ? 'FEMININO (mulher)' : 'MASCULINO (homem)';
      const isRealWorldC = ['reallife', 'fightnight', 'wrestling', 'basquete', 'beisebol'].includes(uni?.id || '');
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6-20250514', max_tokens: 500, temperature: 1.0,
        system: `Gere personagens para RPG de ${uni?.name}. Responda APENAS JSON válido. TODOS os campos (nome, aparência, personalidade, background) DEVEM ser coerentes com o sexo ${generoC}.`,
        messages: [{ role: 'user', content: `Gere personagem ${generoC} de ${uni?.name}. Tipo: ${powerType || 'padrão'}. Contexto: ${uni?.systemPromptLore?.slice(0, 300)}
O nome, corpo, roupas, papéis sociais e história devem refletir o sexo ${generoC}.
JSON: {"name":"nome ${sex === 'feminino' ? 'feminino' : 'masculino'} apropriado ao universo","age":numero,"personality":"2 frases coerentes com o gênero","appearance":"rosto, cabelo, olhos, corpo, ${sex === 'feminino' ? 'maquiagem, ' : ''}roupas, acessórios detalhados","power":"${uni?.hasPowerGenerator ? 'poder/habilidade com nome e descrição' : 'nenhum'}","background":"${isRealWorldC ? '1 frase de história de vida neste mundo' : '1 frase de história pré-transporte'}"}` }],
      });
      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return NextResponse.json(JSON.parse(match[0]));
      return NextResponse.json({ error: 'Falha' }, { status: 500 });
    }

    if (type === 'powers') {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6-20250514', max_tokens: 400, temperature: 1.0,
        system: `Crie poderes/habilidades para ${uni?.name}. Responda APENAS JSON array.`,
        messages: [{ role: 'user', content: `Crie 4 poderes de ${uni?.name} baseados em: "${style}". JSON: [{"name":"Nome","description":"o que faz em 1 frase"},...]` }],
      });
      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const match = text.match(/\[[\s\S]*\]/);
      if (match) return NextResponse.json(JSON.parse(match[0]));
      return NextResponse.json({ error: 'Falha' }, { status: 500 });
    }

    // Gerar um campo individual (nome, idade, personalidade, aparencia, poder, background)
    if (type === 'field') {
      const { field, sex, context } = body;
      const genero = sex === 'feminino' ? 'feminino (mulher)' : 'masculino (homem)';
      const pronome = sex === 'feminino' ? 'ela' : 'ele';
      // Universos de mundo real não são isekai — background é a vida NESTE mundo, não "antes do transporte".
      const isRealWorld = ['reallife', 'fightnight', 'wrestling', 'basquete', 'beisebol'].includes(uni?.id || '');
      // Contexto = campos que o jogador já preencheu. Mantém coerência entre nome/personalidade/aparência/background.
      const ctx = context ? `\n\n${context}\nUse ESTES dados como verdade absoluta — o que você gerar deve combinar perfeitamente com eles (mesma pessoa).` : '';
      const backgroundInstr = isRealWorld
        ? `Crie um background/história de vida DETALHADO (4-6 frases) para um personagem ${genero} de ${uni?.name}. Como ${pronome} chegou onde está, origem, drama pessoal, o que ${pronome} faz. Coerente com o mundo (${uni?.systemPromptLore?.slice(0, 200)}). A história DEVE refletir o gênero ${genero}.${ctx} Responda só a história.`
        : `Crie um background/história de vida DETALHADO (4-6 frases) de quem o personagem ${genero} era ANTES de chegar a ${uni?.name}. Vida no nosso mundo (2026): profissão, origem, drama, relacionamentos, o que ${pronome} fazia. A história DEVE refletir o gênero ${genero} (nome, relações, papéis coerentes).${ctx} Responda só a história.`;
      const fieldPrompts: Record<string, { instr: string; tokens: number }> = {
        name: { instr: `Gere APENAS um nome ${sex === 'feminino' ? 'feminino' : 'masculino'} apropriado ao universo ${uni?.name}. Responda SÓ o nome, nada mais.`, tokens: 20 },
        age: { instr: `Gere APENAS uma idade (número) apropriada para um protagonista. Responda SÓ o número.`, tokens: 10 },
        personality: { instr: `Crie uma personalidade rica e detalhada (3-4 frases) para um personagem ${genero} de ${uni?.name}. Temperamento, traços, contradições, jeito de agir, coerente com o gênero ${genero} e com o tom do mundo.${ctx} Responda só a descrição.`, tokens: 300 },
        appearance: { instr: `Crie uma aparência física DETALHADA (5-7 frases) para um personagem ${genero} de ${uni?.name}. Descreva: rosto (formato, olhos, lábios, pele, marcas), cabelo (cor, comprimento, estilo), corpo (altura, compleição, postura), ${sex === 'feminino' ? 'maquiagem (se houver: batom, olhos, unhas), ' : ''}roupas (material, cor, estilo), acessórios (joias, cintos, óculos), calçado e expressão/aura. Coerente com o gênero ${genero} e o mundo. Rico em detalhes visuais.${ctx} Responda só a descrição.`, tokens: 450 },
        power: { instr: `Crie um poder/habilidade criativo e detalhado (3-4 frases) para ${uni?.name}. Nome do poder + o que faz + limitação. Contexto do mundo: ${uni?.systemPromptLore?.slice(0, 200)}.${ctx} Responda só a descrição.`, tokens: 300 },
        background: { instr: backgroundInstr, tokens: 450 },
      };
      const fp = fieldPrompts[field];
      if (!fp) return NextResponse.json({ error: 'Campo inválido' }, { status: 400 });
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6-20250514', max_tokens: fp.tokens, temperature: 1.0,
        system: 'Você gera conteúdo criativo para RPG. Responda APENAS o pedido, sem preâmbulo, sem aspas, sem markdown.',
        messages: [{ role: 'user', content: fp.instr }],
      });
      const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
      return NextResponse.json({ value: text });
    }

    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}
