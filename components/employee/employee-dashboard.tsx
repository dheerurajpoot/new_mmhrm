"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth/client"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav"
import { EmployeeProfile } from "./employee-profile"
import { LeaveBalance } from "./leave-balance"
import { TimeTracking } from "./time-tracking"
import { TimeTrackingSimple } from "./time-tracking-simple"
import { EmployeeFinances } from "./employee-finances"
import { EmployeeStats } from "./employee-stats"
import { TeamMembers } from "./team-members"
import { UpcomingBirthdays } from "@/components/shared/upcoming-birthdays"
import { Cake } from "lucide-react"
import { useWebsiteSettings } from "@/hooks/use-website-settings"
import type { Profile } from "@/lib/types"
import { TimeTrackingWidget } from "./time-tracking-widget"

export function EmployeeDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const { settings } = useWebsiteSettings()

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user as Profile)
      } catch (error) {
        console.log(" Auth error:", error)
      }
    }
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      setActiveSection(event.detail)
    }

    window.addEventListener("sidebarNavigation", handleNavigation as EventListener)
    return () => window.removeEventListener("sidebarNavigation", handleNavigation as EventListener)
  }, [])

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
             <TimeTrackingWidget />
            <EmployeeStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <TeamMembers />
              {/* New Upcoming Birthdays Section - Same as Admin */}
              <div className="bg-gradient-to-br from-white via-pink-50/30 to-rose-50/30 rounded-2xl border border-pink-100 p-4 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md">
                      <Cake className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Upcoming Birthdays</h3>
                      <p className="text-sm text-gray-600">Celebrate your colleagues!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                    <span className="text-xs bg-pink-50 text-pink-700 border border-pink-200 px-2 py-1 rounded-full">
                      Next 10 birthdays
                    </span>
                  </div>
                </div>
                <div className="h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-transparent hover:scrollbar-thumb-pink-300">
                  <UpcomingBirthdays maxEmployees={10} showAllMonths={false} />
                </div>
              </div>
            </div>
          </div>
        )
      case "profile":
        return <EmployeeProfile />
      case "leaves":
        return <LeaveBalance />
      case "time":
        return <TimeTracking />
      case "finances":
        return <EmployeeFinances />
      default:
        return (
          <div className="space-y-6">
            <EmployeeStats />
            <TimeTrackingSimple />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <TeamMembers />
              {/* New Upcoming Birthdays Section - Same as Admin */}
              <div className="bg-gradient-to-br from-white via-pink-50/30 to-rose-50/30 rounded-2xl border border-pink-100 p-4 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md">
                      <Cake className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Upcoming Birthdays</h3>
                      <p className="text-sm text-gray-600">Celebrate your colleagues!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                    <span className="text-xs bg-pink-50 text-pink-700 border border-pink-200 px-2 py-1 rounded-full">
                      Next 10 birthdays
                    </span>
                  </div>
                </div>
                <div className="h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-transparent hover:scrollbar-thumb-pink-300">
                  <UpcomingBirthdays maxEmployees={10} showAllMonths={false} />
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  const getSectionTitle = () => {
    const firstName = currentUser?.full_name?.split(" ")[0] || "Employee"
    switch (activeSection) {
      case "overview":
        return { title: `Welcome back, ${firstName}!`, description: "Your personal dashboard and quick stats" }
      case "profile":
        return { title: "My Profile", description: "Manage your personal information and settings" }
      case "leaves":
        return { title: "Leave Balance", description: "View your leave balance and request time off" }
      case "time":
        return { title: "Time Tracking", description: "Track your work hours and attendance" }
      case "finances":
        return { title: "My Finances", description: "View your salary, payslips, and financial information" }
      default:
        return { title: `Welcome back, ${firstName}!`, description: "Manage your profile, time, and leave requests" }
    }
  }

  const { title, description } = getSectionTitle()

  return (
    <SidebarProvider>
      <AppSidebar role="employee" />
      <SidebarInset>
        <div className="flex h-14 md:h-16 shrink-0 items-center gap-2 border-b px-3 md:px-4 bg-white/80 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1" />
          
          {/* Mobile Logo and User Name - Only visible on mobile */}
          <div className="flex items-center space-x-2 md:hidden">
            {settings?.site_logo && settings.site_logo !== "/placeholder-logo.png" ? (
              <img
                src={settings.site_logo}
                alt="Logo"
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-6 h-6 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg flex items-center justify-center" style={{ display: settings?.site_logo && settings.site_logo !== "/placeholder-logo.png" ? 'none' : 'flex' }}>
              <span className="text-white font-bold text-xs">MM</span>
            </div>
          </div>
          
          <div className="flex flex-col min-w-0 flex-1">
            <h1 className="text-base md:text-lg font-semibold truncate">{title}</h1>
            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block truncate">{description}</p>
          </div>
        </div>
        <div className="flex-1 p-3 md:p-4 pb-20 md:pb-4 bg-gray-50/50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </SidebarInset>
      <MobileBottomNav role="employee" activeSection={activeSection} onNavigate={setActiveSection} />
    </SidebarProvider>
  )
}
