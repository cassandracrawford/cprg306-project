"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/utils/supabaseClient";
import AddDayModal from "./addDay";
import AddItemModal from "./addItem";
import DeleteConfirmModal from "@/components/deleteConfirmModal";

export default function Timeline({ tripId, onDeleted }) {
  const [loading, setLoading] = useState(true);

  // State to manage list of days - days within the itinerary and selected day
  const [days, setDays] = useState([]);
  const [selectedDayId, setSelectedDayId] = useState(null);

  //  State to manage modals
  const [addDayOpen, setAddDayOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(null);
  const [showDeleteItem, setShowDeleteItem] = useState(null);
  const [showDeleteItinerary, setShowDeleteItinerary] = useState(false);

  // Fetch itinerary days + items for a specific trip
  const fetchData = useCallback(async () => {
    // If tripId is missing, clear UI and stop loading
    if (!tripId) {
      setDays([]);
      setSelectedDayId(null);
      setLoading(false);
      return [];
    }

    setLoading(true);
    try {
      // Fetch days for the trip
      const { data: dayRows, error: dErr } = await supabase
        .from("itinerary_day")
        .select("id, day_index, date")
        .eq("itinerary_id", tripId)
        .order("day_index", { ascending: true });
      if (dErr) throw dErr;

      const dayIds = (dayRows ?? []).map((d) => d.id);

      // Fetch items only if there are days
      let itemsByDay = {};
      if (dayIds.length) {
        const { data: itemRows, error: iErr } = await supabase
          .from("itinerary_items")
          .select("id, itinerary_day_id, time, activity, location, notes, cost")
          .in("itinerary_day_id", dayIds)
          .order("time", { ascending: true });
        if (iErr) throw iErr;

        // Group items by day id
        (itemRows ?? []).forEach((it) => {
          (itemsByDay[it.itinerary_day_id] ||= []).push(it);
        });
      }

      // Merge days with their items
      const enriched = (dayRows ?? []).map((d) => ({
        ...d,
        items: itemsByDay[d.id] || [],
      }));

      setDays(enriched);

      // Make sure there is a valid selected day
      if (!selectedDayId && enriched.length) {
        setSelectedDayId(enriched[0].id);
      }

      return enriched;
    } catch (error) {
      console.warn("[timeline] fetch error:", error?.message || error);
      setDays([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [tripId, selectedDayId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Next day number (used as default in AddDayModal)
  const nextDayIndex =
    (days.length ? Math.max(...days.map((d) => Number(d.day_index) || 0)) : 0) +
    1;

  // Currently selected day object
  const selectedDay = useMemo(
    () => days.find((d) => d.id === selectedDayId) || null,
    [days, selectedDayId]
  );

  // Total cost across the whole itinerary (sum of all days)
  const totalCostCAD = useMemo(() => {
    return days.reduce(
      (sum, d) =>
        sum + d.items.reduce((s, it) => s + (Number(it.cost) || 0), 0),
      0
    );
  }, [days]);

  // Open the delete item confirmation modal
  function handleDeleteItem(itemId) {
    setShowDeleteItem(itemId);
  }

  // Open the delete itinerary confirmation modal
  function handleDeleteItinerary() {
    setShowDeleteItinerary(true);
  }

  // Confirmed? delete one item then refresh
  async function handleDeleteConfirmedItem() {
    try {
      const { error } = await supabase
        .from("itinerary_items")
        .delete()
        .eq("id", showDeleteItem);
      if (error) throw error;
      await fetchData(); // refresh items
    } catch (error) {
      alert(error?.message || "Failed to delete item.");
    } finally {
      setShowDeleteItem(null);
    }
  }

  // Confirmed? delete entire itinerary - items, days, itinerary
  async function handleDeleteConfirmedItinerary() {
    try {
      // Get day ids
      const { data: dayRows, error: dErr } = await supabase
        .from("itinerary_day")
        .select("id")
        .eq("itinerary_id", tripId);
      if (dErr) throw dErr;

      const dayIds = (dayRows ?? []).map((d) => d.id);

      if (dayIds.length) {
        // Delete items
        const { error: delItemsErr } = await supabase
          .from("itinerary_items")
          .delete()
          .in("itinerary_day_id", dayIds);
        if (delItemsErr) throw delItemsErr;

        // Delete days
        const { error: delDaysErr } = await supabase
          .from("itinerary_day")
          .delete()
          .in("id", dayIds);
        if (delDaysErr) throw delDaysErr;
      }

      // Delete itinerary
      const { error: delItineraryErr } = await supabase
        .from("itineraries")
        .delete()
        .eq("id", tripId);
      if (delItineraryErr) throw delItineraryErr;

      // Notify parent so it can remove the trip from UI immediately
      onDeleted?.(tripId);
    } catch (error) {
      alert(error?.message || "Failed to delete itinerary.");
      fetchData();
    } finally {
      setShowDeleteItinerary(false);
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
              title={`Next day: ${nextDayIndex}`}
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

      {/* Confirm modals */}
      <DeleteConfirmModal
        open={!!showDeleteItem}
        onClose={() => setShowDeleteItem(null)}
        onConfirm={handleDeleteConfirmedItem}
      />
      <DeleteConfirmModal
        open={showDeleteItinerary}
        onClose={() => setShowDeleteItinerary(false)}
        onConfirm={handleDeleteConfirmedItinerary}
      />

      {/* Create or add Modals */}
      <AddDayModal
        itineraryId={tripId}
        open={addDayOpen}
        onClose={() => setAddDayOpen(false)}
        defaultDayNumber={nextDayIndex}
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
