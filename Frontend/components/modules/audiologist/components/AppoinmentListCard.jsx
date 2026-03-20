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
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] mb-3"
              >
                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center font-bold text-teal-600 flex-shrink-0 text-base">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 ml-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-sm sm:text-base text-slate-800 uppercase tracking-wide">
                      {patient.patient_name}
                    </h4>
                    {patient.visit_type && (
                      <span className="text-[11px] sm:text-xs font-medium px-3 py-0.5 bg-indigo-50/70 text-indigo-700 rounded-full">
                        {patient.visit_type}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[13px] sm:text-sm text-slate-500">
                    <span>{patient.present_complaint}</span>
                    <span className="text-slate-300">•</span>
                    <span>
                      {patient.appointment_date
                        ? new Date(patient.appointment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : ""}
                    </span>

                    {patient.test_requested && patient.test_requested.length > 0 && (
                      <div className="flex items-center gap-2 sm:ml-2">
                        {patient.test_requested.map((test, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] sm:text-[11px] font-semibold px-3 py-0.5 rounded-full uppercase tracking-wide ${test.toLowerCase() === 'new test'
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'bg-teal-50/70 text-teal-600'
                              }`}
                          >
                            {test}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full sm:w-auto bg-[#53a6a3] hover:bg-[#438a87] text-white rounded-md px-5 mt-3 sm:mt-0 shadow-none font-medium h-9"
                  onClick={() => handleViewPatient(patient.visit_id)}
                >
                  Start Test <span className="ml-1.5 text-lg leading-none">&rarr;</span>
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
