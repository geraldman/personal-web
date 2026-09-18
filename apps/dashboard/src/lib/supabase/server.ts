import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@db/database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component that can't write cookies — the proxy
            // handles session refresh on the request/response path instead.
          }
        },
      },
    },
  );
}

// Every auth.getUser() call is a round trip to the Supabase auth server (it revalidates the JWT,
// unlike getSession() which only decodes it locally) -- expensive to pay for twice in one render.
// cache() dedupes it across the (admin) layout and any page nested inside it. It does NOT dedupe
// the proxy middleware's own getUser() call, which runs in a separate request context and is
// still required there to refresh the session cookie -- see middleware.ts.
export const getAuthedUser = cache(async () => {
  const supabase = await createClient();
  return supabase.auth.getUser();
});
