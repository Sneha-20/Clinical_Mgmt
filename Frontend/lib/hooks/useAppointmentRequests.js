import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { showToast } from "@/components/ui/toast";
import { getAppointmentRequests, markRequestAsContacted } from "../services/appointmentRequests";

export default function useAppointmentRequests() {
  const dispatch = useDispatch();
  const [requestsList, setRequestsList] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRequests = async (page = 1) => {
    try {
      dispatch(startLoading());
      const response = await getAppointmentRequests({ page });
      // API structure shows data or data.results
      const res = response?.data || response;
      setRequestsList(res.results || []);
      setTotalPage(Math.ceil((res.count || 0) / 10)); // Assuming 10 per page
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to fetch appointment requests",
      });
      console.error(error);
    } finally {
      dispatch(stopLoading());
    }
  };

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage]);

  const handleMarkContacted = async (requestId) => {
    try {
      dispatch(startLoading());
      await markRequestAsContacted(requestId, { contacted: true });
      showToast({
        type: "success",
        message: "Request marked as contacted",
      });
      fetchRequests(currentPage);
    } catch (error) {
       showToast({
        type: "error",
        message: "Failed to update status",
      });
    } finally {
      dispatch(stopLoading());
    }
  };

  const nextPage = () => {
    if (currentPage < totalPage) setCurrentPage((p) => p + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  return {
    requestsList,
    totalPage,
    currentPage,
    handleMarkContacted,
    nextPage,
    prevPage,
    refresh: () => fetchRequests(currentPage),
  };
}
