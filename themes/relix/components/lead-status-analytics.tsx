"use client";

import { useMemo, useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FolderKanban } from "lucide-react";
import { Card } from "@/components/card";

export type LeadStatusDataPoint = {
  name: string;
  value: number;
  color: string;
  label: string;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #dbe4f0",
        borderRadius: 14,
        boxShadow: "0 16px 40px rgba(15, 23, 42, 0.13)",
        padding: "12px 16px",
        minWidth: 140,
        fontFamily: "inherit"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: data.color,
            boxShadow: `0 2px 6px ${data.color}55`
          }}
        />
        <span style={{ fontSize: 13, color: "#475569" }}>
          {data.label}: <span style={{ color: "#0f172a", fontWeight: 600 }}>{data.value}</span>
        </span>
      </div>
    </div>
  );
};

export function LeadStatusAnalytics({
  data,
  description = "Current distribution of leads across the pipeline.",
}: {
  data: LeadStatusDataPoint[];
  description?: string;
}) {
  const [activeData, setActiveData] = useState<LeadStatusDataPoint[]>([]);
  useEffect(() => {
    const t = setTimeout(() => setActiveData(data), 50);
    return () => clearTimeout(t);
  }, [data]);

  const chartKey = useMemo(() => JSON.stringify(activeData), [activeData]);
  const hasActivity = data.some(d => d.value > 0);
  const totalLeads = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-full min-h-[380px] xl:min-h-0" style={{ animation: "chartSlideIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) 480ms both" }}>
      <Card className="flex h-full flex-col overflow-hidden border-slate-200/90 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-0">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-x-3 gap-y-2">
                <h3 className="text-lg font-semibold text-slate-900">Lead Funnel Distribution</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Total: {totalLeads}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
          </div>
        </div>

        <div className="min-h-[260px] flex-1 px-4 pb-4 pt-6 relative flex flex-col items-center">
          {hasActivity ? (
            <>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart key={chartKey}>
                    <Pie
                      data={activeData}
                      innerRadius={70}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      animationDuration={1200}
                      animationEasing="ease-out"
                      cornerRadius={6}
                    >
                      {activeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-4 px-2">
                {data.map(item => (
                  <div key={item.name} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-800">{item.label}</span>
                    <span className="text-slate-400">({item.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
             <div className="flex h-full flex-1 items-center justify-center w-full">
               <div className="mx-auto flex max-w-[260px] flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-8 text-center" style={{ animation: "scaleIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
                 <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#386df4]">
                   <FolderKanban className="h-5 w-5" />
                 </div>
                 <div className="mt-4 text-[1.05rem] font-semibold text-slate-900">No leads yet</div>
                 <p className="mt-2 text-sm leading-6 text-slate-500">Pipeline funnel is currently empty.</p>
               </div>
             </div>
          )}
        </div>
      </Card>
    </div>
  );
}
