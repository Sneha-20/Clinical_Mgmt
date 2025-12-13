'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Upload } from 'lucide-react'

export default function CaseHistoryForm({ patientId, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    symptoms: '',
    onset: '',
    duration: '',
    medicalHistory: '',
    familyHistory: '',
    noiseExposure: '',
    previousHearingAids: 'no',
    redFlags: '',
    testsPerformed: [],
    srtValue: '',
    sdsValue: '',
    uclValue: '',
  })

  const [uploads, setUploads] = useState({
    audiogram: null,
    tympResult: null,
    beraFile: null,
  })

  const testsOptions = ['PTA', 'Immittance', 'OAE', 'BERA/ASSR', 'SRT', 'SDS', 'UCL', 'Free Field']

  const toggleTest = (test) => {
    setFormData({
      ...formData,
      testsPerformed: formData.testsPerformed.includes(test)
        ? formData.testsPerformed.filter(t => t !== test)
        : [...formData.testsPerformed, test]
    })
  }

  const handleFileUpload = (field, file) => {
    setUploads({ ...uploads, [field]: file })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...formData, uploads })
  }

  return (
    <div>
      <Card className="w-full my-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 bg-card">
          <CardTitle className="text-lg sm:text-xl">Case History - {patientId}</CardTitle>
          {/* <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button> */}
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Audiological History */}
            <div>
              <h3 className="font-semibold text-primary mb-4 text-sm sm:text-base">Audiological History</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Symptoms & Complaints</label>
                  <textarea
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    placeholder="Describe hearing symptoms..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5">Onset (When started?)</label>
                    <Input
                      value={formData.onset}
                      onChange={(e) => setFormData({ ...formData, onset: e.target.value })}
                      placeholder="e.g., 2 years ago"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5">Duration</label>
                    <Input
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., Gradual / Sudden"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div>
              <h3 className="font-semibold text-primary mb-4 text-sm sm:text-base">Medical & Family History</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Medical History</label>
                  <textarea
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                    placeholder="Diabetes, Hypertension, etc..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Family History</label>
                  <textarea
                    value={formData.familyHistory}
                    onChange={(e) => setFormData({ ...formData, familyHistory: e.target.value })}
                    placeholder="Any hearing loss in family..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Noise Exposure History</label>
                  <textarea
                    value={formData.noiseExposure}
                    onChange={(e) => setFormData({ ...formData, noiseExposure: e.target.value })}
                    placeholder="Work environment, hobbies, etc..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Previous Experience & Red Flags */}
            <div>
              <h3 className="font-semibold text-primary mb-4 text-sm sm:text-base">Experience & Red Flags</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Previous Hearing Aid Experience</label>
                  <select
                    value={formData.previousHearingAids}
                    onChange={(e) => setFormData({ ...formData, previousHearingAids: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                  >
                    <option value="no">No</option>
                    <option value="yes-current">Yes - Currently Using</option>
                    <option value="yes-past">Yes - Used in Past</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Red Flags (if any)</label>
                  <textarea
                    value={formData.redFlags}
                    onChange={(e) => setFormData({ ...formData, redFlags: e.target.value })}
                    placeholder="Unilateral loss, sudden onset, etc..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Tests Performed */}
            <div>
              <h3 className="font-semibold text-primary mb-4 text-sm sm:text-base">Tests Performed</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {testsOptions.map((test) => (
                  <label key={test} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.testsPerformed.includes(test)}
                      onChange={() => toggleTest(test)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-xs sm:text-sm">{test}</span>
                  </label>
                ))}
              </div>

              {/* Test Values */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">SRT Value (dB)</label>
                  <Input
                    type="number"
                    value={formData.srtValue}
                    onChange={(e) => setFormData({ ...formData, srtValue: e.target.value })}
                    placeholder="e.g., 45"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">SDS Value (%)</label>
                  <Input
                    type="number"
                    value={formData.sdsValue}
                    onChange={(e) => setFormData({ ...formData, sdsValue: e.target.value })}
                    placeholder="e.g., 92"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">UCL Value (dB)</label>
                  <Input
                    type="number"
                    value={formData.uclValue}
                    onChange={(e) => setFormData({ ...formData, uclValue: e.target.value })}
                    placeholder="e.g., 105"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div>
              <h3 className="font-semibold text-primary mb-4 text-sm sm:text-base">Upload Test Results</h3>
              <div className="space-y-2 sm:space-y-3">
                <FileUploadField
                  label="Audiogram (Image/PDF)"
                  onFileChange={(file) => handleFileUpload('audiogram', file)}
                />
                <FileUploadField
                  label="Tympanometry Result"
                  onFileChange={(file) => handleFileUpload('tympResult', file)}
                />
                <FileUploadField
                  label="BERA/ASSR File"
                  onFileChange={(file) => handleFileUpload('beraFile', file)}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto gap-2">
                Save Case History
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function FileUploadField({ label, onFileChange }) {
  const [fileName, setFileName] = useState(null)

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-3 sm:p-4 text-center hover:bg-muted/50 cursor-pointer transition-colors">
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => {
          const file = e.target.files?.[0] || null
          onFileChange(file)
          setFileName(file?.name || null)
        }}
        className="hidden"
        id={`upload-${label}`}
      />
      <label htmlFor={`upload-${label}`} className="cursor-pointer flex flex-col items-center gap-2">
        <Upload className="w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground" />
        <p className="text-xs sm:text-sm font-medium">{label}</p>
        {fileName && <p className="text-xs text-accent">{fileName}</p>}
      </label>
    </div>
  )
}
