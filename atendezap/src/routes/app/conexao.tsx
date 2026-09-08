import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2, RefreshCw, Power, MessageSquare, CheckCircle2, AlertCircle,
  Instagram, Facebook, Smartphone, ArrowUpRight,
} from "lucide-react";
import { brand, supportWhatsapp } from "@/config/brand";
import { connectWhatsapp, checkWhatsappStatus, disconnectWhatsapp } from "@/lib/meta-whatsapp.functions";

export const Route = createFileRoute("/app/conexao")({
  head: () => ({ meta: [{ title: `${brand.name} — Canais` }] }),
  component: ConexaoPage,
});

const CONTACT = (canal: string) =>
  `https://wa.me/${supportWhatsapp}?text=${encodeURIComponent(`Olá! Quero ativar o canal ${canal} no meu VeloHUB.`)}`;

function ConexaoPage() {
  const connect = useServerFn(connectWhatsapp);
  const check = useServerFn(checkWhatsappStatus);
  const disconnect = useServerFn(disconnectWhatsapp);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("disconnected");
  const [numero, setNumero] = useState<string | null>(null);

  useEffect(() => { void doCheck(true); }, []);

  async function doCheck(silent = false) {
    try {
      const r: any = await check();
      setStatus(r.status);
      setNumero(r.numero ?? null);
      if (r.status === "connected" && !silent) toast.success("WhatsApp conectado!");
    } catch (e: any) {
      if (!silent) toast.error(e?.message || "Erro ao consultar status");
    }
  }

  async function doConnect() {
    setLoading(true);
    try {
      const r: any = await connect();
      setStatus(r.state === "open" ? "connected" : "disconnected");
      setNumero(r.numero ?? null);
      if (r.state === "open") toast.success(`WhatsApp conectado: ${r.numero}`);
      else toast.message("Ainda não conectado", { description: "Fale com a Velo para concluir a ativação do número." });
    } catch (e: any) {
      toast.error(e?.message || "Falha ao verificar conexão");
    } finally {
      setLoading(false);
    }
  }

  async function doDisconnect() {
    setLoading(true);
    try {
      await disconnect();
      setStatus("disconnected");
      setNumero(null);
      toast.success("Desconectado");
    } catch (e: any) {
      toast.error(e?.message || "Falha ao desconectar");
    } finally {
      setLoading(false);
    }
  }

  const waConnected = status === "connected";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Canais de atendimento</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Conecte os canais onde seus clientes te chamam. Toda mensagem cai numa caixa só, e a IA responde por você.
        </p>
      </div>

      {/* Resumo */}
      <Card className="p-4 flex items-center gap-3">
        {waConnected ? (
          <>
            <CheckCircle2 className="size-5 text-green-500 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">1 canal ativo.</span>{" "}
              <span className="text-muted-foreground">As mensagens já são respondidas automaticamente pela IA.</span>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="size-5 text-amber-500 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Nenhum canal ativo ainda.</span>{" "}
              <span className="text-muted-foreground">Ative pelo menos um canal para a IA começar a atender.</span>
            </div>
          </>
        )}
      </Card>

      {/* Grade de canais */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Instagram */}
        <ChannelCard
          icon={<Instagram className="size-5" />}
          gradient="linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)"
          name="Instagram DMs"
          desc="Responda os DMs do Instagram automaticamente. O canal nº 1 de leads de serviço nos EUA."
          status="primary"
          action={
            <Button asChild size="sm" variant="outline">
              <a href={CONTACT("Instagram")} target="_blank" rel="noopener noreferrer">
                Ativar com a Velo <ArrowUpRight className="size-3.5 ml-1" />
              </a>
            </Button>
          }
        />

        {/* Facebook */}
        <ChannelCard
          icon={<Facebook className="size-5" />}
          gradient="linear-gradient(135deg,#0866ff,#0a3d91)"
          name="Facebook Messenger"
          desc="Atenda mensagens da sua página do Facebook no mesmo lugar."
          status="primary"
          action={
            <Button asChild size="sm" variant="outline">
              <a href={CONTACT("Facebook Messenger")} target="_blank" rel="noopener noreferrer">
                Ativar com a Velo <ArrowUpRight className="size-3.5 ml-1" />
              </a>
            </Button>
          }
        />

        {/* WhatsApp — funcional */}
        <ChannelCard
          icon={<MessageSquare className="size-5" />}
          gradient="linear-gradient(135deg,#25d366,#128c7e)"
          name="WhatsApp"
          desc={numero ? `Número conectado: ${numero}` : "WhatsApp Business API oficial (Meta)."}
          status={waConnected ? "connected" : "available"}
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => doCheck(false)} disabled={loading}>
                <RefreshCw className="size-3.5" />
              </Button>
              {waConnected ? (
                <Button variant="destructive" size="sm" onClick={doDisconnect} disabled={loading}>
                  <Power className="size-3.5 mr-1.5" /> Desconectar
                </Button>
              ) : (
                <Button size="sm" onClick={doConnect} disabled={loading}>
                  {loading ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <MessageSquare className="size-3.5 mr-1.5" />}
                  Verificar
                </Button>
              )}
            </div>
          }
        />

        {/* SMS */}
        <ChannelCard
          icon={<Smartphone className="size-5" />}
          gradient="linear-gradient(135deg,#64748b,#334155)"
          name="SMS"
          desc="Mensagens de texto para clientes que preferem SMS."
          status="soon"
          action={<Badge variant="outline" className="text-muted-foreground">Em breve</Badge>}
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        A Velo configura cada canal pra você. Fale com a gente e a gente liga tudo.
      </p>
    </div>
  );
}

function ChannelCard({ icon, gradient, name, desc, status, action }: {
  icon: React.ReactNode; gradient: string; name: string; desc: string;
  status: "connected" | "available" | "primary" | "soon"; action: React.ReactNode;
}) {
  const badge =
    status === "connected" ? <Badge className="bg-green-600 text-white">Conectado</Badge>
    : status === "primary" ? <Badge className="bg-[color:var(--brand)] text-[#04140b]">Recomendado</Badge>
    : status === "soon" ? <Badge variant="outline" className="text-muted-foreground">Em breve</Badge>
    : <Badge variant="outline" className="text-muted-foreground">Disponível</Badge>;

  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="size-11 rounded-xl grid place-items-center text-white shrink-0" style={{ background: gradient }}>
          {icon}
        </div>
        {badge}
      </div>
      <div className="flex-1">
        <div className="font-semibold">{name}</div>
        <p className="text-[13px] text-muted-foreground mt-1 leading-snug">{desc}</p>
      </div>
      <div className="pt-1">{action}</div>
    </Card>
  );
}
