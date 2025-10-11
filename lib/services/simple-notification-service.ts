"use client";

export interface SimpleNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

class SimpleNotificationService {
  private permissionGranted: boolean = false;

  constructor() {
    this.checkPermission();
  }

  private checkPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      this.permissionGranted = false;
      return;
    }

    this.permissionGranted = Notification.permission === "granted";
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (this.permissionGranted) {
      return true;
    }

    if (Notification.permission === "denied") {
      console.warn("Notification permission has been denied");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === "granted";
      console.log("Notification permission result:", permission);
      return this.permissionGranted;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  async showNotification(options: SimpleNotificationOptions): Promise<boolean> {
    // Always check current permission status instead of relying on cached value
    this.checkPermission();
    if (!this.permissionGranted) {
      console.warn("Notification permission not granted");
      return false;
    }

    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    try {
      console.log("Attempting to show notification:", options.title);
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || "/placeholder-logo.png",
        badge: options.badge || "/placeholder-logo.png",
        tag: options.tag || "mmhrm-notification",
        requireInteraction: true, // Always require interaction to make it more visible
        silent: false, // Make sure it makes a sound
      });

      console.log("Notification created successfully");

      // Add event listeners to track notification behavior
      notification.onshow = () => {
        console.log("Notification is now visible to user");
      };
      
      notification.onclick = () => {
        console.log("Notification was clicked");
        notification.close();
      };
      
      notification.onclose = () => {
        console.log("Notification was closed");
      };
      
      notification.onerror = (error) => {
        console.error("Notification error:", error);
      };

      // Auto-close after 15 seconds (longer duration)
      setTimeout(() => {
        if (notification) {
          notification.close();
          console.log("Notification auto-closed after 15 seconds");
        }
      }, 15000);

      return true;
    } catch (error) {
      console.error("Error showing notification:", error);
      return false;
    }
  }

  async showWelcomeNotification(employeeName: string): Promise<boolean> {
    return this.showNotification({
      title: "Welcome to MMHRM!",
      body: `Hey ${employeeName}! Welcome to MM Team.`,
      tag: "welcome",
      requireInteraction: true,
    });
  }

  async showTestNotification(): Promise<boolean> {
    return this.showNotification({
      title: "Test Notification",
      body: "This is a test notification from MMHRM",
      tag: "test",
      requireInteraction: false,
    });
  }

  isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  }

  getPermissionStatus(): "granted" | "denied" | "default" {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }
    return Notification.permission;
  }

  isPermissionGranted(): boolean {
    return this.permissionGranted;
  }
}

// Create a singleton instance
export const simpleNotificationService = new SimpleNotificationService();

// Export the class for testing or custom instances
export { SimpleNotificationService };
