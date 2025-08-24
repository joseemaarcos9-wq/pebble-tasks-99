import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
  const { theme, setTheme } = useNextTheme();
  
  return {
    theme: theme as 'light' | 'dark' | 'auto',
    setTheme: (newTheme: 'light' | 'dark' | 'auto') => {
      if (newTheme === 'auto') {
        setTheme('system');
      } else {
        setTheme(newTheme);
      }
    }
  };
}