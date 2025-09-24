"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Clock, Calendar } from "lucide-react"

interface Stats {
  totalUsers: number
  activeUsers: number
  pendingLeaves: number
  todayAttendance: number
  totalLeaveTypes: number
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingLeaves: 0,
    todayAttendance: 0,
    totalLeaveTypes: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, leavesRes, attendanceRes, leaveTypesRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/leave-requests"),
          fetch("/api/time-entries"),
          fetch("/api/leave-types"),
        ])

        const users = await usersRes.json()
        const leaves = await leavesRes.json()
        const attendance = await attendanceRes.json()
        const leaveTypes = await leaveTypesRes.json()

        setStats({
          totalUsers: users.length || 0,
          activeUsers: users.filter((u: any) => u.last_sign_in_at).length || 0,
          pendingLeaves: leaves.filter((l: any) => l.status === "pending").length || 0,
          todayAttendance:
            attendance.filter((a: any) => {
              const today = new Date().toISOString().split("T")[0]
              return a.date === today
            }).length || 0,
          totalLeaveTypes: Array.isArray(leaveTypes) ? leaveTypes.length : 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered employees",
      icon: Users,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      description: "Recently active",
      icon: UserCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
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
      description: "Clocked in today",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Leave Types",
      value: stats.totalLeaveTypes,
      description: "Available categories",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100",
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
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-600">New user registered</p>
                <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-sm text-gray-600">Leave request submitted</p>
                <span className="text-xs text-gray-400 ml-auto">4 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <p className="text-sm text-gray-600">User role updated</p>
                <span className="text-xs text-gray-400 ml-auto">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-900">Add New User</span>
              </div>
            </button>
            <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Review Leave Requests</span>
              </div>
            </button>
            <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">View Attendance Reports</span>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
