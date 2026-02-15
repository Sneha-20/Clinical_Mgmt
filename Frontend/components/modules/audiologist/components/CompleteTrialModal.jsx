import { Button } from "@/components/ui/button";
import DropDown from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/Modal";
import TextArea from "@/components/ui/TextArea";
import { CheckCircle, Package, RotateCcw, XCircle } from "lucide-react";
import React, { useState } from "react";

export default function CompleteTrialModal({
  completeTrialDialogOpen,
  selectedTrial,
  serialOption,
  handleCloseDialog,
  inventoryDevice,
  extendForm,
  setExtendForm,
  selectedAction,
  setSelectedAction,
  form,
  handleChange,
  handleCompleteTrials,
  setNotBookReason,
  notBookReason,
  handleExtendChange,
}) {
  const scheduleDayOptions = [
    { label: "3 days", value: 3 },
    { label: "5 days", value: 5 },
    { label: "7 days (1 week)", value: 7 },
    { label: "10 days", value: 10 },
    { label: "14 days (2 weeks)", value: 14 },
  ];
  return (
    <Modal
      header="Complete Trial"
      Icon={Package}
      isModalOpen={completeTrialDialogOpen}
      showButton={false}
      onClose={handleCloseDialog}
      ClassName="w-[550px]"
    >
      <div className="sm:max-w-lg">
        <div>
          <div>
            How would you like to proceed with {selectedTrial?.assigned_patient}
            's trial of {selectedTrial?.device_name}?
          </div>
        </div>

        <div className="py-4">
          {/* Trial Device Info */}
          <div className="p-3 bg-slate-100 rounded-lg mb-4">
            <p className="text-xs text-muted-foreground mb-1">Trial Device</p>
            <p className="font-medium text-foreground">
              {selectedTrial?.device_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedTrial?.serial_number}
            </p>
          </div>

          {/* Action Selection Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Button
              variant={selectedAction === "BOOK" ? "success" : "outline"}
              onClick={() => setSelectedAction("BOOK")}
              className={`h-auto py-3 flex flex-col gap-1 `}
            >
              <CheckCircle className="h-5 w-5" />
              <span className="text-xs">Book Device</span>
            </Button>
            <Button
              variant={
                selectedAction === "DECLINE" ? "destructive" : "outline"
              }
              onClick={() => setSelectedAction("DECLINE")}
              className={`h-auto py-3 flex flex-col gap-1 `}
            >
              <XCircle className="h-5 w-5" />
              <span className="text-xs">Not Book</span>
            </Button>
            <Button
              variant={selectedAction === "FOLLOWUP" ? "extend" : "outline"}
              onClick={() => setSelectedAction("FOLLOWUP")}
              className={`h-auto py-3 flex flex-col gap-1 `}
            >
              <RotateCcw className="h-5 w-5" />
              <span className="text-xs">Extend Trial</span>
            </Button>
          </div>

          {/* Book Device Content */}
          {selectedAction === "BOOK" && (
            <div className="space-y-4 p-4 border rounded-lg bg-success/5 border-success/20">
              <p className="text-sm text-muted-foreground">
                Select a device from inventory to book for the patient. The
                trial device will be returned to trial stock.
              </p>

              <div className="space-y-2">
                <DropDown
                  label="Select Device"
                  name="deviceId"
                  options={inventoryDevice}
                  value={form.deviceId}
                  onChange={handleChange}
                  formatOptionLabel={(opt) => (
                    <div className="flex flex-col">
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-xs text-gray-500">
                        {opt.brand} • ₹{opt.price}
                      </span>
                    </div>
                  )}
                />
              </div>
              <div className="space-y-2">
                <DropDown
                  label="Select Serial Number"
                  name="serialId"
                  options={serialOption}
                  value={form.serialId}
                  onChange={handleChange}
                  isDisabled={!form.deviceId}
                />
              </div>

              <div className="space-y-2">
                <Input
                  label="Notes (Optional)"
                  placeholder="Add any booking notes..."
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Not Book Content */}
          {selectedAction === "DECLINE" && (
            <div className="space-y-4 p-4 border rounded-lg bg-destructive/5 border-destructive/20">
              <p className="text-sm text-muted-foreground">
                The patient has decided not to book this device. Please provide
                a reason.
              </p>

              <div className="space-y-2">
                {/* <Label>Reason for Not Booking <span className="text-destructive">*</span></Label> */}
                <TextArea
                  label="Reason for Not Booking"
                  name="notBookReason"
                  placeholder="Why is the patient not booking this device?"
                  value={notBookReason}
                  onChange={(e) => setNotBookReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* FOLLOWUP Trial Content */}
          {selectedAction === "FOLLOWUP" && (
            <div className="space-y-4 p-4 border rounded-lg bg-warning/5 border-warning/20">
              <p className="text-sm text-muted-foreground">
                The patient needs more time to evaluate the device.
              </p>

              {/* Reason */}
              <div className="space-y-2">
                <TextArea
                  label="Reason for Extension"
                  name="reason"
                  placeholder="Why does the patient need more trial time?"
                  value={extendForm.reason}
                  onChange={(e) =>
                    setExtendForm((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  rows={4}
                />
              </div>

              {/* Additional Days */}
              <div className="space-y-2">
                <DropDown
                  label="Additional Days"
                  name="dayCount"
                  options={scheduleDayOptions}
                  value={extendForm.dayCount}
                  onChange={handleExtendChange}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCloseDialog}>
            Cancel
          </Button>

          {selectedAction === "BOOK" && (
            <Button
              onClick={() => handleCompleteTrials()}
              //   disabled={!selectedInventoryDevice}
              //   className="bg-success hover:bg-success/90"
            >
              Confirm Booking
            </Button>
          )}

          {selectedAction === "DECLINE" && (
            <Button
              onClick={() => handleCompleteTrials()}
              disabled={!notBookReason}
              variant="destructive"
            >
              Confirm Not Booked
            </Button>
          )}

          {selectedAction === "FOLLOWUP" && (
            <Button
                onClick={() => handleCompleteTrials()}
              //   disabled={!extendReason || !extendDays}
               variant="extend"
              // className="bg-warning hover:bg-warning/90 text-warning-foreground"
            >
              Extend Trial
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
