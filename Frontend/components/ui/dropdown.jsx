"use client";

import Select from "react-select";

export default function DropDown({
  label,
  important = false,
  options = [],
  value,
  onChange,
  onBlur,
  placeholder = "Select an option",
  error,
  className = "",
  name = "",

  // 🆕 OPTIONAL (safe)
  isDisabled = false,
  formatOptionLabel,
}) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1">
          {label}
          {important && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Select
        name={name}
        value={options.find((opt) => opt.value === value) || null}
        options={options}
        placeholder={placeholder}
        isDisabled={isDisabled}
        formatOptionLabel={formatOptionLabel}
        onChange={(selected) => onChange?.(name, selected?.value)}
        onBlur={() => onBlur?.(name)}
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
              ? "rgba(20, 67, 91)"
              : state.isFocused
              ? "rgba(20, 67, 91, 0.15)"
              : "white",
            color: state.isSelected ? "white" : "#111",
            cursor: "pointer",
            padding: "8px 12px",
          }),
        }}
      />

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
