"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface TagChartProps {
  data: { tag: string; count: number }[];
}

export function TagChart({ data }: TagChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid stroke="var(--color-border)" horizontal={false} />
        <XAxis type="number" allowDecimals={false} stroke="var(--color-text-secondary)" fontSize={12} />
        <YAxis type="category" dataKey="tag" width={100} stroke="var(--color-text-secondary)" fontSize={12} />
        <Tooltip
          contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        />
        <Bar dataKey="count" fill="var(--color-accent)" radius={[0, 2, 2, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
