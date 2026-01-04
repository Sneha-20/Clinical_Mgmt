"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Upload, MessageSquare, Stethoscope, User } from "lucide-react";
import useCaseHistory from "@/lib/hooks/useCaseHistory";
import { useFormik } from "formik";
import { CaseHistorySchema } from "@/lib/utils/schema";
import TextArea from "@/components/ui/TextArea";
import DropDown from "@/components/ui/dropdown";
import {
  previousHearingAidsOptions,
  testRequestedOptions,
} from "@/lib/utils/constants/staticValue";
import CommonCheckbox from "@/components/ui/CommonCheckbox";
import Modal from "@/components/ui/Modal";

export default function CaseHistoryForm({ patientId }) {
  const {
    patientsCaseHistory,
    fileName,
    file,
    testType,
    isModalOpen,
    setIsModalOpen,
    setTestType,
    setFile,
    setFileName,
    fetchPatientFormData,
    registerCasehistory,
    handleFileSubmit,
  } = useCaseHistory();
  // const parseTests = (testString = "") =>
  // testString
  //   .split(",")
  //   .map((t) => t.trim())
  //   .filter(Boolean);

  useEffect(() => {
    if (patientId) {
      fetchPatientFormData(patientId);
    }
  }, [patientId]);

  const formik = useFormik({
    enableReinitialize: true, // ⭐ IMPORTANT
    initialValues: {
      medical_history: patientsCaseHistory?.case_history?.medical_history || "",
      family_history: patientsCaseHistory?.case_history?.family_history || "",
      noise_exposure: patientsCaseHistory?.case_history?.noise_exposure || "",
      previous_ha_experience:
        patientsCaseHistory?.case_history?.previous_ha_experience || "no",
      red_flags: patientsCaseHistory?.case_history?.red_flags || "",
      test_requested: patientsCaseHistory?.test_requested || [],
      srtValue: "",
      sdsValue: "",
      uclValue: "",
    },
    validationSchema: CaseHistorySchema,
    onSubmit: (values) => {
      console.log("submit value", values);
      registerCasehistory({
        ...values,
        uploads,
        patientId,
        visit: patientsCaseHistory?.visit_id,
      });
    },
  });

  const [uploads, setUploads] = useState({
    audiogram: null,
    tympResult: null,
    beraFile: null,
  });

  // const toggleTest = (test) => {
  //   setFormData({
  //     ...formData,
  //     testsPerformed: formData.testsPerformed.includes(test)
  //       ? formData.testsPerformed.filter((t) => t !== test)
  //       : [...formData.testsPerformed, test],
  //   });
  // };

  // const handleFileUpload = (field, file) => {
  //   setUploads({ ...uploads, [field]: file });
  // };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   onSubmit({ ...formData, uploads });
  // };
  useEffect(() => {
    console.log("Formik errors:", formik.errors);
  }, [formik.errors]);

  return (
    <div>
      <Card className="w-full my-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 bg-card">
          <CardTitle className="text-lg sm:text-xl">
            {patientsCaseHistory?.patient_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">
                  Patient Name
                </span>
                <p className="text-base font-semibold text-foreground">
                  {patientsCaseHistory?.patient_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">
                  Visit Type
                </span>
                <p className="text-base font-semibold text-foreground">
                  {patientsCaseHistory?.visit_type}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">
                  Present Complaint
                </span>
                <p className="text-base font-semibold text-foreground">
                  {patientsCaseHistory?.present_complaint}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardContent className="p-3 sm:p-6">
          <form
            onSubmit={formik.handleSubmit}
            className="space-y-4 sm:space-y-6"
          >
            {/* <div>
              <h3 className="font-semibold text-primary mb-4 text-sm sm:text-base">Audiological History</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Symptoms & Complaints</label>
                  <textarea
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    placeholder="Describe hearing symptoms..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5">Onset (When started?)</label>
                    <Input
                      value={formData.onset}
                      onChange={(e) => setFormData({ ...formData, onset: e.target.value })}
                      placeholder="e.g., 2 years ago"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5">Duration</label>
                    <Input
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., Gradual / Sudden"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div> */}

            {/* Medical History */}
            <div>
              <h3 className="font-semibold text-primary mb-4 text-sm sm:text-base">
                Medical & Family History
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <TextArea
                  label="Medical History"
                  name="medical_history"
                  formik={formik}
                />
                <TextArea
                  label="Family History"
                  name="family_history"
                  formik={formik}
                />
                <TextArea
                  label="Noise Exposure"
                  name="noise_exposure"
                  formik={formik}
                />
              </div>
            </div>

            {/* Previous Experience & Red Flags */}
            <div>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <DropDown
                    label="Experience & Red Flags"
                    options={previousHearingAidsOptions}
                    value={formik.values.previous_ha_experience}
                    onChange={(n, v) =>
                      formik.setFieldValue("previous_ha_experience", v)
                    }
                  />
                </div>
                <div>
                  <TextArea
                    label="Red Flags"
                    name="red_flags"
                    formik={formik}
                  />
                </div>
              </div>
            </div>

            {/* Tests Performed */}
            <div>
              <h3 className="font-semibold text-primary mb-4 text-sm sm:text-base">
                Tests Performed
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {testRequestedOptions.map((test) => (
                  <CommonCheckbox
                    key={test.value}
                    label={test.label}
                    value={test.value}
                    checked={formik.values.test_requested.includes(test.value)}
                    onChange={(e) => {
                      const value = e.target.value;

                      const updated = formik.values.test_requested.includes(
                        value
                      )
                        ? formik.values.test_requested.filter(
                            (t) => t !== value
                          )
                        : [...formik.values.test_requested, value];

                      formik.setFieldValue("test_requested", updated);
                    }}
                  />
                ))}
              </div>

              {/* Test Values */}
              {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Input
                  label="SRT (dB)"
                  name="srtValue"
                  value={formik.values.srtValue}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.srtValue && formik.errors.srtValue}
                />
                <Input
                  label="SDS (%)"
                  name="sdsValue"
                  value={formik.values.sdsValue}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.sdsValue && formik.errors.sdsValue}
                />
                <Input
                  label="UCL (dB)"
                  name="uclValue"
                  value={formik.values.uclValue}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.uclValue && formik.errors.uclValue}
                />
              </div> */}
            </div>

            <button
              type="button"
              className="text-blue-700 underline hover:no-underline pb-[2px]"
              onClick={() => setIsModalOpen(true)}
            >
              Upload Test Report
            </button>

            {/* Submit */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-4 border-t border-border">
              <Button type="submit" className="w-full sm:w-auto gap-2">
                Save Case History
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Modal
        header="Upload Test Results"
        onClose={() => setIsModalOpen(false)}
        isModalOpen={isModalOpen}
        onSubmit={handleFileSubmit}
      >
        <>
          <DropDown
            label="Select Test Type"
            name="testType" // 👈 IMPORTANT
            options={testRequestedOptions}
            value={testType}
            onChange={(name, value) => {
              if (name === "testType") setTestType(value);
            }}
          />
          <FileUploadField
            fileName={fileName}
            setFileName={setFileName}
            label="Select Test Report"
            onFileChange={(file) => setFile(file)}
          />
        </>
      </Modal>
    </div>
  );
}

function FileUploadField({ fileName, setFileName, label, onFileChange }) {
  return (
    <div className="border-2 border-dashed border-border rounded-lg p-3 sm:p-4 text-center hover:bg-muted/50 cursor-pointer transition-colors">
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          onFileChange(file);
          setFileName(file?.name || null);
        }}
        className="hidden"
        id={`upload-${label}`}
      />
      <label
        htmlFor={`upload-${label}`}
        className="cursor-pointer flex flex-col items-center gap-2"
      >
        <Upload className="w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground" />
        <p className="text-xs sm:text-sm font-medium">{label}</p>
        {fileName && <p className="text-xs text-accent">{fileName}</p>}
      </label>
    </div>
  );
}
