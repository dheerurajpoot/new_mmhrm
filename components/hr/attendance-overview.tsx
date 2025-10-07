"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Clock, 
  Users, 
  Calendar,
  Filter,
  RefreshCw,
  MapPin,
  Coffee,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  TrendingUp,
  TrendingDown,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import type { TimeEntry } from "@/lib/types";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  department: string;
  position: string;
  profile_photo?: string;
}

interface TimeEntryWithEmployee extends TimeEntry {
  employee: Employee;
}

interface AttendanceStats {
  totalEmployees: number;
  clockedIn: number;
  onBreak: number;
  completed: number;
  totalHours: number;
  averageHours: number;
  attendanceRate: number;
}

export function AttendanceOverview() {
  const [timeEntries, setTimeEntries] = useState<TimeEntryWithEmployee[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<TimeEntryWithEmployee[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalEmployees: 0,
    clockedIn: 0,
    onBreak: 0,
    completed: 0,
    totalHours: 0,
    averageHours: 0,
    attendanceRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("today");

  // Fetch time entries
  const fetchTimeEntries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/time-entries?all=true');
      const result = await response.json();
      
      if (result.success) {
        setTimeEntries(result.data);
        setFilteredEntries(result.data);
        calculateStats(result.data);
      } else {
        toast.error("Failed to fetch attendance data");
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
      toast.error("Failed to fetch attendance data");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate attendance statistics
  const calculateStats = (entries: TimeEntryWithEmployee[]) => {
    const today = new Date().toDateString();
    const todayEntries = entries.filter(entry => 
      new Date(entry.date).toDateString() === today
    );

    const uniqueEmployees = new Set(todayEntries.map(entry => entry.employee_id));
    const clockedIn = todayEntries.filter(entry => entry.status === 'active').length;
    const onBreak = todayEntries.filter(entry => entry.status === 'break').length;
    const completed = todayEntries.filter(entry => entry.status === 'completed').length;
    
    const totalHours = todayEntries.reduce((sum, entry) => {
      if (entry.total_hours) return sum + entry.total_hours;
      if (entry.status === 'active' || entry.status === 'break') {
        const clockInTime = new Date(entry.clock_in).getTime();
        const now = Date.now();
        const elapsed = (now - clockInTime) / (1000 * 60 * 60);
        return sum + elapsed;
      }
      return sum;
    }, 0);

    const attendanceRate = uniqueEmployees.size > 0 ? (completed / uniqueEmployees.size) * 100 : 0;

    setStats({
      totalEmployees: uniqueEmployees.size,
      clockedIn,
      onBreak,
      completed,
      totalHours,
      averageHours: uniqueEmployees.size > 0 ? totalHours / uniqueEmployees.size : 0,
      attendanceRate,
    });
  };

  // Filter entries
  useEffect(() => {
    let filtered = timeEntries;

    // Date filter
    if (dateFilter === "today") {
      const today = new Date().toDateString();
      filtered = filtered.filter(entry => 
        new Date(entry.date).toDateString() === today
      );
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(entry => new Date(entry.date) >= weekAgo);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(entry => entry.status === statusFilter);
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(entry => entry.employee.department === departmentFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.employee.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEntries(filtered);
    if (dateFilter === "today") {
      calculateStats(filtered);
    }
  }, [timeEntries, searchTerm, statusFilter, departmentFilter, dateFilter]);

  useEffect(() => {
    fetchTimeEntries();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchTimeEntries, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format time display
  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'break':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">On Break</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Delete time entry
  const handleDeleteTimeEntry = async (entryId: string) => {
    if (!entryId) {
      toast.error("Invalid entry ID");
      return;
    }

    try {
      console.log('[HR Attendance Overview] Deleting time entry:', entryId);
      const response = await fetch(`/api/time-entries/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success("Time entry deleted successfully!");
        
        // Refresh time entries
        await fetchTimeEntries();
        
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('timeTrackingChanged'));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete time entry");
      }
    } catch (error) {
      console.error('[HR Attendance Overview] Error deleting time entry:', error);
      toast.error("Failed to delete time entry");
    }
  };

  const getDepartments = () => {
    const departments = Array.from(new Set(timeEntries.map(entry => entry.employee.department)));
    return departments.filter(dept => dept && dept !== "");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Overview</h2>
          <p className="text-gray-600">Monitor employee attendance and time tracking</p>
        </div>
        <Button
          onClick={fetchTimeEntries}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Employees</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Clocked In</p>
                <p className="text-2xl font-bold">{stats.clockedIn}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">On Break</p>
                <p className="text-2xl font-bold">{stats.onBreak}</p>
              </div>
              <Coffee className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Attendance Rate</p>
                <p className="text-2xl font-bold">{stats.attendanceRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="break">On Break</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {getDepartments().map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Attendance Records ({filteredEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading attendance data...
                    </TableCell>
                  </TableRow>
                ) : filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={entry.employee.profile_photo} />
                            <AvatarFallback>
                              {entry.employee.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{entry.employee.full_name}</div>
                            <div className="text-sm text-gray-500">{entry.employee.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{entry.employee.department}</TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Play className="w-3 h-3 text-green-600" />
                          <span className="text-sm">{formatTime(entry.clock_in)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.clock_out ? (
                          <div className="flex items-center gap-1">
                            <Pause className="w-3 h-3 text-red-600" />
                            <span className="text-sm">{formatTime(entry.clock_out)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        {entry.total_hours 
                          ? `${formatDuration(entry.total_hours)}h`
                          : entry.status === 'active' || entry.status === 'break'
                            ? 'In Progress'
                            : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm(
                                `Are you sure you want to delete this time entry?\n\nEmployee: ${entry.employee.full_name}\nDate: ${formatDate(entry.date)}\nClock In: ${formatTimeDisplay(entry.clock_in)}\nClock Out: ${entry.clock_out ? formatTimeDisplay(entry.clock_out) : 'Not completed'}\n\nThis action cannot be undone.`
                              )) {
                                handleDeleteTimeEntry(entry.id);
                              }
                            }}
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                            title="Delete this time entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
