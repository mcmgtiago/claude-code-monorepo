import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, User, MapPin, Check, X, ExternalLink, Link2 } from "lucide-react";
import type { Appointment } from "@/lib/appointment.functions";
import { sendAppointmentConfirmation, sendOnTheWayNotification } from "@/lib/email.functions";
import { useServerFn } from "@tanstack/react-start";
import { fmtMoney, currencyOf } from "@/config/money";

export const Route = createFileRoute("/app/agenda")({
  head: () => ({ meta: [{ title: `${brand.name} — Agenda` }] }),
  component: AgendaPage,
});

const HOURS = Array.from({ length: 11 }, (_, i) => i + 7); // 7h às 17h
const STATUS_COLORS: Record<string, string> = {
  agendado: "#3b82f6",
  confirmado: "#0efa71",
  a_caminho: "#06b6d4",
  em_andamento: "#f59e0b",
  concluido: "#8aa89a",
  cancelado: "#ef4444",
};
const STATUS_LABELS: Record<string, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  a_caminho: "A caminho",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

// Escolhe texto preto ou branco conforme o brilho do fundo (legibilidade)
function textOn(hex: string): string {
  const c = (hex || "#3b82f6").replace("#", "");
  const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#0a1f12" : "#ffffff";
}

type AppWithRelated = Appointment & { professional?: { name: string } | null; service?: { name: string } | null };

