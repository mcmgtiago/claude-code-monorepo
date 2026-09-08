import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, DollarSign, Star, Users, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNicho } from "@/routes/demo";

export const Route = createFileRoute("/demo/servicos")({
  component: DemoServicos,
});

function DemoServicos() {
  const nicho = useNicho();
  const [tab, setTab] = useState<"services" | "professionals">("services");

  const categories = [...new Set(nicho.services.map(s => s.category))];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Services & Team</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{nicho.company} — online booking catalog</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {(["services", "professionals"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "services" ? `Services (${nicho.services.length})` : `Team (${nicho.professionals.length})`}
          </button>
        ))}
      </div>

      {tab === "services" && (
        <div className="space-y-5">
          {categories.map(cat => {
            const svcs = nicho.services.filter(s => s.category === cat);
            return (
              <div key={cat}>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                  <Wrench className="size-3" />{cat}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {svcs.map(svc => (
                    <div key={svc.id} className="panel p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[15px] truncate flex items-center gap-1.5">
                            {svc.price === 0 && <Star className="size-3.5 text-yellow-500 shrink-0" fill="currentColor" />}
                            {svc.name}
                          </div>
                        </div>
                        {svc.price > 0
                          ? <div className="text-[color:var(--brand-text)] font-bold text-[14px] shrink-0 flex items-center gap-0.5"><DollarSign className="size-3" />{svc.price}/sqft</div>
                          : <Badge variant="secondary" className="text-[10px]">Free</Badge>}
                      </div>
                      {svc.description && <p className="text-[13px] text-muted-foreground line-clamp-2">{svc.description}</p>}
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-1 border-t border-[color:var(--hairline)]">
                        <Clock className="size-3" />{svc.duration_minutes >= 60 ? `${svc.duration_minutes / 60}h` : `${svc.duration_minutes}min`} avg
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "professionals" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {nicho.professionals.map(p => (
            <div key={p.id} className="panel p-4 flex items-center gap-3">
              <div className="size-12 rounded-full bg-[color:var(--brand-soft)] grid place-items-center text-[16px] font-bold text-[color:var(--brand-text)] shrink-0">
                {p.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[15px] truncate">{p.name}</div>
                <div className="text-[12px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                  <Users className="size-3" />{p.specialty}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="panel p-3 text-xs text-muted-foreground text-center">
        🔒 Demo mode — this catalog is pre-configured for {nicho.label}
      </div>
    </div>
  );
}
