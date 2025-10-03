"use client"

import { useState, useEffect, Suspense, lazy } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav"
import { DashboardHeader } from "@/components/shared/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSectionData } from "@/hooks/use-section-data"

// Lazy load components for better performance
const UserManagement = lazy(() => import("./user-management").then(module => ({ default: module.UserManagement })))
const AdminStats = lazy(() => import("./admin-stats").then(module => ({ default: module.AdminStats })))
const EmployeeManagement = lazy(() => import("./employee-management").then(module => ({ default: module.EmployeeManagement })))
const FinancialManagement = lazy(() => import("./financial-management").then(module => ({ default: module.FinancialManagement })))
const LeaveManagement = lazy(() => import("./leave-management").then(module => ({ default: module.LeaveManagement })))
const AdminSettings = lazy(() => import("./admin-settings").then(module => ({ default: module.AdminSettings })))
const TeamManagement = lazy(() => import("./team-management").then(module => ({ default: module.TeamManagement })))
const AttendanceManagement = lazy(() => import("./attendance-management").then(module => ({ default: module.AttendanceManagement })))
const AdminProfile = lazy(() => import("./admin-profile").then(module => ({ default: module.AdminProfile })))

// Loading skeleton component
const SectionSkeleton = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  
  // Use section-based data loading
  const { data: sectionData, loading: sectionLoading, error: sectionError } = useSectionData(activeSection, {
    enabled: true,
    refetchOnMount: true
  })

  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      setActiveSection(event.detail)
    }

    window.addEventListener("sidebarNavigation", handleNavigation as EventListener)
    return () => window.removeEventListener("sidebarNavigation", handleNavigation as EventListener)
  }, [])

  const renderContent = () => {
    if (sectionLoading) {
      return <SectionSkeleton />
    }

    if (sectionError) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{sectionError.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    switch (activeSection) {
      case "overview":
        return (
          <Suspense fallback={<SectionSkeleton />}>
            <AdminStats sectionData={sectionData} />
          </Suspense>
        )
      case "users":
        return (
          <Suspense fallback={<SectionSkeleton />}>
            <UserManagement sectionData={sectionData} />
          </Suspense>
        )
      case "teams":
        return (
          <Suspense fallback={<SectionSkeleton />}>
            <TeamManagement sectionData={sectionData} />
          </Suspense>
        )
      case "employees":
        return (
          <Suspense fallback={<SectionSkeleton />}>
            <EmployeeManagement currentUserRole="admin" sectionData={sectionData} />
          </Suspense>
        )
      case "finances":
        return (
          <Suspense fallback={<SectionSkeleton />}>
            <FinancialManagement sectionData={sectionData} />
          </Suspense>
        )
      case "leaves":
        return (
          <Suspense fallback={<SectionSkeleton />}>
            <LeaveManagement sectionData={sectionData} />
          </Suspense>
        )
      case "attendance":
        return (
          <Suspense fallback={<SectionSkeleton />}>
            <AttendanceManagement sectionData={sectionData} />
          </Suspense>
        )
      case "profile":
        return (
          <Suspense fallback={<SectionSkeleton />}>
            <AdminProfile sectionData={sectionData} />
          </Suspense>
        )
      case "settings":
        return (
          <Suspense fallback={<SectionSkeleton />}>
            <AdminSettings sectionData={sectionData} />
          </Suspense>
        )
      default:
        return (
          <Suspense fallback={<SectionSkeleton />}>
            <AdminStats sectionData={sectionData} />
          </Suspense>
        )
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
