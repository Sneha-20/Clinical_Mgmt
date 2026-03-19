import { Button } from "@/components/ui/button";
import DropDown from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/Modal";
import { extractYupErrors } from "@/lib/utils/helper/extractError";
import { visitPatientSchema } from "@/lib/utils/schema";
import { useCallback, useEffect, useState } from "react";
import CommonDatePicker from "@/components/ui/CommonDatePicker";
import CommonCheckbox from "@/components/ui/CommonCheckbox";
import CommonRadio from "@/components/ui/CommonRadio";
import { format } from "date-fns";
import { getPatientDevicePurchases } from "@/lib/services/dashboard";
import { tgaServiceOptions } from "@/lib/utils/constants/staticValue";
import {
  visitTypeOptions,
  testRequestedOptions,
  complaintOptions,
} from "@/lib/utils/constants/staticValue";
import { showToast } from "@/components/ui/toast";
import TextArea from "@/components/ui/TextArea";
import usePatientData from "@/lib/hooks/usePatientData";

export default function PatientVisitForm({
  onClose,
  onSubmit,
  showSelctedPatientId,
  doctorList,
  isModalOpen,
}) {
  const [errors, setErrors] = useState({});
  const [patientDevices, setPatientDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  const { inventoryItems, loadingInventory, fetchSerialsForItem } =
    usePatientData();

  const serviceOption = [
    { label: "Clinic", value: "clinic" },
    { label: "Home", value: "home" },
  ];

  const initialVisitDetails = {
    visit_type: "",
    present_complaint: "",
    seen_by: "",
    test_requested: [],
    notes: "",
    cost_taken_amount: "",
    mode_of_payment: "",
    tga_service_type: "",
    device_serial_number: "",
    complaint: "",
    purchase_items: [],
    duration_of_problem: "",
    ear_side: "",
    previous_test_done: false,
  };

  const getInitialFormState = (patientId) => ({
    patient: patientId || null,
    service_type: "clinic",
    appointment_date: "",
    visit_details: [initialVisitDetails],
  });

  useEffect(() => {
    if (showSelctedPatientId) {
      setFormData((prev) => ({
        ...prev,
        patient: showSelctedPatientId,
      }));
    }
  }, [showSelctedPatientId]);

  const doctors = doctorList.map((doctor) => ({
    label: doctor.name,
    value: doctor.id,
  }));

  const [formData, setFormData] = useState(
    getInitialFormState(showSelctedPatientId),
  );

  const updateField = useCallback(
    (name, value) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors],
  );

  useEffect(() => {
    if (showSelctedPatientId) {
      fetchPatientDevices(showSelctedPatientId);
    }
  }, [showSelctedPatientId]);

  const fetchPatientDevices = async (patientId) => {
    try {
      setLoadingDevices(true);
      const response = await getPatientDevicePurchases(patientId);
      if (response) {
        const deviceOptions = response.map((device) => ({
          label: `${device.product_name} - ${device.serial_number}`,
          value: device.serial_number,
        }));
        setPatientDevices(deviceOptions);
      }
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to fetch patient devices",
      });
    } finally {
      setLoadingDevices(false);
    }
  };

  const addPurchaseItem = (visitIndex) => {
    const updatedVisit = [...formData.visit_details];
    const purchaseItems = updatedVisit[visitIndex].purchase_items || [];
    purchaseItems.push({
      inventory_item: "",
      quantity: 1,
      serial_numbers: [],
      stock_type: "",
      serials: [],
    });
    updatedVisit[visitIndex].purchase_items = purchaseItems;
    setFormData((prev) => ({ ...prev, visit_details: updatedVisit }));
  };

  const updatePurchaseItem = (visitIndex, itemIndex, key, value) => {
    const updatedVisit = [...formData.visit_details];
    const purchaseItems = [...updatedVisit[visitIndex].purchase_items];

    if (key === "serial_numbers") {
      purchaseItems[itemIndex] = {
        ...purchaseItems[itemIndex],
        serial_numbers: value,
        quantity: value.length,
        stockError: value.length > (purchaseItems[itemIndex].quantity_in_stock || 0)
      };
    } else if (key === "quantity") {
      const qty = parseInt(value) || 0;
      const inStock = purchaseItems[itemIndex].quantity_in_stock || 0;
      purchaseItems[itemIndex] = { 
        ...purchaseItems[itemIndex], 
        [key]: qty,
        stockError: qty > inStock
      };
    } else {
      purchaseItems[itemIndex] = { ...purchaseItems[itemIndex], [key]: value };
    }

    if (key === "inventory_item" && value) {
      const selectedItem = inventoryItems.find((item) => item.value === value);
      if (selectedItem) {
        purchaseItems[itemIndex].stock_type = selectedItem.stock_type;
        purchaseItems[itemIndex].quantity_in_stock = selectedItem.quantity_in_stock;
        purchaseItems[itemIndex].serial_numbers = [];
        purchaseItems[itemIndex].stockError = false;
        if (selectedItem.stock_type === "Serialized") {
          handleFetchSerialsForItem(value, visitIndex, itemIndex, true);
        }
      }
    }

    updatedVisit[visitIndex].purchase_items = purchaseItems;
    setFormData((prev) => ({ ...prev, visit_details: updatedVisit }));
  };

  const handleFetchSerialsForItem = async (
    inventoryItemId,
    visitIndex,
    itemIndex,
    showAvailableOnly,
  ) => {
    const serials = await fetchSerialsForItem(inventoryItemId, showAvailableOnly);
    if (serials && serials.length > 0) {
      const updatedVisit = [...formData.visit_details];
      const purchaseItems = [...updatedVisit[visitIndex].purchase_items];
      purchaseItems[itemIndex].serials = serials;
      updatedVisit[visitIndex].purchase_items = purchaseItems;
      setFormData((prev) => ({ ...prev, visit_details: updatedVisit }));
    }
  };

  const removePurchaseItem = (visitIndex, itemIndex) => {
    const updatedVisit = [...formData.visit_details];
    const purchaseItems = updatedVisit[visitIndex].purchase_items.filter(
      (_, i) => i !== itemIndex,
    );
    updatedVisit[visitIndex].purchase_items = purchaseItems;
    setFormData((prev) => ({ ...prev, visit_details: updatedVisit }));
  };

  /* ----------------- Update Visit Details ----------------- */
  const updateVisitDetails = (index, key, value) => {
    const updatedVisit = [...formData.visit_details];
    updatedVisit[index] = { ...updatedVisit[index], [key]: value };
    setFormData((prev) => ({ ...prev, visit_details: updatedVisit }));
  };

  const handleAddMoreVisit = () => {
    const lastVisit = formData.visit_details[formData.visit_details.length - 1];
    if (lastVisit.visit_type === "Purchase") {
      if (!lastVisit.purchase_items || lastVisit.purchase_items.length === 0) {
        return showToast({
          type: "error",
          message:
            "Please add at least one purchase item before adding a new visit.",
        });
      }
    } else if (lastVisit.visit_type === "TGA") {
      if (!lastVisit.tga_service_type || !lastVisit.complaint) {
        return showToast({
          type: "error",
          message:
            "Please fill in TGA service type and complaint before adding a new visit.",
        });
      }
    } else {
      if (!lastVisit.visit_type || !lastVisit.present_complaint) {
        return showToast({
          type: "error",
          message:
            "Please fill in the current visit details before adding a new one.",
        });
      }
    }

    setFormData((prev) => ({
      ...prev,
      visit_details: [
        ...prev.visit_details,
        {
          visit_type: "",
          present_complaint: "",
          seen_by: "",
          test_requested: [],
          notes: "",
          purchase_items: [],
          duration_of_problem: "",
          ear_side: "",
          previous_test_done: false,
        },
      ],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const hasStockError = formData.visit_details.some(visit => 
      visit.purchase_items?.some(item => item.stockError)
    );

    if (hasStockError) {
      return showToast({
        type: "error",
        message: "Insufficient stock for one or more purchase items.",
      });
    }

    try {
      await visitPatientSchema.validate(formData, { abortEarly: false });
      setErrors({});
      const filteredPayload = {
        ...formData,
        visit_details: formData.visit_details.map((visit) => {
          if (visit.visit_type === "TGA") {
            return {
              visit_type: visit.visit_type,
              tga_service_type: visit.tga_service_type,
              device_serial_need_service: visit.device_serial_number,
              complaint: visit.complaint,
            };
          } else if (visit.visit_type === "Purchase") {
            return {
              visit_type: visit.visit_type,
              purchase_items: visit.purchase_items.map((item) => {
                const { serials, stock_type, ...itemData } = item;
                if (stock_type === "Non-Serialized") {
                  const { serial_numbers, ...cleanItem } = itemData;
                  return cleanItem;
                } else {
                  const { quantity, ...cleanItem } = itemData;
                  return cleanItem;
                }
              }),
            };
          } else {
            // Include all fields for other visit types
            const {
              tga_service_type,
              device_serial_number,
              complaint,
              purchase_items,
              ...rest
            } = visit;

            return rest;
          }
        }),
      };

      if (onSubmit) await onSubmit(filteredPayload);
      setFormData(getInitialFormState(showSelctedPatientId));
      setErrors({});
    } catch (error) {
      if (error.name === "ValidationError") {
        setErrors(extractYupErrors(error));
      } else {
        showToast({
          type: "error",
          message: error?.response?.data?.error || "Something went wrong",
        });
      }
    }
  };

  return (
    <Modal
      header="Patient Visit Form"
      isModalOpen={isModalOpen}
      onClose={onClose}
      showButton={false}
      ClassName=""
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="font-semibold text-primary mb-3">Service Type</h3>
          <div className="flex gap-6">
            {serviceOption.map((item) => (
              <CommonRadio
                key={item.value}
                label={item.label}
                value={item.value}
                name="service_type"
                checked={formData.service_type === item.value}
                onChange={() => updateField("service_type", item.value)}
              />
            ))}
          </div>
          {errors?.service_type && (
            <p className="text-red-500 text-sm mt-1">{errors.service_type}</p>
          )}
        </div>
        <CommonDatePicker
          label="Appointment Date*"
          selectedDate={
            formData.appointment_date
              ? new Date(formData.appointment_date)
              : null
          }
          onChange={(date) =>
            updateField("appointment_date", format(date, "yyyy-MM-dd"))
          }
          minDate={new Date()}
          error={errors.appointment_date}
        />

        {/* ---------------- VISIT DETAILS (MULTIPLE) ---------------- */}
        {formData.visit_details.map((visit, index) => (
          <div key={index} className="border-t pt-4">
            <h3 className="font-semibold text-primary mb-3">
              Visit Details {index + 1}
            </h3>

            <DropDown
              label="Purpose of Visit"
              name="visit_type"
              options={visitTypeOptions}
              value={visit.visit_type}
              onChange={(n, v) => updateVisitDetails(index, "visit_type", v)}
              error={errors?.visit_details?.[index]?.visit_type}
            />

            {visit.visit_type !== "TGA" && visit.visit_type !== "Purchase" && (
              <>
                {["Hearing Test", "'Hearing Aids Trial", "Hearing Aids Test & Trial"].includes(visit.visit_type) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-teal-50/50 p-4 rounded-lg border border-teal-100 mb-4">
                    <Input
                      label="Duration of Problem"
                      placeholder="e.g. 6 months"
                      value={visit.duration_of_problem}
                      onChange={(e) =>
                        updateVisitDetails(index, "duration_of_problem", e.target.value)
                      }
                    />
                    <DropDown
                      label="Ear Side"
                      name="ear_side"
                      options={[
                        { label: "Both", value: "both" },
                        { label: "Left", value: "left" },
                        { label: "Right", value: "right" },
                      ]}
                      value={visit.ear_side}
                      onChange={(n, v) => updateVisitDetails(index, "ear_side", v)}
                    />
                    <div className="flex items-center pt-5">
                      <CommonCheckbox
                        label="Previous Test Done"
                        checked={visit.previous_test_done}
                        onChange={(e) =>
                          updateVisitDetails(index, "previous_test_done", e.target.checked)
                        }
                      />
                    </div>
                  </div>
                )}
                <DropDown
                  label="Assigned To"
                  name="seen_by"
                  options={doctors}
                  value={visit.seen_by}
                  onChange={(n, v) => updateVisitDetails(index, "seen_by", v)}
                  error={errors?.visit_details?.[index]?.seen_by}
                />
                <DropDown
                  label="Present Complaint"
                  name="present_complaint"
                  options={complaintOptions}
                  value={visit.present_complaint}
                  onChange={(n, v) =>
                    updateVisitDetails(index, "present_complaint", v)
                  }
                  className="mt-2"
                />

                <div className="mt-2">
                  <label className="text-sm font-medium mb-1 block">
                    Notes
                  </label>
                  <TextArea
                    name={`visit_details.${index}.notes`}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Notes about complaint"
                    value={visit.notes}
                    onChange={(e) =>
                      updateVisitDetails(index, "notes", e.target.value)
                    }
                    rows={3}
                  />
                </div>
                {(visit.visit_type === "New Test" ||
                  visit.visit_type === "Hearing Aid Trial") && (
                    <>
                      <div className="mt-4">
                        <label className="font-medium text-sm text-gray-700">
                          Tests Required (Tick)
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {testRequestedOptions.map((test) => (
                          <CommonCheckbox
                            key={test.value}
                            label={test.label}
                            value={test.value}
                            checked={visit.test_requested.includes(test.value)}
                            onChange={(e) => {
                              const value = e.target.value;
                              const updated = visit.test_requested.includes(value)
                                ? visit.test_requested.filter((t) => t !== value)
                                : [...visit.test_requested, value];
                              updateVisitDetails(
                                index,
                                "test_requested",
                                updated,
                              );
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <Input
                    label="Amount Taken From Patient"
                    name="cost_taken_amount"
                    type="number"
                    placeholder="Enter Amount"
                    value={visit.cost_taken_amount}
                    onChange={(e) =>
                      updateVisitDetails(
                        index,
                        "cost_taken_amount",
                        e.target.value,
                      )
                    }
                  />

                  <Input
                    label="Mode of Payment"
                    name="mode_of_payment"
                    value={visit.mode_of_payment}
                    onChange={(e) =>
                      updateVisitDetails(
                        index,
                        "mode_of_payment",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </>
            )}

            {/* TGA Specific Fields */}
            {visit.visit_type === "TGA" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <DropDown
                    label="TGA Service Type"
                    name="tga_service_type"
                    options={tgaServiceOptions}
                    value={visit.tga_service_type}
                    onChange={(n, v) =>
                      updateVisitDetails(index, "tga_service_type", v)
                    }
                    error={errors?.visit_details?.[index]?.tga_service_type}
                  />

                  <DropDown
                    label="Device Serial Number"
                    name="device_serial_number"
                    options={patientDevices}
                    value={visit.device_serial_number}
                    onChange={(n, v) =>
                      updateVisitDetails(index, "device_serial_number", v)
                    }
                    error={errors?.visit_details?.[index]?.device_serial_number}
                    disabled={loadingDevices}
                    placeholder={
                      loadingDevices ? "Loading devices..." : "Select device"
                    }
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label="Complaint"
                    name="complaint"
                    placeholder="Describe the issue or complaint"
                    value={visit.complaint}
                    onChange={(e) =>
                      updateVisitDetails(index, "complaint", e.target.value)
                    }
                    error={errors?.visit_details?.[index]?.complaint}
                  />
                </div>
              </>
            )}

            {/* Purchase Specific Fields */}
            {visit.visit_type === "Purchase" && (
              <>
                <div className="mt-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                    Purchase Items
                  </h4>
                  {visit.purchase_items &&
                    visit.purchase_items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="border rounded-lg p-4 mb-4 bg-gray-50"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <DropDown
                            label="Inventory Item"
                            name={`inventory_item_${itemIndex}`}
                            options={inventoryItems}
                            value={item.inventory_item}
                            onChange={(n, v) =>
                              updatePurchaseItem(
                                index,
                                itemIndex,
                                "inventory_item",
                                v,
                              )
                            }
                            disabled={loadingInventory}
                            placeholder={
                              loadingInventory
                                ? "Loading items..."
                                : "Select item"
                            }
                          />
                          {item.stock_type === "Non-Serialized" && (
                            <div className="flex flex-col">
                              <Input
                                label={`Quantity (In Stock: ${item.quantity_in_stock || 0})`}
                                name={`quantity_${itemIndex}`}
                                type="number"
                                min="1"
                                value={item.quantity || ""}
                                onChange={(e) => {
                                  updatePurchaseItem(
                                    index,
                                    itemIndex,
                                    "quantity",
                                    e.target.value
                                  );
                                }}
                                className={item.stockError ? "border-red-500" : ""}
                              />
                              {item.stockError && (
                                <p className="text-red-500 text-xs mt-1">Insufficient stock</p>
                              )}
                            </div>
                          )}
                          {item.stock_type === "Serialized" && (
                            <div className="mt-2">
                              <label className="text-sm font-medium mb-2 block">
                                Serial Numbers
                              </label>
                              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2 bg-white">
                                {item.serials && item.serials.length > 0 ? (
                                  item.serials.map((serial) => (
                                    <div
                                      key={serial.value}
                                      className="flex items-center"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`serial_${itemIndex}_${serial.value}`}
                                        checked={item.serial_numbers.includes(
                                          serial.value,
                                        )}
                                        onChange={(e) => {
                                          const currentSerials =
                                            item.serial_numbers || [];
                                          if (e.target.checked) {
                                            updatePurchaseItem(
                                              index,
                                              itemIndex,
                                              "serial_numbers",
                                              [...currentSerials, serial.value],
                                            );
                                          } else {
                                            updatePurchaseItem(
                                              index,
                                              itemIndex,
                                              "serial_numbers",
                                              currentSerials.filter(
                                                (s) => s !== serial.value,
                                              ),
                                            );
                                          }
                                        }}
                                        className="rounded"
                                      />
                                      <label
                                        htmlFor={`serial_${itemIndex}_${serial.value}`}
                                        className="ml-2 text-sm cursor-pointer"
                                      >
                                        {serial.label}
                                      </label>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-gray-500">
                                    Loading serial numbers...
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePurchaseItem(index, itemIndex)}
                          className="mt-2"
                        >
                          Remove Item
                        </Button>
                      </div>
                    ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addPurchaseItem(index)}
                    className="mt-2"
                  >
                    + Add Purchase Item
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add More Visit Button */}
        <Button
          type="button"
          onClick={handleAddMoreVisit}
          className="mt-2"
          variant="outline"
        >
          + Add More Visit
        </Button>

        {Object.keys(errors).length > 0 && (
          <p className="text-red-500 text-sm mb-2 font-medium">
            Please fill all required fields correctly.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Register Patient</Button>
        </div>
      </form>
    </Modal>
  );
}
