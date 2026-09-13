// High-tech audio synthesizer using browser Web Audio API
class TelemetryAudio {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;

  constructor() {
    // Lazy initialized
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.playChime(587.33, 'triangle', 0.15); // D5
      setTimeout(() => this.playChime(880, 'sine', 0.2), 100); // A5
    }
    return this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  public playChime(freq = 660, type: OscillatorType = 'sine', duration = 0.18) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playSuccess() {
    if (!this.enabled) return;
    this.playChime(523.25, 'sine', 0.12);
    setTimeout(() => this.playChime(659.25, 'sine', 0.12), 90);
    setTimeout(() => this.playChime(783.99, 'sine', 0.22), 180);
  }

  public playCorrect() {
    this.playSuccess();
  }

  public playIncorrect() {
    if (!this.enabled) return;
    this.playChime(311.13, 'sawtooth', 0.12);
    setTimeout(() => this.playChime(277.18, 'sawtooth', 0.18), 90);
  }

  public playError() {
    this.playIncorrect();
  }

  public playLevelUp() {
    if (!this.enabled) return;
    this.playChime(440, 'triangle', 0.1);
    setTimeout(() => this.playChime(554.37, 'triangle', 0.1), 80);
    setTimeout(() => this.playChime(659.25, 'triangle', 0.1), 160);
    setTimeout(() => this.playChime(880, 'triangle', 0.25), 240);
  }

  public playPacketHop() {
    if (!this.enabled) return;
    this.playChime(1046.5, 'triangle', 0.06);
  }

  public playPacketPop() {
    this.playPacketHop();
  }
}

export const soundFx = new TelemetryAudio();
