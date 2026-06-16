"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCredits } from "@/lib/utils/format";

interface SpendSummaryProps {
  /** Current credit balance in credits. */
  balanceCredits?: number;
  /** Total spend this month in credits. */
  monthSpendCredits?: number;
  /** Total spend all time in credits. */
  totalSpendCredits?: number;
  isLoading?: boolean;
}

interface StatCardProps {
  label: string;
  value: string;
  isLoading: boolean;
  highlight?: boolean;
}

function StatCard({ label, value, isLoading, highlight = false }: StatCardProps): React.JSX.Element {
  return (
    <Card>
      <CardContent className="pt-6">
        {isLoading ? (
          <>
            <Skeleton className="h-7 w-24" />
            <Skeleton className="mt-2 h-3 w-32" />
          </>
        ) : (
          <>
            <div className={`text-2xl font-bold ${highlight ? "text-indigo-600" : "text-slate-900"}`}>
              {value}
            </div>
            <div className="mt-1 text-sm text-slate-500">{label}</div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Spend summary row for the buyer dashboard. Shows credit balance, monthly spend,
 * and lifetime spend as three stat cards.
 *
 * @example
 * <SpendSummary balanceCredits={1500} monthSpendCredits={500} totalSpendCredits={2000} />
 */
export function SpendSummary({
  balanceCredits,
  monthSpendCredits,
  totalSpendCredits,
  isLoading = false,
}: SpendSummaryProps): React.JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Credit Balance"
        value={balanceCredits !== undefined ? formatCredits(balanceCredits) : "0 Cr"}
        isLoading={isLoading}
        highlight
      />
      <StatCard
        label="Spent This Month"
        value={monthSpendCredits !== undefined ? formatCredits(monthSpendCredits) : "0 Cr"}
        isLoading={isLoading}
      />
      <StatCard
        label="Total Spend"
        value={totalSpendCredits !== undefined ? formatCredits(totalSpendCredits) : "0 Cr"}
        isLoading={isLoading}
      />
    </div>
  );
}
