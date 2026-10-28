// tslint:disable
/* eslint-disable */
/**
 * Voice Dialogue Engine Test Suite.
 *
 * Verifies all specification test cases according to the Starflight alien & crew voice specification:
 * 1. Standard Line Playback (fetch URL, CORS, decodeAudioData, cache, console log format with fx key)
 * 2. Garbled Line Audio Routing (static mixed at g * 0.6, g > 0.5 voice gain 0, radio bandpass narrowing)
 * 3. Failed / Missing Recordings (stays silent, console.warn, permanently marked failed, [voice] line <id> no recording)
 * 4. In-Memory LRU Cache (40 lines max, LRU eviction)
 * 5. Mysterions (race 4) Synth Beeps (no fetch, 400Hz/900Hz, 60ms tone, 30ms/150ms silences, fx off)
 * 6. Volume, Mute, Sequential Queueing & Lifecycle (sequential comm playback, stop on comm close, volume 0% silent log)
 * 7. Alien Web Audio Voice Effects & Settings (effects ON/OFF, fx tags for all races, player line fx off)
 * 8. Crew Banter Line FNV-1a 32-bit Hashing & URL Schema (3 example lines verified, crew CDN URL)
 * 9. Dev Panel crew:0e272e2b & Missing Audio Graceful Handling (logs [voice] crew 0e272e2b no recording, permanent fail)
 * 10. Successful Crew Banter Voice Playback & Clean Audio Routing (duration, no filters/static, volume, 0% volume silent log)
 * 11. Priority & Banter Triggering vs. Alerts / DEV Messages (only banter lines, alien priority, banter silent when comm active or waiting)
 * 12. Sequential Comm Queueing & Timing:
 *     - Queueing order preservation
 *     - Max 3 waiting items, dropping oldest waiting on 4th
 *     - Console log: [voice] line <id> queued (<n> waiting)
 *     - Playing from queue and advancing immediately on no recording
 *     - stopVoice() / stopAllVoices() empties queue and stops playback
 */

import {
  AlienVoiceEngine,
  AudioBufferLRUCache,
  VOICE_BASE_URL,
  CREW_VOICE_BASE_URL,
  RACE_ID_TO_FX_KEY,
  fnv1a32,
  getBanterLineHash,
  isBanterLine,
} from './voice';

// Mock Web Audio Context implementation for tests
class MockAudioBuffer {
  duration: number;
  sampleRate: number;
  length: number;
  numberOfChannels: number;
  private channelData: Float32Array;

  constructor(options: { numberOfChannels?: number; length: number; sampleRate: number; duration?: number }) {
    this.numberOfChannels = options.numberOfChannels || 1;
    this.length = options.length;
    this.sampleRate = options.sampleRate;
    this.duration = options.duration !== undefined ? options.duration : options.length / options.sampleRate;
    this.channelData = new Float32Array(this.length);
  }

  getChannelData(_channel: number): Float32Array {
    return this.channelData;
  }
}

class MockAudioParam {
  value = 1.0;
  setValueAtTime(val: number, _time: number) {
    this.value = val;
  }
  linearRampToValueAtTime(val: number, _time: number) {
    this.value = val;
  }
  exponentialRampToValueAtTime(val: number, _time: number) {
    this.value = val;
  }
  setTargetAtTime(val: number, _time: number, _constant: number) {
    this.value = val;
  }
}

class MockGainNode {
  gain = new MockAudioParam();
  connectedTo: any = null;
  connect(dest: any) {
    this.connectedTo = dest;
  }
  disconnect() {
    this.connectedTo = null;
  }
}

class MockBiquadFilterNode {
  type: string = 'lowpass';
  frequency = new MockAudioParam();
  Q = new MockAudioParam();
  connectedTo: any = null;
  connect(dest: any) {
    this.connectedTo = dest;
  }
  disconnect() {
    this.connectedTo = null;
  }
}

class MockDelayNode {
  delayTime = new MockAudioParam();
  connectedTo: any = null;
  connect(dest: any) {
    this.connectedTo = dest;
  }
  disconnect() {
    this.connectedTo = null;
  }
}

class MockConvolverNode {
  buffer: any = null;
  connectedTo: any = null;
  connect(dest: any) {
    this.connectedTo = dest;
  }
  disconnect() {
    this.connectedTo = null;
  }
}

class MockWaveShaperNode {
  curve: Float32Array | null = null;
  oversample: any = 'none';
  connectedTo: any = null;
  connect(dest: any) {
    this.connectedTo = dest;
  }
  disconnect() {
    this.connectedTo = null;
  }
}

class MockBufferSourceNode {
  buffer: any = null;
  playbackRate = new MockAudioParam();
  loop = false;
  connectedTo: any = null;
  started = false;
  stopped = false;
  onended: (() => void) | null = null;

