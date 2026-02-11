'use client';

import { useState } from "react";
import { useState, useEffect } from "react";
import { ArrowRight, Minus, Package, Plus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GetClinicDropdowns,GetInventoryDropdowns } from "@/lib/services/dashboard";

const TransferForm = () => {
  const [toClinicId, setToClinicId] = useState("");
  const [notes, setNotes] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [clinics, setClinics] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clinicsData, inventoryData] = await Promise.all([
          GetClinicDropdowns(),
          GetInventoryDropdowns(),
        ]);
        setClinics(clinicsData);
        setInventoryItems(inventoryData);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };
    fetchData();
  }, []);

  const addProduct = () => {
    if (!selectedItemId) return;
    const item = inventoryItems.find((i) => i.id === Number(selectedItemId));
    if (!item || products.find((p) => p.item.id === item.id)) return;
    setProducts([...products, { item, quantity: item.stock_type === "Non-Serialized" ? 1 : 0, selectedSerials: [] }]);
    setSelectedItemId("");
  };

  const removeProduct = (id) => {
    setProducts(products.filter((p) => p.item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setProducts(
      products.map((p) => {
        if (p.item.id !== id) return p;
        const newQty = Math.max(1, Math.min(p.item.stock, p.quantity + delta));
        return { ...p, quantity: newQty };
      })
    );
  };

  const toggleSerial = (productId, serial) => {
    setProducts(
      products.map((p) => {
        if (p.item.id !== productId) return p;
        const selected = p.selectedSerials.includes(serial)
          ? p.selectedSerials.filter((s) => s !== serial)
          : [...p.selectedSerials, serial];
        return { ...p, selectedSerials: selected };
      })
    );
  };

  const handleSubmit = () => {
    if (!toClinicId || products.length === 0) {
      toast.error("Please select a destination clinic and add at least one product.");
      return;
    }

    const payload = {
      to_clinic_id: Number(toClinicId),
      notes,
      products: products.map((p) => {
        if (p.item.stock_type === "Serialized") {
          return { source_inventory_id: p.item.id, serial_numbers: p.selectedSerials };
        }
        return { source_inventory_id: p.item.id, quantity: p.quantity };
      }),
    };

    console.log("Transfer Payload:", JSON.stringify(payload, null, 2));
    toast.success("Transfer submitted successfully!");
    setToClinicId("");
    setNotes("");
    setProducts([]);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Send className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">Transfer Inventory</h2>
          <p className="text-sm text-muted-foreground">Move products to another clinic</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* From / To */}
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <div>
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">From Clinic</Label>
            <div className="mt-1.5 rounded-lg border border-border bg-muted px-4 py-2.5 text-sm font-medium text-foreground">
              City Hearing Clinic
            </div>
          </div>
          <div className="flex items-end justify-center pb-2">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">To Clinic</Label>
            <Select value={toClinicId} onValueChange={setToClinicId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select destination clinic" />
              </SelectTrigger>
              <SelectContent>
                {clinics.filter((c) => c.id !== 1).map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Add Product */}
        <div>
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Add Products</Label>
          <div className="mt-1.5 flex gap-2">
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a product to transfer" />
              </SelectTrigger>
              <SelectContent>
                {inventoryItems
                  .filter((i) => !products.find((p) => p.item.id === i.id))
                  .map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.product_name} — {i.stock} in stock
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button onClick={addProduct} disabled={!selectedItemId} size="sm" className="shrink-0">
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        {/* Product List */}
        {products.length > 0 && (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.item.id} className="rounded-lg border border-border bg-muted/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{p.item.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.item.brand} · {p.item.model} ·{" "}
                        <Badge
                          variant="outline"
                          className={
                            p.item.stock_type === "Serialized"
                              ? "border-info/30 bg-info/10 text-info"
                              : "border-success/30 bg-success/10 text-success"
                          }
                        >
                          {p.item.stock_type}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeProduct(p.item.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {p.item.stock_type === "Non-Serialized" ? (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Quantity:</span>
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-card">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(p.item.id, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-10 text-center text-sm font-semibold">{p.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(p.item.id, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">/ {p.item.stock} available</span>
                  </div>
                ) : (
                  <div className="mt-3">
                    <span className="text-sm text-muted-foreground">Select serial numbers:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(p.item.serial_numbers ?? []).map((sn) => (
                        <button
                          key={sn}
                          onClick={() => toggleSerial(p.item.id, sn)}
                          className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                            p.selectedSerials.includes(sn)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-card-foreground hover:border-primary/50"
                          }`}
                        >
                          {sn}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        <div>
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Notes (Optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this transfer..."
            className="mt-1.5 resize-none"
            rows={3}
          />
        </div>

        <Button onClick={handleSubmit} className="w-full" disabled={!toClinicId || products.length === 0}>
          <Send className="mr-2 h-4 w-4" />
          Submit Transfer
        </Button>
      </div>
    </div>
  );
};

export default TransferForm;
