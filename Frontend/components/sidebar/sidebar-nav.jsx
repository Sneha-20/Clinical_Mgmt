'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Companylogo from "@/public/icon/clinic-logo.png";
import Image from 'next/image'

export default function SidebarNav({ role, onItemClick }) {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = {
    Reception: [
      { icon: '👥', label: 'Dashboard', href: '/dashboard' },
      // { icon: '📝', label: 'New Patient', href: '/dashboard/patients' },
      { icon: '📦', label: 'Inventory', href: '/dashboard/inventory' },
      { icon: '💰', label: 'Billing', href: '/dashboard/billing' },
      { icon: '👁️', label: 'Trials', href: '/dashboard/trials' },
    ],
    Audiologist: [
      { icon: '👥', label: 'Dashboard', href: '/dashboard' },
      { icon: '📋', label: 'Case History', href: '/dashboard/case-history' },
      { icon: '📊', label: 'Tests', href: '/dashboard/tests' },
      { icon: '📱', label: 'Trials', href: '/dashboard/trials' },
      { icon: '👨‍⚕️', label: 'Counselling', href: '/dashboard/counselling' },
    ],
    Admin: [
      { icon: '📊', label: 'Dashboard', href: '/dashboard' },
      { icon: '📈', label: 'Analytics', href: '/dashboard/analytics' },
      { icon: '👥', label: 'Staff', href: '/dashboard/staff' },
      { icon: '📦', label: 'Inventory', href: '/dashboard/inventory' },
      { icon: '💼', label: 'Reports', href: '/dashboard/reports' },
    ],
    Speech: [
      { icon: '👥', label: 'Dashboard', href: '/dashboard' },
      { icon: '📝', label: 'Assessment', href: '/dashboard/assessment' },
      { icon: '📊', label: 'Progress', href: '/dashboard/progress' },
      { icon: '👨‍👩‍👧', label: 'Reports', href: '/dashboard/reports' },
    ],
  }

  const items = navItems[role] || []

  return (
    <>
      {/* Logo */}
      <div className="p-[16px] border-b border-sidebar-border">
        <div className="flex items-start justify-center gap-2">
          <div className=" flex items-center justify-center">
            <Image
              width={24}
              height={24}
              src={Companylogo}
              alt="compony logo"
              className='mix-blend-multiply mt-1'
            />
          </div>
          <h1 className="text-2xl sm:text-2xl font-bold text-primary">NOIS</h1>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-4 py-3 text-xs">
        <div className="px-2 py-1 bg-sidebar-accent text-primaryText rounded-md text-center font-medium">
          {role === "speech"
            ? "Speech Therapist"
            : role.charAt(0).toUpperCase() + role.slice(1)}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto test1">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href);
                onItemClick?.();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors whitespace-nowrap text-sm font-medium ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <span className="text-lg flex-shrink-0 ">{item.icon}</span>
              <span className='text-primaryText'>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
