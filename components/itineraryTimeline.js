// components/itineraryTimeline.js
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import AddDayModal from "./addDay";
import AddItemModal from "./addItem";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Timeline({ tripId, onDeleted }) {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState([]); // [{id, day_index, date, items: [...] }]
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [addDayOpen, setAddDayOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(null); // itinerary_day.id to add into

  // Fetch itinerary days + items
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: dayRows, error: dErr } = await supabase
        .from("itinerary_day")
        .select("id, day_index, date")
        .eq("itinerary_id", tripId)
        .order("day_index", { ascending: true });
      if (dErr) throw dErr;

      const dayIds = (dayRows ?? []).map((d) => d.id);

      let itemsByDay = {};
      if (dayIds.length) {
        const { data: itemRows, error: iErr } = await supabase
          .from("itinerary_items")
          .select("id, itinerary_day_id, time, activity, location, notes, cost")
          .in("itinerary_day_id", dayIds)
          .order("time", { ascending: true });
        if (iErr) throw iErr;

        (itemRows ?? []).forEach((it) => {
          (itemsByDay[it.itinerary_day_id] ||= []).push(it);
        });
      }

      const enriched =
        (dayRows ?? []).map((d) => ({ ...d, items: itemsByDay[d.id] || [] })) ||
        [];

      setDays(enriched);
      if (!selectedDayId && enriched.length) {
        setSelectedDayId(enriched[0].id);
      }

      return enriched;
    } catch (e) {
      console.warn("[timeline] fetch error:", e?.message || e);
      setDays([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [tripId, selectedDayId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Next day number helper
  const nextDayIndex =
    (days.length ? Math.max(...days.map((d) => Number(d.day_index) || 0)) : 0) +
    1;

  const selectedDay = useMemo(
    () => days.find((d) => d.id === selectedDayId) || null,
    [days, selectedDayId]
  );

  // Total cost across the WHOLE itinerary (all days)
  const totalCostCAD = useMemo(() => {
    const total = days.reduce(
      (sum, d) =>
        sum + d.items.reduce((s, it) => s + (Number(it.cost) || 0), 0),
      0
    );
    return total;
  }, [days]);

  // Delete a single item (X button)
  async function handleDeleteItem(itemId) {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase
      .from("itinerary_items")
      .delete()
      .eq("id", itemId);
    if (error) return alert(error.message);
    fetchData();
  }

  // Delete the entire itinerary (text button at the bottom)
  async function handleDeleteItinerary() {
    if (!confirm("Delete this itinerary and all of its days and items?"))
      return;

    // If you have ON DELETE CASCADE on itinerary_day/itinerary_items, you can just delete the itinerary.
    // Safe fallback that works without CASCADE:
    try {
      // 1) get day ids
      const { data: dayRows, error: dErr } = await supabase
        .from("itinerary_day")
        .select("id")
        .eq("itinerary_id", tripId);
      if (dErr) throw dErr;

      const dayIds = (dayRows ?? []).map((d) => d.id);
      if (dayIds.length) {
        // 2) delete items for those days
        const { error: delItemsErr } = await supabase
          .from("itinerary_items")
          .delete()
          .in("itinerary_day_id", dayIds);
        if (delItemsErr) throw delItemsErr;

        // 3) delete days
        const { error: delDaysErr } = await supabase
          .from("itinerary_day")
          .delete()
          .in("id", dayIds);
        if (delDaysErr) throw delDaysErr;
      }

      // 4) delete itinerary
      const { error: delItineraryErr } = await supabase
        .from("itineraries")
        .delete()
        .eq("id", tripId);
      if (delItineraryErr) throw delItineraryErr;

      // Optional: caller can refresh the parent list
      onDeleted?.(tripId);
    } catch (e) {
      fetchData(); // refresh days
      return alert(e?.message || "Failed to delete itinerary.");
    }
  }

  return (
    <div className="space-y-4">
      {/* Top row: day pills + add day + total cost */}
      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : days.length === 0 ? (
        <div className="text-sm text-gray-600">
          No days yet.{" "}
          <button
            className="underline text-[#0d1c24]"
            onClick={() => setAddDayOpen(true)}
          >
            Add day
          </button>{" "}
          to start.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            {days.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDayId(d.id)}
                className={`px-3 py-1 rounded-full border text-sm ${
                  d.id === selectedDayId
                    ? "bg-[#0d1c24] text-white border-[#0d1c24]"
                    : "bg-white text-[#0d1c24] border-gray-300 hover:bg-gray-50"
                }`}
                title={d.date || ""}
              >
                Day {d.day_index}
              </button>
            ))}
            <button
              onClick={() => setAddDayOpen(true)}
              className="px-3 py-1 rounded-full border text-sm bg-white text-[#0d1c24] border-gray-300 hover:bg-gray-50"
            >
              + Add day
            </button>
          </div>

          <div className="text-sm text-gray-700">
            Total cost:{" "}
            <span className="font-semibold">
              {Number(totalCostCAD).toLocaleString("en-CA", {
                style: "currency",
                currency: "CAD",
              })}
            </span>
          </div>
        </>
      )}

      {/* Items for selected day */}
      {!loading && selectedDay && (
        <div className="mt-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold">
              Day {selectedDay.day_index}
              {selectedDay.date && (
                <span className="ml-2 text-sm text-gray-500">
                  {selectedDay.date}
                </span>
              )}
            </h3>
            <button
              onClick={() => setAddItemOpen(selectedDay.id)}
              className="text-xs underline text-[#0d1c24]"
            >
              + Add item
            </button>
          </div>

          {selectedDay.items.length === 0 ? (
            <p className="text-xs text-gray-500">No items yet.</p>
          ) : (
            <ul className="space-y-2">
              {selectedDay.items.map((it) => (
                <li key={it.id} className="rounded border bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm">
                      {it.time && (
                        <span className="mr-2 text-gray-500 tabular-nums">
                          {it.time}
                        </span>
                      )}
                      <span className="font-medium">{it.activity}</span>
                      {it.location && (
                        <span className="text-gray-600"> — {it.location}</span>
                      )}
                      {(it.notes || it.cost) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {it.notes && <span>{it.notes}</span>}
                          {it.cost ? (
                            <span className="ml-2">
                              {Number(it.cost).toLocaleString("en-CA", {
                                style: "currency",
                                currency: "CAD",
                              })}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* X delete button */}
                    <button
                      onClick={() => handleDeleteItem(it.id)}
                      className="h-6 w-6 grid place-items-center rounded hover:bg-gray-100 text-gray-500"
                      aria-label="Delete item"
                      title="Delete item"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Delete itinerary (text) */}
      {!loading && (
        <div className="pt-2">
          <button
            onClick={handleDeleteItinerary}
            className="text-sm underline text-red-600"
          >
            Delete
          </button>
        </div>
      )}

      {/* Modals */}
      <AddDayModal
        itineraryId={tripId}
        open={addDayOpen}
        onClose={() => setAddDayOpen(false)}
        defaultDayNumber={
          (days.length
            ? Math.max(...days.map((d) => Number(d.day_index) || 0))
            : 0) + 1
        }
        onAdded={async () => {
          const updated = await fetchData();
          if (updated.length) {
            const newest = updated.reduce((a, b) =>
              (Number(a.day_index) || 0) > (Number(b.day_index) || 0) ? a : b
            );
            setSelectedDayId(newest.id);
          }
        }}
      />

      <AddItemModal
        itineraryDayId={addItemOpen}
        open={Boolean(addItemOpen)}
        onClose={() => setAddItemOpen(null)}
        onAdded={fetchData}
      />
    </div>
  );
}
