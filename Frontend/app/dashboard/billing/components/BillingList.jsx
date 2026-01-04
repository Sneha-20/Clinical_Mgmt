"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Search } from "lucide-react";

import useBilling from "@/lib/hooks/useBilling";
import BillingTable from "./Billingtable";
import BillingDetailDialog from "./BillingDetailDialogue";
import { useState } from "react";

export default function BillingList() {

  const [dueBillingModal,setDueBillingModal]= useState(false)
  const {
    // searchQuery,
    // setSearchQuery,
    // duePayments,
    // paidPayments,

    // setDialogOpen,
    // handlePayNow,
    // dialogOpen,
    selectedBilling,
    billingDetail,
    paidBillList,
    dueBillList,
    paidPage,
    paidTotalPages,
    duePage,
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
  } = useBilling();
 

  //   const BillingTable = ({ data, showPay }) => (

  //     <Table>
  //       <TableHeader>
  //         <TableRow>
  //           <TableHead>Patient</TableHead>
  //           <TableHead>Date</TableHead>
  //           <TableHead>Visit</TableHead>
  //           <TableHead className="text-right">Amount</TableHead>
  //           <TableHead>Status</TableHead>
  //           <TableHead className="text-right">Action</TableHead>
  //         </TableRow>
  //       </TableHeader>
  //       <TableBody>
  //         {data.map((b) => (
  //           <TableRow key={b.id}>
  //             <TableCell>
  //               <p className="font-medium">{b.patient_name}</p>
  //               <p className="text-sm text-muted-foreground">{b.patient_id}</p>
  //             </TableCell>
  //             <TableCell>{b.visit_date}</TableCell>
  //             <TableCell>{b.visit_type}</TableCell>
  //             <TableCell className="text-right font-semibold">
  //               ₹{b.total_amount}
  //             </TableCell>
  //             <TableCell>
  //               <StatusBadge status={b.status} />
  //             </TableCell>
  //             <TableCell className="text-right">
  //               <Button size="sm" onClick={() => openBillingDetail(b)}>
  //                 {showPay ? "Pay Now" : "View"}
  //               </Button>
  //             </TableCell>
  //           </TableRow>
  //         ))}
  //       </TableBody>
  //     </Table>
  //   );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Billing Management</h1>
        {/* <div className="relative w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name or ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payments Due</CardTitle>
        </CardHeader>
        <CardContent>
          <BillingTable
            data={dueBillList}
            page={duePage}
            totalPages={dueTotalPages}
            onNext={nextDuePage}
            onPrev={prevDuePage}
            fetchBillingById={fetchBillingById}
            showPay
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Completed Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <BillingTable
            data={paidBillList}
            page={paidPage}
            totalPages={paidTotalPages}
            onNext={nextPaidPage}
            onPrev={prevPaidPage}
            fetchBillingById={fetchBillingById}
          />
        </CardContent>
      </Card>
      {/* {selectedBilling && ( */}
        <BillingDetailDialog
          onClose={() => setSelectedBilling(null)}
          billingDetail={billingDetail}
          openModal={selectedBilling}
          // onOpenChange={setDialogOpen}
          // billing={selectedBilling}
          // onPayNow={handlePayNow}
        />
      {/* )} */}
    </div>
  );
}
