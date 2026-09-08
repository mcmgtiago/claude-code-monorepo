import { siteConfig } from "@/config/siteConfig";

type BuildOpts = {
  city: string;
  service?: string;
  phone?: string;
  messageTemplate?: string;
};

export function buildWhatsAppLink({ city, service, phone, messageTemplate }: BuildOpts): string {
  const template = messageTemplate || siteConfig.company.whatsappMessage;
  const baseMessage = template.replace("{cidade}", city);
  const finalMessage = service ? `${baseMessage} (${service})` : baseMessage;
  const encoded = encodeURIComponent(finalMessage);
  return `https://wa.me/55${phone || siteConfig.company.phone}?text=${encoded}`;
}
