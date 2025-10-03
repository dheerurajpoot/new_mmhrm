"use client";

import { useState, useEffect, useCallback } from "react";
import { getCurrentUser } from "@/lib/auth/client";

interface SectionData {
  [key: string]: any;
}

interface UseSectionDataOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
}

export function useSectionData(
  section: string,
  options: UseSectionDataOptions = {}
) {
  const { enabled = true, refetchOnMount = true } = options;
  const [data, setData] = useState<SectionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchSectionData = useCallback(async () => {
    if (!enabled || !section) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/dashboard/sections?section=${section}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${section} data: ${response.statusText}`);
      }

      const sectionData = await response.json();
      setData(sectionData);
      setLastFetched(new Date());
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      console.error(`Error fetching ${section} data:`, error);
    } finally {
      setLoading(false);
    }
  }, [section, enabled]);

  const refetch = useCallback(() => {
    fetchSectionData();
  }, [fetchSectionData]);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
    setLastFetched(null);
  }, []);

  useEffect(() => {
    if (refetchOnMount && enabled) {
      fetchSectionData();
    }
  }, [fetchSectionData, refetchOnMount, enabled]);

  return {
    data,
    loading,
    error,
    refetch,
    clearData,
    lastFetched,
    isStale: lastFetched ? Date.now() - lastFetched.getTime() > 300000 : true // 5 minutes
  };
}

// Hook for multiple sections
export function useMultipleSections(sections: string[]) {
  const [sectionData, setSectionData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, Error | null>>({});

  const fetchSection = useCallback(async (section: string) => {
    try {
      setLoading(prev => ({ ...prev, [section]: true }));
      setErrors(prev => ({ ...prev, [section]: null }));

      const response = await fetch(`/api/dashboard/sections?section=${section}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${section} data: ${response.statusText}`);
      }

      const data = await response.json();
      setSectionData(prev => ({ ...prev, [section]: data }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setErrors(prev => ({ ...prev, [section]: error }));
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }));
    }
  }, []);

  const fetchAllSections = useCallback(async () => {
    await Promise.all(sections.map(section => fetchSection(section)));
  }, [sections, fetchSection]);

  const refetchSection = useCallback((section: string) => {
    fetchSection(section);
  }, [fetchSection]);

  const refetchAllSections = useCallback(() => {
    fetchAllSections();
  }, [fetchAllSections]);

  useEffect(() => {
    // Initialize loading states
    const initialLoading: Record<string, boolean> = {};
    const initialErrors: Record<string, Error | null> = {};
    
    sections.forEach(section => {
      initialLoading[section] = false;
      initialErrors[section] = null;
    });
    
    setLoading(initialLoading);
    setErrors(initialErrors);
  }, [sections]);

  return {
    sectionData,
    loading,
    errors,
    fetchSection,
    fetchAllSections,
    refetchSection,
    refetchAllSections,
    isLoading: Object.values(loading).some(Boolean),
    hasErrors: Object.values(errors).some(Boolean)
  };
}

// Hook for dashboard overview (combines multiple sections)
export function useDashboardOverview(role: string) {
  const [overviewData, setOverviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/dashboard/sections?section=overview`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch overview data: ${response.statusText}`);
      }

      const data = await response.json();
      setOverviewData(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      console.error("Error fetching overview data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return {
    overviewData,
    loading,
    error,
    refetch: fetchOverview
  };
}

// Cache management hook
export function useSectionCache() {
  const [cache, setCache] = useState<Map<string, { data: any; timestamp: number }>>(new Map());

  const getCachedData = useCallback((key: string, maxAge: number = 300000) => { // 5 minutes default
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data;
    }
    return null;
  }, [cache]);

  const setCachedData = useCallback((key: string, data: any) => {
    setCache(prev => new Map(prev).set(key, { data, timestamp: Date.now() }));
  }, []);

  const clearCache = useCallback((key?: string) => {
    if (key) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
    } else {
      setCache(new Map());
    }
  }, []);

  const clearExpiredCache = useCallback((maxAge: number = 300000) => {
    const now = Date.now();
    setCache(prev => {
      const newCache = new Map();
      prev.forEach((value, key) => {
        if (now - value.timestamp < maxAge) {
          newCache.set(key, value);
        }
      });
      return newCache;
    });
  }, []);

  return {
    getCachedData,
    setCachedData,
    clearCache,
    clearExpiredCache,
    cacheSize: cache.size
  };
}
