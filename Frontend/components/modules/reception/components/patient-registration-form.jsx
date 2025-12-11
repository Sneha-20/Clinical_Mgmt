"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import DropDown from "@/components/ui/dropdown";
import { patientSchema } from "@/lib/utils/schema";

import {
  genderOptions,
  visitTypeOptions,
  testRequestedOptions,
  complaintOptions,
} from "@/lib/utils/constants/staticValue";
import { extractYupErrors } from "@/lib/utils/helper/extractError";
import { showToast } from "@/components/ui/toast";
import { startLoading } from "@/lib/redux/slice/uiSlice";
import CommonDatePicker from "@/components/ui/CommonDatePicker";
import CommonCheckbox from "@/components/ui/CommonCheckbox";
import CommonRadio from "@/components/ui/CommonRadio";

export default function PatientRegistrationForm({
  onClose,
  onSubmit,
  doctorList,
}) {
  console.log("doctorList", doctorList);
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
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
        seen_by: "reception",
        test_requested: [],
        notes: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});

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
  const doctors = doctorList.map((doctor) => ({
    label: doctor.name,
    value: doctor.id,
  }));
  const doctorOption = [
    { label: "Receptionist", value: "reception" },
    ...doctors,
  ];

  /* ----------------- Update Field ----------------- */
  const updateField = useCallback(
    (name, value) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors]
  );

  /* ----------------- Update Visit Details ----------------- */
  const updateVisitDetails = (index, key, value) => {
    const updatedVisit = [...formData.visit_details];
    updatedVisit[index] = { ...updatedVisit[index], [key]: value };
    setFormData((prev) => ({ ...prev, visit_details: updatedVisit }));
  };

  /* ----------------- Add More Visit ----------------- */
  const handleAddMoreVisit = () => {
    const lastVisit = formData.visit_details[formData.visit_details.length - 1];

    if (!lastVisit.visit_type || !lastVisit.present_complaint) {
      return showToast({
        type: "error",
        message:
          "Please fill in the current visit details before adding a new one.",
      });
    }

    setFormData((prev) => ({
      ...prev,
      visit_details: [
        ...prev.visit_details,
        {
          visit_type: "",
          present_complaint: "",
          assigned_to: "",
          test_requested: [],
          notes: "",
        },
      ],
    }));
  };

  /* ----------------- Submit Form ----------------- */
  const handleSubmit = async (e) => {
    console.log("formData",formData)
    e.preventDefault();
    try {
      await patientSchema.validate(formData, { abortEarly: false });
      setErrors({});

      // if (onSubmit) onSubmit(formData);
    } catch (error) {
      console.log("Validation errors:", extractYupErrors(error));
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-lg">New Patient Registration</CardTitle>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ---------------- PERSONAL INFO ---------------- */}
            <div>
              <h3 className="font-semibold text-primary mb-3">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Full name"
                  important
                  error={errors.name}
                />

                <Input
                  label="Age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  placeholder="Age"
                  important
                  error={errors.age}
                />

                <CommonDatePicker
                  label="Date of Birth"
                  className="coomon-datePicker"
                  selectedDate={formData.dob ? new Date(formData.dob) : null}
                  onChange={(date) =>
                    updateField("dob", date?.toISOString().split("T")[0])
                  }
                  placeholder="Select DOB"
                  error={errors.dob}
                />

                <DropDown
                  label="Gender"
                  name="gender"
                  important
                  options={genderOptions}
                  value={formData.gender}
                  onChange={updateField}
                  error={errors.gender}
                />

                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="Email"
                  error={errors.email}
                />

                <Input
                  label="Primary Phone"
                  name="phone_primary"
                  important
                  value={formData.phone_primary}
                  onChange={(e) => updateField("phone_primary", e.target.value)}
                  placeholder="9876543210"
                  error={errors.phone_primary}
                />

                <Input
                  label="Secondary Phone"
                  name="phone_secondary"
                  value={formData.phone_secondary}
                  onChange={(e) =>
                    updateField("phone_secondary", e.target.value)
                  }
                  placeholder="Optional"
                  error={errors.phone_secondary}
                />

                <Input
                  label="City"
                  name="city"
                  important
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="City name"
                  error={errors.city}
                />

                <Input
                  label="Address"
                  name="address"
                  important
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Full address"
                  error={errors.address}
                />
                <CommonDatePicker
                  label="Appointment Date"
                  className="coomon-datePicker"
                  selectedDate={
                    formData.appointment_date
                      ? new Date(formData.appointment_date)
                      : null
                  }
                  onChange={(date) =>
                    updateField(
                      "appointment_date",
                      date?.toISOString().split("T")[0]
                    )
                  }
                  placeholder="Select Appointment Date"
                  error={errors.appointment_date}
                />
              </div>
            </div>
            {/* REFERRAL */}
            {/* <div>
              <h3 className="font-semibold text-primary mb-3">Referral</h3>
              <div className="flex gap-6">
                {referalTypeOptions.map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="referral_type"
                      value={item.value}
                      checked={formData.referral_type === item.value}
                      onChange={(e) =>
                        updateField("referral_type", e.target.value)
                      }
                      className="w-4 h-4"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
                {errors?.referral_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.referral_type}
                  </p>
                )}
              </div>

             
              {formData.referral_type === "doctor" && (
                <Input
                  label="Doctor Name"
                  name="referral_doctor"
                  important
                  value={formData.referral_doctor}
                  onChange={(e) =>
                    updateField("referral_doctor", e.target.value)
                  }
                  placeholder="Enter doctor name"
                  className="mt-3"
                  error={errors.referral_doctor}
                />
              )}
            </div> */}
            <div>
              <h3 className="font-semibold text-primary mb-3">Referral</h3>

              <div className="flex gap-6">
                {referalTypeOptions.map((item) => (
                  <CommonRadio
                    key={item.value}
                    label={item.label}
                    value={item.value}
                    name="referral_type"
                    checked={formData.referral_type === item.value}
                    onChange={(e) =>
                      updateField("referral_type", e.target.value)
                    }
                  />
                ))}
              </div>

              {errors?.referral_type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.referral_type}
                </p>
              )}

              {formData.referral_type === "doctor" && (
                <Input
                  label="Doctor Name"
                  name="referral_doctor"
                  important
                  value={formData.referral_doctor}
                  onChange={(e) =>
                    updateField("referral_doctor", e.target.value)
                  }
                  placeholder="Enter doctor name"
                  className="mt-3"
                  error={errors.referral_doctor}
                />
              )}
            </div>

            <div>
              <h3 className="font-semibold text-primary mb-3">Service Type</h3>
              {/* RADIO BUTTONS FOR REFERRAL TYPE */}
              <div className="flex gap-6">
                {serviceOption.map((item) => (
                  // <label
                  //   key={item.value}
                  //   className="flex items-center gap-2 cursor-pointer"
                  // >
                  //   <input
                  //     type="radio"
                  //     name="service_type"
                  //     value={item.value}
                  //     checked={formData.service_type === item.value}
                  //     onChange={(e) =>
                  //       updateField("service_type", e.target.value)
                  //     }
                  //     className="w-4 h-4"
                  //   />
                  //   <span>{item.label}</span>
                  // </label>
                  <CommonRadio
                    key={item.value}
                    label={item.label}
                    value={item.value}
                    name="service_type"
                    checked={formData.service_type === item.value}
                    onChange={(e) =>
                      updateField("service_type", e.target.value)
                    }
                  />
                ))}
                {errors?.service_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.service_type}
                  </p>
                )}
              </div>
            </div>

            {/* ---------------- VISIT DETAILS (MULTIPLE) ---------------- */}
            {formData.visit_details.map((visit, index) => (
              <div key={index} className="border-t pt-4">
                <h3 className="font-semibold text-primary mb-3">
                  Visit Details {index + 1}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DropDown
                    label="Purpose of Visit"
                    important
                    name="visit_type"
                    options={visitTypeOptions}
                    value={visit.visit_type}
                    onChange={(n, v) =>
                      updateVisitDetails(index, "visit_type", v)
                    }
                    error={errors.visit_details?.[index]?.visit_type}
                  />
                  <DropDown
                    label="Present Complaint"
                    name="present_complaint"
                    options={complaintOptions}
                    value={visit.present_complaint}
                    onChange={(n, v) =>
                      updateVisitDetails(index, "present_complaint", v)
                    }
                  />
                </div>
                <DropDown
                  label="Assigned To"
                  name="seen_by"
                  options={doctorOption}
                  value={visit.seen_by}
                  onChange={(n, v) => updateVisitDetails(index, "seen_by", v)}
                />
                <textarea
                  className="w-full border rounded p-2 mt-2"
                  placeholder="Notes about complaint"
                  value={visit.notes}
                  onChange={(e) =>
                    updateVisitDetails(index, "notes", e.target.value)
                  }
                />

                {/* Tests Required */}
                <div className="mt-4">
                  <label className="font-medium text-sm text-gray-700">
                    Tests Required
                  </label>

                  {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {testRequestedOptions.map((test) => (
                      <label
                        key={test.value}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          value={test.value}
                          checked={visit.test_requested.includes(test.value)}
                          onChange={(e) => {
                            const value = e.target.value;

                            let updated = [...visit.test_requested];

                            if (updated.includes(value)) {
                              updated = updated.filter((t) => t !== value);
                            } else {
                              updated.push(value);
                            }

                            updateVisitDetails(
                              index,
                              "test_requested",
                              updated
                            );
                          }}
                          
                        />
                        {test.label}
                      </label>
                    ))}
                  </div> */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {testRequestedOptions.map((test) => (
                      <CommonCheckbox
                        key={test.value}
                        label={test.label}
                        value={test.value}
                        checked={visit.test_requested.includes(test.value)}
                        onChange={(e) => {
                          const value = e.target.value;
                          let updated = [...visit.test_requested];

                          if (updated.includes(value)) {
                            updated = updated.filter((t) => t !== value);
                          } else {
                            updated.push(value);
                          }

                          updateVisitDetails(index, "test_requested", updated);
                        }}
                      />
                    ))}
                  </div>
                </div>
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

            {/* ACTION BUTTONS */}
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
