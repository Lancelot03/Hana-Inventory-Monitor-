import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export function useInventoryStream() {
  const [payload, setPayload] = useState(null);
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    let socket;

    const bootstrap = async () => {
      const response = await fetch(`${API_BASE}/api/inventory`);
      const data = await response.json();
      setPayload(data);
    };

    bootstrap().catch(() => setStatus('error'));

    socket = new WebSocket(`${API_BASE.replace('http', 'ws')}/ws`);

    socket.onopen = () => setStatus('live');
    socket.onerror = () => setStatus('error');
    socket.onclose = () => setStatus('disconnected');
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.payload) {
        setPayload(message.payload);
      }
    };

    return () => socket?.close();
  }, []);

  return { payload, status };
}
