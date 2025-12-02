import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/Modal";
import { searchPatient } from "@/lib/services/dashboard";
import { Plus, Search } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function SchedulAppoinment({
  onClose,
  setShowRegistrationForm,
  setShowSelctedPatientId,   // ✅ Added correctly
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const searchPatientsList = async () => {
      try {
        const response = await searchPatient(searchTerm);
        console.log("Search response:", response);
        setSearchResults(response);
        console.log("Searching for patients with term:", searchTerm);
      } catch (error) {
        console.error("Error searching patients:", error);
      }
    };
    searchPatientsList();
  }, [searchTerm]);

  return (
    <Modal header="Schedule Appointment" onClose={onClose}>
      <div className="flex gap-5">
        {/* LEFT SIDE — EXISTING PATIENT */}
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-primary">Existing Patient</h3>

          <div className="flex gap-2 items-center relative w-full">
            <Input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-sm pr-6 w-full"
            />
            <Search className="w-5 h-5 text-primary absolute right-1 top-[14px]" />
          </div>

          <div>
            {searchTerm.length > 0 && searchResults.length > 0 ? (
              <ul className="max-h-40 overflow-y-auto border border-slate-200 rounded-md p-2">
                {searchResults.map((patient) => (
                  <li
                    key={patient.visit}
                    className="py-1 border-b last:border-0 cursor-pointer hover:bg-slate-100"
                    onClick={() => {
                      setShowSelctedPatientId(patient.id);   // PASS patient id
                      onClose();                      // close schedule modal
                    }}
                  >
                    {patient.name} - {patient.phone}
                  </li>
                ))}
              </ul>
            ) : (
              searchTerm.length > 0 && (
                <p className="text-slate-500 text-xs sm:text-sm">
                  No patients found
                </p>
              )
            )}
          </div>

          <p className="text-slate-500 text-xs sm:text-sm">
            Find an existing patient to book their appointment
          </p>
        </div>

        {/* DIVIDER */}
        <div className="h-auto w-px bg-gray-200"></div>

        {/* RIGHT SIDE — NEW PATIENT */}
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-primary">New Patient</h3>

          <Button
            className="gap-2 text-sm w-full sm:w-auto"
            onClick={() => {
              setShowRegistrationForm(true); // open registration
              onClose();                     // close schedule modal
            }}
          >
            <Plus className="w-4 h-4" />
            New Patient
          </Button>

          <p className="text-slate-500 text-xs sm:text-sm">
            Create a new patient record and appointment
          </p>
        </div>
      </div>
    </Modal>
  );
}
