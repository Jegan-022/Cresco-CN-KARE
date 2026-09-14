import React, { useState, useEffect } from 'react';
import { GuideMasterId, GuideMasterMood } from '../../data/guideMasterCharacters';

interface GuideMasterAvatarProps {
  characterId?: GuideMasterId;
  mood?: GuideMasterMood;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isSpeaking?: boolean;
  amplitude?: number; // 0 to 1
  className?: string;
  showGesture?: boolean;
}

export const GuideMasterAvatar: React.FC<GuideMasterAvatarProps> = ({
  characterId = 'anaya',
  mood = 'idle',
  size = 'md',
  isSpeaking = false,
  amplitude = 0,
  className = '',
  showGesture = true,
}) => {
  const sizePixels = {
    xs: 36,
    sm: 52,
    md: 96,
    lg: 144,
    xl: 200,
    '2xl': 280,
  }[size];

  // Natural spontaneous blinking: blinks for ~140ms every 3.8 to 5.2 seconds
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    let nextBlinkTimer: NodeJS.Timeout;

    const scheduleNextBlink = () => {
      const delay = Math.random() * 2000 + 3500;
      nextBlinkTimer = setTimeout(() => {
        setIsBlinking(true);
        blinkTimeout = setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 140);
      }, delay);
    };

    scheduleNextBlink();
    return () => {
      clearTimeout(nextBlinkTimer);
      clearTimeout(blinkTimeout);
    };
  }, []);

  // Dynamic mouth height calculated from speech amplitude
  const mouthOpen = isSpeaking ? Math.min(10, Math.max(2, Math.round(amplitude * 12))) : 0;

  // Emotional flags
  const isHappy = mood === 'happy' || mood === 'celebrating' || mood === 'excited';
  const isThinking = mood === 'thinking';
  const isListening = mood === 'listening';
  const isConcerned = mood === 'concerned';
  const isExplaining = mood === 'explaining' || isSpeaking;
  const isSurprised = mood === 'surprised';

  // Realistic human skin tones & shading
  const skinToneFair = '#F7DFD4';
  const skinToneWarm = '#F0CBB6';
  const skinToneGolden = '#E5B796';
  const skinToneDusk = '#9C684E';
  const blushTone = 'rgba(244, 114, 182, 0.28)';
  const shadowTone = 'rgba(15, 23, 42, 0.08)';

  // Helper to render realistic expressive eyes
  const renderEyes = (
    eyeColor: string, 
    leftX: number, 
    rightX: number, 
    y: number,
    eyeShape: 'round' | 'almond' | 'wide' = 'almond'
  ) => {
    if (isBlinking) {
      return (
        <g>
          {/* Eyelash line during blink */}
          <path d={`M ${leftX - 6} ${y} Q ${leftX} ${y + 2} ${leftX + 6} ${y}`} stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d={`M ${rightX - 6} ${y} Q ${rightX} ${y + 2} ${rightX + 6} ${y}`} stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </g>
      );
    }

    if (isHappy) {
      return (
        <g>
          <path d={`M ${leftX - 6} ${y + 1} Q ${leftX} ${y - 3} ${leftX + 6} ${y + 1}`} stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d={`M ${rightX - 6} ${y + 1} Q ${rightX} ${y - 3} ${rightX + 6} ${y + 1}`} stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </g>
      );
    }

    const lookOffset = isThinking ? -2 : 0;
    const lookOffsetY = isThinking ? -2 : 0;

    return (
      <g>
        {/* Eyebrows */}
        {isThinking ? (
          <>
            <path d={`M ${leftX - 7} ${y - 9} Q ${leftX} ${y - 12} ${leftX + 7} ${y - 8}`} stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d={`M ${rightX - 7} ${y - 7} Q ${rightX} ${y - 11} ${rightX + 7} ${y - 9}`} stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </>
        ) : isConcerned ? (
          <>
            <path d={`M ${leftX - 7} ${y - 7} Q ${leftX} ${y - 10} ${leftX + 7} ${y - 11}`} stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d={`M ${rightX - 7} ${y - 11} Q ${rightX} ${y - 10} ${rightX + 7} ${y - 7}`} stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <path d={`M ${leftX - 7} ${y - 8} Q ${leftX} ${y - 10} ${leftX + 7} ${y - 8}`} stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d={`M ${rightX - 7} ${y - 8} Q ${rightX} ${y - 10} ${rightX + 7} ${y - 8}`} stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </>
        )}

        {/* Eye Whites */}
        <ellipse cx={leftX} cy={y} rx={eyeShape === 'wide' ? 6.5 : 5.8} ry={eyeShape === 'wide' ? 5.2 : 4.5} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
        <ellipse cx={rightX} cy={y} rx={eyeShape === 'wide' ? 6.5 : 5.8} ry={eyeShape === 'wide' ? 5.2 : 4.5} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />

        {/* Irises */}
        <circle cx={leftX + lookOffset} cy={y + lookOffsetY} r={3.6} fill={eyeColor} />
        <circle cx={rightX + lookOffset} cy={y + lookOffsetY} r={3.6} fill={eyeColor} />

        {/* Pupils */}
        <circle cx={leftX + lookOffset} cy={y + lookOffsetY} r={2} fill="#0F172A" />
        <circle cx={rightX + lookOffset} cy={y + lookOffsetY} r={2} fill="#0F172A" />

        {/* Corneal Light Glints */}
        <circle cx={leftX + lookOffset - 1} cy={y + lookOffsetY - 1.2} r={1.1} fill="#FFFFFF" />
        <circle cx={rightX + lookOffset - 1} cy={y + lookOffsetY - 1.2} r={1.1} fill="#FFFFFF" />

        {/* Upper Eyelash Lines */}
        <path d={`M ${leftX - 6.5} ${y - 2.5} Q ${leftX} ${y - 5.5} ${leftX + 6.5} ${y - 2}`} stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d={`M ${rightX - 6.5} ${y - 2} Q ${rightX} ${y - 5.5} ${rightX + 6.5} ${y - 2.5}`} stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </g>
    );
  };

  // Helper to render mouth with synchronized lip-sync
  const renderMouth = (lipColor: string, cx: number = 60, cy: number = 72) => {
    if (isSpeaking) {
      return (
        <g>
          {/* Open talking mouth with teeth hint */}
          <ellipse cx={cx} cy={cy} rx={4.5} ry={2.5 + mouthOpen} fill="#7F1D1D" stroke={lipColor} strokeWidth="1" />
          <rect x={cx - 3} y={cy - 1.5} width={6} height={2} rx={0.5} fill="#FFFFFF" opacity="0.9" />
        </g>
      );
    }

    if (isHappy) {
      return (
        <path d={`M ${cx - 5} ${cy - 1} Q ${cx} ${cy + 4.5} ${cx + 5} ${cy - 1}`} stroke={lipColor} strokeWidth="2" strokeLinecap="round" fill="none" />
      );
    }

    if (isConcerned) {
      return (
        <path d={`M ${cx - 4} ${cy + 1} Q ${cx} ${cy - 1} ${cx + 4} ${cy + 1}`} stroke={lipColor} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      );
    }

    // Neutral friendly resting lips
    return (
      <path d={`M ${cx - 4} ${cy} Q ${cx} ${cy + 2} ${cx + 4} ${cy}`} stroke={lipColor} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    );
  };



  // 2. ANAYA — Academic & Exam Tutor (Sleek Bun, Thin Silver Specs, Navy Formal Shirt)
  const renderAnaya = () => (
    <g>
      {/* High Neat Hair Bun */}
      <circle cx="60" cy="22" r="14" fill="#0F172A" />
      <circle cx="60" cy="22" r="11" fill="#1E293B" />
      <circle cx="60" cy="20" r="3" fill="#94A3B8" />

      {/* Shoulders & Structured Navy Collared Shirt */}
      <path d="M 28 112 C 34 88 48 80 60 80 C 72 80 86 88 92 112 Z" fill="#0F172A" />
      {/* White Crisp Collar */}
      <path d="M 48 82 L 60 96 L 52 82 Z" fill="#FFFFFF" />
      <path d="M 72 82 L 60 96 L 68 82 Z" fill="#FFFFFF" />
      <line x1="60" y1="96" x2="60" y2="112" stroke="#38BDF8" strokeWidth="1.5" />

      {/* Neck & Face */}
      <rect x="54" y="66" width="12" height="18" rx="4" fill={skinToneFair} />
      <path d="M 39 40 C 39 26 81 26 81 40 C 81 62 71 74 60 74 C 49 74 39 62 39 40 Z" fill={skinToneFair} />
      <ellipse cx="48" cy="56" rx="3.5" ry="2" fill={blushTone} />
      <ellipse cx="72" cy="56" rx="3.5" ry="2" fill={blushTone} />

      {/* Sleek Side Hair Part */}
      <path d="M 37 38 C 45 25 75 25 83 38 C 76 33 68 32 60 35 C 50 32 42 34 37 38 Z" fill="#1E293B" />

      {/* Elegant Glasses */}
      <rect x="42" y="47" width="15" height="10" rx="3" fill="none" stroke="#94A3B8" strokeWidth="1.6" />
      <rect x="63" y="47" width="15" height="10" rx="3" fill="none" stroke="#94A3B8" strokeWidth="1.6" />
      <line x1="57" y1="51" x2="63" y2="51" stroke="#94A3B8" strokeWidth="1.6" />

      {/* Eyes & Nose */}
      {renderEyes('#0369A1', 49.5, 70.5, 52, 'almond')}
      <path d="M 59 57 L 60 62 L 62 62" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" fill="none" />

      {/* Mouth */}
      {renderMouth('#991B1B', 60, 68)}

      {/* Index Finger Pointer Gesture when explaining */}
      {showGesture && isExplaining && (
        <g className="animate-in fade-in duration-300">
          <path d="M 88 104 L 98 78 C 100 74 104 76 102 82 L 96 108 Z" fill={skinToneFair} stroke="#0F172A" strokeWidth="1" />
        </g>
      )}
    </g>
  );

  // 3. KIARA — Motivation & Sprint Coach (High Dynamic Ponytail, Active Teal Collar)
  const renderKiara = () => (
    <g>
      {/* High Swung Ponytail */}
      <path d="M 64 28 C 80 18 98 24 104 42 C 100 52 86 44 74 40 Z" fill="#292524" />
      <circle cx="68" cy="28" r="4" fill="#0D9488" />

      {/* Shoulders & Athletic Modern Collar */}
      <path d="M 28 112 C 34 88 48 82 60 82 C 72 82 86 88 92 112 Z" fill="#134E4A" />
      <path d="M 48 84 L 60 102 L 72 84 Z" fill="#0D9488" />
      <circle cx="60" cy="98" r="2.5" fill="#5EEAD4" />

      {/* Neck & Face */}
      <rect x="54" y="68" width="12" height="18" rx="4" fill={skinToneGolden} />
      <path d="M 38 42 C 38 28 82 28 82 42 C 82 64 71 76 60 76 C 49 76 38 64 38 42 Z" fill={skinToneGolden} />
      <ellipse cx="48" cy="58" rx="4" ry="2.2" fill={blushTone} />
      <ellipse cx="72" cy="58" rx="4" ry="2.2" fill={blushTone} />

      {/* Front Hair Bangs */}
      <path d="M 36 38 C 46 25 76 26 84 38 C 76 34 68 36 60 40 C 52 34 44 34 36 38 Z" fill="#1C1917" />
      <path d="M 37 38 C 39 48 42 56 43 62 C 40 52 38 44 37 38 Z" fill="#1C1917" />

      {/* Bright Expressive Eyes & Nose */}
      {renderEyes('#0F766E', 48, 72, 52, 'wide')}
      <path d="M 59 58 L 60 63 L 62 63" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Confident Smile */}
      {renderMouth('#B91C1C', 60, 70)}

      {/* Celebratory Hand / Thumbs Up Gesture */}
      {showGesture && isHappy && (
        <g className="animate-bounce">
          <circle cx="98" cy="74" r="8" fill={skinToneGolden} stroke="#0D9488" strokeWidth="1" />
          <path d="M 98 66 L 98 72" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </g>
  );

  // 4. AIRA — Technology & Systems Mentor (Indigo Asymmetric Bob, Cyber Lapel)
  const renderAira = () => (
    <g>
      {/* Dark Indigo Bob Hair Back */}
      <path d="M 34 44 C 26 64 30 84 42 96 C 44 80 44 64 46 50 Z" fill="#1E1B4B" />
      <path d="M 86 44 C 92 64 88 82 78 92 C 76 78 76 64 74 50 Z" fill="#1E1B4B" />

      {/* Tech Blazer / Dark Indigo Suit */}
      <path d="M 28 112 C 34 88 48 82 60 82 C 72 82 86 88 92 112 Z" fill="#312E81" />
      <path d="M 50 84 L 60 100 L 70 84 Z" fill="#4F46E5" />
      {/* Glowing Tech Lapel Pin */}
      <rect x="74" y="90" width="4" height="8" rx="1.5" fill="#818CF8" />

      {/* Face & Neck */}
      <rect x="54" y="68" width="12" height="18" rx="4" fill={skinToneFair} />
      <path d="M 38 40 C 38 26 82 26 82 40 C 82 62 71 74 60 74 C 49 74 38 62 38 40 Z" fill={skinToneFair} />
      <ellipse cx="48" cy="56" rx="3.5" ry="2" fill={blushTone} />
      <ellipse cx="72" cy="56" rx="3.5" ry="2" fill={blushTone} />

      {/* Asymmetric Sharp Tech Bob Bangs */}
      <path d="M 34 36 C 44 22 76 22 86 36 C 78 32 66 38 56 36 C 48 40 38 36 34 36 Z" fill="#3730A3" />
      <path d="M 34 36 C 36 52 40 68 44 78 C 42 62 40 50 38 40 Z" fill="#312E81" />

      {/* Eyes & Tech Inquisitive Look */}
      {renderEyes('#4338CA', 48, 72, 51, 'almond')}
      <path d="M 59 57 L 60 62 L 62 62" stroke="#6366F1" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Smirk / Focused Mouth */}
      {renderMouth('#831843', 60, 68)}

      {/* Framing Gesture (hands explaining protocol architecture) */}
      {showGesture && isExplaining && (
        <g className="animate-pulse">
          <path d="M 88 98 C 96 90 102 88 104 94 C 104 100 96 106 90 108 Z" fill={skinToneFair} stroke="#4F46E5" strokeWidth="1" />
        </g>
      )}
    </g>
  );

  // 5. TARA — Science & Mathematics Specialist (Forest Green, Side Braid, Tortoiseshell Glasses)
  const renderTara = () => (
    <g>
      {/* Side Braided Hair */}
      <path d="M 36 44 C 28 66 32 88 40 106 C 44 92 44 72 46 54 Z" fill="#2E1065" />
      <circle cx="38" cy="98" r="3" fill="#059669" />

      {/* Forest Green Knit Top */}
      <path d="M 28 112 C 34 88 48 82 60 82 C 72 82 86 88 92 112 Z" fill="#064E3B" />
      <path d="M 52 84 L 60 98 L 68 84 Z" fill="#10B981" />

      {/* Face & Neck */}
      <rect x="54" y="68" width="12" height="18" rx="4" fill={skinToneWarm} />
      <path d="M 39 41 C 39 27 81 27 81 41 C 81 63 71 75 60 75 C 49 75 39 63 39 41 Z" fill={skinToneWarm} />
      <ellipse cx="48" cy="57" rx="3.5" ry="2" fill={blushTone} />
      <ellipse cx="72" cy="57" rx="3.5" ry="2" fill={blushTone} />

      {/* Tortoiseshell Round Glasses */}
      <circle cx="49" cy="52" r="7.5" fill="none" stroke="#78350F" strokeWidth="1.8" />
      <circle cx="71" cy="52" r="7.5" fill="none" stroke="#78350F" strokeWidth="1.8" />
      <line x1="56.5" y1="52" x2="63.5" y2="52" stroke="#78350F" strokeWidth="1.8" />

      {/* Hair Top */}
      <path d="M 37 38 C 45 25 75 25 83 38 C 76 33 68 34 60 37 C 50 34 42 34 37 38 Z" fill="#3B0764" />

      {/* Eyes & Nose */}
      {renderEyes('#047857', 49, 71, 52, 'round')}
      <path d="M 59 58 L 60 63 L 62 63" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Calm Thoughtful Lips */}
      {renderMouth('#881337', 60, 69)}
    </g>
  );

  // 6. ISHA — Creative & Conceptual Tutor (Burgundy Scarf, Expressive Curls)
  const renderIsha = () => (
    <g>
      {/* Textured Curls Back */}
      <circle cx="42" cy="48" r="14" fill="#1C1917" />
      <circle cx="78" cy="48" r="14" fill="#1C1917" />
      <circle cx="36" cy="62" r="12" fill="#1C1917" />
      <circle cx="84" cy="62" r="12" fill="#1C1917" />

      {/* Burgundy & Rosewood Top with Artistic Draped Scarf */}
      <path d="M 28 112 C 34 88 48 82 60 82 C 72 82 86 88 92 112 Z" fill="#831843" />
      {/* Scarf folds */}
      <path d="M 44 86 C 54 94 66 94 76 86 C 70 104 50 104 44 86 Z" fill="#DB2777" />

      {/* Face & Neck */}
      <rect x="54" y="68" width="12" height="18" rx="4" fill={skinToneWarm} />
      <path d="M 39 41 C 39 27 81 27 81 41 C 81 63 71 75 60 75 C 49 75 39 63 39 41 Z" fill={skinToneWarm} />
      <ellipse cx="48" cy="57" rx="4" ry="2.2" fill={blushTone} />
      <ellipse cx="72" cy="57" rx="4" ry="2.2" fill={blushTone} />

      {/* Curly Crown Bangs */}
      <path d="M 38 38 C 44 26 76 26 82 38 C 76 34 68 36 60 38 C 52 35 44 35 38 38 Z" fill="#292524" />

      {/* Expressive Warm Eyes & Nose */}
      {renderEyes('#9D174D', 48, 72, 52, 'wide')}
      <path d="M 59 58 L 60 63 L 62 63" stroke="#9F1239" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Expressive Warm Smile */}
      {renderMouth('#BE123C', 60, 70)}
    </g>
  );

  // 7. NAINA — Career & Industry Mentor (Tailored Executive Charcoal Blazer, Straight Polished Hair)
  const renderNaina = () => (
    <g>
      {/* Sleek Polished Hair Back */}
      <path d="M 38 46 C 32 68 34 94 44 108 C 46 92 46 72 48 54 Z" fill="#18181B" />
      <path d="M 82 46 C 88 68 86 94 76 108 C 74 92 74 72 72 54 Z" fill="#18181B" />

      {/* Charcoal Tailored Executive Suit */}
      <path d="M 28 112 C 34 88 48 80 60 80 C 72 80 86 88 92 112 Z" fill="#1E293B" />
      {/* Sharp Lapels */}
      <path d="M 44 82 L 60 104 L 52 82 Z" fill="#334155" />
      <path d="M 76 82 L 60 104 L 68 82 Z" fill="#334155" />
      {/* Gold Executive Pin */}
      <circle cx="74" cy="90" r="2.5" fill="#EAB308" />

      {/* Face & Neck */}
      <rect x="54" y="66" width="12" height="18" rx="4" fill={skinToneGolden} />
      <path d="M 39 40 C 39 26 81 26 81 40 C 81 62 71 74 60 74 C 49 74 39 62 39 40 Z" fill={skinToneGolden} />
      <ellipse cx="48" cy="56" rx="3.5" ry="2" fill={blushTone} />
      <ellipse cx="72" cy="56" rx="3.5" ry="2" fill={blushTone} />

      {/* Straight Polished Side Part */}
      <path d="M 37 36 C 45 24 75 24 83 36 C 76 32 66 32 58 35 C 48 32 42 34 37 36 Z" fill="#27272A" />
      <path d="M 38 38 C 39 52 42 66 43 76 C 41 62 40 50 39 40 Z" fill="#18181B" />

      {/* Sharp Confident Eyes & Nose */}
      {renderEyes('#334155', 48, 72, 51, 'almond')}
      <path d="M 59 57 L 60 62 L 62 62" stroke="#71717A" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Composed Executive Smile */}
      {renderMouth('#991B1B', 60, 68)}
    </g>
  );

  // 8. YUNA — Calm Study Companion (Oversized Sage Cardigan, Low Relaxed Chignon)
  const renderYuna = () => (
    <g>
      {/* Low Relaxed Chignon */}
      <circle cx="60" cy="80" r="16" fill="#1C1917" opacity="0.6" />

      {/* Comfortable Oversized Sage Cardigan */}
      <path d="M 26 112 C 32 88 46 84 60 84 C 74 84 88 88 94 112 Z" fill="#4D7C0F" />
      <path d="M 48 86 C 54 98 66 98 72 86 C 68 106 52 106 48 86 Z" fill="#ECFCCB" />

      {/* Face & Neck */}
      <rect x="54" y="68" width="12" height="18" rx="4" fill={skinToneFair} />
      <path d="M 39 42 C 39 28 81 28 81 42 C 81 64 71 76 60 76 C 49 76 39 64 39 42 Z" fill={skinToneFair} />
      <ellipse cx="48" cy="58" rx="4" ry="2.2" fill={blushTone} />
      <ellipse cx="72" cy="58" rx="4" ry="2.2" fill={blushTone} />

      {/* Soft Curtain Bangs */}
      <path d="M 37 38 C 45 25 75 25 83 38 C 76 33 66 38 60 42 C 54 38 44 33 37 38 Z" fill="#292524" />
      <path d="M 38 40 C 42 54 44 64 45 72 C 43 58 41 48 39 42 Z" fill="#1C1917" />
      <path d="M 82 40 C 78 54 76 64 75 72 C 77 58 79 48 81 42 Z" fill="#1C1917" />

      {/* Serene Kind Eyes & Nose */}
      {renderEyes('#365314', 48, 72, 53, 'almond')}
      <path d="M 59 59 L 60 64 L 62 64" stroke="#65A30D" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Peaceful Gentle Smile */}
      {renderMouth('#9F1239', 60, 71)}
    </g>
  );

  const renderSelectedCharacter = () => {
    switch (characterId) {
      case 'anaya': return renderAnaya();
      case 'kiara': return renderKiara();
      case 'aira': return renderAira();
      case 'tara': return renderTara();
      case 'isha': return renderIsha();
      case 'naina': return renderNaina();
      case 'yuna': return renderYuna();
      default: return renderAnaya();
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center select-none relative transition-transform duration-300 ${
        isSpeaking ? 'scale-102' : ''
      } ${className}`}
      style={{ width: sizePixels, height: sizePixels }}
    >
      <svg
        viewBox="0 0 120 120"
        width={sizePixels}
        height={sizePixels}
        className="overflow-visible filter drop-shadow-sm transition-all"
      >
        {/* Soft Ambient Ground Shadow */}
        <ellipse cx="60" cy="112" rx="34" ry="5" fill="#000000" opacity="0.08" />

        {/* Breathing Base Layer (subtle sine wave animation) */}
        <g className={!isSpeaking ? 'animate-pulse' : ''} style={{ animationDuration: '4s' }}>
          {renderSelectedCharacter()}
        </g>

        {/* Voice Wave Aura when Speaking */}
        {isSpeaking && (
          <circle
            cx="60"
            cy="60"
            r={54 + Math.round(amplitude * 10)}
            fill="none"
            stroke="#EA580C"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.6"
            className="animate-spin-slow origin-center"
          />
        )}

        {/* Listening Ring Indicator */}
        {isListening && (
          <circle
            cx="60"
            cy="60"
            r={55}
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1.8"
            strokeDasharray="6 3"
            className="animate-spin-slow origin-center"
            opacity="0.8"
          />
        )}
      </svg>

      {/* Mood status indicator badge */}
      {isThinking && (
        <span className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full bg-surface-container border border-outline-variant/40 font-mono shadow-sm animate-pulse">
          💭
        </span>
      )}
      {isHappy && (
        <span className="absolute -top-1 -right-1 text-sm animate-bounce">
          ✨
        </span>
      )}
    </div>
  );
};
