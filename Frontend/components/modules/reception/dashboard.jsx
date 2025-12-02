"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye } from "lucide-react";

import PatientRegistrationForm from "./components/patient-registration-form";
import PatientVisitForm from "./components/PatientVisitForm";
import SchedulAppoinment from "./components/SchedulAppoinment";
import PatientProfile from "./patient-profile";

import { addNewVisit, createPatient, getPatientList } from "@/lib/services/dashboard";

export default function ReceptionDashboard() {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showSelctedPatientId, setShowSelctedPatientId] = useState(null);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showScheduleAppointment, setShowScheduleAppointment] = useState(false);
  const [showPatientProfile, setShowPatientProfile] = useState(false);

  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
  });
  // Fetch Patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const result = await getPatientList({ page: 1 });

      const mappedPatients = result.patients.map((p) => ({
        id: p.patient_id,
        name: p.patient_name,
        phone: p.patient_phone || "",
        visitId: p.visit_id,
        visitType: p.visit_type || "New",
        status: p.status || "Test Pending",
        appointmentDate: p.appointment_date || "-",
      }));

      setPatients(mappedPatients);
      setPagination({
        totalItems: result.totalItems ?? 0,
        totalPages: result.totalPages ?? 1,
        currentPage: 1,
      });
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm)
  );

  // Add Patient
  const handleAddPatient = async (data) => {
    console.log("Adding patient with data:", data);
    try {
      await createPatient(data);
      fetchPatients();
    } catch (err) {
      console.error("Error adding patient:", err);
    }
    setShowRegistrationForm(false);
  };

    const handleAddVisit = async (data) => {
    console.log("Adding patient with dataaaaaaaaaaaa:", data);
    try {
      await addNewVisit(data);
      fetchPatients();
    } catch (err) {
      console.error("Error adding patient:", err);
    }
    setShowRegistrationForm(false);
  };

  const handleViewProfile = (id) => {
    setSelectedPatientId(id);
    setShowPatientProfile(true);
  };

  // Render Profile Page
  if (showPatientProfile && selectedPatientId) {
    return (
      <PatientProfile
        patientId={selectedPatientId}
        onBack={() => setShowPatientProfile(false)}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primaryText">
            Patient Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage patient registrations and daily operations
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setShowScheduleAppointment(true)}
            variant="outline"
            className="gap-2 text-sm w-full sm:w-auto"
          >
            Add Visit
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Patients" value={pagination.totalItems} color="bg-blue-100" />
        <StatCard label="Today's Visits" value="12" color="bg-green-100" />
        <StatCard label="Pending Tests" value="5" color="bg-yellow-100" />
        <StatCard label="Follow-ups" value="8" color="bg-purple-100" />
      </div>

      {/* Modals */}
        {showScheduleAppointment && (
        <SchedulAppoinment
          onClose={() => setShowScheduleAppointment(false)}
          setShowRegistrationForm={setShowRegistrationForm}
          setShowSelctedPatientId={setShowSelctedPatientId}
        />
      )}

      {showRegistrationForm && (
        <PatientRegistrationForm
          onClose={() => setShowRegistrationForm(false)}
          onSubmit={handleAddPatient}
        />
      )}

      {showSelctedPatientId && (
        <PatientVisitForm
         showSelctedPatientId={showSelctedPatientId}
          onClose={() => setShowSelctedPatientId(null)}
          onSubmit={handleAddVisit}
        />
      )}

    
      {/* Patient Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Patient List</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Today's registrations and previous patients
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* Search */}
          <div className="relative w-[300px]">
            <Input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm pr-8"
            />
            <Search className="w-5 h-5 text-primary absolute right-2 top-2.5" />
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading patients...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No patients found</div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="py-2 px-3 text-left">Name</th>
                    <th className="py-2 px-3 text-left hidden sm:table-cell">Phone</th>
                    <th className="py-2 px-3 text-left hidden md:table-cell">Purpose</th>
                    <th className="py-2 px-3 text-left hidden lg:table-cell">Appointment</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPatients.map((p) => (
                    <tr key={p.visit_id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium">{p.name}</td>
                      <td className="py-2 px-3 hidden sm:table-cell">{p.phone}</td>
                      <td className="py-2 px-3 hidden md:table-cell text-xs">{p.visitType}</td>
                      <td className="py-2 px-3 hidden lg:table-cell text-xs">{p.appointmentDate}</td>

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
                          onClick={() => handleViewProfile(p.id)}
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

        </CardContent>
      </Card>
    </div>
  );
}

/* Small Stat Card Component */
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
