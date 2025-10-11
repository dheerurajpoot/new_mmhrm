"use client";

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  type?: string;
  payload?: any;
  requireInteraction?: boolean;
}

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  constructor() {
    this.initializeServiceWorker();
  }

  private async initializeServiceWorker() {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.warn("Service Worker not supported");
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      console.log("Service Worker ready");
    } catch (error) {
      console.error("Failed to initialize service worker:", error);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.registration) {
      console.warn("Service Worker not available");
      return false;
    }

    if (!("Notification" in window)) {
      console.warn("Notifications not supported");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      console.warn("Notification permission denied");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.warn("Service Worker not available");
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
          'BEl62iUYgUivxIkv69yViEuiBIa40HI8F7V1jH0nZswz6ebJOTsr6bFizAAxYtR4xkxQJ2edL9F8a8l4mUyXp4E'
        )
      });

      this.subscription = subscription;
      return subscription;
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      const result = await this.subscription.unsubscribe();
      this.subscription = null;
      return result;
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
      return false;
    }
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      this.subscription = subscription;
      return subscription;
    } catch (error) {
      console.error("Failed to get push subscription:", error);
      return null;
    }
  }

  async sendNotificationToServiceWorker(payload: PushNotificationPayload): Promise<boolean> {
    if (!this.registration) {
      console.warn("Service Worker not available");
      return false;
    }

    try {
      // Send message to service worker to show notification
      await this.registration.active?.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload
      });

      return true;
    } catch (error) {
      console.error("Failed to send notification to service worker:", error);
      return false;
    }
  }

  async sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
    if (!this.subscription) {
      console.warn("No push subscription available");
      return false;
    }

    try {
      // Send to server to trigger push notification
      const response = await fetch('/api/push-notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: this.subscription,
          payload
        })
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to send push notification:", error);
      return false;
    }
  }

  async showLocalNotification(payload: PushNotificationPayload): Promise<boolean> {
    if (!this.registration) {
      console.warn("Service Worker not available");
      return false;
    }

    try {
      await this.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/placeholder-logo.png',
        badge: payload.badge || '/placeholder-logo.png',
        tag: payload.tag || 'mmhrm-notification',
        data: {
          url: payload.url || '/',
          type: payload.type || 'general',
          payload: payload.payload || {},
          timestamp: Date.now()
        },
        requireInteraction: payload.requireInteraction || false,
        actions: this.getNotificationActions(payload.type || 'general')
      });

      return true;
    } catch (error) {
      console.error("Failed to show local notification:", error);
      return false;
    }
  }

  private getNotificationActions(type: string) {
    const baseActions = [
      {
        action: 'close',
        title: 'Close',
        icon: '/placeholder-logo.png',
      }
    ];

    switch (type) {
      case 'leave_request':
        return [
          {
            action: 'view_request',
            title: 'View Request',
            icon: '/placeholder-logo.png',
          },
          ...baseActions
        ];
      case 'leave_approved':
      case 'leave_rejected':
        return [
          {
            action: 'view_leave',
            title: 'View Leave',
            icon: '/placeholder-logo.png',
          },
          ...baseActions
        ];
      case 'payroll':
        return [
          {
            action: 'view_payroll',
            title: 'View Payroll',
            icon: '/placeholder-logo.png',
          },
          ...baseActions
        ];
      default:
        return [
          {
            action: 'view_dashboard',
            title: 'View Dashboard',
            icon: '/placeholder-logo.png',
          },
          ...baseActions
        ];
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  isSupported(): boolean {
    return typeof window !== "undefined" && 
           "serviceWorker" in navigator && 
           "PushManager" in window &&
           "Notification" in window;
  }

  getPermissionStatus(): NotificationPermission {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return { granted: false, denied: true, default: false };
    }

    switch (Notification.permission) {
      case "granted":
        return { granted: true, denied: false, default: false };
      case "denied":
        return { granted: false, denied: true, default: false };
      default:
        return { granted: false, denied: false, default: true };
    }
  }
}

// Create a singleton instance
export const pushNotificationService = new PushNotificationService();

// Export the class for testing or custom instances
export { PushNotificationService };
