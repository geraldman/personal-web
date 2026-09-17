"use client";

import { createClient } from "@/lib/supabase/client";

export function LoginButton() {
  async function handleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      className="min-h-[44px] rounded-md bg-[var(--color-accent)] px-6 text-sm font-medium text-[var(--color-bg)]"
    >
      Sign in with GitHub
    </button>
  );
}
