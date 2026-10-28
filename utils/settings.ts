export type GraphicsQuality = 'Low' | 'Medium' | 'High';
export interface GameSettings {
  banterEnabled:boolean;
  textSpeed:'Slow' | 'Normal' | 'Fast' | 'Instant';
  musicVolume:number;
  soundVolume:number;
  voicesVolume:number;
  alienVoiceEffects:boolean;
  graphicsQuality:GraphicsQuality;
  crtFilter:boolean;
  screenShake:boolean;
}

export const DEFAULT_GAME_SETTINGS:Readonly<GameSettings> = {
  banterEnabled:true,textSpeed:'Normal',musicVolume:0.45,soundVolume:0.6,voicesVolume:0.8,
  alienVoiceEffects:true,graphicsQuality:'High',crtFilter:false,screenShake:true,
};

/** Missing fields in older saves must not inherit another mission's settings. */
export function restoreSettings(saved:Partial<GameSettings> | undefined):GameSettings {
  return {...DEFAULT_GAME_SETTINGS,...Object.fromEntries(Object.entries(saved ?? {}).filter(([,value])=>value!==undefined))};
}

/** Quality affects raster cost, never CSS geometry or simulation time. */
export function scenePixelRatio(quality:GraphicsQuality,deviceRatio:number) {
  const native=Number.isFinite(deviceRatio) && deviceRatio>0 ? Math.max(1,deviceRatio) : 1;
  return quality==='Low' ? 0.75 : quality==='Medium' ? 1 : Math.min(2,native);
}
