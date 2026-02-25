// ==========================================
// Sąsiedzi na Migdałowej — Canvas Renderer
// EXPANDED: costumes, weather, new items,
// garden elements, cat, mailman, effects
// ==========================================

import type { GameState, NPC, CostumeItem, InteractiveObject } from './types';
import { CANVAS_W, CANVAS_H, HOUSE, GARDEN, TERRACE, STREET, GARAGE, BINS, ITEM_FLOAT_AMP, ITEM_EMOJIS } from './constants';

let _wallpaperCache: Map<string, CanvasPattern> | null = null;

// ---- Main render ----
export function renderGame(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.save();
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // Screen shake offset
  ctx.translate(state.screenShake.x, state.screenShake.y);

  // Camera zoom + translate
  const zoom = state.camera.zoom;
  ctx.scale(zoom, zoom);
  ctx.translate(-state.camera.x, -state.camera.y);

  // Background layers
  renderSky(ctx, state);
  renderAirplanes(ctx, state);
  renderWeatherBack(ctx, state); // rain/snow behind house
  renderStreet(ctx, state);
  renderStreetCars(ctx, state);
  renderGarden(ctx, state);
  renderTerrace(ctx, state);
  renderConstructionSite(ctx, state);
  renderGarageInterior(ctx, state);
  renderGarbageBins(ctx, state);
  renderHouseExterior(ctx, state);
  renderRooms(ctx, state);
  renderFurniture(ctx, state);
  renderInteractiveObjects(ctx, state);
  renderStairs(ctx, state);
  renderDoor(ctx, state);

  // Game objects
  renderItems(ctx, state);
  renderClimbableIndicators(ctx, state);
  renderNPCs(ctx, state);
  renderRCCar(ctx, state);
  renderPlayer(ctx, state);
  renderParticles(ctx, state);
  renderFloatingTexts(ctx, state);
  renderQuestPointer(ctx, state);
  renderCourierPackage(ctx, state);

  // Weather foreground (snow, leaves in front)
  renderWeatherFront(ctx, state);

  ctx.restore();

  // UI (not affected by camera)
  renderHUD(ctx, state);
  renderMiniMap(ctx, state);
  renderEdgeArrows(ctx, state);
  renderTutorial(ctx, state);
  renderMessage(ctx, state);
  renderComboIndicator(ctx, state);
  renderAchievementPopup(ctx, state);
  renderDoorbellNotification(ctx, state);
}

// ---- Intro Animation ----

