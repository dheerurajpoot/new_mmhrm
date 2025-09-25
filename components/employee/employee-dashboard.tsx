"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth/client"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav"
import { EmployeeProfile } from "./employee-profile"
import { LeaveBalance } from "./leave-balance"
import { TimeTracking } from "./time-tracking"
import { EmployeeFinances } from "./employee-finances"
import { EmployeeStats } from "./employee-stats"
import { TeamMembers } from "./team-members"
import { UpcomingBirthdays } from "./upcoming-birthdays"
import type { Profile } from "@/lib/types"

export function EmployeeDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)

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
            <EmployeeStats />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              <TeamMembers />
              <UpcomingBirthdays />
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
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              <TeamMembers />
              <UpcomingBirthdays />
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
