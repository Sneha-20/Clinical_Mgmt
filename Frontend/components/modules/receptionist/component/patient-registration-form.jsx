"use client";

import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Trash2 } from "lucide-react";
import DropDown from "@/components/ui/dropdown";
import CommonDatePicker from "@/components/ui/CommonDatePicker";
import CommonCheckbox from "@/components/ui/CommonCheckbox";
import CommonRadio from "@/components/ui/CommonRadio";
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
import { patientSchema } from "@/lib/utils/schema";

export default function PatientRegistrationForm({
  onClose,
  onSubmit,
  doctorList,
}) {
  const {
    inventoryItems,
    loadingInventory,
    calculateAgeFromDob,
    fetchSerialsForItem,
  } = usePatientData();

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
      dob: "",
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
          cost_taken_amount: "",
          mode_of_payment: "",
          purchase_items: [],
        },
      ],
    },
    validationSchema: patientSchema,
    onSubmit: (values) => {
      const hasStockError = values.visit_details.some(visit => 
        visit.purchase_items?.some(item => item.stockError)
      );

      if (hasStockError) {
        return showToast({
          type: "error",
          message: "Insufficient stock for one or more purchase items.",
        });
      }

      const age = calculateAgeFromDob(values.dob);
      const filteredPayload = {
        ...values,
        age,
        visit_details: values.visit_details.map((visit) => {
          if (visit.visit_type === "Purchase") {
            return {
              visit_type: visit.visit_type,
              purchase_items: visit.purchase_items.map((item) => {
                // Destructure to remove helper UI fields before sending to API
                const { serials, stock_type, ...itemData } = item;
                if (stock_type === "Serialized") {
                  const { quantity, ...cleanItem } = itemData;
                  return cleanItem; // Send serial_numbers
                } else {
                  const { serial_numbers, ...cleanItem } = itemData;
                  return cleanItem; // Send quantity
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

  /* ---------------- VISIT MANAGEMENT ---------------- */

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
        cost_taken_amount: "",
        mode_of_payment: "",
        purchase_items: [],
      },
    ]);
  };

  /* ---------------- PURCHASE ITEM LOGIC ---------------- */

  const addPurchaseItem = (visitIndex) => {
    const updatedVisits = [...formik.values.visit_details];
    updatedVisits[visitIndex].purchase_items.push({
      inventory_item: "",
      quantity: 1,
      serial_numbers: [],
      stock_type: "",
      serials: [],
    });
    formik.setFieldValue("visit_details", updatedVisits);
  };

  const removePurchaseItem = (visitIndex, itemIndex) => {
    const updatedVisits = [...formik.values.visit_details];
    updatedVisits[visitIndex].purchase_items.splice(itemIndex, 1);
    formik.setFieldValue("visit_details", updatedVisits);
  };

  const updatePurchaseItem = async (visitIndex, itemIndex, key, value) => {
    const updatedVisits = [...formik.values.visit_details];
    const item = updatedVisits[visitIndex].purchase_items[itemIndex];

    if (key === "inventory_item") {
      const selectedItem = inventoryItems.find((i) => i.value === value);
      item.inventory_item = value;
      item.stock_type = selectedItem?.stock_type || "Non-Serialized";
      item.quantity_in_stock = selectedItem?.quantity_in_stock || 0;
      item.serial_numbers = [];
      item.quantity = 1;
      item.serials = [];
      item.stockError = false;

      if (item.stock_type === "Serialized") {
        const serials = await fetchSerialsForItem(value, true);
        item.serials = serials || [];
        // For serialized, the stock is count of available serials
        item.quantity_in_stock = serials.length;
      }
    } else if (key === "serial_numbers") {
      item.serial_numbers = value;
      item.quantity = value.length;
      item.stockError = value.length > (item.quantity_in_stock || 0);
    } else if (key === "quantity") {
      const qty = parseInt(value) || 0;
      item.quantity = qty;
      item.stockError = qty > (item.quantity_in_stock || 0);
    } else {
      item[key] = value;
    }

    formik.setFieldValue("visit_details", updatedVisits);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl">
        <CardHeader className="flex flex-row justify-between items-center border-b sticky top-0 bg-white z-10">
          <CardTitle className="text-lg font-bold">
            New Patient Registration
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="mt-4">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* PERSONAL INFO */}
            <section>
              <h3 className="font-semibold text-primary mb-3 border-l-4 border-primary pl-2">
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
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && formik.errors.email}
                />
                <CommonDatePicker
                  label="Date of Birth "
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
                  label="Primary Phone"
                  name="phone_primary"
                  maxLength={10}
                  value={formik.values.phone_primary}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.phone_primary && formik.errors.phone_primary
                  }
                  important
                />
                <Input
                  label="City"
                  name="city"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  error={formik.touched.city && formik.errors.city}
                  important
                />
                <Input
                  label="Address"
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
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
                  important
                />
              </div>
            </section>

            {/* REFERRAL & SERVICE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section>
                <h3 className="font-semibold text-primary mb-3">Referral</h3>
                <div className="flex flex-wrap gap-4">
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
                  <div className="mt-3">
                    <Input
                      label="Doctor Name"
                      name="referral_doctor"
                      value={formik.values.referral_doctor}
                      onChange={formik.handleChange}
                    />
                  </div>
                )}
              </section>

              <section>
                <h3 className="font-semibold text-primary mb-3">
                  Service Type
                </h3>
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
              </section>
            </div>

            {/* VISIT DETAILS */}
            {formik.values.visit_details.map((visit, index) => (
              <div key={index} className="border-t pt-6 mt-6">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  Visit Details
                </h3>

                <DropDown
                  label="Purpose of Visit"
                  options={newVisitTypeOptions}
                  value={visit.visit_type}
                  onChange={(n, v) =>
                    formik.setFieldValue(`visit_details.${index}.visit_type`, v)
                  }
                  important
                />

                {visit.visit_type === "Purchase" ? (
                  /* PURCHASE UI SECTION */
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Purchase Items
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPurchaseItem(index)}
                        className="h-8 gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Item
                      </Button>
                    </div>

                    {visit.purchase_items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="bg-white border rounded-md p-4 mb-3 relative shadow-sm"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removePurchaseItem(index, itemIndex)}
                          className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                          <DropDown
                            label="Inventory Item"
                            options={inventoryItems}
                            value={item.inventory_item}
                            loading={loadingInventory}
                            onChange={(n, v) =>
                              updatePurchaseItem(
                                index,
                                itemIndex,
                                "inventory_item",
                                v,
                              )
                            }
                            placeholder={
                              loadingInventory ? "Loading..." : "Select product"
                            }
                          />

                          {item.inventory_item && (
                            <div className="animate-in fade-in duration-300">
                              {item.stock_type === "Non-Serialized" ? (
                                <div className="flex flex-col">
                                  <Input
                                    label={`Quantity (In Stock: ${item.quantity_in_stock || 0})`}
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updatePurchaseItem(
                                        index,
                                        itemIndex,
                                        "quantity",
                                        e.target.value,
                                      )
                                    }
                                    className={item.stockError ? "border-red-500" : ""}
                                  />
                                  {item.stockError && (
                                    <p className="text-red-500 text-[10px] mt-1 font-medium">Insufficient stock</p>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-gray-500 uppercase">
                                    Serial Numbers
                                  </label>
                                  <div className="border rounded-md p-2 max-h-32 overflow-y-auto bg-gray-50">
                                    {item.serials?.length > 0 ? (
                                      item.serials.map((s) => (
                                        <div
                                          key={s.value}
                                          className="flex items-center gap-2 py-1"
                                        >
                                          <input
                                            type="checkbox"
                                            id={`ser-${index}-${itemIndex}-${s.value}`}
                                            checked={item.serial_numbers.includes(
                                              s.value,
                                            )}
                                            onChange={(e) => {
                                              const current =
                                                item.serial_numbers;
                                              const next = e.target.checked
                                                ? [...current, s.value]
                                                : current.filter(
                                                    (id) => id !== s.value,
                                                  );
                                              updatePurchaseItem(
                                                index,
                                                itemIndex,
                                                "serial_numbers",
                                                next,
                                              );
                                            }}
                                          />
                                          <label
                                            htmlFor={`ser-${index}-${itemIndex}-${s.value}`}
                                            className="text-sm cursor-pointer"
                                          >
                                            {s.label}
                                          </label>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-xs text-gray-400 italic">
                                        No available serials found
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* STANDARD VISIT UI SECTION */
                  <div className="space-y-4 mt-4">
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
                    />
                    <TextArea
                      label="Clinical Notes"
                      name={`visit_details.${index}.notes`}
                      value={visit.notes}
                      onChange={(e) =>
                        formik.setFieldValue(
                          `visit_details.${index}.notes`,
                          e.target.value,
                        )
                      }
                    />

                    {visit.visit_type !== "Speech_therapy" && (
                      <div className="p-3 bg-slate-50 rounded-md">
                        <label className="font-semibold text-sm text-gray-700 block mb-2">
                          Tests Required
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {testRequestedOptions.map((test) => (
                            <CommonCheckbox
                              key={test.value}
                              label={test.label}
                              value={test.value}
                              checked={visit.test_requested.includes(
                                test.value,
                              )}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = visit.test_requested.includes(
                                  val,
                                )
                                  ? visit.test_requested.filter(
                                      (t) => t !== val,
                                    )
                                  : [...visit.test_requested, val];
                                formik.setFieldValue(
                                  `visit_details.${index}.test_requested`,
                                  updated,
                                );
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Amount Taken"
                        type="number"
                        placeholder="0.00"
                        value={visit.cost_taken_amount}
                        onChange={(e) =>
                          formik.setFieldValue(
                            `visit_details.${index}.cost_taken_amount`,
                            e.target.value,
                          )
                        }
                      />
                      <Input
                        label="Mode of Payment"
                        placeholder="Cash/Online"
                        value={visit.mode_of_payment}
                        onChange={(e) =>
                          formik.setFieldValue(
                            `visit_details.${index}.mode_of_payment`,
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full py-6 border-dashed"
              onClick={handleAddMoreVisit}
            >
              <Plus className="mr-2 w-4 h-4" /> Add Another Visit
            </Button>

            {Object.keys(formik.errors).length > 0 && (
              <p className="text-red-500 text-sm font-medium animate-pulse text-center">
                Please review all required fields before submitting.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white pb-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="px-8">
                Register Patient
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
