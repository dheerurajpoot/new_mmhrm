"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Users,
	Settings,
	BarChart3,
	UserPlus,
	Calendar,
	Clock,
	DollarSign,
	User,
	PartyPopper,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/client";
import { toast } from "sonner";
import type { Profile } from "@/lib/types";

interface MobileBottomNavProps {
	role: "admin" | "hr" | "employee";
	activeSection: string;
	onNavigate: (section: string) => void;
}

export function MobileBottomNav({
	role,
	activeSection,
	onNavigate,
}: MobileBottomNavProps) {
	const [currentUser, setCurrentUser] = useState<Profile | null>(null);

	useEffect(() => {
		const fetchCurrentUser = async () => {
			try {
				const user = await getCurrentUser();
				setCurrentUser(user);
			} catch (error) {
				console.error("Error fetching current user:", error);
			}
		};
		fetchCurrentUser();

		// Listen for profile updates
		const handleProfileUpdate = () => {
			fetchCurrentUser();
		};

		window.addEventListener("profileUpdated", handleProfileUpdate);
		return () =>
			window.removeEventListener("profileUpdated", handleProfileUpdate);
	}, []);
	const getMenuItems = () => {
		switch (role) {
			case "admin":
				return [
					{ id: "overview", label: "Dashboard", icon: BarChart3 },
					{ id: "users", label: "Users", icon: Users },
					{ id: "teams", label: "Teams", icon: Users },
					{ id: "finances", label: "Finance", icon: DollarSign },
					{ id: "leaves", label: "Leaves", icon: Calendar },
					{ id: "settings", label: "Settings", icon: Settings },
				];
			case "hr":
				return [
					{ id: "overview", label: "Dashboard", icon: Users },
					{ id: "employees", label: "Employees", icon: UserPlus },
					{ id: "leaves", label: "Leaves", icon: Calendar },
					{ id: "attendance", label: "Attendance", icon: Clock },
				];
			case "employee":
				return [
					{ id: "overview", label: "Overview", icon: User },
					{ id: "profile", label: "Profile", icon: User },
					{ id: "leaves", label: "Leaves", icon: Calendar },
					{ id: "time", label: "Time", icon: Clock },
					{ id: "festivals", label: "Festivals", icon: PartyPopper },
					{ id: "finances", label: "Pay", icon: DollarSign },
				];
			default:
				return [];
		}
	};

	const menuItems = getMenuItems();

	return (
		<div className='md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50'>
			<div className='flex justify-around items-center max-w-md mx-auto'>
				{menuItems.map((item) => (
					<Button
						key={item.id}
						variant='ghost'
						size='sm'
						onClick={() => {
							const sectionNames = {
								overview: "Dashboard",
								users: "User Management",
								teams: "Team Management",
								employees: "Employee Management",
								finances: "Financial Management",
								leaves: "Leave Management",
								time: "Time Tracking",
								attendance: "Attendance",
								settings: "Settings",
								profile: "Profile",
								recruitment: "Recruitment",
								performance: "Performance",
								compliance: "Compliance",
							};

							const sectionName =
								sectionNames[
									item.id as keyof typeof sectionNames
								] || item.id;

							toast.info(`Switching to ${sectionName}`, {
								description: `Loading ${sectionName.toLowerCase()}...`,
								duration: 1000,
							});

							onNavigate(item.id);
						}}
						className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
							activeSection === item.id
								? "text-red-600 bg-red-50"
								: "text-gray-600 hover:text-gray-900"
						}`}>
						{item.id === "profile" && currentUser?.profile_photo ? (
							<img
								src={currentUser.profile_photo}
								alt='Profile'
								className='w-5 h-5 rounded-full object-cover'
							/>
						) : (
							<item.icon className='w-5 h-5' />
						)}
						<span className='text-xs font-medium'>
							{item.label}
						</span>
					</Button>
				))}
			</div>
		</div>
	);
}
