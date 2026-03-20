import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";

const BillingDetailDialog = ({
  onClose,
  onOpenChange,
  billing,
  billingDetail,
  onPayNow,
  openModal,
  markAsPaid,
}) => {
  return (
    <Modal onClose={onClose} header="Billing Details" isModalOpen={openModal}>
      {/* <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Billing Details</span>
            {getStatusBadge(billing.status)}
          </DialogTitle>
        </DialogHeader> */}
      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Patient</span>
            <span className="text-sm font-medium">
              {billingDetail.patient_name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Patient ID</span>
            <span className="text-sm font-medium">
              {billingDetail.patient_id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Phone</span>
            <span className="text-sm font-medium">
              {billingDetail.patient_phone}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Visit Date</span>
            <span className="text-sm font-medium">
              {new Date(billingDetail.visit_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Visit Type</span>
            <span className="text-sm font-medium">
              {billingDetail.visit_type}
            </span>
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
              <span className="text-green-600">
                -₹{billingDetail.discount_amount}
              </span>
            </div>
          )}

          <div className="flex justify-between font-semibold">
            <span>Total Amount</span>
            <span>₹{billingDetail.final_amount}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="text-green-600">
              ₹
              {billingDetail.payment_status === "Paid"
                ? billingDetail.final_amount
                : 0}
            </span>
          </div>

          <div className="flex justify-between font-semibold text-lg">
            <span>Balance Due</span>
            <span
              className={
                billingDetail.payment_status === "Paid"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              ₹
              {billingDetail.payment_status === "Paid"
                ? 0
                : billingDetail.final_amount}
            </span>
          </div>
        </div>
      </div>
      {billingDetail.payment_status !== "Paid" && (
        <div className="flex justify-end mt-4">
          <Button onClick={() => markAsPaid(billingDetail.id)}>
            Mark as Paid
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default BillingDetailDialog;
