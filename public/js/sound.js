/**
 * Donkr Web Audio API Synthesizer
 * Generates realistic and comedic equine sound effects with zero external audio files.
 */
class DonkrSound {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn('Web Audio not supported', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound(enable = !this.enabled) {
    this.enabled = enable;
    return this.enabled;
  }

  /**
   * Signature comedic Donkey Bray: "HEEEE - HAWWW - HEEEE - HAWWW!"
   */
  playBray() {
    if (!this.enabled || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.25, t);
    masterGain.connect(this.ctx.destination);

    // Phrase 1: HEEE (rising pitch, bright formant)
    this._braySyllable(t, 0.45, 420, 680, 0.35, masterGain);
    // Phrase 1: HAWWW (falling pitch, deep resonant formant)
    this._braySyllable(t + 0.48, 0.75, 540, 210, 0.45, masterGain);

    // Phrase 2: Inhale/Short Hee
    this._braySyllable(t + 1.28, 0.35, 390, 580, 0.25, masterGain);
    // Phrase 2: Deep trailing HAWWW
    this._braySyllable(t + 1.65, 0.9, 480, 180, 0.4, masterGain);
  }

  _braySyllable(startTime, duration, startFreq, endFreq, peakGain, targetNode) {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Sawtooth + square wave creates rich brassy harmonic equine bray
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(startFreq, startTime);
    osc1.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

    osc2.frequency.setValueAtTime(startFreq * 1.01, startTime);
    osc2.frequency.exponentialRampToValueAtTime(endFreq * 0.99, startTime + duration);

    // Formant filter (nasal donkey throat resonance)
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(startFreq * 1.8, startTime);
    filter.frequency.exponentialRampToValueAtTime(endFreq * 1.5, startTime + duration);
    filter.Q.setValueAtTime(3.5, startTime);

    // Envelope
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(peakGain, startTime + duration * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(targetNode);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  /**
   * Crisp pop sound on swipe or button press
   */
  playPop(freq = 440) {
    if (!this.enabled || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.3, t + 0.08);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Card swish air whoosh
   */
  playSwish() {
    if (!this.enabled || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Triumphant match fanfare chime
   */
  playMatchFanfare() {
    if (!this.enabled || !this.ctx) return;
    this.resume();

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C major chord arpeggio
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.65);
    });

    // Followed by a gentle bray of joy
    setTimeout(() => {
      this.playBray();
    }, 550);
  }

  /**
   * Ascending Super Bray chime
   */
  playSuperLike() {
    if (!this.enabled || !this.ctx) return;
    this.resume();

    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }
}

window.DonkrSound = new DonkrSound();
