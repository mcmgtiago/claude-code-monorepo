#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function expandHome(p) {
  if (!p) return p;
  if (p === '~') return os.homedir();
  if (p.startsWith('~/') || p.startsWith('~\\')) return path.join(os.homedir(), p.slice(2));
  return p;
}

function loadEnvFile(filePath) {
  const expanded = expandHome(filePath);
  if (!fs.existsSync(expanded)) return;
  const text = fs.readFileSync(expanded, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile('~/.claude/free-stock-media.env');
loadEnvFile(path.join(process.cwd(), '.env'));

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const eq = token.indexOf('=');
    if (eq !== -1) {
      args[token.slice(2, eq)] = token.slice(eq + 1);
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const action = args.action;
const provider = args.provider || (action === 'search' ? 'all' : 'pexels');
const type = args.type;
const query = args.query;
const orientation = args.orientation;
const perPage = Number(args['per-page'] || args.perPage || 10);
const page = Number(args.page || 1);
const outputJson = Boolean(args.json);

function fail(message, data = {}) {
  const payload = { ok: false, error: message, ...data };
  if (outputJson) console.error(JSON.stringify(payload));
  else console.error(`Erro: ${message}`);
  process.exit(1);
}

function requireArg(name, value) {
  if (!value) fail(`parâmetro obrigatório ausente: --${name}`);
}

function sanitizeFileName(value) {
  return String(value || 'media')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'media';
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status} em ${url}: ${body.slice(0, 300)}`);
  }
  return response.json();
}

function normalizeOrientationForPixabay(value) {
  if (!value) return undefined;
  if (value === 'landscape' || value === 'horizontal') return 'horizontal';
  if (value === 'portrait' || value === 'vertical') return 'vertical';
  return value;
}

async function searchPexelsImages() {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return { provider: 'pexels', type: 'image', skipped: true, reason: 'PEXELS_API_KEY não configurada' };
  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('page', String(page));
  if (orientation) url.searchParams.set('orientation', orientation);
  const data = await requestJson(url, { headers: { Authorization: key } });
  return {
    provider: 'pexels',
    type: 'image',
    total: data.total_results,
    page: data.page,
    results: (data.photos || []).map((p) => ({
      provider: 'pexels',
      type: 'image',
      id: p.id,
      width: p.width,
      height: p.height,
      photographer: p.photographer,
      photographerUrl: p.photographer_url,
      url: p.url,
      avgColor: p.avg_color,
      preview: p.src?.medium,
      variants: p.src
    }))
  };
}

async function searchPexelsVideos() {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return { provider: 'pexels', type: 'video', skipped: true, reason: 'PEXELS_API_KEY não configurada' };
  const url = new URL('https://api.pexels.com/videos/search');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('page', String(page));
  if (orientation) url.searchParams.set('orientation', orientation);
  const data = await requestJson(url, { headers: { Authorization: key } });
  return {
    provider: 'pexels',
    type: 'video',
    total: data.total_results,
    page: data.page,
    results: (data.videos || []).map((v) => ({
      provider: 'pexels',
      type: 'video',
      id: v.id,
      width: v.width,
      height: v.height,
      duration: v.duration,
      user: v.user?.name,
      userUrl: v.user?.url,
      url: v.url,
      preview: v.image,
      files: (v.video_files || []).map((f) => ({
        id: f.id,
        quality: f.quality,
        fileType: f.file_type,
        width: f.width,
        height: f.height,
        fps: f.fps,
        link: f.link
      }))
    }))
  };
}

async function searchPixabayImages() {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return { provider: 'pixabay', type: 'image', skipped: true, reason: 'PIXABAY_API_KEY não configurada' };
  const url = new URL('https://pixabay.com/api/');
  url.searchParams.set('key', key);
  url.searchParams.set('q', query);
  url.searchParams.set('image_type', 'photo');
  url.searchParams.set('safesearch', 'true');
  url.searchParams.set('per_page', String(Math.min(Math.max(perPage, 3), 200)));
  url.searchParams.set('page', String(page));
  const pixabayOrientation = normalizeOrientationForPixabay(orientation);
  if (pixabayOrientation && pixabayOrientation !== 'square') url.searchParams.set('orientation', pixabayOrientation);
  const data = await requestJson(url);
  return {
    provider: 'pixabay',
    type: 'image',
    total: data.totalHits,
    page,
    results: (data.hits || []).map((p) => ({
      provider: 'pixabay',
      type: 'image',
      id: p.id,
      width: p.imageWidth,
      height: p.imageHeight,
      user: p.user,
      userUrl: `https://pixabay.com/users/${p.user}-${p.user_id}/`,
      url: p.pageURL,
      preview: p.previewURL,
      tags: p.tags,
      variants: {
        preview: p.previewURL,
        webformat: p.webformatURL,
        large: p.largeImageURL,
        fullHD: p.fullHDURL,
        original: p.imageURL
      }
    }))
  };
}

