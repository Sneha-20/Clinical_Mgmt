"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Home,
  Building2,
  IndianRupee,
  User,
  Stethoscope,
  ClipboardList,
  FileText,
} from "lucide-react";
import usePatientProfile from "@/lib/hooks/usePatientProfile";
import CommonBadge from "@/components/ui/badge";

export default function PatientProfile({ patientId }) {
  const { patient, patientVisit, onBack } = usePatientProfile(patientId);
  console.log("patientData", patientVisit);
  console.log("patientId", patientId);
  const status = "In Progress";


  return (
    // <p>{patient?.name}</p>
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="w-8 h-8 sm:w-10 sm:h-10"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-primaryText">
            {patient?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Patient ID: #{patient?.id}
          </p>
        </div>
      </div>

      {/* Patient Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Age</p>
              <p className="font-semibold text-sm sm:text-base">
                {patient?.age} years
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Gender</p>
              <p className="font-semibold text-sm sm:text-base">
                {patient?.gender}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Referral Type
              </p>
              <p className="font-semibold text-sm sm:text-base">
                {patient?.referral_type}
              </p>
            </div>
            {patient?.referral_doctor && (
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Doctor
                </p>
                <p className="font-semibold text-sm sm:text-base">
                  {patient?.referral_doctor}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div className="flex items-start gap-2 sm:gap-3">
              <Phone className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Primary</p>
                <p className="font-medium text-xs sm:text-sm">
                  {patient?.phone_primary}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <Phone className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Secondary</p>
                <p className="font-medium text-xs sm:text-sm">
                  {patient?.phone_secondary}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="font-medium text-xs sm:text-sm">
                  {patient?.address}, {patient?.city}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Total Visits
              </p>
              <p className="text-xl sm:text-2xl font-bold text-accent">
                {patientVisit?.totalItems}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Total Spent
              </p>
              <p className="text-xl sm:text-2xl font-bold text-accent">₹400</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Last Visit
              </p>
              <p className="font-semibold text-sm">
                {patientVisit?.[0]?.appointment_date || "No date"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visit History */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Visit History</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Complete patient visit timeline with notes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {patientVisit?.map((visit, index) => (
              <Card key={index} className="relative p-3 sm:p-4">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-accent mt-2"></div>
                    {index !== patientVisit.length - 1 && (
                      <div className="w-0.5 h-12 sm:h-16 bg-border mt-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pt-0.5 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <p className="font-semibold text-xs sm:text-sm truncate">
                          {visit.visit_type}
                        </p>
                      </div>

                        {/* {visit.total_bill && ( */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">

                          <IndianRupee className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Bill:
                          </p>
                          </div>
                          <span className="text-lg font-medium text-accent">
                            ₹{visit.total_bill}
                          </span>
                        </div>
                      
                      {/* <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          status === "Completed"
                            ? "bg-green-100 text-green-600"
                            : status === "In Progress"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {status}
                      </span> */}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Service Type */}
                      <div className="flex items-center gap-2">
                        {visit.service_type === "home" ? (
                          <Home className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          Service:
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {visit.service_type}
                        </span>
                      </div>

                      {/* Seen By */}
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          By:
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {visit.seen_by}
                        </span>
                      </div>

                      {/* Appointment Date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Date:
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {visit.appointment_date}
                        </span>
                      </div>

                      {/* Present Complaint */}
                      {visit.present_complaint && (
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Complaint:
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {visit.present_complaint}
                          </span>
                        </div>
                      )}
                      
                      
                      {visit.test_requested.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Tests Requested:
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 ml-6">
                            {visit.test_requested.map((test) => (
                              // <p key={test}>{test.toUpperCase()}</p>
                              <CommonBadge key={test} title={test.toUpperCase()} />
                                    
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                    {visit.notes && (
                        <div className="bg-muted rounded-md p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">
                              Notes:
                            </span>
                          </div>
                          <p className="text-sm text-foreground ml-6">
                            {visit.notes}
                          </p>
                        </div>
                      )}
                    
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bills & Transactions */}
      {/* <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Bills & Transactions</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Invoice history and payment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {bills.map((bill) => (
              <div key={bill.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-border rounded-lg hover:bg-muted">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-1">
                    <p className="font-semibold text-xs sm:text-sm">{bill.id}</p>
                    <p className="text-base sm:text-lg font-bold text-accent">₹{bill.amount.toLocaleString()}</p>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{bill.items}</p>
                  <p className="text-xs text-muted-foreground mt-1">{bill.date}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    bill.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {bill.status}
                  </span>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
