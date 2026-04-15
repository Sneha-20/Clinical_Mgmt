"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { getBillById, markBillAsPaid, applyDiscountUpdate } from "@/lib/services/billing";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "@/lib/redux/slice/uiSlice";
import { showToast } from "@/components/ui/toast";
import Modal from "@/components/ui/Modal";
import { getExcludingHearingAids } from "@/lib/services/inventory";
import { addBillItems } from "@/lib/services/billing";
import { Search, Package, IndianRupee, Tag, Check, CheckSquare, Square, Filter } from "lucide-react";

export default function BillingDetailPage() {
  const [openModal, setOpenModal] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [discountFields, setDiscountFields] = useState([{ item_id: "", discount_amount: "" }]);
  const [itemsByCategory, setItemsByCategory] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItems, setSelectedItems] = useState({}); // { id: { ...item, selected_serials or quantity } }

  const openDiscountDialog = () => {
    setDiscountFields([{ item_id: "", discount_amount: "" }]);
    setOpenModal(true);
  };
  const closeDiscountDialog = () => {
    setOpenModal(false);
  };

  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const visitId = params.visitId;

  const [billingDetail, setBillingDetail] = useState({});

  useEffect(() => {
    fetchBillingDetail();
  }, [visitId]);

  const fetchBillingDetail = async () => {
    try {
      dispatch(startLoading());
      const response = await getBillById(visitId);
      const resdata = response.billDetail || {};
      setBillingDetail(resdata);
    } catch (error) {
      showToast({ type: "error", message: "Failed to fetch Billing Detail" });
    } finally {
      dispatch(stopLoading());
    }
  };

  const fetchInventoryItems = async () => {
    try {
      dispatch(startLoading());
      const data = await getExcludingHearingAids();
      setItemsByCategory(data || {});
      setPurchaseModalOpen(true);
    } catch (error) {
      showToast({ type: "error", message: "Failed to fetch inventory items" });
    } finally {
      dispatch(stopLoading());
    }
  };

  const toggleSelectItem = (item) => {
    setSelectedItems(prev => {
      const copy = { ...prev };
      if (copy[item.id]) {
        delete copy[item.id];
      } else {
        const isSerialized = item.stock_info?.type === "serialized";
        copy[item.id] = {
          ...item,
          inventory_item_id: item.id,
          // For serialized: track selected serial numbers (array)
          // For non-serialized: track quantity
          selected_serials: isSerialized ? [] : null,
          quantity: isSerialized ? null : 1,
        };
      }
      return copy;
    });
  };

  const updateSelectedItem = (id, field, value) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const toggleSerialNumber = (itemId, serial) => {
    setSelectedItems(prev => {
      const current = prev[itemId];
      if (!current) return prev;
      const serials = current.selected_serials || [];
      const updated = serials.includes(serial)
        ? serials.filter(s => s !== serial)
        : [...serials, serial];
      return { ...prev, [itemId]: { ...current, selected_serials: updated } };
    });
  };

  const handleSavePurchase = async () => {
    const selected = Object.values(selectedItems);

    if (selected.length === 0) {
      showToast({ type: "error", message: "Please select at least one item." });
      return;
    }

    // Validate serialized items have at least one serial selected
    const invalidSerialized = selected.filter(
      item => item.stock_info?.type === "serialized" && (!item.selected_serials || item.selected_serials.length === 0)
    );
    if (invalidSerialized.length > 0) {
      showToast({ type: "error", message: `Please select at least one serial number for: ${invalidSerialized.map(i => i.product_name).join(", ")}` });
      return;
    }

    // Validate non-serialized items have quantity > 0
    const invalidQty = selected.filter(
      item => item.stock_info?.type === "non_serialized" && (!item.quantity || Number(item.quantity) < 1)
    );
    if (invalidQty.length > 0) {
      showToast({ type: "error", message: `Please enter a valid quantity for: ${invalidQty.map(i => i.product_name).join(", ")}` });
      return;
    }

    // Build payload items
    const items = selected.map(item => {
      const isSerialized = item.stock_info?.type === "serialized";
      if (isSerialized) {
        return {
          inventory_item_id: Number(item.inventory_item_id),
          serial_numbers: item.selected_serials
        };
      } else {
        return {
          inventory_item_id: Number(item.inventory_item_id),
          quantity: Number(item.quantity)
        };
      }
    });

    try {
      dispatch(startLoading());
      const payload = {
        bill_id: Number(billingDetail.id),
        items: items
      };
      await addBillItems(payload);
      showToast({ type: "success", message: "Items added to bill successfully" });
      setPurchaseModalOpen(false);
      setSelectedItems({});
      fetchBillingDetail();
    } catch (error) {
      console.error("Failed to add items:", error);
      showToast({ type: "error", message: error?.error || "Failed to add items to bill." });
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      dispatch(startLoading());
      const paymentData = {
        payment_status: "Paid",
        payment_method: "UPI",
        transaction_id: "UPI-9909099900",
        notes: "FULLY AMOUNT PAID",
      };
      await markBillAsPaid(billingDetail.id, paymentData);
      showToast({
        type: "success",
        message: "Bill marked as paid successfully",
      });
      fetchBillingDetail();
      router.back();
    } catch (error) {
      showToast({ type: "error", message: "Failed to mark bill as paid" });
    } finally {
      dispatch(stopLoading());
    }
  };
  const handleAddDiscount = async () => {
    const updates = discountFields
      .filter(f => f.item_id && f.discount_amount)
      .map(f => ({ item_id: Number(f.item_id), discount_amount: Number(f.discount_amount) }));

    if (updates.length === 0) {
      showToast({ type: "error", message: "Please select an item and enter an amount." });
      return;
    }

    try {
      dispatch(startLoading());
      await applyDiscountUpdate(billingDetail.id, { discount_updates: updates });
      showToast({ type: "success", message: "Discount applied successfully" });
      closeDiscountDialog();
      fetchBillingDetail(); // Refresh bill data logic
    } catch (err) {
      console.error("Failed to apply discount:", err);
      showToast({ type: "error", message: err?.error || "Failed to apply discount." });
    } finally {
      dispatch(stopLoading());
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 mx-auto space-y-6 print:p-0 print:space-y-4">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchInventoryItems} className="border-teal-600 text-teal-600 font-medium hover:bg-teal-50">
            <Package className="h-4 w-4 mr-2" />
            Add Purchase Item
          </Button>
          <Button variant="outline" onClick={openDiscountDialog} className="border-primary text-primary font-medium hover:bg-primary/10 hover:text-primary">
            Add Discount
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Bill
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-none border-gray-200 shadow-sm rounded-xl overflow-hidden print:w-full print:max-w-none">
        <CardContent className="p-0 sm:p-8 print:p-0">
          <div className="p-6 sm:p-0 space-y-8 print:space-y-4">
            {/* Header / Clinic Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-200 pb-8 gap-6 print:pb-4 print:gap-2">
              <div className="order-2 sm:order-1">
                <h2 className="text-2xl font-extrabold text-teal-700 tracking-tight">
                  {billingDetail.clinic_name || "Clinic Name"}
                </h2>
                <p className="text-sm text-gray-600 mt-1.5 max-w-xs leading-relaxed">
                  {billingDetail.clinic_address}
                </p>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
                  <span className="font-semibold text-gray-500">P:</span>{" "}
                  {billingDetail.clinic_phone}
                </p>
              </div>
              <div className="order-1 sm:order-2 self-start sm:text-center w-full sm:w-auto bg-gray-50 sm:bg-transparent p-4 sm:p-0 rounded-lg sm:rounded-none border border-gray-100 sm:border-none">
                <h1 className="text-3xl font-black text-gray-800 uppercase tracking-widest mb-3">
                  INVOICE
                </h1>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-gray-500 mr-2">
                      Bill No:
                    </span>{" "}
                    {billingDetail.bill_number}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-gray-500 mr-2">Date:</span>{" "}
                    {billingDetail.created_at
                      ? new Date(billingDetail.created_at).toLocaleDateString()
                      : ""}
                  </p>
                  <p className="text-sm flex items-center sm:justify-end mt-2 pt-2 border-t border-gray-200 sm:border-none">
                    <span className="font-bold text-gray-500 mr-3">
                      Status:
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${billingDetail.payment_status === "Paid" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-100"}`}
                    >
                      {billingDetail.payment_status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Two-Column Details Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-3">
              {/* Patient Details */}
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>{" "}
                  Bill To
                </h3>
                <p className="font-bold text-lg text-slate-800 mb-1">
                  {billingDetail.patient_name}
                </p>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">ID:</span>{" "}
                    {billingDetail.patient_id}
                  </p>
                  <p className="text-sm text-slate-600">
                    {billingDetail.patient_phone}
                  </p>
                  {billingDetail.patient_email && (
                    <p className="text-sm text-slate-600">
                      {billingDetail.patient_email}
                    </p>
                  )}
                  {(billingDetail.patient_address ||
                    billingDetail.patient_city) && (
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                        {billingDetail.patient_address}
                        {billingDetail.patient_address &&
                          billingDetail.patient_city
                          ? ", "
                          : ""}
                        {billingDetail.patient_city}
                      </p>
                    )}
                </div>
              </div>

              {/* Visit Details */}
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>{" "}
                  Visit Details
                </h3>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm">
                    <span className="text-slate-500 font-medium">
                      Doctor/Receptionist:
                    </span>
                    <span className="font-bold text-slate-800">
                      {billingDetail.doctor_name}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm">
                    <span className="text-slate-500 font-medium">
                      Service Type:
                    </span>
                    <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs shadow-sm">
                      {billingDetail.service_type}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm">
                    <span className="text-slate-500 font-medium">
                      Visit Type:
                    </span>
                    <span className="font-bold text-slate-800">
                      {billingDetail.visit_type}
                    </span>
                  </div>

                  {billingDetail.appointment_date && (
                    <div className="flex flex-col sm:flex-row sm:justify-between text-sm pt-2 border-t border-slate-200 mt-1">
                      <span className="text-slate-500 font-medium">
                        Appointment:
                      </span>
                      <span className="font-bold text-slate-800">
                        {new Date(
                          billingDetail.appointment_date,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-gray-200 print:bg-transparent">
                    <tr>
                      <th className="px-5 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider print:py-2 print:px-3 text-left">
                        Description
                      </th>
                      <th className="px-5 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider text-center w-20 print:py-2 print:px-3">
                        Qty
                      </th>
                      <th className="px-5 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider text-right w-28 print:py-2 print:px-3">
                        Item Total
                      </th>
                      <th className="px-5 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider text-right w-24 print:py-2 print:px-3">
                        GST
                      </th>
                      <th className="px-5 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider text-right w-32 print:py-2 print:px-3">
                        Discount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {billingDetail?.bill_items?.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-slate-50/50 transition-colors group print:border-b-0"
                      >
                        <td className="px-5 py-4 text-slate-800 font-medium print:py-2 print:px-3">
                          {item.description}
                        </td>
                        <td className="px-5 py-4 text-center text-slate-600 bg-slate-50/30 group-hover:bg-slate-100/50 print:bg-transparent print:py-2 print:px-3">
                          {item.quantity}
                        </td>
                        <td className="px-5 py-4 text-right text-slate-600 print:py-2 print:px-3">
                          ₹{Number(item.item_total || 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-right text-slate-500 text-xs print:py-2 print:px-3">
                          {Number(item.gst_value) > 0
                            ? `₹${Number(item.gst_value).toFixed(2)}`
                            : "-"}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-slate-800 print:py-2 print:px-3">
                          ₹{Number(item.discount_amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {(!billingDetail?.bill_items ||
                      billingDetail.bill_items.length === 0) && (
                        <tr className="bg-white">
                          <td
                            colSpan="5"
                            className="px-5 py-8 text-center text-slate-500 italic"
                          >
                            No bill items found.
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations & Summary Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-4 print:flex-row print:pt-2 print:gap-4 print:break-inside-avoid">
              <div className="w-full md:w-1/2 print:w-1/2">
                {billingDetail.notes && (
                  <div className="bg-amber-50/80 border border-amber-200/60 p-5 rounded-xl shadow-sm">
                    <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>{" "}
                      Notes
                    </p>
                    <p className="text-sm text-amber-900 leading-relaxed font-medium">
                      {billingDetail.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Totals Box */}
              <div className="w-full md:w-[380px] shrink-0 print:w-1/2 print:md:w-1/2">
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm print:bg-transparent print:border-none print:shadow-none">
                  <div className="p-5 space-y-3.5 print:p-0 print:space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">
                        Subtotal ({billingDetail.items_count || 0} items)
                      </span>
                      <span className="font-bold text-slate-800">
                        ₹{Number(billingDetail.subtotal || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">
                        Total GST
                      </span>
                      <span className="font-bold text-slate-800">
                        ₹{Number(billingDetail.gst_amount || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">
                        Total Discount
                      </span>
                      <span className="font-bold text-slate-800">
                        ₹{Number(billingDetail.discounts || 0).toFixed(2)}
                      </span>
                    </div>

                    {Number(billingDetail.discount_amount) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">
                          Discount
                        </span>
                        <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          -₹
                          {Number(billingDetail.discount_amount || 0).toFixed(
                            2,
                          )}
                        </span>
                      </div>
                    )}

                    {Number(billingDetail.cost_taken_amount_deducted) > 0 && (
                      <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100 print:hidden">
                        <span className="text-slate-500 font-medium flex flex-col">
                          <span>Advance Collected</span>
                          <span className="text-[10px] text-slate-400">Paid previously, excluded from this bill</span>
                        </span>
                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          ₹{Number(billingDetail.cost_taken_amount_deducted || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-100 p-5 border-t border-b border-slate-200 print:bg-transparent print:p-2 print:border-none print:mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-700 uppercase tracking-wider text-sm print:text-black">
                        Total Amount
                      </span>
                      <span className="font-black text-2xl text-slate-800">
                        ₹{Number(billingDetail.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">
                        Amount Paid
                      </span>
                      <span className="font-bold text-green-600">
                        ₹
                        {billingDetail.payment_status === "Paid"
                          ? Number(billingDetail.final_amount || 0).toFixed(2)
                          : "0.00"}
                      </span>
                    </div> */}

                    {/* <div
                      className={`flex justify-between items-center p-3 rounded-lg border ${billingDetail.payment_status === "Paid" ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}
                    >
                      <span
                        className={`font-bold uppercase tracking-wider text-xs ${billingDetail.payment_status === "Paid" ? "text-green-700" : "text-red-700"}`}
                      >
                        Balance Due
                      </span>
                      <span
                        className={`font-black text-xl ${billingDetail.payment_status === "Paid" ? "text-green-600" : "text-red-600"}`}
                      >
                        ₹
                        {billingDetail.payment_status === "Paid"
                          ? "0.00"
                          : Number(billingDetail.final_amount || 0).toFixed(2)}
                      </span>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            {billingDetail.payment_status !== "Paid" && (
              <div className="flex justify-end pt-8 print:hidden">
                <Button
                  onClick={handleMarkAsPaid}
                  size="lg"
                  className="w-full sm:w-auto shadow-md font-bold px-8 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                >
                  Mark as Paid
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Modal
        onClose={closeDiscountDialog}
        header="Add Discount"
        isModalOpen={openModal}
        onSubmit={handleAddDiscount}
      >
        <div className="space-y-5">
          <div className="bg-teal-50/60 border border-teal-100 rounded-lg p-4">
            <p className="text-sm text-teal-800/90 leading-relaxed font-medium">
              Select specific bill items and apply a flat discount against them. This will dynamically recalculate the total payable amounts.
            </p>
          </div>

          <div className="space-y-4">
            {discountFields.map((field, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-50 p-3.5 rounded-lg border border-slate-100 shadow-sm relative group transition-all hover:border-teal-100">
                <div className="w-full sm:flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Bill Item</label>
                  <select
                    className="w-full text-sm p-2.5 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all shadow-sm"
                    value={field.item_id}
                    onChange={(e) => {
                      const copy = [...discountFields];
                      copy[index].item_id = e.target.value;
                      setDiscountFields(copy);
                    }}
                  >
                    <option value="">-- Select Bill Item --</option>
                    {billingDetail?.bill_items?.map(item => (
                      <option key={item.id} value={item.id}>{item.description}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-36 shrink-0">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Discount Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-[11px] text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full text-sm pl-7 pr-3 py-2.5 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-300 font-bold text-slate-700 shadow-sm"
                      value={field.discount_amount}
                      onChange={(e) => {
                        const copy = [...discountFields];
                        copy[index].discount_amount = e.target.value;
                        setDiscountFields(copy);
                      }}
                    />
                  </div>
                </div>
                {discountFields.length > 1 && (
                  <div className="absolute -top-2 -right-2 sm:static sm:top-auto sm:right-auto sm:mt-[23px]">
                    <button
                      type="button"
                      onClick={() => {
                        const copy = [...discountFields];
                        copy.splice(index, 1);
                        setDiscountFields(copy);
                      }}
                      className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 bg-white sm:bg-transparent border border-slate-200 sm:border-transparent rounded-full sm:rounded-md shadow-sm sm:shadow-none sm:hover:bg-red-50 transition-colors"
                      title="Remove Item"
                    >
                      <span className="text-xl leading-none">&times;</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              type="button"
              onClick={() => setDiscountFields([...discountFields, { item_id: "", discount_amount: "" }])}
              className="w-full border-dashed border-2 py-6 text-slate-500 hover:text-teal-700 hover:bg-teal-50 hover:border-teal-300 transition-all font-semibold"
            >
              + Add Another Bill Item
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        onClose={() => setPurchaseModalOpen(false)}
        header="Add Purchase Item"
        isModalOpen={purchaseModalOpen}
        showFooter={false}
        ClassName="max-w-5xl"
      >
        <div className="space-y-6 pb-20">
          <div className="sticky top-0 bg-white z-20 pb-4 pt-1 space-y-4 shadow-[0_10px_10px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative w-full sm:w-64">
                <Filter className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <select
                  className="w-full pl-10 pr-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-teal-500 appearance-none bg-white cursor-pointer shadow-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {Object.keys(itemsByCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selection Summary Banner */}
            {Object.keys(selectedItems).length > 0 && (
              <div className="bg-teal-600 text-white px-5 py-3 rounded-xl flex justify-between items-center shadow-md animate-in slide-in-from-top duration-300">
                <span className="font-bold text-base">
                  {Object.keys(selectedItems).length} item(s) selected
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-black text-lg">
                    Total: ₹{Object.values(selectedItems).reduce((sum, item) => {
                      const isSerialized = item.stock_info?.type === "serialized";
                      const count = isSerialized ? (item.selected_serials?.length || 0) : (Number(item.quantity) || 0);
                      return sum + (count * parseFloat(item.unit_price || 0));
                    }, 0).toLocaleString('en-IN')}
                  </span>
                  <Button onClick={handleSavePurchase} className="bg-white text-teal-700 hover:bg-teal-50 font-black px-6 py-2 h-auto text-base">
                    Save to Bill
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-8">
            {Object.entries(itemsByCategory)
              .filter(([category]) => selectedCategory === "All" || selectedCategory === category)
              .map(([category, items]) => {
                const filteredItems = items.filter(item =>
                  item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (item.subtitle || "").toLowerCase().includes(searchTerm.toLowerCase())
                );

                if (filteredItems.length === 0) return null;

                return (
                  <div key={category} className="space-y-4">
                    <h3 className="text-base font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                      <div className="h-0.5 flex-1 bg-slate-100"></div>
                      {category}
                      <div className="h-0.5 flex-1 bg-slate-100"></div>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredItems.map((item) => {
                        const isSelected = !!selectedItems[item.id];
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleSelectItem(item)}
                            className={`p-5 border-2 rounded-2xl transition-all cursor-pointer relative flex flex-col justify-between ${isSelected ? "border-teal-500 bg-teal-50/50 shadow-md scale-[1.02]" : "border-slate-100 hover:border-teal-200 hover:bg-white hover:shadow-sm"}`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex gap-3">
                                <div className={`mt-1 shrink-0 ${isSelected ? "text-teal-600" : "text-slate-300"}`}>
                                  {isSelected ? <CheckSquare className="h-6 w-6" /> : <Square className="h-6 w-6" />}
                                </div>
                                <div>
                                  <h4 className="font-black text-lg text-slate-800 leading-tight mb-0.5">
                                    {item.product_name}
                                  </h4>
                                  {/* Show subtitle only if it's not just a raw SKU reference */}
                                  {item.subtitle && !item.subtitle.startsWith("SKU:") && (
                                    <p className="text-[11px] text-slate-400 font-medium mb-1 leading-snug">
                                      {item.subtitle}
                                    </p>
                                  )}
                                  <p className="text-sm font-bold text-teal-600">
                                    ₹{parseFloat(item.unit_price || 0).toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-1">
                                {/* Status badge */}
                                {item.status && (
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                    item.status === "Good" ? "bg-green-100 text-green-700" :
                                    item.status === "Low" ? "bg-amber-100 text-amber-700" :
                                    "bg-red-100 text-red-700"
                                  }`}>
                                    {item.status}
                                  </span>
                                )}
                                {/* Stock type + count badge */}
                                {item.stock_type === "Serialized" ? (
                                  <span className="text-xs font-black uppercase px-2 py-1 rounded-md bg-purple-100 text-purple-700">
                                    {item.stock_info?.count || 0} serial(s)
                                  </span>
                                ) : (
                                  <span className={`text-xs font-black uppercase px-2 py-1 rounded-md ${
                                    (item.stock_info?.quantity || 0) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                  }`}>
                                    Qty: {item.stock_info?.quantity ?? 0}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Metadata row — all meaningful fields except SKU */}
                            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-3 border-t border-slate-100 pt-3">
                              {item.brand_name && (
                                <div className="flex flex-col min-w-[80px]">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Brand</span>
                                  <span className="text-xs text-slate-600 font-medium">{item.brand_name}</span>
                                </div>
                              )}
                              {item.model_type_name && (
                                <div className="flex flex-col min-w-[80px]">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Model Type</span>
                                  <span className="text-xs text-slate-600 font-medium">{item.model_type_name}</span>
                                </div>
                              )}
                              {item.implant_systems && (
                                <div className="flex flex-col min-w-[80px]">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Implant System</span>
                                  <span className="text-xs text-slate-600 font-medium">{item.implant_systems}</span>
                                </div>
                              )}
                              {item.cochlear_accessory && (
                                <div className="flex flex-col min-w-[80px]">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Accessory</span>
                                  <span className="text-xs text-slate-600 font-medium">{item.cochlear_accessory}</span>
                                </div>
                              )}
                              {item.age_groups && (
                                <div className="flex flex-col min-w-[80px]">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Age Group</span>
                                  <span className="text-xs text-slate-600 font-medium">{item.age_groups}</span>
                                </div>
                              )}
                              {item.gst_value && Number(item.gst_value) > 0 && (
                                <div className="flex flex-col min-w-[80px]">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">GST</span>
                                  <span className="text-xs text-slate-600 font-medium">₹{Number(item.gst_value).toFixed(2)}</span>
                                </div>
                              )}
                              {item.description && (
                                <div className="flex flex-col w-full">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Description</span>
                                  <span className="text-xs text-slate-600 font-medium">{item.description}</span>
                                </div>
                              )}
                              {item.notes && (
                                <div className="flex flex-col w-full">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Notes</span>
                                  <span className="text-xs text-slate-600 font-medium">{item.notes}</span>
                                </div>
                              )}
                              {item.use_in_trial && (
                                <div className="flex flex-col min-w-[80px]">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Trial Use</span>
                                  <span className="text-xs text-teal-600 font-bold">Yes</span>
                                </div>
                              )}
                            </div>


                            {isSelected ? (
                              <div className="mt-3 pt-3 border-t border-teal-200/50" onClick={e => e.stopPropagation()}>
                                {item.stock_info?.type === "serialized" ? (
                                  // Serialized: show checkboxes for each serial number
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-teal-600 uppercase tracking-wider block">
                                      Select Serial Number(s) — {selectedItems[item.id]?.selected_serials?.length || 0} selected
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                      {(item.stock_info?.serial_numbers || []).map(serial => {
                                        const isSerialSelected = selectedItems[item.id]?.selected_serials?.includes(serial);
                                        return (
                                          <button
                                            key={serial}
                                            type="button"
                                            onClick={() => toggleSerialNumber(item.id, serial)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                                              isSerialSelected
                                                ? "bg-teal-600 border-teal-600 text-white shadow"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-700"
                                            }`}
                                          >
                                            {isSerialSelected && <Check className="inline h-3 w-3 mr-1" />}
                                            {serial}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  // Non-serialized: show quantity input
                                  <div className="space-y-1.5 w-full">
                                    <label className="text-[10px] font-black text-teal-600 uppercase tracking-wider">
                                      Quantity to Add (max: {item.stock_info?.quantity ?? 0})
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      max={item.stock_info?.quantity ?? 0}
                                      className="w-full p-2.5 text-base font-bold bg-white border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                                      value={selectedItems[item.id]?.quantity || ""}
                                      onChange={(e) => updateSelectedItem(item.id, 'quantity', e.target.value)}
                                    />
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>

          {Object.keys(itemsByCategory).length === 0 && (
            <div className="py-20 text-center">
              <Package className="h-16 w-16 text-slate-100 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-lg">No inventory items available</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
