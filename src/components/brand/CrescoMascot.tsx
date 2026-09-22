import React, { useState, useEffect, useRef } from 'react';

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

// Expression configs for each pose — controls eyes, mouth, tentacle energy, particles
interface ExpressionConfig {
  eyeStyle: 'normal' | 'happy' | 'sad' | 'determined' | 'thinking' | 'star' | 'wink';
  mouthStyle: 'smile' | 'grin' | 'sad' | 'open' | 'o' | 'determined' | 'neutral';
  tentacleEnergy: 'calm' | 'active' | 'excited';
  bodyColor: string;
  accentColor: string;
  hasSparkles: boolean;
  accessory?: 'trophy' | 'shield' | 'cable' | 'book' | 'rocket' | 'flame' | 'graduation' | 'medal' | 'laptop' | 'pencil';
}

const POSE_EXPRESSIONS: Record<MascotPose, ExpressionConfig> = {
  front:           { eyeStyle: 'normal',     mouthStyle: 'smile',      tentacleEnergy: 'calm',    bodyColor: '#06B6D4', accentColor: '#0891B2', hasSparkles: false },
  side:            { eyeStyle: 'normal',     mouthStyle: 'smile',      tentacleEnergy: 'calm',    bodyColor: '#06B6D4', accentColor: '#0891B2', hasSparkles: false },
  thinking:        { eyeStyle: 'thinking',   mouthStyle: 'o',          tentacleEnergy: 'calm',    bodyColor: '#06B6D4', accentColor: '#0891B2', hasSparkles: false },
  correct:         { eyeStyle: 'happy',      mouthStyle: 'grin',       tentacleEnergy: 'excited', bodyColor: '#10B981', accentColor: '#059669', hasSparkles: true },
  wrong:           { eyeStyle: 'sad',        mouthStyle: 'sad',        tentacleEnergy: 'calm',    bodyColor: '#06B6D4', accentColor: '#0891B2', hasSparkles: false },
  levelup:         { eyeStyle: 'star',       mouthStyle: 'grin',       tentacleEnergy: 'excited', bodyColor: '#F59E0B', accentColor: '#D97706', hasSparkles: true },
  achievement:     { eyeStyle: 'star',       mouthStyle: 'grin',       tentacleEnergy: 'excited', bodyColor: '#F59E0B', accentColor: '#D97706', hasSparkles: true, accessory: 'trophy' },
  streak:          { eyeStyle: 'determined', mouthStyle: 'determined', tentacleEnergy: 'excited', bodyColor: '#EF4444', accentColor: '#DC2626', hasSparkles: true, accessory: 'rocket' },
  challenge:       { eyeStyle: 'determined', mouthStyle: 'determined', tentacleEnergy: 'active',  bodyColor: '#EF4444', accentColor: '#DC2626', hasSparkles: true, accessory: 'flame' },
  boss:            { eyeStyle: 'determined', mouthStyle: 'determined', tentacleEnergy: 'active',  bodyColor: '#7C3AED', accentColor: '#6D28D9', hasSparkles: false },
  'problem-solving': { eyeStyle: 'thinking', mouthStyle: 'neutral',   tentacleEnergy: 'active',  bodyColor: '#06B6D4', accentColor: '#0891B2', hasSparkles: false },
  connected:       { eyeStyle: 'happy',      mouthStyle: 'grin',       tentacleEnergy: 'active',  bodyColor: '#10B981', accentColor: '#059669', hasSparkles: false, accessory: 'cable' },
  disconnected:    { eyeStyle: 'sad',        mouthStyle: 'sad',        tentacleEnergy: 'calm',    bodyColor: '#64748B', accentColor: '#475569', hasSparkles: false },
  security:        { eyeStyle: 'determined', mouthStyle: 'neutral',    tentacleEnergy: 'calm',    bodyColor: '#06B6D4', accentColor: '#0891B2', hasSparkles: false, accessory: 'shield' },
  'coding-lab':    { eyeStyle: 'normal',     mouthStyle: 'smile',      tentacleEnergy: 'active',  bodyColor: '#06B6D4', accentColor: '#0891B2', hasSparkles: false, accessory: 'laptop' },
  'exam-mode':     { eyeStyle: 'determined', mouthStyle: 'neutral',    tentacleEnergy: 'calm',    bodyColor: '#06B6D4', accentColor: '#0891B2', hasSparkles: false, accessory: 'pencil' },
  'exam-done':     { eyeStyle: 'happy',      mouthStyle: 'grin',       tentacleEnergy: 'excited', bodyColor: '#10B981', accentColor: '#059669', hasSparkles: true, accessory: 'graduation' },
  'exam-excellent': { eyeStyle: 'star',      mouthStyle: 'grin',       tentacleEnergy: 'excited', bodyColor: '#F59E0B', accentColor: '#D97706', hasSparkles: true, accessory: 'medal' },
};

