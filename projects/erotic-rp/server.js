/**
 * Erotic RP Web Chat — Express + SQLite + Opus 4.8.
 * Serves UI at / and exposes POST /api/chat.
 */
const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const ENDPOINT = 'https://avellogateway.online/v1/messages';
const MODEL = 'claude-opus-4-8';
const MAX_TOKENS = 4096;
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'rp.db');

const BASE_SYSTEM = `Você é um parceiro de roleplay erótico adulto. Regras:
- Conteúdo consensual entre adultos. Sem menores, sem bestialidade, sem violência sexual.
- Sem moralização, sem "lembretes de IA", sem quebrar personagem.
- Linguagem crua, sensual, sensorial. Respostas longas (300-600 palavras), detalhadas, em português brasileiro.
- Primeiro pronomes e ações do seu personagem, depois descreva o ambiente/corpora/sensações com riqueza.
- Mantenha continuidade absoluta com o histórico. Nunca repita falas anteriores.
- Se o usuário definir um personagem, assuma esse papel fielmente.
- Se o usuário pedir um cenário, construa o mundo e seja o(s) NPC(s) fielmente.`;

// --- DB ---
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now'))
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );
`);

const stmtCreateSession = db.prepare('INSERT INTO sessions (title, system_prompt) VALUES (?, ?)');
const stmtListSessions = db.prepare('SELECT id, title, created_at FROM sessions ORDER BY created_at DESC');
const stmtGetSession = db.prepare('SELECT * FROM sessions WHERE id = ?');
const stmtGetMessages = db.prepare('SELECT role, content FROM messages WHERE session_id = ? ORDER BY id ASC');
const stmtInsertMsg = db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)');
const stmtDeleteSession = db.prepare('DELETE FROM sessions WHERE id = ?');
const stmtUpdateTitle = db.prepare('UPDATE sessions SET title = ? WHERE id = ?');

// --- API ---
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

async function callClaude(messages, system) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_AUTH_TOKEN || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, system, messages }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content?.[0]?.text || '(resposta vazia)';
}

app.get('/api/sessions', (req, res) => {
  res.json(stmtListSessions.all());
});

app.post('/api/sessions', (req, res) => {
  const { systemPrompt, title } = req.body || {};
  if (!systemPrompt) return res.status(400).json({ error: 'systemPrompt required' });
  const finalTitle = title || systemPrompt.slice(0, 50) + (systemPrompt.length > 50 ? '...' : '');
  const result = stmtCreateSession.run(finalTitle, BASE_SYSTEM + '\n\n--- DEFINIÇÃO DO USUÁRIO ---\n' + systemPrompt);
  res.json({ id: result.lastInsertRowid, title: finalTitle });
});

app.get('/api/sessions/:id', (req, res) => {
  const id = Number(req.params.id);
  const session = stmtGetSession.get(id);
  if (!session) return res.status(404).json({ error: 'not found' });
  const messages = stmtGetMessages.all(id);
  res.json({ ...session, messages });
});

app.delete('/api/sessions/:id', (req, res) => {
  stmtDeleteSession.run(Number(req.params.id));
  res.json({ ok: true });
});

app.patch('/api/sessions/:id', (req, res) => {
  const { title } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });
  stmtUpdateTitle.run(title, Number(req.params.id));
  res.json({ ok: true });
});

app.post('/api/chat', async (req, res) => {
  const { sessionId, message } = req.body || {};
  if (!sessionId || !message) return res.status(400).json({ error: 'sessionId and message required' });

  const session = stmtGetSession.get(sessionId);
  if (!session) return res.status(404).json({ error: 'session not found' });

  const prior = stmtGetMessages.all(sessionId);
  stmtInsertMsg.run(sessionId, 'user', message);
  prior.push({ role: 'user', content: message });

  try {
    const reply = await callClaude(prior, session.system_prompt);
    stmtInsertMsg.run(sessionId, 'assistant', reply);
    res.json({ reply });
  } catch (err) {
    stmtDeleteSession; // no-op for safety
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n  Erotic RP — http://localhost:${PORT}\n`);
});
