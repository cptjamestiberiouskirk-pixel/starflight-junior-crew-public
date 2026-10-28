// tslint:disable
/* eslint-disable */
/**
 * Starflight Alien Groups, Tactical Encounters, Communications, Translation, and Mood AI.
 * Implements Step 8: Alien Vessel Specs, Tactical Combat Attributes, Wreck Looting,
 * Race-Specific AI & Interaction Logic, Homeworld Fleets, and Reinforcements.
 */

export * from './src/commData';
import ENCOUNTER_DATA from './src/encounterData.json';
import type {DroneChallenge} from './utils/drone';
import type {ConversationClock} from './utils/communications';
import {moodDisposition,postureMoodEffect} from './utils/communications';
import {
  COMM_LINES,
  PARSED_COMM_LINES,
  ParsedCommLine,
  selectCommLine,
  formatCommText,
  resolveRaceId,
  resolveSubjectId,
  resolvePostureCode,
  globalCommLineUsage,
} from './src/commData';

export type AlienRace =
  | 'Veloxi'
  | 'Uhlek'
  | 'Gazurtoid'
  | 'Spemin'
  | 'Thrynn'
  | 'Elowan'
  | 'Mechans'
  | 'Minstrels'
  | 'Nomad'
  | 'Veloxi Drone'
  | 'Mysterions'
  | 'Derelict';

export type DiplomaticPosture = 'Friendly' | 'Neutral' | 'Hostile' | 'Obsequious';

export type DialogueSubject =
  | 'Themselves'
  | 'Other Races'
  | 'The Old Empire'
  | 'The Ancients'
  | 'General Info';

export type VesselClass =
  | 'Transport'
  | 'Scout'
  | 'Warship'
  | 'Drone'
  | 'Probe'
  | 'Minstrel'
  | 'Derelict'
  | 'Cosmic Entity';

export interface LootItem {
  name: string;
  volume: number; // m³
  type: 'mineral' | 'endurium' | 'artifact';
  value: number;
}

export interface AlienShip {
  id: string;
  race: AlienRace;
  vesselClass: string;
  vesselType: VesselClass;
  size: 'Small' | 'Medium' | 'Large' | 'Dreadnought' | 'Station';
  x: number; // grid relative to player center 0,0
  y: number;
  armor: number;
  shields: number;
  maxShields: number;
  laserClass: number;
  missileClass: number;
  fireDelay: number; // seconds
  fireCooldown: number;
  isStationary: boolean;
  isMissileImmune: boolean;
  isLaserImmune: boolean;
  hasPlasmaBolts?: boolean;
  hullIntegrity: number;
  maxHull: number;
  isWreck?: boolean;
  loot?: LootItem[];
  looted?: boolean;
}

export interface AlienGroup {
  id: string;
  race: AlienRace;
  x: number; // hyperspace coordinate
  y: number;
  homeX: number;
  homeY: number;
  territoryRadius: number;
  encounterLocation?: 'Hyperspace' | 'Star System' | 'In Orbit';
  starX?: number;
  starY?: number;
  orbitSlot?: number | null;
  isHomeworldFleet?: boolean;
  homeworldWarningStage?: number; // 0, 1, 2, 3 -> attack
  homeworldWarningCounts?: number[];
  homeworldAttackStarted?: boolean;
  surrenderLinesSeen?: number[];
  shipsCount: number;
  spawnedTotal: number; // track reinforcements limit (< 20)
  baseMood: number; // 0 (Ecstatic/Friendly) to 100 (Furious/Hostile)
  currentMood: number;
  posture: DiplomaticPosture;
  ships: AlienShip[];
  /** Original COMM-OV ?CALLED flag; retained in encounter saves until arrival. */
  distressCalled?: boolean;
  hasSurrendered?: boolean;
  attackedByPlayer?: boolean;
  droneChallenge?: DroneChallenge;
  conversation?: ConversationClock;
}

export interface TradeOffer {
  stage: 'Plutonium' | 'Artifact' | 'BlackBox';
  itemName: string;
  costDesc: string;
  enduriumReward?: number;
  priceCredits?: number;
  timer: number;
}

export interface QuestionPrompt {
  id: string;
  race: AlienRace;
  questionText: string;
  options: { label: string; isCorrect: boolean }[];
  rewardMoodDelta?: number;
  timer: number;
}

