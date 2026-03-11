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
import { getDashboardStats } from "@/lib/services/dashboard";
import {
  getInventorySerialList,
  getPurchaseInventoryItems,
} from "../services/inventory";

export default function usePatientData() {
  const dispatch = useDispatch();
  const router = useRouter();

  const userprofile = routes.pages.userptofile;

  // Stats
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayVisits: 0,
    pendingTests: 0,
    followUps: 0,
  });

  // Active tab
  const [activeTab, setActiveTab] = useState("today");
  const [serviceType, setServiceType] = useState("All");
  const [visitStatus, setVisitStatus] = useState("All");

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Data
  const [patients, setPatients] = useState([]);
  const [todayPatients, setTodayPatients] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);

  // Loading
  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingTotal, setLoadingTotal] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    today: { currentPage: 1, totalPages: 1, totalItems: 0 },
    total: { currentPage: 1, totalPages: 1, totalItems: 0 },
  });

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      console.log("Stats data:", data);
      setStats({
        totalPatients: data.total_patients || 0,
        todayVisits: data.todays_visits || 0,
        pendingServices: data.pending_services || 0,
        followUpVisits: data.followup_visits || 0,
      });
    } catch (err) {
      console.error("Stats fetch error:", err);
      // setError(err.message || "Failed to fetch statistics");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
    [],
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
    async ({ page = 1, search = "", service = "", status = "" } = {}) => {
      setLoadingTotal(true);
      try {
        const res = await getPatientList({ page, search, service, status });
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
    [mapPatients],
  );

  // ------------------------------------------
  // FETCH TODAY PATIENTS
  // ------------------------------------------
  const fetchTodayPatients = useCallback(
    async ({ page = "", search = "", service = "", status = "" } = {}) => {
      setLoadingToday(true);
      try {
        const res = await getTodayPatientList({
          page,
          search,
          service,
          status,
        });

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
    [mapPatients],
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
    if (!serviceType) return;
    if (activeTab === "today") {
      fetchTodayPatients({
        page: 1,
        search: searchTerm,
        service: serviceType,
        status: visitStatus,
      });
    } else {
      fetchTotalPatients({
        page: 1,
        search: searchTerm,
        service: serviceType,
        status: visitStatus,
      });
    }
  }, [serviceType, activeTab, visitStatus]);

  // ------------------------------------------
  // SEARCH
  // ------------------------------------------
  useEffect(() => {
    if (activeTab === "today") {
      fetchTodayPatients({
        page: 1,
        search: searchTerm,
        service: serviceType,
        status: visitStatus,
      });
    } else {
      fetchTotalPatients({
        page: 1,
        search: searchTerm,
        service: serviceType,
        status: visitStatus,
      });
    }
  }, [searchTerm]);

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
      console.log("ttttt", error);
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
      console.log("ttttt", error);
      showToast({
        type: "error",
        message: error?.error || "Registration Failed",
      });
      dispatch(stopLoading());
    }
  };

  const fetchInventoryItems = async () => {
    try {
      setLoadingInventory(true);
      const response = await getPurchaseInventoryItems();
      const itemOptions = response.map((item) => ({
        label: `${item.category} - ${item.product_name} (${item.brand_name})`,
        value: item.id,
        stock_type: item.stock_type,
      }));
      setInventoryItems(itemOptions);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      showToast({
        type: "error",
        message: "Failed to fetch inventory items",
      });
    } finally {
      setLoadingInventory(false);
    }
  };
  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchSerialsForItem = async (inventoryItemId, showAvailableOnly = false) => {
    try {
      console.log("showAvailableOnly", showAvailableOnly);
      const params = { inventory_item: inventoryItemId, show_available_only: showAvailableOnly };
      const response = await getInventorySerialList(params);
      const serialOptions = response.data.map((serial) => {
        const serialNumber =
          typeof serial === "string" ? serial : serial.serial_number;
        return {
          label: serialNumber,
          value: serialNumber,
        };
      });
      return serialOptions;
    } catch (error) {
      console.error("Error fetching serials:", error);
      showToast({
        type: "error",
        message: "Failed to fetch serial numbers",
      });
      return [];
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

    visitStatus,
    setVisitStatus,

    activeTab,
    setActiveTab,

    searchTerm,
    setSearchTerm,

    patients,
    todayPatients,
    doctorList,
    inventoryItems,
    loadingInventory,

    loadingToday,
    loadingTotal,

    pagination: pagination[activeTab],
    stats,

    goToNextPage,
    goToPreviousPage,

    handleAddPatient,
    handleAddVisit,
    handleViewProfile,
    fetchSerialsForItem,
    refetch: fetchStats,
  };
}
