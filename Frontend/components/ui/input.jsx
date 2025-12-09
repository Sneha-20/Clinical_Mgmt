import React from "react";
import { cn } from "@/lib/utils/tailwindutils";

const Input = React.forwardRef(
  ({ label, error, important = false, className, type, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1.5">
          {label}
          {important && <span className="ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={cn(
          `flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:lightblue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? "border-red-500" : "border-slate-300"
          }`,
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

export { Input };
