import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/card";

export function MetricCard({
  label,
  value,
  trend,
  tone = "positive",
  href,
  icon: Icon,
  helper,
  animationDelay = 0
}: {
  label: string;
  value: string;
  trend: string;
  tone?: "positive" | "negative" | "neutral";
  href?: Route;
  icon: LucideIcon;
  helper?: string;
  animationDelay?: number;
}) {
  const toneClasses =
    tone === "negative"
      ? "bg-rose-50 text-rose-500"
      : tone === "neutral"
        ? "bg-slate-100 text-slate-500"
        : "bg-emerald-50 text-emerald-500";

  const iconToneClasses =
    tone === "negative"
      ? "bg-rose-100 text-rose-500"
      : tone === "neutral"
        ? "bg-slate-100 text-slate-500"
        : "bg-[#e8efff] text-[#386df4]";

  const TrendIcon = tone === "negative" ? TrendingDown : tone === "positive" ? TrendingUp : null;

  return (
    <div className="h-full" style={{ animation: `fadeInUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${animationDelay}ms both` }}>
      <Card className="relative flex h-full flex-col overflow-hidden border-slate-200/90 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_52%,#eef4ff_100%)] p-0">
        {/* Top accent bar */}
        <div
          className="absolute left-0 right-0 top-0 h-[3px] rounded-t-2xl"
          style={{
            background:
              tone === "negative"
                ? "linear-gradient(90deg, #fca5a5, #f87171)"
                : tone === "neutral"
                  ? "linear-gradient(90deg, #cbd5e1, #94a3b8)"
                  : "linear-gradient(90deg, #93b4fd, #386df4)"
          }}
        />

        <div className="relative grid grid-cols-[minmax(0,1fr)_2.75rem] items-start gap-4 px-5 pt-5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <div className="mt-4 flex min-w-0 flex-wrap items-end gap-x-3 gap-y-2">
              <h3 className="min-w-0 max-w-full text-[2.15rem] font-semibold leading-none tracking-tight text-slate-900 [overflow-wrap:anywhere]">
                {value}
              </h3>
              <span className={`mb-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses}`}>
                {TrendIcon && <TrendIcon className="h-3 w-3" />}
                {trend}
              </span>
            </div>
          </div>
          <div className={`flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl ${iconToneClasses}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="relative mt-auto px-5 pb-5 pt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 text-sm text-slate-400 [overflow-wrap:anywhere]">{helper || "from last month"}</p>
            {href ? (
              <Link href={href} className="shrink-0 rounded-xl border border-slate-200 bg-white p-3 text-slate-600 hover:bg-slate-50 hover:text-[#386df4]">
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
