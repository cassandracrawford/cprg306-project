"use client";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import Timeline from "./itineraryTimeline";

export default function ItineraryList({ trips = [] }) {
  // State to manage which trip is currently open
  const [openTrip, setOpenTrip] = useState(null);
  // State to manage the list of trips and deleted itinerary
  const [list, setList] = useState(trips);

  // keep local list in sync when parent prop changes
  useEffect(() => setList(trips), [trips]);

  // Toggle accordion for a given trip id
  function toggle(id) {
    const key = String(id);
    setOpenTrip((cur) => (String(cur) === key ? null : key));
  }

  // Child callback to remove deleted trip from local list
  function handleDeletedTrip(id) {
    const key = String(id);
    setList((prev) => prev.filter((t) => String(t.id) !== key));
    setOpenTrip((cur) => (String(cur) === key ? null : cur));
  }

  // Render the list of itineraries
  return (
    <ul className="space-y-3 p-6">
      {list.map((t) => {
        const key = String(t.id);
        const open = String(openTrip) === key;
        return (
          <li key={key} className="rounded border border-dashed p-6 bg-white">
            {/* Displays the Title and Dates (header) */}
            <div
              role="button"
              tabIndex={0}
              aria-expanded={open}
              onClick={() => toggle(key)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && toggle(t.id)
              }
              className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none focus:outline-none"
            >
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs text-gray-500">
                  {t.start_date} — {t.end_date}
                </div>
                {/* Show notes if present */}
                {t.notes && (
                  <div className="mt-1 text-sm text-gray-700">{t.notes}</div>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Details - to show the itinerary timeline */}
            {open && (
              <div className="px-4 pb-4">
                <Timeline tripId={t.id} onDeleted={handleDeletedTrip} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
