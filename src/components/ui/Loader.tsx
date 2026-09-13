import React from 'react';

interface LoaderProps {
  size?: string | number;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = '6em', className = '' }) => {
  return (
    <div className={`ring-loader-wrapper ${className}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 240 240"
        className="ring-loader-svg"
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
          display: 'block',
        }}
      >
        <circle
          strokeLinecap="round"
          strokeDashoffset={-330}
          strokeDasharray="0 660"
          strokeWidth={20}
          stroke="#000"
          fill="none"
          r={105}
          cy={120}
          cx={120}
          className="loader-ring loader-ring-a"
        />
        <circle
          strokeLinecap="round"
          strokeDashoffset={-110}
          strokeDasharray="0 220"
          strokeWidth={20}
          stroke="#000"
          fill="none"
          r={35}
          cy={120}
          cx={120}
          className="loader-ring loader-ring-b"
        />
        <circle
          strokeLinecap="round"
          strokeDasharray="0 440"
          strokeWidth={20}
          stroke="#000"
          fill="none"
          r={70}
          cy={120}
          cx={85}
          className="loader-ring loader-ring-c"
        />
        <circle
          strokeLinecap="round"
          strokeDasharray="0 440"
          strokeWidth={20}
          stroke="#000"
          fill="none"
          r={70}
          cy={120}
          cx={155}
          className="loader-ring loader-ring-d"
        />
      </svg>

      <style>{`
        .ring-loader-svg .loader-ring {
          animation: ringA 2s linear infinite;
        }

        .ring-loader-svg .loader-ring-a {
          stroke: #9708F4;
        }

        .ring-loader-svg .loader-ring-b {
          animation-name: ringB;
          stroke: #5E14E4;
        }

        .ring-loader-svg .loader-ring-c {
          animation-name: ringC;
          stroke: #9708F4;
        }

        .ring-loader-svg .loader-ring-d {
          animation-name: ringD;
          stroke: #5E14E4;
        }

        @keyframes ringA {
          from, 4% {
            stroke-dasharray: 0 660;
            stroke-width: 20;
            stroke-dashoffset: -330;
          }
          12% {
            stroke-dasharray: 60 600;
            stroke-width: 30;
            stroke-dashoffset: -335;
          }
          32% {
            stroke-dasharray: 60 600;
            stroke-width: 30;
            stroke-dashoffset: -595;
          }
          40%, 54% {
            stroke-dasharray: 0 660;
            stroke-width: 20;
            stroke-dashoffset: -660;
          }
          62% {
            stroke-dasharray: 60 600;
            stroke-width: 30;
            stroke-dashoffset: -665;
          }
          82% {
            stroke-dasharray: 60 600;
            stroke-width: 30;
            stroke-dashoffset: -925;
          }
          90%, to {
            stroke-dasharray: 0 660;
            stroke-width: 20;
            stroke-dashoffset: -990;
          }
        }

        @keyframes ringB {
          from, 12% {
            stroke-dasharray: 0 220;
            stroke-width: 20;
            stroke-dashoffset: -110;
          }
          20% {
            stroke-dasharray: 20 200;
            stroke-width: 30;
            stroke-dashoffset: -115;
          }
          40% {
            stroke-dasharray: 20 200;
            stroke-width: 30;
            stroke-dashoffset: -195;
          }
          48%, 62% {
            stroke-dasharray: 0 220;
            stroke-width: 20;
            stroke-dashoffset: -220;
          }
          70% {
            stroke-dasharray: 20 200;
            stroke-width: 30;
            stroke-dashoffset: -225;
          }
          90% {
            stroke-dasharray: 20 200;
            stroke-width: 30;
            stroke-dashoffset: -305;
          }
          98%, to {
            stroke-dasharray: 0 220;
            stroke-width: 20;
            stroke-dashoffset: -330;
          }
        }

        @keyframes ringC {
          from {
            stroke-dasharray: 0 440;
            stroke-width: 20;
            stroke-dashoffset: 0;
          }
          8% {
            stroke-dasharray: 40 400;
            stroke-width: 30;
            stroke-dashoffset: -5;
          }
          28% {
            stroke-dasharray: 40 400;
            stroke-width: 30;
            stroke-dashoffset: -175;
          }
          36%, 58% {
            stroke-dasharray: 0 440;
            stroke-width: 20;
            stroke-dashoffset: -220;
          }
          66% {
            stroke-dasharray: 40 400;
            stroke-width: 30;
            stroke-dashoffset: -225;
          }
          86% {
            stroke-dasharray: 40 400;
            stroke-width: 30;
            stroke-dashoffset: -395;
          }
          94%, to {
            stroke-dasharray: 0 440;
            stroke-width: 20;
            stroke-dashoffset: -440;
          }
        }

        @keyframes ringD {
          from, 8% {
            stroke-dasharray: 0 440;
            stroke-width: 20;
            stroke-dashoffset: 0;
          }
          16% {
            stroke-dasharray: 40 400;
            stroke-width: 30;
            stroke-dashoffset: -5;
          }
          36% {
            stroke-dasharray: 40 400;
            stroke-width: 30;
            stroke-dashoffset: -175;
          }
          44%, 50% {
            stroke-dasharray: 0 440;
            stroke-width: 20;
            stroke-dashoffset: -220;
          }
          58% {
            stroke-dasharray: 40 400;
            stroke-width: 30;
            stroke-dashoffset: -225;
          }
          78% {
            stroke-dasharray: 40 400;
            stroke-width: 30;
            stroke-dashoffset: -395;
          }
          86%, to {
            stroke-dasharray: 0 440;
            stroke-width: 20;
            stroke-dashoffset: -440;
          }
        }
      `}</style>
    </div>
  );
};

export interface FullScreenLoaderProps {
  message?: string;
  subMessage?: string;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  message = 'Loading Cresco CN...',
  subMessage = 'Synchronizing network modules & student credentials',
}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070D18] text-white p-6 overflow-hidden select-none">
      {/* Background ambient purple glow */}
      <div className="absolute w-96 h-96 rounded-full bg-[#9708F4]/15 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center space-y-6 text-center max-w-sm">
        {/* Animated Multi-Ring Loader */}
        <div className="p-4 rounded-3xl bg-[#0B1528]/80 border border-[#9708F4]/30 shadow-[0_0_50px_rgba(151,8,244,0.25)] backdrop-blur-xl">
          <Loader size="6.5em" />
        </div>

        <div className="space-y-2">
          <h2 className="font-extrabold text-xl tracking-tight text-white drop-shadow-sm">
            {message}
          </h2>
          {subMessage && (
            <p className="text-xs font-mono text-purple-300/80 tracking-wide">
              {subMessage}
            </p>
          )}
        </div>

        {/* Minimalist Glowing Progress Bar */}
        <div className="w-48 h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-[#9708F4]/30">
          <div className="h-full bg-gradient-to-r from-[#9708F4] to-[#5E14E4] rounded-full animate-pulse shadow-[0_0_10px_rgba(151,8,244,0.8)]" style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  );
};

export default Loader;
