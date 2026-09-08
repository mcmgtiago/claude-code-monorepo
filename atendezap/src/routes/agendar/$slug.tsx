import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format, addMinutes, parseISO, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check, Clock, DollarSign, Zap, MapPin, User, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/agendar/$slug")({
  component: BookingPage,
});

const SLOT_HOURS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

type CompanyData = {
  id: string; nome: string; logo_url: string | null; primary_color: string | null;
  business_hours: any; booking_enabled: boolean; google_review_url: string | null;
};
type ServiceData = { id: string; name: string; description: string | null; duration_minutes: number; price: number | null; featured: boolean };
type ProfessionalData = { id: string; name: string; specialty: string | null; photo_url: string | null };

type Step = "service" | "datetime" | "info" | "confirm";

function BookingPage() {
  const { slug } = Route.useParams();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalData[]>([]);
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [step, setStep] = useState<Step>("service");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Selections
  const [selService, setSelService] = useState<ServiceData | null>(null);
  const [selProf, setSelProf] = useState<ProfessionalData | null>(null);
  const [selDate, setSelDate] = useState<Date>(addDays(new Date(), 1));
  const [selSlot, setSelSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });

  const primary = company?.primary_color ?? "#0efa71";

  useEffect(() => {
    async function load() {
      const { data: comp } = await (supabase as any).from("company").select("id, nome, logo_url, primary_color, business_hours, booking_enabled, google_review_url").eq("slug", slug).single();
      if (!comp) { setNotFound(true); setLoading(false); return; }
      setCompany(comp as any);

      const [{ data: svcs }, { data: profs }] = await Promise.all([
        (supabase as any).from("service").select("id, name, description, duration_minutes, price, featured").eq("company_id", comp.id).eq("active", true).order("featured", { ascending: false }),
        (supabase as any).from("professional").select("id, name, specialty, photo_url").eq("company_id", comp.id).eq("active", true).order("name"),
      ]);
      setServices((svcs ?? []) as ServiceData[]);
      setProfessionals((profs ?? []) as ProfessionalData[]);
      setLoading(false);
    }
    load();
  }, [slug]);

  useEffect(() => {
    if (!company || !selDate) return;
    const dateStr = format(selDate, "yyyy-MM-dd");
    supabase.from("agendamento").select("inicio, fim, status").eq("company_id", company.id).gte("inicio", `${dateStr}T00:00:00`).lte("inicio", `${dateStr}T23:59:59`).not("status", "eq", "cancelado")
      .then(({ data }) => {
        const occupied: string[] = [];
        (data ?? []).forEach(a => {
          if (a.inicio) occupied.push(format(parseISO(a.inicio), "HH:mm"));
        });
        setBusySlots(occupied);
      });
  }, [company, selDate, selService]);

  async function submit() {
    if (!selService || !selSlot || !form.name || !form.phone) return toast.error("Preencha todos os campos");
    setSubmitting(true);
    try {
      const dateStr = format(selDate, "yyyy-MM-dd");
      const inicio = `${dateStr}T${selSlot}:00`;
      const fim = format(addMinutes(parseISO(inicio), selService.duration_minutes), "yyyy-MM-dd'T'HH:mm:ss");

      const { error } = await (supabase as any).from("agendamento").insert({
        company_id: company!.id,
        titulo: selService.name,
        inicio,
        fim,
        status: "agendado",
        source: "online",
        service_id: selService.id,
        professional_id: selProf?.id ?? null,
        customer_name: form.name,
        customer_phone: form.phone.replace(/\D/g, ""),
        customer_email: form.email || null,
        address: form.address || null,
        notes: form.notes || null,
        price: selService.price,
      });
      if (error) throw error;

      // Auto-create CRM card
      const { data: stages } = await supabase.from("crm_stage").select("id").eq("company_id", company!.id).order("ordem").limit(1);
      if (stages?.[0]) {
        await (supabase as any).from("crm_cards").upsert({ company_id: company!.id, numero: form.phone.replace(/\D/g, ""), nome: form.name, stage_id: stages[0].id, status: "aberto", origem: "agendamento-online", ultima_mensagem: `Agendou: ${selService.name}`, ultima_em: new Date().toISOString() }, { onConflict: "company_id,numero", ignoreDuplicates: false });
      }

      setDone(true);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao agendar");
    } finally { setSubmitting(false); }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#081410] grid place-items-center">
      <div className="animate-spin size-8 rounded-full border-2 border-transparent" style={{ borderTopColor: "#0efa71" }} />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-[#081410] grid place-items-center text-white text-center p-8">
      <div><h1 className="text-2xl font-bold mb-2">Empresa não encontrada</h1><p className="text-gray-400">Verifique o link de agendamento</p></div>
    </div>
  );

  if (!company?.booking_enabled) return (
    <div className="min-h-screen bg-[#081410] grid place-items-center text-white text-center p-8">
      <div><h1 className="text-2xl font-bold mb-2">Agendamento indisponível</h1><p className="text-gray-400">Entre em contato diretamente com a empresa</p></div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-[#081410] grid place-items-center p-6" style={{ ["--brand" as any]: primary }}>
      <div className="w-full max-w-sm text-center">
        <div className="size-16 rounded-full grid place-items-center mx-auto mb-4" style={{ background: primary + "20" }}>
          <Check className="size-8" style={{ color: primary }} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Agendado!</h1>
        <p className="text-gray-300 mb-1">{selService?.name}</p>
        <p className="text-gray-400 text-sm">{format(selDate, "EEEE, d 'de' MMMM", { locale: ptBR })} às {selSlot}</p>
        {selProf && <p className="text-gray-400 text-sm mt-1">Com: {selProf.name}</p>}
        <div className="mt-6 p-4 rounded-xl text-sm text-gray-300" style={{ background: primary + "10", border: `1px solid ${primary}30` }}>
          Em breve a empresa entrará em contato para confirmar seu agendamento.
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#081410]" style={{ ["--brand" as any]: primary }}>
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-4 flex items-center gap-3">
        {company.logo_url ? (
          <img src={company.logo_url} alt={company.nome} className="size-10 rounded-xl object-cover" />
        ) : (
          <div className="size-10 rounded-xl grid place-items-center" style={{ background: primary + "20" }}>
            <Zap className="size-5" style={{ color: primary }} />
          </div>
        )}
        <div>
          <div className="font-bold text-white text-[16px]">{company.nome}</div>
          <div className="text-[11px] text-gray-400">Agende online</div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex px-4 pt-4 gap-1">
        {(["service", "datetime", "info", "confirm"] as Step[]).map((s, i) => (
          <div key={s} className="flex-1 h-1 rounded-full" style={{ background: step === s || ["service", "datetime", "info", "confirm"].indexOf(step) > i ? primary : "rgba(255,255,255,0.1)" }} />
        ))}
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto pb-20">

        {/* Step 1: Serviço */}
        {step === "service" && (
          <div className="space-y-4">
            <h2 className="text-white font-bold text-[18px]">Escolha o serviço</h2>
            {services.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhum serviço disponível no momento</p>
            ) : (
              <div className="space-y-2">
                {services.map(svc => (
                  <button key={svc.id} onClick={() => { setSelService(svc); setStep("datetime"); }}
                    className="w-full text-left p-4 rounded-xl border transition-all"
                    style={{ background: selService?.id === svc.id ? primary + "18" : "rgba(255,255,255,0.04)", borderColor: selService?.id === svc.id ? primary : "rgba(255,255,255,0.1)" }}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-white">{svc.name}</div>
                        {svc.description && <div className="text-[13px] text-gray-400 mt-0.5 line-clamp-2">{svc.description}</div>}
                      </div>
                      {svc.price != null && <div className="text-[15px] font-bold ml-3 shrink-0" style={{ color: primary }}>${Number(svc.price).toFixed(2)}</div>}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-400">
                      <Clock className="size-3" />{svc.duration_minutes} min
                    </div>
                  </button>
                ))}
              </div>
            )}

            {professionals.length > 1 && selService && (
              <div className="space-y-2 pt-2">
                <h3 className="text-white text-[14px] font-semibold">Profissional (opcional)</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelProf(null)} className="px-3 py-1.5 rounded-lg text-sm border transition-all" style={{ background: !selProf ? primary + "18" : "transparent", borderColor: !selProf ? primary : "rgba(255,255,255,0.15)", color: !selProf ? primary : "#9ca3af" }}>Qualquer</button>
                  {professionals.map(p => (
                    <button key={p.id} onClick={() => setSelProf(p)} className="px-3 py-1.5 rounded-lg text-sm border transition-all" style={{ background: selProf?.id === p.id ? primary + "18" : "transparent", borderColor: selProf?.id === p.id ? primary : "rgba(255,255,255,0.15)", color: selProf?.id === p.id ? primary : "#9ca3af" }}>{p.name}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Data/Hora */}
        {step === "datetime" && (
          <div className="space-y-4">
            <h2 className="text-white font-bold text-[18px]">Data e horário</h2>

            {/* Date picker */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <button onClick={() => setSelDate(d => isBefore(addDays(d, -1), addDays(new Date(), 1)) ? d : addDays(d, -1))} className="size-8 grid place-items-center rounded-lg bg-white/5 text-white"><ChevronLeft className="size-4" /></button>
                <span className="text-white font-semibold flex-1 text-center capitalize">{format(selDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
                <button onClick={() => setSelDate(d => addDays(d, 1))} className="size-8 grid place-items-center rounded-lg bg-white/5 text-white"><ChevronRight className="size-4" /></button>
              </div>
            </div>

            {/* Slots */}
            <div className="grid grid-cols-3 gap-2">
              {SLOT_HOURS.map(slot => {
                const busy = busySlots.includes(slot);
                const isSelected = selSlot === slot;
                return (
                  <button key={slot} disabled={busy} onClick={() => setSelSlot(slot)}
                    className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: busy ? "rgba(255,255,255,0.04)" : isSelected ? primary : "rgba(255,255,255,0.07)",
                      color: busy ? "#4b5563" : isSelected ? "#04140b" : "white",
                      cursor: busy ? "not-allowed" : "pointer",
                    }}>
                    {slot}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setStep("service")} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-400 border border-white/10">Voltar</button>
              <button disabled={!selSlot} onClick={() => setStep("info")} className="flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-40" style={{ background: primary, color: "#04140b" }}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Dados do cliente */}
        {step === "info" && (
          <div className="space-y-4">
            <h2 className="text-white font-bold text-[18px]">Seus dados</h2>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] text-gray-400 font-medium block mb-1">Nome completo *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="João Silva" className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[var(--brand)]" />
              </div>
              <div>
                <label className="text-[12px] text-gray-400 font-medium block mb-1">WhatsApp / Telefone *</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[var(--brand)]" />
              </div>
              <div>
                <label className="text-[12px] text-gray-400 font-medium block mb-1">Email (opcional)</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="joao@email.com" className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[var(--brand)]" />
              </div>
              <div>
                <label className="text-[12px] text-gray-400 font-medium block mb-1">Endereço do serviço</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main St, Miami FL" className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[var(--brand)]" />
              </div>
              <div>
                <label className="text-[12px] text-gray-400 font-medium block mb-1">Observações (opcional)</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Detalhes sobre o serviço..." className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] resize-none" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setStep("datetime")} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-400 border border-white/10">Voltar</button>
              <button disabled={!form.name || !form.phone} onClick={() => setStep("confirm")} className="flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-40" style={{ background: primary, color: "#04140b" }}>
                Revisar
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmação */}
        {step === "confirm" && (
          <div className="space-y-4">
            <h2 className="text-white font-bold text-[18px]">Confirmar agendamento</h2>
            <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg grid place-items-center" style={{ background: primary + "20" }}>
                  <Clock className="size-4" style={{ color: primary }} />
                </div>
                <div>
                  <div className="text-white font-semibold">{selService?.name}</div>
                  <div className="text-gray-400 text-sm capitalize">{format(selDate, "EEEE, d 'de' MMMM", { locale: ptBR })} às {selSlot}</div>
                </div>
              </div>
              {selProf && (
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg grid place-items-center bg-white/5"><User className="size-4 text-gray-400" /></div>
                  <span className="text-white text-sm">{selProf.name}</span>
                </div>
              )}
              {form.address && (
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg grid place-items-center bg-white/5"><MapPin className="size-4 text-gray-400" /></div>
                  <span className="text-gray-300 text-sm">{form.address}</span>
                </div>
              )}
              {selService?.price != null && (
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg grid place-items-center bg-white/5"><DollarSign className="size-4 text-gray-400" /></div>
                  <span className="text-white font-bold text-[15px]">${Number(selService.price).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3">
                <div className="text-white font-semibold">{form.name}</div>
                <div className="text-gray-400 text-sm">{form.phone}</div>
                {form.email && <div className="text-gray-400 text-sm">{form.email}</div>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep("info")} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-400 border border-white/10">Voltar</button>
              <button disabled={submitting} onClick={submit} className="flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-40" style={{ background: primary, color: "#04140b" }}>
                {submitting ? "Agendando…" : "Confirmar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
