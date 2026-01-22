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

export default function StatsSection({ 
  totalPatientsCount = 0,
  todayVisits = 0,
  pendingTests = 0,
  followUps = 0,
  loading = false
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <StatCard 
        label="Total Patients" 
        value={loading ? "..." : totalPatientsCount} 
        color="bg-blue-100" 
      />
      <StatCard 
        label="Today's Visits" 
        value={loading ? "..." : todayVisits} 
        color="bg-green-100" 
      />
      <StatCard 
        label="Pending Services" 
        value={loading ? "..." : pendingTests} 
        color="bg-yellow-100" 
      />
      <StatCard 
        label="Follow-ups" 
        value={loading ? "..." : followUps} 
        color="bg-purple-100" 
      />
    </div>
  );
}
