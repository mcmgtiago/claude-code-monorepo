"use client";

import { useMemo, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ListTodo } from "lucide-react";
import { Card } from "@/components/card";

export type TaskActivityDataPoint = {
  month: string;
  completed: number;
  opened: number;
};

const CustomTooltip = ({ active, payload, label }: any) => {
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
      {payload.map((entry: any, i: number) => (
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
            {entry.name === "completed" ? "Completed" : "Opened"}:{" "}
            <span style={{ color: "#0f172a", fontWeight: 500 }}>
              {entry.value}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
};

export function TaskActivityAnalytics({
  data,
  description = "Tasks completed compared to tasks created over the last 12 months.",
  rangeLabel = "Last 12 months"
}: {
  data: TaskActivityDataPoint[];
  description?: string;
  rangeLabel?: string;
}) {
  const totalCompleted = data.reduce((sum, item) => sum + item.completed, 0);
  const totalOpened = data.reduce((sum, item) => sum + item.opened, 0);
  const hasActivity = totalCompleted > 0 || totalOpened > 0;

  const [activeData, setActiveData] = useState<TaskActivityDataPoint[]>([]);
  useEffect(() => {
    const t = setTimeout(() => setActiveData(data), 50);
    return () => clearTimeout(t);
  }, [data]);

  const chartKey = useMemo(() => JSON.stringify(activeData), [activeData]);

  return (
    <div className="h-full min-h-[380px] xl:min-h-0" style={{ animation: "chartSlideIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) 560ms both" }}>
      <Card className="flex h-full flex-col overflow-hidden border-slate-200/90 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-0">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <h3 className="text-lg font-semibold text-slate-900">Task Velocity</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-[3px] rounded-full bg-[#10b981]" />
                    Completed: <span className="font-semibold text-slate-900">{totalCompleted}</span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-[3px] rounded-full bg-[#386df4]" />
                    Opened: <span className="font-semibold text-slate-900">{totalOpened}</span>
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
              <BarChart
                key={chartKey}
                data={activeData}
                margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
                barSize={12}
                barGap={4}
              >
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
                  width={40}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Bar
                  dataKey="opened"
                  fill="#386df4"
                  radius={[4, 4, 0, 0]}
                  animationBegin={900}
                  animationDuration={1400}
                />
                <Bar
                  dataKey="completed"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  animationBegin={1100}
                  animationDuration={1600}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div
                className="mx-auto flex max-w-[260px] flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-8 text-center"
                style={{ animation: "scaleIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both" }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#386df4]">
                  <ListTodo className="h-5 w-5" />
                </div>
                <div className="mt-4 text-[1.05rem] font-semibold text-slate-900">No task activity</div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create and complete tasks to start analyzing your team's velocity.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
