import React, { useState } from 'react';
import { 
  ServerCrash, 
  RotateCcw, 
  Home, 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  ShieldAlert, 
  AlertOctagon,
  RefreshCw
} from 'lucide-react';

interface ServerCrash404PageProps {
  error?: Error | null;
  errorInfo?: React.ErrorInfo | null;
  resetErrorBoundary?: () => void;
  onNavigateHome?: () => void;
  customTitle?: string;
  customMessage?: string;
  errorCode?: string;
}

export const ServerCrash404Page: React.FC<ServerCrash404PageProps> = ({
  error,
  errorInfo,
  resetErrorBoundary,
  onNavigateHome,
  customTitle = 'Server Crash & Endpoint Not Found',
  customMessage = 'The requested resource or backend server process has encountered a critical failure or could not be located on the Cresco CN routing mesh.',
  errorCode = '404'
}) => {
  const [showStack, setShowStack] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLog = () => {
    const logData = `[Cresco CN Diagnostic Crash Report]\nError: ${error?.message || 'Server Exception / 404'}\nStack: ${error?.stack || 'N/A'}\nComponent Stack: ${errorInfo?.componentStack || 'N/A'}\nTime: ${new Date().toISOString()}`;
    navigator.clipboard.writeText(logData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleReturnHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0B0D12] text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans select-none">
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#5B7CFF]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl bg-[#11141B] border border-[#252B36] rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Error Code Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
          <AlertOctagon className="w-4 h-4" />
          <span>HTTP {errorCode} • Critical Server Fault / Not Found</span>
        </div>

        {/* Server Crash Graphic */}
        <div className="w-24 h-24 rounded-3xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center relative shadow-[0_0_40px_rgba(245,158,11,0.2)]">
          <ServerCrash className="w-12 h-12 stroke-[2.2]" />
          <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#11141B] border-2 border-amber-500 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
        </div>

        {/* Header Texts */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {customTitle}
          </h1>
          <p className="text-sm text-[#94A3B8] leading-relaxed max-w-lg mx-auto">
            {customMessage}
          </p>
        </div>

        {/* Diagnostic Stack Console */}
        <div className="bg-[#0B0D12] border border-[#252B36] rounded-2xl p-4 text-left font-mono text-xs space-y-3">
          <div className="flex items-center justify-between text-[#64748B] text-[10px] font-bold uppercase tracking-wider border-b border-[#252B36] pb-2">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-[#5B7CFF]" />
              <span>Kernel Crash Telemetry</span>
            </div>
            <button
              onClick={handleCopyLog}
              className="flex items-center gap-1 text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Log'}</span>
            </button>
          </div>

          <div className="text-slate-300 space-y-1">
            <div>
              <span className="text-red-400 font-bold">FATAL: </span>
              <span>{error?.message || 'ERR_HTTP_404_SERVER_CRASH: Process unresponsive or route unregistered'}</span>
            </div>
            <div className="text-[#64748B] text-[11px]">
              Subsystem: cresco-cn-runtime-v2.4 • Node/Vite Mesh
            </div>
          </div>

          {error?.stack && (
            <div>
              <button
                onClick={() => setShowStack(!showStack)}
                className="flex items-center gap-1 text-[11px] text-[#5B7CFF] hover:underline cursor-pointer"
              >
                <span>{showStack ? 'Hide Stack Trace' : 'View Stack Trace'}</span>
                {showStack ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showStack && (
                <pre className="mt-2 p-3 bg-[#11141B] rounded-lg border border-[#252B36] text-[10px] text-slate-400 overflow-x-auto max-h-40 whitespace-pre-wrap">
                  {error.stack}
                  {errorInfo?.componentStack}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleReload}
            className="flex-1 bg-[#5B7CFF] hover:bg-[#4A6BF5] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Terminal</span>
          </button>

          <button
            onClick={handleReturnHome}
            className="flex-1 bg-[#171B24] hover:bg-[#1E2330] border border-[#252B36] text-white font-bold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#94A3B8]" />
            <span>Return to Dashboard</span>
          </button>
        </div>

        <div className="pt-2 flex items-center justify-center gap-4 text-xs text-[#64748B]">
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }
            }}
            className="hover:text-amber-400 transition-colors underline cursor-pointer"
          >
            Clear Cache &amp; Reset Session
          </button>
          <span>•</span>
          <span>RFC 2616 / 7231 Diagnostic Compliant</span>
        </div>

      </div>

    </div>
  );
};
