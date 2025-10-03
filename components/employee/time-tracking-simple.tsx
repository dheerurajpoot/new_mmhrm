"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, Zap, Moon } from "lucide-react"
import { getCurrentUser } from "@/lib/auth/client"
import { toast } from "sonner"

interface TimeEntry {
  _id?: string
  employee_id: string
  date: string
  clock_in: string
  clock_out?: string
  total_hours?: number
  break_duration?: number
  notes?: string
  created_at: string
  updated_at: string
}

interface TimeTrackingSimpleProps {
  sectionData?: any;
}

export function TimeTrackingSimple({ sectionData }: TimeTrackingSimpleProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClocking, setIsClocking] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isCurrentlyClockedIn, setIsCurrentlyClockedIn] = useState(false)
  const [todayHours, setTodayHours] = useState(0)
  const [weeklyHours, setWeeklyHours] = useState(0)

  // Animation states
  const [isAnimatingIn, setIsAnimatingIn] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchTimeEntries()
    }
  }, [currentUser])

  const loadCurrentUser = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
  }

  const fetchTimeEntries = async () => {
    if (!currentUser) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/time-entries?employee_id=${currentUser.id}&limit=100`)
      const data = await response.json()

      if (response.ok) {
        setTimeEntries(data || [])
        updateStats(data || [])
      } else {
        toast.error("Failed to load time entries", {
          description: "There was an error loading your time tracking data."
        })
      }
    } catch (error) {
      console.error("Error fetching time entries:", error)
      toast.error("Failed to load time entries", {
        description: "An unexpected error occurred while loading your data."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateStats = (entries: TimeEntry[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endOfToday = new Date(today)
    endOfToday.setHours(23, 59, 59, 999)

    // Check if currently clocked in
    const todayEntries = entries.filter((entry: TimeEntry) => {
      const entryDate = new Date(entry.date)
      return entryDate >= today && entryDate <= endOfToday
    })

    const activeEntry = todayEntries.find((entry: TimeEntry) => !entry.clock_out)
    setIsCurrentlyClockedIn(!!activeEntry)

    // Calculate today's hours
    const todayTotal = todayEntries.reduce((sum: number, entry: TimeEntry) => sum + (entry.total_hours || 0), 0)
    setTodayHours(Math.round(todayTotal * 10) / 10)

    // Calculate this week's hours
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const weeklyEntries = entries?.filter((entry: TimeEntry) => {
      const entryDate = new Date(entry.date)
      return entryDate >= startOfWeek && (entry.total_hours || 0) > 0
    }) || []
    const weeklyTotal = weeklyEntries.reduce((sum: number, entry: TimeEntry) => sum + (entry.total_hours || 0), 0)
    setWeeklyHours(Math.round(weeklyTotal * 10) / 10)
  }

  const handleClockInOut = async () => {
    if (!currentUser || isClocking) return

    const action = isCurrentlyClockedIn ? "clock_out" : "clock_in"
    const actionText = isCurrentlyClockedIn ? "Clock Out" : "Clock In"

    // Start animation
    if (action === "clock_in") {
      setIsAnimatingIn(true)
      setTimeout(() => setIsAnimatingIn(false), 2000)
    } else {
      setIsAnimatingOut(true)
      setTimeout(() => setIsAnimatingOut(false), 2000)
    }

    setIsClocking(true)

    try {
      console.log("[Time Tracking Simple] Clock in/out request:", {
        action,
        employee_id: currentUser.id,
        currentUser: currentUser,
        userType: typeof currentUser.id
      });

      const loadingToastId = toast.loading(`${actionText}...`, {
        description: `Processing your ${actionText.toLowerCase()} request.`,
      });

      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          employee_id: currentUser.id,
        }),
      })

      const data = await response.json()
      console.log("[Time Tracking Simple] API response:", { status: response.status, data });

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      if (response.ok) {
        toast.success(`${actionText} successful! 🎉`, {
          description: isCurrentlyClockedIn
            ? "Great work today! You have been clocked out successfully."
            : "Welcome back! You have been clocked in successfully.",
        });

        // Refresh data
        await fetchTimeEntries()
      } else {
        console.error("[Time Tracking Simple] Clock in/out failed:", data);
        toast.error(`${actionText} failed`, {
          description: data.error || data.details || `There was an error processing your ${actionText.toLowerCase()} request.`,
        });
      }
    } catch (error) {
      console.error("Error clocking in/out:", error)
      toast.error(`${actionText} failed`, {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsClocking(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-r from-red-600 to-blue-600 text-white animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-white/20 rounded w-32"></div>
              <div className="h-4 bg-white/20 rounded w-48"></div>
              <div className="h-4 bg-white/20 rounded w-40"></div>
            </div>
            <div className="h-12 w-24 bg-white/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-red-600 to-blue-600 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Time Tracking</h3>
            <p className="text-red-100 mb-4">
              {isCurrentlyClockedIn ? "You're currently clocked in" : "Ready to start your day?"}
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Today: {todayHours}h</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>This week: {weeklyHours}h</span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleClockInOut}
            disabled={isClocking}
            size="lg"
            className={`relative overflow-hidden transition-all duration-300 ${isCurrentlyClockedIn
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white text-red-600 hover:bg-gray-100"
              } ${isAnimatingIn ? "animate-pulse scale-110 shadow-2xl shadow-yellow-400/50" : ""
              } ${isAnimatingOut ? "animate-bounce scale-95 shadow-2xl shadow-blue-400/50" : ""
              }`}
          >
            {/* Animation overlay */}
            {isAnimatingIn && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-ping" />
            )}
            {isAnimatingOut && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
            )}

            {isCurrentlyClockedIn ? (
              <>
                <Moon className={`w-5 h-5 mr-2 ${isAnimatingOut ? "animate-spin" : ""}`} />
                {isClocking ? "Clocking Out..." : "Clock Out"}
              </>
            ) : (
              <>
                <Zap className={`w-5 h-5 mr-2 ${isAnimatingIn ? "animate-bounce" : ""}`} />
                {isClocking ? "Clocking In..." : "Clock In"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
