"use client";

import { cn } from "@/lib/utils/tailwindutils";
import { Calendar } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
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
  const [showPicker, setShowPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate || new Date()
  );
  const pickerRef = useRef(null);

  const toInputValue = (date) => {
    try {
      return date ? formatDate(date, "MMM dd, yyyy") : "";
    } catch (e) {
      return "";
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date) => {
    if (!date) return false;
    const toDateOnly = (d) => {
      const dd = d instanceof Date ? d : new Date(d);
      return new Date(dd.getFullYear(), dd.getMonth(), dd.getDate());
    };

    const dOnly = toDateOnly(date);
    if (maxDate) {
      const maxOnly = toDateOnly(maxDate);
      if (dOnly > maxOnly) return true;
    }
    if (minDate) {
      const minOnly = toDateOnly(minDate);
      if (dOnly < minOnly) return true;
    }
    return false;
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push(date);
    }

    return days;
  };

  const handleDateClick = (date) => {
    if (!isDateDisabled(date)) {
      onChange(date);
      setShowPicker(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleMonthChange = (e) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1)
    );
  };

  const handleYearChange = (e) => {
    setCurrentMonth(
      new Date(parseInt(e.target.value), currentMonth.getMonth(), 1)
    );
  };

  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  const days = renderCalendar();
  const monthDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {label}
        </label>
      )}
      <div className="relative" ref={pickerRef}>
        <div
          className={cn(
            `flex h-10 w-full items-center rounded-md border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none cursor-pointer transition ${
              error ? "border-red-500" : "border-gray-300"
            }`,
            className
          )}
          onClick={() => setShowPicker(!showPicker)}
        >
          <input
            type="text"
            value={toInputValue(selectedDate)}
            placeholder={placeholder}
            readOnly
            className="flex-1 outline-none bg-transparent"
          />
          <Calendar className="w-5 h-5 text-gray-400 pointer-events-none flex-shrink-0 ml-2" />
        </div>

        {/* Calendar Dropdown */}
        {showPicker && (
          <div className="absolute top-full w-full max-w-[295px] left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
            {/* Header with Month/Year Selectors */}
            <div className="flex items-center justify-between mb-4 gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <select
                value={currentMonth.getMonth()}
                onChange={handleMonthChange}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((m, i) => (
                  <option key={i} value={i}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={currentMonth.getFullYear()}
                onChange={handleYearChange}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 100 }, (_, i) => {
                  const year = new Date().getFullYear() - 50 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>

              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {monthDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, idx) => (
                <button
                  key={idx}
                  onClick={() => date && handleDateClick(date)}
                  disabled={date && isDateDisabled(date)}
                  className={cn(
                    "p-2 text-sm rounded transition",
                    date ? "" : "bg-transparent",
                    date && isDateDisabled(date)
                      ? "text-gray-300 cursor-not-allowed"
                      : date && selectedDate && date.toDateString() === selectedDate.toDateString()
                      ? "bg-blue-500 text-white font-bold"
                      : date && new Date().toDateString() === date.toDateString()
                      ? "bg-blue-100 text-blue-600 font-semibold"
                      : date && !isDateDisabled(date)
                      ? "hover:bg-blue-50 text-gray-700 cursor-pointer"
                      : "text-gray-300"
                  )}
                >
                  {date ? date.getDate() : ""}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}
