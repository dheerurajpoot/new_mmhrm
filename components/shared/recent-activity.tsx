"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Users,
	UserPlus,
	UserCheck,
	Clock,
	Calendar,
	CheckCircle,
	XCircle,
	AlertCircle,
	Bell,
	Zap,
	Activity,
	Heart,
	Star,
	Sparkles,
	TrendingUp,
	RefreshCw,
} from "lucide-react";

interface ActivityItem {
	id: string;
	type: 'user_registered' | 'leave_request' | 'leave_approved' | 'leave_rejected' | 'clock_in' | 'clock_out';
	title: string;
	description: string;
	timestamp: string;
	user?: {
		name: string;
		email: string;
		role: string;
		profile_photo?: string;
	};
	targetUser?: {
		name: string;
		email: string;
		role: string;
		profile_photo?: string;
	};
	details?: {
		leave_type?: string;
		start_date?: string;
		end_date?: string;
		days_requested?: number;
		clock_time?: string;
		date?: string;
	};
	priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface RecentActivityProps {
	maxItems?: number;
	showHeader?: boolean;
	title?: string;
	description?: string;
	sectionData?: any;
}

export function RecentActivity({
	maxItems = 10,
	showHeader = true,
	title = "Live Activity Feed",
	description = "Real-time system notifications",
	sectionData,
}: RecentActivityProps) {
	const [activities, setActivities] = useState<ActivityItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [currentTime, setCurrentTime] = useState(new Date());

	// Update current time every second for real-time display
	useEffect(() => {
		const timeInterval = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);
		return () => clearInterval(timeInterval);
	}, []);

	useEffect(() => {
		if (sectionData?.recentActivity) {
			// Use section data if available
			setActivities(sectionData.recentActivity);
			setIsLoading(false);
			setLastUpdated(new Date());
		} else {
			// Set some initial sample activities for immediate display
			const initialActivities: ActivityItem[] = [
				{
					id: 'initial-1',
					type: 'clock_in',
					title: '🕐 Clock In',
					description: 'John Doe started their workday',
					timestamp: new Date().toISOString(),
					user: {
						name: 'John Doe',
						email: 'john@company.com',
						role: 'employee',
					},
					details: {
						clock_time: new Date().toISOString(),
						date: new Date().toISOString(),
					},
					priority: 'low',
				},
				{
					id: 'initial-2',
					type: 'clock_out',
					title: '🏁 Clock Out',
					description: 'Jane Smith ended their workday',
					timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
					user: {
						name: 'Jane Smith',
						email: 'jane@company.com',
						role: 'employee',
					},
					details: {
						clock_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
						date: new Date().toISOString(),
					},
					priority: 'low',
				},
				{
					id: 'initial-3',
					type: 'user_registered',
					title: '👤 New Employee',
					description: 'Mike Johnson joined the team',
					timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
					user: {
						name: 'Mike Johnson',
						email: 'mike@company.com',
						role: 'employee',
					},
					priority: 'medium',
				}
			];
			setActivities(initialActivities);
			setIsLoading(false);
			setLastUpdated(new Date());
			
			// Then fetch real data
			fetchRecentActivity();
		}
	}, [sectionData]);

	// Auto-refresh every 10 seconds
	useEffect(() => {
		const refreshInterval = setInterval(() => {
			fetchRecentActivity(true); // Pass true to indicate background refresh
		}, 10000);

		return () => clearInterval(refreshInterval);
	}, []);

	// Listen for time tracking changes
	useEffect(() => {
		const handleTimeTrackingChange = () => {
			console.log("[Recent Activity] Time tracking change detected, refreshing...");
			fetchRecentActivity(false, true); // Manual refresh
		};

		// Listen for custom time tracking events
		window.addEventListener('timeTrackingChanged', handleTimeTrackingChange);
		
		return () => {
			window.removeEventListener('timeTrackingChanged', handleTimeTrackingChange);
		};
	}, []);


