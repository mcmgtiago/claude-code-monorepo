/**
 * server.js — NextSaaS Builder Server
 *
 * Serve o builder estático + endpoint /api/generate que chama Opus 4.8
 * pra selecionar seções e preencher copy automaticamente.
 *
 * Uso: node server.js (porta 3456)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Servir builder estático
app.use(express.static(path.join(__dirname, 'builder')));

// Carregar manifest de seções (para contexto da IA)
const MANIFEST_PATH = path.join(__dirname, 'builder', 'sections-manifest.json');
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));

// Resumo compacto das seções (para caber no contexto sem explodir tokens)
function buildSectionsContext() {
  const grouped = {};
  for (const s of manifest.sections) {
    if (s.type === 'utility' || s.type === 'other') continue;
    if (!grouped[s.type]) grouped[s.type] = [];
    grouped[s.type].push({
      id: s.id,
      template: s.template,
      name: s.name,
      type: s.type,
      lines: s.lineCount,
      nichos: s.nichos,
      ariaLabel: s.ariaLabel || '',
    });
  }
  return grouped;
}

const sectionsContext = buildSectionsContext();

// Cliente Anthropic (usa env vars)
// O gateway avellogateway espera "Authorization: Bearer <token>" → usar authToken
// apiKey vazio pra não mandar x-api-key (que o gateway rejeita)
const anthropic = new Anthropic({
  authToken: process.env.ANTHROPIC_AUTH_TOKEN,
  apiKey: null,
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

// Endpoint: Gerar site completo
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'prompt é obrigatório' });
  }

  console.log(`\n🚀 Gerando site para: "${prompt.substring(0, 80)}..."`);

  try {
    const systemPrompt = `Você é um sistema especialista em montar sites usando templates prontos do bundle NextSaaS.

## Seu trabalho

O usuário vai descrever um site que precisa (ex: "site para escritório contábil XYZ, serviços BPO e folha, cor azul navy").

Você deve:
1. SELECIONAR as melhores seções do catálogo abaixo (IDs exatos)
2. PREENCHER o copy de cada seção com o conteúdo do cliente (em português do Brasil)
3. Retornar um JSON estruturado

## Catálogo de seções disponíveis (por tipo)

${JSON.stringify(sectionsContext, null, 1)}

## Regras de seleção

- Escolha entre 5-10 seções por site (não exagere)
- Sempre inclua: 1 header, 1 hero, 2-4 seções de conteúdo, 1 cta, 1 footer
- Prefira seções do mesmo template (coerência visual) ou templates do mesmo nicho
- Para "contadores" → prefira templates fintech/saas de tom corporate
- Para "investimentos" → prefira templates com nichos ['investimentos']
- Para "fintech/saas" → prefira templates com nichos ['fintech', 'saas']
- Use IDs EXATOS do catálogo

## Regras de copy

- Escreva em português do Brasil
- Copy deve ser profissional, direto, sem clichês
- Use dados do cliente EXATAMENTE como fornecidos (nome, serviços, telefone) — NÃO corrija nomes
- Invente dados plausíveis quando não fornecidos (ex: "+500 clientes atendidos")
- Headlines curtas (máx 8 palavras)
- Subheadlines com benefício claro
- CTAs em imperativo ("Agende uma reunião", "Comece agora")
- NÃO faça observações sobre o nome do cliente — use exatamente como está

## Formato de resposta

REGRA ABSOLUTA: Retorne SOMENTE o JSON. Nenhum texto antes, nenhum texto depois, nenhuma observação, nenhum markdown. Comece com { e termine com }. Sem backticks. Sem explicações. APENAS o JSON puro.

{
  "siteName": "Nome do Projeto",
  "sections": [
    {
      "sectionId": "id-exato-do-catalogo",
      "type": "hero",
      "copy": {
        "headline": "Curta e direta",
        "subheadline": "Frase de apoio",
        "cta": "Botão"
      }
    }
  ],
  "tokens": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex"
  },
  "metadata": {
    "nicho": "nicho",
    "cliente": "Nome",
    "servicos": ["S1", "S2"]
  }
}`;

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    // Extrair texto da resposta
    const text = response.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('');

    // Parsear JSON
    let result;
    try {
      // Remove possíveis backticks de markdown e texto antes/depois do JSON
      let cleaned = text.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
      // Se começa com texto antes do JSON, extrair o JSON
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      if (jsonStart > 0 || jsonEnd < cleaned.length - 1) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      }
      result = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('❌ Erro ao parsear JSON da IA:', parseErr.message);
      console.error('Resposta raw:', text.substring(0, 500));
      return res.status(500).json({
        error: 'IA retornou resposta inválida',
        raw: text.substring(0, 1000),
      });
    }

    console.log(`✅ IA selecionou ${result.sections?.length || 0} seções para "${result.siteName}"`);

    // FASE 2: Para cada seção, pegar o HTML original e pedir à IA que reescreva em PT-BR
    console.log('📝 Reescrevendo seções em português...');
    const sectionsDir = path.join(__dirname, 'builder', 'sections');

    for (const sectionSpec of result.sections) {
      const manifestSection = manifest.sections.find(s => s.id === sectionSpec.sectionId);
      if (!manifestSection || !manifestSection.fragmentFile) continue;

      const fragmentPath = path.join(sectionsDir, manifestSection.fragmentFile);
      if (!fs.existsSync(fragmentPath)) continue;

      const originalHTML = fs.readFileSync(fragmentPath, 'utf-8');

      // Pular seções muito grandes (>1500 linhas) — deixa original
      if (originalHTML.split('\n').length > 1500) {
        sectionSpec.translatedHTML = originalHTML;
        continue;
      }

      try {
        const rewriteResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 8000,
          messages: [{
            role: 'user',
            content: `Reescreva este HTML trocando TODO o texto visível para português do Brasil. Mantenha TODA a estrutura HTML, classes CSS, atributos data-*, imagens e scripts intactos. Mude APENAS o conteúdo textual (h1, h2, h3, p, span, a, button, li, label, placeholder).

Use o seguinte copy como guia:
${JSON.stringify(sectionSpec.copy)}

Cliente: ${result.metadata?.cliente || result.siteName}
Serviços: ${result.metadata?.servicos?.join(', ') || 'serviços profissionais'}

Regras:
- Português do Brasil natural e profissional
- Substitua "Nexsas" pelo nome do cliente: "${result.metadata?.cliente || result.siteName}"
- Substitua "Lorem ipsum..." por texto real relevante ao negócio
- Mantenha números/stats plausíveis (ex: "500+ clientes", "15 anos")
- NÃO mude classes CSS, tags, estrutura, imagens, scripts
- NÃO adicione markdown — retorne APENAS o HTML puro
- NÃO envolva em backticks

HTML original:
${originalHTML}`
          }],
        });

        const rewritten = rewriteResponse.content
          .filter(c => c.type === 'text')
          .map(c => c.text)
          .join('')
          .replace(/```html?\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        // Verificar se parece HTML válido
        if (rewritten.includes('<') && rewritten.length > 50) {
          sectionSpec.translatedHTML = rewritten;
        } else {
          sectionSpec.translatedHTML = originalHTML;
        }
      } catch (rewriteErr) {
        console.warn(`  ⚠️ Falha ao reescrever ${sectionSpec.sectionId}: ${rewriteErr.message}`);
        sectionSpec.translatedHTML = originalHTML;
      }
    }

    console.log('✅ Reescrita concluída');

    // Agora montar o HTML real combinando fragmentos traduzidos
    const html = await buildFinalHTML(result);

    res.json({
      success: true,
      site: result,
      html: html,
    });

  } catch (err) {
    console.error('❌ Erro na API:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Montar HTML final
async function buildFinalHTML(result) {
  const sectionsDir = path.join(__dirname, 'builder', 'sections');

  // Pegar o primeiro template usado como base pro CSS
  const firstSection = result.sections[0];
  const baseTemplate = firstSection ? manifest.sections.find(s => s.id === firstSection.sectionId)?.template : 'payment-solution';

  let body = '';

  for (const sectionSpec of result.sections) {
    // Achar a seção no manifest
    const manifestSection = manifest.sections.find(s => s.id === sectionSpec.sectionId);

    if (!manifestSection || !manifestSection.fragmentFile) {
      body += `\n<!-- SEÇÃO NÃO ENCONTRADA: ${sectionSpec.sectionId} -->\n`;
      continue;
    }

    // Usar HTML traduzido pela IA (ou original como fallback)
    let fragment;
    if (sectionSpec.translatedHTML) {
      fragment = sectionSpec.translatedHTML;
    } else {
      const fragmentPath = path.join(sectionsDir, manifestSection.fragmentFile);
      if (!fs.existsSync(fragmentPath)) {
        body += `\n<!-- ARQUIVO NÃO ENCONTRADO: ${manifestSection.fragmentFile} -->\n`;
        continue;
      }
      fragment = fs.readFileSync(fragmentPath, 'utf-8');
    }

    body += `\n<!-- ===== ${sectionSpec.type.toUpperCase()}: ${manifestSection.name} (de ${manifestSection.template}) ===== -->\n`;
    body += fragment;
    body += '\n';
  }

  // Tokens customizados
  const tokens = result.tokens || {};
  const primaryColor = tokens.primaryColor || '#864ffe';
  const secondaryColor = tokens.secondaryColor || '#1a1a1c';

  // Montar HTML completo
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${result.siteName || 'Site Gerado'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./templates/${baseTemplate}/assets/main.css">
  <style>
    /* Tokens customizados pelo gerador */
    :root {
      --color-primary-500: ${primaryColor} !important;
      --color-primary-600: ${primaryColor} !important;
      --color-secondary: ${secondaryColor} !important;
    }
  </style>
