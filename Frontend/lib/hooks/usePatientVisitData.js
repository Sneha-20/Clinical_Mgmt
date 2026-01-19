import { useEffect, useState } from "react";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { useDispatch } from "react-redux";
import { getPatientVisitById } from "../services/patientVisitDetails";

export default function usePatientVisitdata(visitId) {
  const dispatch = useDispatch();

  const [patientVisitdetails,setPatientVisitdetails]=useState([])

  useEffect(() => {
    const fetchPatientVisitData = async (id) => {
      if (!visitId) return;
      dispatch(startLoading());
      try {
        const res = await getPatientVisitById(id);
        setPatientVisitdetails(res);
        dispatch(stopLoading());
      } catch (err) {
        dispatch(stopLoading());
        console.error("Error fetching patient visit:", err);
      }
    };
    fetchPatientVisitData(visitId);
  },[visitId]);

  return {
    patientVisitdetails,
  };
}
