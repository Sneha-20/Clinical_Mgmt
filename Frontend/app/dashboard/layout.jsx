"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, User } from "lucide-react";
import SidebarNav from "@/components/sidebar/sidebar-nav";
import { logoutAction } from "@/lib/services/auth";
import CommonLoader from "@/components/ui/CommonLoader";
import {
  mapBackendRoleToSidebarRole,
  hasAccessToRoute,
  decodeToken,
} from "@/lib/utils/auth-helpers";

// Helper to get token from cookies (client-side)
function getTokenFromCookies() {
  if (typeof document === "undefined") return null;
  const name = "token=";
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is authenticated and authorized
    const role = localStorage.getItem("userRole");
    const token = getTokenFromCookies();

    if (!role || !token) {
      // Not logged in
      router.push("/login");
      return;
    }

    // Map role to sidebar role
    const mappedRole = mapBackendRoleToSidebarRole(role);
    
    if (!mappedRole) {
      // Invalid role
      logoutAction();
      router.push("/login");
      return;
    }

    // Check if user has access to current route
    if (!hasAccessToRoute(mappedRole, pathname)) {
      // User doesn't have access to this route
      router.push("/dashboard/home");
      return;
    }

    setUserRole(mappedRole);
    setIsAuthorized(true);
  }, [router, pathname]);

  if (!isAuthorized || !userRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CommonLoader />
      </div>
    );
  }

  const handleLogout = () => {
    logoutAction();
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  const handleProfileClick = () => {
    router.push("/dashboard/profile");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <CommonLoader />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } lg:w-64 bg-sidebar border-r border-slate-200 transition-all duration-300 flex flex-col fixed lg:static h-full z-50 lg:z-auto overflow-hidden print:hidden`}
      >
        <SidebarNav role={userRole} onItemClick={() => setSidebarOpen(false)} />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <div className="h-14 lg:h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 lg:px-6 gap-2 flex-shrink-0 print:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
          <div className="text-xs lg:text-sm text-slate-500 truncate flex-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProfileClick}
              className="gap-2 text-xs lg:text-sm"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
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
        </div>

        <div className="flex-1 overflow-auto p-3 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
