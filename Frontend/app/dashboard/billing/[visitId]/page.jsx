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

      <Card>
        <CardHeader className="print:hidden">
          <CardTitle>Billing Details - {billingDetail.bill_number}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Patient</span>
                <span className="text-sm font-medium">{billingDetail.patient_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Patient ID</span>
                <span className="text-sm font-medium">{billingDetail.patient_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="text-sm font-medium">{billingDetail.patient_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Visit Date</span>
                <span className="text-sm font-medium">{billingDetail.visit_date ? new Date(billingDetail.visit_date).toLocaleDateString() : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Visit Type</span>
                <span className="text-sm font-medium">{billingDetail.visit_type}</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Services</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2 font-medium">Description</th>
                      <th className="text-center p-2 font-medium">Qty</th>
                      <th className="text-right p-2 font-medium">Rate</th>
                      <th className="text-right p-2 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingDetail?.bill_items?.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{item.description}</td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-right">₹{item.cost}</td>
                        <td className="p-2 text-right">₹{item.item_total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{billingDetail.subtotal}</span>
              </div>

              {billingDetail.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">-₹{billingDetail.discount_amount}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>₹{billingDetail.final_amount}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="text-green-600">₹{billingDetail.payment_status === 'Paid' ? billingDetail.final_amount : 0}</span>
              </div>

              <div className="flex justify-between font-semibold text-lg">
                <span>Balance Due</span>
                <span
                  className={
                    billingDetail.payment_status === 'Paid' ? "text-green-600" : "text-red-600"
                  }
                >
                  ₹{billingDetail.payment_status === 'Paid' ? 0 : billingDetail.final_amount}
                </span>
              </div>
            </div>

            {billingDetail.payment_status !== 'Paid' && (
              <div className="flex justify-end print:hidden">
                <Button onClick={handleMarkAsPaid}>
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