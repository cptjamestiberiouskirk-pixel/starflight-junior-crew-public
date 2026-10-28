// tslint:disable
/* eslint-disable */
/**
 * Procedural Dynamic Interactive Music Engine for Starflight.
 * 
 * Synthesizes location/mood-driven interactive soundtracks that loop seamlessly without gaps:
 * - Starport Theme: Upbeat, cheeky orchestral & synth groove (brass stabs, syncopated bass, lively workplace comedic tone).
 * - Space Flight Theme: Wonder, deep cosmic arpeggios, atmospheric pads, sparkling starry synth leads.
 * - Planetary Surface Theme: Quiet, mysterious, curious exploration ambient soundscape with gentle acoustic/marimba resonance.
 * - Combat & Encounter Theme: Driving, tense, rhythmic pulses, ominous bass drones, urgent battle tempo.
 * - Solemn / Memorial Theme: Sincere, sparse, poignant piano & cello chords with quiet emotional resonance.
 */

export type MusicTheme = 'starport' | 'space' | 'surface' | 'combat' | 'solemn';

export class ProceduralMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentTheme: MusicTheme = 'starport';
  private isPlaying = false;
  private isMuted = false;
  private volume = 0.45;
  private timerId: number | null = null;
  private stepIndex = 0;
  private tempo = 120; // BPM
  private nextStepTime=0;
  private pauseTimerId:number|null=null;
  private notes=new Set<{source:AudioScheduledSourceNode;gain:GainNode;nodes:AudioNode[]}>();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('playground-mute', (e: Event) => {
        const customEvent = e as CustomEvent<{ muted: boolean }>;
        if (typeof customEvent.detail?.muted === 'boolean') {
          this.setMuted(customEvent.detail.muted);
        }
      });
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (typeof window === 'undefined') return null;

    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;

    try {
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      const initialGain = this.isMuted||!this.isPlaying ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(initialGain, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      const unlock = () => {
        if (this.isPlaying && this.ctx && this.ctx.state === 'suspended') {
          void this.ctx.resume().catch(() => {});
        }
      };
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
      window.addEventListener('touchstart', unlock, { once: true });
      return this.ctx;
    } catch {
      return null;
    }
  }

  setTheme(theme: MusicTheme) {
    if (this.currentTheme === theme) return;
    this.clearNotes();
    this.currentTheme = theme;
    this.stepIndex = 0;
    this.nextStepTime=this.ctx?this.ctx.currentTime+.04:0;
    if (theme === 'combat') this.tempo = 136;
    else if (theme === 'starport') this.tempo = 120;
    else if (theme === 'surface') this.tempo = 90;
    else if (theme === 'space') this.tempo = 80;
    else if (theme === 'solemn') this.tempo = 68;
  }

  setVolume(vol: number) {
    this.volume = Number.isFinite(vol)?Math.max(0, Math.min(1, vol)):0;
    this.applyGain();
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.applyGain();
    }
  }

  start() {
    const ctx = this.ensureContext();
    if (!ctx) {this.isPlaying=false;return;}
    if(this.pauseTimerId!==null){window.clearTimeout(this.pauseTimerId);this.pauseTimerId=null;}
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }
    if(this.isPlaying)return;
    this.isPlaying = true;
    this.applyGain();
    if(this.nextStepTime<ctx.currentTime)this.nextStepTime=ctx.currentTime+.02;
    this.scheduleLoop();
  }

  stop(reset=false) {
    this.isPlaying = false;
    this.applyGain();
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    if(reset){this.clearNotes();this.stepIndex=0;this.nextStepTime=0;}
    if(this.ctx?.state==='running'&&this.pauseTimerId===null) {
      this.pauseTimerId=window.setTimeout(()=>{
        this.pauseTimerId=null;
        if(!this.isPlaying&&this.ctx?.state==='running')void this.ctx.suspend().catch(()=>{});
      },100);
    }
  }

  private applyGain() {
    if(!this.masterGain||!this.ctx)return;
    const gain=this.masterGain.gain,now=this.ctx.currentTime;
    gain.cancelScheduledValues(now);
    gain.setTargetAtTime(this.isPlaying&&!this.isMuted?this.volume:0,now,.015);
  }

  private clearNotes() {
    const now=this.ctx?.currentTime??0;
    for(const note of this.notes) {
      try {
        note.gain.gain.cancelScheduledValues(now);
        note.gain.gain.setValueAtTime(note.gain.gain.value,now);
        note.gain.gain.linearRampToValueAtTime(0,now+.04);
        note.source.stop(now+.04);
      } catch { /* A note may already have ended. */ }
    }
  }

  private rememberNote(source:AudioScheduledSourceNode,gain:GainNode,nodes:AudioNode[]) {
    const note={source,gain,nodes};this.notes.add(note);
    source.onended=()=>{
      this.notes.delete(note);
      for(const node of [source,...nodes])try{node.disconnect();}catch{}
    };
  }

  private scheduleLoop = () => {
    if (!this.isPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) {
      this.timerId = window.setTimeout(this.scheduleLoop, 200);
      return;
    }

    const now = ctx.currentTime;
    const stepDuration = (60 / this.tempo) / 2; // Eighth note duration
    // Schedule on the audio clock. A delayed JS callback skips expired steps;
    // it never bursts a backlog of notes or drifts the score with render load.
    if(this.nextStepTime<now)this.nextStepTime=now+.02;
    while(this.nextStepTime<now+.12) {
      this.playThemeStep(this.nextStepTime,this.currentTheme,this.stepIndex);
      this.stepIndex=(this.stepIndex+1)%32;
      this.nextStepTime+=stepDuration;
    }
    this.timerId=window.setTimeout(this.scheduleLoop,25);
  };

  private playThemeStep(now: number, theme: MusicTheme, step: number) {
    if (!this.ctx || !this.masterGain || this.isMuted || this.volume <= 0) return;

    if (theme === 'starport') {
      // Upbeat, cheeky workplace groove (A minor / D dorian groove)
      // Bassline (Triangle + Sub)
      const bassNotes = [110, 110, 146.83, 110, 130.81, 110, 164.81, 146.83];
      if (step % 2 === 0) {
        const freq = bassNotes[(step / 2) % bassNotes.length];
        this.synthTone(now, freq, 'triangle', 0.22, 0.12, 0.02, 0.18);
        this.synthTone(now, freq / 2, 'sine', 0.25, 0.14, 0.01, 0.2);
      }

      // Snappy Brass / Synth stabs on beats 2 & 4
      if (step % 8 === 2 || step % 8 === 6) {
        const chord = step % 16 < 8 ? [220, 261.63, 329.63] : [293.66, 349.23, 440];
        chord.forEach((f) => {
          this.synthTone(now, f, 'sawtooth', 0.18, 0.06, 0.01, 0.15, 1400);
        });
      }

      // Playful melodic staccato bleeps
      const leadMelody = [0, 523.25, 0, 587.33, 659.25, 0, 783.99, 880];
      const leadFreq = leadMelody[step % leadMelody.length];
      if (leadFreq > 0) {
        this.synthTone(now, leadFreq, 'square', 0.12, 0.04, 0.005, 0.1, 2400);
      }

      // Hi-hat groove
      this.synthNoise(now, 0.03, 0.02, 6000, 12000);
    } else if (theme === 'space') {
      // Cosmic wonder, slow arpeggios, deep pads, starry synth leads (C Lydian / E minor)
      // Deep Cosmic Bass Drone
      if (step % 16 === 0) {
        const droneFreq = step < 16 ? 65.41 : 82.41;
        this.synthTone(now, droneFreq, 'sine', 3.5, 0.2, 0.5, 2.5);
        this.synthTone(now, droneFreq * 1.5, 'triangle', 3.0, 0.08, 0.8, 2.0);
      }

      // Crystalline Arpeggios (Pentatonic)
      const spaceArp = [261.63, 329.63, 392.0, 493.88, 587.33, 659.25, 783.99, 987.77];
      const arpNote = spaceArp[(step * 3) % spaceArp.length];
      this.synthTone(now, arpNote, 'sine', 0.45, 0.06, 0.02, 0.4, 3000);

      // Shimmering Star Sparkles
      if (step % 4 === 1) {
        const sparkleFreq = 1046.5 + (step % 7) * 110;
        this.synthTone(now, sparkleFreq, 'sine', 0.3, 0.03, 0.01, 0.25);
      }
    } else if (theme === 'surface') {
      // Quiet, mysterious, curious exploration ambient soundscape (Marimba / Acoustic pings)
      // Warm marimba acoustic resonance
      const marimbaNotes = [196.0, 246.94, 293.66, 369.99, 440.0, 493.88, 587.33, 739.99];
      if (step % 2 === 0 || step % 7 === 0) {
        const mFreq = marimbaNotes[(step * 2) % marimbaNotes.length];
        this.synthTone(now, mFreq, 'sine', 0.35, 0.1, 0.005, 0.3, 1800);
        this.synthTone(now, mFreq * 2.02, 'sine', 0.15, 0.04, 0.005, 0.12);
      }

      // Whispering wind pad
      if (step % 16 === 0) {
        this.synthNoise(now, 2.0, 0.025, 400, 1200);
        this.synthTone(now, 146.83, 'triangle', 2.5, 0.08, 0.6, 1.8);
      }
    } else if (theme === 'combat') {
      // Driving, tense, rhythmic pulses, urgent battle tempo (D minor, 136 BPM)
      // Driving 16th-note Sawtooth Bass Pulse
      const cBass = step % 8 < 4 ? 73.42 : step % 16 < 8 ? 87.31 : 65.41;
      this.synthTone(now, cBass, 'sawtooth', 0.14, 0.15, 0.01, 0.12, 900);
      this.synthTone(now, cBass / 2, 'sine', 0.16, 0.16, 0.005, 0.14);

      // Urgent War Snare / Noise Blast
      if (step % 4 === 2) {
        this.synthNoise(now, 0.08, 0.12, 1000, 4000);
      }

      // Ominous Stabs
      if (step % 8 === 0 || step % 8 === 6) {
        const stabChord = [146.83, 174.61, 220.0, 277.18];
        stabChord.forEach((f) => {
          this.synthTone(now, f, 'sawtooth', 0.2, 0.08, 0.01, 0.18, 2200);
        });
      }
    } else if (theme === 'solemn') {
      // Sincere, sparse, poignant piano & cello chords (A minor / F major / D minor)
      if (step % 16 === 0) {
        const chordIndex = Math.floor(step / 16) % 2;
        const roots = [110, 87.31]; // A2, F2
        const root = roots[chordIndex];

        // Low Cello Bow Swell
        this.synthTone(now, root, 'sawtooth', 3.8, 0.09, 0.8, 2.8, 700);
        this.synthTone(now, root * 1.5, 'triangle', 3.5, 0.07, 0.7, 2.5);

        // Poignant Rhodes / Piano arpeggio
        const pianoChord = chordIndex === 0 ? [220, 261.63, 329.63, 440] : [174.61, 220, 261.63, 349.23];
        pianoChord.forEach((pf, pi) => {
          this.synthTone(now + pi * 0.25, pf, 'sine', 1.8, 0.08, 0.02, 1.6);
        });
      }
    }
  }

  private synthTone(
    now: number,
    freq: number,
    type: OscillatorType,
    duration: number,
    gain: number,
    attack = 0.02,
    release = 0.2,
    filterFreq?: number,
  ) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(gain, now + attack);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);

      if (filterFreq) {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterFreq, now);
        osc.connect(filter);
        filter.connect(gainNode);
        this.rememberNote(osc,gainNode,[filter,gainNode]);
      } else {
        osc.connect(gainNode);
        this.rememberNote(osc,gainNode,[gainNode]);
      }

      gainNode.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + duration + release + 0.05);
    } catch {
      // Ignore audio scheduling blips
    }
  }

  private synthNoise(
    now: number,
    duration: number,
    gain: number,
    filterFrom = 1000,
    filterTo = 200,
  ) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = Math.max(128, Math.floor(sampleRate * duration));
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const src = this.ctx.createBufferSource();
      src.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(filterFrom, now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(20, filterTo), now + duration);

      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(gain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      src.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);

      this.rememberNote(src,gainNode,[filter,gainNode]);

      src.start(now);
      src.stop(now + duration + 0.02);
    } catch {
      // Ignore noise synthesis blips
    }
  }
}

export const proceduralMusic = new ProceduralMusicEngine();
