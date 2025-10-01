"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WebsitePreloader } from "@/components/shared/website-preloader";

interface PreloaderProviderProps {
  children: React.ReactNode;
}

export function PreloaderProvider({ children }: PreloaderProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
