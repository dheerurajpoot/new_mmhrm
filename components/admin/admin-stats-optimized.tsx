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
	Crown,
} from "lucide-react";
import { UpcomingBirthdays } from "@/components/shared/upcoming-birthdays";
import { RecentActivity } from "@/components/shared/recent-activity";
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
		isLoading: queryIsLoading,
		error: queryError,
		isStale,
		refetch
	} = useSectionDataQuery("overview", { enabled: !sectionData });

	// Use section data if provided, otherwise use query data
	const data = sectionData || queryData;
	const isLoading = sectionData ? false : queryIsLoading;
	const error = sectionData ? null : queryError;

	useEffect(() => {
		if (data) {
			setLastUpdated(new Date());
		}
	}, [data]);

	// Auto-refresh data every 5 seconds
	useEffect(() => {
		const refreshInterval = setInterval(() => {
			refetch();
			setLastUpdated(new Date());
		}, 5000);

		return () => clearInterval(refreshInterval);
	}, [refetch]);

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
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
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
					<div className='bg-white rounded-2xl border border-gray-100 p-6 animate-pulse'>
						<div className='h-6 bg-gray-200 rounded mb-4'></div>
						<div className='h-64 bg-gray-200 rounded'></div>
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
								className={`text-sm font-semibold ${stat.trend === "up"
										? "text-emerald-600"
										: "text-red-500"
									}`}>
								{Math.abs(stat.growth)}%
							</span>
						</div>
					</div>
				))}
			</div>

			{/* Activity, Teams and Birthdays Section */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

				{/* Recent Activity - Live Feed */}
				<RecentActivity 
					sectionData={sectionData}
					maxItems={10}
					showHeader={true}
					title="Live Activity Feed"
					description="Real-time system notifications"
				/>

				{/* Recent Teams - Modern Notification Style */}
				<div className='bg-gradient-to-br from-cyan-50 via-white to-teal-50/30 backdrop-blur-xl rounded-3xl border border-cyan-200/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-500'>
					<div className='flex items-center justify-between mb-6'>
						<div className='flex items-center gap-4'>
							<div className='w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg'>
								<Building2 className='w-6 h-6 text-white' />
							</div>
							<div>
								<h3 className='text-xl font-bold text-cyan-900'>
									Recent Team Notifications
								</h3>
								<p className='text-sm text-cyan-600 font-medium'>
									Latest team creations & updates
								</p>
							</div>
						</div>
						<div className='flex items-center gap-3'>
							<div className='w-2 h-2 bg-cyan-500 rounded-full animate-pulse'></div>
							<Badge
								variant='outline'
								className='text-xs bg-cyan-50/80 text-cyan-700 border-cyan-200 backdrop-blur-sm'>
								Live Updates
							</Badge>
						</div>
					</div>
					<div className='space-y-4 h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-200 scrollbar-track-transparent hover:scrollbar-thumb-cyan-300'>
						{recentTeams.slice(0, 10).map((team: any, index: any) => (
							<div
								key={team.id}
								className='group relative bg-white/70 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/90 transition-all duration-300 border border-cyan-200/30 hover:border-cyan-300/50 hover:shadow-lg'>
								{/* Notification indicator */}
								<div className='absolute top-3 right-3 w-2 h-2 bg-cyan-500 rounded-full animate-pulse'></div>

								<div className='flex items-start space-x-4'>
									{/* Team Leader Avatar with Crown */}
									<div className='relative flex-shrink-0'>
										<OptimizedAvatar
											src={team.leader?.profile_photo}
											alt={team.leader?.full_name || team.leader?.name}
											size={56}
											className="ring-3 ring-cyan-100 group-hover:ring-cyan-200 transition-all duration-300 shadow-lg"
										/>
										{/* Leader crown indicator */}
										<div className='absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white rounded-full flex items-center justify-center shadow-lg'>
											<Star className='w-3 h-3 text-white' />
										</div>
									</div>

									{/* Team Notification Content */}
									<div className='flex-1 min-w-0'>
										<div className='flex items-center justify-between mb-2'>
											<div className='flex items-center gap-3'>
												<h4 className='text-lg font-bold text-cyan-900 truncate'>
													{team.name}
												</h4>
												<Badge className='text-xs bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800 border-cyan-200 shadow-sm'>
													Team Created
												</Badge>
											</div>
											<span className='text-xs text-cyan-500 font-medium'>
												{new Date(team.created_at).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
													hour12: true,
												})}
											</span>
										</div>

										{/* Team Leader Info */}
										<div className='flex items-center gap-2 mb-3'>
											<div className='w-2 h-2 bg-cyan-400 rounded-full'></div>
											<span className='text-sm font-semibold text-cyan-700'>
												Led by {team.leader?.full_name || team.leader?.name || "Unknown Leader"}
											</span>
										</div>

										{/* Team Stats */}
										<div className='flex items-center gap-4 text-xs text-cyan-600 mb-3'>
											<div className='flex items-center gap-1'>
												<Users className='w-3 h-3' />
												<span className='font-medium'>
													{team.members?.length || 0} members
												</span>
											</div>
											<div className='w-1 h-1 bg-cyan-300 rounded-full'></div>
											<div className='flex items-center gap-1'>
												<Calendar className='w-3 h-3' />
												<span className='font-medium'>
													{new Date(team.created_at).toLocaleDateString()}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
						{recentTeams.length === 0 && (
							<div className='text-center py-12 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl border-2 border-dashed border-cyan-200'>
								<div className='w-16 h-16 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
									<Building2 className='w-8 h-8 text-cyan-500' />
								</div>
								<h3 className='text-lg font-semibold text-cyan-800 mb-2'>
									No Teams Created Yet
								</h3>
								<p className='text-cyan-600 max-w-sm mx-auto'>
									Team notifications will appear here once they are created. Create your first team to get started!
								</p>
							</div>
						)}
					</div>

					{/* Real-time indicator */}
					<div className='mt-4 pt-3 border-t border-cyan-200/50'>
						<div className='flex items-center justify-between text-xs text-cyan-600'>
							<div className='flex items-center gap-2'>
								<div className='w-2 h-2 bg-cyan-500 rounded-full animate-pulse'></div>
								<span className='font-medium'>
									Live team updates enabled
								</span>
							</div>
							<span>
								Last updated: {lastUpdated?.toLocaleTimeString()}
							</span>
						</div>
					</div>
				</div>

				{/* Upcoming Birthdays */}
				<div className='bg-gradient-to-br from-rose-50 via-white to-pink-50/30 rounded-2xl border border-pink-100 p-4 shadow-lg'>
					<div className='flex items-center justify-between mb-6'>
						<div className='flex items-center gap-3'>
							<div className='w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center shadow-md'>
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
