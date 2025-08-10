// This helper create a Supabase client that can be used
// in Next.js Server  components to read the current authenticated
// user/session on the server side. 
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createSupabaseServer() {
  // Access cookies from the current request
  const cookieStore = await cookies();

  // Create and return a Supabase client with read-only access to cookies
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // for supabase to read session data
        getAll() {
          return cookieStore.getAll();
        },
        // cannot write cookies from a server component
        setAll() {},
      },
    }
  );
}
