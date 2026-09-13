import React, { useState, useEffect } from 'react';
import { CharacterId, CharacterPose } from '../../data/characters';
import { useCharacter } from '../../context/CharacterContext';
import { CharacterAvatar } from './CharacterAvatar';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

export type BytePose = CharacterPose;

interface ByteBotProps {
  characterId?: CharacterId;
  pose?: BytePose;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  speechText?: string;
  showSpeech?: boolean;
  onSpeechClick?: () => void;
  className?: string;
  showVoiceBadge?: boolean;
}

export const ByteBot: React.FC<ByteBotProps> = ({
  characterId,
  pose = 'idle',
  size = 'md',
  speechText,
  showSpeech = false,
  onSpeechClick,
  className = '',
  showVoiceBadge = true,
}) => {
  const {
    activeCharacter,
    speak,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    isSpeaking,
    isPaused,
    audioAmplitude,
    currentSpokenText,
    hasElevenLabsKey,
    openCharacterHub,
  } = useCharacter();

  const [localAudioState, setLocalAudioState] = useState<'idle' | 'playing' | 'paused'>('idle');

  // Resolved character
  const resolvedCharacter = characterId ? (activeCharacter.id === characterId ? activeCharacter : { ...activeCharacter, id: characterId }) : activeCharacter;

  // Track if THIS specific speech bubble is currently playing
  const isThisBubbleSpeaking = isSpeaking && currentSpokenText === speechText;
  const isThisBubblePaused = isPaused && currentSpokenText === speechText;

  // Sync audio state when speech text changes
  useEffect(() => {
    setLocalAudioState('idle');
  }, [speechText]);

  const handlePlay = async () => {
    if (!speechText) return;
    if (isThisBubblePaused) {
      resumeSpeaking();
      setLocalAudioState('playing');
    } else {
      setLocalAudioState('playing');
      await speak(speechText, resolvedCharacter.id, () => {
        setLocalAudioState('idle');
      });
    }
    if (onSpeechClick) onSpeechClick();
  };

  const handlePause = () => {
    pauseSpeaking();
    setLocalAudioState('paused');
  };

  const handleReplay = async () => {
    if (!speechText) return;
    stopSpeaking();
    setLocalAudioState('playing');
    await speak(speechText, resolvedCharacter.id, () => {
      setLocalAudioState('idle');
    });
    if (onSpeechClick) onSpeechClick();
  };

  const activeSpeaking = isThisBubbleSpeaking || localAudioState === 'playing';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Animated Mascot Vector Avatar */}
      <div 
        onClick={openCharacterHub}
        title={`Active Companion: ${resolvedCharacter.name} (Click to open Character Hub)`}
        className="cursor-pointer group relative"
      >
        <CharacterAvatar
          characterId={resolvedCharacter.id}
          pose={pose}
          size={size}
          isSpeaking={activeSpeaking}
          amplitude={audioAmplitude}
        />
        {/* Subtle hover pulse indicator */}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-bold font-mono bg-[#1E293B] text-white px-1.5 py-0.5 rounded-md shadow-sm whitespace-nowrap pointer-events-none">
          Change
        </span>
      </div>

      {/* Interactive Speech Bubble with Audio Controls & Waveform */}
      {showSpeech && speechText && (
        <div className="relative max-w-sm bg-white dark:bg-[#1F2937] border border-[#E5E0D8] dark:border-slate-700/80 rounded-2xl p-3.5 shadow-sm transition-all">
          {/* Bubble Arrow */}
          <div className="absolute -left-2 top-5 w-3 h-3 bg-white dark:bg-[#1F2937] border-l border-b border-[#E5E0D8] dark:border-slate-700/80 transform rotate-45" />

          <p className="text-sm font-medium text-[#172033] dark:text-[#F9FAFB] leading-relaxed">
            {speechText}
          </p>

          {/* Audio Controls Toolbar: PLAY, PAUSE, REPLAY + ELEVENLABS BADGE */}
          <div className="mt-2.5 flex items-center justify-between gap-3 pt-2 border-t border-[#EFECE6] dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#35A86B] animate-pulse" />
                {resolvedCharacter.name.split(' ')[0]}
                {activeSpeaking && (
                  <span className="flex items-center gap-0.5 ml-1">
                    <span className="w-0.5 h-2 bg-[#3157D5] animate-bounce [animation-delay:0ms]" />
                    <span className="w-0.5 h-3 bg-[#3157D5] animate-bounce [animation-delay:150ms]" />
                    <span className="w-0.5 h-2 bg-[#3157D5] animate-bounce [animation-delay:300ms]" />
                  </span>
                )}
              </span>

              {/* ElevenLabs AI Voice Badge */}
              {showVoiceBadge && (
                <button
                  onClick={openCharacterHub}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-semibold transition-colors cursor-pointer ${
                    hasElevenLabsKey
                      ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-purple-500'
                  }`}
                  title={hasElevenLabsKey ? 'ElevenLabs AI Voice Active' : 'Configure ElevenLabs Key in Character Hub'}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{hasElevenLabsKey ? 'ElevenLabs' : 'Voice AI'}</span>
                </button>
              )}
            </div>

            {/* Audio Action Controls */}
            <div className="flex items-center gap-1">
              {activeSpeaking && !isThisBubblePaused ? (
                <button
                  onClick={handlePause}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-[#F0A63A]/15 text-[#B45309] dark:text-[#F0A63A] border border-[#F0A63A]/30 cursor-pointer"
                  title="Pause voice"
                >
                  <Pause size={11} />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={handlePlay}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-[#3157D5] text-white hover:bg-[#2442B0] cursor-pointer shadow-2xs transition-transform active:scale-95"
                  title={`Listen in ${resolvedCharacter.name}'s voice`}
                >
                  <Play size={11} fill="currentColor" />
                  <span>{isThisBubblePaused ? 'Resume' : 'Listen'}</span>
                </button>
              )}

              <button
                onClick={handleReplay}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#172033] dark:hover:text-white hover:bg-[#F7F5F0] dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Replay explanation"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
