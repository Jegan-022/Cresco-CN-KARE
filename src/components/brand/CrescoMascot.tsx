import React from 'react';

export type MascotPose =
  | 'front'
  | 'side'
  | 'thinking'
  | 'correct'
  | 'wrong'
  | 'levelup'
  | 'achievement'
  | 'streak'
  | 'challenge'
  | 'boss'
  | 'problem-solving'
  | 'connected'
  | 'disconnected'
  | 'security'
  | 'coding-lab'
  | 'exam-mode'
  | 'exam-done'
  | 'exam-excellent';

export type MascotAnimation = 'float' | 'glow' | 'bounce' | 'sway' | 'none';
export type MascotSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';

interface CrescoMascotProps {
  pose?: MascotPose;
  size?: MascotSize;
  animation?: MascotAnimation;
  withGlow?: boolean;
  badge?: string;
  speechText?: string;
  speechPosition?: 'top' | 'right' | 'left';
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  alt?: string;
}

const POSE_IMAGE_MAP: Record<MascotPose, string> = {
  front: '/assets/mascot/cresco-mascot.png',
  side: '/assets/mascot/mascot-side.png',
  thinking: '/assets/mascot/mascot-thinking.png',
  correct: '/assets/mascot/mascot-correct.png',
  wrong: '/assets/mascot/mascot-wrong.png',
  levelup: '/assets/mascot/mascot-levelup.png',
  achievement: '/assets/mascot/mascot-achievement.png',
  streak: '/assets/mascot/mascot-streak.png',
  challenge: '/assets/mascot/mascot-challenge.png',
  boss: '/assets/mascot/mascot-boss.png',
  'problem-solving': '/assets/mascot/mascot-problem-solving.png',
  connected: '/assets/mascot/mascot-connected.png',
  disconnected: '/assets/mascot/mascot-disconnected.png',
  security: '/assets/mascot/mascot-security.png',
  'coding-lab': '/assets/mascot/mascot-coding-lab.png',
  'exam-mode': '/assets/mascot/mascot-exam-mode.png',
  'exam-done': '/assets/mascot/mascot-exam-done.png',
  'exam-excellent': '/assets/mascot/mascot-exam-excellent.png',
};

const SIZE_CLASSES: Record<MascotSize, { container: string; img: string }> = {
  xs: { container: 'w-7 h-7', img: 'max-w-7 max-h-7' },
  sm: { container: 'w-10 h-10', img: 'max-w-10 max-h-10' },
  md: { container: 'w-14 h-14', img: 'max-w-14 max-h-14' },
  lg: { container: 'w-20 h-20', img: 'max-w-20 max-h-20' },
  xl: { container: 'w-28 h-28', img: 'max-w-28 max-h-28' },
  '2xl': { container: 'w-36 h-36', img: 'max-w-36 max-h-36' },
  hero: { container: 'w-48 sm:w-56 h-48 sm:h-56', img: 'max-w-full max-h-full' },
};

export const CrescoMascot: React.FC<CrescoMascotProps> = ({
  pose = 'front',
  size = 'md',
  animation = 'float',
  withGlow = false,
  badge,
  speechText,
  speechPosition = 'top',
  className = '',
  interactive = true,
  onClick,
  alt = 'Cresco CN Network Octopus Mascot',
}) => {
  const imageSrc = POSE_IMAGE_MAP[pose] || POSE_IMAGE_MAP.front;
  const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const animationClass = (() => {
    switch (animation) {
      case 'float':
        return 'animate-octo-float';
      case 'glow':
        return 'animate-octo-glow';
      case 'bounce':
        return 'animate-octo-bounce';
      case 'sway':
        return 'animate-tentacle-sway';
      case 'none':
      default:
        return '';
    }
  })();

  const glowStyle = withGlow
    ? 'filter drop-shadow(0 0 16px rgba(6, 182, 212, 0.45)) drop-shadow(0 0 8px rgba(244, 63, 94, 0.3))'
    : '';

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
      onClick={onClick}
    >
      {/* Optional Speech Bubble */}
      {speechText && (
        <div
          className={`absolute z-20 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-[#1f2937]/95 backdrop-blur-md border border-cyan-500/30 text-slate-800 dark:text-slate-100 font-headline font-bold text-xs shadow-lg shadow-cyan-500/10 whitespace-nowrap animate-scaleUp pointer-events-none ${
            speechPosition === 'top'
              ? '-top-10 left-1/2 -translate-x-1/2'
              : speechPosition === 'right'
              ? 'top-1/2 -translate-y-1/2 left-full ml-2'
              : 'top-1/2 -translate-y-1/2 right-full mr-2'
          }`}
        >
          <span>{speechText}</span>
          {/* Small Speech Pointer Triangle */}
          {speechPosition === 'top' && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-[#1f2937] border-r border-b border-cyan-500/30 transform rotate-45" />
          )}
          {speechPosition === 'left' && (
            <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-white dark:bg-[#1f2937] border-r border-t border-cyan-500/30 transform rotate-45" />
          )}
          {speechPosition === 'right' && (
            <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-white dark:bg-[#1f2937] border-l border-b border-cyan-500/30 transform rotate-45" />
          )}
        </div>
      )}

      {/* Mascot Graphic with Motion Layer */}
      <div
        className={`${sizeConfig.container} flex items-center justify-center ${animationClass} ${
          interactive ? 'transition-transform duration-300 hover:scale-108 active:scale-95 cursor-pointer' : ''
        }`}
      >
        <img
          src={imageSrc}
          alt={alt}
          className={`${sizeConfig.img} object-contain ${glowStyle} transition-all duration-300`}
          loading="eager"
        />
      </div>

      {/* Optional Badge Below Mascot */}
      {badge && (
        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-700 dark:text-cyan-300 tracking-wider uppercase shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-packet-beacon" />
          <span>{badge}</span>
        </div>
      )}
    </div>
  );
};
