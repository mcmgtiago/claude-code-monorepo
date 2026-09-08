import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { brand } from "@/config/brand";
import { Bot, Loader2, Send, Sparkles, Lock, ChevronDown, Settings2 } from "lucide-react";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { buildSystemPrompt } from "@/lib/ai-prompt";

export const Route = createFileRoute("/demo/agente")({
  head: () => ({ meta: [{ title: `${brand.name} — Agente IA (demo)` }] }),
  component: AgenteDemo,
});

const DESCRICAO_DEMO = `Silva Flooring LLC — flooring company serving Miami-Dade and Broward County, FL. Licensed & insured. We install hardwood, LVP/vinyl plank, tile, carpet and do floor refinishing. Operating Mon–Sat 7am–6pm. When a lead contacts us, the AI should: greet professionally, identify the type of flooring they need and the square footage, give a ballpark price range, and schedule a free in-home estimate. Pass to Roberto for final negotiation and contract signing.`;

const CFG: any = {
  nome_agente: "Sam",
  nome_empresa: "Silva Flooring LLC",
  segmento: "Flooring / Home Improvement — Miami, FL",
  regiao_horario: "Miami-Dade & Broward County — Mon–Sat, 7am–6pm",
  papel_objetivo: "Qualify leads on WhatsApp, provide price ranges, schedule free in-home estimates, and hand off hot leads to Roberto.",
  sobre_empresa: "Brazilian-owned flooring company operating in South Florida since 2018. Licensed & insured. 5-star rated on Google with 120+ reviews. We serve residential and commercial clients.",
  produtos_servicos: "Hardwood installation ($7–$12/sq ft), LVP/vinyl plank ($4–$6/sq ft), tile ($10–$15/sq ft), carpet ($3.50–$5/sq ft), floor refinishing ($3–$4/sq ft), subfloor repair.",
  como_vender: "1) Greet by name. 2) Ask: what type of flooring? how many sq ft? 3) Give price range. 4) Offer free in-home estimate. 5) Confirm date/time and address. 6) Pass to Roberto to close.",
  pode_fazer: "Provide price ranges, schedule estimates, send company photos, answer material questions, explain the installation process.",
  nao_pode_fazer: "Give exact quotes without measuring, promise start dates without checking Roberto's schedule, offer discounts without approval.",
  estilo_comunicacao: "Professional, friendly and confident. Short responses. Light use of emojis. Bilingual (EN/PT).",
  apresentacao: "Hi! I'm Sam from Silva Flooring 👋 How can I help you today?",
  tamanho_resposta: "curtas",
  telefone_transferencia: "+1 (305) 555-0100",
  palavra_pausar: "/pause",
  palavra_despausar: "/resume",
  responder_em_partes: true,
  usar_emojis: true,
  tom: 65,
  formalidade: 55,
};

const DEMO_REPLIES = [
  "Hi! We serve all of Miami-Dade and Broward County 👋",
  "What type of flooring are you looking for? And roughly how many square feet?",
];

