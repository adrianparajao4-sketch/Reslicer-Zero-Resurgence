/**
 * Procedural Web Audio Engine for RESLICER: Zero Resurgence
 * Generates authentic 16-bit action platformer BGM and SFX without external audio files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private isBgmPlaying = false;
  private bgmTimer: number | null = null;
  private currentTrack: 'STAGE' | 'BOSS' | 'TITLE' | 'NONE' = 'NONE';
  private step = 0;

  // Charge hum tracking
  private chargeOsc: OscillatorNode | null = null;
  private chargeGain: GainNode | null = null;

  // Volume settings
  public sfxVolume = 0.6;
  public bgmVolume = 0.4;
  public muted = false;

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = this.bgmVolume;
      this.bgmGain.connect(this.masterGain);
    } catch {
      // AudioContext not allowed before user gesture
    }
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public setVolumes(sfx: number, bgm: number) {
    this.sfxVolume = sfx;
    this.bgmVolume = bgm;
    if (this.ctx) {
      if (this.sfxGain) this.sfxGain.gain.setValueAtTime(sfx, this.ctx.currentTime);
      if (this.bgmGain) this.bgmGain.gain.setValueAtTime(bgm, this.ctx.currentTime);
    }
  }

  // ==========================================
  // SOUND EFFECTS
  // ==========================================

  public playBusterShoot() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public startChargeHum() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.chargeOsc) return;
    const now = this.ctx.currentTime;

    this.chargeOsc = this.ctx.createOscillator();
    this.chargeGain = this.ctx.createGain();

    this.chargeOsc.type = 'triangle';
    this.chargeOsc.frequency.setValueAtTime(300, now);
    this.chargeOsc.frequency.linearRampToValueAtTime(950, now + 1.2);

    this.chargeGain.gain.setValueAtTime(0.05, now);
    this.chargeGain.gain.linearRampToValueAtTime(0.25, now + 1.2);

    this.chargeOsc.connect(this.chargeGain);
    this.chargeGain.connect(this.sfxGain);

    this.chargeOsc.start(now);
  }

  public stopChargeHum() {
    if (this.chargeOsc && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.chargeGain?.gain.linearRampToValueAtTime(0.01, now + 0.05);
        this.chargeOsc.stop(now + 0.05);
      } catch {}
      this.chargeOsc = null;
      this.chargeGain = null;
    }
  }

  public playChargedShot(level: 2 | 3) {
    this.resume();
    this.stopChargeHum();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = level === 3 ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(level === 3 ? 350 : 600, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

    gain.gain.setValueAtTime(level === 3 ? 0.7 : 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);

    if (level === 3) {
      // Add explosion sub-bass kick
      this.playExplosion(false);
    }
  }

  public playSaberSlash(comboStep: number = 1) {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Filtered noise swoosh
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const baseFreq = comboStep === 3 ? 1800 : comboStep === 2 ? 2400 : 3000;
    filter.frequency.setValueAtTime(baseFreq, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    // Blade resonant hum
    const bladeOsc = this.ctx.createOscillator();
    const bladeGain = this.ctx.createGain();
    bladeOsc.type = 'sawtooth';
    bladeOsc.frequency.setValueAtTime(700 + comboStep * 150, now);
    bladeOsc.frequency.exponentialRampToValueAtTime(150, now + 0.18);
    bladeGain.gain.setValueAtTime(0.25, now);
    bladeGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    bladeOsc.connect(bladeGain);
    bladeGain.connect(this.sfxGain);

    noise.start(now);
    bladeOsc.start(now);
    bladeOsc.stop(now + 0.18);
  }

  public playSaberHit() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playDeflect() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // High pitched metallic ping + rising harmonic chime
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1600, now);
    osc1.frequency.exponentialRampToValueAtTime(3200, now + 0.14);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2400, now);
    osc2.frequency.exponentialRampToValueAtTime(4200, now + 0.14);

    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.14);
    osc2.stop(now + 0.14);
  }

  public playPiercingThrust() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Sonic shockwave whoosh + high-energy plasma surge
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.linearRampToValueAtTime(1400, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.22);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playShieldBash() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Heavy blunt kinetic impact crunch + low sub boom
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.16);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playStunElectric() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Crackling paralysis buzz
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.setValueAtTime(950, now + 0.05);
    osc.frequency.setValueAtTime(600, now + 0.1);
    osc.frequency.setValueAtTime(1100, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playAegisShot() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playDash() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(250, now + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  public playJump() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playWallSlide() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600 + Math.random() * 200, now);
    osc.frequency.setValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playExplosion(large = false) {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const duration = large ? 0.45 : 0.25;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(large ? 400 : 600, now);
    filter.frequency.exponentialRampToValueAtTime(50, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(large ? 0.6 : 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  public playHurt() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(70, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playPickup() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.2, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.04 + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.08);
    });
  }

  public playBossAlarm() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Siren beep dual tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.setValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  public playCodecBeep() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // ==========================================
  // CHIPTUNE BGM SYNTHESIZER
  // ==========================================

  public playMusic(track: 'STAGE' | 'BOSS' | 'TITLE') {
    this.resume();
    if (this.currentTrack === track && this.isBgmPlaying) return;
    this.stopMusic();

    this.currentTrack = track;
    this.isBgmPlaying = true;
    this.step = 0;

    // 16-step sequencer pattern loop
    const stepDuration = track === 'BOSS' ? 120 : 135; // ms per 16th note

    this.bgmTimer = window.setInterval(() => {
      this.playSequencerStep();
    }, stepDuration);
  }

  public stopMusic() {
    this.isBgmPlaying = false;
    this.currentTrack = 'NONE';
    if (this.bgmTimer !== null) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private playSequencerStep() {
    if (!this.ctx || !this.bgmGain || !this.isBgmPlaying) return;
    const now = this.ctx.currentTime;
    const s = this.step % 32;

    // Stage Melody (D Minor Cyber Platformer Theme)
    const stageBassNotes = [
      146.83, 146.83, 174.61, 146.83, // D3, D3, F3, D3
      130.81, 130.81, 146.83, 164.81, // C3, C3, D3, E3
      116.54, 116.54, 130.81, 146.83, // Bb2, Bb2, C3, D3
      130.81, 146.83, 164.81, 174.61  // C3, D3, E3, F3
    ];

    const stageLeadNotes = [
      587.33, 0, 587.33, 698.46, // D5, -, D5, F5
      659.25, 587.33, 523.25, 0, // E5, D5, C5, -
      466.16, 0, 523.25, 587.33, // Bb4, -, C5, D5
      523.25, 466.16, 440.00, 523.25 // C5, Bb4, A4, C5
    ];

    // Boss Battle Melody (Faster, menacing Phrygian / Diminished scale)
    const bossBassNotes = [
      110.0, 110.0, 116.54, 110.0, // A2, A2, Bb2, A2
      123.47, 116.54, 110.0, 98.0,  // B2, Bb2, A2, G2
      110.0, 138.59, 130.81, 110.0, // A2, C#3, C3, A2
      146.83, 138.59, 116.54, 110.0  // D3, C#3, Bb2, A2
    ];

    const bossLeadNotes = [
      440.0, 466.16, 554.37, 440.0,
      0, 466.16, 440.0, 392.0,
      440.0, 554.37, 587.33, 659.25,
      587.33, 554.37, 466.16, 440.0
    ];

    const isBoss = this.currentTrack === 'BOSS';
    const bassList = isBoss ? bossBassNotes : stageBassNotes;
    const leadList = isBoss ? bossLeadNotes : stageLeadNotes;

    const bassFreq = bassList[s % bassList.length];
    const leadFreq = leadList[s % leadList.length];

    // Play Bass Note (Triangle/Square)
    if (bassFreq > 0) {
      const bOsc = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bOsc.type = 'triangle';
      bOsc.frequency.setValueAtTime(bassFreq, now);

      bGain.gain.setValueAtTime(0.2, now);
      bGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      bOsc.connect(bGain);
      bGain.connect(this.bgmGain);

      bOsc.start(now);
      bOsc.stop(now + 0.1);
    }

    // Play Lead Note (Square pulse)
    if (leadFreq > 0) {
      const lOsc = this.ctx.createOscillator();
      const lGain = this.ctx.createGain();
      lOsc.type = 'square';
      lOsc.frequency.setValueAtTime(leadFreq, now);

      lGain.gain.setValueAtTime(0.12, now);
      lGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      lOsc.connect(lGain);
      lGain.connect(this.bgmGain);

      lOsc.start(now);
      lOsc.stop(now + 0.12);
    }

    // Snare / Hi-Hat Percussion on 2 & 4
    if (s % 4 === 2) {
      // Snare noise
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const nSrc = this.ctx.createBufferSource();
      nSrc.buffer = buffer;
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.12, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      nSrc.connect(nGain);
      nGain.connect(this.bgmGain);
      nSrc.start(now);
    } else if (s % 2 === 0) {
      // Hi-hat tick
      const hOsc = this.ctx.createOscillator();
      const hGain = this.ctx.createGain();
      hOsc.type = 'highpass' as unknown as OscillatorType;
      hOsc.frequency.setValueAtTime(8000, now);
      hGain.gain.setValueAtTime(0.04, now);
      hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      hOsc.connect(hGain);
      hGain.connect(this.bgmGain);
      hOsc.start(now);
      hOsc.stop(now + 0.02);
    }

    this.step++;
  }
}

export const sound = new SoundEngine();
