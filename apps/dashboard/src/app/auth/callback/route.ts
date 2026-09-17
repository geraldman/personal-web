import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/supabase/owner";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=not_authorized`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/auth/login?error=not_authorized`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isOwner(user)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/auth/login?error=not_authorized`);
  }

  return NextResponse.redirect(`${origin}/entries`);
}
