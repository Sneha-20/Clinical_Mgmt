"use client";

import React, { useEffect, useState } from 'react';
import CommonDatePicker from '@/components/ui/CommonDatePicker';
import { format } from 'date-fns';
import { getAllClinics, getRevenueReports } from '@/lib/services/dashboard';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export default function AnalyticsPage() {
  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    if (selectedClinicId) fetchRevenue();
  }, [selectedClinicId]);

  const fetchClinics = async () => {
    try {
      const data = await getAllClinics();
      setClinics(data || []);
      if (data?.length) {
        setSelectedClinicId((prev) => prev ?? data[0].id);
      }
    } catch (error) {
      console.error('Error fetching clinics:', error);
      toast({ title: 'Error', description: 'Unable to load clinics' });
    }
  };

  const fetchRevenue = async () => {
    if (!selectedClinicId) return;
    setLoading(true);
    try {
      const res = await getRevenueReports(selectedClinicId, startDate, endDate);
      const clinicRevenue = Array.isArray(res?.revenue_data) ? (res.revenue_data[0] ?? null) : (res?.clinic_revenue ?? null);
      const staffRevenue = res?.staff_revenue_data ?? res?.staff_revenue ?? [];

      setRevenueData({
        clinic_revenue: clinicRevenue,
        staff_revenue: staffRevenue,
      });
    } catch (error) {
      console.error('Error fetching revenue:', error);
      toast({ title: 'Error', description: 'Unable to fetch revenue data' });
      setRevenueData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!startDate || !endDate) {
      toast({ title: 'Validation', description: 'Select start and end dates' });
      return;
    }
    fetchRevenue();
  };

  const clinicName = clinics.find((c) => c.id === selectedClinicId)?.name || '-';

  const formatMoney = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    const n = Number(value);
    if (Number.isNaN(n)) return value;
    return `₹${n.toFixed(2)}`;
  };
console.log('Revenue Data:', revenueData);
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-600">Revenue Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">Clinic revenue and staff contribution</p>
        </div>

        <div className="flex items-end gap-3">
          <div className="w-44">
            <CommonDatePicker
              selectedDate={startDate ? new Date(startDate) : null}
              onChange={(d) => setStartDate(d ? format(d, 'yyyy-MM-dd') : '')}
              maxDate={new Date()}
            />
          </div>
          <div className="w-44">
            <CommonDatePicker
              selectedDate={endDate ? new Date(endDate) : null}
              onChange={(d) => setEndDate(d ? format(d, 'yyyy-MM-dd') : '')}
              maxDate={new Date()}
            />
          </div>
          <div>
            <Button onClick={handleApply} className="bg-teal-600">Apply</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clinics.map((clinic) => (
          <div
            key={clinic.id}
            role="button"
            onClick={() => setSelectedClinicId(clinic.id)}
            className={`bg-white rounded-lg p-4 cursor-pointer hover:shadow-lg ${selectedClinicId === clinic.id ? 'border-2 border-teal-600 shadow-lg' : 'shadow'}`}>
            <h4 className="text-lg font-semibold text-gray-900">{clinic.name}</h4>
            <p className="text-sm text-gray-600">{clinic.address}</p>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Revenue Details</h3>
          <div className="text-xs text-gray-500">Date Range: <span className="font-semibold">{startDate} to {endDate}</span></div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading revenue...</p>
        ) : !revenueData || (!revenueData.clinic_revenue && (!revenueData.staff_revenue || revenueData.staff_revenue.length === 0)) ? (
          <p className="text-sm text-gray-500">No revenue data for selected range.</p>
        ) : (
          <div className="space-y-4">
            {/* Clinic Revenue Card */}
            {revenueData.clinic_revenue && (
              <div className="p-4 border rounded-lg">
                <h4 className="text-md font-semibold">{revenueData.clinic_revenue.clinic__name || clinicName}</h4>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
                  <div>
                    <div className="text-xs text-gray-500">Total Revenue</div>
                    <div className="text-xl font-bold text-gray-900">{formatMoney(revenueData.clinic_revenue.total_revenue)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Total Bills</div>
                    <div className="text-xl font-bold text-gray-900">{revenueData.clinic_revenue.total_bills ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Avg Bill Amount</div>
                    <div className="text-xl font-bold text-gray-900">{formatMoney(revenueData.clinic_revenue.avg_bill_amount)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Staff Revenue Table */}
            <div>
              <h4 className="text-md font-semibold mb-2">Staff Revenue</h4>
              {revenueData.staff_revenue && revenueData.staff_revenue.length > 0 ? (
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>Name</TableHead>
                      <TableHead>Total Revenue</TableHead>
                      <TableHead>Total Bills</TableHead>
                      <TableHead>Avg Bill</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {revenueData.staff_revenue.map((s, idx) => (
                      <TableRow key={s.created_by__name ?? idx}>
                        <TableCell>{s.created_by__name}</TableCell>
                        <TableCell>{formatMoney(s.total_revenue)}</TableCell>
                        <TableCell>{s.total_bills ?? 0}</TableCell>
                        <TableCell>{formatMoney(s.avg_bill_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500">No staff revenue available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

