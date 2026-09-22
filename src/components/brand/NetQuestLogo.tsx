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

  // Modern Cresco Octopus Mascot Brand Mark
  const markSvg = (
    <div 
      className="relative shrink-0 flex items-center justify-center rounded-2xl overflow-hidden shadow-xs hover:scale-105 transition-transform duration-200"
      style={{ width: box, height: box }}
    >
      <div 
        className="absolute inset-0 rounded-2xl opacity-15"
        style={{ background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)' }}
      />
      <img
        src="/assets/mascot/cresco-mascot.png"
        alt="Cresco CN Mascot Logo"
        className="w-full h-full object-contain relative z-10 p-0.5 filter drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
      />
    </div>
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
