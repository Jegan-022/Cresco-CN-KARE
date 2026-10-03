import React from 'react';

export interface NetQuestLogoProps {
  variant?: 'primary' | 'mark-only' | 'monochrome' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
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
    sm: { box: 36, text: 'text-lg font-black', sub: 'text-[10px]', full: 'h-9' },
    md: { box: 46, text: 'text-2xl font-black tracking-tight', sub: 'text-xs', full: 'h-12' },
    lg: { box: 58, text: 'text-3xl font-black tracking-tight', sub: 'text-sm', full: 'h-16' },
    xl: { box: 72, text: 'text-4xl font-black tracking-tighter', sub: 'text-base', full: 'h-20' },
    hero: { box: 96, text: 'text-5xl font-black tracking-tighter', sub: 'text-lg', full: 'h-28' },
  };

  const { box, text, sub, full } = sizeMap[size] || sizeMap.md;

  // Complete Logo Variant (Mascot + Cresco-CN Typography Graphic)
  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center select-none group cursor-pointer ${className}`}>
        <img
          src="/assets/brand/cresco-logo-full.png"
          alt="Cresco-CN Complete Logo"
          className={`${full} w-auto object-contain filter drop-shadow-[0_2px_10px_rgba(6,182,212,0.25)] group-hover:scale-105 transition-transform duration-200`}
        />
      </div>
    );
  }

  // Modern Cresco Octopus Mascot Brand Mark
  const markSvg = (
    <div 
      className="relative shrink-0 flex items-center justify-center rounded-2xl overflow-hidden hover:scale-108 active:scale-95 transition-transform duration-200 cursor-pointer"
      style={{ width: box, height: box }}
    >
      <img
        src="/assets/mascot/cresco-mascot.png"
        alt="Cresco CN Octopus Mascot"
        className="w-full h-full object-contain relative z-10 p-0.5 filter drop-shadow-[0_2px_8px_rgba(6,182,212,0.35)]"
      />
    </div>
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center ${className}`}>{markSvg}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {markSvg}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight font-headline ${text}`}>
            <span className="text-[#172033] dark:text-[#F9FAFB]">CRESCO</span>{' '}
            <span className="text-[#06B6D4] dark:text-[#22D3EE] font-black">CN</span>
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

export const CrescoCompleteLogo: React.FC<Omit<NetQuestLogoProps, 'variant'>> = (props) => (
  <NetQuestLogo {...props} variant="full" />
);

export const CrescoCNLogo = NetQuestLogo;
export const CrescoLogo = NetQuestLogo;
export default NetQuestLogo;
