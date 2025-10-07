"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Removed Select imports since we're using native HTML select elements
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Clock,
	Users,
	Calendar,
	Filter,
	Download,
	RefreshCw,
  MapPin,
  Coffee,
	CheckCircle,
	AlertCircle,
  Play,
  Pause,
  TrendingUp,
  TrendingDown,
  Activity,
  Timer,
  Zap,
  Target,
  BarChart3,
  Eye,
  Search,
  CalendarDays,
  Building2,
  UserCheck,
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
}

export function AttendanceManagement() {
  const [timeEntries, setTimeEntries] = useState<TimeEntryWithEmployee[]>([]);
	const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<TimeEntryWithEmployee[]>([]);
	const [stats, setStats] = useState<AttendanceStats>({
		totalEmployees: 0,
    clockedIn: 0,
    onBreak: 0,
    completed: 0,
    totalHours: 0,
    averageHours: 0,
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
      console.log('[Attendance Management] Fetching time entries...');
      const response = await fetch('/api/time-entries?all=true');
      console.log('[Attendance Management] Response status:', response.status);
      
      if (!response.ok) {
        console.error('[Attendance Management] Response not OK:', response.status, response.statusText);
        if (response.status === 404) {
          toast.error("Time tracking API not available. Please ensure the server is running.");
        } else if (response.status === 401) {
          toast.error("Please log in to view attendance data.");
			} else {
          toast.error(`Failed to fetch attendance data: ${response.status}`);
        }
        return;
      }
      
      const result = await response.json();
      console.log('[Attendance Management] Result:', result);
      
      if (result.success) {
        setTimeEntries(result.data);
        setFilteredEntries(result.data);
        calculateStats(result.data);
        console.log('[Attendance Management] Successfully loaded', result.data.length, 'entries');
			} else {
        console.error('[Attendance Management] API returned error:', result.error);
        toast.error(result.error || "Failed to fetch attendance data");
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

			setStats({
      totalEmployees: uniqueEmployees.size,
      clockedIn,
      onBreak,
      completed,
      totalHours,
      averageHours: uniqueEmployees.size > 0 ? totalHours / uniqueEmployees.size : 0,
    });
  };

  // Filter entries
  useEffect(() => {
    console.log('[Attendance Management] Applying filters:', { 
      dateFilter, 
      statusFilter, 
      departmentFilter, 
      searchTerm,
      totalEntries: timeEntries.length 
    });
    
    let filtered = timeEntries;

    // Date filter
    if (dateFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= today && entryDate < tomorrow;
      });
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekAgo;
      });
    }

		// Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(entry => entry.status === statusFilter);
		}

		// Department filter
		if (departmentFilter !== "all") {
      filtered = filtered.filter(entry => entry.employee && entry.employee.department === departmentFilter);
		}

		// Search filter
		if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.employee && (
          entry.employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
		}

    console.log('[Attendance Management] Filtered results:', { 
      filteredCount: filtered.length,
      originalCount: timeEntries.length 
    });
    
		setFilteredEntries(filtered);
    if (dateFilter === "today") {
      calculateStats(filtered);
    }
  }, [timeEntries, searchTerm, statusFilter, departmentFilter, dateFilter]);

  useEffect(() => {
    fetchTimeEntries();
    
    // Listen for time tracking changes
    const handleTimeTrackingChange = () => {
      console.log("[Attendance Management] Time tracking change detected, refreshing...");
      fetchTimeEntries();
    };

    window.addEventListener('timeTrackingChanged', handleTimeTrackingChange);
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchTimeEntries, 30000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('timeTrackingChanged', handleTimeTrackingChange);
    };
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
      console.log('[Attendance Management] Deleting time entry:', entryId);
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
      console.error('[Attendance Management] Error deleting time entry:', error);
      toast.error("Failed to delete time entry");
    }
  };

	const getDepartments = () => {
    const departments = Array.from(new Set(timeEntries
      .filter(entry => entry.employee && entry.employee.department)
      .map(entry => entry.employee.department)
    ));
    return departments.filter(dept => dept && dept !== "");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
          <p className="text-gray-600">Monitor employee time tracking and attendance</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchTimeEntries}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Modern Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-700">Total Employees</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-blue-900">{stats.totalEmployees}</p>
                  <span className="text-sm text-blue-600">active</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>All departments</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            </div>
          </CardContent>
        </Card>

        {/* Clocked In Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-700">Currently Working</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-green-900">{stats.clockedIn}</p>
                  <span className="text-sm text-green-600">employees</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Activity className="w-3 h-3" />
                  <span>{stats.totalEmployees > 0 ? ((stats.clockedIn / stats.totalEmployees) * 100).toFixed(1) : 0}% active</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            </div>
          </CardContent>
        </Card>

        {/* On Break Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Coffee className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-orange-700">On Break</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-orange-900">{stats.onBreak}</p>
                  <span className="text-sm text-orange-600">employees</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <Timer className="w-3 h-3" />
                  <span>Taking rest</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            </div>
          </CardContent>
        </Card>

        {/* Total Hours Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-purple-700">Today's Hours</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-purple-900">{stats.totalHours.toFixed(1)}</p>
                  <span className="text-sm text-purple-600">hours</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <Target className="w-3 h-3" />
                  <span>Avg: {stats.averageHours.toFixed(1)}h per person</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Filters Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-gray-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xl font-semibold">Filter & Search</span>
            <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>{filteredEntries.length} of {timeEntries.length} records</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search Filter */}
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Search className="w-4 h-4" />
                Search Employees
              </Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Search by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CalendarDays className="w-4 h-4" />
                Date Range
              </Label>
              <select 
                value={dateFilter} 
                onChange={(e) => {
                  console.log('[Attendance Management] Date filter changed to:', e.target.value);
                  setDateFilter(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-700"
              >
                <option value="today">📅 Today</option>
                <option value="week">📊 This Week</option>
                <option value="all">🗓️ All Time</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Activity className="w-4 h-4" />
                Status
              </Label>
              <select 
                value={statusFilter} 
                onChange={(e) => {
                  console.log('[Attendance Management] Status filter changed to:', e.target.value);
                  setStatusFilter(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-700"
              >
                <option value="all">🔄 All Status</option>
                <option value="active">✅ Active</option>
                <option value="break">☕ On Break</option>
                <option value="completed">🏁 Completed</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building2 className="w-4 h-4" />
                Department
              </Label>
              <select 
                value={departmentFilter} 
                onChange={(e) => {
                  console.log('[Attendance Management] Department filter changed to:', e.target.value);
                  setDepartmentFilter(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-700"
              >
                <option value="all">🏢 All Departments</option>
                {getDepartments().map(dept => (
                  <option key={dept} value={dept}>🏬 {dept}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Filter Summary */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Zap className="w-4 h-4" />
              <span className="font-medium">Active Filters:</span>
              {searchTerm && <Badge variant="secondary" className="bg-blue-100 text-blue-700">Search: "{searchTerm}"</Badge>}
              {dateFilter !== "all" && <Badge variant="secondary" className="bg-blue-100 text-blue-700">Date: {dateFilter}</Badge>}
              {statusFilter !== "all" && <Badge variant="secondary" className="bg-blue-100 text-blue-700">Status: {statusFilter}</Badge>}
              {departmentFilter !== "all" && <Badge variant="secondary" className="bg-blue-100 text-blue-700">Dept: {departmentFilter}</Badge>}
              {!searchTerm && dateFilter === "all" && statusFilter === "all" && departmentFilter === "all" && (
                <span className="text-blue-600">No filters applied - showing all records</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modern Attendance Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Attendance Records</h3>
                <p className="text-sm text-gray-600">Real-time employee attendance tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">{filteredEntries.length}</div>
                <div className="text-xs text-gray-500">records shown</div>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <Button 
                onClick={fetchTimeEntries}
                disabled={isLoading}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
						<Table className="min-w-full">
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-700 py-4">👤 Employee</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">🏢 Department</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">📅 Date</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">🕐 Clock In</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">🕐 Clock Out</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">📊 Status</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">⏱️ Total Hours</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">🗑️ Actions</TableHead>
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
                            <AvatarImage src={entry.employee?.profile_photo} />
                            <AvatarFallback>
                              {entry.employee?.full_name?.charAt(0) || 'U'}
															</AvatarFallback>
														</Avatar>
														<div>
                            <div className="font-medium">{entry.employee?.full_name || 'Unknown Employee'}</div>
                            <div className="text-sm text-gray-500">{entry.employee?.email || 'No email'}</div>
														</div>
													</div>
												</TableCell>
                      <TableCell>{entry.employee?.department || 'Unknown'}</TableCell>
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
                                `Are you sure you want to delete this time entry?\n\nEmployee: ${entry.employee?.full_name || 'Unknown'}\nDate: ${formatDate(entry.date)}\nClock In: ${formatTimeDisplay(entry.clock_in)}\nClock Out: ${entry.clock_out ? formatTimeDisplay(entry.clock_out) : 'Not completed'}\n\nThis action cannot be undone.`
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
