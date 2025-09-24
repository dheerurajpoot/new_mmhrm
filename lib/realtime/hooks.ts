"use client"

import { useEffect, useState } from "react"
import { usePolling } from "./polling"
import { getCurrentUser } from "@/lib/auth/client"

// Hook for real-time employee data
export function useRealtimeEmployeeData() {
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    getCurrentUser().then(setCurrentUser)
  }, [])

  const { data: financeData, refetch: refetchFinances } = usePolling(
    async () => {
      if (!currentUser?.id) return null
      const response = await fetch(`/api/employee-finances?employeeId=${currentUser.id}`)
      if (!response.ok) return null
      return response.json()
    },
    { enabled: !!currentUser?.id, interval: 60000 },
  )

  const { data: payrollData, refetch: refetchPayroll } = usePolling(
    async () => {
      if (!currentUser?.id) return []
      const response = await fetch(`/api/payroll-records?employeeId=${currentUser.id}`)
      if (!response.ok) return []
      return response.json()
    },
    { enabled: !!currentUser?.id, interval: 30000 },
  )

  const { data: leaveRequests, refetch: refetchLeave } = usePolling(
    async () => {
      if (!currentUser?.id) return []
      const response = await fetch(`/api/leave-requests?employeeId=${currentUser.id}`)
      if (!response.ok) return []
      return response.json()
    },
    { enabled: !!currentUser?.id, interval: 10000 },
  )

  const { data: leaveBalances, refetch: refetchBalances } = usePolling(
    async () => {
      if (!currentUser?.id) return []
      const response = await fetch(`/api/leave-balances?employeeId=${currentUser.id}`)
      if (!response.ok) return []
      return response.json()
    },
    { enabled: !!currentUser?.id, interval: 30000 },
  )

  return {
    financeData,
    payrollData,
    leaveRequests,
    leaveBalances,
    refetch: {
      finances: refetchFinances,
      payroll: refetchPayroll,
      leave: refetchLeave,
      balances: refetchBalances,
    },
  }
}

// Hook for real-time notifications
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const handleDataUpdate = (event: CustomEvent) => {
      const { type, message } = event.detail

      const notification = {
        id: Date.now(),
        type,
        message,
        timestamp: new Date(),
      }

      setNotifications((current) => [notification, ...current.slice(0, 9)]) // Keep last 10
    }

    window.addEventListener("data-update", handleDataUpdate as EventListener)

    return () => {
      window.removeEventListener("data-update", handleDataUpdate as EventListener)
    }
  }, [])

  const clearNotification = (id: number) => {
    setNotifications((current) => current.filter((notif) => notif.id !== id))
  }

  return { notifications, clearNotification }
}

// Hook for subscription to specific data types
export function useRealtimeSubscription<T>(
  fetchUrl: string,
  options: { interval?: number; enabled?: boolean } = {},
): [T[], boolean] {
  const { data, loading } = usePolling(async () => {
    const response = await fetch(fetchUrl)
    if (!response.ok) throw new Error(`Failed to fetch from ${fetchUrl}`)
    return response.json()
  }, options)

  return [data || [], loading]
}
