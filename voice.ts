// tslint:disable
/* eslint-disable */
/**
 * Starflight Alien & Crew Voice Dialogue Engine.
 *
 * Implements voiced alien dialogue and crew banter voices with Web Audio API:
 *
 * 1. Alien Voice Base URL:
 *    https://raw.githubusercontent.com/cptjamestiberiouskirk-pixel/starflight-dispatch-voices/main/aliens/<m_id>.mp3
 * 2. Crew Voice Base URL:
 *    https://raw.githubusercontent.com/cptjamestiberiouskirk-pixel/starflight-dispatch-voices/main/crew/<hash>.mp3
 *    where <hash> is the FNV-1a 32-bit hash of the banter line's exact text as written in banter.ts
 *    (UTF-8 bytes; offset basis 0x811c9dc5, prime 0x01000193), formatted as 8 lowercase hex digits.
 * 3. Fetch with mode: 'cors', credentials: 'omit'. Decodes via Web Audio API decodeAudioData.
 * 4. In-memory LRU cache of the last 40 decoded AudioBuffers for alien lines and 40 for crew lines.
 * 5. Failed/Missing recordings: Stays silent, logs one warning (console.warn), marks line/hash permanently
 *    failed for the session, logs to console:
 *    - Alien: "[voice] line <id> no recording"
 *    - Crew: "[voice] crew <hash> no recording"
 * 6. Sequential Comm Voice Queueing:
 *    - Comm voices (aliens and player's captain) play sequentially in the order their lines appear.
 *    - Each comm voice starts when the previous one finishes.
 *    - Never cut a comm voice short, EXCEPT when comm link ends or encounter ends.
 *    - Waiting queue max capacity: 3. If a 4th comm voice arrives while 3 are waiting, drop the oldest waiting one.
 *    - Console log on queueing: "[voice] line <id> queued (<n> waiting)" where <n> is queue length after adding/dropping.
 *    - When playing from queue: logs normal playing log, or "[voice] line <id> no recording" and advances immediately.
 * 7. Crew Banter Concurrency & Priority:
 *    - Banter voices NEVER wait in the queue.
 *    - A banter line plays ONLY when no comm voice is playing AND no comm voice is waiting.
 *    - Otherwise, the banter line stays text only.
 * 8. Stopping:
 *    - stopVoice() / stopAllVoices() / stopAlienPlayback() stops active audio source, empties comm queue, and resets flags.
 */

import { PARSED_COMM_LINES, resolveRaceId } from './src/commData';
import { getAllBanterLines } from './banter';

export const VOICE_BASE_URL =
  'https://raw.githubusercontent.com/cptjamestiberiouskirk-pixel/starflight-dispatch-voices/main/aliens';

export const CREW_VOICE_BASE_URL =
  'https://raw.githubusercontent.com/cptjamestiberiouskirk-pixel/starflight-dispatch-voices/main/crew';

/**
 * Encodes string to UTF-8 bytes with fallback support.
 */
export function stringToUtf8Bytes(str: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str);
  }
  const utf8: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(
        0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f),
      );
    } else {
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f),
      );
    }
  }
  return new Uint8Array(utf8);
}

/**
 * FNV-1a 32-bit hash algorithm:
 * Offset basis 0x811c9dc5, prime 0x01000193.
 * Returns 8 lowercase hex digits.
 */
