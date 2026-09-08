interface SectionLabelProps {
  text: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionLabel({
  text,
  align = "left",
  className = "",
}: SectionLabelProps) {
  return (
    <div
      className={`flex items-center gap-3 mb-4 ${
        align === "center" ? "justify-center" : ""
      } ${className}`}
    >
      <div className="h-px w-3 bg-wine" />
      <span className="text-[0.68rem] font-mono font-medium tracking-[0.15em] text-ink-soft uppercase">
        {text}
      </span>
    </div>
  );
}
