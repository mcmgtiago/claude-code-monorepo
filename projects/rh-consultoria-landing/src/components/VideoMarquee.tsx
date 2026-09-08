import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { Icon } from "./ui/Icon";

const images = [
  "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/1181435/pexels-photo-1181435.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=900",
];

/**
 * VideoMarquee visual — usa imagens profissionais em loop com aparência de
 * frames de vídeo, mantendo performance e evitando autoplay pesado no hero.
 */
export function VideoMarquee() {
  const doubled = [...images, ...images];

  return (
    <div className="relative h-[620px] overflow-hidden rounded-[2.5rem] border border-black/5 bg-[var(--color-paper-soft)] p-3 shadow-soft md:h-[720px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-white via-white/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-white via-white/70 to-transparent" />
      <div className="absolute left-1/2 top-1/2 z-20 w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-[32px] border border-white/70 bg-white/75 p-5 text-center shadow-soft backdrop-blur-xl md:w-[72%] md:p-7">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-gradient-brand text-white shadow-glow">
          <Icon name="Play" className="size-5 fill-current" aria-hidden />
        </div>
        <p className="text-sm font-semibold text-[var(--color-brand-blue)]">
          Diagnóstico ao vivo
        </p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
          Pessoas, dados e estratégia na mesma mesa.
        </h3>
        <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
          Workshops produtivos, rituais claros e decisões orientadas por métricas.
        </p>
      </div>
      <motion.div
        className="grid gap-4 animate-marquee-vertical"
        style={{ "--speed": "34s" } as CSSProperties}
      >
        {doubled.map((src, index) => (
          <article
            key={`${src}-${index}`}
            className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-soft"
          >
            <img
              src={src}
              alt="Profissionais colaborando em uma consultoria de RH"
              loading={index < 2 ? "eager" : "lazy"}
              className="h-56 w-full object-cover md:h-72"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-full bg-white/80 px-4 py-2 backdrop-blur-md">
              <span className="text-xs font-semibold text-[var(--color-ink)]">
                Sprint de transformação
              </span>
              <span className="rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white">
                LIVE
              </span>
            </div>
          </article>
        ))}
      </motion.div>
    </div>
  );
}