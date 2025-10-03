"use client";

import { useEffect, useState } from "react";

// Critical CSS component for above-the-fold content
export function CriticalCSS() {
  useEffect(() => {
    // Inline critical CSS
    const criticalCSS = `
      /* Critical CSS for LCP optimization */
      * {
        box-sizing: border-box;
      }
      
      body {
        margin: 0;
        font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background-color: #f8fafc;
        line-height: 1.6;
      }
      
      .font-primary {
        font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      /* Loading states */
      .loading {
        opacity: 0.7;
      }
      
      .loaded {
        opacity: 1;
        transition: opacity 0.3s ease-in-out;
      }
      
      /* Skeleton loading */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 4px;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Critical layout */
      .min-h-screen { min-height: 100vh; }
      .flex { display: flex; }
      .items-center { align-items: center; }
      .justify-center { justify-content: center; }
      .w-full { width: 100%; }
      .h-full { height: 100%; }
      .relative { position: relative; }
      .absolute { position: absolute; }
      
      /* Dashboard critical styles */
      .dashboard-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        flex-direction: column;
      }
      
      .dashboard-header {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        padding: 1rem 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .dashboard-content {
        flex: 1;
        padding: 2rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
      }
      
      .dashboard-card {
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        transition: transform 0.2s ease-in-out;
      }
      
      .dashboard-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
      }
      
      /* Critical typography */
      h1, h2, h3, h4, h5, h6 {
        margin: 0;
        font-weight: 600;
        line-height: 1.2;
      }
      
      h1 { font-size: 2.5rem; }
      h2 { font-size: 2rem; }
      h3 { font-size: 1.5rem; }
      h4 { font-size: 1.25rem; }
      
      /* Critical button styles */
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s ease-in-out;
        border: none;
        cursor: pointer;
      }
      
      .btn-primary {
        background: #3b82f6;
        color: white;
      }
      
      .btn-primary:hover {
        background: #2563eb;
      }
      
      /* Critical form styles */
      .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.2s ease-in-out;
      }
      
      .form-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      /* Critical responsive design */
      @media (max-width: 768px) {
        .dashboard-header {
          padding: 1rem;
        }
        
        .dashboard-content {
          padding: 1rem;
          grid-template-columns: 1fr;
        }
        
        h1 { font-size: 2rem; }
        h2 { font-size: 1.5rem; }
      }
    `;

    // Create and inject critical CSS
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);

    // Load non-critical CSS asynchronously
    const loadNonCriticalCSS = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/styles/non-critical.css';
      link.media = 'print';
      link.onload = function() {
        this.media = 'all';
      };
      document.head.appendChild(link);
    };

    // Load non-critical CSS after initial render
    setTimeout(loadNonCriticalCSS, 100);

    return () => {
      // Cleanup
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return null;
}

// Skeleton loading component for better perceived performance
export function SkeletonLoader({ 
  width = "100%", 
  height = "20px", 
  className = "" 
}: { 
  width?: string; 
  height?: string; 
  className?: string; 
}) {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ width, height }}
      aria-label="Loading..."
    />
  );
}

// Progressive loading component
export function ProgressiveLoader({ 
  children, 
  fallback, 
  delay = 100 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
  delay?: number; 
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!isLoaded) {
    return fallback || <SkeletonLoader width="100%" height="200px" />;
  }

  return <>{children}</>;
}

// LCP optimization hook
export function useLCPOptimization() {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      const criticalResources = [
        '/api/dashboard/sections',
        '/api/employees',
        '/placeholder-logo.png',
        '/placeholder-user.jpg'
      ];

      criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource;
        document.head.appendChild(link);
      });
    };

    // Preload after initial render
    setTimeout(preloadCriticalResources, 0);

    // Optimize images
    const optimizeImages = () => {
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });

      images.forEach((img) => imageObserver.observe(img));
    };

    // Optimize images after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizeImages);
    } else {
      optimizeImages();
    }

    // Reduce main thread work
    const deferNonCriticalWork = () => {
      // Defer non-critical JavaScript execution
      requestIdleCallback(() => {
        // Run non-critical tasks here
        console.log('Running non-critical tasks');
      });
    };

    setTimeout(deferNonCriticalWork, 1000);

  }, []);
}

// Resource hints component
export function ResourceHints() {
  useEffect(() => {
    // Add resource hints dynamically
    const hints = [
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'preload', href: '/_next/static/css/app/layout.css', as: 'style' },
      { rel: 'prefetch', href: '/api/dashboard/sections' },
      { rel: 'prefetch', href: '/api/employees' }
    ];

    hints.forEach(hint => {
      const link = document.createElement('link');
      Object.assign(link, hint);
      document.head.appendChild(link);
    });
  }, []);

  return null;
}
