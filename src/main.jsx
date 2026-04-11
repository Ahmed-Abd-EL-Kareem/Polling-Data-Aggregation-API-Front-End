import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';

import { queryClient } from './app/queryClient';
import './i18n/config';
import { useThemeStore } from './app/store';
import './index.css';

function Root() {
  const { i18n } = useTranslation();
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n, i18n.language]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme === 'light' ? 'light' : 'dark');
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'text-sm',
          style: {
            background: 'var(--color-surface-container-high)',
            color: 'var(--color-on-surface)',
          },
        }}
      />
      <App />
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
