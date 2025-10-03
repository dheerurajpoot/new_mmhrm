"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Users,
	UserCheck,
	Clock,
	Calendar,
	UserPlus,
	Building2,
	TrendingUp,
	TrendingDown,
	ArrowUpRight,
	ArrowDownRight,
	DollarSign,
	Activity,
	CheckCircle,
	XCircle,
	AlertCircle,
	Timer,
	UserX,
	FileText,
	Cake,
	Gift,
	Star,
	Sparkles,
	Trash2,
} from "lucide-react";
import { UpcomingBirthdays } from "@/components/shared/upcoming-birthdays";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSectionDataQuery } from "@/hooks/use-enhanced-data";
import { OptimizedAvatar } from "@/components/ui/optimized-image";

interface AdminStatsProps {
	sectionData?: any;
}

export function AdminStats({ sectionData }: AdminStatsProps) {
	const [currentTime, setCurrentTime] = useState(new Date());
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

	// Use React Query for better data management
	const { 
		data: queryData, 
		loading: queryLoading, 
		error: queryError,
		isStale,
		refetch 
	} = useSectionDataQuery("overview", { enabled: !sectionData });

	// Use section data if provided, otherwise use query data
	const data = sectionData || queryData;
	const isLoading = sectionData ? false : queryLoading;
	const error = sectionData ? null : queryError;

	useEffect(() => {
		if (data) {
			setLastUpdated(new Date());
		}
	}, [data]);

	// Update current time every second for real-time display
	useEffect(() => {
		const timeInterval = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timeInterval);
	}, []);

	const stats = data?.stats || {
		totalUsers: 0,
		activeUsers: 0,
		pendingLeaves: 0,
		todayAttendance: 0,
		totalLeaveTypes: 0,
		totalTeams: 0,
		userGrowth: 0,
		attendanceGrowth: 0,
		leaveGrowth: 0,
		teamGrowth: 0,
	};

	const recentActivity = data?.recentActivity || [];
	const recentTeams = data?.recentTeams || [];

	const statCards = [
		{
			title: "Total Employees",
			value: (stats.totalUsers || 0).toLocaleString(),
			description: "Registered employees",
			icon: Users,
			growth: stats.userGrowth || 0,
			trend: "up",
			color: "text-blue-600",
			bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
			borderColor: "border-blue-200",
			iconBg: "bg-blue-500",
		},
		{
			title: "Total Teams",
			value: (stats.totalTeams || 0).toLocaleString(),
			description: "Active teams",
			icon: Building2,
			growth: stats.teamGrowth || 0,
			trend: "up",
			color: "text-purple-600",
			bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
			borderColor: "border-purple-200",
			iconBg: "bg-purple-500",
		},
		{
			title: "Leave Types",
			value: (stats.totalLeaveTypes || 0).toLocaleString(),
			description: "Available categories",
			icon: Calendar,
			growth: 0,
			trend: "up",
			color: "text-emerald-600",
			bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
			borderColor: "border-emerald-200",
			iconBg: "bg-emerald-500",
		},
		{
			title: "Pending Leaves",
			value: (stats.pendingLeaves || 0).toLocaleString(),
			description: "Awaiting approval",
			icon: AlertCircle,
			growth: stats.leaveGrowth || 0,
			trend: "down",
			color: "text-orange-600",
			bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
			borderColor: "border-orange-200",
			iconBg: "bg-orange-500",
		},
	];

	if (isLoading) {
		return (
			<div className='space-y-8'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className='bg-white rounded-2xl border border-gray-100 p-6 animate-pulse'>
							<div className='flex items-center justify-between mb-4'>
								<div className='h-4 bg-gray-200 rounded w-24'></div>
								<div className='h-8 w-8 bg-gray-200 rounded-lg'></div>
							</div>
							<div className='h-8 bg-gray-200 rounded mb-2'></div>
							<div className='flex items-center space-x-2'>
								<div className='h-4 bg-gray-200 rounded w-4'></div>
								<div className='h-3 bg-gray-200 rounded w-12'></div>
							</div>
						</div>
					))}
				</div>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					<div className='bg-white rounded-2xl border border-gray-100 p-6 animate-pulse'>
						<div className='h-6 bg-gray-200 rounded mb-4'></div>
						<div className='h-64 bg-gray-200 rounded'></div>
					</div>
					<div className='bg-white rounded-2xl border border-gray-100 p-6 animate-pulse'>
						<div className='h-6 bg-gray-200 rounded mb-4'></div>
						<div className='space-y-3'>
							{[...Array(4)].map((_, i) => (
								<div
									key={i}
									className='h-16 bg-gray-200 rounded'></div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
					<p className="text-gray-600 mb-4">{error.message}</p>
					<button 
						onClick={() => refetch()} 
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	const getActivityIcon = (type: string) => {
		switch (type) {
			case "leave_request":
				return <FileText className='w-4 h-4 text-blue-600' />;
			case "leave_approval":
				return <CheckCircle className='w-4 h-4 text-green-600' />;
			case "employee_registered":
				return <UserPlus className='w-4 h-4 text-emerald-600' />;
			case "team_created":
				return <Building2 className='w-4 h-4 text-purple-600' />;
			case "time_entry":
				return <Timer className='w-4 h-4 text-orange-600' />;
			case "clock_in":
				return <Clock className='w-4 h-4 text-green-600' />;
			case "clock_out":
				return <Clock className='w-4 h-4 text-red-600' />;
			default:
				return <Activity className='w-4 h-4 text-gray-600' />;
		}
	};

	const getActivityColor = (type: string) => {
		switch (type) {
			case "leave_request":
				return "bg-blue-100 text-blue-800";
			case "leave_approval":
				return "bg-green-100 text-green-800";
			case "employee_registered":
				return "bg-emerald-100 text-emerald-800";
			case "team_created":
				return "bg-purple-100 text-purple-800";
			case "time_entry":
				return "bg-orange-100 text-orange-800";
			case "clock_in":
				return "bg-green-100 text-green-800";
			case "clock_out":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getActivityBadge = (type: string, status: string) => {
		switch (type) {
			case "leave_request":
				return status === "pending" ? "Pending" : status;
			case "leave_approval":
				return status === "approved" ? "Approved" : "Rejected";
			case "employee_registered":
				return "New";
			case "team_created":
				return "Created";
			case "time_entry":
				return status === "clock_in" ? "Clock In" : "Clock Out";
			case "clock_in":
				return "Clock In";
			case "clock_out":
				return "Clock Out";
			default:
				return "Activity";
		}
	};

	const formatTimeAgo = (timestamp: string) => {
		const time = new Date(timestamp);
		const diffInMinutes = Math.floor(
			(currentTime.getTime() - time.getTime()) / (1000 * 60)
		);

		if (diffInMinutes < 1) return "Just now";
		if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
		if (diffInMinutes < 1440)
			return `${Math.floor(diffInMinutes / 60)}h ago`;
		return `${Math.floor(diffInMinutes / 1440)}d ago`;
	};

	const formatActivityTime = (timestamp: string) => {
		const time = new Date(timestamp);
		const now = new Date();
		const diffInMinutes = Math.floor(
			(now.getTime() - time.getTime()) / (1000 * 60)
		);

		// Show exact time for recent activities (less than 1 hour)
		if (diffInMinutes < 60) {
			return time.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: true,
			});
		}

		// Show relative time for older activities
		if (diffInMinutes < 1440) {
			return `${Math.floor(diffInMinutes / 60)}h ago`;
		}

		return `${Math.floor(diffInMinutes / 1440)}d ago`;
	};

	return (
		<div className='space-y-8'>
			{/* Data freshness indicator */}
			{isStale && (
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
						<span className="text-sm text-yellow-800">Data may be outdated</span>
					</div>
					<button 
						onClick={() => refetch()}
						className="text-sm text-yellow-700 hover:text-yellow-900 underline"
					>
						Refresh
					</button>
				</div>
			)}

			{/* Statistics Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				{statCards.map((stat, index) => (
					<div
						key={index}
						className={`${stat.bgColor} rounded-2xl border-2 ${stat.borderColor} p-6 hover:shadow-xl transition-all duration-300 hover:scale-105`}>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-sm font-semibold text-gray-700'>
								{stat.title}
							</h3>
							<div
								className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
								<stat.icon className='w-6 h-6 text-white' />
							</div>
						</div>
						<div className='mb-3'>
							<p className='text-3xl font-bold text-gray-900'>
								{stat.value}
							</p>
							<p className='text-sm text-gray-600 mt-1'>
								{stat.description}
							</p>
						</div>
						<div className='flex items-center space-x-2'>
							{stat.trend === "up" ? (
								<ArrowUpRight className='w-4 h-4 text-emerald-600' />
							) : (
								<ArrowDownRight className='w-4 h-4 text-red-500' />
							)}
							<span
								className={`text-sm font-semibold ${
									stat.trend === "up"
										? "text-emerald-600"
										: "text-red-500"
								}`}>
								{Math.abs(stat.growth)}%
							</span>
						</div>
					</div>
				))}
			</div>

			{/* Recent Activity, Teams, and Birthdays Section */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Recent Activity - Phone Notification Style */}
				<div className='bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-2xl border border-blue-100 p-4 shadow-lg'>
					<div className='flex items-center justify-between mb-6'>
						<div className='flex items-center gap-3'>
							<div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md'>
								<Activity className='w-5 h-5 text-white' />
							</div>
							<div>
								<h3 className='text-lg font-bold text-gray-900'>
									Recent Activity
								</h3>
								<p className='text-sm text-gray-600'>
									Live system notifications
								</p>
							</div>
						</div>
						<div className='flex items-center gap-2'>
							<div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
							<Badge
								variant='outline'
								className='text-xs bg-blue-50 text-blue-700 border-blue-200'>
								Last 10 activities
							</Badge>
						</div>
					</div>
					<div className='space-y-3 h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent hover:scrollbar-thumb-blue-300'>
						{recentActivity.slice(0, 10).map((activity, index) => (
							<div
								key={activity.id}
								className='group relative bg-white/80 backdrop-blur-sm rounded-xl p-4 hover:bg-white/90 transition-all duration-200 border border-blue-100 hover:border-blue-200 hover:shadow-md'>
								{/* Notification indicator */}
								<div className='absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>

								<div className='flex items-start space-x-3'>
									<div className='flex-shrink-0'>
										<div className='w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-sm'>
											{getActivityIcon(activity.type)}
										</div>
									</div>
									<div className='flex-1 min-w-0'>
										<div className='flex items-center justify-between mb-1'>
											<h4 className='text-sm font-bold text-gray-900 truncate'>
												{activity.title}
											</h4>
											<div className='flex items-center gap-2'>
												<Badge
													className={`text-xs ${getActivityColor(
														activity.type
													)}`}>
													{getActivityBadge(
														activity.type,
														activity.status
													)}
												</Badge>
												<span className='text-xs text-gray-400 font-medium'>
													{formatActivityTime(
														activity.timestamp
													)}
												</span>
											</div>
										</div>
										<p className='text-sm text-gray-600 mb-2 line-clamp-2'>
											{activity.description}
										</p>
										<div className='flex items-center justify-between'>
											<div className='flex items-center space-x-2'>
												{activity.user && (
													<OptimizedAvatar
														src={activity.user.profile_photo}
														alt={activity.user.name}
														size={24}
														className="ring-1 ring-blue-100"
													/>
												)}
												<span className='text-xs text-gray-500 font-medium'>
													{activity.user?.name ||
														"System"}
													{activity.targetUser && (
														<span className='text-gray-400'>
															{" "}
															→{" "}
															{
																activity
																	.targetUser
																	.name
															}
														</span>
													)}
												</span>
											</div>
											<div className='text-xs text-gray-400'>
												{formatTimeAgo(
													activity.timestamp
												)}
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
						{recentActivity.length === 0 && (
							<div className='text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300'>
								<div className='w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
									<Activity className='w-8 h-8 text-blue-500' />
								</div>
								<h3 className='text-lg font-semibold text-gray-800 mb-2'>
									No Recent Activity
								</h3>
								<p className='text-gray-600 max-w-sm mx-auto'>
									System activities will appear here in
									real-time as they happen.
								</p>
							</div>
						)}
					</div>

					{/* Real-time indicator */}
					<div className='mt-4 pt-3 border-t border-blue-100'>
						<div className='flex items-center justify-between text-xs text-blue-600'>
							<div className='flex items-center gap-2'>
								<div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
								<span className='font-medium'>
									Live updates enabled
								</span>
							</div>
							<span>
								Last updated:{" "}
								{lastUpdated?.toLocaleTimeString()}
							</span>
						</div>
					</div>
				</div>

				{/* Recent Teams - Beautiful Modern Design */}
				<div className='bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 rounded-2xl border border-purple-100 p-6 shadow-lg'>
					<div className='flex items-center justify-between mb-6'>
						<div className='flex items-center gap-3'>
							<div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md'>
								<Building2 className='w-5 h-5 text-white' />
							</div>
							<div>
								<h3 className='text-lg font-bold text-gray-900'>
									Recent Teams
								</h3>
								<p className='text-sm text-gray-600'>
									Latest team creations
								</p>
							</div>
						</div>
						<div className='flex items-center gap-2'>
							<div className='w-2 h-2 bg-purple-500 rounded-full animate-pulse'></div>
							<Badge
								variant='outline'
								className='text-xs bg-purple-50 text-purple-700 border-purple-200'>
								Last 10 teams
							</Badge>
						</div>
					</div>
					<div className='space-y-3 h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent hover:scrollbar-thumb-purple-300'>
						{recentTeams.map((team, index) => (
							<div
								key={team.id}
								className='group flex items-center space-x-4 p-4 rounded-xl hover:bg-white/70 transition-all duration-200 border border-purple-100 hover:border-purple-200 hover:shadow-md'>
								<div className='relative'>
									<OptimizedAvatar
										src={team.leader?.profile_photo}
										alt={team.leader?.full_name}
										size={48}
										className="ring-2 ring-purple-100 group-hover:ring-purple-200 transition-all duration-200"
									/>
									<div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full'></div>
								</div>
								<div className='flex-1 min-w-0'>
									<div className='flex items-center gap-2 mb-1'>
										<p className='text-sm font-semibold text-gray-900 truncate'>
											{team.name}
										</p>
										<div className='flex items-center gap-1'>
											<Users className='w-3 h-3 text-gray-400' />
											<span className='text-xs text-gray-500'>
												{team.members?.length || 0}
											</span>
										</div>
									</div>
									<p className='text-xs text-gray-600'>
										Led by{" "}
										{team.leader?.full_name ||
											team.leader?.email ||
											"Unknown"}
									</p>
									<div className='flex items-center gap-2 mt-1'>
										<span className='text-xs text-gray-400'>
											Created{" "}
											{new Date(
												team.created_at
											).toLocaleDateString()}
										</span>
										<div className='w-1 h-1 bg-gray-300 rounded-full'></div>
										<span className='text-xs text-gray-400'>
											{new Date(
												team.created_at
											).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</div>
								</div>
								<div className='flex flex-col items-end space-y-2'>
									<Badge className='text-xs bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-200'>
										Team
									</Badge>
									<div className='flex items-center gap-1 text-xs text-purple-600'>
										<Building2 className='w-3 h-3' />
										<span className='font-medium'>
											Active
										</span>
									</div>
								</div>
							</div>
						))}
						{recentTeams.length === 0 && (
							<div className='text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300'>
								<div className='w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
									<Building2 className='w-8 h-8 text-purple-500' />
								</div>
								<h3 className='text-lg font-semibold text-gray-800 mb-2'>
									No Teams Created Yet
								</h3>
								<p className='text-gray-600 max-w-sm mx-auto'>
									Teams will appear here once they are
									created. Create your first team to get
									started!
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Upcoming Birthdays */}
				<div className='bg-gradient-to-br from-white via-pink-50/30 to-rose-50/30 rounded-2xl border border-pink-100 p-4 shadow-lg'>
					<div className='flex items-center justify-between mb-6'>
						<div className='flex items-center gap-3'>
							<div className='w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md'>
								<Cake className='w-5 h-5 text-white' />
							</div>
							<div>
								<h3 className='text-lg font-bold text-gray-900'>
									Upcoming Birthdays
								</h3>
								<p className='text-sm text-gray-600'>
									Celebrate your colleagues!
								</p>
							</div>
						</div>
						<div className='flex items-center gap-2'>
							<div className='w-2 h-2 bg-pink-500 rounded-full animate-pulse'></div>
							<Badge
								variant='outline'
								className='text-xs bg-pink-50 text-pink-700 border-pink-200'>
								Next 10 birthdays
							</Badge>
						</div>
					</div>
					<div className='h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-transparent hover:scrollbar-thumb-pink-300'>
						<UpcomingBirthdays
							maxEmployees={10}
							showAllMonths={false}
							sectionData={data}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
