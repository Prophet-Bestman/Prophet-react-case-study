import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'recentlyAccessedIssues';
const MAX_RECENT_ITEMS = 5;

/**
 * Custom hook to track and persist recently accessed issues
 * Stores last 5 accessed issue IDs in localStorage
 */
export const useRecentlyAccessed = () => {
  const [recentIssueIds, setRecentIssueIds] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentIssueIds(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load recently accessed issues:', err);
    }
  }, []);

  // Add an issue to the recently accessed list
  const addRecentIssue = useCallback((issueId: string) => {
    setRecentIssueIds((prev) => {
      // Remove if already exists to avoid duplicates
      const filtered = prev.filter((id) => id !== issueId);

      // Add to beginning and limit to MAX_RECENT_ITEMS
      const updated = [issueId, ...filtered].slice(0, MAX_RECENT_ITEMS);

      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save recently accessed issues:', err);
      }

      return updated;
    });
  }, []);

  // Clear all recently accessed issues
  const clearRecentIssues = useCallback(() => {
    setRecentIssueIds([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear recently accessed issues:', err);
    }
  }, []);

  return {
    recentIssueIds,
    addRecentIssue,
    clearRecentIssues,
  };
};
