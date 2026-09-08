import { Link } from "react-router-dom";
import { Container } from "@/components/common/Container";
import { Reveal } from "@/components/common/Reveal";
import { ROUTES } from "@/lib/routes";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function FinalCTA() {
  return (
    <section className="py-16 sm:py-24 bg-wine text-white">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Sua próxima necessidade de pessoas pode começar com uma conversa clara.
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-10 max-w-xl mx-auto">
              Conte o que sua empresa precisa contratar, organizar ou desenvolver. Nossa equipe retorna com perguntas objetivas e um próximo passo possível.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                to={ROUTES.companies}
                onClick={() => trackEvent("hero_company_cta_clicked")}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white text-wine font-semibold hover:bg-ivory transition-all">
                Solicitar uma proposta
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => {
                  trackEvent("whatsapp_clicked");
                  window.open("https://wa.me/5511999999999", "_blank");
                }}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full border-2 border-white text-white font-semibold hover:bg-white/10 transition-all">
                <MessageCircle className="w-4 h-4" />
                Falar pelo WhatsApp
              </button>
            </div>

            <div className="text-sm text-white/60 space-y-1">
              <p>Atendimento de segunda a sexta</p>
              <p>Atuação presencial e remota</p>
              <p>São Paulo, Brasil</p>
              <p>contato@pilarrh.com.br</p>
              <p>(11) 3000-0000</p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
