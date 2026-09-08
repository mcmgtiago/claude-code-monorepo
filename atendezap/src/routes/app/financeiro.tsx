import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, type FinancialEntry } from "@/lib/financial.functions";
import { fmtMoney, currencyOf } from "@/config/money";

export const Route = createFileRoute("/app/financeiro")({
  head: () => ({ meta: [{ title: `${brand.name} — Financeiro` }] }),
  component: FinanceiroPage,
});

function FinanceiroPage() {
  const ctx = Route.useRouteContext();
  const companyId = ctx.company?.id ?? "";
  const currency = currencyOf((ctx.company as any)?.currency);
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "entrada" as "entrada" | "saida", category: "", description: "", amount: "", date: format(new Date(), "yyyy-MM-dd"), status: "confirmado" });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"all" | "entrada" | "saida">("all");

  async function load() {
    if (!companyId) return;
    const { data } = await (supabase as any).from("financial_entry")
      .select("*")
      .eq("company_id", companyId)
      .gte("date", `${month}-01`)
      .lte("date", `${month}-31`)
      .order("date", { ascending: false });
    setEntries((data ?? []) as FinancialEntry[]);
  }

  useEffect(() => { load(); }, [companyId, month]);

  const income = entries.filter(e => e.type === "entrada" && e.status !== "cancelado").reduce((s, e) => s + Number(e.amount), 0);
  const expense = entries.filter(e => e.type === "saida" && e.status !== "cancelado").reduce((s, e) => s + Number(e.amount), 0);
  const profit = income - expense;
  const filtered = entries.filter(e => tab === "all" || e.type === tab);

  async function save() {
    if (!form.description || !form.amount) return toast.error("Preencha todos os campos");
    setSaving(true);
    try {
      await (supabase as any).from("financial_entry").insert({
        company_id: companyId,
        type: form.type,
        category: form.category || null,
        description: form.description,
        amount: parseFloat(form.amount),
        date: form.date,
        status: form.status,
      });
      toast.success("Lançamento adicionado");
      setOpen(false);
      load();
    } finally { setSaving(false); }
  }

  async function del(id: string) {
    await (supabase as any).from("financial_entry").delete().eq("id", id);
    toast.success("Removido");
    load();
  }

  function prevMonth() {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 2);
    setMonth(format(d, "yyyy-MM"));
  }
  function nextMonth() {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m);
    setMonth(format(d, "yyyy-MM"));
  }

  const categories = form.type === "entrada" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Entradas, saídas e resultado do mês</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="size-4 mr-1" />Novo lançamento</Button>
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="size-4" /></Button>
        <span className="font-semibold capitalize min-w-[160px] text-center">
          {format(new Date(`${month}-01`), "MMMM 'de' yyyy", { locale: ptBR })}
        </span>
        <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="size-4" /></Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="panel p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><TrendingUp className="size-4 text-green-500" />Entradas</div>
          <div className="text-2xl font-extrabold text-green-500">{fmtMoney(income, currency)}</div>
        </div>
        <div className="panel p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><TrendingDown className="size-4 text-red-500" />Saídas</div>
          <div className="text-2xl font-extrabold text-red-500">{fmtMoney(expense, currency)}</div>
        </div>
        <div className="panel p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><DollarSign className="size-4" />Resultado</div>
          <div className={`text-2xl font-extrabold ${profit >= 0 ? "text-[color:var(--brand-text)]" : "text-red-500"}`}>{fmtMoney(profit, currency)}</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {(["all", "entrada", "saida"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "all" ? "Todos" : t === "entrada" ? "Entradas" : "Saídas"}
          </button>
        ))}
      </div>

      {/* Entries list */}
      {filtered.length === 0 ? (
        <div className="panel p-10 text-center text-muted-foreground">Nenhum lançamento este mês</div>
      ) : (
        <div className="panel overflow-hidden">
          <div className="divide-y divide-[color:var(--hairline)]">
            {filtered.map(e => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[color:var(--panel-2)] group">
                <div className={`size-9 rounded-full grid place-items-center shrink-0 ${e.type === "entrada" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                  {e.type === "entrada" ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[14px] truncate">{e.description}</div>
                  <div className="text-[12px] text-muted-foreground flex items-center gap-2">
                    {format(new Date(`${e.date}T12:00:00`), "d MMM", { locale: ptBR })}
                    {e.category && <span className="px-1.5 py-0.5 rounded bg-[color:var(--panel-2)] text-[10px]">{e.category}</span>}
                    {e.status !== "confirmado" && <Badge variant={e.status === "pendente" ? "secondary" : "destructive"} className="text-[10px] px-1.5 py-0">{e.status}</Badge>}
                  </div>
                </div>
                <div className={`font-bold text-[15px] ${e.type === "entrada" ? "text-green-500" : "text-red-400"}`}>
                  {e.type === "saida" ? "-" : "+"}{fmtMoney(e.amount, currency)}
                </div>
                <button onClick={() => del(e.id)} className="size-7 grid place-items-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New entry dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Novo Lançamento</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex gap-1 p-1 bg-muted rounded-xl">
              {(["entrada", "saida"] as const).map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t, category: "" }))}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${form.type === t ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
                  {t === "entrada" ? "Entrada" : "Saída"}
                </button>
              ))}
            </div>
            <div className="space-y-1.5"><Label>Descrição *</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder={form.type === "entrada" ? "Ex: Limpeza residencial" : "Ex: Material de pintura"} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Valor ($) *</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Data</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full h-9 rounded-lg border border-[color:var(--input)] bg-background px-3 text-sm">
                <option value="">—</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full h-9 rounded-lg border border-[color:var(--input)] bg-background px-3 text-sm">
                <option value="confirmado">Confirmado</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Salvando…" : "Adicionar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
