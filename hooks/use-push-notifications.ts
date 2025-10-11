"use client";

import { useEffect, useState, useCallback } from "react";
import { pushNotificationService, PushNotificationPayload } from "@/lib/services/push-notification-service";

export interface PushNotificationState {
  isSupported: boolean;
  permission: {
    granted: boolean;
    denied: boolean;
    default: boolean;
  };
  isSubscribed: boolean;
  isRequesting: boolean;
  subscription: any | null;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: pushNotificationService.isSupported(),
    permission: pushNotificationService.getPermissionStatus(),
    isSubscribed: false,
    isRequesting: false,
    subscription: null,
  });

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn("Push notifications are not supported");
      return false;
    }

    setState(prev => ({ ...prev, isRequesting: true }));

    try {
      const granted = await pushNotificationService.requestPermission();
      setState(prev => ({
        ...prev,
        permission: pushNotificationService.getPermissionStatus(),
        isRequesting: false,
      }));
      return granted;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setState(prev => ({ ...prev, isRequesting: false }));
      return false;
    }
  }, [state.isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.permission.granted) {
      console.warn("Notification permission not granted");
      return false;
    }

    setState(prev => ({ ...prev, isRequesting: true }));

    try {
      const subscription = await pushNotificationService.subscribeToPush();
      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription,
        subscription,
        isRequesting: false,
      }));
      return !!subscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      setState(prev => ({ ...prev, isRequesting: false }));
      return false;
    }
  }, [state.permission.granted]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isRequesting: true }));

    try {
      const success = await pushNotificationService.unsubscribeFromPush();
      setState(prev => ({
        ...prev,
        isSubscribed: !success,
        subscription: null,
        isRequesting: false,
      }));
      return success;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      setState(prev => ({ ...prev, isRequesting: false }));
      return false;
    }
  }, []);

  const sendNotification = useCallback(async (payload: PushNotificationPayload): Promise<boolean> => {
    if (!state.isSubscribed) {
      console.warn("Not subscribed to push notifications");
      return false;
    }

    try {
      return await pushNotificationService.sendPushNotification(payload);
    } catch (error) {
      console.error("Error sending push notification:", error);
      return false;
    }
  }, [state.isSubscribed]);

  const showLocalNotification = useCallback(async (payload: PushNotificationPayload): Promise<boolean> => {
    if (!state.permission.granted) {
      console.warn("Notification permission not granted");
      return false;
    }

    try {
      return await pushNotificationService.showLocalNotification(payload);
    } catch (error) {
      console.error("Error showing local notification:", error);
      return false;
    }
  }, [state.permission.granted]);

  // Initialize subscription status on mount
  useEffect(() => {
    const checkSubscription = async () => {
      if (state.isSupported && state.permission.granted) {
        try {
          const subscription = await pushNotificationService.getSubscription();
          setState(prev => ({
            ...prev,
            isSubscribed: !!subscription,
            subscription,
          }));
        } catch (error) {
          console.error("Error checking subscription status:", error);
        }
      }
    };

    checkSubscription();
  }, [state.isSupported, state.permission.granted]);

  // Update permission status when component mounts or permission changes
  useEffect(() => {
    const updatePermission = () => {
      setState(prev => ({
        ...prev,
        permission: pushNotificationService.getPermissionStatus(),
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
    subscribe,
    unsubscribe,
    sendNotification,
    showLocalNotification,
  };
}
