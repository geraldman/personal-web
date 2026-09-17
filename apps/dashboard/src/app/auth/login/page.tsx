import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/supabase/owner";
import { LoginButton } from "./LoginButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && isOwner(user)) {
    redirect("/entries");
  }

  const { error } = await searchParams;

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Dashboard</h1>
      {error === "not_authorized" && (
        <p className="max-w-sm text-sm text-[var(--color-danger)]">
          That GitHub account is not authorized to access this dashboard.
        </p>
      )}
      <LoginButton />
    </div>
  );
}
