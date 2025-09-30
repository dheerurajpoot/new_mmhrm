"use client";

import { signOut } from "@/lib/auth/client";
import { useRouter, usePathname } from "next/navigation";
import { useWebsiteSettings } from "@/hooks/use-website-settings"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import {
	Users,
	Settings,
	BarChart3,
	LogOut,
	UserPlus,
	Calendar,
	Clock,
	DollarSign,
	User,
	Building,
	Shield,
	UserCheck,
	TrendingUp,
	FileText,
	Briefcase,
	GraduationCap,
	Target,
	Scale,
	Heart,
	PieChart,
	CreditCard,
	Home,
} from "lucide-react";
import { toast } from "sonner";

interface AppSidebarProps {
	role: "admin" | "hr" | "employee";
}

export function AppSidebar({ role }: AppSidebarProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { setOpenMobile } = useSidebar();
	const { settings } = useWebsiteSettings();

	const handleLogout = async () => {
		try {
			toast.loading("Logging out...", {
				description: "Please wait while we sign you out.",
				duration: 2000,
			});
			
			await signOut();
			
			toast.success("Logged out successfully!", {
				description: "You have been signed out of your account.",
				duration: 3000,
			});
			
			// Force redirect to login page
			setTimeout(() => {
				window.location.href = "/auth/login";
			}, 1500);
		} catch (error) {
			console.error("Logout error:", error);
			toast.error("Logout failed", {
				description: "There was an issue signing you out. Redirecting anyway...",
				duration: 3000,
			});
			// Even if logout fails, redirect to login
			setTimeout(() => {
				window.location.href = "/auth/login";
			}, 2000);
		}
	};

	const handleNavigation = (section: string) => {
		setOpenMobile(false);
		
		// Show navigation toast
		const sectionNames = {
			overview: "Dashboard",
			users: "User Management",
			teams: "Team Management",
			employees: "Employee Management",
			finances: "Financial Management",
			leaves: "Leave Management",
			settings: "Settings",
			profile: "Profile",
			time: "Time Tracking",
			attendance: "Attendance",
			recruitment: "Recruitment",
			performance: "Performance",
			compliance: "Compliance"
		};
		
		const sectionName = sectionNames[section as keyof typeof sectionNames] || section;
		
		toast.info(`Navigating to ${sectionName}`, {
			description: `Loading ${sectionName.toLowerCase()}...`,
			duration: 1500,
		});
		
		// Navigation will be handled by parent component
		const event = new CustomEvent("sidebarNavigation", { detail: section });
		window.dispatchEvent(event);
	};

	const getMenuItems = () => {
		switch (role) {
			case "admin":
				return [
					{ 
						id: "overview", 
						label: "Dashboard", 
						icon: BarChart3, 
						color: "from-red-500 to-red-600",
						bgColor: "bg-red-50 hover:bg-red-100",
						textColor: "text-red-700"
					},
					{ 
						id: "users", 
						label: "User Management", 
						icon: Shield, 
						color: "from-orange-500 to-orange-600",
						bgColor: "bg-orange-50 hover:bg-orange-100",
						textColor: "text-orange-700"
					},
					{ 
						id: "teams", 
						label: "Team Management", 
						icon: Users, 
						color: "from-blue-500 to-blue-600",
						bgColor: "bg-blue-50 hover:bg-blue-100",
						textColor: "text-blue-700"
					},
					{ 
						id: "finances", 
						label: "Finance Management", 
						icon: TrendingUp, 
						color: "from-green-500 to-green-600",
						bgColor: "bg-green-50 hover:bg-green-100",
						textColor: "text-green-700"
					},
					{ 
						id: "leaves", 
						label: "Leave Management", 
						icon: Calendar, 
						color: "from-purple-500 to-purple-600",
						bgColor: "bg-purple-50 hover:bg-purple-100",
						textColor: "text-purple-700"
					},
					{ 
						id: "attendance", 
						label: "Attendance", 
						icon: Clock, 
						color: "from-teal-500 to-teal-600",
						bgColor: "bg-teal-50 hover:bg-teal-100",
						textColor: "text-teal-700"
					},
					{ 
						id: "profile", 
						label: "My Profile", 
						icon: User, 
						color: "from-indigo-500 to-indigo-600",
						bgColor: "bg-indigo-50 hover:bg-indigo-100",
						textColor: "text-indigo-700"
					},
					{ 
						id: "settings", 
						label: "Settings", 
						icon: Settings, 
						color: "from-gray-500 to-gray-600",
						bgColor: "bg-gray-50 hover:bg-gray-100",
						textColor: "text-gray-700"
					},
				];
			case "hr":
				return [
					{ 
						id: "overview", 
						label: "Dashboard", 
						icon: PieChart, 
						color: "from-purple-500 to-purple-600",
						bgColor: "bg-purple-50 hover:bg-purple-100",
						textColor: "text-purple-700"
					},
					{ 
						id: "employees", 
						label: "Employees", 
						icon: UserCheck, 
						color: "from-blue-500 to-blue-600",
						bgColor: "bg-blue-50 hover:bg-blue-100",
						textColor: "text-blue-700"
					},
					{ 
						id: "leaves", 
						label: "Leave Requests", 
						icon: Heart, 
						color: "from-pink-500 to-pink-600",
						bgColor: "bg-pink-50 hover:bg-pink-100",
						textColor: "text-pink-700"
					},
					{ 
						id: "attendance", 
						label: "Attendance", 
						icon: Clock, 
						color: "from-green-500 to-green-600",
						bgColor: "bg-green-50 hover:bg-green-100",
						textColor: "text-green-700"
					},
					{ 
						id: "recruitment", 
						label: "Recruitment", 
						icon: GraduationCap, 
						color: "from-indigo-500 to-indigo-600",
						bgColor: "bg-indigo-50 hover:bg-indigo-100",
						textColor: "text-indigo-700"
					},
					{ 
						id: "performance", 
						label: "Performance", 
						icon: Target, 
						color: "from-amber-500 to-amber-600",
						bgColor: "bg-amber-50 hover:bg-amber-100",
						textColor: "text-amber-700"
					},
					{ 
						id: "compliance", 
						label: "Compliance", 
						icon: Scale, 
						color: "from-slate-500 to-slate-600",
						bgColor: "bg-slate-50 hover:bg-slate-100",
						textColor: "text-slate-700"
					},
					{ 
						id: "profile", 
						label: "My Profile", 
						icon: User, 
						color: "from-indigo-500 to-indigo-600",
						bgColor: "bg-indigo-50 hover:bg-indigo-100",
						textColor: "text-indigo-700"
					},
				];
			case "employee":
				return [
					{ 
						id: "overview", 
						label: "Dashboard", 
						icon: Home, 
						color: "from-blue-500 to-blue-600",
						bgColor: "bg-blue-50 hover:bg-blue-100",
						textColor: "text-blue-700"
					},
					{ 
						id: "profile", 
						label: "Profile", 
						icon: User, 
						color: "from-indigo-500 to-indigo-600",
						bgColor: "bg-indigo-50 hover:bg-indigo-100",
						textColor: "text-indigo-700"
					},
					{ 
						id: "leaves", 
						label: "Leave Balance", 
						icon: Calendar, 
						color: "from-green-500 to-green-600",
						bgColor: "bg-green-50 hover:bg-green-100",
						textColor: "text-green-700"
					},
					{ 
						id: "time", 
						label: "Time Tracking", 
						icon: Clock, 
						color: "from-orange-500 to-orange-600",
						bgColor: "bg-orange-50 hover:bg-orange-100",
						textColor: "text-orange-700"
					},
					{ 
						id: "finances", 
						label: "Finances", 
						icon: CreditCard, 
						color: "from-emerald-500 to-emerald-600",
						bgColor: "bg-emerald-50 hover:bg-emerald-100",
						textColor: "text-emerald-700"
					},
				];
			default:
				return [];
		}
	};

	const menuItems = getMenuItems();

	return (
		<Sidebar className='px-4 border-r border-gray-200/50 bg-gradient-to-b from-white to-gray-50/30'>
			<SidebarHeader className='px-2 py-6'>
				<div className='flex items-center space-x-3 px-2 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100'>
					{settings?.site_logo && settings.site_logo !== "/placeholder-logo.png" ? (
						<img
							src={settings.site_logo}
							alt="Logo"
							className='w-10 h-10 object-contain rounded-lg'
							onError={(e) => {
								e.currentTarget.style.display = 'none';
								// Show fallback
								const fallback = e.currentTarget.nextElementSibling as HTMLElement;
								if (fallback) fallback.style.display = 'flex';
							}}
						/>
					) : null}
					<div className='w-10 h-10 bg-gradient-to-br from-red-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg' style={{ display: settings?.site_logo && settings.site_logo !== "/placeholder-logo.png" ? 'none' : 'flex' }}>
						<span className='text-white font-bold text-lg'>MM</span>
					</div>
					<div className='flex flex-col'>
						<span className='text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'>
							{settings?.site_name || "MMHRM"}
						</span>
						<span className='text-xs text-gray-500 font-medium'>HR Management</span>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent className='px-2 py-4'>
				<SidebarMenu className='space-y-2'>
					{menuItems.map((item) => (
						<SidebarMenuItem key={item.id}>
							<SidebarMenuButton
								onClick={() => handleNavigation(item.id)}
								className={`w-full justify-start group transition-all duration-200 ${item.bgColor} ${item.textColor} hover:shadow-md hover:scale-[1.02] rounded-xl px-4 py-3 border border-transparent hover:border-gray-200`}>
								<div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} shadow-sm group-hover:shadow-md transition-shadow duration-200`}>
									<item.icon className='w-4 h-4 text-white' />
								</div>
								<span className='ml-3 font-medium'>{item.label}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarContent>

			<SidebarFooter className='px-2 py-4'>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={handleLogout}
							className='w-full justify-start group transition-all duration-200 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 hover:shadow-md hover:scale-[1.02] rounded-xl px-4 py-3 border border-transparent hover:border-red-200'>
							<div className='p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 shadow-sm group-hover:shadow-md transition-shadow duration-200'>
								<LogOut className='w-4 h-4 text-white' />
							</div>
							<span className='ml-3 font-medium'>Logout</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
