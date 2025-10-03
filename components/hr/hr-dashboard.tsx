"use client"

import { useState, useEffect, Suspense, lazy } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav"
import { DashboardHeader } from "@/components/shared/dashboard-header"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useSectionData } from "@/hooks/use-section-data"

// Lazy load components for better performance
const EmployeeManagement = lazy(() => import("./employee-management").then(module => ({ default: module.EmployeeManagement })))
const LeaveApprovals = lazy(() => import("./leave-approvals").then(module => ({ default: module.LeaveApprovals })))
const AttendanceOverview = lazy(() => import("./attendance-overview").then(module => ({ default: module.AttendanceOverview })))
const HRStats = lazy(() => import("./hr-stats").then(module => ({ default: module.HRStats })))
const RecruitmentOnboarding = lazy(() => import("./recruitment-onboarding").then(module => ({ default: module.RecruitmentOnboarding })))
const PerformanceProductivity = lazy(() => import("./performance-productivity").then(module => ({ default: module.PerformanceProductivity })))
const CompliancePolicies = lazy(() => import("./compliance-policies").then(module => ({ default: module.CompliancePolicies })))
const AdminProfile = lazy(() => import("../admin/admin-profile").then(module => ({ default: module.AdminProfile })))

// Loading skeleton component
const HRSectionSkeleton = () => (
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

export function HRDashboard() {
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
      return <HRSectionSkeleton />
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
          <Suspense fallback={<HRSectionSkeleton />}>
            <HRStats sectionData={sectionData} />
          </Suspense>
        )
      case "employees":
        return (
          <Suspense fallback={<HRSectionSkeleton />}>
            <EmployeeManagement sectionData={sectionData} />
          </Suspense>
        )
      case "leaves":
        return (
          <Suspense fallback={<HRSectionSkeleton />}>
            <LeaveApprovals sectionData={sectionData} />
          </Suspense>
        )
      case "attendance":
        return (
          <Suspense fallback={<HRSectionSkeleton />}>
            <AttendanceOverview sectionData={sectionData} />
          </Suspense>
        )
      case "recruitment":
        return (
          <Suspense fallback={<HRSectionSkeleton />}>
            <RecruitmentOnboarding sectionData={sectionData} />
          </Suspense>
        )
      case "performance":
        return (
          <Suspense fallback={<HRSectionSkeleton />}>
            <PerformanceProductivity sectionData={sectionData} />
          </Suspense>
        )
      case "compliance":
        return (
          <Suspense fallback={<HRSectionSkeleton />}>
            <CompliancePolicies sectionData={sectionData} />
          </Suspense>
        )
      case "profile":
        return (
          <Suspense fallback={<HRSectionSkeleton />}>
            <AdminProfile sectionData={sectionData} />
          </Suspense>
        )
      default:
        return (
          <Suspense fallback={<HRSectionSkeleton />}>
            <HRStats sectionData={sectionData} />
          </Suspense>
        )
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
