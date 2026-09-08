import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  BarChart3,
  Menu,
  Play,
  X,
  Zap,
  Palette,
  Shield,
  type LucideIcon,
} from 'lucide-react'
import { Testimonials } from './components/Testimonials'
import { ServicesList } from './components/ServicesList'
import { ContactForm } from './components/ContactForm'
import { Plans } from './components/Plans'
import { FaqSection } from './components/FaqSection'
import { CasesSticky } from './components/CasesSticky'
import { Comparison } from './components/Comparison'
import { Footer } from './components/Footer'
import { AnimatedCounter } from './components/AnimatedCounter'
import { FadeIn, FadeInStagger, FadeInItem } from './components/FadeIn'
import { Particles } from './components/Particles'
import { ProgressiveBlur } from './components/ProgressiveBlur'

const brandLogo = '/logo-rox.png'
const BG_VIDEO = '/hero-bg.mp4'
const grainUrl = '/textures/noise.svg'
const gridPattern = '/textures/circuit-board.svg'
const dotPattern = '/textures/dots-premium.svg'
const topoPattern = '/textures/topography.svg'

// Scroll reveal hook (CSS-based for non-motion elements)
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.js-reveal, .js-reveal-stagger')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target) } }),
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

const navLinks = [
  { label: 'Início', href: '#inicio' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Processo', href: '#processo' },
  { label: 'Contato', href: '#contato' },
]

const stats = [
  { value: 2, suffix: '+', label: 'anos construindo presença digital' },
  { value: 87, suffix: '+', label: 'projetos entregues com resultado' },
  { value: 2.4, suffix: ' mi', prefix: 'R$ ', decimals: 1, label: 'em mídia gerenciada' },
]


const process = [
  ['Diagnóstico gratuito', 'Analisamos presença atual, concorrentes e oportunidades. Sem compromisso.'],
  ['Estratégia personalizada', 'Definimos plano, metas e prazos para o seu momento de negócio.'],
  ['Execução profissional', 'Conteúdo, mídia e posicionamento entram em operação de forma integrada.'],
  ['Otimização e escala', 'Os dados mostram o que manter, corrigir e ampliar mês após mês.'],
]

const capabilities: Array<{ icon: LucideIcon; title: string; description: string }> = [
  { icon: Zap, title: 'Dias, não meses', description: 'Da estratégia à publicação em ritmo que redefine o que é rápido.' },
  { icon: Palette, title: 'Obsessão pelo detalhe', description: 'Cada pixel pensado. Cada elemento refinado. Design que parece inevitável.' },
  { icon: BarChart3, title: 'Feito para converter', description: 'Layouts informados por dados. Decisões orientadas por performance.' },
  { icon: Shield, title: 'Posicionamento real', description: 'Autoridade construída com método. Reconhecimento antes da comparação de preço.' },
]


function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useReveal()

  return (
    <div className="page-bg min-h-screen overflow-x-hidden text-white selection:bg-[var(--accent)] selection:text-white">
      {/* WHATSAPP FLOAT */}
      <a
        href="https://wa.me/?text=Ol%C3%A1!%20Vi%20o%20site%20da%20Roxm%C3%ADdia%20e%20quero%20saber%20mais%20sobre%20posicionamento%20digital."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-transform hover:scale-110"
        aria-label="Falar pelo WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="white" className="size-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* NAV */}
      <nav className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${scrolled ? 'py-3 bg-[rgba(8,8,8,0.8)] backdrop-blur-xl border-b border-white/5' : 'py-5'}`}>
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-16">
          <a href="#inicio" className="flex items-center" aria-label="Roxmídia">
            <img className="h-8 w-auto sm:h-9" src={brandLogo} alt="Roxmídia" />
          </a>
          <div className="liquid-glass hidden items-center gap-1 rounded-full px-1.5 py-1 md:flex">
            {navLinks.map((link, i) => (
              <a key={link.label} href={link.href} className={`rounded-full px-4 py-2 text-sm transition-colors duration-300 ${i === 0 ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <a href="#contato" className="group inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-white/90">
              Falar conosco
              <ArrowUpRight size={14} className="transition-transform group-hover:rotate-[-45deg]" />
            </a>
          </div>
          <button onClick={() => setMenuOpen((s) => !s)} className="grid size-10 place-items-center rounded-full bg-white text-black md:hidden" aria-label="Menu">
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[rgba(8,8,8,0.85)] backdrop-blur-xl md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-x-3 top-20 rounded-2xl border border-white/[0.06] bg-[rgba(8,8,8,0.95)] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-4 py-3 text-2xl font-medium text-white hover:bg-white/5">{link.label}</a>
              ))}
            </div>
            <a href="#contato" onClick={() => setMenuOpen(false)} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] text-sm font-medium text-white">
              Falar conosco <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      )}

      {/* HERO */}
      <header id="inicio" className="relative min-h-screen overflow-hidden">
        <video className="absolute inset-0 z-0 h-full w-full object-cover" autoPlay muted loop playsInline src={BG_VIDEO} />
        <div className="absolute inset-0 z-[1] bg-black/55" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[300px] bg-gradient-to-b from-black via-black/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[400px] bg-gradient-to-b from-transparent via-black/60 to-black" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-[55%] bg-gradient-to-r from-black/75 to-transparent" />
        <div className="pointer-events-none absolute inset-0 z-[3] opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: `url(${grainUrl})`, backgroundSize: '200px' }} />
        {/* Floating particles */}
        <Particles count={35} color="rgba(255,90,0,0.5)" className="z-[4]" speed={0.6} />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-[1440px] flex-col justify-center px-5 pt-28 pb-16 sm:px-8 lg:px-16">
          <div className="reveal liquid-glass mb-8 inline-flex w-fit items-center gap-3 rounded-full px-1.5 py-1.5">
            <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-[11px] font-semibold tracking-wide text-white">NOVO</span>
            <span className="pr-3 text-xs font-medium text-white/85 sm:text-sm">Aceitando projetos para posicionamento digital</span>
          </div>

          <h1 className="reveal delay-100 max-w-4xl font-serif text-5xl italic leading-[0.95] tracking-[-0.03em] text-white sm:text-7xl lg:text-[5.5rem] xl:text-[6rem]">
            Sua marca <span className="text-[var(--accent)]">precisa</span>
            <br />ser <span className="text-gradient">lembrada</span>.
          </h1>

          <p className="reveal delay-200 mt-8 max-w-xl text-base font-light leading-relaxed text-white/65">
            Posicionamento digital estratégico para negócios que cansaram de ser mais um perfil no algoritmo. Conteúdo, tráfego e presença que transformam atenção em clientes.
          </p>

          <div className="reveal delay-300 mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <a href="#contato" className="btn-primary">
              <span>Posicionar minha marca</span>
              <span className="arrow"><ArrowUpRight size={16} /></span>
            </a>
            <a href="#servicos" className="btn-ghost">
              <Play size={12} className="text-[var(--accent)]" />
              <span>Conhecer o método</span>
            </a>
          </div>

          <div className="reveal delay-400 mt-20 grid grid-cols-1 gap-8 border-t border-white/[0.06] pt-10 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/10">
            {stats.map((s) => (
              <div key={s.label} className="sm:px-8 first:sm:pl-0 last:sm:pr-0">
                <strong className="block font-serif text-4xl italic leading-none tracking-tight text-white sm:text-5xl">
                  <AnimatedCounter value={s.value} suffix={s.suffix} prefix={s.prefix || ''} decimals={s.decimals || 0} />
                </strong>
                <span className="mt-2 block text-sm text-white/50">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main>
        {/* SERVICES LIST (white overlay style) */}
        <ServicesList />

        {/* WHY US - capabilities strip */}
        <section className="relative overflow-hidden bg-[var(--bg-deep)] px-5 py-24 sm:px-8 lg:px-16">
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: `url(${dotPattern})`, backgroundRepeat: 'repeat' }} />
          <div className="pointer-events-none absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.08] blur-[100px]" />

          <FadeInStagger className="relative mx-auto grid max-w-[1440px] grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-4">
            {capabilities.map((cap) => {
              const Icon = cap.icon
              return (
                <FadeInItem key={cap.title} className="flex flex-col gap-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-[rgba(255,90,0,0.08)] text-[var(--accent)]">
                    <Icon size={20} strokeWidth={1.4} />
                  </span>
                  <h3 className="text-lg font-medium leading-tight text-white">{cap.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{cap.description}</p>
                </FadeInItem>
              )
            })}
          </FadeInStagger>
        </section>

        {/* COMPARISON - Before/After */}
        <Comparison />

        {/* PROCESS */}
        <section className="relative bg-[var(--bg-deep)] px-5 py-24 sm:px-8 lg:px-16 lg:py-36" id="processo">
          <div className="pointer-events-none absolute right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-[var(--accent)] opacity-[0.08] blur-[140px]" />
          <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: `url(${topoPattern})`, backgroundRepeat: 'repeat' }} />
          <Particles count={20} color="rgba(255,255,255,0.3)" speed={0.4} />
          <ProgressiveBlur direction="top" />

          <div className="relative mx-auto max-w-[1440px]">
            <FadeIn y={40}>
              <h2 className="max-w-4xl font-serif text-4xl italic leading-[1.05] tracking-[-0.02em] text-white sm:text-6xl">
                Do diagnóstico ao resultado <span className="text-[var(--accent)]">em quatro movimentos.</span>
              </h2>
            </FadeIn>
            <FadeInStagger className="mt-16 border-t border-white/[0.06]">
              {process.map(([title, description], i) => (
                <FadeInItem key={title} className="grid grid-cols-1 gap-4 border-b border-white/[0.04] py-8 md:grid-cols-[60px_1fr_1.2fr] md:items-center">
                  <span className="font-mono text-xs text-[var(--accent)]">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="font-serif text-2xl italic text-white">{title}</h3>
                  <p className="max-w-xl text-base leading-relaxed text-white/50">{description}</p>
                </FadeInItem>
              ))}
            </FadeInStagger>
          </div>
        </section>

        {/* CASES STICKY */}
        <CasesSticky />

        {/* TESTIMONIALS */}
        <Testimonials />

        {/* PLANS */}
        <Plans />

        {/* SOBRE */}
        <section className="relative overflow-hidden bg-[var(--bg-deep)] px-5 py-24 sm:px-8 lg:px-16 lg:py-36" id="sobre">
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: `url(${topoPattern})`, backgroundRepeat: 'repeat' }} />
          <div className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-[var(--accent)] opacity-[0.08] blur-[150px]" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-[var(--accent)] opacity-[0.05] blur-[120px]" />
          <Particles count={15} color="rgba(255,90,0,0.3)" speed={0.3} />

          <div className="relative mx-auto max-w-[1440px]">
            <FadeIn y={30} className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
              <div>
                <h2 className="font-serif text-4xl italic leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl">
                  Enxuta, ágil e obcecada por resultado.
                </h2>
                <p className="mt-8 text-base leading-relaxed text-white/55">
                  A Roxmídia nasceu há 2 anos da obsessão por transformar negócios através do digital. Cada cliente é um projeto que levamos pessoalmente, com atendimento próximo e decisões orientadas por dados.
                </p>
                <p className="mt-4 text-base leading-relaxed text-white/55">
                  Trabalhamos com negócios locais, prestadores de serviço, e-commerces e eventos que querem sair do anonimato digital.
                </p>
                <a href="#contato" className="btn-primary mt-10">
                  <span>Conhecer o estúdio</span>
                  <span className="arrow"><ArrowUpRight size={16} /></span>
                </a>
              </div>
              <div className="glass-card overflow-hidden rounded-2xl">
                <div className="aspect-[4/3] w-full bg-gradient-to-br from-[var(--accent)]/25 via-black to-[var(--accent)]/10 p-8 sm:p-10">
                  <div className="flex h-full flex-col justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">Manifesto</span>
                    <p className="font-serif text-2xl italic leading-snug text-white sm:text-3xl">
                      "Marcas que são lembradas não acontecem por acaso. Acontecem por estratégia."
                    </p>
                    <span className="text-xs text-white/40">Roxmídia - posicionamento digital</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* FAQ */}
        <FaqSection />

        {/* CONTACT FORM */}
        <ContactForm />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  )
}

export default App