"use client";

import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import DropDown from "@/components/ui/dropdown";
import CommonDatePicker from "@/components/ui/CommonDatePicker";
import CommonCheckbox from "@/components/ui/CommonCheckbox";
import CommonRadio from "@/components/ui/CommonRadio";
import { patientSchema } from "@/lib/utils/schema";
import { showToast } from "@/components/ui/toast";
import { format } from "date-fns";
import TextArea from "@/components/ui/TextArea";
import usePatientData from "@/lib/hooks/usePatientData";

import {
  genderOptions,
  visitTypeOptions,
  testRequestedOptions,
  complaintOptions,
} from "@/lib/utils/constants/staticValue";

export default function PatientRegistrationForm({
  onClose,
  onSubmit,
  doctorList,
}) {
  const { inventoryItems, loadingInventory, fetchSerialsForItem } =
    usePatientData();

  const doctors = doctorList.map((d) => ({
    label: d.name,
    value: d.id,
  }));

  const doctorOption = [{ label: "Receptionist", value: 0 }, ...doctors];

  const referalTypeOptions = [
    { label: "Self", value: "Self" },
    { label: "Doctor", value: "doctor" },
    { label: "Advertisement", value: "advertisement" },
    { label: "Other", value: "other" },
  ];

  const serviceOption = [
    { label: "Clinic", value: "clinic" },
    { label: "Home", value: "home" },
  ];
  const newVisitTypeOptions = visitTypeOptions.filter(
    (option) => option.value !== "TGA",
  );

  const formik = useFormik({
    initialValues: {
      name: "",
      age: "",
      dob: null,
      email: "",
      gender: "",
      phone_primary: "",
      phone_secondary: "",
      city: "",
      address: "",
      referral_type: "Self",
      referral_doctor: "",
      appointment_date: "",
      service_type: "clinic",
      visit_details: [
        {
          visit_type: "",
          present_complaint: "",
          seen_by: "",
          test_requested: [],
          notes: "",
          cost_taken_amount: null,
          mode_of_payment: "",
          purchase_items: [],
        },
      ],
    },
    // validationSchema: patientSchema,
    onSubmit: (values) => {
      const filteredPayload = {
        ...values,
        visit_details: values.visit_details.map((visit) => {
          if (visit.visit_type === "Purchase") {
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
            const { purchase_items, ...rest } = visit;
            return rest;
          }
        }),
      };
      onSubmit?.(filteredPayload);
    },
  });

  /* ---------------- ADD MORE VISIT ---------------- */
  const handleAddMoreVisit = () => {
    const lastVisit =
      formik.values.visit_details[formik.values.visit_details.length - 1];

    if (lastVisit.visit_type === "Purchase") {
      if (!lastVisit.purchase_items || lastVisit.purchase_items.length === 0) {
        return showToast({
          type: "error",
          message:
            "Please add at least one purchase item before adding a new visit.",
        });
      }
    } else if (!lastVisit.visit_type || !lastVisit.present_complaint) {
      return showToast({
        type: "error",
        message:
          "Please fill in the current visit details before adding a new one.",
      });
    }

    formik.setFieldValue("visit_details", [
      ...formik.values.visit_details,
      {
        visit_type: "",
        present_complaint: "",
        seen_by: "",
        test_requested: [],
        notes: "",
        cost_taken_amount: null,
        mode_of_payment: "",
        purchase_items: [],
      },
    ]);
  };

  /* ---------------- PURCHASE ITEM METHODS ---------------- */
  const addPurchaseItem = (visitIndex) => {
    const purchaseItems =
      formik.values.visit_details[visitIndex].purchase_items || [];
    purchaseItems.push({
      inventory_item: "",
      quantity: 1,
      serial_numbers: [],
      stock_type: "",
      serials: [],
    });
    formik.setFieldValue(
      `visit_details.${visitIndex}.purchase_items`,
      purchaseItems,
    );
  };

  const removePurchaseItem = (visitIndex, itemIndex) => {
    const purchaseItems =
      formik.values.visit_details[visitIndex].purchase_items || [];
    const updated = purchaseItems.filter((_, i) => i !== itemIndex);
    formik.setFieldValue(`visit_details.${visitIndex}.purchase_items`, updated);
  };

  const updatePurchaseItem = (visitIndex, itemIndex, key, value) => {
    const purchaseItems = [
      ...(formik.values.visit_details[visitIndex].purchase_items || []),
    ];

    if (key === "serial_numbers") {
      purchaseItems[itemIndex] = {
        ...purchaseItems[itemIndex],
        serial_numbers: value,
      };
    } else {
      purchaseItems[itemIndex] = { ...purchaseItems[itemIndex], [key]: value };
    }

    // Handle inventory item selection - set stock_type before updating formik
    if (key === "inventory_item" && value) {
      const selectedItem = inventoryItems.find((item) => item.value === value);
      if (selectedItem) {
        purchaseItems[itemIndex].stock_type = selectedItem.stock_type;
        purchaseItems[itemIndex].serial_numbers = [];
        if (selectedItem.stock_type === "Serialized") {
          handleFetchSerialsForItem(value, visitIndex, itemIndex);
        }
      }
    }

    formik.setFieldValue(
      `visit_details.${visitIndex}.purchase_items`,
      purchaseItems,
    );
  };

  const handleFetchSerialsForItem = async (
    inventoryItemId,
    visitIndex,
    itemIndex,
  ) => {
    const serials = await fetchSerialsForItem(inventoryItemId);
    if (serials && serials.length > 0) {
      const purchaseItems = [
        ...(formik.values.visit_details[visitIndex].purchase_items || []),
      ];
      purchaseItems[itemIndex] = {
        ...purchaseItems[itemIndex],
        serials: serials,
      };
      formik.setFieldValue(
        `visit_details.${visitIndex}.purchase_items`,
        purchaseItems,
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-lg">New Patient Registration</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* PERSONAL INFO */}
            <div>
              <h3 className="font-semibold text-primary mb-3">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && formik.errors.name}
                  important
                />
                <CommonDatePicker
                  label="Date of Birth"
                  selectedDate={
                    formik.values.dob ? new Date(formik.values.dob) : null
                  }
                  onChange={(date) =>
                    formik.setFieldValue(
                      "dob",
                      date ? format(date, "yyyy-MM-dd") : null,
                    )
                  }
                  maxDate={new Date()}
                  error={formik.touched.dob && formik.errors.dob}
                />
                <Input
                  label="Age"
                  name="age"
                  type="number"
                  value={formik.values.age}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.age && formik.errors.age}
                  important
                />

                <DropDown
                  label="Gender"
                  name="gender"
                  options={genderOptions}
                  value={formik.values.gender}
                  onChange={(n, v) => formik.setFieldValue("gender", v)}
                  error={formik.touched.gender && formik.errors.gender}
                  important
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && formik.errors.email}
                />

                <Input
                  label="Primary Phone"
                  name="phone_primary"
                  maxLength={10}
                  value={formik.values.phone_primary}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.phone_primary && formik.errors.phone_primary
                  }
                  important
                />

                <Input
                  label="Secondary Phone"
                  name="phone_secondary"
                  value={formik.values.phone_secondary}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.phone_secondary &&
                    formik.errors.phone_secondary
                  }
                />

                <Input
                  label="City"
                  name="city"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.city && formik.errors.city}
                  important
                />

                <Input
                  label="Address"
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.address && formik.errors.address}
                  important
                />

                <CommonDatePicker
                  label="Appointment Date"
                  selectedDate={
                    formik.values.appointment_date
                      ? new Date(formik.values.appointment_date)
                      : null
                  }
                  onChange={(date) =>
                    formik.setFieldValue(
                      "appointment_date",
                      format(date, "yyyy-MM-dd"),
                    )
                  }
                  minDate={new Date()}
                  error={
                    formik.touched.appointment_date &&
                    formik.errors.appointment_date
                  }
                />
              </div>
            </div>

            {/* REFERRAL */}
            <div>
              <h3 className="font-semibold text-primary mb-3">Referral</h3>

              <div className="flex gap-6">
                {referalTypeOptions.map((item) => (
                  <CommonRadio
                    key={item.value}
                    label={item.label}
                    value={item.value}
                    name="referral_type"
                    checked={formik.values.referral_type === item.value}
                    onChange={() =>
                      formik.setFieldValue("referral_type", item.value)
                    }
                  />
                ))}
              </div>

              {formik.values.referral_type === "doctor" && (
                <Input
                  label="Doctor Name"
                  name="referral_doctor"
                  value={formik.values.referral_doctor}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.referral_doctor &&
                    formik.errors.referral_doctor
                  }
                />
              )}
            </div>

            {/* SERVICE TYPE */}
            <div>
              <h3 className="font-semibold text-primary mb-3">Service Type</h3>

              <div className="flex gap-6">
                {serviceOption.map((item) => (
                  <CommonRadio
                    key={item.value}
                    label={item.label}
                    value={item.value}
                    name="service_type"
                    checked={formik.values.service_type === item.value}
                    onChange={() =>
                      formik.setFieldValue("service_type", item.value)
                    }
                  />
                ))}
              </div>
            </div>

            {/* VISIT DETAILS */}
            {formik.values.visit_details.map((visit, index) => (
              <div key={index} className="border-t pt-4">
                <h3 className="font-semibold text-primary mb-3">
                  Visit Details {index + 1}
                </h3>

                <DropDown
                  label="Purpose of Visit"
                  options={newVisitTypeOptions}
                  value={visit.visit_type}
                  onChange={(n, v) =>
                    formik.setFieldValue(`visit_details.${index}.visit_type`, v)
                  }
                  error={formik.errors.visit_details?.[index]?.visit_type}
                  important
                />

                {visit.visit_type !== "Purchase" && (
                  <>
                    <DropDown
                      label="Present Complaint"
                      options={complaintOptions}
                      value={visit.present_complaint}
                      onChange={(n, v) =>
                        formik.setFieldValue(
                          `visit_details.${index}.present_complaint`,
                          v,
                        )
                      }
                      important
                      className="mt-3"
                    />

                    <DropDown
                      label="Assigned To"
                      options={doctorOption}
                      value={visit.seen_by}
                      onChange={(n, v) =>
                        formik.setFieldValue(
                          `visit_details.${index}.seen_by`,
                          v,
                        )
                      }
                      important
                      className="mt-3"
                    />
                    <TextArea
                      name={`visit_details.${index}.notes`}
                      value={visit.notes}
                      onChange={(e) =>
                        formik.setFieldValue(
                          `visit_details.${index}.notes`,
                          e.target.value,
                        )
                      }
                      className="w-full border rounded p-2 mt-2"
                    />

                    {/* Tests Required */}
                    {visit.visit_type !== "Speech_therapy" && (
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
                              checked={visit.test_requested.includes(
                                test.value,
                              )}
                              onChange={(e) => {
                                const value = e.target.value;
                                const updated = visit.test_requested.includes(
                                  value,
                                )
                                  ? visit.test_requested.filter(
                                      (t) => t !== value,
                                    )
                                  : [...visit.test_requested, value];

                                formik.setFieldValue(
                                  `visit_details.${index}.test_requested`,
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
                        step="0.01"
                        placeholder="Enter Amount - 120.00"
                        value={visit.cost_taken_amount}
                        onChange={(e) => {
                          const value = e.target.value;
                          formik.setFieldValue(
                            `visit_details.${index}.cost_taken_amount`,
                            value === "" ? "" : parseFloat(value),
                          );
                        }}
                      />

                      <Input
                        label="Mode of Payment"
                        name="mode_of_payment"
                        value={visit.mode_of_payment}
                        onChange={(e) => {
                          const value = e.target.value;
                          formik.setFieldValue(
                            `visit_details.${index}.mode_of_payment`,
                            value,
                          );
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Purchase Items Section */}
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
                                <Input
                                  label="Quantity"
                                  name={`quantity_${itemIndex}`}
                                  type="number"
                                  min="1"
                                  value={item.quantity || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "") {
                                      updatePurchaseItem(
                                        index,
                                        itemIndex,
                                        "quantity",
                                        "",
                                      );
                                    } else {
                                      const num = parseInt(val);
                                      if (!isNaN(num) && num >= 1) {
                                        updatePurchaseItem(
                                          index,
                                          itemIndex,
                                          "quantity",
                                          num,
                                        );
                                      }
                                    }
                                  }}
                                />
                              )}
                              {console.log("Item Stock Type:", item.stock_type)}
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
                                                  [
                                                    ...currentSerials,
                                                    serial.value,
                                                  ],
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
                              onClick={() =>
                                removePurchaseItem(index, itemIndex)
                              }
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

            <Button
              type="button"
              variant="outline"
              onClick={handleAddMoreVisit}
            >
              + Add More Visit
            </Button>
            {Object.keys(formik.errors).length > 0 && (
              <p className="text-red-500 text-sm mb-2 font-medium">
                Please fill all required fields correctly.
              </p>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Register Patient</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