async function searchPixabayVideos() {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return { provider: 'pixabay', type: 'video', skipped: true, reason: 'PIXABAY_API_KEY não configurada' };
  const url = new URL('https://pixabay.com/api/videos/');
  url.searchParams.set('key', key);
  url.searchParams.set('q', query);
  url.searchParams.set('safesearch', 'true');
  url.searchParams.set('per_page', String(Math.min(Math.max(perPage, 3), 200)));
  url.searchParams.set('page', String(page));
  const pixabayOrientation = normalizeOrientationForPixabay(orientation);
  if (pixabayOrientation && pixabayOrientation !== 'square') url.searchParams.set('orientation', pixabayOrientation);
  const data = await requestJson(url);
  return {
    provider: 'pixabay',
    type: 'video',
    total: data.totalHits,
    page,
    results: (data.hits || []).map((v) => ({
      provider: 'pixabay',
      type: 'video',
      id: v.id,
      width: v.videos?.large?.width || v.videos?.medium?.width,
      height: v.videos?.large?.height || v.videos?.medium?.height,
      duration: v.duration,
      user: v.user,
      userUrl: `https://pixabay.com/users/${v.user}-${v.user_id}/`,
      url: v.pageURL,
      preview: v.picture_id ? `https://i.vimeocdn.com/video/${v.picture_id}_640x360.jpg` : undefined,
      tags: v.tags,
      files: v.videos
    }))
  };
}

async function search() {
  requireArg('type', type);
  requireArg('query', query);
  const providers = provider === 'all' ? ['pexels', 'pixabay'] : [provider];
  const tasks = [];
  for (const p of providers) {
    if (p === 'pexels' && type === 'image') tasks.push(searchPexelsImages());
    else if (p === 'pexels' && type === 'video') tasks.push(searchPexelsVideos());
    else if (p === 'pixabay' && type === 'image') tasks.push(searchPixabayImages());
    else if (p === 'pixabay' && type === 'video') tasks.push(searchPixabayVideos());
    else fail(`combinação inválida: provider=${p}, type=${type}`);
  }
  const settled = await Promise.allSettled(tasks);
  const sources = settled.map((s) => s.status === 'fulfilled' ? s.value : { ok: false, error: s.reason?.message || String(s.reason) });
  const payload = { ok: true, action: 'search', query, orientation, sources };
  printPayload(payload);
}

async function getPexelsImageById(id) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) fail('PEXELS_API_KEY não configurada');
  const data = await requestJson(`https://api.pexels.com/v1/photos/${encodeURIComponent(id)}`, { headers: { Authorization: key } });
  return {
    provider: 'pexels', type: 'image', id: data.id, author: data.photographer, pageUrl: data.url,
    url: data.src?.[args.variant || 'large2x'] || data.src?.original || data.src?.large,
    ext: '.jpg'
  };
}

async function getPexelsVideoById(id) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) fail('PEXELS_API_KEY não configurada');
  const data = await requestJson(`https://api.pexels.com/videos/videos/${encodeURIComponent(id)}`, { headers: { Authorization: key } });
  const files = data.video_files || [];
  const variant = args.variant || 'hd';
  let file;
  if (variant === 'best') file = [...files].sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
  else if (variant === 'smallest') file = [...files].sort((a, b) => (a.width * a.height) - (b.width * b.height))[0];
  else file = files.find((f) => f.quality === variant) || files[0];
  if (!file) fail(`vídeo Pexels ${id} não possui arquivos disponíveis`);
  return {
    provider: 'pexels', type: 'video', id: data.id, author: data.user?.name, pageUrl: data.url,
    url: file.link,
    ext: file.file_type?.includes('mp4') ? '.mp4' : '.video'
  };
}

