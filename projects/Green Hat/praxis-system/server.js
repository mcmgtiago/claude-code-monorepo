/**
 * PRÁXIS — Backend Server
 * APIs: triagem, agendamento, dashboard, lembretes
 *
 * Stack: Node.js + Express + SQLite (demo)
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import multer from 'multer';
import fs from 'fs';
import 'dotenv/config';
import {
  processMessage,
  getWelcomeMessage,
  validateBookingData,
  checkUrgency,
  getEmergencyResponse
} from './praxis-ai-agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// DATABASE SETUP (SQLite para demo)
// ============================================
const db = new Database(process.env.DATABASE_PATH || './praxis.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS pacientes (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    nome TEXT,
    telefone TEXT,
    email TEXT,
    idade INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS triagens (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    paciente_id TEXT,
    sintoma_principal TEXT,
    tipo_servico TEXT,
    duracao_sintoma TEXT,
    primeira_consulta INTEGER DEFAULT 0,
    exames_recentes INTEGER DEFAULT 0,
    urgencia TEXT DEFAULT 'normal',
    qualificado INTEGER DEFAULT 0,
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
  );

  CREATE TABLE IF NOT EXISTS agendamentos (
    id TEXT PRIMARY KEY,
    paciente_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    tipo_servico TEXT NOT NULL,
    motivo TEXT,
    status TEXT DEFAULT 'agendado', -- agendado, confirmado, realizado, cancelado
    lembrete_24h_enviado INTEGER DEFAULT 0,
    lembrete_1h_enviado INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
  );

  CREATE TABLE IF NOT EXISTS mensagens (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL, -- user, assistant
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    paciente_id TEXT,
    filename TEXT NOT NULL,
    original_name TEXT,
    size INTEGER,
    mime_type TEXT,
    tipo TEXT, -- exame, documento, receita, outro
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_session_id ON mensagens(session_id);
  CREATE INDEX IF NOT EXISTS idx_paciente_session ON pacientes(session_id);
  CREATE INDEX IF NOT EXISTS idx_agendamento_data ON agendamentos(data);
`);

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// File upload config
const upload = multer({
  dest: process.env.UPLOAD_DIR || './uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function getOrCreateSession(sessionId) {
  if (!sessionId) {
    return uuidv4();
  }
  return sessionId;
}

function saveMessage(sessionId, role, content) {
  db.prepare(
    'INSERT INTO mensagens (id, session_id, role, content) VALUES (?, ?, ?, ?)'
  ).run(uuidv4(), sessionId, role, content);
}

function getSessionHistory(sessionId) {
  return db.prepare(
    'SELECT role, content FROM mensagens WHERE session_id = ? ORDER BY created_at ASC LIMIT 20'
  ).all(sessionId);
}

function getOrCreatePaciente(sessionId, dados = {}) {
  let paciente = db.prepare(
    'SELECT * FROM pacientes WHERE session_id = ?'
  ).get(sessionId);

  if (!paciente && dados.nome) {
    const id = uuidv4();
    db.prepare(
      'INSERT INTO pacientes (id, session_id, nome, telefone, email) VALUES (?, ?, ?, ?, ?)'
    ).run(id, sessionId, dados.nome, dados.telefone || null, dados.email || null);
    paciente = { id, session_id: sessionId, nome: dados.nome, telefone: dados.telefone, email: dados.email };
  }

  return paciente;
}

function saveTriagem(sessionId, dados) {
  const id = uuidv4();
  const paciente = getOrCreatePaciente(sessionId, dados);

  db.prepare(`
    INSERT INTO triagens (
      id, session_id, paciente_id, sintoma_principal, tipo_servico,
      duracao_sintoma, primeira_consulta, exames_recentes, urgencia,
      qualificado, observacoes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    sessionId,
    paciente?.id || null,
    dados.sintoma_principal || null,
    dados.tipo_servico || null,
    dados.duracao || null,
    dados.primeira_consulta ? 1 : 0,
    dados.exames_recentes ? 1 : 0,
    dados.urgencia || 'normal',
    dados.qualificado ? 1 : 0,
    dados.observacoes || null
  );

  return id;
}

function saveAgendamento(pacienteId, sessionId, dados) {
  const id = uuidv4();

  db.prepare(`
    INSERT INTO agendamentos (
      id, paciente_id, session_id, data, hora, tipo_servico, motivo, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'agendado')
  `).run(
    id,
    pacienteId,
    sessionId,
    dados.data_preferida,
    dados.hora_preferida,
    dados.tipo_servico,
    dados.motivo_resumido || null
  );

  return id;
}

// ============================================
// API ROUTES
// ============================================

/**
 * POST /api/triagem/welcome
 * Retorna mensagem inicial quando paciente abre chat
 */
