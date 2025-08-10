// Renders the home page after logged-in - shows the world map to view itineraries
// Uses the server-side Supabase client to read session from cookies
// If not authenticated or email confirmed, will not render
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/utils/server";
import WorldMap from "@/components/WorldMap";

export default async function MyItinerariesPage() {
  // Create Supabase server client
  const supabase = await createSupabaseServer();

  // Read current user from server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/?auth=required"); // not logged in
  if (!(user.email_confirmed_at || user.confirmed_at))
    redirect("/verify-email"); // email not confirmed

  // Auth OK and renders the app content
  return <WorldMap />;
}
