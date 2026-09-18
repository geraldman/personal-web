import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/supabase/owner";
import { Sidebar } from "@/components/layout/Sidebar";
import { getKinds } from "@/lib/kinds";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isOwner(user)) {
    redirect("/auth/login");
  }

  // The sidebar's tracker links come from record_kinds so a newly seeded kind is reachable
  // without a frontend change.
  const kinds = await getKinds();

  return (
    <div className="flex min-h-full">
      <Sidebar kinds={kinds.map(({ slug, plural_name }) => ({ slug, plural_name }))} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
