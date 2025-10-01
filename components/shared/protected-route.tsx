"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "hr" | "employee";
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not authenticated, redirect to login
        router.replace("/auth/login");
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        // User doesn't have the required role, redirect to their role page
        router.replace(`/${user.role}`);
        return;
      }
    }
  }, [user, loading, requiredRole, router]);

  // Show loading state while checking authentication
  if (loading) {
    return null; // No preloader during authentication check
  }

  // Show fallback or nothing while redirecting
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="border-0 shadow-xl rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has the required role
  return <>{children}</>;
}
