"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DifficultyChartProps {
  // Includes an explicit "Unranked" bucket — never dropped silently. See stats/page.tsx for
  // why this is assembled client-side from two queries instead of one RPC result.
  data: { label: string; count: number }[];
}

export function DifficultyChart({ data }: DifficultyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" stroke="var(--color-text-secondary)" fontSize={12} />
        <YAxis allowDecimals={false} stroke="var(--color-text-secondary)" fontSize={12} />
        <Tooltip
          contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        />
        <Bar dataKey="count" fill="var(--color-accent)" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
