import React, { useState } from 'react';
import { WifiOff, Wifi, RefreshCw, Database, CheckCircle2 } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface OfflinePersistenceBannerProps {
  pendingSyncCount?: number;
}

export const OfflinePersistenceBanner: React.FC<OfflinePersistenceBannerProps> = ({
  pendingSyncCount = 0,
}) => {
  const { isOnline, isIntermittent, isOffline, checkConnection } = useNetworkStatus();
  const [checking, setChecking] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  const handleManualCheck = async () => {
    setChecking(true);
    const reachable = await checkConnection();
    setChecking(false);
    if (reachable) {
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 4000);
    }
  };

  if (justReconnected) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-xs transition-all transform-gpu animate-fadeIn">
        <div className="flex items-center space-x-3 max-w-5xl mx-auto w-full">
          <img 
            src="/assets/mascot/mascot-connected.png" 
            alt="Connection Established" 
            className="w-8 h-8 object-contain shrink-0 animate-bounce" 
          />
          <span>Connection restored — Firestore offline cache synchronized with server.</span>
        </div>
      </div>
    );
  }

  if (!isOffline) {
    return null;
  }

  return (
    <div
      id="offline-persistence-status-banner"
      className="bg-amber-500 text-slate-900 border-b border-amber-600/20 px-4 py-2 text-xs shadow-xs transition-all transform-gpu"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center space-x-3">
          <img 
            src="/assets/mascot/mascot-disconnected.png" 
            alt="Connection Lost" 
            className="w-9 h-9 object-contain shrink-0 animate-tentacle-sway" 
          />
          <div>
            <span className="font-bold text-slate-950">
              {isIntermittent ? 'Intermittent Network Connection' : 'Offline Mode Active'}
            </span>
            <span className="mx-1.5 text-amber-900/60">•</span>
            <span className="text-slate-900 font-medium">
              Service Worker &amp; Firestore persistence are active. You can continue viewing lesson completion status and progress.
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:self-center self-end">
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-600/20 text-slate-950 text-[11px] font-semibold">
            <Database className="w-3 h-3 text-slate-900" />
            <span>Local Cache Active</span>
          </span>

          {pendingSyncCount > 0 && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-700/20 text-slate-950 text-[11px] font-semibold">
              <span>{pendingSyncCount} pending write{pendingSyncCount > 1 ? 's' : ''}</span>
            </span>
          )}

          <button
            id="retry-network-sync-btn"
            onClick={handleManualCheck}
            disabled={checking}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-semibold transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking...' : 'Check Connection'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
