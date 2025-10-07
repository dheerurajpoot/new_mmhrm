"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, 
  Play, 
  Pause, 
  Coffee, 
  MapPin, 
  Calendar,
  Timer,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Activity,
  Eye,
  Download,
  Filter,
  Search,
  CalendarDays,
  Building2,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getCurrentUser } from "@/lib/auth/client";
import type { TimeEntry } from "@/lib/types";

interface TimeTrackingProps {
  sectionData?: any;
}

interface CurrentTimeEntry {
  id: string;
  clock_in: string;
  clock_out?: string;
  break_start?: string;
  break_end?: string;
  status: 'active' | 'completed' | 'break';
  location?: string;
  notes?: string;
  total_hours?: number;
  break_duration: number;
}

interface AttendanceRecord {
  id: string;
  clock_in: string;
  clock_out?: string;
  break_start?: string;
  break_end?: string;
  total_hours?: number;
  break_duration: number;
  status: 'active' | 'completed' | 'break';
  location?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export function TimeTracking({ sectionData }: TimeTrackingProps) {
  const [currentEntry, setCurrentEntry] = useState<CurrentTimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [breakTime, setBreakTime] = useState(0);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isRealTime, setIsRealTime] = useState(false);
  
  // Attendance records state
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const breakIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch attendance records
  const fetchAttendanceRecords = async () => {
    try {
      setIsLoadingRecords(true);
      const user = await getCurrentUser();
      if (!user) return;

      console.log('[Time Tracking] Fetching attendance records for user:', user.id);
      const response = await fetch('/api/time-entries');
      
      if (response.ok) {
        const result = await response.json();
        console.log('[Time Tracking] Attendance records result:', result);
        
        if (result.success && result.data) {
          const records = result.data.map((entry: any) => ({
            id: entry.id || entry._id?.toString(),
            clock_in: entry.clock_in,
            clock_out: entry.clock_out,
            break_start: entry.break_start,
            break_end: entry.break_end,
            total_hours: entry.total_hours,
            break_duration: entry.break_duration || 0,
            status: entry.status,
            location: entry.location,
            date: entry.date,
            created_at: entry.created_at,
            updated_at: entry.updated_at,
          }));
          
          setAttendanceRecords(records);
          setFilteredRecords(records);
          console.log('[Time Tracking] Set attendance records:', records.length);
        }
      } else {
        console.error('[Time Tracking] Failed to fetch attendance records:', response.status);
      }
    } catch (error) {
      console.error('[Time Tracking] Error fetching attendance records:', error);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // Real-time clock update
  useEffect(() => {
    const updateClock = () => {
      if (currentEntry?.status === 'active') {
        const clockInTime = new Date(currentEntry.clock_in).getTime();
        const now = Date.now();
        const elapsed = now - clockInTime;
        setElapsedTime(elapsed);
      } else if (currentEntry?.status === 'break' && currentEntry.break_start) {
        const breakStartTime = new Date(currentEntry.break_start).getTime();
        const now = Date.now();
        const breakElapsed = now - breakStartTime;
        setBreakTime(breakElapsed);
      }
    };

    if (currentEntry?.status === 'active' || currentEntry?.status === 'break') {
      updateClock();
      intervalRef.current = setInterval(updateClock, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (breakIntervalRef.current) {
        clearInterval(breakIntervalRef.current);
        breakIntervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (breakIntervalRef.current) clearInterval(breakIntervalRef.current);
    };
  }, [currentEntry]);

  // Fetch current time entry
  const fetchCurrentEntry = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const response = await fetch('/api/time-entries?action=get_current', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_current' })
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentEntry(result.data);
        setIsRealTime(true);
      }
    } catch (error) {
      console.error('Error fetching current entry:', error);
    }
  };

  // Filter records
  useEffect(() => {
    let filtered = attendanceRecords;

    // Date filter
    if (dateFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= today && recordDate < tomorrow;
      });
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= weekAgo;
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Search filter (for location)
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  }, [attendanceRecords, dateFilter, statusFilter, searchTerm]);

  useEffect(() => {
    fetchCurrentEntry();
    fetchAttendanceRecords();
  }, []);

  // Format time display
  const formatTime = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format time for display
  const formatTimeDisplay = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  // Format duration for display
  const formatDuration = (hours: number): string => {
    if (!hours || hours === 0) return '0h 0m';
    
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    return `${wholeHours}h ${minutes}m`;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">🟢 Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">✅ Completed</Badge>;
      case 'break':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">☕ On Break</Badge>;
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
      const user = await getCurrentUser();
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      console.log('[Time Tracking] Deleting time entry:', entryId);
      const response = await fetch(`/api/time-entries/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success("Time entry deleted successfully!");
        
        // Refresh attendance records
        await fetchAttendanceRecords();
        
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('timeTrackingChanged'));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete time entry");
      }
    } catch (error) {
      console.error('[Time Tracking] Error deleting time entry:', error);
      toast.error("Failed to delete time entry");
    }
  };

  // Clock in
  const handleClockIn = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error("Please log in to clock in");
        return;
      }

      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clock_in',
          location: location || undefined,
          notes: notes || undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Clocked in successfully!", {
          description: `Started at ${new Date().toLocaleTimeString()}`
        });
        setCurrentEntry(result.data);
        setLocation("");
        setNotes("");
        
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('timeTrackingChanged'));
        
        // Refresh attendance records
        setTimeout(() => {
          fetchAttendanceRecords();
        }, 1000);
      } else {
        toast.error(result.error || "Failed to clock in");
      }
    } catch (error) {
      console.error('Error clocking in:', error);
      toast.error("Failed to clock in");
    } finally {
      setIsLoading(false);
    }
  };

  // Clock out
  const handleClockOut = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clock_out' })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Clocked out successfully!", {
          description: `Total hours: ${result.data.total_hours?.toFixed(2) || '0'}h`
        });
        setCurrentEntry(null);
        setElapsedTime(0);
        setBreakTime(0);
        
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('timeTrackingChanged'));
        
        // Refresh attendance records
        setTimeout(() => {
          fetchAttendanceRecords();
        }, 1000);
      } else {
        toast.error(result.error || "Failed to clock out");
      }
    } catch (error) {
      console.error('Error clocking out:', error);
      toast.error("Failed to clock out");
    } finally {
      setIsLoading(false);
    }
  };

  // Start break
  const handleStartBreak = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_break' })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Break started", {
          description: "Enjoy your break!"
        });
        setCurrentEntry(result.data);
        setBreakTime(0);
        
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('timeTrackingChanged'));
      } else {
        toast.error(result.error || "Failed to start break");
      }
    } catch (error) {
      console.error('Error starting break:', error);
      toast.error("Failed to start break");
    } finally {
      setIsLoading(false);
    }
  };

  // End break
  const handleEndBreak = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end_break' })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Break ended", {
          description: "Welcome back to work!"
        });
        setCurrentEntry(result.data);
        setBreakTime(0);
        
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('timeTrackingChanged'));
      } else {
        toast.error(result.error || "Failed to end break");
      }
    } catch (error) {
      console.error('Error ending break:', error);
      toast.error("Failed to end break");
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStatusBadge = () => {
    if (!currentEntry) return null;
    
    switch (currentEntry.status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'break':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">On Break</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Time Tracking Card */}
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 border-blue-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            Time Tracking
            {isRealTime && (
              <div className="flex items-center gap-1 ml-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-normal">Live</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          {currentEntry ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">Currently Clocked In</span>
                  {getCurrentStatusBadge()}
                </div>
                <span className="text-sm text-gray-500">
                  Since {new Date(currentEntry.clock_in).toLocaleTimeString()}
                </span>
              </div>

              {/* Real-time Timer */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100">
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-blue-600 mb-2">
                    {currentEntry.status === 'break' 
                      ? formatTime(breakTime)
                      : formatTime(elapsedTime)
                    }
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentEntry.status === 'break' ? 'Break Time' : 'Work Time'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {currentEntry.status === 'active' && (
                  <>
                    <Button
                      onClick={handleStartBreak}
                      disabled={isLoading}
                      variant="outline"
                      className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                    >
                      <Coffee className="w-4 h-4 mr-2" />
                      Start Break
                    </Button>
                    <Button
                      onClick={handleClockOut}
                      disabled={isLoading}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Clock Out
                    </Button>
                  </>
                )}
                {currentEntry.status === 'break' && (
                  <Button
                    onClick={handleEndBreak}
                    disabled={isLoading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    End Break
                  </Button>
                )}
              </div>

              {/* Entry Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Date: {new Date(currentEntry.clock_in).toLocaleDateString()}</span>
                </div>
                {currentEntry.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>Location: {currentEntry.location}</span>
                  </div>
                )}
                {currentEntry.total_hours && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Timer className="w-4 h-4" />
                    <span>Total Hours: {currentEntry.total_hours.toFixed(2)}h</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Start Your Day?</h3>
                <p className="text-gray-600">Clock in to begin tracking your work time</p>
              </div>

              {/* Clock In Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Office, Remote, Client Site"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes for today..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
                <Button
                  onClick={handleClockIn}
                  disabled={isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isLoading ? "Clocking In..." : "Clock In"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Summary */}
      {currentEntry && (
        <Card className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-green-600" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatTime(elapsedTime)}
                </div>
                <div className="text-sm text-gray-600">Work Time</div>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {currentEntry.break_duration > 0 
                    ? `${Math.floor(currentEntry.break_duration / 60)}:${(currentEntry.break_duration % 60).toString().padStart(2, '0')}`
                    : formatTime(breakTime)
                  }
                </div>
                <div className="text-sm text-gray-600">Break Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Records Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">My Attendance Records</h3>
                <p className="text-sm text-gray-600">Track your daily time entries and work history</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">{filteredRecords.length}</div>
                <div className="text-xs text-gray-500">records shown</div>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <Button 
                onClick={fetchAttendanceRecords}
                disabled={isLoadingRecords}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingRecords ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        {/* Filters */}
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Search className="w-4 h-4" />
                Search Location
              </Label>
              <div className="relative">
                <Input
                  placeholder="Search by location..."
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
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-700"
              >
                <option value="all">🗓️ All Time</option>
                <option value="today">📅 Today</option>
                <option value="week">📊 This Week</option>
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
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-700"
              >
                <option value="all">🔄 All Status</option>
                <option value="active">🟢 Active</option>
                <option value="completed">✅ Completed</option>
                <option value="break">☕ On Break</option>
              </select>
            </div>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-700 py-4">📅 Date</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">🕐 Clock In</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">🕐 Clock Out</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">📊 Status</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">⏱️ Total Hours</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">🗑️ Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRecords ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                        <div className="text-gray-600 font-medium">Loading attendance records...</div>
                        <div className="text-sm text-gray-500">Fetching your time tracking data</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-gray-100 rounded-full">
                          <Calendar className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="text-gray-600 font-medium">No attendance records found</div>
                        <div className="text-sm text-gray-500">Try adjusting your filters or clock in to start tracking</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record, index) => (
                    <TableRow key={record.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <TableCell className="py-4">
                        <div className="text-sm font-medium text-gray-900">{formatDate(record.date)}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-green-100 rounded">
                            <Play className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm font-mono text-gray-900">{formatTimeDisplay(record.clock_in)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {record.clock_out ? (
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-red-100 rounded">
                              <Pause className="w-3 h-3 text-red-600" />
                            </div>
                            <span className="text-sm font-mono text-gray-900">{formatTimeDisplay(record.clock_out)}</span>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                            In Progress
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell className="py-4">
                        {record.total_hours ? (
                          <div className="flex items-center gap-1">
                            <Timer className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-900">{formatDuration(record.total_hours)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <div className="animate-pulse bg-gray-200 rounded w-12 h-4"></div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm(
                                `Are you sure you want to delete this time entry?\n\nDate: ${formatDate(record.date)}\nClock In: ${formatTimeDisplay(record.clock_in)}\nClock Out: ${record.clock_out ? formatTimeDisplay(record.clock_out) : 'Not completed'}\n\nThis action cannot be undone.`
                              )) {
                                handleDeleteTimeEntry(record.id);
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
