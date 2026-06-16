"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface UsageDataPoint {
  date: string;
  invocations: number;
  spendCredits: number;
}

interface UsageChartProps {
  /** Usage data points. Defaults to empty mock data. */
  data?: UsageDataPoint[];
  /** Chart height in pixels. Defaults to 300. */
  height?: number;
}

// Placeholder data until real usage is fetched from the gateway
const PLACEHOLDER_DATA: UsageDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    invocations: Math.floor(Math.random() * 0), // zeroes until real data
    spendCredits: 0,
  };
});

/**
 * Recharts area chart for usage over time. Renders invocation counts per day.
 * Empty data is handled gracefully with placeholder bars.
 *
 * @example
 * <UsageChart data={usageData} height={240} />
 */
export function UsageChart({ data = PLACEHOLDER_DATA, height = 300 }: UsageChartProps): React.JSX.Element {
  const hasData = data.some((d) => d.invocations > 0);

  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-slate-50"
        style={{ height }}
      >
        <div className="text-center text-sm text-slate-400">
          <div className="text-2xl mb-2">📈</div>
          No usage data yet. Connect an agent to start tracking.
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          labelStyle={{ color: "#475569", fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="invocations"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#usageGradient)"
          name="Invocations"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