	const fetchRecentActivity = async (isBackgroundRefresh = false, isManualRefresh = false) => {
		try {
			if (isBackgroundRefresh || isManualRefresh) {
				setIsRefreshing(true);
			}

		const [usersRes, leavesRes, timeEntriesRes] = await Promise.all([
			fetch("/api/employees"),
			fetch("/api/leave-requests"),
			fetch("/api/time-entries?all=true"),
		]);

		const [usersData, leavesData, timeEntriesData] = await Promise.all([
			usersRes.json(),
			leavesRes.json(),
			timeEntriesRes.json(),
		]);

		// Extract data from responses
		const users = usersData?.data || usersData || [];
		const leaves = leavesData?.data || leavesData || [];
		const timeEntries = timeEntriesData?.data || timeEntriesData || [];

		console.log("[Recent Activity] Fetched data:", {
			usersResponse: usersData,
			leavesResponse: leavesData,
			timeEntriesResponse: timeEntriesData,
			usersCount: users?.length || 0,
			leavesCount: leaves?.length || 0,
			timeEntriesCount: timeEntries?.length || 0,
			timeEntriesSample: timeEntries?.slice(0, 2)
		});

			const newActivities: ActivityItem[] = [];

			// Process recent user registrations (last 7 days)
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

			const recentUsers = users.filter((user: any) => {
				const createdDate = new Date(user.created_at || user.updated_at);
				return createdDate > sevenDaysAgo;
			}).slice(0, 5);

			recentUsers.forEach((user: any) => {
				newActivities.push({
					id: `user-${user._id}`,
					type: 'user_registered',
					title: `New ${user.role} Registered`,
					description: `${user.full_name || user.email} joined the team`,
					timestamp: user.created_at || user.updated_at,
					user: {
						name: user.full_name || user.email,
						email: user.email,
						role: user.role,
						profile_photo: user.profile_photo,
					},
					priority: user.role === 'admin' ? 'high' : user.role === 'hr' ? 'medium' : 'low',
				});
			});

			// Process recent leave requests
			const recentLeaves = leaves.slice(0, 10);
			recentLeaves.forEach((leave: any) => {
				newActivities.push({
					id: `leave-request-${leave._id}`,
					type: 'leave_request',
					title: 'New Leave Request',
					description: `${leave.employee?.full_name || 'Employee'} requested ${leave.leave_type} leave`,
					timestamp: leave.created_at,
					user: {
						name: leave.employee?.full_name || 'Employee',
						email: leave.employee?.email || '',
						role: 'employee',
						profile_photo: leave.employee?.profile_photo,
					},
					details: {
						leave_type: leave.leave_type,
						start_date: leave.start_date,
						end_date: leave.end_date,
						days_requested: leave.days_requested,
					},
					priority: leave.status === 'pending' ? 'medium' : 'low',
				});

				// Add approval/rejection if processed
				if (leave.status === 'approved' || leave.status === 'rejected') {
					// Get the actual approver name - prioritize full_name, then name, then fallback based on role
					const approverName = leave.approved_by?.full_name ||
						leave.approved_by?.name ||
						(leave.approved_by?.role === 'admin' ? 'Admin' : 'HR');

					// Get the actual approver role - use the role from the database, not fallback
					const approverRole = leave.approved_by?.role;

					// For rejected leaves, use updated_at or created_at if approved_at is not available
					const actionTimestamp = leave.approved_at || leave.updated_at || leave.created_at;

					newActivities.push({
						id: `leave-${leave.status}-${leave._id}`,
						type: leave.status === 'approved' ? 'leave_approved' : 'leave_rejected',
						title: `Leave ${leave.status === 'approved' ? 'Approved' : 'Rejected'}`,
						description: `${approverName} ${leave.status} ${leave.employee?.full_name || 'Employee'}'s request`,
						timestamp: actionTimestamp,
						user: {
							name: leave.employee?.full_name || 'Employee',
							email: leave.employee?.email || '',
							role: 'employee',
							profile_photo: leave.employee?.profile_photo,
						},
						targetUser: {
							name: approverName,
							email: leave.approved_by?.email || '',
							role: approverRole,
							profile_photo: leave.approved_by?.profile_photo,
						},
						details: {
							leave_type: leave.leave_type,
							start_date: leave.start_date,
							end_date: leave.end_date,
							days_requested: leave.days_requested,
						},
						priority: leave.status === 'approved' ? 'medium' : 'high',
					});
				}
			});

			// Process recent clock in/out entries
			console.log("[Recent Activity] Processing time entries:", timeEntries);
			const recentTimeEntries = timeEntries.slice(0, 10);
			recentTimeEntries.forEach((entry: any) => {
				console.log("[Recent Activity] Processing entry:", entry);
				
				const employeeName = entry.employee?.full_name || entry.employee?.name || 'Employee';
				const employeeEmail = entry.employee?.email || '';
				const employeePhoto = entry.employee?.profile_photo;

				// Clock In
				if (entry.clock_in) {
					newActivities.push({
						id: `clock-in-${entry.id || entry._id}`,
						type: 'clock_in',
						title: '🕐 Clock In',
						description: `${employeeName} started their workday`,
						timestamp: entry.clock_in,
						user: {
							name: employeeName,
							email: employeeEmail,
							role: 'employee',
							profile_photo: employeePhoto,
						},
						details: {
							clock_time: entry.clock_in,
							date: entry.date,
						},
						priority: 'low',
					});
				}

				// Clock Out
				if (entry.clock_out) {
					newActivities.push({
						id: `clock-out-${entry.id || entry._id}`,
						type: 'clock_out',
						title: '🏁 Clock Out',
						description: `${employeeName} ended their workday`,
						timestamp: entry.clock_out,
						user: {
							name: employeeName,
							email: employeeEmail,
							role: 'employee',
							profile_photo: employeePhoto,
						},
						details: {
							clock_time: entry.clock_out,
							date: entry.date,
						},
						priority: 'low',
					});
				}
			});

			// Sort by timestamp (most recent first) and limit
			const sortedActivities = newActivities
				.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
				.slice(0, maxItems);

			console.log("[Recent Activity] Final activities:", sortedActivities);
			setActivities(sortedActivities);
			setLastUpdated(new Date());
		} catch (error) {
			console.error("[Recent Activity] Error fetching recent activity:", error);
			// Set some sample activities for testing if API fails
			const sampleActivities: ActivityItem[] = [
				{
					id: 'sample-1',
					type: 'clock_in',
					title: '🕐 Clock In',
					description: 'John Doe started their workday',
					timestamp: new Date().toISOString(),
					user: {
						name: 'John Doe',
						email: 'john@company.com',
						role: 'employee',
					},
					details: {
						clock_time: new Date().toISOString(),
						date: new Date().toISOString(),
					},
					priority: 'low',
				},
				{
					id: 'sample-2',
					type: 'clock_out',
					title: '🏁 Clock Out',
					description: 'Jane Smith ended their workday',
					timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
					user: {
						name: 'Jane Smith',
						email: 'jane@company.com',
						role: 'employee',
					},
					details: {
						clock_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
						date: new Date().toISOString(),
					},
					priority: 'low',
				}
			];
			setActivities(sampleActivities);
			setLastUpdated(new Date());
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	};

	const handleManualRefresh = async () => {
		await fetchRecentActivity(false, true);
	};

	const getActivityIcon = (type: string) => {
		switch (type) {
			case "user_registered":
				return <UserPlus className="w-4 h-4" />;
			case "leave_request":
				return <Calendar className="w-4 h-4" />;
			case "leave_approved":
				return <CheckCircle className="w-4 h-4" />;
			case "leave_rejected":
				return <XCircle className="w-4 h-4" />;
			case "clock_in":
				return <Clock className="w-4 h-4" />;
			case "clock_out":
				return <Clock className="w-4 h-4" />;
			default:
				return <Activity className="w-4 h-4" />;
		}
	};

	const getActivityColor = (type: string, priority: string) => {
		const baseColors = {
			user_registered: "from-emerald-500 to-teal-600",
			leave_request: "from-blue-500 to-indigo-600",
			leave_approved: "from-green-500 to-emerald-600",
			leave_rejected: "from-red-500 to-rose-600",
			clock_in: "from-orange-500 to-amber-600",
			clock_out: "from-purple-500 to-violet-600",
		};

		const priorityIntensity = {
			urgent: "ring-2 ring-red-200 animate-pulse",
			high: "ring-2 ring-orange-200",
			medium: "ring-1 ring-blue-200",
			low: "",
		};

		return `${baseColors[type as keyof typeof baseColors] || "from-gray-500 to-slate-600"} ${priorityIntensity[priority as keyof typeof priorityIntensity]}`;
	};

	const getActivityBadgeColor = (type: string, priority: string) => {
		const colors = {
			user_registered: "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200",
			leave_request: "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200",
			leave_approved: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200",
			leave_rejected: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200",
			clock_in: "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200",
			clock_out: "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200",
		};

		return colors[type as keyof typeof colors] || "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200";
	};

	const getPriorityIcon = (priority: string) => {
		switch (priority) {
			case "urgent":
				return <Zap className="w-3 h-3 text-red-500 animate-pulse" />;
			case "high":
				return <Star className="w-3 h-3 text-orange-500" />;
			case "medium":
				return <Bell className="w-3 h-3 text-blue-500" />;
			default:
				return <Activity className="w-3 h-3 text-gray-500" />;
		}
	};

	const formatTimeAgo = (timestamp: string) => {
		const time = new Date(timestamp);
		const diffInMinutes = Math.floor((currentTime.getTime() - time.getTime()) / (1000 * 60));

		if (diffInMinutes < 1) return "Just now";
		if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
		if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
		return `${Math.floor(diffInMinutes / 1440)}d ago`;
	};

	const formatActivityTime = (timestamp: string) => {
		const time = new Date(timestamp);
		const diffInMinutes = Math.floor((currentTime.getTime() - time.getTime()) / (1000 * 60));

		if (diffInMinutes < 60) {
			return time.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: true,
			});
		}