function AgendaPage() {
  const ctx = Route.useRouteContext();
  const companyId = ctx.company?.id ?? "";
  const slug = (ctx.company as any)?.slug ?? "";
  const currency = currencyOf((ctx.company as any)?.currency);
  const confirmEmailFn = useServerFn(sendAppointmentConfirmation);
  const onWayFn = useServerFn(sendOnTheWayNotification);

  function copyBookingLink() {
    if (!slug) return toast.error("Defina o nome da empresa nas configurações primeiro.");
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success("Link copiado! Compartilhe no Instagram bio, site ou WhatsApp."))
      .catch(() => toast.message("Link de agendamento", { description: url }));
  }
  const [week, setWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [appointments, setAppointments] = useState<AppWithRelated[]>([]);
  const [selected, setSelected] = useState<AppWithRelated | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titulo: "", inicio: "", fim: "", status: "agendado", professionalId: "", serviceId: "",
    customerName: "", customerPhone: "", address: "", notes: "", price: "",
  });

  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));

  async function load() {
    if (!companyId) return;
    const start = format(week, "yyyy-MM-dd");
    const end = format(addDays(week, 6), "yyyy-MM-dd");
    const { data } = await (supabase as any).from("agendamento")
      .select("*, professional:professional_id(name), service:service_id(name)")
      .eq("company_id", companyId)
      .gte("inicio", `${start}T00:00:00`)
      .lte("inicio", `${end}T23:59:59`)
      .order("inicio");
    setAppointments((data ?? []) as AppWithRelated[]);
  }

  async function loadMeta() {
    const [{ data: p }, { data: s }] = await Promise.all([
      (supabase as any).from("professional").select("id, name").eq("company_id", companyId).eq("active", true),
      (supabase as any).from("service").select("id, name, duration_minutes, price").eq("company_id", companyId).eq("active", true),
    ]);
    setProfessionals(p ?? []);
    setServices(s ?? []);
  }

  useEffect(() => { if (companyId) { load(); loadMeta(); } }, [companyId, week]);

  function appsForDay(day: Date) {
    return appointments.filter(a => a.inicio && isSameDay(parseISO(a.inicio), day));
  }

  async function updateStatus(id: string, status: string) {
    await (supabase as any).from("agendamento").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    toast.success(`Status: ${STATUS_LABELS[status]}`);
    // Ao confirmar, avisa o cliente final por e-mail (se ele deixou e-mail)
    if (status === "confirmado") {
      confirmEmailFn({ data: { appointmentId: id } }).catch(() => {});
    }
    // Ao marcar "a caminho", dispara o aviso ao cliente final
    if (status === "a_caminho") {
      onWayFn({ data: { appointmentId: id } })
        .then((r: any) => toast.success(r?.skipped ? "Status: A caminho (cliente sem e-mail)" : "Cliente avisado: a caminho 🚐"))
        .catch(() => {});
    }
    load();
    setSelected(null);
  }

  async function save() {
    if (!form.titulo || !form.inicio || !form.fim) return toast.error("Preencha título, início e fim");
    setSaving(true);
    try {
      const svc = services.find(s => s.id === form.serviceId);
      await (supabase as any).from("agendamento").insert({
        company_id: companyId,
        titulo: form.titulo || svc?.name || "Agendamento",
        inicio: form.inicio,
        fim: form.fim,
        status: form.status,
        source: "interno",
        professional_id: form.professionalId || null,
        service_id: form.serviceId || null,
        customer_name: form.customerName || null,
        customer_phone: form.customerPhone || null,
        address: form.address || null,
        notes: form.notes || null,
        price: form.price ? parseFloat(form.price) : (svc?.price ?? null),
      });
      toast.success("Agendamento criado");
      setNewOpen(false);
      load();
    } finally { setSaving(false); }
  }

  function openNew(day?: Date) {
    const base = day ? format(day, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
    setForm({ titulo: "", inicio: `${base}T08:00`, fim: `${base}T09:00`, status: "agendado", professionalId: "", serviceId: "", customerName: "", customerPhone: "", address: "", notes: "", price: "" });
    setNewOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Agenda</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visão semanal de todos os jobs agendados</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={copyBookingLink} className="text-xs px-3" title="Link público de agendamento">
            <Link2 className="size-4 sm:mr-1.5" /><span className="hidden sm:inline">Link de agendamento</span>
          </Button>
          <Button variant="outline" size="icon" onClick={() => setWeek(w => subWeeks(w, 1))}><ChevronLeft className="size-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setWeek(startOfWeek(new Date(), { weekStartsOn: 0 }))} className="text-xs px-3">Hoje</Button>
          <Button variant="outline" size="icon" onClick={() => setWeek(w => addWeeks(w, 1))}><ChevronRight className="size-4" /></Button>
          <Button size="sm" onClick={() => openNew()}><Plus className="size-4 mr-1" />Agendar</Button>
        </div>
      </div>

      <div className="text-sm font-medium text-muted-foreground">
        {format(week, "d 'de' MMMM", { locale: ptBR })} — {format(addDays(week, 6), "d 'de' MMMM, yyyy", { locale: ptBR })}
      </div>

      {/* Mobile: lista vertical por dia (a grade semanal não cabe em telas pequenas) */}
      <div className="md:hidden space-y-3">
        {days.map(day => {
          const apps = appsForDay(day).sort((a, b) =>
            (a.inicio && b.inicio) ? +parseISO(a.inicio) - +parseISO(b.inicio) : 0);
          const isToday = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} className="panel p-0 overflow-hidden">
              <div className={`flex items-center justify-between px-4 py-2.5 border-b border-[color:var(--hairline)] ${isToday ? "bg-[color:var(--brand-soft)]" : "bg-[color:var(--panel-2)]"}`}>
                <div className="flex items-baseline gap-2">
                  <span className={`text-[13px] font-bold ${isToday ? "text-[color:var(--brand-text)]" : ""}`}>{format(day, "EEEE", { locale: ptBR })}</span>
                  <span className="text-[11.5px] text-muted-foreground">{format(day, "d 'de' MMM", { locale: ptBR })}</span>
                </div>
                <button onClick={() => openNew(day)} className="size-7 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-[color:var(--panel)]" aria-label="Agendar neste dia">
                  <Plus className="size-4" />
                </button>
              </div>
              {apps.length === 0 ? (
                <div className="px-4 py-3 text-[12.5px] text-muted-foreground">Sem jobs</div>
              ) : (
                <ul className="divide-y divide-[color:var(--hairline)]">
                  {apps.map(a => (
                    <li key={a.id}>
                      <button onClick={() => setSelected(a)} className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-[color:var(--panel-2)]">
                        <span className="size-2.5 rounded-full shrink-0" style={{ background: STATUS_COLORS[a.status] ?? "#3b82f6" }} />
                        <span className="text-[12px] font-mono text-muted-foreground shrink-0 w-11">{a.inicio ? format(parseISO(a.inicio), "HH:mm") : "--:--"}</span>
                        <span className="text-[13.5px] font-medium truncate flex-1">{a.titulo || a.customer_name || "Job"}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: grade semanal */}
      <div className="panel overflow-x-auto hidden md:block">
        <div className="min-w-[700px]">
          {/* Header */}
          <div className="grid grid-cols-8 border-b border-[color:var(--hairline)]">
            <div className="p-3 text-xs text-muted-foreground font-medium" />
            {days.map(day => {
              const isToday = isSameDay(day, new Date());
              return (
                <div key={day.toISOString()} className={`p-3 text-center border-l border-[color:var(--hairline)] ${isToday ? "bg-[color:var(--brand-soft)]" : ""}`}>
                  <div className="text-[11px] font-medium text-muted-foreground uppercase">{format(day, "EEE", { locale: ptBR })}</div>
                  <div className={`text-[15px] font-bold mt-0.5 ${isToday ? "text-[color:var(--brand-text)]" : ""}`}>{format(day, "d")}</div>
                  <button onClick={() => openNew(day)} className="mt-1 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 mx-auto">
                    <Plus className="size-3" />{appsForDay(day).length} jobs
                  </button>
                </div>
              );
            })}
          </div>

          {/* Time rows */}
          {HOURS.map(h => (
            <div key={h} className="grid grid-cols-8 border-b border-[color:var(--hairline)]">
              <div className="p-2 text-[11px] text-muted-foreground font-medium text-right pr-3 pt-3">
                {String(h).padStart(2, "0")}:00
              </div>
              {days.map(day => {
                const appsAtHour = appsForDay(day).filter(a => {
                  if (!a.inicio) return false;
                  const appH = parseISO(a.inicio).getHours();
                  return appH === h;
                });
                return (
                  <div key={day.toISOString()} className="border-l border-[color:var(--hairline)] p-1 min-h-[56px] relative">
                    {appsAtHour.map(a => (
                      <button key={a.id} onClick={() => setSelected(a)}
                        className="w-full text-left mb-1 rounded-md px-2 py-1 text-[11px] font-semibold truncate"
                        style={{ background: STATUS_COLORS[a.status] ?? "#3b82f6", color: textOn(STATUS_COLORS[a.status] ?? "#3b82f6") }}>
                        {a.titulo || a.customer_name || "Job"}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1" />
          <div className="w-full max-w-sm bg-[color:var(--panel)] border-l border-[color:var(--hairline)] p-5 overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-bold text-lg">{selected.titulo}</h2>
                <Badge style={{ background: STATUS_COLORS[selected.status] + "22", color: STATUS_COLORS[selected.status], border: `1px solid ${STATUS_COLORS[selected.status]}44` }}>
                  {STATUS_LABELS[selected.status] ?? selected.status}
                </Badge>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Clock className="size-4 shrink-0" />{format(parseISO(selected.inicio), "d MMM 'às' HH:mm", { locale: ptBR })}</div>
              {selected.customer_name && <div className="flex items-center gap-2 text-muted-foreground"><User className="size-4 shrink-0" />{selected.customer_name} {selected.customer_phone && <a href={`https://wa.me/${selected.customer_phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-[color:var(--brand-text)] ml-1"><ExternalLink className="size-3 inline" /></a>}</div>}
              {(selected as any).professional?.name && <div className="flex items-center gap-2 text-muted-foreground"><User className="size-4 shrink-0" />Profissional: {(selected as any).professional.name}</div>}
              {selected.address && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="size-4 shrink-0" />{selected.address}</div>}
              {selected.price != null && <div className="font-bold text-lg text-[color:var(--brand-text)]">{fmtMoney(selected.price, currency)}</div>}
              {selected.notes && <p className="text-muted-foreground bg-[color:var(--panel-2)] rounded-lg p-3">{selected.notes}</p>}
            </div>
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ações</p>
              <div className="flex flex-wrap gap-2">
                {["confirmado", "a_caminho", "em_andamento", "concluido", "cancelado"].map(s => (
                  <Button key={s} size="sm" variant={selected.status === s ? "default" : "outline"}
                    onClick={() => updateStatus(selected.id, s)}
                    style={selected.status === s ? { background: STATUS_COLORS[s], color: "#04140b" } : {}}>
                    {STATUS_LABELS[s]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New appointment dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-1.5"><Label>Título</Label><Input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ex: Limpeza residencial" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Início *</Label><Input type="datetime-local" value={form.inicio} onChange={e => setForm(f => ({ ...f, inicio: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Fim *</Label><Input type="datetime-local" value={form.fim} onChange={e => setForm(f => ({ ...f, fim: e.target.value }))} /></div>
            </div>
            {services.length > 0 && <div className="space-y-1.5"><Label>Serviço</Label><select value={form.serviceId} onChange={e => { const s = services.find(x => x.id === e.target.value); setForm(f => ({ ...f, serviceId: e.target.value, titulo: f.titulo || s?.name || "", price: f.price || String(s?.price ?? "") })); }} className="w-full h-9 rounded-lg border border-[color:var(--input)] bg-background px-3 text-sm"><option value="">—</option>{services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>}
            {professionals.length > 0 && <div className="space-y-1.5"><Label>Profissional</Label><select value={form.professionalId} onChange={e => setForm(f => ({ ...f, professionalId: e.target.value }))} className="w-full h-9 rounded-lg border border-[color:var(--input)] bg-background px-3 text-sm"><option value="">Qualquer</option>{professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Cliente</Label><Input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Nome" /></div>
              <div className="space-y-1.5"><Label>WhatsApp</Label><Input value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} placeholder="+1 555..." /></div>
            </div>
            <div className="space-y-1.5"><Label>Endereço do job</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main St, Miami FL" /></div>
            <div className="space-y-1.5"><Label>Valor ($)</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" /></div>
            <div className="space-y-1.5"><Label>Observações</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Salvando…" : "Agendar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
