"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type Props = {
  city: string;
  service?: string;
  label?: string;
  size?: "sm" | "lg" | "xl" | "default";
  className?: string;
  pulse?: boolean;
  phone?: string;
  messageTemplate?: string;
};

export function WhatsappButton({ city, service, label = "Chamar no WhatsApp", size = "lg", className, pulse = false, phone, messageTemplate }: Props) {
  function handleClick() {
    const url = buildWhatsAppLink({ city, service, phone, messageTemplate });
    const payload = JSON.stringify({ event: "whatsapp_click", city, service: service || "geral", at: new Date().toISOString() });
    navigator.sendBeacon?.("/api/analytics/whatsapp", new Blob([payload], { type: "application/json" }));
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <Button
      type="button"
      size={size}
      onClick={handleClick}
      aria-label={`${label} para orçamento em ${city}`}
      className={cn("gap-2 rounded-full shadow-lg hover:scale-105 focus-visible:ring-offset-2", pulse && "animate-pulse-slow", className)}
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      {label}
    </Button>
  );
}
