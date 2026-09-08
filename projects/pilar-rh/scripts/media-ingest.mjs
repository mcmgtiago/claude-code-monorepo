#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEDIA_DIR = path.join(__dirname, "../public/media");
const OUTPUT_FILE = path.join(__dirname, "../src/data/media.generated.ts");

// Criar diretório se não existir
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
  console.log(`✓ Diretório criado: ${MEDIA_DIR}`);
}

// Placeholder: mídias locais ou future integrações com Pexels/Pixabay
const mediaAssets = [
  {
    id: "hero-placeholder",
    provider: "local",
    type: "image",
    file: "/media/hero-placeholder.webp",
    alt: "Profissional em atendimento de recrutamento em escritório",
    width: 800,
    height: 1000,
    section: "hero",
    focalPoint: { x: 0.5, y: 0.35 },
  },
];

const attributionData = {
  generated: new Date().toISOString(),
  assets: mediaAssets,
};

// Escrever arquivo gerado
const output = `export type MediaAsset = {
  id: string;
  provider: "pexels" | "pixabay" | "mixkit" | "coverr" | "local";
  type: "image" | "video";
  file: string;
  poster?: string;
  sourcePage?: string;
  author?: string;
  alt: string;
  width?: number;
  height?: number;
  focalPoint?: {
    x: number;
    y: number;
  };
  section:
    | "hero"
    | "services"
    | "companies"
    | "candidates"
    | "industries"
    | "training"
    | "about"
    | "cases";
};

export const mediaAssets: MediaAsset[] = ${JSON.stringify(mediaAssets, null, 2)};
`;

fs.writeFileSync(OUTPUT_FILE, output, "utf-8");
console.log(`✓ Arquivo gerado: ${OUTPUT_FILE}`);

// Escrever arquivo de atribuições
fs.writeFileSync(
  path.join(MEDIA_DIR, "attribution.json"),
  JSON.stringify(attributionData, null, 2),
  "utf-8"
);
console.log(`✓ Arquivo de atribuições criado`);

console.log("\n📸 Script de mídia concluído!");
console.log(
  "Nota: Para integrar com Pexels/Pixabay, configure PEXELS_API_KEY e PIXABAY_API_KEY no .env"
);
