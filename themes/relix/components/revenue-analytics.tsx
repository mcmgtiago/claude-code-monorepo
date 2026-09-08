"use client";

import { useMemo, useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { DollarSign } from "lucide-react";
import { Card } from "@/components/card";
import { formatLocalizedCurrency, type WorkspaceLocalizationSettings } from "@/lib/localization";

type RevenueAnalyticsPoint = {
  month: string;
  pipelineValue: number;
  revenue: number;
};

const CustomTooltip = ({
  active,
  payload,
  label,
  localization
}: {
  active?: boolean;
  payload?: Array<{ value: number; color: string; name: string }>;
  label?: string;
  localization: WorkspaceLocalizationSettings;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #dbe4f0",
        borderRadius: 14,
        boxShadow: "0 16px 40px rgba(15, 23, 42, 0.13)",
        padding: "12px 16px",
        minWidth: 164,
        fontFamily: "inherit"
      }}
    >
      <p
        style={{
          margin: 0,
          marginBottom: 10,
          fontSize: 11,
          fontWeight: 600,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.06em"
        }}
      >
        {label}
      </p>
      {payload.map((entry, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: i < payload.length - 1 ? 7 : 0
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: entry.color,
              flexShrink: 0,
              boxShadow: `0 2px 6px ${entry.color}55`
            }}
          />
          <span style={{ fontSize: 13, color: "#475569" }}>
            {entry.name === "pipelineValue" ? "Pipeline added" : "Revenue"}:{" "}
            <span style={{ color: "#0f172a", fontWeight: 500 }}>
              {formatLocalizedCurrency(entry.value, localization)}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
};

export function RevenueAnalytics({
  data,
  localization,
  description = "Pipeline value added vs deals won over the last 12 months.",
  rangeLabel = "Last 12 months"
}: {
  data: RevenueAnalyticsPoint[];
  localization: WorkspaceLocalizationSettings;
  description?: string;
  rangeLabel?: string;
}) {
  const totalPipeline = data.reduce((sum, item) => sum + item.pipelineValue, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const hasActivity = totalPipeline > 0 || totalRevenue > 0;

  const [activeData, setActiveData] = useState<RevenueAnalyticsPoint[]>([]);
  useEffect(() => {
    const t = setTimeout(() => setActiveData(data), 50);
    return () => clearTimeout(t);
  }, [data]);

  const chartKey = useMemo(() => JSON.stringify(activeData), [activeData]);

  // Adjust Y axis ticks formatting
  const yAxisFormat = (value: number) =>
    new Intl.NumberFormat(localization.locale, {
      style: "currency",
      currency: localization.currencyCode,
      notation: "compact",
      maximumFractionDigits: 1
    }).format(value);

  return (
    <div className="h-full min-h-[380px]" style={{ animation: "chartSlideIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) 400ms both" }}>
      <Card className="flex h-full flex-col overflow-hidden border-slate-200/90 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-0">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <h3 className="text-lg font-semibold text-slate-900">Revenue</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-[3px] rounded-full bg-[#10b981]" />
                    Revenue: <span className="font-semibold text-slate-900">{formatLocalizedCurrency(totalRevenue, localization)}</span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-[3px] rounded-full bg-[#8b5cf6]" />
                    Pipeline added: <span className="font-semibold text-slate-900">{formatLocalizedCurrency(totalPipeline, localization)}</span>
                  </span>
                </div>
              </div>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                {rangeLabel}
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 px-4 pb-4 pt-4">
          {hasActivity ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                key={chartKey}
                data={activeData}
                margin={{ top: 16, right: 16, left: 16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.20} />
                    <stop offset="85%" stopColor="#10b981" stopOpacity={0.02} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradPipelineValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.16} />
                    <stop offset="85%" stopColor="#8b5cf6" stopOpacity={0.02} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf2f9" strokeDasharray="5 5" vertical={false} />
                <XAxis
                  axisLine={false}
                  tickLine={false}
                  dataKey="month"
                  tick={{ fill: "#7a8ba5", fontSize: 13 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={yAxisFormat}
                  tick={{ fill: "#7a8ba5", fontSize: 13 }}
                  width={50}
                />
                <Tooltip
                  content={<CustomTooltip localization={localization} />}
                  cursor={{ stroke: "#c7d8ef", strokeDasharray: "4 4", strokeWidth: 1.5 }}
                />
                <Area
                  type="monotone"
                  dataKey="pipelineValue"
                  stroke="#8b5cf6"
                  strokeWidth={2.2}
                  fill="url(#gradPipelineValue)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#8b5cf6", stroke: "#ffffff", strokeWidth: 2.5 }}
                  animationBegin={900}
                  animationDuration={1400}
                  animationEasing="ease-out"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#gradRevenue)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2.5 }}
                  animationBegin={1100}
                  animationDuration={1600}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div
                className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-8 text-center"
                style={{ animation: "scaleIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both" }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ecfdf5] text-[#10b981]">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div className="mt-4 text-[1.05rem] font-semibold text-slate-900">No revenue data</div>
                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  When you convert leads to won, your closed revenue trend will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
