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

  const formik = useFormik({
    initialValues: {
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
          seen_by: "",
          test_requested: [],
          notes: "",
        },
      ],
    },
    validationSchema: patientSchema,
    onSubmit: (values) => {
      onSubmit?.(values);
    },
  });

  /* ---------------- ADD MORE VISIT ---------------- */
  const handleAddMoreVisit = () => {
    const lastVisit =
      formik.values.visit_details[formik.values.visit_details.length - 1];

    if (!lastVisit.visit_type || !lastVisit.present_complaint) {
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
      },
    ]);
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
                />

                <Input
                  label="Age"
                  name="age"
                  type="number"
                  value={formik.values.age}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.age && formik.errors.age}
                />

                <CommonDatePicker
                  label="Date of Birth"
                  selectedDate={
                    formik.values.dob ? new Date(formik.values.dob) : null
                  }
                  onChange={(date) =>
                    formik.setFieldValue("dob", format(date, "yyyy-MM-dd"))
                  }
                  maxDate={new Date()} 
                  error={formik.touched.dob && formik.errors.dob}
                />

                <DropDown
                  label="Gender"
                  name="gender"
                  options={genderOptions}
                  value={formik.values.gender}
                  onChange={(n, v) => formik.setFieldValue("gender", v)}
                  error={formik.touched.gender && formik.errors.gender}
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
                  value={formik.values.phone_primary}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.phone_primary && formik.errors.phone_primary
                  }
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
                />

                <Input
                  label="Address"
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.address && formik.errors.address}
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
                      format(date, "yyyy-MM-dd")
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
                  options={visitTypeOptions}
                  value={visit.visit_type}
                  onChange={(n, v) =>
                    formik.setFieldValue(`visit_details.${index}.visit_type`, v)
                  }
                  error={formik.errors.visit_details?.[index]?.visit_type}
                />

                <DropDown
                  label="Present Complaint"
                  options={complaintOptions}
                  value={visit.present_complaint}
                  onChange={(n, v) =>
                    formik.setFieldValue(
                      `visit_details.${index}.present_complaint`,
                      v
                    )
                  }
                />

                <DropDown
                  label="Assigned To"
                  options={doctorOption}
                  value={visit.seen_by}
                  onChange={(n, v) =>
                    formik.setFieldValue(`visit_details.${index}.seen_by`, v)
                  }
                />
                

                <textarea
                  className="w-full border rounded p-2 mt-2"
                  value={visit.notes}
                  onChange={(e) =>
                    formik.setFieldValue(
                      `visit_details.${index}.notes`,
                      e.target.value
                    )
                  }
                />

                {/* Tests Required */}
                {visit.visit_type !== "TGA" && (
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

                            formik.setFieldValue(
                              `visit_details.${index}.test_requested`,
                              updated
                            );
                          }}
                        />
                      ))}
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
