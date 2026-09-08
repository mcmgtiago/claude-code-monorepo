const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const { isWhatsAppConfigured, loadConfig } = require("./config");
const { StoreError, createStore } = require("./store");
const { ValidationError, validateCampaign, validateContact, validateTemplate } = require("./validation");
const { sendTemplate } = require("./whatsapp");

const config = loadConfig(path.resolve(__dirname, ".."));
const store = createStore(config.dataFile);
const campaignQueue = [];
let campaignWorkerRunning = false;
const instanceLockPath = path.join(path.dirname(config.dataFile), ".server.lock");
let instanceLockHandle = null;

const STATIC_FILES = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/app.js": ["app.js", "application/javascript; charset=utf-8"],
  "/styles.css": ["styles.css", "text/css; charset=utf-8"]
};

function json(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(payload));
}

function messageFromError(error) {
  if (error instanceof ValidationError || error instanceof StoreError) return error.message;
  return "Não foi possível concluir a operação.";
}

function statusFromError(error) {
  if (error instanceof ValidationError) return 400;
  if (error instanceof StoreError) return error.status;
  return 500;
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    let rejected = false;

    request.on("data", (chunk) => {
      if (rejected) return;
      body += chunk;
      if (body.length > 1_000_000) {
        rejected = true;
        reject(new ValidationError("A solicitação excede o tamanho permitido."));
      }
    });
    request.on("end", () => {
      if (rejected) return;
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new ValidationError("O corpo da solicitação precisa ser JSON válido."));
      }
    });
    request.on("error", reject);
  });
}

function publicConfig() {
  return {
    configured: isWhatsAppConfigured(config),
    defaultDelaySeconds: config.defaultDelaySeconds,
    localOnly: true
  };
}

function trustedHost(port = config.port) {
  return port === 80 ? "127.0.0.1" : `127.0.0.1:${port}`;
}

function isAllowedHost(request) {
  return request.headers.host === trustedHost();
}

function isAllowedOrigin(request) {
  const origin = request.headers.origin;
  return !origin || origin === `http://${trustedHost()}`;
}

function isProcessRunning(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
}

async function acquireInstanceLock() {
  await fs.mkdir(path.dirname(instanceLockPath), { recursive: true });

  while (true) {
    try {
      instanceLockHandle = await fs.open(instanceLockPath, "wx");
      await instanceLockHandle.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
      return;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;

      let previousLock = null;
      try {
        previousLock = JSON.parse(await fs.readFile(instanceLockPath, "utf8"));
      } catch {
        // A lock parcialmente gravada por um processo encerrado pode ser substituída.
      }
      if (isProcessRunning(previousLock?.pid)) {
        throw new Error("Já existe uma instância do painel usando este armazenamento local.");
      }
      await fs.rm(instanceLockPath, { force: true });
    }
  }
}

async function releaseInstanceLock() {
  const lockHandle = instanceLockHandle;
  if (!lockHandle) return;
  instanceLockHandle = null;
  try {
    await lockHandle?.close();
  } finally {
    await fs.rm(instanceLockPath, { force: true });
  }
}

