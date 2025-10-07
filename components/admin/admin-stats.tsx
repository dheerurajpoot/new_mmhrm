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
} from "lucide-react";
import { UpcomingBirthdays } from "@/components/shared/upcoming-birthdays";
import { RecentActivity } from "@/components/shared/recent-activity";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Stats {
	totalUsers: number;
	activeUsers: number;
	pendingLeaves: number;
	todayAttendance: number;
	totalLeaveTypes: number;
	totalTeams: number;
	userGrowth: number;
	attendanceGrowth: number;
	leaveGrowth: number;
	teamGrowth: number;
}


interface AdminStatsProps {
	sectionData?: any;
}

export function AdminStats({ sectionData }: AdminStatsProps) {
	const [stats, setStats] = useState<Stats>({
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
	});
	const [recentTeams, setRecentTeams] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		if (sectionData) {
			// Use section data if available
			setStats(sectionData.stats || {
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
			});
			setRecentTeams(sectionData.recentTeams || []);
			setIsLoading(false);
			setLastUpdated(new Date());
		} else {
			// Use default values when no section data is available
			setStats({
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
			});
			setRecentTeams([]);
			setIsLoading(false);
			setLastUpdated(new Date());
		}
	}, [sectionData]);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const [
					usersRes,
					leavesRes,
					attendanceRes,
					leaveTypesRes,
					teamsRes,
					employeesRes,
				] = await Promise.all([
					fetch("/api/employees"),
					fetch("/api/leave-requests"),
					fetch("/api/time-entries"),
					fetch("/api/leave-types"),
					fetch("/api/teams"),
					fetch("/api/employee/search"),
				]);

				if (!usersRes.ok) {
					console.error(
						"Failed to fetch users:",
						usersRes.status,
						usersRes.statusText
					);
				}
				if (!teamsRes.ok) {
					console.error(
						"Failed to fetch teams:",
						teamsRes.status,
						teamsRes.statusText
					);
				}
				if (!employeesRes.ok) {
					console.error(
						"Failed to fetch employees:",
						employeesRes.status,
						employeesRes.statusText
					);
				}

				const users = await usersRes.json();
				const leaves = await leavesRes.json();
				const attendance = await attendanceRes.json();
				const leaveTypes = await leaveTypesRes.json();
				const teams = await teamsRes.json();
				const employees = await employeesRes.json();

				// Store recent teams separately (10 most recent)
				const sortedTeams = teams.sort(
					(a: any, b: any) =>
						new Date(b.created_at).getTime() -
						new Date(a.created_at).getTime()
				);
				setRecentTeams(sortedTeams.slice(0, 10));

				setStats({
					totalUsers: users.length || 0,
					activeUsers:
						users.filter((u: any) => u.last_sign_in_at).length || 0,
					pendingLeaves:
						leaves.filter((l: any) => l.status === "pending")
							.length || 0,
					todayAttendance:
						attendance.filter((a: any) => {
							const today = new Date()
								.toISOString()
								.split("T")[0];
							return a.date === today;
						}).length || 0,
					totalLeaveTypes: Array.isArray(leaveTypes)
						? leaveTypes.length
						: 0,
					totalTeams: Array.isArray(teams) ? teams.length : 0,
					userGrowth: 20, // Mock growth data
					attendanceGrowth: 15,
					leaveGrowth: -5,
					teamGrowth: 25,
				});


				// Update last updated timestamp
				setLastUpdated(new Date());
			} catch (error) {
				console.error("Error fetching stats:", error);
			} finally {
				setIsLoading(false);
			}
		};

		if (!sectionData) {
			fetchStats();

			// Set up real-time updates every 30 seconds instead of 1 second
			const interval = setInterval(fetchStats, 30000);

			return () => clearInterval(interval);
		}
	}, [sectionData]);

	// Update current time every second for real-time display
	useEffect(() => {
		const timeInterval = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timeInterval);
	}, []);

	const statCards = [
		{
			title: "Total Employees",
			value: (stats.totalUsers || 0).toLocaleString(),
			description: "Registered employees",
			icon: Users,
			growth: stats.userGrowth || 0,
			trend: "up",
			color: "text-blue-700",
			bgColor: "bg-gradient-to-br from-blue-50 via-white to-blue-50/30",
			borderColor: "border-blue-200",
			iconBg: "bg-gradient-to-br from-blue-500 to-purple-600",
		},
		{
			title: "Total Teams",
			value: (stats.totalTeams || 0).toLocaleString(),
			description: "Active teams",
			icon: Building2,
			growth: stats.teamGrowth || 0,
			trend: "up",
			color: "text-emerald-700",
			bgColor: "bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30",
			borderColor: "border-emerald-200",
			iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
		},
		{
			title: "Leave Types",
			value: (stats.totalLeaveTypes || 0).toLocaleString(),
			description: "Available categories",
			icon: Calendar,
			growth: 0,
			trend: "up",
			color: "text-amber-700",
			bgColor: "bg-gradient-to-br from-amber-50 via-white to-amber-50/30",
			borderColor: "border-amber-200",
			iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
		},
		{
			title: "Pending Leaves",
			value: (stats.pendingLeaves || 0).toLocaleString(),
			description: "Awaiting approval",
			icon: AlertCircle,
			growth: stats.leaveGrowth || 0,
			trend: "down",
			color: "text-rose-700",
			bgColor: "bg-gradient-to-br from-rose-50 via-white to-rose-50/30",
			borderColor: "border-rose-200",
			iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
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

	const refreshDashboard = () => {
		setIsLoading(true);
		// Trigger the useEffect to refetch data
		window.location.reload();
	};


	return (
		<div className='space-y-8'>
			{/* Modern Statistics Cards with Glassmorphism */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				{statCards.map((stat, index) => (
					<div
						key={index}
						className={`group relative overflow-hidden ${stat.bgColor} backdrop-blur-xl rounded-3xl ${stat.borderColor} border p-8 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-opacity-60 shadow-xl`}>
						{/* Colorful gradient overlay */}
						<div className={`absolute inset-0 ${stat.bgColor.replace('via-white', 'via-white/80')} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>

						{/* Colorful border glow */}
						<div className={`absolute inset-0 rounded-3xl ${stat.borderColor.replace('border-', 'bg-gradient-to-r from-').replace('-200', '-200/10')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

						<div className="relative">
							<div className='flex items-center justify-between mb-6'>
								<div className="flex items-center gap-3">
									<div className={`w-2 h-2 ${stat.color.replace('text-', 'bg-').replace('-700', '-400')} rounded-full animate-pulse`}></div>
									<h3 className={`text-sm font-bold ${stat.color} uppercase tracking-wider`}>
										{stat.title}
									</h3>
								</div>
								<div className="relative">
									<div className={`w-14 h-14 ${stat.iconBg} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
										<stat.icon className='w-7 h-7 text-white' />
									</div>
									{/* Colorful glow effect */}
									<div className={`absolute inset-0 w-14 h-14 ${stat.iconBg.replace('from-', 'from-').replace('to-', 'to-').replace('-500', '-400/20').replace('-600', '-600/20')} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
								</div>
							</div>

							<div className='mb-6'>
								<p className='text-4xl font-bold text-slate-900 mb-2 tracking-tight'>
									{stat.value}
								</p>
								<p className={`text-sm ${stat.color} font-medium`}>
									{stat.description}
								</p>
							</div>

							{/* Modern progress indicator */}
							<div className="pt-4 border-t border-slate-200/50">
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										{stat.trend === "up" ? (
											<ArrowUpRight className='w-4 h-4 text-emerald-500' />
										) : (
											<ArrowDownRight className='w-4 h-4 text-red-500' />
										)}
										<span className="text-sm font-semibold text-slate-600">
											{Math.abs(stat.growth)}%
										</span>
									</div>
									<span className="text-xs text-slate-400 font-medium">vs last month</span>
								</div>
								<div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
									<div className={`h-full ${stat.iconBg} rounded-full transition-all duration-1000 ease-out`}
										style={{ width: `${Math.min(Math.abs(stat.growth) * 3, 100)}%` }}></div>
								</div>
							</div>
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
						{recentTeams.slice(0, 10).map((team, index) => (
							<div
								key={team.id}
								className='group relative bg-white/70 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/90 transition-all duration-300 border border-cyan-200/50 hover:border-cyan-300/50 hover:shadow-lg'>
								{/* Notification indicator */}
								<div className='absolute top-3 right-3 w-2 h-2 bg-cyan-500 rounded-full animate-pulse'></div>

								<div className='flex items-start space-x-4'>
									{/* Team Leader Avatar with Crown */}
									<div className='relative flex-shrink-0'>
										<Avatar className='w-14 h-14 ring-3 ring-cyan-100 group-hover:ring-cyan-200 transition-all duration-300 shadow-lg'>
											<AvatarImage
												src={team.leader?.profile_photo}
												alt={team.leader?.full_name || team.leader?.name}
											/>
											<AvatarFallback className='bg-gradient-to-br from-cyan-400 to-teal-500 text-white font-semibold text-lg'>
												{team.leader?.full_name?.charAt(0) ||
													team.leader?.name?.charAt(0) ||
													team.name?.charAt(0) || "T"}
											</AvatarFallback>
										</Avatar>
										{/* Leader crown indicator */}
										<div className='absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white rounded-full flex items-center justify-center shadow-lg'>
											<Star className='w-3 h-3 text-white' />
										</div>
									</div>

									{/* Team Notification Content */}
									<div className='flex-1 min-w-0'>
										<div className='flex items-center justify-between'>
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
											<span className='mt-1 text-sm font-semibold text-cyan-700 flex items-center gap-2'>
												Led by
												<Avatar className='w-4 h-4 border border-cyan-200'>
													<AvatarImage src={team.leader?.profile_photo || ""} />
													<AvatarFallback>
														{team.leader?.full_name?.charAt(0) || team.leader?.name?.charAt(0) || "U"}
													</AvatarFallback>
												</Avatar>
												{team.leader?.full_name || team.leader?.name || "Unknown Leader"}
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
				<div className='bg-gradient-to-br from-rose-50 via-white to-pink-50/30 rounded-2xl border border-slate-200 p-4 shadow-lg'>
					<div className='flex items-center justify-between mb-6'>
						<div className='flex items-center gap-3'>
							<div className='w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-md'>
								<Cake className='w-5 h-5 text-white' />
							</div>
							<div>
								<h3 className='text-lg font-bold text-slate-900'>
									Upcoming Birthdays
								</h3>
								<p className='text-sm text-slate-600'>
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
					<div className='h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300'>
						<UpcomingBirthdays
							maxEmployees={10}
							showAllMonths={false}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
