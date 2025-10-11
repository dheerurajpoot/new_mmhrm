"use client";

import { pushNotificationService } from "./push-notification-service";

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export interface BrowserNotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class NotificationService {
  private permission: NotificationPermission = {
    granted: false,
    denied: false,
    default: true,
  };

  constructor() {
    this.updatePermissionStatus();
  }

  private updatePermissionStatus() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      this.permission = { granted: false, denied: true, default: false };
      return;
    }

    switch (Notification.permission) {
      case "granted":
        this.permission = { granted: true, denied: false, default: false };
        break;
      case "denied":
        this.permission = { granted: false, denied: true, default: false };
        break;
      default:
        this.permission = { granted: false, denied: false, default: true };
    }
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (this.permission.granted) {
      return true;
    }

    if (this.permission.denied) {
      console.warn("Notification permission has been denied");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.updatePermissionStatus();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  getPermissionStatus(): NotificationPermission {
    this.updatePermissionStatus();
    return { ...this.permission };
  }

  async showNotification(options: BrowserNotificationOptions): Promise<Notification | null> {
    if (!this.permission.granted) {
      console.warn("Notification permission not granted");
      return null;
    }

    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return null;
    }

    try {
      // Try to use service worker for better background support
      if (pushNotificationService.isSupported()) {
        const success = await pushNotificationService.showLocalNotification({
          title: options.title,
          body: options.body,
          icon: options.icon,
          badge: options.badge,
          tag: options.tag,
          url: options.data?.url || '/',
          type: options.data?.type || 'general',
          payload: options.data,
          requireInteraction: options.requireInteraction
        });

        if (success) {
          return null; // Service worker handled it
        }
      }

      // Fallback to direct notification API
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || "/placeholder-logo.png",
        badge: options.badge || "/placeholder-logo.png",
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        vibrate: options.vibrate,
        actions: options.actions,
      });

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error("Error showing notification:", error);
      return null;
    }
  }

  async showLeaveRequestNotification(employeeName: string, leaveType: string, days: number): Promise<Notification | null> {
    return this.showNotification({
      title: "New Leave Request",
      body: `${employeeName} requested ${days} day${days === 1 ? '' : 's'} of ${leaveType}`,
      tag: "leave-request",
      data: { type: "leave_request", employeeName, leaveType, days },
      requireInteraction: true,
      actions: [
        { action: "view", title: "View Request", icon: "/placeholder-logo.png" },
        { action: "dismiss", title: "Dismiss", icon: "/placeholder-logo.png" }
      ]
    });
  }

  async showLeaveApprovalNotification(leaveType: string, days: number, approved: boolean): Promise<Notification | null> {
    const status = approved ? "approved" : "rejected";
    const emoji = approved ? "✅" : "❌";
    
    return this.showNotification({
      title: `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      body: `${emoji} Your ${days} day${days === 1 ? '' : 's'} ${leaveType} request has been ${status}`,
      tag: `leave-${status}`,
      data: { type: "leave_approval", leaveType, days, approved },
      requireInteraction: true,
      actions: [
        { action: "view", title: "View Details", icon: "/placeholder-logo.png" },
        { action: "dismiss", title: "Dismiss", icon: "/placeholder-logo.png" }
      ]
    });
  }

  async showPayrollNotification(amount: number, period: string): Promise<Notification | null> {
    return this.showNotification({
      title: "Payroll Update",
      body: `Your salary for ${period} has been processed: $${amount.toFixed(2)}`,
      tag: "payroll",
      data: { type: "payroll", amount, period },
      requireInteraction: false,
      actions: [
        { action: "view", title: "View Payroll", icon: "/placeholder-logo.png" }
      ]
    });
  }

  async showTimeTrackingNotification(message: string): Promise<Notification | null> {
    return this.showNotification({
      title: "Time Tracking",
      body: message,
      tag: "time-tracking",
      data: { type: "time_tracking" },
      requireInteraction: false
    });
  }

  async showGeneralNotification(title: string, message: string, type: string = "general"): Promise<Notification | null> {
    return this.showNotification({
      title,
      body: message,
      tag: type,
      data: { type },
      requireInteraction: false
    });
  }

  // Close all notifications with a specific tag
  closeNotificationsByTag(tag: string) {
    if (typeof window === "undefined") return;
    
    // Note: There's no direct way to close notifications by tag
    // This is a limitation of the Notification API
    console.log(`Requested to close notifications with tag: ${tag}`);
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  }

  // Get notification settings URL (for browsers that support it)
  getSettingsUrl(): string | null {
    if (typeof window === "undefined") return null;
    
    // This is browser-specific and may not work in all browsers
    try {
      if ("serviceWorker" in navigator && "permissions" in navigator) {
        return "chrome://settings/content/notifications";
      }
    } catch (error) {
      console.warn("Could not determine notification settings URL");
    }
    
    return null;
  }
}

// Create a singleton instance
export const notificationService = new NotificationService();

// Export the class for testing or custom instances
export { NotificationService };
