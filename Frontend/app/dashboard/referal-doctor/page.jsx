"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  User,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Stethoscope,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

import {
  getReferrals,
  getReferalPatientdetails,
} from "@/lib/services/referal_doctors";

export default function ReferralDoctorPage() {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [patientDetails, setPatientDetails] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDoctor, setLoadingDoctor] = useState(null);

  // ---------- Helpers ----------
  const formatDate = (date) =>
    new Date(date).toLocaleDateString();

  // ---------- Load Referral Doctors ----------
  useEffect(() => {
    const loadData = async () => {
      try {
        const referrals = await getReferrals();
        setData(referrals);
      } catch (error) {
        console.error("Error fetching referrals:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ---------- Toggle Doctor View ----------
  const toggleDoctorView = useCallback(
    async (index, doctor) => {
      // collapse
      if (expandedIndex === index) {
        setExpandedIndex(null);
        return;
      }

      setExpandedIndex(index);

      if (patientDetails[doctor.referral_doctor]) return;
      try {
        setLoadingDoctor(index);

        const referalpatient = await getReferalPatientdetails({
          doctorname: doctor.referral_doctor,
        });
        setPatientDetails((prev) => ({
          ...prev,
          [doctor.referral_doctor]: referalpatient,
        }));
      } catch (error) {
        console.error("Error fetching patient details:", error);
      } finally {
        setLoadingDoctor(null);
      }
    },
    [expandedIndex, patientDetails]
  );

  // ---------- Loading ----------
  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  // ---------- UI ----------
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primaryText">
          Referral Doctors
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Manage referral doctors and view their patient history
        </p>
      </div>

      <div className="space-y-4">
        {data.map((doctor, index) => {
          const patients =
            patientDetails[doctor.referral_doctor] || [];

          return (
            <Card
              key={doctor.id || doctor.referral_doctor}
              className={`transition-all border-slate-200 ${
                expandedIndex === index
                  ? "ring-2 ring-blue-100"
                  : "hover:shadow-md"
              }`}
            >
              {/* Doctor Header */}
              <div
                className="p-5 cursor-pointer"
                onClick={() => toggleDoctorView(index, doctor)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 p-2.5 rounded-lg">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground">
                        {doctor.referral_doctor}
                      </h3>

                      <div className="flex items-center text-slate-500 text-xs mt-1">
                        <Building2 className="w-3 h-3 mr-1" />
                        {doctor.clinic__name}
                      </div>

                      <div className="flex items-center text-slate-400 text-xs mt-2">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(doctor.created_at)}
                      </div>
                    </div>
                  </div>

                  {expandedIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-300" />
                  )}
                </div>
              </div>

              {/* Expanded Section */}
              {expandedIndex === index && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-6 animate-in slide-in-from-top-2 duration-200">
                  <h4 className="text-sm font-semibold text-slate-700 mb-4">
                    Patient History
                  </h4>

                  {/* Loading Patients */}
                  {loadingDoctor === index ? (
                    <p className="text-sm text-slate-500">
                      Loading patients...
                    </p>
                  ) : patients.length > 0 ? (
                    <div className="rounded-md border bg-white overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead>Patient Name</TableHead>
                            <TableHead>Visit Date</TableHead>
                            <TableHead>Visit Type</TableHead>
                            <TableHead>Complaint</TableHead>
                            <TableHead className="text-right">
                              Cost
                            </TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {patients.map((patient, i) => (
                            <TableRow
                              key={`${patient.patient_name}-${i}`}
                              className="hover:bg-slate-50"
                            >
                              <TableCell className="font-medium">
                                {patient.patient_name}
                              </TableCell>

                              <TableCell>
                                {formatDate(patient.visit_date)}
                              </TableCell>

                              <TableCell>
                                {patient.visit_type}
                              </TableCell>

                              <TableCell
                                className="max-w-[200px] truncate"
                                title={patient.present_complaint}
                              >
                                {patient.present_complaint}
                              </TableCell>

                              <TableCell className="text-right font-medium">
                                {patient.final_amount > 0 ? (
                                  `₹${patient.final_amount}`
                                ) : (
                                  <span className="text-green-600">
                                    Free
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <User className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p>No patient history found.</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
