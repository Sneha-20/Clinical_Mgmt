"use client";
import AppointmentList from "./AppointmentList";

export default function TotalList({ loading, patients, onViewProfile }) {
  return <AppointmentList loading={loading} filteredPatients={patients} onViewProfile={onViewProfile} />;
}
