import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
//  import {
//   AlertCircle,
//   CheckCircle,
//   Clock,
// } from "lucide-react";

export default function BillingTable({
  data,
  showPay,
  fetchBillingById,
  page,
  totalPages,
  onNext,
  onPrev,
}) {
  //     const StatusBadge = ({ status }) => {
  //   if (status === "Paid")
  //     return (
  //       <span className="flex items-center gap-1 text-green-600">
  //         <CheckCircle size={14} /> Paid
  //       </span>
  //     );
  //   if (status === "pending")
  //     return (
  //       <span className="flex items-center gap-1 text-amber-600">
  //         <Clock size={14} /> Pending
  //       </span>
  //     );
  //   return (
  //     <span className="flex items-center gap-1 text-red-600">
  //       <AlertCircle size={14} /> Overdue
  //     </span>
  //   );
  // };
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Visit Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            {/* <TableHead>Status</TableHead> */}
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
              <TableCell>{b.patient_phone}</TableCell>
              <TableCell>{b.visit_date}</TableCell>
              <TableCell className="text-right font-semibold">
                {" "}
                ₹{b.final_amount}{" "}
              </TableCell>

              <TableCell className="text-right">
                <Button size="sm" onClick={() => fetchBillingById(b.visit_id)}>
                  {showPay ? "Pay Now" : "View"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        page={page}
        totalPages={totalPages}
        onNext={onNext}
        onPrev={onPrev}
      />
    </>
  );
}
