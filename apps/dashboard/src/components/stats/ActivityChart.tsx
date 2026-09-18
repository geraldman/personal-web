"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ActivityChartProps {
  data: { bucket_start: string; count: number }[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="bucket_start" stroke="var(--color-text-secondary)" fontSize={12} />
        <YAxis allowDecimals={false} stroke="var(--color-text-secondary)" fontSize={12} />
        <Tooltip
          contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        />
        <Bar dataKey="count" fill="var(--color-accent)" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
