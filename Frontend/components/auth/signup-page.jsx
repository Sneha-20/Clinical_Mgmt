'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function SignupPage({ onSignup, onToggleLogin }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    clinicName: '',
    role: 'reception',
    phone: '',
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const roles = [
    { id: 'reception', label: 'Reception', description: 'Patient management & billing' },
    { id: 'audiologist', label: 'Audiologist', description: 'Testing & patient care' },
    { id: 'speech', label: 'Speech Therapist', description: 'Speech therapy programs' },
    { id: 'admin', label: 'Admin/Owner', description: 'Full system access' },
  ]

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (!formData.clinicName.trim()) {
      newErrors.clinicName = 'Clinic name is required'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSuccess(false)

    if (validateForm()) {
      // Here you would typically send data to your Python backend
      console.log('Signup data:', formData)
      
      setSuccess(true)
      
      // Simulate successful signup and auto-login
      setTimeout(() => {
        onSignup(formData.role)
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-3 sm:p-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <div className="w-9 sm:w-10 h-9 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">NOIS</h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Navjeevan Operating Intelligence System</p>
        </div>

        {/* Signup Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="text-xl sm:text-2xl">Create Your Account</CardTitle>
            <CardDescription className="text-sm">Join NOIS to manage your clinic efficiently</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {success && (
              <div className="flex items-center gap-2 p-3 sm:p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg mb-4 sm:mb-6 text-sm">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                Account created successfully! Redirecting...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Full Name & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Full Name</label>
                  <Input
                    type="text"
                    name="fullName"
                    placeholder="Dr. John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="bg-input text-sm"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive mt-1">{errors.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Phone</label>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-input text-sm"
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Clinic Name */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Clinic Name</label>
                <Input
                  type="text"
                  name="clinicName"
                  placeholder="Navjeevan Clinic"
                  value={formData.clinicName}
                  onChange={handleChange}
                  className="bg-input text-sm"
                />
                {errors.clinicName && (
                  <p className="text-xs text-destructive mt-1">{errors.clinicName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="your@clinic.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-input text-sm"
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password & Confirm Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Password</label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-input text-sm"
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1">{errors.password}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Confirm Password</label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-input text-sm"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2 sm:mb-3">Select Your Role</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {roles.map(roleOption => (
                    <button
                      key={roleOption.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: roleOption.id }))}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                        formData.role === roleOption.id
                          ? 'border-primary bg-primary/5'
                          : 'border-input bg-background hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium text-sm">{roleOption.label}</div>
                      <div className="text-xs text-muted-foreground">{roleOption.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg">
                Create Account
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-4 sm:mt-6 text-center border-t pt-4 sm:pt-6">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                Already have an account?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={onToggleLogin}
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-4 sm:mt-6">
          Your clinic data is secure and protected
        </p>
      </div>
    </div>
  )
}
