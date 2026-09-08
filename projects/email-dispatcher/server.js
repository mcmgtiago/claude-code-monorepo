const fs = require("node:fs");
const fsp = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = __dirname;
const APP_DIR = path.join(ROOT, "opendesign", "mockups", "email-outreach");
const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "app-data.json");
const ENV_FILE = path.join(ROOT, ".env");
const MAX_BODY_SIZE = 1_000_000;

loadEnvironmentFile(ENV_FILE);

const DEFAULT_SETTINGS = Object.freeze({
  senderName: "",
  senderEmail: "",
  replyTo: "",
  companyName: ""
});

const DEFAULT_TEMPLATES = Object.freeze([
  {
    id: "abertura-direta",
    title: "Abordagem direta",
    category: "Introdução",
    subject: "Uma pergunta rápida sobre [seu serviço]",
    preview: "Uma abordagem objetiva para [resultado desejado].",
    body: `Olá,

Estou entrando em contato porque trabalho com [seu serviço] para ajudar empresas a [resultado desejado].

Não sei se este tema está no radar agora, mas posso enviar um resumo curto de como a abordagem funciona.

Faz sentido conversar?

Atenciosamente,
{{remetente}}

Se preferir não receber novos contatos, responda a este e-mail com "remover".`
  },
  {
    id: "problema-recorrente",
    title: "Problema recorrente",
    category: "Dor operacional",
    subject: "Uma ideia para reduzir [problema]",
    preview: "Uma pergunta simples antes de enviar mais detalhes.",
    body: `Olá,

Muitas equipes ainda perdem tempo com [problema]. É um ponto em que [seu serviço] pode ajudar de forma prática.

Antes de enviar qualquer material, queria entender se melhorar esse processo é uma prioridade para vocês neste momento.

Se fizer sentido, preparo um exemplo curto para avaliar.

Atenciosamente,
{{remetente}}

Se preferir não receber novos contatos, responda a este e-mail com "remover".`
  },
  {
    id: "diagnostico-curto",
    title: "Diagnóstico curto",
    category: "Valor inicial",
    subject: "Posso enviar um diagnóstico simples?",
    preview: "Uma forma objetiva de avaliar [tema] antes de decidir.",
    body: `Olá,

Tenho uma sugestão simples para analisar [tema] sem transformar isso em um projeto grande desde o início.

Posso enviar um diagnóstico de uma página com os principais pontos que normalmente avaliamos em empresas desse perfil?

Se não for a pessoa certa para esse assunto, agradeço se puder me indicar o contato adequado.

Atenciosamente,
{{remetente}}

Se preferir não receber novos contatos, responda a este e-mail com "remover".`
  },
  {
    id: "prioridade-atual",
    title: "Prioridade atual",
    category: "Checagem de contexto",
    subject: "Vale olhar para [tema] agora?",
    preview: "Quero confirmar se o assunto é relevante antes de insistir.",
    body: `Olá,

Estou avaliando se [tema] é uma prioridade para a sua empresa neste trimestre.

Se for um assunto ativo, posso compartilhar uma visão direta de como [seu serviço] apoia esse tipo de objetivo. Se não for o momento, encerro por aqui sem problema.

Há alguém com quem eu deveria falar?

Atenciosamente,
{{remetente}}

Se preferir não receber novos contatos, responda a este e-mail com "remover".`
  },
  {
    id: "encerramento-respeitoso",
    title: "Encerramento respeitoso",
    category: "Último contato",
    subject: "Posso encerrar este assunto?",
    preview: "Uma última checagem, sem insistência.",
    body: `Olá,

Não quero ocupar sua caixa de entrada sem necessidade.

Se [tema] não for relevante neste momento, posso encerrar este assunto. Caso seja útil receber um resumo sobre [seu serviço], basta responder a esta mensagem e envio as informações certas.

Obrigado pelo tempo.

Atenciosamente,
{{remetente}}

Se preferir não receber novos contatos, responda a este e-mail com "remover".`
  }
]);

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function loadEnvironmentFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const entries = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of entries) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match || process.env[match[1]]) {
      continue;
    }

    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function initialState() {
  return {
    contacts: [],
    templates: DEFAULT_TEMPLATES.map((template) => ({ ...template })),
    history: [],
    settings: { ...DEFAULT_SETTINGS }
  };
}

function normalizeState(value) {
  const fallback = initialState();
  const state = value && typeof value === "object" ? value : {};
  const savedTemplates = Array.isArray(state.templates) ? state.templates : [];
  const templates = DEFAULT_TEMPLATES.map((defaultTemplate) => {
    const saved = savedTemplates.find((template) => template && template.id === defaultTemplate.id);
    return saved ? { ...defaultTemplate, ...saved } : { ...defaultTemplate };
  });

  return {
    contacts: Array.isArray(state.contacts) ? state.contacts.filter(isContactRecord) : fallback.contacts,
    templates,
    history: Array.isArray(state.history) ? state.history.slice(0, 150) : fallback.history,
    settings: { ...DEFAULT_SETTINGS, ...(state.settings || {}) }
  };
}