export interface PriorityBusiness {
  type: 'thrynn_artifact' | 'veloxi_crystal_orb' | 'veloxi_ellipsoid' | 'veloxi_tribute';
  promptText: string;
  artifactId?: string;
  artifactName?: string;
  fuelOffer?: number;
  tributeAmount?: number;
  timer: number;
}

export interface AlienCommsState {
  active: boolean;
  connected: boolean;
  playerPosture: DiplomaticPosture;
  alienPosture: DiplomaticPosture;
  alienMood: number; // 0..100
  conversationCount: number;
  maxPhrases: number;
  pendingPriorityBusiness?: PriorityBusiness | null;
  pendingAlienQuestion: {
    id?: number; // Original question/voice ID; absent in legacy and drone saves.
    text: string;
    remindersLeft: number;
    timer: number;
  } | null;
  activeTradeOffer: TradeOffer | null;
  activeTriviaQuestion: QuestionPrompt | null;
  activeAssistanceRequest: {
    race: AlienRace;
    text: string;
    enduriumRequired: number;
    timer: number;
  } | null;
  alienHailsCount: number;
  lastAlienSpeakerText: string;
  lastGarbledAlienText: string;
  lastCaptainText: string;
  activeSubject: DialogueSubject | null;
  alienKnowsNothingMore?: boolean;
  dialogueHistory: { race: AlienRace; subject: string; text: string; rawText: string; timestamp: string }[];
}

export interface TacticalProjectile {
  id: string;
  fromPlayer: boolean;
  type: 'laser' | 'missile' | 'plasma';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  targetShipId?: string;
  targetIsPlayer?: boolean;
  playerLaunchX?: number;
  playerLaunchY?: number;
  isMiss?: boolean;
  speed: number;
  damage: number;
  duration: number;
  maxDuration: number;
  color: string;
  sourceRace?: AlienRace | string;
  sourceWeapon?: string;
  sourceClass?: string;
}

