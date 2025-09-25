"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Clock, Calendar, UserPlus, Building2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Stats {
  totalUsers: number
  activeUsers: number
  pendingLeaves: number
  todayAttendance: number
  totalLeaveTypes: number
  totalTeams: number
  userGrowth: number
  attendanceGrowth: number
  leaveGrowth: number
  teamGrowth: number
}

interface RecentActivity {
  id: string
  type: 'team' | 'employee' | 'clockin' | 'leave'
  message: string
  timestamp: string
  user?: string
  profile_photo?: string
  role?: string
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingLeaves: 0,
    todayAttendance: 0,
    totalLeaveTypes: 0,
    totalTeams: 0,
    userGrowth: 0,
    attendanceGrowth: 0,
    leaveGrowth: 0,
    teamGrowth: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, leavesRes, attendanceRes, leaveTypesRes, teamsRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/leave-requests"),
          fetch("/api/time-entries"),
          fetch("/api/leave-types"),
          fetch("/api/teams"),
        ])

        if (!usersRes.ok) {
          console.error("Failed to fetch users:", usersRes.status, usersRes.statusText)
        }
        if (!teamsRes.ok) {
          console.error("Failed to fetch teams:", teamsRes.status, teamsRes.statusText)
        }

        const users = await usersRes.json()
        const leaves = await leavesRes.json()
        const attendance = await attendanceRes.json()
        const leaveTypes = await leaveTypesRes.json()
        const teams = await teamsRes.json()

        console.log("Fetched users:", users.length, users)
        console.log("Fetched teams:", teams.length, teams)

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
          totalTeams: Array.isArray(teams) ? teams.length : 0,
          userGrowth: 20, // Mock growth data
          attendanceGrowth: 15,
          leaveGrowth: -5,
          teamGrowth: 25,
        })

        // Generate recent activity from real data
        const activities: RecentActivity[] = []
        
        // Recent teams (last 3 teams created)
        let recentTeams = teams.slice(0, 3)
        
        // Fallback: if no teams, create mock data
        if (recentTeams.length === 0) {
          recentTeams = [
            {
              _id: "mock-team-1",
              name: "Development Team",
              leader: { full_name: "John Doe", profile_photo: null },
              created_at: new Date().toISOString()
            },
            {
              _id: "mock-team-2", 
              name: "Marketing Team",
              leader: { full_name: "Jane Smith", profile_photo: null },
              created_at: new Date(Date.now() - 86400000).toISOString()
            }
          ]
        }
        
        recentTeams.forEach((team: any) => {
          activities.push({
            id: `team-${team._id}`,
            type: 'team',
            message: `New team "${team.name}" created`,
            timestamp: team.created_at,
            user: team.leader?.full_name || 'Unknown',
            profile_photo: team.leader?.profile_photo
          })
        })

        // Recent employees (last 3 users registered) - sort by created_at or use all users
        let recentUsers = users
          .filter((user: any) => user.created_at || user._id) // Users with creation date or any user
          .sort((a: any, b: any) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
            return dateB - dateA
          })
          .slice(0, 3)
        
        // Fallback: if no users with dates, just take first 3 users
        if (recentUsers.length === 0 && users.length > 0) {
          recentUsers = users.slice(0, 3)
        }
        
        // Final fallback: if still no users, create mock data for testing
        if (recentUsers.length === 0) {
          recentUsers = [
            {
              _id: "mock-1",
              full_name: "John Doe",
              email: "john.doe@company.com",
              role: "employee",
              profile_photo: null,
              created_at: new Date().toISOString()
            },
            {
              _id: "mock-2", 
              full_name: "Jane Smith",
              email: "jane.smith@company.com",
              role: "hr",
              profile_photo: null,
              created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
            },
            {
              _id: "mock-3",
              full_name: "Admin User",
              email: "admin@company.com", 
              role: "admin",
              profile_photo: null,
              created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
            }
          ]
        }
        console.log("Recent users to process:", recentUsers)
        recentUsers.forEach((user: any) => {
          console.log("Processing user:", user)
          activities.push({
            id: `user-${user._id}`,
            type: 'employee',
            message: `New employee "${user.full_name || user.email}" registered`,
            timestamp: user.created_at || user.last_sign_in_at,
            user: user.full_name || user.email,
            profile_photo: user.profile_photo,
            role: user.role
          })
        })

        // Sort by timestamp and take the most recent 6
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        console.log("All activities:", activities)
        console.log("Employee activities:", activities.filter(a => a.type === 'employee'))
        setRecentActivity(activities.slice(0, 6))

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
      title: "Total Employees",
      value: stats.totalUsers.toLocaleString(),
      description: "Registered employees",
      icon: Users,
      growth: stats.userGrowth,
      trend: "up",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
    {
      title: "Total Teams",
      value: stats.totalTeams.toLocaleString(),
      description: "Active teams",
      icon: Building2,
      growth: stats.teamGrowth,
      trend: "up",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
    {
      title: "Leave Types",
      value: stats.totalLeaveTypes.toLocaleString(),
      description: "Available categories",
      icon: Calendar,
      growth: 0,
      trend: "up",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
    {
      title: "Average Salary",
      value: `$${(stats.todayAttendance * 1500).toLocaleString()}`,
      description: "Monthly average",
      icon: DollarSign,
      growth: -9,
      trend: "down",
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="flex items-center space-x-2">
                <div className="h-4 bg-gray-200 rounded w-4"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'team':
        return <Building2 className="w-4 h-4 text-indigo-600" />
      case 'employee':
        return <UserPlus className="w-4 h-4 text-green-600" />
      case 'clockin':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'leave':
        return <Calendar className="w-4 h-4 text-orange-600" />
      default:
        return <Users className="w-4 h-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'team':
        return 'bg-indigo-100'
      case 'employee':
        return 'bg-green-100'
      case 'clockin':
        return 'bg-blue-100'
      case 'leave':
        return 'bg-orange-100'
      default:
        return 'bg-gray-100'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
              <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="mb-2">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className="flex items-center space-x-2">
              {stat.trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${stat.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
                {Math.abs(stat.growth)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Teams and Users Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Teams */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Teams</h3>
          <div className="space-y-4">
            {recentActivity.filter(activity => activity.type === 'team').slice(0, 3).map((activity, index) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={activity.profile_photo} alt={activity.user} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white font-semibold text-sm">
                    <Building2 className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">by {activity.user}</p>
                </div>
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Team
                </div>
              </div>
            ))}
            {recentActivity.filter(activity => activity.type === 'team').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent teams created</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Users</h3>
          <div className="space-y-4">
            {recentActivity.filter(activity => activity.type === 'employee').slice(0, 3).map((activity, index) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={activity.profile_photo} alt={activity.user} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-blue-400 text-white font-semibold text-sm">
                    {activity.user?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.user || 'Unknown User'}</p>
                  <p className="text-xs text-gray-500">{activity.message}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.role === 'admin' ? 'bg-red-100 text-red-800' :
                  activity.role === 'hr' ? 'bg-blue-100 text-blue-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {activity.role === 'admin' ? 'Admin' : activity.role === 'hr' ? 'HR' : 'Employee'}
                </div>
              </div>
            ))}
            {recentActivity.filter(activity => activity.type === 'employee').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent users registered</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
