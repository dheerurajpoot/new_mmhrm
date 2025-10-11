"use client";

import { useEffect, useState, useCallback } from "react";
import { notificationService, NotificationPermission } from "@/lib/services/notification-service";

export interface BrowserNotificationState {
  permission: NotificationPermission;
  isSupported: boolean;
  isRequesting: boolean;
}

export function useBrowserNotifications() {
  const [state, setState] = useState<BrowserNotificationState>({
    permission: notificationService.getPermissionStatus(),
    isSupported: notificationService.isSupported(),
    isRequesting: false,
  });

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn("Browser notifications are not supported");
      return false;
    }

    setState(prev => ({ ...prev, isRequesting: true }));

    try {
      const granted = await notificationService.requestPermission();
      setState(prev => ({
        ...prev,
        permission: notificationService.getPermissionStatus(),
        isRequesting: false,
      }));
      return granted;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setState(prev => ({ ...prev, isRequesting: false }));
      return false;
    }
  }, [state.isSupported]);

  const showNotification = useCallback(async (
    title: string,
    options?: {
      body?: string;
      icon?: string;
      tag?: string;
      data?: any;
      requireInteraction?: boolean;
    }
  ) => {
    if (!state.permission.granted) {
      console.warn("Notification permission not granted");
      return null;
    }

    return notificationService.showNotification({
      title,
      body: options?.body,
      icon: options?.icon,
      tag: options?.tag,
      data: options?.data,
      requireInteraction: options?.requireInteraction,
    });
  }, [state.permission.granted]);

  const showLeaveRequestNotification = useCallback(async (
    employeeName: string,
    leaveType: string,
    days: number
  ) => {
    if (!state.permission.granted) return null;
    return notificationService.showLeaveRequestNotification(employeeName, leaveType, days);
  }, [state.permission.granted]);

  const showLeaveApprovalNotification = useCallback(async (
    leaveType: string,
    days: number,
    approved: boolean
  ) => {
    if (!state.permission.granted) return null;
    return notificationService.showLeaveApprovalNotification(leaveType, days, approved);
  }, [state.permission.granted]);

  const showPayrollNotification = useCallback(async (
    amount: number,
    period: string
  ) => {
    if (!state.permission.granted) return null;
    return notificationService.showPayrollNotification(amount, period);
  }, [state.permission.granted]);

  const showTimeTrackingNotification = useCallback(async (message: string) => {
    if (!state.permission.granted) return null;
    return notificationService.showTimeTrackingNotification(message);
  }, [state.permission.granted]);

  const showGeneralNotification = useCallback(async (
    title: string,
    message: string,
    type: string = "general"
  ) => {
    if (!state.permission.granted) return null;
    return notificationService.showGeneralNotification(title, message, type);
  }, [state.permission.granted]);

  // Update permission status when component mounts or permission changes
  useEffect(() => {
    const updatePermission = () => {
      setState(prev => ({
        ...prev,
        permission: notificationService.getPermissionStatus(),
      }));
    };

    // Update on mount
    updatePermission();

    // Listen for permission changes (some browsers support this)
    if (typeof window !== "undefined" && "Notification" in window) {
      // Note: There's no direct event for permission changes in most browsers
      // We'll update on focus as a fallback
      const handleFocus = () => {
        updatePermission();
      };

      window.addEventListener("focus", handleFocus);
      return () => window.removeEventListener("focus", handleFocus);
    }
  }, []);

  return {
    ...state,
    requestPermission,
    showNotification,
    showLeaveRequestNotification,
    showLeaveApprovalNotification,
    showPayrollNotification,
    showTimeTrackingNotification,
    showGeneralNotification,
  };
}
