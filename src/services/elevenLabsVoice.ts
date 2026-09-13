/**
 * ElevenLabs AI Text-to-Speech & Voice Engine Service
 *
 * Provides high-fidelity character voices via ElevenLabs API,
 * with audio caching, real-time waveform callbacks, and
 * seamless fallback to customized Web Speech synthesis.
 */

import { CharacterProfile, getCharacterById } from '../data/characters';

export interface VoicePlaybackCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onWaveform?: (amplitude: number) => void;
}

class ElevenLabsVoiceService {
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache: Map<string, string> = new Map(); // key -> objectUrl
  private isMuted: boolean = false;
  private currentSpeechSynthesis: SpeechSynthesisUtterance | null = null;
  private isSpeakingState: boolean = false;
  private isPausedState: boolean = false;
  private animationFrameId: number | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private activeCallbacks: VoicePlaybackCallbacks | null = null;

  constructor() {
    // Check muted state from localStorage
    if (typeof window !== 'undefined') {
      this.isMuted = localStorage.getItem('klu_sound_muted') === 'true';
    }
  }

  /**
   * Retrieves the current active ElevenLabs API key
   * Priority: localStorage > import.meta.env.VITE_ELEVENLABS_API_KEY
   */
  public getApiKey(): string {
    if (typeof window !== 'undefined') {
      const localKey = localStorage.getItem('klu_elevenlabs_api_key');
      if (localKey && localKey.trim()) return localKey.trim();
    }
    const envKey = (import.meta as any).env?.VITE_ELEVENLABS_API_KEY || '';
    return envKey.trim();
  }

  /**
   * Saves or clears the user's ElevenLabs API key
   */
  public setApiKey(key: string): void {
    if (typeof window !== 'undefined') {
      if (key && key.trim()) {
        localStorage.setItem('klu_elevenlabs_api_key', key.trim());
      } else {
        localStorage.removeItem('klu_elevenlabs_api_key');
      }
    }
  }

  /**
   * Checks whether an ElevenLabs API key is configured
   */
  public hasApiKey(): boolean {
    return !!this.getApiKey();
  }

  /**
   * Quick live API Key test verification against ElevenLabs
   */
  public async testApiKey(keyToTest?: string): Promise<{ valid: boolean; message: string }> {
    const key = keyToTest?.trim() || this.getApiKey();
    if (!key) {
      return { valid: false, message: 'No API key provided. Please enter your ElevenLabs API Key.' };
    }
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: { 'xi-api-key': key },
      });
      if (res.ok) {
        const data = await res.json();
        const tier = data?.subscription?.tier || 'active';
        const characterCount = data?.subscription?.character_count || 0;
        const characterLimit = data?.subscription?.character_limit || 10000;
        return {
          valid: true,
          message: `Connected! Tier: ${tier} (${characterCount}/${characterLimit} characters used).`,
        };
      } else if (res.status === 401) {
        return { valid: false, message: 'Invalid API Key. Please check your ElevenLabs credentials.' };
      } else {
        return { valid: false, message: `ElevenLabs returned HTTP status ${res.status}.` };
      }
    } catch (e: any) {
      return { valid: false, message: `Connection test error: ${e.message || 'Network unavailable'}` };
    }
  }

  /**
   * Speaks text using the designated character's voice.
   * Attempts ElevenLabs first if API key is present; otherwise gracefully falls back to tuned Web Speech.
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

    // Stop any existing playback
    this.stop();
    this.activeCallbacks = callbacks || null;
    this.isSpeakingState = true;
    this.isPausedState = false;

    if (callbacks?.onStart) callbacks.onStart();

    const apiKey = this.getApiKey();

    // 1. Try ElevenLabs API if key is present
    if (apiKey) {
      try {
        const audioUrl = await this.fetchElevenLabsAudio(cleanText, character, apiKey);
        if (audioUrl) {
          this.playAudioUrl(audioUrl, callbacks);
          return;
        }
      } catch (err) {
        console.warn('ElevenLabs generation failed, falling back to Web Speech Synthesis:', err);
      }
    }

    // 2. Fallback: High-quality tuned browser Speech Synthesis
    this.playBrowserFallback(cleanText, character, callbacks);
  }

  /**
   * Calls the ElevenLabs text-to-speech endpoint with caching
   */
  private async fetchElevenLabsAudio(
    text: string,
    character: CharacterProfile,
    apiKey: string
  ): Promise<string | null> {
    const cacheKey = `${character.elevenLabsVoiceId}_${text}`;
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    const voiceId = character.elevenLabsVoiceId || '21m00Tcm4TlvDq8ikWAM';
    const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: character.voiceSettings?.stability ?? 0.5,
          similarity_boost: character.voiceSettings?.similarity_boost ?? 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`ElevenLabs API returned ${response.status}: ${errText}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    this.audioCache.set(cacheKey, objectUrl);
    return objectUrl;
  }

  /**
   * Plays synthesized ElevenLabs audio and tracks waveform
   */
  private playAudioUrl(url: string, callbacks?: VoicePlaybackCallbacks): void {
    try {
      const audio = new Audio(url);
      this.currentAudio = audio;
      audio.volume = this.isMuted ? 0 : 1.0;

      // Real-time mouth pulse animation
      this.startSimulatedWaveform(callbacks?.onWaveform);

      audio.onended = () => {
        this.cleanupPlayback();
        if (callbacks?.onEnd) callbacks.onEnd();
      };

      audio.onerror = (e) => {
        this.cleanupPlayback();
        if (callbacks?.onError) callbacks.onError(e);
        if (callbacks?.onEnd) callbacks.onEnd();
      };

      audio.play().catch((err) => {
        console.warn('Audio play error:', err);
        this.cleanupPlayback();
        if (callbacks?.onError) callbacks.onError(err);
        if (callbacks?.onEnd) callbacks.onEnd();
      });
    } catch (e) {
      this.cleanupPlayback();
      if (callbacks?.onEnd) callbacks.onEnd();
    }
  }

  /**
   * Browser Speech Synthesis fallback tuned to character pitch/rate
   */
  private playBrowserFallback(
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
      utterance.pitch = character.fallbackVoice.pitch || 1.1;
      utterance.rate = character.fallbackVoice.rate || 1.0;
      utterance.volume = this.isMuted ? 0 : 0.95;

      // Select matching gender / language voice if available
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
      // Synthesize rhythmic speech cadence (0.2 to 1.0)
      const amp = 0.3 + 0.5 * Math.abs(Math.sin(step) * Math.cos(step * 0.7));
      onWaveform(amp);
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private cleanupPlayback(): void {
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
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }

  public resume(): void {
    this.isPausedState = false;
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }

  public stop(): void {
    this.cleanupPlayback();
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }
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
    if (this.currentAudio) {
      this.currentAudio.volume = muted ? 0 : 1.0;
    }
  }
}

export const elevenLabsVoice = new ElevenLabsVoiceService();
