"use client";

// Reusable delete confirmation modal -- delete item and delete itinerary
export default function DeleteConfirmModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog">
      <div className="relative w-full max-w-md p-4 bg-white rounded-lg shadow dark:bg-gray-700">
        {/* close modal - X */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-[#0d1c24] hover:bg-gray-200 hover:text-gray-900 rounded-lg w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>

        {/* Warning icon */}
        <div className="p-5 text-center">
          <svg className="mx-auto mb-4 text-[#0d1c24] w-12 h-12 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
          </svg>

          {/* Confirmation text */}
          <h3 className="mb-5 text-sm font-normal text-[#0d1c24] dark:text-gray-400">
            Are you sure you want to delete this?
          </h3>

          {/* Confirmation buttons */}
          <button type="button" onClick={onConfirm}
            className="text-white bg-red-700 hover:bg-red-900 font-medium rounded-lg text-xs px-5 py-2.5">
            Yes, I'm sure
          </button>
          <button type="button" onClick={onClose}
            className="ml-3 text-xs font-medium text-[#0d1c24] bg-white border border-gray-200 rounded-lg px-5 py-2.5 hover:bg-gray-100">
            No, cancel
          </button>
        </div>
      </div>
    </div>
  );
}
