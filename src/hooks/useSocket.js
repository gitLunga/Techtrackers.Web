/**
 * src/hooks/useSocket.js
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces the three components that each built their own SignalR connection.
 *   Opening a socket per component means several connections per user and no
 *   shared lifecycle — closing one screen could tear down another's feed.
 *
 * WHAT IT ACHIEVES
 *   ONE connection for the whole app, created lazily on first use and
 *   authenticated with the same JWT the REST calls carry. Components subscribe
 *   to events; nobody manages the connection.
 */
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { tokenStore } from '../api/client.js';

let socket = null;

function getSocket() {
  const token = tokenStore.getAccess();
  if (!token) return null;

  if (!socket) {
    // Empty URL = same origin, which Vite's dev proxy forwards to the API.
    socket = io(import.meta.env.VITE_SOCKET_URL || '/', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export default function useSocket() {
  const [instance, setInstance] = useState(() => getSocket());

  useEffect(() => {
    const s = getSocket();
    setInstance(s);
    // Deliberately NOT disconnected on unmount: the connection is app-wide, and
    // tearing it down here would kill notifications for every other screen.
  }, []);

  return instance;
}