async function getPixabayImageById(id) {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) fail('PIXABAY_API_KEY não configurada');
  const url = new URL('https://pixabay.com/api/');
  url.searchParams.set('key', key);
  url.searchParams.set('id', id);
  const data = await requestJson(url);
  const item = data.hits?.[0];
  if (!item) fail(`imagem Pixabay ${id} não encontrada`);
  const variant = args.variant || 'large';
  const mediaUrl = item[variant === 'original' ? 'imageURL' : variant === 'fullHD' ? 'fullHDURL' : variant === 'webformat' ? 'webformatURL' : 'largeImageURL'] || item.largeImageURL || item.webformatURL;
  return {
    provider: 'pixabay', type: 'image', id: item.id, author: item.user, pageUrl: item.pageURL,
    url: mediaUrl,
    ext: '.jpg'
  };
}

async function getPixabayVideoById(id) {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) fail('PIXABAY_API_KEY não configurada');
  const url = new URL('https://pixabay.com/api/videos/');
  url.searchParams.set('key', key);
  url.searchParams.set('id', id);
  const data = await requestJson(url);
  const item = data.hits?.[0];
  if (!item) fail(`vídeo Pixabay ${id} não encontrado`);
  const variant = args.variant || 'large';
  const video = item.videos?.[variant] || item.videos?.large || item.videos?.medium || item.videos?.small || item.videos?.tiny;
  if (!video?.url) fail(`vídeo Pixabay ${id} não possui variante ${variant}`);
  return {
    provider: 'pixabay', type: 'video', id: item.id, author: item.user, pageUrl: item.pageURL,
    url: video.url,
    ext: '.mp4'
  };
}

async function downloadFile(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} ao baixar ${url}`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
}

async function download() {
  requireArg('provider', provider);
  requireArg('type', type);
  requireArg('id', args.id);
  let item;
  if (provider === 'pexels' && type === 'image') item = await getPexelsImageById(args.id);
  else if (provider === 'pexels' && type === 'video') item = await getPexelsVideoById(args.id);
  else if (provider === 'pixabay' && type === 'image') item = await getPixabayImageById(args.id);
  else if (provider === 'pixabay' && type === 'video') item = await getPixabayVideoById(args.id);
  else fail(`combinação inválida para download: provider=${provider}, type=${type}`);

  const outDir = expandHome(args['output-dir'] || args.outputDir || '~/.claude/media/free-stock');
  const prefix = sanitizeFileName(args.prefix || `${item.provider}-${item.type}-${item.id}`);
  const outputPath = path.join(outDir, `${prefix}${item.ext}`);
  await downloadFile(item.url, outputPath);
  const metaPath = `${outputPath}.json`;
  fs.writeFileSync(metaPath, JSON.stringify({ ...item, downloadedAt: new Date().toISOString(), outputPath }, null, 2));
  printPayload({ ok: true, action: 'download', item, outputPath, metaPath });
}

function printPayload(payload) {
  if (outputJson) {
    console.log(JSON.stringify(payload));
    return;
  }
  if (payload.action === 'search') {
    console.log(`Busca: ${payload.query}`);
    for (const source of payload.sources) {
      if (source.skipped) {
        console.log(`\n[${source.provider}/${source.type}] ignorado: ${source.reason}`);
        continue;
      }
      if (source.error) {
        console.log(`\n[erro] ${source.error}`);
        continue;
      }
      console.log(`\n[${source.provider}/${source.type}] total aproximado: ${source.total ?? 'n/d'}`);
      for (const item of source.results || []) {
        console.log(`- ID ${item.id} | ${item.width || '?'}x${item.height || '?'}${item.duration ? ` | ${item.duration}s` : ''}`);
        console.log(`  Autor: ${item.photographer || item.user || 'n/d'}`);
        console.log(`  Página: ${item.url}`);
        console.log(`  Preview: ${item.preview || 'n/d'}`);
      }
    }
    return;
  }
  console.log(`Baixado: ${payload.outputPath}`);
  console.log(`Metadados: ${payload.metaPath}`);
  console.log(`Autor: ${payload.item.author || 'n/d'}`);
  console.log(`Página: ${payload.item.pageUrl}`);
}

if (!action) fail('use --action search ou --action download');
if (action === 'search') search().catch((error) => fail(error.message));
else if (action === 'download') download().catch((error) => fail(error.message));
else fail(`ação inválida: ${action}`);
