import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSchema, type Newsletter } from "@/lib/validation";
import { subscribeNewsletter } from "@/services/newsletter.service";
import { trackEvent } from "@/lib/analytics";
import { Send, CheckCircle } from "lucide-react";

export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Newsletter>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: Newsletter) => {
    setSubmitting(true);
    trackEvent("newsletter_submitted");
    const result = await subscribeNewsletter(data.email);
    setSubmitting(false);
    if (result.success) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-success text-sm">
        <CheckCircle className="w-4 h-4" />
        E-mail cadastrado com sucesso.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Seu e-mail"
          {...register("email")}
          className="flex-1 px-4 py-2.5 rounded-lg border border-line bg-paper text-ink placeholder:text-muted text-sm focus:outline-none focus:border-wine"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2.5 rounded-lg bg-wine text-white font-medium text-sm hover:bg-wine-deep transition-colors disabled:opacity-50">
          <Send className="w-4 h-4" />
        </button>
      </div>
      {errors.email && <span className="text-xs text-error">{errors.email.message}</span>}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          {...register("consent")}
          className="w-3.5 h-3.5 mt-0.5 rounded border-line text-wine focus:ring-wine cursor-pointer"
        />
        <span className="text-xs text-ink-soft">
          Autorizo o envio de conteúdos informativos.
        </span>
      </div>
      {errors.consent && <span className="text-xs text-error">{errors.consent.message}</span>}
    </form>
  );
}
