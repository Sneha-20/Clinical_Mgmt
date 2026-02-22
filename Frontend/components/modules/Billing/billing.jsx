'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { X, Download, Printer } from 'lucide-react'
import TextArea from '@/components/ui/TextArea'

export default function BillingForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    patientName: '',
    deviceModel: 'Resound Key 4',
    serialNumber: 'RS-2024-001',
    price: 45000,
    discount: 10,
    gst: 18,
    paymentMode: 'cash',
    notes: '',
  })

  const discountedPrice = formData.price - (formData.price * formData.discount / 100)
  const gstAmount = discountedPrice * formData.gst / 100
  const totalAmount = discountedPrice + gstAmount

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...formData, totalAmount })
  }

  return (
    <div>
      <Card className="w-full my-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 bg-card">
          <CardTitle className="text-lg sm:text-xl">Generate Bill</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Patient & Device Info */}
            <div>
              <h3 className="font-semibold text-primary mb-4 text-sm sm:text-base">Bill Information</h3>
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
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Device Model</label>
                  <Input
                    value={formData.deviceModel}
                    onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                    placeholder="Device model"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Serial Number</label>
                  <Input
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="Serial number"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                  >
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="card">Card</option>
                    <option value="transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm">Base Price:</span>
                <span className="font-semibold">₹{formData.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm">Discount ({formData.discount}%):</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) })}
                    className="w-16 sm:w-20 text-sm"
                  />
                  <span className="font-semibold">-₹{(formData.price * formData.discount / 100).toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t border-border pt-2 sm:pt-3 flex justify-between items-center">
                <span className="text-xs sm:text-sm">Subtotal:</span>
                <span className="font-semibold">₹{discountedPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm">GST ({formData.gst}%):</span>
                <span className="font-semibold">₹{gstAmount.toLocaleString()}</span>
              </div>
              <div className="border-t border-border pt-2 sm:pt-3 flex justify-between items-center text-base sm:text-lg">
                <span className="font-bold">Total Amount:</span>
                <span className="font-bold text-accent">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5">Additional Notes</label>
              <TextArea
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Warranty terms, service conditions, etc..."
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                rows={3}
              />
            </div>

            {/* Submit */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} className="gap-2 w-full sm:w-auto">
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button type="button" variant="outline" className="gap-2 w-full sm:w-auto">
                <Printer className="w-4 h-4" />
                Print Preview
              </Button>
              <Button type="submit" className="gap-2 w-full sm:w-auto">
                <Download className="w-4 h-4" />
                Generate Bill
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
