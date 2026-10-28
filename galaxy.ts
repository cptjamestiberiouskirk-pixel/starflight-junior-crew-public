// tslint:disable
/* eslint-disable */

/**
 * 1986 Starflight Canonical Galaxy Engine (250x220 Fixed Universe)
 * Canonical universe constructed directly from 270 STAR_LINES.
 * 270 stars, 811 planets, 70 nebulae, and 32 continuum flux pairs.
 */

import { STAR_LINES } from './src/galaxyData';

export type SpectralClass = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M';
export type PlanetType = 'Rock' | 'Frozen' | 'Liquid' | 'Gas Giant' | 'Molten' | 'Crystal';
export type PlanetSize = 'Small' | 'Medium' | 'Large' | 'Huge';
export type AtmosphereDensity = 'None' | 'Very Thin' | 'Thin' | 'Moderate' | 'Thick' | 'Very Thick';
export type WeatherType = 'None' | 'Calm' | 'Moderate' | 'Violent' | 'Very Violent';
export type TempRange = 'Inferno' | 'Searing' | 'Tropical' | 'Temperate' | 'Arctic' | 'Sub-Arctic';

export interface StarPlanet {
  slot: number; // 1..8 raw slot index
  orderIndex: number; // 0-based order counting outwards from star (0 = 1st, 1 = 2nd...)
  name: string; // "1st Planet", "Arth (Homeworld)", "2nd Planet", etc.
  type: PlanetType;
  size: PlanetSize;
  renderSize: number;
  color: string;
  gravity: number; // G
  mass: number;
  orbitRadius: number;
  orbitSpeed: number;
  initialAngle: number;
  atmosphereDensity: AtmosphereDensity;
  gases: string[];
  hydrosphereCompound: string;
  hydrospherePercent: number;
  temperature: TempRange;
  temperatureRange: string; // e.g. "Sub-Arctic to Temperate"
  tempMin: TempRange;
  tempMax: TempRange;
  tempMinIndex: number;
  tempMaxIndex: number;
  weather: WeatherType;
  minerals: { name: string; density: number }[];
  mineralDensity: number;
  enduriumDensity: number;
  bioDensity: number;
  storyName?: string;
  isHomeworld?: boolean;
  destroyed?: boolean;
}

export interface GalaxyStar {
  id: number;
  x: number; // 0..249
  y: number; // 0..219
  name: string;
  spectral: SpectralClass;
  color: string;
  size: number;
  flareDay?: number;
  hasFlared?: boolean;
  inNebula?: boolean;
  planets: StarPlanet[];
}

export interface NebulaHaze {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
}

export interface AlienTerritory {
  name: string;
  color: string;
  x: number;
  y: number;
  radius: number;
}

export interface FluxLink {
  id: number;
  from: [number, number];
  to: [number, number];
}

export const SPECTRAL_COLORS: Record<SpectralClass, string> = {
  O: '#4488ff',
  B: '#99ccff',
  A: '#ffffff',
  F: '#fff4b0',
  G: '#ffdd33',
  K: '#ff8833',
  M: '#ff3333',
};

// Life bands by star spectral class:
export const LIFE_BANDS: Record<SpectralClass, [number, number]> = {
  M: [1, 2],
  K: [2, 3],
  G: [3, 4],
  F: [4, 5],
  A: [5, 6],
  B: [6, 7],
  O: [7, 8],
};

export const ALIEN_TERRITORIES: AlienTerritory[] = [
  { name: 'Elowan', color: '#34d399', x: 156, y: 58, radius: 20 },
  { name: 'Thrynn', color: '#f87171', x: 132, y: 35, radius: 23 },
  { name: 'Spemin', color: '#fbbf24', x: 84, y: 137, radius: 44 },
  { name: 'Gazurtoid', color: '#c084fc', x: 82, y: 61, radius: 42 },
  { name: 'Veloxi', color: '#60a5fa', x: 141, y: 147, radius: 33 },
  { name: 'Uhlek Domain Alpha', color: '#ef4444', x: 2, y: 6, radius: 64 },
  { name: 'Uhlek Domain Beta', color: '#ef4444', x: 6, y: 107, radius: 44 },
  { name: 'Uhlek Domain Gamma', color: '#ef4444', x: 17, y: 191, radius: 45 },
  { name: 'Uhlek Domain Delta', color: '#ef4444', x: 108, y: 220, radius: 51 },
];

