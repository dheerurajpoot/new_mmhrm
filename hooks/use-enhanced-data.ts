"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth/client";

// Enhanced section data hook with React Query
export function useSectionDataQuery(section: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ["dashboard", "section", section],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/sections?section=${section}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${section} data: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: enabled && !!section,
    staleTime: 2 * 60 * 1000, // 2 minutes for section data
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Dashboard overview hook
export function useDashboardOverviewQuery(role: string) {
  return useQuery({
    queryKey: ["dashboard", "overview", role],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/sections?section=overview`);
      if (!response.ok) {
        throw new Error(`Failed to fetch overview data: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minute for overview
    gcTime: 3 * 60 * 1000, // 3 minutes garbage collection
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// User data hook
export function useUserQuery() {
  return useQuery({
    queryKey: ["user", "current"],
    queryFn: getCurrentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes for user data
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

// Employees data hook
export function useEmployeesQuery() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      return response.json();
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Leave requests hook
export function useLeaveRequestsQuery() {
  return useQuery({
    queryKey: ["leave-requests"],
    queryFn: async () => {
      const response = await fetch("/api/leave-requests");
      if (!response.ok) {
        throw new Error("Failed to fetch leave requests");
      }
      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Teams data hook
export function useTeamsQuery() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await fetch("/api/teams");
      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Time entries hook
export function useTimeEntriesQuery(employeeId?: string) {
  return useQuery({
    queryKey: ["time-entries", employeeId],
    queryFn: async () => {
      const url = employeeId ? `/api/time-entries?employeeId=${employeeId}` : "/api/time-entries";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch time entries");
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Leave balances hook
export function useLeaveBalancesQuery(employeeId?: string) {
  return useQuery({
    queryKey: ["leave-balances", employeeId],
    queryFn: async () => {
      const url = employeeId ? `/api/leave-balances?employeeId=${employeeId}` : "/api/leave-balances";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch leave balances");
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Mutation hooks for data updates
export function useUpdateLeaveRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) => {
      const response = await fetch(`/api/leave-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_notes: adminNotes }),
      });
      if (!response.ok) {
        throw new Error("Failed to update leave request");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}


// Prefetch hook for better UX
export function usePrefetchSectionData() {
  const queryClient = useQueryClient();

  const prefetchSection = async (section: string) => {
    await queryClient.prefetchQuery({
      queryKey: ["dashboard", "section", section],
      queryFn: async () => {
        const response = await fetch(`/api/dashboard/sections?section=${section}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${section} data`);
        }
        return response.json();
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  return { prefetchSection };
}

// Optimistic updates hook
export function useOptimisticUpdates() {
  const queryClient = useQueryClient();

  const optimisticUpdateLeaveRequest = (id: string, status: string) => {
    queryClient.setQueryData(["leave-requests"], (oldData: any) => {
      if (!oldData) return oldData;
      return oldData.map((request: any) =>
        request.id === id ? { ...request, status } : request
      );
    });
  };

  return { optimisticUpdateLeaveRequest };
}
