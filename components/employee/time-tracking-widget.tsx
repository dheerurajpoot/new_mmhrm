"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Zap, Moon, Play, Pause } from "lucide-react"
import { getCurrentUser } from "@/lib/auth/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface TimeEntry {
  _id?: string
  employee_id: string
  date: string
  clock_in: string
  clock_out?: string
  total_hours?: number
  break_duration?: number
}

interface TimeTrackingWidgetProps {
  sectionData?: any;
}

export function TimeTrackingWidget({ sectionData }: TimeTrackingWidgetProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClocking, setIsClocking] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isCurrentlyClockedIn, setIsCurrentlyClockedIn] = useState(false)
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [weeklyMinutes, setWeeklyMinutes] = useState(0)
  const [isAnimatingIn, setIsAnimatingIn] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  const router = useRouter()

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (sectionData?.timeEntries) {
      // Use section data if available
      console.log("[Time Widget] Using section data for time entries:", sectionData.timeEntries.length);
      setTimeEntries(sectionData.timeEntries || []);
      updateStats(sectionData.timeEntries || []);
      setIsLoading(false);
    } else if (currentUser) {
      // Fallback to original data fetching
      fetchTimeEntries();
    }
  }, [sectionData, currentUser]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const loadCurrentUser = async () => {
    try {
      console.log("[Time Widget] Loading current user...");
      const user = await getCurrentUser();
      console.log("[Time Widget] Current user:", user ? `${user.full_name} (${user.id})` : "Not authenticated");
      setCurrentUser(user);
    } catch (error) {
      console.error("[Time Widget] Error loading current user:", error);
      setCurrentUser(null);
    }
  }

  // Helper function to convert hours to minutes and format display
  const formatTimeDisplay = (hours: number) => {
    const totalMinutes = Math.round(hours * 60)
    if (totalMinutes >= 60) {
      const hoursPart = Math.floor(totalMinutes / 60)
      const minutesPart = totalMinutes % 60
      return `${hoursPart}h ${minutesPart}m`
    }
    return `${totalMinutes}m`
  }

  // Helper function to format current date and time
  const formatCurrentDateTime = () => {
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }

    return {
      date: currentTime.toLocaleDateString('en-US', dateOptions),
      time: currentTime.toLocaleTimeString('en-US', timeOptions)
    }
  }

  const fetchTimeEntries = async () => {
    if (!currentUser) {
      console.log("[Time Widget] No current user, skipping fetch");
      setIsLoading(false);
      return;
    }

    if (!currentUser.id) {
      console.error("[Time Widget] Current user has no ID:", currentUser);
      toast.error("Authentication error", {
        description: "User ID is missing. Please log in again.",
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log("[Time Widget] Fetching time entries for user:", {
        id: currentUser.id,
        idType: typeof currentUser.id,
        idLength: currentUser.id.length,
        userName: currentUser.full_name
      });

      const response = await fetch(`/api/time-entries?employee_id=${encodeURIComponent(currentUser.id)}&limit=30`);
      console.log("[Time Widget] API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("[Time Widget] Fetched time entries:", data?.length || 0);
        setTimeEntries(data || []);
        updateStats(data || []);
      } else {
        console.error("[Time Widget] Failed to fetch time entries:", response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error("[Time Widget] Error details:", errorData);
        toast.error("Failed to load time data", {
          description: errorData.error || "Bad Request - Please contact support.",
        });
      }
    } catch (error) {
      console.error("[Time Widget] Error fetching time entries:", error);
      toast.error("Error loading time entries", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const updateStats = (entries: TimeEntry[]) => {
    const today = new Date().toISOString().split("T")[0]

    // Check if currently clocked in
    const activeEntry = entries?.find((entry: TimeEntry) => {
      const entryDate = new Date(entry.date).toISOString().split("T")[0]
      return entryDate === today && !entry.clock_out
    })
    setIsCurrentlyClockedIn(!!activeEntry)

    // Calculate today's minutes
    const todayEntries = entries?.filter((entry: TimeEntry) => {
      const entryDate = new Date(entry.date).toISOString().split("T")[0]
      return entryDate === today
    }) || []
    const todayTotalHours = todayEntries.reduce((sum: number, entry: TimeEntry) => sum + (entry.total_hours || 0), 0)
    const todayTotalMinutes = Math.round(todayTotalHours * 60)
    setTodayMinutes(todayTotalMinutes)

    // Calculate weekly minutes
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const weeklyEntries = entries?.filter((entry: TimeEntry) => {
      const entryDate = new Date(entry.date)
      return entryDate >= startOfWeek && (entry.total_hours || 0) > 0
    }) || []
    const weeklyTotalHours = weeklyEntries.reduce((sum: number, entry: TimeEntry) => sum + (entry.total_hours || 0), 0)
    const weeklyTotalMinutes = Math.round(weeklyTotalHours * 60)
    setWeeklyMinutes(weeklyTotalMinutes)
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
      console.log(`[Time Widget] Starting ${actionText} for employee:`, currentUser.id);

      const loadingToastId = toast.loading(`${actionText}...`, {
        description: `Processing your ${actionText.toLowerCase()} request.`,
      });

      const requestBody = {
        action,
        employee_id: currentUser.id,
      };

      console.log("[Time Widget] Request body:", requestBody);

      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("[Time Widget] Response status:", response.status);
      console.log("[Time Widget] Response ok:", response.ok);

      const data = await response.json()
      console.log("[Time Widget] Response data:", data);

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
        console.error(`[Time Widget] ${actionText} failed:`, data);
        toast.error(`${actionText} failed`, {
          description: data.error || data.details || `There was an error processing your ${actionText.toLowerCase()} request.`,
        });
      }
    } catch (error) {
      console.error("[Time Widget] Error clocking in/out:", error)
      toast.error(`${actionText} failed`, {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsClocking(false)
    }
  }

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    // Use local time formatting to show user's timezone
    return time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  // Show error state if user is not authenticated
  if (!currentUser) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">
            Please log in to access time tracking features.
          </p>
          <Button
            onClick={() => window.location.href = "/auth/login"}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { date, time } = formatCurrentDateTime()

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-red-600 to-blue-600 text-white flex">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Clock className="w-5 h-5" />
          Time Tracking
        </CardTitle>
        <CardDescription className="text-red-100">
          {isCurrentlyClockedIn ? "You're currently clocked in" : "Ready to start your day?"}
        </CardDescription>

        {/* Current Date and Time */}
        <div className="mt-3 space-y-1">
          <p className="text-sm text-white/90 font-medium">{date}</p>
          <p className="text-lg font-mono text-white font-bold">{time}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-red-100">Today</p>
            <p className="text-xl font-bold">{formatTimeDisplay(todayMinutes / 60)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-red-100">This Week</p>
            <p className="text-xl font-bold">{formatTimeDisplay(weeklyMinutes / 60)}</p>
          </div>
        </div>

        {/* Clock In/Out Button */}
        <Button
          onClick={handleClockInOut}
          disabled={isClocking}
          size="lg"
          className={`w-full relative overflow-hidden transition-all duration-300 ${isCurrentlyClockedIn
              ? "bg-red-500 hover:bg-red-600"
              : "bg-white text-red-600 hover:bg-gray-100"
            } ${isAnimatingIn ? "animate-pulse scale-105 shadow-2xl shadow-yellow-400/50" : ""
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

        {/* Current Status */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isCurrentlyClockedIn ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
            <span>{isCurrentlyClockedIn ? "Active" : "Offline"}</span>
          </div>
          <Button
            onClick={() => router.push("/employee?section=time")}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            View Details
          </Button>
        </div>

        {/* Recent Activity */}
        {timeEntries.length > 0 && (
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-sm text-red-100 mb-2">Recent Activity</p>
            <div className="space-y-1">
              {timeEntries.slice(0, 3).map((entry, index) => {
                const entryDate = new Date(entry.date)
                const isToday = entryDate.toDateString() === new Date().toDateString()

                return (
                  <div key={entry._id || index} className="flex items-center justify-between text-xs">
                    <span className={isToday ? "font-semibold" : ""}>
                      {isToday ? "Today" : entryDate.toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{formatTime(entry.clock_in)}</span>
                      {entry.clock_out ? (
                        <>
                          <span>→</span>
                          <span>{formatTime(entry.clock_out)}</span>
                          <Badge variant="secondary" className="text-xs">
                            {entry.total_hours?.toFixed(1)}h
                          </Badge>
                        </>
                      ) : (
                        <Badge className="bg-green-500 text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
