import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  // prepare the redirect response FIRST, so we can set cookies on it
  const redirectUrl = new URL("/my-itineraries", url.origin);
  const res = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const back = new URL("/", url);
      back.searchParams.set("oauth_error", error.message);
      return NextResponse.redirect(back);
    }
  }

  return res;
}
