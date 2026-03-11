import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { useEffect, useState, useCallback } from "react";
import { showToast } from "@/components/ui/toast";
import {
  addCaseHistory,
  addTrialForm,
  createReports,
  getModalList,
  getpatientHistoryById,
  getTrialDevice,
} from "../services/patientCaseHistory";

export default function useCaseHistory() {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientsCaseHistory, setPatientCaseHistory] = useState(null);
  const [testReports, setTestReports] = useState([]);
  const [trialDeviceList, setTrialDeviceList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalList, setModalList] = useState([]);
  const [selectedModal, setSelectedModal] = useState(null);

  const fetchPatientFormData = useCallback(async (id) => {
    if (!id) return;
    dispatch(startLoading());
    try {
      const res = await getpatientHistoryById(id);
      setPatientCaseHistory(res);
    } catch (err) {
      showToast({ type: "error", message: "Failed to fetch patient history" });
    } finally {
      dispatch(stopLoading());
    }
  }, [dispatch]);

  const fetchModalList = useCallback(async () => {
    try {
      const res = await getModalList();
      console.log("Modal List Response:", res);
      setModalList(res.data || []);
    } catch (e) {
      console.log("Total fetch error:", e);
    }
  }, []);

  useEffect(() => {
    fetchModalList();
  }, []);
  

  const fetchTrialDeviceList = useCallback(async ({ search }) => {
    try {
      const res = await getTrialDevice({
        serial_number: search,
        modal_id: selectedModal,
      });
      setTrialDeviceList(res);
    } catch (err) {
      showToast({
        type: "error",
        message: "Failed to fetch trial device list",
      });
    }
  }, [selectedModal]);

  useEffect(() => {
    if (selectedModal) {
      fetchTrialDeviceList({ search: searchTerm });
    }
  }, [searchTerm, selectedModal]);

  const registerTrialForm = useCallback(async (data) => {
    dispatch(startLoading());
    try {
      await addTrialForm(data);
      showToast({
        type: "success",
        message: data.status || "Trial added Successful",
      });
      dispatch(stopLoading());
    } catch (err) {
      showToast({
        type: "error",
        message: err?.error || "Failed to add trial",
      });
      dispatch(stopLoading());
    }
  }, [dispatch]);

  const registerCasehistory = useCallback(async (data) => {
    dispatch(startLoading());
    try {
      const res = await addCaseHistory(data);
      showToast({
        type: "success",
        message: data.status || "Registration Successful",
      });
      dispatch(stopLoading());
      return res;
    } catch (err) {
      showToast({
        type: "error",
        message: err?.error || "Registration Failed",
      });
      dispatch(stopLoading());
    }
  }, [dispatch]);

  const registerReports = useCallback(async (data) => {
    dispatch(startLoading());
    try {
      const res = await createReports(data);
      showToast({
        type: "success",
        message: "Reports saved successfully",
      });
      dispatch(stopLoading());
      return res;
    } catch (err) {
      showToast({
        type: "error",
        message: err?.error || "Failed to save reports",
      });
      dispatch(stopLoading());
    }
  }, [dispatch]);


  return {
    patientsCaseHistory,
    isModalOpen,
    trialDeviceList,
    searchTerm,
    modalList,
    setSearchTerm,
    setSelectedModal,
    setIsModalOpen,
    fetchPatientFormData,
    registerCasehistory,
    registerTrialForm,
    registerReports,
  };
}
