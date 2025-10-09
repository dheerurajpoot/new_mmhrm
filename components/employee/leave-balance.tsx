"use client"

import type React from "react"
import { toast } from "sonner"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Plus, Clock, Plane, Heart, Stethoscope, Laptop, HeartHandshake, Timer, Zap, Flower, Loader2, Sparkles } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { LeaveRequest } from "@/lib/types"

interface EmployeeLeaveBalanceProps {
  sectionData?: any;
}

export function EmployeeLeaveBalance({ sectionData }: EmployeeLeaveBalanceProps) {
  const [leaveBalances, setLeaveBalances] = useState<any[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [grantedLeaveTypes, setGrantedLeaveTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLeavePosting, setIsLeavePosting] = useState(false)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)

  const [leaveRequest, setLeaveRequest] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  })

  useEffect(() => {
    fetchLeaveData()
  }, [])

  const fetchLeaveData = async () => {
    try {
      setIsLoading(true)
      const [balancesResponse, requestsResponse, grantedTypesResponse] = await Promise.all([
        fetch("/api/employee/leave-balances"),
        fetch("/api/employee/leave-requests"),
        fetch("/api/employee/granted-leave-types"),
      ])

      if (balancesResponse.ok) {
        const balances = await balancesResponse.json()
        setLeaveBalances(balances || [])
        setIsLoading(false)
      }

      if (requestsResponse.ok) {
        const requests = await requestsResponse.json()
        setLeaveRequests(requests || [])
        setIsLoading(false)
      }

      if (grantedTypesResponse.ok) {
        const grantedTypes = await grantedTypesResponse.json()
        setGrantedLeaveTypes(grantedTypes || [])
        setIsLoading(false)
      }
    } catch (error) {
      setIsLoading(false)
      console.error("Error fetching leave data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const daysRequested = calculateDays(leaveRequest.start_date, leaveRequest.end_date)
      const selectedLeaveType = grantedLeaveTypes.find(lt => lt.leave_type === leaveRequest.leave_type)
      
      // Validate required fields
      if (!leaveRequest.leave_type || !leaveRequest.start_date || !leaveRequest.end_date || !leaveRequest.reason.trim()) {
        toast.error("Please fill in all required fields")
        return
      }
      
      // Validate that requested days don't exceed available balance
      if (selectedLeaveType && daysRequested > selectedLeaveType.remaining_days) {
        toast.error(`You only have ${selectedLeaveType.remaining_days} days left for ${leaveRequest.leave_type}`)
        return
      }
      setIsLeavePosting(true)
      const response = await fetch("/api/employee/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leave_type: leaveRequest.leave_type,
          start_date: leaveRequest.start_date,
          end_date: leaveRequest.end_date,
          days_requested: daysRequested,
          reason: leaveRequest.reason,
        }),
      })

      if (!response.ok) throw new Error("Failed to submit leave request")
        
        if (response.ok) {
          toast.success("Leave request submitted successfully!", {
            description: "Your leave request has been sent for approval.",
          })
        // Dispatch realtime notification for Admin/HR panels
        try {
          const { triggerDataUpdate } = require("@/components/shared/realtime-provider");
          triggerDataUpdate("leave_request", "New leave request submitted", "admin");
          triggerDataUpdate("leave_request", "New leave request submitted", "hr");
        } catch {}
          setLeaveRequest({
            leave_type: "",
            start_date: "",
            end_date: "",
            reason: "",
          })
          setIsRequestDialogOpen(false)
          setIsLeavePosting(false)
          fetchLeaveData()
      }

    } catch (error) {
      console.error("Error submitting leave request:", error)
      toast.error("Failed to submit leave request", {
        description: "There was an error submitting your leave request. Please try again.",
      })
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "pending":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case "annual":
        return "bg-red-100 text-red-800"
      case "sick":
        return "bg-red-100 text-red-800"
      case "personal":
        return "bg-purple-100 text-purple-800"
      case "maternity":
      case "paternity":
        return "bg-pink-100 text-pink-800"
      case "emergency":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
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
    <div className="space-responsive relative">
      {/* Leave Balances */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Leave Balances</CardTitle>
              <CardDescription>Your available leave days for {new Date().getFullYear()}</CardDescription>
            </div>
            <Button 
              onClick={() => setIsRequestDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Request Leave
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {leaveBalances.map((balance) => {
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
                } else {
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
              
              // Pie chart data
              const pieData = [
                { name: 'Used', value: balance.used_days, color: config.color },
                { name: 'Remaining', value: balance.remaining_days, color: `${config.color}20` }
              ]

              return (
                <Card key={balance.id} className={`relative overflow-hidden border-2 ${config.borderColor} hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-50`}></div>
                  <CardContent className="relative p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-white/80 shadow-sm`}>
                        <config.icon className={`w-6 h-6 ${config.iconColor}`} />
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${config.textColor}`}>
                          {balance.remaining_days}  
                        </div>
                        <div className="text-xs text-gray-500">days left</div>
                      </div>
                    </div>

                    {/* Leave Type Name */}
                    <h3 className={`text-lg font-semibold ${config.textColor} mb-3 capitalize`}>
                      {balance.leave_type}
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
                            <span className={`font-semibold ${config.textColor}`}>
                              {balance.used_days}/{balance.total_days}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500`}
                              style={{ 
                                width: `${usagePercentage}%`,
                                backgroundColor: config.color
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {usagePercentage.toFixed(0)}% used
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        balance.remaining_days > balance.total_days * 0.5 
                          ? 'bg-green-100 text-green-800' 
                          : balance.remaining_days > balance.total_days * 0.2 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {balance.remaining_days > balance.total_days * 0.5 
                          ? 'Good Balance' 
                          : balance.remaining_days > balance.total_days * 0.2 
                          ? 'Low Balance'
                          : 'Critical'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {balance.total_days} total
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests History */}
      <Card className="bg-gradient-to-br from-green-50 via-white to-green-50/30 border-green-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Calendar className="h-5 w-5" />
                Leave Request History
              </CardTitle>
              <CardDescription className="text-green-700/80">
                Track your leave requests and their current status
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-full">
                {leaveRequests.length} requests
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {leaveRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leave Requests Yet</h3>
              <p className="text-gray-500 mb-4">You haven't submitted any leave requests. Use the "Request Leave" button above to submit your first request.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaveRequests.map((request, index) => {
                // Get category colors and styles
                const getCategoryStyle = (leaveType: string) => {
                  switch (leaveType) {
                    case 'annual':
                      return {
                        bg: 'bg-gradient-to-br from-blue-50 via-white to-blue-50/30',
                        border: 'border-blue-100',
                        hoverBorder: 'hover:border-blue-200',
                        iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
                        icon: <Plane className="w-4 h-4 text-white" />,
                        textColor: 'text-blue-900'
                      };
                    case 'sick':
                      return {
                        bg: 'bg-gradient-to-br from-red-50 via-white to-red-50/30',
                        border: 'border-red-100',
                        hoverBorder: 'hover:border-red-200',
                        iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
                        icon: <Stethoscope className="w-4 h-4 text-white" />,
                        textColor: 'text-red-900'
                      };
                    case 'personal':
                      return {
                        bg: 'bg-gradient-to-br from-purple-50 via-white to-purple-50/30',
                        border: 'border-purple-100',
                        hoverBorder: 'hover:border-purple-200',
                        iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
                        icon: <Heart className="w-4 h-4 text-white" />,
                        textColor: 'text-purple-900'
                      };
                    case 'emergency':
                      return {
                        bg: 'bg-gradient-to-br from-orange-50 via-white to-orange-50/30',
                        border: 'border-orange-100',
                        hoverBorder: 'hover:border-orange-200',
                        iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
                        icon: <Zap className="w-4 h-4 text-white" />,
                        textColor: 'text-orange-900'
                      };
                    case 'maternity':
                      return {
                        bg: 'bg-gradient-to-br from-pink-50 via-white to-pink-50/30',
                        border: 'border-pink-100',
                        hoverBorder: 'hover:border-pink-200',
                        iconBg: 'bg-gradient-to-br from-pink-500 to-pink-600',
                        icon: <Heart className="w-4 h-4 text-white" />,
                        textColor: 'text-pink-900'
                      };
                    case 'paternity':
                      return {
                        bg: 'bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30',
                        border: 'border-indigo-100',
                        hoverBorder: 'hover:border-indigo-200',
                        iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
                        icon: <Heart className="w-4 h-4 text-white" />,
                        textColor: 'text-indigo-900'
                      };
                    default:
                      return {
                        bg: 'bg-gradient-to-br from-gray-50 via-white to-gray-50/30',
                        border: 'border-gray-100',
                        hoverBorder: 'hover:border-gray-200',
                        iconBg: 'bg-gradient-to-br from-gray-500 to-gray-600',
                        icon: <Calendar className="w-4 h-4 text-white" />,
                        textColor: 'text-gray-900'
                      };
                  }
                };

                const categoryStyle = getCategoryStyle(request.leave_type);

                return (
                  <div 
                    key={request.id}
                    className={`group relative ${categoryStyle.bg} backdrop-blur-sm rounded-xl border ${categoryStyle.border} p-4 hover:shadow-md ${categoryStyle.hoverBorder} transition-all duration-300 hover:bg-white/90`}
                  >
                    {/* Status Indicator */}
                    <div className="absolute top-3 right-3">
                      <div className={`w-2 h-2 rounded-full ${
                        request.status === 'approved' ? 'bg-green-500' :
                        request.status === 'pending' ? 'bg-yellow-500' :
                        request.status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
                      } ${request.status === 'pending' ? 'animate-pulse' : ''}`}></div>
                    </div>

                    {/* Compact Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${categoryStyle.iconBg}`}>
                          {categoryStyle.icon}
                        </div>
                        <div>
                          <h3 className={`font-semibold text-sm capitalize ${categoryStyle.textColor}`}>
                            {request.leave_type} Leave
                          </h3>
                          <p className="text-xs text-gray-500">
                            {request.days_requested} day{request.days_requested !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      
                      <Badge className={`px-2 py-0.5 text-xs font-medium ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Compact Content */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* Dates */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          {request.leave_type === 'annual' ? <Plane className="w-3 h-3" /> :
                           request.leave_type === 'sick' ? <Stethoscope className="w-3 h-3" /> :
                           request.leave_type === 'personal' ? <Heart className="w-3 h-3" /> :
                           request.leave_type === 'emergency' ? <Zap className="w-3 h-3" /> :
                           request.leave_type === 'maternity' ? <Heart className="w-3 h-3" /> :
                           request.leave_type === 'paternity' ? <Heart className="w-3 h-3" /> :
                           <Calendar className="w-3 h-3" />}
                          <span className="font-medium">Duration</span>
                        </div>
                        <div className="bg-white/60 rounded-md p-2">
                          <div className="text-xs font-medium text-gray-900">
                            {new Date(request.start_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            to {new Date(request.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Submitted Date */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">Submitted</span>
                        </div>
                        <div className="bg-white/60 rounded-md p-2">
                          <span className="text-xs font-medium text-gray-900">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reason (if exists) */}
                    {request.reason && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                          <HeartHandshake className="w-3 h-3" />
                          <span className="font-medium">Reason</span>
                        </div>
                        <div className="bg-white/60 rounded-md p-2">
                          <p className="text-xs text-gray-700 line-clamp-1">
                            {request.reason}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Compact Progress Bar for Pending Requests */}
                    {request.status === 'pending' && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Processing...</span>
                          <span>Under Review</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    )}

                    {/* Compact Status for Approved/Rejected */}
                    {(request.status === 'approved' || request.status === 'rejected') && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className={`flex items-center gap-1 text-xs ${
                          request.status === 'approved' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            request.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="font-medium">
                            {request.status === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg sm:text-xl">Request Leave</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Submit a new leave request for approval</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitRequest} className="space-y-3 sm:space-y-4">
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base">Select Leave Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                {grantedLeaveTypes.map((leaveType) => {
                  const getLeaveIcon = (type: string) => {
                    switch (type.toLowerCase()) {
                      case 'casual leave': return '✈️'
                      case 'sick leave': return '❤️'
                      case 'medical leave': return '🏥'
                      case 'work from home': return '💻'
                      case 'maternity leave': return '🤱'
                      case 'paternity leave': return '👨‍👶'
                      case 'emergency leave': return '⚡'
                      case 'personal leave': return '🌸'
                      default: return '📅'
                    }
                  }

                  const getLeaveColor = (type: string) => {
                    switch (type.toLowerCase()) {
                      case 'casual leave': return 'border-blue-300 bg-blue-50'
                      case 'sick leave': return 'border-red-300 bg-red-50'
                      case 'medical leave': return 'border-green-300 bg-green-50'
                      case 'work from home': return 'border-purple-300 bg-purple-50'
                      case 'maternity leave': return 'border-pink-300 bg-pink-50'
                      case 'paternity leave': return 'border-indigo-300 bg-indigo-50'
                      case 'emergency leave': return 'border-orange-300 bg-orange-50'
                      case 'personal leave': return 'border-teal-300 bg-teal-50'
                      default: return 'border-gray-300 bg-gray-50'
                    }
                  }

                  return (
                    <div
                      key={leaveType.id}
                      className={`p-1.5 sm:p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        leaveRequest.leave_type === leaveType.leave_type
                          ? `${getLeaveColor(leaveType.leave_type)} border-opacity-100 shadow-md`
                          : `${getLeaveColor(leaveType.leave_type)} border-opacity-50 hover:border-opacity-75`
                      }`}
                      onClick={() => setLeaveRequest({ ...leaveRequest, leave_type: leaveType.leave_type })}
                    >
                      <div className="flex sm:flex-row items-center gap-1 sm:gap-2">
                        <span className="text-sm sm:text-base">{getLeaveIcon(leaveType.leave_type)}</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-800 text-center truncate">{leaveType.leave_type}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Leave Balance Display */}
            {leaveRequest.leave_type && (
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">{leaveRequest.leave_type} Leave Balance</h4>
                {(() => {
                  const selectedLeaveType = grantedLeaveTypes.find(lt => lt.leave_type === leaveRequest.leave_type)
                  if (selectedLeaveType) {
                    return (
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                        <div>
                          <div className="text-sm sm:text-lg font-bold text-blue-600">{selectedLeaveType.total_days}</div>
                          <div className="text-xs text-gray-600">Total</div>
                        </div>
                        <div>
                          <div className="text-sm sm:text-lg font-bold text-orange-600">{selectedLeaveType.total_days - selectedLeaveType.remaining_days}</div>
                          <div className="text-xs text-gray-600">Used</div>
                        </div>
                        <div>
                          <div className="text-sm sm:text-lg font-bold text-green-600">{selectedLeaveType.remaining_days}</div>
                          <div className="text-xs text-gray-600">Left</div>
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="start_date" className="text-sm sm:text-base">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={leaveRequest.start_date}
                  onChange={(e) => setLeaveRequest({ ...leaveRequest, start_date: e.target.value })}
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="end_date" className="text-sm sm:text-base">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  required
                  min={leaveRequest.start_date || new Date().toISOString().split('T')[0]}
                  value={leaveRequest.end_date}
                  onChange={(e) => setLeaveRequest({ ...leaveRequest, end_date: e.target.value })}
                  className="text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Simple validation message */}
            {leaveRequest.start_date && leaveRequest.end_date && leaveRequest.leave_type && (
              <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-800">
                  Total days: {calculateDays(leaveRequest.start_date, leaveRequest.end_date)}
                </p>
                {(() => {
                  const selectedLeaveType = grantedLeaveTypes.find(lt => lt.leave_type === leaveRequest.leave_type)
                  const requestedDays = calculateDays(leaveRequest.start_date, leaveRequest.end_date)
                  if (selectedLeaveType && requestedDays > selectedLeaveType.remaining_days) {
                    return (
                      <p className="text-xs sm:text-sm text-red-600 mt-1">
                        ⚠️ You only have {selectedLeaveType.remaining_days} days left for {leaveRequest.leave_type}
                      </p>
                    )
                  }
                  return null
                })()}
              </div>
            )}
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="reason" className="text-sm sm:text-base">Reason <span className="text-red-500">*</span></Label>
              <Textarea
                id="reason"
                placeholder="Provide a reason for your leave request..."
                value={leaveRequest.reason}
                onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
                required
                className="text-sm sm:text-base min-h-[80px] sm:min-h-[100px]"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full text-sm sm:text-base py-2 sm:py-3"
              disabled={isLeavePosting || !leaveRequest.leave_type || !leaveRequest.start_date || !leaveRequest.end_date || !leaveRequest.reason.trim()}
            >
              {isLeavePosting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      <Button 
        onClick={() => setIsRequestDialogOpen(true)}
        className="fixed bottom-18 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center sm:hidden"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  )
}

export { EmployeeLeaveBalance as LeaveBalance }