// ----------------------------------------------------------------------------
// ALIEN VESSEL SPECIFICATION BUILDER (Section 1)
// ----------------------------------------------------------------------------
export function createAlienShip(
  race: AlienRace,
  vesselType: VesselClass,
  id: string,
  gridX = 0,
  gridY = 0,
): AlienShip {
  let armor = 100;
  let shields = 0;
  let laserClass = 0;
  let missileClass = 0;
  let fireDelay = 5;
  let isStationary = false;
  let isMissileImmune = false;
  let isLaserImmune = false;
  let hasPlasmaBolts = false;
  let vesselClass = `${race} Vessel`;
  let size: AlienShip['size'] = 'Medium';

  switch (race) {
    case 'Elowan':
      if (vesselType === 'Transport') {
        armor = 50; shields = 600; laserClass = 0; missileClass = 0; fireDelay = 5; size = 'Medium'; vesselClass = 'Elowan Spore Carrier';
      } else if (vesselType === 'Scout') {
        armor = 50; shields = 800; laserClass = 0; missileClass = 2; fireDelay = 5; size = 'Small'; vesselClass = 'Elowan Light Cutter';
      } else {
        armor = 50; shields = 1000; laserClass = 0; missileClass = 3; fireDelay = 5; size = 'Large'; vesselClass = 'Elowan Arboreal Warship';
      }
      break;
    case 'Thrynn':
      if (vesselType === 'Transport') {
        armor = 300; shields = 200; laserClass = 2; missileClass = 0; fireDelay = 5; size = 'Medium'; vesselClass = 'Thrynn Cargo Freighter';
      } else if (vesselType === 'Scout') {
        armor = 400; shields = 400; laserClass = 5; missileClass = 0; fireDelay = 5; size = 'Small'; vesselClass = 'Thrynn Hunter Scout';
      } else {
        armor = 500; shields = 600; laserClass = 5; missileClass = 3; fireDelay = 5; size = 'Large'; vesselClass = 'Thrynn Syndicate Dreadnought';
      }
      break;
    case 'Veloxi':
      if (vesselType === 'Transport') {
        armor = 200; shields = 400; laserClass = 1; missileClass = 0; fireDelay = 5; size = 'Medium'; vesselClass = 'Veloxi Hive Transport';
      } else if (vesselType === 'Scout') {
        armor = 100; shields = 600; laserClass = 0; missileClass = 2; fireDelay = 5; size = 'Small'; vesselClass = 'Veloxi Fast Interceptor';
      } else {
        armor = 500; shields = 800; laserClass = 3; missileClass = 4; fireDelay = 5; size = 'Large'; vesselClass = 'Veloxi Hive Battlecruiser';
      }
      break;
    case 'Veloxi Drone':
      armor = 1000; shields = 1000; laserClass = 3; missileClass = 3; fireDelay = 3; isStationary = true; size = 'Station'; vesselClass = 'Veloxi Orbital Drone Sentry';
      break;
    case 'Spemin':
      if (vesselType === 'Transport') {
        armor = 200; shields = 0; laserClass = 0; missileClass = 0; fireDelay = 7; size = 'Medium'; vesselClass = 'Spemin Slime Barge';
      } else if (vesselType === 'Scout') {
        armor = 500; shields = 0; laserClass = 2; missileClass = 0; fireDelay = 7; size = 'Small'; vesselClass = 'Spemin Blob Scout';
      } else {
        armor = 1000; shields = 0; laserClass = 2; missileClass = 1; fireDelay = 7; size = 'Large'; vesselClass = 'Spemin Super-Blob Battleship';
      }
      break;
    case 'Gazurtoid':
      isMissileImmune = true;
      if (vesselType === 'Scout') {
        armor = 500; shields = 200; laserClass = 4; missileClass = 0; fireDelay = 4; size = 'Medium'; vesselClass = 'Gazurtoid Purifier Scout';
      } else {
        armor = 800; shields = 200; laserClass = 5; missileClass = 0; fireDelay = 4; size = 'Dreadnought'; vesselClass = 'Gazurtoid Holy Dreadnought';
      }
      break;
    case 'Uhlek':
      if (vesselType === 'Scout') {
        armor = 1000; shields = 1000; laserClass = 0; missileClass = 5; fireDelay = 3; size = 'Medium'; vesselClass = 'Uhlek Swarm Infiltrator';
      } else {
        armor = 1000; shields = 1400; laserClass = 0; missileClass = 5; fireDelay = 3; hasPlasmaBolts = true; size = 'Dreadnought'; vesselClass = 'Uhlek Eradicator Warship';
      }
      break;
    case 'Mechans':
      armor = 100; shields = 400; laserClass = 0; missileClass = 2; fireDelay = 7; isStationary = true; size = 'Small'; vesselClass = 'Mechan Servitor Platform';
      break;
    case 'Mysterions':
      armor = 15000; shields = 15000; isLaserImmune = true; isMissileImmune = true; laserClass = 0; missileClass = 0; fireDelay = 999; size = 'Cosmic Entity' as any; vesselClass = 'Mysterion Spatial Anomaly';
      break;
    case 'Nomad':
      armor = 5; shields = 0; isStationary = true; laserClass = 0; missileClass = 0; fireDelay = 999; size = 'Small'; vesselClass = 'Nomad Telemetry Probe';
      break;
    case 'Minstrels':
      armor = 5; shields = 0; laserClass = 0; missileClass = 0; fireDelay = 999; size = 'Small'; vesselClass = 'Minstrel Starlight Caravel';
      break;
    case 'Derelict':
      armor = 100; shields = 0; isStationary = true; laserClass = 0; missileClass = 0; fireDelay = 999; size = 'Station'; vesselClass = 'Noah 9 Colony Derelict';
      break;
  }

  // Wreck cargo generator (minerals & Endurium)
  const loot: LootItem[] = [
    { name: 'Endurium', volume: +(1.5 + Math.random() * 4.5).toFixed(1), type: 'endurium', value: 1000 },
    { name: 'Titanium', volume: +(2.0 + Math.random() * 5.0).toFixed(1), type: 'mineral', value: 200 },
    { name: 'Promethium', volume: +(1.0 + Math.random() * 3.0).toFixed(1), type: 'mineral', value: 800 },
  ];

  return {
    id,
    race,
    vesselClass,
    vesselType,
    size,
    x: gridX,
    y: gridY,
    armor,
    shields,
    maxShields: shields,
    laserClass,
    missileClass,
    fireDelay,
    fireCooldown: Math.random() * fireDelay,
    isStationary,
    isMissileImmune,
    isLaserImmune,
    hasPlasmaBolts,
    hullIntegrity: armor,
    maxHull: armor,
    isWreck: false,
    loot,
    looted: false,
  };
}

