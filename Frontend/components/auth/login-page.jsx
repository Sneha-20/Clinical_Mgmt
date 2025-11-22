'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function LoginPage({ onLogin, onToggleSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // const demoAccounts = [
  //   { email: 'reception@nois.com', password: 'demo123', role: 'reception' },
  //   { email: 'audiologist@nois.com', password: 'demo123', role: 'audiologist' },
  //   { email: 'speech@nois.com', password: 'demo123', role: 'speech' },
  //   { email: 'admin@nois.com', password: 'demo123', role: 'admin' },
  // ]

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')

    const account = demoAccounts.find(a => a.email === email && a.password === password)
    if (account) {
      onLogin(account.role)
    } else {
      setError('Invalid credentials. Try demo accounts above.')
    }
  }

  const handleDemoLogin = (role) => {
    onLogin(role)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <div className="w-9 sm:w-10 h-9 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">NOIS</h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Navjeevan Operating Intelligence System</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription className="text-sm">Sign in to your clinic account</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="your@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input text-sm"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-destructive/10 text-destructive rounded-lg text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg">
                Sign In
              </Button>
            </form>

            {/* <div className="border-t pt-4 sm:pt-6 space-y-3">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Demo Accounts:</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('reception')}
                  className="text-xs"
                >
                  Reception
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('audiologist')}
                  className="text-xs"
                >
                  Audiologist
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('speech')}
                  className="text-xs"
                >
                  Speech SLP
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('admin')}
                  className="text-xs"
                >
                  Admin
                </Button>
              </div>
            </div> */}

            <div className="border-t pt-4 sm:pt-6 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                Don't have an account?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={onToggleSignup}
                className="w-full"
              >
                Create New Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-4 sm:mt-6">
          Protected system for authorized clinic staff only
        </p>
      </div>
    </div>
  )
}
