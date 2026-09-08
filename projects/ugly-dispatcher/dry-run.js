// dry-run.js — NÃO envia emails; apenas gera os HTMLs localmente para inspeção
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { template1 } from "./templates/template1.js";
import { template2 } from "./templates/template2.js";
import { template3 } from "./templates/template3.js";
import { template4 } from "./templates/template4.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sample = { nome: "Maria Silva", email: "maria.silva@example.com" };
const tpls = [
  ["template1", template1],
  ["template2", template2],
  ["template3", template3],
  ["template4", template4],
];

const outDir = path.join(__dirname, "preview");
fs.mkdirSync(outDir, { recursive: true });

for (const [name, tpl] of tpls) {
  const { subject, html } = tpl(sample);
  const file = path.join(outDir, `${name}.html`);
  fs.writeFileSync(file, html, "utf-8");
  console.log(`✅  ${file}   (assunto: ${subject})`);
}

console.log(`\nAbra os arquivos em ${outDir} no navegador para ver os templates.`);