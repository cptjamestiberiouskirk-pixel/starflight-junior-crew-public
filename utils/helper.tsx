import {drawConfiguredShip} from './ship-art';
import {controlOwnsKey} from './keyboard-input';
import {createMiningLaserSound,prepareMiningAudio} from './mining-audio';
import {BayLaunchSound} from './cinematic-audio';
// tslint:disable
/* eslint-disable */
import {shipExhaustNozzles} from './space-rendering';
import React, {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react';

/**  --- Overlay component ---
 * A full-screen UI overlay component used to display game states
 * such as Start Menus, Pause Screens, Game Over, and Victory screens.
 * It renders a semi-transparent background with a title, optional description,
 * and a primary action button.
 */

type OverlayTone = 'neutral' | 'danger' | 'victory';

interface OverlayProps {
  title: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
  icon?: React.ReactNode;
  tone?: OverlayTone;
  autoFocus?: boolean;
}

const TONE_CLASS: Record<OverlayTone, string> = {
  neutral: 'bg-black/70',
  danger: 'bg-red-900/80',
  victory: 'bg-emerald-900/80',
};

const BUTTON_CLASS: Record<OverlayTone, string> = {
  neutral: 'hover:bg-yellow-400',
  danger: 'hover:bg-red-400',
  victory: 'hover:bg-emerald-400',
};

/**
 * @param title - The main, large heading text to display (e.g., "GAME OVER").
 * @param description - Optional subtitle text to display below the title (e.g., "Final Score: 42").
 * @param actionLabel - The text to display inside the primary action button (e.g., "PLAY AGAIN").
 * @param onAction - Callback function executed when the user clicks the primary action button.
 * @param icon - Optional React node (like a Lucide icon) rendered inside the action button next to the label.
 * @param tone - The visual theme of the overlay which dictates background and hover colors. Defaults to 'neutral'. ('neutral' | 'danger' | 'victory')
 */
/** Focuses the referenced element on mount to ensure Enter works. */
export function useAutoFocus<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);
  useEffect(() => {
    // Only focus if enabled is true
    if (enabled && ref.current) {
      ref.current.focus();
    }
  }, [enabled]);
  return ref;
}

