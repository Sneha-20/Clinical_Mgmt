"use client";

import { useState, useEffect } from "react";
import { getAllClinics, getDailyRevenueStatus } from "@/lib/services/dashboard";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/button";
import CommonDatePicker from '@/components/ui/CommonDatePicker'
import { format } from 'date-fns'
import {
  getReceptionists,
  approveUser,
  rejectUser,
} from '@/lib/services/accounts'
import { useToast } from '@/components/ui/use-toast' 
export default function AdminDashboard() {
  const [clinics, setClinics] = useState([]);
  const [dailyStatus, setDailyStatus] = useState(null);
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Receptionists list for admin approval
  const [receptionists, setReceptionists] = useState([]);
  const [loadingReceptionists, setLoadingReceptionists] = useState(false);
  const { toast } = useToast();

  // Which summary card is active: 'patients' | 'new_tests' | 'trials' | 'bookings'
  const [activeSection, setActiveSection] = useState('patients');

  // Initialize dates to today

  useEffect(() => {
    // fetch receptionists on mount
    fetchReceptionists();
  }, []);

  const fetchReceptionists = async () => {
    try {
      setLoadingReceptionists(true);
      const res = await getReceptionists();
      setReceptionists(res?.data || []);
    } catch (error) {
      console.error("Error fetching receptionists:", error);
    } finally {
      setLoadingReceptionists(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      if (status === "approved") {
        await approveUser(id);
      } else if (status === "rejected") {
        await rejectUser(id);
      } else {
        throw new Error("Invalid status");
      }

      // remove from list on success
      setReceptionists((prev) => prev.filter((r) => r.id !== id));
      toast({
        title: `Receptionist ${status}`,
        description: `Receptionist has been ${status}.`,
      });
    } catch (error) {
      console.error("Error updating receptionist status:", error);
      toast({
        title: "Error",
        description: "Could not update receptionist status.",
      });
    }
  };
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const clinicsData = await getAllClinics();
      setClinics(clinicsData);

      if (clinicsData.length > 0) {
        const firstClinicId = clinicsData[0]?.id;
        if (firstClinicId) {
          setSelectedClinicId(firstClinicId);
          fetchDailyRevenueStatus(firstClinicId, startDate, endDate);
        } else {
          console.error("First clinic ID is undefined");
        }
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleClinicClick = (clinicId) => {
    if (!clinicId) {
      console.error("Clinic ID is undefined");
      return;
    }
    setSelectedClinicId(clinicId);
    fetchDailyRevenueStatus(clinicId, startDate, endDate);
  };

  useEffect(() => {
    console.log("Clinics data changed:", clinics);
    if (clinics.length > 0 && !selectedClinicId) {
      const firstClinicId = clinics[0]?.id;
      if (firstClinicId) {
        setSelectedClinicId(firstClinicId);
        fetchDailyRevenueStatus(firstClinicId, startDate, endDate);
      } else {
        console.error("First clinic ID is undefined");
      }
    }
  }, [clinics]);

  const fetchDailyRevenueStatus = async (
    clinicId,
    start_date = null,
    end_date = null,
  ) => {
    console.log(
      "Fetching daily revenue status for clinic ID:",
      clinicId,
      "Start Date:",
      start_date,
      "End Date:",
      end_date,
    );
    try {
      const dailyStatusData = await getDailyRevenueStatus(
        clinicId,
        start_date,
        end_date,
      );
      console.log("Daily status data fetched:", dailyStatusData);

      if (dailyStatusData && dailyStatusData.summary) {
        setDailyStatus(dailyStatusData);
      } else {
        console.error(
          "Daily status data or summary is undefined",
          dailyStatusData,
        );
        setDailyStatus(null); // Reset dailyStatus to null if data is invalid
      }
    } catch (error) {
      console.error("Error fetching daily revenue status:", error);
    }
  };

  const handleDateFilter = () => {
    if (!selectedClinicId) {
      console.error("Please select a clinic first");
      return;
    }
    if (!startDate || !endDate) {
      console.error("Please select both start and end dates");
      return;
    }
    fetchDailyRevenueStatus(selectedClinicId, startDate, endDate);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-600">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Complete clinic overview and analytics
        </p>
      </div>

      {/* Clinics List as Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clinics.map((clinic) => (
          <div
            key={clinic.id}
            role="button"
            aria-selected={selectedClinicId === clinic.id}
            className={`bg-white rounded-lg p-4 cursor-pointer hover:shadow-lg ${selectedClinicId === clinic.id ? 'border-2 border-teal-600 shadow-lg' : 'shadow'}`}
            onClick={() => handleClinicClick(clinic.id)}
          >
            <h4 className="text-lg font-semibold text-gray-900">
              {clinic.name}
            </h4>
            <p className="text-sm text-gray-600">Location: {clinic.address}</p>
          </div>
        ))}
      </div>

      {/* Pending Staff Registrations */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Pending Staff Registrations
        </h3>
        {loadingReceptionists ? (
          <p className="text-sm text-gray-500">Loading registered staff...</p>
        ) : receptionists.length > 0 ? (
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Clinic</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {receptionists.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.phone}</TableCell>
                  <TableCell>{r.clinic_name}</TableCell>
                  <TableCell>{r.role}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleUpdateStatus(r.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateStatus(r.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-gray-500">
            No staff registrations pending approval.
          </p>
        )}
      </div>

{dailyStatus && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col mb-4">
          <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            Clinic Daily Reports
          </h3>
            <div className="flex items-end gap-3">
              <div className="w-44">
                <CommonDatePicker
                  // label="Start Date"
                  selectedDate={startDate ? new Date(startDate) : null}
                  onChange={(date) => setStartDate(date ? format(date, 'yyyy-MM-dd') : '')}
                  maxDate={new Date()}
                />
              </div>
              <div className="w-44">
                <CommonDatePicker
                  // label="End Date"
                  selectedDate={endDate ? new Date(endDate) : null}
                  onChange={(date) => setEndDate(date ? format(date, 'yyyy-MM-dd') : '')}
                  maxDate={new Date()}
                />
              </div>
              <div>
                <button onClick={handleDateFilter} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
           <div className="flex gap-3 items-center text-xs text-gray-500">
              <div>Date Range: <span className="font-semibold">{startDate} to {endDate}</span></div>
              <div className="mt-1">Selected Clinic: <span className="font-semibold">{clinics.find(c => c.id === selectedClinicId)?.name || 'None selected'}</span></div>
            </div>
          </div>

          {/* Summary - clickable KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div
              onClick={() => setActiveSection('patients')}
              className={`p-4 rounded-lg cursor-pointer ${activeSection === 'patients' ? 'border-2 border-teal-600 shadow' : 'border border-gray-200'}`}>
              <p className="text-sm font-medium text-gray-700">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{dailyStatus?.summary?.total_patients ?? 0}</p>
            </div>

            <div
              onClick={() => setActiveSection('new_tests')}
              className={`p-4 rounded-lg cursor-pointer ${activeSection === 'new_tests' ? 'border-2 border-teal-600 shadow' : 'border border-gray-200'}`}>
              <p className="text-sm font-medium text-gray-700">New Tests</p>
              <p className="text-2xl font-bold text-gray-900">{dailyStatus?.summary?.new_tests ?? 0}</p>
            </div>

            <div
              onClick={() => setActiveSection('trials')}
              className={`p-4 rounded-lg cursor-pointer ${activeSection === 'trials' ? 'border-2 border-teal-600 shadow' : 'border border-gray-200'}`}>
              <p className="text-sm font-medium text-gray-700">Active Trials</p>
              <p className="text-2xl font-bold text-gray-900">{dailyStatus?.summary?.active_trials ?? 0}</p>
            </div>

            <div
              onClick={() => setActiveSection('bookings')}
              className={`p-4 rounded-lg cursor-pointer ${activeSection === 'bookings' ? 'border-2 border-teal-600 shadow' : 'border border-gray-200'}`}>
              <p className="text-sm font-medium text-gray-700">Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{dailyStatus?.summary?.bookings ?? 0}</p>
            </div>
          </div>

          {/* Detail Table for the active card */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h4 className="text-md font-bold text-gray-900 mb-2">
              {activeSection === 'patients' && 'Patients List'}
              {activeSection === 'new_tests' && 'New Tests'}
              {activeSection === 'trials' && 'Trials List'}
              {activeSection === 'bookings' && 'Bookings List'}
            </h4>

            {/* Patients Table */}
            {activeSection === 'patients' && (
              dailyStatus?.patients?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Clinic</TableHead>
                      <TableHead>Visit Type</TableHead>
                      <TableHead>Created At</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {dailyStatus?.patients?.map((patient, idx) => (
                      <TableRow key={patient.id ?? idx}>
                        <TableCell>{patient.patient__name}</TableCell>
                        <TableCell>{patient.patient__phone_primary}</TableCell>
                        <TableCell>{patient.clinic__name}</TableCell>
                        <TableCell>{patient.visit_type}</TableCell>
                        <TableCell>{patient.created_at ? new Date(patient.created_at).toLocaleString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500">No patients visited today.</p>
              )
            )}

            {/* New Tests Table */}
            {activeSection === 'new_tests' && (
              dailyStatus?.new_tests?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>Patient</TableHead>
                      <TableHead>Test Requested</TableHead>
                      <TableHead>Clinic</TableHead>
                      <TableHead>Seen By</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {dailyStatus?.new_tests?.map((test, idx) => (
                      <TableRow key={test.id ?? idx}>
                        <TableCell>{test.patient__name}</TableCell>
                        <TableCell>{test.test_requested}</TableCell>
                        <TableCell>{test.clinic__name}</TableCell>
                        <TableCell>{test.seen_by__name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500">No new tests conducted today.</p>
              )
            )}

            {/* Trials Table */}
            {activeSection === 'trials' && (
              dailyStatus?.trials?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>Patient</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Clinic</TableHead>
                      <TableHead>Decision</TableHead>
                      <TableHead>Follow-up</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {dailyStatus?.trials?.map((trial, idx) => (
                      <TableRow key={trial.id ?? idx}>
                        <TableCell>{trial.assigned_patient__name}</TableCell>
                        <TableCell>{`${trial.device_inventory_id__brand ?? ''} ${trial.device_inventory_id__model_type ?? ''}`}</TableCell>
                        <TableCell>{trial.visit__clinic__name}</TableCell>
                        <TableCell>{trial.trial_decision}</TableCell>
                        <TableCell>{trial.followup_date ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500">No trials conducted today.</p>
              )
            )}

            {/* Bookings Table */}
            {activeSection === 'bookings' && (
              dailyStatus?.bookings?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>Patient</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Clinic</TableHead>
                      <TableHead>Cost</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {dailyStatus?.bookings?.map((booking, idx) => (
                      <TableRow key={booking.id ?? idx}>
                        <TableCell>{booking.assigned_patient__name}</TableCell>
                        <TableCell>{`${booking.booked_device_inventory__brand ?? ''} ${booking.booked_device_inventory__model_type ?? ''}`}</TableCell>
                        <TableCell>{booking.visit__clinic__name}</TableCell>
                        <TableCell>{booking.cost ? `₹${booking.cost}` : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500">No bookings made today.</p>
              )
            )}
        </div>
      </div>
      )}
    </div>
  );
}


