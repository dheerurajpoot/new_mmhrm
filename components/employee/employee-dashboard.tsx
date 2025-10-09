"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { getCurrentUser } from "@/lib/auth/client";
import {
	SidebarProvider,
	SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cake, Sparkle, Sparkles } from "lucide-react";
import { useSectionData } from "@/hooks/use-section-data";
import type { Profile } from "@/lib/types";
import { ResourceHints } from "@/components/optimization/critical-css";
import UpcomingFestivalsStrip from "@/components/employee/upcoming-festivals-strip";
import { LocationIndicator } from "./location-indicator";

// Lazy load components for better performance
const EmployeeProfile = lazy(() => import("./employee-profile").then(module => ({ default: module.EmployeeProfile })))
const LeaveBalance = lazy(() => import("./leave-balance").then(module => ({ default: module.LeaveBalance })))
const TimeTracking = lazy(() => import("./time-tracking").then(module => ({ default: module.TimeTracking })))
const TimeTrackingWidget = lazy(() => import("./time-tracking-widget").then(module => ({ default: module.TimeTrackingWidget })))
const EmployeeFinances = lazy(() => import("./employee-finances").then(module => ({ default: module.EmployeeFinances })))
const EmployeeStats = lazy(() => import("./employee-stats").then(module => ({ default: module.EmployeeStats })))
const TeamMembers = lazy(() => import("./team-members").then(module => ({ default: module.TeamMembers })))
const UpcomingBirthdays = lazy(() => import("@/components/shared/upcoming-birthdays").then(module => ({ default: module.UpcomingBirthdays })))
const Festivals = lazy(() => import("./festivals").then(module => ({ default: module.Festivals })))

// Loading skeleton component
const EmployeeSectionSkeleton = () => (
	<div className="space-y-6">
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-32" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-20 w-full" />
			</CardContent>
		</Card>
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{[...Array(3)].map((_, i) => (
				<Card key={i}>
					<CardHeader>
						<Skeleton className="h-4 w-24" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-8 w-16 mb-2" />
						<Skeleton className="h-3 w-32" />
					</CardContent>
				</Card>
			))}
		</div>
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-32" />
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{[...Array(3)].map((_, i) => (
							<Skeleton key={i} className="h-16 w-full" />
						))}
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-32" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-64 w-full" />
				</CardContent>
			</Card>
		</div>
	</div>
)

