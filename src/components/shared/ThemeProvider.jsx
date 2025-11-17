import React, { useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { applyTheme } from '@/lib/theme';

function ThemeProvider({ children }) {
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { data } = await apiClient.get('/theme');
        applyTheme(data);
      } catch (error) {
        console.warn("Não foi possível carregar o tema personalizado. Usando padrões.");
      }
    };
    loadTheme();
  }, []);

  return <>{children}</>;
}

export default ThemeProvider;