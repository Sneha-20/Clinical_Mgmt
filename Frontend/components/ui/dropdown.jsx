"use client";

export default function DropDown({
  label,
  important =false,
  options = [],
  value,
  onChange = () => {},
  placeholder = "Select an option",
  error,
  className = "",
  name={name}
}) {
  return (
    <div className={`flex flex-col gap-1 w-full mb-4 ${className}`}>
      
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1">
          {label}
          {important && <span className="text-gray-700 ml-1">*</span>}
        </label>
      )}

      <select
        value={value ?? ""} 
        onChange={(e) => onChange(name, e.target.value)}
        className={`
          w-full px-3 py-[6px] h-9 rounded-md 
          border text-gray-800 
          focus:outline-none focus:ring-2 focus:ring-offset-2
          focus:lightblue 
          transition
          ${error ? "border-red-500" : "border-slate-300"}
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
