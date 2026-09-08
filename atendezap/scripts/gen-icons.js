// Gera os PNGs do PWA a partir de public/icons/icon.svg
// Uso: bun scripts/gen-icons.js
import sharp from "sharp";
import { readFileSync } from "fs";
import { join } from "path";

const ICONS_DIR = join(import.meta.dir, "../public/icons");
const svg = readFileSync(join(ICONS_DIR, "icon.svg"));

// badge-72: ícone monocromático para a barra de status do Android (push)
const badgeSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <path d="M140 160 L256 370 L372 160" stroke="#ffffff" stroke-width="60" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`);

// apple-touch-icon: iOS arredonda sozinho, então o quadrado é cheio (sem rx)
const appleSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#081410"/>
  <path d="M140 160 L256 370 L372 160" stroke="#0efa71" stroke-width="52" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="256" cy="390" r="16" fill="#0efa71" opacity="0.6"/>
</svg>`);

const targets = [
  { name: "icon-192.png", size: 192, src: svg },
  { name: "icon-512.png", size: 512, src: svg },
  { name: "badge-72.png", size: 72, src: badgeSvg },
  { name: "apple-touch-icon.png", size: 180, src: appleSvg },
];

for (const t of targets) {
  await sharp(t.src, { density: 384 })
    .resize(t.size, t.size)
    .png()
    .toFile(join(ICONS_DIR, t.name));
  console.log(`✓ ${t.name} (${t.size}x${t.size})`);
}
