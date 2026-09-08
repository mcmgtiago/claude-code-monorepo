import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import {
  LayoutDashboard, Bot, KanbanSquare, LogOut, Smartphone, Shield,
  Inbox, Users, BarChart3, Settings, Contact, Zap, MessageCircle,
  Calendar, Wrench, DollarSign, FileText, Sparkles, Menu, X, Megaphone, RotateCcw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { brand, supportWhatsappUrl, supportWhatsappDisplay } from "@/config/brand";
import { TrialBanner } from "@/components/trial-banner";
import { BILLING_ENABLED } from "@/config/features";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileBottomNav, type MobileNavItem } from "@/components/mobile-bottom-nav";
import { toast } from "sonner";
import type { CompanyRow, Membership } from "@/lib/tenant";
import { useWhatsappStatus } from "@/hooks/use-whatsapp-status";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n";

type NavItem = {
  to: string;
  label: string;
  icon: any;
  adminOnly?: boolean;
  tag?: string;
  badge?: boolean;
};

function buildSections(t: ReturnType<typeof useI18n>["t"]): { label: string; items: NavItem[] }[] {
  return [
    {
      label: t.sections.atendimento,
      items: [
        { to: "/app/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
        { to: "/app/conversas", label: t.nav.conversas, icon: Inbox, badge: true },
        { to: "/app/crm", label: t.nav.crm, icon: KanbanSquare },
        { to: "/app/agente", label: t.nav.agente, icon: Bot, tag: "IA", adminOnly: true },
      ],
    },
    {
      label: t.sections.negocios,
      items: [
        { to: "/app/agenda", label: t.nav.agenda, icon: Calendar },
        { to: "/app/orcamentos", label: t.nav.orcamentos, icon: FileText },
        { to: "/app/financeiro", label: t.nav.financeiro, icon: DollarSign },
      ],
    },
    {
      label: t.sections.operacoes,
      items: [
        { to: "/app/servicos", label: t.nav.servicos, icon: Wrench },
        { to: "/app/contatos", label: t.nav.contatos, icon: Contact },
        { to: "/app/equipe", label: t.nav.equipe, icon: Users, adminOnly: true },
      ],
    },
    {
      label: t.sections.growth,
      items: [
        { to: "/app/aigrowth", label: t.nav.aigrowth, icon: Sparkles, tag: "IA" },
        { to: "/app/reativacao", label: "Recuperação de Base", icon: RotateCcw, adminOnly: true },
        { to: "/app/midia", label: "Performance de Mídia", icon: Megaphone, adminOnly: true },
        { to: "/app/relatorios", label: t.nav.relatorios, icon: BarChart3, adminOnly: true },
      ],
    },
    {
      label: t.sections.config,
      items: [
        { to: "/app/conexao", label: t.nav.conexao, icon: Smartphone },
        { to: "/app/configuracoes", label: t.nav.configuracoes, icon: Settings, adminOnly: true },
      ],
    },
  ];
}

export function AppShell({
  children,
  company,
  membership,
  email,
  isSuperAdmin,
}: {
  children: ReactNode;
  company: CompanyRow | null;
  membership?: Membership | null;
  email?: string | null;
  isSuperAdmin?: boolean;
}) {
  const loc = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/entrar", replace: true });
  }

  const primary = company?.primary_color || brand.primary;
  const isAdmin = membership?.role === "owner" || membership?.role === "admin";
  const roleLabel =
    membership?.role === "owner" ? "Dono"
    : membership?.role === "admin" ? "Admin"
    : membership?.role === "atendente" ? "Atendente"
    : "Membro";
  const userName = (email || "Você").split("@")[0];

  const { t } = useI18n();
  const sections = buildSections(t);

  const mobileItems: MobileNavItem[] = [
    { to: "/app/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { to: "/app/conversas", label: t.nav.conversas, icon: Inbox },
    { to: "/app/crm", label: "CRM", icon: KanbanSquare },
    { to: "/app/agenda", label: t.nav.agenda, icon: Calendar },
    { to: "/app/aigrowth", label: t.nav.aigrowth, icon: Sparkles },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" style={{ ["--brand" as any]: primary }}>
      {BILLING_ENABLED && company && <TrialBanner company={company} />}

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 bg-[color:var(--panel)]/80 backdrop-blur-xl border-b border-[color:var(--hairline)]">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          className="size-9 -ml-1.5 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-[color:var(--panel-2)] shrink-0"
        >
          <Menu className="size-[20px]" />
        </button>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {company?.logo_url ? (
            <img src={company.logo_url} alt={company.nome} className="size-8 rounded-lg object-cover ring-1 ring-[color:var(--hairline)]" />
          ) : (
            <div
              className="size-8 rounded-lg grid place-items-center text-primary-foreground shrink-0"
              style={{ background: `linear-gradient(135deg, ${primary}, var(--brand-strong))` }}
            >
              <Zap className="size-4" strokeWidth={2.5} />
            </div>
          )}
          <div className="min-w-0">
            <div className="font-display font-bold tracking-tight text-[14.5px] leading-none truncate">{brand.name}</div>
            <div className="text-[10.5px] text-muted-foreground truncate mt-0.5">{company?.nome || "Sua empresa"}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle />
          <button
            onClick={signOut}
            title="Sair"
            className="size-9 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-[18px]" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar
          loc={loc}
          sections={sections}
          company={company}
          isSuperAdmin={isSuperAdmin}
          isAdmin={isAdmin}
          primary={primary}
          userName={userName}
          email={email}
          roleLabel={roleLabel}
          signOut={signOut}
        />
        <main className="flex-1 px-4 pt-4 pb-28 md:p-8 md:pb-8 max-w-7xl w-full mx-auto">
          <div className="hidden md:flex items-center justify-between gap-3 mb-6">
            <WhatsappStatusPill />
            <div className="flex items-center gap-2 ml-auto">
              <LanguageSwitcher />
              <ThemeToggle />
              <div
                className="size-9 rounded-full grid place-items-center text-[13px] font-bold text-[color:var(--brand-text)] ring-1 ring-[color:var(--hairline-strong)]"
                style={{ background: "var(--brand-soft)" }}
                title={email || ""}
              >
                {(userName || "U").slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
          {children}
        </main>
      </div>

      <MobileMenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        sections={sections}
        loc={loc}
        primary={primary}
        isAdmin={isAdmin}
        isSuperAdmin={isSuperAdmin}
        company={company}
        userName={userName}
        roleLabel={roleLabel}
        signOut={signOut}
      />

      <MobileBottomNav items={mobileItems} accent={primary} />
    </div>
  );
}

function MobileMenuDrawer({
  open, onClose, sections, loc, primary, isAdmin, isSuperAdmin, company, userName, roleLabel, signOut,
}: any) {
  if (!open) return null;
  return (
    <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute left-0 top-0 bottom-0 w-[84%] max-w-[330px] bg-[color:var(--sidebar-bg)] border-r border-[color:var(--hairline)] flex flex-col animate-in slide-in-from-left duration-200">
        <div className="px-4 py-4 flex items-center gap-3 border-b border-[color:var(--hairline)]">
          {company?.logo_url ? (
            <img src={company.logo_url} alt={company.nome} className="size-9 rounded-lg object-cover" />
          ) : (
            <div className="size-9 rounded-lg grid place-items-center text-primary-foreground" style={{ background: `linear-gradient(135deg, ${primary}, var(--brand-strong))` }}>
              <Zap className="size-4" strokeWidth={2.5} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-display font-bold text-[15px] truncate">{brand.name}</div>
            <div className="text-[11px] text-muted-foreground truncate">{company?.nome || "Sua empresa"}</div>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="size-8 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {sections.map((sec: { label: string; items: NavItem[] }) => {
            const items = sec.items.filter((it: NavItem) => !it.adminOnly || isAdmin);
            if (items.length === 0) return null;
            return (
              <div key={sec.label}>
                <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">{sec.label}</div>
                <div className="flex flex-col gap-0.5">
                  {items.map((item: NavItem) => {
                    const Icon = item.icon;
                    const active = loc.pathname.startsWith(item.to);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className={`relative flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium transition-all ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-[color:var(--panel-2)]"}`}
                        style={active ? { background: "var(--brand-soft)", boxShadow: `inset 0 0 0 1px var(--brand-soft-strong)` } : undefined}
                      >
                        <Icon className="size-[19px] shrink-0" style={active ? { color: primary } : undefined} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.tag && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded ring-1" style={{ background: "var(--brand-soft)", color: "var(--brand-text)", borderColor: "var(--brand-soft-strong)" }}>{item.tag}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {isSuperAdmin && (
            <Link to="/master/painel" onClick={onClose} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[14px] font-medium text-destructive hover:bg-[color:var(--panel-2)]">
              <Shield className="size-4" /> Painel Master
            </Link>
          )}
        </nav>

        <div className="p-3 border-t border-[color:var(--hairline)] flex items-center gap-3">
          <div className="size-9 rounded-full grid place-items-center text-[13px] font-bold text-[color:var(--brand-text)] ring-1 ring-[color:var(--hairline-strong)] shrink-0" style={{ background: "var(--brand-soft)" }}>
            {(userName || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-semibold truncate">{userName}</div>
            <div className="text-[11px] text-muted-foreground truncate">{roleLabel}</div>
          </div>
          <button onClick={signOut} title="Sair" className="size-9 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-[color:var(--panel-2)]">
            <LogOut className="size-[18px]" />
          </button>
        </div>
      </aside>
    </div>
  );
}

function Sidebar({
  loc, sections, company, isSuperAdmin, isAdmin, primary, userName, email, roleLabel, signOut,
}: any) {
  return (
    <aside className="hidden md:flex w-[260px] min-h-screen border-r border-[color:var(--hairline)] bg-[color:var(--sidebar-bg)] flex-col">
      <div className="px-5 py-5 flex items-center gap-3 border-b border-[color:var(--hairline)]">
        {company?.logo_url ? (
          <img src={company.logo_url} alt={company.nome} className="size-10 rounded-xl object-cover ring-1 ring-[color:var(--hairline)]" />
        ) : (
          <div
            className="size-10 rounded-xl grid place-items-center text-primary-foreground shadow-md ring-1 ring-[color:var(--hairline)]"
            style={{ background: `linear-gradient(135deg, ${primary}, var(--brand-strong))` }}
          >
            <Zap className="size-5" strokeWidth={2.5} />
          </div>
        )}
        <div className="min-w-0">
          <div className="font-display font-extrabold tracking-tight truncate text-[16px]">{brand.name}</div>
          <div className="text-[11.5px] text-muted-foreground truncate -mt-0.5">{company?.nome || "Sua empresa"}</div>
        </div>
      </div>

      <nav className="p-3 flex-1 overflow-y-auto space-y-5">
        {sections.map((sec: { label: string; items: NavItem[] }) => (
          <div key={sec.label}>
            <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
              {sec.label}
            </div>
            <div className="flex flex-col gap-1">
              {sec.items.filter((item: NavItem) => !item.adminOnly || isAdmin).map((item: NavItem) => (
                <NavLink key={item.to} item={item} active={loc.pathname.startsWith(item.to)} primary={primary} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-[color:var(--hairline)]">
        {isSuperAdmin && (
          <Link to="/master/painel" className="mb-2 flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-destructive hover:bg-[color:var(--panel-2)]">
            <Shield className="size-4" /> Painel Master
          </Link>
        )}
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-[color:var(--panel-2)] border border-[color:var(--hairline)]">
          <div
            className="size-9 rounded-full grid place-items-center text-[13px] font-bold text-[color:var(--brand-text)] ring-1 ring-[color:var(--hairline-strong)] shrink-0"
            style={{ background: "var(--brand-soft)" }}
          >
            {(userName || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-semibold truncate">{userName}</div>
            <div className="text-[11px] text-muted-foreground truncate" title={email || ""}>{roleLabel}</div>
          </div>
          <button onClick={signOut} title="Sair" className="size-8 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-[color:var(--panel)]">
            <LogOut className="size-4" />
          </button>
        </div>
        <a
          href={supportWhatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-1.5 px-2 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="size-3" />
          <span>Suporte: {supportWhatsappDisplay}</span>
        </a>
      </div>
    </aside>
  );
}

function NavLink({ item, active, primary }: { item: NavItem; active: boolean; primary: string }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={`relative flex items-center gap-3 px-3 py-[11px] rounded-lg text-[14.5px] font-medium whitespace-nowrap transition-all ${
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-[color:var(--panel-2)]"
      }`}
      style={
        active
          ? {
              background: "var(--brand-soft)",
              boxShadow: `inset 0 0 0 1px var(--brand-soft-strong), 0 0 22px -10px ${primary}`,
            }
          : undefined
      }
    >
      {active && (
        <span
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r"
          style={{ background: primary, boxShadow: `0 0 12px ${primary}` }}
        />
      )}
      <Icon className="size-[18px] shrink-0" style={active ? { color: primary } : undefined} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.tag && (
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded ring-1"
          style={{
            background: "var(--brand-soft)",
            color: "var(--brand-text)",
            borderColor: "var(--brand-soft-strong)",
          }}
        >
          {item.tag}
        </span>
      )}
    </Link>
  );
}

function WhatsappStatusPill() {
  const status = useWhatsappStatus();
  const connected = status === "connected";
  const connecting = status === "connecting";
  const label = connected ? "Atendimento ativo" : connecting ? "Conectando…" : "Nenhum canal ativo";
  const color = connected ? "#16a34a" : connecting ? "#f59e0b" : "#dc2626";
  return (
    <div
      className="flex items-center gap-2 text-[13.5px] font-medium px-3 py-1.5 rounded-full bg-[color:var(--panel)] border border-[color:var(--hairline)]"
      style={{ color }}
    >
      <span className="size-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
      {label}
    </div>
  );
}
