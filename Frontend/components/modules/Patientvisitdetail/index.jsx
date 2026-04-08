"use client";

import Backbutton from "@/components/ui/Backbutton";
import CommonBadge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import usePatientVisitdata from "@/lib/hooks/usePatientVisitData";
import {
  User,
  Phone,
  Mail,
  Stethoscope,
  Calendar,
  TestTube,
  ClipboardList,
  FileText,
  Download,
} from "lucide-react";

const RenderPTATable = ({ ptaData }) => {
  if (!ptaData || Object.keys(ptaData).length === 0) return null;
  const frequencies = ["250", "500", "1K", "2K", "4K", "8K"];
  return (
    <div className="overflow-x-auto mt-3 mb-2 border border-slate-200 rounded-md">
      <table className="w-full text-xs text-center border-collapse">
        <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-700">
          <tr>
            <th className="border-r border-slate-200 p-2 font-bold w-16">
              RT. EAR
            </th>
            <th className="border-r border-slate-200 p-2 w-12"></th>
            {frequencies.map((f) => (
              <th
                key={f}
                className="border-r border-slate-200 p-2 font-semibold"
              >
                {f}
              </th>
            ))}
            <th className="border-r border-slate-200 p-2 font-bold w-16">
              LT. EAR
            </th>
            <th className="border-r border-slate-200 p-2 w-12"></th>
            {frequencies.map((f) => (
              <th
                key={f}
                className="border-r border-slate-200 p-2 font-semibold"
              >
                {f}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200">
            <td className="border-r border-slate-200 bg-slate-50/50"></td>
            <td className="border-r border-slate-200 p-2 font-semibold bg-slate-50/50 text-slate-600">
              AC
            </td>
            {frequencies.map((f) => (
              <td
                key={f}
                className="border-r border-slate-200 p-2 font-medium text-blue-700"
              >
                {ptaData.right_ear?.AC?.[f] || "—"}
              </td>
            ))}
            <td className="border-r border-slate-200 bg-slate-50/50"></td>
            <td className="border-r border-slate-200 p-2 font-semibold bg-slate-50/50 text-slate-600">
              AC
            </td>
            {frequencies.map((f) => (
              <td
                key={f}
                className="border-r border-slate-200 p-2 font-medium text-blue-700"
              >
                {ptaData.left_ear?.AC?.[f] || "—"}
              </td>
            ))}
          </tr>
          <tr>
            <td className="border-r border-slate-200 bg-slate-50/50"></td>
            <td className="border-r border-slate-200 p-2 font-semibold bg-slate-50/50 text-slate-600">
              BC
            </td>
            {frequencies.map((f) => (
              <td
                key={f}
                className="border-r border-slate-200 p-2 font-medium text-blue-700"
              >
                {ptaData.right_ear?.BC?.[f] || "—"}
              </td>
            ))}
            <td className="border-r border-slate-200 bg-slate-50/50"></td>
            <td className="border-r border-slate-200 p-2 font-semibold bg-slate-50/50 text-slate-600">
              BC
            </td>
            {frequencies.map((f) => (
              <td
                key={f}
                className="border-r border-slate-200 p-2 font-medium text-blue-700"
              >
                {ptaData.left_ear?.BC?.[f] || "—"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const RenderImpedanceTable = ({ impData }) => {
  if (!impData || Object.keys(impData).length === 0) return null;
  const fields = ["volume", "pressure", "compliance", "gradient"];
  return (
    <div className="overflow-x-auto mt-3 mb-2 border border-slate-200 rounded-md">
      <table className="w-full text-xs text-center border-collapse">
        <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-700">
          <tr>
            <th className="border-r border-slate-200 p-2 font-bold w-20 bg-slate-100">
              EAR
            </th>
            {fields.map((f) => (
              <th
                key={f}
                className="border-r border-slate-200 p-2 font-semibold uppercase"
              >
                {f}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200">
            <td className="border-r border-slate-200 p-2 font-semibold bg-slate-50/50 text-slate-700">
              RIGHT
            </td>
            {fields.map((f) => (
              <td
                key={f}
                className="border-r border-slate-200 p-2 font-medium text-blue-700"
              >
                {impData.right_ear?.[f] || "—"}
              </td>
            ))}
          </tr>
          <tr>
            <td className="border-r border-slate-200 p-2 font-semibold bg-slate-50/50 text-slate-700">
              LEFT
            </td>
            {fields.map((f) => (
              <td
                key={f}
                className="border-r border-slate-200 p-2 font-medium text-blue-700"
              >
                {impData.left_ear?.[f] || "—"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default function PatientVisitDetail({ visitId }) {
  const { patientVisitdetails } = usePatientVisitdata(visitId);

  const visitData = patientVisitdetails || {};

  const {
    id,
    visit_type,
    service_type,
    present_complaint,
    test_requested = [],
    notes,
    status,
    status_note,
    appointment_date,
    case_history = {},
    patient_id,
    patient_name,
    patient_phone,
    patient_email,
    patient_age,
    patient_gender,
    patient_address,
    patient_city,
    seen_by_name,
    tests_performed = {},
    test_uploads = [],
    trials = [],
    purchase_records = [],
    bill_details = {},
  } = visitData;

  const performedTests = [
    tests_performed.pta && "PTA",
    tests_performed.srt_sds && "SRT/SDS",
    tests_performed.pta_sds && "PTA/SDS",
    tests_performed.special_tests === "True" && "Special Tests",
    tests_performed.impedance && "Impedance",
    tests_performed.impedance_etf && "Impedance ETF",
    tests_performed.bera && "BERA",
    tests_performed.assr && "ASSR",
    tests_performed.bera_assr && "BERA/ASSR",
    tests_performed.speech_assessment && "Speech Assessment",
  ].filter(Boolean);

  const hearingSymptoms = Array.isArray(tests_performed.hearing_symptoms)
    ? tests_performed.hearing_symptoms
    : [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <Backbutton />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primaryText">
                Visit Details
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Visit ID: #{id || visitId}
              </p>
              {status_note && (
                <p className="text-sm text-slate-500 mt-1">{status_note}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <CommonBadge
              title={status || "Unknown"}
              status={status?.includes("Completed") ? "Completed" : "bgBadge"}
            />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Seen by</p>
              <p className="font-medium">{seen_by_name || "-"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{patient_name || "-"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{patient_phone?.trim() || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{patient_email || "-"}</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {patient_address || "-"}
                        {patient_city ? `, ${patient_city}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="font-medium">
                        {patient_age ? `${patient_age} years` : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium">{patient_gender || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Patient ID
                      </p>
                      <p className="font-medium">{patient_id || "-"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Visit Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Appointment Date
                      </p>
                      <p className="font-medium">{appointment_date || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Visit Type
                      </p>
                      <CommonBadge title={visit_type || "-"} status="bgBadge" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium">{status || "-"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Service Type
                      </p>
                      <p className="font-medium capitalize">
                        {service_type || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Present Complaint
                      </p>
                      <p className="font-medium">{present_complaint || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="font-medium">{notes || "-"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Case History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Medical History
                      </p>
                      <p className="font-medium">
                        {case_history.medical_history || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Previous HA Experience
                      </p>
                      <p className="font-medium">
                        {case_history.previous_ha_experience || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Family History
                      </p>
                      <p className="font-medium">
                        {case_history.family_history || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Noise Exposure
                      </p>
                      <p className="font-medium">
                        {case_history.noise_exposure || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Red Flags</p>
                      <p className="font-medium">
                        {case_history.red_flags || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TestTube className="h-5 w-5 text-primary" />
                  Tests Performed
                  <p className="rounded-full px-2 py-1 bg-teal-100 text-xs text-teal-700">
                    {performedTests.length + hearingSymptoms.length} item(s)
                  </p>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {performedTests.length > 0 ? (
                    performedTests.map((test) => (
                      <CommonBadge key={test} title={test} status="bgBadge" />
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      No performed test flags available.
                    </p>
                  )}
                </div>
                {hearingSymptoms.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      Hearing Symptoms
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {hearingSymptoms.map((symptom) => (
                        <CommonBadge
                          key={symptom}
                          title={symptom.replace(/_/g, " ")}
                          status="bgBadge"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Test Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {test_uploads.length > 0 ? (
                  <div className="space-y-3">
                    {test_uploads.map((report) => (
                      <div
                        key={report.id}
                        className="flex flex-col p-3 bg-muted/50 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-2 gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-800">
                                {report.report_type || "Report"}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {report.created_at
                                  ? new Date(
                                      report.created_at,
                                    ).toLocaleDateString()
                                  : "-"}
                              </p>
                            </div>
                          </div>
                          {report.file_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(report.file_url, "_blank")
                              }
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                        <div className="border-t pt-2">
                          {report.pta_data &&
                            Object.keys(report.pta_data).length > 0 && (
                              <RenderPTATable ptaData={report.pta_data} />
                            )}
                          {report.impedance_data &&
                            Object.keys(report.impedance_data).length > 0 && (
                              <RenderImpedanceTable
                                impData={report.impedance_data}
                              />
                            )}
                          <p className="text-sm text-slate-600 italic mt-2">
                            "
                            {report.report_description ||
                              "No description provided."}
                            "
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No reports uploaded yet
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Trial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trials.length > 0 ? (
                  <div className="space-y-4">
                    {trials.map((trial) => (
                      <div
                        key={trial.id}
                        className="border border-slate-200 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Response
                            </p>
                            <p className="font-medium">
                              {trial.patient_response || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Decision
                            </p>
                            <p className="font-medium">
                              {trial.trial_decision || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Cost
                            </p>
                            <p className="font-medium">₹{trial.cost || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Follow-up Date
                            </p>
                            <p className="font-medium">
                              {trial.followup_date || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-slate-600">
                          <p className="font-semibold">Counselling Notes</p>
                          <p>{trial.counselling_notes || "-"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No trial details available.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Purchases & Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {purchase_records.length > 0 ? (
                  <div className="space-y-3">
                    {purchase_records.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                      >
                        <p className="text-sm text-muted-foreground">Item</p>
                        <p className="font-medium">{purchase.item_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {purchase.item_brand} · {purchase.item_model}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Serial: {purchase.serial_number || "-"}
                        </p>
                        <p className="text-sm font-semibold mt-2">
                          ₹{purchase.total_price || "0.00"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No purchase records found.
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <p className="text-sm text-muted-foreground">Bill</p>
                    <p className="font-medium">
                      {bill_details.bill_number || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Status
                    </p>
                    <p className="font-medium">
                      {bill_details.payment_status || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Amount
                    </p>
                    <p className="font-medium">
                      ₹{bill_details.total_amount ?? "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Method
                    </p>
                    <p className="font-medium">
                      {bill_details.payment_method || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
