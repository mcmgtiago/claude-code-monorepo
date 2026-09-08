#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEDIA_DIR = path.join(__dirname, "../public/media/posters");

if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
  console.log(`✓ Diretório de posters criado: ${MEDIA_DIR}`);
}

console.log("\n📸 Script de geração de posters concluído!");
console.log(
  "Nota: Para gerar posters reais, configure sharp e adicione vídeos em public/media/"
);
