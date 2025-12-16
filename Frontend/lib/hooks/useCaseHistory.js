import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { useState } from "react";
import { showToast } from "@/components/ui/toast";
import { addCaseHistory, getpatientHistoryById } from "../services/patientCaseHistory";

export default function useCaseHistory() {
  const dispatch = useDispatch();
  const [patientsCaseHistory, setPatientCaseHistory] = useState(null);

  const fetchPatientFormData = async (patientId) => {
     console.log("patientId1",patientId)
    if (!patientId) return;
    console.log("patientId2",patientId)
    dispatch(startLoading());
    try {
      const res = await getpatientHistoryById(patientId);
      setPatientCaseHistory(res);
    } catch (err) {
      showToast({ type: "error", message: "Failed to fetch patient history" });
    } finally {
      dispatch(stopLoading());
    }
  };

  const registerCasehistory = async (data) =>{
    console.log("ccccccccc",data)
    dispatch(startLoading())

    try{
     await addCaseHistory(data)
     showToast({
        type: "success",
        message: data.status || "Registration Successful",
      });
      dispatch(stopLoading());
    }catch(err){
      showToast({
        type: "error",
        message: err?.error || "Registration Failed",
      });
       dispatch(stopLoading());
    }
  }

  return { patientsCaseHistory, fetchPatientFormData, registerCasehistory };
}
