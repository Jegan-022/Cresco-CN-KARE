import React, { useState } from 'react';
import { 
  GUIDE_MASTERS, 
  GuideMasterId, 
  GuideMasterProfile,
  GuideMasterMood
} from '../../data/guideMasterCharacters';
import { GuideMasterAvatar } from '../guidemaster/GuideMasterAvatar';
import { soundFx } from '../../utils/soundEffects';
import { 
  Volume2, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Award,
  Zap,
  BookOpen,
  GraduationCap,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface GuideMasterSelectViewProps {
  onComplete: () => void;
  isRevisit?: boolean;
}

export const GuideMasterSelectView: React.FC<GuideMasterSelectViewProps> = ({
  onComplete,
  isRevisit = false,
}) => {
  const [selectedId, setSelectedId] = useState<GuideMasterId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('netquest_guidemaster_id');
      if (saved && GUIDE_MASTERS.some((m) => m.id === saved)) {
        return saved as GuideMasterId;
      }
    }
    return 'mira';
  });

  const [auditioningId, setAuditioningId] = useState<GuideMasterId | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [amplitude, setAmplitude] = useState(0);

  const selectedMaster = GUIDE_MASTERS.find((m) => m.id === selectedId) || GUIDE_MASTERS[0];

  // Test / Audition Voice via ElevenLabs or Web Speech API
  const handleAuditionVoice = (master: GuideMasterProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();

    if (auditioningId === master.id && isSpeaking) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setAuditioningId(null);
      setAmplitude(0);
      return;
    }

    setAuditioningId(master.id);
    setIsSpeaking(true);
    setAmplitude(0.7);

    // Simulate animated speech cadence
    const ampInterval = setInterval(() => {
      setAmplitude(Math.random() * 0.7 + 0.3);
    }, 120);

    soundFx.speak(master.introMessage, () => {
      clearInterval(ampInterval);
      setIsSpeaking(false);
      setAuditioningId(null);
      setAmplitude(0);
    });
  };

  // Confirm selection
  const handleConfirm = () => {
    soundFx.playLevelUp();
    if (typeof window !== 'undefined') {
      localStorage.setItem('netquest_guidemaster_id', selectedId);
      localStorage.setItem('netquest_companion_chosen', 'true');
    }
    onComplete();
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none transition-colors duration-300">
      
      {/* Top Editorial Navigation Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between pb-6 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-conic-green text-white flex items-center justify-center shadow-[0_3px_0_0_#047857]">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline text-xl font-black tracking-tight text-on-surface">
                GuideMaster
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                Production AI Tutor
              </span>
            </div>
            <span className="text-xs text-outline block font-mono">
              SELECT YOUR PERSONAL FEMALE EDUCATIONAL MENTOR
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

      {/* Main Showcase Area */}
      <div className="max-w-7xl mx-auto w-full py-8 space-y-8 flex-1">
        
        {/* Editorial Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-on-surface tracking-tight">
            Choose Your GuideMaster
          </h1>
          <p className="font-body text-sm sm:text-base text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            Your dedicated tutor accompanies you across every lesson, explains difficult concepts step by step, synchronizes visual diagrams, and answers your voice questions.
          </p>
        </div>

        {/* Selected GuideMaster Hero Dossier Card */}
        <div className="relative overflow-hidden rounded-3xl bg-surface-container-lowest border-2 border-outline-variant/50 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-center gap-8 justify-between">
            
            {/* Left: Avatar Showcase */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="relative shrink-0">
                <div 
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl flex items-center justify-center shadow-lg border-2 overflow-visible transition-colors"
                  style={{ 
                    backgroundColor: selectedMaster.color.background, 
                    borderColor: selectedMaster.color.border 
                  }}
                >
                  <GuideMasterAvatar
                    characterId={selectedMaster.id}
                    mood={isSpeaking && auditioningId === selectedMaster.id ? 'explaining' : 'idle'}
                    size="xl"
                    isSpeaking={isSpeaking && auditioningId === selectedMaster.id}
                    amplitude={amplitude}
                  />
                </div>
                {/* Voice Model Badge */}
                <span 
                  className="absolute -bottom-2.5 -right-2 px-3 py-1 rounded-full text-white text-[10px] font-bold shadow-md uppercase font-mono tracking-wider"
                  style={{ backgroundColor: selectedMaster.color.primary }}
                >
                  {selectedMaster.voiceName} Voice
                </span>
              </div>

              {/* Character Details & Teaching Philosophy */}
              <div className="space-y-2 max-w-xl">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="font-headline text-2xl sm:text-3xl font-black text-on-surface">
                    {selectedMaster.name}
                  </h2>
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: selectedMaster.color.primary }}
                  >
                    {selectedMaster.role}
                  </span>
                  <span className="text-xs text-outline font-mono">
                    • {selectedMaster.archetype}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-on-surface-variant font-medium leading-relaxed">
                  {selectedMaster.personality}
                </p>

                {/* Catchphrase Quote */}
                <blockquote className="text-xs italic text-on-surface pt-1 border-l-2 pl-3 border-primary/60">
                  "{selectedMaster.catchphrase}"
                </blockquote>

                {/* Specialty Tags */}
                <div className="pt-2 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  {selectedMaster.specialtyAreas.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant text-[11px] font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Audition Voice & Equipped Perk */}
            <div className="flex flex-col items-stretch sm:items-center lg:items-end gap-3 w-full lg:w-auto shrink-0">
              {/* Audition Button */}
              <button
                type="button"
                onClick={(e) => handleAuditionVoice(selectedMaster, e)}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/50 font-headline text-xs font-bold shadow-xs transition-all cursor-pointer group"
              >
                <Volume2 
                  size={18} 
                  className={`text-primary ${isSpeaking && auditioningId === selectedMaster.id ? 'animate-bounce' : 'group-hover:scale-110'}`} 
                />
                <span>
                  {isSpeaking && auditioningId === selectedMaster.id ? 'Listening to Intro...' : `Audition Voice (${selectedMaster.voiceName})`}
                </span>
              </button>

              {/* Student Perk Callout */}
              <div className="p-3.5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 text-xs flex items-center gap-2.5 max-w-sm">
                <Zap size={16} className="text-amber-500 shrink-0" />
                <span className="font-bold text-on-surface">{selectedMaster.studentPerk}</span>
              </div>
            </div>

          </div>
        </div>

        {/* 8 GuideMasters Roster Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GUIDE_MASTERS.map((master) => {
            const isSelected = selectedId === master.id;
            const isAuditioning = auditioningId === master.id && isSpeaking;

            return (
              <div
                key={master.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedId(master.id);
                }}
                className={`relative rounded-3xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between border-2 ${
                  isSelected
                    ? 'bg-surface-container-lowest border-primary shadow-[0_6px_0_0_#047857,0_12px_24px_rgba(16,185,129,0.12)] -translate-y-1'
                    : 'bg-surface-container-lowest/80 border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-lowest hover:-translate-y-0.5 shadow-xs'
                }`}
              >
                {/* Active Checkmark Pill */}
                {isSelected && (
                  <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}

                {/* Avatar Display */}
                <div className="flex flex-col items-center text-center space-y-3 pt-2">
                  <div 
                    className="w-24 h-24 rounded-2xl flex items-center justify-center relative overflow-visible border transition-colors"
                    style={{ 
                      backgroundColor: master.color.background, 
                      borderColor: master.color.border 
                    }}
                  >
                    <GuideMasterAvatar
                      characterId={master.id}
                      mood={isAuditioning ? 'explaining' : isSelected ? 'happy' : 'idle'}
                      size="md"
                      isSpeaking={isAuditioning}
                      amplitude={amplitude}
                    />
                  </div>

                  <div className="space-y-0.5 w-full">
                    <h3 className="font-headline text-lg font-black text-on-surface">
                      {master.name}
                    </h3>
                    <p className="text-xs font-bold text-primary truncate">
                      {master.role}
                    </p>
                    <p className="text-[10px] text-outline font-mono">
                      Voice: {master.voiceName} ({master.voiceStyleTag.split(',')[0]})
                    </p>
                  </div>
                </div>

                {/* Card Footer: Mini Audition & Perk summary */}
                <div className="pt-4 mt-3 border-t border-outline-variant/20 space-y-2.5">
                  <button
                    type="button"
                    onClick={(e) => handleAuditionVoice(master, e)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isAuditioning
                        ? 'bg-primary text-white shadow-sm animate-pulse'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <Volume2 size={14} />
                    <span>{isAuditioning ? 'Speaking...' : `Audition (${master.voiceName})`}</span>
                  </button>

                  <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                    {master.teachingStyle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="max-w-7xl mx-auto w-full pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="font-bold text-on-surface">Selected GuideMaster:</span>
          <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold font-headline">
            {selectedMaster.name} • {selectedMaster.role}
          </span>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-conic-green text-white hover:brightness-105 active:brightness-95 font-headline text-sm font-black shadow-[0_4px_0_0_#047857] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
        >
          <span>Confirm & Begin Journey with {selectedMaster.name}</span>
          <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
};
