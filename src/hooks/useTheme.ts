import { useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';

export function useTheme() {
  const { preferences, setPreferences } = useTaskStore();

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    if (preferences.theme === 'auto') {
      // Use system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(preferences.theme);
    }
  }, [preferences.theme]);

  useEffect(() => {
    // Listen for system theme changes when auto mode is selected
    if (preferences.theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preferences.theme]);

  const setTheme = (theme: 'light' | 'dark' | 'auto') => {
    setPreferences({ theme });
  };

  return {
    theme: preferences.theme,
    setTheme
  };
}