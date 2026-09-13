import React from 'react';

interface NetQuestLogoProps {
  variant?: 'primary' | 'mark-only' | 'monochrome';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const NetQuestLogo: React.FC<NetQuestLogoProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  showTagline = false,
}) => {
  const sizeMap = {
    sm: { box: 32, text: 'text-lg font-black', sub: 'text-[10px]' },
    md: { box: 42, text: 'text-2xl font-black tracking-tight', sub: 'text-xs' },
    lg: { box: 52, text: 'text-3xl font-black tracking-tight', sub: 'text-sm' },
    xl: { box: 64, text: 'text-4xl font-black tracking-tighter', sub: 'text-base' },
  };

  const { box, text, sub } = sizeMap[size];
  const isMonochrome = variant === 'monochrome';

  // Network Topology Symbol Combined with an Open Book Mark:
  // - Open book base pages forming a welcoming foundation
  // - Interconnected glowing network nodes and routing arcs rising from the pages
  const markSvg = (
    <svg
      width={box}
      height={box}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200 hover:scale-105"
      aria-label="Cresco CN Network & Book Brand Mark"
    >
      {/* Outer rounded app icon tile */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill={isMonochrome ? '#172033' : '#3157D5'}
      />

      {/* Open Book Base Wings */}
      {/* Left Page */}
      <path
        d="M 12 33 C 18 31 23 32 24 35 L 24 24 C 23 21 18 20 12 22 Z"
        fill="#FFFFFF"
        opacity="0.92"
      />
      {/* Right Page */}
      <path
        d="M 36 33 C 30 31 25 32 24 35 L 24 24 C 25 21 30 20 36 22 Z"
        fill="#FFFFFF"
        opacity="0.92"
      />
      {/* Book Spine Center line */}
      <line x1="24" y1="23" x2="24" y2="35" stroke="#3157D5" strokeWidth="1.5" strokeLinecap="round" />

      {/* Network Topology Nodes Rising from Knowledge */}
      {/* Left Node */}
      <circle cx="16" cy="15" r="3.5" fill="#5B7CFA" stroke="#FFFFFF" strokeWidth="1.5" />
      {/* Center Top Apex Node */}
      <circle cx="24" cy="10" r="4" fill="#35A86B" stroke="#FFFFFF" strokeWidth="1.5" />
      {/* Right Node */}
      <circle cx="32" cy="15" r="3.5" fill="#5B7CFA" stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Interconnecting Network Topology Links */}
      <line x1="16" y1="15" x2="24" y2="10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="10" x2="32" y2="15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="15" x2="24" y2="23" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round" />
      <line x1="32" y1="15" x2="24" y2="23" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round" />

      {/* Center Packet Signal Blip */}
      <circle cx="20" cy="12.5" r="1.5" fill="#FFFFFF" />
    </svg>
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center ${className}`}>{markSvg}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {markSvg}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight font-headline ${text}`}>
            <span className="text-[#172033] dark:text-[#F9FAFB]">CRESCO</span>{' '}
            <span className="text-[#10B981] dark:text-[#34D399] font-black">CN</span>
          </span>
        </div>
        {showTagline && (
          <span className={`font-medium text-[#64748B] dark:text-[#9CA3AF] tracking-wide ${sub}`}>
            Learn. Connect. Master.
          </span>
        )}
      </div>
    </div>
  );
};

export const CrescoCNLogo = NetQuestLogo;
export const CrescoLogo = NetQuestLogo;
