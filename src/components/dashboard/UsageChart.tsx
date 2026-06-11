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
import { useTheme } from "@/components/ThemeProvider";

interface UsageDataPoint {
  date: string;
  invocations: number;
  spendPaise: number;
}

interface UsageChartProps {
  /** Usage data points. Defaults to empty placeholder data. */
  data?: UsageDataPoint[];
  /** Chart height in pixels. Defaults to 300. */
  height?: number;
}

const PLACEHOLDER_DATA: UsageDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    invocations: 0,
    spendPaise: 0,
  };
});

/**
 * Recharts area chart for usage over time. Renders invocation counts per day.
 *
 * @example
 * <UsageChart data={usageData} height={240} />
 */
export function UsageChart({ data = PLACEHOLDER_DATA, height = 300 }: UsageChartProps): React.JSX.Element {
  const { theme } = useTheme();
  const chartColors = {
    accent:        theme === "dark" ? "#8B5CF6" : "#7C3AED",
    grid:          theme === "dark" ? "#44403C" : "#E7E5E4",
    muted:         theme === "dark" ? "#A8A29E" : "#78716C",
    tooltipBg:     theme === "dark" ? "#1C1917" : "#FFFFFF",
    tooltipBorder: theme === "dark" ? "#44403C" : "#E7E5E4",
    tooltipText:   theme === "dark" ? "#FAFAF9" : "#1C1917",
  };

  const hasData = data.some((d) => d.invocations > 0);

  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-sen-border bg-sen-surface-2"
        style={{ height }}
      >
        <div className="text-center text-sm text-sen-muted">
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
            <stop offset="5%"  stopColor={chartColors.accent} stopOpacity={0.2} />
            <stop offset="95%" stopColor={chartColors.accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: chartColors.muted }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: chartColors.muted }}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: `1px solid ${chartColors.tooltipBorder}`,
            background: chartColors.tooltipBg,
            color: chartColors.tooltipText,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}
          labelStyle={{ color: chartColors.muted, fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="invocations"
          stroke={chartColors.accent}
          strokeWidth={2}
          fill="url(#usageGradient)"
          name="Invocations"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
