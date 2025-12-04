"use client";
import { useEffect, useState, useCallback } from "react";
import {
  getPatientList,
  getTodayPatientList,
  createPatient,
  addNewVisit,
  getDoctorList,
} from "@/lib/services/dashboard";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";

/**
 * usePatientData - handles listing, today's list, adding patient, adding visit,
 * and pagination.
 */
export default function usePatientData() {
  const [patients, setPatients] = useState([]);
  const [todayPatients, setTodayPatients] = useState([]);
  const [loadingTotal, setLoadingTotal] = useState(false);
  const [loadingToday, setLoadingToday] = useState(false);
  const [doctorList, seDoctorList] = useState([])
   const dispatch = useDispatch();
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
  });

  /** -------------------------
   *  MAP API PATIENT DATA
   * ------------------------*/
  const mapPatients = useCallback(
    (list = []) =>
      list.map((p) => ({
        id: p.patient_id,
        name: p.patient_name,
        phone: p.patient_phone || "",
        visitId: p.visit_id,
        visitType: p.visit_type || "New",
        status: p.status || "Test Pending",
        appointmentDate: p.appointment_date || "-",
      })),
    []
  );

  /** -------------------------
   *  FETCH ALL PATIENTS
   * ------------------------*/
  const fetchTotalPatients = useCallback(
    async (opts = { page: 1 }) => {
      setLoadingTotal(true);
      try {
        const result = await getPatientList(opts);

        setPatients(mapPatients(result.patients || []));

        setPagination((prev) => ({
          ...prev,
          totalItems: result.totalItems ?? prev.totalItems,
          totalPages: result.totalPages ?? prev.totalPages,
          currentPage: opts.page ?? prev.currentPage,
        }));
      } catch (err) {
        console.error("Error fetching total patients:", err);
      } finally {
        setLoadingTotal(false);
      }
    },
    [mapPatients]
  );

  /** -------------------------
   *  FETCH TODAY PATIENTS
   * ------------------------*/
  const fetchTodayPatients = useCallback(
    async (opts = { page: 1 }) => {
      setLoadingToday(true);
      try {
        const result = await getTodayPatientList(opts);

        setTodayPatients(mapPatients(result.patients || []));

        // If you want separate pagination for today, make a new state
        setPagination((prev) => ({
          ...prev,
          totalItems: result.totalItems ?? prev.totalItems,
          totalPages: result.totalPages ?? prev.totalPages,
          currentPage: opts.page ?? prev.currentPage,
        }));
      } catch (err) {
        console.error("Error fetching today patients:", err);
      } finally {
        setLoadingToday(false);
      }
    },
    [mapPatients]
  );

  /** -------------------------
   *  FETCH BOTH LISTS IN PARALLEL
   * ------------------------*/
  const fetchAll = useCallback(async (page = 1) => {
    await Promise.all([
      fetchTotalPatients({ page }),
      fetchTodayPatients({ page }),
    ]);
  }, [fetchTotalPatients, fetchTodayPatients]);

  /** -------------------------
   *  INITIAL LOAD
   * ------------------------*/
  useEffect(() => {
    fetchAll(1);
  }, [fetchAll]);

  /** -------------------------
   *  ADD NEW PATIENT
   * ------------------------*/
  const handleAddPatient = async (data) => {
     dispatch(startLoading());
    try {
      await createPatient(data);
      await fetchAll(pagination.currentPage);
    } catch (err) {
      console.error("Error adding patient:", err);
      throw err;
    }finally{
      dispatch(stopLoading());
    }
  };

  /** -------------------------
   *  ADD NEW VISIT
   * ------------------------*/
  const handleAddVisit = async (data) => {
    dispatch(startLoading());
    try {
      await addNewVisit(data);
      await fetchAll(pagination.currentPage);
      dispatch(stopLoading());
    } catch (err) {
      console.error("Error adding visit:", err);
      dispatch(stopLoading());
      throw err;
    }
  };

  const fetchDoctorList = async () => {
    try {
      const res = await getDoctorList();
      seDoctorList(res);
    } catch (err) {
      console.error("Error fetching doctor list:", err);
    }
    // Placeholder for fetching doctor list if needed in future
  };
   useEffect(() => {
      fetchDoctorList();
    }, []);
  /** -------------------------
   *  PAGINATION HANDLERS
   * ------------------------*/
  const goToNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      const nextPage = pagination.currentPage + 1;
      fetchAll(nextPage);
    }
  };

  const goToPreviousPage = () => {
    if (pagination.currentPage > 1) {
      const prevPage = pagination.currentPage - 1;
      fetchAll(prevPage);
    }
  };

  return {
    patients,
    todayPatients,
    loadingTotal,
    loadingToday,
    pagination,
    doctorList,

    // pagination handlers
    goToNextPage,
    goToPreviousPage,

    // direct fetch methods
    fetchTotalPatients,
    fetchTodayPatients,
    fetchDoctorList,
    fetchAll,

    // update patient/visit
    handleAddPatient,
    handleAddVisit,

    // expose setters if needed
    setPatients,
    setTodayPatients,
  };
}
