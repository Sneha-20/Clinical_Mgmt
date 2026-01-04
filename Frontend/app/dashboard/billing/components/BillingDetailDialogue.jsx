
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";

const BillingDetailDialog = ({
  onClose,
  onOpenChange,
  billing,
  billingDetail,
  onPayNow,
  openModal
}) => {
  // if (!billing) return null;

  // const getStatusIcon = (status) => {
  //   switch (status) {
  //     case "paid":
  //       return <CheckCircle className="h-4 w-4 text-green-600" />;
  //     case "pending":
  //       return <Clock className="h-4 w-4 text-amber-600" />;
  //     case "overdue":
  //       return <AlertCircle className="h-4 w-4 text-red-600" />;
  //     default:
  //       return null;
  //   }
  // };

  // const getStatusBadge = (status) => {
  //   switch (status) {
  //     case "paid":
  //       return (
  //         <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
  //           Paid
  //         </Badge>
  //       );
  //     case "pending":
  //       return (
  //         <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
  //           Pending
  //         </Badge>
  //       );
  //     case "overdue":
  //       return (
  //         <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
  //           Overdue
  //         </Badge>
  //       );
  //     default:
  //       return null;
  //   }
  // };

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
              <span className="text-sm font-medium">{billingDetail.patient_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Patient ID</span>
              <span className="text-sm font-medium">{billingDetail.patient_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span className="text-sm font-medium">{billingDetail.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Visit Date</span>
              <span className="text-sm font-medium">{billingDetail.visit_date}</span>
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

            {billingDetail.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-green-600">-₹{billingDetail.discount}</span>
              </div>
            )}

            {billingDetail.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>₹{billingDetail.tax}</span>
              </div>
            )}


            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>₹{billingDetail.total_amount}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="text-green-600">₹{billingDetail.amount_paid}</span>
            </div>

            <div className="flex justify-between font-semibold text-lg">
              <span>Balance Due</span>
              <span
                className={
                  billingDetail.balance_due > 0
                    ? "text-red-600"
                    : "text-green-600"
                }
              >
                ₹{billingDetail.balance_due}
              </span>
            </div>
          </div>
        </div>
        {/* <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button> */}
        {/* <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>

          {billing.status !== "paid" && (
            <Button onClick={() => onPayNow(billing.id)}>
              Pay ₹{billing.balance_due}
            </Button>
          )}
        </DialogFooter>
      </DialogContent> */}
    </Modal>
  );
};

export default BillingDetailDialog;
