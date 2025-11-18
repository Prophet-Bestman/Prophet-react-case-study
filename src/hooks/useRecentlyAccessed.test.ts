import { renderHook, act } from '@testing-library/react';
import { useRecentlyAccessed } from './useRecentlyAccessed';

const STORAGE_KEY = 'recentlyAccessedIssues';
const MAX_RECENT_ITEMS = 5;

describe('useRecentlyAccessed', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should start with empty array when localStorage is empty', () => {
      const { result } = renderHook(() => useRecentlyAccessed());

      expect(result.current.recentIssueIds).toEqual([]);
    });

    it('should load recent issues from localStorage on mount', () => {
      const storedIds = ['issue-1', 'issue-2', 'issue-3'];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedIds));

      const { result } = renderHook(() => useRecentlyAccessed());

      expect(result.current.recentIssueIds).toEqual(storedIds);
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid-json{');

      const { result } = renderHook(() => useRecentlyAccessed());

      expect(result.current.recentIssueIds).toEqual([]);
    });

    it('should handle non-array data in localStorage', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ invalid: 'data' }));

      const { result } = renderHook(() => useRecentlyAccessed());

      expect(result.current.recentIssueIds).toEqual([]);
    });

    it('should handle localStorage read errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useRecentlyAccessed());

      expect(result.current.recentIssueIds).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      spy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('addRecentIssue', () => {
    it('should add a new issue to the front of the list', () => {
      const { result } = renderHook(() => useRecentlyAccessed());

      act(() => {
        result.current.addRecentIssue('issue-1');
      });

      expect(result.current.recentIssueIds).toEqual(['issue-1']);
    });

    it('should add multiple issues in order', () => {
      const { result } = renderHook(() => useRecentlyAccessed());

      act(() => {
        result.current.addRecentIssue('issue-1');
      });

      act(() => {
        result.current.addRecentIssue('issue-2');
      });

      act(() => {
        result.current.addRecentIssue('issue-3');
      });

      expect(result.current.recentIssueIds).toEqual(['issue-3', 'issue-2', 'issue-1']);
    });

    it('should move existing issue to front when added again', () => {
      const { result } = renderHook(() => useRecentlyAccessed());

      act(() => {
        result.current.addRecentIssue('issue-1');
        result.current.addRecentIssue('issue-2');
        result.current.addRecentIssue('issue-3');
      });

      // Add issue-1 again (it should move to front)
      act(() => {
        result.current.addRecentIssue('issue-1');
      });

      expect(result.current.recentIssueIds).toEqual(['issue-1', 'issue-3', 'issue-2']);
    });

    it('should not create duplicates', () => {
      const { result } = renderHook(() => useRecentlyAccessed());

      act(() => {
        result.current.addRecentIssue('issue-1');
        result.current.addRecentIssue('issue-1');
        result.current.addRecentIssue('issue-1');
      });

      expect(result.current.recentIssueIds).toEqual(['issue-1']);
      expect(result.current.recentIssueIds.length).toBe(1);
    });

    it('should limit to 5 items maximum', () => {
      const { result } = renderHook(() => useRecentlyAccessed());

      act(() => {
        result.current.addRecentIssue('issue-1');
        result.current.addRecentIssue('issue-2');
        result.current.addRecentIssue('issue-3');
        result.current.addRecentIssue('issue-4');
        result.current.addRecentIssue('issue-5');
      });

      expect(result.current.recentIssueIds).toHaveLength(MAX_RECENT_ITEMS);

      // Add one more, should drop the oldest
      act(() => {
        result.current.addRecentIssue('issue-6');
      });

      expect(result.current.recentIssueIds).toHaveLength(MAX_RECENT_ITEMS);
      expect(result.current.recentIssueIds).toEqual([
        'issue-6',
        'issue-5',
        'issue-4',
        'issue-3',
        'issue-2',
      ]);
      expect(result.current.recentIssueIds).not.toContain('issue-1'); // Oldest dropped
    });

    it('should drop oldest item when limit exceeded', () => {
      const { result } = renderHook(() => useRecentlyAccessed());

      // Fill to capacity
      act(() => {
        for (let i = 1; i <= 5; i++) {
          result.current.addRecentIssue(`issue-${i}`);
        }
      });

      expect(result.current.recentIssueIds[0]).toBe('issue-5');
      expect(result.current.recentIssueIds[4]).toBe('issue-1');

      // Add new item, should drop issue-1
      act(() => {
        result.current.addRecentIssue('issue-6');
      });

      expect(result.current.recentIssueIds).not.toContain('issue-1');
      expect(result.current.recentIssueIds[0]).toBe('issue-6');
    });

    it('should handle adding same issue when at capacity', () => {
      const { result } = renderHook(() => useRecentlyAccessed());

      act(() => {
        result.current.addRecentIssue('issue-1');
        result.current.addRecentIssue('issue-2');
        result.current.addRecentIssue('issue-3');
        result.current.addRecentIssue('issue-4');
        result.current.addRecentIssue('issue-5');
      });

      // Re-add issue-3, should move to front without exceeding limit
      act(() => {
        result.current.addRecentIssue('issue-3');
      });

      expect(result.current.recentIssueIds).toHaveLength(5);
      expect(result.current.recentIssueIds[0]).toBe('issue-3');
      expect(result.current.recentIssueIds).toContain('issue-1');
      expect(result.current.recentIssueIds).toContain('issue-2');
      expect(result.current.recentIssueIds).toContain('issue-4');
      expect(result.current.recentIssueIds).toContain('issue-5');
    });
  });

  describe('clearRecentIssues', () => {
    it('should clear all recent issues', () => {
      const { result } = renderHook(() => useRecentlyAccessed());

      act(() => {
        result.current.addRecentIssue('issue-1');
        result.current.addRecentIssue('issue-2');
        result.current.addRecentIssue('issue-3');
      });

      expect(result.current.recentIssueIds).toHaveLength(3);

      act(() => {
        result.current.clearRecentIssues();
      });

      expect(result.current.recentIssueIds).toEqual([]);
    });

    it('should clear localStorage', () => {
      const { result } = renderHook(() => useRecentlyAccessed());

      act(() => {
        result.current.addRecentIssue('issue-1');
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();

      act(() => {
        result.current.clearRecentIssues();
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should handle clearing when already empty', () => {
      const { result } = renderHook(() => useRecentlyAccessed());

      act(() => {
        result.current.clearRecentIssues();
      });

      expect(result.current.recentIssueIds).toEqual([]);
    });

    it('should handle localStorage removal errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const spy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useRecentlyAccessed());

      act(() => {
        result.current.clearRecentIssues();
      });

      expect(result.current.recentIssueIds).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      spy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('localStorage persistence', () => {
    it('should persist to localStorage when adding issue', () => {
      const { result } = renderHook(() => useRecentlyAccessed());

      act(() => {
        result.current.addRecentIssue('issue-1');
      });

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual(['issue-1']);
    });

    it('should update localStorage on each add', () => {
      const { result } = renderHook(() => useRecentlyAccessed());

      act(() => {
        result.current.addRecentIssue('issue-1');
      });

      let stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toEqual(['issue-1']);

      act(() => {
        result.current.addRecentIssue('issue-2');
      });

      stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toEqual(['issue-2', 'issue-1']);
    });

    it('should restore state across hook re-renders', () => {
      const { result, rerender } = renderHook(() => useRecentlyAccessed());

      act(() => {
        result.current.addRecentIssue('issue-1');
      });

      rerender();

      expect(result.current.recentIssueIds).toEqual(['issue-1']);
    });

    it('should share state between different hook instances', () => {
      const { result: firstHook } = renderHook(() => useRecentlyAccessed());

      act(() => {
        firstHook.current.addRecentIssue('issue-1');
        firstHook.current.addRecentIssue('issue-2');
      });

      const { result: secondHook } = renderHook(() => useRecentlyAccessed());

      expect(secondHook.current.recentIssueIds).toEqual(['issue-2', 'issue-1']);
    });

    it('should handle localStorage write errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useRecentlyAccessed());

      act(() => {
        result.current.addRecentIssue('issue-1');
      });

      // State should still update even if localStorage fails
      expect(result.current.recentIssueIds).toEqual(['issue-1']);
      expect(consoleSpy).toHaveBeenCalled();

      spy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string issue ID', () => {
      const { result } = renderHook(() => useRecentlyAccessed());

      act(() => {
        result.current.addRecentIssue('');
      });

      expect(result.current.recentIssueIds).toEqual(['']);
    });

    it('should handle special characters in issue ID', () => {
      const { result } = renderHook(() => useRecentlyAccessed());
      const specialId = 'issue-!@#$%^&*()';

      act(() => {
        result.current.addRecentIssue(specialId);
      });

      expect(result.current.recentIssueIds).toEqual([specialId]);
    });

    it('should handle very long issue IDs', () => {
      const { result } = renderHook(() => useRecentlyAccessed());
      const longId = 'issue-' + 'A'.repeat(1000);

      act(() => {
        result.current.addRecentIssue(longId);
      });

      expect(result.current.recentIssueIds).toEqual([longId]);
    });

    it('should handle numeric-like string IDs', () => {
      const { result } = renderHook(() => useRecentlyAccessed());

      act(() => {
        result.current.addRecentIssue('123');
        result.current.addRecentIssue('456');
      });

      expect(result.current.recentIssueIds).toEqual(['456', '123']);
    });
  });

  describe('callback stability', () => {
    it('should maintain callback reference across re-renders', () => {
      const { result, rerender } = renderHook(() => useRecentlyAccessed());

      const firstAddRef = result.current.addRecentIssue;
      const firstClearRef = result.current.clearRecentIssues;

      rerender();

      expect(result.current.addRecentIssue).toBe(firstAddRef);
      expect(result.current.clearRecentIssues).toBe(firstClearRef);
    });
  });
});
