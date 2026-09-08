import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { candidateSchema, type Candidate } from "@/lib/validation";
import { submitCandidate } from "@/services/candidates.service";
import { FormSuccess } from "./FormSuccess";
import { trackEvent } from "@/lib/analytics";
import { AlertCircle, Upload, X, FileText } from "lucide-react";
import { ROUTES } from "@/lib/routes";

const states = [
  "SP", "RJ", "MG", "SC", "PR", "RS", "BA", "PE", "DF", "GO", "MT", "MS",
];

const areas = [
  "Logística",
  "Recursos Humanos",
  "Indústria",
  "Atendimento",
  "Comercial",
  "Administrativo",
  "Tecnologia",
  "Saúde",
  "Serviços",
];

const experienceLevels = [
  "Estágio",
  "Auxiliar",
  "Assistente",
  "Operacional",
  "Pleno",
  "Sênior",
  "Liderança",
];

const ACCEPTED_TYPES = [".pdf", ".doc", ".docx"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function CandidateForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<Candidate>({
    resolver: zodResolver(candidateSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError("");

    if (!file) return;

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setFileError("Formato não aceito. Envie PDF, DOC ou DOCX.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("Arquivo muito grande. O limite é 5 MB.");
      return;
    }

    setResume(file);
    trackEvent("resume_uploaded");
  };

  const removeFile = () => {
    setResume(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: Candidate) => {
    setSubmitting(true);
    setError("");

    const result = await submitCandidate(data, resume || undefined);
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
        title="Cadastro realizado com sucesso"
        message="Se houver uma oportunidade compatível, nossa equipe poderá entrar em contato pelos dados informados."
        nextAction={{ label: "Ver vagas abertas", href: ROUTES.jobs }}
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
          <label className="block text-sm font-medium text-ink mb-1">Cidade</label>
          <input
            type="text"
            placeholder="Ex: São Paulo"
            {...register("city")}
            className="w-full px-4 py-3 rounded-lg border border-line bg-paper text-ink placeholder:text-muted text-sm focus:outline-none focus:border-wine"
          />
          {errors.city && <span className="text-xs text-error mt-1">{errors.city.message}</span>}
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Estado</label>
          <select
            {...register("state")}
            className="w-full px-4 py-3 rounded-lg border border-line bg-paper text-ink text-sm focus:outline-none focus:border-wine">
            <option value="">Selecione</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <span className="text-xs text-error mt-1">{errors.state.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Área de interesse</label>
          <select
            {...register("area")}
            className="w-full px-4 py-3 rounded-lg border border-line bg-paper text-ink text-sm focus:outline-none focus:border-wine">
            <option value="">Selecione</option>
            {areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          {errors.area && <span className="text-xs text-error mt-1">{errors.area.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Nível</label>
          <select
            {...register("experienceLevel")}
            className="w-full px-4 py-3 rounded-lg border border-line bg-paper text-ink text-sm focus:outline-none focus:border-wine">
            <option value="">Selecione</option>
            {experienceLevels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          {errors.experienceLevel && <span className="text-xs text-error mt-1">{errors.experienceLevel.message}</span>}
        </div>
      </div>

      {/* LinkedIn */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1">LinkedIn (opcional)</label>
        <input
          type="url"
          placeholder="https://linkedin.com/in/..."
          {...register("linkedin")}
          className="w-full px-4 py-3 rounded-lg border border-line bg-paper text-ink placeholder:text-muted text-sm focus:outline-none focus:border-wine"
        />
        {errors.linkedin && <span className="text-xs text-error mt-1">{errors.linkedin.message}</span>}
      </div>

      {/* Resume Upload */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Currículo (opcional)</label>
        {resume ? (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-line bg-paper-muted">
            <FileText className="w-5 h-5 text-wine" />
            <span className="text-sm text-ink truncate flex-1">{resume.name}</span>
            <button type="button" onClick={removeFile} className="text-ink-soft hover:text-error transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-line rounded-lg p-6 text-center cursor-pointer hover:border-wine/40 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-6 h-6 text-muted mx-auto mb-2" />
            <p className="text-sm text-ink-soft">
              Clique para enviar ou arraste seu arquivo
            </p>
            <p className="text-xs text-muted mt-1">PDF, DOC ou DOCX (máx. 5 MB)</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload de currículo"
        />
        {fileError && <span className="text-xs text-error mt-1">{fileError}</span>}
      </div>

      {/* Consent */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          {...register("consent")}
          className="w-4 h-4 mt-1 rounded border-line text-wine focus:ring-wine cursor-pointer"
        />
        <label className="text-xs text-ink-soft leading-relaxed">
          Autorizo o uso dos meus dados para processos seletivos, de acordo com a política de privacidade.
        </label>
      </div>
      {errors.consent && <span className="text-xs text-error mt-1 block">{errors.consent.message}</span>}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full px-6 py-3 rounded-full bg-wine text-white font-semibold hover:bg-wine-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {submitting ? "Enviando..." : "Cadastrar currículo"}
      </button>
    </form>
  );
}
