import { Button } from "@/components/ui/button";
import DropDown from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/Modal";
import TextArea from "@/components/ui/TextArea";
import { CheckCircle, Package } from "lucide-react";
import React, { useEffect } from "react";

export default function AwaitingDeviceModal({
  completeTrialDialogOpen,
  selectedTrial,
  handleCloseDialog,
  inventoryDevice,
  serials,
  form,
  handleChange,
  handleCompleteTrial,
  fetchSerialsByDevice,
  isCompleting,
}) {
  useEffect(() => {
    if (form.deviceId) {
      fetchSerialsByDevice(form.deviceId);
    }
  }, [form.deviceId]);

  return (
    <Modal
      header="Complete Awaiting Stock Trial"
      Icon={Package}
      isModalOpen={completeTrialDialogOpen}
      showButton={false}
      onClose={handleCloseDialog}
      ClassName="w-[550px]"
    >
      <div className="sm:max-w-lg">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Complete the trial for <strong>{selectedTrial?.patient_name}</strong> by
            allocating a device from inventory.
          </p>
        </div>

        <div className="py-4">
          {/* Trial Device Info */}
          <div className="p-3 bg-blue-50 rounded-lg mb-6 border border-blue-200">
            <p className="text-xs text-muted-foreground mb-2">Trial Information</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Device</p>
                <p className="font-medium text-foreground">
                  {selectedTrial?.device_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Brand</p>
                <p className="font-medium text-foreground">
                  {selectedTrial?.device_brand}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Model</p>
                <p className="font-medium text-foreground">
                  {selectedTrial?.device_model}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">End Date</p>
                <p className="font-medium text-foreground">
                  {new Date(selectedTrial?.trial_end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Device Selection Content */}
          <div className="space-y-4 p-4 border rounded-lg bg-green-50/50 border-green-200">
            <p className="text-sm text-muted-foreground">
              Select a device from inventory to allocate to the patient. The
              trial device will be returned to trial stock.
            </p>

            {/* Device Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Device from Inventory <span className="text-red-500">*</span>
              </label>
              <DropDown
                name="deviceId"
                options={inventoryDevice}
                value={form.deviceId}
                onChange={handleChange}
                placeholder="Choose a device..."
                formatOptionLabel={(opt) => (
                  <div className="flex flex-col py-1">
                    <p className="flex items-center gap-2">
                      <span className="font-medium">{opt.label}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          opt.qty > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        Stock: {opt.qty}
                      </span>
                    </p>
                    <span className="text-xs text-gray-500">
                      {opt.brand} • ₹{opt.price}
                    </span>
                  </div>
                )}
              />
              {inventoryDevice?.find((d) => d.value === form.deviceId)?.qty ===
                0 && (
                <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                  ⚠️ Selected device is currently out of stock
                </p>
              )}
            </div>

            {/* Serial Number Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Serial Number <span className="text-red-500">*</span>
              </label>
              <DropDown
                name="serialId"
                options={serials}
                value={form.serialId}
                onChange={handleChange}
                placeholder="Choose a serial number..."
                isDisabled={!form.deviceId}
              />
              {!form.deviceId && (
                <p className="text-xs text-muted-foreground">
                  Select a device first to load available serials
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <TextArea
                name="notes"
                placeholder="Add any notes about the allocation..."
                value={form.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button variant="outline" onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleCompleteTrial}
            disabled={
              !form.deviceId || !form.serialId || isCompleting
            }
            className="bg-green-600 hover:bg-green-700"
          >
            {isCompleting ? "Completing..." : "Complete & Allocate Device"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
