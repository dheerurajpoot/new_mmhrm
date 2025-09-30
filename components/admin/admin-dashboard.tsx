"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav"
import { DashboardHeader } from "@/components/shared/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserManagement } from "./user-management"
import { AdminStats } from "./admin-stats"
import { EmployeeManagement } from "./employee-management"
import { FinancialManagement } from "./financial-management"
import { LeaveManagement } from "./leave-management"
import { AdminSettings } from "./admin-settings"
import { TeamManagement } from "./team-management"
import { AttendanceManagement } from "./attendance-management"
import { AdminProfile } from "./admin-profile"

export function AdminDashboard() {
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
        return <AdminStats />
      case "users":
        return <UserManagement />
      case "teams":
        return <TeamManagement />
      case "employees":
        return <EmployeeManagement currentUserRole="admin" />
      case "finances":
        return <FinancialManagement />
      case "leaves":
        return <LeaveManagement />
      case "attendance":
        return <AttendanceManagement />
      case "profile":
        return <AdminProfile />
      case "settings":
        return <AdminSettings />
      default:
        return <AdminStats />
    }
  }

  const getSectionTitle = () => {
    switch (activeSection) {
      case "overview":
        return { title: "Admin Dashboard", description: "Overview of system metrics and user activity" }
      case "users":
        return { title: "User Management", description: "Manage users, roles, and permissions" }
      case "teams":
        return { title: "Team Management", description: "Create and manage teams for better collaboration" }
      case "employees":
        return { title: "Employee Management", description: "Manage employees, roles, and permissions" }
      case "finances":
        return { title: "Financial Management", description: "Manage payroll, compensation, and finances" }
      case "leaves":
        return { title: "Leave Management", description: "Manage leave requests, balances, and types" }
      case "attendance":
        return { title: "Attendance Management", description: "Monitor and manage employee attendance and time tracking" }
      case "profile":
        return { title: "My Profile", description: "View and update your personal information" }
      case "settings":
        return { title: "System Settings", description: "Configure system-wide settings and preferences" }
      default:
        return { title: "Admin Dashboard", description: "Manage users, roles, and system settings" }
    }
  }

  const { title, description } = getSectionTitle()

  return (
    <SidebarProvider>
      <AppSidebar role="admin" />
      <SidebarInset>
        <DashboardHeader 
          title={title} 
          description={description} 
          role="admin" 
        />
        <div className="flex-1 p-4 pb-20 md:pb-4">{renderContent()}</div>
      </SidebarInset>
      <MobileBottomNav role="admin" activeSection={activeSection} onNavigate={setActiveSection} />
    </SidebarProvider>
  )
}
