"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { notificationService } from "@/lib/services/notification-service";

interface RealtimeContextType {
	isConnected: boolean;
	lastUpdate: Date | null;
	connectionStatus: "connecting" | "connected" | "disconnected" | "error";
	triggerUpdate: () => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
	isConnected: false,
	lastUpdate: null,
	connectionStatus: "disconnected",
	triggerUpdate: () => {},
});

export function useRealtime() {
	return useContext(RealtimeContext);
}

interface RealtimeProviderProps {
	children: React.ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
	const [isConnected, setIsConnected] = useState(false);
	const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
	const [connectionStatus, setConnectionStatus] = useState<
		"connecting" | "connected" | "disconnected" | "error"
	>("disconnected");

	const triggerUpdate = () => {
		setLastUpdate(new Date());
	};

	useEffect(() => {
		setConnectionStatus("connecting");

		// Simulate connection establishment
		const timer = setTimeout(() => {
			setIsConnected(true);
			setConnectionStatus("connected");
			console.log(" Polling-based real-time system initialized");
		}, 1000);

		// Set up periodic health check
		const healthCheck = setInterval(() => {
			// Simple health check - could be enhanced to ping server
			if (navigator.onLine) {
				setIsConnected(true);
				setConnectionStatus("connected");
			} else {
				setIsConnected(false);
				setConnectionStatus("disconnected");
			}
		}, 30000); // Check every 30 seconds

		// Cleanup on unmount
		return () => {
			clearTimeout(timer);
			clearInterval(healthCheck);
			setIsConnected(false);
			setConnectionStatus("disconnected");
		};
	}, []);

	useEffect(() => {
		const handleDataUpdate = async (event: CustomEvent) => {
			setLastUpdate(new Date());

			// Show toast notifications based on event type
			const { type, message, payload } = event.detail;

			if (type === "leave_request_updated") {
				toast("A leave request has been updated");
			} else if (type === "payroll_created") {
				toast("A new payroll record has been created");
			} else if (type === "finance_updated") {
				toast("Employee financial information has been updated");
			}

			// Show browser notifications if permission is granted
			if (notificationService.getPermissionStatus().granted) {
				try {
					let notificationTitle = "System Update";
					let notificationBody = message || "You have a new update";

					switch (type) {
						case "leave_request":
							notificationTitle = "New Leave Request";
							if (payload?.employeeName && payload?.leaveType && payload?.days) {
								notificationBody = `${payload.employeeName} requested ${payload.days} day${payload.days === 1 ? '' : 's'} of ${payload.leaveType}`;
							}
							break;
						case "leave_approved":
							notificationTitle = "Leave Approved";
							if (payload?.leaveType && payload?.days) {
								notificationBody = `Your ${payload.days} day${payload.days === 1 ? '' : 's'} ${payload.leaveType} request has been approved`;
							}
							break;
						case "leave_rejected":
							notificationTitle = "Leave Rejected";
							if (payload?.leaveType && payload?.days) {
								notificationBody = `Your ${payload.days} day${payload.days === 1 ? '' : 's'} ${payload.leaveType} request has been rejected`;
							}
							break;
						case "payroll_created":
							notificationTitle = "Payroll Update";
							if (payload?.amount && payload?.period) {
								notificationBody = `Your salary for ${payload.period} has been processed: $${payload.amount.toFixed(2)}`;
							}
							break;
						case "time_tracking":
							notificationTitle = "Time Tracking";
							notificationBody = message || "Time tracking update";
							break;
						default:
							notificationTitle = "System Notification";
							notificationBody = message || "You have a new notification";
					}

					await notificationService.showNotification({
						title: notificationTitle,
						body: notificationBody,
						tag: type,
						data: { type, payload },
						requireInteraction: type === "leave_request" || type === "leave_approved" || type === "leave_rejected",
					});
				} catch (error) {
					console.error("Failed to show browser notification:", error);
				}
			}
		};

		window.addEventListener(
			"data-update",
			handleDataUpdate as EventListener
		);

		return () => {
			window.removeEventListener(
				"data-update",
				handleDataUpdate as EventListener
			);
		};
	}, []);

	return (
		<RealtimeContext.Provider
			value={{
				isConnected,
				lastUpdate,
				connectionStatus,
				triggerUpdate,
			}}>
			{children}
		</RealtimeContext.Provider>
	);
}

export function triggerDataUpdate(type: string, message?: string, audience?: "admin" | "hr" | "employee", payload?: any) {
	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent("data-update", {
				detail: { type, message, audience, payload },
			})
		);
	}
}
