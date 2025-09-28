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
	Calendar,
	Clock,
	AlertCircle,
	ArrowUpRight,
	ArrowDownRight,
	UserCheck,
	Building2,
} from "lucide-react";
import { UpcomingBirthdays } from "@/components/shared/upcoming-birthdays";

interface HRStats {
	totalEmployees: number;
	pendingLeaves: number;
	todayAttendance: number;
	overdueApprovals: number;
	employeeGrowth: number;
	leaveGrowth: number;
	attendanceGrowth: number;
	approvalGrowth: number;
}

export function HRStats() {
	const [stats, setStats] = useState<HRStats>({
		totalEmployees: 0,
		pendingLeaves: 0,
		todayAttendance: 0,
		overdueApprovals: 0,
		employeeGrowth: 0,
		leaveGrowth: 0,
		attendanceGrowth: 0,
		approvalGrowth: 0,
	});
	const [recentActivity, setRecentActivity] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const [usersRes, leavesRes, attendanceRes] = await Promise.all([
					fetch("/api/employees"),
					fetch("/api/leave-requests"),
					fetch("/api/time-entries"),
				]);

				const users = await usersRes.json();
				const leaves = await leavesRes.json();
				const attendance = await attendanceRes.json();

				const threeDaysAgo = new Date();
				threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

				setStats({
					totalEmployees:
						users.filter((u: any) => u.role === "employee")
							.length || 0,
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
					overdueApprovals:
						leaves.filter(
							(l: any) =>
								l.status === "pending" &&
								new Date(l.created_at) < threeDaysAgo
						).length || 0,
					employeeGrowth: 15,
					leaveGrowth: 8,
					attendanceGrowth: 22,
					approvalGrowth: -12,
				});

				// Generate recent activity for HR
				const activities: {
					id: string;
					type: "leave";
					message: string;
					timestamp: string;
					user: string;
					status: "pending" | "approved" | "rejected";
				}[] = [];
				const recentLeaves = leaves
					.filter((l: any) => l.status === "pending")
					.slice(0, 4);
				recentLeaves.forEach((leave: any) => {
					activities.push({
						id: `leave-${leave._id}`,
						type: "leave",
						message: `${
							leave.employee?.full_name || "Employee"
						} submitted leave request`,
						timestamp: leave.created_at,
						user: leave.employee?.full_name || "Employee",
						status: "pending",
					});
				});
				setRecentActivity(activities);
			} catch (error) {
				console.error("Error fetching HR stats:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchStats();
	}, []);

	const statCards = [
		{
			title: "Total Employees",
			value: stats.totalEmployees.toLocaleString(),
			description: "Active employees",
			icon: Users,
			growth: stats.employeeGrowth,
			trend: "up",
			color: "text-emerald-600",
			bgColor: "bg-emerald-50",
		},
		{
			title: "Pending Leaves",
			value: stats.pendingLeaves.toLocaleString(),
			description: "Awaiting approval",
			icon: Calendar,
			growth: stats.leaveGrowth,
			trend: "up",
			color: "text-emerald-600",
			bgColor: "bg-emerald-50",
		},
		{
			title: "Today's Attendance",
			value: stats.todayAttendance.toLocaleString(),
			description: "Employees present",
			icon: Clock,
			growth: stats.attendanceGrowth,
			trend: "up",
			color: "text-emerald-600",
			bgColor: "bg-emerald-50",
		},
		{
			title: "Overdue Approvals",
			value: stats.overdueApprovals.toLocaleString(),
			description: "Needs attention",
			icon: AlertCircle,
			growth: stats.approvalGrowth,
			trend: "down",
			color: "text-red-500",
			bgColor: "bg-red-50",
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

	return (
		<div className='space-y-8'>
			{/* Statistics Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				{statCards.map((stat, index) => (
					<div
						key={index}
						className='bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-sm font-medium text-gray-600'>
								{stat.title}
							</h3>
							<div
								className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
								<stat.icon
									className={`w-4 h-4 ${stat.color}`}
								/>
							</div>
						</div>
						<div className='mb-2'>
							<p className='text-2xl font-bold text-gray-900'>
								{stat.value}
							</p>
						</div>
						<div className='flex items-center space-x-2'>
							{stat.trend === "up" ? (
								<ArrowUpRight className='w-4 h-4 text-emerald-600' />
							) : (
								<ArrowDownRight className='w-4 h-4 text-red-500' />
							)}
							<span
								className={`text-sm font-medium ${
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

			{/* Leave Distribution Chart */}
			<div className='bg-white rounded-2xl border border-gray-100 p-6'>
				<h3 className='text-lg font-semibold text-gray-900 mb-6'>
					Leave Distribution
				</h3>
				<div className='flex items-center justify-center'>
					<div className='relative w-48 h-48'>
						{/* Donut Chart Placeholder */}
						<div className='absolute inset-0 rounded-full border-8 border-gray-200'></div>
						<div
							className='absolute inset-0 rounded-full border-8 border-blue-500'
							style={{
								clipPath:
									"polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%)",
							}}></div>
						<div
							className='absolute inset-0 rounded-full border-8 border-orange-500'
							style={{
								clipPath:
									"polygon(50% 50%, 100% 50%, 100% 100%, 0% 100%, 0% 50%)",
							}}></div>
						<div className='absolute inset-0 flex items-center justify-center'>
							<div className='text-center'>
								<p className='text-2xl font-bold text-gray-900'>
									Total
								</p>
								<p className='text-3xl font-bold text-gray-900'>
									{stats.pendingLeaves +
										stats.overdueApprovals}
								</p>
							</div>
						</div>
					</div>
				</div>
				<div className='flex justify-center space-x-8 mt-6'>
					<div className='flex items-center space-x-2'>
						<div className='w-3 h-3 bg-blue-500 rounded-full'></div>
						<span className='text-sm text-gray-600'>Pending</span>
					</div>
					<div className='flex items-center space-x-2'>
						<div className='w-3 h-3 bg-orange-500 rounded-full'></div>
						<span className='text-sm text-gray-600'>Overdue</span>
					</div>
				</div>
			</div>

			{/* Bottom Section */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Attendance Chart */}
				<div className='bg-white rounded-2xl border border-gray-100 p-6'>
					<h3 className='text-lg font-semibold text-gray-900 mb-6'>
						Weekly Attendance
					</h3>
					<div className='h-64 flex items-end justify-between space-x-2'>
						{[1, 2, 3, 4, 5, 6, 7].map((day) => (
							<div
								key={day}
								className='flex flex-col items-center space-y-2'>
								<div className='flex flex-col space-y-1'>
									<div
										className='w-8 bg-emerald-300 rounded-t'
										style={{
											height: `${
												Math.random() * 100 + 20
											}px`,
										}}></div>
									<div
										className='w-8 bg-emerald-500 rounded-t'
										style={{
											height: `${
												Math.random() * 80 + 10
											}px`,
										}}></div>
								</div>
								<span className='text-xs text-gray-500'>
									Day {day}
								</span>
							</div>
						))}
					</div>
					<div className='flex justify-center space-x-6 mt-4'>
						<div className='flex items-center space-x-2'>
							<div className='w-3 h-3 bg-emerald-300 rounded'></div>
							<span className='text-sm text-gray-600'>
								Present
							</span>
						</div>
						<div className='flex items-center space-x-2'>
							<div className='w-3 h-3 bg-emerald-500 rounded'></div>
							<span className='text-sm text-gray-600'>Late</span>
						</div>
					</div>
				</div>

				{/* Recent Leave Requests */}
				<div className='bg-white rounded-2xl border border-gray-100 p-6'>
					<h3 className='text-lg font-semibold text-gray-900 mb-6'>
						Recent Leave Requests
					</h3>
					<div className='space-y-4'>
						{recentActivity.length > 0 ? (
							recentActivity.map((activity, index) => (
								<div
									key={activity.id}
									className='flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors'>
									<div className='w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm'>
										{activity.user?.charAt(0) || "E"}
									</div>
									<div className='flex-1'>
										<p className='text-sm font-medium text-gray-900'>
											{activity.user || "Employee"}
										</p>
										<p className='text-xs text-gray-500'>
											{activity.message}
										</p>
									</div>
									<div className='px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800'>
										Pending
									</div>
								</div>
							))
						) : (
							<div className='text-center py-8 text-gray-500'>
								<Calendar className='w-12 h-12 mx-auto mb-4 opacity-50' />
								<p>No recent leave requests</p>
							</div>
						)}
					</div>
				</div>

				{/* Upcoming Birthdays */}
				<div className='lg:col-span-1'>
					<UpcomingBirthdays
						showAllMonths={true}
						title='Employee Birthdays'
						description='Month-wise birthday calendar'
					/>
				</div>
			</div>
		</div>
	);
}
