import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Download, Mail, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BRAND } from "../../data/content";
import { FadeUp } from "../ui/FadeUp";
import { GradientButton } from "../ui/GradientButton";

const leadSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().email("Informe um e-mail válido."),
  company: z.string().min(2, "Informe a empresa."),
  size: z.string().min(1, "Selecione o porte."),
  challenge: z.string().min(10, "Conte em poucas palavras o desafio."),
});

type LeadForm = z.infer<typeof leadSchema>;

export function FinalCTA() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeadForm>({ resolver: zodResolver(leadSchema) });

  function onSubmit(data: LeadForm) {
    console.info("Lead capturado", data);
    setSent(true);
    reset();
  }

  return (
    <section id="contato" className="section-pad bg-white">
      <div className="container-content">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--color-ink)] p-6 text-white shadow-deep md:p-10 lg:p-14">
          <div className="absolute inset-0" aria-hidden>
            <div className="absolute -left-24 -top-20 size-80 rounded-full bg-[var(--color-brand-blue)]/45 blur-3xl" />
            <div className="absolute -right-20 bottom-0 size-96 rounded-full bg-[var(--color-brand-coral)]/30 blur-3xl" />
            <div className="absolute inset-0 noise opacity-10" />
          </div>

          <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <FadeUp>
              <div>
                <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-sm">
                  Diagnóstico gratuito
                </p>
                <h2 className="mt-6 text-[clamp(2.5rem,6vw,5.8rem)] font-bold tracking-[-0.05em]">
                  Pronto para transformar sua gente?
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
                  Comece agora com um diagnóstico gratuito. Sem compromisso, sem
                  proposta agressiva. Apenas um papo honesto sobre como podemos
                  ajudar.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <a
                    href={`mailto:${BRAND.email}`}
                    className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition-colors hover:bg-white/15"
                  >
                    <Mail className="size-5 text-white" />
                    <span className="text-sm font-semibold">{BRAND.email}</span>
                  </a>
                  <a
                    href="#blog"
                    className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition-colors hover:bg-white/15"
                  >
                    <Download className="size-5 text-white" />
                    <span className="text-sm font-semibold">Baixar e-book gratuito</span>
                  </a>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="rounded-[32px] border border-white/10 bg-white p-5 text-[var(--color-ink)] shadow-soft md:p-7"
                noValidate
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-full bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)]">
                    <ShieldCheck className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">
                      Agendar conversa estratégica
                    </h3>
                    <p className="text-sm text-[var(--color-ink-soft)]">
                      Retornamos em até 1 dia útil.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Nome" error={errors.name?.message}>
                    <input {...register("name")} placeholder="Seu nome" className="input" />
                  </Field>
                  <Field label="E-mail" error={errors.email?.message}>
                    <input {...register("email")} type="email" placeholder="voce@empresa.com" className="input" />
                  </Field>
                  <Field label="Empresa" error={errors.company?.message}>
                    <input {...register("company")} placeholder="Nome da empresa" className="input" />
                  </Field>
                  <Field label="Porte" error={errors.size?.message}>
                    <select {...register("size")} className="input">
                      <option value="">Selecione</option>
                      <option value="20-50">20–50 pessoas</option>
                      <option value="51-200">51–200 pessoas</option>
                      <option value="201-1000">201–1.000 pessoas</option>
                      <option value="1000+">1.000+ pessoas</option>
                    </select>
                  </Field>
                </div>

                <Field label="Principal desafio" error={errors.challenge?.message} className="mt-4">
                  <textarea
                    {...register("challenge")}
                    placeholder="Ex.: rotatividade alta, liderança fraca, cultura desalinhada..."
                    className="input min-h-28 resize-none rounded-[20px] py-3"
                  />
                </Field>

                {sent && (
                  <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    Solicitação recebida! Nossa equipe entrará em contato em breve.
                  </p>
                )}

                <GradientButton type="submit" size="lg" fullWidth className="mt-6" icon={<ArrowRight className="size-3.5" />} disabled={isSubmitting}>
                  Agendar Conversa Estratégica
                </GradientButton>
              </form>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}