// Exact 32 Canonical Continuum Flux Pairs (Bidirectional)
export const CONTINUUM_FLUX_PAIRS: FluxLink[] = [
  { id: 1, from: [98, 79], to: [69, 66] },
  { id: 2, from: [101, 77], to: [61, 131] },
  { id: 3, from: [142, 51], to: [101, 83] },
  { id: 4, from: [97, 76], to: [93, 62] },
  { id: 5, from: [150, 96], to: [95, 82] },
  { id: 6, from: [118, 107], to: [104, 82] },
  { id: 7, from: [217, 80], to: [176, 123] },
  { id: 8, from: [189, 190], to: [178, 127] },
  { id: 9, from: [135, 84], to: [9, 16] },
  { id: 10, from: [25, 48], to: [22, 22] },
  { id: 11, from: [173, 61], to: [130, 108] },
  { id: 12, from: [179, 52], to: [128, 24] },
  { id: 13, from: [232, 40], to: [180, 52] },
  { id: 14, from: [194, 134], to: [190, 28] },
  { id: 15, from: [106, 139], to: [65, 181] },
  { id: 16, from: [64, 186], to: [31, 184] },
  { id: 17, from: [35, 186], to: [23, 199] },
  { id: 18, from: [71, 151], to: [54, 143] },
  { id: 19, from: [58, 140], to: [53, 143] },
  { id: 20, from: [60, 146], to: [56, 142] },
  { id: 21, from: [59, 144], to: [55, 146] },
  { id: 22, from: [55, 145], to: [51, 132] },
  { id: 23, from: [54, 146], to: [15, 135] },
  { id: 24, from: [71, 84], to: [7, 94] },
  { id: 25, from: [170, 93], to: [148, 166] },
  { id: 26, from: [234, 167], to: [109, 204] },
  { id: 27, from: [173, 88], to: [126, 87] },
  { id: 28, from: [237, 153], to: [180, 86] },
  { id: 29, from: [235, 49], to: [229, 148] },
  { id: 30, from: [248, 1], to: [55, 99] },
  { id: 31, from: [146, 112], to: [128, 105] },
  { id: 32, from: [128, 143], to: [123, 127] },
];

// Exact 70 Canonical Nebulae (x, y, radius)
export const CANONICAL_NEBULAE_DATA: [number, number, number][] = [
  [165, 84, 5], [159, 79, 4], [164, 89, 3], [56, 144, 5], [59, 142, 4],
  [80, 148, 7], [88, 146, 3], [76, 141, 3], [65, 155, 3], [60, 122, 10],
  [66, 128, 6], [64, 110, 5], [43, 111, 4], [36, 126, 2], [78, 124, 2],
  [98, 153, 2], [100, 156, 2], [56, 82, 3], [53, 79, 2], [54, 76, 3],
  [46, 71, 2], [47, 69, 2], [72, 64, 6], [74, 52, 9], [22, 76, 10],
  [34, 76, 5], [17, 61, 5], [12, 88, 3], [32, 39, 3], [55, 99, 1],
  [53, 98, 1], [11, 16, 7], [9, 23, 6], [14, 28, 4], [6, 12, 4],
  [10, 37, 1], [8, 37, 1], [107, 180, 5], [102, 184, 3], [101, 179, 2],
  [113, 193, 2], [110, 192, 1], [127, 195, 3], [132, 196, 2], [141, 197, 2],
  [131, 189, 1], [149, 211, 2], [151, 212, 2], [32, 3, 8], [23, 3, 4],
  [182, 30, 9], [187, 22, 5], [170, 21, 3], [131, 48, 3], [133, 44, 2],
  [141, 156, 2], [168, 141, 3], [165, 143, 1], [170, 141, 1], [225, 174, 9],
  [217, 178, 6], [231, 181, 4], [218, 184, 2], [215, 161, 2], [236, 82, 3],
  [217, 68, 2], [17, 198, 5], [14, 195, 4], [14, 191, 4], [12, 180, 2],
];

const NEBULA_COLORS = [
  'rgba(147, 51, 234, 0.25)',
  'rgba(59, 130, 246, 0.25)',
  'rgba(236, 72, 153, 0.25)',
  'rgba(16, 185, 129, 0.22)',
  'rgba(245, 158, 11, 0.22)',
];

export function getCanonicalNebulae(): NebulaHaze[] {
  return CANONICAL_NEBULAE_DATA.map((neb, idx) => ({
    id: idx + 1,
    x: neb[0],
    y: neb[1],
    radius: neb[2],
    color: NEBULA_COLORS[idx % NEBULA_COLORS.length],
  }));
}

