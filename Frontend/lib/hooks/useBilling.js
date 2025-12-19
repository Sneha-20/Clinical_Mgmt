import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { showToast } from "@/components/ui/toast";
import {
  getBillById,
  getTotalBillingList,
} from "../services/billing";

/**
 * This hook handles:
 * - Data fetching
 * - Search
 * - Payment handling
 * - Computed values (due / paid / totals)
 */
export default function useBilling() {
  const dispatch = useDispatch();
  const [billingData, setBillingData] = useState([]);
  const [billingDetail, setBillingDetail] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    fetchBillingList({ page: 1, search: searchQuery });
  }, [searchQuery]);

  const fetchBillingList = async ({ page = 1, search = "" } = {}) => {
    try {
      dispatch(startLoading());
      const response = await getTotalBillingList({ page, search });
      const resdata = response.billList || [];
      setBillingData(resdata);
    } catch (error) {
      showToast({ type: "error", message: "Failed to fetch Billing List" });
    } finally {
      dispatch(stopLoading());
    }
  };

  const fetchBillingById = async (visitId) => {
    setDialogOpen(true);
    setSelectedBilling(visitId);
    console.log("visitId in hook", visitId);
    try {
      dispatch(startLoading());
      const response = await getBillById(visitId);
      //   console.log("billing response",response)
      const resdata = response.billDetail || [];
      console.log("billing response", resdata);
      setBillingDetail(resdata);
    } catch (error) {
      console.log("error", error);
      showToast({ type: "error", message: "Failed to fetch Billing Detail" });
    } finally {
      dispatch(stopLoading());
    }
  };

  /* ---------------- FILTERED DATA ---------------- */
  const duePayments = useMemo(
    () => billingData.filter((b) => b.payment_status !== "Paid"),
    [billingData]
  );

  const paidPayments = useMemo(
    () => billingData.filter((b) => b.payment_status === "Paid"),
    [billingData]
  );

  /* ---------------- STATS ---------------- */
  const totalDue = useMemo(
    () => duePayments.reduce((sum, b) => sum + b.balance_due, 0),
    [duePayments]
  );

  const totalCollected = useMemo(
    () => paidPayments.reduce((sum, b) => sum + b.total_amount, 0),
    [paidPayments]
  );


  const handlePayNow = (id) => {
    setBillingData((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: "paid",
              amount_paid: b.total_amount,
              balance_due: 0,
            }
          : b
      )
    );

    setDialogOpen(false);

    showToast({ type: "success", message: "Payment Successfull" });
  };

  return {
    loading,
    searchQuery,
    setSearchQuery,
    dialogOpen,
    setDialogOpen,
    selectedBilling,
    billingDetail,

    duePayments,
    paidPayments,

    totalDue,
    totalCollected,

    // openBillingDetail,
    fetchBillingById,
    handlePayNow,
  };
}

