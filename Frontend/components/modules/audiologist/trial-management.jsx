'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, X, CheckCircle, Clock } from 'lucide-react'

export default function TrialManagement() {
  const [trials, setTrials] = useState([
    {
      id: 1,
      patientName: 'Raj Kumar',
      deviceModel: 'Resound Key 4',
      serialNumber: 'RS-2024-001',
      domain: 'Left',
      receiverSize: 'S',
      trialDate: '2024-01-15',
      patientResponse: 'Good',
      counsellingDone: true,
      discountOffered: 10,
      followUpDate: '2024-01-17',
      status: 'pending'
    },
    {
      id: 2,
      patientName: 'Priya Singh',
      deviceModel: 'Widex Moment',
      serialNumber: 'WX-2024-045',
      domain: 'Bilateral',
      receiverSize: 'M',
      trialDate: '2024-01-14',
      patientResponse: 'Very Good',
      counsellingDone: true,
      discountOffered: 15,
      followUpDate: '2024-01-16',
      status: 'booked'
    }
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    patientName: '',
    deviceModel: '',
    serialNumber: '',
    domain: 'Left',
    receiverSize: 'S',
    patientResponse: 'Good',
    counsellingDone: false,
    discountOffered: 0,
    followUpDate: ''
  })

  const handleAddTrial = (e) => {
    e.preventDefault()
    const newTrial = {
      id: trials.length + 1,
      ...formData,
      trialDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    }
    setTrials([...trials, newTrial])
    setShowAddForm(false)
    setFormData({
      patientName: '',
      deviceModel: '',
      serialNumber: '',
      domain: 'Left',
      receiverSize: 'S',
      patientResponse: 'Good',
      counsellingDone: false,
      discountOffered: 0,
      followUpDate: ''
    })
  }

  const handleUpdateStatus = (id, status) => {
    setTrials(trials.map(trial =>
      trial.id === id ? { ...trial, status } : trial
    ))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">Trial Management</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Track and manage device trials</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Trial
        </Button>
      </div>

      {/* Add Trial Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto my-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 sticky top-0 bg-card">
              <CardTitle className="text-lg sm:text-xl">Add New Trial</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <form onSubmit={handleAddTrial} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5">Patient Name *</label>
                    <Input
                      required
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      placeholder="Patient name"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5">Device Model *</label>
                    <Input
                      required
                      value={formData.deviceModel}
                      onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                      placeholder="Device model"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5">Serial Number *</label>
                    <Input
                      required
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      placeholder="Serial number"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5">Ear Domain</label>
                    <select
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                    >
                      <option value="Left">Left</option>
                      <option value="Right">Right</option>
                      <option value="Bilateral">Bilateral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5">Receiver Size</label>
                    <select
                      value={formData.receiverSize}
                      onChange={(e) => setFormData({ ...formData, receiverSize: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                    >
                      <option value="S">Small</option>
                      <option value="M">Medium</option>
                      <option value="L">Large</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5">Patient Response</label>
                    <select
                      value={formData.patientResponse}
                      onChange={(e) => setFormData({ ...formData, patientResponse: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                    >
                      <option value="Good">Good</option>
                      <option value="Very Good">Very Good</option>
                      <option value="Neutral">Neutral</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5">Discount Offered (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountOffered}
                      onChange={(e) => setFormData({ ...formData, discountOffered: parseInt(e.target.value) })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5">Follow-up Date</label>
                    <Input
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="counselling"
                    checked={formData.counsellingDone}
                    onChange={(e) => setFormData({ ...formData, counsellingDone: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="counselling" className="text-xs sm:text-sm font-medium">
                    Counselling Done
                  </label>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    Add Trial
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trials Table */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Active Trials</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Total: {trials.length}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm min-w-max sm:min-w-0">
            <thead className="border-b border-border">
              <tr className="text-muted-foreground">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-medium">Patient</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-medium">Device</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-medium">Response</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-medium">Discount</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-medium">Status</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trials.map((trial) => (
                <tr key={trial.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-2 sm:py-3 px-2 sm:px-3">
                    <div>
                      <p className="font-medium text-xs sm:text-sm">{trial.patientName}</p>
                      <p className="text-xs text-muted-foreground">{trial.trialDate}</p>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3">
                    <div className="text-xs sm:text-sm">{trial.deviceModel}</div>
                    <div className="text-xs text-muted-foreground">{trial.serialNumber}</div>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3">
                    <span className="text-xs sm:text-sm font-medium">{trial.patientResponse}</span>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3">
                    <span className="text-xs sm:text-sm font-medium text-accent">{trial.discountOffered}%</span>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                      trial.status === 'booked' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {trial.status === 'booked' ? 'Booked' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 text-center">
                    {trial.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(trial.id, 'booked')}
                        className="text-xs"
                      >
                        Book Now
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
