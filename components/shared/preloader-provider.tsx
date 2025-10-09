"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WebsitePreloader } from "@/components/shared/website-preloader";

interface PreloaderProviderProps {
  children: React.ReactNode;
}

export function PreloaderProvider({ children }: PreloaderProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Show preloader immediately on first load, hide when page has finished loading
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hide = () => setIsLoading(false);

    if (document.readyState === "complete") {
      // Page already loaded
      hide();
    } else {
      // Ensure a minimum visibility to avoid instant flash
      const minVisibilityTimer = setTimeout(() => {
        // Will be turned off by 'load' as soon as it fires, otherwise by this timer
        hide();
      }, 1200);

      const onLoad = () => {
        clearTimeout(minVisibilityTimer);
        hide();
      };

      window.addEventListener("load", onLoad);
      return () => {
        clearTimeout(minVisibilityTimer);
        window.removeEventListener("load", onLoad);
      };
    }
  }, []);

  useEffect(() => {
    // Listen for route changes
    const handleRouteChange = () => {
      setIsLoading(true);
    };

    const handleRouteComplete = () => {
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    };

    // Listen for navigation events
    window.addEventListener('beforeunload', handleRouteChange);
    
    // For Next.js router events, we'll use a different approach
    const originalPush = router.push;
    const originalReplace = router.replace;
    
    router.push = (...args) => {
      setIsLoading(true);
      return originalPush.apply(router, args);
    };
    
    router.replace = (...args) => {
      setIsLoading(true);
      return originalReplace.apply(router, args);
    };

    return () => {
      window.removeEventListener('beforeunload', handleRouteChange);
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [router]);

  return (
    <>
      {isLoading && <WebsitePreloader />}
      {children}
    </>
  );
}
