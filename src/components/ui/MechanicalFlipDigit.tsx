import React, { useEffect, useState, useRef } from 'react';

interface MechanicalFlipDigitProps {
  value: string;
  fontSize?: string;
  tileColor?: string;
  textColor?: string;
  tileRadius?: number;
}

export const MechanicalFlipDigit: React.FC<MechanicalFlipDigitProps> = React.memo(({
  value,
  fontSize = 'clamp(22px, 3.2vw, 42px)',
  tileColor = '#12131C',
  textColor = '#FFFFFF',
  tileRadius = 8,
}) => {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (value !== current) {
      setPrevious(current);
      setCurrent(value);
      setIsFlipping(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setIsFlipping(false);
      }, 350);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, current]);

  return (
    <div
      className="relative select-none overflow-hidden font-mono font-bold inline-block"
      style={{
        width: '0.82em',
        height: '1.22em',
        fontSize,
        borderRadius: `${tileRadius}px`,
        backgroundColor: tileColor,
        color: textColor,
        boxShadow: '0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.14)',
        perspective: '600px',
        transform: 'translateZ(0)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* 1. Upper Static Half (Shows current value) */}
      <div
        className="absolute top-0 left-0 w-full h-[50%] overflow-hidden border-b border-black/50"
        style={{ backgroundColor: tileColor }}
      >
        <div className="absolute top-0 left-0 w-full h-[200%] flex items-center justify-center leading-none">
          <span>{current}</span>
        </div>
      </div>

      {/* 2. Lower Static Half (Shows previous while flipping, current when settled) */}
      <div
        className="absolute bottom-0 left-0 w-full h-[50%] overflow-hidden"
        style={{ backgroundColor: tileColor }}
      >
        <div className="absolute bottom-0 left-0 w-full h-[200%] flex items-center justify-center leading-none">
          <span>{isFlipping ? previous : current}</span>
        </div>
      </div>

      {/* 3. Dynamic Animated Flap (Flips down when digit changes) */}
      {isFlipping && (
        <>
          {/* Top Flap folding down (shows previous top half) */}
          <div
            className="absolute top-0 left-0 w-full h-[50%] overflow-hidden border-b border-black/50 origin-bottom animate-flip-top z-10"
            style={{
              backgroundColor: tileColor,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div className="absolute top-0 left-0 w-full h-[200%] flex items-center justify-center leading-none">
              <span>{previous}</span>
            </div>
          </div>

          {/* Bottom Flap unfolding (shows current bottom half) */}
          <div
            className="absolute bottom-0 left-0 w-full h-[50%] overflow-hidden origin-top animate-flip-bottom z-10"
            style={{
              backgroundColor: tileColor,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div className="absolute bottom-0 left-0 w-full h-[200%] flex items-center justify-center leading-none">
              <span>{current}</span>
            </div>
          </div>
        </>
      )}

      {/* Center Horizontal Divider Slit */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-[0.5px] h-[1px] bg-black/80 shadow-[0_1px_0_rgba(255,255,255,0.1)] z-20" />
    </div>
  );
});

export const MechanicalFlipGroup: React.FC<{
  digits: string;
  fontSize?: string;
  tileColor?: string;
  textColor?: string;
  gap?: number;
}> = React.memo(({
  digits,
  fontSize = 'clamp(22px, 3.2vw, 42px)',
  tileColor = '#12131C',
  textColor = '#FFFFFF',
  gap = 5,
}) => {
  const safeDigits = String(digits ?? '00').padStart(2, '0');
  const chars = safeDigits.split('');
  return (
    <div className="flex items-center" style={{ gap: `${gap}px` }}>
      {chars.map((char, index) => (
        <MechanicalFlipDigit
          key={index}
          value={char || '0'}
          fontSize={fontSize}
          tileColor={tileColor}
          textColor={textColor}
        />
      ))}
    </div>
  );
});

export default MechanicalFlipGroup;