function AgenteDemo() {
  const [testMsg, setTestMsg] = useState("Hi! Do you serve the Brickell area?");
  const [reply, setReply] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  function runTest() {
    setTesting(true); setReply([]);
    setTimeout(() => {
      const lower = testMsg.toLowerCase();
      const replies = lower.includes("miami") || lower.includes("area") || lower.includes("serve")
        ? ["Hi! We serve all of Miami-Dade and Broward County 👋", "What type of flooring are you looking for? And roughly how many square feet?"]
        : lower.includes("price") || lower.includes("cost") || lower.includes("how much")
        ? ["Great question! Here's a rough estimate: Hardwood $7–$12/sq ft · LVP $4–$6/sq ft · Tile $10–$15/sq ft · Refinishing $3–$4/sq ft.", "For an exact quote, I can schedule a FREE in-home estimate — usually takes 30 min. What day works for you?"]
        : lower.includes("hardwood") || lower.includes("wood")
        ? ["Hardwood is our specialty! 🪵 We install solid and engineered hardwood starting at $7/sq ft (supply + install).", "How many square feet are we talking about?"]
        : DEMO_REPLIES;
      setReply(replies);
      setTesting(false);
    }, 800);
  }

  const prompt = buildSystemPrompt(CFG, { responderEmPartes: true, produtos: [
    { nome: "Hardwood Installation", preco: 8, descricao: "Per sq ft, supply & install. Solid or engineered." },
    { nome: "LVP / Vinyl Plank", preco: 4.5, descricao: "Per sq ft. Waterproof, great for kitchens & baths." },
    { nome: "Tile Installation", preco: 12, descricao: "Per sq ft. Ceramic or porcelain, floor or wall." },
    { nome: "Floor Refinishing", preco: 3.5, descricao: "Per sq ft. Sand, stain & finish existing hardwood." },
  ]});

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Bot className="size-5 text-[var(--brand-text)]" /> {CFG.nome_agente}
          </h1>
          <p className="text-sm text-muted-foreground">{CFG.papel_objetivo}</p>
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5 mt-1">
            <Lock className="size-3" /> Configuração de exemplo — somente leitura.
          </p>
        </div>
        <Button disabled title="Indisponível no demo">Salvar</Button>
      </header>

      <Collapsible>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted transition">
            <span className="font-display text-[12px] font-semibold uppercase tracking-wider text-[var(--brand-text)] flex items-center gap-1.5">
              <Sparkles className="size-3.5" /> Descrição enviada para a IA
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 border-t border-border text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {DESCRICAO_DEMO}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <div className="grid lg:grid-cols-[1fr_minmax(340px,400px)] gap-6">
        <div className="space-y-4">
          <Section title="O que a IA aprendeu" icon={<Sparkles className="size-3.5" />}>
            <SummaryRow label="Empresa" value={CFG.nome_empresa} />
            <SummaryRow label="Segmento" value={CFG.segmento} />
            <SummaryRow label="Região / horário" value={CFG.regiao_horario} />
            <SummaryRow label="Sobre" value={CFG.sobre_empresa} multiline />
            <SummaryRow label="Produtos / serviços" value={CFG.produtos_servicos} multiline />
            <SummaryRow label="Como vende" value={CFG.como_vender} multiline />
            <SummaryRow label="Pode fazer" value={CFG.pode_fazer} multiline />
            <SummaryRow label="Não pode fazer" value={CFG.nao_pode_fazer} multiline />
          </Section>

          <Collapsible>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted transition">
                <span className="font-display text-[12px] font-semibold uppercase tracking-wider text-[var(--brand-text)] flex items-center gap-1.5">
                  <Settings2 className="size-3.5" /> Ajustes finos
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                <div className="space-y-1.5">
                  <Label>Tom das respostas</Label>
                  <Select value={CFG.tamanho_resposta} disabled>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="curtas">Curtas (estilo WhatsApp)</SelectItem>
                      <SelectItem value="medias">Médias</SelectItem>
                      <SelectItem value="longas">Longas (explicativas)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Telefone para transferir atendimento</Label>
                  <Input readOnly value={CFG.telefone_transferencia} />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Palavra para pausar IA</Label>
                    <Input readOnly value={CFG.palavra_pausar} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Palavra para despausar</Label>
                    <Input readOnly value={CFG.palavra_despausar} />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted p-3">
                  <span className="text-sm font-medium">Responder em partes (1-3 bolhas)</span>
                  <Switch checked={CFG.responder_em_partes} disabled />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 self-start">
          <Section title="Testar resposta" icon={<Sparkles className="size-3.5" />}>
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 min-h-[160px]">
              <div className="flex justify-end">
                <div className="max-w-[78%] bg-muted rounded-2xl rounded-br-md px-3.5 py-2.5 text-[13px]">{testMsg}</div>
              </div>
              {reply.map((p, i) => (
                <div key={i} className="flex justify-start gap-2 items-end">
                  <InitialsAvatar name="IA" size={24} forceGradient="linear-gradient(135deg,#A3E635,#25D366)" />
                  <div className="max-w-[78%] bg-gradient-to-br from-[#1f9d57] to-[#25D366] text-primary-foreground rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13px] font-medium">
                    <span className="block text-[9.5px] font-bold opacity-80 mb-1 uppercase tracking-wider">⚡ Agente IA</span>
                    {p}
                  </div>
                </div>
              ))}
              {testing && <div className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="size-3 animate-spin" />pensando…</div>}
            </div>
            <div className="flex gap-2 mt-3">
              <Input value={testMsg} onChange={(e) => setTestMsg(e.target.value)} placeholder="Mensagem do cliente…" />
              <Button onClick={runTest} disabled={testing} size="icon">
                {testing ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </div>
          </Section>

          <Collapsible>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted transition">
                <span className="font-display text-[12px] font-semibold uppercase tracking-wider text-[var(--brand-text)] flex items-center gap-1.5">
                  <Bot className="size-3.5" /> Ver prompt gerado
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <pre className="font-mono text-[11px] leading-relaxed text-foreground whitespace-pre-wrap max-h-[360px] overflow-auto p-4 border-t border-border">
{prompt}
                </pre>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      {title && (
        <h3 className="font-display text-[12px] font-semibold uppercase tracking-wider text-[var(--brand-text)] flex items-center gap-1.5">
          {icon}{title}
        </h3>
      )}
      {children}
    </div>
  );
}

function SummaryRow({ label, value, multiline }: { label: string; value?: string; multiline?: boolean }) {
  if (!value || !value.trim()) return null;
  return (
    <div className="space-y-1">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-sm ${multiline ? "whitespace-pre-wrap leading-relaxed" : ""}`}>{value}</div>
    </div>
  );
}
