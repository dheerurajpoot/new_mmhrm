"use client"

import { useEffect, useState, useCallback } from "react"

export interface PollingOptions {
  interval?: number // in milliseconds, default 5000 (5 seconds)
  enabled?: boolean
  onError?: (error: Error) => void
}

export function usePolling<T>(
  fetchFunction: () => Promise<T>,
  options: PollingOptions = {},
): {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
} {
  const { interval = 5000, enabled = true, onError } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const result = await fetchFunction()
      setData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error")
      setError(error)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, onError])

  const refetch = useCallback(async () => {
    setLoading(true)
    await fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!enabled) return

    // Initial fetch
    fetchData()

    // Set up polling
    const intervalId = setInterval(fetchData, interval)

    return () => {
      clearInterval(intervalId)
    }
  }, [fetchData, interval, enabled])

  return { data, loading, error, refetch }
}

// Specific hooks for different data types
export function usePollingLeaveRequests(employeeId?: string) {
  return usePolling(
    async () => {
      const url = employeeId ? `/api/leave-requests?employeeId=${employeeId}` : "/api/leave-requests"
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch leave requests")
      return response.json()
    },
    { interval: 10000 }, // Poll every 10 seconds for leave requests
  )
}

export function usePollingPayrollRecords(employeeId?: string) {
  return usePolling(
    async () => {
      const url = employeeId ? `/api/payroll-records?employeeId=${employeeId}` : "/api/payroll-records"
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch payroll records")
      return response.json()
    },
    { interval: 30000 }, // Poll every 30 seconds for payroll
  )
}

export function usePollingEmployeeFinances(employeeId?: string) {
  return usePolling(
    async () => {
      const url = employeeId ? `/api/employee-finances?employeeId=${employeeId}` : "/api/employee-finances"
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch employee finances")
      return response.json()
    },
    { interval: 60000 }, // Poll every minute for finances
  )
}

export function usePollingTimeEntries(employeeId?: string) {
  return usePolling(
    async () => {
      const url = employeeId ? `/api/time-entries?employeeId=${employeeId}` : "/api/time-entries"
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch time entries")
      return response.json()
    },
    { interval: 15000 }, // Poll every 15 seconds for time entries
  )
}
