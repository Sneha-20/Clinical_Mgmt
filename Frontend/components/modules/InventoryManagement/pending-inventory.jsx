"use client";
import React, { useEffect } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import usePendingInventory from "@/lib/hooks/usePendingInventory";
import { Button } from "@/components/ui/button";
import DropDown from "@/components/ui/dropdown";

export default function PendingInventory() {
  const {
    pendingProducts,
    loading,
    approvingId,
    clinics, 
    selectedClinic,
    changeClinic,
    fetchPendingProducts,
    approveProduct,
  } = usePendingInventory();

  useEffect(() => {
    fetchPendingProducts();
  }, [fetchPendingProducts]);

   const clinicOptions = [
    { label: "All", value: "All" },
    ...(clinics?.map((clinic) => ({
      label: clinic.name,
      value: clinic.id,
    })) || []),
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">
            Inventory Management
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track stock levels and manage transactions
          </p>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <DropDown
            options={clinicOptions}
            value={selectedClinic}
            placeholder="Select Clinic"
            onChange={(n, v) => changeClinic(v)}
            className="min-w-[200px]"
          />
        </div>
      </div>
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <div className="text-lg sm:text-xl font-bold">Pending Inventory</div>
          <div className="text-xs sm:text-sm">
            List of products pending approval
          </div>
        </CardHeader>
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : pendingProducts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No pending products found
            </div>
          ) : (
            <table className="w-full text-xs sm:text-sm min-w-max sm:min-w-0">
              <thead className="border-b border-border bg-slate-100">
                <tr className="text-muted-foreground">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-medium">
                    Product Name
                  </th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-medium hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-medium hidden lg:table-cell">
                    Brand
                  </th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-medium hidden lg:table-cell">
                    Model
                  </th>
                  <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-medium">
                    Stock
                  </th>
                  <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-medium hidden md:table-cell">
                    Unit Price
                  </th>
                  <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-medium">
                    Status
                  </th>
                  <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-medium">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingProducts.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="py-2 sm:py-3 px-2 sm:px-3">
                      <div>
                        <p className="font-medium text-xs sm:text-sm">
                          {item.product_name}
                        </p>
                      </div>
                    </td>
                    <td className="text-left py-2 sm:py-3 px-2 sm:px-3 hidden md:table-cell">
                      {item.category}
                    </td>
                    <td className="text-left py-2 sm:py-3 px-2 sm:px-3 hidden lg:table-cell">
                      {item.brand_name}
                    </td>
                    <td className="text-left py-2 sm:py-3 px-2 sm:px-3 hidden lg:table-cell">
                      {item.model_type_name}
                    </td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-3 font-semibold">
                      {item.quantity_in_stock || 0}
                    </td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-3 hidden md:table-cell">
                      ₹{parseFloat(item.unit_price || 0).toFixed(2)}
                    </td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${item.status === "Good" ? "bg-green-100 text-green-600" : item.status === "Low" ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-3">
                      <Button
                        onClick={() => approveProduct(item.id)}
                        disabled={approvingId === item.id}
                        className="text-xs"
                      >
                        {approvingId === item.id ? "Approving..." : "Approve"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
