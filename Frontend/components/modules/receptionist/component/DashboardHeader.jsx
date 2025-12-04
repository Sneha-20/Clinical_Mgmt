"use client";
import { Button } from "@/components/ui/button";

export default function DashboardHeader({ onAddVisit }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primaryText">Patient Management</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">Manage patient registrations and daily operations</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Button onClick={onAddVisit} variant="outline" className="gap-2 text-sm w-full sm:w-auto">
          Add Visit
        </Button>
      </div>
    </div>
  );
}
