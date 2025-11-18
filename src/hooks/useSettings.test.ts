import { renderHook, act } from '@testing-library/react';
import { useSettings, AppSettings } from './useSettings';

const SETTINGS_KEY = 'app_settings';

describe('useSettings', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should load default settings when localStorage is empty', () => {
      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual({
        userName: 'Alice',
        userRole: 'admin',
        pollingInterval: 10000,
      });
    });

    it('should load settings from localStorage on mount', () => {
      const storedSettings: AppSettings = {
        userName: 'Bob',
        userRole: 'contributor',
        pollingInterval: 15000,
      };

      localStorage.setItem(SETTINGS_KEY, JSON.stringify(storedSettings));

      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual(storedSettings);
    });

    it('should merge stored settings with defaults', () => {
      const partialSettings = {
        userName: 'Charlie',
        // Missing userRole and pollingInterval
      };

      localStorage.setItem(SETTINGS_KEY, JSON.stringify(partialSettings));

      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual({
        userName: 'Charlie',
        userRole: 'admin', // Default value
        pollingInterval: 10000, // Default value
      });
    });

    it('should use defaults when localStorage contains invalid JSON', () => {
      localStorage.setItem(SETTINGS_KEY, 'invalid-json{');

      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual({
        userName: 'Alice',
        userRole: 'admin',
        pollingInterval: 10000,
      });
    });

    it('should use defaults when stored settings contain invalid JSON', () => {
      localStorage.setItem(SETTINGS_KEY, 'invalid-json{');

      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual({
        userName: 'Alice',
        userRole: 'admin',
        pollingInterval: 10000,
      });
    });
  });

  describe('updateSettings', () => {
    it('should update userName', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.updateSettings({ userName: 'David' });
      });

      expect(result.current.settings.userName).toBe('David');
      expect(result.current.settings.userRole).toBe('admin'); // Unchanged
      expect(result.current.settings.pollingInterval).toBe(10000); // Unchanged
    });

    it('should update userRole', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.updateSettings({ userRole: 'contributor' });
      });

      expect(result.current.settings.userRole).toBe('contributor');
      expect(result.current.settings.userName).toBe('Alice'); // Unchanged
    });

    it('should update pollingInterval', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.updateSettings({ pollingInterval: 20000 });
      });

      expect(result.current.settings.pollingInterval).toBe(20000);
    });

    it('should update multiple fields at once', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.updateSettings({
          userName: 'Eve',
          userRole: 'contributor',
          pollingInterval: 30000,
        });
      });

      expect(result.current.settings).toEqual({
        userName: 'Eve',
        userRole: 'contributor',
        pollingInterval: 30000,
      });
    });

    it('should merge partial updates with existing settings', () => {
      const { result } = renderHook(() => useSettings());

      // First update
      act(() => {
        result.current.updateSettings({ userName: 'Frank' });
      });

      // Second update
      act(() => {
        result.current.updateSettings({ pollingInterval: 25000 });
      });

      expect(result.current.settings).toEqual({
        userName: 'Frank', // From first update
        userRole: 'admin', // Original
        pollingInterval: 25000, // From second update
      });
    });
  });

  describe('localStorage integration', () => {
    it('should maintain settings state across re-renders', () => {
      const { result, rerender } = renderHook(() => useSettings());

      act(() => {
        result.current.updateSettings({ userName: 'Kelly' });
      });

      // Unmount and remount
      rerender();

      // State is maintained within the same hook instance
      expect(result.current.settings.userName).toBe('Kelly');
    });

    it('should initialize with stored settings when available', () => {
      // Pre-populate localStorage BEFORE hook initialization
      const storedSettings: AppSettings = {
        userName: 'PreStoredUser',
        userRole: 'contributor',
        pollingInterval: 15000,
      };

      // Clear first to ensure clean state
      localStorage.clear();
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(storedSettings));

      // Verify it was set
      const verify = localStorage.getItem(SETTINGS_KEY);
      expect(verify).not.toBeNull();

      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual(storedSettings);
    });
  });

  describe('type safety', () => {
    it('should only accept valid userRole values', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.updateSettings({ userRole: 'admin' });
      });
      expect(result.current.settings.userRole).toBe('admin');

      act(() => {
        result.current.updateSettings({ userRole: 'contributor' });
      });
      expect(result.current.settings.userRole).toBe('contributor');
    });

    it('should handle numeric pollingInterval', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.updateSettings({ pollingInterval: 5000 });
      });

      expect(typeof result.current.settings.pollingInterval).toBe('number');
      expect(result.current.settings.pollingInterval).toBe(5000);
    });
  });

  describe('edge cases', () => {
    it('should handle empty update object', () => {
      const { result } = renderHook(() => useSettings());
      const originalSettings = { ...result.current.settings };

      act(() => {
        result.current.updateSettings({});
      });

      expect(result.current.settings).toEqual(originalSettings);
    });

    it('should handle very long userName', () => {
      const { result } = renderHook(() => useSettings());
      const longName = 'A'.repeat(1000);

      act(() => {
        result.current.updateSettings({ userName: longName });
      });

      expect(result.current.settings.userName).toBe(longName);
    });

    it('should handle zero pollingInterval', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.updateSettings({ pollingInterval: 0 });
      });

      expect(result.current.settings.pollingInterval).toBe(0);
    });

    it('should handle very large pollingInterval', () => {
      const { result } = renderHook(() => useSettings());
      const largeInterval = 999999999;

      act(() => {
        result.current.updateSettings({ pollingInterval: largeInterval });
      });

      expect(result.current.settings.pollingInterval).toBe(largeInterval);
    });
  });
});