export function fnv1a32(str: string): string {
  const bytes = stringToUtf8Bytes(str);
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

// Banter line lookup registry (exact lines from banter.ts)
let banterMapInitialized = false;
const banterTextToHash = new Map<string, string>();
const banterHashToText = new Map<string, string>();

export function initBanterMap(): void {
  if (banterMapInitialized) return;
  banterMapInitialized = true;
  const allLines = getAllBanterLines();
  for (const line of allLines) {
    const hash = fnv1a32(line);
    banterTextToHash.set(line, hash);
    banterTextToHash.set(line.trim(), hash);
    banterHashToText.set(hash, line);
  }
}

export function getBanterLineHash(line: string): string | null {
  initBanterMap();
  const trimmed = line.trim();
  return banterTextToHash.get(line) || banterTextToHash.get(trimmed) || null;
}

export function isBanterLine(line: string): boolean {
  return getBanterLineHash(line) !== null;
}

export class AudioBufferLRUCache {
  private cache = new Map<number, AudioBuffer>();
  private readonly maxSize: number;

  constructor(maxSize = 40) {
    this.maxSize = maxSize;
  }

  get(id: number): AudioBuffer | undefined {
    const item = this.cache.get(id);
    if (item) {
      this.cache.delete(id);
      this.cache.set(id, item);
    }
    return item;
  }

  set(id: number, buffer: AudioBuffer): void {
    if (this.cache.has(id)) {
      this.cache.delete(id);
    } else if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(id, buffer);
  }

  has(id: number): boolean {
    return this.cache.has(id);
  }

  size(): number {
    return this.cache.size;
  }

  clear(): void {
    this.cache.clear();
  }
}

export class StringLRUCache {
  private cache = new Map<string, AudioBuffer>();
  private readonly maxSize: number;

  constructor(maxSize = 40) {
    this.maxSize = maxSize;
  }

  get(key: string): AudioBuffer | undefined {
    const item = this.cache.get(key);
    if (item) {
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }

  set(key: string, buffer: AudioBuffer): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, buffer);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  size(): number {
    return this.cache.size;
  }

  clear(): void {
    this.cache.clear();
  }
}

export type VoiceStatusCallback = (status: 'playing' | 'no recording' | 'idle') => void;

export const RACE_ID_TO_FX_KEY: Record<number, string> = {
  1: 'elowan',
  2: 'gazurtoid',
  3: 'mechans',
  5: 'nomad',
  6: 'spemin',
  7: 'thrynn',
  8: 'veloxi',
  10: 'nomad',
  11: 'minstrels',
  19: 'noah',
};

export interface CommQueueItem {
  lineId: number;
  garbledRatio: number;
  raceKey?: number | string;
  raceParam?: number | string;
  text?: string;
  lineText?: string;
  onStatusChange?: VoiceStatusCallback;
}

export class AlienVoiceEngine {
  private ctx: AudioContext | null = null;
  private cache = new AudioBufferLRUCache(40);
  private crewCache = new StringLRUCache(40);
  private permanentlyFailedLines = new Set<number>();
  private permanentlyFailedCrewHashes = new Set<string>();
  private volume = 0.8; // Default 80%
  private isMuted = false;
  private effectsEnabled = true; // Default ON
  private banterEnabled = true; // Crew comedy toggle
  private currentPlayingLineId: number | null = null;
  private currentPlayingCrewHash: string | null = null;
  private crewEndsAt=0;
  private playbackId = 0;
  private crewPlaybackId = 0;

  // Comm voice sequential FIFO queue (max 3 waiting)
  private commQueue: CommQueueItem[] = [];
  private isCommVoiceActive = false;

  // Active nodes for alien playback
  private activeSources: AudioNode[] = [];
  private activeOscillators: OscillatorNode[] = [];
  private activeMasterGain: GainNode | null = null;
  private activeTimeoutId: number | null = null;

  // Active nodes for crew playback
  private activeCrewSources: AudioNode[] = [];
  private activeCrewMasterGain: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('playground-mute', (e: Event) => {
        const customEvent = e as CustomEvent<{ muted: boolean }>;
        if (typeof customEvent.detail?.muted === 'boolean') {
          this.setMuted(customEvent.detail.muted);
        }
      });

      // Resume context on first user interaction
      const unlock = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          void this.ctx.resume().catch(() => {});
        }
      };
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
      window.addEventListener('touchstart', unlock, { once: true });
    }
  }

  getAudioContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (typeof window === 'undefined') return null;

    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;

    try {
      this.ctx = new Ctor();
      return this.ctx;
    } catch {
      return null;
    }
  }

  setAudioContext(context: AudioContext | null) {
    this.ctx = context;
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    const targetGain = this.isMuted ? 0 : this.volume;
    if (this.activeMasterGain && this.ctx) {
      try {
        this.activeMasterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
      } catch {}
    }
    if (this.activeCrewMasterGain && this.ctx) {
      try {
        this.activeCrewMasterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
      } catch {}
    }
  }

  getVolume(): number {
    return this.volume;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    const targetGain = muted ? 0 : this.volume;
    if (this.activeMasterGain && this.ctx) {
      try {
        this.activeMasterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
      } catch {}
    }
    if (this.activeCrewMasterGain && this.ctx) {
      try {
        this.activeCrewMasterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
      } catch {}
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  setEffectsEnabled(enabled: boolean) {
    this.effectsEnabled = enabled;
  }

  getEffectsEnabled(): boolean {
    return this.effectsEnabled;
  }

  setBanterEnabled(enabled: boolean) {
    this.banterEnabled = enabled;
  }

  getBanterEnabled(): boolean {
    return this.banterEnabled;
  }

  isPlaying(): boolean {
    return this.isCommVoiceActive || this.currentPlayingCrewHash !== null;
  }

  isAlienVoicePlaying(): boolean {
    return this.isCommVoiceActive;
  }

  isCrewVoicePlaying(): boolean {
    return this.currentPlayingCrewHash !== null;
  }

  getCrewRemainingSeconds(){return this.currentPlayingCrewHash&&this.ctx?Math.max(0,this.crewEndsAt-this.ctx.currentTime):0;}

  getCurrentLineId(): number | null {
    return this.currentPlayingLineId;
  }

  getCurrentCrewHash(): string | null {
    return this.currentPlayingCrewHash;
  }

  getCommQueue(): CommQueueItem[] {
    return [...this.commQueue];
  }

  getQueueLength(): number {
    return this.commQueue.length;
  }

  getCache(): AudioBufferLRUCache {
    return this.cache;
  }

  getCrewCache(): StringLRUCache {
    return this.crewCache;
  }

  getPermanentlyFailedLines(): Set<number> {
    return this.permanentlyFailedLines;
  }

  getPermanentlyFailedCrewHashes(): Set<string> {
    return this.permanentlyFailedCrewHashes;
  }

  clearPermanentFailures(): void {
    this.permanentlyFailedLines.clear();
  }

  clearPermanentCrewFailures(): void {
    this.permanentlyFailedCrewHashes.clear();
  }

  resolveLineRace(lineId: number, raceParam?: number | string): number {
    if (typeof raceParam === 'number') return raceParam;
    if (typeof raceParam === 'string' && raceParam.trim()) {
      return resolveRaceId(raceParam);
    }
    const commEntry = PARSED_COMM_LINES.find((l) => l.id === lineId);
    if (commEntry) return commEntry.race;
    return 1;
  }

  resolveFxKey(raceId: number): string {
    if (!this.effectsEnabled || raceId === 16 || raceId === 4) {
      return 'off';
    }
    return RACE_ID_TO_FX_KEY[raceId] || 'off';
  }

  /**
   * Internal helper to clean up active playing audio nodes without wiping commQueue.
   */
  private cleanupActiveAudioNodes() {
    const sources = this.activeSources;
    this.activeSources = [];
    for (const src of sources) {
      try {
        // Stop can fire ended; detach it before cleanup to preserve the queue.
        if ('onended' in src) (src as AudioScheduledSourceNode).onended = null;
        if ('stop' in src && typeof (src as any).stop === 'function') {
          (src as any).stop();
        }
        src.disconnect();
      } catch {}
    }
    for (const osc of this.activeOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    }
    this.activeOscillators = [];

    if (this.activeTimeoutId !== null) {
      if (typeof window !== 'undefined') {
        window.clearTimeout(this.activeTimeoutId);
      } else {
        clearTimeout(this.activeTimeoutId);
      }
      this.activeTimeoutId = null;
    }

    this.activeMasterGain = null;
  }

  /**
   * Stops currently playing comm voice AND empties the waiting comm queue.
   */
  stopAlienPlayback() {
    this.playbackId++;
    this.commQueue = [];
    this.isCommVoiceActive = false;
    this.currentPlayingLineId = null;
    this.cleanupActiveAudioNodes();
  }

  /**
   * Alias for stopAlienPlayback.
   */
  stopVoice() {
    this.stopAlienPlayback();
  }

  /**
   * Stops any currently playing crew banter voice.
   */
  stopCrewVoice() {
    this.crewPlaybackId++;
    const sources = this.activeCrewSources;
    this.activeCrewSources = [];
    for (const src of sources) {
      try {
        if ('onended' in src) (src as AudioScheduledSourceNode).onended = null;
        if ('stop' in src && typeof (src as any).stop === 'function') {
          (src as any).stop();
        }
        src.disconnect();
      } catch {}
    }
    this.currentPlayingCrewHash = null;
    this.activeCrewMasterGain = null;
  }

  /**
   * Stops all active voices (comm and crew) and clears queue.
   */
  stop() {
    this.stopAlienPlayback();
    this.stopCrewVoice();
  }

  /**
   * Alias for stop.
   */
  stopAllVoices() {
    this.stop();
  }

  /**
   * Helper to trigger completion of current line for unit testing or lifecycle simulation.
   */
  finishCurrentCommLine(): void {
    const src = this.activeSources[0] as any;
    if (src && typeof src.onended === 'function') {
      src.onended();
    } else {
      this.onCommLineFinished();
    }
  }

  /**
   * Main entrypoint to play an alien/captain dialogue line.
   * Comm lines queue sequentially (max 3 waiting) if another comm line is active.
   */
  async playVoiceLine(
    lineId: number,
    g = 0,
    race?: number | string,
    lineText?: string,
    onStatusChange?: VoiceStatusCallback,
  ): Promise<void> {
    // Priority: Comm voices immediately stop any playing crew voice
    this.stopCrewVoice();

    const item: CommQueueItem = {
      lineId,
      garbledRatio: g,
      raceKey: race,
      raceParam: race,
      text: lineText,
      lineText,
      onStatusChange,
    };

    // If a comm voice is currently active, push to queue and enforce max 3 waiting
    if (this.isCommVoiceActive) {
      if (this.commQueue.length >= 3) {
        this.commQueue.shift();
      }
      this.commQueue.push(item);
      console.log(`[voice] line ${lineId} queued (${this.commQueue.length} waiting)`);
      return;
    }

    // Nothing currently playing: start playing immediately
    this.isCommVoiceActive = true;
    await this.executePlayCommLine(item);
  }

  /**
   * Internal execution of a single comm line.
   */
  private async executePlayCommLine(item: CommQueueItem): Promise<void> {
    const lineId = item.lineId;
    const g = item.garbledRatio;
    const race = item.raceKey ?? item.raceParam;
    const lineText = item.text ?? item.lineText;
    const onStatusChange = item.onStatusChange;

    this.currentPlayingLineId = lineId;
    const raceId = this.resolveLineRace(lineId, race);

    // This is an interface cue in the dialogue table, not a spoken recording.
    if (lineId === 513) {
      onStatusChange?.('idle');
      this.onCommLineFinished();
      return;
    }

    // Check if line was permanently failed in this session
    if (this.permanentlyFailedLines.has(lineId)) {
      console.log(`[voice] line ${lineId} no recording`);
      onStatusChange?.('no recording');
      this.onCommLineFinished();
      return;
    }

    // Determine if race is Mysterions (race 4)
    const isRace4 = raceId === 4 || lineId === 185 || lineId === 186 || lineId === 187;

    if (isRace4) {
      const commEntry = PARSED_COMM_LINES.find((l) => l.id === lineId);
      const textToPlay = lineText || commEntry?.text || '00001 01111 00000 100001';
      this.playMysterionsBeeps(lineId, textToPlay, g, onStatusChange);
      return;
    }

    // Check LRU cache first
    const cachedBuffer = this.cache.get(lineId);
    if (cachedBuffer) {
      this.playDecodedAudioBuffer(lineId, cachedBuffer, g, raceId, onStatusChange);
      return;
    }

    const reqId = ++this.playbackId;
    const url = `${VOICE_BASE_URL}/${lineId}.mp3`;

    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const ctx = this.getAudioContext();
      if (!ctx) throw new Error('Web Audio not available');

      const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
        let settled = false;
        const onOk = (buf: AudioBuffer) => {
          if (!settled) {
            settled = true;
            resolve(buf);
          }
        };
        const onErr = (err: any) => {
          if (!settled) {
            settled = true;
            reject(err);
          }
        };
        const res = ctx.decodeAudioData(arrayBuffer.slice(0), onOk, onErr);
        if (res && typeof (res as any).then === 'function') {
          (res as any).then(onOk).catch(onErr);
        }
      });

      this.cache.set(lineId, audioBuffer);

      if (this.playbackId === reqId) {
        this.playDecodedAudioBuffer(lineId, audioBuffer, g, raceId, onStatusChange);
      }
    } catch (err) {
      this.permanentlyFailedLines.add(lineId);
      console.warn(`[voice] line ${lineId} failed to load:`, err);
      console.log(`[voice] line ${lineId} no recording`);
      onStatusChange?.('no recording');
      this.onCommLineFinished();
    }
  }

  /**
   * Advances the queue when a comm line finishes playing or fails.
   */
  private onCommLineFinished(): void {
    this.currentPlayingLineId = null;
    this.cleanupActiveAudioNodes();

    if (this.commQueue.length > 0) {
      const nextItem = this.commQueue.shift()!;
      void this.executePlayCommLine(nextItem);
    } else {
      this.isCommVoiceActive = false;
    }
  }

  /**
   * Main entrypoint to play a crew banter line.
   * Banter voices NEVER wait in the queue:
   * Plays ONLY when no comm voice is playing AND no comm voice is waiting.
   * Otherwise, stays silent text only.
   */
  async playCrewVoice(
    hashOrLine: string,
    onStatusChange?: VoiceStatusCallback,
    isDev = false,
  ): Promise<void> {
    let target = (hashOrLine || '').trim();
    if (target.startsWith('crew:')) {
      target = target.slice(5).trim();
    }

    let hash: string | null = null;
    if (/^[0-9a-f]{8}$/i.test(target)) {
      hash = target.toLowerCase();
    } else {
      hash = getBanterLineHash(target);
    }

    if (!hash) {
      return;
    }

    // Priority: Banter lines play ONLY when no comm voice is playing AND no comm voice is waiting
    if (!isDev && (this.isCommVoiceActive || this.commQueue.length > 0)) {
      return;
    }

    // If "Crew Banter & Comedy Layer" is OFF in settings, NO banter voices play.
    if (!isDev && !this.banterEnabled) {
      return;
    }

    // Check if hash was permanently marked as failed for this session
    if (this.permanentlyFailedCrewHashes.has(hash)) {
      console.log(`[voice] crew ${hash} no recording`);
      onStatusChange?.('no recording');
      return;
    }

    // Check LRU cache first
    const cachedBuffer = this.crewCache.get(hash);
    if (cachedBuffer) {
      this.playDecodedCrewAudioBuffer(hash, cachedBuffer, onStatusChange, isDev);
      return;
    }

    const reqId = ++this.crewPlaybackId;
    const url = `${CREW_VOICE_BASE_URL}/${hash}.mp3`;

    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const ctx = this.getAudioContext();
      if (!ctx) throw new Error('Web Audio not available');

      const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
        let settled = false;
        const onOk = (buf: AudioBuffer) => {
          if (!settled) {
            settled = true;
            resolve(buf);
          }
        };
        const onErr = (err: any) => {
          if (!settled) {
            settled = true;
            reject(err);
          }
        };
        const res = ctx.decodeAudioData(arrayBuffer.slice(0), onOk, onErr);
        if (res && typeof (res as any).then === 'function') {
          (res as any).then(onOk).catch(onErr);
        }
      });

      this.crewCache.set(hash, audioBuffer);

      if (this.crewPlaybackId === reqId) {
        this.playDecodedCrewAudioBuffer(hash, audioBuffer, onStatusChange, isDev);
      }
    } catch (err) {
      this.permanentlyFailedCrewHashes.add(hash);
      console.warn(`[voice] crew ${hash} failed to load:`, err);
      console.log(`[voice] crew ${hash} no recording`);
      onStatusChange?.('no recording');
    }
  }

  /**
   * Helper to play banter from line text.
   */
  playCrewBanter(
    lineText: string,
    onStatusChange?: VoiceStatusCallback,
  ): Promise<void> {
    return this.playCrewVoice(lineText, onStatusChange, false);
  }

  /**
   * Named alias matching game design specification.
   */
  playCrewBanterVoice(
    lineText: string,
    onStatusChange?: VoiceStatusCallback,
  ): Promise<void> {
    return this.playCrewBanter(lineText, onStatusChange);
  }

  /**
   * Plays a decoded AudioBuffer for crew banter with clean bridge audio.
   */
  private playDecodedCrewAudioBuffer(
    hash: string,
    buffer: AudioBuffer,
    onStatusChange?: VoiceStatusCallback,
    isDev = false,
  ) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    // Banter never plays while comm voice is active or waiting
    if (!isDev && (this.isCommVoiceActive || this.commQueue.length > 0)) {
      return;
    }

    // Stop any active crew voice
    this.stopCrewVoice();

    const duration = buffer.duration;
    console.log(`[voice] crew ${hash} playing ${duration.toFixed(1)}s`);
    onStatusChange?.('playing');

    const reqId = ++this.crewPlaybackId;
    this.currentPlayingCrewHash = hash;
    this.crewEndsAt=ctx.currentTime+duration;

    // Master Gain Node for Crew (routed through Voices volume slider & mute)
    const masterGain = ctx.createGain();
    const effectiveGain = this.isMuted ? 0 : this.volume;
    masterGain.gain.setValueAtTime(effectiveGain, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.activeCrewMasterGain = masterGain;

    // Clean playback: NO radio bandpass filter, NO static noise, NO alien DSP effect
    const voiceSource = ctx.createBufferSource();
    voiceSource.buffer = buffer;
    voiceSource.connect(masterGain);

    this.activeCrewSources.push(voiceSource, masterGain);

    voiceSource.onended = () => {
      if (this.crewPlaybackId === reqId) {
        this.currentPlayingCrewHash = null;
        this.activeCrewSources = [];
        this.activeCrewMasterGain = null;
        onStatusChange?.('idle');
      }
    };

    try {
      voiceSource.start(0);
    } catch {}
  }

  /**
   * Builds the race-specific DSP effect chain.
   */
  private applyAlienDspEffect(
    ctx: AudioContext,
    voiceSource: AudioBufferSourceNode,
    fxKey: string,
  ): AudioNode {
    if (fxKey === 'off' || !this.effectsEnabled) {
      return voiceSource;
    }

    const now = ctx.currentTime;

    switch (fxKey) {
      case 'elowan': {
        const chorusOut = ctx.createGain();
        const dryGain = ctx.createGain();
        dryGain.gain.setValueAtTime(0.5, now);
        voiceSource.connect(dryGain);
        dryGain.connect(chorusOut);

        if (typeof ctx.createDelay === 'function') {
          const delay1 = ctx.createDelay(0.1);
          delay1.delayTime.setValueAtTime(0.018, now);
          const delay2 = ctx.createDelay(0.1);
          delay2.delayTime.setValueAtTime(0.027, now);

          const lfo = ctx.createOscillator();
          lfo.frequency.setValueAtTime(0.3, now);

          const lfoGain1 = ctx.createGain();
          lfoGain1.gain.setValueAtTime(0.003, now);
          const lfoGain2 = ctx.createGain();
          lfoGain2.gain.setValueAtTime(-0.003, now);

          lfo.connect(lfoGain1);
          lfoGain1.connect(delay1.delayTime);
          lfo.connect(lfoGain2);
          lfoGain2.connect(delay2.delayTime);

          const d1Gain = ctx.createGain();
          d1Gain.gain.setValueAtTime(0.35, now);
          const d2Gain = ctx.createGain();
          d2Gain.gain.setValueAtTime(0.35, now);

          voiceSource.connect(delay1);
          delay1.connect(d1Gain);
          d1Gain.connect(chorusOut);

          voiceSource.connect(delay2);
          delay2.connect(d2Gain);
          d2Gain.connect(chorusOut);

          this.activeOscillators.push(lfo);
          this.activeSources.push(delay1, delay2, lfoGain1, lfoGain2, d1Gain, d2Gain);
          try { lfo.start(now); } catch {}
        }

        const effectOut = ctx.createGain();
        const revDry = ctx.createGain();
        revDry.gain.setValueAtTime(0.75, now);
        chorusOut.connect(revDry);
        revDry.connect(effectOut);

        if (typeof ctx.createConvolver === 'function') {
          const sampleRate = ctx.sampleRate || 44100;
          const revLen = Math.max(1, Math.floor(sampleRate * 1.5));
          const revBuf = ctx.createBuffer(1, revLen, sampleRate);
          const chData = revBuf.getChannelData(0);
          for (let i = 0; i < revLen; i++) {
            const t = i / sampleRate;
            chData[i] = (Math.random() * 2 - 1) * Math.exp((-3 * t) / 1.5);
          }
          const convolver = ctx.createConvolver();
          convolver.buffer = revBuf;

          const revWet = ctx.createGain();
          revWet.gain.setValueAtTime(0.25, now);
          chorusOut.connect(convolver);
          convolver.connect(revWet);
          revWet.connect(effectOut);

          this.activeSources.push(convolver, revWet);
        }

        this.activeSources.push(chorusOut, dryGain, revDry, effectOut);
        return effectOut;
      }

      case 'gazurtoid': {
        try {
          voiceSource.playbackRate.setValueAtTime(0.9, now);
        } catch {}

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(1200, now);
        lp.Q.setValueAtTime(4, now);
        voiceSource.connect(lp);

        const effectOut = ctx.createGain();
        const dryGain = ctx.createGain();
        dryGain.gain.setValueAtTime(0.5, now);
        lp.connect(dryGain);
        dryGain.connect(effectOut);

        if (typeof ctx.createDelay === 'function') {
          const delay = ctx.createDelay(0.1);
          delay.delayTime.setValueAtTime(0.025, now);

          const lfo = ctx.createOscillator();
          lfo.frequency.setValueAtTime(0.6, now);

          const lfoGain = ctx.createGain();
          lfoGain.gain.setValueAtTime(0.006, now);
          lfo.connect(lfoGain);
          lfoGain.connect(delay.delayTime);

          const wetGain = ctx.createGain();
          wetGain.gain.setValueAtTime(0.5, now);
          lp.connect(delay);
          delay.connect(wetGain);
          wetGain.connect(effectOut);

          this.activeOscillators.push(lfo);
          this.activeSources.push(delay, lfoGain, wetGain);
          try { lfo.start(now); } catch {}
        }

        this.activeSources.push(lp, dryGain, effectOut);
        return effectOut;
      }

      case 'mechans': {
        const ringGain = ctx.createGain();
        ringGain.gain.setValueAtTime(0.3, now);

        const carrier = ctx.createOscillator();
        carrier.frequency.setValueAtTime(90, now);

        const modGain = ctx.createGain();
        modGain.gain.setValueAtTime(0.7, now);
        carrier.connect(modGain);
        modGain.connect(ringGain.gain);

        voiceSource.connect(ringGain);
        this.activeOscillators.push(carrier);
        this.activeSources.push(ringGain, modGain);
        try { carrier.start(now); } catch {}

        const effectOut = ctx.createGain();
        const dryGain = ctx.createGain();
        dryGain.gain.setValueAtTime(0.5, now);
        ringGain.connect(dryGain);
        dryGain.connect(effectOut);

        if (typeof ctx.createDelay === 'function') {
          const combDelay = ctx.createDelay(0.1);
          combDelay.delayTime.setValueAtTime(0.007, now);

          const combFb = ctx.createGain();
          combFb.gain.setValueAtTime(0.55, now);

          ringGain.connect(combDelay);
          combDelay.connect(combFb);
          combFb.connect(combDelay);

          const wetGain = ctx.createGain();
          wetGain.gain.setValueAtTime(0.5, now);
          combDelay.connect(wetGain);
          wetGain.connect(effectOut);

          this.activeSources.push(combDelay, combFb, wetGain);
        }

        this.activeSources.push(dryGain, effectOut);
        return effectOut;
      }

      case 'nomad': {
        let lastNode: AudioNode = voiceSource;

        if (typeof ctx.createWaveShaper === 'function') {
          const shaper = ctx.createWaveShaper();
          const steps = 64;
          const curveLen = 2048;
          const curve = new Float32Array(curveLen);
          for (let i = 0; i < curveLen; i++) {
            const x = (i / (curveLen - 1)) * 2 - 1;
            curve[i] = Math.round(x * (steps / 2)) / (steps / 2);
          }
          shaper.curve = curve;
          voiceSource.connect(shaper);
          lastNode = shaper;
          this.activeSources.push(shaper);
        }

        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(400, now);

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(3000, now);

        lastNode.connect(hp);
        hp.connect(lp);
        this.activeSources.push(hp, lp);
        return lp;
      }

      case 'spemin': {
        try {
          voiceSource.playbackRate.setValueAtTime(1.08, now);
        } catch {}

        const wobbleOut = ctx.createGain();
        const dryGain = ctx.createGain();
        dryGain.gain.setValueAtTime(0.5, now);
        voiceSource.connect(dryGain);
        dryGain.connect(wobbleOut);

        if (typeof ctx.createDelay === 'function') {
          const delay = ctx.createDelay(0.1);
          delay.delayTime.setValueAtTime(0.006, now);

          const lfo = ctx.createOscillator();
          lfo.frequency.setValueAtTime(7, now);

          const lfoGain = ctx.createGain();
          lfoGain.gain.setValueAtTime(0.004, now);
          lfo.connect(lfoGain);
          lfoGain.connect(delay.delayTime);

          const wetGain = ctx.createGain();
          wetGain.gain.setValueAtTime(0.5, now);
          voiceSource.connect(delay);
          delay.connect(wetGain);
          wetGain.connect(wobbleOut);

          this.activeOscillators.push(lfo);
          this.activeSources.push(delay, lfoGain, wetGain);
          try { lfo.start(now); } catch {}
        }

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(2500, now);
        wobbleOut.connect(lp);

        this.activeSources.push(wobbleOut, dryGain, lp);
        return lp;
      }

      case 'thrynn': {
        try {
          voiceSource.playbackRate.setValueAtTime(0.94, now);
        } catch {}

        let distNode: AudioNode = voiceSource;
        if (typeof ctx.createWaveShaper === 'function') {
          const shaper = ctx.createWaveShaper();
          const curveLen = 1024;
          const curve = new Float32Array(curveLen);
          for (let i = 0; i < curveLen; i++) {
            const x = (i / (curveLen - 1)) * 2 - 1;
            curve[i] = x - 0.25 * Math.pow(x, 3);
          }
          shaper.curve = curve;
          voiceSource.connect(shaper);
          distNode = shaper;
          this.activeSources.push(shaper);
        }

        const effectOut = ctx.createGain();
        distNode.connect(effectOut);

        if (typeof ctx.createDelay === 'function') {
          const slapDelay = ctx.createDelay(0.1);
          slapDelay.delayTime.setValueAtTime(0.012, now);

          const slapGain = ctx.createGain();
          slapGain.gain.setValueAtTime(0.3, now);

          distNode.connect(slapDelay);
          slapDelay.connect(slapGain);
          slapGain.connect(effectOut);

          this.activeSources.push(slapDelay, slapGain);
        }

        this.activeSources.push(effectOut);
        return effectOut;
      }

      case 'veloxi': {
        try {
          voiceSource.playbackRate.setValueAtTime(1.06, now);
        } catch {}

        const ringGain = ctx.createGain();
        ringGain.gain.setValueAtTime(0.5, now);

        const carrier = ctx.createOscillator();
        carrier.frequency.setValueAtTime(45, now);

        const modGain = ctx.createGain();
        modGain.gain.setValueAtTime(0.5, now);
        carrier.connect(modGain);
        modGain.connect(ringGain.gain);

        voiceSource.connect(ringGain);
        this.activeOscillators.push(carrier);
        this.activeSources.push(ringGain, modGain);
        try { carrier.start(now); } catch {}

        return ringGain;
      }

      case 'minstrels': {
        const chorusOut = ctx.createGain();
        const dryGain = ctx.createGain();
        dryGain.gain.setValueAtTime(0.6, now);
        voiceSource.connect(dryGain);
        dryGain.connect(chorusOut);

        if (typeof ctx.createDelay === 'function') {
          const delay = ctx.createDelay(0.1);
          delay.delayTime.setValueAtTime(0.02, now);

          const lfo = ctx.createOscillator();
          lfo.frequency.setValueAtTime(0.5, now);

          const lfoGain = ctx.createGain();
          lfoGain.gain.setValueAtTime(0.004, now);
          lfo.connect(lfoGain);
          lfoGain.connect(delay.delayTime);

          const wetGain = ctx.createGain();
          wetGain.gain.setValueAtTime(0.4, now);
          voiceSource.connect(delay);
          delay.connect(wetGain);
          wetGain.connect(chorusOut);

          this.activeOscillators.push(lfo);
          this.activeSources.push(delay, lfoGain, wetGain);
          try { lfo.start(now); } catch {}
        }

        const effectOut = ctx.createGain();
        const revDry = ctx.createGain();
        revDry.gain.setValueAtTime(0.6, now);
        chorusOut.connect(revDry);
        revDry.connect(effectOut);

        if (typeof ctx.createConvolver === 'function') {
          const sampleRate = ctx.sampleRate || 44100;
          const revLen = Math.max(1, Math.floor(sampleRate * 2.5));
          const revBuf = ctx.createBuffer(1, revLen, sampleRate);
          const chData = revBuf.getChannelData(0);
          for (let i = 0; i < revLen; i++) {
            const t = i / sampleRate;
            chData[i] = (Math.random() * 2 - 1) * Math.exp((-2.2 * t) / 2.5);
          }
          const convolver = ctx.createConvolver();
          convolver.buffer = revBuf;

          const revWet = ctx.createGain();
          revWet.gain.setValueAtTime(0.4, now);
          chorusOut.connect(convolver);
          convolver.connect(revWet);
          revWet.connect(effectOut);

          this.activeSources.push(convolver, revWet);
        }

        this.activeSources.push(chorusOut, dryGain, revDry, effectOut);
        return effectOut;
      }

      case 'noah': {
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(400, now);

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(2500, now);

        voiceSource.connect(hp);
        hp.connect(lp);

        const effectOut = ctx.createGain();
        lp.connect(effectOut);

        const sampleRate = ctx.sampleRate || 44100;
        const cLen = Math.max(1, Math.floor(sampleRate * 0.5));
        const cBuf = ctx.createBuffer(1, cLen, sampleRate);
        const cData = cBuf.getChannelData(0);
        for (let i = 0; i < cLen; i++) {
          cData[i] = Math.random() < 0.005 ? (Math.random() * 2 - 1) * 0.3 : 0;
        }
        const crackle = ctx.createBufferSource();
        crackle.buffer = cBuf;
        crackle.loop = true;

        const crackleGain = ctx.createGain();
        crackleGain.gain.setValueAtTime(0.04, now);
        crackle.connect(crackleGain);
        crackleGain.connect(effectOut);

        this.activeSources.push(hp, lp, crackle, crackleGain, effectOut);
        try { crackle.start(now); } catch {}
        return effectOut;
      }

      default:
        return voiceSource;
    }
  }

  /**
   * Plays a decoded AudioBuffer through the radio filter, DSP effect, and static mixer.
   */
  private playDecodedAudioBuffer(
    lineId: number,
    buffer: AudioBuffer,
    g: number,
    raceId: number,
    onStatusChange?: VoiceStatusCallback,
  ) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    // Clean up previous active audio nodes without wiping commQueue
    this.cleanupActiveAudioNodes();
    this.stopCrewVoice();

    const duration = buffer.duration;
    const clampedG = Math.max(0, Math.min(1, g));
    const garbledPercent = Math.round(clampedG * 100);

    const fxKey = this.resolveFxKey(raceId);

    console.log(
      `[voice] line ${lineId} playing ${duration.toFixed(1)}s garbled ${garbledPercent}% fx ${fxKey}`,
    );
    onStatusChange?.('playing');

    const reqId = ++this.playbackId;
    this.currentPlayingLineId = lineId;

    const masterGain = ctx.createGain();
    const effectiveGain = this.isMuted ? 0 : this.volume;
    masterGain.gain.setValueAtTime(effectiveGain, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.activeMasterGain = masterGain;

    const tNarrow = Math.min(1, clampedG / 0.5);
    const highpassFreq = 200 + tNarrow * (300 - 200);
    const lowpassFreq = 5000 - tNarrow * (5000 - 3400);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(highpassFreq, ctx.currentTime);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(lowpassFreq, ctx.currentTime);

    highpass.connect(lowpass);
    lowpass.connect(masterGain);

    const voiceSource = ctx.createBufferSource();
    voiceSource.buffer = buffer;

    const dspOutput = this.applyAlienDspEffect(ctx, voiceSource, fxKey);

    const voiceGain = ctx.createGain();
    const voiceGainVal = clampedG > 0.5 ? 0 : 1.0;
    voiceGain.gain.setValueAtTime(voiceGainVal, ctx.currentTime);

    dspOutput.connect(voiceGain);
    voiceGain.connect(highpass);

    this.activeSources.push(voiceSource, voiceGain, highpass, lowpass);

    let noiseSource: AudioBufferSourceNode | null = null;
    if (clampedG > 0) {
      const sampleRate = ctx.sampleRate || 44100;
      const numSamples = Math.max(1, Math.floor(sampleRate * Math.min(30, duration + 0.1)));
      const noiseBuffer = ctx.createBuffer(1, numSamples, sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < numSamples; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(clampedG * 0.6, ctx.currentTime);

      noiseSource.connect(noiseGain);
      noiseGain.connect(highpass);

      this.activeSources.push(noiseSource, noiseGain);
    }

    voiceSource.onended = () => {
      if (this.playbackId === reqId) {
        onStatusChange?.('idle');
        this.onCommLineFinished();
      }
    };

    try {
      voiceSource.start(0);
      if (noiseSource) {
        noiseSource.start(0);
      }
    } catch {
      this.onCommLineFinished();
    }
  }

  /**
   * Plays lines for Mysterions (race 4) as synth beeps.
   */
  playMysterionsBeeps(
    lineId: number,
    text: string,
    g = 0,
    onStatusChange?: VoiceStatusCallback,
  ) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    this.cleanupActiveAudioNodes();
    this.stopCrewVoice();

    const groups = text.trim().split(/\s+/).filter(Boolean);
    if (groups.length === 0) {
      console.log(`[voice] line ${lineId} no recording`);
      onStatusChange?.('no recording');
      this.onCommLineFinished();
      return;
    }

    let totalMs = 0;
    groups.forEach((grp, gIdx) => {
      if (gIdx > 0) totalMs += 150;
      const digits = grp.replace(/[^01]/g, '');
      for (let d = 0; d < digits.length; d++) {
        totalMs += 60;
        if (d < digits.length - 1) {
          totalMs += 30;
        }
      }
    });

    const durationSeconds = totalMs / 1000;
    const clampedG = Math.max(0, Math.min(1, g));
    const garbledPercent = Math.round(clampedG * 100);

    console.log(
      `[voice] line ${lineId} playing ${durationSeconds.toFixed(1)}s garbled ${garbledPercent}% fx off`,
    );
    onStatusChange?.('playing');

    const reqId = ++this.playbackId;
    this.currentPlayingLineId = lineId;

    const masterGain = ctx.createGain();
    const effectiveGain = this.isMuted ? 0 : this.volume;
    masterGain.gain.setValueAtTime(effectiveGain, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.activeMasterGain = masterGain;

    const startTime = ctx.currentTime + 0.01;
    let t = startTime;

    groups.forEach((grp, gIdx) => {
      if (gIdx > 0) {
        t += 0.15;
      }

      const digits = grp.replace(/[^01]/g, '');
      for (let d = 0; d < digits.length; d++) {
        const char = digits[d];
        const freq = char === '1' ? 900 : 400;

        try {
          const osc = ctx.createOscillator();
          const toneGain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);

          toneGain.gain.setValueAtTime(0.0001, t);
          toneGain.gain.linearRampToValueAtTime(0.2, t + 0.005);
          toneGain.gain.setValueAtTime(0.2, t + 0.055);
          toneGain.gain.linearRampToValueAtTime(0.0001, t + 0.06);

          osc.connect(toneGain);
          toneGain.connect(masterGain);

          osc.start(t);
          osc.stop(t + 0.06);

          this.activeOscillators.push(osc);
          this.activeSources.push(toneGain);
        } catch {}

        t += 0.06;
        if (d < digits.length - 1) {
          t += 0.03;
        }
      }
    });

    const totalDelayMs = Math.max(10, Math.ceil((t - ctx.currentTime) * 1000));
    const timerFn = typeof window !== 'undefined' ? window.setTimeout : setTimeout;

    this.activeTimeoutId = timerFn(() => {
      if (this.playbackId === reqId) {
        onStatusChange?.('idle');
        this.onCommLineFinished();
      }
    }, totalDelayMs) as any;
  }
}

