import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { resolveLoginEmail } from "@/lib/auth.functions";
import { toast } from "sonner";
import { Loader2, Zap, AtSign, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/entrar")({
  head: () => ({ meta: [{ title: `${brand.name} — Entrar` }] }),
  component: EntrarPage,
});

function EntrarPage() {
  const navigate = useNavigate();
  const resolveEmail = useServerFn(resolveLoginEmail);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // Já logado? manda direto pro destino certo (sem rede além do localStorage).
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) void routeAfterAuth();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function routeAfterAuth() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    if (roles?.some((r) => r.role === "super_admin")) {
      navigate({ to: "/master/painel", replace: true });
      return;
    }
    const { data: cu } = await supabase
      .from("company_user")
      .select("company_id")
      .eq("user_id", u.user.id)
      .eq("ativo", true)
      .maybeSingle();
    navigate({ href: cu ? "/app/dashboard" : "/app/dashboard", replace: true });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = identifier.trim();
    if (!id) return toast.error("Digite seu e-mail ou usuário");
    if (!password) return toast.error("Digite sua senha");
    setLoading(true);

    // Aceita e-mail OU nome de usuário — resolve para o e-mail real da conta.
    let email = id;
    if (!id.includes("@")) {
      try {
        const r = await resolveEmail({ data: { identifier: id } });
        if (!r.email) {
          setLoading(false);
          return toast.error("Usuário não encontrado.");
        }
        email = r.email;
      } catch {
        setLoading(false);
        return toast.error("Não foi possível validar o login. Tente novamente.");
      }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error("Login ou senha incorretos.");
    toast.success("Bem-vindo de volta!");
    void routeAfterAuth();
  }

  return (
    <div className="min-h-screen w-full grid place-items-center bg-background text-foreground px-5 py-10">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-9">
          {/* TODO: trocar pelo logotipo do projeto quando estiver pronto */}
          <div className="size-14 rounded-2xl grid place-items-center text-[#04140b] shadow-[0_8px_24px_-10px_rgba(14,250,113,.5)]" style={{ background: "linear-gradient(135deg, #0efa71, #00b858)" }}>
            <Zap className="size-7" strokeWidth={2.4} />
          </div>
          <div className="font-display font-extrabold text-xl tracking-tight">{brand.name}</div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[color:var(--hairline)] bg-[color:var(--panel)] p-7 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-[22px] font-bold tracking-tight">Entrar</h1>
            <p className="text-[13.5px] text-muted-foreground mt-1">Acesse o painel da sua empresa</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              icon={<AtSign className="size-[18px]" />}
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              autoFocus
              placeholder="E-mail ou usuário"
              value={identifier}
              onChange={(v) => setIdentifier(v)}
            />

            <div>
              <Field
                icon={<Lock className="size-[18px]" />}
                type={showPwd ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(v) => setPassword(v)}
                rightSlot={
                  <button type="button" onClick={() => setShowPwd((s) => !s)} className="text-muted-foreground hover:text-foreground" tabIndex={-1} aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}>
                    {showPwd ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                  </button>
                }
              />
              <div className="flex justify-end mt-2">
                <Link to="/esqueci-senha" className="text-[12.5px] font-medium text-muted-foreground hover:text-[color:var(--brand-text)] transition-colors">
                  Esqueci minha senha
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold text-[15px] text-[#04140b] inline-flex items-center justify-center gap-2 transition disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #0efa71, #00b858)" }}
            >
              {loading ? <Loader2 className="size-[18px] animate-spin" /> : <>Entrar <ArrowRight className="size-[18px]" /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-[12.5px] text-muted-foreground mt-6">
          Ainda não tem acesso?{" "}
          <a href="https://wa.me/5551998198713" className="font-medium text-foreground hover:underline">Fale com a {brand.name}</a>
        </p>
      </div>
    </div>
  );
}

function Field({ icon, rightSlot, type, value, onChange, ...rest }: {
  icon: React.ReactNode;
  rightSlot?: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  autoCapitalize?: string;
  autoCorrect?: string;
}) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3.5 text-muted-foreground pointer-events-none">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 rounded-xl border border-[color:var(--hairline)] bg-[color:var(--panel-2)] pl-11 pr-11 text-[14.5px] outline-none transition-colors focus:border-[color:var(--brand)]/60 placeholder:text-muted-foreground/70"
        {...rest}
      />
      {rightSlot && <span className="absolute right-3.5">{rightSlot}</span>}
    </div>
  );
}
