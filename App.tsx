import { renderGameInterface } from './GameInterface';
import {BayVideoPlayer} from './utils/bay-video';
import CrewTraining from './components/CrewTraining';
import BridgeLogFilters from './components/BridgeLogFilters';
import {planCrewTraining,generateCrewName,NAME_POOLS,assignmentVoiceLine,concourseDanceFrame,CONCOURSE_DANCE_DELAY,isConcourseMoveKey,filterBridgeMessages,type NameSource} from './utils/personnel';
import {drawSensorSweep} from './utils/scan-effects';
import {starmapView} from './utils/starmap-view';
import {clampGroundZoom,groundShipAnchor,returnToShipAvailable,surfacePickupAvailable,miningActionAvailable} from './utils/surface-presentation';
import {projectedPlanetTexture} from './utils/planet-globe-renderer';
import {drawPlanetWeather,drawPlanetAtmosphere} from './utils/planet-weather';
import {drawOrbitShip} from './utils/orbit-ship-renderer';
import {advanceSystemFlight,systemPlanetPosition,groundShipLabelPosition,hyperspaceArrival} from './utils/system-flight';
import {landingMapBounds,landingMapPoint,orbitHullLighting} from './utils/map-presentation';
import {allocateCrewPortrait,normalizeCrewPortraits,crewPortraitPath,crewPortraitId} from './utils/crew-portraits';
import SurveyPanel from './components/SurveyPanel';
import SurveyLegend from './components/SurveyLegend';
import {planetTopography,ELEVATION_COLORS,prepareTerrainArt} from './utils/planet-topography';
import ShipDiagnostics from './components/ShipDiagnostics';
import {surveyPlanet,visibleSurveyContacts,rememberLocalContacts,drawSurveyContacts,localContactPosition} from './utils/planet-survey';
import {diagnosticStatus} from './utils/ship-diagnostics';
import {drawConfiguredShip,prepareConfiguredShip,configuredLaserEmitters} from './utils/ship-art';
import {shipExhaustNozzles} from './utils/space-rendering';
import {BAY_LAUNCH_SECONDS,cinematicProgress} from './utils/bay-flight';
import {drawBayDeparture,prepareBay,bayReady} from './utils/bay-renderer';
import {drawLandingGear,drawLandingRamp} from './utils/landing-gear';
import { MINERAL_CATALOG, marketCommodities, clampPurchaseQuantity, saleQuantity, interestCheckpoint, type TradeCommodity } from './utils/economy';
import {encounterDriveStep,stoppedEncounterDrive,enginesAvailable} from './utils/encounter-drive';
import { thrynnFuelOffer, exchangeArtifactForFuel, payFuelTribute } from './utils/diplomacy-rules';
import {newDroneChallenge,answerDroneNumber,advanceDroneChallenge,denyDroneOrbit} from './utils/drone';
import { restoreSettings, scenePixelRatio, type GameSettings, type GraphicsQuality } from './utils/settings';
import { encodeSaveToBase64, decodeSaveFromBase64, parseSaveJSON, parseSaveManifest, restorableSaveSlot, type ExportSavePayload } from './utils/save-codec';
import {importTextWithinBudget,MAX_SAVE_FILE_BYTES} from './utils/save-validation';
import {boundedGridIndices,saveRenderCoordinatesAreSafe} from './utils/render-safety';
// tslint:disable
/* eslint-disable */
import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Play,
  RotateCw,
  Pause,
  Compass,
  Rocket,
  Shield,
  Zap,
  Radio,
  Building,
  Users,
  Coins,
  DollarSign,
  Briefcase,
  Layers,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  Crosshair,
  Database,
  Globe,
  Sliders,
  Sparkles,
  Award,
  ArrowLeft,
  ArrowRight,
  LogOut,
  FileText,
  Check,
  X,
  Plus,
  Trash2,
  Edit3,
  Search,
  ShoppingCart,
  Anchor,
  UserCheck,
  Info,
  Activity,
  Navigation,
  Eye,
  Heart,
  Cpu,
  MapPin,
  Maximize2,
  Clock,
  CheckSquare,
  Truck,
  Flame,
  Target,
  MessageSquare,
  ShieldAlert,
  Package,
  Gift,
  ShieldCheck,
  Crosshair as CrosshairIcon,
  Sun,
  Bomb,
  RadioTower,
  Key,
  Award as TrophyIcon,
  Wrench,
  Fuel,
  Settings as SettingsIcon,
  Tv,
  Monitor,
  Volume1,
  Sparkle,
  Lock,
  Unlock,
  GraduationCap,
  HardDrive,
  Box,
  FastForward,
  Terminal,
  Download,
  Upload,
  Copy,
} from 'lucide-react';
import { getConfig } from './constants';
import { useFrameState } from './utils/frame-state';
import { advanceSurfaceWeather, surfaceWeatherKind, type SurfaceWeatherParticle } from './utils/surface-weather';
import { adjustCargoStock, canRemoveCargoPod, consumeFuel, fitCargo, isCrystalArtifact, newMissionDestination, planetKey, roverCommand, shipCargoVolume, survivingPlanets } from './utils/gameplay-rules';
import { createSafeStorage } from './utils/storage';
import { projectileArrival, resolveShipHit } from './utils/combat-rules';
import { advanceHealth, repairPercentageRate, crewHealingRate, fieldRepairCost, bestActingOfficer, assignedCrew } from './utils/maintenance';
import { advanceLifeform, stunnerTarget, recoverRuinArtifact, recoveredCargo, landingRequirements } from './utils/surface-rules';
import { refillPlanetSurface, returnArtifactToSite } from './utils/surface-progress';
import { initialArtifactStock, depotSale, buyDepotArtifact, limitArtifactStock, type DepotArtifact } from './utils/artifact-shop';
import {drawCelExplosion,drawMiningBeam,roverMuzzle,tintedSprite,wildlifeRotation,drawWalkingWildlife,drawGroundTile} from './utils/visual-effects';
import {MINING_RANGE,miningStep,type MiningSession} from './utils/mining';
import MiningConsole from './components/MiningConsole';
import PlanetarySensors from './components/PlanetarySensors';
import {captureAlienScan,alienSensorText,alienAnalysis,scienceContext,visibleScienceReading,type AlienSensorScan,type ScienceReading} from './utils/science-sensors';
import {beginPlanetScan,advancePlanetScan,analyzePlanetScan,scanReady,scanPlanetKey,planetAnalysisFields,planetSensorSummary,type PlanetaryScanState} from './utils/planet-scans';
import { copyMissionSlot, sameMissionVersion } from './utils/save-actions';
import { lifeformTraits, resolveWildlifeAttack, recordLifeform, emptySurveyKnowledge, RECORDING_SECONDS, RECORDING_ENERGY, RECORDING_RANGE, recordingFollowTarget, type SurveyKnowledge, type SurfaceRecording } from './utils/wildlife';
import { surfaceCoordinates } from './utils/planet-coordinates';
import { advanceCrystalHeat } from './utils/crystal-heat';
import { releaseNotices } from './utils/notices';
import { advanceDetonation, detonationResult, type DetonationTarget, type DetonationSequence } from './utils/detonation';
import { interpolatePosition, projectedOrbitTexture, starAppearance, systemShipLength, orbitShipSize, hyperspaceShipSize, tacticalCameraTarget } from './utils/space-rendering';
import {GameMusic} from './components/GameMusic';
import {recordedScoreForTheme} from './utils/soundtrack';
import {selectMusicTheme} from './utils/music-state';
import {
  createFixedStepper,
  drawAsset,
  drawBackground,
  drawUnifiedPlayerShip,
  Entity,
  formatTime,
  gameAudio,
  GameState,
  getUnsharpMaskCanvas,
  MenuOverlay,
  Overlay,
  prepareCanvas,
  useAssets,
  useAutoFocus,
  useInput,
  useIsMobile,
  type UnifiedPlayerShipConfig,
} from './utils/helper';
import {
  usePlayground,
  usePlaygroundGameLifecycle,
} from './utils/usePlayground';
import {
  ALIEN_TERRITORIES,
  AtmosphereDensity,
  CONTINUUM_FLUX_PAIRS,
  GalaxyStar,
  isInsideNebula,
  NebulaHaze,
  PlanetType,
  SPECTRAL_COLORS,
  SpectralClass,
  StarPlanet,
  UNIVERSE,
} from './galaxy';
import {
  ArtifactData,
  CANONICAL_ARTIFACTS,
  DroppedCargoItem,
  generatePlanetSurface,
  preparePlanetSurface,
  getSurfaceElevation,
  LifeformSpecimen,
  MineralDeposit,
  PlanetSurfaceState,
  RUIN_LORE_DATABASE,
  SurfaceRuin,
  TerrainElevation,
} from './surface';
import {
  AlienCommsState,
  AlienGroup,
  AlienRace,
  AlienShip,
  calculateTranslationStrength,
  CANONICAL_ALIEN_LINES,
  COMM_LINES,
  selectCommLine,
  resolveSubjectId,
  resolveRaceId,
  formatCommText,
  selectPlayerCommLine,
  formatPlayerQuestionLine,
  globalCommLineUsage,
  resetCommLineUsage,
  createAlienShip,
  DEFAULT_BASE_MOODS,
  DialogueLine,
  DialogueSubject,
  DiplomaticPosture,
  generateAlienGroups,
  LootItem,
  QuestionPrompt,
  TacticalProjectile,
  TradeOffer,
  translateAlienDialogue,
  VesselClass,
} from './alien';
import { distressCallPass, DISTRESS_PASS_SECONDS, updateFleetSurrender, fleetPosture, markFleetAttacked, fleetCanFire, beginFleetVisit } from './utils/reinforcements';
import { flightEncounter, trackFleets } from './utils/encounters';
import { selectFleetCommLine } from './utils/fleet-comms';
import {ALIEN_PERSONALITIES,moodDecides,encounterDisposition,postureMoodEffect,rememberedRaceMood,phraseLimit,impatientMoodDelta,alienQuestionDelta,originalCommCandidates,questionWait,newConversationClock,afterPlayerPhrase,playerDiplomaticStrength,alienDiplomaticStrength,clampMood} from './utils/communications';
import {restoreConversationClock,closeConversation,hailPostureEffect,playerPhraseEffect,nextUnansweredHail,responseSubject,nextLoreLine,nextTransmission,conversationEvent} from './utils/communications';

import {
  BanterEventType,
  banterEngine,
  generateColonyEvaluationPaperwork,
  generateInterstelTowingInvoice,
  getRandomCaptainAside,
  CAPTAIN_ASIDES,
  MILESTONE_MEMOS,
  DOCKER_NICKNAMES,
} from './banter';
import {
  alienVoice,
  playAlienVoice,
  stopAlienVoice,
  stopVoice,
  stopAllVoices,
  voiceEngine,
  playCrewVoice,
  playCrewBanter,
  playCrewBanterVoice,
  stopCrewVoice,
} from './voice';

// Asset manifest
const ASSETS_MANIFEST: Record<string, string> = {
  planet_gas_giant: 'assets/images/planet_gas_giant.png',
  planet_map_rock_a: 'assets/images/planet_map_rock_a.png',
  planet_map_rock_b: 'assets/images/planet_map_rock_b.png',
  planet_map_frozen_a: 'assets/images/planet_map_frozen_a.png',
  planet_map_frozen_b: 'assets/images/planet_map_frozen_b.png',
  planet_map_liquid_a: 'assets/images/planet_map_liquid_a.png',
  planet_map_liquid_b: 'assets/images/planet_map_liquid_b.png',
  planet_map_molten_a: 'assets/images/planet_map_molten_a.png',
  planet_map_molten_b: 'assets/images/planet_map_molten_b.png',
  planet_map_gas_a: 'assets/images/planet_map_gas_a.png',
  planet_map_gas_b: 'assets/images/planet_map_gas_b.png',
  planet_map_crystal: 'assets/images/planet_map_crystal.png',
  planet_map_arth: 'assets/images/planet_map_arth.png',
  starport_space_bg: 'assets/images/starport_space_bg.png',
  starport_concourse_closed: 'assets/images/new_asset_1792541948891.png',
  starport_concourse_open: 'assets/images/new_asset_1792541948891.png',
  starport_concourse_closed_7doors: 'assets/images/new_asset_1792541948891.png',
  starport_concourse_open_7doors: 'assets/images/new_asset_1792541948891.png',
  starport_concourse_main_view: 'assets/images/new_asset_1792541948891.png',
  starport_concourse_isometric: 'assets/images/new_asset_1792541948891.png',
  starport_concourse_chosen: 'assets/images/new_asset_1792541948891.png',
  new_asset_1792541948891: 'assets/images/new_asset_1792541948891.png',
  new_asset_1792539403093: 'assets/images/new_asset_1792541948891.png',
  ship_config_hangar_isometric: 'assets/images/ship_config_hangar_isometric.png',
  astronaut_avatar_sprite: 'assets/images/astronaut_avatar_sprite.png',
  astronaut_topdown_spritesheet: 'assets/images/astronaut_topdown_spritesheet.png',
  astronaut_run_spritesheet: 'assets/images/astronaut_run_spritesheet.png',
  astronaut_run_down_spritesheet: 'assets/images/astronaut_run_down_spritesheet.png',
  astronaut_run_up_spritesheet: 'assets/images/astronaut_run_up_spritesheet.png',
  ship_hull_bare_topdown: 'assets/images/ship_hull_bare_topdown.png',
  ship_hull_bare_topdown_1k: 'assets/images/ship_hull_bare_topdown_1k.png',
  ship_cargo_pod_sprite: 'assets/images/ship_cargo_pod_sprite.png',
  starport_door_open_sprite: 'assets/images/starport_door_open_sprite.png',
  room_operations_bg: 'assets/images/room_operations_bg.png',
  room_personnel_bg: 'assets/images/room_personnel_bg.png',
  room_crew_assignment_bg: 'assets/images/room_crew_assignment_bg.png',
  room_bank_bg: 'assets/images/room_bank_bg.png',
  room_ship_config_bg: 'assets/images/room_ship_config_bg.png',
  room_trade_depot_bg: 'assets/images/room_trade_depot_bg.png',
  room_docking_bay_bg: 'assets/images/room_docking_bay_bg.png',
  alien_ship_elowan_scout: 'assets/images/alien_ship_elowan_scout.png',
  alien_ship_elowan_transport: 'assets/images/alien_ship_elowan_transport.png',
  alien_ship_elowan_warship: 'assets/images/alien_ship_elowan_warship.png',
  alien_ship_thrynn_scout: 'assets/images/alien_ship_thrynn_scout.png',
  alien_ship_thrynn_transport: 'assets/images/alien_ship_thrynn_transport.png',
  alien_ship_thrynn_warship: 'assets/images/alien_ship_thrynn_warship.png',
  alien_ship_veloxi_scout: 'assets/images/alien_ship_veloxi_scout.png',
  alien_ship_veloxi_transport: 'assets/images/alien_ship_veloxi_transport.png',
  alien_ship_veloxi_warship: 'assets/images/alien_ship_veloxi_warship.png',
  alien_ship_veloxi_drone: 'assets/images/alien_ship_veloxi_drone.png',
  alien_ship_spemin_scout: 'assets/images/alien_ship_spemin_scout.png',
  alien_ship_spemin_transport: 'assets/images/alien_ship_spemin_transport.png',
  alien_ship_spemin_warship: 'assets/images/alien_ship_spemin_warship.png',
  alien_ship_gazurtoid_scout: 'assets/images/alien_ship_gazurtoid_scout.png',
  alien_ship_gazurtoid_warship: 'assets/images/alien_ship_gazurtoid_warship.png',
  alien_ship_uhlek_scout: 'assets/images/alien_ship_uhlek_scout.png',
  alien_ship_uhlek_warship: 'assets/images/alien_ship_uhlek_warship.png',
  alien_ship_mechan_scout: 'assets/images/alien_ship_mechan_scout.png',
  alien_ship_mysterion: 'assets/images/alien_ship_mysterion.png',
  alien_ship_nomad_probe: 'assets/images/alien_ship_nomad_probe.png',
  alien_ship_minstrel: 'assets/images/alien_ship_minstrel.png',
  alien_ship_noah9_derelict: 'assets/images/alien_ship_noah9_derelict.png',
  alien_ship_wreck_sprite: 'assets/images/alien_ship_wreck_sprite.png',
  portrait_elowan_diplomat: 'assets/images/portrait_elowan_diplomat.png',
  portrait_thrynn_diplomat: 'assets/images/portrait_thrynn_diplomat.png',
  portrait_spemin_diplomat: 'assets/images/portrait_spemin_diplomat.png',
  portrait_gazurtoid_diplomat: 'assets/images/portrait_gazurtoid_diplomat.png',
  portrait_veloxi_diplomat: 'assets/images/portrait_veloxi_diplomat.png',
  portrait_mechan_diplomat: 'assets/images/portrait_mechan_diplomat.png',
  portrait_human: 'assets/images/crew_human_atlas.webp',
  portrait_velox: 'assets/images/crew_velox_atlas.webp',
  portrait_thrynn: 'assets/images/crew_thrynn_atlas.webp',
  portrait_elowan: 'assets/images/crew_elowan_atlas.webp',
  portrait_android: 'assets/images/crew_android_atlas.webp',
  space_bg_a: 'assets/images/space_bg_a.png',
  space_bg_b: 'assets/images/space_bg_b.png',
  space_bg_c: 'assets/images/space_bg_c.png',
  space_bg_d: 'assets/images/space_bg_d.png',
  nebula_cloud_a: 'assets/images/nebula_cloud_a.png',
  nebula_cloud_b: 'assets/images/nebula_cloud_b.png',
  ground_texture_rock: 'assets/images/ground_texture_rock.png',
  ground_texture_frozen: 'assets/images/ground_texture_frozen.png',
  ground_texture_molten: 'assets/images/ground_texture_molten.png',
  ground_texture_shore: 'assets/images/ground_texture_shore.png',
  terrain_vehicle_topdown: 'assets/images/terrain_vehicle_topdown.png',
  mineral_deposit_sprite: 'assets/images/mineral_deposit_sprite.png',
  ship_landed_topdown: 'assets/images/ship_landed_topdown.png',
  ruin_old_empire_sprite: 'assets/images/ruin_old_empire_sprite.png',
  ruin_ancient_precursor_sprite: 'assets/images/ruin_ancient_precursor_sprite.png',
  lifeform_grazer_sprite: 'assets/images/lifeform_grazer_sprite.png',
  lifeform_hunter_sprite: 'assets/images/lifeform_hunter_sprite.png',
  lifeform_floater_sprite: 'assets/images/lifeform_floater_sprite.png',
  lifeform_crawler_sprite: 'assets/images/lifeform_crawler_sprite.png',
  cinematic_title_scene: 'assets/images/cinematic_title_scene.png',
  title_scene_image_16_9: 'assets/images/title_scene_image_16_9.png',
  title_scene_image_4_3: 'assets/images/title_scene_image_4_3.png',
  cinematic_docking_bay_launch: 'assets/images/cinematic_docking_bay_launch.png',
  cinematic_docking_bay_img: 'assets/images/cinematic_docking_bay_img.png',
  cinematic_atmospheric_descent: 'assets/images/cinematic_atmospheric_descent.png',
  cinematic_atmospheric_descent_img: 'assets/images/cinematic_atmospheric_descent_img.png',
  cinematic_landing_site_dusk: 'assets/images/cinematic_landing_site_dusk.png',
  cinematic_landing_site_img: 'assets/images/cinematic_landing_site_img.png',
  cinematic_victory_bridge: 'assets/images/cinematic_victory_bridge.png',
  cinematic_victory_bridge_img: 'assets/images/cinematic_victory_bridge_img.png',
  cinematic_memorial_viewport: 'assets/images/cinematic_memorial_viewport.png',
  cinematic_memorial_viewport_img: 'assets/images/cinematic_memorial_viewport_img.png',
};

const ROOM_BACKDROP_PATHS: Record<number, string> = {
  0: 'assets/images/room_operations_bg.png',
  1: 'assets/images/room_personnel_bg.png',
  2: 'assets/images/room_crew_assignment_bg.png',
  3: 'assets/images/room_bank_bg.png',
  4: 'assets/images/room_ship_config_bg.png',
  5: 'assets/images/room_trade_depot_bg.png',
  6: 'assets/images/room_docking_bay_bg.png',
};

// ----------------------------------------------------------------------------
// DATA TYPES & MODEL DEFINITIONS
// ----------------------------------------------------------------------------

// Cached seamless textures for planetary sphere rendering with zero seam artifacts
const seamlessTextureCache = new WeakMap<HTMLImageElement, HTMLCanvasElement>();

function getSeamlessPlanetTexture(img: HTMLImageElement): HTMLCanvasElement {
  const cached = seamlessTextureCache.get(img);
  if (cached && cached.width === img.naturalWidth && cached.height === img.naturalHeight) {
    return cached;
  }
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(img, 0, 0);

  // Feather the right edge into the left edge across an 8-16px margin so x=0 and x=imgW blend smoothly
  const blendW = Math.min(16, Math.max(4, Math.floor(img.naturalWidth / 16)));
  if (blendW > 0 && img.naturalWidth > blendW * 2) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = blendW;
    tempCanvas.height = img.naturalHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(img, 0, 0, blendW, img.naturalHeight, 0, 0, blendW, img.naturalHeight);
      ctx.save();
      for (let i = 0; i < blendW; i++) {
        const alpha = (i + 1) / (blendW + 1);
        ctx.globalAlpha = alpha;
        ctx.drawImage(tempCanvas, i, 0, 1, img.naturalHeight, img.naturalWidth - blendW + i, 0, 1, img.naturalHeight);
      }
      ctx.globalAlpha = 1.0;
      ctx.drawImage(canvas, img.naturalWidth - 1, 0, 1, img.naturalHeight, 0, 0, 1, img.naturalHeight);
      ctx.restore();
    }
  }

  seamlessTextureCache.set(img, canvas);
  return canvas;
}

export interface DetectedFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

const spriteFrameCache = new Map<string, DetectedFrame[]>();

export function detectSpriteSheetFrames(img: HTMLImageElement | null | undefined): DetectedFrame[] {
  if (!img || !img.complete || img.naturalWidth <= 0 || img.naturalHeight <= 0) {
    return [];
  }
  const key = img.src || `${img.naturalWidth}x${img.naturalHeight}`;
  const existing = spriteFrameCache.get(key);
  if (existing) return existing;

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  if (typeof document === 'undefined') return [];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  ctx.drawImage(img, 0, 0);

  let imgData: ImageData;
  try {
    imgData = ctx.getImageData(0, 0, w, h);
  } catch (e) {
    console.warn('[SpriteDetector] Could not read image data:', e);
    return [];
  }
  const data = imgData.data;

  // Step 1: Scan rows to find non-transparent rows
  const rowHasContent = new Uint8Array(h);
  for (let y = 0; y < h; y++) {
    const rowOffset = y * w * 4;
    for (let x = 0; x < w; x += 4) {
      if (data[rowOffset + x * 4 + 3] > 15) {
        rowHasContent[y] = 1;
        break;
      }
    }
  }

  // Find all horizontal bands separated by fully transparent rows
  const bands: { minY: number; maxY: number }[] = [];
  let inBand = false;
  let bandStart = 0;
  for (let y = 0; y < h; y++) {
    if (rowHasContent[y]) {
      if (!inBand) {
        inBand = true;
        bandStart = y;
      }
    } else {
      if (inBand) {
        inBand = false;
        if (y - bandStart >= 16) {
          bands.push({ minY: bandStart, maxY: y - 1 });
        }
      }
    }
  }
  if (inBand && h - bandStart >= 16) {
    bands.push({ minY: bandStart, maxY: h - 1 });
  }

  // Select the bottom-most band of non-transparent rows
  const bottomBand = bands.length > 0 ? bands[bands.length - 1] : { minY: 0, maxY: h - 1 };
  const bandMinY = bottomBand.minY;
  const bandMaxY = bottomBand.maxY;
  const bandH = bandMaxY - bandMinY + 1;

  // Step 2: Scan columns within that bottom-most band
  const colHasContent = new Uint8Array(w);
  for (let x = 0; x < w; x++) {
    for (let y = bandMinY; y <= bandMaxY; y += 4) {
      if (data[(y * w + x) * 4 + 3] > 15) {
        colHasContent[x] = 1;
        break;
      }
    }
  }

  // Find column segments separated by transparent columns
  const segments: { minX: number; maxX: number }[] = [];
  let inCol = false;
  let colStart = 0;
  for (let x = 0; x < w; x++) {
    if (colHasContent[x]) {
      if (!inCol) {
        inCol = true;
        colStart = x;
      }
    } else {
      if (inCol) {
        inCol = false;
        if (x - colStart >= 10) {
          segments.push({ minX: colStart, maxX: x - 1 });
        }
      }
    }
  }
  if (inCol && w - colStart >= 10) {
    segments.push({ minX: colStart, maxX: w - 1 });
  }

  let rawFrameRanges: { minX: number; maxX: number; minY: number; maxY: number }[] = [];
  if (segments.length >= 4) {
    rawFrameRanges = segments.map((seg) => ({
      minX: seg.minX,
      maxX: seg.maxX,
      minY: bandMinY,
      maxY: bandMaxY,
    }));
  } else {
    // If columns do not have transparent gaps, divide uniformly across the band
    const estimatedFrames = w >= 4096 ? 16 : Math.max(4, Math.round(w / Math.max(1, bandH)));
    const frameSlotW = w / estimatedFrames;
    for (let i = 0; i < estimatedFrames; i++) {
      rawFrameRanges.push({
        minX: Math.floor(i * frameSlotW),
        maxX: Math.floor((i + 1) * frameSlotW) - 1,
        minY: bandMinY,
        maxY: bandMaxY,
      });
    }
  }

  // Compute tight bounding boxes of actual non-transparent pixels in each frame range
  const frames: DetectedFrame[] = [];
  for (const range of rawFrameRanges) {
    let topY = range.maxY;
    let bottomY = range.minY;
    let leftX = range.maxX;
    let rightX = range.minX;
    let found = false;

    for (let y = range.minY; y <= range.maxY; y++) {
      const rowOffset = y * w * 4;
      for (let x = range.minX; x <= range.maxX; x++) {
        if (data[rowOffset + x * 4 + 3] > 15) {
          found = true;
          if (y < topY) topY = y;
          if (y > bottomY) bottomY = y;
          if (x < leftX) leftX = x;
          if (x > rightX) rightX = x;
        }
      }
    }

    if (found && bottomY >= topY && rightX >= leftX && (bottomY - topY) >= 10) {
      frames.push({
        x: leftX,
        y: topY,
        width: rightX - leftX + 1,
        height: bottomY - topY + 1,
      });
    }
  }

  const finalFrames = frames.length >= 4 ? frames : rawFrameRanges.map((r) => ({
    x: r.minX,
    y: r.minY,
    width: r.maxX - r.minX + 1,
    height: r.maxY - r.minY + 1,
  }));

  spriteFrameCache.set(key, finalFrames);
  return finalFrames;
}

export interface PreparedRunCycle {
  side: HTMLCanvasElement[];
  up: HTMLCanvasElement[];
  down: HTMLCanvasElement[];
}

export const globalPreparedRunCanvases: PreparedRunCycle = {
  side: [],
  up: [],
  down: [],
};

const runCanvasesCache = new WeakMap<HTMLImageElement, HTMLCanvasElement[]>();

export function getPreparedRunCanvases(img: HTMLImageElement | null | undefined): HTMLCanvasElement[] {
  if (!img || !img.complete || img.naturalWidth <= 0 || img.naturalHeight <= 0) {
    return [];
  }
  const existing = runCanvasesCache.get(img);
  if (existing && existing.length > 0) return existing;

  const frames = detectSpriteSheetFrames(img);
  if (!frames || frames.length === 0) return [];

  const maxFrameH = Math.max(...frames.map((f) => f.height));
  if (maxFrameH <= 0) return [];

  const targetCanvasH = 132;
  const scale = targetCanvasH / maxFrameH;

  const result: HTMLCanvasElement[] = [];
  for (const f of frames) {
    const drawW = Math.max(1, Math.round(f.width * scale));
    const drawH = Math.max(1, Math.round(f.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = drawW;
    canvas.height = targetCanvasH;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, f.x, f.y, f.width, f.height, 0, targetCanvasH - drawH, drawW, drawH);
      result.push(canvas);
    }
  }

  runCanvasesCache.set(img, result);
  return result;
}

/**
 * Renders player starship on Launch Gantry & Ship Configuration with High-DPI backing store,
 * uniform aspect-ratio preservation (~1087:602 ~ 1.8:1), proper centering and margins.
 */

// Module-level cache of offscreen armor tile canvases per armorClass (1 to 5)
const cachedArmorTileCanvases = new Map<number, HTMLCanvasElement>();
let cachedArmorHullImg: any = null;
let cachedSweepCanvas: HTMLCanvasElement | null = null;

export function getCachedArmorTileCanvas(
  arg1: HTMLImageElement | number | null | undefined,
  arg2: HTMLImageElement | number | null | undefined,
): HTMLCanvasElement | null {
  const hullImg = (arg1 && typeof arg1 === 'object') ? arg1 as HTMLImageElement : (arg2 && typeof arg2 === 'object') ? arg2 as HTMLImageElement : null;
  const armorClass = typeof arg1 === 'number' ? arg1 : typeof arg2 === 'number' ? arg2 : 0;
  if (armorClass <= 0 || !hullImg) return null;

  if (hullImg.complete && hullImg.naturalWidth > 0 && cachedArmorHullImg === hullImg && cachedArmorTileCanvases.has(armorClass)) {
    return cachedArmorTileCanvases.get(armorClass) || null;
  }

  if (hullImg.complete && hullImg.naturalWidth > 0) {
    cachedArmorTileCanvases.clear();
    cachedArmorHullImg = hullImg;
  }

  if (typeof document === 'undefined') return null;

  const W = (hullImg.naturalWidth > 0) ? hullImg.naturalWidth : 1087;
  const H = (hullImg.naturalHeight > 0) ? hullImg.naturalHeight : 602;
  const cx = W / 2; // 543.5
  const cy = H / 2; // 301
  const engineCutoffX = cx - 0.39 * W; // ~119.57

  // Read pixel data to create exact armorable hull mask
  const offscreen = document.createElement('canvas');
  offscreen.width = W;
  offscreen.height = H;
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!offCtx) return null;

  let imgData: ImageData | null = null;
  if (hullImg.complete && hullImg.naturalWidth > 0) {
    try {
      offCtx.drawImage(hullImg, 0, 0, W, H);
      imgData = offCtx.getImageData(0, 0, W, H);
    } catch (e) {
      // If getImageData fails due to CORS or security, fallback to shape mask
    }
  }

  const isArmorablePixel = (px: number, py: number): boolean => {
    if (px < 0 || px >= W || py < 0 || py >= H) return false;
    if (px < engineCutoffX) return false; // engines excluded
    if (!imgData) {
      const nx = (px - cx) / (W * 0.44);
      const ny = (py - cy) / (H * 0.44);
      return nx * nx + ny * ny <= 1.0 && px <= W * 0.95;
    }
    const idx = (py * W + px) * 4;
    const a = imgData.data[idx + 3];
    if (a <= 40) return false;
    const r = imgData.data[idx];
    const g = imgData.data[idx + 1];
    const b = imgData.data[idx + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum < 64) return false; // dark vents, nozzles, windows stay visible
    return true;
  };

  interface TileInfo {
    gx: number;
    gy: number;
    centerX: number;
    centerY: number;
  }

  const validTiles: TileInfo[] = [];

  // Rows symmetric around centerline cy = 301:
  // Row 0 below centerline: gy = 302 (tile is 302..323)
  // Row -1 above centerline: gy = 278 (tile is 278..299)
  // 2-pixel grout line at [300, 301]
  const rowList: number[] = [];
  for (let gy = 302; gy + 22 <= H; gy += 24) rowList.push(gy);
  for (let gy = 278; gy >= 0; gy -= 24) rowList.push(gy);

  for (let gx = 0; gx + 22 <= W; gx += 24) {
    for (const gy of rowList) {
      let armorableCount = 0;
      for (let py = gy; py < gy + 22; py++) {
        for (let px = gx; px < gx + 22; px++) {
          if (isArmorablePixel(px, py)) {
            armorableCount++;
          }
        }
      }

      // A tile counts if at least 60% of its 22x22 area (484) is armorable hull
      if (armorableCount / 484 >= 0.60) {
        validTiles.push({
          gx,
          gy,
          centerX: gx + 11,
          centerY: gy + 11,
        });
      }
    }
  }

  // Order valid tiles from nose backwards: largest x first; on equal x, closest to centerline first
  validTiles.sort((a, b) => {
    if (b.centerX !== a.centerX) {
      return b.centerX - a.centerX;
    }
    const distA = Math.abs(a.centerY - cy);
    const distB = Math.abs(b.centerY - cy);
    if (distA !== distB) {
      return distA - distB;
    }
    return a.gy - b.gy;
  });

  const totalTiles = validTiles.length;

  // Mask canvas for cutting tiles with destination-in
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = W;
  maskCanvas.height = H;
  const maskCtx = maskCanvas.getContext('2d');
  if (maskCtx) {
    if (imgData) {
      const maskData = maskCtx.createImageData(W, H);
      for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
          const idx = (py * W + px) * 4;
          if (isArmorablePixel(px, py)) {
            maskData.data[idx] = 255;
            maskData.data[idx + 1] = 255;
            maskData.data[idx + 2] = 255;
            maskData.data[idx + 3] = 255;
          } else {
            maskData.data[idx + 3] = 0;
          }
        }
      }
      maskCtx.putImageData(maskData, 0, 0);
    } else {
      maskCtx.fillStyle = '#ffffff';
      maskCtx.beginPath();
      maskCtx.ellipse(cx, cy, W * 0.44, H * 0.44, 0, 0, Math.PI * 2);
      maskCtx.fill();
    }
  }

  const classColors: Record<number, { r: number; g: number; b: number }> = {
    1: { r: 148, g: 163, b: 184 }, // #94a3b8 steel grey
    2: { r: 100, g: 116, b: 139 }, // #64748b slate
    3: { r: 192, g: 132, b: 252 }, // #c084fc violet
    4: { r: 56, g: 189, b: 248 },  // #38bdf8 sky blue
    5: { r: 250, g: 204, b: 21 },  // #facc15 gold
  };

  const gunmetal = { r: 30, g: 41, b: 59 }; // #1e293b

  for (let cl = 1; cl <= 5; cl++) {
    const tileCount = cl === 5 ? totalTiles : Math.round(totalTiles * cl * 0.2);
    const chosenTiles = validTiles.slice(0, tileCount);

    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = W;
    tileCanvas.height = H;
    const tCtx = tileCanvas.getContext('2d');
    if (!tCtx) continue;

    tCtx.globalAlpha = 0.90;

    // Dark grout lines (#0f172a at 70%)
    tCtx.fillStyle = 'rgba(15, 23, 42, 0.70)';
    for (const t of chosenTiles) {
      tCtx.fillRect(t.gx - 1, t.gy - 1, 24, 24);
    }

    const cCol = classColors[cl] || classColors[1];
    const baseR = Math.round(cCol.r * 0.55 + gunmetal.r * 0.45);
    const baseG = Math.round(cCol.g * 0.55 + gunmetal.g * 0.45);
    const baseB = Math.round(cCol.b * 0.55 + gunmetal.b * 0.45);

    for (let i = 0; i < chosenTiles.length; i++) {
      const t = chosenTiles[i];
      const hash = ((t.gx * 374761393 + t.gy * 668265263) ^ (i * 311)) & 0xffff;
      const variation = ((hash % 100) / 100 - 0.5) * 0.12; // -6% to +6%

      const r = Math.min(255, Math.max(0, Math.round(baseR * (1 + variation))));
      const g = Math.min(255, Math.max(0, Math.round(baseG * (1 + variation))));
      const b = Math.min(255, Math.max(0, Math.round(baseB * (1 + variation))));

      // Tile body
      tCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      tCtx.fillRect(t.gx, t.gy, 22, 22);

      // 1-pixel light edge on upper-left
      tCtx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      tCtx.fillRect(t.gx, t.gy, 22, 1);
      tCtx.fillRect(t.gx, t.gy, 1, 22);

      // 1-pixel dark edge on lower-right
      tCtx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      tCtx.fillRect(t.gx, t.gy + 21, 22, 1);
      tCtx.fillRect(t.gx + 21, t.gy, 1, 22);
    }

    // Cut the tile canvas to the armorable hull mask using globalCompositeOperation = 'destination-in'
    tCtx.globalCompositeOperation = 'destination-in';
    tCtx.drawImage(maskCanvas, 0, 0);
    tCtx.globalCompositeOperation = 'source-over';

    cachedArmorTileCanvases.set(cl, tileCanvas);
  }

  return cachedArmorTileCanvases.get(armorClass) || null;
}

export function renderGantryShipCanvas(
  canvas: HTMLCanvasElement | null,
  assets: Record<string, HTMLImageElement | null>,
  engineClass: number,
  cargoPods: number,
  armorClass: number,
  shieldClass: number,
  missileClass: number,
  laserClass: number,
  clampReleaseProgress = 0,
  quality: GraphicsQuality = 'High',
) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const shipHullImg = assets['ship_hull_bare_topdown_1k'] || assets['ship_hull_bare_topdown'];
  const cargoPodImg = assets['ship_cargo_pod_sprite'];

  if (shipHullImg && !shipHullImg.complete) {
    shipHullImg.onload = () => {
      renderGantryShipCanvas(canvas, assets, engineClass, cargoPods, armorClass, shieldClass, missileClass, laserClass, clampReleaseProgress, quality);
    };
  }

  const rect = canvas.getBoundingClientRect();
  const dpr = scenePixelRatio(quality,window.devicePixelRatio);
  const panelWidth = Math.round(rect.width || canvas.clientWidth || 460);
  const panelHeight = Math.round(rect.height || canvas.clientHeight || 280);

  const backingW = Math.round(panelWidth * dpr);
  const backingH = Math.round(panelHeight * dpr);

  if (canvas.width !== backingW || canvas.height !== backingH) {
    canvas.width = backingW;
    canvas.height = backingH;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.clearRect(0, 0, panelWidth, panelHeight);

  // Native dimensions from ship hull asset (~1087 x 602)
  const nativeW = (shipHullImg && shipHullImg.naturalWidth > 0) ? shipHullImg.naturalWidth : 1087;
  const nativeH = (shipHullImg && shipHullImg.naturalHeight > 0) ? shipHullImg.naturalHeight : 602;

  const berthCx = Math.round(panelWidth / 2);
  const berthCy = Math.round(panelHeight / 2);

  // Maximum allowable berth ring radii fitting inside the panel with at least 12px margin on every side:
  const maxBerthRx = Math.max(10, berthCx - 12);
  const maxBerthRy = Math.max(10, berthCy - 12);

  // Fixed concentric offset between theoretical shield bubble and berth ring:
  const berthRingGap = 14;

  // Maximum theoretical shield bubble radii:
  // berthRx = bubbleRx + 14 <= maxBerthRx  =>  bubbleRx <= maxBerthRx - 14
  const maxBubbleRx = Math.max(10, maxBerthRx - berthRingGap);
  const maxBubbleRy = Math.max(10, maxBerthRy - berthRingGap);

  // Helper to safely draw rounded rectangles with graceful fallback
  const safeRoundRect = (
    c: CanvasRenderingContext2D,
    rx: number,
    ry: number,
    rw: number,
    rh: number,
    rad = 2,
  ) => {
    if (typeof c.roundRect === 'function') {
      c.roundRect(rx, ry, rw, rh, rad);
    } else {
      c.rect(rx, ry, rw, rh);
    }
  };

  const calcBoxHalfExtents = (testW: number) => {
    const testH = testW * (nativeH / nativeW);

    // 1. Engines & Exhaust Flames extent:
    // Flamed nozzle extends backward from engX = -0.45 * testW
    const fullFlameLen = engineClass > 0 ? (12 + engineClass * 3) * 1.15 : 0;
    const engineLeft = engineClass > 0 ? (testW * 0.5 + fullFlameLen) : testW * 0.5;
    const engineHalfH = engineClass > 0 ? (testH * 0.32 + 6 + engineClass * 0.8) : testH * 0.5;

    // 2. Pulse Lasers extent:
    // Wing tips at y ≈ ±0.455H. Housing from x: -0.33W to -0.27W.
    // Barrel extends to -0.27W + (0.06 + 0.015 * laserClass) * W. Emitter cap extends ~4px forward.
    const laserTipX = laserClass > 0
      ? (-0.27 + (0.06 + 0.015 * laserClass)) * testW + 4
      : -testW * 0.5;
    const laserRight = Math.max(testW * 0.5, laserTipX);
    const laserLeft = laserClass > 0 ? testW * 0.33 : testW * 0.5;
    const laserHalfH = laserClass > 0 ? (testH * 0.455 + 6 + (laserClass >= 3 ? 3 : 0)) : testH * 0.5;

    // 3. Missile Launchers extent:
    // Rail from -0.35 * shipW to -0.22 * shipW; missiles ~0.11 * shipW forward from rail -> up to ~ -0.20 * shipW
    const missileLeft = missileClass > 0 ? testW * 0.35 : testW * 0.5;
    const missileRight = missileClass > 0 ? Math.max(testW * 0.5, testW * 0.20) : testW * 0.5;
    const missileHalfH = missileClass > 0 ? (0.30 * testH + 0.06 * testH + 3) : testH * 0.5;

    // 4. Cargo Pods extent:
    const podW = testW * 0.046;
    const podH = podW / (496 / 824);
    const cargoHalfH = cargoPods > 0 ? (testH * 0.095 + podH + 2) : testH * 0.5;

    // Combined bounds (Armor removed completely):
    const leftX = Math.max(testW * 0.5, engineLeft, laserLeft, missileLeft);
    const rightX = Math.max(testW * 0.5, laserRight, missileRight);
    const bHalfW = Math.max(leftX, rightX);
    const bHalfH = Math.max(testH * 0.5, engineHalfH, laserHalfH, missileHalfH, cargoHalfH);

    return { bHalfW, bHalfH, testH };
  };

  // Binary search for maximum shipW such that theoretical shield bubble:
  // bubbleRx = 1.42 * boxHalfWidth + 6 <= maxBubbleRx
  // bubbleRy = 1.42 * boxHalfHeight + 6 <= maxBubbleRy
  // Note: We compute theoretical shield bubble ALWAYS, exactly as specified,
  // so the ship size is completely INDEPENDENT of whether shields are installed!
  let lowW = 20;
  let highW = panelWidth * 0.85;

  for (let iter = 0; iter < 28; iter++) {
    const testW = (lowW + highW) / 2;
    const { bHalfW, bHalfH } = calcBoxHalfExtents(testW);

    const theoreticalBubbleRx = 1.42 * bHalfW + 6;
    const theoreticalBubbleRy = 1.42 * bHalfH + 6;

    if (theoreticalBubbleRx <= maxBubbleRx && theoreticalBubbleRy <= maxBubbleRy) {
      lowW = testW;
    } else {
      highW = testW;
    }
  }

  const shipW = lowW;
  const { bHalfW: boxHalfWidth, bHalfH: boxHalfHeight, testH: shipH } = calcBoxHalfExtents(shipW);

  // 1. Consistent Ship Sizing & Theoretical Shield Bubble
  const bubbleRx = 1.42 * boxHalfWidth + 6;
  const bubbleRy = 1.42 * boxHalfHeight + 6;

  // 2. Concentric Berth Ring (Even 14px Spacing)
  const berthRx = bubbleRx + berthRingGap;
  const berthRy = bubbleRy + berthRingGap;

  // Engine flame length for rendering
  const fullFlameLen = engineClass > 0 ? (12 + engineClass * 3) * 1.15 : 0;
  const flameLen = engineClass > 0
    ? Math.min(fullFlameLen, (12 + engineClass * 3) * (0.85 + Math.random() * 0.3))
    : 0;

  // Draw Concentric Berth Structure: Dark pad, dashed amber ellipse, crosshair axes/ticks, clamp pads
  ctx.save();
  const gantryGrad = ctx.createRadialGradient(berthCx, berthCy, berthRy * 0.2, berthCx, berthCy, berthRx);
  gantryGrad.addColorStop(0, '#0f172a');
  gantryGrad.addColorStop(0.7, '#090d16');
  gantryGrad.addColorStop(1, '#030712');
  ctx.fillStyle = gantryGrad;
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(berthCx, berthCy, berthRx, berthRy, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Berth alignment ring (dashed amber hazard track) strictly on (berthRx, berthRy)
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.ellipse(berthCx, berthCy, berthRx, berthRy, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Berth crosshair alignment markers
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(berthCx - berthRx, berthCy);
  ctx.lineTo(berthCx + berthRx, berthCy);
  ctx.moveTo(berthCx, berthCy - berthRy);
  ctx.lineTo(berthCx, berthCy + berthRy);
  ctx.stroke();

  // Crosshair ticks along perimeter
  const tickLen = 6;
  ctx.beginPath();
  // Left tick
  ctx.moveTo(berthCx - berthRx, berthCy - tickLen);
  ctx.lineTo(berthCx - berthRx, berthCy + tickLen);
  // Right tick
  ctx.moveTo(berthCx + berthRx, berthCy - tickLen);
  ctx.lineTo(berthCx + berthRx, berthCy + tickLen);
  // Top tick
  ctx.moveTo(berthCx - tickLen, berthCy - berthRy);
  ctx.lineTo(berthCx + tickLen, berthCy - berthRy);
  // Bottom tick
  ctx.moveTo(berthCx - tickLen, berthCy + berthRy);
  ctx.lineTo(berthCx + tickLen, berthCy + berthRy);
  ctx.stroke();

  ctx.restore();

  // Draw Starship, Hull Modules, and Weapons (centered at berthCx, berthCy)
  ctx.save();
  ctx.translate(berthCx, berthCy);

  // 1. Class 1 to 5 Engines & Exhaust Flames
  if (engineClass > 0) {
    const engX = -shipW * 0.45;
    const engColors = ['#00f0ff', '#38bdf8', '#06b6d4', '#d946ef', '#facc15'];
    const flameCol = engColors[engineClass - 1] || '#00f0ff';

    shipExhaustNozzles(shipW).forEach(({x:engX,y:ey}) => {
      const pGrad = ctx.createLinearGradient(engX, ey, engX - flameLen, ey);
      pGrad.addColorStop(0, '#ffffff');
      pGrad.addColorStop(0.25, '#38bdf8');
      pGrad.addColorStop(0.6, flameCol);
      pGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = pGrad;
      ctx.shadowColor = flameCol;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(engX, ey - 4 - engineClass * 0.8);
      ctx.quadraticCurveTo(engX - flameLen * 0.7, ey - 2, engX - flameLen, ey);
      ctx.quadraticCurveTo(engX - flameLen * 0.7, ey + 2, engX, ey + 4 + engineClass * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

    });
  }

  // One finished image contains the complete installed configuration.
  if (!drawConfiguredShip(ctx,{cargoPods,armorClass,laserClass,missileClass},-shipW/2,-shipH/2,shipW,shipH)) {
    if (shipHullImg?.complete && shipHullImg.naturalWidth>0) ctx.drawImage(shipHullImg,-shipW/2,-shipH/2,shipW,shipH);
  }

  // 5C. Articulated Docking Clamps (Top and Bottom clamps gripping nose sphere)
  // Positioned at sphereCenterX = dx = 0.39 * shipW.
  // Base sitting on dashed berth ring at (dx, ±ringY_offset).
  // Grips nose sphere of radius 0.21 * shipH centered at (dx, 0).
  {
    const dx = 0.39 * shipW;
    const sphereRadius = 0.21 * shipH;
    const ringY_offset = berthRy * Math.sqrt(Math.max(0, 1 - (dx / berthRx) ** 2));

    const releaseTime = clampReleaseProgress <= 1 ? clampReleaseProgress * 0.7 : clampReleaseProgress;
    const phase1 = Math.min(1, Math.max(0, releaseTime / 0.3)); // 0 to 1 during 0.3s jaw swing
    const phase2 = Math.min(1, Math.max(0, (releaseTime - 0.3) / 0.4)); // 0 to 1 during 0.4s arm retraction
    const isReleasing = releaseTime > 0;
    const jawOpenAngle = (35 * Math.PI / 180) * phase1; // 0 to 35 degrees

    // Render both clamps: isTop = true (top clamp), isTop = false (bottom clamp)
    [true, false].forEach((isTop) => {
      ctx.save();

      const baseY = isTop ? -ringY_offset : ringY_offset;
      const dirY = isTop ? 1 : -1; // Direction towards sphere center (0, 0)
      const baseInnerY = isTop ? baseY + 5 : baseY - 5;
      const jointExtendedY = isTop ? -sphereRadius - 3.5 : sphereRadius + 3.5;
      const jointRetractedY = isTop ? baseInnerY + 7 : baseInnerY - 7;
      // Joint position: retracts from extended to retracted during Phase 2
      const jointY = jointExtendedY + (jointRetractedY - jointExtendedY) * phase2;

      // --- 1. CLAMP BASE ---
      // A dark steel block straddling the dashed ring (#334155 with #94a3b8 edge, ~16 x 10 px)
      const baseLeft = dx - 8;
      const baseTop = baseY - 5;
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      safeRoundRect(ctx, baseLeft, baseTop, 16, 10, 2);
      ctx.fill();
      ctx.stroke();

      // Yellow-and-black hazard stripe on outer face (~16 x 3.5 px)
      const hazardY = isTop ? baseTop : baseTop + 6.5;
      ctx.save();
      ctx.beginPath();
      safeRoundRect(ctx, baseLeft, hazardY, 16, 3.5, 1);
      ctx.clip();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(baseLeft, hazardY, 16, 3.5);
      ctx.fillStyle = '#facc15';
      for (let hx = -12; hx <= 20; hx += 4) {
        ctx.beginPath();
        ctx.moveTo(dx + hx, hazardY);
        ctx.lineTo(dx + hx + 2.5, hazardY);
        ctx.lineTo(dx + hx + 0.5, hazardY + 3.5);
        ctx.lineTo(dx + hx - 2, hazardY + 3.5);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Indicator lamp: on the base, green (#22c55e) while locked, amber (#f59e0b) while releasing
      const lampColor = isReleasing ? '#f59e0b' : '#22c55e';
      const lampY = isTop ? baseY + 1.5 : baseY - 1.5;
      ctx.save();
      ctx.fillStyle = lampColor;
      ctx.shadowColor = lampColor;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(dx, lampY, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(dx, lampY, 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- 2. HYDRAULIC ARM ---
      // Hydraulic arm extending from the base toward the sphere:
      // Grey piston cylinder (#64748b) with lighter sliding rod (#cbd5e1)
      const maxArmSpan = Math.abs(jointExtendedY - baseInnerY);
      const cylinderLen = Math.min(26, Math.max(10, maxArmSpan * 0.45));
      const cylinderEndY = baseInnerY + dirY * cylinderLen;

      // Piston cylinder attached to base
      ctx.fillStyle = '#64748b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      const cylTop = Math.min(baseInnerY, cylinderEndY);
      const cylH = Math.abs(cylinderEndY - baseInnerY);
      ctx.beginPath();
      safeRoundRect(ctx, dx - 3.5, cylTop, 7, cylH, 1.5);
      ctx.fill();
      ctx.stroke();

      // Cylinder collar ring
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(dx - 4, cylinderEndY - (isTop ? 2 : 0), 8, 2);

      // Sliding rod extending from cylinder into joint
      const rodTop = Math.min(cylinderEndY, jointY);
      const rodH = Math.max(0, Math.abs(jointY - cylinderEndY));
      if (rodH > 0) {
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.rect(dx - 1.8, rodTop, 3.6, rodH);
        ctx.fill();
        ctx.stroke();
      }

      // Round joint near the jaw with a small cyan glow
      ctx.save();
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(dx, jointY, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(dx, jointY, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(dx, jointY, 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- 3. JAW ---
      // C-shaped grip cupping the sphere's edge: arc of radius (sphereRadius + 3) spanning ~70 degrees,
      // centred on the sphere's top/bottom point, with claw tips touching the sphere, dark steel with light bevel.
      // Phase 1 (0.3s): Jaws swing open 35 degrees away from the sphere and lamps turn amber.
      const clawHalfAngle = (35 * Math.PI) / 180; // 35 degrees half-span (70 deg total)

      // We render two articulated claw tongs (left claw and right claw) pivoting at the joint (dx, jointY)
      // Left claw pivots by -jawOpenAngle, Right claw pivots by +jawOpenAngle
      [-1, 1].forEach((clawSide) => {
        ctx.save();
        ctx.translate(dx, jointY);
        // Pivot jaw away from sphere during release
        ctx.rotate(clawSide * jawOpenAngle);

        // Claw geometry in joint-local space:
        const steps = 14;
        const ptsInner: { x: number; y: number }[] = [];
        const ptsOuter: { x: number; y: number }[] = [];

        // Sphere center in joint-local coordinates (at locked joint extended position)
        const scY = isTop ? (sphereRadius + 3.5) : -(sphereRadius + 3.5);
        const baseA = isTop ? -Math.PI / 2 : Math.PI / 2;

        for (let i = 0; i <= steps; i++) {
          const frac = i / steps;
          const a = frac * clawHalfAngle;
          const currentA = baseA + (isTop ? clawSide * a : -clawSide * a);

          // Inner radius curves inward at the claw tip to touch the sphere!
          const rInner = (sphereRadius + 3) - frac * 3;
          const rOuter = (sphereRadius + 6.5) - frac * 1.5;

          const ix = Math.cos(currentA) * rInner;
          const iy = scY + Math.sin(currentA) * rInner;
          const ox = Math.cos(currentA) * rOuter;
          const oy = scY + Math.sin(currentA) * rOuter;

          ptsInner.push({ x: ix, y: iy });
          ptsOuter.push({ x: ox, y: oy });
        }

        // Draw claw polygon
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let i = 0; i <= steps; i++) {
          ctx.lineTo(ptsOuter[i].x, ptsOuter[i].y);
        }
        for (let i = steps; i >= 0; i--) {
          ctx.lineTo(ptsInner[i].x, ptsInner[i].y);
        }
        ctx.closePath();

        // Dark steel fill with light bevel stroke
        ctx.fillStyle = '#334155';
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Tip contact highlight
        const tipPt = ptsInner[steps];
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(tipPt.x, tipPt.y, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      ctx.restore();
    });
  }

  // 6. Modular Shield Generator Field
  // When shields are installed: drawn exactly 14px inside the amber ring (bubbleRx, bubbleRy).
  // When shields are not installed: no cyan bubble is drawn, ring and pad stay identical.
  if (shieldClass > 0) {
    ctx.save();
    // Faint translucent cyan fill matching deflector bubble in space
    ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.beginPath();
    ctx.ellipse(0, 0, bubbleRx, bubbleRy, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing cyan outline: higher shield class makes the outline slightly brighter and thicker, not larger
    const outlineAlpha = Math.min(1.0, 0.65 + shieldClass * 0.07);
    ctx.strokeStyle = `rgba(0, 240, 255, ${outlineAlpha})`;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8 + shieldClass * 2;
    ctx.lineWidth = 1.4 + shieldClass * 0.35;
    ctx.beginPath();
    ctx.ellipse(0, 0, bubbleRx, bubbleRy, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  ctx.restore();
}

export { drawUnifiedPlayerShip, type UnifiedPlayerShipConfig };

export const DevLabelsContext = createContext<boolean>(false);

export function DevUiTag({
  id,
  color = 'cyan',
}: {
  id: string;
  color?: 'cyan' | 'yellow' | 'pink' | 'emerald';
}) {
  const enabled = useContext(DevLabelsContext);
  if (!enabled) return null;

  const colorClass =
    color === 'yellow'
      ? 'border-yellow-400 text-yellow-300 shadow-[0_0_6px_#facc1580]'
      : color === 'pink'
      ? 'border-pink-400 text-pink-300 shadow-[0_0_6px_#ec489980]'
      : color === 'emerald'
      ? 'border-emerald-400 text-emerald-300 shadow-[0_0_6px_#10b98180]'
      : 'border-cyan-400 text-cyan-300 shadow-[0_0_6px_#00f0ff80]';

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-950/95 border rounded select-none pointer-events-none z-30 mr-1.5 tracking-tight ${colorClass}`}
    >
      {id}
    </span>
  );
}

export function CrewPortrait({
  member,
  size = 'md',
  inCombat = false,
  hullCritical = false,
  highGravity = false,
}: {
  member: CrewMember;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  inCombat?: boolean;
  hullCritical?: boolean;
  highGravity?: boolean;
}) {
  const isDeceased = !member.alive || member.vitality <= 0;
  const isInjured = member.alive && member.vitality < 50;
  const isWorried = member.alive && (inCombat || hullCritical || highGravity || member.vitality < 75);

  const dim =
    size === 'sm'
      ? 'w-9 h-9 text-base'
      : size === 'md'
      ? 'w-12 h-12 text-xl'
      : size === 'lg'
      ? 'w-16 h-16 text-2xl'
      : 'w-24 h-24 text-4xl';

  return (
    <div
      style={{
        borderColor: isDeceased ? '#475569' : isInjured ? '#ef4444' : isWorried ? '#f59e0b' : member.color,
        backgroundColor: isDeceased ? '#0f172a' : isInjured ? 'rgba(239, 68, 68, 0.2)' : `${member.color}18`,
        boxShadow: isDeceased
          ? 'none'
          : isInjured
          ? '0 0 12px rgba(239, 68, 68, 0.6)'
          : `0 0 10px ${member.color}40`,
      }}
      className={`${dim} rounded-2xl border-2 flex flex-col items-center justify-center relative overflow-hidden shrink-0 transition-all select-none`}
    >
      <div
        role="img"
        aria-label={`${member.name}, ${member.race}, ${isDeceased ? 'deceased' : isInjured ? 'injured' : isWorried ? 'alert' : 'ready'}`}
        data-portrait-race={member.race}
        data-portrait-id={crewPortraitId(member)}
        className={`crew-portrait-sprite ${!isDeceased && !isInjured && !isWorried ? 'crew-portrait-idle' : ''}`}
        style={{
          backgroundImage: `url(${crewPortraitPath(member)})`,
          backgroundPosition: isInjured ? '100% 100%' : isWorried ? '50% 100%' : '0% 0%',
          filter: isDeceased ? 'grayscale(1) brightness(.55)' : undefined,
        }}
      />

      {/* Expression Badges */}
      {isDeceased && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter bg-slate-900/90 px-1 rounded border border-slate-700">
            MEMORIAM
          </span>
        </div>
      )}

      {isInjured && !isDeceased && (
        <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
      )}

      {isWorried && !isInjured && !isDeceased && (
        <div className="absolute top-0.5 right-0.5 text-[9px] font-black text-amber-300">!</div>
      )}
    </div>
  );
}

export type GameLocation =
  | 'Starport'
  | 'Docking Bay'
  | 'Star System'
  | 'Hyperspace'
  | 'In Orbit'
  | 'Landing'
  | 'On Planet'
  | 'Terrain Vehicle'
  | 'Encounter';

export type CinematicState = 'none' | 'launch' | 'dock' | 'descent' | 'surface_launch';

export type Species = 'Human' | 'Velox' | 'Thrynn' | 'Elowan' | 'Android';

export type CrewPost =
  | 'Captain'
  | 'Science Officer'
  | 'Navigator'
  | 'Engineer'
  | 'Communications'
  | 'Doctor';

export interface Skills {
  science: number;
  navigation: number;
  engineering: number;
  communications: number;
  medicine: number;
}

export interface CrewMember {
  id: string;
  name: string;
  race: Species;
  skills: Skills;
  durability: number;
  vitality: number; // 0-100
  alive: boolean;
  quirk?: string;
  /** Optional for legacy saves; assigned once on restore or recruitment. */
  portraitId?: string;
  color: string;
}

export interface RaceSpec {
  name: Species;
  baseSkills: Skills;
  maxSkills: Skills;
  learningRate: number;
  durability: number;
  canTrain: boolean;
  color: string;
  desc: string;
}

export const RACE_SPECS: Record<Species, RaceSpec> = {
  Human: {
    name: 'Human',
    baseSkills: { science: 50, navigation: 30, engineering: 30, communications: 30, medicine: 30 },
    maxSkills: { science: 250, navigation: 200, engineering: 200, communications: 200, medicine: 200 },
    learningRate: 9,
    durability: 6,
    canTrain: true,
    color: '#00f0ff',
    desc: 'Versatile generalists. Enthusiastic about regulations and checklists.',
  },
  Velox: {
    name: 'Velox',
    baseSkills: { science: 30, navigation: 50, engineering: 50, communications: 0, medicine: 0 },
    maxSkills: { science: 200, navigation: 250, engineering: 250, communications: 100, medicine: 100 },
    learningRate: 6,
    durability: 8,
    canTrain: true,
    color: '#d946ef',
    desc: 'Chitinous insectoids. Obsessed with high-output engine torque and fast reaction drives.',
  },
  Thrynn: {
    name: 'Thrynn',
    baseSkills: { science: 30, navigation: 30, engineering: 30, communications: 50, medicine: 0 },
    maxSkills: { science: 200, navigation: 200, engineering: 200, communications: 250, medicine: 100 },
    learningRate: 7,
    durability: 6,
    canTrain: true,
    color: '#ff2244',
    desc: 'Reptilian pragmatists. Skilled bargainers who prioritize cold hard M.U. profits.',
  },
  Elowan: {
    name: 'Elowan',
    baseSkills: { science: 10, navigation: 30, engineering: 10, communications: 50, medicine: 50 },
    maxSkills: { science: 150, navigation: 200, engineering: 150, communications: 250, medicine: 250 },
    learningRate: 10,
    durability: 2,
    canTrain: true,
    color: '#00ffaa',
    desc: 'Sentient botanical beings. Pacifist healers with heightened telepathic empathy.',
  },
  Android: {
    name: 'Android',
    baseSkills: { science: 50, navigation: 150, engineering: 100, communications: 0, medicine: 20 },
    maxSkills: { science: 50, navigation: 150, engineering: 100, communications: 0, medicine: 20 },
    learningRate: 0,
    durability: 10,
    canTrain: false,
    color: '#94a3b8',
    desc: 'Pre-programmed synthetic units. High starting telemetry calculations; cannot undergo training.',
  },
};

export const CREW_POSTS: CrewPost[] = [
  'Captain',
  'Science Officer',
  'Navigator',
  'Engineer',
  'Communications',
  'Doctor',
];

export const FUEL_BURN_RATES: Record<number, number> = {
  1: 0.48,
  2: 0.40,
  3: 0.32,
  4: 0.24,
  5: 0.16,
};

export const LASER_BASE_DAMAGE = [0, 90, 210, 360, 510, 660];
export const MISSILE_BASE_DAMAGE = [0, 200, 400, 700, 1000, 1500];

export const PART_TABLES = {
  engines: [
    { name: 'Class 1 Ion Pulse', classLvl: 1, buy: 1000, sell: 900, power: 100, mass: 50 },
    { name: 'Class 2 Magneto Drive', classLvl: 2, buy: 8000, sell: 7600, power: 250, mass: 50 },
    { name: 'Class 3 Fusion Ram', classLvl: 3, buy: 20000, sell: 19000, power: 500, mass: 50 },
    { name: 'Class 4 Antimatter Jet', classLvl: 4, buy: 40000, sell: 38000, power: 900, mass: 50 },
    { name: 'Class 5 Singularity Warp', classLvl: 5, buy: 100000, sell: 95200, power: 1500, mass: 50 },
  ],
  shielding: [
    { name: 'Class 1 Deflector Screen', classLvl: 1, buy: 4000, sell: 3800, shield: 500, mass: 5 },
    { name: 'Class 2 Harmonic Barrier', classLvl: 2, buy: 12000, sell: 11400, shield: 1000, mass: 5 },
    { name: 'Class 3 Phase Shield', classLvl: 3, buy: 32000, sell: 30400, shield: 1500, mass: 5 },
    { name: 'Class 4 Tachyon Aegis', classLvl: 4, buy: 70000, sell: 66600, shield: 2000, mass: 5 },
    { name: 'Class 5 Quantum Ward', classLvl: 5, buy: 125000, sell: 119000, shield: 2500, mass: 5 },
  ],
  armor: [
    { name: 'Class 1 Titanium Hull', classLvl: 1, buy: 1500, sell: 1400, armor: 500, mass: 9 },
    { name: 'Class 2 Carbide Plate', classLvl: 2, buy: 3100, sell: 2900, armor: 750, mass: 36 },
    { name: 'Class 3 Crystalline Matrix', classLvl: 3, buy: 6200, sell: 5900, armor: 1000, mass: 81 },
    { name: 'Class 4 Neutronium Mesh', classLvl: 4, buy: 12500, sell: 11900, armor: 1250, mass: 144 },
    { name: 'Class 5 Hyper-Alloy Plating', classLvl: 5, buy: 25000, sell: 23800, armor: 1500, mass: 225 },
  ],
  missiles: [
    { name: 'Class 1 Dart Launcher', classLvl: 1, buy: 12000, sell: 11400, damage: 200, mass: 5 },
    { name: 'Class 2 Torpedo Tube', classLvl: 2, buy: 28000, sell: 26600, damage: 400, mass: 5 },
    { name: 'Class 3 Photon Pod', classLvl: 3, buy: 60000, sell: 57100, damage: 700, mass: 5 },
    { name: 'Class 4 Tachyon Torpedo', classLvl: 4, buy: 120000, sell: 114200, damage: 1000, mass: 5 },
    { name: 'Class 5 Antimatter Warhead', classLvl: 5, buy: 200000, sell: 190400, damage: 1500, mass: 5 },
  ],
  lasers: [
    { name: 'Class 1 Pulse Laser', classLvl: 1, buy: 8000, sell: 7600, damage: 90, mass: 5 },
    { name: 'Class 2 Blaster Beam', classLvl: 2, buy: 20000, sell: 19000, damage: 210, mass: 5 },
    { name: 'Class 3 Disruptor Ray', classLvl: 3, buy: 54000, sell: 51400, damage: 360, mass: 5 },
    { name: 'Class 4 Plasma Cannon', classLvl: 4, buy: 90000, sell: 85700, damage: 510, mass: 5 },
    { name: 'Class 5 Phaser Array', classLvl: 5, buy: 150000, sell: 142800, damage: 660, mass: 5 },
  ],
};

export interface BankLedgerEntry {
  date: string;
  desc: string;
  amount: number;
  balance: number;
  type?: string;
  stardate?: string;
  note?: string;
}

export interface CorporateBulletin {
  id: number;
  date: string;
  title: string;
  paragraphs: string[];
  author: string;
  read: boolean;
}

export interface ColonyEvaluation {
  id: string;
  planetName: string;
  colonyName: string;
  starX: number;
  starY: number;
  stardate: string;
  suitable: boolean;
  verdict: 'SUITABLE' | 'UNSUITABLE';
  rating?: 'A' | 'B' | 'C' | 'D' | 'F';
  payout: number;
  fine?: number;
  bonus?: number;
  reasons: string[];
  warningMessage?: string;
  isOptimal?: boolean;
  notes: string;
  read: boolean;
}

export interface PendingColonyRec {
  starId: number;
  starName: string;
  starX: number;
  starY: number;
  slot: number;
  planet: StarPlanet;
  colonyName: string;
  stardate: string;
}

export interface ArtifactItem {
  id: string;
  codeName: string;
  realName: string;
  name?: string;
  volume: number; // m³
  basePrice: number;
  value?: number;
  appraised: boolean;
  description: string;
}

export interface VehicleCargoItem {
  id: string;
  name: string;
  type: 'mineral' | 'artifact' | 'specimen';
  volume: number;
  value: number;
  artifactRef?: ArtifactData;
  speciesName?: string;
  isArmed?: boolean;
}

export interface TireTrack {
  x: number;
  y: number;
  heading: number;
  alpha: number;
}

export interface RoverDustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface TacticalSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface TacticalExplosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: string;
  shockwave: boolean;
}

export interface TacticalShieldRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: string;
  angle: number;
}

export interface MissileSmokeTrail {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
}

// Spectral Class rendering parameters (Pass G3 specification)
export const SPECTRAL_PROPS: Record<
  SpectralClass,
  { color: string; coreColor: string; coronaColor: string; radius: number }
> = {
  O: { color: '#3388ff', coreColor: '#e0f2fe', coronaColor: 'rgba(51, 136, 255, 0.45)', radius: 34 },
  B: { color: '#88bbff', coreColor: '#f0f9ff', coronaColor: 'rgba(136, 187, 255, 0.45)', radius: 30 },
  A: { color: '#ffffff', coreColor: '#ffffff', coronaColor: 'rgba(255, 255, 255, 0.40)', radius: 26 },
  F: { color: '#fff2a8', coreColor: '#fefce8', coronaColor: 'rgba(255, 242, 168, 0.45)', radius: 23 },
  G: { color: '#ffd700', coreColor: '#fffbeb', coronaColor: 'rgba(255, 215, 0, 0.45)', radius: 20 },
  K: { color: '#ff8822', coreColor: '#fff7ed', coronaColor: 'rgba(255, 136, 34, 0.45)', radius: 17 },
  M: { color: '#ff3322', coreColor: '#fef2f2', coronaColor: 'rgba(255, 51, 34, 0.45)', radius: 14 },
};

export function getNormalizedId(item: any): string {
  if (!item) return '';
  let id = item.id || '';
  if (id.startsWith('art-')) id = id.slice(4);
  id = id.replace(/_/g, '-');
  if (!id && (item.name || item.realName)) {
    id = (item.realName || item.name).toLowerCase().replace(/\s+/g, '-');
    if (id.startsWith('the-')) id = id.slice(4);
  }
  return id;
}

export function getAtmosphereRimGlow(gases: string[]): string | null {
  if (!gases || gases.length === 0) return null;
  const gasStr = gases.join(' ').toLowerCase();
  if (gasStr.includes('oxygen') || gasStr.includes('nitrogen')) return '#00d2ff';
  if (gasStr.includes('methane')) return '#00ffcc';
  if (gasStr.includes('chlorine') || gasStr.includes('fluorine')) return '#88ff00';
  if (gasStr.includes('carbon dioxide') || gasStr.includes('argon') || gasStr.includes('sulfur')) return '#e6a050';
  return '#00d2ff';
}

export function getPlanetMapAssetKey(
  p: StarPlanet,
  starX: number,
  starY: number,
): {
  assetKey: string | null;
  seed: number;
  tintColor: string | null;
  tintAlpha: number;
} {
  // Homeworld Arth
  if (p.isHomeworld) {
    return { assetKey: 'planet_map_arth', seed: 0, tintColor: null, tintAlpha: 0 };
  }

  // Precursor Crystal Planet
  if (p.type === 'Crystal' || (starX === 192 && starY === 152 && (p.orderIndex === 0 || p.slot === 1))) {
    return { assetKey: 'planet_map_crystal', seed: 0, tintColor: 'rgba(192, 132, 252, 0.12)', tintAlpha: 0.12 };
  }

  const seed = ((starX * 100 + starY * 13 + (p.orderIndex ?? p.slot ?? 1) * 37) >>> 0);
  const isVariantA = seed % 2 === 0;

  let assetKey: string | null = null;
  let tintColor: string | null = null;
  let tintAlpha = 0;

  if (p.type === 'Rock') {
    assetKey = isVariantA ? 'planet_map_rock_a' : 'planet_map_rock_b';
    const tints = [
      'rgba(217, 119, 6, 0.12)', // warm ochre
      'rgba(180, 83, 9, 0.14)',  // canyon rust
      'rgba(100, 116, 139, 0.12)', // cool basalt
      'rgba(161, 98, 7, 0.10)',  // desert sand
      'rgba(148, 163, 184, 0.08)', // slate grey
    ];
    tintColor = tints[seed % tints.length];
    tintAlpha = 0.12;
  } else if (p.type === 'Frozen') {
    assetKey = isVariantA ? 'planet_map_frozen_a' : 'planet_map_frozen_b';
    const tints = [
      'rgba(56, 189, 248, 0.12)',  // glacial cyan
      'rgba(129, 140, 248, 0.10)', // pale violet frost
      'rgba(14, 165, 233, 0.14)',  // deep ice blue
      'rgba(165, 243, 252, 0.10)', // polar white-teal
      'rgba(148, 163, 184, 0.12)', // dark frost
    ];
    tintColor = tints[seed % tints.length];
    tintAlpha = 0.12;
  } else if (p.type === 'Liquid') {
    assetKey = isVariantA ? 'planet_map_liquid_a' : 'planet_map_liquid_b';
    const tints = [
      'rgba(6, 182, 212, 0.12)',  // tropical teal
      'rgba(2, 132, 199, 0.12)',  // royal ocean azure
      'rgba(16, 185, 129, 0.10)', // verdant emerald
      'rgba(14, 116, 144, 0.14)', // deep navy
      'rgba(45, 212, 191, 0.10)', // archipelago turquoise
    ];
    tintColor = tints[seed % tints.length];
    tintAlpha = 0.12;
  } else if (p.type === 'Molten') {
    assetKey = isVariantA ? 'planet_map_molten_a' : 'planet_map_molten_b';
    const tints = [
      'rgba(239, 68, 68, 0.12)',  // inferno red
      'rgba(249, 115, 22, 0.14)', // molten magma orange
      'rgba(185, 28, 28, 0.12)',  // dark crimson basalt
      'rgba(217, 119, 6, 0.10)',  // glowing amber fissure
    ];
    tintColor = tints[seed % tints.length];
    tintAlpha = 0.12;
  } else if (p.type === 'Gas Giant') {
    assetKey = isVariantA ? 'planet_map_gas_a' : 'planet_map_gas_b';
    const tints = [
      'rgba(245, 158, 11, 0.10)', // amber storm band
      'rgba(20, 184, 166, 0.10)', // teal methane band
      'rgba(99, 102, 241, 0.10)', // deep hydrogen violet
      'rgba(234, 179, 8, 0.10)',  // golden eddy
    ];
    tintColor = tints[seed % tints.length];
    tintAlpha = 0.10;
  }

  return { assetKey, seed, tintColor, tintAlpha };
}

export function getAtmosphereRimThickness(density: AtmosphereDensity): number {
  switch (density) {
    case 'Very Thin': return 2;
    case 'Thin': return 3.5;
    case 'Moderate': return 6;
    case 'Thick': return 8.5;
    case 'Very Thick': return 12;
    case 'None':
    default: return 0;
  }
}

export const SYSTEM_BOUNDARY_RADIUS = 380;

export type BridgeConsoleSubmenu =
  | 'Bridge'
  | 'Command'
  | 'Science'
  | 'Navigation'
  | 'Combat'
  | 'Engineering'
  | 'Communications'
  | 'Medical'
  | 'Maneuver'
  | 'CommsSession';

export type DisplayPanelMode = 'system_map' | 'status' | 'cargo' | 'log' | 'sensor_reading' | 'alien_radar' | 'tactical_status';

export type SubsystemKey = 'Engines' | 'Sensors' | 'Comms' | 'Shields' | 'Missiles' | 'Lasers';

export interface ActiveRepairTask {
  target: 'Hull' | SubsystemKey;
  targetHealth: number;
  mineralName: string;
  mineralCost: number;
}

export interface SaveSlotData {
  /** Read-only quarantine marker; corrupt stored bytes are retained for recovery. */
  loadError?: string;
  slot: 'A' | 'B' | 'C' | 'D' | 'E';
  timestamp: string;
  credits: number;
  shipName: string;
  stardate: string;
  location: GameLocation;
  empty: boolean;
  isDev?: boolean;
  gameWon?: boolean;
  flaresHalted?: boolean;
  bridgeLog?: { id: string; text: string; post?: CrewPost; speaker?: string; type?: 'info' | 'alert' | 'banter' }[];
  snapshot?: {
    isDev?: boolean;
    gameWon?: boolean;
    flaresHalted?: boolean;
    flaresStopped?: boolean;
    destroyedPlanetKeys?: string[];
    destroyedPlanets?: string[];
    sterilizedPlanets?: string[];
    usedFluxes?: number[];
    fluxDisorientation?: number;
    fluxCooldown?: number;
    fluxExitDest?: [number, number] | null;
    location: GameLocation;
    prevLocation?: GameLocation;
    concourseAstronautX: number;
    concourseAstronautY?: number;
    starportRoomIndex: number;
    inRoom: boolean;
    currentStarId: number;
    galaxyShipX: number;
    galaxyShipY: number;
    systemShipX: number;
    systemShipY: number;
    systemZoom?: number;
    hyperZoom?: number;
    shipHeading: number;
    orbitPlanetIndex: number | null;
    planetaryScan?: PlanetaryScanState | null;
    crystalHeatTicks?: number;
    crystalHeatRemainder?: number;
    landingLat?: number;
    landingLong?: number;
    credits: number;
    stardateDay: number;
    stardateMonth: number;
    stardateYear: number;
    stardateHour: number;
    starportDestroyed?: boolean;
    bridgeLog?: { id: string; text: string; post?: CrewPost; speaker?: string; type?: 'info' | 'alert' | 'banter' }[];
    systemMessages?: { id: string; text: string; post?: CrewPost; speaker?: string; type?: 'info' | 'alert' | 'banter' }[];
    banterLog?: { speaker: string; text: string; post: CrewPost }[];
    lastInterestAbsDay: number;
    lastInterestStardateDays?: number;
    lastInterestStardate?: string;
    unsuitablePlanetsRecommendedCount: number;
    unsuitableCount: number;
    recommendedPlanets: string[];
    loggedTelemetryPlanets?: string[];
    pendingRecommendations: PendingColonyRec[];
    shipName: string;
    engineClass: number;
    shieldClass: number;
    armorClass: number;
    missileClass: number;
    laserClass: number;
    cargoPods: number;
    enduriumFuel: number;
    hullIntegrity: number;
    playerArmorPoints: number;
    playerShieldPoints: number;
    subsystems: Record<SubsystemKey, number>;
    inoperativeSystems: Record<SubsystemKey, boolean>;
    activePatientId: string | null;
    activeRepairTask: ActiveRepairTask | null;
    cargoHold: Record<string, number>;
    artifactsInHold: ArtifactItem[];
    artifactStock?: DepotArtifact[];
    specimensInHold?: VehicleCargoItem[];
    crewRoster: CrewMember[];
    assignedPosts: Record<CrewPost, string | null>;
    traversedFluxIds: number[];
    bulletins: CorporateBulletin[];
    evaluations: ColonyEvaluation[];
    bankLedger: BankLedgerEntry[];
    vehicleDestroyed?: boolean;
    vehicleFuel?: number;
    vehicleHold?: VehicleCargoItem[];
    vehicleX?: number;
    vehicleY?: number;
    vehicleHeading?: number;
    roverWaypoint?: {x:number;y:number}|null;
    vehicleWeapon?: 'Stunner' | 'Laser';
    currentSurfaceState?: PlanetSurfaceState | null;
    planetSurfaces?: Record<string, PlanetSurfaceState>;
    orbitAnimPhase?:number;
    hyperspaceDepartureStarId?:number|null;
    armedDetonationTracker?: {
      systemCoords: [number, number]; planetIndex: number; lat: number; lon: number; isArmed: boolean;
    } | null;
    detonationSequence?: DetonationSequence | null;
    cinematicState?: CinematicState;
    cinematicRemaining?: number;
    cinematicDuration?: number;
    shieldsRaised?: boolean;
    weaponsArmed?: boolean;
    discoveredSpecies?: string[];
    surveyKnowledge?: SurveyKnowledge;
    surfaceRecording?: SurfaceRecording | null;
    commLineUsage?: Record<number, number>;
    commTopicProgress?:Record<string,number>;
    activeEncounterGroup?: AlienGroup | null;
    fleetChanges?: Record<string, AlienGroup>;
    alienTrackingHour?: number;
    encounterTargetIndex?: number;
    encounterShipPos?: { x: number; y: number };
    encounterPassIndex?: number;
    combatDuration?: number;
    combatPassTimer?: number;
    combatActive?: boolean;
    laserCooldown?: number;
    missileCooldown?: number;
    encounterCooldown?: number;
    projectiles?: TacticalProjectile[];
    encounterShotsFired?: { laser: number; missile: number };
    questionCountdownTimer?: number;
    questionTotalTime?: number;
    alienCommsState?: AlienCommsState;
    hasPurchasedBlackBox?: boolean;
    grantedDroneClearanceUntilHyperspace?: boolean;
    mechan9Unlocked?: boolean;
    hasGivenEllipsoid?: boolean;
    hasRefusedCrystalOrb?: boolean;
    uhlekSilenced?: boolean;
    elowanHostile?: boolean;
    speciesBaseMoods?: Record<AlienRace, number>;
    visitedStarIds?: number[];
    settings?: Partial<GameSettings>;
  };
}

const STARPORT_ROOMS = [
  'Operations',
  'Personnel',
  'Crew Assignment',
  'Bank',
  'Ship Configuration',
  'Trade Depot',
  'Docking Bay',
] as const;

export interface StarportDoorConfig {
  id: string;
  name: string;
  index: number;
  u: number;
  v: number;
  plateU?: number;
  plateV?: number;
  x: number;
  y: number;
  plateX: number;
  plateY: number;
  primaryColor: string;
  glowColor: string;
  badge: string;
  desc: string;
  isCenterPlatform?: boolean;
}

export const CONCOURSE_IMAGE_WIDTH = 1896;
export const CONCOURSE_IMAGE_HEIGHT = 1024;
export const CONCOURSE_CENTER_U = 0.500;
export const CONCOURSE_CENTER_V = 0.499;
export const CONCOURSE_RADIUS_U = 0.360;
export const CONCOURSE_RADIUS_V = 0.315;
export const CONCOURSE_SPAWN_U = 0.500;
export const CONCOURSE_SPAWN_V = 0.647;

let cachedConcourseCanvas: HTMLCanvasElement | null = null;
let cachedConcourseSrc: HTMLImageElement | null = null;

export function getConcourseCanvas(
  assets?: Record<string, HTMLImageElement | null>
): HTMLCanvasElement | null {
  const img = assets
    ? assets['new_asset_1792541948891'] ||
      assets['starport_concourse_main_view'] ||
      assets['starport_concourse_open_7doors'] ||
      assets['starport_concourse_closed_7doors'] ||
      assets['starport_concourse_closed'] ||
      assets['starport_concourse_open']
    : null;

  if (img && img.complete && img.naturalWidth > 0) {
    if (cachedConcourseCanvas && cachedConcourseSrc === img) {
      return cachedConcourseCanvas;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 1896;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (img.naturalWidth >= 1896) {
        ctx.drawImage(img, 0, 0, 1896, 1024);
      } else {
        // Mirrored 2x composite (1896x1024):
        // new_asset_1792541948891 is 1024x1024, containing the left half of the concourse from x=0 to 948.
        const halfW = 948;
        const compH = 1024;
        // Left half (0..948)
        ctx.drawImage(img, 0, 0, halfW, compH, 0, 0, halfW, compH);
        // Right half (mirrored horizontally 0..948 -> 948..1896)
        ctx.save();
        ctx.translate(1896, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, halfW, compH, 0, 0, halfW, compH);
        ctx.restore();
      }
    }
    cachedConcourseCanvas = canvas;
    cachedConcourseSrc = img;
    return canvas;
  }

  if (cachedConcourseCanvas) return cachedConcourseCanvas;

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 1896;
    canvas.height = 1024;
    cachedConcourseCanvas = canvas;
    return canvas;
  }

  return null;
}

export function getConcourseCoverTransform(
  viewWidth = 1280,
  viewHeight = 720,
  _targetCanvasOrImg?: HTMLCanvasElement | HTMLImageElement | null
) {
  const COMP_W = 1896;
  const COMP_H = 1024;
  const coverScale = Math.max(viewWidth / COMP_W, viewHeight / COMP_H);
  const maxBandScale = viewHeight / (COMP_H * (0.95 - 0.06)); // band 0.06 to 0.95 fits viewH
  const scale = Math.min(coverScale, maxBandScale);
  const drawnW = COMP_W * scale;
  const drawnH = COMP_H * scale;
  const offsetX = (viewWidth - drawnW) / 2;
  // Center the band [0.06, 0.95] vertically in the view:
  const offsetY = (viewHeight - drawnH) / 2;
  return {
    scale,
    compW: COMP_W,
    compH: COMP_H,
    drawnW,
    drawnH,
    offsetX,
    offsetY,
    drawW: drawnW,
    drawH: drawnH,
    drawX: offsetX,
    drawY: offsetY,
    imgWidth: COMP_W,
    imgHeight: COMP_H,
  };
}

export function imageFracToCanvas(
  u: number,
  v: number,
  viewWidth = 1280,
  viewHeight = 720,
  targetCanvasOrImg?: HTMLCanvasElement | HTMLImageElement | null
) {
  const { drawnW, drawnH, offsetX, offsetY } = getConcourseCoverTransform(viewWidth, viewHeight, targetCanvasOrImg);
  return {
    x: offsetX + u * drawnW,
    y: offsetY + v * drawnH,
  };
}

export function canvasToImageFrac(
  x: number,
  y: number,
  viewWidth = 1280,
  viewHeight = 720,
  targetCanvasOrImg?: HTMLCanvasElement | HTMLImageElement | null
) {
  const { drawnW, drawnH, offsetX, offsetY } = getConcourseCoverTransform(viewWidth, viewHeight, targetCanvasOrImg);
  return {
    u: (x - offsetX) / drawnW,
    v: (y - offsetY) / drawnH,
  };
}

// Canonical 1896x1024 2x Mirrored Starport Concourse Door Triggers & Coordinates
export const STARPORT_DOORS: StarportDoorConfig[] = [
  { id: 'operations', name: 'Operations', index: 0, u: 0.263, v: 0.237, plateU: 0.263, plateV: 0.237, x: 499, y: 243, plateX: 499, plateY: 243, primaryColor: '#00f0ff', glowColor: '#38bdf8', badge: 'OPERATIONS', desc: 'Charters & Bulletins' },
  { id: 'personnel', name: 'Personnel', index: 1, u: 0.500, v: 0.148, plateU: 0.500, plateV: 0.148, x: 948, y: 152, plateX: 948, plateY: 152, primaryColor: '#10b981', glowColor: '#34d399', badge: 'PERSONNEL', desc: 'Academy & Recruitment' },
  { id: 'crew-assign', name: 'Crew Assignment', index: 2, u: 0.736, v: 0.237, plateU: 0.736, plateV: 0.237, x: 1395, y: 243, plateX: 1395, plateY: 243, primaryColor: '#a855f7', glowColor: '#c084fc', badge: 'CREW ASSIGNMENT', desc: 'Bridge Stations' },
  { id: 'bank', name: 'Bank', index: 3, u: 0.797, v: 0.731, plateU: 0.797, plateV: 0.731, x: 1511, y: 749, plateX: 1511, plateY: 749, primaryColor: '#facc15', glowColor: '#fde047', badge: 'BANK', desc: 'Accounts & Credit' },
  { id: 'ship-config', name: 'Ship Configuration', index: 4, u: 0.500, v: 0.902, plateU: 0.500, plateV: 0.902, x: 948, y: 924, plateX: 948, plateY: 924, primaryColor: '#f97316', glowColor: '#fb923c', badge: 'SHIP CONFIGURATION', desc: 'Modules & Drydock' },
  { id: 'trade-depot', name: 'Trade Depot', index: 5, u: 0.202, v: 0.731, plateU: 0.202, plateV: 0.731, x: 383, y: 749, plateX: 383, plateY: 749, primaryColor: '#38bdf8', glowColor: '#7dd3fc', badge: 'TRADE DEPOT', desc: 'Minerals & Relics' },
  { id: 'docking-bay', name: 'Docking Bay', index: 6, u: 0.500, v: 0.505, plateU: 0.500, plateV: 0.505, x: 948, y: 517, plateX: 948, plateY: 517, primaryColor: '#00f0ff', glowColor: '#38bdf8', badge: 'DOCKING BAY', desc: 'Center Launch Platform', isCenterPlatform: true },
];

export const SEALED_DOORS = [
  { id: 'sealed-left', name: 'Sealed Door', u: 0.147, v: 0.450, x: 279, y: 461 },
  { id: 'sealed-right', name: 'Sealed Door', u: 0.853, v: 0.450, x: 1617, y: 461 },
];

export function getDoorMatPosition(
  door: StarportDoorConfig,
  viewW = 1280,
  viewH = 720,
  targetCanvasOrImg?: HTMLCanvasElement | HTMLImageElement | null
): { x: number; y: number } {
  const { drawnW, drawnH, offsetX, offsetY } = getConcourseCoverTransform(viewW, viewH, targetCanvasOrImg);
  return {
    x: offsetX + (door.plateU ?? door.u) * drawnW,
    y: offsetY + (door.plateV ?? door.v) * drawnH,
  };
}

export { MINERAL_CATALOG, TRADE_COMMODITIES, getEnduriumPrice } from './utils/economy';

const INITIAL_CREW_ROSTER: CrewMember[] = [];

export function getAbsoluteDay(day: number, month: number, year: number): number {
  return (year - 4620) * 300 + (month - 1) * 30 + (day - 1);
}

export function parseDateString(dateStr: string): { day: number; month: number; year: number } {
  const parts = dateStr.split('-').map((p) => parseInt(p, 10));
  return { day: parts[0] || 1, month: parts[1] || 1, year: parts[2] || 4620 };
}

export const REPAIR_MINERALS: Record<'Hull' | SubsystemKey, { mineral: string; label: string }> = {
  Hull: { mineral: 'Aluminum', label: 'Hull Structure' },
  Engines: { mineral: 'Molybdenum', label: 'Sublight/Hyper Engines' },
  Sensors: { mineral: 'Copper', label: 'Long-Range Sensors' },
  Comms: { mineral: 'Silver', label: 'Subspace Transceiver' },
  Shields: { mineral: 'Titanium', label: 'Deflector Harmonizers' },
  Missiles: { mineral: 'Iron', label: 'Missile Launch Tubes' },
  Lasers: { mineral: 'Platinum', label: 'Pulse Laser Focusing Array' },
};

export const FULL_NOTICES_CATALOG: Omit<CorporateBulletin, 'read'>[] = [
  {
    id: 1,
    date: '01-01-4620',
    title: 'INTERSTEL COMMENCEMENT & EXPLORATION GRANT',
    author: 'Interstel Operations HQ',
    paragraphs: [
      'Welcome to active duty, Captain and crew! Under Interstel Exploration Mandate #4620, your newly commissioned vessel has been seeded with a starting grant of 12,000 M.U. in your operating account.',
      'Your primary mandate is the survey of uncharted star systems, recovery of vital Endurium crystalline fuel, and evaluation of potential Grade-A habitable colony worlds for the future of Arth civilization.',
    ],
  },
  {
    id: 2,
    date: '02-01-4620',
    title: 'COLONIZATION MANDATE & HABITABILITY STANDARDS',
    author: 'Arth Colonial Directorate',
    paragraphs: [
      'Arth faces critical overcrowding and resource depletion. All survey vessels are authorized to log and recommend viable planets via Command -> Log Planet while in orbit.',
      'WARNING: Recommending unsuitable worlds wastes colony transport ships and incurs severe fines from 100 up to 80,000 M.U. Verify planetary data before submission!',
    ],
  },
  {
    id: 8,
    date: '14-01-4620',
    title: 'SATELLITE WARNING: Atmospheric Ion Nebulae Hazards',
    author: 'Naval Operations Fleet Command',
    paragraphs: [
      'Dense electromagnetic nebulae scatter throughout hyperspace. Entering nebula sectors severely ionizes starship hulls and completely dampens deflector shield harmonic generators.',
      'Shields cannot be raised while navigating within any nebula haze.',
    ],
  },
  {
    id: 10,
    date: '01-06-4620',
    title: 'DIRECTORATE MEMO: Solar Flux Anomalies in Arth Sun',
    author: 'Interstel Astrophysics Bureau',
    paragraphs: [
      'Astrophysical telemetry confirms unprecedented magnetic flux and neutrino fluctuations within Arth’s primary sun.',
      'If current expansion rates continue, computer models predict catastrophic flare instability within the year.',
    ],
  },
  {
    id: 11,
    date: '01-09-4620',
    title: 'URGENT EVACUATION WARNING: Arth Stellar Instability',
    author: 'Arth Planetary Defense Council',
    paragraphs: [
      'Solar flare radiation levels in Arth’s corona have reached the critical threshold. Starport Arth has initiated preliminary personnel evacuation procedures.',
      'All exploration ships are urged to locate Precursor control ruins that may halt this accelerating stellar catastrophe.',
    ],
  },
  {
    id: 12,
    date: '10-10-4620',
    title: 'FINAL MANDATE: Galactic Salvation or Extinction',
    author: 'Interstel Supreme Directorate',
    paragraphs: [
      'Stellar flares have consumed multiple outer star systems. Sensor archives indicate an artificial harmonic transmission originating from sector [192, 152].',
      'The fate of Arth and the entire quadrant lies on your shoulders.',
    ],
  },
  {
    id: 13,
    date: '29-10-4620',
    title: 'EMERGENCY BROADCAST: Arth Solar Flare Imminent',
    author: 'Starport Arth Command [Automated]',
    paragraphs: [
      'SOLAR WARNING: Core collapse in progress. Starport Arth gantry is locking down for final evacuation. Within hours, the Arth sun will nova!',
      'Godspeed to all vessels remaining in deep space.',
    ],
  },
];

const LOCAL_STORAGE_KEY = 'STARFLIGHT_DISPATCH_STEP11_SAVES';

const SLOT_KEYS: Record<'A' | 'B' | 'C' | 'D' | 'E', string> = {
  A: 'starflight_save_slot_A',
  B: 'starflight_save_slot_B',
  C: 'starflight_save_slot_C',
  D: 'starflight_save_slot_D',
  E: 'starflight_save_slot_E',
};

const LEGACY_SLOT_KEYS: Record<'A' | 'B' | 'C' | 'D' | 'E', string> = {
  A: 'starflight_dispatch_slot_A',
  B: 'starflight_dispatch_slot_B',
  C: 'starflight_dispatch_slot_C',
  D: 'starflight_dispatch_slot_D',
  E: 'starflight_dispatch_slot_E',
};

const LAST_SLOT_KEY = 'starflight_last_save_slot';

const { get: safeStorageGet, set: safeStorageSet } = createSafeStorage(() =>
  typeof localStorage === 'undefined' ? null : localStorage);

function checkLocalStorageWorks(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    const k = '__sf_quota_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch (e) {
    return false;
  }
}

function isEphemeralOrSandboxed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const origin = window.location.origin;
    if (!origin || origin === 'null' || origin === 'about:blank') {
      return true;
    }
    if (window.location.href.startsWith('about:')) {
      return true;
    }
    if (window.self !== window.top) {
      return true;
    }
    if (!checkLocalStorageWorks()) {
      return true;
    }
  } catch (e) {
    return true;
  }
  return false;
}

function logStorageTelemetry() {
  if (typeof window === 'undefined') return;
  const origin = window.location.origin;
  const inIframe = window.self !== window.top;
  console.log('[SAVE SYSTEM] Origin:', origin);
  console.log('[SAVE SYSTEM] In iframe:', inIframe);

  const keysFound: { key: string; bytes: number }[] = [];
  try {
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.toLowerCase().includes('starflight_')) {
          const val = localStorage.getItem(k) || '';
          keysFound.push({ key: k, bytes: val.length });
        }
      }
    }
  } catch (e) {
    console.warn('[SAVE SYSTEM] Error reading localStorage keys:', e);
  }
  console.log('[SAVE SYSTEM] Storage keys found:', keysFound);
}

function loadInitialSaveSlots(): {
  slots: SaveSlotData[];
  lastSlot: 'A' | 'B' | 'C' | 'D' | 'E';
  storageAvailable: boolean;
} {
  const slots: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
  const storageAvailable = checkLocalStorageWorks();
  let lastSlot: 'A' | 'B' | 'C' | 'D' | 'E' = 'A';

  try {
    const storedLast = safeStorageGet(LAST_SLOT_KEY);
    if (storedLast && ['A', 'B', 'C', 'D', 'E'].includes(storedLast)) {
      lastSlot = storedLast as 'A' | 'B' | 'C' | 'D' | 'E';
    }
  } catch (e) {
    console.warn('Could not read last slot', e);
  }

  // Parse manifest backup if present
  let manifestSlots: unknown[] = [];
  let unsafeManifest=false;
  try {
    const rawManifest = safeStorageGet(LOCAL_STORAGE_KEY);
    if (rawManifest) {
      const parsed = parseSaveManifest(rawManifest);
      if (Array.isArray(parsed)) {
        manifestSlots = parsed;
      } else unsafeManifest=true;
    }
  } catch (e) {}

  const loadedSlots = slots.map((slotKey) => {
    let unsafeStoredData=unsafeManifest;
    try {
      const candidates = [
        safeStorageGet(SLOT_KEYS[slotKey]),
        safeStorageGet(LEGACY_SLOT_KEYS[slotKey]),
        safeStorageGet(`starflight_save_slot_${slotKey.toLowerCase()}`),
        safeStorageGet(`starflight_dispatch_slot_${slotKey.toLowerCase()}`),
      ];
      for (const cand of candidates) {
        if (cand) {
          const parsed = restorableSaveSlot(parseSaveJSON(cand),slotKey);
          if(parsed && !parsed.empty)return parsed;
          if(!parsed)unsafeStoredData=true;
        }
      }
      const fromManifest = manifestSlots.find((m) => m && typeof m==='object' && 'slot' in m && m.slot===slotKey && (!('empty' in m)||!m.empty));
      if (fromManifest) {
        const parsed=restorableSaveSlot(fromManifest,slotKey);
        if(parsed)return parsed;
        unsafeStoredData=true;
      }
    } catch (e) {
      console.warn('Could not load slot ' + slotKey, e);
    }

    return {
      slot: slotKey,
      ...(unsafeStoredData?{loadError:'Invalid or oversized saved mission data. Import a valid backup or choose another slot.'}:{}),
      timestamp: 'Empty',
      credits: 0,
      shipName: '---',
      stardate: '---',
      location: 'Starport' as GameLocation,
      empty: !unsafeStoredData,
    };
  });

  return { slots: loadedSlots, lastSlot, storageAvailable };
}

export { encodeSaveToBase64, decodeSaveFromBase64 } from './utils/save-codec';

function useGameInterfaceState() {
  const heldKeysRef = useRef<Record<string, boolean>>({});
  const missionEpochRef = useRef(0);
  const pendingBanterRepliesRef=useRef({epoch:0,count:0});
  const blockedSalvageRef = useRef(new Set<string>());
  const scheduleMissionEvent = useCallback((callback: () => void, delay: number) => {
    const epoch = missionEpochRef.current;
    window.setTimeout(() => {
      if (missionEpochRef.current === epoch) callback();
    }, delay);
  }, []);
  const frameUIDirtyRef = useRef(false);
  const lastFrameUIPublishRef = useRef(0);
  const [, publishFrameUI] = useState(0);
  const markFrameUIDirty = useCallback(() => { frameUIDirtyRef.current = true; }, []);
  const previousSystemPositionRef = useRef({ x: -88, y: 118 });
  const previousOrbitPhaseRef=useRef(0);
  const previousOrbitTransitionRef=useRef(1);
  const renderInterpolationRef = useRef(1);
  const performanceOutputRef = useRef<HTMLOutputElement>(null);
  const performanceSampleRef = useRef({ start: 0, previous: 0, frames: 0, draws: 0, renderMs: 0, uiRenders: 0, intervals: [] as number[] });
  performanceSampleRef.current.uiRenders++;
  const showPerformance = new URLSearchParams(window.location.search).has('perf');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleCanvasRef = useRef<HTMLCanvasElement>(null);
  const concourseOffscreenRef = useRef<HTMLCanvasElement | null>(null);
  const stepperRef = useRef<ReturnType<typeof createFixedStepper> | null>(null);
  const isMobile = useIsMobile();

  const { sdk } = usePlayground();
  const { assets } = useAssets(ASSETS_MANIFEST);

  const cachedRunCanvasesRef = useRef<PreparedRunCycle>({
    side: globalPreparedRunCanvases.side,
    up: globalPreparedRunCanvases.up,
    down: globalPreparedRunCanvases.down,
  });

  // Preprocess and slice run spritesheets once as soon as images load
  useEffect(() => {
    const checkAndPrepare = () => {
      const sideImg = assets['astronaut_run_spritesheet'];
      const downImg = assets['astronaut_run_down_spritesheet'];
      const upImg = assets['astronaut_run_up_spritesheet'];

      if (sideImg && sideImg.complete && sideImg.naturalWidth > 0 && cachedRunCanvasesRef.current.side.length === 0) {
        const prepared = getPreparedRunCanvases(sideImg);
        cachedRunCanvasesRef.current.side = prepared;
        globalPreparedRunCanvases.side = prepared;
      }
      if (downImg && downImg.complete && downImg.naturalWidth > 0 && cachedRunCanvasesRef.current.down.length === 0) {
        const prepared = getPreparedRunCanvases(downImg);
        cachedRunCanvasesRef.current.down = prepared;
        globalPreparedRunCanvases.down = prepared;
      }
      if (upImg && upImg.complete && upImg.naturalWidth > 0 && cachedRunCanvasesRef.current.up.length === 0) {
        const prepared = getPreparedRunCanvases(upImg);
        cachedRunCanvasesRef.current.up = prepared;
        globalPreparedRunCanvases.up = prepared;
      }
    };

    checkAndPrepare();

    const sideImg = assets['astronaut_run_spritesheet'];
    const downImg = assets['astronaut_run_down_spritesheet'];
    const upImg = assets['astronaut_run_up_spritesheet'];

    if (sideImg && !sideImg.complete) sideImg.addEventListener('load', checkAndPrepare, { once: true });
    if (downImg && !downImg.complete) downImg.addEventListener('load', checkAndPrepare, { once: true });
    if (upImg && !upImg.complete) upImg.addEventListener('load', checkAndPrepare, { once: true });
  }, [assets]);

  const canvasWidth = getConfig('baseCanvasWidth') as number;
  const canvasHeight = getConfig('baseCanvasHeight') as number;

  const [viewDimensions, setViewDimensions] = useState<{ width: number; height: number }>({
    width: canvasWidth,
    height: canvasHeight,
  });
  const viewportRef = useRef({ width: canvasWidth, height: canvasHeight });
  const concourseReportedRef = useRef(false);

  if (!stepperRef.current) {
    const stepMs = getConfig('stepMs');
    const maxSubSteps = getConfig('maxSubSteps');
    stepperRef.current = createFixedStepper(stepMs, maxSubSteps);
  }

  // Aspect ratio and viewport dimensions tracker for responsive high-DPI viewports
  const [containerAspectRatio, setContainerAspectRatio] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth / Math.max(1, window.innerHeight);
    }
    return 16 / 9;
  });

  useEffect(() => {
    const updateSize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const w = Math.round(rect.width);
          const h = Math.round(rect.height);
          setViewDimensions({ width: w, height: h });
          viewportRef.current = { width: w, height: h };
          setContainerAspectRatio(w / Math.max(1, h));
          return;
        }
      }
      const el = document.getElementById('game-viewport-16-9') || document.body;
      if (el) {
        const w = Math.round(el.clientWidth || window.innerWidth);
        const h = Math.round(el.clientHeight || window.innerHeight);
        setViewDimensions({ width: w, height: h });
        viewportRef.current = { width: w, height: h };
        setContainerAspectRatio(w / Math.max(1, h));
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // --- GAME STATE & PHASE ---
  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    score: 100,
    level: 1,
  });
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Location Enum
  const [gameLocation, setGameLocation] = useState<GameLocation>('Starport');
  const [prevGameLocation, setPrevGameLocation] = useState<GameLocation>('Hyperspace');
  /* cinematic state was here */
  const [hangarSparks, setHangarSparks, hangarSparksFrameRef] = useFrameState<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string }[]>([]);
  const [ambientScrubbots, setAmbientScrubbots, ambientScrubbotsFrameRef] = useFrameState<{ x: number; vx: number; hoverPhase: number }[]>([
    { x: 350, vx: 25, hoverPhase: 0 },
    { x: 850, vx: -20, hoverPhase: 1 },
  ]);
  const ambientCrewMembers = useRef<{ x: number; vx: number }[]>([
    { x: 450, vx: 18 },
    { x: 750, vx: -18 },
  ]).current;

  const [storageError, setStorageError] = useState<boolean>(() => !checkLocalStorageWorks());
  const isEphemeral = useMemo(() => isEphemeralOrSandboxed(), []);
  const savePersistenceNotice = isEphemeral
    ? 'Browser storage may be temporary here. Use Export Save to keep a backup of your mission.'
    : 'Saves stay in this browser. Use Export Save to back up or transfer your mission.';

  // Active Save Slot (A-E)
  const [activeSlot, setActiveSlot] = useState<'A' | 'B' | 'C' | 'D' | 'E'>(() => {
    try {
      const storedLast = safeStorageGet(LAST_SLOT_KEY);
      if (storedLast && ['A', 'B', 'C', 'D', 'E'].includes(storedLast)) {
        return storedLast as 'A' | 'B' | 'C' | 'D' | 'E';
      }
    } catch (e) {}
    return 'A';
  });
  const [devUsed, setDevUsed] = useState<boolean>(false);
  const [isDevPanelOpen, setIsDevPanelOpen] = useState<boolean>(false);
  const [devLabelsEnabled, setDevLabelsEnabled] = useState<boolean>(false);
  const [devActiveTab, setDevActiveTab] = useState<
    | 'gallery'
    | 'labels'
    | 'balance_time'
    | 'teleport'
    | 'cargo'
    | 'crew'
    | 'ship'
    | 'alien_encounter'
    | 'alien_mood'
    | 'flux'
    | 'telemetry'
  >('gallery');

  // Screen Gallery state
  const [gallerySearchQuery, setGallerySearchQuery] = useState<string>('');
  const [gallerySelectedCategory, setGallerySelectedCategory] = useState<string>('ALL');
  const [galleryActiveIndex, setGalleryActiveIndex] = useState<number>(0);

  // Dev Tool Form Inputs
  const [devBalanceInput, setDevBalanceInput] = useState<number>(50000);
  const [devDayInput, setDevDayInput] = useState<number>(1);
  const [devMonthInput, setDevMonthInput] = useState<number>(1);
  const [devYearInput, setDevYearInput] = useState<number>(4620);
  const [devHourInput, setDevHourInput] = useState<number>(0);
  const [devTeleportType, setDevTeleportType] = useState<'hyperspace' | 'star_system' | 'orbit' | 'starport'>('hyperspace');
  const [devTeleportX, setDevTeleportX] = useState<number>(125);
  const [devTeleportY, setDevTeleportY] = useState<number>(100);
  const [devTeleportStarId, setDevTeleportStarId] = useState<number>(1);
  const [devTeleportPlanetSlot, setDevTeleportPlanetSlot] = useState<number>(1);

  const [devMineralName, setDevMineralName] = useState<string>('Endurium');
  const [devMineralVolume, setDevMineralVolume] = useState<number>(20);
  const [devArtifactId, setDevArtifactId] = useState<string>('crystal-orb');
  const [devSpecimenName, setDevSpecimenName] = useState<string>('Chitinous Strider');
  const [devSpecimenSize, setDevSpecimenSize] = useState<'Small' | 'Medium' | 'Large' | 'Behemoth'>('Medium');
  const [devSpecimenVolume, setDevSpecimenVolume] = useState<number>(2.5);
  const [devSpecimenValue, setDevSpecimenValue] = useState<number>(3000);

  const [devSelectedCrewId, setDevSelectedCrewId] = useState<string>('crew-human-1');
  const [devCrewVitality, setDevCrewVitality] = useState<number>(100);
  const [devCrewSci, setDevCrewSci] = useState<number>(250);
  const [devCrewNav, setDevCrewNav] = useState<number>(200);
  const [devCrewEng, setDevCrewEng] = useState<number>(200);
  const [devCrewCom, setDevCrewCom] = useState<number>(200);
  const [devCrewMed, setDevCrewMed] = useState<number>(200);

  const [devHullInput, setDevHullInput] = useState<number>(250);
  const [devArmorInput, setDevArmorInput] = useState<number>(500);
  const [devShieldInput, setDevShieldInput] = useState<number>(500);

  const [devAlienRace, setDevAlienRace] = useState<AlienRace>('Elowan');
  const [devAlienVesselClass, setDevAlienVesselClass] = useState<VesselClass>('Warship');
  const [devAlienShipCount, setDevAlienShipCount] = useState<number>(3);
  const [devMoodRace, setDevMoodRace] = useState<AlienRace>('Elowan');
  const [devMoodState, setDevMoodState] = useState<DiplomaticPosture>('Friendly');
  const [devTargetRange, setDevTargetRange] = useState<number>(5.0);

  // Intro Sequence State
  const [introPage, setIntroPage] = useState<number>(0);

  // Settings & Graphics Options
  const [banterEnabled, setBanterEnabled] = useState(true);
  const [textSpeed, setTextSpeed] = useState<'Slow' | 'Normal' | 'Fast' | 'Instant'>('Normal');
  const [musicVol, setMusicVol] = useState(0.45);
  const [soundVol, setSoundVol] = useState(0.6);
  const [voicesVol, setVoicesVol] = useState<number>(() => {
    try {
      const stored = safeStorageGet('starflight_voices_volume');
      if (stored !== null) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
      }
    } catch {}
    return ((getConfig('defaultVoicesVolume' as any) as number) ?? 0.8);
  });
  const [alienVoiceEffectsEnabled, setAlienVoiceEffectsEnabled] = useState<boolean>(() => {
    try {
      const stored = safeStorageGet('starflight_alien_voice_effects');
      if (stored !== null) {
        return stored === 'true';
      }
    } catch {}
    return true;
  });
  const [devVoiceInput, setDevVoiceInput] = useState<string>('1');
  const [devVoiceStatus, setDevVoiceStatus] = useState<'idle' | 'playing' | 'no recording'>('idle');
  const [gfxQuality, setGfxQuality] = useState<GraphicsQuality>('High');
  const [screenShakeEnabled, setScreenShakeEnabled] = useState(true);
  const [crtFilterEnabled, setCrtFilterEnabled] = useState(false);
  const [largeTextEnabled, setLargeTextEnabled] = useState(false);
  const [tipsEnabled, setTipsEnabled] = useState(true);

  // Autosave toast state
  const [autosaveToast, setAutosaveToast] = useState<boolean>(false);
  const [saveDurable, setSaveDurable] = useState(true);
  const toastTimeoutRef = useRef<number | null>(null);

  // Export & Import Save State
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportSlotData, setExportSlotData] = useState<SaveSlotData | null>(null);
  const [exportTargetSlot, setExportTargetSlot] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [exportCodeString, setExportCodeString] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importDestSlot, setImportDestSlot] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [importCodeInput, setImportCodeInput] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
    restoredSlot?: 'A' | 'B' | 'C' | 'D' | 'E';
  } | null>(null);

  const [isQuitReminderOpen, setIsQuitReminderOpen] = useState<boolean>(false);
  const [replacementMission, setReplacementMission] = useState<SaveSlotData | null>(null);
  const [replacementMode,setReplacementMode]=useState<'new'|'reset'|'copy'>('new');
  const [copyTargetSlot,setCopyTargetSlot]=useState<SaveSlotData['slot']>('B');
  const [copyDestination,setCopyDestination]=useState<SaveSlotData|null>(null);
  const [slotActionNotice,setSlotActionNotice]=useState<string|null>(null);
  const [replacementStatus, setReplacementStatus] = useState<string | null>(null);
  const replacementReturnFocusRef = useRef<HTMLElement | null>(null);
  const replacementCancelRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (replacementMission && !isExportModalOpen) replacementCancelRef.current?.focus();
  }, [replacementMission,isExportModalOpen]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // First-time Tip tracker
  const [visitedTipScreens, setVisitedTipScreens] = useState<Record<string, boolean>>({});
  const [currentTip, setCurrentTip] = useState<{ title: string; text: string; officer: string } | null>(null);

  // Stardate (DD-MM-YYYY) & Clock
  const [stardateDay, setStardateDay] = useState(1);
  const [stardateMonth, setStardateMonth] = useState(1);
  const [stardateYear, setStardateYear] = useState(4620);
  const [stardateHour, setStardateHour] = useState(0);

  // Flare Engine & Galactic Climax State
  const [flaresStopped, setFlaresStopped] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [destroyedPlanetKeys, setDestroyedPlanetKeys] = useState<string[]>([]);
  const [uhlekSilenced, setUhlekSilenced] = useState<boolean>(false);
  const [elowanHostile, setElowanHostile] = useState<boolean>(false);
  const [victorySequenceModal, setVictorySequenceModal] = useState<boolean>(false);
  const [armBombPromptItem, setArmBombPromptItem] = useState<VehicleCargoItem | null>(null);
  const [visitedStarIds, setVisitedStarIds] = useState<number[]>([1]);

  // Hand Test 16: Crystal Planet Thermal Radiation & Black Egg Detonation State
  const [crystalHeatTicks, setCrystalHeatTicks, crystalHeatTicksFrameRef] = useFrameState<number>(0,markFrameUIDirty);
  const [devHeatX10, setDevHeatX10] = useState<boolean>(false);
  const crystalHeatAccumulatorRef = useRef<number>(0);
  const crystalHeatDefeatTriggeredRef = useRef(false);
  const [screenWhiteFlashTimer, setScreenWhiteFlashTimer] = useState<number>(0);
  const [armedDetonationTracker, setArmedDetonationTracker] = useState<{
    systemCoords: [number, number];
    planetIndex: number;
    lat: number;
    lon: number;
    isArmed: boolean;
  } | null>(null);

  const [starportDestroyed, setStarportDestroyed] = useState<boolean>(false);
  const [detonationSequence, setDetonationSequence, detonationSequenceRef] = useFrameState<DetonationSequence | null>(null);

  // Bank & Interest Tracking
  const [lastInterestAbsDay, setLastInterestAbsDay] = useState<number>(0);
  const [unsuitablePlanetsRecommendedCount, setUnsuitablePlanetsRecommendedCount] = useState<number>(0);
  const unsuitableCount = unsuitablePlanetsRecommendedCount; // alias for backwards compatibility

  // Colony Recommendation Pipeline State
  const [recommendedPlanets, setRecommendedPlanets] = useState<string[]>([]);
  const [loggedTelemetryPlanets, setLoggedTelemetryPlanets] = useState<string[]>([]);
  const [pendingRecommendations, setPendingRecommendations] = useState<PendingColonyRec[]>([]);
  const [isPromptingColonyRec, setIsPromptingColonyRec] = useState<boolean>(false);
  const [colonyPromptStep, setColonyPromptStep] = useState<'ask_recommend' | 'enter_name'>('ask_recommend');
  const [colonyNameInput, setColonyNameInput] = useState<string>('');

  // Distress Tow Confirmation Modal
  const [isPromptingDistress, setIsPromptingDistress] = useState<boolean>(false);

  // Funds & Bank
  const [credits, setCredits] = useState<number>(12000);
  const creditsLiveRef=useRef(credits);
  creditsLiveRef.current=credits;
  const [bankLedger, setBankLedger] = useState<BankLedgerEntry[]>([
    {
      date: '01-01-4620',
      desc: 'Interstel Commission Starting Grant',
      amount: 12000,
      balance: 12000,
    },
  ]);

  // Starport Concourse state
  const [astronautX, setAstronautX, astronautXFrameRef] = useFrameState<number>(640, markFrameUIDirty);
  const [astronautY, setAstronautY, astronautYFrameRef] = useFrameState<number>(462, markFrameUIDirty);
  const [astronautVx, setAstronautVx, astronautVxFrameRef] = useFrameState<number>(0, markFrameUIDirty);
  const [astronautVy, setAstronautVy, astronautVyFrameRef] = useFrameState<number>(0, markFrameUIDirty);
  const [astronautFacing, setAstronautFacing, astronautFacingFrameRef] = useFrameState<'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'>('S', markFrameUIDirty);
  const [astronautScaleX, setAstronautScaleX, astronautScaleXFrameRef] = useFrameState<number>(1.0); // smooth turn easing
  const [astronautAnimFrame, setAstronautAnimFrame, astronautAnimFrameFrameRef] = useFrameState<number>(0);
  const [astronautIdleTimer, setAstronautIdleTimer, astronautIdleTimerFrameRef] = useFrameState<number>(0);
  const [astronautDistanceTraveled, setAstronautDistanceTraveled, astronautDistanceTraveledFrameRef] = useFrameState<number>(0);
  const astronautDistanceTraveledRef = useRef<number>(0);
  const gantryCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dockingBayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [clickMoveTarget, setClickMoveTarget] = useState<{ x: number; y: number } | null>(null);
  const [transporterBeamProgress, setTransporterBeamProgress] = useState<number>(0);
  const [transporterParticles, setTransporterParticles, transporterParticlesFrameRef] = useFrameState<{ x: number; y: number; vy: number; life: number; maxLife: number; color: string; size: number }[]>([]);
  const [cameraX, setCameraX] = useState<number>(0);
  const [activeRoomIndex, setActiveRoomIndex] = useState<number | null>(null);
  const [doorSlideProgress, setDoorSlideProgress] = useState<number>(0); // 0 (closed) to 1 (open)
  const [enteringDoorIndex, setEnteringDoorIndex] = useState<number | null>(null);
  const [doorSteamParticles, setDoorSteamParticles] = useState<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    alpha: number;
  }[]>([]);

  // Track sealed door proximity notice to print once
  const nearSealedDoorRef = useRef<string | null>(null);

  const [bayVideoPlayer] = useState(() => new BayVideoPlayer());
  useEffect(() => () => bayVideoPlayer.dispose(), [bayVideoPlayer]);
  const [cinematicState, setCinematicState] = useState<CinematicState>('none');
  const [cinematicTimer, setCinematicTimer] = useState<number>(0);
  const cinematicStateRef = useRef<CinematicState>('none');
  const cinematicTimerRef = useRef<number>(0);
  const cinematicDurationRef=useRef(3);
  useEffect(()=>{void prepareBay();gameAudio.prepareBayAudio();},[]);
  const cinematicCompletingRef = useRef<boolean>(false);

  const startCinematic = useCallback((state: CinematicState, duration = 3.0) => {
    cinematicCompletingRef.current = false;
    cinematicStateRef.current = state;
    cinematicTimerRef.current = duration;
    cinematicDurationRef.current = duration;
    setCinematicTimer(duration);
    setCinematicState(state);
  }, []);

  // Nearby Door in Concourse with exact cover scale transformation
  const nearbyConcourseDoor = useMemo(() => {
    if (gameLocation !== 'Starport' || activeRoomIndex !== null || cinematicState !== 'none') return null;
    const concourseCanvas = getConcourseCanvas(assets);
    const { drawnW, drawnH, offsetX, offsetY, scale } = getConcourseCoverTransform(
      viewDimensions.width,
      viewDimensions.height,
      concourseCanvas
    );
    let closest: StarportDoorConfig | null = null;
    let closestDist = 70 * Math.max(1, scale / 1.25);
    for (const d of STARPORT_DOORS) {
      const dx = offsetX + d.u * drawnW;
      const dy = offsetY + d.v * drawnH;
      const pmx = offsetX + (d.plateU ?? d.u) * drawnW;
      const pmy = offsetY + (d.plateV ?? d.v) * drawnH;
      const dist = Math.min(
        Math.hypot(astronautX - dx, astronautY - dy),
        Math.hypot(astronautX - pmx, astronautY - pmy)
      );
      if (dist < closestDist) {
        closestDist = dist;
        closest = d;
      }
    }
    return closest;
  }, [gameLocation, activeRoomIndex, cinematicState, astronautX, astronautY, viewDimensions, assets]);

  // Operations room paginated navigation state
  const [opsSubTab, setOpsSubTab] = useState<'bulletins' | 'evaluations' | 'directives'>('bulletins');
  const [activeNoticeIndex, setActiveNoticeIndex] = useState<number>(0);
  const [activeEvalIndex, setActiveEvalIndex] = useState<number>(0);

  // Selected Personnel for Training / Hire
  const [selectedPersonnelCrewId, setSelectedPersonnelCrewId] = useState<string>('crew-human-1');
  const [trainingAnimation, setTrainingAnimation] = useState<{ skill: keyof Skills; progress: number } | null>(null);

  // Bank Loan and Account states
  const [bankSubTab, setBankSubTab] = useState<'account' | 'loan' | 'ledger'>('account');
  const [bankAmountInput, setBankAmountInput] = useState<number>(500);

  // Trade Depot tab
  const [tradeSubTab, setTradeSubTab] = useState<'minerals' | 'artifacts' | 'specimens' | 'endurium'>('minerals');
  const [tradeDepotMessage,setTradeDepotMessage]=useState<string|null>(null);
  const [tradeQuantity, setTradeQuantity] = useState<number>(5);

  // Ship Attributes
  const [shipName, setShipName] = useState('');
  const [engineClass, setEngineClass] = useState<number>(1);
  const [shieldClass, setShieldClass] = useState<number>(0);
  const [shieldsRaised, setShieldsRaised] = useState<boolean>(false);
  const [playerShieldPoints, setPlayerShieldPoints, playerShieldPointsFrameRef] = useFrameState<number>(0, markFrameUIDirty);
  const [weaponsArmed, setWeaponsArmed] = useState<boolean>(false);
  const [armorClass, setArmorClass] = useState<number>(0);
  const [playerArmorPoints, setPlayerArmorPoints, playerArmorPointsFrameRef] = useFrameState<number>(250, markFrameUIDirty);
  const [missileClass, setMissileClass] = useState<number>(0);
  const [laserClass, setLaserClass] = useState<number>(0);
  const [cargoPods, setCargoPods] = useState<number>(0);
  const [enduriumFuel, setEnduriumFuel, enduriumFuelFrameRef] = useFrameState<number>(20.0, markFrameUIDirty);
  const [hullIntegrity, setHullIntegrity, hullIntegrityFrameRef] = useFrameState<number>(250, markFrameUIDirty);

  useEffect(()=>{void prepareConfiguredShip({cargoPods,armorClass,laserClass,missileClass});},[cargoPods,armorClass,laserClass,missileClass]);

  // Re-render gantry canvases with animation loop for engine flame & armor sheen
  useEffect(() => {
    if (activeRoomIndex !== 4 && activeRoomIndex !== 6) return;
    let animId: number;
    const render = () => {
      if (activeRoomIndex === 4 && gantryCanvasRef.current) {
        renderGantryShipCanvas(
          gantryCanvasRef.current,
          assets,
          engineClass,
          cargoPods,
          armorClass,
          shieldClass,
          missileClass,
          laserClass,
          0,
          gfxQuality,
        );
      }
      if (activeRoomIndex === 6 && dockingBayCanvasRef.current) {
        renderGantryShipCanvas(
          dockingBayCanvasRef.current,
          assets,
          engineClass,
          cargoPods,
          armorClass,
          shieldClass,
          missileClass,
          laserClass,
          clampReleaseProgressRef.current,
          gfxQuality,
        );
      }
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeRoomIndex, assets, engineClass, cargoPods, armorClass, shieldClass, missileClass, laserClass, gfxQuality]);

  // Reset clamp release state when leaving docking bay or canceling
  useEffect(() => {
    if (activeRoomIndex !== 6) {
      if (clampReleaseAnimIdRef.current !== null) {
        cancelAnimationFrame(clampReleaseAnimIdRef.current);
        clampReleaseAnimIdRef.current = null;
      }
      clampReleaseProgressRef.current = 0;
      setClampReleaseProgress(0);
      setIsReleasingClamps(false);
    }
  }, [activeRoomIndex]);

  // Ship Configuration Dialog Modals (Naming, Selling, Repairing)
  const [isNamingShipModal, setIsNamingShipModal] = useState<boolean>(false);
  const [shipNameInput, setShipNameInput] = useState<string>('');
  const [shipConfigMessage, setShipConfigMessage] = useState<string | null>(null);
  const [shipConfigMode, setShipConfigMode] = useState<'buy' | 'sell' | 'repair'>('buy');

  // Personnel Modal & Mode State
  const [isCreatingCrewModal, setIsCreatingCrewModal] = useState<boolean>(false);
  const [newCrewNameInput, setNewCrewNameInput] = useState<string>('');
  const [newCrewRaceSelect, setNewCrewRaceSelect] = useState<Species>('Human');
  const [personnelIndex, setPersonnelIndex] = useState<number>(0);
  const [isTrainingSkillModal, setIsTrainingSkillModal] = useState<boolean>(false);
  const [selectedTrainingSkills,setSelectedTrainingSkills]=useState<(keyof Skills)[]>([]);
  const trainingPurchaseLockRef=useRef(false);
  const [crewNameSource,setCrewNameSource]=useState<NameSource>('Any series');
  const [personnelMessage, setPersonnelMessage] = useState<string | null>(null);

  // Ship Subsystems Damage State (100 down to 0)
  const [subsystems, setSubsystems, subsystemsFrameRef] = useFrameState<Record<SubsystemKey, number>>({
    Engines: 100,
    Sensors: 100,
    Comms: 100,
    Shields: 100,
    Missiles: 100,
    Lasers: 100,
  }, markFrameUIDirty);

  // Malfunction inoperative flags
  const [inoperativeSystems, setInoperativeSystems] = useState<Record<SubsystemKey, boolean>>({
    Engines: false,
    Sensors: false,
    Comms: false,
    Shields: false,
    Missiles: false,
    Lasers: false,
  });

  // Active in-flight continuous mineral repair task
  const [activeRepairTask, setActiveRepairTask, activeRepairTaskFrameRef] = useFrameState<ActiveRepairTask | null>(null, markFrameUIDirty);
  const [selectedRepairTarget, setSelectedRepairTarget] = useState<'Hull' | SubsystemKey>('Hull');
  const [confirmRepairTarget, setConfirmRepairTarget] = useState<'Hull' | SubsystemKey | null>(null);

  // Medical state
  const [selectedMedicalCrewId, setSelectedMedicalCrewId] = useState<string>('crew-human-1');
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [medicalMode, setMedicalMode] = useState<'status' | 'examine' | 'treat'>('status');

  // Engineering Sub-mode: 'menu' | 'damage' | 'repair'
  const [engineeringMode, setEngineeringMode] = useState<'menu' | 'damage' | 'repair'>('menu');

  // Science Sub-mode
  const [scienceReadingRecord, setScienceReadingRecord] = useState<ScienceReading | null>(null);
  const scienceEpochRef = useRef(0);
  const scienceContextRef = useRef('');
  const alienScanRef = useRef<AlienSensorScan | null>(null);
  const setScienceReading = useCallback((text:string|null)=>{
    setScienceReadingRecord(text===null?null:{context:scienceContextRef.current,text});
  },[]);

  const [planetaryScan,setPlanetaryScan] = useState<PlanetaryScanState|null>(null);
  const planetaryScanRef = useRef<PlanetaryScanState|null>(null);
  const updatePlanetaryScan = useCallback((scan:PlanetaryScanState|null)=>{planetaryScanRef.current=scan;setPlanetaryScan(scan);},[]);

  // Special Campaign Lore / Item Flags
  const [hasPurchasedBlackBox, setHasPurchasedBlackBox] = useState<boolean>(false);
  const [grantedDroneClearanceUntilHyperspace, setGrantedDroneClearanceUntilHyperspace] = useState<boolean>(false);
  const [mechan9Unlocked,setMechan9Unlocked]=useState(false);
  const [hasGivenEllipsoid, setHasGivenEllipsoid] = useState<boolean>(false);
  const [hasRefusedCrystalOrb, setHasRefusedCrystalOrb] = useState<boolean>(false);

  // Traversed Flux Link IDs
  const [traversedFluxIds, setTraversedFluxIds] = useState<number[]>([]);

  // Current active star ID
  const [currentStarId, setCurrentStarId] = useState<number>(1);

  // Active current Star Object
  const currentStar = useMemo(() => {
    return UNIVERSE.stars.find((s) => s.id === currentStarId) || UNIVERSE.stars[0];
  }, [currentStarId]);

  // Galaxy Coordinates (0..249, 0..219)
  const [galaxyShipX, setGalaxyShipX, galaxyShipXFrameRef] = useFrameState<number>(125.0, markFrameUIDirty);
  const [galaxyShipY, setGalaxyShipY, galaxyShipYFrameRef] = useFrameState<number>(100.0, markFrameUIDirty);
  const galaxyShipXRef = useRef<number>(125.0);
  const galaxyShipYRef = useRef<number>(100.0);
  const [hyperZoom, setHyperZoom] = useState<number>(2.5);

  // Star System Coordinates & Zoom
  const [systemShipX, setSystemShipX, systemShipXFrameRef] = useFrameState<number>(-88, markFrameUIDirty);
  const [systemShipY, setSystemShipY, systemShipYFrameRef] = useFrameState<number>(118, markFrameUIDirty);
  const [systemZoom, setSystemZoom] = useState<number>(8.0); // 8.0 = zoomed in following ship (~16px ship, Arth ~160px), 0.65 = overview

  // Window / Document title & unit test runner attachment
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Starflight: Junior Crew';
    }
    if (typeof window !== 'undefined') {
      import('./ship.test')
        .then((mod) => {
          (window as any).runShipTests = mod.runShipTests;
        })
        .catch(() => {});
    }
  }, []);

  // Wheel listener for smooth Star System zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (e: WheelEvent) => {
      if (gameLocation === 'Star System') {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.25 : 0.8;
        setSystemZoom((z) => Math.max(0.65, Math.min(8.0, +(z * factor).toFixed(2))));
      }
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [gameLocation]);

  const [shipVx, setShipVx, shipVxFrameRef] = useFrameState<number>(0, markFrameUIDirty);
  const [shipVy, setShipVy, shipVyFrameRef] = useFrameState<number>(0, markFrameUIDirty);
  const [shipHeading, setShipHeading, shipHeadingFrameRef] = useFrameState<number>(Math.PI * 0.75, markFrameUIDirty);

  const [orbitPlanetIndex, setOrbitPlanetIndex] = useState<number | null>(null);

  // Planet Landing and Surface State
  const [landingLat, setLandingLat] = useState<number>(15);
  const [landingLong, setLandingLong] = useState<number>(-30);
  const [gameOverModal, setGameOverModal] = useState<{ title: string; desc: string; poignantLine: string } | null>(null);

  // Terrain Vehicle & Surface State
  const [vehicleDestroyed, setVehicleDestroyed] = useState<boolean>(false);
  const [groundZoom,setGroundZoom,groundZoomRef]=useFrameState(1,markFrameUIDirty);
  const [vehicleFuel, setVehicleFuel, vehicleFuelFrameRef] = useFrameState<number>(100.0, markFrameUIDirty);
  const [vehicleHold, setVehicleHold, vehicleHoldFrameRef] = useFrameState<VehicleCargoItem[]>([], markFrameUIDirty);
  const [vehicleX, setVehicleX, vehicleXFrameRef] = useFrameState<number>(0.0, markFrameUIDirty);
  const [vehicleY, setVehicleY, vehicleYFrameRef] = useFrameState<number>(0.6, markFrameUIDirty);
  const [vehicleHeading, setVehicleHeading, vehicleHeadingFrameRef] = useFrameState<number>(0, markFrameUIDirty);
  const [roverWaypoint, setRoverWaypoint] = useState<{ x: number; y: number } | null>(null);
  const roverWaypointRef = useRef<{ x: number; y: number } | null>(null);
  roverWaypointRef.current = roverWaypoint;
  const [vehicleWeapon, setVehicleWeapon] = useState<'Stunner' | 'Laser'>('Stunner');
  const [roverWeaponMenuOpen, setRoverWeaponMenuOpen] = useState<boolean>(false);
  const [roverCargoModalOpen, setRoverCargoModalOpen] = useState<boolean>(false);
  const [roverLookData, setRoverLookData] = useState<{
    sky: string;
    temp: string;
    gravity: string;
    atmosphere: string;
    hydrosphere: string;
    topology: string;
    pointsOfInterest: string[];
  } | null>(null);
  const [discoveredSpecies, setDiscoveredSpecies] = useState<string[]>([]);
  const [surveyKnowledge, setSurveyKnowledge, surveyKnowledgeFrameRef] = useFrameState<SurveyKnowledge>(emptySurveyKnowledge(),markFrameUIDirty);
  const [surfaceRecording, setSurfaceRecording, surfaceRecordingFrameRef] = useFrameState<SurfaceRecording|null>(null,markFrameUIDirty);
  const [miningSession,setMiningSession,miningSessionRef]=useFrameState<MiningSession|null>(null,markFrameUIDirty);
  const [miningOpen,setMiningOpen]=useState(false);
  const [miningTargetId,setMiningTargetId]=useState<string|null>(null);
  const [miningMessage,setMiningMessage]=useState('');
  const [lastMiningExtracted,setLastMiningExtracted]=useState(0);
  const [currentSurfaceState, setCurrentSurfaceState] = useState<PlanetSurfaceState | null>(null);
  const planetSurfacesRef = useRef<Record<string, PlanetSurfaceState>>({});

  // Surface Visual FX (Pass G4)
  const [roverTireTracks, setRoverTireTracks, roverTireTracksFrameRef] = useFrameState<TireTrack[]>([]);
  const [roverDustParticles, setRoverDustParticles, roverDustParticlesFrameRef] = useFrameState<RoverDustParticle[]>([]);
  const [surfaceWeatherParticles, setSurfaceWeatherParticles, surfaceWeatherParticlesFrameRef] = useFrameState<SurfaceWeatherParticle[]>([]);
  const [surfaceSonarPulse, setSurfaceSonarPulse, surfaceSonarPulseFrameRef] = useFrameState<{ active: boolean; radius: number; maxRadius: number; x: number; y: number }>({
    active: false,
    radius: 0,
    maxRadius: 16.0,
    x: 0,
    y: 0,
  });
  const [surfaceScanFadeTimer, setSurfaceScanFadeTimer, surfaceScanFadeTimerFrameRef] = useFrameState<number>(0);
  const [surfaceWeaponBeam, setSurfaceWeaponBeam,surfaceWeaponBeamRef] = useFrameState<{ active: boolean; type: 'stunner' | 'laser'; startX: number; startY: number; endX: number; endY: number; timer: number } | null>(null,markFrameUIDirty);
  const [tractorBeamFx, setTractorBeamFx, tractorBeamFxFrameRef] = useFrameState<{ active: boolean; x: number; y: number; timer: number; color: string } | null>(null);
  const [isSurfaceMapOpen, setIsSurfaceMapOpen] = useState<boolean>(false);
  const [surfaceRuinModal, setSurfaceRuinModal] = useState<SurfaceRuin | null>(null);
  const [roverSuspensionBounce, setRoverSuspensionBounce, roverSuspensionBounceFrameRef] = useFrameState<number>(0);
  const [isRoverMoving, setIsRoverMoving] = useState<boolean>(false);
  const [redVignetteFlash, setRedVignetteFlash, redVignetteFlashFrameRef] = useFrameState<number>(0);

  // Console and Display panel modes
  const [activeConsoleMenu, setActiveConsoleMenu] = useState<BridgeConsoleSubmenu>('Bridge');
  const [displayPanelMode, setDisplayPanelMode] = useState<DisplayPanelMode>('system_map');
  const [tacticalStatusModal, setTacticalStatusModal] = useState<boolean>(false);

  // Starmap Interactive Modal
  const [isStarmapOpen, setIsStarmapOpen] = useState<boolean>(false);
  const [starmapSelectedStarId, setStarmapSelectedStarId] = useState<number | null>(null);
  const [starmapHoverStarId, setStarmapHoverStarId] = useState<number | null>(null);
  const [starmapZoom,setStarmapZoom]=useState(1),[starmapCenter,setStarmapCenter]=useState({x:125,y:110});
  const chartView=starmapView(starmapZoom,starmapCenter);
  const zoomStarChart=(multiplier:number)=>{const selected=UNIVERSE.stars.find(s=>s.id===starmapSelectedStarId);if(multiplier>1&&starmapZoom===1)setStarmapCenter(selected??{x:galaxyShipXFrameRef.current,y:galaxyShipYFrameRef.current});setStarmapZoom(z=>Math.max(1,Math.min(8,z*multiplier)));};

  // Space Visual FX State (G3 Overhaul)
  const [orbitAnimPhase, setOrbitAnimPhase, orbitAnimPhaseFrameRef] = useFrameState<number>(0,markFrameUIDirty);
  const hyperspaceDepartureStarRef=useRef<number|null>(null);
  const hyperspaceEnteringRef=useRef(false);
  const [warpStreakParticles, setWarpStreakParticles, warpStreakParticlesFrameRef] = useFrameState<{ x: number; y: number; length: number; speed: number; alpha: number }[]>([]);
  const [starFlareParticles, setStarFlareParticles, starFlareParticlesFrameRef] = useFrameState<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number }[]>([]);
  const [orbitTransitionProgress, setOrbitTransitionProgress, orbitTransitionProgressFrameRef] = useFrameState<number>(1.0); // 1 = fully settled
  const [radarScanAngle, setRadarScanAngle, radarScanAngleFrameRef] = useFrameState<number>(0);
  const [screenShake, setScreenShake, screenShakeFrameRef] = useFrameState<number>(0);

  // Flux Warp Effect State
  const [fluxFlashTimer, setFluxFlashTimer, fluxFlashTimerFrameRef] = useFrameState<number>(0);
  const [fluxDisorientationTimer, setFluxDisorientationTimer, fluxDisorientationTimerRef] = useFrameState<number>(0, markFrameUIDirty);
  const isDisoriented = fluxDisorientationTimer > 0;
  const [scrambledCoords, setScrambledCoords] = useState<{ x: number; y: number }>({ x: 742, y: 319 });
  const scrambledTimerRef = useRef<number>(0);

  // Maneuver directional input state
  const [activeDirectionVector, setActiveDirectionVector] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Tactical Projectiles on Encounter Grid
  const [projectiles, setProjectiles, projectilesFrameRef] = useFrameState<TacticalProjectile[]>([], markFrameUIDirty);
  const [lastShotResult, setLastShotResult] = useState<string>('IDLE');

  // G5 Encounter Visual FX States
  const [tacticalSparks, setTacticalSparks, tacticalSparksFrameRef] = useFrameState<TacticalSpark[]>([]);
  const [tacticalExplosions, setTacticalExplosions, tacticalExplosionsFrameRef] = useFrameState<TacticalExplosion[]>([]);
  const [tacticalShieldRipples, setTacticalShieldRipples, tacticalShieldRipplesFrameRef] = useFrameState<TacticalShieldRipple[]>([]);
  const [missileSmokeTrails, setMissileSmokeTrails, missileSmokeTrailsFrameRef] = useFrameState<MissileSmokeTrail[]>([]);
  const [encounterBannerTimer, setEncounterBannerTimer] = useState<number>(0);
  const [encounterBannerText, setEncounterBannerText] = useState<string>('');
  const [tractorSalvageFx, setTractorSalvageFx, tractorSalvageFxFrameRef] = useFrameState<{ x: number; y: number; targetX: number; targetY: number; timer: number; text: string } | null>(null);

  // Comms Typewriter & Speech State
  const [commsTypewriterElapsed, setCommsTypewriterElapsed, commsTypewriterElapsedFrameRef] = useFrameState<number>(10, markFrameUIDirty);
  const [alienEyeBlinkTimer, setAlienEyeBlinkTimer, alienEyeBlinkTimerFrameRef] = useFrameState<number>(0, markFrameUIDirty);
  const [questionCountdownTimer, setQuestionCountdownTimer, questionCountdownTimerFrameRef] = useFrameState<number>(60, markFrameUIDirty);
  const [questionTotalTime, setQuestionTotalTime] = useState<number>(60);
  const [isQuestionReminderActive, setIsQuestionReminderActive] = useState<boolean>(false);

  // Ship's Log Modal State (All 4 Tabs: Notices, Alien Comms, Messages, Planets)
  const [isShipsLogOpen, setIsShipsLogOpen] = useState<boolean>(false);
  const [shipsLogTab, setShipsLogTab] = useState<'notices' | 'alien_comms' | 'messages' | 'planets'>('notices');
  const [shipsLogNoticeIdx, setShipsLogNoticeIdx] = useState<number>(0);
  const [shipsLogAlienIdx, setShipsLogAlienIdx] = useState<number>(0);
  const [shipsLogPlanetIdx, setShipsLogPlanetIdx] = useState<number>(0);
  const [shipsLogMsgFilter, setShipsLogMsgFilter] = useState<'all' | 'alert' | 'info' | 'banter'>('all');
  const [shipsLogMsgSearch,setShipsLogMsgSearch]=useState('');

  // Turn-Based Encounter Simulation State
  const [commLineUsage, setCommLineUsage] = useState<Record<number, number>>(() => {
    try {
      const stored = safeStorageGet('starflight_comm_line_usage');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return { ...globalCommLineUsage };
  });
  const commLineUsageRef = useRef<Record<number, number>>(commLineUsage);
  const commTopicProgressRef=useRef<Record<string,number>>({});
  commLineUsageRef.current = commLineUsage;

  const [alienGroups, setAlienGroups] = useState<AlienGroup[]>(() => generateAlienGroups());
  const alienGroupsRef = useRef<AlienGroup[]>(alienGroups);
  alienGroupsRef.current = alienGroups;
  const fleetChangesRef = useRef<Record<string,AlienGroup>>({});
  const alienTrackingHourRef = useRef<number | null>(null);
  const flightEncounterStartedRef = useRef(false);
  useEffect(()=>{if(gameLocation!=='Encounter') flightEncounterStartedRef.current=false;},[gameLocation]);

  // Persistent Species Base Mood (0 to 100)
  const [speciesBaseMoods, setSpeciesBaseMoods] = useState<Record<AlienRace, number>>({
    ...DEFAULT_BASE_MOODS,
  });

  const [activeEncounterGroup, setActiveEncounterGroup] = useState<AlienGroup | null>(null);
  const [encounterShipPos, setEncounterShipPos, encounterShipPosFrameRef] = useFrameState<{ x: number; y: number }>({ x: 0, y: 0 }, markFrameUIDirty);
  const [encounterTargetIndex, setEncounterTargetIndex] = useState<number>(0);
  const currentScienceContext=scienceContext(gameLocation,currentStarId,orbitPlanetIndex,activeEncounterGroup,encounterTargetIndex,scienceEpochRef.current);
  if(scienceContextRef.current!==currentScienceContext){
    scienceContextRef.current=currentScienceContext;
    alienScanRef.current=null;
  }
  const scienceReading=visibleScienceReading(scienceReadingRecord,currentScienceContext);
  useEffect(()=>{setScienceReadingRecord(previous=>previous?.context===currentScienceContext?previous:null);},[currentScienceContext]);
  const [encounterCooldownTimer, setEncounterCooldownTimer, encounterCooldownTimerFrameRef] = useFrameState<number>(0);
  const tacticalCameraRef = useRef<{ x: number; y: number; cellSize: number }>({
    x: 0,
    y: 7,
    cellSize: 35,
  });

  // Cooldown timers for player weapons
  const [laserCooldown, setLaserCooldown, laserCooldownFrameRef] = useFrameState<number>(0, markFrameUIDirty);
  const [missileCooldown, setMissileCooldown, missileCooldownFrameRef] = useFrameState<number>(0, markFrameUIDirty);

  // Flight clock simulation accumulator (1 star hour per 10s of flight)
  const flightClockAccumulatorRef = useRef<number>(0);
  const previousStarHoursRef = useRef<number>(0);

  // Weapon shots fired in current encounter (for context-sensitive banter)
  const encounterShotsFiredRef = useRef<{ laser: number; missile: number }>({ laser: 0, missile: 0 });
  const lastWeaponFiredRef = useRef<'laser' | 'missile' | null>(null);

  // Combat discrete single-keypress input buffer
  const combatInputBufferRef = useRef<{ dx: number; dy: number } | null>(null);
  const encounterDriveRef = useRef(stoppedEncounterDrive());

  // Round-robin pass timer (250ms = 1 pass)
  const passTimerRef = useRef<number>(0);
  const encounterPassIndexRef = useRef<number>(0);
  const combatDurationTimerRef = useRef<number>(0);
  const isCombatActiveRef = useRef<boolean>(false);

  const [alienCommsState, setAlienCommsState] = useState<AlienCommsState>({
    active: false,
    connected: false,
    playerPosture: 'Neutral',
    alienPosture: 'Neutral',
    alienMood: 50,
    conversationCount: 0,
    maxPhrases: 6,
    pendingAlienQuestion: null,
    activeTradeOffer: null,
    activeTriviaQuestion: null,
    activeAssistanceRequest: null,
    alienHailsCount: 0,
    lastAlienSpeakerText: '',
    lastGarbledAlienText: '',
    lastCaptainText: '',
    activeSubject: null,
    dialogueHistory: [],
  });
  const initialAlienCommsRef = useRef(structuredClone(alienCommsState));
  const endingTransmissionGroupRef = useRef<string | null>(null);
  const resolvedPriorityBusinessRef = useRef<AlienCommsState['pendingPriorityBusiness']>(null);
  const resolvedAlienQuestionRef = useRef<AlienCommsState['pendingAlienQuestion']>(null);

  // Cargo & Artifacts (A new ship starts carrying ONLY its 20.0 m³ of Endurium)
  const [cargoHold, setCargoHold, cargoHoldFrameRef] = useFrameState<Record<string, number>>({
    Aluminum: 0,
    Cobalt: 0,
    Molybdenum: 0,
    Promethium: 0,
    Titanium: 0,
  }, markFrameUIDirty);

  const [artifactsInHold, setArtifactsInHold] = useState<ArtifactItem[]>([]);
  const [artifactStock, setArtifactStock, artifactStockFrameRef] = useFrameState<DepotArtifact[]>(initialArtifactStock(),markFrameUIDirty);
  const [specimensInHold, setSpecimensInHold] = useState<VehicleCargoItem[]>([]);

  const artifactsInHoldRef = useRef(artifactsInHold);
  artifactsInHoldRef.current = artifactsInHold;

  const specimensInHoldRef = useRef(specimensInHold);
  specimensInHoldRef.current = specimensInHold;

  const cargoHoldRef = useRef(cargoHold);
  cargoHoldRef.current = cargoHold;

  // Personnel & Posts
  const [crewRoster, setCrewRoster, crewRosterFrameRef] = useFrameState<CrewMember[]>(INITIAL_CREW_ROSTER, markFrameUIDirty);
  const [assignedPosts, setAssignedPosts] = useState<Record<CrewPost, string | null>>({
    Captain: null,
    'Science Officer': null,
    Navigator: null,
    Engineer: null,
    Communications: null,
    Doctor: null,
  });
  const assignedPostsLiveRef=useRef(assignedPosts);
  assignedPostsLiveRef.current=assignedPosts;
  const getCrewAboard=useCallback(()=>assignedCrew(crewRosterFrameRef.current,assignedPostsLiveRef.current),[]);
  const certifiedCrewCount = CREW_POSTS.filter(post =>
    crewRoster.some(officer => officer.id === assignedPosts[post] && officer.alive)
  ).length;

  // Bulletins & Evaluations
  const [bulletins, setBulletins] = useState<CorporateBulletin[]>(() => {
    return FULL_NOTICES_CATALOG.filter((b) => {
      const bDate = parseDateString(b.date);
      return getAbsoluteDay(bDate.day, bDate.month, bDate.year) <= 0;
    }).map((b) => ({ ...b, read: true }));
  });
  const [evaluations, setEvaluations] = useState<ColonyEvaluation[]>([]);

  // Messages & Logs
  const [systemMessages, setSystemMessages] = useState<
    { id: string; text: string; post?: CrewPost; speaker?: string; type?: 'info' | 'alert' | 'banter' }[]
  >([
    {
      id: 'init-msg',
      text: 'Starport Arth operations gantry online. Ready for dispatch.',
      type: 'info',
    },
  ]);

  const [banterLog, setBanterLog] = useState<{ speaker: string; text: string; post: CrewPost }[]>([
    {
      speaker: 'Jax Vance',
      post: 'Captain',
      text: 'Starport terminal verified. All crew ready for deep-space dispatch.',
    },
  ]);

  // Modal Dialogs
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [pauseMenuTab, setPauseMenuTab] = useState<'main' | 'slots' | 'settings' | 'help'>('main');

  // Captain's Starship Cargo Hold Modal State
  const [isShipCargoModalOpen, setIsShipCargoModalOpen] = useState<boolean>(false);
  const [describedCargoItem, setDescribedCargoItem] = useState<{ name: string; desc: string; volume: number; value?: number } | null>(null);

  // Formatted Stardate
  const formattedStardate = useMemo(() => {
    const d = String(stardateDay).padStart(2, '0');
    const m = String(stardateMonth).padStart(2, '0');
    const y = String(stardateYear);
    return `${d}-${m}-${y}`;
  }, [stardateDay, stardateMonth, stardateYear]);

  // Docking Bay Launch Failure Warnings (Rule 5)
  const [dockingBayWarnings, setDockingBayWarnings] = useState<string[]>([]);
  const [clampReleaseProgress, setClampReleaseProgress] = useState<number>(0);
  const clampReleaseProgressRef = useRef<number>(0);
  const [isReleasingClamps, setIsReleasingClamps] = useState<boolean>(false);
  const clampReleaseAnimIdRef = useRef<number | null>(null);

  // Bank Transaction Logger (Rule 6)
  const addBankTransaction = useCallback((desc: string, amount: number) => {
      const newBal = creditsLiveRef.current + amount;
      creditsLiveRef.current=newBal;
      setCredits(newBal);
      setBankLedger((prevLedger) => [
        {
          date: formattedStardate,
          desc,
          amount,
          balance: newBal,
        },
        ...prevLedger,
      ]);
  }, [formattedStardate]);

  const currentAbsDay = useMemo(() => {
    return getAbsoluteDay(stardateDay, stardateMonth, stardateYear);
  }, [stardateDay, stardateMonth, stardateYear]);

  const isArthDestroyed = useMemo(() => {
    const curStarHours = currentAbsDay * 24 + stardateHour;
    return starportDestroyed || (curStarHours >= 7200 && !flaresStopped);
  }, [starportDestroyed, currentAbsDay, stardateHour, flaresStopped]);

  const formattedClock = useMemo(() => {
    const d = String(stardateDay).padStart(2, '0');
    const m = String(stardateMonth).padStart(2, '0');
    const y = String(stardateYear);
    const h = String(stardateHour).padStart(2, '0');
    return `${d}-${m}-${y} ${h}:00`;
  }, [stardateDay, stardateMonth, stardateYear, stardateHour]);

  const maxArmorCapacity = useMemo(() => {
    const armors = [250, 500, 750, 1000, 1250, 1500];
    return armors[armorClass] || 250;
  }, [armorClass]);

  const maxShieldCapacity = useMemo(() => {
    return shieldClass * 500;
  }, [shieldClass]);

  // Special Artifact Possessions
  const isCrystalOrb = (item: any) => isCrystalArtifact(item, 'orb');
  const isCrystalCone = (item: any) => isCrystalArtifact(item, 'cone');

  const hasBlackEgg = useMemo(() => artifactsInHold.some((a) => a.id === 'black-egg' || a.id === 'black_egg' || a.id === 'art-black-egg' || a.realName?.toLowerCase().includes('black egg') || (a as any).name?.toLowerCase().includes('black egg')), [artifactsInHold]);
  const hasCrystalCone = useMemo(() => artifactsInHold.some(isCrystalCone), [artifactsInHold]);
  const hasCrystalOrb = useMemo(() => artifactsInHold.some(isCrystalOrb), [artifactsInHold]);
  const hasCrystalPearl = useMemo(() => artifactsInHold.some((a) => a.id === 'crystal-pearl' || a.id === 'crystal_pearl' || a.id === 'art-crystal-pearl' || a.realName?.toLowerCase().includes('crystal pearl') || (a as any).name?.toLowerCase().includes('crystal pearl') || a.realName?.toLowerCase().includes('pearl')), [artifactsInHold]);
  const hasRedCylinder = useMemo(() => artifactsInHold.some((a) => a.id === 'red-cylinder' || a.id === 'red_cylinder' || a.id === 'art-red-cylinder' || a.realName?.toLowerCase().includes('red cylinder') || (a as any).name?.toLowerCase().includes('red cylinder')), [artifactsInHold]);
  const hasRingDevice = useMemo(() => artifactsInHold.some((a) => a.id === 'ring-device' || a.id === 'ring_device' || a.id === 'art-ring-device' || a.realName?.toLowerCase().includes('ring device') || (a as any).name?.toLowerCase().includes('ring device')), [artifactsInHold]);
  const hasRodDevice = useMemo(() => artifactsInHold.some((a) => a.id === 'rod-device' || a.id === 'rod_device' || a.id === 'art-rod-device' || a.realName?.toLowerCase().includes('rod device') || (a as any).name?.toLowerCase().includes('rod device')), [artifactsInHold]);
  const hasShimmeringBall = useMemo(() => artifactsInHold.some((a) => a.id === 'shimmering-ball' || a.id === 'shimmering_ball' || a.id === 'art-shimmering-ball' || a.realName?.toLowerCase().includes('shimmering ball') || (a as any).name?.toLowerCase().includes('shimmering ball')), [artifactsInHold]);
  const hasTesseract = useMemo(() => artifactsInHold.some((a) => a.id === 'tesseract' || a.id === 'art-tesseract' || a.realName?.toLowerCase().includes('tesseract') || (a as any).name?.toLowerCase().includes('tesseract')), [artifactsInHold]);
  const hasWhiningOrb = useMemo(() => artifactsInHold.some((a) => a.id === 'whining-orb' || a.id === 'whining_orb' || a.id === 'art-whining-orb' || a.realName?.toLowerCase().includes('whining orb') || (a as any).name?.toLowerCase().includes('whining orb')), [artifactsInHold]);
  const hasFlatDevice = useMemo(() => artifactsInHold.some((a) => a.id === 'flat-device' || a.id === 'flat_device' || a.id === 'art-flat-device' || a.realName?.toLowerCase().includes('flat device') || (a as any).name?.toLowerCase().includes('flat device')), [artifactsInHold]);
  const hasEllipsoid = useMemo(() => artifactsInHold.some((a) => a.id === 'ellipsoid' || a.id === 'art-ellipsoid' || a.realName?.toLowerCase().includes('ellipsoid') || (a as any).name?.toLowerCase().includes('ellipsoid')), [artifactsInHold]);
  const hasBlackBox = useMemo(() => artifactsInHold.some((a) => a.id === 'black-box' || a.id === 'black_box' || a.id === 'art-black-box' || a.realName?.toLowerCase().includes('black box') || (a as any).name?.toLowerCase().includes('black box')), [artifactsInHold]);

  // Ship Mass and Acceleration Calculations
  // Mass = Hull (50 t) + (10 t * podsCount) + Engine (50 t if engineClass > 0 else 0) + Shielding (5 t if shieldingClass > 0 else 0) + Armor ([0, 9, 36, 81, 144, 225][armorClass]) + Missile Launcher (5 t if missileClass > 0 else 0) + Laser Cannon (5 t if laserClass > 0 else 0). Cargo/minerals/fuel have ZERO mass.
  const totalShipMass = useMemo(() => {
    let mass = 50; // Hull 50 t
    mass += cargoPods * 10; // 10 t * podsCount
    if (engineClass > 0) mass += 50; // Engine (50 t if engineClass > 0 else 0)
    if (shieldClass > 0) mass += 5; // Shielding (5 t if shieldingClass > 0 else 0)
    const armorMasses = [0, 9, 36, 81, 144, 225];
    mass += armorMasses[armorClass] || 0;
    if (missileClass > 0) mass += 5; // Missile Launcher (5 t if missileClass > 0 else 0)
    if (laserClass > 0) mass += 5; // Laser Cannon (5 t if laserClass > 0 else 0)
    return mass;
  }, [engineClass, shieldClass, laserClass, missileClass, cargoPods, armorClass]);

  const shipAcceleration = useMemo(() => {
    if (totalShipMass <= 0 || engineClass <= 0) return 0;
    return Math.floor((engineClass * 500) / totalShipMass);
  }, [engineClass, totalShipMass]);

  const shipThrustPower = useMemo(() => {
    if (engineClass <= 0) return 0;
    return PART_TABLES.engines[engineClass - 1]?.power || (engineClass * 500);
  }, [engineClass]);

  const activeFuelBurnRate = useMemo(() => {
    return FUEL_BURN_RATES[engineClass] || 0.48;
  }, [engineClass]);

  // Compute exact Ship Configuration repair costs
  const repairBreakdown = useMemo(() => {
    const missingArmor = Math.max(0, maxArmorCapacity - playerArmorPoints);
    const missingHull = Math.max(0, 250 - hullIntegrity);
    const missingSensors = Math.max(0, 100 - subsystems.Sensors);
    const missingComms = Math.max(0, 100 - subsystems.Comms);
    const missingEngines = Math.max(0, 100 - subsystems.Engines);
    const missingShields = Math.max(0, 100 - subsystems.Shields);
    const missingMissiles = Math.max(0, 100 - subsystems.Missiles);
    const missingLasers = Math.max(0, 100 - subsystems.Lasers);

    const armorCost = missingArmor * 4; // 4 M.U. per point
    const hullCost = missingHull * 250; // 250 M.U. per point
    const sensorsCost = missingSensors * 100; // 100 M.U. per point
    const commsCost = missingComms * 100; // 100 M.U. per point
    const enginesCost = missingEngines * 100; // 100 M.U. per point
    const shieldsCost = missingShields * 100; // 100 M.U. per point
    const missilesCost = missingMissiles * 100;
    const lasersCost = missingLasers * 100;

    const totalCost =
      armorCost +
      hullCost +
      sensorsCost +
      commsCost +
      enginesCost +
      shieldsCost +
      missilesCost +
      lasersCost;

    const resetSystems = Object.entries(inoperativeSystems).filter(([, failed]) => failed).map(([system]) => system);
    const isFullyRepaired = totalCost === 0 && resetSystems.length === 0;

    return {
      missingArmor,
      missingHull,
      missingSensors,
      missingComms,
      missingEngines,
      missingShields,
      missingMissiles,
      missingLasers,
      armorCost,
      hullCost,
      sensorsCost,
      commsCost,
      enginesCost,
      shieldsCost,
      missilesCost,
      lasersCost,
      totalCost,
      isFullyRepaired,
      resetSystems,
    };
  }, [maxArmorCapacity, playerArmorPoints, hullIntegrity, subsystems, inoperativeSystems]);

  const commsOfficer = useMemo(() => {
    const commId = assignedPosts.Communications;
    if (!commId) return null;
    return crewRoster.find((c) => c.id === commId && c.alive) || null;
  }, [assignedPosts, crewRoster]);

  const commsSkill = useMemo(() => {
    return commsOfficer?.skills.communications || 0;
  }, [commsOfficer]);

  const scienceOfficer = useMemo(() => {
    const sciId = assignedPosts['Science Officer'];
    if (!sciId) return null;
    return crewRoster.find((c) => c.id === sciId && c.alive) || null;
  }, [assignedPosts, crewRoster]);

  const scienceSkill = useMemo(() => {
    return scienceOfficer?.skills.science || 0;
  }, [scienceOfficer]);

  const navigatorOfficer = useMemo(() => {
    const navId = assignedPosts.Navigator;
    if (!navId) return null;
    return crewRoster.find((c) => c.id === navId && c.alive) || null;
  }, [assignedPosts, crewRoster]);

  const navigatorSkill = useMemo(() => {
    return navigatorOfficer?.skills.navigation || 0;
  }, [navigatorOfficer]);

  const engineerOfficer = useMemo(() => {
    const engId = assignedPosts.Engineer;
    if (!engId) return null;
    return crewRoster.find((c) => c.id === engId && c.alive) || null;
  }, [assignedPosts, crewRoster]);

  const engineerSkill = useMemo(() => {
    return engineerOfficer?.skills.engineering || 0;
  }, [engineerOfficer]);

  const doctorOfficer = useMemo(() => {
    const docId = assignedPosts.Doctor;
    if (!docId) return null;
    return crewRoster.find((c) => c.id === docId && c.alive) || null;
  }, [assignedPosts, crewRoster]);

  const doctorSkill = useMemo(() => {
    return doctorOfficer?.skills.medicine || 0;
  }, [doctorOfficer]);

  const addMessage = useCallback(
    (text: string, post?: CrewPost, type: 'info' | 'alert' | 'banter' = 'info', speakerOverride?: string) => {
      const officer = post ? crewRoster.find((c) => c.id === assignedPosts[post] && c.alive) : null;
      const speaker = speakerOverride !== undefined ? speakerOverride : (officer ? `${post} ${officer.name}` : post);
      setSystemMessages((prev) => [
        { id: `msg-${Date.now()}-${Math.random()}`, text, post, speaker, type },
        ...prev.slice(0, 100),
      ]);
    },
    [crewRoster, assignedPosts],
  );

  // Save Slots State
  const [saveSlots, setSaveSlots] = useState<SaveSlotData[]>(() => {
    return loadInitialSaveSlots().slots;
  });

  // On Title Screen mount / game startup: log storage telemetry & read save slots
  useEffect(() => {
    if (gameState.status === 'START') {
      logStorageTelemetry();
      try {
        const works = checkLocalStorageWorks();
        setStorageError(!works);
        const res = loadInitialSaveSlots();
        setSaveSlots(res.slots);
        if (res.lastSlot) {
          setActiveSlot(res.lastSlot);
        }
      } catch (e) {
        setStorageError(true);
      }
    }
  }, [gameState.status]);

  // Master SFX Volume Synchronization
  useEffect(() => {
    gameAudio.setVolume(soundVol);
  }, [soundVol]);

  // Master Voices Volume Synchronization
  useEffect(() => {
    voiceEngine.setVolume(voicesVol);
  }, [voicesVol]);

  // Alien Voice Effects Synchronization
  useEffect(() => {
    voiceEngine.setEffectsEnabled(alienVoiceEffectsEnabled);
  }, [alienVoiceEffectsEnabled]);

  // Crew Banter Enabled Synchronization
  useEffect(() => {
    voiceEngine.setBanterEnabled(banterEnabled);
  }, [banterEnabled]);

  // An alien can finish its final recording after it closes the visual link.
  // Explicit closes and leaving the encounter still cancel playback.
  useEffect(() => {
    if (!alienCommsState.active && !alienCommsState.connected
      && endingTransmissionGroupRef.current !== activeEncounterGroup?.id) {
      stopAlienVoice();
    }
  }, [alienCommsState.active, alienCommsState.connected, activeEncounterGroup?.id]);

  useEffect(() => {
    if (gameLocation !== 'Encounter' || gameState.status === 'START' || gameOverModal || gameWon) {
      endingTransmissionGroupRef.current = null;
      stopAlienVoice();
    }
  }, [gameLocation, gameState.status, gameOverModal, gameWon]);

  const persistSaveSlots = useCallback((updated: SaveSlotData[]) => {
    setSaveSlots(updated);
    updated.forEach((slotData) => {
      try {
        if (!slotData.empty) {
          const serialized = JSON.stringify(slotData);
          safeStorageSet(SLOT_KEYS[slotData.slot], serialized);
          safeStorageSet(LEGACY_SLOT_KEYS[slotData.slot], serialized);
        }
      } catch (e) {
        console.warn('Could not persist slot ' + slotData.slot, e);
      }
    });
    try {
      safeStorageSet(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not persist slots manifest', e);
    }
  }, []);

  // Strict Silence Filter for Comedy
  const isSilenceFilterActive = useCallback(() => {
    if (!banterEnabled) return true;
    // Solar flare warning / countdown crisis (within 15 days or flared)
    const isSolarCrisis = currentStar.flareDay !== undefined && !flaresStopped && (currentStar.flareDay - currentAbsDay) <= 15;
    // Hull breach imminent crisis
    const isHullCritical = hullIntegrity <= 50 || playerArmorPoints <= 0.15 * maxArmorCapacity;
    // Crystal planet thermal radiation crisis
    const isCrystalPlanetCrisis = currentStar.x === 192 && currentStar.y === 152 && orbitPlanetIndex === 0 && !hasCrystalOrb;
    // Victory sequence active
    const isVictory = victorySequenceModal || flaresStopped;

    return isSolarCrisis || isHullCritical || isCrystalPlanetCrisis || isVictory;
  }, [banterEnabled, currentStar, currentAbsDay, flaresStopped, hullIntegrity, playerArmorPoints, maxArmorCapacity, orbitPlanetIndex, hasCrystalOrb, victorySequenceModal]);

  // Banter Trigger System with Anti-Repetition & 20% Paired Exchanges
  const triggerBanter = useCallback(
    (
      actionType: BanterEventType | 'arm_weapons' | 'disarm_weapons' | 'star_flare_scan' | 'crystal_planet_heat' | 'nexus_found' | 'bomb_armed' | 'victory_banter' | 'first_damage' | 'malfunction' | 'hull_breach' | 'destroy_alien' | 'first_hit' | 'alien_encounter',
      contextParam?: string,
    ) => {
      // Serious / Mission-critical lines always play with sincere tone
      if (actionType === 'star_flare_scan') {
        addMessage(`Stellar core stability analysis: ${contextParam || 'Stellar instability detected!'}`, 'Science Officer', 'alert');
        return;
      }
      if (actionType === 'crystal_planet_heat') {
        addMessage('THERMAL ALARM! Planetary core radiation is scorching our outer plating! Crystalline shielding required!', 'Engineer', 'alert');
        return;
      }
      if (actionType === 'nexus_found') {
        addMessage('Captain! We have located the Master Crystalline Control Nexus! This ancient structure orchestrates the galactic solar flare cycle!', 'Science Officer', 'info');
        return;
      }
      if (actionType === 'bomb_armed') {
        addMessage('Antimatter fuse active! The Black Egg is ARMED! Ascend to orbit before detonation!', 'Captain', 'alert');
        return;
      }
      if (actionType === 'victory_banter') {
        addMessage('Telemetry confirmed: the flare network has collapsed! Arth and the entire galaxy are saved!', 'Captain', 'info');
        return;
      }

      // Check comedy silence filter
      if (isSilenceFilterActive() || miningSessionRef.current) return;

      // Handle standard comedy banter via BanterEngine with weapon fire context
      const destination=orbitPlanetIndex===null?null:currentPlanets[orbitPlanetIndex];
      const hasBreathableAir=!!destination&&destination.atmosphereDensity!=='None'&&destination.gases.some(g=>/oxygen/i.test(g))&&destination.gases.some(g=>/nitrogen|carbon dioxide/i.test(g));
      const res = banterEngine.getBanter(
        actionType as BanterEventType,
        crewRoster,
        assignedPosts,
        false,
        {
          laserFiredCount: encounterShotsFiredRef.current.laser,
          lastWeapon: lastWeaponFiredRef.current || undefined,
          location:gameLocation,engineClass,inNebula:isInsideNebula(galaxyShipXFrameRef.current,galaxyShipYFrameRef.current,gameLocation==='Hyperspace'?undefined:currentStar.inNebula),
          breathable:hasBreathableAir,
        },
      );
      if (res) {
        setBanterLog((prev) => [{ speaker: res.speaker, post: res.post, text: res.text }, ...prev.slice(0, 15)]);
        addMessage(res.text, res.post, 'banter');
        const epoch=missionEpochRef.current,first=playCrewBanter(res.text);
        // A 450ms response timer used to interrupt nearly every first recording.
        // Keep the existing text and voices, but wait for actual playback.
        if(res.paired){
          const paired=res.paired;
          const finished=()=>{const p=pendingBanterRepliesRef.current;if(p.epoch===epoch)p.count=Math.max(0,p.count-1);};
          const waitForFirst=()=>{
            if(missionEpochRef.current!==epoch)return;
            if(miningSessionRef.current){finished();return;}
            const remaining=voiceEngine.getCrewRemainingSeconds();
            if(remaining>.05){scheduleMissionEvent(waitForFirst,Math.max(100,Math.min(500,remaining*1000)));return;}
            scheduleMissionEvent(()=>{
              if(miningSessionRef.current){finished();return;}
              setBanterLog(prev=>[{speaker:paired.speaker,post:paired.post,text:paired.text},...prev.slice(0,15)]);
              addMessage(paired.text,paired.post,'banter');
              // A stalled fetch must not hold mission progression open.
              // Once audio starts, its real remaining time protects playback.
              finished();void playCrewBanter(paired.text);
            },450);
          };
          void first.finally(()=>{
            if(missionEpochRef.current!==epoch||(actionType==='landing_start'&&cinematicStateRef.current!=='descent'))return;
            const pending=pendingBanterRepliesRef.current;
            if(pending.epoch!==epoch)pendingBanterRepliesRef.current={epoch,count:0};
            pendingBanterRepliesRef.current.count++;waitForFirst();
          });
        }
      }
    },
    [isSilenceFilterActive, crewRoster, assignedPosts, addMessage,gameLocation,engineClass,currentStar,orbitPlanetIndex,destroyedPlanetKeys],
  );


  // Snapshot capture
  const captureSnapshot = useCallback((): NonNullable<SaveSlotData['snapshot']> => {
    const vehicleHold = vehicleHoldFrameRef.current;
    const crewRoster = crewRosterFrameRef.current;
    const subsystems = subsystemsFrameRef.current;
    const activeRepairTask = activeRepairTaskFrameRef.current;
    const projectiles = projectilesFrameRef.current;
    const encounterShipPos = encounterShipPosFrameRef.current;
    const encounterCooldownTimer = encounterCooldownTimerFrameRef.current;
    const laserCooldown = laserCooldownFrameRef.current;
    const missileCooldown = missileCooldownFrameRef.current;
    const questionCountdownTimer = questionCountdownTimerFrameRef.current;
    const hullIntegrity = hullIntegrityFrameRef.current;
    const playerArmorPoints = playerArmorPointsFrameRef.current;
    const playerShieldPoints = playerShieldPointsFrameRef.current;
    const cargoHold = cargoHoldFrameRef.current;
    const systemShipX = systemShipXFrameRef.current;
    const systemShipY = systemShipYFrameRef.current;
    const shipVx = shipVxFrameRef.current;
    const shipVy = shipVyFrameRef.current;
    const shipHeading = shipHeadingFrameRef.current;
    const enduriumFuel = enduriumFuelFrameRef.current;
    const galaxyShipX = galaxyShipXFrameRef.current;
    const galaxyShipY = galaxyShipYFrameRef.current;
    const orbitAnimPhase = orbitAnimPhaseFrameRef.current;
    const orbitTransitionProgress = orbitTransitionProgressFrameRef.current;
    const radarScanAngle = radarScanAngleFrameRef.current;
    const warpStreakParticles = warpStreakParticlesFrameRef.current;
    const commsTypewriterElapsed = commsTypewriterElapsedFrameRef.current;
    const alienEyeBlinkTimer = alienEyeBlinkTimerFrameRef.current;
    const astronautX = astronautXFrameRef.current;
    const astronautY = astronautYFrameRef.current;
    const astronautVx = astronautVxFrameRef.current;
    const astronautVy = astronautVyFrameRef.current;
    const astronautFacing = astronautFacingFrameRef.current;
    const astronautScaleX = astronautScaleXFrameRef.current;
    const astronautAnimFrame = astronautAnimFrameFrameRef.current;
    const astronautIdleTimer = astronautIdleTimerFrameRef.current;
    const astronautDistanceTraveled = astronautDistanceTraveledFrameRef.current;
    const ambientScrubbots = ambientScrubbotsFrameRef.current;
    const hangarSparks = hangarSparksFrameRef.current;
    const transporterParticles = transporterParticlesFrameRef.current;
    const vehicleX = vehicleXFrameRef.current;
    const vehicleY = vehicleYFrameRef.current;
    const vehicleHeading = vehicleHeadingFrameRef.current;
    const vehicleFuel = vehicleFuelFrameRef.current;
    const roverSuspensionBounce = roverSuspensionBounceFrameRef.current;
    const roverTireTracks = roverTireTracksFrameRef.current;
    const roverDustParticles = roverDustParticlesFrameRef.current;
    const screenShake = screenShakeFrameRef.current;
    const redVignetteFlash = redVignetteFlashFrameRef.current;
    return {
      isDev: devUsed,
      gameWon,
      flaresHalted: flaresStopped,
      flaresStopped,
      destroyedPlanetKeys: [...destroyedPlanetKeys],
      destroyedPlanets: [...destroyedPlanetKeys],
      sterilizedPlanets: [...destroyedPlanetKeys],
      usedFluxes: [...traversedFluxIds],
      location: gameLocation,
      prevLocation: prevGameLocation,
      concourseAstronautX: astronautX,
      concourseAstronautY: astronautY,
      starportRoomIndex: activeRoomIndex ?? 0,
      inRoom: activeRoomIndex !== null,
      currentStarId,
      galaxyShipX,
      galaxyShipY,
      systemShipX,
      systemShipY,
      systemZoom,
      orbitAnimPhase:orbitAnimPhaseFrameRef.current,
      hyperspaceDepartureStarId:hyperspaceDepartureStarRef.current,
      hyperZoom,
      shipHeading,
      orbitPlanetIndex,
      planetaryScan: gameLocation==='In Orbit' && orbitPlanetIndex!==null && planetaryScanRef.current?.planetKey===scanPlanetKey(currentStarId,survivingPlanets(currentStar.planets,currentStar.x,currentStar.y,destroyedPlanetKeys)[orbitPlanetIndex]?.slot)
        ? structuredClone(planetaryScanRef.current) : null,
      crystalHeatTicks:crystalHeatTicksFrameRef.current,
      crystalHeatRemainder:crystalHeatAccumulatorRef.current,
      landingLat,
      landingLong,
      credits,
      stardateDay,
      stardateMonth,
      stardateYear,
      stardateHour,
      starportDestroyed,
      bridgeLog: JSON.parse(JSON.stringify(systemMessages)),
      systemMessages: JSON.parse(JSON.stringify(systemMessages)),
      banterLog: JSON.parse(JSON.stringify(banterLog)),
      lastInterestAbsDay,
      lastInterestStardateDays: lastInterestAbsDay,
      lastInterestStardate: formattedStardate,
      unsuitablePlanetsRecommendedCount,
      unsuitableCount: unsuitablePlanetsRecommendedCount,
      recommendedPlanets: [...recommendedPlanets],
      loggedTelemetryPlanets: [...loggedTelemetryPlanets],
      pendingRecommendations: JSON.parse(JSON.stringify(pendingRecommendations)),
      shipName,
      engineClass,
      shieldClass,
      armorClass,
      missileClass,
      laserClass,
      cargoPods,
      enduriumFuel,
      hullIntegrity,
      playerArmorPoints,
      playerShieldPoints,
      subsystems: { ...subsystems },
      inoperativeSystems: { ...inoperativeSystems },
      activePatientId,
      activeRepairTask: activeRepairTask ? { ...activeRepairTask } : null,
      cargoHold: JSON.parse(JSON.stringify(cargoHold)),
      artifactsInHold: JSON.parse(JSON.stringify(artifactsInHold)),
      artifactStock: structuredClone(artifactStockFrameRef.current),
      specimensInHold: JSON.parse(JSON.stringify(specimensInHold)),
      crewRoster: JSON.parse(JSON.stringify(crewRoster)),
      assignedPosts: { ...assignedPosts },
      traversedFluxIds: [...traversedFluxIds],
      fluxDisorientation: fluxDisorientationTimerRef.current,
      fluxCooldown: fluxCooldownTimerRef.current,
      fluxExitDest: fluxExitDestRef.current ? [...fluxExitDestRef.current] as [number, number] : null,
      bulletins: JSON.parse(JSON.stringify(bulletins)),
      evaluations: JSON.parse(JSON.stringify(evaluations)),
      bankLedger: JSON.parse(JSON.stringify(bankLedger)),
      vehicleDestroyed,
      vehicleFuel,
      vehicleHold: JSON.parse(JSON.stringify(vehicleHold)),
      vehicleX,
      vehicleY,
      vehicleHeading,
      roverWaypoint: roverWaypointRef.current ? {...roverWaypointRef.current} : null,
      vehicleWeapon,
      currentSurfaceState: currentSurfaceState ? structuredClone(currentSurfaceState) : null,
      planetSurfaces: structuredClone(planetSurfacesRef.current),
      armedDetonationTracker,
      detonationSequence: detonationSequenceRef.current,
      cinematicState: cinematicStateRef.current,
      cinematicRemaining: cinematicTimerRef.current,
      cinematicDuration: cinematicDurationRef.current,
      shieldsRaised,
      weaponsArmed,
      discoveredSpecies: [...discoveredSpecies],
      surveyKnowledge: structuredClone(surveyKnowledgeFrameRef.current),
      surfaceRecording: surfaceRecordingFrameRef.current ? {...surfaceRecordingFrameRef.current} : null,
      commLineUsage: { ...commLineUsageRef.current },
      commTopicProgress:{...commTopicProgressRef.current},
      activeEncounterGroup: activeEncounterGroup ? JSON.parse(JSON.stringify(activeEncounterGroup)) : null,
      fleetChanges: structuredClone(fleetChangesRef.current),
      alienTrackingHour: alienTrackingHourRef.current ?? undefined,
      encounterTargetIndex,
      encounterShipPos: { ...encounterShipPos },
      encounterPassIndex: encounterPassIndexRef.current,
      combatDuration: combatDurationTimerRef.current,
      combatPassTimer: passTimerRef.current,
      combatActive: isCombatActiveRef.current,
      laserCooldown,
      missileCooldown,
      encounterCooldown: encounterCooldownTimer,
      projectiles: structuredClone(projectiles),
      encounterShotsFired: { ...encounterShotsFiredRef.current },
      questionCountdownTimer,
      questionTotalTime,
      alienCommsState: JSON.parse(JSON.stringify(alienCommsState)),
      hasPurchasedBlackBox,
      grantedDroneClearanceUntilHyperspace,
      mechan9Unlocked,
      hasGivenEllipsoid,
      hasRefusedCrystalOrb,
      uhlekSilenced,
      elowanHostile,
      speciesBaseMoods: { ...speciesBaseMoods },
      visitedStarIds: [...visitedStarIds],
      settings: {
        banterEnabled,
        textSpeed,
        musicVolume: musicVol,
        soundVolume: soundVol,
        voicesVolume: voicesVol,
        alienVoiceEffects: alienVoiceEffectsEnabled,
        graphicsQuality: gfxQuality,
        crtFilter: crtFilterEnabled,
        screenShake: screenShakeEnabled,
      },
    };
  }, [
    devUsed,
    gameLocation,
    prevGameLocation,
    astronautX,
    astronautY,
    activeRoomIndex,
    currentStarId,
    galaxyShipX,
    galaxyShipY,
    systemShipX,
    systemShipY,
    systemZoom,
    hyperZoom,
    shipHeading,
    orbitPlanetIndex,
    landingLat,
    landingLong,
    credits,
    stardateDay,
    stardateMonth,
    stardateYear,
    stardateHour,
    starportDestroyed,
    systemMessages,
    banterLog,
    lastInterestAbsDay,
    unsuitablePlanetsRecommendedCount,
    recommendedPlanets,
    loggedTelemetryPlanets,
    pendingRecommendations,
    shipName,
    engineClass,
    shieldClass,
    armorClass,
    missileClass,
    laserClass,
    cargoPods,
    enduriumFuel,
    hullIntegrity,
    playerArmorPoints,
    playerShieldPoints,
    subsystems,
    inoperativeSystems,
    activePatientId,
    activeRepairTask,
    cargoHold,
    artifactsInHold,
    crewRoster,
    assignedPosts,
    traversedFluxIds,
    bulletins,
    evaluations,
    bankLedger,
    vehicleDestroyed,
    vehicleFuel,
    vehicleHold,
    vehicleX,
    vehicleY,
    vehicleHeading,
    vehicleWeapon,
    currentSurfaceState,
    armedDetonationTracker,
    shieldsRaised,
    weaponsArmed,
    discoveredSpecies,
    activeEncounterGroup,
    encounterTargetIndex,
    encounterShipPos,
    laserCooldown,
    missileCooldown,
    encounterCooldownTimer,
    projectiles,
    questionCountdownTimer,
    questionTotalTime,
    alienCommsState,
    hasPurchasedBlackBox,
    grantedDroneClearanceUntilHyperspace,
    mechan9Unlocked,
    hasGivenEllipsoid,
    hasRefusedCrystalOrb,
    flaresStopped,
    uhlekSilenced,
    elowanHostile,
    speciesBaseMoods,
    visitedStarIds,
    banterEnabled,
    textSpeed,
    musicVol,
    soundVol,
    voicesVol,
    alienVoiceEffectsEnabled,
    gfxQuality,
    crtFilterEnabled,
    screenShakeEnabled,
  ]);

  const lastFluxTraverseTimeRef = useRef<number>(0);
  const payBankInterest=useCallback((restart:boolean)=>{
    const settlement=interestCheckpoint(creditsLiveRef.current,lastInterestAbsDay,currentAbsDay,restart);
    if(settlement.amount!==0) {
      addBankTransaction('12% p.a. accrued interest',settlement.amount);
      addMessage(`Interstel Bank: ${settlement.amount>0?'+':''}${settlement.amount.toLocaleString()} M.U. interest for ${currentAbsDay-lastInterestAbsDay} elapsed days.`,'Captain','info');
    }
    if(settlement.nextDay!==lastInterestAbsDay) setLastInterestAbsDay(settlement.nextDay);
  },[credits,lastInterestAbsDay,currentAbsDay,addBankTransaction,addMessage]);
  const fluxExitDestRef = useRef<[number, number] | null>(null);
  const lastTraversedFluxIdRef = useRef<number | null>(null);
  const fluxCooldownTimerRef = useRef<number>(0);
  const isJumpingFluxRef = useRef<boolean>(false);

  // Capture after React commits the action's state changes. Saving inside the
  // action itself otherwise records the previous location, balance, or ledger.
  const [pendingCheckpoint, setPendingCheckpoint] = useState<{
    slot: SaveSlotData['slot']; patch?: Partial<NonNullable<SaveSlotData['snapshot']>>;
  } | null>(null);
  const handleSaveToSlot = useCallback((slot: SaveSlotData['slot'], patch?: Partial<NonNullable<SaveSlotData['snapshot']>>) => {
    setPendingCheckpoint({ slot, patch });
  }, []);
  useEffect(()=>{
    const knowledge=surveyKnowledgeFrameRef.current;
    if(gameLocation!=='Starport' || gameState.status!=='PLAYING' || isArthDestroyed || knowledge.unpaidValue<=0) return;
    const payment=knowledge.unpaidValue;
    setSurveyKnowledge({...knowledge,unpaidValue:0});
    addBankTransaction('Recorded biological survey data',payment);
    addMessage(`Interstel Science: ${payment.toLocaleString()} M.U. paid for your recorded lifeform data.`, 'Science Officer','info');
    handleSaveToSlot(activeSlot);
  },[gameLocation,gameState.status,isArthDestroyed,addBankTransaction,addMessage,handleSaveToSlot,activeSlot]);
  const handleSettingsChange = useCallback((patch:Partial<GameSettings>) => {
    if (patch.banterEnabled!==undefined) setBanterEnabled(patch.banterEnabled);
    if (patch.textSpeed!==undefined) setTextSpeed(patch.textSpeed);
    if (patch.musicVolume!==undefined) setMusicVol(patch.musicVolume);
    if (patch.soundVolume!==undefined) setSoundVol(patch.soundVolume);
    if (patch.voicesVolume!==undefined) {
      setVoicesVol(patch.voicesVolume);
      safeStorageSet('starflight_voices_volume',String(patch.voicesVolume));
    }
    if (patch.alienVoiceEffects!==undefined) {
      setAlienVoiceEffectsEnabled(patch.alienVoiceEffects);
      safeStorageSet('starflight_alien_voice_effects',String(patch.alienVoiceEffects));
    }
    if (patch.graphicsQuality!==undefined) setGfxQuality(patch.graphicsQuality);
    if (patch.crtFilter!==undefined) setCrtFilterEnabled(patch.crtFilter);
    if (patch.screenShake!==undefined) setScreenShakeEnabled(patch.screenShake);
    handleSaveToSlot(activeSlot);
  }, [handleSaveToSlot,activeSlot]);
  const writeCheckpoint = useCallback(
    (
      slotKey: 'A' | 'B' | 'C' | 'D' | 'E',
      customPatch?: Partial<NonNullable<SaveSlotData['snapshot']>>,
    ) => {
      if (hullIntegrity <= 0 || gameOverModal) return;

      const baseSnap = captureSnapshot();
      const snap = customPatch ? { ...baseSnap, ...customPatch } : baseSnap;
      const currentCredits = customPatch?.credits ?? credits;
      const currentShipName = (customPatch?.shipName ?? shipName) || 'UNNAMED VESSEL';
      const currentLoc = customPatch?.location ?? gameLocation;
      const currentStardate =
        customPatch?.stardateDay && customPatch?.stardateMonth && customPatch?.stardateYear
          ? `${String(customPatch.stardateDay).padStart(2, '0')}-${String(customPatch.stardateMonth).padStart(2, '0')}-${customPatch.stardateYear}`
          : formattedStardate;

      const isWon = customPatch?.gameWon ?? snap.gameWon ?? gameWon;
      const isFlaresHalted = customPatch?.flaresHalted ?? customPatch?.flaresStopped ?? snap.flaresHalted ?? snap.flaresStopped ?? flaresStopped;

      const newSlotData: SaveSlotData = {
        slot: slotKey,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        credits: currentCredits,
        shipName: currentShipName,
        stardate: currentStardate,
        location: currentLoc,
        empty: false,
        isDev: devUsed || snap.isDev,
        gameWon: isWon,
        flaresHalted: isFlaresHalted,
        bridgeLog: JSON.parse(JSON.stringify(snap.bridgeLog || systemMessages)),
        snapshot: snap,
      };

      const primaryKey = SLOT_KEYS[slotKey];
      const legacyKey = LEGACY_SLOT_KEYS[slotKey];
      const serialized = JSON.stringify(newSlotData);

      const stored = safeStorageSet(primaryKey, serialized);
      safeStorageSet(legacyKey, serialized);
      safeStorageSet(LAST_SLOT_KEY, slotKey);

      // Storage telemetry logging on save action
      console.log('[SAVE SYSTEM WRITE] Key:', primaryKey);
      console.log('[SAVE SYSTEM WRITE] Size:', serialized.length);

      let readback: string | null = null;
      try {
        if (typeof localStorage !== 'undefined') {
          readback = localStorage.getItem(primaryKey);
        }
      } catch (e) {}
      if (readback === null) {
        readback = safeStorageGet(primaryKey);
      }
      const verified = stored && readback === serialized;
      setSaveDurable(verified);
      console.log('[SAVE SYSTEM VERIFY] Readback:', verified);

      // Re-read storage so that any previously saved slots are preserved and accurately displayed!
      setSaveSlots((prev) => {
        const fresh = loadInitialSaveSlots().slots;
        const updated = fresh.map((s) => (s.slot === slotKey ? newSlotData : s));
        try {
          safeStorageSet(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      setActiveSlot(slotKey);

      // Trigger visual autosave toast
      setAutosaveToast(true);
      if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = window.setTimeout(() => setAutosaveToast(false), 2400);
    },
    [captureSnapshot, credits, shipName, formattedStardate, gameLocation, systemMessages, hullIntegrity, gameOverModal, devUsed, gameWon, flaresStopped],
  );

  useEffect(() => {
    if (!pendingCheckpoint) return;
    writeCheckpoint(pendingCheckpoint.slot, pendingCheckpoint.patch);
    setPendingCheckpoint(null);
  }, [pendingCheckpoint, writeCheckpoint]);

  useEffect(() => {
    if(gameState.status!=='PLAYING') return;
    const released=releaseNotices<CorporateBulletin>(bulletins,FULL_NOTICES_CATALOG,currentAbsDay);
    if(released===bulletins) return;
    setBulletins(released);
    handleSaveToSlot(activeSlot);
  }, [gameState.status,currentAbsDay,bulletins,handleSaveToSlot,activeSlot]);

  const handleLoadFromSlot = useCallback(
    (slotKey: 'A' | 'B' | 'C' | 'D' | 'E') => {
      const freshSlots = loadInitialSaveSlots().slots;
      const target = freshSlots.find((s) => s.slot === slotKey) || saveSlots.find((s) => s.slot === slotKey);
      if(target?.loadError || target?.snapshot && !restorableSaveSlot(target,slotKey)) {
        setImportStatus({type:'error',message:`Slot ${slotKey} contains invalid or oversized saved mission data and cannot be resumed. The saved mission has not been changed. Import a valid backup or choose another slot.`});
        setIsImportModalOpen(true);gameAudio.playErrorBuzz();return;
      }
      if (!target || target.empty || !target.snapshot) {
        gameAudio.playErrorBuzz();
        return;
      }
      if(!saveRenderCoordinatesAreSafe(target.snapshot)) {
        setImportStatus({type:'error',message:`Slot ${slotKey} contains unsafe position data and cannot be resumed. The saved mission has not been changed. Import a valid backup or choose another slot.`});
        setIsImportModalOpen(true);
        gameAudio.playErrorBuzz();
        return;
      }

      // Work on a copy: surface mining and combat mutate their live models.
      // A loaded mission must never mutate the stored checkpoint in memory.
      const snap = structuredClone(target.snapshot);
      setReplacementMission(null);
      missionEpochRef.current++;
      blockedSalvageRef.current.clear();
      heldKeysRef.current = {};
      voiceEngine.stopAllVoices();
      if (clampReleaseAnimIdRef.current !== null) cancelAnimationFrame(clampReleaseAnimIdRef.current);
      clampReleaseAnimIdRef.current = null;
      setIsReleasingClamps(false);
      setPendingCheckpoint(null);
      setDevUsed(!!(target.isDev || snap.isDev));
      setActiveSlot(slotKey);
      setIntroPage(0);
      setGameLocation(snap.location);
      setPrevGameLocation(snap.prevLocation || 'Hyperspace');
      const concourseCanvas = getConcourseCanvas(assets);
      const spawnPos = imageFracToCanvas(
        CONCOURSE_SPAWN_U,
        CONCOURSE_SPAWN_V,
        viewDimensions.width,
        viewDimensions.height,
        concourseCanvas
      );
      let loadedAstroX = snap.concourseAstronautX ?? spawnPos.x;
      let loadedAstroY = snap.concourseAstronautY ?? spawnPos.y;
      if (!Number.isFinite(loadedAstroX) || !Number.isFinite(loadedAstroY)) {
        loadedAstroX = spawnPos.x;
        loadedAstroY = spawnPos.y;
      }
      setAstronautX(loadedAstroX);
      setAstronautY(loadedAstroY);
      // A saved departure resumes in the flight viewport, outside the room UI.
      setActiveRoomIndex(snap.cinematicState==='launch'?null:(snap.inRoom?snap.starportRoomIndex:null));
      setCurrentStarId(snap.currentStarId ?? 1);
      setGalaxyShipX(snap.galaxyShipX ?? 125.0);
      setGalaxyShipY(snap.galaxyShipY ?? 100.0);
      setSystemShipX(snap.systemShipX ?? -88);
      setSystemShipY(snap.systemShipY ?? 118);
      setSystemZoom(snap.systemZoom ?? 8.0);
      setHyperZoom(snap.hyperZoom ?? 2.5);
      galaxyShipXRef.current = snap.galaxyShipX ?? 125.0;
      galaxyShipYRef.current = snap.galaxyShipY ?? 100.0;
      setShipHeading(snap.shipHeading ?? Math.PI * 0.75);
      setOrbitPlanetIndex(snap.orbitPlanetIndex ?? null);
      updatePlanetaryScan(snap.planetaryScan?structuredClone(snap.planetaryScan):null);
      scienceEpochRef.current++;alienScanRef.current=null;setScienceReading(null);
      setLandingLat(snap.landingLat ?? 15);
      setLandingLong(snap.landingLong ?? -30);
      setShipVx(0);
      setShipVy(0);
      setActiveDirectionVector({ dx: 0, dy: 0 });
      setClickMoveTarget(null);
      setAstronautVx(0);
      setAstronautVy(0);
      setCredits(snap.credits);
      setStardateDay(snap.stardateDay ?? 1);
      setStardateMonth(snap.stardateMonth ?? 1);
      setStardateYear(snap.stardateYear ?? 4620);
      setStardateHour(snap.stardateHour ?? 0);
      const loadedStarHours = getAbsoluteDay(snap.stardateDay ?? 1, snap.stardateMonth ?? 1, snap.stardateYear ?? 4620) * 24 + (snap.stardateHour ?? 0);
      previousStarHoursRef.current = loadedStarHours;
      flightClockAccumulatorRef.current = 0;
      setStarportDestroyed(snap.starportDestroyed ?? false);
      const slotLogs = snap.bridgeLog || snap.systemMessages || target.bridgeLog || [
        {
          id: 'load-msg',
          text: 'Starship telemetry link restored.',
          type: 'info' as const,
        },
      ];
      setSystemMessages(JSON.parse(JSON.stringify(slotLogs)));
      setBanterLog(snap.banterLog ? JSON.parse(JSON.stringify(snap.banterLog)) : []);
      setLastInterestAbsDay(snap.lastInterestAbsDay ?? snap.lastInterestStardateDays ?? 0);
      setUnsuitablePlanetsRecommendedCount(snap.unsuitablePlanetsRecommendedCount ?? snap.unsuitableCount ?? 0);
      setRecommendedPlanets(snap.recommendedPlanets ?? []);
      setLoggedTelemetryPlanets(snap.loggedTelemetryPlanets ?? []);
      setPendingRecommendations(snap.pendingRecommendations ?? []);
      setTraversedFluxIds(snap.traversedFluxIds ?? snap.usedFluxes ?? []);
      setFluxDisorientationTimer(snap.fluxDisorientation ?? 0);
      fluxCooldownTimerRef.current = snap.fluxCooldown ?? 0;
      fluxExitDestRef.current = snap.fluxExitDest ?? null;
      isJumpingFluxRef.current = !!snap.fluxExitDest;
      lastTraversedFluxIdRef.current = null;
      setBulletins(snap.bulletins ?? []);
      setEvaluations(snap.evaluations ?? []);
      setBankLedger(snap.bankLedger ?? []);
      setShipName(snap.shipName);
      setEngineClass(snap.engineClass);
      setShieldClass(snap.shieldClass);
      setArmorClass(snap.armorClass);
      setMissileClass(snap.missileClass);
      setLaserClass(snap.laserClass);
      setCargoPods(snap.cargoPods);
      setEnduriumFuel(snap.enduriumFuel + (snap.cargoHold.Endurium ?? 0));
      setHullIntegrity(Math.max(1, snap.hullIntegrity ?? 250));
      setPlayerArmorPoints(snap.playerArmorPoints ?? 500);
      setPlayerShieldPoints(snap.playerShieldPoints ?? 0);
      setShieldsRaised(snap.shieldsRaised ?? false);
      setWeaponsArmed(snap.weaponsArmed ?? false);
      setSubsystems(snap.subsystems ?? {Engines:100,Sensors:100,Comms:100,Shields:100,Missiles:100,Lasers:100});
      setInoperativeSystems(snap.inoperativeSystems ?? {Engines:false,Sensors:false,Comms:false,Shields:false,Missiles:false,Lasers:false});
      setActivePatientId(snap.activePatientId ?? null);
      setActiveRepairTask(snap.activeRepairTask ?? null);
      setCargoHold({ ...snap.cargoHold, Endurium: 0 });
      setArtifactsInHold(snap.artifactsInHold);
      setArtifactStock(structuredClone(snap.artifactStock??initialArtifactStock()));
      setTradeDepotMessage(null);
      setSpecimensInHold(snap.specimensInHold || []);
      setCrewRoster(normalizeCrewPortraits(snap.crewRoster));
      setAssignedPosts(snap.assignedPosts);
      setVehicleDestroyed(snap.vehicleDestroyed ?? false);
      setVehicleFuel(snap.vehicleFuel ?? 100);
      const carriedArmedCargo = (snap.vehicleHold ?? []).some(item => item.isArmed);
      setVehicleHold((snap.vehicleHold ?? []).map(item => item.isArmed ? recoveredCargo(item) : item));
      setVehicleX(snap.vehicleX ?? 0);
      setVehicleY(snap.vehicleY ?? 0.6);
      setVehicleHeading(snap.vehicleHeading ?? 0);
      setVehicleWeapon(snap.vehicleWeapon ?? 'Stunner');
      setDiscoveredSpecies(snap.discoveredSpecies ?? []);
      setSurveyKnowledge(structuredClone(snap.surveyKnowledge ?? emptySurveyKnowledge()));
      setSurfaceRecording(snap.surfaceRecording ? {...snap.surfaceRecording} : null);
      setMiningSession(null);setMiningTargetId(null);setMiningOpen(false);setMiningMessage('');setLastMiningExtracted(0);setSurfaceWeaponBeam(null);
      setCopyDestination(null);setSlotActionNotice(null);setReplacementStatus(null);
      setRoverWaypoint(snap.roverWaypoint ?? null);
      setRoverTireTracks([]);
      setRoverDustParticles([]);
      planetSurfacesRef.current = snap.planetSurfaces ?? {};
      setOrbitAnimPhase(snap.orbitAnimPhase??0);
      hyperspaceEnteringRef.current=false;
      hyperspaceDepartureStarRef.current=snap.hyperspaceDepartureStarId??(snap.location==='Hyperspace'?snap.currentStarId:null);
      setCurrentSurfaceState(snap.currentSurfaceState ?? null);
      const deployedCharge = [snap.currentSurfaceState,...Object.values(snap.planetSurfaces ?? {})]
        .some(surface => surface?.droppedCargo.some(item => item.isArmed));
      setArmedDetonationTracker(carriedArmedCargo && !deployedCharge ? null : snap.armedDetonationTracker ?? null);
      setDetonationSequence(snap.detonationSequence ?? null);
      setScreenWhiteFlashTimer(snap.detonationSequence && snap.detonationSequence.elapsed >= 7 ? 10 - snap.detonationSequence.elapsed : 0);
      setHasPurchasedBlackBox(snap.hasPurchasedBlackBox ?? false);
      setGrantedDroneClearanceUntilHyperspace(snap.grantedDroneClearanceUntilHyperspace ?? false);
      setMechan9Unlocked(snap.mechan9Unlocked ?? false);
      setHasGivenEllipsoid(snap.hasGivenEllipsoid ?? false);
      setHasRefusedCrystalOrb(snap.hasRefusedCrystalOrb ?? false);
      // Older tactical saves predate the homeworld attack flag. A battle already
      // recorded as active must not be reset to the pre-warning posture on load.
      if(snap.activeEncounterGroup?.isHomeworldFleet&&snap.activeEncounterGroup.homeworldAttackStarted===undefined
        &&snap.combatActive&&snap.activeEncounterGroup.posture==='Hostile'&&!snap.activeEncounterGroup.hasSurrendered) {
        snap.activeEncounterGroup.homeworldAttackStarted=true;
      }
      setActiveEncounterGroup(snap.activeEncounterGroup || null);
      fleetChangesRef.current = snap.fleetChanges ?? {};
      if(snap.activeEncounterGroup?.id.startsWith('canonical-')) fleetChangesRef.current[snap.activeEncounterGroup.id]=snap.activeEncounterGroup;
      const restoredFleets=generateAlienGroups().map(group=>fleetChangesRef.current[group.id]??group);
      alienGroupsRef.current=restoredFleets;
      setAlienGroups(restoredFleets);
      alienTrackingHourRef.current=snap.alienTrackingHour ?? null;
      flightEncounterStartedRef.current=snap.location==='Encounter';
      setEncounterTargetIndex(snap.encounterTargetIndex || 0);
      const tacticalPosition = snap.encounterShipPos ?? { x: 0, y: 0 };
      setEncounterShipPos(tacticalPosition);
      encounterPassIndexRef.current = snap.encounterPassIndex ?? 0;
      combatDurationTimerRef.current = snap.combatDuration ?? 0;
      passTimerRef.current = snap.combatPassTimer ?? 0;
      isCombatActiveRef.current = snap.activeEncounterGroup ? fleetCanFire(snap.activeEncounterGroup,snap.combatActive ?? snap.activeEncounterGroup.posture === 'Hostile') : false;
      // Legacy prototypes attacked before offering the probe's test. Resume those
      // encounters neutrally unless the player already fired or failed a test.
      const legacyDrone=snap.activeEncounterGroup?.race==='Veloxi Drone' && !snap.activeEncounterGroup.droneChallenge && !snap.activeEncounterGroup.attackedByPlayer;
      if(legacyDrone) {
        snap.activeEncounterGroup!.posture='Neutral';snap.activeEncounterGroup!.currentMood=25;
        isCombatActiveRef.current=false;setProjectiles([]);
      }
      encounterShotsFiredRef.current = snap.encounterShotsFired ?? { laser: 0, missile: 0 };
      lastWeaponFiredRef.current = null;
      tacticalCameraRef.current = tacticalCameraTarget(viewportRef.current.width,viewportRef.current.height,tacticalPosition,snap.activeEncounterGroup?.ships??[]);
      setQuestionCountdownTimer(snap.questionCountdownTimer ?? 60);
      setQuestionTotalTime(snap.questionTotalTime ?? 60);
      const restoredComms=snap.alienCommsState ?? structuredClone(initialAlienCommsRef.current);
      setAlienCommsState(snap.activeEncounterGroup ? {...restoredComms,alienMood:legacyDrone?25:restoredComms.alienMood,alienPosture:fleetPosture(snap.activeEncounterGroup,legacyDrone?'Neutral':restoredComms.alienPosture)} : restoredComms);
      setFlaresStopped(snap.flaresStopped ?? snap.flaresHalted ?? false);
      setUhlekSilenced(snap.uhlekSilenced ?? false);
      setElowanHostile(snap.elowanHostile ?? false);
      if (snap.speciesBaseMoods) setSpeciesBaseMoods(snap.speciesBaseMoods);
      else setSpeciesBaseMoods({ ...DEFAULT_BASE_MOODS });
      setCommLineUsage(snap.commLineUsage ?? {});
      commLineUsageRef.current = snap.commLineUsage ?? {};
      commTopicProgressRef.current={...snap.commTopicProgress};
      safeStorageSet('starflight_comm_line_usage', JSON.stringify(snap.commLineUsage ?? {}));
      setVisitedStarIds(snap.visitedStarIds ?? [1]);
      const settings = restoreSettings(snap.settings);
      setBanterEnabled(settings.banterEnabled);
      setTextSpeed(settings.textSpeed);
      setMusicVol(settings.musicVolume);
      setSoundVol(settings.soundVolume);
      setVoicesVol(settings.voicesVolume);
      setAlienVoiceEffectsEnabled(settings.alienVoiceEffects);
      setGfxQuality(settings.graphicsQuality);
      setCrtFilterEnabled(settings.crtFilter);
      setScreenShakeEnabled(settings.screenShake);

      // Restore destroyed planets in universe strictly via state
      const dKeys: string[] = snap.destroyedPlanetKeys || (snap as any).destroyedPlanets || [];
      if (snap.gameWon || snap.flaresStopped || snap.flaresHalted) {
        if (!dKeys.includes('192-152-0')) dKeys.push('192-152-0');
      }
      setDestroyedPlanetKeys(dKeys);

      setGameWon(snap.gameWon || false);
      setGameOverModal(null);
      setVictorySequenceModal(false);
      setCinematicState(snap.cinematicState ?? 'none');
      cinematicStateRef.current = snap.cinematicState ?? 'none';
      cinematicTimerRef.current = snap.cinematicRemaining ?? 0;
      cinematicDurationRef.current=snap.cinematicDuration??3;
      setCinematicTimer(snap.cinematicRemaining ?? 0);
      cinematicCompletingRef.current = false;
      setCrystalHeatTicks(snap.crystalHeatTicks ?? 0);
      crystalHeatAccumulatorRef.current = snap.crystalHeatRemainder ?? 0;
      crystalHeatDefeatTriggeredRef.current = false;
      setIsShipsLogOpen(false);
      setIsStarmapOpen(false);
      setIsPromptingColonyRec(false);
      setColonyPromptStep('ask_recommend');
      setDockingBayWarnings([]);
      setIsTrainingSkillModal(false);
      setIsCreatingCrewModal(false);
      setPersonnelIndex(0);
      setPersonnelMessage('');
      setIsPromptingDistress(false);
      setSurfaceRuinModal(null);
      setRoverCargoModalOpen(false);
      setRoverWeaponMenuOpen(false);
      setRoverLookData(null);
      setArmBombPromptItem(null);
      setEncounterCooldownTimer(snap.encounterCooldown ?? 0);
      setLaserCooldown(snap.laserCooldown ?? 0);
      setMissileCooldown(snap.missileCooldown ?? 0);
      setProjectiles(snap.projectiles ?? []);
      setActiveConsoleMenu('Bridge');
      setDisplayPanelMode('system_map');
      setGameState({ status: 'PLAYING', score: snap.gameWon ? 9999 : 100, level: 1 });
      setIsGameMenuOpen(false);
      gameAudio.playPowerupChime();
    },
    [saveSlots, assets, viewDimensions],
  );

  const handleOpenExportModal = useCallback(
    (slotKey: 'A' | 'B' | 'C' | 'D' | 'E') => {
      let targetData = saveSlots.find((s) => s.slot === slotKey);
      if ((!targetData || targetData.empty) && gameStateRef.current.status === 'PLAYING' && slotKey === activeSlot) {
        const snap = captureSnapshot();
        targetData = {
          slot: slotKey,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          credits,
          shipName: shipName || 'UNNAMED VESSEL',
          stardate: formattedStardate,
          location: gameLocation,
          empty: false,
          isDev: devUsed || snap.isDev,
          gameWon,
          flaresHalted: flaresStopped,
          bridgeLog: JSON.parse(JSON.stringify(snap.bridgeLog || systemMessages)),
          snapshot: snap,
        };
      }
      if (!targetData || targetData.empty) {
        gameAudio.playErrorBuzz();
        return;
      }

      setExportTargetSlot(slotKey);
      setExportSlotData(targetData);
      const payload: ExportSavePayload = {
        v: 1,
        type: 'starflight_save',
        slot: slotKey,
        timestamp: Date.now(),
        data: targetData,
      };
      const encoded = encodeSaveToBase64(payload);
      setExportCodeString(encoded);
      setCopySuccess(false);
      setIsExportModalOpen(true);
      gameAudio.playConfirmSelect();
    },
    [saveSlots, activeSlot, captureSnapshot, credits, shipName, formattedStardate, gameLocation, devUsed, gameWon, flaresStopped, systemMessages],
  );

  const handleCopyExportCode = useCallback(() => {
    if (!exportCodeString) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(exportCodeString)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2500);
          gameAudio.playConfirmSelect();
        })
        .catch(() => {
          const el = document.getElementById('export-code-textarea') as HTMLTextAreaElement | null;
          if (el) {
            el.select();
            try {
              document.execCommand('copy');
              setCopySuccess(true);
              setTimeout(() => setCopySuccess(false), 2500);
              gameAudio.playConfirmSelect();
            } catch (err) {
              console.warn('Manual copy needed');
            }
          }
        });
    } else {
      const el = document.getElementById('export-code-textarea') as HTMLTextAreaElement | null;
      if (el) {
        el.select();
        try {
          document.execCommand('copy');
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2500);
          gameAudio.playConfirmSelect();
        } catch (err) {
          console.warn('Manual copy needed');
        }
      }
    }
  }, [exportCodeString]);

  const handleDownloadExportedSave = useCallback(() => {
    if (!exportSlotData || !exportCodeString) return;
    const rawShip = (exportSlotData.shipName || 'vessel').trim();
    const safeShip = rawShip.replace(/[^a-zA-Z0-9_-]/g, '_') || 'vessel';
    const rawDate = (exportSlotData.stardate || 'stardate').trim();
    const safeDate = rawDate.replace(/[^a-zA-Z0-9_-]/g, '_') || 'stardate';
    const filename = `starflight_${safeShip}_${safeDate}.sfsave`;

    const blob = new Blob([exportCodeString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    gameAudio.playCoinPickup();
  }, [exportSlotData, exportCodeString]);

  const acceptImportText = useCallback((text:string) => {
    if(!importTextWithinBudget(text)) {
      setImportCodeInput('');
      setImportStatus({type:'error',message:'Save payload is too large. No changes made. Use a backup smaller than 4 MiB of decoded JSON.'});
      return false;
    }
    setImportCodeInput(text);setImportStatus(null);return true;
  },[]);

  const handleImportFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if(file.size>MAX_SAVE_FILE_BYTES) {
      setImportCodeInput('');setImportStatus({type:'error',message:'Save file is too large. No changes made. Use a backup smaller than 4 MiB of decoded JSON.'});return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (typeof content==='string' && acceptImportText(content)) {
        gameAudio.playConfirmSelect();
      }
    };
    reader.onerror=()=>{setImportCodeInput('');setImportStatus({type:'error',message:'The save file could not be read. No changes made.'});};
    reader.readAsText(file);
  }, [acceptImportText]);

  const handleExecuteImport = useCallback(() => {
    if (!importCodeInput.trim()) {
      setImportStatus({
        type: 'error',
        message: 'Please paste a save code or load a .sfsave file.',
      });
      gameAudio.playErrorBuzz();
      return;
    }

    const decoded = decodeSaveFromBase64(importCodeInput);
    if (!decoded || !decoded.data) {
      setImportStatus({
        type: 'error',
        message: 'Invalid or corrupted save code. No changes made.',
      });
      gameAudio.playErrorBuzz();
      return;
    }

    const sourceData = decoded.data;
    const targetSlotKey = importDestSlot;
    const restoredSlotData: SaveSlotData = {
      ...sourceData,
      slot: targetSlotKey,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      empty: false,
    };

    if (restoredSlotData.snapshot) {
      restoredSlotData.snapshot = {
        ...restoredSlotData.snapshot,
      };
    }

    const serialized = JSON.stringify(restoredSlotData);
    safeStorageSet(SLOT_KEYS[targetSlotKey], serialized);
    safeStorageSet(LEGACY_SLOT_KEYS[targetSlotKey], serialized);
    safeStorageSet(LAST_SLOT_KEY, targetSlotKey);

    setSaveSlots((prev) => {
      const updated = prev.map((s) => (s.slot === targetSlotKey ? restoredSlotData : s));
      try {
        safeStorageSet(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setActiveSlot(targetSlotKey);
    setImportStatus({
      type: 'success',
      message: `Mission restored to Slot ${targetSlotKey}! (${restoredSlotData.shipName || 'Unnamed'} • ${restoredSlotData.stardate})`,
      restoredSlot: targetSlotKey,
    });
    gameAudio.playPowerupChime();
  }, [importCodeInput, importDestSlot]);

  const handleResumeImportedMission = useCallback(
    (slotKey: 'A' | 'B' | 'C' | 'D' | 'E') => {
      setIsImportModalOpen(false);
      handleLoadFromSlot(slotKey);
    },
    [handleLoadFromSlot],
  );

  const startNewGame = useCallback(() => {
    missionEpochRef.current++;
    blockedSalvageRef.current.clear();
    heldKeysRef.current = {};
    voiceEngine.stopAllVoices();
    setPendingCheckpoint(null);
    setDevUsed(false);
    setLastInterestAbsDay(0);
    setPendingRecommendations([]);
    setTraversedFluxIds([]);
    setFluxDisorientationTimer(0);
    fluxCooldownTimerRef.current = 0;
    fluxExitDestRef.current = null;
    isJumpingFluxRef.current = false;
    lastTraversedFluxIdRef.current = null;
    setEvaluations([]);
    setBulletins(FULL_NOTICES_CATALOG.filter(b => {
      const date = parseDateString(b.date);
      return getAbsoluteDay(date.day, date.month, date.year) <= 0;
    }).map(b => ({ ...b, read: true })));
    setLandingLat(15);
    setLandingLong(-30);
    setVehicleDestroyed(false);
    setVehicleFuel(100);
    setVehicleHold([]);
    setVehicleX(0);
    setVehicleY(0.6);
    setVehicleHeading(0);
    setVehicleWeapon('Stunner');
    setArtifactStock(initialArtifactStock());
    setTradeDepotMessage(null);
    setDiscoveredSpecies([]);
    setSurveyKnowledge(emptySurveyKnowledge());
    setSurfaceRecording(null);
    setMiningSession(null);setMiningTargetId(null);setMiningOpen(false);setMiningMessage('');setLastMiningExtracted(0);setSurfaceWeaponBeam(null);
    setCopyDestination(null);setSlotActionNotice(null);setReplacementStatus(null);
    setCurrentSurfaceState(null);
    planetSurfacesRef.current = {};
    setOrbitAnimPhase(0);hyperspaceDepartureStarRef.current=null;hyperspaceEnteringRef.current=false;
    setArmedDetonationTracker(null);
    setDetonationSequence(null);
    setScreenWhiteFlashTimer(0);
    setHasPurchasedBlackBox(false);
    setGrantedDroneClearanceUntilHyperspace(false);
    setHasGivenEllipsoid(false);
    setMechan9Unlocked(false);
    setHasRefusedCrystalOrb(false);
    setAlienCommsState(structuredClone(initialAlienCommsRef.current));
    setEncounterShipPos({ x: 0, y: 0 });
    encounterPassIndexRef.current = 0;
    combatDurationTimerRef.current = 0;
    passTimerRef.current = 0;
    isCombatActiveRef.current = false;
    encounterShotsFiredRef.current = { laser: 0, missile: 0 };
    lastWeaponFiredRef.current = null;
    setQuestionCountdownTimer(60);
    setQuestionTotalTime(60);
    setShipVx(0);
    setShipVy(0);
    setActiveDirectionVector({ dx: 0, dy: 0 });
    setClickMoveTarget(null);
    setAstronautVx(0);
    setAstronautVy(0);
    setIsGameMenuOpen(false);
    setIsShipsLogOpen(false);
    setIsStarmapOpen(false);
    setIsPromptingColonyRec(false);
    setIsPromptingDistress(false);
    setSurfaceRuinModal(null);
    setRoverCargoModalOpen(false);
    setRoverWeaponMenuOpen(false);
    setRoverLookData(null);
    setArmBombPromptItem(null);
    setCinematicState('none');
    cinematicStateRef.current = 'none';
    cinematicTimerRef.current = 0;
    cinematicCompletingRef.current = false;
    setCrystalHeatTicks(0);
    crystalHeatAccumulatorRef.current = 0;
    if (clampReleaseAnimIdRef.current !== null) cancelAnimationFrame(clampReleaseAnimIdRef.current);
    clampReleaseAnimIdRef.current = null;
    setIsReleasingClamps(false);
    setIntroPage(1);
    setGameState({ status: 'PLAYING', score: 100, level: 1 });
    setGameLocation('Starport');
    updatePlanetaryScan(null);
    scienceEpochRef.current++;alienScanRef.current=null;setScienceReading(null);
    setPrevGameLocation('Hyperspace');
    const concourseCanvas = getConcourseCanvas(assets);
    const spawnPos = imageFracToCanvas(
      CONCOURSE_SPAWN_U,
      CONCOURSE_SPAWN_V,
      viewDimensions.width,
      viewDimensions.height,
      concourseCanvas
    );
    setAstronautX(spawnPos.x);
    setAstronautY(spawnPos.y);
    setActiveRoomIndex(null);
    setCurrentStarId(1);
    setGalaxyShipX(125.0);
    setGalaxyShipY(100.0);
    setSystemShipX(-88);
    setSystemShipY(118);
    setSystemZoom(8.0);
    setHyperZoom(2.5);
    galaxyShipXRef.current = 125.0;
    galaxyShipYRef.current = 100.0;
    setShipHeading(Math.PI * 0.75);
    setOrbitPlanetIndex(null);
    setActiveConsoleMenu('Bridge');
    setDisplayPanelMode('system_map');
    setCredits(12000);
    setBankLedger([
      {
        date: '01-01-4620',
        desc: 'Interstel Commission Starting Grant',
        amount: 12000,
        balance: 12000,
      },
    ]);
    setStardateDay(1);
    setStardateMonth(1);
    setStardateYear(4620);
    setStardateHour(0);
    previousStarHoursRef.current = 0;
    flightClockAccumulatorRef.current = 0;
    setStarportDestroyed(false);
    setSystemMessages([
      {
        id: 'init-msg',
        text: 'Starport Arth operations gantry online. Ready for dispatch.',
        type: 'info',
      },
    ]);
    setBanterLog([
      {
        speaker: 'Jax Vance',
        post: 'Captain',
        text: 'Starport terminal verified. All crew ready for deep-space dispatch.',
      },
    ]);
    setUnsuitablePlanetsRecommendedCount(0);
    setRecommendedPlanets([]);
    setLoggedTelemetryPlanets([]);
    setShipName('');
    setEngineClass(1);
    setShieldClass(0);
    setShieldsRaised(false);
    setPlayerShieldPoints(0);
    setWeaponsArmed(false);
    setArmorClass(0);
    setPlayerArmorPoints(250);
    setMissileClass(0);
    setLaserClass(0);
    setCargoPods(0);
    setEnduriumFuel(20.0);
    setHullIntegrity(250);
    setSubsystems({ Engines: 100, Sensors: 100, Comms: 100, Shields: 100, Missiles: 100, Lasers: 100 });
    setInoperativeSystems({ Engines: false, Sensors: false, Comms: false, Shields: false, Missiles: false, Lasers: false });
    setActivePatientId(null);
    setActiveRepairTask(null);
    setSelectedRepairTarget('Hull');
    setConfirmRepairTarget(null);
    // Reset destroyed planets strictly for this clean fresh game
    setDestroyedPlanetKeys([]);
    setGameWon(false);
    setEngineeringMode('menu');
    setMedicalMode('status');
    setGameOverModal(null);
    setVictorySequenceModal(false);
    setFlaresStopped(false);
    setUhlekSilenced(false);
    setElowanHostile(false);
    setSpeciesBaseMoods({ ...DEFAULT_BASE_MOODS });
    setCommLineUsage({});
    commLineUsageRef.current = {};
    commTopicProgressRef.current={};
    safeStorageSet('starflight_comm_line_usage', JSON.stringify({}));
    resetCommLineUsage();
    setVisitedStarIds([1]);
    setProjectiles([]);
    setActiveEncounterGroup(null);
    setEncounterCooldownTimer(0);
    setLaserCooldown(0);
    setMissileCooldown(0);
    setAlienGroups(generateAlienGroups());
    fleetChangesRef.current={};
    alienTrackingHourRef.current=null;
    flightEncounterStartedRef.current=false;
    setCargoHold({
      Aluminum: 0,
      Cobalt: 0,
      Molybdenum: 0,
      Promethium: 0,
      Titanium: 0,
    });
    setArtifactsInHold([]);
    setSpecimensInHold([]);
    setRoverWaypoint(null);
    setDockingBayWarnings([]);
    setCrewRoster([]);
    setAssignedPosts({
      Captain: null,
      'Science Officer': null,
      Navigator: null,
      Engineer: null,
      Communications: null,
      Doctor: null,
    });

    gameAudio.playConfirmSelect();
    if (sdk) sdk.startGame();
  }, [sdk, assets, viewDimensions]);

  const beginNewMission = useCallback((slot: SaveSlotData['slot']) => {
    setReplacementMission(null);
    setActiveSlot(slot);
    startNewGame();
    handleSaveToSlot(slot);
  }, [startNewGame, handleSaveToSlot]);

  const handleRequestNewMission = useCallback(() => {
    setReplacementMode('new');
    const freshSlots = loadInitialSaveSlots().slots;
    const destination = newMissionDestination(freshSlots, activeSlot);
    if (destination.replace) {
      replacementReturnFocusRef.current = document.activeElement as HTMLElement | null;
      setSaveSlots(freshSlots);
      setReplacementStatus(null);
      setReplacementMission(freshSlots.find(slot=>slot.slot===destination.slot)!);
      return;
    }
    beginNewMission(destination.slot);
  }, [activeSlot, beginNewMission]);

  const handleCancelMissionReplacement = useCallback(() => {
    setReplacementMission(null);
    replacementReturnFocusRef.current?.focus();
  }, []);

  const handleConfirmMissionReplacement = useCallback(() => {
    if (!replacementMission) return;
    const freshSlots = loadInitialSaveSlots().slots;
    const current = freshSlots.find(slot=>slot.slot===replacementMission.slot)!;
    if(replacementMode==='copy') {
      const destination=freshSlots.find(slot=>slot.slot===copyTargetSlot)!;
      if(current.empty||!current.snapshot) {setReplacementStatus('The source slot is now empty. Cancel and choose an existing mission.');return;}
      if(!sameMissionVersion(current,replacementMission) || !copyDestination || !sameMissionVersion(destination,copyDestination)) {
        setSaveSlots(freshSlots);setReplacementMission(current);setCopyDestination(destination);
        setReplacementStatus('A source or destination changed. Review the updated missions before copying.');
        return;
      }
      const copied=copyMissionSlot(current,copyTargetSlot);
      persistSaveSlots(freshSlots.map(slot=>slot.slot===copyTargetSlot?copied:slot));
      setReplacementMission(null);
      let durable=false;
      try {durable=localStorage.getItem(SLOT_KEYS[copyTargetSlot])===JSON.stringify(copied);} catch {}
      setSlotActionNotice(durable?`Copied Slot ${current.slot} to Slot ${copyTargetSlot}. Your active mission stays in Slot ${activeSlot}.`:`Slot ${copyTargetSlot} is copied for this session only. Export that slot before closing this tab.`);
      replacementReturnFocusRef.current?.focus();
      return;
    }
    if (!current.empty && !sameMissionVersion(current,replacementMission)) {
      setSaveSlots(freshSlots);
      setReplacementMission(current);
      setReplacementStatus('This slot changed while the confirmation was open. Review the updated mission before replacing it.');
      gameAudio.playErrorBuzz();
      return;
    }
    beginNewMission(replacementMission.slot);
  }, [replacementMission,replacementMode,copyTargetSlot,copyDestination,persistSaveSlots,activeSlot,beginNewMission]);

  const handleRequestSlotAction=useCallback((slotKey:SaveSlotData['slot'],mode:'copy'|'reset')=>{
    writeCheckpoint(activeSlot);
    const freshSlots=loadInitialSaveSlots().slots;
    const source=freshSlots.find(slot=>slot.slot===slotKey)!;
    if(source.empty||!source.snapshot) return;
    replacementReturnFocusRef.current=document.activeElement as HTMLElement|null;
    setSaveSlots(freshSlots);setReplacementMode(mode);setReplacementStatus(null);setSlotActionNotice(null);
    if(mode==='copy') {
      const destination=freshSlots.find(slot=>slot.slot!==slotKey&&slot.empty)??freshSlots.find(slot=>slot.slot!==slotKey)!;
      setCopyTargetSlot(destination.slot);setCopyDestination(destination);
    }
    setReplacementMission(source);
  },[activeSlot,writeCheckpoint]);

  const handleContinue = useCallback(() => {
    const freshSlots = loadInitialSaveSlots().slots;
    const active = freshSlots.find((s) => s.slot === activeSlot && !s.empty) || saveSlots.find((s) => s.slot === activeSlot && !s.empty);
    const firstFilled = freshSlots.find((s) => !s.empty) || saveSlots.find((s) => !s.empty);
    const target = active || firstFilled;
    if (target && !target.empty) {
      if(target.loadError){handleLoadFromSlot(target.slot);return;}
      if (target.snapshot) {
        handleLoadFromSlot(target.slot);
      } else {
        setActiveSlot(target.slot);
        setIntroPage(0);
        setGameLocation(target.location || 'Starport');
        setActiveRoomIndex(null);
        const concourseCanvas = getConcourseCanvas(assets);
        const spawnPos = imageFracToCanvas(
          CONCOURSE_SPAWN_U,
          CONCOURSE_SPAWN_V,
          viewDimensions.width,
          viewDimensions.height,
          concourseCanvas
        );
        setAstronautX(spawnPos.x);
        setAstronautY(spawnPos.y);
        setSystemMessages(target.bridgeLog ? JSON.parse(JSON.stringify(target.bridgeLog)) : []);
        setBanterLog([]);
        setGameState({ status: 'PLAYING', score: 100, level: 1 });
        setIsGameMenuOpen(false);
        gameAudio.playPowerupChime();
      }
    } else {
      beginNewMission(activeSlot);
    }
  }, [saveSlots, activeSlot, handleLoadFromSlot, beginNewMission]);

  // Active Planets in Current Star System (Isolated per-game state)
  const currentPlanets = useMemo(() => {
    return survivingPlanets(currentStar.planets, currentStar.x, currentStar.y, destroyedPlanetKeys).map((p) => {
      const position=systemPlanetPosition(p,orbitAnimPhase/.4);
      return {
        ...p,
        ...position,
      };
    });
  }, [currentStar, destroyedPlanetKeys,orbitAnimPhase]);

  // Retain each planet's live surface across departures. This also restores
  // older saves that predate serialized surface data when resuming on land.
  useEffect(() => {
    const p = orbitPlanetIndex === null ? null : currentPlanets[orbitPlanetIndex];
    if (!p || !['On Planet', 'Terrain Vehicle'].includes(gameLocation)) return;
    const key = planetKey(currentStar.x, currentStar.y, p.orderIndex);
    const surface = preparePlanetSurface(currentSurfaceState ?? planetSurfacesRef.current[key], currentStar.x,currentStar.y,p,landingLat,landingLong);
    planetSurfacesRef.current[key] = surface;
    if (!currentSurfaceState) setCurrentSurfaceState(surface);
  }, [gameLocation, currentStar, currentPlanets, orbitPlanetIndex, currentSurfaceState, landingLat, landingLong]);

  useEffect(()=>{
    if(currentSurfaceState&&['On Planet','Terrain Vehicle'].includes(gameLocation))rememberLocalContacts(currentSurfaceState,{x:vehicleX,y:vehicleY});
  },[currentSurfaceState,vehicleX,vehicleY,gameLocation,isSurfaceMapOpen]);

  // Nearby Planet in Star System
  const nearbyPlanet = useMemo(() => {
    if (gameLocation !== 'Star System') return null;
    for (let i = 0; i < currentPlanets.length; i++) {
      const p = currentPlanets[i];
      const dist = Math.hypot(systemShipX - p.currentX, systemShipY - p.currentY);
      if (dist <= p.renderSize + 16) {
        return { ...p, index: i, distance: dist };
      }
    }
    return null;
  }, [gameLocation, systemShipX, systemShipY, currentPlanets]);

  // Nearby Star in Hyperspace
  const nearbyStar = useMemo(() => {
    if (gameLocation !== 'Hyperspace') return null;
    for (const st of UNIVERSE.stars) {
      const dist = Math.hypot(galaxyShipX - st.x, galaxyShipY - st.y);
      if (dist <= 1.3) {
        return { ...st, distance: dist };
      }
    }
    return null;
  }, [gameLocation, galaxyShipX, galaxyShipY]);

  // Is current ship inside a Nebula?
  const inNebula = useMemo(() => {
    if (gameLocation === 'Hyperspace') return isInsideNebula(galaxyShipX, galaxyShipY);
    if (gameLocation === 'Star System' || gameLocation === 'In Orbit') return isInsideNebula(currentStar.x, currentStar.y, currentStar.inNebula);
    if (gameLocation === 'Encounter') {
      if (activeEncounterGroup && isInsideNebula(activeEncounterGroup.x, activeEncounterGroup.y)) return true;
      if (isInsideNebula(galaxyShipX, galaxyShipY)) return true;
      return isInsideNebula(currentStar.x, currentStar.y, currentStar.inNebula);
    }
    return false;
  }, [gameLocation, activeEncounterGroup, galaxyShipX, galaxyShipY, currentStar]);

  // Malfunction check helper
  const checkMalfunction = useCallback(
    (sys: SubsystemKey): boolean => {
      const hp = subsystems[sys];
      if (hp <= 0) {
        setInoperativeSystems((prev) => ({ ...prev, [sys]: true }));
        gameAudio.playMalfunctionSputter();
        addMessage(`ENGINEERING FAILURE: ${sys} is at 0% and completely INOPERATIVE!`, 'Engineer', 'alert');
        return true;
      }

      if (inoperativeSystems[sys]) {
        gameAudio.playMalfunctionSputter();
        addMessage(`ENGINEERING ALERT: ${sys} is INOPERATIVE. Repair subsystem to restore function.`, 'Engineer', 'alert');
        return true;
      }

      if (hp < 100) {
        const failureChance = 100 - hp;
        const roll = Math.random() * 100;
        if (roll < failureChance) {
          setInoperativeSystems((prev) => ({ ...prev, [sys]: true }));
          gameAudio.playMalfunctionSputter();
          triggerBanter('malfunction', sys);
          addMessage(`MALFUNCTION: ${sys} malfunctioned under stress (${failureChance}% risk)! System marked INOPERATIVE.`, 'Engineer', 'alert');
          return true;
        }
      }

      return false;
    },
    [subsystems, inoperativeSystems, triggerBanter, addMessage],
  );

  const handleCrewCasualty = useCallback(
    (deceased: CrewMember) => {
      deceased.alive = false;
      deceased.vitality = 0;
      gameAudio.playDefeatMotif();
      addMessage(`CASUALTY REPORT: Officer ${deceased.name} (${deceased.race}) has succumbed to fatal injuries!`, 'Doctor', 'alert');

      setAssignedPosts((prevPosts) => {
        const updated = { ...prevPosts };
        setCrewRoster((roster) => {
          const livingCrew = roster.filter((c) => c.alive && c.id !== deceased.id);

          if (livingCrew.length === 0) {
            setGameOverModal({
              title: 'TOTAL CREW LOSS',
              desc: 'All starship personnel have perished. The vessel drifts silently into the deep cosmic void.',
              poignantLine: 'The emergency beacon echoes unanswered in the deep space silence. No hands remain on the helm.',
            });
            return roster;
          }

          CREW_POSTS.forEach((post) => {
            if (updated[post] === deceased.id) {
              const best = bestActingOfficer(livingCrew,post);
              if (best) {
                updated[post] = best.id;
                addMessage(`COMMAND SUCCESSION: ${best.name} designated acting ${post}.`, undefined, 'info');
              } else {
                updated[post] = null;
              }
            }
          });
          return [...roster];
        });
        return updated;
      });
      if (crewRosterFrameRef.current.some(officer=>officer.alive)) handleSaveToSlot(activeSlot);
    },
    [addMessage,handleSaveToSlot,activeSlot],
  );

  // In-Flight Mineral Repairs
  const startMineralRepair = useCallback(
    (target: 'Hull' | SubsystemKey) => {
      const hullIntegrity = hullIntegrityFrameRef.current;
      const subsystems = subsystemsFrameRef.current;
      const cargoHold = cargoHoldFrameRef.current;
      if (hullIntegrity <= 0 || activeRepairTaskFrameRef.current) return;

      if (target !== 'Hull' && subsystems[target] <= 0) {
        gameAudio.playErrorBuzz();
        addMessage(`Engineering: ${target} is completely destroyed (0%). Field repair impossible; overhaul required at Starport.`, 'Engineer', 'alert');
        return;
      }

      const currentHealth = target === 'Hull' ? (hullIntegrity / 250) * 100 : subsystems[target];
      if (currentHealth >= 100) {
        addMessage(`Engineering: ${target} is already at 100% nominal integrity.`, 'Engineer', 'info');
        return;
      }

      const mineralInfo = REPAIR_MINERALS[target];
      const mineralCost = fieldRepairCost(currentHealth);

      const mineralAvailable = cargoHold[mineralInfo.mineral] || 0;
      if (mineralAvailable < mineralCost) {
        gameAudio.playErrorBuzz();
        addMessage(`Engineering: Insufficient ${mineralInfo.mineral} in cargo hold. Required: ${mineralCost.toFixed(1)} m³, Available: ${mineralAvailable.toFixed(1)} m³.`, 'Engineer', 'alert');
        return;
      }

      setCargoHold((prev) => ({
        ...prev,
        [mineralInfo.mineral]: adjustCargoStock(prev[mineralInfo.mineral], -mineralCost),
      }));

      setActiveRepairTask({
        target,
        targetHealth: 100,
        mineralName: mineralInfo.mineral,
        mineralCost,
      });

      setConfirmRepairTarget(null);
      gameAudio.playPowerupChime();
      triggerBanter('repair_start', `${mineralInfo.label} (${mineralInfo.mineral})`);
      addMessage(`Engineering: Began repair on ${mineralInfo.label} (-${mineralCost.toFixed(1)} m³ ${mineralInfo.mineral}).`, 'Engineer', 'info');
      handleSaveToSlot(activeSlot);
    },
    [triggerBanter, addMessage, handleSaveToSlot, activeSlot],
  );

  const handleToggleShields = useCallback(() => {
    if (inNebula) {
      setShieldsRaised(false);
      gameAudio.playErrorBuzz();
      addMessage('Magnetic disturbances in nebula causing energy fluctuations.', 'Engineer', 'alert');
      addMessage('Shields are down.', 'Engineer', 'alert');
      return;
    }

    if (enduriumFuel <= 0) {
      setShieldsRaised(false);
      gameAudio.playErrorBuzz();
      addMessage("Shields can't be raised.", 'Engineer', 'alert');
      return;
    }

    if (shieldClass <= 0) {
      gameAudio.playErrorBuzz();
      addMessage('Engineer: No shield generator installed aboard starship.', 'Engineer', 'alert');
      return;
    }

    if (!shieldsRaised) {
      if (checkMalfunction('Shields')) return;

      const degradedCapacity = Math.round((shieldClass * 500) * (subsystems.Shields / 100));
      setShieldsRaised(true);
      if (playerShieldPoints <= 0) {
        setPlayerShieldPoints(degradedCapacity);
      }
      gameAudio.playPowerupChime();
      triggerBanter('shields_raise');
      addMessage(`Engineer: Deflector shields RAISED (${playerShieldPoints > 0 ? playerShieldPoints : degradedCapacity}/${degradedCapacity} pts).`, 'Engineer', 'info');
    } else {
      setShieldsRaised(false);
      gameAudio.playCrispClick();
      triggerBanter('shields_drop');
      addMessage('Engineer: Deflector shields lowered to standby.', 'Engineer', 'info');
    }
  }, [inNebula, shieldClass, enduriumFuel, shieldsRaised, checkMalfunction, subsystems.Shields, playerShieldPoints, triggerBanter, addMessage]);

  const handleToggleWeapons = useCallback(() => {
    if (laserClass <= 0 && missileClass <= 0) {
      gameAudio.playErrorBuzz();
      addMessage('Captain: No weapon systems installed aboard vessel.', 'Captain', 'alert');
      return;
    }

    if (!weaponsArmed) {
      if (laserClass > 0 && checkMalfunction('Lasers')) return;
      if (missileClass > 0 && checkMalfunction('Missiles')) return;

      setWeaponsArmed(true);
      gameAudio.playGunshotBlast();
      triggerBanter('arm_weapons');
      addMessage('Captain: Starship tactical targeting and weapon capacitors ARMED.', 'Captain', 'alert');
    } else {
      setWeaponsArmed(false);
      gameAudio.playCrispClick();
      triggerBanter('disarm_weapons');
      addMessage('Captain: Weapon safeties engaged.', 'Captain', 'info');
    }
  }, [laserClass, missileClass, weaponsArmed, checkMalfunction, triggerBanter, addMessage]);

  // Original HYPER-OV ENCCLEANUP, including equal moods moving five toward calm.
  const applyEncounterEndMoodShift = useCallback((race: AlienRace, endMood: number) => {
    if(!ALIEN_PERSONALITIES[race])return;
    setSpeciesBaseMoods(prev=>({...prev,[race]:race==='Mechans'&&mechan9Unlocked?1:rememberedRaceMood(prev[race]??DEFAULT_BASE_MOODS[race],endMood)}));
  }, [mechan9Unlocked]);

  // Emergency Pearl Escape in Encounter
  const handleTriggerPearlEmergencyEscape = useCallback(() => {
    stopAlienVoice();
    if (!hasCrystalPearl) return;
    if (activeEncounterGroup) {
      applyEncounterEndMoodShift(activeEncounterGroup.race, alienCommsState.alienMood);
    }
    setGameLocation('Hyperspace');
    setActiveEncounterGroup(null);
    setProjectiles([]);
    setActiveConsoleMenu('Bridge');
    setDisplayPanelMode('system_map');

    const randX = Math.floor(Math.random() * 240) + 5;
    const randY = Math.floor(Math.random() * 210) + 5;
    galaxyShipXRef.current = randX;
    galaxyShipYRef.current = randY;
    setGalaxyShipX(randX);
    setGalaxyShipY(randY);

    gameAudio.playPowerupChime();
    addMessage(`CRYSTAL PEARL DISPLACEMENT: The iridescent pearl pulsed with sub-space energy, warping starship to hyperspace coordinates [${randX}, ${randY}]!`, 'Navigator', 'alert');
  }, [hasCrystalPearl, activeEncounterGroup, alienCommsState.alienMood, applyEncounterEndMoodShift, addMessage]);

  // Submit Colony Habitability Recommendation with Starflight Canonical Rules
  const handleConfirmColonyRecommendation = useCallback(() => {
    if (orbitPlanetIndex === null) return;
    const p = currentPlanets[orbitPlanetIndex];
    if (!p) return;
    const colonyName = (colonyNameInput.trim() || p.name).slice(0, 15);
    const planetKey = `${currentStar.x}-${currentStar.y}-${p.orderIndex}`;

    if (recommendedPlanets.includes(planetKey)) {
      gameAudio.playErrorBuzz();
      addMessage(`Command: ${p.name} has already been recommended for colonization.`, 'Captain', 'alert');
      setIsPromptingColonyRec(false);
      return;
    }

    setRecommendedPlanets((prev) => [...prev, planetKey]);
    setIsPromptingColonyRec(false);
    payBankInterest(true);

    // Evaluate Suitability according to the 6 canonical conditions (collect in uppercase)
    const reasons: string[] = [];

    // Helper to check gases
    const hasGas = (gasName: string) =>
      p.gases?.some((g) => g.toLowerCase().includes(gasName.toLowerCase())) ?? false;

    const hasO2 = hasGas('oxygen');
    const hasN2 = hasGas('nitrogen');
    const hasCO2 = hasGas('carbon dioxide');
    const hasH2 = hasGas('hydrogen');

    // 1. EXTREME HEAT: Cold end of temperature range is above Tropical (i.e. Searing or Inferno)
    if (p.tempMinIndex !== undefined ? p.tempMinIndex >= 4 : (p.temperature === 'Inferno' || p.temperature === 'Searing')) {
      reasons.push('EXTREME HEAT');
    }

    // 2. EXTREME COLD: Hot end of temperature range is below Temperate (i.e. Sub-Arctic or Arctic)
    if (p.tempMaxIndex !== undefined ? p.tempMaxIndex <= 1 : (p.temperature === 'Arctic' || p.temperature === 'Sub-Arctic')) {
      reasons.push('EXTREME COLD');
    }

    // 3. CRUSHING GRAVITY: Gravity > 2.00 G
    if (p.gravity > 2.0) {
      reasons.push('CRUSHING GRAVITY');
    }

    // 4. VIOLENT STORMS: Weather is Violent or Very Violent (or Extreme)
    if (p.weather === 'Violent' || p.weather === 'Very Violent') {
      reasons.push('VIOLENT STORMS');
    }

    // 5. LACK OF OXYGEN: No breathable air: atmosphere lacks Oxygen combined with either Nitrogen or Carbon Dioxide (or atmosphere density is not breathable)
    const isBreathableDensity = p.atmosphereDensity !== 'None';
    const hasBreathableGasCombo = hasO2 && (hasN2 || hasCO2);
    if (!isBreathableDensity || !hasBreathableGasCombo) {
      reasons.push('LACK OF OXYGEN');
    }

    // 6. LACK OF WATER: No water seas/hydrosphere, AND atmosphere lacks Oxygen combined with Hydrogen
    const hasWaterSeas = p.hydrosphereCompound?.toLowerCase().includes('water') && p.hydrospherePercent > 0;
    const hasO2AndH2 = hasO2 && hasH2;
    if (!hasWaterSeas && !hasO2AndH2) {
      reasons.push('LACK OF WATER');
    }

    const isSuitable = reasons.length === 0;
    const verdict: 'SUITABLE' | 'UNSUITABLE' = isSuitable ? 'SUITABLE' : 'UNSUITABLE';

    let payout = 0;
    let fine = 0;
    let bonus = 0;
    let warningMessage: string | undefined = undefined;
    let notes = '';

    if (!isSuitable) {
      // Escalating Fines for Unsuitable Recommendations
      const currentCount = unsuitablePlanetsRecommendedCount;
      if (currentCount === 0) {
        fine = 100;
        warningMessage = 'This is only a warning, your next fine will be heavy.';
      } else {
        fine = Math.min(80000, 10000 * currentCount);
      }
      payout = -fine;
      notes = reasons.join(', ') + (warningMessage ? `. ${warningMessage}` : '');

      setUnsuitablePlanetsRecommendedCount((c) => c + 1);
      addBankTransaction(`Colonial Directorate Penalty: ${colonyName}`, -fine);
    } else {
      // Bonus Points for Suitable Planets
      let points = 0;

      // +1 for cold end Tropical or below
      if (p.tempMinIndex !== undefined ? p.tempMinIndex <= 3 : (p.temperature === 'Tropical' || p.temperature === 'Temperate' || p.temperature === 'Sub-Arctic' || p.temperature === 'Arctic')) {
        points += 1;
      }
      // +1 for hot end Temperate or above
      if (p.tempMaxIndex !== undefined ? p.tempMaxIndex >= 2 : (p.temperature === 'Temperate' || p.temperature === 'Tropical' || p.temperature === 'Searing' || p.temperature === 'Inferno')) {
        points += 1;
      }
      // +2 for gravity between 0.70 G and 1.30 G (+1 otherwise)
      if (p.gravity >= 0.70 && p.gravity <= 1.30) {
        points += 2;
      } else {
        points += 1;
      }
      // +1 for weather below Very Violent
      if (p.weather !== 'Very Violent' && p.weather !== 'Violent') {
        points += 1;
      }
      // +1 more for weather Moderate or calmer
      if (p.weather === 'Calm' || p.weather === 'Moderate' || p.weather === 'None') {
        points += 1;
      }
      // +1 if indigenous life exists
      if (p.bioDensity > 0) {
        points += 1;
      }
      // +max(1, floor(mineralDensity / 50)) if planet has mineral deposits
      if (p.minerals && p.minerals.length > 0) {
        const totalMineralDensity = p.mineralDensity || p.minerals.reduce((sum, m) => sum + m.density, 0);
        points += Math.max(1, Math.floor(totalMineralDensity / 50));
      }

      bonus = points * 5000;
      payout = bonus;
      notes = `Approved for colonization with ${points} habitability points. Excellent colonial prospect.`;

      addBankTransaction(`Colonial Directorate Bonus: ${colonyName}`, bonus);
    }

    const newEval: ColonyEvaluation = {
      id: `eval-${Date.now()}`,
      planetName: p.name,
      colonyName,
      starX: currentStar.x,
      starY: currentStar.y,
      stardate: formattedStardate,
      suitable: isSuitable,
      verdict,
      rating: isSuitable ? (bonus >= 35000 ? 'A' : 'B') : 'F',
      payout,
      fine: fine > 0 ? fine : undefined,
      bonus: bonus > 0 ? bonus : undefined,
      reasons,
      warningMessage,
      isOptimal: isSuitable && bonus >= 40000,
      notes,
      read: false,
    };

    setEvaluations((prev) => [newEval, ...prev]);

    // In orbit, detailed verdict is NOT shown. Simple queue acknowledgment is shown.
    gameAudio.playConfirmSelect();
    addMessage(`Colony recommendation filed for ${colonyName}. Telemetry queued for evaluation at Starport Operations.`, 'Captain', 'info');
    handleSaveToSlot(activeSlot);
  }, [orbitPlanetIndex, currentPlanets, colonyNameInput, currentStar, recommendedPlanets, unsuitablePlanetsRecommendedCount, formattedStardate, addBankTransaction, addMessage, payBankInterest, handleSaveToSlot, activeSlot]);

  // Log Planet Telemetry Only (without colony recommendation)
  const handleLogTelemetryOnly = useCallback(() => {
    if (orbitPlanetIndex === null) return;
    const p = currentPlanets[orbitPlanetIndex];
    if (!p) return;
    const planetKey = `${currentStar.x}-${currentStar.y}-${p.orderIndex}`;

    if (!loggedTelemetryPlanets.includes(planetKey)) {
      setLoggedTelemetryPlanets((prev) => [...prev, planetKey]);
    }
    setIsPromptingColonyRec(false);
    gameAudio.playDataChime();
    addMessage(`Planet telemetry for ${p.name} logged to Captain's Log.`, 'Captain', 'info');
  }, [orbitPlanetIndex, currentPlanets, currentStar, loggedTelemetryPlanets, addMessage]);

  // Execute Interstel Emergency Distress Tow
  const handleExecuteDistressTow = useCallback(() => {
    setIsPromptingDistress(false);

    const fine = 15000;
    addBankTransaction('Interstel Emergency Subspace Towing Tariff (Form EXP-904-B)', -fine);

    // Tow Starship safely back to Starport Arth
    setGameLocation('Starport');
    setCurrentStarId(1);
    setGalaxyShipX(125);
    setGalaxyShipY(100);
    galaxyShipXRef.current = 125;
    galaxyShipYRef.current = 100;
    setSystemShipX(-88);
    setSystemShipY(118);
    setOrbitPlanetIndex(null);
    setCurrentSurfaceState(null);
    setActiveDirectionVector({dx:0,dy:0});
    setVehicleFuel(100);
    setVehicleDestroyed(false);
    setVehicleX(0);
    setVehicleY(0.6);
    setRoverWaypoint(null);
    setIsRoverMoving(false);
    setFluxDisorientationTimer(0);
    fluxCooldownTimerRef.current = 0;
    fluxExitDestRef.current = null;
    isJumpingFluxRef.current = false;
    lastTraversedFluxIdRef.current = null;
    const concourseCanvas = getConcourseCanvas(assets);
    const spawnPos = imageFracToCanvas(
      CONCOURSE_SPAWN_U,
      CONCOURSE_SPAWN_V,
      viewDimensions.width,
      viewDimensions.height,
      concourseCanvas
    );
    setAstronautX(spawnPos.x);
    setAstronautY(spawnPos.y);
    setActiveRoomIndex(null);
    setShipVx(0);
    setShipVy(0);
    setEnduriumFuel((f) => Math.max(10.0, f)); // Give emergency starter fuel
    setHullIntegrity((h) => Math.max(100, h)); // Stabilize hull
    setProjectiles([]);
    setActiveEncounterGroup(null);
    setActiveConsoleMenu('Bridge');

    gameAudio.playFineBuzzer();
    triggerBanter('distress_tow');
    addMessage(`INTERSTEL TOW: Vessel hauled to Starport Arth pressurized gantry (-${fine.toLocaleString()} M.U.). Rover recovered and refuelled; its cargo remains intact.`, 'Captain', 'alert');
    handleSaveToSlot(activeSlot);
  }, [addBankTransaction, assets, viewDimensions, triggerBanter, addMessage, handleSaveToSlot, activeSlot]);

  const handleRequestDistressTow = useCallback(() => {
    if (gameLocation === 'Encounter') {
      gameAudio.playErrorBuzz();
      addMessage('The aliens are jamming our signal.', 'Communications', 'alert');
      return;
    }
    if (['In Orbit', 'On Planet', 'Terrain Vehicle'].includes(gameLocation) && currentStar.x === 192 && currentStar.y === 152 && orbitPlanetIndex === 0 && !hasCrystalOrb) {
      gameAudio.playErrorBuzz();
      addMessage('Thermal interference is jamming distress communications!', 'Communications', 'alert');
      return;
    }
    if (isArthDestroyed) {
      gameAudio.playErrorBuzz();
      addMessage('DISTRESS FAILED: Distress signal received, but Starport Arth was destroyed in the solar flare!', 'Captain', 'alert');
      return;
    }
    setIsPromptingDistress(true);
    gameAudio.playErrorBuzz();
  }, [gameLocation, currentStar.x, currentStar.y, orbitPlanetIndex, hasCrystalOrb, isArthDestroyed, addMessage]);


  // Communications Action Handlers
  const diplomaticStrengthDifference=useCallback((group:AlienGroup)=>{
    const captain=getCrewAboard().find(c=>c.id===assignedPosts.Captain&&c.alive&&c.vitality>0);
    return playerDiplomaticStrength([armorClass,shieldClass,missileClass,laserClass],captain?.skills)-alienDiplomaticStrength(group.ships);
  },[crewRoster,assignedPosts,armorClass,shieldClass,missileClass,laserClass]);

  const updateEncounterMood=useCallback((group:AlienGroup,delta=0)=>{
    const hasHuman=getCrewAboard().some(c=>c.alive&&c.vitality>0&&c.race==='Human');
    const before=group.currentMood;
    if(moodDecides(group,hasHuman,elowanHostile))group.currentMood=clampMood(before+delta);
    if(group.race==='Mechans'&&moodDecides(group,hasHuman,elowanHostile)
      &&!mechan9Unlocked&&group.currentMood<10) {
      group.currentMood=1;group.baseMood=1;
      setMechan9Unlocked(true);
      setSpeciesBaseMoods(prev=>({...prev,Mechans:1}));
      if(group.id==='canonical-77'&&group.conversation&&group.conversation.returnToOrbit===undefined)group.conversation.returnToOrbit=3;
      addMessage('Mechan 9 recognition confirmed. Access to Heaven granted.','Communications','info');
    }
    const disposition=encounterDisposition(group,diplomaticStrengthDifference(group),hasHuman,mechan9Unlocked||group.race==='Mechans'&&group.currentMood===1,elowanHostile);
    group.posture=disposition.fleet;
    isCombatActiveRef.current=fleetCanFire(group,disposition.fighting);
    if(group.conversation&&before!==group.currentMood)group.conversation.phraseLimit=phraseLimit(disposition.talk);
    const quiet=disposition.fighting||moodDecides(group,hasHuman,elowanHostile)&&group.currentMood>=(ALIEN_PERSONALITIES[group.race]?.fight??101);
    if(quiet) {
      endingTransmissionGroupRef.current=null;
      stopAlienVoice();
      if(group.conversation)closeConversation(group.conversation);
    }
    setAlienCommsState(prev=>({...prev,alienMood:group.currentMood,alienPosture:disposition.talk,
      ...(quiet?{active:false,connected:false,pendingAlienQuestion:null,pendingPriorityBusiness:null}:{})}));
    return disposition;
  },[crewRoster,assignedPosts,elowanHostile,mechan9Unlocked,diplomaticStrengthDifference,addMessage]);

  const emitOriginalComm=useCallback((group:AlienGroup,subject:number,forcedIds?:number[])=>{
    const requestedSubject=subject;
    const disposition=updateEncounterMood(group);
    if(!forcedIds&&group.conversation)subject=responseSubject(group.conversation,subject);
    let ids=forcedIds??originalCommCandidates(group,subject,disposition.talk).map(line=>line.id);
    if(!forcedIds&&!group.isHomeworldFleet&&subject>=7&&subject<=11&&ids.length) {
      const id=nextLoreLine(commTopicProgressRef.current,resolveRaceId(group.race),subject,originalCommCandidates(group,subject,disposition.talk));
      ids=id?[id]:[];
    }
    if(!forcedIds&&!ids.length&&subject!==5){ids=originalCommCandidates(group,5,disposition.talk).map(line=>line.id);if(ids.length)subject=5;}
    if(!forcedIds&&!ids.length)ids=originalCommCandidates(group,subject,'Neutral').map(line=>line.id);
    if(!group.isHomeworldFleet&&!ids.length)return null;
    const captain=crewRoster.find(c=>c.id===assignedPosts.Captain)?.name||'Commander';
    const options={race:group.race,subject,posture:disposition.talk,mood:group.currentMood,isHomeworld:!!group.isHomeworldFleet,
      isSurrendered:!!group.hasSurrendered,usageTracker:commLineUsageRef.current,captainName:captain,shipName:shipName||'Arth Vessel',preferredLineIds:ids};
    const selected=group.isHomeworldFleet?selectFleetCommLine(group,options):selectCommLine(options);
    const strength=calculateTranslationStrength(commsSkill,getCrewAboard(),commsOfficer?.race||null,hasWhiningOrb,group.race);
    const {translatedText,garbledFraction}=translateAlienDialogue(selected.formattedText,strength,shipName||'Arth Vessel',captain);
    const action=selected.line.action??-127;
    if(action!==127&&action!==-127)updateEncounterMood(group,action);
    const closes=action===127||requestedSubject===15;
    if(closes)endingTransmissionGroupRef.current=group.id;
    if(closes&&group.conversation)closeConversation(group.conversation);
    const isQuestion=subject===14&&selected.line.subject===14&&!closes;
    if(isQuestion){setQuestionCountdownTimer(20);setQuestionTotalTime(20);setIsQuestionReminderActive(false);}
    setCommsTypewriterElapsed(0);
    setAlienCommsState(prev=>({...prev,lastAlienSpeakerText:translatedText,lastGarbledAlienText:selected.formattedText,
      ...(closes?{active:false,connected:false,pendingAlienQuestion:null}:{}),
      ...(isQuestion?{pendingAlienQuestion:{id:selected.id,text:translatedText,remindersLeft:2,timer:20}}:{}),
      dialogueHistory:[...prev.dialogueHistory,{race:group.race,subject:isQuestion?'Question':subject===6?'Waiting for response':'Transmission',text:translatedText,rawText:selected.formattedText,timestamp:formattedStardate}]}));
    setCommLineUsage({...commLineUsageRef.current});
    safeStorageSet('starflight_comm_line_usage',JSON.stringify(commLineUsageRef.current));
    playAlienVoice(selected.id,garbledFraction,selected.line.race,selected.formattedText);
    addMessage(translatedText,undefined,'info',group.race);
    return selected;
  },[updateEncounterMood,crewRoster,assignedPosts.Captain,shipName,commsSkill,commsOfficer?.race,hasWhiningOrb,formattedStardate,addMessage]);

  const loseAlienPatience=useCallback(()=>{
    const group=activeEncounterGroup,question=alienCommsState.pendingAlienQuestion;
    if(!group||!question||resolvedAlienQuestionRef.current===question)return;
    resolvedAlienQuestionRef.current=question;
    updateEncounterMood(group,impatientMoodDelta(group.race,group.currentMood,diplomaticStrengthDifference(group)));
    if(group.conversation)group.conversation.nextSpeech=10+20*Math.random();
    setQuestionCountdownTimer(0);setIsQuestionReminderActive(false);
    setAlienCommsState(prev=>({...prev,pendingAlienQuestion:null}));
    addMessage('The aliens have lost patience waiting for an answer.','Communications','alert');
  },[activeEncounterGroup,alienCommsState.pendingAlienQuestion,updateEncounterMood,diplomaticStrengthDifference,addMessage]);

  const resolveDroneOrbit = useCallback((granted:boolean) => {
    const group=activeEncounterGroup;
    if(group?.race!=='Veloxi Drone')return;
    if(!granted) {
      group.droneChallenge??=newDroneChallenge();denyDroneOrbit(group.droneChallenge);
    }
    const text=granted?'Permission to orbit granted.':'Permission to orbit denied.';
    group.currentMood=granted?0:100;group.posture=granted?'Friendly':'Hostile';
    isCombatActiveRef.current=!granted;
    if(granted)setGrantedDroneClearanceUntilHyperspace(true);
    setQuestionCountdownTimer(0);
    setAlienCommsState(prev=>({...prev,pendingAlienQuestion:null,active:granted,connected:granted,alienMood:group.currentMood,alienPosture:group.posture,lastAlienSpeakerText:text,lastGarbledAlienText:text,dialogueHistory:[...prev.dialogueHistory,{race:group.race,subject:granted?'Orbit granted':'Orbit denied',text,rawText:text,timestamp:formattedStardate}]}));
    stopAlienVoice();addMessage(text,undefined,granted?'info':'alert',group.race);
  },[activeEncounterGroup,addMessage,formattedStardate]);

  const openAlienConnection=useCallback((captainText='')=>{
    if(!activeEncounterGroup)return;
    endingTransmissionGroupRef.current=null;
    const race=activeEncounterGroup.race;
    const disposition=updateEncounterMood(activeEncounterGroup);
    if(disposition.fighting)return;
    const mood=activeEncounterGroup.currentMood,posture=disposition.talk;
    const captain=crewRoster.find(c=>c.id===assignedPosts.Captain)?.name||'Commander';
    const clock=activeEncounterGroup.conversation??=newConversationClock(posture,shieldsRaised,weaponsArmed);
    clock.pendingHail=false;clock.disconnected=false;clock.alienPhrases=0;clock.phraseLimit=phraseLimit(posture);
    setAlienCommsState(prev=>({...prev,active:true,connected:true,alienHailsCount:0,lastCaptainText:captainText||prev.lastCaptainText}));
    const isGroveling=posture==='Obsequious';
    // Priority business for Thrynn, Elowan, Veloxi when not groveling
    if (!isGroveling && !activeEncounterGroup.isHomeworldFleet) {
      // 1. Thrynn Priority
      if (race === 'Thrynn') {
        // A. If player has Elowan crew member
        const hasElowanCrew = getCrewAboard().some((c) => c.alive && c.race === 'Elowan');
        if (hasElowanCrew) {
          setAlienCommsState((prev) => ({
            ...prev,
            active: false,
            connected: false,
            alienMood: 100,
            alienPosture: 'Hostile',
            lastAlienSpeakerText: '*Hiss!* We do not converse with friends of the leafy vermin! Prepare to be destroyed!',
          }));
          activeEncounterGroup.posture = 'Hostile';
          activeEncounterGroup.currentMood = 100;
          isCombatActiveRef.current = true;
          gameAudio.playAlarmKlaxon();
          addMessage('Thrynn: Refused link with friends of the leafy vermin. Battle initiated!', 'Communications', 'alert');
          return;
        }

        // B. Else if player has any artifact in cargo hold other than the Black Box and Black Egg
        const eligibleArtifact = artifactsInHold.find(
          (a) => a.id !== 'black-egg' && a.id !== 'art-black-egg' && !a.realName.toLowerCase().includes('black egg') && !(a as any).name?.toLowerCase().includes('black egg') &&
                 a.id !== 'black-box' && a.id !== 'art-black-box' && !a.realName.toLowerCase().includes('black box') && !(a as any).name?.toLowerCase().includes('black box')
        );
        if (eligibleArtifact) {
          const totalHold = 50 + 50 * cargoPods;
          const totalUsedCargo = shipCargoVolume(enduriumFuelFrameRef.current, cargoHoldFrameRef.current, artifactsInHoldRef.current, specimensInHoldRef.current);

          // Canonical artifact value
          const canonicalArt = CANONICAL_ARTIFACTS.find((ca) => ca.id === eligibleArtifact.id || ca.realName.toLowerCase() === eligibleArtifact.realName.toLowerCase());
          const value = canonicalArt?.basePrice ?? eligibleArtifact.basePrice ?? (eligibleArtifact as any).value ?? 30000;

          const offerM3 = thrynnFuelOffer(value,totalHold,totalUsedCargo,eligibleArtifact.volume);
          if (offerM3 <= 0) {
            addMessage('Thrynn trade unavailable: free cargo space before requesting a fuel exchange.', 'Communications', 'alert');
            return;
          }

          if (devUsed || isDevPanelOpen || (typeof window !== 'undefined' && ((window as any).devMode === true || (window as any).isDevMode === true))) {
            addMessage(`DEV: Thrynn price: value ${value}, offer ${offerM3} m³ including space released by the relic`, 'Communications', 'info');
          }

          const rawName = eligibleArtifact.realName || eligibleArtifact.codeName;
          let formattedItemPhrase = '';
          if (rawName.startsWith('The ')) {
            formattedItemPhrase = `the ${rawName.slice(4)}`;
          } else if (rawName.startsWith('the ')) {
            formattedItemPhrase = rawName;
          } else {
            const firstLetter = rawName.trim().charAt(0).toLowerCase();
            const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
            formattedItemPhrase = `${isVowel ? 'an' : 'a'} ${rawName}`;
          }

          const promptText = `*Sssss* We detect ${formattedItemPhrase} in your cargo hold! The Thrynn Syndicate offers ${offerM3.toFixed(1)} cubic meters Endurium in exchange. Do you accept?`;

          setAlienCommsState((prev) => ({
            ...prev,
            active: true,
            connected: true,
            lastAlienSpeakerText: promptText,
            pendingPriorityBusiness: {
              type: 'thrynn_artifact',
              promptText,
              artifactId: eligibleArtifact.id,
              artifactName: rawName,
              fuelOffer: offerM3,
              timer: 60,
            },
          }));
          setQuestionCountdownTimer(60);
          setQuestionTotalTime(60);
          gameAudio.playConfirmSelect();
          addMessage(`Thrynn: Offered ${offerM3.toFixed(1)} cubic meters Endurium for ${rawName}.`, 'Communications', 'info');
          addMessage(promptText, undefined, 'info', 'Thrynn');
          playAlienVoice(300, 0, 7, promptText);
          return;
        }
      }

      // 2. Elowan Priority
      if (race === 'Elowan') {
        const hasThrynnCrew = getCrewAboard().some((c) => c.alive && c.race === 'Thrynn');
        if (hasThrynnCrew) {
          setAlienCommsState((prev) => ({
            ...prev,
            active: false,
            connected: false,
            alienMood: 100,
            alienPosture: 'Hostile',
            lastAlienSpeakerText: '*Rustling thorns* We refuse to speak with associates of the cold-blooded reptilians! Begone!',
          }));
          activeEncounterGroup.posture = 'Hostile';
          activeEncounterGroup.currentMood = 100;
          isCombatActiveRef.current = true;
          gameAudio.playAlarmKlaxon();
          addMessage('Elowan: Refused comms link with associates of the cold-blooded reptilians. Hostilities engaged!', 'Communications', 'alert');
          return;
        }
      }

      // 3. Veloxi Priority
      if (race === 'Veloxi') {
        // A. Crystal Orb in cargo
        const hasOrb = artifactsInHold.some(isCrystalOrb);
        if (hasOrb) {
          const promptText = '*Chitin clicks* Intruder! You possess the sacred Crystal Orb! Surrender it to the Hive immediately!';
          setAlienCommsState((prev) => ({
            ...prev,
            active: true,
            connected: true,
            lastAlienSpeakerText: promptText,
            pendingPriorityBusiness: {
              type: 'veloxi_crystal_orb',
              promptText,
              artifactName: 'Crystal Orb',
              timer: 60,
            },
          }));
          setQuestionCountdownTimer(60);
          setQuestionTotalTime(60);
          gameAudio.playAlarmKlaxon();
          addMessage('Veloxi: Demanded immediate surrender of the Crystal Orb!', 'Communications', 'alert');
          addMessage(promptText, undefined, 'info', 'Veloxi');
          playAlienVoice(398, 0, 8, promptText);
          return;
        }

        // B. Ellipsoid in cargo
        const hasEllip = artifactsInHold.some((a) => a.id === 'art-ellipsoid' || a.realName.toLowerCase().includes('ellipsoid'));
        if (hasEllip) {
          const promptText = '*Chitin clicks* You hold the Sacred Ellipsoid! Surrender the sacred artifact to the Hive at once!';
          setAlienCommsState((prev) => ({
            ...prev,
            active: true,
            connected: true,
            lastAlienSpeakerText: promptText,
            pendingPriorityBusiness: {
              type: 'veloxi_ellipsoid',
              promptText,
              artifactName: 'The Ellipsoid',
              timer: 60,
            },
          }));
          setQuestionCountdownTimer(60);
          setQuestionTotalTime(60);
          gameAudio.playAlarmKlaxon();
          addMessage('Veloxi: Demanded surrender of the Sacred Ellipsoid!', 'Communications', 'alert');
          addMessage(promptText, undefined, 'info', 'Veloxi');
          playAlienVoice(398, 0, 8, promptText);
          return;
        }

        // C. Tribute if Neutral or Hostile and Endurium >= 4.0 m³
        if ((posture === 'Neutral' || posture === 'Hostile' || mood >= 25) && enduriumFuel >= 4.0) {
          const tributeAmount = (posture === 'Hostile' || mood >= 50) ? 9.0 : 3.0;
          const promptText = `*Chitin clicks* You navigate Veloxi territory! Pay a sovereign tribute of ${tributeAmount.toFixed(1)} m³ Endurium immediately!`;
          setAlienCommsState((prev) => ({
            ...prev,
            active: true,
            connected: true,
            lastAlienSpeakerText: promptText,
            pendingPriorityBusiness: {
              type: 'veloxi_tribute',
              promptText,
              tributeAmount,
              timer: 60,
            },
          }));
          setQuestionCountdownTimer(60);
          setQuestionTotalTime(60);
          gameAudio.playConfirmSelect();
          addMessage(`Veloxi: Demanded tribute of ${tributeAmount.toFixed(1)} m³ Endurium.`, 'Communications', 'alert');
          addMessage(promptText, undefined, 'info', 'Veloxi');
          playAlienVoice(399, 0, 8, promptText);
          return;
        }
      }
    }


    gameAudio.playConfirmSelect();
    addMessage('Subspace link established.','Communications','info');
    handleSaveToSlot(activeSlot);
  }, [checkMalfunction, gameLocation, activeEncounterGroup, alienCommsState.alienMood, alienCommsState.alienPosture, alienCommsState.alienHailsCount,alienCommsState.playerPosture, crewRoster, artifactsInHold, cargoPods, enduriumFuel, cargoHold, addMessage, handleSaveToSlot, activeSlot, assignedPosts.Captain, shipName, triggerBanter, devUsed, isDevPanelOpen, commsSkill, commsOfficer?.race, hasWhiningOrb, formattedStardate, speciesBaseMoods,resolveDroneOrbit,updateEncounterMood,shieldsRaised,weaponsArmed]);

  const handleInitiateComms = useCallback(() => {
    if (checkMalfunction('Comms')) return;
    if (gameLocation !== 'Encounter' || !activeEncounterGroup) {
      addMessage('Communications: No foreign transmissions detected on subspace band.', 'Communications', 'info');
      gameAudio.playCrispClick();
      return;
    }

    const race = activeEncounterGroup.race;
    let mood = alienCommsState.alienMood;
    let posture = alienCommsState.alienPosture;
    handleSaveToSlot(activeSlot);

    if(race==='Veloxi Drone') {
      if(activeEncounterGroup.attackedByPlayer || activeEncounterGroup.droneChallenge?.status==='denied') {
        resolveDroneOrbit(false);return;
      }
      activeEncounterGroup.droneChallenge??=newDroneChallenge();
      isCombatActiveRef.current=false;
      setCommsTypewriterElapsed(0);
      setAlienCommsState(prev=>({...prev,active:true,connected:true,alienMood:25,alienPosture:'Neutral',lastAlienSpeakerText:'Respond',lastGarbledAlienText:'Respond'}));
      playAlienVoice(503,0,10,'Respond');
      addMessage('Respond',undefined,'info',race);
      return;
    }

    // The Uhlek have no lines and never talk. When an encounter is with Uhlek, comms never answers.
    if (race === 'Uhlek') {
      gameAudio.playErrorBuzz();
      addMessage('No response: communications unanswered.', 'Communications', 'alert');
      return;
    }

    const refusesHail=fleetCanFire(activeEncounterGroup,isCombatActiveRef.current)
      || !activeEncounterGroup.isHomeworldFleet&&!!ALIEN_PERSONALITIES[race]&&mood>=ALIEN_PERSONALITIES[race]!.fight;
    if (!activeEncounterGroup.hasSurrendered && refusesHail) {
      gameAudio.playAlarmKlaxon();
      addMessage('Transmission refused: communications jammed by hostile fire.', 'Communications', 'alert');
      return;
    }

    if(alienCommsState.connected)return;
    if(!activeEncounterGroup.conversation) {
      activeEncounterGroup.conversation=newConversationClock(posture,shieldsRaised,weaponsArmed);
      activeEncounterGroup.conversation.hails=Math.min(3,alienCommsState.alienHailsCount);
    }
    const clock=restoreConversationClock(activeEncounterGroup.conversation,alienCommsState.connected,alienCommsState.alienHailsCount);
    if(clock.pendingHail)return;
    const replying=(clock.hails??0)>0;
    const captain=crewRoster.find(c=>c.id===assignedPosts.Captain)?.name||'Commander';
    const playerLine=selectPlayerCommLine(replying?2:1,alienCommsState.playerPosture,commLineUsageRef.current,captain,shipName||'Arth Vessel');
    addMessage(playerLine.formattedText,'Captain','info');playAlienVoice(playerLine.id,0,16,playerLine.formattedText);
    setCommLineUsage({...commLineUsageRef.current});safeStorageSet('starflight_comm_line_usage',JSON.stringify(commLineUsageRef.current));
    const effect=hailPostureEffect(clock,race,alienCommsState.playerPosture);
    const disposition=updateEncounterMood(activeEncounterGroup,effect);
    afterPlayerPhrase(clock);setCommsTypewriterElapsed(0);
    setAlienCommsState(prev=>({...prev,lastCaptainText:playerLine.formattedText,alienHailsCount:clock.hails??0}));
    if(disposition.fighting)return;
    if(replying)openAlienConnection(playerLine.formattedText);
    else addMessage('Hail transmitted; awaiting an alien response.','Communications','info');
    triggerBanter('alien_hail');handleSaveToSlot(activeSlot);
  }, [checkMalfunction, gameLocation, activeEncounterGroup, alienCommsState.alienMood, alienCommsState.alienPosture, alienCommsState.alienHailsCount,alienCommsState.playerPosture, crewRoster, artifactsInHold, cargoPods, enduriumFuel, cargoHold, addMessage, handleSaveToSlot, activeSlot, assignedPosts.Captain, shipName, triggerBanter, devUsed, isDevPanelOpen, commsSkill, commsOfficer?.race, hasWhiningOrb, formattedStardate, speciesBaseMoods,resolveDroneOrbit,updateEncounterMood,shieldsRaised,weaponsArmed,openAlienConnection,alienCommsState.connected]);

  const handleAnswerPriorityBusiness = useCallback((answer: boolean) => {
    if (!activeEncounterGroup || !alienCommsState.pendingPriorityBusiness) return;
    const business = alienCommsState.pendingPriorityBusiness;
    if (resolvedPriorityBusinessRef.current === business) return;
    const liveFuel = enduriumFuelFrameRef.current;
    const occupied = shipCargoVolume(liveFuel,cargoHoldFrameRef.current,artifactsInHoldRef.current,specimensInHoldRef.current);
    const exchange = answer && business.type === 'thrynn_artifact'
      ? exchangeArtifactForFuel(artifactsInHoldRef.current,business.artifactId,liveFuel,business.fuelOffer ?? 0,50+50*cargoPods,occupied) : null;
    const tributeFuel = business.type === 'veloxi_tribute' ? payFuelTribute(liveFuel,business.tributeAmount ?? 3) : null;
    if (answer && (business.type === 'thrynn_artifact' && !exchange || business.type === 'veloxi_tribute' && tributeFuel === null)) {
      const text = business.type === 'veloxi_tribute'
        ? `Insufficient Endurium: the Hive requires ${(business.tributeAmount ?? 3).toFixed(1)} m³; ${liveFuel.toFixed(2)} m³ is aboard. Decline the demand or obtain the full amount.`
        : 'Fuel exchange unavailable: the quoted relic and sufficient cargo space are required. Decline this offer and hail again.';
      setAlienCommsState(prev=>({...prev,lastAlienSpeakerText:text}));
      gameAudio.playErrorBuzz();
      return;
    }
    resolvedPriorityBusinessRef.current = business;
    setQuestionCountdownTimer(0);
    const captain = crewRoster.find((c) => c.id === assignedPosts.Captain)?.name || 'Commander';

    // Player speaks Yes (Subject 3) or No (Subject 4)
    const playerSubj = answer ? 3 : 4;
    const playerLine = selectPlayerCommLine(
      playerSubj,
      'Neutral',
      commLineUsageRef.current,
      captain,
      shipName || 'Arth Vessel',
    );
    setCommLineUsage({ ...commLineUsageRef.current });
    safeStorageSet('starflight_comm_line_usage', JSON.stringify(commLineUsageRef.current));
    addMessage(playerLine.formattedText, 'Captain', 'info');
    playAlienVoice(playerLine.id, 0, 16, playerLine.formattedText);
    setAlienCommsState(prev=>({...prev,lastCaptainText:playerLine.formattedText}));
    setCommsTypewriterElapsed(0);

    if (business.type === 'thrynn_artifact') {
      if (answer) {
        // Accept trade
        const rewardFuel = business.fuelOffer!;
        setArtifactsInHold(exchange!.artifacts);
        setEnduriumFuel(exchange!.fuel);
        addBankTransaction(`Thrynn Artifact Trade (${business.artifactName})`, 0);
        gameAudio.playCoinPickup();
        addMessage(`Traded ${business.artifactName} to Thrynn for ${rewardFuel.toFixed(1)} cubic meters Endurium.`, 'Communications', 'info');
        const replyText = `*Sssss* A splendid transaction! ${rewardFuel.toFixed(1)} cubic meters Endurium transferred to your fuel reserves.`;
        setAlienCommsState((prev) => ({
          ...prev,
          pendingPriorityBusiness: null,
          lastAlienSpeakerText: replyText,
        }));
        addMessage(replyText, undefined, 'info', 'Thrynn');
        playAlienVoice(303, 0, 7, replyText);
      } else {
        // Decline trade: continues to normal conversation
        gameAudio.playCrispClick();
        addMessage(`Declined Thrynn offer for ${business.artifactName}.`, 'Communications', 'info');
        const replyText = '*Hiss* A pity. You miss out on substantial profit. Let us speak of other matters.';
        setAlienCommsState((prev) => ({
          ...prev,
          pendingPriorityBusiness: null,
          lastAlienSpeakerText: replyText,
        }));
        addMessage(replyText, undefined, 'info', 'Thrynn');
        playAlienVoice(306, 0, 7, replyText);
      }
    } else if (business.type === 'veloxi_crystal_orb') {
      if (answer) {
        returnArtifactToSite(planetSurfacesRef.current,'crystal-orb',destroyedPlanetKeys);
        setArtifactsInHold((prev) => prev.filter((a) => !isCrystalOrb(a)));
        activeEncounterGroup.currentMood = Math.max(0,alienCommsState.alienMood-40);
        activeEncounterGroup.posture = 'Friendly';
        isCombatActiveRef.current = false;
        gameAudio.playConfirmSelect();
        addMessage('Handed over Crystal Orb to Veloxi Hive.', 'Communications', 'info');
        const replyText = '*Chitin clicks* The Sacred Crystal Orb is returned to the Hive. The Hive regards your vessel favorably.';
        setAlienCommsState((prev) => ({
          ...prev,
          pendingPriorityBusiness: null,
          alienMood: Math.max(0, prev.alienMood - 40),
          alienPosture: 'Friendly',
          lastAlienSpeakerText: replyText,
        }));
        addMessage(replyText, undefined, 'info', 'Veloxi');
        playAlienVoice(493, 0, 8, replyText);
      } else {
        // Refused: terminate link, attack, Veloxi hostility +100
        setHasRefusedCrystalOrb(true);
        setSpeciesBaseMoods((prev) => ({ ...prev, Veloxi: 100, 'Veloxi Drone': 100 }));
        activeEncounterGroup.posture = 'Hostile';
        activeEncounterGroup.currentMood = 100;
        activeEncounterGroup.baseMood = 100;
        isCombatActiveRef.current = true;
        gameAudio.playAlarmKlaxon();
        addMessage('Veloxi: Refused demand for Crystal Orb. Hive battle initiated with maximum hostility!', 'Communications', 'alert');
        const replyText = '*Loud furious clicking* You dare withhold the sacred relic from the Hive! Extermination authorized!';
        setAlienCommsState((prev) => ({
          ...prev,
          active: false,
          connected: false,
          alienMood: 100,
          alienPosture: 'Hostile',
          pendingPriorityBusiness: null,
          lastAlienSpeakerText: replyText,
        }));
        addMessage(replyText, undefined, 'info', 'Veloxi');
        playAlienVoice(497, 0, 8, replyText);
      }
    } else if (business.type === 'veloxi_ellipsoid') {
      if (answer) {
        setArtifactsInHold((prev) => prev.filter((a) => a.id !== 'ellipsoid' && a.id !== 'art-ellipsoid' && !a.realName.toLowerCase().includes('ellipsoid') && !(a as any).name?.toLowerCase().includes('ellipsoid')));
        setHasGivenEllipsoid(true);
        activeEncounterGroup.currentMood = 0;
        activeEncounterGroup.posture = 'Friendly';
        isCombatActiveRef.current = false;
        gameAudio.playPowerupChime();
        addMessage('Surrendered the Sacred Ellipsoid to Veloxi Hive.', 'Communications', 'info');
        const replyText = '*Reverent clicks* The Sacred Ellipsoid is restored! You are forever honored friends of the Hive.';
        setAlienCommsState((prev) => ({
          ...prev,
          pendingPriorityBusiness: null,
          alienMood: 0,
          alienPosture: 'Friendly',
          lastAlienSpeakerText: replyText,
        }));
        addMessage(replyText, undefined, 'info', 'Veloxi');
        playAlienVoice(493, 0, 8, replyText);
      } else {
        activeEncounterGroup.posture = 'Hostile';
        activeEncounterGroup.currentMood = 100;
        activeEncounterGroup.baseMood = 100;
        isCombatActiveRef.current = true;
        gameAudio.playAlarmKlaxon();
        addMessage('Veloxi: Refused surrender of Ellipsoid. Hive hostilities initiated!', 'Communications', 'alert');
        const replyText = '*Furious chitin rattles* Defiers of the Hive! Prepare for annihilation!';
        setAlienCommsState((prev) => ({
          ...prev,
          active: false,
          connected: false,
          alienMood: 100,
          alienPosture: 'Hostile',
          pendingPriorityBusiness: null,
          lastAlienSpeakerText: replyText,
        }));
        addMessage(replyText, undefined, 'info', 'Veloxi');
        playAlienVoice(497, 0, 8, replyText);
      }
    } else if (business.type === 'veloxi_tribute') {
      if (answer) {
        const trib = business.tributeAmount ?? 3.0;
        setEnduriumFuel(tributeFuel!);
        activeEncounterGroup.currentMood = Math.max(0,alienCommsState.alienMood-30);
        activeEncounterGroup.posture = 'Neutral';
        isCombatActiveRef.current = false;
        gameAudio.playConfirmSelect();
        addMessage(`Paid ${trib.toFixed(1)} m³ Endurium tribute to Veloxi Hive.`, 'Communications', 'info');
        const replyText = '*Chitin clicks* Tribute acknowledged. Clearance granted through Veloxi airspace.';
        setAlienCommsState((prev) => ({
          ...prev,
          pendingPriorityBusiness: null,
          alienMood: Math.max(0, prev.alienMood - 30),
          alienPosture: 'Neutral',
          lastAlienSpeakerText: replyText,
        }));
        addMessage(replyText, undefined, 'info', 'Veloxi');
        playAlienVoice(494, 0, 8, replyText);
      } else {
        activeEncounterGroup.posture = 'Hostile';
        activeEncounterGroup.currentMood = 100;
        activeEncounterGroup.baseMood = 100;
        isCombatActiveRef.current = true;
        gameAudio.playAlarmKlaxon();
        addMessage('Veloxi: Refused fuel tribute. Hive battle initiated with maximum hostility (+100)!', 'Communications', 'alert');
        const replyText = '*Snapping mandibles* Unlawful intruder refused tribute! Firing solution locked!';
        setAlienCommsState((prev) => ({
          ...prev,
          active: false,
          connected: false,
          alienMood: 100,
          alienPosture: 'Hostile',
          pendingPriorityBusiness: null,
          lastAlienSpeakerText: replyText,
        }));
        addMessage(replyText, undefined, 'info', 'Veloxi');
        playAlienVoice(498, 0, 8, replyText);
      }
    }
    handleSaveToSlot(activeSlot);
  }, [activeEncounterGroup, alienCommsState.pendingPriorityBusiness, alienCommsState.alienMood, addMessage, crewRoster, assignedPosts.Captain, shipName, cargoPods, handleSaveToSlot, activeSlot]);

  const handleSelectPosture = useCallback((posture:DiplomaticPosture)=>{
    const group=activeEncounterGroup;
    if(!group||['Minstrels','Nomad','Mysterions','Derelict'].includes(group.race)||!alienCommsState.connected||alienCommsState.pendingAlienQuestion||alienCommsState.pendingPriorityBusiness)return;
    if(checkMalfunction('Comms'))return;
    const captain=crewRoster.find(c=>c.id===assignedPosts.Captain)?.name||'Commander';
    const line=selectPlayerCommLine(13,posture,commLineUsageRef.current,captain,shipName||'Arth Vessel');
    addMessage(line.formattedText,'Captain','info');playAlienVoice(line.id,0,16,line.formattedText);
    const clock=group.conversation??=newConversationClock(alienCommsState.alienPosture,shieldsRaised,weaponsArmed);
    clock.pendingSubject=undefined;
    updateEncounterMood(group,playerPhraseEffect(clock,group.race,posture));
    afterPlayerPhrase(clock);
    setAlienCommsState(prev=>({...prev,playerPosture:posture,lastCaptainText:line.formattedText}));

    gameAudio.playCrispClick();
    handleSaveToSlot(activeSlot);
  },[activeEncounterGroup,alienCommsState,checkMalfunction,crewRoster,assignedPosts.Captain,shipName,shieldsRaised,weaponsArmed,updateEncounterMood,emitOriginalComm,addMessage,handleSaveToSlot,activeSlot]);

  const handleAskSubject = useCallback((subject:DialogueSubject)=>{
    const group=activeEncounterGroup;
    if(!group||['Minstrels','Nomad','Mysterions','Derelict'].includes(group.race)||!alienCommsState.connected||alienCommsState.pendingAlienQuestion||alienCommsState.pendingPriorityBusiness)return;
    if(checkMalfunction('Comms'))return;
    const captain=crewRoster.find(c=>c.id===assignedPosts.Captain)?.name||'Commander';
    const line=selectPlayerCommLine(14,alienCommsState.playerPosture,commLineUsageRef.current,captain,shipName||'Arth Vessel',String(subject));
    addMessage(line.formattedText,'Captain','info');playAlienVoice(line.id,0,16,line.formattedText);
    const clock=group.conversation??=newConversationClock(alienCommsState.alienPosture,shieldsRaised,weaponsArmed);
    updateEncounterMood(group,playerPhraseEffect(clock,group.race,alienCommsState.playerPosture,true));
    if(!clock.disconnected)clock.pendingSubject=resolveSubjectId(subject);
    afterPlayerPhrase(clock);
    setAlienCommsState(prev=>({...prev,activeSubject:subject,lastCaptainText:line.formattedText,conversationCount:prev.conversationCount+1}));

    triggerBanter('alien_question');gameAudio.playHoverMicroTone();handleSaveToSlot(activeSlot);
  },[activeEncounterGroup,alienCommsState,checkMalfunction,crewRoster,assignedPosts.Captain,shipName,shieldsRaised,weaponsArmed,updateEncounterMood,emitOriginalComm,triggerBanter,addMessage,handleSaveToSlot,activeSlot]);

  const handleAnswerQuestion = useCallback(
    (answer: boolean) => {
      const question = alienCommsState.pendingAlienQuestion;
      if (!activeEncounterGroup || !question || resolvedAlienQuestionRef.current === question) return;
      if(question.id!==undefined&&question.remindersLeft===0){loseAlienPatience();return;}
      resolvedAlienQuestionRef.current = question;
      setQuestionCountdownTimer(0);

      const captain = crewRoster.find((c) => c.id === assignedPosts.Captain)?.name || 'Commander';

      // Pick Captain's line from Race 16: Yes (Subject 3, line 535) or No (Subject 4, line 534)
      const playerSubj = answer ? 3 : 4;
      const playerLine = selectPlayerCommLine(
        playerSubj,
        'Neutral',
        commLineUsageRef.current,
        captain,
        shipName || 'Arth Vessel',
      );
      setCommLineUsage({ ...commLineUsageRef.current });
      safeStorageSet('starflight_comm_line_usage', JSON.stringify(commLineUsageRef.current));

      // Display captain's line first
      addMessage(playerLine.formattedText, 'Captain', 'info');
      playAlienVoice(playerLine.id, 0, 16, playerLine.formattedText);

      if(activeEncounterGroup.race==='Veloxi Drone' && activeEncounterGroup.droneChallenge) {
        const test=activeEncounterGroup.droneChallenge;
        const accepted=answerDroneNumber(test,answer,!!activeEncounterGroup.attackedByPlayer);
        setAlienCommsState(prev=>({...prev,pendingAlienQuestion:null,lastCaptainText:playerLine.formattedText}));
        if(!accepted)resolveDroneOrbit(false);
        else if(test.status==='granted')resolveDroneOrbit(true);
        return;
      }

      updateEncounterMood(activeEncounterGroup,question.id===undefined?0:alienQuestionDelta(question.id,answer));
      if(activeEncounterGroup.conversation)afterPlayerPhrase(activeEncounterGroup.conversation);
      setAlienCommsState(prev=>({...prev,pendingAlienQuestion:null,lastCaptainText:playerLine.formattedText}));
      setIsQuestionReminderActive(false);gameAudio.playConfirmSelect();
      handleSaveToSlot(activeSlot);
    },[activeEncounterGroup,alienCommsState.pendingAlienQuestion,crewRoster,assignedPosts.Captain,shipName,addMessage,updateEncounterMood,loseAlienPatience,handleSaveToSlot,activeSlot,resolveDroneOrbit]);


  const handleStartManeuver = useCallback(() => {
    if (gameLocation === 'Encounter' && hasCrystalPearl && hullIntegrity <= 125) {
      handleTriggerPearlEmergencyEscape();
      return;
    }
    if (checkMalfunction('Engines')) return;
    setActiveConsoleMenu('Maneuver');
    gameAudio.playConfirmSelect();
  }, [gameLocation, hasCrystalPearl, hullIntegrity, handleTriggerPearlEmergencyEscape, checkMalfunction]);

  // Scan Sensors with Stellar Stability & Ruins Overlay
  const handleScanSensors = useCallback(() => {
    if (checkMalfunction('Sensors')) return;

    const sensorHp = subsystems.Sensors;
    let readingText = '';

    if (gameLocation === 'Encounter') {
      alienScanRef.current=captureAlienScan(activeEncounterGroup,encounterTargetIndex,encounterShipPos,isCombatActiveRef.current,inNebula,{scienceSkill,sensorHealth:sensorHp});
      readingText=alienSensorText(alienScanRef.current);
    } else if (gameLocation === 'Star System') {
      const isFlared = currentStar.flareDay !== undefined && currentAbsDay >= currentStar.flareDay && !flaresStopped;
      const daysToFlare = currentStar.flareDay !== undefined && !flaresStopped ? currentStar.flareDay - currentAbsDay : 999;

      let stabilityDesc = 'Stable';
      if (isFlared) {
        stabilityDesc = 'NOVA FLARED (All biological planetary biospheres sterilized)';
      } else if (daysToFlare < 20) {
        const accuracyMargin = scienceSkill >= 60 ? 0 : Math.round((100 - scienceSkill) / 10);
        const estDays = Math.max(1, daysToFlare + accuracyMargin);
        stabilityDesc = `Unstable (${estDays} days until solar flare)`;
      } else if (daysToFlare <= 60) {
        stabilityDesc = 'Slightly Unstable';
      }

      readingText = `STELLAR SCAN: ${currentStar.name} [Spectral: ${currentStar.spectral}] • Core Stability: ${stabilityDesc} • Science Officer Confidence: ${scienceSkill >= 75 ? 'High (Precise)' : scienceSkill >= 40 ? 'Moderate' : 'Low'}`;
      triggerBanter('star_flare_scan', stabilityDesc);
    } else if (gameLocation === 'In Orbit' && orbitPlanetIndex !== null) {
      const p=currentPlanets[orbitPlanetIndex];
      updatePlanetaryScan(beginPlanetScan(scanPlanetKey(currentStar.id,p.slot)));
      setScienceReading('Sensor sweep in progress. Analysis becomes available when the reading is complete.');
      gameAudio.playRadarPing();
      return;
    } else if (gameLocation === 'Hyperspace') {
      readingText = `HYPERSPACE SENSORS: Sector [${Math.round(galaxyShipX)}, ${Math.round(galaxyShipY)}] • ${hasRingDevice ? 'RING DEVICE: Continuum flux disturbances monitored • ' : ''}${inNebula ? 'ION NEBULA DAMPING DETECTED' : 'Hyperspace medium clear'}.`;
    } else {
      readingText = `SENSORS: Diagnostic telemetry nominal (${sensorHp}% efficiency).`;
    }

    setScienceReading(readingText);
    gameAudio.playRadarPing();
    gameAudio.playDataChime();
    addMessage(readingText, 'Science Officer', 'info');
  }, [checkMalfunction, subsystems.Sensors, gameLocation, currentStar, currentAbsDay, flaresStopped, scienceSkill, orbitPlanetIndex, currentPlanets, hasRedCylinder, hasCrystalCone, galaxyShipX, galaxyShipY, hasRingDevice, inNebula, triggerBanter, addMessage, activeEncounterGroup, encounterTargetIndex, encounterShipPos, setScienceReading]);

  const handlePlanetAnalysis = useCallback(()=>{
    const scan=planetaryScanRef.current;
    if(!scanReady(scan)) {setScienceReading('Analysis requires a completed sensor reading. Select Sensors first.');return;}
    if(scan?.analysis) {setScienceReading('This reading has already been analyzed. Select Sensors for a fresh reading.');return;}
    const next=analyzePlanetScan(scan,scienceOfficer??undefined);
    if(!next) {setScienceReading('Assign a living, conscious Science Officer before analyzing a reading.');return;}
    if(orbitPlanetIndex===null)return;
    const p=currentPlanets[orbitPlanetIndex];
    const surveyKey=planetKey(currentStar.x,currentStar.y,p.orderIndex);
    planetSurfacesRef.current[surveyKey]=surveyPlanet(planetSurfacesRef.current[surveyKey],currentStar.x,currentStar.y,p,landingLat,landingLong,scienceOfficer!.skills.science,hasRedCylinder,hasCrystalCone);
    updatePlanetaryScan(next);
    const text=`PLANETARY ANALYSIS: Object Planet • Orbit ${p.slot} • ${planetAnalysisFields(p).map((field,i)=>field.label+': '+(next.analysis!.known[i]?field.value:'Not certain')).join(' • ')}`;
    setScienceReading(text);gameAudio.playDataChime();addMessage(text,'Science Officer','info');
  },[scienceOfficer,orbitPlanetIndex,currentPlanets,updatePlanetaryScan,addMessage,currentStar,landingLat,landingLong,hasRedCylinder,hasCrystalCone]);

  const handleCycleTarget = useCallback(() => {
    if (!activeEncounterGroup) return;
    const ships = activeEncounterGroup.ships;
    if (ships.length === 0) return;

    const livingIndices = ships
      .map((s, idx) => ({ s, idx }))
      .filter((e) => !e.s.isWreck && e.s.hullIntegrity > 0)
      .map((e) => e.idx);

    if (livingIndices.length === 0) return;

    const nextIdx = livingIndices.find((idx) => idx > encounterTargetIndex) ?? livingIndices[0];
    setEncounterTargetIndex(nextIdx);
    const targetShip = ships[nextIdx];
    const dist = Math.hypot(targetShip.x - encounterShipPos.x, targetShip.y - encounterShipPos.y);
    gameAudio.playCrispClick();
    addMessage(`Target #${nextIdx + 1}: ${targetShip.vesselClass} (ACTIVE). Range: ${dist.toFixed(1)} cells.`, 'Captain', 'info');
  }, [activeEncounterGroup, encounterTargetIndex, encounterShipPos, addMessage]);

  const handleFireLaser = useCallback(() => {
    const laserCooldown=laserCooldownFrameRef.current;
    const enduriumFuel=enduriumFuelFrameRef.current;
    const encounterShipPos=encounterShipPosFrameRef.current;
    const subsystems=subsystemsFrameRef.current;
    if (gameLocation !== 'Encounter' || !activeEncounterGroup) return;
    if (!weaponsArmed) {
      gameAudio.playErrorBuzz();
      addMessage('Captain: Weapon systems are SAFE. Arm weapons before firing.', 'Captain', 'alert');
      return;
    }
    if (laserClass <= 0) {
      gameAudio.playErrorBuzz();
      addMessage('Tactical: No Laser Cannon installed aboard starship.', 'Engineer', 'alert');
      return;
    }
    if (checkMalfunction('Lasers')) return;

    if (laserCooldown > 0) {
      gameAudio.playErrorBuzz();
      addMessage('Tactical: Laser capacitors re-charging...', 'Engineer', 'info');
      return;
    }
    if (enduriumFuel < 0.1) {
      gameAudio.playErrorBuzz();
      addMessage('Tactical: Insufficient Endurium (0.10 m³ required per laser shot).', 'Engineer', 'alert');
      return;
    }

    const activeShips = activeEncounterGroup.ships.filter((s) => !s.isWreck);
    if (activeShips.length === 0) {
      gameAudio.playErrorBuzz();
      addMessage('Tactical: All targets destroyed / wrecks on grid.', 'Captain', 'info');
      return;
    }

    let target = activeEncounterGroup.ships[encounterTargetIndex];
    if (!target || target.isWreck) {
      target = activeShips[0];
    }

    // Always consume 0.1 m³ Endurium, record shot for banter context, and set cooldown
    encounterShotsFiredRef.current.laser += 1;
    lastWeaponFiredRef.current = 'laser';
    setEnduriumFuel((f) => consumeFuel(f,0.1));
    setLaserCooldown(0.4);

    const dist = Math.hypot(target.x - encounterShipPos.x, target.y - encounterShipPos.y);

    // Laser Range Check: Maximum laser reach = 10.0 cells
    if (dist > 10.0) {
      setLastShotResult('MISS');
      gameAudio.playArcadeLaser();
      isCombatActiveRef.current = markFleetAttacked(activeEncounterGroup);
      setAlienCommsState(prev=>({...prev,alienMood:100,alienPosture:activeEncounterGroup.posture}));
      triggerBanter('combat_miss');
      addMessage('Laser shot went wide!', 'Navigator', 'info');
      return;
    }

    // Gunnery Accuracy Roll (Navigator Navigation Skill Check)
    // Roll integer between 0 and (250 - navigatorNavigationSkill - 1)
    // Shot hits if roll < 50. Guaranteed 100% when skill >= 200.
    const navSkill = navigatorSkill;
    const maxRoll = 250 - navSkill - 1;
    const isHit = maxRoll < 50 ? true : Math.floor(Math.random() * (maxRoll + 1)) < 50;

    const impactX = isHit ? target.x : target.x + (Math.random() < 0.5 ? -1.5 : 1.5);
    const impactY = isHit ? target.y : target.y + (Math.random() < 0.5 ? -1.5 : 1.5);

    setProjectiles((prev) => [
      ...prev,
      {
        id: `las-${Date.now()}-${Math.random()}`,
        fromPlayer: true,
        type: 'laser',
        x: encounterShipPos.x,
        y: encounterShipPos.y,
        targetX: impactX,
        targetY: impactY,
        targetShipId: undefined,
        isMiss: !isHit,
        speed: 60,
        damage: 0,
        duration: 0.2,
        maxDuration: 0.2,
        color: '#00f0ff',
      },
    ]);

    gameAudio.playArcadeLaser();
    isCombatActiveRef.current = markFleetAttacked(activeEncounterGroup);
    setAlienCommsState(prev=>({...prev,alienMood:100,alienPosture:activeEncounterGroup.posture}));

    if (!isHit) {
      setLastShotResult('MISS');
      triggerBanter('combat_miss');
      addMessage('Laser shot went wide!', 'Navigator', 'info');
      return;
    }

    // Damage Falloff: Reduces by 10% of base damage per cell of distance (d):
    // Damage = Math.max(1, Math.round(baseDamage * (1.0 - 0.10 * d)))
    const rawBaseDmg = LASER_BASE_DAMAGE[laserClass] || 90;
    const baseDmg = Math.round(rawBaseDmg * (subsystems.Lasers / 100));
    const effectiveDmg = Math.max(1, Math.round(baseDmg * (1.0 - 0.10 * dist)));

    if (target.isLaserImmune) {
      setLastShotResult('IMMUNE (0 dmg)');
      addMessage(`Tactical: Laser beam absorbed! Target ${target.race} is completely IMMUNE to laser fire.`, 'Science Officer', 'alert');
      return;
    }

    setLastShotResult(`HIT (-${effectiveDmg} dmg)`);

    const targetInNebula = inNebula;
    let hitLocation: 'shields' | 'armor';
    if (target.shields > 0 && !targetInNebula) {
      // Entire hit goes to shields, down to 0 minimum. Nothing carries over to armor on that same hit.
      target.shields = Math.max(0, target.shields - effectiveDmg);
      hitLocation = 'shields';
    } else {
      // Only when shields are already at 0 (or down or in nebula) does a hit damage armor.
      target.hullIntegrity = Math.max(0, target.hullIntegrity - effectiveDmg);
      hitLocation = 'armor';
    }

    triggerBanter('combat_hit');
    addMessage(`Laser hit on ${target.vesselClass}: ${hitLocation} -${effectiveDmg}.`, 'Science Officer', 'info');

    if (target.hullIntegrity <= 0) {
      target.isWreck = true;
      if (!targetInNebula) {
        target.shields = 0;
      }
      target.hullIntegrity = 0;
      setTacticalExplosions(previous=>[...previous.slice(-10),{x:target.x,y:target.y,radius:4,maxRadius:38,life:0,maxLife:1.1,color:'#f97316',shockwave:true}]);
      setScreenShake(.6);
      gameAudio.playChiptuneExplosion();
      triggerBanter('combat_kill');
      addMessage(`TACTICAL KILL: Target ${target.vesselClass} destroyed! Wreck drifting with salvageable cargo.`, 'Science Officer', 'info');

      // Auto-target next living alien ship
      const livingShips = activeEncounterGroup.ships
        .map((s, idx) => ({ ship: s, idx, dist: Math.hypot(s.x - encounterShipPos.x, s.y - encounterShipPos.y) }))
        .filter((entry) => !entry.ship.isWreck && entry.ship.hullIntegrity > 0);

      if (livingShips.length > 0) {
        livingShips.sort((a, b) => a.dist - b.dist);
        setEncounterTargetIndex(livingShips[0].idx);
        addMessage(`Targeting computer automatically switched to nearest living vessel: ${livingShips[0].ship.vesselClass}.`, 'Captain', 'info');
      }
    }
  }, [gameLocation, activeEncounterGroup, weaponsArmed, laserClass, checkMalfunction, laserCooldown, enduriumFuel, encounterTargetIndex, navigatorSkill, encounterShipPos, subsystems.Lasers, inNebula, triggerBanter, addMessage]);


  const handleFireMissile = useCallback(() => {
    const missileCooldown=missileCooldownFrameRef.current;
    const enduriumFuel=enduriumFuelFrameRef.current;
    const encounterShipPos=encounterShipPosFrameRef.current;
    const subsystems=subsystemsFrameRef.current;
    const projectiles=projectilesFrameRef.current;
    if (gameLocation !== 'Encounter' || !activeEncounterGroup) return;
    if (!weaponsArmed) {
      gameAudio.playErrorBuzz();
      addMessage('Captain: Weapon systems are SAFE. Arm weapons before firing.', 'Captain', 'alert');
      return;
    }
    if (missileClass <= 0) {
      gameAudio.playErrorBuzz();
      addMessage('Tactical: No Missile Launcher installed aboard starship.', 'Engineer', 'alert');
      return;
    }
    if (checkMalfunction('Missiles')) return;

    if (missileCooldown > 0) {
      gameAudio.playErrorBuzz();
      addMessage('Tactical: Missile launch tubes reloading...', 'Engineer', 'info');
      return;
    }
    if (enduriumFuel < 0.5) {
      gameAudio.playErrorBuzz();
      addMessage('Tactical: Insufficient Endurium (0.50 m³ required per missile launch).', 'Engineer', 'alert');
      return;
    }

    const inFlightMissiles = projectiles.filter((p) => p.type === 'missile' || p.type === 'plasma').length;
    if (inFlightMissiles >= 10) {
      gameAudio.playErrorBuzz();
      addMessage('Tactical: Maximum missiles in flight limit reached (10 max).', 'Engineer', 'alert');
      return;
    }

    const activeShips = activeEncounterGroup.ships.filter((s) => !s.isWreck);
    if (activeShips.length === 0) {
      gameAudio.playErrorBuzz();
      addMessage('Tactical: All targets destroyed / wrecks on grid.', 'Captain', 'info');
      return;
    }

    let target = activeEncounterGroup.ships[encounterTargetIndex];
    if (!target || target.isWreck) {
      target = activeShips[0];
    }

    encounterShotsFiredRef.current.missile += 1;
    lastWeaponFiredRef.current = 'missile';
    setEnduriumFuel((f) => consumeFuel(f,0.5));
    setMissileCooldown(1.8);

    const navSkill = navigatorSkill;
    const maxRoll = 250 - navSkill - 1;
    const isHit = maxRoll < 50 ? true : Math.floor(Math.random() * (maxRoll + 1)) < 50;

    const rawBaseDmg = MISSILE_BASE_DAMAGE[missileClass] || 200;
    const baseDmg = Math.round(rawBaseDmg * (subsystems.Missiles / 100));

    const impactX = isHit ? target.x : target.x + (Math.random() < 0.5 ? -2.5 : 2.5);
    const impactY = isHit ? target.y : target.y + (Math.random() < 0.5 ? -2.5 : 2.5);

    setProjectiles((prev) => [
      ...prev,
      {
        id: `mis-${Date.now()}-${Math.random()}`,
        fromPlayer: true,
        type: 'missile',
        x: encounterShipPos.x,
        y: encounterShipPos.y,
        targetX: impactX,
        targetY: impactY,
        targetShipId: isHit ? target.id : undefined,
        isMiss: !isHit,
        speed: 10,
        damage: baseDmg,
        duration: 2.5,
        maxDuration: 2.5,
        color: '#ffb700',
      },
    ]);

    gameAudio.playGunshotBlast();
    isCombatActiveRef.current = markFleetAttacked(activeEncounterGroup);
    setAlienCommsState(prev=>({...prev,alienMood:100,alienPosture:activeEncounterGroup.posture}));

    addMessage(`Tactical: Class ${missileClass} warhead launched at ${target.vesselClass} (${baseDmg} dmg yield).`, 'Captain', 'info');
  }, [gameLocation, activeEncounterGroup, weaponsArmed, missileClass, checkMalfunction, missileCooldown, enduriumFuel, projectiles, encounterTargetIndex, subsystems.Missiles, encounterShipPos, addMessage]);

  const applyPlayerDamageChunk = useCallback(
    (totalDmg: number, sourceWeapon: string, sourceRace?: string) => {
      const hullIntegrity = hullIntegrityFrameRef.current;
      const playerShieldPoints = playerShieldPointsFrameRef.current;
      const playerArmorPoints = playerArmorPointsFrameRef.current;
      if (totalDmg <= 0 || hullIntegrity <= 0) return;

      const attacker = sourceRace || activeEncounterGroup?.race || 'Alien';
      const weapon = sourceWeapon || 'weapon';
      const weaponLabel = `${attacker} ${weapon}`;

      // Rod Device reduces incoming laser damage to 25% (1/4)
      let adjustedDmg = totalDmg;
      if (hasRodDevice && weapon.toLowerCase().includes('laser')) {
        adjustedDmg = Math.max(1, Math.round(totalDmg * 0.25));
        addMessage(`ROD DEVICE: Laser Dispersion Rod reduced incoming laser strike from ${totalDmg} to ${adjustedDmg} damage!`, 'Engineer', 'info');
      }

      const hit = resolveShipHit({
        shields: playerShieldPoints, armor: playerArmorPoints, hull: hullIntegrity,
        shieldClass, armorClass, shieldsRaised, inNebula,
      }, adjustedDmg);
      // Publish each pool synchronously so another projectile in this substep
      // sees the damage already taken, even before React renders the gauges.
      setPlayerShieldPoints(hit.shields);
      setPlayerArmorPoints(hit.armor);
      if (hit.shieldLoss > 0) {
        const collapsed = hit.shields === 0;
        triggerBanter(collapsed ? 'shields_collapse' : 'shields_absorb');
        addMessage(`${weaponLabel} hit: shields -${hit.shieldLoss}.${collapsed ? ' DEFLECTOR SHIELDS COLLAPSED!' : ''}`, 'Engineer', collapsed ? 'alert' : 'info');
      }
      if (hit.armorLoss > 0) {
        addMessage(`${weaponLabel} hit: armor -${hit.armorLoss}.`, 'Science Officer', 'alert');
        if (hit.armor <= 0.15 * maxArmorCapacity) {
          triggerBanter('hull_breach');
          addMessage(hit.armor === 0
            ? 'ARMOR PLATING SHATTERED! Direct subsystem and hull penetration!'
            : 'ALARM: Hull breach imminent! Armor integrity critical!', 'Engineer', 'alert');
        }
      }
      const remDmg = hit.hullDamage;

      // 3. Direct Subsystem / Hull / Crew Damage
      if (remDmg > 0) {
        addMessage(`${weaponLabel} hit: hull -${remDmg}.`, 'Science Officer', 'alert');
        const hitType = Math.random();
        if (hitType < 0.45) {
          const sysKeys: SubsystemKey[] = ['Engines', 'Sensors', 'Comms', 'Shields', 'Missiles', 'Lasers'];
          const chosenSys = sysKeys[Math.floor(Math.random() * sysKeys.length)];
          const sysDmg = Math.min(100, Math.round(remDmg * 0.25));

          setSubsystems((prev) => {
            const nextVal = Math.max(0, prev[chosenSys] - sysDmg);
            if (nextVal <= 0) {
              setInoperativeSystems((inop) => ({ ...inop, [chosenSys]: true }));
            }
            return { ...prev, [chosenSys]: nextVal };
          });

          triggerBanter('first_damage', chosenSys);
          addMessage(`CRITICAL DAMAGE: ${chosenSys} subsystem damaged (-${sysDmg}% health)!`, 'Engineer', 'alert');
        } else if (hitType < 0.70) {
          setCrewRoster((roster) => {
            const livingCrew = roster.filter((c) => c.alive);
            if (livingCrew.length > 0) {
              const targetCrew = livingCrew[Math.floor(Math.random() * livingCrew.length)];
              const durabilityMod = 10 / (10 + targetCrew.durability);
              const rawLoss = remDmg * 0.15 * durabilityMod;
              const vitLoss = Math.max(1, Math.round(rawLoss));

              targetCrew.vitality = Math.max(0, targetCrew.vitality - vitLoss);
              if (targetCrew.vitality <= 0) {
                handleCrewCasualty(targetCrew);
              } else {
                addMessage(`MEDICAL ALERT: Officer ${targetCrew.name} injured (-${vitLoss} vitality, ${targetCrew.vitality}% remain).`, 'Doctor', 'alert');
              }
            }
            return [...roster];
          });
        }

        setHullIntegrity((h) => {
          const nextHull = Math.max(0, h - remDmg);
          if (nextHull <= 0) {
            gameAudio.playChiptuneExplosion();
            gameAudio.playDefeatMotif();

            const poignantLines = [
              'Captain... structural containment has failed. It has been an honor serving with you among the stars.',
              'Hull breach total... all emergency bulkheads offline. We gave everything for the mission, Captain.',
              'Atmosphere venting... as the darkness takes us, remember the star-cities of Arth.',
            ];
            const poignantLine = poignantLines[Math.floor(Math.random() * poignantLines.length)];

            setGameOverModal({
              title: 'STARSHIP DESTROYED',
              desc: `Your vessel hull was completely obliterated by hostile fire. All telemetry lost.`,
              poignantLine,
            });
          }
          return nextHull;
        });
      }
    },
    [hullIntegrity, hasRodDevice, shieldsRaised, playerShieldPoints, inNebula, shieldClass, playerArmorPoints, armorClass, maxArmorCapacity, activeEncounterGroup, triggerBanter, addMessage, handleCrewCasualty],
  );

  // Encounter & Transitions
  const triggerEncounter = useCallback(
    (group: AlienGroup) => {
      // If Uhlek is silenced, prevent Uhlek encounters
      if (group.race === 'Uhlek' && uhlekSilenced) return;
      beginFleetVisit(group);

      const raceBaseMood = speciesBaseMoods[group.race] ?? DEFAULT_BASE_MOODS[group.race] ?? 50;
      const meetingMood=ALIEN_PERSONALITIES[group.race]?(shieldsRaised?5:0)+(weaponsArmed?10:0):0;
      const initialMood = clampMood(group.race==='Veloxi Drone'?25:elowanHostile && group.race === 'Elowan' ? 100 : hasGivenEllipsoid && group.race === 'Veloxi' ? 0 : group.race==='Mechans'&&mechan9Unlocked?1+meetingMood:raceBaseMood+meetingMood);
      group.currentMood = clampMood(initialMood);
      group.baseMood = raceBaseMood;
      const hasHuman=getCrewAboard().some(c=>c.alive&&c.vitality>0&&c.race==='Human');
      const disposition=encounterDisposition(group,diplomaticStrengthDifference(group),hasHuman,mechan9Unlocked,elowanHostile);
      const initialPosture: DiplomaticPosture=group.race==='Veloxi Drone'?'Neutral':disposition.talk;
      group.posture=group.race==='Veloxi Drone'?'Neutral':disposition.fleet;
      if(group.race!=='Veloxi Drone')group.conversation=newConversationClock(initialPosture,shieldsRaised,weaponsArmed);

      setPrevGameLocation(gameLocation);
      flightEncounterStartedRef.current=true;
      if(group.id.startsWith('canonical-')) fleetChangesRef.current[group.id]=group;
      setGameLocation('Encounter');
      setActiveEncounterGroup(group);
      encounterShotsFiredRef.current = { laser: 0, missile: 0 };
      lastWeaponFiredRef.current = null;
      const viewport=viewportRef.current;
      tacticalCameraRef.current=tacticalCameraTarget(viewport.width,viewport.height,{x:0,y:0},group.ships);
      setEncounterShipPos({ x: 0, y: 0 });
      setEncounterTargetIndex(0);
      setProjectiles([]);
      passTimerRef.current = 0;
      encounterPassIndexRef.current = 0;
      combatDurationTimerRef.current = 0;
      isCombatActiveRef.current = group.race==='Veloxi Drone'?false:fleetCanFire(group,disposition.fighting);

      const lastAlienSpeakerText=isCombatActiveRef.current&&group.race!=='Uhlek'?'TRANSMISSION REFUSED: COMMUNICATIONS JAMMED BY HOSTILE FIRE.':'';
      const lastGarbledAlienText='';
      setAlienCommsState(prev=>({
        active: false,
        connected: false,
        playerPosture: 'Neutral',
        alienPosture: initialPosture,
        alienMood: initialMood,
        conversationCount: 0,
        maxPhrases: 6,
        pendingAlienQuestion: null,
        activeTradeOffer: null,
        activeTriviaQuestion: null,
        activeAssistanceRequest: null,
        alienHailsCount: 0,
        lastAlienSpeakerText,
        lastGarbledAlienText: lastGarbledAlienText || '',
        lastCaptainText: '',
        activeSubject: null,
        dialogueHistory: prev.dialogueHistory,
      }));

      setActiveConsoleMenu('Bridge');
      setDisplayPanelMode('tactical_status');
      // Milestone check: First Alien Contact
      if (!bulletins.some((b) => b.id === MILESTONE_MEMOS.first_alien_contact.id)) {
        setBulletins((prev) => [{ ...MILESTONE_MEMOS.first_alien_contact, read: false }, ...prev]);
        addMessage('Operations: New Memo #801-C logged in Starport Notices (Milestone: First Alien Contact).', 'Communications', 'info');
      }

      setEncounterBannerTimer(3.5);
      const rawClass = group.ships[0]?.vesselClass || 'Warship';
      const cleanClass = rawClass.toLowerCase().startsWith(group.race.toLowerCase())
        ? rawClass
        : `${group.race} ${rawClass}`;
      setEncounterBannerText(`🚨 CONTACT! ${cleanClass.toUpperCase()} DETECTED`);
      gameAudio.playArcadeLaser();
      triggerBanter('alien_contact');
      addMessage(`TACTICAL ALERT: Intercepted by ${group.race} battle group! Initializing tactical grid.`, 'Science Officer', 'alert');
      if (lastAlienSpeakerText) {
        addMessage(lastAlienSpeakerText, undefined, 'info', group.race);
      }
      handleSaveToSlot(activeSlot);
    },
    [gameLocation, uhlekSilenced, elowanHostile, hasGivenEllipsoid, speciesBaseMoods, bulletins, triggerBanter, addMessage, handleSaveToSlot, activeSlot,mechan9Unlocked,shieldsRaised,weaponsArmed,diplomaticStrengthDifference,crewRoster,assignedPosts],
  );

  useEffect(()=>{
    const group=activeEncounterGroup;
    if(!group?.isHomeworldFleet || (group.homeworldWarningStage??0)<3 || group.homeworldAttackStarted) return;
    group.homeworldAttackStarted=true;
    group.currentMood=100;
    group.posture='Hostile';
    isCombatActiveRef.current=true;
    setAlienCommsState(prev=>({...prev,active:false,connected:false,alienMood:100,alienPosture:'Hostile',pendingAlienQuestion:null,pendingPriorityBusiness:null}));
    addMessage('Homeworld fleet: final warning given. Vessels are opening fire.', 'Communications', 'alert');
    handleSaveToSlot(activeSlot);
  },[activeEncounterGroup,alienCommsState.lastGarbledAlienText,addMessage,handleSaveToSlot,activeSlot]);

  const terminateEncounter = useCallback(() => {
    stopAlienVoice();
    if (!activeEncounterGroup) return;

    applyEncounterEndMoodShift(activeEncounterGroup.race, alienCommsState.alienMood);

    if (shieldClass > 0) {
      setPlayerShieldPoints(shieldClass * 500);
    }
    setProjectiles([]);
    setEncounterCooldownTimer(60.0);

    const returnLoc = prevGameLocation === 'In Orbit' ? 'Star System' : prevGameLocation;
    setGameLocation(returnLoc);
    setActiveEncounterGroup(null);
    setActiveConsoleMenu('Bridge');
    setDisplayPanelMode('system_map');

    gameAudio.playPowerupChime();
    addMessage(`Tactical grid disengaged. Shields regenerated to 100%. Returning to ${returnLoc}.`, 'Navigator', 'info');
    handleSaveToSlot(activeSlot);
  }, [activeEncounterGroup, alienCommsState.alienMood, applyEncounterEndMoodShift, shieldClass, prevGameLocation, addMessage, handleSaveToSlot, activeSlot]);

  // Space Transitions & Starport Docking
  const enterStarSystem = useCallback(
    (star: GalaxyStar) => {
      hyperspaceEnteringRef.current=true;hyperspaceDepartureStarRef.current=null;
      setCurrentStarId(star.id);
      // SYSSETUP places this system's groups afresh only on hyperspace entry.
      for(const group of alienGroupsRef.current) {
        if(group.encounterLocation==='Star System' && group.starX===star.x && group.starY===star.y) {
          group.x=(Math.random()*2-1)*220;
          group.y=(Math.random()*2-1)*220;
          fleetChangesRef.current[group.id]=group;
        }
      }
      galaxyShipXRef.current = star.x;
      galaxyShipYRef.current = star.y;
      setGalaxyShipX(star.x);
      setGalaxyShipY(star.y);
      setGameLocation('Star System');
      const entryAngle = shipHeading + Math.PI;
      setSystemShipX(Math.cos(entryAngle) * (SYSTEM_BOUNDARY_RADIUS - 15));
      setSystemShipY(Math.sin(entryAngle) * (SYSTEM_BOUNDARY_RADIUS - 15));
      setShipVx(0);
      setShipVy(0);
      setSystemZoom(8.0);
      setFluxFlashTimer(0.6); // deceleration warp flash
      setOrbitTransitionProgress(1.0);
      setActiveConsoleMenu('Bridge');
      setDisplayPanelMode('system_map');

      setVisitedStarIds((prev) => (prev.includes(star.id) ? prev : [...prev, star.id]));

      // Check if this star has already flared
      const curStarHours = getAbsoluteDay(stardateDay, stardateMonth, stardateYear) * 24 + stardateHour;
      if (star.flareDay !== undefined && (curStarHours >= star.flareDay * 24) && !flaresStopped) {
        setHullIntegrity(0);
        gameAudio.playChiptuneExplosion();
        gameAudio.playDefeatMotif();
        setGameOverModal({
          title: 'GAME OVER: INCINERATED',
          desc: `Star ${star.name} flared catastrophically! The star system was engulfed in superheated solar plasma, instantly incinerating your ship.`,
          poignantLine: 'The star ignited in blinding brilliance. Across the void, Arth registers one more lost system.',
        });
        setGameState({ status: 'GAME_OVER', score: 100, level: 1 });
        return;
      }

      gameAudio.playPowerupChime();
      if (fluxDisorientationTimerRef.current > 0) {
        addMessage('Entering star system.', 'Navigator', 'info');
      } else if (star.id === 1 || star.name.toLowerCase().includes('arth') || (star.x === 125 && star.y === 100)) {
        addMessage('Entering the Arth system.', 'Navigator', 'info');
      } else {
        addMessage(`Entering the system at ${star.x},${star.y}.`, 'Navigator', 'info');
      }
      handleSaveToSlot(activeSlot,{location:'Star System',currentStarId:star.id,galaxyShipX:star.x,galaxyShipY:star.y,systemShipX:Math.cos(entryAngle)*(SYSTEM_BOUNDARY_RADIUS-15),systemShipY:Math.sin(entryAngle)*(SYSTEM_BOUNDARY_RADIUS-15),hyperspaceDepartureStarId:null,visitedStarIds:[...new Set([...visitedStarIds,star.id])]});
    },
    [visitedStarIds,shipHeading, stardateDay, stardateMonth, stardateYear, stardateHour, flaresStopped, addMessage, handleSaveToSlot, activeSlot],
  );

  const exitToHyperspace = useCallback(() => {
    hyperspaceEnteringRef.current=false;hyperspaceDepartureStarRef.current=currentStar.id;
    setGameLocation('Hyperspace');
    galaxyShipXRef.current = currentStar.x;
    galaxyShipYRef.current = currentStar.y;
    setGalaxyShipX(currentStar.x);
    setGalaxyShipY(currentStar.y);
    setShipVx(0);
    setShipVy(0);
    setFluxFlashTimer(0.8); // Warp flash & stretch
    setGrantedDroneClearanceUntilHyperspace(false);
    setActiveConsoleMenu('Bridge');
    setDisplayPanelMode('system_map');

    gameAudio.playRetroJump();
    addMessage(`Crossed star system boundary. HYPERSPACE ENGAGED at [${currentStar.x}, ${currentStar.y}].`, 'Navigator', 'alert');
    handleSaveToSlot(activeSlot,{location:'Hyperspace',galaxyShipX:currentStar.x,galaxyShipY:currentStar.y,hyperspaceDepartureStarId:currentStar.id});
  }, [currentStar, addMessage, handleSaveToSlot, activeSlot]);

  // Unified Orbit Entry Logic
  const handleOrbitEntryLogic = useCallback(
    (planetIdx: number, starX: number, starY: number, planetName: string, gravity: number, currentHoldOverride?: ArtifactItem[]) => {
      const isDev = devUsed || isDevPanelOpen || (typeof window !== 'undefined' && ((window as any).devMode === true || (window as any).isDevMode === true));
      const isCrystalPlanet = starX === 192 && starY === 152 && planetIdx === 0;

      const currentCargoHold = currentHoldOverride || artifactsInHoldRef.current;
      const holdIds = currentCargoHold.map(getNormalizedId);
      const hasOrb = currentCargoHold.some(isCrystalOrb);
      const hasCone = currentCargoHold.some(isCrystalCone);
      const hasHeat = isCrystalPlanet && !hasOrb;

      if (isDev) {
        addMessage(`DEV: orbit entry, hold: [${holdIds.join(', ')}], orb: ${hasOrb ? 'yes' : 'no'}, heat: ${hasHeat ? 'yes' : 'no'}`, 'Science Officer', 'info');
      }

      if (isCrystalPlanet) {
        if (!hasOrb) {
          setPlayerArmorPoints(0);
          setCrystalHeatTicks(0);
          crystalHeatAccumulatorRef.current = 0;
          gameAudio.playAlarmKlaxon();
          addMessage("Captain, the ship is beginning to vibrate!", 'Captain', 'alert');
        } else {
          setCrystalHeatTicks(0);
          crystalHeatAccumulatorRef.current = 0;
          gameAudio.playOrbitSweep();
          addMessage("The Crystal Orb is glowing.", 'Science Officer', 'info');
        }

        if (hasCone) {
          addMessage("The Crystal Cone has located the control nexus at 47N x 45E.", 'Science Officer', 'info');
        }
      } else {
        gameAudio.playOrbitSweep();
        triggerBanter('orbit_enter');
        addMessage(`Orbit established around ${planetName}. Gravitational pull: ${gravity} G.`, 'Navigator', 'info');
      }
    },
    [devUsed, isDevPanelOpen, triggerBanter, addMessage]
  );

  // Orbit Entry with Crystal Planet Thermal Guard
  const enterOrbit = useCallback(
    (planetIdx: number) => {
      const p = currentPlanets[planetIdx];
      if (!p) return;

      setGameLocation('In Orbit');
      setOrbitPlanetIndex(planetIdx);
      setOrbitTransitionProgress(0.0); // start zoom-in
      setActiveConsoleMenu('Bridge');
      setDisplayPanelMode('system_map');
      setShipVx(0);
      setShipVy(0);

      handleOrbitEntryLogic(planetIdx, currentStar.x, currentStar.y, p.name, p.gravity, artifactsInHoldRef.current);
      handleSaveToSlot(activeSlot, { location: 'In Orbit', orbitPlanetIndex: planetIdx });
    },
    [currentPlanets, currentStar, handleOrbitEntryLogic, handleSaveToSlot, activeSlot],
  );


  // Break Orbit & Planetary Black Egg Detonation Trigger
  const breakOrbit = useCallback(() => {
    if (orbitPlanetIndex === null) return;
    const p = currentPlanets[orbitPlanetIndex];

    const surfaceKey=planetKey(currentStar.x,currentStar.y,p.orderIndex);
    const previousSurface=planetSurfacesRef.current[surfaceKey];
    if(previousSurface && !destroyedPlanetKeys.includes(surfaceKey)) {
      planetSurfacesRef.current[surfaceKey]=refillPlanetSurface(previousSurface,currentStar.x,currentStar.y,p,gameWon);
    }
    setSurfaceRecording(null);

    // Reset heat state when leaving orbit
    setCrystalHeatTicks(0);
    crystalHeatAccumulatorRef.current = 0;

    setGameLocation('Star System');
    setSystemShipX(p.currentX + p.renderSize + 14);
    setSystemShipY(p.currentY + p.renderSize + 14);
    setShipVx(0);
    setShipVy(0);
    setOrbitPlanetIndex(null);
    setCurrentSurfaceState(null);
    setOrbitTransitionProgress(1.0);
    setActiveConsoleMenu('Maneuver');

    gameAudio.playOrbitSweep();
    triggerBanter('break_orbit');
    addMessage(`Breaking orbit from ${p.name}. Sublight thrusters ready.`, 'Navigator', 'info');
    handleSaveToSlot(activeSlot,{location:'Star System',orbitPlanetIndex:null,currentSurfaceState:null,surfaceRecording:null,systemShipX:p.currentX+p.renderSize+14,systemShipY:p.currentY+p.renderSize+14});
  }, [orbitPlanetIndex, currentPlanets, currentStar, destroyedPlanetKeys, gameWon, triggerBanter, addMessage, handleSaveToSlot, activeSlot]);


  // Trigger Spark Burst in Hangar bay
  const triggerHangarSparks = useCallback((x = 240, y = 180) => {
    const newSparks = Array.from({ length: 24 }, () => ({
      x,
      y,
      vx: (Math.random() - 0.5) * 160,
      vy: (Math.random() - 0.8) * 140,
      life: 0,
      maxLife: 0.4 + Math.random() * 0.4,
      color: Math.random() < 0.6 ? '#00f0ff' : '#fbbf24',
    }));
    setHangarSparks((prev) => [...prev.slice(-40), ...newSparks]);
  }, []);

  // Enter Starport Door with smooth sliding mask transition over ~0.4s & room banter & steam burst
  const handleEnterDoor = useCallback((doorIndex: number) => {
    const doorConfig = STARPORT_DOORS.find((d) => d.index === doorIndex) || STARPORT_DOORS[0];
    const concourseCanvas = getConcourseCanvas(assets);
    const { drawnW, drawnH, offsetX, offsetY } = getConcourseCoverTransform(
      viewDimensions.width,
      viewDimensions.height,
      concourseCanvas
    );
    const doorCanvasX = offsetX + doorConfig.u * drawnW;
    const doorCanvasY = offsetY + doorConfig.v * drawnH;

    setEnteringDoorIndex(doorIndex);
    setDoorSlideProgress(0);
    gameAudio.playDoorBlast();

    // Spawn steam burst particle emitter from door entry
    const newSteam = Array.from({ length: 24 }, () => ({
      x: doorCanvasX + (Math.random() - 0.5) * 40,
      y: doorCanvasY - 10 - Math.random() * 20,
      vx: (Math.random() - 0.5) * 90,
      vy: -50 - Math.random() * 70,
      life: 0,
      maxLife: 0.6 + Math.random() * 0.4,
      size: 8 + Math.random() * 10,
      alpha: 0.85,
    }));
    setDoorSteamParticles((prev) => [...prev.slice(-45), ...newSteam]);

    // Transporter sparkle effect for Docking Bay & clear stale launch warnings
    if (doorConfig.id === 'docking-bay' || doorIndex === 6) {
      setDockingBayWarnings([]);
      if (clampReleaseAnimIdRef.current !== null) {
        cancelAnimationFrame(clampReleaseAnimIdRef.current);
        clampReleaseAnimIdRef.current = null;
      }
      clampReleaseProgressRef.current = 0;
      setClampReleaseProgress(0);
      setIsReleasingClamps(false);
      setTransporterBeamProgress(0.01);
      const sparkles = Array.from({ length: 24 }, () => ({
        x: doorCanvasX + (Math.random() - 0.5) * 35,
        y: doorCanvasY + (Math.random() - 0.5) * 40,
        vy: -90 - Math.random() * 60,
        life: 0,
        maxLife: 0.7,
        color: Math.random() < 0.6 ? '#00f0ff' : '#facc15',
        size: 2 + Math.random() * 2.5,
      }));
      setTransporterParticles(sparkles);
    }

    const doorEvents: BanterEventType[] = [
      'starport_ops',
      'starport_personnel',
      'starport_crew',
      'starport_bank',
      'starport_ship_config',
      'starport_trade',
      'starport_docking',
    ];
    if (doorEvents[doorIndex]) {
      triggerBanter(doorEvents[doorIndex]);
    }

    // Smooth door sliding reveal over ~0.4 seconds (400ms)
    const startTime = performance.now();
    const duration = 400; // 0.4 seconds
    let animId = 0;
    const animateDoor = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      setDoorSlideProgress(progress);
      if (progress < 1) {
        animId = requestAnimationFrame(animateDoor);
      } else {
        setActiveRoomIndex(doorIndex);
        setEnteringDoorIndex(null);
        setDoorSlideProgress(0);
        setTransporterBeamProgress(0);
      }
    };
    animId = requestAnimationFrame(animateDoor);
  }, [triggerBanter, viewDimensions, assets]);


  // Exit Room back to Concourse
  const handleExitRoom = useCallback(() => {
    if (clampReleaseAnimIdRef.current !== null) {
      cancelAnimationFrame(clampReleaseAnimIdRef.current);
      clampReleaseAnimIdRef.current = null;
    }
    clampReleaseProgressRef.current = 0;
    setClampReleaseProgress(0);
    setIsReleasingClamps(false);

    setActiveRoomIndex(null);
    const concourseCanvas = getConcourseCanvas(assets);
    const spawnPos = imageFracToCanvas(
      CONCOURSE_SPAWN_U,
      CONCOURSE_SPAWN_V,
      viewDimensions.width,
      viewDimensions.height,
      concourseCanvas
    );
    setAstronautX(spawnPos.x);
    setAstronautY(spawnPos.y);
    setAstronautVx(0);
    setAstronautVy(0);
    setClickMoveTarget(null);
    gameAudio.playCrispClick();
  }, [viewDimensions, assets]);

  // Canonical Docking Bay Launch Check & Trigger (Rule 5)
  const handleDockingBayLaunch = useCallback(() => {
    if (clampReleaseAnimIdRef.current !== null) return;

    const warnings: string[] = [];

    // 1. Unread evaluation exists
    if (evaluations.some((e) => !e.read)) {
      warnings.push('Report to Operations for evaluation.');
    }

    // 2. Any of the 6 posts is unassigned or held by a dead crew member
    if (certifiedCrewCount < CREW_POSTS.length) {
      warnings.push('Report to Crew Assignment.');
    }

    // 3. Christen ship & purchase engines
    const hasNoName = !shipName.trim();
    const hasNoEngine = engineClass <= 0;
    if (hasNoName && hasNoEngine) {
      warnings.push('Report to Ship Configuration to christen ship and purchase engines.');
    } else if (hasNoName) {
      warnings.push('Report to Ship Configuration to christen ship.');
    } else if (hasNoEngine) {
      warnings.push('Report to Ship Configuration to purchase engines.');
    }

    // 4. Fuel <= 0
    if (enduriumFuel <= 0) {
      warnings.push('Report to Trade Depot to purchase fuel.');
    }

    if (warnings.length > 0) {
      setDockingBayWarnings(warnings);
      if (clampReleaseAnimIdRef.current !== null) {
        cancelAnimationFrame(clampReleaseAnimIdRef.current);
        clampReleaseAnimIdRef.current = null;
      }
      clampReleaseProgressRef.current = 0;
      setClampReleaseProgress(0);
      setIsReleasingClamps(false);
      gameAudio.playErrorBuzz();
      warnings.forEach((w) => addMessage(w, undefined, 'alert'));
      return;
    }

    setDockingBayWarnings([]);

    // Trigger clamp release animation:
    // Phase 1 (0.3s): Jaws swing open 35 degrees away from the sphere and lamps turn amber.
    // Phase 2 (0.4s): Arms retract into their bases on the berth ring.
    // Total duration: 0.7s (700ms) smoothly across requestAnimationFrame
    setIsReleasingClamps(true);
    clampReleaseProgressRef.current = 0;
    setClampReleaseProgress(0);
    gameAudio.playHoverMicroTone();

    const startTime = performance.now();
    const duration = 700; // 0.7s total release

    const executeLaunchSequence = () => {
      setArtifactStock(stock=>limitArtifactStock(stock));
      payBankInterest(false);

      const dockDoor = STARPORT_DOORS.find((d) => d.id === 'docking-bay') || STARPORT_DOORS[6];
      const concourseCanvas = getConcourseCanvas(assets);
      const { drawnW, drawnH, offsetX, offsetY } = getConcourseCoverTransform(
        viewDimensions.width,
        viewDimensions.height,
        concourseCanvas
      );
      const dockCanvasX = offsetX + dockDoor.u * drawnW;
      const dockCanvasY = offsetY + dockDoor.v * drawnH;

      setActiveRoomIndex(null);
      setTransporterBeamProgress(0.01);
      gameAudio.playPowerupChime();

      // Spawn transporter sparkles
      const sparkles = Array.from({ length: 36 }, () => ({
        x: dockCanvasX + (Math.random() - 0.5) * 44,
        y: dockCanvasY + (Math.random() - 0.5) * 50,
        vy: -110 - Math.random() * 90,
        life: 0,
        maxLife: 0.75 + Math.random() * 0.35,
        color: Math.random() < 0.65 ? '#00f0ff' : '#facc15',
        size: 2 + Math.random() * 3,
      }));
      setTransporterParticles(sparkles);

      scheduleMissionEvent(() => {
        setTransporterBeamProgress(0);
        startCinematic('launch', BAY_LAUNCH_SECONDS);
        triggerBanter('launch');
      }, 850);
    };

    const animateClamps = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      clampReleaseProgressRef.current = progress;
      setClampReleaseProgress(progress);

      // Redraw gantry canvas every animation frame during the release
      if (dockingBayCanvasRef.current) {
        renderGantryShipCanvas(
          dockingBayCanvasRef.current,
          assets,
          engineClass,
          cargoPods,
          armorClass,
          shieldClass,
          missileClass,
          laserClass,
          progress,
          gfxQuality,
        );
      }

      if (progress < 1.0) {
        clampReleaseAnimIdRef.current = requestAnimationFrame(animateClamps);
      } else {
        clampReleaseAnimIdRef.current = null;
        setIsReleasingClamps(false);
        // Only after the 0.7s clamp release completes does the existing launch sequence begin
        executeLaunchSequence();
      }
    };

    clampReleaseAnimIdRef.current = requestAnimationFrame(animateClamps);
  }, [
    evaluations,
    certifiedCrewCount,
    assignedPosts,
    crewRoster,
    shipName,
    engineClass,
    enduriumFuel,
    triggerBanter,
    addMessage,
    viewDimensions,
    assets,
    currentAbsDay,
    lastInterestAbsDay,
    credits,
    formattedStardate,
    cargoPods,
    armorClass,
    shieldClass,
    missileClass,
    laserClass,
    gfxQuality,
    payBankInterest,
  ]);

  const startLaunchSequence = handleDockingBayLaunch;

  // Canonical Landing and Launch Fuel & Gravity Crush (Rule 7)
  const calculatedLandingFuelData = useMemo(() => {
    return landingRequirements(currentPlanets[orbitPlanetIndex ?? -1]?.gravity ?? 1.08,enduriumFuel);
  }, [orbitPlanetIndex, currentPlanets, enduriumFuel]);

  const calculatedLandingFuel = calculatedLandingFuelData.fuelBurn;

  // Complete Launch into Star System
  const completeLaunchToSpace = useCallback(() => {
    if (cinematicCompletingRef.current) return;
    cinematicCompletingRef.current = true;
    cinematicStateRef.current = 'none';
    cinematicTimerRef.current = 0;
    setCinematicState('none');
    setCinematicTimer(0);
    const home=UNIVERSE.stars.find(star=>star.id===1)!;
    const world=home.planets.find(planet=>planet.isHomeworld)??home.planets[0];
    const position=systemPlanetPosition(world,orbitAnimPhaseFrameRef.current/.4);
    const outward=Math.atan2(position.currentY,position.currentX),clearance=world.renderSize+22;
    const launchX=position.currentX+Math.cos(outward)*clearance,launchY=position.currentY+Math.sin(outward)*clearance;
    setGameLocation('Star System');
    setCurrentStarId(1);
    setGalaxyShipX(125);
    setGalaxyShipY(100);
    setSystemShipX(launchX);
    setSystemShipY(launchY);
    setSystemZoom(8.0);
    setShipVx(0);
    setShipVy(0);
    setActiveConsoleMenu('Bridge');
    setDisplayPanelMode('system_map');
    gameAudio.playPowerupChime();
    addMessage('Starport Arth: Starship cleared gantry and accelerated into orbit! Good luck, crew.', 'Captain', 'info');
    handleSaveToSlot(activeSlot,{location:'Star System',currentStarId:1,galaxyShipX:125,galaxyShipY:100,systemShipX:launchX,systemShipY:launchY,cinematicState:'none',cinematicRemaining:0});
  }, [handleSaveToSlot, activeSlot, addMessage]);

  // Complete Docking from Star System
  const completeDockingToStarport = useCallback(() => {
    if (cinematicCompletingRef.current) return;
    cinematicCompletingRef.current = true;
    cinematicStateRef.current = 'none';
    cinematicTimerRef.current = 0;
    setCinematicState('none');
    setCinematicTimer(0);
    setGameLocation('Starport');
    const concourseCanvas = getConcourseCanvas(assets);
    const spawnPos = imageFracToCanvas(
      CONCOURSE_SPAWN_U,
      CONCOURSE_SPAWN_V,
      viewDimensions.width,
      viewDimensions.height,
      concourseCanvas
    );
    setAstronautX(spawnPos.x);
    setAstronautY(spawnPos.y);
    setAstronautVx(0);
    setAstronautVy(0);
    setClickMoveTarget(null);
    setActiveRoomIndex(null);
    setActiveConsoleMenu('Bridge');
    setShipVx(0);
    setShipVy(0);
    gameAudio.playConfirmSelect();
    addMessage('Ship safely berthed inside Starport Arth pressurized bay. Welcome home!', 'Communications', 'info');
    handleSaveToSlot(activeSlot);
  }, [handleSaveToSlot, activeSlot, addMessage]);

  // Complete Descent onto Planet Surface
  const completeDescentToPlanet = useCallback(() => {
    if (cinematicCompletingRef.current) return;
    cinematicCompletingRef.current = true;
    cinematicStateRef.current = 'none';
    cinematicTimerRef.current = 0;
    setCinematicState('none');
    setCinematicTimer(0);
    setGameLocation('On Planet');
    setRoverTireTracks([]);
    setRoverDustParticles([]);
    setVehicleX(0);
    setVehicleY(0.6);
    setVehicleHeading(0);
    setVehicleFuel(100.0);
    gameAudio.playJumpLandingThud();
    triggerBanter('touchdown');
    addMessage('Touchdown confirmed. Starship securely anchored on hydraulic landing struts.', 'Navigator', 'info');
    handleSaveToSlot(activeSlot);
  }, [handleSaveToSlot, activeSlot, triggerBanter, addMessage]);


  // Complete Surface Launch to Orbit
  const completeSurfaceLaunchToOrbit = useCallback(() => {
    if (cinematicCompletingRef.current) return;
    cinematicCompletingRef.current = true;
    cinematicStateRef.current = 'none';
    cinematicTimerRef.current = 0;
    setCinematicState('none');
    setCinematicTimer(0);
    setGameLocation('In Orbit');
    const pIdx = orbitPlanetIndex !== null ? orbitPlanetIndex : 0;
    const p = currentPlanets[pIdx];
    const pName = p?.name || 'Planet';
    const pGrav = p?.gravity || 1.0;

    handleOrbitEntryLogic(pIdx, currentStar.x, currentStar.y, pName, pGrav);
    handleSaveToSlot(activeSlot);
  }, [orbitPlanetIndex, currentPlanets, currentStar, handleOrbitEntryLogic, handleSaveToSlot, activeSlot]);

  // Initiate Planetary Landing Screen
  const handleOpenLandingScreen = useCallback(() => {
    if (cinematicStateRef.current !== 'none') return;
    if (orbitPlanetIndex === null) return;
    const p = currentPlanets[orbitPlanetIndex];
    if (p.type === 'Gas Giant') {
      gameAudio.playErrorBuzz();
      addMessage('Sensors: Gas Giants have no solid surface. Landing impossible.', 'Science Officer', 'alert');
      return;
    }

    // Hand Test 16: Heat active prevents landing
    if (currentStar.x === 192 && currentStar.y === 152 && orbitPlanetIndex === 0 && !hasCrystalOrb) {
      gameAudio.playErrorBuzz();
      addMessage("Lethal thermal radiation prevents atmospheric descent!", 'Captain', 'alert');
      return;
    }

    setGameLocation('Landing');
    gameAudio.playConfirmSelect();
  }, [orbitPlanetIndex, currentPlanets, currentStar, hasCrystalOrb, addMessage]);

  // Initiate Atmospheric Descent from Landing Screen (Rule 7)
  const handleInitiateDescent = useCallback(() => {
    if (cinematicStateRef.current !== 'none') return;
    if (orbitPlanetIndex === null) return;
    const p = currentPlanets[orbitPlanetIndex];
    const fuelData = calculatedLandingFuelData;

    // Check Gravity Crush
    if (fuelData.isCrush) {
      setHullIntegrity(0);
      gameAudio.playChiptuneExplosion();
      gameAudio.playDefeatMotif();
      setGameOverModal({
        title: 'GRAVITATIONAL CRUSH COLLAPSE',
        desc: `Extreme surface gravity (${fuelData.gravity.toFixed(2)} G) crushed starship hull upon atmospheric touchdown. Structural containment failed.`,
        poignantLine: 'The crushing gravity collapsed the hull bulkheads instantly. No distress beacon survived the descent.',
      });
      return;
    }

    // Check Insufficient Landing Fuel Crash
    if (fuelData.isInsufficient) {
      setHullIntegrity(0);
      gameAudio.playChiptuneExplosion();
      gameAudio.playDefeatMotif();
      setGameOverModal({
        title: 'GRAVITATIONAL IMPACT CRASH',
        desc: `Insufficient retro-rocket fuel to counteract ${fuelData.gravity.toFixed(2)} G gravity well. Starship impacted planetary terrain at terminal velocity.`,
        poignantLine: 'The descent engines sputtered out of fuel mid-entry. The starship shattered against the barren surface.',
      });
      return;
    }

    setEnduriumFuel((f) => consumeFuel(f,fuelData.fuelBurn));

    const key = planetKey(currentStar.x,currentStar.y,p.orderIndex);
    const surface = preparePlanetSurface(currentSurfaceState ?? planetSurfacesRef.current[key],currentStar.x,currentStar.y,p,landingLat,landingLong);
    planetSurfacesRef.current[key] = surface;
    setCurrentSurfaceState(surface);

    startCinematic('descent', 10.0);
    gameAudio.playGunshotBlast();
    triggerBanter('landing_start');
    addMessage(`Initiating atmospheric entry burn for ${p.name} (-${fuelData.fuelBurn} m³ Endurium).`, 'Navigator', 'info');
  }, [orbitPlanetIndex, currentPlanets, calculatedLandingFuelData, currentSurfaceState, currentStar, landingLat, landingLong, startCinematic, triggerBanter, addMessage]);

  // Disembark into Terrain Vehicle
  const handleDisembarkRover = useCallback(() => {
    if (cinematicStateRef.current !== 'none') return;
    if (vehicleDestroyed) {
      gameAudio.playErrorBuzz();
      addMessage('Engineering: Terrain Vehicle was destroyed. Repairs required at Starport.', 'Engineer', 'alert');
      return;
    }

    // Hand Test 16: If Black Egg is in ship hold, rover automatically takes it aboard into rover inventory
    let nextArts = [...artifactsInHold];
    let nextVehHold = [...vehicleHold];
    const eggIdx = nextArts.findIndex((a) => a.id === 'black-egg' || a.id === 'black_egg' || a.id === 'art-black-egg' || a.realName?.toLowerCase().includes('black egg') || (a as any).name?.toLowerCase().includes('black egg'));
    const eggFits = eggIdx !== -1 && nextVehHold.reduce((sum, item) => sum + item.volume, 0) + (nextArts[eggIdx].volume || 5) <= 50;
    if (eggFits) {
      const eggItem = nextArts[eggIdx];
      nextArts.splice(eggIdx, 1);
      setArtifactsInHold(nextArts);

      const eggCargoItem: VehicleCargoItem = {
        id: 'black-egg',
        name: 'The Black Egg',
        type: 'artifact',
        volume: eggItem.volume || 5.0,
        value: eggItem.basePrice || 100000,
        artifactRef: CANONICAL_ARTIFACTS.find((a) => a.id === 'black-egg' || a.id === 'art-black-egg'),
        isArmed: false,
      };
      nextVehHold.push(eggCargoItem);
      setVehicleHold(nextVehHold);
      addMessage('The Black Egg was loaded into the terrain vehicle cargo hold.', 'Captain', 'info');
    } else if (eggIdx !== -1) {
      addMessage('The Black Egg remains aboard the starship. Free 5 m³ in the rover hold to load it.', 'Captain', 'alert');
    }

    setGameLocation('Terrain Vehicle');
    setIsRoverMoving(false);
    gameAudio.playConfirmSelect();
    triggerBanter('rover_deploy');
    addMessage('Terrain Vehicle deployed down cargo ramp. Rover systems online.', 'Captain', 'info');
    handleSaveToSlot(activeSlot, { location: 'Terrain Vehicle', artifactsInHold: nextArts, vehicleHold: nextVehHold });
  }, [vehicleDestroyed, artifactsInHold, vehicleHold, triggerBanter, addMessage, handleSaveToSlot, activeSlot]);

  // Board Starship from Rover
  const handleBoardStarship = useCallback(() => {
    const vehicleHold = vehicleHoldFrameRef.current;
    const cargoHold = cargoHoldFrameRef.current;
    setGameLocation('On Planet');
    setIsRoverMoving(false);
    setRoverWaypoint(null);

    let nextHold = { ...cargoHold };
    let nextArts = [...artifactsInHold];
    let nextSpecimens = [...specimensInHold];
    let nextFuel = enduriumFuelFrameRef.current;
    const used = shipCargoVolume(nextFuel, cargoHold, artifactsInHold, specimensInHold);
    const { accepted, remaining } = fitCargo(vehicleHold, 50 + cargoPods * 50 - used);

    // Transfer vehicle cargo to starship hold
    if (vehicleHold.length > 0) {
      let transferredCount = 0;
      accepted.forEach((item) => {
        if (item.type === 'mineral') {
          if (item.name === 'Endurium') nextFuel += item.volume;
          else nextHold[item.name] = +(nextHold[item.name] || 0) + item.volume;
          transferredCount++;
        } else if (item.type === 'artifact') {
          const cleanId = item.artifactRef
            ? (item.artifactRef.id.startsWith('art-') ? item.artifactRef.id.slice(4) : item.artifactRef.id)
            : (item.id || item.name.toLowerCase().replace(/\s+/g, '-'));
          const rName = item.artifactRef?.realName || item.name;
          const cName = item.artifactRef?.codeName || item.name;
          nextArts.push({
            id: cleanId,
            name: rName,
            codeName: cName,
            realName: rName,
            volume: item.volume,
            basePrice: item.value,
            value: item.value,
            appraised: false,
            description: item.artifactRef?.description || '',
          });
          transferredCount++;
        } else if (item.type === 'specimen') {
          nextSpecimens.push(item);
          transferredCount++;
        }
      });
      setCargoHold(nextHold);
      setEnduriumFuel(nextFuel);
      setArtifactsInHold(nextArts);
      setSpecimensInHold(nextSpecimens);
      setVehicleHold(remaining);

      if (transferredCount > 0) {
        addMessage(`Transferred ${transferredCount} cargo items from Terrain Vehicle to Starship hold.`, 'Captain', 'info');
      }
      if (remaining.length > 0) addMessage('Starship hold is full. Remaining cargo is secured in the rover; free space before unloading it.', 'Captain', 'alert');
    }

    gameAudio.playConfirmSelect();
    triggerBanter('rover_board');
    addMessage('Terrain Vehicle secured in starship lower hangar bay.', 'Captain', 'info');
    handleSaveToSlot(activeSlot, {
      location: 'On Planet',
      cargoHold: nextHold,
      artifactsInHold: nextArts,
      specimensInHold: nextSpecimens,
      enduriumFuel: nextFuel,
      vehicleHold: remaining,
    });
  }, [vehicleHold, cargoHold, cargoPods, artifactsInHold, specimensInHold, triggerBanter, addMessage, handleSaveToSlot, activeSlot]);


  // Launch and countdown run on simulation time, including pause/save/reload.
  const handleLaunchFromPlanet = useCallback(() => {
    if (cinematicStateRef.current !== 'none' || detonationSequenceRef.current) return;
    const fuelData = calculatedLandingFuelData;
    if (enduriumFuelFrameRef.current < fuelData.fuelBurn) {
      gameAudio.playErrorBuzz();
      addMessage(`Engineering: Insufficient Endurium for ascent thrusters (${fuelData.fuelBurn} m³ required).`, 'Engineer', 'alert');
      return;
    }

    setEnduriumFuel(f => consumeFuel(f, fuelData.fuelBurn));
    startCinematic('surface_launch', 3.0);
    gameAudio.playGunshotBlast();
    addMessage(`Igniting main sublight thrusters for orbital ascent (-${fuelData.fuelBurn} m³ Endurium).`, 'Captain', 'info');

    const armedCargo = currentSurfaceState?.droppedCargo.find(c => c.isArmed && (c.artifactRef?.id.replace(/^art-/, '') === 'black-egg' || c.name.toLowerCase().includes('black egg')));
    const planetOrder = currentPlanets[orbitPlanetIndex ?? 0]?.orderIndex ?? 0;
    const tracker = armedDetonationTracker;
    const matchingTracker = tracker?.isArmed && tracker.systemCoords[0] === currentStar.x && tracker.systemCoords[1] === currentStar.y && tracker.planetIndex === planetOrder;
    if (matchingTracker || armedCargo) {
      const target: DetonationTarget = matchingTracker ? tracker : {
        systemCoords: [currentStar.x, currentStar.y], planetIndex: planetOrder,
        ...surfaceCoordinates(landingLat,landingLong,armedCargo?.x ?? 0,armedCargo?.y ?? 0),
        isArmed: true,
      };
      setArmedDetonationTracker(null);
      setDetonationSequence({ target, elapsed: 0 });
      if (armedCargo && currentSurfaceState) currentSurfaceState.droppedCargo = currentSurfaceState.droppedCargo.filter(c => c !== armedCargo);
    }
    handleSaveToSlot(activeSlot);
  }, [calculatedLandingFuelData, armedDetonationTracker, currentSurfaceState, currentPlanets, orbitPlanetIndex, currentStar, landingLat, landingLong, startCinematic, addMessage, handleSaveToSlot, activeSlot]);

  const resolveDetonation = useCallback((target: DetonationTarget) => {
    const result = detonationResult(target);
    if (result === 'damaged') {
      addMessage('The planet is damaged but not destroyed. The control nexus remains intact.', 'Science Officer', 'alert');
    } else {
      const [x, y] = target.systemCoords;
      const key = planetKey(x, y, target.planetIndex);
      setDestroyedPlanetKeys(prev => prev.includes(key) ? prev : [...prev, key]);
      delete planetSurfacesRef.current[key];
      const orbitingTarget = currentStar.x === x && currentStar.y === y && currentPlanets[orbitPlanetIndex ?? -1]?.orderIndex === target.planetIndex;
      if (orbitingTarget && ['In Orbit', 'Landing', 'On Planet', 'Terrain Vehicle'].includes(gameLocation)) {
        setGameLocation('Star System');
        setOrbitPlanetIndex(null);
        setCurrentSurfaceState(null);
        const planet = currentPlanets[orbitPlanetIndex!];
        const angle = planet.initialAngle + planet.orbitSpeed * (.2+orbitAnimPhaseFrameRef.current/.4);
        const radius = Math.max(80, planet.orbitRadius + 30);
        setSystemShipX(Math.cos(angle) * radius);
        setSystemShipY(Math.sin(angle) * radius);
        setShipVx(0);
        setShipVy(0);
        setActiveConsoleMenu('Bridge');
      }
      addMessage('Planet obliterated.', 'Science Officer', 'alert');
      if (result === 'victory') {
        setFlaresStopped(true);
        setGameWon(true);
        addBankTransaction('Interstel has paid the bonus of 500,000 MU', 500000);
        gameAudio.playVictoryFanfare();
        triggerBanter('victory_banter');
        setVictorySequenceModal(true);
        const victory = { status: 'VICTORY' as const, score: 9999, level: 1 };
        gameStateRef.current = victory;
        setGameState(victory);
      } else if (result === 'uhlek') {
        setUhlekSilenced(true);
        addMessage('BLACK EGG DETONATION: Planet 2, system 55, 32 has been obliterated into cosmic dust! The Uhlek swarm is permanently silenced!', 'Captain', 'alert');
      } else if (result === 'elowan') {
        setElowanHostile(true);
        addMessage('BLACK EGG DETONATION: Planet 2, system 148, 63 was destroyed. The Elowan now regard humanity as mortal enemies!', 'Communications', 'alert');
      }
    }
    handleSaveToSlot(activeSlot);
  }, [currentStar, currentPlanets, orbitPlanetIndex, gameLocation, addMessage, addBankTransaction, triggerBanter, handleSaveToSlot, activeSlot]);

  // Rover Environmental Observation Look Readout
  const handleRoverLook = useCallback(() => {
    if (orbitPlanetIndex === null && currentPlanets.length === 0) return;
    const p = orbitPlanetIndex !== null ? currentPlanets[orbitPlanetIndex] : currentPlanets[0];
    if (!p) return;

    // Calculate sky appearance based on star spectral & atmosphere
    let skyDesc = 'Clear deep space void with piercing stellar pinpoints';
    if (p.atmosphereDensity === 'Very Thin') {
      skyDesc = 'Faint twilight haze along horizon with unobstructed starfield above';
    } else if (p.atmosphereDensity === 'Thin') {
      skyDesc = `Pale ${p.type === 'Molten' ? 'amber-tinted' : p.type === 'Frozen' ? 'cyan-frosted' : 'blue'} skies with faint high-altitude cirrus ribbons`;
    } else if (p.atmosphereDensity === 'Moderate') {
      skyDesc = `Vibrant ${p.type === 'Molten' ? 'copper-orange' : p.type === 'Liquid' ? 'azure' : 'ochre'} daylight with billowing convective cloud formations`;
    } else if (p.atmosphereDensity === 'Thick' || p.atmosphereDensity === 'Very Thick') {
      skyDesc = `Heavy overcast ceiling illuminated by diffused solar scattering (${p.weather} weather active)`;
    }

    // Canonical original names only, no contradictory degree values
    const tempDesc = p.temperatureRange || p.temperature;
    const gravDesc = `${p.gravity.toFixed(2)} G (${p.gravity > 1.3 ? 'Heavy High-G' : p.gravity < 0.7 ? 'Light Micro-G' : 'Nominal Terrestrial'})`;
    const atmDesc = `${p.atmosphereDensity} (${p.gases.join(', ') || 'Trace gases'})`;
    // Only compound name, no percentage figures
    const hydroDesc = p.hydrosphereCompound && p.hydrosphereCompound !== 'None' ? p.hydrosphereCompound : 'None';

    // Topology at rover coordinates (unified 1:1 scale, no arbitrary 10x)
    const {lat:clampedLat,lon:wrappedLong} = surfaceCoordinates(landingLat,landingLong,vehicleX,vehicleY);
    const elev = getSurfaceElevation(wrappedLong, clampedLat, currentStar.x * 100 + currentStar.y + (p.slot || 1), p.hydrospherePercent, p.type);
    const topoDesc = `${elev} terrain (${elev === 'Mountains' ? 'rugged crags and jagged elevation relief' : elev === 'Highland' ? 'rolling plateau with exposed mineral strata' : elev === 'Lowland' ? 'smooth sedimentary alluvial basin' : 'submerged liquid shoreline'})`;

    // Proximity points of interest using exact Euclidean distance in kilometers
    const pois: string[] = [];
    if (currentSurfaceState) {
      const distShip = Math.hypot(vehicleX, vehicleY);
      pois.push(`Starship Base Camp: ${distShip.toFixed(2)} km away (${distShip <= 1.5 ? 'within boarding ramp' : 'beacon locked'})`);

      const nearM = currentSurfaceState.minerals.filter((m) => !m.taken && m.volume > 0 && Math.hypot(m.x - vehicleX, m.y - vehicleY) <= 12);
      if (nearM.length > 0) {
        pois.push(`Minerals: ${nearM.slice(0, 3).map((m) => `${m.name} (${m.volume.toFixed(1)} m³ at ${Math.hypot(m.x - vehicleX, m.y - vehicleY).toFixed(2)} km)`).join(', ')}`);
      }

      const nearR = currentSurfaceState.ruins.filter((r) => Math.hypot(r.x - vehicleX, r.y - vehicleY) <= 15);
      if (nearR.length > 0) {
        pois.push(`Archaeology: ${nearR.map((r) => `${r.name} at ${Math.hypot(r.x - vehicleX, r.y - vehicleY).toFixed(2)} km (${r.explored ? 'Explored' : 'Uncharted'})`).join(', ')}`);
      }

      const nearL = currentSurfaceState.lifeforms.filter((l) => !l.captured && Math.hypot(l.x - vehicleX, l.y - vehicleY) <= 10);
      if (nearL.length > 0) {
        pois.push(`Fauna: ${nearL.slice(0, 3).map((l) => `${l.speciesName} (${l.size}, ${Math.hypot(l.x - vehicleX, l.y - vehicleY).toFixed(2)} km, ${l.stunned ? 'Stunned' : l.dead ? 'Dead' : l.temperament})`).join(', ')}`);
      }
    }

    setRoverLookData({
      sky: skyDesc,
      temp: tempDesc,
      gravity: gravDesc,
      atmosphere: atmDesc,
      hydrosphere: hydroDesc,
      topology: topoDesc,
      pointsOfInterest: pois,
    });

    gameAudio.playDataChime();
    addMessage(`[Look Sensor Readout]: Sky: ${skyDesc} • Gravity: ${gravDesc} • Temp: ${tempDesc} • Hydrosphere: ${hydroDesc} • Topology: ${topoDesc}`, 'Science Officer', 'info');
  }, [orbitPlanetIndex, currentPlanets, landingLat, landingLong, vehicleX, vehicleY, currentStar, currentSurfaceState, addMessage]);

  // Surface Sonar Pulse Scan
  const handleSurfaceScan = useCallback(() => {
    if (checkMalfunction('Sensors')) return;
    setSurfaceSonarPulse({
      active: true,
      radius: 0,
      maxRadius: 18.0,
      x: vehicleX,
      y: vehicleY,
    });
    setSurfaceScanFadeTimer(5.5); // Pulse expansion (~1.5s) + 4.0s gentle fadeout
    gameAudio.playHoverMicroTone();

    if (currentSurfaceState) {
      const nearbyMin = currentSurfaceState.minerals.filter((m) => !m.taken && m.volume > 0 && Math.hypot(m.x - vehicleX, m.y - vehicleY) <= 15).length;
      const nearbyLife = currentSurfaceState.lifeforms.filter((l) => !l.captured && Math.hypot(l.x - vehicleX, l.y - vehicleY) <= 15).length;
      const nearbyRuin = currentSurfaceState.ruins.filter((r) => Math.hypot(r.x - vehicleX, r.y - vehicleY) <= 15).length;
      addMessage(`Sonar Scan: Detected ${nearbyMin} mineral deposits, ${nearbyLife} lifeforms, ${nearbyRuin} ruins within 15 km.`, 'Science Officer', 'info');
    }
  }, [checkMalfunction, vehicleX, vehicleY, currentSurfaceState, addMessage]);

  const handleRecordNearbyLifeform=useCallback((targetId?:string)=>{
    if(!currentSurfaceState || orbitPlanetIndex===null || gameLocation!=='Terrain Vehicle' || vehicleDestroyed) return;
    if(surfaceRecordingFrameRef.current) return;
    const nearby=currentSurfaceState.lifeforms.filter(lf=>!lf.captured && Math.hypot(lf.x-vehicleXFrameRef.current,lf.y-vehicleYFrameRef.current)<=RECORDING_RANGE);
    const target=targetId?nearby.find(lf=>lf.id===targetId):nearby.filter(lf=>!lf.recorded).sort((a,b)=>Math.hypot(a.x-vehicleXFrameRef.current,a.y-vehicleYFrameRef.current)-Math.hypot(b.x-vehicleXFrameRef.current,b.y-vehicleYFrameRef.current))[0];
    if(!target || target.recorded) {
      addMessage('Science: Approach an unrecorded lifeform within 2.5 km. Living, stunned and dead specimens can be recorded.','Science Officer','info');
      return;
    }
    if(vehicleFuelFrameRef.current+1e-9<RECORDING_ENERGY) {
      addMessage('Science: Not enough rover energy to record this lifeform.','Science Officer','alert');
      return;
    }
    setMiningSession(null);setSurfaceWeaponBeam(null);
    setVehicleFuel(fuel=>consumeFuel(fuel,RECORDING_ENERGY));
    setRoverWaypoint(null);
    setSurfaceRecording({lifeformId:target.id,planetKey:planetKey(currentStar.x,currentStar.y,currentPlanets[orbitPlanetIndex].orderIndex),remaining:RECORDING_SECONDS,interruptedFor:0});
    addMessage(`Science: Recording ${target.speciesName}. Tracking assist follows the specimen within 2.5 km for three seconds. Manual steering overrides tracking.`,'Science Officer','info');
    gameAudio.playPowerupChime();
    handleSaveToSlot(activeSlot);
  },[currentSurfaceState,orbitPlanetIndex,gameLocation,vehicleDestroyed,currentStar,currentPlanets,addMessage,handleSaveToSlot,activeSlot]);

  const stopMining=useCallback((reason='Mining stopped.')=>{
    const session=miningSessionRef.current;
    setMiningSession(null);setSurfaceWeaponBeam(null);if(session)setLastMiningExtracted(session.extracted);setMiningMessage(session?`${reason} Extracted ${session.extracted.toFixed(1)} m³.`:reason);
    if(session){addMessage(`${reason} Extracted ${session.extracted.toFixed(1)} m³.`,'Engineer','info');handleSaveToSlot(activeSlot);}
  },[activeSlot,addMessage,handleSaveToSlot]);
  const returnToShip=useCallback(()=>{
    if(!returnToShipAvailable(vehicleXFrameRef.current,vehicleYFrameRef.current,vehicleFuelFrameRef.current,vehicleDestroyed))return;
    stopMining();setSurfaceRecording(null);setRoverWaypoint({x:0,y:.6});setMiningMessage('Returning to the ship boarding apron. Manual steering cancels auto-drive.');
    gameAudio.playConfirmSelect();
  },[stopMining,vehicleDestroyed]);
  const startMining=useCallback(()=>{
    setMiningOpen(true);
    if(miningSessionRef.current){stopMining();return;}
    const x=vehicleXFrameRef.current,y=vehicleYFrameRef.current;
    const deposits=currentSurfaceState?.minerals.filter(m=>!m.taken&&m.volume>0).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))??[];
    const target=deposits.find(m=>m.id===miningTargetId)??deposits[0];
    const used=vehicleHoldFrameRef.current.reduce((sum,item)=>sum+item.volume,0);
    const refusal=!target?'No uncollected deposits in this survey region.':Math.hypot(target.x-x,target.y-y)>MINING_RANGE?'Approach the selected deposit to within 6 km.':used>=49.95?'Rover hold is full. Return to the starship to offload.':vehicleFuelFrameRef.current<=0?'The rover needs energy before mining.':null;
    if(refusal){setMiningMessage(refusal);gameAudio.playErrorBuzz();return;}
    setMiningTargetId(target!.id);setVehicleWeapon('Laser');setRoverWaypoint(null);setIsRoverMoving(false);
    setMiningSession({depositId:target!.id,extracted:0,credit:0,checkpointIn:.5});setLastMiningExtracted(0);setMiningMessage('');
    addMessage(`Mining ${target!.name}. Press G or Stop mining to stop; movement also stops the laser.`,'Engineer','info');
  },[currentSurfaceState,miningTargetId,stopMining,addMessage,triggerBanter]);
  useEffect(()=>{
    if(gameLocation!=='Terrain Vehicle'){
      setMiningSession(null);setMiningOpen(false);setMiningTargetId(null);setMiningMessage('');setSurfaceWeaponBeam(null);
    }
  },[gameLocation]);

  // Surface Weapon Fire (Mining Laser vs. Stunner Target Discrimination)
  const handleFireSurfaceWeapon = useCallback(() => {
    const vehicleHold = vehicleHoldFrameRef.current;
    if (!currentSurfaceState) return;

    if (vehicleWeapon === 'Laser') {
      startMining();
    } else {
      // Stunner / Rover Laser: Targets lifeforms only.
      const maxStunRange = 6.0; // km
      const bestTarget = stunnerTarget(currentSurfaceState.lifeforms,vehicleX,vehicleY,maxStunRange);

      const endX = bestTarget ? bestTarget.x : vehicleX + Math.cos(vehicleHeading) * 5;
      const endY = bestTarget ? bestTarget.y : vehicleY + Math.sin(vehicleHeading) * 5;

      setSurfaceWeaponBeam({
        active: true,
        type: 'stunner',
        startX: vehicleX,
        startY: vehicleY,
        endX,
        endY,
        timer: 0.3,
      });
      gameAudio.playArcadeLaser();

      if (bestTarget) {
        bestTarget.stunned = true;
        addMessage(`Stunner beam incapacitated ${bestTarget.speciesName}! Specimen stunned and ready for specimen capture.`, 'Captain', 'info');
      } else {
        addMessage('No lifeforms within stunner range.', 'Captain', 'info');
      }
    }
  }, [currentSurfaceState, vehicleWeapon, vehicleX, vehicleY, vehicleHeading, vehicleHold, triggerBanter, addMessage,startMining]);

  // Collect Nearest Entity (Minerals, Artifacts/Ruins, Stunned Lifeforms, Cargo)
  const handlePickUpNearby = useCallback(() => {
    const vehicleHold = vehicleHoldFrameRef.current;
    if (!currentSurfaceState) return;

    const currentHoldVol = vehicleHold.reduce((sum, item) => sum + item.volume, 0);
    const maxPickupRange = 2.5; // km

    type Candidate =
      | { kind: 'mineral'; item: MineralDeposit; dist: number }
      | { kind: 'ruin'; item: SurfaceRuin; dist: number }
      | { kind: 'lifeform'; item: LifeformSpecimen; dist: number }
      | { kind: 'cargo'; item: DroppedCargoItem; index: number; dist: number };

    const candidates: Candidate[] = [];
    const surveyedRuins: SurfaceRuin[] = [];

    // Mineral deposits within range
    for (const m of currentSurfaceState.minerals) {
      if (m.taken || m.volume <= 0) continue;
      const dist = Math.hypot(m.x - vehicleX, m.y - vehicleY);
      if (dist <= maxPickupRange) {
        candidates.push({ kind: 'mineral', item: m, dist });
      }
    }

    // Ruins / artifacts within range
    for (const r of currentSurfaceState.ruins) {
      const dist = Math.hypot(r.x - vehicleX, r.y - vehicleY);
      if (r.explored && (!r.artifactId || (r.artifactRecovered ?? true))) {
        if (dist <= maxPickupRange) surveyedRuins.push(r);
        continue;
      }
      if (dist <= maxPickupRange) {
        candidates.push({ kind: 'ruin', item: r, dist });
      }
    }

    // Stunned / incapacitated lifeforms within range
    for (const lf of currentSurfaceState.lifeforms) {
      if (lf.captured) continue;
      if (lf.stunned || lf.dead) {
        const dist = Math.hypot(lf.x - vehicleX, lf.y - vehicleY);
        if (dist <= maxPickupRange) {
          candidates.push({ kind: 'lifeform', item: lf, dist });
        }
      }
    }

    // Dropped cargo containers within range
    for (let i = 0; i < currentSurfaceState.droppedCargo.length; i++) {
      const c = currentSurfaceState.droppedCargo[i];
      const dist = Math.hypot(c.x - vehicleX, c.y - vehicleY);
      if (dist <= maxPickupRange) {
        candidates.push({ kind: 'cargo', item: c, index: i, dist });
      }
    }

    if (candidates.length === 0) {
      if (surveyedRuins.length) {
        surveyedRuins.sort((a,b) => Math.hypot(a.x-vehicleX,a.y-vehicleY)-Math.hypot(b.x-vehicleX,b.y-vehicleY));
        setSurfaceRuinModal(surveyedRuins[0]);
        gameAudio.playConfirmSelect();
        return;
      }
      gameAudio.playHoverMicroTone();
      addMessage(`No collectibles within tractor beam range (${maxPickupRange} km).`, 'Captain', 'info');
      return;
    }

    // Sort by Euclidean distance to pick up the closest candidate
    candidates.sort((a, b) => a.dist - b.dist);
    const best = candidates[0];

    if (best.kind === 'mineral') {
      const m = best.item;
      if (currentHoldVol + m.volume > 50) {
        gameAudio.playErrorBuzz();
        addMessage('Terrain Vehicle hold full (50 m³ max). Return to starship to offload.', 'Captain', 'alert');
        return;
      }

      m.taken = true;
      setVehicleHold((prev) => [
        ...prev,
        {
          id: `v-min-${Date.now()}-${Math.random()}`,
          name: m.name,
          type: 'mineral',
          volume: m.volume,
          value: (MINERAL_CATALOG.find((min) => min.name === m.name)?.price || 500) * m.volume,
        },
      ]);

      setTractorBeamFx({ active: true, x: m.x, y: m.y, timer: 0.4, color: '#00f0ff' });
      gameAudio.playCoinPickup();
      triggerBanter('mining_pickup');
      addMessage(`Tractor beam collected ${m.volume.toFixed(1)} m³ ${m.name} into rover hold.`, 'Captain', 'info');
      return;
    }

    if (best.kind === 'lifeform') {
      const lf = best.item;
      if(lf.dead) {
        handleRecordNearbyLifeform(lf.id);
        return;
      }
      if (currentHoldVol + lf.volume > 50) {
        gameAudio.playErrorBuzz();
        addMessage('Terrain Vehicle hold full (50 m³ max).', 'Captain', 'alert');
        return;
      }

      const bounty = lf.dead ? Math.round(lf.bountyValue * 0.5) : lf.bountyValue;
      lf.captured = true;
      setVehicleHold((prev) => [
        ...prev,
        {
          id: `v-spec-${Date.now()}-${Math.random()}`,
          name: `${lf.speciesName} (${lf.size})`,
          type: 'specimen',
          volume: lf.volume,
          value: bounty,
          speciesName: lf.speciesName,
        },
      ]);

      setTractorBeamFx({ active: true, x: lf.x, y: lf.y, timer: 0.4, color: '#34d399' });
      gameAudio.playPowerupChime();
      triggerBanter('specimen_capture');
      addMessage(`Specimen cage captured ${lf.speciesName} (${lf.volume.toFixed(1)} m³, ${bounty.toLocaleString()} M.U. bounty).`, 'Science Officer', 'info');
      handleSaveToSlot(activeSlot);
      return;
    }

    if (best.kind === 'ruin') {
      const r = best.item;
      const artData = CANONICAL_ARTIFACTS.find((a) => a.id === r.artifactId || a.id === r.artifactId?.replace(/^art-/, '') || a.id === `art-${r.artifactId}`);
      const recovered = recoverRuinArtifact(r, artData, 50-currentHoldVol);
      if (artData && recovered) {
        const cleanId = artData.id.startsWith('art-') ? artData.id.slice(4) : artData.id;
        setVehicleHold(prev => [...prev, {
          id:cleanId, name:artData.realName, type:'artifact', volume:artData.volume,
          value:artData.basePrice, artifactRef:artData,
        }]);
        if (!bulletins.some(b => b.id === MILESTONE_MEMOS.first_artifact.id)) {
          setBulletins(prev => [{...MILESTONE_MEMOS.first_artifact,read:false},...prev]);
          addMessage('Operations: New Memo #404-Relic logged in Starport Notices (Milestone: First Precursor Relic).', 'Science Officer', 'info');
        }
      } else if (artData && r.artifactRecovered === false) {
        addMessage(`Relic remains at the ruin: free ${artData.volume.toFixed(1)} m³ in the rover hold and return to collect it.`, 'Captain', 'alert');
      }
      setSurfaceRuinModal(r);
      gameAudio.playPowerupChime();
      if (r.isControlNexus && !bulletins.some((b) => b.id === MILESTONE_MEMOS.nexus_found.id)) {
        setBulletins((prev) => [{ ...MILESTONE_MEMOS.nexus_found, read: false }, ...prev]);
        addMessage('Operations: URGENT MEMO #001-Omega logged in Starport Notices (Milestone: Control Nexus Located).', 'Captain', 'alert');
      }
      handleSaveToSlot(activeSlot);
      return;
    }

    if (best.kind === 'cargo') {
      const c = best.item;
      if (currentHoldVol + c.volume > 50) {
        gameAudio.playErrorBuzz();
        addMessage('Terrain Vehicle hold full.', 'Captain', 'alert');
        return;
      }

      currentSurfaceState.droppedCargo.splice(best.index, 1);
      setVehicleHold((prev) => [...prev, recoveredCargo(c)]);
      if (c.isArmed) {
        setArmedDetonationTracker(tracker => tracker
          && tracker.systemCoords[0] === currentStar.x && tracker.systemCoords[1] === currentStar.y
          && tracker.planetIndex === currentPlanets[orbitPlanetIndex ?? 0]?.orderIndex ? null : tracker);
      }
      setTractorBeamFx({ active: true, x: c.x, y: c.y, timer: 0.4, color: '#facc15' });
      gameAudio.playCoinPickup();
      addMessage(`Retrieved dropped cargo container: ${c.name}.${c.isArmed ? ' Antimatter charge disarmed for safe transport.' : ''}`, 'Captain', 'info');
      handleSaveToSlot(activeSlot);
      return;
    }
  }, [currentSurfaceState, vehicleHold, vehicleX, vehicleY, bulletins, triggerBanter, addMessage, currentStar, currentPlanets, orbitPlanetIndex, handleSaveToSlot, activeSlot, handleRecordNearbyLifeform]);

  const [roverCargoSubmenuOpen, setRoverCargoSubmenuOpen] = useState<boolean>(false);

  // Collect Nearby Entity or Open Cargo Management
  const handleCollectNearby = useCallback(() => {
    setRoverCargoSubmenuOpen(true);
    gameAudio.playCrispClick();
  }, []);

  // Drop an item from Rover Hold onto planet surface
  const handleRoverDropCargo = useCallback(
    (index: number, armEgg = false) => {
      const vehicleHold = vehicleHoldFrameRef.current;
      const item = vehicleHold[index];
      if (!item) return;

      const isBlackEgg = item.id === 'black-egg' || item.artifactRef?.id === 'black-egg' || item.artifactRef?.id === 'art-black-egg' || item.name.toLowerCase().includes('black egg') || item.type === 'artifact' && item.name.toLowerCase().includes('black egg');
      const shouldArm = isBlackEgg;

      const {lat:clampedLat,lon:wrappedLong} = surfaceCoordinates(landingLat,landingLong,vehicleX,vehicleY);

      const dropped: DroppedCargoItem = {
        id: `drop-${Date.now()}-${Math.random()}`,
        name: shouldArm ? `${item.name} [ARMED]` : item.name,
        type: item.type,
        volume: item.volume,
        value: item.value,
        x: vehicleX,
        y: vehicleY,
        artifactRef: item.artifactRef,
        speciesName: item.speciesName,
        isArmed: shouldArm,
      };

      if (currentSurfaceState) {
        currentSurfaceState.droppedCargo.push(dropped);
      }
      setVehicleHold((prev) => prev.filter((_, i) => i !== index));
      gameAudio.playCrispClick();

      if (shouldArm) {
        setArmedDetonationTracker({
          systemCoords: [currentStar.x, currentStar.y],
          planetIndex: currentPlanets[orbitPlanetIndex ?? 0]?.orderIndex ?? 0,
          lat: clampedLat,
          lon: wrappedLong,
          isArmed: true,
        });
        gameAudio.playAlarmKlaxon();
        addMessage("The Black Egg has been armed.", 'Captain', 'alert');
      } else {
        addMessage(`Dropped ${item.name} (${item.volume} m³) on surface at [${vehicleX.toFixed(1)}, ${vehicleY.toFixed(1)}].`, 'Captain', 'info');
      }
      handleSaveToSlot(activeSlot);
    },
    [currentSurfaceState, vehicleHold, vehicleX, vehicleY, landingLat, landingLong, currentStar, currentPlanets, orbitPlanetIndex, addMessage, handleSaveToSlot, activeSlot],
  );

  // Dock with Starport Arth with Docking Cinematic
  const dockWithStarport = useCallback(() => {
    if (cinematicStateRef.current !== 'none') return;
    if (isArthDestroyed) {
      gameAudio.playErrorBuzz();
      addMessage('DOCKING FAILED: Starport Arth was destroyed in the solar flare! Docking impossible.', 'Communications', 'alert');
      return;
    }

    startCinematic('dock', 8.0);
    gameAudio.playPowerupChime();
    addMessage('Approach cone locked. Initiating automated docking alignment with Starport Arth...', 'Navigator', 'info');
  }, [isArthDestroyed, startCinematic, addMessage]);

  const stopManeuver = useCallback(() => {
    setActiveDirectionVector({ dx: 0, dy: 0 });
    setShipVx(0);
    setShipVy(0);
    setActiveConsoleMenu('Navigation');
    gameAudio.playCrispClick();
  }, []);

  // --------------------------------------------------------------------------
  // DEVELOPER TESTING PANEL ACTIONS (10 CAPABILITIES + SCREEN GALLERY + LABELS)
  // --------------------------------------------------------------------------
  const markDevAction = useCallback(
    (desc: string) => {
      setDevUsed(true);
      addMessage(`DEV: ${desc}`, 'Captain', 'alert');
      gameAudio.playPowerupChime();
    },
    [addMessage],
  );

  // Helper to safely reset transient modals before applying gallery scene
  const resetAllModalsForGallery = useCallback(() => {
    setIsGameMenuOpen(false);
    setIsShipCargoModalOpen(false);
    setDescribedCargoItem(null);
    setRoverCargoModalOpen(false);
    setRoverCargoSubmenuOpen(false);
    setRoverWeaponMenuOpen(false);
    setRoverLookData(null);
    setTacticalStatusModal(false);
    setActiveConsoleMenu('Bridge');
    setDisplayPanelMode('system_map');
    setSystemZoom(0.65);
    setArmBombPromptItem(null);
    setIsNamingShipModal(false);
    setIsCreatingCrewModal(false);
    setIsTrainingSkillModal(false);
    setIsImportModalOpen(false);
    setIsExportModalOpen(false);
    setIsQuitReminderOpen(false);
    setReplacementMission(null);
    setReplacementStatus('');
    setIsStarmapOpen(false);
    setIsSurfaceMapOpen(false);
    setIsShipsLogOpen(false);
    setSurfaceRuinModal(null);
    setGameOverModal(null);
    setVictorySequenceModal(false);
    setIsPromptingDistress(false);
    setIsPromptingColonyRec(false);
    setColonyPromptStep('ask_recommend');
    setDockingBayWarnings([]);
    setIntroPage(0);
    cinematicCompletingRef.current = false;
    cinematicStateRef.current = 'none';
    cinematicTimerRef.current = 0;
    setCinematicState('none');
    setCinematicTimer(0);
    setAlienCommsState((prev) => ({ ...prev, active: false, connected: false }));
    setActiveEncounterGroup(null);
    setProjectiles([]);
    setActiveRepairTask(null);
    setActivePatientId(null);
  }, []);

  const handleDevSetBalance = useCallback(
    (amount: number) => {
      const sanitized = Math.max(0, Math.floor(amount));
      setCredits(sanitized);
      setBankLedger((prev) => [
        {
          date: formattedStardate,
          desc: `DEV: Set Balance to ${sanitized.toLocaleString()} M.U.`,
          amount: sanitized - credits,
          balance: sanitized,
        },
        ...prev,
      ]);
      markDevAction(`Balance set to ${sanitized.toLocaleString()} M.U.`);
    },
    [credits, formattedStardate, markDevAction],
  );

  const handleDevSetStardate = useCallback(
    (day: number, month: number, year: number, hour: number) => {
      const d = Math.max(1, Math.min(30, day));
      const m = Math.max(1, Math.min(10, month));
      const y = Math.max(4620, year);
      const h = Math.max(0, Math.min(23, hour));
      setStardateDay(d);
      setStardateMonth(m);
      setStardateYear(y);
      setStardateHour(h);
      const absD = getAbsoluteDay(d, m, y);
      const newStarHours = absD * 24 + h;
      previousStarHoursRef.current = newStarHours;
      flightClockAccumulatorRef.current = 0;
      markDevAction(`Stardate set to ${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y} ${String(h).padStart(2, '0')}:00 (Day ${absD}, ${newStarHours} star hours)`);
    },
    [markDevAction],
  );

  const handleDevTeleport = useCallback(
    (
      type: 'hyperspace' | 'star_system' | 'orbit' | 'starport',
      x: number,
      y: number,
      starId: number,
      planetSlot: number,
    ) => {
      const currentHold = artifactsInHoldRef.current;
      const currentHoldIds = currentHold.map(getNormalizedId);
      addMessage(`DEV: hold before teleport: [${currentHoldIds.join(', ')}]`, 'Captain', 'info');

      if (type === 'starport') {
        setGameLocation('Starport');
        setCurrentStarId(1);
        setGalaxyShipX(125);
        setGalaxyShipY(100);
        setActiveRoomIndex(null);
        const concourseCanvas = getConcourseCanvas(assets);
        const spawnPos = imageFracToCanvas(
          CONCOURSE_SPAWN_U,
          CONCOURSE_SPAWN_V,
          viewDimensions.width,
          viewDimensions.height,
          concourseCanvas
        );
        setAstronautX(spawnPos.x);
        setAstronautY(spawnPos.y);
        setAstronautVx(0);
        setAstronautVy(0);
        setClickMoveTarget(null);
        setShipVx(0);
        setShipVy(0);
        setActiveEncounterGroup(null);
        setProjectiles([]);
        setActiveConsoleMenu('Bridge');
        setDisplayPanelMode('system_map');
        addMessage(`DEV: hold after teleport: [${currentHoldIds.join(', ')}]`, 'Captain', 'info');
        markDevAction('Teleported to Starport Arth Concourse');
        return;
      }

      if (type === 'hyperspace') {
        const destX = Math.max(0, Math.min(249, x));
        const destY = Math.max(0, Math.min(219, y));
        setGameLocation('Hyperspace');
        galaxyShipXRef.current = destX;
        galaxyShipYRef.current = destY;
        setGalaxyShipX(destX);
        setGalaxyShipY(destY);
        setShipVx(0);
        setShipVy(0);
        fluxExitDestRef.current = null;
        lastTraversedFluxIdRef.current = null;
        fluxCooldownTimerRef.current = 2.0;
        isJumpingFluxRef.current = false;
        setActiveEncounterGroup(null);
        setProjectiles([]);
        setActiveConsoleMenu('Bridge');
        setDisplayPanelMode('system_map');
        addMessage(`DEV: hold after teleport: [${currentHoldIds.join(', ')}]`, 'Captain', 'info');
        markDevAction(`Teleported to Hyperspace coordinates [${destX}, ${destY}]`);
        return;
      }

      const targetStar = UNIVERSE.stars.find((s) => s.id === starId) || UNIVERSE.stars[0];

      if (type === 'star_system') {
        setCurrentStarId(targetStar.id);
        setGalaxyShipX(targetStar.x);
        setGalaxyShipY(targetStar.y);
        setGameLocation('Star System');
        setSystemShipX(-88);
        setSystemShipY(118);
        setShipVx(0);
        setShipVy(0);
        setOrbitPlanetIndex(null);
        setActiveEncounterGroup(null);
        setProjectiles([]);
        setActiveConsoleMenu('Bridge');
        setDisplayPanelMode('system_map');
        addMessage(`DEV: hold after teleport: [${currentHoldIds.join(', ')}]`, 'Captain', 'info');
        markDevAction(`Teleported into Star System ${targetStar.name} [${targetStar.x}, ${targetStar.y}]`);
        return;
      }

      if (type === 'orbit') {
        setCurrentStarId(targetStar.id);
        setGalaxyShipX(targetStar.x);
        setGalaxyShipY(targetStar.y);
        setGameLocation('In Orbit');
        const pIdx = Math.max(0, Math.min(targetStar.planets.length - 1, planetSlot - 1));
        setOrbitPlanetIndex(pIdx);
        setSystemShipX(0);
        setSystemShipY(0);
        setShipVx(0);
        setShipVy(0);
        setActiveEncounterGroup(null);
        setProjectiles([]);
        setActiveConsoleMenu('Bridge');
        setDisplayPanelMode('system_map');
        const p = targetStar.planets[pIdx];
        const pName = p?.name || `Planet ${pIdx + 1}, system ${targetStar.x}, ${targetStar.y}`;
        const pGrav = p?.gravity || 1.0;
        addMessage(`DEV: hold after teleport: [${currentHoldIds.join(', ')}]`, 'Captain', 'info');
        markDevAction(`Teleported into Orbit around ${targetStar.name} (${(p as any)?.storyName || pName})`);
        handleOrbitEntryLogic(pIdx, targetStar.x, targetStar.y, pName, pGrav, currentHold);
        return;
      }
    },
    [markDevAction, handleOrbitEntryLogic, addMessage],
  );

  const handleDevShowHold = useCallback(() => {
    const currentArts = artifactsInHoldRef.current;
    const currentCargo = cargoHoldRef.current;
    const currentSpecimens = specimensInHoldRef.current;
    const items: string[] = [];
    let totalVol = 0;

    // Unified Artifacts in hold
    currentArts.forEach((a) => {
      const v = a.volume || 0;
      totalVol += v;
      const vStr = Number.isInteger(v) ? v.toString() : v.toFixed(1);
      const cleanId = getNormalizedId(a);
      items.push(`${cleanId} (${vStr} m3)`);
    });

    // Unified Minerals in hold
    Object.entries(currentCargo).forEach(([mineral, amount]) => {
      if (amount > 0) {
        totalVol += amount;
        const vStr = Number.isInteger(amount) ? amount.toString() : amount.toFixed(1);
        items.push(`${mineral.toLowerCase()} (${vStr} m3)`);
      }
    });

    // Unified Specimens in hold
    currentSpecimens.forEach((s) => {
      const v = s.volume || 0;
      totalVol += v;
      const vStr = Number.isInteger(v) ? v.toString() : v.toFixed(1);
      items.push(`${s.name.toLowerCase()} (${vStr} m3)`);
    });

    const totalVolStr = Number.isInteger(totalVol) ? totalVol.toString() : totalVol.toFixed(1);
    const logText = `DEV: hold contents: [${items.join(', ')}], total volume: ${totalVolStr} m3`;
    addMessage(logText, 'Captain', 'info');
    gameAudio.playDataChime();
  }, [addMessage]);

  const handleDevSpawnMineral = useCallback(
    (name: string, volume: number, directToFuel = false) => {
      const vol = Math.max(0.1, volume);
      if (name === 'Endurium' && directToFuel) {
        setEnduriumFuel((f) => f + vol);
        markDevAction(`Injected ${vol} m³ Endurium directly into starship fuel tanks`);
        return;
      }

      setCargoHold((prev) => {
        const next = {
          ...prev,
          [name]: adjustCargoStock(prev[name] || 0, vol),
        };
        // Verify read-back from unified store
        if (next[name] !== undefined) {
          const volStr = Number.isInteger(vol) ? vol.toString() : vol.toFixed(1);
          setTimeout(() => {
            markDevAction(`Spawned Mineral: "${name}" (${volStr} m3) in cargo hold (verified in unified store)`);
          }, 0);
        }
        return next;
      });
    },
    [markDevAction],
  );

  const handleDevSpawnArtifact = useCallback(
    (artId: string) => {
      const art = CANONICAL_ARTIFACTS.find(
        (a) => a.id === artId || a.id === artId.replace(/^art-/, '') || a.id === `art-${artId}`
      );
      if (!art) return;

      const cleanId = art.id.startsWith('art-') ? art.id.slice(4) : art.id;

      const newItem: ArtifactItem = {
        id: cleanId,
        name: art.realName,
        codeName: art.codeName,
        realName: art.realName,
        volume: art.volume,
        basePrice: art.basePrice,
        value: art.basePrice,
        appraised: true,
        description: art.description,
      };

      setArtifactsInHold((prev) => {
        const filtered = prev.filter((item) => getNormalizedId(item) !== cleanId);
        const next = [...filtered, newItem];
        artifactsInHoldRef.current = next;
        const volStr = Number.isInteger(newItem.volume) ? newItem.volume.toString() : newItem.volume.toFixed(1);
        setTimeout(() => {
          markDevAction(`Spawned Artifact: "${newItem.name || newItem.realName}" (${volStr} m3) in cargo hold (verified in unified store)`);
        }, 0);
        return next;
      });
    },
    [markDevAction],
  );

  const handleDevSpawnSpecimen = useCallback(
    (speciesName: string, size: 'Small' | 'Medium' | 'Large' | 'Behemoth', volume: number, bountyValue: number) => {
      const newItem: VehicleCargoItem = {
        id: `dev-spec-${Date.now()}`,
        name: `${speciesName} (${size})`,
        type: 'specimen',
        volume,
        value: bountyValue,
        speciesName,
      };

      setVehicleHold((prev) => [...prev, newItem]);
      markDevAction(`Spawned Lifeform Specimen "${speciesName}" (${size}, ${volume} m³, ${bountyValue.toLocaleString()} M.U.)`);
    },
    [markDevAction],
  );

  const handleDevModifyCrew = useCallback(
    (
      memberId: string,
      vitality: number,
      sci: number,
      nav: number,
      eng: number,
      com: number,
      med: number,
    ) => {
      setCrewRoster((roster) =>
        roster.map((c) => {
          if (c.id === memberId) {
            return {
              ...c,
              alive: vitality > 0,
              vitality: Math.max(0, Math.min(100, vitality)),
              skills: {
                science: Math.max(0, Math.min(250, sci)),
                navigation: Math.max(0, Math.min(250, nav)),
                engineering: Math.max(0, Math.min(250, eng)),
                communications: Math.max(0, Math.min(250, com)),
                medicine: Math.max(0, Math.min(250, med)),
              },
            };
          }
          return c;
        }),
      );
      const m = crewRoster.find((c) => c.id === memberId);
      markDevAction(`Updated attributes for crew member: ${m ? m.name : memberId}`);
    },
    [crewRoster, markDevAction],
  );

  const handleDevQuickCrew = useCallback(() => {
    const quickCrew: CrewMember[] = [
      {
        id: 'crew-quick-ana',
        name: 'Ana',
        race: 'Human',
        skills: { science: 50, navigation: 30, engineering: 30, communications: 30, medicine: 30 },
        durability: 6,
        vitality: 100,
        alive: true,
        quirk: RACE_SPECS.Human.desc,
        color: '#00f0ff',
      },
      {
        id: 'crew-quick-ben',
        name: 'Ben',
        race: 'Human',
        skills: { science: 50, navigation: 30, engineering: 30, communications: 30, medicine: 30 },
        durability: 6,
        vitality: 100,
        alive: true,
        quirk: RACE_SPECS.Human.desc,
        color: '#00f0ff',
      },
      {
        id: 'crew-quick-cy',
        name: 'Cy',
        race: 'Human',
        skills: { science: 50, navigation: 30, engineering: 30, communications: 30, medicine: 30 },
        durability: 6,
        vitality: 100,
        alive: true,
        quirk: RACE_SPECS.Human.desc,
        color: '#00f0ff',
      },
      {
        id: 'crew-quick-dee',
        name: 'Dee',
        race: 'Human',
        skills: { science: 50, navigation: 30, engineering: 30, communications: 30, medicine: 30 },
        durability: 6,
        vitality: 100,
        alive: true,
        quirk: RACE_SPECS.Human.desc,
        color: '#00f0ff',
      },
      {
        id: 'crew-quick-eli',
        name: 'Eli',
        race: 'Human',
        skills: { science: 50, navigation: 30, engineering: 30, communications: 30, medicine: 30 },
        durability: 6,
        vitality: 100,
        alive: true,
        quirk: RACE_SPECS.Human.desc,
        color: '#00f0ff',
      },
      {
        id: 'crew-quick-fay',
        name: 'Fay',
        race: 'Human',
        skills: { science: 50, navigation: 30, engineering: 30, communications: 30, medicine: 30 },
        durability: 6,
        vitality: 100,
        alive: true,
        quirk: RACE_SPECS.Human.desc,
        color: '#00f0ff',
      },
    ];

    const quickPosts: Record<CrewPost, string | null> = {
      Captain: 'crew-quick-ana',
      'Science Officer': 'crew-quick-ben',
      Navigator: 'crew-quick-cy',
      Engineer: 'crew-quick-dee',
      Communications: 'crew-quick-eli',
      Doctor: 'crew-quick-fay',
    };

    setCrewRoster(normalizeCrewPortraits(quickCrew));
    setAssignedPosts(quickPosts);
    setDevSelectedCrewId('crew-quick-ana');
    setDevCrewVitality(100);
    setDevCrewSci(50);
    setDevCrewNav(30);
    setDevCrewEng(30);
    setDevCrewCom(30);
    setDevCrewMed(30);
    setPersonnelIndex(0);
    markDevAction('Quick Crew created: 6 Human officers assigned to all posts');
  }, [markDevAction]);

  const handleDevMaxAllCrew = useCallback(() => {
    setCrewRoster((roster) =>
      roster.map((c) => {
        const spec = RACE_SPECS[c.race];
        return {
          ...c,
          alive: true,
          vitality: 100,
          skills: {
            science: spec.maxSkills.science,
            navigation: spec.maxSkills.navigation,
            engineering: spec.maxSkills.engineering,
            communications: spec.maxSkills.communications,
            medicine: spec.maxSkills.medicine,
          },
        };
      }),
    );
    markDevAction('Maxed all crew members to 100% Vitality and race maximum skill caps');
  }, [markDevAction]);

  const handleDevReviveAllCrew = useCallback(() => {
    setCrewRoster((roster) =>
      roster.map((c) => ({
        ...c,
        alive: true,
        vitality: Math.max(c.vitality, 100),
      })),
    );
    markDevAction('Revived all fallen crew personnel');
  }, [markDevAction]);

  const handleDevSetShipHealth = useCallback(
    (hull: number, armor: number, shield: number) => {
      setHullIntegrity(Math.max(1, Math.min(250, hull)));
      setPlayerArmorPoints(Math.max(0, Math.min(1500, armor)));
      setPlayerShieldPoints(Math.max(0, Math.min(2500, shield)));
      markDevAction(`Ship integrity set: Hull ${hull}/250, Armor ${armor}, Shield ${shield}`);
    },
    [markDevAction],
  );

  const handleDevRefillFuel = useCallback(
    (amount: number) => {
      setEnduriumFuel(amount);
      markDevAction(`Endurium Fuel tank set to ${amount.toFixed(1)} m³`);
    },
    [markDevAction],
  );

  const handleDevRepairAllSystems = useCallback(() => {
    setHullIntegrity(250);
    setPlayerArmorPoints(maxArmorCapacity);
    setPlayerShieldPoints(maxShieldCapacity);
    setSubsystems({
      Engines: 100,
      Sensors: 100,
      Comms: 100,
      Shields: 100,
      Missiles: 100,
      Lasers: 100,
    });
    setInoperativeSystems({
      Engines: false,
      Sensors: false,
      Comms: false,
      Shields: false,
      Missiles: false,
      Lasers: false,
    });
    markDevAction('Repaired all ship subsystems and hull to 100% nominal state');
  }, [maxArmorCapacity, maxShieldCapacity, markDevAction]);

  const handleDevMaxUpgradeShip = useCallback(() => {
    setEngineClass(5);
    setShieldClass(5);
    setArmorClass(5);
    setMissileClass(5);
    setLaserClass(5);
    setCargoPods(16);
    setEnduriumFuel(500);
    setHullIntegrity(250);
    setPlayerArmorPoints(1500);
    setPlayerShieldPoints(2500);
    setSubsystems({
      Engines: 100,
      Sensors: 100,
      Comms: 100,
      Shields: 100,
      Missiles: 100,
      Lasers: 100,
    });
    setInoperativeSystems({
      Engines: false,
      Sensors: false,
      Comms: false,
      Shields: false,
      Missiles: false,
      Lasers: false,
    });
    markDevAction('Upgraded starship to Class 5 Singularity Warp, Class 5 Quantum Ward, 16 Cargo Pods, & 500 m³ Fuel');
  }, [markDevAction]);

  const handleDevSpawnAlienEncounter = useCallback(
    (race: AlienRace, vesselType: VesselClass, count: number) => {
      const numShips = Math.max(1, Math.min(8, count));
      const groupShips: AlienShip[] = [];

      for (let s = 0; s < numShips; s++) {
        const ship = createAlienShip(
          race,
          vesselType,
          `dev-ship-${Date.now()}-${s}`,
          Math.round((Math.random() - 0.5) * 8),
          Math.round(14 + Math.random() * 8),
        );
        groupShips.push(ship);
      }

      const newGroup: AlienGroup = {
        id: `dev-aln-grp-${Date.now()}`,
        race,
        x: Math.round(galaxyShipX),
        y: Math.round(galaxyShipY),
        homeX: Math.round(galaxyShipX),
        homeY: Math.round(galaxyShipY),
        territoryRadius: 20,
        isHomeworldFleet: false,
        homeworldWarningStage: 0,
        shipsCount: numShips,
        spawnedTotal: numShips,
        baseMood: 50,
        currentMood: 50,
        posture: 'Neutral',
        ships: groupShips,
        distressCalled: false,
      };

      triggerEncounter(newGroup);
      markDevAction(`Spawned tactical encounter with ${numShips} ${race} ${vesselType} vessel(s)`);
    },
    [galaxyShipX, galaxyShipY, triggerEncounter, markDevAction],
  );

  const handleDevSetAlienMood = useCallback(
    (race: AlienRace, posture: DiplomaticPosture) => {
      let baseMood = 50;
      if (posture === 'Friendly') baseMood = 10;
      else if (posture === 'Neutral') baseMood = 45;
      else if (posture === 'Hostile') baseMood = 95;
      else if (posture === 'Obsequious') baseMood = 20;

      setSpeciesBaseMoods((prev) => ({
        ...prev,
        [race]: baseMood,
      }));

      setAlienGroups((prev) =>
        prev.map((g) => {
          if (g.race === race) {
            return {
              ...g,
              baseMood,
              currentMood: baseMood,
              posture,
            };
          }
          return g;
        }),
      );

      if (activeEncounterGroup && activeEncounterGroup.race === race) {
        setAlienCommsState((prev) => ({
          ...prev,
          alienMood: baseMood,
          alienPosture: posture,
        }));
      }

      markDevAction(`Set ${race} base mood to ${posture} (Mood Index: ${baseMood}/100)`);
    },
    [activeEncounterGroup, markDevAction],
  );

  const handleDevRevealAllFluxLinks = useCallback(() => {
    const all32Ids = Array.from({ length: 32 }, (_, i) => i + 1);
    setTraversedFluxIds(all32Ids);

    // Also ensure Precursor Ring Device is in cargo hold so flux links are rendered
    const hasRing = artifactsInHold.some((a) => a.id === 'ring-device' || a.id === 'ring_device' || a.id === 'art-ring-device' || a.realName?.includes('Ring Device'));
    if (!hasRing) {
      const ringArt = CANONICAL_ARTIFACTS.find((a) => a.id === 'ring-device' || a.id === 'art-ring-device');
      if (ringArt) {
        setArtifactsInHold((prev) => [
          ...prev,
          {
            id: 'ring-device',
            name: ringArt.realName,
            codeName: ringArt.codeName,
            realName: ringArt.realName,
            volume: ringArt.volume,
            basePrice: ringArt.basePrice,
            appraised: true,
            description: ringArt.description,
          },
        ]);
      }
    }
    markDevAction('Revealed all 32 Continuum Flux links on Starmap and spawned Precursor Ring Device');
  }, [artifactsInHold, markDevAction]);

  // SCREEN GALLERY SCENE DEFINITIONS (116 Exhaustive States)
  const GALLERY_SCENES = useMemo(() => {
    return [
      // 1. TITLE & SYSTEM
      {
        id: 'title-screen',
        category: 'Title & System',
        title: 'Title Screen & Starfield Animation',
        desc: 'Animated rotating Arth sphere, orbiting Starport station, and save slots.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'START', score: 100, level: 1 });
        },
      },
      {
        id: 'pause-menu-main',
        category: 'Title & System',
        title: 'Command Pause Menu',
        desc: 'Main pause menu overlay with Resume, Save, and Quit options.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setIsGameMenuOpen(true);
          setPauseMenuTab('main');
        },
      },
      {
        id: 'pause-menu-slots',
        category: 'Title & System',
        title: 'Save Slots Management Modal',
        desc: 'Save and load slots (A through E) with metadata and [DEV] tags.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setIsGameMenuOpen(true);
          setPauseMenuTab('slots');
        },
      },
      {
        id: 'pause-menu-settings',
        category: 'Title & System',
        title: 'Graphics & Audio Settings Modal',
        desc: 'CRT scanline filter, screen shake, audio sliders, and comedy banter toggle.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setIsGameMenuOpen(true);
          setPauseMenuTab('settings');
        },
      },
      {
        id: 'prologue-page-1',
        category: 'Title & System',
        title: 'Manual / Prologue: Page 1 (Starport Arth Commissioning)',
        desc: 'Commissioning of new exploration commanders after the Great Disruption.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setIntroPage(1);
        },
      },
      {
        id: 'prologue-page-2',
        category: 'Title & System',
        title: 'Manual / Prologue: Page 2 (The Initial Assignment)',
        desc: 'Interstel Corporation outfitting, crew recruitment, and Endurium fuel.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setIntroPage(2);
        },
      },
      {
        id: 'prologue-page-3',
        category: 'Title & System',
        title: 'Manual / Prologue: Page 3 (The Growing Mystery)',
        desc: 'Subtle solar fluctuations, planetary habitability logging, and artifact recovery.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setIntroPage(3);
        },
      },

      // 2. STARPORT RING & DOORS
      {
        id: 'concourse-door-personnel',
        category: 'Starport Ring & Doors',
        title: 'Starport Concourse: Personnel Door (Top)',
        desc: 'Concourse at Personnel Door (Top: 0.500, 0.148).',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(null);
          const concourseCanvas = getConcourseCanvas(assets);
          const pos = imageFracToCanvas(0.500, 0.148, viewDimensions.width, viewDimensions.height, concourseCanvas);
          setAstronautX(pos.x);
          setAstronautY(pos.y);
        },
      },
      {
        id: 'concourse-door-crew-assign',
        category: 'Starport Ring & Doors',
        title: 'Starport Concourse: Crew Assignment Door (Upper Right)',
        desc: 'Concourse at Crew Assignment Door (Upper Right: 0.736, 0.237).',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(null);
          const concourseCanvas = getConcourseCanvas(assets);
          const pos = imageFracToCanvas(0.736, 0.237, viewDimensions.width, viewDimensions.height, concourseCanvas);
          setAstronautX(pos.x);
          setAstronautY(pos.y);
        },
      },
      {
        id: 'concourse-door-bank',
        category: 'Starport Ring & Doors',
        title: 'Starport Concourse: Bank Door (Lower Right)',
        desc: 'Concourse at Bank Door (Lower Right: 0.797, 0.731).',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(null);
          const concourseCanvas = getConcourseCanvas(assets);
          const pos = imageFracToCanvas(0.797, 0.731, viewDimensions.width, viewDimensions.height, concourseCanvas);
          setAstronautX(pos.x);
          setAstronautY(pos.y);
        },
      },
      {
        id: 'concourse-door-ship-config',
        category: 'Starport Ring & Doors',
        title: 'Starport Concourse: Ship Configuration Door (Bottom)',
        desc: 'Concourse at Ship Configuration Door (Bottom: 0.500, 0.902).',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(null);
          const concourseCanvas = getConcourseCanvas(assets);
          const pos = imageFracToCanvas(0.500, 0.902, viewDimensions.width, viewDimensions.height, concourseCanvas);
          setAstronautX(pos.x);
          setAstronautY(pos.y);
        },
      },
      {
        id: 'concourse-door-trade-depot',
        category: 'Starport Ring & Doors',
        title: 'Starport Concourse: Trade Depot Door (Lower Left)',
        desc: 'Concourse at Trade Depot Door (Lower Left: 0.202, 0.731).',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(null);
          const concourseCanvas = getConcourseCanvas(assets);
          const pos = imageFracToCanvas(0.202, 0.731, viewDimensions.width, viewDimensions.height, concourseCanvas);
          setAstronautX(pos.x);
          setAstronautY(pos.y);
        },
      },
      {
        id: 'concourse-door-operations',
        category: 'Starport Ring & Doors',
        title: 'Starport Concourse: Operations Door (Upper Left)',
        desc: 'Concourse at Operations Door (Upper Left: 0.263, 0.237).',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(null);
          const concourseCanvas = getConcourseCanvas(assets);
          const pos = imageFracToCanvas(0.263, 0.237, viewDimensions.width, viewDimensions.height, concourseCanvas);
          setAstronautX(pos.x);
          setAstronautY(pos.y);
        },
      },
      {
        id: 'concourse-door-docking-bay',
        category: 'Starport Ring & Doors',
        title: 'Starport Concourse: Docking Bay (Center Platform)',
        desc: 'Concourse at Docking Bay round center platform (0.500, 0.505).',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(null);
          const concourseCanvas = getConcourseCanvas(assets);
          const pos = imageFracToCanvas(0.500, 0.505, viewDimensions.width, viewDimensions.height, concourseCanvas);
          setAstronautX(pos.x);
          setAstronautY(pos.y);
        },
      },
      {
        id: 'concourse-sealed-door-left',
        category: 'Starport Ring & Doors',
        title: 'Starport Concourse: Sealed Door (Far Left)',
        desc: 'Concourse at sealed door (Far Left: 0.147, 0.450) displaying "Sealed." log.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(null);
          const concourseCanvas = getConcourseCanvas(assets);
          const pos = imageFracToCanvas(0.147, 0.450, viewDimensions.width, viewDimensions.height, concourseCanvas);
          setAstronautX(pos.x);
          setAstronautY(pos.y);
          addMessage('Sealed.', undefined, 'info');
        },
      },

      // 3. STARPORT FACILITIES
      {
        id: 'facility-ops-bulletins',
        category: 'Starport Facilities',
        title: 'Operations: Notices & Corporate Bulletins',
        desc: 'Paginated corporate memo terminal with unread badges and captain asides.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(0);
          setOpsSubTab('bulletins');
          setActiveNoticeIndex(0);
        },
      },
      {
        id: 'facility-ops-colony-evals',
        category: 'Starport Facilities',
        title: 'Operations: Colony Evaluations Reader',
        desc: 'Directorate habitability evaluation audit and grant ledger.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(0);
          setOpsSubTab('evaluations');
          if (evaluations.length === 0) {
            setEvaluations([
              {
                id: 'eval-demo-1',
                planetName: 'Paradise Prime (1st Planet)',
                colonyName: 'New Arth Haven',
                starX: 145,
                starY: 107,
                stardate: '12-04-4620',
                suitable: true,
                verdict: 'SUITABLE',
                rating: 'A',
                payout: 80000,
                bonus: 80000,
                reasons: [],
                isOptimal: true,
                notes: 'Approved for colonization with 16 habitability points. Excellent colonial prospect.',
                read: true,
              },
              {
                id: 'eval-demo-2',
                planetName: 'Inferno IV (4th Planet)',
                colonyName: 'Pyre Outpost',
                starX: 82,
                starY: 61,
                stardate: '14-04-4620',
                suitable: false,
                verdict: 'UNSUITABLE',
                rating: 'F',
                payout: -100,
                fine: 100,
                reasons: ['EXTREME HEAT', 'VIOLENT STORMS', 'LACK OF OXYGEN', 'LACK OF WATER'],
                warningMessage: 'This is only a warning, your next fine will be heavy.',
                notes: 'EXTREME HEAT, VIOLENT STORMS, LACK OF OXYGEN, LACK OF WATER. This is only a warning, your next fine will be heavy.',
                read: false,
              },
            ]);
          }
          setActiveEvalIndex(0);
        },
      },
      {
        id: 'facility-ops-directives',
        category: 'Starport Facilities',
        title: 'Operations: Directives & Mandates',
        desc: 'Primary Mandate #4620, Endurium Extraction, and Solar Flare Warnings.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(0);
          setOpsSubTab('directives');
        },
      },
      {
        id: 'facility-personnel-human',
        category: 'Starport Facilities',
        title: 'Personnel: Human Officer & VR Training',
        desc: 'Dossier for Jax Vance with skill sliders, species caps, and VR training cost.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(1);
          setPersonnelIndex(Math.max(0,crewRosterFrameRef.current.findIndex(crew=>crew.race==='Human')));
        },
      },
      {
        id: 'facility-personnel-velox',
        category: 'Starport Facilities',
        title: 'Personnel: Velox Officer File (Insectoid)',
        desc: 'Chitinous insectoid engineering specialist Kzz-Chitik dossier.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(1);
          setPersonnelIndex(Math.max(0,crewRosterFrameRef.current.findIndex(crew=>crew.race==='Velox')));
        },
      },
      {
        id: 'facility-personnel-thrynn',
        category: 'Starport Facilities',
        title: 'Personnel: Thrynn Officer File (Reptilian)',
        desc: 'Reptilian pragmatist communications expert Slyzz Scalefang file.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(1);
          setPersonnelIndex(Math.max(0,crewRosterFrameRef.current.findIndex(crew=>crew.race==='Thrynn')));
        },
      },
      {
        id: 'facility-personnel-elowan',
        category: 'Starport Facilities',
        title: 'Personnel: Elowan Officer File (Botanical)',
        desc: 'Botanical telepath doctor Fern Petalgrove dossier.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(1);
          setPersonnelIndex(Math.max(0,crewRosterFrameRef.current.findIndex(crew=>crew.race==='Elowan')));
        },
      },
      {
        id: 'facility-personnel-android',
        category: 'Starport Facilities',
        title: 'Personnel: Android Unit 9-Vector',
        desc: 'Synthetic navigation unit with max telemetry calculations (untrainable).',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(1);
          setPersonnelIndex(Math.max(0,crewRosterFrameRef.current.findIndex(crew=>crew.race==='Android')));
        },
      },
      {
        id: 'facility-crew-assignment',
        category: 'Starport Facilities',
        title: 'Crew Assignment: 6 Bridge Stations Filled',
        desc: 'Captain, Science, Navigator, Engineer, Comms, and Doctor assignment grid.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(2);
        },
      },
      {
        id: 'facility-bank',
        category: 'Starport Facilities',
        title: 'Interstel Bank: Vault & Multi-Entry Ledger',
        desc: 'Available treasury balance, 12% interest accrual, and transaction ledger.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(3);
        },
      },
      {
        id: 'facility-ship-config-stock',
        category: 'Starport Facilities',
        title: 'Ship Configuration: Stock Class 1 Scout',
        desc: 'Bare stock starship with Class 1 Ion Pulse and 0 cargo pods on gantry.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(4);
          setEngineClass(1);
          setShieldClass(0);
          setArmorClass(0);
          setMissileClass(0);
          setLaserClass(0);
          setCargoPods(0);
        },
      },
      {
        id: 'facility-ship-config-max',
        category: 'Starport Facilities',
        title: 'Ship Configuration: Fully Fitted Class 5 Warship',
        desc: 'Class 5 Singularity Warp, Quantum Ward, Hyper-Alloy, and 16 cargo pods.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(4);
          setEngineClass(5);
          setShieldClass(5);
          setArmorClass(5);
          setMissileClass(5);
          setLaserClass(5);
          setCargoPods(16);
        },
      },
      {
        id: 'facility-trade-minerals',
        category: 'Starport Facilities',
        title: 'Trade Depot: Raw Minerals & Metals Market',
        desc: 'Catalog of 12 minerals with market prices, Endurium crystal, and hold quantities.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(5);
          setTradeSubTab('minerals');
        },
      },
      {
        id: 'facility-trade-artifacts',
        category: 'Starport Facilities',
        title: 'Trade Depot: Precursor Relic Appraisal & Sale',
        desc: 'Appraisal desk for unidentified artifacts with value identification.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(5);
          setTradeSubTab('artifacts');
        },
      },
      {
        id: 'facility-docking-bay',
        category: 'Starport Facilities',
        title: 'Docking Bay: Launch Clearance & Refuel',
        desc: 'Pre-flight departure checklist and quick matter-antimatter refuel terminal.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          setActiveRoomIndex(6);
        },
      },

      // 4. CINEMATICS
      {
        id: 'cinematic-launch',
        category: 'Cinematics',
        title: 'Cinematic: Starport Launch Sequence',
        desc: 'Blast doors sliding open, flashing warning strobes, and forward engine plume.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Starport');
          startCinematic('launch', BAY_LAUNCH_SECONDS);
        },
      },
      {
        id: 'cinematic-docking',
        category: 'Cinematics',
        title: 'Cinematic: Magnetic Docking Alignment',
        desc: 'Illuminated approach cone vectors and airlock pressurization seal.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          startCinematic('dock', 2.5);
        },
      },
      {
        id: 'cinematic-descent',
        category: 'Cinematics',
        title: 'Cinematic: Planetary Atmospheric Descent',
        desc: 'Rising terrain perspective grid, re-entry heat glow, and retro-rockets firing.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('In Orbit');
          setOrbitPlanetIndex(0);
          startCinematic('descent', 2.5);
        },
      },
      {
        id: 'cinematic-surface-launch',
        category: 'Cinematics',
        title: 'Cinematic: Surface Launch Orbital Ascent',
        desc: 'Ground receding downward with full plasma thrust plume and escape velocity.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('On Planet');
          startCinematic('surface_launch', 2.5);
        },
      },

      // 5. BRIDGE & SYSTEMS
      {
        id: 'bridge-console-root',
        category: 'Bridge & Systems',
        title: 'Bridge Root Console & Station Cluster',
        desc: '6 Bridge station buttons (Command, Science, Nav, Engineering, Comms, Medical).',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          setActiveConsoleMenu('Bridge');
        },
      },
      {
        id: 'bridge-station-command',
        category: 'Bridge & Systems',
        title: 'Bridge Station: Command Station',
        desc: 'Captain station with Log Planet and Emergency Distress Tow options.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          setActiveConsoleMenu('Command');
        },
      },
      {
        id: 'bridge-station-science',
        category: 'Bridge & Systems',
        title: 'Bridge Station: Science Station',
        desc: 'Science officer with Scan Sensors, Starmap link, and telemetry feed.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          setActiveConsoleMenu('Science');
          setScienceReading('STELLAR SCAN: Arth Sun [Spectral: G] • Core Stability: Stable • Confidence: High');
        },
      },
      {
        id: 'bridge-station-navigation',
        category: 'Bridge & Systems',
        title: 'Bridge Station: Navigation Station',
        desc: 'Navigator station with Maneuver, Shields Toggle, and Weapons Armed switches.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          setActiveConsoleMenu('Navigation');
        },
      },
      {
        id: 'bridge-station-engineering-diag',
        category: 'Bridge & Systems',
        title: 'Engineering: Holographic Wireframe Diagnostics',
        desc: 'Subsystem wireframe diagram with color-coded health and status bars.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          setActiveConsoleMenu('Engineering');
          setEngineeringMode('damage');
        },
      },
      {
        id: 'bridge-station-engineering-repair',
        category: 'Bridge & Systems',
        title: 'Engineering: In-Flight Mineral Transmutation Repair',
        desc: 'Transmutation fabrication using aluminum, copper, and titanium from cargo hold.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          setActiveConsoleMenu('Engineering');
          setEngineeringMode('repair');
          setSubsystems((prev) => ({ ...prev, Shields: 65, Lasers: 50 }));
          setActiveRepairTask({
            target: 'Shields',
            targetHealth: 100,
            mineralName: 'Titanium',
            mineralCost: 3.5,
          });
        },
      },
      {
        id: 'bridge-station-comms',
        category: 'Bridge & Systems',
        title: 'Bridge Station: Communications Transceiver',
        desc: 'Subspace communications officer panel with Hail Subspace controls.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          setActiveConsoleMenu('Communications');
        },
      },
      {
        id: 'bridge-station-medical',
        category: 'Bridge & Systems',
        title: 'Bridge Station: Medical Bio-Bed & EKG Monitors',
        desc: 'Medical examination bio-beds with active heartbeat EKG waveform monitors.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          setActiveConsoleMenu('Medical');
          setCrewRoster((prev) =>
            prev.map((c, i) => (i === 0 ? { ...c, vitality: 45 } : c)),
          );
          setActivePatientId('crew-human-1');
        },
      },

      // 6. DIAGNOSTICS & LOGS
      {
        id: 'log-notices-tab',
        category: 'Diagnostics & Logs',
        title: "Ship's Log: Corporate Bulletins & Memos Tab",
        desc: 'Log modal Tab 1 with official Interstel directives and search index.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          setIsShipsLogOpen(true);
          setShipsLogTab('notices');
        },
      },
      {
        id: 'log-alien-comms-tab',
        category: 'Diagnostics & Logs',
        title: "Ship's Log: Decrypted Alien Transmissions Tab",
        desc: 'Log modal Tab 2 with recorded alien dialogue transcripts and captain asides.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          setIsShipsLogOpen(true);
          setShipsLogTab('alien_comms');
          if (alienCommsState.dialogueHistory.length === 0) {
            setAlienCommsState((prev) => ({
              ...prev,
              dialogueHistory: [
                {
                  race: 'Elowan',
                  subject: 'The Ancients',
                  text: 'The Ancient builders planted the crystalline seeds throughout the spiral arm.',
                  rawText: '*Rustling branch resonance* The Ancient builders planted crystalline seeds.',
                  timestamp: '14-02-4620',
                },
                {
                  race: 'Thrynn',
                  subject: 'Other Races',
                  text: 'Never trust a Spemin. Their soft gelatinous hides conceal treacherous minds.',
                  rawText: '*Hissing scale rattle* Spemin are soft worms unworthy of credit.',
                  timestamp: '22-03-4620',
                },
              ],
            }));
          }
        },
      },
      {
        id: 'log-messages-feed-tab',
        category: 'Diagnostics & Logs',
        title: "Ship's Log: Bridge Message & Banter Feed Tab",
        desc: 'Log modal Tab 3 with chronological message log and filter pills (All, Alert, Banter).',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          setIsShipsLogOpen(true);
          setShipsLogTab('messages');
        },
      },
      {
        id: 'log-planets-tab',
        category: 'Diagnostics & Logs',
        title: "Ship's Log: Planetary Survey Registry Tab",
        desc: 'Log modal Tab 4 with Form COL-771-A submitted worlds and habitability grades.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          setIsShipsLogOpen(true);
          setShipsLogTab('planets');
        },
      },
      {
        id: 'form-modal-distress-tow',
        category: 'Diagnostics & Logs',
        title: 'Form EXP-904-B: Distress Extraction Invoice',
        desc: 'Interstel tow invoice prompt with itemized surcharges and 15,000 M.U. tariff.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          setIsPromptingDistress(true);
        },
      },
      {
        id: 'form-modal-colony-reg',
        category: 'Diagnostics & Logs',
        title: 'Planetary Logging Modal (Prompt & Name)',
        desc: 'Orbit colonization recommendation prompt with colony name input.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('In Orbit');
          setOrbitPlanetIndex(0);
          setIsPromptingColonyRec(true);
          setColonyPromptStep('enter_name');
          setColonyNameInput('New Arth Colony');
        },
      },

      // 7. STAR SYSTEMS & ORBIT
      {
        id: 'star-system-class-o',
        category: 'Star Systems & Orbit',
        title: 'Star System: Class O (Blue Supergiant)',
        desc: 'Massive blue supergiant with coronal flare rays and orbital guides.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          const oStar = UNIVERSE.stars.find((s) => s.spectral === 'O') || UNIVERSE.stars[0];
          setCurrentStarId(oStar.id);
          setSystemShipX(-80);
          setSystemShipY(100);
        },
      },
      {
        id: 'star-system-class-b',
        category: 'Star Systems & Orbit',
        title: 'Star System: Class B (Blue-White Star)',
        desc: 'High-luminosity blue-white star with orbiting planets.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          const bStar = UNIVERSE.stars.find((s) => s.spectral === 'B') || UNIVERSE.stars[0];
          setCurrentStarId(bStar.id);
          setSystemShipX(-80);
          setSystemShipY(100);
        },
      },
      {
        id: 'star-system-class-a',
        category: 'Star Systems & Orbit',
        title: 'Star System: Class A (White Star)',
        desc: 'Pure white luminous star core and surrounding planets.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          const aStar = UNIVERSE.stars.find((s) => s.spectral === 'A') || UNIVERSE.stars[0];
          setCurrentStarId(aStar.id);
          setSystemShipX(-80);
          setSystemShipY(100);
        },
      },
      {
        id: 'star-system-class-f',
        category: 'Star Systems & Orbit',
        title: 'Star System: Class F (Yellow-White Star)',
        desc: 'Yellow-white intermediate stellar class with planetary system.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          const fStar = UNIVERSE.stars.find((s) => s.spectral === 'F') || UNIVERSE.stars[0];
          setCurrentStarId(fStar.id);
          setSystemShipX(-80);
          setSystemShipY(100);
        },
      },
      {
        id: 'star-system-class-g',
        category: 'Star Systems & Orbit',
        title: 'Star System: Class G (Yellow / Arth Sun)',
        desc: 'Yellow main-sequence star of the Arth home system [125, 100].',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          setCurrentStarId(1);
          setSystemShipX(-88);
          setSystemShipY(118);
        },
      },
      {
        id: 'star-system-class-k',
        category: 'Star Systems & Orbit',
        title: 'Star System: Class K (Orange Star)',
        desc: 'Warm orange star with rich terrestrial and mineral planets.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          const kStar = UNIVERSE.stars.find((s) => s.spectral === 'K') || UNIVERSE.stars[0];
          setCurrentStarId(kStar.id);
          setSystemShipX(-80);
          setSystemShipY(100);
        },
      },
      {
        id: 'star-system-class-m',
        category: 'Star Systems & Orbit',
        title: 'Star System: Class M (Red Dwarf)',
        desc: 'Deep crimson red dwarf with compact orbital radii.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          const mStar = UNIVERSE.stars.find((s) => s.spectral === 'M') || UNIVERSE.stars[0];
          setCurrentStarId(mStar.id);
          setSystemShipX(-80);
          setSystemShipY(100);
        },
      },
      {
        id: 'in-orbit-rock',
        category: 'Star Systems & Orbit',
        title: 'In Orbit: Rock World (Cratered Terrestrial)',
        desc: 'Craters, rocky ridges, atmospheric limb, and synchronous orbiting ship.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setCurrentStarId(1);
          setGameLocation('In Orbit');
          setOrbitPlanetIndex(0);
          setOrbitTransitionProgress(1.0);
        },
      },
      {
        id: 'in-orbit-frozen',
        category: 'Star Systems & Orbit',
        title: 'In Orbit: Frozen Ice World (Glacial Plates)',
        desc: 'Blue-white ice plates, crystalline cracks, and specular sun glint.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          const frozenStar = UNIVERSE.stars.find((s) => s.planets.some((p) => p.type === 'Frozen')) || UNIVERSE.stars[0];
          setCurrentStarId(frozenStar.id);
          const pIdx = frozenStar.planets.findIndex((p) => p.type === 'Frozen');
          setGameLocation('In Orbit');
          setOrbitPlanetIndex(pIdx >= 0 ? pIdx : 0);
          setOrbitTransitionProgress(1.0);
        },
      },
      {
        id: 'in-orbit-liquid',
        category: 'Star Systems & Orbit',
        title: 'In Orbit: Liquid Ocean Planet (Paradise World)',
        desc: 'Green continents, deep azure oceans, cloud ribbons, and cyan atmospheric rim.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          const liquidStar = UNIVERSE.stars.find((s) => s.planets.some((p) => p.type === 'Liquid' && !p.isHomeworld)) || UNIVERSE.stars[0];
          setCurrentStarId(liquidStar.id);
          const pIdx = liquidStar.planets.findIndex((p) => p.type === 'Liquid' && !p.isHomeworld);
          setGameLocation('In Orbit');
          setOrbitPlanetIndex(pIdx >= 0 ? pIdx : 0);
          setOrbitTransitionProgress(1.0);
        },
      },
      {
        id: 'in-orbit-molten',
        category: 'Star Systems & Orbit',
        title: 'In Orbit: Molten Lava World',
        desc: 'Glowing orange/red magma fissures and dark basaltic crust.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          const moltenStar = UNIVERSE.stars.find((s) => s.planets.some((p) => p.type === 'Molten')) || UNIVERSE.stars[0];
          setCurrentStarId(moltenStar.id);
          const pIdx = moltenStar.planets.findIndex((p) => p.type === 'Molten');
          setGameLocation('In Orbit');
          setOrbitPlanetIndex(pIdx >= 0 ? pIdx : 0);
          setOrbitTransitionProgress(1.0);
        },
      },
      {
        id: 'in-orbit-gas-giant',
        category: 'Star Systems & Orbit',
        title: 'In Orbit: Gas Giant (Swirling Storm Bands)',
        desc: 'Multi-banded amber atmosphere stripes and rotating Great Red Spot vortex.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          const ggStar = UNIVERSE.stars.find((s) => s.planets.some((p) => p.type === 'Gas Giant')) || UNIVERSE.stars[0];
          setCurrentStarId(ggStar.id);
          const pIdx = ggStar.planets.findIndex((p) => p.type === 'Gas Giant');
          setGameLocation('In Orbit');
          setOrbitPlanetIndex(pIdx >= 0 ? pIdx : 0);
          setOrbitTransitionProgress(1.0);
        },
      },
      {
        id: 'in-orbit-crystal-planet',
        category: 'Star Systems & Orbit',
        title: 'In Orbit: Crystal Planet [192, 152]',
        desc: 'Faceted prismatic refraction core, Precursor Nexus, and thermal heat field.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          const cStar = UNIVERSE.stars.find((s) => s.x === 192 && s.y === 152) || UNIVERSE.stars[0];
          setCurrentStarId(cStar.id);
          setGameLocation('In Orbit');
          setOrbitPlanetIndex(0);
          setOrbitTransitionProgress(1.0);
        },
      },

      // 8. HYPERSPACE & STARMAP
      {
        id: 'hyperspace-open-warp',
        category: 'Hyperspace & Starmap',
        title: 'Hyperspace: Open Galaxy Warp Navigation',
        desc: 'Twinkling 3-layer parallax starfield, speed warp streaks, and star blips.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Hyperspace');
          setGalaxyShipX(125);
          setGalaxyShipY(100);
          setActiveConsoleMenu('Maneuver');
          setActiveDirectionVector({ dx: 1, dy: 0 });
        },
      },
      {
        id: 'hyperspace-star-cluster',
        category: 'Hyperspace & Starmap',
        title: 'Hyperspace: Dense Star Cluster Sector',
        desc: 'Navigation beside multiple glowing spectral star beacons.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Hyperspace');
          setGalaxyShipX(145);
          setGalaxyShipY(105);
        },
      },
      {
        id: 'hyperspace-nebula-damp',
        category: 'Hyperspace & Starmap',
        title: 'Hyperspace: Inside Electromagnetic Nebula',
        desc: 'Chromatic violet/blue dust haze with deflector shields suppressed.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Hyperspace');
          setGalaxyShipX(60);
          setGalaxyShipY(140);
        },
      },
      {
        id: 'hyperspace-flux-vortex',
        category: 'Hyperspace & Starmap',
        title: 'Hyperspace: Shimmering Continuum Flux Vortex',
        desc: 'Continuum flux spatial distortion vortex revealed with Precursor Ring Device.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevRevealAllFluxLinks();
          setGameLocation('Hyperspace');
          setGalaxyShipX(CONTINUUM_FLUX_PAIRS[0].from[0]);
          setGalaxyShipY(CONTINUUM_FLUX_PAIRS[0].from[1]);
        },
      },
      {
        id: 'starmap-holographic',
        category: 'Hyperspace & Starmap',
        title: 'Holographic Starmap (250 × 220 Quadrant)',
        desc: 'Interactive 2D galaxy map with flight trajectory calculation and territories.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Hyperspace');
          setIsStarmapOpen(true);
          setStarmapSelectedStarId(1);
        },
      },

      // 9. LANDING & PLANETARY SURFACE
      {
        id: 'landing-screen-picker',
        category: 'Landing & Surface',
        title: 'Landing: 2:1 Holographic Coordinate Picker',
        desc: 'Topographical 2:1 map projection with reticle crosshair and descent burn fuel.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setCurrentStarId(1);
          setOrbitPlanetIndex(1);
          setGameLocation('Landing');
          setLandingLat(15);
          setLandingLong(-30);
        },
      },
      {
        id: 'surface-rock-clear',
        category: 'Landing & Surface',
        title: 'Surface: Rock World (Clear Weather)',
        desc: 'Landed starship on hydraulic struts, terrain elevation relief, and rover ramp.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setCurrentStarId(1);
          setOrbitPlanetIndex(0);
          const p = currentPlanets[0];
          setCurrentSurfaceState(generatePlanetSurface(currentStar.x, currentStar.y, p));
          setGameLocation('On Planet');
        },
      },
      {
        id: 'surface-frozen-snow',
        category: 'Landing & Surface',
        title: 'Surface: Frozen World (Snowfall & Ice Crags)',
        desc: 'Glacial ice terrain with drifting snowflake weather particles.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          const fStar = UNIVERSE.stars.find((s) => s.planets.some((p) => p.type === 'Frozen')) || UNIVERSE.stars[0];
          setCurrentStarId(fStar.id);
          const pIdx = fStar.planets.findIndex((p) => p.type === 'Frozen');
          const p = fStar.planets[pIdx >= 0 ? pIdx : 0];
          setOrbitPlanetIndex(pIdx >= 0 ? pIdx : 0);
          setCurrentSurfaceState(generatePlanetSurface(fStar.x, fStar.y, p));
          setGameLocation('Terrain Vehicle');
          setVehicleX(2.0);
          setVehicleY(1.5);
        },
      },
      {
        id: 'surface-liquid-rain',
        category: 'Landing & Surface',
        title: 'Surface: Liquid Paradise World (Rainstorm)',
        desc: 'Terrestrial water oceans with angled rain streaks and alien flora.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setCurrentStarId(1);
          setOrbitPlanetIndex(1);
          const p = currentPlanets[1];
          setCurrentSurfaceState(generatePlanetSurface(currentStar.x, currentStar.y, p));
          setGameLocation('Terrain Vehicle');
          setVehicleX(1.8);
          setVehicleY(2.2);
        },
      },
      {
        id: 'surface-molten-lava',
        category: 'Landing & Surface',
        title: 'Surface: Molten Lava World (Fiery Fissures)',
        desc: 'Bubbling magma fissures and basaltic lava flow hazards.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          const mStar = UNIVERSE.stars.find((s) => s.planets.some((p) => p.type === 'Molten')) || UNIVERSE.stars[0];
          setCurrentStarId(mStar.id);
          const pIdx = mStar.planets.findIndex((p) => p.type === 'Molten');
          const p = mStar.planets[pIdx >= 0 ? pIdx : 0];
          setOrbitPlanetIndex(pIdx >= 0 ? pIdx : 0);
          setCurrentSurfaceState(generatePlanetSurface(mStar.x, mStar.y, p));
          setGameLocation('Terrain Vehicle');
          setVehicleX(1.0);
          setVehicleY(1.0);
        },
      },
      {
        id: 'rover-beside-mineral',
        category: 'Landing & Surface',
        title: 'Rover Beside Mineral Crystal Deposit',
        desc: '6-wheeled rover positioned beside a sparkling Endurium crystal node.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setCurrentStarId(1);
          setOrbitPlanetIndex(0);
          const p = currentPlanets[0];
          const surf = generatePlanetSurface(currentStar.x, currentStar.y, p);
          // Position rover and mineral deposit directly beside each other (offset +60px, -40px on screen => +1.58km, -1.05km at worldScale 38)
          const roverX = 2.0;
          const roverY = 2.0;
          const offsetKmX = 60 / 38; // +1.579 km
          const offsetKmY = -40 / 38; // -1.053 km
          surf.minerals = [
            { id: 'm-demo-1', name: 'Endurium', volume: 15.0, x: roverX + offsetKmX, y: roverY + offsetKmY, taken: false },
          ];
          setCurrentSurfaceState(surf);
          setGameLocation('Terrain Vehicle');
          setVehicleX(roverX);
          setVehicleY(roverY);
          setVehicleHeading(0.3);
        },
      },
      {
        id: 'rover-beside-ruin',
        category: 'Landing & Surface',
        title: 'Rover Beside Precursor Monolith Ruin',
        desc: 'Rover exploring an ancient Precursor architectural monolith.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setCurrentStarId(1);
          setOrbitPlanetIndex(0);
          const p = currentPlanets[0];
          const surf = generatePlanetSurface(currentStar.x, currentStar.y, p);
          surf.ruins = [
            {
              id: 'r-demo-1',
              name: 'Precursor Monolith',
              x: 2.5,
              y: 2.0,
              explored: false,
              artifactId: 'art-flat-device',
              loreTitle: 'ANCIENT DATA CITADEL',
              loreMessage: 'A towering obsidian spire pulsating with sub-quantum data circuits.',
            },
          ];
          setCurrentSurfaceState(surf);
          setGameLocation('Terrain Vehicle');
          setVehicleX(2.0);
          setVehicleY(2.0);
        },
      },
      {
        id: 'rover-beside-cargo',
        category: 'Landing & Surface',
        title: 'Rover Beside Dropped Cargo Canister',
        desc: 'Rover tractor beam positioned beside an abandoned cargo container.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setCurrentStarId(1);
          setOrbitPlanetIndex(0);
          const p = currentPlanets[0];
          const surf = generatePlanetSurface(currentStar.x, currentStar.y, p);
          surf.droppedCargo = [
            { id: 'c-demo-1', name: 'Emergency Supplies', type: 'mineral', volume: 10.0, value: 2000, x: 2.4, y: 1.5 },
          ];
          setCurrentSurfaceState(surf);
          setGameLocation('Terrain Vehicle');
          setVehicleX(2.0);
          setVehicleY(1.5);
        },
      },
      {
        id: 'rover-beside-lifeform-live',
        category: 'Landing & Surface',
        title: 'Rover Beside Active Living Lifeform',
        desc: 'Living biological specimen roaming on planetary terrain.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setCurrentStarId(1);
          setOrbitPlanetIndex(1);
          const p = currentPlanets[1];
          const surf = generatePlanetSurface(currentStar.x, currentStar.y, p);
          surf.lifeforms = [
            {
              id: 'lf-demo-1',
              speciesName: 'Chitinous Strider',
              size: 'Medium',
              volume: 2.5,
              color: '#34d399',
              temperament: 'passive',
              bountyValue: 3500,
              x: 2.4,
              y: 2.0,
              vx: 0,
              vy: 0,
              recorded: false,
              stunned: false,
              dead: false,
              captured: false,
            },
          ];
          setCurrentSurfaceState(surf);
          setGameLocation('Terrain Vehicle');
          setVehicleX(2.0);
          setVehicleY(2.0);
        },
      },
      {
        id: 'rover-beside-lifeform-stunned',
        category: 'Landing & Surface',
        title: 'Rover Beside Stunned Lifeform (Circling Stars)',
        desc: 'Incapacitated specimen with animated circling yellow stars ready for specimen cage.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setCurrentStarId(1);
          setOrbitPlanetIndex(1);
          const p = currentPlanets[1];
          const surf = generatePlanetSurface(currentStar.x, currentStar.y, p);
          surf.lifeforms = [
            {
              id: 'lf-demo-stun',
              speciesName: 'Bioluminescent Floater',
              size: 'Small',
              volume: 1.5,
              color: '#00f0ff',
              temperament: 'passive',
              bountyValue: 2800,
              x: 2.3,
              y: 2.0,
              vx: 0,
              vy: 0,
              recorded: false,
              stunned: true,
              dead: false,
              captured: false,
            },
          ];
          setCurrentSurfaceState(surf);
          setGameLocation('Terrain Vehicle');
          setVehicleX(2.0);
          setVehicleY(2.0);
        },
      },
      {
        id: 'rover-beside-lifeform-dead',
        category: 'Landing & Surface',
        title: 'Rover Beside Neutralized / Dead Lifeform',
        desc: 'Neutralized specimen lying flat on ground.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setCurrentStarId(1);
          setOrbitPlanetIndex(1);
          const p = currentPlanets[1];
          const surf = generatePlanetSurface(currentStar.x, currentStar.y, p);
          surf.lifeforms = [
            {
              id: 'lf-demo-dead',
              speciesName: 'Armored Land-Tortoise',
              size: 'Large',
              volume: 5.0,
              color: '#64748b',
              temperament: 'passive',
              bountyValue: 1200,
              x: 2.3,
              y: 2.0,
              vx: 0,
              vy: 0,
              recorded: false,
              stunned: false,
              dead: true,
              captured: false,
            },
          ];
          setCurrentSurfaceState(surf);
          setGameLocation('Terrain Vehicle');
          setVehicleX(2.0);
          setVehicleY(2.0);
        },
      },
      {
        id: 'surface-ruin-modal',
        category: 'Landing & Surface',
        title: 'Surface Ruin Discovery Lore Modal',
        desc: 'Archeological lore pop-up with Precursor artifact recovery notification.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Terrain Vehicle');
          setSurfaceRuinModal({
            id: 'ruin-demo-modal',
            name: 'Ancient Spire',
            x: 2.0,
            y: 2.0,
            explored: true,
            artifactId: 'art-crystal-cone',
            loreTitle: 'THE CRYSTAL SPIRE ARCHIVE',
            loreMessage: 'Decrypted glyphs reveal the ancient planetary coordinate of the Master Nexus at 15N 30W on the Crystal World.',
          });
        },
      },
      {
        id: 'surface-topo-map',
        category: 'Landing & Surface',
        title: 'Topographical Tactical Surface Radar Map',
        desc: 'Tactical topographical modal showing rover, landed ship, deposits, and ruins.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Terrain Vehicle');
          setIsSurfaceMapOpen(true);
        },
      },

      // 10. ENCOUNTERS & COMMS
      {
        id: 'encounter-elowan',
        category: 'Encounters & Comms',
        title: 'Encounter: Elowan Battle Group',
        desc: 'Sprout Freighter, Leaf Dart Scout, and Tri-Petal Arbor Cruiser on grid.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Elowan', 'Warship', 3);
        },
      },
      {
        id: 'encounter-thrynn',
        category: 'Encounters & Comms',
        title: 'Encounter: Thrynn Heavy Carapace Fleet',
        desc: 'Industrial Bronze Bulk Barge, Bronze Dagger, and Heavy Carapace Warship.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Thrynn', 'Warship', 3);
        },
      },
      {
        id: 'encounter-veloxi',
        category: 'Encounters & Comms',
        title: 'Encounter: Veloxi Hive Fleet',
        desc: 'Segmented Caterpillar Carrier, Hornet Interceptor, and Mantis Dreadnought.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Veloxi', 'Warship', 3);
        },
      },
      {
        id: 'encounter-veloxi-drone',
        category: 'Encounters & Comms',
        title: 'Encounter: Veloxi Sentry Turret',
        desc: 'Stationary octagonal defense turret with automated laser barrels.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Veloxi Drone', 'Drone', 2);
        },
      },
      {
        id: 'encounter-spemin',
        category: 'Encounters & Comms',
        title: 'Encounter: Spemin Protoplasmic Armada',
        desc: 'Fluid Sack Carrier, Jelly Pod Scout, and Multi-Lobed Amoebic Cruiser.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Spemin', 'Warship', 3);
        },
      },
      {
        id: 'encounter-gazurtoid',
        category: 'Encounters & Comms',
        title: 'Encounter: Gazurtoid Leviathan Battleship',
        desc: 'Colossal whale battleship with massive laser snout and Narwhal frigate.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Gazurtoid', 'Warship', 2);
        },
      },
      {
        id: 'encounter-uhlek',
        category: 'Encounters & Comms',
        title: 'Encounter: Uhlek Barbed Hive Cruisers',
        desc: '6-pointed barbed star hive cruisers crackling with dark matter plasma.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Uhlek', 'Warship', 3);
        },
      },
      {
        id: 'encounter-mechans',
        category: 'Encounters & Comms',
        title: 'Encounter: Mechans Cubic Surveillance Probe',
        desc: 'Isometric cubic probe with copper busbars and optical lens matrix.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Mechans', 'Scout', 2);
        },
      },
      {
        id: 'encounter-minstrels',
        category: 'Encounters & Comms',
        title: 'Encounter: Minstrels Harmonic Vessel',
        desc: 'Curved acoustic tuning-fork needle craft with vibrating strings.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Minstrels', 'Warship', 1);
        },
      },
      {
        id: 'encounter-nomad',
        category: 'Encounters & Comms',
        title: 'Encounter: Nomad Deep Space Probe',
        desc: 'Gold foil cylinder, solar panels, and parabolic high-gain dish.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Nomad', 'Scout', 1);
        },
      },
      {
        id: 'encounter-mysterions',
        category: 'Encounters & Comms',
        title: 'Encounter: Mysterions Iridescent Polyhedron',
        desc: 'Prismatic rotating non-Euclidean 8-pointed stellated star.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Mysterions', 'Warship', 1);
        },
      },
      {
        id: 'encounter-derelict',
        category: 'Encounters & Comms',
        title: 'Encounter: Noah 9 Derelict Colony Ship',
        desc: 'Shattered colonial transport hulk venting white plumes and emergency strobe.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Derelict', 'Transport', 1);
        },
      },
      {
        id: 'comms-screen-elowan',
        category: 'Encounters & Comms',
        title: 'Comms Screen: Elowan Botanical Elder',
        desc: 'Botanical elder portrait with amber eyes, leaf frills, and diplomatic topics.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Elowan', 'Warship', 1);
          setAlienCommsState((prev) => ({
            ...prev,
            active: true,
            connected: true,
            lastAlienSpeakerText: 'Peace and harmony upon your journey, starfarers of Arth.',
          }));
        },
      },
      {
        id: 'comms-screen-thrynn',
        category: 'Encounters & Comms',
        title: 'Comms Screen: Thrynn Reptilian Warlord',
        desc: 'Scaled reptilian warlord with slit eyes and hard bargaining posture.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Thrynn', 'Warship', 1);
          setAlienCommsState((prev) => ({
            ...prev,
            active: true,
            connected: true,
            lastAlienSpeakerText: 'State your profit margin or clear this trade corridor!',
          }));
        },
      },
      {
        id: 'comms-screen-veloxi-timer',
        category: 'Encounters & Comms',
        title: 'Comms Screen: Veloxi Mantis (Question Timer Ring)',
        desc: 'Insectoid mantis portrait with active 60s question countdown timer ring.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Veloxi', 'Warship', 1);
          setAlienCommsState((prev) => ({
            ...prev,
            active: true,
            connected: true,
            lastAlienSpeakerText: 'Does your ship carry authorization to cross Hive border sector 9?',
            pendingAlienQuestion: {
              text: 'Does your ship carry authorization to cross Hive border?',
              remindersLeft: 2,
              timer: 60,
            },
          }));
          setQuestionCountdownTimer(45);
          setQuestionTotalTime(60);
        },
      },
      {
        id: 'comms-screen-spemin',
        category: 'Encounters & Comms',
        title: 'Comms Screen: Spemin Jelly Empire',
        desc: 'Squishing jelly blob portrait and hilarious blustering threats.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Spemin', 'Warship', 1);
          setAlienCommsState((prev) => ({
            ...prev,
            active: true,
            connected: true,
            lastAlienSpeakerText: 'Tremble in terror, two-legged worms! The mighty Spemin command you!',
          }));
        },
      },
      {
        id: 'comms-screen-minstrels-osc',
        category: 'Encounters & Comms',
        title: 'Comms Screen: Minstrels Harmonic Oscilloscope',
        desc: 'Smooth harmonic oscilloscope waveform with golden harmonic nodes.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Minstrels', 'Warship', 1);
          setAlienCommsState((prev) => ({
            ...prev,
            active: true,
            connected: true,
            lastAlienSpeakerText: '♪ Hear the celestial melody of the ancient stars echoing in the void ♪',
          }));
        },
      },
      {
        id: 'comms-screen-nomad-telemetry',
        category: 'Encounters & Comms',
        title: 'Comms Screen: Nomad Probe Monospace Telemetry',
        desc: 'Calm 2 Hz monospace deep-space probe telemetry data packets.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Nomad', 'Scout', 1);
          setAlienCommsState((prev) => ({
            ...prev,
            active: true,
            connected: true,
            lastAlienSpeakerText: 'TRANSPONDER 342-B: AUTONOMOUS EXPLORATION TELEMETRY STREAMING.',
          }));
        },
      },
      {
        id: 'comms-screen-mysterions-kaleido',
        category: 'Encounters & Comms',
        title: 'Comms Screen: Mysterions Sacred Kaleidoscope',
        desc: 'Rotating shifting sacred geometry kaleidoscope of prismatic squares.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Mysterions', 'Warship', 1);
          setAlienCommsState((prev) => ({
            ...prev,
            active: true,
            connected: true,
            lastAlienSpeakerText: 'We exist across ten dimensions. The crystal cores are the harmonic nexus.',
          }));
        },
      },
      {
        id: 'comms-screen-noah9-crt',
        category: 'Encounters & Comms',
        title: 'Comms Screen: Noah 9 Amber CRT Colony Log',
        desc: 'Amber monochrome CRT scanline colony beacon sub-AI terminal.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Derelict', 'Transport', 1);
          setAlienCommsState((prev) => ({
            ...prev,
            active: true,
            connected: true,
            lastAlienSpeakerText: 'NOAH 9 AUTOMATED LOG: COLONIAL TRANSPORT COMPROMISED. BLACK BOX AVAILABLE.',
          }));
        },
      },
      {
        id: 'comms-screen-mechan-diplomat',
        category: 'Encounters & Comms',
        title: 'Comms Screen: Mechan Robot Diplomat Portrait',
        desc: 'Polished copper and brass automaton with glowing blue optical camera lenses and speaker matrix.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Mechans', 'Scout', 1);
          setAlienCommsState((prev) => ({
            ...prev,
            active: true,
            connected: true,
            lastAlienSpeakerText: 'BEEP. GREETINGS ARTH SURVEY VESSEL. MECHANICAL SERVITOR UNIT AWAITING OVERRIDE CODES.',
          }));
        },
      },

      // 11. COMBAT & ACTIONS
      {
        id: 'combat-shields-active',
        category: 'Combat & Actions',
        title: 'Combat: Active Shields & Ripple Waves',
        desc: 'Deflector shield forcefield bubble and expanding harmonic ripple waves.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Uhlek', 'Warship', 2);
          setShieldClass(5);
          setShieldsRaised(true);
          setPlayerShieldPoints(2500);
          setWeaponsArmed(true);
          setTacticalShieldRipples([
            { x: 0, y: 0, radius: 12, maxRadius: 24, life: 0.1, maxLife: 0.4, color: '#00f0ff', angle: 0 },
          ]);
        },
      },
      {
        id: 'combat-laser-beams',
        category: 'Combat & Actions',
        title: 'Combat: Pulse Laser Beams Firing',
        desc: 'Coherent cyan and crimson laser beams intersecting on tactical grid.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Thrynn', 'Warship', 2);
          setWeaponsArmed(true);
          setLaserClass(5);
          setProjectiles([
            {
              id: 'demo-laser-1',
              fromPlayer: true,
              type: 'laser',
              x: 0,
              y: 0,
              targetX: 0,
              targetY: 15,
              speed: 60,
              damage: 660,
              duration: 0.2,
              maxDuration: 0.2,
              color: '#00f0ff',
            },
            {
              id: 'demo-laser-2',
              fromPlayer: false,
              type: 'laser',
              x: 0,
              y: 15,
              targetX: 0,
              targetY: 0,
              speed: 60,
              damage: 300,
              duration: 0.2,
              maxDuration: 0.2,
              color: '#ff2244',
            },
          ]);
        },
      },
      {
        id: 'combat-missiles-smoke',
        category: 'Combat & Actions',
        title: 'Combat: Missiles with Smoke Trails',
        desc: 'Warhead projectiles in flight with billowing smoke particle trails.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Veloxi', 'Warship', 2);
          setWeaponsArmed(true);
          setMissileClass(5);
          setProjectiles([
            {
              id: 'demo-mis-1',
              fromPlayer: true,
              type: 'missile',
              x: 0,
              y: 5,
              targetX: 0,
              targetY: 16,
              speed: 10,
              damage: 1500,
              duration: 1.8,
              maxDuration: 2.5,
              color: '#ffb700',
            },
          ]);
          setMissileSmokeTrails([
            { x: 0, y: 1, vx: 0, vy: 0, size: 4, life: 0, maxLife: 0.6, alpha: 0.8 },
            { x: 0, y: 3, vx: 0, vy: 0, size: 5, life: 0, maxLife: 0.6, alpha: 0.7 },
          ]);
        },
      },
      {
        id: 'combat-uhlek-plasma-bolt',
        category: 'Combat & Actions',
        title: 'Combat: Uhlek Dark Matter Plasma Bolt',
        desc: 'Tracking purple dark matter plasma orb crackling with electric arcs.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Uhlek', 'Warship', 1);
          setProjectiles([
            {
              id: 'demo-plasma-1',
              fromPlayer: false,
              type: 'plasma',
              x: 0,
              y: 8,
              targetX: 0,
              targetY: 0,
              targetIsPlayer: true,
              speed: 14,
              damage: 4000,
              duration: 1.5,
              maxDuration: 2.0,
              color: '#d946ef',
            },
          ]);
        },
      },
      {
        id: 'combat-ship-explosion',
        category: 'Combat & Actions',
        title: 'Combat: Warship Explosion & Shockwave Ring',
        desc: 'Expanding fireball, shockwave blast ring, and molten armor sparks.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Spemin', 'Warship', 1);
          setTacticalExplosions([
            { x: 0, y: 14, radius: 18, maxRadius: 36, life: 0.2, maxLife: 0.8, color: '#f97316', shockwave: true },
          ]);
          setTacticalSparks(
            Array.from({ length: 16 }, () => ({
              x: 0,
              y: 14,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.5) * 12,
              life: 0,
              maxLife: 0.5,
              color: '#facc15',
              size: 2,
            })),
          );
        },
      },
      {
        id: 'combat-tractor-salvage',
        category: 'Combat & Actions',
        title: 'Combat: Tractor-Beam Wreck Salvage Stream',
        desc: 'Auto tractor beam lock stream pulling fuel and mineral canisters from wreck.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Thrynn', 'Warship', 1);
          if (activeEncounterGroup?.ships[0]) {
            activeEncounterGroup.ships[0].isWreck = true;
            activeEncounterGroup.ships[0].looted = true;
          }
          setTractorSalvageFx({
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 1.2,
            timer: 2.0,
            text: '+25.0m³ Endurium Fuel • +12.0m³ Titanium',
          });
        },
      },
      {
        id: 'combat-hull-breach-alarm',
        category: 'Combat & Actions',
        title: 'Combat: Hull Breach Imminent Critical Alarm',
        desc: 'Armor destroyed, hull integrity below 50, and pulsing red vignette flash.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          handleDevSpawnAlienEncounter('Uhlek', 'Warship', 2);
          setPlayerArmorPoints(0);
          setPlayerShieldPoints(0);
          setShieldsRaised(false);
          setHullIntegrity(40);
          setRedVignetteFlash(1.0);
          setScreenShake(1.5);
        },
      },

      // 12. STORY MILESTONES & SPECIAL STATES
      {
        id: 'milestone-casualty-succession',
        category: 'Story Milestones',
        title: 'Milestone: Crew Casualty & Command Succession',
        desc: 'Deceased crew portrait memoriam badge and automated field promotion.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setCrewRoster((prev) =>
            prev.map((c, i) => (i === 0 ? { ...c, alive: false, vitality: 0 } : c)),
          );
          setGameLocation('Star System');
          setActiveConsoleMenu('Bridge');
          addMessage('COMMAND SUCCESSION: Unit 9-Vector designated acting Captain.', undefined, 'info');
        },
      },
      {
        id: 'milestone-solar-flare-shockwave',
        category: 'Story Milestones',
        title: 'Milestone: Solar Flare Coronal Shockwave (T-15 Days)',
        desc: 'Unstable star pulsating expanding plasma shockwaves across star system.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setGameLocation('Star System');
          const unstableStar = UNIVERSE.stars.find((s) => s.flareDay !== undefined) || UNIVERSE.stars[0];
          setCurrentStarId(unstableStar.id);
          const fDay = unstableStar.flareDay || 50;
          setStardateDay(Math.max(1, fDay - 10));
          setStardateMonth(1);
          setStardateYear(4620);
          setSystemShipX(-80);
          setSystemShipY(90);
        },
      },
      {
        id: 'milestone-crystal-planet-heat',
        category: 'Story Milestones',
        title: 'Milestone: Crystal Planet Lethal Thermal Radiation',
        desc: 'Thermal distortion waves, hazard alarm, and 1,840°K scorching hull warning.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          const cStar = UNIVERSE.stars.find((s) => s.x === 192 && s.y === 152) || UNIVERSE.stars[0];
          setCurrentStarId(cStar.id);
          setGameLocation('Star System');
          setSystemShipX(0);
          setSystemShipY(0);
          // Remove crystal orb to trigger heat warning
          setArtifactsInHold((prev) => prev.filter((a) => !a.realName.includes('Crystal Orb')));
        },
      },
      {
        id: 'milestone-black-egg-countdown',
        category: 'Story Milestones',
        title: 'Milestone: Black Egg Armed Planetary Seismic Countdown',
        desc: 'Expanding red seismic rings and top screen antimatter detonation alarm.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          setCurrentStarId(1);
          setOrbitPlanetIndex(0);
          const p = currentPlanets[0];
          const surf = generatePlanetSurface(currentStar.x, currentStar.y, p);
          surf.droppedCargo = [
            {
              id: 'demo-armed-egg',
              name: 'The Black Egg [ARMED]',
              type: 'artifact',
              volume: 5.0,
              value: 100000,
              x: 2.0,
              y: 2.0,
              isArmed: true,
              artifactRef: CANONICAL_ARTIFACTS.find((a) => a.id === 'black-egg' || a.id === 'art-black-egg'),
            },
          ];
          setCurrentSurfaceState(surf);
          setGameLocation('Terrain Vehicle');
          setVehicleX(2.0);
          setVehicleY(2.0);
        },
      },
      {
        id: 'milestone-nexus-ruin',
        category: 'Story Milestones',
        title: 'Milestone: Control Nexus Precursor Structure',
        desc: 'Master Crystalline Control Nexus monolith located on the Crystal World.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'PLAYING', score: 100, level: 1 });
          const cStar = UNIVERSE.stars.find((s) => s.x === 192 && s.y === 152) || UNIVERSE.stars[0];
          setCurrentStarId(cStar.id);
          setOrbitPlanetIndex(0);
          const p = cStar.planets[0];
          const surf = generatePlanetSurface(192, 152, p);
          surf.ruins = [
            {
              id: 'nexus-demo-ruin',
              name: 'Master Control Nexus',
              x: 2.2,
              y: 1.8,
              explored: false,
              isControlNexus: true,
              loreTitle: 'PRECURSOR CONTROL NEXUS',
              loreMessage: 'The ancient Crystalline Nexus that controls all quadrant solar flares.',
            },
          ];
          setCurrentSurfaceState(surf);
          setGameLocation('Terrain Vehicle');
          setVehicleX(2.0);
          setVehicleY(1.8);
        },
      },
      {
        id: 'story-victory-plaque',
        category: 'Story Milestones',
        title: 'Story Climax: Victory Commendation Plaque',
        desc: 'Official gold seal commendation plaque, campaign stats, and fanfare.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'VICTORY', score: 9999, level: 1 });
          setFlaresStopped(true);
          setVictorySequenceModal(true);
        },
      },
      {
        id: 'story-game-over-flare',
        category: 'Story Milestones',
        title: 'Story Climax: Solar Flare Incineration Game Over',
        desc: 'Catastrophic solar flare engulfing vessel with poignant crew epitaph.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'GAME_OVER', score: 100, level: 1 });
          setGameOverModal({
            title: 'GAME OVER: INCINERATED',
            desc: 'Star Arth flared catastrophically! Superheated solar plasma incinerated your starship.',
            poignantLine: 'The star ignited in blinding brilliance. Across the void, Arth registers one more lost system.',
          });
        },
      },
      {
        id: 'story-game-over-destroyed',
        category: 'Story Milestones',
        title: 'Story Climax: Starship Destroyed Game Over Screen',
        desc: 'Vessel hull destroyed by hostile weapons fire.',
        apply: () => {
          resetAllModalsForGallery();
          setGameState({ status: 'GAME_OVER', score: 100, level: 1 });
          setGameOverModal({
            title: 'STARSHIP DESTROYED',
            desc: 'Your vessel hull was completely obliterated by hostile fire.',
            poignantLine: 'Captain... structural containment has failed. It has been an honor serving with you among the stars.',
          });
        },
      },
    ];
  }, [
    resetAllModalsForGallery,
    currentStar,
    currentPlanets,
    evaluations,
    alienCommsState.dialogueHistory,
    activeEncounterGroup,
    handleDevRevealAllFluxLinks,
    handleDevSpawnAlienEncounter,
  ]);

  // Apply Scene from Gallery with devUsed marker
  const applyGalleryScene = useCallback(
    (index: number, closeDevPanel = false) => {
      const safeIdx = Math.max(0, Math.min(GALLERY_SCENES.length - 1, index));
      const targetScene = GALLERY_SCENES[safeIdx];
      if (!targetScene) return;

      setGalleryActiveIndex(safeIdx);
      targetScene.apply();
      markDevAction(`Loaded Gallery Scene #${safeIdx + 1}: ${targetScene.title}`);

      if (closeDevPanel) {
        setIsDevPanelOpen(false);
      }
    },
    [GALLERY_SCENES, markDevAction],
  );

  // Filtered gallery scenes based on search & category
  const filteredGalleryScenes = useMemo(() => {
    return GALLERY_SCENES.map((scene, originalIndex) => ({ scene, originalIndex })).filter(({ scene }) => {
      const matchCat = gallerySelectedCategory === 'ALL' || scene.category === gallerySelectedCategory;
      const matchQuery =
        !gallerySearchQuery.trim() ||
        scene.title.toLowerCase().includes(gallerySearchQuery.toLowerCase()) ||
        scene.desc.toLowerCase().includes(gallerySearchQuery.toLowerCase()) ||
        scene.category.toLowerCase().includes(gallerySearchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [GALLERY_SCENES, gallerySelectedCategory, gallerySearchQuery]);

  const galleryCategories = useMemo(() => {
    const cats = Array.from(new Set(GALLERY_SCENES.map((s) => s.category)));
    return ['ALL', ...cats];
  }, [GALLERY_SCENES]);

  // A location change must not inherit the bottom of a long Science/landing panel.
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      const layout=document.querySelector<HTMLElement>('[data-flight-layout]');if(layout)layout.scrollTop=0;
      const consolePanel=document.querySelector<HTMLElement>('.bridge-console-panel');if(consolePanel)consolePanel.scrollTop=0;
    });
    return ()=>cancelAnimationFrame(frame);
  },[gameLocation]);
  // Blocking surface dialogs freeze hazards and reject background driving/actions.
  const isSurfaceDialogOpen = isSurfaceMapOpen || !!surfaceRuinModal || roverCargoModalOpen || !!roverLookData;
  const isSimulationPaused = isGameMenuOpen || isStarmapOpen || !!gameOverModal || !!victorySequenceModal ||
    isDevPanelOpen || isShipsLogOpen || isImportModalOpen || isExportModalOpen || introPage !== 0 || isSurfaceDialogOpen || isPromptingDistress || !!replacementMission;
  useEffect(() => {
    if(gameState.status!=='PLAYING'||isSimulationPaused||!['launch','dock'].includes(cinematicState))bayVideoPlayer.stop();
    const pauseHidden=()=>{if(document.hidden)bayVideoPlayer.pause();};
    document.addEventListener('visibilitychange',pauseHidden);
    return ()=>document.removeEventListener('visibilitychange',pauseHidden);
  }, [bayVideoPlayer,gameState.status,isSimulationPaused,cinematicState]);
  useEffect(() => {
    if (!isSimulationPaused) return;
    for (const key of Object.keys(heldKeysRef.current)) delete heldKeysRef.current[key];
    combatInputBufferRef.current = null;
    encounterDriveRef.current = stoppedEncounterDrive();
    setActiveDirectionVector({ dx: 0, dy: 0 });
    setAstronautVx(0);
    setAstronautVy(0);
    setIsRoverMoving(false);
  }, [isSimulationPaused]);

  const orbitalScanKey=gameLocation==='In Orbit' && orbitPlanetIndex!==null ? scanPlanetKey(currentStar.id,currentPlanets[orbitPlanetIndex]?.slot) : null;
  useEffect(()=>{
    if(planetaryScanRef.current && planetaryScanRef.current.planetKey!==orbitalScanKey)updatePlanetaryScan(null);
  },[orbitalScanKey,updatePlanetaryScan]);
  // Crew healing updates the message callback during a sweep. Keep the clock
  // stable and read the latest callback/data instead of restarting its interval.
  const planetaryScanTickRef=useRef<(dt:number)=>void>(()=>{});
  planetaryScanTickRef.current=(dt:number)=>{
      const scan=planetaryScanRef.current;
      if(!scan || scan.planetKey!==orbitalScanKey || scanReady(scan))return;
      if(subsystems.Sensors<=0 || inoperativeSystems.Sensors){updatePlanetaryScan(null);setScienceReading('Sensor sweep interrupted: sensors are inoperative.');return;}
      const next=advancePlanetScan(scan,dt);updatePlanetaryScan(next);
      if(scanReady(next)){
        const p=currentPlanets[orbitPlanetIndex!];
        const ruinsKnown=hasRedCylinder?RUIN_LORE_DATABASE.filter(r=>r.starX===currentStar.x&&r.starY===currentStar.y&&r.planetOrderIndex===p.orderIndex):[];
        let overlay=hasRedCylinder ? (ruinsKnown.length?' • RED CYLINDER OVERLAY: '+ruinsKnown.map(r=>`[${r.title} at ${r.lat!==undefined?`${r.lat}N ${r.long}W`:'Surface'}]`).join(', '):' • RED CYLINDER OVERLAY: No subterranean precursor ruins detected on this body.') : '';
        if(hasCrystalCone&&currentStar.x===192&&currentStar.y===152&&p.orderIndex===0)overlay+=' • CRYSTAL CONE HARMONICS: Control Nexus pinpointed at 15N 30W!';
        const text='SENSOR READING: '+p.name+' • '+planetSensorSummary(p)+overlay;
        setScienceReading(text);gameAudio.playDataChime();addMessage(text,'Science Officer','info');
      }
  };
  useEffect(()=>{
    if(isSimulationPaused || !orbitalScanKey)return;
    let previous=performance.now();
    const timer=window.setInterval(()=>{
      const now=performance.now(),dt=Math.min(.25,(now-previous)/1000);previous=now;
      planetaryScanTickRef.current(dt);
    },100);
    return ()=>window.clearInterval(timer);
  },[isSimulationPaused,orbitalScanKey]);

  useEffect(()=>{
    const sync=()=>gameAudio.setMiningLaser(!!miningSession && gameLocation==='Terrain Vehicle' && !vehicleDestroyed && !isSimulationPaused && !document.hidden);
    sync();document.addEventListener('visibilitychange',sync);
    return ()=>{document.removeEventListener('visibilitychange',sync);gameAudio.setMiningLaser(false);};
  },[!!miningSession,gameLocation,vehicleDestroyed,isSimulationPaused]);

  useEffect(()=>{
    let frame=0;
    const sync=()=>{
      const active=gameState.status==='PLAYING'&&cinematicStateRef.current==='launch'&&!isSimulationPaused&&!document.hidden&&bayReady();
      gameAudio.syncBayLaunch(active,cinematicProgress(cinematicTimerRef.current,cinematicDurationRef.current),cinematicDurationRef.current,voiceEngine.isPlaying()&&!voiceEngine.getMuted()&&voiceEngine.getVolume()>0);
      gameAudio.syncBayArrival(gameState.status==='PLAYING'&&cinematicStateRef.current==='dock'&&!isSimulationPaused&&!document.hidden&&bayReady(),cinematicProgress(cinematicTimerRef.current,cinematicDurationRef.current),cinematicDurationRef.current,voiceEngine.isPlaying()&&!voiceEngine.getMuted()&&voiceEngine.getVolume()>0);
    };
    const tick=()=>{sync();frame=requestAnimationFrame(tick);};tick();
    document.addEventListener('visibilitychange',sync);
    return ()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',sync);gameAudio.syncBayLaunch(false,0,8);gameAudio.syncBayArrival(false,0,8);};
  },[isSimulationPaused,gameState.status]);

  // Keyboard and Input Handling
  useEffect(() => {
    const keysHeld = heldKeysRef.current;

    const updateDirectionFromKeys = () => {
      if (isSimulationPaused) return;
      const isSpaceManeuver =
        (activeConsoleMenu === 'Maneuver' &&
          (gameLocation === 'Star System' || gameLocation === 'Hyperspace' || gameLocation === 'Encounter')) ||
        gameLocation === 'Terrain Vehicle';

      if (!isSpaceManeuver) return;

      let dx = 0;
      let dy = 0;

      if (keysHeld['ArrowUp'] || keysHeld['w'] || keysHeld['W'] || keysHeld['8']) dy -= 1;
      if (keysHeld['ArrowDown'] || keysHeld['s'] || keysHeld['S'] || keysHeld['2']) dy += 1;
      if (keysHeld['ArrowLeft'] || keysHeld['a'] || keysHeld['A'] || keysHeld['4']) dx -= 1;
      if (keysHeld['ArrowRight'] || keysHeld['d'] || keysHeld['D'] || keysHeld['6']) dx += 1;

      if (dx !== 0 || dy !== 0) {
        setRoverWaypoint(null);
      }

      setActiveDirectionVector({ dx: Math.sign(dx), dy: Math.sign(dy) });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' ||
          target.isContentEditable);

      // DEV PANEL SHORTCUT: Ctrl+Shift+D or Cmd+Shift+D (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsDevPanelOpen((prev) => !prev);
        gameAudio.playConfirmSelect();
        return;
      }

      // In any input or textarea, permit all native editing shortcuts (Ctrl/Cmd+A, C, V, X, Z, Backspace, Delete, Arrows)
      // without game listeners intercepting or appending shortcut letters.
      if (isInput) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (controlOwnsKey(e.target,e.key)) return;

      if (gameStateRef.current.status !== 'PLAYING' || gameOverModal || victorySequenceModal) return;

      if (isDevPanelOpen && e.key === 'Escape') {
        e.preventDefault();
        setIsDevPanelOpen(false);
        return;
      }

      if (isSimulationPaused && !['p', 'P', 'Escape'].includes(e.key)) return;
      if (!isSimulationPaused) keysHeld[e.key] = true;

      // Star System View Zoom Controls (+ / - keys)
      if (gameLocation === 'Star System') {
        if (e.key === '+' || e.key === '=' || e.key === 'Add') {
          e.preventDefault();
          setSystemZoom((z) => Math.min(8.0, +(z * 1.35).toFixed(2)));
          gameAudio.playHoverMicroTone();
          return;
        }
        if (e.key === '-' || e.key === '_' || e.key === 'Subtract') {
          e.preventDefault();
          setSystemZoom((z) => Math.max(0.65, +(z / 1.35).toFixed(2)));
          gameAudio.playHoverMicroTone();
          return;
        }
      }

      // Hyperspace View Zoom Controls (+ / - keys)
      if (gameLocation === 'Hyperspace') {
        if (e.key === '+' || e.key === '=' || e.key === 'Add') {
          e.preventDefault();
          setHyperZoom((z) => Math.min(6.0, +(z * 1.25).toFixed(2)));
          gameAudio.playHoverMicroTone();
          return;
        }
        if (e.key === '-' || e.key === '_' || e.key === 'Subtract') {
          e.preventDefault();
          setHyperZoom((z) => Math.max(1.0, +(z / 1.25).toFixed(2)));
          gameAudio.playHoverMicroTone();
          return;
        }
      }

      // Universal Pause toggle on 'p', 'P', or 'Escape' across all gameplay screens & states
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (gameStateRef.current.status === 'PLAYING') {
          e.preventDefault();
          setIsGameMenuOpen((prev) => {
            const next = !prev;
            if (next) {
              setPauseMenuTab('main');
            }
            return next;
          });
          gameAudio.playCrispClick();
          return;
        }
      }

      if (isSimulationPaused) return;

      // Surface Terrain Vehicle Shortcuts
      if (gameLocation === 'Terrain Vehicle') {
        if(e.key.toLowerCase()==='g') {e.preventDefault();if(!e.repeat)startMining();return;}
        const command = roverCommand(e.key);
        if (command === 'fire') {
          e.preventDefault();
          handleFireSurfaceWeapon();
          return;
        }
        if (command === 'cargo') {
          e.preventDefault();
          handleCollectNearby();
          return;
        }
        if (command === 'look') {
          e.preventDefault();
          handleRoverLook();
          return;
        }
        if (command === 'scan') {
          e.preventDefault();
          handleSurfaceScan();
          return;
        }
        if (command === 'map') {
          e.preventDefault();
          setIsSurfaceMapOpen((prev) => !prev);
          return;
        }
        if (command === 'weapon') {
          e.preventDefault();
          setRoverWeaponMenuOpen((prev) => !prev);
          return;
        }
        if (command === 'move') {
          e.preventDefault();
          addMessage('Drive Mode Active: Use WASD / Arrow keys to steer vehicle.', 'Captain', 'info');
          gameAudio.playCrispClick();
          return;
        }
        if (command === 'board' && Math.hypot(vehicleX, vehicleY) <= 1.5) {
          e.preventDefault();
          handleBoardStarship();
          return;
        }
      }

      // Encounter Grid Navigation / Weapon Shortcuts
      if (gameLocation === 'Encounter' && activeEncounterGroup) {
        if (e.key === 'Tab' || e.key === 't' || e.key === 'T') {
          e.preventDefault();
          handleCycleTarget();
          return;
        }

        // Discrete single keypress registration for combat movement (Arrow keys / WASD / 1-9 numpad)
        // Up decreases Y (moves UP screen), Down increases Y (moves DOWN screen)
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === '8') dy -= 1;
        else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === '2') dy += 1;
        else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === '4') dx -= 1;
        else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === '6') dx += 1;
        else if (e.key === '7') { dx = -1; dy = -1; }
        else if (e.key === '9') { dx = 1; dy = -1; }
        else if (e.key === '1') { dx = -1; dy = 1; }
        else if (e.key === '3') { dx = 1; dy = 1; }

        if ((dx !== 0 || dy !== 0) && !(e.repeat && activeConsoleMenu === 'Maneuver')) {
          combatInputBufferRef.current = { dx, dy };
          setShipHeading(Math.atan2(dy, dx));
        }
      }

      // Concourse Movement
      if (
        gameStateRef.current.status === 'PLAYING' &&
        gameLocation === 'Starport' &&
        activeRoomIndex === null &&
        cinematicState === 'none' &&
        introPage === 0 &&
        !isGameMenuOpen
      ) {
        if(isConcourseMoveKey(e.key)){setAstronautIdleTimer(0);setClickMoveTarget(null);}

        let vx = 0;
        let vy = 0;
        if (keysHeld['ArrowLeft'] || keysHeld['a'] || keysHeld['A']) vx -= 220;
        if (keysHeld['ArrowRight'] || keysHeld['d'] || keysHeld['D']) vx += 220;
        if (keysHeld['ArrowUp'] || keysHeld['w'] || keysHeld['W']) vy -= 170;
        if (keysHeld['ArrowDown'] || keysHeld['s'] || keysHeld['S']) vy += 170;

        setAstronautVx(vx);
        setAstronautVy(vy);

        if (vx !== 0 || vy !== 0) {
          if (vx > 0 && vy === 0) setAstronautFacing('E');
          else if (vx < 0 && vy === 0) setAstronautFacing('W');
          else if (vx === 0 && vy < 0) setAstronautFacing('N');
          else if (vx === 0 && vy > 0) setAstronautFacing('S');
          else if (vx > 0 && vy < 0) setAstronautFacing('NE');
          else if (vx > 0 && vy > 0) setAstronautFacing('SE');
          else if (vx < 0 && vy < 0) setAstronautFacing('NW');
          else if (vx < 0 && vy > 0) setAstronautFacing('SW');
        }

        if (e.key === 'Enter' || e.key === ' ') {
          if (nearbyConcourseDoor) {
            handleEnterDoor(nearbyConcourseDoor.index);
          }
        }
      }

      // Cinematic Skip
      if (cinematicStateRef.current !== 'none' && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) {
        const curCin = cinematicStateRef.current;
        if (curCin === 'launch') completeLaunchToSpace();
        else if (curCin === 'dock') completeDockingToStarport();
        else if (curCin === 'descent') completeDescentToPlanet();
        else if (curCin === 'surface_launch') completeSurfaceLaunchToOrbit();
        return;
      }

      updateDirectionFromKeys();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      delete keysHeld[e.key];
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isInput) {
        updateDirectionFromKeys();
        return;
      }

      delete keysHeld[e.key];
      if (gameLocation === 'Starport' && activeRoomIndex === null) {
        let vx = 0;
        let vy = 0;
        if (keysHeld['ArrowLeft'] || keysHeld['a'] || keysHeld['A']) vx -= 220;
        if (keysHeld['ArrowRight'] || keysHeld['d'] || keysHeld['D']) vx += 220;
        if (keysHeld['ArrowUp'] || keysHeld['w'] || keysHeld['W']) vy -= 170;
        if (keysHeld['ArrowDown'] || keysHeld['s'] || keysHeld['S']) vy += 170;
        setAstronautVx(vx);
        setAstronautVy(vy);
      }
      updateDirectionFromKeys();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    const clearHeldInput = () => {
      for (const key of Object.keys(keysHeld)) delete keysHeld[key];
      setActiveDirectionVector({ dx: 0, dy: 0 });
      setAstronautVx(0);
      setAstronautVy(0);
      setShipVx(0);
      setShipVy(0);
    };
    window.addEventListener('blur', clearHeldInput);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearHeldInput);
    };
  }, [
    isSimulationPaused,
    gameOverModal,
    victorySequenceModal,
    activeRoomIndex,
    activeConsoleMenu,
    gameLocation,
    activeEncounterGroup,
    isGameMenuOpen,
    astronautX,
    introPage,
    handleCycleTarget,
    stopManeuver,
    isDevPanelOpen,
    isShipsLogOpen,
    isStarmapOpen,
    isImportModalOpen,
    isExportModalOpen,
    cinematicState,
    handleFireSurfaceWeapon,
    startMining,
    handleCollectNearby,
    handleRoverLook,
    handleSurfaceScan,
    handleBoardStarship,
    vehicleX,
    vehicleY,
    nearbyConcourseDoor,
    handleEnterDoor,
    completeLaunchToSpace,
    completeDockingToStarport,
    completeDescentToPlanet,
    completeSurfaceLaunchToOrbit,
  ]);

  // Simulation Update Tick (60 FPS Fixed Stepper)
  const update = (dt: number) => {
    const surfaceWeatherParticles=surfaceWeatherParticlesFrameRef.current;
    const surfaceSonarPulse=surfaceSonarPulseFrameRef.current;
    const surfaceScanFadeTimer=surfaceScanFadeTimerFrameRef.current;
    const tractorBeamFx=tractorBeamFxFrameRef.current;
    const starFlareParticles=starFlareParticlesFrameRef.current;
    const fluxFlashTimer=fluxFlashTimerFrameRef.current;
    const tacticalSparks=tacticalSparksFrameRef.current;
    const tacticalExplosions=tacticalExplosionsFrameRef.current;
    const tacticalShieldRipples=tacticalShieldRipplesFrameRef.current;
    const missileSmokeTrails=missileSmokeTrailsFrameRef.current;
    const tractorSalvageFx=tractorSalvageFxFrameRef.current;
    const vehicleHold = vehicleHoldFrameRef.current;
    const crewRoster = crewRosterFrameRef.current;
    const subsystems = subsystemsFrameRef.current;
    const activeRepairTask = activeRepairTaskFrameRef.current;
    const projectiles = projectilesFrameRef.current;
    const encounterShipPos = encounterShipPosFrameRef.current;
    const encounterCooldownTimer = encounterCooldownTimerFrameRef.current;
    const laserCooldown = laserCooldownFrameRef.current;
    const missileCooldown = missileCooldownFrameRef.current;
    const questionCountdownTimer = questionCountdownTimerFrameRef.current;
    const hullIntegrity = hullIntegrityFrameRef.current;
    const playerArmorPoints = playerArmorPointsFrameRef.current;
    const playerShieldPoints = playerShieldPointsFrameRef.current;
    if (gameStateRef.current.status !== 'PLAYING') return;
    // A fixed-step batch can continue before React commits the new location.
    // Once arrival snaps the ship to its star, discard the old hyperspace steps.
    if (gameLocation === 'Hyperspace' && hyperspaceEnteringRef.current) return;
    const cargoHold = cargoHoldFrameRef.current;
    const systemShipX = systemShipXFrameRef.current;
    const systemShipY = systemShipYFrameRef.current;
    const shipVx = shipVxFrameRef.current;
    const shipVy = shipVyFrameRef.current;
    const shipHeading = shipHeadingFrameRef.current;
    const enduriumFuel = enduriumFuelFrameRef.current;
    const galaxyShipX = galaxyShipXFrameRef.current;
    const galaxyShipY = galaxyShipYFrameRef.current;
    const orbitAnimPhase = orbitAnimPhaseFrameRef.current;
    const currentPlanets=survivingPlanets(currentStar.planets,currentStar.x,currentStar.y,destroyedPlanetKeys).map(p=>({...p,...systemPlanetPosition(p,orbitAnimPhase/.4)}));
    const orbitTransitionProgress = orbitTransitionProgressFrameRef.current;
    const radarScanAngle = radarScanAngleFrameRef.current;
    const warpStreakParticles = warpStreakParticlesFrameRef.current;
    const commsTypewriterElapsed = commsTypewriterElapsedFrameRef.current;
    const alienEyeBlinkTimer = alienEyeBlinkTimerFrameRef.current;
    const astronautX = astronautXFrameRef.current;
    const astronautY = astronautYFrameRef.current;
    const astronautVx = astronautVxFrameRef.current;
    const astronautVy = astronautVyFrameRef.current;
    const astronautFacing = astronautFacingFrameRef.current;
    const astronautScaleX = astronautScaleXFrameRef.current;
    const astronautAnimFrame = astronautAnimFrameFrameRef.current;
    const astronautIdleTimer = astronautIdleTimerFrameRef.current;
    const astronautDistanceTraveled = astronautDistanceTraveledFrameRef.current;
    const ambientScrubbots = ambientScrubbotsFrameRef.current;
    const hangarSparks = hangarSparksFrameRef.current;
    const transporterParticles = transporterParticlesFrameRef.current;
    const vehicleX = vehicleXFrameRef.current;
    const vehicleY = vehicleYFrameRef.current;
    const vehicleHeading = vehicleHeadingFrameRef.current;
    const vehicleFuel = vehicleFuelFrameRef.current;
    const surfaceWeaponBeam=surfaceWeaponBeamRef.current;
    const roverSuspensionBounce = roverSuspensionBounceFrameRef.current;
    const roverTireTracks = roverTireTracksFrameRef.current;
    const roverDustParticles = roverDustParticlesFrameRef.current;
    const screenShake = screenShakeFrameRef.current;
    const redVignetteFlash = redVignetteFlashFrameRef.current;
    const nowSec = performance.now() / 1000;
    if (fluxFlashTimer > 0) setFluxFlashTimer((t) => Math.max(0, t - dt));
    if (fluxDisorientationTimerRef.current > 0) {
      const prevDisorient = fluxDisorientationTimerRef.current;
      const nextDisorient = Math.max(0, prevDisorient - dt);
      setFluxDisorientationTimer(nextDisorient);

      scrambledTimerRef.current += dt;
      if (scrambledTimerRef.current >= 0.1) {
        scrambledTimerRef.current = 0;
        setScrambledCoords({
          x: Math.floor(Math.random() * 899 + 100),
          y: Math.floor(Math.random() * 899 + 100),
        });
      }

      if (prevDisorient > 0 && nextDisorient === 0) {
        addMessage('Navigator: Bearings recovered. Telemetry navigational lock restored.', 'Navigator', 'info');
      }
    }
    if (encounterCooldownTimer > 0) setEncounterCooldownTimer((t) => Math.max(0, t - dt));
    if (laserCooldown > 0) setLaserCooldown((t) => Math.max(0, t - dt));
    if (missileCooldown > 0) setMissileCooldown((t) => Math.max(0, t - dt));
    if (screenShake > 0) setScreenShake((s) => Math.max(0, s - dt * 2.5));
    if (encounterBannerTimer > 0) setEncounterBannerTimer((t) => Math.max(0, t - dt));
    if (surfaceScanFadeTimer > 0) setSurfaceScanFadeTimer((t) => Math.max(0, t - dt));
    if (screenWhiteFlashTimer > 0) setScreenWhiteFlashTimer((t) => Math.max(0, t - dt));

    const countdown = detonationSequenceRef.current;
    if (countdown) {
      const advanced = advanceDetonation(countdown, dt);
      setDetonationSequence(advanced.sequence);
      for (const event of advanced.events) {
        if (event === 'signal') addMessage('Captain, we are receiving a countdown transmission from the Black Egg...', 'Captain', 'alert');
        else if (event === 'blast') {
          addMessage('Boom!', 'Captain', 'alert');
          gameAudio.playChiptuneExplosion();
          setScreenWhiteFlashTimer(3);
        } else if (event === 'resolve') {
          resolveDetonation(countdown.target);
          return;
        } else {
          addMessage(`${event}...`, 'Captain', 'alert');
          gameAudio.playHoverMicroTone();
        }
      }
    }

    // Hand Test 16: Crystal Planet Orbit Heat Ticker
    const isOrbitingCrystalPlanet =
      gameLocation === 'In Orbit' &&
      currentStar.x === 192 &&
      currentStar.y === 152 &&
      orbitPlanetIndex === 0;

    if (isOrbitingCrystalPlanet && !hasCrystalOrb && !gameOverModal && !victorySequenceModal) {
      const heatInterval = devHeatX10 ? 0.2 : 2.0; // 2 seconds normal, 0.2s for 10x
      const heat=advanceCrystalHeat({ticks:crystalHeatTicksFrameRef.current,remainder:crystalHeatAccumulatorRef.current},dt,heatInterval);
      crystalHeatAccumulatorRef.current=heat.remainder;
      setCrystalHeatTicks(heat.ticks);
      for(const nextTick of heat.pulses) {

          // Each tick: random subsystem loses 3 points
          const subKeys: SubsystemKey[] = ['Engines', 'Sensors', 'Comms', 'Shields', 'Missiles', 'Lasers'];
          const randSub = subKeys[Math.floor(Math.random() * subKeys.length)];
          setSubsystems((prev) => ({
            ...prev,
            [randSub]: Math.max(0, prev[randSub] - 3),
          }));

          if (nextTick === 70) {
            addMessage("The hull temperature is increasing!", 'Captain', 'alert');
            setHullIntegrity((h) => Math.floor(h / 2));
            gameAudio.playLavaAlarm();
          } else if (nextTick === 140) {
            addMessage("The hull is glowing red!", 'Captain', 'alert');
            setHullIntegrity((h) => Math.floor(h / 2));
            gameAudio.playLavaAlarm();
          } else if (nextTick === 210) {
            addMessage("The hull is melting!", 'Captain', 'alert');
            setHullIntegrity((h) => Math.floor(h / 2));
            gameAudio.playLavaAlarm();
          }
      }
      if(heat.ticks>=280 && !crystalHeatDefeatTriggeredRef.current) {
            crystalHeatDefeatTriggeredRef.current=true;
            setHullIntegrity(0);
            gameAudio.playChiptuneExplosion();
            gameAudio.playDefeatMotif();
            setGameOverModal({
              title: 'GAME OVER: INCINERATED',
              desc: 'Ship melted by crystalline thermal radiation.',
              poignantLine: 'The intense thermal radiation from the crystalline core reduced the starship to molten slag.',
            });
            setGameState({ status: 'GAME_OVER', score: 100, level: 1 });
      }
      if(heat.pulses.length>0) handleSaveToSlot(activeSlot);
    } else if (!isOrbitingCrystalPlanet || hasCrystalOrb) {
      crystalHeatDefeatTriggeredRef.current=false;
      if (crystalHeatTicksFrameRef.current > 0 || crystalHeatAccumulatorRef.current > 0) {
        setCrystalHeatTicks(0);
        crystalHeatAccumulatorRef.current = 0;
      }
    }
    if (tractorSalvageFx && tractorSalvageFx.timer > 0) {
      setTractorSalvageFx((fx) => (fx ? { ...fx, timer: fx.timer - dt } : null));
    } else if (tractorSalvageFx && tractorSalvageFx.timer <= 0) {
      setTractorSalvageFx(null);
    }

    // Comms blinking & typewriter
    if (gameLocation === 'Encounter' && (alienCommsState.active || alienCommsState.connected)) {
      setAlienEyeBlinkTimer((t) => (t + dt) % 4.0);
      setCommsTypewriterElapsed((t) => t + dt);
    }

    // Original conversation cadence; only mutable clocks advance every frame.
    // Dialogue/UI updates happen when a scan, phrase or question is due.
    if(gameLocation==='Encounter'&&activeEncounterGroup&&activeEncounterGroup.race!=='Veloxi Drone') {
      const group=activeEncounterGroup;
      if(!group.conversation) {
        group.conversation=newConversationClock(alienCommsState.alienPosture,shieldsRaised,weaponsArmed);
        group.conversation.hails=alienCommsState.connected?0:Math.min(3,alienCommsState.alienHailsCount);
        const disposition=updateEncounterMood(group);
        if(!disposition.fighting&&!group.attackedByPlayer)setProjectiles(prev=>prev.filter(p=>p.fromPlayer));
      }
      const clock=restoreConversationClock(group.conversation,alienCommsState.connected,alienCommsState.alienHailsCount);
      const equipmentDelta=(clock.shieldsUp===shieldsRaised?0:shieldsRaised?5:-5)+(clock.weaponsArmed===weaponsArmed?0:weaponsArmed?10:-10);
      clock.shieldsUp=shieldsRaised;clock.weaponsArmed=weaponsArmed;
      if(equipmentDelta)updateEncounterMood(group,equipmentDelta);
      if(clock.scanRemaining>-3.1)clock.scanRemaining-=dt;
      if(!clock.scanned&&clock.scanRemaining<=0&&group.ships.some(s=>!s.isWreck&&Math.hypot(s.x-encounterShipPos.x,s.y-encounterShipPos.y)<64)) {
        clock.scanned=true;clock.scanRemaining=0;
        addMessage("Captain, we're being scanned.",'Communications','info');gameAudio.playRadarPing();
      }
      if(group.race==='Mechans'&&clock.scanned&&clock.scanRemaining<=-3&&!clock.noHumansWarned) {
        clock.noHumansWarned=true;
        if(!getCrewAboard().some(c=>c.alive&&c.vitality>0&&c.race==='Human'))emitOriginalComm(group,16,[96]);
      }
      if(clock.returnToOrbit!==undefined) {
        clock.returnToOrbit=Math.max(0,clock.returnToOrbit-dt);
        if(clock.returnToOrbit===0) {
          stopAlienVoice();isCombatActiveRef.current=false;setProjectiles([]);
          setAlienCommsState(prev=>({...prev,active:false,connected:false,pendingAlienQuestion:null}));
          setEncounterCooldownTimer(3);setActiveEncounterGroup(null);setGameLocation(prevGameLocation);
          setActiveConsoleMenu('Bridge');setDisplayPanelMode('system_map');
        }
      } else {
        const hasHuman=getCrewAboard().some(c=>c.alive&&c.vitality>0&&c.race==='Human');
        const personality=ALIEN_PERSONALITIES[group.race];
        const quiet=isCombatActiveRef.current||moodDecides(group,hasHuman,elowanHostile)&&group.currentMood>=(personality?.fight??101);
        const event=conversationEvent(clock,dt,{connected:alienCommsState.connected,busy:!!alienCommsState.pendingAlienQuestion||!!alienCommsState.pendingPriorityBusiness,
          fighting:quiet,personality:!!personality,homeworld:!!group.isHomeworldFleet});
        if(event==='hail') {
          if(emitOriginalComm(group,1)) {
            updateEncounterMood(group,nextUnansweredHail(clock));
            setAlienCommsState(prev=>({...prev,alienHailsCount:clock.hails??0}));
          }
        } else if(event==='response') {
          const response=emitOriginalComm(group,2);
          if(response&&!clock.disconnected)openAlienConnection();
        } else if(event==='turn'||event==='terminate') {
          if(event==='terminate'||personality&&!group.isHomeworldFleet&&clock.alienPhrases>=clock.phraseLimit) {
            emitOriginalComm(group,15);closeConversation(clock);
            setAlienCommsState(prev=>({...prev,active:false,connected:false,pendingAlienQuestion:null}));
          } else if(['Minstrels','Nomad','Mysterions','Derelict'].includes(group.race)) {
            const ids=nextTransmission(group,clock,alienCommsState.alienPosture);
            if(ids.length)emitOriginalComm(group,5,ids);
            else {emitOriginalComm(group,15);closeConversation(clock);setAlienCommsState(prev=>({...prev,active:false,connected:false}));}
          } else {
            clock.alienPhrases++;
            if(clock.pendingSubject!==undefined) {
              const subject=clock.pendingSubject;clock.pendingSubject=undefined;emitOriginalComm(group,subject);
            } else {
              const likelihood=group.race==='Mechans'?(hasHuman||mechan9Unlocked?70:0):30;
              const questions=originalCommCandidates(group,14,alienCommsState.alienPosture);
              emitOriginalComm(group,questions.length&&Math.floor(Math.random()*100)<likelihood?14:13);
            }
          }
        }
      }
    }

    // Question / Priority Business Countdown Timer
    if (activeEncounterGroup?.race==='Veloxi Drone' && gameLocation==='Encounter' && activeEncounterGroup.droneChallenge) {
      const test=activeEncounterGroup.droneChallenge;
      const event=advanceDroneChallenge(test,dt,alienCommsState.connected,!!activeEncounterGroup.attackedByPlayer);
      if(test.status==='asking')setQuestionCountdownTimer(test.remaining);
      if(event==='ask') {
        const text=`${test.number}?`;
        setQuestionCountdownTimer(15);setQuestionTotalTime(15);setIsQuestionReminderActive(false);
        setCommsTypewriterElapsed(0);
        setAlienCommsState(prev=>({...prev,pendingAlienQuestion:{text,remindersLeft:0,timer:15},lastAlienSpeakerText:text,lastGarbledAlienText:text,dialogueHistory:[...prev.dialogueHistory,{race:'Veloxi Drone',subject:'Number',text,rawText:text,timestamp:formattedStardate}]}));
        gameAudio.playRadarPing();
      } else if(event==='deny')resolveDroneOrbit(false);
      else if(event==='return') {
        stopAlienVoice();setProjectiles([]);isCombatActiveRef.current=false;
        setAlienCommsState(prev=>({...prev,active:false,connected:false,pendingAlienQuestion:null}));
        setEncounterCooldownTimer(3);setActiveEncounterGroup(null);
        setGameLocation(prevGameLocation);setActiveConsoleMenu('Bridge');setDisplayPanelMode('system_map');
        addMessage('Drone clearance confirmed. Resuming approach.', 'Navigator','info');
      }
    } else if (alienCommsState.pendingPriorityBusiness || alienCommsState.pendingAlienQuestion) {
      const remaining=Math.max(0,questionCountdownTimerFrameRef.current-dt);
      setQuestionCountdownTimer(remaining);
      if(remaining<=0) {
        if(alienCommsState.pendingPriorityBusiness)handleAnswerPriorityBusiness(false);
        else if(alienCommsState.pendingAlienQuestion?.id!==undefined) {
          const question=alienCommsState.pendingAlienQuestion;
          if(questionWait(question,remaining)==='reminder') {
            // Mutate the saved question before the next frame; React UI is throttled.
            question.remindersLeft--;question.timer=20;
            setQuestionCountdownTimer(20);setQuestionTotalTime(20);setIsQuestionReminderActive(true);
            if(activeEncounterGroup)emitOriginalComm(activeEncounterGroup,6);
            setAlienCommsState(prev=>({...prev}));
          } else loseAlienPatience();
        } else if(alienCommsState.pendingAlienQuestion)handleAnswerQuestion(false);
      }
    }

    // Tactical Particle Systems Updates
    if (tacticalSparks.length > 0) {
      setTacticalSparks((prev) =>
        prev
          .map((sp) => ({
            ...sp,
            x: sp.x + sp.vx * dt,
            y: sp.y + sp.vy * dt,
            life: sp.life + dt,
          }))
          .filter((sp) => sp.life < sp.maxLife),
      );
    }

    if (tacticalExplosions.length > 0) {
      setTacticalExplosions((prev) =>
        prev
          .map((ex) => ({
            ...ex,
            radius: ex.radius + (ex.maxRadius / ex.maxLife) * dt,
            life: ex.life + dt,
          }))
          .filter((ex) => ex.life < ex.maxLife),
      );
    }

    if (tacticalShieldRipples.length > 0) {
      setTacticalShieldRipples((prev) =>
        prev
          .map((rp) => ({
            ...rp,
            radius: rp.radius + (rp.maxRadius / rp.maxLife) * dt,
            life: rp.life + dt,
          }))
          .filter((rp) => rp.life < rp.maxLife),
      );
    }

    if (missileSmokeTrails.length > 0) {
      setMissileSmokeTrails((prev) =>
        prev
          .map((sm) => ({
            ...sm,
            x: sm.x + sm.vx * dt,
            y: sm.y + sm.vy * dt,
            alpha: sm.alpha - dt * 0.9,
            life: sm.life + dt,
          }))
          .filter((sm) => sm.life < sm.maxLife && sm.alpha > 0),
      );
    }

    // Stardate Clock Simulation (Rule 8: 1 star hour per 10s of unpaused flight outside Starport)
    if (gameLocation !== 'Starport' && !isGameMenuOpen && !isStarmapOpen && !isDevPanelOpen && !isShipsLogOpen && introPage === 0 && !gameOverModal && !victorySequenceModal) {
      flightClockAccumulatorRef.current += dt;
      if (flightClockAccumulatorRef.current >= 10.0) {
        const hoursToAdd = Math.floor(flightClockAccumulatorRef.current / 10.0);
        flightClockAccumulatorRef.current %= 10.0;

        let curD = stardateDay;
        let curM = stardateMonth;
        let curY = stardateYear;
        let curH = stardateHour;

        const totalHours = curH + hoursToAdd;
        const daysToAdd = Math.floor(totalHours / 24);
        const nextH = totalHours % 24;

        let nextD = curD;
        let nextM = curM;
        let nextY = curY;

        if (daysToAdd > 0) {
          const totalDays = curD + daysToAdd;
          const monthsToAdd = Math.floor((totalDays - 1) / 30);
          nextD = ((totalDays - 1) % 30) + 1;

          if (monthsToAdd > 0) {
            const totalMonths = curM + monthsToAdd;
            const yearsToAdd = Math.floor((totalMonths - 1) / 10);
            nextM = ((totalMonths - 1) % 10) + 1;

            if (yearsToAdd > 0) {
              nextY = curY + yearsToAdd;
            }
          }
        }

        const prevStarHours = previousStarHoursRef.current;
        const newStarHours = getAbsoluteDay(nextD, nextM, nextY) * 24 + nextH;

        setStardateHour(nextH);
        if (nextD !== curD) setStardateDay(nextD);
        if (nextM !== curM) setStardateMonth(nextM);
        if (nextY !== curY) setStardateYear(nextY);

        // Check predetermined star flare moments across the galaxy
        if (!flaresStopped) {
          for (const star of UNIVERSE.stars) {
            if (star.flareDay !== undefined) {
              const flareMoment = star.flareDay * 24;
              if (prevStarHours < flareMoment && newStarHours >= flareMoment) {
                // Star flare moment triggered
                const inSystem =
                  (gameLocation === 'Star System' ||
                    gameLocation === 'In Orbit' ||
                    gameLocation === 'Landing' ||
                    gameLocation === 'On Planet' ||
                    gameLocation === 'Terrain Vehicle') &&
                  currentStar.x === star.x &&
                  currentStar.y === star.y;

                const isDevMode =
                  devUsed ||
                  isDevPanelOpen ||
                  (typeof window !== 'undefined' &&
                    ((window as any).devMode === true || (window as any).isDevMode === true));

                if (isDevMode) {
                  addMessage(
                    `DEV: flare of star at ${star.x},${star.y}; ship in system: ${inSystem ? 'yes' : 'no'}`,
                    'Science Officer',
                    'info',
                  );
                }

                if (inSystem) {
                  setHullIntegrity(0);
                  gameAudio.playChiptuneExplosion();
                  gameAudio.playDefeatMotif();
                  setGameOverModal({
                    title: 'GAME OVER: INCINERATED',
                    desc: `Star ${star.name} flared catastrophically! The star system was engulfed in superheated solar plasma, instantly incinerating your ship.`,
                    poignantLine:
                      'The star ignited in blinding brilliance. Across the void, Arth registers one more lost system.',
                  });
                  setGameState({ status: 'GAME_OVER', score: 100, level: 1 });
                } else {
                  if (star.x === 125 && star.y === 100) {
                    setStarportDestroyed(true);
                  }
                }
              }
            }
          }
        }

        previousStarHoursRef.current = newStarHours;
      }
    }

    // Dynamic Tactical Camera Framing & Zoom Easing (Center Bounding Box of all vessels)
    if (gameLocation === 'Encounter' && activeEncounterGroup) {
      const viewport=viewportRef.current;
      const target=tacticalCameraTarget(viewport.width,viewport.height,encounterShipPos,activeEncounterGroup.ships);

      // Smooth half-second easing: camX += (targetCamX - camX) * dt * 4.0
      const easeSpeed = Math.min(1.0, dt * 4.0);
      tacticalCameraRef.current.x += (target.x - tacticalCameraRef.current.x) * easeSpeed;
      tacticalCameraRef.current.y += (target.y - tacticalCameraRef.current.y) * easeSpeed;
      tacticalCameraRef.current.cellSize += (target.cellSize - tacticalCameraRef.current.cellSize) * easeSpeed;
    }

    // Auto Tractor-Lock Wreck Salvaging in Encounter
    if (gameLocation === 'Encounter' && activeEncounterGroup) {
      let freeSpace = Math.max(0, 50 + 50 * cargoPods - shipCargoVolume(enduriumFuelFrameRef.current, cargoHold, artifactsInHold, specimensInHold));
      activeEncounterGroup.ships.forEach((ship) => {
        if (ship.isWreck && !ship.looted) {
          const distToWreck = Math.hypot(ship.x - encounterShipPos.x, ship.y - encounterShipPos.y);
          if (distToWreck <= 1.4) {
            const eligible = (ship.loot ?? []).filter(item => item.type !== 'artifact');
            const { accepted, remaining } = fitCargo(eligible, freeSpace);
            ship.loot = [...remaining, ...(ship.loot ?? []).filter(item => item.type === 'artifact')];
            ship.looted = ship.loot.length === 0;
            if (accepted.length === 0) {
              if (!ship.looted && !blockedSalvageRef.current.has(ship.id)) {
                blockedSalvageRef.current.add(ship.id);
                addMessage('Tractor salvage paused: ship hold is full. Excess cargo remains in the wreck.', 'Captain', 'alert');
              }
              return;
            }
            blockedSalvageRef.current.delete(ship.id);
            freeSpace = Math.max(0, freeSpace - accepted.reduce((sum, item) => sum + item.volume, 0));
            let enduriumGained = 0;
            let mineralsGained = 0;

            if (accepted.length > 0) {
              accepted.forEach((item) => {
                if (item.type === 'endurium') {
                  setEnduriumFuel((f) => f + item.volume);
                  enduriumGained += item.volume;
                } else if (item.type === 'mineral') {
                  setCargoHold((ch) => ({ ...ch, [item.name]: +(ch[item.name] || 0) + item.volume }));
                  mineralsGained += item.volume;
                }
              });
            }

            setTractorSalvageFx({
              x: encounterShipPos.x,
              y: encounterShipPos.y,
              targetX: ship.x,
              targetY: ship.y,
              timer: 1.2,
              text: `+${enduriumGained.toFixed(1)}m³ Fuel • +${mineralsGained.toFixed(1)}m³ Ore`,
            });

            gameAudio.playCoinPickup();
            addMessage(`TRACTOR BEAM SALVAGE: Recovered ${enduriumGained.toFixed(1)} m³ Endurium and ${mineralsGained.toFixed(1)} m³ minerals from wreck of ${ship.vesselClass}!`, 'Captain', 'info');
          }
        }
      });
    }

    // Continuous Animation Phases
    setOrbitAnimPhase((p) => p + dt * 0.4);
    setRadarScanAngle((a) => (a + dt * 1.8) % (Math.PI * 2));

    // Smooth Orbit Transition Interpolation
    if (orbitTransitionProgress < 1.0) {
      setOrbitTransitionProgress((p) => Math.min(1.0, p + dt * 2.0));
    }

    // Cinematic Timer Tick outside functional state updaters
    if (cinematicStateRef.current !== 'none') {
      const curCin = cinematicStateRef.current;
      if((curCin==='launch'||curCin==='dock')&&!bayReady())return;
      // Finish the recorded landing call before touchdown can replace it.
      if(curCin==='descent'&&cinematicTimerRef.current<=.1&&(voiceEngine.getCrewRemainingSeconds()>.05||(pendingBanterRepliesRef.current.epoch===missionEpochRef.current&&pendingBanterRepliesRef.current.count>0)))return;
      cinematicTimerRef.current = Math.max(0, cinematicTimerRef.current - dt);
      setCinematicTimer(cinematicTimerRef.current);

      if (cinematicTimerRef.current <= 0 && !cinematicCompletingRef.current) {
        if (curCin === 'launch') {
          completeLaunchToSpace();
        } else if (curCin === 'dock') {
          completeDockingToStarport();
        } else if (curCin === 'descent') {
          completeDescentToPlanet();
        } else if (curCin === 'surface_launch') {
          completeSurfaceLaunchToOrbit();
        }
      }
    }

    // Surface Beam / Tractor FX Timers
    if (surfaceWeaponBeam && surfaceWeaponBeam.timer > 0) {
      setSurfaceWeaponBeam((b) => (b ? { ...b, timer: b.timer - dt } : null));
    } else if (surfaceWeaponBeam && surfaceWeaponBeam.timer <= 0) {
      setSurfaceWeaponBeam(null);
    }

    if (tractorBeamFx && tractorBeamFx.timer > 0) {
      setTractorBeamFx((fx) => (fx ? { ...fx, timer: fx.timer - dt } : null));
    } else if (tractorBeamFx && tractorBeamFx.timer <= 0) {
      setTractorBeamFx(null);
    }

    if (redVignetteFlash > 0) {
      setRedVignetteFlash((v) => Math.max(0, v - dt * 2));
    }

    // Surface Sonar Pulse Expansion
    if (surfaceSonarPulse.active) {
      setSurfaceSonarPulse((sp) => {
        const nextR = sp.radius + dt * 14.0;
        if (nextR >= sp.maxRadius) {
          return { ...sp, active: false, radius: 0 };
        }
        return { ...sp, radius: nextR };
      });
    }

    // The weather field uses the rendered viewport, not the fixed design canvas.
    const weatherPlanet=(gameLocation==='On Planet'||gameLocation==='Terrain Vehicle')&&orbitPlanetIndex!==null?currentPlanets[orbitPlanetIndex]:null;
    const weatherViewport=viewportRef.current;
    setSurfaceWeatherParticles(previous=>advanceSurfaceWeather(previous,surfaceWeatherKind(weatherPlanet),weatherViewport.width,weatherViewport.height,dt));

    const recordingPlanetKey=orbitPlanetIndex!==null?planetKey(currentStar.x,currentStar.y,currentPlanets[orbitPlanetIndex]?.orderIndex??-1):'';
    const recordingPursuit=recordingFollowTarget(surfaceRecordingFrameRef.current,recordingPlanetKey,currentSurfaceState?.lifeforms??[],vehicleX,vehicleY,vehicleFuel,!!(activeDirectionVector.dx||activeDirectionVector.dy),gameLocation==='Terrain Vehicle'&&!vehicleDestroyed);
    // An explicit destination always wins over specimen-following.
    const roverDriveTarget=roverWaypoint??recordingPursuit;
    const mining=miningSessionRef.current;
    if(mining) {
      const target=currentSurfaceState?.minerals.find(m=>m.id===mining.depositId);
      if(gameLocation!=='Terrain Vehicle'||vehicleDestroyed)stopMining('Mining stopped: rover unavailable.');
      else if(activeDirectionVector.dx||activeDirectionVector.dy||roverDriveTarget)stopMining('Mining stopped for movement.');
      else if(!target||target.taken||target.volume<=0)stopMining('Deposit depleted.');
      else if(Math.hypot(target.x-vehicleX,target.y-vehicleY)>MINING_RANGE)stopMining('Mining stopped: deposit out of range.');
      else {
        const hold=vehicleHoldFrameRef.current;
        const free=50-hold.reduce((sum,item)=>sum+item.volume,0);
        const cut=miningStep(target.volume,free,vehicleFuelFrameRef.current,dt,mining.credit);
        setMiningSession({...mining,credit:cut.credit,extracted:+(mining.extracted+cut.amount).toFixed(10),checkpointIn:mining.checkpointIn-dt});
        if(cut.amount>0) {
          target.volume=+(target.volume-cut.amount).toFixed(10);target.taken=target.volume<=1e-9;
          const existing=hold.find(item=>item.type==='mineral'&&item.name===target.name);
          const price=MINERAL_CATALOG.find(m=>m.name===target.name)?.price??500;
          setVehicleHold(existing?hold.map(item=>item!==existing?item:{...item,volume:+(item.volume+cut.amount).toFixed(10),value:(item.volume+cut.amount)*price}):[...hold,{id:`mined-${target.id}`,name:target.name,type:'mineral',volume:cut.amount,value:cut.amount*price}]);
          setVehicleFuel(fuel=>consumeFuel(fuel,cut.fuelCost));
          setSurfaceWeaponBeam({active:true,type:'laser',startX:vehicleX,startY:vehicleY,endX:target.x,endY:target.y,timer:.2});
        }
        if(target.taken)stopMining('Deposit depleted.');
        else if(free-cut.amount<.1-1e-9)stopMining('Rover hold is full. Return to the starship to offload.');
        else if(vehicleFuelFrameRef.current<1000/30767-1e-9)stopMining('Rover energy is too low to continue.');
        else if(mining.checkpointIn<=dt) {setMiningSession(previous=>previous?{...previous,checkpointIn:.5}:null);handleSaveToSlot(activeSlot);}
      }
    }

    // Terrain Vehicle Rover Movement Physics
    if (gameLocation === 'Terrain Vehicle' && !vehicleDestroyed) {
      if(roverWaypoint&&(activeDirectionVector.dx||activeDirectionVector.dy))setRoverWaypoint(null);
      if (roverDriveTarget && !(activeDirectionVector.dx||activeDirectionVector.dy)) {
        // Auto-drive towards the explicit waypoint or live recording target
        const dxWp = roverDriveTarget.x - vehicleX;
        const dyWp = roverDriveTarget.y - vehicleY;
        const distWp = Math.hypot(dxWp, dyWp);

        if (distWp <= 0.05 || vehicleFuel <= 0) {
          setRoverWaypoint(null);
          setIsRoverMoving(false);
          setRoverSuspensionBounce(0);
        } else {
          const targetHeading = Math.atan2(dyWp, dxWp);
          setVehicleHeading(targetHeading);
          setIsRoverMoving(true);

          const roverSpeed = 2.4; // km/s
          const stepDist = Math.min(distWp, roverSpeed * dt);
          const dX = Math.cos(targetHeading) * stepDist;
          const dY = Math.sin(targetHeading) * stepDist;

          setVehicleX((vx) => +(vx + dX).toFixed(3));
          setVehicleY((vy) => +(vy + dY).toFixed(3));

          // Suspension bounce
          setRoverSuspensionBounce(Math.sin(nowSec * 16) * 1.5);

          // Fuel consumption (0.01 per sec)
          setVehicleFuel((vf) => consumeFuel(vf, 0.01 * dt));

          // Tire track emission
          if (Math.random() < 0.3) {
            setRoverTireTracks((prev) => [
              ...prev.slice(-50),
              { x: vehicleX, y: vehicleY, heading: targetHeading, alpha: 0.7 },
            ]);
          }

          // Wheel dust particles
          if (Math.random() < 0.6) {
            const dustAngle = targetHeading + Math.PI + (Math.random() - 0.5) * 0.6;
            const dustSpd = 0.8 + Math.random() * 1.2;
            setRoverDustParticles((prev) => [
              ...prev.slice(-40),
              {
                x: vehicleX - Math.cos(targetHeading) * 0.2,
                y: vehicleY - Math.sin(targetHeading) * 0.2,
                vx: Math.cos(dustAngle) * dustSpd,
                vy: Math.sin(dustAngle) * dustSpd,
                size: 2.5 + Math.random() * 3.5,
                life: 0,
                maxLife: 0.5 + Math.random() * 0.3,
                color: '#d4d4d8',
              },
            ]);
          }
        }
      } else {
        const { dx, dy } = activeDirectionVector;
        const isMoving = (dx !== 0 || dy !== 0) && vehicleFuel > 0;
        setIsRoverMoving(isMoving);

        if (isMoving) {
          const targetHeading = Math.atan2(dy, dx);
          setVehicleHeading(targetHeading);

          const roverSpeed = 2.4; // km/s
          const dX = Math.cos(targetHeading) * roverSpeed * dt;
          const dY = Math.sin(targetHeading) * roverSpeed * dt;

          setVehicleX((vx) => vx + dX);
          setVehicleY((vy) => vy + dY);

          // Suspension bounce
          setRoverSuspensionBounce(Math.sin(nowSec * 16) * 1.5);

          // Fuel consumption (0.01 per sec)
          setVehicleFuel((vf) => consumeFuel(vf, 0.01 * dt));

          // Tire track emission
          if (Math.random() < 0.3) {
            setRoverTireTracks((prev) => [
              ...prev.slice(-50),
              { x: vehicleX, y: vehicleY, heading: targetHeading, alpha: 0.7 },
            ]);
          }

          // Wheel dust particles
          if (Math.random() < 0.6) {
            const dustAngle = targetHeading + Math.PI + (Math.random() - 0.5) * 0.6;
            const dustSpd = 0.8 + Math.random() * 1.2;
            setRoverDustParticles((prev) => [
              ...prev.slice(-40),
              {
                x: vehicleX - Math.cos(targetHeading) * 0.2,
                y: vehicleY - Math.sin(targetHeading) * 0.2,
                vx: Math.cos(dustAngle) * dustSpd,
                vy: Math.sin(dustAngle) * dustSpd,
                size: 2.5 + Math.random() * 3.5,
                life: 0,
                maxLife: 0.5 + Math.random() * 0.3,
                color: '#d4d4d8',
              },
            ]);
          }
        } else {
          setRoverSuspensionBounce(0);
        }
      }

      // Fade tire tracks
      if (roverTireTracks.length > 0) {
        setRoverTireTracks((prev) =>
          prev
            .map((tt) => ({ ...tt, alpha: tt.alpha - dt * 0.08 }))
            .filter((tt) => tt.alpha > 0),
        );
      }

      // Update rover dust particles
      if (roverDustParticles.length > 0) {
        setRoverDustParticles((prev) =>
          prev
            .map((dp) => ({
              ...dp,
              x: dp.x + dp.vx * dt,
              y: dp.y + dp.vy * dt,
              life: dp.life + dt,
            }))
            .filter((dp) => dp.life < dp.maxLife),
        );
      }

      // Surface Lifeforms AI Simulation
      if (currentSurfaceState && currentSurfaceState.lifeforms.length > 0) {
        currentSurfaceState.lifeforms.forEach((lf) => {
          if (advanceLifeform(lf,vehicleX,vehicleY,dt)) {
            const shielded=hasFlatDevice || vehicleHold.some(item=>item.artifactRef?.id==='flat-device'||item.artifactRef?.id==='art-flat-device');
            const result=resolveWildlifeAttack(lifeformTraits(lf),crewRosterFrameRef.current,Object.values(assignedPosts),shielded);
            setCrewRoster(result.roster);
            if(surfaceRecordingFrameRef.current?.lifeformId===lf.id) setSurfaceRecording({...surfaceRecordingFrameRef.current,interruptedFor:1});
            for(const event of result.events) {
              if(event.damage>0) {
                setRoverWaypoint(null);
                setRedVignetteFlash(1);
                setScreenShake(.4);
                gameAudio.playMeleePunch();
                addMessage(`${lf.speciesName} injured ${event.name} (-${event.damage} vitality).`,'Doctor','alert');
                if(event.dead) handleCrewCasualty(result.roster.find(c=>c.id===event.id)!);
              } else if(event.shielded) addMessage(`The Flat Device turns away ${lf.speciesName}'s attack on ${event.name}.`,'Science Officer','info');
            }
            if(result.events.some(event=>event.damage>0)) handleSaveToSlot(activeSlot);
          }
        });
      }
    }

    const recording=surfaceRecordingFrameRef.current;
    if(recording) {
      const target=currentSurfaceState?.lifeforms.find(lf=>lf.id===recording.lifeformId);
      const currentKey=orbitPlanetIndex!==null?planetKey(currentStar.x,currentStar.y,currentPlanets[orbitPlanetIndex]?.orderIndex??-1):'';
      if(gameLocation!=='Terrain Vehicle' || vehicleDestroyed || currentKey!==recording.planetKey || !target || target.captured || Math.hypot(target.x-vehicleXFrameRef.current,target.y-vehicleYFrameRef.current)>RECORDING_RANGE) {
        setSurfaceRecording(null);
        addMessage('Science: Recording interrupted. Keep the specimen within 2.5 km with an operational rover.','Science Officer','info');
        handleSaveToSlot(activeSlot);
      } else if(recording.interruptedFor>0) {
        setSurfaceRecording({...recording,interruptedFor:Math.max(0,recording.interruptedFor-dt)});
      } else if(recording.remaining>dt) {
        setSurfaceRecording({...recording,remaining:recording.remaining-dt});
      } else {
        setSurfaceRecording(null);
        const learned=recordLifeform(surveyKnowledgeFrameRef.current,target,recording.planetKey);
        target.recorded=true;
        setSurveyKnowledge(learned.knowledge);
        setDiscoveredSpecies(previous=>previous.includes(learned.speciesKey)?previous:[...previous,learned.speciesKey]);
        addMessage(`Science: ${target.speciesName} recorded. ${learned.earned>0?`${learned.earned} M.U. in new data; Interstel pays on docking.`:'This species is already catalogued; no duplicate bounty.'}`,'Science Officer','info');
        gameAudio.playPowerupChime();
        handleSaveToSlot(activeSlot);
      }
    }

    // Hangar Sparks Update
    if (hangarSparks.length > 0) {
      setHangarSparks((prev) =>
        prev
          .map((s) => ({
            ...s,
            x: s.x + s.vx * dt,
            y: s.y + s.vy * dt,
            vy: s.vy + 200 * dt, // gravity
            life: s.life + dt,
          }))
          .filter((s) => s.life < s.maxLife),
      );
    }

    // Propulsion is animated at the assembled ship's actual nozzles by
    // drawUnifiedPlayerShip. A second centerline emitter detached from them.

    // Hyperspace Speed Warp Streaks
    if (gameLocation === 'Hyperspace') {
      const isManeuvering = activeConsoleMenu === 'Maneuver' && (activeDirectionVector.dx !== 0 || activeDirectionVector.dy !== 0);
      if (isManeuvering && Math.random() < 0.4) {
        const streakAngle = shipHeading + Math.PI;
        setWarpStreakParticles((prev) => [
          ...prev.slice(-25),
          {
            x: (Math.random() - 0.5) * canvasWidth,
            y: (Math.random() - 0.5) * canvasHeight,
            length: 40 + Math.random() * 80,
            speed: 400 + Math.random() * 300,
            alpha: 0.6 + Math.random() * 0.4,
          },
        ]);
      }

      setWarpStreakParticles((prev) =>
        prev
          .map((s) => ({
            ...s,
            alpha: s.alpha - dt * 2.0,
          }))
          .filter((s) => s.alpha > 0),
      );
    }

    // Door Steam Burst Particles Simulation
    if (doorSteamParticles.length > 0) {
      setDoorSteamParticles((prev) =>
        prev
          .map((sp) => ({
            ...sp,
            x: sp.x + sp.vx * dt,
            y: sp.y + sp.vy * dt,
            size: sp.size + dt * 12,
            alpha: sp.alpha - dt * 1.1,
            life: sp.life + dt,
          }))
          .filter((sp) => sp.life < sp.maxLife && sp.alpha > 0)
      );
    }

    // Starport Concourse Simulation & 8-Directional Kinematics
    if (gameLocation === 'Starport' && activeRoomIndex === null && cinematicState === 'none') {
      const curW = viewportRef.current.width;
      const curH = viewportRef.current.height;
      const concourseCanvas = getConcourseCanvas(assets);
      const { drawnW, drawnH, offsetX, offsetY } = getConcourseCoverTransform(curW, curH, concourseCanvas);
      const centerCanvasX = offsetX + 0.500 * drawnW;
      const centerCanvasY = offsetY + 0.499 * drawnH;
      const radiusCanvasX = 0.360 * drawnW;
      const radiusCanvasY = 0.315 * drawnH;

      // Guard against invalid or off-screen states:
      let currentAstroX = astronautX;
      let currentAstroY = astronautY;
      if (!Number.isFinite(currentAstroX) || !Number.isFinite(currentAstroY)) {
        const spawnPos = imageFracToCanvas(
          CONCOURSE_SPAWN_U,
          CONCOURSE_SPAWN_V,
          curW,
          curH,
          concourseCanvas
        );
        currentAstroX = spawnPos.x;
        currentAstroY = spawnPos.y;
        setAstronautX(currentAstroX);
        setAstronautY(currentAstroY);
        setAstronautVx(0);
        setAstronautVy(0);
        setClickMoveTarget(null);
      } else {
        const curDx = currentAstroX - centerCanvasX;
        const curDy = currentAstroY - centerCanvasY;
        const curNormDist = Math.hypot(curDx / radiusCanvasX, curDy / radiusCanvasY);
        if (curNormDist > 1.0) {
          currentAstroX = centerCanvasX + curDx / curNormDist;
          currentAstroY = centerCanvasY + curDy / curNormDist;
          setAstronautX(currentAstroX);
          setAstronautY(currentAstroY);
        }
      }

      // Transporter particles
      if (transporterParticles.length > 0) {
        setTransporterParticles((prev) =>
          prev
            .map((sp) => ({
              ...sp,
              y: sp.y + sp.vy * dt,
              life: sp.life + dt,
            }))
            .filter((sp) => sp.life < sp.maxLife)
        );
      }

      // Click to move target tracking
      let curVx = astronautVx;
      let curVy = astronautVy;
      if (clickMoveTarget) {
        // Clamp clickMoveTarget itself if somehow invalid or outside floor
        let tX = clickMoveTarget.x;
        let tY = clickMoveTarget.y;
        if (!Number.isFinite(tX) || !Number.isFinite(tY)) {
          setClickMoveTarget(null);
          setAstronautVx(0);
          setAstronautVy(0);
          curVx = 0;
          curVy = 0;
        } else {
          const tDx = tX - centerCanvasX;
          const tDy = tY - centerCanvasY;
          const tNorm = Math.hypot(tDx / radiusCanvasX, tDy / radiusCanvasY);
          if (tNorm > 1.0) {
            tX = centerCanvasX + tDx / tNorm;
            tY = centerCanvasY + tDy / tNorm;
          }

          const dx = tX - currentAstroX;
          const dy = tY - currentAstroY;
          const dist = Math.hypot(dx, dy);

          if (dist <= 6) {
            setClickMoveTarget(null);
            setAstronautVx(0);
            setAstronautVy(0);
            curVx = 0;
            curVy = 0;
            setAstronautAnimFrame(0);
          } else {
            const moveSpeed = 220;
            curVx = (dx / dist) * moveSpeed;
            curVy = (dy / dist) * moveSpeed;
            setAstronautVx(curVx);
            setAstronautVy(curVy);

            // Update 8-way facing
            const angle = Math.atan2(dy, dx);
            if (angle >= -Math.PI / 8 && angle < Math.PI / 8) setAstronautFacing('E');
            else if (angle >= Math.PI / 8 && angle < (3 * Math.PI) / 8) setAstronautFacing('SE');
            else if (angle >= (3 * Math.PI) / 8 && angle < (5 * Math.PI) / 8) setAstronautFacing('S');
            else if (angle >= (5 * Math.PI) / 8 && angle < (7 * Math.PI) / 8) setAstronautFacing('SW');
            else if (angle >= (-3 * Math.PI) / 8 && angle < -Math.PI / 8) setAstronautFacing('NE');
            else if (angle >= (-5 * Math.PI) / 8 && angle < (-3 * Math.PI) / 8) setAstronautFacing('N');
            else if (angle >= (-7 * Math.PI) / 8 && angle < (-5 * Math.PI) / 8) setAstronautFacing('NW');
            else setAstronautFacing('W');

            setAstronautAnimFrame((f) => (f + dt * 10) % 8);
            setAstronautIdleTimer(0);
          }
        }
      }

      // Astronaut movement physics with ellipse boundary clamping
      // Center (0.500, 0.499), Radius X: 0.360 of composite width, Radius Y: 0.315 of composite height
      if (curVx !== 0 || curVy !== 0) {
        const nextX = currentAstroX + curVx * dt;
        const nextY = currentAstroY + curVy * dt;

        // Check normalized distance from concourse center in ellipse coordinates
        const dx = nextX - centerCanvasX;
        const dy = nextY - centerCanvasY;
        const normDist = Math.hypot(dx / radiusCanvasX, dy / radiusCanvasY);

        let finalX = nextX;
        let finalY = nextY;
        if (normDist > 1.0) {
          finalX = centerCanvasX + dx / normDist;
          finalY = centerCanvasY + dy / normDist;
          if (clickMoveTarget) {
            const distToClick = Math.hypot(clickMoveTarget.x - finalX, clickMoveTarget.y - finalY);
            if (distToClick <= 6) {
              setClickMoveTarget(null);
              setAstronautVx(0);
              setAstronautVy(0);
              setAstronautAnimFrame(0);
            }
          }
        }

        const stepDist = Math.hypot(finalX - currentAstroX, finalY - currentAstroY);
        astronautDistanceTraveledRef.current += stepDist;
        setAstronautDistanceTraveled(astronautDistanceTraveledRef.current);

        setAstronautX(finalX);
        setAstronautY(finalY);
        setAstronautAnimFrame((f) => (f + dt * 10) % 8);
        setAstronautIdleTimer(0);

        // Check Sealed Doors Proximity Notice ("Sealed.")
        const curU = (finalX - offsetX) / drawnW;
        const curV = (finalY - offsetY) / drawnH;
        const distSealedLeft = Math.hypot(curU - 0.147, curV - 0.450);
        const distSealedRight = Math.hypot(curU - 0.853, curV - 0.450);

        if (distSealedLeft <= 0.065) {
          if (nearSealedDoorRef.current !== 'left') {
            nearSealedDoorRef.current = 'left';
            addMessage('Sealed.', undefined, 'info');
          }
        } else if (distSealedRight <= 0.065) {
          if (nearSealedDoorRef.current !== 'right') {
            nearSealedDoorRef.current = 'right';
            addMessage('Sealed.', undefined, 'info');
          }
        } else {
          nearSealedDoorRef.current = null;
        }

        // Stepping onto the Docking Bay center platform transitions to Docking Bay
        const distCenterPlatform = Math.hypot((curU - 0.500) / 0.05, (curV - 0.505) / 0.035);
        if (distCenterPlatform <= 1.0 && enteringDoorIndex === null) {
          handleEnterDoor(6);
        }
      } else if (!clickMoveTarget) {
        setAstronautIdleTimer((t) => t + dt);
      }

      // Check Sealed Doors Proximity Notice ("Sealed.")
      const curU = (astronautX - offsetX) / drawnW;
      const curV = (astronautY - offsetY) / drawnH;
      const distSealedLeft = Math.hypot(curU - 0.147, curV - 0.450);
      const distSealedRight = Math.hypot(curU - 0.853, curV - 0.450);

      if (distSealedLeft <= 0.065) {
        if (nearSealedDoorRef.current !== 'left') {
          nearSealedDoorRef.current = 'left';
          addMessage('Sealed.', undefined, 'info');
        }
      } else if (distSealedRight <= 0.065) {
        if (nearSealedDoorRef.current !== 'right') {
          nearSealedDoorRef.current = 'right';
          addMessage('Sealed.', undefined, 'info');
        }
      } else {
        nearSealedDoorRef.current = null;
      }

      // Smooth turn scale easing
      const targetScaleX = astronautFacing.includes('W') ? -1 : 1;
      setAstronautScaleX((sx) => sx + (targetScaleX - sx) * 0.25);

      // Ambient Scrubbots roaming the concourse
      setAmbientScrubbots((prev) =>
        prev.map((bot) => {
          let nx = bot.x + bot.vx * dt;
          let nvx = bot.vx;
          if (nx < 200) {
            nx = 200;
            nvx = Math.abs(nvx);
          } else if (nx > 1080) {
            nx = 1080;
            nvx = -Math.abs(nvx);
          }
          return { ...bot, x: nx, vx: nvx, hoverPhase: bot.hoverPhase + dt * 3 };
        }),
      );

      // Ambient Crew members
      ambientCrewMembers.forEach((crew) => {
        crew.x += crew.vx * dt;
        if (crew.x < 180) {
          crew.x = 180;
          crew.vx = Math.abs(crew.vx);
        } else if (crew.x > 1100) {
          crew.x = 1100;
          crew.vx = -Math.abs(crew.vx);
        }
      });
    }

    // Shield trickle fuel consumption
    if (shieldsRaised && enduriumFuel > 0 && gameLocation !== 'Starport') {
      const trickle = (0.01 / 3600) * dt;
      setEnduriumFuel((f) => consumeFuel(f, trickle));
    }

    // Mineral Repairs Tick
    if (activeRepairTask && hullIntegrity > 0) {
      const repairRate = repairPercentageRate(engineerSkill);
      const deltaHp = repairRate * dt;

      if (activeRepairTask.target === 'Hull') {
        setHullIntegrity((h) => {
          const maxH = 250;
          const nextH = advanceHealth(h, maxH, repairRate * 2.5, dt);
          if (nextH >= maxH) {
            setActiveRepairTask(null);
            gameAudio.playLevelUpStinger();
            triggerBanter('repair_complete', 'Hull');
            addMessage('Engineering: Starship hull integrity fully restored to 100% (250 pts).', 'Engineer', 'info');
            handleSaveToSlot(activeSlot);
          }
          return nextH;
        });
      } else {
        const sys = activeRepairTask.target;
        setSubsystems((prev) => {
          const curHp = prev[sys];
          const nextHp = advanceHealth(curHp, 100, repairRate, dt);

          if (inoperativeSystems[sys]) {
            if (nextHp >= 100) {
              setInoperativeSystems((inop) => ({ ...inop, [sys]: false }));
            } else if (nextHp > 73 && Math.random() < 0.20 * deltaHp) {
              setInoperativeSystems((inop) => ({ ...inop, [sys]: false }));
              addMessage(`Engineering: ${sys} rebooted and recovered from inoperative state!`, 'Engineer', 'info');
            }
          }

          if (nextHp >= 100) {
            setActiveRepairTask(null);
            setInoperativeSystems((inop) => ({ ...inop, [sys]: false }));
            gameAudio.playLevelUpStinger();
            triggerBanter('repair_complete', sys);
            addMessage(`Engineering: ${sys} repairs complete! Subsystem at 100% nominal.`, 'Engineer', 'info');
            handleSaveToSlot(activeSlot);
          }
          return { ...prev, [sys]: nextHp };
        });
      }
    }

    // Medical Healing Tick
    const isDisembarked = gameLocation === 'Terrain Vehicle' || gameLocation === 'On Planet';
    if (!isDisembarked && doctorSkill > 0) {
      setCrewRoster((roster) => {
        let changed = false;
        const updated = roster.map((crew) => {
          if (!crew.alive || crew.vitality >= 100) return crew;
          const healed = advanceHealth(crew.vitality, 100, crewHealingRate(doctorSkill, crew.id === activePatientId), dt);
          if (healed !== crew.vitality) {
            changed = true;
            return { ...crew, vitality: healed };
          }
          return crew;
        });
        return changed ? updated : roster;
      });
    }

    // Projectiles simulation
    if (projectiles.length > 0) {
      // Emit missile smoke trails
      projectiles.forEach((p) => {
        if (p.type === 'missile') {
          setMissileSmokeTrails((prev) => [
            ...prev.slice(-60),
            {
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 0.4,
              vy: (Math.random() - 0.5) * 0.4,
              size: 2.5 + Math.random() * 2.5,
              life: 0,
              maxLife: 0.6,
              alpha: 0.8,
            },
          ]);
        }
      });

      setProjectiles((prev) =>
        prev
          .map((p) => {
            const nextDuration = p.duration - dt;
            let targetX = p.targetX;
            let targetY = p.targetY;

            if (p.targetShipId && activeEncounterGroup) {
              const tgt = activeEncounterGroup.ships.find((s) => s.id === p.targetShipId);
              if (tgt && !tgt.isWreck) {
                targetX = tgt.x;
                targetY = tgt.y;
              }
            } else if (p.targetIsPlayer) {
              if (p.type === 'missile' && p.playerLaunchX !== undefined && p.playerLaunchY !== undefined) {
                targetX = p.playerLaunchX;
                targetY = p.playerLaunchY;
              } else {
                targetX = encounterShipPos.x;
                targetY = encounterShipPos.y;
              }
            }

            const dx = targetX - p.x;
            const dy = targetY - p.y;
            const dist = Math.hypot(dx, dy);

            const arrival = projectileArrival(dist, nextDuration);
            if (arrival === 'expired') {
              if (p.fromPlayer && p.type !== 'laser') {
                setLastShotResult('MISS');
                triggerBanter('combat_miss');
                addMessage('Missile shot went wide!', 'Navigator', 'info');
              }
              return null;
            }
            if (arrival === 'hit') {
              if (p.fromPlayer) {
                // If it's a laser beam projectile, it has already been resolved in handleFireLaser
                if (p.type === 'laser') {
                  return null;
                }

                // If missile missed or timed out:
                if (p.isMiss || dist >= 0.8 || !p.targetShipId) {
                  setLastShotResult('MISS');
                  triggerBanter('combat_miss');
                  addMessage('Missile shot went wide!', 'Navigator', 'info');
                  return null;
                }

                if (p.targetShipId && activeEncounterGroup) {
                  const tgt = activeEncounterGroup.ships.find((s) => s.id === p.targetShipId);
                  if (tgt && !tgt.isWreck) {
                    if (tgt.isMissileImmune) {
                      setLastShotResult('IMMUNE (0 dmg)');
                      addMessage(`Tactical: Warhead detonated harmlessly! Target ${tgt.race} is completely IMMUNE to missile impacts.`, 'Science Officer', 'alert');
                      return null;
                    }

                    if (p.damage <= 0) {
                      setLastShotResult('MISS');
                      addMessage('Missile shot went wide!', 'Navigator', 'info');
                      return null;
                    }

                    setLastShotResult(`HIT (-${p.damage} dmg)`);
                    const hitInNebula = inNebula;
                    let hitLocation: 'shields' | 'armor';

                    if (tgt.shields > 0 && !hitInNebula) {
                      // Spawn shield ripple
                      setTacticalShieldRipples((prevR) => [
                        ...prevR.slice(-15),
                        { x: tgt.x, y: tgt.y, radius: 2, maxRadius: 18, life: 0, maxLife: 0.4, color: '#00f0ff', angle: Math.atan2(p.y - tgt.y, p.x - tgt.x) },
                      ]);
                      tgt.shields = Math.max(0, tgt.shields - p.damage);
                      hitLocation = 'shields';
                    } else {
                      tgt.hullIntegrity = Math.max(0, tgt.hullIntegrity - p.damage);
                      hitLocation = 'armor';
                      const newSparks = Array.from({ length: 12 }, () => ({
                        x: tgt.x,
                        y: tgt.y,
                        vx: (Math.random() - 0.5) * 8,
                        vy: (Math.random() - 0.5) * 8,
                        life: 0,
                        maxLife: 0.4 + Math.random() * 0.3,
                        color: Math.random() < 0.5 ? '#ffb700' : '#ff3322',
                        size: 1.5 + Math.random() * 2,
                      }));
                      setTacticalSparks((sp) => [...sp.slice(-40), ...newSparks]);
                    }

                    triggerBanter('combat_hit');
                    addMessage(`Missile hit on ${tgt.vesselClass}: ${hitLocation} -${p.damage}.`, 'Science Officer', 'info');

                    if (tgt.hullIntegrity <= 0) {
                      tgt.isWreck = true;
                      if (!hitInNebula) {
                        tgt.shields = 0;
                      }
                      tgt.hullIntegrity = 0;
                      setTacticalExplosions((ex) => [
                        ...ex.slice(-10),
                        { x: tgt.x, y: tgt.y, radius: 4, maxRadius: 28, life: 0, maxLife: 0.8, color: '#f97316', shockwave: true },
                      ]);
                      setScreenShake(0.8);
                      gameAudio.playChiptuneExplosion();
                      triggerBanter('combat_kill');
                      addMessage(`TACTICAL KILL: Target ${tgt.vesselClass} destroyed by warhead!`, 'Science Officer', 'info');

                      const livingShips = activeEncounterGroup.ships
                        .map((s, idx) => ({ ship: s, idx, dist: Math.hypot(s.x - encounterShipPos.x, s.y - encounterShipPos.y) }))
                        .filter((entry) => !entry.ship.isWreck && entry.ship.hullIntegrity > 0);

                      if (livingShips.length > 0) {
                        livingShips.sort((a, b) => a.dist - b.dist);
                        setEncounterTargetIndex(livingShips[0].idx);
                        addMessage(`Targeting computer automatically switched to nearest living vessel: ${livingShips[0].ship.vesselClass}.`, 'Captain', 'info');
                      }
                    }
                  }
                }
                return null;
              } else if (!p.fromPlayer && p.targetIsPlayer) {
                if (hasShimmeringBall && Math.random() < 0.4) {
                  addMessage('SHIMMERING BALL: Quantum phase jitter deflected incoming shot off starship coordinates!', 'Navigator', 'info');
                  return null;
                }

                if (p.type === 'missile' && p.playerLaunchX !== undefined && p.playerLaunchY !== undefined) {
                  const distFromLaunch = Math.hypot(encounterShipPos.x - p.playerLaunchX, encounterShipPos.y - p.playerLaunchY);
                  if (distFromLaunch >= 1.25) {
                    addMessage('Navigator: Evasive maneuver successful! Alien missile detonated behind us (DODGED).', 'Navigator', 'info');
                    return null;
                  }
                }

                if (shieldsRaised && playerShieldPoints > 0 && !inNebula) {
                  setTacticalShieldRipples((prevR) => [
                    ...prevR.slice(-15),
                    { x: encounterShipPos.x, y: encounterShipPos.y, radius: 2, maxRadius: 20, life: 0, maxLife: 0.4, color: '#38bdf8', angle: Math.atan2(p.y - encounterShipPos.y, p.x - encounterShipPos.x) },
                  ]);
                } else {
                  setScreenShake(1.2);
                  setRedVignetteFlash(1.0);
                  const newSparks = Array.from({ length: 14 }, () => ({
                    x: encounterShipPos.x,
                    y: encounterShipPos.y,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    life: 0,
                    maxLife: 0.4 + Math.random() * 0.3,
                    color: '#ef4444',
                    size: 2 + Math.random() * 2,
                  }));
                  setTacticalSparks((sp) => [...sp.slice(-40), ...newSparks]);
                }

                const weaponType = p.sourceWeapon || (p.type === 'plasma' ? 'plasma bolt' : p.type);
                const raceName = p.sourceRace || activeEncounterGroup?.race || 'Alien';
                applyPlayerDamageChunk(p.damage, weaponType, raceName);
              }
              return null;
            }

            const moveStep = Math.min(dist, p.speed * dt);
            return {
              ...p,
              duration: nextDuration,
              x: p.x + (dx / dist) * moveStep,
              y: p.y + (dy / dist) * moveStep,
            };
          })
          .filter(Boolean) as TacticalProjectile[],
      );
    }

    // Encounter Pass simulation
    if (gameLocation === 'Encounter' && activeEncounterGroup && !gameOverModal && !victorySequenceModal) {
      combatDurationTimerRef.current += dt;
      passTimerRef.current += dt;
      if(updateFleetSurrender(activeEncounterGroup)) {
        setAlienCommsState(prev=>({...prev,alienPosture:'Obsequious'}));
        addMessage(`${activeEncounterGroup.race} vessels have surrendered. Their shields and weapons are down.`, 'Communications', 'info');
        handleSaveToSlot(activeSlot);
      }
      if(activeEncounterGroup.hasSurrendered) isCombatActiveRef.current=false;

      if (passTimerRef.current + 1e-9 >= DISTRESS_PASS_SECONDS) {
        passTimerRef.current = Math.max(0, passTimerRef.current - DISTRESS_PASS_SECONDS);
        const distressEvent = distressCallPass(activeEncounterGroup,
          !!activeEncounterGroup.hasSurrendered || activeEncounterGroup.posture === 'Obsequious', encounterShipPos);
        if (distressEvent === 'called') {
          addMessage("Captain, I'm picking up an alien distress call.", 'Communications', 'alert');
          handleSaveToSlot(activeSlot);
        } else if (distressEvent === 'arrived') {
          updateFleetSurrender(activeEncounterGroup);
          setAlienCommsState(prev => ({ ...prev, alienHailsCount: 0 }));
          setEncounterBannerText('CONTACT! REINFORCEMENTS WARPING IN');
          setEncounterBannerTimer(3.5);
          gameAudio.playRadarPing();
          addMessage('Captain, more alien ships have warped in.', 'Communications', 'alert');
          handleSaveToSlot(activeSlot);
        }
        const activeShips = activeEncounterGroup.ships;
        const totalEntities = 1 + activeShips.length;
        const currentPass = encounterPassIndexRef.current % totalEntities;
        encounterPassIndexRef.current++;

        if (currentPass === 0) {
          const degradedCap = Math.round((shieldClass * 500) * (subsystems.Shields / 100));
          if (shieldClass > 0 && shieldsRaised && !inNebula) {
            setPlayerShieldPoints((sp) => Math.min(degradedCap, sp + 20));
          }

          // Process single-keypress combat input buffer or active directional maneuvering
          const bufferedMove = combatInputBufferRef.current;
          combatInputBufferRef.current = null; // consume buffer

          if (bufferedMove && (bufferedMove.dx !== 0 || bufferedMove.dy !== 0)) {
            // Single keypress moves ship exactly 1 cell on simulation step
            const drive=encounterDriveStep(encounterDriveRef.current,engineClass,totalShipMass,subsystems.Engines,activeShips.filter(s=>!s.isWreck).length,inoperativeSystems.Engines,enduriumFuel,false);
            encounterDriveRef.current=drive;
            setEncounterShipPos((pos) => ({
              x: pos.x + bufferedMove.dx * drive.cells,
              y: pos.y + bufferedMove.dy * drive.cells,
            }));
            setShipHeading(Math.atan2(bufferedMove.dy, bufferedMove.dx));
          } else if (activeConsoleMenu === 'Maneuver' && (activeDirectionVector.dx !== 0 || activeDirectionVector.dy !== 0)) {
            const livingShipsCount = activeShips.filter((s) => !s.isWreck).length;
            const drive=encounterDriveStep(encounterDriveRef.current,engineClass,totalShipMass,subsystems.Engines,livingShipsCount,inoperativeSystems.Engines,enduriumFuel);
            encounterDriveRef.current=drive;
            setShipHeading(Math.atan2(activeDirectionVector.dy, activeDirectionVector.dx));
            setEncounterShipPos((pos) => ({
              x: pos.x + activeDirectionVector.dx * drive.cells,
              y: pos.y + activeDirectionVector.dy * drive.cells,
            }));
          } else {
            encounterDriveRef.current=stoppedEncounterDrive();
          }
        } else {
          const shipIndex = currentPass - 1;
          const alienShip = activeShips[shipIndex];

          if (alienShip && !alienShip.isWreck) {
            const dxToPlayer = encounterShipPos.x - alienShip.x;
            const dyToPlayer = encounterShipPos.y - alienShip.y;
            const distToPlayer = Math.hypot(dxToPlayer, dyToPlayer);

            if (!alienShip.isStationary) {
              if (activeEncounterGroup.posture === 'Hostile' || isCombatActiveRef.current) {
                // Hostile alien ships pursue to close the distance to ~3 cells when armed with lasers (or missiles/plasma if no lasers)
                const desiredDist = alienShip.laserClass > 0 ? 3 : (alienShip.missileClass > 0 || alienShip.hasPlasmaBolts ? 10 : 3);
                if (distToPlayer > desiredDist) {
                  // Move at most 1 cell per combat turn toward target
                  const stepX = Math.sign(dxToPlayer);
                  const stepY = Math.sign(dyToPlayer);
                  alienShip.x += Math.max(-1, Math.min(1, stepX));
                  alienShip.y += Math.max(-1, Math.min(1, stepY));
                }
              }
            }

            const isFighting = fleetCanFire(activeEncounterGroup,isCombatActiveRef.current);
            let shouldOpenFire = isFighting;

            if (shouldOpenFire && !(alienCommsState.active || alienCommsState.connected)) {
              const inFlightCount = projectiles.filter((p) => !p.fromPlayer).length;

              // Plasma Bolts (Uhlek)
              if (alienShip.hasPlasmaBolts && inFlightCount < 10) {
                if (Math.random() < 0.15) {
                  setProjectiles((prev) => [
                    ...prev,
                    {
                      id: `uhl-plasma-${Date.now()}-${Math.random()}`,
                      fromPlayer: false,
                      type: 'plasma',
                      x: alienShip.x,
                      y: alienShip.y,
                      targetX: encounterShipPos.x,
                      targetY: encounterShipPos.y,
                      playerLaunchX: encounterShipPos.x,
                      playerLaunchY: encounterShipPos.y,
                      targetIsPlayer: true,
                      speed: 14,
                      damage: 4000,
                      duration: 2.0,
                      maxDuration: 2.0,
                      color: '#d946ef',
                      sourceRace: alienShip.race,
                      sourceWeapon: 'plasma bolt',
                    },
                  ]);
                  gameAudio.playGunshotBlast();
                  addMessage('TACTICAL WARNING: Uhlek warship launched tracking PLASMA BOLT (4,000 yield)!', 'Captain', 'alert');
                }
              }

              // Missiles: fired at any range
              if (alienShip.missileClass > 0 && inFlightCount < 10) {
                if (Math.random() < 0.12) {
                  const mDmg = MISSILE_BASE_DAMAGE[alienShip.missileClass] || 200;
                  setProjectiles((prev) => [
                    ...prev,
                    {
                      id: `aln-mis-${Date.now()}-${Math.random()}`,
                      fromPlayer: false,
                      type: 'missile',
                      x: alienShip.x,
                      y: alienShip.y,
                      targetX: encounterShipPos.x,
                      targetY: encounterShipPos.y,
                      playerLaunchX: encounterShipPos.x,
                      playerLaunchY: encounterShipPos.y,
                      targetIsPlayer: true,
                      speed: 10,
                      damage: mDmg,
                      duration: 2.5,
                      maxDuration: 2.5,
                      color: '#ff2244',
                      sourceRace: alienShip.race,
                      sourceWeapon: 'missile',
                    },
                  ]);
                  gameAudio.playGunshotBlast();
                }
              }

              // Lasers: ONLY fired when within 5.0 cells (DeltaX <= 5 and DeltaY <= 5 and distance <= 5.0)
              const curDeltaX = Math.abs(alienShip.x - encounterShipPos.x);
              const curDeltaY = Math.abs(alienShip.y - encounterShipPos.y);
              const curDistToPlayer = Math.hypot(curDeltaX, curDeltaY);

              if (alienShip.laserClass > 0 && curDistToPlayer <= 5.0 && curDeltaX <= 5.0 && curDeltaY <= 5.0) {
                const roll = Math.random() * 100 + 1;
                if (8 * alienShip.fireDelay < roll) {
                  const rawBaseDmg = 2 * (LASER_BASE_DAMAGE[alienShip.laserClass] || 90);
                  const lDmg = Math.max(10, Math.round(rawBaseDmg * (1 - curDistToPlayer / 10)));
                  setProjectiles((prev) => [
                    ...prev,
                    {
                      id: `aln-las-${Date.now()}-${Math.random()}`,
                      fromPlayer: false,
                      type: 'laser',
                      x: alienShip.x,
                      y: alienShip.y,
                      targetX: encounterShipPos.x,
                      targetY: encounterShipPos.y,
                      targetIsPlayer: true,
                      speed: 50,
                      damage: lDmg,
                      duration: 0.2,
                      maxDuration: 0.2,
                      color: '#ff2244',
                      sourceRace: alienShip.race,
                      sourceWeapon: 'laser',
                    },
                  ]);
                  gameAudio.playArcadeLaser();
                }
              }
            }
          }
        }
      }

      const allBeyond22 = activeEncounterGroup.ships.every((ship) => {
        const dx = Math.abs(ship.x - encounterShipPos.x);
        const dy = Math.abs(ship.y - encounterShipPos.y);
        const dist = Math.hypot(ship.x - encounterShipPos.x, ship.y - encounterShipPos.y);
        return dx > 22 || dy > 22 || dist > 22;
      });

      if (allBeyond22 && activeConsoleMenu !== 'Combat') {
        terminateEncounter();
        return;
      }
    }

    // Space Flight Physics (Acceleration a = Thrust / Total Mass)
    const enginePerfFactor = Math.max(0.1, subsystems.Engines / 100);
    const massFactor = totalShipMass > 0 ? Math.min(1.5, Math.max(0.35, 110 / totalShipMass)) : 1.0;
    const propulsionAvailable=enginesAvailable(engineClass,subsystems.Engines,inoperativeSystems.Engines,enduriumFuel);

    if (gameLocation === 'Star System' && activeConsoleMenu === 'Maneuver') {
      const {dx,dy}=activeDirectionVector,angle=Math.atan2(dy,dx);
      const flight=advanceSystemFlight(Math.hypot(shipVx,shipVy),dt,(dx!==0||dy!==0)&&propulsionAvailable,engineClass,totalShipMass,subsystems.Engines,inoperativeSystems.Engines);
      if(dx!==0||dy!==0)setShipHeading(angle);
      setShipVx(Math.cos(angle)*flight.speed);setShipVy(Math.sin(angle)*flight.speed);
      const nextX=systemShipX+Math.cos(angle)*flight.distance,nextY=systemShipY+Math.sin(angle)*flight.distance;
      if(Math.hypot(nextX,nextY)>=SYSTEM_BOUNDARY_RADIUS)exitToHyperspace();
      else {setSystemShipX(nextX);setSystemShipY(nextY);}
    }

    if (gameLocation === 'Hyperspace') {
      if (shieldsRaised && isInsideNebula(galaxyShipX, galaxyShipY)) {
        setShieldsRaised(false);
        gameAudio.playErrorBuzz();
        addMessage('Magnetic disturbances in nebula causing energy fluctuations.', 'Engineer', 'alert');
        addMessage('Shields are down.', 'Engineer', 'alert');
      }

      // Decay flux cooldown timer
      if (fluxCooldownTimerRef.current > 0) {
        fluxCooldownTimerRef.current = Math.max(0, fluxCooldownTimerRef.current - dt);
      }

      // Check Continuum Flux Traversal (Wormhole pairs)
      // Check if ship moved off the exit destination
      if (fluxExitDestRef.current) {
        const distFromDest = Math.hypot(
          galaxyShipXRef.current - fluxExitDestRef.current[0],
          galaxyShipYRef.current - fluxExitDestRef.current[1]
        );
        // Only clear exit destination once ship has moved away and cooldown has expired
        if (distFromDest > 1.2 && fluxCooldownTimerRef.current <= 0) {
          fluxExitDestRef.current = null;
          lastTraversedFluxIdRef.current = null;
          isJumpingFluxRef.current = false;
        }
      }

      // Ensure jump happens exactly once and prevent concurrent/cascaded multi-triggering
      if (!isJumpingFluxRef.current && !fluxExitDestRef.current && fluxCooldownTimerRef.current <= 0) {
        const DIRS_8: [number, number][] = [
          [-1, -1], [0, -1], [1, -1],
          [-1,  0],          [1,  0],
          [-1,  1], [0,  1], [1,  1],
        ];

        for (const flux of CONTINUUM_FLUX_PAIRS) {
          const dFrom = Math.hypot(galaxyShipXRef.current - flux.from[0], galaxyShipYRef.current - flux.from[1]);
          const dTo = Math.hypot(galaxyShipXRef.current - flux.to[0], galaxyShipYRef.current - flux.to[1]);
          const threshold = 0.45; // Triggers ONLY upon entering exact coordinates

          if (dFrom < threshold || dTo < threshold) {
            const isFrom = dFrom < threshold;
            const destFluxCoord = isFrom ? flux.to : flux.from;
            const srcFluxCoord = isFrom ? flux.from : flux.to;

            isJumpingFluxRef.current = true;
            fluxCooldownTimerRef.current = 4.0;
            lastFluxTraverseTimeRef.current = nowSec;
            lastTraversedFluxIdRef.current = flux.id;

            const [dx, dy] = DIRS_8[Math.floor(Math.random() * DIRS_8.length)];
            const emergeX = Math.max(0, Math.min(249, destFluxCoord[0] + dx));
            const emergeY = Math.max(0, Math.min(219, destFluxCoord[1] + dy));

            fluxExitDestRef.current = [emergeX, emergeY];
            galaxyShipXRef.current = emergeX;
            galaxyShipYRef.current = emergeY;
            setGalaxyShipX(emergeX);
            setGalaxyShipY(emergeY);
            setFluxFlashTimer(0.9);
            gameAudio.playRetroJump();

            const nextFluxIds = traversedFluxIds.includes(flux.id) ? traversedFluxIds : [...traversedFluxIds, flux.id];
            setTraversedFluxIds(nextFluxIds);

            // Navigator bearing disorientation: (250 - navigationSkill) * 0.5 seconds
            const navSkill = navigatorSkill;
            const disorientDuration = Math.max(0, (250 - navSkill) * 0.5);
            setFluxDisorientationTimer(disorientDuration);

            addMessage(`CONTINUUM FLUX TRAVERSED: Spatial rift warped vessel from [${srcFluxCoord[0]}, ${srcFluxCoord[1]}] to [${emergeX}, ${emergeY}]!`, 'Navigator', 'info');

            handleSaveToSlot(activeSlot, {
              galaxyShipX: emergeX,
              galaxyShipY: emergeY,
              traversedFluxIds: nextFluxIds,
            });
            break;
          }
        }
      }

      if (activeConsoleMenu === 'Maneuver') {
        if (!propulsionAvailable) {
          setShipVx(0);
          setShipVy(0);
          return;
        }

        const { dx, dy } = activeDirectionVector;
        if (dx !== 0 || dy !== 0) {
          const angle = Math.atan2(dy, dx);
          setShipHeading(angle);

          const targetSpeed = 3.5 * enginePerfFactor * massFactor;
          const curVx = Math.cos(angle) * targetSpeed;
          const curVy = Math.sin(angle) * targetSpeed;

          const dCoordsX = curVx * dt;
          const dCoordsY = -curVy * dt;
          const distMoved = Math.hypot(dCoordsX, dCoordsY);
          const fuelUsed = distMoved * activeFuelBurnRate;

          const nextGX = Math.max(0, Math.min(249, galaxyShipXRef.current + dCoordsX));
          const nextGY = Math.max(0, Math.min(219, galaxyShipYRef.current + dCoordsY));
          galaxyShipXRef.current = nextGX;
          galaxyShipYRef.current = nextGY;

          setEnduriumFuel((f) => consumeFuel(f, fuelUsed));
          setGalaxyShipX(nextGX);
          setGalaxyShipY(nextGY);
        }
      }
    }

    if(gameLocation==='Hyperspace'&&!hyperspaceEnteringRef.current&&cinematicState==='none'){
      const arrival=hyperspaceArrival(UNIVERSE.stars,{x:galaxyShipXRef.current,y:galaxyShipYRef.current},hyperspaceDepartureStarRef.current);
      hyperspaceDepartureStarRef.current=arrival.departedId;
      if(arrival.star){enterStarSystem(arrival.star);return;}
    }

    if (!flightEncounterStartedRef.current && cinematicState==='none' && ['Hyperspace','Star System','In Orbit'].includes(gameLocation)) {
      const context={location:gameLocation,
        x:gameLocation==='Hyperspace'?galaxyShipXRef.current:systemShipXFrameRef.current,
        y:gameLocation==='Hyperspace'?galaxyShipYRef.current:systemShipYFrameRef.current,
        starX:currentStar.x,starY:currentStar.y,
        orbitSlot:orbitPlanetIndex===null?null:currentPlanets[orbitPlanetIndex]?.slot??null,
        cooldown:encounterCooldownTimerFrameRef.current,uhlekSilenced,
        droneClearance:grantedDroneClearanceUntilHyperspace,mechan9Unlocked};
      const hours=currentAbsDay*24+stardateHour;
      if(alienTrackingHourRef.current===null || hours<alienTrackingHourRef.current) alienTrackingHourRef.current=hours;
      if(hours-alienTrackingHourRef.current>=2) {
        alienTrackingHourRef.current=hours;
        const moved=trackFleets(alienGroupsRef.current,context,hasCrystalPearl);
        if(moved.length) {
          for(const group of moved) fleetChangesRef.current[group.id]=group;
          addMessage('Motion detected: alien vessels are approaching our position.', 'Science Officer', 'alert');
          handleSaveToSlot(activeSlot);
        }
      }
      const contact=flightEncounter(alienGroupsRef.current,context);
      if(contact) {triggerEncounter(contact);return;}
    }
  };

  // Helper to draw full-screen cover backdrops without tiling or gaps, applying safe source crop math per asset rules
  const drawCoverImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement | null | undefined,
    canvasW: number,
    canvasH: number,
    fallbackColor: string = '#030712',
    _isSpaceBackdrop = false,
  ) => {
    if (img && img.complete && img.naturalWidth > 0) {
      let sx = 0;
      let sy = 0;
      let sw = img.naturalWidth;
      let sh = img.naturalHeight;

      const src = (img.src || '').toLowerCase();
      if (src.includes('space_bg_d')) {
        // space_bg_d: Crop source rectangle strictly from sx = 0.20 * img.width to sw = 0.60 * img.width (20% to 80%) and full height
        sx = 0.20 * img.naturalWidth;
        sy = 0;
        sw = 0.60 * img.naturalWidth;
        sh = img.naturalHeight;
      } else if (src.includes('starport_space_bg')) {
        // starport_space_bg: Crop strictly from top third: sy = 0, sh = img.height * 0.33, sx = 0, sw = img.width
        sx = 0;
        sy = 0;
        sw = img.naturalWidth;
        sh = img.naturalHeight * 0.33;
      } else if (src.includes('room_ship_config_bg')) {
        // room_ship_config_bg: Crop strictly from top 72%: sy = 0, sh = img.height * 0.72, sx = 0, sw = img.width
        sx = 0;
        sy = 0;
        sw = img.naturalWidth;
        sh = img.naturalHeight * 0.72;
      }

      const scale = Math.max(canvasW / sw, canvasH / sh);
      const drawW = sw * scale;
      const drawH = sh * scale;
      const drawX = (canvasW - drawW) / 2;
      const drawY = (canvasH - drawH) / 2;

      const dpr = scenePixelRatio(gfxQuality,window.devicePixelRatio);
      const useSharpen = gfxQuality === 'High' && (drawW * dpr > sw || drawH * dpr > sh);
      const srcImg = useSharpen ? getUnsharpMaskCanvas(img, 0.6) : img;

      ctx.drawImage(srcImg, sx, sy, sw, sh, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = fallbackColor;
      ctx.fillRect(0, 0, canvasW, canvasH);
    }
  };

  // Helper to render seamless parallax space background across views (Cover scaled with clamped parallax offset so edges never appear)
  const drawParallaxSpaceBackground = (
    ctx: CanvasRenderingContext2D,
    bgImg: HTMLImageElement | null | undefined,
    canvasW: number,
    canvasH: number,
    offsetX: number,
    offsetY: number,
    parallaxFactor: number = 0.04,
    fallbackColor: string = '#030712',
  ) => {
    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      let sx = 0;
      let sy = 0;
      let sw = bgImg.naturalWidth;
      let sh = bgImg.naturalHeight;

      const src = (bgImg.src || '').toLowerCase();
      if (src.includes('space_bg_d')) {
        sx = 0.20 * bgImg.naturalWidth;
        sy = 0;
        sw = 0.60 * bgImg.naturalWidth;
        sh = bgImg.naturalHeight;
      } else if (src.includes('starport_space_bg')) {
        sx = 0;
        sy = 0;
        sw = bgImg.naturalWidth;
        sh = bgImg.naturalHeight * 0.33;
      } else if (src.includes('room_ship_config_bg')) {
        sx = 0;
        sy = 0;
        sw = bgImg.naturalWidth;
        sh = bgImg.naturalHeight * 0.72;
      }

      const baseScale = Math.max(canvasW / sw, canvasH / sh);
      const extraScale = 1.25; // 25% margin for smooth parallax panning without edge gaps
      const scale = baseScale * extraScale;
      const bgW = sw * scale;
      const bgH = sh * scale;
      const maxShiftX = (bgW - canvasW) / 2;
      const maxShiftY = (bgH - canvasH) / 2;
      const clampedShiftX = Math.max(-maxShiftX, Math.min(maxShiftX, -offsetX * parallaxFactor));
      const clampedShiftY = Math.max(-maxShiftY, Math.min(maxShiftY, -offsetY * parallaxFactor));
      const drawX = (canvasW - bgW) / 2 + clampedShiftX;
      const drawY = (canvasH - bgH) / 2 + clampedShiftY;

      const dpr = scenePixelRatio(gfxQuality,window.devicePixelRatio);
      const useSharpen = gfxQuality === 'High' && (bgW * dpr > sw || bgH * dpr > sh);
      const srcImg = useSharpen ? getUnsharpMaskCanvas(bgImg, 0.6) : bgImg;

      ctx.save();
      ctx.drawImage(srcImg, sx, sy, sw, sh, drawX, drawY, bgW, bgH);
      ctx.restore();
    } else {
      ctx.fillStyle = fallbackColor;
      ctx.fillRect(0, 0, canvasW, canvasH);
    }
  };

  // Canvas Viewport Rendering with Cel-Shaded Glow, Parallax, Procedural Shaders & Cinematics
  const draw = (ctx: CanvasRenderingContext2D) => {
    const surfaceWeatherParticles=surfaceWeatherParticlesFrameRef.current;
    const surfaceSonarPulse=surfaceSonarPulseFrameRef.current;
    const surfaceScanFadeTimer=surfaceScanFadeTimerFrameRef.current;
    const tractorBeamFx=tractorBeamFxFrameRef.current;
    const starFlareParticles=starFlareParticlesFrameRef.current;
    const fluxFlashTimer=fluxFlashTimerFrameRef.current;
    const tacticalSparks=tacticalSparksFrameRef.current;
    const tacticalExplosions=tacticalExplosionsFrameRef.current;
    const tacticalShieldRipples=tacticalShieldRipplesFrameRef.current;
    const missileSmokeTrails=missileSmokeTrailsFrameRef.current;
    const tractorSalvageFx=tractorSalvageFxFrameRef.current;
    const vehicleHold = vehicleHoldFrameRef.current;
    const crewRoster = crewRosterFrameRef.current;
    const subsystems = subsystemsFrameRef.current;
    const activeRepairTask = activeRepairTaskFrameRef.current;
    const projectiles = projectilesFrameRef.current;
    const encounterShipPos = encounterShipPosFrameRef.current;
    const encounterCooldownTimer = encounterCooldownTimerFrameRef.current;
    const laserCooldown = laserCooldownFrameRef.current;
    const missileCooldown = missileCooldownFrameRef.current;
    const questionCountdownTimer = questionCountdownTimerFrameRef.current;
    const hullIntegrity = hullIntegrityFrameRef.current;
    const playerArmorPoints = playerArmorPointsFrameRef.current;
    const playerShieldPoints = playerShieldPointsFrameRef.current;
    const cargoHold = cargoHoldFrameRef.current;
    const systemShipX = interpolatePosition(previousSystemPositionRef.current.x, systemShipXFrameRef.current, renderInterpolationRef.current);
    const systemShipY = interpolatePosition(previousSystemPositionRef.current.y, systemShipYFrameRef.current, renderInterpolationRef.current);
    const shipVx = shipVxFrameRef.current;
    const shipVy = shipVyFrameRef.current;
    const shipHeading = shipHeadingFrameRef.current;
    const enduriumFuel = enduriumFuelFrameRef.current;
    const flightEngineThrust=enginesAvailable(engineClass,subsystems.Engines,inoperativeSystems.Engines,enduriumFuel)?1:0;
    const galaxyShipX = galaxyShipXFrameRef.current;
    const galaxyShipY = galaxyShipYFrameRef.current;
    const orbitAnimPhase = interpolatePosition(previousOrbitPhaseRef.current,orbitAnimPhaseFrameRef.current,renderInterpolationRef.current);
    const currentPlanets=survivingPlanets(currentStar.planets,currentStar.x,currentStar.y,destroyedPlanetKeys).map(p=>({...p,...systemPlanetPosition(p,orbitAnimPhase/.4)}));
    const orbitTransitionProgress = interpolatePosition(previousOrbitTransitionRef.current,orbitTransitionProgressFrameRef.current,renderInterpolationRef.current);
    const radarScanAngle = radarScanAngleFrameRef.current;
    const warpStreakParticles = warpStreakParticlesFrameRef.current;
    const commsTypewriterElapsed = commsTypewriterElapsedFrameRef.current;
    const alienEyeBlinkTimer = alienEyeBlinkTimerFrameRef.current;
    const astronautX = astronautXFrameRef.current;
    const astronautY = astronautYFrameRef.current;
    const astronautVx = astronautVxFrameRef.current;
    const astronautVy = astronautVyFrameRef.current;
    const astronautFacing = astronautFacingFrameRef.current;
    const astronautScaleX = astronautScaleXFrameRef.current;
    const astronautAnimFrame = astronautAnimFrameFrameRef.current;
    const astronautIdleTimer = astronautIdleTimerFrameRef.current;
    const astronautDistanceTraveled = astronautDistanceTraveledFrameRef.current;
    const ambientScrubbots = ambientScrubbotsFrameRef.current;
    const hangarSparks = hangarSparksFrameRef.current;
    const transporterParticles = transporterParticlesFrameRef.current;
    const vehicleX = vehicleXFrameRef.current;
    const vehicleY = vehicleYFrameRef.current;
    const vehicleHeading = vehicleHeadingFrameRef.current;
    const vehicleFuel = vehicleFuelFrameRef.current;
    const surfaceWeaponBeam=surfaceWeaponBeamRef.current;
    const roverSuspensionBounce = roverSuspensionBounceFrameRef.current;
    const roverTireTracks = roverTireTracksFrameRef.current;
    const roverDustParticles = roverDustParticlesFrameRef.current;
    const screenShake = screenShakeFrameRef.current;
    const redVignetteFlash = redVignetteFlashFrameRef.current;
    const canvas = ctx.canvas;
    if(gameLocation!=='Landing'){delete canvas.dataset.surveyContacts;delete canvas.dataset.topography;}
    const rect = canvas.getBoundingClientRect();
    const curW = rect.width > 0 ? Math.round(rect.width) : (viewportRef.current.width || 1280);
    const curH = rect.height > 0 ? Math.round(rect.height) : (viewportRef.current.height || 720);
    viewportRef.current = { width: curW, height: curH };

    prepareCanvas(ctx, curW, curH,scenePixelRatio(gfxQuality,window.devicePixelRatio));

    const canvasWidth = curW;
    const canvasHeight = curH;

    const nowSec = performance.now() / 1000;

    // Helper for rendering Canvas Sprite Inspector Name Tags when Labels switch is ON
    const drawSpriteLabel = (
      labelId: string,
      x: number,
      y: number,
      color = '#00f0ff',
      offsetY = -18,
    ) => {
      if (!devLabelsEnabled) return;
      ctx.save();
      ctx.font = 'bold 10px "Courier New", monospace';
      const textWidth = ctx.measureText(labelId).width;
      const padX = 4;
      const padY = 2;
      const boxW = textWidth + padX * 2;
      const boxH = 14;
      const boxX = x - boxW / 2;
      const boxY = y + offsetY - boxH / 2;

      ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelId, x, y + offsetY);
      ctx.restore();
    };

    // Apply Screen Shake if enabled
    if (screenShake > 0 && screenShakeEnabled) {
      const shakeAmt = screenShake * 6;
      const offsetX = (Math.random() - 0.5) * shakeAmt;
      const offsetY = (Math.random() - 0.5) * shakeAmt;
      ctx.translate(offsetX, offsetY);
    }

    const drawCinematicShip=(x:number,y:number,length:number,heading:number,moving:boolean)=>drawUnifiedPlayerShip({ctx,x,y,headingRad:heading,lengthPx:length,engineClass,isMoving:moving,cargoPodsCount:cargoPods,shieldsActive:false,inNebula:false,assets,armorClass,missileClass,laserClass,weaponsArmed:false,nowSec});
    const drawPlanetCinematic=(planet:StarPlanet|null,approach:number)=>{
      ctx.save();
      ctx.fillStyle=planet?.color??'#152132';ctx.fillRect(0,0,canvasWidth,canvasHeight);
      if(planet){
        const {assetKey,tintColor}=getPlanetMapAssetKey(planet,currentStar.x,currentStar.y);
        const zoom=1+Math.max(0,Math.min(1,approach))*.6;
        ctx.translate(canvasWidth/2,canvasHeight/2);ctx.scale(zoom,zoom);ctx.translate(-canvasWidth/2,-canvasHeight/2);
        drawCoverImage(ctx,assetKey?assets[assetKey]:null,canvasWidth,canvasHeight,planet.color);
        if(tintColor){ctx.fillStyle=tintColor;ctx.fillRect(0,0,canvasWidth,canvasHeight);}
      }
      ctx.restore();
      if(planet&&planet.atmosphereDensity!=='None'){
        ctx.save();ctx.fillStyle=planet.type==='Molten'?'#c59b86':'#dcecf5';
        for(let cloud=0;cloud<7;cloud++){
          ctx.globalAlpha=.07+.08*Math.sin(Math.PI*approach);
          const x=((cloud*.27+nowSec*.007)%1.4-.2)*canvasWidth,y=((cloud*.41)%1)*canvasHeight;
          ctx.beginPath();ctx.ellipse(x,y,canvasWidth*.2,canvasHeight*.06,-.2,0,Math.PI*2);ctx.fill();
        }ctx.restore();
      }
      const light=ctx.createLinearGradient(0,0,canvasWidth,canvasHeight);light.addColorStop(0,'#07132405');light.addColorStop(1,'#07132477');
      ctx.fillStyle=light;ctx.fillRect(0,0,canvasWidth,canvasHeight);
    };

    const fixedBayShot=cinematicState==='launch'||cinematicState==='dock'?cinematicState:null;
    if(fixedBayShot&&bayVideoPlayer.draw(ctx,canvasWidth,canvasHeight,fixedBayShot,
      cinematicTimerRef.current,cinematicDurationRef.current,{engineClass,cargoPods,armorClass,shieldClass,laserClass,missileClass},
      gameStateRef.current.status==='PLAYING'&&!isSimulationPaused&&!document.hidden,missionEpochRef.current)){
      ctx.fillStyle='#000000aa';ctx.fillRect(0,canvasHeight-58,canvasWidth,58);
      ctx.textAlign='center';ctx.fillStyle=fixedBayShot==='dock'?'#6ce5dc':'#00f0ff';
      ctx.font='bold '+Math.min(16,canvasWidth/32)+'px Orbitron,sans-serif';
      ctx.fillText(fixedBayShot==='dock'?'DOCKING SEQUENCE':'LAUNCH SEQUENCE',canvasWidth/2,canvasHeight-30,canvasWidth-20);
      ctx.font='12px Rajdhani,sans-serif';ctx.fillStyle='#b8c5d2';ctx.fillText('[ENTER / SPACE / CLICK TO SKIP]',canvasWidth/2,canvasHeight-10);
      return;
    }
    if(fixedBayShot&&ctx.canvas?.dataset)ctx.canvas.dataset.cinematicSource='live-'+fixedBayShot;

    // A. Bay departure: constant altitude, forward depth and perspective foreshortening.
    if (cinematicState === 'launch') {
      const prog=cinematicProgress(cinematicTimerRef.current,cinematicDurationRef.current);
      const pose=drawBayDeparture(ctx,canvasWidth,canvasHeight,prog,{engineClass,cargoPodsCount:cargoPods,armorClass,missileClass,laserClass},gfxQuality);
      const captionLines=canvasWidth<600?pose.stage.split(' · '):[pose.stage];
      const captionHeight=captionLines.length>1?66:52;
      ctx.fillStyle='#000000aa';ctx.fillRect(0,canvasHeight-captionHeight,canvasWidth,captionHeight);
      ctx.fillStyle='#00f0ff';ctx.font='bold '+Math.min(16,canvasWidth/28)+'px "Orbitron", "Rajdhani", sans-serif';ctx.textAlign='center';
      captionLines.forEach((line,index)=>ctx.fillText(line,canvasWidth/2,canvasHeight-28-(captionLines.length-1-index)*18));
      ctx.font='12px "Rajdhani", sans-serif';ctx.fillStyle='#94a3b8';ctx.fillText('[ENTER / SPACE / CLICK TO SKIP]',canvasWidth/2,canvasHeight-10);
      return;
    }

    // Arrival shares the approved painted 3D scene and current equipment.
    if(cinematicState==='dock'){
      const prog=cinematicProgress(cinematicTimerRef.current,cinematicDurationRef.current);
      const pose=drawBayDeparture(ctx,canvasWidth,canvasHeight,prog,{engineClass,cargoPodsCount:cargoPods,armorClass,laserClass,missileClass},gfxQuality,true);
      ctx.fillStyle='#000000aa';ctx.fillRect(0,canvasHeight-58,canvasWidth,58);ctx.textAlign='center';ctx.fillStyle='#6ce5dc';ctx.font='bold '+Math.min(16,canvasWidth/32)+'px Orbitron,sans-serif';ctx.fillText(pose.stage,canvasWidth/2,canvasHeight-30,canvasWidth-20);
      ctx.font='12px Rajdhani,sans-serif';ctx.fillStyle='#b8c5d2';ctx.fillText('[ENTER / SPACE / CLICK TO SKIP]',canvasWidth/2,canvasHeight-10);return;
    }

    // C. DESCENT CINEMATIC (3 Seconds) with painted atmospheric descent backdrop
    if (cinematicState === 'descent') {
      const prog=cinematicProgress(cinematicTimerRef.current,cinematicDurationRef.current);
      const p = orbitPlanetIndex !== null ? currentPlanets[orbitPlanetIndex] : null;
      const hasAtmosphere = p && p.atmosphereDensity !== 'None';

      drawPlanetCinematic(p,prog);

      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;

      // Re-entry heat plasma glow (Suppressed on airless worlds)
      if (hasAtmosphere && prog < 0.75) {
        const heatAlpha = Math.sin(prog * Math.PI) * 0.85;
        const heatGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 280);
        heatGrad.addColorStop(0, `rgba(255, 100, 20, ${heatAlpha * 0.8})`);
        heatGrad.addColorStop(0.5, `rgba(255, 50, 0, ${heatAlpha * 0.4})`);
        heatGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = heatGrad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Retrothrust comes from the actual illustrated engines, trailing below the hull.
      drawCinematicShip(cx,cy+prog*35,Math.min(210,canvasWidth*.28)*(1+prog*.18),-Math.PI/2,prog>.35);

      // HUD
      ctx.fillStyle = '#000000aa';
      ctx.fillRect(0, canvasHeight - 52, canvasWidth, 52);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 16px "Orbitron", "Rajdhani", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${hasAtmosphere?'ATMOSPHERIC':'POWERED'} DESCENT • ${p?.name.toUpperCase() || 'PLANET'}`, canvasWidth / 2, canvasHeight - 28);
      ctx.font = '12px "Rajdhani", sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('[ENTER / SPACE / CLICK TO SKIP]', canvasWidth / 2, canvasHeight - 10);
      return;
    }

    // D. SURFACE LAUNCH CINEMATIC (3 Seconds) with painted atmospheric ascent backdrop
    if (cinematicState === 'surface_launch') {
      const t = Math.max(0, 3.0 - cinematicTimer);
      const prog = t / 3.0; // 0 to 1
      const p = orbitPlanetIndex !== null ? currentPlanets[orbitPlanetIndex] : null;

      drawPlanetCinematic(p,1-prog);

      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;

      drawCinematicShip(cx,cy+90-prog*prog*290,Math.min(210,canvasWidth*.28)*(1.15-prog*.45),-Math.PI/2,true);

      // HUD
      ctx.fillStyle = '#000000aa';
      ctx.fillRect(0, canvasHeight - 52, canvasWidth, 52);
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 16px "Orbitron", "Rajdhani", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ORBITAL ASCENT • ESCAPING GRAVITY WELL', canvasWidth / 2, canvasHeight - 28);
      ctx.font = '12px "Rajdhani", sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('[ENTER / SPACE / CLICK TO SKIP]', canvasWidth / 2, canvasHeight - 10);
      return;
    }

    // ------------------------------------------------------------------------
    // E. THE LANDING SCREEN (G4: 2:1 Flat Map Projection & Dusk Site Backdrop)
    // ------------------------------------------------------------------------
    if (gameLocation === 'Landing' && orbitPlanetIndex !== null) {
      const p = currentPlanets[orbitPlanetIndex];

      // The preview uses this planet's terrain, with no unrelated parked ship baked in.
      drawPlanetCinematic(p,.35);

      // Soft dark glassmorphic scrim over backdrop for map contrast
      ctx.fillStyle = 'rgba(3, 7, 20, 0.65)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Map bounds
      const bounds = landingMapBounds(canvasWidth,canvasHeight);
      const {x:mapX,y:mapY,width:mapW,height:mapH}=bounds;
      canvas.dataset.landingMapBounds=JSON.stringify(bounds);

      // Background frame
      ctx.fillStyle = '#050a1b';
      ctx.fillRect(mapX, mapY, mapW, mapH);

      const { assetKey: landingAssetKey, tintColor: landingTintColor } = getPlanetMapAssetKey(
        p,
        currentStar.x,
        currentStar.y,
      );
      const landingMapImg = landingAssetKey ? assets[landingAssetKey] : null;

      if (landingMapImg && landingMapImg.complete && landingMapImg.naturalWidth > 0) {
        // Draw the exact 2:1 flat surface map texture matching orbital sphere view
        ctx.save();
        ctx.drawImage(landingMapImg, mapX, mapY, mapW, mapH);
        if (landingTintColor) {
          ctx.fillStyle = landingTintColor;
          ctx.fillRect(mapX, mapY, mapW, mapH);
        }
        ctx.restore();
      } else {
        // High-density procedural 2:1 surface terrain elevation rendering
        const cols = 64;
        const rows = 32;
        const cellW = mapW / cols;
        const cellH = mapH / rows;

        for (let r = 0; r < rows; r++) {
          const lat = 90 - (r / rows) * 180;
          for (let c = 0; c < cols; c++) {
            const long = -180 + (c / cols) * 360;
            const elev = getSurfaceElevation(long, lat, currentStar.x * 100 + currentStar.y + (p.slot || 1), p.hydrospherePercent, p.type);

            if (elev === 'Liquid') {
              ctx.fillStyle = p.type === 'Molten' ? '#7f1d1d' : p.type === 'Frozen' ? '#0369a1' : '#075985';
            } else if (elev === 'Lowland') {
              ctx.fillStyle = p.type === 'Molten' ? '#b45309' : p.type === 'Frozen' ? '#bae6fd' : p.type === 'Crystal' ? '#c084fc' : '#15803d';
            } else if (elev === 'Highland') {
              ctx.fillStyle = p.type === 'Molten' ? '#ea580c' : p.type === 'Frozen' ? '#f0f9ff' : p.type === 'Crystal' ? '#e879f9' : '#ca8a04';
            } else {
              // Mountains
              ctx.fillStyle = p.type === 'Molten' ? '#451a03' : p.type === 'Frozen' ? '#ffffff' : '#64748b';
            }

            ctx.fillRect(mapX + c * cellW, mapY + r * cellH, cellW + 0.5, cellH + 0.5);
          }
        }
      }

      const surfaceSeed=(currentStar.x*73856093)^(currentStar.y*19349663)^(p.slot*83492791);
      const elevationMap=planetTopography(surfaceSeed,p.hydrospherePercent,p.type);
      if(elevationMap){ctx.save();ctx.globalAlpha=.92;ctx.imageSmoothingEnabled=true;ctx.drawImage(elevationMap,mapX,mapY,mapW,mapH);ctx.restore();}
      canvas.dataset.topography='true';
      const scan=planetaryScanRef.current;if(scan&&scan.elapsed<3)drawSensorSweep(ctx,{x:mapX,y:mapY,width:mapW,height:mapH},scan.elapsed/3,nowSec);

      // Glowing Holographic Lat/Long Grid Lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 1;
      for (let latStep = -60; latStep <= 60; latStep += 30) {
        const gy = mapY + ((90 - latStep) / 180) * mapH;
        ctx.beginPath();
        ctx.moveTo(mapX, gy);
        ctx.lineTo(mapX + mapW, gy);
        ctx.stroke();

        ctx.fillStyle = '#00f0ff88';
        ctx.font = '9px "Rajdhani", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${latStep >= 0 ? `${latStep}°N` : `${Math.abs(latStep)}°S`}`, mapX - 6, gy + 3);
      }

      for (let longStep = -120; longStep <= 120; longStep += 60) {
        const gx = mapX + ((longStep + 180) / 360) * mapW;
        ctx.beginPath();
        ctx.moveTo(gx, mapY);
        ctx.lineTo(gx, mapY + mapH);
        ctx.stroke();

        ctx.fillStyle = '#00f0ff88';
        ctx.font = '9px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${longStep >= 0 ? `${longStep}°E` : `${Math.abs(longStep)}°W`}`, gx, mapY + mapH + 12);
      }

      // Hand Test 16: Control Nexus Targeting Beacon at 47N x 45E
      const isCrystalPlanetLanding = currentStar.x === 192 && currentStar.y === 152 && (orbitPlanetIndex === 0 || p.orderIndex === 0);
      if (isCrystalPlanetLanding && (hasCrystalCone || devUsed || isDevPanelOpen)) {
        const nexusTargetX = mapX + ((45 + 180) / 360) * mapW;
        const nexusTargetY = mapY + ((90 - 47) / 180) * mapH;

        ctx.save();
        ctx.strokeStyle = '#e879f9';
        ctx.shadowColor = '#e879f9';
        ctx.shadowBlur = 16;
        ctx.lineWidth = 2.5;

        // Pulsing diamond / crosshair for Master Control Nexus
        const nPulse = 16 + Math.sin(nowSec * 8) * 4;
        ctx.beginPath();
        ctx.moveTo(nexusTargetX, nexusTargetY - nPulse);
        ctx.lineTo(nexusTargetX + nPulse, nexusTargetY);
        ctx.moveTo(nexusTargetX + nPulse, nexusTargetY);
        ctx.lineTo(nexusTargetX, nexusTargetY + nPulse);
        ctx.moveTo(nexusTargetX, nexusTargetY + nPulse);
        ctx.lineTo(nexusTargetX - nPulse, nexusTargetY);
        ctx.moveTo(nexusTargetX - nPulse, nexusTargetY);
        ctx.lineTo(nexusTargetX, nexusTargetY - nPulse);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(nexusTargetX, nexusTargetY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Control Nexus Badge
        ctx.fillStyle = 'rgba(5, 10, 26, 0.92)';
        ctx.fillRect(nexusTargetX - 75, nexusTargetY + nPulse + 4, 150, 20);
        ctx.strokeStyle = '#e879f9';
        ctx.lineWidth = 1;
        ctx.strokeRect(nexusTargetX - 75, nexusTargetY + nPulse + 4, 150, 20);
        ctx.fillStyle = '#e879f9';
        ctx.font = 'bold 10px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★ CONTROL NEXUS (47N 45E) ★', nexusTargetX, nexusTargetY + nPulse + 18);
        ctx.restore();
      }

      const surveySurface=planetSurfacesRef.current[planetKey(currentStar.x,currentStar.y,p.orderIndex)];
      const surveyContacts=visibleSurveyContacts(surveySurface);
      drawSurveyContacts(ctx,surveyContacts,c=>({x:mapX+(c.lon+180)/360*mapW,y:mapY+(90-c.lat)/180*mapH,radius:c.uncertaintyKm*.2/360*mapW}),{x:mapX,y:mapY,width:mapW,height:mapH});
      canvas.dataset.surveyContacts=JSON.stringify(surveyContacts);

      // Target Coordinates Crosshair Reticle on 2:1 Map
      const targetReticleX = mapX + ((landingLong + 180) / 360) * mapW;
      const targetReticleY = mapY + ((90 - landingLat) / 180) * mapH;

      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;

      // Pulsing circle
      const rPulse = 14 + Math.sin(nowSec * 6) * 3;
      ctx.beginPath();
      ctx.arc(targetReticleX, targetReticleY, rPulse, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair lines
      ctx.beginPath();
      ctx.moveTo(targetReticleX - 22, targetReticleY);
      ctx.lineTo(targetReticleX + 22, targetReticleY);
      ctx.moveTo(targetReticleX, targetReticleY - 22);
      ctx.lineTo(targetReticleX, targetReticleY + 22);
      ctx.stroke();

      // Target Coordinate Badge
      ctx.fillStyle = '#000000dd';
      ctx.fillRect(targetReticleX - 45, targetReticleY - 32, 90, 18);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1;
      ctx.strokeRect(targetReticleX - 45, targetReticleY - 32, 90, 18);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 10px "Rajdhani", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `[${landingLat >= 0 ? `${+landingLat.toFixed(2)}N` : `${+Math.abs(landingLat).toFixed(2)}S`} ${landingLong >= 0 ? `${+landingLong.toFixed(2)}E` : `${+Math.abs(landingLong).toFixed(2)}W`}]`,
        targetReticleX,
        targetReticleY - 19,
      );
      ctx.restore();

      // Outer Hologram Frame
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(mapX, mapY, mapW, mapH);

      // Top Header
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 16px "Orbitron", "Rajdhani", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`PLANETARY FLAT SURFACE PROJECTION • ${p.name.toUpperCase()}`, canvasWidth / 2, 35, canvasWidth-24);
      ctx.font = '11px "Rajdhani", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Select landing coordinates with mouse click or arrow keys, then initiate descent burn.', canvasWidth / 2, 52,canvasWidth-24);
      return;
    }

    // ------------------------------------------------------------------------
    // F. ON PLANET & TERRAIN VEHICLE SURFACE VIEW (CONTINUOUS SEAMLESS ELEVATION - ZERO SQUARE ARTIFACTS)
    // ------------------------------------------------------------------------
    if (gameLocation === 'On Planet' || gameLocation === 'Terrain Vehicle') {
      const p = orbitPlanetIndex !== null ? currentPlanets[orbitPlanetIndex] : currentPlanets[0];
      const cameraWorldX = gameLocation === 'Terrain Vehicle' ? vehicleX : 0;
      const cameraWorldY = gameLocation === 'Terrain Vehicle' ? vehicleY : 0;
      const worldScale = 38*groundZoomRef.current; // presentation zoom; world distances unchanged

      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;

      // 1. SELECT MATCHING SEAMLESS GROUND TEXTURE ASSET
      let groundTextureKey = 'ground_texture_rock';
      let groundOverlayColor: string | null = null;
      const isCrystalPlanetSurface = (currentStar.x === 192 && currentStar.y === 152 && (orbitPlanetIndex === 0 || p.orderIndex === 0)) || p.type === 'Crystal';

      if (isCrystalPlanetSurface) {
        // Hand Test 16: Crystalline / blue-cyan crystal ground texturing
        groundTextureKey = 'ground_texture_frozen';
        groundOverlayColor = 'rgba(56, 189, 248, 0.22)'; // crystalline cyan-blue facet sheen
      } else if (p.type === 'Frozen') {
        groundTextureKey = 'ground_texture_frozen';
      } else if (p.type === 'Molten') {
        groundTextureKey = 'ground_texture_molten';
      } else if (p.type === 'Liquid') {
        groundTextureKey = 'ground_texture_shore';
      } else {
        // Rock / Gas Giant / Terrestrial
        groundTextureKey = 'ground_texture_rock';
      }

      const groundImg = assets[groundTextureKey];
      const tileSize = 256*groundZoomRef.current; // seamless repeating texture tile size
      const camPxX = cameraWorldX * worldScale;
      const camPxY = cameraWorldY * worldScale;

      const minCol = Math.floor((-cx + camPxX) / tileSize);
      const maxCol = Math.ceil((canvasWidth - cx + camPxX) / tileSize);
      const minRow = Math.floor((-cy + camPxY) / tileSize);
      const maxRow = Math.ceil((canvasHeight - cy + camPxY) / tileSize);

      if (groundImg && groundImg.complete && groundImg.naturalWidth > 0) {
        // Base Layer (Pass 1)
        const columns=boundedGridIndices(minCol,maxCol),rows=boundedGridIndices(minRow,maxRow);
        for (const col of columns) {
          for (const row of rows) {
            const screenX = col * tileSize - camPxX + cx;
            const screenY = row * tileSize - camPxY + cy;
            drawGroundTile(ctx,groundImg,col,row,screenX,screenY,tileSize);
          }
        }

        // Dual-offset Noise Perturbation Pass 2: Blends texture seamlessly at different scale & offset to break grid repetition
        ctx.save();
        ctx.globalAlpha = 0.32;
        const pertTileSize = Math.round(tileSize * 1.414);
        const pertOffsetX = camPxX + 128;
        const pertOffsetY = camPxY + 64;
        const pMinCol = Math.floor((-cx + pertOffsetX) / pertTileSize);
        const pMaxCol = Math.ceil((canvasWidth - cx + pertOffsetX) / pertTileSize);
        const pMinRow = Math.floor((-cy + pertOffsetY) / pertTileSize);
        const pMaxRow = Math.ceil((canvasHeight - cy + pertOffsetY) / pertTileSize);

        const pertColumns=boundedGridIndices(pMinCol,pMaxCol),pertRows=boundedGridIndices(pMinRow,pMaxRow);
        for (const col of pertColumns) {
          for (const row of pertRows) {
            const screenX = col * pertTileSize - pertOffsetX + cx;
            const screenY = row * pertTileSize - pertOffsetY + cy;
            drawGroundTile(ctx,groundImg,col,row,screenX,screenY,pertTileSize);
          }
        }
        ctx.restore();
      } else {
        // Fallback base color
        ctx.fillStyle = p?.color || '#1e293b';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Seed-based tinting or crystal overlay
      if (groundOverlayColor) {
        ctx.save();
        ctx.fillStyle = groundOverlayColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
      }

      // 2. CONTINUOUS GROUND SURFACE ELEVATION SHADING (CONTINUOUS SUBPIXEL COSINE / BICUBIC GRADIENTS - ZERO BOX SEAMS)
      // Evaluate smooth continuous height curves across the viewport
      const nodeMargin=140/worldScale;
      const elevationColumns=boundedGridIndices(Math.floor((cameraWorldX-cx/worldScale-nodeMargin)/4),Math.ceil((cameraWorldX+cx/worldScale+nodeMargin)/4));
      const elevationRows=boundedGridIndices(Math.floor((cameraWorldY-cy/worldScale-nodeMargin)/4),Math.ceil((cameraWorldY+cy/worldScale+nodeMargin)/4));
      for(const gx of elevationColumns) {
      for(const gy of elevationRows) {
        const nodeWorldX=gx*4+2,nodeWorldY=gy*4+2;
        const coords=surfaceCoordinates(landingLat,landingLong,nodeWorldX,nodeWorldY);
        const nodeClampedLat=coords.lat,nodeWrappedLong=coords.lon;
        const nodeElev = getSurfaceElevation(nodeWrappedLong, nodeClampedLat, currentStar.x * 100 + currentStar.y + (p.slot || 1), p.hydrospherePercent, p.type);

        const nodeScreenX = cx + (nodeWorldX - cameraWorldX) * worldScale;
        const nodeScreenY = cy + (nodeWorldY - cameraWorldY) * worldScale;
        const nodeRadius = 140;

        if (nodeElev === 'Liquid') {
          if (p.type === 'Molten') {
            const lavaGrad = ctx.createRadialGradient(nodeScreenX, nodeScreenY, 10, nodeScreenX, nodeScreenY, nodeRadius);
            const pulse = Math.sin(nowSec * 3 + nodeWorldX*.7+nodeWorldY*.4) * 0.08 + 0.22;
            lavaGrad.addColorStop(0, `rgba(239, 68, 68, ${pulse + 0.1})`);
            lavaGrad.addColorStop(0.5, `rgba(249, 115, 22, ${pulse})`);
            lavaGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = lavaGrad;
            ctx.beginPath();
            ctx.arc(nodeScreenX, nodeScreenY, nodeRadius, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === 'Liquid') {
            const waterGrad = ctx.createRadialGradient(nodeScreenX, nodeScreenY, 15, nodeScreenX, nodeScreenY, nodeRadius);
            const wave = Math.sin(nowSec * 2.5 + nodeWorldX*.7+nodeWorldY*.4) * 0.06 + 0.18;
            waterGrad.addColorStop(0, `rgba(56, 189, 248, ${wave + 0.08})`);
            waterGrad.addColorStop(0.6, `rgba(14, 116, 144, ${wave})`);
            waterGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = waterGrad;
            ctx.beginPath();
            ctx.arc(nodeScreenX, nodeScreenY, nodeRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (nodeElev === 'Mountains') {
          const mountGrad = ctx.createRadialGradient(nodeScreenX - 30, nodeScreenY - 30, 20, nodeScreenX, nodeScreenY, nodeRadius);
          mountGrad.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
          mountGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.12)');
          mountGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = mountGrad;
          ctx.beginPath();
          ctx.arc(nodeScreenX, nodeScreenY, nodeRadius, 0, Math.PI * 2);
          ctx.fill();
        } else if (nodeElev === 'Lowland') {
          const lowGrad = ctx.createRadialGradient(nodeScreenX, nodeScreenY, 10, nodeScreenX, nodeScreenY, nodeRadius);
          lowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.14)');
          lowGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = lowGrad;
          ctx.beginPath();
          ctx.arc(nodeScreenX, nodeScreenY, nodeRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      }
      // SCATTERED MICRO-DETAILS: Rocks, pebbles, alien flora
      for (let i = 0; i < 24; i++) {
        const rx = ((i * 197.3 - cameraWorldX * worldScale) % (canvasWidth + 100) + canvasWidth + 100) % (canvasWidth + 100) - 50;
        const ry = ((i * 131.7 - cameraWorldY * worldScale) % (canvasHeight + 100) + canvasHeight + 100) % (canvasHeight + 100) - 50;

        if (p.bioDensity > 0 && i % 3 === 0) {
          // Alien Flora Spire
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(rx, ry, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Environmental Pebble
          ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
          ctx.beginPath();
          ctx.arc(rx, ry, (i % 3) + 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // TIRE TRACKS TRAILS
      roverTireTracks.forEach((track) => {
        const sx = cx + (track.x - cameraWorldX) * worldScale;
        const sy = cy + (track.y - cameraWorldY) * worldScale;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(track.heading);
        ctx.fillStyle = `rgba(15, 23, 42, ${track.alpha * 0.7})`;
        ctx.fillRect(-6, -10, 12, 3);
        ctx.fillRect(-6, 7, 12, 3);
        ctx.restore();
      });

      // WHEEL DUST PARTICLES
      roverDustParticles.forEach((dp) => {
        const sx = cx + (dp.x - cameraWorldX) * worldScale;
        const sy = cy + (dp.y - cameraWorldY) * worldScale;
        ctx.save();
        ctx.fillStyle = `rgba(212, 212, 216, ${1 - dp.life / dp.maxLife})`;
        ctx.beginPath();
        ctx.arc(sx, sy, dp.size * (1 - dp.life / dp.maxLife), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 3. LANDED STARSHIP (ship_hull_bare_topdown_1k.png INTEGRATION) (at 0, 0 in planet world coords)
      const landedShipW=208*groundZoomRef.current,landedShipH=landedShipW/(1087/602);
      const apronX=cx-cameraWorldX*worldScale,apronY=cy-cameraWorldY*worldScale;
      const anchor=groundShipAnchor(apronX,apronY,landedShipW,landedShipH,shipHeading,groundZoomRef.current);
      const shipScreenX=anchor.x,shipScreenY=anchor.y;
      ctx.save();ctx.strokeStyle='#d8c89988';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(apronX,apronY,24*groundZoomRef.current,15*groundZoomRef.current,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      if(ctx.canvas?.dataset){ctx.canvas.dataset.groundZoom=String(groundZoomRef.current);ctx.canvas.dataset.shipApron=JSON.stringify({x:apronX,y:apronY,hullX:shipScreenX,hullY:shipScreenY});}
      ctx.save();ctx.translate(shipScreenX,shipScreenY);ctx.rotate(shipHeading);
      const landedShipImg = assets['ship_hull_bare_topdown_1k'] || assets['ship_hull_bare_topdown'];
      const cargoPodImg = assets['ship_cargo_pod_sprite'];

      // A. SOFT ELLIPTICAL GROUND DROP SHADOW BENEATH VESSEL
      ctx.save();
      const shadowGrad = ctx.createRadialGradient(0, 8, 8, 0, 8, landedShipW * 0.46);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.35)');
      shadowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 10, landedShipW * 0.48, landedShipH * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      drawLandingGear(ctx,landedShipW,landedShipH);

      // Finished configuration image; landing gear and beacon remain animated separately.
      if (!drawConfiguredShip(ctx,{cargoPods,armorClass,laserClass,missileClass},-landedShipW/2,-landedShipH/2,landedShipW,landedShipH)) {
        if(landedShipImg?.complete&&landedShipImg.naturalWidth>0)ctx.drawImage(landedShipImg,-landedShipW/2,-landedShipH/2,landedShipW,landedShipH);
      }

      const beaconStrobe = Math.sin(nowSec * 8) > 0;
      ctx.fillStyle = beaconStrobe ? '#ef4444' : '#7f1d1d';
      ctx.beginPath();
      ctx.arc(0, -landedShipH / 2, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      const groundLabel=groundShipLabelPosition(shipScreenX,shipScreenY,landedShipW,landedShipH,shipHeading);
      ctx.save();ctx.fillStyle='#facc15';ctx.font='bold 11px "Orbitron", sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
      ctx.fillText(shipName.toUpperCase(),groundLabel.x,groundLabel.y);
      drawSpriteLabel('sprite-starship-base-camp',groundLabel.x,groundLabel.y+15,'#00f0ff');ctx.restore();

      // 4. SCAN FADEOUT VISIBILITY FOR OBJECT LABELS (Fades out over 4 seconds after scan pulse)
      const scanLabelAlpha = surfaceScanFadeTimer > 0 ? Math.min(1.0, surfaceScanFadeTimer / 1.0) : 0;

      // 5. SURFACE ENTITIES (Minerals, Ruins, Lifeforms, Dropped Cargo)
      if (currentSurfaceState) {
        // A. Minerals with mineral_deposit_sprite.png integration
        const mineralImg = assets['mineral_deposit_sprite'];
        currentSurfaceState.minerals.forEach((min) => {
          if (min.taken || min.volume <= 0) return;
          const mx = cx + (min.x - cameraWorldX) * worldScale;
          const my = cy + (min.y - cameraWorldY) * worldScale;

          const minColor = MINERAL_CATALOG.find((m) => m.name === min.name)?.color || '#00f0ff';
          ctx.save();
          ctx.translate(mx, my);

          // Deposit visual scale shrinks as its volume decreases
          const scaleFactor = Math.max(0.4, Math.min(1.2, Math.sqrt(min.volume / 8)));
          const mW = 36 * scaleFactor;
          const mH = mW / (757 / 594); // ~28.2px * scaleFactor

          if (mineralImg && mineralImg.complete && mineralImg.naturalWidth > 0) {
            ctx.drawImage(tintedSprite(mineralImg,`${minColor}66`), -mW / 2, -mH / 2, mW, mH);

            const twinkle = Math.sin(nowSec * 6 + min.x * 12 + min.y * 7);
            if (twinkle > 0.4) {
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = minColor;
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.arc(-4, -5, 2.5, 0, Math.PI * 2);
              ctx.arc(6, 2, 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          } else {
            ctx.fillStyle = minColor;
            ctx.shadowColor = minColor;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(5, -2);
            ctx.lineTo(3, 8);
            ctx.lineTo(-3, 8);
            ctx.lineTo(-5, -2);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Scan-only Name Label with Fadeout
          if (scanLabelAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = scanLabelAlpha;
            ctx.fillStyle = '#000000bb';
            const text = `${min.name} (${min.volume.toFixed(1)}m³)`;
            ctx.font = 'bold 9px "Rajdhani", sans-serif';
            const tw = ctx.measureText(text).width;
            ctx.fillRect(-tw / 2 - 4, -mH / 2 - 16, tw + 8, 14);
            ctx.strokeStyle = minColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(-tw / 2 - 4, -mH / 2 - 16, tw + 8, 14);
            ctx.fillStyle = minColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 0, -mH / 2 - 9);
            ctx.restore();
          }

          drawSpriteLabel(`sprite-mineral-${min.name.toLowerCase()}`, 0, -18, minColor);
          ctx.restore();
        });

        // B. Ruins (ruin_ancient_precursor_sprite.png & ruin_old_empire_sprite.png)
        const precursorRuinImg = assets['ruin_ancient_precursor_sprite'];
        const oldEmpireRuinImg = assets['ruin_old_empire_sprite'];

        currentSurfaceState.ruins.forEach((ruin) => {
          const rx = cx + (ruin.x - cameraWorldX) * worldScale;
          const ry = cy + (ruin.y - cameraWorldY) * worldScale;
          const isPrecursor = ruin.isControlNexus || ruin.loreTitle.toLowerCase().includes('precursor') || ruin.loreTitle.toLowerCase().includes('ancient');

          ctx.save();
          ctx.translate(rx, ry);

          const rSize = 54;

          if (isPrecursor && precursorRuinImg && precursorRuinImg.complete && precursorRuinImg.naturalWidth > 0) {
            const pH = rSize;
            const pW = pH * (941 / 945);
            ctx.drawImage(precursorRuinImg, -pW / 2, -pH / 2, pW, pH);

            if (ruin.isControlNexus) {
              const nexusGlow = Math.sin(nowSec * 4) * 0.25 + 0.75;
              ctx.strokeStyle = `rgba(232, 121, 249, ${nexusGlow})`;
              ctx.shadowColor = '#e879f9';
              ctx.shadowBlur = 18;
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.arc(0, 0, pW * 0.45, 0, Math.PI * 2);
              ctx.stroke();
              ctx.shadowBlur = 0;
            }
          } else if (!isPrecursor && oldEmpireRuinImg && oldEmpireRuinImg.complete && oldEmpireRuinImg.naturalWidth > 0) {
            const eH = rSize;
            const eW = eH * (808 / 812);
            ctx.drawImage(oldEmpireRuinImg, -eW / 2, -eH / 2, eW, eH);
          } else {
            // Procedural fallback
            if (ruin.isControlNexus) {
              ctx.fillStyle = '#e879f9';
              ctx.shadowColor = '#e879f9';
              ctx.shadowBlur = 20;
              ctx.beginPath();
              ctx.moveTo(0, -28);
              ctx.lineTo(14, 12);
              ctx.lineTo(0, 18);
              ctx.lineTo(-14, 12);
              ctx.closePath();
              ctx.fill();
              ctx.shadowBlur = 0;
            } else if (isPrecursor) {
              ctx.fillStyle = '#00f0ff';
              ctx.shadowColor = '#00f0ff';
              ctx.shadowBlur = 12;
              ctx.fillRect(-10, -22, 20, 32);
              ctx.fillStyle = '#0284c7';
              ctx.fillRect(-6, -18, 12, 24);
              ctx.shadowBlur = 0;
            } else {
              ctx.fillStyle = '#64748b';
              ctx.fillRect(-14, -14, 28, 22);
              ctx.strokeStyle = '#f59e0b';
              ctx.lineWidth = 2;
              ctx.strokeRect(-14, -14, 28, 22);
            }
          }

          // Scan-only Name Label with Fadeout
          if (scanLabelAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = scanLabelAlpha;
            ctx.fillStyle = '#000000bb';
            const text = ruin.name;
            ctx.font = 'bold 9px "Rajdhani", sans-serif';
            const tw = ctx.measureText(text).width;
            ctx.fillRect(-tw / 2 - 4, -rSize / 2 - 16, tw + 8, 14);
            ctx.strokeStyle = isPrecursor ? '#e879f9' : '#f59e0b';
            ctx.lineWidth = 1;
            ctx.strokeRect(-tw / 2 - 4, -rSize / 2 - 16, tw + 8, 14);
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 0, -rSize / 2 - 9);
            ctx.restore();
          }

          drawSpriteLabel(`sprite-ruin-${ruin.isControlNexus ? 'nexus' : 'monolith'}`, 0, -36, '#e879f9');
          ctx.restore();
        });

        // C. Lifeforms (Active, Stunned, Dead States with 4 Dedicated Sprites)
        currentSurfaceState.lifeforms.forEach((lf) => {
          if (lf.captured) return;
          const lx = cx + (lf.x - cameraWorldX) * worldScale;
          const ly = cy + (lf.y - cameraWorldY) * worldScale;

          ctx.save();
          ctx.translate(lx, ly);

          // Select matching sprite asset
          const lfName = lf.speciesName.toLowerCase();
          let spriteKey = 'lifeform_grazer_sprite';
          let aspect = 788 / 684;

          if (lfName.includes('float') || lfName.includes('wing') || lfName.includes('jelly') || lfName.includes('spore')) {
            spriteKey = 'lifeform_floater_sprite';
            aspect = 758 / 688;
          } else if (lfName.includes('stalker') || lfName.includes('gorgon') || lfName.includes('hunter') || lfName.includes('predator') || lf.temperament === 'aggressive') {
            spriteKey = 'lifeform_hunter_sprite';
            aspect = 927 / 512;
          } else if (lfName.includes('crawler') || lfName.includes('strider') || lfName.includes('tortoise') || lfName.includes('salamander')) {
            spriteKey = 'lifeform_crawler_sprite';
            aspect = 702 / 683;
          }

          const lfImg = assets[spriteKey];
          const baseH = lf.size === 'Behemoth' ? 56 : lf.size === 'Large' ? 44 : lf.size === 'Medium' ? 34 : 24;
          const renderH = baseH;
          const renderW = renderH * aspect;
          ctx.save();
          // Ground contact shadow remains fixed while limbs and floating bodies move.
          ctx.fillStyle='rgba(8,14,24,.22)';ctx.beginPath();
          ctx.ellipse(0,renderH*.12,renderW*.37,renderH*.2,0,0,Math.PI*2);ctx.fill();
          if (lf.dead) {
            // Dead State: Grayscale / desaturated, rotated 90 degrees on side with 0 movement
            ctx.filter = 'grayscale(100%) opacity(75%)';
            ctx.rotate(Math.PI / 2);
            if (lfImg && lfImg.complete && lfImg.naturalWidth > 0) {
              ctx.drawImage(lfImg, -renderW / 2, -renderH / 2, renderW, renderH);
            } else {
              ctx.fillStyle = '#475569';
              ctx.beginPath();
              ctx.ellipse(0, 0, renderW / 2, renderH / 4, 0, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.filter = 'none';
          } else if (lf.stunned) {
            // Stunned State: Sprite remains upright with a halo of circling gold stars over its head
            if (lfImg && lfImg.complete && lfImg.naturalWidth > 0) {
              ctx.drawImage(lfImg, -renderW / 2, -renderH / 2, renderW, renderH);
            } else {
              ctx.fillStyle = lf.color;
              ctx.beginPath();
              ctx.arc(0, 0, renderH / 2.5, 0, Math.PI * 2);
              ctx.fill();
            }

            // Circling Gold Stars Halo
            ctx.fillStyle = '#facc15';
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 6;
            for (let st = 0; st < 4; st++) {
              const sAngle = (st * Math.PI * 2) / 4 + nowSec * 5;
              const sx = Math.cos(sAngle) * (renderW * 0.45);
              const sy = Math.sin(sAngle) * (renderH * 0.22) - renderH * 0.55;
              ctx.beginPath();
              for(let point=0;point<10;point++){
                const a=-Math.PI/2+point*Math.PI/5,r=point%2?1.7:4;
                const px=sx+Math.cos(a)*r,py=sy+Math.sin(a)*r;
                if(point===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
              }ctx.closePath();ctx.fill();
            }
            ctx.shadowBlur = 0;
          } else {
            // Each illustrated species has its own forward axis and limb cycle.
            ctx.rotate(wildlifeRotation(spriteKey,Math.cos(lf.heading??Math.atan2(lf.vy||0,lf.vx||0)),Math.sin(lf.heading??Math.atan2(lf.vy||0,lf.vx||0))));

            if (lfImg && lfImg.complete && lfImg.naturalWidth > 0) {
              drawWalkingWildlife(ctx,lfImg,renderW,renderH,spriteKey,nowSec,Math.hypot(lf.vx||0,lf.vy||0),lf.id.length);
            } else {
              ctx.fillStyle = lf.color;
              ctx.beginPath();
              ctx.arc(0, 0, renderH / 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          ctx.restore();
          // Scan-only Name Label with Fadeout (upright, independent of body heading).
          if (scanLabelAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = scanLabelAlpha;
            ctx.fillStyle = '#000000bb';
            const text = `${lf.speciesName} (${lf.size}${lf.dead ? ' • Dead' : lf.stunned ? ' • Stunned' : ''})`;
            ctx.font = 'bold 9px "Rajdhani", sans-serif';
            const tw = ctx.measureText(text).width;
            ctx.fillRect(-tw / 2 - 4, -renderH / 2 - 18, tw + 8, 14);
            ctx.strokeStyle = lf.color;
            ctx.lineWidth = 1;
            ctx.strokeRect(-tw / 2 - 4, -renderH / 2 - 18, tw + 8, 14);
            ctx.fillStyle = lf.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 0, -renderH / 2 - 11);
            ctx.restore();
          }

          drawSpriteLabel(`sprite-lifeform-${lf.speciesName.toLowerCase().replace(/\\s+/g, '-')}`, 0, -22, lf.color);
          ctx.restore();
        });

        // D. Dropped Cargo
        currentSurfaceState.droppedCargo.forEach((crg) => {
          const cxScreen = cx + (crg.x - cameraWorldX) * worldScale;
          const cyScreen = cy + (crg.y - cameraWorldY) * worldScale;

          ctx.save();
          ctx.translate(cxScreen, cyScreen);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-8, -8, 16, 16);
          ctx.strokeStyle = crg.isArmed ? '#ef4444' : '#78350f';
          ctx.lineWidth = 2;
          ctx.strokeRect(-8, -8, 16, 16);

          if (crg.isArmed) {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          drawSpriteLabel(`sprite-cargo-${crg.name.toLowerCase().replace(/\\s+/g, '-')}`, 0, -18, crg.isArmed ? '#ef4444' : '#facc15');
          ctx.restore();
        });
      }

      // EXPANDING CYAN SONAR PULSE RING & HOLOGRAPHIC DISTANCE LABELS
      if (surfaceSonarPulse.active) {
        const pulseScreenR = surfaceSonarPulse.radius * worldScale;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseScreenR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // SHIMMERING TRACTOR BEAM SPARKLE FX
      if (tractorBeamFx) {
        const fxScreenX = cx + (tractorBeamFx.x - cameraWorldX) * worldScale;
        const fxScreenY = cy + (tractorBeamFx.y - cameraWorldY) * worldScale;

        ctx.save();
        ctx.strokeStyle = tractorBeamFx.color;
        ctx.shadowColor = tractorBeamFx.color;
        ctx.shadowBlur = 14;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(fxScreenX, fxScreenY);
        ctx.stroke();

        // Vertical sparkle column
        for (let sp = 0; sp < 8; sp++) {
          const sy = fxScreenY - sp * 6 + ((nowSec * 30) % 40);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(fxScreenX - 2 + (Math.random() - 0.5) * 6, sy, 3, 3);
        }
        ctx.restore();
      }

      // Stunner arc; the mining emitter is drawn above the rover roof below.
      if (surfaceWeaponBeam?.type==='stunner') {
        const startScreenX = cx + (surfaceWeaponBeam.startX - cameraWorldX) * worldScale;
        const startScreenY = cy + (surfaceWeaponBeam.startY - cameraWorldY) * worldScale;
        const endScreenX = cx + (surfaceWeaponBeam.endX - cameraWorldX) * worldScale;
        const endScreenY = cy + (surfaceWeaponBeam.endY - cameraWorldY) * worldScale;

        ctx.save();
        if (surfaceWeaponBeam.type === 'stunner') {
          // Electric blue ion arc (jagged zig-zag)
          ctx.strokeStyle = '#38bdf8';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 14;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(startScreenX, startScreenY);
          const midX = (startScreenX + endScreenX) / 2 + (Math.random() - 0.5) * 20;
          const midY = (startScreenY + endScreenY) / 2 + (Math.random() - 0.5) * 20;
          ctx.lineTo(midX, midY);
          ctx.lineTo(endScreenX, endScreenY);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ROVER AUTO-DRIVE WAYPOINT DESTINATION MARKER
      if (gameLocation === 'Terrain Vehicle' && roverWaypoint) {
        const wpScreenX = cx + (roverWaypoint.x - cameraWorldX) * worldScale;
        const wpScreenY = cy + (roverWaypoint.y - cameraWorldY) * worldScale;
        const distToWp = Math.hypot(roverWaypoint.x - vehicleX, roverWaypoint.y - vehicleY);

        ctx.save();
        // Dashed path line from rover to destination
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(wpScreenX, wpScreenY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Pulsing Destination Target Marker
        ctx.translate(wpScreenX, wpScreenY);
        const wpPulse = Math.sin(nowSec * 8) * 3 + 12;
        ctx.strokeStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, wpPulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-wpPulse - 4, 0);
        ctx.lineTo(wpPulse + 4, 0);
        ctx.moveTo(0, -wpPulse - 4);
        ctx.lineTo(0, wpPulse + 4);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.fillRect(-35, -wpPulse - 18, 70, 15);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1;
        ctx.strokeRect(-35, -wpPulse - 18, 70, 15);

        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 9px "Rajdhani", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${distToWp.toFixed(2)} km`, 0, -wpPulse - 10);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // 6-WHEELED PLANETARY ROVER (terrain_vehicle_topdown.png INTEGRATION)
      if (gameLocation === 'Terrain Vehicle') {
        ctx.save();
        ctx.translate(cx, cy + roverSuspensionBounce);

        // Forward Dual Headlight Illuminated Light Cones
        ctx.save();
        ctx.rotate(vehicleHeading);
        const drawHeadlightCone = (hx: number, hy: number) => {
          const coneGrad = ctx.createRadialGradient(hx, hy, 2, hx + 70, hy, 90);
          coneGrad.addColorStop(0, 'rgba(255, 255, 220, 0.55)');
          coneGrad.addColorStop(0.3, 'rgba(255, 240, 180, 0.25)');
          coneGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = coneGrad;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx + 85, hy - 22);
          ctx.lineTo(hx + 85, hy + 22);
          ctx.closePath();
          ctx.fill();
        };
        drawHeadlightCone(16, -7); // left headlight
        drawHeadlightCone(16, 7);  // right headlight

        // Permanent Heading Marker Arrow (Always visible)
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(24, 0);
        ctx.lineTo(34, 0);
        ctx.lineTo(30, -4);
        ctx.moveTo(34, 0);
        ctx.lineTo(30, 4);
        ctx.stroke();
        ctx.restore();

        // The illustrated headlights face +Y; this rotation makes them lead the wheels.
        ctx.rotate(vehicleHeading - Math.PI / 2);

        const roverImg = assets['terrain_vehicle_topdown'];
        const roverH = 52*groundZoomRef.current;
        const roverW = roverH * (534 / 713); // ~39px

        if (roverImg && roverImg.complete && roverImg.naturalWidth > 0) {
          ctx.drawImage(roverImg, -roverW / 2, -roverH / 2, roverW, roverH);
        } else {
          // Procedural fallback
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          [-10, 0, 10].forEach((wx) => {
            ctx.fillRect(wx - 4, -13, 8, 4);
            ctx.fillRect(wx - 4, 9, 8, 4);
          });
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-14, -9, 28, 18, 4);
          ctx.fill();
          ctx.stroke();
        }

        drawSpriteLabel('sprite-terrain-rover', 0, -roverH / 2 - 14, '#00f0ff');
        ctx.restore();
        if(surfaceWeaponBeam?.type==='laser') {
          const muzzle=roverMuzzle(cx,cy+roverSuspensionBounce,vehicleHeading,roverH);
          const tx=cx+(surfaceWeaponBeam.endX-cameraWorldX)*worldScale;
          const ty=cy+(surfaceWeaponBeam.endY-cameraWorldY)*worldScale;
          drawMiningBeam(ctx,muzzle.x,muzzle.y,tx,ty,nowSec,Math.min(1,surfaceWeaponBeam.timer*12));
          ctx.save();ctx.translate(muzzle.x,muzzle.y);ctx.rotate(Math.atan2(ty-muzzle.y,tx-muzzle.x));
          ctx.strokeStyle='#132b40';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(9,0);ctx.stroke();
          ctx.strokeStyle='#d8fbff';ctx.lineWidth=2;ctx.stroke();ctx.restore();
        }
      }

      // DYNAMIC WEATHER PARTICLES OVERLAY (Rain, Snow, Violent Storm Dust)
      surfaceWeatherParticles.forEach((wp) => {
        // A paused resize keeps the frozen field fitted to the new map bounds.
        const wx=wp.x*canvasWidth/wp.viewportWidth,wy=wp.y*canvasHeight/wp.viewportHeight;
        ctx.save();
        if (wp.length) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${wp.alpha})`;
          ctx.lineWidth = wp.size;
          ctx.beginPath();
          ctx.moveTo(wx, wy);
          ctx.lineTo(wx + (wp.vx * 0.05), wy + (wp.vy * 0.05));
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${wp.alpha})`;
          ctx.beginPath();
          ctx.arc(wx, wy, wp.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // RED VIGNETTE FLASH ON SCREEN EDGES WHEN LIFEFORM ATTACKS
      if (redVignetteFlash > 0) {
        const vGrad = ctx.createRadialGradient(cx, cy, canvasWidth * 0.2, cx, cy, canvasWidth * 0.6);
        vGrad.addColorStop(0, 'transparent');
        vGrad.addColorStop(1, `rgba(239, 68, 68, ${redVignetteFlash * 0.7})`);
        ctx.fillStyle = vGrad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // BLACK EGG ARMED SEISMIC COUNTDOWN / LAVA HAZARD OVERLAY
      if (p.type === 'Molten' || (currentSurfaceState && currentSurfaceState.droppedCargo.some((c) => c.isArmed))) {
        const armedEgg = currentSurfaceState?.droppedCargo.find(
          (c) => (c.artifactRef?.id === 'art-black-egg' || c.name.includes('Black Egg')) && c.isArmed,
        );

        if (armedEgg) {
          const eggScreenX = cx + (armedEgg.x - cameraWorldX) * worldScale;
          const eggScreenY = cy + (armedEgg.y - cameraWorldY) * worldScale;

          // Pulsing Seismic Rings
          for (let sr = 1; sr <= 3; sr++) {
            const sR = ((nowSec * 35 * sr) % 120);
            ctx.strokeStyle = `rgba(239, 68, 68, ${Math.max(0.1, 1 - sR / 120)})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(eggScreenX, eggScreenY, sR, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Top Screen Warning HUD anchored at top: 56px
          ctx.save();
          ctx.fillStyle = '#000000ee';
          ctx.fillRect(canvasWidth / 2 - 190, 56, 380, 38);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.strokeRect(canvasWidth / 2 - 190, 56, 380, 38);

          const blink = Math.sin(nowSec * 10) > 0;
          ctx.fillStyle = blink ? '#ef4444' : '#facc15';
          ctx.font = 'bold 12px "Orbitron", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚠ ANTIMATTER CHARGE ARMED • ASCEND TO ORBIT ⚠', canvasWidth / 2, 79);
          drawSpriteLabel('sprite-armed-egg-warning', canvasWidth / 2, 42, '#ef4444');
          ctx.restore();
        } else if (p.type === 'Molten') {
          // Molten Lava Hazard Alarm Banner positioned at top: 56px (#surface-rover-lava-alarm-timer)
          ctx.save();
          ctx.fillStyle = '#000000ee';
          ctx.fillRect(canvasWidth / 2 - 200, 56, 400, 38);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.strokeRect(canvasWidth / 2 - 200, 56, 400, 38);
          ctx.shadowBlur = 0;

          const blink = Math.sin(nowSec * 12) > 0;
          ctx.fillStyle = blink ? '#ef4444' : '#ffedd5';
          ctx.font = 'bold 12px "Orbitron", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🔥 LAVA HAZARD - ABANDON VEHICLE IN 00:03 🔥', canvasWidth / 2, 79);
          drawSpriteLabel('sprite-lava-alarm-timer', canvasWidth / 2, 42, '#ef4444');
          ctx.restore();
        }
      }
      return;
    }

    // 1. STARPORT CONCOURSE (CANONICAL 2X MIRRORED 1896x1024 COMPOSITE CANVAS)
    if (gameLocation === 'Starport' && activeRoomIndex === null && introPage === 0) {
      const concourseCanvas = getConcourseCanvas(assets);

      if (concourseCanvas && !concourseReportedRef.current) {
        concourseReportedRef.current = true;
        console.log(`[Asset Report] Starport concourse composite canvas ready from new_asset_1792541948891.png (${concourseCanvas.width}x${concourseCanvas.height})`);
      }

      const { scale, drawnW, drawnH, offsetX, offsetY, compW: COMP_W, compH: COMP_H } =
        getConcourseCoverTransform(curW, curH, concourseCanvas);

      // --- LAYER 0: Background Presentation (1896x1024 composite canvas) ---
      if (concourseCanvas) {
        if (offsetX > 0) {
          // Left side (0 to offsetX): horizontally mirrored copy with linear gradient fading to darkness
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, offsetX, curH);
          ctx.clip();
          ctx.save();
          ctx.translate(offsetX, offsetY);
          ctx.scale(-1, 1);
          ctx.drawImage(concourseCanvas, 0, 0, COMP_W, COMP_H, 0, 0, drawnW, drawnH);
          ctx.restore();

          const leftGrad = ctx.createLinearGradient(offsetX, 0, 0, 0);
          leftGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          leftGrad.addColorStop(1, 'rgba(0, 0, 0, 0.70)');
          ctx.fillStyle = leftGrad;
          ctx.fillRect(0, 0, offsetX, curH);
          ctx.restore();

          // Right side (offsetX + drawnW to curW): horizontally mirrored copy with linear gradient fading to darkness
          ctx.save();
          ctx.beginPath();
          ctx.rect(offsetX + drawnW, 0, curW - (offsetX + drawnW), curH);
          ctx.clip();
          ctx.save();
          ctx.translate(offsetX + 2 * drawnW, offsetY);
          ctx.scale(-1, 1);
          ctx.drawImage(concourseCanvas, 0, 0, COMP_W, COMP_H, 0, 0, drawnW, drawnH);
          ctx.restore();

          const rightGrad = ctx.createLinearGradient(offsetX + drawnW, 0, curW, 0);
          rightGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          rightGrad.addColorStop(1, 'rgba(0, 0, 0, 0.70)');
          ctx.fillStyle = rightGrad;
          ctx.fillRect(offsetX + drawnW, 0, curW - (offsetX + drawnW), curH);
          ctx.restore();
        }

        // Center composite canvas
        ctx.drawImage(concourseCanvas, 0, 0, COMP_W, COMP_H, offsetX, offsetY, drawnW, drawnH);
      } else {
        ctx.fillStyle = '#030612';
        ctx.fillRect(0, 0, curW, curH);
        ctx.fillStyle = '#0b1633';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 8;
        const centerCanvasX = offsetX + 0.500 * drawnW;
        const centerCanvasY = offsetY + 0.499 * drawnH;
        ctx.beginPath();
        ctx.ellipse(centerCanvasX, centerCanvasY, 0.360 * drawnW, 0.315 * drawnH, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
      }

      // --- LAYER 1: Door Glow Overlay & Room Name Labels ---
      STARPORT_DOORS.forEach((door) => {
        const doorCanvasX = offsetX + door.u * drawnW;
        const doorCanvasY = offsetY + door.v * drawnH;
        const isNear = nearbyConcourseDoor?.id === door.id;

        if (isNear) {
          ctx.save();
          const glowR = (door.isCenterPlatform ? 58 : 68) * scale;
          const glowGrad = ctx.createRadialGradient(doorCanvasX, doorCanvasY, 4, doorCanvasX, doorCanvasY, glowR);
          glowGrad.addColorStop(0, `${door.glowColor}99`);
          glowGrad.addColorStop(0.45, `${door.glowColor}40`);
          glowGrad.addColorStop(0.8, `${door.primaryColor}18`);
          glowGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.ellipse(
            doorCanvasX,
            doorCanvasY,
            (door.isCenterPlatform ? 60 : 54) * scale,
            (door.isCenterPlatform ? 38 : 62) * scale,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          ctx.strokeStyle = door.primaryColor;
          ctx.shadowColor = door.glowColor;
          ctx.shadowBlur = 18;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(
            doorCanvasX,
            doorCanvasY,
            (door.isCenterPlatform ? 46 : 38) * scale,
            (door.isCenterPlatform ? 26 : 46) * scale,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.restore();
        }

        ctx.save();
        const labelText = door.name.toUpperCase();
        ctx.font = 'bold 11px "Orbitron", "Rajdhani", sans-serif';
        const textMetrics = ctx.measureText(labelText);
        const padX = 8;
        const padY = 4;
        const boxW = textMetrics.width + padX * 2;
        const boxH = 20;

        // Position door labels just above the top edge of red door panels for all room doors; keep Docking Bay directly on center platform
        const labelY = door.isCenterPlatform
          ? doorCanvasY
          : offsetY + (door.v - 0.048) * drawnH;
        const clampedLabelX = Math.max(boxW / 2 + 8, Math.min(curW - boxW / 2 - 8, doorCanvasX));
        const clampedLabelY = Math.max(boxH / 2 + 8, Math.min(curH - boxH / 2 - 8, labelY));

        ctx.fillStyle = isNear ? 'rgba(5, 12, 34, 0.94)' : 'rgba(3, 7, 24, 0.82)';
        ctx.beginPath();
        ctx.roundRect(clampedLabelX - boxW / 2, clampedLabelY - boxH / 2, boxW, boxH, 4);
        ctx.fill();

        ctx.strokeStyle = isNear ? door.primaryColor : 'rgba(0, 240, 255, 0.45)';
        ctx.lineWidth = isNear ? 1.8 : 1;
        if (isNear) {
          ctx.shadowColor = door.glowColor;
          ctx.shadowBlur = 10;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = isNear ? '#ffffff' : door.glowColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, clampedLabelX, clampedLabelY);
        ctx.restore();
      });

      // --- LAYER 2: Transporter Beam Sparkles for Docking Bay ---
      if (transporterBeamProgress > 0) {
        const dockDoor = STARPORT_DOORS.find((d) => d.id === 'docking-bay') || STARPORT_DOORS[6];
        const dockX = offsetX + dockDoor.u * drawnW;
        const dockY = offsetY + dockDoor.v * drawnH;

        ctx.save();
        const beamGrad = ctx.createLinearGradient(dockX - 30, 0, dockX + 30, 0);
        beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0.1)');
        beamGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.7)');
        beamGrad.addColorStop(1, 'rgba(0, 240, 255, 0.1)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(dockX - 28, 0, 56, dockY + 15);

        ctx.strokeStyle = '#ffffff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 25;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(dockX, 0);
        ctx.lineTo(dockX, dockY);
        ctx.stroke();

        for (let r = 1; r <= 3; r++) {
          const rSize = ((nowSec * 40 * r) % 40) + 10;
          ctx.strokeStyle = `rgba(0, 240, 255, ${Math.max(0.1, 1 - rSize / 50)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(dockX, dockY, rSize, rSize * 0.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      transporterParticles.forEach((sp) => {
        ctx.save();
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * (1 - sp.life / sp.maxLife), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // --- LAYER 3: Pneumatic Door Steam Particles ---
      doorSteamParticles.forEach((sp) => {
        ctx.save();
        ctx.fillStyle = `rgba(226, 232, 240, ${sp.alpha * 0.75})`;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, Math.max(1, sp.size), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // --- LAYER 4: Astronaut Character Sprite ---
      const astroSheet = assets['astronaut_topdown_spritesheet'];
      const astroAvatar = assets['astronaut_avatar_sprite'];

      const isWalking = astronautVx !== 0 || astronautVy !== 0 || clickMoveTarget !== null;
      const danceFrame=concourseDanceFrame(astronautIdleTimer,isWalking);
      const isDancing=danceFrame!==null;
      canvas.dataset.concoursePose=isDancing?'dancing':isWalking?'walking':'idle';
      canvas.dataset.concourseDanceFrame=String(danceFrame??-1);
      const distanceTraveled = astronautDistanceTraveledRef.current;

      const runCanvases = cachedRunCanvasesRef.current.side.length > 0
        ? cachedRunCanvasesRef.current
        : globalPreparedRunCanvases;

      // Select active small prepared canvas frames by movement direction
      let activeCanvases: HTMLCanvasElement[] = [];
      let mirrorX = false;

      if (astronautFacing === 'S') {
        if (runCanvases.down.length >= 4) {
          activeCanvases = runCanvases.down;
        } else if (runCanvases.side.length >= 4) {
          activeCanvases = runCanvases.side;
        }
      } else if (astronautFacing === 'N') {
        if (runCanvases.up.length >= 4) {
          activeCanvases = runCanvases.up;
        } else if (runCanvases.side.length >= 4) {
          activeCanvases = runCanvases.side;
        }
      } else if (astronautFacing === 'W' || astronautFacing === 'NW' || astronautFacing === 'SW') {
        if (runCanvases.side.length >= 4) {
          activeCanvases = runCanvases.side;
          mirrorX = true;
        }
      } else {
        // Running East (E, NE, SE)
        if (runCanvases.side.length >= 4) {
          activeCanvases = runCanvases.side;
          mirrorX = false;
        }
      }

      const hasActiveRunFrames = isWalking && activeCanvases.length >= 4;
      const danceBounce = isDancing ? Math.abs(Math.sin((astronautIdleTimer - CONCOURSE_DANCE_DELAY) * 8)) * 6 : 0;
      const danceRotate = isDancing ? Math.sin((astronautIdleTimer - CONCOURSE_DANCE_DELAY) * 6) * 0.18 : 0;
      const transporterLift = transporterBeamProgress > 0 ? transporterBeamProgress * 120 : 0;

      // Ground baseline geometry: feet anchored at baseline y = 14 with 0 vertical jump
      ctx.save();
      ctx.translate(astronautX, astronautY - danceBounce - transporterLift);

      // Shadow at original anchor point (y = 14 ground baseline)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 14 + danceBounce + transporterLift, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.rotate(isDancing ? danceRotate : 0);

      if (isDancing && astroSheet && astroSheet.complete && astroSheet.naturalWidth > 0) {
        // Reuse the original ten dance frames after the short idle break.
        const frameW = astroSheet.naturalWidth / 5;
        const frameH = astroSheet.naturalHeight / 4;
        const danceIdx = danceFrame!;
        const srcRow = danceIdx < 5 ? 2 : 3;
        const srcCol = danceIdx < 5 ? danceIdx : danceIdx - 5;
        const renderH = 66;
        const renderW = renderH * (frameW / frameH);
        ctx.drawImage(
          astroSheet,
          srcCol * frameW,
          srcRow * frameH,
          frameW,
          frameH,
          -renderW / 2,
          -renderH + 14,
          renderW,
          renderH
        );
      } else if (hasActiveRunFrames) {
        // Running animation from small pre-cached offscreen canvas: 1 frame per 14 pixels moved
        const frameCount = activeCanvases.length;
        const frameIdx = Math.floor(distanceTraveled / 14) % frameCount;
        const curCanvas = activeCanvases[frameIdx];

        // Scale running frame so visual height is exactly 66px (curCanvas is 132px tall, 0.5x scale)
        const targetH = 66;
        const scale = targetH / curCanvas.height;
        const targetW = curCanvas.width * scale;

        ctx.save();
        if (mirrorX) {
          ctx.scale(-1, 1);
        }
        // Feet on the exact baseline y = 14, centered horizontally at x = 0
        ctx.drawImage(
          curCanvas,
          0,
          0,
          curCanvas.width,
          curCanvas.height,
          -targetW / 2,
          14 - targetH,
          targetW,
          targetH
        );
        ctx.restore();
      } else if (astroSheet && astroSheet.complete && astroSheet.naturalWidth > 0) {
        // When stopped: standing pose from astronaut_topdown_spritesheet as before
        // (also graceful fallback if run sheets aren't loaded yet)
        const frameW = 934 / 5;
        const frameH = 940 / 4;
        let srcCol = 0;
        let srcRow = 0;
        const walkStep8 = Math.floor(astronautAnimFrame) % 8;

        switch (astronautFacing) {
          case 'S':
            srcRow = 0;
            srcCol = isWalking ? (walkStep8 % 2 === 0 ? 0 : 1) : 0;
            break;
          case 'SE':
            srcRow = 0;
            srcCol = 1;
            break;
          case 'SW':
            srcRow = 0;
            srcCol = 2;
            break;
          case 'E':
            srcRow = 0;
            srcCol = 3;
            break;
          case 'W':
            srcRow = 1;
            srcCol = 1;
            break;
          case 'N':
            srcRow = 1;
            srcCol = isWalking ? (walkStep8 % 2 === 0 ? 2 : 3) : 2;
            break;
          case 'NW':
            srcRow = 1;
            srcCol = 0;
            break;
          case 'NE':
            srcRow = 1;
            srcCol = 4;
            break;
          default:
            srcRow = 0;
            srcCol = 0;
            break;
        }

        const renderH = 66;
        const renderW = renderH * (frameW / frameH);

        ctx.drawImage(
          astroSheet,
          srcCol * frameW,
          srcRow * frameH,
          frameW,
          frameH,
          -renderW / 2,
          -renderH + 14,
          renderW,
          renderH
        );
      } else if (astroAvatar && astroAvatar.complete && astroAvatar.naturalWidth > 0) {
        const spriteH = 64;
        const spriteW = spriteH * (393 / 909);
        ctx.scale(astronautScaleX, 1);
        ctx.drawImage(astroAvatar, -spriteW / 2, -spriteH + 14, spriteW, spriteH);
      } else {
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-10, -32, 20, 32, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, -42, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00f0ff';
        ctx.stroke();
      }

      if (isDancing) {
        ctx.fillStyle = '#facc15';
        for (let spk = 0; spk < 6; spk++) {
          const spkAngle = (spk * Math.PI * 2) / 6 + nowSec * 6;
          const spkX = Math.cos(spkAngle) * 26;
          const spkY = Math.sin(spkAngle) * 26 - 32;
          ctx.fillRect(spkX - 2, spkY - 2, 4, 4);
        }

        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;
        ctx.font = 'bold 11px "Orbitron", "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★ DANCE BREAK! ★', 0, -68);
        ctx.shadowBlur = 0;
      }

      drawSpriteLabel('sprite-player-astronaut', 0, -54, '#00f0ff');
      ctx.restore();

      // --- LAYER 5: Top Screen Door Interaction Prompt Banner ---
      if (nearbyConcourseDoor) {
        ctx.save();
        const bannerW = Math.max(340, nearbyConcourseDoor.badge.length * 14 + 60);
        const bannerH = 46;
        const bannerX = curW / 2 - bannerW / 2;
        const bannerY = 32;

        ctx.fillStyle = 'rgba(5, 10, 28, 0.92)';
        ctx.fillRect(bannerX, bannerY, bannerW, bannerH);

        ctx.strokeStyle = nearbyConcourseDoor.glowColor;
        ctx.shadowColor = nearbyConcourseDoor.glowColor;
        ctx.shadowBlur = 14;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);

        ctx.fillStyle = nearbyConcourseDoor.primaryColor;
        ctx.fillRect(bannerX - 3, bannerY - 3, 6, 6);
        ctx.fillRect(bannerX + bannerW - 3, bannerY - 3, 6, 6);
        ctx.fillRect(bannerX - 3, bannerY + bannerH - 3, 6, 6);
        ctx.fillRect(bannerX + bannerW - 3, bannerY + bannerH - 3, 6, 6);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Orbitron", "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(nearbyConcourseDoor.badge, curW / 2, bannerY + 22);

        ctx.font = 'bold 11px "Rajdhani", sans-serif';
        ctx.fillStyle = '#facc15';
        ctx.fillText('[PRESS ENTER / CLICK TO ENTER]', curW / 2, bannerY + 38);
        ctx.shadowBlur = 0;
        ctx.restore();
      }
      return;
    }

    // 1.5 STARPORT ROOM VIEW (High-DPI painted facility backdrop on canvas)
    if (gameLocation === 'Starport' && activeRoomIndex !== null && introPage === 0) {
      const roomBgPath = ROOM_BACKDROP_PATHS[activeRoomIndex];
      const roomAssetKey = Object.keys(ASSETS_MANIFEST).find((k) => ASSETS_MANIFEST[k] === roomBgPath);
      const roomImg = roomAssetKey ? assets[roomAssetKey] : null;
      drawCoverImage(ctx, roomImg, curW, curH, '#030712');
      return;
    }

    // ------------------------------------------------------------------------
    // 2. TACTICAL ENCOUNTER VIEWPORT (DYNAMIC FRAMING, PROPORTIONAL ZOOM & LARGE CEL-SHADED VESSELS)
    // ------------------------------------------------------------------------
    if (gameLocation === 'Encounter' && activeEncounterGroup) {
      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;

      // Smooth dynamically framed camera coordinates & cell scale
      const camX = tacticalCameraRef.current.x;
      const camY = tacticalCameraRef.current.y;
      const cellSize = tacticalCameraRef.current.cellSize;
      const scaleRatio = cellSize / 22; // Multiplier for vessel sizes (at cellSize ~ 55, scaleRatio ~ 2.5)

      // 1. Full-bleed background image cover with zero side strips (sampling clean central region)
      const encSectorSeed = (Math.round(galaxyShipX) * 11 + Math.round(galaxyShipY) * 17) >>> 0;
      const encBgKeys = ['space_bg_a', 'space_bg_b', 'space_bg_c', 'space_bg_d'];
      const encBgImg = assets[encBgKeys[encSectorSeed % 4]];
      drawCoverImage(ctx, encBgImg, canvasWidth, canvasHeight, '#040612', true);

      // Parallax Stars Layer 1 (Distant dim stars)
      ctx.fillStyle = '#475569';
      for (let i = 0; i < 60; i++) {
        const sx = ((Math.sin(i * 113 + 37) * 480 + 480 - camX * 2 + 1920) % 1280);
        const sy = ((Math.cos(i * 97 + 59) * 270 + 270 - camY * 2 + 1440) % 720);
        ctx.fillRect(sx, sy, 1, 1);
      }

      // Parallax Stars Layer 2 (Mid-distance twinkling stars)
      ctx.fillStyle = '#94a3b8';
      for (let i = 0; i < 45; i++) {
        const sx = ((Math.sin(i * 157 + 73) * 480 + 480 - camX * 5 + 1920) % 1280);
        const sy = ((Math.cos(i * 131 + 89) * 270 + 270 - camY * 5 + 1440) % 720);
        const twinkle = Math.sin(nowSec * 6 + i) > 0 ? 1.5 : 1;
        ctx.fillRect(sx, sy, twinkle, twinkle);
      }

      // Nebula Ion Haze & Cloud Background if in nebula
      if (inNebula) {
        const nebCloudImg = assets['nebula_cloud_a'] || assets['nebula_cloud_b'];
        if (nebCloudImg && nebCloudImg.complete && nebCloudImg.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.globalCompositeOperation = 'screen';
          ctx.drawImage(nebCloudImg, 0, 0, canvasWidth, canvasHeight);
          ctx.restore();
        }
        const nebGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, Math.max(canvasWidth, canvasHeight) * 0.7);
        nebGrad.addColorStop(0, 'rgba(217, 70, 239, 0.35)');
        nebGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.25)');
        nebGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = nebGrad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // 2. Faint Holographic Coordinate Grid with Brightening Intersection Crosses
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.09)';
      ctx.lineWidth = 1;

      const minGridX = Math.floor(camX - canvasWidth / (2 * cellSize) - 2);
      const maxGridX = Math.ceil(camX + canvasWidth / (2 * cellSize) + 2);
      const minGridY = Math.floor(camY - canvasHeight / (2 * cellSize) - 2);
      const maxGridY = Math.ceil(camY + canvasHeight / (2 * cellSize) + 2);

      for (const gx of boundedGridIndices(minGridX,maxGridX)) {
        const sx = cx + (gx - camX) * cellSize;
        if (sx >= 0 && sx <= canvasWidth) {
          ctx.beginPath();
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx, canvasHeight);
          ctx.stroke();
        }
      }

      for (const gy of boundedGridIndices(minGridY,maxGridY)) {
        const sy = cy + (gy - camY) * cellSize;
        if (sy >= 0 && sy <= canvasHeight) {
          ctx.beginPath();
          ctx.moveTo(0, sy);
          ctx.lineTo(canvasWidth, sy);
          ctx.stroke();
        }
      }

      // Luminescent intersection crosses that brighten near player ship
      const crossColumns=boundedGridIndices(minGridX,maxGridX,2),crossRows=boundedGridIndices(minGridY,maxGridY,2);
      for (const gx of crossColumns) {
        for (const gy of crossRows) {
          const sx = cx + (gx - camX) * cellSize;
          const sy = cy + (gy - camY) * cellSize;
          const distFromPlayer = Math.hypot(gx - encounterShipPos.x, gy - encounterShipPos.y);

          if (distFromPlayer <= 16) {
            const crossAlpha = Math.max(0.1, 1 - distFromPlayer / 16) * 0.45;
            ctx.strokeStyle = `rgba(0, 240, 255, ${crossAlpha})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(sx - 4, sy);
            ctx.lineTo(sx + 4, sy);
            ctx.moveTo(sx, sy - 4);
            ctx.lineTo(sx, sy + 4);
            ctx.stroke();
          }
        }
      }

      // 3. MISSILE SMOKE TRAILS
      missileSmokeTrails.forEach((sm) => {
        const sx = cx + (sm.x - camX) * cellSize;
        const sy = cy + (sm.y - camY) * cellSize;
        ctx.save();
        ctx.fillStyle = `rgba(200, 200, 210, ${sm.alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sm.size * scaleRatio, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 4. ALIEN VESSEL SPRITES & HULLS (PROPORTIONALLY SCALED: 90-110px LONG AT CLOSE RANGE)
      activeEncounterGroup.ships.forEach((ship, sIdx) => {
        const sx = cx + (ship.x - camX) * cellSize;
        const sy = cy + (ship.y - camY) * cellSize;

        // Skip ships off-screen
        if (sx < -120 || sx > canvasWidth + 120 || sy < -120 || sy > canvasHeight + 120) return;

        ctx.save();
        ctx.translate(sx, sy);

        // Idle floating yaw motion
        const yaw = Math.sin(nowSec * 2 + sIdx) * 0.08;
        ctx.rotate(yaw);

        // A. WRECK STATE (Render assets/images/alien_ship_wreck_sprite.png with gentle rotation & smoke trails)
        if (ship.isWreck) {
          const tumbleAngle = nowSec * 0.35 + sIdx;
          ctx.rotate(tumbleAngle);

          const wreckImg = assets['alien_ship_wreck_sprite'];
          const wH = 36 * scaleRatio;
          const wW = wH * (756 / 684);
          if (wreckImg && wreckImg.complete && wreckImg.naturalWidth > 0) {
            ctx.drawImage(wreckImg, -wW / 2, -wH / 2, wW, wH);
          } else {
            // Shattered metallic fragments fallback
            ctx.fillStyle = '#334155';
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1.5 * scaleRatio;
            ctx.beginPath();
            ctx.moveTo(-wW * 0.35, -wH * 0.25);
            ctx.lineTo(wW * 0.3, -wH * 0.3);
            ctx.lineTo(wW * 0.2, wH * 0.25);
            ctx.lineTo(-wW * 0.25, wH * 0.35);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

          // Molten severed conduit sparks
          if (Math.sin(nowSec * 10 + sIdx) > 0) {
            ctx.fillStyle = '#f97316';
            ctx.fillRect(-2 * scaleRatio, -2 * scaleRatio, 4 * scaleRatio, 4 * scaleRatio);
          }

          // Drifting salvage cargo canisters if not looted
          if (!ship.looted) {
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(wW * 0.25, wH * 0.2, 5 * scaleRatio, 5 * scaleRatio);
            ctx.fillRect(-wW * 0.35, wH * 0.15, 4 * scaleRatio, 4 * scaleRatio);

            // Shimmering tractor-lock aura
            const auraPulse = (Math.sin(nowSec * 5) * 3 + 18) * scaleRatio;
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(0, 0, auraPulse, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Wreck Label
          ctx.fillStyle = ship.looted ? '#64748b' : '#facc15';
          ctx.font = 'bold 10px "Rajdhani", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(ship.looted ? '[SALVAGED]' : '[SALVAGE WRECK]', 0, wH * 0.65);
          ctx.restore();
          return;
        }

        // B. DESIGNATED PAINTED ALIEN SHIP ASSETS WITH PROPORTIONAL SCALING (90-110px LONG AT CLOSE RANGE)
        // 1. ELOWAN (Organic Leaf-Dart Scout / Broad Seed-Pod Transport / Tri-Petal Arbor Warship)
        if (ship.race === 'Elowan') {
          const isWarship = ship.vesselType === 'Warship';
          const isTransport = ship.vesselType === 'Transport';
          
          let elowanImg: HTMLImageElement | null | undefined = null;
          let aspect = 446 / 910;
          let baseH = 32;

          if (isWarship) {
            elowanImg = assets['alien_ship_elowan_warship'] || assets['alien_ship_elowan_scout'];
            aspect = 630 / 837;
            baseH = 42;
          } else if (isTransport) {
            elowanImg = assets['alien_ship_elowan_transport'] || assets['alien_ship_elowan_scout'];
            aspect = 820 / 824;
            baseH = 36;
          } else {
            elowanImg = assets['alien_ship_elowan_scout'];
            aspect = 446 / 910;
            baseH = 32;
          }

          const renderH = baseH * scaleRatio;
          const renderW = renderH * aspect;

          if (elowanImg && elowanImg.complete && elowanImg.naturalWidth > 0) {
            ctx.drawImage(elowanImg, -renderW / 2, -renderH / 2, renderW, renderH);
          } else {
            // Procedural fallback
            ctx.fillStyle = isWarship ? '#052e16' : isTransport ? '#064e3b' : '#166534';
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2 * scaleRatio;
            ctx.beginPath();
            ctx.moveTo(0, -renderH / 2);
            ctx.lineTo(renderW / 2, renderH / 4);
            ctx.lineTo(0, renderH / 2);
            ctx.lineTo(-renderW / 2, renderH / 4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

          // Elowan Botanical Bioluminescent Vein Glow
          if (isWarship) {
            const veinPulse = Math.sin(nowSec * 5 + sIdx) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(250, 204, 21, ${veinPulse * 0.8})`;
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 12 * scaleRatio;
            ctx.beginPath();
            ctx.arc(0, 0, 4 * scaleRatio, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
        // 2. THRYNN (Heavy Bronze-Plated Gunship Warship / Boxy Freighter Transport / Dagger Scout)
        else if (ship.race === 'Thrynn') {
          const isWarship = ship.vesselType === 'Warship';
          const isTransport = ship.vesselType === 'Transport';
          
          let thrynnImg: HTMLImageElement | null | undefined = null;
          let aspect = 454 / 816;
          let baseH = 32;

          if (isWarship) {
            thrynnImg = assets['alien_ship_thrynn_warship'] || assets['alien_ship_thrynn_scout'];
            aspect = 539 / 908;
            baseH = 42;
          } else if (isTransport) {
            thrynnImg = assets['alien_ship_thrynn_transport'] || assets['alien_ship_thrynn_scout'];
            aspect = 410 / 804;
            baseH = 36;
          } else {
            thrynnImg = assets['alien_ship_thrynn_scout'];
            aspect = 454 / 816;
            baseH = 32;
          }

          const renderH = baseH * scaleRatio;
          const renderW = renderH * aspect;

          if (thrynnImg && thrynnImg.complete && thrynnImg.naturalWidth > 0) {
            ctx.drawImage(thrynnImg, -renderW / 2, -renderH / 2, renderW, renderH);
          } else {
            // Procedural fallback
            ctx.fillStyle = isWarship ? '#3b1c06' : isTransport ? '#451a03' : '#78350f';
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 2.2 * scaleRatio;
            ctx.beginPath();
            ctx.moveTo(0, -renderH / 2);
            ctx.lineTo(renderW / 2, renderH / 2);
            ctx.lineTo(0, renderH / 3);
            ctx.lineTo(-renderW / 2, renderH / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

          // Heavy Bronze Thrusters
          if (isWarship) {
            ctx.fillStyle = '#f97316';
            ctx.shadowColor = '#ea580c';
            ctx.shadowBlur = 10 * scaleRatio;
            ctx.fillRect(-renderW * 0.3, renderH * 0.42, 6 * scaleRatio, (6 + Math.random() * 4) * scaleRatio);
            ctx.fillRect(renderW * 0.3 - 6 * scaleRatio, renderH * 0.42, 6 * scaleRatio, (6 + Math.random() * 4) * scaleRatio);
            ctx.shadowBlur = 0;
          }
        }
        // 3. VELOXI (Mantis Dreadnought Warship / Insect Hauler Transport / Hornet Scout / Drone)
        else if (ship.race === 'Veloxi' || ship.race === 'Veloxi Drone') {
          if (ship.race === 'Veloxi Drone' || ship.isStationary) {
            const droneImg = assets['alien_ship_veloxi_drone'];
            const renderH = 36 * scaleRatio;
            const renderW = renderH * (775 / 715);

            if (droneImg && droneImg.complete && droneImg.naturalWidth > 0) {
              const turretAim = Math.sin(nowSec * 1.5 + sIdx) * 0.15;
              ctx.rotate(turretAim);
              ctx.drawImage(droneImg, -renderW / 2, -renderH / 2, renderW, renderH);
            } else {
              ctx.fillStyle = '#042f2e';
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 2 * scaleRatio;
              ctx.beginPath();
              ctx.arc(0, 0, 16 * scaleRatio, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            }
          } else {
            const isWarship = ship.vesselType === 'Warship';
            const isTransport = ship.vesselType === 'Transport';

            let veloxiImg: HTMLImageElement | null | undefined = null;
            let aspect = 684 / 742;
            let baseH = 32;

            if (isWarship) {
              veloxiImg = assets['alien_ship_veloxi_warship'] || assets['alien_ship_veloxi_scout'];
              aspect = 738 / 901;
              baseH = 42;
            } else if (isTransport) {
              veloxiImg = assets['alien_ship_veloxi_transport'] || assets['alien_ship_veloxi_scout'];
              aspect = 466 / 889;
              baseH = 36;
            } else {
              veloxiImg = assets['alien_ship_veloxi_scout'];
              aspect = 684 / 742;
              baseH = 32;
            }

            const renderH = baseH * scaleRatio;
            const renderW = renderH * aspect;

            if (veloxiImg && veloxiImg.complete && veloxiImg.naturalWidth > 0) {
              ctx.drawImage(veloxiImg, -renderW / 2, -renderH / 2, renderW, renderH);
            } else {
              ctx.fillStyle = isWarship ? '#3b0764' : '#022c22';
              ctx.strokeStyle = '#d946ef';
              ctx.lineWidth = 2 * scaleRatio;
              ctx.beginPath();
              ctx.moveTo(0, -renderH / 2);
              ctx.lineTo(renderW / 2, 0);
              ctx.lineTo(0, renderH / 2);
              ctx.lineTo(-renderW / 2, 0);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            }
          }
        }
        // 4. SPEMIN
        else if (ship.race === 'Spemin') {
          const isWarship = ship.vesselType === 'Warship';
          const isTransport = ship.vesselType === 'Transport';
          const squish = Math.sin(nowSec * 4 + sIdx) * 2;
          const baseH = isWarship ? 42 : 32;
          const renderH = (baseH + squish) * scaleRatio;
          const speminImg = isWarship
            ? (assets['alien_ship_spemin_warship'] || assets['alien_ship_spemin_scout'])
            : isTransport ? assets['alien_ship_spemin_transport'] : assets['alien_ship_spemin_scout'];
          const aspect = speminImg?.naturalWidth && speminImg?.naturalHeight
            ? speminImg.naturalWidth / speminImg.naturalHeight : isWarship ? 658 / 956 : 526 / 716;
          const renderW = renderH * aspect;

          if (speminImg && speminImg.complete && speminImg.naturalWidth > 0) {
            ctx.drawImage(speminImg, -renderW / 2, -renderH / 2, renderW, renderH);
          } else {
            ctx.fillStyle = 'rgba(147, 51, 234, 0.7)';
            ctx.strokeStyle = '#f472b6';
            ctx.lineWidth = 2 * scaleRatio;
            ctx.beginPath();
            ctx.ellipse(0, 0, renderW / 2, renderH / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        }
        // 5. GAZURTOID (Biomechanical Whale Dreadnought / Sleek Whale Frigate Scout)
        else if (ship.race === 'Gazurtoid') {
          const isWarship = ship.vesselType === 'Warship';
          const baseH = isWarship ? 44 : 34;
          const renderH = baseH * scaleRatio;
          const aspect = isWarship ? 564 / 968 : 562 / 862;
          const renderW = renderH * aspect;

          const gazurtoidImg = isWarship
            ? assets['alien_ship_gazurtoid_warship']
            : (assets['alien_ship_gazurtoid_scout'] || assets['alien_ship_gazurtoid_warship']);

          if (gazurtoidImg && gazurtoidImg.complete && gazurtoidImg.naturalWidth > 0) {
            ctx.drawImage(gazurtoidImg, -renderW / 2, -renderH / 2, renderW, renderH);
          } else {
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#4338ca';
            ctx.lineWidth = 2.4 * scaleRatio;
            ctx.beginPath();
            ctx.moveTo(0, -renderH / 2);
            ctx.quadraticCurveTo(renderW, 0, renderW * 0.7, renderH / 2);
            ctx.lineTo(0, renderH / 3);
            ctx.lineTo(-renderW * 0.7, renderH / 2);
            ctx.quadraticCurveTo(-renderW, 0, 0, -renderH / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        }
        // 6. UHLEK (Dark Matter Obsidian Dreadnought Warship / Barbed Scout)
        else if (ship.race === 'Uhlek') {
          const isWarship = ship.vesselType === 'Warship';
          const baseH = isWarship ? 42 : 34;
          const renderH = baseH * scaleRatio;
          const aspect = isWarship ? 764 / 875 : 572 / 840;
          const renderW = renderH * aspect;

          const uhlekImg = isWarship
            ? assets['alien_ship_uhlek_warship']
            : (assets['alien_ship_uhlek_scout'] || assets['alien_ship_uhlek_warship']);

          if (uhlekImg && uhlekImg.complete && uhlekImg.naturalWidth > 0) {
            ctx.drawImage(uhlekImg, -renderW / 2, -renderH / 2, renderW, renderH);
          } else {
            ctx.fillStyle = '#000000';
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2.4 * scaleRatio;
            ctx.beginPath();
            ctx.moveTo(0, -renderH / 2);
            ctx.lineTo(renderW / 2, 0);
            ctx.lineTo(0, renderH / 2);
            ctx.lineTo(-renderW / 2, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        }
        // 7. OTHER RACES (Mechans, Mysterions, Nomad, Minstrel, Derelict)
        else {
          let genericImg: HTMLImageElement | null | undefined = null;
          let aspect = 1;
          let baseH = 38;

          if (ship.race === 'Mechans') {
            genericImg = assets['alien_ship_mechan_scout'];
            aspect = 764 / 733;
            baseH = 36;
          } else if (ship.race === 'Mysterions') {
            genericImg = assets['alien_ship_mysterion'];
            aspect = 818 / 900;
            baseH = 44;
          } else if (ship.race === 'Nomad') {
            genericImg = assets['alien_ship_nomad_probe'];
            aspect = 844 / 723;
            baseH = 34;
          } else if (ship.race === 'Minstrels') {
            genericImg = assets['alien_ship_minstrel'];
            aspect = 403 / 890;
            baseH = 42;
          } else if (ship.race === 'Derelict') {
            genericImg = assets['alien_ship_noah9_derelict'];
            aspect = 294 / 944;
            baseH = 46;
          }

          const renderH = baseH * scaleRatio;
          const renderW = renderH * aspect;

          if (genericImg && genericImg.complete && genericImg.naturalWidth > 0) {
            ctx.drawImage(genericImg, -renderW / 2, -renderH / 2, renderW, renderH);
          } else {
            ctx.fillStyle = '#334155';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2 * scaleRatio;
            ctx.beginPath();
            ctx.moveTo(0, renderH / 2);
            ctx.lineTo(renderW / 2, -renderH / 2);
            ctx.lineTo(0, -renderH / 4);
            ctx.lineTo(-renderW / 2, -renderH / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        }

        // C. SHIELD FORCEFIELD BUBBLE AROUND ALIEN SHIPS
        if (ship.shields > 0 && !inNebula) {
          const sPulse = Math.sin(nowSec * 6 + sIdx) * 1.5;
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 10 * scaleRatio;
          ctx.lineWidth = 1.8 * scaleRatio;
          ctx.beginPath();
          ctx.arc(0, 0, (22 + sPulse) * scaleRatio, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
          ctx.beginPath();
          ctx.arc(0, 0, (22 + sPulse) * scaleRatio, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      });

      // 5. PLAYER STARSHIP IN COMBAT / TACTICAL GRID (UNIFIED RENDERING)
      const playerScreenX = cx + (encounterShipPos.x - camX) * cellSize;
      const playerScreenY = cy + (encounterShipPos.y - camY) * cellSize;
      const playerTacW = 38 * scaleRatio; // At scaleRatio 2.64: ~100.3px length!
      const playerTacH = playerTacW / (1087 / 602);
      const isTacMoving = activeConsoleMenu === 'Maneuver' && (activeDirectionVector.dx !== 0 || activeDirectionVector.dy !== 0);

      drawUnifiedPlayerShip({
        ctx,
        x: playerScreenX,
        y: playerScreenY,
        headingRad: shipHeading,
        lengthPx: playerTacW,
        engineClass,
        isMoving: isTacMoving,
        engineThrust: flightEngineThrust,
        cargoPodsCount: cargoPods,
        shieldsActive: shieldsRaised,
        inNebula,
        assets,
        weaponsArmed,
        missileClass,
        laserClass,
        armorClass,
        nowSec,
      });

      drawSpriteLabel('sprite-player-ship-tactical', playerScreenX, playerScreenY - playerTacH * 0.6 - 14, '#00f0ff');

      // 6. TACTICAL PROJECTILE PASS
      projectiles.forEach((proj) => {
        const px = cx + (proj.x - camX) * cellSize;
        const py = cy + (proj.y - camY) * cellSize;
        const tx = cx + (proj.targetX - camX) * cellSize;
        const ty = cy + (proj.targetY - camY) * cellSize;
        const projAngle = Math.atan2(ty - py, tx - px);

        ctx.save();
        if (proj.type === 'laser') {
          const local=proj.fromPlayer?configuredLaserEmitters(laserClass,playerTacW):[{x:0,y:0}];
          for(const emitter of local){
            const ex=px+emitter.x*Math.cos(shipHeading)-emitter.y*Math.sin(shipHeading);
            const ey=py+emitter.x*Math.sin(shipHeading)+emitter.y*Math.cos(shipHeading);
            const beamGrad=ctx.createLinearGradient(ex,ey,tx,ty);
            beamGrad.addColorStop(0,proj.fromPlayer?'#ffffff':'#fef2f2');beamGrad.addColorStop(.3,proj.color);beamGrad.addColorStop(1,proj.color);
            ctx.strokeStyle=beamGrad;ctx.shadowColor=proj.color;ctx.shadowBlur=14*scaleRatio;
            ctx.lineWidth=(proj.fromPlayer?1.6:3)*scaleRatio;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(tx,ty);ctx.stroke();
            ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(ex,ey,2*scaleRatio,0,Math.PI*2);ctx.fill();
          }
          ctx.shadowBlur=0;
        } else if (proj.type === 'missile') {
          ctx.translate(px, py);
          ctx.rotate(projAngle);

          ctx.fillStyle = '#f97316';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 10 * scaleRatio;
          ctx.beginPath();
          ctx.moveTo(-6 * scaleRatio, -2 * scaleRatio);
          ctx.lineTo((-14 - Math.random() * 6) * scaleRatio, 0);
          ctx.lineTo(-6 * scaleRatio, 2 * scaleRatio);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#e2e8f0';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1 * scaleRatio;
          ctx.beginPath();
          ctx.moveTo(7 * scaleRatio, 0);
          ctx.lineTo(-5 * scaleRatio, -3 * scaleRatio);
          ctx.lineTo(-5 * scaleRatio, 3 * scaleRatio);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (proj.type === 'plasma') {
          ctx.translate(px, py);
          const pPulse = Math.sin(nowSec * 15) * 2;
          const orbR = (10 + pPulse) * scaleRatio;
          const orbGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, orbR);
          orbGrad.addColorStop(0, '#ffffff');
          orbGrad.addColorStop(0.4, '#d946ef');
          orbGrad.addColorStop(0.9, '#4c1d95');
          orbGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = orbGrad;
          ctx.shadowColor = '#d946ef';
          ctx.shadowBlur = 20 * scaleRatio;
          ctx.beginPath();
          ctx.arc(0, 0, orbR, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#f0abfc';
          ctx.lineWidth = 1.5 * scaleRatio;
          for (let arc = 0; arc < 4; arc++) {
            const aAngle = (arc * Math.PI) / 2 + nowSec * 12;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(aAngle) * 12 * scaleRatio, Math.sin(aAngle) * 12 * scaleRatio);
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
          drawSpriteLabel('sprite-uhlek-plasma-bolt', 0, -orbR - 12, '#d946ef');
        }
        ctx.restore();
      });

      // 7. EXPLOSIONS, SPARKS & SHIELD RIPPLES
      tacticalShieldRipples.forEach((rp) => {
        const sx = cx + (rp.x - camX) * cellSize;
        const sy = cy + (rp.y - camY) * cellSize;
        ctx.save();
        ctx.strokeStyle = rp.color;
        ctx.lineWidth = 2 * scaleRatio;
        ctx.beginPath();
        ctx.arc(sx, sy, rp.radius * scaleRatio, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      tacticalExplosions.forEach((ex) => {
        const sx = cx + (ex.x - camX) * cellSize;
        const sy = cy + (ex.y - camY) * cellSize;
        drawCelExplosion(ctx,sx,sy,ex.maxRadius*scaleRatio,ex.life,ex.maxLife,ex.color,ex.shockwave);
      });

      tacticalSparks.forEach((sp) => {
        const sx = cx + (sp.x - camX) * cellSize;
        const sy = cy + (sp.y - camY) * cellSize;
        ctx.save();
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        ctx.arc(sx, sy, sp.size * scaleRatio * (1 - sp.life / sp.maxLife), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 8. TACTICAL OVERLAY PASS (TARGETING BRACKETS, RETICLES & RANGE BADGES - DRAWN ON TOP)
      activeEncounterGroup.ships.forEach((ship, sIdx) => {
        const sx = cx + (ship.x - camX) * cellSize;
        const sy = cy + (ship.y - camY) * cellSize;
        const isTarget = sIdx === encounterTargetIndex;

        if (sx < -120 || sx > canvasWidth + 120 || sy < -120 || sy > canvasHeight + 120) return;

        if (isTarget && !ship.isWreck) {
          ctx.save();
          ctx.translate(sx, sy);

          const tSize = (18 + Math.sin(nowSec * 8) * 2) * scaleRatio;
          const cornerLen = 6 * scaleRatio;
          ctx.strokeStyle = '#facc15';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12 * scaleRatio;
          ctx.lineWidth = 2 * scaleRatio;

          // Top-Left Corner Bracket
          ctx.beginPath();
          ctx.moveTo(-tSize, -tSize + cornerLen);
          ctx.lineTo(-tSize, -tSize);
          ctx.lineTo(-tSize + cornerLen, -tSize);
          ctx.stroke();

          // Top-Right Corner Bracket
          ctx.beginPath();
          ctx.moveTo(tSize - cornerLen, -tSize);
          ctx.lineTo(tSize, -tSize);
          ctx.lineTo(tSize, -tSize + cornerLen);
          ctx.stroke();

          // Bottom-Left Corner Bracket
          ctx.beginPath();
          ctx.moveTo(-tSize, tSize - cornerLen);
          ctx.lineTo(-tSize, tSize);
          ctx.lineTo(-tSize + cornerLen, tSize);
          ctx.stroke();

          // Bottom-Right Corner Bracket
          ctx.beginPath();
          ctx.moveTo(tSize - cornerLen, tSize);
          ctx.lineTo(tSize, tSize);
          ctx.lineTo(tSize, tSize - cornerLen);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Range in Cells Badge
          const distCells = Math.hypot(ship.x - encounterShipPos.x, ship.y - encounterShipPos.y);
          ctx.fillStyle = '#000000ee';
          ctx.fillRect(-42, -tSize - 22, 84, 18);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1;
          ctx.strokeRect(-42, -tSize - 22, 84, 18);

          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 10px "Rajdhani", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`[R: ${distCells.toFixed(1)} cells]`, 0, -tSize - 10);

          drawSpriteLabel(`sprite-alien-${ship.race.toLowerCase().replace(/\\s+/g, '-')}-${ship.vesselClass.toLowerCase()}`, 0, -tSize - 34, '#facc15');
          ctx.restore();
        } else if (!ship.isWreck) {
          drawSpriteLabel(`sprite-alien-${ship.race.toLowerCase().replace(/\\s+/g, '-')}-${ship.vesselClass.toLowerCase()}`, sx, sy - 34 * scaleRatio, '#ef4444');
        }
      });

      // 8.5 OFF-SCREEN TARGET DIRECTIONAL INDICATORS (PERIMETER ARROWS WITH RACE/CLASS & CELL DISTANCE)
      activeEncounterGroup.ships.forEach((ship, sIdx) => {
        const sx = cx + (ship.x - camX) * cellSize;
        const sy = cy + (ship.y - camY) * cellSize;

        // Check if alien vessel is off-screen (beyond viewport perimeter safe margins)
        const marginX = 40;
        const marginY = 40;
        const isOffScreen =
          sx < marginX ||
          sx > canvasWidth - marginX ||
          sy < marginY ||
          sy > canvasHeight - marginY;

        if (isOffScreen) {
          ctx.save();

          // Calculate angle from screen center to the off-screen target
          const angle = Math.atan2(sy - cy, sx - cx);

          // Find intersection along the viewport perimeter rectangle
          const boundLeft = 65;
          const boundRight = canvasWidth - 65;
          const boundTop = 55;
          const boundBottom = canvasHeight - 55;

          const dx = sx - cx;
          const dy = sy - cy;

          let edgeX = cx;
          let edgeY = cy;

          // Ray-box intersection from (cx, cy)
          const slope = dy / (dx || 0.0001);

          if (dx > 0) {
            // Intersect right edge
            const yAtRight = cy + (boundRight - cx) * slope;
            if (yAtRight >= boundTop && yAtRight <= boundBottom) {
              edgeX = boundRight;
              edgeY = yAtRight;
            } else if (dy > 0) {
              // Intersect bottom edge
              edgeX = cx + (boundBottom - cy) / slope;
              edgeY = boundBottom;
            } else {
              // Intersect top edge
              edgeX = cx + (boundTop - cy) / slope;
              edgeY = boundTop;
            }
          } else {
            // Intersect left edge
            const yAtLeft = cy + (boundLeft - cx) * slope;
            if (yAtLeft >= boundTop && yAtLeft <= boundBottom) {
              edgeX = boundLeft;
              edgeY = yAtLeft;
            } else if (dy > 0) {
              // Intersect bottom edge
              edgeX = cx + (boundBottom - cy) / slope;
              edgeY = boundBottom;
            } else {
              // Intersect top edge
              edgeX = cx + (boundTop - cy) / slope;
              edgeY = boundTop;
            }
          }

          const distCells = Math.hypot(ship.x - encounterShipPos.x, ship.y - encounterShipPos.y);
          const shipClass=ship.vesselClass.toLowerCase().startsWith(ship.race.toLowerCase())?ship.vesselClass:`${ship.race} ${ship.vesselClass}`;
          const labelText = `▶ ${shipClass} (${Math.round(distCells)}c)`;

          ctx.font = 'bold 10px "Rajdhani", sans-serif';
          const textW = ctx.measureText(labelText).width;
          const badgeW = textW + 16;
          const badgeH = 22;

          // Clamp badge drawing position so text remains fully on screen
          const badgeX = Math.max(badgeW / 2 + 6, Math.min(canvasWidth - badgeW / 2 - 6, edgeX));
          const badgeY = Math.max(badgeH / 2 + 6, Math.min(canvasHeight - badgeH / 2 - 6, edgeY));

          const isTarget = sIdx === encounterTargetIndex;
          const indicatorColor = isTarget ? '#facc15' : ship.isWreck ? '#94a3b8' : '#ef4444';

          // Glowing Badge Backdrop
          ctx.fillStyle = 'rgba(5, 10, 26, 0.92)';
          ctx.shadowColor = indicatorColor;
          ctx.shadowBlur = 10;
          ctx.strokeStyle = indicatorColor;
          ctx.lineWidth = isTarget ? 2 : 1.2;

          ctx.beginPath();
          ctx.roundRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 6);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Directional Arrow & Tag Text
          ctx.fillStyle = indicatorColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, badgeX, badgeY);

          ctx.restore();
        }
      });

      // 9. DEVELOPER MODE COMBAT READOUT OVERLAY (HUD Box in Corner)
      if (devUsed || isDevPanelOpen) {
        const tgtShip = activeEncounterGroup.ships[encounterTargetIndex] || activeEncounterGroup.ships[0];
        const distCells = tgtShip ? Math.hypot(tgtShip.x - encounterShipPos.x, tgtShip.y - encounterShipPos.y) : 0;
        const deltaX = tgtShip ? Math.abs(tgtShip.x - encounterShipPos.x) : 0;
        const deltaY = tgtShip ? Math.abs(tgtShip.y - encounterShipPos.y) : 0;
        const inPlayerLaserReach = distCells <= 10.0;

        const boxX = 20;
        const boxY = 60;
        const boxW = 380;
        const boxH = 96;

        ctx.save();
        ctx.fillStyle = 'rgba(2, 6, 23, 0.94)';
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 11px "Rajdhani", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('⚡ DEV COMBAT READOUT', boxX + 10, boxY + 16);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px "Courier New", monospace';
        const formattedShipClass = tgtShip
          ? (tgtShip.vesselClass.toLowerCase().startsWith(tgtShip.race.toLowerCase())
              ? tgtShip.vesselClass
              : `${tgtShip.race} ${tgtShip.vesselClass}`)
          : 'NO TARGET';
        ctx.fillText(`TARGET: ${formattedShipClass} (${distCells.toFixed(1)}c | Δx:${deltaX.toFixed(0)}, Δy:${deltaY.toFixed(0)})`, boxX + 10, boxY + 34);

        ctx.fillStyle = '#e2e8f0';
        const tgtShields = tgtShip ? tgtShip.shields : 0;
        const tgtMaxShields = tgtShip ? tgtShip.maxShields : 0;
        const tgtArmor = tgtShip ? tgtShip.hullIntegrity : 0;
        const tgtMaxArmor = tgtShip ? tgtShip.maxHull : 0;
        const shieldsText = inNebula
          ? `SHIELDS: ${tgtShields}/${tgtMaxShields} (down: nebula)`
          : `SHIELDS: ${tgtShields}/${tgtMaxShields}`;
        ctx.fillText(`${shieldsText} | ARMOR: ${tgtArmor}/${tgtMaxArmor}`, boxX + 10, boxY + 52);

        ctx.fillStyle = inPlayerLaserReach ? '#38bdf8' : '#f59e0b';
        ctx.fillText(`PLAYER LASER REACH (<=10.0c): ${inPlayerLaserReach ? 'IN RANGE (BEAM ARMED)' : `${(distCells - 10.0).toFixed(1)}c OUTSIDE RANGE`}`, boxX + 10, boxY + 70);

        ctx.fillStyle = lastShotResult.startsWith('HIT') ? '#22c55e' : lastShotResult.startsWith('MISS') ? '#ef4444' : '#94a3b8';
        ctx.fillText(`LAST SHOT: ${lastShotResult}`, boxX + 10, boxY + 88);
        ctx.restore();
      }

      // 10. SLIDING ENCOUNTER BANNER ALERT
      if (encounterBannerTimer > 0) {
        const bAlpha = Math.min(1.0, encounterBannerTimer / 0.5);
        ctx.save();
        ctx.fillStyle = `rgba(15, 23, 42, ${bAlpha * 0.92})`;
        ctx.fillRect(0, 20, canvasWidth, 42);

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(0, 20, canvasWidth, 42);

        const isStrobe = Math.sin(nowSec * 15) > 0;
        ctx.fillStyle = isStrobe ? '#ef4444' : '#facc15';
        ctx.font = 'bold 15px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(encounterBannerText, canvasWidth / 2, 47);
        ctx.restore();
      }

      // 11. RED VIGNETTE SCREEN FLASH ON DAMAGE
      if (redVignetteFlash > 0) {
        const vGrad = ctx.createRadialGradient(cx, cy, canvasWidth * 0.25, cx, cy, canvasWidth * 0.65);
        vGrad.addColorStop(0, 'transparent');
        vGrad.addColorStop(1, `rgba(239, 68, 68, ${redVignetteFlash * 0.75})`);
        ctx.fillStyle = vGrad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
      return;
    }

    // ------------------------------------------------------------------------
    // 3. IN ORBIT VIEW (G3 OVERHAUL: Large Planetary Sphere, Atmosphere Halo, Clouds, Radar Sweep & Synchronous Ship)
    // ------------------------------------------------------------------------
    if (gameLocation === 'In Orbit' && orbitPlanetIndex !== null) {
      const p = currentPlanets[orbitPlanetIndex];
      const planetCenterX = canvasWidth / 2;
      const planetCenterY = canvasHeight / 2;
      // 75% of viewport height = 270px radius at 720p
      const targetRadius = canvasHeight * 0.375;
      const baseRadius = targetRadius * Math.max(0.4, orbitTransitionProgress);
      const planetRot = orbitAnimPhase * 0.3;

      // Deterministically select sector's space background behind the 75% height planetary sphere (full-bleed cover with clean central region sampling)
      const orbitBgSeed = (currentStar.id * 13 + currentStar.x * 7 + currentStar.y * 19) >>> 0;
      const orbitBgKeys = ['space_bg_a', 'space_bg_b', 'space_bg_c', 'space_bg_d'];
      const orbitBgImg = assets[orbitBgKeys[orbitBgSeed % 4]];
      drawCoverImage(ctx, orbitBgImg, canvasWidth, canvasHeight, '#030611', true);

      // Distant stars
      ctx.fillStyle = '#94a3b8';
      for (let i = 0; i < 70; i++) {
        const sx = (Math.sin(i * 123 + 45) * 480 + 480);
        const sy = (Math.cos(i * 87 + 62) * 270 + 270);
        const sz = (i % 4 === 0) ? 2 : 1;
        ctx.fillRect(sx, sy, sz, sz);
      }

      // Distant Sun illumination glow from upper-left
      const sunAngle = -Math.PI * 0.75;
      const sunDist = 380;
      const sunX = planetCenterX + Math.cos(sunAngle) * sunDist;
      const sunY = planetCenterY + Math.sin(sunAngle) * sunDist;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 420);
      sunGlow.addColorStop(0, 'rgba(255, 240, 200, 0.25)');
      sunGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Synchronous Orbiting Ship calculations & day/night dimming
      const shipOrbitR = baseRadius + 38;
      const shipAngle = orbitAnimPhase * 0.8;
      const orbitShipX = planetCenterX + Math.cos(shipAngle) * shipOrbitR;
      const orbitShipY = planetCenterY + Math.sin(shipAngle) * (shipOrbitR * 0.45); // isometric tilt
      const orbitShipLength = orbitShipSize(canvasWidth,canvasHeight);
      const isBehind = Math.sin(shipAngle) < 0;

      // Day / Night & Eclipsed Dimming
      const toSunX = Math.cos(sunAngle);
      const toSunY = Math.sin(sunAngle);
      const shipDx = orbitShipX - planetCenterX;
      const shipDy = orbitShipY - planetCenterY;
      const shipDist = Math.hypot(shipDx, shipDy);
      const sunDot = shipDist > 0 ? (shipDx * toSunX + shipDy * toSunY) / shipDist : 0;

      // When behind the planet (in eclipse) or on the night side (facing away from sun),
      // dim illumination while keeping the painted hull opaque.
      let sunFactor = 1.0;
      if (isBehind) {
        sunFactor = 0.0;
      } else {
        sunFactor = Math.max(0, Math.min(1, (sunDot + 0.2) / 0.4));
      }
      const lighting=orbitHullLighting(sunFactor);
      const shipBrightness = lighting.brightness.toFixed(2);

      const renderOrbitShip = () => {
        ctx.save();
        ctx.globalAlpha = lighting.alpha;
        if (typeof ctx.filter !== 'undefined') {
          ctx.filter = `brightness(${shipBrightness})`;
        }

        if(!drawOrbitShip(ctx,orbitShipX,orbitShipY,orbitShipLength,shipAngle,{engineClass,cargoPodsCount:cargoPods,armorClass,laserClass,missileClass}))drawUnifiedPlayerShip({
          ctx,
          x: orbitShipX,
          y: orbitShipY,
          headingRad: shipAngle + Math.PI / 2,
          lengthPx: orbitShipLength,
          engineClass,
          isMoving: false, // Steady orbit station-keeping (small idle glow)
          engineThrust: flightEngineThrust,
          cargoPodsCount: cargoPods,
          shieldsActive: shieldsRaised,
          inNebula,
          assets,
          weaponsArmed,
          missileClass,
          laserClass,
          armorClass,
          nowSec,
          label: shipName || 'Arth Vessel',
        });
        if(ctx.canvas?.dataset.orbitShipMode){ctx.save();ctx.filter='none';ctx.font='bold 11px "Orbitron",sans-serif';ctx.textAlign='center';ctx.fillStyle='#77d9ef';ctx.fillText(shipName||'Arth Vessel',orbitShipX,orbitShipY-orbitShipLength*.5-10);ctx.restore();}

        drawSpriteLabel(
          'sprite-player-ship-orbit',
          orbitShipX,
          orbitShipY - (orbitShipLength / (1087 / 602)) * 0.5 - 12,
          '#00f0ff',
        );

        ctx.restore();
      };

      // Far half of ellipse: draw ship BEFORE planet so planet disc naturally occludes it
      if (isBehind) {
        renderOrbitShip();
      }

      // ATMOSPHERIC RIM HALO (Sun-Facing Limb)
      const rimColor = getAtmosphereRimGlow(p.gases);
      const rimThick = getAtmosphereRimThickness(p.atmosphereDensity) * 2.2;

      if (rimColor && rimThick > 0) {
        ctx.save();
        const haloGrad = ctx.createRadialGradient(
          planetCenterX - 50,
          planetCenterY - 50,
          baseRadius - 5,
          planetCenterX,
          planetCenterY,
          baseRadius + rimThick,
        );
        haloGrad.addColorStop(0, `${rimColor}99`);
        haloGrad.addColorStop(0.7, `${rimColor}44`);
        haloGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(planetCenterX, planetCenterY, baseRadius + rimThick, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // PROCEDURAL PLANETARY SPHERE OR TEXTURE WRAP (Surface Shading & Texture)
      ctx.save();
      ctx.beginPath();
      ctx.arc(planetCenterX, planetCenterY, baseRadius, 0, Math.PI * 2);
      ctx.clip();

      // Solid base fill to prevent any transparent gaps through slices
      ctx.fillStyle = p.color || '#070f1e';
      ctx.fillRect(planetCenterX - baseRadius, planetCenterY - baseRadius, baseRadius * 2, baseRadius * 2);

      const { assetKey: orbitAssetKey, tintColor: orbitTintColor } = getPlanetMapAssetKey(
        p,
        currentStar.x,
        currentStar.y,
      );
      const orbitMapImg = orbitAssetKey ? assets[orbitAssetKey] : null;

      if (orbitMapImg && orbitMapImg.complete && orbitMapImg.naturalWidth > 0) {
        // Project once per texture rotation step, then scale the cached disc.
        // Entry zoom no longer repeats hundreds of texture slices every frame.
        const seamlessImg = getSeamlessPlanetTexture(orbitMapImg);
        const globe = projectedPlanetTexture(seamlessImg, planetRot);globe.dataset.planetSurfaceAsset=orbitMapImg.src;
        ctx.drawImage(globe, planetCenterX - baseRadius, planetCenterY - baseRadius, baseRadius * 2, baseRadius * 2);

        // Seed-based subtle canvas color grading / tint overlay
        if (orbitTintColor) {
          ctx.save();
          ctx.fillStyle = orbitTintColor;
          ctx.fillRect(planetCenterX - baseRadius, planetCenterY - baseRadius, baseRadius * 2, baseRadius * 2);
          ctx.restore();
        }

        // Spherical 3D curvature gradient
        const sphereCurveGrad = ctx.createRadialGradient(
          planetCenterX - baseRadius * 0.35,
          planetCenterY - baseRadius * 0.35,
          baseRadius * 0.1,
          planetCenterX,
          planetCenterY,
          baseRadius
        );
        sphereCurveGrad.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
        sphereCurveGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        sphereCurveGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
        ctx.fillStyle = sphereCurveGrad;
        ctx.fillRect(planetCenterX - baseRadius, planetCenterY - baseRadius, baseRadius * 2, baseRadius * 2);

        // The approved painting carries geology; no floating primitive overlays.
      } else {
        // Procedural fallback surface gradient
        const surfaceGrad = ctx.createRadialGradient(
          planetCenterX - 45,
          planetCenterY - 45,
          20,
          planetCenterX,
          planetCenterY,
          baseRadius,
        );

        if (p.isHomeworld || p.type === 'Liquid') {
          surfaceGrad.addColorStop(0, '#38bdf8');
          surfaceGrad.addColorStop(0.5, '#0284c7');
          surfaceGrad.addColorStop(0.9, '#082f49');
          surfaceGrad.addColorStop(1, '#020617');
        } else if (p.type === 'Frozen') {
          surfaceGrad.addColorStop(0, '#f0f9ff');
          surfaceGrad.addColorStop(0.5, '#7dd3fc');
          surfaceGrad.addColorStop(0.9, '#0369a1');
          surfaceGrad.addColorStop(1, '#020617');
        } else if (p.type === 'Molten') {
          surfaceGrad.addColorStop(0, '#ffedd5');
          surfaceGrad.addColorStop(0.4, '#f97316');
          surfaceGrad.addColorStop(0.8, '#7f1d1d');
          surfaceGrad.addColorStop(1, '#1c1917');
        } else if (p.type === 'Gas Giant') {
          surfaceGrad.addColorStop(0, '#fef08a');
          surfaceGrad.addColorStop(0.4, '#f59e0b');
          surfaceGrad.addColorStop(0.8, '#b45309');
          surfaceGrad.addColorStop(1, '#451a03');
        } else if (p.type === 'Crystal') {
          surfaceGrad.addColorStop(0, '#fdf4ff');
          surfaceGrad.addColorStop(0.4, '#e879f9');
          surfaceGrad.addColorStop(0.8, '#7e22ce');
          surfaceGrad.addColorStop(1, '#1e1b4b');
        } else {
          // Rock
          surfaceGrad.addColorStop(0, '#e2e8f0');
          surfaceGrad.addColorStop(0.4, '#94a3b8');
          surfaceGrad.addColorStop(0.8, '#475569');
          surfaceGrad.addColorStop(1, '#0f172a');
        }

        ctx.fillStyle = surfaceGrad;
        ctx.fillRect(
          planetCenterX - baseRadius,
          planetCenterY - baseRadius,
          baseRadius * 2,
          baseRadius * 2,
        );
      }

      drawPlanetWeather(ctx,planetCenterX,planetCenterY,baseRadius,p,currentStar.x*73856093^currentStar.y*19349663^p.slot*83492791,orbitAnimPhase/.4);

      // Day / Night Terminator Shading Overlay with soft directional transition
      const termGrad = ctx.createLinearGradient(
        planetCenterX - baseRadius * 0.7,
        planetCenterY - baseRadius * 0.7,
        planetCenterX + baseRadius * 0.9,
        planetCenterY + baseRadius * 0.9,
      );
      termGrad.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
      termGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.28)');
      termGrad.addColorStop(0.8, 'rgba(2, 6, 23, 0.88)');
      termGrad.addColorStop(1, 'rgba(0, 0, 0, 0.98)');
      ctx.fillStyle = termGrad;
      ctx.fillRect(
        planetCenterX - baseRadius,
        planetCenterY - baseRadius,
        baseRadius * 2,
        baseRadius * 2,
      );

      ctx.restore(); // end clip
      drawPlanetAtmosphere(ctx,planetCenterX,planetCenterY,baseRadius,p);

      // SENSORS VISUAL SWEEP (Horizontal Holographic Radar Beam)
      if(planetaryScanRef.current && !scanReady(planetaryScanRef.current)) {
      const sweepY = planetCenterY - baseRadius + ((nowSec * 90) % (baseRadius * 2));
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(planetCenterX - baseRadius * 1.05, sweepY);
      ctx.lineTo(planetCenterX + baseRadius * 1.05, sweepY);
      ctx.stroke();
      ctx.restore();

      }

      // Near half of ellipse: draw ship AFTER planet so it passes in front
      if (!isBehind) {
        renderOrbitShip();
      }

      // HEADER BADGE IN ORBIT VIEW (DYNAMIC SIZING & WRAPPING)
      const orbitTitleText = (p.isHomeworld || p.name.toLowerCase() === 'arth')
        ? 'Synchronous Orbit: Arth'
        : `Synchronous Orbit: ${p.name}`;

      const reading=planetaryScanRef.current;
      const statsSegments = scanReady(reading) ? [
        `Bio: ${p.bioDensity}%`,`Minerals: ${p.mineralDensity}%`,
        ...(reading?.analysis?planetAnalysisFields(p).map((f,i)=>f.label+': '+(reading.analysis!.known[i]?f.value:'Not certain')):['Science → Analysis for conclusions']),
      ] : [reading?'Sensor sweep in progress':'Science → Sensors to scan this planet'];

      const maxAllowedBoxW = Math.max(280, canvasWidth - 32);
      const padX = 18;
      const padY = 10;
      const maxContentW = maxAllowedBoxW - padX * 2;

      // Measure title line
      ctx.font = 'bold 15px "Orbitron", "Rajdhani", sans-serif';
      const titleW = ctx.measureText(orbitTitleText).width;

      // Wrap stats segments onto lines breaking at " · " separators
      ctx.font = '11px "Rajdhani", sans-serif';
      const statsLines: string[] = [];
      let curStatsLine = '';

      for (const seg of statsSegments) {
        const candidate = curStatsLine ? `${curStatsLine} · ${seg}` : seg;
        if (ctx.measureText(candidate).width <= maxContentW || !curStatsLine) {
          curStatsLine = candidate;
        } else {
          statsLines.push(curStatsLine);
          curStatsLine = seg;
        }
      }
      if (curStatsLine) {
        statsLines.push(curStatsLine);
      }

      // Box width: wider of title line and stats lines plus padding, clamped to maxAllowedBoxW
      const maxLineWidth = Math.max(titleW, ...statsLines.map((l) => ctx.measureText(l).width));
      const boxW = Math.min(maxAllowedBoxW, Math.max(280, maxLineWidth + padX * 2));
      const boxX = (canvasWidth - boxW) / 2;

      // Dynamic box height: padY + titleH (18) + gap (6) + statsLines * lineH (15) + padY
      const titleH = 18;
      const statsLineH = 15;
      const boxH = padY * 2 + titleH + 6 + statsLines.length * statsLineH;
      const boxY = 15;

      ctx.save();
      ctx.fillStyle = 'rgba(3, 7, 18, 0.85)';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Render Title
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 15px "Orbitron", "Rajdhani", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(orbitTitleText, canvasWidth / 2, boxY + padY);

      // Render Stats Lines
      ctx.font = '11px "Rajdhani", sans-serif';
      ctx.fillStyle = '#cbd5e1';
      let textCurY = boxY + padY + titleH + 6;
      for (const line of statsLines) {
        ctx.fillText(line, canvasWidth / 2, textCurY);
        textCurY += statsLineH;
      }
      ctx.restore();

      drawSpriteLabel(
        `sprite-planet-sphere-${p.name.toLowerCase()}`,
        planetCenterX,
        planetCenterY - baseRadius - 16,
        '#38bdf8',
      );
      return;
    }

    // ------------------------------------------------------------------------
    // 4. STAR SYSTEM VIEW (G3 OVERHAUL: Coronal Stars, Lit Spheres, Orbital Guides & Parallax)
    // ------------------------------------------------------------------------
    if (gameLocation === 'Star System') {
      // Deterministically select one of the 4 space backgrounds using system/star seed (full-bleed cover with clean central region sampling)
      const starBgSeed = (currentStar.id * 13 + currentStar.x * 7 + currentStar.y * 19) >>> 0;
      const starBgKeys = ['space_bg_a', 'space_bg_b', 'space_bg_c', 'space_bg_d'];
      const starBgImg = assets[starBgKeys[starBgSeed % 4]];
      drawCoverImage(ctx, starBgImg, canvasWidth, canvasHeight, '#070914', true);

      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const zoom = systemZoom;

      // Camera follows and centers on the ship when zoomed in!
      // When zoomed out to overview (zoom ~0.65), camera smoothly centers on system center (0, 0).
      const camX = systemShipX;
      const camY = systemShipY;

      // Distant Nebula Dust Wash
      if (currentStar.inNebula) {
        const nebGrad = ctx.createRadialGradient(centerX, centerY, 40, centerX, centerY, 380);
        nebGrad.addColorStop(0, 'rgba(217, 70, 239, 0.18)');
        nebGrad.addColorStop(0.6, 'rgba(59, 130, 246, 0.14)');
        nebGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = nebGrad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Parallax Stars Layer 1 (Slow)
      ctx.fillStyle = '#64748b';
      for (let i = 0; i < 40; i++) {
        const sx = (Math.sin(i * 91 + 10) * 480 + 480 - camX * 0.05 + 960) % 960;
        const sy = (Math.cos(i * 73 + 20) * 270 + 270 - camY * 0.05 + 540) % 540;
        ctx.fillRect(sx, sy, 1, 1);
      }

      // Parallax Stars Layer 2 (Mid)
      ctx.fillStyle = '#94a3b8';
      for (let i = 0; i < 35; i++) {
        const sx = (Math.sin(i * 133 + 55) * 480 + 480 - camX * 0.12 + 960) % 960;
        const sy = (Math.cos(i * 107 + 77) * 270 + 270 - camY * 0.12 + 540) % 540;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(zoom, zoom);
      ctx.translate(-camX, -camY);

      // System Boundary Barrier
      ctx.strokeStyle = '#ff224440';
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = Math.max(1, 2 / zoom);
      ctx.beginPath();
      ctx.arc(0, 0, SYSTEM_BOUNDARY_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // SENSORS CONCENTRIC SCANNING RING PULSING AROUND CENTRAL STAR
      const sensorPulseRadius = ((nowSec * 70) % (SYSTEM_BOUNDARY_RADIUS * 0.9));
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = Math.max(1, 1.5 / zoom);
      ctx.beginPath();
      ctx.arc(0, 0, sensorPulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      // SUBTLE ORBITAL RING GUIDES
      currentPlanets.forEach((p) => {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
        ctx.lineWidth = Math.max(0.5, 1 / zoom);
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, p.orbitRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // CENTRAL STAR: Glowing Core, Coronal Flare Rays & Spectral Class Parameters
      const spec = SPECTRAL_PROPS[currentStar.spectral] || SPECTRAL_PROPS.G;
      const isFlared = currentStar.flareDay !== undefined && currentAbsDay >= currentStar.flareDay && !flaresStopped;
      const isUnstable = currentStar.flareDay !== undefined && !flaresStopped && (currentStar.flareDay - currentAbsDay) <= 30;

      // Animate coronal light and rotation, keeping the physical sun disc fixed.
      const starVisual = starAppearance(spec.radius, nowSec, isUnstable);
      const starRadius = starVisual.radius;

      // Soft Multi-layered Corona
      const starGlow = ctx.createRadialGradient(0, 0, starRadius * 0.3, 0, 0, starRadius * 3.5);
      starGlow.addColorStop(0, '#ffffff');
      starGlow.addColorStop(0.2, spec.color);
      starGlow.addColorStop(0.6, spec.coronaColor);
      starGlow.addColorStop(1, 'transparent');
      ctx.save();
      ctx.globalAlpha = starVisual.coronaAlpha;
      ctx.fillStyle = starGlow;
      ctx.beginPath();
      ctx.arc(0, 0, starRadius * 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Rotating Coronal Flare Rays
      ctx.save();
      ctx.rotate(starVisual.rotation);
      ctx.strokeStyle = spec.coronaColor;
      ctx.lineWidth = Math.max(1, 2.5 / zoom);
      for (let ray = 0; ray < 8; ray++) {
        const rayAngle = (ray * Math.PI) / 4;
        const rayLen = starRadius * (1.8 + (ray % 3) * 0.13);
        ctx.globalAlpha = 0.65 + Math.sin(nowSec * 2 + ray) * 0.25;
        ctx.beginPath();
        ctx.moveTo(Math.cos(rayAngle) * (starRadius * 0.8), Math.sin(rayAngle) * (starRadius * 0.8));
        ctx.lineTo(Math.cos(rayAngle) * rayLen, Math.sin(rayAngle) * rayLen);
        ctx.stroke();
      }
      ctx.restore();

      // Glowing Central Core
      ctx.fillStyle = spec.coreColor;
      ctx.shadowColor = spec.color;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(0, 0, starRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.save();
      ctx.scale(1 / zoom, 1 / zoom);
      drawSpriteLabel(`sprite-star-${currentStar.spectral.toLowerCase()}-${currentStar.name.toLowerCase().replace(/\\s+/g, '-')}`, 0, -starRadius * zoom - 16, spec.color);
      ctx.restore();

      // LENS FLARE HALO WHEN SHIP IS IN CLOSE PROXIMITY (< 120px in world coords)
      const shipDistToSun = Math.hypot(systemShipX, systemShipY);
      if (shipDistToSun < 140) {
        const flareIntensity = 1 - shipDistToSun / 140;
        const lensGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 220);
        lensGrad.addColorStop(0, `rgba(255, 255, 255, ${flareIntensity * 0.4})`);
        lensGrad.addColorStop(0.4, `rgba(0, 240, 255, ${flareIntensity * 0.3})`);
        lensGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 220, 0, Math.PI * 2);
        ctx.fill();
      }

      // CONTINUUM FLUX RIFTS (Vortices with Gravitational Sparks)
      if (hasRingDevice) {
        CONTINUUM_FLUX_PAIRS.forEach((flux) => {
          const distFromCurrent = Math.hypot(flux.from[0] - currentStar.x, flux.from[1] - currentStar.y);
          if (distFromCurrent <= 15) {
            const riftX = (flux.from[0] - currentStar.x) * 16;
            const riftY = (flux.from[1] - currentStar.y) * 16;

            ctx.save();
            ctx.translate(riftX, riftY);
            ctx.rotate(nowSec * 3);

            // Spatial distortion vortex
            const riftGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
            riftGrad.addColorStop(0, '#00f0ff');
            riftGrad.addColorStop(0.5, '#d946ef');
            riftGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = riftGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.fill();

            // Gravitational sparks
            ctx.fillStyle = '#ffffff';
            for (let sp = 0; sp < 4; sp++) {
              const spA = (sp * Math.PI) / 2 + nowSec * 4;
              ctx.fillRect(Math.cos(spA) * 10, Math.sin(spA) * 10, 2, 2);
            }
            ctx.restore();
          }
        });
      }

      // LIT PLANETARY SPHERES WITH DAY/NIGHT TERMINATOR SHADING & ATMOSPHERIC RIMS
      currentPlanets.forEach((planet, pIdx) => {
        const px = planet.currentX;
        const py = planet.currentY;
        const pRadius = Math.max(planet.renderSize,15/zoom);

        // Vector from planet towards sun (0,0)
        const lightAngle = Math.atan2(-py, -px);

        // ATMOSPHERIC RIM GLOW
        const rimColor = getAtmosphereRimGlow(planet.gases);
        const rimThickness = getAtmosphereRimThickness(planet.atmosphereDensity);

        if (rimColor && rimThickness > 0) {
          ctx.save();
          ctx.strokeStyle = rimColor;
          ctx.shadowColor = rimColor;
          ctx.shadowBlur = 8;
          ctx.lineWidth = Math.max(0.6, (rimThickness * 0.75) / Math.sqrt(zoom));
          ctx.beginPath();
          ctx.arc(px, py, pRadius + 1, lightAngle - Math.PI / 2, lightAngle + Math.PI / 2);
          ctx.stroke();
          ctx.restore();
        }

        // Planetary Sphere Surface
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, pRadius, 0, Math.PI * 2);
        ctx.clip();

        const {assetKey,tintColor}=getPlanetMapAssetKey(planet,currentStar.x,currentStar.y);
        const image=assetKey?assets[assetKey]:null;
        if(image?.complete&&image.naturalWidth>0){
          const globe=projectedPlanetTexture(getSeamlessPlanetTexture(image),orbitAnimPhase*.3,128);globe.dataset.planetSurfaceAsset=image.src;
          ctx.drawImage(globe,px-pRadius,py-pRadius,pRadius*2,pRadius*2);
          if(tintColor){ctx.fillStyle=tintColor;ctx.fillRect(px-pRadius,py-pRadius,pRadius*2,pRadius*2);}
        }else {ctx.fillStyle=planet.color;ctx.fillRect(px-pRadius,py-pRadius,pRadius*2,pRadius*2);}

        drawPlanetWeather(ctx,px,py,pRadius,planet,currentStar.x*73856093^currentStar.y*19349663^planet.slot*83492791,orbitAnimPhase/.4);

        // Day/Night Terminator Shading (Facing central star)
        const termGrad = ctx.createLinearGradient(
          px + Math.cos(lightAngle) * pRadius,
          py + Math.sin(lightAngle) * pRadius,
          px - Math.cos(lightAngle) * pRadius,
          py - Math.sin(lightAngle) * pRadius,
        );
        termGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        termGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
        termGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
        ctx.fillStyle = termGrad;
        ctx.fillRect(px - pRadius, py - pRadius, pRadius * 2, pRadius * 2);

        ctx.restore(); // end clip
        drawPlanetAtmosphere(ctx,px,py,pRadius,planet,zoom);

        // Hover / Proximity Label for Nearest Planet (unscaled to remain readable)
        const distToShip = Math.hypot(systemShipX - px, systemShipY - py);
        const isNear = distToShip <= pRadius + 24;

        ctx.save();
        ctx.translate(px, py);
        ctx.scale(1 / zoom, 1 / zoom);
        const pScreenRadius = pRadius * zoom;

        if (isNear) {
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 11px "Orbitron", "Rajdhani", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`▼ ${planet.name.toUpperCase()} ▼`, 0, -pScreenRadius - 8);
        } else {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px "Rajdhani", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(planet.name, 0, pScreenRadius + 12);
        }
        drawSpriteLabel(`sprite-planet-${planet.type.toLowerCase()}-${planet.name.toLowerCase().replace(/\\s+/g, '-')}`, 0, -pScreenRadius - 20, '#38bdf8');
        ctx.restore();
      });

      ctx.restore(); // end world transform

      // DRAW PLAYER STARSHIP IN SCREEN COORDINATES:
      // Cap the scout in screen pixels and below the smallest planetary disc.
      const shipScreenX = centerX + (systemShipX - camX) * zoom;
      const shipScreenY = centerY + (systemShipY - camY) * zoom;
      const isSystemMoving = activeConsoleMenu === 'Maneuver' && (activeDirectionVector.dx !== 0 || activeDirectionVector.dy !== 0);
      const isTurning = isSystemMoving;
      const bankFactor = isTurning ? 0.88 : 1.0;
      const shipScreenLength = systemShipLength(zoom,Math.min(...currentPlanets.map(p=>p.renderSize)));

      drawUnifiedPlayerShip({
        ctx,
        x: shipScreenX,
        y: shipScreenY,
        headingRad: shipHeading,
        lengthPx: shipScreenLength,
        engineClass,
        isMoving: isSystemMoving,
        engineThrust: flightEngineThrust,
        cargoPodsCount: cargoPods,
        shieldsActive: shieldsRaised,
        inNebula,
        bankFactor,
        assets,
        weaponsArmed,
        missileClass,
        laserClass,
        armorClass,
        nowSec,
        label: shipName || 'Arth Vessel',
      });

      drawSpriteLabel('sprite-player-ship', shipScreenX, shipScreenY - Math.max(10, shipScreenLength * 0.5) - 14, '#00f0ff');

      // Warp flash effect on system entry / exit
      if (fluxFlashTimer > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${fluxFlashTimer * 0.6})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // SOLAR FLARE EXPANDING CORONA SHOCKWAVE & PARTICLE DISCHARGE (If near flaring star)
      if (currentStar.flareDay !== undefined && !flaresStopped) {
        const daysRemaining = currentStar.flareDay - currentAbsDay;
        if (daysRemaining <= 15) {
          const flarePulse = Math.sin(nowSec * 12) * 0.5 + 0.5;
          const flareWaveR = ((nowSec * 140) % (SYSTEM_BOUNDARY_RADIUS * 1.2));

          // Expanding Shockwave Ring
          ctx.save();
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + flarePulse * 0.4})`;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 18;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, flareWaveR, 0, Math.PI * 2);
          ctx.stroke();

          // Flare Particle Discharges
          for (let fp = 0; fp < 6; fp++) {
            const fpAngle = (fp * Math.PI) / 3 + nowSec * 2;
            const fpx = Math.cos(fpAngle) * (flareWaveR * 0.9);
            const fpy = Math.sin(fpAngle) * (flareWaveR * 0.9);
            ctx.fillStyle = '#ffb700';
            ctx.beginPath();
            ctx.arc(fpx, fpy, 3 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }

      // Hand Test 16: In star system view, spoiler cleanliness is preserved (no thermal rad critical banner in system view)
      return;
    }

    // ------------------------------------------------------------------------
    // 5. HYPERSPACE VIEW (G3 OVERHAUL: Twinkling Parallax, Spectral Stars, Drifting Nebulae & Warp Streaks)
    // ------------------------------------------------------------------------
    if (gameLocation === 'Hyperspace') {
      const coordScale = 28 * hyperZoom;
      const viewCx = canvasWidth / 2;
      const viewCy = canvasHeight / 2;

      // Space background as single full-bleed cover draw with clean central region sampling (completely removing horizontal/vertical multi-tiling seams)
      const hyperRegionX = Math.floor(galaxyShipX / 60);
      const hyperRegionY = Math.floor(galaxyShipY / 55);
      const hyperBgSeed = (hyperRegionX * 5 + hyperRegionY) >>> 0;
      const hyperBgKeys = ['space_bg_a', 'space_bg_b', 'space_bg_c', 'space_bg_d'];
      const hyperBgImg = assets[hyperBgKeys[hyperBgSeed % 4]];
      drawCoverImage(ctx, hyperBgImg, canvasWidth, canvasHeight, '#040714', true);

      // 3-LAYER TWINKLING STARFIELD PARALLAX
      ctx.fillStyle = '#475569';
      for (let i = 0; i < 50; i++) {
        const sx = (Math.sin(i * 77 + 23) * 480 + 480 - galaxyShipX * 1.5 + 960) % 960;
        const sy = (Math.cos(i * 59 + 41) * 270 + 270 + galaxyShipY * 1.5 + 540) % 540;
        ctx.fillRect(sx, sy, 1, 1);
      }

      ctx.fillStyle = '#94a3b8';
      for (let i = 0; i < 40; i++) {
        const sx = (Math.sin(i * 113 + 61) * 480 + 480 - galaxyShipX * 3.5 + 960) % 960;
        const sy = (Math.cos(i * 97 + 83) * 270 + 270 + galaxyShipY * 3.5 + 540) % 540;
        const twinkle = Math.sin(nowSec * 5 + i) > 0 ? 1.5 : 0.8;
        ctx.fillRect(sx, sy, twinkle, twinkle);
      }

      // SPEED WARP LIGHT STREAKS
      warpStreakParticles.forEach((streak) => {
        ctx.save();
        ctx.strokeStyle = `rgba(0, 240, 255, ${streak.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(viewCx + streak.x, viewCy + streak.y);
        ctx.lineTo(
          viewCx + streak.x - Math.cos(shipHeading) * streak.length,
          viewCy + streak.y - Math.sin(shipHeading) * streak.length,
        );
        ctx.stroke();
        ctx.restore();
      });

      ctx.save();
      ctx.translate(viewCx, viewCy);

      // DRIFTING CHROMATIC 70 NEBULAE CLOUDS (Rendered with soft luminous semi-transparent blending)
      UNIVERSE.nebulae.forEach((neb, nIdx) => {
        const nx = (neb.x - galaxyShipX) * coordScale;
        const ny = -(neb.y - galaxyShipY) * coordScale;
        const nRadius = neb.radius * coordScale;

        if (Math.abs(nx) <= canvasWidth / 2 + nRadius * 1.8 && Math.abs(ny) <= canvasHeight / 2 + nRadius * 1.8) {
          const isVariantA = (neb.x * 7 + neb.y * 13 + nIdx) % 2 === 0;
          const cloudImg = isVariantA
            ? (assets['nebula_cloud_a'] || assets['nebula_cloud_b'])
            : (assets['nebula_cloud_b'] || assets['nebula_cloud_a']);

          const rot = (neb.x * 37 + neb.y * 19) % (Math.PI * 2);
          const cloudDiameter = nRadius * 2.8;

          ctx.save();
          ctx.translate(nx, ny);
          ctx.rotate(rot + nowSec * 0.012);

          // Soft luminous semi-transparent blending (globalAlpha: 0.25 - 0.45, screen blend)
          const pulseAlpha = 0.32 + Math.sin(nowSec * 1.2 + neb.x * 0.5) * 0.08;
          ctx.globalAlpha = Math.max(0.25, Math.min(0.45, pulseAlpha));
          ctx.globalCompositeOperation = 'screen';

          if (cloudImg && cloudImg.complete && cloudImg.naturalWidth > 0) {
            ctx.drawImage(cloudImg, -cloudDiameter / 2, -cloudDiameter / 2, cloudDiameter, cloudDiameter);

            // Soft radial tint overlay
            const tintGrad = ctx.createRadialGradient(0, 0, cloudDiameter * 0.05, 0, 0, cloudDiameter * 0.5);
            tintGrad.addColorStop(0, neb.color);
            tintGrad.addColorStop(0.55, neb.color);
            tintGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = tintGrad;
            ctx.beginPath();
            ctx.arc(0, 0, cloudDiameter * 0.5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Fallback soft glowing radial gradient
            const nebGrad = ctx.createRadialGradient(0, 0, nRadius * 0.1, 0, 0, nRadius * 1.2);
            nebGrad.addColorStop(0, neb.color);
            nebGrad.addColorStop(0.5, neb.color);
            nebGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = nebGrad;
            ctx.beginPath();
            ctx.arc(0, 0, nRadius * 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });

      // CONTINUUM FLUX SHIMMERING VORTICES
      CONTINUUM_FLUX_PAIRS.forEach((flux) => {
        if (hasRingDevice || traversedFluxIds.includes(flux.id)) {
          [flux.from, flux.to].forEach(([fxCoord, fyCoord]) => {
            const fx = (fxCoord - galaxyShipX) * coordScale;
            const fy = -(fyCoord - galaxyShipY) * coordScale;
            const fluxRadius = Math.max(8, 14 * Math.min(2.5, hyperZoom));

            if (Math.abs(fx) <= canvasWidth / 2 + 50 * hyperZoom && Math.abs(fy) <= canvasHeight / 2 + 50 * hyperZoom) {
              ctx.save();
              ctx.translate(fx, fy);
              ctx.rotate(nowSec * 3);

              const vGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, fluxRadius);
              vGrad.addColorStop(0, '#00f0ff');
              vGrad.addColorStop(0.6, '#d946ef');
              vGrad.addColorStop(1, 'transparent');
              ctx.fillStyle = vGrad;
              ctx.beginPath();
              ctx.arc(0, 0, fluxRadius, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();

              ctx.strokeStyle = '#facc15';
              ctx.lineWidth = Math.max(1, 1.2 * Math.min(2, hyperZoom));
              const boxR = Math.max(6, 10 * Math.min(2.5, hyperZoom));
              ctx.strokeRect(fx - boxR, fy - boxR, boxR * 2, boxR * 2);
            }
          });
        }
      });

      // CANONICAL STARS GLOWING AT EXACT MAP COORDINATES (PURELY UNLABELLED SPECTRAL POINTS)
      UNIVERSE.stars.forEach((st) => {
        const sx = (st.x - galaxyShipX) * coordScale;
        const sy = -(st.y - galaxyShipY) * coordScale;

        if (Math.abs(sx) <= canvasWidth / 2 + 60 * hyperZoom && Math.abs(sy) <= canvasHeight / 2 + 60 * hyperZoom) {
          const spec = SPECTRAL_PROPS[st.spectral] || SPECTRAL_PROPS.G;
          const starRadius = Math.max(3.5, spec.radius * 0.35 * hyperZoom);

          // Coronal Glow
          const sGlow = ctx.createRadialGradient(sx, sy, 1, sx, sy, starRadius * 3.5);
          sGlow.addColorStop(0, '#ffffff');
          sGlow.addColorStop(0.35, spec.color);
          sGlow.addColorStop(0.7, spec.coronaColor || `${spec.color}44`);
          sGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = sGlow;
          ctx.beginPath();
          ctx.arc(sx, sy, starRadius * 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Star Core
          ctx.fillStyle = spec.coreColor;
          ctx.beginPath();
          ctx.arc(sx, sy, starRadius, 0, Math.PI * 2);
          ctx.fill();

          // Strictly unlabelled: no text labels, no coordinates, no faction tags, no system names
        }
      });

      // PLAYER STARSHIP AT CENTER OF HYPERSPACE (UNIFIED RENDERING)
      // Ship length: stays smaller than star at all zoom levels (6.8px at 1.0x, 17px at 2.5x, 40.8px at 6.0x; smaller than M-star core: 9.8px to 58.8px)
      const isHyperMoving = activeConsoleMenu === 'Maneuver' && (activeDirectionVector.dx !== 0 || activeDirectionVector.dy !== 0);
      const hyperShipLength = hyperspaceShipSize(hyperZoom);
      const hyperShipH = hyperShipLength / (1087 / 602);

      drawUnifiedPlayerShip({
        ctx,
        x: 0,
        y: 0,
        headingRad: shipHeading,
        lengthPx: hyperShipLength,
        engineClass,
        isMoving: isHyperMoving,
        engineThrust: flightEngineThrust,
        cargoPodsCount: cargoPods,
        shieldsActive: shieldsRaised,
        inNebula,
        assets,
        weaponsArmed,
        missileClass,
        laserClass,
        armorClass,
        nowSec,
        label: shipName || 'Arth Vessel',
      });

      drawSpriteLabel('sprite-player-ship-hyperspace', 0, -hyperShipH * 0.5 - 14, '#00f0ff');
      ctx.restore();

      // Warp flash effect
      if (fluxFlashTimer > 0) {
        ctx.fillStyle = `rgba(0, 240, 255, ${fluxFlashTimer * 0.7})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Hand Test 16: White screen flash on planetary detonation
      if (screenWhiteFlashTimer > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1.0, screenWhiteFlashTimer / 1.5)})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
      return;
    }

    // Global White screen flash (applies over any active viewport)
    if (screenWhiteFlashTimer > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1.0, screenWhiteFlashTimer / 1.5)})`;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
  };

  const updateRef = useRef(update);
  const drawRef = useRef(draw);
  updateRef.current = update;
  drawRef.current = draw;

  // Title Canvas animation: painted title scene with clean crop & particle stars
  useEffect(() => {
    if (gameState.status !== 'START') return;

    let animId = 0;
    const canvas = titleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random() * (canvas.getBoundingClientRect().width || 1280),
      y: Math.random() * (canvas.getBoundingClientRect().height || 720),
      speed: 0.15 + Math.random() * 0.45,
      size: 0.5 + Math.random() * 1.5,
    }));

    const renderTitleBackdrop = () => {
      const dpr = scenePixelRatio(gfxQuality,window.devicePixelRatio);
      const rect = canvas.getBoundingClientRect();
      const viewW = rect.width > 0 ? Math.round(rect.width) : (canvas.clientWidth || 1280);
      const viewH = rect.height > 0 ? Math.round(rect.height) : (canvas.clientHeight || 720);
      const backingW = Math.round(viewW * dpr);
      const backingH = Math.round(viewH * dpr);

      if (canvas.width !== backingW || canvas.height !== backingH) {
        canvas.width = backingW;
        canvas.height = backingH;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.clearRect(0, 0, viewW, viewH);

      // 1. Draw Title Scene Image whole: centered and scaled to cover the canvas using standard aspect-ratio cover math
      const titleImg = assets['title_scene_image_16_9'] || assets['cinematic_title_scene'];
      if (titleImg && titleImg.complete && titleImg.naturalWidth > 0) {
        const imgW = titleImg.naturalWidth || titleImg.width;
        const imgH = titleImg.naturalHeight || titleImg.height;
        const scale = Math.max(viewW / imgW, viewH / imgH);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const drawX = (viewW - drawW) / 2;
        const drawY = (viewH - drawH) / 2;

        const useSharpen = gfxQuality === 'High' && (drawW * dpr > imgW || drawH * dpr > imgH);
        const srcImg = useSharpen ? getUnsharpMaskCanvas(titleImg, 0.6) : titleImg;
        ctx.drawImage(srcImg, 0, 0, imgW, imgH, drawX, drawY, drawW, drawH);
      } else {
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, viewW, viewH);
      }

      // 2. Dynamic subtle drifting starfield in open space
      ctx.fillStyle = '#e2e8f0';
      stars.forEach((s) => {
        s.x -= s.speed;
        if (s.x < 0) s.x = viewW;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(renderTitleBackdrop);
    };

    renderTitleBackdrop();
    return () => cancelAnimationFrame(animId);
  }, [gameState.status, assets, gfxQuality]);

  useEffect(() => {
    let raf = 0;
    const loop = (time: number) => {
      const frameStart = performance.now();
      if (gameStateRef.current.status === 'PLAYING' && !isSimulationPaused) {
        stepperRef.current?.(time, (dt) => {
          previousSystemPositionRef.current = { x: systemShipXFrameRef.current, y: systemShipYFrameRef.current };
          previousOrbitPhaseRef.current=orbitAnimPhaseFrameRef.current;
          previousOrbitTransitionRef.current=orbitTransitionProgressFrameRef.current;
          updateRef.current(dt);
        });
        renderInterpolationRef.current = stepperRef.current?.alpha() ?? 1;
      } else {
        stepperRef.current?.reset();
        previousSystemPositionRef.current = { x: systemShipXFrameRef.current, y: systemShipYFrameRef.current };
        previousOrbitPhaseRef.current=orbitAnimPhaseFrameRef.current;
          previousOrbitTransitionRef.current=orbitTransitionProgressFrameRef.current;
        renderInterpolationRef.current = 1;
      }
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && gameStateRef.current.status !== 'START') drawRef.current(ctx);
      // Positions and effects stay live in the canvas. Update text/gauges at 15 Hz.
      if (frameUIDirtyRef.current && time - lastFrameUIPublishRef.current >= 1000 / 15) {
        frameUIDirtyRef.current = false;
        lastFrameUIPublishRef.current = time;
        publishFrameUI((version) => version + 1);
      }
      if (showPerformance) {
        const sample = performanceSampleRef.current;
        if (!sample.start) sample.start = time;
        if (sample.previous) sample.intervals.push(time - sample.previous);
        sample.previous = time;
        sample.frames++;
        sample.renderMs += performance.now() - frameStart;
        if (time - sample.start >= 1000) {
          const seconds = (time - sample.start) / 1000;
          const sorted = sample.intervals.sort((a, b) => a - b);
          const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] || 0;
          if (performanceOutputRef.current) performanceOutputRef.current.textContent = `${import.meta.env.DEV ? 'DEV' : 'PRODUCTION'} | ${(sample.frames / seconds).toFixed(0)} fps | frame p95 ${p95.toFixed(1)} ms | update+draw ${(sample.renderMs / sample.frames).toFixed(1)} ms | UI ${(sample.uiRenders / seconds).toFixed(0)}/s`;
          sample.start = time; sample.frames = 0; sample.renderMs = 0; sample.uiRenders = 0; sample.intervals = [];
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isSimulationPaused]);

  usePlaygroundGameLifecycle(gameState, sdk);

  // Active bridge station officer
  const activeStationOfficer = useMemo(() => {
    const postMap: Record<BridgeConsoleSubmenu, CrewPost | null> = {
      Bridge: 'Captain',
      Command: 'Captain',
      Science: 'Science Officer',
      Navigation: 'Navigator',
      Combat: 'Captain',
      Engineering: 'Engineer',
      Communications: 'Communications',
      Medical: 'Doctor',
      Maneuver: 'Navigator',
      CommsSession: 'Communications',
    };
    const post = postMap[activeConsoleMenu];
    if (!post) return null;
    const offId = assignedPosts[post];
    const member = crewRoster.find((c) => c.id === offId);
    return { post, member };
  }, [activeConsoleMenu, assignedPosts, crewRoster]);

  const gameMusicTheme = selectMusicTheme({title:gameState.status==='START',location:gameLocation,inCombat:!!activeEncounterGroup&&fleetCanFire(activeEncounterGroup,isCombatActiveRef.current),victory:victorySequenceModal,defeat:!!gameOverModal});
  const gameMusicTrack = recordedScoreForTheme(gameMusicTheme,{victory:gameState.status==='PLAYING'&&!!victorySequenceModal});

  return {
    ALIEN_TERRITORIES,
    Activity,
    AlertTriangle,
    Anchor,
    ArrowLeft,
    Award,
    Bomb,
    BridgeLogFilters,
    Building,
    CANONICAL_ARTIFACTS,
    CAPTAIN_ASIDES,
    CONTINUUM_FLUX_PAIRS,
    CREW_POSTS,
    Check,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Coins,
    Compass,
    Copy,
    CrewPortrait,
    CrewTraining,
    Crosshair,
    CrosshairIcon,
    DEFAULT_BASE_MOODS,
    Database,
    DevLabelsContext,
    DevUiTag,
    Download,
    Edit3,
    Eye,
    FULL_NOTICES_CATALOG,
    FileText,
    Flame,
    Fuel,
    GALLERY_SCENES,
    GameMusic,
    Globe,
    GraduationCap,
    Heart,
    LogOut,
    MINERAL_CATALOG,
    MenuOverlay,
    MessageSquare,
    MiningConsole,
    Monitor,
    NAME_POOLS,
    Navigation,
    PART_TABLES,
    Package,
    Pause,
    PlanetarySensors,
    Play,
    Plus,
    RACE_SPECS,
    RECORDING_ENERGY,
    RECORDING_RANGE,
    RECORDING_SECONDS,
    REPAIR_MINERALS,
    ROOM_BACKDROP_PATHS,
    Radio,
    Rocket,
    SPECTRAL_PROPS,
    STARPORT_DOORS,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    ShipDiagnostics,
    ShoppingCart,
    Sliders,
    Sparkle,
    Sparkles,
    Sun,
    SurveyLegend,
    SurveyPanel,
    Target,
    Terminal,
    Trash2,
    TrophyIcon,
    Truck,
    Tv,
    UNIVERSE,
    Upload,
    Users,
    Volume2,
    Wrench,
    X,
    Zap,
    acceptImportText,
    activeConsoleMenu,
    activeEncounterGroup,
    activeEvalIndex,
    activeFuelBurnRate,
    activeNoticeIndex,
    activePatientId,
    activeRepairTask,
    activeRoomIndex,
    activeSlot,
    activeStationOfficer,
    addBankTransaction,
    addMessage,
    adjustCargoStock,
    alienAnalysis,
    alienCommsState,
    alienEyeBlinkTimer,
    alienScanRef,
    alienVoiceEffectsEnabled,
    allocateCrewPortrait,
    applyGalleryScene,
    armorClass,
    artifactStock,
    artifactStockFrameRef,
    artifactsInHold,
    artifactsInHoldRef,
    assets,
    assignedPosts,
    assignmentVoiceLine,
    autosaveToast,
    bankLedger,
    banterEnabled,
    beginNewMission,
    breakOrbit,
    bulletins,
    buyDepotArtifact,
    calculateTranslationStrength,
    calculatedLandingFuel,
    canRemoveCargoPod,
    canvasHeight,
    canvasRef,
    canvasWidth,
    cargoHold,
    cargoHoldFrameRef,
    cargoPods,
    certifiedCrewCount,
    chartView,
    checkMalfunction,
    cinematicStateRef,
    clampGroundZoom,
    clampPurchaseQuantity,
    clampReleaseProgressRef,
    closeConversation,
    colonyNameInput,
    colonyPromptStep,
    commLineUsageRef,
    commsOfficer,
    commsSkill,
    commsTypewriterElapsed,
    completeDescentToPlanet,
    completeDockingToStarport,
    completeLaunchToSpace,
    completeSurfaceLaunchToOrbit,
    consumeFuel,
    copyDestination,
    copySuccess,
    copyTargetSlot,
    credits,
    creditsLiveRef,
    crewNameSource,
    crewRoster,
    crewRosterFrameRef,
    crtFilterEnabled,
    currentAbsDay,
    currentPlanets,
    currentStar,
    currentStarId,
    currentSurfaceState,
    depotSale,
    describedCargoItem,
    destroyedPlanetKeys,
    devActiveTab,
    devAlienRace,
    devAlienShipCount,
    devAlienVesselClass,
    devArmorInput,
    devArtifactId,
    devBalanceInput,
    devCrewCom,
    devCrewEng,
    devCrewMed,
    devCrewNav,
    devCrewSci,
    devCrewVitality,
    devDayInput,
    devHeatX10,
    devHourInput,
    devHullInput,
    devLabelsEnabled,
    devMineralName,
    devMineralVolume,
    devMonthInput,
    devMoodRace,
    devMoodState,
    devSelectedCrewId,
    devShieldInput,
    devSpecimenName,
    devSpecimenSize,
    devSpecimenValue,
    devSpecimenVolume,
    devTargetRange,
    devTeleportPlanetSlot,
    devTeleportStarId,
    devTeleportType,
    devTeleportX,
    devTeleportY,
    devUsed,
    devVoiceInput,
    devVoiceStatus,
    devYearInput,
    diagnosticStatus,
    diplomaticStrengthDifference,
    dockWithStarport,
    dockingBayCanvasRef,
    dockingBayWarnings,
    drawSurveyContacts,
    elowanHostile,
    encounterShipPos,
    encounterTargetIndex,
    endingTransmissionGroupRef,
    enduriumFuel,
    enduriumFuelFrameRef,
    engineClass,
    engineerSkill,
    engineeringMode,
    enterOrbit,
    enterStarSystem,
    evaluations,
    exportCodeString,
    exportSlotData,
    exportTargetSlot,
    fieldRepairCost,
    fileInputRef,
    filterBridgeMessages,
    filteredGalleryScenes,
    flaresStopped,
    fluxDisorientationTimer,
    formattedClock,
    formattedStardate,
    galaxyShipX,
    galaxyShipXFrameRef,
    galaxyShipY,
    galaxyShipYFrameRef,
    galleryActiveIndex,
    galleryCategories,
    gallerySearchQuery,
    gallerySelectedCategory,
    gameAudio,
    gameLocation,
    gameMusicTheme,
    gameMusicTrack,
    gameOverModal,
    gameState,
    gantryCanvasRef,
    generateCrewName,
    getAbsoluteDay,
    getConcourseCanvas,
    getConcourseCoverTransform,
    getCrewAboard,
    getDoorMatPosition,
    getPlanetMapAssetKey,
    gfxQuality,
    groundZoom,
    groundZoomRef,
    handleAnswerPriorityBusiness,
    handleAnswerQuestion,
    handleAskSubject,
    handleBoardStarship,
    handleCancelMissionReplacement,
    handleConfirmColonyRecommendation,
    handleConfirmMissionReplacement,
    handleContinue,
    handleCopyExportCode,
    handleCycleTarget,
    handleDevMaxAllCrew,
    handleDevMaxUpgradeShip,
    handleDevModifyCrew,
    handleDevQuickCrew,
    handleDevRefillFuel,
    handleDevRepairAllSystems,
    handleDevRevealAllFluxLinks,
    handleDevReviveAllCrew,
    handleDevSetAlienMood,
    handleDevSetBalance,
    handleDevSetShipHealth,
    handleDevSetStardate,
    handleDevShowHold,
    handleDevSpawnAlienEncounter,
    handleDevSpawnArtifact,
    handleDevSpawnMineral,
    handleDevSpawnSpecimen,
    handleDevTeleport,
    handleDisembarkRover,
    handleDockingBayLaunch,
    handleDownloadExportedSave,
    handleEnterDoor,
    handleExecuteDistressTow,
    handleExecuteImport,
    handleExitRoom,
    handleFireLaser,
    handleFireMissile,
    handleFireSurfaceWeapon,
    handleImportFileSelect,
    handleInitiateComms,
    handleInitiateDescent,
    handleLaunchFromPlanet,
    handleLoadFromSlot,
    handleLogTelemetryOnly,
    handleOpenExportModal,
    handleOpenLandingScreen,
    handlePickUpNearby,
    handlePlanetAnalysis,
    handleRecordNearbyLifeform,
    handleRequestDistressTow,
    handleRequestNewMission,
    handleRequestSlotAction,
    handleResumeImportedMission,
    handleRoverDropCargo,
    handleRoverLook,
    handleSaveToSlot,
    handleScanSensors,
    handleSelectPosture,
    handleSettingsChange,
    handleStartManeuver,
    handleSurfaceScan,
    handleToggleShields,
    handleToggleWeapons,
    handleTriggerPearlEmergencyEscape,
    hasBlackEgg,
    hasCrystalOrb,
    hasCrystalPearl,
    hasRingDevice,
    hasWhiningOrb,
    hullIntegrity,
    hyperZoom,
    impatientMoodDelta,
    importCodeInput,
    importDestSlot,
    importStatus,
    importTextWithinBudget,
    inNebula,
    inoperativeSystems,
    introPage,
    isCreatingCrewModal,
    isDevPanelOpen,
    isDisoriented,
    isExportModalOpen,
    isGameMenuOpen,
    isImportModalOpen,
    isMobile,
    isNamingShipModal,
    isPromptingColonyRec,
    isPromptingDistress,
    isQuestionReminderActive,
    isQuitReminderOpen,
    isReleasingClamps,
    isRoverMoving,
    isShipCargoModalOpen,
    isShipsLogOpen,
    isSilenceFilterActive,
    isStarmapOpen,
    isSurfaceMapOpen,
    isTrainingSkillModal,
    landingLat,
    landingLong,
    landingMapPoint,
    laserClass,
    lastMiningExtracted,
    loadInitialSaveSlots,
    localContactPosition,
    loseAlienPatience,
    markDevAction,
    marketCommodities,
    maxArmorCapacity,
    maxShieldCapacity,
    medicalMode,
    miningActionAvailable,
    miningMessage,
    miningOpen,
    miningSession,
    miningSessionRef,
    miningTargetId,
    missileClass,
    musicVol,
    nearbyConcourseDoor,
    nearbyPlanet,
    nearbyStar,
    newCrewNameInput,
    newCrewRaceSelect,
    opsSubTab,
    orbitPlanetIndex,
    parseDateString,
    pauseMenuTab,
    payFuelTribute,
    performanceOutputRef,
    personnelIndex,
    personnelMessage,
    planCrewTraining,
    planetKey,
    planetSurfacesRef,
    planetTopography,
    planetaryScan,
    playAlienVoice,
    playCrewBanter,
    playCrewVoice,
    playerArmorPoints,
    playerShieldPoints,
    prevGameLocation,
    questionCountdownTimer,
    questionTotalTime,
    recommendedPlanets,
    renderGantryShipCanvas,
    repairBreakdown,
    repairPercentageRate,
    replacementCancelRef,
    replacementMission,
    replacementMode,
    replacementStatus,
    resolveDroneOrbit,
    returnToShip,
    returnToShipAvailable,
    roverCargoModalOpen,
    roverCargoSubmenuOpen,
    roverLookData,
    roverWaypoint,
    roverWeaponMenuOpen,
    safeStorageSet,
    saleQuantity,
    saveDurable,
    savePersistenceNotice,
    saveSlots,
    scienceOfficer,
    scienceReading,
    scienceSkill,
    scrambledCoords,
    screenShakeEnabled,
    selectPlayerCommLine,
    selectedRepairTarget,
    selectedTrainingSkills,
    setActiveConsoleMenu,
    setActiveDirectionVector,
    setActiveEvalIndex,
    setActiveNoticeIndex,
    setActivePatientId,
    setActiveRepairTask,
    setActiveRoomIndex,
    setActiveSlot,
    setAlienCommsState,
    setArmorClass,
    setArtifactStock,
    setArtifactsInHold,
    setAssignedPosts,
    setAstronautFacing,
    setAstronautIdleTimer,
    setAstronautVx,
    setAstronautVy,
    setAstronautX,
    setAstronautY,
    setBanterLog,
    setBulletins,
    setCargoHold,
    setCargoPods,
    setClickMoveTarget,
    setColonyNameInput,
    setColonyPromptStep,
    setCommLineUsage,
    setCommsTypewriterElapsed,
    setCopyDestination,
    setCopyTargetSlot,
    setCrewNameSource,
    setCrewRoster,
    setDescribedCargoItem,
    setDevActiveTab,
    setDevAlienRace,
    setDevAlienShipCount,
    setDevAlienVesselClass,
    setDevArmorInput,
    setDevArtifactId,
    setDevBalanceInput,
    setDevCrewCom,
    setDevCrewEng,
    setDevCrewMed,
    setDevCrewNav,
    setDevCrewSci,
    setDevCrewVitality,
    setDevDayInput,
    setDevHeatX10,
    setDevHourInput,
    setDevHullInput,
    setDevLabelsEnabled,
    setDevMineralName,
    setDevMineralVolume,
    setDevMonthInput,
    setDevMoodRace,
    setDevMoodState,
    setDevSelectedCrewId,
    setDevShieldInput,
    setDevSpecimenName,
    setDevSpecimenSize,
    setDevSpecimenValue,
    setDevTargetRange,
    setDevTeleportPlanetSlot,
    setDevTeleportStarId,
    setDevTeleportType,
    setDevTeleportX,
    setDevTeleportY,
    setDevVoiceInput,
    setDevVoiceStatus,
    setDevYearInput,
    setDockingBayWarnings,
    setElowanHostile,
    setEnduriumFuel,
    setEngineClass,
    setEngineeringMode,
    setEvaluations,
    setFlaresStopped,
    setGallerySearchQuery,
    setGallerySelectedCategory,
    setGameLocation,
    setGameOverModal,
    setGameState,
    setGroundZoom,
    setHullIntegrity,
    setHyperZoom,
    setImportCodeInput,
    setImportDestSlot,
    setImportStatus,
    setInoperativeSystems,
    setIntroPage,
    setIsCreatingCrewModal,
    setIsDevPanelOpen,
    setIsExportModalOpen,
    setIsGameMenuOpen,
    setIsImportModalOpen,
    setIsNamingShipModal,
    setIsPromptingColonyRec,
    setIsPromptingDistress,
    setIsQuitReminderOpen,
    setIsShipCargoModalOpen,
    setIsShipsLogOpen,
    setIsStarmapOpen,
    setIsSurfaceMapOpen,
    setIsTrainingSkillModal,
    setLandingLat,
    setLandingLong,
    setLaserClass,
    setMedicalMode,
    setMiningMessage,
    setMiningOpen,
    setMiningTargetId,
    setMissileClass,
    setNewCrewNameInput,
    setNewCrewRaceSelect,
    setOpsSubTab,
    setPauseMenuTab,
    setPersonnelIndex,
    setPersonnelMessage,
    setPlayerArmorPoints,
    setPlayerShieldPoints,
    setQuestionCountdownTimer,
    setReplacementStatus,
    setRoverCargoModalOpen,
    setRoverCargoSubmenuOpen,
    setRoverLookData,
    setRoverWaypoint,
    setRoverWeaponMenuOpen,
    setScienceReading,
    setSelectedPersonnelCrewId,
    setSelectedRepairTarget,
    setSelectedTrainingSkills,
    setShieldClass,
    setShipConfigMessage,
    setShipConfigMode,
    setShipName,
    setShipNameInput,
    setShipsLogAlienIdx,
    setShipsLogMsgFilter,
    setShipsLogMsgSearch,
    setShipsLogNoticeIdx,
    setShipsLogPlanetIdx,
    setShipsLogTab,
    setSpeciesBaseMoods,
    setSpecimensInHold,
    setStarmapCenter,
    setStarmapHoverStarId,
    setStarmapSelectedStarId,
    setStarmapZoom,
    setSubsystems,
    setSurfaceRecording,
    setSurfaceRuinModal,
    setSystemMessages,
    setSystemZoom,
    setTradeDepotMessage,
    setTradeQuantity,
    setTradeSubTab,
    setUhlekSilenced,
    setVehicleWeapon,
    setVictorySequenceModal,
    shieldClass,
    shieldsRaised,
    shipAcceleration,
    shipCargoVolume,
    shipConfigMessage,
    shipConfigMode,
    shipName,
    shipNameInput,
    shipThrustPower,
    shipsLogAlienIdx,
    shipsLogMsgFilter,
    shipsLogMsgSearch,
    shipsLogNoticeIdx,
    shipsLogPlanetIdx,
    shipsLogTab,
    showPerformance,
    slotActionNotice,
    soundVol,
    speciesBaseMoods,
    specimensInHold,
    specimensInHoldRef,
    stardateDay,
    stardateMonth,
    stardateYear,
    starmapHoverStarId,
    starmapSelectedStarId,
    starmapZoom,
    startMineralRepair,
    startMining,
    stopAlienVoice,
    stopCrewVoice,
    stopManeuver,
    stopMining,
    subsystems,
    surfacePickupAvailable,
    surfaceRecording,
    surfaceRuinModal,
    systemMessages,
    systemShipXFrameRef,
    systemShipYFrameRef,
    systemZoom,
    textSpeed,
    titleCanvasRef,
    totalShipMass,
    tradeDepotMessage,
    tradeQuantity,
    tradeSubTab,
    trainingPurchaseLockRef,
    traversedFluxIds,
    triggerBanter,
    triggerHangarSparks,
    uhlekSilenced,
    updateEncounterMood,
    vehicleDestroyed,
    vehicleFuel,
    vehicleHold,
    vehicleWeapon,
    vehicleX,
    vehicleY,
    victorySequenceModal,
    viewDimensions,
    visibleSurveyContacts,
    visitedStarIds,
    voiceEngine,
    voicesVol,
    weaponsArmed,
    zoomStarChart
  };
}

import {controlOwnsKey} from './utils/keyboard-input';

export type GameInterfaceScope = ReturnType<typeof useGameInterfaceState>;

export default function App() {
  const scope = useGameInterfaceState();
  return renderGameInterface(scope);
}
