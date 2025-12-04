"use client";

import React from "react";

export default function Pagination({ page, totalPages, onNext, onPrevious }) {
  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <button
        onClick={onPrevious}
        disabled={page === 1}
        className={`px-4 py-2 rounded bg-blue-600 text-white text-sm ${
          page === 1 ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Previous
      </button>

      <span className="text-sm font-medium">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={onNext}
        disabled={page === totalPages}
        className={`px-4 py-2 rounded bg-blue-600 text-white text-sm ${
          page === totalPages ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Next
      </button>
    </div>
  );
}
