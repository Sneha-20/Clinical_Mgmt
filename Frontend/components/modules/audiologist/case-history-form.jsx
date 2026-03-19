"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ArrowRight } from "lucide-react";
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
import CaseHistoryStepper from "@/components/ui/CaseHistoryStepper";
import TrialGivenForm from "./TrialGivenForm";
import { getTestTypes } from "@/lib/services/dashboard";
import { current } from "@reduxjs/toolkit";

export default function CaseHistoryForm({ patientId }) {
  const router = useRouter();

  const {
    patientsCaseHistory,
    trialDeviceList,
    searchTerm,
    modalList,
    setSelectedModal,
    setSearchTerm,
    fetchPatientFormData,
    registerCasehistory,
    registerTrialForm,
    registerReports,
  } = useCaseHistory();

  const [testTypes, setTestTypes] = useState([]);
  const [loadingTestTypes, setLoadingTestTypes] = useState(false);
  const [currentStep, setCurrentStep] = useState(null); // null until initialized
  const [reports, setReports] = useState([
    { report_type: "", report_description: "" },
  ]);
  const [isEditTestMode, setIsEditTestMode] = useState(false);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [tempSelectedTests, setTempSelectedTests] = useState([]);

  const modalOptions = modalList?.map((modal) => ({
    label: modal.name,
    value: modal.id,
  }));

  const goToDashboard = () => {
    router.push("/dashboard/home");
  };

  // Get test label by value
  const getTestLabel = (value) => {
    return (
      testRequestedOptions.find((test) => test.value === value)?.label || value
    );
  };

  // Get available tests (not already selected)
  const getAvailableTests = () => {
    return testRequestedOptions.filter(
      (test) => !formik.values.test_requested.includes(test.value),
    );
  };

  // Handle Edit Tests
  const handleEditTests = () => {
    setTempSelectedTests([...formik.values.test_requested]);
    setIsEditTestMode(true);
  };

  // Handle Save after editing
  const handleSaveEditedTests = () => {
    formik.setFieldValue("test_requested", tempSelectedTests);
    setIsEditTestMode(false);
  };

  // Handle Cancel edit
  const handleCancelEdit = () => {
    setIsEditTestMode(false);
    setTempSelectedTests([]);
  };

  // Handle Add Test Modal
  const handleOpenAddTestModal = () => {
    setShowAddTestModal(true);
  };

  // Handle Add Tests from Modal
  const handleAddTests = () => {
    const newTests = [...formik.values.test_requested, ...tempSelectedTests];
    formik.setFieldValue("test_requested", newTests);
    setShowAddTestModal(false);
    setTempSelectedTests([]);
  };

  // Handle Cancel Add Test Modal
  const handleCancelAddTestModal = () => {
    setShowAddTestModal(false);
    setTempSelectedTests([]);
  };

  // Handle removing test during edit
  const handleRemoveTest = (testValue) => {
    setTempSelectedTests((prev) => prev.filter((t) => t !== testValue));
  };

  // Handle adding test from available list
  const handleSelectAvailableTest = (testValue) => {
    const isSelected = tempSelectedTests.includes(testValue);
    if (isSelected) {
      setTempSelectedTests((prev) => prev.filter((t) => t !== testValue));
    } else {
      setTempSelectedTests((prev) => [...prev, testValue]);
    }
  };

  // advance to next step - only controlled by backend response
  const handleNextStep = () => {
    setCurrentStep((prev) => (typeof prev === "number" ? prev + 1 : prev));
  };

  // keep local step in sync when backend data arrives
  useEffect(() => {

    console.log(patientsCaseHistory, "patientsCaseHistory")
    if (
      patientsCaseHistory &&
      typeof patientsCaseHistory.step_process !== "undefined"
    ) {
      setCurrentStep(patientsCaseHistory.step_process);
    }
  }, [patientsCaseHistory]);

  useEffect(() => {
    if (patientId) {
      fetchPatientFormData(patientId);
    }
  }, [patientId, fetchPatientFormData]);

  // if we fetched existing case history and it contains reports, set them
  useEffect(() => {
    if (patientsCaseHistory?.reports && patientsCaseHistory.reports.length) {
      setReports(
        patientsCaseHistory.reports.map((r) => ({
          report_type: r.report_type || "",
          report_description: r.report_description || "",
        })),
      );
    }
  }, [patientsCaseHistory]);

  const fetchTestTypesForVisit = async (visitId) => {
    try {
      setLoadingTestTypes(true);
      const response = await getTestTypes(visitId);
      if (response?.status === 200 && response?.data) {
        const dropdownOptions = response.data.map((testType) => ({
          label: testType,
          value: testType,
        }));
        setTestTypes(dropdownOptions);
      }
    } catch (error) {
      console.error("Error fetching test types:", error);
    } finally {
      setLoadingTestTypes(false);
    }
  };

  // handlers for dynamic report fields
  const handleReportChange = (index, field, value) => {
    setReports((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const canAddMore = () => {
    const last = reports[reports.length - 1];
    return last.report_type && last.report_description;
  };

  const addMoreReport = () => {
    if (canAddMore()) {
      setReports((prev) => [
        ...prev,
        { report_type: "", report_description: "" },
      ]);
    }
  };

  const removeReport = (idx) => {
    setReports((prev) => prev.filter((_, i) => i !== idx));
  };

  const submitReports = async () => {
    if (reports.some((r) => !r.report_type || !r.report_description)) {
      alert("Please fill all report fields before submitting.");
      return;
    }
    try {
      const res = await registerReports({
        patient_visit: patientId,
        reports,
      });
      setReports([{ report_type: "", report_description: "" }]);
      // prefer backend-controlled step from response; fallback to refetch
      if (res && typeof res.step_process !== "undefined") {
        setCurrentStep(res.step_process);
      } else {
        fetchPatientFormData(patientId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      medical_history: patientsCaseHistory?.case_history?.medical_history || "",
      family_history: patientsCaseHistory?.case_history?.family_history || "",
      noise_exposure: patientsCaseHistory?.case_history?.noise_exposure || "",
      previous_ha_experience:
        patientsCaseHistory?.case_history?.previous_ha_experience || "no",
      red_flags: patientsCaseHistory?.case_history?.red_flags || "",
      test_requested: patientsCaseHistory?.test_requested || [],
      report_description: patientsCaseHistory?.report_description || "",
      hearing_symptoms: patientsCaseHistory?.case_history?.hearing_symptoms || [],
      other_symptoms: patientsCaseHistory?.case_history?.other_symptoms || "",
    },
    validationSchema: CaseHistorySchema,
    onSubmit: async (values) => {
      const payload = {
        ...values,
        patientId,
        visit: patientsCaseHistory?.visit_id,
      };

      if (!payload.hearing_symptoms.includes("others")) {
        payload.other_symptoms = "";
      }

      const res = await registerCasehistory(payload);
      fetchTestTypesForVisit(patientId);
      setCurrentStep(res.step_process);
    },
  });

  return (
    <Card className="w-full my-4">
      <CardHeader>
        <CardTitle>{patientsCaseHistory?.patient_name}</CardTitle>
      </CardHeader>
      <CaseHistoryStepper currentStep={currentStep} />
      <CardContent>
        {/* Show loader while initializing step */}
        {currentStep === null && (
          <div className="flex items-center justify-center py-8">
            <p className="text-slate-500">Loading case history...</p>
          </div>
        )}

        {/* Patient Visit Details Block */}
        {patientsCaseHistory && Object.keys(patientsCaseHistory).length > 0 && currentStep !== null && (
          <div className="bg-indigo-50/40 border border-indigo-100 rounded-lg p-3 sm:p-4 mb-4 shadow-sm">
            <h3 className="font-bold text-indigo-900 mb-2.5 pb-2 border-b border-indigo-100/60 uppercase tracking-wider text-[11px]">
              Initial Visit Record
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
              <div>
                <p className="text-indigo-400 font-semibold text-[9px] uppercase tracking-widest mb-0.5">Patient Name</p>
                <p className="font-semibold text-slate-800 text-xs sm:text-sm">{patientsCaseHistory?.patient_name || "-"}</p>
              </div>
              <div>
                <p className="text-indigo-400 font-semibold text-[9px] uppercase tracking-widest mb-0.5">Visit Type</p>
                <p className="font-semibold text-slate-800 text-xs sm:text-sm">{patientsCaseHistory?.visit_type || "-"}</p>
              </div>
              <div>
                <p className="text-indigo-400 font-semibold text-[9px] uppercase tracking-widest mb-0.5">Present Complaint</p>
                <p className="font-semibold text-slate-800 text-xs sm:text-sm">{patientsCaseHistory?.present_complaint || "-"}</p>
              </div>
              {/* <div>
                <p className="text-indigo-400 font-semibold text-[9px] uppercase tracking-widest mb-0.5">Appointment Date</p>
                <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                  {patientsCaseHistory?.appointment_date
                    ? new Date(patientsCaseHistory.appointment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : "-"}
                </p>
              </div> */}

              {patientsCaseHistory?.duration_of_problem && (
                <div>
                  <p className="text-indigo-400 font-semibold text-[9px] uppercase tracking-widest mb-0.5">Duration</p>
                  <p className="font-semibold text-slate-800 text-xs sm:text-sm">{patientsCaseHistory.duration_of_problem}</p>
                </div>
              )}
              {patientsCaseHistory?.ear_side && (
                <div>
                  <p className="text-indigo-400 font-semibold text-[9px] uppercase tracking-widest mb-0.5">Ear Side</p>
                  <p className="font-semibold text-slate-800 capitalize text-xs sm:text-sm">{patientsCaseHistory.ear_side}</p>
                </div>
              )}
              {patientsCaseHistory?.previous_test_done !== undefined && patientsCaseHistory?.previous_test_done !== null && (
                <div>
                  <p className="text-indigo-400 font-semibold text-[9px] uppercase tracking-widest mb-0.5">Previous Test</p>
                  <p className="font-semibold text-slate-800 text-xs sm:text-sm">{patientsCaseHistory.previous_test_done ? "Yes, Done" : "Not Done"}</p>
                </div>
              )}

              {(patientsCaseHistory?.notes) && (
                <div className="sm:col-span-2 md:col-span-3 mt-0.5 pt-2.5 border-t border-indigo-100/60">
                  <p className="text-indigo-400 font-semibold text-[9px] uppercase tracking-widest mb-0.5">Clinical Notes</p>
                  <p className="font-medium text-slate-700 text-xs sm:text-sm leading-snug">
                    {patientsCaseHistory.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- STEP 1 ---------------- */}
        {currentStep === 1 && (
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {formik.submitCount > 0 &&
              Object.keys(formik.errors).length > 0 && (
                <p className="text-red-500">
                  Please complete all required fields.
                </p>
              )}

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

            <DropDown
              label="Experience"
              name="previous_ha_experience"
              options={previousHearingAidsOptions}
              value={formik.values.previous_ha_experience}
              onChange={(n, v) =>
                formik.setFieldValue("previous_ha_experience", v)
              }
              onBlur={formik.handleBlur}
              error={
                formik.touched.previous_ha_experience &&
                formik.errors.previous_ha_experience
              }
            />

            <TextArea label="Red Flags" name="red_flags" formik={formik} />

            {/* Hearing Problem Symptoms */}
            <div className="border rounded-lg p-4 bg-slate-50">
              <h3 className="font-semibold text-lg mb-4">Hearing Problem Symptoms</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "Aural fullness", value: "aural_fullness" },
                  { label: "Aural discharge", value: "aural_discharge" },
                  { label: "Aural Pain / otalgia", value: "aural_pain" },
                  { label: "Tinnitus", value: "tinnitus" },
                  { label: "Decreased hearing", value: "decreased_hearing" },
                  { label: "Mental fatigue", value: "mental_fatigue" },
                  { label: "Vertigo", value: "vertigo" },
                  { label: "Others", value: "others" },
                ].map((symptom) => (
                  <CommonCheckbox
                    key={symptom.value}
                    label={symptom.label}
                    checked={formik.values.hearing_symptoms?.includes(symptom.value)}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      const currentSymptoms = formik.values.hearing_symptoms || [];
                      let newSymptoms;
                      if (isChecked) {
                        newSymptoms = [...currentSymptoms, symptom.value];
                      } else {
                        newSymptoms = currentSymptoms.filter((s) => s !== symptom.value);
                      }
                      formik.setFieldValue("hearing_symptoms", newSymptoms);
                    }}
                  />
                ))}
              </div>
              {formik.values.hearing_symptoms?.includes("others") && (
                <div className="mt-4">
                  <TextArea
                    label="Other Symptoms"
                    name="other_symptoms"
                    formik={formik}
                  />
                </div>
              )}
            </div>

            {/* Test Requested Section */}
            <div className="border rounded-lg p-4 bg-slate-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Tests Requested</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleEditTests}
                    className="text-sm"
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpenAddTestModal}
                    className="text-sm"
                  >
                    Add Test
                  </Button>
                </div>
              </div>

              {/* Display Current Selected Tests */}
              {!isEditTestMode && (
                <div className="space-y-2">
                  {formik.values.test_requested.length === 0 ? (
                    <p className="text-slate-500 italic">
                      No tests requested yet
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {formik.values.test_requested.map((testValue) => (
                        <div
                          key={testValue}
                          className="bg-white border border-slate-200 rounded px-3 py-2 flex items-center justify-between"
                        >
                          <span className="text-sm font-medium">
                            {getTestLabel(testValue)}
                          </span>
                          <span className="text-green-600">✓</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Edit Mode - Show selected tests with uncheck option */}
              {isEditTestMode && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Select tests to remove:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded border">
                    {formik.values.test_requested.length === 0 ? (
                      <p className="text-slate-500 italic">
                        No tests to manage
                      </p>
                    ) : tempSelectedTests.length > 0 ? (
                      tempSelectedTests.map((testValue) => (
                        <div
                          key={testValue}
                          className="flex items-center gap-2 p-2 bg-slate-100 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={true}
                            onChange={(e) => handleRemoveTest(testValue)}
                            className="w-4 h-4 text-blue-600 cursor-pointer"
                          />
                          <label className="text-sm font-medium cursor-pointer flex-1">
                            {getTestLabel(testValue)}
                          </label>
                        </div>
                      ))
                    ) : (
                      formik.values.test_requested.map((testValue) => (
                        <div
                          key={testValue}
                          className="flex items-center gap-2 p-2 bg-slate-100 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={true}
                            onChange={(e) => handleRemoveTest(testValue)}
                            className="w-4 h-4 text-blue-600 cursor-pointer"
                          />
                          <label className="text-sm font-medium cursor-pointer flex-1">
                            {getTestLabel(testValue)}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSaveEditedTests}
                      className="text-sm"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Add Test Modal */}
            {showAddTestModal && (
              <div className="border rounded-lg p-4 bg-blue-50 space-y-3">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-base">Add New Tests</h4>
                  <button
                    type="button"
                    onClick={handleCancelAddTestModal}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-sm text-slate-600">Select tests to add:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded border">
                  {getAvailableTests().length === 0 ? (
                    <p className="text-slate-500 italic col-span-2">
                      All tests are already selected
                    </p>
                  ) : (
                    getAvailableTests().map((test) => (
                      <div
                        key={test.value}
                        className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={tempSelectedTests.includes(test.value)}
                          onChange={(e) =>
                            handleSelectAvailableTest(test.value)
                          }
                          className="w-4 h-4 text-green-600 cursor-pointer"
                        />
                        <label className="text-sm font-medium cursor-pointer flex-1">
                          {test.label}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelAddTestModal}
                    className="text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddTests}
                    disabled={tempSelectedTests.length === 0}
                    className="text-sm"
                  >
                    Add Selected Tests
                  </Button>
                </div>
              </div>
            )}

            <Button type="submit">Save & Continue</Button>
          </form>
        )}

        {/* ---------------- STEP 2 ---------------- */}
        {currentStep === 2 && (
          <div>
            {reports.map((rep, idx) => (
              <div
                key={idx}
                className="relative grid grid-cols-1 gap-6 items-end"
              >
                <DropDown
                  label="Test Type"
                  options={testTypes}
                  value={rep.report_type}
                  disabled={loadingTestTypes}
                  placeholder={
                    loadingTestTypes
                      ? "Loading test types..."
                      : "Select test type"
                  }
                  onChange={(n, v) => handleReportChange(idx, "report_type", v)}
                />
                <TextArea
                  label="Description"
                  value={rep.report_description}
                  onChange={(e) =>
                    handleReportChange(
                      idx,
                      "report_description",
                      e.target.value,
                    )
                  }
                />
                {reports.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReport(idx)}
                    className="text-red-500 p-2 absolute right-[130px] bottom-[-38px] underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <div>
              <Button
                variant="link"
                className="w-full justify-end"
                onClick={addMoreReport}
                disabled={!canAddMore()}
              >
                Add more reports
              </Button>
            </div>

            <div className="flex gap-3">
              <Button onClick={submitReports}>
                Submit Report <ArrowRight className="ml-1 h-4 w-4" />
              </Button>

              <Button variant="secondary" onClick={goToDashboard}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* ---------------- STEP 3 ---------------- */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <TrialGivenForm
              visitId={patientId}
              setSelectedModal={setSelectedModal}
              registerTrialForm={registerTrialForm}
              trialDeviceList={trialDeviceList}
              setSearchTerm={setSearchTerm}
              searchTerm={searchTerm}
              modalOptions={modalOptions}
              onSubmitSuccess={handleNextStep}
              goToDashboard={goToDashboard}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
