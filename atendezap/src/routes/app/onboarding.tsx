import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { brand } from "@/config/brand";
import { BILLING_ENABLED } from "@/config/features";
import { Loader2, Check, Building2, MapPin, Palette, Bot, PartyPopper, Target } from "lucide-react";
import { NICHOS, NICHO_LIST, NICHO_KANBAN, type NichoKey } from "@/lib/demo-nichos";

type Search = { checkout?: string };

export const Route = createFileRoute("/app/onboarding")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    checkout: typeof s.checkout === "string" ? s.checkout : undefined,
  }),
  head: () => ({ meta: [{ title: `${brand.name} — Bem-vindo` }] }),
  component: Onboarding,
});

const STEPS = [
  { key: "nicho",     label: "Nicho",      icon: Target },
  { key: "empresa",   label: "Empresa",    icon: Building2 },
  { key: "endereco",  label: "Endereço",   icon: MapPin },
  { key: "identidade",label: "Identidade", icon: Palette },
  { key: "agente",    label: "Agente IA",  icon: Bot },
  { key: "concluir",  label: "Concluir",   icon: PartyPopper },
] as const;

const PORTES = ["Solo / 1 person", "Small (2–9)", "Medium (10–49)", "Large (50+)"];

// Agent templates per nicho
const AGENT_TEMPLATES: Record<NichoKey | "outro", { nome: string; papel: string; estilo: string; sobre: string; servicos: string }> = {
  flooring: {
    nome: "Sam",
    papel: "Qualify leads, provide price ranges per sq ft, and schedule free in-home estimates. Respond in the customer's language (EN/PT/ES).",
    estilo: "Professional, friendly and direct. Always offer a free estimate and ask for the square footage.",
    sobre: "We are a licensed flooring company serving Miami-Dade and Broward County. We install hardwood, LVP, tile, carpet and do refinishing.",
    servicos: "Hardwood installation ($8–$12/sq ft), LVP / Vinyl Plank ($4–$6/sq ft), Tile installation ($10–$15/sq ft), Carpet ($3–$5/sq ft), Floor refinishing ($3.50/sq ft), Free in-home estimate.",
  },
  roofing: {
    nome: "Rex",
    papel: "Qualify storm damage leads, explain insurance claims process, and schedule free roof inspections. Handle emergency calls with urgency.",
    estilo: "Confident, knowledgeable and empathetic. Show urgency for storm damage and expertise in insurance claims.",
    sobre: "We are a licensed roofing contractor serving South Florida. We specialize in shingle, metal, TPO and emergency repairs, and assist with insurance claims.",
    servicos: "Shingle replacement ($7–$10/sq ft), Metal roof ($10–$14/sq ft), TPO flat roof ($6–$8/sq ft), Emergency repair (same day), Free inspection, Insurance claim assistance.",
  },
  painting: {
    nome: "Ivy",
    papel: "Qualify interior/exterior painting leads, collect room count and square footage, and schedule free color consultations.",
    estilo: "Warm, creative and professional. Highlight quality of paint brands (Benjamin Moore, Sherwin-Williams) and clean finish.",
    sobre: "We are a licensed painting company serving Broward and Palm Beach County. Interior, exterior, commercial and cabinet painting.",
    servicos: "Interior painting ($2–$3/sq ft), Exterior painting ($3–$4/sq ft), Cabinet painting ($65–$85/door), Commercial painting, Stucco repair, Free color consultation.",
  },
  cleaning: {
    nome: "Lena",
    papel: "Book recurring cleaning contracts, upsell deep cleans and Airbnb turnovers, and manage client schedules efficiently.",
    estilo: "Cheerful, organized and reliable. Emphasize recurring plans, insurance and trustworthy team.",
    sobre: "We are a professional cleaning company serving Miami-Dade County. Residential, commercial, Airbnb turnovers and deep cleans.",
    servicos: "Regular cleaning ($150–$220/visit), Deep cleaning ($280–$380), Move in/out clean ($250–$350), Airbnb turnover ($120–$180), Office cleaning ($150–$220/week).",
  },
  landscaping: {
    nome: "Gus",
    papel: "Book lawn maintenance contracts, upsell landscape design projects, and manage recurring schedules. Mention 3D design for large projects.",
    estilo: "Outdoorsy, reliable and growth-oriented. Highlight recurring contracts and 3D landscape design capability.",
    sobre: "We are a full-service landscaping company serving Miami-Dade and Broward County. Lawn maintenance, landscape design, irrigation and tree service.",
    servicos: "Weekly lawn maintenance ($80–$120/visit), Landscape design & installation (custom), Sod installation ($1–$1.50/sq ft), Irrigation repair ($150+), Tree trimming ($200–$400/tree), Fertilization & pest control ($75–$100).",
  },
  outro: {
    nome: "Max",
    papel: "Atender clientes, responder dúvidas e ajudar a fechar negócios. Adapte para o seu segmento.",
    estilo: "Cordial, profissional e objetivo.",
    sobre: "Descreva sua empresa aqui.",
    servicos: "Liste os principais serviços e preços.",
  },
};

