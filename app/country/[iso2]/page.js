import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import { createSupabaseServer } from "@/utils/server";
import Link from "next/link";
import AddItineraryClient from "@/components/addItinieraryClient";
import { signOut } from "@/utils/auth";
import LogoutButton from "@/components/logoutButton";
import ItineraryList from "@/components/itinenararyList";

countries.registerLocale(en);

export default async function CountryPage(props) {
  const { iso2: raw } = await props.params;
  const iso2 = String(raw || "").toUpperCase();
  const countryName = countries.getName(iso2, "en") || iso2;

  const supabase = await createSupabaseServer();

  // check logged in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // if not logged in
  if (!user) {
    return (
      <div className="w-full px-10 py-6 lg:w-3/4 mx-auto">
        <div className="flex items-center justify-between p-6">
          <h1 className="text-6xl text-[#0d1c24]">{countryName}</h1>
          <Link
            href="/"
            className="px-3 py-2 rounded bg-[#0d1c24] text-white text-sm"
          >
            Sign in
          </Link>
        </div>
        <p className="text-sm text-gray-500 px-6">
          Please sign in to view and create itineraries for {countryName}.
        </p>
      </div>
    );
  }

  // fetch itineraries for this user and country
  const { data: trips, error } = await supabase
    .from("itineraries")
    .select("id, title, start_date, end_date")
    .eq("user_id", user.id)
    .eq("country_iso2", iso2)
    .order("start_date", { ascending: false });

  if (error) {
    return (
      <div className="w-full px-10 py-6 lg:w-3/4 mx-auto">
        <h1 className="text-6xl text-[#0d1c24] p-6">{countryName}</h1>
        <p className="text-sm text-red-600 px-6">
          Failed to load: {error.message}
        </p>
      </div>
    );
  }

  const hasTrips = trips?.length > 0;

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.log("Error: ", error.message);
      return;
    }

    router.push("/");
  };

  return (
    <div className="w-full px-10 py-6 lg:w-[60%] mx-auto">
      <div className="flex flex-col lg:flex-row md:justify-between p-6">
        <h1 className="text-6xl country-heading text-[#0d1c24]">
          {countryName}
        </h1>
        {/* Menu */}
        <div className="flex lg:items-center">
          <ul className="flex flex-row gap-4 my-4 lg:m-0">
            <li className="border-r-2 pr-4 underline">
              <AddItineraryClient iso2={iso2} />
            </li>
            <li className="border-r-2 pr-4 underline">
              <Link href="/my-itineraries">View Itineraries</Link>
            </li>
            <li className="border-r-2 pr-4 underline">
              <Link href="/search-page">Search Cities</Link>
            </li>
            <li className="underline">
              <LogoutButton />
            </li>
          </ul>
        </div>
      </div>
      {hasTrips ? (
        <ItineraryList trips={trips} />
      ) : (
        // If no itineraries, a message is displayed
        <div className="p-6">
          <div className="rounded border border-dashed p-6 bg-white">
            <p className="text-sm text-gray-600">
              You don’t have any itineraries for <strong>{countryName}</strong>{" "}
              yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