export function Overlay({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  tone = 'neutral',
  autoFocus = true,
}: OverlayProps) {
  const buttonRef = useAutoFocus<HTMLButtonElement>(autoFocus);

  return (
    <div
      className={`absolute inset-0 ${TONE_CLASS[tone]} overflow-y-auto touch-auto`}>
      <div className="min-h-full flex flex-col items-center p-4">
        <div className="m-auto flex flex-col items-center w-full max-w-md">
          <h1 className="text-3xl md:text-5xl font-black mb-4 text-yellow-400 text-center">
            {title}
          </h1>
          {description && (
            <p className="text-lg md:text-2xl mb-8 text-center">
              {description}
            </p>
          )}
          <button
            ref={buttonRef}
            autoFocus={autoFocus}
            onClick={onAction}
            data-testid="start-button"
            className={`bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded-full font-bold text-lg md:text-xl transition-colors flex items-center gap-2 ${BUTTON_CLASS[tone]}`}>
            {icon}
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export interface MenuOverlayProps {
  children: React.ReactNode;
  tone?: OverlayTone;
  zIndex?: number;
}

/**
 * A highly resilient menu wrapper that statically decouples scrolling from flexbox alignment.
 * It strictly avoids the clipping bug on mobile by preventing flex justify-center from being assigned
 * to the overflow-y-auto boundary. Plugs seamlessly into the AI's generation workflows.
 * The inner children should provide their own box styling (e.g., w-full max-w-md bg-slate-900 rounded).
 */
export function MenuOverlay({
  children,
  tone = 'neutral',
  zIndex = 40,
}: MenuOverlayProps) {
  const overlayRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const root=overlayRef.current;if(!root)return;
    // Existing maps supply their own named dialog. Other overlays need the
    // same semantics so assistive technology announces the modal boundary.
    if(!root.querySelector('[role="dialog"],[role="alertdialog"]')){
      root.setAttribute('role','dialog');
      root.setAttribute('aria-modal','true');
      root.setAttribute('aria-label',root.querySelector('h1,h2,h3')?.textContent?.trim()||'Game dialog');
    }
    const previous=document.activeElement as HTMLElement|null;
    const isTop=()=>Array.from(document.querySelectorAll<HTMLElement>('[data-menu-overlay]'))
      .filter(e=>e.isConnected&&e.getClientRects().length)
      .sort((a,b)=>Number(a.style.zIndex)-Number(b.style.zIndex)).at(-1)===root;
    const controls=()=>Array.from(root.querySelectorAll<HTMLElement>('button,a[href],input,select,textarea,summary,[tabindex]'))
      .filter(e=>e.tabIndex>=0&&!e.matches(':disabled')&&e.getClientRects().length&&!e.closest('[inert],[aria-hidden="true"]'));
    if(isTop()&&!root.contains(document.activeElement))(controls()[0]??root).focus({preventScroll:true});
    const keydown=(event:KeyboardEvent)=>{
      if(event.key!=='Tab'||!isTop())return;
      const list=controls(),first=list[0],last=list.at(-1);
      event.stopPropagation();
      if(!first){event.preventDefault();root.focus();return;}
      if(!root.contains(document.activeElement)||event.shiftKey&&document.activeElement===first||!event.shiftKey&&document.activeElement===last){
        event.preventDefault();(event.shiftKey?last!:first).focus();
      }
    };
    document.addEventListener('keydown',keydown,true);
    return()=>{document.removeEventListener('keydown',keydown,true);if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[]);
  return (
    <div
      ref={overlayRef} data-menu-overlay="" tabIndex={-1}
      className={`absolute inset-0 ${TONE_CLASS[tone]} overflow-y-auto touch-auto`}
      style={{zIndex}}>
      <div className="min-h-full flex flex-col items-center p-4">
        <div className="m-auto w-full min-w-0 flex flex-col items-center">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Actions that can be triggered by the user. */
export type InputAction =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'confirm'
  | 'cancel'
  | 'tap';

/** Represents the state of the pointer (mouse or touch). */
export interface PointerState {
  /** The X coordinate of the pointer. */
  x: number;
  /** The Y coordinate of the pointer. */
  y: number;
  /** Whether the pointer is currently pressed down. */
  down: boolean;
}

/** A snapshot of the input state at a specific frame. */
export interface InputSnapshot {
  /** Map of actions to their active state. */
  actions: Record<InputAction, boolean>;
  /** The current state of the pointer. */
  pointer: PointerState;
}

interface LogicalSize {
  width: number;
  height: number;
}

const ACTION_KEYS: Record<string, InputAction> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  a: 'left',
  d: 'right',
  w: 'up',
  s: 'down',
  Enter: 'confirm',
  ' ': 'confirm',
  Escape: 'cancel',
};

/**
 * Initializes all input actions to a default 'false' state.
 */
const createEmptyActions = (): Record<InputAction, boolean> => ({
  left: false,
  right: false,
  up: false,
  down: false,
  confirm: false,
  cancel: false,
  tap: false,
});

/**
 * Calculates the pointer's logical X/Y coordinates on the canvas.
 */
const getPointerPosition = (
  event: PointerEvent,
  canvas: HTMLCanvasElement,
  logicalSize?: LogicalSize,
): {x: number; y: number} => {
  const rect = canvas.getBoundingClientRect();
  const width = logicalSize?.width ?? rect.width;
  const height = logicalSize?.height ?? rect.height;
  const x = (event.clientX - rect.left) * (width / rect.width);
  const y = (event.clientY - rect.top) * (height / rect.height);
  return {x, y};
};

/**
 * Hook to capture and manage user input (keyboard and pointer).
 * @param canvasRef Reference to the game canvas element.
 * @param enabled Whether input capture is enabled.
 * @param logicalSize Optional logical size of the canvas for coordinate scaling.
 * @returns A mutable ref containing the current input snapshot.
 */
export const useInput = (
  canvasRef: RefObject<HTMLCanvasElement>,
  enabled = true,
  logicalSize?: LogicalSize,
): MutableRefObject<InputSnapshot> => {
  const inputRef = useRef<InputSnapshot>({
    actions: createEmptyActions(),
    pointer: {x: 0, y: 0, down: false},
  });

  useEffect(() => {
    if (!enabled) {
      inputRef.current.actions = createEmptyActions();
      inputRef.current.pointer = {x: 0, y: 0, down: false};
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (controlOwnsKey(event.target,event.key)) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      const action = ACTION_KEYS[event.key];
      if (!action) return;
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(
          event.key,
        )
      ) {
        event.preventDefault();
      }
      inputRef.current.actions[action] = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      const action = ACTION_KEYS[event.key];
      if (!action) return;
      inputRef.current.actions[action] = false;
    };

    const canvas = canvasRef.current;
    const handlePointerDown = (event: PointerEvent) => {
      if (!canvas) return;
      if (typeof canvas.setPointerCapture === 'function') {
        canvas.setPointerCapture(event.pointerId);
      }
      inputRef.current.pointer = {
        ...getPointerPosition(event, canvas, logicalSize),
        down: true,
      };
      inputRef.current.actions.tap = true;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!canvas) return;
      inputRef.current.pointer = {
        ...getPointerPosition(event, canvas, logicalSize),
        down: inputRef.current.pointer.down,
      };
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!canvas) return;
      if (
        typeof canvas.releasePointerCapture === 'function' &&
        canvas.hasPointerCapture(event.pointerId)
      ) {
        canvas.releasePointerCapture(event.pointerId);
      }
      inputRef.current.pointer = {
        ...getPointerPosition(event, canvas, logicalSize),
        down: false,
      };
      inputRef.current.actions.tap = false;
    };

    const handleBlur = () => {
      inputRef.current.actions = createEmptyActions();
      if (inputRef.current.pointer) {
        inputRef.current.pointer.down = false;
      }
      inputRef.current.actions.tap = false;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleBlur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (canvas) {
      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerup', handlePointerUp);
      canvas.addEventListener('pointercancel', handlePointerUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (canvas) {
        canvas.removeEventListener('pointerdown', handlePointerDown);
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('pointerup', handlePointerUp);
        canvas.removeEventListener('pointercancel', handlePointerUp);
      }
    };
  }, [canvasRef, enabled]);

  return inputRef;
};

/**
 * audio.ts — procedural sound effects via the Web Audio API.
 *
 * No asset files, no network: every sound is synthesized on the fly. Import the
 * shared `gameAudio` singleton, insert required SFX methods, and call them:
 *
 *   import { gameAudio } from './utils/helper';
 *
 *   // After inserting playArcadeLaser:
 *   gameAudio.playArcadeLaser();         // on shoot
 *
 * Autoplay: browsers block audio until the first user gesture. This module
 * unlocks itself on the first pointer/key/touch event, and every play call also
 * resumes the context — so it is safe to call any method at any time; calls made
 * before the first interaction simply no-op instead of throwing.
 *
 * Volume & mute are global (master): gameAudio.setVolume(0.4),
 * gameAudio.toggleMute().
 */

interface Beat {
  ctx: AudioContext;
  out: GainNode;
  now: number;
}

class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxMaster: GainNode | null = null;
  private baySound:BayLaunchSound|null=null;
  private arrivalSound:BayLaunchSound|null=null;
  private miningRequested=false;
  private miningVoice:ReturnType<typeof createMiningLaserSound>|null=null;
  private muted = false; // SFX muted
  private volume = 0.6; // master volume, 0..1

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('playground-mute', (e: Event) => {
        const customEvent = e as CustomEvent<{muted: boolean}>;
        this.setMuted(customEvent.detail.muted);
      });
    }
  }

  // --- Context lifecycle -----------------------------------------------------

  /**
   * Lazily create the AudioContext + master gain on first use. Returns null when
   * Web Audio is unavailable (e.g. during SSR), in which case all play calls
   * become no-ops.
   */
  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (typeof window === 'undefined') return null;

    const Ctor =
      window.AudioContext ||
      (window as unknown as {webkitAudioContext?: typeof AudioContext})
        .webkitAudioContext;
    if (!Ctor) {
      console.warn('[audio] Web Audio API not supported');
      return null;
    }

    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.sfxMaster = this.ctx.createGain();
    this.master.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.sfxMaster.gain.setValueAtTime(
      this.muted ? 0 : 1,
      this.ctx.currentTime,
    );
    this.sfxMaster.connect(this.master);
    this.master.connect(this.ctx.destination);
    void prepareMiningAudio(this.ctx);
    this.attachUnlock();
    return this.ctx;
  }

  /** Resume the context on the first user gesture (one-shot). */
  private attachUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      void this.ctx?.resume().catch(() => {});
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock);
  }

  /** Manually resume the context — call from a click handler if needed. */
  resume() {
    const ctx = this.ensure();
    if (ctx && ctx.state === 'suspended') void ctx.resume().catch(() => {});
  }

  /** Prepare to play a one-shot. Returns null when muted or unavailable. */
  private begin(): Beat | null {
    const ctx = this.ensure();
    const out = this.sfxMaster;
    if (!ctx || !out || this.muted) return null;
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
    return {ctx, out, now: ctx.currentTime};
  }

  // --- Master controls -------------------------------------------------------

  /** Set master volume (0..1). Affects SFX. */
  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.master && this.ctx) {
      this.master.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  /** Toggle global SFX mute. Returns the new muted state. */
  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if(muted){this.miningVoice?.stop();this.miningVoice=null;}else if(this.miningRequested)this.setMiningLaser(true);
    if (this.sfxMaster && this.ctx) {
      this.sfxMaster.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  getMuteState(): boolean {
    return this.muted;
  }

  // --- Synthesis helpers -----------------------------------------------------

  /** Schedule one enveloped oscillator. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private blip(
    b: Beat,
    at: number,
    o: {
      freq: number;
      freqTo?: number;
      dur: number;
      type?: OscillatorType;
      gain?: number;
      glide?: 'exp' | 'lin';
    },
  ) {
    const {ctx, out} = b;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = o.type ?? 'square';
    osc.frequency.setValueAtTime(o.freq, at);
    if (o.freqTo !== undefined) {
      if ((o.glide ?? 'exp') === 'lin') {
        osc.frequency.linearRampToValueAtTime(o.freqTo, at + o.dur);
      } else {
        // Exponential ramps cannot target 0.
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(1, o.freqTo),
          at + o.dur,
        );
      }
    }

    const peak = o.gain ?? 0.15;
    g.gain.setValueAtTime(peak, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + o.dur);

    osc.connect(g);
    g.connect(out);
    osc.start(at);
    osc.stop(at + o.dur + 0.02);
  }

  /** Schedule a filtered white-noise burst (impacts, explosions). */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private noiseBurst(
    b: Beat,
    at: number,
    o: {dur: number; gain?: number; from?: number; to?: number},
  ) {
    const {ctx, out} = b;
    const len = Math.max(1, Math.floor(ctx.sampleRate * o.dur));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(o.from ?? 1000, at);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(1, o.to ?? 80),
      at + o.dur,
    );

    const g = ctx.createGain();
    g.gain.setValueAtTime(o.gain ?? 0.18, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + o.dur);

    src.connect(filter);
    filter.connect(g);
    g.connect(out);
    src.start(at);
    src.stop(at + o.dur);
  }

  /** Small random multiplier so rapid-fire sounds don't feel robotic. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private vary(amount = 0.05): number {
    return 1 + (Math.random() * 2 - 1) * amount;
  }

  // --- Sound effects ---------------------------------------------------------

  /** Generic one-shot tone — escape hatch for custom blips. */
  playTone(o: {
    type?: OscillatorType;
    freq: number;
    freqTo?: number;
    dur?: number;
    gain?: number;
  }) {
    const b = this.begin();
    if (!b) return;
    this.blip(b, b.now, {
      type: o.type,
      freq: o.freq,
      freqTo: o.freqTo,
      dur: o.dur ?? 0.15,
      gain: o.gain,
    });
  }

  playHoverMicroTone() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.02);
    this.blip(b, b.now, { type: 'sine', freq: 880 * v, dur: 0.03, gain: 0.05 });
  }

  playShieldBlock() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sine', freq: 100 * v, freqTo: 30 * v, dur: 0.2, gain: 0.2 });
    this.noiseBurst(b, b.now, { dur: 0.15, gain: 0.12, from: 500, to: 100 });
  }

  playSwordClash() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sine', freq: 2800 * v, dur: 0.25, gain: 0.05 });
    this.blip(b, b.now, { type: 'sine', freq: 3420 * v, dur: 0.2, gain: 0.04 });
    this.blip(b, b.now, { type: 'sine', freq: 4150 * v, dur: 0.15, gain: 0.03 });
    this.blip(b, b.now, { type: 'sine', freq: 4980 * v, dur: 0.1, gain: 0.02 });
    this.noiseBurst(b, b.now, { dur: 0.08, gain: 0.08, from: 3000, to: 800 });
  }

  // --- COMPREHENSIVE STARFLIGHT SFX LIBRARY ---

  playDoorBlast() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.noiseBurst(b, b.now, { dur: 0.28, gain: 0.16, from: 1800 * v, to: 200 * v });
    this.blip(b, b.now, { type: 'triangle', freq: 180 * v, freqTo: 50 * v, dur: 0.25, gain: 0.12 });
  }

  playThrusterWhoosh() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.noiseBurst(b, b.now, { dur: 0.45, gain: 0.2, from: 1200 * v, to: 120 * v });
    this.blip(b, b.now, { type: 'sine', freq: 90 * v, freqTo: 45 * v, dur: 0.4, gain: 0.18 });
  }

  playOrbitSweep() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sine', freq: 220 * v, freqTo: 880 * v, dur: 0.35, gain: 0.08, glide: 'exp' });
    this.blip(b, b.now + 0.1, { type: 'triangle', freq: 440 * v, freqTo: 1320 * v, dur: 0.3, gain: 0.06, glide: 'exp' });
  }

  playReentryRoar() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.noiseBurst(b, b.now, { dur: 0.6, gain: 0.22, from: 2400 * v, to: 80 * v });
    this.blip(b, b.now, { type: 'sawtooth', freq: 85 * v, freqTo: 35 * v, dur: 0.55, gain: 0.15 });
  }

  playRadarPing() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sine', freq: 1760 * v, dur: 0.18, gain: 0.1 });
    this.blip(b, b.now + 0.06, { type: 'sine', freq: 2640 * v, dur: 0.12, gain: 0.06 });
  }

  playDataChime() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    const notes = [587.33, 880.0, 1174.66, 1760.0];
    notes.forEach((f, i) => {
      this.blip(b, b.now + i * 0.04, { type: 'sine', freq: f * v, dur: 0.08, gain: 0.06 });
    });
  }

  playRoverDriveHum() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.08);
    this.blip(b, b.now, { type: 'triangle', freq: 75 * v, freqTo: 95 * v, dur: 0.12, gain: 0.08 });
    this.noiseBurst(b, b.now, { dur: 0.08, gain: 0.04, from: 400 * v, to: 150 * v });
  }

  playRoverBump() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sine', freq: 110 * v, freqTo: 35 * v, dur: 0.12, gain: 0.14 });
    this.noiseBurst(b, b.now, { dur: 0.06, gain: 0.08, from: 500, to: 80 });
  }

  playTractorSparkle() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    for (let i = 0; i < 4; i++) {
      this.blip(b, b.now + i * 0.05, {
        type: 'sine',
        freq: (1200 + i * 400) * v,
        dur: 0.1,
        gain: 0.07,
      });
    }
  }

  playAlarmKlaxon() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.01);
    this.blip(b, b.now, { type: 'sawtooth', freq: 740 * v, freqTo: 520 * v, dur: 0.22, gain: 0.15 });
    this.blip(b, b.now + 0.12, { type: 'sawtooth', freq: 740 * v, freqTo: 520 * v, dur: 0.22, gain: 0.15 });
  }

  playRedAlertSiren() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.01);
    this.blip(b, b.now, { type: 'sawtooth', freq: 440 * v, freqTo: 880 * v, dur: 0.25, gain: 0.14 });
    this.blip(b, b.now + 0.25, { type: 'sawtooth', freq: 880 * v, freqTo: 440 * v, dur: 0.25, gain: 0.14 });
  }

  playLavaAlarm() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sawtooth', freq: 950 * v, freqTo: 600 * v, dur: 0.15, gain: 0.12 });
    this.noiseBurst(b, b.now, { dur: 0.1, gain: 0.08, from: 800, to: 200 });
  }

  playCommsConnect() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sine', freq: 659.25 * v, dur: 0.08, gain: 0.08 });
    this.blip(b, b.now + 0.07, { type: 'sine', freq: 987.77 * v, dur: 0.14, gain: 0.1 });
  }

  playCommsDisconnect() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sine', freq: 987.77 * v, dur: 0.08, gain: 0.08 });
    this.blip(b, b.now + 0.07, { type: 'sine', freq: 493.88 * v, dur: 0.15, gain: 0.09 });
  }

  playCommsStatic() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.noiseBurst(b, b.now, { dur: 0.2, gain: 0.09, from: 3500 * v, to: 600 * v });
    this.blip(b, b.now, { type: 'sawtooth', freq: 300 * v, dur: 0.1, gain: 0.04 });
  }

  playMalfunctionSputter() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sawtooth', freq: 220 * v, freqTo: 60 * v, dur: 0.18, gain: 0.12 });
    this.noiseBurst(b, b.now + 0.05, { dur: 0.15, gain: 0.1, from: 800, to: 100 });
    this.blip(b, b.now + 0.12, { type: 'square', freq: 110 * v, dur: 0.1, gain: 0.08 });
  }

  playFineBuzzer() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sawtooth', freq: 130 * v, dur: 0.28, gain: 0.15 });
    this.blip(b, b.now, { type: 'square', freq: 185 * v, dur: 0.28, gain: 0.12 });
  }

  playRedHerringGroan() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'triangle', freq: 160 * v, freqTo: 65 * v, dur: 0.45, gain: 0.14 });
    this.noiseBurst(b, b.now + 0.1, { dur: 0.25, gain: 0.05, from: 400, to: 80 });
  }

  // INSERT_SFX_HERE
  playJumpLandingThud() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sine', freq: 140 * v, freqTo: 35 * v, dur: 0.16, gain: 0.15 });
    this.noiseBurst(b, b.now, { dur: 0.12, gain: 0.08, from: 300, to: 60 });
  }

  playGunshotBlast() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sine', freq: 120 * v, freqTo: 40 * v, dur: 0.15, gain: 0.2 });
    this.noiseBurst(b, b.now, { dur: 0.08, gain: 0.15, from: 4000 * v, to: 1000 * v });
  }

  playMeleePunch() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'triangle', freq: 140 * v, freqTo: 30 * v, dur: 0.15, gain: 0.18 });
    this.noiseBurst(b, b.now, { dur: 0.08, gain: 0.1, from: 600, to: 80 });
  }

  playFootstepStone() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.noiseBurst(b, b.now, { dur: 0.05, gain: 0.08, from: 1000 * v, to: 600 * v });
    this.blip(b, b.now, { type: 'triangle', freq: 300 * v, dur: 0.03, gain: 0.04 });
  }

  playCrispClick() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sine', freq: 1200 * v, dur: 0.015, gain: 0.1 });
  }

  playConfirmSelect() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sine', freq: 523.25 * v, dur: 0.1, gain: 0.08 });
    this.blip(b, b.now + 0.08, { type: 'sine', freq: 783.99 * v, dur: 0.15, gain: 0.1 });
  }

  playErrorBuzz() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sawtooth', freq: 150 * v, dur: 0.2, gain: 0.08 });
    this.blip(b, b.now, { type: 'sawtooth', freq: 159 * v, dur: 0.2, gain: 0.08 });
  }

  playRetroJump() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'square', freq: 150 * v, freqTo: 600 * v, dur: 0.15, gain: 0.1 });
  }

  prepareBayAudio(){
    const ctx=this.ensure();if(!ctx||!this.sfxMaster)return;
    this.baySound??=new BayLaunchSound(ctx,this.sfxMaster);void this.baySound.prepare();
  }
  syncBayArrival(active:boolean,progress:number,duration:number,speaking=false){
    const ctx=active?this.ensure():null;
    if(ctx&&this.sfxMaster&&!this.arrivalSound)this.arrivalSound=new BayLaunchSound(ctx,this.sfxMaster,new URL('../assets/audio/docking-arrival-mirelo.wav',import.meta.url).href);
    this.arrivalSound?.duck(speaking);this.arrivalSound?.sync(active,progress,duration);
  }
  syncBayLaunch(active:boolean,progress:number,duration:number,speaking=false){
    if(active&&!this.baySound)this.prepareBayAudio();
    this.baySound?.duck(speaking);
    this.baySound?.sync(active,progress,duration);
  }

  setMiningLaser(active:boolean) {
    this.miningRequested=active;
    if(!active){this.miningVoice?.stop();this.miningVoice=null;return;}
    if(this.miningVoice||this.muted)return;
    const beat=this.begin();if(beat)this.miningVoice=createMiningLaserSound(beat.ctx,beat.out);
  }

  playArcadeLaser() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    const dur = 0.2;
    
    const osc = b.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800 * v, b.now);
    osc.frequency.exponentialRampToValueAtTime(80 * v, b.now + dur);
    
    const filter = b.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 5;
    filter.frequency.setValueAtTime(2000 * v, b.now);
    filter.frequency.exponentialRampToValueAtTime(100 * v, b.now + dur);
    
    const gain = b.ctx.createGain();
    gain.gain.setValueAtTime(0.12, b.now);
    gain.gain.exponentialRampToValueAtTime(0.0001, b.now + dur);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(b.out);
    
    osc.start(b.now);
    osc.stop(b.now + dur);
  }

  playChiptuneExplosion() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.noiseBurst(b, b.now, { dur: 0.4, gain: 0.2, from: 1000, to: 100 });
    this.blip(b, b.now, { type: 'triangle', freq: 160 * v, freqTo: 30 * v, dur: 0.35, gain: 0.25 });
  }

  playCoinPickup() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'square', freq: 987.77 * v, dur: 0.1, gain: 0.08 });
    this.blip(b, b.now + 0.08, { type: 'square', freq: 1318.51 * v, dur: 0.2, gain: 0.08 });
  }

  playPowerupChime() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, i) => {
      this.blip(b, b.now + i * 0.06, { type: 'sine', freq: freq * v, dur: 0.15, gain: 0.06 });
    });
  }

  playVictoryFanfare() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, i) => {
      this.blip(b, b.now + i * 0.1, { type: 'sawtooth', freq: freq * v, dur: 0.4, gain: 0.06 });
      this.blip(b, b.now + i * 0.1, { type: 'sine', freq: freq * v, dur: 0.4, gain: 0.04 });
    });
    const chordTime = notes.length * 0.1;
    notes.forEach((freq) => {
      this.blip(b, b.now + chordTime, { type: 'triangle', freq: freq * v, dur: 0.8, gain: 0.06 });
    });
  }

  playDefeatMotif() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    const notes = [311.13, 261.63, 246.94, 196.00];
    notes.forEach((freq, i) => {
      this.blip(b, b.now + i * 0.15, { type: 'sawtooth', freq: freq * v, dur: 0.3, gain: 0.08 });
      this.blip(b, b.now + i * 0.15, { type: 'sine', freq: freq * 0.5 * v, dur: 0.35, gain: 0.06 });
    });
  }

  playLevelUpStinger() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      this.blip(b, b.now + i * 0.07, { type: 'sine', freq: freq * v, dur: 0.25, gain: 0.06 });
    });
    const tailTime = notes.length * 0.07;
    this.noiseBurst(b, b.now + tailTime, { dur: 0.8, gain: 0.05, from: 3000, to: 6000 });
    for (let i = 0; i < 5; i++) {
      this.blip(b, b.now + tailTime + i * 0.1, {
        type: 'sine',
        freq: (2000 + i * 500) * this.vary(0.1),
        dur: 0.2,
        gain: 0.03
      });
    }
  }
}

