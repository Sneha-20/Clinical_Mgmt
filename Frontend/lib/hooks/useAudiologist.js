import { useRouter } from "next/navigation";
import { routes } from "@/lib/utils/constants/route";
import { getAppointmentList } from "../services/audiologist";
import { useEffect, useState } from "react";

export default function useAudiologist(id) {
  const router = useRouter();
  const caseHistory = routes.pages.patientCaseHistory;
  const [appoinementList, setAppoinmentList] = useState([])
  
  const fetchPatientList = async ({ page = 1, search = "",service="" } = {}) => {
    console.log("ssss")
    try {
      const res = await getAppointmentList({ page, search, service });

      setAppoinmentList(res.data || []);
    } catch (e) {
      console.log("Total fetch error:", e);
    } 
  };
  useEffect(() => {
   fetchPatientList();
  },[])

  const handleViewPatient = (id) => {
    router.push(`${caseHistory}/${id}`);
  };
  return {
    appoinementList,
    handleViewPatient,
  };
}
