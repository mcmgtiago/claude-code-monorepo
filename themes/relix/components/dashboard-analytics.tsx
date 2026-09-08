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
import { Activity } from "lucide-react";
import { Card } from "@/components/card";
import { AppSelect } from "@/components/app-select";

type DashboardAnalyticsPoint = {
  month: string;
  pipelineFlow: number;
  engagements: number;
};

const CustomTooltip = ({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: Array<{ value: number; color: string; name: string }>;
  label?: string;
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
            {entry.name === "pipelineFlow" ? "Leads" : "Emails sent"}:{" "}
            <span style={{ color: "#0f172a", fontWeight: 500 }}>{entry.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
};

export function DashboardAnalytics({
  data
}: {
  data: DashboardAnalyticsPoint[];
}) {
  const [range, setRange] = useState("6");
  const slicedData = useMemo(() => data.slice(-parseInt(range, 10)), [data, range]);

  const totalLeadsCreated = slicedData.reduce((sum, item) => sum + item.pipelineFlow, 0);
  const totalEmailActivity = slicedData.reduce((sum, item) => sum + item.engagements, 0);
  const hasActivity = totalLeadsCreated > 0 || totalEmailActivity > 0;

  // To guarantee draw animation in Next.js production, we start with empty data
  // and hydrate the real data after the first client paint.
  const [activeData, setActiveData] = useState<DashboardAnalyticsPoint[]>([]);
  useEffect(() => {
    // A slight delay guarantees the CSS chartSlideIn is almost done or in progress
    // so Recharts' internal animation executes perfectly.
    const t = setTimeout(() => setActiveData(slicedData), 50);
    return () => clearTimeout(t);
  }, [slicedData]);

  const chartKey = useMemo(() => JSON.stringify(activeData), [activeData]);

  return (
    <div className="h-full min-h-[380px]" style={{ animation: "chartSlideIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) 320ms both" }}>
      <Card className="flex h-full flex-col overflow-hidden border-slate-200/90 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-0">
        {/* Header */}
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <h3 className="text-lg font-semibold text-slate-900">Analytics</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-[3px] rounded-full bg-[#386df4]" />
                    Leads created: <span className="font-semibold text-slate-900">{totalLeadsCreated}</span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-[3px] rounded-full bg-[#ff6b45]" />
                    Emails sent: <span className="font-semibold text-slate-900">{totalEmailActivity}</span>
                  </span>
                </div>
              </div>
              <p className="mt-1 text-sm text-slate-500">Leads created and emails sent over the {range === "12" ? "last year" : range === "24" ? "last 2 years" : range === "36" ? "last 3 years" : `last ${range} months`}.</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <AppSelect
                value={range}
                onValueChange={setRange}
                options={[
                  { value: "3", label: "3 months" },
                  { value: "6", label: "6 months" },
                  { value: "12", label: "1 year" },
                  { value: "24", label: "2 years" },
                  { value: "36", label: "3 years" }
                ]}
                menuMinWidth={118}
                className="h-9 w-[110px] rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-[0_2px_4px_rgba(15,23,42,0.02)] transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:border-[#9db7ff] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#386df4]/20"
              />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="min-h-0 flex-1 px-4 pb-4 pt-4">
          {hasActivity ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                key={chartKey}
                data={activeData}
                margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
              >
                  <defs>
                    <linearGradient id="gradPipeline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#386df4" stopOpacity={0.20} />
                      <stop offset="85%" stopColor="#386df4" stopOpacity={0.02} />
                      <stop offset="100%" stopColor="#386df4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradEngagements" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b45" stopOpacity={0.16} />
                      <stop offset="85%" stopColor="#ff6b45" stopOpacity={0.02} />
                      <stop offset="100%" stopColor="#ff6b45" stopOpacity={0} />
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
                    tick={{ fill: "#7a8ba5", fontSize: 13 }}
                    width={34}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: "#c7d8ef", strokeDasharray: "4 4", strokeWidth: 1.5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pipelineFlow"
                    stroke="#386df4"
                    strokeWidth={2.5}
                    fill="url(#gradPipeline)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#386df4", stroke: "#ffffff", strokeWidth: 2.5 }}
                    animationBegin={900}
                    animationDuration={1400}
                    animationEasing="ease-out"
                  />
                  <Area
                    type="monotone"
                    dataKey="engagements"
                    stroke="#ff6b45"
                    strokeWidth={2.2}
                    fill="url(#gradEngagements)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#ff6b45", stroke: "#ffffff", strokeWidth: 2.5 }}
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
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#386df4]">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="mt-4 text-[1.05rem] font-semibold text-slate-900">No activity yet</div>
                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  When leads and email activity start flowing in, this chart will show your monthly momentum.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
