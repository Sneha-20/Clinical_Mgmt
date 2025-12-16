'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Clock, CheckCircle } from 'lucide-react'
import useAudiologist from '@/lib/hooks/useAudiologist'
import AppoinmentListCard from './components/AppoinmentListCard'

export default function AudiologistDashboard() {
  const {handleViewPatient,appoinementList} = useAudiologist()

  console.log("appoinementList",appoinementList)
  const [queue, setQueue] = useState([
    { id: 1, name: 'Rajesh Kumar', complaint: 'Hearing problem', testsRequired: ['PTA', 'Tympanometry'], referral: 'Doctor' },
    { id: 2, name: 'Priya Singh', complaint: 'Follow-up Trial', testsRequired: ['Free Field'], referral: 'Self' },
    { id: 3, name: 'Vijay Reddy', complaint: 'Hearing Testing', testsRequired: ['BERA', 'OAE'], referral: 'Self' },
  ])

  const [completedTests] = useState([
    { id: 1, name: 'Amit Patel', test: 'Pure Tone Audiometry', time: '10:30 AM', result: 'Mild Hearing Loss' },
    { id: 2, name: 'Neha Sharma', test: 'Tympanometry', time: '10:15 AM', result: 'Normal' },
  ])

  const [showCaseHistory, setShowCaseHistory] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)

  const handleStartTest = (patientName) => {
    setSelectedPatient(patientName)
    setShowCaseHistory(true)
  }

  const handleCaseHistorySubmit = (data) => {
    console.log('Case history submitted:', data)
    setShowCaseHistory(false)
    if (selectedPatient) {
      setQueue(queue.filter(p => p.name !== selectedPatient))
    }
    setSelectedPatient(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-600">Audiologist Dashboard</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">Manage patient queue and audiological tests</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-0">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Users className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-600 text-xs sm:text-sm">Patients in Queue</p>
                <p className="text-xl sm:text-2xl font-bold">{queue.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-600 text-xs sm:text-sm">Tests Completed</p>
                <p className="text-xl sm:text-2xl font-bold">{completedTests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Clock className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-600 text-xs sm:text-sm">Avg Test Time</p>
                <p className="text-xl sm:text-2xl font-bold">18 min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AppoinmentListCard appoinementList={appoinementList} handleViewPatient={handleViewPatient}/>

      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Tests Completed Today</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Recent audiological assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {completedTests.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 border border-slate-200 rounded-lg">
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">{item.name}</h4>
                  <p className="text-xs sm:text-sm text-slate-600">{item.test}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm font-medium">{item.result}</p>
                  <p className="text-xs text-slate-600">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
