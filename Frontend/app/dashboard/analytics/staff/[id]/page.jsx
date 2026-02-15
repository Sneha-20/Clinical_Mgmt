"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, FileText, Activity, ShoppingCart } from 'lucide-react';
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

  console.log('Selected card:', selectedCard);

  useEffect(() => {
    fetchPerformanceData();
  }, [params.id, startDate, endDate]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('staff_id', params.id);
      if (startDate) queryParams.append('start_date', startDate);
      if (endDate) queryParams.append('end_date', endDate);
      
      const data = await getTrialPerformance(params.id, queryParams.toString());
      console.log('Performance data:', data);
      // Handle the response structure properly
      setPerformanceData(data[0] || null);
     
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
    if (value === null || value === undefined || value === '') return '-';
    const n = Number(value);
    if (Number.isNaN(n)) return value;
    return `₹${n.toFixed(2)}`;
  };

  const StatCard = ({ title, count, icon: Icon, color, onClick, details }) => (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-shadow ${selectedCard === title ? 'ring-2 ring-teal-600' : ''}`}
      onClick={() => setSelectedCard(title)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
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
        <div className="text-center py-8">
          <p className="text-gray-500">Loading performance data...</p>
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
        <div className="text-center py-8">
          <p className="text-gray-500">No performance data available</p>
          <p className="text-xs text-gray-400 mt-2">Check console for API response details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
     
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-teal-600">Staff Performance</h1>
            <p className="text-sm text-gray-600">
              {performanceData?.staff_name} - {performanceData?.role}
            </p>
          </div>
        </div>
        {startDate && endDate && (
          <div className="text-sm text-gray-500">
            Date Range: <span className="font-semibold">{startDate} to {endDate}</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceData?.role === 'Audiologist' ? (
          <>
            <StatCard
              title="Tests Conducted"
              count={performanceData?.test_count || 0}
              icon={FileText}
              color="text-blue-600"
              onClick={() => setSelectedCard('Tests Conducted')}
              details={performanceData?.test_details}
            />
            <StatCard
              title="Trials Conducted"
              count={performanceData?.trial_count || 0}
              icon={Activity}
              color="text-green-600"
              onClick={() => setSelectedCard('Trials Conducted')}
              details={performanceData?.trial_details}
            />
            <StatCard
              title="Patients Seen"
              count={performanceData?.patient_seen || 0}
              icon={Users}
              color="text-purple-600"
              onClick={() => setSelectedCard('Patients Seen')}
              details={performanceData?.patient_seen_details}
            />
            <StatCard
              title="Trials Booked"
              count={performanceData?.trials_booked || 0}
              icon={ShoppingCart}
              color="text-orange-600"
              onClick={() => setSelectedCard('Trials Booked')}
              details={performanceData?.booked_trials_details}
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
              details={performanceData?.pending_service_details}
            />
            <StatCard
              title="Follow-up Calls Made"
              count={performanceData?.calls_made_for_followup || 0}
              icon={Activity}
              color="text-green-600"
              onClick={() => setSelectedCard('Follow-up Calls Made')}
              details={performanceData?.calls_made_details}
            />
          </>
        )}
      </div>

      {/* Details Tables */}
      {selectedCard && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedCard === 'Tests Conducted' && 'Test Details'}
              {selectedCard === 'Trials Conducted' && 'Trial Details'}
              {selectedCard === 'Patients Seen' && 'Patients Seen'}
              {selectedCard === 'Trials Booked' && 'Booked Trials'}
              {selectedCard === 'Pending Services' && 'Pending Services'}
              {selectedCard === 'Follow-up Calls Made' && 'Follow-up Calls Made'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCard === 'Tests Conducted' && performanceData?.test_details?.length > 0 && (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Visit Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Status Note</TableHead>
                    <TableHead>Test Cost</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {performanceData.test_details.map((test) => (
                    <TableRow key={test.visit_id}>
                      <TableCell className="font-medium">{test.patient_name}</TableCell>
                      <TableCell>{test.patient_phone}</TableCell>
                      <TableCell>{test.visit_type}</TableCell>
                      <TableCell>{test.appointment_date}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          test.status === 'Completed with payment' ? 'bg-green-100 text-green-800' :
                          test.status === 'Test pending' ? 'bg-yellow-100 text-yellow-800' :
                          test.status === 'Device Booked' ? 'bg-blue-100 text-blue-800' :
                          test.status === 'Pending for Service' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {test.status}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{test.status_note || '-'}</TableCell>
                      <TableCell>Rs {test.cost}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {selectedCard === 'Patients Seen' && performanceData?.patient_seen_details?.length > 0 && (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Phone</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {performanceData.patient_seen_details.map((patient) => (
                    <TableRow key={patient.patient__id}>
                      <TableCell className="font-medium">{patient.patient__name}</TableCell>
                      <TableCell>{patient.patient__phone_primary}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {selectedCard === 'Pending Services' && performanceData?.pending_service_details?.length > 0 && (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Visit Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {performanceData.pending_service_details.map((service) => (
                    <TableRow key={service.visit_id}>
                      <TableCell className="font-medium">{service.patient_name}</TableCell>
                      <TableCell>{service.patient_phone}</TableCell>
                      <TableCell>{service.visit_type}</TableCell>
                      <TableCell>{service.appointment_date}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.status === 'Completed with payment' ? 'bg-green-100 text-green-800' :
                          service.status === 'Test pending' ? 'bg-yellow-100 text-yellow-800' :
                          service.status === 'Device Booked' ? 'bg-blue-100 text-blue-800' :
                          service.status === 'Pending for Service' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {service.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {selectedCard === 'Follow-up Calls Made' && performanceData?.calls_made_details?.length > 0 && (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Visit Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contacted By</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {performanceData.calls_made_details.map((call) => (
                    <TableRow key={call.visit_id}>
                      <TableCell className="font-medium">{call.patient_name}</TableCell>
                      <TableCell>{call.patient_phone}</TableCell>
                      <TableCell>{call.visit_type}</TableCell>
                      <TableCell>{call.appointment_date}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          call.status === 'Completed with payment' ? 'bg-green-100 text-green-800' :
                          call.status === 'Test pending' ? 'bg-yellow-100 text-yellow-800' :
                          call.status === 'Device Booked' ? 'bg-blue-100 text-blue-800' :
                          call.status === 'Pending for Service' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {call.status}
                        </span>
                      </TableCell>
                      <TableCell>{call.contacted_by_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {(selectedCard === 'Trials Conducted' || selectedCard === 'Trials Booked') && 
             ((selectedCard === 'Trials Conducted' ? performanceData.trial_details : performanceData.booked_trials_details)?.length > 0 ? (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Test Cost</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {(selectedCard === 'trials' ? performanceData.trial_details : performanceData.booked_trials_details).map((trial) => (
                    <TableRow key={trial.visit_id || trial.id}>
                      <TableCell className="font-medium">{trial.patient_name}</TableCell>
                      <TableCell>{trial.patient_phone}</TableCell>
                      <TableCell>{trial.appointment_date || trial.date}</TableCell>
                      <TableCell>{trial.status}</TableCell>
                      <TableCell>{trial.cost}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