function pause(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function summarizeCampaign(campaign) {
  const counts = { pending: 0, processing: 0, sent: 0, failed: 0, skipped: 0, cancelled: 0, unknown: 0 };
  for (const job of campaign.jobs) counts[job.status] = (counts[job.status] || 0) + 1;
  return counts;
}

async function cancelRemainingJobs(campaignId) {
  return store.updateCampaign(campaignId, (campaign) => {
    campaign.status = "cancelled";
    campaign.completedAt = new Date().toISOString();
    for (const job of campaign.jobs) {
      if (job.status === "pending") job.status = "cancelled";
    }
    return campaign;
  });
}

async function completeCampaign(campaignId) {
  return store.updateCampaign(campaignId, (campaign) => {
    campaign.status = "completed";
    campaign.completedAt = new Date().toISOString();
    campaign.summary = summarizeCampaign(campaign);
    return campaign;
  });
}

async function markJob(campaignId, jobId, status, details = {}) {
  return store.updateCampaign(campaignId, (campaign) => {
    const job = campaign.jobs.find((item) => item.id === jobId);
    if (!job) return campaign;
    Object.assign(job, details, { status, updatedAt: new Date().toISOString() });
    return campaign;
  });
}

async function runCampaign(campaignId) {
  try {
    const initial = await store.getCampaign(campaignId);
    if (!initial || initial.status !== "queued") return;

    await store.updateCampaign(campaignId, (campaign) => {
      campaign.status = "running";
      campaign.startedAt = new Date().toISOString();
      return campaign;
    });

    while (true) {
      const campaign = await store.getCampaign(campaignId);
      if (!campaign) return;
      if (campaign.cancelRequested) {
        await cancelRemainingJobs(campaignId);
        return;
      }

      const job = campaign.jobs.find((item) => item.status === "pending");
      if (!job) {
        await completeCampaign(campaignId);
        return;
      }

      const claimed = await store.updateCampaign(campaignId, (current) => {
        if (current.cancelRequested) return false;
        const pendingJob = current.jobs.find((item) => item.id === job.id);
        if (!pendingJob || pendingJob.status !== "pending") return false;
        pendingJob.status = "processing";
        pendingJob.attemptedAt = new Date().toISOString();
        return true;
      });
      if (!claimed) continue;

      const contact = await store.getContact(job.contactId);
      if (!contact || !contact.optedIn) {
        await markJob(campaignId, job.id, "skipped", {
          error: "Contato removido ou sem opt-in ativo antes do envio."
        });
      } else {
        try {
          const result = await sendTemplate({
            config,
            contact: { name: job.contactName, phone: job.phone },
            template: job.template
          });
          await markJob(campaignId, job.id, "sent", { messageId: result.messageId, error: null });
        } catch (error) {
          await markJob(campaignId, job.id, "failed", {
            error: String(error.message || "Falha desconhecida ao chamar a API.").slice(0, 500)
          });
        }
      }

      const afterSend = await store.getCampaign(campaignId);
      if (afterSend?.cancelRequested) continue;
      if (afterSend?.jobs.some((item) => item.status === "pending")) {
        await pause(afterSend.delaySeconds * 1000);
      }
    }
  } catch (error) {
    console.error(`Falha inesperada na campanha ${campaignId}:`, error);
    try {
      await store.updateCampaign(campaignId, (campaign) => {
        campaign.status = "interrupted";
        campaign.completedAt = new Date().toISOString();
        campaign.internalError = "A campanha foi interrompida por um erro local.";
        return campaign;
      });
    } catch (updateError) {
      console.error("Não foi possível registrar a interrupção da campanha:", updateError);
    }
  }
}

async function drainCampaignQueue() {
  if (campaignWorkerRunning) return;
  campaignWorkerRunning = true;

  try {
    while (campaignQueue.length > 0) {
      const campaignId = campaignQueue.shift();
      await runCampaign(campaignId);
    }
  } finally {
    campaignWorkerRunning = false;
    if (campaignQueue.length > 0) void drainCampaignQueue();
  }
}

function enqueueCampaign(campaignId) {
  if (!campaignQueue.includes(campaignId)) campaignQueue.push(campaignId);
  void drainCampaignQueue();
}

async function handleApi(request, response, pathname) {
  if (request.method === "GET" && pathname === "/api/data") {
    const data = await store.getData();
    return json(response, 200, { ...data, config: publicConfig() });
  }

  if (request.method === "POST" && pathname === "/api/contacts") {
    const contact = await store.addContact(validateContact(await readJson(request)));
    return json(response, 201, { contact });
  }

  const optOutMatch = pathname.match(/^\/api\/contacts\/([a-zA-Z0-9-]+)\/opt-out$/);
  if (optOutMatch && request.method === "POST") {
    const contact = await store.optOutContact(optOutMatch[1]);
    return json(response, 200, { contact });
  }

  const templateMatch = pathname.match(/^\/api\/templates\/(modelo-[1-5])$/);
  if (templateMatch && request.method === "PUT") {
    const template = await store.updateTemplate(templateMatch[1], validateTemplate(await readJson(request)));
    return json(response, 200, { template });
  }

  if (request.method === "POST" && pathname === "/api/campaigns") {
    if (!isWhatsAppConfigured(config)) {
      return json(response, 503, {
        error: "Preencha WHATSAPP_ACCESS_TOKEN e WHATSAPP_PHONE_NUMBER_ID no arquivo .env e reinicie o servidor."
      });
    }

    const campaign = await store.createCampaign(
      validateCampaign(await readJson(request), config.defaultDelaySeconds)
    );
    enqueueCampaign(campaign.id);
    return json(response, 202, { campaign });
  }

  const cancelMatch = pathname.match(/^\/api\/campaigns\/([a-zA-Z0-9-]+)\/cancel$/);
  if (cancelMatch && request.method === "POST") {
    const campaign = await store.requestCancellation(cancelMatch[1]);
    return json(response, 200, { campaign });
  }

  return json(response, 404, { error: "Rota não encontrada." });
}

async function handleStatic(response, pathname) {
  const staticFile = STATIC_FILES[pathname];
  if (!staticFile) return false;

  try {
    const [fileName, contentType] = staticFile;
    const content = await fs.readFile(path.join(config.publicDir, fileName));
    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "same-origin"
    });
    response.end(content);
  } catch (error) {
    console.error("Falha ao servir arquivo estático:", error);
    json(response, 500, { error: "Não foi possível carregar a interface." });
  }
  return true;
}

async function requestHandler(request, response) {
  if (!isAllowedHost(request)) {
    return json(response, 403, { error: "Este painel aceita apenas requisições de 127.0.0.1." });
  }
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method) && !isAllowedOrigin(request)) {
    return json(response, 403, { error: "A origem desta requisição não é permitida." });
  }

  const { pathname } = new URL(request.url, "http://127.0.0.1");
  try {
    if (pathname.startsWith("/api/")) {
      await handleApi(request, response, pathname);
      return;
    }

    if (request.method !== "GET" || !(await handleStatic(response, pathname))) {
      json(response, 404, { error: "Página não encontrada." });
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    if (!response.headersSent) {
      json(response, statusFromError(error), { error: messageFromError(error) });
    } else {
      response.end();
    }
  }
}

async function start() {
  try {
    await acquireInstanceLock();
    await store.initialize();
    const server = http.createServer((request, response) => {
      void requestHandler(request, response);
    });
    server.once("close", () => {
      void releaseInstanceLock();
    });
    server.once("error", () => {
      void releaseInstanceLock();
    });
    await new Promise((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
      server.listen(config.port, "127.0.0.1");
    });
    console.log(`Painel disponível em http://127.0.0.1:${config.port}`);
    console.log("O servidor aceita conexões apenas desta máquina.");
    return server;
  } catch (error) {
    await releaseInstanceLock();
    throw error;
  }
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Não foi possível iniciar o painel:", error);
    process.exitCode = 1;
  });
}

module.exports = { isAllowedHost, isAllowedOrigin, requestHandler, start, trustedHost };
