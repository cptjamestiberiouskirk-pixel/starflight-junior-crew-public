import type {PlanetSurvey} from './utils/planet-survey';
import {ensureFeatureFuelCaches} from './utils/feature-fuel';
// tslint:disable
/* eslint-disable */

import { StarPlanet, PlanetType } from './galaxy';
import { landingRegion, localSurfacePosition, surfaceCoordinates } from './utils/planet-coordinates';

export interface ArtifactData {
  id: string;
  codeName: string;
  realName: string;
  name?: string;
  volume: number; // m³
  basePrice: number;
  value?: number;
  description: string;
  specialEffectDesc?: string;
}

// 34+ Canonical & Special Artifacts Catalog
export const CANONICAL_ARTIFACTS: ArtifactData[] = [
  // Special Functional Lore Artifacts (Step 11)
  {
    id: 'black-egg',
    codeName: 'Obsidian Black Egg',
    realName: 'The Black Egg',
    name: 'The Black Egg',
    volume: 5.0,
    basePrice: 100000,
    value: 100000,
    description: 'A dense, obsidian-black ovoid humming with dormant antimatter containment fields. Can be armed as a planetary core destruction device.',
    specialEffectDesc: 'Can be armed upon dropping from terrain vehicle. Detonates on orbital departure, destroying celestial bodies.',
  },
  {
    id: 'crystal-cone',
    codeName: 'Crystalline Tapered Cone',
    realName: 'The Crystal Cone',
    name: 'The Crystal Cone',
    volume: 1.5,
    basePrice: 45000,
    value: 45000,
    description: 'A spiraling spire of refractive quartz that resonates with crystalline harmonics.',
    specialEffectDesc: 'Pinpoints the exact Control Nexus coordinate (47N x 45E) while in orbit around the 1st planet [192, 152].',
  },
  {
    id: 'crystal-orb',
    codeName: 'Shining Prismatic Orb',
    realName: 'The Crystal Orb',
    name: 'The Crystal Orb',
    volume: 2.0,
    basePrice: 50000,
    value: 50000,
    description: 'A luminous crystalline sphere vibrating with sub-quantum heat absorption harmonics.',
    specialEffectDesc: 'Shields starship against the lethal thermal radiation field of the Crystal Planet.',
  },
  {
    id: 'crystal-pearl',
    codeName: 'Iridescent Pearl Matrix',
    realName: 'The Crystal Pearl',
    name: 'The Crystal Pearl',
    volume: 0.5,
    basePrice: 60000,
    value: 60000,
    description: 'A shimmering opalescent pearl that flickers between normal spacetime and subspace.',
    specialEffectDesc: 'Emergency subspace escape in combat when hull is below 50%. Causes hostile fleets to pursue more aggressively.',
  },
  {
    id: 'dodecahedron',
    codeName: 'Twelve-Faceted Polyhedron',
    realName: 'Precursor Dodecahedron',
    name: 'Precursor Dodecahedron',
    volume: 1.2,
    basePrice: 25000,
    value: 25000,
    description: 'A geometric twelve-sided relic emitting rhythmic electromagnetic pulses across subspace.',
    specialEffectDesc: 'Ancient telemetry transmitter node.',
  },
  {
    id: 'ellipsoid',
    codeName: 'Chitin-Inlaid Ellipsoid',
    realName: 'The Ellipsoid',
    name: 'The Ellipsoid',
    volume: 2.5,
    basePrice: 40000,
    value: 40000,
    description: 'A smoothly polished egg-shaped relic revered by the Veloxi Hive as an ancestral divine effigy.',
    specialEffectDesc: 'Pacifies the Veloxi completely and permanently when presented.',
  },
  {
    id: 'hypercube',
    codeName: 'Four-Dimensional Wireframe',
    realName: 'The Hypercube',
    name: 'The Hypercube',
    volume: 1.0,
    basePrice: 35000,
    value: 35000,
    description: 'A four-dimensional tesseract wireframe recovered from ancient Earth ruins.',
    specialEffectDesc: '4D mathematical precursor archive.',
  },
  {
    id: 'red-cylinder',
    codeName: 'Crimson Alloy Cylinder',
    realName: 'Red Archaeological Cylinder',
    name: 'Red Archaeological Cylinder',
    volume: 1.8,
    basePrice: 32000,
    value: 32000,
    description: 'A deep crimson canister equipped with sub-surface archaeological imaging emitters.',
    specialEffectDesc: 'Orbital planetary scan overlay marks all ancient ruins and flashes artifact/message coordinates.',
  },
  {
    id: 'ring-device',
    codeName: 'Golden Toroid Ring',
    realName: 'Precursor Ring Device',
    name: 'Precursor Ring Device',
    volume: 1.5,
    basePrice: 30000,
    value: 30000,
    description: 'A spinning superconductor toroid recovered from Mars polar research labs.',
    specialEffectDesc: 'Displays nearby continuum flux anomaly dots on the starship viewport.',
  },
  {
    id: 'rod-device',
    codeName: 'Reflective Prismatic Rod',
    realName: 'Laser Dispersion Rod',
    name: 'Laser Dispersion Rod',
    volume: 1.0,
    basePrice: 45000,
    value: 45000,
    description: 'A slender rod composed of coherent photon phase-inverters.',
    specialEffectDesc: 'Reduces all incoming alien laser damage to 25% (1/4 damage).',
  },
  {
    id: 'shimmering-ball',
    codeName: 'Quantum Phase Shimmering Ball',
    realName: 'The Shimmering Ball',
    name: 'The Shimmering Ball',
    volume: 1.2,
    basePrice: 38000,
    value: 38000,
    description: 'A sphere that constantly jitters and blurs between multiple spatial coordinates.',
    specialEffectDesc: 'Distorts alien targeting in tactical combat by -1 to +1 cells, causing near laser shots to miss.',
  },
  {
    id: 'tesseract',
    codeName: 'Hyperspatial Fold Cube',
    realName: 'The Tesseract',
    name: 'The Tesseract',
    volume: 0.8,
    basePrice: 30000,
    value: 30000,
    description: 'A micro-singularity fold cage that compresses hyperspace travel distances.',
    specialEffectDesc: 'Halves all hyperspace Endurium fuel consumption (2x engine efficiency).',
  },
  {
    id: 'whining-orb',
    codeName: 'Pulsing Amber Orb',
    realName: 'The Whining Orb',
    name: 'The Whining Orb',
    volume: 2.5,
    basePrice: 17500,
    value: 17500,
    description: 'A glowing gelatinous orb that vibrates softly with telepathic harmonics.',
    specialEffectDesc: 'Provides 100% Spemin speech translation.',
  },
  {
    id: 'flat-device',
    codeName: 'Mysterious Flat Device',
    realName: 'Pheromone Repulsion Matrix',
    name: 'Pheromone Repulsion Matrix',
    volume: 0.3,
    basePrice: 30000,
    value: 30000,
    description: 'An ultra-dense crystalline plate humming with sub-quantum repellent frequencies.',
    specialEffectDesc: 'Reduces surface lifeform attack rates to 10%.',
  },
  {
    id: 'black-box',
    codeName: 'Cubic Kitchen Unit',
    realName: 'The Black Box',
    name: 'The Black Box',
    volume: 1.0,
    basePrice: 20000,
    value: 20000,
    description: 'An ancient automated food and utility preparation cube.',
    specialEffectDesc: 'Slices and dices.',
  },

  // General Canonical Precursor Artifacts
  { id: 'art-01', codeName: 'Strange Cubic Matrix', realName: 'Precursor Memory Cube', name: 'Precursor Memory Cube', volume: 1.2, basePrice: 18000, description: 'Dense crystalline matrix holding dense hyper-spatial mathematical records.' },
  { id: 'art-02', codeName: 'Glowing Rod', realName: 'Plasma Induction Rod', name: 'Plasma Induction Rod', volume: 0.8, basePrice: 12500, description: 'Emits a stable blue glow; precursor energy transfer filament.' },
  { id: 'art-03', codeName: 'Black Monolith Slab', realName: 'Ancient Graviton Ingot', name: 'Ancient Graviton Ingot', volume: 4.5, basePrice: 42000, description: 'Absorbs light completely; dense gravitationally stabilized matter.' },
  { id: 'art-04', codeName: 'Ornate Golden Cylinder', realName: 'Elowan Ancient Scripture', name: 'Elowan Ancient Scripture', volume: 2.0, basePrice: 15000, description: 'Intricately etched botanical glyphs detailing the First Sprout epoch.' },
  { id: 'art-05', codeName: 'Metallic Sphere', realName: 'Veloxi Hive Core Relic', name: 'Veloxi Hive Core Relic', volume: 3.0, basePrice: 22000, description: 'Chitin-woven resonant sphere containing pheromone harmonic schematics.' },
  { id: 'art-06', codeName: 'Spiked Crystalline Disk', realName: 'Tachyon Focusing Lens', name: 'Tachyon Focusing Lens', volume: 1.5, basePrice: 34000, description: 'Bends sublight photon emissions into narrow tachyon channels.' },
  { id: 'art-07', codeName: 'Heavy Lead Container', realName: 'Isotope Decelerator', name: 'Isotope Decelerator', volume: 6.0, basePrice: 28000, description: 'A magnetic bottle containing stable heavy-element isotopes.' },
  { id: 'art-08', codeName: 'Translucent Prism', realName: 'Phase Harmonic Harmonizer', name: 'Phase Harmonic Harmonizer', volume: 0.5, basePrice: 19500, description: 'Vibrates with a soothing sub-audible chime; phase alignment crystal.' },
  { id: 'art-09', codeName: 'Coiled Fiber Cable', realName: 'Superconducting Filament', name: 'Superconducting Filament', volume: 2.2, basePrice: 16000, description: 'Room-temperature zero-loss power transfer weave.' },
  { id: 'art-10', codeName: 'Faceted Green Jewel', realName: 'Bio-Resonant Spore Container', name: 'Bio-Resonant Spore Container', volume: 0.4, basePrice: 24000, description: 'Preserved genetic patterns from ancient terraforming initiatives.' },
  { id: 'art-11', codeName: 'Intricate Clockwork Core', realName: 'Mechanical Chronometer', name: 'Mechanical Chronometer', volume: 1.8, basePrice: 14000, description: 'Geared chronometer of incomprehensible mechanical precision.' },
  { id: 'art-12', codeName: 'Gargantuan Heavy Pod', realName: 'The Red Herring', name: 'The Red Herring', volume: 50.1, basePrice: 85000, description: 'An enormous sealed precursor vessel that barely exceeds standard vehicle hold limits.' },
  { id: 'art-13', codeName: 'Curved Shimmering Plate', realName: 'Hyper-Alloy Deflector Tile', name: 'Hyper-Alloy Deflector Tile', volume: 1.0, basePrice: 11000, description: 'Micro-layered shield dissipator material.' },
  { id: 'art-15', codeName: 'Carved Obsidian Figurine', realName: 'Old Empire Astrogator Effigy', name: 'Old Empire Astrogator Effigy', volume: 1.1, basePrice: 21000, description: 'Carved representation of Arth\'s ancestral spacefarers.' },
  { id: 'art-16', codeName: 'Silver Toroid Ring', realName: 'Sub-Space Resonator', name: 'Sub-Space Resonator', volume: 1.6, basePrice: 26000, description: 'Rings in response to distant continuum flux disturbances.' },
  { id: 'art-17', codeName: 'Etched Crystalline Tablet', realName: 'Star Atlas Fragment #1', name: 'Star Atlas Fragment #1', volume: 0.9, basePrice: 38000, description: 'Encoded navigational star-chart of the forgotten sector.' },
  { id: 'art-18', codeName: 'Liquid-Filled Vial', realName: 'Endurium Synthesizer Reagent', name: 'Endurium Synthesizer Reagent', volume: 0.3, basePrice: 45000, description: 'Catalytic fluid that stabilizes Endurium crystal lattice formation.' },
  { id: 'art-19', codeName: 'Segmented Bone Staff', realName: 'Thrynn Patriarch Scepter', name: 'Thrynn Patriarch Scepter', volume: 2.8, basePrice: 23000, description: 'Reptilian ceremonial scepter inlaid with conductive iridium.' },
  { id: 'art-20', codeName: 'Dull Gray Ingot', realName: 'Neutronium Bar', name: 'Neutronium Bar', volume: 5.0, basePrice: 50000, description: 'Ultra-dense collapsed matter from a dead stellar remnant.' },
];

