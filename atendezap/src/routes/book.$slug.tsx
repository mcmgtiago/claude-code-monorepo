import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { format, addDays, parseISO, isSameDay } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import { brand } from "@/config/brand";
import { getPublicBooking, getDayAvailability, createPublicBooking } from "@/lib/booking.functions";
import {
  Loader2, Check, Clock, ChevronLeft, CalendarCheck, MapPin, Phone, User, Mail, Zap, PartyPopper, HelpCircle, Building2,
} from "lucide-react";
import { fmtMoney } from "@/config/money";

export const Route = createFileRoute("/book/$slug")({
  head: () => ({ meta: [{ title: `Agendar — ${brand.name}` }] }),
  component: BookingPage,
});

type Booking = Awaited<ReturnType<typeof getPublicBooking>>;
type Service = Booking["services"][number];

/* ── i18n ───────────────────────────────────────── */
type Lang = "pt" | "en" | "es";
const LANGS: { code: Lang; flag: string }[] = [
  { code: "en", flag: "🇺🇸" }, { code: "pt", flag: "🇧🇷" }, { code: "es", flag: "🇪🇸" },
];
const DF: Record<Lang, any> = { pt: ptBR, en: enUS, es };
function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const l = (navigator.language || "en").slice(0, 2).toLowerCase();
  return l === "pt" ? "pt" : l === "es" ? "es" : "en";
}

const T: Record<Lang, any> = {
  pt: {
    online: "Agendamento online", chooseService: "Escolha o serviço", chooseServiceSub: "O que você precisa?",
    noServices: "Nenhum serviço disponível para agendamento online no momento.", min: "min",
    inquiryTitle: "Não tenho certeza / quero uma consultoria", inquirySub: "Deixe seus dados que entramos em contato.",
    chooseDate: "Escolha data e horário", noSlots: "Sem horários disponíveis neste dia. Escolha outra data.", continue: "Continuar",
    yourData: "Seus dados", forContact: "Preencha pra entrarmos em contato", toConfirm: "Pra confirmar o agendamento",
    consultRequest: "Pedido de consultoria",
    name: "Seu nome *", phone: "Telefone / WhatsApp *", email: "E-mail *", address: "Endereço *", city: "Cidade", state: "UF",
    preferred: "Melhor horário pra contato (ex: manhã, tarde)",
    urgency: "Urgência…", urgWeek: "Esta semana", urgMonth: "Este mês", urgBrowsing: "Só pesquisando",
    source: "Como conheceu?", srcReferral: "Indicação", srcOther: "Outro",
    notes: "Conte um pouco sobre o que você precisa (opcional)",
    sendRequest: "Enviar pedido", confirmBooking: "Confirmar agendamento",
    booked: "Agendamento confirmado!", received: "Recebemos seu pedido! ✅",
    thanks: (n: string) => `Obrigado, ${n}! Já estamos com seus dados.`,
    willContact: "📞 Entraremos em contato em horário comercial, em até 1 dia útil.",
    expediteA: "Quer agilizar? Fale direto com a", expediteB: "e diga que preencheu o formulário e quer atendimento prioritário:",
    back: "voltar", errFill: "Preencha nome, telefone, e-mail e endereço.", errSend: "Não foi possível enviar. Tente novamente.",
    hint: "Verifique o link e tente novamente.", dateFmt: "EEEE, d 'de' MMMM 'às' HH:mm",
  },
  en: {
    online: "Online booking", chooseService: "Choose a service", chooseServiceSub: "What do you need?",
    noServices: "No services available for online booking right now.", min: "min",
    inquiryTitle: "Not sure / I'd like a consultation", inquirySub: "Leave your info and we'll reach out.",
    chooseDate: "Choose date & time", noSlots: "No times available this day. Pick another date.", continue: "Continue",
    yourData: "Your info", forContact: "Fill in so we can reach you", toConfirm: "To confirm your appointment",
    consultRequest: "Consultation request",
    name: "Your name *", phone: "Phone / WhatsApp *", email: "Email *", address: "Address *", city: "City", state: "State",
    preferred: "Best time to contact you (e.g. morning, afternoon)",
    urgency: "Urgency…", urgWeek: "This week", urgMonth: "This month", urgBrowsing: "Just browsing",
    source: "How did you hear about us?", srcReferral: "Referral", srcOther: "Other",
    notes: "Tell us a bit about what you need (optional)",
    sendRequest: "Send request", confirmBooking: "Confirm appointment",
    booked: "Appointment confirmed!", received: "We got your request! ✅",
    thanks: (n: string) => `Thank you, ${n}! We have your details.`,
    willContact: "📞 We'll contact you during business hours, within 1 business day.",
    expediteA: "Want it faster? Reach out to", expediteB: "and let them know you filled out the form and want priority service:",
    back: "back", errFill: "Please fill in name, phone, email and address.", errSend: "Couldn't send. Please try again.",
    hint: "Check the link and try again.", dateFmt: "EEEE, MMMM d 'at' h:mm a",
  },
  es: {
    online: "Reserva online", chooseService: "Elige un servicio", chooseServiceSub: "¿Qué necesitas?",
    noServices: "No hay servicios disponibles para reservar ahora.", min: "min",
    inquiryTitle: "No estoy seguro / quiero una consulta", inquirySub: "Deja tus datos y te contactamos.",
    chooseDate: "Elige fecha y hora", noSlots: "Sin horarios disponibles ese día. Elige otra fecha.", continue: "Continuar",
    yourData: "Tus datos", forContact: "Completa para poder contactarte", toConfirm: "Para confirmar tu cita",
    consultRequest: "Solicitud de consulta",
    name: "Tu nombre *", phone: "Teléfono / WhatsApp *", email: "Correo *", address: "Dirección *", city: "Ciudad", state: "Estado",
    preferred: "Mejor horario para contactarte (ej: mañana, tarde)",
    urgency: "Urgencia…", urgWeek: "Esta semana", urgMonth: "Este mes", urgBrowsing: "Solo mirando",
    source: "¿Cómo nos conociste?", srcReferral: "Recomendación", srcOther: "Otro",
    notes: "Cuéntanos un poco sobre lo que necesitas (opcional)",
    sendRequest: "Enviar solicitud", confirmBooking: "Confirmar cita",
    booked: "¡Cita confirmada!", received: "¡Recibimos tu solicitud! ✅",
    thanks: (n: string) => `¡Gracias, ${n}! Ya tenemos tus datos.`,
    willContact: "📞 Te contactaremos en horario laboral, dentro de 1 día hábil.",
    expediteA: "¿Quieres agilizar? Contacta directamente a", expediteB: "y dile que completaste el formulario y quieres atención prioritaria:",
    back: "volver", errFill: "Completa nombre, teléfono, correo y dirección.", errSend: "No se pudo enviar. Intenta de nuevo.",
    hint: "Verifica el enlace e intenta de nuevo.", dateFmt: "EEEE, d 'de' MMMM 'a las' HH:mm",
  },
};

