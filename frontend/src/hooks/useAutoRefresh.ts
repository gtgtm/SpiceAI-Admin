import { useEffect, useRef, useState, useCallback } from 'react';

export function useAutoRefresh(fetchFn: () => Promise<void>, intervalMs: number = 30000) {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchFn();
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    intervalRef.current = setInterval(refresh, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh, intervalMs]);

  return { lastRefresh, isRefreshing, refresh };
}
