import { useEffect, useState } from "react";
import { getPatientById, getVisitById } from "../services/patientProfile";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

export default function usePatientProfile(patientId) {
  const router = useRouter();

  const dispatch = useDispatch();
  const [patient, setPatient] = useState();
  const [patientVisit, setPatientVisit] = useState();
  const fetchPatientData = async (id) => {
    if (!id) return;
    dispatch(startLoading());
    try {
      const res = await getPatientById(id);
      setPatient(res);
      dispatch(stopLoading());
    } catch (err) {
      dispatch(stopLoading());
      console.error("Error fetching patient profile data:", err);
    }
  };

  const fetchPatientVisit = async (id) => {
    if (!id) return;
    dispatch(startLoading());
    try {
      const res = await getVisitById(id);
      setPatientVisit(res);
      dispatch(stopLoading());
    } catch (err) {
      dispatch(stopLoading());
      console.error("Error fetching patient visit:", err);
    }
  };

  useEffect(() => {
    fetchPatientData(patientId);
    fetchPatientVisit(patientId);
  }, [patientId]);

  const onBack = () => {
    router.back();
  };
  return {
    patient,
    patientVisit,

    onBack,
    fetchPatientData,
  };
}