function isContactRecord(contact) {
  return Boolean(contact && typeof contact.id === "string" && isValidEmail(contact.email));
}

async function readState() {
  await fsp.mkdir(DATA_DIR, { recursive: true });

  if (!fs.existsSync(DATA_FILE)) {
    const state = initialState();
    await writeState(state);
    return state;
  }

  try {
    const raw = await fsp.readFile(DATA_FILE, "utf8");
    return normalizeState(JSON.parse(raw));
  } catch (error) {
    console.error("Não foi possível ler os dados locais. Um estado novo será usado.", error.message);
    return initialState();
  }
}

async function writeState(state) {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  const temporaryFile = `${DATA_FILE}.${process.pid}.tmp`;
  await fsp.writeFile(temporaryFile, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await fsp.rename(temporaryFile, DATA_FILE);
}

function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function asText(value, maxLength, fieldName) {
  if (typeof value !== "string") {
    throw new HttpError(400, `${fieldName} precisa ser um texto.`);
  }

  const text = value.trim();
  if (text.length > maxLength) {
    throw new HttpError(400, `${fieldName} excede o limite de ${maxLength} caracteres.`);
  }
  return text;
}

function parseCsv(input) {
  const cleanInput = String(input || "").replace(/^\uFEFF/, "");
  const firstLine = cleanInput.split(/\r?\n/, 1)[0] || "";
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  const delimiter = semicolons > commas ? ";" : ",";
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < cleanInput.length; index += 1) {
    const character = cleanInput[index];
    const nextCharacter = cleanInput[index + 1];

    if (quoted) {
      if (character === '"' && nextCharacter === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
      continue;
    }

    if (character === '"' && cell.length === 0) {
      quoted = true;
    } else if (character === delimiter) {
      row.push(cell.trim());
      cell = "";
    } else if (character === "\n") {
      row.push(cell.trim());
      if (row.some((item) => item.length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = "";
    } else if (character !== "\r") {
      cell += character;
    }
  }

  row.push(cell.trim());
  if (row.some((item) => item.length > 0)) {
    rows.push(row);
  }
  return rows;
}

function normalizeHeader(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function findEmailColumn(headers) {
  const acceptedHeaders = new Set([
    "email",
    "emailaddress",
    "enderecoemail",
    "enderecodeemail",
    "correioeletronico"
  ]);
  return headers.findIndex((header) => acceptedHeaders.has(normalizeHeader(header)));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function replacePlaceholders(value, settings, contact) {
  const sender = settings.senderName || settings.companyName || "[seu nome]";
  return String(value)
    .replace(/\{\{remetente\}\}/g, sender)
    .replace(/\{\{empresa_remetente\}\}/g, settings.companyName || "[sua empresa]")
    .replace(/\{\{email\}\}/g, contact.email);
}

function makeEmailHtml(template, settings, contact) {
  const preview = replacePlaceholders(template.preview, settings, contact);
  const body = replacePlaceholders(template.body, settings, contact);
  const paragraphs = escapeHtml(body)
    .split(/(?:\r?\n){2,}/)
    .map((paragraph) => `<p style="margin:0 0 18px;">${paragraph.replace(/\r?\n/g, "<br>")}</p>`)
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#f5f7fa;color:#172033;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preview)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #dce3ed;">
            <tr>
              <td style="padding:36px 32px;font-size:16px;line-height:1.6;">${paragraphs}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function publicState(state) {
  const senderConfigured = Boolean(state.settings.senderName && state.settings.senderEmail);
  const mailConfigured = Boolean(process.env.RESEND_API_KEY);
  return {
    ...state,
    config: {
      provider: "Resend",
      senderConfigured,
      mailConfigured,
      ready: senderConfigured && mailConfigured
    }
  };
}

async function readJsonBody(request) {
  const parts = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_SIZE) {
      throw new HttpError(413, "O conteúdo enviado é grande demais.");
    }
    parts.push(chunk);
  }

  if (parts.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(parts).toString("utf8"));
  } catch {
    throw new HttpError(400, "O conteúdo enviado não é um JSON válido.");
  }
}

function sendJson(response, statusCode, data) {
  const body = JSON.stringify(data);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(body);
}

function sendError(response, error) {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message = error instanceof HttpError ? error.message : "Ocorreu um erro inesperado.";
  sendJson(response, statusCode, { error: message });
}

function formatFrom(settings) {
  const name = (settings.senderName || settings.companyName || "Equipe").replace(/[<>"\r\n]/g, "").trim();
  return `${name} <${settings.senderEmail}>`;
}

async function sendWithResend(template, settings, contact) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  const replyTo = settings.replyTo || settings.senderEmail;
  const message = {
    from: formatFrom(settings),
    to: [contact.email],
    subject: replacePlaceholders(template.subject, settings, contact),
    html: makeEmailHtml(template, settings, contact),
    text: replacePlaceholders(template.body, settings, contact),
    reply_to: replyTo,
    headers: {
      "List-Unsubscribe": `<mailto:${replyTo}?subject=remover>`
    }
  };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message),
      signal: controller.signal
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new HttpError(502, payload.message || "O Resend recusou o envio. Verifique a chave e o domínio remetente.");
    }

    return payload;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    const message = error.name === "AbortError"
      ? "O envio demorou demais. Verifique a conexão e tente novamente."
      : "Não foi possível conectar ao Resend para enviar este e-mail.";
    throw new HttpError(502, message);
  } finally {
    clearTimeout(timeout);
  }
}

function addHistory(state, entry) {
  state.history.unshift({ id: crypto.randomUUID(), ...entry });
  state.history = state.history.slice(0, 150);
}

async function handleApi(request, response, url) {
  const { pathname } = url;

  if (request.method === "GET" && pathname === "/api/state") {
    const state = await readState();
    sendJson(response, 200, publicState(state));
    return;
  }

  if (request.method === "GET" && pathname === "/api/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "POST" && pathname === "/api/contacts") {
    const body = await readJsonBody(request);
    const email = normalizeEmail(body.email);
    if (!isValidEmail(email)) {
      throw new HttpError(400, "Informe um e-mail válido.");
    }

    const state = await readState();
    if (state.contacts.some((contact) => contact.email === email)) {
      throw new HttpError(409, "Esse e-mail já está cadastrado.");
    }

    const contact = {
      id: crypto.randomUUID(),
      email,
      optedOut: false,
      createdAt: new Date().toISOString()
    };
    state.contacts.unshift(contact);
    await writeState(state);
    sendJson(response, 201, { contact });
    return;
  }

  if (request.method === "POST" && pathname === "/api/contacts/import") {
    const body = await readJsonBody(request);
    if (typeof body.csv !== "string") {
      throw new HttpError(400, "Envie o conteúdo da planilha CSV.");
    }

    const rows = parseCsv(body.csv);
    if (rows.length < 2) {
      throw new HttpError(400, "A planilha precisa ter um cabeçalho e ao menos um e-mail.");
    }

    const emailColumn = findEmailColumn(rows[0]);
    if (emailColumn === -1) {
      throw new HttpError(400, "Não encontrei uma coluna de e-mail. Use o cabeçalho email ou e-mail.");
    }

    const state = await readState();
    const knownEmails = new Set(state.contacts.map((contact) => contact.email));
    let imported = 0;
    let duplicates = 0;
    let invalid = 0;

    for (const row of rows.slice(1)) {
      const email = normalizeEmail(row[emailColumn]);
      if (!email) {
        continue;
      }
      if (!isValidEmail(email)) {
        invalid += 1;
      } else if (knownEmails.has(email)) {
        duplicates += 1;
      } else {
        state.contacts.unshift({
          id: crypto.randomUUID(),
          email,
          optedOut: false,
          createdAt: new Date().toISOString()
        });
        knownEmails.add(email);
        imported += 1;
      }
    }

    if (imported > 0) {
      await writeState(state);
    }
    sendJson(response, 200, { imported, duplicates, invalid });
    return;
  }

  const contactMatch = pathname.match(/^\/api\/contacts\/([a-z0-9-]+)$/i);
  if (contactMatch && request.method === "PATCH") {
    const body = await readJsonBody(request);
    if (typeof body.optedOut !== "boolean") {
      throw new HttpError(400, "Informe o novo status do contato.");
    }

    const state = await readState();
    const contact = state.contacts.find((item) => item.id === contactMatch[1]);
    if (!contact) {
      throw new HttpError(404, "Contato não encontrado.");
    }
    contact.optedOut = body.optedOut;
    await writeState(state);
    sendJson(response, 200, { contact });
    return;
  }

  if (request.method === "PUT" && pathname === "/api/settings") {
    const body = await readJsonBody(request);
    const senderName = asText(body.senderName || "", 100, "Nome do remetente");
    const senderEmail = normalizeEmail(body.senderEmail);
    const replyTo = normalizeEmail(body.replyTo);
    const companyName = asText(body.companyName || "", 100, "Nome da empresa");

    if (senderEmail && !isValidEmail(senderEmail)) {
      throw new HttpError(400, "Informe um e-mail remetente válido.");
    }
    if (replyTo && !isValidEmail(replyTo)) {
      throw new HttpError(400, "Informe um e-mail de resposta válido.");
    }

    const state = await readState();
    state.settings = { senderName, senderEmail, replyTo, companyName };
    await writeState(state);
    sendJson(response, 200, { settings: state.settings });
    return;
  }

  const resetTemplateMatch = pathname.match(/^\/api\/templates\/([a-z0-9-]+)\/reset$/i);
  if (resetTemplateMatch && request.method === "POST") {
    const original = DEFAULT_TEMPLATES.find((template) => template.id === resetTemplateMatch[1]);
    if (!original) {
      throw new HttpError(404, "Modelo não encontrado.");
    }

    const state = await readState();
    const index = state.templates.findIndex((template) => template.id === original.id);
    state.templates[index] = { ...original };
    await writeState(state);
    sendJson(response, 200, { template: state.templates[index] });
    return;
  }

  const templateMatch = pathname.match(/^\/api\/templates\/([a-z0-9-]+)$/i);
  if (templateMatch && request.method === "PUT") {
    const body = await readJsonBody(request);
    const subject = asText(body.subject || "", 180, "Assunto");
    const preview = asText(body.preview || "", 200, "Prévia");
    const messageBody = asText(body.body || "", 10_000, "Mensagem");
    if (!subject || !messageBody) {
      throw new HttpError(400, "Assunto e mensagem são obrigatórios.");
    }

    const state = await readState();
    const template = state.templates.find((item) => item.id === templateMatch[1]);
    if (!template) {
      throw new HttpError(404, "Modelo não encontrado.");
    }

    template.subject = subject;
    template.preview = preview;
    template.body = messageBody;
    await writeState(state);
    sendJson(response, 200, { template });
    return;
  }

  if (request.method === "POST" && pathname === "/api/send") {
    const body = await readJsonBody(request);
    const state = await readState();
    const contact = state.contacts.find((item) => item.id === body.contactId);
    const template = state.templates.find((item) => item.id === body.templateId);

    if (!contact || !template) {
      throw new HttpError(400, "Escolha um contato e um modelo válidos.");
    }
    if (contact.optedOut) {
      throw new HttpError(400, "Este contato está bloqueado para novos e-mails.");
    }
    if (!state.settings.senderName || !isValidEmail(state.settings.senderEmail)) {
      throw new HttpError(412, "Configure o nome e o e-mail remetente antes de enviar.");
    }
    if (!process.env.RESEND_API_KEY) {
      throw new HttpError(412, "Adicione RESEND_API_KEY ao arquivo .env e reinicie o servidor antes de enviar.");
    }

    const sentAt = new Date().toISOString();
    const subject = replacePlaceholders(template.subject, state.settings, contact);

    try {
      const result = await sendWithResend(template, state.settings, contact);
      addHistory(state, {
        contactId: contact.id,
        contactEmail: contact.email,
        templateId: template.id,
        templateTitle: template.title,
        subject,
        sentAt,
        status: "sent",
        providerId: result.id || null
      });
      await writeState(state);
      sendJson(response, 200, { id: result.id || null, sentAt });
      return;
    } catch (error) {
      addHistory(state, {
        contactId: contact.id,
        contactEmail: contact.email,
        templateId: template.id,
        templateTitle: template.title,
        subject,
        sentAt,
        status: "failed",
        error: error.message
      });
      await writeState(state);
      throw error;
    }
  }

  throw new HttpError(404, "Rota não encontrada.");
}

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

async function serveStatic(response, pathname) {
  const relativePath = pathname === "/" ? "index.html" : decodeURIComponent(pathname).replace(/^\/+/, "");
  const fullPath = path.resolve(APP_DIR, relativePath);
  const safeRoot = `${path.resolve(APP_DIR)}${path.sep}`;

  if (!fullPath.startsWith(safeRoot)) {
    throw new HttpError(403, "Arquivo não permitido.");
  }

  try {
    const file = await fsp.readFile(fullPath);
    const contentType = MIME_TYPES[path.extname(fullPath).toLowerCase()] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
    response.end(file);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new HttpError(404, "Arquivo não encontrado.");
    }
    throw error;
  }
}

async function handleRequest(request, response) {
  const url = new URL(request.url, "http://127.0.0.1");
  if (url.pathname.startsWith("/api/")) {
    await handleApi(request, response, url);
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    throw new HttpError(405, "Método não permitido.");
  }
  await serveStatic(response, url.pathname);
}

const server = http.createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    if (!(error instanceof HttpError)) {
      console.error(error);
    }
    if (!response.headersSent) {
      sendError(response, error);
    } else {
      response.end();
    }
  });
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3002);
  const host = process.env.HOST || "127.0.0.1";
  server.listen(port, host, () => {
    console.log(`Correio disponível em http://${host}:${port}`);
  });
}

module.exports = {
  findEmailColumn,
  initialState,
  isValidEmail,
  makeEmailHtml,
  parseCsv,
  replacePlaceholders,
  server
};