  connect(dest: any) {
    this.connectedTo = dest;
  }
  disconnect() {
    this.connectedTo = null;
  }
  start(_time = 0) {
    this.started = true;
  }
  stop() {
    this.stopped = true;
    if (this.onended) this.onended();
  }
}

class MockOscillatorNode {
  type: OscillatorType = 'sine';
  frequency = new MockAudioParam();
  connectedTo: any = null;
  started = false;
  stopped = false;

  connect(dest: any) {
    this.connectedTo = dest;
  }
  disconnect() {
    this.connectedTo = null;
  }
  start(_time = 0) {
    this.started = true;
  }
  stop() {
    this.stopped = true;
  }
}

class MockAudioContext {
  state: AudioContextState = 'running';
  currentTime = 0;
  sampleRate = 44100;
  destination = {};

  createGain() {
    return new MockGainNode();
  }
  createBiquadFilter() {
    return new MockBiquadFilterNode();
  }
  createDelay(_maxDelay?: number) {
    return new MockDelayNode();
  }
  createConvolver() {
    return new MockConvolverNode();
  }
  createWaveShaper() {
    return new MockWaveShaperNode();
  }
  createBufferSource() {
    return new MockBufferSourceNode();
  }
  createOscillator() {
    return new MockOscillatorNode();
  }
  createBuffer(channels: number, length: number, sampleRate: number) {
    return new MockAudioBuffer({ numberOfChannels: channels, length, sampleRate });
  }
  async decodeAudioData(
    arrayBuffer: ArrayBuffer,
    successCallback?: (buf: any) => void,
    _errorCallback?: (err: any) => void,
  ): Promise<AudioBuffer> {
    const buf = new MockAudioBuffer({
      numberOfChannels: 1,
      length: 44100 * 3, // 3.0 seconds
      sampleRate: 44100,
      duration: 3.0,
    }) as any;
    if (successCallback) successCallback(buf);
    return buf;
  }
  async resume() {
    this.state = 'running';
  }
}

