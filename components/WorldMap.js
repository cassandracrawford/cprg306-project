"use client";
import { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import LoaderReveal from "@/components/loading";
import { signOut } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import countries from "i18n-iso-countries";
import { supabase } from "@/utils/supabaseClient";
import wc from "world-countries";

import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);
const norm = (s) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ \(.*\)$/, "")
    .trim();

// Fallback for selectedCountry
const specialISO2 = {
  "United States of America": "US",
  "United Kingdom": "GB",
  "Congo (Kinshasa)": "CD",
  "Congo (Brazzaville)": "CG",
  "Côte d’Ivoire": "CI",
  "Cote d'Ivoire": "CI",
  "Czech Republic": "CZ", // sometimes "Czechia"
  Eswatini: "SZ",
  "North Macedonia": "MK",
  Myanmar: "MM",
  "Timor-Leste": "TL",
};

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const coordsMap = wc.reduce((acc, country) => {
  acc[country.cca2.toUpperCase()] = [country.latlng[1], country.latlng[0]];
  return acc;
}, {});

export default function WorldMap() {
  const [isoSet, setIsoSet] = useState(new Set());
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const router = useRouter();

  // Animation to load only for large screens
  useEffect(() => {
    const checkScreen = () => {
      setIsLargeScreen(window.innerWidth >= 1500);
    };

    checkScreen();
    setIsReady(true);
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("itineraries")
        .select("country_iso2")
        .not("country_iso2", "is", null);

      if (error) {
        console.error(error.message);
        return;
      }

      const unique = new Set(
        (data ?? [])
          .map((r) => (r.country_iso2 || "").trim().toUpperCase())
          .filter(Boolean)
      );
      setIsoSet(unique);
    })();
  }, []);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.log("Error: ", error.message);
      return;
    }

    router.push("/");
  };

  if (!isReady) return null;

  const content = (
    <div className="h-full bg-gray-50">
      <div className="flex justify-center items-center">
        <ComposableMap
          projectionConfig={{ scale: 150, center: [5, -30] }}
          style={{
            width: "100%",
            height: "90%",
          }}
          viewBox="90 0 670 400"
          preserveAspectRatio="xMidYMid meet"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isSelected = selectedCountry === geo.properties.name;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      const raw = geo.properties.name; // from world-atlas
                      const name = norm(raw);
                      const iso2 =
                        countries.getAlpha2Code(name, "en") ||
                        specialISO2[raw] ||
                        specialISO2[name] ||
                        null;

                      setSelectedCountry(raw);

                      if (iso2) {
                        router.push(`/country/${iso2}`);
                      } else {
                        console.warn("No ISO2 for:", raw);
                      }
                    }}
                    style={{
                      default: {
                        fill: isSelected ? "#facc15" : "#0d1c24",
                        outline: "none",
                      },
                      hover: {
                        fill: "#facc15",
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: { fill: "#facc15", outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {Array.from(isoSet).map((iso2) => {
            const coords = coordsMap[iso2];
            console.log("render pin for", iso2, "->", coords);
            if (!coords) return null;
            return (
              <Marker key={iso2} coordinates={coords}>
                <circle r={4} fill="#facc15" stroke="#fff" strokeWidth={1.5} />
              </Marker>
            );
          })}
        </ComposableMap>

        {/* FAB - Search Destinations */}
        <button
          onClick={() => router.push("/search-page")}
          className="fixed right-10 top-6 bg-[#0d1c24] rounded-full p-4 hover:bg-slate-700 shadow-lg transition duration-500 hover:cursor-pointer"
          aria-label="Search Destinations"
        >
          <Search className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Logout Button */}
      <div className="flex justify-center items-center my-2">
        <button
          type="button"
          onClick={handleLogout}
          className="text-[#0d1c24] font-bold hover:cursor-pointer underline hover:text-[#6B7E80]"
        >
          Logout
        </button>
      </div>
    </div>
  );
  return isLargeScreen ? <LoaderReveal>{content}</LoaderReveal> : content;
}
