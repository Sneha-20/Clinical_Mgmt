 import { Button } from "@/components/ui/button";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/Table";
 import {
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

 export default function BillingTable  ({ data, showPay, fetchBillingById }) {
      const StatusBadge = ({ status }) => {
    if (status === "Paid")
      return (
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle size={14} /> Paid
        </span>
      );
    if (status === "pending")
      return (
        <span className="flex items-center gap-1 text-amber-600">
          <Clock size={14} /> Pending
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-red-600">
        <AlertCircle size={14} /> Overdue
      </span>
    );
  };
    return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Visit</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((b) => (
          <TableRow key={b.id}>
            <TableCell>
              <p className="font-medium">{b.patient_name}</p>
              <p className="text-sm text-muted-foreground">{b.patient_id}</p>
            </TableCell>
            <TableCell>{b.visit_date}</TableCell>
            <TableCell>{b.visit_type}</TableCell>
            <TableCell className="text-right font-semibold">
              ₹{b.final_amount}
            </TableCell>
            <TableCell>
              <StatusBadge status={b.payment_status} />
            </TableCell>
            <TableCell className="text-right">
                {/* onClick={() => openBillingDetail(b)} */}
              <Button size="sm" onClick={() => fetchBillingById(b.visit_id)}>
                {showPay ? "Pay Now" : "View"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )}