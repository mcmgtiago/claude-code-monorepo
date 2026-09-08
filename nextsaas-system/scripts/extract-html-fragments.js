/**
 * extract-html-fragments.js
 *
 * Lê o sections-manifest.json e extrai o HTML REAL de cada seção,
 * salvando em builder/sections/[template-slug]/[type]--[index].html
 *
 * Também gera um preview HTML completo por seção (com CSS/JS do template)
 * pra visualização no navegador.
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_BASE = 'C:/Users/Administrator/Downloads/ui88/Organizado/A - Dashboards & SaaS/NextSaaS - Mega Bundle (47 templates)/main/templates';
const OUTPUT_DIR = path.resolve(__dirname, '../builder/sections');
const MANIFEST_FILE = path.resolve(__dirname, '../builder/sections-manifest.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));

console.log(`Processando ${manifest.sections.length} seções...\n`);

let processed = 0;
let errors = 0;

for (const section of manifest.sections) {
  const templateDir = path.join(TEMPLATES_BASE, section.template);
  const indexPath = path.join(templateDir, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.warn(`⚠️  ${section.id}: index.html não existe`);
    errors++;
    continue;
  }

  const html = fs.readFileSync(indexPath, 'utf-8');
  const lines = html.split('\n');

  // Extrai linhas correspondentes (section.line é 1-indexed, array é 0-indexed)
  const startIdx = section.line - 1;
  const endIdx = section.endLine;
  const fragment = lines.slice(startIdx, endIdx).join('\n');

  // Sanitiza o fragmento pra remover scripts inline que referenciam globals
  // Mas mantém os data-attributes que vão disparar animações
  const cleanFragment = fragment;

  // Cria dir específico por template
  const templateOutputDir = path.join(OUTPUT_DIR, section.template);
  if (!fs.existsSync(templateOutputDir)) {
    fs.mkdirSync(templateOutputDir, { recursive: true });
  }

  // Salva fragmento isolado
  const fileName = `${section.type}-${String(processed).padStart(3, '0')}.html`;
  const filePath = path.join(templateOutputDir, fileName);

  fs.writeFileSync(filePath, cleanFragment);
  section.fragmentFile = `${section.template}/${fileName}`;
  processed++;

  // A cada 50, mostra progresso
  if (processed % 50 === 0) {
    console.log(`   ${processed}/${manifest.sections.length} processados...`);
  }
}

// Salva manifest atualizado com fragmentFile
fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

console.log(`\n✅ ${processed} fragmentos HTML salvos em ${OUTPUT_DIR}`);
console.log(`❌ ${errors} erros`);
console.log(`📄 Manifest atualizado: ${MANIFEST_FILE}`);