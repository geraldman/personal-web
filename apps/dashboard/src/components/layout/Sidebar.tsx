"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// The per-tracker links are derived from record_kinds, not listed here: naming `ctf` and
// `lfs_build` in this file would mean a tenth kind needs a frontend edit to become reachable,
// which is the hardcoding the record model exists to remove (RECORD-MODEL.md §1).
const NAV_LINKS = [
  { href: "/records", label: "Trackers" },
  { href: "/stats", label: "Stats" },
  { href: "/import", label: "Import" },
  { href: "/settings", label: "Settings" },
];

export interface SidebarKind {
  slug: string;
  plural_name: string;
}

export function Sidebar({ kinds }: { kinds: SidebarKind[] }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 border-r border-[var(--color-border)] p-4">
      <nav className="flex flex-col gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "min-h-[44px] flex items-center rounded-md px-3 text-sm text-[var(--color-text-secondary)]",
              "hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {kinds.length > 0 && (
        <nav className="mt-4 flex flex-col gap-1 border-t border-[var(--color-border)] pt-4">
          {kinds.map((kind) => (
            <Link
              key={kind.slug}
              href={`/records/${kind.slug}`}
              className={cn(
                "min-h-[44px] flex items-center rounded-md px-3 text-sm text-[var(--color-text-tertiary)]",
                "hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]",
              )}
            >
              {kind.plural_name}
            </Link>
          ))}
        </nav>
      )}
      <button
        type="button"
        onClick={handleSignOut}
        className="mt-6 min-h-[44px] w-full rounded-md border border-[var(--color-border)] px-3 text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
      >
        Sign out
      </button>
    </aside>
  );
}
