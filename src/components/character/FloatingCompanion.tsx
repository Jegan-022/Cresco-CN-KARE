import React, { useState } from 'react';
import { useCharacter } from '../../context/CharacterContext';
import { CharacterAvatar } from './CharacterAvatar';
import { 
  Sparkles, 
  Volume2, 
  Pause, 
  RotateCcw, 
  X, 
  HelpCircle, 
  Gamepad2, 
  Layers 
} from 'lucide-react';

export const FloatingCompanion: React.FC = () => {
  const {
    activeCharacter,
    speak,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    isSpeaking,
    isPaused,
    audioAmplitude,
    hasElevenLabsKey,
    openCharacterHub,
  } = useCharacter();

  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const tips = activeCharacter.studyTips || [
    'Remember to verify your TCP handshakes!',
    'Subnetting is easier with power of two masks.',
    'Encryption keeps data private in transit.'
  ];

  const currentTip = tips[currentTipIndex % tips.length];

  const handleNextTip = () => {
    const nextIdx = (currentTipIndex + 1) % tips.length;
    setCurrentTipIndex(nextIdx);
    speak(tips[nextIdx], activeCharacter.id);
  };

  const handleSpeakCatchphrase = () => {
    speak(activeCharacter.catchphrase, activeCharacter.id);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 select-none flex flex-col items-end pointer-events-auto">
      
      {/* Expanded Mini Speech Bubble Dialog */}
      {isExpanded && (
        <div className="mb-3 w-72 sm:w-80 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-cyan-500/40 rounded-3xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200 space-y-3">
          
          {/* Header with Character Name & ElevenLabs Indicator */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                {activeCharacter.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-600 dark:text-cyan-400 font-semibold">
                {activeCharacter.networkLayer.split(' ')[0]}
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Minimize companion"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Character Speech Quote */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            <p>"{currentTip}"</p>
          </div>

          {/* Voice & Perk Actions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              {/* Listen to Tip via ElevenLabs */}
              <button
                onClick={() => {
                  if (isSpeaking && !isPaused) pauseSpeaking();
                  else if (isPaused) resumeSpeaking();
                  else speak(currentTip, activeCharacter.id);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSpeaking && !isPaused ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPaused ? 'Resume' : 'Listen'}</span>
                  </>
                )}
              </button>

              {/* Next Tip Button */}
              <button
                onClick={handleNextTip}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                title="Next network study tip"
              >
                Tip 💡
              </button>
            </div>

            {/* Switch Companion Link */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500" />
                {hasElevenLabsKey ? 'ElevenLabs AI' : 'Smart Voice'}
              </span>
              <button
                onClick={() => {
                  setIsExpanded(false);
                  openCharacterHub();
                }}
                className="text-blue-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
              >
                Switch Companion (10) →
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Floating Mascot Trigger Button */}
      <div className="relative group">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative p-1.5 rounded-full transition-all duration-300 cursor-pointer shadow-2xl flex items-center justify-center ${
            isExpanded
              ? 'bg-blue-600 ring-4 ring-blue-500/30 scale-105'
              : 'bg-white dark:bg-[#0E1626] border-2 border-slate-200 dark:border-cyan-500/40 hover:scale-110'
          }`}
          title={`${activeCharacter.name} • Click to interact or hear voice`}
        >
          <CharacterAvatar
            characterId={activeCharacter.id}
            pose={isSpeaking ? 'celebrating' : 'idle'}
            size="sm"
            isSpeaking={isSpeaking}
            amplitude={audioAmplitude}
          />
          
          {/* Speaking Pulse Ring */}
          {isSpeaking && (
            <span className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping pointer-events-none opacity-60" />
          )}

          {/* Mini Voice Indicator Badge */}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-[9px] shadow-xs">
            <Volume2 className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* Floating Tooltip Label */}
        {!isExpanded && (
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-mono font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
            {activeCharacter.name} • Talk
          </div>
        )}
      </div>

    </div>
  );
};
