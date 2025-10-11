"use client";

import { useEffect, useState, useCallback } from "react";
import { simpleNotificationService } from "@/lib/services/simple-notification-service";

export interface SimpleNotificationState {
  isSupported: boolean;
  permission: "granted" | "denied" | "default";
  isRequesting: boolean;
}

export function useSimpleNotifications() {
  const [state, setState] = useState<SimpleNotificationState>({
    isSupported: simpleNotificationService.isSupported(),
    permission: simpleNotificationService.getPermissionStatus(),
    isRequesting: false,
  });

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn("Notifications are not supported in this browser");
      return false;
    }

    setState(prev => ({ ...prev, isRequesting: true }));

    try {
      const granted = await simpleNotificationService.requestPermission();
      setState(prev => ({
        ...prev,
        permission: simpleNotificationService.getPermissionStatus(),
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
    body: string,
    options?: {
      icon?: string;
      tag?: string;
      requireInteraction?: boolean;
    }
  ): Promise<boolean> => {
    if (state.permission !== "granted") {
      console.warn("Notification permission not granted");
      return false;
    }

    try {
      return await simpleNotificationService.showNotification({
        title,
        body,
        icon: options?.icon,
        tag: options?.tag,
        requireInteraction: options?.requireInteraction,
      });
    } catch (error) {
      console.error("Error showing notification:", error);
      return false;
    }
  }, [state.permission]);

  const showWelcomeNotification = useCallback(async (employeeName: string): Promise<boolean> => {
    if (state.permission !== "granted") {
      console.warn("Notification permission not granted");
      return false;
    }

    try {
      return await simpleNotificationService.showWelcomeNotification(employeeName);
    } catch (error) {
      console.error("Error showing welcome notification:", error);
      return false;
    }
  }, [state.permission]);

  const showTestNotification = useCallback(async (): Promise<boolean> => {
    if (state.permission !== "granted") {
      console.warn("Notification permission not granted");
      return false;
    }

    try {
      return await simpleNotificationService.showTestNotification();
    } catch (error) {
      console.error("Error showing test notification:", error);
      return false;
    }
  }, [state.permission]);

  // Update permission status when component mounts or permission changes
  useEffect(() => {
    const updatePermission = () => {
      setState(prev => ({
        ...prev,
        permission: simpleNotificationService.getPermissionStatus(),
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
    showWelcomeNotification,
    showTestNotification,
  };
}
