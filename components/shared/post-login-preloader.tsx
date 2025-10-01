"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/user-context";
import { WebsitePreloader } from "@/components/shared/website-preloader";

interface PostLoginPreloaderProps {
  children: React.ReactNode;
}

export function PostLoginPreloader({ children }: PostLoginPreloaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasShownPostLoginPreloader, setHasShownPostLoginPreloader] = useState(false);
  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    // Show preloader after successful login (when user becomes available)
    if (!userLoading && user && !hasShownPostLoginPreloader) {
      setIsLoading(true);
      setHasShownPostLoginPreloader(true);
      
      // Hide preloader after a short delay
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user, userLoading, hasShownPostLoginPreloader]);

  return (
    <>
      {isLoading && <WebsitePreloader />}
      {children}
    </>
  );
}
