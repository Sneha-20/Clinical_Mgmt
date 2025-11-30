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

export default function PatientRegistrationForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    dob: "",
    email: "",
    gender: "Female",

    phone_primary: "",
    phone_secondary: "",

    city: "",
    address: "",

    referral_type: "Self",
    referral_doctor: "",

    visit_details: {
      visit_type: "New Test",
      present_complaint: "",
      test_requested: [], // multiple checkbox values
      notes: "",
      appointment_date: "",
    },
  });

  const [errors, setErrors] = useState({});
  const referalTypeOptions = [
    { label: "Self", value: "Self" },
    { label: "Doctor", value: "doctor" },
    { label: "Advertisement", value: "advertisement" },
    { label: "Other", value: "other" },
  ];

  const updateField = useCallback(
    (name, value) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors]
  );

  const updateVisitDetails = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      visit_details: { ...prev.visit_details, [key]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting patient registration form");
    console.log("Form Data:", formData);
    try {
      await patientSchema.validate(formData, { abortEarly: false });
      setErrors({});
      if (onSubmit) onSubmit(formData);
      console.log("Patient Data:", formData);
    } catch (error) {
      console.log("Error during registration:", errors);
      console.log("ttt",extractYupErrors(error));
      if (error.name === "ValidationError") {
        setErrors(extractYupErrors(error)); // <— Your required pattern
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
            {/* PERSONAL INFO */}
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
                  error={errors.name}
                />

                <Input
                  label="Age"
                  type="number"
                  name="age"
                  onChange={(e) => updateField("age", e.target.value)}
                  value={formData.age}
                  placeholder="Age"
                  error={errors.age}
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={(e) => updateField("dob", e.target.value)}
                  error={errors.dob}
                  placeholder="Date of Birth"
                />

                <DropDown
                  label="Gender"
                  name="gender"
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
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="City name"
                  error={errors.city}
                />

                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Full address"
                  error={errors.address}
                />
              </div>
            </div>

            {/* REFERRAL */}
            <div>
              <h3 className="font-semibold text-primary mb-3">Referral</h3>

              {/* RADIO BUTTONS FOR REFERRAL TYPE */}
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
                {errors?.referral_type && <p className="text-red-500 text-sm mt-1">{errors.referral_type}</p>}
              </div>

              {/* SHOW DOCTOR NAME INPUT ONLY IF "Doctor" SELECTED */}
              {formData.referral_type === "doctor" && (
                <Input
                  label="Doctor Name"
                  name="referral_doctor"
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

            {/* VISIT DETAILS */}
            <div>
              <h3 className="font-semibold text-primary mb-3">Visit Details</h3>

              {/* Purpose of visit */}
              <DropDown
                label="Purpose of Visit"
                name="visit_type"
                options={visitTypeOptions}
                value={formData.visit_details.visit_type}
                onChange={(name, value) =>
                  updateVisitDetails("visit_type", value)
                }
                error={errors.visit_type}
              />

              {/* Present complaint */}
              <DropDown
                label="Present Complaint"
                name="present_complaint"
                options={complaintOptions}
                value={formData.visit_details.present_complaint}
                onChange={(n, v) => updateVisitDetails("present_complaint", v)}
                error={errors.present_complaint}
              />

              <textarea
                className="w-full border rounded p-2 mt-2"
                placeholder="Notes about complaint"
                value={formData.visit_details.notes}
                onChange={(e) => updateVisitDetails("notes", e.target.value)}
              />

              {/* Tests Required */}
              <div className="mt-4">
                <label className="font-medium text-sm text-gray-700">
                  Tests Required (Tick)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {testRequestedOptions.map((test, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        value={test.value}
                        checked={formData.visit_details.test_requested.includes(
                          test.value
                        )}
                        onChange={(e) => {
                          const value = e.target.value;
                          let updated = [
                            ...formData.visit_details.test_requested,
                          ];

                          if (updated.includes(value)) {
                            updated = updated.filter((t) => t !== value);
                          } else {
                            updated.push(value);
                          }

                          updateVisitDetails("test_requested", updated);
                        }}
                      />
                      {test.label}
                    </label>
                  ))}
                  {errors?.test_requested && <p className="text-red-500 text-sm mt-1">{errors.test_requested}</p>}
                </div>
              </div>

              {/* Appointment Date */}
              <div className="mt-4">
              <Input
                label="Appointment Date"
                type="date"
                value={formData.visit_details.appointment_date}
                onChange={(e) =>
                  updateVisitDetails("appointment_date", e.target.value)
                }
                error={errors.visit_details?.appointment_date}
                />
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3">
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
