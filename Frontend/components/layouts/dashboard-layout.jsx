'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, Menu, X } from 'lucide-react'
import ReceptionDashboard from '@/components/modules/reception/dashboard'
import AudiologistDashboard from '@/components/modules/audiologist/dashboard'
import AdminDashboard from '@/components/modules/admin/dashboard'
import InventoryManagement from '@/components/modules/reception/inventory-management'

export default function DashboardLayout({ role, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderDashboard = () => {
    switch (role) {
      case 'Reception':
        return activeTab === 'inventory' ? <InventoryManagement /> : <ReceptionDashboard />
      case 'Audiologist':
        return <AudiologistDashboard />
      case 'Admin':
        return <AdminDashboard />
      default:
        return <div>Coming Soon</div>
    }
  }

  const getRoleLabel = () => {
    const labels = {
      reception: 'Reception Staff',
      audiologist: 'Audiologist',
      speech: 'Speech Therapist',
      admin: 'Admin'
    }
    return labels[role]
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`${
        sidebarOpen ? 'w-64' : 'w-0'
      } lg:w-64 bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col fixed lg:static h-full z-50 lg:z-auto`}>
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-sidebar-foreground">NOIS</span>
          </div>
        </div>

        {/* Role Badge */}
        <div className="px-4 py-3 text-xs">
          <div className="px-2 py-1 bg-sidebar-accent/20 text-sidebar-accent rounded-md text-center font-medium">
            {getRoleLabel()}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto test">
          {role === 'Reception' && (
            <>
              <NavItem 
                icon="👥" 
                label="Patients" 
                active={activeTab === 'dashboard'}
                onClick={() => {
                  setActiveTab('dashboard')
                  setSidebarOpen(false)
                }}
              />
              <NavItem icon="📝" label="Registration" onClick={() => setSidebarOpen(false)} />
              <NavItem 
                icon="📦" 
                label="Inventory" 
                active={activeTab === 'inventory'}
                onClick={() => {
                  setActiveTab('inventory')
                  setSidebarOpen(false)
                }}
              />
              <NavItem icon="💰" label="Billing" onClick={() => setSidebarOpen(false)} />
            </>
          )}
          {role === 'Audiologist' && (
            <>
              <NavItem icon="👁️" label="Patient Queue" onClick={() => setSidebarOpen(false)} />
              <NavItem icon="📋" label="Case History" onClick={() => setSidebarOpen(false)} />
              <NavItem icon="🔊" label="Tests" onClick={() => setSidebarOpen(false)} />
              <NavItem icon="📱" label="Trials" onClick={() => setSidebarOpen(false)} />
            </>
          )}
          {role === 'Admin' && (
            <>
              <NavItem icon="📊" label="Dashboard" onClick={() => setSidebarOpen(false)} />
              <NavItem icon="📈" label="Analytics" onClick={() => setSidebarOpen(false)} />
              <NavItem icon="👥" label="Staff" onClick={() => setSidebarOpen(false)} />
              <NavItem icon="📦" label="Inventory" onClick={() => setSidebarOpen(false)} />
            </>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <div className="h-14 lg:h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="text-xs lg:text-sm text-muted-foreground truncate">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Dashboard Content - Responsive padding */}
        <div className="flex-1 overflow-auto p-3 lg:p-6">
          {renderDashboard()}
        </div>
      </main>
    </div>
  )
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
        active 
          ? 'bg-sidebar-accent/20 text-sidebar-accent' 
          : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
      }`}
    >
      <span className="text-lg flex-shrink-0">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
