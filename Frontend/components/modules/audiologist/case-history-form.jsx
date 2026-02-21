"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  X,
  Upload,
  FileText,
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
import Modal from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
import CaseHistoryStepper from "@/components/ui/CaseHistoryStepper";
import TrialGivenForm from "./TrialGivenForm";
import { getTestTypes } from "@/lib/services/dashboard";

const STEP_KEY = "caseHistoryStep";

export default function CaseHistoryForm({ patientId }) {
  const router = useRouter();
  const [testTypes, setTestTypes] = useState([]);
  const [loadingTestTypes, setLoadingTestTypes] = useState(false);
  const {
    patientsCaseHistory,
    fileName,
    testType,
    testFileList,
    trialDeviceList,
    searchTerm,
    modalList,
    setSelectedModal,
    setSearchTerm,
    handleDeleteReport,
    setTestType,
    setFile,
    setFileName,
    fetchPatientFormData,
    registerCasehistory,
    handleFileSubmit,
    registerTrialForm,
  } = useCaseHistory();

  const [deleteFileModal, setDeleteFileModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  /* ---------------- STEP PERSISTENCE ---------------- */

  useEffect(() => {
    const savedStep = localStorage.getItem(STEP_KEY);
    if (savedStep) {
      setCurrentStep(Number(savedStep));
    }
    return () => {
      localStorage.removeItem(STEP_KEY);
    };
  }, []);

  const modalOptions = modalList?.map((modal) => ({
    label: modal.name,
    value: modal.id,
  }));

  const handleNextStep = (step) => {
    setCurrentStep(step);
    localStorage.setItem(STEP_KEY, step);
  };

  const goToDashboard = () => {
    localStorage.removeItem(STEP_KEY);
    router.push("/dashboard/home");
  };

  useEffect(() => {
    if (patientId) {
      fetchPatientFormData(patientId);
      fetchTestTypesForVisit(patientId);
    }
  }, [patientId]);

  const fetchTestTypesForVisit = async (visitId) => {
    try {
      setLoadingTestTypes(true);
      const response = await getTestTypes(visitId);
      if (response?.status === 200 && response?.data) {
        // Convert API response to dropdown format
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
    },
    validationSchema: CaseHistorySchema,
    onSubmit: (values) => {
      registerCasehistory({
        ...values,
        patientId,
        visit: patientsCaseHistory?.visit_id,
      });
      handleNextStep(2);
    },
  });

  return (
    <Card className="w-full my-4">
      <CardHeader>
        <CardTitle>{patientsCaseHistory?.patient_name}</CardTitle>
      </CardHeader>
      <CaseHistoryStepper currentStep={currentStep} />
      <CardContent>
        {/* ---------------- STEP 1 ---------------- */}
        {currentStep === 1 && (
          <form onSubmit={formik.handleSubmit} className="space-y-4">
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
              options={previousHearingAidsOptions}
              value={formik.values.previous_ha_experience}
              onChange={(n, v) =>
                formik.setFieldValue("previous_ha_experience", v)
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
          <div className="space-y-4">
            <DropDown
              label="Select Test Type"
              name="testType"
              options={testTypes}
              value={testType}
              onChange={(n, v) => setTestType(v)}
              disabled={loadingTestTypes}
              placeholder={loadingTestTypes ? "Loading test types..." : "Select test type"}
            />

            <FileUploadField
              label="Select Test Report"
              fileName={fileName}
              setFileName={setFileName}
              onFileChange={(file) => setFile(file)}
            />

            <Button variant="link" onClick={handleFileSubmit}>
              <Upload className="h-4 w-4 mr-1" />
              Upload Report
            </Button>

            {testFileList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {testFileList.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 border p-2 rounded"
                  >
                    <FileText className="h-4 w-4" />
                    <a href={file.file_url} target="_blank">
                      {file.file_type}
                    </a>
                    <X
                      className="h-4 w-4 text-red-500 cursor-pointer"
                      onClick={() => {
                        setSelectedFileId(file.id);
                        setDeleteFileModal(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={() => handleNextStep(3)}>
                Add Trial <ArrowRight className="ml-1 h-4 w-4" />
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

      <Modal
        header="Delete test report"
        isModalOpen={deleteFileModal}
        onClose={() => setDeleteFileModal(false)}
        onSubmit={() => {
          handleDeleteReport(selectedFileId);
          setDeleteFileModal(false);
        }}
      >
        Are you sure?
      </Modal>
    </Card>
  );
}

/* ---------------- FILE UPLOAD ---------------- */

function FileUploadField({ fileName, setFileName, label, onFileChange }) {
  return (
    <label className="border-dashed border p-4 flex flex-col items-center cursor-pointer">
      <Upload />
      <span>{label}</span>
      {fileName && <span className="text-xs">{fileName}</span>}
      <input
        type="file"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          onFileChange(file);
          setFileName(file?.name || "");
        }}
      />
    </label>
  );
}
