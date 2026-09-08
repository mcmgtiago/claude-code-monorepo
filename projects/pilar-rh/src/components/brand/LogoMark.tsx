interface LogoMarkProps {
  size?: "sm" | "md" | "lg";
  variant?: "navy" | "wine" | "white";
  className?: string;
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
};

export function LogoMark({ size = "md", variant = "navy", className = "" }: LogoMarkProps) {
  const s = sizeMap[size];
  const colorMap = {
    navy: "#10283f",
    wine: "#8b3e4d",
    white: "#ffffff",
  };
  const color = colorMap[variant];

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Símbolo PILAR - duas linhas verticais com ponte */}
      <g>
        {/* Linha esquerda */}
        <line x1="12" y1="8" x2="12" y2="40" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        {/* Linha direita */}
        <line x1="36" y1="8" x2="36" y2="40" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        {/* Ponte central (aproximação) */}
        <path
          d="M 12 24 Q 24 22, 36 24"
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* Pequeno detalhe superior sugerindo "P" */}
        <rect x="10" y="8" width="14" height="8" stroke={color} fill="none" strokeWidth="1.5" rx="1" />
      </g>
    </svg>
  );
}
