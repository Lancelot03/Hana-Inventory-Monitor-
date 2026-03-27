import { useEffect, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export function useInventoryStream() {
  const [payload, setPayload] = useState(null);
  const [status, setStatus] = useState('connecting');
  const reconnectRef = useRef(0);
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const response = await fetch(`${API_BASE}/api/inventory`);
      const data = await response.json();
      if (active) {
        setPayload(data);
      }
    };

    const connectSocket = () => {
      if (!active) return;

      setStatus('connecting');
      const socket = new WebSocket(`${API_BASE.replace('http', 'ws')}/ws`);
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectRef.current = 0;
        setStatus('live');
      };

      socket.onerror = () => {
        setStatus('error');
      };

      socket.onclose = () => {
        if (!active) return;
        setStatus('reconnecting');
        reconnectRef.current += 1;
        const backoff = Math.min(1000 * 2 ** reconnectRef.current, 15000);
        timerRef.current = setTimeout(connectSocket, backoff);
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.payload && active) {
          setPayload(message.payload);
        }
      };
    };

    bootstrap().catch(() => setStatus('error'));
    connectSocket();

    return () => {
      active = false;
      clearTimeout(timerRef.current);
      socketRef.current?.close();
    };
  }, []);

  return { payload, status };
}
