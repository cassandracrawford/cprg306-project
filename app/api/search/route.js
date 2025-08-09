// app/api/search/route.js
import { NextResponse } from "next/server";

const key = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

// Broad-but-relevant mappings (you can tighten later)
const MAP = {
  travel: "tourism",                              // landmarks, museums, sights
  food: "catering.restaurant,catering.cafe",      // places to eat
  party: "entertainment.nightclub,entertainment.bar",
  adventure: "leisure.park,outdoor,entertainment.theme_park",
};

function humanize(cat) {
  return cat
    .replace(/\./g, " ")                 // "catering.restaurant" -> "catering restaurant"
    .replace(/\b\w/g, (c) => c.toUpperCase()); // -> "Catering Restaurant"
}

function pickBestCategory(cats = []) {
  if (!cats.length) return "Other";

  // Prefer useful, specific categories when present
  const preferred = [
    "catering.restaurant",
    "catering.cafe",
    "entertainment.nightclub",
    "entertainment.bar",
    "tourism.museum",
    "tourism.attraction",
    "tourism.sights",
    "leisure.park",
    "entertainment.theme_park",
  ];
  for (const p of preferred) if (cats.includes(p)) return humanize(p);

  // Otherwise pick the first non-generic tag
  const generic = new Set(["building", "amenity", "address", "shop"]);
  const nonGeneric = cats.find((c) => !generic.has(c));
  return humanize(nonGeneric || cats[0]);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");           // city or place text
    const interest = searchParams.get("i");    // food | party | travel | adventure

    if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

    // 1) Geocode the location to get center coords
    const geocodeURL = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
      q
    )}&limit=1&apiKey=${key}`;

    const geoRes = await fetch(geocodeURL);
    const geo = await geoRes.json();
    const hit = geo?.features?.[0];
    if (!hit) return NextResponse.json({ center: {}, results: [] });

    const [lon, lat] = hit.geometry.coordinates; // Geoapify order: [lon, lat]

    // 2) Places near that center
    const placesUrl = new URL("https://api.geoapify.com/v2/places");
    const cats = MAP[interest] || "tourism,leisure,catering,entertainment"; // broad fallback
    placesUrl.searchParams.set("categories", cats);
    placesUrl.searchParams.set("filter", `circle:${lon},${lat},5000`); // 5km radius
    placesUrl.searchParams.set("limit", "30");
    placesUrl.searchParams.set("apiKey", key);

    const placesRes = await fetch(placesUrl.toString());
    const places = await placesRes.json();

    // If nothing came back, try a very broad fallback (tourism only)
    let features = places?.features || [];
    if (!features.length && cats !== "tourism") {
      const fallbackUrl = new URL("https://api.geoapify.com/v2/places");
      fallbackUrl.searchParams.set("categories", "tourism");
      fallbackUrl.searchParams.set("filter", `circle:${lon},${lat},5000`);
      fallbackUrl.searchParams.set("limit", "30");
      fallbackUrl.searchParams.set("apiKey", key);
      const fb = await fetch(fallbackUrl.toString());
      const fbJson = await fb.json();
      features = fbJson?.features || [];
    }

    const results = features.map((f) => {
      const cats = f.properties.categories || [];
      return {
        id: f.properties.place_id,
        name: f.properties.name || f.properties.address_line1 || "Unnamed place",
        category: pickBestCategory(cats),
        lon: f.properties.lon,
        lat: f.properties.lat,
        address: f.properties.formatted,
      };
    });

    return NextResponse.json({ center: { lat, lon }, results });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
