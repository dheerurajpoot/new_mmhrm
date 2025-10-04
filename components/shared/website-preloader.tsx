"use client";

import { useState, useEffect } from "react";
import { useWebsiteSettings } from "@/hooks/use-website-settings";
import Image from "next/image";

export function WebsitePreloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const { settings } = useWebsiteSettings();

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Hide preloader after completion
          setTimeout(() => {
            setIsLoading(false);
          }, 300);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 150);

    // Ensure minimum loading time
    const minLoadTime = setTimeout(() => {
      if (progress < 100) {
        setProgress(100);
      }
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(minLoadTime);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
      {/* Simple Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            {/* Logo Container */}
            <div className="relative p-4 bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Logo */}
              <div className="relative z-10 flex items-center justify-center">
                {settings?.site_logo && settings.site_logo !== "https://mmhrm.vercel.app/uploads/logos/logo_1758676233879.PNG" ? (
                  <Image
                    src="https://mmhrm.vercel.app/uploads/logos/logo_1758676233879.PNG"
                    alt={settings?.site_name || "MMHRM"}
                    width={60}
                    height={60}
                    className="object-contain"
                    priority
                  />
                ) : (
                  <Image
                    src={settings?.site_logo || "https://mmhrm.vercel.app/uploads/logos/logo_1758676233879.PNG"}
                    alt={settings?.site_name || "MMHRM"}
                    width={60}
                    height={60}
                    className="object-contain"
                    priority
                  />
                )}
              </div>
            </div>
          </div>

          {/* Site Name */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              {settings?.site_name || "MMHRM"}
            </h1>
            <p className="text-gray-500 text-sm">
              {settings?.site_title || "Modern HR Management Platform"}
            </p>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-64">
          <div className="relative">
            {/* Background Bar */}
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              {/* Progress Bar */}
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>

            {/* Progress Percentage */}
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-500 text-xs">Loading...</span>
              <span className="text-gray-700 text-sm font-medium">
                {Math.round(Math.min(progress, 100))}%
              </span>
            </div>
          </div>
        </div>

        {/* Simple Loading Text */}
        <div className="text-center">
          <p className="text-gray-400 text-xs">
            Preparing your workspace...
          </p>
        </div>
      </div>
    </div>
  );
}