"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Clock, Calendar, UserPlus, Building2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, Activity, CheckCircle, XCircle, AlertCircle, Timer, UserX, FileText, Cake, Gift, Star, Sparkles, Trash2 } from "lucide-react"
import { UpcomingBirthdays } from "@/components/shared/upcoming-birthdays"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

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
  type: 'leave_request' | 'leave_approval' | 'employee_registered' | 'team_created' | 'time_entry'
  title: string
  description: string
  details?: any
  user?: {
    name: string
    email: string
    profile_photo?: string
    role: string
  }
  targetUser?: {
    name: string
    email: string
    profile_photo?: string
    role: string
  }
  approver?: {
    name: string
    email: string
    profile_photo?: string
    role: string
  }
  timestamp: string
  status: string
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("Starting to fetch dashboard data...")
        
        const [usersRes, leavesRes, attendanceRes, leaveTypesRes, teamsRes, activitiesRes, employeesRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/leave-requests"),
          fetch("/api/time-entries"),
          fetch("/api/leave-types"),
          fetch("/api/teams"),
          fetch("/api/admin/recent-activities"),
          fetch("/api/employee/search"),
        ])

        console.log("API responses status:", {
          users: usersRes.status,
          leaves: leavesRes.status,
          attendance: attendanceRes.status,
          leaveTypes: leaveTypesRes.status,
          teams: teamsRes.status,
          activities: activitiesRes.status,
          employees: employeesRes.status
        })

        if (!usersRes.ok) {
          console.error("Failed to fetch users:", usersRes.status, usersRes.statusText)
        }
        if (!teamsRes.ok) {
          console.error("Failed to fetch teams:", teamsRes.status, teamsRes.statusText)
        }
        if (!activitiesRes.ok) {
          console.error("Failed to fetch activities:", activitiesRes.status, activitiesRes.statusText)
        }
        if (!employeesRes.ok) {
          console.error("Failed to fetch employees:", employeesRes.status, employeesRes.statusText)
        }

        const users = await usersRes.json()
        const leaves = await leavesRes.json()
        const attendance = await attendanceRes.json()
        const leaveTypes = await leaveTypesRes.json()
        const teams = await teamsRes.json()
        const activities = await activitiesRes.json()
        const employees = await employeesRes.json()

        console.log("Fetched data:", {
          users: users.length,
          teams: teams.length,
          activities: activities.length,
          employees: employees.length,
          leaves: leaves.length
        })
        
        console.log("Employee data details:", employees)
        console.log("Activities data details:", activities)
        console.log("Employees with birth dates:", employees.filter((emp: any) => emp.birth_date))
        console.log("Sample employee:", employees[0])
        console.log("Sample employee birth_date:", employees[0]?.birth_date)
        console.log("Sample employee birth_date type:", typeof employees[0]?.birth_date)

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

        setRecentActivity(activities || [])
        
        
        // Update last updated timestamp
        setLastUpdated(new Date())

      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalUsers.toLocaleString(),
      description: "Registered employees",
      icon: Users,
      growth: stats.userGrowth,
      trend: "up",
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-500",
    },
    {
      title: "Total Teams",
      value: stats.totalTeams.toLocaleString(),
      description: "Active teams",
      icon: Building2,
      growth: stats.teamGrowth,
      trend: "up",
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      iconBg: "bg-purple-500",
    },
    {
      title: "Leave Types",
      value: stats.totalLeaveTypes.toLocaleString(),
      description: "Available categories",
      icon: Calendar,
      growth: 0,
      trend: "up",
      color: "text-emerald-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      borderColor: "border-emerald-200",
      iconBg: "bg-emerald-500",
    },
    {
      title: "Pending Leaves",
      value: stats.pendingLeaves.toLocaleString(),
      description: "Awaiting approval",
      icon: AlertCircle,
      growth: stats.leaveGrowth,
      trend: "down",
      color: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      borderColor: "border-orange-200",
      iconBg: "bg-orange-500",
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
      case 'leave_request':
        return <FileText className="w-4 h-4 text-blue-600" />
      case 'leave_approval':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'employee_registered':
        return <UserPlus className="w-4 h-4 text-emerald-600" />
      case 'team_created':
        return <Building2 className="w-4 h-4 text-purple-600" />
      case 'time_entry':
        return <Timer className="w-4 h-4 text-orange-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'leave_request':
        return 'bg-blue-100 text-blue-800'
      case 'leave_approval':
        return 'bg-green-100 text-green-800'
      case 'employee_registered':
        return 'bg-emerald-100 text-emerald-800'
      case 'team_created':
        return 'bg-purple-100 text-purple-800'
      case 'time_entry':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityBadge = (type: string, status: string) => {
    switch (type) {
      case 'leave_request':
        return status === 'pending' ? 'Pending' : status
      case 'leave_approval':
        return status === 'approved' ? 'Approved' : 'Rejected'
      case 'employee_registered':
        return 'New'
      case 'team_created':
        return 'Created'
      case 'time_entry':
        return status === 'clock_in' ? 'Clock In' : 'Clock Out'
      default:
        return 'Activity'
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




  const refreshDashboard = () => {
    setIsLoading(true)
    // Trigger the useEffect to refetch data
    window.location.reload()
  }

  const deleteActivity = async (activityId: string) => {
    try {
      // Extract the actual ID from the activity ID (remove prefix)
      const actualId = activityId.replace(/^(leave-request-|leave-approved-|leave-rejected-|team-|employee-|time-)/, '')
      
      // Determine the collection based on activity type
      let endpoint = ''
      if (activityId.startsWith('leave-request-') || activityId.startsWith('leave-approved-') || activityId.startsWith('leave-rejected-')) {
        endpoint = `/api/leave-requests/${actualId}`
      } else if (activityId.startsWith('team-')) {
        endpoint = `/api/teams/${actualId}`
      } else if (activityId.startsWith('employee-')) {
        endpoint = `/api/users/${actualId}`
      } else if (activityId.startsWith('time-')) {
        endpoint = `/api/time-entries/${actualId}`
      }

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'DELETE',
        })

        if (response.ok) {
          // Remove from local state
          setRecentActivity(prev => prev.filter(activity => activity.id !== activityId))
          console.log('Activity deleted successfully')
        } else {
          console.error('Failed to delete activity')
        }
      }
    } catch (error) {
      console.error('Error deleting activity:', error)
    }
  }

  return (
    <div className="space-y-8">

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-2xl border-2 ${stat.borderColor} p-6 hover:shadow-xl transition-all duration-300 hover:scale-105`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">{stat.title}</h3>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mb-3">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              {stat.trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-semibold ${stat.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
                {Math.abs(stat.growth)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity, Teams, and Birthdays Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activity
            </h3>
            <Badge variant="outline" className="text-xs">
              Last 5 activities
            </Badge>
          </div>
          <div className="space-y-4">
            {recentActivity.slice(0, 4).map((activity, index) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-100">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">{activity.title}</h4>
                    <Badge className={`text-xs ${getActivityColor(activity.type)}`}>
                      {getActivityBadge(activity.type, activity.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      {activity.user && (
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={activity.user.profile_photo} alt={activity.user.name} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                            {activity.user.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-xs text-gray-500">
                        {activity.user?.name || 'System'}
                        {activity.targetUser && (
                          <span className="text-gray-400"> → {activity.targetUser.name}</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No recent activity</p>
                <p className="text-sm">Activities will appear here as they happen</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Teams */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-purple-600" />
              Recent Teams
            </h3>
            <Badge variant="outline" className="text-xs">
              {recentActivity.filter(a => a.type === 'team_created').length} teams
            </Badge>
          </div>
          <div className="space-y-4">
            {recentActivity.filter(activity => activity.type === 'team_created').slice(0, 3).map((activity, index) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={activity.user?.profile_photo} alt={activity.user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-400 text-white font-semibold text-sm">
                    <Building2 className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.details?.teamName || 'Team'}</p>
                  <p className="text-xs text-gray-500">by {activity.user?.name || 'Unknown'}</p>
                </div>
                <Badge className="text-xs bg-purple-100 text-purple-800">
                  Team
                </Badge>
              </div>
            ))}
            {recentActivity.filter(activity => activity.type === 'team_created').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No recent teams created</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Birthdays */}
        <UpcomingBirthdays />
      </div>
    </div>
  )
}
