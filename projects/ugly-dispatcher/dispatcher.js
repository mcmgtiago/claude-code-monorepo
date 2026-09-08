// dispatcher.js
// Despachador feio que alterna entre 4 templates de email para uma lista de destinatários
// usando o serviço Resend.

import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { recipients } from "./recipients.js";
import { template1 } from "./templates/template1.js";
import { template2 } from "./templates/template2.js";
import { template3 } from "./templates/template3.js";
import { template4 } from "./templates/template4.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "despachador@exemplo.dev";
const FROM_NAME = process.env.FROM_NAME || "Despachador Feio";

if (!RESEND_API_KEY) {
  console.error("❌  ERRO: a variável RESEND_API_KEY não está definida no .env");
  console.error("    Crie um arquivo .env com: RESEND_API_KEY=sua_chave_aqui");
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

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

async function dispatch() {
  logBanner("✉  DESPACHADOR DE EMAILS FEIO ✉");

  console.log(`📋  Destinatários carregados : ${recipients.length}`);
  console.log(`🎨  Templates disponíveis    : ${templates.length}`);
  console.log(`📤  Remetente                : ${FROM_NAME} <${FROM_EMAIL}>`);
  console.log(`🔁  Modo                     : round-robin (alterna entre os 4 templates)\n`);

  let sucessos = 0;
  let falhas = 0;

  for (let i = 0; i < recipients.length; i++) {
    const destinatario = recipients[i];
    const tpl = pickTemplate(); // alterna o template
    const numeroTemplate = ((templateIndex - 1) % templates.length) + 1;

    const { subject, html } = tpl(destinatario);

    console.log(`\n[${i + 1}/${recipients.length}] ➜  ${destinatario.email}`);
    console.log(`   Template   : #${numeroTemplate}`);
    console.log(`   Assunto    : ${subject}`);

    try {
      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: destinatario.email,
        subject,
        html,
      });

      if (error) {
        falhas++;
        console.error(`   ❌  Falha: ${error.message ?? JSON.stringify(error)}`);
        continue;
      }

      sucessos++;
      console.log(`   ✅  Enviado (id: ${data?.id ?? "?"})`);
    } catch (err) {
      falhas++;
      console.error(`   ❌  Exceção: ${err.message ?? err}`);
    }

    // Pausa educada para não martelar a API do Resend
    if (i < recipients.length - 1) {
      await new Promise((r) => setTimeout(r, 800));
    }
  }

  logBanner("📊  RESUMO DO DISPARO");
  console.log(`✅  Enviados com sucesso : ${sucessos}`);
  console.log(`❌  Falhas              : ${falhas}`);
  console.log(`📨  Total processado    : ${recipients.length}\n`);
}

dispatch().catch((err) => {
  console.error("\n💥  Erro inesperado:", err);
  process.exit(1);
});
