import { useEffect, useState } from "react";
import { getPatientById, getVisitById } from "../services/patientProfile";

export default function usePatientProfile(patientId) {
  const [patient, setPatient] = useState();
  const [patientVisit, setPatientVisit] = useState();
  const fetchPatientData = async (id) => {
    if (!id) return;
    try {
      const res = await getPatientById(id);
      setPatient(res);
    } catch (err) {
      console.error("Error fetching patient profile data:", err);
    }
  };

    const fetchPatientVisit = async (id) => {
    if (!id) return;
    try {
      const res = await getVisitById(id);
      setPatientVisit(res);
    } catch (err) {
      console.error("Error fetching patient visit:", err);
    }
  };

  useEffect(() => {
    fetchPatientData(patientId);
    fetchPatientVisit(patientId)
  }, [patientId]);
  return {
    patient,
    patientVisit,

    fetchPatientData,
  };
}
