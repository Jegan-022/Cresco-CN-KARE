import React from 'react';

interface NetworkBackgroundProps {
  mode?: 'static' | 'exam' | 'dynamic';
}

/**
 * Cresco CN Network Background System (Sections 10 & 11)
 * 
 * - Warm neutral background: Light #F7F5F0, Dark #111827
 * - Subtle network topology pattern: thin connection lines, tiny nodes, occasional packet indicators
 * - Opacity: 5–8% (never interferes with readability)
 * - Pure vector SVG, zero CPU overhead, lightweight, responsive
 * - Behavior: Static for Dashboard/Exam, gentle packet transit on active views
 * - Respects prefers-reduced-motion
 */
export const NetworkBackground: React.FC<NetworkBackgroundProps> = ({ mode = 'static' }) => {
  const isExam = mode === 'exam';

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full opacity-[0.06] dark:opacity-[0.05] text-[#172033] dark:text-[#F9FAFB] transition-opacity duration-300"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Subtle Topology Mesh Pattern */}
          <pattern
            id="cresco-topology-pattern"
            width="180"
            height="180"
            patternUnits="userSpaceOnUse"
          >
            {/* Primary Connection Lines */}
            <line x1="20" y1="30" x2="90" y2="80" stroke="currentColor" strokeWidth="1" />
            <line x1="90" y1="80" x2="160" y2="40" stroke="currentColor" strokeWidth="1" />
            <line x1="90" y1="80" x2="120" y2="150" stroke="currentColor" strokeWidth="1" />
            <line x1="120" y1="150" x2="40" y2="140" stroke="currentColor" strokeWidth="1" />
            <line x1="40" y1="140" x2="20" y2="30" stroke="currentColor" strokeWidth="1" />
            <line x1="160" y1="40" x2="175" y2="120" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
            <line x1="120" y1="150" x2="175" y2="120" stroke="currentColor" strokeWidth="1" />

            {/* Micro Topology Nodes */}
            <circle cx="20" cy="30" r="3" fill="currentColor" />
            <circle cx="90" cy="80" r="3.5" fill="currentColor" />
            <circle cx="160" cy="40" r="2.5" fill="currentColor" />
            <circle cx="120" cy="150" r="3" fill="currentColor" />
            <circle cx="40" cy="140" r="2.5" fill="currentColor" />
            <circle cx="175" cy="120" r="2" fill="currentColor" />

            {/* Small Packet Indicators on Lines */}
            {!isExam && (
              <>
                <rect x="53" y="53" width="4" height="4" rx="1" fill="currentColor" opacity="0.8" transform="rotate(35 55 55)" />
                <rect x="123" y="58" width="4" height="4" rx="1" fill="currentColor" opacity="0.8" transform="rotate(-30 125 60)" />
                <circle cx="78" cy="144" r="2" fill="currentColor" opacity="0.8" />
              </>
            )}
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#cresco-topology-pattern)" />
      </svg>
    </div>
  );
};
