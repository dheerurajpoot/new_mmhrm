"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Home, DollarSign, Plus, Play, Pause } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface EmployeeStats {
  remainingLeaves: number
  hoursThisWeek: number
  pendingRequests: number
  currentSalary: number
  isCurrentlyClockedIn: boolean
  todayHours: number
  leaveBalances: Array<{
    id: string
    leave_type: string
    remaining_days: number
    total_days: number
  }>
}

export function EmployeeStats() {
  const [stats, setStats] = useState<EmployeeStats>({
    remainingLeaves: 0,
    hoursThisWeek: 0,
    pendingRequests: 0,
    currentSalary: 0,
    isCurrentlyClockedIn: false,
    todayHours: 0,
    leaveBalances: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/employee/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching employee stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockInOut = async () => {
    try {
      const response = await fetch("/api/employee/time-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: stats.isCurrentlyClockedIn ? "clock_out" : "clock_in",
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: stats.isCurrentlyClockedIn ? "Clocked out successfully" : "Clocked in successfully",
        })
        fetchStats()
      } else {
        toast({
          title: "Error",
          description: "Failed to clock in/out",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error clocking in/out:", error)
      toast({
        title: "Error",
        description: "Failed to clock in/out",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Clock In/Out */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-red-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Time Tracking</h3>
              <p className="text-red-100 mb-4">
                {stats.isCurrentlyClockedIn ? "You're currently clocked in" : "Ready to start your day?"}
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span>Today: {stats.todayHours}h</span>
                <span>This week: {stats.hoursThisWeek}h</span>
              </div>
            </div>
            <Button
              onClick={handleClockInOut}
              size="lg"
              className={`${
                stats.isCurrentlyClockedIn ? "bg-red-500 hover:bg-red-600" : "bg-white text-red-600 hover:bg-gray-100"
              }`}
            >
              {stats.isCurrentlyClockedIn ? (
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Individual Leave Type Boxes */}
        {stats.leaveBalances.map((balance) => (
          <Card key={balance.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{balance.leave_type}</p>
                  <p className="text-2xl font-bold text-gray-900">{balance.remaining_days}</p>
                  <p className="text-xs text-gray-500">of {balance.total_days} days remaining</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{stats.hoursThisWeek}h</p>
                <p className="text-xs text-gray-500">Hours worked</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                <p className="text-xs text-gray-500">Awaiting approval</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Salary</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.currentSalary ? `$${stats.currentSalary.toLocaleString()}` : "N/A"}
                </p>
                <p className="text-xs text-gray-500">Current rate</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-900">Request Leave</span>
              </div>
            </button>
            <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Home className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Work From Home Request</span>
              </div>
            </button>
            <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">View Time Reports</span>
              </div>
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-600">Clocked in at 9:00 AM</p>
                <span className="text-xs text-gray-400 ml-auto">Today</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-sm text-gray-600">Leave request approved</p>
                <span className="text-xs text-gray-400 ml-auto">2 days ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <p className="text-sm text-gray-600">Profile updated</p>
                <span className="text-xs text-gray-400 ml-auto">1 week ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
