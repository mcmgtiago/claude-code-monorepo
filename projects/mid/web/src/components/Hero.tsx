import { Reveal } from './Reveal'
import { waLink } from '@/lib/utils'

export function Hero() {
  return (
    <section
      id="hero"
      className="relative pt-28 pb-0 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #e8f4fd 0%, #f0f7ff 40%, #ffffff 100%)',
      }}
    >
      <div className="container text-center relative z-10">
        {/* Headline */}
        <Reveal>
          <h1 className="text-[36px] sm:text-[44px] md:text-[52px] lg:text-[60px] font-bold leading-[1.15] tracking-[-0.02em] max-w-[780px] mx-auto text-gray-900">
            Posicione Sua Marca Com{' '}
            <span className="text-[var(--color-accent)]">Excelência Digital</span>
          </h1>
        </Reveal>

        {/* Subtitle */}
        <Reveal delay={0.1}>
          <p className="text-[15px] sm:text-[16px] text-gray-500 max-w-[560px] mx-auto mt-5 leading-relaxed">
            Espelhamos a inteligência da sua operação numa presença digital do tamanho que ela merece. Método próprio, atendimento consultivo, resultados mensuráveis.
          </p>
        </Reveal>

        {/* Buttons */}
        <Reveal delay={0.2}>
          <div className="flex items-center justify-center gap-3 mt-8">
            <a
              href={waLink('Quero posicionar minha marca. Vim pelo site.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-white text-[14px] font-semibold px-6 py-3 rounded-full hover:bg-[#4338ca] transition-colors shadow-[0_4px_14px_rgba(79,70,229,0.3)]"
            >
              Começar Agora
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a
              href="#method"
              className="inline-flex items-center gap-2 bg-white text-gray-700 text-[14px] font-semibold px-6 py-3 rounded-full border border-gray-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
            >
              Saiba Mais
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </Reveal>

        {/* Hero Image Area — placeholder for user's image */}
        <Reveal delay={0.3}>
          <div className="relative mt-12 max-w-[900px] mx-auto">
            {/* Floating cards - left side */}
            <div className="absolute left-0 top-[20%] -translate-x-[10%] z-20 hidden lg:block">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 w-[160px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">Engajamento</p>
                <p className="text-[11px] font-bold text-gray-700">+340% crescimento</p>
              </div>
            </div>

            {/* Floating cards - bottom left */}
            <div className="absolute left-0 bottom-[10%] -translate-x-[5%] z-20 hidden lg:block">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 w-[170px]">
                <p className="text-[10px] text-gray-400 mb-1">Resultados Mensais</p>
                <div className="flex items-end gap-1 h-[40px]">
                  {[30, 50, 35, 60, 45, 70, 55, 80].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, backgroundColor: i >= 6 ? '#4f46e5' : '#e0e7ff' }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating cards - right side */}
            <div className="absolute right-0 top-[15%] translate-x-[10%] z-20 hidden lg:block">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 w-[160px]">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-gray-400">Usuários ativos</p>
                </div>
                <p className="text-[22px] font-bold text-gray-900">635</p>
                <p className="text-[10px] text-green-500 font-medium">+21.0% ↗</p>
              </div>
            </div>

            {/* Floating cards - bottom right */}
            <div className="absolute right-0 bottom-[10%] translate-x-[5%] z-20 hidden lg:block">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 w-[160px]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded bg-indigo-100 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-sm bg-[var(--color-accent)]" />
                  </div>
                  <p className="text-[10px] text-gray-400">Faturamento</p>
                </div>
                <p className="text-[18px] font-bold text-gray-900">R$23.738</p>
                <p className="text-[10px] text-green-500 font-medium">+14.5% ↗</p>
              </div>
            </div>

            {/* Social media icons floating */}
            <div className="absolute left-[18%] top-[45%] z-10 hidden lg:block">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </div>
            </div>
            <div className="absolute left-[30%] top-[30%] z-10 hidden lg:block">
              <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center shadow-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </div>
            </div>
            <div className="absolute right-[25%] top-[28%] z-10 hidden lg:block">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </div>
            </div>
            <div className="absolute right-[18%] top-[50%] z-10 hidden lg:block">
              <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.82-.26.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.776.417-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.218.694.825.576C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </div>
            </div>

            {/* Main image placeholder */}
            <div className="relative z-10 mx-auto max-w-[500px]">
              <div className="aspect-[3/4] max-h-[480px] bg-gradient-to-b from-transparent to-white/50 rounded-t-2xl flex items-center justify-center">
                {/* Placeholder — user will add their PNG here */}
                <div className="text-center text-gray-300 p-8">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
                      <path d="M15 8h.01M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 16l5-5c.928-.893 2.072-.893 3 0l5 5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 14l1-1c.928-.893 2.072-.893 3 0l3 3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-400">Imagem do Hero</p>
                  <p className="text-xs text-gray-300 mt-1">Adicione sua PNG aqui</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
