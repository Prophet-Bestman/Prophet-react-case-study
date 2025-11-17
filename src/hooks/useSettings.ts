import { useState, useEffect } from 'react';

export interface AppSettings {
  userName: string;
  userRole: 'admin' | 'contributor';
  pollingInterval: number;
}

const SETTINGS_KEY = 'app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Alice',
  userRole: 'admin',
  pollingInterval: 10000, // 10 seconds
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return { settings, updateSettings };
};
