"use client";
import AppointmentList from "./AppointmentList";

export default function TodayList({ loading, patients, onViewProfile }) {
  return <AppointmentList loading={loading} filteredPatients={patients} onViewProfile={onViewProfile} isToday />;
}
