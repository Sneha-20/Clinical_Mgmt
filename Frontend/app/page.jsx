'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginPage from '@/components/auth/login-page'
import SignupPage from '@/components/auth/signup-page'

export default function Home() {
  const [showSignup, setShowSignup] = useState(false)
  const router = useRouter()

  const handleLogin = (role) => {
    localStorage.setItem('userRole', role)
    router.push('/dashboard')
  }

  const handleSignup = (role) => {
    localStorage.setItem('userRole', role)
    // router.push('/dashboard')
  }

  return showSignup ? (
    <SignupPage 
      onSignup={handleSignup}
      onToggleLogin={() => setShowSignup(false)}
    />
  ) : (
    <LoginPage 
      onLogin={handleLogin}
      onToggleSignup={() => setShowSignup(true)}
    />
  )
}
