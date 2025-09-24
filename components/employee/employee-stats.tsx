"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Home, DollarSign, Plus, Play, Pause, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Users, Search, Mail, Phone, MapPin, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { TeamMembers } from "./team-members"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

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

  useEffect(() => {
    fetchStats()
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmployees(employees)
    } else {
      const filtered = employees.filter(employee =>
        employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEmployees(filtered)
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
      const response = await fetch("/api/employees")
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
        setFilteredEmployees(data)
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
      value: stats.currentSalary ? `$${stats.currentSalary.toLocaleString()}` : "N/A",
      description: "Current rate",
      icon: DollarSign,
      growth: stats.salaryGrowth,
      trend: "up",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Time Tracking Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl border border-gray-100 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Time Tracking</h3>
            <p className="text-blue-100 mb-4">
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
              stats.isCurrentlyClockedIn ? "bg-red-500 hover:bg-red-600" : "bg-white text-blue-600 hover:bg-gray-100"
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
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Individual Leave Type Boxes */}
      {stats.leaveBalances.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stats.leaveBalances.map((balance) => (
            <div key={balance.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">{balance.leave_type}</h3>
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div className="mb-2">
                <p className="text-2xl font-bold text-gray-900">{balance.remaining_days}</p>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-600">
                  of {balance.total_days} days
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

       {/* Employee Search Section */}
       <div className="bg-white rounded-2xl border border-gray-100 p-6">
         <h3 className="text-lg font-semibold text-gray-900 mb-6">Search Employees</h3>
         
         {/* Search Bar */}
         <div className="relative mb-6">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
           <Input
             type="text"
             placeholder="Search employees by name, email, department, or position..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-10 pr-4 py-3 w-full border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
           />
         </div>

         {/* Search Results */}
         <div className="space-y-4">
           {filteredEmployees.length > 0 ? (
             filteredEmployees.map((employee) => (
               <div 
                 key={employee.id} 
                 className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all duration-200 cursor-pointer"
                 onClick={() => handleEmployeeClick(employee)}
               >
                 <Avatar className="w-12 h-12">
                   <AvatarImage src={employee.profile_photo} alt={employee.full_name} />
                   <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-semibold">
                     {employee.full_name?.charAt(0) || 'E'}
                   </AvatarFallback>
                 </Avatar>
                 <div className="flex-1">
                   <div className="flex items-center space-x-2 mb-1">
                     <h4 className="text-lg font-semibold text-gray-900">{employee.full_name}</h4>
                     <Badge variant={employee.role === 'admin' ? 'default' : employee.role === 'hr' ? 'secondary' : 'outline'}>
                       {employee.role}
                     </Badge>
                   </div>
                   <div className="flex items-center space-x-4 text-sm text-gray-600">
                     <div className="flex items-center space-x-1">
                       <Mail className="w-4 h-4" />
                       <span>{employee.email}</span>
                     </div>
                     {employee.department && (
                       <div className="flex items-center space-x-1">
                         <User className="w-4 h-4" />
                         <span>{employee.department}</span>
                       </div>
                     )}
                     {employee.position && (
                       <div className="flex items-center space-x-1">
                         <MapPin className="w-4 h-4" />
                         <span>{employee.position}</span>
                       </div>
                     )}
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="text-sm text-gray-500">Click to view details</p>
                 </div>
               </div>
             ))
           ) : (
             <div className="text-center py-12 text-gray-500">
               <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
               <p className="text-lg font-medium">No employees found</p>
               <p className="text-sm">Try adjusting your search terms</p>
             </div>
           )}
         </div>
       </div>

       {/* Leave Balances and Team Members Section */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Leave Balances */}
         <div className="bg-white rounded-2xl border border-gray-100 p-6">
           <h3 className="text-lg font-semibold text-gray-900 mb-6">Leave Balances</h3>
           <div className="space-y-4">
             {stats.leaveBalances.length > 0 ? (
               stats.leaveBalances.map((balance, index) => (
                 <div key={balance.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                   <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                     {balance.leave_type.charAt(0)}
                   </div>
                   <div className="flex-1">
                     <p className="text-sm font-medium text-gray-900">{balance.leave_type}</p>
                     <p className="text-xs text-gray-500">{balance.remaining_days} of {balance.total_days} days remaining</p>
                   </div>
                   <div className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                     {balance.remaining_days} days
                   </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-8 text-gray-500">
                 <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                 <p>No leave balances available</p>
               </div>
             )}
           </div>
         </div>

         {/* Team Members */}
         <div className="bg-white rounded-2xl border border-gray-100 p-6">
           <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Members</h3>
           <TeamMembers />
         </div>
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
                         <p className="font-medium">{new Date(selectedEmployee.birth_date).toLocaleDateString()}</p>
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
