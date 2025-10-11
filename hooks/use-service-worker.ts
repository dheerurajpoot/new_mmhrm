"use client";

import { useEffect } from "react";

export function useServiceWorker() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none"
      });

      console.log("Service Worker registered successfully:", registration);

      // Handle updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              if (confirm("New version available! Reload to update?")) {
                window.location.reload();
              }
            }
          });
        }
      });

      // Handle controller change
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });

      // Set up message handling for service worker communication
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "NOTIFICATION_CLICKED") {
          // Handle notification click
          console.log("Notification clicked:", event.data.payload);
        }
      });

    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  };

  const unregisterServiceWorker = async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log("Service Worker unregistered successfully");
    } catch (error) {
      console.error("Service Worker unregistration failed:", error);
    }
  };

  const clearCache = async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      console.log("Cache cleared successfully");
    } catch (error) {
      console.error("Cache clearing failed:", error);
    }
  };

  const isOnline = () => navigator.onLine;

  const addOfflineListener = (callback: () => void) => {
    window.addEventListener("offline", callback);
    return () => window.removeEventListener("offline", callback);
  };

  const addOnlineListener = (callback: () => void) => {
    window.addEventListener("online", callback);
    return () => window.removeEventListener("online", callback);
  };

  return {
    registerServiceWorker,
    unregisterServiceWorker,
    clearCache,
    isOnline,
    addOfflineListener,
    addOnlineListener,
  };
}
