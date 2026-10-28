import type {MusicTheme} from '../music';

/** Scene decisions shared by the score controller and its regression checks. */
export function selectMusicTheme(scene:{location:string;title?:boolean;inCombat?:boolean;victory?:boolean;defeat?:boolean}):MusicTheme {
  if(scene.title)return 'starport';
  if(scene.defeat)return 'solemn';
  if(scene.victory)return 'starport';
  if(scene.location==='Encounter')return scene.inCombat?'combat':'space';
  if(['Landing','On Planet','Terrain Vehicle'].includes(scene.location))return 'surface';
  if(['Starport','Docking Bay'].includes(scene.location))return 'starport';
  return 'space';
}

export function scoreGain(volume:number,voiceAudible:boolean) {
  const level=Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):0;
  return level*(voiceAudible ? .28 : 1);
}
