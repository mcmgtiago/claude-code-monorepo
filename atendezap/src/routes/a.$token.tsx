import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { format, parseISO, addDays } from "date-fns";
import { brand } from "@/config/brand";
import { getManagedAppointment, cancelManagedAppointment, rescheduleManagedAppointment } from "@/lib/appointment-public.functions";
import { getDayAvailability } from "@/lib/booking.functions";
import { LANGS, DF, detectLang, type Lang } from "@/config/public-lang";
import { Loader2, Zap, Clock, MapPin, CalendarClock, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/a/$token")({
  head: () => ({ meta: [{ title: `Manage appointment — ${brand.name}` }] }),
  component: ManagePage,
});

type Data = Awaited<ReturnType<typeof getManagedAppointment>>;

const T: Record<Lang, any> = {
  pt: {
    manage: "Gerenciar agendamento", service: "Serviço", when: "Quando", where: "Local",
    reschedule: "Reagendar", cancel: "Cancelar agendamento", cancelConfirm: "Tem certeza que deseja cancelar?",
    pickDate: "Escolha o dia", pickTime: "Escolha o horário", noSlots: "Sem horários neste dia", confirm: "Confirmar",
    back: "Voltar", rescheduledTitle: "Agendamento remarcado ✅", rescheduledMsg: "Avisamos a empresa do novo horário.",
    cancelledTitle: "Agendamento cancelado", cancelledMsg: "Tudo certo, cancelamos para você.",
    statusCancelled: "Este agendamento está cancelado.", err: "Algo deu errado. Tente novamente.",
    powered: "Desenvolvido por", dateFmt: "EEEE, d 'de' MMMM", chipFmt: "EEE d/MM",
  },
  en: {
    manage: "Manage appointment", service: "Service", when: "When", where: "Where",
    reschedule: "Reschedule", cancel: "Cancel appointment", cancelConfirm: "Are you sure you want to cancel?",
    pickDate: "Pick a day", pickTime: "Pick a time", noSlots: "No times on this day", confirm: "Confirm",
    back: "Back", rescheduledTitle: "Appointment rescheduled ✅", rescheduledMsg: "We've notified the business of the new time.",
    cancelledTitle: "Appointment cancelled", cancelledMsg: "Done — we've cancelled it for you.",
    statusCancelled: "This appointment is cancelled.", err: "Something went wrong. Please try again.",
    powered: "Powered by", dateFmt: "EEEE, MMMM d", chipFmt: "EEE M/d",
  },
  es: {
    manage: "Gestionar cita", service: "Servicio", when: "Cuándo", where: "Dónde",
    reschedule: "Reprogramar", cancel: "Cancelar cita", cancelConfirm: "¿Seguro que deseas cancelar?",
    pickDate: "Elige el día", pickTime: "Elige la hora", noSlots: "Sin horarios este día", confirm: "Confirmar",
    back: "Volver", rescheduledTitle: "Cita reprogramada ✅", rescheduledMsg: "Avisamos al negocio del nuevo horario.",
    cancelledTitle: "Cita cancelada", cancelledMsg: "Listo, la cancelamos por ti.",
    statusCancelled: "Esta cita está cancelada.", err: "Algo salió mal. Inténtalo de nuevo.",
    powered: "Desarrollado por", dateFmt: "EEEE d 'de' MMMM", chipFmt: "EEE d/MM",
  },
};

type Slot = { time: string; iso: string; disabled: boolean };

function buildSlots(date: Date, open: string | null, close: string | null, taken: { inicio: string; fim: string }[], durationMin: number): Slot[] {
  if (!open || !close) return [];
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  const start = new Date(date); start.setHours(oh, om, 0, 0);
  const end = new Date(date); end.setHours(ch, cm, 0, 0);
  const now = Date.now();
  const ranges = taken.map((t) => ({ a: +new Date(t.inicio), b: +new Date(t.fim) }));
  const out: Slot[] = [];
  const STEP = 30 * 60000;
  const dur = durationMin * 60000;
  for (let t = start.getTime(); t + dur <= end.getTime() + 1; t += STEP) {
    const s = t, e = t + dur;
    const overlaps = ranges.some((r) => s < r.b && e > r.a);
    out.push({ time: format(new Date(s), "HH:mm"), iso: new Date(s).toISOString(), disabled: overlaps || s < now });
  }
  return out;
}

