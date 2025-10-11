"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Settings, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBrowserNotifications } from "@/hooks/use-browser-notifications";

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const browserNotifications = useBrowserNotifications();
  const [showSettings, setShowSettings] = useState(false);

  const getPermissionStatus = () => {
    if (!browserNotifications.isSupported) {
      return {
        status: "unsupported",
        message: "Browser notifications are not supported in this browser",
        icon: <XCircle className="w-4 h-4 text-red-500" />,
        color: "text-red-600",
      };
    }

    if (browserNotifications.permission.granted) {
      return {
        status: "granted",
        message: "Browser notifications are enabled",
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        color: "text-green-600",
      };
    }

    if (browserNotifications.permission.denied) {
      return {
        status: "denied",
        message: "Browser notifications are blocked. Please enable them in your browser settings.",
        icon: <XCircle className="w-4 h-4 text-red-500" />,
        color: "text-red-600",
      };
    }

    return {
      status: "default",
      message: "Browser notifications are not enabled",
      icon: <AlertCircle className="w-4 h-4 text-amber-500" />,
      color: "text-amber-600",
    };
  };

  const permissionStatus = getPermissionStatus();

  const handleRequestPermission = async () => {
    const granted = await browserNotifications.requestPermission();
    if (granted) {
      // Show a test notification
      await browserNotifications.showNotification("Notifications Enabled", {
        body: "You will now receive real-time notifications for important updates.",
        tag: "permission-granted",
      });
    }
  };

  const handleTestNotification = async () => {
    if (browserNotifications.permission.granted) {
      await browserNotifications.showNotification("Test Notification", {
        body: "This is a test notification to verify everything is working correctly.",
        tag: "test",
        requireInteraction: true,
      });
    }
  };

  return (
    <div className={className}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Notification Settings
      </Button>

      {showSettings && (
        <Card className="absolute top-12 right-0 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Manage your browser notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Permission Status */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              {permissionStatus.icon}
              <div className="flex-1">
                <p className={`text-sm font-medium ${permissionStatus.color}`}>
                  {permissionStatus.message}
                </p>
                {permissionStatus.status === "denied" && (
                  <p className="text-xs text-slate-600 mt-1">
                    To enable notifications, click the notification icon in your browser's address bar
                    or go to your browser settings.
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {permissionStatus.status === "default" && (
                <Button
                  onClick={handleRequestPermission}
                  disabled={browserNotifications.isRequesting}
                  className="w-full"
                >
                  {browserNotifications.isRequesting ? (
                    "Requesting Permission..."
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Enable Notifications
                    </>
                  )}
                </Button>
              )}

              {permissionStatus.status === "granted" && (
                <div className="space-y-2">
                  <Button
                    onClick={handleTestNotification}
                    variant="outline"
                    className="w-full"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Send Test Notification
                  </Button>
                  <p className="text-xs text-slate-600 text-center">
                    You will receive notifications for:
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    <Badge variant="secondary" className="text-xs">Leave Requests</Badge>
                    <Badge variant="secondary" className="text-xs">Leave Approvals</Badge>
                    <Badge variant="secondary" className="text-xs">Payroll Updates</Badge>
                    <Badge variant="secondary" className="text-xs">Time Tracking</Badge>
                  </div>
                </div>
              )}

              {permissionStatus.status === "denied" && (
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">
                    Notifications are currently blocked
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Try to open browser settings (may not work in all browsers)
                      if (typeof window !== "undefined") {
                        window.open("chrome://settings/content/notifications", "_blank");
                      }
                    }}
                    className="text-xs"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Open Browser Settings
                  </Button>
                </div>
              )}

              {permissionStatus.status === "unsupported" && (
                <div className="text-center">
                  <p className="text-sm text-slate-600">
                    Your browser doesn't support notifications
                  </p>
                </div>
              )}
            </div>

            {/* Browser Support Info */}
            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                Supported browsers: Chrome, Firefox, Safari, Edge
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default NotificationSettings;
