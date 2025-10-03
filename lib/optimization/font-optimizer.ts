// Font optimization utilities
export const getOptimizedFontLinks = () => {
  return `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'" />
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap" /></noscript>
  `;
};

// Critical CSS extraction
export const getCriticalCSS = () => {
  return `
    /* Critical CSS for above-the-fold content */
    * {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: #f8fafc;
    }
    
    .font-primary {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    /* Loading skeleton styles */
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    /* Critical layout styles */
    .min-h-screen { min-height: 100vh; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .w-full { width: 100%; }
    .h-full { height: 100%; }
    
    /* Critical dashboard styles */
    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .dashboard-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      padding: 24px;
    }
  `;
};

// Resource hints for better performance
export const getResourceHints = () => {
  return `
    <!-- DNS prefetch for external domains -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com" />
    <link rel="dns-prefetch" href="//fonts.gstatic.com" />
    
    <!-- Preconnect to critical origins -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    
    <!-- Preload critical resources -->
    <link rel="preload" href="/_next/static/css/app/layout.css" as="style" />
    <link rel="preload" href="/_next/static/chunks/webpack.js" as="script" />
    
    <!-- Prefetch next likely resources -->
    <link rel="prefetch" href="/api/dashboard/sections" />
    <link rel="prefetch" href="/api/employees" />
  `;
};

// Progressive enhancement utilities
export const getProgressiveEnhancement = () => {
  return `
    <script>
      // Progressive enhancement script
      (function() {
        // Add loading class to body
        document.documentElement.classList.add('loading');
        
        // Remove loading class when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() {
            document.documentElement.classList.remove('loading');
            document.documentElement.classList.add('loaded');
          });
        } else {
          document.documentElement.classList.remove('loading');
          document.documentElement.classList.add('loaded');
        }
        
        // Preload critical images
        const criticalImages = [
          '/placeholder-logo.png',
          '/placeholder-user.jpg'
        ];
        
        criticalImages.forEach(src => {
          const img = new Image();
          img.src = src;
        });
      })();
    </script>
  `;
};
