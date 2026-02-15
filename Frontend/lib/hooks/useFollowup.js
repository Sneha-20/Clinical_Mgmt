"use client";
import { useState, useEffect, useCallback } from "react";
import { getFollowupList, markAsContacted } from "@/lib/services/followupStatus";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/utils/constants/route";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { showToast } from "@/components/ui/toast";

/**
 * Custom hook for managing followup list functionality
 * @param {boolean} contacted - true for completed, false for pending followups
 */
export default function useFollowup(contacted) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Map API response to component expected format
  const mapFollowupPatients = useCallback((list = []) => {
    return list.map((p) => ({
      id: p.patient_id,
      visitId: p.visit_id,
      patientName: p.patient_name,
      patientPhone: p.patient_phone || "",
      visitType: p.visit_type || "New Test",
      seenBy: p.seen_by || "",
      appointmentDate: p.appointment_date || "-",
      statusNote: p.status_note || "",
      contacted: p.contacted,
    }));
  }, []);

  const fetchFollowups = useCallback(
    async (page = 1) => {
      try {
        dispatch(startLoading());
        const data = await getFollowupList({ page, contacted });
        const mappedPatients = mapFollowupPatients(data.patients || []);
        setPatients(mappedPatients);
        setPagination({
          currentPage: page,
          totalPages: data.totalPages || 1,
          totalItems: data.totalItems || 0,
        });
      } catch (error) {
        console.error(`Error fetching ${contacted ? "completed" : "pending"} followups:`, error);
        setPatients([]);
      } finally {
        dispatch(stopLoading());
      }
    },
    [contacted, mapFollowupPatients, dispatch]
  );

  useEffect(() => {
    fetchFollowups(1);
  }, [fetchFollowups]);

  const handleMarkAsContacted = useCallback(
    async (visitId) => {
      try {
        dispatch(startLoading());
        await markAsContacted(visitId);
        showToast({ type: "success", message: "Patient marked as contacted successfully" });
        // Refetch the list
        await fetchFollowups(pagination.currentPage);
      } catch (error) {
        console.error("Error marking as contacted:", error);
        showToast({ type: "error", message: "Failed to mark patient as contacted" });
      } finally {
        dispatch(stopLoading());
      }
    },
    [fetchFollowups, pagination, dispatch]
  );

  const handleViewProfile = useCallback(
    (patientId) => {
      if (patientId) {
        router.push(`${routes.pages.userptofile}/${patientId}`);
      }
    },
    [router]
  );

  const handleNextPage = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages) {
      fetchFollowups(pagination.currentPage + 1);
    }
  }, [pagination, fetchFollowups]);

  const handlePrevPage = useCallback(() => {
    if (pagination.currentPage > 1) {
      fetchFollowups(pagination.currentPage - 1);
    }
  }, [pagination, fetchFollowups]);

  return {
    patients,
    pagination,
    handleViewProfile,
    handleNextPage,
    handlePrevPage,
    handleMarkAsContacted,
    refetch: () => fetchFollowups(pagination.currentPage),
  };
}