export interface RuinLore {
  starX: number;
  starY: number;
  planetOrderIndex: number; // 0 = 1st planet, 1 = 2nd planet...
  lat?: number;
  long?: number;
  title: string;
  message: string;
  artifactId?: string;
  isControlNexus?: boolean;
}

export const RUIN_LORE_DATABASE: RuinLore[] = [
  // 1. Earth [215, 86] Planet 3 (11N 104W)
  {
    starX: 215,
    starY: 86,
    planetOrderIndex: 2,
    lat: 11,
    long: -104,
    title: 'Ruins of Ancient Earth',
    message: 'MICROFILM LOG: "Earth. Birthplace of humanity and capital of the Old Empire. Atmospheric irradiation and planetary warfare devastated the surface thousands of years ago. Recovered Hypercube relic."',
    artifactId: 'hypercube',
  },
  // 2. Mars [215, 86] Planet 4 (90N 0E)
  {
    starX: 215,
    starY: 86,
    planetOrderIndex: 3,
    lat: 90,
    long: 0,
    title: 'Mars North Polar Research Outpost',
    message: 'LOG ENTRY: "Project Continuum: Flux pathways connect hyper-spatial coordinates across great distances. The Ring Device provides early detection of flux disturbances."',
    artifactId: 'ring-device',
  },
  // 3. Crystal Planet [192, 152] Planet 1 (47N 45E) - CONTROL NEXUS
  {
    starX: 192,
    starY: 152,
    planetOrderIndex: 0,
    lat: 47,
    long: 45,
    title: 'Precursor Harmonic Control Nexus',
    message: 'CORE TELEMETRY: "You stand before the living Crystalline Nexus at 47N x 45E. This ancient mega-structure directs cosmic harmonic resonances that trigger stellar flares across the galaxy. Planting a triggered Black Egg antimatter charge here will permanently shatter the flaring mechanism."',
    isControlNexus: true,
  },
  // 4. Uhlek Brain World [55, 32] Planet 2
  {
    starX: 55,
    starY: 32,
    planetOrderIndex: 1,
    lat: 0,
    long: 0,
    title: 'Uhlek Central Synaptic Brain World',
    message: 'BIO-SYNTHETIC READOUT: "The pulsing biological mega-brain coordinating all Uhlek swarm drones across the galaxy. Detonating a Black Egg here will silence the Uhlek permanently."',
  },
  // 5. Uhlek Origin [7, 118] Planet 6
  {
    starX: 7,
    starY: 118,
    planetOrderIndex: 5,
    title: 'Automated Defense Grid Laboratory #7118',
    message: 'ARCHIVE TAPE: "Autonomous defense project #7118 went rogue when contact with the Old Empire was lost. It re-engineered itself to eliminate all organic threats, giving birth to the Uhlek."',
  },
  // 6. Elan [148, 63] Planet 2
  {
    starX: 148,
    starY: 63,
    planetOrderIndex: 1,
    title: 'Elan - Sacred Elowan Nursery Grove',
    message: 'BOTANICAL SANCTUARY: "The sacred loam of Elan cradles the dormant seed-pods of future Elowan generations. Harm to this world would make the Elowan mortal enemies of all humankind."',
  },
  // 7. Heaven [145, 107] Planet 4
  {
    starX: 145,
    starY: 107,
    planetOrderIndex: 3,
    title: 'Heaven Station Mechan Assembly Core',
    message: 'MECHAN CHRONICLE: "We are the Mechans. We await the return of our human creators to resume environmental revitalization programs."',
  },
  // 8. Sphexi [132, 165] Planet 1 (46N 14E)
  {
    starX: 132,
    starY: 165,
    planetOrderIndex: 0,
    lat: 46,
    long: 14,
    title: 'Sphexi Thermal Mitigation Sanctuary',
    message: 'PRECURSOR VAULT: "Recovered the Crystal Orb. Crystalline resonance shields starship hulls from lethal stellar thermal radiation fields."',
    artifactId: 'crystal-orb',
  },
  // 9. Lasthope [175, 94] Planet 1
  {
    starX: 175,
    starY: 94,
    planetOrderIndex: 0,
    title: 'Wreckage of Colony Ship Noah 9',
    message: 'DERELICT BLACK BOX: "Colony vessel Noah 9 crashed during the dark interstellar migration. All colonists perished in cryo-stasis."',
  },
  // 10. City of Ancients [56, 144] Planet 1 (28N 13W)
  {
    starX: 56,
    starY: 144,
    planetOrderIndex: 0,
    lat: 28,
    long: -13,
    title: 'City of the Ancients',
    message: 'ANCIENT MONOLITH: "Submerged spires of the Ancient precursor architects. Recovered the Crystal Pearl, capable of emergency subspace escape."',
    artifactId: 'crystal-pearl',
  },
  // 11. Old Empire Base [180, 120] Planet 1
  {
    starX: 180,
    starY: 120,
    planetOrderIndex: 0,
    title: 'Old Empire Strategic Command Archive',
    message: 'SECRET DOSSIER: "High Command Memo #412: Endurium crystals are the fossilized, bio-resonant cellular remnants of the Ancients themselves!"',
  },
  // 12. New Scotland [180, 124] Planet 2 (54N 13E)
  {
    starX: 180,
    starY: 124,
    planetOrderIndex: 1,
    lat: 54,
    long: 13,
    title: 'New Scotland Harmonic Physics Lab',
    message: 'RESEARCH RECORD: "Laser dispersion physics field test complete. The Rod Device reduces coherent laser damage to one-fourth (25%)."',
    artifactId: 'rod-device',
  },
  // 13. Mardan [217, 88] Planet 2 & 4
  {
    starX: 217,
    starY: 88,
    planetOrderIndex: 1,
    title: 'Mardan Precursor Metamorphosis Library',
    message: 'ANCIENT CODEX: "The Ancients did not vanish into nothingness; they metamorphosed their conscious cellular biology into living Endurium crystal lattices."',
  },
  // 14. Phlegmak Base [234, 20] Planet 2 (34S 98E) - Black Egg #1
  {
    starX: 234,
    starY: 20,
    planetOrderIndex: 1,
    lat: -34,
    long: 98,
    title: 'Phlegmak Deep Precursor Armory',
    message: 'SECURITY OVERRIDE: "Armory Vault #1 Unsealed. Recovered Black Egg planet buster antimatter weapon."',
    artifactId: 'black-egg',
  },
  // 15. Akteron [165, 84] Planet 6
  {
    starX: 165,
    starY: 84,
    planetOrderIndex: 5,
    title: 'Akteron Solar Flare Telemetry Station',
    message: 'SEISMIC BEACON: "Stellar flares are not random natural phenomena; they radiate with artificial synchronicity outward from sector [192, 152]."',
  },
  // 16. Gaal [164, 85] Planet 8
  {
    starX: 164,
    starY: 85,
    planetOrderIndex: 7,
    title: 'Gaal Astronomical Observatory',
    message: 'STELLAR CALCULATIONS: "Mathematical proofs verify the Crystal Planet at [192, 152] is the master control nexus triggering solar flares across the galaxy."',
  },
  // 17. Koann [112, 200] Planet 3 (59N 64W) - Red Cylinder
  {
    starX: 112,
    starY: 200,
    planetOrderIndex: 2,
    lat: 59,
    long: -64,
    title: 'Koann Archaeological Outpost',
    message: 'SURVEY BEACON: "Recovered the Red Cylinder. Orbital scans will now pinpoint ruins and ancient message coordinates across all visited planets."',
    artifactId: 'red-cylinder',
  },
  // 18. Veloxi Border Drone Node [143, 115] Planet 1 (28N 4E) - Black Egg #2
  {
    starX: 143,
    starY: 115,
    planetOrderIndex: 0,
    lat: 28,
    long: 4,
    title: 'Veloxi Border Weapons Cache',
    message: 'HIVE PROTOCOL: "Recovered Black Egg antimatter core from fortified subterranean silo."',
    artifactId: 'black-egg',
  },
  // 19. Black Egg Vault Gamma [238, 189] Planet 3 (52N 16E) - Black Egg #3
  {
    starX: 238,
    starY: 189,
    planetOrderIndex: 2,
    lat: 52,
    long: 16,
    title: 'Precursor Weapon Vault Gamma',
    message: 'CONTAINMENT LOG: "Antimatter core stable. Recovered Black Egg #3."',
    artifactId: 'black-egg',
  },
  // 20. Crystal Cone Shrine [20, 198] Planet 1 (29S 55W)
  {
    starX: 20,
    starY: 198,
    planetOrderIndex: 0,
    lat: -29,
    long: -55,
    title: 'Crystal Cone Telemetry Shrine',
    message: 'HARMONIC SCRIPT: "Recovered the Crystal Cone. It reveals the exact planetary coordinates of the Control Nexus (47N 45E) on the 1st planet of system [192, 152]."',
    artifactId: 'crystal-cone',
  },
  // 21. Dodecahedron [118, 146] Planet 4 (16S 20W)
  {
    starX: 118,
    starY: 146,
    planetOrderIndex: 3,
    lat: -16,
    long: -20,
    title: 'Dodecahedron Subspace Beacon',
    message: 'BEACON ARCHIVE: "Recovered the Precursor Dodecahedron transmitter."',
    artifactId: 'dodecahedron',
  },
  // 22. Ellipsoid Relic [81, 98] Planet 1 (44S 137W)
  {
    starX: 81,
    starY: 98,
    planetOrderIndex: 0,
    lat: -44,
    long: -137,
    title: 'Veloxi Sacred Egg Temple',
    message: 'SACRED INSCRIPTION: "Recovered the Sacred Ellipsoid. The Veloxi Hive venerates this holy relic above all else."',
    artifactId: 'ellipsoid',
  },
  // 23. Tesseract Vault [18, 50] Planet 5 (15N 44W)
  {
    starX: 18,
    starY: 50,
    planetOrderIndex: 4,
    lat: 15,
    long: -44,
    title: 'Precursor Hyperspace Fold Vault',
    message: 'WARP FORMULA: "Recovered the Tesseract. Compresses hyperspatial distance, doubling engine fuel efficiency."',
    artifactId: 'tesseract',
  },
  // 24. Gazurtoid Outpost [68, 66] Planet 1 (11N 32E)
  {
    starX: 68,
    starY: 66,
    planetOrderIndex: 0,
    lat: 11,
    long: 32,
    title: 'Gazurtoid Tactical Research Base',
    message: 'PURIFICATION ARCHIVE: "Recovered the Shimmering Ball. Its quantum targeting distortion confuses enemy targeting computers."',
    artifactId: 'shimmering-ball',
  },
  // 25. Arth Planet 3 (Homeworld Ruins)
  {
    starX: 125,
    starY: 100,
    planetOrderIndex: 1, // 3rd slot (orderIndex 1)
    title: 'Old Arth Planetary Outpost Archives',
    message: 'MICROFILM LOG: "Archaeological survey confirms precursor weapons vault at Phlegmak [234, 20] Planet 2 containing antimatter Black Egg ordnance."',
  },
];

