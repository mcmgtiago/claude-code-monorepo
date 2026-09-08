import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { listTenants } from "@/lib/tenants";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";

export default function AdminPage() {
  const tenants = listTenants();
  return (
    <main className="min-h-screen bg-surface py-10">
      <ThemeProvider theme={tenants[0]?.theme || { primary: "#25D366", danger: "#DC2626", warning: "#FCD34D", bg: "#FFFFFF", text: "#1F2937", muted: "#6B7280", surface: "#F9FAFB" }} />
      <div className="container">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-primary">Gerador local de landing pages</p>
            <h1 className="mt-2 text-4xl font-extrabold">Modelos criados</h1>
            <p className="mt-3 max-w-2xl text-muted">Crie uma nova página trocando logo, paleta e conjunto de mídia Pexels. A copy permanece igual para acelerar vendas.</p>
          </div>
          <Button asChild size="lg">
            <Link href="/admin/new"><Plus className="mr-2 h-5 w-5" /> Criar nova página</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tenants.map((tenant) => (
            <Card key={tenant.slug} className="overflow-hidden p-0">
              <div className="h-3" style={{ background: `linear-gradient(90deg, ${tenant.theme.primary}, ${tenant.theme.danger})` }} />
              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-extrabold"><BrandLogo src={tenant.company.logo} name={tenant.company.name} /></div>
                  <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold">/{tenant.slug}</span>
                </div>
                <p className="mt-5 text-sm text-muted">{tenant.label}</p>
                <div className="mt-5 flex gap-2">
                  {Object.entries(tenant.theme).slice(0, 5).map(([key, color]) => (
                    <span key={key} className="h-8 w-8 rounded-full border border-border" style={{ backgroundColor: color }} title={key} />
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/${tenant.slug}`} target="_blank"><ExternalLink className="mr-2 h-4 w-4" /> Abrir</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
