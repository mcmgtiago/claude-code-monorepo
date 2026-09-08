// build.js — gera architecture/templates-data.js com os HTMLs embutidos como string.
// É executado uma vez antes de servir a página.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, "..");
const previewDir = path.join(root, "preview");
const targetFile = path.join(__dirname, "templates-data.js");

const names = ["template1", "template2", "template3", "template4"];
const data = {};

for (const n of names) {
  const html = fs.readFileSync(path.join(previewDir, `${n}.html`), "utf-8");
  data[n] = html;
}

const out = `// Gerado por build.js — não editar manualmente.
export const rawTemplates = ${JSON.stringify(data, null, 2)};
`;
fs.writeFileSync(targetFile, out, "utf-8");
console.log(`✅  Escreveu ${targetFile}`);