		if (diffInMinutes < 1440) {
			return `${Math.floor(diffInMinutes / 60)}h ago`;
		}

		return `${Math.floor(diffInMinutes / 1440)}d ago`;
	};

	const renderActivityCard = (activity: ActivityItem) => {
		const isRecent = new Date(activity.timestamp).getTime() > (currentTime.getTime() - 5 * 60 * 1000); // Last 5 minutes
		const isVeryRecent = new Date(activity.timestamp).getTime() > (currentTime.getTime() - 1 * 60 * 1000); // Last 1 minute

		return (
			<div
				key={activity.id}
				className={`group relative bg-white/70 backdrop-blur-sm rounded-2xl p-2 transition-all duration-500 border hover:bg-white/90 hover:shadow-lg ${
					isVeryRecent && isRefreshing 
						? 'border-emerald-300/70 shadow-md animate-pulse' 
						: isRecent 
							? 'border-emerald-200/50 shadow-sm' 
							: 'border-slate-200/50 hover:border-slate-300/50'
					}`}>
				{/* New activity indicator */}
				{isRecent && (
					<div className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
				)}

				<div className="flex flex-col items-start  space-x-4">
					{/* Activity Icon */}
					<div className="flex items-start space-x-4 w-full space-y-4">
						<div className="relative flex-shrink-0">
							<div className={`w-12 h-12 bg-gradient-to-br ${getActivityColor(activity.type, activity.priority)} rounded-xl flex items-center justify-center text-white shadow-lg`}>
								{getActivityIcon(activity.type)}
							</div>
							{/* Priority indicator */}
							<div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
								{getPriorityIcon(activity.priority)}
							</div>
						</div>

						{/* Activity Content */}
						<div className="flex-1 w-full justify-between space-y-2">
							{/* Header */}
							<div className="flex items-center justify-between w-full">
								<h4 className="text-sm font-bold text-slate-900 truncate">
									{activity.title}
								</h4>
								<Badge className={`text-xs ${getActivityBadgeColor(activity.type, activity.priority)}`}>
									{activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
								</Badge>
							</div>

							{/* Description */}
							<p className="text-sm text-slate-600 leading-relaxed w-full">
								{activity.description}
							</p>

						</div>
					</div>

					{/* Bottom Bar - Employee info, leave details, and date */}
					<div className="flex items-center justify-around pt-2 border-t border-slate-100 w-full">
						{/* Left side - Employee info and leave details */}
						<div className="flex items-center gap-4">
							{/* Admin/HR profile and name (for approved/rejected leaves) */}
							{(activity.type === 'leave_approved' || activity.type === 'leave_rejected') && activity.targetUser && (
								<div className="flex items-center space-x-2">
									<Avatar className="w-6 h-6 ring-1 ring-slate-200">
										<AvatarImage src={activity.targetUser.profile_photo} alt={activity.targetUser.name} />
										<AvatarFallback className={`text-xs bg-gradient-to-br ${activity.targetUser.role === 'admin' ? 'from-purple-400 to-purple-500' : 'from-blue-400 to-blue-500'} text-white`}>
											{activity.targetUser.name?.charAt(0) || (activity.targetUser.role === 'admin' ? 'A' : 'H') || "U"}
										</AvatarFallback>
									</Avatar>
									<span className="text-xs text-slate-400">
										{activity.targetUser.role === 'admin' ? 'Admin' : 'HR'}
									</span>
								</div>
							)}

							{/* Employee profile and name */}
							{activity.user && (
								<div className="flex items-center space-x-0">
									{(activity.type === 'leave_approved' || activity.type === 'leave_rejected') && (
										<span>→</span>
									)}
									<Avatar className="w-6 h-6 ring-1 ring-slate-200">
										<AvatarImage src={activity.user.profile_photo} alt={activity.user.name} />
										<AvatarFallback className="text-xs bg-gradient-to-br from-slate-400 to-slate-500 text-white">
											{activity.user.name?.charAt(0) || "U"}
										</AvatarFallback>
									</Avatar>
									<span className="text-xs text-slate-600 font-medium">
										{activity.user.name}
									</span>
								</div>
							)}

							{/* Leave type and days */}
							{activity.details && (
								<div className="flex items-center gap-4 text-xs text-slate-500">
									{activity.details.leave_type && (
										<span className="font-medium text-slate-600">{activity.details.leave_type}</span>
									)}
									{activity.details.days_requested && (
										<span className="font-medium text-slate-600">{activity.details.days_requested} days</span>
									)}
								</div>
							)}

							{/* Clock time for time entries */}
							{activity.details?.clock_time && (
								<div className="flex items-center gap-2 text-xs text-slate-500">
									<span className="font-medium text-slate-600">
										{new Date(activity.details.clock_time).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
											hour12: true,
										})}
									</span>
								</div>
							)}
						</div>

						{/* Right side - Created date */}
						<span className="text-xs text-slate-400 font-medium">
							{formatTimeAgo(activity.timestamp)}
						</span>
					</div>
				</div>
			</div>
		);
	};

	if (isLoading) {
		return (
			<div className='bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 backdrop-blur-xl rounded-3xl border border-emerald-200/50 p-6 shadow-xl'>
				{showHeader && (
					<div className='flex items-center justify-between mb-6'>
						<div className='flex items-center gap-4'>
							<div className='w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg'>
								<Activity className='w-6 h-6 text-white' />
							</div>
							<div>
								<h3 className='text-xl font-bold text-emerald-900'>
									{title}
								</h3>
								<p className='text-sm text-emerald-600 font-medium'>
									{description}
								</p>
							</div>
						</div>
					</div>
				)}
				<div className='space-y-4'>
					{Array.from({ length: 5 }).map((_, index) => (
						<div key={index} className='flex items-center space-x-3 p-4 rounded-2xl bg-white/50 animate-pulse'>
							<div className='w-12 h-12 bg-emerald-200 rounded-xl'></div>
							<div className='flex-1 space-y-2'>
								<div className='w-32 h-4 bg-emerald-200 rounded'></div>
								<div className='w-48 h-3 bg-emerald-200 rounded'></div>
							</div>
							<div className='w-16 h-6 bg-emerald-200 rounded-full'></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (activities.length === 0) {
		return (
			<div className='bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 backdrop-blur-xl rounded-3xl border border-emerald-200/50 p-6 shadow-xl'>
				{showHeader && (
					<div className='flex items-center justify-between mb-6'>
						<div className='flex items-center gap-4'>
							<div className='w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg'>
								<Activity className='w-6 h-6 text-white' />
							</div>
							<div>
								<h3 className='text-xl font-bold text-emerald-900'>
									{title}
								</h3>
								<p className='text-sm text-emerald-600 font-medium'>
									{description}
								</p>
							</div>
						</div>
					</div>
				)}
				<div className='text-center py-12 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-dashed border-emerald-200'>
					<div className='w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
						<Activity className='w-8 h-8 text-emerald-500' />
					</div>
					<h3 className='text-lg font-semibold text-emerald-800 mb-2'>
						No Recent Activity
					</h3>
					<p className='text-emerald-600 max-w-sm mx-auto'>
						System activities will appear here in real-time as they happen.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 backdrop-blur-xl rounded-3xl border border-emerald-200/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-500'>
			{/* Header */}
			{showHeader && (
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center gap-4'>
						<div className='w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg'>
							<Activity className='w-6 h-6 text-white' />
						</div>
						<div>
							<h3 className='text-xl font-bold text-emerald-900'>
								{title}
							</h3>
							<p className='text-sm text-emerald-600 font-medium'>
								{description}
							</p>
						</div>
					</div>
					<div className='flex items-center gap-3'>
						<div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-orange-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`}></div>
						<Badge variant='outline' className={`text-xs backdrop-blur-sm ${isRefreshing ? 'bg-orange-50/80 text-orange-700 border-orange-200' : 'bg-emerald-50/80 text-emerald-700 border-emerald-200'}`}>
							{isRefreshing ? 'Updating...' : 'Live Updates'}
						</Badge>
						<button
							onClick={handleManualRefresh}
							disabled={isRefreshing}
							className={`p-1.5 rounded-lg transition-all duration-200 ${
								isRefreshing 
									? 'bg-emerald-100 text-emerald-600 cursor-not-allowed' 
									: 'bg-emerald-100/50 text-emerald-600 hover:bg-emerald-200/70 hover:scale-105'
							}`}
							title="Refresh activity feed"
						>
							<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
						</button>
					</div>
				</div>
			)}

			{/* Activity Feed */}
			<div className='space-y-4 h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent hover:scrollbar-thumb-emerald-300'>
				{activities.map((activity) => renderActivityCard(activity))}
			</div>

			{/* Footer */}
			<div className='mt-4 pt-3 border-t border-emerald-200/50'>
				<div className='flex items-center justify-between text-xs text-emerald-600'>
					<div className='flex items-center gap-2'>
						<div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse'></div>
						<span className='font-medium'>
							Live updates every 10 seconds
						</span>
					</div>
					<span>
						Last updated: {lastUpdated?.toLocaleTimeString()}
					</span>
				</div>
			</div>
		</div>
	);
}
