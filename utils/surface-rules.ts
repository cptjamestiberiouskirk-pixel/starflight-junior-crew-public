import type { ArtifactData, LifeformSpecimen, SurfaceRuin } from '../surface';

/** One fixed simulation step. Exact overlap needs a direction, not division by zero. */
export function advanceLifeform(lifeform: LifeformSpecimen, roverX: number, roverY: number, seconds: number, random = Math.random) {
  if (seconds<=0 || lifeform.captured || lifeform.dead || lifeform.stunned) return false;
  lifeform.attackCooldown=Math.max(0,(lifeform.attackCooldown??0)-seconds);
  const dx = roverX - lifeform.x, dy = roverY - lifeform.y;
  const distance = Math.hypot(dx,dy);
  const ux = distance > 1e-9 ? dx/distance : 1;
  const uy = distance > 1e-9 ? dy/distance : 0;
  if(Math.hypot(lifeform.vx||0,lifeform.vy||0)>.01)lifeform.heading=Math.atan2(lifeform.vy,lifeform.vx);
  if (lifeform.temperament === 'aggressive' && distance <= 6) {
    if (distance <= 0.6) {
      lifeform.vx=0;lifeform.vy=0;
      if(lifeform.attackCooldown<=0) {
        if(distance<1e-9) lifeform.x+=0.001;
        lifeform.attackCooldown=0.5;
        return true;
      }
    } else {
      const step=Math.min(Math.max(0,distance-0.5),1.4*seconds);
      lifeform.vx=ux*step/seconds;lifeform.vy=uy*step/seconds;
      lifeform.x += ux*step;
      lifeform.y += uy*step;
    }
  } else if (lifeform.temperament === 'fleeing' && distance <= 4) {
    lifeform.vx=-ux*1.6;lifeform.vy=-uy*1.6;
    lifeform.x -= ux * 1.6 * seconds;
    lifeform.y -= uy * 1.6 * seconds;
  } else {
    if (random() < 0.05) {
      const angle = random() * Math.PI * 2;
      lifeform.vx = Math.cos(angle) * 0.4;
      lifeform.vy = Math.sin(angle) * 0.4;
    }
    lifeform.x += (lifeform.vx || 0) * seconds;
    lifeform.y += (lifeform.vy || 0) * seconds;
  }
  if(Math.hypot(lifeform.vx||0,lifeform.vy||0)>.01)lifeform.heading=Math.atan2(lifeform.vy,lifeform.vx);
  return false;
}

export function stunnerTarget(lifeforms: LifeformSpecimen[], x: number, y: number, range = 6) {
  return lifeforms.filter(lf => !lf.captured && !lf.dead && !lf.stunned && Math.hypot(lf.x-x,lf.y-y) <= range)
    .sort((a,b) => Math.hypot(a.x-x,a.y-y) - Math.hypot(b.x-x,b.y-y))[0] ?? null;
}

export function mineableVolume(deposit: number, freeSpace: number) {
  return Math.max(0, Math.min(deposit, 2.5, Math.floor((Math.max(0,freeSpace)+1e-9)*10)/10));
}

/** Explored legacy ruins already yielded their relic; new full-hold visits can retry. */
export function recoverRuinArtifact(ruin: SurfaceRuin, artifact: ArtifactData | undefined, freeSpace: number) {
  const alreadyRecovered = ruin.artifactRecovered ?? ruin.explored;
  ruin.explored = true;
  ruin.artifactRecovered = alreadyRecovered;
  if (!artifact || alreadyRecovered || artifact.volume > freeSpace + 1e-9) return false;
  ruin.artifactRecovered = true;
  return true;
}

export function recoveredCargo<T extends {name:string;isArmed?:boolean}>(cargo:T):T {
  return {...cargo, name:cargo.name.replace(/\s*\[ARMED\]/gi,''), isArmed:false};
}

export function landingRequirements(gravity:number,fuel:number) {
  const gHundredths=Math.round(gravity*100);
  const effectiveGHundredths=gHundredths>800 ? 800+Math.floor(10*Math.sqrt(gHundredths-800)) : gHundredths;
  const fuelTenths=Math.floor(effectiveGHundredths/40);
  const fuelBurn=fuelTenths/10;
  return {gravity,gHundredths,effectiveGHundredths,fuelTenths,fuelBurn,isInsufficient:fuel+1e-9<fuelBurn,isCrush:gHundredths>=800};
}
