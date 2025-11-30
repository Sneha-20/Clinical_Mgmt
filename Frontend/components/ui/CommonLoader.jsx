"use client";

import { useSelector } from "react-redux";
import { selectLoader } from "@/lib/redux/slice/uiSlice";

export default function CommonLoader() {
  const loadingCount = useSelector(selectLoader);

  if (loadingCount === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
