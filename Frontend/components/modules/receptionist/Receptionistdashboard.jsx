"use client";

import { useState } from "react";
import DashboardHeader from "./component/DashboardHeader";
import StatsSection from "./component/StatsSection";
import PatientTabs from "./component/Patientstab";
import TodayList from "./component/TodayList";
import TotalList from "./component/TotalList";
import SearchBox from "./component/SearchBox";
import usePatientData from "@/lib/hooks/usePatientData";
import SchedulAppoinment from "../reception/components/SchedulAppoinment";
import PatientRegistrationForm from "../reception/components/patient-registration-form";
import PatientVisitForm from "../reception/components/PatientVisitForm";
import Pagination from "@/components/ui/Pagination";
import DropDown from "@/components/ui/dropdown";
import { serviceOption } from "@/lib/utils/constants/staticValue";

export default function ReceptionistDashboard() {
  /** -----------------------------
   *  MODAL STATES
   * ------------------------------*/
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showSelctedPatientId, setShowSelctedPatientId] = useState(null);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showScheduleAppointment, setShowScheduleAppointment] = useState(false);

  /** -----------------------------
   *  USE HOOK (Handles Search, Tabs, Pagination)
   * ------------------------------*/
  const {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,

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
    handleViewProfile,

    serviceType,
    setServiceType
  } = usePatientData();

  /** -----------------------------
   *  HANDLERS FOR FORMS
   * ------------------------------*/
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

  /** -----------------------------
   *  RETURN JSX
   * ------------------------------*/
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <DashboardHeader onAddVisit={() => setShowScheduleAppointment(true)} />

      {/* Stats */}
      <StatsSection totalPatientsCount={pagination.totalItems || 0} />

      {/* -----------------------------
          MODALS
      ------------------------------*/}
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

      {/* -----------------------------
          SEARCH + TAB LISTS
      ------------------------------*/}
      <div className="space-y-2 bg-card text-card-foreground flex flex-col gap-2 rounded-xl border p-6 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Patient List</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Today's registrations & all patients
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="grid grid-cols-4 gap-3">

        <SearchBox value={searchTerm} onChange={setSearchTerm} />
        <DropDown
  options={serviceOption}
  value={serviceType}
  name="serviceType"
  onChange={(name, value) => setServiceType(value)}
/>
        </div>

        {/* Tabs (Today / Total) */}
        <PatientTabs
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          todayContent={
            <>
              <TodayList
                loading={loadingToday}
                patients={todayPatients}
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
                patients={patients}
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
  );
}
