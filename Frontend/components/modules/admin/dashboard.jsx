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
import FullVisitModal from "@/components/modules/receptionist/component/FullVisitModal";
import {
  getReceptionists,
  approveUser,
  rejectUser,
} from '@/lib/services/accounts'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from "next/navigation";
import { Users, Activity, PlayCircle, CalendarCheck, Banknote, ShieldCheck, TrendingUp, Eye } from 'lucide-react'
export default function AdminDashboard() {
  const router = useRouter();
  const [clinics, setClinics] = useState([]);
  const [dailyStatus, setDailyStatus] = useState(null);
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Full Visit Modal state
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);

  // Receptionists list for admin approval
  const [receptionists, setReceptionists] = useState([]);
  const [loadingReceptionists, setLoadingReceptionists] = useState(false);
  const { toast } = useToast();

  // Which summary card is active: 'patients' | 'visits' | 'tests' | 'trials' | 'bookings' | 'purchases'
  const [activeSection, setActiveSection] = useState('patients');
  const [hoveredSection, setHoveredSection] = useState(null);

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
      const resp = await getDailyRevenueStatus(
        clinicId,
        start_date,
        end_date,
      );
      const dailyStatusData = resp?.data || resp;
      if (dailyStatusData && dailyStatusData.summary) {
        setDailyStatus(dailyStatusData);
      } else {
        console.error(
          "Daily status data or summary is undefined",
          resp,
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
                  <TableCell>{r.role_name}</TableCell>
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
                <div className="w-[280px]">
                  <CommonDatePicker
                    // label="Start Date"
                    selectedDate={startDate ? new Date(startDate) : null}
                    onChange={(date) => setStartDate(date ? format(date, 'yyyy-MM-dd') : '')}
                    maxDate={new Date()}
                  />
                </div>
                <div className="w-[280px]">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {[
              { id: 'patients', title: 'Total Patients', value: dailyStatus?.summary?.total_patients ?? 0, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
              { id: 'visits', title: 'Patient Visits', value: dailyStatus?.summary?.total_patient_visits ?? 0, icon: TrendingUp, color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
              { id: 'tests', title: 'Total Tests', value: dailyStatus?.summary?.total_tests ?? 0, icon: Activity, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
              { id: 'trials', title: 'Total Trials', value: dailyStatus?.summary?.total_trials ?? 0, icon: PlayCircle, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
              { id: 'bookings', title: 'Total Bookings', value: dailyStatus?.summary?.total_bookings ?? 0, icon: CalendarCheck, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
              { id: 'purchases', title: 'Total Purchases', value: dailyStatus?.summary?.total_purchases ?? 0, icon: Banknote, color: 'text-teal-600', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
            ].map((card) => {
              const Icon = card.icon;
              const isActive = activeSection === card.id;
              const isHovered = hoveredSection === card.id;

              return (
                <div
                  key={card.id}
                  onClick={() => setActiveSection(card.id)}
                  onMouseEnter={() => setHoveredSection(card.id)}
                  onMouseLeave={() => setHoveredSection(null)}
                  className={`relative group p-5 rounded-2xl cursor-pointer transition-all duration-500 ease-in-out border ${isActive
                    ? `ring-2 ring-offset-2 ring-teal-500 shadow-xl ${card.bgColor} border-transparent`
                    : `bg-white ${card.borderColor} hover:shadow-xl hover:border-teal-200`
                    } ${isHovered ? 'z-10 scale-[1.02]' : 'z-0'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.color} transition-colors duration-300 shadow-sm`}>
                      <Icon size={24} />
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{card.title}</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-black text-slate-900 leading-none">
                        {card.isCurrency ? `₹${card.value}` : card.value}
                      </p>
                    </div>
                  </div>

                  {/* Aesthetic Background Pattern */}
                  <div className={`absolute right-0 bottom-0 opacity-[0.05] transition-transform duration-700 group-hover:scale-125 group-hover:-rotate-12 ${card.color}`}>
                    <Icon size={80} />
                  </div>

                  {/* Quick Glance Preview on Hover */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${isHovered && ['patients', 'visits', 'tests', 'trials', 'bookings', 'purchases'].includes(card.id)
                      ? 'max-h-52 mt-4 opacity-100'
                      : 'max-h-0 opacity-0'
                      }`}
                  >
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                        <TrendingUp size={10} /> Recent Records
                      </p>
                      <div className="space-y-1.5">
                        {(card.id === 'patients' ? dailyStatus?.patients :
                          card.id === 'visits' ? dailyStatus?.patient_visits :
                            card.id === 'tests' ? dailyStatus?.tests :
                              card.id === 'trials' ? dailyStatus?.trials :
                                card.id === 'bookings' ? dailyStatus?.bookings :
                                  card.id === 'purchases' ? dailyStatus?.purchase_records : [])?.slice(0, 3).map((item, i) => (
                                    <div key={i} className="text-[11px] text-slate-600 flex justify-between items-center gap-2 group/item">
                                      <span className="truncate font-medium group-hover/item:text-teal-600 transition-colors">
                                        {item.patient_name || item.name || 'Unknown'}
                                      </span>
                                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 text-[9px] font-bold border border-slate-100 uppercase">
                                        {Array.isArray(item.test_name) ? item.test_name.join(', ') : (item.visit_type || item.test_name || item.trial_decision || item.inventory_item || 'Record')}
                                      </span>
                                    </div>
                                  ))}
                        {(!dailyStatus?.[card.id === 'visits' ? 'patient_visits' : (card.id === 'purchases' ? 'purchase_records' : card.id)]?.length) && (
                          <p className="text-[10px] text-slate-400 italic">No recent activity</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-teal-500 rounded-b-2xl" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Detail Table for the active card */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h4 className="text-md font-bold text-gray-900 mb-2 uppercase tracking-tight">
              {activeSection === 'patients' && 'Patients Register'}
              {activeSection === 'visits' && 'Visit History'}
              {activeSection === 'tests' && 'Diagnostics List'}
              {activeSection === 'trials' && 'Trials Performance'}
              {activeSection === 'bookings' && 'Bookings Tracker'}
              {activeSection === 'purchases' && 'Purchases Log'}
            </h4>

            {/* Patients Table */}
            {activeSection === 'patients' && (
              dailyStatus?.patients?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Referral</TableHead>
                      <TableHead>Action</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {dailyStatus?.patients?.map((patient, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-semibold text-slate-800">{patient.name}</TableCell>
                        <TableCell>{patient.phone_primary}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{patient.address}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.referral_doctor || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                            onClick={() => window.open(`/dashboard/userprofile/${patient.id || patient.patient__id}`, '_blank')}
                          >
                            <Eye size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500">No patient records found.</p>
              )
            )}

            {/* Patient Visits Table */}
            {activeSection === 'visits' && (
              dailyStatus?.patient_visits?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Visit Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {dailyStatus?.patient_visits?.map((visit, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-semibold">{visit.patient_name}</TableCell>
                        <TableCell>{visit.visit_date ? new Date(visit.visit_date).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{visit.visit_type}</TableCell>
                        <TableCell>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                            {visit.visit_status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                            onClick={() => {
                              setSelectedVisitId(visit.visit_id || visit.id);
                              setIsVisitModalOpen(true);
                            }}
                          >
                            <Eye size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500">No visits recorded.</p>
              )
            )}

            {/* Tests Table */}
            {activeSection === 'tests' && (
              dailyStatus?.tests?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>Patient</TableHead>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Visit Date</TableHead>
                      <TableHead>Performed By</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {dailyStatus?.tests?.map((test, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-semibold">{test.patient_name}</TableCell>
                        <TableCell className="uppercase tracking-wider font-medium text-[10px] text-teal-700">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(test.test_name) ? test.test_name.map((t, idx) => (
                              <span key={idx} className="bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                                {t}
                              </span>
                            )) : (test.test_name || '-')}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-500 whitespace-nowrap">
                          {test.visit_date ? new Date(test.visit_date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>{test.seen_by}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500">No tests recorded.</p>
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
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Decision</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {dailyStatus?.trials?.map((trial, idx) => (
                      <TableRow key={trial.id ?? idx}>
                        <TableCell className="font-medium">{trial.patient_name}</TableCell>
                        <TableCell>
                          {trial.device_details?.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {trial.device_details.map((d, i) => (
                                <span key={i} className="text-[10px] bg-slate-50 px-2 py-0.5 rounded border border-slate-100 italic">
                                  {d.brand} {d.style_type} ({d.ear_side}) - {d.serial_number}
                                </span>
                              ))}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-sm">{trial.trial_start_date ?? '-'}</TableCell>
                        <TableCell className="text-sm">{trial.trial_end_date ?? '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${trial.trial_decision === 'BOOKED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {trial.trial_decision}
                          </span>
                        </TableCell>
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
                      <TableHead>Brand/Model</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Serial</TableHead>
                      <TableHead>Ear Side</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {dailyStatus?.bookings?.map((booking, idx) => (
                      <TableRow key={booking.id ?? idx}>
                        <TableCell className="font-medium">{booking.patient_name}</TableCell>
                        <TableCell>{`${booking.brand ?? ''} ${booking.model_type ?? ''}`}</TableCell>
                        <TableCell>{booking.inventory_item}</TableCell>
                        <TableCell>{booking.serial_number || '-'}</TableCell>
                        <TableCell>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 uppercase">
                            {booking.ear_side || 'N/A'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500">No bookings made today.</p>
              )
            )}

            {/* Purchase Records Table */}
            {activeSection === 'purchases' && (
              dailyStatus?.purchase_records?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>Patient</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Brand/Model</TableHead>
                      <TableHead>Serial</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Date</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {dailyStatus?.purchase_records?.map((p, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{p.patient_name}</TableCell>
                        <TableCell>{p.inventory_item}</TableCell>
                        <TableCell>{p.brand} {p.model_type}</TableCell>
                        <TableCell>{p.serial_number || '-'}</TableCell>
                        <TableCell>{p.quantity}</TableCell>
                        <TableCell className="font-bold text-teal-600">₹{p.total_price}</TableCell>
                        <TableCell>{p.purchased_at ? new Date(p.purchased_at).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500">No purchase records found.</p>
              )
            )}

          </div>
        </div>
      )}

      {/* Full Visit Record Modal */}
      <FullVisitModal 
        open={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        visitId={selectedVisitId}
      />
    </div>
  );
}


