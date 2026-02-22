import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/Pagination";

export default function AppoinmentListCard({
  appoinementList,
  handleViewPatient,
  onPrev,
  onNext,
  totalPages,
  page,
}) {
  return (
    <div>
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Patient Queue</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Patients waiting for audiological assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {appoinementList?.map((patient, index) => (
              <div
                key={patient.visit_id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center font-bold text-teal-600 flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base">
                    {patient.patient_name}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {patient.present_complaint}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {patient.appointment_date}
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {patient.test_requested?.map((test, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full"
                      >
                        {test.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  className="gap-2 text-sm w-full sm:w-auto"
                  onClick={() => handleViewPatient(patient.visit_id)}
                >
                  Start Test
                </Button>
              </div>
            ))}
          </div>
           <Pagination
          page={page}
          totalPages={totalPages}
          onNext={onNext}
          onPrev={onPrev}
          />
        </CardContent>
      </Card>
    </div>
  );
}
