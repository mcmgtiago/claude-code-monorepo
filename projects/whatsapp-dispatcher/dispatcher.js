// dispatcher.js
// Despachador de WhatsApp feio que alterna entre 4 templates para uma lista de telefones.
// Usa whatsapp-web.js para envio real (QR code na primeira vez).

import { Client, LocalAuth } from "whatsapp-web.js";
import qrcodeTerminal from "qrcode-terminal";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { recipients } from "./recipients.js";
import template1 from "./templates/template1.js";
import template2 from "./templates/template2.js";
import template3 from "./templates/template3.js";
import template4 from "./templates/template4.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const DELAY_MS = parseInt(process.env.DELAY_MS || "5000", 10);
const PROJECT_NAME = "ugly-dispatcher-wa";
const BROWSER_PATHS = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);

// 4 templates feios à disposição
const templates = [template1, template2, template3, template4];

// Índice do "round-robin" — avança a cada envio
let templateIndex = 0;

function pickTemplate() {
  const tpl = templates[templateIndex % templates.length];
  templateIndex++;
  return tpl;
}

function logBanner(title) {
  const bar = "═".repeat(72);
  console.log(`\n${bar}\n  ${title}\n${bar}`);
}

function sleep(ms) {
  // Adiciona jitter aleatório de 0-2s para parecer mais humano
  const jitter = Math.floor(Math.random() * 2000);
  return new Promise((r) => setTimeout(r, ms + jitter));
}

function findBrowserPath() {
  return BROWSER_PATHS.find((browserPath) => fs.existsSync(browserPath));
}

async function dispatch() {
  logBanner("📱  DESPACHADOR DE WHATSAPP FEIO 📱");

  console.log(`📋  Destinatários carregados : ${recipients.length}`);
  console.log(`🎨  Templates disponíveis    : ${templates.length}`);
  console.log(`⏱   Delay entre envios       : ${DELAY_MS}ms (+ até 2s jitter)`);
  console.log(`🔁  Modo                     : round-robin (alterna entre os 4 templates)\n`);

  const executablePath = findBrowserPath();

  console.log("🔌  Inicializando cliente WhatsApp...");
  if (executablePath) {
    console.log(`🌐  Navegador detectado       : ${executablePath}`);
  } else {
    console.log("🌐  Navegador detectado       : Chromium do Puppeteer (fallback)");
  }

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: PROJECT_NAME }),
    puppeteer: {
      headless: true,
      executablePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", (qr) => {
    console.log("\n📸  QR CODE gerado! Escaneie com o WhatsApp do seu celular:");
    console.log("    (Menu > Aparelhos conectados > Conectar um aparelho)\n");
    qrcodeTerminal.generate(qr, { small: true });
  });

  client.on("authenticated", () => {
    console.log("✅  Autenticado com sucesso!");
  });

  client.on("auth_failure", (msg) => {
    console.error("❌  Falha na autenticação:", msg);
    process.exit(1);
  });

  client.on("ready", async () => {
    console.log("🟢  WhatsApp pronto! Iniciando disparos...\n");

    let sucessos = 0;
    let falhas = 0;

    for (let i = 0; i < recipients.length; i++) {
      const destinatario = recipients[i];
      const tpl = pickTemplate();
      const numeroTemplate = ((templateIndex - 1) % templates.length) + 1;
      const mensagem = tpl(destinatario);

      // Formato whatsapp-web.js: precisa do sufixo @c.us
      const chatId = `${destinatario.telefone}@c.us`;

      console.log(
        `\n[${i + 1}/${recipients.length}] ➜  ${destinatario.nome} (${destinatario.telefone})`
      );
      console.log(`   Template : #${numeroTemplate}`);
      console.log(
        `   Preview  : ${mensagem.slice(0, 80).replace(/\n/g, " ")}...`
      );

      try {
        await client.sendMessage(chatId, mensagem);
        sucessos++;
        console.log(`   ✅  Enviado`);
      } catch (err) {
        falhas++;
        console.error(`   ❌  Falha: ${err.message ?? err}`);
      }

      // Pausa educada para não martelar o WhatsApp
      if (i < recipients.length - 1) {
        console.log(`   ⏳  Aguardando ${DELAY_MS}ms+jitter...`);
        await sleep(DELAY_MS);
      }
    }

    logBanner("📊  RESUMO DO DISPARO");
    console.log(`✅  Enviados com sucesso : ${sucessos}`);
    console.log(`❌  Falhas              : ${falhas}`);
    console.log(`📨  Total processado    : ${recipients.length}\n`);
    console.log("🔌  Encerrando cliente...");
    await client.destroy();
    process.exit(0);
  });

  client.on("disconnected", (reason) => {
    console.log("🔌  Cliente desconectado:", reason);
  });

  await client.initialize();
}

dispatch().catch((err) => {
  console.error("\n💥  Erro inesperado:", err);
  process.exit(1);
});
