import React, { useState } from 'react';
import { CHARACTERS, CharacterId, CharacterProfile } from '../../data/characters';
import { useCharacter } from '../../context/CharacterContext';
import { CharacterAvatar } from '../character/CharacterAvatar';
import { soundFx } from '../../utils/soundEffects';
import { 
  Volume2, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Shield, 
  Compass, 
  Award,
  Zap,
  Play,
  RotateCcw
} from 'lucide-react';

interface CompanionSelectViewProps {
  onComplete: () => void;
  isRevisit?: boolean;
}

export const CompanionSelectView: React.FC<CompanionSelectViewProps> = ({ 
  onComplete,
  isRevisit = false 
}) => {
  const { 
    activeCharacterId, 
    setActiveCharacterId, 
    speak, 
    stopSpeaking, 
    isSpeaking, 
    audioAmplitude 
  } = useCharacter();

  const [selectedId, setSelectedId] = useState<CharacterId>(activeCharacterId || 'aria-vance');
  const [auditioningId, setAuditioningId] = useState<CharacterId | null>(null);

  const selectedCharacter = CHARACTERS.find((c) => c.id === selectedId) || CHARACTERS[0];

  // Test / Audition Voice
  const handleAuditionVoice = async (char: CharacterProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();

    if (auditioningId === char.id && isSpeaking) {
      stopSpeaking();
      setAuditioningId(null);
      return;
    }

    setAuditioningId(char.id);
    await speak(char.defaultIntro, char.id, () => {
      setAuditioningId(null);
    });
  };

  // Confirm selection
  const handleConfirm = () => {
    soundFx.playLevelUp();
    setActiveCharacterId(selectedId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('netquest_companion_chosen', 'true');
    }
    onComplete();
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none transition-colors duration-300">
      
      {/* Top Bar / Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between pb-6 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-conic-green text-white flex items-center justify-center shadow-[0_3px_0_0_#047857]">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="font-headline text-xl font-black tracking-tight text-on-surface">
              Cresco CN Companion Guidance
            </span>
            <span className="text-xs text-outline block font-mono">
              STEP 1: SELECT YOUR ANIME MENTOR GUIDE
            </span>
          </div>
        </div>

        {isRevisit && (
          <button
            onClick={onComplete}
            className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            Cancel & Return
          </button>
        )}
      </div>

      {/* Main Selection Showcase */}
      <div className="max-w-7xl mx-auto w-full py-8 space-y-8 flex-1">
        
        {/* Title & Explainer Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Voice-Assisted Learning Journey</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-on-surface tracking-tight">
            Choose Your Guide Mentor
          </h1>
          <p className="font-body text-sm sm:text-base text-on-surface-variant max-w-xl mx-auto">
            Your animated guide will accompany you through packet labs, deliver ElevenLabs voice explanations, and cheer your exam victories.
          </p>
        </div>

        {/* Selected Mentor Hero Preview Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-high border-2 border-outline-variant/40 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
            
            {/* Left: Avatar Showcase */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-surface-container-lowest flex items-center justify-center shadow-lg border border-outline-variant/30 overflow-visible">
                  <CharacterAvatar
                    characterId={selectedCharacter.id}
                    pose={isSpeaking && auditioningId === selectedCharacter.id ? 'explaining' : 'idle'}
                    size="xl"
                    isSpeaking={isSpeaking && auditioningId === selectedCharacter.id}
                    amplitude={audioAmplitude}
                  />
                </div>
                {/* Active Indicator Ring */}
                <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold shadow-md uppercase font-mono">
                  {selectedCharacter.badgeText}
                </span>
              </div>

              {/* Title & Archetype */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-headline text-2xl sm:text-3xl font-black text-on-surface">
                    {selectedCharacter.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-primary-container text-white text-[10px] font-bold">
                    {selectedCharacter.archetype}
                  </span>
                </div>
                <p className="font-headline text-sm font-bold text-primary">
                  {selectedCharacter.title}
                </p>
                <p className="text-xs text-outline font-mono">
                  Specialty: {selectedCharacter.networkLayer}
                </p>
                <blockquote className="text-xs italic text-on-surface-variant pt-1 max-w-md">
                  "{selectedCharacter.catchphrase}"
                </blockquote>
              </div>
            </div>

            {/* Right: Voice Audition & Perk Badge */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 w-full md:w-auto shrink-0">
              {/* Listen to Voice Button */}
              <button
                type="button"
                onClick={(e) => handleAuditionVoice(selectedCharacter, e)}
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-surface-container-lowest text-primary hover:bg-primary-container hover:text-white border border-outline-variant/40 font-headline text-xs font-bold shadow-sm transition-all cursor-pointer group"
              >
                <Volume2 size={16} className={isSpeaking && auditioningId === selectedCharacter.id ? 'animate-bounce' : ''} />
                <span>
                  {isSpeaking && auditioningId === selectedCharacter.id ? 'Playing Voice...' : `Audition Voice (${selectedCharacter.voiceName})`}
                </span>
              </button>

              {/* Gameplay Perk Pill */}
              <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-xs flex items-center gap-2">
                <Zap size={14} className="text-amber-500 shrink-0" />
                <span className="font-bold text-on-surface">{selectedCharacter.gameplayPerk}</span>
              </div>
            </div>

          </div>
        </div>

        {/* 10 Mentor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CHARACTERS.map((char) => {
            const isSelected = selectedId === char.id;
            const isAuditioning = auditioningId === char.id && isSpeaking;

            return (
              <div
                key={char.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedId(char.id);
                }}
                className={`relative rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between border-2 ${
                  isSelected
                    ? 'bg-surface-container-lowest border-primary shadow-[0_6px_0_0_#047857,0_12px_24px_rgba(16,185,129,0.15)] -translate-y-1'
                    : 'bg-surface-container-lowest/70 border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-lowest hover:-translate-y-0.5 shadow-sm'
                }`}
              >
                {/* Active Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}

                {/* Avatar & Voice Waves */}
                <div className="flex flex-col items-center text-center space-y-3 pt-2">
                  <div className="w-20 h-20 rounded-xl bg-surface-container-low flex items-center justify-center relative overflow-visible border border-outline-variant/20">
                    <CharacterAvatar
                      characterId={char.id}
                      pose={isAuditioning ? 'explaining' : isSelected ? 'celebrating' : 'idle'}
                      size="md"
                      isSpeaking={isAuditioning}
                      amplitude={audioAmplitude}
                    />
                  </div>

                  <div className="space-y-0.5 w-full">
                    <h3 className="font-headline text-base font-black text-on-surface truncate">
                      {char.name}
                    </h3>
                    <p className="text-[11px] font-bold text-primary truncate">
                      {char.title}
                    </p>
                    <p className="text-[10px] text-outline font-mono truncate">
                      {char.voiceStyleTag}
                    </p>
                  </div>
                </div>

                {/* Voice Audition Mini Button */}
                <div className="pt-4 mt-2 border-t border-outline-variant/20 space-y-2">
                  <button
                    type="button"
                    onClick={(e) => handleAuditionVoice(char, e)}
                    className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isAuditioning
                        ? 'bg-primary text-white animate-pulse'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <Volume2 size={12} />
                    <span>{isAuditioning ? 'Speaking...' : `Voice: ${char.voiceName}`}</span>
                  </button>

                  <p className="text-[10px] text-on-surface-variant line-clamp-2 leading-tight">
                    {char.learnBio}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="max-w-7xl mx-auto w-full pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-outline font-medium text-center sm:text-left">
          Selected Mentor: <span className="font-bold text-on-surface">{selectedCharacter.name}</span> ({selectedCharacter.title}). You can adjust companions anytime from Settings.
        </div>

        <button
          onClick={handleConfirm}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-primary-container text-white font-headline text-base font-black shadow-[0_4px_0_0_#047857,0_10px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_2px_0_0_#047857,0_6px_12px_rgba(16,185,129,0.2)] active:translate-y-1 transition-all cursor-pointer"
        >
          <span>Confirm &amp; Begin Journey with {selectedCharacter.name.split(' ')[0]}</span>
          <ArrowRight size={18} strokeWidth={2.8} />
        </button>
      </div>

    </div>
  );
};

export default CompanionSelectView;
