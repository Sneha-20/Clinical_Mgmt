'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Phone, Mail, MapPin, Calendar } from 'lucide-react'

export default function PatientProfile({ patientId, onBack }) {
  const [patient] = useState({
    id: 1,
    name: 'Rajesh Kumar',
    age: 62,
    gender: 'Male',
    phone: '9876543210',
    secondaryPhone: '9876543211',
    email: 'rajesh@email.com',
    address: '123 Main Street',
    city: 'Mumbai',
    referralType: 'Doctor',
    doctorName: 'Dr. Sharma',
  })

  const [visitHistory] = useState([
    {
      date: '2024-01-15',
      time: '10:30 AM',
      purpose: 'New Test',
      notes: 'Pure Tone Audiometry & Tympanometry',
      status: 'Completed',
      audiologist: 'Dr. Priya'
    },
    {
      date: '2024-01-17',
      time: '2:00 PM',
      purpose: 'Trial Given',
      notes: 'Resound Key 4 - Good response',
      status: 'In Progress',
      audiologist: 'Dr. Priya'
    },
    {
      date: '2024-01-20',
      time: '11:00 AM',
      purpose: 'Booking Confirmed',
      notes: 'Device fitted - Resound Key 4',
      status: 'Completed',
      audiologist: 'Dr. Priya'
    },
    {
      date: '2024-01-25',
      time: '3:30 PM',
      purpose: 'Follow-up',
      notes: 'Device adjustment and tuning',
      status: 'Scheduled',
      audiologist: 'Dr. Rajesh'
    },
  ])

  const [bills] = useState([
    {
      id: 'INV-001',
      date: '2024-01-20',
      amount: 49500,
      status: 'Paid',
      items: 'Resound Key 4 + Accessories'
    },
    {
      id: 'INV-002',
      date: '2024-01-25',
      amount: 1500,
      status: 'Pending',
      items: 'Service & Adjustment'
    }
  ])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="w-8 h-8 sm:w-10 sm:h-10">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">{patient.name}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Patient ID: #{patient.id}</p>
        </div>
      </div>

      {/* Patient Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Age</p>
              <p className="font-semibold text-sm sm:text-base">{patient.age} years</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Gender</p>
              <p className="font-semibold text-sm sm:text-base">{patient.gender}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Referral Type</p>
              <p className="font-semibold text-sm sm:text-base">{patient.referralType}</p>
            </div>
            {patient.doctorName && (
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Doctor</p>
                <p className="font-semibold text-sm sm:text-base">{patient.doctorName}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div className="flex items-start gap-2 sm:gap-3">
              <Phone className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Primary</p>
                <p className="font-medium text-xs sm:text-sm">{patient.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <Phone className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Secondary</p>
                <p className="font-medium text-xs sm:text-sm">{patient.secondaryPhone}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="font-medium text-xs sm:text-sm">{patient.address}, {patient.city}</p>
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
              <p className="text-xs sm:text-sm text-muted-foreground">Total Visits</p>
              <p className="text-xl sm:text-2xl font-bold text-accent">{visitHistory.length}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Spent</p>
              <p className="text-xl sm:text-2xl font-bold text-accent">₹{bills.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Last Visit</p>
              <p className="font-semibold text-sm">2 days ago</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visit History */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Visit History</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Complete patient visit timeline with notes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {visitHistory.map((visit, index) => (
              <div key={index} className="relative pb-3 sm:pb-4 last:pb-0">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-accent mt-2"></div>
                    {index !== visitHistory.length - 1 && (
                      <div className="w-0.5 h-12 sm:h-16 bg-border mt-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pt-0.5 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <p className="font-semibold text-xs sm:text-sm truncate">{visit.purpose}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                        visit.status === 'Completed' ? 'bg-green-100 text-green-600' :
                        visit.status === 'In Progress' ? 'bg-blue-100 text-blue-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {visit.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{visit.date} at {visit.time}</p>
                    <p className="text-xs sm:text-sm mt-1">{visit.notes}</p>
                    <p className="text-xs text-muted-foreground mt-1">By: {visit.audiologist}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bills & Transactions */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Bills & Transactions</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Invoice history and payment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {bills.map((bill) => (
              <div key={bill.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-border rounded-lg hover:bg-muted/50">
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
      </Card>
    </div>
  )
}