export function EmployeeDashboard() {
	const [activeSection, setActiveSection] = useState("overview");
	const [currentUser, setCurrentUser] = useState<Profile | null>(null);

	// Use section-based data loading (except for festivals which has its own API)
	const { data: sectionData, loading: sectionLoading, error: sectionError } = useSectionData(activeSection, {
		enabled: activeSection !== 'festivals', // Don't fetch section data for festivals
		refetchOnMount: true
	})

	useEffect(() => {
		const fetchCurrentUser = async () => {
			try {
				const user = await getCurrentUser();
				setCurrentUser(user as Profile);
			} catch (error) {
				console.log(" Auth error:", error);
			}
		};
		fetchCurrentUser();
	}, []);

	useEffect(() => {
		const handleNavigation = (event: CustomEvent) => {
			setActiveSection(event.detail);
		};

		window.addEventListener(
			"sidebarNavigation",
			handleNavigation as EventListener
		);
		return () =>
			window.removeEventListener(
				"sidebarNavigation",
				handleNavigation as EventListener
			);
	}, []);

	const renderContent = () => {
		if (sectionLoading) {
			return <EmployeeSectionSkeleton />
		}

		if (sectionError) {
			return (
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
						<p className="text-gray-600 mb-4">{sectionError.message}</p>
						<button
							onClick={() => window.location.reload()}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
						>
							Retry
						</button>
					</div>
				</div>
			)
		}

		switch (activeSection) {
			case "overview":
				return (
					<div className='space-y-6'>
						{/* Time Tracking Widget */}
						<Suspense fallback={
							<div className="w-full">
								<div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white border-0 shadow-lg rounded-lg">
									<div className="p-4">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-4">
												<div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
													<Skeleton className="h-5 w-5 opacity-60" />
												</div>
												<div>
													<Skeleton className="h-4 w-28 mb-1" />
													<Skeleton className="h-3 w-20" />
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Skeleton className="h-7 w-20" />
											</div>
										</div>
										<div className="flex items-center justify-between text-xs text-blue-100 border-b border-white/20 pb-3 mb-3">
											<Skeleton className="h-4 w-40" />
											<Skeleton className="h-4 w-24" />
										</div>
										<div className="space-y-2">
											<Skeleton className="h-10 w-full bg-white/20" />
											<Skeleton className="h-10 w-full bg-white/20" />
											<Skeleton className="h-10 w-full bg-white/20" />
										</div>
									</div>
								</div>
							</div>
						}>
							<TimeTrackingWidget />
						</Suspense>

						<Suspense fallback={<EmployeeSectionSkeleton />}>
							<EmployeeStats sectionData={sectionData} />
						</Suspense>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
							<Suspense fallback={<Skeleton className="h-auto w-full" />}>
								<TeamMembers sectionData={sectionData} />
							</Suspense>
							<Suspense fallback={<Skeleton className="h-auto w-full" />}>
								<div className='space-y-4'>
									{/* Upcoming Birthdays Box (redesigned) */}
									<div className='rounded-2xl border border-pink-100 bg-gradient-to-br from-white via-pink-50/40 to-rose-50/40 shadow-lg'>
										<div className='p-4 pb-3 flex items-center justify-between'>
											<div className='flex items-center gap-3'>
												<div className='w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md'>
													<Cake className='w-5 h-5 text-white' />
												</div>
												<div>
													<h3 className='text-base font-bold text-gray-900'>Upcoming Birthdays</h3>
													<p className='text-xs text-gray-600'>Celebrate your colleagues</p>
												</div>
											</div>
											<div className='flex items-center gap-2'>
												<Badge variant='outline' className='text-[10px] bg-pink-50 text-pink-700 border-pink-200'>This Month</Badge>
											</div>
										</div>
										<div className='h-40 overflow-x-auto overflow-y-hidden pr-2 pb-2 touch-pan-x select-none'>
											<UpcomingBirthdays
												maxEmployees={12}
												showAllMonths={false}
												sectionData={sectionData}
												horizontal
											/>
										</div>
										<div className='px-4 pb-3 pt-0 flex items-center justify-between'>
											<div className='text-xs text-rose-600'>Swipe to see more</div>
											<div className='flex items-center gap-2'>
												<div className='w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse' />
												<div className='w-1.5 h-1.5 rounded-full bg-pink-200' />
											</div>
										</div>

									</div>

									{/* Upcoming Festival Box */}
									<div className='rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40 shadow-lg'>
										<div className='p-4 pb-3 flex items-center justify-between'>
											<div className='flex items-center gap-3'>
												<div className='w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md'>
													<Sparkles className='w-5 h-5 text-white' />
												</div>
												<div>
													<h3 className='text-base font-bold text-gray-900'>Upcoming Festivals</h3>
													<p className='text-xs text-gray-600'>Celebrate festivals</p>
												</div>
											</div>
											{/* Location Indicator */}
											<div className="flex justify-end">
												<LocationIndicator />
											</div>
										</div>
										<div className='h-40 overflow-x-auto overflow-y-hidden pr-2 pb-2 touch-pan-x select-none'>
											<UpcomingFestivalsStrip />
										</div>
									</div>
								</div>
							</Suspense>
						</div>
					</div>
				);
			case "profile":
				return (
					<Suspense fallback={<EmployeeSectionSkeleton />}>
						<EmployeeProfile sectionData={sectionData} />
					</Suspense>
				);
			case "leaves":
				return (
					<div className='space-y-6'>
						{/* Time Tracking Widget */}
						<Suspense fallback={<Skeleton className="h-20 w-full" />}>
							<TimeTrackingWidget />
						</Suspense>

						<Suspense fallback={<EmployeeSectionSkeleton />}>
							<LeaveBalance sectionData={sectionData} />
						</Suspense>
					</div>
				);
			case "time":
				return (
					<Suspense fallback={<EmployeeSectionSkeleton />}>
						<TimeTracking sectionData={sectionData} />
					</Suspense>
				);
			case "festivals":
				return (
					<Suspense fallback={<EmployeeSectionSkeleton />}>
						<Festivals />
					</Suspense>
				);
			case "finances":
				return (
					<Suspense fallback={<EmployeeSectionSkeleton />}>
						<EmployeeFinances sectionData={sectionData} />
					</Suspense>
				);
			default:
				return (
					<div className='space-y-6'>
						<Suspense fallback={<EmployeeSectionSkeleton />}>
							<EmployeeStats sectionData={sectionData} />
						</Suspense>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
							<Suspense fallback={<Skeleton className="h-64 w-full" />}>
								<TeamMembers sectionData={sectionData} />
							</Suspense>
							<Suspense fallback={<Skeleton className="h-64 w-full" />}>
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
											sectionData={sectionData}
										/>
									</div>
								</div>
							</Suspense>
						</div>
					</div>
				);
		}
	};

	const getSectionTitle = () => {
		const firstName = currentUser?.full_name?.split(" ")[0] || "Employee";
		switch (activeSection) {
			case "overview":
				return {
					title: `Welcome back, ${firstName}!`,
					description: "Your personal dashboard and quick stats",
				};
			case "profile":
				return {
					title: "My Profile",
					description:
						"Manage your personal information and settings",
				};
			case "leaves":
				return {
					title: "Leave Balance",
					description: "View your leave balance and request time off",
				};
			case "time":
				return {
					title: "Time Tracking",
					description: "Track your work hours and attendance",
				};
			case "festivals":
				return {
					title: "Festivals & Holidays",
					description: "Explore festivals and holidays around the world",
				};
			case "finances":
				return {
					title: "My Finances",
					description:
						"View your salary, payslips, and financial information",
				};
			default:
				return {
					title: `Welcome back, ${firstName}!`,
					description:
						"Manage your profile, time, and leave requests",
				};
		}
	};

	const { title, description } = getSectionTitle();

	return (
		<SidebarProvider>
			{/* Prefetch APIs used by time tracking to improve perceived speed */}
			<ResourceHints />
			<AppSidebar role='employee' />
			<SidebarInset>
				<DashboardHeader
					title={title}
					description={description}
					role="employee"
				/>
				<div className='flex-1 p-3 md:p-4 pb-20 md:pb-4 bg-gray-50/50 min-h-screen'>
					<div className='max-w-full mx-auto'>{renderContent()}</div>
				</div>
			</SidebarInset>
			<MobileBottomNav
				role='employee'
				activeSection={activeSection}
				onNavigate={setActiveSection}
			/>
		</SidebarProvider>
	);
}
