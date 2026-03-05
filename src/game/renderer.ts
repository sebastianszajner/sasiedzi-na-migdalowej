// ==========================================
// Sąsiedzi na Migdałowej — Canvas Renderer
// EXPANDED: costumes, weather, new items,
// garden elements, cat, mailman, effects
// ==========================================

import type { GameState, NPC, CostumeItem, InteractiveObject } from './types';
import { CANVAS_W, CANVAS_H, HOUSE, GARDEN, TERRACE, STREET, GARAGE, BINS, ITEM_FLOAT_AMP, ITEM_EMOJIS, ARTIFACT_EMOJIS, ZABKA, PACZKOMAT, COLORS, VESTIBULE, FRONT_GARDEN, PERGOLA, SKATE_PARK, BASKETBALL, BIKE_PATH, PRZEDSZKOLE, SZKOLA, VEHICLE_DEFS, BALANCE, TRICK_DEFS, KINDERGARTEN_GAMES } from './constants';
import { getFace } from './faces';

let _wallpaperCache: Map<string, CanvasPattern> | null = null;

// Room background image cache
const _roomImageCache: Map<string, HTMLImageElement> = new Map();
function getRoomImage(url: string): HTMLImageElement | null {
  if (_roomImageCache.has(url)) {
    const img = _roomImageCache.get(url)!;
    return img.complete && img.naturalWidth > 0 ? img : null;
  }
  const img = new Image();
  img.src = url;
  _roomImageCache.set(url, img);
  return null; // not loaded yet — will render on next frame
}

// Intro image cache (parallax layers)
const _introImageCache: Map<string, HTMLImageElement> = new Map();
function getIntroImage(name: string): HTMLImageElement | null {
  if (_introImageCache.has(name)) {
    const img = _introImageCache.get(name)!;
    return img.complete && img.naturalWidth > 0 ? img : null;
  }
  const basePath = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
  const img = new Image();
  img.src = `${basePath}intro/${name}`;
  _introImageCache.set(name, img);
  return null;
}

// Preload intro images immediately
function preloadIntroImages(): void {
  const files = ['bg_full.jpg', 'characters.png'];
  for (const f of files) {
    getIntroImage(f);
  }
}
preloadIntroImages();

// Season-dependent color palette
function getSeasonPalette(season: string) {
  switch (season) {
    case 'wiosna': return {
      skyTop: '#5B9BD5', skyMid: '#87CEEB', skyBot: '#E0F7E0',
      grass: '#4CAF50', grassDark: '#388E3C', grassTuft: '#66BB6A',
      treeCanopy: ['#2E7D32', '#388E3C', '#43A047'], treeAccent: '#81C784',
      flowerColors: ['#E91E63', '#FF9800', '#FFEB3B', '#9C27B0', '#4FC3F7'],
      appleColor: '#E91E63', groundTint: null as string | null,
    };
    case 'lato': return {
      skyTop: '#1976D2', skyMid: '#64B5F6', skyBot: '#E3F2FD',
      grass: '#558B2F', grassDark: '#33691E', grassTuft: '#7CB342',
      treeCanopy: ['#1B5E20', '#2E7D32', '#388E3C'], treeAccent: '#66BB6A',
      flowerColors: ['#F44336', '#FF5722', '#FFEB3B', '#E91E63', '#FF9800'],
      appleColor: '#E53935', groundTint: null as string | null,
    };
    case 'jesien': return {
      skyTop: '#78909C', skyMid: '#B0BEC5', skyBot: '#ECEFF1',
      grass: '#8D6E63', grassDark: '#6D4C41', grassTuft: '#A1887F',
      treeCanopy: ['#E65100', '#F57C00', '#BF360C'], treeAccent: '#FFB74D',
      flowerColors: ['#FF6F00', '#E65100', '#BF360C', '#795548', '#FFA000'],
      appleColor: '#FF6F00', groundTint: 'rgba(139,69,19,0.05)',
    };
    case 'zima': return {
      skyTop: '#B0BEC5', skyMid: '#CFD8DC', skyBot: '#ECEFF1',
      grass: '#BDBDBD', grassDark: '#9E9E9E', grassTuft: '#E0E0E0',
      treeCanopy: ['#5D4037', '#6D4C41', '#795548'], treeAccent: '#A1887F',
      flowerColors: [],
      appleColor: '#5D4037', groundTint: 'rgba(255,255,255,0.15)',
    };
    default: return {
      skyTop: '#5B9BD5', skyMid: '#87CEEB', skyBot: '#E0F0E8',
      grass: '#4CAF50', grassDark: '#388E3C', grassTuft: '#66BB6A',
      treeCanopy: ['#2E7D32', '#388E3C', '#43A047'], treeAccent: '#81C784',
      flowerColors: ['#E91E63', '#FF9800', '#FFEB3B', '#9C27B0', '#4FC3F7'],
      appleColor: '#E53935', groundTint: null as string | null,
    };
  }
}

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
  renderParallaxClouds(ctx, state);
  renderAirplanes(ctx, state);
  renderWeatherBack(ctx, state); // rain/snow behind house
  renderCityPlayground(ctx, state);
  renderCityLibrary(ctx, state);
  renderCityPark(ctx, state);
  renderSkatePark(ctx, state);
  renderBasketballCourt(ctx, state);
  renderBikePath(ctx, state);
  renderStreet(ctx, state);
  renderZabka(ctx, state);
  renderPaczkomat(ctx, state);
  renderPigeons(ctx, state);
  renderStreetCars(ctx, state);
  renderGarden(ctx, state);
  renderFloatingBalloons(ctx, state);
  renderTerrace(ctx, state);
  renderConstructionSite(ctx, state);
  renderParkTransition(ctx, state, 3190, 3500);   // between construction → przedszkole
  renderPrzedszkoleExterior(ctx, state);
  renderParkTransition(ctx, state, 5100, 5500);   // between przedszkole → szkoła
  renderSzkolaExterior(ctx, state);
  renderSchoolYard(ctx, state);
  renderParkBehindSchool(ctx, state);
  renderBusStop(ctx, state);
  renderOsiedle(ctx, state);
  renderGarageInterior(ctx, state);
  renderVestibule(ctx, state);
  renderFrontGarden(ctx, state);
  renderPergola(ctx, state);
  renderFence(ctx, state);
  renderGarbageBins(ctx, state);
  renderHouseExterior(ctx, state);
  renderChimneySmoke(ctx, state);
  renderRooms(ctx, state);
  renderRoomAnimations(ctx, state);
  renderRoomLighting(ctx, state);
  renderFurniture(ctx, state);
  renderInteractiveObjects(ctx, state);
  renderStairs(ctx, state);
  renderDoor(ctx, state);

  // Game objects
  renderItems(ctx, state);
  renderClimbableIndicators(ctx, state);
  renderNPCs(ctx, state);
  renderRCCar(ctx, state);
  renderVehicles(ctx, state);
  renderCompanionFranek(ctx, state);
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
  renderDayNightOverlay(ctx, state);
  renderBikeRaceHUD(ctx, state);
  renderBalanceMeter(ctx, state);
  renderMinigameOverlay(ctx, state);
  renderScreenTransition(ctx, state);
}

// ---- Intro Animation ----

