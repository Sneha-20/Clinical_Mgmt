"use client";

import Select from "react-select";

export default function DropDown({
  label,
  important = false,
  options = [],
  value,
  onChange = () => {},
  placeholder = "Select an option",
  error,
  className = "",
  name = "",
}) {
  return (
    <div className={`flex flex-col gap-1 w-full mb-4 ${className}`}>
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1">
          {label}
          {important && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* React Select Component */}
      <Select
        name={name}
        value={options.find((opt) => opt.value === value) || null}
        onChange={(selected) => onChange(name, selected?.value)}
        options={options}
        placeholder={placeholder}
        styles={{
          control: (base, state) => ({
            ...base,
            borderColor: error
              ? "red"
              : state.isFocused
              ? "#3b82f6"
              : "#d1d5db",
            boxShadow: state.isFocused ? "0 0 0 2px #bfdbfe" : "none",
            padding: "2px",
            borderRadius: "8px",
            minHeight: "38px",
          }),

          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? "rgba(20, 67, 91)" // ★ SELECTED COLOR
              : state.isFocused
              ? "rgba(20, 67, 91, 0.15)" // ★ HOVER COLOR
              : "white",
            color: state.isSelected ? "white" : "#111",
            cursor: "pointer",
            padding: "8px 12px",
          }),
        }}
      />

      {/* Error message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
