import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, TrendingDown, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNicho } from "@/routes/demo";

export const Route = createFileRoute("/demo/financeiro")({
  component: DemoFinanceiro,
});

function DemoFinanceiro() {
  const nicho = useNicho();
  const [tab, setTab] = useState<"all" | "entrada" | "saida">("all");
  const [month, setMonth] = useState("2026-06");

  const entries = nicho.financial;
  const income  = entries.filter(e => e.type === "entrada").reduce((s, e) => s + e.amount, 0);
  const expense = entries.filter(e => e.type === "saida").reduce((s, e) => s + e.amount, 0);
  const profit  = income - expense;
  const filtered = entries.filter(e => tab === "all" || e.type === tab);

  const [y, m] = month.split("-").map(Number);
  const monthLabel = format(new Date(y, m - 1), "MMMM yyyy", { locale: ptBR });

  function prevMonth() { const d = new Date(y, m - 2); setMonth(format(d, "yyyy-MM")); }
  function nextMonth() { const d = new Date(y, m);     setMonth(format(d, "yyyy-MM")); }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{nicho.company}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="size-4" /></Button>
          <span className="font-semibold capitalize text-sm min-w-[140px] text-center">{monthLabel}</span>
          <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="size-4" /></Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="panel p-4">
          <div className="flex items-center gap-1.5 text-green-500 text-[12px] font-semibold mb-1"><TrendingUp className="size-3.5" />Income</div>
          <div className="text-[22px] font-extrabold text-green-500">${income.toLocaleString()}</div>
        </div>
        <div className="panel p-4">
          <div className="flex items-center gap-1.5 text-red-400 text-[12px] font-semibold mb-1"><TrendingDown className="size-3.5" />Expenses</div>
          <div className="text-[22px] font-extrabold text-red-400">${expense.toLocaleString()}</div>
        </div>
        <div className="panel p-4">
          <div className="flex items-center gap-1.5 text-[color:var(--brand-text)] text-[12px] font-semibold mb-1"><DollarSign className="size-3.5" />Profit</div>
          <div className={`text-[22px] font-extrabold ${profit >= 0 ? "text-[color:var(--brand-text)]" : "text-red-400"}`}>${profit.toLocaleString()}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {(["all", "entrada", "saida"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "all" ? "All" : t === "entrada" ? "Income" : "Expenses"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="panel p-8 text-center text-muted-foreground">No entries for this period</div>
        ) : (
          filtered.map(e => (
            <div key={e.id} className="panel p-4 flex items-center gap-3">
              <div className="size-10 rounded-xl grid place-items-center shrink-0"
                style={{ background: e.type === "entrada" ? "#0efa7120" : "#ef444420", color: e.type === "entrada" ? "#0efa71" : "#ef4444" }}>
                {e.type === "entrada" ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] truncate">{e.description}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-muted-foreground">{format(new Date(e.date), "MMM d", { locale: ptBR })}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{e.category}</Badge>
                </div>
              </div>
              <div className={`font-bold text-[15px] shrink-0 ${e.type === "entrada" ? "text-green-500" : "text-red-400"}`}>
                {e.type === "entrada" ? "+" : "−"}${e.amount.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="panel p-3 text-xs text-muted-foreground text-center">
        🔒 Demo mode — financial data is sample data for {nicho.label}
      </div>
    </div>
  );
}
