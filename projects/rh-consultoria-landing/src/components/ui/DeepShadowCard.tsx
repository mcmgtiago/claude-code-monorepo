import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface DeepShadowCardProps {
  image?: string;
  title?: string;
  description?: string;
  cta?: ReactNode;
  children?: ReactNode;
  className?: string;
  imageAlt?: string;
}

export function DeepShadowCard({
  image,
  title,
  description,
  cta,
  children,
  className,
  imageAlt,
}: DeepShadowCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-[20px] border border-black/5 bg-white deep-shadow",
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 20% 0%, rgba(61,129,227,0.12), transparent 34%), radial-gradient(circle at 85% 10%, rgba(236,72,153,0.10), transparent 28%)",
        }}
      />
      {image && (
        <div className="relative aspect-[3/2] overflow-hidden">
          <img
            src={image}
            alt={imageAlt ?? title ?? "Imagem do card"}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-transparent" />
        </div>
      )}
      <div className="relative p-6 md:p-7">
        {title && <h3 className="text-xl font-bold tracking-tight">{title}</h3>}
        {description && (
          <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
            {description}
          </p>
        )}
        {children}
        {cta && <div className="mt-5">{cta}</div>}
      </div>
    </motion.article>
  );
}