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
            {(() => {
              const devices =
                selectedTrial?.device_details_list ||
                selectedTrial?.device_details ||
                [];
              if (devices.length > 0) {
                return (
                  <div className="flex flex-col gap-2">
                    {devices.map((device) => (
                      <div key={device.id} className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-1 rounded-sm uppercase ${
                              device.ear_side === "LEFT"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {device.ear_side} Ear
                          </span>
                          <p className="font-medium text-foreground text-sm">
                            {device.device_inventory_name ||
                              `${device.device_brand} ${device.device_model}`}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Serial: {device.serial_number}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              }
              return (
                <>
                  <p className="font-medium text-foreground text-sm">
                    {selectedTrial?.device_name || "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedTrial?.serial_number || "#"}
                  </p>
                </>
              );
            })()}
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
              variant={selectedAction === "DECLINE" ? "destructive" : "outline"}
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
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground px-1">
                Select devices from inventory to book for the patient for each trialled ear. The
                trial devices will be returned to trial stock.
              </p>

              {(selectedTrial?.device_details_list || selectedTrial?.device_details)?.map((trialDev) => (
                <div key={trialDev.id} className="space-y-4 p-4 border rounded-lg bg-success/5 border-success/20">
                   <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${trialDev.ear_side === 'LEFT' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                      {trialDev.ear_side} EAR
                    </span>
                    <span className="text-xs text-muted-foreground">Booking Details</span>
                  </div>

                  <div className="space-y-2">
                    <DropDown
                      label="Select Device"
                      name="deviceId"
                      options={inventoryDevice}
                      value={form[trialDev.ear_side].deviceId}
                      onChange={(name, val) => handleChange(name, val, trialDev.ear_side)}
                      formatOptionLabel={(opt) => (
                        <div className="flex flex-col">
                          <p className="flex items-center">
                            <span className="font-medium text-sm">{opt.label} </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              Stock: {opt.qty}
                            </span>
                          </p>
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
                      options={serialOption[trialDev.ear_side] || []}
                      value={form[trialDev.ear_side].serialId}
                      onChange={(name, val) => handleChange(name, val, trialDev.ear_side)}
                      isDisabled={
                        !form[trialDev.ear_side].deviceId ||
                        inventoryDevice.find((d) => d.value === form[trialDev.ear_side].deviceId)
                          ?.qty === 0
                      }
                    />
                  </div>

                  <div>
                    {form[trialDev.ear_side].deviceId && (
                      <div className="flex items-center">
                        <input
                          id={`customization-${trialDev.ear_side}`}
                          name="isCustomization"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={form[trialDev.ear_side].isCustomization}
                          onChange={(e) =>
                            handleChange("isCustomization", e.target.checked, trialDev.ear_side)
                          }
                        />
                        <label
                          htmlFor={`customization-${trialDev.ear_side}`}
                          className="ml-2 block text-sm text-gray-900 font-medium"
                        >
                          Is Customization Required
                        </label>
                      </div>
                    )}
                  </div>

                  {inventoryDevice?.find((d) => d.value === form[trialDev.ear_side].deviceId)?.qty === 0 && (
                    <p className="text-[11px] text-destructive italic">
                      Note: Selected device is out of stock – will be marked as "Awaiting Stock".
                    </p>
                  )}
                </div>
              ))}

              <div className="space-y-2 px-1">
                <Input
                  label="Notes (Optional)"
                  placeholder="Add any overall booking notes..."
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
            <Button onClick={() => handleCompleteTrials()}>
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
            <Button onClick={() => handleCompleteTrials()} variant="extend">
              Extend Trial
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
