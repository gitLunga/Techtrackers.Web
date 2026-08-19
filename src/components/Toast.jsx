/**
 * src/components/Toast.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The old app depended on BOTH react-toastify and react-hot-toast, and mounted
 *   a separate <ToastContainer /> inside 20 different components — so a message
 *   could render twice, or in a different corner depending on which screen you
 *   were on.
 *
 * WHAT IT ACHIEVES
 *   One provider at the app root and a `useToast()` hook. Notifications appear
 *   in the same place, in the same style, everywhere.
 *
 *   `toast.error(err)` accepts an ApiError directly, so screens don't each write
 *   their own "pull the message out of the error" logic.
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const show = useCallback((message, severity = 'info') => {
    // Accepts a string, an Error, or an ApiError.
    const text = typeof message === 'string' ? message : message?.message ?? 'Something went wrong';
    setToast({ text, severity, key: Date.now() });
  }, []);

  const value = useMemo(
    () => ({
      show,
      success: (m) => show(m, 'success'),
      error: (m) => show(m, 'error'),
      warning: (m) => show(m, 'warning'),
      info: (m) => show(m, 'info'),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        key={toast?.key}
        open={Boolean(toast)}
        autoHideDuration={toast?.severity === 'error' ? 6000 : 4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? (
          <Alert
            onClose={() => setToast(null)}
            severity={toast.severity}
            variant="filled"
            sx={{ minWidth: 280, boxShadow: 3 }}
          >
            {toast.text}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
