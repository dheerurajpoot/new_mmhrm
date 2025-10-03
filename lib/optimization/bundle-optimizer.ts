import React, { useState, useEffect, useCallback } from "react";

// JavaScript bundle optimization utilities
export class BundleOptimizer {
  // Defer non-critical JavaScript execution
  static deferNonCriticalWork(callback: () => void, delay: number = 0) {
    if (typeof window === 'undefined') return;

    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout: delay });
    } else {
      setTimeout(callback, delay);
    }
  }

  // Optimize component rendering
  static optimizeRendering(componentName: string, renderFn: () => void) {
    const startTime = performance.now();
    
    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
      renderFn();
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Log slow renders
      if (renderTime > 16) { // 60fps threshold
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    });
  }

  // Batch DOM updates
  static batchDOMUpdates(updates: (() => void)[]) {
    if (typeof window === 'undefined') return;

    // Use requestAnimationFrame to batch updates
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  }

  // Optimize event listeners
  static optimizeEventListeners(element: HTMLElement, events: Record<string, EventListener>) {
    Object.entries(events).forEach(([event, handler]) => {
      // Use passive listeners for better performance
      const options = { passive: true };
      element.addEventListener(event, handler, options);
    });
  }

  // Memory optimization
  static optimizeMemory() {
    if (typeof window === 'undefined') return;

    // Clear unused caches periodically
    setInterval(() => {
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.open(cacheName).then(cache => {
              cache.keys().then(requests => {
                // Remove old entries
                requests.forEach(request => {
                  const url = new URL(request.url);
                  const age = Date.now() - parseInt(url.searchParams.get('timestamp') || '0');
                  if (age > 24 * 60 * 60 * 1000) { // 24 hours
                    cache.delete(request);
                  }
                });
              });
            });
          });
        });
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }
}

// React optimization hooks
export function useOptimizedRender(componentName: string) {
  const [isRendering, setIsRendering] = useState(false);

  const optimizedRender = useCallback((renderFn: () => void) => {
    if (isRendering) return;

    setIsRendering(true);
    BundleOptimizer.optimizeRendering(componentName, () => {
      renderFn();
      setIsRendering(false);
    });
  }, [componentName, isRendering]);

  return { optimizedRender, isRendering };
}

// Debounced state hook for better performance
export function useDebouncedState<T>(initialValue: T, delay: number = 300) {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue, setValue] as const;
}

// Memoized component wrapper
export function withOptimization<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    memo?: boolean;
    lazy?: boolean;
    preload?: boolean;
  } = {}
) {
  const { memo = true, lazy = false, preload = false } = options;

  let OptimizedComponent = Component;

  // Apply memoization
  if (memo) {
    OptimizedComponent = React.memo(OptimizedComponent) as React.ComponentType<P>;
  }

  // Apply lazy loading
  if (lazy) {
    OptimizedComponent = React.lazy(() => Promise.resolve({ default: OptimizedComponent })) as React.ComponentType<P>;
  }

  // Apply preloading
  if (preload) {
    const preloadComponent = () => {
      if (typeof window !== 'undefined') {
        // Preload component
        Promise.resolve({ default: Component });
      }
    };

    // Preload on idle
    BundleOptimizer.deferNonCriticalWork(preloadComponent);
  }

  return OptimizedComponent;
}

// Performance monitoring for components
export function usePerformanceMonitor(componentName: string) {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
  });

  const measureRender = useCallback((renderFn: () => void) => {
    const startTime = performance.now();
    
    renderFn();
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    setMetrics(prev => ({
      renderCount: prev.renderCount + 1,
      averageRenderTime: (prev.averageRenderTime + renderTime) / 2,
      lastRenderTime: renderTime,
    }));

    // Log performance issues
    if (renderTime > 100) {
      console.warn(`Performance issue in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  }, [componentName]);

  return { metrics, measureRender };
}

// Bundle splitting utilities
export const BundleSplitter = {
  // Split by route (using app directory structure)
  splitByRoute: (route: string) => {
    return React.lazy(() => import(`@/app/${route}/page`));
  },

  // Split by feature
  splitByFeature: (feature: string) => {
    return React.lazy(() => import(`@/components/${feature}`));
  },

  // Split by component
  splitByComponent: (component: string) => {
    return React.lazy(() => import(`@/components/${component}`));
  },

  // Split by admin components
  splitByAdminComponent: (component: string) => {
    return React.lazy(() => import(`@/components/admin/${component}`));
  },

  // Split by employee components
  splitByEmployeeComponent: (component: string) => {
    return React.lazy(() => import(`@/components/employee/${component}`));
  },

  // Split by HR components
  splitByHRComponent: (component: string) => {
    return React.lazy(() => import(`@/components/hr/${component}`));
  },
};

// Critical path optimization
export class CriticalPathOptimizer {
  private static criticalResources: Set<string> = new Set();

  // Mark resource as critical
  static markCritical(resource: string) {
    this.criticalResources.add(resource);
  }

  // Preload critical resources
  static preloadCritical() {
    if (typeof window === 'undefined') return;

    this.criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      // Determine resource type
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.match(/\.(jpg|jpeg|png|gif|webp|avif)$/)) {
        link.as = 'image';
      } else if (resource.endsWith('.woff2')) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      }

      document.head.appendChild(link);
    });
  }

  // Optimize critical rendering path
  static optimizeCriticalPath() {
    if (typeof window === 'undefined') return;

    // Preload critical resources
    this.preloadCritical();

    // Defer non-critical work
    BundleOptimizer.deferNonCriticalWork(() => {
      // Load non-critical resources
      this.loadNonCriticalResources();
    });

    // Optimize memory usage
    BundleOptimizer.optimizeMemory();
  }

  // Load non-critical resources
  private static loadNonCriticalResources() {
    const nonCriticalResources = [
      '/scripts/analytics.js',
      '/scripts/chat-widget.js',
      '/styles/non-critical.css',
    ];

    nonCriticalResources.forEach(resource => {
      if (resource.endsWith('.js')) {
        const script = document.createElement('script');
        script.src = resource;
        script.async = true;
        document.head.appendChild(script);
      } else if (resource.endsWith('.css')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = resource;
        link.media = 'print';
        link.onload = function() {
          this.media = 'all';
        };
        document.head.appendChild(link);
      }
    });
  }
}

// Initialize optimizations
export function initializeOptimizations() {
  if (typeof window === 'undefined') return;

  // Mark critical resources
  CriticalPathOptimizer.markCritical('/api/dashboard/sections');
  CriticalPathOptimizer.markCritical('/api/employees');
  CriticalPathOptimizer.markCritical('/placeholder-logo.png');
  CriticalPathOptimizer.markCritical('/placeholder-user.jpg');

  // Optimize critical path
  CriticalPathOptimizer.optimizeCriticalPath();

  // Initialize performance monitoring
  BundleOptimizer.optimizeMemory();
}