function Onboarding() {
  const ctx = Route.useRouteContext();
  const navigate = useNavigate();
  const search = useSearch({ from: "/app/onboarding" }) as Search;
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 0 — Nicho
  const [nicho, setNicho] = useState<NichoKey | "outro" | "">("");

  // Step 1 — Empresa
  const [nomeFantasia, setNomeFantasia] = useState(ctx.company?.nome ?? "");
  const [emailCorp, setEmailCorp] = useState(ctx.user.email ?? "");
  const [telefone, setTelefone] = useState("");
  const [porte, setPorte] = useState("");
  const [site, setSite] = useState("");

  // Step 2 — Endereço (flexible — US or BR)
  const [rua, setRua] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [pais, setPais] = useState("US");

  // Step 3 — Identidade
  const [primaryColor, setPrimaryColor] = useState(ctx.company?.primary_color ?? brand.primary);
  const [logoUrl, setLogoUrl] = useState(ctx.company?.logo_url ?? "");

  // Step 4 — Agente
  const [agente, setAgente] = useState({
    nome_agente: "Sam",
    papel_objetivo: AGENT_TEMPLATES.flooring.papel,
    estilo_comunicacao: AGENT_TEMPLATES.flooring.estilo,
    sobre_empresa: "",
    produtos_servicos: AGENT_TEMPLATES.flooring.servicos,
  });

  useEffect(() => {
    // Sem cobrança não há checkout — conta sem empresa não deveria chegar aqui.
    if (!ctx.company && BILLING_ENABLED) navigate({ to: "/app/checkout", replace: true });
  }, [ctx.company, navigate]);

  useEffect(() => {
    if (!ctx.company) return;
    const c = ctx.company;
    if (c.nome_fantasia) setNomeFantasia(c.nome_fantasia);
    if (c.email_corporativo) setEmailCorp(c.email_corporativo);
    if (c.telefone) setTelefone(c.telefone);
    if (c.porte) setPorte(c.porte);
    if (c.site) setSite(c.site);
    if (c.rua) setRua(c.rua);
    if (c.cidade) setCidade(c.cidade);
    if (c.estado) setEstado(c.estado);
    if (typeof c.onboarding_step === "number" && c.onboarding_step > 0) {
      setStep(Math.min(c.onboarding_step, STEPS.length - 1));
    }
  }, [ctx.company]);

  useEffect(() => {
    if (BILLING_ENABLED && search.checkout === "success") {
      toast.success("Pagamento validado! 3 dias grátis liberados.");
    }
  }, [search.checkout]);

  // Auto-fill agent when nicho is selected
  function handleNichoSelect(key: NichoKey | "outro") {
    setNicho(key);
    const tpl = AGENT_TEMPLATES[key];
    setAgente({
      nome_agente: tpl.nome,
      papel_objetivo: tpl.papel,
      estilo_comunicacao: tpl.estilo,
      sobre_empresa: agente.sobre_empresa || "",
      produtos_servicos: tpl.servicos,
    });
  }

  if (!ctx.company) return null;
  const companyId = ctx.company.id;

  async function persistPartial(nextStep: number) {
    const patch: any = {
      nome_fantasia: nomeFantasia || null,
      email_corporativo: emailCorp || null,
      telefone: telefone || null,
      porte: porte || null,
      site: site || null,
      rua: rua || null,
      cidade: cidade || null,
      estado: estado || null,
      pais: pais || "US",
      primary_color: primaryColor,
      logo_url: logoUrl || null,
      onboarding_step: nextStep,
      segmento: nicho || null,
    };
    await supabase.from("company").update(patch).eq("id", companyId);
  }

  function validateStep(): string | null {
    if (step === 0 && !nicho) return "Selecione o seu nicho para continuar.";
    if (step === 1 && !nomeFantasia.trim()) return "Informe o nome da empresa.";
    return null;
  }

  async function next() {
    const err = validateStep();
    if (err) return toast.error(err);
    setSaving(true);
    try {
      await persistPartial(step + 1);
      setStep(Math.min(step + 1, STEPS.length - 1));
    } catch (e: any) {
      toast.error(e.message || "Falha ao salvar");
    } finally {
      setSaving(false);
    }
  }
  function back() { if (step > 0) setStep(step - 1); }

  async function finalizar() {
    setSaving(true);
    try {
      await persistPartial(STEPS.length - 1);

      // Upsert agent config
      await supabase.from("agent_config").upsert({
        company_id: companyId,
        user_id: ctx.user.id,
        nome_empresa: nomeFantasia.trim() || brand.name,
        ...agente,
      }, { onConflict: "company_id" });

      // Complete onboarding
      await supabase.from("company").update({
        onboarding_completed: true,
        nome: nomeFantasia.trim() || brand.name,
      }).eq("id", companyId);

      // Try to create default services from nicho template (graceful fail)
      if (nicho && nicho !== "outro" && NICHOS[nicho as NichoKey]) {
        try {
          const nichoData = NICHOS[nicho as NichoKey];
          const serviceRows = nichoData.services.map((s) => ({
            company_id: companyId,
            name: s.name,
            category: s.category,
            duration_minutes: s.duration_minutes,
            price: s.price,
            description: s.description,
            featured: false,
            active: true,
          }));
          await (supabase as any).from("service").insert(serviceRows);
        } catch {}
      }

      toast.success("Tudo pronto! Bem-vindo ao " + brand.name);
      window.location.href = "/app/dashboard";
    } catch (e: any) {
      toast.error(e.message || "Falha ao concluir");
    } finally {
      setSaving(false);
    }
  }

  const nichoOptions: { key: NichoKey | "outro"; emoji: string; label: string; sub: string }[] = [
    ...NICHO_LIST.map(k => ({
      key: k as NichoKey | "outro",
      emoji: NICHOS[k].emoji,
      label: NICHOS[k].label,
      sub: NICHOS[k].tagline,
    })),
    { key: "outro", emoji: "⚙️", label: "Outro nicho", sub: "Serviços gerais ou outro segmento" },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-display">Vamos configurar seu {brand.name}</h1>
        <p className="text-sm text-muted-foreground">Leva uns 3 minutos. Você pode voltar e ajustar depois.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 md:gap-2 mb-6 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div key={s.key} className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <div className={`size-8 rounded-full grid place-items-center text-xs font-bold transition ${
                done ? "bg-primary text-primary-foreground" :
                active ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                "bg-muted text-muted-foreground"
              }`}>
                {done ? <Check className="size-4" /> : <Icon className="size-4" />}
              </div>
              <div className={`text-xs md:text-sm hidden sm:block ${active ? "font-semibold" : "text-muted-foreground"}`}>{s.label}</div>
              {i < STEPS.length - 1 && <div className="w-4 md:w-8 h-px bg-border" />}
            </div>
          );
        })}
      </div>

      <Card className="p-6 space-y-4">

        {/* ─── STEP 0: NICHO ─── */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold font-display">Qual é o seu nicho?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Vamos pré-configurar o agente, os serviços e o funil de vendas baseado no seu mercado.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {nichoOptions.map((opt) => {
                const isSelected = nicho === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleNichoSelect(opt.key as NichoKey | "outro")}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/8"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 size-5 rounded-full bg-primary grid place-items-center">
                        <Check className="size-3 text-primary-foreground" />
                      </span>
                    )}
                    <span className="text-2xl block mb-2">{opt.emoji}</span>
                    <span className="font-semibold text-[15px] block">{opt.label}</span>
                    <span className="text-[12px] text-muted-foreground">{opt.sub}</span>
                  </button>
                );
              })}
            </div>
            {nicho && nicho !== "outro" && (
              <div className="rounded-xl bg-primary/8 border border-primary/20 p-3 text-[13px] text-muted-foreground">
                <span className="font-semibold text-foreground">✨ Configuração automática:</span>{" "}
                agente "{AGENT_TEMPLATES[nicho as NichoKey].nome}", serviços padrão do {NICHOS[nicho as NichoKey]?.label} e funil de {NICHO_KANBAN[nicho as NichoKey] === "recurring" ? "recorrência" : "orçamento"} serão carregados.
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 1: EMPRESA ─── */}
        {step === 1 && (
          <>
            <Row label="Nome da empresa *">
              <Input value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} placeholder="Ex: Pro Roof USA LLC" />
            </Row>
            <div className="grid sm:grid-cols-2 gap-3">
              <Row label="E-mail comercial">
                <Input type="email" value={emailCorp} onChange={(e) => setEmailCorp(e.target.value)} />
              </Row>
              <Row label="Telefone">
                <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="+1 (305) 555-0100" inputMode="tel" />
              </Row>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Row label="Porte do negócio">
                <Select value={porte} onValueChange={setPorte}>
                  <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
                  <SelectContent>
                    {PORTES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Row>
              <Row label="Site (opcional)">
                <Input value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://" />
              </Row>
            </div>
          </>
        )}

        {/* ─── STEP 2: ENDEREÇO ─── */}
        {step === 2 && (
          <>
            <Row label="Endereço">
              <Input value={rua} onChange={(e) => setRua(e.target.value)} placeholder="123 Main St" />
            </Row>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Row label="Cidade">
                  <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Miami" />
                </Row>
              </div>
              <Row label="Estado">
                <Input value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))} placeholder="FL" />
              </Row>
            </div>
            <Row label="País">
              <Select value={pais} onValueChange={setPais}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">🇺🇸 United States</SelectItem>
                  <SelectItem value="BR">🇧🇷 Brasil</SelectItem>
                  <SelectItem value="MX">🇲🇽 México</SelectItem>
                  <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <p className="text-xs text-muted-foreground">Usamos isso para localizar sua área de atendimento e sua página de agendamento.</p>
          </>
        )}

        {/* ─── STEP 3: IDENTIDADE ─── */}
        {step === 3 && (
          <>
            <Row label="Cor da marca">
              <div className="flex items-center gap-3">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-14 rounded border cursor-pointer" />
                <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono" />
              </div>
            </Row>
            <div
              className="rounded-xl p-4 flex items-center gap-3 transition-all"
              style={{ background: `${primaryColor}18`, border: `1px solid ${primaryColor}40` }}
            >
              <div className="size-10 rounded-lg grid place-items-center font-bold text-white" style={{ background: primaryColor }}>
                {nomeFantasia.slice(0, 1).toUpperCase() || "V"}
              </div>
              <div>
                <div className="font-semibold text-sm">{nomeFantasia || "Sua Empresa"}</div>
                <div className="text-xs text-muted-foreground">Preview da cor na barra lateral</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Você pode trocar isso depois em Configurações.</p>
          </>
        )}

        {/* ─── STEP 4: AGENTE ─── */}
        {step === 4 && (
          <>
            {nicho && nicho !== "outro" && (
              <div className="rounded-lg bg-primary/8 border border-primary/20 p-3 text-[13px] flex items-center gap-2">
                <span>{NICHOS[nicho as NichoKey]?.emoji}</span>
                <span className="text-muted-foreground">
                  Pré-configurado para <b className="text-foreground">{NICHOS[nicho as NichoKey]?.label}</b>. Personalize abaixo se quiser.
                </span>
              </div>
            )}
            <div className="rounded-lg bg-muted/40 border border-border p-3 text-[12px] text-muted-foreground">
              💡 As instruções do agente ficam em inglês porque a IA atende seus clientes nos EUA. A IA responde no idioma de cada cliente (EN/ES/PT).
            </div>
            <Row label="Nome do agente">
              <Input value={agente.nome_agente} onChange={(e) => setAgente({ ...agente, nome_agente: e.target.value })} />
            </Row>
            <Row label="Papel e objetivo">
              <Textarea value={agente.papel_objetivo} onChange={(e) => setAgente({ ...agente, papel_objetivo: e.target.value })} rows={3} />
            </Row>
            <Row label="Estilo de comunicação">
              <Textarea value={agente.estilo_comunicacao} onChange={(e) => setAgente({ ...agente, estilo_comunicacao: e.target.value })} rows={2} />
            </Row>
            <Row label="Sobre a empresa">
              <Textarea value={agente.sobre_empresa} onChange={(e) => setAgente({ ...agente, sobre_empresa: e.target.value })} rows={3} placeholder="What you do, how long you've been in business, what makes you different…" />
            </Row>
            <Row label="Serviços e preços">
              <Textarea value={agente.produtos_servicos} onChange={(e) => setAgente({ ...agente, produtos_servicos: e.target.value })} rows={3} />
            </Row>
          </>
        )}

        {/* ─── STEP 5: CONCLUIR ─── */}
        {step === 5 && (
          <div className="text-center py-8 space-y-4">
            <div className="size-20 mx-auto rounded-full bg-primary/10 grid place-items-center">
              <PartyPopper className="size-9 text-primary" />
            </div>
            <h2 className="text-2xl font-bold font-display">
              {nomeFantasia ? `Tudo pronto, ${nomeFantasia}!` : "Tudo pronto!"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Sua conta está configurada. Conecte seus canais (Instagram, Facebook, WhatsApp)
              e o agente de IA já começa a atender e qualificar seus leads.
            </p>
            {nicho && nicho !== "outro" && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium">
                {NICHOS[nicho as NichoKey]?.emoji} {NICHOS[nicho as NichoKey]?.label} — pronto para usar
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-border mt-2">
          <Button variant="ghost" onClick={back} disabled={step === 0 || saving}>Voltar</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} disabled={saving}>
              {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />} Avançar
            </Button>
          ) : (
            <Button onClick={finalizar} disabled={saving} className="bg-gradient-brand text-primary-foreground hover:opacity-90 font-semibold">
              {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />} Ir pro dashboard
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