app.post('/api/triagem/welcome', async (req, res) => {
  try {
    const sessionId = getOrCreateSession(req.body.sessionId);

    const message = await getWelcomeMessage();
    saveMessage(sessionId, 'assistant', message);

    res.json({
      sessionId,
      message
    });
  } catch (error) {
    console.error('Erro em welcome:', error);
    res.status(500).json({ error: 'Erro ao processar welcome' });
  }
});

/**
 * POST /api/triagem/message
 * Processa mensagem do paciente
 *
 * Body: { sessionId, message }
 */
app.post('/api/triagem/message', async (req, res) => {
  try {
    const { sessionId: providedSessionId, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem não pode estar vazia' });
    }

    const sessionId = getOrCreateSession(providedSessionId);

    // Salvar mensagem do usuário
    saveMessage(sessionId, 'user', message);

    // Checar urgência
    const urgency = checkUrgency(message);

    if (urgency === 'emergency') {
      const emergencyMsg = getEmergencyResponse();
      saveMessage(sessionId, 'assistant', emergencyMsg);
      return res.json({
        sessionId,
        response: emergencyMsg,
        urgency: 'emergency',
        requiresBooking: false
      });
    }

    // Buscar histórico
    const history = getSessionHistory(sessionId);

    // Processar com IA
    const result = await processMessage(sessionId, message, history);

    // Salvar resposta da IA
    saveMessage(sessionId, 'assistant', result.response);

    // Se IA usou tool de agendamento
    let bookingId = null;
    if (result.toolUse && result.toolUse.name === 'agendar_consulta') {
      const bookingData = result.toolUse.input;
      const validation = validateBookingData(bookingData);

      if (validation.valid) {
        const paciente = getOrCreatePaciente(sessionId, {
          nome: bookingData.paciente_nome,
          telefone: bookingData.paciente_telefone,
          email: bookingData.paciente_email
        });

        if (paciente) {
          bookingId = saveAgendamento(paciente.id, sessionId, bookingData);
        }
      }
    }

    res.json({
      sessionId,
      response: result.response,
      toolUse: result.toolUse,
      bookingId,
      urgency,
      usage: result.usage
    });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    res.status(500).json({
      error: 'Erro ao processar mensagem',
      details: error.message
    });
  }
});

/**
 * GET /api/agendamentos
 * Lista agendamentos (para dashboard do médico)
 */
