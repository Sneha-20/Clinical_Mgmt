"use client"
import useTransferProducts from "@/components/modules/admin/hooks/useTransferProducts";
import TransferForm from "@/components/modules/admin/TransferForm";
import TransferHistory from "@/components/modules/admin/TransferHistory";
import { ArrowRightLeft, Box, AlertTriangle, TrendingDown } from "lucide-react";

const stats = [
  { icon: Box, label: "5 Items", sub: "View all inventory items", color: "text-primary" },
  { icon: AlertTriangle, label: "1 Critical Items", sub: "Out of stock - order immediately", color: "text-destructive" },
  { icon: TrendingDown, label: "3 Low Stock Items", sub: "Below minimum threshold", color: "text-warning" },
];

export default function TransferProductsPage() {
  const transferHook = useTransferProducts();
  return (
    <div className="flex-1 space-y-8 px-8 py-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Inventory Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">Track stock levels and manage transactions</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <s.icon className={`h-6 w-6 ${s.color}`} />
              <div>
                <p className={`text-lg font-bold ${s.color}`}>{s.label}</p>
                <p className="text-sm text-muted-foreground">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Transfer Section */}
        <div>
          <div className="mb-6 flex items-center gap-3">
            <ArrowRightLeft className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Transfer Products</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TransferForm transferHook={transferHook} />
            <TransferHistory transferHook={transferHook} />
          </div>
        </div>
    </div>
  );
};

