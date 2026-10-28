import assert from 'node:assert/strict';
import { createServer } from 'vite';
import fs from 'node:fs/promises';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const unitReport={timestamp:new Date().toISOString(),status:'running',suites:[],totalPassed:0,totalFailed:0};
try {
  const { getConfig } = await server.ssrLoadModule('/constants.ts');
  const { values } = JSON.parse(await (await import('node:fs/promises')).readFile(
    new URL('../playground_config.json', import.meta.url), 'utf8',
  ));
  for (const [key, value] of Object.entries(values)) assert.equal(getConfig(key), value);
  console.log('Saved Playground configuration: PASS');

  for (const [file, entrypoint, label] of [
    ['/save-validation.test.ts','runSaveValidationTests','Malformed and oversized save rejection with legacy compatibility'],
    ['/save-render-safety.test.ts','runSaveRenderSafetyTests','Adversarial imported coordinates, bounded rendering and legacy save compatibility'],
    ['/playground-player-count.test.ts','runPlaygroundPlayerCountTests','Bounded development SDK player allocation'],
    ['/encounter-drive.test.ts','runEncounterDriveTests','Original encounter acceleration integer transitions and engine availability'],
    ['/feature-fuel.test.ts','runFeatureFuelTests','Original feature-linked Endurium caches and persistent depletion'],
    ['/original-economy.test.ts','runOriginalEconomyTests','Original ELEMENT trade values, fractional cargo and repair affordability'],
    ['/parent-messaging.test.ts','runParentMessagingTests','Authenticated parent messaging, spoof rejection and lifecycle cleanup'],
    ['/keyboard-input.test.ts','runKeyboardInputTests','Native control activation versus game keyboard shortcuts'],
    ['/software-raster-performance.test.ts','runSoftwareRasterPerformanceTests','Software scanline equivalence and opaque depth regression'],
    ['/science-illustrations.test.ts','runScienceIllustrationTests','Material-specific Science artwork and uncertainty gates'],
    ['/alien-sensor.test.ts','runAlienSensorTests','Retained original alien mass, bio, energy and constituents'],
    ['/science-context.test.ts','runScienceContextTests','Selected-target science context and timeline isolation'],
    ['/software-ship-raster.test.ts','runSoftwareShipRasterTests','Software ship depth, armor, glazing and texture perspective'],
    ['/surface-weather.test.ts','runSurfaceWeatherTests','Whole-viewport weather, recycling and preserved conditions'],
    ['/lifeform-recording.test.ts','runLifeformRecordingTests','Moving lifeform recording assistance and original rules'],
    ['/bay-video.test.ts','runBayVideoTests','Configuration-preserving bay videos'],
    ['/armor-coverage.test.ts','runArmorCoverageTests','Actual cumulative three-dimensional tactical hull coverage'],
    ['/armor-style.test.ts','runArmorStyleTests','Tactical armor strength presentation'],
    ['/personnel.test.ts','runPersonnelTests','Batch training, names, assignment recordings, log filters and idle dance'],
    ['/player-feedback-round2.test.ts','runFeedbackRound2Tests','Adversarial map cameras, atmosphere, docking, ground controls and original terrain'],
    ['/science-runtime.test.ts','runScienceRuntimeTests','Science visibility, contact categories and original-derived flight regression'],
    ['/map-presentation.test.ts','runMapPresentationTests','Adversarial maps, opaque orbit lighting, sampling and saved waypoints'],
    ['/crew-portraits.test.ts','runCrewPortraitTests','Diverse stable crew portraits and legacy save compatibility'],
    ['/survey.test.ts','runSurveyTests','Persistent planetary findings and honest ship diagnostics'],
    ['/ship-art.test.ts','runShipArtTests','Approved configuration selection, cache and emitters'],
    ['/bay-outfitting.test.ts', 'runBayOutfittingTests', 'Configured 3D bay equipment and clearance'],
    ['/planet-scans.test.ts', 'runPlanetScanTests', 'Original planetary sensors and analysis'],
    ['/gameplay.test.ts', 'runGameplayTests', 'Gameplay and mission saves'],
    ['/player-experience.test.ts', 'runPlayerExperienceTests', 'Player experience and original surface rules'],
    ['/communications.test.ts','runCommunicationsTests','Original communications and Mechan recognition'],
    ['/music.test.ts','runMusicTests','Music controls and loop synthesis (mock Web Audio)'],
    ['/space-rendering.test.ts', 'runSpaceRenderingTests', 'Space rendering and fixed-step simulation'],
    ['/voice.test.ts', 'runVoiceTests', 'Voice engine (mock Web Audio)'],
    ['/ship.test.ts', 'runShipTests', 'Ship rendering'],

  ]) {
    const module = await server.ssrLoadModule(file);
    // Original canvas suites supply mock canvases; they also need a browser DPR.
    // Install this only after imports, so runtime constructors keep their Node guards.
    const previousWindow = globalThis.window;
    if (entrypoint === 'runShipTests') globalThis.window = { devicePixelRatio: 1 };
    let result;
    try {
      result = await module[entrypoint]();
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
    console.log(`${label}: ${result.passed} passed, ${result.failed} failed`);
    unitReport.suites.push({file,label,passed:result.passed,failed:result.failed});
    unitReport.totalPassed+=result.passed;unitReport.totalFailed+=result.failed;
    for (const line of result.results.filter((line) => line.includes('FAIL'))) console.error(line);
    assert.equal(result.failed, 0, `${label} must pass`);
  }
  unitReport.status='passed';
} catch(error) {
  unitReport.status='failed';unitReport.error=error instanceof Error?error.message:String(error);
  throw error;
} finally {
  await fs.mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
  await fs.writeFile(new URL('../artifacts/qa-unit-report.json',import.meta.url),JSON.stringify(unitReport,null,2)+'\n');
  await server.close();
}

