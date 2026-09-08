import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'

export function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', business: '', message: '' })
  const [touched, setTouched] = useState({ name: false, email: false, phone: false, business: false, message: false })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  const validations = {
    name: formData.name.trim().length > 0,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    phone: formData.phone.trim().length >= 8,
    business: formData.business.trim().length > 0,
    message: formData.message.trim().length > 0,
  }

  function FieldIcon({ field, required = false }: { field: keyof typeof validations; required?: boolean }) {
    if (!touched[field]) return null
    const valid = validations[field]
    if (valid) return <span className="absolute right-0 top-1/2 -translate-y-1/2 text-emerald-400 text-lg">✓</span>
    if (required) return <span className="absolute right-0 top-1/2 -translate-y-1/2 text-red-400 text-lg">✕</span>
    return null
  }

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
  }

  return (
    <section className="relative bg-[var(--bg-deep)] px-5 py-24 sm:px-8 lg:px-16 lg:py-36" id="contato">
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'url(/textures/dot-pattern.svg)', backgroundRepeat: 'repeat' }} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[120px]" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center"
      >
        {/* Header */}
        <motion.div variants={formVariants} className="mb-16 w-full text-center">
          <h2 className="font-serif text-4xl italic leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl">
            Vamos <span className="text-[var(--accent)]">crescer juntos.</span>
          </h2>
          <p className="mt-6 text-lg text-white/50">Preencha e retornamos em 24h com seu diagnóstico gratuito.</p>
        </motion.div>

        {/* Form */}
        <form className="w-full max-w-2xl space-y-8" onSubmit={(e) => e.preventDefault()}>
          {[
            { label: 'Seu Nome*', name: 'name' as const, type: 'text', placeholder: 'Como podemos te chamar?', required: true },
            { label: 'E-mail*', name: 'email' as const, type: 'email', placeholder: 'Melhor e-mail para contato', required: true },
            { label: 'Telefone*', name: 'phone' as const, type: 'tel', placeholder: 'WhatsApp com DDD', required: true },
            { label: 'Empresa / Negócio', name: 'business' as const, type: 'text', placeholder: 'Nome do seu negócio', required: false },
          ].map((field) => (
            <motion.div key={field.name} variants={formVariants} className="flex flex-col gap-2 border-b border-white/[0.06] pb-2 transition-colors hover:border-white/30 focus-within:border-[var(--accent)]">
              <label className="text-sm font-medium text-white/70">{field.label}</label>
              <div className="relative w-full">
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full bg-transparent pr-8 text-base text-white outline-none placeholder:text-white/25 focus:placeholder:text-white/40 transition-colors"
                />
                <FieldIcon field={field.name} required={field.required} />
              </div>
            </motion.div>
          ))}

          <motion.div variants={formVariants} className="flex flex-col gap-2 border-b border-white/[0.06] pb-2 transition-colors hover:border-white/30 focus-within:border-[var(--accent)]">
            <label className="text-sm font-medium text-white/70">O que precisa?</label>
            <div className="relative w-full">
              <input
                type="text"
                name="message"
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Conte um pouco sobre seu objetivo"
                className="w-full bg-transparent pr-8 text-base text-white outline-none placeholder:text-white/25 focus:placeholder:text-white/40 transition-colors"
              />
              <FieldIcon field="message" />
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div variants={formVariants} className="pt-4 flex justify-center">
            <button
              type="submit"
              className="btn-primary"
            >
              <span>Enviar diagnóstico</span>
              <span className="arrow"><ArrowUpRight size={16} /></span>
            </button>
          </motion.div>
        </form>
      </motion.div>
    </section>
  )
}
