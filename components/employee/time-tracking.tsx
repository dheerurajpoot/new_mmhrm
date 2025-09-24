"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, Play, Pause, Calendar } from "lucide-react"
import { getCurrentUser } from "@/lib/auth/client"

interface TimeEntry {
  id: string
  employee_id: string
  date: string
  clock_in: string
  clock_out?: string
  total_hours: number
  break_duration?: number
}

export function TimeTracking() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isCurrentlyClockedIn, setIsCurrentlyClockedIn] = useState(false)
  const [todayHours, setTodayHours] = useState(0)
  const [weeklyHours, setWeeklyHours] = useState(0)

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
      const response = await fetch(`/api/time-entries?employee_id=${currentUser._id}`)
      const data = await response.json()

      setTimeEntries(data || [])

      // Check if currently clocked in
      const today = new Date().toISOString().split("T")[0]
      const activeEntry = data?.find((entry: TimeEntry) => entry.date === today && !entry.clock_out)
      setIsCurrentlyClockedIn(!!activeEntry)

      // Calculate today's hours
      const todayEntries = data?.filter((entry: TimeEntry) => entry.date === today) || []
      const todayTotal = todayEntries.reduce((sum: number, entry: TimeEntry) => sum + (entry.total_hours || 0), 0)
      setTodayHours(Math.round(todayTotal * 10) / 10)

      // Calculate weekly hours
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      const weeklyEntries =
        data?.filter((entry: TimeEntry) => new Date(entry.date) >= startOfWeek && entry.total_hours > 0) || []
      const weeklyTotal = weeklyEntries.reduce((sum: number, entry: TimeEntry) => sum + (entry.total_hours || 0), 0)
      setWeeklyHours(Math.round(weeklyTotal * 10) / 10)
    } catch (error) {
      console.error("Error fetching time entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockInOut = async () => {
    if (!currentUser) return

    try {
      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: isCurrentlyClockedIn ? "clock_out" : "clock_in",
          employee_id: currentUser._id,
        }),
      })

      if (response.ok) {
        fetchTimeEntries()
      }
    } catch (error) {
      console.error("Error clocking in/out:", error)
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusBadge = (entry: TimeEntry) => {
    if (!entry.clock_out) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Active</Badge>
    }
    if (entry.total_hours >= 8) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Full Day</Badge>
    }
    if (entry.total_hours >= 4) {
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Half Day</Badge>
    }
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Short Day</Badge>
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Clock In/Out Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-red-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Time Tracking</h3>
              <p className="text-red-100 mb-4">
                {isCurrentlyClockedIn ? "You're currently clocked in" : "Ready to start your day?"}
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span>Today: {todayHours}h</span>
                <span>This week: {weeklyHours}h</span>
              </div>
            </div>
            <Button
              onClick={handleClockInOut}
              size="lg"
              className={`${isCurrentlyClockedIn ? "bg-red-500 hover:bg-red-600" : "bg-white text-red-600 hover:bg-gray-100"}`}
            >
              {isCurrentlyClockedIn ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Clock Out
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Clock In
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{todayHours}h</p>
                <p className="text-xs text-gray-500">Hours worked</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{weeklyHours}h</p>
                <p className="text-xs text-gray-500">Total hours</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-2xl font-bold text-gray-900">{isCurrentlyClockedIn ? "Active" : "Offline"}</p>
                <p className="text-xs text-gray-500">Current state</p>
              </div>
              <div
                className={`w-12 h-12 ${
                  isCurrentlyClockedIn ? "bg-blue-100" : "bg-gray-100"
                } rounded-lg flex items-center justify-center`}
              >
                <div className={`w-6 h-6 rounded-full ${isCurrentlyClockedIn ? "bg-blue-500" : "bg-gray-400"}`}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries History */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
          <CardDescription>Your recent time tracking records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden md:table-cell">Clock In</TableHead>
                  <TableHead className="hidden md:table-cell">Clock Out</TableHead>
                  <TableHead className="hidden lg:table-cell">Break</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeEntries.slice(0, 10).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(entry.date).toLocaleDateString()}</p>
                        <p className="text-gray-500">
                          {new Date(entry.date).toLocaleDateString("en-US", { weekday: "short" })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-sm">{formatTime(entry.clock_in)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {entry.clock_out ? (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{formatTime(entry.clock_out)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Still active</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm">{entry.break_duration || 0}m</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {entry.clock_out ? `${entry.total_hours.toFixed(1)}h` : "In progress"}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(entry)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {timeEntries.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No time entries found. Clock in to start tracking your time.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