// ----------------------------------------------------------------------------
// PARSER LEGENDS & MAPPINGS
// ----------------------------------------------------------------------------
export const GAS_LEGEND: Record<number, string> = {
  0: 'Ammonia',
  1: 'Ammonia Compounds',
  2: 'Argon',
  3: 'Carbon Dioxide',
  4: 'Chlorine',
  5: 'Chlorine Compounds',
  6: 'Fluorine',
  7: 'Fluorine Compounds',
  8: 'Helium',
  9: 'Hydrogen',
  10: 'Hydrogen Cyanide',
  11: 'Metal Compounds',
  12: 'Methane',
  13: 'Nitrogen',
  14: 'None',
  15: 'Oxygen',
};

export const HYDROSPHERE_LEGEND: Record<number, string> = {
  0: 'Ammonia',
  1: 'Ammonia Compounds',
  2: 'Carbon Monoxide',
  3: 'Chlorine Compounds',
  4: 'Ethanol',
  5: 'Fluorine Compounds',
  6: 'Metal Compounds',
  7: 'Methane',
  8: 'Methanol',
  9: 'Nitrogen',
  10: 'None',
  11: 'Oxygen',
  12: 'Silicon Compounds',
  13: 'Sodium Compounds',
  14: 'Sulfur Compounds',
  15: 'Water',
};

export const TEMP_LEGEND: Record<number, TempRange> = {
  0: 'Sub-Arctic',
  1: 'Arctic',
  2: 'Temperate',
  3: 'Tropical',
  4: 'Searing',
  5: 'Inferno',
};

export const WEATHER_LEGEND: Record<number, WeatherType> = {
  0: 'None',
  1: 'Calm',
  2: 'Moderate',
  3: 'Violent',
  4: 'Very Violent',
};

export const DENSITY_LEGEND: Record<number, AtmosphereDensity> = {
  0: 'None',
  1: 'Very Thin',
  2: 'Thin',
  3: 'Moderate',
  4: 'Thick',
  5: 'Very Thick',
};

export const ELEMENT_LEGEND: Record<number, string> = {
  0: 'Aluminum',
  1: 'Antimony',
  2: 'Chromium',
  3: 'Cobalt',
  4: 'Copper',
  5: 'Endurium (Fuel)',
  6: 'Gold',
  7: 'Iron',
  8: 'Lead',
  9: 'Magnesium',
  10: 'Mercury',
  11: 'Molybdenum',
  12: 'Nickel',
  13: 'Platinum',
  14: 'Plutonium',
  15: 'Promethium',
  16: 'Rodnium',
  17: 'Silver',
  18: 'Tin',
  19: 'Titanium',
  20: 'Tungsten',
  21: 'Zinc',
};

export const TYPE_LEGEND: Record<string, PlanetType> = {
  R: 'Rock',
  F: 'Frozen',
  L: 'Liquid',
  G: 'Gas Giant',
  M: 'Molten',
  C: 'Crystal',
};

export const SIZE_LEGEND: Record<string, PlanetSize> = {
  s: 'Small',
  m: 'Medium',
  l: 'Large',
  h: 'Huge',
};

function toOrdinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

