"use client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchBox({ value, onChange, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Input
        placeholder="Search by name or phone..."
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="text-sm pr-8"
      />
      <Search className="w-5 h-5 text-primary absolute right-2 top-2.5" />
    </div>
  );
}
