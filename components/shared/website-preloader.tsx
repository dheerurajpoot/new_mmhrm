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
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    // Ensure minimum loading time
    const minLoadTime = setTimeout(() => {
      if (progress < 100) {
        setProgress(100);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(minLoadTime);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {/* Logo Container with Glow Effect */}
            <div className="relative p-6 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>

              {/* Logo */}
              <div className="relative z-10 flex items-center justify-center">
                {settings?.site_logo && settings.site_logo !== "/placeholder-logo.png" ? (
                  <Image
                    src="/placeholder-logo.png"
                    alt={settings?.site_name || "MMHRM"}
                    width={80}
                    height={80}
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {settings?.site_name?.charAt(0) || "M"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Rotating Ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-3xl animate-spin"></div>
            <div className="absolute inset-2 border-2 border-transparent border-b-green-500 border-l-pink-500 rounded-2xl animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
          </div>

          {/* Site Name */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {settings?.site_name || "MMHRM"}
            </h1>
            <p className="text-white/80 text-sm font-medium">
              {settings?.site_title || "Modern HR Management Platform"}
            </p>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-80 max-w-sm">
          <div className="relative">
            {/* Background Bar */}
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              {/* Progress Bar */}
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>

            {/* Progress Percentage */}
            <div className="flex justify-between items-center mt-3">
              <span className="text-white/60 text-xs font-medium">Loading...</span>
              <span className="text-white text-sm font-bold">
                {Math.round(Math.min(progress, 100))}%
              </span>
            </div>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-white/70 text-xs font-medium animate-pulse">
            Preparing your workspace...
          </p>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 text-white/50 text-xs">
          <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse"></div>
          <span>Powered by Modern Technology</span>
          <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}