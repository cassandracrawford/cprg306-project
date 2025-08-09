"use client";
import { useEffect, useState } from "react"; // ⬅ add useEffect
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AddDayModal({ itineraryId, open, onClose, defaultDayNumber = 1, onAdded }) {
  const [dayNumber, setDayNumber] = useState(defaultDayNumber);
  const [date, setDate] = useState("");

  // 🔁 keep defaultDayNumber in sync when opening
  useEffect(() => {
    if (open) setDayNumber(defaultDayNumber || 1);
    console.log("[AddDayModal] itineraryId:", itineraryId);
  }, [open, itineraryId, defaultDayNumber]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    const { error } = await supabase
      .from("itinerary_day")
      .insert({ itinerary_id: itineraryId, day_index: dayNumber, date: date || null });
    if (error) return alert(error.message);
    onClose(); onAdded?.();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-5 rounded-xl w-full max-w-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Add day</h3>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Day number</label>
            <input
              type="number" min={1}
              className="w-full border rounded px-3 py-2"
              value={dayNumber}
              onChange={(e) => setDayNumber(+e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Date (optional)</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button className="w-full bg-[#0d1c24] text-white rounded py-2">Save</button>
        </form>
      </div>
    </div>
  );
}