// ----------------------------------------------------------------------------
// PARSE PLANET TOKEN FROM STAR_LINES
// ----------------------------------------------------------------------------
export function parsePlanetToken(
  starX: number,
  starY: number,
  orderIndex: number,
  rawToken: string
): StarPlanet {
  const parts = rawToken.trim().split(/\s+/);
  const tag = parts[0] || '1Rm';
  const tagMatch = tag.match(/^(\d+)([RFLGMC])([smhl])?$/i);

  const slot = tagMatch ? parseInt(tagMatch[1], 10) : 1;
  const typeCode = tagMatch ? tagMatch[2].toUpperCase() : 'R';
  const sizeCode = tagMatch && tagMatch[3] ? tagMatch[3].toLowerCase() : (typeCode === 'G' ? 'h' : 'm');

  const type: PlanetType = TYPE_LEGEND[typeCode] || 'Rock';
  const size: PlanetSize = SIZE_LEGEND[sizeCode] || (type === 'Gas Giant' ? 'Huge' : 'Medium');

  let gravity = 1.0;
  let mass = 5000;
  let densityIdx = 0;
  let gasIds: number[] = [];
  let hydroIdx = 10;
  let tempMinIdx = 2;
  let tempMaxIdx = 2;
  let weatherIdx = 1;
  let elementIds: number[] = [];
  let mineralDensity = 0;
  let bioDensity = 0;

  for (let i = 1; i < parts.length; i++) {
    const tok = parts[i];
    if (tok.endsWith('g') && !tok.startsWith('m')) {
      const gVal = parseFloat(tok.slice(0, -1));
      if (!isNaN(gVal)) gravity = gVal;
    } else if (tok.startsWith('md')) {
      mineralDensity = parseInt(tok.slice(2), 10) || 0;
    } else if (tok.startsWith('m') && !tok.startsWith('md')) {
      mass = parseInt(tok.slice(1), 10) || mass;
    } else if (tok.startsWith('d')) {
      densityIdx = parseInt(tok.slice(1), 10) || 0;
    } else if (tok.startsWith('a')) {
      gasIds = tok
        .slice(1)
        .split(',')
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n));
    } else if (tok.startsWith('h')) {
      hydroIdx = parseInt(tok.slice(1), 10);
    } else if (tok.startsWith('t')) {
      const tParts = tok.slice(1).split('-');
      tempMinIdx = parseInt(tParts[0], 10);
      if (isNaN(tempMinIdx)) tempMinIdx = 2;
      tempMaxIdx = tParts[1] ? parseInt(tParts[1], 10) : tempMinIdx;
      if (isNaN(tempMaxIdx)) tempMaxIdx = tempMinIdx;
    } else if (tok.startsWith('w')) {
      weatherIdx = parseInt(tok.slice(1), 10);
      if (isNaN(weatherIdx)) weatherIdx = 0;
    } else if (tok.startsWith('e')) {
      elementIds = tok
        .slice(1)
        .split(',')
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n));
    } else if (tok.startsWith('b')) {
      bioDensity = parseInt(tok.slice(1), 10) || 0;
    }
  }

  const atmosphereDensity: AtmosphereDensity = DENSITY_LEGEND[densityIdx] || 'None';
  const gases: string[] = gasIds
    .filter((id) => id !== 14) // 14: None
    .map((id) => GAS_LEGEND[id] || `Gas #${id}`);

  const hydrosphereCompound: string = HYDROSPHERE_LEGEND[hydroIdx] || 'None';
  let hydrospherePercent = 0;
  if (hydroIdx !== 10 && hydrosphereCompound !== 'None') {
    if (starX === 125 && starY === 100 && slot === 3) {
      hydrospherePercent = 25; // Arth (Arid tan world with 25% water seas)
    } else if (type === 'Liquid') {
      hydrospherePercent = 75;
    } else if (type === 'Gas Giant') {
      hydrospherePercent = 90;
    } else if (type === 'Frozen') {
      hydrospherePercent = 35;
    } else if (type === 'Molten') {
      hydrospherePercent = 20;
    } else {
      hydrospherePercent = 20;
    }
  }

  const tempMin = TEMP_LEGEND[tempMinIdx] || 'Temperate';
  const tempMax = TEMP_LEGEND[tempMaxIdx] || tempMin;
  const temperatureRange = tempMinIdx === tempMaxIdx ? tempMin : `${tempMin} to ${tempMax}`;
  const temperature = tempMaxIdx >= 4 ? tempMax : tempMinIdx <= 1 ? tempMin : 'Temperate';
  const weather: WeatherType = WEATHER_LEGEND[weatherIdx] || 'Calm';

  // Minerals list
  const uniqueElements = Array.from(new Set(elementIds));
  const minerals: { name: string; density: number }[] = uniqueElements.map((eId) => {
    const rawName = ELEMENT_LEGEND[eId] || 'Iron';
    const cleanName = rawName === 'Endurium (Fuel)' ? 'Endurium' : rawName;
    return {
      name: cleanName,
      density: mineralDensity,
    };
  });

  const hasEndurium = elementIds.includes(5) || type === 'Crystal';
  const enduriumDensity = hasEndurium ? (mineralDensity > 0 ? mineralDensity : (type === 'Crystal' ? 100 : 30)) : 0;

  const isHomeworld = starX === 125 && starY === 100 && slot === 3;

  // Derive Planet Lore Name (Secret/story names for developer panel only)
  let storyName: string | undefined = undefined;
  if (starX === 215 && starY === 86) {
    if (slot === 3 || orderIndex === 2) storyName = 'Earth (Old Empire Origin)';
    else if (slot === 4 || orderIndex === 3) storyName = 'Mars (Flux Research Outpost)';
  } else if (starX === 192 && starY === 152 && (slot === 5 || orderIndex === 0 || type === 'Crystal')) {
    storyName = 'Crystal Planet';
  } else if (starX === 55 && starY === 32 && (slot === 4 || orderIndex === 1)) {
    storyName = 'Uhlek Brain World';
  } else if (starX === 148 && starY === 63 && (slot === 4 || orderIndex === 1)) {
    storyName = 'Elan (Elowan Nursery)';
  } else if (starX === 145 && starY === 107 && (slot === 4 || orderIndex === 3)) {
    storyName = 'Heaven (Mechan Sanctuary)';
  } else if (starX === 132 && starY === 165 && (slot === 1 || orderIndex === 0)) {
    storyName = 'Sphexi (Orb Shrine)';
  } else if (starX === 175 && starY === 94 && (slot === 3 || orderIndex === 0)) {
    storyName = 'Lasthope (Noah 9 Crashsite)';
  } else if (starX === 56 && starY === 144 && (slot === 3 || orderIndex === 0)) {
    storyName = 'City of the Ancients';
  } else if (starX === 180 && starY === 120 && (slot === 4 || orderIndex === 0)) {
    storyName = 'Old Empire Base';
  } else if (starX === 180 && starY === 124 && (slot === 2 || orderIndex === 1)) {
    storyName = 'New Scotland';
  } else if (starX === 217 && starY === 88 && (slot === 2 || orderIndex === 1)) {
    storyName = 'Mardan';
  } else if (starX === 234 && starY === 20 && (slot === 4 || orderIndex === 1)) {
    storyName = 'Phlegmak (Precursor Armory)';
  }

  // Canonical play name: only Arth keeps its name, every other planet is "Planet <number>, system <x>, <y>"
  const name = isHomeworld ? 'Arth' : `Planet ${orderIndex + 1}, system ${starX}, ${starY}`;

  // Render Size & Colors
  const renderSize =
    type === 'Gas Giant'
      ? size === 'Huge' ? 20 : 16
      : size === 'Small' ? 6 : size === 'Medium' ? 10 : size === 'Large' ? 13 : 17;

  let color = '#a8a29e';
  if (isHomeworld) color = '#c29b38';
  else if (type === 'Gas Giant') color = '#fbbf24';
  else if (type === 'Liquid') color = '#38bdf8';
  else if (type === 'Frozen') color = '#7dd3fc';
  else if (type === 'Molten') color = '#ef4444';
  else if (type === 'Crystal') color = '#e879f9';

  const slotRadii = [60, 95, 135, 175, 215, 265, 315, 355];
  const orbitRadius = slotRadii[slot - 1] || (50 + slot * 40);
  const orbitSpeed = +(0.05 / Math.sqrt(slot)).toFixed(3);

  const pSeed = (starX * 73856093) ^ (starY * 19349663) ^ (slot * 83492791);
  const initialAngle = +(((pSeed >>> 0) % 628) / 100).toFixed(2);

  return {
    slot,
    orderIndex,
    name,
    storyName,
    type,
    size,
    renderSize,
    color,
    gravity,
    mass,
    orbitRadius,
    orbitSpeed,
    initialAngle,
    atmosphereDensity,
    gases,
    hydrosphereCompound,
    hydrospherePercent,
    temperature,
    temperatureRange,
    tempMin,
    tempMax,
    tempMinIndex: tempMinIdx,
    tempMaxIndex: tempMaxIdx,
    weather,
    minerals,
    mineralDensity,
    enduriumDensity,
    bioDensity,
    isHomeworld,
  };
}

