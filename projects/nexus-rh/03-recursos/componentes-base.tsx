// =================================================================
// NEXUS — Componentes Base Reutilizáveis
// Estes componentes são usados em TODAS as seções da landing page
// =================================================================

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";

// =================================================================
// 1. Reveal — Fade-up com blur ao entrar em viewport
// =================================================================

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  once?: boolean;
};

export function Reveal({
  children,
  delay = 0,
  duration = 0.8,
  y = 40,
  className = "",
  once = true,
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, amount: 0.22 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// =================================================================
// 2. WordReveal — Headline com cada palavra entrando sequencialmente
// =================================================================

type WordRevealProps = {
  text: string;
  delay?: number;
  staggerDelay?: number;
  className?: string;
};

export function WordReveal({
  text,
  delay = 0,
  staggerDelay = 0.06,
  className = "",
}: WordRevealProps) {
  const words = text.split(" ");

  return (
    <span className={className} aria-label={text}>
      {words.map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          initial={{ opacity: 0, y: 36, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            duration: 0.7,
            delay: delay + idx * staggerDelay,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ display: "inline-block", whiteSpace: "pre" }}
          aria-hidden="true"
        >
          {word + " "}
        </motion.span>
      ))}
    </span>
  );
}

// =================================================================
// 3. MagneticButton — CTA com movimento ao cursor (desktop only)
// =================================================================

type MagneticButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "outline" | "dark";
  ariaLabel?: string;
};

export function MagneticButton({
  children,
  onClick,
  className = "",
  variant = "primary",
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) * 0.15;
    const dy = (e.clientY - centerY) * 0.15;
    setPosition({ x: dx, y: dy });
  };

  const handlePointerLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const variantStyles = {
    primary:
      "bg-[var(--signal)] text-white hover:bg-[var(--signal-light)] border border-transparent",
    outline:
      "bg-transparent text-[var(--ink)] border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-white",
    dark:
      "bg-[var(--signal-light)] text-[var(--ink)] hover:bg-white border border-transparent",
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label={ariaLabel}
      className={`group relative inline-flex min-h-12 items-center gap-3 rounded-full px-6 text-sm font-semibold transition-colors duration-200 ${variantStyles[variant]} ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: "background-color 200ms ease, transform 200ms ease",
      }}
    >
      {children}
    </button>
  );
}

// =================================================================
// 4. MetricTicker — Números animados ao entrar em viewport
// =================================================================

type MetricTickerProps = {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
  decimalPlaces?: number;
};

export function MetricTicker({
  value,
  suffix = "",
  duration = 1.4,
  className = "",
  decimalPlaces = 0,
}: MetricTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!ref.current || hasStarted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
            const startTime = performance.now();
            const animate = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / (duration * 1000), 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setDisplayValue(value * eased);
              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setDisplayValue(value);
              }
            };
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration, hasStarted]);

  const formatted =
    decimalPlaces > 0
      ? displayValue.toFixed(decimalPlaces)
      : Math.round(displayValue).toString();

  return (
    <span ref={ref} className={className} aria-label={`${value}${suffix}`}>
      {formatted}
      {suffix}
    </span>
  );
}

// =================================================================
// 5. SignalMap — Visualização SVG de alinhamento organizacional
// =================================================================

type SignalMapProps = {
  alignment: number;
  signals: number;
  className?: string;
};

export function SignalMap({ alignment, signals, className = "" }: SignalMapProps) {
  const nodes = [
    { id: "estrategia", label: "Estratégia", x: 310, y: 100, color: "var(--signal)" },
    { id: "lideranca", label: "Liderança", x: 100, y: 250, color: "var(--signal)" },
    { id: "operacao", label: "Operação", x: 520, y: 250, color: "var(--signal-light)" },
    { id: "cultura", label: "Cultura", x: 200, y: 450, color: "var(--signal-light)" },
    { id: "talentos", label: "Talentos", x: 420, y: 450, color: "var(--signal-light)" },
  ];

  return (
    <svg
      viewBox="0 0 620 620"
      className={`w-full h-auto ${className}`}
      aria-label={`Mapa de alinhamento organizacional: ${alignment}/100, ${signals} sinais mapeados`}
    >
      {/* Grade de fundo */}
      <defs>
        <pattern
          id="grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="rgba(26, 26, 26, 0.06)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="620" height="620" fill="url(#grid)" />

      {/* Linhas conectando nodos */}
      {nodes.map((node, idx) =>
        nodes.slice(idx + 1).map((target, j) => (
          <line
            key={`line-${idx}-${j}`}
            x1={node.x}
            y1={node.y}
            x2={target.x}
            y2={target.y}
            stroke="var(--signal)"
            strokeWidth="1"
            strokeOpacity="0.2"
            strokeDasharray="5 8"
            className="signal-line"
          />
        ))
      )}

      {/* Nodos */}
      {nodes.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r="8"
            fill={node.color}
            className="signal-dot"
          />
          <text
            x={node.x}
            y={node.y + 28}
            textAnchor="middle"
            className="font-mono"
            fontSize="10"
            fill="var(--ink)"
            style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// =================================================================
// 6. SectionLabel — Eyebrow técnico com índice
// =================================================================

type SectionLabelProps = {
  number: string;
  text: string;
  className?: string;
};

export function SectionLabel({ number, text, className = "" }: SectionLabelProps) {
  return (
    <p
      className={`font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--ink-muted)] ${className}`}
    >
      {number} / {text}
    </p>
  );
}

// =================================================================
// 7. AccordionItem — Para FAQ e listas expansíveis
// =================================================================

type AccordionItemProps = {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
};

export function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: AccordionItemProps) {
  return (
    <div className="border-t border-[var(--line)] py-6">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${question}`}
        className="flex w-full items-center justify-between gap-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]"
      >
        <h3 className="text-xl font-medium tracking-tight md:text-2xl">
          {question}
        </h3>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 5L7 9L11 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`accordion-content-${question}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-3xl pt-4 pr-12 text-base leading-relaxed text-[var(--ink-soft)]">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =================================================================
// 8. RevealStagger — Wrapper para aplicar stagger em uma lista
// =================================================================

type RevealStaggerProps = {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
};

export function RevealStagger({
  children,
  staggerDelay = 100,
  className = "",
}: RevealStaggerProps) {
  return (
    <div className={className}>
      {children.map((child, idx) => (
        <Reveal key={idx} delay={(idx * staggerDelay) / 1000}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}