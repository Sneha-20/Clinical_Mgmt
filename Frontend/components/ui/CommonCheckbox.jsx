"use client";

export default function CommonCheckbox({
  label,
  checked,
  onChange,
  value,
  id,
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none text-sm">

      {/* Real Input */}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        value={value}
        className="hidden"
      />

      {/* Custom Checkbox */}
      <div
        className={`
          h-4 w-4 rounded-sm border flex items-center justify-center transition-all
          ${checked ? "bg-[#1ba9c6] border-[#1ba9c6]" : "border-gray-400"}
        `}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <span>{label}</span>
    </label>
  );
}
