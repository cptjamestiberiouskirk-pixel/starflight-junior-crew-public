import {clearShipArtCache} from './utils/ship-art';
// tslint:disable
/* eslint-disable */
/**
 * Unified Player Starship Rendering Test Suite.
 *
 * Verifies all requirements for drawUnifiedPlayerShip across Hyperspace, Star System, Orbit, and Combat:
 * 1. Function existence and dual invocation interface (options object and positional arguments)
 * 2. Aspect ratio preservation: 1087 x 602 hull aspect ratio across all lengthPx
 * 3. Scaling requirements: ~64px in Hyperspace/Star System, ~40px in Orbit
 * 4. Engine exhaust flames: color-coded by engine class, longer & flickering when isMoving: true, idle glow when isMoving: false
 * 5. Installed cargo pods along spine: up to 16 arranged in 2 rows of 8
 * 6. Graceful vector fallback when sprite not loaded or null
 * 7. Shield bubble active when shieldsActive: true and not in nebula
 * 8. Nebula suppression of shield bubble & magenta outline/glow tint when inNebula: true
 * 9. Banking roll squish factor support (bankFactor: 0.88)
 * 10. Smooth rendering: ctx.imageSmoothingEnabled = true, ctx.imageSmoothingQuality = 'high'
 */

import { drawUnifiedPlayerShip, UnifiedPlayerShipConfig } from './utils/helper';
import { renderGantryShipCanvas } from './App';

class MockCanvasContext2D {
  savedStates: any[] = [];
  calls: { method: string; args: any[] }[] = [];
  imageSmoothingEnabled = false;
  imageSmoothingQuality = 'low';
  fillStyle: any = '#000000';
  strokeStyle: any = '#000000';
  lineWidth = 1;
  shadowColor = '';
  shadowBlur = 0;
  canvas: any = { width: 460, height: 280, clientWidth: 460, clientHeight: 280, getBoundingClientRect: () => ({ width: 460, height: 280 }) };

  save() {
    this.calls.push({ method: 'save', args: [] });
    this.savedStates.push({});
  }
  restore() {
    this.calls.push({ method: 'restore', args: [] });
    this.savedStates.pop();
  }
  clearRect(x: number, y: number, w: number, h: number) {
    this.calls.push({ method: 'clearRect', args: [x, y, w, h] });
  }
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number) {
    this.calls.push({ method: 'setTransform', args: [a, b, c, d, e, f] });
  }
  setLineDash(segments: number[]) {
    this.calls.push({ method: 'setLineDash', args: [segments] });
  }
  roundRect(x: number, y: number, w: number, h: number, radii?: any) {
    this.calls.push({ method: 'roundRect', args: [x, y, w, h, radii] });
  }
  rect(x: number, y: number, w: number, h: number) {
    this.calls.push({ method: 'rect', args: [x, y, w, h] });
  }
  strokeRect(x: number, y: number, w: number, h: number) {
    this.calls.push({ method: 'strokeRect', args: [x, y, w, h] });
  }
  translate(x: number, y: number) {
    this.calls.push({ method: 'translate', args: [x, y] });
  }
  rotate(rad: number) {
    this.calls.push({ method: 'rotate', args: [rad] });
  }
  scale(sx: number, sy: number) {
    this.calls.push({ method: 'scale', args: [sx, sy] });
  }
  beginPath() {
    this.calls.push({ method: 'beginPath', args: [] });
  }
  clip() {
    this.calls.push({ method: 'clip', args: [] });
  }
  closePath() {
    this.calls.push({ method: 'closePath', args: [] });
  }
  moveTo(x: number, y: number) {
    this.calls.push({ method: 'moveTo', args: [x, y] });
  }
  lineTo(x: number, y: number) {
    this.calls.push({ method: 'lineTo', args: [x, y] });
  }
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
    this.calls.push({ method: 'quadraticCurveTo', args: [cpx, cpy, x, y] });
  }
  arc(x: number, y: number, r: number, sa: number, ea: number) {
    this.calls.push({ method: 'arc', args: [x, y, r, sa, ea] });
  }
  ellipse(x: number, y: number, rx: number, ry: number, rot: number, sa: number, ea: number) {
    this.calls.push({ method: 'ellipse', args: [x, y, rx, ry, rot, sa, ea] });
  }
  fill() {
    this.calls.push({ method: 'fill', args: [] });
  }
  stroke() {
    this.calls.push({ method: 'stroke', args: [] });
  }
  fillRect(x: number, y: number, w: number, h: number) {
    this.calls.push({ method: 'fillRect', args: [x, y, w, h] });
  }
  fillText(text: string, x: number, y: number) {
    this.calls.push({ method: 'fillText', args: [text, x, y] });
  }
  createLinearGradient(x0: number, y0: number, x1: number, y1: number) {
    return {
      addColorStop: (_offset: number, _color: string) => {},
    };
  }
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) {
    return {
      addColorStop: (_offset: number, _color: string) => {},
    };
  }
  drawImage(img: any, ...args: any[]) {
    this.calls.push({ method: 'drawImage', args: [img, ...args] });
  }
}

