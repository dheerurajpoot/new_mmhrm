"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Users,
    Settings,
    LayoutDashboard,
    UserPlus,
    CalendarCheck,
    Timer,
    CreditCard,
    UserCircle,
    PartyPopper,
    LogOut,
} from "lucide-react";
import { getCurrentUser, signOut } from "@/lib/auth/client";
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
    const [isSigningOut, setIsSigningOut] = useState(false);

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
    const handleLogout = async () => {
        if (isSigningOut) return;
        try {
            setIsSigningOut(true);
            toast.loading("Logging out...", {
                description: "Signing you out securely.",
                duration: 1500,
            });
            await signOut();
            toast.success("Logged out", {
                description: "Redirecting to login...",
            });
            setTimeout(() => {
                window.location.href = "/auth/login";
            }, 800);
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Logout failed", {
                description: "Redirecting anyway...",
            });
            setTimeout(() => {
                window.location.href = "/auth/login";
            }, 1000);
        } finally {
            setIsSigningOut(false);
        }
    };

    const getMenuItems = () => {
		switch (role) {
			case "admin":
				return [
                    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
                    { id: "users", label: "Users", icon: Users },
                    { id: "teams", label: "Teams", icon: Users },
                    { id: "finances", label: "Finance", icon: CreditCard },
                    { id: "leaves", label: "Leaves", icon: CalendarCheck },
					{ id: "settings", label: "Settings", icon: Settings },
				];
			case "hr":
				return [
                    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
					{ id: "employees", label: "Employees", icon: UserPlus },
                    { id: "leaves", label: "Leaves", icon: CalendarCheck },
                    { id: "attendance", label: "Attendance", icon: Timer },
				];
			case "employee":
				return [
                    { id: "overview", label: "Overview", icon: UserCircle },
                    { id: "profile", label: "Profile", icon: UserCircle },
                    { id: "leaves", label: "Leaves", icon: CalendarCheck },
                    { id: "time", label: "Time", icon: Timer },
					{ id: "festivals", label: "Festivals", icon: PartyPopper },
                    { id: "finances", label: "Pay", icon: CreditCard },
				];
			default:
				return [];
		}
	};

	const menuItems = getMenuItems();

    return (
        <div className='md-hidden fixed bottom-0 left-0 right-0 z-50 md:hidden'>
            {/* Glass / blurred background bar with liquid effect overlays */}
            <div className='pointer-events-none absolute inset-0 overflow-hidden backdrop-blur-2xl bg-white/15 dark:bg-black/25 border-t border-white/30 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.15)]'>
                {/* soft inner highlight */}
                <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/40 via-white/80 to-white/40 opacity-70' />
                {/* moving sheen */}
                <div className='absolute -inset-y-4 -left-1/3 w-2/3 rotate-6 opacity-30 sheen' />
                {/* animated gradient blobs for liquid feel */}
                <div className='absolute -top-8 left-6 w-40 h-40 rounded-full blob blob1' />
                <div className='absolute -bottom-10 right-6 w-44 h-44 rounded-full blob blob2' />
                <div className='absolute top-1/2 -translate-y-1/2 left-1/3 w-24 h-24 rounded-full blob blob3' />
            </div>

            {/* Scrollable container */}
            <div className='relative pointer-events-auto px-2 py-2'>
                <div className='flex items-center gap-1 overflow-x-auto no-scrollbar snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none]'>
                    {/* map items */}
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
                            className={`snap-start flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl transition-colors ${
                                activeSection === item.id
                                    ? "text-red-600 bg-red-100/60"
                                    : "text-gray-700 hover:text-gray-900"
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
                            <span className='text-[10px] font-medium'>
                                {item.label}
                            </span>
                        </Button>
                    ))}

                    {/* Logout button */}
                    <Button
                        key='logout'
                        variant='ghost'
                        size='sm'
                        onClick={handleLogout}
                        className='snap-start flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl text-red-700 hover:text-red-800'>
                        <LogOut className='w-5 h-5' />
                        <span className='text-[10px] font-medium'>Logout</span>
                    </Button>
                </div>
            </div>
            {/* component-scoped styles for liquid glass animation */}
            <style jsx>{`
                .blob {
                    filter: blur(28px);
                    opacity: 0.35;
                    background: radial-gradient(closest-side, rgba(255,255,255,0.75), rgba(255,255,255,0.1));
                    animation: blobMove 16s ease-in-out infinite;
                    mix-blend-mode: screen;
                }
                .blob1 { animation-delay: -2s; }
                .blob2 { animation-delay: -8s; }
                .blob3 { animation-delay: -12s; }
                .sheen {
                    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
                    animation: sheenSlide 9s ease-in-out infinite;
                }
                @keyframes blobMove {
                    0%, 100% { transform: translate3d(0,0,0) scale(1); }
                    25% { transform: translate3d(8%, -6%, 0) scale(1.05); }
                    50% { transform: translate3d(-10%, 8%, 0) scale(0.98); }
                    75% { transform: translate3d(6%, 4%, 0) scale(1.08); }
                }
                @keyframes sheenSlide {
                    0% { transform: translateX(-30%); }
                    50% { transform: translateX(130%); }
                    100% { transform: translateX(130%); }
                }
            `}</style>
        </div>
	);
}
