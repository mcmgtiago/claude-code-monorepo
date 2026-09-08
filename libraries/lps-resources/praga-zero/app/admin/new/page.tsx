"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, Palette, Upload } from "lucide-react";
import { pexelsMediaSets } from "@/config/pexels-curated";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Status = { type: "idle" | "loading" | "success" | "error"; message: string; slug?: string };

const palettes = [
  { name: "WhatsApp premium", primary: "#25D366", danger: "#DC2626", warning: "#FCD34D", bg: "#FFFFFF", text: "#1F2937", muted: "#6B7280", surface: "#F9FAFB" },
  { name: "Azul técnico", primary: "#0EA5E9", danger: "#DC2626", warning: "#FBBF24", bg: "#FFFFFF", text: "#0F172A", muted: "#64748B", surface: "#F1F5F9" },
  { name: "Emergência dark", primary: "#22C55E", danger: "#EF4444", warning: "#FACC15", bg: "#080F0C", text: "#F8FAFC", muted: "#94A3B8", surface: "#111827" },
  { name: "Clean saúde", primary: "#14B8A6", danger: "#E11D48", warning: "#FDE047", bg: "#FCFFFE", text: "#12312E", muted: "#5F7974", surface: "#ECFDF5" },
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export default function NewTenantPage() {
  const [companyName, setCompanyName] = useState("Nova Dedetizadora");
  const [slug, setSlug] = useState("nova-dedetizadora");
  const [phone, setPhone] = useState("51999999999");
  const [email, setEmail] = useState("contato@empresa.com.br");
  const [city, setCity] = useState("Porto Alegre");
  const [mediaSet, setMediaSet] = useState(pexelsMediaSets[0].setId);
  const [theme, setTheme] = useState(palettes[0]);
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const selectedMedia = useMemo(() => pexelsMediaSets.find((set) => set.setId === mediaSet) || pexelsMediaSets[0], [mediaSet]);

  async function handleSubmit(formData: FormData) {
    setStatus({ type: "loading", message: "Criando página local..." });
    formData.set("companyName", companyName);
    formData.set("slug", slug);
    formData.set("phone", phone);
    formData.set("email", email);
    formData.set("city", city);
    formData.set("mediaSet", mediaSet);
    formData.set("theme", JSON.stringify(theme));

    const res = await fetch("/admin/api/tenant", { method: "POST", body: formData });
    const data = (await res.json()) as { ok: boolean; slug?: string; error?: string };
    if (!res.ok || !data.ok) {
      setStatus({ type: "error", message: data.error || "Não foi possível criar a página." });
      return;
    }
    setStatus({ type: "success", message: "Página criada com sucesso.", slug: data.slug });
  }

  return (
    <main className="min-h-screen bg-surface py-10">
      <div className="container max-w-6xl">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          <Card className="p-6 md:p-8">
            <div>
              <p className="text-sm font-semibold text-primary">Novo modelo local</p>
              <h1 className="mt-2 text-3xl font-extrabold">Criar nova página</h1>
              <p className="mt-3 text-muted">Envie o logo, escolha cores e selecione um conjunto de mídia. A copy da LP permanece pronta.</p>
            </div>

            <form action={handleSubmit} className="mt-8 grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold">Nome da empresa
                  <input value={companyName} onChange={(e) => { setCompanyName(e.target.value); setSlug(slugify(e.target.value)); }} className="h-11 rounded-xl border border-border px-4" required />
                </label>
                <label className="grid gap-2 text-sm font-semibold">Slug da página
                  <input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} className="h-11 rounded-xl border border-border px-4" required pattern="[a-z0-9-]+" />
                </label>
                <label className="grid gap-2 text-sm font-semibold">WhatsApp
                  <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} className="h-11 rounded-xl border border-border px-4" required />
                </label>
                <label className="grid gap-2 text-sm font-semibold">Email
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl border border-border px-4" required />
                </label>
                <label className="grid gap-2 text-sm font-semibold">Cidade padrão
                  <input value={city} onChange={(e) => setCity(e.target.value)} className="h-11 rounded-xl border border-border px-4" required />
                </label>
                <label className="grid gap-2 text-sm font-semibold">Logo
                  <span className="flex h-11 items-center gap-2 rounded-xl border border-dashed border-border px-4 text-muted"><Upload className="h-4 w-4" /> <input name="logo" type="file" accept="image/svg+xml,image/png,image/jpeg,image/webp" className="text-sm" /></span>
                </label>
              </div>

              <section>
                <h2 className="flex items-center gap-2 font-bold"><Palette className="h-5 w-5 text-primary" /> Paleta</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {palettes.map((palette) => (
                    <button key={palette.name} type="button" onClick={() => setTheme(palette)} className="rounded-2xl border border-border bg-white p-4 text-left transition hover:shadow-lg">
                      <span className="font-semibold">{palette.name}</span>
                      <span className="mt-3 flex gap-1">{Object.entries(palette).filter(([key]) => key !== "name").slice(0, 5).map(([key, color]) => <span key={key} className="h-6 w-6 rounded-full border" style={{ backgroundColor: color }} />)}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-4">
                  {(["primary", "danger", "warning", "text"] as const).map((key) => (
                    <label key={key} className="grid gap-2 text-xs font-bold uppercase tracking-wide text-muted">{key}
                      <input type="color" value={theme[key]} onChange={(e) => setTheme((current) => ({ ...current, [key]: e.target.value }))} className="h-11 w-full rounded-xl" />
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="font-bold">Conjunto Pexels</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {pexelsMediaSets.map((set) => (
                    <label key={set.setId} className="rounded-2xl border border-border bg-white p-4 transition has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/30">
                      <input type="radio" name="media-set-visible" checked={mediaSet === set.setId} onChange={() => setMediaSet(set.setId)} className="sr-only" />
                      <span className="font-semibold">{set.name}</span>
                      <span className="mt-1 block text-sm text-muted">{set.description}</span>
                    </label>
                  ))}
                </div>
              </section>

              <Button type="submit" size="lg" disabled={status.type === "loading"}>
                {status.type === "loading" ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />} Criar página
              </Button>
              {status.message ? <p className={status.type === "error" ? "font-semibold text-danger" : "font-semibold text-primary"}>{status.message} {status.slug ? <Link className="underline" href={`/${status.slug}`} target="_blank">Abrir /{status.slug}</Link> : null}</p> : null}
            </form>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="relative h-56 bg-text">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedMedia.hero.poster} alt={selectedMedia.hero.alt} className="h-full w-full object-cover opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-sm font-semibold">Preview</p>
                <h2 className="mt-1 text-2xl font-extrabold">{companyName}</h2>
                <p className="mt-1 text-sm text-white/75">/{slug}</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex gap-2">{Object.entries(theme).filter(([key]) => key !== "name").slice(0, 6).map(([key, color]) => <span key={key} className="h-9 w-9 rounded-full border" style={{ backgroundColor: color }} />)}</div>
              <p className="mt-5 text-sm text-muted">Cidade: {city}</p>
              <p className="mt-1 text-sm text-muted">Mídia: {selectedMedia.name}</p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
