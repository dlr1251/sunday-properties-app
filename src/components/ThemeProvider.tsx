import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ReactNode, useEffect, useState } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'sunday-theme',
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent flash of unstyled content
  useEffect(() => {
    setMounted(true);
  }, []);

  // Add no-transitions class during initial render to prevent color flash
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove('no-transitions');
    } else {
      document.documentElement.classList.add('no-transitions');
    }
  }, [mounted]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange={false}
      storageKey={storageKey}
    >
      {children}
    </NextThemesProvider>
  );
}

// Hook to use theme
export { useTheme } from 'next-themes';