// Color interpolation helper for intro
function lerpColor(a: number[], b: number[], t: number): number[] {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

// Helper: draw simplified character for intro
function drawIntroChar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, dir: number,
  shirtColor: string, hairColor: string, skinColor: string,
  scale: number, time: number
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Legs
  ctx.fillStyle = '#2C3E50';
  ctx.fillRect(-6, 10, 5, 16);
  ctx.fillRect(2, 10, 5, 16);
  // Shoes
  ctx.fillStyle = '#333';
  ctx.fillRect(-7 + dir * 2, 25, 8, 4);
  ctx.fillRect(1 + dir * 2, 25, 8, 4);

  // Body
  ctx.fillStyle = shirtColor;
  ctx.beginPath();
  ctx.moveTo(-10, -8);
  ctx.quadraticCurveTo(-11, 0, -9, 12);
  ctx.lineTo(9, 12);
  ctx.quadraticCurveTo(11, 0, 10, -8);
  ctx.closePath();
  ctx.fill();

  // Arms
  for (const side of [-1, 1]) {
    const armSwing = Math.sin(time * 8 + side) * 0.15;
    ctx.save();
    ctx.translate(side * 11, -4);
    ctx.rotate(armSwing);
    ctx.fillStyle = shirtColor;
    ctx.fillRect(-3, 0, 6, 12);
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, 14, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Neck
  ctx.fillStyle = skinColor;
  ctx.fillRect(-3, -12, 6, 5);

  // Head
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(0, -20, 11, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.arc(0, -23, 12, Math.PI * 0.8, Math.PI * 0.2, true);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -25, 11, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (cute, with highlights)
  for (const side of [-1, 1]) {
    const ex = side * 4 + dir * 1.5;
    // White
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(ex, -20, 3.2, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Iris
    ctx.fillStyle = '#3A8BC4';
    ctx.beginPath();
    ctx.arc(ex + dir * 0.5, -20, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // Pupil
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(ex + dir * 0.6, -20, 0.9, 0, Math.PI * 2);
    ctx.fill();
    // Highlight
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(ex + dir * 0.1, -21, 0.7, 0, Math.PI * 2);
    ctx.fill();
    // Lid line
    ctx.strokeStyle = '#6A5040';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(ex, -20.5, 3, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }

  // Nose
  ctx.fillStyle = 'rgba(230,180,150,0.5)';
  ctx.beginPath();
  ctx.arc(dir * 0.5, -17, 1.5, 0, Math.PI);
  ctx.fill();

  // Smile
  ctx.strokeStyle = '#B07050';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(dir * 0.3, -14, 3, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Cheek blush
  for (const side of [-1, 1]) {
    ctx.fillStyle = 'rgba(255,140,120,0.25)';
    ctx.beginPath();
    ctx.ellipse(side * 7, -16, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.lineWidth = 1;
  ctx.restore();
}

export function renderIntro(ctx: CanvasRenderingContext2D, t: number): void {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  // -- Background: animated sky gradient --
  const skyProgress = Math.min(t / 2, 1); // 0→1 over 2 seconds
  const skyTop = lerpColor([15, 15, 40], [100, 180, 240], skyProgress);
  const skyBot = lerpColor([25, 25, 50], [160, 220, 140], skyProgress);
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0, `rgb(${skyTop[0]},${skyTop[1]},${skyTop[2]})`);
  skyGrad.addColorStop(0.7, `rgb(${skyBot[0]},${skyBot[1]},${skyBot[2]})`);
  skyGrad.addColorStop(1, '#5D4037');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // -- Ground --
  const groundY = H * 0.72;
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(0, groundY, W, H - groundY);
  ctx.fillStyle = '#388E3C';
  ctx.fillRect(0, groundY, W, 4);

  // -- Stars (visible at start, fade with sky) --
  if (skyProgress < 0.8) {
    const starAlpha = 1 - skyProgress / 0.8;
    ctx.fillStyle = `rgba(255,255,220,${starAlpha * 0.8})`;
    const starPositions = [
      [0.1, 0.08], [0.25, 0.15], [0.4, 0.05], [0.55, 0.18], [0.7, 0.07],
      [0.85, 0.13], [0.15, 0.22], [0.6, 0.25], [0.35, 0.28], [0.8, 0.22],
      [0.92, 0.06], [0.05, 0.3], [0.48, 0.12], [0.73, 0.28]
    ];
    for (const [sx, sy] of starPositions) {
      const twinkle = 0.5 + 0.5 * Math.sin(t * 3 + sx * 20);
      ctx.globalAlpha = starAlpha * twinkle;
      ctx.beginPath();
      ctx.arc(W * sx, H * sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // -- Sun rising --
  if (t > 0.5) {
    const sunProgress = Math.min((t - 0.5) / 2.5, 1);
    const sunY = H * 0.5 - sunProgress * H * 0.3;
    const sunGlow = ctx.createRadialGradient(W * 0.8, sunY, 0, W * 0.8, sunY, 80);
    sunGlow.addColorStop(0, `rgba(255,235,150,${sunProgress * 0.9})`);
    sunGlow.addColorStop(0.3, `rgba(255,200,100,${sunProgress * 0.3})`);
    sunGlow.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(W * 0.8, sunY, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,240,180,${sunProgress})`;
    ctx.beginPath();
    ctx.arc(W * 0.8, sunY, 25, 0, Math.PI * 2);
    ctx.fill();
  }

  // -- Clouds drifting --
  ctx.fillStyle = `rgba(255,255,255,${Math.min(skyProgress, 0.6)})`;
  for (const [cx, cy, cw] of [[0.2, 0.18, 60], [0.5, 0.12, 80], [0.75, 0.22, 50]]) {
    const drift = t * 8;
    const cloudX = ((W * cx + drift) % (W + 100)) - 50;
    ctx.beginPath();
    ctx.arc(cloudX, H * cy, cw * 0.35, 0, Math.PI * 2);
    ctx.arc(cloudX - cw * 0.25, H * cy + 3, cw * 0.25, 0, Math.PI * 2);
    ctx.arc(cloudX + cw * 0.3, H * cy + 2, cw * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  // -- House building animation (t: 1.5→4s) --
  if (t > 1.5) {
    const houseProgress = Math.min((t - 1.5) / 2.5, 1);
    const hx = W * 0.35;
    const hy = groundY;
    const hw = 200;
    const hh = 180 * houseProgress;

    // Foundation
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(hx, hy - 8, hw, 8);

    // Walls growing up
    ctx.fillStyle = '#F5F0EB';
    ctx.fillRect(hx, hy - hh, hw, hh);

    // Left wall accent
    ctx.fillStyle = '#D7CEC7';
    ctx.fillRect(hx - 4, hy - hh, 4, hh);
    ctx.fillRect(hx + hw, hy - hh, 4, hh);

    // Floor divider (when house is tall enough)
    if (houseProgress > 0.5) {
      const floorAlpha = (houseProgress - 0.5) * 2;
      ctx.fillStyle = `rgba(200,190,180,${floorAlpha})`;
      ctx.fillRect(hx, hy - hh * 0.52, hw, 4);

      // Windows
      ctx.fillStyle = `rgba(135,206,235,${floorAlpha})`;
      // Ground floor
      ctx.fillRect(hx + 20, hy - hh * 0.35, 30, 25);
      ctx.fillRect(hx + 70, hy - hh * 0.35, 30, 25);
      ctx.fillRect(hx + 140, hy - hh * 0.35, 30, 25);
      // Upper floor
      ctx.fillRect(hx + 20, hy - hh * 0.82, 30, 25);
      ctx.fillRect(hx + 80, hy - hh * 0.82, 30, 25);
      ctx.fillRect(hx + 140, hy - hh * 0.82, 30, 25);

      // Window frames
      ctx.strokeStyle = `rgba(255,255,255,${floorAlpha})`;
      ctx.lineWidth = 1.5;
      for (const [wx, wy] of [
        [hx + 20, hy - hh * 0.35], [hx + 70, hy - hh * 0.35], [hx + 140, hy - hh * 0.35],
        [hx + 20, hy - hh * 0.82], [hx + 80, hy - hh * 0.82], [hx + 140, hy - hh * 0.82],
      ]) {
        ctx.strokeRect(wx, wy, 30, 25);
        ctx.beginPath();
        ctx.moveTo(wx + 15, wy);
        ctx.lineTo(wx + 15, wy + 25);
        ctx.stroke();
      }
      ctx.lineWidth = 1;

      // Door
      ctx.fillStyle = `rgba(93,64,55,${floorAlpha})`;
      ctx.fillRect(hx + 110, hy - hh * 0.42, 20, hh * 0.42 - 8);
      // Door handle
      ctx.fillStyle = `rgba(200,168,80,${floorAlpha})`;
      ctx.beginPath();
      ctx.arc(hx + 125, hy - hh * 0.2, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Roof (appears last)
    if (houseProgress > 0.8) {
      const roofAlpha = (houseProgress - 0.8) * 5;
      ctx.fillStyle = `rgba(93,64,55,${roofAlpha})`;
      ctx.beginPath();
      ctx.moveTo(hx - 10, hy - hh);
      ctx.lineTo(hx + hw / 2, hy - hh - 50 * roofAlpha);
      ctx.lineTo(hx + hw + 10, hy - hh);
      ctx.closePath();
      ctx.fill();
      // Chimney
      ctx.fillStyle = `rgba(120,90,70,${roofAlpha})`;
      ctx.fillRect(hx + hw * 0.35, hy - hh - 40 * roofAlpha, 15, 30 * roofAlpha);
    }
  }

  // -- Characters walking in (t: 3→6s) --
  const charBaseY = groundY;

  // Kuba (t: 3→4.5s)
  if (t > 3) {
    const kubaProgress = Math.min((t - 3) / 1.5, 1);
    const kubaX = -30 + kubaProgress * (W * 0.42);
    const kubaY = charBaseY - 42;
    const kubaWalk = kubaProgress < 1 ? Math.sin(t * 10) * 3 : 0;
    // Simple Kuba silhouette
    drawIntroChar(ctx, kubaX, kubaY + kubaWalk, 1, '#222', '#D4B878', '#FFDCB8', 0.8, t);
  }

  // Mama (t: 3.5→5s)
  if (t > 3.5) {
    const mamaProgress = Math.min((t - 3.5) / 1.5, 1);
    const mamaX = W + 30 - mamaProgress * (W * 0.62);
    const mamaY = charBaseY - 46;
    const mamaWalk = mamaProgress < 1 ? Math.sin(t * 9) * 2 : 0;
    drawIntroChar(ctx, mamaX, mamaY + mamaWalk, -1, '#C0392B', '#5A3A22', '#FFDCB8', 0.9, t);
  }

  // Tata (t: 4→5.5s)
  if (t > 4) {
    const tataProgress = Math.min((t - 4) / 1.5, 1);
    const tataX = W + 50 - tataProgress * (W * 0.55);
    const tataY = charBaseY - 50;
    const tataWalk = tataProgress < 1 ? Math.sin(t * 8) * 2.5 : 0;
    drawIntroChar(ctx, tataX, tataY + tataWalk, -1, '#1A1A1A', '#4A3020', '#FFDCB8', 1.0, t);
  }

  // Franek dog (t: 4.5→5.5s)
  if (t > 4.5) {
    const franekProgress = Math.min((t - 4.5) / 1, 1);
    const franekX = -40 + franekProgress * (W * 0.38);
    const franekY = charBaseY - 10;
    const bounce = franekProgress < 1 ? Math.abs(Math.sin(t * 12)) * 5 : 0;
    // Simple dog
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(franekX, franekY - bounce, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(franekX + 12, franekY - 8 - bounce, 8, 0, Math.PI * 2);
    ctx.fill();
    // Ears
    ctx.beginPath();
    ctx.moveTo(franekX + 8, franekY - 16 - bounce);
    ctx.lineTo(franekX + 14, franekY - 24 - bounce);
    ctx.lineTo(franekX + 18, franekY - 14 - bounce);
    ctx.fill();
    // Eye
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(franekX + 15, franekY - 9 - bounce, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(franekX + 14.5, franekY - 10 - bounce, 0.7, 0, Math.PI * 2);
    ctx.fill();
    // Nose
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(franekX + 19, franekY - 7 - bounce, 2, 0, Math.PI * 2);
    ctx.fill();
    // Tail wagging
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    const tailWag = Math.sin(t * 8) * 0.4;
    ctx.beginPath();
    ctx.moveTo(franekX - 14, franekY - 2 - bounce);
    ctx.quadraticCurveTo(franekX - 22, franekY - 15 - bounce + tailWag * 10, franekX - 18, franekY - 22 - bounce + tailWag * 5);
    ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.lineWidth = 1;
  }

  // -- Title text (t: 5→7s) --
  if (t > 5) {
    const titleProgress = Math.min((t - 5) / 1.5, 1);
    const titleAlpha = titleProgress;
    const titleScale = 0.8 + titleProgress * 0.2;

    ctx.save();
    ctx.translate(W / 2, H * 0.2);
    ctx.scale(titleScale, titleScale);

    // Title shadow
    ctx.fillStyle = `rgba(0,0,0,${titleAlpha * 0.3})`;
    ctx.font = 'bold 44px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sąsiedzi na Migdałowej', 2, 2);

    // Title
    ctx.fillStyle = `rgba(255,255,255,${titleAlpha})`;
    ctx.fillText('Sąsiedzi na Migdałowej', 0, 0);

    // Subtitle
    ctx.font = `${20}px "Segoe UI", sans-serif`;
    ctx.fillStyle = `rgba(255,255,230,${titleAlpha * 0.8})`;
    ctx.fillText('Przygody na Migdałowej 47', 0, 35);

    ctx.restore();

    // Sparkle particles around title
    ctx.fillStyle = `rgba(255,255,200,${titleAlpha * 0.7})`;
    for (let i = 0; i < 8; i++) {
      const sparkleT = t * 2 + i * 1.2;
      const sx = W / 2 + Math.sin(sparkleT) * 180 + Math.cos(sparkleT * 0.7) * 40;
      const sy = H * 0.2 + Math.cos(sparkleT * 1.3) * 30 - 10;
      const sz = 1.5 + Math.sin(sparkleT * 3) * 1;
      ctx.beginPath();
      ctx.arc(sx, sy, sz, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // -- "Kliknij aby kontynuować" (after 6s, blinking) --
  if (t > 6) {
    const blink = Math.sin(t * 3) > 0 ? 0.7 : 0.3;
    ctx.fillStyle = `rgba(255,255,255,${blink})`;
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Kliknij lub naciśnij dowolny klawisz...', W / 2, H * 0.92);
    ctx.textAlign = 'left';
  }

  // -- Vignette overlay --
  const vignette = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.7);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

// ---- Sky ----
function renderSky(ctx: CanvasRenderingContext2D, state: GameState): void {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);

  // Weather-aware sky
  if (state.weather === 'rainy' || state.weather === 'cloudy') {
    grad.addColorStop(0, '#78909C');
    grad.addColorStop(0.4, '#90A4AE');
    grad.addColorStop(0.7, '#B0BEC5');
    grad.addColorStop(1, '#CFD8DC');
  } else if (state.weather === 'snowy') {
    grad.addColorStop(0, '#B0BEC5');
    grad.addColorStop(0.4, '#CFD8DC');
    grad.addColorStop(1, '#ECEFF1');
  } else {
    grad.addColorStop(0, '#5B9BD5');
    grad.addColorStop(0.4, '#87CEEB');
    grad.addColorStop(0.7, '#B0E0E6');
    grad.addColorStop(1, '#E0F0E8');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, state.worldWidth, CANVAS_H);

  // Sun (only sunny/leaves) — with parallax
  if (state.weather === 'sunny' || state.weather === 'leaves') {
    const sunP = state.camera.x * 0.85;
    const sunX = 1400 + sunP;
    ctx.fillStyle = '#FFF176';
    ctx.shadowColor = '#FFF176';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(sunX, 80, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Sun rays
    ctx.strokeStyle = 'rgba(255,241,118,0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + state.time * 0.1;
      ctx.beginPath();
      ctx.moveTo(sunX + Math.cos(angle) * 50, 80 + Math.sin(angle) * 50);
      ctx.lineTo(sunX + Math.cos(angle) * 70, 80 + Math.sin(angle) * 70);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
  }

  // Clouds with parallax (move slower than camera for depth)
  const cp = state.camera.x * 0.7;
  drawCloud(ctx, 200 + cp, 60, 0.8);
  drawCloud(ctx, 600 + cp, 40, 1);
  drawCloud(ctx, 1000 + cp, 70, 0.6);
  drawCloud(ctx, 1600 + cp, 50, 0.7);
  drawCloud(ctx, 2200 + cp, 45, 0.85);
  if (state.weather === 'cloudy' || state.weather === 'rainy') {
    drawCloud(ctx, 350 + cp, 50, 1.2);
    drawCloud(ctx, 800 + cp, 35, 1.1);
    drawCloud(ctx, 1200 + cp, 55, 0.9);
    drawCloud(ctx, 1800 + cp, 42, 1.0);
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(x, y, 20 * scale, 0, Math.PI * 2);
  ctx.arc(x + 25 * scale, y - 8 * scale, 25 * scale, 0, Math.PI * 2);
  ctx.arc(x + 50 * scale, y, 20 * scale, 0, Math.PI * 2);
  ctx.arc(x + 25 * scale, y + 5 * scale, 18 * scale, 0, Math.PI * 2);
  ctx.fill();
}

// ---- Airplanes in the sky ----
function renderAirplanes(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const plane of state.airplanes) {
    const scale = 0.5 + (100 - plane.altitude) / 200; // higher = smaller
    const flip = plane.dir; // 1 = right, -1 = left

    ctx.save();
    ctx.translate(plane.x, plane.y);
    ctx.scale(flip * scale, scale);

    // ---- Contrail (white fading trail behind the plane) ----
    const trailDir = -flip; // trail goes opposite to flight direction
    const trailLen = plane.trailLength;
    const trailGrad = ctx.createLinearGradient(0, 0, trailDir * trailLen, 0);
    trailGrad.addColorStop(0, 'rgba(255,255,255,0.5)');
    trailGrad.addColorStop(0.4, 'rgba(255,255,255,0.25)');
    trailGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = trailGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8 * flip, 0);
    ctx.lineTo(-8 * flip + trailDir * trailLen, 0);
    ctx.stroke();
    // Second trail line (for jets, slightly offset)
    if (plane.type === 'jet') {
      ctx.beginPath();
      ctx.moveTo(-8 * flip, 3);
      ctx.lineTo(-8 * flip + trailDir * trailLen * 0.9, 3);
      ctx.stroke();
    }

    // ---- Draw airplane by type ----
    if (plane.type === 'small') {
      drawSmallPlane(ctx);
    } else if (plane.type === 'jet') {
      drawJetPlane(ctx);
    } else {
      drawBiplane(ctx);
    }

    ctx.restore();
  }
}

/** Small Cessna-style cartoon plane */
function drawSmallPlane(ctx: CanvasRenderingContext2D): void {
  // Body (white rounded fuselage)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#B0BEC5';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Nose (rounded, slightly red)
  ctx.fillStyle = '#E53935';
  ctx.beginPath();
  ctx.ellipse(14, 0, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Propeller
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(17, -5);
  ctx.lineTo(18, 5);
  ctx.stroke();

  // Wings
  ctx.fillStyle = '#E3F2FD';
  ctx.strokeStyle = '#90CAF9';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-2, -2);
  ctx.lineTo(4, -12);
  ctx.lineTo(8, -12);
  ctx.lineTo(4, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Bottom wing (slightly behind)
  ctx.beginPath();
  ctx.moveTo(-2, 2);
  ctx.lineTo(4, 12);
  ctx.lineTo(8, 12);
  ctx.lineTo(4, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tail fin (vertical)
  ctx.fillStyle = '#1565C0';
  ctx.beginPath();
  ctx.moveTo(-13, 0);
  ctx.lineTo(-15, -8);
  ctx.lineTo(-10, -8);
  ctx.lineTo(-10, 0);
  ctx.closePath();
  ctx.fill();

  // Tail wing (horizontal)
  ctx.fillStyle = '#E3F2FD';
  ctx.beginPath();
  ctx.moveTo(-13, 0);
  ctx.lineTo(-15, -4);
  ctx.lineTo(-9, -4);
  ctx.lineTo(-9, 0);
  ctx.closePath();
  ctx.fill();

  // Window (cockpit)
  ctx.fillStyle = '#81D4FA';
  ctx.beginPath();
  ctx.ellipse(6, -2, 3, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4FC3F7';
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

/** Sleek jet airplane (silver/gray) */
function drawJetPlane(ctx: CanvasRenderingContext2D): void {
  // Body (silver fuselage, longer)
  ctx.fillStyle = '#CFD8DC';
  ctx.beginPath();
  ctx.moveTo(-20, -3);
  ctx.lineTo(20, -2);
  ctx.quadraticCurveTo(24, 0, 20, 2);
  ctx.lineTo(-20, 3);
  ctx.quadraticCurveTo(-22, 0, -20, -3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#90A4AE';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Nose (pointed, darker)
  ctx.fillStyle = '#78909C';
  ctx.beginPath();
  ctx.moveTo(20, -2);
  ctx.quadraticCurveTo(26, 0, 20, 2);
  ctx.closePath();
  ctx.fill();

  // Swept wings
  ctx.fillStyle = '#B0BEC5';
  ctx.strokeStyle = '#90A4AE';
  ctx.lineWidth = 0.5;
  // Top wing
  ctx.beginPath();
  ctx.moveTo(2, -3);
  ctx.lineTo(-6, -16);
  ctx.lineTo(6, -16);
  ctx.lineTo(10, -3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Bottom wing
  ctx.beginPath();
  ctx.moveTo(2, 3);
  ctx.lineTo(-6, 16);
  ctx.lineTo(6, 16);
  ctx.lineTo(10, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tail fin (vertical, tall)
  ctx.fillStyle = '#E53935';
  ctx.beginPath();
  ctx.moveTo(-18, -3);
  ctx.lineTo(-22, -12);
  ctx.lineTo(-15, -12);
  ctx.lineTo(-14, -3);
  ctx.closePath();
  ctx.fill();

  // Tail wings (horizontal, small)
  ctx.fillStyle = '#B0BEC5';
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(-22, -6);
  ctx.lineTo(-14, -6);
  ctx.lineTo(-14, 0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(-22, 6);
  ctx.lineTo(-14, 6);
  ctx.lineTo(-14, 0);
  ctx.closePath();
  ctx.fill();

  // Windows (row of small dots)
  ctx.fillStyle = '#81D4FA';
  for (let i = -10; i <= 12; i += 4) {
    ctx.beginPath();
    ctx.arc(i, -1.5, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cockpit window
  ctx.fillStyle = '#4FC3F7';
  ctx.beginPath();
  ctx.ellipse(16, -1, 3, 2, -0.1, 0, Math.PI * 2);
  ctx.fill();
}

/** Vintage biplane (red/yellow, two stacked wings, propeller) */
function drawBiplane(ctx: CanvasRenderingContext2D): void {
  // Body (red fuselage)
  ctx.fillStyle = '#E53935';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#C62828';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Yellow stripe accent
  ctx.fillStyle = '#FDD835';
  ctx.fillRect(-10, -1, 20, 2);

  // Upper wing
  ctx.fillStyle = '#FFEE58';
  ctx.strokeStyle = '#F9A825';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-4, -5);
  ctx.lineTo(-2, -14);
  ctx.lineTo(10, -14);
  ctx.lineTo(8, -5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Lower wing
  ctx.beginPath();
  ctx.moveTo(-4, 5);
  ctx.lineTo(-2, 14);
  ctx.lineTo(10, 14);
  ctx.lineTo(8, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wing struts (vertical connectors between wings)
  ctx.strokeStyle = '#8D6E63';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(1, -14);
  ctx.lineTo(1, 14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(7, -14);
  ctx.lineTo(7, 14);
  ctx.stroke();

  // Tail fin
  ctx.fillStyle = '#FDD835';
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(-18, -8);
  ctx.lineTo(-12, -7);
  ctx.lineTo(-11, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#F9A825';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Tail horizontal
  ctx.fillStyle = '#FFEE58';
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(-17, -4);
  ctx.lineTo(-11, -4);
  ctx.lineTo(-11, 0);
  ctx.closePath();
  ctx.fill();

  // Propeller hub
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.arc(16, 0, 2, 0, Math.PI * 2);
  ctx.fill();

  // Propeller blades (animated spin implied by shape)
  ctx.fillStyle = '#8D6E63';
  ctx.save();
  ctx.translate(16, 0);
  ctx.beginPath();
  ctx.ellipse(0, 0, 1.5, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 0, 1.5, 7, -0.3 + Math.PI / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Cockpit (open vintage style)
  ctx.fillStyle = '#81D4FA';
  ctx.beginPath();
  ctx.arc(5, -3, 3, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#4FC3F7';
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

// ---- Street (left of house) ----
function renderStreet(ctx: CanvasRenderingContext2D, _state: GameState): void {
  const sy = STREET.y;

  // Road surface
  ctx.fillStyle = STREET.roadColor;
  ctx.fillRect(STREET.startX, sy - 10, STREET.endX - STREET.startX, 30);

  // Road lines (dashed center line)
  ctx.strokeStyle = STREET.lineColor;
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo(STREET.startX, sy + 5);
  ctx.lineTo(STREET.endX, sy + 5);
  ctx.stroke();
  ctx.setLineDash([]);

  // Sidewalk
  ctx.fillStyle = STREET.sidewalkColor;
  ctx.fillRect(STREET.sidewalkX, sy - 12, STREET.sidewalkW, 32);
  // Sidewalk edge
  ctx.fillStyle = '#A09888';
  ctx.fillRect(STREET.sidewalkX, sy - 12, STREET.sidewalkW, 3);

  // Street lamp
  ctx.fillStyle = '#666';
  ctx.fillRect(-380, sy - 120, 4, 120);
  ctx.fillStyle = '#FFD54F';
  ctx.beginPath();
  ctx.arc(-378, sy - 120, 8, 0, Math.PI * 2);
  ctx.fill();

  // Curb
  ctx.fillStyle = '#888';
  ctx.fillRect(STREET.startX, sy - 12, STREET.endX - STREET.startX, 3);
}

// ---- Street Cars ----
function renderStreetCars(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const car of state.streetCars) {
    ctx.save();
    ctx.translate(car.x, car.y);
    if (car.dir === -1) ctx.scale(-1, 1);

    const w = car.type === 'bus' ? 70 : car.type === 'van' ? 55 : car.type === 'suv' ? 50 : 45;
    const h = car.type === 'bus' ? 22 : car.type === 'suv' ? 20 : 18;

    // Car body
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h, w, h, 3);
    ctx.fill();

    // Roof
    ctx.fillStyle = car.type === 'police' ? '#1565C0' : car.color;
    ctx.beginPath();
    ctx.roundRect(-w / 3, -h - 10, w * 0.5, 12, [4, 4, 0, 0]);
    ctx.fill();

    // Windows
    ctx.fillStyle = '#B3E5FC';
    ctx.fillRect(-w / 3 + 2, -h - 8, w * 0.5 - 4, 8);

    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(-w / 3, 0, 5, 0, Math.PI * 2);
    ctx.arc(w / 3, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // Police lights
    if (car.type === 'police') {
      ctx.fillStyle = '#E53935';
      ctx.fillRect(-8, -h - 14, 6, 4);
      ctx.fillStyle = '#42A5F5';
      ctx.fillRect(2, -h - 14, 6, 4);
    }

    // Headlights
    ctx.fillStyle = '#FFD54F';
    ctx.fillRect(w / 2 - 3, -h + 3, 4, 4);

    ctx.restore();
  }
}

// ---- Terrace with grill ----
function renderTerrace(ctx: CanvasRenderingContext2D, _state: GameState): void {
  const tx = TERRACE.x;
  const ty = HOUSE.groundLevel;

  // Terrace deck (beige teak planks)
  ctx.fillStyle = TERRACE.deckColor;
  ctx.fillRect(tx, ty - 4, TERRACE.w, 8);

  // Plank lines
  ctx.strokeStyle = TERRACE.deckDark;
  ctx.lineWidth = 0.5;
  for (let px = tx + 12; px < tx + TERRACE.w; px += 15) {
    ctx.beginPath();
    ctx.moveTo(px, ty - 4);
    ctx.lineTo(px, ty + 4);
    ctx.stroke();
  }

  // Railing posts
  ctx.fillStyle = TERRACE.railColor;
  ctx.fillRect(tx, ty - 40, 3, 40);
  ctx.fillRect(tx + TERRACE.w - 3, ty - 40, 3, 40);
  // Top rail
  ctx.fillRect(tx, ty - 40, TERRACE.w, 3);
  // Middle rail
  ctx.fillRect(tx, ty - 22, TERRACE.w, 2);

  // ---- GRILL ----
  const gx = TERRACE.grillX;
  const gy = ty;

  // Grill legs
  ctx.fillStyle = '#333';
  ctx.fillRect(gx - 12, gy - 35, 3, 35);
  ctx.fillRect(gx + 12, gy - 35, 3, 35);

  // Grill body (kettle shape)
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.arc(gx, gy - 38, 16, Math.PI, 0);
  ctx.fill();

  // Grill grate lines
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  for (let i = -10; i <= 10; i += 5) {
    ctx.beginPath();
    ctx.moveTo(gx + i, gy - 38);
    ctx.lineTo(gx + i, gy - 36);
    ctx.stroke();
  }

  // Grill lid (slightly open)
  ctx.fillStyle = '#2A2A2A';
  ctx.beginPath();
  ctx.arc(gx, gy - 40, 15, Math.PI, 0);
  ctx.fill();

  // Smoke
  ctx.fillStyle = 'rgba(180,180,180,0.3)';
  const t = Date.now() / 1000;
  for (let i = 0; i < 3; i++) {
    const sx = gx + Math.sin(t * 1.5 + i * 2) * 5;
    const sy2 = gy - 55 - i * 12 - Math.sin(t + i) * 3;
    ctx.beginPath();
    ctx.arc(sx, sy2, 4 + i * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Grill shelf / side table
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(gx + 18, gy - 30, 20, 3);
  ctx.fillRect(gx + 35, gy - 30, 2, 30);
}

// ---- Garage interior (Alfa Romeo + VW Tiguan + charging station) ----
function renderGarageInterior(ctx: CanvasRenderingContext2D, _state: GameState): void {
  const gx = GARAGE.x;
  const gy = HOUSE.groundLevel;

  // Garage floor (concrete)
  ctx.fillStyle = '#A0A0A0';
  ctx.fillRect(gx, gy - 6, GARAGE.w, 8);

  // ---- ALFA ROMEO JUNIOR VELOCE (black, electric, left side) ----
  const ax = GARAGE.alfaX;
  const ay = gy;

  ctx.save();
  ctx.translate(ax, ay);

  // Car body (sleek, low)
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.roundRect(-28, -22, 56, 18, 3);
  ctx.fill();

  // Roof (curved)
  ctx.beginPath();
  ctx.roundRect(-16, -32, 32, 12, [6, 6, 0, 0]);
  ctx.fill();

  // Windows
  ctx.fillStyle = '#37474F';
  ctx.fillRect(-14, -30, 28, 8);

  // Wheels
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(-18, -2, 6, 0, Math.PI * 2);
  ctx.arc(18, -2, 6, 0, Math.PI * 2);
  ctx.fill();
  // Rims
  ctx.fillStyle = '#666';
  ctx.beginPath();
  ctx.arc(-18, -2, 3, 0, Math.PI * 2);
  ctx.arc(18, -2, 3, 0, Math.PI * 2);
  ctx.fill();

  // Headlights (LED style)
  ctx.fillStyle = '#B3E5FC';
  ctx.fillRect(26, -18, 3, 4);

  // Alfa badge (red triangle hint)
  ctx.fillStyle = '#C62828';
  ctx.beginPath();
  ctx.moveTo(-28, -16);
  ctx.lineTo(-26, -20);
  ctx.lineTo(-24, -16);
  ctx.closePath();
  ctx.fill();

  // EV indicator (green dot)
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.arc(-28, -12, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // ---- VW TIGUAN ALLSPACE (gray SUV, right side) ----
  const vx = GARAGE.tiguanX;

  ctx.save();
  ctx.translate(vx, ay);

  // SUV body (taller, wider)
  ctx.fillStyle = '#9E9E9E';
  ctx.beginPath();
  ctx.roundRect(-30, -26, 60, 22, 3);
  ctx.fill();

  // Roof (boxy SUV shape)
  ctx.beginPath();
  ctx.roundRect(-20, -38, 40, 14, [4, 4, 0, 0]);
  ctx.fill();

  // Windows
  ctx.fillStyle = '#B3E5FC';
  ctx.fillRect(-18, -36, 36, 10);

  // Window divider
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-2, -36);
  ctx.lineTo(-2, -26);
  ctx.stroke();

  // Wheels (bigger for SUV)
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(-20, -2, 7, 0, Math.PI * 2);
  ctx.arc(20, -2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#777';
  ctx.beginPath();
  ctx.arc(-20, -2, 3.5, 0, Math.PI * 2);
  ctx.arc(20, -2, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // VW badge
  ctx.strokeStyle = '#42A5F5';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-30, -18, 4, 0, Math.PI * 2);
  ctx.stroke();

  // Headlights
  ctx.fillStyle = '#FFF9C4';
  ctx.fillRect(28, -22, 3, 6);

  ctx.restore();

  // ---- CHARGING STATION ----
  const cx = GARAGE.chargerX;
  const cy = GARAGE.chargerY;

  // Station post
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(cx, cy, 12, gy - cy);

  // Station head
  ctx.fillStyle = '#388E3C';
  ctx.fillRect(cx - 2, cy, 16, 20);

  // Screen
  ctx.fillStyle = '#E8F5E9';
  ctx.fillRect(cx + 1, cy + 3, 10, 8);

  // Cable (going to Alfa)
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + 6, cy + 14);
  ctx.quadraticCurveTo(cx + 30, cy + 30, ax - 25, ay - 12);
  ctx.stroke();

  // Plug indicator (green = charging)
  ctx.fillStyle = '#76FF03';
  ctx.beginPath();
  ctx.arc(cx + 6, cy + 16, 2, 0, Math.PI * 2);
  ctx.fill();

  // "EV" text
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 5px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EV', cx + 6, cy + 9);
}

// ---- Garbage Bins (3 colors: mixed, plastic, paper) ----
function renderGarbageBins(ctx: CanvasRenderingContext2D, _state: GameState): void {
  const bx = BINS.x;
  const by = HOUSE.groundLevel;
  const s = BINS.spacing;

  const bins = [
    { color: BINS.colors.mixed, label: '🗑️', text: 'MIX' },
    { color: BINS.colors.plastic, label: '♻️', text: 'PLAST' },
    { color: BINS.colors.paper, label: '📄', text: 'PAP' },
  ];

  bins.forEach((bin, i) => {
    const x = bx + i * s;

    // Bin body
    ctx.fillStyle = bin.color;
    ctx.beginPath();
    ctx.roundRect(x, by - 30, 16, 30, [2, 2, 0, 0]);
    ctx.fill();

    // Lid
    ctx.fillStyle = bin.color === '#333333' ? '#444' : bin.color;
    ctx.fillRect(x - 1, by - 32, 18, 4);

    // Handle
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 4, by - 32);
    ctx.lineTo(x + 4, by - 36);
    ctx.lineTo(x + 12, by - 36);
    ctx.lineTo(x + 12, by - 32);
    ctx.stroke();

    // Label text
    ctx.fillStyle = bin.color === '#FDD835' ? '#333' : '#FFF';
    ctx.font = 'bold 4px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(bin.text, x + 8, by - 12);
  });
}

// ---- Garden (EXPANDED: sandbox, playhouse, hamak) ----
function renderGarden(ctx: CanvasRenderingContext2D, state: GameState): void {
  const gy = GARDEN.groundY;

  // Ground — garden area (green)
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(0, gy, 1550, 200);
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(0, gy + 20, 1550, 180);

  // Grass tufts (more lush)
  ctx.fillStyle = '#66BB6A';
  for (let x = GARDEN.startX; x < GARDEN.endX; x += 20) {
    const h = 3 + Math.sin(x * 0.1 + state.time) * 2;
    ctx.fillRect(x, gy - h, 8, h + 2);
  }

  // Fence
  ctx.fillStyle = '#8D6E63';
  for (let x = GARDEN.startX + 20; x < GARDEN.endX; x += 50) {
    ctx.fillRect(x, gy - 60, 6, 62);
    // Picket top
    ctx.beginPath();
    ctx.moveTo(x, gy - 60);
    ctx.lineTo(x + 3, gy - 68);
    ctx.lineTo(x + 6, gy - 60);
    ctx.fill();
  }
  ctx.fillRect(GARDEN.startX + 10, gy - 50, GARDEN.endX - GARDEN.startX - 20, 4);
  ctx.fillRect(GARDEN.startX + 10, gy - 30, GARDEN.endX - GARDEN.startX - 20, 4);

  // Apple tree (animated swaying)
  const tx = GARDEN.treeX;
  const treeSway = Math.sin(state.time * 1.2) * 3;
  ctx.save();
  ctx.translate(tx, gy);
  // Trunk
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(-12, -130, 24, 130);
  ctx.fillRect(-35, -110, 25, 6);
  ctx.fillRect(10, -120, 30, 6);
  // Canopy with sway
  ctx.translate(treeSway, 0);
  ctx.fillStyle = '#2E7D32';
  ctx.beginPath(); ctx.arc(0, -160, 55, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#388E3C';
  ctx.beginPath(); ctx.arc(-30, -140, 40, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(30, -140, 40, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#43A047';
  ctx.beginPath(); ctx.arc(0, -180, 35, 0, Math.PI * 2); ctx.fill();
  // Apples on tree (sway with canopy)
  ctx.fillStyle = '#E53935';
  ctx.beginPath(); ctx.arc(-20, -145, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(15, -155, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5, -170, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // === SANDBOX (piaskownica) ===
  const sbx = GARDEN.sandboxX;
  ctx.fillStyle = '#F5D58E'; // sand
  ctx.fillRect(sbx - 30, gy - 10, 60, 12);
  ctx.fillStyle = '#8D6E63'; // wooden frame
  ctx.fillRect(sbx - 35, gy - 12, 70, 4);
  ctx.fillRect(sbx - 35, gy, 70, 4);
  ctx.fillRect(sbx - 35, gy - 12, 4, 16);
  ctx.fillRect(sbx + 31, gy - 12, 4, 16);
  // Sand toys
  ctx.fillStyle = '#E53935';
  ctx.fillRect(sbx - 10, gy - 8, 8, 6); // bucket
  ctx.fillStyle = '#FDD835';
  ctx.fillRect(sbx + 8, gy - 7, 10, 4); // shovel

  // === PLAYHOUSE (domek drewniany) ===
  const phx = GARDEN.playhouseX;
  // Walls
  ctx.fillStyle = '#A1887F';
  ctx.fillRect(phx - 30, gy - 60, 60, 60);
  // Roof
  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.moveTo(phx - 35, gy - 60);
  ctx.lineTo(phx, gy - 85);
  ctx.lineTo(phx + 35, gy - 60);
  ctx.closePath();
  ctx.fill();
  // Door
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(phx - 10, gy - 40, 20, 40);
  ctx.fillStyle = '#FFD700';
  ctx.beginPath(); ctx.arc(phx + 5, gy - 20, 2, 0, Math.PI * 2); ctx.fill();
  // Window
  ctx.fillStyle = '#90CAF9';
  ctx.fillRect(phx + 14, gy - 50, 12, 10);
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 1;
  ctx.strokeRect(phx + 14, gy - 50, 12, 10);

  // === HAMAK ===
  const hmx = GARDEN.hamakX;
  // Poles
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(hmx - 30, gy - 60, 4, 60);
  ctx.fillRect(hmx + 26, gy - 60, 4, 60);
  // Rope/hamak
  ctx.strokeStyle = '#FFB74D';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(hmx - 28, gy - 55);
  ctx.quadraticCurveTo(hmx, gy - 30, hmx + 28, gy - 55);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Flowers (animated — gentle swaying and bouncing)
  const flowerColors = ['#E91E63', '#FF9800', '#FFEB3B', '#9C27B0', '#4FC3F7', '#FF5722'];
  for (let i = 0; i < 12; i++) {
    const fx = GARDEN.startX + 40 + i * 40;
    if (fx > GARDEN.endX - 30) break;
    const flowerSway = Math.sin(state.time * 2 + i * 0.7) * 2;
    const flowerBounce = Math.abs(Math.sin(state.time * 1.5 + i * 0.5)) * 2;
    // Stem (swaying)
    ctx.fillStyle = '#4CAF50';
    ctx.save();
    ctx.translate(fx + 1, gy);
    ctx.rotate(flowerSway * 0.03);
    ctx.fillRect(-1, -18 - flowerBounce, 2, 18 + flowerBounce);
    // Flower head
    ctx.fillStyle = flowerColors[i % flowerColors.length];
    ctx.beginPath();
    ctx.arc(0, -20 - flowerBounce, 5, 0, Math.PI * 2);
    ctx.fill();
    // Petals
    if (i % 3 === 0) {
      ctx.fillStyle = flowerColors[(i + 2) % flowerColors.length];
      for (let p = 0; p < 5; p++) {
        const pa = (Math.PI * 2 * p) / 5 + state.time * 0.3;
        ctx.beginPath();
        ctx.arc(Math.cos(pa) * 4, -20 - flowerBounce + Math.sin(pa) * 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Left side taras
  ctx.fillStyle = '#A1887F';
  ctx.fillRect(0, gy, 80, 10);
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(0, gy - 40, 4, 42);
  ctx.fillRect(30, gy - 40, 4, 42);
  ctx.fillRect(60, gy - 40, 4, 42);
  ctx.fillRect(0, gy - 40, 64, 4);

  // Butterflies (animated)
  if (state.weather === 'sunny' || state.weather === 'leaves') {
    for (let b = 0; b < 3; b++) {
      const bx = GARDEN.startX + 100 + b * 150 + Math.sin(state.time * 1.5 + b * 2) * 30;
      const by = gy - 80 - b * 20 + Math.sin(state.time * 2 + b) * 15;
      const wingOpen = Math.sin(state.time * 8 + b * 3) * 0.5 + 0.5;
      ctx.fillStyle = ['#E91E63', '#FF9800', '#7C4DFF'][b];
      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(wingOpen, 1);
      ctx.beginPath(); ctx.ellipse(-4, 0, 5, 3, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(wingOpen, 1);
      ctx.beginPath(); ctx.ellipse(4, 0, 5, 3, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#333';
      ctx.fillRect(bx - 0.5, by - 1, 1, 3);
    }
  }
}

// ---- Construction Site (fence, building, crane) ----
function renderConstructionSite(ctx: CanvasRenderingContext2D, state: GameState): void {
  const gy = GARDEN.groundY;

  // === GROUND — sandy/concrete area ===
  ctx.fillStyle = '#C4A882'; // sand
  ctx.fillRect(1550, gy, 1700, 200);
  ctx.fillStyle = '#A08060'; // darker sand below
  ctx.fillRect(1550, gy + 15, 1700, 185);
  // Gravel texture
  ctx.fillStyle = '#B09070';
  for (let i = 0; i < 40; i++) {
    const gx = 1560 + (i * 37 + i * i * 7) % 1600;
    const gy2 = gy + 2 + (i * 13) % 12;
    ctx.fillRect(gx, gy2, 3 + (i % 3), 2);
  }

  // === CONSTRUCTION FENCE (metal mesh) ===
  const fenceY = gy - 126;
  // Left segment (x: 1500-1508)
  renderFenceSegment(ctx, 1420, fenceY, 88, 126, state);
  // Right segment (x: 1588-1670)
  renderFenceSegment(ctx, 1588, fenceY, 82, 126, state);
  // Gap sign (wider gap 80px)
  ctx.fillStyle = '#FDD835';
  ctx.fillRect(1508, fenceY + 40, 80, 20);
  ctx.fillStyle = '#333';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WEJŚCIE', 1548, fenceY + 54);
  ctx.textAlign = 'left';

  // === BUILDING UNDER CONSTRUCTION (x: 1800-2200) ===
  const bx = 1800;
  const bw = 400;

  // Concrete pillars
  ctx.fillStyle = '#9E9E9E';
  for (let col = 0; col < 5; col++) {
    const px = bx + col * 100;
    ctx.fillRect(px, gy - 300, 20, 300);
  }

  // Floor beams (horizontal)
  ctx.fillStyle = '#888';
  ctx.fillRect(bx, gy - 100, bw, 8);   // floor 1
  ctx.fillRect(bx + 20, gy - 200, bw - 40, 8); // floor 2
  ctx.fillRect(bx + 40, gy - 300, bw - 80, 8); // floor 3

  // Rebar (steel reinforcement)
  ctx.strokeStyle = '#795548';
  ctx.lineWidth = 1;
  for (let col = 0; col < 5; col++) {
    const rx = bx + col * 100 + 10;
    for (let row = 0; row < 3; row++) {
      const ry = gy - 300 + row * 100;
      ctx.beginPath();
      ctx.moveTo(rx - 5, ry);
      ctx.lineTo(rx - 5, ry + 95);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rx + 15, ry);
      ctx.lineTo(rx + 15, ry + 95);
      ctx.stroke();
    }
  }

  // Scaffolding (wooden planks)
  ctx.fillStyle = '#A1887F';
  ctx.fillRect(bx - 10, gy - 104, bw + 20, 6);  // scaffold plank 1
  ctx.fillRect(bx + 10, gy - 204, bw - 20, 6);  // scaffold plank 2
  ctx.fillRect(bx + 30, gy - 304, bw - 60, 6);  // scaffold plank 3

  // Scaffolding poles
  ctx.fillStyle = '#5D4037';
  for (let i = 0; i < 3; i++) {
    const sx = bx - 10 + i * (bw / 2 + 10);
    ctx.fillRect(sx, gy - 310, 4, 312);
  }
  // Cross braces
  ctx.strokeStyle = '#6D4C41';
  ctx.lineWidth = 2;
  for (let i = 0; i < 2; i++) {
    const sx1 = bx - 8 + i * (bw / 2 + 10);
    const sx2 = bx - 8 + (i + 1) * (bw / 2 + 10);
    ctx.beginPath();
    ctx.moveTo(sx1, gy);
    ctx.lineTo(sx2, gy - 150);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx2, gy);
    ctx.lineTo(sx1, gy - 150);
    ctx.stroke();
  }

  // Brick pallets
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(1680, gy - 20, 50, 8); // pallet base
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      ctx.fillStyle = row % 2 === 0 ? '#C75B39' : '#B5462A';
      ctx.fillRect(1682 + col * 9, gy - 30 - row * 8, 8, 7);
    }
  }

  // Cement mixer (spinning drum)
  const cmx = 2250;
  ctx.save();
  ctx.translate(cmx, gy - 30);
  ctx.rotate(-0.3);
  // Drum body
  ctx.fillStyle = '#F9A825';
  ctx.beginPath();
  ctx.ellipse(0, 0, 25, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  // Spinning stripes on drum
  ctx.strokeStyle = '#E08A00';
  ctx.lineWidth = 2;
  for (let s = 0; s < 3; s++) {
    const sa = state.time * 2 + (s * Math.PI * 2) / 3;
    const sx = Math.cos(sa) * 18;
    const sy = Math.sin(sa) * 12;
    ctx.beginPath();
    ctx.moveTo(sx * 0.3, sy * 0.3);
    ctx.lineTo(sx, sy);
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = '#333';
  ctx.fillRect(cmx + 18, gy - 20, 15, 6); // spout
  // Wheels
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(cmx - 15, gy - 5, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cmx + 10, gy - 5, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#666';
  ctx.beginPath(); ctx.arc(cmx - 15, gy - 5, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cmx + 10, gy - 5, 4, 0, Math.PI * 2); ctx.fill();

  // Warning tape (żółto-czarna)
  for (let tx = 1600; tx < 1780; tx += 20) {
    ctx.fillStyle = (Math.floor(tx / 20) % 2 === 0) ? '#FDD835' : '#333';
    ctx.fillRect(tx, gy - 45, 20, 6);
  }

  // Warning sign
  ctx.fillStyle = '#FDD835';
  ctx.fillRect(1620, gy - 90, 100, 40);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.strokeRect(1620, gy - 90, 100, 40);
  ctx.fillStyle = '#333';
  ctx.font = 'bold 7px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚠ BUDOWA', 1670, gy - 73);
  ctx.fillText('WSTĘP WZBRONIONY', 1670, gy - 62);
  ctx.textAlign = 'left';

  // Pipes / construction materials
  ctx.fillStyle = '#78909C';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(2280 + i * 12, gy - 8, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#607D8B';
    ctx.fillRect(2275 + i * 12, gy - 13, 10, 1);
    ctx.fillStyle = '#78909C';
  }

  // === TOWER CRANE (żuraw wieżowy) ===
  const cx = 2500; // crane center X
  const craneTop = 70;
  const craneColor = '#F9A825';
  const craneDark = '#E08A00';

  // Mast (vertical)
  ctx.fillStyle = craneColor;
  ctx.fillRect(cx - 12, craneTop, 24, gy - craneTop);
  // Mast lattice
  ctx.strokeStyle = craneDark;
  ctx.lineWidth = 1.5;
  for (let my = craneTop; my < gy; my += 30) {
    ctx.beginPath(); ctx.moveTo(cx - 12, my); ctx.lineTo(cx + 12, my + 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 12, my); ctx.lineTo(cx - 12, my + 30); ctx.stroke();
    // Horizontal bars
    ctx.beginPath(); ctx.moveTo(cx - 12, my); ctx.lineTo(cx + 12, my); ctx.stroke();
  }

  // Jib (horizontal arm — right)
  ctx.fillStyle = craneColor;
  ctx.fillRect(cx - 100, craneTop - 4, 400, 8);
  // Jib lattice
  ctx.strokeStyle = craneDark;
  for (let jx = cx - 100; jx < cx + 300; jx += 25) {
    ctx.beginPath(); ctx.moveTo(jx, craneTop - 4); ctx.lineTo(jx + 25, craneTop + 4); ctx.stroke();
  }

  // Counter-jib (left arm — shorter)
  ctx.fillStyle = craneColor;
  ctx.fillRect(cx - 200, craneTop - 4, 100, 8);

  // Counterweight (balasty)
  ctx.fillStyle = '#666';
  ctx.fillRect(cx - 200, craneTop + 4, 40, 25);
  ctx.fillRect(cx - 155, craneTop + 4, 40, 25);
  ctx.fillStyle = '#555';
  ctx.fillRect(cx - 200, craneTop + 14, 40, 2);
  ctx.fillRect(cx - 155, craneTop + 14, 40, 2);

  // Top tower (A-frame)
  ctx.strokeStyle = craneColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 12, craneTop);
  ctx.lineTo(cx, craneTop - 30);
  ctx.lineTo(cx + 12, craneTop);
  ctx.stroke();
  // Cables from top to jib end
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, craneTop - 30);
  ctx.lineTo(cx + 290, craneTop - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, craneTop - 30);
  ctx.lineTo(cx - 190, craneTop - 4);
  ctx.stroke();

  // Operator cabin
  ctx.fillStyle = '#81D4FA';
  ctx.fillRect(cx - 18, craneTop + 8, 36, 28);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - 18, craneTop + 8, 36, 28);
  // Window
  ctx.fillStyle = 'rgba(135,206,235,0.6)';
  ctx.fillRect(cx - 14, craneTop + 12, 28, 14);
  ctx.strokeRect(cx - 14, craneTop + 12, 28, 14);
  ctx.beginPath();
  ctx.moveTo(cx, craneTop + 12);
  ctx.lineTo(cx, craneTop + 26);
  ctx.stroke();

  // Hanging hook (pendulum swing from jib)
  const hookAnchorX = cx + 180;
  const hookRopeLen = 100 + Math.sin(state.time * 0.3) * 15;
  const pendulumAngle = Math.sin(state.time * 0.8) * 0.15; // gentle swing
  const hookX = hookAnchorX + Math.sin(pendulumAngle) * hookRopeLen;
  const hookY = craneTop + 4 + Math.cos(pendulumAngle) * hookRopeLen;
  // Cable
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(hookAnchorX, craneTop + 4);
  ctx.lineTo(hookX, hookY);
  ctx.stroke();
  // Hook block
  ctx.fillStyle = '#FF5722';
  ctx.beginPath();
  ctx.arc(hookX, hookY + 5, 5, 0, Math.PI * 2);
  ctx.fill();
  // Hook curve
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(hookX, hookY + 10, 6, 0, Math.PI);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Base (concrete foundation)
  ctx.fillStyle = '#888';
  ctx.fillRect(cx - 40, gy - 15, 80, 15);
  ctx.fillStyle = '#999';
  ctx.fillRect(cx - 50, gy - 5, 100, 8);

  // Climbing ladder indicators (rungs on mast)
  ctx.fillStyle = '#E0E0E0';
  for (let ly = gy - 30; ly > craneTop + 40; ly -= 66) {
    ctx.fillRect(cx - 10, ly, 20, 3);
  }
}

// Helper: draw chain-link fence segment
function renderFenceSegment(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, _state: GameState): void {
  // Posts
  ctx.fillStyle = '#78909C';
  ctx.fillRect(x, y, 4, h);
  ctx.fillRect(x + w - 4, y, 4, h);
  // Horizontal bars
  ctx.fillRect(x, y, w, 3);
  ctx.fillRect(x, y + h - 3, w, 3);
  ctx.fillRect(x, y + h / 2, w, 2);
  // Mesh pattern
  ctx.strokeStyle = 'rgba(120,144,156,0.5)';
  ctx.lineWidth = 0.5;
  for (let mx = x + 6; mx < x + w - 4; mx += 8) {
    ctx.beginPath();
    ctx.moveTo(mx, y + 3);
    ctx.lineTo(mx + 8, y + h / 2);
    ctx.lineTo(mx, y + h - 3);
    ctx.stroke();
  }
  // Post caps
  ctx.fillStyle = '#90A4AE';
  ctx.beginPath(); ctx.arc(x + 2, y, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + w - 2, y, 4, 0, Math.PI * 2); ctx.fill();
}

// ---- House exterior ----
function renderHouseExterior(ctx: CanvasRenderingContext2D, _state: GameState): void {
  const { leftWall, rightWall, groundLevel, ceilingF2, roofPeak } = HOUSE;
  const houseW = rightWall - leftWall;

  ctx.fillStyle = '#9E9E9E';
  ctx.fillRect(leftWall, groundLevel - 4, houseW, 8);
  ctx.fillStyle = '#D7CEC7';
  ctx.fillRect(leftWall - 8, ceilingF2, 8, groundLevel - ceilingF2);
  // Right wall with door gap (passage to garden)
  const doorGapTop = 420; // matches wall collision gap
  ctx.fillStyle = '#D7CEC7';
  ctx.fillRect(rightWall, ceilingF2, 8, doorGapTop - ceilingF2); // wall above door
  // Door frame
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(rightWall - 2, doorGapTop - 6, 12, 6); // lintel (nadproże)
  ctx.fillRect(rightWall - 1, doorGapTop, 3, groundLevel - doorGapTop); // left frame
  ctx.fillRect(rightWall + 7, doorGapTop, 3, groundLevel - doorGapTop); // right frame
  // Door opening (bright outside light)
  ctx.fillStyle = 'rgba(135,206,235,0.4)';
  ctx.fillRect(rightWall + 1, doorGapTop, 6, groundLevel - doorGapTop);
  // Arrow hint
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('→', rightWall + 4, doorGapTop + (groundLevel - doorGapTop) / 2 + 6);
  ctx.textAlign = 'left';

  // Red brick accent (from real house)
  ctx.fillStyle = '#C4A882';
  for (let row = 0; row < 3; row++) {
    const by = groundLevel - 10 - row * 8;
    ctx.fillRect(leftWall - 8, by, 8, 6);
    // Only above door on right side
    if (by < doorGapTop) ctx.fillRect(rightWall, by, 8, 6);
  }

  // Roof
  const roofLeft = leftWall - 15;
  const roofRight = rightWall + 15;
  const midX = (leftWall + rightWall) / 2;

  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.moveTo(roofLeft, ceilingF2);
  ctx.lineTo(midX, roofPeak);
  ctx.lineTo(roofRight, ceilingF2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#4E342E';
  ctx.lineWidth = 1;
  for (let row = 0; row < 4; row++) {
    const t = row / 4;
    const y = ceilingF2 + (roofPeak - ceilingF2) * t;
    const lx = roofLeft + (midX - roofLeft) * t;
    const rx = roofRight + (midX - roofRight) * t;
    ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(rx, y); ctx.stroke();
  }

  // Chimney
  ctx.fillStyle = '#795548';
  ctx.fillRect(midX - 60, roofPeak - 30, 25, 40);
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(midX - 63, roofPeak - 34, 31, 6);

  ctx.strokeStyle = '#4E342E';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(roofLeft, ceilingF2);
  ctx.lineTo(midX, roofPeak);
  ctx.lineTo(roofRight, ceilingF2);
  ctx.stroke();
  ctx.lineWidth = 1;
}

// ---- Room interiors ----
function renderRooms(ctx: CanvasRenderingContext2D, state: GameState): void {
  // Cached wallpaper patterns
  if (!_wallpaperCache) {
    _wallpaperCache = new Map();
  }

  for (const room of state.rooms) {
    // Room background with subtle wallpaper pattern
    ctx.fillStyle = room.bgColor;
    ctx.fillRect(room.x, room.y, room.w, room.h);

    // Wallpaper pattern overlay
    const patKey = room.name;
    if (!_wallpaperCache!.has(patKey)) {
      const tile = document.createElement('canvas');
      const t = tile.getContext('2d')!;
      if (room.name === 'Pokój Kuby') {
        // Stars pattern for Kuba's room
        tile.width = 30; tile.height = 30;
        t.fillStyle = 'rgba(100,150,200,0.06)';
        t.beginPath(); t.arc(15, 15, 3, 0, Math.PI * 2); t.fill();
        t.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const a2 = a + Math.PI / 5;
          if (i === 0) t.moveTo(8 + Math.cos(a) * 4, 8 + Math.sin(a) * 4);
          t.lineTo(8 + Math.cos(a) * 4, 8 + Math.sin(a) * 4);
          t.lineTo(8 + Math.cos(a2) * 2, 8 + Math.sin(a2) * 2);
        }
        t.closePath(); t.fill();
      } else if (room.name === 'Sypialnia') {
        // Soft diamonds for bedroom
        tile.width = 20; tile.height = 20;
        t.fillStyle = 'rgba(160,120,160,0.06)';
        t.beginPath();
        t.moveTo(10, 2); t.lineTo(18, 10); t.lineTo(10, 18); t.lineTo(2, 10);
        t.closePath(); t.fill();
      } else if (room.name === 'Łazienka') {
        // Tile grid for bathroom
        tile.width = 16; tile.height = 16;
        t.strokeStyle = 'rgba(150,200,200,0.1)';
        t.lineWidth = 0.5;
        t.strokeRect(0, 0, 16, 16);
      } else if (room.name === 'Kuchnia') {
        // Subtle checkerboard
        tile.width = 16; tile.height = 16;
        t.fillStyle = 'rgba(200,180,150,0.05)';
        t.fillRect(0, 0, 8, 8);
        t.fillRect(8, 8, 8, 8);
      } else {
        // Default: subtle vertical stripes
        tile.width = 20; tile.height = 20;
        t.fillStyle = 'rgba(180,160,130,0.04)';
        t.fillRect(0, 0, 10, 20);
      }
      const pat = ctx.createPattern(tile, 'repeat');
      if (pat) _wallpaperCache!.set(patKey, pat);
    }
    const wallpaper = _wallpaperCache!.get(patKey);
    if (wallpaper) {
      ctx.fillStyle = wallpaper;
      ctx.fillRect(room.x, room.y, room.w, room.h);
    }

    // Inner shadows for depth
    const shTop = ctx.createLinearGradient(room.x, room.y + 6, room.x, room.y + 20);
    shTop.addColorStop(0, 'rgba(0,0,0,0.08)');
    shTop.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shTop;
    ctx.fillRect(room.x, room.y + 6, room.w, 14);
    const shLeft = ctx.createLinearGradient(room.x, room.y, room.x + 8, room.y);
    shLeft.addColorStop(0, 'rgba(0,0,0,0.05)');
    shLeft.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shLeft;
    ctx.fillRect(room.x, room.y, 8, room.h);

    ctx.fillStyle = room.floorColor;
    ctx.fillRect(room.x, room.y + room.h - 8, room.w, 8);

    if (room.floorColor === '#C8AD8A') {
      ctx.strokeStyle = '#B89B74';
      ctx.lineWidth = 0.5;
      for (let x = room.x; x < room.x + room.w; x += 12) {
        const row = Math.floor((x - room.x) / 12);
        const fy = room.y + room.h - 8;
        ctx.beginPath();
        if (row % 2 === 0) { ctx.moveTo(x, fy); ctx.lineTo(x + 6, fy + 8); }
        else { ctx.moveTo(x + 6, fy); ctx.lineTo(x, fy + 8); }
        ctx.stroke();
      }
    }

    ctx.fillStyle = '#E0D8D0';
    ctx.fillRect(room.x, room.y, room.w, 4);
    ctx.fillStyle = '#D0C8C0';
    ctx.fillRect(room.x, room.y + 4, room.w, 2);

    ctx.strokeStyle = '#D8D0C8';
    ctx.lineWidth = 1;
    const panelInset = 15;
    const panelH = room.h * 0.5;
    ctx.strokeRect(room.x + panelInset, room.y + room.h - panelH - 10, room.w - panelInset * 2, panelH);

    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillText(room.icon, room.x + room.w / 2, room.y + room.h / 2);
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillText(room.name, room.x + room.w / 2, room.y + 16);
    ctx.textAlign = 'left';
  }

  for (const wall of state.walls) {
    if (wall.w <= 10) {
      ctx.fillStyle = '#C8BEB4';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.fillStyle = '#D8D0C8';
      ctx.fillRect(wall.x, wall.y, 1, wall.h);
      ctx.fillStyle = '#B8B0A4';
      ctx.fillRect(wall.x + wall.w - 1, wall.y, 1, wall.h);
    }
  }
}

// ---- Visual detail helpers (lamps, curtains, shadows) ----
function drawCeilingLamp(ctx: CanvasRenderingContext2D, x: number, ceilingY: number, isOn: boolean): void {
  // Cable
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, ceilingY);
  ctx.lineTo(x, ceilingY + 14);
  ctx.stroke();
  // Lampshade
  ctx.fillStyle = isOn ? '#FFF8E1' : '#E0D8D0';
  ctx.beginPath();
  ctx.moveTo(x - 10, ceilingY + 14);
  ctx.quadraticCurveTo(x - 12, ceilingY + 26, x - 7, ceilingY + 26);
  ctx.lineTo(x + 7, ceilingY + 26);
  ctx.quadraticCurveTo(x + 12, ceilingY + 26, x + 10, ceilingY + 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#C8C0B0';
  ctx.lineWidth = 0.6;
  ctx.stroke();
  if (isOn) {
    const glow = ctx.createRadialGradient(x, ceilingY + 30, 0, x, ceilingY + 30, 45);
    glow.addColorStop(0, 'rgba(255,248,220,0.15)');
    glow.addColorStop(0.6, 'rgba(255,240,200,0.04)');
    glow.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(x, ceilingY + 40, 45, 30, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.lineWidth = 1;
}

function drawCurtains(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, time: number): void {
  const sway = Math.sin(time * 0.4) * 1.5;
  // Curtain rod
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(x - 4, y - 3, w + 8, 3);
  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.arc(x - 2, y - 1.5, 2.5, 0, Math.PI * 2);
  ctx.arc(x + w + 2, y - 1.5, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Left curtain
  const cw = w * 0.28;
  for (let i = 0; i < 3; i++) {
    const cx = x + (cw / 3) * i;
    const cWidth = cw / 3 + 1;
    const depth = Math.sin((i / 3) * Math.PI) * 0.15;
    const g = ctx.createLinearGradient(cx, y, cx + cWidth, y);
    g.addColorStop(0, `rgba(${hexToRgb(color)},${0.5 - depth})`);
    g.addColorStop(0.5, `rgba(${hexToRgb(color)},0.7)`);
    g.addColorStop(1, `rgba(${hexToRgb(color)},${0.5 - depth})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.quadraticCurveTo(cx + cWidth / 2 + sway, y + h * 0.4, cx + sway * 0.3, y + h);
    ctx.lineTo(cx + cWidth + sway * 0.3, y + h);
    ctx.quadraticCurveTo(cx + cWidth / 2 + sway, y + h * 0.4, cx + cWidth, y);
    ctx.closePath();
    ctx.fill();
  }
  // Right curtain (mirrored)
  for (let i = 0; i < 3; i++) {
    const cx = x + w - cw + (cw / 3) * i;
    const cWidth = cw / 3 + 1;
    const depth = Math.sin((i / 3) * Math.PI) * 0.15;
    const g = ctx.createLinearGradient(cx, y, cx + cWidth, y);
    g.addColorStop(0, `rgba(${hexToRgb(color)},${0.5 - depth})`);
    g.addColorStop(0.5, `rgba(${hexToRgb(color)},0.7)`);
    g.addColorStop(1, `rgba(${hexToRgb(color)},${0.5 - depth})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.quadraticCurveTo(cx + cWidth / 2 - sway, y + h * 0.4, cx - sway * 0.3, y + h);
    ctx.lineTo(cx + cWidth - sway * 0.3, y + h);
    ctx.quadraticCurveTo(cx + cWidth / 2 - sway, y + h * 0.4, cx + cWidth, y);
    ctx.closePath();
    ctx.fill();
  }
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function drawFurnitureShadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number): void {
  const sg = ctx.createRadialGradient(x + w / 2, y, 0, x + w / 2, y, w * 0.6);
  sg.addColorStop(0, 'rgba(0,0,0,0.1)');
  sg.addColorStop(0.7, 'rgba(0,0,0,0.03)');
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + 1, w * 0.55, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawDoorHandle(ctx: CanvasRenderingContext2D, x: number, y: number, side: number): void {
  const hg = ctx.createRadialGradient(x, y, 0, x, y, 4);
  hg.addColorStop(0, '#E8D8A0');
  hg.addColorStop(0.5, '#C8A850');
  hg.addColorStop(1, '#A08830');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#C8A850';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + side * 6, y, x + side * 8, y + 2);
  ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.lineWidth = 1;
}

// ---- Furniture (same as before - abbreviated for space) ----
function renderFurniture(ctx: CanvasRenderingContext2D, _state: GameState): void {
  // === KUCHNIA ===
  const kx = HOUSE.kuchnia.x;
  const ky = HOUSE.floor1Y;

  ctx.fillStyle = '#EEEAE5';
  ctx.fillRect(kx + 10, ky - 45, 120, 40);
  ctx.strokeStyle = '#D8D2CC'; ctx.lineWidth = 1;
  ctx.strokeRect(kx + 12, ky - 43, 38, 36);
  ctx.strokeRect(kx + 52, ky - 43, 38, 36);
  ctx.strokeRect(kx + 92, ky - 43, 38, 36);
  ctx.fillStyle = '#C8A84E';
  ctx.fillRect(kx + 30, ky - 28, 6, 2);
  ctx.fillRect(kx + 70, ky - 28, 6, 2);
  ctx.fillRect(kx + 110, ky - 28, 6, 2);
  ctx.fillStyle = '#E0DCD6';
  ctx.fillRect(kx + 8, ky - 48, 126, 4);
  ctx.fillStyle = '#EEEAE5';
  ctx.fillRect(kx + 20, ky - 140, 100, 50);
  ctx.strokeStyle = '#D8D2CC';
  ctx.strokeRect(kx + 22, ky - 138, 46, 46);
  ctx.strokeRect(kx + 72, ky - 138, 46, 46);
  ctx.fillStyle = '#333';
  ctx.fillRect(kx + 150, ky - 48, 50, 4);
  ctx.strokeStyle = '#555';
  ctx.beginPath(); ctx.arc(kx + 165, ky - 46, 8, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(kx + 185, ky - 46, 8, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#88CCE8';
  ctx.fillRect(kx + 140, ky - 160, 80, 60);
  ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
  ctx.strokeRect(kx + 140, ky - 160, 80, 60);
  ctx.beginPath(); ctx.moveTo(kx + 180, ky - 160); ctx.lineTo(kx + 180, ky - 100); ctx.stroke();
  ctx.lineWidth = 1;
  ctx.fillStyle = '#EEEAE5';
  ctx.fillRect(kx + 230, ky - 130, 35, 125);
  ctx.strokeStyle = '#D8D2CC';
  ctx.strokeRect(kx + 232, ky - 128, 31, 60);
  ctx.strokeRect(kx + 232, ky - 65, 31, 58);

  // === SALON ===
  const sx = HOUSE.salon.x;
  const sy = HOUSE.floor1Y;

  // Fireplace
  const fx = sx + 10;
  ctx.fillStyle = '#D0C8C0';
  ctx.fillRect(fx, sy - 130, 50, 130);
  ctx.fillStyle = '#C8BEB4';
  ctx.fillRect(fx - 5, sy - 135, 60, 8);
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath(); ctx.arc(fx + 25, sy - 30, 18, Math.PI, 0);
  ctx.fillRect(fx + 7, sy - 30, 36, 25); ctx.fill();
  ctx.fillStyle = '#FF6B35';
  ctx.beginPath(); ctx.arc(fx + 25, sy - 15, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFD54F';
  ctx.beginPath(); ctx.arc(fx + 25, sy - 18, 4, 0, Math.PI * 2); ctx.fill();

  // Sofa
  ctx.fillStyle = '#E0D8D0';
  ctx.fillRect(sx + 80, sy - 50, 120, 40);
  ctx.fillStyle = '#D8CFC4';
  ctx.fillRect(sx + 80, sy - 70, 120, 22);
  ctx.fillStyle = '#333';
  ctx.fillRect(sx + 90, sy - 60, 15, 12);
  ctx.fillStyle = '#333';
  ctx.fillRect(sx + 175, sy - 60, 15, 12);

  // Coffee tables
  ctx.fillStyle = '#2A2A2A';
  ctx.beginPath(); ctx.ellipse(sx + 150, sy - 18, 22, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(sx + 148, sy - 18, 4, 14);
  ctx.beginPath(); ctx.ellipse(sx + 180, sy - 15, 16, 6, 0, 0, Math.PI * 2); ctx.fill();

  // Armchair
  ctx.fillStyle = '#E0D8D0';
  ctx.fillRect(sx + 220, sy - 50, 40, 38);
  ctx.fillStyle = '#D8CFC4';
  ctx.fillRect(sx + 218, sy - 60, 44, 14);
  ctx.fillRect(sx + 215, sy - 55, 6, 30);
  ctx.fillRect(sx + 257, sy - 55, 6, 30);

  // Gallery wall
  for (let i = 0; i < 4; i++) {
    const gx = sx + 90 + i * 35;
    const gy = sy - 160 + (i % 2) * 15;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(gx, gy, 28, 22);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
    ctx.strokeRect(gx, gy, 28, 22);
    ctx.fillStyle = '#888';
    ctx.fillRect(gx + 4, gy + 3, 20, 16);
    ctx.lineWidth = 1;
  }

  // Projector
  ctx.fillStyle = '#EEE';
  ctx.fillRect(sx + 140, sy - 215, 30, 15);

  // Dining table
  ctx.fillStyle = '#2A2A2A';
  ctx.beginPath(); ctx.ellipse(sx + 270, sy - 25, 30, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(sx + 268, sy - 25, 4, 20);
  ctx.fillStyle = '#D0C8C0';
  for (const cp of [-30, -15, 15, 30]) {
    ctx.beginPath(); ctx.arc(sx + 270 + cp, sy - 20, 8, 0, Math.PI * 2); ctx.fill();
  }

  // Komoda
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(sx + 240, sy - 55, 60, 45);
  ctx.strokeStyle = '#6D5740';
  ctx.strokeRect(sx + 242, sy - 53, 28, 41);
  ctx.strokeRect(sx + 272, sy - 53, 26, 41);

  // Plants
  drawPlant(ctx, sx + 65, sy - 55, 0.8);
  drawPlant(ctx, sx + 205, sy - 55, 0.6);

  // === PRZEDPOKÓJ ===
  const px = HOUSE.przedpokoj.x;
  const py = HOUSE.floor1Y;

  ctx.fillStyle = '#F5F0EB';
  ctx.fillRect(px + 30, py - 50, 60, 30);
  ctx.strokeStyle = '#E0D8D0';
  for (let i = 0; i < 8; i++) {
    ctx.beginPath(); ctx.moveTo(px + 32 + i * 7, py - 48); ctx.lineTo(px + 32 + i * 7, py - 22); ctx.stroke();
  }
  ctx.fillStyle = '#2A2A2A';
  ctx.fillRect(px + 110, py - 80, 35, 75);
  ctx.fillRect(px + 112, py - 65, 31, 2);
  ctx.fillRect(px + 112, py - 40, 31, 2);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(px + 30, py - 150, 35, 45);
  ctx.fillRect(px + 75, py - 150, 35, 45);
  ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
  ctx.strokeRect(px + 30, py - 150, 35, 45);
  ctx.strokeRect(px + 75, py - 150, 35, 45);
  ctx.lineWidth = 1;

  // === POKÓJ KUBY ===
  const jx = HOUSE.pokojJurka.x;
  const jy = HOUSE.floor2Y;

  ctx.fillStyle = '#90CAF9';
  ctx.fillRect(jx + 20, jy - 35, 80, 30);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(jx + 20, jy - 40, 20, 10);
  ctx.fillStyle = '#B89B74';
  ctx.fillRect(jx + 18, jy - 8, 84, 5);
  ctx.fillStyle = '#B89B74';
  ctx.fillRect(jx + 130, jy - 90, 50, 85);
  ctx.fillStyle = '#A1887F';
  ctx.fillRect(jx + 132, jy - 88, 46, 2);
  ctx.fillRect(jx + 132, jy - 60, 46, 2);
  ctx.fillRect(jx + 132, jy - 30, 46, 2);
  // LEGO on shelf
  ctx.fillStyle = '#E53935'; ctx.fillRect(jx + 140, jy - 85, 8, 8);
  ctx.fillStyle = '#1565C0'; ctx.fillRect(jx + 152, jy - 85, 8, 8);
  ctx.fillStyle = '#FDD835'; ctx.fillRect(jx + 164, jy - 85, 8, 8);
  ctx.fillStyle = '#2196F3'; ctx.fillRect(jx + 155, jy - 55, 12, 8);
  ctx.fillStyle = '#FFD54F'; ctx.fillRect(jx + 145, jy - 27, 8, 8);

  ctx.fillStyle = '#FFD700'; ctx.font = '12px sans-serif';
  ctx.fillText('⭐', jx + 50, jy - 100);
  ctx.fillText('⭐', jx + 100, jy - 120);
  ctx.fillText('🌙', jx + 75, jy - 130);
  ctx.fillText('🚀', jx + 200, jy - 110); // rocket sticker

  ctx.fillStyle = '#88CCE8';
  ctx.fillRect(jx + 200, jy - 140, 70, 60);
  ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2;
  ctx.strokeRect(jx + 200, jy - 140, 70, 60);
  ctx.beginPath(); ctx.moveTo(jx + 235, jy - 140); ctx.lineTo(jx + 235, jy - 80); ctx.stroke();
  ctx.lineWidth = 1;

  // === SYPIALNIA ===
  const bx = HOUSE.sypialnia.x;
  const by = HOUSE.floor2Y;

  ctx.fillStyle = '#E0D8D0';
  ctx.fillRect(bx + 30, by - 40, 120, 35);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(bx + 35, by - 45, 25, 8);
  ctx.fillRect(bx + 120, by - 45, 25, 8);
  ctx.fillStyle = '#C8BEB4';
  ctx.fillRect(bx + 28, by - 80, 124, 40);
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(bx + 10, by - 30, 18, 25);
  ctx.fillRect(bx + 152, by - 30, 18, 25);
  ctx.fillStyle = '#333';
  ctx.fillRect(bx + 16, by - 50, 4, 22);
  ctx.fillStyle = '#2A2A2A';
  ctx.fillRect(bx + 10, by - 55, 16, 6);
  ctx.fillStyle = '#D0C8C0';
  ctx.fillRect(bx + 200, by - 130, 80, 125);
  ctx.strokeStyle = '#C0B8B0';
  ctx.strokeRect(bx + 202, by - 128, 38, 121);
  ctx.strokeRect(bx + 242, by - 128, 36, 121);
  ctx.fillStyle = '#88CCE8';
  ctx.fillRect(bx + 80, by - 160, 80, 60);
  ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2;
  ctx.strokeRect(bx + 80, by - 160, 80, 60); ctx.lineWidth = 1;

  // === HALL ===
  const hx = HOUSE.hall.x;
  const hy = HOUSE.floor2Y;
  ctx.fillStyle = '#B89B74';
  ctx.fillRect(hx + 20, hy - 30, 40, 25);
  drawPlant(ctx, hx + 130, hy - 8, 0.7);

  // === CEILING LAMPS ===
  drawCeilingLamp(ctx, kx + 130, ky - 210, true);  // Kitchen
  drawCeilingLamp(ctx, sx + 150, sy - 210, true);  // Salon
  drawCeilingLamp(ctx, px + 80, py - 210, true);   // Przedpokój
  drawCeilingLamp(ctx, jx + 150, jy - 210, true);  // Pokój Kuby
  drawCeilingLamp(ctx, hx + 90, hy - 210, true);   // Hall
  drawCeilingLamp(ctx, bx + 120, by - 210, true);  // Sypialnia

  // === CURTAINS on windows ===
  // Pokój Kuby window
  drawCurtains(ctx, jx + 198, jy - 142, 74, 62, '#5C6BC0', _state.time);
  // Sypialnia window
  drawCurtains(ctx, bx + 78, by - 162, 84, 62, '#AB47BC', _state.time);

  // === FURNITURE SHADOWS ===
  drawFurnitureShadow(ctx, sx + 80, sy - 10, 120);   // Sofa
  drawFurnitureShadow(ctx, sx + 220, sy - 12, 40);    // Armchair
  drawFurnitureShadow(ctx, bx + 30, by - 5, 120);     // Bed
  drawFurnitureShadow(ctx, jx + 20, jy - 5, 80);      // Kuba's bed
  drawFurnitureShadow(ctx, px + 110, py - 5, 35);      // Szafa

  // === DOOR HANDLES on internal doors ===
  // Przedpokój szafa
  drawDoorHandle(ctx, px + 142, py - 40, 1);
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
  ctx.fillStyle = '#D0C8C0';
  ctx.fillRect(x - 8 * scale, y - 15 * scale, 16 * scale, 15 * scale);
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath(); ctx.arc(x, y - 25 * scale, 12 * scale, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#66BB6A';
  ctx.beginPath(); ctx.arc(x - 5 * scale, y - 30 * scale, 8 * scale, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 6 * scale, y - 28 * scale, 7 * scale, 0, Math.PI * 2); ctx.fill();
}

// ---- Interactive Objects ----
function renderInteractiveObjects(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { player, interactiveObjects } = state;
  const px = player.x + player.w / 2;

  for (const obj of interactiveObjects) {
    const ox = obj.x + obj.w / 2;
    const distX = Math.abs(px - ox);
    const isNear = distX < 60;

    ctx.save();

    switch (obj.type) {
      case 'tv':
        drawInteractiveTV(ctx, obj, state.time);
        break;
      case 'fridge':
        drawInteractiveFridge(ctx, obj, state.time);
        break;
      case 'lamp':
        drawInteractiveLamp(ctx, obj, state.time);
        break;
      case 'tap':
        drawInteractiveTap(ctx, obj, state.time);
        break;
      case 'piano':
        drawInteractivePiano(ctx, obj, state.time);
        break;
      case 'bookshelf':
        drawInteractiveBookshelf(ctx, obj);
        break;
      case 'rc_controller':
        drawInteractiveRCController(ctx, obj, state.time);
        break;
    }

    // Interaction hint when player is near
    if (isNear && state.phase === 'playing') {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      const hintY = obj.y - 12;
      // Background pill
      const text = `E: ${obj.label}`;
      const tw = ctx.measureText(text).width;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath();
      ctx.roundRect(ox - tw / 2 - 6, hintY - 9, tw + 12, 16, 4);
      ctx.fill();
      ctx.fillStyle = '#FFD700';
      ctx.fillText(text, ox, hintY + 2);
      // Emoji bounce
      ctx.font = '16px sans-serif';
      const bounce = Math.sin(state.time * 4) * 3;
      ctx.fillText(obj.emoji, ox, hintY - 12 + bounce);
    }

    ctx.restore();
  }
}

// ---- TV drawing ----
function drawInteractiveTV(ctx: CanvasRenderingContext2D, obj: InteractiveObject, time: number): void {
  const { x, y, w, h } = obj;
  // TV body
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.roundRect(x - 2, y - 2, w + 4, h + 4, 3);
  ctx.fill();

  if (obj.state) {
    // TV on — animated screen
    const hue = (time * 30) % 360;
    const screenGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    screenGrad.addColorStop(0, `hsl(${hue}, 60%, 50%)`);
    screenGrad.addColorStop(0.5, `hsl(${(hue + 120) % 360}, 50%, 60%)`);
    screenGrad.addColorStop(1, `hsl(${(hue + 240) % 360}, 60%, 50%)`);
    ctx.fillStyle = screenGrad;
    ctx.fillRect(x, y, w, h);
    // Screen glow
    ctx.shadowColor = `hsl(${hue}, 60%, 50%)`;
    ctx.shadowBlur = 15;
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;
    // Scanlines
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 0.5;
    for (let sy = y; sy < y + h; sy += 3) {
      ctx.beginPath();
      ctx.moveTo(x, sy);
      ctx.lineTo(x + w, sy);
      ctx.stroke();
    }
  } else {
    // TV off — dark screen with reflection
    ctx.fillStyle = '#111';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.3, y + h * 0.3, w * 0.2, h * 0.15, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Stand
  ctx.fillStyle = '#333';
  ctx.fillRect(x + w / 2 - 3, y + h + 2, 6, 4);
  ctx.fillRect(x + w / 2 - 10, y + h + 5, 20, 2);
}

// ---- Fridge drawing ----
function drawInteractiveFridge(ctx: CanvasRenderingContext2D, obj: InteractiveObject, time: number): void {
  const { x, y, w, h } = obj;

  if (obj.state) {
    // Open fridge — showing inside
    ctx.fillStyle = '#E8E8E8';
    ctx.fillRect(x, y, w, h);
    // Inside glow (light)
    ctx.fillStyle = 'rgba(200,230,255,0.3)';
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    // Shelves
    ctx.fillStyle = '#CCC';
    for (let sy = 1; sy <= 3; sy++) {
      ctx.fillRect(x + 3, y + h * sy / 4, w - 6, 2);
    }
    // Food items inside
    ctx.font = '10px sans-serif';
    ctx.fillText('🥛', x + 5, y + h * 0.2);
    ctx.fillText('🧀', x + 18, y + h * 0.2);
    ctx.fillText('🍎', x + 5, y + h * 0.45);
    ctx.fillText('🥕', x + 18, y + h * 0.45);
    ctx.fillText('🧃', x + 5, y + h * 0.7);
    ctx.fillText('🍫', x + 18, y + h * 0.7);
    // Door ajar (swung open)
    ctx.fillStyle = '#E0E0E0';
    ctx.save();
    ctx.translate(x + w, y);
    ctx.transform(0.3, 0, 0, 1, 0, 0); // perspective
    ctx.fillRect(0, 0, w * 0.7, h);
    ctx.strokeStyle = '#CCC';
    ctx.strokeRect(0, 0, w * 0.7, h);
    ctx.restore();
    // Cold mist particles
    ctx.fillStyle = 'rgba(200,230,255,0.2)';
    for (let i = 0; i < 3; i++) {
      const mx = x + 5 + Math.sin(time * 2 + i) * 10;
      const my = y + h + 5 + i * 5;
      ctx.beginPath();
      ctx.arc(mx, my, 3 + Math.sin(time * 3 + i) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Closed fridge
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 2);
    ctx.fill();
    ctx.strokeStyle = '#CCC';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Door line (split)
    ctx.beginPath();
    ctx.moveTo(x + 1, y + h * 0.6);
    ctx.lineTo(x + w - 1, y + h * 0.6);
    ctx.stroke();
    // Handle
    ctx.fillStyle = '#AAA';
    ctx.fillRect(x + w - 5, y + h * 0.3, 2, 15);
    ctx.fillRect(x + w - 5, y + h * 0.65, 2, 12);
  }
}

// ---- Lamp drawing ----
function drawInteractiveLamp(ctx: CanvasRenderingContext2D, obj: InteractiveObject, _time: number): void {
  const { x, y, w, h } = obj;
  const cx = x + w / 2;

  // Lamp base
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(cx - 3, y + h - 5, 6, 5);
  ctx.fillRect(cx - 6, y + h, 12, 2);

  // Lamp pole
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(cx - 1.5, y + 8, 3, h - 13);

  // Shade
  ctx.fillStyle = obj.state ? '#FFF8E1' : '#D7CEC7';
  ctx.beginPath();
  ctx.moveTo(cx - 10, y + 8);
  ctx.lineTo(cx - 6, y);
  ctx.lineTo(cx + 6, y);
  ctx.lineTo(cx + 10, y + 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#C8AD8A';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  if (obj.state) {
    // Light glow
    const glowGrad = ctx.createRadialGradient(cx, y + h / 2, 0, cx, y + h / 2, 40);
    glowGrad.addColorStop(0, 'rgba(255,240,180,0.25)');
    glowGrad.addColorStop(1, 'rgba(255,240,180,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, y + h / 2, 40, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---- Tap drawing ----
function drawInteractiveTap(ctx: CanvasRenderingContext2D, obj: InteractiveObject, time: number): void {
  const { x, y, w, h } = obj;
  const cx = x + w / 2;

  // Faucet base
  ctx.fillStyle = '#AAA';
  ctx.fillRect(cx - 2, y, 4, h);

  // Faucet head (curved pipe)
  ctx.strokeStyle = '#AAA';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.quadraticCurveTo(cx + 12, y - 5, cx + 10, y + 8);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Handle
  ctx.fillStyle = '#2196F3';
  ctx.beginPath();
  ctx.arc(cx - 6, y + 4, 3, 0, Math.PI * 2);
  ctx.fill();

  if (obj.state) {
    // Water stream
    ctx.strokeStyle = 'rgba(66,165,245,0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const wx = cx + 10 + Math.sin(time * 8 + i * 2) * 1.5;
      ctx.beginPath();
      ctx.moveTo(wx, y + 10);
      ctx.lineTo(wx + Math.sin(time * 5 + i) * 2, y + h + 15);
      ctx.stroke();
    }
    // Splash at bottom
    ctx.fillStyle = 'rgba(66,165,245,0.3)';
    for (let i = 0; i < 4; i++) {
      const sx = cx + 8 + Math.sin(time * 6 + i * 1.5) * 5;
      const sy = y + h + 13 + Math.random() * 3;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ---- Piano drawing ----
function drawInteractivePiano(ctx: CanvasRenderingContext2D, obj: InteractiveObject, _time: number): void {
  const { x, y, w, h } = obj;

  // Piano body
  ctx.fillStyle = '#2A2A2A';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 2);
  ctx.fill();

  // White keys
  const numKeys = 8;
  const kw = (w - 4) / numKeys;
  for (let i = 0; i < numKeys; i++) {
    ctx.fillStyle = '#F5F5F0';
    ctx.fillRect(x + 2 + i * kw, y + 2, kw - 1, h - 4);
    ctx.strokeStyle = '#CCC';
    ctx.lineWidth = 0.3;
    ctx.strokeRect(x + 2 + i * kw, y + 2, kw - 1, h - 4);
  }

  // Black keys
  ctx.fillStyle = '#1A1A1A';
  const blackPositions = [1, 2, 4, 5, 6]; // relative to white keys
  for (const bp of blackPositions) {
    if (bp < numKeys) {
      ctx.fillRect(x + 2 + bp * kw - kw * 0.3, y + 2, kw * 0.6, h * 0.55);
    }
  }
}

// ---- Bookshelf drawing ----
function drawInteractiveBookshelf(ctx: CanvasRenderingContext2D, obj: InteractiveObject): void {
  const { x, y, w, h } = obj;

  // Shelf frame
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#A0846B';
  ctx.fillRect(x + 2, y + 2, w - 4, h / 2 - 3);
  ctx.fillRect(x + 2, y + h / 2 + 1, w - 4, h / 2 - 3);

  // Books (colorful spines)
  const bookColors = ['#E53935', '#1565C0', '#43A047', '#FF8F00', '#7B1FA2', '#00838F', '#D81B60'];
  const numBooks = 6;
  const bw = (w - 8) / numBooks;
  for (let i = 0; i < numBooks; i++) {
    ctx.fillStyle = bookColors[i % bookColors.length];
    ctx.fillRect(x + 4 + i * bw, y + 3, bw - 1, h / 2 - 5);
    // Title line
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x + 4 + i * bw + 1, y + 5, bw - 3, 1);
  }
  // Bottom shelf — smaller books
  for (let i = 0; i < numBooks - 1; i++) {
    ctx.fillStyle = bookColors[(i + 3) % bookColors.length];
    ctx.fillRect(x + 4 + i * (bw + 1), y + h / 2 + 2, bw, h / 2 - 5);
  }
}

// ---- RC Controller (interactive object) ----
function drawInteractiveRCController(ctx: CanvasRenderingContext2D, obj: InteractiveObject, time: number): void {
  const { x, y, w, h } = obj;

  if (obj.state) {
    // Already picked up — show empty spot with subtle glow
    ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
    ctx.fillRect(x, y, w, h);
    return;
  }

  // Controller body
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.fill();

  // D-pad
  ctx.fillStyle = '#555';
  ctx.fillRect(x + 4, y + 6, 8, 3);
  ctx.fillRect(x + 6, y + 4, 3, 8);

  // Buttons
  ctx.fillStyle = '#E53935';
  ctx.beginPath();
  ctx.arc(x + w - 8, y + 6, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2196F3';
  ctx.beginPath();
  ctx.arc(x + w - 8, y + 12, 3, 0, Math.PI * 2);
  ctx.fill();

  // Antenna (blinking)
  ctx.fillStyle = Math.sin(time * 5) > 0 ? '#FF0000' : '#880000';
  ctx.beginPath();
  ctx.arc(x + w / 2, y - 3, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y - 3);
  ctx.stroke();

  // Floating glow effect
  const glow = Math.sin(time * 2) * 0.15 + 0.15;
  ctx.fillStyle = `rgba(255, 215, 0, ${glow})`;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, w, 0, Math.PI * 2);
  ctx.fill();
}

// ---- Stairs ----
function renderStairs(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const stair of state.stairs) {
    const numSteps = 10;
    const stepH = (stair.bottomY - stair.topY) / numSteps;
    for (let i = 0; i < numSteps; i++) {
      const sy = stair.topY + i * stepH;
      ctx.fillStyle = i % 2 === 0 ? '#E0D8D0' : '#D8CFC4';
      ctx.fillRect(stair.x, sy, stair.w, stepH);
      ctx.fillStyle = '#C8AD8A';
      ctx.fillRect(stair.x, sy, stair.w, 2);
    }
    ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(stair.x - 5, stair.bottomY); ctx.lineTo(stair.x - 5, stair.topY - 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(stair.x + stair.w + 5, stair.bottomY); ctx.lineTo(stair.x + stair.w + 5, stair.topY - 20); ctx.stroke();
    ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(stair.x - 5, stair.topY - 20); ctx.lineTo(stair.x + stair.w + 5, stair.topY - 20); ctx.stroke();
    ctx.lineWidth = 1;
  }
}

// ---- Door ----
function renderDoor(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const door of state.doors) {
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(door.x - 3, door.y - 3, door.w + 6, door.h + 3);
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(door.x, door.y, door.w, door.h);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath(); ctx.arc(door.x + 5, door.y + door.h / 2, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(200,220,240,0.3)';
    ctx.fillRect(door.x + 5, door.y + 5, door.w - 10, door.h * 0.4);
  }
}

// ---- Items (EXPANDED with new types) ----
function renderItems(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const item of state.items) {
    if (item.collected) continue;

    const floatY = Math.sin(item.floatPhase) * ITEM_FLOAT_AMP;
    const x = item.x;
    const y = item.y + floatY;
    const s = item.w;

    ctx.save();
    // Enhanced glow: color varies by item type, pulsing intensity
    const glowPulse = 10 + Math.sin(state.time * 3 + item.floatPhase) * 6;
    const glowColors: Record<string, string> = {
      apple: '#FF4444', star: '#FFD700', cookie: '#FF8C00', flower: '#FF69B4',
      key: '#FFD700', letter: '#4488FF', banana: '#FFE135',
      lego_red: '#FF4444', lego_blue: '#4488FF', lego_green: '#44FF44', lego_yellow: '#FFD700',
    };
    ctx.shadowColor = glowColors[item.type] || '#FFD700';
    ctx.shadowBlur = glowPulse;

    switch (item.type) {
      case 'apple': drawApple(ctx, x + s / 2, y + s / 2, s / 2); break;
      case 'toy_car': drawToyCar(ctx, x, y, s); break;
      case 'toy_ball': drawToyBall(ctx, x + s / 2, y + s / 2, s / 2); break;
      case 'toy_bear': drawToyBear(ctx, x, y, s); break;
      case 'toy_block': drawToyBlock(ctx, x, y, s, 'K'); break;
      case 'lego_red': drawLego(ctx, x, y, s, '#E53935'); break;
      case 'lego_blue': drawLego(ctx, x, y, s, '#1565C0'); break;
      case 'lego_yellow': drawLego(ctx, x, y, s, '#FDD835'); break;
      case 'lego_green': drawLego(ctx, x, y, s, '#43A047'); break;
      case 'plush_dog': drawPlushDog(ctx, x, y, s); break;
      case 'plush_panda': drawPlushPanda(ctx, x, y, s); break;
      case 'plush_rabbit': drawPlushRabbit(ctx, x, y, s); break;
      case 'cookie': drawCookie(ctx, x + s / 2, y + s / 2, s / 2); break;
      case 'letter': drawLetter(ctx, x, y, s); break;
      case 'flower': drawFlower(ctx, x + s / 2, y + s / 2, s / 2); break;
      case 'ingredient': drawIngredient(ctx, x, y, s); break;
      default:
        ctx.fillStyle = '#FFD700';
        ctx.font = `${s}px sans-serif`;
        ctx.fillText(ITEM_EMOJIS[item.type] || '📦', x, y + s);
    }

    ctx.restore();
  }
}

// Item draw functions
function drawApple(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.fillStyle = '#E53935';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.35, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(cx - 1, cy - r - 4, 2, 6);
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath(); ctx.ellipse(cx + 3, cy - r - 2, 5, 3, 0.5, 0, Math.PI * 2); ctx.fill();
}

function drawToyCar(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  ctx.fillStyle = '#2196F3';
  ctx.fillRect(x + 2, y + s * 0.3, s - 4, s * 0.4);
  ctx.fillRect(x + s * 0.2, y + s * 0.1, s * 0.6, s * 0.3);
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x + s * 0.25, y + s * 0.75, s * 0.12, 0, Math.PI * 2);
  ctx.arc(x + s * 0.75, y + s * 0.75, s * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#90CAF9';
  ctx.fillRect(x + s * 0.3, y + s * 0.15, s * 0.15, s * 0.18);
  ctx.fillRect(x + s * 0.5, y + s * 0.15, s * 0.15, s * 0.18);
}

function drawToyBall(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.fillStyle = '#FF9800';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#F57C00'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
  ctx.lineWidth = 1;
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.3, 0, Math.PI * 2); ctx.fill();
}

function drawToyBear(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  const cx = x + s / 2, cy = y + s / 2;
  ctx.fillStyle = '#A1887F';
  ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.1, s * 0.35, s * 0.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy - s * 0.2, s * 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - s * 0.2, cy - s * 0.35, s * 0.1, 0, Math.PI * 2);
  ctx.arc(cx + s * 0.2, cy - s * 0.35, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(cx - s * 0.08, cy - s * 0.25, 2, 0, Math.PI * 2);
  ctx.arc(cx + s * 0.08, cy - s * 0.25, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5D4037';
  ctx.beginPath(); ctx.arc(cx, cy - s * 0.15, 2, 0, Math.PI * 2); ctx.fill();
}

function drawToyBlock(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, letter: string): void {
  ctx.fillStyle = '#9C27B0';
  ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
  ctx.fillStyle = '#FFF';
  ctx.font = `bold ${s * 0.5}px sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(letter, x + s / 2, y + s / 2);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(x + 2, y + s - 4, s - 4, 2);
  ctx.fillRect(x + s - 4, y + 2, 2, s - 4);
}

// NEW item renderers
function drawLego(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x + 2, y + s * 0.3, s - 4, s * 0.6);
  // Studs on top
  const studSize = s * 0.15;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + s * 0.3, y + s * 0.25, studSize, 0, Math.PI * 2);
  ctx.arc(x + s * 0.7, y + s * 0.25, studSize, 0, Math.PI * 2);
  ctx.fill();
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(x + 3, y + s * 0.32, s * 0.3, 3);
  // 3D edge
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(x + 2, y + s * 0.85, s - 4, 3);
}

function drawPlushDog(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  const cx = x + s / 2, cy = y + s / 2;
  ctx.fillStyle = '#C8AD8A';
  ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.1, s * 0.35, s * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy - s * 0.2, s * 0.22, 0, Math.PI * 2); ctx.fill();
  // Ears (floppy)
  ctx.fillStyle = '#B89B74';
  ctx.beginPath(); ctx.ellipse(cx - s * 0.25, cy - s * 0.15, s * 0.12, s * 0.18, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + s * 0.25, cy - s * 0.15, s * 0.12, s * 0.18, 0.3, 0, Math.PI * 2); ctx.fill();
  // Eyes & nose
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(cx - 3, cy - s * 0.25, 2, 0, Math.PI * 2); ctx.arc(cx + 3, cy - s * 0.25, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5D4037';
  ctx.beginPath(); ctx.arc(cx, cy - s * 0.15, 2.5, 0, Math.PI * 2); ctx.fill();
  // Tongue
  ctx.fillStyle = '#E91E63';
  ctx.beginPath(); ctx.ellipse(cx, cy - s * 0.08, 2, 3, 0, 0, Math.PI); ctx.fill();
}

function drawPlushPanda(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  const cx = x + s / 2, cy = y + s / 2;
  ctx.fillStyle = '#FFF';
  ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.1, s * 0.35, s * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy - s * 0.15, s * 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(cx - s * 0.18, cy - s * 0.3, s * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + s * 0.18, cy - s * 0.3, s * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx - s * 0.08, cy - s * 0.18, s * 0.1, s * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + s * 0.08, cy - s * 0.18, s * 0.1, s * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.beginPath(); ctx.arc(cx - s * 0.08, cy - s * 0.2, 2, 0, Math.PI * 2); ctx.arc(cx + s * 0.08, cy - s * 0.2, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(cx, cy - s * 0.1, 2, 0, Math.PI * 2); ctx.fill();
}

function drawPlushRabbit(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  const cx = x + s / 2, cy = y + s / 2;
  ctx.fillStyle = '#F8BBD0';
  ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.1, s * 0.3, s * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy - s * 0.15, s * 0.22, 0, Math.PI * 2); ctx.fill();
  // Long ears
  ctx.beginPath(); ctx.ellipse(cx - s * 0.1, cy - s * 0.45, s * 0.06, s * 0.2, -0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + s * 0.1, cy - s * 0.45, s * 0.06, s * 0.2, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F48FB1';
  ctx.beginPath(); ctx.ellipse(cx - s * 0.1, cy - s * 0.45, s * 0.03, s * 0.12, -0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + s * 0.1, cy - s * 0.45, s * 0.03, s * 0.12, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(cx - 3, cy - s * 0.2, 2, 0, Math.PI * 2); ctx.arc(cx + 3, cy - s * 0.2, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F48FB1';
  ctx.beginPath(); ctx.arc(cx, cy - s * 0.12, 2, 0, Math.PI * 2); ctx.fill();
}

function drawCookie(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.fillStyle = '#D4A574';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5D4037';
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5 + 0.3;
    const d = r * 0.5;
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath(); ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.3, 0, Math.PI * 2); ctx.fill();
}

function drawLetter(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  ctx.fillStyle = '#F5F5DC';
  ctx.fillRect(x + 2, y + 4, s - 4, s * 0.7);
  ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 2, y + 4, s - 4, s * 0.7);
  ctx.lineWidth = 1;
  // Stamp
  ctx.fillStyle = '#E53935';
  ctx.fillRect(x + s - 10, y + 6, 6, 6);
  // Lines
  ctx.strokeStyle = '#B0BEC5';
  ctx.beginPath(); ctx.moveTo(x + 5, y + s * 0.4); ctx.lineTo(x + s - 5, y + s * 0.4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 5, y + s * 0.55); ctx.lineTo(x + s - 10, y + s * 0.55); ctx.stroke();
}

function drawFlower(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  // Petals
  const petalColors = ['#E91E63', '#FF4081', '#EC407A', '#F06292', '#F48FB1'];
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5;
    ctx.fillStyle = petalColors[i];
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5, r * 0.4, r * 0.25, a, 0, Math.PI * 2);
    ctx.fill();
  }
  // Center
  ctx.fillStyle = '#FDD835';
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2); ctx.fill();
}

function drawIngredient(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  // Carrot-like
  ctx.fillStyle = '#FF8A65';
  ctx.beginPath();
  ctx.moveTo(x + s * 0.3, y + s * 0.2);
  ctx.lineTo(x + s * 0.5, y + s * 0.9);
  ctx.lineTo(x + s * 0.7, y + s * 0.2);
  ctx.closePath();
  ctx.fill();
  // Green top
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(x + s * 0.35, y + 2, s * 0.3, s * 0.25);
  ctx.beginPath();
  ctx.arc(x + s * 0.4, y + 3, 4, 0, Math.PI * 2);
  ctx.arc(x + s * 0.6, y + 3, 4, 0, Math.PI * 2);
  ctx.fill();
}

// ---- Characters (Nintendo Switch quality rendering) ----
function renderPlayer(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { player } = state;

  // Dynamic shadow under player
  if (!player.lying) {
    const shadowX = player.x + player.w / 2;
    const shadowY = player.y + player.h;
    // Shadow gets smaller/fainter when jumping (further from ground)
    const distFromGround = player.onGround ? 0 : Math.min(80, Math.max(0, player.vy > 0 ? 20 : 40));
    const shadowScale = 1 - distFromGround / 120;
    const shadowAlpha = 0.2 * shadowScale;
    ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(shadowX, shadowY + 2, 18 * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (player.lying) {
    // Lying down: rotate character 90° to horizontal
    ctx.save();
    const px = player.x + player.w / 2;
    const py = player.y + player.h;
    ctx.translate(px, py);
    ctx.rotate(player.dir * Math.PI / 2);
    ctx.translate(-px, -py);
    ctx.translate(0, player.h * 0.3);
    drawKuba(ctx, player, state.time);
    ctx.restore();
    // "Zzz" sleep effect
    const zx = player.x + player.w / 2 + player.dir * 15;
    const zy = player.y + player.h - 30;
    const zBounce = Math.sin(state.time * 2) * 3;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = 'rgba(100,100,255,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('Z', zx, zy + zBounce);
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('z', zx + 8, zy - 8 + zBounce);
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('z', zx + 13, zy - 14 + zBounce);
    ctx.textAlign = 'left';
  } else if (player.crouching) {
    // Crouching: squash character vertically
    ctx.save();
    const px = player.x + player.w / 2;
    const py = player.y + player.h;
    ctx.translate(px, py);
    ctx.scale(1.1, 0.6);
    ctx.translate(-px, -py);
    drawKuba(ctx, player, state.time);
    ctx.restore();
    // Little sweat drop
    const dropX = player.x + player.w / 2 + player.dir * 12;
    const dropY = player.y + player.h - 55;
    ctx.fillStyle = 'rgba(100,180,255,0.6)';
    ctx.beginPath();
    ctx.moveTo(dropX, dropY - 4);
    ctx.quadraticCurveTo(dropX + 3, dropY, dropX, dropY + 3);
    ctx.quadraticCurveTo(dropX - 3, dropY, dropX, dropY - 4);
    ctx.fill();
  } else {
    // Squash & stretch transform
    const hasSquash = player.scaleX !== 1 || player.scaleY !== 1;
    if (hasSquash) {
      ctx.save();
      const px = player.x + player.w / 2;
      const py = player.y + player.h; // pivot at feet
      ctx.translate(px, py);
      ctx.scale(player.scaleX, player.scaleY);
      ctx.translate(-px, -py);
    }
    drawKuba(ctx, player, state.time);
    if (hasSquash) {
      ctx.restore();
    }
  }

  drawPlayerCostumes(ctx, state);
}

function renderNPCs(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const npc of state.npcs) {
    if (!npc.visible) continue;

    // Entrance animation: slide in + fade for first 0.8s
    const entranceT = Math.min(npc.animTimer, 0.8);
    if (entranceT < 0.8) {
      const progress = entranceT / 0.8;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      ctx.save();
      ctx.globalAlpha = eased;
      ctx.translate((1 - eased) * npc.dir * -60, (1 - eased) * 10);
    }

    if (npc.id === 'kot') {
      drawCat(ctx, npc, state.time);
    } else if (npc.id === 'jurek_npc') {
      drawJurekNPC(ctx, npc, state.time);
    } else if (npc.id === 'franek') {
      drawFranekDog(ctx, npc, state.time);
    } else if (npc.id === 'mama') {
      drawMamaOla(ctx, npc, state.time);
    } else if (npc.id === 'tata') {
      drawTataSeba(ctx, npc, state.time);
    } else if (npc.id === 'wujek') {
      drawWujekWithBMW(ctx, npc, state.time);
    } else if (npc.id === 'budowlaniec') {
      drawBudowlaniec(ctx, npc, state.time);
    } else if (npc.id === 'sasiadka') {
      drawSasiadka(ctx, npc, state.time);
    } else if (npc.id === 'mirek') {
      drawMirekDoctor(ctx, npc, state.time);
    } else if (npc.id === 'policjant') {
      drawPolicjant(ctx, npc, state.time);
    } else if (npc.id === 'rafal') {
      drawWujekRafal(ctx, npc, state.time);
    } else {
      drawCharacter(ctx, npc, npc.color, npc.hairColor, npc.hairLong, state.time);
      if (npc.id === 'listonosz') {
        drawMailmanExtras(ctx, npc);
      }
    }

    // Emote bubble
    if (npc.emote) {
      const ex = npc.x + npc.w / 2;
      const ey = npc.y - 20;
      const bounce = Math.sin(state.time * 3) * 3;
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(ex, ey + bounce, 14, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.lineWidth = 1;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#333';
      ctx.fillText(npc.emote, ex, ey + bounce + 1);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    }

    // Close entrance animation save
    if (entranceT < 0.8) {
      ctx.restore();
    }
  }
}

// Draw cat NPC
function drawCat(ctx: CanvasRenderingContext2D, npc: NPC, time: number): void {
  const cx = npc.x + npc.w / 2;
  const cy = npc.y + npc.h / 2;
  const dir = npc.dir;
  const s = npc.w / 32;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  // Body
  ctx.fillStyle = '#FF8F00';
  ctx.beginPath(); ctx.ellipse(0, 4, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
  // Head
  ctx.beginPath(); ctx.arc(dir * 10, -6, 9, 0, Math.PI * 2); ctx.fill();
  // Ears
  ctx.beginPath();
  ctx.moveTo(dir * 5, -14);
  ctx.lineTo(dir * 8, -8);
  ctx.lineTo(dir * 14, -10);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(dir * 15, -14);
  ctx.lineTo(dir * 12, -8);
  ctx.lineTo(dir * 18, -8);
  ctx.fill();
  // Eyes
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(dir * 8, -8, 2, 0, Math.PI * 2);
  ctx.arc(dir * 13, -8, 2, 0, Math.PI * 2);
  ctx.fill();
  // Tail
  ctx.strokeStyle = '#FF8F00'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-dir * 12, 2);
  ctx.quadraticCurveTo(-dir * 20, -10 + Math.sin(time * 4) * 5, -dir * 15, -15);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Stripes
  ctx.strokeStyle = '#E65100'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-4, 8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(2, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(4, 8); ctx.stroke();
  ctx.lineWidth = 1;

  ctx.restore();
}

// Draw Jurek plush dog NPC
function drawJurekNPC(ctx: CanvasRenderingContext2D, npc: NPC, time: number): void {
  const cx = npc.x + npc.w / 2;
  const cy = npc.y + npc.h / 2;
  const bounce = Math.sin(time * 2) * 2;

  ctx.save();
  ctx.translate(cx, cy + bounce);

  ctx.fillStyle = '#C8AD8A';
  ctx.beginPath(); ctx.ellipse(0, 3, 12, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -8, 9, 0, Math.PI * 2); ctx.fill();
  // Ears
  ctx.fillStyle = '#B89B74';
  ctx.beginPath(); ctx.ellipse(-8, -8, 5, 7, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(8, -8, 5, 7, 0.3, 0, Math.PI * 2); ctx.fill();
  // Eyes
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(-3, -10, 2, 0, Math.PI * 2); ctx.arc(3, -10, 2, 0, Math.PI * 2); ctx.fill();
  // Nose
  ctx.fillStyle = '#5D4037';
  ctx.beginPath(); ctx.arc(0, -6, 2.5, 0, Math.PI * 2); ctx.fill();
  // Tongue
  ctx.fillStyle = '#E91E63';
  ctx.beginPath(); ctx.ellipse(0, -3, 2, 3, 0, 0, Math.PI); ctx.fill();
  // Heart (Jurek loves Kuba!)
  ctx.font = '10px sans-serif';
  ctx.fillText('❤️', 8, -15);

  ctx.restore();
}

// Mailman extras (cap, bag)
function drawMailmanExtras(ctx: CanvasRenderingContext2D, npc: NPC): void {
  const cx = npc.x + npc.w / 2;
  const topY = npc.y;
  // Cap
  ctx.fillStyle = '#1565C0';
  ctx.fillRect(cx - 14, topY + 2, 28, 6);
  ctx.fillRect(cx - 10, topY - 4, 20, 8);
  // Cap brim
  ctx.fillStyle = '#0D47A1';
  ctx.fillRect(cx - 16 + (npc.dir === 1 ? 0 : -4), topY + 6, 20, 3);
  // Bag strap
  ctx.strokeStyle = '#795548'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 8, topY + 24);
  ctx.lineTo(cx + 8, topY + 45);
  ctx.stroke();
  ctx.lineWidth = 1;
  // Bag
  ctx.fillStyle = '#795548';
  ctx.fillRect(cx + 2, topY + 38, 14, 16);
}

// ---- Wujek Tomek with BMW 4 Cabrio (arrives from left) ----
function drawWujekWithBMW(ctx: CanvasRenderingContext2D, npc: NPC, time: number): void {
  const cx = npc.x + npc.w / 2;
  const baseY = npc.y + npc.h; // ground level

  // BMW 4 Cabrio — low sports car, convertible
  const carX = cx - 70;
  const carY = baseY - 40;
  const carW = 140;
  const carH = 40;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(carX + carW / 2, baseY + 2, carW / 2 + 5, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Car body — dark blue metallic BMW
  ctx.fillStyle = '#1A237E';
  ctx.beginPath();
  ctx.moveTo(carX + 10, carY + carH);
  ctx.lineTo(carX, carY + carH - 5);
  ctx.quadraticCurveTo(carX + 5, carY + 12, carX + 20, carY + 10);
  ctx.lineTo(carX + 40, carY + 5);
  ctx.quadraticCurveTo(carX + 55, carY, carX + 70, carY);
  ctx.lineTo(carX + 100, carY);
  ctx.quadraticCurveTo(carX + 120, carY + 2, carX + 135, carY + 10);
  ctx.lineTo(carX + carW, carY + carH - 5);
  ctx.lineTo(carX + carW - 5, carY + carH);
  ctx.closePath();
  ctx.fill();

  // Body highlight
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(carX + 15, carY + 14, carW - 30, 6);

  // Windshield frame (cabrio — no roof)
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(carX + 42, carY + 10);
  ctx.lineTo(carX + 38, carY - 5);
  ctx.lineTo(carX + 65, carY - 5);
  ctx.lineTo(carX + 68, carY + 5);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Windshield glass
  ctx.fillStyle = 'rgba(120,180,240,0.4)';
  ctx.beginPath();
  ctx.moveTo(carX + 42, carY + 10);
  ctx.lineTo(carX + 39, carY - 4);
  ctx.lineTo(carX + 64, carY - 4);
  ctx.lineTo(carX + 67, carY + 5);
  ctx.closePath();
  ctx.fill();

  // Headlights (right = front)
  ctx.fillStyle = '#FFEB3B';
  ctx.beginPath();
  ctx.ellipse(carX + carW - 5, carY + carH - 14, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Taillights (left = back)
  ctx.fillStyle = '#F44336';
  ctx.beginPath();
  ctx.ellipse(carX + 5, carY + carH - 14, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wheels
  for (const wx of [carX + 25, carX + carW - 25]) {
    // Tire
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(wx, baseY - 2, 10, 0, Math.PI * 2);
    ctx.fill();
    // Rim
    ctx.fillStyle = '#9E9E9E';
    ctx.beginPath();
    ctx.arc(wx, baseY - 2, 6, 0, Math.PI * 2);
    ctx.fill();
    // Rim spokes
    ctx.strokeStyle = '#757575';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + time * 2;
      ctx.beginPath();
      ctx.moveTo(wx, baseY - 2);
      ctx.lineTo(wx + Math.cos(angle) * 5, baseY - 2 + Math.sin(angle) * 5);
      ctx.stroke();
    }
    // Hub cap
    ctx.fillStyle = '#BDBDBD';
    ctx.beginPath();
    ctx.arc(wx, baseY - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // BMW kidney grille
  ctx.fillStyle = '#111';
  ctx.fillRect(carX + carW - 20, carY + carH - 20, 6, 8);
  ctx.fillRect(carX + carW - 13, carY + carH - 20, 6, 8);
  // Chrome surround
  ctx.strokeStyle = '#9E9E9E';
  ctx.lineWidth = 1;
  ctx.strokeRect(carX + carW - 20, carY + carH - 20, 6, 8);
  ctx.strokeRect(carX + carW - 13, carY + carH - 20, 6, 8);

  // BMW logo on hood
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(carX + carW - 16, carY + 8, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0066B1';
  ctx.beginPath();
  ctx.arc(carX + carW - 16, carY + 8, 3, 0, Math.PI * 2);
  ctx.fill();

  // License plate
  ctx.fillStyle = '#FFF';
  ctx.fillRect(carX + carW - 22, carY + carH - 6, 18, 5);
  ctx.fillStyle = '#333';
  ctx.font = '4px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BMW 4', carX + carW - 13, carY + carH - 2);
  ctx.textAlign = 'left';

  // Draw wujek standing next to car (slightly to the right, in front)
  drawCharacter(ctx, npc, npc.color, npc.hairColor, npc.hairLong, time);

  // Sunglasses on wujek
  const headY = npc.y + 12;
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - 9 * npc.dir, headY + 4, 7, 4);
  ctx.fillRect(cx + 2 * npc.dir, headY + 4, 7, 4);
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 2 * npc.dir, headY + 5);
  ctx.lineTo(cx + 2 * npc.dir, headY + 5);
  ctx.stroke();
}

// ---- Budowlaniec Pan Jacek — hard hat, orange vest ----
function drawBudowlaniec(ctx: CanvasRenderingContext2D, npc: NPC, time: number): void {
  drawCharacter(ctx, npc, npc.color, npc.hairColor, npc.hairLong, time);

  const cx = npc.x + npc.w / 2;
  const topY = npc.y;

  // Hard hat (yellow)
  ctx.fillStyle = '#F9A825';
  ctx.beginPath();
  ctx.moveTo(cx - 16, topY + 10);
  ctx.quadraticCurveTo(cx - 16, topY - 2, cx, topY - 4);
  ctx.quadraticCurveTo(cx + 16, topY - 2, cx + 16, topY + 10);
  ctx.closePath();
  ctx.fill();
  // Hat brim
  ctx.fillStyle = '#F57F17';
  ctx.fillRect(cx - 18, topY + 8, 36, 4);

  // Orange safety vest stripes
  ctx.strokeStyle = '#FF6F00';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 10, topY + 28);
  ctx.lineTo(cx - 10, topY + 50);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 10, topY + 28);
  ctx.lineTo(cx + 10, topY + 50);
  ctx.stroke();
  // Reflective horizontal stripe
  ctx.strokeStyle = '#FFEE58';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 12, topY + 38);
  ctx.lineTo(cx + 12, topY + 38);
  ctx.stroke();
  ctx.lineWidth = 1;
}

// ---- Sąsiadka Pani Basia — lady with apron and flower ----
function drawSasiadka(ctx: CanvasRenderingContext2D, npc: NPC, time: number): void {
  drawCharacter(ctx, npc, npc.color, npc.hairColor, npc.hairLong, time);

  const cx = npc.x + npc.w / 2;
  const topY = npc.y;

  // Garden apron
  ctx.fillStyle = '#A5D6A7';
  ctx.fillRect(cx - 12, topY + 35, 24, 30);
  // Apron pocket
  ctx.fillStyle = '#81C784';
  ctx.fillRect(cx - 6, topY + 48, 12, 10);
  // Flower in hand/hair
  const fBounce = Math.sin(time * 2) * 2;
  ctx.fillStyle = '#E91E63';
  ctx.beginPath();
  ctx.arc(cx + 10 * npc.dir, topY + 4 + fBounce, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFEB3B';
  ctx.beginPath();
  ctx.arc(cx + 10 * npc.dir, topY + 4 + fBounce, 2, 0, Math.PI * 2);
  ctx.fill();
}

// ================================================================
// DETAILED CHARACTER RENDERERS — Nintendo Switch quality
// Based on real family photos
// ================================================================

// ---- Sąsiad Mirek — gruby lekarz, biały kitel, stetoskop ----
function drawMirekDoctor(ctx: CanvasRenderingContext2D, npc: NPC, time: number): void {
  const cx = npc.x + npc.w / 2;
  const topY = npc.y;
  const dir = npc.dir;
  const bob = Math.sin(time * 2) * 1; // slower, heavier bob

  // Shadow (bigger — he's fat)
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(cx, topY + npc.h, 22, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (shorter, wider)
  ctx.fillStyle = '#37474F';
  ctx.fillRect(cx - 10, topY + 56 + bob, 8, 24);
  ctx.fillRect(cx + 2, topY + 56 + bob, 8, 24);

  // Shoes (big)
  ctx.fillStyle = '#333';
  ctx.fillRect(cx - 12 + dir * 2, topY + 78 + bob, 12, 5);
  ctx.fillRect(cx + dir * 2, topY + 78 + bob, 12, 5);

  // Body (wide — fat doctor!) with big belly
  ctx.fillStyle = '#FFFFFF'; // white coat
  ctx.beginPath();
  ctx.moveTo(cx - 18, topY + 20 + bob);
  ctx.quadraticCurveTo(cx - 26, topY + 35 + bob, cx - 22, topY + 48 + bob); // left side bulges out
  ctx.quadraticCurveTo(cx - 18, topY + 58 + bob, cx - 14, topY + 60 + bob);
  ctx.lineTo(cx + 14, topY + 60 + bob);
  ctx.quadraticCurveTo(cx + 18, topY + 58 + bob, cx + 22, topY + 48 + bob); // right side bulges
  ctx.quadraticCurveTo(cx + 26, topY + 35 + bob, cx + 18, topY + 20 + bob);
  ctx.closePath();
  ctx.fill();

  // Belly bulge (visible through coat — round gut)
  const bellyGrad = ctx.createRadialGradient(cx + dir * 2, topY + 42 + bob, 0, cx, topY + 42 + bob, 18);
  bellyGrad.addColorStop(0, 'rgba(240,240,240,0.5)');
  bellyGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(cx + dir * 2, topY + 42 + bob, 16, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Coat strain line (belly pushing coat apart)
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx, topY + 26 + bob);
  ctx.quadraticCurveTo(cx + dir * 4, topY + 40 + bob, cx + dir * 1, topY + 56 + bob);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Coat buttons (strained — spaced wider due to belly)
  ctx.fillStyle = '#90A4AE';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(cx + (i === 1 ? dir * 2 : 0), topY + 28 + i * 10 + bob, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Stethoscope
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 5, topY + 18 + bob);
  ctx.quadraticCurveTo(cx, topY + 35 + bob, cx + 8, topY + 25 + bob);
  ctx.stroke();
  ctx.fillStyle = '#B0BEC5';
  ctx.beginPath();
  ctx.arc(cx + 8, topY + 25 + bob, 3, 0, Math.PI * 2);
  ctx.fill();

  // Head (round, bigger)
  ctx.fillStyle = '#F0C090';
  ctx.beginPath();
  ctx.arc(cx, topY + 14 + bob, 14, 0, Math.PI * 2);
  ctx.fill();

  // Hair (gray, balding)
  ctx.fillStyle = '#616161';
  ctx.beginPath();
  ctx.arc(cx, topY + 10 + bob, 13, Math.PI * 0.8, Math.PI * 0.2);
  ctx.fill();

  // Glasses
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx - 6, topY + 14 + bob, 5, 0, Math.PI * 2);
  ctx.arc(cx + 6, topY + 14 + bob, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 1, topY + 14 + bob);
  ctx.lineTo(cx + 1, topY + 14 + bob);
  ctx.stroke();

  // Eyes (behind glasses)
  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.arc(cx - 6, topY + 14 + bob, 1.5, 0, Math.PI * 2);
  ctx.arc(cx + 6, topY + 14 + bob, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.strokeStyle = '#8D6E63';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, topY + 18 + bob, 5, 0.1, Math.PI - 0.1);
  ctx.stroke();

  // Arms (bigger)
  const armSwing = npc.animTimer ? Math.sin(time * 3) * 0.15 : 0;
  ctx.fillStyle = '#FFFFFF';
  ctx.save();
  ctx.translate(cx - 18, topY + 24 + bob);
  ctx.rotate(-0.3 + armSwing);
  ctx.fillRect(-3, 0, 7, 28);
  ctx.restore();
  ctx.save();
  ctx.translate(cx + 18, topY + 24 + bob);
  ctx.rotate(0.3 - armSwing);
  ctx.fillRect(-4, 0, 7, 28);
  ctx.restore();
}

// ---- Policjant — blue uniform, cap, badge ----
function drawPolicjant(ctx: CanvasRenderingContext2D, npc: NPC, time: number): void {
  // Use generic character as base, then add police details
  drawCharacter(ctx, npc, '#1A237E', '#333', false, time);

  const cx = npc.x + npc.w / 2;
  const topY = npc.y;

  // Police cap
  ctx.fillStyle = '#1A237E';
  ctx.fillRect(cx - 12, topY + 1, 24, 5);
  ctx.fillRect(cx - 10, topY - 3, 20, 5);
  // Cap visor
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - 12, topY + 4, 12, 3);
  // Badge on cap
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(cx, topY + 1, 3, 0, Math.PI * 2);
  ctx.fill();

  // Chest badge
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(cx - 5, topY + 25);
  ctx.lineTo(cx - 3, topY + 20);
  ctx.lineTo(cx - 1, topY + 25);
  ctx.closePath();
  ctx.fill();

  // Belt
  ctx.fillStyle = '#333';
  ctx.fillRect(cx - 14, topY + 44, 28, 3);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(cx - 3, topY + 44, 6, 3);
}

// ---- WUJEK RAFAŁ — traveler from Vietnam, green shirt, backpack, tanned ----
function drawWujekRafal(ctx: CanvasRenderingContext2D, npc: NPC, time: number): void {
  // Use generic character as base with green travel shirt
  drawCharacter(ctx, npc, '#2E7D32', '#5D4037', false, time);

  const cx = npc.x + npc.w / 2;
  const topY = npc.y;
  const bob = Math.sin(time * 2.5) * 1;

  // Tan skin overlay on face (slightly darker — Vietnam sun)
  ctx.fillStyle = 'rgba(180,130,80,0.15)';
  ctx.beginPath();
  ctx.arc(cx, topY + 14, 12, 0, Math.PI * 2);
  ctx.fill();

  // Backpack (big, orange, on his back)
  const bpX = cx - npc.dir * 16;
  ctx.fillStyle = '#FF7043';
  ctx.beginPath();
  ctx.moveTo(bpX - 8, topY + 14 + bob);
  ctx.quadraticCurveTo(bpX - 10, topY + 30 + bob, bpX - 8, topY + 50 + bob);
  ctx.lineTo(bpX + 8, topY + 50 + bob);
  ctx.quadraticCurveTo(bpX + 10, topY + 30 + bob, bpX + 8, topY + 14 + bob);
  ctx.closePath();
  ctx.fill();
  // Backpack straps
  ctx.strokeStyle = '#E65100';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bpX - 4, topY + 14 + bob);
  ctx.lineTo(cx - 6, topY + 20 + bob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bpX + 4, topY + 14 + bob);
  ctx.lineTo(cx + 6, topY + 20 + bob);
  ctx.stroke();
  // Backpack pocket
  ctx.fillStyle = '#E65100';
  ctx.fillRect(bpX - 5, topY + 36 + bob, 10, 8);
  // Backpack flag (Vietnam)
  ctx.fillStyle = '#DA251D';
  ctx.fillRect(bpX - 5, topY + 14 + bob, 10, 6);
  ctx.fillStyle = '#FFCD00';
  ctx.beginPath();
  ctx.moveTo(bpX, topY + 15 + bob);
  ctx.lineTo(bpX - 2, topY + 19 + bob);
  ctx.lineTo(bpX + 2, topY + 19 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 1;

  // Stubble/beard shadow
  ctx.fillStyle = 'rgba(80,50,30,0.15)';
  ctx.beginPath();
  ctx.arc(cx, topY + 20, 6, 0, Math.PI);
  ctx.fill();

  // Sunglasses (pushed up on forehead)
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx - 5, topY + 6 + bob, 4, 0, Math.PI * 2);
  ctx.arc(cx + 5, topY + 6 + bob, 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Taxi parked behind him (if on street)
  if (npc.x < -100) {
    const tx = npc.x - 50;
    const ty = topY + 55;
    // Taxi body
    ctx.fillStyle = '#FDD835';
    ctx.fillRect(tx, ty, 50, 18);
    // Taxi roof
    ctx.fillStyle = '#FBC02D';
    ctx.fillRect(tx + 10, ty - 8, 24, 10);
    // Windows
    ctx.fillStyle = '#B3E5FC';
    ctx.fillRect(tx + 12, ty - 6, 8, 7);
    ctx.fillRect(tx + 24, ty - 6, 8, 7);
    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(tx + 10, ty + 18, 4, 0, Math.PI * 2);
    ctx.arc(tx + 40, ty + 18, 4, 0, Math.PI * 2);
    ctx.fill();
    // TAXI sign
    ctx.fillStyle = '#FFF';
    ctx.fillRect(tx + 18, ty - 12, 14, 5);
    ctx.fillStyle = '#333';
    ctx.font = 'bold 4px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TAXI', tx + 25, ty - 8);
    ctx.textAlign = 'left';
  }
}

// ---- KUBA (player) — dirty blond boy, 4-5yo, black Adidas shirt with red stripes ----
function drawKuba(
  ctx: CanvasRenderingContext2D,
  player: { x: number; y: number; w: number; h: number; dir: 1 | -1; walking?: boolean; walkFrame?: number },
  time: number,
): void {
  const { x, y, w, h, dir } = player;
  const cx = x + w / 2;
  const walking = player.walking || false;
  const frame = player.walkFrame || 0;
  const bob = walking ? Math.sin(time * 10) * 1.5 : 0;
  const s = w / 40; // scale factor for bigger characters

  ctx.save();
  ctx.translate(cx, y + h);
  ctx.scale(s, s);

  // Ground shadow (soft)
  const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0.18)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(0, -1, 18, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- LEGS with gradient jeans ----
  const legSwing = walking ? Math.sin(frame * 1.5) * 0.35 : 0;

  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 5, -18);
    ctx.rotate(side === -1 ? legSwing : -legSwing);

    // Jeans with gradient (darker at top, lighter at knee)
    const jeansGrad = ctx.createLinearGradient(0, 0, 0, 18);
    jeansGrad.addColorStop(0, '#1E2D3D');
    jeansGrad.addColorStop(0.5, '#2C3E50');
    jeansGrad.addColorStop(0.8, '#34495E');
    jeansGrad.addColorStop(1, '#2C3E50');
    ctx.fillStyle = jeansGrad;
    ctx.beginPath();
    ctx.moveTo(-4.5, 0);
    ctx.quadraticCurveTo(-5, 8, -5, 16);
    ctx.quadraticCurveTo(0, 18, 5, 16);
    ctx.quadraticCurveTo(5, 8, 4.5, 0);
    ctx.closePath();
    ctx.fill();
    // Jeans highlight (catch light on thigh)
    ctx.fillStyle = 'rgba(100,140,180,0.08)';
    ctx.beginPath();
    ctx.ellipse(side * 1.5, 6, 2.5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Jean seam
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.lineTo(0, 15);
    ctx.stroke();
    // Cuff fold
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.moveTo(-4.5, 14);
    ctx.lineTo(4.5, 14);
    ctx.stroke();

    // Sneaker with gradient
    const shoeGrad = ctx.createRadialGradient(dir * 1, 16, 0, dir * 1, 17, 8);
    shoeGrad.addColorStop(0, '#FFFFFF');
    shoeGrad.addColorStop(1, '#E8E8E8');
    ctx.fillStyle = shoeGrad;
    ctx.beginPath();
    ctx.ellipse(dir * 1, 17, 7, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Shoe outline
    ctx.strokeStyle = '#CCC';
    ctx.lineWidth = 0.6;
    ctx.stroke();
    // Shoe sole (rubber)
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(-5, 19.5);
    ctx.quadraticCurveTo(dir * 1, 21.5, dir * 7, 19.5);
    ctx.lineTo(dir * 7, 20.5);
    ctx.quadraticCurveTo(dir * 1, 22.5, -5, 20.5);
    ctx.closePath();
    ctx.fill();
    // Red Nike-like swoosh
    ctx.strokeStyle = '#E53935';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(dir * -3, 16);
    ctx.quadraticCurveTo(dir * 2, 18, dir * 5, 15);
    ctx.stroke();
    // Laces
    ctx.strokeStyle = '#DDD';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-1, 14.5);
    ctx.lineTo(1, 15.5);
    ctx.moveTo(-1, 15.8);
    ctx.lineTo(1, 16.8);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.restore();
  }

  // ---- BODY — black Adidas shirt with gradient ----
  const shirtGrad = ctx.createLinearGradient(-12, -42 + bob, 12, -18);
  shirtGrad.addColorStop(0, '#222222');
  shirtGrad.addColorStop(0.3, '#1A1A1A');
  shirtGrad.addColorStop(0.7, '#111111');
  shirtGrad.addColorStop(1, '#1A1A1A');
  ctx.fillStyle = shirtGrad;
  ctx.beginPath();
  ctx.moveTo(-11, -42 + bob);
  ctx.quadraticCurveTo(-13, -34 + bob, -10, -18);
  ctx.lineTo(10, -18);
  ctx.quadraticCurveTo(13, -34 + bob, 11, -42 + bob);
  ctx.closePath();
  ctx.fill();

  // Shirt fabric highlight (catch light)
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.beginPath();
  ctx.ellipse(dir * 3, -32 + bob, 5, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shirt collar (round neck showing skin)
  const skinGrad = ctx.createRadialGradient(0, -41 + bob, 0, 0, -41 + bob, 6);
  skinGrad.addColorStop(0, '#FFDCB8');
  skinGrad.addColorStop(1, '#F5D0A5');
  ctx.fillStyle = skinGrad;
  ctx.beginPath();
  ctx.moveTo(-5, -42 + bob);
  ctx.quadraticCurveTo(0, -39 + bob, 5, -42 + bob);
  ctx.fill();

  // 3 Red Adidas stripes on shoulder (brighter, cleaner)
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const stripeGrad = ctx.createLinearGradient(dir * (5 + i * 2.5), -41 + bob, dir * (7 + i * 2.5), -33 + bob);
    stripeGrad.addColorStop(0, '#FF4444');
    stripeGrad.addColorStop(0.5, '#E53935');
    stripeGrad.addColorStop(1, '#C62828');
    ctx.strokeStyle = stripeGrad;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(dir * (5 + i * 2.5), -41 + bob);
    ctx.lineTo(dir * (7 + i * 2.5), -33 + bob);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';

  // Shirt wrinkle lines (fabric detail)
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-3, -38 + bob);
  ctx.quadraticCurveTo(-2, -30 + bob, -1, -22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(4, -36 + bob);
  ctx.quadraticCurveTo(3, -28 + bob, 3, -20);
  ctx.stroke();
  ctx.lineWidth = 1;

  // ---- ARMS with gradient skin ----
  const armSwing = walking ? Math.sin(frame * 1.5) * 0.4 : 0;

  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 12, -40 + bob);
    ctx.rotate(side === -1 ? armSwing : -armSwing);
    // Sleeve (black gradient)
    const sleeveGrad = ctx.createLinearGradient(-4, 0, 4, 10);
    sleeveGrad.addColorStop(0, '#222');
    sleeveGrad.addColorStop(1, '#1A1A1A');
    ctx.fillStyle = sleeveGrad;
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.quadraticCurveTo(-4.5, 5, -3.5, 10);
    ctx.lineTo(3.5, 10);
    ctx.quadraticCurveTo(4.5, 5, 4, 0);
    ctx.closePath();
    ctx.fill();
    // Forearm (skin gradient)
    const forearmGrad = ctx.createLinearGradient(0, 9, 0, 20);
    forearmGrad.addColorStop(0, '#FFDCB8');
    forearmGrad.addColorStop(1, '#FFDCB8');
    ctx.fillStyle = forearmGrad;
    ctx.beginPath();
    ctx.moveTo(-3, 9.5);
    ctx.quadraticCurveTo(-3, 15, -1.5, 18);
    ctx.quadraticCurveTo(0, 20, 1.5, 18);
    ctx.quadraticCurveTo(3, 15, 3, 9.5);
    ctx.closePath();
    ctx.fill();
    // Hand with shading
    const handGrad = ctx.createRadialGradient(0, 19, 0, 0, 19, 4);
    handGrad.addColorStop(0, '#FFDCB8');
    handGrad.addColorStop(1, '#F5D0A5');
    ctx.fillStyle = handGrad;
    ctx.beginPath();
    ctx.arc(0, 19, 3.8, 0, Math.PI * 2);
    ctx.fill();
    // Fingers hint
    ctx.strokeStyle = 'rgba(200,160,120,0.3)';
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(-1, 21.5);
    ctx.lineTo(-1, 22.5);
    ctx.moveTo(1, 21.5);
    ctx.lineTo(1, 22.5);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.restore();
  }

  // ---- NECK with gradient ----
  const neckGrad = ctx.createLinearGradient(-4, -45 + bob, 4, -40 + bob);
  neckGrad.addColorStop(0, '#FFDCB8');
  neckGrad.addColorStop(0.5, '#FFDCB8');
  neckGrad.addColorStop(1, '#F5D0A5');
  ctx.fillStyle = neckGrad;
  ctx.fillRect(-3.5, -45 + bob, 7, 5);
  // Neck shadow under chin
  ctx.fillStyle = 'rgba(200,170,140,0.15)';
  ctx.fillRect(-3.5, -45 + bob, 7, 2);

  // ---- HEAD with gradient skin ----
  const headY = -52 + bob;

  // Head shadow (ambient occlusion)
  ctx.fillStyle = 'rgba(210,180,150,0.08)';
  ctx.beginPath();
  ctx.ellipse(0, headY + 2, 14, 14.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head base with gradient
  const headGrad = ctx.createRadialGradient(-2, headY - 2, 0, 0, headY, 16);
  headGrad.addColorStop(0, '#FFE4C8');
  headGrad.addColorStop(0.6, '#FFD8B5');
  headGrad.addColorStop(1, '#F5C8A0');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(0, headY, 13, 13.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rim light (edge lighting on face)
  ctx.strokeStyle = 'rgba(255,220,180,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, headY, 13, Math.PI * 0.3, Math.PI * 0.7);
  ctx.stroke();

  // Ears with inner detail
  for (const side of [-1, 1]) {
    // Outer ear
    const earGrad = ctx.createRadialGradient(side * 13, headY + 1, 0, side * 13, headY + 1, 5);
    earGrad.addColorStop(0, '#FFD8B5');
    earGrad.addColorStop(1, '#F5C8A0');
    ctx.fillStyle = earGrad;
    ctx.beginPath();
    ctx.ellipse(side * 13, headY + 1, 3.5, 4.5, side * 0.1, 0, Math.PI * 2);
    ctx.fill();
    // Inner ear
    ctx.fillStyle = '#F0C8A0';
    ctx.beginPath();
    ctx.ellipse(side * 13, headY + 1, 2, 3, side * 0.1, 0, Math.PI * 2);
    ctx.fill();
    // Ear shadow
    ctx.fillStyle = 'rgba(180,130,90,0.15)';
    ctx.beginPath();
    ctx.ellipse(side * 13, headY + 2.5, 1.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- HAIR (messy dirty blond — from photo, more layers) ----
  // Hair base shadow
  ctx.fillStyle = '#A88850';
  ctx.beginPath();
  ctx.arc(0, headY - 5, 14.5, Math.PI * 0.85, Math.PI * 0.15, true);
  ctx.fill();

  // Main hair mass with gradient
  const hairGrad = ctx.createRadialGradient(0, headY - 10, 0, 0, headY - 6, 16);
  hairGrad.addColorStop(0, '#D4B878');
  hairGrad.addColorStop(0.5, '#C4A265');
  hairGrad.addColorStop(1, '#B89558');
  ctx.fillStyle = hairGrad;
  ctx.beginPath();
  ctx.arc(0, headY - 6, 14, Math.PI * 0.85, Math.PI * 0.15, true);
  ctx.fill();

  // Volume on top
  ctx.beginPath();
  ctx.ellipse(0, headY - 9, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Messy tufts (more defined)
  ctx.fillStyle = '#BFA060';
  ctx.beginPath();
  ctx.moveTo(-8, headY - 12);
  ctx.quadraticCurveTo(-13, headY - 22, -6, headY - 19);
  ctx.quadraticCurveTo(-2, headY - 14, -5, headY - 11);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, headY - 13);
  ctx.quadraticCurveTo(9, headY - 23, 11, headY - 17);
  ctx.quadraticCurveTo(15, headY - 12, 7, headY - 11);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-1, headY - 16);
  ctx.quadraticCurveTo(1, headY - 25, 5, headY - 17);
  ctx.fill();
  // Extra side tuft
  ctx.beginPath();
  ctx.moveTo(-12, headY - 8);
  ctx.quadraticCurveTo(-16, headY - 14, -11, headY - 13);
  ctx.fill();

  // Hair highlights (sun-bleached strands)
  ctx.fillStyle = '#DFC888';
  ctx.beginPath();
  ctx.arc(-3, headY - 12, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5, headY - 13, 3, 0, Math.PI * 2);
  ctx.fill();
  // Bright highlight spot
  ctx.fillStyle = 'rgba(240,220,170,0.3)';
  ctx.beginPath();
  ctx.arc(1, headY - 14, 5, 0, Math.PI * 2);
  ctx.fill();

  // Side hair covering ears
  ctx.fillStyle = '#C4A265';
  ctx.beginPath();
  ctx.moveTo(-14, headY - 5);
  ctx.quadraticCurveTo(-15, headY, -14, headY + 3);
  ctx.quadraticCurveTo(-12, headY + 4, -11, headY - 3);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, headY - 5);
  ctx.quadraticCurveTo(15, headY, 14, headY + 3);
  ctx.quadraticCurveTo(12, headY + 4, 11, headY - 3);
  ctx.closePath();
  ctx.fill();

  // Hair strand detail lines
  ctx.strokeStyle = 'rgba(160,128,70,0.2)';
  ctx.lineWidth = 0.4;
  for (let i = 0; i < 6; i++) {
    const sx = -8 + i * 3.2;
    ctx.beginPath();
    ctx.moveTo(sx, headY - 10);
    ctx.quadraticCurveTo(sx + 1, headY - 16, sx + 2, headY - 18);
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  // ---- EYES (big brown — childlike, more detail) ----
  const eyeOff = dir * 1.5;
  const eyeY = headY + 1;

  // Blink animation
  const blinkCycle = Math.sin(time * 0.7);
  const isBlinking = blinkCycle > 0.96; // blink every ~4.5 seconds
  const eyeScale = isBlinking ? 0.15 : 1.0;

  for (const side of [-1, 1]) {
    const ex = side * 4.5 + eyeOff;
    // Eye socket shadow
    ctx.fillStyle = 'rgba(180,150,120,0.08)';
    ctx.beginPath();
    ctx.ellipse(ex, eyeY + 0.5, 5, 4.5 * eyeScale, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isBlinking) {
      // Closed-eye line when blinking
      ctx.strokeStyle = '#8A7050';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ex, eyeY, 3.5, 0.3, Math.PI - 0.3);
      ctx.stroke();
    } else {
    // White with gradient
    const eyeWhiteGrad = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, 4);
    eyeWhiteGrad.addColorStop(0, '#FFFFFF');
    eyeWhiteGrad.addColorStop(1, '#F0EDE8');
    ctx.fillStyle = eyeWhiteGrad;
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, 4.2, 3.7, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eye outline
    ctx.strokeStyle = 'rgba(140,110,70,0.3)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Iris with gradient (bright blue — Polish child)
    const irisGrad = ctx.createRadialGradient(ex + dir * 0.7, eyeY + 0.3, 0, ex + dir * 0.7, eyeY + 0.3, 2.5);
    irisGrad.addColorStop(0, '#6BAFE0');
    irisGrad.addColorStop(0.5, '#3A8BC4');
    irisGrad.addColorStop(1, '#2A6A9A');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(ex + dir * 0.7, eyeY + 0.3, 2.4, 0, Math.PI * 2);
    ctx.fill();
    // Pupil
    ctx.fillStyle = '#0A0A0A';
    ctx.beginPath();
    ctx.arc(ex + dir * 0.9, eyeY + 0.3, 1.2, 0, Math.PI * 2);
    ctx.fill();
    // Highlights (key to "alive" look)
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(ex + dir * 0.2, eyeY - 1, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex + dir * 1.3, eyeY + 1, 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Upper lid line
    ctx.strokeStyle = '#8A7050';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(ex, eyeY - 0.5, 4, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();
    // Lower lid hint
    ctx.strokeStyle = 'rgba(140,110,70,0.15)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(ex, eyeY + 0.5, 3.8, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
    } // end !isBlinking
    // Eyebrow (light blond like hair)
    ctx.strokeStyle = '#B8A070';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(ex, eyeY - 7, 5, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  // Nose with shading
  const noseGrad = ctx.createRadialGradient(eyeOff * 0.3, headY + 5, 0, eyeOff * 0.3, headY + 5.5, 3);
  noseGrad.addColorStop(0, '#FFDCB8');
  noseGrad.addColorStop(1, '#F5C8A0');
  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.arc(eyeOff * 0.3, headY + 5.5, 2.2, 0, Math.PI);
  ctx.fill();
  // Nose highlight
  ctx.fillStyle = 'rgba(255,220,190,0.3)';
  ctx.beginPath();
  ctx.arc(eyeOff * 0.3 - 0.5, headY + 4.5, 1, 0, Math.PI * 2);
  ctx.fill();

  // Subtle smile (delicate, Sims-style)
  const mouthX = eyeOff * 0.3;
  const mouthY = headY + 8;
  // Upper lip line — thin, gentle curve
  ctx.strokeStyle = '#C09070';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(mouthX - 3, mouthY);
  ctx.quadraticCurveTo(mouthX, mouthY - 1, mouthX + 3, mouthY);
  ctx.stroke();
  // Lower lip — small, soft
  const kLipGrad = ctx.createRadialGradient(mouthX, mouthY + 1.2, 0, mouthX, mouthY + 1.2, 2);
  kLipGrad.addColorStop(0, '#E8A090');
  kLipGrad.addColorStop(1, '#D89080');
  ctx.fillStyle = kLipGrad;
  ctx.beginPath();
  ctx.ellipse(mouthX, mouthY + 1.2, 2.2, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // Subtle smile corners (gentle upturn)
  ctx.strokeStyle = 'rgba(180,120,90,0.4)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(mouthX, mouthY + 0.5, 2.8, 0.15, Math.PI - 0.15);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Rosy cheeks (softer gradient)
  for (const side of [-1, 1]) {
    const cheekGrad = ctx.createRadialGradient(side * 8, headY + 4, 0, side * 8, headY + 4, 4);
    cheekGrad.addColorStop(0, 'rgba(255, 130, 120, 0.35)');
    cheekGrad.addColorStop(1, 'rgba(255, 130, 120, 0)');
    ctx.fillStyle = cheekGrad;
    ctx.beginPath();
    ctx.ellipse(side * 8, headY + 4, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Character outline (subtle, for readability)
  ctx.strokeStyle = 'rgba(80,60,30,0.08)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.ellipse(0, headY, 13.5, 14, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1;

  ctx.restore();
}

// ---- TATA SEBA — dark hair, clean-shaven, black t-shirt, broad shoulders ----
function drawTataSeba(
  ctx: CanvasRenderingContext2D,
  npc: { x: number; y: number; w: number; h: number; dir: 1 | -1; walking?: boolean; walkFrame?: number },
  time: number,
): void {
  const { x, y, w, h, dir } = npc;
  const cx = x + w / 2;
  const walking = (npc as NPC).behavior === 'patrol';
  const bob = walking ? Math.sin(time * 8) * 1 : 0;
  const s = w / 40;

  ctx.save();
  ctx.translate(cx, y + h);
  ctx.scale(s, s);

  // Soft ground shadow
  const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0.18)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(0, -1, 20, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs with gradient
  for (const side of [-1, 1]) {
    const legGrad = ctx.createLinearGradient(side * 3, -20, side * 3, 0);
    legGrad.addColorStop(0, '#1E2D3D');
    legGrad.addColorStop(0.6, '#2C3E50');
    legGrad.addColorStop(1, '#34495E');
    ctx.fillStyle = legGrad;
    ctx.beginPath();
    ctx.moveTo(side * 3 - 4.5, -20);
    ctx.quadraticCurveTo(side * 3 - 5, -10, side * 3 - 5, -2);
    ctx.quadraticCurveTo(side * 3, 0, side * 3 + 5, -2);
    ctx.quadraticCurveTo(side * 3 + 5, -10, side * 3 + 4.5, -20);
    ctx.closePath();
    ctx.fill();
    // Shoe with gradient
    const shoeGrad = ctx.createRadialGradient(side * 3 + dir, -1, 0, side * 3 + dir, 0, 8);
    shoeGrad.addColorStop(0, '#444');
    shoeGrad.addColorStop(1, '#222');
    ctx.fillStyle = shoeGrad;
    ctx.beginPath();
    ctx.ellipse(side * 3 + dir * 1, 0, 7.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Shoe sole
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(side * 3 + dir * 1, 2.5, 7, 1.5, 0, 0, Math.PI);
    ctx.fill();
  }

  // Body — broader shoulders, gradient shirt
  const bodyGrad = ctx.createLinearGradient(-15, -46 + bob, 15, -20);
  bodyGrad.addColorStop(0, '#252525');
  bodyGrad.addColorStop(0.3, '#1A1A1A');
  bodyGrad.addColorStop(0.7, '#111');
  bodyGrad.addColorStop(1, '#1A1A1A');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-14, -46 + bob);
  ctx.quadraticCurveTo(-17, -38 + bob, -13, -20);
  ctx.lineTo(13, -20);
  ctx.quadraticCurveTo(17, -38 + bob, 14, -46 + bob);
  ctx.closePath();
  ctx.fill();
  // Shirt catch light
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.beginPath();
  ctx.ellipse(dir * 4, -34 + bob, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Shirt wrinkle
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-2, -40 + bob);
  ctx.quadraticCurveTo(-1, -30 + bob, 0, -22);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Collar (round neck showing skin)
  const neckSkinGrad = ctx.createRadialGradient(0, -45 + bob, 0, 0, -45 + bob, 6);
  neckSkinGrad.addColorStop(0, '#FFDCB8');
  neckSkinGrad.addColorStop(1, '#F5D0A5');
  ctx.fillStyle = neckSkinGrad;
  ctx.beginPath();
  ctx.arc(0, -45 + bob, 5.5, 0, Math.PI);
  ctx.fill();
  // Shirt collar V-shape detail
  const neckBottom = -40 + bob;
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-3, neckBottom);
  ctx.lineTo(0, neckBottom + 8);
  ctx.lineTo(3, neckBottom);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Arms with gradient
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 16, -43 + bob);
    // Sleeve gradient
    const slGrad = ctx.createLinearGradient(-4, 0, 4, 12);
    slGrad.addColorStop(0, '#222');
    slGrad.addColorStop(1, '#181818');
    ctx.fillStyle = slGrad;
    ctx.beginPath();
    ctx.moveTo(-4.5, 0);
    ctx.quadraticCurveTo(-5, 6, -4, 12);
    ctx.lineTo(4, 12);
    ctx.quadraticCurveTo(5, 6, 4.5, 0);
    ctx.closePath();
    ctx.fill();
    // Forearm with gradient (muscular)
    const fGrad = ctx.createLinearGradient(0, 12, 0, 23);
    fGrad.addColorStop(0, '#FFDCB8');
    fGrad.addColorStop(0.5, '#FFD8B5');
    fGrad.addColorStop(1, '#F5D0A5');
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.moveTo(-4, 12);
    ctx.quadraticCurveTo(-4.5, 16, -3, 20);
    ctx.quadraticCurveTo(0, 23, 3, 20);
    ctx.quadraticCurveTo(4.5, 16, 4, 12);
    ctx.closePath();
    ctx.fill();
    // Forearm muscle highlight
    ctx.fillStyle = 'rgba(255,220,180,0.12)';
    ctx.beginPath();
    ctx.ellipse(side * 1, 16, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Hand
    const hGrad = ctx.createRadialGradient(0, 22, 0, 0, 22, 5);
    hGrad.addColorStop(0, '#FFDCB8');
    hGrad.addColorStop(1, '#F5D0A5');
    ctx.fillStyle = hGrad;
    ctx.beginPath();
    ctx.arc(0, 22, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Watch on left wrist (detailed)
    if (side === -1) {
      ctx.fillStyle = '#2A2A2A';
      ctx.beginPath();
      ctx.roundRect(-5, 17, 10, 4, 1);
      ctx.fill();
      // Watch face
      const watchGrad = ctx.createLinearGradient(-3.5, 17.5, 3.5, 20.5);
      watchGrad.addColorStop(0, '#D4A860');
      watchGrad.addColorStop(0.5, '#C0A060');
      watchGrad.addColorStop(1, '#A88840');
      ctx.fillStyle = watchGrad;
      ctx.beginPath();
      ctx.roundRect(-3.5, 17.8, 7, 2.5, 0.5);
      ctx.fill();
      // Watch hands
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(0, 19);
      ctx.lineTo(1, 18.5);
      ctx.moveTo(0, 19);
      ctx.lineTo(-0.5, 18.2);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
    ctx.restore();
  }

  // Neck with gradient & shadow
  const neckGrad = ctx.createLinearGradient(-4, -49 + bob, 4, -44 + bob);
  neckGrad.addColorStop(0, '#F5D0A5');
  neckGrad.addColorStop(0.5, '#FFDCB8');
  neckGrad.addColorStop(1, '#F5D0A5');
  ctx.fillStyle = neckGrad;
  ctx.fillRect(-4.5, -49 + bob, 9, 5);
  ctx.fillStyle = 'rgba(160,120,80,0.12)';
  ctx.fillRect(-4.5, -49 + bob, 9, 2);

  // Head with gradient
  const headY = -56 + bob;
  const headGrad = ctx.createRadialGradient(-2, headY - 2, 0, 0, headY, 16);
  headGrad.addColorStop(0, '#FFE4C8');
  headGrad.addColorStop(0.6, '#FFD8B5');
  headGrad.addColorStop(1, '#F5C8A0');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(0, headY, 12.5, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  // Rim light
  ctx.strokeStyle = 'rgba(255,210,170,0.2)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(0, headY, 12.5, Math.PI * 0.3, Math.PI * 0.7);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Ears with shading
  for (const side of [-1, 1]) {
    const earGrad = ctx.createRadialGradient(side * 12.5, headY + 1, 0, side * 12.5, headY + 1, 5);
    earGrad.addColorStop(0, '#FFD8B5');
    earGrad.addColorStop(1, '#F0C8A0');
    ctx.fillStyle = earGrad;
    ctx.beginPath();
    ctx.ellipse(side * 12.5, headY + 1, 3.5, 4.5, side * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F0C8A0';
    ctx.beginPath();
    ctx.ellipse(side * 12.5, headY + 1, 2, 3, side * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hair (dark brown, short — gradient)
  const hairGrad = ctx.createRadialGradient(0, headY - 8, 0, 0, headY - 5, 15);
  hairGrad.addColorStop(0, '#5A3D28');
  hairGrad.addColorStop(0.6, '#4A3020');
  hairGrad.addColorStop(1, '#3A2515');
  ctx.fillStyle = hairGrad;
  ctx.beginPath();
  ctx.arc(0, headY - 5, 13.2, Math.PI * 0.85, Math.PI * 0.15, true);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, headY - 7, 12, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Short sides
  ctx.fillStyle = '#4A3020';
  ctx.beginPath();
  ctx.moveTo(-13, headY - 4);
  ctx.quadraticCurveTo(-14, headY, -13, headY + 2);
  ctx.quadraticCurveTo(-11, headY + 2, -10, headY - 3);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(13, headY - 4);
  ctx.quadraticCurveTo(14, headY, 13, headY + 2);
  ctx.quadraticCurveTo(11, headY + 2, 10, headY - 3);
  ctx.closePath();
  ctx.fill();
  // Hair highlight
  ctx.fillStyle = '#5A3D28';
  ctx.beginPath();
  ctx.arc(2, headY - 9, 4, 0, Math.PI * 2);
  ctx.fill();
  // Hair strand detail
  ctx.strokeStyle = 'rgba(80,50,20,0.15)';
  ctx.lineWidth = 0.4;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-6 + i * 3, headY - 8);
    ctx.quadraticCurveTo(-5 + i * 3, headY - 13, -4 + i * 3, headY - 14);
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  // ---- CLEAN JAW with light stubble shadow ----
  // Jawline definition (subtle shadow)
  ctx.fillStyle = 'rgba(180,150,120,0.08)';
  ctx.beginPath();
  ctx.moveTo(-10, headY + 5);
  ctx.quadraticCurveTo(-9, headY + 10, -5, headY + 12);
  ctx.quadraticCurveTo(0, headY + 13, 5, headY + 12);
  ctx.quadraticCurveTo(9, headY + 10, 10, headY + 5);
  ctx.closePath();
  ctx.fill();
  // Very light 5 o'clock shadow (barely visible)
  ctx.fillStyle = 'rgba(100,70,50,0.04)';
  for (let i = 0; i < 20; i++) {
    const bx = (Math.sin(i * 7.3) * 7);
    const by = headY + 6 + Math.abs(Math.cos(i * 4.1)) * 5;
    ctx.beginPath();
    ctx.arc(bx, by, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Chin dimple
  ctx.fillStyle = 'rgba(180,140,100,0.1)';
  ctx.beginPath();
  ctx.arc(0, headY + 11, 1.5, 0, Math.PI * 2);
  ctx.fill();
  // Chin bottom definition
  ctx.strokeStyle = 'rgba(180,150,120,0.12)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(0, headY + 11, 5, 0.3, Math.PI - 0.3);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Eyes (adult proportions, gradient iris)
  const eyeOff = dir * 1.5;
  const eyeY = headY;

  // Blink animation
  const blinkCycle = Math.sin(time * 0.6);
  const isBlinking = blinkCycle > 0.97;

  for (const side of [-1, 1]) {
    const ex = side * 4 + eyeOff;
    // Eye socket shadow
    ctx.fillStyle = 'rgba(160,120,80,0.08)';
    ctx.beginPath();
    ctx.ellipse(ex, eyeY + 0.5, 4.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isBlinking) {
      // Closed-eye line when blinking
      ctx.strokeStyle = '#3A2010';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ex, eyeY, 3.5, 0.3, Math.PI - 0.3);
      ctx.stroke();
    } else {
    // White with gradient
    const ewGrad = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, 3.5);
    ewGrad.addColorStop(0, '#FFF');
    ewGrad.addColorStop(1, '#F0EDE8');
    ctx.fillStyle = ewGrad;
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, 3.7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Iris gradient (hazel-green — Polish)
    const iGrad = ctx.createRadialGradient(ex + dir * 0.5, eyeY, 0, ex + dir * 0.5, eyeY, 2.2);
    iGrad.addColorStop(0, '#7B9B4A');
    iGrad.addColorStop(0.6, '#5A7A35');
    iGrad.addColorStop(1, '#3E5520');
    ctx.fillStyle = iGrad;
    ctx.beginPath();
    ctx.arc(ex + dir * 0.5, eyeY, 2.1, 0, Math.PI * 2);
    ctx.fill();
    // Pupil
    ctx.fillStyle = '#0A0A0A';
    ctx.beginPath();
    ctx.arc(ex + dir * 0.7, eyeY, 1.1, 0, Math.PI * 2);
    ctx.fill();
    // Highlight
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(ex + dir * 0.1, eyeY - 0.8, 0.8, 0, Math.PI * 2);
    ctx.fill();
    // Upper lid
    ctx.strokeStyle = '#3A2010';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(ex, eyeY - 0.5, 3.5, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    } // end !isBlinking
    // Thick eyebrow (dark, masculine)
    ctx.strokeStyle = '#5A3D28';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(ex, eyeY - 5.5, 5, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    // Eyebrow hair texture
    ctx.strokeStyle = 'rgba(30,15,5,0.15)';
    ctx.lineWidth = 0.3;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(ex - 3 + i * 2, eyeY - 5);
      ctx.lineTo(ex - 2.5 + i * 2, eyeY - 7);
      ctx.stroke();
    }
  }
  ctx.lineWidth = 1;

  // Nose (adult, with bridge)
  ctx.fillStyle = 'rgba(200,160,120,0.15)';
  ctx.beginPath();
  ctx.moveTo(eyeOff * 0.3 - 1, headY - 2);
  ctx.quadraticCurveTo(eyeOff * 0.3, headY + 1, eyeOff * 0.3, headY + 3.5);
  ctx.quadraticCurveTo(eyeOff * 0.3 + 1, headY + 1, eyeOff * 0.3 + 1, headY - 2);
  ctx.stroke();
  const noseGrad = ctx.createRadialGradient(eyeOff * 0.3, headY + 3, 0, eyeOff * 0.3, headY + 3.5, 3);
  noseGrad.addColorStop(0, '#F0B888');
  noseGrad.addColorStop(1, '#DCA070');
  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.arc(eyeOff * 0.3, headY + 3.5, 2.8, 0, Math.PI);
  ctx.fill();
  // Nose highlight
  ctx.fillStyle = 'rgba(255,220,190,0.2)';
  ctx.beginPath();
  ctx.arc(eyeOff * 0.3 - 0.5, headY + 2.5, 1, 0, Math.PI * 2);
  ctx.fill();

  // Nose (adult, prominent)
  const tNoseGrad = ctx.createRadialGradient(eyeOff * 0.3, headY + 3, 0, eyeOff * 0.3, headY + 3.5, 3);
  tNoseGrad.addColorStop(0, '#F0B888');
  tNoseGrad.addColorStop(1, '#DCA070');
  ctx.fillStyle = tNoseGrad;
  ctx.beginPath();
  ctx.arc(eyeOff * 0.3, headY + 3.5, 2.8, 0, Math.PI);
  ctx.fill();
  // Nose bridge shadow
  ctx.fillStyle = 'rgba(200,160,120,0.1)';
  ctx.beginPath();
  ctx.moveTo(eyeOff * 0.3 - 1, headY - 1);
  ctx.quadraticCurveTo(eyeOff * 0.3, headY + 1, eyeOff * 0.3, headY + 3);
  ctx.quadraticCurveTo(eyeOff * 0.3 + 1, headY + 1, eyeOff * 0.3 + 1, headY - 1);
  ctx.fill();
  // Nose highlight
  ctx.fillStyle = 'rgba(255,220,190,0.2)';
  ctx.beginPath();
  ctx.arc(eyeOff * 0.3 - 0.5, headY + 2.5, 1, 0, Math.PI * 2);
  ctx.fill();

  // Subtle smile (Sims-style, clean)
  const tMouthX = eyeOff * 0.2;
  const tMouthY = headY + 7;
  // Upper lip — thin gentle curve
  ctx.strokeStyle = '#B08060';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(tMouthX - 3.2, tMouthY);
  ctx.quadraticCurveTo(tMouthX, tMouthY - 0.8, tMouthX + 3.2, tMouthY);
  ctx.stroke();
  // Lower lip — soft, small
  const tLipGrad = ctx.createRadialGradient(tMouthX, tMouthY + 1.2, 0, tMouthX, tMouthY + 1.2, 2.2);
  tLipGrad.addColorStop(0, '#D8A090');
  tLipGrad.addColorStop(1, '#C89080');
  ctx.fillStyle = tLipGrad;
  ctx.beginPath();
  ctx.ellipse(tMouthX, tMouthY + 1.2, 2.4, 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Gentle smile line
  ctx.strokeStyle = 'rgba(170,110,80,0.35)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(tMouthX, tMouthY + 0.5, 3, 0.15, Math.PI - 0.15);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Cheek blush (subtle, masculine)
  for (const side of [-1, 1]) {
    const chGrad = ctx.createRadialGradient(side * 8, headY + 4, 0, side * 8, headY + 4, 3.5);
    chGrad.addColorStop(0, 'rgba(255, 140, 120, 0.12)');
    chGrad.addColorStop(1, 'rgba(255, 140, 120, 0)');
    ctx.fillStyle = chGrad;
    ctx.beginPath();
    ctx.ellipse(side * 8, headY + 4, 3.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ---- MAMA OLA — long dark brown hair, red top, warm face ----
function drawMamaOla(
  ctx: CanvasRenderingContext2D,
  npc: { x: number; y: number; w: number; h: number; dir: 1 | -1; walking?: boolean; walkFrame?: number },
  time: number,
): void {
  const { x, y, w, h, dir } = npc;
  const cx = x + w / 2;
  const bob = Math.sin(time * 3) * 0.5;
  const s = w / 40;

  ctx.save();
  ctx.translate(cx, y + h);
  ctx.scale(s, s);

  // Soft ground shadow
  const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 17);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0.16)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(0, -1, 17, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (dark jeans, gradient)
  for (const side of [-1, 1]) {
    const legGrad = ctx.createLinearGradient(side * 3, -18, side * 3, 0);
    legGrad.addColorStop(0, '#1E2D3D');
    legGrad.addColorStop(0.6, '#2C3E50');
    legGrad.addColorStop(1, '#34495E');
    ctx.fillStyle = legGrad;
    ctx.beginPath();
    ctx.moveTo(side * 3 - 3.5, -18);
    ctx.quadraticCurveTo(side * 3 - 4, -10, side * 3 - 3.5, -2);
    ctx.quadraticCurveTo(side * 3, 0, side * 3 + 3.5, -2);
    ctx.quadraticCurveTo(side * 3 + 4, -10, side * 3 + 3.5, -18);
    ctx.closePath();
    ctx.fill();
    // Ankle boots with gradient
    const bootGrad = ctx.createRadialGradient(side * 3 + dir, -1, 0, side * 3 + dir, 0, 7);
    bootGrad.addColorStop(0, '#6D4C41');
    bootGrad.addColorStop(1, '#4E342E');
    ctx.fillStyle = bootGrad;
    ctx.beginPath();
    ctx.ellipse(side * 3 + dir * 1, 0, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Boot heel
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(side * 3 - dir * 2, 1.5, 4, 2);
  }

  // Body — red top with gradient (elegant)
  const bodyGrad = ctx.createLinearGradient(-10, -44 + bob, 10, -18);
  bodyGrad.addColorStop(0, '#D13428');
  bodyGrad.addColorStop(0.3, '#C0392B');
  bodyGrad.addColorStop(0.6, '#A93226');
  bodyGrad.addColorStop(1, '#C0392B');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-10, -44 + bob);
  ctx.quadraticCurveTo(-12, -36 + bob, -9, -18);
  ctx.lineTo(9, -18);
  ctx.quadraticCurveTo(12, -36 + bob, 10, -44 + bob);
  ctx.closePath();
  ctx.fill();
  // Fabric catch light
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath();
  ctx.ellipse(dir * 2, -32 + bob, 4, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Fabric wrinkle
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-1, -38 + bob);
  ctx.quadraticCurveTo(0, -30 + bob, 1, -22);
  ctx.stroke();
  ctx.lineWidth = 1;

  // ---- PREGNANCY BELLY (baby bump visible through red top) ----
  // Belly bulge shape
  const bellyGrad2 = ctx.createRadialGradient(dir * 1.5, -26 + bob, 0, dir * 1.5, -26 + bob, 10);
  bellyGrad2.addColorStop(0, '#D83830');
  bellyGrad2.addColorStop(0.6, '#C43428');
  bellyGrad2.addColorStop(1, '#B82E24');
  ctx.fillStyle = bellyGrad2;
  ctx.beginPath();
  ctx.ellipse(dir * 1.5, -25 + bob, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly highlight (round shiny fabric stretch)
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.ellipse(dir * 0.5, -27 + bob, 5, 3.5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Belly contour line (fabric stretching)
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.arc(dir * 1.5, -25 + bob, 8, Math.PI * 0.3, Math.PI * 0.7);
  ctx.stroke();
  ctx.lineWidth = 1;

  // V-neckline with skin gradient
  const neckSkin = ctx.createRadialGradient(0, -42 + bob, 0, 0, -42 + bob, 5);
  neckSkin.addColorStop(0, '#FFDCB8');
  neckSkin.addColorStop(1, '#F5D0A5');
  ctx.fillStyle = neckSkin;
  ctx.beginPath();
  ctx.moveTo(-5, -44 + bob);
  ctx.quadraticCurveTo(0, -39 + bob, 5, -44 + bob);
  ctx.fill();
  // Necklace hint
  ctx.strokeStyle = 'rgba(200,170,120,0.4)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(0, -42 + bob, 4, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Arms with gradient
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 11, -41 + bob);
    // Sleeve gradient
    const slGrad = ctx.createLinearGradient(-3, 0, 3, 10);
    slGrad.addColorStop(0, '#D13428');
    slGrad.addColorStop(1, '#A93226');
    ctx.fillStyle = slGrad;
    ctx.beginPath();
    ctx.moveTo(-3.5, 0);
    ctx.quadraticCurveTo(-3.5, 5, -3, 10);
    ctx.lineTo(3, 10);
    ctx.quadraticCurveTo(3.5, 5, 3.5, 0);
    ctx.closePath();
    ctx.fill();
    // Forearm with gradient
    const fGrad = ctx.createLinearGradient(0, 10, 0, 20);
    fGrad.addColorStop(0, '#FFDCB8');
    fGrad.addColorStop(1, '#F5D0A5');
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.moveTo(-2.5, 10);
    ctx.quadraticCurveTo(-2.5, 16, 0, 20);
    ctx.quadraticCurveTo(2.5, 16, 2.5, 10);
    ctx.closePath();
    ctx.fill();
    // Hand
    const hGrad = ctx.createRadialGradient(0, 20, 0, 0, 20, 4);
    hGrad.addColorStop(0, '#FFDCB8');
    hGrad.addColorStop(1, '#F5D0A5');
    ctx.fillStyle = hGrad;
    ctx.beginPath();
    ctx.arc(0, 20, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Neck with gradient
  const nkGrad = ctx.createLinearGradient(-3, -47 + bob, 3, -43 + bob);
  nkGrad.addColorStop(0, '#F5D0A5');
  nkGrad.addColorStop(0.5, '#FFDCB8');
  nkGrad.addColorStop(1, '#F5D0A5');
  ctx.fillStyle = nkGrad;
  ctx.fillRect(-3, -47 + bob, 6, 4);

  // Head with gradient
  const headY = -54 + bob;
  const headGrad = ctx.createRadialGradient(-2, headY - 2, 0, 0, headY, 15);
  headGrad.addColorStop(0, '#FFE4C8');
  headGrad.addColorStop(0.6, '#FFD8B5');
  headGrad.addColorStop(1, '#F5C8A0');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(0, headY, 12, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  // Rim light
  ctx.strokeStyle = 'rgba(255,220,180,0.2)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(0, headY, 12, Math.PI * 0.3, Math.PI * 0.7);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Long blonde Barbie hair with gradient (key feature — flowing, golden)
  // Hair shadow base
  ctx.fillStyle = '#B89840';
  ctx.beginPath();
  ctx.arc(0, headY - 4, 14, Math.PI * 0.8, Math.PI * 0.2, true);
  ctx.fill();
  // Hair main with gradient (golden blonde)
  const hairGrad = ctx.createRadialGradient(0, headY - 8, 0, 0, headY - 5, 16);
  hairGrad.addColorStop(0, '#F0D870');
  hairGrad.addColorStop(0.4, '#E8C850');
  hairGrad.addColorStop(0.8, '#D4B440');
  hairGrad.addColorStop(1, '#C8A838');
  ctx.fillStyle = hairGrad;
  ctx.beginPath();
  ctx.arc(0, headY - 5, 13.5, Math.PI * 0.8, Math.PI * 0.2, true);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, headY - 7, 13, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair flowing down — left side (long, past shoulders like Barbie)
  const hairLGrad = ctx.createLinearGradient(-14, headY - 3, -10, headY + 30);
  hairLGrad.addColorStop(0, '#E8C850');
  hairLGrad.addColorStop(0.3, '#D8B840');
  hairLGrad.addColorStop(0.6, '#E0C048');
  hairLGrad.addColorStop(1, '#D4B440');
  ctx.fillStyle = hairLGrad;
  ctx.beginPath();
  ctx.moveTo(-13, headY - 3);
  ctx.quadraticCurveTo(-16, headY + 12, -14, headY + 30);
  ctx.quadraticCurveTo(-11, headY + 33, -7, headY + 28);
  ctx.quadraticCurveTo(-8, headY + 5, -12, headY - 3);
  ctx.closePath();
  ctx.fill();
  // Hair flowing down — right side (long, past shoulders)
  const hairRGrad = ctx.createLinearGradient(14, headY - 3, 10, headY + 30);
  hairRGrad.addColorStop(0, '#E8C850');
  hairRGrad.addColorStop(0.3, '#D8B840');
  hairRGrad.addColorStop(0.6, '#E0C048');
  hairRGrad.addColorStop(1, '#D4B440');
  ctx.fillStyle = hairRGrad;
  ctx.beginPath();
  ctx.moveTo(13, headY - 3);
  ctx.quadraticCurveTo(16, headY + 12, 14, headY + 30);
  ctx.quadraticCurveTo(11, headY + 33, 7, headY + 28);
  ctx.quadraticCurveTo(8, headY + 5, 12, headY - 3);
  ctx.closePath();
  ctx.fill();

  // Blonde highlights (bright shine)
  ctx.fillStyle = '#F5E080';
  ctx.beginPath();
  ctx.arc(-4, headY - 9, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(4, headY - 8, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Bright platinum highlight
  ctx.fillStyle = 'rgba(255,240,160,0.4)';
  ctx.beginPath();
  ctx.arc(0, headY - 10, 5, 0, Math.PI * 2);
  ctx.fill();
  // Hair strand lines (golden)
  ctx.strokeStyle = 'rgba(200,170,60,0.15)';
  ctx.lineWidth = 0.4;
  // Left strand lines
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-13 + i * 0.5, headY + i * 2);
    ctx.quadraticCurveTo(-14 + i * 0.3, headY + 12 + i * 2, -13 + i * 0.5, headY + 26 + i);
    ctx.stroke();
  }
  // Right strand lines
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(13 - i * 0.5, headY + i * 2);
    ctx.quadraticCurveTo(14 - i * 0.3, headY + 12 + i * 2, 13 - i * 0.5, headY + 26 + i);
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  // Ears (partially hidden by hair)
  ctx.fillStyle = '#FFDCB8';
  ctx.beginPath();
  ctx.ellipse(-12, headY + 1, 2.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Earrings (small gold hoops)
  for (const eSide of [-1, 1]) {
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(eSide * 14, headY + 1 + 3, 2.5, 0, Math.PI);
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  // Eyes (warm, with lashes — more detail)
  const eyeOff = dir * 1.5;
  const eyeY = headY;

  // Blink animation (slightly offset from Tata)
  const blinkCycle = Math.sin(time * 0.55 + 1.5);
  const isBlinking = blinkCycle > 0.97;

  for (const side of [-1, 1]) {
    const ex = side * 4 + eyeOff;
    // Eye socket shadow
    ctx.fillStyle = 'rgba(180,150,120,0.06)';
    ctx.beginPath();
    ctx.ellipse(ex, eyeY + 0.5, 4.5, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isBlinking) {
      // Closed-eye line when blinking
      ctx.strokeStyle = '#4A3520';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ex, eyeY, 3.5, 0.3, Math.PI - 0.3);
      ctx.stroke();
      // Eyelash line on top of closed eye
      ctx.strokeStyle = '#4A3520';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(ex, eyeY - 0.5, 3.8, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
    } else {
    // White with gradient
    const ewGrad = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, 3.5);
    ewGrad.addColorStop(0, '#FFF');
    ewGrad.addColorStop(1, '#F0EDE8');
    ctx.fillStyle = ewGrad;
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, 3.7, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Iris gradient (green — European woman)
    const iGrad = ctx.createRadialGradient(ex + dir * 0.5, eyeY, 0, ex + dir * 0.5, eyeY, 2.2);
    iGrad.addColorStop(0, '#5FAA6A');
    iGrad.addColorStop(0.6, '#408850');
    iGrad.addColorStop(1, '#2A6638');
    ctx.fillStyle = iGrad;
    ctx.beginPath();
    ctx.arc(ex + dir * 0.5, eyeY, 2.1, 0, Math.PI * 2);
    ctx.fill();
    // Pupil
    ctx.fillStyle = '#0A0A0A';
    ctx.beginPath();
    ctx.arc(ex + dir * 0.6, eyeY, 1.1, 0, Math.PI * 2);
    ctx.fill();
    // Highlights
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(ex + dir * 0.1, eyeY - 0.7, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex + dir * 1, eyeY + 0.5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Eyelashes (longer, more feminine)
    ctx.strokeStyle = '#4A3520';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(ex, eyeY - 1, 4, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    // Individual lash detail
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(ex - 3.5, eyeY - 2.5);
    ctx.lineTo(ex - 4.2, eyeY - 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ex + 3.5, eyeY - 2.5);
    ctx.lineTo(ex + 4.2, eyeY - 4);
    ctx.stroke();
    } // end !isBlinking
    // Eyebrow (thinner, blonde arched)
    ctx.strokeStyle = '#C4A050';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(ex, eyeY - 5.5, 5.5, Math.PI * 1.22, Math.PI * 1.78);
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  // Nose (delicate)
  const noseGrad = ctx.createRadialGradient(eyeOff * 0.3, headY + 3.5, 0, eyeOff * 0.3, headY + 4, 2.5);
  noseGrad.addColorStop(0, '#FFDCB8');
  noseGrad.addColorStop(1, '#F5C8A0');
  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.arc(eyeOff * 0.3, headY + 4, 2, 0, Math.PI);
  ctx.fill();
  // Nose highlight
  ctx.fillStyle = 'rgba(255,220,190,0.25)';
  ctx.beginPath();
  ctx.arc(eyeOff * 0.3 - 0.5, headY + 3, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Subtle smile with delicate lips (Sims/Barbie style)
  const mMouthX = eyeOff * 0.3;
  const mMouthY = headY + 7;
  // Upper lip — cupid's bow, thin
  ctx.strokeStyle = '#C07060';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(mMouthX - 3, mMouthY);
  ctx.quadraticCurveTo(mMouthX - 1.5, mMouthY - 0.5, mMouthX, mMouthY + 0.3);
  ctx.quadraticCurveTo(mMouthX + 1.5, mMouthY - 0.5, mMouthX + 3, mMouthY);
  ctx.stroke();
  // Lower lip — small, rosy
  const mLipGrad = ctx.createRadialGradient(mMouthX, mMouthY + 1.3, 0, mMouthX, mMouthY + 1.3, 2);
  mLipGrad.addColorStop(0, '#D87878');
  mLipGrad.addColorStop(1, '#C86868');
  ctx.fillStyle = mLipGrad;
  ctx.beginPath();
  ctx.ellipse(mMouthX, mMouthY + 1.3, 2.2, 1.0, 0, 0, Math.PI * 2);
  ctx.fill();
  // Gentle smile curve
  ctx.strokeStyle = 'rgba(180,100,80,0.3)';
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.arc(mMouthX, mMouthY + 0.5, 2.6, 0.2, Math.PI - 0.2);
  ctx.stroke();
  // Lip shine
  ctx.fillStyle = 'rgba(255,200,200,0.15)';
  ctx.beginPath();
  ctx.ellipse(mMouthX - 0.5, mMouthY + 1, 1, 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 1;

  // Blush (soft gradient)
  for (const side of [-1, 1]) {
    const cheekGrad = ctx.createRadialGradient(side * 7, headY + 4, 0, side * 7, headY + 4, 4);
    cheekGrad.addColorStop(0, 'rgba(255, 130, 110, 0.2)');
    cheekGrad.addColorStop(1, 'rgba(255, 130, 110, 0)');
    ctx.fillStyle = cheekGrad;
    ctx.beginPath();
    ctx.ellipse(side * 7, headY + 4, 3.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ---- FRANEK — white Japanese Spitz, fluffy, pointy ears ----
function drawFranekDog(
  ctx: CanvasRenderingContext2D,
  npc: NPC,
  time: number,
): void {
  const cx = npc.x + npc.w / 2;
  const cy = npc.y + npc.h / 2;
  const dir = npc.dir;
  const tailWag = Math.sin(time * 6) * 0.5;
  const breathe = Math.sin(time * 3) * 0.5;
  const earTwitch = Math.sin(time * 2.3) * 0.05;
  const s = npc.w / 40;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  // Soft shadow
  const shadowGrad = ctx.createRadialGradient(0, npc.h / 2 / s, 0, 0, npc.h / 2 / s, 22);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0.14)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(0, npc.h / 2 - 2, 22, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail (fluffy, curled up, with gradient)
  ctx.save();
  ctx.translate(-dir * 16, -4);
  ctx.rotate(-dir * (0.6 + tailWag));
  const tailGrad = ctx.createRadialGradient(0, -8, 0, 0, -8, 12);
  tailGrad.addColorStop(0, '#FFFFFF');
  tailGrad.addColorStop(0.6, '#FAFAFA');
  tailGrad.addColorStop(1, '#E8E8E8');
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.ellipse(0, -8, 7, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Tail fluff layers
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(-1, -14, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F0F0F0';
  ctx.beginPath();
  ctx.arc(2, -5, 4.5, 0, Math.PI * 2);
  ctx.fill();
  // Tail fur texture
  ctx.strokeStyle = 'rgba(220,220,220,0.3)';
  ctx.lineWidth = 0.4;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-2 + i * 1.5, -3);
    ctx.quadraticCurveTo(-1 + i * 1, -10, i * 0.5, -16);
    ctx.stroke();
  }
  ctx.lineWidth = 1;
  ctx.restore();

  // Back legs with gradient
  for (const lx of [-8, 8]) {
    const legGrad = ctx.createLinearGradient(lx, 6, lx, 17);
    legGrad.addColorStop(0, '#F5F5F5');
    legGrad.addColorStop(1, '#E8E8E8');
    ctx.fillStyle = legGrad;
    ctx.beginPath();
    ctx.moveTo(lx - 3.5, 6);
    ctx.quadraticCurveTo(lx - 3.5, 12, lx - 3, 16);
    ctx.quadraticCurveTo(lx, 17.5, lx + 3, 16);
    ctx.quadraticCurveTo(lx + 3.5, 12, lx + 3.5, 6);
    ctx.closePath();
    ctx.fill();
    // Paw with gradient
    const pawGrad = ctx.createRadialGradient(lx, 17, 0, lx, 17, 5);
    pawGrad.addColorStop(0, '#FFF');
    pawGrad.addColorStop(1, '#F0F0F0');
    ctx.fillStyle = pawGrad;
    ctx.beginPath();
    ctx.ellipse(lx, 17, 5, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Toe detail
    ctx.strokeStyle = 'rgba(200,200,200,0.3)';
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.arc(lx - 1.5, 17, 1.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(lx + 1.5, 17, 1.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  // Body (fluffy oval with gradient — main body)
  const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 2, 20);
  bodyGrad.addColorStop(0, '#FFFFFF');
  bodyGrad.addColorStop(0.5, '#FAFAFA');
  bodyGrad.addColorStop(1, '#E8E8E8');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 2 + breathe, 18, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Chest fluff (bright white, more layered)
  const chestGrad = ctx.createRadialGradient(dir * 6, -1, 0, dir * 6, -1, 11);
  chestGrad.addColorStop(0, '#FFFFFF');
  chestGrad.addColorStop(1, '#F5F5F5');
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.ellipse(dir * 6, -1, 10, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body underside shading
  ctx.fillStyle = 'rgba(200,200,200,0.15)';
  ctx.beginPath();
  ctx.ellipse(0, 10, 16, 5, 0, 0, Math.PI);
  ctx.fill();

  // Fluffy texture (more subtle, layered)
  for (let i = 0; i < 10; i++) {
    const fx = (Math.sin(i * 2.3) * 14);
    const fy = (Math.cos(i * 3.1) * 8);
    const furGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 4);
    furGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
    furGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = furGrad;
    ctx.beginPath();
    ctx.arc(fx, fy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head with gradient
  const headGrad = ctx.createRadialGradient(dir * 13, -8, 0, dir * 14, -7, 13);
  headGrad.addColorStop(0, '#FFFFFF');
  headGrad.addColorStop(0.6, '#FAFAFA');
  headGrad.addColorStop(1, '#F0F0F0');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(dir * 14, -7, 11.5, 0, Math.PI * 2);
  ctx.fill();

  // Fluffy cheeks (more defined)
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(dir * 17, -3, 8.5, 0, Math.PI * 2);
  ctx.fill();
  // Cheek fluff detail
  ctx.fillStyle = 'rgba(245,245,245,0.5)';
  ctx.beginPath();
  ctx.arc(dir * 19, -5, 5, 0, Math.PI * 2);
  ctx.fill();

  // Muzzle with gradient
  const muzzleGrad = ctx.createRadialGradient(dir * 21, -4, 0, dir * 21, -4, 6);
  muzzleGrad.addColorStop(0, '#FFFFFF');
  muzzleGrad.addColorStop(1, '#F5F5F5');
  ctx.fillStyle = muzzleGrad;
  ctx.beginPath();
  ctx.ellipse(dir * 21, -4, 6.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ears (pointed Spitz — with gradient and twitch)
  for (const earSide of [0, 1]) {
    const earX = earSide === 0 ? 9 : 16;
    const earTipX = earSide === 0 ? 7 : 19;
    const earBaseX = earSide === 0 ? 14 : 22;
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(earSide === 0 ? -earTwitch : earTwitch);
    // Outer ear
    const earGrad = ctx.createLinearGradient(dir * earTipX, -25, dir * earBaseX, -13);
    earGrad.addColorStop(0, '#F8F8F8');
    earGrad.addColorStop(1, '#FAFAFA');
    ctx.fillStyle = earGrad;
    ctx.beginPath();
    ctx.moveTo(dir * earX, -13);
    ctx.lineTo(dir * earTipX, -26);
    ctx.lineTo(dir * earBaseX, -14);
    ctx.closePath();
    ctx.fill();
    // Inner ear (pink gradient)
    const innerEarGrad = ctx.createLinearGradient(dir * earTipX, -23, dir * earBaseX, -14);
    innerEarGrad.addColorStop(0, '#FFD8D8');
    innerEarGrad.addColorStop(1, '#FFC0C0');
    ctx.fillStyle = innerEarGrad;
    ctx.beginPath();
    ctx.moveTo(dir * (earX + 0.5), -14);
    ctx.lineTo(dir * (earTipX + (earSide === 0 ? 1 : 0)), -23);
    ctx.lineTo(dir * (earBaseX - (earSide === 0 ? 1 : 0.5)), -15);
    ctx.closePath();
    ctx.fill();
    // Ear edge highlight
    ctx.strokeStyle = 'rgba(230,230,230,0.4)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(dir * earX, -13);
    ctx.lineTo(dir * earTipX, -26);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.restore();
  }

  // Eyes (dark, round, expressive — Spitz eyes)
  for (const side of [-1, 1]) {
    const ex = dir * (12 + side * 3.5);
    // Eye socket (darker area around eyes)
    ctx.fillStyle = 'rgba(60,40,20,0.06)';
    ctx.beginPath();
    ctx.arc(ex, -9, 4, 0, Math.PI * 2);
    ctx.fill();
    // Eye with gradient
    const eyeGrad = ctx.createRadialGradient(ex, -9, 0, ex, -9, 3);
    eyeGrad.addColorStop(0, '#3A2A15');
    eyeGrad.addColorStop(0.6, '#2A1A0A');
    eyeGrad.addColorStop(1, '#1A0A00');
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(ex, -9, 3, 0, Math.PI * 2);
    ctx.fill();
    // Eye highlight (larger, more "alive")
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(ex + 0.5, -10.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex - 0.8, -8.5, 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Eye rim
    ctx.strokeStyle = 'rgba(20,10,0,0.15)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(ex, -9, 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  // Nose (black, shiny, more detailed)
  const noseGrad = ctx.createRadialGradient(dir * 23.5, -5.5, 0, dir * 24, -5, 4);
  noseGrad.addColorStop(0, '#333');
  noseGrad.addColorStop(0.5, '#1A1A1A');
  noseGrad.addColorStop(1, '#0A0A0A');
  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.ellipse(dir * 24, -5, 3.8, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nose highlight (wet nose effect)
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.arc(dir * 22.5, -6.5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  // Nostrils
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(dir * 23.5, -4.5, 0.8, 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(dir * 24.5, -4.5, 0.8, 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tongue (visible with panting animation)
  if (Math.sin(time * 0.8) > -0.2) {
    const tongueExt = Math.sin(time * 1.5) * 0.5 + 0.5; // tongue movement
    const tongueGrad = ctx.createLinearGradient(dir * 22, -1, dir * 22, 3 + tongueExt * 2);
    tongueGrad.addColorStop(0, '#F08090');
    tongueGrad.addColorStop(1, '#E07080');
    ctx.fillStyle = tongueGrad;
    ctx.beginPath();
    ctx.ellipse(dir * 22, -0.5 + tongueExt, 2.8, 4 + tongueExt, dir * 0.2, 0, Math.PI);
    ctx.fill();
    // Tongue center line
    ctx.strokeStyle = 'rgba(200,80,80,0.2)';
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(dir * 22, -0.5 + tongueExt);
    ctx.lineTo(dir * 22, 3 + tongueExt);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  // Mouth line
  ctx.strokeStyle = 'rgba(150,150,150,0.4)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(dir * 24, -4.5);
  ctx.quadraticCurveTo(dir * 20, -0.5, dir * 17, -2.5);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Front legs with gradient
  for (const legOff of [8, 14]) {
    const lx = dir * legOff;
    const flegGrad = ctx.createLinearGradient(lx, 6, lx, 17);
    flegGrad.addColorStop(0, '#F5F5F5');
    flegGrad.addColorStop(1, '#EBEBEB');
    ctx.fillStyle = flegGrad;
    ctx.beginPath();
    ctx.moveTo(lx - 3, 6);
    ctx.quadraticCurveTo(lx - 3, 12, lx - 2.5, 16);
    ctx.quadraticCurveTo(lx, 17.5, lx + 2.5, 16);
    ctx.quadraticCurveTo(lx + 3, 12, lx + 3, 6);
    ctx.closePath();
    ctx.fill();
    // Paw
    const fpGrad = ctx.createRadialGradient(lx, 17, 0, lx, 17, 5);
    fpGrad.addColorStop(0, '#FFF');
    fpGrad.addColorStop(1, '#F0F0F0');
    ctx.fillStyle = fpGrad;
    ctx.beginPath();
    ctx.ellipse(lx, 17, 4.5, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  char: { x: number; y: number; w: number; h: number; dir: 1 | -1; walkFrame?: number; walking?: boolean },
  shirtColor: string, hairColor: string, longHair: boolean, time: number,
): void {
  const { x, y, w, h, dir } = char;
  const cx = x + w / 2;
  const walking = char.walking || false;
  const frame = char.walkFrame || 0;
  const bob = walking ? Math.sin(time * 10) * 2 : 0;
  const s = w / 40;

  ctx.save();
  ctx.translate(cx, y + h);
  ctx.scale(s, s);

  // Legs
  const legSpread = walking ? Math.sin(frame * 1.5) * 6 : 0;
  ctx.fillStyle = '#4A4A4A';
  ctx.fillRect(-8 + legSpread, -18, 7, 18);
  ctx.fillRect(1 - legSpread, -18, 7, 18);
  ctx.fillStyle = '#333';
  ctx.fillRect(-9 + legSpread, -2, 9, 4);
  ctx.fillRect(0 - legSpread, -2, 9, 4);

  // Body
  ctx.fillStyle = shirtColor;
  ctx.fillRect(-10, -42 + bob, 20, 26);
  ctx.beginPath();
  ctx.moveTo(-6, -42 + bob);
  ctx.lineTo(0, -38 + bob);
  ctx.lineTo(6, -42 + bob);
  ctx.fill();

  // Arms
  const armSwing = walking ? Math.sin(frame * 1.5) * 8 : 0;
  ctx.fillStyle = shirtColor;
  ctx.save();
  ctx.translate(-12, -38 + bob);
  ctx.rotate(armSwing * 0.05);
  ctx.fillRect(-3, 0, 6, 18);
  ctx.fillStyle = '#FFDCB8';
  ctx.fillRect(-2, 16, 5, 5);
  ctx.restore();
  ctx.save();
  ctx.translate(12, -38 + bob);
  ctx.rotate(-armSwing * 0.05);
  ctx.fillRect(-3, 0, 6, 18);
  ctx.fillStyle = '#FFDCB8';
  ctx.fillRect(-2, 16, 5, 5);
  ctx.restore();

  // Head
  ctx.fillStyle = '#FFDCB8';
  ctx.beginPath(); ctx.arc(0, -50 + bob, 12, 0, Math.PI * 2); ctx.fill();

  // Ears
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#FFDCB8';
    ctx.beginPath();
    ctx.ellipse(side * 12, -50 + bob, 2.5, 3.5, side * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F0C8A0';
    ctx.beginPath();
    ctx.ellipse(side * 12, -50 + bob, 1.5, 2, side * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hair
  ctx.fillStyle = hairColor;
  ctx.beginPath(); ctx.arc(0, -54 + bob, 13, Math.PI, 0); ctx.fill();
  if (longHair) {
    ctx.fillRect(-13, -54 + bob, 4, 22);
    ctx.fillRect(9, -54 + bob, 4, 22);
  }

  // Eyes (detailed — matching main characters)
  const eyeDir = dir === 1 ? 1.5 : -1.5;
  const npcEyeY = -52 + bob;

  // Blink
  const npcBlink = Math.sin(time * 0.65 + 3);
  const npcIsBlinking = npcBlink > 0.97;

  for (const side of [-1, 1]) {
    const ex = side * 4 + eyeDir;

    if (npcIsBlinking) {
      ctx.strokeStyle = '#6A5040';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(ex, npcEyeY, 2.8, 0.3, Math.PI - 0.3);
      ctx.stroke();
    } else {
      // Sclera (white with gradient)
      const ewGrad = ctx.createRadialGradient(ex, npcEyeY, 0, ex, npcEyeY, 3.2);
      ewGrad.addColorStop(0, '#FFF');
      ewGrad.addColorStop(1, '#F0EDE8');
      ctx.fillStyle = ewGrad;
      ctx.beginPath();
      ctx.ellipse(ex, npcEyeY, 3.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Outline
      ctx.strokeStyle = 'rgba(120,90,60,0.2)';
      ctx.lineWidth = 0.4;
      ctx.stroke();
      // Iris (brown)
      const iGrad = ctx.createRadialGradient(ex + dir * 0.5, npcEyeY, 0, ex + dir * 0.5, npcEyeY, 1.8);
      iGrad.addColorStop(0, '#8B6B4A');
      iGrad.addColorStop(0.6, '#6B4B2A');
      iGrad.addColorStop(1, '#4B3B1A');
      ctx.fillStyle = iGrad;
      ctx.beginPath();
      ctx.arc(ex + dir * 0.5, npcEyeY, 1.8, 0, Math.PI * 2);
      ctx.fill();
      // Pupil
      ctx.fillStyle = '#0A0A0A';
      ctx.beginPath();
      ctx.arc(ex + dir * 0.6, npcEyeY, 0.9, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(ex + dir * 0.1, npcEyeY - 0.6, 0.7, 0, Math.PI * 2);
      ctx.fill();
      // Upper lid
      ctx.strokeStyle = '#6A5040';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(ex, npcEyeY - 0.3, 3.2, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }
    // Eyebrow
    ctx.strokeStyle = hairColor === '#333' ? '#3A2A1A' : hairColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ex, npcEyeY - 5, 4.5, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  // Nose
  ctx.fillStyle = 'rgba(240,190,150,0.5)';
  ctx.beginPath();
  ctx.arc(eyeDir * 0.3, -47 + bob, 1.8, 0, Math.PI);
  ctx.fill();

  // Subtle smile (delicate, Sims-style)
  const gMx = eyeDir * 0.3;
  const gMy = -44 + bob;
  ctx.strokeStyle = '#B08060';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(gMx - 2.8, gMy);
  ctx.quadraticCurveTo(gMx, gMy - 0.7, gMx + 2.8, gMy);
  ctx.stroke();
  // Lower lip — small
  ctx.fillStyle = 'rgba(210,140,120,0.35)';
  ctx.beginPath();
  ctx.ellipse(gMx, gMy + 1, 2, 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  // Gentle smile curve
  ctx.strokeStyle = 'rgba(170,110,80,0.25)';
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.arc(gMx, gMy + 0.3, 2.5, 0.15, Math.PI - 0.15);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Cheeks (gradient blush)
  for (const side of [-1, 1]) {
    const chGrad = ctx.createRadialGradient(side * 7, -48 + bob, 0, side * 7, -48 + bob, 3.5);
    chGrad.addColorStop(0, 'rgba(255, 140, 130, 0.25)');
    chGrad.addColorStop(1, 'rgba(255, 140, 130, 0)');
    ctx.fillStyle = chGrad;
    ctx.beginPath();
    ctx.ellipse(side * 7, -48 + bob, 3.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ---- Draw costume items on player ----
function drawPlayerCostumes(ctx: CanvasRenderingContext2D, state: GameState): void {
  const p = state.player;
  const cx = p.x + p.w / 2;
  const s = p.w / 40; // match drawKuba scale (52/40 = 1.3)
  const bob = p.walking ? Math.sin(state.time * 10) * 1.5 * s : 0;
  // Kuba's head center is at local Y=-52 → world = feet - 52*s
  const feetY = p.y + p.h;
  const headCenterY = feetY - 52 * s + bob;
  const neckY = feetY - 44 * s + bob;
  const shoulderY = feetY - 40 * s + bob;

  // Hat — sits on top of head (above head center)
  const hatId = p.equippedCostumes.hat;
  if (hatId) {
    const costume = state.costumes.find(c => c.id === hatId);
    if (costume) drawHat(ctx, cx, headCenterY, p.dir, costume, s);
  }

  // Glasses — at eye level (head center, slightly above)
  const glassesId = p.equippedCostumes.glasses;
  if (glassesId) {
    const costume = state.costumes.find(c => c.id === glassesId);
    if (costume) drawGlasses(ctx, cx, headCenterY + 2 * s, p.dir, costume, s);
  }

  // Cape — attached at shoulders
  const capeId = p.equippedCostumes.cape;
  if (capeId) {
    const costume = state.costumes.find(c => c.id === capeId);
    if (costume) drawCape(ctx, cx, shoulderY, p.dir, costume, state.time, s);
  }

  // Accessory — scarf at neck, others at hand level
  const accId = p.equippedCostumes.accessory;
  if (accId) {
    const costume = state.costumes.find(c => c.id === accId);
    if (costume) {
      const accY = costume.id === 'acc_scarf' ? neckY : feetY - 25 * s + bob;
      drawAccessory(ctx, cx, accY, p.dir, costume, state.time, s);
    }
  }
}

function drawHat(ctx: CanvasRenderingContext2D, cx: number, headY: number, dir: number, costume: CostumeItem, sc: number = 1): void {
  ctx.save();
  ctx.translate(cx, headY);
  ctx.scale(sc, sc);

  switch (costume.id) {
    case 'hat_pirate':
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.moveTo(-14, -6);
      ctx.quadraticCurveTo(0, -22, 14, -6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FFD700';
      ctx.font = '8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('☠️', 0, -9);
      ctx.textAlign = 'left';
      break;
    case 'hat_crown':
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(-10, -12, 20, 10);
      ctx.beginPath();
      ctx.moveTo(-10, -12); ctx.lineTo(-8, -18); ctx.lineTo(-4, -12);
      ctx.lineTo(0, -20); ctx.lineTo(4, -12);
      ctx.lineTo(8, -18); ctx.lineTo(10, -12);
      ctx.fill();
      ctx.fillStyle = '#E53935'; ctx.beginPath(); ctx.arc(0, -7, 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2196F3'; ctx.beginPath(); ctx.arc(-6, -7, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4CAF50'; ctx.beginPath(); ctx.arc(6, -7, 1.5, 0, Math.PI * 2); ctx.fill();
      break;
    case 'hat_wizard':
      ctx.fillStyle = '#7B1FA2';
      ctx.beginPath();
      ctx.moveTo(-14, -4);
      ctx.lineTo(0, -30);
      ctx.lineTo(14, -4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FFD700';
      ctx.font = '8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('⭐', 0, -12); ctx.textAlign = 'left';
      ctx.fillRect(-14, -6, 28, 4);
      break;
    case 'hat_cowboy':
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(-8, -10, 16, 8);
      ctx.beginPath();
      ctx.ellipse(0, -4, 18, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'hat_chef':
      ctx.fillStyle = '#FFF';
      ctx.fillRect(-10, -8, 20, 6);
      ctx.beginPath(); ctx.arc(0, -12, 12, 0, Math.PI * 2); ctx.fill();
      break;
    case 'hat_beanie': {
      // Blue beanie sitting on top of head
      const headR = 13;
      ctx.fillStyle = costume.color;
      ctx.beginPath();
      ctx.ellipse(0, -10, headR + 2, headR * 0.6, 0, Math.PI, 0);
      ctx.fill();
      // Folded brim at hairline
      ctx.fillStyle = '#1976D2';
      ctx.fillRect(-headR - 1, -10, headR * 2 + 2, 5);
      // Ribbed texture lines on beanie
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 0.5;
      for (let i = -8; i <= 8; i += 4) {
        ctx.beginPath();
        ctx.moveTo(i, -10);
        ctx.quadraticCurveTo(i * 0.9, -16, i * 0.5, -18);
        ctx.stroke();
      }
      // Pom-pom
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, -18, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(200,200,200,0.5)';
      ctx.beginPath();
      ctx.arc(-1, -19, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  void dir;
  ctx.restore();
}

function drawGlasses(ctx: CanvasRenderingContext2D, cx: number, headY: number, dir: number, costume: CostumeItem, sc: number = 1): void {
  ctx.save();
  ctx.translate(cx + dir * 2 * sc, headY);
  ctx.scale(sc, sc);

  switch (costume.id) {
    case 'glasses_cool':
      ctx.fillStyle = '#333';
      ctx.fillRect(-10, -2, 8, 5);
      ctx.fillRect(2, -2, 8, 5);
      ctx.fillRect(-2, -1, 4, 2);
      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(-9, -1, 3, 2);
      ctx.fillRect(3, -1, 3, 2);
      break;
    case 'glasses_heart':
      ctx.fillStyle = '#E91E63';
      // Left heart
      ctx.beginPath(); ctx.arc(-6, -1, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-2, -1, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-4, 5); ctx.lineTo(2, 0); ctx.fill();
      // Right heart
      ctx.beginPath(); ctx.arc(6, -1, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(10, -1, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(8, 5); ctx.lineTo(14, 0); ctx.fill();
      break;
    case 'glasses_star':
      ctx.fillStyle = '#FFD700';
      ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('⭐', -5, 3);
      ctx.fillText('⭐', 5, 3);
      ctx.textAlign = 'left';
      ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(1, 0); ctx.stroke();
      ctx.lineWidth = 1;
      break;
    case 'glasses_round': {
      // Round wire-frame glasses (brown)
      const rr = 5;
      const eyeY = 0.5;
      ctx.strokeStyle = costume.color;
      ctx.lineWidth = 1.2;
      for (const ex of [-6, 6]) {
        ctx.beginPath();
        ctx.arc(ex, eyeY, rr, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Bridge
      ctx.beginPath();
      ctx.moveTo(-1, eyeY);
      ctx.lineTo(1, eyeY);
      ctx.stroke();
      // Temples (arms going to ears)
      ctx.beginPath();
      ctx.moveTo(-11, eyeY);
      ctx.lineTo(-14, eyeY + 2);
      ctx.moveTo(11, eyeY);
      ctx.lineTo(14, eyeY + 2);
      ctx.stroke();
      ctx.lineWidth = 1;
      break;
    }
  }

  ctx.restore();
}

function drawCape(ctx: CanvasRenderingContext2D, cx: number, bodyY: number, dir: number, costume: CostumeItem, time: number, sc: number = 1): void {
  ctx.save();
  ctx.translate(cx - dir * 8 * sc, bodyY);
  ctx.scale(sc, sc);

  const flutter = Math.sin(time * 5) * 3;
  ctx.fillStyle = costume.color;
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.quadraticCurveTo(-dir * 15 + flutter, 10, -dir * 12, 28);
  ctx.lineTo(-dir * 2, 25);
  ctx.lineTo(0, -5);
  ctx.closePath();
  ctx.fill();

  // Cape edge highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.quadraticCurveTo(-dir * 15 + flutter, 10, -dir * 12, 28);
  ctx.stroke();
  ctx.lineWidth = 1;

  ctx.restore();
}

function drawAccessory(ctx: CanvasRenderingContext2D, cx: number, anchorY: number, dir: number, costume: CostumeItem, time: number, sc: number = 1): void {
  ctx.save();

  const swing = Math.sin(time * 3) * 5;

  switch (costume.id) {
    case 'acc_sword':
      ctx.translate(cx + dir * 15 * sc, anchorY);
      ctx.scale(sc, sc);
      ctx.save();
      ctx.rotate(dir * (-0.3 + swing * 0.02));
      ctx.fillStyle = '#9E9E9E';
      ctx.fillRect(-1.5, -25, 3, 20);
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(-4, -6, 8, 4);
      ctx.fillStyle = '#FFD700';
      ctx.beginPath(); ctx.arc(0, -4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      break;
    case 'acc_wand':
      ctx.translate(cx + dir * 15 * sc, anchorY);
      ctx.scale(sc, sc);
      ctx.save();
      ctx.rotate(dir * (-0.2 + swing * 0.03));
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(-1.5, -22, 3, 18);
      ctx.fillStyle = '#FFD700';
      ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('✨', 0, -22);
      ctx.textAlign = 'left';
      ctx.restore();
      break;
    case 'acc_scarf': {
      // Scarf wraps around neck (anchorY = neckY for scarf)
      ctx.translate(cx, anchorY);
      ctx.scale(sc, sc);
      // Wrap around neck
      ctx.fillStyle = costume.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Front knot
      ctx.fillStyle = '#E64A19';
      ctx.beginPath();
      ctx.ellipse(dir * 4, 2, 3, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Hanging tail (animated)
      const scarfSway = Math.sin(time * 3) * 2;
      ctx.fillStyle = costume.color;
      ctx.beginPath();
      ctx.moveTo(dir * 3, 3);
      ctx.quadraticCurveTo(dir * 10 + scarfSway, 12, dir * 7 + scarfSway, 20);
      ctx.quadraticCurveTo(dir * 3, 16, dir * 1, 3);
      ctx.fill();
      // Second tail (slightly behind)
      ctx.fillStyle = '#E64A19';
      ctx.beginPath();
      ctx.moveTo(dir * 5, 3);
      ctx.quadraticCurveTo(dir * 13 + scarfSway * 0.7, 10, dir * 9 + scarfSway * 0.5, 16);
      ctx.quadraticCurveTo(dir * 5, 12, dir * 3, 3);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

// ---- Particles ----
function renderParticles(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const p of state.particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;

    if (p.emoji) {
      ctx.font = `${p.size * 2}px sans-serif`;
      ctx.textAlign = 'center';
      if (p.rotation !== undefined) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(p.emoji, p.x, p.y);
      }
      ctx.textAlign = 'left';
    } else if (p.type === 'trail') {
      // Rainbow trail
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha * 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// ---- Weather (back layer - behind house) ----
function renderWeatherBack(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.weather === 'rainy') {
    ctx.strokeStyle = 'rgba(144,202,249,0.4)'; ctx.lineWidth = 1;
    for (const p of state.weatherParticles) {
      if (p.type === 'rain') {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 1, p.y + 6);
        ctx.stroke();
      }
    }
    ctx.lineWidth = 1;
  }
}

// ---- Weather (front layer - snow/leaves in front of everything) ----
function renderWeatherFront(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const p of state.weatherParticles) {
    const alpha = Math.min(1, p.life / 2);
    ctx.globalAlpha = alpha;

    if (p.type === 'snow') {
      ctx.fillStyle = '#FFF';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    } else if (p.type === 'leaf') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation || 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Leaf vein
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(-p.size, 0); ctx.lineTo(p.size, 0); ctx.stroke();
      ctx.lineWidth = 1;
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
}

// ---- Floating texts ----
function renderFloatingTexts(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const ft of state.floatingTexts) {
    const alpha = ft.life / ft.maxLife;
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${ft.size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText(ft.text, ft.x + 1, ft.y + 1); // shadow
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.textAlign = 'left';
  }
  ctx.globalAlpha = 1;
}

// ---- Quest Pointer ----
function renderQuestPointer(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!state.questPointer) return;
  const { x, y, label } = state.questPointer;
  const bounce = Math.sin(state.time * 4) * 5;

  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(x, y + bounce + 10);
  ctx.lineTo(x - 8, y + bounce);
  ctx.lineTo(x + 8, y + bounce);
  ctx.closePath();
  ctx.fill();

  // Glow
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 8;
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y + bounce - 5);
  ctx.textAlign = 'left';
  ctx.shadowBlur = 0;
}

// ---- Courier Package ----
// ---- Climbable surface indicators (arrows on trees, poles) ----
function renderClimbableIndicators(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!state.climbables) return;
  const { player } = state;
  const px = player.x + player.w / 2;

  for (const cl of state.climbables) {
    const cx = cl.x + cl.w / 2;
    const dist = Math.abs(px - cx);

    // Only show indicator when player is close
    if (dist < 60) {
      const alpha = Math.max(0, 1 - dist / 60);
      const bob = Math.sin(state.time * 3) * 3;

      ctx.save();
      ctx.globalAlpha = alpha * 0.8;

      // Up arrow indicator
      ctx.fillStyle = '#FFD700';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⬆', cx, cl.topY - 5 + bob);

      // Label
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#FFF';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeText(cl.label, cx, cl.topY - 18 + bob);
      ctx.fillText(cl.label, cx, cl.topY - 18 + bob);

      // Glowing dots along the climbable surface
      const segments = Math.floor((cl.bottomY - cl.topY) / 30);
      for (let i = 0; i <= segments; i++) {
        const dotY = cl.topY + i * 30;
        const dotBob = Math.sin(state.time * 2 + i) * 2;
        ctx.beginPath();
        ctx.arc(cx, dotY + dotBob, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(state.time * 3 + i) * 0.3})`;
        ctx.fill();
      }

      ctx.restore();
    }
  }
}

// ---- RC Car rendering ----
function renderRCCar(ctx: CanvasRenderingContext2D, state: GameState): void {
  const rc = state.rcCar;
  if (!rc || !rc.active) return;

  // RC car is on ground level
  const groundY = 556; // same as floor1
  const carW = 30;
  const carH = 18;
  const x = rc.x;
  const y = groundY - carH;

  ctx.save();

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(x + carW / 2, groundY, carW / 2 + 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Car body
  const bodyGrad = ctx.createLinearGradient(x, y, x, y + carH);
  bodyGrad.addColorStop(0, rc.color);
  bodyGrad.addColorStop(1, adjustColor(rc.color, -30));
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(x, y + 4, carW, carH - 4, 3);
  ctx.fill();

  // Car roof
  ctx.fillStyle = rc.color;
  ctx.beginPath();
  ctx.roundRect(x + 6, y, carW - 12, 8, 2);
  ctx.fill();

  // Windows
  ctx.fillStyle = '#B0E0E6';
  ctx.fillRect(x + 8, y + 1, 5, 5);
  ctx.fillRect(x + 17, y + 1, 5, 5);

  // Wheels
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x + 7, groundY - 1, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + carW - 7, groundY - 1, 4, 0, Math.PI * 2);
  ctx.fill();

  // Wheel rims
  ctx.fillStyle = '#888';
  ctx.beginPath();
  ctx.arc(x + 7, groundY - 1, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + carW - 7, groundY - 1, 2, 0, Math.PI * 2);
  ctx.fill();

  // Headlights
  const frontX = rc.dir === 1 ? x + carW - 2 : x;
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(frontX, y + 10, 2, 0, Math.PI * 2);
  ctx.fill();

  // RC antenna
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + carW / 2, y);
  ctx.lineTo(x + carW / 2 + rc.dir * 3, y - 8);
  ctx.stroke();
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.arc(x + carW / 2 + rc.dir * 3, y - 8, 2, 0, Math.PI * 2);
  ctx.fill();

  // Control mode indicator
  if (rc.controlMode) {
    ctx.fillStyle = '#FFD700';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎮', x + carW / 2, y - 14);
  }

  ctx.restore();
}

// Helper: darken/lighten a hex color
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xFF) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return `rgb(${r},${g},${b})`;
}

function renderCourierPackage(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!state.courierPackage || state.courierPackage.collected) return;

  const pkg = state.courierPackage;
  const bounce = Math.sin(state.time * 3) * 2;

  // Package box
  const bx = pkg.x;
  const by = pkg.y + bounce;

  // Box shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(bx + 12, pkg.y + 24, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Box body (brown cardboard)
  const boxGrad = ctx.createLinearGradient(bx, by, bx + 24, by + 24);
  boxGrad.addColorStop(0, '#C4A26E');
  boxGrad.addColorStop(0.5, '#B8944C');
  boxGrad.addColorStop(1, '#A07830');
  ctx.fillStyle = boxGrad;
  ctx.beginPath();
  ctx.roundRect(bx, by, 24, 20, 2);
  ctx.fill();

  // Box flaps (top)
  ctx.fillStyle = '#C4A26E';
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + 6, by - 4);
  ctx.lineTo(bx + 12, by);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bx + 12, by);
  ctx.lineTo(bx + 18, by - 4);
  ctx.lineTo(bx + 24, by);
  ctx.fill();

  // Tape strips
  ctx.strokeStyle = '#E8D088';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bx + 12, by - 3);
  ctx.lineTo(bx + 12, by + 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bx + 2, by + 10);
  ctx.lineTo(bx + 22, by + 10);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Glowing hint arrow
  const arrowBounce = Math.sin(state.time * 5) * 3;
  ctx.fillStyle = 'rgba(255,215,0,0.8)';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📦', bx + 12, by - 10 + arrowBounce);
  ctx.textAlign = 'left';

  // "E" hint if player is close
  const px = state.player.x + state.player.w / 2;
  if (Math.abs(px - (bx + 12)) < 60) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Podejdź!', bx + 12, by - 22);
    ctx.textAlign = 'left';
  }
}

// ---- Doorbell notification (rendered in HUD space, not camera space) ----
function renderDoorbellNotification(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!state.doorbellActive) return;

  const pulse = Math.sin(state.time * 4) * 0.3 + 0.7;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = 'rgba(255,180,0,0.9)';
  ctx.beginPath();
  ctx.roundRect(CANVAS_W / 2 - 100, CANVAS_H - 100, 200, 36, 10);
  ctx.fill();
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText('🔔 Paczka przy drzwiach!', CANVAS_W / 2, CANVAS_H - 77);
  ctx.textAlign = 'left';
  ctx.restore();
}

// ---- HUD ----
function renderHUD(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.phase === 'start') return;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  const barH = 44;
  ctx.beginPath(); ctx.roundRect(10, 8, CANVAS_W - 20, barH, 12); ctx.fill();

  // Stars
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.textBaseline = 'middle';
  const starStr = '⭐'.repeat(state.stars) + '☆'.repeat(Math.max(0, state.totalStarsAvailable - state.stars));
  ctx.fillText(starStr, 22, 30);

  // Score
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#FFF';
  ctx.fillText(`${state.score} pkt`, 22 + state.totalStarsAvailable * 22 + 10, 30);

  // Quest info
  const quest = state.quests.find(q => q.active && !q.completed);
  if (quest) {
    const step = quest.steps[quest.currentStep];
    if (step) {
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#FFF';
      ctx.textAlign = 'right';
      let questText = `${step.icon} ${step.description}`;
      if (step.type === 'collect' && step.targetCount) {
        questText += ` (${step.currentCount || 0}/${step.targetCount})`;
      }
      ctx.fillText(questText, CANVAS_W - 22, 30);
      ctx.textAlign = 'left';
    }
  }

  // Quest progress bar
  const completedQuests = state.quests.filter(q => q.completed).length;
  const totalQuests = state.quests.length;
  const progressW = 100;
  const progressX = CANVAS_W / 2 - progressW / 2;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.roundRect(progressX, 18, progressW, 8, 4); ctx.fill();
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath(); ctx.roundRect(progressX, 18, progressW * (completedQuests / totalQuests), 8, 4); ctx.fill();
  ctx.font = '9px sans-serif'; ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
  ctx.fillText(`${completedQuests}/${totalQuests}`, progressX + progressW / 2, 36);
  ctx.textAlign = 'left';

  // Inventory
  const invItems = Object.entries(state.inventory).filter(([, v]) => v > 0);
  if (invItems.length > 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    const invW = invItems.length * 45 + 10;
    ctx.beginPath(); ctx.roundRect(CANVAS_W / 2 - invW / 2, CANVAS_H - 50, invW, 42, 10); ctx.fill();

    invItems.forEach(([type, count], i) => {
      const ix = CANVAS_W / 2 - invW / 2 + 15 + i * 45;
      ctx.font = '18px sans-serif';
      ctx.fillText(ITEM_EMOJIS[type] || '📦', ix, CANVAS_H - 22);
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#FFF';
      ctx.fillText(`×${count}`, ix + 20, CANVAS_H - 22);
    });
  }

  // RC Car indicator
  if (state.rcCar && state.rcCar.active) {
    ctx.fillStyle = state.rcCar.controlMode ? 'rgba(255, 215, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath(); ctx.roundRect(10, CANVAS_H - 50, 90, 30, 8); ctx.fill();
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#FFF';
    ctx.fillText('🎮 RC Car', 20, CANVAS_H - 30);
    if (state.rcCar.controlMode) {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('STEROWANIE', 20, CANVAS_H - 22);
    }
  }

  // Double Jump indicator (show when in air with 1 jump left)
  if (!state.player.onGround && state.player.jumpCount === 1) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath(); ctx.roundRect(CANVAS_W / 2 - 50, CANVAS_H - 80, 100, 22, 6); ctx.fill();
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.fillText('⬆ SPACJA = 2x skok!', CANVAS_W / 2, CANVAS_H - 64);
    ctx.textAlign = 'left';
  }

  ctx.textBaseline = 'alphabetic';
}

// ---- Combo indicator ----
function renderComboIndicator(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.comboCount < 3) return;

  const x = CANVAS_W - 120;
  const y = 70;
  const scale = 1 + Math.sin(state.time * 6) * 0.1;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = 'rgba(255,215,0,0.3)';
  ctx.beginPath(); ctx.roundRect(-40, -15, 80, 30, 10); ctx.fill();

  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(`🔥 ×${state.comboCount}`, 0, 6);
  ctx.textAlign = 'left';

  ctx.restore();
}

// ---- Message overlay ----
function renderMessage(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!state.message) return;

  const alpha = Math.min(1, state.message.timer * 2);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.font = 'bold 22px sans-serif';
  const tm = ctx.measureText(state.message.text);
  const tw = tm.width + 40;
  const tx = CANVAS_W / 2 - tw / 2;
  ctx.beginPath(); ctx.roundRect(tx, CANVAS_H / 2 - 25, tw, 50, 12); ctx.fill();

  ctx.fillStyle = '#FFF';
  ctx.textAlign = 'center';
  ctx.fillText(state.message.text, CANVAS_W / 2, CANVAS_H / 2 + 8);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

// ---- Achievement popup ----
function renderAchievementPopup(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!state.showAchievement || state.achievementTimer <= 0) return;

  const a = state.showAchievement;
  const progress = Math.min(1, (4 - state.achievementTimer) * 3); // slide in
  const fadeOut = Math.min(1, state.achievementTimer);
  const slideY = 60 + (1 - progress) * -60;

  ctx.globalAlpha = fadeOut;
  ctx.fillStyle = 'rgba(50,50,50,0.9)';
  ctx.beginPath(); ctx.roundRect(CANVAS_W / 2 - 140, slideY, 280, 50, 12); ctx.fill();
  ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(CANVAS_W / 2 - 140, slideY, 280, 50, 12); ctx.stroke();
  ctx.lineWidth = 1;

  ctx.font = '24px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(a.emoji, CANVAS_W / 2 - 125, slideY + 33);

  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.fillText('OSIĄGNIĘCIE!', CANVAS_W / 2 - 90, slideY + 20);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#FFF';
  ctx.fillText(a.title, CANVAS_W / 2 - 90, slideY + 38);

  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

// ---- Mini Map (bottom-right corner) ----
function renderMiniMap(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.phase === 'start' || state.phase === 'level_complete') return;

  const mapW = 160;
  const mapH = 36;
  const mapX = CANVAS_W - mapW - 14;
  const mapY = CANVAS_H - mapH - 14;
  const scaleX = mapW / state.worldWidth;
  const scaleY = mapH / state.worldHeight;

  // Background
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.roundRect(mapX - 3, mapY - 3, mapW + 6, mapH + 6, 6); ctx.fill();

  // Sky
  ctx.fillStyle = 'rgba(135,206,235,0.5)';
  ctx.fillRect(mapX, mapY, mapW, mapH);

  // Ground
  ctx.fillStyle = 'rgba(76,175,80,0.6)';
  ctx.fillRect(mapX, mapY + mapH - 6, mapW, 6);

  // House outline
  const hx = mapX + 80 * scaleX;
  const hw = 800 * scaleX;
  ctx.fillStyle = 'rgba(215,206,199,0.7)';
  ctx.fillRect(hx, mapY + mapH - 20, hw, 14);
  ctx.fillStyle = 'rgba(93,64,55,0.6)';
  ctx.fillRect(hx, mapY + mapH - 22, hw, 3);

  // Construction zone
  ctx.fillStyle = 'rgba(196,168,130,0.5)';
  ctx.fillRect(mapX + 1550 * scaleX, mapY + mapH - 8, 1500 * scaleX, 8);

  // Crane
  ctx.fillStyle = 'rgba(249,168,37,0.7)';
  ctx.fillRect(mapX + 2488 * scaleX, mapY + 2, 2, mapH - 8);
  ctx.fillRect(mapX + 2400 * scaleX, mapY + 2, 300 * scaleX, 1.5);

  // Camera viewport rectangle
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(
    mapX + state.camera.x * scaleX,
    mapY,
    CANVAS_W * scaleX,
    mapH
  );

  // Items (uncollected — small dots)
  for (const item of state.items) {
    if (item.collected) continue;
    ctx.fillStyle = 'rgba(255,215,0,0.8)';
    ctx.fillRect(mapX + item.x * scaleX, mapY + item.y * scaleY, 2, 2);
  }

  // NPCs (visible — blue dots)
  for (const npc of state.npcs) {
    if (!npc.visible) continue;
    ctx.fillStyle = npc.emote === '❗' ? '#FF4444' : 'rgba(100,180,255,0.8)';
    ctx.beginPath();
    ctx.arc(mapX + (npc.x + npc.w / 2) * scaleX, mapY + (npc.y + npc.h / 2) * scaleY, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Player (green dot — pulsing)
  const playerPulse = 2.5 + Math.sin(state.time * 4) * 0.8;
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.arc(
    mapX + (state.player.x + state.player.w / 2) * scaleX,
    mapY + (state.player.y + state.player.h / 2) * scaleY,
    playerPulse, 0, Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(
    mapX + (state.player.x + state.player.w / 2) * scaleX,
    mapY + (state.player.y + state.player.h / 2) * scaleY,
    1.2, 0, Math.PI * 2
  );
  ctx.fill();

  ctx.lineWidth = 1;
}

// ---- Edge arrows (off-screen quest target indicators) ----
function renderEdgeArrows(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!state.questPointer || state.phase !== 'playing') return;

  const { x: targetWorldX, y: targetWorldY, label } = state.questPointer;
  const screenX = targetWorldX - state.camera.x;
  const screenY = targetWorldY - state.camera.y;

  // Check if target is off-screen
  const margin = 40;
  const isOffScreen = screenX < -margin || screenX > CANVAS_W + margin ||
    screenY < -margin || screenY > CANVAS_H + margin;

  if (!isOffScreen) return;

  // Clamp to screen edges with padding
  const pad = 50;
  const arrowX = Math.max(pad, Math.min(CANVAS_W - pad, screenX));
  const arrowY = Math.max(pad, Math.min(CANVAS_H - pad, screenY));

  // Arrow direction
  const angle = Math.atan2(screenY - arrowY, screenX - arrowX);
  const pulse = Math.sin(state.time * 4) * 3;

  ctx.save();
  ctx.translate(arrowX + Math.cos(angle) * pulse, arrowY + Math.sin(angle) * pulse);
  ctx.rotate(angle);

  // Arrow body (golden, bigger for visibility)
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(-8, -16);
  ctx.lineTo(-3, -6);
  ctx.lineTo(-22, -6);
  ctx.lineTo(-22, 6);
  ctx.lineTo(-3, 6);
  ctx.lineTo(-8, 16);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Arrow border
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();

  // Label near arrow
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 4;
  ctx.fillText(label, arrowX, arrowY - 24);
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
}

// ---- Tutorial bubbles (first seconds of play) ----
function renderTutorial(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.phase !== 'playing' || state.time > 12) return;
  if (state.questsCompleted > 0) return;

  const alpha = state.time > 10 ? Math.max(0, 1 - (state.time - 10) / 2) : Math.min(1, state.time * 2);
  if (alpha <= 0) return;

  ctx.globalAlpha = alpha;

  const hints = [
    { text: '← → Chodzenie', x: CANVAS_W / 2 - 200, y: CANVAS_H - 80, delay: 0.5 },
    { text: 'SPACJA = Skok', x: CANVAS_W / 2, y: CANVAS_H - 80, delay: 2 },
    { text: '↑ Schody / Rozmowa', x: CANVAS_W / 2 + 200, y: CANVAS_H - 80, delay: 3.5 },
    { text: 'Podejdź do postaci z ❗', x: CANVAS_W / 2, y: 80, delay: 5 },
  ];

  for (const hint of hints) {
    if (state.time < hint.delay) continue;
    const hintAlpha = Math.min(1, (state.time - hint.delay) * 2);
    ctx.globalAlpha = alpha * hintAlpha;

    ctx.font = 'bold 13px sans-serif';
    const metrics = ctx.measureText(hint.text);
    const bw = metrics.width + 20;
    const bh = 28;
    const bx = hint.x - bw / 2;
    const by = hint.y - bh / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(255,215,0,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.stroke();
    ctx.lineWidth = 1;

    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(hint.text, hint.x, hint.y + 5);
    ctx.textAlign = 'left';
  }

  ctx.globalAlpha = 1;
}
