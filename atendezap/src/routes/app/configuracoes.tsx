import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save, Bell, BellOff, Smartphone, Download } from "lucide-react";
import { CURRENCIES } from "@/config/money";
import { subscribePush, unsubscribePush, isSubscribed } from "@/lib/push";
import { sendTestNotification } from "@/lib/push.functions";
import { useServerFn } from "@tanstack/react-start";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/app/configuracoes")({
  head: () => ({ meta: [{ title: `${brand.name} — Configurações` }] }),
  beforeLoad: ({ context }: any) => {
    const r = context?.membership?.role;
    if (r === "atendente") throw redirect({ to: "/app/dashboard" });
  },
  component: ConfigPage,
});


function ConfigPage() {
  const ctx = Route.useRouteContext();
  const companyId = ctx.company?.id;
  const userId = ctx.user.id;

  const [empresa, setEmpresa] = useState({ nome: "", telefone: "", currency: "USD" });
  const [identidade, setIdentidade] = useState({ primary_color: "#22C55E", logo_url: "" });
  const [perfil, setPerfil] = useState({ nome: "", email: ctx.user.email ?? "" });
  const [senha, setSenha] = useState({ nova: "", confirma: "" });
  const [savingE, setSavingE] = useState(false);
  const [savingI, setSavingI] = useState(false);
  const [savingP, setSavingP] = useState(false);
  const [savingS, setSavingS] = useState(false);

  useEffect(() => {
    if (ctx.company) {
      setEmpresa({ nome: ctx.company.nome, telefone: ctx.company.telefone ?? "", currency: (ctx.company as any).currency ?? "USD" });
      setIdentidade({ primary_color: ctx.company.primary_color, logo_url: ctx.company.logo_url ?? "" });
    }
    void (async () => {
      const { data } = await supabase.from("profiles").select("nome").eq("user_id", userId).maybeSingle();
      if (data) setPerfil((p) => ({ ...p, nome: data.nome ?? "" }));
    })();
  }, [companyId, userId]);

  async function saveEmpresa() {
    if (!companyId) return;
    setSavingE(true);
    const { error } = await supabase.from("company").update({ nome: empresa.nome, telefone: empresa.telefone || null }).eq("id", companyId);
    // Moeda: coluna pode não existir ainda (precisa do SQL) — salva à parte e ignora erro
    await (supabase as any).from("company").update({ currency: empresa.currency }).eq("id", companyId);
    setSavingE(false);
    if (error) return toast.error(error.message);
    toast.success("Empresa atualizada"); setTimeout(() => location.reload(), 500);
  }

  async function saveIdentidade() {
    if (!companyId) return;
    setSavingI(true);
    const { error } = await supabase.from("company").update({
      primary_color: identidade.primary_color, logo_url: identidade.logo_url || null,
    }).eq("id", companyId);
    setSavingI(false);
    if (error) return toast.error(error.message);
    toast.success("Identidade atualizada"); setTimeout(() => location.reload(), 500);
  }

  async function savePerfil() {
    setSavingP(true);
    const { error } = await supabase.from("profiles").update({ nome: perfil.nome || null }).eq("user_id", userId);
    setSavingP(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado");
  }

  async function saveSenha() {
    if (senha.nova.length < 8) return toast.error("Mínimo 8 caracteres");
    if (senha.nova !== senha.confirma) return toast.error("Senhas não conferem");
    setSavingS(true);
    const { error } = await supabase.auth.updateUser({ password: senha.nova });
    setSavingS(false);
    if (error) return toast.error(error.message);
    setSenha({ nova: "", confirma: "" });
    toast.success("Senha alterada");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Empresa, identidade e perfil.</p>
      </div>
      <Tabs defaultValue="empresa">
        <TabsList>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="identidade">Identidade</TabsTrigger>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa">
          <Card className="p-5 space-y-4 max-w-xl">
            <div><Label>Nome da empresa</Label><Input value={empresa.nome} onChange={(e) => setEmpresa({ ...empresa, nome: e.target.value })} /></div>
            <div><Label>Telefone</Label><Input value={empresa.telefone} onChange={(e) => setEmpresa({ ...empresa, telefone: e.target.value })} /></div>
            <div>
              <Label>Moeda</Label>
              <select
                value={empresa.currency}
                onChange={(e) => setEmpresa({ ...empresa, currency: e.target.value })}
                className="w-full h-9 rounded-lg border border-[color:var(--input)] bg-background px-3 text-sm"
              >
                {Object.values(CURRENCIES).map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
              <p className="text-[11px] text-muted-foreground mt-1">Usada em orçamentos, agenda, mídia e relatórios.</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={saveEmpresa} disabled={savingE}>
                {savingE ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />} Salvar
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="identidade">
          <Card className="p-5 space-y-4 max-w-xl">
            <div>
              <Label>Cor primária</Label>
              <div className="flex gap-2 items-center">
                <input type="color" value={identidade.primary_color} onChange={(e) => setIdentidade({ ...identidade, primary_color: e.target.value })} className="h-10 w-14 rounded border" />
                <Input value={identidade.primary_color} onChange={(e) => setIdentidade({ ...identidade, primary_color: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>URL do logo</Label>
              <Input value={identidade.logo_url} onChange={(e) => setIdentidade({ ...identidade, logo_url: e.target.value })} placeholder="https://…" />
              {identidade.logo_url && <img src={identidade.logo_url} alt="logo" className="mt-2 size-16 rounded object-cover border" />}
            </div>
            <div className="flex justify-end">
              <Button onClick={saveIdentidade} disabled={savingI}>
                {savingI ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />} Salvar
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="perfil">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-5 space-y-4">
              <h2 className="font-semibold">Meus dados</h2>
              <div><Label>Email</Label><Input value={perfil.email} disabled /></div>
              <div><Label>Nome</Label><Input value={perfil.nome} onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })} /></div>
              <div className="flex justify-end">
                <Button onClick={savePerfil} disabled={savingP}>
                  {savingP ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />} Salvar
                </Button>
              </div>
            </Card>
            <Card className="p-5 space-y-4">
              <h2 className="font-semibold">Trocar senha</h2>
              <div><Label>Nova senha</Label><Input type="password" value={senha.nova} onChange={(e) => setSenha({ ...senha, nova: e.target.value })} /></div>
              <div><Label>Confirmar</Label><Input type="password" value={senha.confirma} onChange={(e) => setSenha({ ...senha, confirma: e.target.value })} /></div>
              <div className="flex justify-end">
                <Button onClick={saveSenha} disabled={savingS}>
                  {savingS ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />} Trocar
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notificacoes">
          <PushNotifCard companyId={companyId ?? ""} userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PushNotifCard({ companyId, userId }: { companyId: string; userId: string }) {
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const sendTestFn = useServerFn(sendTestNotification);
  const unsupported = typeof window !== "undefined" && (!("serviceWorker" in navigator) || !("PushManager" in window));

  async function sendTest() {
    setTesting(true);
    try {
      const r: any = await sendTestFn();
      if (r.sent > 0) toast.success(`Notificação enviada para ${r.sent} dispositivo(s)!`);
      else toast.message("Nenhum dispositivo recebeu", { description: "Ative as notificações neste aparelho e tente de novo." });
    } catch (e: any) {
      toast.error(e?.message || "Falha ao enviar teste");
    } finally { setTesting(false); }
  }

  useEffect(() => {
    isSubscribed().then(setSubscribed);
    if (companyId) {
      (supabase as any).from("push_subscriptions")
        .select("id, device_label, created_at, last_used_at")
        .eq("company_id", companyId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .then(({ data }: any) => setDevices(data ?? []));
    }
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [companyId, userId]);

  async function enable() {
    setLoading(true);
    const ok = await subscribePush(companyId, userId);
    if (ok) { setSubscribed(true); toast.success("Notificações ativadas neste dispositivo!"); }
    else toast.error("Não foi possível ativar. Verifique as permissões do navegador.");
    setLoading(false);
    (supabase as any).from("push_subscriptions").select("id, device_label, created_at, last_used_at").eq("company_id", companyId).eq("user_id", userId).order("created_at", { ascending: false }).then(({ data }: any) => setDevices(data ?? []));
  }

  async function disable() {
    setLoading(true);
    await unsubscribePush();
    setSubscribed(false);
    toast.success("Notificações desativadas");
    setLoading(false);
    setDevices(d => d.filter(() => false));
  }

  async function removeDevice(id: string) {
    await (supabase as any).from("push_subscriptions").delete().eq("id", id);
    setDevices(d => d.filter((x: any) => x.id !== id));
  }

  async function installPwa() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return (
    <div className="space-y-4 max-w-xl">
      {deferredPrompt && (
        <Card className="p-5 space-y-3 border-[color:var(--brand)] bg-[color:var(--brand-soft)]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[color:var(--brand)] grid place-items-center text-[#050f07]">
              <Download className="size-5" />
            </div>
            <div>
              <div className="font-semibold">Instalar o VeloHUB</div>
              <div className="text-sm text-muted-foreground">Adicione ao celular para acesso rápido</div>
            </div>
          </div>
          <Button onClick={installPwa} className="w-full">
            <Download className="size-4 mr-2" /> Instalar app
          </Button>
        </Card>
      )}

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[color:var(--brand-soft)] grid place-items-center text-[color:var(--brand-text)]">
            <Bell className="size-5" />
          </div>
          <div>
            <div className="font-semibold">Notificações Push</div>
            <div className="text-sm text-muted-foreground">Receba alertas de novos leads e mensagens</div>
          </div>
        </div>

        {unsupported ? (
          <div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
            Seu navegador não suporta notificações push. Use Chrome, Edge ou Safari para ativar.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              {subscribed
                ? <Bell className="size-4 text-green-500" />
                : <BellOff className="size-4 text-muted-foreground" />}
              <span className="text-sm flex-1">
                {subscribed === null ? "Verificando…" : subscribed ? "Ativo neste dispositivo" : "Inativo"}
              </span>
              {subscribed
                ? <Button size="sm" variant="outline" onClick={disable} disabled={loading}>{loading ? <Loader2 className="size-3 animate-spin" /> : "Desativar"}</Button>
                : <Button size="sm" onClick={enable} disabled={loading}>{loading ? <Loader2 className="size-3 animate-spin" /> : "Ativar"}</Button>}
            </div>

            {subscribed && (
              <Button size="sm" variant="outline" className="w-full" onClick={sendTest} disabled={testing}>
                {testing ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Bell className="size-4 mr-1.5" />}
                Enviar notificação de teste
              </Button>
            )}

            <div className="text-xs text-muted-foreground rounded-lg bg-muted/30 p-3 leading-relaxed">
              <b>Como funciona:</b> Ao ativar, este dispositivo recebe uma notificação a cada novo lead ou agendamento. Você pode ativar em vários dispositivos. No iPhone, instale o app na tela inicial primeiro.
            </div>
          </>
        )}
      </Card>

      {devices.length > 0 && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="size-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Dispositivos com notificações ativas</span>
          </div>
          <div className="space-y-2">
            {devices.map((d: any) => (
              <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{d.device_label || "Dispositivo"}</div>
                  <div className="text-xs text-muted-foreground">
                    Cadastrado {new Date(d.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <button onClick={() => removeDevice(d.id)} className="size-7 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0">
                  <BellOff className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

