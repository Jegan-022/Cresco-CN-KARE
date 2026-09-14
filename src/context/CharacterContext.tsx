import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CHARACTERS, CharacterId, CharacterProfile, getCharacterById } from '../data/characters';
import { characterVoice } from '../services/characterVoice';

interface CharacterContextType {
  characters: CharacterProfile[];
  activeCharacterId: CharacterId;
  activeCharacter: CharacterProfile;
  setActiveCharacterId: (id: CharacterId) => void;
  
  // Voice & Speech
  isSpeaking: boolean;
  isPaused: boolean;
  audioAmplitude: number;
  currentSpokenText: string | null;
  speak: (text: string, characterId?: CharacterId | string, onEnd?: () => void) => Promise<void>;
  stopSpeaking: () => void;
  pauseSpeaking: () => void;
  resumeSpeaking: () => void;

  // Character Hub UI Modal
  isCharacterHubOpen: boolean;
  openCharacterHub: () => void;
  closeCharacterHub: () => void;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCharacterId, setActiveCharacterIdState] = useState<CharacterId>('aria-vance');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioAmplitude, setAudioAmplitude] = useState(0);
  const [currentSpokenText, setCurrentSpokenText] = useState<string | null>(null);
  const [isCharacterHubOpen, setIsCharacterHubOpen] = useState(false);

  // Restore saved active character on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedChar = localStorage.getItem('netquest_active_character') as CharacterId;
      if (savedChar && CHARACTERS.some((c) => c.id === savedChar)) {
        setActiveCharacterIdState(savedChar);
      }
    }
  }, []);

  const activeCharacter = getCharacterById(activeCharacterId);

  const setActiveCharacterId = useCallback((id: CharacterId) => {
    setActiveCharacterIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('netquest_active_character', id);
    }
  }, []);


  const stopSpeaking = useCallback(() => {
    characterVoice.stop();
    setIsSpeaking(false);
    setIsPaused(false);
    setAudioAmplitude(0);
    setCurrentSpokenText(null);
  }, []);

  const pauseSpeaking = useCallback(() => {
    characterVoice.pause();
    setIsPaused(true);
  }, []);

  const resumeSpeaking = useCallback(() => {
    characterVoice.resume();
    setIsPaused(false);
  }, []);

  const speak = useCallback(
    async (text: string, characterId?: CharacterId | string, onEnd?: () => void) => {
      const targetChar = characterId ? getCharacterById(characterId) : activeCharacter;
      setCurrentSpokenText(text);

      await characterVoice.speak(text, targetChar, {
        onStart: () => {
          setIsSpeaking(true);
          setIsPaused(false);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setAudioAmplitude(0);
          setCurrentSpokenText(null);
          if (onEnd) onEnd();
        },
        onError: () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setAudioAmplitude(0);
          setCurrentSpokenText(null);
          if (onEnd) onEnd();
        },
        onWaveform: (amp) => {
          setAudioAmplitude(amp);
        },
      });
    },
    [activeCharacter]
  );

  const openCharacterHub = useCallback(() => setIsCharacterHubOpen(true), []);
  const closeCharacterHub = useCallback(() => setIsCharacterHubOpen(false), []);

  return (
    <CharacterContext.Provider
      value={{
        characters: CHARACTERS,
        activeCharacterId,
        activeCharacter,
        setActiveCharacterId,
        isSpeaking,
        isPaused,
        audioAmplitude,
        currentSpokenText,
        speak,
        stopSpeaking,
        pauseSpeaking,
        resumeSpeaking,
        isCharacterHubOpen,
        openCharacterHub,
        closeCharacterHub,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = (): CharacterContextType => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};
