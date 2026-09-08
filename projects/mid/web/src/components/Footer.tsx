import { waLink } from '@/lib/utils'

export function Footer() {
  return (
    <footer className="section-dark py-16">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div>
            <img src="/logomid.png" alt="MID" className="h-8 w-auto brightness-0 invert mb-4" />
            <p className="text-sm text-white/60 leading-relaxed">Espelhamos a inteligência da sua operação numa presença digital do tamanho que ela merece.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">NAVEGAÇÃO</h4>
            <ul className="flex flex-col gap-2 text-sm text-white/60">
              <li><a href="#hero" className="hover:text-white transition">Início</a></li>
              <li><a href="#about" className="hover:text-white transition">Sobre</a></li>
              <li><a href="#services" className="hover:text-white transition">Serviços</a></li>
              <li><a href="#method" className="hover:text-white transition">Método MEC</a></li>
              <li><a href="#cases" className="hover:text-white transition">Cases</a></li>
              <li><a href="#contact" className="hover:text-white transition">Contato</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">SERVIÇOS</h4>
            <ul className="flex flex-col gap-2 text-sm text-white/60">
              <li>Posicionamento estratégico</li>
              <li>Presença digital</li>
              <li>Conteúdo com método</li>
              <li>Direção criativa</li>
              <li>Gestão de canal</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">CONTATO</h4>
            <ul className="flex flex-col gap-2 text-sm text-white/60">
              <li><a href={waLink('Olá, MID. Vim pelo site.')} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-whatsapp)] transition">📱 WhatsApp</a></li>
              <li><a href="https://www.instagram.com/mid.influencia" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">📷 @mid.influencia</a></li>
              <li><a href="mailto:contato@mid.com.br" className="hover:text-white transition">✉️ contato@mid.com.br</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/40">
          <p>© 2026 MID · Todos os direitos reservados</p>
          <p>Feito com método.</p>
        </div>
      </div>
    </footer>
  )
}
