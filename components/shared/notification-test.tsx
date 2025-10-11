"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Smartphone, Monitor, Wifi, WifiOff } from "lucide-react";
import { useBrowserNotifications } from "@/hooks/use-browser-notifications";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function NotificationTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const browserNotifications = useBrowserNotifications();
  const pushNotifications = usePushNotifications();

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testLocalNotification = async () => {
    try {
      const success = await browserNotifications.showNotification("Test Notification", {
        body: "This is a test of local browser notifications",
        tag: "test",
        requireInteraction: true,
      });
      
      if (success) {
        addTestResult("✅ Local notification sent successfully");
      } else {
        addTestResult("❌ Local notification failed");
      }
    } catch (error) {
      addTestResult(`❌ Local notification error: ${error}`);
    }
  };

  const testPushNotification = async () => {
    try {
      const success = await pushNotifications.sendNotification({
        title: "Test Push Notification",
        body: "This is a test of push notifications (works when app is closed)",
        tag: "test-push",
        type: "test",
        requireInteraction: true,
      });
      
      if (success) {
        addTestResult("✅ Push notification sent successfully");
      } else {
        addTestResult("❌ Push notification failed");
      }
    } catch (error) {
      addTestResult(`❌ Push notification error: ${error}`);
    }
  };

  const testLeaveRequestNotification = async () => {
    try {
      const success = await browserNotifications.showLeaveRequestNotification(
        "John Doe",
        "Annual Leave",
        3
      );
      
      if (success) {
        addTestResult("✅ Leave request notification sent successfully");
      } else {
        addTestResult("❌ Leave request notification failed");
      }
    } catch (error) {
      addTestResult(`❌ Leave request notification error: ${error}`);
    }
  };

  const testLeaveApprovalNotification = async () => {
    try {
      const success = await browserNotifications.showLeaveApprovalNotification(
        "Sick Leave",
        2,
        true
      );
      
      if (success) {
        addTestResult("✅ Leave approval notification sent successfully");
      } else {
        addTestResult("❌ Leave approval notification failed");
      }
    } catch (error) {
      addTestResult(`❌ Leave approval notification error: ${error}`);
    }
  };

  const testPayrollNotification = async () => {
    try {
      const success = await browserNotifications.showPayrollNotification(
        3500.00,
        "December 2024"
      );
      
      if (success) {
        addTestResult("✅ Payroll notification sent successfully");
      } else {
        addTestResult("❌ Payroll notification failed");
      }
    } catch (error) {
      addTestResult(`❌ Payroll notification error: ${error}`);
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const getDeviceType = () => {
    if (typeof window === "undefined") return "unknown";
    
    const userAgent = navigator.userAgent;
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return "mobile";
    }
    return "desktop";
  };

  const getConnectionStatus = () => {
    if (typeof window === "undefined" || !("navigator" in window)) return "unknown";
    return navigator.onLine ? "online" : "offline";
  };

  const deviceType = getDeviceType();
  const connectionStatus = getConnectionStatus();

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Test Center
        </CardTitle>
        <CardDescription>
          Test different types of notifications to ensure they work properly on your device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Device and Connection Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            {deviceType === "mobile" ? (
              <Smartphone className="w-4 h-4 text-blue-500" />
            ) : (
              <Monitor className="w-4 h-4 text-green-500" />
            )}
            <span className="text-sm font-medium">
              {deviceType === "mobile" ? "Mobile Device" : "Desktop Device"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {connectionStatus === "online" ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {connectionStatus === "online" ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {/* Permission Status */}
        <div className="space-y-2">
          <h4 className="font-medium">Permission Status</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant={browserNotifications.permission.granted ? "default" : "secondary"}>
              <Bell className="w-3 h-3 mr-1" />
              Browser Notifications: {browserNotifications.permission.granted ? "Granted" : "Not Granted"}
            </Badge>
            <Badge variant={pushNotifications.isSubscribed ? "default" : "secondary"}>
              <BellOff className="w-3 h-3 mr-1" />
              Push Notifications: {pushNotifications.isSubscribed ? "Subscribed" : "Not Subscribed"}
            </Badge>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="space-y-4">
          <h4 className="font-medium">Test Notifications</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={testLocalNotification}
              disabled={!browserNotifications.permission.granted}
              variant="outline"
              className="justify-start"
            >
              <Bell className="w-4 h-4 mr-2" />
              Test Local Notification
            </Button>
            
            <Button
              onClick={testPushNotification}
              disabled={!pushNotifications.isSubscribed}
              variant="outline"
              className="justify-start"
            >
              <Bell className="w-4 h-4 mr-2" />
              Test Push Notification
            </Button>
            
            <Button
              onClick={testLeaveRequestNotification}
              disabled={!browserNotifications.permission.granted}
              variant="outline"
              className="justify-start"
            >
              <Bell className="w-4 h-4 mr-2" />
              Test Leave Request
            </Button>
            
            <Button
              onClick={testLeaveApprovalNotification}
              disabled={!browserNotifications.permission.granted}
              variant="outline"
              className="justify-start"
            >
              <Bell className="w-4 h-4 mr-2" />
              Test Leave Approval
            </Button>
            
            <Button
              onClick={testPayrollNotification}
              disabled={!browserNotifications.permission.granted}
              variant="outline"
              className="justify-start"
            >
              <Bell className="w-4 h-4 mr-2" />
              Test Payroll Notification
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
          <h4 className="font-medium text-blue-900 mb-2">Testing Instructions</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Local Notifications:</strong> Work when the app is open or in background</li>
            <li>• <strong>Push Notifications:</strong> Work even when the app is completely closed</li>
            <li>• <strong>Mobile Testing:</strong> Test on actual mobile devices for best results</li>
            <li>• <strong>Browser Support:</strong> Chrome, Firefox, Safari, and Edge support notifications</li>
            <li>• <strong>Permission:</strong> Make sure to allow notifications when prompted</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default NotificationTest;
