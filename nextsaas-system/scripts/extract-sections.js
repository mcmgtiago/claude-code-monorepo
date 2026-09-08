/**
 * extract-sections.js
 *
 * Extrai seções dos templates NextSaaS e gera:
 * - Fragmentos HTML isolados por seção
 * - Manifest JSON com metadata de todas as seções
 *
 * Uso: node extract-sections.js
 */

const fs = require('fs');
const path = require('path');

// Configuração
const TEMPLATES_BASE = 'C:/Users/Administrator/Downloads/ui88/Organizado/A - Dashboards & SaaS/NextSaaS - Mega Bundle (47 templates)/main/templates';
const OUTPUT_DIR = path.resolve(__dirname, '../builder/sections');
const MANIFEST_FILE = path.resolve(__dirname, '../builder/sections-manifest.json');

// Templates a processar (todos os 47)
const templates = fs.readdirSync(TEMPLATES_BASE).filter(d =>
  fs.statSync(path.join(TEMPLATES_BASE, d)).isDirectory()
);

console.log(`Encontrados ${templates.length} templates para processar.`);

// Metadata de nichos
const NICHE_MAP = {
  'payment-solution': ['fintech', 'banking'],
  'online-banking': ['banking', 'fintech'],
  'investment-management': ['investimentos'],
  'wealth-management': ['investimentos'],
  'forex-trading': ['investimentos', 'fintech'],
  'personal-finance': ['investimentos', 'fintech'],
  'decrentralized-finance': ['fintech', 'crypto'],
  'mortgage-services': ['banking', 'fintech'],
  'financial-application': ['fintech'],
  'financial-management-platform': ['fintech', 'contadores'],
  'pos-system': ['fintech', 'saas'],
  'insurance': ['fintech', 'saas'],
  'cloud-software': ['saas', 'fintech'],
  'automation-saas': ['saas'],
  'nuvexa-crm': ['saas', 'contadores'],
  'app-builder': ['saas'],
  'app-development': ['saas'],
  'ai-saas-software': ['saas'],
  'ai-application': ['saas'],
  'ai-chatbot': ['saas'],
  'ai-solutions': ['saas'],
  'ai-software': ['saas'],
  'ai-gadgets': ['saas'],
  'ai-voice-generator': ['saas'],
  'ai-resume-builder': ['saas'],
  'ai-kw-generator': ['saas'],
  'ai-marketing-agency': ['saas', 'contadores'],
  'ai-agency': ['saas'],
  'digital-agency': ['saas', 'contadores'],
  'digital-marketing': ['saas'],
  'email-marketing': ['saas'],
  'social-media-management': ['saas'],
  'lead-capture': ['saas'],
  'cyber-security': ['saas'],
  'security-software': ['saas'],
  'risk-management-software': ['saas'],
  'mobile-management-software': ['saas'],
  'analytics-and-reporting': ['saas'],
  'data-visualization': ['saas', 'investimentos'],
  'messaging-platform': ['saas'],
  'neural-networks': ['saas'],
  'time-tracking': ['saas'],
  'web-hosting': ['saas'],
  'smart-solutions': ['saas'],
  'property-management-software': ['saas'],
  'creative-portfolio': ['saas'],
  'crypto-marketing': ['crypto', 'fintech'],
};

// Mapear tipo de seção baseado no nome do comentário
function classifySection(name) {
  const n = name.toLowerCase();
  if (n.includes('hero')) return 'hero';
  if (n.includes('header') || n.includes('nav')) return 'header';
  if (n.includes('footer')) return 'footer';
  if (n.includes('pricing') || n.includes('price')) return 'pricing';
  if (n.includes('feature')) return 'features';
  if (n.includes('testimonial') || n.includes('review')) return 'testimonials';
  if (n.includes('faq') || n.includes('accordi')) return 'faq';
  if (n.includes('cta') || n.includes('newsletter') || n.includes('get started')) return 'cta';
  if (n.includes('blog') || n.includes('article')) return 'blog';
  if (n.includes('team')) return 'team';
  if (n.includes('service')) return 'services';
  if (n.includes('integration') || n.includes('partner') || n.includes('marquee') || n.includes('client') || n.includes('brand') || n.includes('trusted')) return 'social-proof';
  if (n.includes('counter') || n.includes('stat') || n.includes('success') || n.includes('metric')) return 'stats';
  if (n.includes('about') || n.includes('why us') || n.includes('why choose') || n.includes('reason')) return 'about';
  if (n.includes('contact')) return 'contact';
  if (n.includes('process') || n.includes('step') || n.includes('how')) return 'process';
  if (n.includes('use case') || n.includes('case stud')) return 'case-studies';
  if (n.includes('mobile menu') || n.includes('theme toggle')) return 'utility';
  return 'other';
}

