type EventName =
  | "hero_company_cta_clicked"
  | "hero_candidate_cta_clicked"
  | "service_opened"
  | "company_path_selected"
  | "candidate_path_selected"
  | "job_search_used"
  | "job_filter_used"
  | "job_opened"
  | "job_application_started"
  | "job_application_submitted"
  | "resume_uploaded"
  | "company_form_started"
  | "company_form_submitted"
  | "whatsapp_clicked"
  | "article_opened"
  | "newsletter_submitted"
  | "faq_opened";

export function trackEvent(eventName: EventName, payload?: Record<string, unknown>) {
  // Handler preparado para integração com analytics
  // Não carrega ferramenta externa por padrão
  if (typeof window !== "undefined" && import.meta.env.DEV) {
    console.debug(`[analytics] ${eventName}`, payload);
  }

  // Integração futura: enviar para analytics provider
  // window.gtag?.('event', eventName, payload);
  // window.plausible?.(eventName, { props: payload });
}
