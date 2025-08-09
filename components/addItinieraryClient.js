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
