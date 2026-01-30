"use client";

import { useState, useEffect } from "react";
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
import Backbutton from "@/components/ui/Backbutton";
import Tabs from "@/components/ui/CommonTab";
import { getPurchaseHistory } from "@/lib/services/patientProfile";
import { getServiceVisits } from "@/lib/services/patientProfile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

export default function PatientProfile({ patientId }) {
  const { patient, patientVisit } = usePatientProfile(patientId);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceHistory, setServiceHistory] = useState([]);


  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      try {
        const res = await getPurchaseHistory(patientId, currentPage);
        // API shape expected: { status, nextPage, previousPage, totalItems, totalPages, data: [...] }
        const items = res?.data ?? res?.results ?? [];
        const pages = res?.totalPages ?? res?.total_pages ?? res?.totalPages ?? 1;
        setPurchaseHistory(items);
        setTotalPages(pages || 1);
      } catch (error) {
        console.error("Failed to fetch purchase history", error);
      }
    };

    fetchPurchaseHistory();
  }, [patientId, currentPage]);

  useEffect(() => {
    const fetchServiceHistory = async () => {
      try {
        const res = await getServiceVisits(patientId);
        const items = res?.data ?? res?.results ?? [];
        const pages = res?.totalPages ?? res?.total_pages ?? 1;
        setServiceHistory(items);
        setServiceTotalPages(pages || 1);
      } catch (error) {
        console.error("Failed to fetch service history", error);
      }
    };

    fetchServiceHistory();
  }, [patientId]);

  // const handlePageChange = (page) => {
  //   setCurrentPage(page);
  // };

  // const handleNext = () => set((s) => Math.min(s + 1, serviceTotalPages));
  // const handlePrev = () => set((s) => Math.max(s - 1, 1));

  const visitHistoryContent = (
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

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Bill:</p>
                  </div>
                  <span className="text-lg font-medium text-accent">
                    ₹{visit.total_bill}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {visit.service_type === "home" ? (
                    <Home className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">Service:</span>
                  <span className="text-sm font-medium text-foreground">
                    {visit.service_type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">By:</span>
                  <span className="text-sm font-medium text-foreground">
                    {visit.seen_by}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="text-sm font-medium text-foreground">
                    {visit.appointment_date}
                  </span>
                </div>
                {visit.present_complaint && (
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Complaint:</span>
                    <span className="text-sm font-medium text-foreground">
                      {visit.present_complaint}
                    </span>
                  </div>
                )}
                {visit.test_requested.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Tests Requested:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-6">
                      {visit.test_requested.map((test) => (
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
                    <span className="text-sm font-medium text-muted-foreground">Notes:</span>
                  </div>
                  <p className="text-sm text-foreground ml-6">{visit.notes}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const purchaseHistoryContent = (
    <div>
      {purchaseHistory.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {/* <TableHead>#</TableHead> */}
                <TableHead>Item</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Qty</TableHead>
                {/* <TableHead>Unit Price</TableHead> */}
                <TableHead>Total Price</TableHead>
                <TableHead>Purchase Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseHistory.map((p) => (
                <TableRow key={p.id}>
                  {/* <TableCell className="w-12">{p.id}</TableCell> */}
                  <TableCell>{p.item_name}</TableCell>
                  <TableCell>{p.item_brand}</TableCell>
                  <TableCell>{p.item_model}</TableCell>
                  <TableCell>{p.serial_number}</TableCell>
                  <TableCell>{p.quantity}</TableCell>
                  {/* <TableCell>₹{p.unit_price}</TableCell> */}
                  <TableCell>₹{p.total_price}</TableCell>
                  <TableCell>{new Date(p.purchase_date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* <Pagination
            page={currentPage}
            totalPages={totalPages}
            onNext={() => setCurrentPage((s) => Math.min(s + 1, totalPages))}
            onPrev={() => setCurrentPage((s) => Math.max(s - 1, 1))}
          /> */}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No purchase history available.</p>
      )}
    </div>
  );
  const serviceHistoryContent = (
    <div>
      {serviceHistory.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {/* <TableHead>#</TableHead> */}
                {/* <TableHead>Visit ID</TableHead> */}
                 <TableHead>Device (Name / Brand / Model)</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Complaint</TableHead>
                <TableHead>Action Taken</TableHead>
                 <TableHead>Status</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Service Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceHistory.map((s) => (
                <TableRow key={s.id}>
                  {/* <TableCell className="w-12">{s.id}</TableCell> */}
                  {/* <TableCell>{s.visit_id}</TableCell> */}
                  <TableCell>{`${s.device_details?.name || ""} / ${s.device_details?.brand || ""} / ${s.device_details?.model || ""}`}</TableCell>
                  <TableCell>{s.service_type}</TableCell>
                  <TableCell className="max-w-md truncate">{s.complaint}</TableCell>
                  <TableCell className="max-w-md truncate">{s.action_taken}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>{s.device_serial_number}</TableCell>
                  <TableCell>{new Date(s.service_date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* <Pagination
            page={}
            totalPages={serviceTotalPages}
            onNext={handleNext}
            onPrev={handlePrev}
          /> */}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No service history available.</p>
      )}
    </div>
  );

  const tabs = [
    { label: "Visit History", value: "visitHistory", content: visitHistoryContent },
    { label: "Purchase History", value: "purchaseHistory", content: purchaseHistoryContent },
    { label: "Service History", value: "serviceHistory", content: serviceHistoryContent },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Backbutton />
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
                {patient?.total_visits}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Total Spent
              </p>
              <p className="text-xl sm:text-2xl font-bold text-accent">₹{patient?.total_bill}</p>
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
        {/* Case History (full width) */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Case History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Medical History</p>
                  <p className="font-semibold text-sm sm:text-base">{patient?.case_history?.medical_history || "-"}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Family History</p>
                  <p className="font-semibold text-sm sm:text-base">{patient?.case_history?.family_history || "-"}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Noise Exposure</p>
                  <p className="font-semibold text-sm sm:text-base">{patient?.case_history?.noise_exposure || "-"}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Previous HA Experience</p>
                  <p className="font-semibold text-sm sm:text-base">{patient?.case_history?.previous_ha_experience || "-"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">Red Flags</p>
                  <p className="font-semibold text-sm sm:text-base">{patient?.case_history?.red_flags || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs tabs={tabs} defaultTab="visitHistory" />
    </div>
  );
}
