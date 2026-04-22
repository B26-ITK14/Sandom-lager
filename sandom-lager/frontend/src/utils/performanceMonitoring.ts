/**
 * Web Vitals Performance Monitoring
 * Tracks Core Web Vitals (LCP, FID, CLS) for monitoring Lighthouse metrics
 * TODO: Remove for production
 */

/**
 * Initialize performance monitoring for Core Web Vitals
 */
export function initPerformanceMonitoring() {
  // Track Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        const lcp = lastEntry.renderTime || lastEntry.loadTime;
        
        if (lcp < 2500) {
          console.log('✅ LCP Good:', Math.round(lcp), 'ms');
        } else if (lcp < 4000) {
          console.warn('⚠️ LCP Needs Improvement:', Math.round(lcp), 'ms');
        } else {
          console.error('❌ LCP Poor:', Math.round(lcp), 'ms');
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP monitoring not supported');
    }

    try {
      // Track Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if ('hadRecentInput' in entry && !entry.hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        if (clsValue < 0.1) {
          console.log('✅ CLS Good:', clsValue.toFixed(3));
        } else if (clsValue < 0.25) {
          console.warn('⚠️ CLS Needs Improvement:', clsValue.toFixed(3));
        } else {
          console.error('❌ CLS Poor:', clsValue.toFixed(3));
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS monitoring not supported');
    }

    try {
      // Track First Input Delay (FID) / Interaction to Next Paint (INP)
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const fid = (entry as any).processingDuration;
          
          if (fid < 100) {
            console.log('✅ FID Good:', Math.round(fid), 'ms');
          } else if (fid < 300) {
            console.warn('⚠️ FID Needs Improvement:', Math.round(fid), 'ms');
          } else {
            console.error('❌ FID Poor:', Math.round(fid), 'ms');
          }
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID monitoring not supported');
    }
  }

  // Log navigation timing
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          console.log('📊 Navigation Timing:');
          console.log('  DNS:', Math.round(navigation.domainLookupEnd - navigation.domainLookupStart), 'ms');
          console.log('  TCP:', Math.round(navigation.connectEnd - navigation.connectStart), 'ms');
          console.log('  Request:', Math.round(navigation.responseStart - navigation.requestStart), 'ms');
          console.log('  Response:', Math.round(navigation.responseEnd - navigation.responseStart), 'ms');
          console.log('  DOM Interactive:', Math.round(navigation.domInteractive - navigation.fetchStart), 'ms');
          console.log('  DOM Complete:', Math.round(navigation.domComplete - navigation.fetchStart), 'ms');
        }
      }, 0);
    });
  }
}

/**
 * Hook to use performance monitoring in React components
 * Note: Performance monitoring is auto-initialized on page load
 */
export function usePerformanceMonitoring() {
  // Performance monitoring is already initialized globally
  // This hook can be called if you want to ensure it's active
  return initPerformanceMonitoring;
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPerformanceMonitoring);
  } else {
    initPerformanceMonitoring();
  }
}

export default initPerformanceMonitoring;
