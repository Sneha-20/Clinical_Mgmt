"use client";
import { Button } from "@/components/ui/button";
import { Eye, Phone } from "lucide-react";

export default function FollowupTable({
  patients = [],
  onViewProfile,
  onMarkAsContacted,
  showMarkContacted = false,
}) {
  if (patients.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">No followups found</div>
    );
  }

  return (
    <div className="h-auto min-h-[284px]">
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-slate-100 border-b">
            <tr>
              <th className="py-2 px-3 text-left">Patient Name</th>
              <th className="py-2 px-3 text-left hidden sm:table-cell">Phone</th>
              <th className="py-2 px-3 text-left hidden md:table-cell">Visit Type</th>
              <th className="py-2 px-3 text-left hidden md:table-cell">Seen By</th>
              <th className="py-2 px-3 text-left hidden lg:table-cell">Appointment Date</th>
              <th className="py-2 px-3 text-left hidden lg:table-cell">Status Note</th>
              <th className="py-2 px-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((p) => (
              <tr key={p.visitId} className="border-b hover:bg-slate-100">
                <td className="py-2 px-3 font-medium">{p.patientName}</td>
                <td className="py-2 px-3 hidden sm:table-cell">{p.patientPhone}</td>
                <td className="py-2 px-3 hidden md:table-cell text-xs">{p.visitType}</td>
                <td className="py-2 px-3 hidden md:table-cell text-xs">{p.seenBy}</td>
                <td className="py-2 px-3 hidden lg:table-cell text-xs">{p.appointmentDate}</td>
                <td className="py-2 px-3 hidden lg:table-cell text-xs">
                  {p.statusNote || "-"}
                </td>
                <td className="py-2 px-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => onViewProfile && onViewProfile(p.id)}
                    >
                      <Eye className="w-3 h-3" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    {showMarkContacted && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => onMarkAsContacted && onMarkAsContacted(p.visitId, p.patientName)}
                      >
                        <Phone className="w-3 h-3" />
                        <span className="hidden sm:inline">Mark Contacted</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
