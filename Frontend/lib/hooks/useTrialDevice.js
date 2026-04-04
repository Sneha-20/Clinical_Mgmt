import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { showToast } from "@/components/ui/toast";
import { useEffect, useState } from "react";
import {
  bookedDeviceForm,
  fetchInventoryDevice,
  fetchSerialList,
  getActiveTrialDeviceList,
  returnTrialDevice,
} from "../services/audiologist";

const INITIAL_BOOK_FORM = {
  LEFT: {
    deviceId: null,
    serialId: null,
    isCustomization: false,
  },
  RIGHT: {
    deviceId: null,
    serialId: null,
    isCustomization: false,
  },
  notes: "",
};

const INITIAL_EXTEND_FORM = {
  dayCount: null,
  reason: "",
};

const INITIAL_NOT_BOOK_REASON = "";

export default function () {
  const dispatch = useDispatch();
  const [activeTrialDeviceList, setActiveTrialDeviceList] = useState([]);
  const [totalPage, setTotalpage] = useState(null);
  const [currentPage, setCurrenPage] = useState(1);
  const [inventoryDevice, setInventoryDevice] = useState([]);
  const [serials, setSerials] = useState({ LEFT: [], RIGHT: [] });
  const [completeTrialDialogOpen, setCompleteTrialDialogOpen] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [selectedTrialId, setSelectedTrialId] = useState(null);
  const [selectedAction, setSelectedAction] = useState("BOOK");
  const [form, setForm] = useState(INITIAL_BOOK_FORM);
  const [extendForm, setExtendForm] = useState(INITIAL_EXTEND_FORM);
  const [notBookReason, setNotBookReason] = useState(INITIAL_NOT_BOOK_REASON);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDecision, setFilterDecision] = useState("All");

  const fetchTrialDevice = async ({ page = 1, search = "", decision = "" } = {}) => {
    try {
      dispatch(startLoading());
      const response = await getActiveTrialDeviceList({ page, search, decision });
      const resData = response.data;
      setActiveTrialDeviceList(resData);
      setTotalpage(response.totalPages);
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to fetch active trial device List",
      });
    } finally {
      dispatch(stopLoading());
    }
  };
  useEffect(() => {
    fetchTrialDevice({ page: currentPage, search: searchTerm, decision: filterDecision });
  }, [currentPage, searchTerm, filterDecision]);

  useEffect(() => {
    const getInventoryDevice = async () => {
      try {
        const res = await fetchInventoryDevice();
        const resData = res.data;
        setInventoryDevice(
          resData.map((item) => ({
            label: item.product_name,
            value: item.id,
            brand: item.brand,
            price: item.unit_price,
            qty: item.quantity_in_stock,
          })),
        );
      } catch (err) {
        console.log("Error", err);
      }
    };
    getInventoryDevice();
  }, []);

  const openDecisionDialog = (trial) => {
    console.log("Selected Trial:", trial.id);
    setCompleteTrialDialogOpen(true);
    setSelectedTrial(trial);
    setSelectedTrialId(trial.id);
  };
  const handleCloseDialog = () => {
    setCompleteTrialDialogOpen(false);
    setSelectedTrial(null);
  };

  const fetchSerialsByDevice = async (deviceId, earSide) => {
    try {
      dispatch(startLoading());
      const response = await fetchSerialList({ deviceId });
      const resData = response.data;
      setSerials((prev) => ({
        ...prev,
        [earSide]: resData.map((item) => ({
          label: item,
          value: item,
        })),
      }));
    } catch (error) {
      showToast({
        type: "error",
        message: `Failed to fetch serial list for ${earSide} ear device`,
      });
    } finally {
      dispatch(stopLoading());
    }
  };

  // const handleChange = async (name, value) => {
  //   setForm((prev) => ({ ...prev, [name]: value }));
  //   if (name === "deviceId") {
  //     setForm((prev) => ({ ...prev, serialId: null }));
  //     const selected = inventoryDevice.find((d) => d.value === value);
  //     if (selected?.qty === 0) {
  //       showToast({
  //         type: "warning",
  //         message:
  //           "Selected device is out of stock – booking will be marked as awaiting stock.",
  //       });
  //       setSerials([]);
  //     } else {
  //       await fetchSerialsByDevice(value);
  //     }
  //   }
  // };
  const handleChange = async (name, value, earSide = null) => {
    if (earSide) {
      setForm((prev) => {
        let updatedEar = { ...prev[earSide], [name]: value };

        // 🔹 Device change logic
        if (name === "deviceId") {
          updatedEar.serialId = null;

          const selected = inventoryDevice.find((d) => d.value === value);

          if (selected?.qty === 0) {
            showToast({
              type: "warning",
              message:
                "Selected device is out of stock – booking will be marked as awaiting stock.",
            });
            setSerials((prevSerials) => ({ ...prevSerials, [earSide]: [] }));
          } else {
            fetchSerialsByDevice(value, earSide);
          }
        }

        // 🔹 Checkbox (Customization) logic
        if (name === "isCustomization") {
          showToast({
            type: "info",
            message: value
              ? "Customization enabled for this booking."
              : "Customization removed.",
          });
        }

        return { ...prev, [earSide]: updatedEar };
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleCompleteTrials = async () => {
    let payload = {};

    if (selectedAction === "BOOK") {
      const booked_devices = [];

      // Check which ears were trialled
      const trialledEars =
        selectedTrial?.device_details?.map((d) => d.ear_side) || [];

      trialledEars.forEach((ear) => {
        const earData = form[ear];
        const selected = inventoryDevice.find((d) => d.value === earData.deviceId);

        if (earData.deviceId) {
          let booking_status = "";
          
          if (!earData.serialId || selected?.qty === 0) {
            booking_status = "BOOK - Awaiting Stock";
          } else if (earData.isCustomization) {
            booking_status = "BOOK - With Customization";
          } else {
            booking_status = "BOOK - Device Allocated";
          }

          booked_devices.push({
            ear_side: ear,
            inventory_item_id: earData.deviceId,
            serial_number: earData.serialId || null,
            booking_status: booking_status,
            device_name: selected?.label || "Hearing Aid",
          });
        }
      });

      payload = {
        trial_decision: "BOOKED",
        completion_notes: form.notes || "Trial completed, devices booked",
        booked_devices: booked_devices,
      };
    }

    if (selectedAction === "DECLINE") {
      payload = {
        trial_decision: "DECLINE",
        completion_notes: notBookReason,
      };
    }

    if (selectedAction === "FOLLOWUP") {
      payload = {
        trial_decision: "TRIAL ACTIVE",
        next_followup: extendForm.dayCount,
        completion_notes: extendForm.reason,
      };
    }
    console.log("Payload for Trial Completion:", payload);
    try {
      const res = await bookedDeviceForm(selectedTrialId, payload);

      // Return trial devices (send single payload with left/right serials)
      const devices =
        selectedTrial?.device_details_list ||
        selectedTrial?.device_details ||
        [];
      const leftDevice = devices.find((d) => d.ear_side === "LEFT");
      const rightDevice = devices.find((d) => d.ear_side === "RIGHT");

      const returnPayload = {
        left_serial_number: leftDevice?.serial_number || null,
        right_serial_number: rightDevice?.serial_number || null,
        device_condition_on_return: "Device returned after trial completion",
      };

      await returnTrialDevice(returnPayload);

      showToast({
        type: "success",
        message: res?.message || "Trial completed successfully",
      });

      fetchTrialDevice({ page: currentPage });
      handleCloseDialog();
    } catch (err) {
      handleCloseDialog();
      console.log("Error:", err);
    } finally {
      setForm(INITIAL_BOOK_FORM);
      setExtendForm(INITIAL_EXTEND_FORM);
      setNotBookReason(INITIAL_NOT_BOOK_REASON);
      setSelectedAction("BOOK");
    }
  };

  const handleExtendChange = (name, value) => {
    setExtendForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextPage = () => {
    if (currentPage < totalPage) setCurrenPage((p) => p + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrenPage((p) => p - 1);
  };

  return {
    activeTrialDeviceList,
    inventoryDevice,
    serials,
    totalPage,
    currentPage,
    form,
    selectedTrial,
    completeTrialDialogOpen,
    notBookReason,
    extendForm,
    selectedAction,

    setSelectedAction,
    handleExtendChange,
    setExtendForm,
    setNotBookReason,
    handleCloseDialog,
    openDecisionDialog,
    handleCompleteTrials,
    handleChange,
    fetchSerialsByDevice,
    nextPage,
    prevPage,
    searchTerm,
    setSearchTerm,
    filterDecision,
    setFilterDecision,
  };
}
