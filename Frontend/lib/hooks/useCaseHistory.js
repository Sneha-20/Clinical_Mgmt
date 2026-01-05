import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { useEffect, useState } from "react";
import { showToast } from "@/components/ui/toast";
import {
  addCaseHistory,
  addTestFile,
  deleteTestReport,
  getAllTestFile,
  getpatientHistoryById,
} from "../services/patientCaseHistory";

export default function useCaseHistory() {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientsCaseHistory, setPatientCaseHistory] = useState(null);
  const [testType, setTestType] = useState(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [testFileList, setTestFileList] = useState([]);
  const [visitId, setVisitId] = useState(null);

  const fetchPatientFormData = async (patientId) => {
    if (!patientId) return;
    setVisitId(patientId);
    dispatch(startLoading());
    try {
      const res = await getpatientHistoryById(patientId);
      setPatientCaseHistory(res);
    } catch (err) {
      showToast({ type: "error", message: "Failed to fetch patient history" });
    } finally {
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

  const handleFileSubmit = async () => {
    if (!file || !testType) {
      showToast({
        type: "error",
        message: "Please select test type and file",
      });
      return;
    }
    dispatch(startLoading());
    try {
      const formData = new FormData();
      formData.append("patient_visit", visitId);
      formData.append("file_type", testType);
      formData.append("file", file);
      const res = await addTestFile(formData);
      showToast({
        type: "success",
        message: res?.status || "File uploaded successfully",
      });

      // Reset
      // setFile(null);
      // setFileName(null);
      // setTestType(null);
      setIsModalOpen(false);
      fetchTestFile();
    } catch (err) {
      showToast({
        type: "error",
        message: err?.error || "Upload failed",
      });
    } finally {
      dispatch(stopLoading());
    }
  };

  const fetchTestFile = async () => {
    try {
      const res = await getAllTestFile(visitId);
      setTestFileList(res);
    } catch (err) {
      console.log(err);
    }
  };

    const handleDeleteReport = async (fileId) => {
    try {
      const res = await deleteTestReport(fileId);
       showToast({
        type: "success",
        message: res?.message || "File deleted successfully",
      });
      fetchTestFile();
    } catch (err) {
       showToast({
        type: "error",
        message: err?.message || "Failed to delete file ",
      });
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTestFile();
  },[])

  return {
    patientsCaseHistory,
    fileName,
    file,
    testType,
    isModalOpen,
    testFileList,
    handleDeleteReport,
    setIsModalOpen,
    setTestType,
    setFile,
    handleFileSubmit,
    setFileName,
    fetchPatientFormData,
    registerCasehistory,
  };
}
