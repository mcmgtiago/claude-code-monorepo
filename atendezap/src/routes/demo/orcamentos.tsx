import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, X, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNicho } from "@/routes/demo";
import type { DemoQuote } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/orcamentos")({
  component: DemoOrcamentos,
});

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft:    { label: "Draft",    color: "#8aa89a" },
  sent:     { label: "Sent",     color: "#3b82f6" },
  accepted: { label: "Accepted", color: "#0efa71" },
  rejected: { label: "Rejected", color: "#ef4444" },
  expired:  { label: "Expired",  color: "#f59e0b" },
};

function DemoOrcamentos() {
  const nicho = useNicho();
  const [selected, setSelected] = useState<DemoQuote | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Quotes</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Proposals sent to customers — {nicho.company}</p>
      </div>

      <div className="space-y-2">
        {nicho.quotes.map(q => {
          const st = STATUS_MAP[q.status] ?? { label: q.status, color: "#8aa89a" };
          return (
            <div key={q.id} className="panel p-4 flex items-center gap-3 cursor-pointer hover:bg-[color:var(--panel-2)]" onClick={() => setSelected(q)}>
              <div className="size-10 rounded-xl bg-[color:var(--brand-soft)] grid place-items-center text-[color:var(--brand-text)] shrink-0">
                <FileText className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[15px] truncate">{q.customer_name}</span>
                  <Badge style={{ background: st.color + "22", color: st.color, border: `1px solid ${st.color}44` }} className="text-[10px] shrink-0">{st.label}</Badge>
                </div>
                <div className="text-[12px] text-muted-foreground">{q.customer_phone} · {format(new Date(q.created_at), "MMM d, yyyy", { locale: ptBR })}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-[15px]">${Number(q.total_amount).toLocaleString()}</div>
                <div className="text-[11px] text-muted-foreground">{q.items.length} item(s)</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1" />
          <div className="w-full max-w-sm bg-[color:var(--panel)] border-l border-[color:var(--hairline)] p-5 overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Quote</h2>
              <button onClick={() => setSelected(null)}><X className="size-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-1 mb-4">
              <div className="font-semibold">{selected.customer_name}</div>
              <div className="text-sm text-muted-foreground">{selected.customer_phone}</div>
            </div>
            <div className="space-y-1 bg-[color:var(--panel-2)] rounded-xl p-3 mb-4">
              {selected.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="flex-1 mr-2">{item.qty > 1 ? `${item.qty}× ` : ""}{item.name}</span>
                  <span className="font-medium shrink-0">${item.total.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-[color:var(--hairline)] mt-2 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-[color:var(--brand-text)]">${Number(selected.total_amount).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[color:var(--panel-2)] text-sm text-muted-foreground">
              <DollarSign className="size-4 shrink-0" />
              <span>Demo mode — quotes are sample data</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