app.get('/api/agendamentos', (req, res) => {
  try {
    const { data, status } = req.query;
    let query = `
      SELECT
        a.id, a.data, a.hora, a.tipo_servico, a.motivo, a.status,
        a.lembrete_24h_enviado, a.lembrete_1h_enviado, a.created_at,
        p.nome as paciente_nome, p.telefone, p.email
      FROM agendamentos a
      LEFT JOIN pacientes p ON a.paciente_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (data) {
      query += ' AND a.data = ?';
      params.push(data);
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.data ASC, a.hora ASC';

    const agendamentos = db.prepare(query).all(...params);

    res.json({ agendamentos });
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao listar agendamentos' });
  }
});

/**
 * GET /api/dashboard/stats
 * Métricas para o médico
 */
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];

    // Total de agendamentos hoje
    const totalHoje = db.prepare(
      'SELECT COUNT(*) as count FROM agendamentos WHERE data = ? AND status != \'cancelado\''
    ).get(hoje);

    // Total de pacientes únicos
    const totalPacientes = db.prepare(
      'SELECT COUNT(*) as count FROM pacientes'
    ).get();

    // Total de triagens (últimos 7 dias)
    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const triagensRecentes = db.prepare(
      'SELECT COUNT(*) as count FROM triagens WHERE created_at >= ?'
    ).get(seteDiasAtras);

    // Taxa de qualificação
    const qualificados = db.prepare(
      'SELECT COUNT(*) as count FROM triagens WHERE qualificado = 1 AND created_at >= ?'
    ).get(seteDiasAtras);

    // Próximos agendamentos (próximas 24h)
    const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const proximos = db.prepare(`
      SELECT
        a.id, a.data, a.hora, a.tipo_servico, a.motivo,
        p.nome as paciente_nome, p.telefone
      FROM agendamentos a
      LEFT JOIN pacientes p ON a.paciente_id = p.id
      WHERE a.data BETWEEN ? AND ?
      AND a.status = 'agendado'
      ORDER BY a.data ASC, a.hora ASC
      LIMIT 10
    `).all(hoje, amanha);

    res.json({
      agendamentos_hoje: totalHoje.count,
      total_pacientes: totalPacientes.count,
      triagens_ultimos_7_dias: triagensRecentes.count,
      taxa_qualificacao: triagensRecentes.count > 0
        ? Math.round((qualificados.count / triagensRecentes.count) * 100)
        : 0,
      proximos_agendamentos: proximos
    });
  } catch (error) {
    console.error('Erro ao buscar stats:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

/**
 * POST /api/upload
 * Upload de exame/documento do paciente
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    const { sessionId, pacienteId, tipo } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO uploads (id, session_id, paciente_id, filename, original_name, size, mime_type, tipo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      sessionId,
      pacienteId || null,
      req.file.filename,
      req.file.originalname,
      req.file.size,
      req.file.mimetype,
      tipo || 'outro'
    );

    res.json({
      id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro no upload' });
  }
});

/**
 * GET /api/triagens/:sessionId
 * Buscar triagens de uma sessão
 */
app.get('/api/triagens/:sessionId', (req, res) => {
  try {
    const triagens = db.prepare(
      'SELECT * FROM triagens WHERE session_id = ? ORDER BY created_at DESC'
    ).all(req.params.sessionId);

    res.json({ triagens });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar triagens' });
  }
});

/**
 * POST /api/lembrete/enviar
 * Marcar lembrete como enviado
 */
app.post('/api/lembrete/enviar', (req, res) => {
  try {
    const { agendamentoId, tipo } = req.body;

    const campo = tipo === '24h_antes' ? 'lembrete_24h_enviado' : 'lembrete_1h_enviado';

    db.prepare(
      `UPDATE agendamentos SET ${campo} = 1 WHERE id = ?`
    ).run(agendamentoId);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao marcar lembrete' });
  }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PRÁXIS',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// FRONTEND ROUTES
// ============================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'demo.html'));
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║  PRÁXIS v1.0 — Server running                  ║
║  http://localhost:${PORT}                          ║
║                                                ║
║  Endpoints:                                    ║
║  POST /api/triagem/welcome    Welcome message  ║
║  POST /api/triagem/message    Process message  ║
║  GET  /api/agendamentos       List bookings    ║
║  GET  /api/dashboard/stats    Dashboard metrics ║
║  POST /api/upload             Upload files     ║
║                                                ║
║  Pages:                                        ║
║  /            Chat demo                        ║
║  /dashboard   Doctor dashboard                ║
║  /demo        Embedded widget                  ║
╚═══════════════════════════════════════════════╝
  `);
});
