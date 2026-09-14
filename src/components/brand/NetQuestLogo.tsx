import React from 'react';

interface NetQuestLogoProps {
  variant?: 'primary' | 'mark-only' | 'monochrome' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const NetQuestLogo: React.FC<NetQuestLogoProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  showTagline = true,
}) => {
  const sizeMap = {
    sm: { box: 32, text: 'text-base font-black', sub: 'text-[10px]' },
    md: { box: 42, text: 'text-xl font-black tracking-tight', sub: 'text-[11px]' },
    lg: { box: 52, text: 'text-2xl font-black tracking-tight', sub: 'text-xs' },
    xl: { box: 64, text: 'text-3xl font-black tracking-tighter', sub: 'text-sm' },
  };

  const { box, text, sub } = sizeMap[size];

  // Official Cresco CN Network Octopus Mascot Brand Mark Badge
  const markBadge = (
    <div
      className="relative shrink-0 flex items-center justify-center rounded-2xl group cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
      style={{ width: box, height: box }}
    >
      {/* Soft Ambient Glow Halo */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/30 via-emerald-500/20 to-pink-500/30 blur-md opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Circular Mascot Tile */}
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden border border-cyan-400/40 shadow-[0_4px_12px_rgba(6,182,212,0.25)] flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0d3b46 0%, #08252d 100%)',
        }}
      >
        <img
          src="/assets/brand/cresco-favicon.png"
          alt="Cresco CN Network Octopus"
          className="w-full h-full object-contain p-0.5"
          loading="eager"
        />
        {/* Subtle Online Pulse Node */}
        <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 shadow-xs animate-packet-beacon" />
      </div>
    </div>
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center ${className}`}>{markBadge}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {markBadge}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight font-headline ${text}`}>
            <span className="text-slate-900 dark:text-white">Cresco</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-black">-CN</span>
          </span>
        </div>
        {showTagline && (
          <span className={`font-semibold text-emerald-600 dark:text-emerald-400 tracking-normal ${sub}`}>
            Gamified Network Learning
          </span>
        )}
      </div>
    </div>
  );
};

export const CrescoCNLogo = NetQuestLogo;
export const CrescoLogo = NetQuestLogo;
