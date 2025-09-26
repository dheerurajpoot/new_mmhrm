"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Home, DollarSign, Plus, Play, Pause, ArrowUpRight, ArrowDownRight, TrendingDown, Users, Search, Mail, Phone, MapPin, User, Plane, Heart, Baby, Coffee, Umbrella, Stethoscope, Laptop, HeartHandshake, Timer, Zap, Flower } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { TeamMembers } from "./team-members"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface EmployeeStats {
  remainingLeaves: number
  hoursThisWeek: number
  pendingRequests: number
  currentSalary: number
  isCurrentlyClockedIn: boolean
  todayHours: number
  leaveGrowth: number
  hoursGrowth: number
  salaryGrowth: number
  requestGrowth: number
  leaveBalances: Array<{
    id: string
    leave_type: string
    remaining_days: number
    total_days: number
  }>
}

interface Employee {
  id: string
  email: string
  full_name: string
  profile_photo?: string
  role: string
  department?: string
  position?: string
  phone?: string
  address?: string
  birth_date?: string
  created_at?: string
  last_sign_in_at?: string
}

export function EmployeeStats() {
  const [stats, setStats] = useState<EmployeeStats>({
    remainingLeaves: 0,
    hoursThisWeek: 0,
    pendingRequests: 0,
    currentSalary: 0,
    isCurrentlyClockedIn: false,
    todayHours: 0,
    leaveGrowth: 0,
    hoursGrowth: 0,
    salaryGrowth: 0,
    requestGrowth: 0,
    leaveBalances: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [leaveBalances, setLeaveBalances] = useState<any[]>([])
  const [leaveTypes, setLeaveTypes] = useState<any[]>([])
  const [isLeaveDataLoading, setIsLeaveDataLoading] = useState(true)

  // Leave types configuration with unique colors and icons
  const leaveTypesConfig = [
    {
      id: 'annual',
      name: 'Annual Leave',
      icon: Plane,
      totalDays: 25,
      usedDays: 8,
      color: '#3B82F6', // Blue
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600'
    },
    {
      id: 'sick',
      name: 'Sick Leave',
      icon: Heart,
      totalDays: 12,
      usedDays: 3,
      color: '#EF4444', // Red
      bgGradient: 'from-red-50 to-red-100',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600'
    },
    {
      id: 'personal',
      name: 'Personal Leave',
      icon: Coffee,
      totalDays: 5,
      usedDays: 2,
      color: '#F59E0B', // Amber
      bgGradient: 'from-amber-50 to-amber-100',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      iconColor: 'text-amber-600'
    },
    {
      id: 'maternity',
      name: 'Maternity Leave',
      icon: Baby,
      totalDays: 90,
      usedDays: 0,
      color: '#EC4899', // Pink
      bgGradient: 'from-pink-50 to-pink-100',
      borderColor: 'border-pink-200',
      textColor: 'text-pink-800',
      iconColor: 'text-pink-600'
    },
    {
      id: 'emergency',
      name: 'Emergency Leave',
      icon: Umbrella,
      totalDays: 3,
      usedDays: 1,
      color: '#8B5CF6', // Purple
      bgGradient: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      iconColor: 'text-purple-600'
    }
  ]


  useEffect(() => {
    fetchStats()
    fetchEmployees()
    fetchLeaveData()
  }, [])

  const fetchLeaveData = async () => {
    try {
      setIsLeaveDataLoading(true)
      const [leaveBalancesRes, leaveTypesRes] = await Promise.all([
        fetch("/api/employee/leave-balances"), // Use employee-specific API
        fetch("/api/leave-types")
      ])

      if (leaveBalancesRes.ok && leaveTypesRes.ok) {
        const balancesData = await leaveBalancesRes.json()
        const typesData = await leaveTypesRes.json()

        setLeaveBalances(balancesData)
        setLeaveTypes(typesData)
        console.log("Fetched employee leave balances:", balancesData)
        console.log("Fetched leave types:", typesData)
      } else {
        console.error("Failed to fetch leave data:", {
          balancesStatus: leaveBalancesRes.status,
          typesStatus: leaveTypesRes.status
        })
      }
    } catch (error) {
      console.error("Error fetching leave data:", error)
    } finally {
      setIsLeaveDataLoading(false)
    }
  }

  // Function to get real leave data directly from API
  const getRealLeaveData = () => {
    if (isLeaveDataLoading) {
      return [] // Return empty array while loading
    }

    if (leaveBalances.length === 0) {
      return [] // Return empty array if no real data available
    }

    // Map real leave balances to display format with icons and colors
    return leaveBalances.map(balance => {
      // Get icon and color based on leave type
      const getLeaveTypeConfig = (leaveType: string) => {
        const type = leaveType.toLowerCase()
        if (type.includes('casual') || type.includes('annual')) {
          return {
            icon: Plane,
            color: '#3B82F6',
            bgGradient: 'from-blue-50 to-blue-100',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-800',
            iconColor: 'text-blue-600'
          }
        } else if (type.includes('sick')) {
          return {
            icon: Heart,
            color: '#EF4444',
            bgGradient: 'from-red-50 to-red-100',
            borderColor: 'border-red-200',
            textColor: 'text-red-800',
            iconColor: 'text-red-600'
          }
        } else if (type.includes('medical')) {
          return {
            icon: Stethoscope,
            color: '#10B981',
            bgGradient: 'from-emerald-50 to-emerald-100',
            borderColor: 'border-emerald-200',
            textColor: 'text-emerald-800',
            iconColor: 'text-emerald-600'
          }
        } else if (type.includes('workfrom') || type.includes('wfh')) {
          return {
            icon: Laptop,
            color: '#6366F1',
            bgGradient: 'from-indigo-50 to-indigo-100',
            borderColor: 'border-indigo-200',
            textColor: 'text-indigo-800',
            iconColor: 'text-indigo-600'
          }
        } else if (type.includes('marriage')) {
          return {
            icon: HeartHandshake,
            color: '#F59E0B',
            bgGradient: 'from-amber-50 to-amber-100',
            borderColor: 'border-amber-200',
            textColor: 'text-amber-800',
            iconColor: 'text-amber-600'
          }
        } else if (type.includes('halfday')) {
          return {
            icon: Timer,
            color: '#8B5CF6',
            bgGradient: 'from-purple-50 to-purple-100',
            borderColor: 'border-purple-200',
            textColor: 'text-purple-800',
            iconColor: 'text-purple-600'
          }
        } else if (type.includes('shortday')) {
          return {
            icon: Zap,
            color: '#06B6D4',
            bgGradient: 'from-cyan-50 to-cyan-100',
            borderColor: 'border-cyan-200',
            textColor: 'text-cyan-800',
            iconColor: 'text-cyan-600'
          }
        } else if (type.includes('mensuration') || type.includes('menstrual')) {
          return {
            icon: Flower,
            color: '#EC4899',
            bgGradient: 'from-pink-50 to-pink-100',
            borderColor: 'border-pink-200',
            textColor: 'text-pink-800',
            iconColor: 'text-pink-600'
          }
        } else if (type.includes('personal')) {
          return {
            icon: Coffee,
            color: '#F59E0B',
            bgGradient: 'from-amber-50 to-amber-100',
            borderColor: 'border-amber-200',
            textColor: 'text-amber-800',
            iconColor: 'text-amber-600'
          }
        } else if (type.includes('maternity')) {
          return {
            icon: Baby,
            color: '#EC4899',
            bgGradient: 'from-pink-50 to-pink-100',
            borderColor: 'border-pink-200',
            textColor: 'text-pink-800',
            iconColor: 'text-pink-600'
          }
        } else if (type.includes('emergency')) {
          return {
            icon: Umbrella,
            color: '#8B5CF6',
            bgGradient: 'from-purple-50 to-purple-100',
            borderColor: 'border-purple-200',
            textColor: 'text-purple-800',
            iconColor: 'text-purple-600'
          }
        } else {
          // Default configuration for unknown types
          return {
            icon: Calendar,
            color: '#6B7280',
            bgGradient: 'from-gray-50 to-gray-100',
            borderColor: 'border-gray-200',
            textColor: 'text-gray-800',
            iconColor: 'text-gray-600'
          }
        }
      }

      const config = getLeaveTypeConfig(balance.leave_type)
      const usagePercentage = (balance.used_days / balance.total_days) * 100

      console.log(`Real leave data for ${balance.leave_type}:`, {
        total_days: balance.total_days,
        used_days: balance.used_days,
        remaining_days: balance.remaining_days,
        usagePercentage
      })

      return {
        id: balance.id,
        name: balance.leave_type.charAt(0).toUpperCase() + balance.leave_type.slice(1),
        totalDays: balance.total_days,
        usedDays: balance.used_days,
        remainingDays: balance.remaining_days,
        usagePercentage,
        ...config
      }
    })
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const searchContainer = target.closest('.search-container')
      const searchInput = target.closest('input[type="text"]')
      const searchResults = target.closest('.search-results')
      
      // Only close if clicking outside the search container and not on search results
      if (!searchContainer && !searchInput && !searchResults) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setSelectedIndex(-1) // Reset selected index when search term changes
    
    if (searchTerm.trim() === "") {
      setFilteredEmployees([])
      setShowSearchResults(false)
    } else {
      const filtered = employees.filter(employee => {
        const searchLower = searchTerm.toLowerCase()
        return (
          employee.full_name?.toLowerCase().includes(searchLower) ||
          employee.email?.toLowerCase().includes(searchLower) ||
          employee.department?.toLowerCase().includes(searchLower) ||
          employee.position?.toLowerCase().includes(searchLower)
        )
      })
      setFilteredEmployees(filtered)
      setShowSearchResults(filtered.length > 0)
    }
  }, [searchTerm, employees])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/employee/stats")
      if (response.ok) {
        const data = await response.json()
        setStats({
          ...data,
          leaveGrowth: 5,
          hoursGrowth: 12,
          salaryGrowth: 8,
          requestGrowth: -3,
        })
      }
    } catch (error) {
      console.error("Error fetching employee stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employee/search")
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
        setFilteredEmployees(data)
      } else {
        console.error("Failed to fetch employees:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }


  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsModalOpen(true)
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
      <div className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Weekly Hours",
      value: `${stats.hoursThisWeek}h`,
      description: "Hours worked",
      icon: Clock,
      growth: stats.hoursGrowth,
      trend: "up",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests.toString(),
      description: "Awaiting approval",
      icon: Home,
      growth: stats.requestGrowth,
      trend: "down",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Monthly Salary",
      value: stats.currentSalary ? `₹${stats.currentSalary.toLocaleString()}` : "N/A",
      description: "Current rate",
      icon: DollarSign,
      growth: stats.salaryGrowth,
      trend: "up",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ]

  return (
    <div className="space-responsive">
      {/* Employee Search Box */}
      <div className="relative search-container mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <Input
              type="text"
              placeholder="Search employees by name, email, department, or position..."
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value
                setSearchTerm(value)
              }}
              onFocus={() => {
                if (searchTerm.trim() !== "" && filteredEmployees.length > 0) {
                  setShowSearchResults(true)
                }
              }}
              onKeyDown={(e) => {
                if (!showSearchResults || filteredEmployees.length === 0) return
                
                switch (e.key) {
                  case 'ArrowDown':
                    e.preventDefault()
                    setSelectedIndex(prev => 
                      prev < filteredEmployees.length - 1 ? prev + 1 : 0
                    )
                    break
                  case 'ArrowUp':
                    e.preventDefault()
                    setSelectedIndex(prev => 
                      prev > 0 ? prev - 1 : filteredEmployees.length - 1
                    )
                    break
                  case 'Enter':
                    e.preventDefault()
                    if (selectedIndex >= 0 && selectedIndex < filteredEmployees.length) {
                      const employee = filteredEmployees[selectedIndex]
                      handleEmployeeClick(employee)
                      setShowSearchResults(false)
                      setSearchTerm("")
                      setSelectedIndex(-1)
                    }
                    break
                  case 'Escape':
                    setShowSearchResults(false)
                    setSelectedIndex(-1)
                    break
                }
              }}
              className="pl-9 md:pl-10 pr-4 py-2 md:py-3 w-full border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            />
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchTerm.trim() !== "" && (
              <div className="search-results absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 md:max-h-96 overflow-y-auto">
                {filteredEmployees.length > 0 ? (
                  <div className="py-1">
                    {filteredEmployees.slice(0, 10).map((employee, index) => (
                      <div
                        key={employee.id}
                        className={`flex items-center space-x-3 p-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                          index === selectedIndex 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
               onClick={() => {
                 handleEmployeeClick(employee)
                 setShowSearchResults(false)
                 setSearchTerm("")
                 setSelectedIndex(-1)
               }}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={employee.profile_photo} alt={employee.full_name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-semibold text-sm">
                            {employee.full_name?.charAt(0) || employee.email?.charAt(0) || 'E'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">{employee.full_name}</h4>
                            <Badge 
                              variant={employee.role === 'admin' ? 'default' : employee.role === 'hr' ? 'secondary' : 'outline'} 
                              className="text-xs"
                            >
                              {employee.role}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{employee.email}</span>
                            </div>
                            {employee.department && (
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span className="truncate">{employee.department}</span>
                              </div>
                            )}
                            {employee.position && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{employee.position}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredEmployees.length > 10 && (
                      <div className="px-3 py-2 text-xs text-gray-500 text-center border-t border-gray-100">
                        Showing 10 of {filteredEmployees.length} results
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No employees found</p>
                    <p className="text-xs">Try different search terms</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
      </div>

      {/* Time Tracking Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl border border-gray-100 p-4 md:p-6 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-semibold mb-2">Time Tracking</h3>
            <p className="text-blue-100 mb-4 text-sm md:text-base">
              {stats.isCurrentlyClockedIn ? "You're currently clocked in" : "Ready to start your day?"}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Today: {stats.todayHours}h
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                This week: {stats.hoursThisWeek}h
              </span>
            </div>
          </div>
          <Button
            onClick={handleClockInOut}
            size="lg"
            className={`w-full md:w-auto ${stats.isCurrentlyClockedIn ? "bg-red-500 hover:bg-red-600" : "bg-white text-blue-600 hover:bg-gray-100"
              }`}
          >
            {stats.isCurrentlyClockedIn ? (
              <>
                <Pause className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Clock Out
              </>
            ) : (
              <>
                <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Clock In
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid-responsive-4 gap-responsive">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-xs md:text-sm font-medium text-gray-600">{stat.title}</h3>
              <div className={`w-6 h-6 md:w-8 md:h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className="flex items-center space-x-2">
              {stat.trend === "up" ? (
                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-emerald-600" />
              ) : (
                <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
              )}
              <span className={`text-xs md:text-sm font-medium ${stat.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
                {Math.abs(stat.growth)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Leave Management Section */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Leave Management</h2>
            <p className="text-sm md:text-base text-gray-600 mt-1">Track your leave balances and usage</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={fetchLeaveData}
              variant="outline"
              className="bg-white hover:bg-gray-50 text-sm md:text-base"
              disabled={isLeaveDataLoading}
              size="sm"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {isLeaveDataLoading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm md:text-base"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Request Leave
            </Button>
          </div>
        </div>

        {/* Leave Types Grid */}
        {isLeaveDataLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div className="text-right">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded mt-1"></div>
                    </div>
                  </div>
                  <div className="w-24 h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 ml-4 space-y-2">
                      <div className="w-full h-4 bg-gray-200 rounded"></div>
                      <div className="w-full h-2 bg-gray-200 rounded"></div>
                      <div className="w-12 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-6 bg-gray-200 rounded"></div>
                    <div className="w-12 h-4 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : getRealLeaveData().length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leave Data Available</h3>
            <p className="text-gray-600 mb-4">
              Your leave balances are not yet configured. Please contact HR to set up your leave entitlements.
            </p>
            <Button
              onClick={fetchLeaveData}
              variant="outline"
              className="bg-white hover:bg-gray-50"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Refresh Leave Data
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {getRealLeaveData().slice(0, 4).map((leaveType) => {
              // Pie chart data
              const pieData = [
                { name: 'Used', value: leaveType.usedDays, color: leaveType.color },
                { name: 'Remaining', value: leaveType.remainingDays, color: `${leaveType.color}20` }
              ]

              return (
                <Card key={leaveType.id} className={`relative overflow-hidden border-2 ${leaveType.borderColor} hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${leaveType.bgGradient} opacity-50`}></div>
                  <CardContent className="relative px-3 py-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-white/80 shadow-sm`}>
                        <leaveType.icon className={`w-6 h-6 ${leaveType.iconColor}`} />
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${leaveType.textColor}`}>
                          {leaveType.remainingDays}
                        </div>
                        <div className="text-xs text-gray-500">days left</div>
                      </div>
                    </div>

                    {/* Leave Type Name */}
                    <h3 className={`text-lg font-semibold ${leaveType.textColor} mb-3`}>
                      {leaveType.name}
                    </h3>

                    {/* Pie Chart */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-20 h-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={20}
                              outerRadius={35}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Used</span>
                            <span className={`font-semibold ${leaveType.textColor}`}>
                              {leaveType.usedDays}/{leaveType.totalDays}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500`}
                              style={{
                                width: `${leaveType.usagePercentage}%`,
                                backgroundColor: leaveType.color
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {leaveType.usagePercentage.toFixed(0)}% used
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${leaveType.remainingDays > leaveType.totalDays * 0.5
                          ? 'bg-green-100 text-green-800'
                          : leaveType.remainingDays > leaveType.totalDays * 0.2
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {leaveType.remainingDays > leaveType.totalDays * 0.5
                          ? 'Good Balance'
                          : leaveType.remainingDays > leaveType.totalDays * 0.2
                            ? 'Low Balance'
                            : 'Critical'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {leaveType.totalDays} total
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Summary Card */}
        {getRealLeaveData().length > 0 && (
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Leave Summary</h3>
                  <p className="text-gray-600 text-sm">
                    Total available leave days across all types
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-indigo-600">
                    {getRealLeaveData().reduce((sum, type) => sum + type.remainingDays, 0)}
                  </div>
                  <div className="text-sm text-gray-500">days remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>





      {/* Employee Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              {/* Employee Header */}
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedEmployee.profile_photo} alt={selectedEmployee.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-semibold text-xl">
                    {selectedEmployee.full_name?.charAt(0) || 'E'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedEmployee.full_name}</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={selectedEmployee.role === 'admin' ? 'default' : selectedEmployee.role === 'hr' ? 'secondary' : 'outline'}>
                      {selectedEmployee.role}
                    </Badge>
                    {selectedEmployee.department && (
                      <Badge variant="outline">{selectedEmployee.department}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Employee Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedEmployee.email}</p>
                    </div>
                  </div>
                  {selectedEmployee.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedEmployee.phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedEmployee.position && (
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Position</p>
                        <p className="font-medium">{selectedEmployee.position}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {selectedEmployee.birth_date && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">
                          {selectedEmployee.birth_date ?
                            new Date(selectedEmployee.birth_date).toLocaleDateString() :
                            "Not provided"
                          }
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedEmployee.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{selectedEmployee.address}</p>
                      </div>
                    </div>
                  )}
                  {selectedEmployee.created_at && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Joined</p>
                        <p className="font-medium">{new Date(selectedEmployee.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  {selectedEmployee.last_sign_in_at && (
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Last Active</p>
                        <p className="font-medium">{new Date(selectedEmployee.last_sign_in_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