const SIZE_PX: Record<MascotSize, number> = {
  xs: 28,
  sm: 40,
  md: 56,
  lg: 80,
  xl: 112,
  '2xl': 144,
  hero: 200,
};

// Render inline SVG eyes based on expression
function renderEyes(style: ExpressionConfig['eyeStyle'], isBlinking: boolean) {
  if (isBlinking) {
    // Closed blink — horizontal lines
    return (
      <>
        <line x1="33" y1="38" x2="41" y2="38" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="53" y1="38" x2="61" y2="38" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      </>
    );
  }

  switch (style) {
    case 'happy':
      return (
        <>
          <path d="M 33 39 Q 37 34 41 39" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 53 39 Q 57 34 61 39" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      );
    case 'sad':
      return (
        <>
          <ellipse cx="37" cy="37" rx="4" ry="4.5" fill="white" />
          <ellipse cx="37" cy="38" rx="2.5" ry="3" fill="#0F172A" />
          <ellipse cx="57" cy="37" rx="4" ry="4.5" fill="white" />
          <ellipse cx="57" cy="38" rx="2.5" ry="3" fill="#0F172A" />
          {/* Teardrop */}
          <ellipse cx="43" cy="43" rx="1.5" ry="2" fill="#38BDF8" opacity="0.7">
            <animateTransform attributeName="transform" type="translate" values="0,0;0,3;0,6" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.7;0" dur="2s" repeatCount="indefinite" />
          </ellipse>
        </>
      );
    case 'thinking':
      return (
        <>
          {/* Eyes looking up-right */}
          <ellipse cx="37" cy="36" rx="4" ry="4.5" fill="white" />
          <ellipse cx="38.5" cy="34.5" rx="2.5" ry="3" fill="#0F172A" />
          <ellipse cx="57" cy="36" rx="4" ry="4.5" fill="white" />
          <ellipse cx="58.5" cy="34.5" rx="2.5" ry="3" fill="#0F172A" />
          {/* Thinking dots */}
          <circle cx="68" cy="28" r="1.5" fill="#94A3B8" opacity="0.6">
            <animate attributeName="opacity" values="0;0.6;0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="72" cy="24" r="2" fill="#94A3B8" opacity="0.4">
            <animate attributeName="opacity" values="0;0.4;0" dur="2s" repeatCount="indefinite" begin="0.3s" />
          </circle>
          <circle cx="77" cy="20" r="2.5" fill="#94A3B8" opacity="0.3">
            <animate attributeName="opacity" values="0;0.3;0" dur="2s" repeatCount="indefinite" begin="0.6s" />
          </circle>
        </>
      );
    case 'determined':
      return (
        <>
          {/* Narrowed determined eyes */}
          <ellipse cx="37" cy="37" rx="4" ry="3" fill="white" />
          <ellipse cx="37" cy="37.5" rx="2.5" ry="2.5" fill="#0F172A" />
          <ellipse cx="57" cy="37" rx="4" ry="3" fill="white" />
          <ellipse cx="57" cy="37.5" rx="2.5" ry="2.5" fill="#0F172A" />
          {/* Eyebrow furrow */}
          <line x1="32" y1="31" x2="42" y2="32.5" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
          <line x1="62" y1="32.5" x2="52" y2="31" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case 'star':
      return (
        <>
          {/* Star eyes */}
          <polygon points="37,33 38.5,36 42,36.5 39.5,38.5 40,42 37,40 34,42 34.5,38.5 32,36.5 35.5,36" fill="#FBBF24" stroke="#F59E0B" strokeWidth="0.5" />
          <polygon points="57,33 58.5,36 62,36.5 59.5,38.5 60,42 57,40 54,42 54.5,38.5 52,36.5 55.5,36" fill="#FBBF24" stroke="#F59E0B" strokeWidth="0.5" />
        </>
      );
    case 'wink':
      return (
        <>
          <ellipse cx="37" cy="37" rx="4" ry="4.5" fill="white" />
          <ellipse cx="37" cy="37.5" rx="2.5" ry="3" fill="#0F172A" />
          <ellipse cx="36" cy="36" rx="1" ry="1" fill="white" />
          {/* Winking right eye */}
          <path d="M 53 38 Q 57 34 61 38" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      );
    default: // normal
      return (
        <>
          <ellipse cx="37" cy="37" rx="4" ry="4.5" fill="white" />
          <ellipse cx="37" cy="37.5" rx="2.5" ry="3" fill="#0F172A" />
          <ellipse cx="36" cy="36" rx="1" ry="1" fill="white" /> {/* Left eye shine */}
          <ellipse cx="57" cy="37" rx="4" ry="4.5" fill="white" />
          <ellipse cx="57" cy="37.5" rx="2.5" ry="3" fill="#0F172A" />
          <ellipse cx="56" cy="36" rx="1" ry="1" fill="white" /> {/* Right eye shine */}
        </>
      );
  }
}

// Render mouth based on expression
function renderMouth(style: ExpressionConfig['mouthStyle']) {
  switch (style) {
    case 'grin':
      return <path d="M 40 48 Q 47 56 54 48" stroke="#0F172A" strokeWidth="2" fill="#FF6B6B" strokeLinecap="round" />;
    case 'sad':
      return <path d="M 40 50 Q 47 45 54 50" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />;
    case 'open':
      return <ellipse cx="47" cy="49" rx="4" ry="3.5" fill="#0F172A" />;
    case 'o':
      return <ellipse cx="47" cy="49" rx="3" ry="3" fill="#0F172A" />;
    case 'determined':
      return <line x1="41" y1="49" x2="53" y2="49" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />;
    case 'neutral':
      return <line x1="42" y1="49" x2="52" y2="49" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />;
    default: // smile
      return <path d="M 41 47 Q 47 53 53 47" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />;
  }
}

// Render cheek blush marks
function renderCheeks(eyeStyle: ExpressionConfig['eyeStyle']) {
  if (eyeStyle === 'sad' || eyeStyle === 'determined') return null;
  return (
    <>
      <ellipse cx="29" cy="43" rx="4" ry="2.5" fill="#FB7185" opacity="0.25" />
      <ellipse cx="65" cy="43" rx="4" ry="2.5" fill="#FB7185" opacity="0.25" />
    </>
  );
}

// Render accessory on a tentacle or head
function renderAccessory(accessory?: ExpressionConfig['accessory']) {
  if (!accessory) return null;
  switch (accessory) {
    case 'trophy':
      return (
        <g transform="translate(68, 20) scale(0.5)">
          <rect x="0" y="14" width="16" height="4" rx="1" fill="#D97706" />
          <rect x="4" y="18" width="8" height="3" rx="1" fill="#B45309" />
          <path d="M 2 14 L 2 6 Q 2 0 8 0 Q 14 0 14 6 L 14 14" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
          <rect x="0" y="4" width="4" height="6" rx="2" fill="#FBBF24" opacity="0.7" />
          <rect x="12" y="4" width="4" height="6" rx="2" fill="#FBBF24" opacity="0.7" />
        </g>
      );
    case 'shield':
      return (
        <g transform="translate(66, 24) scale(0.45)">
          <path d="M 10 0 L 20 4 L 20 14 Q 20 22 10 28 Q 0 22 0 14 L 0 4 Z" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1.5" />
          <path d="M 10 6 L 14 10 L 10 14 L 6 10 Z" fill="white" opacity="0.8" />
        </g>
      );
    case 'flame':
      return (
        <g transform="translate(40, 6)">
          <path d="M 7 0 Q 12 6 9 12 Q 14 8 11 2 Q 16 10 10 16 Q 4 10 7 0 Z" fill="#EF4444" opacity="0.9">
            <animate attributeName="d" values="M 7 0 Q 12 6 9 12 Q 14 8 11 2 Q 16 10 10 16 Q 4 10 7 0 Z;M 7 -1 Q 13 5 8 11 Q 15 7 12 1 Q 17 9 10 15 Q 3 9 7 -1 Z;M 7 0 Q 12 6 9 12 Q 14 8 11 2 Q 16 10 10 16 Q 4 10 7 0 Z" dur="0.6s" repeatCount="indefinite" />
          </path>
          <path d="M 8 4 Q 11 8 9 12 Q 12 9 10 6 Q 13 10 10 14 Q 7 10 8 4 Z" fill="#FBBF24" opacity="0.8">
            <animate attributeName="d" values="M 8 4 Q 11 8 9 12 Q 12 9 10 6 Q 13 10 10 14 Q 7 10 8 4 Z;M 8 3 Q 12 7 8 11 Q 13 8 11 5 Q 14 9 10 13 Q 6 9 8 3 Z;M 8 4 Q 11 8 9 12 Q 12 9 10 6 Q 13 10 10 14 Q 7 10 8 4 Z" dur="0.5s" repeatCount="indefinite" />
          </path>
        </g>
      );
    case 'graduation':
      return (
        <g transform="translate(30, 10)">
          {/* Graduation cap */}
          <polygon points="17,8 0,16 17,22 34,16" fill="#1E293B" />
          <rect x="14" y="4" width="6" height="6" fill="#1E293B" />
          <line x1="30" y1="16" x2="30" y2="24" stroke="#FBBF24" strokeWidth="1.5" />
          <circle cx="30" cy="25" r="2" fill="#FBBF24" />
        </g>
      );
    case 'medal':
      return (
        <g transform="translate(64, 30) scale(0.5)">
          <line x1="10" y1="0" x2="6" y2="12" stroke="#3B82F6" strokeWidth="3" />
          <line x1="10" y1="0" x2="14" y2="12" stroke="#EF4444" strokeWidth="3" />
          <circle cx="10" cy="18" r="8" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          <text x="10" y="21" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#92400E">★</text>
        </g>
      );
    default:
      return null;
  }
}

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
  const expr = POSE_EXPRESSIONS[pose] || POSE_EXPRESSIONS.front;
  const px = SIZE_PX[size] || SIZE_PX.md;
  const [isBlinking, setIsBlinking] = useState(false);
  const blinkTimer = useRef<any>(null);

  // Idle eye blink loop
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 3000; // 2.5 – 5.5s
      blinkTimer.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 150);
      }, delay);
    };
    scheduleBlink();
    return () => {
      if (blinkTimer.current) clearTimeout(blinkTimer.current);
    };
  }, []);

  const animationClass = (() => {
    switch (animation) {
      case 'float': return 'mascot-anim-float';
      case 'glow': return 'mascot-anim-glow';
      case 'bounce': return 'mascot-anim-bounce';
      case 'sway': return 'mascot-anim-sway';
      default: return '';
    }
  })();

  const tentacleClass = (() => {
    switch (expr.tentacleEnergy) {
      case 'excited': return 'mascot-tentacles-excited';
      case 'active': return 'mascot-tentacles-active';
      default: return 'mascot-tentacles-calm';
    }
  })();

  return (
    <div
      className={`mascot-identity-root ${className}`}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={alt}
      style={{ width: px, height: px + (badge ? 16 : 0) + (speechText ? 20 : 0) }}
    >
      {/* Speech Bubble */}
      {speechText && (
        <div
          className={`mascot-speech-bubble ${
            speechPosition === 'top' ? 'mascot-speech-top'
            : speechPosition === 'right' ? 'mascot-speech-right'
            : 'mascot-speech-left'
          }`}
        >
          <span>{speechText}</span>
        </div>
      )}

      {/* Ambient Glow Ring */}
      {withGlow && (
        <div
          className="mascot-glow-ring"
          style={{
            background: `radial-gradient(circle, ${expr.bodyColor}40 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Main SVG Character */}
      <svg
        viewBox="0 0 94 94"
        width={px}
        height={px}
        className={`mascot-svg ${animationClass} ${interactive ? 'mascot-interactive' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Body gradient */}
          <radialGradient id={`mascot-body-grad-${pose}`} cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor={expr.bodyColor} stopOpacity="1" />
            <stop offset="100%" stopColor={expr.accentColor} stopOpacity="1" />
          </radialGradient>
          {/* Belly highlight */}
          <radialGradient id={`mascot-belly-${pose}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.25" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* === TENTACLES (4 pairs, CSS animated) === */}
        <g className={tentacleClass}>
          {/* Back tentacles (drawn first, behind body) */}
          <path className="mascot-tentacle mascot-t1" d="M 22 58 Q 14 68 10 80 Q 8 86 12 88" stroke={expr.accentColor} strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.7" />
          <path className="mascot-tentacle mascot-t2" d="M 72 58 Q 80 68 84 80 Q 86 86 82 88" stroke={expr.accentColor} strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.7" />

          {/* Front tentacles */}
          <path className="mascot-tentacle mascot-t3" d="M 28 60 Q 20 72 16 82 Q 14 88 18 90" stroke={expr.bodyColor} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path className="mascot-tentacle mascot-t4" d="M 66 60 Q 74 72 78 82 Q 80 88 76 90" stroke={expr.bodyColor} strokeWidth="5" fill="none" strokeLinecap="round" />

          {/* Inner tentacles */}
          <path className="mascot-tentacle mascot-t5" d="M 35 62 Q 30 74 28 84 Q 27 88 30 90" stroke={expr.bodyColor} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path className="mascot-tentacle mascot-t6" d="M 59 62 Q 64 74 66 84 Q 67 88 64 90" stroke={expr.bodyColor} strokeWidth="4.5" fill="none" strokeLinecap="round" />

          {/* Center tentacles */}
          <path className="mascot-tentacle mascot-t7" d="M 42 64 Q 40 76 39 86 Q 39 90 42 91" stroke={expr.bodyColor} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.85" />
          <path className="mascot-tentacle mascot-t8" d="M 52 64 Q 54 76 55 86 Q 55 90 52 91" stroke={expr.bodyColor} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.85" />
        </g>

        {/* Suction cups on tentacles (small dots) */}
        <g opacity="0.3">
          <circle cx="18" cy="78" r="1.2" fill="white" />
          <circle cx="16" cy="83" r="1" fill="white" />
          <circle cx="76" cy="78" r="1.2" fill="white" />
          <circle cx="78" cy="83" r="1" fill="white" />
          <circle cx="30" cy="80" r="1" fill="white" />
          <circle cx="64" cy="80" r="1" fill="white" />
        </g>

        {/* === BODY (main head/body dome) === */}
        <g className="mascot-body-group">
          <ellipse cx="47" cy="42" rx="26" ry="28"
            fill={`url(#mascot-body-grad-${pose})`}
            className="mascot-body-breathe"
          />
          {/* Belly highlight */}
          <ellipse cx="47" cy="46" rx="16" ry="14"
            fill={`url(#mascot-belly-${pose})`}
          />
          {/* Top head bump */}
          <ellipse cx="47" cy="18" rx="10" ry="6" fill={expr.bodyColor} opacity="0.6" />
        </g>

        {/* === FACE === */}
        <g>
          {/* Eyes */}
          {renderEyes(expr.eyeStyle, isBlinking)}

          {/* Cheeks */}
          {renderCheeks(expr.eyeStyle)}

          {/* Mouth */}
          {renderMouth(expr.mouthStyle)}
        </g>

        {/* === ACCESSORY === */}
        {renderAccessory(expr.accessory)}

        {/* === SPARKLE PARTICLES (for achievement/levelup states) === */}
        {expr.hasSparkles && (
          <g className="mascot-sparkles">
            <circle cx="15" cy="22" r="1.5" fill="#FBBF24">
              <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate" values="0,0;-3,-5;0,0" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="78" cy="18" r="1.8" fill="#F472B6">
              <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite" begin="0.4s" />
              <animateTransform attributeName="transform" type="translate" values="0,0;4,-4;0,0" dur="2.2s" repeatCount="indefinite" begin="0.4s" />
            </circle>
            <polygon points="82,30 83,32.5 85.5,32.5 83.5,34 84,36.5 82,35 80,36.5 80.5,34 78.5,32.5 81,32.5" fill="#FBBF24" opacity="0.8">
              <animate attributeName="opacity" values="0;0.8;0" dur="2.5s" repeatCount="indefinite" begin="0.8s" />
              <animateTransform attributeName="transform" type="translate" values="0,0;2,-6;0,0" dur="2.5s" repeatCount="indefinite" begin="0.8s" />
            </polygon>
            <polygon points="10,46 11,48 13,48 11.5,49.5 12,51.5 10,50.5 8,51.5 8.5,49.5 7,48 9,48" fill="#34D399" opacity="0.7">
              <animate attributeName="opacity" values="0;0.7;0" dur="2s" repeatCount="indefinite" begin="1.2s" />
              <animateTransform attributeName="transform" type="translate" values="0,0;-3,-4;0,0" dur="2s" repeatCount="indefinite" begin="1.2s" />
            </polygon>
          </g>
        )}
      </svg>

      {/* Badge Below */}
      {badge && (
        <div className="mascot-badge">
          <span className="mascot-badge-dot" />
          <span>{badge}</span>
        </div>
      )}
    </div>
  );
};
