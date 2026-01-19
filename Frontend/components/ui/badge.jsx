import React from "react";

export default function CommonBadge({ status, title }) {
  let badgeClass =
    "px-2 py-[2px] text-xs font-medium rounded-full border";

  switch (status) {
    case "Completed":
      badgeClass += " border-green-500 bg-green-100 text-green-700 max-w-max";
      break;

    case "In Progress":
      badgeClass += " border-blue-500 bg-blue-100 text-blue-700";
      break;

    case "Pending":
      badgeClass += " border-yellow-500 bg-yellow-100 text-yellow-700";
      break;

    case "Cancelled":
      badgeClass += " border-red-500 bg-red-100 text-red-700";
      break;

    case "bgBadge":
      badgeClass += " bg-teal-700 text-white";
      break;

    default:
      // ✅ Default when status is NOT passed
      badgeClass += " border-primary bg-blue-50 text-primary max-w-max";
  }

  return (
    <div className={badgeClass}>
      {title}
    </div>
  );
}
