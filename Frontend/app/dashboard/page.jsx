'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ReceptionDashboard from '@/components/modules/reception/dashboard'
import AudiologistDashboard from '@/components/modules/audiologist/dashboard'
import AdminDashboard from '@/components/modules/admin/dashboard'

export default function Dashboard() {
  const [userRole, setUserRole] = useState('')
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) {
      router.push('/')
    } else {
      setUserRole(role)
    }
  }, [router])

  const renderDashboard = () => {
    switch (userRole) {
      case 'Reception':
        return <ReceptionDashboard />
      case 'Audiologist':
        return <AudiologistDashboard />
      case 'Admin':
        return <AdminDashboard />
      case 'Speech':
        return <div className="text-center py-12"><p className="text-muted-foreground">Speech Therapist Dashboard - Coming Soon</p></div>
      default:
        return <ReceptionDashboard />
    }
  }

  if (!userRole) {
    return null
  }

  return renderDashboard()
}