// Extrair seções de um index.html
function extractSections(templateSlug) {
  const indexPath = path.join(TEMPLATES_BASE, templateSlug, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.warn(`  ⚠️  ${templateSlug}: index.html não encontrado`);
    return [];
  }

  const html = fs.readFileSync(indexPath, 'utf-8');
  const lines = html.split('\n');

  // Encontrar seções via comentários <!-- === ... === -->
  const sectionMarkers = [];
  const commentPattern = /<!-- =+\s*$/;

  for (let i = 0; i < lines.length; i++) {
    if (commentPattern.test(lines[i].trim())) {
      // Nome da seção está na próxima linha
      const nameLineRaw = lines[i + 1] || '';
      const nameLine = nameLineRaw.trim().replace(/^=+\s*/, '').replace(/\s*=+$/, '').trim();

      if (nameLine && !nameLine.startsWith('<!--') && !nameLine.startsWith('===')) {
        sectionMarkers.push({
          name: nameLine,
          line: i, // 0-indexed
        });
      }
    }
  }

  if (sectionMarkers.length === 0) {
    console.warn(`  ⚠️  ${templateSlug}: sem markers de seção encontrados`);
    return [];
  }

  // Extrair conteúdo entre markers
  const sections = [];

  for (let i = 0; i < sectionMarkers.length; i++) {
    const marker = sectionMarkers[i];
    const nextMarker = sectionMarkers[i + 1];
    const type = classifySection(marker.name);

    // Pular utility (mobile menu, theme toggle, head links)
    if (type === 'utility' || marker.name.toLowerCase().includes('head links')) {
      continue;
    }

    // Conteúdo: do comentário atual até o próximo (ou fim do arquivo)
    const startLine = marker.line;
    const endLine = nextMarker ? nextMarker.line : lines.length;
    const content = lines.slice(startLine, endLine).join('\n');

    // Extrair classes da primeira <section> ou <header> ou <footer> encontrada
    const tagMatch = content.match(/<(section|header|footer|div)[^>]*class="([^"]*)"[^>]*/);
    const classes = tagMatch ? tagMatch[2] : '';
    const ariaLabel = content.match(/aria-label="([^"]*)"/)?.[1] || '';

    sections.push({
      id: `${templateSlug}--${type}--${i}`,
      template: templateSlug,
      name: marker.name.replace(/\s*section\s*/i, '').trim(),
      type: type,
      line: startLine + 1, // 1-indexed para leitura humana
      endLine: endLine,
      lineCount: endLine - startLine,
      classes: classes.substring(0, 200), // Limitar pra não ficar gigante
      ariaLabel: ariaLabel,
      nichos: NICHE_MAP[templateSlug] || ['saas'],
    });
  }

  return sections;
}

// Processar todos os templates
function main() {
  console.log('🚀 Extraindo seções de todos os templates...\n');

  // Criar dir de output
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    templatesBase: TEMPLATES_BASE,
    totalTemplates: 0,
    totalSections: 0,
    sectionsByType: {},
    sections: [],
  };

  let totalSections = 0;

  for (const slug of templates) {
    const sections = extractSections(slug);

    if (sections.length > 0) {
      console.log(`✅ ${slug}: ${sections.length} seções extraídas`);
      manifest.sections.push(...sections);
      totalSections += sections.length;
    }
  }

  // Contar por tipo
  for (const section of manifest.sections) {
    if (!manifest.sectionsByType[section.type]) {
      manifest.sectionsByType[section.type] = 0;
    }
    manifest.sectionsByType[section.type]++;
  }

  manifest.totalTemplates = templates.length;
  manifest.totalSections = totalSections;

  // Salvar manifest
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

  console.log(`\n📊 Resumo:`);
  console.log(`   Templates processados: ${manifest.totalTemplates}`);
  console.log(`   Seções extraídas: ${manifest.totalSections}`);
  console.log(`   Por tipo:`);

  const sorted = Object.entries(manifest.sectionsByType).sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sorted) {
    console.log(`     ${type}: ${count}`);
  }

  console.log(`\n✅ Manifest salvo em: ${MANIFEST_FILE}`);
}

main();
