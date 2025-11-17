import React, { useEffect } from 'react';
import apiClient from '@/services/apiClient';

const applyTheme = (theme) => {
  const root = document.documentElement;
  const themeMap = {
    primary: '--primary',
    background: '--background',
    card: '--card',
    foreground: '--foreground',
  };
  
  Object.keys(theme).forEach(key => {
    if (themeMap[key]) {
      root.style.setProperty(themeMap[key], theme[key]);
    } else if (key === 'fontFamily' || key === 'fontSize') {
      root.style.setProperty(key, theme[key]);
    }
  });
};

function ThemeProvider({ children }) {
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { data } = await apiClient.get('/theme');
        applyTheme(data);
      } catch (error) {
        console.warn("Não foi possível carregar o tema personalizado.");
      }
    };
    loadTheme();
  }, []);

  return <>{children}</>;
}

export default ThemeProvider;