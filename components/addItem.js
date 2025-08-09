"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AddItemModal({ itineraryDayId, open, onClose, onAdded }) {
  const [time, setTime] = useState("");
  const [activity, setActivity] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();

    // currency omitted – Supabase default ('CAD') will be used
    const { error } = await supabase.from("itinerary_items").insert({
      itinerary_day_id: itineraryDayId,
      time: time || null,
      activity,
      location: location || null,
      notes: notes || null,
      cost: cost ? Number(cost) : null,
    });

    if (error) return alert(error.message);

    setTime("");
    setActivity("");
    setLocation("");
    setNotes("");
    setCost("");

    onClose();
    onAdded?.();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-5 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Add item</h3>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Time (optional)</label>
            <input
              type="time"
              className="w-full border rounded px-3 py-2"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Activity</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              required
              placeholder="Victoria Peak"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Location (optional)</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Hong Kong"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Notes (optional)</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any details…"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Cost (CAD, optional)</label>
            <div className="flex items-center border rounded px-2 py-2">
              <span className="text-gray-500 mr-1">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full outline-none"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <button className="w-full bg-[#0d1c24] text-white rounded py-2">
            Save item
          </button>
        </form>
      </div>
    </div>
  );
}
