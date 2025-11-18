'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'

export default function PatientRegistrationForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    phone: '',
    secondaryPhone: '',
    address: '',
    city: '',
    referralType: 'self',
    doctorName: '',
    complaint: 'Hearing problem',
    testsRequired: [],
    purposeOfVisit: 'New Test',
  })

  const testsOptions = ['Pure Tone Audiometry', 'Tympanometry', 'SRT / SDS', 'UCL', 'Free Field', 'BERA / ASSR', 'OAE']

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const toggleTest = (test) => {
    setFormData({
      ...formData,
      testsRequired: formData.testsRequired.includes(test)
        ? formData.testsRequired.filter(t => t !== test)
        : [...formData.testsRequired, test]
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto my-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 sticky top-0 bg-card">
          <CardTitle className="text-lg sm:text-xl">New Patient Registration</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="font-semibold text-primary mb-3 text-sm sm:text-base">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Name *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Age *</label>
                  <Input
                    required
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Age"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Phone *</label>
                  <Input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Primary phone"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="font-semibold text-primary mb-3 text-sm sm:text-base">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Secondary Phone</label>
                  <Input
                    type="tel"
                    value={formData.secondaryPhone}
                    onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                    placeholder="Secondary phone"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    className="text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full address"
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Referral */}
            <div>
              <h3 className="font-semibold text-primary mb-3 text-sm sm:text-base">Referral Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Referral Type</label>
                  <select
                    value={formData.referralType}
                    onChange={(e) => setFormData({ ...formData, referralType: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                  >
                    <option value="self">Self Referral</option>
                    <option value="doctor">Doctor Referral</option>
                    <option value="camp">Camp</option>
                    <option value="old">Old Patient</option>
                  </select>
                </div>
                {formData.referralType === 'doctor' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5">Doctor Name</label>
                    <Input
                      value={formData.doctorName}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      placeholder="Referring doctor name"
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Chief Complaint */}
            <div>
              <h3 className="font-semibold text-primary mb-3 text-sm sm:text-base">Chief Complaint & Visit</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Present Complaint</label>
                  <select
                    value={formData.complaint}
                    onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                  >
                    <option value="Hearing problem">Hearing problem</option>
                    <option value="Speech delay">Speech delay</option>
                    <option value="Cell/battery">Cell/battery</option>
                    <option value="Machine cleaning">Machine cleaning</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Purpose of Visit</label>
                  <select
                    value={formData.purposeOfVisit}
                    onChange={(e) => setFormData({ ...formData, purposeOfVisit: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                  >
                    <option value="New Test">New Test</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Trial">Hearing Aid Trial</option>
                    <option value="Fitting">Hearing Aid Fitting</option>
                    <option value="Service">Service/Repair</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tests Required */}
            <div>
              <h3 className="font-semibold text-primary mb-3 text-sm sm:text-base">Tests Required</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {testsOptions.map((test) => (
                  <label key={test} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.testsRequired.includes(test)}
                      onChange={() => toggleTest(test)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-xs sm:text-sm">{test}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto gap-2">
                Register Patient
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
