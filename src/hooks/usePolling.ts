import { useEffect, useRef } from 'react';

/**
 * Custom hook for polling a function at a specified interval
 * Automatically cleans up on unmount
 *
 * @param callback - Function to call on each poll
 * @param interval - Polling interval in milliseconds
 * @param enabled - Whether polling is enabled (default: true)
 */
export const usePolling = (
  callback: () => void,
  interval: number,
  enabled: boolean = true
) => {
  const savedCallback = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up polling interval
  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      savedCallback.current();
    };

    const id = setInterval(tick, interval);

    // Cleanup on unmount or when dependencies change
    return () => clearInterval(id);
  }, [interval, enabled]);
};
