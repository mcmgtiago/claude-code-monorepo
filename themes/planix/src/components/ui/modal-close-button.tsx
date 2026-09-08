import type { ButtonHTMLAttributes } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type ModalCloseButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  absolute?: boolean;
};

export function ModalCloseButton({
  absolute = false,
  className,
  type = "button",
  "aria-label": ariaLabel = "Close modal",
  ...props
}: ModalCloseButtonProps) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] text-[var(--text-muted)] transition hover:bg-white/[0.08] hover:text-[var(--text-primary)] sm:h-8 sm:w-8",
        absolute && "absolute right-3 top-3 z-20 sm:right-4 sm:top-4",
        className,
      )}
      {...props}
    >
      <Plus className="h-3.5 w-3.5 rotate-45" />
    </button>
  );
}
