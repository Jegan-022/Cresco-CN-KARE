/**
 * Character Voice Engine Service
 *
 * Provides character speech synthesis via browser Web Speech API,
 * with tuned pitch/rate profiles and real-time rhythmic waveform animation.
 */

import { CharacterProfile, getCharacterById } from '../data/characters';

export interface VoicePlaybackCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onWaveform?: (amplitude: number) => void;
}

class CharacterVoiceService {
  private isMuted: boolean = false;
  private currentSpeechSynthesis: SpeechSynthesisUtterance | null = null;
  private isSpeakingState: boolean = false;
  private isPausedState: boolean = false;
  private heartbeatInterval: any = null;
  private animationFrameId: number | null = null;
  private activeCallbacks: VoicePlaybackCallbacks | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isMuted = localStorage.getItem('klu_sound_muted') === 'true';
    }
  }

  public getApiKey(): string {
    return '';
  }

  public setApiKey(_key: string): void {}

  public hasApiKey(): boolean {
    return false;
  }

  public async testApiKey(): Promise<{ valid: boolean; message: string }> {
    return { valid: true, message: 'Web Speech Synthesis active.' };
  }

  /**
   * Speaks text using the designated character's voice.
   */
  public async speak(
    text: string,
    characterOrId: CharacterProfile | string,
    callbacks?: VoicePlaybackCallbacks
  ): Promise<void> {
    if (!text || !text.trim()) {
      if (callbacks?.onEnd) callbacks.onEnd();
      return;
    }

    const cleanText = text.trim();
    const character: CharacterProfile =
      typeof characterOrId === 'string' ? getCharacterById(characterOrId) : characterOrId;

    this.stop();
    this.activeCallbacks = callbacks || null;
    this.isSpeakingState = true;
    this.isPausedState = false;

    if (callbacks?.onStart) callbacks.onStart();

    this.playBrowserSpeech(cleanText, character, callbacks);
  }

  /**
   * Browser Speech Synthesis tuned to character pitch/rate
   */
  private playBrowserSpeech(
    text: string,
    character: CharacterProfile,
    callbacks?: VoicePlaybackCallbacks
  ): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      this.cleanupPlayback();
      if (callbacks?.onEnd) callbacks.onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = character.fallbackVoice?.pitch || 1.1;
      utterance.rate = character.fallbackVoice?.rate || 1.0;
      utterance.volume = this.isMuted ? 0 : 0.95;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferred =
          voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) ||
          voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural')) ||
          voices.find((v) => v.lang.startsWith('en'));
        if (preferred) utterance.voice = preferred;
      }

      this.currentSpeechSynthesis = utterance;
      this.startSimulatedWaveform(callbacks?.onWaveform);
      this.startHeartbeat();

      utterance.onend = () => {
        this.cleanupPlayback();
        if (callbacks?.onEnd) callbacks.onEnd();
      };

      utterance.onerror = (e) => {
        this.cleanupPlayback();
        if (callbacks?.onError) callbacks.onError(e);
        if (callbacks?.onEnd) callbacks.onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.cleanupPlayback();
      if (callbacks?.onEnd) callbacks.onEnd();
    }
  }

  /**
   * Animates a lively wave rhythm for mouth and eye movement while audio plays
   */
  private startSimulatedWaveform(onWaveform?: (amp: number) => void): void {
    if (!onWaveform) return;
    let step = 0;
    const loop = () => {
      if (!this.isSpeakingState || this.isPausedState) {
        onWaveform(0);
        return;
      }
      step += 0.25;
      const amp = 0.3 + 0.5 * Math.abs(Math.sin(step) * Math.cos(step * 0.7));
      onWaveform(amp);
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis && this.isSpeakingState && !this.isPausedState) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 9000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private cleanupPlayback(): void {
    this.stopHeartbeat();
    this.isSpeakingState = false;
    this.isPausedState = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.activeCallbacks?.onWaveform) {
      this.activeCallbacks.onWaveform(0);
    }
  }

  public pause(): void {
    this.isPausedState = true;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }

  public resume(): void {
    this.isPausedState = false;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }

  public stop(): void {
    this.cleanupPlayback();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.currentSpeechSynthesis = null;
  }

  public get isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public get isPaused(): boolean {
    return this.isPausedState;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('klu_sound_muted', String(muted));
    }
  }
}

export const characterVoice = new CharacterVoiceService();
