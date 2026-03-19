"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { getBillById, markBillAsPaid } from "@/lib/services/billing";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "@/lib/redux/slice/uiSlice";
import { showToast } from "@/components/ui/toast";

export default function BillingDetailPage() {
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

  const handleMarkAsPaid = async () => {
    try {
      dispatch(startLoading());
      const paymentData = {
        payment_status: "Paid",
        payment_method: "UPI",
        transaction_id: "UPI-9909099900",
        notes: "FULLY AMOUNT PAID"
      };
      await markBillAsPaid(billingDetail.id, paymentData);
      showToast({ type: "success", message: "Bill marked as paid successfully" });
      fetchBillingDetail();
      router.back()
    } catch (error) {
      showToast({ type: "error", message: "Failed to mark bill as paid" });
    } finally {
      dispatch(stopLoading());
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 mx-auto space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Bill
        </Button>
      </div>

      <Card className="print:shadow-none print:border-none border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-0 sm:p-8">
          <div className="p-6 sm:p-0 space-y-8">

            {/* Header / Clinic Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-200 pb-8 gap-6">
              <div className="order-2 sm:order-1">
                <h2 className="text-2xl font-extrabold text-teal-700 tracking-tight">{billingDetail.clinic_name || 'Clinic Name'}</h2>
                <p className="text-sm text-gray-600 mt-1.5 max-w-xs leading-relaxed">{billingDetail.clinic_address}</p>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
                  <span className="font-semibold text-gray-500">P:</span> {billingDetail.clinic_phone}
                </p>
              </div>
              <div className="order-1 sm:order-2 self-start sm:text-right w-full sm:w-auto bg-gray-50 sm:bg-transparent p-4 sm:p-0 rounded-lg sm:rounded-none border border-gray-100 sm:border-none">
                <h1 className="text-3xl font-black text-gray-800 uppercase tracking-widest mb-3">INVOICE</h1>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700"><span className="font-bold text-gray-500 mr-2">Bill No:</span> {billingDetail.bill_number}</p>
                  <p className="text-sm text-gray-700"><span className="font-bold text-gray-500 mr-2">Date:</span> {billingDetail.created_at ? new Date(billingDetail.created_at).toLocaleDateString() : ''}</p>
                  <p className="text-sm flex items-center sm:justify-end mt-2 pt-2 border-t border-gray-200 sm:border-none">
                    <span className="font-bold text-gray-500 mr-3">Status:</span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${billingDetail.payment_status === 'Paid' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                      {billingDetail.payment_status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Two-Column Details Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Details */}
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div> Bill To
                </h3>
                <p className="font-bold text-lg text-slate-800 mb-1">{billingDetail.patient_name}</p>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600"><span className="font-medium">ID:</span> {billingDetail.patient_id}</p>
                  <p className="text-sm text-slate-600">{billingDetail.patient_phone}</p>
                  {billingDetail.patient_email && <p className="text-sm text-slate-600">{billingDetail.patient_email}</p>}
                  {(billingDetail.patient_address || billingDetail.patient_city) && (
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      {billingDetail.patient_address}{billingDetail.patient_address && billingDetail.patient_city ? ', ' : ''}{billingDetail.patient_city}
                    </p>
                  )}
                </div>
              </div>

              {/* Visit Details */}
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div> Visit Details
                </h3>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm">
                    <span className="text-slate-500 font-medium">Doctor/Receptionist:</span>
                    <span className="font-bold text-slate-800">{billingDetail.doctor_name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm">
                    <span className="text-slate-500 font-medium">Service Type:</span>
                    <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs shadow-sm">{billingDetail.service_type}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm">
                    <span className="text-slate-500 font-medium">Visit Type:</span>
                    <span className="font-bold text-slate-800">{billingDetail.visit_type}</span>
                  </div>

                  {billingDetail.appointment_date && (
                    <div className="flex flex-col sm:flex-row sm:justify-between text-sm pt-2 border-t border-slate-200 mt-1">
                      <span className="text-slate-500 font-medium">Appointment:</span>
                      <span className="font-bold text-slate-800">{new Date(billingDetail.appointment_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider">Description</th>
                      <th className="px-5 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider text-center w-20">Qty</th>
                      <th className="px-5 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider text-right w-28">Item Total</th>
                      <th className="px-5 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider text-right w-24">GST</th>
                      <th className="px-5 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider text-right w-32">Discount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {billingDetail?.bill_items?.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-5 py-4 text-slate-800 font-medium">{item.description}</td>
                        <td className="px-5 py-4 text-center text-slate-600 bg-slate-50/30 group-hover:bg-slate-100/50">{item.quantity}</td>
                        <td className="px-5 py-4 text-right text-slate-600">₹{Number(item.item_total || 0).toFixed(2)}</td>
                        <td className="px-5 py-4 text-right text-slate-500 text-xs">
                          {Number(item.gst_value) > 0 ? `₹${Number(item.gst_value).toFixed(2)}` : '-'}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-slate-800">₹{Number(item.discount_amount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                    {(!billingDetail?.bill_items || billingDetail.bill_items.length === 0) && (
                      <tr className="bg-white">
                        <td colSpan="5" className="px-5 py-8 text-center text-slate-500 italic">No bill items found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations & Summary Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-4">
              {/* Notes part */}
              <div className="w-full md:w-1/2">
                {billingDetail.notes && (
                  <div className="bg-amber-50/80 border border-amber-200/60 p-5 rounded-xl shadow-sm">
                    <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Notes</p>
                    <p className="text-sm text-amber-900 leading-relaxed font-medium">{billingDetail.notes}</p>
                  </div>
                )}
              </div>

              {/* Totals Box */}
              <div className="w-full md:w-[380px] shrink-0">
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-5 space-y-3.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Subtotal ({billingDetail.items_count || 0} items)</span>
                      <span className="font-bold text-slate-800">₹{Number(billingDetail.subtotal || 0).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Total GST</span>
                      <span className="font-bold text-slate-800">₹{Number(billingDetail.gst_amount || 0).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Total Discount</span>
                      <span className="font-bold text-slate-800">₹{Number(billingDetail.discounts || 0).toFixed(2)}</span>
                    </div>



                    {Number(billingDetail.discount_amount) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Discount</span>
                        <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">-₹{Number(billingDetail.discount_amount || 0).toFixed(2)}</span>
                      </div>
                    )}

                    {/* {Number(billingDetail.cost_taken_amount_deducted) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Advance Given </span>
                        <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">-₹{Number(billingDetail.cost_taken_amount_deducted || 0).toFixed(2)}</span>
                      </div>
                    )} */}
                  </div>

                  <div className="bg-slate-100 p-5 border-t border-b border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-700 uppercase tracking-wider text-sm">Total Amount</span>
                      <span className="font-black text-2xl text-slate-800">₹{Number(billingDetail.total_amount || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Amount Paid</span>
                      <span className="font-bold text-green-600">
                        ₹{billingDetail.payment_status === 'Paid' ? Number(billingDetail.final_amount || 0).toFixed(2) : '0.00'}
                      </span>
                    </div>

                    <div className={`flex justify-between items-center p-3 rounded-lg border ${billingDetail.payment_status === 'Paid' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                      <span className={`font-bold uppercase tracking-wider text-xs ${billingDetail.payment_status === 'Paid' ? 'text-green-700' : 'text-red-700'}`}>Balance Due</span>
                      <span className={`font-black text-xl ${billingDetail.payment_status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{billingDetail.payment_status === 'Paid' ? '0.00' : Number(billingDetail.final_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            {billingDetail.payment_status !== 'Paid' && (
              <div className="flex justify-end pt-8 print:hidden">
                <Button onClick={handleMarkAsPaid} size="lg" className="w-full sm:w-auto shadow-md font-bold px-8 bg-teal-600 hover:bg-teal-700 text-white rounded-lg">
                  Mark as Paid
                </Button>
              </div>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}