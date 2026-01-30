import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './Router';
import { ThemeProvider } from './components/ThemeProvider';
import './i18n'; // Initialize i18n before rendering
import './index.css';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="sunday-theme">
      <AppRouter />
    </ThemeProvider>
  </React.StrictMode>
);
  