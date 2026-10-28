/**
 * Configuration for Starflight: Junior Crew.
 */
import savedPlaygroundConfig from './playground_config.json';

export const CONFIG = {
  // Core game initialization values
  title: {
    value: 'Starflight: Junior Crew',
    type: 'string',
    label: 'Game Title',
    group: 'GAME',
  },
  baseCanvasWidth: {
    value: 1280,
    type: 'number',
    label: 'Base Canvas Width',
    group: 'GAME',
  },
  baseCanvasHeight: {
    value: 720,
    type: 'number',
    label: 'Base Canvas Height',
    group: 'GAME',
  },

  // System Constants for the physics/render loop
  targetFPS: {
    value: 60,
    type: 'number',
    label: 'Target FPS',
    group: 'SYSTEM',
  },
  stepMs: {
    value: 1000 / 60,
    type: 'number',
    label: 'Step MS',
    group: 'SYSTEM',
  },
  maxSubSteps: {
    value: 5,
    type: 'number',
    label: 'Max Sub Steps',
    group: 'SYSTEM',
  },

  // Thematic styling elements
  backgroundColor: {
    value: '#030712',
    type: 'color',
    label: 'Background Color',
    group: 'THEME',
  },
  primaryColor: {
    value: '#38bdf8',
    type: 'color',
    label: 'Primary Color',
    group: 'THEME',
  },
  accentColor: {
    value: '#facc15',
    type: 'color',
    label: 'Accent Color',
    group: 'THEME',
  },
  fontFamily: {
    value: "'VT323', 'Courier New', monospace",
    type: 'string',
    label: 'Font Family',
    group: 'THEME',
  },

  // Audio Levels
  defaultMusicVolume: {
    value: 0.45,
    type: 'number',
    label: 'Default Music Volume',
    group: 'AUDIO',
  },
  defaultSfxVolume: {
    value: 0.6,
    type: 'number',
    label: 'Default SFX Volume',
    group: 'AUDIO',
  },
  defaultVoicesVolume: {
    value: 0.8,
    type: 'number',
    label: 'Default Voices Volume',
    group: 'AUDIO',
  },

  // Ship & Physics Parameters
  shipThrust: {
    value: 160,
    type: 'number',
    label: 'Ship Thrust Power',
    group: 'Ship',
  },
  shipMaxSpeed: {
    value: 280,
    type: 'number',
    label: 'Ship Max Speed',
    group: 'Ship',
  },
  shipTurnSpeed: {
    value: 3.2,
    type: 'number',
    label: 'Ship Turn Speed (rad/s)',
    group: 'Ship',
  },
  shipInertiaDamping: {
    value: 0.985,
    type: 'number',
    label: 'Inertia Damping',
    group: 'Ship',
  },
  fuelConsumptionRate: {
    value: 1.2,
    type: 'number',
    label: 'Fuel Consumption / Thrust Sec',
    group: 'Ship',
  },

  // Economy & Rules
  startingFunds: {
    value: 12000,
    type: 'number',
    label: 'Starting Funds (M.U.)',
    group: 'Rules',
  },
  bankInterestRate: {
    value: 0.12,
    type: 'number',
    label: 'Annual Bank Interest Rate',
    group: 'Rules',
  },
  baseEnduriumPrice: {
    value: 1000,
    type: 'number',
    label: 'Endurium Market Price (M.U./m3)',
    group: 'Rules',
  },
  artifactAppraisalCost: {
    value: 500,
    type: 'number',
    label: 'Artifact Appraisal Cost',
    group: 'Rules',
  },
  distressBaseFine: {
    value: 15000,
    type: 'number',
    label: 'Distress Base Fine',
    group: 'Rules',
  },

  // Asset configurations (derived from metadata)
  assetPlanetGasGiantAspectRatio: {
    value: 866 / 552, // 1.5688
    type: 'number',
    label: 'Gas Giant Aspect Ratio',
    group: 'ASSETS',
  },
  assetPlanetGasGiantWidth: {
    value: 140,
    type: 'number',
    label: 'Gas Giant Render Width',
    group: 'ASSETS',
  },
  assetPlanetGasGiantHeight: {
    value: 89.2,
    type: 'number',
    label: 'Gas Giant Render Height',
    group: 'ASSETS',
  },
  assetPlanetMapRockAAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Planet Map Rock A Aspect Ratio',
    group: 'ASSETS',
  },
  assetPlanetMapRockBAspectRatio: {
    value: 1.0,
    type: 'number',
    label: 'Planet Map Rock B Aspect Ratio',
    group: 'ASSETS',
  },
  assetPlanetMapFrozenAAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Planet Map Frozen A Aspect Ratio',
    group: 'ASSETS',
  },
  assetPlanetMapFrozenBAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Planet Map Frozen B Aspect Ratio',
    group: 'ASSETS',
  },
  assetPlanetMapLiquidAAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Planet Map Liquid A Aspect Ratio',
    group: 'ASSETS',
  },
  assetPlanetMapLiquidBAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Planet Map Liquid B Aspect Ratio',
    group: 'ASSETS',
  },
  assetPlanetMapMoltenAAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Planet Map Molten A Aspect Ratio',
    group: 'ASSETS',
  },
  assetPlanetMapMoltenBAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Planet Map Molten B Aspect Ratio',
    group: 'ASSETS',
  },
  assetPlanetMapGasAAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Planet Map Gas A Aspect Ratio',
    group: 'ASSETS',
  },
  assetPlanetMapGasBAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Planet Map Gas B Aspect Ratio',
    group: 'ASSETS',
  },
  assetPlanetMapCrystalAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Planet Map Crystal Aspect Ratio',
    group: 'ASSETS',
  },
  assetPlanetMapArthAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Planet Map Arth Aspect Ratio',
    group: 'ASSETS',
  },
  assetStarportSpaceBgAspectRatio: {
    value: 1376 / 768, // 1.7916
    type: 'number',
    label: 'Starport Space BG Aspect Ratio',
    group: 'ASSETS',
  },
  assetStarportConcourseIsometricAspectRatio: {
    value: 2048 / 1152, // 1.7778 (16:9)
    type: 'number',
    label: 'Starport Concourse Isometric Aspect Ratio',
    group: 'ASSETS',
  },
  assetStarportConcourseMainViewAspectRatio: {
    value: 1920 / 1080, // 1.7778 (16:9)
    type: 'number',
    label: 'Starport Concourse Main View Aspect Ratio',
    group: 'ASSETS',
  },
  assetStarportConcourseClosedAspectRatio: {
    value: 1896 / 1024, // 1896x1024 2x Mirrored Starport Concourse Composite
    type: 'number',
    label: 'Starport Concourse Closed Aspect Ratio',
    group: 'ASSETS',
  },
  assetStarportConcourseOpenAspectRatio: {
    value: 1896 / 1024, // 1896x1024 2x Mirrored Starport Concourse Composite
    type: 'number',
    label: 'Starport Concourse Open Aspect Ratio',
    group: 'ASSETS',
  },
  assetShipConfigHangarIsometricAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Ship Config Hangar Isometric Aspect Ratio',
    group: 'ASSETS',
  },
  assetShipHullBareTopdownAspectRatio: {
    value: 1087 / 602,
    type: 'number',
    label: 'Ship Hull Bare Topdown Aspect Ratio',
    group: 'ASSETS',
  },
  assetShipCargoPodSpriteAspectRatio: {
    value: 496 / 824,
    type: 'number',
    label: 'Ship Cargo Pod Sprite Aspect Ratio',
    group: 'ASSETS',
  },
  assetAstronautTopdownSpritesheetAspectRatio: {
    value: 934 / 940,
    type: 'number',
    label: 'Astronaut Topdown Spritesheet Aspect Ratio',
    group: 'ASSETS',
  },
  assetAstronautRunSpritesheetAspectRatio: {
    value: 8192 / 1280,
    type: 'number',
    label: 'Astronaut Run Spritesheet Aspect Ratio',
    group: 'ASSETS',
  },
  assetAstronautRunDownSpritesheetAspectRatio: {
    value: 8192 / 1280,
    type: 'number',
    label: 'Astronaut Run Down Spritesheet Aspect Ratio',
    group: 'ASSETS',
  },
  assetAstronautRunUpSpritesheetAspectRatio: {
    value: 8192 / 1280,
    type: 'number',
    label: 'Astronaut Run Up Spritesheet Aspect Ratio',
    group: 'ASSETS',
  },
  assetStarportDoorOpenSpriteAspectRatio: {
    value: 665 / 701,
    type: 'number',
    label: 'Starport Door Open Sprite Aspect Ratio',
    group: 'ASSETS',
  },
  assetStarportCorridorWallAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Starport Corridor Wall Aspect Ratio',
    group: 'ASSETS',
  },
  assetStarportDeckFloorAspectRatio: {
    value: 1024 / 999, // 1.025
    type: 'number',
    label: 'Starport Deck Floor Aspect Ratio',
    group: 'ASSETS',
  },
  assetAstronautAvatarAspectRatio: {
    value: 393 / 909, // 0.4323
    type: 'number',
    label: 'Astronaut Avatar Aspect Ratio',
    group: 'ASSETS',
  },
  assetRoomOperationsBgAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Operations Room BG Aspect Ratio',
    group: 'ASSETS',
  },
  assetRoomPersonnelBgAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Personnel Room BG Aspect Ratio',
    group: 'ASSETS',
  },
  assetRoomCrewAssignmentBgAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Crew Assignment Room BG Aspect Ratio',
    group: 'ASSETS',
  },
  assetRoomBankBgAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Bank Room BG Aspect Ratio',
    group: 'ASSETS',
  },
  assetRoomShipConfigBgAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Ship Config Room BG Aspect Ratio',
    group: 'ASSETS',
  },
  assetRoomTradeDepotBgAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Trade Depot Room BG Aspect Ratio',
    group: 'ASSETS',
  },
  assetRoomDockingBayBgAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Docking Bay Room BG Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipElowanScoutAspectRatio: {
    value: 446 / 910,
    type: 'number',
    label: 'Alien Ship Elowan Scout Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipElowanTransportAspectRatio: {
    value: 820 / 824,
    type: 'number',
    label: 'Alien Ship Elowan Transport Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipElowanWarshipAspectRatio: {
    value: 630 / 837,
    type: 'number',
    label: 'Alien Ship Elowan Warship Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipThrynnScoutAspectRatio: {
    value: 454 / 816,
    type: 'number',
    label: 'Alien Ship Thrynn Scout Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipThrynnTransportAspectRatio: {
    value: 410 / 804,
    type: 'number',
    label: 'Alien Ship Thrynn Transport Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipThrynnWarshipAspectRatio: {
    value: 539 / 908,
    type: 'number',
    label: 'Alien Ship Thrynn Warship Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipVeloxiScoutAspectRatio: {
    value: 684 / 742,
    type: 'number',
    label: 'Alien Ship Veloxi Scout Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipVeloxiTransportAspectRatio: {
    value: 466 / 889,
    type: 'number',
    label: 'Alien Ship Veloxi Transport Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipVeloxiWarshipAspectRatio: {
    value: 738 / 901,
    type: 'number',
    label: 'Alien Ship Veloxi Warship Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipVeloxiDroneAspectRatio: {
    value: 775 / 715,
    type: 'number',
    label: 'Alien Ship Veloxi Drone Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipSpeminScoutAspectRatio: {
    value: 526 / 716,
    type: 'number',
    label: 'Alien Ship Spemin Scout Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipSpeminTransportAspectRatio: {
    value: 524 / 805,
    type: 'number',
    label: 'Alien Ship Spemin Transport Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipSpeminWarshipAspectRatio: {
    value: 658 / 956,
    type: 'number',
    label: 'Alien Ship Spemin Warship Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipGazurtoidScoutAspectRatio: {
    value: 562 / 862,
    type: 'number',
    label: 'Alien Ship Gazurtoid Scout Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipGazurtoidWarshipAspectRatio: {
    value: 564 / 968,
    type: 'number',
    label: 'Alien Ship Gazurtoid Warship Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipUhlekScoutAspectRatio: {
    value: 572 / 840,
    type: 'number',
    label: 'Alien Ship Uhlek Scout Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipUhlekWarshipAspectRatio: {
    value: 764 / 875,
    type: 'number',
    label: 'Alien Ship Uhlek Warship Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipWreckAspectRatio: {
    value: 756 / 684,
    type: 'number',
    label: 'Alien Ship Wreck Aspect Ratio',
    group: 'ASSETS',
  },
  assetPortraitElowanDiplomatAspectRatio: {
    value: 702 / 959,
    type: 'number',
    label: 'Portrait Elowan Diplomat Aspect Ratio',
    group: 'ASSETS',
  },
  assetPortraitThrynnDiplomatAspectRatio: {
    value: 1024 / 937,
    type: 'number',
    label: 'Portrait Thrynn Diplomat Aspect Ratio',
    group: 'ASSETS',
  },
  assetPortraitSpeminDiplomatAspectRatio: {
    value: 652 / 764,
    type: 'number',
    label: 'Portrait Spemin Diplomat Aspect Ratio',
    group: 'ASSETS',
  },
  assetPortraitGazurtoidDiplomatAspectRatio: {
    value: 557 / 881,
    type: 'number',
    label: 'Portrait Gazurtoid Diplomat Aspect Ratio',
    group: 'ASSETS',
  },
  assetPortraitVeloxiDiplomatAspectRatio: {
    value: 811 / 1024,
    type: 'number',
    label: 'Portrait Veloxi Diplomat Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipMechanScoutAspectRatio: {
    value: 764 / 733,
    type: 'number',
    label: 'Alien Ship Mechan Scout Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipMysterionAspectRatio: {
    value: 818 / 900,
    type: 'number',
    label: 'Alien Ship Mysterion Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipNomadProbeAspectRatio: {
    value: 844 / 723,
    type: 'number',
    label: 'Alien Ship Nomad Probe Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipMinstrelAspectRatio: {
    value: 403 / 890,
    type: 'number',
    label: 'Alien Ship Minstrel Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlienShipNoah9DerelictAspectRatio: {
    value: 294 / 944,
    type: 'number',
    label: 'Alien Ship Noah 9 Derelict Aspect Ratio',
    group: 'ASSETS',
  },
  assetPortraitMechanDiplomatAspectRatio: {
    value: 570 / 828,
    type: 'number',
    label: 'Portrait Mechan Diplomat Aspect Ratio',
    group: 'ASSETS',
  },
  assetSpaceBgAAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Space Background A Aspect Ratio',
    group: 'ASSETS',
  },
  assetSpaceBgBAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Space Background B Aspect Ratio',
    group: 'ASSETS',
  },
  assetSpaceBgCAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Space Background C Aspect Ratio',
    group: 'ASSETS',
  },
  assetSpaceBgDAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Space Background D Aspect Ratio',
    group: 'ASSETS',
  },
  assetNebulaCloudAAspectRatio: {
    value: 1.0,
    type: 'number',
    label: 'Nebula Cloud A Aspect Ratio',
    group: 'ASSETS',
  },
  assetNebulaCloudBAspectRatio: {
    value: 1.0,
    type: 'number',
    label: 'Nebula Cloud B Aspect Ratio',
    group: 'ASSETS',
  },
  assetGroundTextureRockAspectRatio: {
    value: 1.0,
    type: 'number',
    label: 'Ground Texture Rock Aspect Ratio',
    group: 'ASSETS',
  },
  assetGroundTextureFrozenAspectRatio: {
    value: 1.0,
    type: 'number',
    label: 'Ground Texture Frozen Aspect Ratio',
    group: 'ASSETS',
  },
  assetGroundTextureMoltenAspectRatio: {
    value: 1.0,
    type: 'number',
    label: 'Ground Texture Molten Aspect Ratio',
    group: 'ASSETS',
  },
  assetGroundTextureShoreAspectRatio: {
    value: 1.0,
    type: 'number',
    label: 'Ground Texture Shore Aspect Ratio',
    group: 'ASSETS',
  },
  assetTerrainVehicleTopdownAspectRatio: {
    value: 534 / 713,
    type: 'number',
    label: 'Terrain Vehicle Topdown Aspect Ratio',
    group: 'ASSETS',
  },
  assetMineralDepositSpriteAspectRatio: {
    value: 757 / 594,
    type: 'number',
    label: 'Mineral Deposit Sprite Aspect Ratio',
    group: 'ASSETS',
  },
  assetShipLandedTopdownAspectRatio: {
    value: 871 / 609,
    type: 'number',
    label: 'Ship Landed Topdown Aspect Ratio',
    group: 'ASSETS',
  },
  assetRuinOldEmpireSpriteAspectRatio: {
    value: 808 / 812,
    type: 'number',
    label: 'Ruin Old Empire Sprite Aspect Ratio',
    group: 'ASSETS',
  },
  assetRuinAncientPrecursorSpriteAspectRatio: {
    value: 941 / 945,
    type: 'number',
    label: 'Ruin Ancient Precursor Sprite Aspect Ratio',
    group: 'ASSETS',
  },
  assetLifeformGrazerSpriteAspectRatio: {
    value: 788 / 684,
    type: 'number',
    label: 'Lifeform Grazer Sprite Aspect Ratio',
    group: 'ASSETS',
  },
  assetLifeformHunterSpriteAspectRatio: {
    value: 927 / 512,
    type: 'number',
    label: 'Lifeform Hunter Sprite Aspect Ratio',
    group: 'ASSETS',
  },
  assetLifeformFloaterSpriteAspectRatio: {
    value: 758 / 688,
    type: 'number',
    label: 'Lifeform Floater Sprite Aspect Ratio',
    group: 'ASSETS',
  },
  assetLifeformCrawlerSpriteAspectRatio: {
    value: 702 / 683,
    type: 'number',
    label: 'Lifeform Crawler Sprite Aspect Ratio',
    group: 'ASSETS',
  },
  assetCinematicTitleSceneAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Cinematic Title Scene Aspect Ratio',
    group: 'ASSETS',
  },
  assetTitleSceneImage16_9AspectRatio: {
    value: 1920 / 1080,
    type: 'number',
    label: 'Title Scene Image 16:9 Aspect Ratio',
    group: 'ASSETS',
  },
  assetTitleSceneImage4_3AspectRatio: {
    value: 1600 / 1200,
    type: 'number',
    label: 'Title Scene Image 4:3 Aspect Ratio',
    group: 'ASSETS',
  },
  assetCinematicAtmosphericDescentImgAspectRatio: {
    value: 1920 / 1080,
    type: 'number',
    label: 'Cinematic Atmospheric Descent Image Aspect Ratio',
    group: 'ASSETS',
  },
  assetCinematicDockingBayImgAspectRatio: {
    value: 1920 / 1080,
    type: 'number',
    label: 'Cinematic Docking Bay Image Aspect Ratio',
    group: 'ASSETS',
  },
  assetCinematicLandingSiteImgAspectRatio: {
    value: 1920 / 1080,
    type: 'number',
    label: 'Cinematic Landing Site Image Aspect Ratio',
    group: 'ASSETS',
  },
  assetCinematicVictoryBridgeImgAspectRatio: {
    value: 1920 / 1080,
    type: 'number',
    label: 'Cinematic Victory Bridge Image Aspect Ratio',
    group: 'ASSETS',
  },
  assetCinematicMemorialViewportImgAspectRatio: {
    value: 1920 / 1080,
    type: 'number',
    label: 'Cinematic Memorial Viewport Image Aspect Ratio',
    group: 'ASSETS',
  },
  assetCinematicDockingBayLaunchAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Cinematic Docking Bay Launch Aspect Ratio',
    group: 'ASSETS',
  },
  assetCinematicAtmosphericDescentAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Cinematic Atmospheric Descent Aspect Ratio',
    group: 'ASSETS',
  },
  assetCinematicLandingSiteDuskAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Cinematic Landing Site Dusk Aspect Ratio',
    group: 'ASSETS',
  },
  assetCinematicVictoryBridgeAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Cinematic Victory Bridge Aspect Ratio',
    group: 'ASSETS',
  },
  assetCinematicMemorialViewportAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Cinematic Memorial Viewport Aspect Ratio',
    group: 'ASSETS',
  },
};

// Merge customized config values if present (injected by Playground)
const injectedConfig = globalThis as {
  playgroundConfig?: Record<string, unknown>;
};
const playgroundConfig = injectedConfig.playgroundConfig ?? savedPlaygroundConfig.values;
if (playgroundConfig) {
  for (const [key, value] of Object.entries(playgroundConfig)) {
    if (key in CONFIG) {
      Object.assign(CONFIG[key as keyof typeof CONFIG], { value });
    }
  }
}

/**
 * Type helper for reading values in game code
 */
export type ConfigKey = keyof typeof CONFIG;

/**
 * Gets a configuration value by key.
 * @param key The configuration key.
 * @return The configuration value.
 */
export function getConfig<K extends ConfigKey>(
  key: K,
): (typeof CONFIG)[K]['value'] {
  return CONFIG[key].value;
}

export const PRESETS = {};
