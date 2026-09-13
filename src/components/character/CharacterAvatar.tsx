import React from 'react';
import { CharacterId, CharacterPose } from '../../data/characters';

interface CharacterAvatarProps {
  characterId?: CharacterId;
  pose?: CharacterPose;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isSpeaking?: boolean;
  amplitude?: number; // 0 to 1
  className?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  characterId = 'aria-vance',
  pose = 'idle',
  size = 'md',
  isSpeaking = false,
  amplitude = 0,
  className = '',
}) => {
  const sizePixels = {
    xs: 34,
    sm: 48,
    md: 84,
    lg: 124,
    xl: 168,
  }[size];

  // Dynamic mouth height based on speaking amplitude
  const mouthOpen = isSpeaking ? Math.max(2, Math.round(amplitude * 8)) : 0;
  const isHappy = pose === 'celebrating' || pose === 'correct' || pose === 'level-up';
  const isSad = pose === 'wrong';

  // Natural anime skin tones
  const skinToneFair = '#FDE2D2';
  const skinToneWarm = '#FCD7BE';
  const skinToneDeep = '#8D5B4C';
  const blushColor = 'rgba(251, 113, 133, 0.4)';

  // 1. ARIA VANCE — Chief Network Architect (Glasses, Ponytail, Navy/Orange Suit)
  const renderAriaVance = () => (
    <g>
      {/* Back Hair (Low Ponytail) */}
      <path d="M 38 42 C 28 62 30 84 42 98 C 46 86 44 68 46 52 Z" fill="#1E293B" />
      <path d="M 42 78 C 38 88 40 96 46 102 C 48 94 48 86 46 80 Z" fill="#EA580C" opacity="0.8" />
      
      {/* Body & Shoulders */}
      <path d="M 32 94 C 36 78 46 72 56 72 C 66 72 76 78 80 94 Z" fill="#0F172A" />
      {/* Architect Lapel & Tie */}
      <path d="M 48 74 L 56 90 L 64 74 Z" fill="#FFFFFF" />
      <path d="M 54 78 L 56 92 L 58 78 Z" fill="#EA580C" />
      <circle cx="56" cy="84" r="2" fill="#F59E0B" />

      {/* Neck & Face */}
      <rect x="51" y="60" width="10" height="15" rx="3" fill={skinToneWarm} />
      <path d="M 36 38 C 36 26 76 26 76 38 C 76 56 66 66 56 66 C 46 66 36 56 36 38 Z" fill={skinToneWarm} />
      {/* Blush */}
      <ellipse cx="44" cy="50" rx="3.5" ry="2" fill={blushColor} />
      <ellipse cx="68" cy="50" rx="3.5" ry="2" fill={blushColor} />

      {/* Front Hair Bangs */}
      <path d="M 34 36 C 40 22 72 22 78 36 C 72 32 66 34 60 40 C 54 32 44 32 34 36 Z" fill="#1E293B" />
      <path d="M 35 34 C 37 46 40 54 41 58 C 42 50 43 40 44 36 Z" fill="#1E293B" />
      <path d="M 77 34 C 75 46 72 54 71 58 C 70 50 69 40 68 36 Z" fill="#1E293B" />

      {/* Glasses */}
      <rect x="40" y="40" width="13" height="9" rx="2" fill="none" stroke="#EA580C" strokeWidth="1.8" />
      <rect x="59" y="40" width="13" height="9" rx="2" fill="none" stroke="#EA580C" strokeWidth="1.8" />
      <line x1="53" y1="44" x2="59" y2="44" stroke="#EA580C" strokeWidth="1.8" />

      {/* Eyes */}
      {isHappy ? (
        <>
          <path d="M 43 44 Q 47 40 50 44" stroke="#EA580C" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M 62 44 Q 66 40 69 44" stroke="#EA580C" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </>
      ) : isSad ? (
        <>
          <circle cx="46" cy="45" r="3" fill="#EA580C" />
          <circle cx="66" cy="45" r="3" fill="#EA580C" />
          <line x1="42" y1="38" x2="49" y2="40" stroke="#1E293B" strokeWidth="1.5" />
          <line x1="70" y1="38" x2="63" y2="40" stroke="#1E293B" strokeWidth="1.5" />
        </>
      ) : (
        <>
          <ellipse cx="46" cy="44.5" rx="3.2" ry="4" fill="#C2410C" />
          <circle cx="45" cy="43" r="1.3" fill="#FFFFFF" />
          <ellipse cx="65.5" cy="44.5" rx="3.2" ry="4" fill="#C2410C" />
          <circle cx="64.5" cy="43" r="1.3" fill="#FFFFFF" />
        </>
      )}

      {/* Mouth */}
      {isSpeaking ? (
        <ellipse cx="56" cy="56" rx="3.5" ry={2 + mouthOpen} fill="#991B1B" />
      ) : isHappy ? (
        <path d="M 52 54 Q 56 59 60 54" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M 53 55 Q 56 57 59 55" stroke="#991B1B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      )}
    </g>
  );

  // 2. MAYA LIN — Cyber Defense Valkyrie (Crimson Bangs, Tactical Earpiece)
  const renderMayaLin = () => (
    <g>
      {/* Short Dynamic Hair */}
      <path d="M 32 38 C 30 18 82 18 80 38 C 84 56 82 74 76 82 C 72 68 76 54 74 44 C 64 36 48 36 38 44 C 36 54 40 68 36 82 C 30 74 28 56 32 38 Z" fill="#1F2937" />
      
      {/* Shoulders / Combat Armor */}
      <path d="M 30 96 C 36 80 46 74 56 74 C 66 74 76 80 82 96 Z" fill="#111827" />
      <path d="M 44 76 L 56 88 L 68 76 Z" fill="#DC2626" />
      <rect x="52" y="82" width="8" height="8" rx="2" fill="#FCA5A5" />

      {/* Neck & Face */}
      <rect x="51" y="60" width="10" height="16" rx="3" fill={skinToneWarm} />
      <path d="M 36 36 C 36 24 76 24 76 36 C 76 55 67 65 56 65 C 45 65 36 55 36 36 Z" fill={skinToneWarm} />
      <ellipse cx="43" cy="50" rx="3.5" ry="2" fill={blushColor} />
      <ellipse cx="69" cy="50" rx="3.5" ry="2" fill={blushColor} />

      {/* Crimson Bangs */}
      <path d="M 34 32 C 44 18 68 18 78 32 C 68 30 58 36 54 48 C 50 36 42 30 34 32 Z" fill="#DC2626" />
      <path d="M 35 34 C 40 44 42 54 41 62 C 40 52 38 42 35 34 Z" fill="#1F2937" />

      {/* Tactical Cyber Earpiece */}
      <circle cx="76" cy="46" r="4" fill="#DC2626" />
      <circle cx="76" cy="46" r="2" fill="#22C55E" />
      <path d="M 76 46 Q 74 56 68 58" stroke="#DC2626" strokeWidth="1.5" fill="none" />

      {/* Eyes (Ruby Red) */}
      {isHappy ? (
        <>
          <path d="M 43 44 Q 47 40 51 44" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 61 44 Q 65 40 69 44" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <ellipse cx="47" cy="44" rx="3.5" ry="4.2" fill="#991B1B" />
          <circle cx="46" cy="42.5" r="1.3" fill="#FFFFFF" />
          <ellipse cx="65" cy="44" rx="3.5" ry="4.2" fill="#991B1B" />
          <circle cx="64" cy="42.5" r="1.3" fill="#FFFFFF" />
        </>
      )}

      {/* Mouth */}
      {isSpeaking ? (
        <ellipse cx="56" cy="56" rx="3.5" ry={2 + mouthOpen} fill="#7F1D1D" />
      ) : (
        <path d="M 52 54 Q 56 57 60 54" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}
    </g>
  );

  // 3. CHLOE STERLING — Protocol & Socket Prodigy (Pink Twin-Tails, Cyber Goggles)
  const renderChloeSterling = () => (
    <g>
      {/* Pink Twin Tails */}
      <path d="M 28 36 C 14 44 10 68 18 88 C 22 72 24 54 30 46 Z" fill="#F472B6" />
      <path d="M 84 36 C 98 44 102 68 94 88 C 90 72 88 54 82 46 Z" fill="#F472B6" />
      <circle cx="28" cy="42" r="3.5" fill="#DB2777" />
      <circle cx="84" cy="42" r="3.5" fill="#DB2777" />

      {/* Shoulders / Cute Tech Hoodie */}
      <path d="M 32 94 C 36 78 46 72 56 72 C 66 72 76 78 80 94 Z" fill="#FCE7F3" />
      <circle cx="56" cy="84" r="5" fill="#F472B6" />
      <path d="M 53 84 L 59 84" stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Face & Head */}
      <rect x="51" y="60" width="10" height="15" rx="3" fill={skinToneFair} />
      <path d="M 36 36 C 36 24 76 24 76 36 C 76 56 67 66 56 66 C 45 66 36 56 36 36 Z" fill={skinToneFair} />
      <ellipse cx="43" cy="51" rx="4" ry="2.2" fill="#FDA4AF" />
      <ellipse cx="69" cy="51" rx="4" ry="2.2" fill="#FDA4AF" />

      {/* Bangs */}
      <path d="M 34 34 C 40 22 72 22 78 34 C 70 30 64 36 56 34 C 48 36 42 30 34 34 Z" fill="#F472B6" />

      {/* Goggles on Head */}
      <rect x="38" y="20" width="15" height="10" rx="3" fill="#1E293B" stroke="#06B6D4" strokeWidth="1.5" />
      <rect x="59" y="20" width="15" height="10" rx="3" fill="#1E293B" stroke="#06B6D4" strokeWidth="1.5" />
      <line x1="53" y1="25" x2="59" y2="25" stroke="#06B6D4" strokeWidth="2" />
      <circle cx="45" cy="25" r="3" fill="#22D3EE" opacity="0.8" />
      <circle cx="67" cy="25" r="3" fill="#22D3EE" opacity="0.8" />

      {/* Eyes (Anime Violet Sparkle) */}
      {isHappy ? (
        <>
          <path d="M 43 45 Q 47 41 51 45" stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 61 45 Q 65 41 69 45" stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <ellipse cx="47" cy="45" rx="3.5" ry="4.5" fill="#BE185D" />
          <circle cx="45.5" cy="43.5" r="1.5" fill="#FFFFFF" />
          <ellipse cx="65" cy="45" rx="3.5" ry="4.5" fill="#BE185D" />
          <circle cx="63.5" cy="43.5" r="1.5" fill="#FFFFFF" />
        </>
      )}

      {/* Mouth */}
      {isSpeaking ? (
        <ellipse cx="56" cy="56" rx="3.5" ry={2 + mouthOpen} fill="#BE185D" />
      ) : (
        <path d="M 52 54 Q 56 60 60 54" stroke="#BE185D" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}
    </g>
  );

  // 4. SERAPHINA CRUZ — Senior Routing Strategist (Blonde Waves, Holographic Visor)
  const renderSeraCruz = () => (
    <g>
      {/* Flowing Golden Hair Back */}
      <path d="M 30 36 C 24 56 22 80 34 100 C 40 82 38 64 42 50 Z" fill="#FBBF24" />
      <path d="M 82 36 C 88 56 90 80 78 100 C 72 82 74 64 70 50 Z" fill="#FBBF24" />

      {/* Captain Jacket */}
      <path d="M 32 94 C 36 78 46 72 56 72 C 66 72 76 78 80 94 Z" fill="#78350F" />
      <path d="M 44 74 L 56 86 L 68 74 Z" fill="#F59E0B" />
      <circle cx="56" cy="88" r="2.5" fill="#FDE68A" />

      {/* Face & Head */}
      <rect x="51" y="60" width="10" height="15" rx="3" fill={skinToneWarm} />
      <path d="M 36 36 C 36 24 76 24 76 36 C 76 56 67 66 56 66 C 45 66 36 56 36 36 Z" fill={skinToneWarm} />
      <ellipse cx="44" cy="50" rx="3.5" ry="2" fill={blushColor} />
      <ellipse cx="68" cy="50" rx="3.5" ry="2" fill={blushColor} />

      {/* Front Blonde Hair */}
      <path d="M 34 34 C 42 20 70 20 78 34 C 74 30 66 36 58 34 C 50 36 42 30 34 34 Z" fill="#F59E0B" />
      <path d="M 34 34 C 38 46 36 58 38 66 C 40 54 42 44 44 38 Z" fill="#FBBF24" />

      {/* Holographic Routing Visor over Right Eye */}
      <rect x="58" y="38" width="18" height="10" rx="3" fill="#F59E0B" fillOpacity="0.4" stroke="#F59E0B" strokeWidth="1.5" />
      <line x1="60" y1="43" x2="74" y2="43" stroke="#FEF3C7" strokeWidth="1" strokeDasharray="2 1" />

      {/* Left Eye */}
      {isHappy ? (
        <path d="M 43 44 Q 47 40 51 44" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : (
        <>
          <ellipse cx="47" cy="44" rx="3.5" ry="4" fill="#92400E" />
          <circle cx="46" cy="42.5" r="1.3" fill="#FFFFFF" />
        </>
      )}

      {/* Mouth */}
      {isSpeaking ? (
        <ellipse cx="56" cy="56" rx="3.5" ry={2 + mouthOpen} fill="#78350F" />
      ) : (
        <path d="M 52 54 Q 56 58 60 54" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}
    </g>
  );

  // 5. KIRA TANAKA — The Packet Whisperer (Hime Cut, Jade Hairpins, Glowing Scarf)
  const renderKiraTanaka = () => (
    <g>
      {/* Sleek Dark Hair Back */}
      <path d="M 32 36 C 26 58 24 82 26 100 L 40 100 C 38 78 40 56 42 46 Z" fill="#0F172A" />
      <path d="M 80 36 C 86 58 88 82 86 100 L 72 100 C 74 78 72 56 70 46 Z" fill="#0F172A" />

      {/* Kimono / High-Tech Coat */}
      <path d="M 32 94 C 36 78 46 72 56 72 C 66 72 76 78 80 94 Z" fill="#064E3B" />
      {/* Glowing Scarf */}
      <path d="M 42 74 C 48 86 64 86 70 74 C 66 82 46 82 42 74 Z" fill="#10B981" />
      <circle cx="56" cy="80" r="2.5" fill="#34D399" />

      {/* Face & Head */}
      <rect x="51" y="60" width="10" height="15" rx="3" fill={skinToneFair} />
      <path d="M 36 36 C 36 24 76 24 76 36 C 76 56 67 66 56 66 C 45 66 36 56 36 36 Z" fill={skinToneFair} />
      <ellipse cx="43" cy="51" rx="3.5" ry="2" fill={blushColor} />
      <ellipse cx="69" cy="51" rx="3.5" ry="2" fill={blushColor} />

      {/* Straight Hime Bangs */}
      <rect x="36" y="28" width="40" height="12" rx="2" fill="#0F172A" />
      <line x1="36" y1="40" x2="76" y2="40" stroke="#0F172A" strokeWidth="2" />
      {/* Side Hime Strands */}
      <rect x="34" y="36" width="6" height="24" rx="2" fill="#0F172A" />
      <rect x="72" y="36" width="6" height="24" rx="2" fill="#0F172A" />

      {/* Jade Hairpin */}
      <line x1="68" y1="22" x2="82" y2="28" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="82" cy="28" r="3" fill="#34D399" />

      {/* Eyes (Emerald Serene) */}
      {isHappy ? (
        <>
          <path d="M 43 45 Q 47 41 51 45" stroke="#047857" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M 61 45 Q 65 41 69 45" stroke="#047857" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <ellipse cx="47" cy="46" rx="3.2" ry="4" fill="#047857" />
          <circle cx="46" cy="44.5" r="1.3" fill="#FFFFFF" />
          <ellipse cx="65" cy="46" rx="3.2" ry="4" fill="#047857" />
          <circle cx="64" cy="44.5" r="1.3" fill="#FFFFFF" />
        </>
      )}

      {/* Mouth */}
      {isSpeaking ? (
        <ellipse cx="56" cy="56" rx="3.5" ry={2 + mouthOpen} fill="#881337" />
      ) : (
        <path d="M 53 55 Q 56 57 59 55" stroke="#881337" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      )}
    </g>
  );

  // 6. ZOE BENNETT — Cloud Infrastructure Guru (Honey Bob, Wireless Headset)
  const renderZoeBennett = () => (
    <g>
      {/* Honey Bob Hair Back */}
      <path d="M 32 36 C 28 54 30 70 42 76 C 40 64 38 52 42 42 Z" fill="#D97706" />
      <path d="M 80 36 C 84 54 82 70 70 76 C 72 64 74 52 70 42 Z" fill="#D97706" />

      {/* Denim Tech Jacket */}
      <path d="M 32 94 C 36 78 46 72 56 72 C 66 72 76 78 80 94 Z" fill="#1D4ED8" />
      <path d="M 46 74 L 56 88 L 66 74 Z" fill="#FFFFFF" />
      <circle cx="44" cy="82" r="2.5" fill="#F59E0B" />
      <circle cx="68" cy="82" r="2.5" fill="#10B981" />

      {/* Face & Head */}
      <rect x="51" y="60" width="10" height="15" rx="3" fill={skinToneFair} />
      <path d="M 36 36 C 36 24 76 24 76 36 C 76 56 67 66 56 66 C 45 66 36 56 36 36 Z" fill={skinToneFair} />
      <ellipse cx="44" cy="51" rx="3.5" ry="2" fill={blushColor} />
      <ellipse cx="68" cy="51" rx="3.5" ry="2" fill={blushColor} />

      {/* Freckles */}
      <circle cx="44" cy="49" r="0.8" fill="#B45309" />
      <circle cx="47" cy="50" r="0.8" fill="#B45309" />
      <circle cx="65" cy="50" r="0.8" fill="#B45309" />
      <circle cx="68" cy="49" r="0.8" fill="#B45309" />

      {/* Honey Bob Bangs */}
      <path d="M 34 32 C 42 20 70 20 78 32 C 72 30 64 36 56 34 C 48 36 40 30 34 32 Z" fill="#F59E0B" />

      {/* Wireless Headset */}
      <path d="M 34 36 C 34 18 78 18 78 36" stroke="#1E293B" strokeWidth="2.5" fill="none" />
      <circle cx="34" cy="38" r="4.5" fill="#3B82F6" />
      <circle cx="78" cy="38" r="4.5" fill="#3B82F6" />

      {/* Eyes (Sapphire Blue) */}
      {isHappy ? (
        <>
          <path d="M 43 44 Q 47 40 51 44" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 61 44 Q 65 40 69 44" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <ellipse cx="47" cy="45" rx="3.5" ry="4" fill="#1D4ED8" />
          <circle cx="46" cy="43.5" r="1.3" fill="#FFFFFF" />
          <ellipse cx="65" cy="45" rx="3.5" ry="4" fill="#1D4ED8" />
          <circle cx="64" cy="43.5" r="1.3" fill="#FFFFFF" />
        </>
      )}

      {/* Mouth */}
      {isSpeaking ? (
        <ellipse cx="56" cy="56" rx="3.5" ry={2 + mouthOpen} fill="#B91C1C" />
      ) : (
        <path d="M 52 54 Q 56 59 60 54" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}
    </g>
  );

  // 7. ELENA ROSTOVA — Optical Physics Specialist (Silver-Lavender Hair, Lab Coat)
  const renderElenaRostova = () => (
    <g>
      {/* Silver Lavender Hair Back */}
      <path d="M 32 36 C 26 56 26 80 36 96 C 42 80 40 62 44 48 Z" fill="#C4B5FD" />
      <path d="M 80 36 C 86 56 86 80 76 96 C 70 80 72 62 68 48 Z" fill="#C4B5FD" />

      {/* Lab Coat */}
      <path d="M 32 94 C 36 78 46 72 56 72 C 66 72 76 78 80 94 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
      <path d="M 46 74 L 56 88 L 66 74 Z" fill="#8B5CF6" />
      <circle cx="56" cy="82" r="2" fill="#FFFFFF" />

      {/* Face & Head */}
      <rect x="51" y="60" width="10" height="15" rx="3" fill={skinToneFair} />
      <path d="M 36 36 C 36 24 76 24 76 36 C 76 56 67 66 56 66 C 45 66 36 56 36 36 Z" fill={skinToneFair} />
      <ellipse cx="44" cy="50" rx="3.5" ry="2" fill={blushColor} />
      <ellipse cx="68" cy="50" rx="3.5" ry="2" fill={blushColor} />

      {/* Front Silver Hair */}
      <path d="M 34 32 C 42 20 70 20 78 32 C 72 28 66 34 58 32 C 50 34 42 28 34 32 Z" fill="#DDD6FE" />
      <path d="M 35 34 C 38 46 36 58 38 64 C 40 52 42 42 44 36 Z" fill="#C4B5FD" />

      {/* Holographic Glasses */}
      <rect x="40" y="41" width="13" height="8" rx="2" fill="none" stroke="#8B5CF6" strokeWidth="1.6" />
      <rect x="59" y="41" width="13" height="8" rx="2" fill="none" stroke="#8B5CF6" strokeWidth="1.6" />
      <line x1="53" y1="44" x2="59" y2="44" stroke="#8B5CF6" strokeWidth="1.6" />

      {/* Eyes (Lilac/Violet) */}
      {isHappy ? (
        <>
          <path d="M 43 45 Q 47 41 51 45" stroke="#6D28D9" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M 61 45 Q 65 41 69 45" stroke="#6D28D9" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <ellipse cx="47" cy="45" rx="3.2" ry="4" fill="#6D28D9" />
          <circle cx="46" cy="43.5" r="1.3" fill="#FFFFFF" />
          <ellipse cx="65" cy="45" rx="3.2" ry="4" fill="#6D28D9" />
          <circle cx="64" cy="43.5" r="1.3" fill="#FFFFFF" />
        </>
      )}

      {/* Mouth */}
      {isSpeaking ? (
        <ellipse cx="56" cy="56" rx="3.5" ry={2 + mouthOpen} fill="#6D28D9" />
      ) : (
        <path d="M 53 55 Q 56 57 59 55" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      )}
    </g>
  );

  // 8. TANYA OKAFOR — Distributed Systems Captain (Braided Crown, Radiant Deep Skin)
  const renderTanyaOkafor = () => (
    <g>
      {/* Braided Crown */}
      <circle cx="56" cy="30" r="24" fill="#18181B" />
      {/* Golden Beads in Braids */}
      <circle cx="40" cy="24" r="2" fill="#F59E0B" />
      <circle cx="48" cy="18" r="2" fill="#F59E0B" />
      <circle cx="56" cy="16" r="2" fill="#F59E0B" />
      <circle cx="64" cy="18" r="2" fill="#F59E0B" />
      <circle cx="72" cy="24" r="2" fill="#F59E0B" />

      {/* Cyber Collar / Suit */}
      <path d="M 32 94 C 36 78 46 72 56 72 C 66 72 76 78 80 94 Z" fill="#292524" />
      <path d="M 46 74 L 56 88 L 66 74 Z" fill="#D97706" />
      <circle cx="56" cy="80" r="2.5" fill="#FDE68A" />

      {/* Face & Head */}
      <rect x="51" y="60" width="10" height="15" rx="3" fill={skinToneDeep} />
      <path d="M 36 36 C 36 24 76 24 76 36 C 76 56 67 66 56 66 C 45 66 36 56 36 36 Z" fill={skinToneDeep} />

      {/* Eyes (Golden Brown) */}
      {isHappy ? (
        <>
          <path d="M 43 44 Q 47 40 51 44" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 61 44 Q 65 40 69 44" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <ellipse cx="47" cy="44" rx="3.5" ry="4" fill="#D97706" />
          <circle cx="46" cy="42.5" r="1.3" fill="#FFFFFF" />
          <ellipse cx="65" cy="44" rx="3.5" ry="4" fill="#D97706" />
          <circle cx="64" cy="42.5" r="1.3" fill="#FFFFFF" />
        </>
      )}

      {/* Mouth */}
      {isSpeaking ? (
        <ellipse cx="56" cy="56" rx="3.5" ry={2 + mouthOpen} fill="#451A03" />
      ) : (
        <path d="M 52 54 Q 56 58 60 54" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}
    </g>
  );

  // 9. HANA MORI — Cryptography Prodigy (Cat-Ear Neon Headphones, Cute Bangs)
  const renderHanaMori = () => (
    <g>
      {/* Cat Ear Headphones */}
      <polygon points="32,24 24,6 42,16" fill="#0891B2" />
      <polygon points="32,22 26,10 40,16" fill="#22D3EE" />
      <polygon points="80,24 88,6 70,16" fill="#0891B2" />
      <polygon points="80,22 86,10 72,16" fill="#22D3EE" />
      <path d="M 32 24 C 42 16 70 16 80 24" stroke="#0891B2" strokeWidth="3" fill="none" />

      {/* Dark Teal Hair Back */}
      <path d="M 32 36 C 26 56 26 80 36 96 C 42 80 40 62 44 48 Z" fill="#164E63" />
      <path d="M 80 36 C 86 56 86 80 76 96 C 70 80 72 62 68 48 Z" fill="#164E63" />

      {/* Oversized Cyber Hoodie */}
      <path d="M 30 94 C 34 76 44 70 56 70 C 68 70 78 76 82 94 Z" fill="#06B6D4" />
      <circle cx="56" cy="82" r="4.5" fill="#FFFFFF" />
      <path d="M 54 82 L 58 82" stroke="#0891B2" strokeWidth="1.5" />

      {/* Face & Head */}
      <rect x="51" y="60" width="10" height="15" rx="3" fill={skinToneFair} />
      <path d="M 36 36 C 36 24 76 24 76 36 C 76 56 67 66 56 66 C 45 66 36 56 36 36 Z" fill={skinToneFair} />
      <ellipse cx="43" cy="51" rx="4" ry="2.2" fill="#A5F3FC" />
      <ellipse cx="69" cy="51" rx="4" ry="2.2" fill="#A5F3FC" />

      {/* Bangs */}
      <path d="M 34 34 C 40 22 72 22 78 34 C 70 30 64 36 56 34 C 48 36 42 30 34 34 Z" fill="#155E75" />

      {/* Eyes (Turquoise Anime Sparkle) */}
      {isHappy ? (
        <>
          <path d="M 43 45 Q 47 41 51 45" stroke="#0891B2" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 61 45 Q 65 41 69 45" stroke="#0891B2" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <ellipse cx="47" cy="45" rx="3.5" ry="4.5" fill="#0891B2" />
          <circle cx="45.5" cy="43.5" r="1.5" fill="#FFFFFF" />
          <ellipse cx="65" cy="45" rx="3.5" ry="4.5" fill="#0891B2" />
          <circle cx="63.5" cy="43.5" r="1.5" fill="#FFFFFF" />
        </>
      )}

      {/* Mouth */}
      {isSpeaking ? (
        <ellipse cx="56" cy="56" rx="3.5" ry={2 + mouthOpen} fill="#0E7490" />
      ) : (
        <path d="M 52 54 Q 56 60 60 54" stroke="#0E7490" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}
    </g>
  );

  // 10. LUNA CHEN — Zero-Trust Detective (Purple Bob, High Collar Trench Coat, Cyber Monocle)
  const renderLunaChen = () => (
    <g>
      {/* Deep Violet Hair Back */}
      <path d="M 32 36 C 26 54 28 72 40 80 C 38 66 38 52 42 42 Z" fill="#312E81" />
      <path d="M 80 36 C 86 54 84 72 72 80 C 74 66 74 52 70 42 Z" fill="#312E81" />

      {/* Cyber Trench Coat with High Collar */}
      <path d="M 30 96 C 34 78 44 72 56 72 C 68 72 78 78 82 96 Z" fill="#1E1B4B" />
      {/* High Collars */}
      <path d="M 38 84 L 46 66 L 52 82 Z" fill="#4338CA" />
      <path d="M 74 84 L 66 66 L 60 82 Z" fill="#4338CA" />

      {/* Face & Head */}
      <rect x="51" y="60" width="10" height="15" rx="3" fill={skinToneFair} />
      <path d="M 36 36 C 36 24 76 24 76 36 C 76 56 67 66 56 66 C 45 66 36 56 36 36 Z" fill={skinToneFair} />
      <ellipse cx="44" cy="50" rx="3.5" ry="2" fill={blushColor} />
      <ellipse cx="68" cy="50" rx="3.5" ry="2" fill={blushColor} />

      {/* Asymmetric Violet Bangs */}
      <path d="M 34 32 C 44 18 70 18 78 32 C 72 30 64 36 56 34 C 48 38 38 34 34 32 Z" fill="#4338CA" />
      <path d="M 34 34 C 36 48 40 60 44 68 C 42 54 40 44 38 36 Z" fill="#3730A3" />

      {/* Cyber Monocle over Left Eye */}
      <circle cx="47" cy="44" r="6" fill="#6366F1" fillOpacity="0.2" stroke="#6366F1" strokeWidth="1.5" />
      <line x1="41" y1="44" x2="34" y2="40" stroke="#6366F1" strokeWidth="1.2" />

      {/* Eyes (Violet) */}
      {isHappy ? (
        <>
          <path d="M 44 44 Q 47 40 50 44" stroke="#4338CA" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M 62 44 Q 65 40 68 44" stroke="#4338CA" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <ellipse cx="47" cy="44" rx="3" ry="3.8" fill="#4338CA" />
          <circle cx="46" cy="42.8" r="1.2" fill="#FFFFFF" />
          <ellipse cx="65" cy="44" rx="3.2" ry="4" fill="#4338CA" />
          <circle cx="64" cy="42.8" r="1.2" fill="#FFFFFF" />
        </>
      )}

      {/* Mouth */}
      {isSpeaking ? (
        <ellipse cx="56" cy="56" rx="3.5" ry={2 + mouthOpen} fill="#312E81" />
      ) : (
        <path d="M 53 54 Q 56 56 59 54" stroke="#4338CA" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      )}
    </g>
  );

  // Router to specific character renderer
  const renderCharacterSVG = () => {
    switch (characterId) {
      case 'aria-vance':
        return renderAriaVance();
      case 'maya-lin':
        return renderMayaLin();
      case 'chloe-sterling':
        return renderChloeSterling();
      case 'sera-cruz':
        return renderSeraCruz();
      case 'kira-tanaka':
        return renderKiraTanaka();
      case 'zoe-bennett':
        return renderZoeBennett();
      case 'elena-rostova':
        return renderElenaRostova();
      case 'tanya-okafor':
        return renderTanyaOkafor();
      case 'hana-mori':
        return renderHanaMori();
      case 'luna-chen':
        return renderLunaChen();
      default:
        return renderAriaVance();
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center select-none relative transition-transform duration-300 ${
        isSpeaking ? 'scale-105' : ''
      } ${className}`}
      style={{ width: sizePixels, height: sizePixels }}
    >
      <svg
        viewBox="0 0 112 112"
        width={sizePixels}
        height={sizePixels}
        className="overflow-visible filter drop-shadow-sm transition-all"
      >
        {/* Soft Ambient Base Glow */}
        <ellipse cx="56" cy="98" rx="32" ry="6" fill="#000000" opacity="0.1" />

        {/* Character Visual */}
        {renderCharacterSVG()}

        {/* Speaking Voice Waves Aura */}
        {isSpeaking && (
          <circle
            cx="56"
            cy="56"
            r={50 + Math.round(amplitude * 8)}
            fill="none"
            stroke="#EA580C"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.6"
            className="animate-spin-slow origin-center"
          />
        )}
      </svg>

      {/* Floating Mood Bubble during celebrations or tips */}
      {pose === 'celebrating' && (
        <span className="absolute -top-1 -right-1 text-sm animate-bounce">✨</span>
      )}
      {pose === 'correct' && (
        <span className="absolute -top-1 -right-1 text-sm animate-bounce">🌟</span>
      )}
      {pose === 'thinking' && (
        <span className="absolute -top-1 -right-1 text-xs font-mono font-bold text-amber-500 bg-white dark:bg-slate-800 rounded-full px-1 shadow-sm animate-pulse">
          💭
        </span>
      )}
    </div>
  );
};
