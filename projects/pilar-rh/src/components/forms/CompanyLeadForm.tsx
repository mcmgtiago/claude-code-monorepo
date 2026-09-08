import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyLeadSchema, type CompanyLead } from "@/lib/validation";
import { submitCompanyLead } from "@/services/leads.service";
import { FormSuccess } from "./FormSuccess";
import { trackEvent } from "@/lib/analytics";
import { AlertCircle } from "lucide-react";

const states = [
  "SP", "RJ", "MG", "SC", "PR", "RS", "BA", "PE", "DF", "GO", "MT", "MS",
];

const companySizes = [
  "Até 50 colaboradores",
  "51 a 200",
  "201 a 500",
  "501 a 1.000",
  "1.001 a 3.000",
  "Mais de 3.000",
];

const services = [
  "Recrutamento e seleção",
  "Trabalho temporário",
  "Terceirização de mão de obra",
  "Administração de pessoal",
  "Treinamento e desenvolvimento",
  "Consultoria de gestão humana",
];

const urgencies = [
  "Imediato",
  "Em até 15 dias",
  "Em até 30 dias",
  "Nos próximos 3 meses",
  "Ainda estamos avaliando",
];

export function CompanyLeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<CompanyLead>({
    resolver: zodResolver(companyLeadSchema),
  });

  const onSubmit = async (data: CompanyLead) => {
    setSubmitting(true);
    setError("");
    trackEvent("company_form_submitted", { service: data.service });

    const result = await submitCompanyLead(data);
    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.message);
    }
  };

  if (submitted) {
    return (
      <FormSuccess
        title="Proposta recebida com sucesso"
        message="Nossa equipe vai analisar o contexto enviado e entrar em contato para compreender os próximos passos."
        nextAction={{ label: "Explorar nossos serviços", href: "#servicos" }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Nome</label>
          <input
            type="text"
            placeholder="Seu nome completo"
            {...register("name")}
            className="w-full px-4 py-3 rounded-lg border border-line bg-paper text-ink placeholder:text-muted text-sm focus:outline-none focus:border-wine"
          />
          {errors.name && <span className="text-xs text-error mt-1">{errors.name.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">E-mail</label>
          <input
            type="email"
            placeholder="seu@email.com"
            {...register("email")}
            className="w-full px-4 py-3 rounded-lg border border-line bg-paper text-ink placeholder:text-muted text-sm focus:outline-none focus:border-wine"
          />
          {errors.email && <span className="text-xs text-error mt-1">{errors.email.message}</span>}
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Telefone</label>
          <input
            type="tel"
            placeholder="(11) 9999-9999"
            {...register("phone")}
            className="w-full px-4 py-3 rounded-lg border border-line bg-paper text-ink placeholder:text-muted text-sm focus:outline-none focus:border-wine"
          />
          {errors.phone && <span className="text-xs text-error mt-1">{errors.phone.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Empresa</label>
          <input
            type="text"
            placeholder="Nome da empresa"
            {...register("company")}
            className="w-full px-4 py-3 rounded-lg border border-line bg-paper text-ink placeholder:text-muted text-sm focus:outline-none focus:border-wine"
          />
          {errors.company && <span className="text-xs text-error mt-1">{errors.company.message}</span>}
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Cidade</label>
          <input
            type="text"
            placeholder="Ex: São Paulo"
            {...register("city")}
            className="w-full px-4 py-3 rounded-lg border border-line bg-paper text-ink placeholder:text-muted text-sm focus:outline-none focus:border-wine"
          />
          {errors.city && <span className="text-xs text-error mt-1">{errors.city.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Estado</label>
          <select
            {...register("state")}
            className="w-full px-4 py-3 rounded-lg border border-line bg-paper text-ink text-sm focus:outline-none focus:border-wine">
            <option value="">Selecione um estado</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <span className="text-xs text-error mt-1">{errors.state.message}</span>}
        </div>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Tamanho da empresa</label>
          <select
            {...register("companySize")}
            className="w-full px-4 py-3 rounded-lg border border-line bg-paper text-ink text-sm focus:outline-none focus:border-wine">
            <option value="">Selecione</option>
            {companySizes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.companySize && <span className="text-xs text-error mt-1">{errors.companySize.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Serviço de interesse</label>
          <select
            {...register("service")}
            className="w-full px-4 py-3 rounded-lg border border-line bg-paper text-ink text-sm focus:outline-none focus:border-wine">
            <option value="">Selecione</option>
            {services.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.service && <span className="text-xs text-error mt-1">{errors.service.message}</span>}
        </div>
      </div>

      {/* Row 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Prazo</label>
          <select
            {...register("urgency")}
            className="w-full px-4 py-3 rounded-lg border border-line bg-paper text-ink text-sm focus:outline-none focus:border-wine">
            <option value="">Selecione</option>
            {urgencies.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          {errors.urgency && <span className="text-xs text-error mt-1">{errors.urgency.message}</span>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Me conte mais sobre sua necessidade</label>
        <textarea
          placeholder="Descreva brevemente o que sua empresa precisa..."
          {...register("description")}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-line bg-paper text-ink placeholder:text-muted text-sm focus:outline-none focus:border-wine resize-none"
        />
        {errors.description && <span className="text-xs text-error mt-1">{errors.description.message}</span>}
      </div>

      {/* Consent */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          {...register("consent")}
          className="w-4 h-4 mt-1 rounded border-line text-wine focus:ring-wine cursor-pointer"
        />
        <label className="text-xs text-ink-soft leading-relaxed">
          Autorizo o uso dos meus dados para contato e análise de propostas, de acordo com a política de privacidade.
        </label>
      </div>
      {errors.consent && <span className="text-xs text-error mt-1 block">{errors.consent.message}</span>}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        onClick={() => trackEvent("company_form_started")}
        className="w-full px-6 py-3 rounded-full bg-wine text-white font-semibold hover:bg-wine-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {submitting ? "Enviando..." : "Solicitar proposta"}
      </button>
    </form>
  );
}