</head>
<body>
${body}
  <script src="./templates/${baseTemplate}/vendor/swiper.min.js"></script>
  <script src="./templates/${baseTemplate}/vendor/gsap.min.js"></script>
  <script src="./templates/${baseTemplate}/vendor/scroll-trigger.min.js"></script>
  <script src="./templates/${baseTemplate}/vendor/lenis.min.js"></script>
  <script src="./templates/${baseTemplate}/vendor/number-counter.js"></script>
  <script src="./templates/${baseTemplate}/vendor/vanilla-infinite-marquee.min.js"></script>
  <script src="./templates/${baseTemplate}/vendor/split-text.min.js"></script>
  <script src="./templates/${baseTemplate}/vendor/springer.min.js"></script>
  <script src="./templates/${baseTemplate}/assets/main.js"></script>
</body>
</html>`;

  // Salvar em sites/
  const sitesDir = path.join(__dirname, 'sites');
  const slug = (result.siteName || 'site-gerado').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const siteDir = path.join(sitesDir, slug);
  if (!fs.existsSync(siteDir)) fs.mkdirSync(siteDir, { recursive: true });

  const outputPath = path.join(siteDir, 'index.html');
  fs.writeFileSync(outputPath, html);
  console.log(`💾 Site salvo em: ${outputPath}`);

  return html;
}

// Endpoint: Listar seções disponíveis (para o frontend)
app.get('/api/sections', (req, res) => {
  res.json(sectionsContext);
});

// Endpoint: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    templates: manifest.totalTemplates,
    sections: manifest.totalSections,
    gateway: process.env.ANTHROPIC_BASE_URL || 'não configurado',
    hasKey: !!process.env.ANTHROPIC_AUTH_TOKEN,
  });
});

// Start
const PORT = 3456;
app.listen(PORT, () => {
  console.log(`\n⚡ NextSaaS Builder rodando em http://localhost:${PORT}`);
  console.log(`   📊 ${manifest.totalSections} seções de ${manifest.totalTemplates} templates`);
  console.log(`   🤖 API Gateway: ${process.env.ANTHROPIC_BASE_URL || 'NÃO CONFIGURADO'}`);
  console.log(`   🔑 API Key: ${process.env.ANTHROPIC_AUTH_TOKEN ? '✅ configurada' : '❌ FALTANDO'}`);
  console.log(`\n   Abra http://localhost:${PORT} no browser\n`);
});
