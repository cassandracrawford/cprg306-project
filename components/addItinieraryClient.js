// Client-side wrapper that displays an "Add Itinerary" button
// and controls the open/close state for the AddItineraryModal component
"use client";
import { useState } from "react";
import AddItineraryModal from "./addItineraryModal";

export default function AddItineraryClient({ iso2 }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="underline hover:cursor-pointer"
        type="button"
      >
        Add Itinerary
      </button>

      <AddItineraryModal
        iso2={iso2}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
