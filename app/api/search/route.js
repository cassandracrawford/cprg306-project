// Server route to find places near a given location using Geoapify API (geocoding + city search)
import { NextResponse } from "next/server";

// Sever-only API key (uses geoapify token to geocode and search places)
const key = process.env.GEOAPIFY_SERVER_KEY;

// Maps UI filter to Geoapify category strings
const MAP = {
  travel: "tourism",
  food: "catering.restaurant,catering.cafe",
  party: "entertainment.nightclub,entertainment.bar",
  adventure: "leisure.park,entertainment.theme_park",
};

// Converts Geoapify category strings to human-readable format
function humanize(cat) {
  return cat.replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Picks the best category from a list of Geoapify categories
function pickBestCategory(cats = []) {
  if (!cats.length) return "Other";
  // Preferred categories in order of priority
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

  // Otherwise, choose the first category that isn't too generic
  const generic = new Set(["building", "amenity", "address", "shop"]);
  const nonGeneric = cats.find((c) => !generic.has(c));
  return humanize(nonGeneric || cats[0]);
}

export async function GET(req) {
  try {
    if (!key) {
      return NextResponse.json(
        { error: "Server API key not configured" },
        { status: 500 }
      );
    }

    // Extract query parameters (q = location, i = interest)
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const rawInterest = (searchParams.get("i") || "").trim();

    if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

    // Use matching category set from MAP ro default to a broad set
    const interestKey = Object.prototype.hasOwnProperty.call(MAP, rawInterest)
      ? rawInterest
      : "";
    const categories = interestKey
      ? MAP[interestKey]
      : "tourism,leisure,catering,entertainment";

    // Geocode the location name to get coordinates
    const geocodeURL = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
      q
    )}&limit=1&apiKey=${key}`;

    const geoRes = await fetch(geocodeURL, { cache: "no-store" });
    if (!geoRes.ok) {
      return NextResponse.json(
        { error: `Geocode failed (${geoRes.status})` },
        { status: 502 }
      );
    }
    const geo = await geoRes.json();
    const hit = geo?.features?.[0];
    if (!hit) return NextResponse.json({ center: {}, results: [] });

    const [lon, lat] = hit.geometry.coordinates; // Note: [lon, lat]

    // Search for places near the coordinates
    const baseUrl = new URL("https://api.geoapify.com/v2/places");
    baseUrl.searchParams.set("categories", categories);
    baseUrl.searchParams.set("filter", `circle:${lon},${lat},10000`); // 10km radius
    baseUrl.searchParams.set("limit", "30");
    baseUrl.searchParams.set("apiKey", key);

    const placesRes = await fetch(baseUrl.toString(), { cache: "no-store" });
    if (!placesRes.ok) {
      return NextResponse.json(
        { error: `Places failed (${placesRes.status})` },
        { status: 502 }
      );
    }
    const places = await placesRes.json();

    let features = places?.features || [];

    // Fallback if no results found for chosen category; tourism will be used
    if (!features.length && categories !== "tourism") {
      const fb = new URL("https://api.geoapify.com/v2/places");
      fb.searchParams.set("categories", "tourism");
      fb.searchParams.set("filter", `circle:${lon},${lat},10000`);
      fb.searchParams.set("limit", "30");
      fb.searchParams.set("apiKey", key);
      const fbRes = await fetch(fb.toString(), { cache: "no-store" });
      if (fbRes.ok) {
        const fbJson = await fbRes.json();
        features = fbJson?.features || [];
      }
    }

    // Map features to results list
    const results = features.map((f) => {
      const cats = f.properties.categories || [];
      return {
        id: f.properties.place_id,
        name:
          f.properties.name || f.properties.address_line1 || "Unnamed place",
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
