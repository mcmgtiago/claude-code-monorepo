import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getMediaPerformance, type MediaPerformance } from "@/lib/media.functions";
import { fmtMoney, currencyOf } from "@/config/money";
import {
  Megaphone, DollarSign, Users, Target, TrendingUp, Loader2, Link2, Star, Phone, Eye,
  UserCheck, Trophy, Video, Image as ImageIcon, Search,
} from "lucide-react";

export const Route = createFileRoute("/app/midia")({
  head: () => ({ meta: [{ title: `${brand.name} — Performance de Mídia` }] }),
  beforeLoad: ({ context }: any) => {
    const r = context?.membership?.role;
    if (r === "atendente") throw redirect({ to: "/app/dashboard" });
  },
  component: MidiaPage,
});

const PLAT_GRAD: Record<string, string> = {
  "Google Ads": "linear-gradient(135deg,#4285F4,#34A853)",
  Facebook: "linear-gradient(135deg,#0866ff,#0a3d91)",
  Instagram: "linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)",
  "Google My Business": "linear-gradient(135deg,#34A853,#4285F4)",
};
const typeIcon = (t: string) => t === "video" ? <Video className="size-3.5" /> : t === "search" ? <Search className="size-3.5" /> : <ImageIcon className="size-3.5" />;

