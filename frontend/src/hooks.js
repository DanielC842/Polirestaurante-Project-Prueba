import { useEffect, useRef, useState, useCallback } from 'react';

// Consulta periódica (polling cada 2 s, tradeoff elegido en lugar de WebSocket)
export function usePolling(fetcher, intervalMs = 2000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const fetcherRef = useRef(fetcher);
  useEffect(() => { fetcherRef.current = fetcher; });

  const refresh = useCallback(async () => {
    try {
      setData(await fetcherRef.current());
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return { data, error, refresh };
}

export const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export const formatHora = (d) =>
  d ? new Date(d).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit' }) : '';

export const minutosDesde = (d) => Math.floor((Date.now() - new Date(d).getTime()) / 60000);