function ManagePage() {
  const { token } = useParams({ from: "/a/$token" });
  const load = useServerFn(getManagedAppointment);
  const loadDay = useServerFn(getDayAvailability);
  const cancelFn = useServerFn(cancelManagedAppointment);
  const rescheduleFn = useServerFn(rescheduleManagedAppointment);

  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>(() => detectLang());
  const [view, setView] = useState<"menu" | "reschedule" | "done-r" | "done-c">("menu");
  const [date, setDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [chosen, setChosen] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const t = T[lang];
  const dfLocale = DF[lang];

  useEffect(() => {
    load({ data: { token } }).then(setData).catch((e) => setError(e?.message || T.en.err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (error) {
    return <Center accent="#0efa71"><div className="text-center"><div className="text-4xl mb-3">📅</div><h1 className="text-xl font-bold">{error}</h1></div></Center>;
  }
  if (!data) return <Center accent="#0efa71"><Loader2 className="size-6 animate-spin text-muted-foreground" /></Center>;

  const { appointment: ap, company } = data;
  const accent = company.primary_color;
  const cancelled = ap.status === "cancelado";

  async function pickDate(d: Date) {
    setDate(d); setChosen(""); setLoadingSlots(true);
    try {
      const res = await loadDay({ data: { slug: company.slug, date: format(d, "yyyy-MM-dd") } });
      setSlots(buildSlots(d, res.open, res.close, res.taken, ap.durationMinutes));
    } catch { setSlots([]); } finally { setLoadingSlots(false); }
  }

  async function doCancel() {
    if (!window.confirm(t.cancelConfirm)) return;
    setBusy(true);
    try { await cancelFn({ data: { token } }); setView("done-c"); }
    catch (e: any) { setError(e?.message || t.err); } finally { setBusy(false); }
  }

  async function doReschedule() {
    if (!chosen) return;
    setBusy(true);
    try { await rescheduleFn({ data: { token, startISO: chosen } }); setView("done-r"); }
    catch (e: any) { alert(e?.message || t.err); } finally { setBusy(false); }
  }

  const days = Array.from({ length: Math.min(company.advanceDays, 21) }, (_, i) => addDays(new Date(), i + 1));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg">
        <header className="flex items-center gap-3 mb-6">
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.nome} className="size-12 rounded-xl object-cover" />
          ) : (
            <div className="size-12 rounded-xl grid place-items-center text-[#04140b]" style={{ background: accent }}><Zap className="size-6" strokeWidth={2.5} /></div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-bold text-lg leading-tight truncate">{company.nome}</div>
            <div className="text-[12px] text-muted-foreground">{t.manage}</div>
          </div>
          <div className="flex gap-1 shrink-0">
            {LANGS.map((o) => (
              <button key={o.code} onClick={() => setLang(o.code)} title={o.code.toUpperCase()}
                className={`size-8 rounded-lg text-[15px] grid place-items-center transition ${lang === o.code ? "ring-1" : "opacity-50 hover:opacity-100"}`}
                style={lang === o.code ? { background: `${accent}1f` } : undefined}>
                {o.flag}
              </button>
            ))}
          </div>
        </header>

        {view === "done-r" || view === "done-c" ? (
          <div className="rounded-3xl border p-8 text-center" style={{ borderColor: "var(--hairline,#e5e5e5)" }}>
            {view === "done-r" ? <CheckCircle2 className="size-12 mx-auto mb-3" style={{ color: accent }} /> : <XCircle className="size-12 mx-auto mb-3 text-muted-foreground" />}
            <h2 className="text-xl font-bold">{view === "done-r" ? t.rescheduledTitle : t.cancelledTitle}</h2>
            <p className="text-sm text-muted-foreground mt-2">{view === "done-r" ? t.rescheduledMsg : t.cancelledMsg}</p>
          </div>
        ) : (
          <div className="rounded-3xl border bg-[color:var(--panel,#fff)] shadow-sm overflow-hidden" style={{ borderColor: "var(--hairline,#e5e5e5)" }}>
            <div className="p-5 sm:p-6 space-y-2.5">
              <div className="font-semibold text-base">{ap.titulo}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="size-4 shrink-0" />{format(parseISO(ap.inicio), t.dateFmt, { locale: dfLocale })} · {format(parseISO(ap.inicio), lang === "en" ? "h:mm a" : "HH:mm", { locale: dfLocale })}</div>
              {ap.address && <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4 shrink-0" />{ap.address}</div>}
              {cancelled && <div className="text-sm font-semibold text-red-500 pt-1">{t.statusCancelled}</div>}
            </div>

            {!cancelled && view === "menu" && (
              <div className="px-5 sm:px-6 pb-5 grid gap-2.5">
                <button onClick={() => setView("reschedule")} className="w-full h-12 rounded-xl font-semibold text-[#04140b] flex items-center justify-center gap-2" style={{ background: accent }}>
                  <CalendarClock className="size-4.5" /> {t.reschedule}
                </button>
                <button onClick={doCancel} disabled={busy} className="w-full h-11 rounded-xl font-medium border text-muted-foreground hover:text-red-500 hover:border-red-300 transition disabled:opacity-50" style={{ borderColor: "var(--hairline,#e5e5e5)" }}>
                  {busy ? "…" : t.cancel}
                </button>
              </div>
            )}

            {!cancelled && view === "reschedule" && (
              <div className="px-5 sm:px-6 pb-5">
                <div className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t.pickDate}</div>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                  {days.map((d) => {
                    const sel = date && format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
                    return (
                      <button key={d.toISOString()} onClick={() => pickDate(d)}
                        className={`shrink-0 px-3 py-2 rounded-xl text-[12px] font-medium border transition ${sel ? "text-[#04140b]" : "text-muted-foreground"}`}
                        style={sel ? { background: accent, borderColor: accent } : { borderColor: "var(--hairline,#e5e5e5)" }}>
                        {format(d, t.chipFmt, { locale: dfLocale })}
                      </button>
                    );
                  })}
                </div>

                {date && (
                  <div className="mt-3">
                    <div className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t.pickTime}</div>
                    {loadingSlots ? (
                      <div className="py-6 grid place-items-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
                    ) : slots.length === 0 ? (
                      <div className="py-4 text-sm text-muted-foreground text-center">{t.noSlots}</div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {slots.map((s) => (
                          <button key={s.iso} disabled={s.disabled} onClick={() => setChosen(s.iso)}
                            className="h-10 rounded-lg border text-[13px] font-medium disabled:opacity-30 disabled:line-through transition"
                            style={chosen === s.iso ? { borderColor: accent, background: `${accent}14`, color: accent } : { borderColor: "var(--hairline,#e5e5e5)" }}>
                            {format(parseISO(s.iso), lang === "en" ? "h:mm a" : "HH:mm", { locale: dfLocale })}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button onClick={() => { setView("menu"); setDate(null); setChosen(""); }} className="flex-1 h-11 rounded-xl font-medium border text-muted-foreground" style={{ borderColor: "var(--hairline,#e5e5e5)" }}>{t.back}</button>
                  <button onClick={doReschedule} disabled={!chosen || busy} className="flex-1 h-11 rounded-xl font-semibold text-[#04140b] disabled:opacity-40" style={{ background: accent }}>{busy ? "…" : t.confirm}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {company.telefone && !cancelled && (
          <p className="text-center text-[12px] text-muted-foreground mt-4">
            <a href={`tel:${company.telefone}`} className="font-semibold" style={{ color: accent }}>{company.telefone}</a>
          </p>
        )}

        <p className="text-center text-[11px] text-muted-foreground mt-5">
          {t.powered} <a href="https://hub.velocitycompany.com.br" className="font-semibold hover:underline" style={{ color: accent }}>Velo</a>
        </p>
      </div>
    </div>
  );
}

function Center({ children, accent }: { children: React.ReactNode; accent: string }) {
  return <div className="min-h-screen grid place-items-center bg-background text-foreground px-4" style={{ ["--brand" as any]: accent }}>{children}</div>;
}
