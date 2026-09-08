// dry-run.js — NÃO envia mensagens; apenas mostra no console o que seria enviado
import template1 from "./templates/template1.js";
import template2 from "./templates/template2.js";
import template3 from "./templates/template3.js";
import template4 from "./templates/template4.js";
import { recipients } from "./recipients.js";

const templates = [template1, template2, template3, template4];
let templateIndex = 0;

function pickTemplate() {
  const tpl = templates[templateIndex % templates.length];
  templateIndex++;
  return tpl;
}

function cLine(s, char = "─") {
  console.log(char.repeat(Math.min(72, Math.max(40, s.length + 4))));
}

console.log("\n📋  DRY-RUN — simula envio, NÃO chama WhatsApp\n");
console.log(`📨  ${recipients.length} destinatários | 4 templates (round-robin)\n`);

for (let i = 0; i < recipients.length; i++) {
  const r = recipients[i];
  const tpl = pickTemplate();
  const mensagem = tpl(r);
  const numeroTemplate = ((templateIndex - 1) % templates.length) + 1;

  console.log(`[${i + 1}/${recipients.length}] ➜  ${r.nome} (${r.telefone})`);
  console.log(`         Template: #${numeroTemplate}`);
  cLine(`         ${r.nome}`, "─");
  // Mostra a mensagem indentada
  mensagem.split("\n").forEach((line) => {
    console.log("   " + line);
  });
  cLine("", "─");
}

console.log("\n✅  Dry-run concluído. Para enviar de verdade: npm start\n");
