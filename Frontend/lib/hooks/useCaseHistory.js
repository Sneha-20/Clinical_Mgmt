import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { useEffect, useState } from "react";
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

  const fetchPatientFormData = async (id) => {
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
  };

  const fetchModalList = async () => {
    try {
      const res = await getModalList();
      console.log("Modal List Response:", res);
      setModalList(res.data || []);
    } catch (e) {
      console.log("Total fetch error:", e);
    }
  };

  useEffect(() => {
    fetchModalList();
  }, []);
  

  const fetchTrialDeviceList = async ({ search }) => {
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
  };

  useEffect(() => {
    if (selectedModal) {
      fetchTrialDeviceList({ search: searchTerm });
    }
  }, [searchTerm, selectedModal]);

  const registerTrialForm = async (data) => {
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
  };

  const registerCasehistory = async (data) => {
    dispatch(startLoading());
    try {
      await addCaseHistory(data);
      showToast({
        type: "success",
        message: data.status || "Registration Successful",
      });
      dispatch(stopLoading());
    } catch (err) {
      showToast({
        type: "error",
        message: err?.error || "Registration Failed",
      });
      dispatch(stopLoading());
    }
  };

  const registerReports = async (data) => {
    dispatch(startLoading());
    try {
      await createReports(data);
      showToast({
        type: "success",
        message: "Reports saved successfully",
      });
      dispatch(stopLoading());
    } catch (err) {
      showToast({
        type: "error",
        message: err?.error || "Failed to save reports",
      });
      dispatch(stopLoading());
    }
  };


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
