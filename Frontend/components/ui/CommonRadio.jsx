"use client";

export default function CommonRadio({
  label,
  checked,
  onChange,
  value,
  name,
  id,
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none text-sm">

      {/* Hidden Input */}
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="hidden"
      />

      {/* Custom Radio */}
      <div
        className={`h-4 w-4 rounded-full border
          flex items-center justify-center
          transition-all
          ${checked ? "border-[#1ba9c6] border-[2px]" : "border-gray-400"}
        `}
      >
        {/* Inner blue dot */}
        {checked && (
          <div className="w-[7px] h-[8px] rounded-full bg-[#1ba9c6]"></div>
        )}
      </div>

      <span>{label}</span>
    </label>
  );
}