function BookingPage() {
  const { slug } = useParams({ from: "/book/$slug" });
  const loadBooking = useServerFn(getPublicBooking);
  const loadDay = useServerFn(getDayAvailability);
  const submit = useServerFn(createPublicBooking);

  const [lang, setLang] = useState<Lang>(() => detectLang());
  const t = T[lang];
  const dfLocale = DF[lang];

  const [data, setData] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<Date>(() => new Date());
  const [slots, setSlots] = useState<{ time: string; iso: string; disabled: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);

  const [inquiry, setInquiry] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "", state: "", preferredTime: "", urgency: "", source: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<{ mode: string; serviceName: string; startISO: string } | null>(null);

  const accent = data?.company.primary_color || "#0efa71";
  const currency = (data?.company as any)?.currency ?? "USD";

  useEffect(() => {
    loadBooking({ data: { slug } }).then(setData).catch((e) => setError(e?.message || "Empresa não encontrada"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const days = useMemo(() => {
    const advance = Math.min(data?.company.advanceDays ?? 30, 60);
    return Array.from({ length: advance }, (_, i) => addDays(new Date(), i));
  }, [data?.company.advanceDays]);

  useEffect(() => {
    if (!service || step !== 2) return;
    setLoadingSlots(true);
    setSlot(null);
    loadDay({ data: { slug, date: format(date, "yyyy-MM-dd") } })
      .then((res) => setSlots(buildSlots(date, res.open, res.close, res.taken, service.durationMinutes)))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, date, step, slug]);

  async function confirm() {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.address.trim()) return alert(t.errFill);
    setSaving(true);
    try {
      const r: any = await submit({
        data: {
          slug, serviceId: service?.id || undefined, startISO: slot || undefined,
          customerName: form.name, customerPhone: form.phone, customerEmail: form.email,
          address: form.address, city: form.city || undefined, state: form.state || undefined,
          preferredTime: form.preferredTime || undefined, urgency: form.urgency || undefined,
          source: form.source || undefined, notes: form.notes || undefined,
        },
      });
      setDone({ mode: r.mode, serviceName: r.serviceName, startISO: r.startISO });
      setStep(4);
    } catch (e: any) {
      alert(e?.message || t.errSend);
    } finally { setSaving(false); }
  }

  if (error) {
    return (
      <Shell accent="#0efa71" lang={lang} setLang={setLang}>
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <h1 className="text-xl font-bold">{error}</h1>
          <p className="text-sm text-muted-foreground mt-2">{t.hint}</p>
        </div>
      </Shell>
    );
  }
  if (!data) {
    return (
      <Shell accent="#0efa71" lang={lang} setLang={setLang}>
        <div className="grid place-items-center py-24 text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>
      </Shell>
    );
  }

  return (
    <Shell accent={accent} company={data.company} subtitle={t.online} lang={lang} setLang={setLang}>
      {step < 4 && (
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex-1 h-1.5 rounded-full transition-colors" style={{ background: n <= step ? accent : "var(--panel-2, #e5e5e5)" }} />
          ))}
        </div>
      )}

      {/* STEP 1 — serviço */}
      {step === 1 && (
        <div className="space-y-4">
          <StepTitle title={t.chooseService} sub={t.chooseServiceSub} />
          {data.services.length === 0 && <p className="text-sm text-muted-foreground">{t.noServices}</p>}
          <div className="space-y-2.5">
            {data.services.map((s) => (
              <button key={s.id} onClick={() => { setService(s); setStep(2); }}
                className="w-full text-left rounded-2xl border p-4 transition hover:shadow-sm" style={{ borderColor: "var(--hairline, #e5e5e5)" }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold">{s.name}</div>
                    {s.description && <div className="text-[13px] text-muted-foreground mt-0.5 line-clamp-2">{s.description}</div>}
                    <div className="flex items-center gap-3 mt-2 text-[12.5px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {s.durationMinutes} {t.min}</span>
                      {s.price != null && <span className="font-semibold" style={{ color: accent }}>{fmtMoney(s.price, currency, { decimals: 0 })}</span>}
                    </div>
                  </div>
                  <div className="size-9 rounded-full grid place-items-center shrink-0" style={{ background: `${accent}1f`, color: accent }}><CalendarCheck className="size-4" /></div>
                </div>
              </button>
            ))}
            <button onClick={() => { setInquiry(true); setService(null); setSlot(null); setStep(3); }}
              className="w-full text-left rounded-2xl border border-dashed p-4 transition hover:shadow-sm" style={{ borderColor: `${accent}66` }}>
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full grid place-items-center shrink-0" style={{ background: `${accent}1f`, color: accent }}><HelpCircle className="size-4" /></div>
                <div>
                  <div className="font-semibold">{t.inquiryTitle}</div>
                  <div className="text-[12.5px] text-muted-foreground">{t.inquirySub}</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — data + hora */}
      {step === 2 && service && (
        <div className="space-y-5">
          <BackBtn onClick={() => setStep(1)} label={t.back} />
          <StepTitle title={t.chooseDate} sub={service.name} />
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {days.map((d) => {
              const on = isSameDay(d, date);
              return (
                <button key={d.toISOString()} onClick={() => setDate(d)}
                  className="shrink-0 w-16 rounded-2xl border py-2.5 text-center transition"
                  style={{ borderColor: on ? accent : "var(--hairline, #e5e5e5)", background: on ? `${accent}14` : "transparent" }}>
                  <div className="text-[10.5px] uppercase text-muted-foreground">{format(d, "EEE", { locale: dfLocale })}</div>
                  <div className="text-[17px] font-bold" style={on ? { color: accent } : undefined}>{format(d, "d")}</div>
                  <div className="text-[10px] text-muted-foreground">{format(d, "MMM", { locale: dfLocale })}</div>
                </button>
              );
            })}
          </div>
          {loadingSlots ? (
            <div className="grid place-items-center py-8 text-muted-foreground"><Loader2 className="size-5 animate-spin" /></div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t.noSlots}</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((s) => (
                <button key={s.iso} disabled={s.disabled} onClick={() => setSlot(s.iso)}
                  className="rounded-xl border py-2.5 text-sm font-medium transition disabled:opacity-30 disabled:line-through whitespace-nowrap"
                  style={slot === s.iso ? { borderColor: accent, background: `${accent}14`, color: accent } : { borderColor: "var(--hairline, #e5e5e5)" }}>
                  {format(parseISO(s.iso), lang === "en" ? "h:mm a" : "HH:mm", { locale: dfLocale })}
                </button>
              ))}
            </div>
          )}
          <button disabled={!slot} onClick={() => setStep(3)}
            className="w-full h-12 rounded-2xl font-semibold text-[#04140b] disabled:opacity-40 transition" style={{ background: accent }}>
            {t.continue}
          </button>
        </div>
      )}

      {/* STEP 3 — contato */}
      {step === 3 && (inquiry || (service && slot)) && (
        <div className="space-y-5">
          <BackBtn onClick={() => setStep(inquiry ? 1 : 2)} label={t.back} />
          <StepTitle title={t.yourData} sub={inquiry ? t.forContact : t.toConfirm} />

          <div className="rounded-2xl border p-4 text-sm" style={{ borderColor: "var(--hairline, #e5e5e5)", background: `${accent}0d` }}>
            {inquiry ? (
              <div className="font-semibold flex items-center gap-2"><HelpCircle className="size-4" /> {t.consultRequest}</div>
            ) : (
              <>
                <div className="font-semibold">{service!.name}</div>
                <div className="text-muted-foreground mt-1 flex items-center gap-1.5">
                  <CalendarCheck className="size-3.5" />{format(parseISO(slot!), t.dateFmt, { locale: dfLocale })}
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <Field icon={<User className="size-4" />} placeholder={t.name} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field icon={<Phone className="size-4" />} placeholder={t.phone} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
            <Field icon={<Mail className="size-4" />} placeholder={t.email} value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
            <Field icon={<MapPin className="size-4" />} placeholder={t.address} value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
            <div className="grid grid-cols-[1fr_88px] gap-3">
              <Field icon={<Building2 className="size-4" />} placeholder={t.city} value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })} placeholder={t.state}
                className="w-full h-12 rounded-xl border px-3.5 text-sm outline-none text-center" style={{ borderColor: "var(--hairline, #e5e5e5)" }} />
            </div>
            {inquiry && (
              <Field icon={<Clock className="size-4" />} placeholder={t.preferred} value={form.preferredTime} onChange={(v) => setForm({ ...form, preferredTime: v })} />
            )}
            <div className="grid grid-cols-2 gap-3">
              <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                className="w-full h-12 rounded-xl border px-3 text-sm outline-none text-muted-foreground" style={{ borderColor: "var(--hairline, #e5e5e5)" }}>
                <option value="">{t.urgency}</option>
                <option value="Esta semana">{t.urgWeek}</option>
                <option value="Este mês">{t.urgMonth}</option>
                <option value="Só pesquisando">{t.urgBrowsing}</option>
              </select>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full h-12 rounded-xl border px-3 text-sm outline-none text-muted-foreground" style={{ borderColor: "var(--hairline, #e5e5e5)" }}>
                <option value="">{t.source}</option>
                <option value="Google">Google</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Indicação">{t.srcReferral}</option>
                <option value="Outro">{t.srcOther}</option>
              </select>
            </div>
            <textarea placeholder={t.notes} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border px-3.5 py-3 text-sm outline-none resize-none" style={{ borderColor: "var(--hairline, #e5e5e5)" }} rows={2} />
          </div>

          <button disabled={saving || !form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.address.trim()} onClick={confirm}
            className="w-full h-12 rounded-2xl font-semibold text-[#04140b] disabled:opacity-40 transition inline-flex items-center justify-center gap-2" style={{ background: accent }}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {inquiry ? t.sendRequest : t.confirmBooking}
          </button>
        </div>
      )}

      {/* STEP 4 — agradecimento */}
      {step === 4 && done && (
        <div className="text-center py-8 space-y-4">
          <div className="size-16 rounded-full grid place-items-center mx-auto" style={{ background: `${accent}1f`, color: accent }}><PartyPopper className="size-8" /></div>
          <div>
            <h1 className="text-xl font-bold">{done.mode === "scheduled" ? t.booked : t.received}</h1>
            {done.mode === "scheduled" && done.startISO ? (
              <p className="text-sm text-muted-foreground mt-1.5">{done.serviceName}<br />{format(parseISO(done.startISO), t.dateFmt, { locale: dfLocale })}</p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1.5">{t.thanks(form.name.split(" ")[0])}</p>
            )}
          </div>
          <div className="rounded-2xl border p-4 text-[13.5px] text-left space-y-2" style={{ borderColor: "var(--hairline, #e5e5e5)", background: `${accent}0a` }}>
            <p className="text-foreground font-medium">{t.willContact}</p>
            <p className="text-muted-foreground">{t.expediteA} <b className="text-foreground">{data.company.nome}</b> {t.expediteB}</p>
            <div className="flex flex-col gap-1.5 pt-1">
              {data.company.telefone && (
                <a href={`tel:${data.company.telefone}`} className="inline-flex items-center gap-2 font-semibold" style={{ color: accent }}><Phone className="size-4" /> {data.company.telefone}</a>
              )}
              {(data.company as any).email && (
                <a href={`mailto:${(data.company as any).email}`} className="inline-flex items-center gap-2 font-semibold" style={{ color: accent }}><Mail className="size-4" /> {(data.company as any).email}</a>
              )}
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

/* ── Layout ─────────────────────────────────────── */
function Shell({ accent, company, subtitle, lang, setLang, children }: { accent: string; company?: Booking["company"]; subtitle?: string; lang?: Lang; setLang?: (l: Lang) => void; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md">
        <header className="flex items-center gap-3 mb-6">
          {company?.logo_url ? (
            <img src={company.logo_url} alt={company.nome} className="size-11 rounded-xl object-cover" />
          ) : (
            <div className="size-11 rounded-xl grid place-items-center text-[#04140b]" style={{ background: accent }}><Zap className="size-5" strokeWidth={2.5} /></div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-bold text-[17px] leading-tight truncate">{company?.nome ?? brand.name}</div>
            <div className="text-[12px] text-muted-foreground">{subtitle ?? "Online booking"}</div>
          </div>
          {lang && setLang && (
            <div className="flex gap-1 shrink-0">
              {LANGS.map((o) => (
                <button key={o.code} onClick={() => setLang(o.code)} title={o.code.toUpperCase()}
                  className={`size-8 rounded-lg text-[15px] grid place-items-center transition ${lang === o.code ? "ring-1" : "opacity-50 hover:opacity-100"}`}
                  style={lang === o.code ? { background: `${accent}1f` } : undefined}>
                  {o.flag}
                </button>
              ))}
            </div>
          )}
        </header>
        <div className="rounded-3xl border bg-[color:var(--panel,#fff)] p-5 sm:p-6 shadow-sm" style={{ borderColor: "var(--hairline, #e5e5e5)" }}>{children}</div>
        <p className="text-center text-[11px] text-muted-foreground mt-5">
          Powered by <a href="https://hub.velocitycompany.com.br" className="font-semibold hover:underline" style={{ color: accent }}>Velo</a>
        </p>
      </div>
    </div>
  );
}

function StepTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h1 className="text-[19px] font-bold tracking-tight">{title}</h1>
      {sub && <p className="text-[13px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
function BackBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground -ml-1">
      <ChevronLeft className="size-4" /> {label}
    </button>
  );
}
function Field({ icon, placeholder, value, onChange, type = "text" }: {
  icon: React.ReactNode; placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-12 rounded-xl border pl-10 pr-3.5 text-sm outline-none" style={{ borderColor: "var(--hairline, #e5e5e5)" }} />
    </div>
  );
}

/* ── Slot generation ────────────────────────────── */
function buildSlots(date: Date, open: string | null, close: string | null, taken: { inicio: string; fim: string }[], durationMin: number): { time: string; iso: string; disabled: boolean }[] {
  if (!open || !close) return [];
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  const start = new Date(date); start.setHours(oh, om, 0, 0);
  const end = new Date(date); end.setHours(ch, cm, 0, 0);
  const now = Date.now();
  const takenRanges = taken.map((t) => ({ a: +new Date(t.inicio), b: +new Date(t.fim) }));
  const out: { time: string; iso: string; disabled: boolean }[] = [];
  const STEP = 30 * 60000;
  const dur = durationMin * 60000;
  for (let t = start.getTime(); t + dur <= end.getTime() + 1; t += STEP) {
    const s = t, e = t + dur;
    const overlaps = takenRanges.some((r) => s < r.b && e > r.a);
    out.push({ time: format(new Date(s), "HH:mm"), iso: new Date(s).toISOString(), disabled: overlaps || s < now });
  }
  return out;
}
