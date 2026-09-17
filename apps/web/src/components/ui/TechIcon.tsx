import { techIcons } from "@/lib/techIcons";

interface TechIconProps {
  name: string;
}

export function TechIcon({ name }: TechIconProps) {
  const entry = techIcons[name.toLowerCase()];

  if (!entry) {
    return (
      <span className="rounded-full border border-[var(--color-border)] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)]">
        {name}
      </span>
    );
  }

  const Icon = entry.icon;

  return (
    <span
      title={entry.label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors duration-200 hover:border-[var(--color-border-hover)]"
    >
      <Icon size={15} style={{ color: entry.color }} />
    </span>
  );
}
