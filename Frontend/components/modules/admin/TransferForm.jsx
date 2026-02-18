"use client";
import React from "react";
import { ArrowRight, Minus, Package, Plus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Textarea from "@/components/ui/textarea";
import DropDown from "@/components/ui/dropdown";
import Badge from "@/components/ui/badge";
import useTransferProducts from "./hooks/useTransferProducts";
import CommonBadge from "@/components/ui/badge";

export default function TransferForm() {
  const {
    toClinicId,
    notes,
    products,
    selectedItemId,
    tempQuantity,
    tempSerialInput,
    tempSerials,
    clinics,
    inventoryItems,
    selectedItem,
    submitting,
    setToClinicId,
    setNotes,
    setSelectedItemId,
    setTempQuantity,
    setTempSerialInput,
    addTempSerial,
    removeTempSerial,
    addProduct,
    removeProduct,
    updateQuantity,
    setProductQuantity,
    toggleSerial,
    availableSerials,
    toggleAvailableSerial,
    handleSubmit,
  } = useTransferProducts();
  
  

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Send className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">
            Transfer Inventory
          </h2>
          <p className="text-sm text-muted-foreground">
            Move products to another clinic
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* From / To */}
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <div>
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              From Clinic
            </Label>
            <div className="mt-1.5 rounded-lg border border-border bg-muted px-4 py-2.5 text-sm font-medium text-foreground">
              City Hearing Clinic
            </div>
          </div>
          <div className="flex items-center justify-center pt-4">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              To Clinic
            </Label>
            <DropDown
              options={clinics
                .filter((c) => c.is_main_inventory !== true)
                .map((c) => ({ value: String(c.id), label: c.name }))}
              value={toClinicId}
              onChange={(name, val) => setToClinicId(val)}
              placeholder="Select destination clinic"
              className="mt-1.5"
            />
          </div>
        </div>

        {/* Add Product */}
        <div>
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Add Products
          </Label>
          <div className="mt-1.5 grid gap-2 sm:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-2">
              <DropDown
                options={inventoryItems
                  // .filter((i) => !products.find((p) => p.item.id === i.id))
                  .map((i) => ({
                    value: String(i.id),
                    label: `${i.product_name} — ${i.quantity_in_stock} in stock`,
                  }))}
                value={selectedItemId}
                onChange={(name, val) => setSelectedItemId(val)}
                placeholder="Select a product to transfer"
                className="flex-1"
              />

              {/* Dynamic input: quantity or serial entry */}
              {selectedItem && selectedItem.stock_type === "Non-Serialized" && (
                <div className="flex gap-4">
                  <Input
                    type="number"
                    min={1}
                    max={selectedItem.quantity_in_stock ?? undefined}
                    value={tempQuantity}
                    onChange={(e) => setTempQuantity(e.target.value)}
                    className="w-28"
                  />
                  <div className="flex items-center">
                    <Button
                      onClick={addProduct}
                      disabled={
                        !selectedItemId ||
                        (selectedItem &&
                          (selectedItem.stock_type === "Serialized"
                            ? tempSerials.length === 0
                            : !tempQuantity))
                      }
                      size="sm"
                      className="shrink-0"
                    >
                      <Plus className="mr-1 h-4 w-4" /> Add
                    </Button>
                  </div>
                </div>
              )}

              {selectedItem && selectedItem.stock_type === "Serialized" && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <Input
                      value={tempSerialInput}
                      onChange={(e) => setTempSerialInput(e.target.value)}
                      placeholder="Filter serials"
                      className="w-48"
                    />
                    <div className="flex items-center">
                      <Button
                        onClick={addProduct}
                        disabled={!selectedItemId || tempSerials.length === 0}
                        size="sm"
                        className="shrink-0"
                      >
                        <Plus className="mr-1 h-4 w-4" /> Add
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-sm text-muted-foreground mt-2 mb-1">Available items</div>
                    <div className="max-h-40 overflow-auto rounded border border-border bg-card p-2">
                      {(availableSerials || []).filter((sn) =>
                        String(sn).toLowerCase().includes((tempSerialInput || "").toLowerCase())
                      ).length > 0 ? (
                        (availableSerials || [])
                          .filter((sn) =>
                            String(sn).toLowerCase().includes((tempSerialInput || "").toLowerCase())
                          )
                          .map((sn) => (
                            <label key={sn} className="flex items-center gap-2 px-2 py-1">
                              <input
                                type="checkbox"
                                checked={tempSerials.includes(sn)}
                                onChange={() => toggleAvailableSerial(sn)}
                              />
                              <span className="text-sm">{sn}</span>
                            </label>
                          ))
                      ) : (
                        <div className="text-xs text-muted-foreground px-2 py-1">No serials available</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* show added temp serials below select when selecting a serialized item */}
            {selectedItem &&
              selectedItem.stock_type === "Serialized" &&
              tempSerials.length > 0 && (
                <div className="col-span-full mt-2 flex flex-wrap gap-2">
                  {tempSerials.map((sn) => (
                    <button
                      key={sn}
                      onClick={() => removeTempSerial(sn)}
                      className="rounded-md border px-3 py-1 text-xs font-medium"
                    >
                      {sn} <span className="ml-2 text-muted-foreground">×</span>
                    </button>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* Product List */}
        {products.length > 0 && (
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.item.id}
                className="rounded-lg border border-border bg-muted/40 p-4"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between w-full">
                    <div className="flex gap-4">
                      <Package className="h-4 w-4 text-primary" />
                      <p className="font-medium text-card-foreground">
                        {p.item.product_name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProduct(p.item.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {p.item.brand__name} · {p.item.model_type__name} ·{" "}
                      </p>
                      <CommonBadge title={p.item.stock_type} />
                    </div>
                    {p.item.stock_type === "Non-Serialized" ? (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center gap-1 rounded-lg border border-border bg-card">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(p.item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <div className="flex  w-[40px] justify-center">
                            <input
                              type="number"
                              value={p.quantity}
                              onChange={(e) =>
                                setProductQuantity(p.item.id, e.target.value)
                              }
                              className="w-full text-center"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(p.item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <span className="text-sm text-muted-foreground">
                          Select serial numbers:
                        </span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(p.selectedSerials ?? []).map((sn) => (
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        <div>
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Notes (Optional)
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this transfer..."
            className="mt-1.5 resize-none"
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full"
          // disabled={!toClinicId || products.length === 0 || submitting}
        >
          <Send className="mr-2 h-4 w-4" />
          {submitting ? "Submitting..." : "Submit Transfer"}
        </Button>
      </div>
    </div>
  );
}
