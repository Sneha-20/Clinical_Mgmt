"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, FileText, Activity, ShoppingCart, IndianRupee } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getTrialPerformance } from '@/lib/services/dashboard';

export default function StaffPerformancePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  // Get date parameters from URL
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  useEffect(() => {
    fetchPerformanceData();
  }, [params.id, startDate, endDate]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('staff_id', params.id);
      if (startDate) queryParams.append('start_date', startDate);
      if (endDate) queryParams.append('end_date', endDate);

      const resp = await getTrialPerformance(params.id, queryParams.toString());
      let staffData = resp?.data || (Array.isArray(resp) ? resp[0] : resp);
      if (Array.isArray(staffData)) staffData = staffData[0];

      setPerformanceData(staffData || null);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast({
        title: 'Error',
        description: 'Unable to fetch staff performance data'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => {
    if (value === null || value === undefined || value === '') return '₹0.00';
    const n = Number(value);
    if (Number.isNaN(n)) return `₹${value}`;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(n);
  };

  const StatCard = ({ title, count, icon: Icon, color, onClick }) => (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${selectedCard === title ? 'ring-2 ring-teal-600 shadow-md bg-teal-50/10' : ''}`}
      onClick={() => setSelectedCard(title)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">
          {typeof count === 'number' && title.includes('Revenue') ? formatMoney(count) : count}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed animate-pulse">
          <p className="text-gray-500 font-medium">Loading clinical performance metrics...</p>
        </div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-20 bg-slate-50 rounded-2xl border">
          <p className="text-gray-500">No performance data found for this staff member.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-full shadow-sm bg-white border">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff Clinical Performance</h1>
            <p className="text-sm text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-md inline-block mt-1">
              {performanceData?.staff_name} • {performanceData?.role}
            </p>
          </div>
        </div>
        {startDate && endDate && (
          <div className="text-xs bg-slate-100 px-3 py-1.5 rounded-full text-slate-500 font-bold border">
            PERIOD: {startDate} TO {endDate}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {performanceData?.role === 'Audiologist' ? (
          <>
            <StatCard
              title="Tests Conducted"
              count={performanceData?.summary?.total_tests ?? performanceData?.tests?.length ?? 0}
              icon={FileText}
              color="text-blue-600"
              onClick={() => setSelectedCard('Tests Conducted')}
            />
            <StatCard
              title="Trials Conducted"
              count={performanceData?.summary?.total_trials ?? performanceData?.trials?.length ?? 0}
              icon={Activity}
              color="text-emerald-600"
              onClick={() => setSelectedCard('Trials Conducted')}
            />
            <StatCard
              title="Patients Seen"
              count={performanceData?.summary?.total_patients_seen ?? performanceData?.patient_list_seen?.length ?? 0}
              icon={Users}
              color="text-purple-600"
              onClick={() => setSelectedCard('Patients Seen')}
            />
            <StatCard
              title="Trials Booked"
              count={performanceData?.summary?.total_bookings ?? performanceData?.bookings?.length ?? 0}
              icon={ShoppingCart}
              color="text-orange-600"
              onClick={() => setSelectedCard('Trials Booked')}
            />
            <StatCard
              title="Total Revenue"
              count={performanceData?.total_revenue || 0}
              icon={IndianRupee}
              color="text-teal-600"
              onClick={() => setSelectedCard('Revenue Details')}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Pending Services"
              count={performanceData?.pending_service || 0}
              icon={FileText}
              color="text-blue-600"
              onClick={() => setSelectedCard('Pending Services')}
            />
            <StatCard
              title="Follow-up Calls Made"
              count={performanceData?.calls_made_for_followup || 0}
              icon={Activity}
              color="text-emerald-600"
              onClick={() => setSelectedCard('Follow-up Calls Made')}
            />
          </>
        )}
      </div>

      {/* Details Tables */}
      {selectedCard && (
        <Card className="border-t-4 border-t-teal-600 shadow-xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800">
              {selectedCard === 'Tests Conducted' && 'Diagnostic Report Detail'}
              {selectedCard === 'Trials Conducted' && 'Performance - Trial Details'}
              {selectedCard === 'Patients Seen' && 'Clinic Interaction - Patient List'}
              {selectedCard === 'Trials Booked' && 'Order Log - Booked Trials'}
              {selectedCard === 'Revenue Details' && 'Financial Breakdown & Bills'}
              {selectedCard === 'Pending Services' && 'Customer Care - Pending Services'}
              {selectedCard === 'Follow-up Calls Made' && 'Follow-up Activity Log'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {selectedCard === 'Tests Conducted' && performanceData?.tests?.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Tests Performed</TableHead>
                    <TableHead>Visit Date</TableHead>
                    <TableHead>Seen By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.tests.map((test, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-semibold text-slate-900">{test.patient_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(test.test_name) ? test.test_name.map((t, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-100 uppercase tracking-tighter">
                              {t}
                            </span>
                          )) : (test.test_name || '-')}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-500 whitespace-nowrap">
                        {test.visit_date ? new Date(test.visit_date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 font-medium">{test.seen_by}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {selectedCard === 'Patients Seen' && performanceData?.patient_list_seen?.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Primary Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.patient_list_seen.map((p, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-slate-400 text-xs font-mono">#{p.patient__id}</TableCell>
                      <TableCell className="font-bold text-slate-800">{p.patient__name}</TableCell>
                      <TableCell className="text-sm font-medium tracking-tight text-slate-600">{p.patient__phone_primary}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {selectedCard === 'Revenue Details' && (performanceData?.visit_details_with_bills?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Visit Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Bill Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.visit_details_with_bills.map((bill, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-semibold">{bill.patient_name}</TableCell>
                      <TableCell className="text-xs font-bold text-slate-500 uppercase">{bill.visit_type}</TableCell>
                      <TableCell className="text-xs">{new Date(bill.visit_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-extrabold text-teal-700">{formatMoney(bill.bill_amount)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${bill.payment_status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
                          {bill.payment_status || 'Unpaid'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-10 text-slate-400 italic">No billable visit records found.</p>
            ))}

            {(selectedCard === 'Trials Conducted' || selectedCard === 'Trials Booked') &&
              ((selectedCard === 'Trials Conducted' ? performanceData.trials : performanceData.bookings)?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Device Detail</TableHead>
                      <TableHead>Activity Date</TableHead>
                      <TableHead>Ear Side</TableHead>
                      <TableHead>Status / Decision</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedCard === 'Trials Conducted' ? performanceData.trials : performanceData.bookings).map((item, idx) => (
                      <TableRow key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="font-bold text-slate-900">{item.patient_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5 max-w-[220px]">
                            {item.device_details?.length > 0 ? (
                              item.device_details.map((d, i) => (
                                <span key={i} className="text-[10px] bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 italic truncate font-medium text-slate-600">
                                  {d.brand} {d.style_type || d.device_name} - {d.serial_number}
                                </span>
                              ))
                            ) : (item.brand || item.inventory_item) ? (
                              <span className="text-[10px] bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 italic truncate font-medium text-slate-600">
                                {item.brand} {item.model_type || item.style_type} {item.serial_number ? `- ${item.serial_number}` : ''}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300 font-medium italic">Hardware Details Missing</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-500">
                          {item.trial_start_date || item.booking_created_at ? new Date(item.trial_start_date || item.booking_created_at).toLocaleDateString() : '-'}
                          {item.trial_end_date ? ` to ${new Date(item.trial_end_date).toLocaleDateString()}` : ''}
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {item.device_details?.length === 2 ? 'Binaural' : (item.ear_side || item.device_details?.[0]?.ear_side || '-')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border tracking-tight ${item.trial_decision?.includes('BOOK') || item.booking_status?.includes('BOOK') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                            {item.trial_decision || item.booking_status || '-'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-slate-400 text-center py-10 italic">No activity records found for this period.</p>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}