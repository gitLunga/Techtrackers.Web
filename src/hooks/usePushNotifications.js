/**
 * src/hooks/usePushNotifications.js
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The Push API is genuinely fiddly — service worker registration, permission
 *   prompts, VAPID key conversion, and three different failure modes
 *   (unsupported browser, permission denied, backend not configured) all need
 *   handling before a component can just show "Enable notifications". Isolating
 *   that here means Profile.jsx (or anywhere else this is wired in later) stays
 *   a few lines.
 *
 * WHAT IT ACHIEVES
 *   `const { status, enable, disable } = usePushNotifications()`. `status` is
 *   one of 'unsupported' | 'loading' | 'disabled' | 'enabled' | 'unavailable'
 *   ('unavailable' = browser supports push but the backend has no VAPID keys
 *   configured, see server/src/config/env.js).
 */
import { useCallback, useEffect, useState } from 'react';
import { push as pushApi } from '../api/services/index.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

const isSupported = () => 'serviceWorker' in navigator && 'PushManager' in window;

export default function usePushNotifications() {
  const [status, setStatus] = useState(isSupported() ? 'loading' : 'unsupported');

  const refresh = useCallback(async () => {
    if (!isSupported()) { setStatus('unsupported'); return; }
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const existing = await registration.pushManager.getSubscription();
      setStatus(existing ? 'enabled' : 'disabled');
    } catch {
      setStatus('unsupported');
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const enable = useCallback(async () => {
    if (!isSupported()) return;
    setStatus('loading');
    try {
      const { data: keyInfo } = await pushApi.publicKey();
      if (!keyInfo.enabled || !keyInfo.publicKey) { setStatus('unavailable'); return; }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setStatus('disabled'); return; }

      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyInfo.publicKey),
      });

      await pushApi.subscribe(subscription.toJSON());
      setStatus('enabled');
    } catch {
      setStatus('disabled');
    }
  }, []);

  const disable = useCallback(async () => {
    setStatus('loading');
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await pushApi.unsubscribe(subscription.endpoint).catch(() => {});
        await subscription.unsubscribe();
      }
    } finally {
      setStatus('disabled');
    }
  }, []);

  return { status, enable, disable };
}
