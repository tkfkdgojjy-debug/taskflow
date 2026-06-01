"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface WeeklyProductivityPoint {
  day: string;
  completed: number;
  focus: number;
}

interface MonthlyCompletionPoint {
  week: string;
  completed: number;
  remaining: number;
}

interface DashboardChartsProps {
  weeklyProductivity: WeeklyProductivityPoint[];
  monthlyCompletion: MonthlyCompletionPoint[];
}

const tooltipStyle = {
  border: "0",
  borderRadius: "16px",
  background: "var(--card)",
  color: "var(--card-foreground)",
  boxShadow: "var(--shadow-soft)",
};

export function DashboardCharts({
  weeklyProductivity,
  monthlyCompletion,
}: DashboardChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => setIsMounted(true));
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="rounded-2xl bg-background/70 p-5">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight">주간 집중도</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              계획한 집중 시간 대비 완료한 작업 흐름입니다.
            </p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            이번 주
          </span>
        </div>
        <div className="h-72 min-w-0">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={weeklyProductivity} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="completedGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.26} />
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="2 8" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="day"
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "var(--border)" }} />
                <Area
                  dataKey="focus"
                  fill="transparent"
                  name="집중 가능 시간"
                  stroke="var(--accent-beige)"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  type="monotone"
                />
                <Area
                  dataKey="completed"
                  fill="url(#completedGradient)"
                  name="완료"
                  stroke="var(--accent-blue)"
                  strokeWidth={2.5}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-md bg-muted/40" />
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-background/70 p-5">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight">완료 흐름</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              완료한 일과 남은 업무량을 차분하게 보여줍니다.
            </p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            5월
          </span>
        </div>
        <div className="h-72 min-w-0">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={monthlyCompletion} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="2 8" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="week"
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="completed" fill="var(--accent-sage)" name="완료" radius={[12, 12, 0, 0]} />
                <Bar
                  dataKey="remaining"
                  fill="var(--accent-terracotta)"
                  name="남음"
                  opacity={0.32}
                  radius={[12, 12, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-md bg-muted/40" />
          )}
        </div>
      </section>
    </div>
  );
}
