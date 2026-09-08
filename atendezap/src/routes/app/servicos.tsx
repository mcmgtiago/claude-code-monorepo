import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Clock, DollarSign, Star, Users } from "lucide-react";
import type { Service, Professional, ServiceCategory } from "@/lib/service.functions";
import { fmtMoney, currencyOf } from "@/config/money";

export const Route = createFileRoute("/app/servicos")({
  head: () => ({ meta: [{ title: `${brand.name} — Serviços` }] }),
  component: ServicosPage,
});

const DEFAULT_CATEGORIES_PT = ["Limpeza", "Jardinagem", "Pintura", "Telhado", "Piso", "Elétrica", "Hidráulica", "Geral"];

function ServicosPage() {
  const ctx = Route.useRouteContext();
  const companyId = ctx.company?.id ?? "";
  const currency = currencyOf((ctx.company as any)?.currency);

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [svcOpen, setSvcOpen] = useState(false);
  const [profOpen, setProfOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [editSvc, setEditSvc] = useState<Service | null>(null);
  const [editProf, setEditProf] = useState<Professional | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"services" | "professionals">("services");

  const [svcForm, setSvcForm] = useState({ name: "", description: "", duration_minutes: 60, price: "", category_id: "", featured: false, active: true });
  const [profForm, setProfForm] = useState({ name: "", specialty: "", commission_type: "percent" as "percent" | "fixed", commission_value: 0, active: true });
  const [catName, setCatName] = useState("");

  async function load() {
    if (!companyId) return;
    const [{ data: cats }, { data: svcs }, { data: profs }] = await Promise.all([
      (supabase as any).from("service_category").select("*").eq("company_id", companyId).order("sort_order"),
      (supabase as any).from("service").select("*").eq("company_id", companyId).order("featured", { ascending: false }),
      (supabase as any).from("professional").select("*").eq("company_id", companyId).order("name"),
    ]);
    setCategories(cats ?? []);
    setServices(svcs ?? []);
    setProfessionals(profs ?? []);
  }

  useEffect(() => { load(); }, [companyId]);

  function openSvc(svc?: Service) {
    if (svc) {
      setEditSvc(svc);
      setSvcForm({ name: svc.name, description: svc.description ?? "", duration_minutes: svc.duration_minutes, price: svc.price ? String(svc.price) : "", category_id: svc.category_id ?? "", featured: svc.featured, active: svc.active });
    } else {
      setEditSvc(null);
      setSvcForm({ name: "", description: "", duration_minutes: 60, price: "", category_id: "", featured: false, active: true });
    }
    setSvcOpen(true);
  }

  function openProf(p?: Professional) {
    if (p) {
      setEditProf(p);
      setProfForm({ name: p.name, specialty: p.specialty ?? "", commission_type: p.commission_type, commission_value: p.commission_value, active: p.active });
    } else {
      setEditProf(null);
      setProfForm({ name: "", specialty: "", commission_type: "percent", commission_value: 0, active: true });
    }
    setProfOpen(true);
  }

  async function saveSvc() {
    if (!svcForm.name.trim()) return toast.error("Nome obrigatório");
    setSaving(true);
    try {
      const row: any = { company_id: companyId, name: svcForm.name, description: svcForm.description || null, duration_minutes: svcForm.duration_minutes, price: svcForm.price ? parseFloat(svcForm.price) : null, category_id: svcForm.category_id || null, featured: svcForm.featured, active: svcForm.active };
      if (editSvc) await (supabase as any).from("service").update(row).eq("id", editSvc.id);
      else await (supabase as any).from("service").insert(row);
      toast.success(editSvc ? "Serviço atualizado" : "Serviço criado");
      setSvcOpen(false);
      load();
    } finally { setSaving(false); }
  }

  async function deleteSvc(id: string) {
    await (supabase as any).from("service").delete().eq("id", id);
    toast.success("Serviço removido");
    load();
  }

  async function saveProf() {
    if (!profForm.name.trim()) return toast.error("Nome obrigatório");
    setSaving(true);
    try {
      const row: any = { company_id: companyId, ...profForm };
      if (editProf) await (supabase as any).from("professional").update(row).eq("id", editProf.id);
      else await (supabase as any).from("professional").insert(row);
      toast.success(editProf ? "Profissional atualizado" : "Profissional criado");
      setProfOpen(false);
      load();
    } finally { setSaving(false); }
  }

  async function deleteProf(id: string) {
    await (supabase as any).from("professional").delete().eq("id", id);
    toast.success("Removido");
    load();
  }

  async function addCategory() {
    if (!catName.trim()) return;
    await (supabase as any).from("service_category").insert({ company_id: companyId, name: catName, sort_order: categories.length });
    setCatName("");
    setCatOpen(false);
    load();
  }

  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Serviços & Equipe</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Catálogo de serviços e profissionais para o agendamento online</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {(["services", "professionals"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {tab === "services" ? `Serviços (${services.length})` : `Profissionais (${professionals.length})`}
          </button>
        ))}
      </div>

      {activeTab === "services" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={() => openSvc()} size="sm"><Plus className="size-4 mr-1" />Novo Serviço</Button>
            <Button variant="outline" size="sm" onClick={() => setCatOpen(true)}><Plus className="size-4 mr-1" />Categoria</Button>
          </div>

          {services.length === 0 ? (
            <div className="panel p-12 text-center text-muted-foreground">
              <p className="font-medium">Nenhum serviço cadastrado</p>
              <p className="text-sm mt-1">Adicione os serviços que sua empresa oferece</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {DEFAULT_CATEGORIES_PT.map(c => (
                  <Badge key={c} variant="outline" className="cursor-pointer" onClick={async () => {
                    setSvcForm(f => ({ ...f, name: c }));
                    setSvcOpen(true);
                  }}>{c}</Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {services.map(svc => (
                <div key={svc.id} className="panel p-4 flex flex-col gap-2 group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {svc.featured && <Star className="size-3.5 text-yellow-500 shrink-0" fill="currentColor" />}
                        <span className="font-semibold text-[15px] truncate">{svc.name}</span>
                      </div>
                      {svc.category_id && <span className="text-[11px] text-muted-foreground">{catMap[svc.category_id]}</span>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => openSvc(svc)} className="size-7 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="size-3.5" /></button>
                      <button onClick={() => deleteSvc(svc.id)} className="size-7 grid place-items-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                    </div>
                  </div>
                  {svc.description && <p className="text-[13px] text-muted-foreground line-clamp-2">{svc.description}</p>}
                  <div className="flex items-center gap-3 mt-auto pt-2 border-t border-[color:var(--hairline)]">
                    <span className="flex items-center gap-1 text-[12px] text-muted-foreground"><Clock className="size-3" />{svc.duration_minutes}min</span>
                    {svc.price != null && <span className="text-[13px] font-bold text-[color:var(--brand-text)]">{fmtMoney(svc.price, currency)}</span>}
                    {!svc.active && <Badge variant="secondary" className="text-[10px]">Inativo</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "professionals" && (
        <div className="space-y-4">
          <Button onClick={() => openProf()} size="sm"><Plus className="size-4 mr-1" />Novo Profissional</Button>
          {professionals.length === 0 ? (
            <div className="panel p-12 text-center text-muted-foreground">
              <Users className="size-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhum profissional cadastrado</p>
              <p className="text-sm mt-1">Adicione membros da equipe para aparecerem na agenda</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {professionals.map(p => (
                <div key={p.id} className="panel p-4 flex items-center gap-3 group">
                  <div className="size-10 rounded-full bg-[color:var(--brand-soft)] grid place-items-center text-[15px] font-bold text-[color:var(--brand-text)] shrink-0">
                    {p.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[15px] truncate">{p.name}</div>
                    {p.specialty && <div className="text-[12px] text-muted-foreground truncate">{p.specialty}</div>}
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Comissão: {p.commission_type === "percent" ? `${p.commission_value}%` : fmtMoney(p.commission_value, currency)}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openProf(p)} className="size-7 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="size-3.5" /></button>
                    <button onClick={() => deleteProf(p.id)} className="size-7 grid place-items-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dialog Serviço */}
      <Dialog open={svcOpen} onOpenChange={setSvcOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editSvc ? "Editar Serviço" : "Novo Serviço"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={svcForm.name} onChange={e => setSvcForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Limpeza residencial" />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea value={svcForm.description} onChange={e => setSvcForm(f => ({ ...f, description: e.target.value }))} placeholder="O que inclui este serviço..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Duração (min)</Label>
                <Input type="number" value={svcForm.duration_minutes} onChange={e => setSvcForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 60 }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Preço ($)</Label>
                <Input type="number" step="0.01" value={svcForm.price} onChange={e => setSvcForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
              </div>
            </div>
            {categories.length > 0 && (
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <select value={svcForm.category_id} onChange={e => setSvcForm(f => ({ ...f, category_id: e.target.value }))} className="w-full h-9 rounded-lg border border-[color:var(--input)] bg-background px-3 text-sm">
                  <option value="">Sem categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={svcForm.featured} onChange={e => setSvcForm(f => ({ ...f, featured: e.target.checked }))} className="rounded" />
                Destaque
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={svcForm.active} onChange={e => setSvcForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />
                Ativo
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSvcOpen(false)}>Cancelar</Button>
            <Button onClick={saveSvc} disabled={saving}>{saving ? "Salvando…" : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Profissional */}
      <Dialog open={profOpen} onOpenChange={setProfOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editProf ? "Editar Profissional" : "Novo Profissional"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Nome *</Label><Input value={profForm.name} onChange={e => setProfForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Especialidade</Label><Input value={profForm.specialty} onChange={e => setProfForm(f => ({ ...f, specialty: e.target.value }))} placeholder="Ex: Telhado, Pintura..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo comissão</Label>
                <select value={profForm.commission_type} onChange={e => setProfForm(f => ({ ...f, commission_type: e.target.value as any }))} className="w-full h-9 rounded-lg border border-[color:var(--input)] bg-background px-3 text-sm">
                  <option value="percent">Porcentagem (%)</option>
                  <option value="fixed">Valor fixo ($)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Comissão</Label>
                <Input type="number" step="0.01" value={profForm.commission_value} onChange={e => setProfForm(f => ({ ...f, commission_value: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfOpen(false)}>Cancelar</Button>
            <Button onClick={saveProf} disabled={saving}>{saving ? "Salvando…" : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Categoria */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nova Categoria</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input value={catName} onChange={e => setCatName(e.target.value)} placeholder="Ex: Limpeza" onKeyDown={e => e.key === "Enter" && addCategory()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatOpen(false)}>Cancelar</Button>
            <Button onClick={addCategory}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
