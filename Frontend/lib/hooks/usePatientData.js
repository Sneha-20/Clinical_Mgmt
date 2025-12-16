"use client";
import { useEffect, useState, useCallback } from "react";
import {
  getPatientList,
  getTodayPatientList,
  createPatient,
  addNewVisit,
  getDoctorList,
} from "@/lib/services/dashboard";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/utils/constants/route";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { showToast } from "@/components/ui/toast";
import { useDispatch } from "react-redux";

export default function usePatientData() {
   const dispatch = useDispatch();
  const router = useRouter();

  const userprofile = routes.pages.userptofile;

  // Active tab
  const [activeTab, setActiveTab] = useState("today");
   const [serviceType, setServiceType] = useState("All");

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Data
  const [patients, setPatients] = useState([]);
  const [todayPatients, setTodayPatients] = useState([]);
  const [doctorList, setDoctorList] = useState([]);

  // Loading
  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingTotal, setLoadingTotal] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    today: { currentPage: 1, totalPages: 1, totalItems: 0 },
    total: { currentPage: 1, totalPages: 1, totalItems: 0 },
  });

  // MAP
  const mapPatients = useCallback(
    (list = []) =>
      list.map((p) => ({
        id: p.patient_id,
        name: p.patient_name,
        phone: p.patient_phone || "",
        visitId: p.visit_id,
        seenBy: p.seen_by,
        visitType: p.visit_type || "New",
        status: p.status || "Test Pending",
        appointmentDate: p.appointment_date || "-",
      })),
    []
  );

  // ------------------------------------------
  // FETCH DOCTORS
  // ------------------------------------------
  const loadDoctors = async () => {
    try {
      const result = await getDoctorList();
      setDoctorList(result || []);
    } catch (e) {
      console.log("Doctor fetch error:", e);
    }
  };

  // ------------------------------------------
  // FETCH TOTAL PATIENTS
  // ------------------------------------------
  const fetchTotalPatients = useCallback(
    async ({ page = 1, search = "",service="" } = {}) => {
      setLoadingTotal(true);
      try {
        const res = await getPatientList({ page, search, service });

        setPatients(mapPatients(res.patients || []));

        setPagination((prev) => ({
          ...prev,
          total: {
            currentPage: page,
            totalPages: res.totalPages,
            totalItems: res.totalItems,
          },
        }));
      } catch (e) {
        console.log("Total fetch error:", e);
      } finally {
        setLoadingTotal(false);
      }
    },
    [mapPatients]
  );

  // ------------------------------------------
  // FETCH TODAY PATIENTS
  // ------------------------------------------
  const fetchTodayPatients = useCallback(
    async ({ page = "", search = "", service= "" } = {}) => {
      setLoadingToday(true);
      try {
        const res = await getTodayPatientList({ page, search, service });

        setTodayPatients(mapPatients(res.patients || []));

        setPagination((prev) => ({
          ...prev,
          today: {
            currentPage: page,
            totalPages: res.totalPages,
            totalItems: res.totalItems,
          },
        }));
      } catch (e) {
        console.log("Today fetch error:", e);
      } finally {
        setLoadingToday(false);
      }
    },
    [mapPatients]
  );

  // ------------------------------------------
  // LOAD ON MOUNT
  // ------------------------------------------
  useEffect(() => {
    loadDoctors();
    fetchTodayPatients({ page: 1 });
  }, []);

  // ------------------------------------------
  // TAB SWITCH
  // ------------------------------------------
useEffect(() => {
  console.log("serviceType",serviceType)
  if (!serviceType) return;

  if (activeTab === "today") {
    fetchTodayPatients({ page: 1, search: searchTerm, service:serviceType });
  } else {
    fetchTotalPatients({ page: 1, search: searchTerm, service:serviceType });
  }
}, [serviceType,activeTab]);

  // ------------------------------------------
  // SEARCH
  // ------------------------------------------
  useEffect(() => {
    if (activeTab === "today") {
      fetchTodayPatients({ page: 1, search: searchTerm, service:serviceType });
    } else {
      fetchTotalPatients({ page: 1, search: searchTerm, service:serviceType});
    }
  }, [searchTerm]);

  // useEffect(() => {
  //   if (serviceType === "today") {
  //     fetchTodayPatients({ page: 1, search: searchTerm });
  //   } else {
  //     fetchTotalPatients({ page: 1, search: searchTerm });
  //   }
  // }, [searchTerm]);

  // ------------------------------------------
  // PAGINATION
  // ------------------------------------------
  const goToNextPage = () => {
    const curr = pagination[activeTab];
    if (curr.currentPage < curr.totalPages) {
      const next = curr.currentPage + 1;

      activeTab === "today"
        ? fetchTodayPatients({ page: next, search: searchTerm })
        : fetchTotalPatients({ page: next, search: searchTerm });
    }
  };

  const goToPreviousPage = () => {
    const curr = pagination[activeTab];
    if (curr.currentPage > 1) {
      const prev = curr.currentPage - 1;

      activeTab === "today"
        ? fetchTodayPatients({ page: prev, search: searchTerm })
        : fetchTotalPatients({ page: prev, search: searchTerm });
    }
  };

  // ------------------------------------------
  // ADD PATIENT
  // ------------------------------------------
  const handleAddPatient = async (data) => {
    dispatch(startLoading());
    try {
      await createPatient(data);
      showToast({
        type: "success",
        message: data.status || "Registration Successful",
      });
      fetchTodayPatients({ page: 1 });
       dispatch(stopLoading());
    } catch (error) {
      console.log("ttttt",error)
      showToast({
        type: "error",
        message: error?.error || "Registration Failed",
      });
       dispatch(stopLoading());
    }
  };

  // ------------------------------------------
  // ADD VISIT
  // ------------------------------------------
  const handleAddVisit = async (data) => {
    console.log("tttttt")
     dispatch(startLoading());
    try {
     await addNewVisit(data);
      showToast({
        type: "success",
        message: data.status || "Registration Successful",
      });
      fetchTodayPatients({ page: 1 });
      dispatch(stopLoading());
    } catch (error) {
      console.log("ttttt",error)
      showToast({
        type: "error",
        message: error?.error || "Registration Failed",
      });
       dispatch(stopLoading());
    }
    
  };

  // ------------------------------------------
  // VIEW PROFILE
  // ------------------------------------------
  const handleViewProfile = (id) => {
    router.push(`${userprofile}/${id}`);
  };

  

  return {
    serviceType,
    setServiceType,

    activeTab,
    setActiveTab,

    searchTerm,
    setSearchTerm,

    patients,
    todayPatients,
    doctorList,

    loadingToday,
    loadingTotal,

    pagination: pagination[activeTab],

    goToNextPage,
    goToPreviousPage,

    handleAddPatient,
    handleAddVisit,
    handleViewProfile,
  };
}
