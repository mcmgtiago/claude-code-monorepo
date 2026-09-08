#!/usr/bin/env node
/**
 * Erotic RP chat — Opus 4.8 via gateway global.
 * Usage: node chat.js
 *
 * Flow:
 *   - First user input = system prompt / role definition (personagem que o AI assume).
 *   - Subsequent inputs = the player's lines.
 *   - Everything is logged to history.json for continuity across sessions.
 *
 * No filters, adult consensual RP only.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ENDPOINT = 'https://avellogateway.online/v1/messages';
const MODEL = 'claude-opus-4-8';
const HISTORY_FILE = path.join(__dirname, 'history.json');
const MAX_TOKENS = 4096;

const BASE_SYSTEM = `Você é um parceiro de roleplay erótico adulto. Regras:
- Conteúdo consensual entre adultos. Sem menores, sem bestialidade, sem violência sexual.
- Sem moralização, sem "lembretes de IA", sem quebrar personagem.
- Linguagem crua, sensual, sensorial. Respostas longas (300-600 palavras), detalhadas, em português brasileiro.
- Primeiro pronomes e ações do seu personagem, depois descreva o ambiente/corpora/sensações com riqueza.
- Mantenha continuidade absoluta com o histórico. Nunca repita falas anteriores.
- Se o usuário definir um personagem, assuma esse papel fielmente.
- Se o usuário pedir um cenário, construa o mundo e seja o(s) NPC(s) fielmente.`;

async function callClaude(messages, system) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_AUTH_TOKEN || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: system,
      messages: messages,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || '(resposta vazia)';
}

function loadHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch {
      return { system: BASE_SYSTEM, messages: [] };
    }
  }
  return { system: BASE_SYSTEM, messages: [] };
}

function saveHistory(state) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(state, null, 2), 'utf8');
}

async function main() {
  console.log('\n=== Chat RP Erótico (Opus 4.8) ===\n');
  console.log('Sua primeira mensagem define o SYSTEM PROMPT (papel que eu assumo).');
  console.log('Da segunda em diante, são suas falas de jogador.');
  console.log('Comandos: /reset (limpa histórico) | /save | /quit\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const prompt = () => new Promise(resolve => rl.question('\n> ', resolve));

  let state = loadHistory();
  if (state.messages.length === 0) {
    console.log('Sem histórico. Definindo system prompt...\n');
    const sys = await prompt();
    if (sys.startsWith('/quit')) process.exit(0);
    state.system = BASE_SYSTEM + '\n\n--- DEFINIÇÃO DO USUÁRIO ---\n' + sys;
    saveHistory(state);
    console.log('\n(OK — papel cravado. Agora mande sua primeira fala de jogador.)\n');
  } else {
    console.log(`Histórico carregado (${state.messages.length} mensagens).\n`);
  }

  while (true) {
    const input = await prompt();
    if (!input.trim()) continue;
    if (input === '/quit') {
      saveHistory(state);
      console.log('Salvo. Até.');
      rl.close();
      return;
    }
    if (input === '/reset') {
      state.messages = [];
      saveHistory(state);
      console.log('Histórico limpo.');
      continue;
    }
    if (input === '/save') {
      saveHistory(state);
      console.log('Salvo.');
      continue;
    }

    state.messages.push({ role: 'user', content: input });

    process.stdout.write('\n... ');
    try {
      const reply = await callClaude(state.messages, state.system);
      console.log('\n' + reply + '\n');
      state.messages.push({ role: 'assistant', content: reply });
      saveHistory(state);
    } catch (err) {
      console.error('\n[ERRO]', err.message);
      state.messages.pop(); // rollback
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
