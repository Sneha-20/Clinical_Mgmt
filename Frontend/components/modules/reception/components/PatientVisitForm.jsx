import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/Modal";
import { searchPatient } from "@/lib/services/dashboard";
import { Plus, Search } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function PatientVisitForm({ onClose, onSubmit }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const searchPatientsList = async () => {
          try {
           const response = await searchPatient(searchTerm);
              setSearchResults(response);
            console.log("Searching for patients with term:", searchTerm);
          } catch (error) {
            console.error("Error searching patients:", error);
          }}
      searchPatientsList()
    }, [searchTerm]);

  return (
    <div>   
      <Modal
        header="Schedule Appointment"
        onClose={onClose}
        onSubmit={onSubmit}
      >
        <div className="flex gap-5">
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-primary">
              Existing Patient
            </h3>
            <div className="flex gap-2 items-center relative w-full">
              <Input
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 text-sm top-[15px] pr-6 w-full"
              />
              <Search className="w-5 h-5 text-primary flex-shrink-0 absolute right-1 top-[14px]" />
            </div>
            <div>
            {searchResults.length > 0 ? (
              <ul className="max-h-40 overflow-y-auto border border-slate-200 rounded-md p-2">
                {searchResults.map((patient) => (
                    <li key={patient.id} className="py-1 border-b last:border-0">{patient.name} - {patient.phone}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-xs sm:text-sm">No patients found</p>
                )}
            </div>
            <p className="text-slate-500 text-xs sm:text-sm">Find an existing patient to book theire appoinment</p>
          </div>

          <div className="h-auto w-px bg-gray-200"></div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-primary">New Patient</h3>
           <Button className="gap-2 text-sm w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            New Patient
          </Button>
            <p className="text-slate-500 text-xs sm:text-sm">Create a new patient record and appoinment</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
