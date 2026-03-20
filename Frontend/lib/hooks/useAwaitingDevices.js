import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { showToast } from "@/components/ui/toast";
import { useEffect, useState } from "react";
import {
  getAwaitingStockTrials,
  allocateTrialSerial,
  fetchSerialList,
} from "../services/audiologist";

const INITIAL_COMPLETE_FORM = {
  serialId: "",
  is_customization_completed: false, // For customization trials
};

export default function useAwaitingDevices() {
  const dispatch = useDispatch();
  const [awaitingDevicesList, setAwaitingDevicesList] = useState([]);
  const [totalPage, setTotalPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  // inventoryDevice removed per new requirements
  // const [inventoryDevice, setInventoryDevice] = useState([]);
  const [serials, setSerials] = useState([]);
  const [completeTrialDialogOpen, setCompleteTrialDialogOpen] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [form, setForm] = useState(INITIAL_COMPLETE_FORM);
  const [isCompleting, setIsCompleting] = useState(false);

  // Fetch awaiting devices list
  const fetchAwaitingDevices = async ({ page = 1 } = {}) => {
    try {
      dispatch(startLoading());
      const response = await getAwaitingStockTrials({ page });
      const resData = response.data || [];
      setAwaitingDevicesList(resData);
      setTotalPage(response.totalPages);
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to fetch awaiting device list",
      });
      console.error("Error fetching awaiting devices:", error);
    } finally {
      dispatch(stopLoading());
    }
  };

  useEffect(() => {
    fetchAwaitingDevices({ page: currentPage });
  }, [currentPage]);

  // Open complete trial dialog
  const openCompleteDialog = (trial) => {
    setCompleteTrialDialogOpen(true);
    setSelectedTrial(trial);
    setForm(INITIAL_COMPLETE_FORM);
    setSerials([]);

    const isCustomization = 
      trial?.trial_decision === "BOOK - With Customization" && 
      trial?.device_serial_no !== null;

    if (!isCustomization && trial.booked_device_inventory) {
      fetchSerialsByDevice(trial.booked_device_inventory);
    }
  };
  const handleCloseDialog = () => {
    setCompleteTrialDialogOpen(false);
    setSelectedTrial(null);
    setForm(INITIAL_COMPLETE_FORM);
  };

  const fetchSerialsByDevice = async (deviceId) => {
    try {
      dispatch(startLoading());
      const response = await fetchSerialList({ deviceId });
      const resData = response.data || [];
      const serialOptions = resData.map((item) => ({ label: item, value: item }));
      setSerials(serialOptions);

      if (selectedTrial?.serial_number) {
        const match = serialOptions.find((s) => s.value === selectedTrial.serial_number);
        if (match) setForm((prev) => ({ ...prev, serialId: match.value }));
      }
    } catch (err) {
      showToast({
        type: "error",
        message: "Failed to fetch serials",
      });
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompleteTrial = async () => {
    const isCustomization =
      selectedTrial?.trial_decision === "BOOK - With Customization" &&
      selectedTrial?.device_serial_no !== null;

    if (!isCustomization && (!selectedTrial || !form.serialId)) {
      showToast({
        type: "error",
        message: "Please select a serial number",
      });
      return;
    }

    if (isCustomization && form.is_customization_completed === undefined) {
      showToast({ type: "error", message: "Please select customization status" });
      return;
    }

    try {
      setIsCompleting(true);
      dispatch(startLoading());

      const payload = isCustomization
        ? { is_customization_completed: form.is_customization_completed }
        : { booked_device_serial: form.serialId };

      await allocateTrialSerial(selectedTrial.id, payload);

      showToast({
        type: "success",
        message: "Status updated successfully",
      });

      handleCloseDialog();
      fetchAwaitingDevices({ page: currentPage });
    } catch (error) {
      console.error("Error allocating serial:", error);
      showToast({
        type: "error",
        message: error.message || "Failed to allocate serial",
      });
    } finally {
      setIsCompleting(false);
      dispatch(stopLoading());
    }
  };

  // Pagination handlers
  const nextPage = () => {
    if (currentPage < totalPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    awaitingDevicesList,
    totalPage,
    currentPage,
    setCurrentPage,
    serials,
    completeTrialDialogOpen,
    selectedTrial,
    form,
    isCompleting,
    fetchAwaitingDevices,
    openCompleteDialog,
    handleCloseDialog,
    fetchSerialsByDevice,
    handleChange,
    handleCompleteTrial,
    nextPage,
    prevPage,
  };
}