function MidiaPage() {
  const ctx = Route.useRouteContext();
  const companyId = ctx.company?.id ?? "";
  const fetchPerf = useServerFn(getMediaPerformance);
  const [mode, setMode] = useState<"demo" | "real">("demo");
  const [sheetUrl, setSheetUrl] = useState("");
  const [data, setData] = useState<MediaPerformance | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { try { setSheetUrl(localStorage.getItem(`media_sheet_${companyId}`) || ""); } catch {} }, [companyId]);

  async function load(m: "demo" | "real", url = sheetUrl) {
    setLoading(true);
    try { setData(await fetchPerf({ data: { mode: m, sheetUrl: url } })); }
    catch (e: any) { toast.error(e?.message || "Falha ao carregar"); if (m === "real") setData(null); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load("demo"); /* eslint-disable-next-line */ }, []);

  function switchMode(m: "demo" | "real") {
    setMode(m);
    if (m === "demo") void load("demo");
    else if (sheetUrl) void load("real");
    else setData(null);
  }
  function connectSheet() {
    if (!sheetUrl.trim()) return toast.error("Cole o link CSV da planilha");
    try { localStorage.setItem(`media_sheet_${companyId}`, sheetUrl.trim()); } catch {}
    void load("real", sheetUrl.trim());
  }

  const cur = currencyOf((ctx.company as any)?.currency);
  const usd = (n: number) => fmtMoney(n, cur, { decimals: 0 });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Megaphone className="size-6 text-[color:var(--brand-text)]" /> Performance de Mídia
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Investimento, leads, clientes e receita — o ROI dos anúncios.</p>
        </div>
        <div className="inline-flex rounded-lg border border-[color:var(--hairline)] bg-[color:var(--panel)] p-1">
          {(["demo", "real"] as const).map((m) => (
            <button key={m} onClick={() => switchMode(m)}
              className={`px-3.5 py-1.5 text-[13px] font-semibold rounded-md transition-colors ${mode === m ? "bg-[color:var(--brand-soft)] text-[color:var(--brand-text)]" : "text-muted-foreground hover:text-foreground"}`}>
              {m === "demo" ? "Demonstração" : "Dados reais"}
            </button>
          ))}
        </div>
      </header>

      {mode === "real" && !data && !loading && (
        <div className="panel p-5 space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 font-semibold"><Link2 className="size-4 text-[color:var(--brand-text)]" /> Conectar planilha de mídia</div>
          <p className="text-[13px] text-muted-foreground">Cole o link CSV publicado do Google Sheets (Arquivo → Compartilhar → <b>Publicar na web</b> → CSV). Use o modelo que entregamos.</p>
          <div className="flex gap-2">
            <Input value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} placeholder="https://docs.google.com/…/pub?output=csv" />
            <Button onClick={connectSheet}>Conectar</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center py-16 text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>
      ) : data ? (
        <>
          {mode === "demo" && (
            <div className="text-[12px] text-[color:var(--brand-text)] bg-[color:var(--brand-soft)] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full">✨ Dados de demonstração · {data.period}</div>
          )}

          {/* Totais — o ROI */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
            <Kpi icon={<DollarSign />} label="Investido" value={usd(data.totals.investment)} />
            <Kpi icon={<Users />} label="Leads" value={data.totals.leads} />
            <Kpi icon={<UserCheck />} label="Clientes fechados" value={data.totals.clients} accent />
            <Kpi icon={<DollarSign />} label="Receita gerada" value={usd(data.totals.revenue)} accent />
            <Kpi icon={<TrendingUp />} label="ROAS" value={data.totals.roas ? `${data.totals.roas}x` : "—"} accent />
          </div>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <Kpi icon={<Target />} label="Custo por lead (CPL)" value={usd(data.totals.cpl)} small />
            <Kpi icon={<Target />} label="Custo por cliente (CAC)" value={usd(data.totals.cac)} small />
            <Kpi icon={<Eye />} label="Impressões" value={data.totals.impressions.toLocaleString("pt-BR")} small />
            <Kpi icon={<Users />} label="Cliques" value={data.totals.clicks.toLocaleString("pt-BR")} small />
          </div>

          {/* Por plataforma (Google, Facebook, Instagram, GMB separados) */}
          <Section title="Por plataforma">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {data.byPlatform.map((p) => (
                <div key={p.name} className="panel p-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-lg grid place-items-center text-white shrink-0" style={{ background: PLAT_GRAD[p.name] ?? "linear-gradient(135deg,#0efa71,#00b858)" }}><Megaphone className="size-4" /></div>
                    <div className="font-semibold text-[14px] truncate">{p.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Mini label="Investido" value={usd(p.investment)} />
                    <Mini label="Leads" value={String(p.leads)} />
                    <Mini label="Clientes" value={String(p.clients)} />
                    <Mini label="Receita" value={usd(p.revenue)} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Form-fills por fonte */}
          <Section title="Quem preencheu o formulário (por fonte)">
            <div className="panel p-5 space-y-3">
              {data.formFills.map((f) => {
                const max = Math.max(...data.formFills.map((x) => x.leads), 1);
                return (
                  <div key={f.source} className="flex items-center gap-3">
                    <div className="w-36 text-[13px] font-medium shrink-0 truncate">{f.source}</div>
                    <div className="flex-1 h-2.5 rounded-full bg-[color:var(--panel-2)] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(f.leads / max) * 100}%`, background: PLAT_GRAD[f.source] ?? "var(--brand)" }} />
                    </div>
                    <div className="text-[13px] text-muted-foreground w-32 text-right shrink-0">{f.leads} leads · <b className="text-foreground">{f.clients}</b> clientes</div>
                  </div>
                );
              })}
            </div>
          </Section>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Melhores campanhas (por receita) */}
            <Section title="Melhores campanhas" icon={<Trophy className="size-4 text-amber-500" />}>
              <div className="panel divide-y divide-[color:var(--hairline)]">
                {data.topCampaigns.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <span className="text-[12px] font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-medium truncate">{c.campaign}</div>
                      <div className="text-[11.5px] text-muted-foreground">{c.platform} · {c.leads} leads · {c.clients} clientes</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13.5px] font-bold text-[color:var(--brand-text)]">{usd(c.revenue)}</div>
                      <div className="text-[11px] text-muted-foreground">CPL {usd(c.cpl)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Melhores criativos (vídeo/imagem) */}
            <Section title="Melhores criativos">
              <div className="panel divide-y divide-[color:var(--hairline)]">
                {data.topCreatives.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <span className="size-7 rounded-lg grid place-items-center bg-[color:var(--panel-2)] text-[color:var(--brand-text)] shrink-0">{typeIcon(c.type)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-medium truncate">{c.creative}</div>
                      <div className="text-[11.5px] text-muted-foreground capitalize">{c.type} · {c.platform}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13.5px] font-bold">{c.leads} leads</div>
                      <div className="text-[11px] text-muted-foreground">CPL {usd(c.cpl)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* GMB */}
          {data.gmb && (
            <Section title="Google Meu Negócio">
              <div className="panel p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Mini label="Visualizações" value={data.gmb.views.toLocaleString("pt-BR")} icon={<Eye className="size-3" />} />
                <Mini label="Ligações" value={String(data.gmb.calls)} icon={<Phone className="size-3" />} />
                <Mini label="Leads" value={String(data.gmb.leads)} />
                <Mini label="Avaliação" value={`${data.gmb.rating} ★`} icon={<Star className="size-3" />} />
              </div>
            </Section>
          )}
        </>
      ) : null}
    </div>
  );
}

function Kpi({ icon, label, value, accent, small }: { icon: React.ReactNode; label: string; value: string | number; accent?: boolean; small?: boolean }) {
  return (
    <div className={`panel ${small ? "p-3" : "p-4"} ${accent ? "ring-1 ring-[color:var(--brand)]/30" : ""}`}>
      <div className="size-7 rounded-lg grid place-items-center mb-2 bg-[color:var(--brand-soft)] text-[color:var(--brand-text)] [&>svg]:size-4">{icon}</div>
      <div className={`${small ? "text-lg" : "text-2xl"} font-bold leading-none`}>{value}</div>
      <div className="text-[11.5px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
function Mini({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[color:var(--panel-2)] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">{icon}{label}</div>
      <div className="text-[14px] font-bold mt-0.5">{value}</div>
    </div>
  );
}
function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">{icon}{title}</h2>
      {children}
    </div>
  );
}
