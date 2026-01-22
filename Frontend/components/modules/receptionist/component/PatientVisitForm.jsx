import { Button } from "@/components/ui/button";
import DropDown from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/Modal";
import { extractYupErrors } from "@/lib/utils/helper/extractError";
import { visitPatientSchema } from "@/lib/utils/schema";
import { useCallback, useEffect, useState } from "react";
import {
  visitTypeOptions,
  testRequestedOptions,
  complaintOptions,
} from "@/lib/utils/constants/staticValue";
import { showToast } from "@/components/ui/toast";

export default function PatientVisitForm({
  onClose,
  onSubmit,
  showSelctedPatientId,
  doctorList,
  isModalOpen
}) {
  useEffect(() => {
  if (showSelctedPatientId) {
    setFormData((prev) => ({
      ...prev,
      patient: showSelctedPatientId,
    }));
  }
}, [showSelctedPatientId]);
  const serviceOption = [
    { label: "Clinic", value: "clinic" },
    { label: "Home", value: "home" },
  ];
   const doctors = doctorList.map((doctor) => ({
    label: doctor.name,
    value: doctor.id,
  }));
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    patient: showSelctedPatientId,
    service_type: "",
    appointment_date: "",
    visit_details: [
      {
        visit_type: "",
        present_complaint: "",
        seen_by: "",
        test_requested: [],
        notes: "",
      },
    ],
  });
  console.log("ttttttttt",formData)
  
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
          seen_by: "",
          test_requested: [],
          notes: "",
        },
      ],
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData);
    try {
      await visitPatientSchema.validate(formData, { abortEarly: false });
      setErrors({});

      if (onSubmit) onSubmit(formData);
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
    <Modal header="Patient Visit Form" isModalOpen={isModalOpen} onClose={onClose} className="">
      <form onSubmit={handleSubmit} className="space-y-6 relative">
        <div>
          <h3 className="font-semibold text-primary mb-3">Service Type</h3>
          {/* RADIO BUTTONS FOR REFERRAL TYPE */}
          <div className="flex gap-6">
            {serviceOption.map((item) => (
              <label
                key={item.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="service_type"
                  value={item.value}
                  checked={formData.service_type === item.value}
                  onChange={(e) => updateField(e.target.name, e.target.value)}
                  className="w-4 h-4"
                />
                <span>{item.label}</span>
              </label>
            ))}
            {errors?.service_type && (
              <p className="text-red-500 text-sm mt-1">{errors.service_type}</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Input
            label="Appointment Date"
            type="date"
            name="appointment_date"
            value={formData.appointment_date}
            onChange={(e) => updateField(e.target.name, e.target.value)}
            error={errors.appointment_date}
          />
        </div>

        {/* ---------------- VISIT DETAILS (MULTIPLE) ---------------- */}
        {formData.visit_details.map((visit, index) => (
          <div key={index} className="border-t pt-4">
            <h3 className="font-semibold text-primary mb-3">
              Visit Details {index + 1}
            </h3>

            <div>
              <DropDown
                label="Purpose of Visit"
                name="visit_type"
                options={visitTypeOptions}
                value={visit.visit_type}
                onChange={(n, v) => updateVisitDetails(index, "visit_type", v)}
                error={errors.visit_type}
              />
              <DropDown
                label="Assigned To"
                name="seen_by"
                options={doctors}
                value={visit.seen_by}
                onChange={(n, v) => updateVisitDetails(index, "seen_by", v)}
                error={errors.seen_by}
              />
            </div>

            <DropDown
              label="Present Complaint"
              name="present_complaint"
              options={complaintOptions}
              value={visit.present_complaint}
              onChange={(n, v) =>
                updateVisitDetails(index, "present_complaint", v)
              }
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
            {visit.visit_type !== "TGA" && (
              <>
                <div className="mt-4">
                  <label className="font-medium text-sm text-gray-700">
                    Tests Required (Tick)
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
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

                          updateVisitDetails(index, "test_requested", updated);
                        }}
                      />
                      {test.label}
                    </label>
                  ))}
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
        <Button type="submit" className="absolute bottom-[-60px] left-[85px]">Register Patient</Button>
      </form>
    </Modal>
  );
}
