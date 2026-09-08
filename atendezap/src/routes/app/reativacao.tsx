import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { RotateCcw, Upload, Mail, Users, CheckCircle2, Ban, Send } from "lucide-react";
import { importReactivationContacts, getReactivationStats } from "@/lib/reactivation.functions";

export const Route = createFileRoute("/app/reativacao")({
  head: () => ({ meta: [{ title: `${brand.name} — Recuperação de Base` }] }),
  component: ReativacaoPage,
});

type Contact = { email: string; nome?: string; telefone?: string };

const EMAIL_RE = /[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+/;

// Parse colado/CSV: detecta a coluna de e-mail e usa o 1º texto não-e-mail como nome.
function parseContacts(raw: string): Contact[] {
  const out: Contact[] = [];
  const seen = new Set<string>();
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = line.split(/[,;\t]/).map((c) => c.trim()).filter(Boolean);
    const emailCell = cells.find((c) => EMAIL_RE.test(c));
    if (!emailCell) continue;
    const email = (emailCell.match(EMAIL_RE)?.[0] ?? "").toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    const rest = cells.filter((c) => c !== emailCell);
    const nome = rest.find((c) => !/^\+?[\d()\-\s]{7,}$/.test(c)) ?? "";
    const telefone = rest.find((c) => /^\+?[\d()\-\s]{7,}$/.test(c)) ?? "";
    out.push({ email, nome, telefone });
  }
  return out;
}

const DEFAULT_SUBJECT = "We miss you, {nome}! 👋";
const DEFAULT_BODY =
  "Hi {nome},\n\nIt's been a while since we last took care of your place. As a valued past customer of {empresa}, we'd love to welcome you back — and we have a special offer waiting for you.\n\nBook your next visit in just a few taps.";

function ReativacaoPage() {
  const ctx = Route.useRouteContext();
  const companyId = ctx.company?.id ?? "";
  const importFn = useServerFn(importReactivationContacts);
  const statsFn = useServerFn(getReactivationStats);

  const [raw, setRaw] = useState("");
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [campaignName, setCampaignName] = useState("Reativação");
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  const contacts = parseContacts(raw);

  async function loadStats() {
    if (!companyId) return;
    try { setStats(await statsFn({ data: { companyId } })); } catch { /* tabela pode não existir ainda */ }
  }
  useEffect(() => { loadStats(); /* eslint-disable-next-line */ }, [companyId]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setRaw(String(reader.result ?? ""));
    reader.readAsText(f);
  }

  async function start() {
    if (contacts.length === 0) return toast.error("Cole ou suba uma lista com e-mails válidos");
    if (subject.trim().length < 2 || body.trim().length < 5) return toast.error("Preencha assunto e mensagem");
    setBusy(true);
    try {
      const r = await importFn({ data: { companyId, subject, body, campaignName, contacts } });
      toast.success(`${r.queued} contato(s) na fila de reativação 🚀`);
      setRaw("");
      loadStats();
    } catch (e: any) {
      toast.error(e?.message || "Falhou ao importar");
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2"><RotateCcw className="size-6" /> Recuperação de Base</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Reative clientes antigos por e-mail — sem investir em anúncios. Importe a lista, escreva a oferta e o sistema dispara em ondas com follow-up e opt-out automáticos.</p>
      </div>

      {stats && stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={<Users />} label="Na base" value={stats.total} />
          <StatCard icon={<Send />} label="A enviar" value={stats.pending ?? 0} />
          <StatCard icon={<CheckCircle2 />} label="Concluídos" value={stats.done ?? 0} />
          <StatCard icon={<Ban />} label="Descadastros" value={stats.unsubscribed ?? 0} />
        </div>
      )}

      <div className="panel p-5 space-y-4">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2"><Upload className="size-4" /> Lista de clientes (e-mail obrigatório; nome e telefone opcionais)</Label>
          <Textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={6}
            placeholder={"Cole aqui (1 por linha ou CSV):\njohn@email.com, John Smith, +1 305...\nmary@email.com"} className="font-mono text-[13px]" />
          <div className="flex items-center justify-between">
            <input type="file" accept=".csv,.txt" onChange={onFile} className="text-xs text-muted-foreground" />
            <span className="text-[12px] font-medium" style={{ color: contacts.length ? "var(--brand-text)" : undefined }}>
              {contacts.length} e-mail(s) detectado(s)
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Nome da campanha</Label><Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Assunto do e-mail</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2"><Mail className="size-4" /> Mensagem</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={7} />
          <p className="text-[12px] text-muted-foreground">Use <code>{"{nome}"}</code> e <code>{"{empresa}"}</code> — são preenchidos automaticamente. Um botão "Book now" e o link de descadastro são adicionados sozinhos.</p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button onClick={start} disabled={busy || contacts.length === 0}>
            {busy ? "Enviando para a fila…" : <><Send className="size-4 mr-1.5" /> Importar e iniciar campanha</>}
          </Button>
        </div>
      </div>

      <p className="text-[12px] text-muted-foreground">
        Os envios saem em lotes ao longo das horas (protege a reputação do domínio), com 2 follow-ups automáticos para quem não respondeu. Para máxima entrega, verifique o domínio do cliente no Resend.
      </p>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="panel p-4">
      <div className="size-8 rounded-lg grid place-items-center mb-2 bg-[color:var(--brand-soft)] text-[color:var(--brand-text)] [&>svg]:size-4">{icon}</div>
      <div className="text-2xl font-bold leading-none">{value}</div>
      <div className="text-[12px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
