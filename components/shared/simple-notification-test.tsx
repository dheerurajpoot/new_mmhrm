"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useSimpleNotifications } from "@/hooks/use-simple-notifications";

export function SimpleNotificationTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const notifications = useSimpleNotifications();

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testWelcomeNotification = async () => {
    try {
      const success = await notifications.showWelcomeNotification("John Doe");
      if (success) {
        addTestResult("✅ Welcome notification sent successfully");
      } else {
        addTestResult("❌ Welcome notification failed");
      }
    } catch (error) {
      addTestResult(`❌ Welcome notification error: ${error}`);
    }
  };

  const testGeneralNotification = async () => {
    try {
      console.log("Testing general notification...");
      console.log("Permission status:", notifications.permission);
      console.log("Is supported:", notifications.isSupported);
      
      const success = await notifications.showNotification(
        "Test Notification",
        "This is a test notification from MMHRM",
        { tag: "test", requireInteraction: false }
      );
      
      console.log("Notification result:", success);
      
      if (success) {
        addTestResult("✅ General notification sent successfully");
      } else {
        addTestResult("❌ General notification failed");
      }
    } catch (error) {
      console.error("General notification error:", error);
      addTestResult(`❌ General notification error: ${error}`);
    }
  };

  const testLeaveNotification = async () => {
    try {
      const success = await notifications.showNotification(
        "Leave Request",
        "John Doe requested 3 days of Annual Leave",
        { tag: "leave-request", requireInteraction: true }
      );
      if (success) {
        addTestResult("✅ Leave notification sent successfully");
      } else {
        addTestResult("❌ Leave notification failed");
      }
    } catch (error) {
      addTestResult(`❌ Leave notification error: ${error}`);
    }
  };

  const testDirectBrowserNotification = async () => {
    try {
      console.log("Testing direct browser notification...");
      console.log("Browser Notification support:", typeof window !== "undefined" && "Notification" in window);
      console.log("Current permission:", typeof window !== "undefined" ? Notification.permission : "N/A");
      
      if (typeof window === "undefined" || !("Notification" in window)) {
        addTestResult("❌ Browser doesn't support notifications");
        return;
      }
      
      if (Notification.permission !== "granted") {
        addTestResult("❌ Permission not granted for direct test");
        return;
      }
      
      const notification = new Notification("Direct Browser Test", {
        body: "This is a direct browser notification test",
        icon: "/placeholder-logo.png",
        tag: "direct-test"
      });
      
      console.log("Direct notification created:", notification);
      addTestResult("✅ Direct browser notification sent successfully");
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        notification.close();
      }, 3000);
      
    } catch (error) {
      console.error("Direct notification error:", error);
      addTestResult(`❌ Direct notification error: ${error}`);
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const getPermissionStatus = () => {
    switch (notifications.permission) {
      case "granted":
        return {
          status: "granted",
          message: "Notifications are enabled",
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          color: "text-green-600",
        };
      case "denied":
        return {
          status: "denied",
          message: "Notifications are blocked",
          icon: <XCircle className="w-4 h-4 text-red-500" />,
          color: "text-red-600",
        };
      default:
        return {
          status: "default",
          message: "Notifications are not enabled",
          icon: <AlertCircle className="w-4 h-4 text-amber-500" />,
          color: "text-amber-600",
        };
    }
  };

  const permissionStatus = getPermissionStatus();

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Simple Notification Test
        </CardTitle>
        <CardDescription>
          Test the simplified notification system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="space-y-2">
          <h4 className="font-medium">Permission Status</h4>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            {permissionStatus.icon}
            <div className="flex-1">
              <p className={`text-sm font-medium ${permissionStatus.color}`}>
                {permissionStatus.message}
              </p>
              {notifications.permission === "denied" && (
                <p className="text-xs text-slate-600 mt-1">
                  To enable notifications, click the notification icon in your browser's address bar
                  or go to your browser settings.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="space-y-4">
          <h4 className="font-medium">Test Notifications</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={testWelcomeNotification}
              disabled={notifications.permission !== "granted"}
              variant="outline"
              className="justify-start"
            >
              <Bell className="w-4 h-4 mr-2" />
              Test Welcome Notification
            </Button>
            
            <Button
              onClick={testGeneralNotification}
              disabled={notifications.permission !== "granted"}
              variant="outline"
              className="justify-start"
            >
              <Bell className="w-4 h-4 mr-2" />
              Test General Notification
            </Button>
            
            <Button
              onClick={testLeaveNotification}
              disabled={notifications.permission !== "granted"}
              variant="outline"
              className="justify-start"
            >
              <Bell className="w-4 h-4 mr-2" />
              Test Leave Notification
            </Button>
            
            <Button
              onClick={testDirectBrowserNotification}
              disabled={notifications.permission !== "granted"}
              variant="outline"
              className="justify-start"
            >
              <Bell className="w-4 h-4 mr-2" />
              Test Direct Browser API
            </Button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Test Results</h4>
              <Button
                onClick={clearTestResults}
                variant="outline"
                size="sm"
              >
                Clear Results
              </Button>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 max-h-40 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How It Works</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Auto-request:</strong> Permission is requested automatically when you visit the website</li>
            <li>• <strong>Welcome notification:</strong> Shows "Hey [Employee Name]! Welcome to MM Team" when permission is granted</li>
            <li>• <strong>Real-time notifications:</strong> Shows notifications for leave requests, approvals, etc.</li>
            <li>• <strong>Mobile support:</strong> Works on mobile devices and desktop browsers</li>
            <li>• <strong>Simple setup:</strong> No complex configuration needed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default SimpleNotificationTest;
