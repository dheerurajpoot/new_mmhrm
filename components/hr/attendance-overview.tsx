"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Clock, Calendar } from "lucide-react"

interface TimeEntryWithProfile {
  id: string
  employee_id: string
  date: string
  clock_in: string
  clock_out?: string
  total_hours: number
  employee_name: string
  employee_department: string
}

export function AttendanceOverview() {
  const [timeEntries, setTimeEntries] = useState<TimeEntryWithProfile[]>([])
  const [filteredEntries, setFilteredEntries] = useState<TimeEntryWithProfile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTimeEntries()
  }, [])

  useEffect(() => {
    const filtered = timeEntries.filter(
      (entry) =>
        entry.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.employee_department?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredEntries(filtered)
  }, [timeEntries, searchTerm])

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch("/api/time-entries")
      const data = await response.json()

      setTimeEntries(data || [])
    } catch (error) {
      console.error("Error fetching time entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    // Use local time formatting to show user's timezone
    return time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  const getStatusBadge = (entry: TimeEntryWithProfile) => {
    if (!entry.clock_out) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Active</Badge>
    }
    if (entry.total_hours >= 8) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Full Day</Badge>
    }
    if (entry.total_hours >= 4) {
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Half Day</Badge>
    }
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Short Day</Badge>
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
        <CardTitle>Attendance Overview</CardTitle>
        <CardDescription>Employee attendance records for the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-6">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by employee name or department..."
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
                <TableHead>Date</TableHead>
                <TableHead className="hidden md:table-cell">Clock In</TableHead>
                <TableHead className="hidden md:table-cell">Clock Out</TableHead>
                <TableHead className="hidden lg:table-cell">Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{entry.employee_name || "No name"}</p>
                      <p className="text-sm text-gray-500">{entry.employee_department || "No department"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{new Date(entry.date).toLocaleDateString()}</p>
                      <p className="text-gray-500">
                        {new Date(entry.date).toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-sm">{formatTime(entry.clock_in)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {entry.clock_out ? (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-sm">{formatTime(entry.clock_out)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Still active</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="font-medium">
                      {entry.clock_out ? `${entry.total_hours.toFixed(1)}h` : "In progress"}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(entry)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No attendance records found matching your search.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
