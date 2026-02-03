/**
 * Lazy loading utilities for code splitting and performance optimization.
 * Provides debounce/throttle helpers for better performance.
 * 
 * Note: Lazy loading for components requires default exports.
 * Current components use named exports, so lazy loading is prepared but not active.
 * To enable: Change component exports to default exports or use React.lazy with workaround.
 */

/**
 * Debounce function to limit rate of function calls
 * Useful for filter inputs to avoid excessive re-renders
 * 
 * @param func - Function to debounce
 * @param wait - Milliseconds to wait before calling func
 * @returns Debounced function
 * 
 * @example
 * const debouncedSearch = debounce((query: string) => {
 *   fetchResults(query);
 * }, 300);
 */
export function debounce<A extends unknown[], R>(
  func: (...args: A) => R,
  wait: number
): (...args: A) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: A) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit rate of function calls
 * Ensures function is called at most once per specified time period
 * 
 * @param func - Function to throttle
 * @param limit - Milliseconds between calls
 * @returns Throttled function
 * 
 * @example
 * const throttledScroll = throttle(() => {
 *   updateScrollPosition();
 * }, 100);
 */
export function throttle<A extends unknown[], R>(
  func: (...args: A) => R,
  limit: number
): (...args: A) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: A) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
