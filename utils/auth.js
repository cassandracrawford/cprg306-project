"use client";

// For browser-only: client-side auth helpers using Supabase client
// for Sign Up/Sign In using email and password,
// for Google Oath Sign-in
// for Sign Out
import { supabase } from "./supabaseClient";

// Sign up with email and password
export async function signUp(email, password) {
  try {
    const emailRedirectTo = process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/my-itineraries`
      : "http://localhost:3000/my-itineraries";

    const { data, error } = await supabase.auth.signUp({
      email: String(email || "")
        .trim()
        .toLowerCase(),
      password,
      options: { emailRedirectTo },
    });

    return { data, error: error ?? null };
  } catch (error) {
    return { data: null, error: { message: String(error?.message || error) } };
  }
}

// Sign in with email and password
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email || "")
        .trim()
        .toLowerCase(),
      password,
    });

    if (error) {
      const friendly = /confirm/i.test(error.message)
        ? "Please confirm your email first. Check your inbox."
        : error.message;
      return { data: null, error: { ...error, message: friendly } };
    }
    return { data, error: null };
  } catch (error) {
    return { data: null, error: { message: String(error?.message || error) } };
  }
}

// Google OAuth Login
export async function googleSignIn() {
  try {
    const redirectTo = process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      : `${window.location.origin}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    return { data, error: error ?? null };
  } catch (error) {
    return { data: null, error: { message: String(error?.message || error) } };
  }
}

// Sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error ?? null };
  } catch (error) {
    return { error: { message: String(error?.message || error) } };
  }
}

// Send Password Reset - for future development
