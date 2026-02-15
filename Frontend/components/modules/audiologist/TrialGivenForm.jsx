"use client";

import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import TextArea from "@/components/ui/TextArea";
import DropDown from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { trialGivenSchema } from "@/lib/utils/schema";
import { useState } from "react";

// You can later move this to schema file
const earOptions = [
  { label: "Left", value: "Left" },
  { label: "Right", value: "Right" },
  { label: "Both", value: "Both" },
];

const receiverSizeOptions = [
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
];

const domeTypeOptions = [
  { label: "Open", value: "Open" },
  { label: "Closed", value: "Closed" },
  { label: "Power", value: "Power" },
];

export default function TrialGivenForm({
  visitId,
  onSubmitSuccess,
  trialDeviceList,
  searchTerm,
  setSearchTerm,
  registerTrialForm,
  goToDashboard
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const formik = useFormik({
    initialValues: {
      visit: visitId,
      serial_number: "",
      receiver_size: "",
      ear_fitted: "",
      dome_type: "",
      gain_settings: "",
      srt_before: "",
      sds_before: "",
      ucl_before: "",
      patient_response: "",
      counselling_notes: "",
      cost: "",
      trial_start_date: "",
      trial_end_date: "",
      discount_offered: "",
    },
    validationSchema: trialGivenSchema,
    onSubmit: async (values) => {
      await registerTrialForm(values);
      goToDashboard()
      onSubmitSuccess?.();
    },
  });


  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Device Info */}
      <div>
        <h3 className="font-semibold text-primary mb-3">Device Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Serial Number"
              name="serial_number"
              value={searchTerm}
              error={formik.errors.serial_number}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                formik.setFieldValue("serial_number", value);
                setShowDropdown(true);
              }}
            />

            {showDropdown && searchTerm.length > 0 && (
              <ul className="max-h-40 overflow-y-auto border border-slate-200 rounded-md mt-1">
                {trialDeviceList.length > 0 ? (
                  trialDeviceList.map((device) => (
                    <li
                      key={device}
                      className="px-3 py-2 cursor-pointer hover:bg-slate-100"
                      onClick={() => {
                        formik.setFieldValue("serial_number", device);
                        setSearchTerm(device);
                        setShowDropdown(false);
                      }}
                    >
                      {device}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-sm text-slate-500">
                    No serial numbers found
                  </li>
                )}
              </ul>
            )}
          </div>

          <DropDown
            label="Receiver Size"
            options={receiverSizeOptions}
            value={formik.values.receiver_size}
            onChange={(n, v) => formik.setFieldValue("receiver_size", v)}
            error={formik.errors.receiver_size}
          />

          <DropDown
            label="Ear Fitted"
            options={earOptions}
            value={formik.values.ear_fitted}
            onChange={(n, v) => formik.setFieldValue("ear_fitted", v)}
            error={formik.errors.ear_fitted}
          />

          <DropDown
            label="Dome Type"
            options={domeTypeOptions}
            value={formik.values.dome_type}
            onChange={(n, v) => formik.setFieldValue("dome_type", v)}
            error={formik.errors.dome_type}
          />
        </div>
      </div>

      {/* Audiology Values */}
      <div>
        <h3 className="font-semibold text-primary mb-3">
          Audiology Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="SRT Before"
            name="srt_before"
            value={formik.values.srt_before}
            onChange={formik.handleChange}
            error={formik.errors.srt_before}
          />

          <Input
            label="SDS Before"
            name="sds_before"
            value={formik.values.sds_before}
            onChange={formik.handleChange}
            error={formik.errors.sds_before}
          />

          <Input
            label="UCL Before"
            name="ucl_before"
            value={formik.values.ucl_before}
            onChange={formik.handleChange}
            error={formik.errors.ucl_before}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
        <TextArea label="Gain Settings" name="gain_settings" formik={formik} />

        <TextArea
          label="Patient Response"
          name="patient_response"
          formik={formik}
        />

        <TextArea
          label="Counselling Notes"
          name="counselling_notes"
          formik={formik}
        />
      </div>

      {/* Trial & Cost */}
      <div>
        <h3 className="font-semibold text-primary mb-3">Trial & Pricing</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            type="date"
            label="Trial Start Date"
            name="trial_start_date"
            value={formik.values.trial_start_date}
            onChange={formik.handleChange}
            error={formik.errors.trial_start_date}
          />

          <Input
            type="date"
            label="Trial End Date"
            name="trial_end_date"
            value={formik.values.trial_end_date}
            onChange={formik.handleChange}
            error={formik.errors.trial_end_date}
          />

          <Input
            label="Cost"
            name="cost"
            value={formik.values.cost}
            onChange={formik.handleChange}
            error={formik.errors.cost}
          />

          <Input
            label="Discount Offered (%)"
            name="discount_offered"
            value={formik.values.discount_offered}
            onChange={formik.handleChange}
            error={formik.errors.discount_offered}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit">Save Trial & Continue</Button>
      </div>
    </form>
  );
}
