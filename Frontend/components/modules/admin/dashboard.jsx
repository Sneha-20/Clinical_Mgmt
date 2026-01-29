'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react'
import { getAllClinics, getDailyRevenueStatus, getInventoryStatus } from '@/lib/services/dashboard'
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [clinics, setClinics] = useState([])
  const [dailyStatus, setDailyStatus] = useState(null)
  const [inventoryStatus, setInventoryStatus] = useState([])
  const [inventorySummary, setInventorySummary] = useState(null)
  const [selectedClinicId, setSelectedClinicId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const clinicsData = await getAllClinics();
      setClinics(clinicsData);

      if (clinicsData.length > 0) {
        const firstClinicId = clinicsData[0]?.id;

        console.log("First clinic ID:", firstClinicId);
        if (firstClinicId) {
          setSelectedClinicId(firstClinicId);
          fetchDailyRevenueStatus(firstClinicId);
        } else {
          console.error("First clinic ID is undefined");
        }
      }

      const inventoryData = await getInventoryStatus();
      setInventoryStatus(inventoryData.low_stock_alerts);
      setInventorySummary(inventoryData.summary);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }

  const handleClinicClick = (clinicId) => {
    if (!clinicId) {
      console.error("Clinic ID is undefined");
      return;
    }
    setSelectedClinicId(clinicId);
    fetchDailyRevenueStatus(clinicId);
  };

  useEffect(() => {

    console.log("Clinics data changed:", clinics);
    if (clinics.length > 0 && !selectedClinicId) {
      const firstClinicId = clinics[0]?.id;
      if (firstClinicId) {
        setSelectedClinicId(firstClinicId);
        fetchDailyRevenueStatus(firstClinicId);
      } else {
        console.error("First clinic ID is undefined");
      }
    }
  }, [clinics]);

  const fetchDailyRevenueStatus = async (clinicId) => {

    console.log("Fetching daily revenue status for clinic ID:", clinicId);
    try {
      const dailyStatusData = await getDailyRevenueStatus(clinicId);
      console.log("Daily status data fetched:", dailyStatusData);

      if (dailyStatusData && dailyStatusData.summary) {
        setDailyStatus(dailyStatusData);
      } else {
        console.error("Daily status data or summary is undefined", dailyStatusData);
        setDailyStatus(null); // Reset dailyStatus to null if data is invalid
      }
    } catch (error) {
      console.error("Error fetching daily revenue status:", error);
    }
  };

  // console.log(inventorySummary)
  // console.log(inventoryStatus)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-600">Admin Dashboard</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">Complete clinic overview and analytics</p>
      </div>

      {/* Clinics List as Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clinics.map((clinic) => (
          <div
            key={clinic.id}
            className="bg-white shadow rounded-lg p-4 cursor-pointer hover:shadow-lg"
            onClick={() => handleClinicClick(clinic.id)}
          >
            <h4 className="text-lg font-semibold text-gray-900">{clinic.name}</h4>
            <p className="text-sm text-gray-600">Location: {clinic.address}</p>
          </div>
        ))}
      </div>

        {/* Daily Revenue Report */}

            {dailyStatus && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Clinic Daily Reports</h3>
          <p className="text-sm text-gray-600 mb-4">Date: {dailyStatus?.date || "N/A"}</p>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-700">Total Patients</p>
              <p className="text-lg font-bold text-gray-900">{dailyStatus?.summary?.total_patients || <span className='text-gray-500'>No data available</span>}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">New Tests</p>
              <p className="text-lg font-bold text-gray-900">{dailyStatus?.summary?.new_tests || <span className='text-gray-500'>No data available</span>}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Active Trials</p>
              <p className="text-lg font-bold text-gray-900">{dailyStatus?.summary?.active_trials || <span className='text-gray-500'>No data available</span>}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Bookings</p>
              <p className="text-lg font-bold text-gray-900">{dailyStatus?.summary?.bookings || <span className='text-gray-500'>No data available</span>}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">TGAs</p>
              <p className="text-lg font-bold text-gray-900">{dailyStatus?.summary?.tgas || <span className='text-gray-500'>No data available</span>}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Follow-ups Pending</p>
              <p className="text-lg font-bold text-gray-900">{dailyStatus?.summary?.followup_pending || <span className='text-gray-500'>No data available</span>}</p>
            </div>
          </div>

          {/* Data Sections in 2x2 Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Patients Today */}
            <div className="border border-gray-300 rounded-lg p-4">
              <h4 className="text-md font-bold text-gray-900 mb-2">Patients Today</h4>
              {dailyStatus?.patients_today?.length > 0 ? (
                <ul className="space-y-2">
                  {dailyStatus?.patients_today?.map((patient, index) => (
                    <li key={index} className="border border-gray-200 rounded-lg p-3">
                      <p className="font-semibold text-sm">{patient.patient__name}</p>
                      <p className="text-xs text-gray-600">Phone: {patient.patient__phone_primary}</p>
                      <p className="text-xs text-gray-600">Clinic: {patient.clinic__name}</p>
                      <p className="text-xs text-gray-600">Visit Type: {patient.visit_type}</p>
                      <p className="text-xs text-gray-600">Created At: {new Date(patient.created_at).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No patients visited today.</p>
              )}
            </div>

            {/* New Tests */}
            <div className="border border-gray-300 rounded-lg p-4">
              <h4 className="text-md font-bold text-gray-900 mb-2">New Tests</h4>
              {dailyStatus?.new_tests?.length > 0 ? (
                <ul className="space-y-2">
                  {dailyStatus?.new_tests?.map((test, index) => (
                    <li key={index} className="border border-gray-200 rounded-lg p-3">
                      <p className="font-semibold text-sm">{test.patient__name}</p>
                      <p className="text-xs text-gray-600">Test Requested: {test.test_requested}</p>
                      <p className="text-xs text-gray-600">Clinic: {test.clinic__name}</p>
                      <p className="text-xs text-gray-600">Seen By: {test.seen_by__name}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No new tests conducted today.</p>
              )}
            </div>

            {/* Trials Today */}
            <div className="border border-gray-300 rounded-lg p-4">
              <h4 className="text-md font-bold text-gray-900 mb-2">Trials Today</h4>
              {dailyStatus?.trials_today?.length > 0 ? (
                <ul className="space-y-2">
                  {dailyStatus?.trials_today?.map((trial, index) => (
                    <li key={index} className="border border-gray-200 rounded-lg p-3">
                      <p className="font-semibold text-sm">{trial.assigned_patient__name}</p>
                      <p className="text-xs text-gray-600">Device: {trial.device_inventory_id__brand} {trial.device_inventory_id__model_type}</p>
                      <p className="text-xs text-gray-600">Clinic: {trial.visit__clinic__name}</p>
                      <p className="text-xs text-gray-600">Decision: {trial.trial_decision}</p>
                      <p className="text-xs text-gray-600">Follow-up Date: {trial.followup_date}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No trials conducted today.</p>
              )}
            </div>

            {/* Bookings Today */}
            <div className="border border-gray-300 rounded-lg p-4">
              <h4 className="text-md font-bold text-gray-900 mb-2">Bookings Today</h4>
              {dailyStatus?.bookings_today?.length > 0 ? (
                <ul className="space-y-2">
                  {dailyStatus?.bookings_today?.map((booking, index) => (
                    <li key={index} className="border border-gray-200 rounded-lg p-3">
                      <p className="font-semibold text-sm">{booking.assigned_patient__name}</p>
                      <p className="text-xs text-gray-600">Device: {booking.booked_device_inventory__brand} {booking.booked_device_inventory__model_type}</p>
                      <p className="text-xs text-gray-600">Clinic: {booking.visit__clinic__name}</p>
                      <p className="text-xs text-gray-600">Cost: ₹{booking.cost}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No bookings made today.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inventory Summary */}
      {inventorySummary && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Total Categories</p>
              <p className="text-lg font-bold text-gray-900">{inventorySummary.total_categories}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Low Stock Alerts</p>
              <p className="text-lg font-bold text-red-600">{inventorySummary.low_stock_alerts_count}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Fast Moving Items</p>
              <p className="text-lg font-bold text-green-600">{inventorySummary.fast_moving_items_count}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Trial Devices in Use</p>
              <p className="text-lg font-bold text-blue-600">{inventorySummary.trial_devices_in_use_count}</p>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Alerts */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Low Stock Alerts</h3>
        <div className="space-y-2">
          {inventoryStatus.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
              <div>
                <p className="font-semibold text-sm">{item.product_name}</p>
                <p className="text-xs text-gray-600">Brand: {item.brand} | Model: {item.model_type}</p>
                <p className="text-xs text-gray-600">Category: {item.category}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">{item.quantity_in_stock}</p>
                <p className="text-xs text-gray-600">Reorder Level: {item.reorder_level}</p>
              </div>
            </div>
          ))}
        </div>
      </div>      
    </div>
  )
}

function KPICard({ title, value, change, icon, bgColor, textColor }) {
  return (
    <Card className="border-0">
      <CardContent className="pt-3 sm:pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-slate-600 text-xs">{title}</p>
            <p className="text-lg sm:text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-slate-600 mt-1">{change}</p>
          </div>
          <div className={`${bgColor} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
            <div className={textColor}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