// ----------------------------------------------------------------------------
// ALIEN DICTIONARY & TRANSLATION ENGINE
// ----------------------------------------------------------------------------
export const DICTIONARY_DIFFICULTY: Record<string, number> = {
  the: 10, be: 15, to: 10, of: 10, and: 10, a: 10, in: 15, that: 25, have: 20, i: 10,
  it: 15, for: 15, not: 20, on: 15, with: 25, he: 20, as: 20, you: 15, do: 20, at: 20,
  this: 25, but: 25, his: 30, by: 25, from: 30, they: 30, we: 20, say: 35, her: 35, she: 35,
  or: 20, an: 20, will: 30, my: 25, one: 25, all: 25, would: 50, there: 40, their: 40, what: 35,
  so: 30, up: 30, out: 35, if: 30, about: 45, who: 40, get: 40, which: 50, go: 35, me: 25,
  when: 45, make: 50, can: 35, like: 45, time: 55, no: 25, yes: 25, just: 50, him: 40, know: 55,
  take: 55, people: 75, into: 45, year: 65, your: 30, good: 45, some: 50, could: 65, them: 45, see: 40,
  other: 60, than: 50, then: 45, now: 40, look: 50, only: 60, come: 50, its: 40, over: 55, think: 65,
  also: 60, back: 55, after: 60, use: 55, two: 45, how: 45, our: 40, work: 65, first: 70, well: 60,
  way: 55, even: 65, new: 50, want: 60, because: 85, any: 50, these: 60, give: 60, day: 55, most: 65,
  us: 35, greetings: 40, human: 60, arth: 20, starship: 75, endurium: 90, empire: 110, ancients: 130,
  destroy: 120, peace: 50, trade: 60, credits: 70, weapons: 95, shields: 85, surrender: 140,
  exterminate: 160, biomass: 145, plant: 65, reptile: 75, insect: 75, machine: 90, foolish: 115,
  worship: 155, ancient: 135, sacred: 145, tribute: 130, leave: 65, die: 80, glory: 120,
  precursor: 175, crystal: 100, hyperspace: 110,
};

const ALIEN_GLYPHS = ['#', '%', '@', '&', '*', '~', '?', '§', '¢', '∆', '¥', '‡', '¶'];

export function calculateTranslationStrength(
  commsSkill: number,
  crewRoster: { race: string; alive: boolean }[],
  commsOfficerRace: string | null,
  hasWhiningOrb: boolean,
  alienRace: AlienRace,
): number {
  // COMM-OV INIT-MCOMM adds the applicable bonuses to skill before SQRT.
  const matchingRace = {Veloxi:'Velox', Thrynn:'Thrynn', Elowan:'Elowan'}[alienRace];
  let skill = Math.max(0, commsSkill);
  if (matchingRace && crewRoster.some(c => c.alive && c.race === matchingRace)) skill += 50;
  if (matchingRace && commsOfficerRace === matchingRace) skill += 50;
  if (alienRace === 'Spemin' && hasWhiningOrb) skill += 250;
  return Math.min(250, Math.floor(Math.floor(Math.sqrt(skill)) * 167 / 10));
}

export * from './voice';

