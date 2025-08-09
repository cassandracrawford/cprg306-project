import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req) {
  const res = NextResponse.next();

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;
  const isProtected = pathname.startsWith("/my-itineraries");

  if (isProtected) {
    if (!user) {
      const url = new URL("/", req.url);
      url.searchParams.set("unauthorized", "1");
      return NextResponse.redirect(url);
    }
    // block unconfirmed users too
    const confirmed =
      user.email_confirmed_at || user.confirmed_at;
    if (!confirmed) {
      return NextResponse.redirect(new URL("/verify-email", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/my-itineraries/:path*"],
};
