import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { showToast } from "@/components/ui/toast";
import { useEffect, useState } from "react";
import {
  bookedDeviceForm,
  fetchInventoryDevice,
  fetchSerialList,
  getActiveTrialDeviceList,
} from "../services/audiologist";

const INITIAL_BOOK_FORM = {
  deviceId: null,
  serialId: null,
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
  const [inventoryDevice, setInventoryDevice] = useState({});
  const [serials, setSerials] = useState([]);
  const [completeTrialDialogOpen, setCompleteTrialDialogOpen] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [selectedTrialId, setSelectedTrialId] = useState(null);
  const [selectedAction, setSelectedAction] = useState("BOOK");
const [form, setForm] = useState(INITIAL_BOOK_FORM);
const [extendForm, setExtendForm] = useState(INITIAL_EXTEND_FORM);
const [notBookReason, setNotBookReason] = useState(INITIAL_NOT_BOOK_REASON);

  useEffect(() => {
    const fetchTrialDevice = async ({ page = 1 } = {}) => {
      try {
        dispatch(startLoading());
        const response = await getActiveTrialDeviceList({ page });
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
    fetchTrialDevice({ page: currentPage });
  }, [currentPage]);

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
            price: item.price,
          }))
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

  const fetchSerialsByDevice = async (deviceId) => {
    try {
      dispatch(startLoading());
      const response = await fetchSerialList({ deviceId });
      const resData = response.data;
      setSerials(resData.map((item) => ({
        label:item,
        value:item
      })));
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to fetch serial list of selected device",
      });
    } finally {
      dispatch(stopLoading());
    }
  };

    const handleChange = async (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "deviceId") {
      setForm((prev) => ({ ...prev, serialId: null }));
      await fetchSerialsByDevice(value);
    }
  };

  const handleCompleteTrials = async () => {
    let payload = {};

  if (selectedAction === "BOOK") {
    payload = {
      trial_decision: "BOOK",
      booked_device_inventory: form.deviceId,
      booked_device_serial: form.serialId,
      completion_notes: form.notes || "",
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
 
    try{
      const res = await bookedDeviceForm(selectedTrialId,payload)
      handleCloseDialog()
    }catch(err){
       handleCloseDialog()
      console.log("Error:",err)
    }finally{
    setForm(INITIAL_BOOK_FORM);
    setExtendForm(INITIAL_EXTEND_FORM);
    setNotBookReason(INITIAL_NOT_BOOK_REASON);
    setSelectedAction("Book");
    }
  }

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
  };
}
