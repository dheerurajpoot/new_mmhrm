"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"

interface RealtimeContextType {
  isConnected: boolean
  lastUpdate: Date | null
  connectionStatus: "connecting" | "connected" | "disconnected" | "error"
  triggerUpdate: () => void
}

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  lastUpdate: null,
  connectionStatus: "disconnected",
  triggerUpdate: () => {},
})

export function useRealtime() {
  return useContext(RealtimeContext)
}

interface RealtimeProviderProps {
  children: React.ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected",
  )

  const triggerUpdate = () => {
    setLastUpdate(new Date())
  }

  useEffect(() => {
    setConnectionStatus("connecting")

    // Simulate connection establishment
    const timer = setTimeout(() => {
      setIsConnected(true)
      setConnectionStatus("connected")
      console.log(" Polling-based real-time system initialized")
    }, 1000)

    // Set up periodic health check
    const healthCheck = setInterval(() => {
      // Simple health check - could be enhanced to ping server
      if (navigator.onLine) {
        setIsConnected(true)
        setConnectionStatus("connected")
      } else {
        setIsConnected(false)
        setConnectionStatus("disconnected")
      }
    }, 30000) // Check every 30 seconds

    // Cleanup on unmount
    return () => {
      clearTimeout(timer)
      clearInterval(healthCheck)
      setIsConnected(false)
      setConnectionStatus("disconnected")
    }
  }, [])

  useEffect(() => {
    const handleDataUpdate = (event: CustomEvent) => {
      setLastUpdate(new Date())

      // Show toast notifications based on event type
      const { type, message } = event.detail

      if (type === "leave_request_updated") {
        toast({
          title: "Leave Request Updated",
          description: message || "A leave request has been updated",
        })
      } else if (type === "payroll_created") {
        toast({
          title: "New Payroll Record",
          description: message || "A new payroll record has been created",
        })
      } else if (type === "finance_updated") {
        toast({
          title: "Finance Update",
          description: message || "Employee financial information has been updated",
        })
      }
    }

    window.addEventListener("data-update", handleDataUpdate as EventListener)

    return () => {
      window.removeEventListener("data-update", handleDataUpdate as EventListener)
    }
  }, [])

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        lastUpdate,
        connectionStatus,
        triggerUpdate,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  )
}

export function triggerDataUpdate(type: string, message?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("data-update", {
        detail: { type, message },
      }),
    )
  }
}
