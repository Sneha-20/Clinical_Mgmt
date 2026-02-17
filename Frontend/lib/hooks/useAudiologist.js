import { useRouter } from "next/navigation";
import { routes } from "@/lib/utils/constants/route";
import { getAppointmentList, getCompleteTest } from "../services/audiologist";
import { useEffect, useState } from "react";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { useDispatch } from "react-redux";

export default function useAudiologist() {
  const dispatch = useDispatch();
  const router = useRouter();
  const caseHistory = routes.pages.patientCaseHistory;
  const visitDetail = routes.pages.patientVisitdetail;

  const [appoinementList, setAppoinmentList] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [prendingTestPage, setPendingtestPage] = useState(1);
  const [totalPendingTest, setTotalpendingTest] = useState(1);
  const [completedtestPage, setcompletedTestPage] = useState(1);
  const [totalCompletedTest, setTotalCompletedTest] = useState(1);

  const fetchPatientList = async ({ page = 1 } = {}) => {
    try {
      const res = await getAppointmentList({ page });
      setTotalpendingTest(res.totalPages)
      setAppoinmentList(res.data || []);
    } catch (e) {
      console.log("Total fetch error:", e);
    }
  };

  useEffect(() => {
    const fetchCompletedTest = async ({ page = 1 } = {}) => {
      try {
        dispatch(startLoading());
        const res = await getCompleteTest({ page });
        setTotalCompletedTest(res.totalPages);
        setCompletedTests(res.data || []);
        dispatch(stopLoading());
      } catch (e) {
        dispatch(stopLoading());
        console.log("Total fetch error:", e);
      }
    };

    fetchCompletedTest({ page: completedtestPage });
  }, [completedtestPage]);

  useEffect(() => {
    fetchPatientList({ page: prendingTestPage });
  }, [prendingTestPage]);

  const handleViewPatient = (id) => {
    router.push(`${caseHistory}/${id}`);
  };

  const showVisitDeteail = (visitId) => {
    router.push(`${visitDetail}/${visitId}`);
  };

  const nextPendingtest = () => {
    if (prendingTestPage < totalPendingTest) setPendingtestPage((p) => p + 1);
  };

  const prevPendingtest = () => {
    if (prendingTestPage > 1) setPendingtestPage((p) => p - 1);
  };

  const nextCompletedTest = () => {
    if (completedtestPage < totalCompletedTest)
      setcompletedTestPage((p) => p + 1);
  };

  const prevCompletedtest = () => {
    if (completedtestPage > 1) setcompletedTestPage((p) => p - 1);
  };

  const showCaseHistoryform = (visitId, step) => {
    localStorage.setItem("caseHistoryStep", step);
    router.push(`${caseHistory}/${visitId}`);
  };


  return {
    appoinementList,
    completedTests,
    totalPendingTest,
    prendingTestPage,
    completedtestPage,
    totalCompletedTest,
    prevCompletedtest,
    nextCompletedTest,
    prevPendingtest,
    nextPendingtest,
    handleViewPatient,
    showVisitDeteail,
    showCaseHistoryform,
  };
}