export type LifeformTemperament = 'passive' | 'fleeing' | 'aggressive';

export interface LifeformSpecimen {
  id: string;
  speciesName: string;
  size: 'Small' | 'Medium' | 'Large' | 'Behemoth';
  volume: number;
  bountyValue: number;
  temperament: LifeformTemperament;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  stunned: boolean;
  dead: boolean;
  recorded: boolean;
  captured: boolean;
  bodyPlan?: number;
  intelligence?: number;
  aggression?: number;
  hitPoints?: number;
  niche?: 'Producer' | 'Herbivore' | 'Carnivore' | 'Omnivore';
  composition?: string[];
  attackCooldown?: number;
  heading?: number;
}

export interface MineralDeposit {
  id: string;
  name: string;
  volume: number;
  x: number;
  y: number;
  taken: boolean;
}

export interface DroppedCargoItem {
  id: string;
  name: string;
  type: 'mineral' | 'artifact' | 'specimen';
  volume: number;
  value: number;
  x: number;
  y: number;
  artifactRef?: ArtifactData;
  speciesName?: string;
  isArmed?: boolean;
  armedTimer?: number;
}

export interface SurfaceRuin {
  id: string;
  name: string;
  x: number;
  y: number;
  lat?: number;
  long?: number;
  loreTitle: string;
  loreMessage: string;
  artifactId?: string;
  explored: boolean;
  artifactRecovered?: boolean;
  isControlNexus?: boolean;
}

