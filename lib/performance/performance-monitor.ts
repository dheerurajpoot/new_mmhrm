"use client";

import { useEffect, useState } from "react";

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure page load performance
  measurePageLoad() {
    if (typeof window === "undefined") return;

    window.addEventListener("load", () => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      
      this.metrics.set("domContentLoaded", navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
      this.metrics.set("loadComplete", navigation.loadEventEnd - navigation.loadEventStart);
      this.metrics.set("firstPaint", this.getFirstPaint());
      this.metrics.set("firstContentfulPaint", this.getFirstContentfulPaint());
      this.metrics.set("largestContentfulPaint", this.getLargestContentfulPaint());
      this.metrics.set("firstInputDelay", this.getFirstInputDelay());
      this.metrics.set("cumulativeLayoutShift", this.getCumulativeLayoutShift());
    });
  }

  // Measure API response times
  measureApiCall(url: string, startTime: number, endTime: number) {
    const duration = endTime - startTime;
    this.metrics.set(`api_${url}`, duration);
    
    // Log slow API calls
    if (duration > 1000) {
      console.warn(`Slow API call detected: ${url} took ${duration}ms`);
    }
  }

  // Measure component render times
  measureComponentRender(componentName: string, startTime: number, endTime: number) {
    const duration = endTime - startTime;
    this.metrics.set(`component_${componentName}`, duration);
    
    // Log slow renders
    if (duration > 100) {
      console.warn(`Slow component render: ${componentName} took ${duration}ms`);
    }
  }

  // Get performance metrics
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  // Get Core Web Vitals
  getCoreWebVitals() {
    return {
      FCP: this.getFirstContentfulPaint(),
      LCP: this.getLargestContentfulPaint(),
      FID: this.getFirstInputDelay(),
      CLS: this.getCumulativeLayoutShift(),
      TTFB: this.getTimeToFirstByte(),
    };
  }

  // Private methods for Core Web Vitals
  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType("paint");
    const fpEntry = paintEntries.find(entry => entry.name === "first-paint");
    return fpEntry ? fpEntry.startTime : 0;
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType("paint");
    const fcpEntry = paintEntries.find(entry => entry.name === "first-contentful-paint");
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  private getLargestContentfulPaint(): number {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      });
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    }) as any;
  }

  private getFirstInputDelay(): number {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstInput = entries[0];
        resolve(firstInput.processingStart - firstInput.startTime);
      });
      observer.observe({ entryTypes: ["first-input"] });
    }) as any;
  }

  private getCumulativeLayoutShift(): number {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
    });
    observer.observe({ entryTypes: ["layout-shift"] });
    return clsValue;
  }

  private getTimeToFirstByte(): number {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return navigation.responseStart - navigation.requestStart;
  }

  // Cleanup
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const [renderTime, setRenderTime] = useState<number>(0);
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setRenderTime(duration);
      monitor.measureComponentRender(componentName, startTime, endTime);
    };
  }, [componentName, monitor]);

  return { renderTime };
}

// Hook for measuring API calls
export function useApiPerformance() {
  const monitor = PerformanceMonitor.getInstance();

  const measureApiCall = async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const endTime = performance.now();
      monitor.measureApiCall(endpoint, startTime, endTime);
      return result;
    } catch (error) {
      const endTime = performance.now();
      monitor.measureApiCall(`${endpoint}_error`, startTime, endTime);
      throw error;
    }
  };

  return { measureApiCall };
}

// Hook for Core Web Vitals
export function useCoreWebVitals() {
  const [vitals, setVitals] = useState<any>(null);
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    const measureVitals = async () => {
      const coreVitals = await monitor.getCoreWebVitals();
      setVitals(coreVitals);
    };

    // Measure after page load
    if (document.readyState === "complete") {
      measureVitals();
    } else {
      window.addEventListener("load", measureVitals);
    }

    return () => {
      window.removeEventListener("load", measureVitals);
    };
  }, [monitor]);

  return vitals;
}

// Performance dashboard component
export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<any>({});
  const vitals = useCoreWebVitals();
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(monitor.getMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [monitor]);

  const getPerformanceGrade = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return { grade: "A", color: "text-green-600" };
    if (value <= thresholds.poor) return { grade: "B", color: "text-yellow-600" };
    return { grade: "C", color: "text-red-600" };
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Performance Metrics</h2>
      
      {/* Core Web Vitals */}
      {vitals && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{vitals.FCP?.toFixed(0)}ms</div>
              <div className="text-sm text-gray-600">First Contentful Paint</div>
              <div className={`text-sm font-semibold ${getPerformanceGrade(vitals.FCP, { good: 1800, poor: 3000 }).color}`}>
                {getPerformanceGrade(vitals.FCP, { good: 1800, poor: 3000 }).grade}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{vitals.LCP?.toFixed(0)}ms</div>
              <div className="text-sm text-gray-600">Largest Contentful Paint</div>
              <div className={`text-sm font-semibold ${getPerformanceGrade(vitals.LCP, { good: 2500, poor: 4000 }).color}`}>
                {getPerformanceGrade(vitals.LCP, { good: 2500, poor: 4000 }).grade}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{vitals.FID?.toFixed(0)}ms</div>
              <div className="text-sm text-gray-600">First Input Delay</div>
              <div className={`text-sm font-semibold ${getPerformanceGrade(vitals.FID, { good: 100, poor: 300 }).color}`}>
                {getPerformanceGrade(vitals.FID, { good: 100, poor: 300 }).grade}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{vitals.CLS?.toFixed(3)}</div>
              <div className="text-sm text-gray-600">Cumulative Layout Shift</div>
              <div className={`text-sm font-semibold ${getPerformanceGrade(vitals.CLS, { good: 0.1, poor: 0.25 }).color}`}>
                {getPerformanceGrade(vitals.CLS, { good: 0.1, poor: 0.25 }).grade}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{vitals.TTFB?.toFixed(0)}ms</div>
              <div className="text-sm text-gray-600">Time to First Byte</div>
              <div className={`text-sm font-semibold ${getPerformanceGrade(vitals.TTFB, { good: 800, poor: 1800 }).color}`}>
                {getPerformanceGrade(vitals.TTFB, { good: 800, poor: 1800 }).grade}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Performance */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">API Performance</h3>
        <div className="space-y-2">
          {Object.entries(metrics)
            .filter(([key]) => key.startsWith("api_"))
            .map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{key.replace("api_", "")}</span>
                <span className={`text-sm font-semibold ${(value as number) > 1000 ? "text-red-600" : "text-green-600"}`}>
                  {(value as number).toFixed(0)}ms
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Component Performance */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Component Performance</h3>
        <div className="space-y-2">
          {Object.entries(metrics)
            .filter(([key]) => key.startsWith("component_"))
            .map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{key.replace("component_", "")}</span>
                <span className={`text-sm font-semibold ${(value as number) > 100 ? "text-red-600" : "text-green-600"}`}>
                  {(value as number).toFixed(0)}ms
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// Performance optimization utilities
export const PerformanceUtils = {
  // Debounce function
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Memoize function
  memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },

  // Lazy load images
  lazyLoadImages() {
    if (typeof window === "undefined") return;

    const images = document.querySelectorAll("img[data-src]");
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || "";
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  },

  // Preload critical resources
  preloadCriticalResources(resources: string[]) {
    resources.forEach((resource) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = resource;
      link.as = resource.endsWith(".css") ? "style" : "script";
      document.head.appendChild(link);
    });
  },
};
