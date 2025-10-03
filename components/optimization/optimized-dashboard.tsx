"use client";

import { Suspense, lazy, useEffect } from "react";
import { CriticalCSS, SkeletonLoader, ProgressiveLoader, useLCPOptimization, ResourceHints } from "@/components/optimization/critical-css";

// Lazy load dashboard components
const AdminDashboard = lazy(() => import("@/components/admin/admin-dashboard"));
const EmployeeDashboard = lazy(() => import("@/components/employee/employee-dashboard"));
const HRDashboard = lazy(() => import("@/components/hr/hr-dashboard"));

interface OptimizedDashboardProps {
  role: string;
  children?: React.ReactNode;
}

// Dashboard skeleton component
function DashboardSkeleton() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="flex items-center gap-4">
          <SkeletonLoader width="120px" height="40px" />
          <SkeletonLoader width="200px" height="20px" />
        </div>
        <div className="flex items-center gap-4">
          <SkeletonLoader width="80px" height="32px" />
          <SkeletonLoader width="40px" height="40px" className="rounded-full" />
        </div>
      </div>
      
      <div className="dashboard-content">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="dashboard-card">
            <div className="mb-4">
              <SkeletonLoader width="60%" height="24px" className="mb-2" />
              <SkeletonLoader width="40%" height="16px" />
            </div>
            <div className="space-y-2">
              <SkeletonLoader width="100%" height="16px" />
              <SkeletonLoader width="80%" height="16px" />
              <SkeletonLoader width="60%" height="16px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Optimized dashboard wrapper
export function OptimizedDashboard({ role, children }: OptimizedDashboardProps) {
  // Apply LCP optimizations
  useLCPOptimization();

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      case 'hr':
        return <HRDashboard />;
      default:
        return children;
    }
  };

  return (
    <>
      <CriticalCSS />
      <ResourceHints />
      
      <ProgressiveLoader 
        fallback={<DashboardSkeleton />}
        delay={50}
      >
        <Suspense fallback={<DashboardSkeleton />}>
          {renderDashboard()}
        </Suspense>
      </ProgressiveLoader>
    </>
  );
}

// Preload dashboard components
export function preloadDashboardComponents() {
  if (typeof window === 'undefined') return;

  // Preload dashboard components
  const components = [
    () => import("@/components/admin/admin-dashboard"),
    () => import("@/components/employee/employee-dashboard"),
    () => import("@/components/hr/hr-dashboard"),
  ];

  components.forEach(component => {
    component();
  });
}

// Critical resource preloader
export function CriticalResourcePreloader() {
  useEffect(() => {
    // Preload critical API endpoints
    const criticalAPIs = [
      '/api/dashboard/sections',
      '/api/employees',
      '/api/leave-requests',
      '/api/teams'
    ];

    criticalAPIs.forEach(api => {
      fetch(api, { 
        method: 'HEAD',
        cache: 'force-cache'
      }).catch(() => {
        // Ignore errors, just preload
      });
    });

    // Preload critical images
    const criticalImages = [
      '/placeholder-logo.png',
      '/placeholder-user.jpg',
      '/placeholder.jpg'
    ];

    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });

  }, []);

  return null;
}
