"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function AddItemModal({
  itineraryDayId,
  open,
  onClose,
  onAdded,
}) {
  const [time, setTime] = useState("");
  const [activity, setActivity] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");

  // Reset fields whenever the modal opens (optional but nice UX)
  useEffect(() => {
    if (open) {
      setTime("");
      setActivity("");
      setLocation("");
      setNotes("");
      setCost("");
    }
  }, [open]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();

    if (!itineraryDayId) {
      alert("Missing day id.");
      return;
    }

    // Trim activity so whitespace-only doesn't pass required check
    const activityTrimmed = activity.trim();
    if (!activityTrimmed) {
      alert("Activity is required.");
      return;
    }

    // Convert cost string to number or null
    const parsedCost = cost === "" ? null : Number(cost);
    const safeCost =
      Number.isFinite(parsedCost) && parsedCost >= 0 ? parsedCost : null;

    // currency omitted – Supabase default ('CAD') will be used
    try {
      const { error } = await supabase.from("itinerary_items").insert({
        itinerary_day_id: itineraryDayId,
        time: time || null,
        activity: activityTrimmed,
        location: location || null,
        notes: notes || null,
        cost: safeCost,
      });

      if (error) return alert(error.message);

      onClose();
      onAdded?.();
    } catch (error) {
      alert(error?.message || "Failed to add item.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-5 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Add item</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500"
          >
            Close
          </button>
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
              placeholder="e.g., Hiking"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Location (optional)</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Banff"
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
                inputMode="decimal"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0d1c24] text-white rounded py-2"
          >
            Save item
          </button>
        </form>
      </div>
    </div>
  );
}
