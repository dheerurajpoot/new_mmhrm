"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth/client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ConnectionStatus } from "@/components/shared/connection-status";
import { NotificationPanel } from "@/components/shared/notification-panel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    User,
    Mail,
    Phone,
    Shield,
    Settings,
    LogOut,
    ChevronDown,
    Building,
    Calendar,
    Clock,
    Edit3,
    Paperclip,
    MapPin,
    Briefcase
} from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";

interface DashboardHeaderProps {
    title: string;
    description: string;
    role: "admin" | "employee" | "hr";
}

export function DashboardHeader({ title, description, role }: DashboardHeaderProps) {
    const [currentUser, setCurrentUser] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const user = await getCurrentUser();
                setCurrentUser(user as Profile);
            } catch (error) {
                console.error("Auth error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCurrentUser();
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push("/auth/login");
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    const getRoleColor = (userRole: string) => {
        switch (userRole) {
            case "admin":
                return "bg-red-200/40 text-red-800 border-none";
            case "hr":
                return "bg-blue-200/40 text-blue-800 border-none";
            case "employee":
                return "bg-green-200/40 text-green-800 border-none";
            default:
                return "bg-gray-200/40 text-gray-800 border-none";
        }
    };

    const getRoleIcon = (userRole: string) => {
        switch (userRole) {
            case "admin":
                return <Shield className="h-3 w-3" />;
            case "hr":
                return <User className="h-3 w-3" />;
            case "employee":
                return <User className="h-3 w-3" />;
            default:
                return <User className="h-3 w-3" />;
        }
    };

    const getBackgroundImage = (userRole: string) => {
        // Using a beautiful landscape image as background
        return "https://image.s7.sfmc-content.com/lib/fe2a11717d640474741277/m/1/5971aff4-18c8-4e07-99e2-498a87507b63.png";
    };

    if (loading) {
        return (
            <div className="relative h-64 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative flex h-full items-center gap-2 px-4">
                    <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
                    <div className="flex flex-col flex-1">
                        <div className="h-5 w-32 bg-gray-300 rounded animate-pulse"></div>
                        <div className="h-4 w-48 bg-gray-300 rounded animate-pulse mt-1"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-64 overflow-visible">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${getBackgroundImage(currentUser?.role || role)})`
                }}
            />

            {/* Overlay 
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/40"></div>*/}

            {/* Top Navigation Bar */}
            <div className="relative flex items-center justify-between px-2 py-4 text-white">
                {/* Left Side - Breadcrumb */}
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="text-white hover:bg-white/20" />
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/100 md:text-sm text-xs">Dashboard</span>
                        <span className="text-white/60">/</span>
                        <span className="text-white font-medium text-xs md:text-sm">{title}</span>
                    </div>
                </div>

                {/* Right Side - Notifications + Live status */}
                <div className="flex items-center gap-3">
                    {/* Notification bell */}
                    <div className="sm:block">
                        <NotificationPanel role={role} />
                    </div>
                    {/* <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 flex items-center gap-2"
                    >
                        <Paperclip className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit cover</span>
                    </Button> */}

                    {/* Connection Status */}
                    <div className="hidden mr-5 sm:block">
                        <ConnectionStatus />
                    </div>
                </div>
            </div>

            {/* Floating Profile Card */}
            <div className="absolute bottom-3 left-3 right-3 max-w-[400px]">
                <div className="bg-white/60 backdrop-blur-[1px] rounded-2xl p-6 shadow-2xl border border-white/20 mt-3">
                    {/* Profile Header */}
                    <div className="flex items-start gap-4 mb-4">
                        <Avatar className="h-16 w-16 ring-4 ring-white/50">
                            <AvatarImage
                                src={currentUser?.profile_photo || ""}
                                alt={currentUser?.full_name || "User"}
                            />
                            <AvatarFallback className="text-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                {currentUser?.full_name?.charAt(0) || currentUser?.email?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-gray-900 truncate">
                                {currentUser?.full_name || "Unknown User"}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge
                                    variant="outline"
                                    className={`text-xs px-2 py-0.5 ${getRoleColor(currentUser?.role || role)}`}
                                >
                                    {getRoleIcon(currentUser?.role || role)}
                                    <span className="ml-1 capitalize">{currentUser?.role || role}</span>
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details Grid */}
                    <div className="flex flex-wrap gap-3">
                        {/* Email */}
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <div className="min-w-0">
                                <p className="text-gray-900 font-medium truncate">
                                    {currentUser?.email || "No email"}
                                </p>
                            </div>
                        </div>

                        {/* Phone */}
                        {currentUser?.phone && (
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <div className="min-w-0">
                                    <p className="text-gray-900 font-medium">
                                        {currentUser.phone}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Department */}
                        {currentUser?.department && (
                            <div className="flex items-center gap-2 text-sm">
                                <Building className="h-4 w-4 text-gray-500" />
                                <div className="min-w-0">
                                    <p className="text-gray-900 font-medium truncate">
                                        {currentUser.department}
                                    </p>
                                    <p className="text-gray-500 text-xs">Department</p>
                                </div>
                            </div>
                        )}

                        {/* Position */}
                        {currentUser?.position && (
                            <div className="hidden md:flex items-center gap-2 text-sm">
                                <Briefcase className="h-4 w-4 text-gray-500" />
                                <div className="min-w-0">
                                    <p className="text-gray-900 font-medium truncate">
                                        {currentUser.position}
                                    </p>
                                    <p className="text-gray-500 text-xs">Position</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
