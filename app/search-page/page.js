"use client";

import { motion } from "framer-motion";
import { CalendarRange } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LandingPage() {
  const [q, setQ] = useState("");
  const [interest, setInterest] = useState(""); // "", "food", "party", "travel", "adventure"
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const router = useRouter();

  const handleSearch = async () => {
    if (!q.trim()) return;
    setHasSearched(true);
    setLoading(true);
    setResults([]);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&i=${interest}`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full p-10 flex justify-center">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex flex-row gap-4 lg:w-[1000px]">
          <h1 className="text-[#0d1c24] font-extrabold text-2xl justify-center items-center leading-[2]">
            Trip|zy
          </h1>
          <div className="flex w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm mr-4">
            <div className="pl-3 pr-1.5 flex items-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="opacity-60"
              >
                <path
                  d="M21 21l-4.3-4.3m1.6-4.3a7 7 0 11-14 0 7 7 0 0114 0z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Where do you want to go? (City)"
              className="flex-1 px-2 py-3 text-sm outline-none"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setHasSearched(false);
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 text-white text-xs font-bold bg-[#0d1c24] hover:bg-[#0b2f3c]"
            >
              {loading ? "..." : "SEARCH"}
            </button>
          </div>
          {/* interest quick select */}
          <select
            className="px-4 text-sm border-l border-gray-200 outline-none"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            title="Interest"
          >
            <option value="">All</option>
            <option value="food">Food</option>
            <option value="party">Party</option>
            <option value="adventure">Adventure</option>
            <option value="travel">Travel</option>
          </select>
        </div>
        {/* results list */}
        <ul className="mt-6 space-y-2">
          {loading && <li className="text-sm text-gray-500">Searching...</li>}
          {!loading && hasSearched && results.length === 0 && q && (
            <li className="text-sm text-gray-500">No results.</li>
          )}
          {results.map((r) => (
            <li
              key={r.id}
              className="p-3 rounded border border-gray-200 bg-white"
            >
              <div className="font-semibold">{r.name || "Unnamed place"}</div>
              <div className="text-xs text-gray-500">{r.address}</div>
              <div className="text-xs text-gray-500">{r.category}</div>
            </li>
          ))}
        </ul>
      </motion.div>
      {/* FAB - My itineraries */}
      <button
        onClick={() => router.push("/my-itineraries")}
        className="fixed right-10 top-6 bg-[#0d1c24] rounded-full p-4 hover:bg-slate-700 shadow-lg transition duration-500 hover:cursor-pointer"
        aria-label="Search Destinations"
      >
        <CalendarRange className="w-7 h-7 text-white" />
      </button>
    </main>
  );
}
