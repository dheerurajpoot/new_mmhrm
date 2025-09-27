"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Check, X, Calendar } from "lucide-react"
import { toast } from "sonner"
import type { LeaveRequest, Profile } from "@/lib/types"

interface LeaveRequestWithProfile extends LeaveRequest {
  employee: Profile
}

export function LeaveApprovals() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestWithProfile[]>([])
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequestWithProfile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  useEffect(() => {
    const filtered = leaveRequests.filter(
      (request) =>
        request.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.leave_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.status.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredRequests(filtered)
  }, [leaveRequests, searchTerm])

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch("/api/leave-requests")
      if (!response.ok) throw new Error("Failed to fetch leave requests")
      const data = await response.json()
      setLeaveRequests(data || [])
    } catch (error) {
      console.error("Error fetching leave requests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveReject = async (requestId: string, status: "approved" | "rejected") => {
    try {
      toast.loading(`${status === "approved" ? "Approving" : "Rejecting"} leave request...`, {
        description: "Please wait while we process your request.",
      });

      const response = await fetch(`/api/leave-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status,
          approved_by: "admin" // You might want to get this from user context
        }),
      })

      if (!response.ok) throw new Error("Failed to update leave request")

      toast.success(`Leave request ${status} successfully!`, {
        description: status === "approved" ? "The leave request has been approved." : "The leave request has been rejected.",
      })

      fetchLeaveRequests()
    } catch (error) {
      console.error("Error updating leave request:", error)
      toast.error("Failed to update leave request", {
        description: "There was an error processing your request. Please try again.",
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

  const getLeaveTypeBadgeColor = (type: string) => {
    switch (type) {
      case "annual":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "sick":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "personal":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "maternity":
      case "paternity":
        return "bg-pink-100 text-pink-800 hover:bg-pink-100"
      case "emergency":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Request Approvals</CardTitle>
        <CardDescription>Review and approve employee leave requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-6">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by employee name, leave type, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead className="hidden md:table-cell">Dates</TableHead>
                <TableHead className="hidden lg:table-cell">Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.employee?.full_name || "No name"}</p>
                      <p className="text-sm text-gray-500">{request.employee?.department || "No department"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getLeaveTypeBadgeColor(request.leave_type)}>
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
                  <TableCell>
                    {request.status === "pending" && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveReject(request.id, "approved")}
                          className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveReject(request.id, "rejected")}
                          className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {request.status !== "pending" && (
                      <div className="text-sm text-gray-500">
                        {request.approved_at && (
                          <p>
                            {request.status === "approved" ? "Approved" : "Rejected"} on{" "}
                            {new Date(request.approved_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No leave requests found matching your search.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