/** Shared singleton — import and use anywhere. */
export const gameAudio = new GameAudio();

// ============================================================================
// GENERAL UTILITIES & MATH HELPERS
// ============================================================================

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const formatTime = (seconds: number): string => {
  const clamped = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(clamped / 60);
  const remaining = clamped % 60;
  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
};

export const prepareCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pixelRatio?: number,
): void => {
  const dpr = pixelRatio ?? Math.max(1, window.devicePixelRatio || 1);
  const displayWidth = Math.round(width * dpr);
  const displayHeight = Math.round(height * dpr);

  if (
    ctx.canvas.width !== displayWidth ||
    ctx.canvas.height !== displayHeight
  ) {
    ctx.canvas.width = displayWidth;
    ctx.canvas.height = displayHeight;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
};

const unsharpMaskCache = new WeakMap<HTMLImageElement | HTMLCanvasElement, HTMLCanvasElement>();

/**
 * Performs a lightweight one-time unsharp mask pass (amount ~0.6, radius ~1px)
 * on an offscreen canvas and caches it to preserve crispness without blur.
 */
export function getUnsharpMaskCanvas(
  img: HTMLImageElement | HTMLCanvasElement,
  amount = 0.6,
): HTMLCanvasElement {
  const cached = unsharpMaskCache.get(img);
  const w = img instanceof HTMLImageElement ? img.naturalWidth : img.width;
  const h = img instanceof HTMLImageElement ? img.naturalHeight : img.height;
  if (
    cached &&
    cached.width === w &&
    cached.height === h
  ) {
    return cached;
  }

  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return offscreen;

  offCtx.drawImage(img, 0, 0, w, h);

  try {
    const imgData = offCtx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const src = new Uint8ClampedArray(data);

    // Lightweight 3x3 unsharp mask kernel:
    // center weight: 1 + amount
    // orthogonal neighbors (top, bottom, left, right): -amount / 4
    // sum of weights = 1.0 (brightness preserving)
    const cWeight = 1 + amount;
    const nWeight = amount / 4;

    for (let y = 0; y < h; y++) {
      const y0 = Math.max(0, y - 1) * w;
      const y1 = y * w;
      const y2 = Math.min(h - 1, y + 1) * w;

      for (let x = 0; x < w; x++) {
        const x0 = Math.max(0, x - 1);
        const x1 = x;
        const x2 = Math.min(w - 1, x + 1);

        const iCenter = (y1 + x1) * 4;
        const iTop = (y0 + x1) * 4;
        const iBottom = (y2 + x1) * 4;
        const iLeft = (y1 + x0) * 4;
        const iRight = (y1 + x2) * 4;

        for (let c = 0; c < 3; c++) {
          const val =
            src[iCenter + c] * cWeight -
            (src[iTop + c] +
              src[iBottom + c] +
              src[iLeft + c] +
              src[iRight + c]) *
              nWeight;
          data[iCenter + c] = Math.min(255, Math.max(0, Math.round(val)));
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);
  } catch (err) {
    console.warn('[UnsharpMask] Fallback to raw canvas:', err);
  }

  unsharpMaskCache.set(img, offscreen);
  return offscreen;
}

export const createFixedStepper = (stepMs: number, maxSubSteps = 5) => {
  let lastTime: number | null = null;
  let accumulator = 0;

  const step = (time: number, onStep: (deltaSeconds: number) => void): void => {
    if (lastTime === null) {
      lastTime = time;
      return;
    }

    const frameMs = Math.max(0, Math.min(time - lastTime, stepMs * maxSubSteps));
    lastTime = time;
    accumulator += frameMs;

    let steps = 0;
    while (accumulator >= stepMs && steps < maxSubSteps) {
      onStep(stepMs / 1000);
      accumulator -= stepMs;
      steps += 1;
    }
  };
  return Object.assign(step, {
    reset: () => { lastTime = null; accumulator = 0; },
    alpha: () => accumulator / stepMs,
  });
};

/**
 * A 2D coordinate representing a position in the game world.
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * An entity within the game.
 */
export interface Entity extends Position {
  id: string;
  type: string;
  width: number;
  height: number;
  vx: number;
  vy: number;
  [key: string]: any; // Allow flexible properties
}

/**
 * The current phase of the game.
 */
export type GamePhase =
  | 'START'
  | 'PLAYING'
  | 'PAUSED'
  | 'GAME_OVER'
  | 'VICTORY'
  | 'LEVEL_COMPLETE';

/**
 * The overall state of the game.
 */
export interface GameState {
  status: GamePhase;
  score: number;
  level: number;
  timer?: number;
  moves?: number;
  lives?: number;
  [key: string]: any; // Allow flexible properties
}

/**
 * The music track to be used in the game.
 */
export interface MusicTrack {
  name: string;
  url: string;
  description: string;
}

declare global {
  interface Window {
    PlaygroundSDK: any;
  }
}

/**
 * Configuration for a sprite sheet.
 */
export interface SpriteConfig {
  url: string;
  frameWidth?: number;
  frameHeight?: number;
  frameCount?: number;
}

/**
 * Preloads all assets defined in the manifest.
 * Returns a dictionary of loaded images (keyed by manifest ID) and a loading state.
 *
 * WARNING: Generated sprites already have transparent backgrounds removed server-side.
 * Do not run client-side `ctx.getImageData()` loops to strip backgrounds. If you ever
 * call `ctx.getImageData()`, wrap it in `try / catch` and fall back to raw `ctx.drawImage()`
 * in case an external asset fell back to `no-cors` loading.
 */
export function useAssets(manifest: Record<string, string>) {
  const [assets, setAssets] = useState<Record<string, HTMLImageElement | null>>(
    {},
  );
  const [isReady, setIsReady] = useState(false);

  // Stringify the manifest to prevent infinite re-renders if an inline object is passed
  const manifestStr = JSON.stringify(manifest);

  useEffect(() => {
    const currentManifest = JSON.parse(manifestStr) as Record<string, string>;
    const urls = Object.entries(currentManifest);
    if (urls.length === 0) {
      setIsReady(true);
      return;
    }

    let loadedCount = 0;
    const loadedAssets: Record<string, HTMLImageElement | null> = {};

    urls.forEach(([id, url]) => {
      const img = new Image();
      let retriedWithoutCors = false;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loadedAssets[id] = img; // Keyed by manifest ID for easy lookup
        loadedCount++;
        if (loadedCount === urls.length) {
          setAssets(loadedAssets);
          setIsReady(true);
        }
      };
      img.onerror = () => {
        if (!retriedWithoutCors) {
          retriedWithoutCors = true;
          img.removeAttribute('crossorigin');
          img.src = url;
          return;
        }
        console.warn(`[AssetPreloader] Failed to load asset: ${id} at ${url}`);
        loadedAssets[id] = null;
        loadedCount++;
        if (loadedCount === urls.length) {
          setAssets(loadedAssets);
          setIsReady(true);
        }
      };
      img.src = url;
    });
  }, [manifestStr]);

  return {assets, isReady};
}

/**
 * Safely draws an entire image asset on the canvas. If the asset failed to load,
 * falls back to rendering a primitive geometric shape to prevent crashing.
 *
 * Note: Draws from top-left (consistent with standard Canvas drawImage).
 *
 * WARNING: This draws the WHOLE source image (5-arg drawImage) and does not support
 * frame extraction. For animated spritesheets, use the `html-sprite-renderer` skill
 * (`SpriteRenderer` class) instead.
 */
export function drawAsset(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
  fallbackDraw: (ctx: CanvasRenderingContext2D) => void,
) {
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x, y, w, h);
  } else {
    fallbackDraw(ctx);
  }
}