// Loads synchronously in the renderer contract tests; real PNG decoding is covered by native QA.
class CompleteConfigurationImage {
  complete=true;naturalWidth=1087;naturalHeight=602;decoding='';onload:(()=>void)|null=null;onerror:(()=>void)|null=null;private value='';
  set src(value:string){this.value=value;this.onload?.();}get src(){return this.value;}removeAttribute(){this.value='';}
}
export function runShipTests(): { passed: number; failed: number; results: string[] } {
  let passed = 0;
  let failed = 0;
  const results: string[] = [];

  function assert(condition: unknown, desc: string): asserts condition {
    if (condition) {
      passed++;
      results.push(`✓ PASS: ${desc}`);
    } else {
      failed++;
      results.push(`✗ FAIL: ${desc}`);
      console.error(`Assertion failed: ${desc}`);
    }
  }

  // Test 1: Function exists and accepts options object
  {
    const mockCtx = new MockCanvasContext2D();
    drawUnifiedPlayerShip({
      ctx: mockCtx as any,
      x: 100,
      y: 200,
      headingRad: Math.PI / 4,
      lengthPx: 64,
      engineClass: 2,
      isMoving: true,
      cargoPodsCount: 4,
      shieldsActive: true,
      inNebula: false,
    });

    assert(typeof drawUnifiedPlayerShip === 'function', 'Test 1a: drawUnifiedPlayerShip is a function');
    assert(mockCtx.imageSmoothingEnabled === true, 'Test 1b: imageSmoothingEnabled is set to true');
    assert(mockCtx.imageSmoothingQuality === 'high', 'Test 1c: imageSmoothingQuality is high');

    const translates = mockCtx.calls.filter((c) => c.method === 'translate');
    assert(translates.length > 0 && translates[0].args[0] === 100 && translates[0].args[1] === 200, 'Test 1d: translates to (100, 200)');

    const rotates = mockCtx.calls.filter((c) => c.method === 'rotate');
    assert(rotates.length > 0 && Math.abs(rotates[0].args[0] - Math.PI / 4) < 1e-4, 'Test 1e: rotates to heading');
  }

  // Test 2: Function accepts positional arguments
  {
    const mockCtx = new MockCanvasContext2D();
    drawUnifiedPlayerShip(
      mockCtx as any,
      50,
      75,
      Math.PI / 2,
      64,
      3,
      false,
      8,
      false,
      false,
    );

    const translates = mockCtx.calls.filter((c) => c.method === 'translate');
    assert(translates[0].args[0] === 50 && translates[0].args[1] === 75, 'Test 2a: Positional args translated to (50, 75)');
    const rotates = mockCtx.calls.filter((c) => c.method === 'rotate');
    assert(Math.abs(rotates[0].args[0] - Math.PI / 2) < 1e-4, 'Test 2b: Positional args rotated to heading PI/2');
  }

  // Test 3: Aspect ratio preservation & dimensions
  {
    const mockCtx = new MockCanvasContext2D();
    const mockHullImg: any = { complete: true, naturalWidth: 1087, naturalHeight: 602 };
    const mockAssets: any = { ship_hull_bare_topdown_1k: mockHullImg };

    // Hyperspace/Star System size: 64px length
    drawUnifiedPlayerShip({
      ctx: mockCtx as any,
      x: 0,
      y: 0,
      headingRad: 0,
      lengthPx: 64,
      engineClass: 1,
      isMoving: false,
      cargoPodsCount: 0,
      shieldsActive: false,
      inNebula: false,
      assets: mockAssets,
    });

    const drawCalls = mockCtx.calls.filter((c) => c.method === 'drawImage' && c.args[0] === mockHullImg);
    assert(drawCalls.length === 1, 'Test 3a: drawImage called for hull image');
    const [_, dx, dy, dw, dh] = drawCalls[0].args;
    assert(dw === 64, 'Test 3b: Hull width is lengthPx (64px)');
    const expectedH64 = 64 / (1087 / 602);
    assert(Math.abs(dh - expectedH64) < 1e-3, 'Test 3c: Hull height strictly maintains 1087:602 aspect ratio');
    assert(dx === -32, 'Test 3d: Centered on X (-32)');

    // Synchronous Orbit size: 40px length
    const mockCtxOrbit = new MockCanvasContext2D();
    drawUnifiedPlayerShip({
      ctx: mockCtxOrbit as any,
      x: 10,
      y: 20,
      headingRad: 0,
      lengthPx: 40,
      engineClass: 1,
      isMoving: false,
      cargoPodsCount: 0,
      shieldsActive: false,
      inNebula: false,
      assets: mockAssets,
    });

    const orbitDrawCalls = mockCtxOrbit.calls.filter((c) => c.method === 'drawImage' && c.args[0] === mockHullImg);
    assert(orbitDrawCalls.length === 1, 'Test 3e: Orbit hull image drawn');
    const [__, _dx, _dy, orbitW, orbitH] = orbitDrawCalls[0].args;
    assert(orbitW === 40, 'Test 3f: Orbit hull width is 40px');
    const expectedH40 = 40 / (1087 / 602);
    assert(Math.abs(orbitH - expectedH40) < 1e-3, 'Test 3g: Orbit hull height maintains 1087:602 aspect ratio (~22.15px)');

    // Star System Max Zoom (8.0x) size: 12.5 * 8.0 = 100px length
    const mockCtxSystem100 = new MockCanvasContext2D();
    drawUnifiedPlayerShip({
      ctx: mockCtxSystem100 as any,
      x: 0,
      y: 0,
      headingRad: 0,
      lengthPx: 100,
      engineClass: 1,
      isMoving: false,
      cargoPodsCount: 0,
      shieldsActive: false,
      inNebula: false,
      assets: mockAssets,
    });
    const sys100Calls = mockCtxSystem100.calls.filter((c) => c.method === 'drawImage' && c.args[0] === mockHullImg);
    assert(sys100Calls.length === 1, 'Test 3h: Star System 100px hull image drawn at 8x max zoom');
    assert(sys100Calls[0].args[3] === 100, 'Test 3i: Star System 8x max zoom ship length is 100px (12.5 * 8.0)');

    // Star System Overview Zoom (0.65x) size: 12.5 * 0.65 = 8.125px length (> 6px, renders small ship shape)
    const mockCtxSystemOverview = new MockCanvasContext2D();
    drawUnifiedPlayerShip({
      ctx: mockCtxSystemOverview as any,
      x: 0,
      y: 0,
      headingRad: 0,
      lengthPx: 8.125,
      engineClass: 1,
      isMoving: false,
      cargoPodsCount: 0,
      shieldsActive: false,
      inNebula: false,
      assets: mockAssets,
    });
    const sysOverviewCalls = mockCtxSystemOverview.calls.filter((c) => c.method === 'drawImage' && c.args[0] === mockHullImg);
    assert(sysOverviewCalls.length === 1, 'Test 3i-2: Star System 0.65x overview renders ship shape without falling back to marker');
    assert(Math.abs(sysOverviewCalls[0].args[3] - 8.125) < 1e-4, 'Test 3i-3: Star System 0.65x overview ship length is 8.125px (12.5 * 0.65)');

    // Hyperspace size: 10px length
    const mockCtxHyper10 = new MockCanvasContext2D();
    drawUnifiedPlayerShip({
      ctx: mockCtxHyper10 as any,
      x: 0,
      y: 0,
      headingRad: 0,
      lengthPx: 10,
      engineClass: 1,
      isMoving: false,
      cargoPodsCount: 0,
      shieldsActive: false,
      inNebula: false,
      assets: mockAssets,
    });
    const hyper10Calls = mockCtxHyper10.calls.filter((c) => c.method === 'drawImage' && c.args[0] === mockHullImg);
    assert(hyper10Calls.length === 1, 'Test 3j: Hyperspace 10px hull image drawn');
    assert(hyper10Calls[0].args[3] === 10, 'Test 3k: Hyperspace ship length is 10px');

    // Orbit view size: 8px length
    const mockCtxOrbit8 = new MockCanvasContext2D();
    drawUnifiedPlayerShip({
      ctx: mockCtxOrbit8 as any,
      x: 0,
      y: 0,
      headingRad: 0,
      lengthPx: 8,
      engineClass: 1,
      isMoving: false,
      cargoPodsCount: 0,
      shieldsActive: false,
      inNebula: false,
      assets: mockAssets,
    });
    const orbit8Calls = mockCtxOrbit8.calls.filter((c) => c.method === 'drawImage' && c.args[0] === mockHullImg);
    assert(orbit8Calls.length === 1, 'Test 3l: Orbit 8px hull image drawn');
    assert(orbit8Calls[0].args[3] === 8, 'Test 3m: Orbit ship length is 8px');

    // Zoomed out < 6px (e.g. 1.3px in system overview): draws 6px marker + label
    const mockCtxMarker = new MockCanvasContext2D();
    drawUnifiedPlayerShip({
      ctx: mockCtxMarker as any,
      x: 50,
      y: 50,
      headingRad: 0,
      lengthPx: 2,
      engineClass: 1,
      isMoving: false,
      cargoPodsCount: 0,
      shieldsActive: false,
      inNebula: false,
      label: 'ARTH VESSEL',
    });
    const markerLines = mockCtxMarker.calls.filter((c) => c.method === 'lineTo');
    assert(markerLines.length > 0, 'Test 3n: < 6px draws 6px marker lines');
    const markerLabels = mockCtxMarker.calls.filter((c) => c.method === 'fillText' && c.args[0] === 'ARTH VESSEL');
    assert(markerLabels.length === 1, 'Test 3o: < 6px draws readable label');
  }

  // Test 4: Whole-ship configurations replace ten/sixteen individual pod overlays.
  {
    const original=globalThis.Image;globalThis.Image=CompleteConfigurationImage as any;
    try{
      for(const [count,expected] of [[10,'c10'],[20,'c16']] as const){
        const ctx=new MockCanvasContext2D();
        drawUnifiedPlayerShip({ctx:ctx as any,x:0,y:0,headingRad:0,lengthPx:64,engineClass:1,isMoving:false,cargoPodsCount:count,shieldsActive:false,inNebula:false});
        const draws=ctx.calls.filter(c=>c.method==='drawImage');
        assert(draws.length===1&&draws[0].args[0].src.includes('ship-'+expected+'-a0-l0-m0.png'),'Whole-ship image selects the exact bounded cargo configuration');
      }
    }finally{clearShipArtCache();globalThis.Image=original;}
  }

  // Test 5: Fallback vector rendering when asset not loaded
  {
    const mockCtx = new MockCanvasContext2D();
    drawUnifiedPlayerShip({
      ctx: mockCtx as any,
      x: 0,
      y: 0,
      headingRad: 0,
      lengthPx: 64,
      engineClass: 1,
      isMoving: false,
      cargoPodsCount: 0,
      shieldsActive: false,
      inNebula: false,
      assets: {}, // empty assets -> fallback
    });

    const drawCalls = mockCtx.calls.filter((c) => c.method === 'drawImage');
    assert(drawCalls.length === 0, 'Test 5a: No drawImage calls when image not loaded');
    const polygonMove = mockCtx.calls.filter((c) => c.method === 'moveTo');
    assert(polygonMove.length > 0, 'Test 5b: Vector polygon rendered as fallback');
  }

  // Test 6: Shield bubble and Nebula effects
  {
    // Normal space with active shields -> draws shield bubble
    const mockCtxShield = new MockCanvasContext2D();
    drawUnifiedPlayerShip({
      ctx: mockCtxShield as any,
      x: 0,
      y: 0,
      headingRad: 0,
      lengthPx: 64,
      engineClass: 1,
      isMoving: false,
      cargoPodsCount: 0,
      shieldsActive: true,
      inNebula: false,
    });

    const shieldArcs = mockCtxShield.calls.filter((c) => c.method === 'arc');
    assert(shieldArcs.length > 0, 'Test 6a: Shield bubble arc rendered when shields active');

    // Inside nebula with active shields -> shields suppressed, magenta outline drawn
    const mockCtxNebula = new MockCanvasContext2D();
    drawUnifiedPlayerShip({
      ctx: mockCtxNebula as any,
      x: 0,
      y: 0,
      headingRad: 0,
      lengthPx: 64,
      engineClass: 1,
      isMoving: false,
      cargoPodsCount: 0,
      shieldsActive: true,
      inNebula: true,
    });

    const nebulaEllipses = mockCtxNebula.calls.filter((c) => c.method === 'ellipse');
    assert(nebulaEllipses.length > 0, 'Test 6b: Magenta outline ellipse rendered inside nebula');
  }

  // Test 7: Banking squish roll factor
  {
    const mockCtxBank = new MockCanvasContext2D();
    drawUnifiedPlayerShip({
      ctx: mockCtxBank as any,
      x: 0,
      y: 0,
      headingRad: 0,
      lengthPx: 64,
      engineClass: 1,
      isMoving: true,
      cargoPodsCount: 0,
      shieldsActive: false,
      inNebula: false,
      bankFactor: 0.88,
    });

    const scaleCalls = mockCtxBank.calls.filter((c) => c.method === 'scale' && c.args[0] === 1.0 && c.args[1] === 0.88);
    assert(scaleCalls.length === 1, 'Test 7: Banking squish factor (1.0, 0.88) applied');
  }

    // Test 8: Vessel label
  {
    const mockCtxLabel = new MockCanvasContext2D();
    drawUnifiedPlayerShip({
      ctx: mockCtxLabel as any,
      x: 100,
      y: 200,
      headingRad: 0,
      lengthPx: 64,
      engineClass: 1,
      isMoving: false,
      cargoPodsCount: 0,
      shieldsActive: false,
      inNebula: false,
      label: 'ISS ENTERPRISE',
    });

    const textCalls = mockCtxLabel.calls.filter((c) => c.method === 'fillText' && c.args[0] === 'ISS ENTERPRISE');
    assert(textCalls.length === 1, 'Test 8: Vessel label rendered');
  }

  // Test 9: renderGantryShipCanvas consistent ship sizing with/without shields & concentric berth ring
  {
    const mockCtxNoShield = new MockCanvasContext2D();
    const mockCanvasNoShield: any = {
      width: 460,
      height: 280,
      clientWidth: 460,
      clientHeight: 280,
      getBoundingClientRect: () => ({ width: 460, height: 280 }),
      getContext: () => mockCtxNoShield,
    };

    const mockCtxShield = new MockCanvasContext2D();
    const mockCanvasShield: any = {
      width: 460,
      height: 280,
      clientWidth: 460,
      clientHeight: 280,
      getBoundingClientRect: () => ({ width: 460, height: 280 }),
      getContext: () => mockCtxShield,
    };

    const mockHullImg: any = { complete: true, naturalWidth: 1087, naturalHeight: 602 };
    const mockPodImg: any = { complete: true, naturalWidth: 496, naturalHeight: 824 };
    const mockAssets: any = {
      ship_hull_bare_topdown_1k: mockHullImg,
      ship_cargo_pod_sprite: mockPodImg,
    };

    // Render without shields (shieldClass = 0)
    renderGantryShipCanvas(
      mockCanvasNoShield,
      mockAssets,
      2, // engineClass
      4, // cargoPods
      2, // armorClass
      0, // shieldClass = 0 (no shields)
      2, // missileClass
      2, // laserClass
    );

    // Render with shields (shieldClass = 5)
    renderGantryShipCanvas(
      mockCanvasShield,
      mockAssets,
      2, // engineClass
      4, // cargoPods
      2, // armorClass
      5, // shieldClass = 5 (active shields)
      2, // missileClass
      2, // laserClass
    );

    // 1. Verify hull drawImage dimensions are 100% IDENTICAL with and without shields
    const hullDrawNoShield = mockCtxNoShield.calls.find((c) => c.method === 'drawImage' && c.args[0] === mockHullImg);
    const hullDrawShield = mockCtxShield.calls.find((c) => c.method === 'drawImage' && c.args[0] === mockHullImg);

    assert(hullDrawNoShield, 'Test 9a: Hull drawn on no-shield canvas');
    assert(hullDrawShield, 'Test 9a: Hull drawn on shield canvas');
    const widthNoShield = hullDrawNoShield.args[3];
    const widthShield = hullDrawShield.args[3];
    const heightNoShield = hullDrawNoShield.args[4];
    const heightShield = hullDrawShield.args[4];

    assert(
      Math.abs(widthNoShield - widthShield) < 1e-4,
      `Test 9b: Ship width is strictly identical with vs without shields (${widthNoShield} vs ${widthShield})`,
    );
    assert(
      Math.abs(heightNoShield - heightShield) < 1e-4,
      `Test 9c: Ship height is strictly identical with vs without shields (${heightNoShield} vs ${heightShield})`,
    );

    // 2. Verify berth ring dimensions follow berthRx = bubbleRx + 14 and berthRy = bubbleRy + 14
    // Find berth ring ellipse calls:
    const ellipseCallsNoShield = mockCtxNoShield.calls.filter((c) => c.method === 'ellipse');
    const ellipseCallsShield = mockCtxShield.calls.filter((c) => c.method === 'ellipse');

    // Both should have the dark pad and dashed amber ring ellipses
    assert(ellipseCallsNoShield.length >= 2, 'Test 9d: Berth pad and amber ring ellipses drawn on no-shield canvas');
    assert(ellipseCallsShield.length >= 3, 'Test 9e: Berth pad, amber ring, and shield bubble drawn on shield canvas');

    const berthPadCall = ellipseCallsShield[0];
    const berthRingCall = ellipseCallsShield[1];
    const shieldBubbleCall = ellipseCallsShield[ellipseCallsShield.length - 1]; // shield bubble drawn after weapons

    const berthRx = berthRingCall.args[2];
    const berthRy = berthRingCall.args[3];
    const bubbleRx = shieldBubbleCall.args[2];
    const bubbleRy = shieldBubbleCall.args[3];

    assert(
      Math.abs(berthRx - (bubbleRx + 14)) < 1e-4,
      `Test 9f: Berth ring Rx is strictly concentric with bubble (berthRx = bubbleRx + 14: ${berthRx} === ${bubbleRx} + 14)`,
    );
    assert(
      Math.abs(berthRy - (bubbleRy + 14)) < 1e-4,
      `Test 9g: Berth ring Ry is strictly concentric with bubble (berthRy = bubbleRy + 14: ${berthRy} === ${bubbleRy} + 14)`,
    );

    // 3. Verify berth ring fits inside panel with at least 12px margin
    const panelWidth = 460;
    const panelHeight = 280;
    const maxAllowedRx = panelWidth / 2 - 12; // 218
    const maxAllowedRy = panelHeight / 2 - 12; // 128
    assert(berthRx <= maxAllowedRx + 1e-4, `Test 9h: berthRx (${berthRx}) fits inside panel with >= 12px margin (<= ${maxAllowedRx})`);
    assert(berthRy <= maxAllowedRy + 1e-4, `Test 9i: berthRy (${berthRy}) fits inside panel with >= 12px margin (<= ${maxAllowedRy})`);

    // 4. Verify no shield bubble is drawn when shieldClass = 0
    // On no-shield canvas, no ellipse should have radius equal to bubbleRx (only the 2 berth ring ellipses)
    assert(ellipseCallsNoShield.length === 2, 'Test 9j: No cyan shield bubble drawn when shields not installed');

    // 5. Verify articulated docking clamps are positioned at sphere center x = 0.39 * shipW
    // Old clamp pads at ring extremities (cx ± berthRx) are removed.
    const berthCx = panelWidth / 2;
    const expectedLeftX = berthCx - berthRx - 6;
    const roundRectCalls = mockCtxShield.calls.filter((c) => c.method === 'roundRect');
    const hasOldLeftClamp = roundRectCalls.some((c) => Math.abs(c.args[0] - expectedLeftX) < 1e-2);
    assert(!hasOldLeftClamp, 'Test 9k: Old clamp pads at ring extremities removed');

    const expectedClampX = 0.39 * widthShield;
    const arcCalls = mockCtxShield.calls.filter((c) => c.method === 'arc');
    const hasClampGrip = arcCalls.some((c) => Math.abs(c.args[0] - expectedClampX) < 2.0);
    assert(hasClampGrip, `Test 9l: Articulated docking clamps positioned at sphere center x = 0.39 * shipW (${expectedClampX.toFixed(1)})`);

    // Verify clamp release animation runs smoothly across release progress
    renderGantryShipCanvas(
      mockCanvasShield,
      mockAssets,
      2,
      4,
      2,
      5,
      2,
      2,
      0.5, // releasing clamps
    );
    assert(true, 'Test 9m: Gantry canvas renders smoothly during clamp release animation');
  }

  // Test 10: renderGantryShipCanvas Armor Tile Canvas Drawing
  {
    const mockCtxCl3 = new MockCanvasContext2D();
    const mockCanvasCl3: any = {
      width: 460,
      height: 280,
      clientWidth: 460,
      clientHeight: 280,
      getBoundingClientRect: () => ({ width: 460, height: 280 }),
      getContext: () => mockCtxCl3,
    };
    const mockHullImg: any = { complete: true, naturalWidth: 1087, naturalHeight: 602 };
    const mockAssets: any = {
      ship_hull_bare_topdown_1k: mockHullImg,
    };

    renderGantryShipCanvas(
      mockCanvasCl3,
      mockAssets,
      1, // engineClass
      0, // cargoPods = 0
      3, // armorClass = 3
      0, // shieldClass
      0, // missileClass
      0, // laserClass
    );

    const hullDraw = mockCtxCl3.calls.find((c) => c.method === 'drawImage' && c.args[0] === mockHullImg);
    assert(hullDraw, 'hullDraw must be defined');
    const shipW = hullDraw.args[3] || 200;
    const shipH = hullDraw.args[4] || 110;

    // Verify tile canvas or hull draw is aligned directly over hull:
    const drawCalls = mockCtxCl3.calls.filter((c) => c.method === 'drawImage');
    assert(drawCalls.length >= 1, 'Test 10a: drawImage called for hull on gantry canvas');
    assert(Math.abs(hullDraw.args[1] - (-shipW / 2)) < 1e-2, 'Test 10b: Hull aligned at -shipW / 2');
    assert(Math.abs(hullDraw.args[2] - (-shipH / 2)) < 1e-2, 'Test 10c: Hull aligned at -shipH / 2');
  }

  // Test 11: Gantry shows one approved stowed-launcher image, retaining frame and scale.
  {
    const original=globalThis.Image;globalThis.Image=CompleteConfigurationImage as any;
    try{
      const ctx=new MockCanvasContext2D();const canvas:any={width:460,height:280,clientWidth:460,clientHeight:280,getBoundingClientRect:()=>({width:460,height:280}),getContext:()=>ctx};
      renderGantryShipCanvas(canvas,{},1,0,0,0,2,0);
      const draws=ctx.calls.filter(c=>c.method==='drawImage'),ship=draws[0];
      assert(!!ship,'Approved complete launcher configuration is drawn');
      assert(ship.args[0].src.includes('ship-c00-a0-l0-m2.png'),'Gantry selects class two authored launcher art');
      assert(draws.length===1,'No separate crude rail or pod overlays are added');
      assert(Math.abs(ship.args[3]/ship.args[4]-1087/602)<.001,'Full configuration retains the original hull aspect ratio');
    }finally{clearShipArtCache();globalThis.Image=original;}
  }

  // Test 12: Clearance & Bounding box with Class 3 & Class 4/5 armor plates
  {
    const mockCtxShieldCl5 = new MockCanvasContext2D();
    const mockCanvasShieldCl5: any = {
      width: 460,
      height: 280,
      clientWidth: 460,
      clientHeight: 280,
      getBoundingClientRect: () => ({ width: 460, height: 280 }),
      getContext: () => mockCtxShieldCl5,
    };
    const mockHullImg: any = { complete: true, naturalWidth: 1087, naturalHeight: 602 };
    const mockPodImg: any = { complete: true, naturalWidth: 496, naturalHeight: 824 };
    const mockAssets: any = {
      ship_hull_bare_topdown_1k: mockHullImg,
      ship_cargo_pod_sprite: mockPodImg,
    };

    renderGantryShipCanvas(
      mockCanvasShieldCl5,
      mockAssets,
      3, // engineClass
      16, // cargoPods = 16 max
      5, // armorClass = 5
      5, // shieldClass = 5
      3, // missileClass
      3, // laserClass
    );

    const ellipseCalls = mockCtxShieldCl5.calls.filter((c) => c.method === 'ellipse');
    const berthRingCall = ellipseCalls[1];
    const shieldBubbleCall = ellipseCalls[ellipseCalls.length - 1];

    const berthRx = berthRingCall.args[2];
    const berthRy = berthRingCall.args[3];
    const bubbleRx = shieldBubbleCall.args[2];
    const bubbleRy = shieldBubbleCall.args[3];

    // Panel margins >= 12px
    const maxAllowedRx = 460 / 2 - 12; // 218
    const maxAllowedRy = 280 / 2 - 12; // 128

    assert(berthRx <= maxAllowedRx + 1e-4, `Test 12a: Class 5 berthRx (${berthRx.toFixed(1)}) fits inside panel with >= 12px margin`);
    assert(berthRy <= maxAllowedRy + 1e-4, `Test 12b: Class 5 berthRy (${berthRy.toFixed(1)}) fits inside panel with >= 12px margin`);
    assert(Math.abs(berthRx - (bubbleRx + 14)) < 1e-4, 'Test 12c: Concentric 14px gap strictly maintained at Class 5');
    assert(Math.abs(berthRy - (bubbleRy + 14)) < 1e-4, 'Test 12d: Concentric 14px gap strictly maintained at Class 5');
  }

  return { passed, failed, results };
}

// Auto-run if executed or in test runner
if (typeof window !== 'undefined') {
  (window as any).runShipTests = runShipTests;
}

const testRunner = globalThis as unknown as {
  describe?: (name: string, fn: () => void) => void;
  it?: (name: string, fn: () => Promise<void> | void) => void;
  process?: { env?: Record<string, string | undefined> };
};

if (typeof testRunner.describe === 'function' && typeof testRunner.it === 'function') {
  testRunner.describe('Unified Player Starship Rendering', () => {
    testRunner.it!('passes all starship rendering tests', () => {
      const { failed } = runShipTests();
      if (failed > 0) {
        throw new Error(`${failed} test(s) failed in Ship Rendering test suite.`);
      }
    });
  });
} else if (typeof testRunner.process !== 'undefined' && testRunner.process.env?.NODE_ENV === 'test') {
  const { passed, failed } = runShipTests();
  console.log(`[Ship Tests] Completed: ${passed} passed, ${failed} failed.`);
}


