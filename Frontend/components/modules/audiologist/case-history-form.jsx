"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  X,
  ArrowRight,
} from "lucide-react";
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
  const modalOptions = modalList?.map((modal) => ({
    label: modal.name,
    value: modal.id,
  }));

  const goToDashboard = () => {
    router.push("/dashboard/home");
  };

  // advance to next step - only controlled by backend response
  const handleNextStep = () => {
    setCurrentStep((prev) => (typeof prev === "number" ? prev + 1 : prev));
  };

  // keep local step in sync when backend data arrives
  useEffect(() => {
    if (patientsCaseHistory && typeof patientsCaseHistory.step_process !== "undefined") {
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
        }))
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
      console.error('Error fetching test types:', error);
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
      setReports((prev) => [...prev, { report_type: "", report_description: "" }]);
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
      report_description: patientsCaseHistory?.report_description || ""
    },
    validationSchema: CaseHistorySchema,
    onSubmit: async (values) => {
      const res = await registerCasehistory({
        ...values,
        patientId,
        visit: patientsCaseHistory?.visit_id,
      });
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

        {/* ---------------- STEP 1 ---------------- */}
        {currentStep === 1 && (
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {formik.submitCount > 0 && Object.keys(formik.errors).length > 0 && (
              <p className="text-red-500">Please complete all required fields.</p>
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
            <div className="grid grid-cols-2 gap-2">
              {testRequestedOptions.map((test) => (
                <CommonCheckbox
                  key={test.value}
                  label={test.label}
                  value={test.value}
                  checked={formik.values.test_requested.includes(test.value)}
                  onChange={(e) => {
                    const value = e.target.value;
                    const updated = formik.values.test_requested.includes(value)
                      ? formik.values.test_requested.filter((t) => t !== value)
                      : [...formik.values.test_requested, value];
                    formik.setFieldValue("test_requested", updated);
                  }}
                />
              ))}
            </div>
            <Button type="submit">Save & Continue</Button>
          </form>
        )}

        {/* ---------------- STEP 2 ---------------- */}
        {currentStep === 2 && (
          <div>
            {reports.map((rep, idx) => (
              <div key={idx} className="relative grid grid-cols-1 gap-6 items-end">
                <DropDown
                  label="Test Type"
                  options={testTypes}
                  value={rep.report_type}
                  disabled={loadingTestTypes}
                  placeholder={loadingTestTypes ? "Loading test types..." : "Select test type"}
                  onChange={(n, v) => handleReportChange(idx, "report_type", v)}
                />
                <TextArea
                  label="Description"
                  value={rep.report_description}
                  onChange={(e) => handleReportChange(idx, "report_description", e.target.value)}
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

