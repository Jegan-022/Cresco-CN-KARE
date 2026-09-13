import React, { useState, useEffect } from 'react';
import { 
  WifiOff, 
  RefreshCw, 
  ShieldAlert, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle,
  Server,
  Activity,
  Globe
} from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface Offline403PageProps {
  onDismiss?: () => void;
  onRetry?: () => void;
  standalone?: boolean;
}

export const Offline403Page: React.FC<Offline403PageProps> = ({ 
  onDismiss, 
  onRetry,
  standalone = false 
}) => {
  const { isOnline, isOffline, checkConnection } = useNetworkStatus();
  const [isRetrying, setIsRetrying] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const handleManualRetry = async () => {
    setIsRetrying(true);
    setPingResult('Testing socket connection & DNS resolution...');
    
    try {
      const reachable = await checkConnection();
      if (reachable) {
        setPingResult('Connection restored! Re-establishing gateway...');
        setTimeout(() => {
          if (onRetry) onRetry();
          if (onDismiss) onDismiss();
        }, 1000);
      } else {
        setPingResult('Gateway probe failed: Host unreachable (ICMP Destination Unreachable).');
      }
    } catch {
      setPingResult('Network interface inactive. Check Ethernet or Wi-Fi adapter.');
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0B0D12] text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans select-none">
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-[#11141B] border border-red-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Error Code Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>HTTP 403 • Network Access Forbidden & Offline</span>
        </div>

        {/* Visual Offline Icon */}
        <div className="w-24 h-24 rounded-3xl bg-red-500/15 border-2 border-red-500/40 text-red-400 mx-auto flex items-center justify-center relative shadow-[0_0_40px_rgba(239,68,68,0.2)]">
          <WifiOff className="w-12 h-12 stroke-[2.2]" />
          <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#11141B] border-2 border-red-500 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Internet Connection Disconnected
          </h1>
          <p className="text-sm text-[#94A3B8] leading-relaxed max-w-md mx-auto">
            Your client device has lost network connectivity to the Cresco CN cloud servers. Access to live syncing and multiplayer features is currently restricted (Error 403).
          </p>
        </div>

        {/* Network Diagnostics Box */}
        <div className="bg-[#0B0D12] border border-[#252B36] rounded-2xl p-4 text-left font-mono text-xs space-y-2.5">
          <div className="text-[#64748B] font-bold uppercase tracking-wider text-[10px] flex items-center justify-between">
            <span>Diagnostic Telemetry</span>
            <span className="text-red-400">STATUS: OFFLINE</span>
          </div>

          <div className="space-y-1.5 text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">OS Network Adapter:</span>
              <span className="text-red-400">DISCONNECTED</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">Cloud Gateway Probe:</span>
              <span className="text-red-400">TIMED OUT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">Local Cache Status:</span>
              <span className="text-emerald-400">READY (OFFLINE READ-ONLY)</span>
            </div>
          </div>

          {pingResult && (
            <div className="pt-2 border-t border-[#252B36] text-[11px] text-amber-300">
              &gt; {pingResult}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleManualRetry}
            disabled={isRetrying}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Probing Gateway...' : 'Retry Connection'}</span>
          </button>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-1 bg-[#171B24] hover:bg-[#1E2330] border border-[#252B36] text-[#94A3B8] hover:text-white font-bold py-3.5 px-6 rounded-xl transition-colors text-sm cursor-pointer"
            >
              Continue in Cached Mode
            </button>
          )}
        </div>

        <p className="text-[11px] text-[#64748B] text-center font-mono">
          Cresco CN Offline Engine • LocalStorage &amp; IndexedDB Protected
        </p>

      </div>

    </div>
  );
};
