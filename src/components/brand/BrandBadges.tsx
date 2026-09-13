import React from 'react';

export type BadgeType = 
  | 'network_explorer'
  | 'routing_master'
  | 'subnetting_pro'
  | 'tcp_specialist'
  | 'osi_master'
  | 'quiz_ace';

interface BrandBadgeProps {
  badge: BadgeType | string;
  size?: 'sm' | 'md' | 'lg';
  isUnlocked?: boolean;
  className?: string;
  showTitle?: boolean;
}

interface BadgeMetadata {
  title: string;
  subtitle: string;
  primaryColor: string;
  accentColor: string;
  iconPath: React.ReactNode;
}

export const BADGE_DETAILS: Record<BadgeType, BadgeMetadata> = {
  network_explorer: {
    title: 'Network Explorer',
    subtitle: 'Completed First 5 Modules',
    primaryColor: '#2563EB',
    accentColor: '#93C5FD',
    iconPath: (
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
        fill="currentColor"
      />
    ),
  },
  routing_master: {
    title: 'Routing Master',
    subtitle: 'Mastered Distance Vector & Link State',
    primaryColor: '#4F46E5',
    accentColor: '#C7D2FE',
    iconPath: (
      <path
        d="M19 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.67-1.5-1.5s.68-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm12-15v4H5V3.5h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 7c-.82 0-1.5-.67-1.5-1.5S6.18 4 7 4s1.5.67 1.5 1.5S7.82 7 7 7z"
        fill="currentColor"
      />
    ),
  },
  subnetting_pro: {
    title: 'Subnetting Pro',
    subtitle: 'Flawless IPv4 & CIDR Calculations',
    primaryColor: '#16A34A',
    accentColor: '#86EFAC',
    iconPath: (
      <path
        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
        fill="currentColor"
      />
    ),
  },
  tcp_specialist: {
    title: 'TCP Specialist',
    subtitle: 'Handshake & Flow Control Expert',
    primaryColor: '#0891B2',
    accentColor: '#A5F3FC',
    iconPath: (
      <path
        d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
        fill="currentColor"
      />
    ),
  },
  osi_master: {
    title: 'OSI Master',
    subtitle: 'Completed All 7-Layer Challenges',
    primaryColor: '#7C3AED',
    accentColor: '#DDD6FE',
    iconPath: (
      <path
        d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 10.9L3.74 8 12 4.26 20.26 8 12 12.9zM2.5 10.75l2.25 1.02L12 15.14l7.25-3.37 2.25-1.02V15l-9.5 4.43L2.5 15v-4.25zm0 4.25l2.25 1.02L12 19.39l7.25-3.37 2.25-1.02V18l-9.5 4.43L2.5 18v-3z"
        fill="currentColor"
      />
    ),
  },
  quiz_ace: {
    title: 'Quiz Ace',
    subtitle: 'Passed 3 Unit Challenges with >= 90%',
    primaryColor: '#D97706',
    accentColor: '#FDE68A',
    iconPath: (
      <path
        d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"
        fill="currentColor"
      />
    ),
  },
};

export const BrandBadge: React.FC<BrandBadgeProps> = ({
  badge,
  size = 'md',
  isUnlocked = true,
  className = '',
  showTitle = false,
}) => {
  const normKey = (badge.toLowerCase().replace(/[^a-z0-9]/g, '_') as BadgeType);
  const info = BADGE_DETAILS[normKey] || BADGE_DETAILS.network_explorer;

  const sizeMap = {
    sm: { diameter: 32, iconSize: 16, titleSize: 'text-xs' },
    md: { diameter: 48, iconSize: 22, titleSize: 'text-sm' },
    lg: { diameter: 64, iconSize: 30, titleSize: 'text-base' },
  };

  const { diameter, iconSize, titleSize } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className={`relative flex items-center justify-center rounded-2xl border transition-all duration-300 ${
          isUnlocked
            ? 'shadow-sm hover:scale-105'
            : 'opacity-40 grayscale border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900'
        }`}
        style={{
          width: diameter,
          height: diameter,
          backgroundColor: isUnlocked ? `${info.primaryColor}15` : undefined,
          borderColor: isUnlocked ? `${info.primaryColor}40` : undefined,
          color: isUnlocked ? info.primaryColor : '#94A3B8',
        }}
        title={`${info.title} - ${info.subtitle} (${isUnlocked ? 'Unlocked' : 'Locked'})`}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {info.iconPath}
        </svg>

        {isUnlocked && (
          <span
            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center"
            style={{ backgroundColor: info.primaryColor }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </span>
        )}
      </div>

      {showTitle && (
        <div className="flex flex-col">
          <span className={`font-bold text-slate-900 dark:text-slate-100 leading-snug ${titleSize}`}>
            {info.title}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {info.subtitle}
          </span>
        </div>
      )}
    </div>
  );
};
