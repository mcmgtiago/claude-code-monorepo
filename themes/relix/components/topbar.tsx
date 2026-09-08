import type { ReactNode } from "react";

export function Topbar({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-col gap-2.5 border-b border-slate-200 pb-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-[1.6rem] font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-[0.95rem] text-slate-500">{subtitle}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-3">{children}</div> : null}
    </div>
  );
}