// Easing functions for intro animations
function easeOutCubic(x: number): number { return 1 - Math.pow(1 - x, 3); }
function easeOutBack(x: number): number { const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
function easeInOutQuad(x: number): number { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

export function renderIntro(ctx: CanvasRenderingContext2D, t: number): void {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  // Load images
  const bgImg = getIntroImage('bg_full.jpg');
  const charsImg = getIntroImage('characters.png');

  // ===== TIMELINE =====
  // 0-1.5s  : Dark → background fades in with zoom
  // 1.5-3.5s: Characters rise from bottom with bounce
  // 2.0-3.5s: Title slides down
  // 3.5s+   : Settled, gentle parallax sway, CTA blinks

  // ===== LAYER 0: Dark base =====
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, W, H);

  // ===== LAYER 1: Background photo (house + garden) =====
  if (bgImg) {
    const bgFade = easeOutCubic(Math.min(t / 2.0, 1));
    // Slow zoom: starts at 1.08x, settles to 1.0x
    const bgZoom = 1.08 - 0.08 * easeOutCubic(Math.min(t / 3.0, 1));
    // Gentle parallax sway
    const bgSwayX = Math.sin(t * 0.3) * 4;
    const bgSwayY = Math.cos(t * 0.2) * 2;

    ctx.save();
    ctx.globalAlpha = bgFade;

    // Cover the canvas (aspect-fill)
    const bgAspect = bgImg.width / bgImg.height;
    const canvasAspect = W / H;
    let drawW: number, drawH: number;
    if (bgAspect > canvasAspect) {
      // Image is wider — fit by height
      drawH = H * bgZoom;
      drawW = drawH * bgAspect;
    } else {
      // Image is taller — fit by width
      drawW = W * bgZoom;
      drawH = drawW / bgAspect;
    }
    const drawX = (W - drawW) / 2 + bgSwayX;
    const drawY = (H - drawH) / 2 + bgSwayY;

    ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
    ctx.globalAlpha = 1;
    ctx.restore();

    // Darken overlay on top half for title readability
    if (bgFade > 0.3) {
      const overlayGrad = ctx.createLinearGradient(0, 0, 0, H * 0.4);
      overlayGrad.addColorStop(0, `rgba(0,0,0,${bgFade * 0.45})`);
      overlayGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = overlayGrad;
      ctx.fillRect(0, 0, W, H * 0.4);
    }
  }

  // ===== LAYER 2: Characters (rise from bottom with bounce) =====
  if (charsImg) {
    const charStart = 1.5;
    const charDur = 2.0;
    const charRaw = Math.max(0, Math.min((t - charStart) / charDur, 1));
    const charEased = easeOutBack(charRaw);
    const charFade = Math.min(charRaw * 3, 1); // fast fade in
    // Gentle floating once settled
    const charFloat = charRaw >= 1 ? Math.sin(t * 1.2) * 2 : 0;
    // Slide up from below
    const charSlideY = (1 - charEased) * H * 0.4;

    ctx.save();
    ctx.globalAlpha = charFade;

    // Characters fill ~65% of canvas height, centered horizontally, anchored at bottom
    const cDrawH = H * 0.65;
    const cAspect = charsImg.width / charsImg.height;
    const cDrawW = cDrawH * cAspect;
    const cX = (W - cDrawW) / 2;
    const cY = H * 0.35 + charSlideY + charFloat; // bottom-aligned
    ctx.drawImage(charsImg, cX, cY, cDrawW, cDrawH);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ===== LAYER 3: Title =====
  if (t > 2.0) {
    const titleRaw = Math.min((t - 2.0) / 1.5, 1);
    const titleEased = easeOutCubic(titleRaw);
    const titleAlpha = titleEased;
    const titleSlideY = (1 - titleEased) * -25;
    const titleScale = 0.9 + titleEased * 0.1;

    ctx.save();
    ctx.translate(W / 2, H * 0.10 + titleSlideY);
    ctx.scale(titleScale, titleScale);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Title text with shadow
    const fontSize = Math.min(48, W * 0.055);
    ctx.font = `bold ${fontSize}px "Segoe UI", "Arial Rounded MT Bold", sans-serif`;

    // Shadow
    ctx.fillStyle = `rgba(0,0,0,${titleAlpha * 0.6})`;
    ctx.fillText('Sąsiedzi na Migdałowej', 2, 2);

    // Main text
    ctx.fillStyle = `rgba(255,255,255,${titleAlpha})`;
    ctx.fillText('Sąsiedzi na Migdałowej', 0, 0);

    // Subtitle
    const subSize = Math.min(22, W * 0.028);
    ctx.font = `${subSize}px "Segoe UI", sans-serif`;
    ctx.fillStyle = `rgba(255,245,220,${titleAlpha * 0.85})`;
    ctx.fillText('Przygody Kuby na Migdałowej 47', 0, fontSize * 0.75);

    ctx.restore();

    // Sparkle particles around title
    if (titleAlpha > 0.5) {
      const sparkleA = Math.min((titleAlpha - 0.5) * 2, 1);
      for (let i = 0; i < 10; i++) {
        const st = t * 1.5 + i * 1.3;
        const sx = W / 2 + Math.sin(st) * (W * 0.22) + Math.cos(st * 0.6) * 25;
        const sy = H * 0.10 + Math.cos(st * 1.1) * 20;
        const sz = 1 + Math.sin(st * 2.5) * 1;
        ctx.fillStyle = `rgba(255,255,200,${sparkleA * (0.3 + 0.3 * Math.sin(st * 2))})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sz, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ===== LAYER 4: Benefit cards sliding in =====
  // 5 cards, each slides from right with stagger, stays visible
  const BENEFITS = [
    { icon: '🎮', title: '63 misje do odkrycia', desc: 'Codzienne, sezonowe i specjalne — od sprzątania po szukanie grzybów' },
    { icon: '🧮', title: 'Nauka przez zabawę', desc: '38 zadań matematycznych, combo za szybkość, odznaki za postępy' },
    { icon: '👔', title: '25 kostiumów', desc: 'Czapki, okulary, peleryny — odblokuj i dostosuj swojego bohatera' },
    { icon: '🐾', title: 'Żywy świat', desc: 'Piesek Franek chodzi za tobą, 4 pory roku, pogoda, dzień i noc' },
    { icon: '💚', title: 'Bezpieczna gra', desc: 'Przerwy co 20 min, ćwiczenia ruchowe, limit 3 sesji dziennie' },
  ];
  const cardStartT = 5.0;  // first card appears at 5s
  const cardStagger = 1.8; // seconds between cards
  const cardAnimDur = 0.8; // slide-in duration

  for (let i = 0; i < BENEFITS.length; i++) {
    const cardT = t - (cardStartT + i * cardStagger);
    if (cardT < 0) continue;

    const slideRaw = Math.min(cardT / cardAnimDur, 1);
    const slideEased = easeOutCubic(slideRaw);
    const fadeAlpha = Math.min(cardT / 0.5, 1);

    // Card dimensions
    const cardW = Math.min(420, W * 0.34);
    const cardH = 62;
    const cardPad = 14;
    const cardX = W - cardW - 20 + (1 - slideEased) * (cardW + 40); // slides from right
    const cardY = H * 0.28 + i * (cardH + 10);

    ctx.save();
    ctx.globalAlpha = fadeAlpha;

    // Card background (glass morphism)
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 12);
    ctx.fill();
    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Left accent bar
    const accentColors = ['#FFD700', '#4CAF50', '#E91E63', '#2196F3', '#FF9800'];
    ctx.fillStyle = accentColors[i];
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, 4, cardH, [12, 0, 0, 12]);
    ctx.fill();

    // Icon
    const iconSize = Math.min(24, cardH * 0.38);
    ctx.font = `${iconSize}px serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(BENEFITS[i].icon, cardX + cardPad, cardY + cardH / 2);

    // Title
    const titleSize = Math.min(15, W * 0.013);
    ctx.font = `bold ${titleSize}px "Segoe UI", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(BENEFITS[i].title, cardX + cardPad + iconSize + 8, cardY + cardH * 0.35);

    // Description
    const descSize = Math.min(12, W * 0.01);
    ctx.font = `${descSize}px "Segoe UI", sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(BENEFITS[i].desc, cardX + cardPad + iconSize + 8, cardY + cardH * 0.68);

    ctx.restore();
  }

  // ===== CTA (appears after all cards, or at 4s minimum) =====
  const ctaStartT = Math.max(4.0, cardStartT + BENEFITS.length * cardStagger + 0.5);
  if (t > ctaStartT) {
    const ctaFade = easeOutCubic(Math.min((t - ctaStartT) / 0.8, 1));
    const ctaPulse = easeInOutQuad((Math.sin(t * 2.5) + 1) / 2);
    const ctaAlpha = ctaFade * (0.4 + ctaPulse * 0.4);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const ctaFontSize = Math.min(18, W * 0.022);
    ctx.font = `${ctaFontSize}px "Segoe UI", sans-serif`;

    const ctaText = 'Kliknij lub naciśnij dowolny klawisz...';
    const ctaMetrics = ctx.measureText(ctaText);
    const ctaX = W / 2;
    const ctaY = H * 0.96;

    // Pill background
    ctx.fillStyle = `rgba(0,0,0,${ctaAlpha * 0.35})`;
    const pillW = ctaMetrics.width + 30;
    const pillH = ctaFontSize + 12;
    ctx.beginPath();
    ctx.roundRect(ctaX - pillW / 2, ctaY - pillH + 4, pillW, pillH, 14);
    ctx.fill();

    ctx.fillStyle = `rgba(255,255,255,${ctaAlpha})`;
    ctx.fillText(ctaText, ctaX, ctaY);
    ctx.restore();
  }

  // ===== Subtle vignette =====
  const vignette = ctx.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, W * 0.7);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.2)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

// ---- Sky ----
function renderSky(ctx: CanvasRenderingContext2D, state: GameState): void {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  const sp = getSeasonPalette(state.season);

  // Weather-aware sky (season tinted)
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
    grad.addColorStop(0, sp.skyTop);
    grad.addColorStop(0.4, sp.skyMid);
    grad.addColorStop(0.7, sp.skyMid);
    grad.addColorStop(1, sp.skyBot);
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

  // Sidewalk (extends along Żabka side)
  ctx.fillStyle = STREET.sidewalkColor;
  ctx.fillRect(STREET.startX, sy - 12, STREET.endX - STREET.startX, 32);
  // Sidewalk edge
  ctx.fillStyle = '#A09888';
  ctx.fillRect(STREET.startX, sy - 12, STREET.endX - STREET.startX, 3);

  // Street lamps
  const lampPositions = [-380, -750, -1100];
  for (const lx of lampPositions) {
    ctx.fillStyle = '#666';
    ctx.fillRect(lx, sy - 120, 4, 120);
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.arc(lx + 2, sy - 120, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Curb
  ctx.fillStyle = '#888';
  ctx.fillRect(STREET.startX, sy - 12, STREET.endX - STREET.startX, 3);

  // Crosswalk (zebra crossing near Żabka)
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(-860 + i * 12, sy - 10, 8, 28);
  }

  // === STREET IMPROVEMENTS ===

  // Street name sign "ul. Migdałowa" (large, visible blue plate)
  const signX = -330;
  // Pole (taller, thicker)
  ctx.fillStyle = '#555';
  ctx.fillRect(signX, sy - 140, 6, 128);
  // Pole cap
  ctx.fillStyle = '#444';
  ctx.fillRect(signX - 1, sy - 142, 8, 4);
  // Blue sign plate background
  ctx.fillStyle = '#1565C0';
  ctx.beginPath();
  ctx.roundRect(signX - 52, sy - 158, 110, 28, 4);
  ctx.fill();
  // White border on sign plate
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(signX - 50, sy - 156, 106, 24, 3);
  ctx.stroke();
  // Sign text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ul. Migdałowa', signX + 3, sy - 139);
  ctx.textAlign = 'left';
  ctx.lineWidth = 1;

  // Benches along sidewalk (2 benches)
  for (const bx of [-500, -950]) {
    // Seat
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(bx, sy - 30, 36, 6);
    // Backrest
    ctx.fillStyle = '#795548';
    ctx.fillRect(bx, sy - 42, 36, 4);
    // Legs
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(bx + 4, sy - 30, 3, 18);
    ctx.fillRect(bx + 29, sy - 30, 3, 18);
  }

  // Fire hydrant near Żabka
  ctx.fillStyle = '#D32F2F';
  ctx.fillRect(-780, sy - 32, 10, 20);
  ctx.fillStyle = '#B71C1C';
  ctx.fillRect(-783, sy - 36, 16, 6);
  ctx.fillStyle = '#EF5350';
  ctx.beginPath();
  ctx.arc(-775, sy - 36, 5, Math.PI, 0);
  ctx.fill();

  // Trash cans on street (2)
  for (const tx of [-430, -680]) {
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(tx, sy - 36, 14, 24);
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.arc(tx + 7, sy - 36, 8, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(tx + 2, sy - 28, 10, 2);
  }

  // Street trees (3 small trees along sidewalk)
  for (const stx of [-320, -620, -1000]) {
    // Trunk
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(stx, sy - 80, 6, 68);
    // Crown
    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.arc(stx + 3, sy - 90, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.arc(stx + 8, sy - 85, 16, 0, Math.PI * 2);
    ctx.fill();
    // Tree grate
    ctx.fillStyle = '#666';
    ctx.fillRect(stx - 8, sy - 12, 22, 3);
  }

  // Flower pots along sidewalk (4 small)
  const streetFlowerColors = ['#E91E63', '#FF9800', '#9C27B0', '#FFEB3B'];
  for (let i = 0; i < 4; i++) {
    const fpx = -400 - i * 220;
    // Pot
    ctx.fillStyle = '#D4A373';
    ctx.fillRect(fpx, sy - 24, 14, 12);
    ctx.fillStyle = '#C08C50';
    ctx.fillRect(fpx - 1, sy - 26, 16, 4);
    // Flower
    ctx.fillStyle = streetFlowerColors[i];
    ctx.beginPath();
    ctx.arc(fpx + 7, sy - 30, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(fpx + 6, sy - 26, 2, 6);
  }

  // Manhole cover
  ctx.fillStyle = '#444';
  ctx.beginPath();
  ctx.ellipse(-550, sy + 4, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(-550, sy + 4, 12, 4, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-558, sy + 4);
  ctx.lineTo(-542, sy + 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-550, sy);
  ctx.lineTo(-550, sy + 8);
  ctx.stroke();

  // === CROSS-STREET: ul. Wiśniowa (T-intersection at x=-710) ===
  const crossX = -710;
  const crossW = 50; // road width
  const crossLen = 100; // how far "into background" (upward)

  // Perpendicular road surface going upward
  ctx.fillStyle = '#505050';
  ctx.fillRect(crossX - crossW / 2, sy - 10 - crossLen, crossW, crossLen);

  // Road center dashed line (vertical)
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(crossX, sy - 10);
  ctx.lineTo(crossX, sy - 10 - crossLen);
  ctx.stroke();
  ctx.setLineDash([]);

  // Perspective fade (road fading into background/distance)
  const fadGrd = ctx.createLinearGradient(crossX, sy - 10 - crossLen, crossX, sy - 10 - crossLen - 30);
  fadGrd.addColorStop(0, 'rgba(85,85,85,0.8)');
  fadGrd.addColorStop(1, 'rgba(135,206,235,0)');
  ctx.fillStyle = fadGrd;
  ctx.fillRect(crossX - crossW / 2, sy - 10 - crossLen - 30, crossW, 30);

  // Curbs along cross-street
  ctx.fillStyle = '#999';
  ctx.fillRect(crossX - crossW / 2 - 3, sy - 10 - crossLen, 3, crossLen);
  ctx.fillRect(crossX + crossW / 2, sy - 10 - crossLen, 3, crossLen);

  // Pavement/sidewalk corners at T-intersection
  ctx.fillStyle = STREET.sidewalkColor;
  // Left corner
  ctx.fillRect(crossX - crossW / 2 - 20, sy - 12 - crossLen, 20, crossLen);
  // Right corner
  ctx.fillRect(crossX + crossW / 2 + 3, sy - 12 - crossLen, 20, crossLen);

  // T-intersection patch (smooth transition)
  ctx.fillStyle = '#555';
  ctx.fillRect(crossX - crossW / 2, sy - 12, crossW, 4);

  // Zebra crossing on the cross-street (near intersection)
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(crossX - crossW / 2 + 4, sy - 30 - i * 10, crossW - 8, 6);
  }

  // "Wiśniowa" street sign on the cross street
  const wSignX = crossX + crossW / 2 + 8;
  // Pole
  ctx.fillStyle = '#555';
  ctx.fillRect(wSignX, sy - 100, 4, 88);
  ctx.fillStyle = '#444';
  ctx.fillRect(wSignX - 1, sy - 102, 6, 4);
  // Blue sign plate
  ctx.fillStyle = '#1565C0';
  ctx.beginPath();
  ctx.roundRect(wSignX - 30, sy - 118, 80, 22, 3);
  ctx.fill();
  // White border
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(wSignX - 28, sy - 116, 76, 18, 2);
  ctx.stroke();
  // Sign text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ul. Wiśniowa', wSignX + 10, sy - 103);
  ctx.textAlign = 'left';
  ctx.lineWidth = 1;

  // Small speed bump / raised area before intersection
  ctx.fillStyle = '#666';
  ctx.fillRect(crossX - 40, sy - 10, 8, 28);
  ctx.fillRect(crossX + 32, sy - 10, 8, 28);
}

// ---- Żabka Store ----
function renderZabka(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { x, y, w, h } = ZABKA;
  const groundY = STREET.y;

  // Building body
  ctx.fillStyle = '#F5F0EB';
  ctx.fillRect(x, y, w, h);

  // Floor
  ctx.fillStyle = '#D5CFC8';
  ctx.fillRect(x, groundY - 8, w, 8);

  // Neon glow effect (pulsing green aura behind sign)
  const neonAlpha = 0.3 + Math.sin(state.time * 2) * 0.15;
  ctx.fillStyle = `rgba(0,166,81,${neonAlpha})`;
  ctx.fillRect(x - 3, y - 28, w + 6, 31);

  // Green Żabka sign (header bar)
  ctx.fillStyle = '#00A651';
  ctx.fillRect(x, y - 25, w, 25);
  // Sign text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🐸 Żabka', x + w / 2, y - 6);
  ctx.textAlign = 'left';

  // Door opening
  ctx.fillStyle = 'rgba(200,230,255,0.3)';
  ctx.fillRect(ZABKA.doorX, y + h - 116, ZABKA.doorW, 116);
  // Door frame
  ctx.strokeStyle = '#00A651';
  ctx.lineWidth = 2;
  ctx.strokeRect(ZABKA.doorX, y + h - 116, ZABKA.doorW, 116);

  // Window (left of door)
  ctx.fillStyle = 'rgba(135,206,235,0.4)';
  ctx.fillRect(x + 15, y + 30, 60, 50);
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 15, y + 30, 60, 50);

  // Shelves inside (visible through window)
  ctx.fillStyle = '#DDD';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x + 20, y + 40 + i * 16, 50, 2);
  }

  // Product emojis on shelves
  ctx.font = '10px sans-serif';
  ctx.fillText('🍿', x + 22, y + 52);
  ctx.fillText('🍬', x + 36, y + 52);
  ctx.fillText('💧', x + 50, y + 52);
  ctx.fillText('🍦', x + 22, y + 68);
  ctx.fillText('🧃', x + 36, y + 68);

  // Building walls (sides)
  ctx.fillStyle = '#D7CEC7';
  ctx.fillRect(x - 4, y - 25, 4, h + 25);
  ctx.fillRect(x + w, y - 25, 4, h + 25);
}

// ---- Paczkomat ----
function renderPaczkomat(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { x, y, w, h } = PACZKOMAT;

  // Main body (yellow InPost machine)
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.fill();

  // Dark outline
  ctx.strokeStyle = '#B8860B';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Grid of locker doors
  ctx.fillStyle = '#E8C200';
  const cols = 4;
  const rows = 5;
  const padX = 4;
  const padY = 18;
  const cellW = (w - padX * 2 - (cols - 1) * 2) / cols;
  const cellH = (h - padY - 8 - (rows - 1) * 2) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = x + padX + c * (cellW + 2);
      const cy = y + padY + r * (cellH + 2);
      ctx.fillRect(cx, cy, cellW, cellH);
    }
  }

  // Screen at top
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(x + 10, y + 4, w - 20, 12);
  // Screen text
  ctx.fillStyle = '#00FF00';
  ctx.font = '6px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('InPost', x + w / 2, y + 13);
  ctx.textAlign = 'left';

  // Animated screen scan line
  const scanY = y + 4 + ((state.time * 20) % 12);
  ctx.fillStyle = 'rgba(0,255,0,0.15)';
  ctx.fillRect(x + 10, scanY, w - 20, 3);

  // "Paczkomat" label below
  ctx.fillStyle = '#333';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📦 Paczkomat', x + w / 2, y + h + 10);
  ctx.textAlign = 'left';

  // Interaction glow pulse
  const px = state.player.x + state.player.w / 2;
  if (Math.abs(px - (x + w / 2)) < 80 && state.phase === 'playing') {
    ctx.save();
    ctx.globalAlpha = 0.15 + Math.sin(state.time * 3) * 0.1;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.roundRect(x - 4, y - 4, w + 8, h + 8, 6);
    ctx.fill();
    ctx.restore();
  }
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

// ---- Vestibule / Przedsionek (between garage and kitchen) ----
function renderVestibule(ctx: CanvasRenderingContext2D, _state: GameState): void {
  const vx = VESTIBULE.x;
  const vy = VESTIBULE.y;
  const gy = HOUSE.groundLevel;

  // Bench (wooden, against left wall)
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(vx + 4, gy - 40, 30, 6); // seat
  ctx.fillStyle = '#795548';
  ctx.fillRect(vx + 4, gy - 34, 3, 22); // leg left
  ctx.fillRect(vx + 31, gy - 34, 3, 22); // leg right

  // Shoe cabinet (low, next to bench)
  ctx.fillStyle = '#D7CEC7';
  ctx.fillRect(vx + 40, gy - 50, 35, 38);
  ctx.strokeStyle = '#B0A898';
  ctx.lineWidth = 1;
  // Cabinet doors
  ctx.strokeRect(vx + 42, gy - 48, 14, 16);
  ctx.strokeRect(vx + 58, gy - 48, 14, 16);
  ctx.strokeRect(vx + 42, gy - 30, 14, 16);
  ctx.strokeRect(vx + 58, gy - 30, 14, 16);
  // Small handles
  ctx.fillStyle = '#9E9E9E';
  for (const hx of [vx + 54, vx + 70]) {
    ctx.fillRect(hx, gy - 42, 2, 4);
    ctx.fillRect(hx, gy - 24, 2, 4);
  }

  // Mirror on wall (round)
  ctx.fillStyle = '#90CAF9';
  ctx.beginPath();
  ctx.arc(vx + 40, vy + 60, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(vx + 40, vy + 60, 19, 0, Math.PI * 2);
  ctx.stroke();
  // Mirror reflection
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.arc(vx + 36, vy + 56, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 1;

  // Coat hooks
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(vx + 10 + i * 15, vy + 100, 4, 8);
    ctx.beginPath();
    ctx.arc(vx + 12 + i * 15, vy + 108, 3, 0, Math.PI);
    ctx.stroke();
  }

  // Welcome mat
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(vx + 15, gy - 8, 50, 6);
  ctx.fillStyle = '#A1887F';
  ctx.fillRect(vx + 17, gy - 7, 46, 4);

  // Shoes on the floor (pairs)
  ctx.font = '10px sans-serif';
  ctx.fillText('\u{1F45F}', vx + 8, gy - 8);
  ctx.fillText('\u{1F462}', vx + 50, gy - 8);
}

// ---- Front Garden (ogródek przedni) ----
function renderFrontGarden(ctx: CanvasRenderingContext2D, _state: GameState): void {
  const startX = FRONT_GARDEN.startX;
  const endX = FRONT_GARDEN.endX;
  const gy = FRONT_GARDEN.groundY;
  const gardenW = endX - startX;

  // Grass ground
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(startX, gy - 8, gardenW, 16);
  ctx.fillStyle = '#388E3C';
  ctx.fillRect(startX, gy - 4, gardenW, 4);

  // Stone walkway (path from gate to front door)
  ctx.fillStyle = '#B0A898';
  for (let sx = startX + 20; sx < endX - 20; sx += 40) {
    ctx.fillRect(sx, gy - 10, 30, 10);
    ctx.strokeStyle = '#9E9688';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(sx, gy - 10, 30, 10);
    ctx.beginPath();
    ctx.moveTo(sx + 15, gy - 10);
    ctx.lineTo(sx + 15, gy);
    ctx.stroke();
  }

  // Flower beds (along the walkway)
  const flowerColors = ['#E91E63', '#FF9800', '#9C27B0', '#F44336', '#FF5722', '#E040FB'];
  for (let fi = 0; fi < 8; fi++) {
    const fx = startX + 30 + fi * 45;
    const fSide = fi % 2 === 0 ? -20 : 15; // alternate sides of path

    // Stem
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(fx + 2, gy - 30 + fSide, 2, 18);
    // Flower
    ctx.fillStyle = flowerColors[fi % flowerColors.length];
    ctx.beginPath();
    ctx.arc(fx + 3, gy - 32 + fSide, 5, 0, Math.PI * 2);
    ctx.fill();
    // Leaves
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.ellipse(fx, gy - 24 + fSide, 4, 2, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bushes (3 round bushes)
  for (const bx of [startX + 60, startX + 200, startX + 320]) {
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.arc(bx, gy - 24, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.arc(bx + 8, gy - 20, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1B5E20';
    ctx.beginPath();
    ctx.arc(bx - 4, gy - 18, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  // Small decorative stones
  ctx.fillStyle = '#9E9E9E';
  for (let si = 0; si < 6; si++) {
    const sx2 = startX + 40 + si * 60;
    ctx.beginPath();
    ctx.ellipse(sx2, gy - 6, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---- Pergola (black metal frame with ivy) ----
function renderPergola(ctx: CanvasRenderingContext2D, state: GameState): void {
  const px = PERGOLA.x;
  const pw = PERGOLA.w;
  const topY = PERGOLA.topY;
  const botY = PERGOLA.bottomY;
  const t = state.time;

  // Two vertical posts (black metal)
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(px, topY, 4, botY - topY);
  ctx.fillRect(px + pw - 4, topY, 4, botY - topY);

  // Horizontal slats (10 slats)
  const slatCount = 10;
  ctx.fillStyle = '#222';
  for (let i = 0; i < slatCount; i++) {
    const sy = topY + 10 + i * ((botY - topY - 20) / (slatCount - 1));
    ctx.fillRect(px, sy, pw, 3);
  }

  // Top beam
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(px - 4, topY - 4, pw + 8, 8);

  // Ivy growing on pergola (clusters of green leaves)
  const ivyColor1 = '#2E7D32';
  const ivyColor2 = '#388E3C';
  const ivyColor3 = '#1B5E20';

  for (let iy = 0; iy < 12; iy++) {
    const ivyY = topY + 5 + iy * 16;
    const ivySwing = Math.sin(t * 0.5 + iy * 0.8) * 3;

    // Vine stem
    ctx.strokeStyle = '#33691E';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px + 2, ivyY);
    ctx.quadraticCurveTo(px + pw / 2 + ivySwing, ivyY + 5, px + pw - 2, ivyY);
    ctx.stroke();

    // Leaf clusters along the vine
    for (let lx = 0; lx < 5; lx++) {
      const leafX = px + 8 + lx * (pw / 5) + ivySwing * 0.5;
      const leafY = ivyY + Math.sin(lx * 1.5 + t * 0.3) * 3;

      ctx.fillStyle = [ivyColor1, ivyColor2, ivyColor3][lx % 3];
      ctx.beginPath();
      ctx.ellipse(leafX, leafY, 5, 3, 0.3 * (lx % 2 === 0 ? 1 : -1), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.lineWidth = 1;

  // === Black roof / canopy (daszek) above pergola ===
  // Extends from house left wall (x=85) outward past the pergola (to x=-270)
  const canopyLeft = -270;   // just past pergola left edge
  const canopyRight = 85;    // house left wall
  const canopyY = 362;       // just above pergola topY (370)
  const canopyThick = 10;
  const canopySlope = 4;     // front edge slightly lower

  // Main canopy body (black)
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.moveTo(canopyRight, canopyY);                              // wall edge top
  ctx.lineTo(canopyRight, canopyY + canopyThick);                // wall edge bottom
  ctx.lineTo(canopyLeft, canopyY + canopyThick + canopySlope);   // front edge bottom (lower)
  ctx.lineTo(canopyLeft, canopyY + canopySlope);                 // front edge top
  ctx.closePath();
  ctx.fill();

  // Subtle gray highlight on top surface
  ctx.fillStyle = '#2A2A2A';
  ctx.beginPath();
  ctx.moveTo(canopyRight, canopyY);
  ctx.lineTo(canopyLeft, canopyY + canopySlope);
  ctx.lineTo(canopyLeft, canopyY + canopySlope + 3);
  ctx.lineTo(canopyRight, canopyY + 3);
  ctx.closePath();
  ctx.fill();

  // Front edge drip line (thin dark line)
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(canopyLeft, canopyY + canopyThick + canopySlope);
  ctx.lineTo(canopyRight, canopyY + canopyThick);
  ctx.stroke();

  // Wall attachment bracket (where canopy meets house wall)
  ctx.fillStyle = '#222';
  ctx.fillRect(canopyRight - 4, canopyY - 2, 8, canopyThick + 4);
  ctx.lineWidth = 1;
}

// ---- Fence / Ogrodzenie (between front garden and street) ----
function renderFence(ctx: CanvasRenderingContext2D, _state: GameState): void {
  const fx = FRONT_GARDEN.fenceX;
  const gy = FRONT_GARDEN.groundY;

  // Fence posts and panels
  ctx.fillStyle = '#5D4037';

  // Main gate post (taller)
  ctx.fillRect(fx - 4, gy - 110, 8, 110);
  ctx.fillStyle = '#4E342E';
  ctx.fillRect(fx - 6, gy - 114, 12, 8); // cap

  // Gate opening (player walks through here)
  // Gate frame
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(fx, gy - 100);
  ctx.lineTo(fx, gy);
  ctx.moveTo(fx + 40, gy - 100);
  ctx.lineTo(fx + 40, gy);
  ctx.stroke();
  // Gate horizontal bars
  ctx.beginPath();
  ctx.moveTo(fx, gy - 100);
  ctx.lineTo(fx + 40, gy - 100);
  ctx.moveTo(fx, gy - 50);
  ctx.lineTo(fx + 40, gy - 50);
  ctx.stroke();
  // Gate vertical bars
  for (let gi = 0; gi < 4; gi++) {
    ctx.beginPath();
    ctx.moveTo(fx + 8 + gi * 8, gy - 100);
    ctx.lineTo(fx + 8 + gi * 8, gy);
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  // Second gate post
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(fx + 38, gy - 110, 8, 110);
  ctx.fillStyle = '#4E342E';
  ctx.fillRect(fx + 36, gy - 114, 12, 8);
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

  // Ground — garden area (season-aware)
  const sp = getSeasonPalette(state.season);
  ctx.fillStyle = sp.grass;
  ctx.fillRect(0, gy, 1550, 200);
  ctx.fillStyle = sp.grassDark;
  ctx.fillRect(0, gy + 20, 1550, 180);
  // Snow cover in winter
  if (state.season === 'zima') {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(0, gy, 1550, 8);
  }

  // Grass tufts (season-colored)
  ctx.fillStyle = sp.grassTuft;
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
  // Canopy with sway (season-colored)
  ctx.translate(treeSway, 0);
  if (state.season === 'zima') {
    // Bare branches in winter
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, -130);
      ctx.lineTo(Math.cos(a) * 50, -130 + Math.sin(a) * 40 - 20);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
    // Snow on branches
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(0, -155, 15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-25, -140, 10, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(25, -145, 10, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = sp.treeCanopy[0];
    ctx.beginPath(); ctx.arc(0, -160, 55, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = sp.treeCanopy[1];
    ctx.beginPath(); ctx.arc(-30, -140, 40, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(30, -140, 40, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = sp.treeCanopy[2];
    ctx.beginPath(); ctx.arc(0, -180, 35, 0, Math.PI * 2); ctx.fill();
    // Fruits/accents on tree
    if (state.season !== 'jesien') {
      ctx.fillStyle = sp.appleColor;
      ctx.beginPath(); ctx.arc(-20, -145, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(15, -155, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(5, -170, 4, 0, Math.PI * 2); ctx.fill();
    }
    // Flowers on tree in spring
    if (state.season === 'wiosna') {
      ctx.fillStyle = '#FFCDD2';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath(); ctx.arc(Math.cos(a) * 40, -155 + Math.sin(a) * 30, 4, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
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

  // Flowers (animated — gentle swaying and bouncing) — not in winter
  const flowerColors = sp.flowerColors.length > 0 ? sp.flowerColors : ['#E91E63', '#FF9800', '#FFEB3B', '#9C27B0', '#4FC3F7', '#FF5722'];
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

  // Snowman in winter
  if (state.season === 'zima') {
    const smx = GARDEN.startX + 80;
    // Body
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(smx, gy - 15, 20, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(smx, gy - 42, 15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(smx, gy - 62, 10, 0, Math.PI * 2); ctx.fill();
    // Eyes
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(smx - 4, gy - 64, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(smx + 4, gy - 64, 2, 0, Math.PI * 2); ctx.fill();
    // Carrot nose
    ctx.fillStyle = '#FF7043';
    ctx.beginPath();
    ctx.moveTo(smx, gy - 61);
    ctx.lineTo(smx + 10, gy - 60);
    ctx.lineTo(smx, gy - 58);
    ctx.fill();
    // Hat
    ctx.fillStyle = '#333';
    ctx.fillRect(smx - 8, gy - 76, 16, 4);
    ctx.fillRect(smx - 5, gy - 88, 10, 12);
    // Scarf
    ctx.fillStyle = '#E53935';
    ctx.fillRect(smx - 12, gy - 52, 24, 4);
    ctx.fillRect(smx + 8, gy - 52, 4, 12);
  }

  // Butterflies (animated — not in winter)
  if ((state.weather === 'sunny' || state.weather === 'leaves') && state.season !== 'zima') {
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

  // === TRAMPOLINE ===
  // Frame
  ctx.fillStyle = '#333';
  ctx.fillRect(1100, gy - 6, 50, 6);
  // Bounce surface
  ctx.fillStyle = '#2196F3';
  ctx.fillRect(1102, gy - 8, 46, 4);
  // Springs
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    const sx = 1108 + i * 10;
    ctx.beginPath();
    ctx.moveTo(sx, gy);
    ctx.bezierCurveTo(sx - 3, gy + 2, sx + 3, gy + 6, sx, gy + 8);
    ctx.stroke();
  }
  // Legs
  ctx.fillStyle = '#555';
  ctx.fillRect(1103, gy, 3, 10);
  ctx.fillRect(1144, gy, 3, 10);
  ctx.lineWidth = 1;
}

// ---- Chimney Smoke (animated puffs) ----
function renderChimneySmoke(ctx: CanvasRenderingContext2D, state: GameState): void {
  const midX = (HOUSE.leftWall + HOUSE.rightWall) / 2;
  const chimneyX = midX - 48;
  const chimneyY = HOUSE.roofPeak - 42;
  const t = state.time;

  // 5 smoke puffs rising
  for (let i = 0; i < 5; i++) {
    const age = ((t * 0.3 + i * 0.7) % 3.5);
    const puffY = chimneyY - age * 30;
    const puffX = chimneyX + Math.sin(t * 0.5 + i * 1.2) * (age * 8);
    const puffR = 4 + age * 5;
    const alpha = Math.max(0, 0.25 - age * 0.07);

    ctx.fillStyle = `rgba(180,180,180,${alpha})`;
    ctx.beginPath();
    ctx.arc(puffX, puffY, puffR, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---- Pigeons on street (fly away when player approaches) ----
function renderPigeons(ctx: CanvasRenderingContext2D, state: GameState): void {
  const t = state.time;
  const pigeonSpots = [-450, -700, -900, -1050];
  const playerX = state.player.x;

  for (const px of pigeonSpots) {
    const dist = Math.abs(playerX - px);
    if (dist < 120) continue; // pigeons flew away!

    const bob = Math.sin(t * 3 + px) * 2;
    const headBob = Math.sin(t * 5 + px) * 1;

    ctx.save();
    ctx.translate(px, STREET.y - 18 + bob);

    // Body
    ctx.fillStyle = '#78909C';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#546E7A';
    ctx.beginPath();
    ctx.arc(7 + headBob, -4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#FF8F00';
    ctx.beginPath();
    ctx.moveTo(11 + headBob, -4);
    ctx.lineTo(14 + headBob, -3);
    ctx.lineTo(11 + headBob, -2);
    ctx.closePath();
    ctx.fill();

    // Iridescent neck
    ctx.fillStyle = '#4DB6AC';
    ctx.beginPath();
    ctx.arc(5, -2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.strokeStyle = '#E65100';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, 5);
    ctx.lineTo(-3, 10);
    ctx.moveTo(2, 5);
    ctx.lineTo(3, 10);
    ctx.stroke();

    ctx.restore();
  }
}

// ---- Floating balloons in the sky ----
function renderFloatingBalloons(ctx: CanvasRenderingContext2D, state: GameState): void {
  const t = state.time;
  const balloons = [
    { x: 300, y: 200, color: '#F44336' },
    { x: 800, y: 150, color: '#2196F3' },
    { x: 1300, y: 180, color: '#FFEB3B' },
    { x: -400, y: 170, color: '#4CAF50' },
    { x: -1000, y: 160, color: '#E91E63' },
  ];

  for (const b of balloons) {
    const bx = b.x + Math.sin(t * 0.3 + b.x * 0.01) * 20;
    const by = b.y + Math.cos(t * 0.5 + b.x * 0.01) * 10;

    // String
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(bx, by + 12);
    ctx.quadraticCurveTo(bx + Math.sin(t + b.x) * 5, by + 30, bx + Math.sin(t * 0.7 + b.x) * 3, by + 45);
    ctx.stroke();

    // Balloon
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.ellipse(bx, by, 10, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(bx - 3, by - 4, 3, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Knot
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.moveTo(bx - 2, by + 12);
    ctx.lineTo(bx, by + 16);
    ctx.lineTo(bx + 2, by + 12);
    ctx.closePath();
    ctx.fill();
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
  const { leftWall, rightWall, groundLevel, roofPeak } = HOUSE;
  const houseW = rightWall - leftWall;
  const atticTop = HOUSE.atticCeilingY;

  ctx.fillStyle = '#9E9E9E';
  ctx.fillRect(leftWall, groundLevel - 4, houseW, 8);
  // Left exterior wall with door opening (from garage/vestibule)
  const leftDoorGapTop = 420; // same height as right door
  ctx.fillStyle = '#D7CEC7';
  ctx.fillRect(leftWall - 8, atticTop, 8, leftDoorGapTop - atticTop);
  // Left door frame
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(leftWall - 10, leftDoorGapTop - 6, 12, 6);
  ctx.fillRect(leftWall - 9, leftDoorGapTop, 3, groundLevel - leftDoorGapTop);
  ctx.fillRect(leftWall - 1, leftDoorGapTop, 3, groundLevel - leftDoorGapTop);
  // Right wall with door gap (passage to garden)
  const doorGapTop = 420;
  ctx.fillStyle = '#D7CEC7';
  ctx.fillRect(rightWall, atticTop, 8, doorGapTop - atticTop);
  // Door frame
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(rightWall - 2, doorGapTop - 6, 12, 6);
  ctx.fillRect(rightWall - 1, doorGapTop, 3, groundLevel - doorGapTop);
  ctx.fillRect(rightWall + 7, doorGapTop, 3, groundLevel - doorGapTop);
  // Door opening
  ctx.fillStyle = 'rgba(135,206,235,0.4)';
  ctx.fillRect(rightWall + 1, doorGapTop, 6, groundLevel - doorGapTop);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('→', rightWall + 4, doorGapTop + (groundLevel - doorGapTop) / 2 + 6);
  ctx.textAlign = 'left';

  // Red brick accent
  ctx.fillStyle = '#C4A882';
  for (let row = 0; row < 3; row++) {
    const by = groundLevel - 10 - row * 8;
    ctx.fillRect(leftWall - 8, by, 8, 6);
    if (by < doorGapTop) ctx.fillRect(rightWall, by, 8, 6);
  }

  // === Black modern classic wall lamp (kinkiet) on left exterior wall ===
  const lampX = leftWall - 14;  // on the outer face of left wall
  const lampY = 395;            // above the door area
  // Wall mounting plate
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(lampX + 6, lampY, 6, 5);
  // Bracket arm extending outward (left)
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(lampX - 2, lampY + 1, 10, 3);
  // Cylindrical shade body
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.roundRect(lampX - 4, lampY - 6, 12, 16, 2);
  ctx.fill();
  // Darker accent line (shade detail)
  ctx.fillStyle = '#111';
  ctx.fillRect(lampX - 4, lampY + 2, 12, 1);
  // Top cap
  ctx.fillStyle = '#222';
  ctx.fillRect(lampX - 3, lampY - 7, 10, 2);
  // Bottom cap
  ctx.fillStyle = '#222';
  ctx.fillRect(lampX - 3, lampY + 9, 10, 2);
  // Warm glow effect (amber light)
  const glowGrd = ctx.createRadialGradient(lampX + 2, lampY + 4, 2, lampX + 2, lampY + 4, 25);
  glowGrd.addColorStop(0, 'rgba(255, 200, 100, 0.35)');
  glowGrd.addColorStop(0.5, 'rgba(255, 180, 60, 0.12)');
  glowGrd.addColorStop(1, 'rgba(255, 160, 40, 0)');
  ctx.fillStyle = glowGrd;
  ctx.beginPath();
  ctx.arc(lampX + 2, lampY + 4, 25, 0, Math.PI * 2);
  ctx.fill();
  // Inner light slit (warm glow visible through shade)
  ctx.fillStyle = 'rgba(255, 210, 120, 0.6)';
  ctx.fillRect(lampX - 2, lampY - 1, 8, 6);

  // Attic window (skylight / okno dachowe)
  const atticMid = HOUSE.antresola.x + HOUSE.antresola.w / 2;
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(atticMid - 20, atticTop + 10, 40, 30);
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 2;
  ctx.strokeRect(atticMid - 20, atticTop + 10, 40, 30);
  ctx.beginPath();
  ctx.moveTo(atticMid, atticTop + 10);
  ctx.lineTo(atticMid, atticTop + 40);
  ctx.stroke();

  // Roof (raised for attic)
  const roofLeft = leftWall - 15;
  const roofRight = rightWall + 15;
  const midX = (leftWall + rightWall) / 2;

  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.moveTo(roofLeft, atticTop);
  ctx.lineTo(midX, roofPeak);
  ctx.lineTo(roofRight, atticTop);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#4E342E';
  ctx.lineWidth = 1;
  for (let row = 0; row < 5; row++) {
    const t = row / 5;
    const y = atticTop + (roofPeak - atticTop) * t;
    const lx = roofLeft + (midX - roofLeft) * t;
    const rx = roofRight + (midX - roofRight) * t;
    ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(rx, y); ctx.stroke();
  }

  // Chimney (taller, above new roof peak)
  ctx.fillStyle = '#795548';
  ctx.fillRect(midX - 60, roofPeak - 35, 25, 50);
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(midX - 63, roofPeak - 39, 31, 6);
  // Smoke wisps
  ctx.fillStyle = 'rgba(180,180,180,0.3)';
  const smokeY = roofPeak - 42;
  ctx.beginPath();
  ctx.arc(midX - 48, smokeY - 6, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(midX - 45, smokeY - 14, 4, 0, Math.PI * 2);
  ctx.fill();

  // Solar panels (fotowoltaika) — right side of roof
  const panelStartX = midX + 40;
  const panelY = (atticTop + roofPeak) / 2 + 5;
  ctx.fillStyle = '#1A237E';
  for (let i = 0; i < 4; i++) {
    const px = panelStartX + i * 35;
    const py = panelY + (i * 2);
    ctx.fillRect(px, py, 30, 14);
    // Grid lines on panel
    ctx.strokeStyle = '#283593';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(px, py, 30, 14);
    ctx.beginPath();
    ctx.moveTo(px + 15, py); ctx.lineTo(px + 15, py + 14);
    ctx.moveTo(px, py + 7); ctx.lineTo(px + 30, py + 7);
    ctx.stroke();
  }

  // AC units (klimatyzatory) on exterior walls
  // Left wall AC
  ctx.fillStyle = '#E0E0E0';
  ctx.fillRect(leftWall - 26, 200, 18, 12);
  ctx.fillStyle = '#BDBDBD';
  ctx.fillRect(leftWall - 25, 202, 16, 3);
  ctx.fillRect(leftWall - 25, 207, 16, 3);
  // Right wall AC
  ctx.fillStyle = '#E0E0E0';
  ctx.fillRect(rightWall + 10, 180, 18, 12);
  ctx.fillStyle = '#BDBDBD';
  ctx.fillRect(rightWall + 11, 182, 16, 3);
  ctx.fillRect(rightWall + 11, 187, 16, 3);
  // Ground floor right AC
  ctx.fillStyle = '#E0E0E0';
  ctx.fillRect(rightWall + 10, 400, 18, 12);
  ctx.fillStyle = '#BDBDBD';
  ctx.fillRect(rightWall + 11, 402, 16, 3);
  ctx.fillRect(rightWall + 11, 407, 16, 3);

  // Roof outline
  ctx.strokeStyle = '#4E342E';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(roofLeft, atticTop);
  ctx.lineTo(midX, roofPeak);
  ctx.lineTo(roofRight, atticTop);
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
    // If room has a background image, draw wall/floor base THEN overlay image with overscan
    if (room.bgImageUrl) {
      const bgImg = getRoomImage(room.bgImageUrl);
      if (bgImg) {
        // Draw base wall+floor first (fills any gaps from image border)
        ctx.fillStyle = room.bgColor;
        ctx.fillRect(room.x, room.y, room.w, room.h);
        const floorH = 8;
        ctx.fillStyle = room.floorColor;
        ctx.fillRect(room.x, room.y + room.h - floorH, room.w, floorH);

        // Clip to room bounds, draw image with "cover" mode (preserve aspect ratio, crop overflow)
        ctx.save();
        ctx.beginPath();
        ctx.rect(room.x, room.y, room.w, room.h);
        ctx.clip();
        const imgW = bgImg.naturalWidth || bgImg.width;
        const imgH = bgImg.naturalHeight || bgImg.height;
        const roomAR = room.w / room.h;
        const imgAR = imgW / imgH;
        let dw: number, dh: number, dx: number, dy: number;
        if (imgAR > roomAR) {
          // Image wider than room → fit height, crop sides
          dh = room.h;
          dw = room.h * imgAR;
          dx = room.x - (dw - room.w) / 2;
          dy = room.y;
        } else {
          // Image taller than room → fit width, crop top/bottom
          dw = room.w;
          dh = room.w / imgAR;
          dx = room.x;
          dy = room.y - (dh - room.h) / 2;
        }
        ctx.drawImage(bgImg, dx, dy, dw, dh);
        ctx.restore();
        continue;
      }
      // Fallback to bgColor while image loads
    }

    // Room background with subtle wallpaper pattern
    ctx.fillStyle = room.bgColor;
    ctx.fillRect(room.x, room.y, room.w, room.h);

    // Wallpaper pattern overlay
    const patKey = room.name;
    if (!_wallpaperCache!.has(patKey)) {
      const tile = document.createElement('canvas');
      const t = tile.getContext('2d')!;
      if (room.name === 'Pokój Kuby') {
        // Stars pattern for Kuba's room (softer modern classic)
        tile.width = 30; tile.height = 30;
        t.fillStyle = 'rgba(140,170,200,0.04)';
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
        // Subtle linen texture (horizontal thin lines)
        tile.width = 24; tile.height = 6;
        t.strokeStyle = 'rgba(180,170,158,0.04)';
        t.lineWidth = 0.5;
        t.beginPath(); t.moveTo(0, 3); t.lineTo(24, 3); t.stroke();
        t.beginPath(); t.moveTo(0, 5); t.lineTo(24, 5); t.stroke();
      } else if (room.name === 'Łazienka') {
        // Marble veining effect (diagonal lines)
        tile.width = 24; tile.height = 24;
        t.strokeStyle = 'rgba(170,165,155,0.06)';
        t.lineWidth = 0.6;
        t.beginPath(); t.moveTo(0, 24); t.lineTo(24, 0); t.stroke();
        t.strokeStyle = 'rgba(170,165,155,0.03)';
        t.beginPath(); t.moveTo(0, 12); t.lineTo(12, 0); t.stroke();
        t.beginPath(); t.moveTo(12, 24); t.lineTo(24, 12); t.stroke();
      } else if (room.name === 'Kuchnia') {
        // Herringbone hints (angled lines)
        tile.width = 16; tile.height = 16;
        t.strokeStyle = 'rgba(190,175,155,0.04)';
        t.lineWidth = 0.5;
        t.beginPath(); t.moveTo(0, 8); t.lineTo(8, 0); t.stroke();
        t.beginPath(); t.moveTo(8, 0); t.lineTo(16, 8); t.stroke();
        t.beginPath(); t.moveTo(0, 16); t.lineTo(8, 8); t.stroke();
        t.beginPath(); t.moveTo(8, 8); t.lineTo(16, 16); t.stroke();
      } else {
        // Default: subtle panel/wainscoting lines
        tile.width = 40; tile.height = 40;
        t.strokeStyle = 'rgba(170,160,145,0.04)';
        t.lineWidth = 0.5;
        t.strokeRect(4, 4, 32, 32);
      }
      const pat = ctx.createPattern(tile, 'repeat');
      if (pat) _wallpaperCache!.set(patKey, pat);
    }
    const wallpaper = _wallpaperCache!.get(patKey);
    if (wallpaper) {
      ctx.fillStyle = wallpaper;
      ctx.fillRect(room.x, room.y, room.w, room.h);
    }

    // Enhanced inner shadows for 3D depth
    const shTop = ctx.createLinearGradient(room.x, room.y + 6, room.x, room.y + 28);
    shTop.addColorStop(0, 'rgba(0,0,0,0.12)');
    shTop.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shTop;
    ctx.fillRect(room.x, room.y + 6, room.w, 22);
    const shLeft = ctx.createLinearGradient(room.x, room.y, room.x + 14, room.y);
    shLeft.addColorStop(0, 'rgba(0,0,0,0.08)');
    shLeft.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shLeft;
    ctx.fillRect(room.x, room.y, 14, room.h);
    // Right edge highlight (light comes from right)
    const shRight = ctx.createLinearGradient(room.x + room.w, room.y, room.x + room.w - 10, room.y);
    shRight.addColorStop(0, 'rgba(255,255,255,0.06)');
    shRight.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shRight;
    ctx.fillRect(room.x + room.w - 10, room.y, 10, room.h);
    // Bottom ambient occlusion (where wall meets floor)
    const shBottom = ctx.createLinearGradient(room.x, room.y + room.h - 12, room.x, room.y + room.h);
    shBottom.addColorStop(0, 'rgba(0,0,0,0)');
    shBottom.addColorStop(1, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = shBottom;
    ctx.fillRect(room.x, room.y + room.h - 12, room.w, 12);

    ctx.fillStyle = room.floorColor;
    ctx.fillRect(room.x, room.y + room.h - 8, room.w, 8);

    // Herringbone wood floor pattern for wood-toned floors
    if (['#B89B74', '#A0886A', '#9E8E78', '#D5C8B5', '#C5BFB5'].includes(room.floorColor)) {
      ctx.strokeStyle = '#8E7A5E';
      ctx.lineWidth = 0.7;
      for (let x = room.x; x < room.x + room.w; x += 12) {
        const row = Math.floor((x - room.x) / 12);
        const fy = room.y + room.h - 8;
        ctx.beginPath();
        if (row % 2 === 0) { ctx.moveTo(x, fy); ctx.lineTo(x + 6, fy + 8); }
        else { ctx.moveTo(x + 6, fy); ctx.lineTo(x, fy + 8); }
        ctx.stroke();
      }
    }

    // Crown molding (modern classic warm gold-beige)
    ctx.fillStyle = '#D4C8B8';
    ctx.fillRect(room.x, room.y, room.w, 4);
    ctx.fillStyle = '#C9A96E';
    ctx.fillRect(room.x, room.y + 4, room.w, 0.5);
    ctx.fillStyle = '#C4B8A4';
    ctx.fillRect(room.x, room.y + 4.5, room.w, 2);

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
  // Cable (refined thin dark)
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x, ceilingY);
  ctx.lineTo(x, ceilingY + 14);
  ctx.stroke();
  // Brass canopy at ceiling
  ctx.fillStyle = '#B8943E';
  ctx.beginPath();
  ctx.arc(x, ceilingY + 2, 4, 0, Math.PI * 2);
  ctx.fill();
  // Lampshade (brass/gold fixture)
  ctx.fillStyle = isOn ? '#FFF3E0' : '#C9A96E';
  ctx.beginPath();
  ctx.moveTo(x - 10, ceilingY + 14);
  ctx.quadraticCurveTo(x - 12, ceilingY + 26, x - 7, ceilingY + 26);
  ctx.lineTo(x + 7, ceilingY + 26);
  ctx.quadraticCurveTo(x + 12, ceilingY + 26, x + 10, ceilingY + 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#B8943E';
  ctx.lineWidth = 0.6;
  ctx.stroke();
  if (isOn) {
    const glow = ctx.createRadialGradient(x, ceilingY + 30, 0, x, ceilingY + 30, 45);
    glow.addColorStop(0, 'rgba(255,243,224,0.18)');
    glow.addColorStop(0.6, 'rgba(255,235,170,0.05)');
    glow.addColorStop(1, 'rgba(255,235,170,0)');
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
  hg.addColorStop(0, '#D4B87A');
  hg.addColorStop(0.5, '#C9A96E');
  hg.addColorStop(1, '#B8943E');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#C9A96E';
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

  // Lower cabinets (warm cream with gold handles)
  ctx.fillStyle = '#F0EBE3';
  ctx.fillRect(kx + 10, ky - 45, 120, 40);
  ctx.strokeStyle = '#D8D0C4'; ctx.lineWidth = 1;
  ctx.strokeRect(kx + 12, ky - 43, 38, 36);
  ctx.strokeRect(kx + 52, ky - 43, 38, 36);
  ctx.strokeRect(kx + 92, ky - 43, 38, 36);
  ctx.fillStyle = '#C9A96E';
  ctx.fillRect(kx + 30, ky - 28, 6, 2);
  ctx.fillRect(kx + 70, ky - 28, 6, 2);
  ctx.fillRect(kx + 110, ky - 28, 6, 2);
  // Dark marble countertop
  ctx.fillStyle = '#3A3632';
  ctx.fillRect(kx + 8, ky - 48, 126, 4);
  // Upper cabinets
  ctx.fillStyle = '#F0EBE3';
  ctx.fillRect(kx + 20, ky - 140, 100, 50);
  ctx.strokeStyle = '#D8D0C4';
  ctx.strokeRect(kx + 22, ky - 138, 46, 46);
  ctx.strokeRect(kx + 72, ky - 138, 46, 46);
  // Stovetop
  ctx.fillStyle = '#333';
  ctx.fillRect(kx + 150, ky - 48, 50, 4);
  ctx.strokeStyle = '#555';
  ctx.beginPath(); ctx.arc(kx + 165, ky - 46, 8, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(kx + 185, ky - 46, 8, 0, Math.PI * 2); ctx.stroke();
  // Fridge (brushed steel look)
  ctx.fillStyle = '#E0E0E0';
  ctx.fillRect(kx + 140, ky - 160, 80, 60);
  const fridgeGrad = ctx.createLinearGradient(kx + 140, ky - 160, kx + 220, ky - 160);
  fridgeGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
  fridgeGrad.addColorStop(0.5, 'rgba(255,255,255,0)');
  fridgeGrad.addColorStop(1, 'rgba(0,0,0,0.05)');
  ctx.fillStyle = fridgeGrad;
  ctx.fillRect(kx + 140, ky - 160, 80, 60);
  ctx.strokeStyle = '#B0B0B0'; ctx.lineWidth = 2;
  ctx.strokeRect(kx + 140, ky - 160, 80, 60);
  ctx.beginPath(); ctx.moveTo(kx + 180, ky - 160); ctx.lineTo(kx + 180, ky - 100); ctx.stroke();
  ctx.lineWidth = 1;
  // Tall cabinet
  ctx.fillStyle = '#F0EBE3';
  ctx.fillRect(kx + 230, ky - 130, 35, 125);
  ctx.strokeStyle = '#D8D0C4';
  ctx.strokeRect(kx + 232, ky - 128, 31, 60);
  ctx.strokeRect(kx + 232, ky - 65, 31, 58);
  // Gold handles on tall cabinet
  ctx.fillStyle = '#C9A96E';
  ctx.fillRect(kx + 260, ky - 100, 2, 6);
  ctx.fillRect(kx + 260, ky - 38, 2, 6);

  // === SALON ===
  const sx = HOUSE.salon.x;
  const sy = HOUSE.floor1Y;

  // Fireplace (marble surround with brick interior)
  const fx = sx + 10;
  ctx.fillStyle = '#E8E4E0';
  ctx.fillRect(fx, sy - 130, 50, 130);
  // Subtle marble veining on fireplace surround
  ctx.strokeStyle = 'rgba(212,207,200,0.4)';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(fx + 5, sy - 120); ctx.lineTo(fx + 45, sy - 80); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(fx + 10, sy - 60); ctx.lineTo(fx + 40, sy - 30); ctx.stroke();
  // Mantel with gold accent
  ctx.fillStyle = '#D4C8B8';
  ctx.fillRect(fx - 5, sy - 135, 60, 8);
  ctx.fillStyle = '#C9A96E';
  ctx.fillRect(fx - 5, sy - 128, 60, 1);
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath(); ctx.arc(fx + 25, sy - 30, 18, Math.PI, 0);
  ctx.fillRect(fx + 7, sy - 30, 36, 25); ctx.fill();
  ctx.fillStyle = '#FF6B35';
  ctx.beginPath(); ctx.arc(fx + 25, sy - 15, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFD54F';
  ctx.beginPath(); ctx.arc(fx + 25, sy - 18, 4, 0, Math.PI * 2); ctx.fill();
  // Gold candlestick on mantel
  ctx.fillStyle = '#C9A96E';
  ctx.fillRect(fx + 3, sy - 145, 2, 10);
  ctx.fillRect(fx + 1, sy - 145, 6, 2);
  ctx.fillStyle = '#FFF3E0';
  ctx.fillRect(fx + 3, sy - 148, 2, 3);

  // Sofa (deep emerald velvet)
  ctx.fillStyle = '#2E5B4E';
  ctx.fillRect(sx + 80, sy - 50, 120, 40);
  ctx.fillStyle = '#265045';
  ctx.fillRect(sx + 80, sy - 70, 120, 22);
  // Gold sofa feet
  ctx.fillStyle = '#C9A96E';
  ctx.fillRect(sx + 85, sy - 10, 4, 3);
  ctx.fillRect(sx + 192, sy - 10, 4, 3);
  // Cushions
  ctx.fillStyle = '#D4B87A';
  ctx.fillRect(sx + 90, sy - 60, 15, 12);
  ctx.fillStyle = '#D4B87A';
  ctx.fillRect(sx + 175, sy - 60, 15, 12);

  // Coffee table (dark walnut with gold leg accent)
  ctx.fillStyle = '#3E2A1A';
  ctx.beginPath(); ctx.ellipse(sx + 150, sy - 18, 22, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#C9A96E';
  ctx.fillRect(sx + 148, sy - 18, 4, 14);
  ctx.fillStyle = '#3E2A1A';
  ctx.beginPath(); ctx.ellipse(sx + 180, sy - 15, 16, 6, 0, 0, Math.PI * 2); ctx.fill();

  // Armchair (navy blue velvet)
  ctx.fillStyle = '#2C3E6B';
  ctx.fillRect(sx + 220, sy - 50, 40, 38);
  ctx.fillStyle = '#243558';
  ctx.fillRect(sx + 218, sy - 60, 44, 14);
  ctx.fillRect(sx + 215, sy - 55, 6, 30);
  ctx.fillRect(sx + 257, sy - 55, 6, 30);

  // Gallery wall (gold frames)
  for (let i = 0; i < 4; i++) {
    const gx = sx + 90 + i * 35;
    const gy = sy - 160 + (i % 2) * 15;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(gx, gy, 28, 22);
    ctx.strokeStyle = '#C9A96E'; ctx.lineWidth = 2;
    ctx.strokeRect(gx, gy, 28, 22);
    ctx.fillStyle = '#888';
    ctx.fillRect(gx + 4, gy + 3, 20, 16);
    ctx.lineWidth = 1;
  }

  // Projector
  ctx.fillStyle = '#EEE';
  ctx.fillRect(sx + 140, sy - 215, 30, 15);

  // Dining table (dark walnut)
  ctx.fillStyle = '#3E2A1A';
  ctx.beginPath(); ctx.ellipse(sx + 270, sy - 25, 30, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#C9A96E';
  ctx.fillRect(sx + 268, sy - 25, 4, 20);
  ctx.fillStyle = '#D0C8C0';
  for (const cp of [-30, -15, 15, 30]) {
    ctx.beginPath(); ctx.arc(sx + 270 + cp, sy - 20, 8, 0, Math.PI * 2); ctx.fill();
  }

  // Komoda (dark walnut)
  ctx.fillStyle = '#3E2A1A';
  ctx.fillRect(sx + 240, sy - 55, 60, 45);
  ctx.strokeStyle = '#2E1C10';
  ctx.strokeRect(sx + 242, sy - 53, 28, 41);
  ctx.strokeRect(sx + 272, sy - 53, 26, 41);
  // Gold handles on komoda
  ctx.fillStyle = '#C9A96E';
  ctx.fillRect(sx + 254, sy - 35, 4, 2);
  ctx.fillRect(sx + 283, sy - 35, 4, 2);

  // Plants
  drawPlant(ctx, sx + 65, sy - 55, 0.8);
  drawPlant(ctx, sx + 205, sy - 55, 0.6);

  // === PRZEDPOKÓJ ===
  const px = HOUSE.przedpokoj.x;
  const py = HOUSE.floor1Y;

  // Shoe rack
  ctx.fillStyle = '#F0EBE3';
  ctx.fillRect(px + 30, py - 50, 60, 30);
  ctx.strokeStyle = '#D8D0C4';
  for (let i = 0; i < 8; i++) {
    ctx.beginPath(); ctx.moveTo(px + 32 + i * 7, py - 48); ctx.lineTo(px + 32 + i * 7, py - 22); ctx.stroke();
  }
  // Cabinet (dark walnut)
  ctx.fillStyle = '#3E2A1A';
  ctx.fillRect(px + 110, py - 80, 35, 75);
  ctx.fillRect(px + 112, py - 65, 31, 2);
  ctx.fillRect(px + 112, py - 40, 31, 2);
  // Gold handle on cabinet
  ctx.fillStyle = '#C9A96E';
  ctx.fillRect(px + 114, py - 53, 2, 6);
  // Mirror with gold frame
  ctx.fillStyle = '#F0F0EC';
  ctx.fillRect(px + 30, py - 150, 35, 45);
  ctx.fillRect(px + 75, py - 150, 35, 45);
  ctx.strokeStyle = '#C9A96E'; ctx.lineWidth = 2;
  ctx.strokeRect(px + 30, py - 150, 35, 45);
  ctx.strokeRect(px + 75, py - 150, 35, 45);
  ctx.lineWidth = 1;

  // === POKÓJ KUBY ===
  const jx = HOUSE.pokojJurka.x;
  const jy = HOUSE.floor2Y;

  // Bed (muted sophisticated blue)
  ctx.fillStyle = '#7BA3CC';
  ctx.fillRect(jx + 20, jy - 35, 80, 30);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(jx + 20, jy - 40, 20, 10);
  ctx.fillStyle = '#A0886A';
  ctx.fillRect(jx + 18, jy - 8, 84, 5);
  // Shelf (warm oak)
  ctx.fillStyle = '#A0886A';
  ctx.fillRect(jx + 130, jy - 90, 50, 85);
  ctx.fillStyle = '#8E7A5E';
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

  // Bed (warm linen look)
  ctx.fillStyle = '#D4C8B8';
  ctx.fillRect(bx + 30, by - 40, 120, 35);
  // Bedding
  ctx.fillStyle = '#E8E0D6';
  ctx.fillRect(bx + 35, by - 45, 25, 8);
  ctx.fillRect(bx + 120, by - 45, 25, 8);
  // Headboard
  ctx.fillStyle = '#3E2A1A';
  ctx.fillRect(bx + 28, by - 80, 124, 40);
  // Bedside tables (dark walnut)
  ctx.fillStyle = '#3E2A1A';
  ctx.fillRect(bx + 10, by - 30, 18, 25);
  ctx.fillRect(bx + 152, by - 30, 18, 25);
  // Lamp with gold base on bedside table
  ctx.fillStyle = '#333';
  ctx.fillRect(bx + 16, by - 50, 4, 22);
  ctx.fillStyle = '#C9A96E';
  ctx.fillRect(bx + 10, by - 55, 16, 6);
  // Wardrobe (dark walnut)
  ctx.fillStyle = '#3E2A1A';
  ctx.fillRect(bx + 200, by - 130, 80, 125);
  ctx.strokeStyle = '#2E1C10';
  ctx.strokeRect(bx + 202, by - 128, 38, 121);
  ctx.strokeRect(bx + 242, by - 128, 36, 121);
  // Gold wardrobe handles
  ctx.fillStyle = '#C9A96E';
  ctx.fillRect(bx + 238, by - 70, 2, 8);
  ctx.fillRect(bx + 244, by - 70, 2, 8);
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
      case 'projector':
        drawInteractiveProjector(ctx, obj, state.time);
        break;
      case 'paczkomat':
        // Paczkomat rendered separately in renderPaczkomat
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

// ---- Projector drawing (ceiling-mounted + pull-down screen) ----
function drawInteractiveProjector(ctx: CanvasRenderingContext2D, obj: InteractiveObject, time: number): void {
  const { x, y, w, h } = obj;
  const screenX = x - 10;
  const screenY = y + h + 10;
  const screenW = w + 20;
  const screenH = 80;

  // Projector body (on ceiling)
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 3);
  ctx.fill();
  // Lens
  ctx.fillStyle = obj.state ? '#FFE082' : '#555';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h, 5, 0, Math.PI * 2);
  ctx.fill();
  // Mount arm
  ctx.fillStyle = '#444';
  ctx.fillRect(x + w / 2 - 3, y - 8, 6, 8);

  if (obj.state) {
    // Pull-down screen (deployed)
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(screenX, screenY, screenW, screenH);
    ctx.strokeStyle = '#CCC';
    ctx.lineWidth = 1;
    ctx.strokeRect(screenX, screenY, screenW, screenH);
    // Screen bar at top
    ctx.fillStyle = '#888';
    ctx.fillRect(screenX - 2, screenY - 3, screenW + 4, 4);
    // Light beam (from projector to screen)
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#FFE082';
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - 3, y + h);
    ctx.lineTo(screenX, screenY);
    ctx.lineTo(screenX + screenW, screenY);
    ctx.lineTo(x + w / 2 + 3, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // Animated movie colors on screen
    const hue = (time * 20) % 360;
    ctx.save();
    ctx.globalAlpha = 0.3;
    const grad = ctx.createLinearGradient(screenX, screenY, screenX + screenW, screenY + screenH);
    grad.addColorStop(0, `hsl(${hue}, 40%, 60%)`);
    grad.addColorStop(0.5, `hsl(${(hue + 90) % 360}, 40%, 70%)`);
    grad.addColorStop(1, `hsl(${(hue + 180) % 360}, 40%, 60%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(screenX + 2, screenY + 2, screenW - 4, screenH - 4);
    ctx.restore();
    // Movie emoji
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎬', screenX + screenW / 2, screenY + screenH / 2 + 6);
    ctx.textAlign = 'left';
  } else {
    // Screen rolled up (just the bar visible)
    ctx.fillStyle = '#888';
    ctx.fillRect(screenX - 2, screenY - 3, screenW + 4, 4);
    // Pull cord
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(screenX + screenW - 5, screenY);
    ctx.lineTo(screenX + screenW - 5, screenY + 15);
    ctx.stroke();
    ctx.fillStyle = '#777';
    ctx.beginPath();
    ctx.arc(screenX + screenW - 5, screenY + 17, 3, 0, Math.PI * 2);
    ctx.fill();
  }
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

// ---- Items (quest-gated visibility + soft glow) ----
function renderItems(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const item of state.items) {
    if (item.collected) continue;

    // Only render items for active quest (or fading out)
    const fade = item.fadeIn ?? 0;
    if (fade < 0.01) continue; // fully invisible — skip rendering

    const floatY = Math.sin(item.floatPhase) * ITEM_FLOAT_AMP;
    const x = item.x;
    const y = item.y + floatY;
    const s = item.w;

    ctx.save();
    ctx.globalAlpha = fade; // smooth fade-in/out

    // Soft glow (reduced intensity for less "Pegasus" look)
    const glowPulse = 6 + Math.sin(state.time * 2.5 + item.floatPhase) * 3;
    const glowColors: Record<string, string> = {
      apple: '#FF6666', star: '#FFE066', cookie: '#FFB366', flower: '#FF99BB',
      key: '#FFE066', letter: '#6699FF', banana: '#FFEE66',
      lego_red: '#FF6666', lego_blue: '#6699FF', lego_green: '#66FF66', lego_yellow: '#FFE066',
    };
    ctx.shadowColor = glowColors[item.type] || '#FFE066';
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
        const emoji = item.type === 'artifact' && item.label
          ? (ARTIFACT_EMOJIS[item.label] || '🏅')
          : (ITEM_EMOJIS[item.type] || '📦');
        ctx.fillText(emoji, x, y + s);
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

    // NPC shadow (soft ellipse under feet)
    const shadowX = npc.x + npc.w / 2;
    const shadowY = npc.y + npc.h;
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(shadowX, shadowY + 2, npc.w * 0.4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Entrance animation: slide in + fade for first 0.8s
    const entranceT = Math.min(npc.animTimer, 0.8);
    if (entranceT < 0.8) {
      const progress = entranceT / 0.8;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      ctx.save();
      ctx.globalAlpha = eased;
      ctx.translate((1 - eased) * npc.dir * -60, (1 - eased) * 10);
    }

    // Idle breathing animation — subtle vertical oscillation
    const breathOffset = Math.sin((npc.idlePhase || 0)) * 1.5;
    ctx.translate(0, breathOffset);

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
      drawCharacter(ctx, npc, npc.color, npc.hairColor, npc.hairLong, state.time, npc.id);
      if (npc.id === 'listonosz') {
        drawMailmanExtras(ctx, npc);
      }
    }

    // Blink overlay — briefly close eyes
    if ((npc.blinkTimer || 3) < 0.15) {
      ctx.fillStyle = npc.color || '#FFCC99';
      // Draw skin-colored rectangles over eye area to simulate blink
      const eyeY = npc.y + 16;
      const eyeX = npc.x + npc.w / 2;
      ctx.fillRect(eyeX - 8, eyeY, 5, 3);
      ctx.fillRect(eyeX + 3, eyeY, 5, 3);
    }

    // Undo breathing offset
    ctx.translate(0, -breathOffset);

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

  // === BMW 8 Series Cabrio — full black, tan leather, folded top ===
  // Car faces RIGHT (front=right). Long, low, aggressive.
  const carW = 170;
  const carH = 38;
  const carX = cx - carW / 2 - 15; // shifted left so wujek stands at front-right
  const carY = baseY - carH;

  // ── Ground shadow ──
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(carX + carW / 2, baseY + 3, carW / 2 + 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Lower body (sills + lower bumper) ──
  ctx.fillStyle = '#0A0A0A';
  ctx.beginPath();
  ctx.moveTo(carX + 6, baseY);
  ctx.lineTo(carX, baseY - 6);
  ctx.lineTo(carX + 4, carY + carH - 2);
  ctx.lineTo(carX + carW - 4, carY + carH - 2);
  ctx.lineTo(carX + carW, baseY - 6);
  ctx.lineTo(carX + carW - 6, baseY);
  ctx.closePath();
  ctx.fill();

  // ── Main body shape (sleek coupe profile) ──
  ctx.fillStyle = '#0D0D0D';
  ctx.beginPath();
  ctx.moveTo(carX + 4, carY + carH);           // rear bottom
  ctx.lineTo(carX, carY + carH - 6);            // rear bumper curve
  ctx.quadraticCurveTo(carX + 2, carY + 16, carX + 12, carY + 12); // rear fender
  ctx.lineTo(carX + 28, carY + 6);              // trunk rise
  ctx.quadraticCurveTo(carX + 35, carY + 2, carX + 42, carY + 1);  // folded roof start
  ctx.lineTo(carX + 72, carY + 1);              // cabin top line
  ctx.quadraticCurveTo(carX + 78, carY, carX + 82, carY - 2);      // windshield base
  ctx.lineTo(carX + 95, carY - 12);             // windshield top
  ctx.lineTo(carX + 110, carY - 12);            // windshield top edge
  ctx.quadraticCurveTo(carX + 116, carY - 8, carX + 120, carY);    // A-pillar
  ctx.lineTo(carX + 140, carY + 4);             // hood line
  ctx.quadraticCurveTo(carX + 155, carY + 8, carX + 165, carY + 14); // front bumper
  ctx.lineTo(carX + carW, carY + carH - 6);     // front lower
  ctx.lineTo(carX + carW - 4, carY + carH);     // front bottom
  ctx.closePath();
  ctx.fill();

  // ── Body reflections (subtle light streaks on black) ──
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath();
  ctx.moveTo(carX + 20, carY + 14);
  ctx.lineTo(carX + 155, carY + 10);
  ctx.lineTo(carX + 155, carY + 15);
  ctx.lineTo(carX + 20, carY + 19);
  ctx.closePath();
  ctx.fill();
  // Shoulder line highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(carX + 10, carY + carH - 8);
  ctx.lineTo(carX + carW - 10, carY + carH - 8);
  ctx.stroke();

  // ── Open cabin (convertible interior) ──
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.moveTo(carX + 48, carY + 2);
  ctx.lineTo(carX + 80, carY + 2);
  ctx.quadraticCurveTo(carX + 84, carY, carX + 86, carY - 2);
  ctx.lineTo(carX + 112, carY - 2);
  ctx.quadraticCurveTo(carX + 116, carY, carX + 118, carY + 4);
  ctx.lineTo(carX + 118, carY + carH - 8);
  ctx.lineTo(carX + 48, carY + carH - 8);
  ctx.closePath();
  ctx.fill();

  // ── Tan leather seats (4-seater, Cognac brown) ──
  // Driver seat (right side — front)
  ctx.fillStyle = '#C8915A';
  ctx.beginPath();
  ctx.roundRect(carX + 96, carY + 2, 18, 10, 2);
  ctx.fill();
  ctx.fillStyle = '#B07A48';
  ctx.beginPath();
  ctx.roundRect(carX + 96, carY + 12, 18, 10, 2);
  ctx.fill();
  // Passenger seat
  ctx.fillStyle = '#C8915A';
  ctx.beginPath();
  ctx.roundRect(carX + 74, carY + 2, 18, 10, 2);
  ctx.fill();
  ctx.fillStyle = '#B07A48';
  ctx.beginPath();
  ctx.roundRect(carX + 74, carY + 12, 18, 10, 2);
  ctx.fill();
  // Rear seats (smaller)
  ctx.fillStyle = '#C8915A';
  ctx.beginPath();
  ctx.roundRect(carX + 52, carY + 4, 14, 8, 2);
  ctx.fill();
  ctx.fillStyle = '#B07A48';
  ctx.beginPath();
  ctx.roundRect(carX + 52, carY + 12, 14, 8, 2);
  ctx.fill();
  ctx.fillStyle = '#C8915A';
  ctx.beginPath();
  ctx.roundRect(carX + 68, carY + 4, 3, 8, 1);
  ctx.fill();

  // Center console
  ctx.fillStyle = '#222';
  ctx.fillRect(carX + 91, carY + 4, 4, 20);
  // Steering wheel
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(carX + 105, carY + 8, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1;

  // ── Headrest pillars (tan, visible above body line) ──
  for (const hx of [carX + 80, carX + 100, carX + 56]) {
    ctx.fillStyle = '#C8915A';
    ctx.beginPath();
    ctx.roundRect(hx, carY - 4, 6, 7, 2);
    ctx.fill();
  }

  // ── Folded soft top behind rear seats ──
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.moveTo(carX + 34, carY + 4);
  ctx.quadraticCurveTo(carX + 38, carY - 4, carX + 48, carY - 2);
  ctx.lineTo(carX + 48, carY + 10);
  ctx.lineTo(carX + 34, carY + 10);
  ctx.closePath();
  ctx.fill();
  // Fabric fold lines
  ctx.strokeStyle = '#2A2A2A';
  ctx.lineWidth = 0.7;
  for (let fy = 0; fy < 3; fy++) {
    ctx.beginPath();
    ctx.moveTo(carX + 35, carY + 2 + fy * 3);
    ctx.lineTo(carX + 47, carY + 2 + fy * 3);
    ctx.stroke();
  }

  // ── Windshield (angled, frameless look) ──
  ctx.fillStyle = 'rgba(100,160,220,0.3)';
  ctx.beginPath();
  ctx.moveTo(carX + 84, carY - 2);
  ctx.lineTo(carX + 96, carY - 11);
  ctx.lineTo(carX + 110, carY - 11);
  ctx.lineTo(carX + 116, carY - 2);
  ctx.closePath();
  ctx.fill();
  // Windshield frame
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(carX + 84, carY - 1);
  ctx.lineTo(carX + 96, carY - 11);
  ctx.lineTo(carX + 110, carY - 11);
  ctx.lineTo(carX + 116, carY - 1);
  ctx.stroke();
  ctx.lineWidth = 1;

  // ── BMW large kidney grille (black, wide — M850i style) ──
  ctx.fillStyle = '#080808';
  for (const gx of [carX + carW - 24, carX + carW - 16]) {
    ctx.beginPath();
    ctx.roundRect(gx, carY + carH - 22, 7, 12, 2);
    ctx.fill();
  }
  // Chrome surround
  ctx.strokeStyle = 'rgba(160,160,160,0.5)';
  ctx.lineWidth = 0.8;
  for (const gx of [carX + carW - 24, carX + carW - 16]) {
    ctx.beginPath();
    ctx.roundRect(gx, carY + carH - 22, 7, 12, 2);
    ctx.stroke();
  }

  // ── Headlights — BMW laser lights (narrow, angular) ──
  ctx.fillStyle = '#FFF8E1';
  ctx.beginPath();
  ctx.moveTo(carX + carW - 6, carY + carH - 18);
  ctx.lineTo(carX + carW - 1, carY + carH - 14);
  ctx.lineTo(carX + carW - 1, carY + carH - 10);
  ctx.lineTo(carX + carW - 8, carY + carH - 12);
  ctx.closePath();
  ctx.fill();
  // Blue accent (BMW Laserlight)
  ctx.fillStyle = 'rgba(33,150,243,0.4)';
  ctx.fillRect(carX + carW - 5, carY + carH - 16, 3, 2);

  // ── Taillights — L-shaped LED bar ──
  ctx.fillStyle = '#D32F2F';
  ctx.fillRect(carX + 2, carY + 10, 3, 14);
  ctx.fillRect(carX + 2, carY + 10, 10, 3);
  ctx.fillStyle = '#FF5252';
  ctx.fillRect(carX + 3, carY + 12, 1, 10);

  // ── Wheels — big, BLACK M-sport rims ──
  for (const wx of [carX + 30, carX + carW - 30]) {
    // Wide low-profile tire
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(wx, baseY - 2, 12, 0, Math.PI * 2);
    ctx.fill();
    // Dark rim (M-sport black)
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(wx, baseY - 2, 9, 0, Math.PI * 2);
    ctx.fill();
    // Spoke pattern (10 spokes, dark)
    ctx.strokeStyle = '#2A2A2A';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + time * 1.5;
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(angle) * 3, baseY - 2 + Math.sin(angle) * 3);
      ctx.lineTo(wx + Math.cos(angle) * 8, baseY - 2 + Math.sin(angle) * 8);
      ctx.stroke();
    }
    // Center cap (BMW logo small)
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(wx, baseY - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    // Blue brake caliper visible
    ctx.fillStyle = '#1565C0';
    ctx.beginPath();
    ctx.arc(wx - 3, baseY - 5, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Air vents on front fender (M850i detail) ──
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 0.8;
  for (let vi = 0; vi < 3; vi++) {
    ctx.beginPath();
    ctx.moveTo(carX + 128 + vi * 4, carY + 16);
    ctx.lineTo(carX + 130 + vi * 4, carY + 24);
    ctx.stroke();
  }

  // ── BMW roundel on hood ──
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(carX + 135, carY + 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0066B1';
  ctx.beginPath();
  ctx.arc(carX + 135, carY + 2, 3, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(carX + 135, carY + 2, 3, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#0066B1';
  ctx.fillRect(carX + 135, carY - 1, 3, 3);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(carX + 132, carY - 1, 3, 3);

  // ── License plate (GD = Gdańsk, like the reference photos) ──
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.roundRect(carX + carW - 26, carY + carH - 5, 22, 5, 1);
  ctx.fill();
  ctx.fillStyle = '#1565C0';
  ctx.fillRect(carX + carW - 26, carY + carH - 5, 4, 5);
  ctx.fillStyle = '#333';
  ctx.font = 'bold 3.5px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GD 850M', carX + carW - 13, carY + carH - 1);
  ctx.textAlign = 'left';

  // ── Side mirror (small, black) ──
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.ellipse(carX + 118, carY - 4, 4, 2.5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // ── Draw wujek standing next to car ──
  drawCharacter(ctx, npc, npc.color, npc.hairColor, npc.hairLong, time, npc.id);

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
  drawCharacter(ctx, npc, npc.color, npc.hairColor, npc.hairLong, time, npc.id);

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
  drawCharacter(ctx, npc, npc.color, npc.hairColor, npc.hairLong, time, npc.id);

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

// ---- Sąsiad Mirek — gruby, t-shirt, krótkie spodenki, crocsy ----
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

  // Legs (shorter, wider — bare skin showing below shorts)
  ctx.fillStyle = '#F0C090'; // skin tone
  ctx.fillRect(cx - 10, topY + 56 + bob, 8, 24);
  ctx.fillRect(cx + 2, topY + 56 + bob, 8, 24);

  // Leg hair detail (subtle)
  ctx.strokeStyle = 'rgba(120,90,60,0.15)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 4; i++) {
    const ly = topY + 60 + i * 5 + bob;
    ctx.beginPath(); ctx.moveTo(cx - 7, ly); ctx.lineTo(cx - 6, ly - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 5, ly); ctx.lineTo(cx + 6, ly - 2); ctx.stroke();
  }

  // Crocs (chunky, colorful — bright green)
  ctx.fillStyle = '#4CAF50'; // green crocs
  // Left croc — rounded chunky shape
  ctx.beginPath();
  ctx.moveTo(cx - 12 + dir * 2, topY + 79 + bob);
  ctx.quadraticCurveTo(cx - 14 + dir * 2, topY + 75 + bob, cx - 10 + dir * 2, topY + 74 + bob);
  ctx.lineTo(cx - 2 + dir * 2, topY + 74 + bob);
  ctx.quadraticCurveTo(cx + 2 + dir * 2, topY + 76 + bob, cx + 1 + dir * 2, topY + 80 + bob);
  ctx.closePath();
  ctx.fill();
  // Right croc
  ctx.beginPath();
  ctx.moveTo(cx + dir * 2, topY + 79 + bob);
  ctx.quadraticCurveTo(cx - 2 + dir * 2, topY + 75 + bob, cx + 2 + dir * 2, topY + 74 + bob);
  ctx.lineTo(cx + 10 + dir * 2, topY + 74 + bob);
  ctx.quadraticCurveTo(cx + 14 + dir * 2, topY + 76 + bob, cx + 13 + dir * 2, topY + 80 + bob);
  ctx.closePath();
  ctx.fill();
  // Crocs holes
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.arc(cx - 6 + dir * 2, topY + 76 + bob, 1, 0, Math.PI * 2);
  ctx.arc(cx - 3 + dir * 2, topY + 76 + bob, 1, 0, Math.PI * 2);
  ctx.arc(cx + 5 + dir * 2, topY + 76 + bob, 1, 0, Math.PI * 2);
  ctx.arc(cx + 8 + dir * 2, topY + 76 + bob, 1, 0, Math.PI * 2);
  ctx.fill();
  // Crocs strap (back)
  ctx.strokeStyle = '#388E3C';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx - 6 + dir * 2, topY + 77 + bob, 4, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 6 + dir * 2, topY + 77 + bob, 4, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();

  // Shorts (khaki cargo shorts — wide, to the knee)
  ctx.fillStyle = '#C8B88A'; // khaki
  ctx.beginPath();
  ctx.moveTo(cx - 18, topY + 46 + bob);
  ctx.lineTo(cx - 16, topY + 60 + bob);
  ctx.lineTo(cx - 2, topY + 60 + bob);
  ctx.lineTo(cx - 2, topY + 46 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 2, topY + 46 + bob);
  ctx.lineTo(cx + 2, topY + 60 + bob);
  ctx.lineTo(cx + 16, topY + 60 + bob);
  ctx.lineTo(cx + 18, topY + 46 + bob);
  ctx.closePath();
  ctx.fill();
  // Shorts pocket (cargo style)
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(cx - 14, topY + 50 + bob, 7, 6);
  ctx.strokeRect(cx + 7, topY + 50 + bob, 7, 6);
  // Shorts drawstring
  ctx.strokeStyle = '#B8A87A';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - 2, topY + 47 + bob);
  ctx.lineTo(cx - 4, topY + 50 + bob);
  ctx.moveTo(cx + 2, topY + 47 + bob);
  ctx.lineTo(cx + 4, topY + 50 + bob);
  ctx.stroke();

  // T-shirt (coral/red, stretched over belly)
  ctx.fillStyle = '#E05555'; // coral red t-shirt
  ctx.beginPath();
  ctx.moveTo(cx - 18, topY + 20 + bob);
  ctx.quadraticCurveTo(cx - 26, topY + 35 + bob, cx - 22, topY + 46 + bob); // left side bulges
  ctx.lineTo(cx + 22, topY + 46 + bob);
  ctx.quadraticCurveTo(cx + 26, topY + 35 + bob, cx + 18, topY + 20 + bob);
  ctx.closePath();
  ctx.fill();

  // Belly bulge (visible through t-shirt — round gut stretching fabric)
  const bellyGrad = ctx.createRadialGradient(cx + dir * 2, topY + 38 + bob, 0, cx, topY + 38 + bob, 18);
  bellyGrad.addColorStop(0, 'rgba(255,255,255,0.18)');
  bellyGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(cx + dir * 2, topY + 38 + bob, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // T-shirt bottom edge (slightly rides up over belly)
  ctx.strokeStyle = 'rgba(180,50,50,0.3)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - 20, topY + 46 + bob);
  ctx.quadraticCurveTo(cx, topY + 44 + bob, cx + 20, topY + 46 + bob);
  ctx.stroke();

  // T-shirt collar (round neck)
  ctx.strokeStyle = '#C04040';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, topY + 20 + bob, 8, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Neck (skin showing at collar)
  ctx.fillStyle = '#F0C090';
  ctx.fillRect(cx - 5, topY + 18 + bob, 10, 5);

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

  // Arms (skin-colored — short sleeves)
  const armSwing = npc.animTimer ? Math.sin(time * 3) * 0.15 : 0;
  // Left arm — t-shirt sleeve then bare arm
  ctx.save();
  ctx.translate(cx - 18, topY + 24 + bob);
  ctx.rotate(-0.3 + armSwing);
  ctx.fillStyle = '#E05555'; // sleeve
  ctx.fillRect(-3, 0, 7, 10);
  ctx.fillStyle = '#F0C090'; // bare forearm
  ctx.fillRect(-3, 10, 7, 18);
  ctx.restore();
  // Right arm
  ctx.save();
  ctx.translate(cx + 18, topY + 24 + bob);
  ctx.rotate(0.3 - armSwing);
  ctx.fillStyle = '#E05555'; // sleeve
  ctx.fillRect(-4, 0, 7, 10);
  ctx.fillStyle = '#F0C090'; // bare forearm
  ctx.fillRect(-4, 10, 7, 18);
  ctx.restore();
}

// ---- Policjant — blue uniform, cap, badge ----
function drawPolicjant(ctx: CanvasRenderingContext2D, npc: NPC, time: number): void {
  // Use generic character as base, then add police details
  drawCharacter(ctx, npc, '#1A237E', '#333', false, time, npc.id);

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
  drawCharacter(ctx, npc, '#2E7D32', '#5D4037', false, time, npc.id);

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

  // Red cabrio parked behind him
  if (npc.x < -100) {
    const carCx = npc.x - 40;
    const carBaseY = npc.y + npc.h;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(carCx, carBaseY + 2, 55, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Car body — red cabrio
    const cx2 = carCx - 50;
    const cy2 = carBaseY - 32;
    ctx.fillStyle = '#C62828';
    ctx.beginPath();
    ctx.moveTo(cx2 + 8, cy2 + 32);
    ctx.lineTo(cx2, cy2 + 28);
    ctx.quadraticCurveTo(cx2 + 4, cy2 + 10, cx2 + 18, cy2 + 8);
    ctx.lineTo(cx2 + 35, cy2 + 4);
    ctx.quadraticCurveTo(cx2 + 50, cy2 + 2, cx2 + 65, cy2 + 2);
    ctx.lineTo(cx2 + 85, cy2 + 4);
    ctx.quadraticCurveTo(cx2 + 98, cy2 + 6, cx2 + 100, cy2 + 14);
    ctx.lineTo(cx2 + 100, cy2 + 28);
    ctx.lineTo(cx2 + 96, cy2 + 32);
    ctx.closePath();
    ctx.fill();

    // Metallic highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(cx2 + 12, cy2 + 14, 76, 5);

    // Windshield frame (no roof — cabrio!)
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx2 + 36, cy2 + 8);
    ctx.lineTo(cx2 + 33, cy2 - 4);
    ctx.lineTo(cx2 + 55, cy2 - 4);
    ctx.lineTo(cx2 + 57, cy2 + 4);
    ctx.stroke();
    ctx.lineWidth = 1;

    // Windshield glass
    ctx.fillStyle = 'rgba(120,200,255,0.35)';
    ctx.beginPath();
    ctx.moveTo(cx2 + 36, cy2 + 8);
    ctx.lineTo(cx2 + 34, cy2 - 3);
    ctx.lineTo(cx2 + 54, cy2 - 3);
    ctx.lineTo(cx2 + 56, cy2 + 4);
    ctx.closePath();
    ctx.fill();

    // Headlights
    ctx.fillStyle = '#FFF9C4';
    ctx.beginPath();
    ctx.ellipse(cx2 + 97, cy2 + 20, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Taillights
    ctx.fillStyle = '#D50000';
    ctx.beginPath();
    ctx.ellipse(cx2 + 3, cy2 + 20, 3, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wheels
    for (const wx of [cx2 + 20, cx2 + 82]) {
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(wx, carBaseY - 1, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#757575';
      ctx.beginPath();
      ctx.arc(wx, carBaseY - 1, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#BDBDBD';
      ctx.beginPath();
      ctx.arc(wx, carBaseY - 1, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // License plate
    ctx.fillStyle = '#FFF';
    ctx.fillRect(cx2 + 40, cy2 + 28, 20, 5);
    ctx.fillStyle = '#333';
    ctx.font = 'bold 4px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WAW 🌴', cx2 + 50, cy2 + 32);
    ctx.textAlign = 'left';

    // Luggage rack on trunk (suitcase + backpack indicator)
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(cx2 + 2, cy2 + 10, 14, 10);
    ctx.fillStyle = '#795548';
    ctx.fillRect(cx2 + 4, cy2 + 12, 10, 2);
  }
}

// ---- KUBA (player) — dirty blond boy, 4-5yo, black Adidas shirt with red stripes ----
function drawKuba(
  ctx: CanvasRenderingContext2D,
  player: { x: number; y: number; w: number; h: number; dir: 1 | -1; walking?: boolean; walkFrame?: number; emotion?: string },
  _time: number,
): void {
  const { x, y, w, h, dir } = player;
  const cx = x + w / 2;
  const walking = player.walking || false;
  const frame = player.walkFrame || 0;
  // Smoother bob with 8-frame walk cycle
  const walkPhase = walking ? (frame / 8) * Math.PI * 2 : 0;
  const bob = walking ? Math.sin(walkPhase) * 1.2 : 0;
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

  // ---- LEGS with gradient jeans (8-frame smooth swing) ----
  const legSwing = walking ? Math.sin(walkPhase) * 0.35 : 0;

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

  // ---- ARMS with gradient skin (8-frame smooth swing, opposite to legs) ----
  const armSwing = walking ? Math.sin(walkPhase + Math.PI) * 0.4 : 0;

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

  // ---- HEAD position (used for face PNG overlay) ----
  const headY = -52 + bob;

  // ---- FACE IMAGE (silhouette PNG — transparent bg, natural head shape) ----
  const kubaFaceImg = getFace('kuba');
  if (kubaFaceImg) {
    const headS = 34;
    ctx.save();
    if (dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(kubaFaceImg, -headS / 2, headY - headS / 2, headS, headS);
    ctx.restore();
  }

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

  // ---- HEAD position (used for face PNG overlay) ----
  const headY = -56 + bob;

  // ---- FACE IMAGE (silhouette PNG) ----
  const tataFaceImg = getFace('tata');
  if (tataFaceImg) {
    const headS = 34;
    ctx.save();
    if (dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(tataFaceImg, -headS / 2, headY - headS / 2, headS, headS);
    ctx.restore();
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

  // ---- HEAD position (used for face PNG overlay) ----
  const headY = -54 + bob;

  // ---- FACE IMAGE (silhouette PNG) ----
  const mamaFaceImg = getFace('mama');
  if (mamaFaceImg) {
    const headS = 34;
    ctx.save();
    if (dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(mamaFaceImg, -headS / 2, headY - headS / 2, headS, headS);
    ctx.restore();
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
  npcId?: string,
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

  // ---- HEAD: face PNG overlay if available, otherwise procedural fallback ----
  const headY = -50 + bob;
  const npcFaceImg = npcId ? getFace(npcId) : null;

  if (npcFaceImg) {
    // Face image (silhouette PNG)
    const headS = 30;
    ctx.save();
    if (dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(npcFaceImg, -headS / 2, headY - headS / 2, headS, headS);
    ctx.restore();
  } else {
    // Procedural head fallback (for NPCs without face PNGs)
    ctx.fillStyle = '#FFDCB8';
    ctx.beginPath(); ctx.arc(0, headY, 12, 0, Math.PI * 2); ctx.fill();

    // Ears
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#FFDCB8';
      ctx.beginPath();
      ctx.ellipse(side * 12, headY, 2.5, 3.5, side * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F0C8A0';
      ctx.beginPath();
      ctx.ellipse(side * 12, headY, 1.5, 2, side * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hair
    ctx.fillStyle = hairColor;
    ctx.beginPath(); ctx.arc(0, headY - 4, 13, Math.PI, 0); ctx.fill();
    if (longHair) {
      ctx.fillRect(-13, headY - 4, 4, 22);
      ctx.fillRect(9, headY - 4, 4, 22);
    }

    // Eyes
    const eyeDir = dir === 1 ? 1.5 : -1.5;
    const npcEyeY = headY - 2;

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
        const ewGrad = ctx.createRadialGradient(ex, npcEyeY, 0, ex, npcEyeY, 3.2);
        ewGrad.addColorStop(0, '#FFF');
        ewGrad.addColorStop(1, '#F0EDE8');
        ctx.fillStyle = ewGrad;
        ctx.beginPath();
        ctx.ellipse(ex, npcEyeY, 3.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(120,90,60,0.2)';
        ctx.lineWidth = 0.4;
        ctx.stroke();
        const iGrad = ctx.createRadialGradient(ex + dir * 0.5, npcEyeY, 0, ex + dir * 0.5, npcEyeY, 1.8);
        iGrad.addColorStop(0, '#8B6B4A');
        iGrad.addColorStop(0.6, '#6B4B2A');
        iGrad.addColorStop(1, '#4B3B1A');
        ctx.fillStyle = iGrad;
        ctx.beginPath();
        ctx.arc(ex + dir * 0.5, npcEyeY, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0A0A0A';
        ctx.beginPath();
        ctx.arc(ex + dir * 0.6, npcEyeY, 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(ex + dir * 0.1, npcEyeY - 0.6, 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#6A5040';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(ex, npcEyeY - 0.3, 3.2, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      }
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
    ctx.arc(eyeDir * 0.3, headY + 3, 1.8, 0, Math.PI);
    ctx.fill();

    // Subtle smile
    const gMx = eyeDir * 0.3;
    const gMy = headY + 6;
    ctx.strokeStyle = '#B08060';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(gMx - 2.8, gMy);
    ctx.quadraticCurveTo(gMx, gMy - 0.7, gMx + 2.8, gMy);
    ctx.stroke();
    ctx.fillStyle = 'rgba(210,140,120,0.35)';
    ctx.beginPath();
    ctx.ellipse(gMx, gMy + 1, 2, 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(170,110,80,0.25)';
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.arc(gMx, gMy + 0.3, 2.5, 0.15, Math.PI - 0.15);
    ctx.stroke();
    ctx.lineWidth = 1;

    // Cheeks
    for (const side of [-1, 1]) {
      const chGrad = ctx.createRadialGradient(side * 7, headY + 2, 0, side * 7, headY + 2, 3.5);
      chGrad.addColorStop(0, 'rgba(255, 140, 130, 0.25)');
      chGrad.addColorStop(1, 'rgba(255, 140, 130, 0)');
      ctx.fillStyle = chGrad;
      ctx.beginPath();
      ctx.ellipse(side * 7, headY + 2, 3.5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
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

// ---- Vehicles (bikes, scooter, rollerblades) ----
function renderVehicles(ctx: CanvasRenderingContext2D, state: GameState): void {
  const cam = state.camera;
  const viewLeft = cam.x;
  const viewRight = cam.x + CANVAS_W / cam.zoom;

  for (const v of state.vehicles) {
    // Skip active vehicle (rendered with player)
    if (v.active) continue;
    // Frustum culling
    if (v.x < viewLeft - 60 || v.x > viewRight + 60) continue;

    ctx.save();
    renderSingleVehicle(ctx, v.type, v.x, v.y, v.dir, 0, 0, state.time);
    ctx.restore();

    // Label above parked vehicle
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    const def = VEHICLE_DEFS[v.type];
    ctx.fillText(def.label, v.x, v.y - 15);
    ctx.fillStyle = '#FFD700';
    ctx.fillText('B', v.x, v.y - 5);
  }

  // Render active vehicle on player
  if (state.activeVehicle) {
    const v = state.activeVehicle;
    const px = state.player.x + state.player.w / 2;
    const py = state.player.y + state.player.h;
    ctx.save();
    renderSingleVehicle(ctx, v.type, px, py, v.dir, v.wheelieAngle, v.airRotation, state.time);
    ctx.restore();

    // Trick state indicator
    if (v.trickState !== 'none') {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      const td = TRICK_DEFS[v.trickState];
      const trickLabel = td ? `${td.emoji} ${td.name}!` : v.trickState;
      ctx.fillStyle = td?.color || ctx.fillStyle;
      ctx.fillText(trickLabel, px, state.player.y - 20);
    }

    // Combo indicator
    if (v.comboCount > 1) {
      ctx.fillStyle = '#FF5722';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${v.comboCount}x COMBO`, px, state.player.y - 36);
    }
  }
}

function renderSingleVehicle(ctx: CanvasRenderingContext2D, type: string, x: number, y: number, dir: 1 | -1, wheelieAngle: number, airRotation: number, time: number): void {
  ctx.save();
  ctx.translate(x, y);
  if (dir === -1) ctx.scale(-1, 1);

  // Apply rotation for tricks
  if (airRotation > 0 && airRotation < 360) {
    ctx.rotate((airRotation * Math.PI) / 180);
  }
  if (wheelieAngle > 0) {
    ctx.rotate((-wheelieAngle * Math.PI) / 180);
  }

  switch (type) {
    case 'scooter': drawScooter(ctx, time); break;
    case 'rollerblades': drawRollerblades(ctx, time); break;
    case 'bike_kid': drawBikeKid(ctx, time); break;
    case 'bike_bmx': drawBikeBMX(ctx, time); break;
    case 'bike_mountain': drawBikeMountain(ctx, time); break;
    case 'bike_road': drawBikeRoad(ctx, time); break;
  }
  ctx.restore();
}

function drawScooter(ctx: CanvasRenderingContext2D, _time: number): void {
  // Deck
  ctx.fillStyle = '#333';
  ctx.fillRect(-18, -6, 36, 4);
  // Handle bar
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(14, -6);
  ctx.lineTo(14, -30);
  ctx.stroke();
  // Handlebars
  ctx.beginPath();
  ctx.moveTo(8, -30);
  ctx.lineTo(20, -30);
  ctx.stroke();
  // Front wheel
  ctx.fillStyle = '#444';
  ctx.beginPath();
  ctx.arc(14, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#888';
  ctx.beginPath();
  ctx.arc(14, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  // Rear wheel
  ctx.fillStyle = '#444';
  ctx.beginPath();
  ctx.arc(-14, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#888';
  ctx.beginPath();
  ctx.arc(-14, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawRollerblades(ctx: CanvasRenderingContext2D, _time: number): void {
  // Boot shape
  ctx.fillStyle = '#E53935';
  ctx.beginPath();
  ctx.roundRect(-12, -16, 24, 14, 3);
  ctx.fill();
  // Frame
  ctx.fillStyle = '#666';
  ctx.fillRect(-14, -2, 28, 3);
  // Wheels (4 in line)
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(-10 + i * 7, 4, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#999';
    ctx.beginPath();
    ctx.arc(-10 + i * 7, 4, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBikeKid(ctx: CanvasRenderingContext2D, _time: number): void {
  drawBikeBase(ctx, '#FF9800', 6, 6, true);
  // Basket on front
  ctx.strokeStyle = '#8D6E63';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(10, -24, 10, 8, 2);
  ctx.stroke();
  // Streamers from handlebars
  ctx.strokeStyle = '#E91E63';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(18, -22);
  ctx.bezierCurveTo(22, -18, 20, -14, 24, -12);
  ctx.stroke();
}

function drawBikeBMX(ctx: CanvasRenderingContext2D, _time: number): void {
  drawBikeBase(ctx, '#9C27B0', 7, 5, false);
  // Pegs on wheels
  ctx.fillStyle = '#CCC';
  ctx.fillRect(-20, -3, 4, 6);
  ctx.fillRect(16, -3, 4, 6);
}

function drawBikeMountain(ctx: CanvasRenderingContext2D, _time: number): void {
  drawBikeBase(ctx, '#2E7D32', 8, 7, false);
  // Front suspension fork
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(14, -18);
  ctx.lineTo(16, -8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(16, -18);
  ctx.lineTo(18, -8);
  ctx.stroke();
}

function drawBikeRoad(ctx: CanvasRenderingContext2D, _time: number): void {
  drawBikeBase(ctx, '#1565C0', 7, 5, false);
  // Drop handlebars
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(14, -22);
  ctx.bezierCurveTo(20, -22, 22, -18, 20, -14);
  ctx.stroke();
}

function drawBikeBase(ctx: CanvasRenderingContext2D, frameColor: string, wheelR: number, hubR: number, hasGuards: boolean): void {
  // Frame (triangle)
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-14, 0);    // rear axle
  ctx.lineTo(0, -20);    // top tube
  ctx.lineTo(14, 0);     // front axle
  ctx.closePath();
  ctx.stroke();
  // Seat tube
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(-6, -26);   // saddle
  ctx.stroke();
  // Saddle
  ctx.fillStyle = '#333';
  ctx.fillRect(-10, -28, 10, 3);
  // Handlebars
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(14, -20);
  ctx.stroke();
  // Rear wheel
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(-14, 0, wheelR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#999';
  ctx.beginPath();
  ctx.arc(-14, 0, hubR > wheelR ? wheelR - 1 : hubR * 0.5, 0, Math.PI * 2);
  ctx.fill();
  // Front wheel
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(14, 0, wheelR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#999';
  ctx.beginPath();
  ctx.arc(14, 0, hubR > wheelR ? wheelR - 1 : hubR * 0.5, 0, Math.PI * 2);
  ctx.fill();
  // Mudguards
  if (hasGuards) {
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-14, 0, wheelR + 2, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(14, 0, wheelR + 2, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();
  }
  // Pedals
  ctx.fillStyle = '#555';
  ctx.fillRect(-4, -2, 8, 4);
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

  // Stars — numeric display
  ctx.textBaseline = 'middle';
  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.fillText('⭐', 22, 30);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#FFF';
  ctx.fillText(`${state.stars}/${state.totalStarsAvailable}`, 44, 30);

  // Season indicator
  const seasonEmoji = { wiosna: '🌸', lato: '☀️', jesien: '🍂', zima: '❄️' }[state.season] || '🌸';
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#FFF';
  ctx.fillText(seasonEmoji, 120, 30);

  // Score
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#CCC';
  ctx.fillText(`${state.score} pkt`, 140, 30);

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

// ============================================
// NEW SYSTEMS — 10 improvements render funcs
// ============================================

// ---- 1. Parallax Clouds + distant scenery ----
function renderParallaxClouds(ctx: CanvasRenderingContext2D, state: GameState): void {
  const cam = state.camera;

  // Distant mountains (parallax layer 0 — very slow)
  const mountainParallax = 0.1;
  const mBaseX = cam.x * mountainParallax;
  ctx.fillStyle = '#B0BEC5';
  for (let i = -2; i < 6; i++) {
    const mx = i * 400 - mBaseX % 400;
    const worldMx = cam.x + mx;
    ctx.beginPath();
    ctx.moveTo(worldMx - 200, 200);
    ctx.lineTo(worldMx, 40 + (i % 3) * 30);
    ctx.lineTo(worldMx + 200, 200);
    ctx.fill();
  }
  // Darker closer mountains
  ctx.fillStyle = '#90A4AE';
  for (let i = -2; i < 6; i++) {
    const mx = i * 350 - (cam.x * 0.15) % 350;
    const worldMx = cam.x + mx;
    ctx.beginPath();
    ctx.moveTo(worldMx - 160, 220);
    ctx.lineTo(worldMx + 20, 80 + (i % 2) * 40);
    ctx.lineTo(worldMx + 180, 220);
    ctx.fill();
  }

  // ---- Warsaw skyline silhouette (between mountains and trees) ----
  const skylineParallax = 0.12;
  const skyBaseX = cam.x * skylineParallax;
  const skyY = 230; // baseline for buildings
  // Building definitions: [offsetX, width, height, hasSpire]
  // PKiN is tallest (idx 4), with its characteristic spire
  const buildings: [number, number, number, boolean][] = [
    [0, 30, 55, false],     // apartment block
    [40, 22, 70, false],    // office tower
    [70, 18, 48, false],    // small block
    [95, 28, 90, false],    // Marriott-like
    [130, 35, 130, true],   // PKiN (Pałac Kultury i Nauki) with spire!
    [175, 24, 85, false],   // InterContinental-like
    [208, 20, 60, false],   // Rondo 1
    [235, 26, 95, false],   // Warsaw Spire-like
    [270, 18, 50, false],   // smaller
    [295, 32, 75, false],   // Złota 44-like
    [335, 22, 55, false],   // apartment
    [365, 16, 40, false],   // small
    [390, 28, 65, false],   // office
    [425, 20, 45, false],   // apartment
  ];
  const skylineRepeat = 460;
  for (let rep = -2; rep < 5; rep++) {
    const repOffset = rep * skylineRepeat - skyBaseX % skylineRepeat;
    for (const [ox, bw, bh, hasSpire] of buildings) {
      const bx = cam.x + repOffset + ox;
      const by = skyY - bh;
      // Building body — dark silhouette
      ctx.fillStyle = '#546E7A';
      ctx.fillRect(bx, by, bw, bh);
      // Windows (tiny lit dots)
      ctx.fillStyle = 'rgba(255, 235, 150, 0.4)';
      const rows = Math.floor(bh / 10);
      const cols = Math.floor(bw / 8);
      for (let r = 1; r < rows; r++) {
        for (let c = 1; c < cols; c++) {
          if ((r + c + rep) % 3 !== 0) { // some windows lit
            ctx.fillRect(bx + c * 8 - 1, by + r * 10, 3, 4);
          }
        }
      }
      // PKiN spire
      if (hasSpire) {
        ctx.fillStyle = '#546E7A';
        ctx.beginPath();
        ctx.moveTo(bx + bw / 2 - 4, by);
        ctx.lineTo(bx + bw / 2, by - 35);
        ctx.lineTo(bx + bw / 2 + 4, by);
        ctx.fill();
        // Spire tip antenna
        ctx.strokeStyle = '#546E7A';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx + bw / 2, by - 35);
        ctx.lineTo(bx + bw / 2, by - 50);
        ctx.stroke();
        // Red light on top
        ctx.fillStyle = '#FF3333';
        ctx.globalAlpha = 0.6 + Math.sin(state.time * 2) * 0.3;
        ctx.beginPath();
        ctx.arc(bx + bw / 2, by - 50, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  // Distant tree silhouettes (parallax layer 1)
  const treeParallax = 0.2;
  const tBaseX = cam.x * treeParallax;
  ctx.fillStyle = '#66BB6A';
  for (let i = -3; i < 10; i++) {
    const tx = i * 180 - tBaseX % 180;
    const worldTx = cam.x + tx;
    const th = 60 + (i * 37 % 30);
    // Tree trunk
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(worldTx - 4, 280 - th + 30, 8, th - 30);
    // Tree crown
    ctx.fillStyle = '#66BB6A';
    ctx.beginPath();
    ctx.arc(worldTx, 280 - th + 20, 25 + (i % 3) * 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Clouds (3 layers with different speeds)
  for (const cloud of state.parallaxClouds) {
    const layerAlpha = [0.3, 0.5, 0.7][cloud.layer] || 0.5;
    ctx.globalAlpha = cloud.opacity * layerAlpha;
    ctx.fillStyle = '#FFFFFF';

    const cx = cloud.x;
    const cy = cloud.y;
    const cw = cloud.w;

    // Cloud shape (overlapping circles)
    ctx.beginPath();
    ctx.arc(cx + cw * 0.3, cy, cw * 0.25, 0, Math.PI * 2);
    ctx.arc(cx + cw * 0.5, cy - cw * 0.1, cw * 0.3, 0, Math.PI * 2);
    ctx.arc(cx + cw * 0.7, cy, cw * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---- 2. Day/Night overlay ----
function renderDayNightOverlay(ctx: CanvasRenderingContext2D, state: GameState): void {
  const t = state.dayTime; // 0-1 (0=sunrise, 0.25=noon, 0.5=sunset, 0.75=midnight)

  // Calculate darkness (0 = full bright, 1 = full dark)
  let darkness = 0;
  if (t > 0.6 && t < 0.9) {
    // Evening to night
    darkness = (t - 0.6) / 0.3;
  } else if (t >= 0.9 || t < 0.05) {
    // Deep night
    darkness = 1;
  } else if (t >= 0.05 && t < 0.15) {
    // Dawn
    darkness = 1 - (t - 0.05) / 0.1;
  }

  if (darkness <= 0.01) return;

  // Night overlay
  ctx.fillStyle = `rgba(10, 15, 40, ${darkness * 0.55})`;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Stars at night
  if (darkness > 0.5) {
    const starAlpha = (darkness - 0.5) * 2;
    ctx.fillStyle = `rgba(255, 255, 220, ${starAlpha * 0.8})`;
    const starSeed = [
      [120, 50], [300, 80], [450, 30], [600, 70], [750, 45],
      [900, 60], [1050, 35], [200, 110], [550, 95], [850, 25],
      [100, 130], [380, 15], [700, 100], [1100, 55], [170, 75],
    ];
    for (const [sx, sy] of starSeed) {
      const twinkle = Math.sin(state.time * 3 + sx * 0.1) * 0.3 + 0.7;
      ctx.globalAlpha = starAlpha * twinkle;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Sunset tint
  if (t > 0.45 && t < 0.65) {
    const sunsetIntensity = t < 0.55 ? (t - 0.45) / 0.1 : (0.65 - t) / 0.1;
    ctx.fillStyle = `rgba(255, 100, 50, ${sunsetIntensity * 0.15})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }
}

// ---- 5. Dynamic room lighting ----
function renderRoomLighting(ctx: CanvasRenderingContext2D, state: GameState): void {
  const darkness = getDarkness(state.dayTime);
  if (darkness < 0.1) return; // No lights needed during day

  // Window light beams from outside
  for (const room of state.rooms) {
    if (room.name === 'Kuchnia' || room.name === 'Salon') {
      // Window glow during night (warm golden)
      ctx.fillStyle = `rgba(255, 235, 170, ${darkness * 0.15})`;
      const winX = room.x + room.w * 0.3;
      const winY = room.y + 30;
      ctx.beginPath();
      ctx.moveTo(winX, winY);
      ctx.lineTo(winX - 40, winY + room.h - 30);
      ctx.lineTo(winX + 80, winY + room.h - 30);
      ctx.lineTo(winX + 40, winY);
      ctx.fill();
    }
  }

  // Lamp glow for interactive lamps that are ON
  for (const obj of state.interactiveObjects) {
    if (obj.type === 'lamp' && obj.state) {
      const glowRadius = 100;
      const grd = ctx.createRadialGradient(
        obj.x + obj.w / 2, obj.y, 5,
        obj.x + obj.w / 2, obj.y + 40, glowRadius
      );
      grd.addColorStop(0, `rgba(255, 225, 160, ${0.3 * darkness})`);
      grd.addColorStop(1, 'rgba(255, 225, 160, 0)');
      ctx.fillStyle = grd;
      ctx.fillRect(obj.x - glowRadius, obj.y - 20, glowRadius * 2 + obj.w, glowRadius + 60);
    }

    // Projector cone of light
    if (obj.type === 'projector' && obj.state) {
      ctx.fillStyle = `rgba(255, 240, 200, ${0.08 * darkness})`;
      ctx.beginPath();
      ctx.moveTo(obj.x + obj.w / 2, obj.y + obj.h);
      ctx.lineTo(obj.x - 60, obj.y + obj.h + 160);
      ctx.lineTo(obj.x + obj.w + 60, obj.y + obj.h + 160);
      ctx.fill();
    }
  }
}

// Helper: get darkness level from dayTime
function getDarkness(dayTime: number): number {
  const t = dayTime;
  if (t > 0.6 && t < 0.9) return (t - 0.6) / 0.3;
  if (t >= 0.9 || t < 0.05) return 1;
  if (t >= 0.05 && t < 0.15) return 1 - (t - 0.05) / 0.1;
  return 0;
}

// ---- 6. Animated room backgrounds ----
function renderRoomAnimations(ctx: CanvasRenderingContext2D, state: GameState): void {
  const t = state.time;

  // Kitchen — wall clock
  const kitchenRoom = state.rooms.find(r => r.name === 'Kuchnia');
  if (kitchenRoom) {
    const clockX = kitchenRoom.x + 200;
    const clockY = kitchenRoom.y + 40;
    const clockR = 18;

    // Clock face
    ctx.fillStyle = '#FAFAFA';
    ctx.beginPath();
    ctx.arc(clockX, clockY, clockR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hour hand
    const hourAngle = (t * 0.01) % (Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX + Math.sin(hourAngle) * 10, clockY - Math.cos(hourAngle) * 10);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Minute hand
    const minAngle = (t * 0.12) % (Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX + Math.sin(minAngle) * 14, clockY - Math.cos(minAngle) * 14);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Second hand (red, thin)
    const secAngle = (t * 1.0) % (Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX + Math.sin(secAngle) * 15, clockY - Math.cos(secAngle) * 15);
    ctx.strokeStyle = '#E53935';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center dot
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(clockX, clockY, 2, 0, Math.PI * 2);
    ctx.fill();

    // Steam from kettle/stove area
    for (let i = 0; i < 3; i++) {
      const steamY = kitchenRoom.y + kitchenRoom.h - 60 - Math.sin(t * 2 + i) * 15 - i * 12;
      const steamX = kitchenRoom.x + 80 + Math.sin(t * 1.5 + i * 2) * 5;
      ctx.globalAlpha = 0.15 - i * 0.04;
      ctx.fillStyle = '#DDD';
      ctx.beginPath();
      ctx.arc(steamX, steamY, 5 + i * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Salon — curtains swaying
  const salonRoom = state.rooms.find(r => r.name === 'Salon');
  if (salonRoom) {
    const curtainX = salonRoom.x + salonRoom.w - 60;
    const curtainY = salonRoom.y + 10;
    const sway = Math.sin(t * 0.8) * 4;

    // Left curtain
    ctx.fillStyle = 'rgba(180, 140, 100, 0.5)';
    ctx.beginPath();
    ctx.moveTo(curtainX, curtainY);
    ctx.quadraticCurveTo(curtainX + sway, curtainY + 60, curtainX - 5, curtainY + 120);
    ctx.lineTo(curtainX + 15, curtainY + 120);
    ctx.quadraticCurveTo(curtainX + 15 + sway * 0.5, curtainY + 60, curtainX + 15, curtainY);
    ctx.fill();

    // Right curtain
    ctx.beginPath();
    ctx.moveTo(curtainX + 40, curtainY);
    ctx.quadraticCurveTo(curtainX + 40 - sway, curtainY + 60, curtainX + 45, curtainY + 120);
    ctx.lineTo(curtainX + 25, curtainY + 120);
    ctx.quadraticCurveTo(curtainX + 25 - sway * 0.5, curtainY + 60, curtainX + 25, curtainY);
    ctx.fill();
  }

  // Pokój Jurka — aquarium
  const jurekRoom = state.rooms.find(r => r.name === 'Pokój Jurka');
  if (jurekRoom) {
    const aqX = jurekRoom.x + jurekRoom.w - 70;
    const aqY = jurekRoom.y + jurekRoom.h - 80;
    const aqW = 50;
    const aqH = 35;

    // Tank
    ctx.fillStyle = 'rgba(100, 180, 255, 0.3)';
    ctx.fillRect(aqX, aqY, aqW, aqH);
    ctx.strokeStyle = '#78909C';
    ctx.lineWidth = 2;
    ctx.strokeRect(aqX, aqY, aqW, aqH);

    // Fish
    const fishX = aqX + 15 + Math.sin(t * 1.5) * 12;
    const fishY = aqY + 12 + Math.sin(t * 2.3) * 5;
    ctx.fillStyle = '#FF7043';
    ctx.beginPath();
    ctx.ellipse(fishX, fishY, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tail
    const tailDir = Math.sin(t * 1.5) > 0 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(fishX + tailDir * 5, fishY);
    ctx.lineTo(fishX + tailDir * 9, fishY - 3);
    ctx.lineTo(fishX + tailDir * 9, fishY + 3);
    ctx.fill();

    // Bubbles
    for (let i = 0; i < 3; i++) {
      const bx = aqX + 10 + i * 15;
      const by = aqY + aqH - 5 - ((t * 20 + i * 30) % aqH);
      ctx.fillStyle = 'rgba(200, 230, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(bx, by, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gravel
    ctx.fillStyle = '#A1887F';
    ctx.fillRect(aqX + 1, aqY + aqH - 5, aqW - 2, 4);
  }

  // Sypialnia — washing machine (pralka) visible through bathroom area
  const sypialniaRoom = state.rooms.find(r => r.name === 'Sypialnia');
  if (sypialniaRoom) {
    const wmX = sypialniaRoom.x + 20;
    const wmY = sypialniaRoom.y + sypialniaRoom.h - 55;

    // Machine body
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(wmX, wmY, 35, 40);
    ctx.strokeStyle = '#BDBDBD';
    ctx.lineWidth = 1;
    ctx.strokeRect(wmX, wmY, 35, 40);

    // Door circle (spinning when active)
    ctx.strokeStyle = '#90A4AE';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(wmX + 17, wmY + 24, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Spinning clothes inside
    const spinAngle = t * 4;
    ctx.fillStyle = 'rgba(100, 150, 200, 0.3)';
    ctx.beginPath();
    ctx.arc(wmX + 17 + Math.cos(spinAngle) * 5, wmY + 24 + Math.sin(spinAngle) * 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(200, 100, 100, 0.3)';
    ctx.beginPath();
    ctx.arc(wmX + 17 + Math.cos(spinAngle + Math.PI) * 5, wmY + 24 + Math.sin(spinAngle + Math.PI) * 5, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---- 8. Companion Franek rendering ----
function renderCompanionFranek(ctx: CanvasRenderingContext2D, state: GameState): void {
  const comp = state.companionFranek;
  if (!comp) return;

  ctx.save();
  ctx.translate(comp.x + 12, comp.y);

  const dir = comp.dir;
  if (dir === -1) {
    ctx.scale(-1, 1);
    ctx.translate(-24, 0);
  }

  const wag = Math.sin(comp.tailWag) * 0.3;
  const bounce = Math.abs(comp.vx) > 0.5 ? Math.sin(state.time * 12) * 2 : 0;

  ctx.translate(0, bounce);

  // Body (white Spitz — fluffy oval)
  ctx.fillStyle = COLORS.franekFur;
  ctx.beginPath();
  ctx.ellipse(12, 28, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Chest fluff
  ctx.fillStyle = COLORS.franekFurChest;
  ctx.beginPath();
  ctx.ellipse(18, 26, 6, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = COLORS.franekFur;
  ctx.beginPath();
  ctx.arc(20, 18, 9, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = COLORS.franekFur;
  ctx.beginPath();
  ctx.moveTo(15, 12);
  ctx.lineTo(13, 4);
  ctx.lineTo(18, 10);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(23, 12);
  ctx.lineTo(25, 4);
  ctx.lineTo(20, 10);
  ctx.fill();

  // Inner ears
  ctx.fillStyle = COLORS.franekEarInner;
  ctx.beginPath();
  ctx.moveTo(16, 11);
  ctx.lineTo(14.5, 6);
  ctx.lineTo(17.5, 10);
  ctx.fill();

  // Eyes
  ctx.fillStyle = COLORS.franekEyes;
  ctx.beginPath();
  ctx.arc(17, 17, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(23, 17, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(17.5, 16.5, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(23.5, 16.5, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = COLORS.franekNose;
  ctx.beginPath();
  ctx.ellipse(26, 18, 2.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tongue (when happy/excited)
  if (comp.emotion === 'happy' || comp.emotion === 'excited') {
    ctx.fillStyle = COLORS.franekTongue;
    ctx.beginPath();
    ctx.ellipse(27, 22 + Math.sin(state.time * 3) * 0.5, 2, 3, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Legs
  ctx.fillStyle = COLORS.franekFur;
  const legPhase = Math.abs(comp.vx) > 0.3 ? state.time * 10 : 0;
  // Front legs
  ctx.fillRect(17 + Math.sin(legPhase) * 2, 35, 3, 8);
  ctx.fillRect(21 - Math.sin(legPhase) * 2, 35, 3, 8);
  // Back legs
  ctx.fillRect(5 - Math.sin(legPhase) * 2, 34, 3, 9);
  ctx.fillRect(9 + Math.sin(legPhase) * 2, 34, 3, 9);

  // Tail (wagging!)
  ctx.save();
  ctx.translate(2, 22);
  ctx.rotate(-0.8 + wag);
  ctx.fillStyle = COLORS.franekFur;
  ctx.beginPath();
  ctx.ellipse(0, -8, 4, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Fluffy tail tip
  ctx.fillStyle = COLORS.franekFurChest;
  ctx.beginPath();
  ctx.arc(0, -14, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Emotion indicator
  if (comp.emotion === 'alert') {
    ctx.font = '12px sans-serif';
    ctx.fillText('❗', 16, -2);
  } else if (comp.emotion === 'excited') {
    ctx.font = '10px sans-serif';
    ctx.fillText('💕', 16, -2);
  }

  ctx.restore();
}

// ==========================================
// EXPANDED MAP RENDERERS
// ==========================================

// ---- Skate Park (x:-4500 to -3500) ----
function renderSkatePark(ctx: CanvasRenderingContext2D, state: GameState): void {
  const cam = state.camera;
  if (cam.x > -3400 || cam.x + CANVAS_W / cam.zoom < -4600) return; // frustum cull

  const gY = 556;
  const sx = SKATE_PARK.startX;
  const ex = SKATE_PARK.endX;

  // Concrete ground
  ctx.fillStyle = '#B0B0B0';
  ctx.fillRect(sx, gY - 4, ex - sx, 8);

  // Halfpipe (U shape)
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(sx + 50, gY);
  ctx.quadraticCurveTo(sx + 50, gY - 160, sx + 200, gY - 160);
  ctx.lineTo(sx + 800, gY - 160);
  ctx.quadraticCurveTo(sx + 950, gY - 160, sx + 950, gY);
  ctx.stroke();

  // Halfpipe surface fill
  ctx.fillStyle = '#C8C8C8';
  ctx.beginPath();
  ctx.moveTo(sx + 50, gY);
  ctx.quadraticCurveTo(sx + 50, gY - 150, sx + 200, gY - 150);
  ctx.lineTo(sx + 800, gY - 150);
  ctx.quadraticCurveTo(sx + 950, gY - 150, sx + 950, gY);
  ctx.closePath();
  ctx.fill();

  // Grind rail
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(sx + 500, gY - 46);
  ctx.lineTo(sx + 700, gY - 46);
  ctx.stroke();
  // Rail supports
  ctx.fillStyle = '#555';
  ctx.fillRect(sx + 520, gY - 46, 4, 46);
  ctx.fillRect(sx + 680, gY - 46, 4, 46);

  // Graffiti wall (background)
  ctx.fillStyle = '#D0D0D0';
  ctx.fillRect(sx + 30, gY - 280, 200, 180);
  // Graffiti colors
  const graffiti = ['#E53935', '#FF9800', '#4CAF50', '#2196F3', '#9C27B0'];
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = graffiti[i];
    const gx = sx + 50 + i * 35;
    ctx.beginPath();
    ctx.arc(gx, gY - 210 + Math.sin(i * 2) * 20, 15, 0, Math.PI * 2);
    ctx.fill();
  }

  // LED lights on halfpipe edges
  const t = state.time || 0;
  for (let i = 0; i < 6; i++) {
    const lx = sx + 100 + i * 150;
    const hue = ((t * 60 + i * 60) % 360);
    ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
    ctx.beginPath();
    ctx.arc(lx, gY - 155, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Label
  ctx.fillStyle = '#666';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🛹 SKATE PARK', (sx + ex) / 2, gY - 290);
}

// ---- Basketball Court (x:-3400 to -2600) ----
function renderBasketballCourt(ctx: CanvasRenderingContext2D, state: GameState): void {
  const cam = state.camera;
  if (cam.x > -2500 || cam.x + CANVAS_W / cam.zoom < -3500) return;

  const gY = 556;
  const sx = BASKETBALL.startX;
  const ex = BASKETBALL.endX;
  const midX = (sx + ex) / 2;

  // Orange court surface
  ctx.fillStyle = '#E67E22';
  ctx.fillRect(sx, gY - 4, ex - sx, 8);
  ctx.fillStyle = 'rgba(230, 126, 34, 0.3)';
  ctx.fillRect(sx, gY - 200, ex - sx, 200);

  // Court lines
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 2;
  // Center line
  ctx.beginPath();
  ctx.moveTo(midX, gY);
  ctx.lineTo(midX, gY - 200);
  ctx.stroke();
  // Center circle
  ctx.beginPath();
  ctx.arc(midX, gY - 100, 50, 0, Math.PI * 2);
  ctx.stroke();

  // Left hoop
  ctx.fillStyle = '#333';
  ctx.fillRect(sx + 30, gY - 180, 8, 180); // pole
  ctx.fillStyle = '#FFF';
  ctx.fillRect(sx + 20, gY - 190, 50, 30); // backboard
  ctx.strokeStyle = '#E53935';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(sx + 55, gY - 160, 15, 0, Math.PI * 2);
  ctx.stroke();

  // Right hoop
  ctx.fillStyle = '#333';
  ctx.fillRect(ex - 38, gY - 180, 8, 180);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(ex - 70, gY - 190, 50, 30);
  ctx.strokeStyle = '#E53935';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(ex - 55, gY - 160, 15, 0, Math.PI * 2);
  ctx.stroke();

  // Label
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏀 BOISKO', midX, gY - 210);
}

// ---- Bike Path (x:-2500 to -1700) ----
function renderBikePath(ctx: CanvasRenderingContext2D, state: GameState): void {
  const cam = state.camera;
  if (cam.x > -1600 || cam.x + CANVAS_W / cam.zoom < -2600) return;

  const gY = 556;
  const sx = BIKE_PATH.startX;
  const ex = BIKE_PATH.endX;

  // Dirt/asphalt surface
  ctx.fillStyle = '#8D7B68';
  ctx.fillRect(sx, gY - 6, ex - sx, 10);
  ctx.fillStyle = 'rgba(120, 100, 80, 0.2)';
  ctx.fillRect(sx + 20, gY - 70, ex - sx - 40, 74);

  // === SLALOM CONES (-2450 to -2300) ===
  const coneStart = -2450;
  for (let i = 0; i < 6; i++) {
    const cx = coneStart + i * 25;
    const cy = gY - 2;
    // Cone
    ctx.fillStyle = '#FF6D00';
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy);
    ctx.lineTo(cx, cy - 18);
    ctx.lineTo(cx + 6, cy);
    ctx.closePath();
    ctx.fill();
    // White stripes
    ctx.fillStyle = '#FFF';
    ctx.fillRect(cx - 4, cy - 8, 8, 3);
    ctx.fillRect(cx - 2, cy - 14, 4, 2);
  }

  // === SMALL RAMP (-2220) ===
  ctx.fillStyle = '#78909C';
  ctx.beginPath();
  ctx.moveTo(-2250, gY);
  ctx.lineTo(-2220, gY - 36);
  ctx.lineTo(-2200, gY - 36);
  ctx.lineTo(-2170, gY);
  ctx.closePath();
  ctx.fill();
  // Ramp surface
  ctx.strokeStyle = '#546E7A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2250, gY);
  ctx.lineTo(-2220, gY - 36);
  ctx.lineTo(-2200, gY - 36);
  ctx.lineTo(-2170, gY);
  ctx.stroke();
  // Ramp label
  ctx.fillStyle = '#FFF';
  ctx.font = '8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RAMPA', -2210, gY - 16);

  // === KICKER (-2080) ===
  ctx.fillStyle = '#6D4C41';
  ctx.beginPath();
  ctx.moveTo(-2100, gY);
  ctx.lineTo(-2080, gY - 30);
  ctx.lineTo(-2060, gY);
  ctx.closePath();
  ctx.fill();
  // Kicker arrow up
  ctx.strokeStyle = '#FFD600';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2080, gY - 10);
  ctx.lineTo(-2080, gY - 28);
  ctx.moveTo(-2084, gY - 24);
  ctx.lineTo(-2080, gY - 28);
  ctx.lineTo(-2076, gY - 24);
  ctx.stroke();

  // === BERM / BANKED TURN (-1960) ===
  ctx.fillStyle = '#8D6E63';
  ctx.beginPath();
  ctx.moveTo(-1960, gY);
  ctx.quadraticCurveTo(-1910, gY - 40, -1860, gY);
  ctx.lineTo(-1860, gY + 4);
  ctx.lineTo(-1960, gY + 4);
  ctx.closePath();
  ctx.fill();
  // Berm surface marking
  ctx.strokeStyle = '#A1887F';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(-1955, gY - 2);
  ctx.quadraticCurveTo(-1910, gY - 38, -1865, gY - 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // === DIRT JUMPS (3 bumps) ===
  const jumps = [
    { x: -1830, h: 26 },
    { x: -1790, h: 36 },
    { x: -1750, h: 26 },
  ];
  for (const j of jumps) {
    ctx.fillStyle = '#795548';
    ctx.beginPath();
    ctx.moveTo(j.x - 15, gY);
    ctx.quadraticCurveTo(j.x, gY - j.h, j.x + 15, gY);
    ctx.closePath();
    ctx.fill();
    // Grass on top
    ctx.strokeStyle = '#66BB6A';
    ctx.lineWidth = 1;
    for (let g = -8; g < 8; g += 4) {
      ctx.beginPath();
      ctx.moveTo(j.x + g, gY - j.h * 0.7 - 2);
      ctx.lineTo(j.x + g + 1, gY - j.h * 0.7 - 8);
      ctx.stroke();
    }
  }

  // === FINISH LINE (-1700) ===
  const flX = -1700;
  // Checkered flag pattern
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 2; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#000' : '#FFF';
      ctx.fillRect(flX - 4 + c * 4, gY - 60 + r * 10, 4, 10);
    }
  }
  // Flag pole
  ctx.fillStyle = '#333';
  ctx.fillRect(flX - 1, gY - 70, 2, 70);

  // Background trees (smaller)
  for (let i = 0; i < 3; i++) {
    const tx = sx + 60 + i * 300;
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(tx - 3, gY - 90, 6, 90);
    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.arc(tx, gY - 105, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  // Track label
  ctx.fillStyle = '#FF6D00';
  ctx.fillRect((sx + ex) / 2 - 70, gY - 180, 140, 24);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🚴 BMX PUMP TRACK', (sx + ex) / 2, gY - 163);

  // Tire marks (decorative)
  ctx.strokeStyle = 'rgba(60, 60, 60, 0.2)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 12]);
  ctx.beginPath();
  ctx.moveTo(sx + 50, gY - 1);
  ctx.lineTo(ex - 50, gY - 1);
  ctx.stroke();
  ctx.setLineDash([]);
}

// ---- Park Transition (green space between zones) ----
function renderParkTransition(ctx: CanvasRenderingContext2D, state: GameState, fromX: number, toX: number): void {
  const cam = state.camera;
  if (cam.x > toX + 100 || cam.x + CANVAS_W / cam.zoom < fromX - 100) return;

  const gY = 556;
  const w = toX - fromX;

  // Grass patch
  ctx.fillStyle = '#66BB6A';
  ctx.fillRect(fromX, gY - 4, w, 8);

  // Trees
  const treeCount = Math.max(2, Math.floor(w / 120));
  for (let i = 0; i < treeCount; i++) {
    const tx = fromX + 60 + i * (w - 120) / (treeCount - 1);
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(tx - 4, gY - 100, 8, 100);
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(tx, gY - 115, 25, 0, Math.PI * 2);
    ctx.fill();
  }

  // Path/walkway
  ctx.fillStyle = '#D7CEC7';
  ctx.fillRect(fromX + 20, gY - 8, w - 40, 12);

  // Bench
  const bx = fromX + w / 2 - 20;
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(bx, gY - 28, 40, 5);
  ctx.fillRect(bx + 3, gY - 28, 3, 28);
  ctx.fillRect(bx + 34, gY - 28, 3, 28);
}

// ---- Przedszkole Exterior (x:3500, w:1600) ----
function renderPrzedszkoleExterior(ctx: CanvasRenderingContext2D, state: GameState): void {
  const cam = state.camera;
  const px = PRZEDSZKOLE.x;
  const pw = PRZEDSZKOLE.w;
  if (cam.x > px + pw + 100 || cam.x + CANVAS_W / cam.zoom < px - 100) return;

  const gY = 556;
  const roofY = 70;

  // Main building — draw with entrance gap on the left side (y:420-556)
  ctx.fillStyle = PRZEDSZKOLE.wallColor;
  // Upper portion (full width, from roof to gap top)
  ctx.fillRect(px, roofY + 30, pw, 420 - roofY - 30);
  // Lower portion left of entrance gap (none — entrance is at x:px)
  // Lower portion right of entrance (from px+80 to end, y:420 to ground)
  ctx.fillRect(px + 80, 420, pw - 80, gY - 420);

  // Left entrance opening — draw visible door frame
  // Door frame
  ctx.fillStyle = '#FF8F00';
  ctx.fillRect(px - 4, 420, 8, gY - 420);    // left frame pillar
  ctx.fillRect(px + 76, 420, 8, gY - 420);   // right frame pillar
  ctx.fillRect(px - 4, 414, 88, 8);           // top beam
  // Open door (swung inward — darker inside visible)
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(px + 4, 422, 68, gY - 424);
  // Door welcome mat
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(px + 10, gY - 8, 56, 8);
  // "WEJŚCIE" label above door
  ctx.fillStyle = '#FF8F00';
  ctx.fillRect(px + 4, 396, 72, 18);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WEJŚCIE →', px + 40, 409);

  // Roof
  ctx.fillStyle = PRZEDSZKOLE.roofColor;
  ctx.beginPath();
  ctx.moveTo(px - 20, roofY + 30);
  ctx.lineTo(px + pw / 2, roofY);
  ctx.lineTo(px + pw + 20, roofY + 30);
  ctx.closePath();
  ctx.fill();

  // Windows (parter) — start after entrance
  for (let i = 0; i < 5; i++) {
    const wx = px + 140 + i * 280;
    if (wx + 80 > px + pw) break;
    ctx.fillStyle = '#81D4FA';
    ctx.fillRect(wx, 380, 80, 60);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(wx, 380, 80, 60);
    // Window cross
    ctx.beginPath();
    ctx.moveTo(wx + 40, 380);
    ctx.lineTo(wx + 40, 440);
    ctx.moveTo(wx, 410);
    ctx.lineTo(wx + 80, 410);
    ctx.stroke();
  }

  // Windows (piętro)
  for (let i = 0; i < 6; i++) {
    const wx = px + 60 + i * 250;
    if (wx + 80 > px + pw) break;
    ctx.fillStyle = '#81D4FA';
    ctx.fillRect(wx, 150, 80, 60);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(wx, 150, 80, 60);
    ctx.beginPath();
    ctx.moveTo(wx + 40, 150);
    ctx.lineTo(wx + 40, 210);
    ctx.moveTo(wx, 180);
    ctx.lineTo(wx + 80, 180);
    ctx.stroke();
  }

  // Central decorative entrance (secondary — visual only)
  ctx.fillStyle = '#FF8F00';
  ctx.fillRect(px + pw / 2 - 30, gY - 120, 60, 120);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(px + pw / 2 - 20, gY - 110, 40, 50);

  // Sign
  ctx.fillStyle = '#FF8F00';
  const signW = 300;
  ctx.fillRect(px + pw / 2 - signW / 2, roofY + 35, signW, 30);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(PRZEDSZKOLE.signText, px + pw / 2, roofY + 55);

  // Playground (in front of building)
  // Swing
  const swX = px + 200;
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(swX, gY - 80);
  ctx.lineTo(swX + 60, gY - 80);
  ctx.stroke();
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(swX, gY - 80);
  ctx.lineTo(swX, gY);
  ctx.moveTo(swX + 60, gY - 80);
  ctx.lineTo(swX + 60, gY);
  ctx.stroke();
  // Swing seat
  ctx.fillStyle = '#E53935';
  ctx.fillRect(swX + 20, gY - 40, 20, 4);
  ctx.strokeStyle = '#666';
  ctx.beginPath();
  ctx.moveTo(swX + 20, gY - 80);
  ctx.lineTo(swX + 20, gY - 40);
  ctx.moveTo(swX + 40, gY - 80);
  ctx.lineTo(swX + 40, gY - 40);
  ctx.stroke();

  // Slide
  const slX = px + pw - 300;
  ctx.fillStyle = '#FFD600';
  ctx.beginPath();
  ctx.moveTo(slX, gY - 70);
  ctx.lineTo(slX + 80, gY);
  ctx.lineTo(slX + 80, gY - 5);
  ctx.lineTo(slX + 5, gY - 65);
  ctx.closePath();
  ctx.fill();
  // Slide ladder
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(slX - 10, gY);
  ctx.lineTo(slX - 10, gY - 75);
  ctx.moveTo(slX + 5, gY);
  ctx.lineTo(slX + 5, gY - 75);
  ctx.stroke();
  for (let r = 0; r < 4; r++) {
    ctx.fillStyle = '#888';
    ctx.fillRect(slX - 10, gY - 20 - r * 15, 15, 3);
  }

  // Colorful fence around playground
  ctx.strokeStyle = '#FF8F00';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(px + 140, gY - 90, pw - 280, 94);
  ctx.setLineDash([]);
}

// ---- Szkoła Exterior (x:5500, w:2300) ----
function renderSzkolaExterior(ctx: CanvasRenderingContext2D, state: GameState): void {
  const cam = state.camera;
  const sx = SZKOLA.x;
  const sw = SZKOLA.w;
  if (cam.x > sx + sw + 100 || cam.x + CANVAS_W / cam.zoom < sx - 100) return;

  const gY = 556;
  const roofY = 60;

  // Main building — with entrance gap on left (y:420-556)
  ctx.fillStyle = SZKOLA.wallColor;
  // Upper portion (full width, from roof to gap top)
  ctx.fillRect(sx, roofY + 20, sw, 420 - roofY - 20);
  // Lower portion right of entrance (from sx+80 to end, y:420 to ground)
  ctx.fillRect(sx + 80, 420, sw - 80, gY - 420);

  // Left entrance opening — draw visible door frame
  ctx.fillStyle = '#37474F';
  ctx.fillRect(sx - 4, 420, 8, gY - 420);    // left frame pillar
  ctx.fillRect(sx + 76, 420, 8, gY - 420);   // right frame pillar
  ctx.fillRect(sx - 4, 414, 88, 8);           // top beam
  // Open door (visible inside)
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(sx + 4, 422, 68, gY - 424);
  // Welcome mat
  ctx.fillStyle = '#455A64';
  ctx.fillRect(sx + 10, gY - 8, 56, 8);
  // "WEJŚCIE" label
  ctx.fillStyle = '#37474F';
  ctx.fillRect(sx + 4, 396, 72, 18);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WEJŚCIE →', sx + 40, 409);

  // Roof (flat institutional style)
  ctx.fillStyle = SZKOLA.roofColor;
  ctx.fillRect(sx - 10, roofY + 10, sw + 20, 16);

  // Clock tower (center)
  const towerX = sx + sw / 2 - 30;
  ctx.fillStyle = '#546E7A';
  ctx.fillRect(towerX, roofY - 40, 60, 50);
  // Clock face
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(towerX + 30, roofY - 15, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Clock hands
  ctx.beginPath();
  ctx.moveTo(towerX + 30, roofY - 15);
  ctx.lineTo(towerX + 30, roofY - 28);
  ctx.moveTo(towerX + 30, roofY - 15);
  ctx.lineTo(towerX + 40, roofY - 12);
  ctx.stroke();

  // Windows (parter) — start after entrance
  for (let i = 0; i < 9; i++) {
    const wx = sx + 140 + i * 240;
    if (wx + 60 > sx + sw) break;
    ctx.fillStyle = '#90CAF9';
    ctx.fillRect(wx, 380, 60, 50);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(wx, 380, 60, 50);
    ctx.beginPath();
    ctx.moveTo(wx + 30, 380);
    ctx.lineTo(wx + 30, 430);
    ctx.stroke();
  }

  // Windows (piętro)
  for (let i = 0; i < 10; i++) {
    const wx = sx + 50 + i * 220;
    if (wx + 60 > sx + sw) break;
    ctx.fillStyle = '#90CAF9';
    ctx.fillRect(wx, 150, 60, 50);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(wx, 150, 60, 50);
    ctx.beginPath();
    ctx.moveTo(wx + 30, 150);
    ctx.lineTo(wx + 30, 200);
    ctx.stroke();
  }

  // Central decorative entrance (secondary — visual only)
  ctx.fillStyle = '#37474F';
  ctx.fillRect(sx + 120, gY - 130, 80, 130);
  ctx.fillStyle = '#90CAF9';
  ctx.fillRect(sx + 130, gY - 120, 28, 80);
  ctx.fillRect(sx + 162, gY - 120, 28, 80);

  // Sign
  ctx.fillStyle = '#37474F';
  const signW = 350;
  ctx.fillRect(sx + sw / 2 - signW / 2, roofY + 25, signW, 28);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(SZKOLA.signText, sx + sw / 2, roofY + 44);

  // Flag pole (near entrance)
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(sx + 80, gY);
  ctx.lineTo(sx + 80, roofY - 30);
  ctx.stroke();
  // Polish flag
  ctx.fillStyle = '#FFF';
  ctx.fillRect(sx + 82, roofY - 28, 30, 10);
  ctx.fillStyle = '#DC143C';
  ctx.fillRect(sx + 82, roofY - 18, 30, 10);
}

// ---- School Yard / Boisko (x:7800 to 8600) ----
function renderSchoolYard(ctx: CanvasRenderingContext2D, state: GameState): void {
  const cam = state.camera;
  if (cam.x > 8700 || cam.x + CANVAS_W / cam.zoom < 7700) return;

  const gY = 556;
  const sx = 7800;
  const ex = 8500;
  const midX = (sx + ex) / 2;

  // Running track (red surface)
  ctx.fillStyle = 'rgba(198, 40, 40, 0.3)';
  ctx.fillRect(sx, gY - 100, ex - sx, 104);

  // Track lanes
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const ly = gY - 90 + i * 20;
    ctx.beginPath();
    ctx.moveTo(sx + 20, ly);
    ctx.lineTo(ex - 20, ly);
    ctx.stroke();
  }

  // Football goals
  // Left goal
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 3;
  ctx.strokeRect(sx + 20, gY - 80, 40, 80);
  // Right goal
  ctx.strokeRect(ex - 60, gY - 80, 40, 80);

  // Flag mast
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(midX, gY);
  ctx.lineTo(midX, gY - 160);
  ctx.stroke();
  // School flag
  ctx.fillStyle = '#1565C0';
  ctx.fillRect(midX + 2, gY - 158, 30, 18);
  ctx.fillStyle = '#FFF';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SP3', midX + 17, gY - 145);

  // Small bleachers
  const bx = ex - 150;
  for (let r = 0; r < 3; r++) {
    ctx.fillStyle = r % 2 === 0 ? '#78909C' : '#90A4AE';
    ctx.fillRect(bx, gY - 30 - r * 18, 100, 16);
  }

  // Label
  ctx.fillStyle = '#666';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚽ BOISKO SZKOLNE', midX, gY - 110);
}

// ---- City Park (-5800 to -5000) ----
function renderCityPark(ctx: CanvasRenderingContext2D, state: GameState): void {
  const cam = state.camera;
  if (cam.x > -4900 || cam.x + CANVAS_W / cam.zoom < -5900) return;

  const gY = 556;
  const sx = -5800;
  const ex = -5000;
  const midX = (sx + ex) / 2;

  // Park path (alejka)
  ctx.fillStyle = '#D7CCC8';
  ctx.fillRect(sx + 50, gY - 6, ex - sx - 100, 8);
  // Path border stones
  ctx.fillStyle = '#A1887F';
  for (let px = sx + 50; px < ex - 50; px += 30) {
    ctx.fillRect(px, gY - 8, 12, 2);
    ctx.fillRect(px + 6, gY + 2, 12, 2);
  }

  // Trees (6 oaks + 2 birches)
  const treePositions = [sx + 80, sx + 250, sx + 420, sx + 560, sx + 680, ex - 80];
  for (let i = 0; i < treePositions.length; i++) {
    const tx = treePositions[i];
    const isBirch = i === 2 || i === 5;
    // Trunk
    ctx.fillStyle = isBirch ? '#F5F5DC' : '#5D4037';
    ctx.fillRect(tx - 4, gY - 90, 8, 90);
    if (isBirch) {
      // Birch spots
      ctx.fillStyle = '#333';
      for (let sy = gY - 80; sy < gY - 10; sy += 15) {
        ctx.fillRect(tx - 3, sy, 4, 3);
      }
    }
    // Canopy
    ctx.fillStyle = isBirch ? '#81C784' : '#2E7D32';
    ctx.beginPath();
    ctx.arc(tx, gY - 110, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isBirch ? '#A5D6A7' : '#388E3C';
    ctx.beginPath();
    ctx.arc(tx - 12, gY - 120, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fountain (animated)
  const fX = -5400;
  const time = Date.now() * 0.003;
  // Base pool
  ctx.fillStyle = '#78909C';
  ctx.fillRect(fX - 40, gY - 20, 80, 24);
  ctx.fillStyle = '#4FC3F7';
  ctx.fillRect(fX - 36, gY - 16, 72, 16);
  // Center pillar
  ctx.fillStyle = '#90A4AE';
  ctx.fillRect(fX - 6, gY - 60, 12, 44);
  // Water jets (animated)
  ctx.strokeStyle = '#4FC3F7';
  ctx.lineWidth = 2;
  for (let j = -1; j <= 1; j += 2) {
    ctx.beginPath();
    ctx.moveTo(fX, gY - 60);
    const jx = fX + j * 18 * Math.sin(time + j);
    const jy = gY - 80 - Math.abs(Math.sin(time * 1.5)) * 15;
    ctx.quadraticCurveTo(fX + j * 10, jy - 10, jx, gY - 20);
    ctx.stroke();
  }
  // Center jet
  ctx.beginPath();
  ctx.moveTo(fX, gY - 60);
  ctx.lineTo(fX, gY - 85 - Math.sin(time * 2) * 8);
  ctx.stroke();

  // Pond with ducks
  const pX = -5200;
  // Pond shape
  ctx.fillStyle = '#4FC3F7';
  ctx.beginPath();
  ctx.ellipse(pX, gY - 5, 60, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#81D4FA';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Ducks (2 animated)
  for (let d = 0; d < 2; d++) {
    const dx = pX - 20 + d * 40 + Math.sin(time + d * 2) * 15;
    const dy = gY - 8;
    // Body
    ctx.fillStyle = d === 0 ? '#8D6E63' : '#FFF';
    ctx.beginPath();
    ctx.ellipse(dx, dy, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.fillStyle = d === 0 ? '#2E7D32' : '#FFB74D';
    ctx.beginPath();
    ctx.arc(dx + 7, dy - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    // Beak
    ctx.fillStyle = '#FF8F00';
    ctx.fillRect(dx + 10, dy - 5, 4, 2);
  }

  // Benches (3)
  for (let b = 0; b < 3; b++) {
    const bx = sx + 150 + b * 230;
    // Legs
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(bx, gY - 22, 4, 22);
    ctx.fillRect(bx + 46, gY - 22, 4, 22);
    // Seat
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(bx - 2, gY - 26, 54, 6);
    // Back
    ctx.fillRect(bx - 2, gY - 44, 4, 22);
    ctx.fillRect(bx + 48, gY - 44, 4, 22);
    ctx.fillRect(bx - 2, gY - 44, 54, 4);
  }

  // Street lamps (4)
  for (let l = 0; l < 4; l++) {
    const lx = sx + 100 + l * 190;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx, gY);
    ctx.lineTo(lx, gY - 130);
    ctx.stroke();
    // Lamp head
    ctx.fillStyle = '#FDD835';
    ctx.beginPath();
    ctx.arc(lx, gY - 135, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,235,59,0.15)';
    ctx.beginPath();
    ctx.arc(lx, gY - 130, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  // Park sign
  ctx.fillStyle = '#2E7D32';
  ctx.fillRect(midX - 60, gY - 160, 120, 24);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌳 PARK MIEJSKI', midX, gY - 143);

  // Flower beds
  const flowerColors = ['#E91E63', '#FF9800', '#9C27B0', '#FFEB3B', '#F44336'];
  for (let fb = 0; fb < 2; fb++) {
    const fbx = sx + 300 + fb * 300;
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(fbx - 30, gY - 8, 60, 10);
    for (let f = 0; f < 8; f++) {
      ctx.fillStyle = flowerColors[(f + fb) % flowerColors.length];
      ctx.beginPath();
      ctx.arc(fbx - 24 + f * 7, gY - 14, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ---- City Library Exterior (-6400 to -5800) ----
function renderCityLibrary(ctx: CanvasRenderingContext2D, state: GameState): void {
  const cam = state.camera;
  if (cam.x > -5700 || cam.x + CANVAS_W / cam.zoom < -6500) return;

  const gY = 556;
  const bx = -6400;
  const bw = 600;
  const roofY = 90;

  // Building base — with entrance gap on left (y:420-556)
  ctx.fillStyle = '#F5F0E8';
  ctx.fillRect(bx, roofY + 30, bw, 420 - roofY - 30);     // upper portion
  ctx.fillRect(bx + 80, 420, bw - 80, gY - 420);           // lower right of entrance

  // Left entrance opening
  ctx.fillStyle = '#6D4C41';
  ctx.fillRect(bx - 4, 420, 8, gY - 420);
  ctx.fillRect(bx + 76, 420, 8, gY - 420);
  ctx.fillRect(bx - 4, 414, 88, 8);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(bx + 4, 422, 68, gY - 424);
  ctx.fillStyle = '#6D4C41';
  ctx.fillRect(bx + 4, 396, 72, 18);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WEJŚCIE →', bx + 40, 409);

  // Roof
  ctx.fillStyle = '#6D4C41';
  ctx.beginPath();
  ctx.moveTo(bx - 10, roofY + 30);
  ctx.lineTo(bx + bw / 2, roofY);
  ctx.lineTo(bx + bw + 10, roofY + 30);
  ctx.closePath();
  ctx.fill();

  // Columns (4 classical)
  for (let c = 0; c < 4; c++) {
    const cx = bx + 80 + c * 150;
    ctx.fillStyle = '#E0D6C8';
    ctx.fillRect(cx - 8, gY - 200, 16, 200);
    // Capital
    ctx.fillStyle = '#D7CCC8';
    ctx.fillRect(cx - 14, gY - 204, 28, 8);
    // Base
    ctx.fillRect(cx - 12, gY - 4, 24, 8);
  }

  // Windows (6 on floor 1, 4 on floor 2)
  ctx.fillStyle = '#81D4FA';
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 2;
  for (let w = 0; w < 6; w++) {
    const wx = bx + 40 + w * 90;
    ctx.fillRect(wx, gY - 140, 40, 50);
    ctx.strokeRect(wx, gY - 140, 40, 50);
    // Window cross
    ctx.beginPath();
    ctx.moveTo(wx + 20, gY - 140);
    ctx.lineTo(wx + 20, gY - 90);
    ctx.moveTo(wx, gY - 115);
    ctx.lineTo(wx + 40, gY - 115);
    ctx.stroke();
  }
  for (let w = 0; w < 4; w++) {
    const wx = bx + 80 + w * 130;
    ctx.fillRect(wx, gY - 320, 40, 50);
    ctx.strokeRect(wx, gY - 320, 40, 50);
  }

  // Main entrance (arched)
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(bx + bw / 2 - 30, gY - 100, 60, 100);
  ctx.fillStyle = '#8D6E63';
  ctx.beginPath();
  ctx.arc(bx + bw / 2, gY - 100, 30, Math.PI, 0);
  ctx.fill();
  // Door
  ctx.fillStyle = '#3E2723';
  ctx.fillRect(bx + bw / 2 - 20, gY - 80, 18, 80);
  ctx.fillRect(bx + bw / 2 + 2, gY - 80, 18, 80);
  // Door handles
  ctx.fillStyle = '#FFD54F';
  ctx.beginPath();
  ctx.arc(bx + bw / 2 - 5, gY - 40, 2, 0, Math.PI * 2);
  ctx.arc(bx + bw / 2 + 5, gY - 40, 2, 0, Math.PI * 2);
  ctx.fill();

  // Sign
  ctx.fillStyle = '#1565C0';
  ctx.fillRect(bx + bw / 2 - 80, roofY + 40, 160, 28);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📚 BIBLIOTEKA MIEJSKA', bx + bw / 2, roofY + 59);

  // Book decorations on walls
  const bookColors = ['#D32F2F', '#1976D2', '#388E3C', '#F57C00', '#7B1FA2'];
  for (let br = 0; br < 3; br++) {
    const brx = bx + 20 + br * 220;
    for (let b = 0; b < 5; b++) {
      ctx.fillStyle = bookColors[b];
      ctx.fillRect(brx + b * 10, gY - 60, 8, 20 + (b % 3) * 4);
    }
  }

  // Steps
  for (let s = 0; s < 3; s++) {
    ctx.fillStyle = s % 2 === 0 ? '#BDBDBD' : '#E0E0E0';
    ctx.fillRect(bx + bw / 2 - 50 - s * 10, gY - s * 5, 100 + s * 20, 6);
  }
}

// ---- City Playground (-7200 to -6400) ----
function renderCityPlayground(ctx: CanvasRenderingContext2D, state: GameState): void {
  const cam = state.camera;
  if (cam.x > -6300 || cam.x + CANVAS_W / cam.zoom < -7300) return;

  const gY = 556;
  const sx = -7200;
  const ex = -6400;
  const midX = (sx + ex) / 2;

  // Sand surface
  ctx.fillStyle = '#F5DEB3';
  ctx.fillRect(sx, gY - 4, ex - sx, 8);

  // Rubber tiles around equipment
  ctx.fillStyle = '#E57373';
  ctx.fillRect(sx + 50, gY - 4, 200, 6);
  ctx.fillStyle = '#64B5F6';
  ctx.fillRect(sx + 350, gY - 4, 200, 6);

  // Carousel (animated rotation)
  const cX = -7000;
  const time = Date.now() * 0.002;
  // Center pole
  ctx.fillStyle = '#F44336';
  ctx.fillRect(cX - 4, gY - 100, 8, 100);
  // Top connector
  ctx.fillStyle = '#D32F2F';
  ctx.beginPath();
  ctx.arc(cX, gY - 100, 10, 0, Math.PI * 2);
  ctx.fill();
  // Spinning arms (4)
  ctx.strokeStyle = '#F44336';
  ctx.lineWidth = 3;
  for (let a = 0; a < 4; a++) {
    const angle = time + a * Math.PI / 2;
    const ax = cX + Math.cos(angle) * 50;
    const ay = gY - 95 + Math.sin(angle) * 8;
    ctx.beginPath();
    ctx.moveTo(cX, gY - 98);
    ctx.lineTo(ax, ay);
    ctx.stroke();
    // Seat
    ctx.fillStyle = ['#FF9800', '#4CAF50', '#2196F3', '#9C27B0'][a];
    ctx.beginPath();
    ctx.arc(ax, ay + 4, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Climbing frame (3 levels)
  const clX = sx + 300;
  ctx.strokeStyle = '#FF5722';
  ctx.lineWidth = 4;
  // Vertical poles
  for (let p = 0; p < 4; p++) {
    const px = clX + p * 40;
    ctx.beginPath();
    ctx.moveTo(px, gY);
    ctx.lineTo(px, gY - 180);
    ctx.stroke();
  }
  // Horizontal bars at each level
  const levels = [gY - 60, gY - 120, gY - 180];
  for (const ly of levels) {
    ctx.beginPath();
    ctx.moveTo(clX, ly);
    ctx.lineTo(clX + 120, ly);
    ctx.stroke();
  }
  // Monkey bars on top
  ctx.lineWidth = 2;
  for (let mb = 0; mb < 7; mb++) {
    ctx.beginPath();
    ctx.moveTo(clX + 10 + mb * 16, gY - 180);
    ctx.lineTo(clX + 10 + mb * 16, gY - 170);
    ctx.stroke();
  }

  // Big sandbox
  const sbX = sx + 500;
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(sbX, gY - 10, 120, 14);
  ctx.fillStyle = '#FFECB3';
  ctx.fillRect(sbX + 4, gY - 8, 112, 8);
  // Sand shapes
  ctx.fillStyle = '#FFD54F';
  ctx.beginPath();
  ctx.arc(sbX + 30, gY - 8, 8, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sbX + 70, gY - 8, 6, Math.PI, 0);
  ctx.fill();
  // Bucket
  ctx.fillStyle = '#F44336';
  ctx.fillRect(sbX + 90, gY - 18, 12, 12);
  ctx.fillStyle = '#D32F2F';
  ctx.fillRect(sbX + 88, gY - 20, 16, 3);

  // Trampoline
  const tX = -6600;
  ctx.fillStyle = '#333';
  ctx.fillRect(tX - 35, gY - 8, 70, 10);
  ctx.fillStyle = '#1565C0';
  ctx.fillRect(tX - 30, gY - 12, 60, 6);
  // Springs
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  for (let sp = 0; sp < 5; sp++) {
    ctx.beginPath();
    ctx.moveTo(tX - 25 + sp * 13, gY - 8);
    ctx.lineTo(tX - 25 + sp * 13, gY - 2);
    ctx.stroke();
  }
  // Bounce indicator (animated)
  const bounceH = Math.abs(Math.sin(time * 2)) * 8;
  ctx.strokeStyle = '#42A5F5';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(tX - 20, gY - 14 - bounceH);
  ctx.lineTo(tX + 20, gY - 14 - bounceH);
  ctx.stroke();
  ctx.setLineDash([]);

  // Swings (2)
  for (let sw = 0; sw < 2; sw++) {
    const swX = sx + 150 + sw * 80;
    const swAngle = Math.sin(time + sw) * 0.3;
    // Frame
    ctx.strokeStyle = '#78909C';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(swX - 20, gY);
    ctx.lineTo(swX, gY - 120);
    ctx.lineTo(swX + 20, gY);
    ctx.stroke();
    // Rope + seat
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 2;
    const seatX = swX + Math.sin(swAngle) * 25;
    const seatY = gY - 40 + Math.cos(swAngle) * 5;
    ctx.beginPath();
    ctx.moveTo(swX, gY - 118);
    ctx.lineTo(seatX, seatY);
    ctx.stroke();
    // Seat
    ctx.fillStyle = '#FF7043';
    ctx.fillRect(seatX - 10, seatY, 20, 5);
  }

  // Slide
  const slideX = ex - 120;
  ctx.fillStyle = '#78909C';
  ctx.fillRect(slideX, gY - 100, 6, 100);
  ctx.fillRect(slideX + 80, gY - 40, 6, 40);
  // Slide surface
  ctx.strokeStyle = '#FFD600';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(slideX + 3, gY - 96);
  ctx.quadraticCurveTo(slideX + 50, gY - 70, slideX + 83, gY - 8);
  ctx.stroke();
  // Ladder
  ctx.strokeStyle = '#78909C';
  ctx.lineWidth = 2;
  for (let l = 0; l < 5; l++) {
    ctx.beginPath();
    ctx.moveTo(slideX - 8, gY - 20 - l * 18);
    ctx.lineTo(slideX + 6, gY - 20 - l * 18);
    ctx.stroke();
  }

  // Fence around playground
  ctx.strokeStyle = '#8D6E63';
  ctx.lineWidth = 2;
  for (let f = sx; f < ex; f += 30) {
    ctx.beginPath();
    ctx.moveTo(f, gY);
    ctx.lineTo(f, gY - 30);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(sx, gY - 25);
  ctx.lineTo(ex, gY - 25);
  ctx.stroke();

  // Sign
  ctx.fillStyle = '#FF6F00';
  ctx.fillRect(midX - 55, gY - 170, 110, 22);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎠 PLAC ZABAW', midX, gY - 154);
}

// ---- Park Behind School (8600 to 9200) ----
function renderParkBehindSchool(ctx: CanvasRenderingContext2D, state: GameState): void {
  const cam = state.camera;
  if (cam.x > 9300 || cam.x + CANVAS_W / cam.zoom < 8500) return;

  const gY = 556;
  const sx = 8600;
  const ex = 9200;

  // Grass patches
  ctx.fillStyle = '#66BB6A';
  ctx.fillRect(sx, gY - 4, ex - sx, 6);
  ctx.fillStyle = '#43A047';
  for (let g = sx; g < ex; g += 40) {
    ctx.fillRect(g, gY - 6, 20, 4);
  }

  // Trees (5 deciduous)
  const treePosns = [sx + 60, sx + 180, sx + 320, sx + 440, sx + 540];
  for (let i = 0; i < treePosns.length; i++) {
    const tx = treePosns[i];
    const h = 70 + (i % 3) * 20;
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(tx - 3, gY - h, 6, h);
    // Canopy
    ctx.fillStyle = i % 2 === 0 ? '#2E7D32' : '#388E3C';
    ctx.beginPath();
    ctx.arc(tx, gY - h - 20, 28 + (i % 2) * 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Small pond with bridge
  const pX = sx + 300;
  ctx.fillStyle = '#4FC3F7';
  ctx.beginPath();
  ctx.ellipse(pX, gY - 3, 50, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Bridge
  ctx.strokeStyle = '#8D6E63';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(pX, gY - 3, 35, Math.PI, 0);
  ctx.stroke();
  // Bridge planks
  ctx.fillStyle = '#A1887F';
  for (let pl = -30; pl < 30; pl += 8) {
    ctx.fillRect(pX + pl, gY - 3 - Math.sqrt(35 * 35 - pl * pl) + 33, 6, 4);
  }

  // Birds (animated)
  const time = Date.now() * 0.003;
  for (let b = 0; b < 3; b++) {
    const bx = sx + 100 + b * 180 + Math.sin(time + b) * 20;
    const by = gY - 200 - b * 30 + Math.cos(time * 0.7 + b) * 15;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    const wing = Math.sin(time * 3 + b * 2) * 8;
    ctx.beginPath();
    ctx.moveTo(bx - 8, by + wing);
    ctx.quadraticCurveTo(bx - 3, by - 3, bx, by);
    ctx.quadraticCurveTo(bx + 3, by - 3, bx + 8, by + wing);
    ctx.stroke();
  }

  // Benches (2)
  for (let bn = 0; bn < 2; bn++) {
    const bnx = sx + 120 + bn * 340;
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(bnx, gY - 22, 4, 22);
    ctx.fillRect(bnx + 46, gY - 22, 4, 22);
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(bnx - 2, gY - 26, 54, 6);
  }

  // Label
  ctx.fillStyle = '#2E7D32';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌿 PARK ZA SZKOŁĄ', (sx + ex) / 2, gY - 140);
}

// ---- Bus Stop (9200 to 9500) ----
function renderBusStop(ctx: CanvasRenderingContext2D, state: GameState): void {
  const cam = state.camera;
  if (cam.x > 9600 || cam.x + CANVAS_W / cam.zoom < 9100) return;

  const gY = 556;
  const bx = 9200;

  // Sidewalk
  ctx.fillStyle = '#BDBDBD';
  ctx.fillRect(bx, gY - 4, 300, 8);

  // Shelter structure
  const shX = bx + 80;
  // Poles
  ctx.fillStyle = '#78909C';
  ctx.fillRect(shX, gY - 140, 6, 140);
  ctx.fillRect(shX + 140, gY - 140, 6, 140);
  // Roof
  ctx.fillStyle = '#546E7A';
  ctx.fillRect(shX - 10, gY - 146, 166, 8);
  // Glass panels
  ctx.fillStyle = 'rgba(144, 202, 249, 0.3)';
  ctx.fillRect(shX + 6, gY - 138, 60, 100);
  ctx.fillRect(shX + 80, gY - 138, 60, 100);
  // Back panel
  ctx.fillStyle = 'rgba(144, 202, 249, 0.2)';
  ctx.fillRect(shX, gY - 138, 146, 100);

  // Bench
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(shX + 20, gY - 30, 106, 6);
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(shX + 30, gY - 28, 4, 28);
  ctx.fillRect(shX + 112, gY - 28, 4, 28);

  // Schedule board
  ctx.fillStyle = '#FFF';
  ctx.fillRect(shX + 150, gY - 130, 40, 60);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.strokeRect(shX + 150, gY - 130, 40, 60);
  // Lines (schedule)
  ctx.fillStyle = '#333';
  ctx.font = '6px sans-serif';
  ctx.textAlign = 'left';
  for (let l = 0; l < 6; l++) {
    ctx.fillRect(shX + 154, gY - 122 + l * 9, 32, 1);
  }

  // Bus stop sign
  ctx.fillStyle = '#1565C0';
  ctx.fillRect(bx + 40, gY - 120, 6, 120);
  ctx.beginPath();
  ctx.arc(bx + 43, gY - 130, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('A', bx + 43, gY - 126);

  // Animated bus (comes and goes)
  const busTime = Date.now() * 0.0004;
  const busCycle = (busTime % 10);
  if (busCycle > 3 && busCycle < 7) {
    const busX = bx + 100;
    // Bus body
    ctx.fillStyle = '#FDD835';
    ctx.fillRect(busX, gY - 70, 120, 50);
    // Windows
    ctx.fillStyle = '#81D4FA';
    for (let w = 0; w < 4; w++) {
      ctx.fillRect(busX + 10 + w * 28, gY - 65, 20, 25);
    }
    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(busX + 25, gY - 18, 10, 0, Math.PI * 2);
    ctx.arc(busX + 95, gY - 18, 10, 0, Math.PI * 2);
    ctx.fill();
    // Route number
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('15', busX + 60, gY - 50);
    // Door
    ctx.fillStyle = '#F9A825';
    ctx.fillRect(busX + 45, gY - 45, 20, 26);
  }

  // Label
  ctx.fillStyle = '#1565C0';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🚌 PRZYSTANEK', bx + 150, gY - 155);
}

// ---- Osiedle / Residential Area (9500 to 11000) ----
function renderOsiedle(ctx: CanvasRenderingContext2D, state: GameState): void {
  const cam = state.camera;
  if (cam.x > 11100 || cam.x + CANVAS_W / cam.zoom < 9400) return;

  const gY = 556;
  const osx = 9500;

  // Sidewalk
  ctx.fillStyle = '#E0E0E0';
  ctx.fillRect(osx, gY - 4, 1500, 8);

  // 3 Apartment blocks
  const blockColors = ['#ECEFF1', '#E8EAF6', '#FFF8E1'];
  const blockPositions = [osx, osx + 500, osx + 1000];
  const blockW = 450;

  for (let bl = 0; bl < 3; bl++) {
    const bx = blockPositions[bl];
    const color = blockColors[bl];

    // Building body
    ctx.fillStyle = color;
    ctx.fillRect(bx + 20, gY - 400, blockW - 40, 400);

    // Building outline
    ctx.strokeStyle = '#90A4AE';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx + 20, gY - 400, blockW - 40, 400);

    // Floors (3) — windows grid
    for (let floor = 0; floor < 3; floor++) {
      const fy = gY - 110 - floor * 130;
      for (let w = 0; w < 5; w++) {
        const wx = bx + 50 + w * 75;
        // Window
        const isLit = (bl + floor + w) % 3 !== 0;
        ctx.fillStyle = isLit ? '#FFF9C4' : '#81D4FA';
        ctx.fillRect(wx, fy, 40, 50);
        ctx.strokeStyle = '#78909C';
        ctx.lineWidth = 1;
        ctx.strokeRect(wx, fy, 40, 50);
        // Window cross
        ctx.beginPath();
        ctx.moveTo(wx + 20, fy);
        ctx.lineTo(wx + 20, fy + 50);
        ctx.moveTo(wx, fy + 25);
        ctx.lineTo(wx + 40, fy + 25);
        ctx.stroke();
        // Balcony railing on some windows
        if (floor > 0 && w % 2 === 0) {
          ctx.strokeStyle = '#90A4AE';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(wx - 5, fy + 50, 50, 15);
        }
      }
    }

    // Entrance
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(bx + blockW / 2 - 10, gY - 80, 40, 80);
    // Entrance canopy
    ctx.fillStyle = '#78909C';
    ctx.fillRect(bx + blockW / 2 - 20, gY - 86, 60, 8);
    // Door
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(bx + blockW / 2 - 4, gY - 70, 14, 70);
    ctx.fillRect(bx + blockW / 2 + 12, gY - 70, 14, 70);

    // Block number
    ctx.fillStyle = '#1565C0';
    ctx.fillRect(bx + blockW / 2 - 10, gY - 100, 40, 16);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Blok ${bl + 1}`, bx + blockW / 2 + 10, gY - 88);

    // Roof top
    ctx.fillStyle = '#78909C';
    ctx.fillRect(bx + 18, gY - 405, blockW - 36, 8);
  }

  // Osiedle playground between block 1 and 2
  const pgX = osx + 200;
  // Small swing
  ctx.strokeStyle = '#FF5722';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pgX, gY);
  ctx.lineTo(pgX + 15, gY - 60);
  ctx.lineTo(pgX + 30, gY);
  ctx.stroke();
  // Sandbox
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(pgX + 50, gY - 6, 50, 8);
  ctx.fillStyle = '#FFECB3';
  ctx.fillRect(pgX + 52, gY - 4, 46, 4);

  // Trees between blocks
  for (let t = 0; t < 4; t++) {
    const tx = osx + 120 + t * 380;
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(tx - 3, gY - 50, 6, 50);
    ctx.fillStyle = '#43A047';
    ctx.beginPath();
    ctx.arc(tx, gY - 65, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  // Street lamps (3)
  for (let l = 0; l < 3; l++) {
    const lx = osx + 250 + l * 500;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx, gY);
    ctx.lineTo(lx, gY - 120);
    ctx.stroke();
    ctx.fillStyle = '#FDD835';
    ctx.beginPath();
    ctx.arc(lx, gY - 125, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Parking spots
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 1;
  for (let p = 0; p < 6; p++) {
    const px = osx + 50 + p * 80;
    ctx.strokeRect(px, gY + 2, 60, 25);
  }
  // Parked cars (3)
  const carColors = ['#D32F2F', '#1976D2', '#616161'];
  for (let c = 0; c < 3; c++) {
    const cx = osx + 60 + c * 160;
    ctx.fillStyle = carColors[c];
    ctx.fillRect(cx, gY + 4, 50, 18);
    ctx.fillStyle = '#81D4FA';
    ctx.fillRect(cx + 5, gY + 6, 15, 10);
    ctx.fillRect(cx + 30, gY + 6, 15, 10);
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(cx + 10, gY + 22, 4, 0, Math.PI * 2);
    ctx.arc(cx + 40, gY + 22, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Label
  ctx.fillStyle = '#455A64';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏢 OSIEDLE SŁONECZNE', osx + 750, gY - 420);
}

// ---- Bike Race HUD (arcade overlay) ----
function renderBikeRaceHUD(ctx: CanvasRenderingContext2D, state: GameState): void {
  const race = state.bikeRace;
  if (!race) return;

  // Arcade speed lines overlay
  if (race.arcadeOverlay && !race.finished && race.countdown <= 0) {
    ctx.save();
    const speed = state.activeVehicle ? Math.abs(state.activeVehicle.vx) : 0;
    const intensity = Math.min(speed / 8, 1);
    if (intensity > 0.2) {
      ctx.globalAlpha = intensity * 0.15;
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      const time = Date.now() * 0.01;
      for (let i = 0; i < 12; i++) {
        const y = (time * 3 + i * 80) % CANVAS_H;
        const dir = state.player.dir;
        ctx.beginPath();
        ctx.moveTo(dir > 0 ? 0 : CANVAS_W, y);
        ctx.lineTo(dir > 0 ? 80 + intensity * 120 : CANVAS_W - 80 - intensity * 120, y + (Math.random() - 0.5) * 20);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Countdown
  if (race.countdown > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    const num = Math.ceil(race.countdown);
    const scale = 1 + (race.countdown % 1) * 0.5;
    ctx.font = `bold ${80 * scale}px sans-serif`;
    ctx.fillStyle = num <= 1 ? '#4CAF50' : '#FFD600';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(num <= 0 ? 'GO!' : String(num), CANVAS_W / 2, CANVAS_H / 2);
    ctx.restore();
    return;
  }

  // Race info panel (top center)
  const panelW = 300;
  const panelX = (CANVAS_W - panelW) / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(panelX, 8, panelW, race.type === 'sprint' ? 60 : 50);
  ctx.strokeStyle = '#FFD600';
  ctx.lineWidth = 2;
  ctx.strokeRect(panelX, 8, panelW, race.type === 'sprint' ? 60 : 50);

  // Race name
  ctx.fillStyle = '#FFD600';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`🏁 ${race.name}`, CANVAS_W / 2, 26);

  // Timer
  const timerColor = race.timeLimit > 0 && race.timer > race.timeLimit * 0.7 ? '#FF5722' : '#FFF';
  ctx.fillStyle = timerColor;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`⏱ ${race.timer.toFixed(1)}s`, panelX + 10, 50);

  if (race.timeLimit > 0) {
    ctx.fillStyle = '#BDBDBD';
    ctx.font = '11px sans-serif';
    ctx.fillText(`/ ${race.timeLimit}s`, panelX + 100, 50);
  }

  // Checkpoints
  if (race.checkpoints.length > 0) {
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`CP: ${race.checkpointsPassed}/${race.checkpoints.length}`, panelX + panelW - 10, 50);
  }

  // Sprint: position bar (player vs opponent)
  if (race.type === 'sprint' && race.opponentId) {
    const barY = 55;
    const barW = panelW - 20;
    const totalDist = Math.abs(race.endX - race.startX);
    const playerProgress = Math.abs(state.player.x - race.startX) / totalDist;
    const opponentProgress = Math.abs(race.opponentX - race.startX) / totalDist;

    // Track bar
    ctx.fillStyle = '#444';
    ctx.fillRect(panelX + 10, barY, barW, 8);

    // Player dot (green)
    const ppx = panelX + 10 + Math.min(playerProgress, 1) * barW;
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(ppx, barY + 4, 5, 0, Math.PI * 2);
    ctx.fill();

    // Opponent dot (red)
    const opx = panelX + 10 + Math.min(opponentProgress, 1) * barW;
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(opx, barY + 4, 5, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText('🧑', ppx, barY - 2);
    ctx.fillStyle = '#F44336';
    ctx.fillText('👤', opx, barY - 2);
  }

  // Trick challenge: score bar
  if (race.type === 'trickChallenge') {
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Triki: ${race.tricksCurrent}/${race.trickTarget}`, panelX + panelW - 10, 50);
  }

  // Finished overlay
  if (race.finished) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, CANVAS_H / 2 - 50, CANVAS_W, 100);
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = race.won ? '#FFD600' : '#F44336';
    ctx.fillText(race.won ? '🏆 WYGRANA!' : '💨 PRZEGRANA', CANVAS_W / 2, CANVAS_H / 2 - 10);
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#FFF';
    ctx.fillText(`Czas: ${race.timer.toFixed(1)}s`, CANVAS_W / 2, CANVAS_H / 2 + 25);
    ctx.restore();
  }
}

// ---- 9. Screen transition overlay ----
function renderScreenTransition(ctx: CanvasRenderingContext2D, state: GameState): void {
  const t = state.screenTransition;
  if (!t.active) return;

  const p = t.progress;

  if (t.type === 'fade') {
    // Fade out then in
    const alpha = p < 0.5 ? p * 2 : (1 - p) * 2;
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  } else if (t.type === 'zoom') {
    // Zoom blur effect
    const scale = 1 + p * 0.3;
    const alpha = p < 0.5 ? p * 1.5 : (1 - p) * 1.5;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
    ctx.translate(CANVAS_W / 2, CANVAS_H / 2);
    ctx.scale(scale, scale);
    ctx.translate(-CANVAS_W / 2, -CANVAS_H / 2);
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.restore();
  }
}

// ---- BALANCE METER (wheelie/manual) ----
function renderBalanceMeter(ctx: CanvasRenderingContext2D, state: GameState): void {
  const v = state.activeVehicle;
  if (!v || !v.active) return;
  if (v.trickState !== 'wheelie' && v.trickState !== 'manual') return;

  const cx = CANVAS_W / 2;
  const y = CANVAS_H - 50;
  const barW = 200;
  const barH = 12;

  // Background bar
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.beginPath(); ctx.roundRect(cx - barW / 2 - 2, y - 2, barW + 4, barH + 4, 4);
  ctx.fill();

  // Perfect zone (green center)
  const perfectW = (BALANCE.perfectZone / 100) * barW;
  ctx.fillStyle = 'rgba(76, 175, 80, 0.4)';
  ctx.fillRect(cx - perfectW / 2, y, perfectW, barH);

  // Danger zones (red edges)
  const dangerW = ((100 - BALANCE.failThreshold) / 100) * barW;
  ctx.fillStyle = 'rgba(244, 67, 54, 0.4)';
  ctx.fillRect(cx - barW / 2, y, dangerW, barH);
  ctx.fillRect(cx + barW / 2 - dangerW, y, dangerW, barH);

  // Indicator needle
  const needleX = cx + (v.balanceMeter / 100) * (barW / 2);
  ctx.fillStyle = Math.abs(v.balanceMeter) < BALANCE.perfectZone ? '#4CAF50' :
                  Math.abs(v.balanceMeter) > BALANCE.failThreshold * 0.8 ? '#F44336' : '#FFC107';
  ctx.fillRect(needleX - 2, y - 3, 4, barH + 6);

  // Label
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px system-ui';
  ctx.textAlign = 'center';
  const td = TRICK_DEFS[v.trickState];
  ctx.fillText(`${td?.emoji || '⚖️'} ${td?.name || v.trickState} — ← → balans`, cx, y - 8);

  // Speed boost indicator
  if (v.speedBoost > 0.05) {
    ctx.fillStyle = `rgba(255, 152, 0, ${v.speedBoost})`;
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(`🚀 BOOST ${Math.round(v.speedBoost * 40)}%`, cx, y - 22);
  }
}

// ---- KINDERGARTEN MINIGAME OVERLAY ----
function renderMinigameOverlay(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!state.minigame || state.phase !== 'minigame') return;
  const mg = state.minigame;
  const gameData = KINDERGARTEN_GAMES[mg.type as keyof typeof KINDERGARTEN_GAMES];

  // Full screen overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const cx = CANVAS_W / 2;
  const panelW = 500;
  const panelH = 380;
  const px = cx - panelW / 2;
  const py = 60;

  // Panel background
  ctx.fillStyle = '#FFF8E1';
  ctx.beginPath(); ctx.roundRect(px, py, panelW, panelH, 16);
  ctx.fill();
  ctx.strokeStyle = '#FFB300';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(px, py, panelW, panelH, 16);
  ctx.stroke();

  // Header
  ctx.fillStyle = '#FF6F00';
  ctx.beginPath(); ctx.roundRect(px, py, panelW, 50, 16);
  ctx.fill();
  // Clip bottom corners of header
  ctx.fillStyle = '#FF6F00';
  ctx.fillRect(px, py + 34, panelW, 16);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(`${gameData?.emoji || '🎮'} ${mg.name} — Runda ${mg.round}/${mg.maxRounds}`, cx, py + 33);

  // Streak
  if (mg.streak > 0) {
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 14px system-ui';
    ctx.fillText(`🔥 Seria: ${mg.streak}`, cx, py + 65);
  }

  // Question
  ctx.fillStyle = '#333';
  ctx.font = 'bold 20px system-ui';
  ctx.textAlign = 'center';
  const qY = py + 100;
  ctx.fillText(mg.question, cx, qY);

  // Options
  const optY = qY + 40;
  const optH = 45;
  const optW = panelW - 40;
  for (let i = 0; i < mg.options.length; i++) {
    const oy = optY + i * (optH + 8);
    let bgColor = '#ECEFF1';
    if (mg.answered) {
      if (i === mg.correctIndex) bgColor = '#C8E6C9'; // green for correct
      else if (i === mg.selectedIndex) bgColor = '#FFCDD2'; // red for wrong selection
    }
    ctx.fillStyle = bgColor;
    ctx.beginPath(); ctx.roundRect(px + 20, oy, optW, optH, 10);
    ctx.fill();
    ctx.strokeStyle = i === mg.selectedIndex ? '#333' : '#BDBDBD';
    ctx.lineWidth = i === mg.selectedIndex ? 2 : 1;
    ctx.beginPath(); ctx.roundRect(px + 20, oy, optW, optH, 10);
    ctx.stroke();

    // Number key indicator
    ctx.fillStyle = '#FF6F00';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`${i + 1}`, px + 35, oy + 30);

    // Option text
    ctx.fillStyle = '#333';
    ctx.font = '16px system-ui';
    ctx.fillText(mg.options[i].label, px + 60, oy + 30);
  }

  // Result feedback
  if (mg.answered) {
    ctx.fillStyle = mg.correct ? '#4CAF50' : '#F44336';
    ctx.font = 'bold 18px system-ui';
    ctx.textAlign = 'center';
    const feedbackY = optY + mg.options.length * (optH + 8) + 10;
    ctx.fillText(mg.correct ? '✅ Brawo! Dobrze!' : '❌ Nie tym razem...', cx, feedbackY);
    ctx.fillStyle = '#666';
    ctx.font = '13px system-ui';
    ctx.fillText(mg.round < mg.maxRounds ? 'Naciśnij SPACJĘ → następne pytanie' : 'Naciśnij SPACJĘ → zakończ', cx, feedbackY + 22);
  } else {
    ctx.fillStyle = '#999';
    ctx.font = '13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Wybierz odpowiedź: 1, 2, 3 lub 4  |  ESC = wyjdź', cx, py + panelH - 15);
  }

  // Skill progress bar (bottom)
  if (gameData) {
    const skill = gameData.skill;
    const progress = state.kindergartenProgress.skills[skill as keyof typeof state.kindergartenProgress.skills] || 0;
    const barW2 = panelW - 40;
    const barY = py + panelH + 10;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.roundRect(px + 20, barY, barW2, 20, 6);
    ctx.fill();
    ctx.fillStyle = '#FF6F00';
    ctx.beginPath(); ctx.roundRect(px + 20, barY, barW2 * (progress / 100), 20, 6);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${gameData.emoji} ${gameData.name}: ${progress}/100`, cx, barY + 14);
  }
}
