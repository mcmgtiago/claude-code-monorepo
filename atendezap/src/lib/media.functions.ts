import { createServerFn } from "@tanstack/react-start";

// Uma linha = uma campanha/criativo. GMB vira uma linha "orgânica".
export type MediaRow = {
  platform: string;   // Google Ads | Facebook | Instagram | Google My Business
  campaign: string;
  creative: string;
  type: string;       // video | image | carousel | search | organic
  investment: number;
  impressions: number;
  clicks: number;
  leads: number;      // form-fills / conversões
  clients: number;    // leads que viraram cliente pagante (traqueamento)
  revenue: number;    // receita gerada por esses clientes
  rating?: number;    // só GMB
};

export type Agg = { name: string; investment: number; leads: number; clients: number; revenue: number; clicks: number; impressions: number; cpl: number; cac: number };

export type MediaPerformance = {
  mode: "demo" | "real";
  period: string;
  totals: { investment: number; leads: number; clients: number; revenue: number; cpl: number; cac: number; roas: number; impressions: number; clicks: number };
  byPlatform: Agg[];
  topCampaigns: { campaign: string; platform: string; investment: number; leads: number; clients: number; revenue: number; cpl: number }[];
  topCreatives: { creative: string; type: string; platform: string; investment: number; leads: number; cpl: number }[];
  byType: { type: string; investment: number; leads: number; cpl: number }[];
  formFills: { source: string; leads: number; clients: number }[];
  gmb: { views: number; calls: number; rating: number; leads: number } | null;
};

const cpl = (inv: number, leads: number) => (leads ? Math.round((inv / leads) * 100) / 100 : 0);
const isGmb = (p: string) => /neg[oó]cio|my business|gmb/i.test(p);

const cac = (inv: number, clients: number) => (clients ? Math.round((inv / clients) * 100) / 100 : 0);

function aggregate(rows: MediaRow[], mode: "demo" | "real", period: string): MediaPerformance {
  const paid = rows.filter((r) => !isGmb(r.platform));
  const gmbRows = rows.filter((r) => isGmb(r.platform));

  const byPlatformMap = new Map<string, Agg>();
  for (const r of paid) {
    const a = byPlatformMap.get(r.platform) ?? { name: r.platform, investment: 0, leads: 0, clients: 0, revenue: 0, clicks: 0, impressions: 0, cpl: 0, cac: 0 };
    a.investment += r.investment; a.leads += r.leads; a.clients += r.clients; a.revenue += r.revenue; a.clicks += r.clicks; a.impressions += r.impressions;
    byPlatformMap.set(r.platform, a);
  }
  const byPlatform = [...byPlatformMap.values()].map((a) => ({ ...a, cpl: cpl(a.investment, a.leads), cac: cac(a.investment, a.clients) })).sort((x, y) => y.revenue - x.revenue);

  const byCampaignMap = new Map<string, { campaign: string; platform: string; investment: number; leads: number; clients: number; revenue: number }>();
  for (const r of paid) {
    const k = `${r.platform}|${r.campaign}`;
    const a = byCampaignMap.get(k) ?? { campaign: r.campaign, platform: r.platform, investment: 0, leads: 0, clients: 0, revenue: 0 };
    a.investment += r.investment; a.leads += r.leads; a.clients += r.clients; a.revenue += r.revenue;
    byCampaignMap.set(k, a);
  }
  const topCampaigns = [...byCampaignMap.values()].map((a) => ({ ...a, cpl: cpl(a.investment, a.leads) })).sort((x, y) => y.revenue - x.revenue).slice(0, 6);

  const topCreatives = paid
    .filter((r) => r.creative)
    .map((r) => ({ creative: r.creative, type: r.type, platform: r.platform, investment: r.investment, leads: r.leads, cpl: cpl(r.investment, r.leads) }))
    .sort((x, y) => y.leads - x.leads).slice(0, 6);

  const byTypeMap = new Map<string, { type: string; investment: number; leads: number }>();
  for (const r of paid) {
    const t = r.type || "outros";
    const a = byTypeMap.get(t) ?? { type: t, investment: 0, leads: 0 };
    a.investment += r.investment; a.leads += r.leads;
    byTypeMap.set(t, a);
  }
  const byType = [...byTypeMap.values()].map((a) => ({ ...a, cpl: cpl(a.investment, a.leads) })).sort((x, y) => y.leads - x.leads);

  const formFills = byPlatform.map((p) => ({ source: p.name, leads: p.leads, clients: p.clients }));

  const investment = paid.reduce((s, r) => s + r.investment, 0);
  const leadsPaid = paid.reduce((s, r) => s + r.leads, 0);
  const leadsGmb = gmbRows.reduce((s, r) => s + r.leads, 0);
  const clients = paid.reduce((s, r) => s + r.clients, 0) + gmbRows.reduce((s, r) => s + r.clients, 0);
  const revenue = paid.reduce((s, r) => s + r.revenue, 0) + gmbRows.reduce((s, r) => s + r.revenue, 0);
  const impressions = paid.reduce((s, r) => s + r.impressions, 0);
  const clicks = paid.reduce((s, r) => s + r.clicks, 0);
  const gmb = gmbRows.length
    ? { views: gmbRows.reduce((s, r) => s + r.impressions, 0), calls: gmbRows.reduce((s, r) => s + r.clicks, 0), rating: gmbRows[0].rating ?? 0, leads: leadsGmb }
    : null;

  return {
    mode, period,
    totals: {
      investment, leads: leadsPaid + leadsGmb, clients, revenue,
      cpl: cpl(investment, leadsPaid), cac: cac(investment, clients),
      roas: investment ? Math.round((revenue / investment) * 10) / 10 : 0,
      impressions, clicks,
    },
    byPlatform, topCampaigns, topCreatives, byType, formFills, gmb,
  };
}

