import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { showToast } from "@/components/ui/toast";
import {
  getBillById,
  getDueBillList,
  getPaidBillList,
  markBillAsPaid,
} from "../services/billing";

export default function useBilling() {
  const dispatch = useDispatch();
  const [paidBillList, setPaidBillList] = useState([]);
  const [dueBillList, setDueBillList] = useState([]);
  const [billingDetail, setBillingDetail] = useState({});
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [paidPage, setPaidPage] = useState(1);
  const [duePage, setDuePage] = useState(1);

  const [paidTotalPages, setPaidTotalPages] = useState(1);
  const [dueTotalPages, setDueTotalPages] = useState(1);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    fetchPaidBillingList({ page: paidPage });
  }, [paidPage]);

    useEffect(() => {
    fetchDueBillingList({ page: duePage });
  }, [duePage]);

  const fetchPaidBillingList = async ({ page = 1, search = "" } = {}) => {     
    try { 
      dispatch(startLoading());
      const response = await getPaidBillList({ page, search });
      const resdata = response.paidBillList || [];
      setPaidTotalPages(response.totalPages)
      setPaidBillList(resdata);
    } catch (error) {
      showToast({ type: "error", message: "Failed to fetch paid Billing List" });
    } finally {
      dispatch(stopLoading());
    }
  };

   const fetchDueBillingList = async ({ page = 1, search = "" } = {}) => {     
    try { 
      dispatch(startLoading());
      const response = await getDueBillList({ page, search });
      const resdata = response.dueBillList || [];
      setDueBillList(resdata);
      setDueTotalPages(response.totalPages)
    } catch (error) {
      showToast({ type: "error", message: "Failed to fetch due Billing List" });
    } finally {
      dispatch(stopLoading());
    }
  };

  const fetchBillingById = async (visitId) => {
    setDialogOpen(true);
    setSelectedBilling(visitId);
    try {
      dispatch(startLoading());
      const response = await getBillById(visitId);
      console.log("ttt",response)
      const resdata = response.billDetail || [];
      setBillingDetail(resdata);
    } catch (error) {
      console.log("error", error);
      showToast({ type: "error", message: "Failed to fetch Billing Detail" });
    } finally {
      dispatch(stopLoading());
    }
  };

  const markAsPaid = async (billId) => {
    try {
      dispatch(startLoading());
      const paymentData = {
        payment_status: "Paid",
        payment_method: "UPI",
        transaction_id: "UPI-9909099900",
        notes: "FULLY AMOUNT PAID"
      };
      await markBillAsPaid(billId, paymentData);
      showToast({ type: "success", message: "Bill marked as paid successfully" });
      // Refresh both lists
      fetchPaidBillingList({ page: paidPage });
      fetchDueBillingList({ page: duePage });
      setSelectedBilling(null); // Close the dialog
    } catch (error) {
      console.log("error", error);
      showToast({ type: "error", message: "Failed to mark bill as paid" });
    } finally {
      dispatch(stopLoading());
    }
  };

  const nextPaidPage = () => {
    if (paidPage < paidTotalPages) setPaidPage((p) => p + 1);
    console.log("test1")
  };

  const prevPaidPage = () => {
    if (paidPage > 1) setPaidPage((p) => p - 1);
       console.log("test2")
  };

  const nextDuePage = () => {
    if (duePage < dueTotalPages) setDuePage((p) => p + 1);
       console.log("test3")
  };

  const prevDuePage = () => {
    if (duePage > 1) setDuePage((p) => p - 1);
       console.log("test4")
  };

  return {
    billingDetail,
    dialogOpen,
    paidBillList,
    dueBillList,
    selectedBilling,
    paidPage,
    duePage,
    paidTotalPages,
    dueTotalPages,

    /* actions */
    setPaidPage,
    setDuePage,
    nextPaidPage,
    prevPaidPage,
    nextDuePage,
    prevDuePage,
    
    setSelectedBilling,
    fetchBillingById,
    markAsPaid,
    // handlePayNow,
  };
}

