// OAuth callback: route to handle the OAuth sign-in process
// receives the authentication response, creates Supabase session
// then redirects the user to /my-itineraries used by utils/auth.googleSignIn();
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

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