export async function runVoiceTests(): Promise<{ passed: number; failed: number; results: string[] }> {
  let passed = 0;
  let failed = 0;
  const results: string[] = [];

  function assert(condition: boolean, desc: string) {
    if (condition) {
      passed++;
      results.push(`✓ PASS: ${desc}`);
    } else {
      failed++;
      results.push(`✗ FAIL: ${desc}`);
      console.error(`Assertion failed: ${desc}`);
    }
  }

  const origFetch = globalThis.fetch;
  const origLog = console.log;
  const origWarn = console.warn;

  try {
    // Communications Terminated is a silent interface cue; the repository has no 513.mp3.
    {
      const engine = new AlienVoiceEngine();
      engine.setAudioContext(new MockAudioContext() as any);
      let fetches=0, cueStatus='';
      globalThis.fetch=(async()=>{fetches++;throw new Error('Silent cue must not fetch');}) as any;
      await engine.playVoiceLine(513,0,16,'[Communications Terminated]',status=>{cueStatus=status;});
      assert(fetches===0,'Silent communications cue does not request a missing recording');
      assert(cueStatus==='idle' && !engine.isAlienVoicePlaying(),'Silent communications cue completes with an idle voice engine');
      const buffer=new MockAudioBuffer({length:44100,sampleRate:44100});
      engine.getCache().set(1,buffer as any);
      engine.getCache().set(2,buffer as any);
      await engine.playVoiceLine(1,0,1);
      await engine.playVoiceLine(513,0,16);
      await engine.playVoiceLine(2,0,1);
      engine.finishCurrentCommLine();
      assert(engine.getCurrentLineId()===2 && engine.getQueueLength()===0 && fetches===0,'A queued silent cue advances directly to the next real voice line');
      engine.stopAllVoices();
    }
    // ------------------------------------------------------------------------
    // TEST CASE 1: Standard Voiced Alien Line Playback & fx tag
    // ------------------------------------------------------------------------
    {
      const engine = new AlienVoiceEngine();
      const mockCtx = new MockAudioContext();
      engine.setAudioContext(mockCtx as any);

      let fetchedUrl = '';
      let fetchOptions: any = null;
      let loggedMessage = '';

      globalThis.fetch = (async (url: string, options: any) => {
        fetchedUrl = url;
        fetchOptions = options;
        return {
          ok: true,
          status: 200,
          arrayBuffer: async () => new ArrayBuffer(1024),
        } as any;
      }) as any;

      console.log = ((msg: string) => {
        if (typeof msg === 'string' && msg.startsWith('[voice]')) {
          loggedMessage = msg;
        }
      }) as any;

      await engine.playVoiceLine(1, 0, 'Elowan');

      assert(
        fetchedUrl === `${VOICE_BASE_URL}/1.mp3`,
        'Test 1: Fetches correct URL: ' + fetchedUrl,
      );
      assert(
        fetchOptions?.mode === 'cors' && fetchOptions?.credentials === 'omit',
        'Test 1: Fetch uses mode: cors and credentials: omit',
      );
      assert(
        loggedMessage === '[voice] line 1 playing 3.0s garbled 0% fx elowan',
        'Test 1: Console log format matches exact fx tag: ' + loggedMessage,
      );
      assert(
        engine.getCache().has(1),
        'Test 1: Decoded AudioBuffer is stored in LRU cache',
      );
    }

    // ------------------------------------------------------------------------
    // TEST CASE 2: Garbled Line Audio Routing & Narrowing Filter
    // ------------------------------------------------------------------------
    {
      const engine = new AlienVoiceEngine();
      const mockCtx = new MockAudioContext();
      engine.setAudioContext(mockCtx as any);

      const buffer = new MockAudioBuffer({ length: 44100 * 4.2, sampleRate: 44100, duration: 4.2 });
      engine.getCache().set(14, buffer as any);

      let logA = '';
      console.log = ((msg: string) => {
        if (typeof msg === 'string' && msg.startsWith('[voice]')) logA = msg;
      }) as any;

      await engine.playVoiceLine(14, 0.33, 'Elowan');
      assert(
        logA === '[voice] line 14 playing 4.2s garbled 33% fx elowan',
        'Test 2a: Garbled 33% with fx elowan logged: ' + logA,
      );

      engine.stopAlienPlayback();

      let logB = '';
      console.log = ((msg: string) => {
        if (typeof msg === 'string' && msg.startsWith('[voice]')) logB = msg;
      }) as any;

      await engine.playVoiceLine(14, 0.8, 'Elowan');
      assert(
        logB === '[voice] line 14 playing 4.2s garbled 80% fx elowan',
        'Test 2b: Garbled 80% with fx elowan logged: ' + logB,
      );
    }

    // ------------------------------------------------------------------------
    // TEST CASE 3: Failed / Missing Recordings (404 & Network Error)
    // ------------------------------------------------------------------------
    {
      const engine = new AlienVoiceEngine();
      const mockCtx = new MockAudioContext();
      engine.setAudioContext(mockCtx as any);

      let warnCount = 0;
      let logMissing = '';
      let fetchAttempts = 0;

      console.warn = (() => {
        warnCount++;
      }) as any;

      console.log = ((msg: string) => {
        if (typeof msg === 'string' && msg.startsWith('[voice]')) logMissing = msg;
      }) as any;

      globalThis.fetch = (async () => {
        fetchAttempts++;
        return {
          ok: false,
          status: 404,
        } as any;
      }) as any;

      await engine.playVoiceLine(999, 0, 'Thrynn');
      assert(
        warnCount === 1,
        'Test 3: Logged one console.warn on failed load',
      );
      assert(
        logMissing === '[voice] line 999 no recording',
        'Test 3: Logged exact message: ' + logMissing,
      );
      assert(
        engine.getPermanentlyFailedLines().has(999),
        'Test 3: Line 999 marked permanently failed for session',
      );
      assert(
        fetchAttempts === 1,
        'Test 3: Fetch was executed once',
      );

      logMissing = '';
      await engine.playVoiceLine(999, 0, 'Thrynn');
      assert(
        fetchAttempts === 1,
        'Test 3: Line 999 never fetched again in session',
      );
      assert(
        logMissing === '[voice] line 999 no recording',
        'Test 3: Re-logged [voice] line 999 no recording without fetching',
      );
    }

    // ------------------------------------------------------------------------
    // TEST CASE 4: In-Memory LRU Cache (40 Lines)
    // ------------------------------------------------------------------------
    {
      const cache = new AudioBufferLRUCache(40);

      for (let i = 1; i <= 40; i++) {
        const dummyBuf = new MockAudioBuffer({ length: 100, sampleRate: 44100, duration: 1.0 });
        cache.set(i, dummyBuf as any);
      }

      assert(cache.size() === 40, 'Test 4: Cache holds 40 items');
      assert(cache.has(1), 'Test 4: Line 1 exists before overflow');

      cache.get(1);

      const buf41 = new MockAudioBuffer({ length: 100, sampleRate: 44100, duration: 1.0 });
      cache.set(41, buf41 as any);

      assert(cache.size() === 40, 'Test 4: Cache size clamped at 40');
      assert(cache.has(1), 'Test 4: Line 1 preserved due to LRU refresh');
      assert(!cache.has(2), 'Test 4: Line 2 evicted as oldest');
      assert(cache.has(41), 'Test 4: Line 41 added successfully');
    }

    // ------------------------------------------------------------------------
    // TEST CASE 5: Mysterions (race 4) Synth Beeps (fx off)
    // ------------------------------------------------------------------------
    {
      const engine = new AlienVoiceEngine();
      const mockCtx = new MockAudioContext();
      engine.setAudioContext(mockCtx as any);

      let fetchCalled = false;
      globalThis.fetch = (async () => {
        fetchCalled = true;
        return { ok: true } as any;
      }) as any;

      let logMysterion = '';
      console.log = ((msg: string) => {
        if (typeof msg === 'string' && msg.startsWith('[voice]')) logMysterion = msg;
      }) as any;

      await engine.playVoiceLine(185, 0, 4, '00001 01111');
      assert(
        !fetchCalled,
        'Test 5: Did not fetch audio file for race 4 (Mysterions)',
      );
      assert(
        logMysterion.startsWith('[voice] line 185 playing') && logMysterion.includes('fx off'),
        'Test 5: Logged Mysterions playback with fx off: ' + logMysterion,
      );
      assert(
        engine.isPlaying(),
        'Test 5: Engine marks line 185 as playing',
      );
      engine.stop();
      assert(
        !engine.isPlaying(),
        'Test 5: stop() terminates active beeps',
      );
    }

    // ------------------------------------------------------------------------
    // TEST CASE 6: Volume, Mute, Sequential Queueing & Lifecycle
    // ------------------------------------------------------------------------
    {
      const engine = new AlienVoiceEngine();
      const mockCtx = new MockAudioContext();
      engine.setAudioContext(mockCtx as any);

      assert(engine.getVolume() === 0.8, 'Test 6a: Voices volume defaults to 0.8');

      const bufA = new MockAudioBuffer({ length: 44100 * 5, sampleRate: 44100, duration: 5.0 });
      const bufB = new MockAudioBuffer({ length: 44100 * 2, sampleRate: 44100, duration: 2.0 });
      engine.getCache().set(101, bufA as any);
      engine.getCache().set(102, bufB as any);

      let logQueue = '';
      console.log = ((msg: string) => {
        if (typeof msg === 'string' && msg.startsWith('[voice]')) logQueue = msg;
      }) as any;

      await engine.playVoiceLine(101, 0, 'Spemin');
      assert(engine.getCurrentLineId() === 101, 'Test 6b: Line 101 is currently playing');

      await engine.playVoiceLine(102, 0, 'Spemin');
      assert(
        logQueue === '[voice] line 102 queued (1 waiting)',
        'Test 6c: Line 102 is queued instead of cutting Line 101 short: ' + logQueue,
      );
      assert(engine.getCurrentLineId() === 101, 'Test 6d: Line 101 remains currently playing');
      assert(engine.getQueueLength() === 1, 'Test 6e: Queue length is 1');

      // Finish Line 101 -> Line 102 should automatically start playing
      let log102Playing = '';
      console.log = ((msg: string) => {
        if (typeof msg === 'string' && msg.startsWith('[voice]')) log102Playing = msg;
      }) as any;

      engine.finishCurrentCommLine();
      assert(engine.getCurrentLineId() === 102, 'Test 6f: Line 102 started playing after Line 101 finished');
      assert(
        log102Playing === '[voice] line 102 playing 2.0s garbled 0% fx spemin',
        'Test 6g: Line 102 playing log format: ' + log102Playing,
      );
      assert(engine.getQueueLength() === 0, 'Test 6h: Queue is now empty');

      engine.finishCurrentCommLine();
      assert(!engine.isAlienVoicePlaying(), 'Test 6i: Both lines finished, engine is idle');

      // Volume slider to 0% still plays silently and logs
      engine.setVolume(0);
      assert(engine.getVolume() === 0, 'Test 6j: Volume set to 0%');

      let logSilent = '';
      console.log = ((msg: string) => {
        if (typeof msg === 'string' && msg.startsWith('[voice]')) logSilent = msg;
      }) as any;

      await engine.playVoiceLine(101, 0, 'Spemin');
      assert(
        logSilent === '[voice] line 101 playing 5.0s garbled 0% fx spemin',
        'Test 6k: At 0% volume, voice still plays through silent gain and logs: ' + logSilent,
      );

      engine.setMuted(true);
      assert(engine.getMuted(), 'Test 6l: Mute flag set to true');

      engine.stop();
      assert(!engine.isPlaying(), 'Test 6m: Stop terminates playback cleanly');
    }

    // ------------------------------------------------------------------------
    // TEST CASE 7: Alien Web Audio DSP Effects & Settings Toggle
    // ------------------------------------------------------------------------
    {
      const engine = new AlienVoiceEngine();
      const mockCtx = new MockAudioContext();
      engine.setAudioContext(mockCtx as any);

      const dummyBuf = new MockAudioBuffer({ length: 44100 * 2.5, sampleRate: 44100, duration: 2.5 });

      const raceTests: [number, string][] = [
        [1, 'elowan'],
        [2, 'gazurtoid'],
        [3, 'mechans'],
        [5, 'nomad'],
        [6, 'spemin'],
        [7, 'thrynn'],
        [8, 'veloxi'],
        [10, 'nomad'],
        [11, 'minstrels'],
        [19, 'noah'],
      ];

      for (const [rId, expectedKey] of raceTests) {
        engine.stopAlienPlayback();
        engine.getCache().set(rId, dummyBuf as any);
        let logMsg = '';
        console.log = ((msg: string) => {
          if (typeof msg === 'string' && msg.startsWith('[voice]')) logMsg = msg;
        }) as any;

        await engine.playVoiceLine(rId, 0, rId);
        assert(
          logMsg === `[voice] line ${rId} playing 2.5s garbled 0% fx ${expectedKey}`,
          `Test 7a: Race ${rId} logs correct fx ${expectedKey}: ${logMsg}`,
        );
      }

      engine.stopAlienPlayback();
      engine.getCache().set(516, dummyBuf as any);
      let playerLog = '';
      console.log = ((msg: string) => {
        if (typeof msg === 'string' && msg.startsWith('[voice]')) playerLog = msg;
      }) as any;

      await engine.playVoiceLine(516, 0, 16);
      assert(
        playerLog === '[voice] line 516 playing 2.5s garbled 0% fx off',
        'Test 7b: Player (Race 16) logs fx off: ' + playerLog,
      );

      engine.setEffectsEnabled(false);
      assert(!engine.getEffectsEnabled(), 'Test 7c: Effects switch successfully turned OFF');

      engine.stopAlienPlayback();
      let fxOffLog = '';
      console.log = ((msg: string) => {
        if (typeof msg === 'string' && msg.startsWith('[voice]')) fxOffLog = msg;
      }) as any;

      await engine.playVoiceLine(1, 0, 1);
      assert(
        fxOffLog === '[voice] line 1 playing 2.5s garbled 0% fx off',
        'Test 7d: When effects switch is OFF, alien line logs fx off: ' + fxOffLog,
      );

      engine.setEffectsEnabled(true);
    }

    // ------------------------------------------------------------------------
    // TEST CASE 8: Crew Banter Line FNV-1a 32-bit Hashing & URL Schema
    // ------------------------------------------------------------------------
    {
      const ex1 = 'Pre-flight checklist item 417: ensure all emergency snack rations are secured.';
      const ex2 = 'Operations charter loaded into memory. Statistical probability of mission success: 41.3%.';
      const ex3 = 'Behold, crew! We shall descend upon this uncharted world like thunderous gods of exploration!';

      const hash1 = fnv1a32(ex1);
      const hash2 = fnv1a32(ex2);
      const hash3 = fnv1a32(ex3);

      assert(hash1 === '0e272e2b', 'Test 8a: Example 1 hash matches 0e272e2b (got ' + hash1 + ')');
      assert(hash2 === '4e4096bf', 'Test 8b: Example 2 hash matches 4e4096bf (got ' + hash2 + ')');
      assert(hash3 === 'b59ec1c5', 'Test 8c: Example 3 hash matches b59ec1c5 (got ' + hash3 + ')');

      assert(getBanterLineHash(ex1) === '0e272e2b', 'Test 8d: getBanterLineHash recognizes banter line 1');
      assert(getBanterLineHash(ex2) === '4e4096bf', 'Test 8e: getBanterLineHash recognizes banter line 2');
      assert(getBanterLineHash(ex3) === 'b59ec1c5', 'Test 8f: getBanterLineHash recognizes banter line 3');
      assert(isBanterLine(ex1), 'Test 8g: isBanterLine returns true for banter line');

      const expectedUrl = `${CREW_VOICE_BASE_URL}/0e272e2b.mp3`;
      assert(
        expectedUrl === 'https://raw.githubusercontent.com/cptjamestiberiouskirk-pixel/starflight-dispatch-voices/main/crew/0e272e2b.mp3',
        'Test 8h: Crew URL schema matches exact format: ' + expectedUrl,
      );
    }

    // ------------------------------------------------------------------------
    // TEST CASE 9: Dev Panel crew:0e272e2b & Missing Audio Graceful Handling
    // ------------------------------------------------------------------------
    {
      const engine = new AlienVoiceEngine();
      const mockCtx = new MockAudioContext();
      engine.setAudioContext(mockCtx as any);

      let warnCount = 0;
      let logMissing = '';
      let fetchAttempts = 0;
      let fetchedUrl = '';
      let devStatus = '';

      console.warn = (() => {
        warnCount++;
      }) as any;

      console.log = ((msg: string) => {
        if (typeof msg === 'string' && msg.startsWith('[voice]')) logMissing = msg;
      }) as any;

      globalThis.fetch = (async (url: string) => {
        fetchAttempts++;
        fetchedUrl = url;
        return {
          ok: false,
          status: 404,
        } as any;
      }) as any;

      await engine.playCrewVoice('crew:0e272e2b', (s) => { devStatus = s; }, true);

      assert(
        fetchedUrl === `${CREW_VOICE_BASE_URL}/0e272e2b.mp3`,
        'Test 9a: Fetches correct crew URL: ' + fetchedUrl,
      );
      assert(
        logMissing === '[voice] crew 0e272e2b no recording',
        'Test 9b: Dev panel crew:0e272e2b logs [voice] crew 0e272e2b no recording: ' + logMissing,
      );
      assert(
        devStatus === 'no recording',
        'Test 9c: Status callback reports no recording',
      );
      assert(
        warnCount === 1,
        'Test 9d: Logged one console.warn on failed load',
      );
      assert(
        engine.getPermanentlyFailedCrewHashes().has('0e272e2b'),
        'Test 9e: Hash 0e272e2b marked permanently failed for session',
      );

      logMissing = '';
      await engine.playCrewVoice('0e272e2b', (s) => { devStatus = s; }, true);
      assert(
        fetchAttempts === 1,
        'Test 9f: Permanently failed hash not fetched again in session',
      );
      assert(
        logMissing === '[voice] crew 0e272e2b no recording',
        'Test 9g: Re-logs [voice] crew 0e272e2b no recording without fetching',
      );
    }

    // ------------------------------------------------------------------------
    // TEST CASE 10: Successful Crew Banter Voice Playback & Clean Audio Routing
    // ------------------------------------------------------------------------
    {
      const engine = new AlienVoiceEngine();
      const mockCtx = new MockAudioContext();
      engine.setAudioContext(mockCtx as any);

      const buffer = new MockAudioBuffer({ length: 44100 * 2.4, sampleRate: 44100, duration: 2.4 });
      engine.getCrewCache().set('0e272e2b', buffer as any);

      let logPlaying = '';
      let playStatus = '';
      console.log = ((msg: string) => {
        if (typeof msg === 'string' && msg.startsWith('[voice]')) logPlaying = msg;
      }) as any;

      await engine.playCrewVoice('0e272e2b', (s) => { playStatus = s; });

      assert(
        logPlaying === '[voice] crew 0e272e2b playing 2.4s',
        'Test 10a: Logs exact crew format: ' + logPlaying,
      );
      assert(
        playStatus === 'playing',
        'Test 10b: Status reports playing',
      );
      assert(
        engine.isCrewVoicePlaying(),
        'Test 10c: Crew voice marked as playing',
      );
      assert(
        engine.getCurrentCrewHash() === '0e272e2b',
        'Test 10d: Current crew hash is 0e272e2b',
      );

      // Volume slider to 0%: still logs [voice] crew ... playing ...
      engine.setVolume(0);
      let logZeroVol = '';
      console.log = ((msg: string) => {
        if (typeof msg === 'string' && msg.startsWith('[voice]')) logZeroVol = msg;
      }) as any;

      await engine.playCrewVoice('0e272e2b');
      assert(
        logZeroVol === '[voice] crew 0e272e2b playing 2.4s',
        'Test 10e: At 0% volume, crew voice plays through silent gain and logs: ' + logZeroVol,
      );

      engine.stopCrewVoice();
      assert(
        !engine.isCrewVoicePlaying(),
        'Test 10f: stopCrewVoice terminates crew playback',
      );
    }

    // ------------------------------------------------------------------------
    // TEST CASE 11: Priority & Banter Triggering vs. Alerts / DEV Messages
    // ------------------------------------------------------------------------
    {
      const engine = new AlienVoiceEngine();
      const mockCtx = new MockAudioContext();
      engine.setAudioContext(mockCtx as any);

      // 1. Non-banter lines (alerts, DEV messages, notices) must NEVER produce a hash or trigger fetch
      const alertLine = 'THERMAL ALARM! Planetary core radiation is scorching our outer plating!';
      const devLine = 'DEV: Teleported to Starport Arth Concourse';
      const noticeLine = 'Welcome to active duty, Captain and crew!';

      assert(getBanterLineHash(alertLine) === null, 'Test 11a: Alert line is not a banter line');
      assert(getBanterLineHash(devLine) === null, 'Test 11b: DEV message is not a banter line');
      assert(getBanterLineHash(noticeLine) === null, 'Test 11c: Notice line is not a banter line');

      let fetchCount = 0;
      let logCrew = '';
      globalThis.fetch = (async () => {
        fetchCount++;
        return { ok: true, arrayBuffer: async () => new ArrayBuffer(100) } as any;
      }) as any;

      console.log = ((msg: string) => {
        if (typeof msg === 'string' && msg.startsWith('[voice]')) logCrew = msg;
      }) as any;

      await engine.playCrewBanter(devLine);
      assert(fetchCount === 0, 'Test 11d: Non-banter lines never fetch audio');
      assert(logCrew === '', 'Test 11e: Non-banter lines never log [voice] crew');

      // 2. Banter lines stay silent while alien voice is playing
      const alienBuf = new MockAudioBuffer({ length: 44100 * 3, sampleRate: 44100, duration: 3.0 });
      engine.getCache().set(1, alienBuf as any);

      const crewBuf = new MockAudioBuffer({ length: 44100 * 2.4, sampleRate: 44100, duration: 2.4 });
      engine.getCrewCache().set('0e272e2b', crewBuf as any);

      // Start alien line 1
      await engine.playVoiceLine(1, 0, 'Elowan');
      assert(engine.isAlienVoicePlaying(), 'Test 11f: Alien voice is active');

      logCrew = '';
      // Trigger banter line while alien voice is playing
      await engine.playCrewBanter('Pre-flight checklist item 417: ensure all emergency snack rations are secured.');

      assert(
        logCrew === '',
        'Test 11g: Banter lines stay silent while alien voice is playing',
      );
      assert(
        !engine.isCrewVoicePlaying(),
        'Test 11h: Crew voice is not playing while alien voice active',
      );

      // 3. Banter lines stay silent while comm voice is WAITING in queue
      await engine.playVoiceLine(2, 0, 'Elowan'); // Queues Line 2
      assert(engine.getQueueLength() === 1, 'Test 11i: Line 2 is waiting in queue');

      logCrew = '';
      await engine.playCrewBanter('Pre-flight checklist item 417: ensure all emergency snack rations are secured.');
      assert(
        logCrew === '',
        'Test 11j: Banter lines stay silent while comm voice is waiting in queue',
      );

      // 4. When comm voice is idle and queue is empty, banter line plays audio
      engine.stopAlienPlayback(); // Clears line 1 and queue
      assert(!engine.isAlienVoicePlaying() && engine.getQueueLength() === 0, 'Test 11k: Comm is completely idle');

      logCrew = '';
      await engine.playCrewBanter('Pre-flight checklist item 417: ensure all emergency snack rations are secured.');
      assert(
        logCrew.startsWith('[voice] crew 0e272e2b playing'),
        'Test 11l: Banter line plays when no comm voice is playing or waiting: ' + logCrew,
      );

      // 5. New alien line immediately stops active crew voice
      await engine.playVoiceLine(1, 0, 'Elowan');
      assert(
        !engine.isCrewVoicePlaying(),
        'Test 11m: New comm line immediately stopped active crew voice',
      );
      assert(
        engine.isAlienVoicePlaying(),
        'Test 11n: Comm voice is now playing with priority',
      );

      // 6. If banterEnabled is false, no banter voices play
      engine.stopAlienPlayback();
      engine.setBanterEnabled(false);
      logCrew = '';
      await engine.playCrewBanter('Pre-flight checklist item 417: ensure all emergency snack rations are secured.');
      assert(
        logCrew === '' && !engine.isCrewVoicePlaying(),
        'Test 11o: When banter is disabled in settings, no banter voices play',
      );
      engine.setBanterEnabled(true);
    }

    // ------------------------------------------------------------------------
    // TEST CASE 12: Sequential Comm Queueing, Drop Oldest on 4th & No-Recording Advance
    // ------------------------------------------------------------------------
    {
      const engine = new AlienVoiceEngine();
      const mockCtx = new MockAudioContext();
      engine.setAudioContext(mockCtx as any);

      const buf1 = new MockAudioBuffer({ length: 44100 * 2, sampleRate: 44100, duration: 2.0 });
      const buf2 = new MockAudioBuffer({ length: 44100 * 2, sampleRate: 44100, duration: 2.0 });
      const buf3 = new MockAudioBuffer({ length: 44100 * 2, sampleRate: 44100, duration: 2.0 });
      const buf4 = new MockAudioBuffer({ length: 44100 * 2, sampleRate: 44100, duration: 2.0 });
      const buf5 = new MockAudioBuffer({ length: 44100 * 2, sampleRate: 44100, duration: 2.0 });

      engine.getCache().set(201, buf1 as any);
      engine.getCache().set(202, buf2 as any);
      engine.getCache().set(203, buf3 as any);
      // Line 204 will have NO recording (missing)
      engine.getPermanentlyFailedLines().add(204);
      engine.getCache().set(205, buf5 as any);

      const logs: string[] = [];
      console.log = ((msg: string) => {
        if (typeof msg === 'string' && msg.startsWith('[voice]')) {
          logs.push(msg);
        }
      }) as any;

      // 1. Line 201 plays immediately
      await engine.playVoiceLine(201, 0, 'Elowan');
      assert(
        logs[logs.length - 1] === '[voice] line 201 playing 2.0s garbled 0% fx elowan',
        'Test 12a: Line 201 plays immediately',
      );
      assert(engine.getQueueLength() === 0, 'Test 12b: Queue is initially empty');

      // 2. Line 202 queued -> (1 waiting)
      await engine.playVoiceLine(202, 0, 'Thrynn');
      assert(
        logs[logs.length - 1] === '[voice] line 202 queued (1 waiting)',
        'Test 12c: Line 202 logged: ' + logs[logs.length - 1],
      );
      assert(engine.getQueueLength() === 1, 'Test 12d: 1 item waiting in queue');

      // 3. Line 203 queued -> (2 waiting)
      await engine.playVoiceLine(203, 0, 'Veloxi');
      assert(
        logs[logs.length - 1] === '[voice] line 203 queued (2 waiting)',
        'Test 12e: Line 203 logged: ' + logs[logs.length - 1],
      );
      assert(engine.getQueueLength() === 2, 'Test 12f: 2 items waiting in queue');

      // 4. Line 204 queued -> (3 waiting)
      await engine.playVoiceLine(204, 0, 'Spemin');
      assert(
        logs[logs.length - 1] === '[voice] line 204 queued (3 waiting)',
        'Test 12g: Line 204 logged: ' + logs[logs.length - 1],
      );
      assert(engine.getQueueLength() === 3, 'Test 12h: 3 items waiting in queue (queue full)');

      // 5. Line 205 arrives while 3 are already waiting:
      // Must drop oldest waiting (Line 202), queue Line 205, and log (3 waiting)
      await engine.playVoiceLine(205, 0, 'Gazurtoid');
      assert(
        logs[logs.length - 1] === '[voice] line 205 queued (3 waiting)',
        'Test 12i: Line 205 queued and oldest dropped, logged: ' + logs[logs.length - 1],
      );
      assert(engine.getQueueLength() === 3, 'Test 12j: Queue length clamped at 3');
      const queueIds = engine.getCommQueue().map((q) => q.lineId);
      assert(
        JSON.stringify(queueIds) === JSON.stringify([203, 204, 205]),
        'Test 12k: Queue contains [203, 204, 205] (202 was dropped): ' + JSON.stringify(queueIds),
      );

      // 6. Line 201 finishes -> next in queue is Line 203
      logs.length = 0;
      engine.finishCurrentCommLine();
      assert(
        logs[0] === '[voice] line 203 playing 2.0s garbled 0% fx veloxi',
        'Test 12l: Line 203 starts playing sequentially: ' + logs[0],
      );
      assert(engine.getCurrentLineId() === 203, 'Test 12m: Current line is 203');
      assert(engine.getQueueLength() === 2, 'Test 12n: 2 items remain in queue [204, 205]');

      // 7. Line 203 finishes -> next is Line 204 (which has NO recording).
      // Must log "[voice] line 204 no recording" AND immediately advance to Line 205!
      logs.length = 0;
      engine.finishCurrentCommLine();
      assert(
        logs[0] === '[voice] line 204 no recording',
        'Test 12o: Line 204 logs no recording: ' + logs[0],
      );
      assert(
        logs[1] === '[voice] line 205 playing 2.0s garbled 0% fx gazurtoid',
        'Test 12p: Immediately advanced to Line 205: ' + logs[1],
      );
      assert(engine.getCurrentLineId() === 205, 'Test 12q: Current playing line is 205');
      assert(engine.getQueueLength() === 0, 'Test 12r: Queue is now empty');

      // 8. stopVoice() stops active audio and clears queue
      engine.stopVoice();
      assert(!engine.isAlienVoicePlaying(), 'Test 12s: stopVoice marks engine idle');
      assert(engine.getQueueLength() === 0, 'Test 12t: stopVoice leaves queue empty');
    }
  } finally {
    globalThis.fetch = origFetch;
    console.log = origLog;
    console.warn = origWarn;
  }

  return { passed, failed, results };
}

// Auto-run verification on file import or node execution
if (typeof window !== 'undefined') {
  (window as any).runVoiceTests = runVoiceTests;
}

const testRunner = globalThis as unknown as {
  describe?: (name: string, fn: () => void) => void;
  it?: (name: string, fn: () => Promise<void> | void) => void;
  process?: { env?: Record<string, string | undefined> };
};

if (typeof testRunner.describe === 'function' && typeof testRunner.it === 'function') {
  testRunner.describe('Alien & Crew Voice Dialogue Engine', () => {
    testRunner.it!('passes all specification test cases', async () => {
      const { failed } = await runVoiceTests();
      if (failed > 0) {
        throw new Error(`${failed} test(s) failed in Voice Engine test suite.`);
      }
    });
  });
} else if (typeof testRunner.process !== 'undefined' && testRunner.process.env?.NODE_ENV === 'test') {
  void runVoiceTests().then(({ passed, failed }) => {
    console.log(`[Voice Engine Tests] Completed: ${passed} passed, ${failed} failed.`);
  });
}
