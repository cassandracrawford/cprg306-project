"use client";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import Timeline from "./itineraryTimeline";

export default function ItineraryList({ trips }) {
  const [openTrip, setOpenTrip] = useState(null);
  const [list, setList] = useState(trips);

  // keep local list synced with prop
  useEffect(() => setList(trips), [trips]);

  function toggle(id) {
    setOpenTrip((cur) => (String(cur) === String(id) ? null : id));
  }

  // child calls this with the deleted id
  function handleDeletedTrip(id) {
    setList((prev) => prev.filter((t) => String(t.id) !== String(id)));
    setOpenTrip((cur) => (String(cur) === String(id) ? null : cur));
  }

  return (
    <ul className="space-y-3 p-6">
      {list.map((t) => {
        const open = String(openTrip) === String(t.id);
        return (
          <li key={t.id} className="rounded border border-dashed p-6 bg-white">
            <div
              role="button"
              tabIndex={0}
              aria-expanded={open}
              onClick={() => toggle(t.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle(t.id)}
              className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none focus:outline-none"
            >
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs text-gray-500">
                  {t.start_date} — {t.end_date}
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </div>

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