// ----------------------------------------------------------------------------
// BUILD CANONICAL UNIVERSE FROM EXACT 270 STAR_LINES
// ----------------------------------------------------------------------------
export function parseAndBuildGalaxy(): { stars: GalaxyStar[]; nebulae: NebulaHaze[] } {
  const nebulae = getCanonicalNebulae();
  const parsedStars: GalaxyStar[] = [];

  for (let lineIdx = 0; lineIdx < STAR_LINES.length; lineIdx++) {
    const line = STAR_LINES[lineIdx].trim();
    if (!line) continue;

    const colonIdx = line.indexOf(':');
    const header = colonIdx !== -1 ? line.slice(0, colonIdx).trim() : line.trim();
    const planetsPart = colonIdx !== -1 ? line.slice(colonIdx + 1).trim() : '';

    const headerParts = header.split(',');
    const x = parseInt(headerParts[0], 10);
    const y = parseInt(headerParts[1], 10);
    const classRaw = headerParts[2] || 'G';
    const spectral = classRaw[0].toUpperCase() as SpectralClass;
    const inNebulaFlag = classRaw.includes('n');

    let flareDay: number | undefined = undefined;
    if (headerParts[3]) {
      const fMatch = headerParts[3].match(/f(\d+)/);
      if (fMatch) {
        flareDay = parseInt(fMatch[1], 10);
      }
    }

    const planetRawTokens = planetsPart ? planetsPart.split('|').map((s) => s.trim()).filter(Boolean) : [];
    const planets: StarPlanet[] = planetRawTokens.map((tok, orderIdx) => {
      return parsePlanetToken(x, y, orderIdx, tok);
    });

    planets.sort((a, b) => a.slot - b.slot);
    planets.forEach((p, idx) => {
      p.orderIndex = idx;
      if (p.isHomeworld) {
        p.name = 'Arth';
      } else {
        p.name = `Planet ${idx + 1}, system ${x}, ${y}`;
      }
    });

    const isNeb = inNebulaFlag || nebulae.some((n) => Math.hypot(x - n.x, y - n.y) <= n.radius);
    const color = SPECTRAL_COLORS[spectral] || '#ffffff';
    const size =
      spectral === 'O' ? 5 :
      spectral === 'B' ? 4.5 :
      spectral === 'A' ? 4 :
      spectral === 'F' ? 3.5 :
      spectral === 'G' ? 3.5 :
      spectral === 'K' ? 3 : 2.5;

    let starName = `System [${x}, ${y}]`;
    if (x === 125 && y === 100) starName = 'Arth System';
    else if (x === 215 && y === 86) starName = 'Sol System';
    else if (x === 192 && y === 152) starName = 'Crystal Sun';
    else if (x === 55 && y === 32) starName = 'Uhlek Brain System';
    else if (x === 148 && y === 63) starName = 'Elan System';
    else if (x === 145 && y === 107) starName = 'Heaven System';
    else if (x === 132 && y === 165) starName = 'Sphexi System';
    else if (x === 175 && y === 94) starName = 'Lasthope System';
    else if (x === 56 && y === 144) starName = 'City of the Ancients System';

    parsedStars.push({
      id: 0, // Assigned below
      x,
      y,
      name: starName,
      spectral,
      color,
      size,
      flareDay,
      hasFlared: false,
      inNebula: isNeb,
      planets,
    });
  }

  // Ensure Arth at [125, 100] is star #1 so all Starport operations start at Arth
  const arthIndex = parsedStars.findIndex((s) => s.x === 125 && s.y === 100);
  let sortedStars: GalaxyStar[] = [];
  if (arthIndex !== -1) {
    const arth = parsedStars[arthIndex];
    sortedStars = [arth, ...parsedStars.slice(0, arthIndex), ...parsedStars.slice(arthIndex + 1)];
  } else {
    sortedStars = parsedStars;
  }

  sortedStars.forEach((star, idx) => {
    star.id = idx + 1;
  });

  return { stars: sortedStars, nebulae };
}

export const UNIVERSE = parseAndBuildGalaxy();

if (typeof console !== 'undefined') {
  const planetCount = UNIVERSE.stars.reduce((acc, s) => acc + s.planets.length, 0);
  console.log(`[Galaxy Engine] Initialized ${UNIVERSE.stars.length} stars, ${planetCount} planets, ${UNIVERSE.nebulae.length} nebulae, ${CONTINUUM_FLUX_PAIRS.length} flux links.`);
}

export function isInsideNebula(x: number, y: number, starInNebulaFlag?: boolean): boolean {
  if (starInNebulaFlag) return true;
  return UNIVERSE.nebulae.some((neb) => Math.hypot(x - neb.x, y - neb.y) <= neb.radius);
}

export function getPlanetPlayName(p: StarPlanet, starX: number, starY: number): string {
  if (p.isHomeworld || (starX === 125 && starY === 100 && (p.name.toLowerCase().includes('arth') || p.slot === 3))) {
    return 'Arth';
  }
  const planetNum = p.orderIndex !== undefined ? p.orderIndex + 1 : p.slot;
  return `Planet ${planetNum}, system ${starX}, ${starY}`;
}
