import React from 'react';

interface NetworkIconProps {
  size?: number;
  className?: string;
  color?: string;
}

export const RouterIcon: React.FC<NetworkIconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="14" width="20" height="8" rx="2" />
    <path d="M6 18h.01" />
    <path d="M10 18h.01" />
    <path d="M14 18h.01" />
    <path d="M18 18h.01" />
    <path d="M7 10a5 5 0 0 1 10 0" />
    <path d="M4 7a9 9 0 0 1 16 0" />
    <circle cx="12" cy="14" r="1" fill={color} />
  </svg>
);

export const SwitchIcon: React.FC<NetworkIconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M7 10l2.5-2.5L12 10" />
    <path d="M17 14l-2.5 2.5L12 14" />
    <line x1="9.5" y1="7.5" x2="9.5" y2="12" />
    <line x1="14.5" y1="12" x2="14.5" y2="16.5" />
    <circle cx="5" cy="16" r="1" fill={color} />
    <circle cx="19" cy="8" r="1" fill={color} />
  </svg>
);

export const ServerNodeIcon: React.FC<NetworkIconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="8" rx="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
    <line x1="10" y1="6" x2="14" y2="6" />
    <line x1="10" y1="18" x2="14" y2="18" />
  </svg>
);

export const PacketIcon: React.FC<NetworkIconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

export const FirewallIcon: React.FC<NetworkIconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M8 11h8" />
    <path d="M12 7v8" />
    <path d="M10 15h4" />
  </svg>
);

export const DnsIcon: React.FC<NetworkIconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const TcpIcon: React.FC<NetworkIconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 7V4h16v3" />
    <path d="M12 4v16" />
    <path d="M8 20h8" />
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
);

export const UdpIcon: React.FC<NetworkIconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 4v10a7 7 0 0 0 14 0V4" />
    <line x1="5" y1="4" x2="19" y2="4" />
    <path d="M12 18v2" />
  </svg>
);
