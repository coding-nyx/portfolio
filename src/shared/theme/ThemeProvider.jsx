import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './themeContext.js';

function initialTheme() {
  const query = new URLSearchParams(window.location.search).get('theme');
  if (query === 'cyberpunk') return 'cyberpunk';
  if (['professional', 'light', 'modern'].includes(query)) return 'professional';
  try {
    return localStorage.getItem('portfolio-theme') === 'cyberpunk' ? 'cyberpunk' : 'professional';
  } catch {
    return 'professional';
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);
  const toggleTheme = useCallback(
    () => setTheme((current) => (current === 'cyberpunk' ? 'professional' : 'cyberpunk')),
    [],
  );
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  useEffect(() => {
    document.body.dataset.theme = theme;
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch {
      /* Theme selection still works when storage is unavailable. */
    }
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
