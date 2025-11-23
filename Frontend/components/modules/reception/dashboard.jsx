'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Search, Eye } from 'lucide-react'
import PatientRegistrationForm from './patient-registration-form'
import PatientProfile from './patient-profile'
import BillingForm from './billing'

export default function ReceptionDashboard() {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [showBillingForm, setShowBillingForm] = useState(false)
  const [showPatientProfile, setShowPatientProfile] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [patients, setPatients] = useState([
    { id: 1, name: 'Rajesh Kumar', phone: '9876543210', complaint: 'Hearing problem', status: 'New Test', date: '2024-01-15', device: 'Resound Key 4' },
    { id: 2, name: 'Priya Singh', phone: '9876543211', complaint: 'Follow-up', status: 'Follow-up', date: '2024-01-14', device: 'Phonak Audeo' },
    { id: 3, name: 'Amit Patel', phone: '9876543212', complaint: 'Speech delay', status: 'Assessment Pending', date: '2024-01-13', device: '-' },
  ])

  const handleAddPatient = (patientData) => {
    setPatients([...patients, { ...patientData, id: patients.length + 1, date: new Date().toISOString().split('T')[0], device: '-' }])
    setShowRegistrationForm(false)
  }

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  )

  const handleViewProfile = (patientId) => {
    setSelectedPatientId(patientId)
    setShowPatientProfile(true)
  }

  if (showPatientProfile && selectedPatientId) {
    return <PatientProfile patientId={selectedPatientId} onBack={() => setShowPatientProfile(false)} />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primaryText">Patient Management</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">Manage patient registrations and daily operations</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={() => setShowBillingForm(true)} variant="outline" className="gap-2 text-sm w-full sm:w-auto">
            💰 Bill
          </Button>
          <Button onClick={() => setShowRegistrationForm(true)} className="gap-2 text-sm w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            New Patient
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Patients" value="156" color="bg-blue-100" />
        <StatCard label="Today's Visits" value="12" color="bg-green-100" />
        <StatCard label="Pending Tests" value="5" color="bg-yellow-100" />
        <StatCard label="Follow-ups" value="8" color="bg-purple-100" />
      </div>

      {showRegistrationForm && (
        <PatientRegistrationForm
          onClose={() => setShowRegistrationForm(false)}
          onSubmit={handleAddPatient}
        />
      )}
      {showBillingForm && (
        <BillingForm
          onClose={() => setShowBillingForm(false)}
          onSubmit={() => {
            console.log('Bill generated')
            setShowBillingForm(false)
          }}
        />
      )}

      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Patient List</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Today's registrations and previous patients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex gap-2">
            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <Input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-sm"
            />
          </div>

          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-max sm:min-w-0">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-slate-600 text-left">
                  <th className="py-2 px-2 sm:px-3 font-medium">Name</th>
                  <th className="py-2 px-2 sm:px-3 font-medium hidden sm:table-cell">Phone</th>
                  <th className="py-2 px-2 sm:px-3 font-medium hidden md:table-cell">Complaint</th>
                  <th className="py-2 px-2 sm:px-3 font-medium hidden lg:table-cell">Device</th>
                  <th className="py-2 px-2 sm:px-3 font-medium">Status</th>
                  <th className="py-2 px-2 sm:px-3 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-2 px-2 sm:px-3 font-medium">{patient.name}</td>
                    <td className="py-2 px-2 sm:px-3 text-slate-600 hidden sm:table-cell">{patient.phone}</td>
                    <td className="py-2 px-2 sm:px-3 text-slate-600 hidden md:table-cell text-xs">{patient.complaint}</td>
                    <td className="py-2 px-2 sm:px-3 text-slate-600 text-xs hidden lg:table-cell">{patient.device}</td>
                    <td className="py-2 px-2 sm:px-3">
                      <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 sm:px-3 text-center">
                      <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => handleViewProfile(patient.id)}>
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <Card className="border-0">
      <CardContent className="pt-3 sm:pt-6">
        <div className={`${color} rounded-lg p-2 sm:p-4 mb-2 sm:mb-3`}></div>
        <p className="text-slate-600 text-xs sm:text-sm">{label}</p>
        <p className="text-xl sm:text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
