import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isIntermittent: boolean;
  isOffline: boolean;
  lastOnlineAt: Date | null;
  checkConnection: () => Promise<boolean>;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isIntermittent, setIsIntermittent] = useState<boolean>(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(new Date());

  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch('/api/health?t=' + Date.now(), {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setIsOnline(true);
        setIsIntermittent(false);
        setLastOnlineAt(new Date());
        return true;
      } else {
        setIsIntermittent(true);
        return false;
      }
    } catch {
      // If health check timed out or failed while navigator.onLine is true => connection is intermittent!
      setIsIntermittent(true);
      return false;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsIntermittent(false);
      setLastOnlineAt(new Date());
      // Validate real reachability
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsIntermittent(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic lightweight health check every 45 seconds to detect intermittent packet loss
    const interval = setInterval(() => {
      if (navigator.onLine) {
        checkConnection();
      }
    }, 45000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkConnection]);

  return {
    isOnline,
    isIntermittent,
    isOffline: !isOnline || isIntermittent,
    lastOnlineAt,
    checkConnection,
  };
}
