"use client";

import { useEffect, useState } from "react";
import { useSimpleNotifications } from "@/hooks/use-simple-notifications";
import { getCurrentUser } from "@/lib/auth/client";

export function NotificationInitializer() {
  const [hasInitialized, setHasInitialized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const notifications = useSimpleNotifications();

  useEffect(() => {
    const initializeNotifications = async () => {
      // Check if we've already initialized notifications for this session
      const hasInitializedKey = "mmhrm_notifications_initialized";
      const hasInitialized = localStorage.getItem(hasInitializedKey);
      
      if (hasInitialized === "true") {
        setHasInitialized(true);
        return;
      }

      // Get current user
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to get current user:", error);
        return;
      }

      // Check if notifications are supported
      if (!notifications.isSupported) {
        console.log("Notifications not supported in this browser");
        setHasInitialized(true);
        return;
      }

      // If permission is already granted, show welcome notification
      if (notifications.permission === "granted") {
        localStorage.setItem(hasInitializedKey, "true");
        setHasInitialized(true);
        return;
      }

      // If permission is denied, don't ask again
      if (notifications.permission === "denied") {
        console.log("Notification permission denied by user");
        setHasInitialized(true);
        return;
      }

      // Request permission for the first time
      if (notifications.permission === "default") {
        try {
          const granted = await notifications.requestPermission();
          
          if (granted && user) {
            const employeeName = user.full_name || user.name || user.email;
            if (employeeName) {
              await notifications.showWelcomeNotification(employeeName);
            }
          }
          
          localStorage.setItem(hasInitializedKey, "true");
          setHasInitialized(true);
        } catch (error) {
          console.error("Error initializing notifications:", error);
          setHasInitialized(true);
        }
      }
    };

    // Only initialize if we haven't already
    if (!hasInitialized) {
      initializeNotifications();
    }
  }, [notifications, hasInitialized]);

  // Show welcome notification when user is available and permission is granted
  useEffect(() => {
    const showWelcomeIfReady = async () => {
      if (notifications.permission === "granted" && user && !hasInitialized) {
        if (user?.full_name || user?.name || user?.email) {
          const employeeName = user.full_name || user.name || user.email;
          console.log("Showing welcome notification for:", employeeName);
          await notifications.showWelcomeNotification(employeeName);
        }
      }
    };

    showWelcomeIfReady();
  }, [user, notifications.permission, hasInitialized, notifications]);

  // This component doesn't render anything, it just handles initialization
  return null;
}

export default NotificationInitializer;
