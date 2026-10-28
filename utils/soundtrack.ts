import type {MusicTheme} from '../music';

/** Retro electronic replacement requested on 2026-10-22; source download is retained. */
export const explorationScore = {
  url: new URL('../assets/music/neon-starfield-voyage.m4a', import.meta.url).href,
  loopRegion: {startSec: 12.5, endSec: 345, crossfadeSec: 2.5},
} as const;

/** The retro electronic recording covers the title, port and normal exploration. */
export function recordedScoreForTheme(theme: MusicTheme, scene:{victory?:boolean}={}) {
  if(scene.victory)return undefined;
  return theme === 'space' || theme === 'surface' || theme === 'starport' ? explorationScore : undefined;
}
