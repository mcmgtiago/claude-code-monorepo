import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { trackEvent } from "@/lib/analytics";

const WHATSAPP_PHONE = "5511999999999"; // Número demonstrativo
const WHATSAPP_MESSAGE = "Olá! Gostaria de saber mais sobre os serviços da PILAR Recursos Humanos.";

export function WhatsAppButton() {
  const handleClick = () => {
    trackEvent("whatsapp_clicked");
    const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE);
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;
    window.open(url, "_blank");
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-30 p-4 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center"
      aria-label="Abrir WhatsApp"
      title="Conversar conosco no WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </motion.button>
  );
}