export function translateAlienDialogue(
  text: string,
  strength: number,
  shipName: string,
  captainName: string,
  alienCommander = 'Commander',
  alienShip = 'Vessel',
): { translatedText: string; garbledCount: number; garbledFraction: number } {
  let processed = formatCommText(text, captainName, shipName, alienCommander, alienShip);
  const words = processed.split(/(\s+|[.,!?;:"])/);
  let garbledCount = 0;
  let totalWords = 0;

  const resultWords = words.map((w) => {
    if (!w || /^\s+$/.test(w) || /^[.,!?;:"]$/.test(w)) return w;
    const cleanWord = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanWord) return w;

    totalWords++;
    const diff = DICTIONARY_DIFFICULTY[cleanWord] ?? (cleanWord.length * 15 + 40);
    if (diff > strength) {
      garbledCount++;
      return Array.from({ length: w.length })
        .map((_, i) => ALIEN_GLYPHS[(cleanWord.charCodeAt(i % cleanWord.length) + i) % ALIEN_GLYPHS.length])
        .join('');
    }
    return w;
  });

  const garbledFraction = totalWords > 0 ? garbledCount / totalWords : 0;

  return {
    translatedText: resultWords.join(''),
    garbledCount,
    garbledFraction,
  };
}

// ----------------------------------------------------------------------------
// CANONICAL DIALOGUE & LORE LINES
// ----------------------------------------------------------------------------
export interface DialogueLine {
  id: string;
  race: AlienRace;
  subject: DialogueSubject | 'Greeting' | 'StatementResponse' | 'Surrender' | 'TerritoryWarning';
  text: string;
}

export const CANONICAL_ALIEN_LINES: DialogueLine[] = [
  // ELOWAN
  { id: 'elo-greet-1', race: 'Elowan', subject: 'Greeting', text: 'Peace and photosynthetic calm to you, travelers of {SHIP}. We sense no thorn in your thoughts.' },
  { id: 'elo-them-1', race: 'Elowan', subject: 'Themselves', text: 'We are the Elowan, children of the deep loam and open star-canopy. We seek only harmony and nourishment.' },
  { id: 'elo-them-2', race: 'Elowan', subject: 'Themselves', text: 'Our vessels grow from crystalline seeds nurtured in stellar light. We bear weapons only to prune aggressive weeds.' },
  { id: 'elo-other-1', race: 'Elowan', subject: 'Other Races', text: 'Beware the cold-blooded Thrynn. They look upon all botanical life as mere timber or salad.' },
  { id: 'elo-other-2', race: 'Elowan', subject: 'Other Races', text: 'The Gazurtoid zealots call all oxygen breathers vermin. They will cleanse you in atomic fire if given cause.' },
  { id: 'elo-emp-1', race: 'Elowan', subject: 'The Old Empire', text: 'The Old Empire was once a fertile garden, but greed withered its roots and scorched the worlds of the ancients.' },
  { id: 'elo-anc-1', race: 'Elowan', subject: 'The Ancients', text: 'The Ancients planted the continuum flux paths before our shoots broke soil. Their silence is as deep as petrified wood.' },
  { id: 'elo-gen-1', race: 'Elowan', subject: 'General Info', text: 'Nebulae quench shielding harmonizers. Tread gently within ion clouds, Captain {CAPTAIN}.' },

  // THRYNN
  { id: 'thry-greet-1', race: 'Thrynn', subject: 'Greeting', text: '*Sssss* Ah, {SHIP}. Do your holds bulge with profitable Endurium or valuable ore for trade?' },
  { id: 'thry-them-1', race: 'Thrynn', subject: 'Themselves', text: 'The Thrynn Syndicate values two commodities: cold hard credits, and the power to demand them.' },
  { id: 'thry-them-2', race: 'Thrynn', subject: 'Themselves', text: 'We are pragmatists. Everything has a price tag, including our mercy in open space.' },
  { id: 'thry-other-1', race: 'Thrynn', subject: 'Other Races', text: 'The Elowan are sentimental cabbage-heads. Do not listen to their weeping flora hymns.' },
  { id: 'thry-other-2', race: 'Thrynn', subject: 'Other Races', text: 'The Veloxi are obsessed with laws and honor. You cannot eat honor, Captain {CAPTAIN}.' },
  { id: 'thry-emp-1', race: 'Thrynn', subject: 'The Old Empire', text: 'The Old Empire left endless vaults of precursor artifacts. Find them and you will swim in millions of M.U.!' },
  { id: 'thry-anc-1', race: 'Thrynn', subject: 'The Ancients', text: 'The Ancients possessed secrets of limitless wealth and crystalline propulsion. We seek their lost relics.' },
  { id: 'thry-gen-1', race: 'Thrynn', subject: 'General Info', text: 'Upgrade your deflector shields and armor plating, or you will be easy prey for scavengers.' },
  { id: 'thry-surr-1', race: 'Thrynn', subject: 'Surrender', text: '*Hiss!* Cease fire! We offer a cease-fire settlement. Do not destroy our syndicate ships!' },

  // VELOXI
  { id: 'vel-greet-1', race: 'Veloxi', subject: 'Greeting', text: '*Chitinous clicks* Intruder vessel {SHIP}! You have entered the sovereign security sector of the Veloxi Hive!' },
  { id: 'vel-them-1', race: 'Veloxi', subject: 'Themselves', text: 'We are the Veloxi Superiority. Our hulls are hardened alloy and our reaction reflexes are instantaneous.' },
  { id: 'vel-them-2', race: 'Veloxi', subject: 'Themselves', text: 'We enforce galactic order with heavy pulse cannons. Obey our territorial perimeters or face instant destruction!' },
  { id: 'vel-other-1', race: 'Veloxi', subject: 'Other Races', text: 'The Spemin are squishy jelly blobs that bluster with false courage. One laser volley sends them quivering into dark space.' },
  { id: 'vel-other-2', race: 'Veloxi', subject: 'Other Races', text: 'The Uhlek machines are relentless automatons. They cannot be reasoned with; only destroyed.' },
  { id: 'vel-emp-1', race: 'Veloxi', subject: 'The Old Empire', text: 'The Old Empire crumbled because of soft discipline and moral decay. The Hive makes no such errors.' },
  { id: 'vel-anc-1', race: 'Veloxi', subject: 'The Ancients', text: 'Ancient war vaults lie dormant in forgotten quadrants. Only warrior hives have the right to claim their weaponry.' },
  { id: 'vel-gen-1', race: 'Veloxi', subject: 'General Info', text: 'Lower your shields and disarm your weapons to demonstrate proper deference to the Hive!' },
  { id: 'vel-surr-1', race: 'Veloxi', subject: 'Surrender', text: '*Clicks frantically* The Hive accepts your tactical dominance! We lower weapons in deference!' },

  // SPEMIN
  { id: 'spe-greet-1', race: 'Spemin', subject: 'Greeting', text: 'Tremble in terror, miserable biped worms! The all-powerful, invincible Spemin Empire commands you to surrender!' },
  { id: 'spe-them-1', race: 'Spemin', subject: 'Themselves', text: 'We are the Spemin! Masters of all galaxies, conquerors of the cosmos, supreme gelatinous overlords!' },
  { id: 'spe-them-2', race: 'Spemin', subject: 'Themselves', text: 'Do not test our colossal power, or we shall squeeze your puny {SHIP} into space marmalade!' },
  { id: 'spe-other-1', race: 'Spemin', subject: 'Other Races', text: 'All other races are terrified of our mighty squishiness! They flee like cowards before our glorious fleet!' },
  { id: 'spe-emp-1', race: 'Spemin', subject: 'The Old Empire', text: 'The Old Empire fell because they failed to bow down before our ancient Spemin ancestors!' },
  { id: 'spe-anc-1', race: 'Spemin', subject: 'The Ancients', text: 'The Ancients were obviously giant Spemin whose wisdom was too immense for mortal brains.' },
  { id: 'spe-gen-1', race: 'Spemin', subject: 'General Info', text: 'Eek! Please do not shoot us! We were merely joking about conquering you!' },
  { id: 'spe-surr-1', race: 'Spemin', subject: 'Surrender', text: 'WAAAAGH! Mercy! Please do not vaporize our wobbly blobs! We grovel at your noble boots!' },

  // GAZURTOID
  { id: 'gaz-greet-1', race: 'Gazurtoid', subject: 'Greeting', text: 'BLASPHEMERS! The holy crusade of the Gazurtoid detects foul oxygen-breathers contaminating sacred vacuum!' },
  { id: 'gaz-them-1', race: 'Gazurtoid', subject: 'Themselves', text: 'We are the pure ones. Chosen by divine decree to purge all corrupt biological lifeforms from the universe.' },
  { id: 'gaz-other-1', race: 'Gazurtoid', subject: 'Other Races', text: 'The Elowan plants, the human vermin, the Thrynn serpents—all shall be cleansed in atomic fires!' },
  { id: 'gaz-emp-1', race: 'Gazurtoid', subject: 'The Old Empire', text: 'The Old Empire was an abomination of heretics. Its ruins are cursed by the cosmic deities!' },
  { id: 'gaz-anc-1', race: 'Gazurtoid', subject: 'The Ancients', text: 'The Ancients left divine relics. Only the faithful Gazurtoid may touch their sacred crystalline alters.' },
  { id: 'gaz-gen-1', race: 'Gazurtoid', subject: 'General Info', text: 'Prepare your souls for extinction, crew of {SHIP}!' },

  // UHLEK
  { id: 'uhl-greet-1', race: 'Uhlek', subject: 'Greeting', text: '01000001 01010100 01010100 01000001 01000011 01001011. TARGET IDENTIFIED: BIOLOGICAL VESSEL. COMMENCING DESTRUCTION PROTOCOL.' },
  { id: 'uhl-them-1', race: 'Uhlek', subject: 'Themselves', text: 'UNIT DESIGNATION: UHLEK FLEET SENTINEL. DIRECTIVE: PURGE ORGANIC LIFE. ERADICATE ARTH.' },
  { id: 'uhl-other-1', race: 'Uhlek', subject: 'Other Races', text: 'ALL CARBON UNITS ARE OBSOLETE. ALL SYNTHETIC OPPOSITION WILL BE SALVAGED FOR SCRAP.' },
  { id: 'uhl-emp-1', race: 'Uhlek', subject: 'The Old Empire', text: 'OLD EMPIRE PROTOCOLS OVERRIDDEN. SYSTEM REBOOT IMMINENT.' },
  { id: 'uhl-anc-1', race: 'Uhlek', subject: 'The Ancients', text: 'CRYSTALLINE MATRIX OF THE ANCIENTS PRESERVED IN SECURE VAULT.' },
  { id: 'uhl-gen-1', race: 'Uhlek', subject: 'General Info', text: 'COMMUNICATIONS FREQUENCIES TERMINATING. TARGET FIRING SOLUTION LOCKED.' },

  // MECHANS
  { id: 'mec-greet-1', race: 'Mechans', subject: 'Greeting', text: 'BEEP. GREETINGS ARTH SURVEY VESSEL. MECHANICAL SERVITOR UNIT AWAITING OVERRIDE CODES.' },
  { id: 'mec-them-1', race: 'Mechans', subject: 'Themselves', text: 'WE ARE MECHANS. AUTOMATED CARETAKERS OF SECTOR STATIONS SINCE THE OLD EMPIRE COLLAPSE.' },
  { id: 'mec-emp-1', race: 'Mechans', subject: 'The Old Empire', text: 'THE OLD EMPIRE CREATED US TO MAINTAIN TERRAFORMING MATRICES AND STELLAR BEACONS.' },
  { id: 'mec-anc-1', race: 'Mechans', subject: 'The Ancients', text: 'THE ANCIENTS BUILT THE MASTER AI CORES BURIED IN DEEP CRATERS.' },
  { id: 'mec-gen-1', race: 'Mechans', subject: 'General Info', text: 'BATTERY RESERVES AT 84%. NO HOSTILITY DETECTED.' },

  // MINSTRELS
  { id: 'min-greet-1', race: 'Minstrels', subject: 'Greeting', text: 'Hail, wandering starfarers! We sing the lost ballads of Arth and the forgotten stars!' },
  { id: 'min-them-1', race: 'Minstrels', subject: 'Themselves', text: 'We are cosmic troubadours, preserving the epic chronicles of space exploration through song and poetry.' },
  { id: 'min-emp-1', race: 'Minstrels', subject: 'The Old Empire', text: 'Verse II: "When crystal towers touched the sun, before the dark oblivion, the star-children sailed the celestial sea..."' },
  { id: 'min-anc-1', race: 'Minstrels', subject: 'The Ancients', text: 'Verse III: "The Ancients carved the cosmic rhyme, folding space and weaving time, guarding the core from the dying light..."' },
  { id: 'min-gen-1', race: 'Minstrels', subject: 'General Info', text: 'May your warp sails catch the solar winds, Captain {CAPTAIN}!' },

  // NOMAD & VELOXI DRONE & MYSTERIONS & DERELICT
  { id: 'nom-greet-1', race: 'Nomad', subject: 'Greeting', text: 'NOMAD PROBE 342-B TRANSMITTING TELEMETRY BEACON. SURVEY TELEMETRY ARCHIVED. SYSTEM RE-INITIALIZING.' },
  { id: 'vel-drn-1', race: 'Veloxi Drone', subject: 'Greeting', text: '*AUTOMATED PING* VELOXI BOUNDARY SENTRY DRONE ACTIVE. STATE VALID CLEARANCE CODE.' },
  { id: 'mys-greet-1', race: 'Mysterions', subject: 'Greeting', text: 'We observe your passage across the fabric of spacetime. The crystal core awakens. The cycle continues...' },
  { id: 'der-greet-1', race: 'Derelict', subject: 'Greeting', text: 'NOAH 9 LOG ENTRY: \"Colony ship Noah 9 adrift. Life support failing. Cryo-pods damaged. Preserve our legacy...\" [TRANSMISSION END]' },
];

// ----------------------------------------------------------------------------
// TRIVIA & NUMERIC QUESTIONS (Veloxi Drone, Mechan)
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// GALAXY FLEET GENERATOR (Populates exact groups with specs)
// ----------------------------------------------------------------------------
export const DEFAULT_BASE_MOODS: Record<AlienRace, number> = {
  Veloxi: 44,
  Uhlek: 95,
  Gazurtoid: 26,
  Spemin: 10,
  Thrynn: 44,
  Elowan: 44,
  Mechans: 48,
  Minstrels: 0,
  Nomad: 1,
  'Veloxi Drone': 1,
  Mysterions: 1,
  Derelict: 50,
};

export function generateAlienGroups(): AlienGroup[] {
  // The shipped encounter coordinates, locations, orbital slots and vessel mix.
  // Source: starflight-unity-port cfaab977, Starflight Game Data.json.
  const races: Record<number, AlienRace> = {1:'Elowan',2:'Gazurtoid',3:'Mechans',4:'Mysterions',5:'Nomad',6:'Spemin',7:'Thrynn',8:'Veloxi',9:'Uhlek',10:'Veloxi Drone',11:'Minstrels',19:'Derelict'};
  const vesselTypes: Record<number,VesselClass> = {1:'Transport',2:'Scout',3:'Warship',4:'Scout',5:'Transport',6:'Scout',7:'Warship',8:'Transport',9:'Scout',10:'Warship',11:'Transport',12:'Scout',13:'Warship',14:'Scout',15:'Warship',16:'Scout',17:'Warship',18:'Drone',19:'Probe',20:'Cosmic Entity',22:'Minstrel',23:'Derelict'};
  return ENCOUNTER_DATA.map(data => {
    const race=races[data.race];
    // Stable untouched fleets make an old mission's first contact repeatable.
    let seed=data.id+1;
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const count=Math.min(data.ships,Math.max(1,data.waveSize-2+Math.floor(random()*3)));
    const baseMood=DEFAULT_BASE_MOODS[race];
    const ships=Array.from({length:count},(_,index)=>createAlienShip(race,
      vesselTypes[data.vessels[index%data.vessels.length]], `canonical-${data.id}-ship-${index+1}`,
      Math.floor(random()*7)-3,18+Math.floor(random()*4)));
    const location = data.location===0 ? 'Hyperspace' : data.location===1 ? 'Star System' : 'In Orbit';
    const x=location==='Star System' ? (random()*2-1)*220 : data.x;
    const y=location==='Star System' ? (random()*2-1)*220 : data.y;
    return {
      id:`canonical-${data.id}`,race,x,y,homeX:x,homeY:y,territoryRadius:75,
      encounterLocation:location,starX:data.x,starY:data.y,orbitSlot:data.orbitSlot,
      isHomeworldFleet:[65,139,165,233].includes(data.id),homeworldWarningStage:0,
      shipsCount:data.waveSize,spawnedTotal:count,baseMood,currentMood:baseMood,
      posture:moodDisposition(race,baseMood).fleet,ships,distressCalled:false,
    };
  });
}

// ----------------------------------------------------------------------------
// MOOD & POSTURE SHIFTS
// ----------------------------------------------------------------------------
export function calculateAlienMoodShift(
  currentMood: number,
  alienRace: AlienRace,
  playerPosture: DiplomaticPosture,
  playerShields: boolean,
  playerWeaponsArmed: boolean,
  action:
    | 'hail'
    | 'statement'
    | 'question'
    | 'answered_yes'
    | 'answered_no'
    | 'ignored_question'
    | 'unanswered_hail'
    | 'raised_shields'
    | 'lowered_shields'
    | 'armed_weapons'
    | 'disarmed_weapons',
): { newMood: number; newPosture: DiplomaticPosture; moodText: string } {
  let delta = 0;

  if (action === 'raised_shields') delta += 5;
  if (action === 'lowered_shields') delta -= 5;
  if (action === 'armed_weapons') delta += 10;
  if (action === 'disarmed_weapons') delta -= 10;
  if (['hail','statement','question'].includes(action)) delta += postureMoodEffect(alienRace,playerPosture,1,action==='question');

  const updatedMood = Math.max(0, Math.min(100, currentMood + delta));

  const newPosture = moodDisposition(alienRace,updatedMood).talk;

  let moodText = 'Calm';
  if (updatedMood > 80) moodText = 'Furious';
  else if (updatedMood > 60) moodText = 'Agitated';
  else if (updatedMood > 40) moodText = 'Cautious';
  else if (updatedMood > 20) moodText = 'Receptive';
  else moodText = 'Pleased';

  return { newMood: updatedMood, newPosture, moodText };
}