/**
 * Robust background drawing function.
 * If a background image is provided, it draws it covering the full canvas width and height exactly once (cover scaling).
 * If the image fails to load, it falls back to a solid color.
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  bgImg: HTMLImageElement | null | undefined,
  canvasWidth: number,
  canvasHeight: number,
  fallbackColor = '#222222',
  _camX = 0,
  _camY = 0,
) {
  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    let sx = 0;
    let sy = 0;
    let sw = bgImg.naturalWidth;
    let sh = bgImg.naturalHeight;

    const src = (bgImg.src || '').toLowerCase();
    if (src.includes('space_bg_d')) {
      // space_bg_d: Crop source rectangle strictly from sx = 0.20 * img.width to sw = 0.60 * img.width (20% to 80%) and full height
      sx = 0.20 * bgImg.naturalWidth;
      sy = 0;
      sw = 0.60 * bgImg.naturalWidth;
      sh = bgImg.naturalHeight;
    } else if (src.includes('starport_space_bg')) {
      // starport_space_bg: Crop strictly from top third: sy = 0, sh = img.height * 0.33, sx = 0, sw = img.width
      sx = 0;
      sy = 0;
      sw = bgImg.naturalWidth;
      sh = bgImg.naturalHeight * 0.33;
    } else if (src.includes('room_ship_config_bg')) {
      // room_ship_config_bg: Crop strictly from top 72%: sy = 0, sh = img.height * 0.72, sx = 0, sw = img.width
      sx = 0;
      sy = 0;
      sw = bgImg.naturalWidth;
      sh = bgImg.naturalHeight * 0.72;
    }

    const scale = Math.max(canvasWidth / sw, canvasHeight / sh);
    const drawW = sw * scale;
    const drawH = sh * scale;
    const drawX = (canvasWidth - drawW) / 2;
    const drawY = (canvasHeight - drawH) / 2;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const useSharpen = drawW * dpr > sw || drawH * dpr > sh;
    const sourceImg = useSharpen ? getUnsharpMaskCanvas(bgImg, 0.6) : bgImg;
    ctx.drawImage(sourceImg, sx, sy, sw, sh, drawX, drawY, drawW, drawH);
  } else {
    // Fallback to solid color
    ctx.fillStyle = fallbackColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}

/**
 * Detect mobile/touch devices.
 * Checks user agent, pointer capability, and viewport width.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    const ua =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    const touch =
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;
    const small = window.innerWidth < 768;
    return ua || touch || small;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(
        window.innerWidth < 768 ||
          window.matchMedia('(pointer: coarse)').matches ||
          'ontouchstart' in window ||
          navigator.maxTouchPoints > 0,
      );
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

export interface UnifiedPlayerShipConfig {
  /** Optional cinematic throttle. Undefined preserves normal flight/idle exhaust. */
  engineThrust?: number;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  headingRad: number;
  lengthPx: number;
  engineClass: number;
  isMoving: boolean;
  cargoPodsCount: number;
  shieldsActive: boolean;
  inNebula: boolean;
  bankFactor?: number;
  assets?: Record<string, HTMLImageElement | null>;
  weaponsArmed?: boolean;
  missileClass?: number;
  laserClass?: number;
  armorClass?: number;
  nowSec?: number;
  label?: string;
}

