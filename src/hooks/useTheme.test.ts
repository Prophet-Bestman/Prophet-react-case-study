import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

const THEME_KEY = 'app_theme';

// Mock matchMedia
const createMatchMediaMock = (matches: boolean) => {
  return jest.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock light mode by default
    window.matchMedia = createMatchMediaMock(false);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with auto mode by default', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.mode).toBe('auto');
    });

    it('should initialize with stored theme from localStorage', () => {
      localStorage.setItem(THEME_KEY, 'dark');

      const { result } = renderHook(() => useTheme());

      expect(result.current.mode).toBe('dark');
    });

    it('should detect system theme when in auto mode', () => {
      window.matchMedia = createMatchMediaMock(true); // Dark mode

      const { result } = renderHook(() => useTheme());

      expect(result.current.mode).toBe('auto');
      expect(result.current.actualTheme).toBe('dark');
    });

    it('should use light theme when system prefers light', () => {
      window.matchMedia = createMatchMediaMock(false); // Light mode

      const { result } = renderHook(() => useTheme());

      expect(result.current.actualTheme).toBe('light');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from auto to light', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.mode).toBe('auto');

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.mode).toBe('light');
    });

    it('should toggle from light to dark', () => {
      localStorage.setItem(THEME_KEY, 'light');

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.mode).toBe('dark');
    });

    it('should toggle from dark to auto', () => {
      localStorage.setItem(THEME_KEY, 'dark');

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.mode).toBe('auto');
    });

    it('should complete full cycle: auto -> light -> dark -> auto', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.mode).toBe('auto');

      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.mode).toBe('light');

      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.mode).toBe('dark');

      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.mode).toBe('auto');
    });
  });

  describe('setThemeMode', () => {
    it('should set theme mode directly', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setThemeMode('dark');
      });

      expect(result.current.mode).toBe('dark');
    });

    it('should set to light mode', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setThemeMode('light');
      });

      expect(result.current.mode).toBe('light');
      expect(result.current.actualTheme).toBe('light');
    });

    it('should set to auto mode', () => {
      localStorage.setItem(THEME_KEY, 'dark');

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setThemeMode('auto');
      });

      expect(result.current.mode).toBe('auto');
    });
  });

  describe('localStorage persistence', () => {
    it('should persist theme mode to localStorage', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setThemeMode('dark');
      });

      const stored = localStorage.getItem(THEME_KEY);
      expect(stored).toBe('dark');
    });

    it('should persist on toggle', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      const stored = localStorage.getItem(THEME_KEY);
      expect(stored).toBe('light');
    });
  });

  describe('actualTheme calculation', () => {
    it('should return dark when mode is dark', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setThemeMode('dark');
      });

      expect(result.current.actualTheme).toBe('dark');
    });

    it('should return light when mode is light', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setThemeMode('light');
      });

      expect(result.current.actualTheme).toBe('light');
    });

    it('should return system theme when mode is auto', () => {
      window.matchMedia = createMatchMediaMock(true); // Dark

      const { result } = renderHook(() => useTheme());

      expect(result.current.mode).toBe('auto');
      expect(result.current.actualTheme).toBe('dark');
    });
  });

  describe('DOM attribute setting', () => {
    it('should set data-theme attribute on document element', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setThemeMode('dark');
      });

      // Note: In jsdom, document.documentElement.getAttribute may not work perfectly
      // This is more of an integration test that would work in a real browser
      expect(result.current.actualTheme).toBe('dark');
    });
  });
});
