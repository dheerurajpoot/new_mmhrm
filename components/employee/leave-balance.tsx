"use client"

import type React from "react"

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Plus, Clock, Plane, Heart, Stethoscope, Laptop, HeartHandshake, Timer, Zap, Flower } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { LeaveRequest } from "@/lib/types"

export function EmployeeLeaveBalance() {
  const [leaveBalances, setLeaveBalances] = useState<any[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
      const [balancesResponse, requestsResponse] = await Promise.all([
        fetch("/api/employee/leave-balances"),
        fetch("/api/employee/leave-requests"),
      ])

      if (balancesResponse.ok) {
        const balances = await balancesResponse.json()
        setLeaveBalances(balances || [])
      }

      if (requestsResponse.ok) {
        const requests = await requestsResponse.json()
        setLeaveRequests(requests || [])
      }
    } catch (error) {
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

      setLeaveRequest({
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: "",
      })
      setIsRequestDialogOpen(false)
      fetchLeaveData()
    } catch (error) {
      console.error("Error submitting leave request:", error)
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
    <div className="space-responsive">
      {/* Leave Balances */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Leave Balances</CardTitle>
              <CardDescription>Your available leave days for {new Date().getFullYear()}</CardDescription>
            </div>
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Request Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Request Leave</DialogTitle>
                  <DialogDescription>Submit a new leave request for approval</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="leave_type">Leave Type</Label>
                    <Select
                      value={leaveRequest.leave_type}
                      onValueChange={(value) => setLeaveRequest({ ...leaveRequest, leave_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">Annual Leave</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="personal">Personal Leave</SelectItem>
                        <SelectItem value="maternity">Maternity Leave</SelectItem>
                        <SelectItem value="paternity">Paternity Leave</SelectItem>
                        <SelectItem value="emergency">Emergency Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-responsive">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        required
                        value={leaveRequest.start_date}
                        onChange={(e) => setLeaveRequest({ ...leaveRequest, start_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        required
                        value={leaveRequest.end_date}
                        onChange={(e) => setLeaveRequest({ ...leaveRequest, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  {leaveRequest.start_date && leaveRequest.end_date && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-800">
                        Total days: {calculateDays(leaveRequest.start_date, leaveRequest.end_date)}
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason (Optional)</Label>
                    <Textarea
                      id="reason"
                      placeholder="Provide a reason for your leave request..."
                      value={leaveRequest.reason}
                      onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Submit Request
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
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
      <Card>
        <CardHeader>
          <CardTitle>Leave Request History</CardTitle>
          <CardDescription>Your recent leave requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Dates</TableHead>
                  <TableHead className="hidden lg:table-cell">Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Badge className={getLeaveTypeColor(request.leave_type)}>
                        {request.leave_type.charAt(0).toUpperCase() + request.leave_type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm">
                        <p>{new Date(request.start_date).toLocaleDateString()}</p>
                        <p className="text-gray-500">to {new Date(request.end_date).toLocaleDateString()}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="font-medium">{request.days_requested}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {leaveRequests.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No leave requests found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { EmployeeLeaveBalance as LeaveBalance }