/**
 * Unified player starship renderer across Hyperspace, Star System, Orbit, and Combat.
 * Parameterized with:
 *   ctx, x, y, headingRad, lengthPx, engineClass, isMoving, cargoPodsCount, shieldsActive, inNebula, bankFactor, etc.
 * Supports both single config object and positional arguments.
 */
export function drawUnifiedPlayerShip(
  ctxOrConfig: CanvasRenderingContext2D | UnifiedPlayerShipConfig,
  x?: number,
  y?: number,
  headingRad?: number,
  lengthPx?: number,
  engineClass?: number,
  isMoving?: boolean,
  cargoPodsCount?: number,
  shieldsActive?: boolean,
  inNebula?: boolean,
  bankFactor?: number,
  assets?: Record<string, HTMLImageElement | null>,
  weaponsArmed?: boolean,
  missileClass?: number,
  laserClass?: number,
  armorClass?: number,
  nowSec?: number,
  label?: string,
): void {
  let ctx: CanvasRenderingContext2D;
  let posX: number;
  let posY: number;
  let heading: number;
  let length: number;
  let engClass: number;
  let moving: boolean;
  let podsCount: number;
  let shields: boolean;
  let nebula: boolean;
  let bank: number;
  let assetMap: Record<string, HTMLImageElement | null> | undefined;
  let weapons: boolean;
  let misClass: number;
  let lasClass: number;
  let armClass: number;
  let timeSec: number;
  let shipLabel: string | undefined;
  let thrustLevel:number|undefined;

  if (typeof (ctxOrConfig as any)?.ctx !== 'undefined') {
    const cfg = ctxOrConfig as UnifiedPlayerShipConfig;
    ctx = cfg.ctx;
    posX = cfg.x;
    posY = cfg.y;
    heading = cfg.headingRad;
    length = cfg.lengthPx;
    engClass = cfg.engineClass;
    moving = cfg.isMoving;
    podsCount = cfg.cargoPodsCount;
    shields = cfg.shieldsActive;
    nebula = cfg.inNebula;
    bank = cfg.bankFactor ?? 1.0;
    assetMap = cfg.assets;
    weapons = cfg.weaponsArmed ?? false;
    misClass = cfg.missileClass ?? 0;
    lasClass = cfg.laserClass ?? 0;
    armClass = cfg.armorClass ?? 0;
    timeSec = cfg.nowSec ?? performance.now() / 1000;
    shipLabel = cfg.label;
    thrustLevel=cfg.engineThrust===undefined?undefined:Math.max(0,Math.min(1,cfg.engineThrust));
  } else {
    ctx = ctxOrConfig as CanvasRenderingContext2D;
    posX = x ?? 0;
    posY = y ?? 0;
    heading = headingRad ?? 0;
    length = lengthPx ?? 64;
    engClass = engineClass ?? 1;
    moving = isMoving ?? false;
    podsCount = cargoPodsCount ?? 0;
    shields = shieldsActive ?? false;
    nebula = inNebula ?? false;
    bank = bankFactor ?? 1.0;
    assetMap = assets;
    weapons = weaponsArmed ?? false;
    misClass = missileClass ?? 0;
    lasClass = laserClass ?? 0;
    armClass = armorClass ?? 0;
    timeSec = nowSec ?? performance.now() / 1000;
    shipLabel = label;
  }

  // When zoomed out so far that ship would be < 6 pixels, draw it as a 6-pixel marker with its label
  if (length < 6) {
    ctx.save();
    ctx.translate(posX, posY);
    ctx.rotate(heading);

    // 6-pixel marker pointing forward along heading
    ctx.fillStyle = '#00f0ff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(3, 0);
    ctx.lineTo(-3, -2.5);
    ctx.lineTo(-1.5, 0);
    ctx.lineTo(-3, 2.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Magenta outline tint if in nebula
    if (nebula) {
      ctx.strokeStyle = '#d946ef';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Shield bubble if shields active
    if (shields && !nebula) {
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.88)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Readable vessel label positioned above marker
    if (shipLabel) {
      ctx.save();
      ctx.font = 'bold 10px "Orbitron", "Rajdhani", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(shipLabel, posX, posY - 8);
      ctx.restore();
    }
    return;
  }

  // Preserve hull aspect ratio (original 1087 x 602)
  const shipW = length;
  const shipH = shipW / (1087 / 602);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(posX, posY);
  ctx.rotate(heading);

  if (bank !== 1.0) {
    ctx.scale(1.0, bank);
  }

  // 1. Engine Exhaust Plumes & Idle Glow (proportional to ship length)
  if (engClass > 0 && (thrustLevel===undefined || thrustLevel>0)) {
    const engColors = ['#00f0ff', '#38bdf8', '#06b6d4', '#d946ef', '#facc15'];
    const flameCol = engColors[Math.max(0, Math.min(4, engClass - 1))] || '#00f0ff';
    const baseFlameLen = moving
      ? (shipW * 0.35 + engClass * (shipW * 0.08)) * (0.85 + Math.random() * 0.3)
      : (shipW * 0.12 + engClass * (shipW * 0.03)) * (0.92 + Math.sin(timeSec * 8) * 0.08);

    const flameLen=baseFlameLen*(thrustLevel??1);
    const nozzleH = Math.max(0.3, shipH * 0.08);

    shipExhaustNozzles(shipW).forEach(({x:engX,y:ey}) => {
      const pGrad = ctx.createLinearGradient(engX, ey, engX - flameLen, ey);
      pGrad.addColorStop(0, '#ffffff');
      pGrad.addColorStop(0.25, '#38bdf8');
      pGrad.addColorStop(0.65, flameCol);
      pGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = pGrad;
      ctx.shadowColor = flameCol;
      ctx.shadowBlur = Math.max(0, moving ? Math.min(14, shipW * 0.3) : Math.min(6, shipW * 0.15));
      ctx.beginPath();
      ctx.moveTo(engX, ey - nozzleH);
      ctx.lineTo(engX - flameLen, ey);
      ctx.lineTo(engX, ey + nozzleH);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Small glowing nozzle core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(engX, ey, Math.max(0.3, nozzleH * 0.6), 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Installed hardware remains visible when weapons are stowed.
  if(!drawConfiguredShip(ctx,{cargoPods:podsCount,armorClass:armClass,laserClass:lasClass,missileClass:misClass},-shipW/2,-shipH/2,shipW,shipH)) {
    const hullImg=assetMap?.['ship_hull_bare_topdown_1k']||assetMap?.['ship_hull_bare_topdown'];
    if(hullImg?.complete&&hullImg.naturalWidth>0)ctx.drawImage(hullImg,-shipW/2,-shipH/2,shipW,shipH);else{
      ctx.fillStyle='#dce8e9';ctx.strokeStyle='#334155';ctx.lineWidth=Math.max(.6,shipW*.02);ctx.beginPath();
      ctx.moveTo(shipW*.45,0);ctx.lineTo(-shipW*.45,-shipH*.4);ctx.lineTo(-shipW*.2,0);ctx.lineTo(-shipW*.45,shipH*.4);ctx.closePath();ctx.fill();ctx.stroke();
    }
  }

  // 5. Nebula Outline / Glow Tint inside nebulae (proportional)
  if (nebula) {
    ctx.save();
    ctx.strokeStyle = 'rgba(217, 70, 239, 0.9)';
    ctx.shadowColor = '#d946ef';
    ctx.shadowBlur = Math.max(2, Math.min(10, shipW * 0.15));
    ctx.lineWidth = Math.max(0.6, Math.min(2.5, shipW * 0.035));
    ctx.beginPath();
    ctx.ellipse(0, 0, shipW * 0.52, shipH * 0.52, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // 6. Deflector Shield Bubble (tightly around the hull)
  if (shields && !nebula) {
    const pShieldPulse = Math.sin(timeSec * 5) * (shipW * 0.02);
    const shieldRadius = shipW * 0.53 + pShieldPulse;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.88)';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = Math.max(2, Math.min(10, shipW * 0.18));
    ctx.lineWidth = Math.max(0.6, Math.min(2.5, shipW * 0.035));
    ctx.beginPath();
    ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();

  // 7. Optional Vessel Label (readable size and location)
  if (shipLabel) {
    ctx.save();
    ctx.font = 'bold 10px "Orbitron", "Rajdhani", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(shipLabel, posX, posY - Math.max(10, length * 0.6));
    ctx.restore();
  }
}
