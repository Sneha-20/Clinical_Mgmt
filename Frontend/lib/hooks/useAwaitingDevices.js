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

    // clear previous serials
    setSerials([]);

    // fetch serials using booked device id from trial
    if (trial.booked_device_inventory) {
      fetchSerialsByDevice(trial.booked_device_inventory);
    }
  };

  // Close complete trial dialog
  const handleCloseDialog = () => {
    setCompleteTrialDialogOpen(false);
    setSelectedTrial(null);
    setForm(INITIAL_COMPLETE_FORM);
  };

  // Fetch serial numbers by device
  const fetchSerialsByDevice = async (deviceId) => {
    try {
      dispatch(startLoading());
      const response = await fetchSerialList({ deviceId });
      const resData = response.data || [];
      setSerials(
        resData.map((item) => ({
          label: item,
          value: item,
        }))
      );
    } catch (err) {
      console.log("Error fetching serials:", err);
      showToast({
        type: "error",
        message: "Failed to fetch serials",
      });
    } finally {
      dispatch(stopLoading());
    }
  };

  // Handle form change (serial selection)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle allocate serial and complete trial
  // Handle allocate serial and complete trial
  const handleCompleteTrial = async () => {
    if (!selectedTrial || !form.serialId) {
      showToast({
        type: "error",
        message: "Please select a serial number",
      });
      return;
    }

    try {
      setIsCompleting(true);
      dispatch(startLoading());

      const payload = {
        booked_device_serial: form.serialId,
      };

      await allocateTrialSerial(selectedTrial.id, payload);

      showToast({
        type: "success",
        message: "Device allocated successfully",
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
