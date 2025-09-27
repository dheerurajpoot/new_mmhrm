"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Clock, 
  Users, 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react"
import { toast } from "sonner"

interface TimeEntry {
  _id: string
  employee_id: string
  clock_in: string
  clock_out?: string
  break_duration: number
  total_hours?: number
  notes?: string
  date: string
  created_at: string
  updated_at: string
}

interface Employee {
  _id: string
  full_name: string
  email: string
  profile_photo?: string
  department?: string
  position?: string
}

interface AttendanceStats {
  totalEmployees: number
  clockedInToday: number
  clockedOutToday: number
  activeEmployees: number
  attendanceRate: number
}

export function AttendanceManagement() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([])
  const [stats, setStats] = useState<AttendanceStats>({
    totalEmployees: 0,
    clockedInToday: 0,
    clockedOutToday: 0,
    activeEmployees: 0,
    attendanceRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("today")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [timeEntries, employees, searchTerm, dateFilter, statusFilter, departmentFilter])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      const [timeEntriesRes, employeesRes] = await Promise.all([
        fetch("/api/time-entries?limit=1000"),
        fetch("/api/employees")
      ])

      if (timeEntriesRes.ok) {
        const timeEntriesData = await timeEntriesRes.json()
        setTimeEntries(timeEntriesData || [])
      }

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        setEmployees(employeesData || [])
      }

      await calculateStats()
    } catch (error) {
      console.error("Error fetching attendance data:", error)
      toast.error("Failed to load attendance data", {
        description: "There was an error loading the attendance information."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const endOfToday = new Date(today)
      endOfToday.setHours(23, 59, 59, 999)

      const todayEntries = timeEntries.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate >= today && entryDate <= endOfToday
      })

      // Get unique employees who clocked in today
      const uniqueClockIns = new Set(todayEntries.map(entry => entry.employee_id))
      const clockedInToday = uniqueClockIns.size
      
      // Get unique employees who clocked out today
      const clockedOutEntries = todayEntries.filter(entry => entry.clock_out)
      const uniqueClockOuts = new Set(clockedOutEntries.map(entry => entry.employee_id))
      const clockedOutToday = uniqueClockOuts.size
      
      // Get unique employees who are currently active (clocked in but not out)
      const activeEntries = todayEntries.filter(entry => !entry.clock_out)
      const uniqueActive = new Set(activeEntries.map(entry => entry.employee_id))
      const activeEmployees = uniqueActive.size
      
      const attendanceRate = employees.length > 0 ? (clockedInToday / employees.length) * 100 : 0

      setStats({
        totalEmployees: employees.length,
        clockedInToday,
        clockedOutToday,
        activeEmployees,
        attendanceRate: Math.round(attendanceRate * 100) / 100
      })
    } catch (error) {
      console.error("Error calculating stats:", error)
    }
  }

  const applyFilters = () => {
    let filtered = [...timeEntries]

    // Date filter
    if (dateFilter === "today") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const endOfToday = new Date(today)
      endOfToday.setHours(23, 59, 59, 999)
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate >= today && entryDate <= endOfToday
      })
    } else if (dateFilter === "week") {
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate >= startOfWeek
      })
    } else if (dateFilter === "month") {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate >= startOfMonth
      })
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter(entry => !entry.clock_out)
    } else if (statusFilter === "completed") {
      filtered = filtered.filter(entry => entry.clock_out)
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(entry => {
        const employee = employees.find(emp => emp._id === entry.employee_id)
        return employee?.department === departmentFilter
      })
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => {
        const employee = employees.find(emp => emp._id === entry.employee_id)
        return employee?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               employee?.email.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    setFilteredEntries(filtered)
  }

  const getEmployeeInfo = (employeeId: string) => {
    return employees.find(emp => emp._id === employeeId) || {
      _id: employeeId,
      full_name: "Unknown Employee",
      email: "unknown@example.com",
      department: "Unknown",
      position: "Unknown"
    }
  }

  const getStatusBadge = (entry: TimeEntry) => {
    if (!entry.clock_out) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><Activity className="w-3 h-3 mr-1" />Active</Badge>
    }
    if (entry.total_hours && entry.total_hours >= 8) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><CheckCircle className="w-3 h-3 mr-1" />Full Day</Badge>
    }
    if (entry.total_hours && entry.total_hours >= 4) {
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100"><AlertCircle className="w-3 h-3 mr-1" />Half Day</Badge>
    }
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Short Day</Badge>
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const exportData = () => {
    const csvContent = [
      ["Employee Name", "Email", "Department", "Date", "Clock In", "Clock Out", "Total Time", "Status"],
      ...filteredEntries.map(entry => {
        const employee = getEmployeeInfo(entry.employee_id)
        return [
          employee.full_name,
          employee.email,
          employee.department || "N/A",
          formatDate(entry.date),
          formatTime(entry.clock_in),
          entry.clock_out ? formatTime(entry.clock_out) : "N/A",
          entry.total_hours ? formatTimeDisplay(entry.total_hours) : "N/A",
          entry.clock_out ? "Completed" : "Active"
        ]
      })
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success("Attendance data exported successfully!", {
      description: "The CSV file has been downloaded to your device."
    })
  }

  const getDepartments = () => {
    const departments = new Set(employees.map(emp => emp.department).filter(Boolean))
    return Array.from(departments)
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Beautiful Modern Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees Card */}
        <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 hover:from-blue-100 hover:via-blue-100 hover:to-indigo-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full -translate-y-16 translate-x-16"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Employees</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
                <p className="text-sm text-blue-600 font-medium">All registered staff</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between text-xs text-blue-600">
                <span>Active today</span>
                <span className="font-semibold">{stats.clockedInToday} of {stats.totalEmployees}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clocked In Today Card */}
        <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 via-green-50 to-emerald-50 hover:from-green-100 hover:via-green-100 hover:to-emerald-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full -translate-y-16 translate-x-16"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Clocked In Today</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.clockedInToday}</p>
                <p className="text-sm text-green-600 font-medium">Currently active staff</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="flex items-center justify-between text-xs text-green-600">
                <span>Still working</span>
                <span className="font-semibold">{stats.activeEmployees} active</span>
              </div>
              <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.totalEmployees > 0 ? (stats.clockedInToday / stats.totalEmployees) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clocked Out Today Card */}
        <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 via-purple-50 to-violet-50 hover:from-purple-100 hover:via-purple-100 hover:to-violet-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-violet-200/30 rounded-full -translate-y-16 translate-x-16"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Clocked Out Today</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.clockedOutToday}</p>
                <p className="text-sm text-purple-600 font-medium">Completed work today</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-purple-200">
              <div className="flex items-center justify-between text-xs text-purple-600">
                <span>Work completed</span>
                <span className="font-semibold">{stats.clockedOutToday} finished</span>
              </div>
              <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.totalEmployees > 0 ? (stats.clockedOutToday / stats.totalEmployees) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Rate Card */}
        <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 via-orange-50 to-amber-50 hover:from-orange-100 hover:via-orange-100 hover:to-amber-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full -translate-y-16 translate-x-16"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-semibold text-orange-700 uppercase tracking-wide">Attendance Rate</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.attendanceRate}%</p>
                <p className="text-sm text-orange-600 font-medium">Daily participation</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-orange-200">
              <div className="flex items-center justify-between text-xs text-orange-600">
                <span>Target: 90%</span>
                <span className="font-semibold">{stats.attendanceRate >= 90 ? "Great!" : "Needs improvement"}</span>
              </div>
              <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(stats.attendanceRate, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Filters and Actions */}
      <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-gray-800">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Attendance Management</h3>
              <p className="text-sm text-gray-600 font-medium">Monitor and manage employee attendance and time tracking</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Modern Filter Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <h4 className="font-semibold text-blue-800">Filter & Search Options</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Search Employees</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Department</label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {getDepartments().map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Actions</label>
                <div className="flex gap-2">
                  <Button 
                    onClick={fetchData} 
                    variant="outline" 
                    size="sm"
                    className="flex-1 bg-white hover:bg-gray-50 border-gray-200 text-gray-700 rounded-xl"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    onClick={exportData} 
                    variant="outline" 
                    size="sm"
                    className="flex-1 bg-white hover:bg-gray-50 border-gray-200 text-gray-700 rounded-xl"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modern Attendance Table */}
      <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-gray-800">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Attendance Records</h3>
                  <p className="text-sm text-gray-600 font-medium">Showing {filteredEntries.length} attendance records</p>
                </div>
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Live Data</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-white rounded-b-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="text-gray-700 font-semibold py-4">Employee</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">Department</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">Date</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">Clock In</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">Clock Out</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">Total Time</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 p-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Users className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Attendance Records Found</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          No attendance records match your current filters. Try adjusting your search criteria or date range.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry, index) => {
                    const employee = getEmployeeInfo(entry.employee_id)
                    return (
                      <TableRow 
                        key={entry._id}
                        className={`border-0 hover:bg-gray-50/50 transition-colors duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                              <AvatarImage src={employee.profile_photo} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                                {employee.full_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900">{employee.full_name}</p>
                              <p className="text-sm text-gray-500">{employee.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                            {employee.department || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{formatDate(entry.date)}</p>
                            <p className="text-gray-500 text-xs">
                              {new Date(entry.date).toLocaleDateString("en-US", { weekday: "short" })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Clock className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="font-medium text-gray-700">{formatTime(entry.clock_in)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {entry.clock_out ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <Clock className="h-4 w-4 text-red-600" />
                              </div>
                              <span className="font-medium text-gray-700">{formatTime(entry.clock_out)}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                              </div>
                              <span className="text-gray-500 font-medium">Still active</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          {entry.total_hours ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-600">T</span>
                              </div>
                              <span className="font-semibold text-gray-900">{formatTimeDisplay(entry.total_hours)}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-500">-</span>
                              </div>
                              <span className="text-gray-400 font-medium">In progress</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-4">{getStatusBadge(entry)}</TableCell>
                        <TableCell className="py-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
