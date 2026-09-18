import Link from "next/link";
import { getKinds } from "@/lib/kinds";

// The tracker index. Every kind is a row in record_kinds, so this list grows when a kind is
// added -- no route, no code.

export default async function RecordsIndexPage() {
  const kinds = await getKinds();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Trackers</h1>

      <ul className="grid gap-3 sm:grid-cols-2">
        {kinds.map((kind) => (
          <li key={kind.id}>
            <Link
              href={`/records/${kind.slug}`}
              className="flex min-h-[44px] flex-col gap-1 rounded-md border border-[var(--color-border)] p-4 hover:border-[var(--color-border-strong)]"
            >
              <span className="text-[var(--color-text-primary)]">{kind.plural_name}</span>
              <span className="text-xs text-[var(--color-text-tertiary)]">
                {kind.capabilities.includes("public") ? "can publish" : "private"}
                {" · "}
                {kind.field_schema.length} field{kind.field_schema.length === 1 ? "" : "s"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