const DEMO_ROWS: MediaRow[] = [
  { platform: "Google Ads", campaign: "Landscaping Orlando — Search", creative: "Anúncio de busca — Free Estimate", type: "search", investment: 1400, impressions: 32000, clicks: 1100, leads: 28, clients: 4, revenue: 14000 },
  { platform: "Google Ads", campaign: "Lawn & Design — Search", creative: "Anúncio de busca — Design", type: "search", investment: 1000, impressions: 22000, clicks: 720, leads: 19, clients: 2, revenue: 7000 },
  { platform: "Facebook", campaign: "Before/After — Reels", creative: "Reel transformação de quintal", type: "video", investment: 600, impressions: 41000, clicks: 520, leads: 14, clients: 2, revenue: 7500 },
  { platform: "Facebook", campaign: "Lawn Care Promo", creative: "Imagem — antes/depois", type: "image", investment: 500, impressions: 18000, clicks: 380, leads: 9, clients: 1, revenue: 3200 },
  { platform: "Instagram", campaign: "Backyard Transformation", creative: "Reel iluminação noturna", type: "video", investment: 500, impressions: 38000, clicks: 610, leads: 12, clients: 2, revenue: 7000 },
  { platform: "Instagram", campaign: "Lighting Showcase", creative: "Carrossel de projetos", type: "carousel", investment: 200, impressions: 12000, clicks: 210, leads: 5, clients: 1, revenue: 3800 },
  { platform: "Google My Business", campaign: "Perfil", creative: "", type: "organic", investment: 0, impressions: 9800, clicks: 27, leads: 12, clients: 1, revenue: 3500, rating: 4.8 },
];

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (cells[i] ?? "").trim(); });
    return row;
  });
}
const num = (v?: string) => Number(String(v ?? "").replace(/[^0-9.-]/g, "")) || 0;

export const getMediaPerformance = createServerFn({ method: "POST" })
  .inputValidator((d: { mode?: "demo" | "real"; sheetUrl?: string; period?: string }) => ({
    mode: d.mode === "real" ? "real" : "demo",
    sheetUrl: d.sheetUrl ? String(d.sheetUrl).trim() : "",
    period: d.period || "Últimos 30 dias",
  }))
  .handler(async ({ data }): Promise<MediaPerformance> => {
    if (data.mode === "demo") return aggregate(DEMO_ROWS, "demo", data.period);

    if (!/^https:\/\/(docs\.google\.com|[a-z0-9-]+\.googleusercontent\.com)\//i.test(data.sheetUrl)) {
      throw new Error("Use o link CSV publicado do Google Sheets (Arquivo → Publicar na web → CSV).");
    }
    let text = "";
    try {
      const res = await fetch(data.sheetUrl, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      text = await res.text();
    } catch { throw new Error("Não consegui ler a planilha. Verifique se está publicada como CSV."); }

    const rows: MediaRow[] = parseCsv(text).map((r) => ({
      platform: r.platform ?? r.plataforma ?? "",
      campaign: r.campaign ?? r.campanha ?? "",
      creative: r.creative ?? r.criativo ?? "",
      type: (r.type ?? r.tipo ?? "").toLowerCase(),
      investment: num(r.investment ?? r.investimento),
      impressions: num(r.impressions ?? r.impressoes),
      clicks: num(r.clicks ?? r.cliques),
      leads: num(r.leads),
      clients: num(r.clients ?? r.clientes),
      revenue: num(r.revenue ?? r.receita),
      rating: r.rating ? num(r.rating) : undefined,
    })).filter((r) => r.platform);
    if (rows.length === 0) throw new Error("A planilha não tem dados no formato esperado.");
    return aggregate(rows, "real", data.period);
  });
