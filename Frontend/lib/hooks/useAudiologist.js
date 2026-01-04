import { useRouter } from "next/navigation";
import { routes } from "@/lib/utils/constants/route";
import { getAppointmentList, getCompleteTest } from "../services/audiologist";
import { useEffect, useState } from "react";

export default function useAudiologist(id) {
  const router = useRouter();
  const caseHistory = routes.pages.patientCaseHistory;
  const [appoinementList, setAppoinmentList] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);

  const fetchPatientList = async ({page = 1} = {}) => {
    try {
      const res = await getAppointmentList({ page});
      setAppoinmentList(res.data || []);
    } catch (e) {
      console.log("Total fetch error:", e);
    }
  };

  useEffect(() => {
    const fetchCompletedTest = async ({page = 1 } = {}) => {
      try {
        const res = await getCompleteTest({ page });
        console.log("ressss",res)
        setCompletedTests(res.data || []);
      } catch (e) {
        console.log("Total fetch error:", e);
      }
    };

    fetchCompletedTest();
  }, []);

  useEffect(() => {
    fetchPatientList();
  }, []);

  const handleViewPatient = (id) => {
    router.push(`${caseHistory}/${id}`);
  };
  return {
    appoinementList,
    completedTests,
    handleViewPatient,
  };
}
