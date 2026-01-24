"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useBilling from "@/lib/hooks/useBilling";
import BillingTable from "./Billingtable";
import BillingDetailDialog from "./BillingDetailDialogue";

export default function BillingList() {
  const {
    selectedBilling,
    billingDetail,
    paidBillList,
    dueBillList,
    paidPage,
    paidTotalPages,
    duePage,
    dueTotalPages,

    nextPaidPage,
    prevPaidPage,
    nextDuePage,
    prevDuePage,
    setSelectedBilling,
    fetchBillingById,
  } = useBilling();
 
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Billing Management</h1>
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
        <BillingDetailDialog
          onClose={() => setSelectedBilling(null)}
          billingDetail={billingDetail}
          openModal={selectedBilling}
        />
    </div>
  );
}
