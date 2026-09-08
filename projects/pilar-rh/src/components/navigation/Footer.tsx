import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { ROUTES } from "@/lib/routes";
import { Mail, MapPin, Phone } from "lucide-react";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-navy-deep text-white pt-16 pb-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div>
              <Logo variant="white" showTagline className="mb-6" />
              <div className="space-y-3 text-sm text-white/70">
                <p>
                  <MapPin className="inline w-4 h-4 mr-2" />
                  São Paulo, SP, Brasil
                </p>
                <p>
                  <Phone className="inline w-4 h-4 mr-2" />
                  (11) 3000-0000
                </p>
                <p>
                  <Mail className="inline w-4 h-4 mr-2" />
                  contato@pilarrh.com.br
                </p>
                <p className="text-xs mt-4">Segunda a sexta, das 8h às 18h</p>
              </div>
            </div>

            {/* Para Empresas */}
            <div>
              <h3 className="font-semibold mb-4 text-base">Para empresas</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to={ROUTES.companies} className="text-white/70 hover:text-white transition-colors">
                    Recrutamento e seleção
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Trabalho temporário
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Terceirização
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Administração de pessoal
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Treinamentos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Consultoria
                  </a>
                </li>
              </ul>
            </div>

            {/* Para Profissionais */}
            <div>
              <h3 className="font-semibold mb-4 text-base">Para profissionais</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to={ROUTES.jobs} className="text-white/70 hover:text-white transition-colors">
                    Vagas
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.candidates} className="text-white/70 hover:text-white transition-colors">
                    Enviar currículo
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Dicas de carreira
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Aviso contra golpes
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Perguntas frequentes
                  </a>
                </li>
              </ul>
            </div>

            {/* Institucional */}
            <div>
              <h3 className="font-semibold mb-4 text-base">Institucional</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to={ROUTES.about} className="text-white/70 hover:text-white transition-colors">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.insights} className="text-white/70 hover:text-white transition-colors">
                    Conteúdos
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.contact} className="text-white/70 hover:text-white transition-colors">
                    Contato
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.privacy} className="text-white/70 hover:text-white transition-colors">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.terms} className="text-white/70 hover:text-white transition-colors">
                    Termos
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-navy-soft pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-white/50">
                © {currentYear} PILAR Recursos Humanos. Todos os direitos reservados.
              </p>
              <p className="text-xs text-white/70 font-serif italic">
                Pessoas certas. Relações que permanecem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
