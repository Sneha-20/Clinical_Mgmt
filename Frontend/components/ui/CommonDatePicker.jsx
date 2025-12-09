"use client";

import { cn } from "@/lib/utils/tailwindutils";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CommonDatePicker({
  label,
  selectedDate,
  onChange,
  placeholder = "Select date",
  error,
  className,
}) {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}

      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        dateFormat="dd-MM-yyyy"
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        placeholderText={placeholder}
        className={cn(
                  `flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:lightblue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    error ? "border-red-500" : "border-slate-300"
                  }`,
                  className
                )}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
