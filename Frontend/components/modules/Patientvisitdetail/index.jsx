"use client";

import Backbutton from "@/components/ui/Backbutton";
import CommonBadge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useAudiologist from "@/lib/hooks/useAudiologist";
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

export default function PatientVisitDetail({ visitId }) {
  const { patientVisitdetails } = usePatientVisitdata(visitId);
 const { showCaseHistoryform } = useAudiologist();

  // ✅ Destructured & renamed variables
  const {
    patient_info: patientInfo = {},
    visit_info: visitInfo = {},
    test_performed: testPerformed = {},
    test_reports: testReports = {},
  } = patientVisitdetails || {};

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">

          <Backbutton />
          <div className="flex gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primaryText">
                Visit Details
              </h1>
               <p className="text-muted-foreground">
              Visit ID: #{visitInfo.visit_id}
            </p>
            </div>
            <div className="pt-2.5">

              <CommonBadge title={visitInfo.status} status="Completed" />
            </div>
           
          </div>
            </div>
          <div>view profile</div>
        </div>

        {/* Patient Info Card */}
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
                  <p className="font-medium">{patientInfo.patient_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patientInfo.patient_phone?.trim()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{patientInfo.patient_email}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{patientInfo.patient_age} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{patientInfo.patient_gender}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visit Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5 text-primary" />
              Visit Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Appointment Date
                    </p>
                    <p className="font-medium">{visitInfo.appointment_date}</p>
                  </div>
                </div>
                <div className="ml-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Visit Type
                  </p>
                  <CommonBadge title={visitInfo.visit_type} />
                </div>
              </div>

              <div className="space-y-3">
                <div>

                <div>
                  <p className="text-sm text-muted-foreground">Service Type</p>
                  <p className="font-medium capitalize">
                    {visitInfo.service_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Present Complaint
                  </p>
                  <p className="font-medium">{visitInfo.present_complaint}</p>
                </div>

                </div>
              <Button variant="link" onClick={() => showCaseHistoryform(visitInfo.visit_id, 2)}>Add reports</Button>
                

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tests Performed Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TestTube className="h-5 w-5 text-primary" />
              Tests Performed
              <p className="rounded-full px-2 py-1 bg-teal-100 text-xs text-teal-700">
                {testPerformed.test_count} test(s)
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {testPerformed.test_requested?.map((test, index) => (
                <div key={`${index}-${test.toLowerCase()}`}>
                  <CommonBadge title={test} status="bgBadge" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Reports Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-primary" />
              Test Reports
              <p className="rounded-full px-2 py-1 bg-teal-100 text-xs text-teal-700">
                {testReports.files_count} file(s)
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testReports.reports?.length > 0 ? (
              <div className="space-y-3">
                {testReports.reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {report.report_type.toUpperCase()} Report
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded on{" "}
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(report.file_url, "_blank")}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
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
      </div>
    </div>
  );
}
