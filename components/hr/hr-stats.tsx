"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Clock, AlertCircle } from "lucide-react"

interface HRStats {
  totalEmployees: number
  pendingLeaves: number
  todayAttendance: number
  overdueApprovals: number
}

export function HRStats() {
  const [stats, setStats] = useState<HRStats>({
    totalEmployees: 0,
    pendingLeaves: 0,
    todayAttendance: 0,
    overdueApprovals: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, leavesRes, attendanceRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/leave-requests"),
          fetch("/api/time-entries"),
        ])

        const users = await usersRes.json()
        const leaves = await leavesRes.json()
        const attendance = await attendanceRes.json()

        const threeDaysAgo = new Date()
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

        setStats({
          totalEmployees: users.filter((u: any) => u.role === "employee").length || 0,
          pendingLeaves: leaves.filter((l: any) => l.status === "pending").length || 0,
          todayAttendance:
            attendance.filter((a: any) => {
              const today = new Date().toISOString().split("T")[0]
              return a.date === today
            }).length || 0,
          overdueApprovals:
            leaves.filter((l: any) => l.status === "pending" && new Date(l.created_at) < threeDaysAgo).length || 0,
        })
      } catch (error) {
        console.error("Error fetching HR stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      description: "Active employees",
      icon: Users,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Pending Leaves",
      value: stats.pendingLeaves,
      description: "Awaiting approval",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance,
      description: "Employees present",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Overdue Approvals",
      value: stats.overdueApprovals,
      description: "Needs attention",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ]

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
            <CardDescription>Latest employee leave submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">John Doe</p>
                  <p className="text-sm text-gray-600">Annual Leave - 3 days</p>
                </div>
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">Pending</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Jane Smith</p>
                  <p className="text-sm text-gray-600">Sick Leave - 1 day</p>
                </div>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Approved</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Mike Johnson</p>
                  <p className="text-sm text-gray-600">Personal Leave - 2 days</p>
                </div>
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">Pending</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common HR tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-900">Add New Employee</span>
              </div>
            </button>
            <button className="w-full p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-900">Review Pending Leaves</span>
              </div>
            </button>
            <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">View Attendance Report</span>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
