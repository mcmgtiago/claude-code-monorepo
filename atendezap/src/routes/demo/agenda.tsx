import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, DollarSign, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNicho } from "@/routes/demo";

export const Route = createFileRoute("/demo/agenda")({
  component: DemoAgenda,
});

const STATUS_COLORS: Record<string, string> = {
  agendado: "#3b82f6",
  confirmado: "#0efa71",
  em_andamento: "#f59e0b",
  concluido: "#8aa89a",
  cancelado: "#ef4444",
};
const STATUS_LABELS: Record<string, string> = {
  agendado: "Scheduled",
  confirmado: "Confirmed",
  em_andamento: "In Progress",
  concluido: "Completed",
  cancelado: "Cancelled",
};

function DemoAgenda() {
  const nicho = useNicho();
  const [week, setWeek] = useState(startOfWeek(new Date("2026-06-19"), { weekStartsOn: 0 }));
  const [selected, setSelected] = useState<(typeof nicho.appointments)[0] | null>(null);
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));

  function appsForDay(day: Date) {
    return nicho.appointments.filter(a => isSameDay(parseISO(a.date), day));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Agenda</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{nicho.company} — {format(week, "MMMM yyyy", { locale: ptBR })}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeek(w => subWeeks(w, 1))}><ChevronLeft className="size-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => setWeek(w => addWeeks(w, 1))}><ChevronRight className="size-4" /></Button>
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground mb-1">
        {days.map(d => (
          <div key={d.toISOString()}>{format(d, "EEE", { locale: ptBR }).toUpperCase()}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const apps = appsForDay(day);
          const isToday = isSameDay(day, new Date("2026-06-19"));
          return (
            <div key={day.toISOString()} className={`min-h-[100px] rounded-xl border p-1.5 ${isToday ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)]" : "border-[color:var(--hairline)] bg-[color:var(--panel)]"}`}>
              <div className={`text-[12px] font-bold mb-1 text-center ${isToday ? "text-[color:var(--brand-text)]" : "text-muted-foreground"}`}>
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {apps.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className="w-full text-left px-1.5 py-1 rounded-lg text-[10px] font-medium leading-tight transition-all hover:opacity-80"
                    style={{ background: STATUS_COLORS[a.status] + "22", color: STATUS_COLORS[a.status], border: `1px solid ${STATUS_COLORS[a.status]}44` }}
                  >
                    <div className="truncate font-bold">{a.slot}</div>
                    <div className="truncate">{a.customer.split(" ")[0]}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming list */}
      <div className="space-y-2 pt-2">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">This week's jobs</h2>
        {nicho.appointments
          .filter(a => {
            const d = parseISO(a.date);
            return d >= week && d <= addDays(week, 6);
          })
          .sort((a, b) => a.date.localeCompare(b.date) || a.slot.localeCompare(b.slot))
          .map(a => (
            <div key={a.id} className="panel p-3.5 flex items-center gap-3 cursor-pointer hover:bg-[color:var(--panel-2)]" onClick={() => setSelected(a)}>
              <div className="size-10 rounded-xl grid place-items-center shrink-0" style={{ background: STATUS_COLORS[a.status] + "20", color: STATUS_COLORS[a.status] }}>
                <Calendar className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[14px] truncate">{a.title}</span>
                  <Badge style={{ background: STATUS_COLORS[a.status] + "22", color: STATUS_COLORS[a.status], border: `1px solid ${STATUS_COLORS[a.status]}44` }} className="text-[10px] shrink-0">{STATUS_LABELS[a.status]}</Badge>
                </div>
                <div className="text-[12px] text-muted-foreground">{format(parseISO(a.date), "EEE, MMM d", { locale: ptBR })} at {a.slot} · {a.professional}</div>
              </div>
              {a.value > 0 && <div className="text-right shrink-0"><div className="font-bold text-[15px]">${a.value.toLocaleString()}</div></div>}
            </div>
          ))}
        {nicho.appointments.filter(a => { const d = parseISO(a.date); return d >= week && d <= addDays(week, 6); }).length === 0 && (
          <div className="panel p-8 text-center text-muted-foreground">No jobs scheduled this week</div>
        )}
      </div>

      {/* Detail slide-over */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1" />
          <div className="w-full max-w-sm bg-[color:var(--panel)] border-l border-[color:var(--hairline)] p-5 overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">Job Details</h2>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
            </div>
            <Badge style={{ background: STATUS_COLORS[selected.status] + "22", color: STATUS_COLORS[selected.status], border: `1px solid ${selected.status}44` }} className="mb-4">{STATUS_LABELS[selected.status]}</Badge>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2"><Calendar className="size-4 text-muted-foreground mt-0.5 shrink-0" /><div><div className="font-medium">{format(parseISO(selected.date), "EEEE, MMMM d, yyyy", { locale: ptBR })}</div><div className="text-muted-foreground">{selected.slot}</div></div></div>
              <div className="flex gap-2"><User className="size-4 text-muted-foreground mt-0.5 shrink-0" /><div><div className="font-medium">{selected.customer}</div><div className="text-muted-foreground">{selected.service}</div></div></div>
              <div className="flex gap-2"><Clock className="size-4 text-muted-foreground mt-0.5 shrink-0" /><div className="font-medium">{selected.professional}</div></div>
              <div className="flex gap-2"><MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" /><div className="text-muted-foreground">{selected.address}</div></div>
              {selected.value > 0 && <div className="flex gap-2"><DollarSign className="size-4 text-muted-foreground mt-0.5 shrink-0" /><div className="font-bold text-[color:var(--brand-text)]">${selected.value.toLocaleString()}</div></div>}
            </div>
            <div className="mt-5 p-3 rounded-lg bg-[color:var(--panel-2)] text-xs text-muted-foreground">
              🔒 Esta é uma demo — os agendamentos são dados de exemplo
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
