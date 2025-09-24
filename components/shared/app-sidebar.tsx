"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, signOut } from "@/lib/auth/client";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/lib/types";

interface AppSidebarProps {
	role: "admin" | "hr" | "employee";
}

export function AppSidebar({ role }: AppSidebarProps) {
	const [currentUser, setCurrentUser] = useState<Profile | null>(null);
	const router = useRouter();
	const pathname = usePathname();
	const { setOpenMobile } = useSidebar();
	const { settings } = useWebsiteSettings();


	useEffect(() => {
		const fetchCurrentUser = async () => {
			try {
				const user = await getCurrentUser();
				setCurrentUser(user as Profile);
			} catch (error) {
				console.log(" Error fetching user:", error);
			}
		};
		fetchCurrentUser();

		// Listen for profile updates
		const handleProfileUpdate = () => {
			fetchCurrentUser();
		};

		window.addEventListener("profileUpdated", handleProfileUpdate);
		return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
	}, []);

	const handleLogout = async () => {
		await signOut();
		router.push("/");
	};

	const handleNavigation = (section: string) => {
		setOpenMobile(false);
		// Navigation will be handled by parent component
		const event = new CustomEvent("sidebarNavigation", { detail: section });
		window.dispatchEvent(event);
	};

	const getMenuItems = () => {
		switch (role) {
			case "admin":
					return [
						{ id: "overview", label: "Dashboard", icon: BarChart3 },
						{ id: "users", label: "User Management", icon: Users },
						{ id: "finances", label: "Finance Management", icon: DollarSign },
						{ id: "leaves", label: "Leave Management", icon: Calendar },
						{ id: "settings", label: "Settings", icon: Settings },
					];
			case "hr":
				return [
					{ id: "overview", label: "Dashboard", icon: Users },
					{ id: "employees", label: "Employees", icon: UserPlus },
					{ id: "leaves", label: "Leave Requests", icon: Calendar },
					{ id: "attendance", label: "Attendance", icon: Clock },
				];
			case "employee":
				return [
					{ id: "overview", label: "Dashboard", icon: User },
					{ id: "profile", label: "Profile", icon: User },
					{ id: "leaves", label: "Leave Balance", icon: Calendar },
					{ id: "time", label: "Time Tracking", icon: Clock },
					{ id: "finances", label: "Finances", icon: DollarSign },
				];
			default:
				return [];
		}
	};

	const getRoleBadge = () => {
		switch (role) {
			case "admin":
				return (
					<Badge className='bg-red-100 text-red-800 hover:bg-red-100'>
						Administrator
					</Badge>
				);
			case "hr":
				return (
					<Badge className='bg-purple-100 text-purple-800 hover:bg-purple-100'>
						HR Manager
					</Badge>
				);
			case "employee":
				return (
					<Badge className='bg-blue-100 text-blue-800 hover:bg-blue-100'>
						Employee
					</Badge>
				);
			default:
				return null;
		}
	};

	const menuItems = getMenuItems();

	return (
		<Sidebar className='px-6'>
			<SidebarHeader>
				<div className='flex items-center space-x-2 px-2'>
					{settings?.site_logo && settings.site_logo !== "/placeholder-logo.png" ? (
						<img
							src={settings.site_logo}
							alt="Logo"
							className='w-8 h-8 object-contain'
							onError={(e) => {
								e.currentTarget.style.display = 'none';
								// Show fallback
								const fallback = e.currentTarget.nextElementSibling as HTMLElement;
								if (fallback) fallback.style.display = 'flex';
							}}
						/>
					) : null}
					<div className='w-8 h-8 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg flex items-center justify-center' style={{ display: settings?.site_logo && settings.site_logo !== "/placeholder-logo.png" ? 'none' : 'flex' }}>
						<span className='text-white font-bold text-sm'>MM</span>
					</div>
					<span className='text-xl font-bold text-gray-900'>
						{settings?.site_name || "MMHRM"}
					</span>
				</div>

				{currentUser && (
					<div className='mx-2 p-3 bg-gray-50 rounded-lg'>
						<div className="flex items-center space-x-3">
							{currentUser.profile_photo ? (
								<img
									src={currentUser.profile_photo}
									alt="Profile"
									className="w-8 h-8 rounded-full object-cover"
								/>
							) : (
								<div className="w-8 h-8 bg-gradient-to-r from-red-600 to-blue-600 rounded-full flex items-center justify-center">
									<User className="w-4 h-4 text-white" />
								</div>
							)}
							<div>
								<p className='font-medium text-gray-900 text-sm'>
									{currentUser.full_name}
								</p>
								{getRoleBadge()}
								{currentUser.department && role === "employee" && (
									<p className='text-xs text-gray-600 mt-1 flex items-center'>
										<Building className='w-3 h-3 mr-1' />
										{currentUser.department}
									</p>
								)}
							</div>
						</div>
					</div>
				)}
			</SidebarHeader>

			<SidebarContent>
				<SidebarMenu>
					{menuItems.map((item) => (
						<SidebarMenuItem key={item.id}>
							<SidebarMenuButton
								onClick={() => handleNavigation(item.id)}
								className='w-full justify-start'>
								<item.icon className='w-4 h-4' />
								<span>{item.label}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={handleLogout}
							className='w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50'>
							<LogOut className='w-4 h-4' />
							<span>Logout</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
