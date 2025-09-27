"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, Calendar, Filter, RefreshCw, Zap, Moon } from "lucide-react"
import { getCurrentUser } from "@/lib/auth/client"
import { toast } from "sonner"
import { TimeTrackingWidget } from "./time-tracking-widget"

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

export function TimeTracking() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClocking, setIsClocking] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isCurrentlyClockedIn, setIsCurrentlyClockedIn] = useState(false)
  const [todayHours, setTodayHours] = useState(0)
  const [weeklyHours, setWeeklyHours] = useState(0)
  
  // Filter states
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
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

  // Apply filters whenever timeEntries or filter values change
  useEffect(() => {
    applyFilters()
  }, [timeEntries, dateFrom, dateTo, statusFilter])


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
        toast.error("Failed to fetch time entries", {
          description: "Please try refreshing the page.",
        })
      }
    } catch (error) {
      console.error("Error fetching time entries:", error)
      toast.error("Error loading time entries", {
        description: "Please check your connection and try again.",
      })
    } finally {
      setIsLoading(false)
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

    // Calculate today's hours
    const todayEntries = entries?.filter((entry: TimeEntry) => {
      const entryDate = new Date(entry.date).toISOString().split("T")[0]
      return entryDate === today
    }) || []
    const todayTotal = todayEntries.reduce((sum: number, entry: TimeEntry) => sum + (entry.total_hours || 0), 0)
    setTodayHours(Math.round(todayTotal * 10) / 10)

    // Calculate weekly hours
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const weeklyEntries = entries?.filter((entry: TimeEntry) => {
      const entryDate = new Date(entry.date)
      return entryDate >= startOfWeek && (entry.total_hours || 0) > 0
    }) || []
    const weeklyTotal = weeklyEntries.reduce((sum: number, entry: TimeEntry) => sum + (entry.total_hours || 0), 0)
    setWeeklyHours(Math.round(weeklyTotal * 10) / 10)
  }

  const applyFilters = () => {
    let filtered = [...timeEntries]

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate >= new Date(dateFrom)
      })
    }
    if (dateTo) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate <= new Date(dateTo)
      })
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(entry => {
        if (statusFilter === "active") return !entry.clock_out
        if (statusFilter === "completed") return !!entry.clock_out
        return true
      })
    }

    setFilteredEntries(filtered)
  }

  const clearFilters = () => {
    setDateFrom("")
    setDateTo("")
    setStatusFilter("all")
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

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusBadge = (entry: TimeEntry) => {
    if (!entry.clock_out) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Active</Badge>
    }
    if (entry.total_hours && entry.total_hours >= 8) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Full Day</Badge>
    }
    if (entry.total_hours && entry.total_hours >= 4) {
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Half Day</Badge>
    }
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Short Day</Badge>
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
      console.log("[Time Tracking] Clock in/out request:", {
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
      console.log("[Time Tracking] API response:", { status: response.status, data });

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
        console.error("[Time Tracking] Clock in/out failed:", data);
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
      {/* <Card className="border-0 shadow-lg bg-gradient-to-r from-red-600 to-blue-600 text-white">
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
              disabled={isClocking}
              size="lg"
              className={`relative overflow-hidden transition-all duration-300 ${
                isCurrentlyClockedIn 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-white text-red-600 hover:bg-gray-100"
              } ${
                isAnimatingIn ? "animate-pulse scale-110 shadow-2xl shadow-yellow-400/50" : ""
              } ${
                isAnimatingOut ? "animate-bounce scale-95 shadow-2xl shadow-blue-400/50" : ""
              }`}
            > */}
              {/* Animation overlay */}
              {/* {isAnimatingIn && (
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
      </Card> */}

      <TimeTrackingWidget />

      {/* Time Summary - Beautiful Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today Card */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-red-50 via-red-50 to-orange-50 hover:from-red-100 hover:via-red-100 hover:to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">Today</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatTimeDisplay(todayHours)}</p>
                <p className="text-sm text-red-600 font-medium">Time worked today</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-red-200">
              <div className="flex items-center justify-between text-xs text-red-600">
                <span>Goal: 8h</span>
                <span className="font-semibold">{Math.round((todayHours / 8) * 100)}% complete</span>
              </div>
              <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((todayHours / 8) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* This Week Card */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 hover:from-blue-100 hover:via-blue-100 hover:to-indigo-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">This Week</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatTimeDisplay(weeklyHours)}</p>
                <p className="text-sm text-blue-600 font-medium">Total time this week</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between text-xs text-blue-600">
                <span>Goal: 40h</span>
                <span className="font-semibold">{Math.round((weeklyHours / 40) * 100)}% complete</span>
              </div>
              <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((weeklyHours / 40) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 via-green-50 to-emerald-50 hover:from-green-100 hover:via-green-100 hover:to-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isCurrentlyClockedIn ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Status</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{isCurrentlyClockedIn ? "Active" : "Offline"}</p>
                <p className="text-sm text-green-600 font-medium">Current work state</p>
              </div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                isCurrentlyClockedIn 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
              }`}>
                <div className={`w-8 h-8 rounded-full ${isCurrentlyClockedIn ? "bg-white" : "bg-white"}`}>
                  <div className={`w-full h-full rounded-full ${isCurrentlyClockedIn ? "bg-green-500" : "bg-gray-400"} animate-pulse`}></div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="flex items-center justify-between text-xs text-green-600">
                <span>Last activity</span>
                <span className="font-semibold">{isCurrentlyClockedIn ? "Now" : "Offline"}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isCurrentlyClockedIn ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className={`text-xs font-medium ${isCurrentlyClockedIn ? 'text-green-600' : 'text-gray-500'}`}>
                  {isCurrentlyClockedIn ? "Currently working" : "Not active"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries History - Modern Design */}
      <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-gray-800">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Time Entries History</h3>
                  <p className="text-sm text-gray-600 font-medium">Track your work patterns and productivity</p>
                </div>
              </CardTitle>
            </div>
            <Button
              onClick={fetchTimeEntries}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Modern Filter Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <h4 className="font-semibold text-blue-800">Filter Options</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom" className="text-sm font-semibold text-gray-700">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo" className="text-sm font-semibold text-gray-700">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-semibold text-gray-700">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entries</SelectItem>
                    <SelectItem value="active">Active (Clocked In)</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">&nbsp;</Label>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full bg-white hover:bg-gray-50 border-gray-200 text-gray-700 rounded-xl"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Modern Table Design */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="text-gray-700 font-semibold py-4">Date</TableHead>
                  <TableHead className="hidden md:table-cell text-gray-700 font-semibold py-4">Clock In</TableHead>
                  <TableHead className="hidden md:table-cell text-gray-700 font-semibold py-4">Clock Out</TableHead>
                  <TableHead className="hidden lg:table-cell text-gray-700 font-semibold py-4">Break</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">Time</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.slice(0, 50).map((entry, index) => (
                  <TableRow 
                    key={entry._id || entry.date} 
                    className={`border-0 hover:bg-gray-50/50 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">{new Date(entry.date).toLocaleDateString()}</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(entry.date).toLocaleDateString("en-US", { weekday: "short" })}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{formatTime(entry.clock_in)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-4">
                      {entry.clock_out ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-red-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{formatTime(entry.clock_out)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          </div>
                          <span className="text-sm text-gray-500 font-medium">Still active</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-600">B</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{entry.break_duration || 0}m</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">T</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {entry.clock_out ? formatTimeDisplay(entry.total_hours || 0) : "In progress"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">{getStatusBadge(entry)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEntries.length === 0 && (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {timeEntries.length === 0 ? "No Time Entries Yet" : "No Matching Entries"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {timeEntries.length === 0 
                  ? "Start tracking your work time by clicking the clock-in button above."
                  : "No entries match your current filters. Try adjusting your filter criteria to see more results."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
