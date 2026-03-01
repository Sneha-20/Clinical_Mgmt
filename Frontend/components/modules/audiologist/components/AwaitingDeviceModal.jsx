import { Button } from "@/components/ui/button";
import DropDown from "@/components/ui/dropdown";
import Modal from "@/components/ui/Modal";
import { Package } from "lucide-react";
import React from "react";

export default function AwaitingDeviceModal({
  completeTrialDialogOpen,
  selectedTrial,
  handleCloseDialog,
  serials,
  form,
  handleChange,
  handleCompleteTrial,
  fetchSerialsByDevice,
  isCompleting,
}) {

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
            allocating a serial number for the device.
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

          {/* Serial Number Selection */}
          <div className="space-y-4 p-4 border rounded-lg bg-green-50/50 border-green-200">
            <p className="text-sm text-muted-foreground">
              Choose an available serial number to allocate for the patient's trial.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Serial Number <span className="text-red-500">*</span>
              </label>
              <DropDown
                name="serialId"
                options={serials}
                value={form.serialId}
                onChange={handleChange}
                placeholder="Select serial..."
                isDisabled={serials.length === 0}
              />
              {serials.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No serials available for this device
                </p>
              )}
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
            disabled={!form.serialId || isCompleting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isCompleting ? "Allocating..." : "Allocate Device"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
