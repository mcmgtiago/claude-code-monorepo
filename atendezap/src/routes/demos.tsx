import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/config/brand";
import { Zap, ArrowRight, Check } from "lucide-react";
import { NICHOS, NICHO_LIST } from "@/lib/demo-nichos";

export const Route = createFileRoute("/demos")({
  head: () => ({ meta: [{ title: `${brand.name} — Demos por Nicho` }] }),
  component: DemosPage,
});

const FEATURES: Record<string, string[]> = {
  flooring:    ["Inbox + IA bilíngue EN/PT/ES", "Orçamentos por sq ft em 1 clique", "Agenda de instalações + equipe", "Financeiro por job"],
  roofing:     ["Triagem de storm damage 24/7", "Acompanhamento de seguro", "Pipeline de $80k+ visível", "Agenda de inspeções"],
  painting:    ["Consultas de cor agendadas online", "Orçamentos por cômodo ou sq ft", "Follow-up automático de leads", "Controle de equipe"],
  cleaning:    ["Contratos recorrentes no CRM", "Agendamento automático Airbnb", "Pipeline de receita mensal", "Retenção de clientes"],
  landscaping: ["Contratos anuais de manutenção", "Design de jardim com orçamento", "Agenda semanal de crews", "Recorrência previsível"],
};

function DemosPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#ffffff" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#0efa71", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={18} color="#050f07" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>{brand.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 1 }}>Escolha um nicho para ver o demo</div>
          </div>
        </div>
        <a
          href="https://wa.me/5551998198713?text=Ol%C3%A1!%20Quero%20conhecer%20o%20VeloHUB%20para%20o%20meu%20neg%C3%B3cio."
          target="_blank"
          rel="noopener noreferrer"
          style={{ padding: "8px 18px", borderRadius: 999, background: "#0efa71", color: "#050f07", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
        >
          Solicitar acesso
        </a>
      </div>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "64px 24px 48px" }}>
        <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 999, background: "rgba(14,250,113,0.1)", border: "1px solid rgba(14,250,113,0.2)", color: "#0efa71", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 16 }}>
          DEMOS INTERATIVOS
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 12 }}>
          Veja o {brand.name} funcionando<br />
          <span style={{ color: "#0efa71" }}>no seu nicho</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>
          Cada demo usa dados reais do segmento — clientes, conversas, orçamentos e agenda do seu mercado.
        </p>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {NICHO_LIST.map((key) => {
          const n = NICHOS[key];
          const feats = FEATURES[key] ?? [];
          return (
            <a
              key={key}
              href={`/demo/dashboard?n=${key}`}
              style={{ display: "block", textDecoration: "none", borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "#111111", padding: "20px", transition: "border-color 0.2s", color: "inherit" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(14,250,113,0.35)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{n.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 2 }}>{n.label}</div>
              <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginBottom: 14 }}>{n.tagline}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
                {feats.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.58)" }}>
                    <Check size={13} color="#0efa71" strokeWidth={2.5} />
                    {f}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#0efa71", fontSize: 13, fontWeight: 600 }}>
                Ver demo <ArrowRight size={13} />
              </div>
            </a>
          );
        })}

        {/* CTA card */}
        <div style={{ borderRadius: 18, border: "1px solid rgba(14,250,113,0.2)", background: "rgba(14,250,113,0.05)", padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 32, marginBottom: 10 }}>✨</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Outro nicho?</div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
              Fazemos demos personalizados para qualquer serviço acima de $500. Fale com a gente.
            </p>
          </div>
          <a
            href="https://wa.me/5551998198713"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 20, display: "inline-flex", alignItems: "center", gap: 6, color: "#0efa71", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
          >
            Falar com a gente <ArrowRight size={13} />
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px", textAlign: "center", color: "rgba(255,255,255,0.28)", fontSize: 12 }}>
        Desenvolvido por{" "}
        <a href="https://law.velocitycompany.com.br" target="_blank" rel="noopener noreferrer" style={{ color: "#0efa71", textDecoration: "none" }}>
          Velo.Law
        </a>
      </div>
    </div>
  );
}
