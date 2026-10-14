import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { IncubatorSnapshot } from '../types';

const API_URL: string | undefined = import.meta.env.VITE_API_URL || undefined;

export function useIncubators() {
  const [byId, setById] = useState<Record<string, IncubatorSnapshot>>({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(API_URL);
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('incubators:snapshot', (list: IncubatorSnapshot[]) =>
      setById(Object.fromEntries(list.map((i) => [i.id, i]))),
    );
    socket.on('incubator:update', (snap: IncubatorSnapshot) =>
      setById((prev) => ({ ...prev, [snap.id]: snap })),
    );
    return () => {
      socket.disconnect();
    };
  }, []);

  const incubators = Object.values(byId).sort((a, b) => a.id.localeCompare(b.id));
  return { incubators, connected };
}
