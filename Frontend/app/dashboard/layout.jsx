'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Menu, X } from 'lucide-react'
import SidebarNav from '@/components/layouts/sidebar-nav'
import { logoutAction } from '@/lib/services/auth'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  const handleLogout = () => {
    logoutAction();
    localStorage.removeItem('userRole')
    router.push('/')
  }

  if (!userRole) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`${
        sidebarOpen ? 'w-64' : 'w-0'
      } lg:w-64 bg-sidebar border-r border-slate-200 transition-all duration-300 flex flex-col fixed lg:static h-full z-50 lg:z-auto overflow-hidden`}>
        <SidebarNav role={userRole} onItemClick={() => setSidebarOpen(false)} />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <div className="h-14 lg:h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 lg:px-6 gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="text-xs lg:text-sm text-slate-500 truncate flex-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-xs lg:text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-3 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
