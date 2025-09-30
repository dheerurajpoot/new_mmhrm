"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav"
import { DashboardHeader } from "@/components/shared/dashboard-header"
import { EmployeeManagement } from "./employee-management"
import { LeaveApprovals } from "./leave-approvals"
import { AttendanceOverview } from "./attendance-overview"
import { HRStats } from "./hr-stats"
import { RecruitmentOnboarding } from "./recruitment-onboarding"
import { PerformanceProductivity } from "./performance-productivity"
import { CompliancePolicies } from "./compliance-policies"
import { AdminProfile } from "../admin/admin-profile"

export function HRDashboard() {
  const [activeSection, setActiveSection] = useState("overview")

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
        return <HRStats />
      case "employees":
        return <EmployeeManagement />
      case "leaves":
        return <LeaveApprovals />
      case "attendance":
        return <AttendanceOverview />
      case "recruitment":
        return <RecruitmentOnboarding />
      case "performance":
        return <PerformanceProductivity />
      case "compliance":
        return <CompliancePolicies />
      case "profile":
        return <AdminProfile />
      default:
        return <HRStats />
    }
  }

  const getSectionTitle = () => {
    switch (activeSection) {
      case "overview":
        return { title: "HR Dashboard", description: "Overview of employee metrics and HR activities" }
      case "employees":
        return { title: "Employee Management", description: "Manage employee profiles and information" }
      case "leaves":
        return { title: "Leave Requests", description: "Review and approve employee leave requests" }
      case "attendance":
        return { title: "Attendance Overview", description: "Monitor employee attendance and time tracking" }
      case "recruitment":
        return { title: "Recruitment & Onboarding", description: "Manage job postings, candidates, and onboarding" }
      case "performance":
        return { title: "Performance & Productivity", description: "Track performance reviews, goals, and metrics" }
      case "compliance":
        return { title: "Compliance & Policies", description: "Manage policies, compliance tracking, and audits" }
      case "profile":
        return { title: "My Profile", description: "View and update your personal information" }
      default:
        return { title: "HR Dashboard", description: "Manage employees, leave requests, and attendance" }
    }
  }

  const { title, description } = getSectionTitle()

  return (
    <SidebarProvider>
      <AppSidebar role="hr" />
      <SidebarInset>
        <DashboardHeader 
          title={title} 
          description={description} 
          role="hr" 
        />
        <div className="flex-1 p-4 pb-20 md:pb-4">{renderContent()}</div>
      </SidebarInset>
      <MobileBottomNav role="hr" activeSection={activeSection} onNavigate={setActiveSection} />
    </SidebarProvider>
  )
}
