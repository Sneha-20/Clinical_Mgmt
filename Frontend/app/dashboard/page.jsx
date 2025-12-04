'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ReceptionDashboard from '@/components/modules/reception/dashboard'
import AudiologistDashboard from '@/components/modules/audiologist/dashboard'
import AdminDashboard from '@/components/modules/admin/dashboard'
import ReceptionistDashboard from '@/components/modules/receptionist/Receptionistdashboard'

export default function Dashboard() {
  const [userRole, setUserRole] = useState('')
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (!role) {
      router.push("/");
    } else if (
      role === "Audiologist" ||
      role === "Speech" ||
      role === "Audiologist &  Speech Therapist"
    ) {
      setUserRole("Doctor");
    } else {
      setUserRole(role);
    }
  }, [router]);
 
  if (!userRole) {
    return null
  }
  const renderDashboard = () => {
    switch (userRole) {
      case 'Reception':
        return <ReceptionistDashboard />
        case 'Doctor':
          return <AudiologistDashboard />
          case 'Admin':
            return <AdminDashboard />
      // case 'Speech':
      //   return <div className="text-center py-12"><p className="text-muted-foreground">Speech Therapist Dashboard - Coming Soon</p></div>
      default:
        return <ReceptionDashboard />
    }
  }

  if (!userRole) {
    return null
  }

  return renderDashboard()
}
