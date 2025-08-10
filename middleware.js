// Middleware to protect authenticated routes in the app.
// This restricts access to specific pages and API routes for unauthenticated users by
// blocking unconfirmed emails and redirecting the pages if accessed the URL directly
// back to login page if not logged in.
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// List of patterns for pages or routes that need protection (login required)
const PROTECTED_PATTERNS = [
  /^\/my-itineraries(\/|$)/,
  /^\/country(\/|$)/,
  /^\/search-page(\/|$)/,
];

export async function middleware(req) {
  const res = NextResponse.next();

  // Create Supabase server client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      // Uses Supabase cookies to manage user sessions
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          ),
      },
    }
  );

  // Get the current user's session
  const { pathname } = req.nextUrl;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if the user is on the Login Page or a Protected Route
  const isLoginPage = pathname === "/";
  const isApi = pathname.startsWith("/api/");
  const isProtected =
    PROTECTED_PATTERNS.some((re) => re.test(pathname)) ||
    pathname.startsWith("/api/itineraries") ||
    pathname.startsWith("/api/search");

  // Block if user is not logged in and trying to access protected route
  if (isProtected && !user) {
    if (isApi) {
      // For API calls, return 401 JSON instead of redirecting
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
    const url = new URL("/", req.url);
    url.searchParams.set("auth", "required");
    return NextResponse.redirect(url);
  }

  // Block unconfirmed users from protected pages
  if (isProtected && user && !(user.email_confirmed_at || user.confirmed_at)) {
    if (isApi) {
      return new NextResponse(
        JSON.stringify({ error: "Email not confirmed" }),
        {
          status: 403,
          headers: { "content-type": "application/json" },
        }
      );
    }
    return NextResponse.redirect(new URL("/verify-email", req.url));
  }

  // Redirect logged-in users immediately to my-itineraries page (if trying to access login page)
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL("/my-itineraries", req.url));
  }

  return res;
}

export const config = {
  // Match all paths that need authentication 
  matcher: [
    "/",
    "/my-itineraries/:path*",
    "/country/:path*",
    "/search-page",
    "/api/itineraries/:path*",
    "/api/search/:path*",
  ],
};
