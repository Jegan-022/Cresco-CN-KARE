import React, { useState, useEffect } from 'react';

interface StudentIntroOverlayProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const StudentIntroOverlay: React.FC<StudentIntroOverlayProps> = ({
  onComplete,
  minDurationMs = 2100,
}) => {
  const [fading, setFading] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    // Attempt fullscreen starting immediately, with user gesture fallback
    const enterFullscreen = () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (err) {}
    };
    enterFullscreen();

    const onGesture = () => enterFullscreen();
    window.addEventListener('click', onGesture, { once: true, capture: true });
    window.addEventListener('keydown', onGesture, { once: true, capture: true });

    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setRemoved(true);
        onComplete?.();
      }, 400);
    }, minDurationMs);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', onGesture, { capture: true });
      window.removeEventListener('keydown', onGesture, { capture: true });
    };
  }, [minDurationMs, onComplete]);

  const handleSkip = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFading(true);
    setTimeout(() => {
      setRemoved(true);
      onComplete?.();
    }, 150);
  };

  if (removed) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        background: '#020a07',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.4s ease-out',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <iframe
        src="/student-intro.html"
        title="Cresco CN Student Portal Intro"
        allow="fullscreen; autoplay; clipboard-write"
        allowFullScreen={true}
        style={{
          width: '100vw',
          height: '100vh',
          border: 'none',
          display: 'block',
          background: 'transparent',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'auto',
        }}
      />
      <button
        onClick={handleSkip}
        type="button"
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          zIndex: 100000,
          background: 'rgba(2, 10, 7, 0.75)',
          color: '#5dffb0',
          border: '1px solid rgba(93, 255, 176, 0.35)',
          borderRadius: '9999px',
          padding: '6px 16px',
          fontSize: '12px',
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontWeight: 500,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(93, 255, 176, 0.2)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#5dffb0';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(2, 10, 7, 0.75)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(93, 255, 176, 0.35)';
        }}
      >
        Skip Intro &rarr;
      </button>
    </div>
  );
};
