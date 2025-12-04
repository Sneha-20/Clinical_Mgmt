"use client";

import { useState } from "react";
import DashboardHeader from "./component/DashboardHeader";
import StatsSection from "./component/StatsSection";
import PatientTabs from "./component/Patientstab";
import TodayList from "./component/TodayList";
import TotalList from "./component/TotalList";
import SearchBox from "./component/SearchBox";
import PatientProfile from "../reception/patient-profile";
import usePatientData from "@/lib/hooks/usePatientData";
import SchedulAppoinment from "../reception/components/SchedulAppoinment";
import PatientRegistrationForm from "../reception/components/patient-registration-form";
import PatientVisitForm from "../reception/components/PatientVisitForm";
import Pagination from "@/components/ui/Pagination";

export default function ReceptionistDashboard() {
  // modal / UI states
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showSelctedPatientId, setShowSelctedPatientId] = useState(null);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showScheduleAppointment, setShowScheduleAppointment] = useState(false);
  const [showPatientProfile, setShowPatientProfile] = useState(false);

  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // search state
  const [searchTerm, setSearchTerm] = useState("");

  // usePatientData hook
  const {
    patients,
    todayPatients,
    doctorList,
    loadingTotal,
    loadingToday,
    pagination,
    goToNextPage,
    goToPreviousPage,
    handleAddPatient,
    handleAddVisit,
  } = usePatientData();
  // filtered lists based on search
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm)
  );
  const filteredTodayPatients = todayPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm)
  );

  // handlers for add patient / visit (pass to modals)
  const onAddPatientSubmit = async (data) => {
    try {
      await handleAddPatient(data);
    } catch (err) {
      console.error(err);
    } finally {
      setShowRegistrationForm(false);
    }
  };

  const onAddVisitSubmit = async (data) => {
    try {
      await handleAddVisit(data);
    } catch (err) {
      console.error(err);
    } finally {
      setShowSelctedPatientId(null);
      setShowVisitForm(false);
    }
  };

  const handleViewProfile = (id) => {
    setSelectedPatientId(id);
    setShowPatientProfile(true);
  };

  // Render profile page route if viewing profile
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
      <DashboardHeader onAddVisit={() => setShowScheduleAppointment(true)} />

      <StatsSection totalPatientsCount={pagination.totalItems} />

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
          onSubmit={onAddPatientSubmit}
          doctorList={doctorList}
        />
      )}

      {showSelctedPatientId && (
        <PatientVisitForm
          showSelctedPatientId={showSelctedPatientId}
          doctorList={doctorList}
          onClose={() => setShowSelctedPatientId(null)}
          onSubmit={onAddVisitSubmit}
        />
      )}

      {/* Search + Tabs */}
      <div className="card">
        {/* Card layout re-implemented using your Card component */}
      </div>

      <div>
        {/* Patient Card */}
        <div className="space-y-4">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">
                  Total Patient List
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Today's registrations and previous patients
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SearchBox value={searchTerm} onChange={setSearchTerm} />

            <PatientTabs
              todayContent={
                <>
                  <TodayList
                    loading={loadingToday}
                    patients={filteredTodayPatients}
                    onViewProfile={handleViewProfile}
                  />

                  <Pagination
                    page={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onNext={goToNextPage}
                    onPrevious={goToPreviousPage}
                  />
                </>
              }
              totalContent={
                <>
                  <TotalList
                    loading={loadingTotal}
                    patients={filteredPatients}
                    onViewProfile={handleViewProfile}
                  />

                  <Pagination
                    page={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onNext={goToNextPage}
                    onPrevious={goToPreviousPage}
                  />
                </>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
