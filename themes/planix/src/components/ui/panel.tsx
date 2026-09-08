import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

type PanelProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

export function Panel({
  title,
  description,
  action,
  className,
  contentClassName,
  children,
}: PanelProps) {
  return (
    <section
      className={cn(
        "panel-surface rounded-[var(--radius-xl)] p-5 sm:p-6",
        className,
      )}
    >
      {(title || action || description) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="type-card-title">{title}</h2>}
            {description && <p className="type-ui mt-1 text-[var(--text-secondary)]">{description}</p>}
          </div>
          {action ?? (
            <button
              type="button"
              aria-label={`${title ?? "Card"} menu`}
              className="soft-pill flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          )}
        </header>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
