import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { showToast } from "@/components/ui/toast";
import { useEffect, useState } from "react";
import {
  getAwaitingStockTrials,
  completeAwaitingStockTrial,
  fetchInventoryDevice,
  fetchSerialList,
} from "../services/audiologist";

const INITIAL_COMPLETE_FORM = {
  deviceId: null,
  serialId: null,
  notes: "",
};

export default function useAwaitingDevices() {
  const dispatch = useDispatch();
  const [awaitingDevicesList, setAwaitingDevicesList] = useState([]);
  const [totalPage, setTotalPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [inventoryDevice, setInventoryDevice] = useState([]);
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

  // Fetch inventory devices
  useEffect(() => {
    const getInventoryDevice = async () => {
      try {
        const res = await fetchInventoryDevice();
        const resData = res.data || [];
        setInventoryDevice(
          resData.map((item) => ({
            label: item.product_name,
            value: item.id,
            brand: item.brand,
            price: item.unit_price,
            qty: item.quantity_in_stock,
          }))
        );
      } catch (err) {
        console.log("Error fetching inventory devices:", err);
      }
    };
    getInventoryDevice();
  }, []);

  // Open complete trial dialog
  const openCompleteDialog = (trial) => {
    setCompleteTrialDialogOpen(true);
    setSelectedTrial(trial);
    setForm(INITIAL_COMPLETE_FORM);
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

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle complete trial
  const handleCompleteTrial = async () => {
    if (!selectedTrial || !form.deviceId || !form.serialId) {
      showToast({
        type: "error",
        message: "Please select device and serial number",
      });
      return;
    }

    try {
      setIsCompleting(true);
      dispatch(startLoading());

      const completeData = {
        device_booking_id: form.deviceId,
        serial_number: form.serialId,
        notes: form.notes || "",
      };

      await completeAwaitingStockTrial(selectedTrial.id, completeData);

      showToast({
        type: "success",
        message: "Trial completed successfully",
      });

      handleCloseDialog();
      fetchAwaitingDevices({ page: currentPage });
    } catch (error) {
      console.error("Error completing trial:", error);
      showToast({
        type: "error",
        message: error.message || "Failed to complete trial",
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
    inventoryDevice,
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
