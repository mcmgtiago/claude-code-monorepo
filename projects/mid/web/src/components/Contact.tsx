import { useState } from 'react'
import { Reveal } from './Reveal'
import { waLink } from '@/lib/utils'
import { Send, ArrowRight } from 'lucide-react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = `Olá, MID! Vim pelo formulário do site.\n\nNome: ${formData.name}\nE-mail: ${formData.email}\nTelefone: ${formData.phone}\nEmpresa: ${formData.company}\nMensagem: ${formData.message}`
    window.open(waLink(text), '_blank')
  }

  return (
    <section id="contact" className="py-24 section-soft">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Reveal>
              <span className="badge mb-4">◎ CONTATO</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                Vamos trabalhar juntos
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-[var(--color-text-secondary)]">
                Preencha o formulário e levamos a conversa pro WhatsApp — ou mande direto se preferir.
              </p>
            </Reveal>
          </div>

          {/* Form */}
          <Reveal delay={0.2}>
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-8 md:p-10 border border-[var(--color-border)] shadow-sm"
            >
              <div className="grid md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-[var(--color-text)]">
                    Nome completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-[var(--color-text)]">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-sm font-medium text-[var(--color-text)]">
                    Telefone / WhatsApp
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="company" className="text-sm font-medium text-[var(--color-text)]">
                    Empresa / Segmento
                  </label>
                  <input
                    id="company"
                    type="text"
                    placeholder="Nome da empresa"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-5">
                <label htmlFor="message" className="text-sm font-medium text-[var(--color-text)]">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Conte um pouco sobre seu negócio e o que espera do digital..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] text-sm resize-none focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full mt-6">
                <Send size={16} />
                Enviar via WhatsApp
                <ArrowRight size={16} />
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
