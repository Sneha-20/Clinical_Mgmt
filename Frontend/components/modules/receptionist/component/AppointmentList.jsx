"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/utils/constants/route";
import { getPatientById } from "@/lib/services/patientProfile";
import CaseHistoryFormModal from "./CaseHistoryFormModal";

export default function AppointmentList({
  loading,
  filteredPatients = [],
  onViewProfile,
  isToday,
}) {
  const router = useRouter();

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isFetchingPatient, setIsFetchingPatient] = useState(false);
  const [printData, setPrintData] = useState({
    name: "",
    age: "",
    dob: "",
    gender: "",
    phone_primary: "",
    address: "",
    referral_doctor: "",
    date: "",
  });

  const closePrintModal = () => setIsPrintModalOpen(false);

  const openPrintModal = async (patientId) => {
    if (!patientId) return;
    setIsFetchingPatient(true);

    try {
      const res = await getPatientById(patientId);

      setPrintData({
        id: patientId,
        name: res?.name || "",
        age: res?.age || "",
        dob: res?.dob || "",
        gender: res?.gender || "",
        phone_primary: res?.phone_primary || "",
        address: res?.address || "",
        addressContact: `${res?.address || ""} (${res?.phone_primary || ""})`,
        referral_doctor: res?.referral_doctor || res?.referral_type || "",
        date: new Date().toLocaleDateString(),
      });

      setIsPrintModalOpen(true);
    } catch (err) {
      console.error("Error fetching patient for print:", err);
    } finally {
      setIsFetchingPatient(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-auto min-h-[284px]">
      {loading ? (
        <div className="text-center py-8 text-slate-500">
          Loading patients...
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-8 text-slate-500">No patients found</div>
      ) : (
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="py-2 px-3 text-left">Name</th>
                <th className="py-2 px-3 text-left hidden sm:table-cell">
                  Phone
                </th>
                <th className="py-2 px-3 text-left hidden md:table-cell">
                  Purpose
                </th>
                <th className="py-2 px-3 text-left hidden md:table-cell">
                  Assigned To
                </th>
                {!isToday && (
                  <th className="py-2 px-3 text-left hidden lg:table-cell">
                    Appointment
                  </th>
                )}
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-center">Print</th>
                <th className="py-2 px-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredPatients.map((p) => (
                <tr
                  key={p.visitId ?? p.id}
                  className="border-b hover:bg-slate-100"
                >
                  <td className="py-2 px-3 font-medium">{p.name}</td>
                  <td className="py-2 px-3 hidden sm:table-cell">{p.phone}</td>
                  <td className="py-2 px-3 hidden md:table-cell text-xs">
                    {p.visitType}
                  </td>
                  <td className="py-2 px-3 hidden md:table-cell text-xs">
                    {p.seenBy}
                  </td>
                  {!isToday && (
                    <td className="py-2 px-3 hidden lg:table-cell text-xs">
                      {p.appointmentDate}
                    </td>
                  )}
                  <td className="py-2 px-3">
                    <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs">
                      {p.status}
                    </span>
                  </td>

                  <td className="py-2 px-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      disabled={isFetchingPatient}
                      onClick={() => openPrintModal(p.id)}
                    >
                      <Printer className="w-3 h-3" />
                      <span className="hidden sm:inline">Print</span>
                    </Button>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      onMouseEnter={() => {
                        if (p?.id)
                          router.prefetch(
                            `${routes.pages.userptofile}/${p.id}`,
                          );
                      }}
                      onClick={() => onViewProfile && onViewProfile(p.id)}
                    >
                      <Eye className="w-3 h-3" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CaseHistoryFormModal
        isModalOpen={isPrintModalOpen}
        closePrintModal={closePrintModal}
        printData={printData}
        handlePrint={handlePrint}
      />
    </div>
  );
}
