"use client";

// Modal component for creating a new itinerary

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddItineraryModal({ open, onClose, iso2 }) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");

  const router = useRouter();

  // Reset field whenever modal opens
  useEffect(() => {
    if (open) {
      setTitle("");
      setStart("");
      setEnd("");
      setNotes("");
    }
  }, [open]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();

    // To check date validity
    if (start && end && end < start) {
      alert("End date cannot be earlier than start date.");
      return;
    }

    try {
      const res = await fetch("/api/itineraries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          start_date: start,
          end_date: end,
          country_iso2: iso2,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create itinerary");

      onClose();
      router.refresh(); // refresh the Country page list
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">New itinerary</h2>
          <button type="button" onClick={onClose} className="text-sm text-gray-500">
            Close
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Summer trip"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start date
              </label>
              <input
                type="date"
                className="w-full rounded border px-3 py-2"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End date</label>
              <input
                type="date"
                className="w-full rounded border px-3 py-2"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="(optional)"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-[#0d1c24] py-2 text-white font-semibold hover:bg-[#0b2f3c]"
          >
            Create Itinerary
          </button>
        </form>
      </div>
    </div>
  );
}
