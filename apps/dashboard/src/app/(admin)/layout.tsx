import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/supabase/owner";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isOwner(user)) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-full">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
