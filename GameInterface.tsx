import FlightGuidance from './components/FlightGuidance';
import ExpeditionClock from './components/ExpeditionClock';
import UpgradeComparison from './components/UpgradeComparison';
import CrewTransmission from './components/CrewTransmission';
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
import {controlOwnsKey} from './utils/keyboard-input';
import type { GameInterfaceScope, BridgeConsoleSubmenu, CrewMember, CrewPost, GameLocation, SaveSlotData, Skills, Species, SubsystemKey } from './App';

// Presentation only. State, hooks, simulation and save ownership stay in App.
export function renderGameInterface(scope: GameInterfaceScope) {
  const {
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
    setSystemFocusIndex,
    systemFocusIndex,
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
  } = scope;
  return (
    <DevLabelsContext.Provider value={devLabelsEnabled}>
      {/* OUTER LETTERBOX / PILLARBOX HOST CONTAINER */}
      <div
        style={{
          backgroundColor: '#030712',
          backgroundImage: 'none',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="fixed inset-0 overflow-hidden select-none bg-[#030712]"
      >
        {showPerformance && <output ref={performanceOutputRef} aria-label="Render performance" className="fixed bottom-1 left-1 z-[200] bg-black/90 text-cyan-200 px-2 py-1 text-xs font-mono pointer-events-none">Collecting render measurements…</output>}
        <style>{`
          html, body, #root {
            background-color: #030712 !important;
            background-image: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            width: 100vw !important;
            height: 100vh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .glass-panel {
            background: rgba(10, 15, 36, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 240, 255, 0.25);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(0, 240, 255, 0.05);
          }
          .neon-glow-cyan {
            text-shadow: 0 0 8px #00f0ff, 0 0 20px rgba(0, 240, 255, 0.5);
          }
          .neon-glow-magenta {
            text-shadow: 0 0 8px #ff007f, 0 0 20px rgba(255, 0, 127, 0.5);
          }
          .crt-scanlines::after {
            content: " ";
            display: block;
            position: absolute;
            top: 0; left: 0; bottom: 0; right: 0;
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
            z-index: 999;
            background-size: 100% 3px;
            pointer-events: none;
          }
          .flight-steering { display: flex; }
          @media (min-width: 1024px) and (pointer: fine) {
            .flight-steering { display: none; }
          }
        `}</style>

        {/* FIXED 16:9 GAME CONTAINER */}
        <div
          id="game-viewport-16-9"
          className={`relative flex flex-col overflow-hidden text-slate-100 touch-auto shadow-2xl ${
            crtFilterEnabled ? 'crt-scanlines' : ''
          }`}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#030712',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Rajdhani', 'Orbitron', 'Chakra Petch', system-ui, sans-serif",
          }}
        >
      <style>{`
        .glass-panel {
          background: rgba(10, 15, 36, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 240, 255, 0.25);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(0, 240, 255, 0.05);
        }
        .neon-glow-cyan {
          text-shadow: 0 0 8px #00f0ff, 0 0 20px rgba(0, 240, 255, 0.5);
        }
        .neon-glow-magenta {
          text-shadow: 0 0 8px #ff007f, 0 0 20px rgba(255, 0, 127, 0.5);
        }
        .crt-scanlines::after {
          content: " ";
          display: block;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
          z-index: 999;
          background-size: 100% 3px, 3px 100%;
          pointer-events: none;
        }
      `}</style>

      <GameMusic
        theme={gameMusicTheme}
        trackUrl={gameMusicTrack?.url}
        loopRegion={gameMusicTrack?.loopRegion}
        isPlaying={(gameState.status==='START'||gameState.status==='PLAYING'||!!gameOverModal)&&!isGameMenuOpen&&!isStarmapOpen}
        volume={musicVol}
      />

      {/* AUTOSAVE TOAST BANNER */}
      {autosaveToast && (
        <div data-autosave-toast className="absolute top-14 right-4 z-50 glass-panel px-3.5 py-1.5 rounded-lg border-cyan-400 text-cyan-300 font-bold text-xs flex items-center gap-2 animate-bounce shadow-xl">
          <Database size={14} className="text-yellow-400" />
          {saveDurable ? '💾 Autosaved' : '⚠ Session save only — export a backup before closing'}
        </div>
      )}

      {/* TOP DEDICATED FLIGHT STATUS HUD BAR */}
      <header data-flight-hud="true" className="w-full glass-panel px-3 md:px-5 py-2 flex flex-wrap items-center justify-between text-xs gap-2 md:gap-4 shrink-0 z-20 border-b border-cyan-500/30 shadow-lg relative">
        <DevUiTag id="#flight-hud-top" />
        {/* Left Status Identifiers & Gauges */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <span className="font-extrabold text-cyan-300 flex items-center gap-1.5 text-sm md:text-base tracking-wide neon-glow-cyan">
            <DevUiTag id="#ship-name-label" color="cyan" />
            <Rocket size={16} className="text-yellow-400 shrink-0" />
            {shipName || 'UNNAMED VESSEL'}
          </span>
          <span className="bg-slate-900/90 border border-amber-500/50 px-2.5 py-0.5 rounded text-amber-300 font-bold flex items-center gap-1 font-mono">
            <DevUiTag id="#badge-funds" color="yellow" />
            <Coins size={13} className="shrink-0" />
            {credits.toLocaleString()} M.U.
          </span>
          <span
            className={`px-2.5 py-0.5 rounded font-bold uppercase tracking-wider text-[11px] ${
              gameLocation === 'Encounter'
                ? 'bg-red-950 border border-red-500 text-red-300 animate-pulse'
                : 'bg-blue-950/80 border border-cyan-800 text-cyan-300'
            }`}
          >
            <DevUiTag id="#badge-location" color="pink" />
            LOC: {gameLocation}
          </span>
          <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-yellow-400 font-bold font-mono text-[11px]">
            <DevUiTag id="#badge-galaxy-coords" color="emerald" />
            POS: {fluxDisorientationTimer > 0
              ? `[${scrambledCoords.x}, ${scrambledCoords.y}]`
              : `[${(gameLocation === 'Hyperspace' || (gameLocation === 'Encounter' && prevGameLocation === 'Hyperspace')) ? Math.round(galaxyShipX) : currentStar.x}, ${(gameLocation === 'Hyperspace' || (gameLocation === 'Encounter' && prevGameLocation === 'Hyperspace')) ? Math.round(galaxyShipY) : currentStar.y}]`
            }
          </span>

          {/* Quick Vital Gauges (Hull / Shield / Armor / Fuel) */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-mono">
            <DevUiTag id="#gauges-vital-vessel" />
            <span className="flex items-center gap-1" title="Hull Integrity">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <strong className={hullIntegrity <= 50 ? 'text-red-400' : 'text-emerald-300'}>H:{+hullIntegrity.toFixed(2)}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1" title="Shield Points">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
              <strong className={shieldsRaised ? 'text-cyan-300' : 'text-slate-500'}>S:{playerShieldPoints}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1" title="Armor Points">
              <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
              <strong className="text-yellow-300">A:{playerArmorPoints}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1" title="Endurium Fuel">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <strong className="text-amber-300">F:{enduriumFuel.toFixed(1)}m³</strong>
            </span>
          </div>

          {flaresStopped && (
            <span className="bg-emerald-950 border border-emerald-400 px-2 py-0.5 rounded text-emerald-300 font-black flex items-center gap-1 text-[11px]">
              <Sparkles size={12} />
              GALAXY SAVED
            </span>
          )}
        </div>

        {/* Right Controls & Stardate Clock */}
        <div className="flex items-center gap-2">
          <ExpeditionClock value={formattedClock}/>

          {gameLocation === 'Star System' && nearbyPlanet?.isHomeworld && (
            <button
              onClick={dockWithStarport}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-black flex items-center gap-1 shadow-lg animate-pulse"
            >
              <Anchor size={14} />
              DOCK
            </button>
          )}

          {gameLocation === 'Star System' && nearbyPlanet && !nearbyPlanet.isHomeworld && (
            <button
              onClick={() => enterOrbit(nearbyPlanet.index)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded text-xs font-black flex items-center gap-1 shadow-lg animate-pulse"
            >
              <Globe size={14} />
              ORBIT
            </button>
          )}

          {gameLocation === 'In Orbit' && (
            <button
              onClick={handleOpenLandingScreen}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1 rounded text-xs font-black flex items-center gap-1 shadow-lg animate-pulse"
            >
              <Rocket size={14} />
              LAND / DESCEND
            </button>
          )}

          {gameLocation === 'Hyperspace' && nearbyStar && (
            <button
              onClick={() => enterStarSystem(nearbyStar)}
              className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-3 py-1 rounded text-xs font-black flex items-center gap-1 shadow-lg animate-pulse"
            >
              <Compass size={14} />
              {isDisoriented ? 'ENTER SYSTEM' : `ENTER [${nearbyStar.x}, ${nearbyStar.y}]`}
            </button>
          )}

          <button
            onClick={() => {
              setIsShipsLogOpen(true);
              gameAudio.playConfirmSelect();
            }}
            className="bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 shadow transition hover:border-cyan-300"
          >
            <FileText size={13} className="text-yellow-400" />
            <span className="hidden sm:inline">SHIP'S</span> LOG
          </button>

          <button
            onClick={() => {
              setIsGameMenuOpen(true);
              setPauseMenuTab('main');
              gameAudio.playCrispClick();
            }}
            data-testid="pause-button"
            className="min-w-[48px] min-h-[30px] bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 px-3 py-1 rounded text-xs font-black transition flex items-center justify-center gap-1.5 shadow active:scale-95"
          >
            <Pause size={14} className="fill-current" />
            PAUSE
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT CONTAINER */}
      <FlightGuidance location={gameLocation} fuel={enduriumFuel} engines={engineClass} hull={hullIntegrity} nearby={nearbyPlanet} mining={!!miningSession} missingPosts={Object.values(assignedPosts).filter(id=>!crewRoster.some(c=>c.id===id&&c.alive&&c.vitality>0)).length} unreadBulletins={bulletins.filter(b=>!b.read).length} canReturn={returnToShipAvailable(vehicleX,vehicleY,vehicleFuel,vehicleDestroyed)}/>
      <main className="flex-1 w-full min-h-0 relative flex flex-col md:flex-row overflow-hidden">
        {/* STARPORT CONCOURSE */}
        {gameLocation === 'Starport' && activeRoomIndex === null && (
          <div
            onClick={(e) => {
              if (cinematicStateRef.current !== 'none') {
                const curCin = cinematicStateRef.current;
                if (curCin === 'launch') completeLaunchToSpace();
                else if (curCin === 'dock') completeDockingToStarport();
                else if (curCin === 'descent') completeDescentToPlanet();
                else if (curCin === 'surface_launch') completeSurfaceLaunchToOrbit();
                return;
              }
            }}
            className="flex-1 w-full h-full flex flex-col relative overflow-hidden"
          >
            <div className="flex-1 w-full min-h-0 relative overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-full block cursor-pointer"
                onClick={(e) => {
                  if (cinematicStateRef.current !== 'none') {
                    const curCin = cinematicStateRef.current;
                    if (curCin === 'launch') completeLaunchToSpace();
                    else if (curCin === 'dock') completeDockingToStarport();
                    else if (curCin === 'descent') completeDescentToPlanet();
                    else if (curCin === 'surface_launch') completeSurfaceLaunchToOrbit();
                    return;
                  }
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickCanvasX = e.clientX - rect.left;
                  const clickCanvasY = e.clientY - rect.top;
                  const curW = rect.width > 0 ? Math.round(rect.width) : viewDimensions.width;
                  const curH = rect.height > 0 ? Math.round(rect.height) : viewDimensions.height;

                  setAstronautIdleTimer(0);

                  const concourseCanvas = getConcourseCanvas(assets);
                  const { scale, drawnW, drawnH, offsetX, offsetY } = getConcourseCoverTransform(curW, curH, concourseCanvas);

                  // Check if clicking directly on a door or mat
                  for (let i = 0; i < STARPORT_DOORS.length; i++) {
                    const d = STARPORT_DOORS[i];
                    const doorX = offsetX + d.u * drawnW;
                    const doorY = offsetY + d.v * drawnH;
                    if (Math.hypot(clickCanvasX - doorX, clickCanvasY - doorY) <= 55 * Math.max(1, scale / 1.25)) {
                      const matPos = getDoorMatPosition(d, curW, curH, concourseCanvas);
                      setAstronautX(matPos.x);
                      setAstronautY(matPos.y);
                      handleEnterDoor(i);
                      return;
                    }
                  }

                  // Check if clicking near sealed doors
                  const curU = (clickCanvasX - offsetX) / drawnW;
                  const curV = (clickCanvasY - offsetY) / drawnH;
                  if (Math.hypot(curU - 0.147, curV - 0.450) <= 0.065 || Math.hypot(curU - 0.853, curV - 0.450) <= 0.065) {
                    addMessage('Sealed.', undefined, 'info');
                    return;
                  }

                  // Otherwise, click to move towards target on ellipse floor
                  const centerCanvasX = offsetX + 0.500 * drawnW;
                  const centerCanvasY = offsetY + 0.499 * drawnH;
                  const radiusCanvasX = 0.360 * drawnW;
                  const radiusCanvasY = 0.315 * drawnH;

                  const dx = clickCanvasX - centerCanvasX;
                  const dy = clickCanvasY - centerCanvasY;
                  const normDist = Math.hypot(dx / radiusCanvasX, dy / radiusCanvasY);
                  const targetX = normDist <= 1.0 ? clickCanvasX : centerCanvasX + dx / normDist;
                  const targetY = normDist <= 1.0 ? clickCanvasY : centerCanvasY + dy / normDist;

                  setClickMoveTarget({ x: targetX, y: targetY });
                }}
              />
            </div>

            {/* CONCOURSE BOTTOM INTERACTIVE NAVIGATION BAR */}
            <div className="w-full glass-panel p-2.5 flex flex-wrap items-center justify-between gap-2 z-10 shrink-0 text-xs relative">
              <DevUiTag id="#concourse-nav-bar" color="yellow" />
              {/* Door Quick Access Cluster */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
                {STARPORT_DOORS.map((door, idx) => {
                  const isNear = nearbyConcourseDoor?.id === door.id;
                  return (
                    <button
                      key={door.id}
                      onClick={() => {
                        const concourseCanvas = getConcourseCanvas(assets);
                        const matPos = getDoorMatPosition(door, viewDimensions.width, viewDimensions.height, concourseCanvas);
                        setAstronautX(matPos.x);
                        setAstronautY(matPos.y);
                        setAstronautIdleTimer(0);
                        handleEnterDoor(idx);
                      }}
                      style={{
                        borderColor: isNear ? door.primaryColor : 'rgba(0, 240, 255, 0.2)',
                        boxShadow: isNear ? `0 0 12px ${door.primaryColor}80` : 'none',
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition min-h-[38px] ${
                        isNear ? 'bg-slate-900 text-white border-2' : 'bg-slate-950/80 text-slate-300 border hover:bg-slate-900'
                      }`}
                    >
                      <DevUiTag id={`#btn-door-${door.id}`} color="cyan" />
                      <span style={{ color: door.primaryColor }}>●</span>
                      <span>{idx + 1}. {door.badge}</span>
                      {isNear && (
                        <span className="bg-yellow-400 text-slate-950 px-1.5 py-0.2 rounded text-[9px] font-black animate-pulse">
                          [ENTER]
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile / Touch 8-Way Controls for walking */}
              {isMobile && (
                <div className="flex items-center gap-1.5 ml-auto touch-none">
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onPointerDown={() => {
                        setAstronautVx(-180);
                        setAstronautVy(-140);
                        setAstronautFacing('NW');
                        setAstronautIdleTimer(0);
                      }}
                      onPointerUp={() => { setAstronautVx(0); setAstronautVy(0); }}
                      onPointerLeave={() => { setAstronautVx(0); setAstronautVy(0); }}
                      className="w-9 h-9 bg-slate-900 border border-slate-700 rounded-lg text-cyan-300 font-black text-[10px]"
                    >
                      ↖
                    </button>
                    <button
                      onPointerDown={() => {
                        setAstronautVx(0);
                        setAstronautVy(-180);
                        setAstronautFacing('N');
                        setAstronautIdleTimer(0);
                      }}
                      onPointerUp={() => { setAstronautVx(0); setAstronautVy(0); }}
                      onPointerLeave={() => { setAstronautVx(0); setAstronautVy(0); }}
                      className="w-9 h-9 bg-slate-900 border border-cyan-500 rounded-lg text-cyan-300 font-black text-xs"
                    >
                      ▲
                    </button>
                    <button
                      onPointerDown={() => {
                        setAstronautVx(180);
                        setAstronautVy(-140);
                        setAstronautFacing('NE');
                        setAstronautIdleTimer(0);
                      }}
                      onPointerUp={() => { setAstronautVx(0); setAstronautVy(0); }}
                      onPointerLeave={() => { setAstronautVx(0); setAstronautVy(0); }}
                      className="w-9 h-9 bg-slate-900 border border-slate-700 rounded-lg text-cyan-300 font-black text-[10px]"
                    >
                      ↗
                    </button>
                    <button
                      onPointerDown={() => {
                        setAstronautVx(-220);
                        setAstronautVy(0);
                        setAstronautFacing('W');
                        setAstronautIdleTimer(0);
                      }}
                      onPointerUp={() => { setAstronautVx(0); setAstronautVy(0); }}
                      onPointerLeave={() => { setAstronautVx(0); setAstronautVy(0); }}
                      className="w-9 h-9 bg-slate-900 border border-cyan-500 rounded-lg text-cyan-300 font-black text-xs"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => {
                        if (nearbyConcourseDoor) {
                          handleEnterDoor(nearbyConcourseDoor.index);
                        }
                      }}
                      className="w-9 h-9 bg-yellow-500 text-slate-950 rounded-lg font-black text-[10px]"
                    >
                      ⏎
                    </button>
                    <button
                      onPointerDown={() => {
                        setAstronautVx(220);
                        setAstronautVy(0);
                        setAstronautFacing('E');
                        setAstronautIdleTimer(0);
                      }}
                      onPointerUp={() => { setAstronautVx(0); setAstronautVy(0); }}
                      onPointerLeave={() => { setAstronautVx(0); setAstronautVy(0); }}
                      className="w-9 h-9 bg-slate-900 border border-cyan-500 rounded-lg text-cyan-300 font-black text-xs"
                    >
                      ▶
                    </button>
                    <button
                      onPointerDown={() => {
                        setAstronautVx(-180);
                        setAstronautVy(140);
                        setAstronautFacing('SW');
                        setAstronautIdleTimer(0);
                      }}
                      onPointerUp={() => { setAstronautVx(0); setAstronautVy(0); }}
                      onPointerLeave={() => { setAstronautVx(0); setAstronautVy(0); }}
                      className="w-9 h-9 bg-slate-900 border border-slate-700 rounded-lg text-cyan-300 font-black text-[10px]"
                    >
                      ↙
                    </button>
                    <button
                      onPointerDown={() => {
                        setAstronautVx(0);
                        setAstronautVy(180);
                        setAstronautFacing('S');
                        setAstronautIdleTimer(0);
                      }}
                      onPointerUp={() => { setAstronautVx(0); setAstronautVy(0); }}
                      onPointerLeave={() => { setAstronautVx(0); setAstronautVy(0); }}
                      className="w-9 h-9 bg-slate-900 border border-cyan-500 rounded-lg text-cyan-300 font-black text-xs"
                    >
                      ▼
                    </button>
                    <button
                      onPointerDown={() => {
                        setAstronautVx(180);
                        setAstronautVy(140);
                        setAstronautFacing('SE');
                        setAstronautIdleTimer(0);
                      }}
                      onPointerUp={() => { setAstronautVx(0); setAstronautVy(0); }}
                      onPointerLeave={() => { setAstronautVx(0); setAstronautVy(0); }}
                      className="w-9 h-9 bg-slate-900 border border-slate-700 rounded-lg text-cyan-300 font-black text-[10px]"
                    >
                      ↘
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STARPORT ROOM VIEW (7 THEMED ROOMS WITH HIGH-FIDELITY BACKDROPS & GLASSMORPHISM) */}
        {gameLocation === 'Starport' && activeRoomIndex !== null && (
          <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none" />
            <div
              style={{
                backgroundImage: ROOM_BACKDROP_PATHS[activeRoomIndex]
                  ? `linear-gradient(rgba(3, 7, 18, 0.35), rgba(3, 7, 18, 0.7)), url(${ROOM_BACKDROP_PATHS[activeRoomIndex]})`
                  : undefined,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: activeRoomIndex === 4 ? 'center top' : 'center center',
                width: '100%',
                height: '100%',
                alignItems: 'flex-start',
                overflowY: 'auto',
              }}
              className="flex-1 w-full h-full flex flex-col items-center justify-start p-2.5 md:p-5 overflow-y-auto relative z-10"
            >
            <div className="w-full max-w-4xl glass-panel rounded-3xl p-4 md:p-5 shadow-2xl flex flex-col gap-3 text-slate-100 border border-cyan-500/30 relative z-10 my-auto">
              {/* Room Header */}
              {(() => {
                const curDoor = STARPORT_DOORS.find((d) => d.index === activeRoomIndex) || STARPORT_DOORS[0];
                return (
                  <div className="flex justify-between items-center border-b border-cyan-900/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        style={{ backgroundColor: `${curDoor.primaryColor}22`, borderColor: curDoor.primaryColor }}
                        className="p-2.5 rounded-2xl border flex items-center justify-center shadow-lg"
                      >
                        <Building size={22} style={{ color: curDoor.primaryColor }} />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                          STARPORT ARTH • {curDoor.badge}
                        </h2>
                        <span className="text-xs text-slate-400 font-semibold">{curDoor.desc}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleExitRoom}
                      className="bg-slate-900 hover:bg-slate-800 border border-cyan-700/60 text-cyan-300 px-4 py-2 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5"
                    >
                      <ArrowLeft size={14} />
                      Concourse ↩
                    </button>
                  </div>
                );
              })()}

              {/* 1. OPERATIONS ROOM (STABLE PAGINATED READING & MEMO CONTROLS) */}
              {activeRoomIndex === 0 && (
                <div className="space-y-3.5 text-xs">
                  {/* Operations Room Sub-Tab Navigation */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-900/60 pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setOpsSubTab('bulletins');
                          gameAudio.playCrispClick();
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                          opsSubTab === 'bulletins'
                            ? 'bg-cyan-600 text-white shadow-[0_0_12px_#00f0ff80]'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Radio size={14} className={opsSubTab === 'bulletins' ? 'text-yellow-300' : 'text-cyan-400'} />
                        <span>Corporate Notices &amp; Memos</span>
                        <span className="bg-slate-950/80 px-1.5 py-0.2 rounded-full text-[10px] font-mono border border-cyan-700/50">
                          {bulletins.length}
                        </span>
                        {bulletins.some((b) => !b.read) && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unread memos available" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setOpsSubTab('evaluations');
                          gameAudio.playCrispClick();
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                          opsSubTab === 'evaluations'
                            ? 'bg-emerald-600 text-white shadow-[0_0_12px_#10b98180]'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Globe size={14} className={opsSubTab === 'evaluations' ? 'text-yellow-300' : 'text-emerald-400'} />
                        <span>Colony Evaluations</span>
                        <span className="bg-slate-950/80 px-1.5 py-0.2 rounded-full text-[10px] font-mono border border-emerald-700/50">
                          {evaluations.length}
                        </span>
                        {evaluations.some((e) => !e.read) && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unread evaluations in queue" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setOpsSubTab('directives');
                          gameAudio.playCrispClick();
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                          opsSubTab === 'directives'
                            ? 'bg-purple-600 text-white shadow-[0_0_12px_#a855f780]'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <FileText size={14} className={opsSubTab === 'directives' ? 'text-yellow-300' : 'text-purple-400'} />
                        <span>Mandates & Directives</span>
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
                      Interstel Terminal #4620-OPS-ALPHA
                    </span>
                  </div>

                  {/* 1A. CORPORATE BULLETINS & MEMOS (STABLE PAGINATED READER) */}
                  {opsSubTab === 'bulletins' && (() => {
                    const totalBulletins = bulletins.length;
                    const safeNoticeIdx = totalBulletins > 0 ? Math.min(Math.max(0, activeNoticeIndex), totalBulletins - 1) : 0;
                    const currentNotice = totalBulletins > 0 ? bulletins[safeNoticeIdx] : null;
                    const isAlienMemo = currentNotice ? currentNotice.id >= 100 : false;
                    const staticAside = currentNotice
                      ? (isAlienMemo
                          ? CAPTAIN_ASIDES.alien[currentNotice.id % CAPTAIN_ASIDES.alien.length]
                          : CAPTAIN_ASIDES.ops[currentNotice.id % CAPTAIN_ASIDES.ops.length])
                      : '';

                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Left Notice Index List */}
                          <div className="bg-slate-950/90 p-3 rounded-2xl border border-cyan-900/80 flex flex-col gap-2 shadow-inner">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                              <span className="font-extrabold text-cyan-300 text-xs flex items-center gap-1 tracking-wider uppercase">
                                <Database size={13} className="text-yellow-400" />
                                MEMO INDEX ({totalBulletins})
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {bulletins.filter((b) => b.read).length}/{totalBulletins} Read
                              </span>
                            </div>

                            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                              {bulletins.map((b, idx) => {
                                const isSelected = idx === safeNoticeIdx;
                                return (
                                  <button
                                    key={b.id}
                                    onClick={() => {
                                      setActiveNoticeIndex(idx);
                                      gameAudio.playCrispClick();
                                    }}
                                    className={`w-full p-2 rounded-xl text-left border transition flex flex-col gap-0.5 ${
                                      isSelected
                                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_10px_#00f0ff50]'
                                        : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-yellow-300' : 'text-slate-400'}`}>
                                        #{idx + 1} • {b.date}
                                      </span>
                                      <span
                                        className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                          b.read
                                            ? 'bg-slate-950 text-slate-500 border border-slate-800'
                                            : 'bg-amber-950 text-amber-300 border border-amber-500 animate-pulse'
                                        }`}
                                      >
                                        {b.read ? 'READ' : 'NEW'}
                                      </span>
                                    </div>
                                    <strong className="text-xs truncate block font-bold text-slate-100">
                                      {b.title}
                                    </strong>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Right Main Memo Display Card */}
                          <div className="md:col-span-2 bg-slate-950/90 p-4 md:p-5 rounded-2xl border border-cyan-900/80 flex flex-col justify-between gap-3.5 shadow-inner min-h-[300px]">
                            {currentNotice ? (
                              <div className="space-y-3">
                                {/* Memo Header */}
                                <div className="border-b border-cyan-800/60 pb-2.5">
                                  <div className="flex flex-wrap justify-between items-start gap-2">
                                    <h3 className="text-sm md:text-base font-black text-yellow-400 tracking-wide leading-snug">
                                      {currentNotice.title}
                                    </h3>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase tracking-wider ${
                                        currentNotice.read
                                          ? 'bg-slate-900 text-slate-400 border border-slate-700'
                                          : 'bg-amber-950 text-amber-300 border border-amber-500'
                                      }`}
                                    >
                                      {currentNotice.read ? '✓ ARCHIVED READ' : '● UNREAD MEMORANDUM'}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap justify-between items-center text-[11px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-800/80">
                                    <span>Origin: <strong className="text-cyan-300">{currentNotice.author}</strong></span>
                                    <span>Stardate: <strong className="text-slate-200">{currentNotice.date}</strong></span>
                                  </div>
                                </div>

                                {/* Memo Body Text */}
                                <div className="space-y-2.5 text-slate-200 text-xs md:text-sm leading-relaxed font-sans pr-1 max-h-52 overflow-y-auto">
                                  {currentNotice.paragraphs.map((para, pIdx) => (
                                    <p key={pIdx} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                                      {para}
                                    </p>
                                  ))}
                                </div>

                                {/* Static Captain's Aside Note */}
                                <div className="p-2.5 bg-cyan-950/40 rounded-xl border border-cyan-800/60 text-cyan-300 text-[11px] italic flex items-start gap-2">
                                  <span className="text-yellow-400 font-bold not-italic shrink-0">📝</span>
                                  <span>{staticAside}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-slate-400 text-xs italic py-8 text-center">
                                No corporate bulletins available on this channel.
                              </div>
                            )}

                            {/* Bottom Pagination & Reading Action Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    if (totalBulletins > 0) {
                                      setActiveNoticeIndex((prev) => (prev - 1 + totalBulletins) % totalBulletins);
                                      gameAudio.playCrispClick();
                                    }
                                  }}
                                  disabled={totalBulletins <= 1}
                                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-cyan-300 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1"
                                >
                                  <ChevronLeft size={14} />
                                  <span>Previous</span>
                                </button>

                                <span className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-yellow-400">
                                  Notice {totalBulletins > 0 ? safeNoticeIdx + 1 : 0} of {totalBulletins}
                                </span>

                                <button
                                  onClick={() => {
                                    if (totalBulletins > 0) {
                                      setActiveNoticeIndex((prev) => (prev + 1) % totalBulletins);
                                      gameAudio.playCrispClick();
                                    }
                                  }}
                                  disabled={totalBulletins <= 1}
                                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-cyan-300 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1"
                                >
                                  <span>Next</span>
                                  <ChevronRight size={14} />
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                {currentNotice && (
                                  <button
                                    onClick={() => {
                                      setBulletins((prev) =>
                                        prev.map((b) => (b.id === currentNotice.id ? { ...b, read: !b.read } : b))
                                      );
                                      gameAudio.playConfirmSelect();
                                      handleSaveToSlot(activeSlot);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow ${
                                      currentNotice.read
                                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'
                                        : 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-black'
                                    }`}
                                  >
                                    <Check size={13} />
                                    <span>{currentNotice.read ? 'Mark as Unread' : 'Mark as Read'}</span>
                                  </button>
                                )}

                                <button
                                  onClick={handleExitRoom}
                                  className="bg-slate-900 hover:bg-slate-800 border border-cyan-700 text-cyan-300 px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1"
                                >
                                  <LogOut size={13} />
                                  <span>Exit</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 1B. COLONY EVALUATIONS (CANONICAL STARFLIGHT EVALUATION READER) */}
                  {opsSubTab === 'evaluations' && (() => {
                    const totalEvals = evaluations.length;
                    const safeEvalIdx = totalEvals > 0 ? Math.min(Math.max(0, activeEvalIndex), totalEvals - 1) : 0;
                    const currentEval = totalEvals > 0 ? evaluations[safeEvalIdx] : null;

                    const handleMarkAllRead = () => {
                      setEvaluations((prev) => prev.map((e) => ({ ...e, read: true })));
                      gameAudio.playConfirmSelect();
                      addMessage('Operations: All planetary evaluations acknowledged and archived.', 'Captain', 'info');
                      handleSaveToSlot(activeSlot);
                    };

                    const handleAcknowledgeCurrent = () => {
                      if (!currentEval) return;
                      setEvaluations((prev) =>
                        prev.map((e, idx) => (idx === safeEvalIdx ? { ...e, read: true } : e))
                      );
                      gameAudio.playConfirmSelect();
                      handleSaveToSlot(activeSlot);
                      if (safeEvalIdx < totalEvals - 1) {
                        setActiveEvalIndex(safeEvalIdx + 1);
                      }
                    };

                    if (totalEvals === 0) {
                      return (
                        <div className="bg-slate-950/90 p-6 rounded-2xl border border-cyan-900/80 flex flex-col items-center text-center gap-4 shadow-inner">
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                            <Globe size={24} />
                          </div>
                          <div className="max-w-md space-y-1.5">
                            <strong className="text-base font-black text-white block">
                              NO COLONIAL EVALUATIONS IN QUEUE
                            </strong>
                            <p className="text-slate-300 text-xs leading-relaxed">
                              When your starship is established in orbit around an uncharted planet, select <strong className="text-amber-400">Command ➔ Log Planet</strong> to recommend a world for colonization.
                            </p>
                          </div>

                          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 max-w-lg text-left space-y-1">
                            <strong className="text-cyan-300 block uppercase font-mono">Evaluation Standards:</strong>
                            <p>Colonial Directorate audits determine planet suitability based on temperature range, gravity (&lt;= 2.00 G), weather stability, breathable oxygen atmosphere, and water presence.</p>
                          </div>

                          <button
                            onClick={handleExitRoom}
                            className="bg-slate-900 hover:bg-slate-800 border border-cyan-700 text-cyan-300 px-5 py-2 rounded-xl font-bold text-xs mt-2"
                          >
                            Return to Concourse ↩
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Left Evaluation List */}
                          <div className="bg-slate-950/90 p-3 rounded-2xl border border-emerald-900/80 flex flex-col gap-2 shadow-inner">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                              <span className="font-extrabold text-emerald-300 text-xs flex items-center gap-1 tracking-wider uppercase">
                                <Globe size={13} className="text-yellow-400" />
                                EVALUATION QUEUE ({totalEvals})
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {evaluations.filter((e) => e.read).length}/{totalEvals} Read
                              </span>
                            </div>

                            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                              {evaluations.map((ev, idx) => {
                                const isSelected = idx === safeEvalIdx;
                                const isSuit = ev.verdict === 'SUITABLE' || ev.suitable;
                                return (
                                  <button
                                    key={ev.id}
                                    onClick={() => {
                                      setActiveEvalIndex(idx);
                                      gameAudio.playCrispClick();
                                    }}
                                    className={`w-full p-2.5 rounded-xl text-left border transition flex flex-col gap-1 ${
                                      isSelected
                                        ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-[0_0_10px_#10b98150]'
                                        : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <strong className="text-xs truncate text-white block">
                                        {ev.colonyName || ev.planetName}
                                      </strong>
                                      <span
                                        className={`px-1.5 py-0.2 rounded font-mono font-black text-[9px] ${
                                          isSuit
                                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-400'
                                            : 'bg-red-950 text-red-300 border border-red-500'
                                        }`}
                                      >
                                        {isSuit ? 'SUITABLE' : 'UNSUITABLE'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                      <span>[{ev.starX ?? currentStar.x}, {ev.starY ?? currentStar.y}] • {ev.planetName}</span>
                                      <span className={!ev.read ? 'text-amber-400 font-bold animate-pulse' : 'text-slate-500'}>
                                        {!ev.read ? '● UNREAD' : '✓ ARCHIVED'}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Right Main Evaluation Details Card */}
                          <div className="md:col-span-2 bg-slate-950/90 p-4 md:p-5 rounded-2xl border border-emerald-900/80 flex flex-col justify-between gap-3.5 shadow-inner min-h-[300px]">
                            {currentEval && (
                              <div className="space-y-3">
                                {/* Header */}
                                <div className="border-b border-slate-800 pb-2.5">
                                  <div className="flex flex-wrap justify-between items-center gap-2">
                                    <div>
                                      <h3 className="text-base font-black text-white flex items-center gap-2 font-mono">
                                        EVALUATION: {currentEval.colonyName?.toUpperCase() || currentEval.planetName.toUpperCase()}
                                      </h3>
                                      <span className="text-[11px] text-slate-400 font-mono">
                                        Target: <strong className="text-cyan-300">{currentEval.planetName}</strong> • System: <strong className="text-yellow-400">[{currentEval.starX ?? currentStar.x}, {currentEval.starY ?? currentStar.y}]</strong> • Date: <strong className="text-slate-200">{currentEval.stardate}</strong>
                                      </span>
                                    </div>

                                    <div
                                      className={`px-3 py-1 rounded-xl font-mono font-black text-xs border shadow ${
                                        currentEval.verdict === 'SUITABLE' || currentEval.suitable
                                          ? 'bg-emerald-950 text-emerald-300 border-emerald-400 shadow-[0_0_12px_#10b981]'
                                          : 'bg-red-950 text-red-300 border-red-500 shadow-[0_0_12px_#ef4444]'
                                      }`}
                                    >
                                      VERDICT: {currentEval.verdict || (currentEval.suitable ? 'SUITABLE' : 'UNSUITABLE')}
                                    </div>
                                  </div>
                                </div>

                                {/* Body */}
                                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2.5 font-mono text-xs">
                                  {/* Financial Impact */}
                                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <span className="text-slate-400">Financial Directorate Impact:</span>
                                    {currentEval.suitable || currentEval.verdict === 'SUITABLE' ? (
                                      <strong className="text-emerald-400 text-sm font-bold">
                                        Bonus: +{currentEval.payout > 0 ? currentEval.payout.toLocaleString() : (currentEval.bonus || 0).toLocaleString()} M.U. (CREDITED)
                                      </strong>
                                    ) : (
                                      <strong className="text-red-400 text-sm font-bold">
                                        Fine: -{Math.abs(currentEval.payout < 0 ? currentEval.payout : (currentEval.fine || 100)).toLocaleString()} M.U. (DEDUCTED)
                                      </strong>
                                    )}
                                  </div>

                                  {/* Reasons List */}
                                  <div className="space-y-1.5">
                                    <strong className="text-cyan-300 block text-[11px] uppercase tracking-wide">
                                      Directorate Habitability Assessment:
                                    </strong>
                                    {currentEval.reasons && currentEval.reasons.length > 0 ? (
                                      <div className="p-2.5 bg-slate-950/80 rounded-lg border border-red-900/60 space-y-1">
                                        <span className="text-red-400 font-bold block text-[11px]">Unsuitable Conditions Detected:</span>
                                        <div className="flex flex-wrap gap-1.5">
                                          {currentEval.reasons.map((r, rIdx) => (
                                            <span key={rIdx} className="bg-red-950 border border-red-500 text-red-300 px-2 py-0.5 rounded text-[10px] font-black">
                                              {r.toUpperCase()}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="p-2.5 bg-slate-950/80 rounded-lg border border-emerald-900/60 text-emerald-300 text-xs">
                                        ✓ PASSED ALL 6 HABITABILITY CHECKS (Optimal temperature, gravity, weather, breathable atmosphere & water).
                                      </div>
                                    )}
                                  </div>

                                  {/* Warning Message if any */}
                                  {currentEval.warningMessage && (
                                    <div className="p-2.5 bg-amber-950/60 rounded-lg border border-amber-500/80 text-amber-300 text-xs italic font-bold">
                                      ⚠ "{currentEval.warningMessage}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Evaluation Pagination Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    if (totalEvals > 0) {
                                      setActiveEvalIndex((prev) => (prev - 1 + totalEvals) % totalEvals);
                                      gameAudio.playCrispClick();
                                    }
                                  }}
                                  disabled={totalEvals <= 1}
                                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-emerald-300 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1"
                                >
                                  <ChevronLeft size={14} />
                                  <span>[Previous]</span>
                                </button>

                                <span className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-yellow-400">
                                  Page {safeEvalIdx + 1} of {totalEvals}
                                </span>

                                <button
                                  onClick={() => {
                                    if (totalEvals > 0) {
                                      setActiveEvalIndex((prev) => (prev + 1) % totalEvals);
                                      gameAudio.playCrispClick();
                                    }
                                  }}
                                  disabled={totalEvals <= 1}
                                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-emerald-300 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1"
                                >
                                  <span>[Next]</span>
                                  <ChevronRight size={14} />
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handleAcknowledgeCurrent}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl font-black text-xs shadow flex items-center gap-1"
                                >
                                  <Check size={13} />
                                  <span>[Accept / Read]</span>
                                </button>
                                <button
                                  onClick={handleMarkAllRead}
                                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3 py-1.5 rounded-xl font-bold text-xs"
                                >
                                  [Mark All Read]
                                </button>
                                <button
                                  onClick={handleExitRoom}
                                  className="bg-slate-900 hover:bg-slate-800 border border-cyan-700 text-cyan-300 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1"
                                >
                                  <LogOut size={13} />
                                  <span>[Back]</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 1C. MANDATES & DIRECTIVES */}
                  {opsSubTab === 'directives' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-slate-950/90 p-4 rounded-2xl border border-purple-900/80 flex flex-col gap-2.5 shadow-inner">
                        <span className="font-extrabold text-purple-300 text-xs flex items-center gap-1.5 tracking-wider uppercase">
                          <Compass size={15} className="text-yellow-400" />
                          PRIMARY MANDATE #4620
                        </span>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          Commissioned starships are authorized to survey all 250×220 parsec sectors. Discover new worlds, chart jump corridors, and maintain lawful diplomatic protocol.
                        </p>
                      </div>

                      <div className="bg-slate-950/90 p-4 rounded-2xl border border-cyan-900/80 flex flex-col gap-2.5 shadow-inner">
                        <span className="font-extrabold text-cyan-300 text-xs flex items-center gap-1.5 tracking-wider uppercase">
                          <Fuel size={15} className="text-yellow-400" />
                          ENDURIUM EXTRACTION
                        </span>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          Endurium crystalline ore is the indispensable fuel for starship hyperdrive and shield generators. Extract deposits from planetary terrain using the Terrain Vehicle.
                        </p>
                      </div>

                      <div className="bg-slate-950/90 p-4 rounded-2xl border border-amber-900/80 flex flex-col gap-2.5 shadow-inner">
                        <span className="font-extrabold text-amber-300 text-xs flex items-center gap-1.5 tracking-wider uppercase">
                          <Sun size={15} className="text-yellow-400" />
                          ASTROPHYSICAL ANOMALY DIRECTIVE
                        </span>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          Astronomical observatories on Arth are monitoring subtle fluctuations in our primary sun. All exploration vessels are instructed to log anomalies and report findings to Starport Operations.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. PERSONNEL ROOM (6 CANONICAL BUTTONS: [Create], [Train], [Delete], [Previous], [Next], [Exit]) */}
              {activeRoomIndex === 1 && (() => {
                const totalCrew = crewRoster.length;
                const safeIndex = totalCrew > 0 ? Math.min(Math.max(0, personnelIndex), totalCrew - 1) : 0;
                const selCrew = totalCrew > 0 ? crewRoster[safeIndex] : null;
                const spec = selCrew ? RACE_SPECS[selCrew.race] : null;

                const handleCreateRecruit = () => {
                  const trimmed = newCrewNameInput.trim();
                  if (!trimmed) {
                    setPersonnelMessage('Please enter a recruit name (1-14 characters).');
                    gameAudio.playErrorBuzz();
                    return;
                  }
                  if (trimmed.length > 14) {
                    setPersonnelMessage('Name exceeds 14 characters limit.');
                    gameAudio.playErrorBuzz();
                    return;
                  }
                  if (crewRoster.length >= 25) {
                    setPersonnelMessage('Crew roster is full (maximum 25 personnel).');
                    gameAudio.playErrorBuzz();
                    return;
                  }

                  const raceSpec = RACE_SPECS[newCrewRaceSelect];
                  const newMember: CrewMember = {
                    id: `crew-${newCrewRaceSelect.toLowerCase()}-${Date.now()}`,
                    name: trimmed,
                    race: newCrewRaceSelect,
                    skills: { ...raceSpec.baseSkills },
                    durability: raceSpec.durability,
                    vitality: 100,
                    alive: true,
                    quirk: raceSpec.desc,
                    color: raceSpec.color,
                  };

                  newMember.portraitId = allocateCrewPortrait(newMember.race, crewRoster, newMember.id);
                  const nextRoster = [...crewRoster, newMember];
                  setCrewRoster(nextRoster);
                  setPersonnelIndex(crewRoster.length);
                  setSelectedPersonnelCrewId(newMember.id);
                  setIsCreatingCrewModal(false);
                  setNewCrewNameInput('');
                  setPersonnelMessage(`Recruited ${newMember.name} (${newMember.race}) to active roster.`);
                  gameAudio.playConfirmSelect();
                  addMessage(`Personnel: Enlisted ${newMember.name} (${newMember.race}) to Starport roster.`, undefined, 'info');
                  handleSaveToSlot(activeSlot, { crewRoster: nextRoster });
                };

                const handleDeleteCrew = () => {
                  if (!selCrew) return;
                  const name = selCrew.name;
                  const nextRoster = crewRoster.filter((c) => c.id !== selCrew.id);
                  setCrewRoster(nextRoster);
                  const nextPosts = { ...assignedPosts };
                  (Object.keys(nextPosts) as CrewPost[]).forEach((p) => {
                    if (nextPosts[p] === selCrew.id) nextPosts[p] = null;
                  });
                  setAssignedPosts(nextPosts);
                  setPersonnelIndex((prev) => Math.max(0, prev - 1));
                  setPersonnelMessage(`Dismissed ${name} from crew roster.`);
                  gameAudio.playCrispClick();
                  addMessage(`Personnel: Officer ${name} dismissed from service.`, undefined, 'info');
                  handleSaveToSlot(activeSlot, { crewRoster: nextRoster, assignedPosts: nextPosts });
                };

                const handleTrainSelected = () => {
                  if(!selCrew||trainingPurchaseLockRef.current)return;
                  const current=crewRosterFrameRef.current.find(c=>c.id===selCrew.id);
                  if(!current)return;
                  const plan=planCrewTraining(current,RACE_SPECS[current.race],selectedTrainingSkills,creditsLiveRef.current);
                  if(plan.error){setPersonnelMessage(plan.error);gameAudio.playErrorBuzz();return;}
                  trainingPurchaseLockRef.current=true;
                  const nextRoster=crewRosterFrameRef.current.map(c=>c.id===current.id?{...c,skills:plan.next}:c);
                  const updatedCredits=creditsLiveRef.current-plan.cost;
                  addBankTransaction(`Personnel Training (${current.name} - ${plan.skills.join(', ')})`,-plan.cost);
                  setCrewRoster(nextRoster);
                  for(const skill of plan.skills)addMessage(`Personnel Academy: Officer ${current.name} trained in ${skill} (+${plan.next[skill]-current.skills[skill]} pts).`,undefined,'info');
                  setPersonnelMessage(`Trained ${plan.skills.join(', ')}. Cost: ${plan.cost.toLocaleString()} M.U.`);
                  gameAudio.playLevelUpStinger();setIsTrainingSkillModal(false);setSelectedTrainingSkills([]);
                  handleSaveToSlot(activeSlot,{credits:updatedCredits,crewRoster:nextRoster});
                };

                return (
                  <div className="space-y-4 text-xs">
                    {/* Notification message banner */}
                    {personnelMessage && (
                      <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/80 rounded-xl text-emerald-300 font-bold flex items-center justify-between">
                        <span>{personnelMessage}</span>
                        <button onClick={() => setPersonnelMessage(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Left: Crew Roster Browser */}
                      <div className="bg-slate-950/90 p-4 rounded-2xl border border-emerald-900/80 flex flex-col justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                            <span className="font-extrabold text-emerald-300 text-sm flex items-center gap-1.5 tracking-wider">
                              <Users size={16} className="text-yellow-400" />
                              CREW ROSTER ({totalCrew}/25)
                            </span>
                          </div>

                          {totalCrew === 0 ? (
                            <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800 text-center text-slate-400 text-xs italic">
                              No personnel currently enlisted. Click <strong className="text-emerald-300">[Create]</strong> below to enlist free recruits (up to 25 files).
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                              {crewRoster.map((crew, idx) => {
                                const isSel = idx === safeIndex;
                                return (
                                  <button
                                    key={crew.id}
                                    onClick={() => {
                                      setPersonnelIndex(idx);
                                      setSelectedPersonnelCrewId(crew.id);
                                      gameAudio.playCrispClick();
                                    }}
                                    style={{ borderColor: isSel ? '#10b981' : 'rgba(51, 65, 85, 0.6)' }}
                                    className={`w-full p-2 rounded-xl border text-left flex items-center justify-between transition ${
                                      isSel ? 'bg-emerald-950/70 shadow-[0_0_10px_#10b98160]' : 'bg-slate-900/90 hover:bg-slate-800'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div style={{ color: crew.color }} className="font-bold text-xs">●</div>
                                      <div>
                                        <strong className="text-white block text-xs">{crew.name}</strong>
                                        <span className="text-[10px] text-slate-400">{crew.race}</span>
                                      </div>
                                    </div>
                                    <span className="text-emerald-400 font-mono text-[10px]">
                                      #{idx + 1}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Navigation controls for roster */}
                        {totalCrew > 0 && (
                          <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-mono text-xs">
                            <span className="text-slate-400">
                              Selected: <strong className="text-yellow-400">{safeIndex + 1} of {totalCrew}</strong>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right: Selected Officer Dossier & Skills */}
                      <div className="md:col-span-2 bg-slate-950/90 p-4 md:p-5 rounded-2xl border border-emerald-900/80 flex flex-col justify-between gap-3 min-h-[280px]">
                        {selCrew && spec ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-3">
                                <CrewPortrait
                                  member={selCrew}
                                  size="lg"
                                  inCombat={false}
                                  hullCritical={false}
                                />
                                <div>
                                  <h3 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                                    {selCrew.name}
                                    <span style={{ color: selCrew.color }} className="text-xs font-bold">[{selCrew.race}]</span>
                                  </h3>
                                  <p className="text-[11px] text-slate-400 italic">{spec.desc}</p>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-slate-400 text-[10px] block">Learning Rate:</span>
                                <strong className="text-yellow-400 text-xs font-mono">
                                  {selCrew.race === 'Android' ? 'Fixed (None)' : `+${spec.learningRate} / session`}
                                </strong>
                              </div>
                            </div>

                            {/* Skill Bars */}
                            <div className="space-y-2">
                              {(['science', 'navigation', 'engineering', 'communications', 'medicine'] as (keyof Skills)[]).map((sk) => {
                                const curVal = selCrew.skills[sk];
                                const maxVal = spec.maxSkills[sk] !== undefined ? spec.maxSkills[sk] : 250;
                                return (
                                  <div key={sk} className="p-2 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                                    <div className="w-28 capitalize font-bold text-slate-200 text-xs">{sk}</div>
                                    <div className="flex-1 flex items-center gap-2">
                                      <div className="flex-1 bg-slate-950 h-2.5 rounded-full overflow-hidden relative border border-slate-800">
                                        <div
                                          className="h-full bg-linear-to-r from-emerald-600 to-cyan-500 transition-all duration-300"
                                          style={{ width: `${maxVal > 0 ? Math.min(100, (curVal / 250) * 100) : 0}%` }}
                                        />
                                      </div>
                                      <span className="font-mono text-xs text-white w-14 text-right">
                                        {curVal} / {maxVal}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 italic">
                            No crew member selected. Enlist a recruit using [Create] to view stats.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* THE 6 CANONICAL BUTTONS: [Create], [Train], [Delete], [Previous], [Next], [Exit] */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-emerald-900/60">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1. [Create] */}
                        <button
                          onClick={() => {
                            setIsCreatingCrewModal(true);
                            setNewCrewNameInput('');
                            setPersonnelMessage(null);
                            gameAudio.playConfirmSelect();
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-xs shadow-lg flex items-center gap-1.5 transition"
                        >
                          <Plus size={14} />
                          [Create]
                        </button>

                        {/* 2. [Train] */}
                        <button
                          onClick={() => {
                            if (!selCrew) {
                              setPersonnelMessage('Please select a crew member to train.');
                              gameAudio.playErrorBuzz();
                              return;
                            }
                            if (selCrew.race === 'Android' || !spec?.canTrain) {
                              setPersonnelMessage('Androids cannot be trained.');
                              gameAudio.playErrorBuzz();
                              addMessage('Androids cannot be trained.', undefined, 'alert');
                              return;
                            }
                            setSelectedTrainingSkills([]);trainingPurchaseLockRef.current=false;setPersonnelMessage(null);
                            setIsTrainingSkillModal(true);
                            gameAudio.playConfirmSelect();
                          }}
                          disabled={!selCrew || !selCrew.alive || selCrew.race === 'Android' || (spec ? !spec.canTrain : false)}
                          title={selCrew && !selCrew.alive ? 'Deceased officers cannot be trained.' : undefined}
                          className={`px-4 py-2 rounded-xl font-black text-xs shadow-lg flex items-center gap-1.5 transition ${
                            !selCrew || !selCrew.alive || selCrew.race === 'Android' || (spec ? !spec.canTrain : false)
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                              : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                          }`}
                        >
                          <GraduationCap size={14} />
                          [Train] (300 M.U.)
                        </button>

                        {/* 3. [Delete] */}
                        <button
                          onClick={handleDeleteCrew}
                          disabled={!selCrew}
                          className="bg-red-800 hover:bg-red-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl font-black text-xs shadow flex items-center gap-1.5 transition"
                        >
                          <Trash2 size={14} />
                          [Delete]
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* 4. [Previous] */}
                        <button
                          onClick={() => {
                            if (totalCrew > 0) {
                              setPersonnelIndex((prev) => (prev - 1 + totalCrew) % totalCrew);
                              gameAudio.playCrispClick();
                            }
                          }}
                          disabled={totalCrew <= 1}
                          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-cyan-300 px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1"
                        >
                          <ChevronLeft size={14} />
                          [Previous]
                        </button>

                        {/* 5. [Next] */}
                        <button
                          onClick={() => {
                            if (totalCrew > 0) {
                              setPersonnelIndex((prev) => (prev + 1) % totalCrew);
                              gameAudio.playCrispClick();
                            }
                          }}
                          disabled={totalCrew <= 1}
                          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-cyan-300 px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1"
                        >
                          [Next]
                          <ChevronRight size={14} />
                        </button>

                        {/* 6. [Exit] */}
                        <button
                          onClick={handleExitRoom}
                          className="bg-slate-800 hover:bg-slate-700 text-yellow-400 px-4 py-2 rounded-xl font-black text-xs shadow flex items-center gap-1.5"
                        >
                          <LogOut size={14} />
                          [Exit] ↩
                        </button>
                      </div>
                    </div>

                    {/* CREW CREATION MODAL */}
                    {isCreatingCrewModal && (
                      <MenuOverlay tone="neutral" zIndex={85}>
                        <div className="w-full max-w-md glass-panel border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100">
                          <div className="flex justify-between items-center border-b border-emerald-900/80 pb-2">
                            <h3 className="text-base font-black text-emerald-300 flex items-center gap-2">
                              <Plus size={18} />
                              ENLIST CREW RECRUIT (FREE)
                            </h3>
                            <button onClick={() => setIsCreatingCrewModal(false)} className="text-slate-400 hover:text-white">✕</button>
                          </div>

                          {personnelMessage && (
                            <div role="status" className="rounded-xl border border-amber-500/60 bg-amber-950/60 p-2.5 text-xs text-amber-200">
                              {personnelMessage}
                            </div>
                          )}

                          <div className="space-y-3 text-xs">
                            <div>
                              <label htmlFor="recruit-name" className="text-slate-300 font-bold block mb-1">Recruit Name (1-14 Characters):</label>
                              <input
                                id="recruit-name"
                                type="text"
                                maxLength={14}
                                placeholder="Enter crew name..."
                                value={newCrewNameInput}
                                onChange={(e) => setNewCrewNameInput(e.target.value)}
                                className="w-full bg-slate-900 border border-emerald-500 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-hidden"
                              />
                            </div>

                            <div className="flex flex-wrap items-end gap-2">
                              <label className="flex-1 min-w-36 text-slate-300 font-bold">Name source
                                <select aria-label="Name source" value={crewNameSource} onChange={e=>setCrewNameSource(e.target.value as NameSource)} className="block w-full mt-1 bg-slate-900 border border-emerald-700 rounded-xl p-2 min-h-11">
                                  <option>Any series</option>{Object.keys(NAME_POOLS).map(source=><option key={source}>{source}</option>)}
                                </select>
                              </label>
                              <button onClick={()=>{setNewCrewNameInput(generateCrewName(crewNameSource,[...crewRoster.map(c=>c.name),newCrewNameInput]));setPersonnelMessage(null);gameAudio.playCrispClick();}} className="min-h-11 rounded-xl border border-cyan-600 bg-cyan-950 px-3 text-cyan-200 font-bold">Generate name</button>
                            </div>
                            <div>
                              <label htmlFor="recruit-species" className="text-slate-300 font-bold block mb-1">Species / Race:</label>
                              <select
                                id="recruit-species"
                                value={newCrewRaceSelect}
                                onChange={(e) => setNewCrewRaceSelect(e.target.value as Species)}
                                className="w-full bg-slate-900 border border-emerald-500 text-white rounded-xl p-2.5 font-bold text-xs"
                              >
                                <option value="Human">Human (Science 50, Nav 30, Eng 30, Com 30, Med 30 • +9/train)</option>
                                <option value="Velox">Velox (Science 30, Nav 50, Eng 50, Com 0, Med 0 • +6/train)</option>
                                <option value="Thrynn">Thrynn (Science 30, Nav 30, Eng 30, Com 50, Med 0 • +7/train)</option>
                                <option value="Elowan">Elowan (Science 10, Nav 30, Eng 10, Com 50, Med 50 • +10/train)</option>
                                <option value="Android">Android (Science 50, Nav 150, Eng 100, Com 0, Med 20 • No Train)</option>
                              </select>
                            </div>

                            {/* Base Stats Preview */}
                            {(() => {
                              const rSpec = RACE_SPECS[newCrewRaceSelect];
                              return (
                                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
                                  <div className="text-cyan-300 font-bold">{rSpec.desc}</div>
                                  <div className="grid grid-cols-2 gap-1 text-slate-300 pt-1 border-t border-slate-800">
                                    <span>Sci: <strong>{rSpec.baseSkills.science}</strong></span>
                                    <span>Nav: <strong>{rSpec.baseSkills.navigation}</strong></span>
                                    <span>Eng: <strong>{rSpec.baseSkills.engineering}</strong></span>
                                    <span>Com: <strong>{rSpec.baseSkills.communications}</strong></span>
                                    <span>Med: <strong>{rSpec.baseSkills.medicine}</strong></span>
                                    <span>Rate: <strong>{rSpec.learningRate > 0 ? `+${rSpec.learningRate}` : 'Fixed'}</strong></span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setIsCreatingCrewModal(false)}
                              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-bold text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleCreateRecruit}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-black text-xs shadow-lg"
                            >
                              Enlist Recruit
                            </button>
                          </div>
                        </div>
                      </MenuOverlay>
                    )}

                    {/* Each selection buys an original 300 M.U. category session. */}
                    {isTrainingSkillModal && selCrew && (
                      <MenuOverlay tone="neutral" zIndex={85}>
                        <CrewTraining crew={selCrew} spec={RACE_SPECS[selCrew.race]} credits={credits} selected={selectedTrainingSkills} onSelect={skills=>{setSelectedTrainingSkills(skills);setPersonnelMessage(null);}} onTrain={handleTrainSelected} onClose={()=>setIsTrainingSkillModal(false)} message={personnelMessage}/>
                      </MenuOverlay>
                    )}
                  </div>
                );
              })()}

              {/* 3. CREW ASSIGNMENT ROOM */}
              {activeRoomIndex === 2 && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-300">
                    Junior crew briefing room. Assign bridge station duties to certified personnel before clearance.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {CREW_POSTS.map((post) => {
                      const curId = assignedPosts[post];
                      const officer = crewRoster.find((c) => c.id === curId);
                      return (
                        <div key={post} className="bg-slate-950/90 p-3.5 rounded-2xl border border-purple-900/80 flex flex-col gap-2 shadow-inner">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                            <strong className="text-purple-300 font-extrabold text-sm">{post}</strong>
                            <span className={officer && !officer.alive ? 'text-red-400 font-bold' : officer ? 'text-cyan-300 font-semibold' : 'text-slate-500'}>
                              {officer ? (officer.alive ? officer.race : 'DECEASED') : 'VACANT'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            {officer ? (
                              <CrewPortrait
                                member={officer}
                                size="sm"
                                inCombat={false}
                                hullCritical={hullIntegrity <= 50}
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500">
                                🪑
                              </div>
                            )}
                            <div className="flex-1">
                              <strong className="text-white text-xs block truncate">{officer ? officer.name : 'No Officer Assigned'}</strong>
                              <span className="text-[10px] text-slate-400">
                                {officer ? `Vitality: ${Math.round(officer.vitality)}%` : 'Select replacement from roster'}
                              </span>
                            </div>
                          </div>

                          <select
                            aria-label={`${post} assignment`}
                            value={curId || ''}
                            onChange={(e) => {
                              const newId = e.target.value || null;
                              if(newId===curId)return;
                              const incoming=crewRoster.find(c=>c.id===newId&&c.alive);
                              const nextPosts = { ...assignedPosts, [post]: newId };
                              setAssignedPosts(nextPosts);
                              if(incoming&&!isSilenceFilterActive()){
                                const text=assignmentVoiceLine(incoming.race);
                                setBanterLog(prev=>[{speaker:incoming.name,post,text},...prev.slice(0,15)]);
                                addMessage(text,post,'banter',`${post} ${incoming.name}`);void playCrewBanter(text);
                              }
                              gameAudio.playConfirmSelect();
                              handleSaveToSlot(activeSlot, { assignedPosts: nextPosts });
                            }}
                            className="bg-slate-900 border border-purple-700/60 text-white rounded-xl p-2 text-xs font-bold"
                          >
                            <option value="">-- Vacant --</option>
                            {officer && !officer.alive && <option value={officer.id} disabled>{officer.name} (Deceased - replace)</option>}
                            {crewRoster
                              .filter((c) => c.alive)
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name} ({c.race}) - Vit: {Math.round(c.vitality)}%
                                </option>
                              ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. BANK ROOM */}
              {activeRoomIndex === 3 && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Vault Digital Terminal & Controls */}
                    <div className="bg-slate-950/90 p-4 rounded-2xl border border-amber-900/80 flex flex-col gap-3 shadow-inner">
                      <span className="font-extrabold text-amber-300 text-sm flex items-center gap-1.5 tracking-wider">
                        <Coins size={16} className="text-yellow-400" />
                        ACCOUNT BALANCE
                      </span>
                      <div className="p-3 bg-slate-900/90 rounded-2xl border border-amber-500/40 text-center">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Available Treasury</span>
                        <strong className="text-2xl font-black text-amber-400 font-mono">{credits.toLocaleString()} M.U.</strong>
                      </div>

                      <div className="space-y-2">
                        <span className="text-slate-400 text-[11px] font-bold">Annual Bank Interest Rate: 12%</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          12% a year (300-day standard year), paid on deposits for elapsed flight time upon boarding at the Docking Bay to launch.
                        </p>
                      </div>
                    </div>

                    {/* Transaction Ledger Table */}
                    <div className="md:col-span-2 bg-slate-950/90 p-4 rounded-2xl border border-amber-900/80 flex flex-col gap-3 shadow-inner">
                      <span className="font-extrabold text-amber-300 text-sm flex items-center gap-1.5 tracking-wider">
                        <Database size={16} className="text-yellow-400" />
                        OFFICIAL TRANSACTION LEDGER
                      </span>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {bankLedger.map((entry, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                            <div>
                              <strong className="text-white block">{entry.desc}</strong>
                              <span className="text-[10px] text-slate-400 font-mono">{entry.date}</span>
                            </div>
                            <div className="text-right">
                              <span className={entry.amount >= 0 ? 'text-emerald-400 font-bold font-mono' : 'text-red-400 font-bold font-mono'}>
                                {entry.amount >= 0 ? `+${entry.amount.toLocaleString()}` : entry.amount.toLocaleString()} M.U.
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">Bal: {entry.balance.toLocaleString()} M.U.</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. SHIP CONFIGURATION ROOM (BUY, SELL, REPAIR, NAME, EXIT) */}
              {activeRoomIndex === 4 && (
                <div className="space-y-4 text-xs">
                  {/* Status Banner */}
                  {shipConfigMessage && (
                    <div className="p-2.5 bg-cyan-950/90 border border-cyan-400 rounded-xl text-cyan-200 font-bold flex items-center justify-between shadow-md">
                      <span>{shipConfigMessage}</span>
                      <button onClick={() => setShipConfigMessage(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
                    </div>
                  )}

                  {/* Mode Selector Buttons & Name Button */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-900/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShipConfigMode('buy');
                          gameAudio.playCrispClick();
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                          shipConfigMode === 'buy'
                            ? 'bg-cyan-600 text-white shadow-[0_0_12px_#00f0ff80]'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <ShoppingCart size={14} />
                        [Buy / Upgrade]
                      </button>

                      <button
                        onClick={() => {
                          setShipConfigMode('sell');
                          gameAudio.playCrispClick();
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                          shipConfigMode === 'sell'
                            ? 'bg-amber-600 text-white shadow-[0_0_12px_#f59e0b80]'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Coins size={14} />
                        [Sell]
                      </button>

                      <button
                        onClick={() => {
                          setShipConfigMode('repair');
                          if (repairBreakdown.isFullyRepaired) {
                            setShipConfigMessage('All ship systems fully operational. Nothing to repair.');
                          }
                          gameAudio.playCrispClick();
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                          shipConfigMode === 'repair'
                            ? 'bg-purple-600 text-white shadow-[0_0_12px_#a855f780]'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Wrench size={14} />
                        [Repair]
                      </button>

                      <button
                        onClick={() => {
                          setIsNamingShipModal(true);
                          setShipNameInput(shipName);
                          gameAudio.playConfirmSelect();
                        }}
                        className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-3.5 py-1.5 rounded-xl font-black text-xs shadow flex items-center gap-1.5"
                      >
                        <Edit3 size={14} />
                        [Name]
                      </button>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-400">Available Funds:</span>
                      <strong className="text-amber-300 font-bold">{credits.toLocaleString()} M.U.</strong>
                    </div>
                  </div>

                  {/* Dynamic Visual Hangar Schematic & Real-time Gauges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-cyan-900/80 flex flex-col items-center justify-between relative overflow-hidden shadow-inner min-h-[300px] md:min-h-[340px]">
                      <span className="self-start font-bold text-cyan-300 text-xs uppercase tracking-wider flex items-center gap-1.5 z-10 mb-1">
                        <Rocket size={14} className="text-yellow-400" />
                        GANTRY DRYDOCK LIFT • {shipName ? shipName.toUpperCase() : 'UNCHRISTENED VESSEL'}
                      </span>

                      {/* Dynamic Painted Starship Canvas Viewport */}
                      <div className="w-full flex-1 flex items-center justify-center relative min-h-[220px]">
                        <canvas
                          style={{ width: '100%', height: '240px' }}
                          className="rounded-xl filter drop-shadow-[0_0_15px_#00f0ff35]"
                          ref={(shipHangarCanvas) => {
                            gantryCanvasRef.current = shipHangarCanvas;
                            renderGantryShipCanvas(
                              shipHangarCanvas,
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
                          }}
                        />
                      </div>

                      {/* Accurate Mass, Thrust and Acceleration Calculations (Rules 1 & 2) */}
                      <div className="w-full grid grid-cols-3 gap-2 mt-1 text-center text-[10px]">
                        <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Total Mass</span>
                          <strong className="text-white text-xs font-mono">
                            {totalShipMass} t
                          </strong>
                        </div>
                        <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Engine Thrust</span>
                          <strong className="text-cyan-300 text-xs font-mono">{shipThrustPower} kN</strong>
                        </div>
                        <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Acceleration</span>
                          <strong className="text-emerald-400 text-xs font-mono">
                            {shipAcceleration} G
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Shipyard Interactive Panels (BUY / SELL / REPAIR Modes) */}
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {/* BUY MODE */}
                      {shipConfigMode === 'buy' && (
                        <>
                          {/* Cargo Pods Buy */}
                          <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 flex justify-between items-center">
                            <div>
                              <strong className="text-yellow-400 block">External Cargo Pods ({cargoPods}/16)</strong>
                              <span className="text-slate-400 text-[10px]">Buy: 500 M.U. • Sell: 500 M.U. (10 t mass, expands hold by 50 m³)</span>
                            </div>
                            <button
                              onClick={() => {
                                if (cargoPods >= 16) {
                                  setShipConfigMessage('Maximum 16 cargo pods installed.');
                                  gameAudio.playErrorBuzz();
                                  return;
                                }
                                if (credits < 500) {
                                  setShipConfigMessage('Insufficient funds for cargo pod (500 M.U. required).');
                                  gameAudio.playErrorBuzz();
                                  return;
                                }
                                const nextPods = Math.min(16, cargoPods + 1);
                                const nextCreds = credits - 500;
                                addBankTransaction('Purchased Cargo Pod', -500);
                                setCargoPods(nextPods);
                                triggerHangarSparks();
                                gameAudio.playLevelUpStinger();
                                setShipConfigMessage(`Installed Cargo Pod #${nextPods} (-500 M.U.).`);
                                handleSaveToSlot(activeSlot, { cargoPods: nextPods, credits: nextCreds });
                              }}
                              disabled={cargoPods >= 16}
                              className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 px-3 py-1.5 rounded-xl font-black text-xs shadow"
                            >
                              + Pod (500 M.U.)
                            </button>
                          </div>

                          {/* Module Upgrades (Engines, Shields, Armor, Missiles, Lasers) */}
                          {[
                            { key: 'engines', label: 'Engine Drive', curLvl: engineClass, setFn: setEngineClass, table: PART_TABLES.engines },
                            { key: 'shielding', label: 'Shield Harmonizer', curLvl: shieldClass, setFn: setShieldClass, table: PART_TABLES.shielding },
                            { key: 'armor', label: 'Armor Plating', curLvl: armorClass, setFn: setArmorClass, table: PART_TABLES.armor },
                            { key: 'missiles', label: 'Missile Launchers', curLvl: missileClass, setFn: setMissileClass, table: PART_TABLES.missiles },
                            { key: 'lasers', label: 'Pulse Lasers', curLvl: laserClass, setFn: setLaserClass, table: PART_TABLES.lasers },
                          ].map((mod) => {
                            const nextPart = mod.table[mod.curLvl];
                            return (
                              <div key={mod.key} className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex justify-between items-center">
                                <div>
                                  <strong className="text-white block">{mod.label} [Class {mod.curLvl}]</strong>
                                  {mod.key==='armor'&&<small className="block text-cyan-200">Tactical ceramic coverage: {mod.curLvl*20}% of hull skin</small>}
                                  <span className="text-[10px] text-slate-400">
                                    {mod.curLvl > 0 ? mod.table[mod.curLvl - 1]?.name : 'None Installed'}
                                  </span>
                                  <UpgradeComparison kind={mod.key} level={mod.curLvl} current={mod.table[mod.curLvl-1]} next={nextPart}/>
                                </div>

                                {nextPart ? (
                                  <button
                                    onClick={() => {
                                      if (credits < nextPart.buy) {
                                        setShipConfigMessage(`Insufficient funds for ${nextPart.name} (${nextPart.buy.toLocaleString()} M.U. required).`);
                                        gameAudio.playErrorBuzz();
                                        return;
                                      }
                                      const nextCreds = credits - nextPart.buy;
                                      const nextLvl = mod.curLvl + 1;
                                      addBankTransaction(`Purchased ${nextPart.name}`, -nextPart.buy);
                                      mod.setFn(nextLvl);
                                      let newArmor = playerArmorPoints;
                                      if (mod.key === 'armor') {
                                        newArmor = PART_TABLES.armor[mod.curLvl]?.armor || 500;
                                        setPlayerArmorPoints(newArmor);
                                      }
                                      triggerHangarSparks();
                                      gameAudio.playLevelUpStinger();
                                      setShipConfigMessage(`Upgraded ${mod.label} to Class ${nextLvl} (-${nextPart.buy.toLocaleString()} M.U.).`);
                                      handleSaveToSlot(activeSlot, {
                                        credits: nextCreds,
                                        [mod.key === 'engines' ? 'engineClass' : mod.key === 'shielding' ? 'shieldClass' : mod.key === 'armor' ? 'armorClass' : mod.key === 'missiles' ? 'missileClass' : 'laserClass']: nextLvl,
                                        playerArmorPoints: newArmor,
                                      });
                                    }}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded-lg font-black text-xs shadow"
                                  >
                                    Buy Cl.{mod.curLvl + 1} ({nextPart.buy.toLocaleString()} M.U.)
                                  </button>
                                ) : (
                                  <span className="text-emerald-400 font-bold text-[10px]">[MAX CLASS 5]</span>
                                )}
                              </div>
                            );
                          })}
                        </>
                      )}

                      {/* SELL MODE */}
                      {shipConfigMode === 'sell' && (
                        <>
                          {/* Sell Cargo Pod */}
                          <div className="p-3 bg-slate-950/90 rounded-2xl border border-amber-900/80 flex justify-between items-center">
                            <div>
                              <strong className="text-amber-300 block">External Cargo Pods ({cargoPods}/16)</strong>
                              <span className="text-slate-400 text-[10px]">Sell price: 500 M.U. each</span>
                            </div>
                            <button
                              onClick={() => {
                                if (cargoPods <= 0) {
                                  setShipConfigMessage('No cargo pods installed to sell.');
                                  gameAudio.playErrorBuzz();
                                  return;
                                }
                                if (!canRemoveCargoPod(cargoPods, shipCargoVolume(enduriumFuelFrameRef.current, cargoHoldFrameRef.current, artifactsInHold, specimensInHold))) {
                                  setShipConfigMessage('Unload cargo before selling this pod. Remaining ship capacity would be too small.');
                                  gameAudio.playErrorBuzz();
                                  return;
                                }
                                const nextPods = Math.max(0, cargoPods - 1);
                                const nextCreds = credits + 500;
                                setCargoPods(nextPods);
                                addBankTransaction('Sold Cargo Pod', 500);
                                triggerHangarSparks();
                                gameAudio.playCoinPickup();
                                setShipConfigMessage('Sold Cargo Pod (+500 M.U.).');
                                handleSaveToSlot(activeSlot, { cargoPods: nextPods, credits: nextCreds });
                              }}
                              disabled={cargoPods <= 0}
                              className="bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white px-3 py-1.5 rounded-xl font-bold text-xs"
                            >
                              Sell Pod (+500 M.U.)
                            </button>
                          </div>

                          {/* Sell Installed Modules */}
                          {[
                            { key: 'engines', label: 'Engine Drive', curLvl: engineClass, setFn: setEngineClass, table: PART_TABLES.engines },
                            { key: 'shielding', label: 'Shield Harmonizer', curLvl: shieldClass, setFn: setShieldClass, table: PART_TABLES.shielding },
                            { key: 'armor', label: 'Armor Plating', curLvl: armorClass, setFn: setArmorClass, table: PART_TABLES.armor },
                            { key: 'missiles', label: 'Missile Launchers', curLvl: missileClass, setFn: setMissileClass, table: PART_TABLES.missiles },
                            { key: 'lasers', label: 'Pulse Lasers', curLvl: laserClass, setFn: setLaserClass, table: PART_TABLES.lasers },
                          ].map((mod) => {
                            const curPart = mod.curLvl > 0 ? mod.table[mod.curLvl - 1] : null;
                            return (
                              <div key={mod.key} className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex justify-between items-center">
                                <div>
                                  <strong className="text-white block">{mod.label} [Class {mod.curLvl}]</strong>
                                  {mod.key==='armor'&&<small className="block text-cyan-200">Tactical ceramic coverage: {mod.curLvl*20}% of hull skin</small>}
                                  <span className="text-[10px] text-slate-400">
                                    {curPart ? `${curPart.name} • Sell Value: ${curPart.sell.toLocaleString()} M.U.` : 'None Installed'}
                                  </span>
                                </div>

                                {curPart ? (
                                  <button
                                    onClick={() => {
                                      const nextCreds = credits + curPart.sell;
                                      const nextLvl = mod.curLvl - 1;
                                      addBankTransaction(`Sold ${curPart.name}`, curPart.sell);
                                      mod.setFn(nextLvl);
                                      let newArmor = playerArmorPoints;
                                      if (mod.key === 'armor') {
                                        newArmor = nextLvl > 0 ? (PART_TABLES.armor[nextLvl - 1]?.armor || 250) : 250;
                                        setPlayerArmorPoints(newArmor);
                                      }
                                      triggerHangarSparks();
                                      gameAudio.playCoinPickup();
                                      setShipConfigMessage(`Sold ${curPart.name} (+${curPart.sell.toLocaleString()} M.U.).`);
                                      handleSaveToSlot(activeSlot, {
                                        credits: nextCreds,
                                        [mod.key === 'engines' ? 'engineClass' : mod.key === 'shielding' ? 'shieldClass' : mod.key === 'armor' ? 'armorClass' : mod.key === 'missiles' ? 'missileClass' : 'laserClass']: nextLvl,
                                        playerArmorPoints: newArmor,
                                      });
                                    }}
                                    className="bg-amber-700 hover:bg-amber-600 text-white px-3 py-1 rounded-lg font-bold text-xs"
                                  >
                                    Sell (+{curPart.sell.toLocaleString()} M.U.)
                                  </button>
                                ) : (
                                  <span className="text-slate-500 font-bold text-[10px]">[NONE INSTALLED]</span>
                                )}
                              </div>
                            );
                          })}
                        </>
                      )}

                      {/* REPAIR MODE */}
                      {shipConfigMode === 'repair' && (
                        <div className="space-y-3">
                          {repairBreakdown.isFullyRepaired ? (
                            <div className="p-6 bg-slate-950/90 rounded-2xl border border-emerald-500/80 text-center space-y-2">
                              <CheckCircle size={32} className="text-emerald-400 mx-auto" />
                              <strong className="text-sm font-black text-white block">
                                All ship systems fully operational. Nothing to repair.
                              </strong>
                              <p className="text-slate-400 text-xs">
                                Hull, armor, engines, sensors, transceivers, shields and weapon systems are at 100% nominal integrity.
                              </p>
                            </div>
                          ) : (
                            <div className="p-4 bg-slate-950/90 rounded-2xl border border-purple-900/80 space-y-3">
                              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <strong className="text-purple-300 font-bold text-xs">ITEMIZED REPAIR BILL</strong>
                                <span className="text-yellow-400 font-mono font-black text-sm">
                                  Total: {repairBreakdown.totalCost.toLocaleString()} M.U.
                                </span>
                              </div>

                              <div className="space-y-1.5 text-[11px] font-mono">
                                {repairBreakdown.missingArmor > 0 && (
                                  <div className="flex justify-between text-slate-300">
                                    <span>Armor Repair ({repairBreakdown.missingArmor} pts @ 4 M.U./pt):</span>
                                    <span className="text-amber-300 font-bold">{repairBreakdown.armorCost.toLocaleString()} M.U.</span>
                                  </div>
                                )}
                                {repairBreakdown.missingHull > 0 && (
                                  <div className="flex justify-between text-slate-300">
                                    <span>Hull Restoration ({repairBreakdown.missingHull} pts @ 250 M.U./pt):</span>
                                    <span className="text-amber-300 font-bold">{repairBreakdown.hullCost.toLocaleString()} M.U.</span>
                                  </div>
                                )}
                                {repairBreakdown.missingSensors > 0 && (
                                  <div className="flex justify-between text-slate-300">
                                    <span>Sensors Realignment ({repairBreakdown.missingSensors}% @ 100 M.U./%):</span>
                                    <span className="text-amber-300 font-bold">{repairBreakdown.sensorsCost.toLocaleString()} M.U.</span>
                                  </div>
                                )}
                                {repairBreakdown.missingComms > 0 && (
                                  <div className="flex justify-between text-slate-300">
                                    <span>Communications Array ({repairBreakdown.missingComms}% @ 100 M.U./%):</span>
                                    <span className="text-amber-300 font-bold">{repairBreakdown.commsCost.toLocaleString()} M.U.</span>
                                  </div>
                                )}
                                {repairBreakdown.missingEngines > 0 && (
                                  <div className="flex justify-between text-slate-300">
                                    <span>Engines Overhaul ({repairBreakdown.missingEngines}% @ 100 M.U./%):</span>
                                    <span className="text-amber-300 font-bold">{repairBreakdown.enginesCost.toLocaleString()} M.U.</span>
                                  </div>
                                )}
                                {repairBreakdown.missingShields > 0 && (
                                  <div className="flex justify-between text-slate-300">
                                    <span>Shield Generator ({repairBreakdown.missingShields}% @ 100 M.U./%):</span>
                                    <span className="text-amber-300 font-bold">{repairBreakdown.shieldsCost.toLocaleString()} M.U.</span>
                                  </div>
                                )}
                                {repairBreakdown.missingMissiles > 0 && (
                                  <div className="flex justify-between text-slate-300">
                                    <span>Missile Launchers ({repairBreakdown.missingMissiles}% @ 100 M.U./%):</span>
                                    <span className="text-amber-300 font-bold">{repairBreakdown.missilesCost.toLocaleString()} M.U.</span>
                                  </div>
                                )}
                                {repairBreakdown.missingLasers > 0 && (
                                  <div className="flex justify-between text-slate-300">
                                    <span>Pulse Lasers ({repairBreakdown.missingLasers}% @ 100 M.U./%):</span>
                                    <span className="text-amber-300 font-bold">{repairBreakdown.lasersCost.toLocaleString()} M.U.</span>
                                  </div>
                                )}
                                {repairBreakdown.resetSystems.length > 0 && (
                                  <div className="flex justify-between gap-3 text-slate-300">
                                    <span>Subsystem reset ({repairBreakdown.resetSystems.join(', ')}):</span>
                                    <span className="text-emerald-300 font-bold">Included</span>
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => {
                                  if (credits < repairBreakdown.totalCost) {
                                    setShipConfigMessage(`Insufficient funds to repair ship (${repairBreakdown.totalCost.toLocaleString()} M.U. required).`);
                                    gameAudio.playErrorBuzz();
                                    return;
                                  }
                                  const nextCreds = credits - repairBreakdown.totalCost;
                                  addBankTransaction('Starport Drydock Repairs', -repairBreakdown.totalCost);
                                  setHullIntegrity(250);
                                  setPlayerArmorPoints(maxArmorCapacity);
                                  setPlayerShieldPoints(maxShieldCapacity);
                                  const fullSubs = { Engines: 100, Sensors: 100, Comms: 100, Shields: 100, Missiles: 100, Lasers: 100 };
                                  const fullInop = { Engines: false, Sensors: false, Comms: false, Shields: false, Missiles: false, Lasers: false };
                                  setSubsystems(fullSubs);
                                  setInoperativeSystems(fullInop);
                                  triggerHangarSparks();
                                  gameAudio.playLevelUpStinger();
                                  setShipConfigMessage(`All starship systems fully repaired (-${repairBreakdown.totalCost.toLocaleString()} M.U.).`);
                                  handleSaveToSlot(activeSlot, {
                                    credits: nextCreds,
                                    hullIntegrity: 250,
                                    playerArmorPoints: maxArmorCapacity,
                                    playerShieldPoints: maxShieldCapacity,
                                    subsystems: fullSubs,
                                    inoperativeSystems: fullInop,
                                  });
                                }}
                                className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-2"
                              >
                                <Wrench size={14} />
                                Execute Full Drydock Repair ({repairBreakdown.totalCost.toLocaleString()} M.U.)
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SHIP CHRISTENING / NAMING MODAL */}
                  {isNamingShipModal && (
                    <MenuOverlay tone="neutral" zIndex={85}>
                      <div className="w-full max-w-md glass-panel border-2 border-yellow-400 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100">
                        <div className="flex justify-between items-center border-b border-yellow-900/80 pb-2">
                          <h3 className="text-base font-black text-yellow-400 flex items-center gap-2">
                            <Edit3 size={18} />
                            CHRISTEN STARSHIP NAME
                          </h3>
                          <button onClick={() => setIsNamingShipModal(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <div className="space-y-2 text-xs">
                          <label className="text-slate-300 font-bold block">
                            Enter Starship Registry Name (1 to 15 Characters):
                          </label>
                          <input
                            type="text"
                            maxLength={15}
                            placeholder="e.g. ISS Discovery"
                            value={shipNameInput}
                            onChange={(e) => setShipNameInput(e.target.value)}
                            className="w-full bg-slate-900 border border-yellow-400 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-hidden focus:border-yellow-300"
                          />
                          <p className="text-[11px] text-slate-400">
                            The ship name is officially filed on Interstel exploratory charters and is required for orbital launch clearance.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsNamingShipModal(false)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-bold text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              const trimmed = shipNameInput.trim();
                              if (!trimmed) {
                                setShipConfigMessage('Ship name cannot be blank.');
                                gameAudio.playErrorBuzz();
                                return;
                              }
                              setShipName(trimmed);
                              setIsNamingShipModal(false);
                              setDockingBayWarnings((prev) => prev.filter((w) => !w.toLowerCase().includes('christen')));
                              triggerHangarSparks();
                              gameAudio.playConfirmSelect();
                              setShipConfigMessage(`Vessel christened: "${trimmed}".`);
                              addMessage(`Shipyard Registry: Vessel officially named "${trimmed}".`, undefined, 'info');
                              handleSaveToSlot(activeSlot, { shipName: trimmed });
                            }}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-slate-950 py-2.5 rounded-xl font-black text-xs shadow-lg"
                          >
                            Save Name
                          </button>
                        </div>
                      </div>
                    </MenuOverlay>
                  )}
                </div>
              )}

              {/* 6. TRADE DEPOT ROOM (MINERAL CATALOG & 0.1 m³ PRECISION) */}
              {activeRoomIndex === 5 && (() => {
                const totalHold = 50 + 50 * cargoPods;
                const totalUsedCargo = shipCargoVolume(enduriumFuel, cargoHold, artifactsInHold, specimensInHold);
                const freeHoldSpace = Math.max(0, totalHold - totalUsedCargo);
                const tradeStatus = systemMessages.find(message => message.text.startsWith('Trade Depot:'));

                const handleBuyCommodity = (comm: TradeCommodity, rawQty: number) => {
                  if (rawQty <= 0) return;
                  const stepQty = clampPurchaseQuantity(rawQty, credits, comm.buyPrice, freeHoldSpace);

                  if (stepQty <= 0) {
                    if (freeHoldSpace < 0.1) {
                      addMessage('Trade Depot: Cargo hold is full. Install cargo pods in Ship Configuration.', undefined, 'alert');
                    } else {
                      addMessage(`Trade Depot: Insufficient funds to purchase ${comm.name} (${comm.buyPrice.toLocaleString()} M.U./m³).`, undefined, 'alert');
                    }
                    gameAudio.playErrorBuzz();
                    return;
                  }

                  const totalCost = Math.round(stepQty * comm.buyPrice);
                  const nextCreds = credits - totalCost;
                  addBankTransaction(`Purchased ${stepQty.toFixed(1)} m³ ${comm.name}`, -totalCost);

                  let nextFuel = enduriumFuel;
                  let nextHold = { ...cargoHold };

                  if (comm.name === 'Endurium') {
                    nextFuel = enduriumFuel + stepQty;
                    setEnduriumFuel(nextFuel);
                  } else {
                    nextHold = {
                      ...cargoHold,
                      [comm.name]: adjustCargoStock(cargoHold[comm.name] || 0, stepQty),
                    };
                    setCargoHold(nextHold);
                  }

                  gameAudio.playCoinPickup();
                  triggerBanter('buy_mineral');
                  addMessage(`Trade Depot: Purchased ${stepQty.toFixed(1)} m³ ${comm.name} (-${totalCost.toLocaleString()} M.U.).`, undefined, 'info');
                  handleSaveToSlot(activeSlot, { credits: nextCreds, enduriumFuel: nextFuel, cargoHold: nextHold });
                };

                const handleSellCommodity = (comm: TradeCommodity, rawQty: number) => {
                  if (rawQty <= 0) return;
                  const available = comm.name === 'Endurium' ? enduriumFuel : (cargoHold[comm.name] || 0);
                  const stepQty = saleQuantity(rawQty, available);

                  if (stepQty <= 0) {
                    addMessage(`Trade Depot: No ${comm.name} aboard vessel to sell.`, undefined, 'alert');
                    gameAudio.playErrorBuzz();
                    return;
                  }

                  const totalPayout = Math.round(stepQty * comm.sellPrice);
                  const nextCreds = credits + totalPayout;
                  addBankTransaction(`Sold ${stepQty.toFixed(1)} m³ ${comm.name}`, totalPayout);

                  let nextFuel = enduriumFuel;
                  let nextHold = { ...cargoHold };

                  if (comm.name === 'Endurium') {
                    nextFuel = consumeFuel(enduriumFuel, stepQty);
                    setEnduriumFuel(nextFuel);
                  } else {
                    nextHold = {
                      ...cargoHold,
                      [comm.name]: adjustCargoStock(cargoHold[comm.name] || 0, -stepQty),
                    };
                    setCargoHold(nextHold);
                  }

                  gameAudio.playCoinPickup();
                  triggerBanter('sell_mineral');
                  addMessage(`Trade Depot: Sold ${stepQty.toFixed(1)} m³ ${comm.name} (+${totalPayout.toLocaleString()} M.U.).`, undefined, 'info');
                  handleSaveToSlot(activeSlot, { credits: nextCreds, enduriumFuel: nextFuel, cargoHold: nextHold });
                };

                return (
                  <div className="space-y-4 text-xs">
                    {tradeStatus && (
                      <div role="status" className={`p-2.5 rounded-xl border font-bold ${tradeStatus.type === 'alert' ? 'bg-red-950/80 border-red-500 text-red-200' : 'bg-emerald-950/80 border-emerald-600 text-emerald-200'}`}>
                        {tradeStatus.text}
                      </div>
                    )}
                    {/* Hold Status Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/90 p-3 rounded-2xl border border-cyan-800/80 shadow-inner">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500 text-cyan-300">
                          <Package size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">CARGO CAPACITY</span>
                          <strong className="text-white text-sm font-mono">
                            {totalUsedCargo.toFixed(1)} / {totalHold} m³
                          </strong>
                          <span className="text-slate-400 text-[11px] ml-2 font-mono">
                            (Free Space: <strong className="text-emerald-400">{(Math.floor((freeHoldSpace + 1e-9) * 10) / 10).toFixed(1)} m³</strong>)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold">Trading Step Amount:</span>
                        <div className="flex items-center gap-1">
                          {[0.1, 1.0, 5.0, 10.0].map((stepVal) => (
                            <button
                              key={stepVal}
                              onClick={() => {
                                setTradeQuantity(stepVal);
                                gameAudio.playCrispClick();
                              }}
                              className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                                tradeQuantity === stepVal ? 'bg-cyan-600 text-white shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              {stepVal.toFixed(1)} m³
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-b border-cyan-900/60 pb-2">
                      <button
                        onClick={() => setTradeSubTab('minerals')}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 ${
                          tradeSubTab === 'minerals' ? 'bg-cyan-600 text-white shadow' : 'bg-slate-900 text-slate-300'
                        }`}
                      >
                        <Fuel size={14} />
                        Minerals ({MINERAL_CATALOG.length})
                      </button>
                      <button
                        onClick={() => setTradeSubTab('artifacts')}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 ${
                          tradeSubTab === 'artifacts' ? 'bg-amber-600 text-white shadow' : 'bg-slate-900 text-slate-300'
                        }`}
                      >
                        <Sparkles size={14} />
                        Precursor Relics ({artifactsInHold.length})
                      </button>
                      <button
                        onClick={() => setTradeSubTab('specimens')}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 ${
                          tradeSubTab === 'specimens' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-900 text-slate-300'
                        }`}
                      >
                        <Heart size={14} />
                        Captured Specimens ({specimensInHold.length})
                      </button>
                    </div>

                    {tradeSubTab === 'specimens' && (
                      <div className="space-y-3">
                        {specimensInHold.length === 0 ? (
                          <div className="text-slate-400 italic py-6 text-center">
                            No captured biological specimens currently stored in starship hold. Capture stunned lifeforms using the Terrain Vehicle specimen cage!
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                            {specimensInHold.map((spec, sIdx) => (
                              <div key={spec.id || sIdx} className="p-3 bg-slate-950/90 rounded-2xl border border-emerald-900/80 flex flex-col justify-between gap-2 shadow-inner">
                                <div>
                                  <div className="flex justify-between items-center">
                                    <strong className="text-emerald-400 text-xs">{spec.name}</strong>
                                    <span className="text-[10px] text-slate-400 font-mono">{spec.volume.toFixed(1)} m³</span>
                                  </div>
                                  <p className="text-[11px] text-slate-300 mt-1">
                                    Preserved biological specimen catalogued for Interstel biological research archive.
                                  </p>
                                </div>

                                <div className="flex gap-2 items-center justify-between pt-2 border-t border-slate-800">
                                  <span className="text-amber-300 font-mono font-bold text-xs">
                                    Bounty: {spec.value.toLocaleString()} M.U.
                                  </span>
                                  <button
                                    onClick={() => {
                                      const payout = spec.value;
                                      const nextCreds = credits + payout;
                                      const nextSpecimens = specimensInHold.filter((_, i) => i !== sIdx);
                                      setSpecimensInHold(nextSpecimens);
                                      addBankTransaction(`Sold Specimen (${spec.name})`, payout);
                                      gameAudio.playCoinPickup();
                                      addMessage(`Trade Depot: Sold specimen ${spec.name} for ${payout.toLocaleString()} M.U. bounty grant.`, undefined, 'info');
                                      handleSaveToSlot(activeSlot, { credits: nextCreds, specimensInHold: nextSpecimens });
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg font-black text-[11px]"
                                  >
                                    Sell Specimen
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {tradeSubTab === 'minerals' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                        {marketCommodities(stardateDay, stardateMonth, stardateYear).map((comm) => {
                          const isEndurium = comm.name === 'Endurium';
                          const inHold = isEndurium ? enduriumFuel : (cargoHold[comm.name] || 0);

                          return (
                            <div
                              key={comm.name}
                              className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 shadow-inner ${
                                isEndurium ? 'bg-blue-950/80 border-cyan-400 shadow-[0_0_12px_#00f0ff40]' : 'bg-slate-950/90 border-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    style={{ borderColor: comm.color, backgroundColor: `${comm.color}22` }}
                                    className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-xs ${
                                      isEndurium ? 'animate-pulse text-cyan-300 shadow-[0_0_8px_#00f0ff]' : 'text-slate-200'
                                    }`}
                                  >
                                    {comm.symbol}
                                  </div>
                                  <div>
                                    <strong className="text-white text-xs block font-bold">{comm.name}</strong>
                                    <span className="text-[10px] text-amber-300 font-mono">
                                      Buy: {comm.buyPrice} • Sell: {comm.sellPrice} M.U./m³
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 block">Aboard:</span>
                                  <strong className="text-xs font-mono text-cyan-300">{inHold.toFixed(2)} m³</strong>
                                </div>
                              </div>

                              <p className="text-[11px] text-slate-300 line-clamp-1">{comm.desc}</p>

                              <div className="flex gap-2 pt-1 border-t border-slate-800">
                                <button
                                  onClick={() => handleBuyCommodity(comm, tradeQuantity)}
                                  aria-label={`Buy ${tradeQuantity.toFixed(1)} m³ ${comm.name}`}
                                  className="flex-1 bg-cyan-700 hover:bg-cyan-600 text-white py-1.5 rounded-xl font-black text-xs shadow flex items-center justify-center gap-1"
                                >
                                  Buy {tradeQuantity.toFixed(1)}m³
                                </button>
                                <button
                                  onClick={() => handleSellCommodity(comm, tradeQuantity)}
                                  aria-label={`Sell ${tradeQuantity.toFixed(1)} m³ ${comm.name}`}
                                  disabled={inHold < 0.1}
                                  className="flex-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white py-1.5 rounded-xl font-black text-xs shadow flex items-center justify-center gap-1"
                                >
                                  Sell {tradeQuantity.toFixed(1)}m³
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {tradeSubTab === 'artifacts' && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300">Available from the depot</h3>
                        {tradeDepotMessage && <p role="status" className="rounded-xl border border-cyan-800 bg-slate-950 p-2 text-xs text-cyan-100">{tradeDepotMessage}</p>}
                        {artifactStock.length===0 ? <p className="text-xs text-slate-400">No artifacts in depot stock. Sold artifacts remain available to buy back.</p> : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {artifactStock.map(entry=>(
                              <div key={entry.stockId} className="p-3 bg-slate-950/90 rounded-2xl border border-cyan-900/80 space-y-2">
                                <div className="flex items-center justify-between gap-2"><strong className="text-cyan-200 text-xs">{entry.artifact.appraised?entry.artifact.realName:entry.artifact.codeName}</strong><span className="text-[10px] text-slate-400">{entry.artifact.volume} m³</span></div>
                                <p className="text-[11px] text-slate-300">{entry.artifact.description}</p>
                                <div className="flex items-center justify-between gap-2"><span className="text-xs text-amber-300 font-mono">{entry.price.toLocaleString()} M.U.</span>
                                  <button className="bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-1 rounded-lg font-black text-xs"
                                    aria-label={`Buy ${entry.artifact.realName}`}
                                    onClick={()=>{
                                      const occupied=shipCargoVolume(enduriumFuelFrameRef.current,cargoHoldFrameRef.current,artifactsInHoldRef.current,specimensInHoldRef.current);
                                      const purchase=buyDepotArtifact(artifactStockFrameRef.current,entry.stockId,creditsLiveRef.current,50+cargoPods*50-occupied);
                                      if(!purchase.ok) {setTradeDepotMessage(purchase.reason);gameAudio.playErrorBuzz();return;}
                                      const nextArts=[...artifactsInHoldRef.current,purchase.artifact];
                                      artifactsInHoldRef.current=nextArts;
                                      setArtifactStock(purchase.stock);
                                      setArtifactsInHold(nextArts);
                                      addBankTransaction(`Purchased Artifact (${purchase.artifact.realName})`,-purchase.spent);
                                      setTradeDepotMessage(`${purchase.artifact.realName} loaded into the ship's hold.`);
                                      gameAudio.playCoinPickup();
                                      handleSaveToSlot(activeSlot,{credits:creditsLiveRef.current,artifactsInHold:nextArts});
                                    }}>Buy</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">Artifacts in your hold</h3>
                        {artifactsInHold.length === 0 ? (
                          <div className="text-slate-400 italic py-6 text-center">
                            No Precursor artifacts currently stored in cargo hold. Recover relics from uncharted planet ruins!
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                            {artifactsInHold.map((art,artIndex) => (
                              <div key={`${art.id}-${artIndex}`} className="p-3 bg-slate-950/90 rounded-2xl border border-amber-900/80 flex flex-col justify-between gap-2 shadow-inner">
                                <div>
                                  <div className="flex justify-between items-center">
                                    <strong className="text-yellow-400 text-xs">{art.appraised ? art.realName : art.codeName}</strong>
                                    <span className="text-[10px] text-slate-400 font-mono">{art.volume} m³</span>
                                  </div>
                                  <p className="text-[11px] text-slate-300 mt-1">{art.description}</p>
                                </div>

                                <div className="flex gap-2 items-center justify-between pt-2 border-t border-slate-800">
                                  {!art.appraised ? (
                                    <button
                                      onClick={() => {
                                        if(art.appraised) return;
                                        if (creditsLiveRef.current < 500) {
                                          gameAudio.playErrorBuzz();
                                          addMessage('Trade Depot: Insufficient funds for artifact appraisal (500 M.U. required).', undefined, 'alert');
                                          return;
                                        }
                                        addBankTransaction(`Artifact Appraisal (${art.codeName})`, -500);
                                        art.appraised = true;
                                        const nextArts = [...artifactsInHold];
                                        setArtifactsInHold(nextArts);
                                        gameAudio.playLevelUpStinger();
                                        triggerBanter('appraise_artifact');
                                        handleSaveToSlot(activeSlot, { credits: creditsLiveRef.current, artifactsInHold: nextArts });
                                      }}
                                      className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-lg font-bold text-[11px]"
                                    >
                                      Appraise (500 M.U.)
                                    </button>
                                  ) : (
                                    <span className="text-emerald-400 font-mono font-bold text-xs">
                                      Appraised Value: {art.basePrice.toLocaleString()} M.U.
                                    </span>
                                  )}

                                  <button
                                    onClick={() => {
                                      const liveIndex=artifactsInHoldRef.current.indexOf(art);
                                      if(liveIndex<0) return;
                                      const payout = art.basePrice;
                                      const nextArts = artifactsInHoldRef.current.filter((_,index) => index !== liveIndex);
                                      artifactsInHoldRef.current=nextArts;
                                      addBankTransaction(`Sold Artifact (${art.realName})`, payout);
                                      setArtifactStock(stock=>[...stock,depotSale(art,`depot-${Date.now()}-${Math.random().toString(36).slice(2)}`)]);
                                      setArtifactsInHold(nextArts);
                                      gameAudio.playCoinPickup();
                                      triggerBanter('sell_artifact');
                                      handleSaveToSlot(activeSlot, { credits: creditsLiveRef.current, artifactsInHold: nextArts });
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg font-black text-[11px]"
                                  >
                                    Sell Relic
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 7. DOCKING BAY ROOM (EXACTLY ONE SHIP GRAPHIC, COMPACT VERTICAL SPACING & CLEAN FIT) */}
              {activeRoomIndex === 6 && (
                <div className="space-y-3 text-xs">
                  {/* Single Modular Starship Visualizer on Launch Gantry (Unified with Ship Configuration) */}
                  <div className="bg-slate-950/90 p-4 rounded-2xl border border-cyan-900/80 flex flex-col items-center justify-between relative overflow-hidden shadow-inner min-h-[320px] md:min-h-[350px]">
                    <span className="self-start font-bold text-cyan-300 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1.5 z-10">
                      <Rocket size={14} className="text-yellow-400" />
                      VESSEL LAUNCH GANTRY • {shipName ? shipName.toUpperCase() : 'UNCHRISTENED VESSEL'}
                    </span>
                    <div className="w-full flex-1 flex items-center justify-center relative min-h-[260px]">
                      <canvas
                        style={{ width: '100%', height: '280px' }}
                        className="rounded-xl filter drop-shadow-[0_0_15px_#00f0ff35]"
                        ref={(dockingBayCanvas) => {
                          dockingBayCanvasRef.current = dockingBayCanvas;
                          renderGantryShipCanvas(
                            dockingBayCanvas,
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
                        }}
                      />
                    </div>
                  </div>

                  {/* Departure Readiness Checklist */}
                  <div className="bg-slate-950/90 p-2.5 rounded-2xl border border-cyan-900/80 flex flex-col gap-1.5 shadow-inner">
                    <span className="font-extrabold text-cyan-300 text-xs flex items-center gap-1.5 tracking-wider uppercase">
                      <CheckCircle size={14} className="text-emerald-400" />
                      PRE-FLIGHT DEPARTURE STATUS
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-slate-300">
                      <div className="p-1.5 bg-slate-900 rounded-xl">
                        <span className="text-slate-400 block text-[9px]">Hull Integrity</span>
                        <strong className={hullIntegrity >= 250 ? 'text-emerald-400 text-xs' : 'text-yellow-400 text-xs'}>
                          {+hullIntegrity.toFixed(2)}/250 pts
                        </strong>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded-xl">
                        <span className="text-slate-400 block text-[9px]">Endurium Fuel</span>
                        <strong className={enduriumFuel > 0 ? 'text-amber-400 text-xs font-mono' : 'text-red-400 text-xs font-mono'}>
                          {enduriumFuel.toFixed(1)} m³
                        </strong>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded-xl">
                        <span className="text-slate-400 block text-[9px]">Bridge Crew</span>
                        <strong className={certifiedCrewCount === CREW_POSTS.length ? 'text-emerald-400 text-xs' : 'text-red-400 text-xs'}>
                          {certifiedCrewCount}/6 Certified
                        </strong>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded-xl">
                        <span className="text-slate-400 block text-[9px]">Mass & Accel</span>
                        <strong className="text-cyan-300 text-xs font-mono">
                          {totalShipMass} t • {shipAcceleration} G
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Red Warning Box displayed right above Launch button (Rule 5) */}
                  {dockingBayWarnings.length > 0 && (
                    <div className="p-2.5 bg-red-950/95 border-2 border-red-500 rounded-xl text-red-200 font-bold space-y-1 shadow-[0_0_15px_#ef444440] animate-pulse">
                      <div className="flex items-center gap-1.5 text-yellow-300 font-black text-xs uppercase border-b border-red-800 pb-0.5">
                        <AlertTriangle size={14} className="text-red-400" />
                        LAUNCH CLEARANCE DENIED
                      </div>
                      <ul className="space-y-0.5 text-[11px]">
                        {dockingBayWarnings.map((msg, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-red-400 font-bold">▶</span>
                            <span>{msg}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Primary Launch Action Button */}
                  <button
                    onClick={handleDockingBayLaunch}
                    disabled={isReleasingClamps}
                    className={`w-full py-2.5 rounded-xl font-black text-xs md:text-sm shadow-2xl flex items-center justify-center gap-2 transition ${
                      isReleasingClamps
                        ? 'bg-amber-600 text-amber-100 border border-amber-400 animate-pulse cursor-wait'
                        : 'bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white hover:scale-[1.01]'
                    }`}
                  >
                    <Rocket size={18} className={isReleasingClamps ? 'text-amber-200 animate-bounce' : 'text-yellow-300'} />
                    {isReleasingClamps ? 'RELEASING GANTRY CLAMPS...' : 'CLEAR GANTRY & LAUNCH TO SPACE'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* 3-PANEL SPACE & ENCOUNTER LAYOUT */}
        {(gameLocation as GameLocation) !== 'Starport' && (
          <div data-flight-layout="true" data-science-focus={gameLocation==='In Orbit'&&activeConsoleMenu==='Science'} className="flex-1 min-h-0 w-full flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-[#030712]">
            {/* LEFT MAIN VIEW & BRIDGE CONSOLE */}
            <div className="flight-main w-full flex flex-col shrink-0 lg:shrink lg:flex-1 min-h-0">
              <div className="flight-scene w-full h-[min(50vh,420px)] min-h-[240px] shrink-0 lg:flex-1 lg:h-auto lg:min-h-0 relative overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full block cursor-crosshair"
                  onClick={(e) => {
                    if (cinematicStateRef.current !== 'none') {
                      const curCin = cinematicStateRef.current;
                      if (curCin === 'launch') completeLaunchToSpace();
                      else if (curCin === 'dock') completeDockingToStarport();
                      else if (curCin === 'descent') completeDescentToPlanet();
                      else if (curCin === 'surface_launch') completeSurfaceLaunchToOrbit();
                      return;
                    }

                    if ((gameLocation as GameLocation) === 'Terrain Vehicle') {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const clickY = e.clientY - rect.top;
                      const curW = rect.width > 0 ? rect.width : canvasWidth;
                      const curH = rect.height > 0 ? rect.height : canvasHeight;
                      const worldScale = 38*groundZoomRef.current; // presentation zoom; world distances unchanged
                      const targetX = vehicleX + (clickX - curW / 2) / worldScale;
                      const targetY = vehicleY + (clickY - curH / 2) / worldScale;
                      setRoverWaypoint({ x: +(targetX.toFixed(2)), y: +(targetY.toFixed(2)) });
                      gameAudio.playConfirmSelect();
                      addMessage(`Rover auto-drive destination set to [${targetX.toFixed(2)} km, ${targetY.toFixed(2)} km].`, 'Captain', 'info');
                      return;
                    }

                    if ((gameLocation as GameLocation) === 'Landing') {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const curW = rect.width > 0 ? Math.round(rect.width) : canvasWidth;
                      const curH = rect.height > 0 ? Math.round(rect.height) : canvasHeight;
                      const clickX = (e.clientX - rect.left) * curW / Math.max(1,rect.width);
                      const clickY = (e.clientY - rect.top) * curH / Math.max(1,rect.height);

                      const point=landingMapPoint(curW,curH,clickX,clickY);
                      if (point) {
                        setLandingLong(point.lon);
                        setLandingLat(point.lat);
                        gameAudio.playCrispClick();
                      }
                    }
                  }}
                />

                {(gameLocation==='On Planet'||gameLocation==='Terrain Vehicle')&&<div role="group" aria-label="Ground view controls" className="absolute top-3 right-3 z-20 flex flex-wrap gap-2 rounded-xl border border-cyan-700 bg-slate-950/90 p-2 text-xs">
                  <button aria-label="Zoom out ground" disabled={groundZoom<=.4} onClick={()=>setGroundZoom(z=>clampGroundZoom(z/1.25))}>−</button><span>{Math.round(groundZoom*100)}%</span><button aria-label="Zoom in ground" disabled={groundZoom>=1.4} onClick={()=>setGroundZoom(z=>clampGroundZoom(z*1.25))}>+</button><button onClick={()=>setGroundZoom(1)}>Reset view</button>
                </div>}
                {gameLocation==='Star System'&&<div className="system-focus-control">
                  <label htmlFor="system-focus">Navigation focus</label>
                  <select id="system-focus" value={systemFocusIndex??''} onChange={e=>setSystemFocusIndex(e.target.value===''?null:Number(e.target.value))}>
                    <option value="">All planets</option>
                    {currentStar.planets.filter(p=>!destroyedPlanetKeys.includes(planetKey(currentStar.x,currentStar.y,p.orderIndex))).map((p,i)=><option key={p.orderIndex} value={i}>{p.name}</option>)}
                  </select>
                  <span>{nearbyPlanet?`${nearbyPlanet.name}: ${nearbyPlanet.isHomeworld?'Dock':'Orbit'} available`:'Approach a planet for Orbit / Dock'}</span>
                </div>}
                {/* Star System Zoom Controls (+ / - buttons and zoom indicator) */}
                {gameLocation === 'Star System' && (
                  <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-1.5 glass-panel p-1.5 rounded-2xl border border-cyan-500/40 shadow-xl select-none">
                    <button
                      onClick={() => {
                        setSystemZoom((z) => Math.min(8.0, +(z * 1.35).toFixed(2)));
                        gameAudio.playHoverMicroTone();
                      }}
                      disabled={systemZoom >= 8.0}
                      title="Zoom In (+)"
                      aria-label="Zoom In"
                      className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-cyan-600 disabled:opacity-40 text-cyan-300 hover:text-white border border-cyan-700/60 flex items-center justify-center font-bold text-base transition shadow active:scale-95"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSystemZoom((z) => Math.max(0.65, +(z / 1.35).toFixed(2)));
                        gameAudio.playHoverMicroTone();
                      }}
                      disabled={systemZoom <= 0.65}
                      title="Zoom Out (-)"
                      aria-label="Zoom Out"
                      className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-cyan-600 disabled:opacity-40 text-cyan-300 hover:text-white border border-cyan-700/60 flex items-center justify-center font-black text-base transition shadow active:scale-95"
                    >
                      <span className="text-base font-black leading-none mb-0.5">−</span>
                    </button>
                    <button
                      onClick={() => {
                        setSystemZoom((z) => (z > 2.0 ? 0.65 : 8.0));
                        gameAudio.playHoverMicroTone();
                      }}
                      title={systemZoom > 2.0 ? 'Reset to Overview' : 'Zoom into Ship'}
                      className="px-1.5 py-0.5 rounded-lg bg-slate-950 text-[10px] font-mono font-bold text-yellow-400 border border-slate-800 hover:border-yellow-400/60 transition"
                    >
                      {systemZoom.toFixed(1)}x
                    </button>
                  </div>
                )}

                {/* Hyperspace Zoom Controls (+ / - / RESET buttons) */}
                {gameLocation === 'Hyperspace' && (
                  <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-1.5 glass-panel p-1.5 rounded-2xl border border-cyan-500/40 shadow-xl select-none">
                    <button
                      onClick={() => {
                        setHyperZoom((z) => Math.min(6.0, +(z * 1.25).toFixed(2)));
                        gameAudio.playHoverMicroTone();
                      }}
                      disabled={hyperZoom >= 6.0}
                      title="Zoom In (+)"
                      aria-label="Zoom In"
                      className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-cyan-600 disabled:opacity-40 text-cyan-300 hover:text-white border border-cyan-700/60 flex items-center justify-center font-bold text-base transition shadow active:scale-95"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setHyperZoom((z) => Math.max(1.0, +(z / 1.25).toFixed(2)));
                        gameAudio.playHoverMicroTone();
                      }}
                      disabled={hyperZoom <= 1.0}
                      title="Zoom Out (-)"
                      aria-label="Zoom Out"
                      className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-cyan-600 disabled:opacity-40 text-cyan-300 hover:text-white border border-cyan-700/60 flex items-center justify-center font-black text-base transition shadow active:scale-95"
                    >
                      <span className="text-base font-black leading-none mb-0.5">−</span>
                    </button>
                    <button
                      onClick={() => {
                        setHyperZoom(2.5);
                        gameAudio.playHoverMicroTone();
                      }}
                      title="Reset Zoom to 2.5x"
                      aria-label="Reset Zoom"
                      className="px-1.5 py-1 rounded-lg bg-slate-950 text-[9px] font-mono font-bold text-yellow-400 border border-slate-800 hover:border-yellow-400/60 transition flex flex-col items-center leading-none"
                    >
                      <span>{hyperZoom.toFixed(1)}x</span>
                      <span className="text-[7px] text-cyan-400 font-extrabold mt-0.5">RESET</span>
                    </button>
                  </div>
                )}
              </div>

              {/* BRIDGE CONSOLE WITH OFFICER BADGE */}
              <div role="region" aria-label="Bridge console" tabIndex={0} className="bridge-console-panel w-full glass-panel p-3 flex flex-col gap-2 shrink-0 relative">
                <DevUiTag id="#bridge-console" color="yellow" />
                {/* 1. LANDING SCREEN TELEMETRY & CONTROLS */}
                {(gameLocation as GameLocation) === 'Landing' && (
                  <div className="flex flex-col gap-2.5">
                    <SurveyLegend/>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-900/60 pb-1.5 text-xs">
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <CrosshairIcon size={16} />
                        <span>TARGET COORDINATES:</span>
                        <span className="text-white font-mono bg-slate-950 px-2 py-0.5 rounded border border-amber-500/50">
                          {landingLat >= 0 ? `${+landingLat.toFixed(2)}°N` : `${+Math.abs(landingLat).toFixed(2)}°S`} {landingLong >= 0 ? `${+landingLong.toFixed(2)}°E` : `${+Math.abs(landingLong).toFixed(2)}°W`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Descent Fuel Burn:</span>
                        <strong className="text-amber-400 font-mono">{calculatedLandingFuel} m³ Endurium</strong>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setLandingLat((l) => Math.min(90, l + 5))}
                          className="bg-slate-900 border border-slate-700 text-cyan-300 px-2.5 py-1 rounded text-xs font-bold hover:bg-slate-800"
                        >
                          +5° Lat ▲
                        </button>
                        <button
                          onClick={() => setLandingLat((l) => Math.max(-90, l - 5))}
                          className="bg-slate-900 border border-slate-700 text-cyan-300 px-2.5 py-1 rounded text-xs font-bold hover:bg-slate-800"
                        >
                          -5° Lat ▼
                        </button>
                        <button
                          onClick={() => setLandingLong((l) => (l - 5 < -180 ? 175 : l - 5))}
                          className="bg-slate-900 border border-slate-700 text-cyan-300 px-2.5 py-1 rounded text-xs font-bold hover:bg-slate-800"
                        >
                          -5° Long ◀
                        </button>
                        <button
                          onClick={() => setLandingLong((l) => (l + 5 > 180 ? -175 : l + 5))}
                          className="bg-slate-900 border border-slate-700 text-cyan-300 px-2.5 py-1 rounded text-xs font-bold hover:bg-slate-800"
                        >
                          +5° Long ▶
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setGameLocation('In Orbit');
                            gameAudio.playCrispClick();
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-yellow-400 px-4 py-2 rounded-xl text-xs font-bold"
                        >
                          Cancel / Orbit ↩
                        </button>
                        <button
                          onClick={handleInitiateDescent}
                          className="bg-linear-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 px-6 py-2 rounded-xl font-black text-xs shadow-xl flex items-center gap-1.5 animate-pulse"
                        >
                          <Rocket size={15} />
                          INITIATE DESCENT BURN
                        </button>
                      </div>
                    </div>
                    {orbitPlanetIndex!==null&&<details className="survey-global-details"><summary>Recorded survey contacts · choose a landing target</summary><SurveyPanel contacts={visibleSurveyContacts(planetSurfacesRef.current[planetKey(currentStar.x,currentStar.y,currentPlanets[orbitPlanetIndex].orderIndex)])} seed={(currentStar.x*73856093)^(currentStar.y*19349663)^(currentPlanets[orbitPlanetIndex].slot*83492791)} water={currentPlanets[orbitPlanetIndex].hydrospherePercent} type={currentPlanets[orbitPlanetIndex].type} target={{lat:landingLat,lon:landingLong}} sampledRegions={planetSurfacesRef.current[planetKey(currentStar.x,currentStar.y,currentPlanets[orbitPlanetIndex].orderIndex)]?.survey?.sampledRegions??0} onSelect={c=>{setLandingLat(c.lat);setLandingLong(c.lon);}}/></details>}
                  </div>
                )}

                {/* 2. ON PLANET STARSHIP ACTIONS */}
                {(gameLocation as GameLocation) === 'On Planet' && (
                  <div className="flex flex-col gap-2">
                    <div className="bridge-station-header flex items-center justify-between border-b border-cyan-900/60 pb-1.5 text-xs font-bold">
                      <span className="text-emerald-300 flex items-center gap-1.5 uppercase">
                        <Anchor size={14} />
                        STARSHIP BASE CAMP • [LANDED AT {landingLat >= 0 ? `${+landingLat.toFixed(2)}N` : `${+Math.abs(landingLat).toFixed(2)}S`} {landingLong >= 0 ? `${+landingLong.toFixed(2)}E` : `${+Math.abs(landingLong).toFixed(2)}W`}]
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs [&_button:disabled]:opacity-40 [&_button:disabled]:cursor-not-allowed">
                      <button
                        onClick={handleDisembarkRover}
                        disabled={vehicleDestroyed}
                        className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-2.5 rounded-xl font-black shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <Truck size={15} />
                        Disembark Rover
                      </button>
                      <button
                        onClick={handleLaunchFromPlanet}
                        disabled={enduriumFuel<calculatedLandingFuel}
                        className="bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white p-2.5 rounded-xl font-black shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <Rocket size={15} />
                        Launch to Orbit ({calculatedLandingFuel} m³)
                      </button>
                      <button
                        onClick={() => {
                          setIsSurfaceMapOpen(true);
                          gameAudio.playConfirmSelect();
                        }}
                        className="bg-slate-900 hover:bg-slate-800 border border-cyan-600 text-cyan-300 p-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5"
                      >
                        <Globe size={15} />
                        Surface Topo Map
                      </button>
                      <button
                        onClick={() => {
                          addMessage(`Starship status: Landed nominal. Hydraulic anchors locked. Fuel: ${enduriumFuel.toFixed(2)} m³.`, 'Engineer', 'info');
                          gameAudio.playCrispClick();
                        }}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 p-2.5 rounded-xl font-bold"
                      >
                        Base Diagnostics
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. TERRAIN VEHICLE 6 CANONICAL ACTIONS (MAP, MOVE, CARGO, LOOK, SCAN, WEAPON) */}
                {(gameLocation as GameLocation) === 'Terrain Vehicle' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between border-b border-cyan-900/60 pb-1.5 text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-yellow-400" />
                        <span className="text-cyan-300 tracking-wider">
                          ROVER COORD: [{vehicleX.toFixed(1)} km, {vehicleY.toFixed(1)} km] • DIST TO SHIP: {Math.hypot(vehicleX, vehicleY).toFixed(1)} km
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={returnToShip} disabled={!returnToShipAvailable(vehicleX,vehicleY,vehicleFuel,vehicleDestroyed)} className="rounded-lg border border-cyan-700 px-3 py-1 disabled:opacity-40">Return to ship</button>
                        <button onClick={()=>{if(miningSessionRef.current){stopMining();setMiningOpen(true);}else setMiningOpen(open=>!open);}} aria-expanded={miningOpen} className="rounded-lg border border-cyan-500 bg-cyan-950 px-3 py-1 text-cyan-100">Mine [G]</button>
                        <button
                          onClick={() => setRoverCargoModalOpen(true)}
                          className="text-amber-300 font-mono hover:underline flex items-center gap-1"
                        >
                          <Package size={12} />
                          Hold: {vehicleHold.reduce((s, i) => s + i.volume, 0).toFixed(1)} / 50 m³
                        </button>
                        <span className="text-emerald-300 font-mono">
                          Fuel: {vehicleFuel.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {miningOpen&&<MiningConsole deposits={currentSurfaceState?.minerals??[]} x={vehicleX} y={vehicleY} used={vehicleHold.reduce((sum,item)=>sum+item.volume,0)} fuel={vehicleFuel} selectedId={miningTargetId} session={miningSession} lastExtracted={lastMiningExtracted} message={miningMessage} onSelect={id=>{setMiningTargetId(id);setMiningMessage('');}} onReturn={returnToShip} canReturn={returnToShipAvailable(vehicleX,vehicleY,vehicleFuel,vehicleDestroyed)} onStart={startMining} onStop={()=>stopMining()} onClose={()=>{stopMining();setMiningOpen(false);}} onApproach={target=>{
                      stopMining();setMiningTargetId(target.id);const dx=vehicleX-target.x,dy=vehicleY-target.y,d=Math.hypot(dx,dy)||1;
                      setRoverWaypoint({x:target.x+dx/d*4.5,y:target.y+dy/d*4.5});setMiningMessage('Approaching deposit. Manual steering cancels auto-drive; start mining when in range.');
                    }}/ >}
                    <div role="group" aria-label="Rover controls" className="[&_button:disabled]:opacity-40 [&_button:disabled]:cursor-not-allowed flex flex-wrap items-center justify-between gap-2 text-xs">
                      {/* 6 CANONICAL ACTION BUTTONS OR WEAPONS / CARGO SUB-MENUS */}
                      {surfaceRecording && (
                        <div role="status" className="w-full flex flex-wrap items-center gap-2 rounded-xl border border-cyan-700 bg-cyan-950/80 p-2 text-xs text-cyan-200">
                          <Database size={15}/>
                          <span>{surfaceRecording.interruptedFor>0?'Recording delayed by lifeform attack':`Recording lifeform · ${Math.max(0,surfaceRecording.remaining).toFixed(1)} s · Tracking assist (steer to override)`}</span>
                          <progress aria-label="Lifeform recording progress" max={RECORDING_SECONDS} value={RECORDING_SECONDS-surfaceRecording.remaining} className="min-w-20 flex-1 accent-cyan-400"/>
                          <button onClick={()=>{setSurfaceRecording(null);handleSaveToSlot(activeSlot);}} className="rounded-lg bg-slate-800 px-3 py-1 font-bold">Cancel recording</button>
                        </div>
                      )}
                      {roverWeaponMenuOpen ? (
                        <div className="grid grid-cols-3 gap-2 w-full flex-none md:w-auto md:flex-1 [&>button]:min-h-11">
                          <button
                            onClick={handleFireSurfaceWeapon}
                            disabled={!currentSurfaceState||vehicleDestroyed||(vehicleWeapon==='Laser'&&!miningSession&&!miningActionAvailable(currentSurfaceState,vehicleX,vehicleY,vehicleHold.reduce((v,i)=>v+i.volume,0),vehicleFuel,miningTargetId))}
                            className={`p-2.5 rounded-xl font-black shadow flex items-center justify-center gap-1.5 text-white animate-pulse ${
                              vehicleWeapon === 'Stunner' ? 'bg-blue-600 hover:bg-blue-500 border border-blue-400' : 'bg-red-600 hover:bg-red-500 border border-red-400'
                            }`}
                          >
                            <Zap size={14} />
                            [Fire] ({vehicleWeapon === 'Stunner' ? 'Stunner' : 'Mining Laser'})
                          </button>
                          <button
                            onClick={() => {
                              setVehicleWeapon((w) => (w === 'Stunner' ? 'Laser' : 'Stunner'));
                              gameAudio.playCrispClick();
                            }}
                            className="bg-slate-900 hover:bg-slate-800 border border-cyan-500/80 text-yellow-300 p-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow"
                          >
                            <Crosshair size={14} />
                            [Switch] ➔ {vehicleWeapon === 'Stunner' ? 'Mining Laser' : 'Stunner'}
                          </button>
                          <button
                            onClick={() => {
                              setRoverWeaponMenuOpen(false);
                              gameAudio.playCrispClick();
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-yellow-400 p-2.5 rounded-xl font-black shadow flex items-center justify-center gap-1.5"
                          >
                            <ArrowLeft size={14} />
                            [Back] ↩
                          </button>
                        </div>
                      ) : roverCargoSubmenuOpen ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full flex-none md:w-auto md:flex-1 [&>button]:min-h-11">
                          <button disabled={!surfacePickupAvailable(currentSurfaceState,vehicleX,vehicleY,vehicleHold.reduce((v,i)=>v+i.volume,0))}
                            onClick={() => {
                              handlePickUpNearby();
                              setRoverCargoSubmenuOpen(false);
                            }}
                            className="bg-emerald-700 hover:bg-emerald-600 border border-emerald-400 text-white p-2.5 rounded-xl font-black shadow flex items-center justify-center gap-1.5"
                          >
                            <Package size={14} />
                            [Pick up]
                          </button>
                          <button
                            onClick={()=>{handleRecordNearbyLifeform();setRoverCargoSubmenuOpen(false);}}
                            disabled={!!surfaceRecording||vehicleFuel<RECORDING_ENERGY||!currentSurfaceState?.lifeforms.some(l=>!l.captured&&!l.recorded&&Math.hypot(l.x-vehicleX,l.y-vehicleY)<=RECORDING_RANGE)}
                            className="bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 border border-cyan-400 text-white p-2.5 rounded-xl font-black shadow flex items-center justify-center gap-1.5"
                          >
                            <Database size={14}/>
                            Record lifeform
                          </button>
                          <button disabled={!vehicleHold.length}
                            onClick={() => {
                              setRoverCargoModalOpen(true);
                              setRoverCargoSubmenuOpen(false);
                              gameAudio.playConfirmSelect();
                            }}
                            className="bg-amber-600 hover:bg-amber-500 border border-amber-300 text-slate-950 p-2.5 rounded-xl font-black shadow flex items-center justify-center gap-1.5"
                          >
                            <Trash2 size={14} />
                            [Drop]
                          </button>
                          <button
                            onClick={() => {
                              setRoverCargoSubmenuOpen(false);
                              gameAudio.playCrispClick();
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-yellow-400 p-2.5 rounded-xl font-black shadow flex items-center justify-center gap-1.5"
                          >
                            <ArrowLeft size={14} />
                            [Back] ↩
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full flex-none md:w-auto md:flex-1 [&>button]:min-h-11">
                          {/* 1. Map */}
                          <button
                            onClick={() => {
                              setIsSurfaceMapOpen(true);
                              gameAudio.playConfirmSelect();
                            }}
                            className="bg-indigo-700 hover:bg-indigo-600 border border-indigo-400 text-white p-2 rounded-xl font-black shadow flex items-center justify-center gap-1"
                          >
                            <Globe size={13} />
                            [Map] [M]
                          </button>

                          {/* 2. Move */}
                          <button disabled={vehicleFuel<=0||vehicleDestroyed}
                            onClick={() => {
                              addMessage('Driving Mode: Steer terrain rover with WASD or Arrow keys.', 'Captain', 'info');
                              gameAudio.playCrispClick();
                            }}
                            className={`p-2 rounded-xl font-black shadow flex items-center justify-center gap-1 transition ${
                              isRoverMoving
                                ? 'bg-emerald-600 text-white border border-emerald-300'
                                : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200'
                            }`}
                          >
                            <Truck size={13} />
                            [Move] [V]
                          </button>

                          {/* 3. Cargo */}
                          <button
                            onClick={() => {
                              setRoverCargoSubmenuOpen(true);
                              gameAudio.playCrispClick();
                            }}
                            className="bg-emerald-700 hover:bg-emerald-600 border border-emerald-400 text-white p-2 rounded-xl font-black shadow flex items-center justify-center gap-1"
                          >
                            <Package size={13} />
                            [Cargo] [C]
                          </button>

                          {/* 4. Look */}
                          <button
                            onClick={handleRoverLook}
                            className="bg-amber-600 hover:bg-amber-500 border border-amber-300 text-slate-950 p-2 rounded-xl font-black shadow flex items-center justify-center gap-1"
                          >
                            <Eye size={13} />
                            [Look] [L]
                          </button>

                          {/* 5. Scan */}
                          <button
                            onClick={handleSurfaceScan}
                            disabled={!currentSurfaceState||subsystems.Sensors<=0||inoperativeSystems.Sensors}
                            className="bg-cyan-700 hover:bg-cyan-600 border border-cyan-400 text-white p-2 rounded-xl font-black shadow flex items-center justify-center gap-1"
                          >
                            <Radio size={13} />
                            [Scan] [Q]
                          </button>

                          {/* 6. Weapon */}
                          <button
                            onClick={() => {
                              setRoverWeaponMenuOpen(true);
                              gameAudio.playConfirmSelect();
                            }}
                            className="bg-red-700 hover:bg-red-600 border border-red-400 text-white p-2 rounded-xl font-black shadow flex items-center justify-center gap-1"
                          >
                            <Zap size={13} />
                            [Weapon] [R]
                          </button>
                        </div>
                      )}

                      {/* Board Starship Button if near ship */}
                      {(vehicleFuel <= 0 || vehicleDestroyed) && (
                        <button
                          onClick={handleRequestDistressTow}
                          className="bg-red-800 hover:bg-red-700 border border-red-500 text-white px-3.5 py-2 rounded-xl font-black shadow-lg flex items-center justify-center gap-1"
                        >
                          <AlertTriangle size={14} />
                          Emergency Recovery
                        </button>
                      )}
                      {Math.hypot(vehicleX, vehicleY) <= 1.5 && (
                        <button
                          onClick={handleBoardStarship}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl font-black shadow-lg flex items-center justify-center gap-1"
                        >
                          <Anchor size={14} />
                          Board Ship [B]
                        </button>
                      )}

                      {/* Mobile Virtual D-Pad for Rover Steering */}
                      {isMobile && (
                        <div className="flex items-center gap-1.5 ml-auto touch-none">
                          <button
                            onPointerDown={() => setActiveDirectionVector({ dx: -1, dy: 0 })}
                            onPointerUp={() => setActiveDirectionVector({ dx: 0, dy: 0 })}
                            onPointerLeave={() => setActiveDirectionVector({ dx: 0, dy: 0 })}
                            className="w-10 h-10 bg-slate-900 border border-cyan-500/60 rounded-xl text-cyan-300 font-black flex items-center justify-center active:scale-95"
                          >
                            ◀
                          </button>
                          <div className="flex flex-col gap-1">
                            <button
                              onPointerDown={() => setActiveDirectionVector({ dx: 0, dy: -1 })}
                              onPointerUp={() => setActiveDirectionVector({ dx: 0, dy: 0 })}
                              onPointerLeave={() => setActiveDirectionVector({ dx: 0, dy: 0 })}
                              className="w-10 h-10 bg-slate-900 border border-cyan-500/60 rounded-xl text-cyan-300 font-black flex items-center justify-center active:scale-95"
                            >
                              ▲
                            </button>
                            <button
                              onPointerDown={() => setActiveDirectionVector({ dx: 0, dy: 1 })}
                              onPointerUp={() => setActiveDirectionVector({ dx: 0, dy: 0 })}
                              onPointerLeave={() => setActiveDirectionVector({ dx: 0, dy: 0 })}
                              className="w-10 h-10 bg-slate-900 border border-cyan-500/60 rounded-xl text-cyan-300 font-black flex items-center justify-center active:scale-95"
                            >
                              ▼
                            </button>
                          </div>
                          <button
                            onPointerDown={() => setActiveDirectionVector({ dx: 1, dy: 0 })}
                            onPointerUp={() => setActiveDirectionVector({ dx: 0, dy: 0 })}
                            onPointerLeave={() => setActiveDirectionVector({ dx: 0, dy: 0 })}
                            className="w-10 h-10 bg-slate-900 border border-cyan-500/60 rounded-xl text-cyan-300 font-black flex items-center justify-center active:scale-95"
                          >
                            ▶
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. STANDARD SPACE BRIDGE CONSOLE */}
                {(gameLocation as GameLocation) !== 'Landing' && (gameLocation as GameLocation) !== 'On Planet' && (gameLocation as GameLocation) !== 'Terrain Vehicle' && (
                  <>
                    <div className="bridge-station-header flex items-center justify-between border-b border-cyan-900/60 pb-1.5 text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <Sliders size={14} className="text-yellow-400" />
                        <span className="text-cyan-300 tracking-wider font-extrabold uppercase">
                          BRIDGE CONSOLE • [{activeConsoleMenu}]
                        </span>
                        {activeStationOfficer?.member && (
                          <div className="bg-slate-950/90 border border-cyan-500/50 px-2.5 py-1 rounded-2xl flex items-center gap-2 shadow-inner">
                            <CrewPortrait
                              member={activeStationOfficer.member}
                              size="sm"
                              inCombat={gameLocation === 'Encounter'}
                              hullCritical={hullIntegrity <= 50}
                            />
                            <div className="text-[11px] leading-tight">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">{activeStationOfficer.post}</span>
                              <strong className="text-white">{activeStationOfficer.member.name}</strong>
                            </div>
                          </div>
                        )}
                      </div>

                      {gameLocation === 'In Orbit' && <button type="button" onClick={breakOrbit} className="bg-emerald-700 hover:bg-emerald-600 border border-emerald-400 text-white px-3 py-2 rounded-lg font-black">Leave Orbit</button>}
                      {gameLocation === 'Star System' && (
                        <button
                          data-testid="bridge-orbit"
                          aria-label="Orbit planet"
                          onClick={() => nearbyPlanet && enterOrbit(nearbyPlanet.index)}
                          disabled={!nearbyPlanet}
                          title={nearbyPlanet ? `Orbit ${nearbyPlanet.name}` : 'Move closer to a planet to establish orbit'}
                          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed border border-cyan-700 text-white px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5"
                        >
                          <Globe size={14} /> [Orbit]
                        </button>
                      )}
                      {activeConsoleMenu !== 'Bridge' && activeConsoleMenu !== 'Maneuver' && (
                        <button
                          onClick={() => {
                            setActiveConsoleMenu('Bridge');
                            gameAudio.playCrispClick();
                          }}
                          className="text-yellow-400 hover:text-white text-xs underline font-bold"
                        >
                          [Return to Bridge]
                        </button>
                      )}
                    </div>

                {activeConsoleMenu === 'Bridge' && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { id: 'Command', label: 'Command', icon: Rocket, color: 'text-amber-400' },
                      { id: 'Science', label: 'Science', icon: Eye, color: 'text-cyan-400' },
                      { id: 'Navigation', label: 'Navigation', icon: Navigation, color: 'text-emerald-400' },
                      { id: 'Engineering', label: 'Engineering', icon: Zap, color: 'text-purple-400' },
                      { id: 'Communications', label: 'Comms', icon: Radio, color: 'text-pink-400' },
                      { id: 'Medical', label: 'Medical', icon: Heart, color: 'text-red-400' },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveConsoleMenu(item.id as BridgeConsoleSubmenu);
                            setEngineeringMode('menu');
                            setMedicalMode('status');
                            gameAudio.playConfirmSelect();
                          }}
                          className="bg-slate-900/90 hover:bg-cyan-900/50 border border-cyan-800/80 hover:border-cyan-400 text-slate-100 p-2.5 rounded-xl font-bold flex flex-col items-center justify-center gap-1.5 text-xs transition min-h-[58px] shadow hover:shadow-[0_0_12px_#00f0ff60]"
                        >
                          <Icon size={16} className={item.color} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 1. COMMAND (CAPTAIN) CONSOLE */}
                {activeConsoleMenu === 'Command' && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {gameLocation === 'In Orbit' && (
                      <button
                        onClick={handleOpenLandingScreen}
                        className="bg-amber-600 hover:bg-amber-500 border border-amber-300 text-slate-950 p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1 animate-pulse"
                      >
                        <Rocket size={14} />
                        [Land]
                      </button>
                    )}
                    {gameLocation === 'On Planet' && (
                      <>
                        <button
                          onClick={handleLaunchFromPlanet}
                          className="bg-cyan-600 hover:bg-cyan-500 border border-cyan-400 text-white p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1"
                        >
                          <Rocket size={14} />
                          [Launch]
                        </button>
                        <button
                          onClick={handleDisembarkRover}
                          className="bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1"
                        >
                          <Truck size={14} />
                          [Disembark]
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setIsShipCargoModalOpen(true);
                        gameAudio.playConfirmSelect();
                      }}
                      className="bg-emerald-700 hover:bg-emerald-600 border border-emerald-400 text-white p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <Package size={14} />
                      [Cargo]
                    </button>
                    {gameLocation === 'In Orbit' && (
                      <button
                        onClick={() => {
                          if (orbitPlanetIndex !== null) {
                            setColonyPromptStep('ask_recommend');
                            setIsPromptingColonyRec(true);
                            setColonyNameInput(`Colony-${currentPlanets[orbitPlanetIndex].name}`.slice(0, 15));
                            gameAudio.playConfirmSelect();
                          }
                        }}
                        className="bg-amber-700 hover:bg-amber-600 border border-amber-400 text-white p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <FileText size={14} />
                        [Log Planet]
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsShipsLogOpen(true);
                        gameAudio.playConfirmSelect();
                      }}
                      className="bg-cyan-800 hover:bg-cyan-700 border border-cyan-500 text-white p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <FileText size={14} />
                      [Ship's Log]
                    </button>
                    <button
                      onClick={() => setActiveConsoleMenu('Bridge')}
                      className="bg-slate-800 hover:bg-slate-700 text-yellow-400 p-2.5 rounded-xl font-black text-xs"
                    >
                      Bridge ↩
                    </button>
                  </div>
                )}

                {/* 2. SCIENCE (SCIENCE OFFICER) CONSOLE */}
                {activeConsoleMenu === 'Science' && (
                  <div className="science-console-content flex flex-col gap-2">
                    {gameLocation!=='In Orbit'&&<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={handleScanSensors}
                        className="bg-cyan-700 hover:bg-cyan-600 border border-cyan-400 text-white p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <Eye size={14} />
                        [Sensors]
                      </button>
                      <button
                        onClick={() => {
                          if (checkMalfunction('Sensors')) return;
                          let analysisText = '';
                          if (gameLocation === 'Encounter') {
                            analysisText=alienAnalysis(alienScanRef.current,activeEncounterGroup,encounterTargetIndex,scienceSkill);
                          } else if (artifactsInHold.length > 0) {
                            analysisText = `HOLD ANALYSIS: ${artifactsInHold.length} precursor relic(s) analyzed: ${artifactsInHold.map((a) => `${a.realName || a.codeName} (${a.volume}m³)`).join('; ')}.`;
                          } else {
                            analysisText = `SPECTROMETRY ANALYSIS: Star ${currentStar.name} [Class ${currentStar.spectral}]. Radiation spectrum nominal. ${currentPlanets.length} planetary bodies in gravitational equilibrium.`;
                          }
                          setScienceReading(analysisText);
                          gameAudio.playDataChime();
                          addMessage(analysisText, 'Science Officer', 'info');
                        }}
                        className="bg-indigo-700 hover:bg-indigo-600 border border-indigo-400 text-white p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <Search size={14} />
                        [Analysis]
                      </button>
                      <button
                        onClick={() => {
                          if (checkMalfunction('Sensors')) return;
                          const statusText = `SHIP STATUS: Hull ${hullIntegrity.toFixed(0)} • Shields ${playerShieldPoints.toFixed(0)} • Armor ${playerArmorPoints.toFixed(0)} • Fuel ${enduriumFuel.toFixed(1)}m³ • Sensors ${subsystems.Sensors}%.`;
                          setScienceReading(statusText);
                          gameAudio.playDataChime();
                          addMessage(statusText, 'Science Officer', 'info');
                        }}
                        className="bg-slate-900 hover:bg-slate-800 border border-cyan-700 text-cyan-300 p-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Activity size={14} />
                        [Status]
                      </button>
                      <button
                        onClick={() => setActiveConsoleMenu('Bridge')}
                        className="bg-slate-800 hover:bg-slate-700 text-yellow-400 p-2.5 rounded-xl font-black text-xs"
                      >
                        Bridge ↩
                      </button>
                    </div>}

                    {gameLocation==='In Orbit' && orbitPlanetIndex!==null && <PlanetarySensors
                      planet={currentPlanets[orbitPlanetIndex]} scan={planetaryScan} onScan={handleScanSensors}
                      onAnalyze={handlePlanetAnalysis} officer={scienceOfficer??undefined} sensorHealth={inoperativeSystems.Sensors?0:subsystems.Sensors}
                      surface={planetSurfacesRef.current[planetKey(currentStar.x,currentStar.y,currentPlanets[orbitPlanetIndex].orderIndex)]} planetSeed={(currentStar.x*73856093)^(currentStar.y*19349663)^(currentPlanets[orbitPlanetIndex].slot*83492791)}
                      target={{lat:landingLat,lon:landingLong}} onSelect={c=>{setLandingLat(c.lat);setLandingLong(c.lon);}} onOpenLanding={handleOpenLandingScreen}
                      shipStatus={{hull:hullIntegrity,shields:playerShieldPoints,armor:playerArmorPoints,fuel:enduriumFuel}}
                      outfitting={{cargoPods,armorClass,laserClass,missileClass,shieldClass,shieldsRaised}}
                      planetImage={assets[getPlanetMapAssetKey(currentPlanets[orbitPlanetIndex],currentStar.x,currentStar.y).assetKey??'']?.src}
                    />}

                    {scienceReading && gameLocation!=='In Orbit' && (
                      <div className="bg-slate-950/90 p-2.5 rounded-xl border border-cyan-900/80 text-cyan-200 text-xs leading-snug">
                        {scienceReading}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. NAVIGATION (NAVIGATOR) CONSOLE */}
                {activeConsoleMenu === 'Navigation' && (
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    <button
                      onClick={() => {
                        if (gameLocation === 'In Orbit') breakOrbit();
                        else handleStartManeuver();
                      }}
                      className="bg-emerald-700 hover:bg-emerald-600 border border-emerald-400 text-white p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1"
                    >
                      <Navigation size={14} />
                      [Maneuver]
                    </button>
                    <button
                      onClick={() => {
                        if (fluxDisorientationTimer > 0) {
                          gameAudio.playErrorBuzz();
                          addMessage('Navigator has lost all bearings! Cannot access starmap until bearings are recovered.', 'Navigator', 'alert');
                          return;
                        }
                        setIsStarmapOpen(true);
                        gameAudio.playConfirmSelect();
                      }}
                      disabled={fluxDisorientationTimer > 0}
                      className={`p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1 transition ${
                        fluxDisorientationTimer > 0
                          ? 'bg-slate-900 border border-slate-700 text-slate-500 cursor-not-allowed'
                          : 'bg-indigo-700 hover:bg-indigo-600 border border-indigo-400 text-white'
                      }`}
                    >
                      <Globe size={14} />
                      [Starmap]
                    </button>
                    <button
                      onClick={handleToggleShields}
                      className={`p-2.5 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition ${
                        shieldsRaised ? 'bg-cyan-600 border-cyan-300 text-white shadow-[0_0_10px_#00f0ff]' : 'bg-slate-900 border-cyan-700 text-cyan-300'
                      }`}
                    >
                      <Shield size={14} />
                      {shieldsRaised ? '[Lower Shields]' : '[Raise Shields]'}
                    </button>
                    <button
                      onClick={handleToggleWeapons}
                      className={`p-2.5 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition ${
                        weaponsArmed ? 'bg-red-600 border-red-300 text-white animate-pulse shadow-[0_0_10px_#ff2244]' : 'bg-slate-900 border-red-700 text-red-300'
                      }`}
                    >
                      <Zap size={14} />
                      {weaponsArmed ? '[Disarm Weapons]' : '[Arm Weapons]'}
                    </button>
                    <button
                      onClick={() => {
                        if (!weaponsArmed) {
                          handleToggleWeapons();
                        }
                        setActiveConsoleMenu('Combat');
                        gameAudio.playConfirmSelect();
                      }}
                      className="bg-red-700 hover:bg-red-600 border border-red-400 text-white p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1 animate-pulse"
                    >
                      <CrosshairIcon size={14} />
                      [Combat]
                    </button>
                    <button
                      onClick={() => setActiveConsoleMenu('Bridge')}
                      className="bg-slate-800 hover:bg-slate-700 text-yellow-400 p-2.5 rounded-xl font-black text-xs"
                    >
                      Bridge ↩
                    </button>
                  </div>
                )}

                {/* 4. ENGINEERING (ENGINEER) CONSOLE */}
                {activeConsoleMenu === 'Engineering' && (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setEngineeringMode('damage');
                          gameAudio.playCrispClick();
                        }}
                        className={`p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition ${
                          engineeringMode === 'damage' ? 'bg-purple-600 border border-purple-300 text-white shadow-[0_0_12px_#a855f780]' : 'bg-slate-900 border border-purple-700/80 text-purple-300 hover:bg-slate-800'
                        }`}
                      >
                        <Activity size={14} />
                        [Damage]
                      </button>
                      <button
                        onClick={() => {
                          setEngineeringMode('repair');
                          gameAudio.playCrispClick();
                        }}
                        className={`p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition ${
                          engineeringMode === 'repair' ? 'bg-emerald-600 border border-emerald-300 text-white shadow-[0_0_12px_#10b98180]' : 'bg-slate-900 border border-emerald-700/80 text-emerald-300 hover:bg-slate-800'
                        }`}
                      >
                        <Wrench size={14} />
                        [Repair]
                      </button>
                      <button
                        onClick={() => setActiveConsoleMenu('Bridge')}
                        className="bg-slate-800 hover:bg-slate-700 text-yellow-400 p-2.5 rounded-xl font-black text-xs"
                      >
                        Bridge ↩
                      </button>
                    </div>

                    {activeRepairTask && (
                      <div className="bg-emerald-950/90 border-2 border-emerald-400 p-2.5 rounded-xl flex items-center justify-between text-xs shadow-[0_0_15px_#10b98140] animate-pulse">
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} className="text-yellow-400 animate-spin" />
                          <div>
                            <strong className="text-emerald-300">Gantry Transmutation Active: </strong>
                            <span className="text-white font-bold">{REPAIR_MINERALS[activeRepairTask.target]?.label}</span>
                            <span className="text-slate-300 ml-2">
                              (Prepaid {activeRepairTask.mineralCost.toFixed(1)} m³ {activeRepairTask.mineralName} • Speed: {repairPercentageRate(engineerSkill).toFixed(2)}%/s)
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveRepairTask(null);
                            addMessage('Engineering: Repair sequence halted.', 'Engineer', 'info');
                            handleSaveToSlot(activeSlot);
                          }}
                          className="bg-red-800 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-black"
                          title="Stop repair. Prepaid minerals are already consumed."
                        >
                          Abort
                        </button>
                      </div>
                    )}

                    {engineeringMode === 'damage' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <ShipDiagnostics config={{cargoPods,armorClass,laserClass,missileClass,engineClass,shieldClass}} hull={hullIntegrity} health={subsystems} inoperative={inoperativeSystems}/>

                        {/* Subsystem Telemetry List with Status Badges */}
                        <div id="eng-damage-subsystem-status-badges" className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          <DevUiTag id="#eng-damage-subsystem-status-badges" color="yellow" />
                          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                            <div className="flex justify-between items-center font-bold text-xs" style={{ gap: '12px' }}>
                              <span className="text-cyan-300">Hull Structural Integrity</span>
                              <span className="text-slate-400 font-mono text-[10px]">
                                Mat: <strong className="text-cyan-200">Aluminum {((250 - hullIntegrity) * 0.04).toFixed(1)} m³</strong>
                              </span>
                              <span className={hullIntegrity<250?'text-yellow-400':'text-emerald-400'}>
                                {+hullIntegrity.toFixed(2)}/250 ({Math.round((hullIntegrity / 250) * 100)}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${hullIntegrity <= 50 ? 'bg-red-500' : hullIntegrity <= 150 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.max(0, Math.min(100, (hullIntegrity / 250) * 100))}%`,backgroundColor:diagnosticStatus(hullIntegrity/250*100).color }}
                              />
                            </div>
                          </div>

                          {(['Engines', 'Sensors', 'Comms', 'Shields', 'Missiles', 'Lasers'] as SubsystemKey[]).map((sys) => {
                            const hp = subsystems[sys];
                            const isInop = inoperativeSystems[sys] || hp <= 0;
                            const installed=sys==='Lasers'?laserClass>0:sys==='Missiles'?missileClass>0:sys==='Shields'?shieldClass>0:true;
                            const diagnostic=diagnosticStatus(hp,isInop,installed);
                            const mineralCost = +(Math.max(0, 100 - hp) * 0.1).toFixed(1);
                            const mineralName = REPAIR_MINERALS[sys].mineral;

                            return (
                              <div key={sys} data-diagnostic-row={sys} data-status={diagnostic.state} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                                <div
                                  className="flex items-center font-bold text-xs"
                                  style={{ gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                  <span className="text-slate-200 min-w-[90px]">{REPAIR_MINERALS[sys].label}</span>

                                  {/* Mineral Cost Tag with generous margins */}
                                  <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 border border-amber-500/40 shrink-0">
                                    {mineralName}: {mineralCost} m³
                                  </span>

                                  {/* Warning Status Badge */}
                                  <span
                                    style={{color:diagnostic.color,borderColor:diagnostic.color}} className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                                      isInop
                                        ? 'bg-amber-950 text-amber-300 border border-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b80]'
                                        : hp < 100
                                        ? 'bg-yellow-950 text-yellow-300 border border-yellow-500/60'
                                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
                                    }`}
                                  >
                                    {installed?`${+hp.toFixed(2)}% · ${diagnostic.state.toUpperCase()}`:'NOT FITTED'}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-300 ${isInop ? 'bg-amber-500' : hp < 70 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${installed?hp:0}%`,backgroundColor:diagnostic.color }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {engineeringMode === 'repair' && (
                      <div className="flex flex-col gap-2">
                        <div className="text-xs text-slate-300">
                          Select system to repair with raw minerals from cargo hold (1.0 m³ per 10% health needed; minimum 0.1 m³). Engineer Skill ({engineerSkill}) accelerates repair speed.
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(['Hull', 'Engines', 'Sensors', 'Comms', 'Shields', 'Missiles', 'Lasers'] as ('Hull' | SubsystemKey)[]).map((target) => {
                            const curHp = target === 'Hull' ? (hullIntegrity / 250) * 100 : subsystems[target];
                            const mineral = REPAIR_MINERALS[target].mineral;
                            const cost = fieldRepairCost(curHp);
                            const inHold = cargoHold[mineral] || 0;
                            const isDestroyed0 = target !== 'Hull' && subsystems[target] <= 0;
                            const canRepair = curHp < 100 && !isDestroyed0 && inHold >= cost && !activeRepairTask;

                            return (
                              <div
                                key={target}
                                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                                  selectedRepairTarget === target ? 'bg-purple-950/80 border-purple-400 shadow-md' : 'bg-slate-950/80 border-slate-800'
                                }`}
                              >
                                <div className="flex flex-col">
                                  <span className="font-bold text-white">{REPAIR_MINERALS[target].label}</span>
                                  <span className="text-[11px] text-slate-400">
                                    Health: {+curHp.toFixed(2)}% • Req: <strong className="text-yellow-300">{cost.toFixed(1)} m³ {mineral}</strong>
                                  </span>
                                </div>

                                {curHp >= 100 ? (
                                  <span className="text-emerald-400 font-bold text-xs">[100% NOMINAL]</span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedRepairTarget(target);
                                      startMineralRepair(target);
                                    }}
                                    disabled={!canRepair}
                                    className={`px-3 py-1.5 rounded-lg font-black text-xs shadow-lg flex items-center gap-1 ${
                                      canRepair ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                                  >
                                    <Sparkles size={12} />
                                    Fabricate
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. COMMUNICATIONS (COMMUNICATIONS OFFICER) CONSOLE */}
                {activeConsoleMenu === 'Communications' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={handleInitiateComms}
                      disabled={!!activeEncounterGroup?.conversation?.pendingHail}
                      className="bg-pink-700 hover:bg-pink-600 border border-pink-400 text-white p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <Radio size={14} />
                      {activeEncounterGroup?.conversation?.pendingHail?'[Hailing…]':gameLocation==='Encounter'&&(activeEncounterGroup?.conversation?.hails??alienCommsState.alienHailsCount)>0?'[Respond]':'[Hail]'}
                    </button>
                    <button
                      onClick={handleRequestDistressTow}
                      className={`p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition ${
                        gameLocation === 'Encounter' || (gameLocation === 'In Orbit' && currentStar.x === 192 && currentStar.y === 152 && orbitPlanetIndex === 0 && !hasCrystalOrb)
                          ? 'bg-slate-900 border border-slate-700 text-slate-400 opacity-60 cursor-not-allowed hover:bg-slate-900'
                          : 'bg-red-800 hover:bg-red-700 border border-red-500 text-white'
                      }`}
                    >
                      <AlertTriangle size={14} className={gameLocation === 'Encounter' || (gameLocation === 'In Orbit' && currentStar.x === 192 && currentStar.y === 152 && orbitPlanetIndex === 0 && !hasCrystalOrb) ? 'text-slate-500' : 'text-yellow-400'} />
                      [Distress]
                    </button>
                    <button
                      onClick={() => setActiveConsoleMenu('Bridge')}
                      className="bg-slate-800 hover:bg-slate-700 text-yellow-400 p-2.5 rounded-xl font-black text-xs"
                    >
                      Bridge ↩
                    </button>
                  </div>
                )}

                {/* 6. MEDICAL (DOCTOR) CONSOLE */}
                {activeConsoleMenu === 'Medical' && (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setMedicalMode('status');
                          gameAudio.playCrispClick();
                        }}
                        className={`p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition ${
                          medicalMode === 'status' ? 'bg-red-600 border border-red-300 text-white shadow-[0_0_12px_#ef444480]' : 'bg-slate-900 border border-red-700/80 text-red-300 hover:bg-slate-800'
                        }`}
                      >
                        <Heart size={14} />
                        [Examine]
                      </button>
                      <button
                        onClick={() => {
                          setMedicalMode('treat');
                          gameAudio.playCrispClick();
                        }}
                        className={`p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition ${
                          medicalMode === 'treat' ? 'bg-emerald-600 border border-emerald-300 text-white shadow-[0_0_12px_#10b98180]' : 'bg-slate-900 border border-emerald-700/80 text-emerald-300 hover:bg-slate-800'
                        }`}
                      >
                        <Sparkles size={14} />
                        [Treat]
                      </button>
                      <button
                        onClick={() => setActiveConsoleMenu('Bridge')}
                        className="bg-slate-800 hover:bg-slate-700 text-yellow-400 p-2.5 rounded-xl font-black text-xs"
                      >
                        Bridge ↩
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                      {crewRoster.map((crew) => {
                        const isPatient = activePatientId === crew.id;
                        const isInjured = crew.alive && crew.vitality < 50;

                        return (
                          <div
                            key={crew.id}
                            className={`p-3 rounded-2xl border flex flex-col gap-2 transition ${
                              isPatient
                                ? 'bg-red-950/80 border-red-400 shadow-[0_0_12px_#ef444440]'
                                : 'bg-slate-950/90 border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CrewPortrait
                                  member={crew}
                                  size="sm"
                                  inCombat={gameLocation === 'Encounter'}
                                  hullCritical={hullIntegrity <= 50}
                                />
                                <div>
                                  <strong className="text-white text-xs block truncate">{crew.name}</strong>
                                  <span className="text-[10px] text-slate-400">{crew.race}</span>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-black ${
                                  !crew.alive
                                    ? 'text-red-500'
                                    : isInjured
                                    ? 'text-amber-400 animate-pulse'
                                    : 'text-emerald-400'
                                }`}
                              >
                                {crew.alive ? `${Math.round(crew.vitality)}% VIT` : 'DECEASED'}
                              </span>
                            </div>

                            {/* Animated Heartbeat EKG waveform */}
                            {crew.alive && (
                              <div className="w-full bg-black/60 h-6 rounded-lg border border-red-900/60 flex items-center justify-center overflow-hidden relative">
                                <svg width="100%" height="24" viewBox="0 0 160 24" className="overflow-visible">
                                  <path
                                    d="M 0,12 L 40,12 L 50,4 L 60,20 L 70,2 L 80,16 L 90,12 L 160,12"
                                    fill="none"
                                    stroke={isInjured ? '#f59e0b' : '#22c55e'}
                                    strokeWidth="1.8"
                                    className="animate-pulse"
                                  />
                                </svg>
                              </div>
                            )}

                            {crew.alive && crew.vitality < 100 && (
                              <button
                                onClick={() => {
                                  setActivePatientId(isPatient ? null : crew.id);
                                  gameAudio.playPowerupChime();
                                  if (!isPatient) {
                                    addMessage(`Doctor: Administering treatment to Officer ${crew.name} in primary regenerative bio-bed (2x healing rate).`, 'Doctor', 'info');
                                  }
                                }}
                                className={`w-full py-1 rounded-xl font-black text-xs shadow flex items-center justify-center gap-1 ${
                                  isPatient
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800'
                                }`}
                              >
                                <Sparkles size={12} />
                                {isPatient ? '[Active Treatment (2x)]' : '[Treat Officer]'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeConsoleMenu === 'Combat' && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <button
                      onClick={handleCycleTarget}
                      className="bg-amber-700 hover:bg-amber-600 border border-amber-400 text-white p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <CrosshairIcon size={14} />
                      Target [TAB]
                    </button>
                    <button
                      onClick={handleFireLaser}
                      className="bg-cyan-700 hover:bg-cyan-600 border border-cyan-400 text-white p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <Zap size={14} />
                      Laser (0.1m³)
                    </button>
                    <button
                      onClick={handleFireMissile}
                      className="bg-red-700 hover:bg-red-600 border border-red-400 text-white p-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <Rocket size={14} />
                      Missile (0.5m³)
                    </button>
                    {hasCrystalPearl && hullIntegrity <= 125 && (
                      <button
                        onClick={handleTriggerPearlEmergencyEscape}
                        className="bg-purple-600 hover:bg-purple-500 border border-purple-300 text-white p-2.5 rounded-xl font-black text-xs shadow-lg animate-pulse"
                      >
                        Pearl Escape!
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setActiveConsoleMenu('Navigation');
                        gameAudio.playCrispClick();
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-yellow-400 p-2.5 rounded-xl font-black text-xs"
                    >
                      Navigation ↩
                    </button>
                  </div>
                )}

                {activeConsoleMenu === 'Maneuver' && (
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/90 p-3 rounded-xl border border-emerald-500/80">
                    <span className="font-black text-emerald-300 text-xs tracking-wider">
                      {gameLocation === 'Encounter' ? 'TACTICAL GRID MANEUVER (Arrow Keys / WASD)' : 'MANEUVER ACTIVE (Arrow Keys / WASD)'}
                    </span>
                    <div className="flight-steering items-center gap-3">
                      <div role="group" aria-label="Flight steering" className="grid grid-cols-3 gap-1 touch-none">
                        {[
                          {name:'northwest',dx:-1,dy:-1,text:'↖'}, {name:'north',dx:0,dy:-1,text:'▲'}, {name:'northeast',dx:1,dy:-1,text:'↗'},
                          {name:'west',dx:-1,dy:0,text:'◀'}, {name:'stop',dx:0,dy:0,text:'■'}, {name:'east',dx:1,dy:0,text:'▶'},
                          {name:'southwest',dx:-1,dy:1,text:'↙'}, {name:'south',dx:0,dy:1,text:'▼'}, {name:'southeast',dx:1,dy:1,text:'↘'},
                        ].map(direction => (
                          <button
                            key={direction.name}
                            aria-label={direction.name === 'stop' ? 'Stop motion' : `Fly ${direction.name}`}
                            onPointerDown={event => {
                              event.currentTarget.setPointerCapture(event.pointerId);
                              setActiveDirectionVector({dx:direction.dx,dy:direction.dy});
                            }}
                            onPointerUp={() => setActiveDirectionVector({dx:0,dy:0})}
                            onPointerCancel={() => setActiveDirectionVector({dx:0,dy:0})}
                            className="w-11 h-11 bg-slate-900 border border-cyan-500/60 rounded-xl text-cyan-300 font-black active:bg-cyan-800"
                          >
                            {direction.text}
                          </button>
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400">Hold arrows<br />to steer</span>
                    </div>
                    <button
                      onClick={stopManeuver}
                      className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-xl font-black text-xs shadow-lg"
                    >
                      [STOP / RETURN]
                    </button>
                  </div>
                )}
                  </>
                )}
              </div>
            </div>

            {/* RIGHT DISPLAY PANEL & MESSAGE FEED */}
            <div className="flight-sidebar w-full lg:w-[380px] h-[520px] lg:h-auto glass-panel flex flex-col min-h-0 border-l border-cyan-900/60 shrink-0 relative">
              <DevUiTag id="#panel-tactical-status" color="cyan" />
              <div className="p-3.5 flex flex-col gap-2 border-b border-cyan-950">
                <span className="font-extrabold text-cyan-300 text-xs flex items-center gap-1.5 tracking-wider uppercase">
                  <Compass size={14} className="text-yellow-400 shrink-0" />
                  TACTICAL & SHIP GAUGES
                </span>

                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                  {/* Dev Encounter Set Range Control */}
                  {gameLocation === 'Encounter' && (devUsed || isDevPanelOpen) && (
                    <div className="p-2 bg-red-950/60 border border-red-500/80 rounded-lg space-y-1 text-[11px]">
                      <div className="flex justify-between items-center text-yellow-300 font-bold">
                        <span>⚡ DEV SET RANGE:</span>
                        <span className="text-slate-400 font-mono">{devTargetRange.toFixed(1)}c</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          max={30}
                          step={0.5}
                          value={devTargetRange}
                          onChange={(e) => setDevTargetRange(parseFloat(e.target.value) || 1.0)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-white font-mono text-center font-bold text-[11px]"
                        />
                        <button
                          onClick={() => {
                            const tgt = activeEncounterGroup?.ships[encounterTargetIndex] || activeEncounterGroup?.ships[0];
                            if (tgt) {
                              tgt.x = encounterShipPos.x;
                              tgt.y = encounterShipPos.y + devTargetRange;
                              markDevAction(`Placed ${tgt.vesselClass} at range ${devTargetRange.toFixed(1)} cells directly ahead.`);
                              gameAudio.playConfirmSelect();
                            }
                          }}
                          className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-2.5 py-0.5 rounded font-black text-[10px] shadow"
                        >
                          [Place]
                        </button>
                        <div className="flex gap-1 ml-auto">
                          {[3, 5, 8, 10, 12].map((r) => (
                            <button
                              key={r}
                              onClick={() => {
                                setDevTargetRange(r);
                                const tgt = activeEncounterGroup?.ships[encounterTargetIndex] || activeEncounterGroup?.ships[0];
                                if (tgt) {
                                  tgt.x = encounterShipPos.x;
                                  tgt.y = encounterShipPos.y + r;
                                  markDevAction(`Placed ${tgt.vesselClass} at range ${r} cells.`);
                                  gameAudio.playConfirmSelect();
                                }
                              }}
                              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 px-1 py-0.5 rounded text-[9px] text-yellow-400"
                            >
                              {r}c
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Fuel size={13} className="text-amber-400" />
                        Endurium Fuel:
                      </span>
                      <strong className="text-amber-300">{enduriumFuel.toFixed(2)} m³</strong>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, (enduriumFuel / 100) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Shield size={13} className="text-cyan-400" />
                        Shield Generator:
                      </span>
                      <strong className={inNebula ? 'text-amber-300 font-bold' : shieldsRaised ? 'text-cyan-300' : 'text-slate-500'}>
                        {inNebula
                          ? `${playerShieldPoints} / ${maxShieldCapacity} (down: nebula)`
                          : shieldsRaised
                          ? `${playerShieldPoints} / ${maxShieldCapacity}`
                          : 'OFFLINE'}
                      </strong>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${inNebula ? 'bg-amber-400' : 'bg-cyan-400'}`}
                        style={{ width: maxShieldCapacity > 0 ? `${Math.min(100, (playerShieldPoints / maxShieldCapacity) * 100)}%` : '0%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-slate-400 flex items-center gap-1">
                        <ShieldCheck size={13} className="text-emerald-400" />
                        Armor Plating:
                      </span>
                      <strong className="text-emerald-400">{playerArmorPoints} / {maxArmorCapacity}</strong>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, (playerArmorPoints / maxArmorCapacity) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Wrench size={13} className="text-cyan-400" />
                        Hull Integrity:
                      </span>
                      <strong className={hullIntegrity <= 50 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}>
                        {+hullIntegrity.toFixed(2)} / 250
                      </strong>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${hullIntegrity <= 50 ? 'bg-red-500' : hullIntegrity <= 150 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, (hullIntegrity / 250) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {hasBlackEgg && (
                    <div className="bg-red-950/60 border border-red-500/80 p-2 rounded-lg text-red-300 font-bold flex items-center gap-2">
                      <Bomb size={14} className="text-red-400 animate-pulse shrink-0" />
                      Black Egg Antimatter Core Aboard
                    </div>
                  )}
                </div>
              </div>

              {/* MESSAGES & ALIEN COMMS FEED WITH AUTO-SCROLL */}
              <div className="flex-1 min-h-[160px] p-3 flex flex-col bg-[#030712]/95 relative">
                <DevUiTag id="#msg-terminal-log" color="pink" />
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5 text-xs">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5 tracking-wider uppercase">
                    <Radio size={13} className="text-yellow-400 shrink-0" />
                    COMMUNICATIONS & BRIDGE LOG
                  </span>
                  <button
                    onClick={() => {
                      setIsShipsLogOpen(true);
                      setShipsLogTab('messages');
                      gameAudio.playConfirmSelect();
                    }}
                    className="text-[10px] text-cyan-400 hover:text-yellow-300 font-mono underline"
                  >
                    [Full Log ↗]
                  </button>
                </div>
                <CrewTransmission messages={systemMessages} portrait={speaker=>{const member=crewRoster.find(c=>speaker.endsWith(c.name)&&c.alive);return member?<CrewPortrait member={member} size="md" inCombat={gameLocation==='Encounter'} hullCritical={hullIntegrity<=50}/>:null;}}/>
                <BridgeLogFilters prefix="Bridge log" type={shipsLogMsgFilter} search={shipsLogMsgSearch} onType={setShipsLogMsgFilter} onSearch={setShipsLogMsgSearch} count={filterBridgeMessages(systemMessages,shipsLogMsgFilter,shipsLogMsgSearch).length} total={systemMessages.length}/>
                <div role="log" aria-label="Filtered bridge messages" className="flex-1 overflow-y-auto space-y-1.5 text-xs pr-1 font-mono scrollbar-thin">
                  {!filterBridgeMessages(systemMessages,shipsLogMsgFilter,shipsLogMsgSearch).length&&<p className="text-slate-400 p-2">No matching messages.</p>}
                  {filterBridgeMessages(systemMessages,shipsLogMsgFilter,shipsLogMsgSearch).map((msg) => (
                    <div key={msg.id} className="text-[13px] leading-relaxed p-2 rounded bg-slate-950/90 border border-slate-800/80">
                      {msg.speaker && <strong className="text-yellow-400 mr-1.5">[{msg.speaker}]:</strong>}
                      <span className={msg.type === 'alert' ? 'text-red-300 font-bold' : msg.type === 'banter' ? 'text-cyan-200 italic' : 'text-slate-200'}>
                        {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ALIEN COMMUNICATIONS & FULL-VIEW TRANSMISSION SCREEN MODAL (G5 OVERHAUL) */}
      {(alienCommsState.active || alienCommsState.connected) && activeEncounterGroup && (
        <MenuOverlay tone="neutral" zIndex={80}>
          {(() => {
            const race = activeEncounterGroup.race;
            const themeColors: Record<AlienRace, { border: string; bg: string; text: string; glow: string }> = {
              Elowan: { border: '#10b981', bg: 'rgba(6, 78, 59, 0.92)', text: '#34d399', glow: '#10b981' },
              Thrynn: { border: '#f59e0b', bg: 'rgba(120, 53, 15, 0.92)', text: '#fbbf24', glow: '#f59e0b' },
              Veloxi: { border: '#00f0ff', bg: 'rgba(6, 78, 59, 0.92)', text: '#38bdf8', glow: '#00f0ff' },
              'Veloxi Drone': { border: '#00f0ff', bg: 'rgba(6, 78, 59, 0.92)', text: '#38bdf8', glow: '#00f0ff' },
              Spemin: { border: '#d946ef', bg: 'rgba(112, 26, 117, 0.92)', text: '#f472b6', glow: '#d946ef' },
              Gazurtoid: { border: '#dc2626', bg: 'rgba(69, 10, 10, 0.92)', text: '#f87171', glow: '#dc2626' },
              Uhlek: { border: '#ef4444', bg: 'rgba(24, 24, 27, 0.95)', text: '#ef4444', glow: '#ef4444' },
              Mechans: { border: '#38bdf8', bg: 'rgba(15, 23, 42, 0.95)', text: '#7dd3fc', glow: '#38bdf8' },
              Minstrels: { border: '#38bdf8', bg: 'rgba(8, 47, 73, 0.92)', text: '#e0f2fe', glow: '#38bdf8' },
              Nomad: { border: '#f59e0b', bg: 'rgba(30, 41, 59, 0.95)', text: '#fde68a', glow: '#f59e0b' },
              Mysterions: { border: '#c084fc', bg: 'rgba(46, 16, 101, 0.92)', text: '#e9d5ff', glow: '#c084fc' },
              Derelict: { border: '#94a3b8', bg: 'rgba(15, 23, 42, 0.95)', text: '#cbd5e1', glow: '#94a3b8' },
            };

            const theme = themeColors[race] || themeColors.Veloxi;
            const nowS = performance.now() / 1000;
            const displayText = alienCommsState.lastAlienSpeakerText || 'Awaiting transmission...';
            // 30ms per character (33.3 chars per second), instant if textSpeed is Instant
            const charRate = textSpeed === 'Instant' ? 9999 : textSpeed === 'Fast' ? 60 : textSpeed === 'Slow' ? 18 : 33.3;
            const visibleChars = Math.min(displayText.length, Math.floor(commsTypewriterElapsed * charRate));
            const typedSubstr = displayText.slice(0, visibleChars);

            return (
              <div
                style={{
                  borderColor: theme.border,
                  boxShadow: `0 0 35px ${theme.glow}40, inset 0 0 15px ${theme.glow}15`,
                }}
                className="w-full max-w-3xl glass-panel rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col gap-4 text-slate-100 border-2 relative overflow-hidden"
              >
                <DevUiTag id="#modal-subspace-comms" color="pink" />
                {/* CRT Scanline effect overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px]" />

                {/* Header with Signal Strength & Audio Waveform */}
                <ExpeditionClock value={formattedClock}/>
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-slate-800 pb-2.5 z-10">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      style={{ borderColor: theme.border, backgroundColor: `${theme.border}20` }}
                      className="p-2 rounded-xl border flex items-center justify-center animate-pulse"
                    >
                      <Radio size={20} style={{ color: theme.border }} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base md:text-lg font-black tracking-wider break-words" style={{ color: theme.text }}>
                        SUBSPACE TRANSMISSION • {race.toUpperCase()}
                      </h2>
                      <span className="text-[11px] text-slate-400">
                        Disposition: <strong className="text-yellow-400">{alienCommsState.alienPosture}</strong> • Mood Index: {alienCommsState.alienMood}/100
                      </span>
                    </div>
                  </div>

                  {/* Signal Strength 5-Bar Meter & Animated EQ Waveform */}
                  <div className="flex items-center self-end sm:self-auto shrink-0 gap-2">
                    {/* Audio Waveform Equalizer Bars */}
                    <div className="flex items-end gap-1 h-6">
                      {[12, 18, 8, 22, 14, 20, 10, 16].map((h, i) => {
                        const barHeight = Math.max(4, Math.sin(nowS * 8 + i * 1.5) * (h / 2) + h / 2);
                        return (
                          <div
                            key={i}
                            style={{ height: `${barHeight}px`, backgroundColor: theme.border }}
                            className="w-1.5 rounded-full transition-all duration-75"
                          />
                        );
                      })}
                    </div>

                    {/* Signal Bars */}
                    <div className="flex items-end gap-1 h-5">
                      {[1, 2, 3, 4, 5].map((b) => (
                        <div
                          key={b}
                          style={{
                            height: `${b * 4}px`,
                            backgroundColor: b <= 4 ? '#10b981' : '#334155',
                          }}
                          className="w-1.5 rounded-xs"
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        if(activeEncounterGroup?.race==='Veloxi Drone' && activeEncounterGroup.droneChallenge?.status!=='granted') {
                          resolveDroneOrbit(false);handleSaveToSlot(activeSlot);return;
                        }
                        if (alienCommsState.pendingPriorityBusiness) {
                          handleAnswerPriorityBusiness(false);
                        } else if (alienCommsState.pendingAlienQuestion) {
                          if(alienCommsState.pendingAlienQuestion.id!==undefined&&activeEncounterGroup) {
                            if(alienCommsState.pendingAlienQuestion.remindersLeft===0){loseAlienPatience();return;}
                            updateEncounterMood(activeEncounterGroup,impatientMoodDelta(activeEncounterGroup.race,activeEncounterGroup.currentMood,diplomaticStrengthDifference(activeEncounterGroup)));
                            setAlienCommsState(prev=>({...prev,pendingAlienQuestion:null}));
                          } else handleAnswerQuestion(false);
                        } else {
                          const captain = crewRoster.find((c) => c.id === assignedPosts.Captain)?.name || 'Commander';
                          const playerLine = selectPlayerCommLine(
                            15,
                            'Neutral',
                            commLineUsageRef.current,
                            captain,
                            shipName || 'Arth Vessel',
                          );
                          setCommLineUsage({ ...commLineUsageRef.current });
                          safeStorageSet('starflight_comm_line_usage', JSON.stringify(commLineUsageRef.current));
                          addMessage(playerLine.formattedText, 'Captain', 'info');
                          playAlienVoice(playerLine.id, 0, 16, playerLine.formattedText);

                          setAlienCommsState((prev) => ({ ...prev, active: false, connected: false }));
                          gameAudio.playCrispClick();
                        }
                        endingTransmissionGroupRef.current=null;
                        stopAlienVoice();
                        if(activeEncounterGroup?.conversation)closeConversation(activeEncounterGroup.conversation);
                        setAlienCommsState(prev=>({...prev,active:false,connected:false}));
                        setQuestionCountdownTimer(0);
                        handleSaveToSlot(activeSlot);
                      }}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-xl text-xs font-bold"
                    >
                      Close Link ✕
                    </button>
                  </div>
                </div>

                {/* Middle Grid: Large Animated Alien Portrait & Special Transmission Displays */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 z-10">
                  {/* Left: Procedural Animated Portrait Canvas */}
                  <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-2 flex flex-col items-center justify-center relative overflow-hidden shadow-inner min-h-[170px]">
                    <canvas
                      width={180}
                      height={160}
                      className="rounded-xl"
                      ref={(portraitCanvas) => {
                        if (!portraitCanvas) return;
                        const pCtx = portraitCanvas.getContext('2d');
                        if (!pCtx) return;

                        const pw = 180;
                        const ph = 160;
                        const pcx = pw / 2;
                        const pcy = ph / 2 + 6;
                        const breathing = Math.sin(nowS * 2.5) * 1.5;
                        const isBlinking = alienEyeBlinkTimer > 3.8;

                        pCtx.fillStyle = '#050814';
                        pCtx.fillRect(0, 0, pw, ph);

                        // Special Transmission Displays (Minstrels, Nomad, Mysterions, Derelict)
                        if (race === 'Minstrels') {
                          // 1. THE MINSTRELS: Crystalline harmonic ship / resonant light crystalline structure
                          pCtx.fillStyle = '#030d1e';
                          pCtx.fillRect(0, 0, pw, ph);

                          // Resonant harmonic light waves in background
                          for (let w = 0; w < 3; w++) {
                            const waveOffset = w * 0.4 + nowS * 2;
                            pCtx.strokeStyle = `rgba(56, 189, 248, ${0.25 - w * 0.07})`;
                            pCtx.lineWidth = 1.5;
                            pCtx.beginPath();
                            for (let ox = 0; ox < pw; ox += 4) {
                              const oy = pcy + Math.sin(ox * 0.04 + waveOffset) * (18 - w * 4);
                              if (ox === 0) pCtx.moveTo(ox, oy);
                              else pCtx.lineTo(ox, oy);
                            }
                            pCtx.stroke();
                          }

                          // Central Crystalline Harmonic Ship Structure (Needle / tuning fork crystal)
                          pCtx.save();
                          pCtx.translate(pcx, pcy - 4 + breathing);

                          // Shimmering crystalline aura
                          const auraPulse = Math.sin(nowS * 4) * 6 + 32;
                          const cAura = pCtx.createRadialGradient(0, 0, 4, 0, 0, auraPulse);
                          cAura.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
                          cAura.addColorStop(0.5, 'rgba(56, 189, 248, 0.3)');
                          cAura.addColorStop(1, 'transparent');
                          pCtx.fillStyle = cAura;
                          pCtx.beginPath();
                          pCtx.arc(0, 0, auraPulse, 0, Math.PI * 2);
                          pCtx.fill();

                          // Crystalline Needle Craft Structure
                          const minstrelImg = assets['alien_ship_minstrel'];
                          if (minstrelImg && minstrelImg.complete && minstrelImg.naturalWidth > 0) {
                            const mH = 92;
                            const mW = mH * (403 / 890);
                            pCtx.drawImage(minstrelImg, -mW / 2, -mH / 2, mW, mH);
                          } else {
                            // Faceted Prismatic Crystal Tuning Fork Structure
                            pCtx.fillStyle = 'rgba(224, 242, 254, 0.85)';
                            pCtx.strokeStyle = '#38bdf8';
                            pCtx.lineWidth = 2;
                            pCtx.beginPath();
                            pCtx.moveTo(0, -42);
                            pCtx.lineTo(14, -10);
                            pCtx.lineTo(18, 32);
                            pCtx.lineTo(6, 42);
                            pCtx.lineTo(0, 20);
                            pCtx.lineTo(-6, 42);
                            pCtx.lineTo(-18, 32);
                            pCtx.lineTo(-14, -10);
                            pCtx.closePath();
                            pCtx.fill();
                            pCtx.stroke();
                          }

                          // Resonant Crystalline Nodes / Light Points
                          for (let cn = 0; cn < 6; cn++) {
                            const nodeAngle = (cn * Math.PI) / 3 + nowS * 1.5;
                            const nodeDist = 28 + Math.sin(nowS * 3 + cn) * 4;
                            const nx = Math.cos(nodeAngle) * nodeDist;
                            const ny = Math.sin(nodeAngle) * (nodeDist * 0.7);
                            pCtx.fillStyle = '#facc15';
                            pCtx.shadowColor = '#facc15';
                            pCtx.shadowBlur = 8;
                            pCtx.beginPath();
                            pCtx.arc(nx, ny, 2.5, 0, Math.PI * 2);
                            pCtx.fill();
                          }
                          pCtx.shadowBlur = 0;
                          pCtx.restore();

                          // Harmonic Oscilloscope Waveform at Bottom
                          pCtx.strokeStyle = '#00f0ff';
                          pCtx.lineWidth = 2;
                          pCtx.beginPath();
                          for (let ox = 10; ox < pw - 10; ox += 2) {
                            const oy = ph - 16 + Math.sin(ox * 0.08 + nowS * 4) * 6 * Math.cos(ox * 0.03);
                            if (ox === 10) pCtx.moveTo(ox, oy);
                            else pCtx.lineTo(ox, oy);
                          }
                          pCtx.stroke();
                          return;
                        }

                        if (race === 'Mysterions') {
                          // 2. THE MYSTERIONS: Shifting ephemeral cosmic aurora / mysterious chromatic presence
                          pCtx.fillStyle = '#070214';
                          pCtx.fillRect(0, 0, pw, ph);

                          // Flowing Ethereal Cosmic Aurora Curtains
                          pCtx.save();
                          for (let layer = 0; layer < 4; layer++) {
                            const lPhase = layer * 1.2 + nowS * 0.6;
                            const hue = (layer * 70 + nowS * 30) % 360;
                            const lGrad = pCtx.createLinearGradient(0, 0, pw, ph);
                            lGrad.addColorStop(0, `hsla(${hue}, 85%, 60%, 0.35)`);
                            lGrad.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 90%, 65%, 0.2)`);
                            lGrad.addColorStop(1, 'transparent');
                            pCtx.fillStyle = lGrad;

                            pCtx.beginPath();
                            pCtx.moveTo(0, ph);
                            for (let ax = 0; ax <= pw; ax += 10) {
                              const ay = pcy - 20 + Math.sin(ax * 0.02 + lPhase) * 35 + Math.cos(ax * 0.04 - lPhase * 0.7) * 20;
                              pCtx.lineTo(ax, ay);
                            }
                            pCtx.lineTo(pw, ph);
                            pCtx.closePath();
                            pCtx.fill();
                          }
                          pCtx.restore();

                          // Central Mysterious Chromatic Presence / Polyhedron Avatar
                          pCtx.save();
                          pCtx.translate(pcx, pcy - 2);

                          // Shimmering Chromatic Core
                          const mysterionImg = assets['alien_ship_mysterion'];
                          if (mysterionImg && mysterionImg.complete && mysterionImg.naturalWidth > 0) {
                            const mH = 88;
                            const mW = mH * (818 / 900);
                            pCtx.save();
                            pCtx.rotate(Math.sin(nowS * 1.2) * 0.12);
                            pCtx.drawImage(mysterionImg, -mW / 2, -mH / 2, mW, mH);
                            pCtx.restore();
                          } else {
                            // Sacred 8-pointed stellated chromatic star
                            pCtx.rotate(nowS * 0.4);
                            for (let star = 0; star < 2; star++) {
                              pCtx.rotate(Math.PI / 4);
                              pCtx.strokeStyle = `hsl(${(nowS * 50 + star * 45) % 360}, 90%, 70%)`;
                              pCtx.shadowColor = '#c084fc';
                              pCtx.shadowBlur = 12;
                              pCtx.lineWidth = 2;
                              pCtx.strokeRect(-22, -22, 44, 44);
                            }
                          }

                          // Floating Ethereal Sparkle Particles
                          for (let ep = 0; ep < 8; ep++) {
                            const epA = (ep * Math.PI * 2) / 8 + nowS * 0.8;
                            const epR = 38 + Math.sin(nowS * 2 + ep) * 10;
                            const epx = Math.cos(epA) * epR;
                            const epy = Math.sin(epA) * (epR * 0.65);
                            pCtx.fillStyle = `hsl(${(ep * 45 + nowS * 60) % 360}, 90%, 80%)`;
                            pCtx.shadowColor = '#e879f9';
                            pCtx.shadowBlur = 6;
                            pCtx.beginPath();
                            pCtx.arc(epx, epy, 2, 0, Math.PI * 2);
                            pCtx.fill();
                          }
                          pCtx.shadowBlur = 0;
                          pCtx.restore();
                          return;
                        }

                        if (race === 'Nomad') {
                          // 3. NOMAD PROBE: Automated mechanical probe sensor face with scanning ocular array
                          pCtx.fillStyle = '#0f172a';
                          pCtx.fillRect(0, 0, pw, ph);

                          // Mechanical Probe Sensor Head Chassis
                          pCtx.save();
                          pCtx.translate(pcx, pcy - 12);

                          // Circular Gold-Foil Outer Housing
                          pCtx.fillStyle = '#78350f';
                          pCtx.strokeStyle = '#f59e0b';
                          pCtx.lineWidth = 3;
                          pCtx.beginPath();
                          pCtx.arc(0, 0, 48, 0, Math.PI * 2);
                          pCtx.fill();
                          pCtx.stroke();

                          // Inner Robotic Sensor Aperture
                          pCtx.fillStyle = '#020617';
                          pCtx.strokeStyle = '#00f0ff';
                          pCtx.lineWidth = 2;
                          pCtx.beginPath();
                          pCtx.arc(0, 0, 36, 0, Math.PI * 2);
                          pCtx.fill();
                          pCtx.stroke();

                          // Scanning Ocular Optical Array (Triple Optical Camera Lenses)
                          const scanAngle = nowS * 3;
                          const sweepX = Math.cos(scanAngle) * 12;

                          // Central Main Optical Lens
                          const lensGrad = pCtx.createRadialGradient(sweepX, 0, 2, 0, 0, 20);
                          lensGrad.addColorStop(0, '#ffffff');
                          lensGrad.addColorStop(0.3, '#38bdf8');
                          lensGrad.addColorStop(0.8, '#0369a1');
                          lensGrad.addColorStop(1, '#020617');
                          pCtx.fillStyle = lensGrad;
                          pCtx.beginPath();
                          pCtx.arc(0, 0, 20, 0, Math.PI * 2);
                          pCtx.fill();

                          // Sweeping Horizontal Laser Ocular Scan Beam
                          pCtx.strokeStyle = 'rgba(0, 240, 255, 0.9)';
                          pCtx.shadowColor = '#00f0ff';
                          pCtx.shadowBlur = 8;
                          pCtx.lineWidth = 1.8;
                          pCtx.beginPath();
                          pCtx.moveTo(-32, sweepX * 0.8);
                          pCtx.lineTo(32, sweepX * 0.8);
                          pCtx.stroke();
                          pCtx.shadowBlur = 0;

                          // Secondary Sensor Diodes (Concentric Ocular Rings)
                          for (let d = 0; d < 6; d++) {
                            const dAngle = (d * Math.PI) / 3 + nowS * 0.5;
                            const dx = Math.cos(dAngle) * 28;
                            const dy = Math.sin(dAngle) * 28;
                            const isDOn = Math.sin(nowS * 8 + d) > 0;
                            pCtx.fillStyle = isDOn ? '#10b981' : '#1e293b';
                            pCtx.beginPath();
                            pCtx.arc(dx, dy, 3, 0, Math.PI * 2);
                            pCtx.fill();
                          }

                          pCtx.restore();

                          // Probe Telemetry Monospace Readout at Bottom
                          pCtx.fillStyle = '#22c55e';
                          pCtx.font = 'bold 9px "Courier New", monospace';
                          const stepTick = Math.floor(nowS * 2);
                          pCtx.fillText(`NOMAD PROBE #342 • OPTICAL ARRAY ACTIVE`, 12, ph - 22);
                          pCtx.fillStyle = '#38bdf8';
                          pCtx.fillText(`SCANNING [CH-${(stepTick % 8) + 1}] • SIGNAL: -68 dBm`, 12, ph - 10);
                          return;
                        }

                        if (race === 'Derelict') {
                          // 4. NOAH 9 DERELICT: Dark, abandoned ancient Earth colony ship bridge with flickering emergency readouts
                          pCtx.fillStyle = '#050711';
                          pCtx.fillRect(0, 0, pw, ph);

                          // Derelict Observation Viewport looking into starry deep space
                          pCtx.save();
                          pCtx.fillStyle = '#020617';
                          pCtx.beginPath();
                          pCtx.roundRect(14, 12, pw - 28, 76, 6);
                          pCtx.fill();
                          pCtx.strokeStyle = '#334155';
                          pCtx.lineWidth = 2;
                          pCtx.stroke();

                          // Distant Starfield through cracked bridge window
                          pCtx.fillStyle = '#ffffff';
                          for (let s = 0; s < 18; s++) {
                            const sx = 20 + ((s * 47) % (pw - 40));
                            const sy = 18 + ((s * 29) % 64);
                            pCtx.fillRect(sx, sy, (s % 3 === 0) ? 1.5 : 1, (s % 3 === 0) ? 1.5 : 1);
                          }

                          // Cracked glass fracture across viewport
                          pCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                          pCtx.lineWidth = 1;
                          pCtx.beginPath();
                          pCtx.moveTo(pw * 0.4, 12);
                          pCtx.lineTo(pw * 0.48, 42);
                          pCtx.lineTo(pw * 0.65, 88);
                          pCtx.moveTo(pw * 0.48, 42);
                          pCtx.lineTo(pw * 0.35, 65);
                          pCtx.stroke();
                          pCtx.restore();

                          // Abandoned Bridge Consoles Silhouette
                          pCtx.fillStyle = '#0b1120';
                          pCtx.fillRect(10, 88, pw - 20, ph - 98);
                          pCtx.strokeStyle = '#1e293b';
                          pCtx.lineWidth = 1.5;
                          pCtx.strokeRect(10, 88, pw - 20, ph - 98);

                          // Flickering Emergency Red Rotating Beacon
                          const beaconFlicker = Math.sin(nowS * 10) > 0.1;
                          pCtx.fillStyle = beaconFlicker ? '#ef4444' : '#450a0a';
                          pCtx.shadowColor = '#ef4444';
                          pCtx.shadowBlur = beaconFlicker ? 12 : 0;
                          pCtx.beginPath();
                          pCtx.arc(pw - 26, 24, 4, 0, Math.PI * 2);
                          pCtx.fill();
                          pCtx.shadowBlur = 0;

                          // Flickering Amber CRT Emergency Diagnostics Screen on console
                          const crtFlicker = Math.sin(nowS * 14) > -0.85;
                          if (crtFlicker) {
                            pCtx.fillStyle = '#f59e0b';
                            pCtx.font = 'bold 9px "Courier New", monospace';
                            pCtx.fillText('NOAH 9 [DERELICT COLONY SHIP]', 18, 108);
                            pCtx.fillStyle = '#cbd5e1';
                            pCtx.font = '8px "Courier New", monospace';
                            pCtx.fillText('STATUS: CREW STASIS FAILED', 18, 122);
                            pCtx.fillText('SUB-AI BLACK BOX RECORD LOGGED', 18, 136);
                            pCtx.fillText('EMERGENCY TRANSPONDER ACTIVE', 18, 150);
                          }

                          // Occasional Electrical Spark on Derelict Console
                          if (Math.sin(nowS * 18) > 0.85) {
                            pCtx.strokeStyle = '#00f0ff';
                            pCtx.lineWidth = 1.5;
                            pCtx.beginPath();
                            pCtx.moveTo(pw - 45, 125);
                            pCtx.lineTo(pw - 38, 118);
                            pCtx.lineTo(pw - 32, 130);
                            pCtx.stroke();
                          }
                          return;
                        }

                        // Standard Alien Biological / Synthetic Faces with Designated Diplomat Image Assets
                        pCtx.save();
                        pCtx.translate(pcx, pcy);

                        // Talking mouth / mandible wobble when typewriter is actively streaming
                        const isSpeaking = visibleChars < displayText.length;
                        const talkMouthShift = isSpeaking ? Math.sin(nowS * 18) * 2.5 : 0;

                        if (race === 'Elowan') {
                          const elowanPortraitImg = assets['portrait_elowan_diplomat'];
                          if (elowanPortraitImg && elowanPortraitImg.complete && elowanPortraitImg.naturalWidth > 0) {
                            const pHeight = 142;
                            const pWidth = pHeight * (702 / 959); // ~104px
                            pCtx.drawImage(elowanPortraitImg, -pWidth / 2, -pHeight / 2 + breathing, pWidth, pHeight);

                            // Talking mouth glow overlay
                            if (isSpeaking) {
                              pCtx.fillStyle = 'rgba(251, 191, 36, 0.4)';
                              pCtx.beginPath();
                              pCtx.ellipse(0, breathing + 18 + talkMouthShift, 6, 2.5 + Math.abs(talkMouthShift) * 0.8, 0, 0, Math.PI * 2);
                              pCtx.fill();
                            }

                            // Blinking eyelid overlay
                            if (isBlinking) {
                              pCtx.fillStyle = '#14532d';
                              pCtx.beginPath();
                              pCtx.ellipse(-14, breathing - 8, 8, 4, 0, 0, Math.PI * 2);
                              pCtx.ellipse(14, breathing - 8, 8, 4, 0, 0, Math.PI * 2);
                              pCtx.fill();
                            }
                          } else {
                            // Botanical Elder Fallback
                            pCtx.fillStyle = '#166534';
                            pCtx.beginPath();
                            pCtx.ellipse(0, breathing, 32, 42, 0, 0, Math.PI * 2);
                            pCtx.fill();

                            pCtx.fillStyle = '#22c55e';
                            pCtx.beginPath();
                            pCtx.ellipse(-28, breathing - 10, 10, 20, -0.4, 0, Math.PI * 2);
                            pCtx.ellipse(28, breathing - 10, 10, 20, 0.4, 0, Math.PI * 2);
                            pCtx.fill();

                            pCtx.fillStyle = '#fbbf24';
                            if (!isBlinking) {
                              pCtx.beginPath();
                              pCtx.ellipse(-12, breathing - 6, 6, 8, 0, 0, Math.PI * 2);
                              pCtx.ellipse(12, breathing - 6, 6, 8, 0, 0, Math.PI * 2);
                              pCtx.fill();
                            } else {
                              pCtx.fillRect(-16, breathing - 6, 8, 2);
                              pCtx.fillRect(8, breathing - 6, 8, 2);
                            }
                          }
                        } else if (race === 'Thrynn') {
                          const thrynnPortraitImg = assets['portrait_thrynn_diplomat'];
                          if (thrynnPortraitImg && thrynnPortraitImg.complete && thrynnPortraitImg.naturalWidth > 0) {
                            const pHeight = 138;
                            const pWidth = pHeight * (1024 / 937); // ~150px
                            pCtx.drawImage(thrynnPortraitImg, -pWidth / 2, -pHeight / 2 + breathing, pWidth, pHeight);

                            // Talking snout articulation
                            if (isSpeaking) {
                              pCtx.fillStyle = 'rgba(245, 158, 11, 0.35)';
                              pCtx.beginPath();
                              pCtx.ellipse(0, breathing + 22 + talkMouthShift, 8, 3 + Math.abs(talkMouthShift), 0, 0, Math.PI * 2);
                              pCtx.fill();
                            }

                            // Blinking slit eyes overlay
                            if (isBlinking) {
                              pCtx.fillStyle = '#78350f';
                              pCtx.beginPath();
                              pCtx.ellipse(-18, breathing - 8, 9, 3, 0.1, 0, Math.PI * 2);
                              pCtx.ellipse(18, breathing - 8, 9, 3, -0.1, 0, Math.PI * 2);
                              pCtx.fill();
                            }
                          } else {
                            // Scaled Reptilian Warlord Fallback
                            pCtx.fillStyle = '#92400e';
                            pCtx.beginPath();
                            pCtx.moveTo(0, -38 + breathing);
                            pCtx.lineTo(36, 12 + breathing);
                            pCtx.lineTo(0, 38 + breathing);
                            pCtx.lineTo(-36, 12 + breathing);
                            pCtx.closePath();
                            pCtx.fill();

                            pCtx.fillStyle = '#facc15';
                            if (!isBlinking) {
                              pCtx.beginPath();
                              pCtx.ellipse(-14, breathing - 4, 7, 10, 0.1, 0, Math.PI * 2);
                              pCtx.ellipse(14, breathing - 4, 7, 10, -0.1, 0, Math.PI * 2);
                              pCtx.fill();
                              pCtx.fillStyle = '#000000';
                              pCtx.fillRect(-15, breathing - 8, 2, 8);
                              pCtx.fillRect(13, breathing - 8, 2, 8);
                            }
                          }
                        } else if (race === 'Veloxi Drone') {
                          const droneImg=assets['alien_ship_veloxi_drone'];
                          if(droneImg?.complete&&droneImg.naturalWidth>0) {
                            const height=140,width=height*droneImg.naturalWidth/droneImg.naturalHeight;
                            pCtx.drawImage(droneImg,-width/2,-height/2,width,height);
                            pCtx.fillStyle=`rgba(255,204,69,${.08+.1*(1+Math.sin(nowS*4))/2})`;
                            pCtx.beginPath();pCtx.ellipse(-2,-1,16,18,0,0,Math.PI*2);pCtx.fill();
                          }
                        } else if (race === 'Veloxi') {
                          const veloxiPortraitImg = assets['portrait_veloxi_diplomat'];
                          if (veloxiPortraitImg && veloxiPortraitImg.complete && veloxiPortraitImg.naturalWidth > 0) {
                            const pHeight = 144;
                            const pWidth = pHeight * (811 / 1024); // ~114px
                            pCtx.drawImage(veloxiPortraitImg, -pWidth / 2, -pHeight / 2 + breathing, pWidth, pHeight);

                            // Twitching Mandible Articulation
                            const mandTwitch = isSpeaking ? Math.sin(nowS * 24) * 4 : 0;
                            pCtx.strokeStyle = '#34d399';
                            pCtx.lineWidth = 2.2;
                            pCtx.beginPath();
                            pCtx.moveTo(-10, breathing + 24);
                            pCtx.lineTo(-16 - mandTwitch, breathing + 36);
                            pCtx.moveTo(10, breathing + 24);
                            pCtx.lineTo(16 + mandTwitch, breathing + 36);
                            pCtx.stroke();
                          } else {
                            // Insectoid Chitin Head Fallback
                            pCtx.fillStyle = '#065f46';
                            pCtx.beginPath();
                            pCtx.ellipse(0, breathing, 28, 36, 0, 0, Math.PI * 2);
                            pCtx.fill();

                            pCtx.fillStyle = '#10b981';
                            pCtx.beginPath();
                            pCtx.ellipse(-16, breathing - 6, 10, 16, -0.3, 0, Math.PI * 2);
                            pCtx.ellipse(16, breathing - 6, 10, 16, 0.3, 0, Math.PI * 2);
                            pCtx.fill();

                            pCtx.strokeStyle = '#34d399';
                            pCtx.lineWidth = 2.5;
                            const mandPulse = Math.sin(nowS * 8) * 3;
                            pCtx.beginPath();
                            pCtx.moveTo(-8, breathing + 22);
                            pCtx.lineTo(-14 - mandPulse, breathing + 32);
                            pCtx.moveTo(8, breathing + 22);
                            pCtx.lineTo(14 + mandPulse, breathing + 32);
                            pCtx.stroke();
                          }
                        } else if (race === 'Spemin') {
                          const speminPortraitImg = assets['portrait_spemin_diplomat'];
                          if (speminPortraitImg && speminPortraitImg.complete && speminPortraitImg.naturalWidth > 0) {
                            const squish = Math.sin(nowS * 4) * 3;
                            const pHeight = 136 + squish;
                            const pWidth = pHeight * (652 / 764) - squish * 0.5;
                            pCtx.drawImage(speminPortraitImg, -pWidth / 2, -pHeight / 2 + breathing, pWidth, pHeight);

                            // Talking Mouth wobble
                            if (isSpeaking) {
                              pCtx.fillStyle = 'rgba(244, 114, 182, 0.5)';
                              pCtx.beginPath();
                              pCtx.ellipse(0, breathing + 20 + talkMouthShift, 10, 4 + Math.abs(talkMouthShift) * 1.2, 0, 0, Math.PI * 2);
                              pCtx.fill();
                            }
                          } else {
                            // Jelly Blob Fallback
                            const squish = Math.sin(nowS * 5) * 4;
                            pCtx.fillStyle = '#a21caf';
                            pCtx.beginPath();
                            pCtx.ellipse(0, breathing, 34 + squish, 30 - squish, 0, 0, Math.PI * 2);
                            pCtx.fill();

                            pCtx.fillStyle = '#f472b6';
                            pCtx.beginPath();
                            pCtx.arc(-12, breathing - 4, 8, 0, Math.PI * 2);
                            pCtx.arc(12, breathing - 4, 8, 0, Math.PI * 2);
                            pCtx.fill();
                          }
                        } else if (race === 'Gazurtoid') {
                          const gazurtoidPortraitImg = assets['portrait_gazurtoid_diplomat'];
                          if (gazurtoidPortraitImg && gazurtoidPortraitImg.complete && gazurtoidPortraitImg.naturalWidth > 0) {
                            const pHeight = 146;
                            const pWidth = pHeight * (557 / 881); // ~92px
                            pCtx.drawImage(gazurtoidPortraitImg, -pWidth / 2, -pHeight / 2 + breathing, pWidth, pHeight);

                            // Glowing breathing collar & visor pulse
                            const vPulse = Math.sin(nowS * 8) * 0.3 + 0.7;
                            pCtx.fillStyle = `rgba(56, 189, 248, ${0.4 * vPulse})`;
                            pCtx.beginPath();
                            pCtx.ellipse(0, breathing + 38, 22, 6, 0, 0, Math.PI * 2);
                            pCtx.fill();
                          } else {
                            // Cetacean Whale Titan Fallback
                            pCtx.fillStyle = '#1e1b4b';
                            pCtx.beginPath();
                            pCtx.ellipse(0, breathing, 36, 44, 0, 0, Math.PI * 2);
                            pCtx.fill();

                            pCtx.fillStyle = '#ef4444';
                            pCtx.shadowColor = '#ef4444';
                            pCtx.shadowBlur = 12;
                            pCtx.fillRect(-22, breathing - 10, 44, 8);
                            pCtx.shadowBlur = 0;
                          }
                        } else if (race === 'Uhlek') {
                          // Spiky Obsidian Sentinel
                          pCtx.fillStyle = '#09090b';
                          pCtx.strokeStyle = '#ef4444';
                          pCtx.lineWidth = 2;
                          pCtx.beginPath();
                          pCtx.moveTo(0, -38 + breathing);
                          pCtx.lineTo(32, -4 + breathing);
                          pCtx.lineTo(14, 34 + breathing);
                          pCtx.lineTo(-14, 34 + breathing);
                          pCtx.lineTo(-32, -4 + breathing);
                          pCtx.closePath();
                          pCtx.fill();
                          pCtx.stroke();

                          // Crimson Optic Slit
                          pCtx.fillStyle = '#ef4444';
                          pCtx.fillRect(-18, breathing - 4, 36, 4);
                        } else if (race === 'Mechans') {
                          const mechanPortraitImg = assets['portrait_mechan_diplomat'];
                          if (mechanPortraitImg && mechanPortraitImg.complete && mechanPortraitImg.naturalWidth > 0) {
                            const pHeight = 144;
                            const pWidth = pHeight * (570 / 828); // ~99.1px
                            pCtx.drawImage(mechanPortraitImg, -pWidth / 2, -pHeight / 2 + breathing, pWidth, pHeight);

                            // Glowing blue optical camera eye pulse & aperture modulation
                            const eyePulse = Math.sin(nowS * 6) * 0.3 + 0.7;
                            pCtx.fillStyle = `rgba(0, 240, 255, ${eyePulse * 0.9})`;
                            pCtx.shadowColor = '#00f0ff';
                            pCtx.shadowBlur = 12;
                            pCtx.beginPath();
                            pCtx.arc(-11, breathing - 10, 4.5, 0, Math.PI * 2);
                            pCtx.arc(11, breathing - 10, 4.5, 0, Math.PI * 2);
                            pCtx.fill();

                            // Audio speaker matrix frequency bars during active typewriter streaming
                            if (isSpeaking) {
                              pCtx.fillStyle = '#facc15';
                              pCtx.shadowColor = '#facc15';
                              pCtx.shadowBlur = 8;
                              for (let b = 0; b < 5; b++) {
                                const bH = Math.max(2, Math.sin(nowS * 20 + b * 1.5) * 4 + 4);
                                pCtx.fillRect(-12 + b * 5, breathing + 18 - bH / 2, 3, bH);
                              }
                            }
                            pCtx.shadowBlur = 0;
                          } else {
                            // Synthetic Terminal Fallback
                            pCtx.fillStyle = '#334155';
                            pCtx.fillRect(-28, -28 + breathing, 56, 56);
                            pCtx.strokeStyle = '#38bdf8';
                            pCtx.strokeRect(-28, -28 + breathing, 56, 56);

                            // Blinking Audio Matrix
                            pCtx.fillStyle = '#00f0ff';
                            for (let r = 0; r < 3; r++) {
                              for (let c = 0; c < 5; c++) {
                                if (Math.sin(nowS * 10 + r + c) > 0) {
                                  pCtx.fillRect(-18 + c * 8, -12 + r * 8 + breathing, 4, 4);
                                }
                              }
                            }
                          }
                        }

                        pCtx.restore();
                      }}
                    />
                  </div>

                  {/* Right: Subspace Typewriter Dialogue Terminal */}
                  <div
                    onClick={() => {
                      // Click skips typewriter and instantly shows full text
                      setCommsTypewriterElapsed(999);
                    }}
                    className="md:col-span-2 bg-slate-950/90 rounded-2xl border border-slate-800 p-3.5 flex flex-col justify-between shadow-inner min-h-[170px] cursor-pointer"
                  >
                    <div className="space-y-1.5">
                      {alienCommsState.lastCaptainText && (
                        <div className="p-2 rounded-xl bg-slate-900 border border-cyan-800/80 text-yellow-300 text-xs font-mono mb-2">
                          <strong className="text-white">[{crewRoster.find((c) => c.id === assignedPosts.Captain)?.name || 'Captain'}]: </strong>"{alienCommsState.lastCaptainText}"
                        </div>
                      )}
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono border-b border-slate-800 pb-1">
                        <span>TRANSMISSION DECODER • COMMS SKILL: {commsSkill}</span>
                        <span className="flex items-center gap-1">
                          <span>FIDELITY: {calculateTranslationStrength(commsSkill, getCrewAboard(), commsOfficer?.race || null, hasWhiningOrb, race)}/250</span>
                          {visibleChars < displayText.length && (
                            <span className="text-yellow-400 text-[9px] underline">[Click to skip]</span>
                          )}
                        </span>
                      </div>
                      <p aria-label="Alien transmission subtitle" className="dialogue-subtitle text-base md:text-lg leading-relaxed text-slate-100 font-mono font-medium select-text">
                        "{typedSubstr}"
                        {visibleChars < displayText.length && <span className="animate-pulse text-yellow-400">▍</span>}
                      </p>
                    </div>

                    {/* Pending Priority Opening Business (Thrynn Artifact Offer / Veloxi Demand / Tribute) */}
                    {alienCommsState.pendingPriorityBusiness && (
                      <div className="p-2.5 bg-amber-950/70 border-2 border-amber-500 rounded-xl flex flex-wrap gap-3 items-center justify-between text-xs mt-2 shadow-lg animate-pulse">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const radius = 11;
                            const circumference = 2 * Math.PI * radius;
                            const timeRatio = Math.max(0, Math.min(1, questionCountdownTimer / Math.max(1, questionTotalTime)));
                            const dashOffset = circumference * (1 - timeRatio);
                            return (
                              <div className="relative flex items-center justify-center w-7 h-7 shrink-0">
                                <svg width="28" height="28" viewBox="0 0 28 28" className="-rotate-90">
                                  <circle cx="14" cy="14" r={radius} fill="none" stroke="#334155" strokeWidth="2.5" />
                                  <circle
                                    cx="14"
                                    cy="14"
                                    r={radius}
                                    fill="none"
                                    stroke={timeRatio < 0.25 ? '#ef4444' : '#f59e0b'}
                                    strokeWidth="2.5"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={dashOffset}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span className="absolute text-[8px] font-mono font-bold text-amber-300">
                                  {Math.ceil(questionCountdownTimer)}
                                </span>
                              </div>
                            );
                          })()}
                          <div>
                            <span className="text-yellow-300 font-bold block">
                              {alienCommsState.pendingPriorityBusiness.type === 'thrynn_artifact'
                                ? 'Thrynn Artifact Trade Offer:'
                                : alienCommsState.pendingPriorityBusiness.type === 'veloxi_tribute'
                                ? 'Veloxi Sovereignty Tribute Demand:'
                                : 'Veloxi Relic Surrender Demand:'}
                            </span>
                            <span className="text-[10px] text-slate-300 font-mono">
                              Response required ({Math.ceil(questionCountdownTimer)}s remaining)
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAnswerPriorityBusiness(true)}
                            disabled={alienCommsState.pendingPriorityBusiness.type === 'veloxi_tribute' && payFuelTribute(enduriumFuel,alienCommsState.pendingPriorityBusiness.tributeAmount ?? 3) === null || alienCommsState.pendingPriorityBusiness.type === 'thrynn_artifact' && (alienCommsState.pendingPriorityBusiness.fuelOffer ?? 0) <= 0}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-3.5 py-1.5 rounded-lg font-black flex items-center gap-1 shadow-lg text-xs"
                          >
                            <Check size={13} />
                            [Yes]
                          </button>
                          <button
                            onClick={() => handleAnswerPriorityBusiness(false)}
                            className="bg-red-600 hover:bg-red-500 text-white px-3.5 py-1.5 rounded-lg font-black flex items-center gap-1 shadow-lg text-xs"
                          >
                            <X size={13} />
                            [No]
                          </button>
                        </div>
                      </div>
                    )}

                    {alienCommsState.pendingPriorityBusiness?.type === 'veloxi_tribute' && payFuelTribute(enduriumFuel,alienCommsState.pendingPriorityBusiness.tributeAmount ?? 3) === null && (
                      <p className="text-xs text-amber-300 mt-2 font-mono">Insufficient Endurium: {(alienCommsState.pendingPriorityBusiness.tributeAmount ?? 3).toFixed(1)} m³ required; {enduriumFuel.toFixed(2)} m³ aboard.</p>
                    )}

                    {/* Pending Alien Question with Accurate Elapsed Countdown Timer Ring */}
                    {alienCommsState.pendingAlienQuestion && !alienCommsState.pendingPriorityBusiness && (
                      <div className="p-2.5 bg-amber-950/60 border border-amber-500/80 rounded-xl flex flex-wrap gap-3 items-center justify-between text-xs mt-2">
                        <div className="flex items-center gap-2">
                          {/* Circular SVG Timer Ring with accurate elapsed ratio */}
                          {(() => {
                            const radius = 11;
                            const circumference = 2 * Math.PI * radius; // ~69.115
                            const timeRatio = Math.max(0, Math.min(1, questionCountdownTimer / Math.max(1, questionTotalTime)));
                            const dashOffset = circumference * (1 - timeRatio);
                            return (
                              <div className="relative flex items-center justify-center w-7 h-7 shrink-0">
                                <svg width="28" height="28" viewBox="0 0 28 28" className="-rotate-90">
                                  <circle cx="14" cy="14" r={radius} fill="none" stroke="#334155" strokeWidth="2.5" />
                                  <circle
                                    cx="14"
                                    cy="14"
                                    r={radius}
                                    fill="none"
                                    stroke={timeRatio < 0.25 ? '#ef4444' : '#f59e0b'}
                                    strokeWidth="2.5"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={dashOffset}
                                    strokeLinecap="round"
                                    className="transition-all duration-100"
                                  />
                                </svg>
                                <span className="absolute text-[8px] font-mono font-bold text-amber-300">
                                  {Math.ceil(questionCountdownTimer)}
                                </span>
                              </div>
                            );
                          })()}
                          <div>
                            <span className="text-amber-300 font-bold block">
                              {alienCommsState.pendingAlienQuestion.id!==undefined&&alienCommsState.pendingAlienQuestion.remindersLeft===0?'The aliens have lost patience.':isQuestionReminderActive||alienCommsState.pendingAlienQuestion.id!==undefined&&alienCommsState.pendingAlienQuestion.remindersLeft<2?'The aliens are waiting for your reply:':'Alien expects immediate response:'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {Math.ceil(questionCountdownTimer)}s remaining
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAnswerQuestion(true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-black flex items-center gap-1 shadow"
                          >
                            <Check size={13} />
                            YES
                          </button>
                          <button
                            onClick={() => handleAnswerQuestion(false)}
                            className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg font-black flex items-center gap-1 shadow"
                          >
                            <X size={13} />
                            NO
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Interactive Command Buttons: Postures & Dialogue Topics */}
                <div className="flex flex-col gap-2.5 z-10 text-xs" style={{display:activeEncounterGroup&&['Veloxi Drone','Minstrels','Nomad','Mysterions','Derelict'].includes(activeEncounterGroup.race)?'none':undefined}} inert={!!alienCommsState.pendingAlienQuestion||!!alienCommsState.pendingPriorityBusiness}>
                  {activeEncounterGroup?.conversation?.pendingSubject!==undefined&&<p role="status" className="text-cyan-300 text-xs">Question transmitted. Awaiting reply.</p>}
                  {/* Diplomatic Postures */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Diplomatic Posture:</span>
                    {(['Friendly', 'Hostile', 'Obsequious'] as DiplomaticPosture[]).map((posture) => {
                      const isSel = alienCommsState.playerPosture === posture;
                      return (
                        <button
                          key={posture}
                          onClick={() => handleSelectPosture(posture)}
                          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                            isSel
                              ? 'bg-linear-to-r from-cyan-600 to-blue-600 text-white border border-cyan-300 shadow-lg'
                              : 'bg-slate-900/90 text-slate-300 border border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          {posture === 'Friendly' && <Heart size={13} className="text-pink-400" />}
                          {posture === 'Hostile' && <Flame size={13} className="text-red-400" />}
                          {posture === 'Obsequious' && <ShieldAlert size={13} className="text-amber-400" />}
                          <span>{posture}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Canonical Dialogue Subjects */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(['Themselves', 'Other Races', 'The Old Empire', 'The Ancients', 'General Info'] as DialogueSubject[]).map((subj) => (
                      <button
                        key={subj}
                        onClick={() => handleAskSubject(subj)}
                        className="bg-slate-900/90 hover:bg-cyan-900/60 border border-slate-700 hover:border-cyan-400 text-slate-200 p-2 rounded-xl font-bold text-xs shadow transition flex items-center justify-center gap-1"
                      >
                        <MessageSquare size={13} className="text-cyan-400" />
                        <span>{subj}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </MenuOverlay>
      )}
      {victorySequenceModal && (
        <MenuOverlay tone="victory" zIndex={95}>
          <div
            style={{
              backgroundImage: (assets['cinematic_victory_bridge_img'] || assets['cinematic_victory_bridge'])
                ? `linear-gradient(rgba(5, 10, 28, 0.75), rgba(5, 10, 28, 0.9)), url(${assets['cinematic_victory_bridge_img']?.src || assets['cinematic_victory_bridge']?.src || 'assets/images/cinematic_victory_bridge_img.png'})`
                : undefined,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              width: '100%',
            }}
            className="w-full max-w-2xl glass-panel border-4 border-yellow-400 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 text-slate-100 relative overflow-hidden"
          >
            {/* Holographic Gold Seal Background Watermark */}
            <div className="absolute top-4 right-4 w-28 h-28 rounded-full border-4 border-yellow-400/20 flex items-center justify-center pointer-events-none rotate-12">
              <span className="text-[10px] font-black text-yellow-400/30 uppercase tracking-widest text-center">
                OFFICIAL SEAL<br />INTERSTEL HQ<br />★ ★ ★
              </span>
            </div>

            <div className="relative">
              <TrophyIcon size={52} className="text-yellow-400 animate-bounce" />
              <Sparkles size={20} className="text-cyan-300 absolute -top-1 -right-2 animate-spin" />
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-yellow-400 tracking-wider">
              INTERSTEL COMMENDATION OF GALACTIC SALVATION
            </h1>

            <div className="w-full bg-slate-950/90 border border-cyan-500/80 rounded-2xl p-4 text-left text-xs space-y-2.5 font-mono shadow-inner">
              <div className="text-cyan-400 font-bold border-b border-slate-800 pb-1 flex justify-between">
                <span>MEMORANDUM #4621-VICTORY-ALPHA</span>
                <span className="text-yellow-400">CITATION OF HIGHEST HONOR</span>
              </div>
              <div className="text-slate-300 leading-relaxed">
                Against insurmountable astronomical odds, the crew of the starship <strong className="text-white">{shipName}</strong> penetrated the forbidden Precursor sector and neutralized the Crystalline Master Control Nexus at [192, 152].
              </div>
              <div className="text-emerald-300 font-semibold leading-relaxed">
                The catastrophic galactic solar flare cycle has been permanently extinguished. The star-cities of Arth and countless sentients across the quadrant are saved from stellar incineration!
              </div>
            </div>

            {/* Campaign Statistics Summary Breakdown */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-left">
                <span className="text-slate-400 block text-[10px]">Stardate Completed</span>
                <strong className="text-cyan-300 text-sm font-mono">{formattedStardate}</strong>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-left">
                <span className="text-slate-400 block text-[10px]">Final M.U. Treasury</span>
                <strong className="text-amber-300 text-sm font-mono">{credits.toLocaleString()} M.U.</strong>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-left">
                <span className="text-slate-400 block text-[10px]">Stars Explored</span>
                <strong className="text-emerald-300 text-sm font-mono">{visitedStarIds.length} Systems</strong>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-left">
                <span className="text-slate-400 block text-[10px]">Worlds Logged</span>
                <strong className="text-purple-300 text-sm font-mono">{recommendedPlanets.length} Worlds</strong>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-left">
                <span className="text-slate-400 block text-[10px]">Precursor Relics</span>
                <strong className="text-pink-300 text-sm font-mono">{artifactsInHold.length} Relics</strong>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-left">
                <span className="text-slate-400 block text-[10px]">Crew Casualties</span>
                <strong className="text-red-300 text-sm font-mono">{crewRoster.filter((c) => !c.alive).length} Lost</strong>
              </div>
            </div>

            <button
              onClick={() => {
                // Persist/auto-save won game state to active slot
                const wonPatch = {
                  gameWon: true,
                  flaresStopped: true,
                  flaresHalted: true,
                  credits,
                  location: gameLocation,
                  currentStarId,
                  galaxyShipX: galaxyShipXFrameRef.current,
                  galaxyShipY: galaxyShipYFrameRef.current,
                  systemShipX: systemShipXFrameRef.current,
                  systemShipY: systemShipYFrameRef.current,
                  orbitPlanetIndex,
                  destroyedPlanetKeys: destroyedPlanetKeys.includes('192-152-0') ? destroyedPlanetKeys : [...destroyedPlanetKeys, '192-152-0'],
                };
                handleSaveToSlot(activeSlot, wonPatch);
                setVictorySequenceModal(false);
                setGameState({ status: 'START', score: 9999, level: 1 });
              }}
              className="mt-2 bg-linear-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 px-8 py-3 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 transition hover:scale-105"
            >
              <Award size={18} />
              RETURN TO TITLE SCREEN
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* 3-PAGE PROLOGUE MODAL */}
      {introPage > 0 && (
        <MenuOverlay tone="neutral" zIndex={88}>
          <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-between gap-5 text-slate-100 border-2 border-cyan-400/80 min-h-[460px]">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-cyan-900/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-yellow-400 font-black shadow-[0_0_12px_#00f0ff50]">
                  {introPage === 1 ? '🌟' : introPage === 2 ? '📜' : '🔭'}
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-cyan-300 tracking-wider uppercase">
                    {introPage === 1 && 'STARPORT ARTH COMMISSIONING'}
                    {introPage === 2 && 'THE INITIAL ASSIGNMENT'}
                    {introPage === 3 && 'THE GROWING MYSTERY'}
                  </h2>
                  <span className="text-xs text-yellow-400 font-bold font-mono">
                    Prologue Briefing • Page {introPage} of 3
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIntroPage(0);
                  gameAudio.playConfirmSelect();
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white px-3 py-1 rounded-xl text-xs font-bold transition"
              >
                Skip Intro ✕
              </button>
            </div>

            {/* Static Body Content per Page */}
            <div className="flex-1 space-y-3.5 text-xs md:text-sm leading-relaxed text-slate-200">
              {introPage === 1 && (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-950/90 rounded-2xl border border-cyan-900/80 space-y-2.5">
                    <strong className="text-cyan-300 text-sm block font-bold flex items-center gap-1.5">
                      <Sparkles size={16} className="text-yellow-400" />
                      RECLAIMING THE STARS
                    </strong>
                    <p className="text-slate-300 leading-relaxed">
                      Decades after the Great Disruption, humanity and its allied species emerge from the shelter of planet Arth to reclaim the stars.
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      As a newly commissioned Starflight commander, you are tasked with exploring the uncharted reaches of the galaxy, finding viable colony worlds, and discovering ancient trade routes.
                    </p>
                  </div>
                </div>
              )}

              {introPage === 2 && (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-950/90 rounded-2xl border border-cyan-900/80 space-y-2.5">
                    <strong className="text-cyan-300 text-sm block font-bold flex items-center gap-1.5">
                      <Award size={16} className="text-yellow-400" />
                      VESSEL OUTFITTING & CREW PREPARATION
                    </strong>
                    <p className="text-slate-300 leading-relaxed">
                      Interstel Corporation has outfitted your vessel with basic systems and an initial operating budget.
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      Recruit and train a specialized multi-species bridge crew, customize your vessel, and stock sufficient Endurium fuel at the Trade Depot before launch clearance.
                    </p>
                  </div>
                </div>
              )}

              {introPage === 3 && (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-950/90 rounded-2xl border border-cyan-900/80 space-y-2.5">
                    <strong className="text-yellow-300 text-sm block font-bold flex items-center gap-1.5">
                      <Compass size={16} className="text-cyan-400" />
                      EXPLORATION & SCIENTIFIC SURVEY
                    </strong>
                    <p className="text-slate-300 leading-relaxed">
                      Astronomical observatories on Arth have registered subtle, unexplained solar fluctuations in Arth's star.
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      While scientific teams monitor the anomaly, your mission is to explore the galaxy, log planetary habitability, recover historical artifacts, and report all findings back to Starport Operations.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination Navigation Controls */}
            <div className="flex justify-between items-center pt-3 border-t border-cyan-900/60 text-xs">
              <button
                onClick={() => {
                  if (introPage > 1) {
                    setIntroPage((p) => p - 1);
                    gameAudio.playCrispClick();
                  }
                }}
                disabled={introPage <= 1}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-700 text-cyan-300 px-4 py-2 rounded-xl font-bold flex items-center gap-1"
              >
                <ChevronLeft size={15} />
                <span>Previous</span>
              </button>

              <span className="font-mono font-bold text-yellow-400 text-xs">
                Page {introPage} of 3
              </span>

              {introPage < 3 ? (
                <button
                  onClick={() => {
                    setIntroPage((p) => p + 1);
                    gameAudio.playCrispClick();
                  }}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl font-black flex items-center gap-1.5 shadow-lg"
                >
                  <span>Next Page</span>
                  <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIntroPage(0);
                    gameAudio.playPowerupChime();
                  }}
                  className="bg-linear-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 px-6 py-2 rounded-xl font-black flex items-center gap-2 shadow-xl"
                >
                  <Rocket size={16} />
                  <span>BEGIN MISSION ➔</span>
                </button>
              )}
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* FULL-FEATURED SHIP'S LOG MODAL (ALL 4 TABS: NOTICES, ALIEN COMMS, MESSAGES, PLANETS) */}
      {isShipsLogOpen && (
        <MenuOverlay tone="neutral" zIndex={75}>
          <div className="w-full max-w-4xl glass-panel rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col gap-4 text-slate-100 border border-cyan-400/50 max-h-[90vh] overflow-y-auto relative">
            <DevUiTag id="#modal-ships-log" color="cyan" />
            {/* Header with 4 Tab Selectors */}
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-cyan-900/60 pb-3">
              <div className="flex items-center gap-2.5">
                <FileText size={22} className="text-yellow-400" />
                <div>
                  <h2 className="text-base md:text-xl font-black text-cyan-300 tracking-wider uppercase">
                    OFFICIAL SHIP'S LOG & HISTORICAL TRANSCRIPTS
                  </h2>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Vessel: <strong className="text-white">{shipName}</strong> • Stardate: <strong className="text-yellow-400">{formattedClock}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsShipsLogOpen(false);
                  gameAudio.playCrispClick();
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-cyan-600 text-cyan-300 px-3.5 py-1.5 rounded-xl text-xs font-black"
              >
                Close Log ✕
              </button>
            </div>

            {/* 4 Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-2 text-xs">
              <button
                onClick={() => {
                  setShipsLogTab('notices');
                  gameAudio.playCrispClick();
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                  shipsLogTab === 'notices'
                    ? 'bg-cyan-600 text-white shadow-[0_0_12px_#00f0ff60]'
                    : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:bg-slate-900'
                }`}
              >
                <Radio size={14} className={shipsLogTab === 'notices' ? 'text-yellow-300' : 'text-cyan-400'} />
                <span>1. Notices &amp; Memos</span>
                <span className="bg-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-mono border border-cyan-800">
                  {bulletins.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setShipsLogTab('alien_comms');
                  gameAudio.playCrispClick();
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                  shipsLogTab === 'alien_comms'
                    ? 'bg-pink-600 text-white shadow-[0_0_12px_#ec489960]'
                    : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:bg-slate-900'
                }`}
              >
                <MessageSquare size={14} className={shipsLogTab === 'alien_comms' ? 'text-yellow-300' : 'text-pink-400'} />
                <span>2. Alien Transmissions</span>
                <span className="bg-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-mono border border-pink-800">
                  {alienCommsState.dialogueHistory.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setShipsLogTab('messages');
                  gameAudio.playCrispClick();
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                  shipsLogTab === 'messages'
                    ? 'bg-purple-600 text-white shadow-[0_0_12px_#a855f760]'
                    : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:bg-slate-900'
                }`}
              >
                <Terminal size={14} className={shipsLogTab === 'messages' ? 'text-yellow-300' : 'text-purple-400'} />
                <span>3. Bridge Log & Banter</span>
                <span className="bg-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-mono border border-purple-800">
                  {systemMessages.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setShipsLogTab('planets');
                  gameAudio.playCrispClick();
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                  shipsLogTab === 'planets'
                    ? 'bg-emerald-600 text-white shadow-[0_0_12px_#10b98160]'
                    : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:bg-slate-900'
                }`}
              >
                <Globe size={14} className={shipsLogTab === 'planets' ? 'text-yellow-300' : 'text-emerald-400'} />
                <span>4. Planetary Survey Registry</span>
                <span className="bg-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-mono border border-emerald-800">
                  {evaluations.length}
                </span>
              </button>
            </div>

            {/* TAB 1: NOTICES & MEMOS */}
            {shipsLogTab === 'notices' && (() => {
              const total = bulletins.length;
              const safeIdx = total > 0 ? Math.min(Math.max(0, shipsLogNoticeIdx), total - 1) : 0;
              const currentNotice = total > 0 ? bulletins[safeIdx] : null;
              const isAlien = currentNotice ? currentNotice.id >= 100 : false;
              const staticAside = currentNotice
                ? (isAlien
                    ? CAPTAIN_ASIDES.alien[currentNotice.id % CAPTAIN_ASIDES.alien.length]
                    : CAPTAIN_ASIDES.ops[currentNotice.id % CAPTAIN_ASIDES.ops.length])
                : '';

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Left List */}
                  <div className="bg-slate-950/90 p-3 rounded-2xl border border-cyan-900/80 flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 text-[11px] font-bold text-cyan-300">
                      <span>NOTICES INDEX ({total})</span>
                      <span className="text-slate-400 font-normal">
                        {bulletins.filter((b) => b.read).length}/{total} Read
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                      {bulletins.map((b, idx) => {
                        const isSel = idx === safeIdx;
                        return (
                          <button
                            key={b.id}
                            onClick={() => {
                              setShipsLogNoticeIdx(idx);
                              gameAudio.playCrispClick();
                            }}
                            className={`w-full p-2 rounded-xl text-left border transition flex flex-col gap-0.5 ${
                              isSel
                                ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md'
                                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className={isSel ? 'text-yellow-300 font-bold' : 'text-slate-400'}>
                                #{idx + 1} • {b.date}
                              </span>
                              <span className={`text-[9px] font-bold px-1 rounded ${b.read ? 'text-slate-500' : 'bg-amber-950 text-amber-300 border border-amber-500'}`}>
                                {b.read ? 'READ' : 'NEW'}
                              </span>
                            </div>
                            <strong className="text-xs truncate block font-bold text-slate-100">
                              {b.title}
                            </strong>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Notice Content */}
                  <div className="md:col-span-2 bg-slate-950/90 p-4 md:p-5 rounded-2xl border border-cyan-900/80 flex flex-col justify-between gap-3 min-h-[300px]">
                    {currentNotice ? (
                      <div className="space-y-3">
                        <div className="border-b border-cyan-800/60 pb-2">
                          <h3 className="text-sm md:text-base font-black text-yellow-400 tracking-wide">
                            {currentNotice.title}
                          </h3>
                          <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                            <span>Author: <strong className="text-cyan-300">{currentNotice.author}</strong></span>
                            <span>Stardate: <strong className="text-slate-200">{currentNotice.date}</strong></span>
                          </div>
                        </div>

                        <div className="space-y-2 text-slate-200 text-xs leading-relaxed max-h-52 overflow-y-auto pr-1">
                          {currentNotice.paragraphs.map((p, pIdx) => (
                            <p key={pIdx} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                              {p}
                            </p>
                          ))}
                        </div>

                        <div className="p-2.5 bg-cyan-950/40 rounded-xl border border-cyan-800/60 text-cyan-300 text-[11px] italic flex items-start gap-2">
                          <span className="text-yellow-400 font-bold not-italic shrink-0">📝</span>
                          <span>{staticAside}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-xs italic py-8 text-center">
                        No corporate notices in log.
                      </div>
                    )}

                    {/* Pagination Bar */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (total > 0) {
                              setShipsLogNoticeIdx((prev) => (prev - 1 + total) % total);
                              gameAudio.playCrispClick();
                            }
                          }}
                          disabled={total <= 1}
                          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-cyan-300 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1"
                        >
                          <ChevronLeft size={14} />
                          <span>Previous</span>
                        </button>
                        <span className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-yellow-400">
                          {total > 0 ? safeIdx + 1 : 0} of {total}
                        </span>
                        <button
                          onClick={() => {
                            if (total > 0) {
                              setShipsLogNoticeIdx((prev) => (prev + 1) % total);
                              gameAudio.playCrispClick();
                            }
                          }}
                          disabled={total <= 1}
                          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-cyan-300 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1"
                        >
                          <span>Next</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      {currentNotice && (
                        <button
                          onClick={() => {
                            setBulletins((prev) =>
                              prev.map((b) => (b.id === currentNotice.id ? { ...b, read: !b.read } : b))
                            );
                            gameAudio.playConfirmSelect();
                            handleSaveToSlot(activeSlot);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1"
                        >
                          <Check size={13} />
                          <span>{currentNotice.read ? 'Mark Unread' : 'Mark Read'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* TAB 2: ALIEN TRANSMISSIONS & COMMS TRANSCRIPTS */}
            {shipsLogTab === 'alien_comms' && (() => {
              const history = alienCommsState.dialogueHistory;
              const total = history.length;
              const safeIdx = total > 0 ? Math.min(Math.max(0, shipsLogAlienIdx), total - 1) : 0;
              const currentEntry = total > 0 ? history[safeIdx] : null;
              const staticAlienAside = currentEntry
                ? CAPTAIN_ASIDES.alien[Math.abs(currentEntry.race.charCodeAt(0) + currentEntry.subject.charCodeAt(0)) % CAPTAIN_ASIDES.alien.length]
                : '';

              if (total === 0) {
                return (
                  <div className="bg-slate-950/90 p-8 rounded-2xl border border-pink-900/80 flex flex-col items-center text-center gap-3 text-xs">
                    <Radio size={32} className="text-pink-400 animate-pulse" />
                    <strong className="text-sm font-black text-white">NO ALIEN TRANSMISSIONS RECORDED YET</strong>
                    <p className="text-slate-300 max-w-md">
                      When your starship intercepts alien vessels in deep space or orbit, open subspace communications (<strong className="text-cyan-300">Comms ➔ Hail Subspace</strong>) to record diplomatic transcripts into your log.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Left List */}
                  <div className="bg-slate-950/90 p-3 rounded-2xl border border-pink-900/80 flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-pink-300 border-b border-slate-800 pb-1">
                      RECORDED TRANSCRIPTS ({total})
                    </span>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                      {history.map((entry, idx) => {
                        const isSel = idx === safeIdx;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setShipsLogAlienIdx(idx);
                              gameAudio.playCrispClick();
                            }}
                            className={`w-full p-2.5 rounded-xl text-left border transition flex flex-col gap-0.5 ${
                              isSel
                                ? 'bg-pink-950/80 border-pink-400 text-white shadow-md'
                                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className={isSel ? 'text-yellow-300 font-bold' : 'text-slate-400'}>
                                {entry.race}
                              </span>
                              <span className="text-slate-400">{entry.timestamp}</span>
                            </div>
                            <strong className="text-xs truncate block text-slate-100">
                              Topic: {entry.subject}
                            </strong>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="md:col-span-2 bg-slate-950/90 p-4 md:p-5 rounded-2xl border border-pink-900/80 flex flex-col justify-between gap-3 min-h-[300px]">
                    {currentEntry && (
                      <div className="space-y-3">
                        <div className="border-b border-pink-800/60 pb-2 flex justify-between items-center">
                          <div>
                            <h3 className="text-sm md:text-base font-black text-pink-300">
                              {currentEntry.race.toUpperCase()} • TOPIC: {currentEntry.subject.toUpperCase()}
                            </h3>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Recorded Stardate: {currentEntry.timestamp}
                            </span>
                          </div>
                          <span className="bg-pink-950 border border-pink-500 text-pink-300 px-2 py-0.5 rounded text-[10px] font-bold">
                            VERIFIED TRANSCRIPT
                          </span>
                        </div>

                        {/* Translated Dialogue Text */}
                        <div className="space-y-2">
                          <strong className="text-[11px] text-cyan-300 uppercase block font-mono">
                            Decrypted Subspace Message:
                          </strong>
                          <p className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-slate-100 text-xs font-mono leading-relaxed select-text">
                            "{currentEntry.text}"
                          </p>
                        </div>

                        {/* Raw Dialect Text */}
                        {currentEntry.rawText && currentEntry.rawText !== currentEntry.text && (
                          <div className="space-y-1 text-[11px]">
                            <span className="text-slate-400 font-mono block">Original Alien Transmission Carrier:</span>
                            <p className="bg-slate-950 p-2 rounded-lg border border-slate-900 text-slate-400 font-mono text-[10px] truncate">
                              "{currentEntry.rawText}"
                            </p>
                          </div>
                        )}

                        <div className="p-2.5 bg-pink-950/40 rounded-xl border border-pink-800/60 text-pink-300 text-[11px] italic flex items-start gap-2">
                          <span className="text-yellow-400 font-bold not-italic shrink-0">📝</span>
                          <span>{staticAlienAside}</span>
                        </div>
                      </div>
                    )}

                    {/* Pagination */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          if (total > 0) {
                            setShipsLogAlienIdx((prev) => (prev - 1 + total) % total);
                            gameAudio.playCrispClick();
                          }
                        }}
                        disabled={total <= 1}
                        className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-pink-300 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1"
                      >
                        <ChevronLeft size={14} />
                        <span>Previous</span>
                      </button>
                      <span className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-yellow-400">
                        {safeIdx + 1} of {total}
                      </span>
                      <button
                        onClick={() => {
                          if (total > 0) {
                            setShipsLogAlienIdx((prev) => (prev + 1) % total);
                            gameAudio.playCrispClick();
                          }
                        }}
                        disabled={total <= 1}
                        className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-pink-300 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1"
                      >
                        <span>Next</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* TAB 3: BRIDGE LOG & BANTER MESSAGES */}
            {shipsLogTab === 'messages' && (
              <div className="space-y-3 text-xs">
                <BridgeLogFilters prefix="Full log" type={shipsLogMsgFilter} search={shipsLogMsgSearch} onType={setShipsLogMsgFilter} onSearch={setShipsLogMsgSearch} count={filterBridgeMessages(systemMessages,shipsLogMsgFilter,shipsLogMsgSearch).length} total={systemMessages.length}/>
                {/* Message Log List */}
                <div className="bg-slate-950/90 p-3 rounded-2xl border border-purple-900/80 space-y-2 max-h-80 overflow-y-auto pr-1">
                  {!filterBridgeMessages(systemMessages,shipsLogMsgFilter,shipsLogMsgSearch).length&&<p className="text-slate-400 p-2">No matching messages.</p>}
                  {filterBridgeMessages(systemMessages,shipsLogMsgFilter,shipsLogMsgSearch)
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 font-mono text-xs ${
                          msg.type === 'alert'
                            ? 'bg-red-950/60 border-red-800/80 text-red-200'
                            : msg.type === 'banter'
                            ? 'bg-cyan-950/50 border-cyan-800/80 text-cyan-200 italic'
                            : 'bg-slate-900/80 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="shrink-0 font-bold">
                          {msg.type === 'alert' ? '🚨' : msg.type === 'banter' ? '💬' : 'ℹ️'}
                        </div>
                        <div className="flex-1">
                          {msg.speaker && (
                            <strong className="text-yellow-400 mr-1.5 not-italic">
                              [{msg.speaker}]:
                            </strong>
                          )}
                          <span className="leading-relaxed">{msg.text}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* TAB 4: PLANETARY SURVEY & COLONY REGISTRY */}
            {shipsLogTab === 'planets' && (() => {
              const total = evaluations.length;
              const safeIdx = total > 0 ? Math.min(Math.max(0, shipsLogPlanetIdx), total - 1) : 0;
              const currentEval = total > 0 ? evaluations[safeIdx] : null;
              const staticPlanetAside = currentEval
                ? CAPTAIN_ASIDES.colony[Math.abs(currentEval.planetName.charCodeAt(0) + (currentEval.colonyName || '').charCodeAt(0)) % CAPTAIN_ASIDES.colony.length]
                : '';

              if (total === 0) {
                return (
                  <div className="bg-slate-950/90 p-8 rounded-2xl border border-emerald-900/80 flex flex-col items-center text-center gap-3 text-xs">
                    <Globe size={32} className="text-emerald-400 animate-pulse" />
                    <strong className="text-sm font-black text-white">NO PLANETARY SURVEYS RECORDED YET</strong>
                    <p className="text-slate-300 max-w-md">
                      While established in orbit around an uncharted world, select <strong className="text-amber-400">Command ➔ Log Planet</strong> to evaluate habitability and claim exploratory discovery grants.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Left List */}
                  <div className="bg-slate-950/90 p-3 rounded-2xl border border-emerald-900/80 flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-emerald-300 border-b border-slate-800 pb-1">
                      LOGGED WORLDS ({total})
                    </span>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                      {evaluations.map((ev, idx) => {
                        const isSel = idx === safeIdx;
                        const isSuit = ev.verdict === 'SUITABLE' || ev.suitable;
                        return (
                          <button
                            key={ev.id}
                            onClick={() => {
                              setShipsLogPlanetIdx(idx);
                              gameAudio.playCrispClick();
                            }}
                            className={`w-full p-2.5 rounded-xl text-left border transition flex flex-col gap-0.5 ${
                              isSel
                                ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-md'
                                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <strong className="text-white truncate block">{ev.colonyName || ev.planetName}</strong>
                              <span className={`px-1 rounded font-bold ${isSuit ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isSuit ? 'SUITABLE' : 'UNSUITABLE'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {ev.planetName} • {isSuit ? `+${(ev.payout > 0 ? ev.payout : (ev.bonus || 0)).toLocaleString()} M.U.` : `-${Math.abs(ev.payout < 0 ? ev.payout : (ev.fine || 100)).toLocaleString()} M.U.`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="md:col-span-2 bg-slate-950/90 p-4 md:p-5 rounded-2xl border border-emerald-900/80 flex flex-col justify-between gap-3 min-h-[300px]">
                    {currentEval && (
                      <div className="space-y-3">
                        <div className="border-b border-emerald-800/60 pb-2 flex justify-between items-center">
                          <div>
                            <h3 className="text-sm md:text-base font-black text-white font-mono">
                              COLONY LOG: {(currentEval.colonyName || currentEval.planetName).toUpperCase()}
                            </h3>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Target World: {currentEval.planetName} • System: [{currentEval.starX ?? currentStar.x}, {currentEval.starY ?? currentStar.y}] • Stardate: {currentEval.stardate}
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs border ${
                              currentEval.verdict === 'SUITABLE' || currentEval.suitable
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-400'
                                : 'bg-red-950 text-red-300 border-red-500'
                            }`}
                          >
                            VERDICT: {currentEval.verdict || (currentEval.suitable ? 'SUITABLE' : 'UNSUITABLE')}
                          </span>
                        </div>

                        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2 font-mono">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Directorate Financial Impact:</span>
                            {currentEval.suitable || currentEval.verdict === 'SUITABLE' ? (
                              <strong className="text-emerald-400 font-bold">
                                Bonus: +{(currentEval.payout > 0 ? currentEval.payout : (currentEval.bonus || 0)).toLocaleString()} M.U. (CREDITED)
                              </strong>
                            ) : (
                              <strong className="text-red-400 font-bold">
                                Fine: -{Math.abs(currentEval.payout < 0 ? currentEval.payout : (currentEval.fine || 100)).toLocaleString()} M.U. (DEDUCTED)
                              </strong>
                            )}
                          </div>
                          <div className="text-xs text-slate-200">
                            <strong className="text-cyan-300 block text-[10px] uppercase mb-1">
                              Habitability Assessment:
                            </strong>
                            <p className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 leading-relaxed font-sans">
                              {currentEval.notes}
                            </p>
                          </div>
                        </div>

                        <div className="p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-800/60 text-emerald-300 text-[11px] italic flex items-start gap-2">
                          <span className="text-yellow-400 font-bold not-italic shrink-0">📝</span>
                          <span>{staticPlanetAside}</span>
                        </div>
                      </div>
                    )}

                    {/* Pagination */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          if (total > 0) {
                            setShipsLogPlanetIdx((prev) => (prev - 1 + total) % total);
                            gameAudio.playCrispClick();
                          }
                        }}
                        disabled={total <= 1}
                        className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-emerald-300 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1"
                      >
                        <ChevronLeft size={14} />
                        <span>Previous</span>
                      </button>
                      <span className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-yellow-400">
                        {safeIdx + 1} of {total}
                      </span>
                      <button
                        onClick={() => {
                          if (total > 0) {
                            setShipsLogPlanetIdx((prev) => (prev + 1) % total);
                            gameAudio.playCrispClick();
                          }
                        }}
                        disabled={total <= 1}
                        className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-emerald-300 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1"
                      >
                        <span>Next</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </MenuOverlay>
      )}

      {/* GAME OVER & CREW MEMORIAL MODAL */}
      {gameOverModal && (
        <MenuOverlay tone="danger" zIndex={90}>
          <div
            style={{
              backgroundImage: (assets['cinematic_memorial_viewport_img'] || assets['cinematic_memorial_viewport'])
                ? `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.92)), url(${assets['cinematic_memorial_viewport_img']?.src || assets['cinematic_memorial_viewport']?.src || 'assets/images/cinematic_memorial_viewport_img.png'})`
                : undefined,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              width: '100%',
            }}
            className="w-full max-w-lg glass-panel border-2 border-red-500 rounded-3xl p-6 md:p-7 shadow-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden"
          >
            <AlertTriangle size={40} className="text-red-400 animate-bounce" />
            <h2 className="text-xl font-black text-red-200 tracking-wide">{gameOverModal.title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{gameOverModal.desc}</p>
            <div className="p-3.5 bg-red-950/80 border border-red-700/80 rounded-2xl text-amber-300 italic text-xs font-mono shadow-inner">
              "{gameOverModal.poignantLine}"
            </div>
            <button
              onClick={() => {
                setGameOverModal(null);
                setSystemMessages([]);
                setBanterLog([]);
                setGameState({ status: 'START', score: 100, level: 1 });
              }}
              className="bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-7 py-3 rounded-2xl font-black text-xs shadow-xl transition hover:scale-105"
            >
              [RETURN TO TITLE SCREEN]
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* ANIMATED TITLE SCREEN */}
      {gameState.status === 'START' && (
        <div
          className="absolute inset-0 z-40 flex flex-col items-center justify-start p-4 overflow-y-auto bg-[#030712]"
        >
          <canvas
            ref={titleCanvasRef}
            width={1280}
            height={720}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
              pointerEvents: 'none',
            }}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          <div
            style={{
              position: 'relative',
              zIndex: 2,
            }}
            className="relative z-[2] w-full max-w-2xl glass-panel rounded-3xl p-5 md:p-7 shadow-2xl flex flex-col items-center text-center gap-3.5 md:gap-4 my-auto"
          >
            {/* Storage Persistence Notice Banner */}
            <div className="w-full bg-amber-950/90 border border-amber-500/80 text-amber-200 px-4 py-2.5 rounded-2xl text-xs font-bold text-center shadow-md flex items-center justify-center gap-2">
              <AlertTriangle size={16} className="text-yellow-400 shrink-0 animate-pulse" />
              <span>{savePersistenceNotice}</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black tracking-widest text-cyan-300 neon-glow-cyan">
                STARFLIGHT
              </h1>
              <h2 className="text-2xl md:text-3xl font-black tracking-widest text-cyan-300 neon-glow-cyan">
                JUNIOR CREW
              </h2>
              <p className="text-xs md:text-sm text-yellow-400 font-bold tracking-wide">
                Interstel Follow-Up Survey Fleet • Junior Crew Division
              </p>
            </div>

            {/* Hero Action Buttons including Import Save */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={handleContinue}
                autoFocus
                className="bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 px-4 py-3 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-xl transition hover:scale-105"
              >
                <Play size={16} className="fill-current text-slate-950" />
                CONTINUE MISSION
              </button>
              <button
                onClick={handleRequestNewMission}
                className="bg-linear-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 px-4 py-3 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-xl transition hover:scale-105"
              >
                <Sparkles size={16} />
                START NEW MISSION
              </button>
              <button
                onClick={() => {
                  setImportDestSlot('A');
                  setImportCodeInput('');
                  setImportStatus(null);
                  setIsImportModalOpen(true);
                  gameAudio.playConfirmSelect();
                }}
                className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-3 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-xl transition hover:scale-105"
              >
                <Upload size={16} />
                IMPORT SAVE
              </button>
            </div>

            {/* Save Slot Cards (A - E) */}
            <div className="w-full flex flex-col gap-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Mission Save Slots (A – E)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Click a slot to resume or export
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                {saveSlots.map((s) => {
                  const isSelected = activeSlot === s.slot;
                  const isDevSave = s.isDev || s.snapshot?.isDev;
                  const selectSlot = () => {
                    setActiveSlot(s.slot);
                    gameAudio.playCrispClick();
                    if (s.empty) beginNewMission(s.slot);
                    else if (s.snapshot || s.loadError) handleLoadFromSlot(s.slot);
                    else {
                      setIntroPage(0);
                      setGameLocation(s.location || 'Starport');
                      setActiveRoomIndex(null);
                      setAstronautX(640);
                      setAstronautY(360);
                      setSystemMessages(s.bridgeLog ? JSON.parse(JSON.stringify(s.bridgeLog)) : []);
                      setBanterLog([]);
                      setGameState({ status: 'PLAYING', score: 100, level: 1 });
                      setIsGameMenuOpen(false);
                      gameAudio.playPowerupChime();
                    }
                  };
                  return (
                    <div
                      key={s.slot}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 min-h-[82px] ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_12px_#00f0ff60]'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={selectSlot}
                        data-testid={`resume-slot-${s.slot}`}
                        aria-label={s.empty ? `Start mission in Slot ${s.slot}` : `Resume Slot ${s.slot}: ${s.shipName}`}
                        className="text-left flex flex-1 flex-col gap-1.5 rounded focus-visible:outline-2 focus-visible:outline-cyan-400"
                      >
                      <div className="flex flex-col items-start gap-1 w-full">
                        <div className="flex items-center gap-1">
                          <strong className="text-yellow-400">SLOT {s.slot}</strong>
                          {isDevSave && (
                            <span className="bg-red-950 border border-red-500 text-red-300 px-1 py-0.2 rounded text-[8px] font-black tracking-widest shadow-[0_0_6px_#ef4444]">
                              DEV
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{s.empty ? 'Empty' : s.stardate}</span>
                      </div>
                      <div className="text-[11px] truncate font-bold text-slate-200">
                        {s.empty ? <span className="text-slate-500 italic">Empty</span> : s.shipName}
                      </div>
                      <span className={`text-[10px] font-mono whitespace-nowrap ${s.empty ? 'text-slate-500 italic' : 'text-amber-300'}`}>
                        {s.empty ? 'Click to start' : `${s.credits.toLocaleString()} M.U.`}
                      </span>
                      </button>
                      {!s.empty && (
                          <button
                            type="button"
                            onClick={() => handleOpenExportModal(s.slot)}
                            aria-label={`Export Slot ${s.slot}`}
                            className="bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-600 px-1.5 py-1 rounded text-[9px] font-black flex items-center justify-center gap-1"
                            title="Export this save slot"
                          >
                            <Download size={10} />
                            Export
                          </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HOLOGRAPHIC STARMAP INTERACTIVE MODAL */}
      {isStarmapOpen && (
        <MenuOverlay tone="neutral" zIndex={60}>
          <div role="dialog" aria-modal="true" aria-label="Holographic starmap" className="starmap-dialog w-full max-w-4xl glass-panel rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col gap-4 text-slate-100 border border-cyan-400/40">
            {/* Starmap Header */}
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-cyan-900/60 pb-2">
              <div className="flex items-center gap-2.5">
                <Globe size={22} className="text-cyan-400 animate-pulse" />
                <div>
                  <h2 className="text-lg md:text-xl font-black text-cyan-300 tracking-wider">
                    HOLOGRAPHIC STARMAP PROJECTION (250 × 220 QUADRANT)
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Ship Coordinates: <strong className="text-yellow-400">[{Math.round(galaxyShipX)}, {Math.round(galaxyShipY)}]</strong> • Available Fuel: <strong className="text-amber-400 font-mono">{enduriumFuel.toFixed(2)} m³</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsStarmapOpen(false);
                  gameAudio.playCrispClick();
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-cyan-600 text-cyan-300 px-4 py-1.5 rounded-xl font-black text-xs shadow transition flex items-center gap-1"
              >
                ✕ Close Starmap
              </button>
            </div>

            <div role="group" aria-label="Star chart view controls" className="[&_button]:rounded-lg [&_button]:border [&_button]:border-cyan-800 [&_button]:px-3 [&_button]:py-2 [&_button:disabled]:opacity-40 flex flex-wrap items-center gap-2 text-xs">
              <button disabled={starmapZoom<=1} onClick={()=>zoomStarChart(1/1.5)} aria-label="Zoom out star chart">−</button><span>{starmapZoom.toFixed(1)}×</span><button disabled={starmapZoom>=8} onClick={()=>zoomStarChart(1.5)} aria-label="Zoom in star chart">+</button>
              <button onClick={()=>{setStarmapZoom(1);setStarmapCenter({x:125,y:110});}}>Whole quadrant</button><button onClick={()=>{setStarmapCenter({x:galaxyShipX,y:galaxyShipY});setStarmapZoom(z=>Math.max(2,z));}}>Center on ship</button>
              {([['West',-1,0],['East',1,0],['North',0,1],['South',0,-1]] as const).map(([name,dx,dy])=><button key={name} disabled={starmapZoom<=1} onClick={()=>setStarmapCenter({x:chartView.center.x+dx*30/starmapZoom,y:chartView.center.y+dy*30/starmapZoom})}>{name}</button>)}
            </div>
            {/* Interactive Holographic Canvas (Strict 1:1 Aspect Ratio: 250 x 220 bounds) */}
            <div className="starmap-chart w-full bg-[#030617] rounded-2xl border border-cyan-900/80 p-2 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <canvas
                width={800}
                height={704}
                aria-label="Galactic star chart"
                data-chart-view={JSON.stringify({zoom:chartView.zoom,center:chartView.center})}
                onMouseLeave={()=>setStarmapHoverStarId(null)}
                style={{ width: '100%', height: 'auto', aspectRatio: '800/704' }}
                className="cursor-crosshair rounded-xl"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = (e.clientX - rect.left) * (800 / rect.width);
                  const clickY = (e.clientY - rect.top) * (704 / rect.height);
                  const unitScale = 800 / 250; // 3.2

                  // Find closest star within click threshold
                  let closestStar: GalaxyStar | null = null;
                  let minDist = 22;

                  for (const st of UNIVERSE.stars) {
                    const {x:sx,y:sy}=chartView.project(st);
                    const d = Math.hypot(clickX - sx, clickY - sy);
                    if (d < minDist) {
                      minDist = d;
                      closestStar = st;
                    }
                  }

                  if (closestStar) {
                    setStarmapSelectedStarId(closestStar.id);
                    gameAudio.playConfirmSelect();
                  }
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const mouseX = (e.clientX - rect.left) * (800 / rect.width);
                  const mouseY = (e.clientY - rect.top) * (704 / rect.height);
                  const unitScale = 800 / 250;

                  let foundHover: GalaxyStar | null = null;
                  for (const st of UNIVERSE.stars) {
                    const {x:sx,y:sy}=chartView.project(st);
                    if (Math.hypot(mouseX - sx, mouseY - sy) <= 14) {
                      foundHover = st;
                      break;
                    }
                  }
                  setStarmapHoverStarId(foundHover ? foundHover.id : null);
                }}
                ref={(starmapCanvas) => {
                  if (!starmapCanvas) return;
                  const sCtx = starmapCanvas.getContext('2d');
                  if (!sCtx) return;

                  const mapW = 800;
                  const mapH = 704;
                  const unitScale = mapW / 250; // 3.2, exactly 1:1 scaleX === scaleY
                  const sScaleX = unitScale;
                  const sScaleY = unitScale;
                  const nowS = performance.now() / 1000;

                  // Dark Blue Holographic Grid
                  sCtx.fillStyle = '#030717';
                  sCtx.fillRect(0, 0, mapW, mapH);
                  sCtx.save();sCtx.translate(chartView.tx,chartView.ty);sCtx.scale(chartView.zoom,chartView.zoom);

                  // Grid Lines
                  sCtx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
                  sCtx.lineWidth = 1;
                  for (let gx = 0; gx <= mapW; gx += unitScale * 25) {
                    sCtx.beginPath();
                    sCtx.moveTo(gx, 0);
                    sCtx.lineTo(gx, mapH);
                    sCtx.stroke();
                  }
                  for (let gy = 0; gy <= mapH; gy += unitScale * 25) {
                    sCtx.beginPath();
                    sCtx.moveTo(0, gy);
                    sCtx.lineTo(mapW, gy);
                    sCtx.stroke();
                  }

                  // Alien Territories (Faint colored subtle navigation sector zones)
                  ALIEN_TERRITORIES.forEach((terr) => {
                    const tx = terr.x * sScaleX;
                    const ty = (220 - terr.y) * sScaleY;
                    const tRadius = terr.radius * sScaleX;

                    sCtx.save();
                    sCtx.fillStyle = `${terr.color}10`;
                    sCtx.strokeStyle = `${terr.color}30`;
                    sCtx.lineWidth = 1;
                    sCtx.beginPath();
                    sCtx.arc(tx, ty, tRadius, 0, Math.PI * 2);
                    sCtx.fill();
                    sCtx.stroke();
                    sCtx.restore();
                  });

                  // Soft Nebular Clouds
                  UNIVERSE.nebulae.forEach((neb) => {
                    const nx = neb.x * sScaleX;
                    const ny = (220 - neb.y) * sScaleY;
                    const nr = neb.radius * sScaleX;

                    const nGrad = sCtx.createRadialGradient(nx, ny, 2, nx, ny, nr);
                    nGrad.addColorStop(0, neb.color);
                    nGrad.addColorStop(1, 'transparent');
                    sCtx.fillStyle = nGrad;
                    sCtx.beginPath();
                    sCtx.arc(nx, ny, nr, 0, Math.PI * 2);
                    sCtx.fill();
                  });

                  // Distinct Bright Cyan Lines for Traversed / Known Continuum Fluxes with Pulsing Endpoint Nodes
                  CONTINUUM_FLUX_PAIRS.forEach((flux) => {
                    const isKnown = hasRingDevice || traversedFluxIds.includes(flux.id);
                    if (isKnown) {
                      const fx1 = flux.from[0] * sScaleX;
                      const fy1 = (220 - flux.from[1]) * sScaleY;
                      const fx2 = flux.to[0] * sScaleX;
                      const fy2 = (220 - flux.to[1]) * sScaleY;

                      // Bright distinct cyan vector line
                      sCtx.save();
                      sCtx.strokeStyle = '#00f0ff';
                      sCtx.shadowColor = '#00f0ff';
                      sCtx.shadowBlur = 10;
                      sCtx.lineWidth = 2.5;
                      sCtx.beginPath();
                      sCtx.moveTo(fx1, fy1);
                      sCtx.lineTo(fx2, fy2);
                      sCtx.stroke();

                      // Pulsing endpoint nodes
                      const pulseR = 3.5 + Math.sin(nowS * 8 + flux.id) * 1.5;
                      sCtx.fillStyle = '#ffffff';
                      sCtx.beginPath();
                      sCtx.arc(fx1, fy1, pulseR, 0, Math.PI * 2);
                      sCtx.arc(fx2, fy2, pulseR, 0, Math.PI * 2);
                      sCtx.fill();
                      sCtx.restore();
                    }
                  });

                  // Canonical Stars Projection
                  UNIVERSE.stars.forEach((st) => {
                    const sx = st.x * sScaleX;
                    const sy = (220 - st.y) * sScaleY;
                    const spec = SPECTRAL_PROPS[st.spectral] || SPECTRAL_PROPS.G;
                    const isTarget = starmapSelectedStarId === st.id;
                    const isHover = starmapHoverStarId === st.id;

                    // Star Glow
                    sCtx.fillStyle = spec.color;
                    sCtx.beginPath();
                    sCtx.arc(sx, sy, (isTarget || isHover ? 6 : 3)/chartView.zoom, 0, Math.PI * 2);
                    sCtx.fill();

                    if (isTarget || isHover) {
                      sCtx.strokeStyle = '#ffffff';
                      sCtx.lineWidth = 1.5;
                      sCtx.beginPath();
                      sCtx.arc(sx, sy, 9/chartView.zoom, 0, Math.PI * 2);
                      sCtx.stroke();
                    }
                  });

                  // Pulsing Ship Beacon
                  const shipMapX = galaxyShipX * sScaleX;
                  const shipMapY = (220 - galaxyShipY) * sScaleY;
                  const beaconPulse = Math.sin(nowS * 6) * 3 + 6;

                  sCtx.strokeStyle = '#00f0ff';
                  sCtx.lineWidth = 2;
                  sCtx.beginPath();
                  sCtx.arc(shipMapX, shipMapY, beaconPulse/chartView.zoom, 0, Math.PI * 2);
                  sCtx.stroke();

                  sCtx.fillStyle = '#ffffff';
                  sCtx.beginPath();
                  sCtx.arc(shipMapX, shipMapY, 3/chartView.zoom, 0, Math.PI * 2);
                  sCtx.fill();

                  // Projected Flight Path to Selected Target Star
                  const targetStar = UNIVERSE.stars.find((s) => s.id === (starmapSelectedStarId ?? starmapHoverStarId));
                  if (targetStar) {
                    const tgtX = targetStar.x * sScaleX;
                    const tgtY = (220 - targetStar.y) * sScaleY;
                    const distCoords = Math.hypot(targetStar.x - galaxyShipX, targetStar.y - galaxyShipY);
                    const fuelReq = +(distCoords * activeFuelBurnRate).toFixed(2);

                    // Dotted Flight Path Line
                    sCtx.strokeStyle = fuelReq <= enduriumFuel ? '#00f0ff' : '#ef4444';
                    sCtx.lineWidth = 2;
                    sCtx.setLineDash([5, 5]);
                    sCtx.beginPath();
                    sCtx.moveTo(shipMapX, shipMapY);
                    sCtx.lineTo(tgtX, tgtY);
                    sCtx.stroke();
                    sCtx.setLineDash([]);

                    // Targeting Crosshair Reticle
                    sCtx.strokeStyle = '#facc15';
                    sCtx.lineWidth = 1.5;
                    const reticleSize = 14 + Math.sin(nowS * 8) * 2;
                    sCtx.beginPath();
                    sCtx.arc(tgtX, tgtY, reticleSize/chartView.zoom, 0, Math.PI * 2);
                    sCtx.stroke();

                    // Distance & Fuel Cost Badge
                    const midX = (shipMapX + tgtX) / 2;
                    const midY = (shipMapY + tgtY) / 2 - 10;
                    sCtx.save();sCtx.translate(midX,midY);sCtx.scale(1/chartView.zoom,1/chartView.zoom);sCtx.translate(-midX,-midY);
                    sCtx.fillStyle = '#000000dd';
                    sCtx.fillRect(midX - 55, midY - 14, 110, 24);
                    sCtx.strokeStyle = fuelReq <= enduriumFuel ? '#00f0ff' : '#ef4444';
                    sCtx.strokeRect(midX - 55, midY - 14, 110, 24);

                    sCtx.fillStyle = fuelReq <= enduriumFuel ? '#38bdf8' : '#f87171';
                    sCtx.font = 'bold 10px "Rajdhani", sans-serif';
                    sCtx.textAlign = 'center';
                    sCtx.fillText(`${distCoords.toFixed(1)} LY • ${fuelReq} m³ En`, midX, midY + 2);sCtx.restore();
                  }
                  sCtx.restore();
                }}
              />
              <details className="absolute top-3 right-3 max-w-[min(80%,20rem)] rounded-lg border border-cyan-800 bg-slate-950/95 p-2 text-xs z-10"><summary className="cursor-pointer text-cyan-200">Chart legend</summary><div className="max-h-64 overflow-y-auto p-2" aria-label="Star chart legend">
                <p>Star color = spectral class (hot blue to cool red).</p><div className="flex flex-wrap gap-3">{Object.entries(SPECTRAL_PROPS).map(([name,spec])=><span key={name} style={{color:spec.color}}>★ {name}</span>)}</div>
                <p className="mt-3">Colored circles = approximate alien territory.</p>{ALIEN_TERRITORIES.map(t=><span className="inline-block mr-3" key={t.name} style={{color:t.color}}>◯ {t.name}</span>)}
                <p className="mt-3">Clouds: nebulae · Cyan lines: known continuum fluxes · Cyan beacon: your ship · Yellow ring: target · Red route: insufficient fuel.</p>
              </div></details>
            </div>

            {/* Selected Star Telemetry Panel: fixed space prevents hover recentering. */}
            <div className="starmap-telemetry" aria-label="Star telemetry">
            {(() => {
              const activeTarget = UNIVERSE.stars.find((s) => s.id === (starmapSelectedStarId ?? starmapHoverStarId));
              if (!activeTarget) {
                return (
                  <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-400 italic text-center">
                    Hover or click any star in the 250×220 holographic field to inspect stellar telemetry & calculate jump trajectory.
                  </div>
                );
              }

              const dist = Math.hypot(activeTarget.x - galaxyShipX, activeTarget.y - galaxyShipY);
              const fuelCost = +(dist * activeFuelBurnRate).toFixed(2);
              const canReach = fuelCost <= enduriumFuel;

              return (
                <div className="p-3 bg-slate-950/90 rounded-2xl border border-cyan-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        backgroundColor: `${SPECTRAL_PROPS[activeTarget.spectral]?.color || '#ffd700'}25`,
                        borderColor: SPECTRAL_PROPS[activeTarget.spectral]?.color || '#ffd700',
                      }}
                      className="w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black text-sm"
                    >
                      {activeTarget.spectral}
                    </div>
                    <div>
                      <strong className="text-white text-sm block">Class {activeTarget.spectral} Star System [{activeTarget.x}, {activeTarget.y}]</strong>
                      <span className="text-slate-400">
                        Coordinates: <strong className="text-yellow-400">[{activeTarget.x}, {activeTarget.y}]</strong> • Spectral Class: {activeTarget.spectral} • Known Bodies: {activeTarget.planets.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-slate-400 text-[11px] block">Calculated Distance:</span>
                      <strong className="text-cyan-300 font-mono">{dist.toFixed(1)} Light Years</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[11px] block">Endurium Warp Cost:</span>
                      <strong className={canReach ? 'text-amber-400 font-mono' : 'text-red-400 font-mono font-bold'}>
                        {fuelCost} m³ {canReach ? '(AFFORDABLE)' : '(INSUFFICIENT)'}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })()}
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* CAPTAIN'S STARSHIP CARGO HOLD MODAL ([DESCRIBE] & [JETTISON]) */}
      {isShipCargoModalOpen && (
        <MenuOverlay tone="neutral" zIndex={85}>
          <div className="w-full max-w-2xl glass-panel border-2 border-emerald-500/80 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100 font-mono">
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2.5">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <Package size={22} className="text-yellow-400" />
                <div>
                  <h2 className="text-base md:text-lg font-black tracking-wider uppercase">
                    CAPTAIN'S LOG: STARSHIP CARGO HOLD MANIFEST
                  </h2>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Total Hold: <strong className="text-amber-300">{(
                      enduriumFuel +
                      Object.entries(cargoHold).reduce((a, [k, v]) => a + (k !== 'Endurium' ? v : 0), 0) +
                      artifactsInHold.reduce((a, art) => a + (art.volume || 0), 0) +
                      specimensInHold.reduce((a, sp) => a + (sp.volume || 0), 0)
                    ).toFixed(2)} / {50 + 50 * cargoPods} m³</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsShipCargoModalOpen(false);
                  setDescribedCargoItem(null);
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-xl text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            {/* Item description card if active */}
            {describedCargoItem && (
              <div className="p-3.5 bg-cyan-950/80 border border-cyan-500/80 rounded-2xl space-y-1.5 text-xs shadow-inner">
                <div className="flex justify-between items-center border-b border-cyan-800 pb-1">
                  <strong className="text-yellow-400 text-sm">{describedCargoItem.name}</strong>
                  <span className="text-slate-300 font-mono">Volume: {describedCargoItem.volume.toFixed(1)} m³</span>
                </div>
                <p className="text-slate-200 font-sans leading-relaxed">{describedCargoItem.desc}</p>
                {describedCargoItem.value !== undefined && (
                  <div className="text-emerald-400 font-bold font-mono pt-0.5">
                    Estimated Value: {describedCargoItem.value.toLocaleString()} M.U.
                  </div>
                )}
              </div>
            )}

            {/* Cargo Hold Items List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
              {/* Endurium Fuel */}
              <div className="p-3 bg-slate-950/90 rounded-2xl border border-cyan-800/80 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-300 font-bold">● Endurium Fuel Crystal</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-amber-300 border border-slate-800 font-mono">
                        {enduriumFuel.toFixed(2)} m³
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Primary crystalline propellant & shield power source.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setDescribedCargoItem({
                        name: 'Endurium Fuel Crystal',
                        desc: 'Dense crystalline fuel indispensable for hyperdrive warp jumps and tactical shielding. Current reserve: ' + enduriumFuel.toFixed(1) + ' m³.',
                        volume: enduriumFuel,
                        value: Math.round(enduriumFuel * 1000),
                      });
                      gameAudio.playDataChime();
                    }}
                    className="bg-cyan-900 hover:bg-cyan-800 border border-cyan-500 text-cyan-200 px-3 py-1 rounded-xl text-xs font-bold"
                  >
                    [Describe]
                  </button>
                  <button
                    onClick={() => {
                      if (enduriumFuel <= 1.0) {
                        gameAudio.playErrorBuzz();
                        addMessage('Captain: Cannot jettison critical minimum reserves of Endurium fuel.', 'Captain', 'alert');
                        return;
                      }
                      const jettisonAmt = Math.min(5.0, enduriumFuel - 1.0);
                      setEnduriumFuel((f) => Math.max(1.0, consumeFuel(f, jettisonAmt)));
                      gameAudio.playCoinPickup();
                      addMessage(`Jettisoned ${jettisonAmt.toFixed(2)} m³ Endurium fuel into space.`, 'Captain', 'info');
                      handleSaveToSlot(activeSlot);
                    }}
                    className="bg-red-900 hover:bg-red-800 border border-red-600 text-red-200 px-3 py-1 rounded-xl text-xs font-bold"
                  >
                    [Jettison]
                  </button>
                </div>
              </div>

              {/* Minerals */}
              {Object.entries(cargoHold).map(([mineral, vol]) => {
                if (vol <= 0) return null;
                const minInfo = MINERAL_CATALOG.find((m) => m.name === mineral);
                return (
                  <div key={mineral} className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{mineral}</span>
                        <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-yellow-300 border border-slate-800 font-mono">
                          {vol.toFixed(2)} m³
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{minInfo?.desc || 'Refined metal commodity'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setDescribedCargoItem({
                            name: mineral,
                            desc: minInfo?.desc || 'Mineral commodity stored in starship hold.',
                            volume: vol,
                            value: (minInfo?.price || 500) * vol,
                          });
                          gameAudio.playDataChime();
                        }}
                        className="bg-cyan-900 hover:bg-cyan-800 border border-cyan-500 text-cyan-200 px-3 py-1 rounded-xl text-xs font-bold"
                      >
                        [Describe]
                      </button>
                      <button
                        onClick={() => {
                          const jettisonAmt = Math.min(5.0, vol);
                          setCargoHold((prev) => ({
                            ...prev,
                            [mineral]: adjustCargoStock(prev[mineral] || 0, -jettisonAmt),
                          }));
                          gameAudio.playCoinPickup();
                          addMessage(`Jettisoned ${jettisonAmt.toFixed(2)} m³ ${mineral} from starship hold.`, 'Captain', 'info');
                          handleSaveToSlot(activeSlot);
                        }}
                        className="bg-red-900 hover:bg-red-800 border border-red-600 text-red-200 px-3 py-1 rounded-xl text-xs font-bold"
                      >
                        [Jettison]
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Artifacts */}
              {artifactsInHold.map((art, artIndex) => (
                <div key={`${art.id}-${artIndex}`} className="p-3 bg-slate-950/90 rounded-2xl border border-purple-900/80 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-yellow-400">{art.realName || art.codeName}</strong>
                      <span className="bg-purple-950 px-2 py-0.5 rounded text-[10px] text-purple-200 border border-purple-800 font-mono">
                        {art.volume} m³
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{art.description}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setDescribedCargoItem({
                          name: art.realName || art.codeName,
                          desc: art.description,
                          volume: art.volume,
                          value: art.basePrice,
                        });
                        gameAudio.playDataChime();
                      }}
                      className="bg-purple-900 hover:bg-purple-800 border border-purple-500 text-purple-200 px-3 py-1 rounded-xl text-xs font-bold"
                    >
                      [Describe]
                    </button>
                    <button
                      onClick={() => {
                        setArtifactsInHold((prev) => prev.filter((_, index) => index !== artIndex));
                        gameAudio.playCoinPickup();
                        addMessage(`Jettisoned artifact ${art.realName || art.codeName} into the void.`, 'Captain', 'info');
                        handleSaveToSlot(activeSlot);
                      }}
                      className="bg-red-900 hover:bg-red-800 border border-red-600 text-red-200 px-3 py-1 rounded-xl text-xs font-bold"
                    >
                      [Jettison]
                    </button>
                  </div>
                </div>
              ))}

              {/* Specimens */}
              {specimensInHold.map((spec, sIdx) => (
                <div key={spec.id || sIdx} className="p-3 bg-slate-950/90 rounded-2xl border border-emerald-900/80 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-emerald-400">{spec.name}</strong>
                      <span className="bg-emerald-950 px-2 py-0.5 rounded text-[10px] text-emerald-200 border border-emerald-800 font-mono">
                        {spec.volume} m³
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Captured lifeform specimen • Bounty: {spec.value.toLocaleString()} M.U.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setDescribedCargoItem({
                          name: spec.name,
                          desc: `Live biological specimen captured on planetary surface. Research bounty value: ${spec.value.toLocaleString()} M.U.`,
                          volume: spec.volume,
                          value: spec.value,
                        });
                        gameAudio.playDataChime();
                      }}
                      className="bg-emerald-900 hover:bg-emerald-800 border border-emerald-500 text-emerald-200 px-3 py-1 rounded-xl text-xs font-bold"
                    >
                      [Describe]
                    </button>
                    <button
                      onClick={() => {
                        setSpecimensInHold((prev) => prev.filter((_, i) => i !== sIdx));
                        gameAudio.playCoinPickup();
                        addMessage(`Jettisoned specimen ${spec.name} into space.`, 'Captain', 'info');
                        handleSaveToSlot(activeSlot);
                      }}
                      className="bg-red-900 hover:bg-red-800 border border-red-600 text-red-200 px-3 py-1 rounded-xl text-xs font-bold"
                    >
                      [Jettison]
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setIsShipCargoModalOpen(false);
                setDescribedCargoItem(null);
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-bold text-xs"
            >
              Close Cargo Hold
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* TERRAIN VEHICLE CARGO HOLD MODAL WITH [PICK UP NEAREST] & [DROP] */}
      {roverCargoModalOpen && (
        <MenuOverlay tone="neutral" zIndex={75}>
          <div className="w-full max-w-lg glass-panel border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100 font-mono">
            <div className="flex items-center justify-between border-b border-amber-900/60 pb-2.5">
              <div className="flex items-center gap-2.5 text-amber-400">
                <Package size={22} className="text-yellow-400" />
                <div>
                  <h2 className="text-base md:text-lg font-black tracking-wider">
                    TERRAIN ROVER CARGO HOLD INVENTORY
                  </h2>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Capacity: <strong className="text-amber-300">{vehicleHold.reduce((s, i) => s + i.volume, 0).toFixed(1)} / 50.0 m³</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setRoverCargoModalOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-xl text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            {/* Quick Pick Up Action Button inside Modal */}
            <button
              onClick={() => {
                handlePickUpNearby();
              }}
              className="w-full bg-emerald-700 hover:bg-emerald-600 border border-emerald-400 text-white py-2 rounded-xl font-black text-xs shadow flex items-center justify-center gap-2"
            >
              <Package size={14} />
              [Pick up Nearest Deposit / Specimen / Relic]
            </button>

            {vehicleHold.length === 0 ? (
              <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs italic">
                Terrain vehicle cargo hold is currently empty. Use [Pick up] or drive beside mineral nodes / lifeforms to collect.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {vehicleHold.map((item, idx) => {
                  const isBlackEgg = item.artifactRef?.id === 'art-black-egg' || item.name.toLowerCase().includes('black egg');

                  return (
                    <div
                      key={item.id || idx}
                      className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-white text-xs">{item.name}</strong>
                          <span className="bg-slate-900 px-1.5 py-0.2 rounded text-[10px] text-amber-300 font-mono border border-slate-800">
                            {item.volume} m³
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Estimated Value: {item.value.toLocaleString()} M.U. • Type: {item.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRoverDropCargo(idx, isBlackEgg)}
                          className={`${
                            isBlackEgg
                              ? 'bg-red-700 hover:bg-red-600 border border-red-400 text-white font-black animate-pulse'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 font-bold'
                          } px-3 py-1.5 rounded-xl text-xs flex items-center gap-1`}
                        >
                          {isBlackEgg ? <Bomb size={12} /> : <Trash2 size={12} />}
                          [Drop{isBlackEgg ? ' & Arm' : ''}]
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">
                Rover Coordinates: [{vehicleX.toFixed(1)}, {vehicleY.toFixed(1)}]
              </span>
              {Math.hypot(vehicleX, vehicleY) <= 1.5 && vehicleHold.length > 0 && (
                <button
                  onClick={() => {
                    handleBoardStarship();
                    setRoverCargoModalOpen(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl font-black text-xs shadow"
                >
                  Transfer All to Ship
                </button>
              )}
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* ROVER [LOOK] ENVIRONMENTAL SURVEY READOUT MODAL */}
      {roverLookData && (
        <MenuOverlay tone="neutral" zIndex={75}>
          <div className="w-full max-w-lg glass-panel border-2 border-cyan-400/80 rounded-3xl p-6 shadow-2xl flex flex-col gap-3.5 text-slate-100 font-mono">
            <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
              <div className="flex items-center gap-2.5 text-cyan-300">
                <Eye size={22} className="text-yellow-400" />
                <h2 className="text-base md:text-lg font-black tracking-wider uppercase">
                  ENVIRONMENTAL SURVEY READOUT [LOOK]
                </h2>
              </div>
              <button
                onClick={() => setRoverLookData(null)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-xl text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-950/90 p-4 rounded-2xl border border-cyan-900/60">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Atmosphere & Sky Appearance:</span>
                <strong className="text-cyan-200 block">{roverLookData.sky}</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Surface Temperature:</span>
                  <strong className="text-amber-300 block">{roverLookData.temp}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Surface Gravity:</span>
                  <strong className="text-emerald-400 block">{roverLookData.gravity}</strong>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Atmospheric Density:</span>
                  <strong className="text-slate-200 block">{roverLookData.atmosphere}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Hydrosphere:</span>
                  <strong className="text-cyan-300 block">{roverLookData.hydrosphere}</strong>
                </div>
              </div>
              <div className="pt-1 border-t border-slate-900">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Local Terrain Topology:</span>
                <strong className="text-purple-300 block">{roverLookData.topology}</strong>
              </div>

              {roverLookData.pointsOfInterest.length > 0 && (
                <div className="pt-1.5 border-t border-slate-800">
                  <span className="text-yellow-400 block text-[10px] uppercase font-bold mb-1">Nearby Points of Interest:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                    {roverLookData.pointsOfInterest.map((poi, idx) => (
                      <li key={idx} className="leading-snug">{poi}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => setRoverLookData(null)}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 rounded-xl font-black text-xs shadow-lg"
            >
              [RESUME ROVER EXPLORATION]
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* SURFACE TOPOGRAPHICAL TACTICAL MAP MODAL */}
      {isSurfaceMapOpen && (
        <MenuOverlay tone="neutral" zIndex={65}>
          <div role="dialog" aria-modal="true" aria-label="Topographical tactical map" tabIndex={0} className="surface-map-dialog w-full max-w-2xl glass-panel rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col gap-3 text-slate-100 border border-cyan-400/40">
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-cyan-900/60 pb-2">
              <div className="flex items-center gap-2">
                <Globe size={20} className="text-cyan-400" />
                <h2 className="text-base md:text-lg font-black text-cyan-300 tracking-wider">
                  TOPOGRAPHICAL TACTICAL MAP • {orbitPlanetIndex !== null ? currentPlanets[orbitPlanetIndex].name.toUpperCase() : 'PLANET SURFACE'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsSurfaceMapOpen(false);
                  gameAudio.playCrispClick();
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-cyan-600 text-cyan-300 px-3 py-1 rounded-xl text-xs font-bold"
              >
                ✕ Close Map
              </button>
            </div>

            <SurveyLegend/>
            <p className="text-xs text-slate-300">Local terrain · 41.7 × 29.2 km. Only recorded or nearby detected contacts appear here; global findings are below. Dashed halos show search areas. Click the local map to set a rover waypoint.</p>
            <p className="text-xs text-yellow-300" role="status">{roverWaypoint?`Waypoint: [${roverWaypoint.x.toFixed(1)}, ${roverWaypoint.y.toFixed(1)}] km · ${Math.hypot(roverWaypoint.x-vehicleX,roverWaypoint.y-vehicleY).toFixed(1)} km remaining`:'Waypoint: none selected. The rover and landed ship are always marked.'}</p>
            {/* Tactical Canvas */}
            <div className="surface-map-local-canvas w-full bg-[#030717] rounded-2xl border border-cyan-900/80 p-2 flex flex-col items-center justify-center">
              <canvas
                aria-label="Local terrain, recorded contacts and rover waypoint"
                data-rover-waypoint={roverWaypoint?JSON.stringify(roverWaypoint):'none'}
                width={500}
                height={350}
                style={{ width: '100%', height: 'auto', aspectRatio: '500/350' }}
                className="rounded-xl border border-cyan-950 cursor-crosshair"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickMapX = (e.clientX - rect.left) * (500 / rect.width);
                  const clickMapY = (e.clientY - rect.top) * (350 / rect.height);
                  const tCx = 500 / 2;
                  const tCy = 350 / 2;
                  const scale = 12; // px per km relative to landed ship at [0,0]
                  const targetX = (clickMapX - tCx) / scale;
                  const targetY = (clickMapY - tCy) / scale;
                  setRoverWaypoint({ x: +(targetX.toFixed(2)), y: +(targetY.toFixed(2)) });
                  gameAudio.playConfirmSelect();
                  addMessage(`Tactical Map destination set to [${targetX.toFixed(2)} km, ${targetY.toFixed(2)} km]. Auto-drive engaged.`, 'Captain', 'info');
                }}
                ref={(topoCanvas) => {
                  if (!topoCanvas) return;
                  const tCtx = topoCanvas.getContext('2d');
                  if (!tCtx) return;

                  const mapW = 500;
                  const mapH = 350;
                  const tCx = mapW / 2;
                  const tCy = mapH / 2;
                  const scale = 12; // px per km

                  tCtx.fillStyle = '#050a18';
                  tCtx.fillRect(0, 0, mapW, mapH);

                  if(currentSurfaceState&&orbitPlanetIndex!==null){
                    const p=currentPlanets[orbitPlanetIndex];
                    const terrain=planetTopography(currentSurfaceState.planetSeed,p.hydrospherePercent,p.type,{lon:landingLong,lat:landingLat,spanLon:mapW/scale*.2,spanLat:mapH/scale*.2,width:500,height:350});
                    if(terrain)tCtx.drawImage(terrain,0,0,mapW,mapH);
                    tCtx.fillStyle='rgba(3,10,24,.38)';tCtx.fillRect(0,0,mapW,mapH);
                  }
                  topoCanvas.dataset.topography='true';

                  // Elevation grid contours
                  tCtx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
                  tCtx.lineWidth = 1;
                  for (let gx = 0; gx <= mapW; gx += 25) {
                    tCtx.beginPath();
                    tCtx.moveTo(gx, 0);
                    tCtx.lineTo(gx, mapH);
                    tCtx.stroke();
                  }
                  for (let gy = 0; gy <= mapH; gy += 25) {
                    tCtx.beginPath();
                    tCtx.moveTo(0, gy);
                    tCtx.lineTo(mapW, gy);
                    tCtx.stroke();
                  }

                  const contacts=visibleSurveyContacts(currentSurfaceState,{x:vehicleX,y:vehicleY});
                  drawSurveyContacts(tCtx,contacts,c=>{const p=localContactPosition(currentSurfaceState!,c);return {x:tCx+p.x*scale,y:tCy+p.y*scale,radius:c.uncertaintyKm*scale};},{x:0,y:0,width:mapW,height:mapH});
                  topoCanvas.dataset.localContactCount=String(contacts.filter(c=>{const p=localContactPosition(currentSurfaceState!,c);return Math.abs(p.x)<=mapW/(2*scale)&&Math.abs(p.y)<=mapH/(2*scale);}).length);
                  // Navigation marks always draw above contact labels.
                  // Landed Ship Base Footprint at (0, 0) reflecting ~4x scale vs rover
                  const shipFootprintW = 22;
                  const shipFootprintH = 15;
                  tCtx.fillStyle = 'rgba(250, 204, 21, 0.28)';
                  tCtx.strokeStyle = '#facc15';
                  tCtx.lineWidth = 1.5;
                  tCtx.shadowColor = '#facc15';
                  tCtx.shadowBlur = 10;
                  tCtx.beginPath();
                  tCtx.roundRect(tCx - shipFootprintW / 2, tCy - shipFootprintH / 2, shipFootprintW, shipFootprintH, 3);
                  tCtx.fill();
                  tCtx.stroke();

                  // Center strobe
                  tCtx.fillStyle = '#ffffff';
                  tCtx.beginPath();
                  tCtx.arc(tCx, tCy, 2.5, 0, Math.PI * 2);
                  tCtx.fill();
                  tCtx.shadowBlur = 0;

                  tCtx.fillStyle = '#facc15';
                  tCtx.font = 'bold 9px "Rajdhani", sans-serif';
                  tCtx.textAlign = 'center';
                  tCtx.fillText('LANDED SHIP [0, 0]', tCx, tCy - 11);

                  // Rover Blip at (vehicleX, vehicleY)
                  const vMapX = tCx + vehicleX * scale;
                  const vMapY = tCy + vehicleY * scale;

                  // Directional Beacon Line connecting rover to ship
                  tCtx.strokeStyle = '#00f0ff';
                  tCtx.lineWidth = 1.5;
                  tCtx.setLineDash([4, 4]);
                  tCtx.beginPath();
                  tCtx.moveTo(vMapX, vMapY);
                  tCtx.lineTo(tCx, tCy);
                  tCtx.stroke();
                  tCtx.setLineDash([]);

                  // Rover Blip (smaller ~3.5px blip)
                  tCtx.fillStyle = '#00f0ff';
                  tCtx.shadowColor = '#00f0ff';
                  tCtx.shadowBlur = 8;
                  tCtx.beginPath();
                  tCtx.arc(vMapX, vMapY, 3.5, 0, Math.PI * 2);
                  tCtx.fill();
                  tCtx.shadowBlur = 0;

                  tCtx.fillStyle = '#00f0ff';
                  tCtx.font = 'bold 9px "Rajdhani", sans-serif';
                  tCtx.fillText(`ROVER [${vehicleX.toFixed(1)}, ${vehicleY.toFixed(1)}]`, vMapX, vMapY + 14);

                  // Waypoint on map
                  if (roverWaypoint) {
                    const wpMapX = tCx + roverWaypoint.x * scale;
                    const wpMapY = tCy + roverWaypoint.y * scale;

                    tCtx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
                    tCtx.lineWidth = 1.5;
                    tCtx.setLineDash([4, 3]);
                    tCtx.beginPath();
                    tCtx.moveTo(vMapX, vMapY);
                    tCtx.lineTo(wpMapX, wpMapY);
                    tCtx.stroke();
                    tCtx.setLineDash([]);

                    tCtx.strokeStyle = '#facc15';
                    tCtx.shadowColor = '#facc15';
                    tCtx.shadowBlur = 8;
                    tCtx.lineWidth = 2;
                    tCtx.beginPath();
                    tCtx.arc(wpMapX, wpMapY, 5, 0, Math.PI * 2);
                    tCtx.stroke();
                    tCtx.fillStyle = '#ffffff';
                    tCtx.beginPath();
                    tCtx.arc(wpMapX, wpMapY, 2, 0, Math.PI * 2);
                    tCtx.fill();
                    tCtx.shadowBlur = 0;

                    tCtx.fillStyle = '#facc15';
                    tCtx.font = 'bold 9px "Rajdhani", sans-serif';
                    tCtx.fillText(`WAYPOINT [${roverWaypoint.x.toFixed(1)}, ${roverWaypoint.y.toFixed(1)}]`, wpMapX, wpMapY - 8);
                  }


                  topoCanvas.dataset.surveyContacts=JSON.stringify(contacts);

                }}
              />
            </div>

            {currentSurfaceState&&orbitPlanetIndex!==null&&<details open className="survey-global-details"><summary>Planetwide survey and recorded contacts</summary><SurveyPanel contacts={visibleSurveyContacts(currentSurfaceState,{x:vehicleX,y:vehicleY})} seed={currentSurfaceState.planetSeed} water={currentPlanets[orbitPlanetIndex].hydrospherePercent} type={currentPlanets[orbitPlanetIndex].type} target={{lat:landingLat,lon:landingLong}} sampledRegions={currentSurfaceState.survey?.sampledRegions??0} scienceSkill={currentSurfaceState.survey?.scienceSkill}/></details>}

            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Distance to Starship: <strong className="text-yellow-400 font-mono">{Math.hypot(vehicleX, vehicleY).toFixed(2)} km</strong></span>
              <span>Vehicle Hold Volume: <strong className="text-cyan-300 font-mono">{vehicleHold.reduce((s, i) => s + i.volume, 0).toFixed(1)} / 50 m³</strong></span>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* SURFACE RUIN EXPLORATION MODAL */}
      {surfaceRuinModal && (
        <MenuOverlay tone="neutral" zIndex={70}>
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100 border-2 border-purple-500/60">
            <div className="flex items-center gap-3 border-b border-purple-900/60 pb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-400 flex items-center justify-center text-purple-300 font-black">
                🏛
              </div>
              <div>
                <h2 className="text-lg font-black text-purple-300">{surfaceRuinModal.loreTitle}</h2>
                <span className="text-[11px] text-slate-400">{surfaceRuinModal.name}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/90 rounded-2xl border border-purple-900/80 text-xs leading-relaxed text-slate-200">
              {surfaceRuinModal.loreMessage}
            </div>

            {surfaceRuinModal.artifactId && (
              <div className="p-3 bg-purple-950/60 border border-purple-500/60 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <strong className="text-yellow-400 block">{surfaceRuinModal.artifactRecovered === false ? 'Precursor Relic Remains at Site' : 'Precursor Relic Recovered!'}</strong>
                  <span className="text-slate-300 text-[11px]">
                    {CANONICAL_ARTIFACTS.find((a) => a.id === surfaceRuinModal.artifactId)?.codeName || 'Ancient Artifact'}
                  </span>
                </div>
                <span className="bg-purple-800 text-white px-2.5 py-1 rounded font-bold text-[10px]">
                  {surfaceRuinModal.artifactRecovered === false ? 'FREE ROVER CARGO SPACE AND RETURN' : 'RECOVERY LOGGED'}
                </span>
              </div>
            )}

            <button
              onClick={() => setSurfaceRuinModal(null)}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl font-black text-xs shadow-lg"
            >
              [CONTINUE SURVEY]
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* DISTRESS TOW CONFIRMATION MODAL (INTERSTEL FORM EXP-904-B) */}
      {isPromptingDistress && (
        <MenuOverlay tone="danger" zIndex={85}>
          <div className="w-full max-w-xl glass-panel border-2 border-red-500 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100 font-mono">
            <div className="flex items-center gap-2.5 border-b border-red-900 pb-2 text-red-400">
              <AlertTriangle size={24} className="animate-bounce" />
              <div>
                <h2 className="text-base md:text-lg font-black tracking-wider">
                  INTERSTEL FORM EXP-904-B • DISTRESS EXTRACTION INVOICE
                </h2>
                <span className="text-[10px] text-slate-400">DEPARTMENT OF REDUNDANT LOGISTICS • OFFICE OF DISAVOWED EXPLORATION</span>
              </div>
            </div>

            <div className="bg-slate-950/90 p-4 rounded-2xl border border-red-900/60 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span>01. Subspace Tow Tractor Base Mobilization:</span>
                <span className="text-red-400 font-bold">15,000 M.U.</span>
              </div>
              <div className="flex justify-between">
                <span>02. Administrative Dignity Surcharge:</span>
                <span className="text-slate-400">0 M.U.</span>
              </div>
              <div className="flex justify-between">
                <span>03. Subspace Paperwork Filing Fee:</span>
                <span className="text-slate-400">0 M.U.</span>
              </div>
              <div className="flex justify-between">
                <span>04. Hazardous Stupidity Processing:</span>
                <span className="text-slate-400">0 M.U.</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1 font-bold text-white">
                <span>TOTAL DEDUCTED FROM OPERATING FUNDS:</span>
                <span className="text-red-400 font-black">15,000 M.U.</span>
              </div>
              <div className="text-[10px] text-slate-400 italic pt-1">
                Authorized Signature: V. P. Pen-Pusher, Committee on Unplanned Hull Depressurization
              </div>
            </div>

            <div className="flex gap-3 text-xs">
              <button
                onClick={() => setIsPromptingDistress(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold"
              >
                [CANCEL REQUEST]
              </button>
              <button
                onClick={handleExecuteDistressTow}
                className="flex-1 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-3 rounded-xl font-black shadow-xl"
              >
                [EXECUTE TOW (-15,000 M.U.)]
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* COLONY LOGGING PROMPT MODAL (FORM COL-771-A) */}
      {isPromptingColonyRec && orbitPlanetIndex !== null && (
        <MenuOverlay tone="neutral" zIndex={85}>
          <div className="w-full max-w-lg glass-panel border-2 border-amber-500 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100 font-mono">
            <div className="flex items-center gap-2.5 border-b border-amber-900 pb-2 text-amber-400">
              <Globe size={22} className="animate-pulse" />
              <div>
                <h2 className="text-base md:text-lg font-black tracking-wider">
                  PLANETARY LOGGING TERMINAL
                </h2>
                <span className="text-[10px] text-slate-400">
                  {currentPlanets[orbitPlanetIndex]?.name} • [{currentStar.x}, {currentStar.y}]
                </span>
              </div>
            </div>

            {colonyPromptStep === 'ask_recommend' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 text-center space-y-2">
                  <p className="text-sm font-black text-white">
                    Recommend this planet for colonization?
                  </p>
                  <p className="text-slate-400 text-xs font-sans">
                    Logging without recommendation stores planetary survey telemetry into the Captain's Log. Recommending queues formal evaluation with the Colonial Directorate at Starport Operations.
                  </p>
                </div>

                <div className="flex gap-3 text-xs">
                  <button
                    onClick={handleLogTelemetryOnly}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl font-bold border border-slate-600 shadow"
                  >
                    [No] (Log Telemetry Only)
                  </button>
                  <button
                    onClick={() => {
                      setColonyPromptStep('enter_name');
                      gameAudio.playConfirmSelect();
                    }}
                    className="flex-1 bg-linear-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 py-3 rounded-xl font-black shadow-xl"
                  >
                    [Yes] (Recommend Colony)
                  </button>
                </div>
              </div>
            )}

            {colonyPromptStep === 'enter_name' && (
              <div className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">
                    Colony World Name (1 to 15 characters):
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={colonyNameInput}
                    onChange={(e) => setColonyNameInput(e.target.value.slice(0, 15))}
                    placeholder={currentPlanets[orbitPlanetIndex]?.name || 'Colony Name'}
                    className="w-full bg-slate-950 border border-amber-500/80 rounded-xl px-3 py-2 text-white font-bold font-mono focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div>Survey Target: <strong className="text-white">{currentPlanets[orbitPlanetIndex].name}</strong> ({currentPlanets[orbitPlanetIndex].type})</div>
                  <div>Coordinates: <strong className="text-yellow-400">[{currentStar.x}, {currentStar.y}]</strong> • Gravity: <strong className="text-cyan-300">{currentPlanets[orbitPlanetIndex].gravity}g</strong></div>
                  <div>Atmosphere: <strong className="text-cyan-300">{currentPlanets[orbitPlanetIndex].atmosphereDensity}</strong> ({currentPlanets[orbitPlanetIndex].gases?.join(', ') || 'None'})</div>
                  <div>Temperature: <strong className="text-cyan-300">{currentPlanets[orbitPlanetIndex].temperatureRange || currentPlanets[orbitPlanetIndex].temperature}</strong> • Weather: <strong className="text-cyan-300">{currentPlanets[orbitPlanetIndex].weather}</strong></div>
                  <div>Hydrosphere: <strong className="text-cyan-300">{currentPlanets[orbitPlanetIndex].hydrosphereCompound}</strong> • Bio Density: <strong className="text-cyan-300">{currentPlanets[orbitPlanetIndex].bioDensity}%</strong></div>
                </div>

                <div className="flex gap-3 text-xs pt-1">
                  <button
                    onClick={() => setColonyPromptStep('ask_recommend')}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold"
                  >
                    [Back]
                  </button>
                  <button
                    onClick={handleConfirmColonyRecommendation}
                    className="flex-1 bg-linear-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 py-3 rounded-xl font-black shadow-xl"
                  >
                    [Submit Recommendation]
                  </button>
                </div>
              </div>
            )}
          </div>
        </MenuOverlay>
      )}

      {/* PAUSE & SETTINGS MENU */}

      {isGameMenuOpen && (
        <MenuOverlay tone="neutral" zIndex={150}>
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100 relative">
            <DevUiTag id="#modal-pause-menu" color="yellow" />
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-cyan-900/60 pb-2">
              <h2 className="text-lg font-black text-yellow-400 flex items-center gap-2">
                <Pause size={18} />
                COMMAND PAUSE & SETTINGS
              </h2>
              <button onClick={() => setIsGameMenuOpen(false)} className="text-slate-400 hover:text-white font-bold text-sm">
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-cyan-950 pb-2 text-xs">
              <button
                onClick={() => setPauseMenuTab('main')}
                className={`px-3 py-1.5 rounded-lg font-bold ${
                  pauseMenuTab === 'main' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                Mission
              </button>
              <button
                onClick={() => setPauseMenuTab('settings')}
                className={`px-3 py-1.5 rounded-lg font-bold ${
                  pauseMenuTab === 'settings' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                Graphics & Audio
              </button>
              <button
                onClick={() => setPauseMenuTab('slots')}
                className={`px-3 py-1.5 rounded-lg font-bold ${
                  pauseMenuTab === 'slots' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                Save Slots
              </button>
            </div>

            {pauseMenuTab === 'main' && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setIsGameMenuOpen(false)}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Play size={16} />
                  RESUME MISSION
                </button>
                <button
                  onClick={() => handleSaveToSlot(activeSlot)}
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-cyan-600 text-cyan-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Database size={15} />
                  Save Mission (Slot {activeSlot})
                </button>
                <button
                  onClick={() => {
                    handleSaveToSlot(activeSlot);
                    setIsQuitReminderOpen(true);
                  }}
                  className="w-full bg-red-950 hover:bg-red-900 border border-red-700 text-red-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <LogOut size={14} />
                  Quit to Title Screen
                </button>
              </div>
            )}

            {pauseMenuTab === 'settings' && (
              <div className="space-y-3 text-xs">
                {/* Alien Voice Effects Toggle */}
                <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Radio size={14} className="text-pink-400" />
                    Alien voice effects
                  </span>
                  <button
                    aria-label="Alien voice effects"
                    aria-pressed={alienVoiceEffectsEnabled}
                    onClick={() => handleSettingsChange({alienVoiceEffects:!alienVoiceEffectsEnabled})}
                    className={`px-3 py-1 rounded-lg font-black text-xs ${
                      alienVoiceEffectsEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {alienVoiceEffectsEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Banter & Comedy Toggle */}
                <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-yellow-400" />
                    Crew Banter & Comedy Layer
                  </span>
                  <button
                    aria-label="Crew banter"
                    aria-pressed={banterEnabled}
                    onClick={() => handleSettingsChange({banterEnabled:!banterEnabled})}
                    className={`px-3 py-1 rounded-lg font-black text-xs ${
                      banterEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {banterEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Graphics Quality */}
                <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Monitor size={14} className="text-cyan-400" />
                    Graphics Quality
                  </span>
                  <div className="flex gap-1">
                    {(['Low', 'Medium', 'High'] as ('Low' | 'Medium' | 'High')[]).map((q) => (
                      <button
                        key={q}
                        aria-pressed={gfxQuality===q}
                        onClick={() => handleSettingsChange({graphicsQuality:q})}
                        className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                          gfxQuality === q ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">Low reduces scene resolution to save power. Medium uses standard resolution; High uses sharper rendering on compatible displays. Interface text stays sharp.</p>

                {/* CRT Filter */}
                <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Tv size={14} className="text-yellow-400" />
                    Retro CRT Filter
                  </span>
                  <button
                    aria-label="Retro CRT filter"
                    aria-pressed={crtFilterEnabled}
                    onClick={() => handleSettingsChange({crtFilter:!crtFilterEnabled})}
                    className={`px-3 py-1 rounded-lg font-black text-xs ${
                      crtFilterEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {crtFilterEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Screen Shake */}
                <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkle size={14} className="text-pink-400" />
                    Screen Shake Effects
                  </span>
                  <button
                    aria-label="Screen shake effects"
                    aria-pressed={screenShakeEnabled}
                    onClick={() => handleSettingsChange({screenShake:!screenShakeEnabled})}
                    className={`px-3 py-1 rounded-lg font-black text-xs ${
                      screenShakeEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {screenShakeEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Audio Volume Sliders */}
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Volume2 size={15} className="text-cyan-400" />
                      Music Volume ({Math.round(musicVol * 100)}%)
                    </span>
                    <input
                      type="range"
                      aria-label="Music volume"
                      min={0}
                      max={1}
                      step={0.05}
                      value={musicVol}
                      onChange={(e) => handleSettingsChange({musicVolume:parseFloat(e.target.value)})}
                      className="w-full sm:w-32 accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center border-t border-slate-800/80 pt-2">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Zap size={15} className="text-yellow-400" />
                      Sound Effects Volume ({Math.round(soundVol * 100)}%)
                    </span>
                    <input
                      type="range"
                      aria-label="Sound effects volume"
                      min={0}
                      max={1}
                      step={0.05}
                      value={soundVol}
                      onChange={(e) => handleSettingsChange({soundVolume:parseFloat(e.target.value)})}
                      className="w-full sm:w-32 accent-yellow-400 cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center border-t border-slate-800/80 pt-2">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Radio size={15} className="text-pink-400" />
                      Voices Volume ({Math.round(voicesVol * 100)}%)
                    </span>
                    <input
                      type="range"
                      aria-label="Voice volume"
                      min={0}
                      max={1}
                      step={0.05}
                      value={voicesVol}
                      onChange={(e) => handleSettingsChange({voicesVolume:parseFloat(e.target.value)})}
                      className="w-full sm:w-32 accent-pink-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {pauseMenuTab === 'slots' && (
              <div className="space-y-2.5 text-xs">
                {slotActionNotice && <p role="status" className="rounded-xl border border-cyan-700 bg-cyan-950/70 p-2 text-cyan-100">{slotActionNotice}</p>}
                {/* Session Persistence Notice Banner */}
                <div className="p-2.5 bg-amber-950/80 border border-amber-500/80 rounded-xl text-amber-200 text-[11px] font-bold flex items-center gap-2">
                  <AlertTriangle size={15} className="text-yellow-400 shrink-0" />
                  <span>{savePersistenceNotice}</span>
                </div>

                <div className="flex justify-between items-center pb-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">MISSION SLOTS (A - E)</span>
                  <button
                    onClick={() => {
                      setImportDestSlot(activeSlot);
                      setImportCodeInput('');
                      setImportStatus(null);
                      setIsImportModalOpen(true);
                      gameAudio.playConfirmSelect();
                    }}
                    className="bg-purple-900 hover:bg-purple-800 border border-purple-500 text-purple-200 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                  >
                    <Upload size={12} />
                    Import Save (.sfsave)
                  </button>
                </div>

                {saveSlots.map((s) => {
                  const isDevSave = s.isDev || s.snapshot?.isDev;
                  return (
                    <div
                      key={s.slot}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-yellow-400">Slot {s.slot}</strong>
                          {isDevSave && (
                            <span className="bg-red-950 border border-red-500 text-red-300 px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest shadow-[0_0_6px_#ef4444]">
                              [DEV]
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 text-[11px]">{s.empty ? 'Empty Slot' : `${s.shipName} (${s.stardate})`}</span>
                      </div>
                      <div className="flex flex-wrap justify-end items-center gap-1.5">
                        <button
                          onClick={() => handleSaveToSlot(s.slot)}
                          className="bg-cyan-700 hover:bg-cyan-600 text-white px-2.5 py-1 rounded-lg font-bold text-xs"
                        >
                          Save
                        </button>
                        {!s.empty && (
                          <>
                            <button
                              onClick={() => handleLoadFromSlot(s.slot)}
                              className="bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold text-xs"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => handleOpenExportModal(s.slot)}
                              className="bg-purple-700 hover:bg-purple-600 text-white px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 shadow"
                              title="Export Save Code & Download File"
                            >
                              <Download size={12} />
                              Export Save
                            </button>
                            <button aria-label={`Copy Slot ${s.slot}`} onClick={()=>handleRequestSlotAction(s.slot,'copy')} className="bg-slate-800 hover:bg-slate-700 text-cyan-200 px-2.5 py-1 rounded-lg font-bold text-xs">Copy</button>
                            <button aria-label={`Reset Slot ${s.slot}`} title="Reset to a fresh mission after backup review" onClick={()=>handleRequestSlotAction(s.slot,'reset')} className="bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 px-2.5 py-1 rounded-lg font-bold text-xs">Reset</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </MenuOverlay>
      )}

      {/* EXPORT SAVE MODAL */}
      {isExportModalOpen && exportSlotData && (
        <MenuOverlay tone="neutral" zIndex={170}>
          <div className="w-full max-w-xl glass-panel border-2 border-purple-500 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100 font-mono">
            <div className="flex justify-between items-center border-b border-purple-900/80 pb-2">
              <div className="flex items-center gap-2.5 text-purple-400">
                <Download size={22} className="text-yellow-400" />
                <div>
                  <h2 className="text-base md:text-lg font-black tracking-wider uppercase text-purple-300">
                    EXPORT MISSION SAVE • SLOT {exportTargetSlot}
                  </h2>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {exportSlotData.shipName} • Stardate: {exportSlotData.stardate} • {exportSlotData.credits.toLocaleString()} M.U.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-xl text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Storage Persistence Notice Banner */}
            <div className="p-2.5 bg-amber-950/80 border border-amber-500/80 rounded-xl text-amber-200 text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={15} className="text-yellow-400 shrink-0" />
              <span>{savePersistenceNotice}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 text-xs font-bold flex justify-between">
                <span>Exported Save Code (Selectable Base64 Payload):</span>
                <span className="text-slate-500 text-[10px]">{exportCodeString.length} chars</span>
              </label>
              <textarea
                id="export-code-textarea"
                readOnly
                value={exportCodeString}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                className="w-full h-32 bg-slate-950 border border-purple-500/80 rounded-2xl p-3 text-cyan-300 font-mono text-[11px] leading-relaxed resize-none focus:outline-hidden focus:border-cyan-400 select-all"
              />
              <span className="text-[10px] text-slate-400 italic">
                Tip: Click text to select all. If automated clipboard copy is blocked, press Ctrl+C / Cmd+C.
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCopyExportCode}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-2 transition ${
                  copySuccess
                    ? 'bg-emerald-600 text-white border border-emerald-400 shadow-[0_0_12px_#10b981]'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                {copySuccess ? <Check size={16} /> : <Copy size={16} />}
                {copySuccess ? '✓ Copied to Clipboard!' : 'Copy to Clipboard'}
              </button>

              <button
                type="button"
                onClick={handleDownloadExportedSave}
                className="flex-1 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-2 transition"
              >
                <Download size={16} />
                Download .sfsave File
              </button>
            </div>

            <button
              onClick={() => setIsExportModalOpen(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 py-2 rounded-xl font-bold text-xs"
            >
              Done / Dismiss
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* IMPORT SAVE MODAL */}
      {isImportModalOpen && (
        <MenuOverlay tone="neutral" zIndex={170}>
          <div className="w-full max-w-xl glass-panel border-2 border-indigo-500 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100 font-mono">
            <div className="flex justify-between items-center border-b border-indigo-900/80 pb-2">
              <div className="flex items-center gap-2.5 text-indigo-400">
                <Upload size={22} className="text-yellow-400" />
                <div>
                  <h2 className="text-base md:text-lg font-black tracking-wider uppercase text-indigo-300">
                    IMPORT MISSION SAVE
                  </h2>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Restore mission state from .sfsave file or exported text code
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportStatus(null);
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-xl text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Destination Slot Selector */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-bold block">
                Target Destination Slot (A - E):
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(['A', 'B', 'C', 'D', 'E'] as ('A' | 'B' | 'C' | 'D' | 'E')[]).map((slotKey) => {
                  const existingSlot = saveSlots.find((s) => s.slot === slotKey);
                  const isDest = importDestSlot === slotKey;
                  return (
                    <button
                      key={slotKey}
                      type="button"
                      onClick={() => {
                        setImportDestSlot(slotKey);
                        setImportStatus(null);
                        gameAudio.playCrispClick();
                      }}
                      className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                        isDest
                          ? 'bg-indigo-600 text-white border-indigo-300 shadow-[0_0_10px_#6366f1]'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <strong className="text-xs">Slot {slotKey}</strong>
                      <span className="text-[9px] text-slate-400 truncate max-w-full">
                        {existingSlot?.empty ? 'Empty' : existingSlot?.shipName || 'Filled'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".sfsave,.txt,.json"
              className="hidden"
              onChange={handleImportFileSelect}
            />

            {/* Textarea for pasting */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <label className="text-slate-300 font-bold">
                  Save Payload Code (SFSAVE1_... or JSON):
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-900 hover:bg-slate-800 border border-cyan-500 text-cyan-300 px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow"
                >
                  <Upload size={12} />
                  Load .sfsave File
                </button>
              </div>

              <textarea
                value={importCodeInput}
                onPaste={(e)=>{const text=e.clipboardData.getData('text');if(!importTextWithinBudget(text)){e.preventDefault();acceptImportText(text);}}}
                onChange={(e) => {
                  acceptImportText(e.target.value);
                }}
                placeholder="Paste your exported SFSAVE1_... code here, or click 'Load .sfsave File' above..."
                className="w-full h-28 bg-slate-950 border border-indigo-500/80 rounded-2xl p-3 text-slate-200 font-mono text-[11px] leading-relaxed resize-none focus:outline-hidden focus:border-indigo-400"
              />
            </div>

            {/* Status notice */}
            {importStatus && (
              <div
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 shadow-lg ${
                  importStatus.type === 'success'
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-[0_0_15px_#10b98130]'
                    : 'bg-red-950/90 border-red-500 text-red-200 shadow-[0_0_15px_#ef444430] animate-pulse'
                }`}
              >
                <div className="flex items-center gap-2">
                  {importStatus.type === 'success' ? (
                    <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle size={18} className="text-red-400 shrink-0" />
                  )}
                  <span>{importStatus.message}</span>
                </div>

                {importStatus.type === 'success' && importStatus.restoredSlot && (
                  <button
                    type="button"
                    onClick={() => handleResumeImportedMission(importStatus.restoredSlot!)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1 rounded-xl text-xs font-black shadow transition shrink-0"
                  >
                    Launch Mission ➔
                  </button>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportStatus(null);
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 py-2.5 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                className="flex-1 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-2.5 rounded-xl font-black text-xs shadow-xl flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Restore Mission to Slot {importDestSlot}
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* QUIT TO TITLE EXIT REMINDER MODAL */}
      {replacementMission && (
        <MenuOverlay tone="danger" zIndex={160}>
          <div role="dialog" aria-modal="true" aria-labelledby="replace-mission-title"
            className="w-full max-w-lg glass-panel border-2 border-amber-500 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100"
            onKeyDown={event=>{
              if (event.key==='Escape') {event.preventDefault();event.stopPropagation();handleCancelMissionReplacement();}
              if (event.key==='Tab') {
                const buttons=event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]),select:not([disabled])');
                const first=buttons[0],last=buttons[buttons.length-1];
                if (event.shiftKey && document.activeElement===first) {event.preventDefault();last?.focus();}
                else if (!event.shiftKey && document.activeElement===last) {event.preventDefault();first?.focus();}
              }
            }}>
            <h2 id="replace-mission-title" className="text-lg font-black text-amber-300 flex items-center gap-2"><AlertTriangle size={22} />{replacementMode==='copy'?'Copy mission from':replacementMode==='reset'?'Reset mission in':'Replace mission in'} Slot {replacementMission.slot}?</h2>
            <p className="text-sm text-slate-300">{replacementMode==='copy'?'Choose a destination for an independent copy. An occupied destination will be replaced; export its backup first.':replacementMode==='reset'?'This starts a fresh commissioning in the selected slot. Export the current mission before resetting it.':'All five slots contain missions. Starting a new mission will overwrite the save shown below.'}</p>
            <div className="rounded-xl bg-slate-950 border border-amber-900 p-3 text-sm">
              <strong className="block text-white">{replacementMission.shipName}</strong>
              <span className="text-slate-400">{replacementMission.stardate} • {replacementMission.credits.toLocaleString()} M.U.</span>
            </div>
            {replacementMode==='copy' && <div className="space-y-2">
              <label htmlFor="copy-mission-destination" className="text-sm font-bold text-cyan-200">Destination slot</label>
              <select id="copy-mission-destination" value={copyTargetSlot} className="w-full rounded-xl border border-cyan-800 bg-slate-950 p-2 text-sm"
                onChange={event=>{const target=event.target.value as SaveSlotData['slot'];setCopyTargetSlot(target);setCopyDestination(loadInitialSaveSlots().slots.find(slot=>slot.slot===target)!);setReplacementStatus(null);}}>
                {saveSlots.filter(slot=>slot.slot!==replacementMission.slot).map(slot=><option key={slot.slot} value={slot.slot}>Slot {slot.slot} · {slot.empty?'Empty':slot.shipName}</option>)}
              </select>
              <p className="text-xs text-slate-400">{copyDestination?.empty?'The destination is empty.':`Replaces ${copyDestination?.shipName??'the destination mission'} (${copyDestination?.stardate??''}).`}</p>
            </div>}
            {replacementStatus && <p className="text-sm text-amber-300" role="status">{replacementStatus}</p>}
            {(replacementMode!=='copy'||!copyDestination?.empty) && <button onClick={()=>handleOpenExportModal(replacementMode==='copy'?copyTargetSlot:replacementMission.slot)} className="w-full rounded-xl border border-purple-500 bg-purple-950 hover:bg-purple-900 px-4 py-2 text-purple-200 font-bold text-sm">Export Existing Save</button>}
            <div className="flex flex-wrap gap-3">
              <button ref={replacementCancelRef} autoFocus onClick={handleCancelMissionReplacement} className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-3 font-bold text-sm">Cancel</button>
              <button onClick={handleConfirmMissionReplacement} className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-3 font-black text-sm">{replacementMode==='copy'?`Copy to Slot ${copyTargetSlot}`:replacementMode==='reset'?`Reset Slot ${replacementMission.slot}`:`Replace Slot ${replacementMission.slot}`}</button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {isQuitReminderOpen && (
        <MenuOverlay tone="neutral" zIndex={165}>
          <div className="w-full max-w-lg glass-panel border-2 border-amber-500 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100 font-mono">
            <div className="flex items-center gap-2.5 border-b border-amber-900/80 pb-2 text-amber-400">
              <AlertTriangle size={24} className="animate-bounce" />
              <h2 className="text-base md:text-lg font-black tracking-wider uppercase">
                SESSION EXIT REMINDER
              </h2>
            </div>

            <div className="p-3.5 bg-amber-950/80 border border-amber-500/80 rounded-2xl text-amber-200 text-xs leading-relaxed font-bold">
              {savePersistenceNotice}
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-300 font-sans">
                You are about to return to the Title Screen. Your latest checkpoint is in Slot {activeSlot}. {saveDurable ? 'Export a backup to keep a copy outside this browser.' : 'This checkpoint is available only for this session. Export it before closing the tab.'}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  setIsQuitReminderOpen(false);
                  handleOpenExportModal(activeSlot);
                }}
                className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-2"
              >
                <Download size={15} />
                Export Save (Slot {activeSlot}) First
              </button>

              <button
                onClick={() => {
                  setIsQuitReminderOpen(false);
                  setIsGameMenuOpen(false);
                  setGameState({ status: 'START', score: 100, level: 1 });
                }}
                className="w-full bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 py-2.5 rounded-xl font-bold text-xs"
              >
                Continue to Title Screen
              </button>

              <button
                onClick={() => setIsQuitReminderOpen(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white py-2 rounded-xl text-xs font-bold"
              >
                Cancel / Stay in Game
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* DEV CORNER BADGE WHEN DEV PANEL IS OPEN */}
      {isDevPanelOpen && (
        <div className="fixed top-3 left-3 z-[220] bg-red-950/95 border-2 border-red-500 text-red-300 px-3 py-1 rounded-xl text-xs font-black tracking-widest shadow-[0_0_18px_#ef4444] animate-pulse flex items-center gap-1.5 pointer-events-none">
          <Sparkles size={14} className="text-yellow-400 animate-spin" />
          DEV
        </div>
      )}

      {/* DEVELOPER TESTING PANEL MODAL (Ctrl+Shift+D / Cmd+Shift+D) */}
      {isDevPanelOpen && (
        <MenuOverlay tone="neutral" zIndex={210}>
          <div className="w-full max-w-4xl glass-panel rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col gap-4 text-slate-100 border-2 border-red-500/80 max-h-[90vh] overflow-y-auto relative">
            <DevUiTag id="#modal-dev-panel" color="pink" />
            {/* Header */}
            <div className="flex justify-between items-center border-b border-red-900/60 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-950 border border-red-500 text-red-400 shadow-[0_0_12px_#ef4444]">
                  <Wrench size={20} />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-black text-red-400 tracking-wider flex items-center gap-2">
                    DEVELOPER TESTING PANEL
                    <span className="bg-red-950 border border-red-500/80 text-red-300 px-2 py-0.5 rounded text-[10px] font-black">
                      [DEV MODE ACTIVE]
                    </span>
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Executing any tool marks the current save state with <strong className="text-amber-400">[DEV]</strong>. Press <kbd className="bg-slate-900 px-1 rounded border border-slate-700 text-cyan-300">Ctrl+Shift+D</kbd> or <kbd className="bg-slate-900 px-1 rounded border border-slate-700 text-cyan-300">ESC</kbd> to close.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsDevPanelOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 border border-red-700 text-red-300 px-3.5 py-1.5 rounded-xl text-xs font-black"
              >
                Close Dev Panel ✕
              </button>
            </div>

            {/* Dev Navigation Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-2 text-xs">
              {[
                { id: 'gallery', label: '🎬 SCREEN GALLERY', icon: Sparkles },
                { id: 'labels', label: '🏷️ LABELS SWITCH', icon: Target },
                { id: 'balance_time', label: '1. Balance & Time', icon: Coins },
                { id: 'teleport', label: '2. Teleportation', icon: Navigation },
                { id: 'cargo', label: '3. Cargo Spawner', icon: Package },
                { id: 'crew', label: '4. Crew Modifier', icon: Users },
                { id: 'ship', label: '5. Ship & Fuel', icon: Shield },
                { id: 'alien_encounter', label: '6. Spawn Encounter', icon: Flame },
                { id: 'alien_mood', label: '7. Alien Mood', icon: Heart },
                { id: 'flux', label: '8. Flux Links', icon: Zap },
                { id: 'telemetry', label: '9. Telemetry & Lore', icon: Activity },
              ].map((tab) => {
                const isSel = devActiveTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setDevActiveTab(tab.id as any);
                      gameAudio.playCrispClick();
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition text-xs ${
                      isSel
                        ? 'bg-red-700 text-white shadow-[0_0_10px_#ef444460]'
                        : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* GLOBAL GALLERY QUICK STEPPER (AVAILABLE ACROSS ALL DEV TABS) */}
            <div className="w-full bg-slate-950/90 p-2.5 rounded-2xl border border-cyan-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shadow-inner">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-cyan-300 flex items-center gap-1 uppercase tracking-wider text-[11px]">
                  <Sparkles size={14} className="text-yellow-400" />
                  SCENE STEPPER:
                </span>
                <span className="text-white font-mono font-bold truncate max-w-[280px]">
                  {GALLERY_SCENES[galleryActiveIndex]?.title || 'Scene'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const prevIdx = (galleryActiveIndex - 1 + GALLERY_SCENES.length) % GALLERY_SCENES.length;
                    applyGalleryScene(prevIdx, false);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 border border-cyan-700 text-cyan-300 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow active:scale-95"
                >
                  <ChevronLeft size={14} />
                  <span>◀ Previous</span>
                </button>

                <span className="bg-slate-950 border border-cyan-500/80 px-3 py-1 rounded-xl font-mono text-xs font-black text-yellow-400">
                  [{galleryActiveIndex + 1} / {GALLERY_SCENES.length}]
                </span>

                <button
                  onClick={() => {
                    const nextIdx = (galleryActiveIndex + 1) % GALLERY_SCENES.length;
                    applyGalleryScene(nextIdx, false);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 border border-cyan-700 text-cyan-300 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow active:scale-95"
                >
                  <span>Next ▶</span>
                  <ChevronRight size={14} />
                </button>

                {/* Quick Labels Toggle Switch */}
                <button
                  onClick={() => {
                    setDevLabelsEnabled((prev) => !prev);
                    gameAudio.playConfirmSelect();
                  }}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs border transition flex items-center gap-1.5 ml-2 ${
                    devLabelsEnabled
                      ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-[0_0_12px_#facc15]'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <span>Labels:</span>
                  <strong>{devLabelsEnabled ? 'ON' : 'OFF'}</strong>
                </button>
              </div>
            </div>

            {/* TAB 0A: SCREEN GALLERY */}
            {devActiveTab === 'gallery' && (
              <div className="space-y-3.5 text-xs">
                {/* Search & Category Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-950/90 p-3 rounded-2xl border border-cyan-900/80">
                  {/* Category Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {galleryCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setGallerySelectedCategory(cat);
                          gameAudio.playCrispClick();
                        }}
                        className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition ${
                          gallerySelectedCategory === cat
                            ? 'bg-cyan-600 text-white shadow-[0_0_8px_#00f0ff80]'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative flex items-center">
                    <Search size={14} className="absolute left-2.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search gallery scenes..."
                      value={gallerySearchQuery}
                      onChange={(e) => setGallerySearchQuery(e.target.value)}
                      className="bg-slate-900 border border-cyan-700/80 rounded-xl pl-8 pr-3 py-1.5 text-white text-xs font-mono focus:outline-hidden focus:border-cyan-400 w-52"
                    />
                    {gallerySearchQuery && (
                      <button
                        onClick={() => setGallerySearchQuery('')}
                        className="absolute right-2 text-slate-400 hover:text-white text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Gallery Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {filteredGalleryScenes.map(({ scene, originalIndex }) => {
                    const isActive = originalIndex === galleryActiveIndex;
                    return (
                      <div
                        key={scene.id}
                        className={`p-3 rounded-2xl border flex flex-col justify-between gap-2 transition ${
                          isActive
                            ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_15px_#00f0ff40]'
                            : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-yellow-400 font-bold">#{originalIndex + 1} • {scene.category}</span>
                            {isActive && (
                              <span className="bg-cyan-900 text-cyan-200 px-1.5 py-0.2 rounded text-[9px] font-black animate-pulse">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <strong className="text-xs text-white block leading-snug font-bold">
                            {scene.title}
                          </strong>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {scene.desc}
                          </p>
                        </div>

                        <div className="flex gap-2 pt-1 border-t border-slate-900">
                          <button
                            onClick={() => applyGalleryScene(originalIndex, false)}
                            className={`flex-1 py-1.5 rounded-xl font-black text-xs shadow flex items-center justify-center gap-1 ${
                              isActive
                                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                                : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-700'
                            }`}
                          >
                            <Sparkles size={12} />
                            Preview
                          </button>
                          <button
                            onClick={() => applyGalleryScene(originalIndex, true)}
                            className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-1.5 rounded-xl font-black text-xs shadow flex items-center justify-center gap-1"
                          >
                            <Play size={12} className="fill-current" />
                            [Go]
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 0B: LABELS SWITCH */}
            {devActiveTab === 'labels' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950/90 p-5 rounded-2xl border border-yellow-900/80 flex flex-col gap-3 shadow-inner">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <strong className="text-yellow-400 text-sm flex items-center gap-1.5">
                      <Target size={16} />
                      UI & SPRITE INSPECTOR LABELS SWITCH
                    </strong>

                    <button
                      onClick={() => {
                        setDevLabelsEnabled((prev) => !prev);
                        gameAudio.playConfirmSelect();
                      }}
                      className={`px-4 py-2 rounded-xl font-black text-xs border transition flex items-center gap-2 ${
                        devLabelsEnabled
                          ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-[0_0_14px_#facc15]'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      <Target size={14} />
                      <span>Labels: <strong>{devLabelsEnabled ? 'ENABLED (ON)' : 'DISABLED (OFF)'}</strong></span>
                    </button>
                  </div>

                  <div className="space-y-2 text-slate-300 leading-relaxed">
                    <p>
                      When <strong className="text-yellow-400">Labels is ON</strong>:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs pl-2">
                      <li>
                        <strong className="text-cyan-300">HTML Interface Elements:</strong> Overlays high-contrast monospace badges on all panels, gauges, buttons, inputs, and modals (e.g. <code className="text-cyan-300 font-mono">#flight-hud-top</code>, <code className="text-cyan-300 font-mono">#bridge-console</code>, <code className="text-cyan-300 font-mono">#msg-terminal-log</code>).
                      </li>
                      <li>
                        <strong className="text-amber-300">Canvas Viewport Sprites:</strong> Renders 10px monospace name tags directly above all active entities in space, orbit, surface, and tactical combat (e.g. <code className="text-amber-300 font-mono">sprite-player-ship</code>, <code className="text-amber-300 font-mono">sprite-alien-uhlek-warship</code>, <code className="text-amber-300 font-mono">sprite-terrain-rover</code>, <code className="text-amber-300 font-mono">sprite-mineral-deposit</code>).
                      </li>
                    </ul>
                    <p className="text-slate-400 text-[11px] pt-1">
                      When <strong className="text-slate-200">Labels is OFF</strong>: zero traces or performance overhead in normal gameplay.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: SET BALANCE & STARDATE */}
            {devActiveTab === 'balance_time' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. Balance */}
                <div className="bg-slate-950/90 p-4 rounded-2xl border border-amber-900/80 flex flex-col gap-3 shadow-inner">
                  <strong className="text-amber-400 text-sm flex items-center gap-1.5">
                    <Coins size={16} />
                    1. SET M.U. FUNDS BALANCE
                  </strong>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={9999999}
                      value={devBalanceInput}
                      onChange={(e) => setDevBalanceInput(parseInt(e.target.value, 10) || 0)}
                      className="flex-1 bg-slate-900 border border-amber-500/80 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                    <button
                      onClick={() => handleDevSetBalance(devBalanceInput)}
                      className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-4 py-2 rounded-xl font-black shadow"
                    >
                      Set Balance
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '+10,000', fn: () => handleDevSetBalance(credits + 10000) },
                      { label: '+100,000', fn: () => handleDevSetBalance(credits + 100000) },
                      { label: '50,000', fn: () => handleDevSetBalance(50000) },
                      { label: '500,000', fn: () => handleDevSetBalance(500000) },
                      { label: '1,000,000', fn: () => handleDevSetBalance(1000000) },
                      { label: '0 (Broke)', fn: () => handleDevSetBalance(0) },
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        onClick={p.fn}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 px-2.5 py-1 rounded-lg font-mono font-bold text-[11px]"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Stardate & Hour */}
                <div className="bg-slate-950/90 p-4 rounded-2xl border border-cyan-900/80 flex flex-col gap-3 shadow-inner">
                  <strong className="text-cyan-300 text-sm flex items-center gap-1.5">
                    <Clock size={16} />
                    2. SET STARDATE & HOUR
                  </strong>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Day (1-30)</span>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={devDayInput}
                        onChange={(e) => setDevDayInput(parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-slate-900 border border-cyan-500/80 rounded-xl px-2 py-1.5 text-white font-mono text-center font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Month (1-10)</span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={devMonthInput}
                        onChange={(e) => setDevMonthInput(parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-slate-900 border border-cyan-500/80 rounded-xl px-2 py-1.5 text-white font-mono text-center font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Year</span>
                      <input
                        type="number"
                        min={4620}
                        max={4630}
                        value={devYearInput}
                        onChange={(e) => setDevYearInput(parseInt(e.target.value, 10) || 4620)}
                        className="w-full bg-slate-900 border border-cyan-500/80 rounded-xl px-2 py-1.5 text-white font-mono text-center font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Hour (0-23)</span>
                      <input
                        type="number"
                        min={0}
                        max={23}
                        value={devHourInput}
                        onChange={(e) => setDevHourInput(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-slate-900 border border-cyan-500/80 rounded-xl px-2 py-1.5 text-white font-mono text-center font-bold"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleDevSetStardate(devDayInput, devMonthInput, devYearInput, devHourInput)}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-xl font-black shadow"
                  >
                    Apply Stardate & Hour
                  </button>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Quick Presets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => {
                          setDevDayInput(1);
                          setDevMonthInput(1);
                          setDevYearInput(4620);
                          setDevHourInput(0);
                          handleDevSetStardate(1, 1, 4620, 0);
                        }}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 px-2.5 py-1 rounded-lg font-mono text-[10px]"
                      >
                        01-01-4620 00:00 (Game Start)
                      </button>
                      <button
                        onClick={() => {
                          setDevDayInput(2);
                          setDevMonthInput(2);
                          setDevYearInput(4620);
                          setDevHourInput(23);
                          handleDevSetStardate(2, 2, 4620, 23);
                        }}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 px-2.5 py-1 rounded-lg font-mono text-[10px]"
                      >
                        02-02-4620 23:00 (one hour before Crystal Sun flare)
                      </button>
                      <button
                        onClick={() => {
                          setDevDayInput(30);
                          setDevMonthInput(10);
                          setDevYearInput(4620);
                          setDevHourInput(23);
                          handleDevSetStardate(30, 10, 4620, 23);
                        }}
                        className="bg-red-950 hover:bg-red-900 border border-red-700 text-red-300 px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold"
                      >
                        30-10-4620 23:00 (one hour before Arth's flare)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TELEPORTATION */}
            {devActiveTab === 'teleport' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950/90 p-4 rounded-2xl border border-indigo-900/80 flex flex-col gap-3 shadow-inner">
                  <strong className="text-indigo-300 text-sm flex items-center gap-1.5">
                    <Navigation size={16} />
                    3. SHIP TELEPORTATION / INSTANT WARP
                  </strong>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'hyperspace', label: 'To Hyperspace [X,Y]' },
                      { id: 'star_system', label: 'Into Star System' },
                      { id: 'orbit', label: 'Into Orbit (Planet 1-8)' },
                      { id: 'starport', label: 'Starport Arth Bay' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setDevTeleportType(m.id as any)}
                        className={`p-2 rounded-xl font-bold text-center border transition ${
                          devTeleportType === m.id
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Hyperspace Inputs */}
                  {devTeleportType === 'hyperspace' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Galaxy X (0-249):</span>
                          <input
                            type="number"
                            min={0}
                            max={249}
                            value={devTeleportX}
                            onChange={(e) => setDevTeleportX(parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                          />
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Galaxy Y (0-219):</span>
                          <input
                            type="number"
                            min={0}
                            max={219}
                            value={devTeleportY}
                            onChange={(e) => setDevTeleportY(parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Star System Presets:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { name: 'Arth [125, 100]', x: 125, y: 100 },
                            { name: 'Sol [215, 86]', x: 215, y: 86 },
                            { name: 'Crystal Sun [192, 152]', x: 192, y: 152 },
                            { name: 'Uhlek Brain [55, 32]', x: 55, y: 32 },
                            { name: 'Elan [148, 63]', x: 148, y: 63 },
                            { name: 'Heaven [145, 107]', x: 145, y: 107 },
                            { name: 'Sphexi [132, 165]', x: 132, y: 165 },
                            { name: 'Lasthope [175, 94]', x: 175, y: 94 },
                            { name: 'City of Ancients [56, 144]', x: 56, y: 144 },
                            { name: 'Phlegmak [234, 20]', x: 234, y: 20 },
                            { name: 'Koann [112, 200]', x: 112, y: 200 },
                          ].map((st) => (
                            <button
                              key={st.name}
                              onClick={() => {
                                setDevTeleportX(st.x);
                                setDevTeleportY(st.y);
                              }}
                              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 px-2 py-1 rounded-lg font-mono text-[10px]"
                            >
                              {st.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Star System / Orbit Inputs */}
                  {(devTeleportType === 'star_system' || devTeleportType === 'orbit') && (
                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-1">Target Star System:</span>
                        <select
                          value={devTeleportStarId}
                          onChange={(e) => setDevTeleportStarId(parseInt(e.target.value, 10))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-bold"
                        >
                          {UNIVERSE.stars.slice(0, 50).map((st) => (
                            <option key={st.id} value={st.id}>
                              #{st.id} {st.name} [{st.x}, {st.y}] (Class {st.spectral} • {st.planets.length} Planets)
                            </option>
                          ))}
                        </select>
                      </div>

                      {devTeleportType === 'orbit' && (
                        <div>
                          <span className="text-slate-400 block text-[11px] mb-1">Planet Number (1-8):</span>
                          <select
                            value={devTeleportPlanetSlot}
                            onChange={(e) => setDevTeleportPlanetSlot(parseInt(e.target.value, 10))}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2 font-bold"
                          >
                            {(() => {
                              const s = UNIVERSE.stars.find((star) => star.id === devTeleportStarId) || UNIVERSE.stars[0];
                              return s.planets.filter((p) => !p.destroyed).map((p, idx) => (
                                <option key={idx} value={idx + 1}>
                                  Planet {idx + 1}: {(p as any)?.storyName ? `${(p as any).storyName} [${p.name}]` : p.name} ({p.type} • {p.gravity}G • {p.atmosphereDensity})
                                </option>
                              ));
                            })()}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() =>
                      handleDevTeleport(
                        devTeleportType,
                        devTeleportX,
                        devTeleportY,
                        devTeleportStarId,
                        devTeleportPlanetSlot,
                      )
                    }
                    className="w-full bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white py-3 rounded-xl font-black text-xs shadow-xl"
                  >
                    EXECUTE TELEPORTATION ➔
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: CARGO SPAWNER */}
            {devActiveTab === 'cargo' && (
              <div className="space-y-3">
                {/* Hold Status & [Show hold] Button */}
                <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-cyan-800/80 flex flex-wrap items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <Package size={18} className="text-yellow-400" />
                    <div>
                      <strong className="text-white text-xs block">UNIFIED CARGO STORE</strong>
                      <span className="text-slate-400 text-[11px] font-mono">
                        Artifacts: <strong className="text-cyan-300">{artifactsInHold.length}</strong> • Minerals: <strong className="text-amber-300">{Object.entries(cargoHold).filter(([_, v]) => v > 0).length} types</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleDevShowHold}
                    data-testid="dev-show-hold"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl font-black text-xs shadow-lg flex items-center gap-1.5 transition hover:scale-105 active:scale-95"
                  >
                    <Package size={14} />
                    [Show hold]
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* 1. Mineral Spawner */}
                  <div className="bg-slate-950/90 p-4 rounded-2xl border border-cyan-900/80 flex flex-col justify-between gap-3 shadow-inner">
                    <strong className="text-cyan-300 text-xs flex items-center gap-1.5">
                      <Package size={15} />
                      MINERAL SPAWNER (21+ENDURIUM)
                    </strong>
                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Mineral:</span>
                        <select
                          value={devMineralName}
                          onChange={(e) => setDevMineralName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2 font-bold"
                        >
                          {[
                            'Endurium',
                            'Titanium',
                            'Cobalt',
                            'Promethium',
                            'Aluminum',
                            'Copper',
                            'Silver',
                            'Molybdenum',
                            'Iron',
                            'Platinum',
                            'Gold',
                            'Plutonium',
                            'Chromium',
                            'Rodnium',
                            'Tungsten',
                            'Lead',
                            'Nickel',
                            'Zinc',
                            'Tin',
                            'Antimony',
                            'Uranium',
                            'Silicon',
                          ].map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Volume (m³):</span>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={devMineralVolume}
                          onChange={(e) => setDevMineralVolume(parseFloat(e.target.value) || 1)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => handleDevSpawnMineral(devMineralName, devMineralVolume, false)}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-xl font-black shadow"
                      >
                        + Add to Cargo Hold
                      </button>
                      {devMineralName === 'Endurium' && (
                        <button
                          onClick={() => handleDevSpawnMineral(devMineralName, devMineralVolume, true)}
                          className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 py-2 rounded-xl font-black shadow"
                        >
                          + Inject Direct to Fuel Tank
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. Artifact Spawner */}
                  <div className="bg-slate-950/90 p-4 rounded-2xl border border-purple-900/80 flex flex-col justify-between gap-3 shadow-inner">
                    <strong className="text-purple-300 text-xs flex items-center gap-1.5">
                      <Sparkles size={15} />
                      ARTIFACT SPAWNER (34+15 RELICS)
                    </strong>

                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Select Artifact:</span>
                        <select
                          value={devArtifactId}
                          onChange={(e) => setDevArtifactId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2 font-bold text-xs"
                        >
                          <optgroup label="Special Campaign Relics (15)">
                            {CANONICAL_ARTIFACTS.slice(0, 15).map((a) => (
                              <option key={a.id} value={a.id}>
                                ★ {a.realName} ({a.volume}m³) [{a.id}]
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="General Precursor Relics (19)">
                            {CANONICAL_ARTIFACTS.slice(15).map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.realName} ({a.volume}m³) [{a.id}]
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800 text-[10px] text-slate-300 leading-tight">
                        {CANONICAL_ARTIFACTS.find((a) => a.id === devArtifactId)?.description || 'Precursor Relic'}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => handleDevSpawnArtifact(devArtifactId)}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-xl font-black shadow"
                      >
                        Spawn in Starship Hold
                      </button>
                      <button
                        onClick={() => {
                          CANONICAL_ARTIFACTS.slice(0, 15).forEach((art) => handleDevSpawnArtifact(art.id));
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 border border-purple-600 text-purple-300 py-1.5 rounded-xl font-bold text-[10px]"
                      >
                        Spawn All 15 Special Relics
                      </button>
                    </div>
                  </div>

                  {/* 3. Lifeform Specimen Spawner */}
                  <div className="bg-slate-950/90 p-4 rounded-2xl border border-emerald-900/80 flex flex-col justify-between gap-3 shadow-inner">
                    <strong className="text-emerald-300 text-xs flex items-center gap-1.5">
                      <Heart size={15} />
                      LIFEFORM SPECIMEN SPAWNER
                    </strong>

                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Species Name:</span>
                        <select
                          value={devSpecimenName}
                          onChange={(e) => setDevSpecimenName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-1.5 font-bold"
                        >
                          {[
                            'Chitinous Strider',
                            'Bioluminescent Floater',
                            'Armored Land-Tortoise',
                            'Spiked Crystal Crawler',
                            'Crystalline Stalker',
                            'Carnivorous Spore-Gorgon',
                            'Horned Grazing Behemoth',
                            'Gliding Membrane Wing',
                            'Lava-Salamander',
                          ].map((sp) => (
                            <option key={sp} value={sp}>
                              {sp}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Size:</span>
                          <select
                            value={devSpecimenSize}
                            onChange={(e) => setDevSpecimenSize(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-1.5 font-bold"
                          >
                            <option value="Small">Small (1m³)</option>
                            <option value="Medium">Medium (2.5m³)</option>
                            <option value="Large">Large (6m³)</option>
                            <option value="Behemoth">Behemoth (12m³)</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Bounty (M.U.):</span>
                          <input
                            type="number"
                            min={100}
                            max={50000}
                            value={devSpecimenValue}
                            onChange={(e) => setDevSpecimenValue(parseInt(e.target.value, 10) || 1000)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-white font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleDevSpawnSpecimen(devSpecimenName, devSpecimenSize, devSpecimenVolume, devSpecimenValue)
                      }
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl font-black shadow"
                    >
                      Spawn Specimen in Vehicle Hold
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CREW MODIFIER */}
            {devActiveTab === 'crew' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950/90 p-4 rounded-2xl border border-emerald-900/80 flex flex-col gap-3 shadow-inner">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <strong className="text-emerald-300 text-sm flex items-center gap-1.5">
                      <Users size={16} />
                      4. CREW ATTRIBUTES & SKILL MODIFIER
                    </strong>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleDevQuickCrew}
                        className="bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-3.5 py-1 rounded-xl font-black shadow"
                      >
                        [Quick Crew]
                      </button>
                      <button
                        onClick={handleDevReviveAllCrew}
                        className="bg-slate-900 hover:bg-slate-800 border border-emerald-500 text-emerald-300 px-3 py-1 rounded-xl font-bold"
                      >
                        Revive All Fallen
                      </button>
                      <button
                        onClick={handleDevMaxAllCrew}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1 rounded-xl font-black shadow"
                      >
                        Max All Crew (All 250)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block text-[11px] mb-1">Select Crew Member:</span>
                      <select
                        value={devSelectedCrewId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setDevSelectedCrewId(id);
                          const m = crewRoster.find((c) => c.id === id);
                          if (m) {
                            setDevCrewVitality(m.vitality);
                            setDevCrewSci(m.skills.science);
                            setDevCrewNav(m.skills.navigation);
                            setDevCrewEng(m.skills.engineering);
                            setDevCrewCom(m.skills.communications);
                            setDevCrewMed(m.skills.medicine);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-bold"
                      >
                        {crewRoster.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.race}) - Vit: {Math.round(c.vitality)}% {c.alive ? '' : '[DECEASED]'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 font-bold mb-1">
                        <span>Vitality (0-100%):</span>
                        <span className="font-mono text-cyan-300">{devCrewVitality}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={devCrewVitality}
                        onChange={(e) => setDevCrewVitality(parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-2">
                    {[
                      { label: 'Science', val: devCrewSci, setFn: setDevCrewSci },
                      { label: 'Navigation', val: devCrewNav, setFn: setDevCrewNav },
                      { label: 'Engineering', val: devCrewEng, setFn: setDevCrewEng },
                      { label: 'Communications', val: devCrewCom, setFn: setDevCrewCom },
                      { label: 'Medicine', val: devCrewMed, setFn: setDevCrewMed },
                    ].map((sk) => (
                      <div key={sk.label} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                          <span>{sk.label}:</span>
                          <span className="font-mono text-yellow-300">{sk.val}</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={250}
                          value={sk.val}
                          onChange={(e) => sk.setFn(parseInt(e.target.value, 10))}
                          className="w-full accent-yellow-400 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      handleDevModifyCrew(
                        devSelectedCrewId,
                        devCrewVitality,
                        devCrewSci,
                        devCrewNav,
                        devCrewEng,
                        devCrewCom,
                        devCrewMed,
                      )
                    }
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-black shadow"
                  >
                    Apply Modifications to Selected Officer
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: SHIP HEALTH & FUEL MANAGER */}
            {devActiveTab === 'ship' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950/90 p-4 rounded-2xl border border-cyan-900/80 flex flex-col gap-3 shadow-inner">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <strong className="text-cyan-300 text-sm flex items-center gap-1.5">
                      <Shield size={16} />
                      5. SHIP HEALTH, FUEL & SUBSYSTEMS MANAGER
                    </strong>

                    <div className="flex gap-2">
                      <button
                        onClick={handleDevRepairAllSystems}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1 rounded-xl font-black shadow"
                      >
                        Repair All (100%)
                      </button>
                      <button
                        onClick={handleDevMaxUpgradeShip}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1 rounded-xl font-black shadow"
                      >
                        Max Upgrade Ship
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex justify-between font-bold mb-1">
                        <span>Hull Integrity:</span>
                        <span className="font-mono text-cyan-300">{devHullInput} / 250</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={250}
                        value={devHullInput}
                        onChange={(e) => setDevHullInput(parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex justify-between font-bold mb-1">
                        <span>Armor Plating:</span>
                        <span className="font-mono text-emerald-300">{devArmorInput} pts</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1500}
                        value={devArmorInput}
                        onChange={(e) => setDevArmorInput(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex justify-between font-bold mb-1">
                        <span>Deflector Shields:</span>
                        <span className="font-mono text-cyan-300">{devShieldInput} pts</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={2500}
                        value={devShieldInput}
                        onChange={(e) => setDevShieldInput(parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleDevSetShipHealth(devHullInput, devArmorInput, devShieldInput)}
                    className="bg-cyan-700 hover:bg-cyan-600 text-white py-2 rounded-xl font-black shadow"
                  >
                    Set Hull, Armor, & Shield Points
                  </button>

                  {/* Fuel Quick Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <Fuel size={14} />
                      Endurium Fuel: <strong className="font-mono">{enduriumFuel.toFixed(1)} m³</strong>
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleDevRefillFuel(100)}
                        className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-3 py-1 rounded-lg font-black text-xs"
                      >
                        Refill (100 m³)
                      </button>
                      <button
                        onClick={() => handleDevRefillFuel(500)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1 rounded-lg font-black text-xs"
                      >
                        Max Tank (500 m³)
                      </button>
                      <button
                        onClick={() => handleDevRefillFuel(0)}
                        className="bg-red-900 hover:bg-red-800 text-red-200 px-3 py-1 rounded-lg font-bold text-xs"
                      >
                        Empty Fuel (0 m³)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SPAWN ALIEN ENCOUNTER & SET RANGE TOOL */}
            {devActiveTab === 'alien_encounter' && (
              <div className="space-y-4 text-xs">
                {/* 1. Set Range Tool */}
                <div className="bg-slate-950/90 p-4 rounded-2xl border border-yellow-900/80 flex flex-col gap-3 shadow-inner">
                  <strong className="text-yellow-400 text-sm flex items-center gap-1.5">
                    <CrosshairIcon size={16} />
                    🎯 SET TARGET VESSEL RANGE (POSITIONING TOOL)
                  </strong>
                  <p className="text-slate-300 text-xs">
                    Repositions the targeted alien vessel exactly that many cells directly ahead (north / nose direction) of your starship.
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">Range (cells):</span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      step={0.5}
                      value={devTargetRange}
                      onChange={(e) => setDevTargetRange(parseFloat(e.target.value) || 1.0)}
                      className="w-28 bg-slate-900 border border-yellow-500 rounded-xl px-3 py-1.5 text-white font-mono font-bold text-center"
                    />
                    <button
                      onClick={() => {
                        const tgt = activeEncounterGroup?.ships[encounterTargetIndex] || activeEncounterGroup?.ships[0];
                        if (tgt) {
                          tgt.x = encounterShipPos.x;
                          tgt.y = encounterShipPos.y + devTargetRange;
                          markDevAction(`Placed ${tgt.vesselClass} at range ${devTargetRange.toFixed(1)} cells directly ahead.`);
                          gameAudio.playConfirmSelect();
                        } else {
                          gameAudio.playErrorBuzz();
                          addMessage('DEV: No active alien encounter on grid.', 'Captain', 'alert');
                        }
                      }}
                      className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-5 py-1.5 rounded-xl font-black text-xs shadow"
                    >
                      [Place]
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[1.0, 2.0, 3.0, 5.0, 8.0, 10.0, 12.0, 15.0].map((rVal) => (
                      <button
                        key={rVal}
                        onClick={() => {
                          setDevTargetRange(rVal);
                          const tgt = activeEncounterGroup?.ships[encounterTargetIndex] || activeEncounterGroup?.ships[0];
                          if (tgt) {
                            tgt.x = encounterShipPos.x;
                            tgt.y = encounterShipPos.y + rVal;
                            markDevAction(`Placed ${tgt.vesselClass} at range ${rVal.toFixed(1)} cells.`);
                            gameAudio.playConfirmSelect();
                          }
                        }}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-yellow-300 px-2.5 py-1 rounded-lg font-mono text-[11px]"
                      >
                        {rVal.toFixed(1)} cells
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Spawn Encounter */}
                <div className="bg-slate-950/90 p-4 rounded-2xl border border-red-900/80 flex flex-col gap-3 shadow-inner">
                  <strong className="text-red-400 text-sm flex items-center gap-1.5">
                    <Flame size={16} />
                    SPAWN IMMEDIATE ALIEN ENCOUNTER
                  </strong>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-400 block text-[11px] mb-1">Alien Race:</span>
                      <select
                        value={devAlienRace}
                        onChange={(e) => setDevAlienRace(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-bold"
                      >
                        {[
                          'Elowan',
                          'Thrynn',
                          'Veloxi',
                          'Spemin',
                          'Gazurtoid',
                          'Uhlek',
                          'Mechans',
                          'Minstrels',
                          'Nomad',
                          'Veloxi Drone',
                          'Mysterions',
                          'Derelict',
                        ].map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] mb-1">Vessel Class:</span>
                      <select
                        value={devAlienVesselClass}
                        onChange={(e) => setDevAlienVesselClass(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-bold"
                      >
                        <option value="Warship">Warship (Cruiser/Dreadnought)</option>
                        <option value="Scout">Scout (Fast Interceptor)</option>
                        <option value="Transport">Transport (Cargo Carrier)</option>
                        <option value="Drone">Drone (Defense Sentry)</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] mb-1">Ship Count (1 - 8):</span>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={devAlienShipCount}
                        onChange={(e) => setDevAlienShipCount(parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleDevSpawnAlienEncounter(devAlienRace, devAlienVesselClass, devAlienShipCount);
                      setIsDevPanelOpen(false);
                    }}
                    className="w-full bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-3 rounded-xl font-black text-xs shadow-xl"
                  >
                    SPAWN ENCOUNTER IMMEDIATELY ⚔
                  </button>
                </div>
              </div>
            )}

            {/* TAB 7: SET ALIEN RACE BASE MOOD */}
            {devActiveTab === 'alien_mood' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950/90 p-4 rounded-2xl border border-pink-900/80 flex flex-col gap-3 shadow-inner">
                  <strong className="text-pink-300 text-sm flex items-center gap-1.5">
                    <Heart size={16} />
                    7. SET ALIEN RACE BASE MOOD & DISPOSITION
                  </strong>

                  {/* Table of all species and their current persistent baseMood */}
                  <div className="space-y-1.5">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Current Persistent Species Base Mood Index (0..100):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {(['Elowan', 'Thrynn', 'Veloxi', 'Spemin', 'Gazurtoid', 'Uhlek', 'Mechans', 'Minstrels'] as AlienRace[]).map((r) => {
                        const moodVal = speciesBaseMoods[r] ?? DEFAULT_BASE_MOODS[r] ?? 50;
                        const moodTag =
                          moodVal >= 100
                            ? 'Furious (100)'
                            : moodVal > 80
                            ? 'Hostile'
                            : moodVal > 60
                            ? 'Agitated'
                            : moodVal > 40
                            ? 'Cautious'
                            : moodVal > 20
                            ? 'Receptive'
                            : 'Pleased';
                        return (
                          <div key={r} className="p-2 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between">
                            <span className="text-white font-bold text-xs">{r}</span>
                            <div className="flex justify-between items-center text-[10px] font-mono mt-0.5">
                              <span className={moodVal >= 100 ? 'text-red-400 font-bold' : moodVal > 60 ? 'text-amber-400' : 'text-emerald-400'}>
                                {moodTag}
                              </span>
                              <strong className="text-yellow-400">{moodVal}/100</strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[11px] mb-1">Select Alien Race:</span>
                      <select
                        value={devMoodRace}
                        onChange={(e) => setDevMoodRace(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-bold"
                      >
                        {['Elowan', 'Thrynn', 'Veloxi', 'Spemin', 'Gazurtoid', 'Uhlek', 'Mechans', 'Minstrels'].map(
                          (r) => (
                            <option key={r} value={r}>
                              {r} (Current Base Mood: {speciesBaseMoods[r as AlienRace] ?? DEFAULT_BASE_MOODS[r as AlienRace] ?? 50})
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] mb-1">Target Mood State / Preset:</span>
                      <select
                        value={devMoodState}
                        onChange={(e) => setDevMoodState(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-bold"
                      >
                        <option value="Friendly">Friendly (Mood 10/100 • Pacified)</option>
                        <option value="Neutral">Neutral (Mood 45/100 • Open to Comms)</option>
                        <option value="Hostile">Hostile (Mood 95/100 • Attack on Sight)</option>
                        <option value="Obsequious">Obsequious (Mood 20/100 • Subservient)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDevSetAlienMood(devMoodRace, devMoodState)}
                      className="flex-1 bg-pink-600 hover:bg-pink-500 text-white py-2.5 rounded-xl font-black shadow"
                    >
                      Apply Base Mood Preset to {devMoodRace}
                    </button>
                    <button
                      onClick={() => {
                        setSpeciesBaseMoods((prev) => ({ ...prev, [devMoodRace]: 100 }));
                        if (activeEncounterGroup && activeEncounterGroup.race === devMoodRace) {
                          activeEncounterGroup.posture = 'Hostile';
                          activeEncounterGroup.currentMood = 100;
                          activeEncounterGroup.baseMood = 100;
                          setAlienCommsState((prev) => ({ ...prev, alienMood: 100, alienPosture: 'Hostile' }));
                        }
                        markDevAction(`Set ${devMoodRace} base mood to 100 (Furious)`);
                      }}
                      className="bg-red-800 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-black text-xs shadow"
                    >
                      Set Furious (100)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: FLUX LINKS */}
            {devActiveTab === 'flux' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950/90 p-4 rounded-2xl border border-yellow-900/80 flex flex-col gap-3 shadow-inner">
                  <strong className="text-yellow-400 text-sm flex items-center gap-1.5">
                    <Zap size={16} />
                    8. REVEAL ALL 32 CONTINUUM FLUX LINKS
                  </strong>
                  <p className="text-slate-300 leading-relaxed">
                    Marks all 32 Continuum Flux anomaly links as discovered on the Starmap projection and automatically places the Precursor Ring Device in your cargo hold for real-time viewport visualization.
                  </p>

                  <button
                    onClick={handleDevRevealAllFluxLinks}
                    className="w-full bg-linear-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 py-3 rounded-xl font-black text-xs shadow-xl flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} />
                    REVEAL ALL 32 CONTINUUM FLUX LINKS NOW
                  </button>
                </div>
              </div>
            )}

            {/* TAB 9: TELEMETRY MONITOR & LORE FLAGS */}
            {devActiveTab === 'telemetry' && (
              <div className="space-y-4 text-xs">
                {/* Play Voice Line Developer Audio Debugger */}
                <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-pink-900/80 flex flex-col gap-2.5 shadow-inner">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                    <strong className="text-pink-300 font-bold flex items-center gap-1.5 text-xs">
                      <Radio size={15} className="text-pink-400" />
                      PLAY VOICE LINE
                    </strong>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="text-slate-400">Status:</span>
                      <strong
                        data-testid="voice-line-status"
                        className={
                          devVoiceStatus === 'playing'
                            ? 'text-emerald-400 font-bold animate-pulse'
                            : devVoiceStatus === 'no recording'
                            ? 'text-red-400 font-bold'
                            : 'text-slate-400 font-normal'
                        }
                      >
                        {devVoiceStatus}
                      </strong>
                      <span className="text-slate-500 ml-2">FX:</span>
                      <strong className="text-cyan-300">
                        {devVoiceInput.trim().startsWith('crew:')
                          ? 'off'
                          : voiceEngine.resolveFxKey(voiceEngine.resolveLineRace(parseInt(devVoiceInput, 10) || 1))}
                      </strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <label className="text-slate-300 font-bold text-xs">Line ID / Hash:</label>
                    <input
                      type="text"
                      value={devVoiceInput}
                      onChange={(e) => setDevVoiceInput(e.target.value)}
                      className="w-36 bg-slate-900 border border-pink-500 rounded-xl px-2.5 py-1 text-white font-mono font-bold text-center text-xs"
                      placeholder="1-556 or crew:<hash>"
                      data-testid="voice-line-input"
                    />
                    <button
                      onClick={() => {
                        const trimmed = devVoiceInput.trim();
                        if (trimmed.startsWith('crew:') || (/^[0-9a-f]{8}$/i.test(trimmed) && isNaN(Number(trimmed)))) {
                          const hash = trimmed.startsWith('crew:') ? trimmed.slice(5).trim() : trimmed;
                          playCrewVoice(hash, (status) => {
                            setDevVoiceStatus(status);
                          }, true);
                        } else {
                          const lineId = parseInt(trimmed, 10) || 1;
                          playAlienVoice(lineId, 0, undefined, undefined, (status) => {
                            setDevVoiceStatus(status);
                          });
                        }
                      }}
                      className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-1.5 rounded-xl font-black text-xs shadow flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Play size={13} className="fill-current" />
                      Play
                    </button>
                    <button
                      onClick={() => {
                        stopAlienVoice();
                        stopCrewVoice();
                        setDevVoiceStatus('idle');
                      }}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-xl font-bold text-xs"
                    >
                      Stop
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono ml-auto">
                      Line ID (1-556) or crew:&lt;hash&gt; (e.g. crew:0e272e2b).
                    </span>
                  </div>
                </div>
                {/* 1. Live Coordinates & Location */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Location</span>
                    <strong className="text-cyan-300">{gameLocation}</strong>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Galaxy Coords</span>
                    <strong className="text-yellow-400">[{Math.round(galaxyShipX)}, {Math.round(galaxyShipY)}]</strong>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Current Star</span>
                    <strong className="text-white truncate block">{currentStar.name}</strong>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Abs Stardate Day</span>
                    <strong className="text-emerald-400 font-mono">Day {currentAbsDay}</strong>
                  </div>
                </div>

                {/* 2. Next 3 Impending Stellar Flares */}
                <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-red-900/80 flex flex-col gap-2 shadow-inner">
                  <strong className="text-red-400 flex items-center gap-1.5 font-bold">
                    <Flame size={14} />
                    NEXT 3 IMPENDING STELLAR FLARES (STABILITY MONITOR)
                  </strong>

                  {flaresStopped ? (
                    <div className="p-2 bg-emerald-950/60 border border-emerald-500 rounded-xl text-emerald-300 font-bold">
                      ✓ ALL STELLAR FLARES PERMANENTLY STOPPED (Control Nexus destroyed).
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {UNIVERSE.stars
                        .filter((s) => s.flareDay !== undefined && s.flareDay >= currentAbsDay)
                        .sort((a, b) => (a.flareDay || 0) - (b.flareDay || 0))
                        .slice(0, 3)
                        .map((st) => {
                          const daysLeft = (st.flareDay || 0) - currentAbsDay;
                          return (
                            <div key={st.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
                              <div>
                                <strong className="text-white block truncate">{st.name}</strong>
                                <span className="text-slate-400 text-[10px]">Coords: [{st.x}, {st.y}] • Flare Day: {st.flareDay}</span>
                              </div>
                              <span className={daysLeft <= 15 ? 'text-red-400 font-black mt-1' : 'text-amber-400 font-bold mt-1'}>
                                {daysLeft} Days Remaining
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* 3. Next 3 Unread Corporate Notices */}
                <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-cyan-900/80 flex flex-col gap-2 shadow-inner">
                  <strong className="text-cyan-300 flex items-center gap-1.5 font-bold">
                    <Radio size={14} />
                    NEXT 3 SCHEDULED INTERSTEL BULLETINS / MEMOS
                  </strong>

                  <div className="space-y-1.5">
                    {FULL_NOTICES_CATALOG.filter((b) => {
                      const bDate = parseDateString(b.date);
                      return getAbsoluteDay(bDate.day, bDate.month, bDate.year) > currentAbsDay;
                    })
                      .sort((a, b) => {
                        const ad = parseDateString(a.date);
                        const bd = parseDateString(b.date);
                        return getAbsoluteDay(ad.day, ad.month, ad.year) - getAbsoluteDay(bd.day, bd.month, bd.year);
                      })
                      .slice(0, 3)
                      .map((b) => (
                        <div key={b.id} className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <strong className="text-yellow-400 block">{b.title}</strong>
                            <span className="text-[10px] text-slate-400">{b.author}</span>
                          </div>
                          <span className="text-cyan-300 font-mono text-[11px]">{b.date}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 4. Lore State & Heat x10 Toggles */}
                <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-purple-900/80 flex flex-col gap-2">
                  <strong className="text-purple-300 font-bold">CAMPAIGN STORY FLAGS & HEAT ACCELERATION:</strong>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {/* Hand Test 16: Heat x10 checkbox / toggle */}
                    <button
                      onClick={() => {
                        setDevHeatX10((prev) => !prev);
                        markDevAction(`Toggled Heat x10 to ${!devHeatX10}`);
                      }}
                      className={`p-2 rounded-xl border font-bold flex items-center justify-between ${
                        devHeatX10 ? 'bg-red-950 border-red-500 text-red-300 shadow-[0_0_10px_#ef4444]' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>Heat x10 (0.2s):</span>
                      <strong className={devHeatX10 ? 'text-red-300' : 'text-slate-500'}>
                        {devHeatX10 ? 'ACTIVE [x10]' : 'OFF [1x]'}
                      </strong>
                    </button>

                    <button
                      onClick={() => {
                        setFlaresStopped((prev) => !prev);
                        markDevAction(`Toggled flaresStopped to ${!flaresStopped}`);
                      }}
                      className={`p-2 rounded-xl border font-bold ${
                        flaresStopped ? 'bg-emerald-950 border-emerald-400 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Flares Stopped: {flaresStopped ? 'TRUE' : 'FALSE'}
                    </button>

                    <button
                      onClick={() => {
                        setUhlekSilenced((prev) => !prev);
                        markDevAction(`Toggled uhlekSilenced to ${!uhlekSilenced}`);
                      }}
                      className={`p-2 rounded-xl border font-bold ${
                        uhlekSilenced ? 'bg-emerald-950 border-emerald-400 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Uhlek Silenced: {uhlekSilenced ? 'TRUE' : 'FALSE'}
                    </button>

                    <button
                      onClick={() => {
                        setElowanHostile((prev) => !prev);
                        markDevAction(`Toggled elowanHostile to ${!elowanHostile}`);
                      }}
                      className={`p-2 rounded-xl border font-bold ${
                        elowanHostile ? 'bg-red-950 border-red-400 text-red-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Elowan Hostile: {elowanHostile ? 'TRUE' : 'FALSE'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </MenuOverlay>
      )}
        </div>
      </div>
    </DevLabelsContext.Provider>
  );
}