/**
 * Shared singleton Alien & Crew Voice Engine.
 */
export const voiceEngine = new AlienVoiceEngine();
export const alienVoice = voiceEngine;

export function playAlienVoice(
  lineId: number,
  g = 0,
  race?: number | string,
  textOverride?: string,
  onStatusChange?: VoiceStatusCallback,
): Promise<void> {
  return voiceEngine.playVoiceLine(lineId, g, race, textOverride, onStatusChange);
}

export const playVoiceLine = playAlienVoice;

export function stopAlienVoice(): void {
  voiceEngine.stopAlienPlayback();
}

export function stopVoice(): void {
  voiceEngine.stopVoice();
}

export function stopAllVoices(): void {
  voiceEngine.stopAllVoices();
}

export function playCrewVoice(
  hashOrLine: string,
  onStatusChange?: VoiceStatusCallback,
  isDev = false,
): Promise<void> {
  return voiceEngine.playCrewVoice(hashOrLine, onStatusChange, isDev);
}

export function playCrewBanter(
  lineText: string,
  onStatusChange?: VoiceStatusCallback,
): Promise<void> {
  return voiceEngine.playCrewBanter(lineText, onStatusChange);
}

export function playCrewBanterVoice(
  lineText: string,
  onStatusChange?: VoiceStatusCallback,
): Promise<void> {
  return voiceEngine.playCrewBanterVoice(lineText, onStatusChange);
}

export function stopCrewVoice(): void {
  voiceEngine.stopCrewVoice();
}

export { runVoiceTests } from './voice.test';
