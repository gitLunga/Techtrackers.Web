/**
 * src/main.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Vite's entry point, replacing src/index.js. The old one imported
 *   StaffDashboard for no reason and carried 25 lines of commented-out code from
 *   an earlier experiment.
 *
 * WHAT IT ACHIEVES
 *   Mounts React and establishes the four providers every screen depends on, in
 *   the order they depend on each other:
 *     ThemeProvider  -> styling for everything below
 *     CssBaseline    -> resets browser defaults, applies the theme's background
 *     ToastProvider  -> notifications (AuthProvider reports errors through it)
 *     BrowserRouter  -> AuthProvider needs routing for its redirects
 *     AuthProvider   -> the app needs to know who is signed in
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/index.js';
import { AuthProvider } from './auth/AuthContext.jsx';
import { ToastProvider } from './components/Toast.jsx';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
