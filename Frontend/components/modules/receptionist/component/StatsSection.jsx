"use client";
import { Card, CardContent } from "@/components/ui/card";

function StatCard({ label, value, color }) {
  return (
    <Card className="border-0">
      <CardContent className="pt-4">
        <div className={`${color} rounded-lg p-4 mb-2`} />
        <p className="text-slate-600 text-xs sm:text-sm">{label}</p>
        <p className="text-xl sm:text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function StatsSection({ totalPatientsCount = 0 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <StatCard label="Total Patients" value={totalPatientsCount} color="bg-blue-100" />
      <StatCard label="Today's Visits" value="—" color="bg-green-100" />
      <StatCard label="Pending Tests" value="—" color="bg-yellow-100" />
      <StatCard label="Follow-ups" value="—" color="bg-purple-100" />
    </div>
  );
}
