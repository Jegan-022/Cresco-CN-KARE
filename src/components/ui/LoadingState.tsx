import React from 'react';
import { Loader } from './Loader';

export const LoadingState: React.FC<{ message?: string; subMessage?: string }> = ({ 
  message = 'Initializing Cresco CN Network Pipeline...',
  subMessage = 'Synchronizing network modules & student credentials',
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070D18] text-white p-6 select-none">
      <div className="relative flex flex-col items-center space-y-6 max-w-sm text-center">
        {/* Animated Multi-Ring Loader */}
        <div className="p-4 rounded-3xl bg-[#0B1528]/80 border border-[#9708F4]/30 shadow-[0_0_40px_rgba(151,8,244,0.25)] backdrop-blur-xl">
          <Loader size="5.5em" />
        </div>

        <div className="space-y-2">
          <h3 className="font-extrabold text-lg tracking-tight text-white drop-shadow-sm">
            {message}
          </h3>
          {subMessage && (
            <p className="text-xs font-mono text-purple-300/80">
              {subMessage}
            </p>
          )}
        </div>

        {/* Minimalist Progress Line */}
        <div className="w-48 h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-[#9708F4]/30">
          <div className="h-full bg-gradient-to-r from-[#9708F4] to-[#5E14E4] rounded-full animate-pulse shadow-[0_0_10px_rgba(151,8,244,0.8)]" style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  );
};