export type TerrainElevation = 'Liquid' | 'Lowland' | 'Highland' | 'Mountains';

export interface PlanetSurfaceState {
  survey?: PlanetSurvey;
  originLat?: number;
  originLong?: number;
  generatedRegions?: string[];
  planetSeed: number;
  planetType: PlanetType;
  color: string;
  hydrosphereCompound: string;
  minerals: MineralDeposit[];
  ruins: SurfaceRuin[];
  lifeforms: LifeformSpecimen[];
  droppedCargo: DroppedCargoItem[];
  scannedTimer: number;
}

function hash2d(x: number, y: number, seed: number): number {
  let n = (Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ seed) >>> 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/** Continuous height from the unchanged original terrain generator. */
export function surfaceElevationValue(x:number,y:number,seed:number){
  const wrappedX = (((x + 180) % 360) + 360) % 360 - 180;

  const s1 = 0.04;
  const s2 = 0.12;
  const s3 = 0.3;

  const ix = Math.floor(wrappedX * s1);
  const iy = Math.floor(y * s1);
  const fx = wrappedX * s1 - ix;
  const fy = y * s1 - iy;

  const n1 = hash2d(ix, iy, seed) * (1 - fx) * (1 - fy) +
             hash2d(ix + 1, iy, seed) * fx * (1 - fy) +
             hash2d(ix, iy + 1, seed) * (1 - fx) * fy +
             hash2d(ix + 1, iy + 1, seed) * fx * fy;

  const n2 = hash2d(Math.floor(wrappedX * s2), Math.floor(y * s2), seed + 101);
  const n3 = hash2d(Math.floor(wrappedX * s3), Math.floor(y * s3), seed + 202);

  return n1 * 0.6 + n2 * 0.28 + n3 * 0.12;
}

export function getSurfaceElevation(
  x: number,
  y: number,
  seed: number,
  hydrospherePercent: number,
  planetType: PlanetType
): TerrainElevation {
  if (Math.abs(y) > 90) return 'Mountains';

  const elevVal = surfaceElevationValue(x,y,seed);

  const liquidThreshold = (hydrospherePercent / 100) * 0.75;

  if (planetType === 'Gas Giant') return 'Liquid';
  if (elevVal < liquidThreshold && hydrospherePercent > 0) return 'Liquid';
  if (elevVal < liquidThreshold + 0.45) return 'Lowland';
  if (elevVal < liquidThreshold + 0.75) return 'Highland';
  return 'Mountains';
}

export function generatePlanetSurface(
  starX: number,
  starY: number,
  planet: StarPlanet,
  landing?: {lat:number;lon:number}
): PlanetSurfaceState {
  const seed = (starX * 73856093) ^ (starY * 19349663) ^ (planet.slot * 83492791);
  const region = landing ? landingRegion(landing.lat,landing.lon) : '';
  const regionSeed = region ? [...region].reduce((value,char)=>Math.imul(value,31)+char.charCodeAt(0),0) : 0;
  const entitySeed = `${seed}${region ? '-'+region : ''}`;
  let s = (seed ^ regionSeed) >>> 0;
  const prng = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const minerals: MineralDeposit[] = [];
  const ruins: SurfaceRuin[] = [];
  const lifeforms: LifeformSpecimen[] = [];
  const droppedCargo: DroppedCargoItem[] = [];

  // Minerals
  if (planet.minerals && planet.minerals.length > 0) {
    planet.minerals.forEach((min) => {
      const count = Math.max(1, Math.floor((min.density / 100) * 8) + 1);
      for (let i = 0; i < count; i++) {
        const dist = 0.8 + prng() * 12.0;
        const angle = prng() * Math.PI * 2;
        const vol = +(1.0 + prng() * 8.9).toFixed(1);
        minerals.push({
          id: `min-${min.name}-${i}-${entitySeed}`,
          name: min.name,
          volume: vol,
          x: +(Math.cos(angle) * dist).toFixed(2),
          y: +(Math.sin(angle) * dist).toFixed(2),
          taken: false,
        });
      }
    });
  }

  // Exact Canonical Ruins & Microfilms
  const canonicalRuin = RUIN_LORE_DATABASE.find(
    (l) => l.starX === starX && l.starY === starY && l.planetOrderIndex === planet.orderIndex
  );

  if (canonicalRuin) {
    const rDist = 2.5 + prng() * 8.0;
    const rAngle = prng() * Math.PI * 2;

    ruins.push({
      id: `ruin-canonical-${starX}-${starY}-${planet.orderIndex}`,
      name: canonicalRuin.title,
      ...(landing && canonicalRuin.lat!==undefined && canonicalRuin.long!==undefined
        ? localSurfacePosition(landing.lat,landing.lon,canonicalRuin.lat,canonicalRuin.long)
        : {x:+(Math.cos(rAngle)*rDist).toFixed(2),y:+(Math.sin(rAngle)*rDist).toFixed(2)}),
      lat: canonicalRuin.lat,
      long: canonicalRuin.long,
      loreTitle: canonicalRuin.title,
      loreMessage: canonicalRuin.message,
      artifactId: canonicalRuin.artifactId,
      explored: false,
      isControlNexus: canonicalRuin.isControlNexus,
    });
  } else if (prng() < 0.20) {
    const rDist = 2.0 + prng() * 10.0;
    const rAngle = prng() * Math.PI * 2;
    // Random curios must not bypass the fixed sites of story artifacts.
    const curios = CANONICAL_ARTIFACTS.filter(artifact=>!artifact.specialEffectDesc);
    const art = curios[Math.floor(prng() * curios.length)];

    ruins.push({
      id: `ruin-proc-${entitySeed}`,
      name: 'Ancient Precursor Obelisk',
      x: +(Math.cos(rAngle) * rDist).toFixed(2),
      y: +(Math.sin(rAngle) * rDist).toFixed(2),
      loreTitle: 'Precursor Inscription Tablet',
      loreMessage: `LOG ENTRY: "Ancient structural glyphs mapped at [${starX}, ${starY}] Planet ${planet.orderIndex + 1}. Telemetry indicates pre-cataclysm precursor origin."`,
      artifactId: art.id,
      explored: false,
    });
  }

  // Lifeforms (if bioDensity > 0)
  if (planet.bioDensity > 0) {
    const speciesCount = Math.max(1, Math.floor(planet.bioDensity / 20));
    const speciesNames = [
      'Chitinous Strider', 'Bioluminescent Floater', 'Armored Land-Tortoise',
      'Spiked Crystal Crawler', 'Crystalline Stalker', 'Carnivorous Spore-Gorgon',
      'Horned Grazing Behemoth', 'Gliding Membrane Wing', 'Lava-Salamander'
    ];

    for (let sp = 0; sp < speciesCount; sp++) {
      const spName = speciesNames[(Math.floor(prng() * speciesNames.length) + sp) % speciesNames.length];
      const sizeRoll = prng();
      const size: LifeformSpecimen['size'] = sizeRoll < 0.35 ? 'Small' : sizeRoll < 0.7 ? 'Medium' : sizeRoll < 0.9 ? 'Large' : 'Behemoth';
      const vol = size === 'Small' ? 1.0 : size === 'Medium' ? 2.5 : size === 'Large' ? 6.0 : 12.0;
      const bounty = size === 'Small' ? 1200 : size === 'Medium' ? 2800 : size === 'Large' ? 6500 : 14000;
      const tempRoll = prng();
      const temp: LifeformTemperament = tempRoll < 0.45 ? 'passive' : tempRoll < 0.75 ? 'fleeing' : 'aggressive';

      const countThisSpecies = Math.floor(prng() * 3) + 2;
      for (let c = 0; c < countThisSpecies; c++) {
        const lDist = 1.0 + prng() * 12.0;
        const lAngle = prng() * Math.PI * 2;
        lifeforms.push({
          id: `life-${sp}-${c}-${entitySeed}`,
          speciesName: spName,
          size,
          volume: vol,
          bountyValue: bounty,
          temperament: temp,
          color: temp === 'aggressive' ? '#ef4444' : temp === 'fleeing' ? '#fbbf24' : '#34d399',
          x: +(Math.cos(lAngle) * lDist).toFixed(2),
          y: +(Math.sin(lAngle) * lDist).toFixed(2),
          vx: 0,
          vy: 0,
          stunned: false,
          dead: false,
          recorded: false,
          captured: false,
        });
      }
    }
  }

  return ensureFeatureFuelCaches({
    ...(landing ? {originLat:landing.lat,originLong:landing.lon,generatedRegions:[region]} : {}),
    planetSeed: seed,
    planetType: planet.type,
    color: planet.color,
    hydrosphereCompound: planet.hydrosphereCompound,
    minerals,
    ruins,
    lifeforms,
    droppedCargo,
    scannedTimer: 0,
  },starX,starY,planet.orderIndex);
}

/** Retain a planet's collected/depleted state while moving the landing origin. */
export function preparePlanetSurface(existing:PlanetSurfaceState|undefined,starX:number,starY:number,planet:StarPlanet,latitude:number,longitude:number):PlanetSurfaceState {
  if (!existing) return generatePlanetSurface(starX,starY,planet,{lat:latitude,lon:longitude});
  const oldLat=existing.originLat ?? latitude, oldLon=existing.originLong ?? longitude;
  const regions=existing.generatedRegions ?? [landingRegion(oldLat,oldLon)];
  const groups=[existing.minerals,existing.lifeforms,existing.droppedCargo,existing.ruins];
  if (oldLat!==latitude || oldLon!==longitude) {
    for (const group of groups) for (const item of group) {
      const world=surfaceCoordinates(oldLat,oldLon,item.x,item.y);
      Object.assign(item,localSurfacePosition(latitude,longitude,world.lat,world.lon));
    }
  }
  for (const ruin of existing.ruins) if (ruin.lat!==undefined && ruin.long!==undefined) {
    Object.assign(ruin,localSurfacePosition(latitude,longitude,ruin.lat,ruin.long));
  }
  const region=landingRegion(latitude,longitude);
  if (!regions.includes(region)) {
    const fresh=generatePlanetSurface(starX,starY,planet,{lat:latitude,lon:longitude});
    const merge=<T extends {id:string}>(retained:T[],added:T[]) => {
      const ids=new Set(retained.map(item=>item.id));
      retained.push(...added.filter(item=>!ids.has(item.id)));
    };
    merge(existing.minerals,fresh.minerals);
    merge(existing.lifeforms,fresh.lifeforms);
    merge(existing.ruins,fresh.ruins);
    regions.push(region);
  }
  existing.originLat=latitude;
  existing.originLong=longitude;
  existing.generatedRegions=regions;
  return ensureFeatureFuelCaches(existing,starX,starY,planet.orderIndex);
}
