import { useEffect, useState } from 'react';

// Devuelve la hora actual y se actualiza solo, para detectar incubadoras sin señal.
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
