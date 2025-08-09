import { supabase } from "./supabaseClient";

// Sign up with email and password
export async function signUp(email, password) {
  const emailRedirectTo = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/my-itineraries`
    : "http://localhost:3000/my-itineraries";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo },
  });

  return { data, error }; // data.session will be null when confirm email is ON
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const friendly = /confirm/i.test(error.message)
      ? "Please confirm your email first. Check your inbox (and spam)."
      : error.message;
    return { data: null, error: { ...error, message: friendly } };
  }
  return { data, error: null };
}
// Send password reset email

// Google OAuth Login
export async function googleSignIn() {
  const redirectTo = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    : `${window.location.origin}/auth/callback`;

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
}

// Sign out
export async function signOut() {
  return await supabase.auth.signOut();
}
