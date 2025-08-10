import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/server";

export async function POST(req) {
  try {
    // parse and normalize inputs
    const { title, start_date, end_date, country_iso2, notes } =
      await req.json();
    if (!title || !start_date || !end_date || !country_iso2) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const iso2 = String(country_iso2).trim().toUpperCase();
    const safeTitle = String(title).trim();

    // Server-side Supabase client bound to request cookies
    const supabase = await createSupabaseServer();

    // Require an authenticated user
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr) throw userErr;
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // Insert itinerary into the database (RLS enabled in Supabase)
    const { data, error } = await supabase
      .from("itineraries")
      .insert({
        user_id: user.id,
        country_iso2: iso2,
        title: safeTitle,
        start_date,
        end_date,
        notes,
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
