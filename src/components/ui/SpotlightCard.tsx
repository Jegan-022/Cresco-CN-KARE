import React, { useRef } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(56, 189, 248, 0.14)',
  spotlightSize = 350,
  style = {},
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--spotlight-x', `${x}px`);
    el.style.setProperty('--spotlight-y', `${y}px`);
    el.style.setProperty('--spotlight-opacity', '1');
  };

  const handleMouseEnter = () => {
    cardRef.current?.style.setProperty('--spotlight-opacity', '1');
  };

  const handleMouseLeave = () => {
    cardRef.current?.style.setProperty('--spotlight-opacity', '0');
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12131C]/90 transition-colors duration-200 hover:border-white/20 will-change-[border-color] ${className}`}
      style={{
        transform: 'translateZ(0)',
        ...style,
      }}
      {...props}
    >
      {/* Zero-re-render GPU Spotlight Overlay */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-200 z-0"
        style={{
          opacity: 'var(--spotlight-opacity, 0)',
          background: `radial-gradient(${spotlightSize}px circle at var(--spotlight-x, -1000px) var(--spotlight-y, -1000px), ${spotlightColor}, transparent 70%)`,
        }}
      />
      {/* Card Content */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

export default SpotlightCard;
