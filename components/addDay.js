"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function AddDayModal({
  itineraryId,
  open,
  onClose,
  defaultDayNumber = 1,
  onAdded,
}) {
  const [dayNumber, setDayNumber] = useState(defaultDayNumber);
  const [date, setDate] = useState("");

  // Reset form fields when modal opens
  useEffect(() => {
    if (open) {
      setDayNumber(defaultDayNumber || 1);
      setDate("");
    }
  }, [open, itineraryId, defaultDayNumber]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();

    // Make sure a valid positive number even if the input is temporarily empty
    const safeDay = Math.max(1, Number.isFinite(dayNumber) ? dayNumber : 1);

    try {
      const { error } = await supabase.from("itinerary_day").insert({
        itinerary_id: itineraryId,
        day_index: safeDay,
        date: date || null,
      });

      if (error) {
        const msg = /unique|duplicate/i.test(error.message)
          ? "That day number already exists for this itinerary."
          : error.message;
        alert(msg);
        return;
      }

      onClose();
      onAdded?.();
    } catch (error) {
      alert(error?.message || "Failed to add day.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-5 rounded-xl w-full max-w-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Add day</h3>
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
            <label className="block text-sm mb-1">Day number</label>
            <input
              type="number"
              min={1}
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
          <button
            type="submit"
            className="w-full bg-[#0d1c24] text-white rounded py-2"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
