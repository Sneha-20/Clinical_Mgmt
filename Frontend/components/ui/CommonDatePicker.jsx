"use client";

import { cn } from "@/lib/utils/tailwindutils";
import { Calendar } from "lucide-react";
import React from "react";
import { format as formatDate } from "date-fns";

export default function CommonDatePicker({
  label,
  selectedDate,
  onChange,
  placeholder = "Select date",
  error,
  className,
  maxDate,
  minDate,
}) {
  const toInputValue = (date) => {
    try {
      return date ? formatDate(date, "yyyy-MM-dd") : "";
    } catch (e) {
      return "";
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (!val) return onChange(null);
    const dt = new Date(val);
    onChange(dt);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      <div className="relative">
        <input
          type="date"
          value={toInputValue(selectedDate)}
          onChange={handleChange}
          placeholder={placeholder}
          min={minDate ? toInputValue(minDate) : undefined}
          max={maxDate ? toInputValue(maxDate) : undefined}
          className={cn(
            `flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:lightblue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              error ? "border-red-500" : "border-slate-300"
            }`,
            className
          )}
        />
        <Calendar className="absolute right-3 top-2 w-5 h-5 text-gray-500 pointer-events-none" />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
