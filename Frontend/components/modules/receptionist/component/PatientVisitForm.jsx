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
  const [errors, setErrors] = useState({});
  const initialVisitDetails = {
    visit_type: "",
    present_complaint: "",
    seen_by: "",
    test_requested: [],
    notes: "",
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

  const serviceOption = [
    { label: "Clinic", value: "clinic" },
    { label: "Home", value: "home" },
  ];
   const doctors = doctorList.map((doctor) => ({
    label: doctor.name,
    value: doctor.id,
  }));
  const [formData, setFormData] = useState(getInitialFormState(showSelctedPatientId));
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
    try {
      await visitPatientSchema.validate(formData, { abortEarly: false });
      setErrors({});
      if (onSubmit) await onSubmit(formData);
      // Reset form to initial state after successful submit
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
    <Modal header="Patient Visit Form" isModalOpen={isModalOpen} onClose={onClose} showButton={false} ClassName="">
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
          selectedDate={formData.appointment_date ? new Date(formData.appointment_date) : null}
          onChange={(date) => updateField("appointment_date", format(date, "yyyy-MM-dd"))}
          minDate={new Date()}
          error={errors.appointment_date}
        />

        {/* ---------------- VISIT DETAILS (MULTIPLE) ---------------- */}
        {formData.visit_details.map((visit, index) => (
          <div key={index} className="border-t pt-4">
            <h3 className="font-semibold text-primary mb-3">
              Visit Details {index + 1}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DropDown
                label="Purpose of Visit"
                name="visit_type"
                options={visitTypeOptions}
                value={visit.visit_type}
                onChange={(n, v) => updateVisitDetails(index, "visit_type", v)}
                error={errors?.visit_details?.[index]?.visit_type}
              />
              <DropDown
                label="Assigned To"
                name="seen_by"
                options={doctors}
                value={visit.seen_by}
                onChange={(n, v) => updateVisitDetails(index, "seen_by", v)}
                error={errors?.visit_details?.[index]?.seen_by}
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
              className="mt-2"
            />

            <div className="mt-2">
              <label className="text-sm font-medium mb-1 block">Notes</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Notes about complaint"
                value={visit.notes}
                onChange={(e) => updateVisitDetails(index, "notes", e.target.value)}
                rows={3}
              />
            </div>

            {/* Tests Required */}
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
                        updateVisitDetails(index, "test_requested", updated);
                      }}
                    />
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
