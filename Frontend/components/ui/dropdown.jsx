"use client";

export default function DropDown({
  label,
  options = [],
  value,
  onChange = () => {},
  placeholder = "Select an option",
  error,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <select
        value={value ?? ""} 
        onChange={(e) => onChange("clinic_id", Number(e.target.value))}
        className={`
          w-full px-3 py-3 rounded-lg 
          border text-gray-800 
          focus:outline-none focus:ring-2 
          focus:ring-teal-600 focus:border-teal-600 
          transition
          ${error ? "border-red-500" : "border-gray-300"}
        `}
      >
        <option value="">{placeholder}</option>

        {options.map((item, i) => (
          <option key={i} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
